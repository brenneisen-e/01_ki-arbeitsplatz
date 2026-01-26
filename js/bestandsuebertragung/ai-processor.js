/**
 * AI Processor Modul - Claude API Integration für Bestandsübertragung
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
 * Claude API aufrufen
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
    const systemPrompt = `Du bist ein Experte für Versicherungs-Bestandsübertragungen bei ERGO.
Analysiere die bereitgestellten E-Mails und Dokumente und extrahiere alle relevanten Informationen.

Deine Aufgabe:
1. Identifiziere jeden einzelnen Vorgang (es können mehrere Kunden in einer Mail sein)
2. Extrahiere für jeden Vorgang:
   - Kundenname (Nachname, Vorname)
   - Versicherungsnummer
   - Sparte (KFZ, Leben, Kranken, etc.)
   - Makler/Absender
   - Gültigkeitsdatum
   - Status der Übertragung
3. Prüfe ob eine Maklervollmacht vorhanden ist und ob sie unterschrieben ist
4. Notiere fehlende Informationen

Antworte IMMER im folgenden JSON-Format:
{
  "vorgaenge": [
    {
      "kunde": "Nachname, Vorname",
      "versicherungsnummer": "XXX-XXXXXXX",
      "sparte": "KFZ|Leben|Kranken|Haftpflicht|etc",
      "makler": "Name",
      "maklerEmail": "email@example.com",
      "gueltigkeitsdatum": "TT.MM.JJJJ",
      "status": "angefragt|bestaetigt|abgelehnt|in-bearbeitung",
      "maklervollmacht": {
        "vorhanden": true/false,
        "unterschrieben": true/false,
        "anmerkung": "optional"
      },
      "fehlende_infos": ["Liste fehlender Informationen"],
      "notizen": "Weitere relevante Informationen"
    }
  ],
  "zusammenfassung": "Kurze Zusammenfassung der E-Mail"
}`;

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

            if (file.name.toLowerCase().endsWith('.msg')) {
                // MSG Datei verarbeiten
                const msgContent = await parseMsgFile(file);
                const analysis = await analyzeEmailWithAI(msgContent, []);

                results.push({
                    filename: file.name,
                    email: msgContent,
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
        'Status',
        'Maklervollmacht vorhanden',
        'Maklervollmacht unterschrieben',
        'Fehlende Infos',
        'Notizen',
        'Quelldatei'
    ]);

    // Daten
    for (const result of analysisResults) {
        if (!result.success || !result.analysis?.vorgaenge) continue;

        for (const vorgang of result.analysis.vorgaenge) {
            rows.push([
                vorgang.kunde || '',
                vorgang.versicherungsnummer || '',
                vorgang.sparte || '',
                vorgang.makler || '',
                vorgang.maklerEmail || '',
                vorgang.gueltigkeitsdatum || '',
                vorgang.status || '',
                vorgang.maklervollmacht?.vorhanden ? 'Ja' : 'Nein',
                vorgang.maklervollmacht?.unterschrieben ? 'Ja' : 'Nein',
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
    readAttachment,
    analyzeEmailWithAI,
    processBatch,
    exportToExcel
};
