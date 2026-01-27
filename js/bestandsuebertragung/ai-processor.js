/**
 * AI Processor Modul - API Integration fuer Bestandsuebertragung
 * Verarbeitet E-Mails und Anhänge mittels KI
 */

// API Configuration
let apiConfig = {
    apiKey: null,
    model: 'claude-sonnet-4-20250514',
    maxTokens: 4096
};

/**
 * API Key setzen
 */
export function setApiKey(key) {
    apiConfig.apiKey = key;
    localStorage.setItem('claude_api_key', key);
}

/**
 * API Key laden
 */
export function loadApiKey() {
    apiConfig.apiKey = localStorage.getItem('claude_api_key');
    return apiConfig.apiKey;
}

/**
 * Prüfen ob API Key gesetzt ist
 */
export function hasApiKey() {
    return !!apiConfig.apiKey;
}

/**
 * MSG Datei parsen (Header und Body extrahieren)
 */
export async function parseMsgFile(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = async (e) => {
            try {
                const arrayBuffer = e.target.result;
                const uint8Array = new Uint8Array(arrayBuffer);

                // MSG ist ein OLE Compound File - vereinfachte Extraktion
                const result = extractMsgContent(uint8Array);
                resolve(result);
            } catch (error) {
                reject(new Error('Fehler beim Parsen der MSG-Datei: ' + error.message));
            }
        };

        reader.onerror = () => reject(new Error('Fehler beim Lesen der Datei'));
        reader.readAsArrayBuffer(file);
    });
}

/**
 * MSG Content extrahieren (vereinfachte Implementierung)
 */
function extractMsgContent(data) {
    // Suche nach Text-Patterns im MSG Binary
    const decoder = new TextDecoder('utf-8', { fatal: false });
    const text = decoder.decode(data);

    // Versuche Betreff zu finden
    let subject = '';
    const subjectMatch = text.match(/Subject[:\s]*([^\x00-\x1F]{5,200})/i);
    if (subjectMatch) {
        subject = subjectMatch[1].trim();
    }

    // Versuche Absender zu finden
    let sender = '';
    const fromMatch = text.match(/From[:\s]*([^\x00-\x1F]{5,100}@[^\x00-\x1F]{3,50})/i);
    if (fromMatch) {
        sender = fromMatch[1].trim();
    }

    // Versuche Body zu finden (längster zusammenhängender Text)
    let body = '';
    const textBlocks = text.split(/[\x00-\x08\x0B\x0C\x0E-\x1F]+/).filter(b => b.length > 50);
    if (textBlocks.length > 0) {
        // Suche nach dem längsten Block, der wie E-Mail-Text aussieht
        body = textBlocks
            .filter(b => /[a-zA-ZäöüÄÖÜß]{3,}/i.test(b))
            .sort((a, b) => b.length - a.length)[0] || '';
    }

    // Versuche Datum zu finden
    let date = '';
    const dateMatch = text.match(/Date[:\s]*([A-Za-z]{3},?\s+\d{1,2}\s+[A-Za-z]{3}\s+\d{4}\s+[\d:]+\s*[+-]?\d{0,4})/i);
    if (dateMatch) {
        date = dateMatch[1].trim();
    }

    // Suche nach Anhängen (Dateinamen)
    const attachments = [];
    const attachmentMatches = text.matchAll(/([^\x00-\x1F]{3,50}\.(pdf|doc|docx|xls|xlsx|jpg|png))/gi);
    for (const match of attachmentMatches) {
        if (!attachments.includes(match[1])) {
            attachments.push(match[1]);
        }
    }

    return {
        subject: cleanText(subject),
        sender: cleanText(sender),
        date: date,
        body: cleanText(body),
        attachmentNames: attachments,
        rawSize: data.length
    };
}

/**
 * Text bereinigen
 */
function cleanText(text) {
    if (!text) return '';
    return text
        .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F]/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
}

/**
 * EML Datei parsen (RFC 2822 / MIME)
 */
export async function parseEmlFile(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = (e) => {
            try {
                const raw = e.target.result;
                resolve(parseEmlContent(raw));
            } catch (error) {
                reject(new Error('Fehler beim Parsen der EML-Datei: ' + error.message));
            }
        };

        reader.onerror = () => reject(new Error('Fehler beim Lesen der Datei'));
        reader.readAsText(file, 'UTF-8');
    });
}

/**
 * EML Rohtext parsen
 */
function parseEmlContent(raw) {
    // Header / Body trennen (erste Leerzeile)
    const splitIdx = raw.search(/\r?\n\r?\n/);
    const headerBlock = splitIdx >= 0 ? raw.substring(0, splitIdx) : raw;
    const bodyBlock = splitIdx >= 0 ? raw.substring(splitIdx).replace(/^[\r\n]+/, '') : '';

    // Header parsen (unterstützt Continuation Lines)
    const headers = {};
    const headerLines = headerBlock.replace(/\r\n/g, '\n').split('\n');
    let currentKey = '';
    for (const line of headerLines) {
        if (/^\s/.test(line) && currentKey) {
            // Continuation
            headers[currentKey] += ' ' + line.trim();
        } else {
            const m = line.match(/^([A-Za-z-]+):\s*(.*)/);
            if (m) {
                currentKey = m[1].toLowerCase();
                headers[currentKey] = m[2].trim();
            }
        }
    }

    const subject = decodeRfc2047(headers['subject'] || '');
    const sender = decodeRfc2047(headers['from'] || '');
    const dateRaw = headers['date'] || '';

    // Content-Type prüfen
    const contentType = headers['content-type'] || 'text/plain';
    const boundaryMatch = contentType.match(/boundary="?([^";\s]+)"?/i);

    let body = '';
    const attachmentTexts = [];
    const attachmentNames = [];

    if (boundaryMatch) {
        // Multipart
        const boundary = boundaryMatch[1];
        const parts = splitMimeParts(bodyBlock, boundary);

        for (const part of parts) {
            const partResult = parseMimePart(part);
            if (partResult.isAttachment) {
                attachmentNames.push(partResult.filename);
                if (partResult.textContent) {
                    attachmentTexts.push({
                        type: partResult.contentType.includes('word') || partResult.filename.match(/\.docx?$/i) ? 'word' :
                              partResult.contentType.includes('excel') || partResult.contentType.includes('spreadsheet') || partResult.filename.match(/\.xlsx?$/i) ? 'excel' : 'other',
                        content: partResult.textContent,
                        filename: partResult.filename,
                        rawBase64: partResult.rawBase64 || null,
                        mimeType: partResult.contentType
                    });
                }
            } else if (partResult.isText && !body) {
                body = partResult.textContent;
            } else if (partResult.isHtml && !body) {
                // HTML als Fallback
                body = partResult.textContent.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
            } else if (partResult.isMultipart) {
                // Verschachtelter Multipart
                const innerParts = splitMimeParts(partResult.rawBody, partResult.boundary);
                for (const inner of innerParts) {
                    const innerResult = parseMimePart(inner);
                    if (innerResult.isText && !body) {
                        body = innerResult.textContent;
                    } else if (innerResult.isHtml && !body) {
                        body = innerResult.textContent.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
                    } else if (innerResult.isAttachment) {
                        attachmentNames.push(innerResult.filename);
                        if (innerResult.textContent) {
                            attachmentTexts.push({
                                type: innerResult.contentType?.includes('word') || innerResult.filename?.match(/\.docx?$/i) ? 'word' :
                                      innerResult.contentType?.includes('excel') || innerResult.contentType?.includes('spreadsheet') || innerResult.filename?.match(/\.xlsx?$/i) ? 'excel' : 'other',
                                content: innerResult.textContent,
                                filename: innerResult.filename,
                                rawBase64: innerResult.rawBase64 || null,
                                mimeType: innerResult.contentType
                            });
                        }
                    }
                }
            }
        }
    } else {
        // Einfacher Body
        const encoding = (headers['content-transfer-encoding'] || '').toLowerCase();
        body = decodeMimeBody(bodyBlock, encoding);
    }

    return {
        subject: cleanText(subject),
        sender: cleanText(sender),
        date: dateRaw,
        body: cleanText(body),
        attachmentNames,
        attachmentTexts,
        rawSize: raw.length
    };
}

/**
 * MIME-Parts nach Boundary aufteilen
 */
function splitMimeParts(body, boundary) {
    const parts = [];
    const delim = '--' + boundary;
    const sections = body.split(delim);
    // Erste section ist Preamble, letzte endet mit --
    for (let i = 1; i < sections.length; i++) {
        const section = sections[i];
        if (section.startsWith('--')) break; // End boundary
        parts.push(section.replace(/^[\r\n]+/, ''));
    }
    return parts;
}

/**
 * Einzelnen MIME-Part parsen
 */
function parseMimePart(partRaw) {
    const splitIdx = partRaw.search(/\r?\n\r?\n/);
    const headerBlock = splitIdx >= 0 ? partRaw.substring(0, splitIdx) : '';
    const bodyBlock = splitIdx >= 0 ? partRaw.substring(splitIdx).replace(/^[\r\n]+/, '') : partRaw;

    // Part-Header parsen
    const headers = {};
    let currentKey = '';
    for (const line of headerBlock.replace(/\r\n/g, '\n').split('\n')) {
        if (/^\s/.test(line) && currentKey) {
            headers[currentKey] += ' ' + line.trim();
        } else {
            const m = line.match(/^([A-Za-z-]+):\s*(.*)/);
            if (m) {
                currentKey = m[1].toLowerCase();
                headers[currentKey] = m[2].trim();
            }
        }
    }

    const ct = (headers['content-type'] || 'text/plain').toLowerCase();
    const cte = (headers['content-transfer-encoding'] || '').toLowerCase();
    const cd = headers['content-disposition'] || '';

    // Filename extrahieren
    let filename = '';
    const fnMatch = (cd + ' ' + (headers['content-type'] || '')).match(/name="?([^";\r\n]+)"?/i);
    if (fnMatch) filename = decodeRfc2047(fnMatch[1].trim());

    // Ist es ein Attachment?
    const isAttachment = cd.includes('attachment') || (filename && !ct.startsWith('text/'));

    // Ist es ein verschachtelter Multipart?
    const boundaryMatch = ct.match(/boundary="?([^";\s]+)"?/i);
    if (ct.includes('multipart/')) {
        return {
            isMultipart: true,
            boundary: boundaryMatch ? boundaryMatch[1] : '',
            rawBody: bodyBlock
        };
    }

    // Body dekodieren
    const decoded = decodeMimeBody(bodyBlock, cte);

    const isText = ct.startsWith('text/plain');
    const isHtml = ct.startsWith('text/html');

    // Für Attachments: versuche Text zu extrahieren wenn es XML-basiert ist (docx/xlsx)
    let textContent = decoded;
    let rawBase64 = null;
    if (isAttachment && cte === 'base64') {
        rawBase64 = bodyBlock.replace(/[\r\n\s]/g, '');
        // Base64 Attachment - versuche XML-Text zu extrahieren für Office-Formate
        try {
            const binaryStr = atob(rawBase64);
            if (filename.match(/\.docx$/i)) {
                // Paragraphen-weise extrahieren für bessere Struktur
                const signatureFonts = /segoe\s*script|lucida\s*handwriting|brush\s*script|comic\s*sans|dancing\s*script/i;
                const paragraphs = binaryStr.split(/<\/w:p>/g);
                const lines = paragraphs.map(p => {
                    // Runs einzeln prüfen um Schriftart zu erkennen
                    const runs = p.matchAll(/<w:r>([\s\S]*?)<\/w:r>/g);
                    let lineText = '';
                    let hasSignatureFont = false;
                    for (const run of runs) {
                        const runXml = run[1];
                        // Prüfe auf Signatur-Schriftart
                        if (signatureFonts.test(runXml)) {
                            hasSignatureFont = true;
                        }
                        // Text extrahieren
                        const texts = runXml.matchAll(/<w:t[^>]*>([^<]+)<\/w:t>/g);
                        for (const t of texts) lineText += t[1];
                    }
                    if (!lineText.trim()) return '';
                    if (hasSignatureFont) return '[Handschriftliche Unterschrift: ' + lineText.trim() + ']';
                    return lineText;
                }).filter(line => line.trim());
                textContent = lines.join('\n');
            } else if (filename.match(/\.xlsx$/i)) {
                const cellMatches = binaryStr.matchAll(/<v>([^<]+)<\/v>|<t[^>]*>([^<]+)<\/t>/g);
                textContent = Array.from(cellMatches).map(m => m[1] || m[2]).filter(Boolean).join('\n');
            } else {
                textContent = '[Binäranhang: ' + filename + ']';
            }
        } catch {
            textContent = '[Anhang: ' + filename + ']';
        }
    }

    return {
        isAttachment,
        isText,
        isHtml,
        filename,
        contentType: ct,
        textContent,
        rawBase64
    };
}

/**
 * MIME Body dekodieren (quoted-printable / base64)
 */
function decodeMimeBody(body, encoding) {
    if (encoding === 'quoted-printable') {
        const cleaned = body.replace(/=\r?\n/g, ''); // Soft line breaks
        // Collect bytes, then decode as UTF-8
        const bytes = [];
        for (let i = 0; i < cleaned.length; i++) {
            if (cleaned[i] === '=' && i + 2 < cleaned.length && /^[0-9A-Fa-f]{2}$/.test(cleaned.substring(i + 1, i + 3))) {
                bytes.push(parseInt(cleaned.substring(i + 1, i + 3), 16));
                i += 2;
            } else {
                const code = cleaned.charCodeAt(i);
                if (code === 0x0D) continue; // skip CR
                bytes.push(code & 0xFF);
            }
        }
        try {
            return new TextDecoder('utf-8').decode(new Uint8Array(bytes));
        } catch {
            return cleaned.replace(/=([0-9A-Fa-f]{2})/g, (_, hex) => String.fromCharCode(parseInt(hex, 16)));
        }
    }
    if (encoding === 'base64') {
        try {
            const binaryStr = atob(body.replace(/[\r\n\s]/g, ''));
            const bytes = new Uint8Array(binaryStr.length);
            for (let i = 0; i < binaryStr.length; i++) bytes[i] = binaryStr.charCodeAt(i);
            return new TextDecoder('utf-8').decode(bytes);
        } catch {
            return body;
        }
    }
    return body;
}

/**
 * RFC 2047 encoded-word dekodieren (=?charset?encoding?text?=)
 */
function decodeRfc2047(str) {
    return str.replace(/=\?([^?]+)\?([BbQq])\?([^?]*)\?=/g, (_, charset, enc, text) => {
        try {
            let bytes;
            if (enc.toUpperCase() === 'B') {
                const binaryStr = atob(text);
                bytes = new Uint8Array(binaryStr.length);
                for (let i = 0; i < binaryStr.length; i++) bytes[i] = binaryStr.charCodeAt(i);
            } else {
                // Q encoding
                const decoded = text.replace(/_/g, ' ');
                const arr = [];
                for (let i = 0; i < decoded.length; i++) {
                    if (decoded[i] === '=' && i + 2 < decoded.length && /^[0-9A-Fa-f]{2}$/.test(decoded.substring(i + 1, i + 3))) {
                        arr.push(parseInt(decoded.substring(i + 1, i + 3), 16));
                        i += 2;
                    } else {
                        arr.push(decoded.charCodeAt(i) & 0xFF);
                    }
                }
                bytes = new Uint8Array(arr);
            }
            const label = charset.toLowerCase().replace(/^utf-?8$/, 'utf-8');
            return new TextDecoder(label).decode(bytes);
        } catch {
            return text;
        }
    });
}

/**
 * Excel/Word Datei lesen
 */
export async function readAttachment(file) {
    const extension = file.name.split('.').pop().toLowerCase();

    if (['xlsx', 'xls'].includes(extension)) {
        return await readExcelFile(file);
    } else if (['docx', 'doc'].includes(extension)) {
        return await readWordFile(file);
    } else if (extension === 'pdf') {
        return { type: 'pdf', content: '[PDF-Inhalt - wird von KI analysiert]', filename: file.name };
    } else {
        return { type: 'unknown', content: '', filename: file.name };
    }
}

/**
 * Excel Datei lesen (vereinfacht)
 */
async function readExcelFile(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = (e) => {
            try {
                // Für XLSX: Versuche XML-Inhalte zu extrahieren
                const arrayBuffer = e.target.result;
                const uint8Array = new Uint8Array(arrayBuffer);
                const decoder = new TextDecoder('utf-8', { fatal: false });
                const text = decoder.decode(uint8Array);

                // Suche nach Zelleninhalten in XML
                const cellValues = [];
                const cellMatches = text.matchAll(/<v>([^<]+)<\/v>|<t[^>]*>([^<]+)<\/t>/g);
                for (const match of cellMatches) {
                    const value = match[1] || match[2];
                    if (value && value.trim()) {
                        cellValues.push(value.trim());
                    }
                }

                resolve({
                    type: 'excel',
                    content: cellValues.join('\n'),
                    filename: file.name,
                    cellCount: cellValues.length
                });
            } catch (error) {
                resolve({ type: 'excel', content: '[Excel-Datei konnte nicht gelesen werden]', filename: file.name });
            }
        };

        reader.onerror = () => resolve({ type: 'excel', content: '[Lesefehler]', filename: file.name });
        reader.readAsArrayBuffer(file);
    });
}

/**
 * Word Datei lesen (vereinfacht)
 */
async function readWordFile(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = (e) => {
            try {
                const arrayBuffer = e.target.result;
                const uint8Array = new Uint8Array(arrayBuffer);
                const decoder = new TextDecoder('utf-8', { fatal: false });
                const text = decoder.decode(uint8Array);

                // DOCX: Extrahiere Text aus XML
                const textContent = [];
                const textMatches = text.matchAll(/<w:t[^>]*>([^<]+)<\/w:t>/g);
                for (const match of textMatches) {
                    if (match[1] && match[1].trim()) {
                        textContent.push(match[1]);
                    }
                }

                resolve({
                    type: 'word',
                    content: textContent.join(' '),
                    filename: file.name
                });
            } catch (error) {
                resolve({ type: 'word', content: '[Word-Datei konnte nicht gelesen werden]', filename: file.name });
            }
        };

        reader.onerror = () => resolve({ type: 'word', content: '[Lesefehler]', filename: file.name });
        reader.readAsArrayBuffer(file);
    });
}

/**
 * API aufrufen
 */
async function callClaudeAPI(prompt, systemPrompt = null) {
    if (!apiConfig.apiKey) {
        throw new Error('API Key nicht gesetzt');
    }

    const messages = [{ role: 'user', content: prompt }];

    const body = {
        model: apiConfig.model,
        max_tokens: apiConfig.maxTokens,
        messages: messages
    };

    if (systemPrompt) {
        body.system = systemPrompt;
    }

    const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'x-api-key': apiConfig.apiKey,
            'anthropic-version': '2023-06-01',
            'anthropic-dangerous-direct-browser-access': 'true'
        },
        body: JSON.stringify(body)
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API Fehler: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    return data.content[0].text;
}

/**
 * E-Mail mit KI analysieren
 */
export async function analyzeEmailWithAI(emailData, attachments = []) {
    const systemPrompt = `Du bist ein Experte für Versicherungs-Bestandsübertragungen. Du analysierst E-Mails und deren Anhänge und extrahierst strukturierte Daten.

## AUFGABE
1. Identifiziere JEDEN einzelnen Übertragungsvorgang. Eine E-Mail kann mehrere Kunden/Verträge enthalten.
2. Extrahiere pro Vorgang die unten genannten Felder.
3. Prüfe die Maklervollmacht gemäß den STRENGEN Regeln unten.
4. Prüfe fehlende Informationen gemäß den STRENGEN Regeln unten.

## FELDER PRO VORGANG
- kunde: "Nachname, Vorname" (genau wie im Dokument)
- versicherungsnummer: exakte Nummer aus dem Dokument
- sparte: KFZ | Leben | Kranken | Haftpflicht | Hausrat | Wohngebäude | BU | Unfall | Rechtsschutz | Sonstige
- makler: Name des Maklers/Absenders
- maklerEmail: E-Mail-Adresse des Maklers
- gueltigkeitsdatum: Gewünschter Übertragungstermin (TT.MM.JJJJ), NUR wenn explizit genannt
- status: angefragt | bestaetigt | abgelehnt | in-bearbeitung
- kategorie: "neu" | "erinnerung"
- erstmail_datum: NUR bei kategorie="erinnerung" – Datum der ursprünglichen Anfrage/Erstmail (TT.MM.JJJJ), falls aus dem Text ableitbar. Sonst null.

## KATEGORIE – KLASSIFIZIERUNG
Bestimme ob es sich um einen NEUEN Vorgang oder eine ERINNERUNG handelt:
- **"erinnerung"**: Die E-Mail ist eine Nachfass-Mail, Erinnerung, Statusanfrage oder Rückfrage zu einem BESTEHENDEN/BEREITS BEKANNTEN Vorgang. Typische Merkmale: "Erinnerung" im Betreff, Bezug auf frühere Korrespondenz, "nochmals", "erneut", "wie besprochen", "Rückmeldung ausstehend", Status "in-bearbeitung", oder die E-Mail fragt nach dem Stand eines bereits eingereichten Antrags.
  - Bei Erinnerungen: Extrahiere das Datum der Erstmail/des ursprünglichen Antrags aus dem E-Mail-Text, z.B. "Antrag vom 06.01.2026 eingereicht", "am 15.01.2026 per Post übermittelt". Setze erstmail_datum auf dieses Datum.
- **"neu"**: Die E-Mail enthält einen NEUEN Übertragungsantrag/-auftrag, der zum ersten Mal eingereicht wird. Dies ist der Standardwert wenn nichts auf eine Erinnerung hindeutet. erstmail_datum bleibt null.

## MAKLERVOLLMACHT – STRENGE REGELN
Prüfe die Maklervollmacht anhand dieser Kriterien:

**als_anhang** (boolean): Ist ein Dokument mit dem Titel/Namen "Maklervollmacht" oder "Vollmacht" tatsächlich als Dateianhang der E-Mail beigefügt? NUR true wenn die Datei physisch als Attachment vorhanden ist.

**nur_erwaehnt** (boolean): Wird eine Maklervollmacht nur im E-Mail-Text erwähnt, z.B. "per Post übermittelt", "wurde bereits geschickt", "liegt vor"? Wenn ja: true. Das bedeutet, die Vollmacht ist NICHT in dieser E-Mail enthalten.

**unterschrieben** (boolean | null):
- true: NUR wenn im Anhang-Dokument eine Unterschrift erkennbar ist (z.B. "[Handschriftliche Unterschrift: Name]"-Marker, handschriftlicher Name, Wingdings-Zeichen, Bild-Signatur, oder Text der klar auf eine geleistete Unterschrift hinweist). Der Marker "[Handschriftliche Unterschrift: ...]" bedeutet DEFINITIV unterschrieben = true.
- false: Wenn das Vollmacht-Dokument als Anhang vorliegt, aber KEINE Unterschrift erkennbar ist (leere Unterschriftszeile, Platzhalter wie "________________________", "[Unterschrift]" o.ä.).
- null: Wenn die Vollmacht nicht als Anhang vorliegt und daher nicht geprüft werden kann.

**manuell_pruefen** (boolean): true in folgenden Fällen:
- Vollmacht wird nur erwähnt aber ist nicht als Anhang beigefügt
- Unterschriftsstatus ist unklar
- Vollmacht liegt als PDF vor (Signatur kann nicht sicher geprüft werden)
- Vollmacht fehlt komplett

**anmerkung** (string): NUR zusätzliche Details, die NICHT schon durch die obigen Felder (als_anhang, nur_erwaehnt, unterschrieben) abgedeckt sind. Beispiele: "Vollmacht laut E-Mail per Post übermittelt am 15.01.2026", "PDF-Anhang, Signaturprüfung nicht möglich". NICHT wiederholen was schon aus den Boolean-Feldern hervorgeht (z.B. NICHT "Vollmacht als Anhang vorhanden, nicht unterschrieben" – das ergibt sich bereits aus als_anhang=true, unterschrieben=false). Leerer String "" wenn keine Zusatzinfo nötig.

## FEHLENDE INFORMATIONEN – STRENGE REGELN
Das Feld "fehlende_infos" darf NUR Informationen enthalten, die in KEINER der bereitgestellten Quellen vorkommen (E-Mail-Text, Betreff, Anhänge).

NICHT als fehlend melden:
- Informationen die in einem Excel-/Word-Anhang stehen (auch wenn nicht im E-Mail-Text)
- Informationen die aus dem Kontext ableitbar sind
- Gültigkeitsdatum, wenn kein konkreter Termin genannt wird (das ist normal)
- NIEMALS Maklervollmacht-bezogene Einträge (z.B. "Vollmacht fehlt", "Vollmacht nicht unterschrieben") – die Maklervollmacht hat eigene dedizierte Felder (als_anhang, unterschrieben, manuell_pruefen) und wird dort bereits vollständig erfasst

NUR als fehlend melden wenn es geschäftskritisch ist:
- Versicherungsnummer fehlt komplett (nirgends im Dokument)
- Kundenname fehlt komplett
- Sparte/Vertragsart ist nicht identifizierbar

Wenn NICHTS fehlt: leeres Array [] zurückgeben.

## NOTIZEN – STRENGE REGELN
Das Feld "notizen" darf KEINE Informationen wiederholen, die bereits in anderen Feldern erfasst sind:
- KEINE Wiederholung von Maklervollmacht-Informationen (Status, Unterschrift, Anhang) – das steht im maklervollmacht-Objekt
- KEINE Wiederholung von Kunde, Versicherungsnummer, Sparte, Makler – das steht in den eigenen Feldern
- NUR echte Zusatzinformationen die in keinem anderen Feld Platz haben
- Leerer String "" wenn keine echten Zusatzinfos vorhanden sind

## ANTWORTFORMAT (JSON)
{
  "vorgaenge": [
    {
      "kunde": "Nachname, Vorname",
      "versicherungsnummer": "XXX-XXXXXXX",
      "sparte": "KFZ",
      "makler": "Name",
      "maklerEmail": "email@example.com",
      "gueltigkeitsdatum": "TT.MM.JJJJ oder null",
      "status": "angefragt",
      "kategorie": "neu",
      "erstmail_datum": null,
      "maklervollmacht": {
        "als_anhang": false,
        "nur_erwaehnt": true,
        "unterschrieben": null,
        "manuell_pruefen": true,
        "anmerkung": "Laut E-Mail per Post übermittelt"
      },
      "fehlende_infos": [],
      "notizen": "Weitere relevante Informationen"
    }
  ],
  "zusammenfassung": "Kurze Zusammenfassung der E-Mail"
}

WICHTIG: Antworte NUR mit validem JSON. Keine Erklärungen davor oder danach.`;

    // Prompt zusammenbauen
    let prompt = `Analysiere folgende E-Mail zur Bestandsübertragung:\n\n`;
    prompt += `**Betreff:** ${emailData.subject || 'Kein Betreff'}\n`;
    prompt += `**Absender:** ${emailData.sender || 'Unbekannt'}\n`;
    prompt += `**Inhalt:**\n${emailData.body || 'Kein Inhalt'}\n\n`;

    if (attachments.length > 0) {
        prompt += `**Anhänge:**\n`;
        for (const att of attachments) {
            prompt += `\n--- ${att.filename} (${att.type}) ---\n`;
            prompt += att.content.substring(0, 5000); // Limitiere Anhang-Größe
            prompt += '\n';
        }
    }

    try {
        const response = await callClaudeAPI(prompt, systemPrompt);

        // Parse JSON aus Antwort
        const jsonMatch = response.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            return JSON.parse(jsonMatch[0]);
        }

        return { error: 'Ungültiges Antwortformat', raw: response };
    } catch (error) {
        throw new Error('KI-Analyse fehlgeschlagen: ' + error.message);
    }
}

/**
 * Batch-Verarbeitung mehrerer E-Mails
 */
export async function processBatch(files, onProgress) {
    const results = [];
    let processed = 0;

    for (const file of files) {
        try {
            onProgress?.({
                current: processed + 1,
                total: files.length,
                filename: file.name,
                status: 'processing'
            });

            const lower = file.name.toLowerCase();

            if (lower.endsWith('.msg')) {
                // MSG Datei verarbeiten
                const msgContent = await parseMsgFile(file);
                const analysis = await analyzeEmailWithAI(msgContent, []);

                results.push({
                    filename: file.name,
                    email: msgContent,
                    analysis: analysis,
                    success: true
                });
            } else if (lower.endsWith('.eml')) {
                // EML Datei verarbeiten
                const emlContent = await parseEmlFile(file);
                const attachments = emlContent.attachmentTexts || [];
                const analysis = await analyzeEmailWithAI(emlContent, attachments);

                results.push({
                    filename: file.name,
                    email: emlContent,
                    analysis: analysis,
                    success: true
                });
            } else {
                // Anhang für spätere Verarbeitung speichern
                const attachment = await readAttachment(file);
                results.push({
                    filename: file.name,
                    type: 'attachment',
                    content: attachment,
                    success: true
                });
            }

            processed++;
            onProgress?.({
                current: processed,
                total: files.length,
                filename: file.name,
                status: 'completed'
            });

        } catch (error) {
            results.push({
                filename: file.name,
                error: error.message,
                success: false
            });
            processed++;
        }
    }

    return results;
}

/**
 * Ergebnisse zu Excel exportieren
 */
export function exportToExcel(analysisResults) {
    const rows = [];

    // Header
    rows.push([
        'Kunde',
        'Versicherungsnummer',
        'Sparte',
        'Makler',
        'Makler E-Mail',
        'Gültig ab',
        'Eingegangen am',
        'Kategorie',
        'Erstmail',
        'Status',
        'MV als Anhang',
        'MV nur erwähnt',
        'MV unterschrieben',
        'MV manuell prüfen',
        'MV Anmerkung',
        'Fehlende Infos',
        'Notizen',
        'Quelldatei'
    ]);

    // Daten
    for (const result of analysisResults) {
        if (!result.success || !result.analysis?.vorgaenge) continue;

        for (const vorgang of result.analysis.vorgaenge) {
            const mv = vorgang.maklervollmacht || {};
            rows.push([
                vorgang.kunde || '',
                vorgang.versicherungsnummer || '',
                vorgang.sparte || '',
                vorgang.makler || '',
                vorgang.maklerEmail || '',
                vorgang.gueltigkeitsdatum || '',
                result.email?.date || '',
                vorgang.kategorie || 'neu',
                vorgang.erstmail_datum || '',
                vorgang._onHold ? 'on-hold' : (vorgang.status || ''),
                mv.als_anhang === true ? 'Ja' : (mv.vorhanden === true ? 'Ja' : 'Nein'),
                mv.nur_erwaehnt === true ? 'Ja' : 'Nein',
                mv.unterschrieben === true ? 'Ja' : (mv.unterschrieben === false ? 'Nein' : 'Unklar'),
                mv.manuell_pruefen === true ? 'Ja' : 'Nein',
                mv.anmerkung || '',
                (vorgang.fehlende_infos || []).join(', '),
                vorgang.notizen || '',
                result.filename
            ]);
        }
    }

    // CSV mit BOM für Excel
    const BOM = '\uFEFF';
    const csvContent = BOM + rows.map(row =>
        row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(';')
    ).join('\r\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = `bestandsuebertragung_ki_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    return rows.length - 1; // Anzahl Vorgänge (ohne Header)
}

// Default export
export default {
    setApiKey,
    loadApiKey,
    hasApiKey,
    parseMsgFile,
    parseEmlFile,
    readAttachment,
    analyzeEmailWithAI,
    processBatch,
    exportToExcel
};
