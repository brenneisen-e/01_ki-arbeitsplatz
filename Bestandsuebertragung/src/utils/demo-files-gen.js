/**
 * Demo-Dateien Generator für Bestandsübertragung
 * Erzeugt realistische EML-, DOCX- und XLSX-Dateien zum Testen des KI-Upload-Workflows.
 */

// ============================================================
// ZIP Builder (für DOCX/XLSX)
// ============================================================

function crc32(data) {
    let crc = 0xFFFFFFFF;
    for (let i = 0; i < data.length; i++) {
        crc ^= data[i];
        for (let j = 0; j < 8; j++) {
            crc = (crc >>> 1) ^ (crc & 1 ? 0xEDB88320 : 0);
        }
    }
    return (crc ^ 0xFFFFFFFF) >>> 0;
}

function createZip(files) {
    const enc = new TextEncoder();
    const entries = [];
    let offset = 0;

    files.forEach(f => {
        const nameBytes = enc.encode(f.name);
        const data = typeof f.content === 'string' ? enc.encode(f.content) : f.content;
        const crc = crc32(data);

        // Local file header
        const lh = new Uint8Array(30 + nameBytes.length);
        const lv = new DataView(lh.buffer);
        lv.setUint32(0, 0x04034b50, true);
        lv.setUint16(4, 20, true);
        lv.setUint16(8, 0, true); // STORE
        lv.setUint32(14, crc, true);
        lv.setUint32(18, data.length, true);
        lv.setUint32(22, data.length, true);
        lv.setUint16(26, nameBytes.length, true);
        lh.set(nameBytes, 30);

        // Central directory header
        const ch = new Uint8Array(46 + nameBytes.length);
        const cv = new DataView(ch.buffer);
        cv.setUint32(0, 0x02014b50, true);
        cv.setUint16(4, 20, true);
        cv.setUint16(6, 20, true);
        cv.setUint16(8, 0, true);
        cv.setUint16(10, 0, true);
        cv.setUint32(16, crc, true);
        cv.setUint32(20, data.length, true);
        cv.setUint32(24, data.length, true);
        cv.setUint16(28, nameBytes.length, true);
        cv.setUint32(38, 0x20, true);
        cv.setUint32(42, offset, true);
        ch.set(nameBytes, 46);

        entries.push({ lh, data, ch });
        offset += lh.length + data.length;
    });

    const centralSize = entries.reduce((s, e) => s + e.ch.length, 0);
    const eocd = new Uint8Array(22);
    const ev = new DataView(eocd.buffer);
    ev.setUint32(0, 0x06054b50, true);
    ev.setUint16(8, entries.length, true);
    ev.setUint16(10, entries.length, true);
    ev.setUint32(12, centralSize, true);
    ev.setUint32(16, offset, true);

    const total = offset + centralSize + 22;
    const result = new Uint8Array(total);
    let pos = 0;
    entries.forEach(e => {
        result.set(e.lh, pos); pos += e.lh.length;
        result.set(e.data, pos); pos += e.data.length;
    });
    entries.forEach(e => { result.set(e.ch, pos); pos += e.ch.length; });
    result.set(eocd, pos);
    return result;
}

// ============================================================
// XML Helpers
// ============================================================

function escXml(str) {
    return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

// ============================================================
// DOCX Generator
// ============================================================

function createDocx(paragraphs, options = {}) {
    const { title, bold: boldLines = [] } = options;

    const bodyXml = paragraphs.map((p, i) => {
        const isBold = boldLines.includes(i);
        const isTitle = i === 0 && title;
        const fontSize = isTitle ? 32 : (isBold ? 24 : 22);
        const bold = (isTitle || isBold) ? '<w:b/>' : '';
        const jc = isTitle ? '<w:jc w:val="center"/>' : '';
        const spacing = isTitle ? '<w:spacing w:after="240"/>' : '<w:spacing w:after="120"/>';
        if (p === '') {
            return '<w:p><w:pPr><w:spacing w:after="120"/></w:pPr></w:p>';
        }
        return `<w:p><w:pPr>${jc}${spacing}</w:pPr><w:r><w:rPr>${bold}<w:sz w:val="${fontSize}"/></w:rPr><w:t xml:space="preserve">${escXml(p)}</w:t></w:r></w:p>`;
    }).join('\n');

    const contentTypes = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
<Default Extension="xml" ContentType="application/xml"/>
<Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>
</Types>`;

    const rels = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>
</Relationships>`;

    const docRels = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"/>`;

    const document = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
<w:body>
${bodyXml}
</w:body>
</w:document>`;

    return createZip([
        { name: '[Content_Types].xml', content: contentTypes },
        { name: '_rels/.rels', content: rels },
        { name: 'word/_rels/document.xml.rels', content: docRels },
        { name: 'word/document.xml', content: document }
    ]);
}

// ============================================================
// XLSX Generator
// ============================================================

function createXlsx(sheetName, headers, rows) {
    // Collect all unique strings
    const strings = [];
    const stringIndex = {};
    function addString(s) {
        const str = String(s);
        if (!(str in stringIndex)) {
            stringIndex[str] = strings.length;
            strings.push(str);
        }
        return stringIndex[str];
    }

    headers.forEach(h => addString(h));
    rows.forEach(row => row.forEach(cell => addString(cell)));

    // Column letter helper
    function colLetter(i) {
        return String.fromCharCode(65 + i);
    }

    // Build sheet XML
    let sheetRows = '<row r="1">';
    headers.forEach((h, i) => {
        const idx = stringIndex[h];
        sheetRows += `<c r="${colLetter(i)}1" t="s" s="1"><v>${idx}</v></c>`;
    });
    sheetRows += '</row>';

    rows.forEach((row, ri) => {
        const rn = ri + 2;
        sheetRows += `<row r="${rn}">`;
        row.forEach((cell, ci) => {
            const idx = stringIndex[String(cell)];
            sheetRows += `<c r="${colLetter(ci)}${rn}" t="s"><v>${idx}</v></c>`;
        });
        sheetRows += '</row>';
    });

    const lastCol = colLetter(headers.length - 1);
    const lastRow = rows.length + 1;

    const contentTypes = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
<Default Extension="xml" ContentType="application/xml"/>
<Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>
<Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>
<Override PartName="/xl/sharedStrings.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sharedStrings+xml"/>
<Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/>
</Types>`;

    const rels = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/>
</Relationships>`;

    const wbRels = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/>
<Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/sharedStrings" Target="sharedStrings.xml"/>
<Relationship Id="rId3" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>
</Relationships>`;

    const workbook = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
<sheets><sheet name="${escXml(sheetName)}" sheetId="1" r:id="rId1"/></sheets>
</workbook>`;

    const sheet = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">
<dimension ref="A1:${lastCol}${lastRow}"/>
<sheetData>${sheetRows}</sheetData>
</worksheet>`;

    const sharedStringsXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<sst xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" count="${strings.length}" uniqueCount="${strings.length}">
${strings.map(s => `<si><t>${escXml(s)}</t></si>`).join('')}
</sst>`;

    const styles = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">
<fonts count="2"><font><sz val="11"/><name val="Calibri"/></font><font><b/><sz val="11"/><name val="Calibri"/></font></fonts>
<fills count="2"><fill><patternFill patternType="none"/></fill><fill><patternFill patternType="gray125"/></fill></fills>
<borders count="1"><border><left/><right/><top/><bottom/><diagonal/></border></borders>
<cellStyleXfs count="1"><xf/></cellStyleXfs>
<cellXfs count="2"><xf xfId="0"/><xf xfId="0" fontId="1" applyFont="1"/></cellXfs>
</styleSheet>`;

    return createZip([
        { name: '[Content_Types].xml', content: contentTypes },
        { name: '_rels/.rels', content: rels },
        { name: 'xl/_rels/workbook.xml.rels', content: wbRels },
        { name: 'xl/workbook.xml', content: workbook },
        { name: 'xl/worksheets/sheet1.xml', content: sheet },
        { name: 'xl/sharedStrings.xml', content: sharedStringsXml },
        { name: 'xl/styles.xml', content: styles }
    ]);
}

// ============================================================
// Base64 & EML Generator
// ============================================================

function uint8ToBase64(data) {
    let binary = '';
    for (let i = 0; i < data.length; i++) {
        binary += String.fromCharCode(data[i]);
    }
    return btoa(binary);
}

function wrapBase64(b64, lineLen = 76) {
    const lines = [];
    for (let i = 0; i < b64.length; i += lineLen) {
        lines.push(b64.slice(i, i + lineLen));
    }
    return lines.join('\r\n');
}

function quotedPrintableEncode(text) {
    const enc = new TextEncoder();
    const bytes = enc.encode(text);
    let result = '';
    let lineLen = 0;
    for (let i = 0; i < bytes.length; i++) {
        const b = bytes[i];
        let encoded;
        if (b === 0x0A) {
            encoded = '\r\n';
            lineLen = 0;
        } else if (b === 0x0D) {
            continue;
        } else if (b >= 33 && b <= 126 && b !== 61) {
            encoded = String.fromCharCode(b);
        } else if (b === 0x20 || b === 0x09) {
            encoded = String.fromCharCode(b);
        } else {
            encoded = '=' + b.toString(16).toUpperCase().padStart(2, '0');
        }
        if (encoded !== '\r\n' && lineLen + encoded.length > 75) {
            result += '=\r\n';
            lineLen = 0;
        }
        result += encoded;
        if (encoded === '\r\n') {
            lineLen = 0;
        } else {
            lineLen += encoded.length;
        }
    }
    return result;
}

function createEml(options) {
    const { from, to, subject, date, body, attachments = [] } = options;
    const boundary = '----=_Part_' + Math.random().toString(36).slice(2, 14);

    let eml = '';
    eml += `From: ${from}\r\n`;
    eml += `To: ${to}\r\n`;
    eml += `Subject: =?UTF-8?B?${btoa(unescape(encodeURIComponent(subject)))}?=\r\n`;
    eml += `Date: ${date}\r\n`;
    eml += `MIME-Version: 1.0\r\n`;
    eml += `X-Mailer: Outlook 16.0\r\n`;

    if (attachments.length === 0) {
        eml += `Content-Type: text/plain; charset=utf-8\r\n`;
        eml += `Content-Transfer-Encoding: quoted-printable\r\n`;
        eml += `\r\n`;
        eml += quotedPrintableEncode(body);
    } else {
        eml += `Content-Type: multipart/mixed; boundary="${boundary}"\r\n`;
        eml += `\r\n`;
        // Body part
        eml += `--${boundary}\r\n`;
        eml += `Content-Type: text/plain; charset=utf-8\r\n`;
        eml += `Content-Transfer-Encoding: quoted-printable\r\n`;
        eml += `\r\n`;
        eml += quotedPrintableEncode(body);
        eml += `\r\n`;
        // Attachments
        attachments.forEach(att => {
            const b64 = uint8ToBase64(att.data);
            eml += `\r\n--${boundary}\r\n`;
            eml += `Content-Type: ${att.mimeType}; name="${att.filename}"\r\n`;
            eml += `Content-Disposition: attachment; filename="${att.filename}"\r\n`;
            eml += `Content-Transfer-Encoding: base64\r\n`;
            eml += `\r\n`;
            eml += wrapBase64(b64);
            eml += `\r\n`;
        });
        eml += `\r\n--${boundary}--\r\n`;
    }
    return new TextEncoder().encode(eml);
}

// ============================================================
// Demo Document Builders
// ============================================================

function buildMaklervollmacht(kunde, gebDatum, adresse, makler, firma, ort, datum, signed = true) {
    const paragraphs = [
        'MAKLERVOLLMACHT',
        '',
        `Hiermit bevollm\u00e4chtige ich,`,
        '',
        `${kunde}, geboren am ${gebDatum},`,
        `wohnhaft: ${adresse},`,
        '',
        `den Versicherungsmakler ${makler}, ${firma},`,
        '',
        `mit sofortiger Wirkung und bis auf Widerruf, mich in allen Versicherungsangelegenheiten zu vertreten.`,
        '',
        'Der bevollm\u00e4chtigte Makler ist insbesondere berechtigt:',
        '',
        '\u2022 Versicherungsvertr\u00e4ge in meinem Namen zu verwalten und zu betreuen',
        '\u2022 Bestands\u00fcbertragungen zu beantragen und durchzuf\u00fchren',
        '\u2022 Versicherungsunterlagen einzuholen und einzusehen',
        '\u2022 Korrespondenz mit Versicherungsgesellschaften zu f\u00fchren',
        '\u2022 Angebote einzuholen und Vertr\u00e4ge abzuschlie\u00dfen',
        '',
        'Diese Vollmacht gilt f\u00fcr alle bestehenden und zuk\u00fcnftigen Versicherungsvertr\u00e4ge.',
        '',
        `${ort}, den ${datum}`,
        '',
        '',
        '________________________',
        `${kunde}`,
    ];

    if (signed) {
        // Use buildSignedMaklervollmacht which includes a Wingdings signature run
        return createSignedDocx(paragraphs, kunde);
    }
    return createDocx(paragraphs, { title: true, bold: [11] });
}

/**
 * DOCX mit handschriftlicher Signatur erzeugen
 * Nutzt Segoe Script / Lucida Handwriting als Schriftart fuer realistische Unterschrift
 */
function createSignedDocx(paragraphs, kundeName) {
    const bodyParts = [];
    for (let i = 0; i < paragraphs.length; i++) {
        const p = paragraphs[i];
        const isTitle = i === 0;
        const isBold = i === 11;
        const fontSize = isTitle ? 32 : (isBold ? 24 : 22);
        const bold = (isTitle || isBold) ? '<w:b/>' : '';
        const jc = isTitle ? '<w:jc w:val="center"/>' : '';
        const spacing = isTitle ? '<w:spacing w:after="240"/>' : '<w:spacing w:after="120"/>';

        if (p === '') {
            bodyParts.push('<w:p><w:pPr><w:spacing w:after="120"/></w:pPr></w:p>');
        } else if (p === '________________________') {
            // Handschriftliche Signatur: Kundenname in Script-Font + Unterschriftslinie
            bodyParts.push(
                `<w:p><w:pPr><w:spacing w:after="0"/></w:pPr>` +
                `<w:r><w:rPr>` +
                `<w:rFonts w:ascii="Segoe Script" w:hAnsi="Segoe Script" w:cs="Lucida Handwriting"/>` +
                `<w:i/><w:sz w:val="36"/><w:color w:val="1B1B6F"/>` +
                `</w:rPr><w:t xml:space="preserve">${escXml(kundeName)}</w:t></w:r>` +
                `</w:p>` +
                `<w:p><w:pPr><w:spacing w:after="120"/></w:pPr>` +
                `<w:r><w:rPr><w:sz w:val="22"/></w:rPr><w:t xml:space="preserve">________________________</w:t></w:r>` +
                `</w:p>`
            );
        } else {
            bodyParts.push(
                `<w:p><w:pPr>${jc}${spacing}</w:pPr>` +
                `<w:r><w:rPr>${bold}<w:sz w:val="${fontSize}"/></w:rPr><w:t xml:space="preserve">${escXml(p)}</w:t></w:r>` +
                `</w:p>`
            );
        }
    }

    const bodyXml = bodyParts.join('\n');

    const contentTypes = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
<Default Extension="xml" ContentType="application/xml"/>
<Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>
</Types>`;

    const rels = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>
</Relationships>`;

    const docRels = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"/>`;

    const document = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
<w:body>
${bodyXml}
</w:body>
</w:document>`;

    return createZip([
        { name: '[Content_Types].xml', content: contentTypes },
        { name: '_rels/.rels', content: rels },
        { name: 'word/_rels/document.xml.rels', content: docRels },
        { name: 'word/document.xml', content: document }
    ]);
}

function buildAntragSchreiben(versicherer, makler, firma, kunde, vsNr, sparte, datum) {
    return createDocx([
        'Antrag auf Bestands\u00fcbertragung',
        '',
        `An: ${versicherer}`,
        `Datum: ${datum}`,
        `Betreff: Bestands\u00fcbertragung f\u00fcr ${kunde}`,
        '',
        'Sehr geehrte Damen und Herren,',
        '',
        `hiermit beantrage ich die \u00dcbertragung des folgenden Versicherungsvertrags in meinen Maklerbestand:`,
        '',
        `Versicherungsnehmer: ${kunde}`,
        `Versicherungsnummer: ${vsNr}`,
        `Sparte: ${sparte}`,
        '',
        'Die unterschriebene Maklervollmacht liegt als separate Anlage bei.',
        '',
        `Bitte best\u00e4tigen Sie die Bestands\u00fcbertragung schriftlich an die untenstehende Adresse.`,
        '',
        'Mit freundlichen Gr\u00fc\u00dfen,',
        '',
        `${makler}`,
        `${firma}`,
    ], { title: true });
}

function buildVersicherungsliste(rows) {
    const headers = ['VS-Nr', 'Kunde', 'Sparte', 'Versicherer', 'Beginn', 'Ende', 'Jahresbeitrag'];
    return createXlsx('Versicherungen', headers, rows);
}

function buildKundenliste(rows) {
    const headers = ['Kunde', 'Anschrift', 'Geburtsdatum', 'VS-Nr', 'Sparte', 'Status', 'Makler'];
    return createXlsx('Kundenliste', headers, rows);
}

// ============================================================
// Demo File Catalog
// ============================================================

const CATALOG = [
    // === Category: Einfache E-Mails ===
    {
        id: 'anfrage_text_mueller',
        category: 'email-simple',
        title: 'Anfrage KFZ \u2013 M\u00fcller',
        description: 'Einfache Text-E-Mail: Bestands\u00fcbertragung KFZ bei ERGO anfragen.',
        tags: ['EML', 'Nur Text', 'Anfrage'],
        filename: '01_Anfrage_KFZ_Mueller.eml',
        generate() {
            return createEml({
                from: '"Thomas Meier" <thomas.meier@meier-versicherungen.de>',
                to: 'maklerservice@ergo.de',
                subject: 'Bestandsübertragung KFZ – Hans Müller, ERG-7823456',
                date: 'Mon, 13 Jan 2026 09:15:00 +0100',
                body: `Sehr geehrte Damen und Herren,

hiermit beantragen wir die Bestandsübertragung für unseren Kunden:

Versicherungsnehmer: Hans Müller
Versicherungsnummer: ERG-7823456
Sparte: KFZ-Haftpflicht/Vollkasko
Gewünschter Übertragungstermin: 01.03.2026

Die unterschriebene Maklervollmacht wurde bereits per Post übermittelt (Einschreiben vom 08.01.2026).

Bitte bestätigen Sie die Übertragung schriftlich.

Mit freundlichen Grüßen

Thomas Meier
Meier Versicherungsmakler GmbH
Tel.: 0221-9876543
thomas.meier@meier-versicherungen.de`
            });
        }
    },
    {
        id: 'erinnerung_leben_weber',
        category: 'email-simple',
        title: 'Erinnerung Leben \u2013 Weber',
        description: 'Makler erinnert ERGO an laufende Bestands\u00fcbertragung Lebensversicherung.',
        tags: ['EML', 'Nur Text', 'Erinnerung'],
        filename: '02_Erinnerung_Leben_Weber.eml',
        generate() {
            return createEml({
                from: '"Sandra Schmidt" <sandra.schmidt@schmidt-makler.de>',
                to: 'maklerservice@ergo.de',
                subject: 'Erinnerung Bestands\u00fcbertragung \u2013 Christine Weber, ERG-4512378',
                date: 'Wed, 15 Jan 2026 14:32:00 +0100',
                body: `Sehr geehrte Damen und Herren,

ich m\u00f6chte mich nach dem Stand der Bestands\u00fcbertragung f\u00fcr folgende Kundin erkundigen:

Versicherungsnehmer: Christine Weber
Versicherungsnummer: ERG-4512378
Sparte: Lebensversicherung (Kapital)
Gew\u00fcnschtes \u00dcbertragungsdatum: 01.02.2026

Den Antrag haben wir bereits am 06.01.2026 eingereicht. Die unterschriebene Maklervollmacht wurde mit dem Antrag per Post \u00fcbermittelt.

K\u00f6nnten Sie uns bitte den aktuellen Bearbeitungsstand mitteilen?

Mit freundlichen Gr\u00fc\u00dfen

Sandra Schmidt
Schmidt Maklerb\u00fcro
K\u00f6nigsallee 45, 40215 D\u00fcsseldorf
Tel.: 0211-3344556
sandra.schmidt@schmidt-makler.de`
            });
        }
    },
    {
        id: 'nachreichung_schneider',
        category: 'email-simple',
        title: 'Nachreichung Vollmacht-Hinweis \u2013 Schneider',
        description: 'Makler k\u00fcndigt Nachreichung der Maklervollmacht an.',
        tags: ['EML', 'Nur Text', 'Nachreichung'],
        filename: '03_Nachreichung_Schneider.eml',
        generate() {
            return createEml({
                from: '"Lisa Wagner" <lisa.wagner@wagner-makler.de>',
                to: 'maklerservice@ergo.de',
                subject: 'Bestands\u00fcbertragung Petra Schneider, ERG-5567891 \u2013 Vollmacht folgt',
                date: 'Thu, 16 Jan 2026 10:05:00 +0100',
                body: `Sehr geehrte Damen und Herren,

hiermit beantragen wir die Bestands\u00fcbertragung f\u00fcr unsere Kundin:

Versicherungsnehmer: Petra Schneider
Versicherungsnummer: ERG-5567891
Sparte: Berufsunf\u00e4higkeit
Gew\u00fcnschtes \u00dcbertragungsdatum: 01.03.2026

Die Maklervollmacht wurde von der Kundin unterschrieben und geht Ihnen in den n\u00e4chsten Tagen per Post zu.

Bitte merken Sie den Vorgang bereits vor. Die Vollmacht wird sp\u00e4testens bis 24.01.2026 bei Ihnen eingehen.

Mit freundlichen Gr\u00fc\u00dfen

Lisa Wagner
Wagner Maklerb\u00fcro
Friedrichstr. 22, 40210 D\u00fcsseldorf
Tel.: 0211-7788990
lisa.wagner@wagner-makler.de`
            });
        }
    },

    // Erinnerung zu Mueller (gehoert zu anfrage_text_mueller)
    {
        id: 'erinnerung_kfz_mueller',
        category: 'email-simple',
        title: 'Erinnerung KFZ \u2013 M\u00fcller',
        description: 'Makler erinnert an die laufende Bestands\u00fcbertragung KFZ M\u00fcller (14 Tage sp\u00e4ter).',
        tags: ['EML', 'Nur Text', 'Erinnerung'],
        filename: '18_Erinnerung_KFZ_Mueller.eml',
        generate() {
            return createEml({
                from: '"Thomas Meier" <thomas.meier@meier-versicherungen.de>',
                to: 'maklerservice@ergo.de',
                subject: 'Erinnerung: Bestands\u00fcbertragung KFZ \u2013 Hans M\u00fcller, ERG-7823456',
                date: 'Tue, 27 Jan 2026 10:42:00 +0100',
                body: `Sehr geehrte Damen und Herren,

ich m\u00f6chte an unseren Antrag auf Bestands\u00fcbertragung vom 13.01.2026 erinnern:

Versicherungsnehmer: Hans M\u00fcller
Versicherungsnummer: ERG-7823456
Sparte: KFZ-Haftpflicht/Vollkasko
Gew\u00fcnschter \u00dcbertragungstermin: 01.03.2026

Wir haben bisher keine Best\u00e4tigung erhalten. K\u00f6nnten Sie uns bitte den aktuellen Bearbeitungsstand mitteilen?

Die Maklervollmacht wurde bereits per Einschreiben am 08.01.2026 \u00fcbermittelt.

Mit freundlichen Gr\u00fc\u00dfen

Thomas Meier
Meier Versicherungsmakler GmbH
Tel.: 0221-9876543
thomas.meier@meier-versicherungen.de`
            });
        }
    },

    // === Category: E-Mails mit Word-Anhang ===
    {
        id: 'anfrage_vollmacht_seidel',
        category: 'email-word',
        title: 'Anfrage + Maklervollmacht \u2013 Seidel',
        description: 'E-Mail mit unterschriebener Maklervollmacht als Word-Dokument im Anhang.',
        tags: ['EML', 'DOCX', 'Maklervollmacht'],
        filename: '04_Anfrage_Vollmacht_Seidel.eml',
        generate() {
            const vollmacht = buildMaklervollmacht(
                'Ralf Seidel', '12.05.1978',
                'Hauptstra\u00dfe 42, 50667 K\u00f6ln',
                'Martina Koch', 'Koch Finanzberatung',
                'K\u00f6ln', '06.01.2026',
                true // unterschrieben
            );
            return createEml({
                from: '"Martina Koch" <martina.koch@koch-finanz.de>',
                to: 'maklerservice@ergo.de',
                subject: 'Bestandsübertragung Kranken – Ralf Seidel, ERG-3345678, inkl. Maklervollmacht',
                date: 'Tue, 07 Jan 2026 11:20:00 +0100',
                body: `Sehr geehrte Damen und Herren,

anbei \u00fcbersende ich Ihnen die unterschriebene Maklervollmacht f\u00fcr unseren Kunden Ralf Seidel.

Vertragsdaten:
Versicherungsnehmer: Ralf Seidel
Versicherungsnummer: ERG-3345678
Sparte: Krankenversicherung (Zusatz)
Gew\u00fcnschtes \u00dcbertragungsdatum: 15.02.2026

Bitte \u00fcbertragen Sie den Vertrag in unseren Maklerbestand.

Mit freundlichen Gr\u00fc\u00dfen

Martina Koch
Koch Finanzberatung
Breite Str. 15, 50667 K\u00f6ln
Tel.: 0221-5554433`,
                attachments: [{
                    filename: 'Maklervollmacht_Seidel.docx',
                    mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                    data: vollmacht
                }]
            });
        }
    },
    {
        id: 'siehe_anlage_franke',
        category: 'email-word',
        title: '"Siehe Anlage" + Antrag \u2013 Franke',
        description: 'Kurze E-Mail verweist auf beigef\u00fcgtes Word-Dokument mit dem Antrag.',
        tags: ['EML', 'DOCX', 'Antrag'],
        filename: '05_Siehe_Anlage_Franke.eml',
        generate() {
            const antrag = buildAntragSchreiben(
                'ERGO Versicherung AG',
                'Stefan Zimmermann', 'Zimmermann Versicherungsmakler',
                'Birgit Franke', 'ERG-2298765', 'Haftpflicht',
                '10.01.2026'
            );
            return createEml({
                from: '"Stefan Zimmermann" <stefan.zimmermann@zimmermann-versicherungen.de>',
                to: 'maklerservice@ergo.de',
                subject: 'Bestands\u00fcbertragung Franke \u2013 ERG-2298765, siehe beigef\u00fcgtes Schreiben',
                date: 'Fri, 10 Jan 2026 08:45:00 +0100',
                body: `Sehr geehrte Damen und Herren,

bez\u00fcglich der Bestands\u00fcbertragung f\u00fcr unsere Kundin Birgit Franke verweise ich auf das beigef\u00fcgte Schreiben.

Gew\u00fcnschtes \u00dcbertragungsdatum: 01.03.2026

Bitte um Best\u00e4tigung.

MfG
Stefan Zimmermann`,
                attachments: [{
                    filename: 'Antrag_Bestandsuebertragung_Franke.docx',
                    mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                    data: antrag
                }]
            });
        }
    },
    {
        id: 'antwort_vollmacht_schneider',
        category: 'email-word',
        title: 'Nachreichung Vollmacht \u2013 Schneider',
        description: 'Antwort auf R\u00fcckfrage mit nachgereichter Maklervollmacht (Word).',
        tags: ['EML', 'DOCX', 'Maklervollmacht'],
        filename: '06_Antwort_Vollmacht_Schneider.eml',
        generate() {
            const vollmacht = buildMaklervollmacht(
                'Petra Schneider', '23.11.1985',
                'Lindenweg 8, 40210 D\u00fcsseldorf',
                'Lisa Wagner', 'Wagner Maklerb\u00fcro',
                'D\u00fcsseldorf', '17.01.2026',
                true // unterschrieben
            );
            return createEml({
                from: '"Lisa Wagner" <lisa.wagner@wagner-makler.de>',
                to: 'maklerservice@ergo.de',
                subject: 'Re: Fehlende Maklervollmacht – Petra Schneider, ERG-5567891',
                date: 'Fri, 17 Jan 2026 15:10:00 +0100',
                body: `Sehr geehrte Damen und Herren,

vielen Dank f\u00fcr Ihre R\u00fcckmeldung zu unserem Antrag vom 16.01.2026.

Anbei die nachgeforderte Maklervollmacht f\u00fcr Frau Petra Schneider (ERG-5567891, BU-Versicherung).
Gew\u00fcnschtes \u00dcbertragungsdatum: 01.03.2026

Bitte setzen Sie die Bestands\u00fcbertragung nun fort.

Mit freundlichen Gr\u00fc\u00dfen

Lisa Wagner
Wagner Maklerb\u00fcro
Friedrichstr. 22, 40210 D\u00fcsseldorf
Tel.: 0211-7788990`,
                attachments: [{
                    filename: 'Maklervollmacht_Schneider.docx',
                    mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                    data: vollmacht
                }]
            });
        }
    },

    // === Category: E-Mails mit Excel-Anhang ===
    {
        id: 'versicherungsliste_braun',
        category: 'email-excel',
        title: 'Vertragsliste Excel \u2013 Braun',
        description: 'E-Mail mit Excel-Anhang: Liste der zu \u00fcbertragenden Versicherungsscheine.',
        tags: ['EML', 'XLSX', 'Vertragsliste'],
        filename: '07_Vertragsliste_Braun.eml',
        generate() {
            const xlsx = buildVersicherungsliste([
                ['ERG-1122334', 'Wolfgang Huber', 'KFZ', 'ERGO', '01.03.2025', '01.03.2026', '945,00 \u20ac'],
                ['ERG-1122335', 'Wolfgang Huber', 'Hausrat', 'ERGO', '15.06.2025', '15.06.2026', '187,20 \u20ac'],
                ['ERG-2233445', 'Sabine Keller', 'Haftpflicht', 'ERGO', '01.01.2025', '01.01.2026', '124,80 \u20ac'],
                ['ERG-2233446', 'Sabine Keller', 'Unfall', 'ERGO', '01.01.2025', '01.01.2026', '215,40 \u20ac'],
                ['ERG-3344556', 'Michael Baumann', 'Wohngeb\u00e4ude', 'ERGO', '01.07.2025', '01.07.2026', '578,60 \u20ac'],
                ['ERG-3344557', 'Michael Baumann', 'KFZ', 'ERGO', '01.09.2025', '01.09.2026', '1.120,00 \u20ac'],
            ]);
            return createEml({
                from: '"Andreas Braun" <andreas.braun@braun-makler.de>',
                to: 'maklerservice@ergo.de',
                subject: 'Sammelantrag Bestands\u00fcbertragung \u2013 6 Vertr\u00e4ge, siehe Excel-Liste',
                date: 'Mon, 20 Jan 2026 10:30:00 +0100',
                body: `Sehr geehrte Damen und Herren,

in der Anlage finden Sie die Liste der zu \u00fcbertragenden Vertr\u00e4ge f\u00fcr die Bestands\u00fcbertragung.

Es handelt sich um 6 Vertr\u00e4ge von 3 Kunden (Huber, Keller, Baumann).
Gew\u00fcnschtes \u00dcbertragungsdatum: 01.03.2026

Die Maklervollmachten f\u00fcr alle genannten Kunden liegen bereits vor und wurden am 15.01.2026 per Post \u00fcbermittelt.

Bitte best\u00e4tigen Sie die \u00dcbertragung je Vertrag.

Mit freundlichen Gr\u00fc\u00dfen

Andreas Braun
Braun Versicherungsmakler
K\u00f6lner Str. 78, 53111 Bonn
Tel.: 0228-6654321`,
                attachments: [{
                    filename: 'Vertragsliste_Bestandsuebertragung.xlsx',
                    mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                    data: xlsx
                }]
            });
        }
    },
    {
        id: 'kundenliste_schmidt',
        category: 'email-excel',
        title: 'Kundenliste Excel \u2013 Schmidt',
        description: 'E-Mail mit Kundenliste als Excel-Anhang f\u00fcr Massen\u00fcbertragung.',
        tags: ['EML', 'XLSX', 'Kundenliste'],
        filename: '08_Kundenliste_Schmidt.eml',
        generate() {
            const xlsx = buildKundenliste([
                ['Weber, Christine', 'Bachstr. 5, 40215 D\u00fcsseldorf', '14.08.1972', 'ERG-4512378', 'Leben', 'best\u00e4tigt', 'Sandra Schmidt'],
                ['Hofmann, Klaus', 'Ringstr. 12, 40213 D\u00fcsseldorf', '03.02.1965', 'ERG-4512490', 'KFZ', 'angefragt', 'Sandra Schmidt'],
                ['Lehmann, Anna', 'Gartenweg 3, 40225 D\u00fcsseldorf', '19.11.1988', 'ERG-4523001', 'Haftpflicht', 'angefragt', 'Sandra Schmidt'],
                ['Richter, Peter', 'Am Markt 7, 40212 D\u00fcsseldorf', '07.06.1958', 'ERG-4530022', 'Hausrat', 'in Bearbeitung', 'Sandra Schmidt'],
                ['Danzig, Sabine', 'Waldstr. 19, 40229 D\u00fcsseldorf', '25.09.1991', 'ERG-4534100', 'BU', 'angefragt', 'Sandra Schmidt'],
            ]);
            return createEml({
                from: '"Sandra Schmidt" <sandra.schmidt@schmidt-makler.de>',
                to: 'maklerservice@ergo.de',
                subject: 'Bestandsübertragung – Kundenliste Schmidt Maklerbüro',
                date: 'Tue, 21 Jan 2026 09:00:00 +0100',
                body: `Sehr geehrte Damen und Herren,

anbei übersende ich Ihnen unsere aktuelle Kundenliste für die laufenden Bestandsübertragungen.

Die Excel-Datei enth\u00e4lt 5 Kunden mit den jeweiligen Vertragsdaten und dem aktuellen Status.
Gew\u00fcnschtes \u00dcbertragungsdatum: 01.03.2026

F\u00fcr die Kunden Weber und Richter liegen die Maklervollmachten bereits vor.
Für Hofmann, Lehmann und Danzig folgen diese in den nächsten Tagen.

Bei Rückfragen stehe ich gerne zur Verfügung.

Mit freundlichen Grüßen

Sandra Schmidt
Schmidt Maklerbüro
Königsallee 45, 40215 Düsseldorf
Tel.: 0211-3344556`,
                attachments: [{
                    filename: 'Kundenliste_Schmidt_Makler.xlsx',
                    mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                    data: xlsx
                }]
            });
        }
    },

    // === Category: Komplexe E-Mails (mehrere Anhänge) ===
    {
        id: 'komplett_huber',
        category: 'email-complex',
        title: 'Komplett-Paket \u2013 Huber (3 Anh\u00e4nge)',
        description: 'E-Mail mit Maklervollmacht (Word), Vertragsliste (Excel) und Antrag (Word).',
        tags: ['EML', 'DOCX', 'XLSX', 'Komplett'],
        filename: '09_Komplett_Huber.eml',
        generate() {
            const vollmacht = buildMaklervollmacht(
                'Wolfgang Huber', '30.07.1970',
                'Mozartstr. 15, 53115 Bonn',
                'Andreas Braun', 'Braun Versicherungsmakler',
                'Bonn', '18.01.2026',
                true // unterschrieben
            );
            const antrag = buildAntragSchreiben(
                'ERGO Versicherung AG',
                'Andreas Braun', 'Braun Versicherungsmakler',
                'Wolfgang Huber', 'ERG-8876543', 'KFZ + Hausrat',
                '20.01.2026'
            );
            const xlsx = buildVersicherungsliste([
                ['ERG-8876543', 'Wolfgang Huber', 'KFZ', 'ERGO', '01.04.2025', '01.04.2026', '892,50 \u20ac'],
                ['ERG-8876544', 'Wolfgang Huber', 'Hausrat', 'ERGO', '01.04.2025', '01.04.2026', '156,00 \u20ac'],
                ['ERG-8876545', 'Wolfgang Huber', 'Haftpflicht', 'ERGO', '01.04.2025', '01.04.2026', '98,40 \u20ac'],
            ]);
            return createEml({
                from: '"Andreas Braun" <andreas.braun@braun-makler.de>',
                to: 'maklerservice@ergo.de',
                subject: 'Bestands\u00fcbertragung Wolfgang Huber \u2013 Vollst\u00e4ndige Unterlagen',
                date: 'Mon, 20 Jan 2026 14:00:00 +0100',
                body: `Sehr geehrte Damen und Herren,

anbei \u00fcbersende ich Ihnen die vollst\u00e4ndigen Unterlagen zur Bestands\u00fcbertragung f\u00fcr unseren Kunden Wolfgang Huber:

1. Maklervollmacht (unterschrieben)
2. Formeller Antrag auf Bestands\u00fcbertragung
3. Vertragsliste mit allen betroffenen Vertr\u00e4gen

Es handelt sich um 3 Vertr\u00e4ge (KFZ, Hausrat, Haftpflicht).

Gew\u00fcnschtes \u00dcbertragungsdatum: 01.03.2026

Bitte best\u00e4tigen Sie die \u00dcbertragung f\u00fcr alle Vertr\u00e4ge.

Mit freundlichen Gr\u00fc\u00dfen

Andreas Braun
Braun Versicherungsmakler
K\u00f6lner Str. 78, 53111 Bonn`,
                attachments: [
                    {
                        filename: 'Maklervollmacht_Huber.docx',
                        mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                        data: vollmacht
                    },
                    {
                        filename: 'Antrag_Bestandsuebertragung_Huber.docx',
                        mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                        data: antrag
                    },
                    {
                        filename: 'Vertragsliste_Huber.xlsx',
                        mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                        data: xlsx
                    }
                ]
            });
        }
    },
    {
        id: 'excel_und_vollmacht_keller',
        category: 'email-complex',
        title: 'Excel + Vollmacht (NICHT unterschrieben) \u2013 Keller',
        description: 'E-Mail mit Kundenliste (Excel) und Maklervollmacht (Word) \u2013 Vollmacht ist NICHT unterschrieben.',
        tags: ['EML', 'DOCX', 'XLSX', 'Ohne Unterschrift'],
        filename: '10_Excel_Vollmacht_Keller.eml',
        generate() {
            const vollmacht = buildMaklervollmacht(
                'Sabine Keller', '15.03.1982',
                'Rheinuferstr. 30, 53113 Bonn',
                'Andreas Braun', 'Braun Versicherungsmakler',
                'Bonn', '19.01.2026',
                false // NICHT unterschrieben
            );
            const xlsx = buildVersicherungsliste([
                ['ERG-2233445', 'Sabine Keller', 'Haftpflicht', 'ERGO', '01.01.2025', '01.01.2026', '124,80 \u20ac'],
                ['ERG-2233446', 'Sabine Keller', 'Unfall', 'ERGO', '01.01.2025', '01.01.2026', '215,40 \u20ac'],
            ]);
            return createEml({
                from: '"Andreas Braun" <andreas.braun@braun-makler.de>',
                to: 'maklerservice@ergo.de',
                subject: 'Bestands\u00fcbertragung Keller \u2013 Vollmacht + Vertragsliste',
                date: 'Mon, 20 Jan 2026 11:15:00 +0100',
                body: `Sehr geehrte Damen und Herren,

f\u00fcr unsere Kundin Sabine Keller beantragen wir die \u00dcbertragung der in der Anlage aufgef\u00fchrten Vertr\u00e4ge (Haftpflicht und Unfall).

Gew\u00fcnschtes \u00dcbertragungsdatum: 15.02.2026

Anbei:
- Maklervollmacht
- Vertragsliste mit den betroffenen Versicherungen

Bitte um Best\u00e4tigung.

MfG
Andreas Braun`,
                attachments: [
                    {
                        filename: 'Maklervollmacht_Keller.docx',
                        mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                        data: vollmacht
                    },
                    {
                        filename: 'Vertragsliste_Keller.xlsx',
                        mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                        data: xlsx
                    }
                ]
            });
        }
    },

    // === Category: Edge-Cases (fehlende Daten / Sonderf\u00e4lle) ===
    {
        id: 'vollmacht_ohne_vsnr_bergmann',
        category: 'email-edge',
        title: 'MV vorhanden, VS-Nr fehlt \u2013 Bergmann',
        description: 'Unterschriebene Maklervollmacht als Anhang, aber keine Versicherungsnummer im Text.',
        tags: ['EML', 'DOCX', 'Maklervollmacht', 'VS-Nr fehlt'],
        filename: '11_Vollmacht_Ohne_VSNr_Bergmann.eml',
        generate() {
            const vollmacht = buildMaklervollmacht(
                'Karl Bergmann', '08.04.1969',
                'Schillerstr. 14, 51065 K\u00f6ln',
                'Petra Hartmann', 'Hartmann Versicherungsdienst',
                'K\u00f6ln', '12.01.2026',
                true // unterschrieben
            );
            return createEml({
                from: '"Petra Hartmann" <petra.hartmann@hartmann-versicherungen.de>',
                to: 'maklerservice@ergo.de',
                subject: 'Bestands\u00fcbertragung Karl Bergmann \u2013 Maklervollmacht anbei',
                date: 'Mon, 13 Jan 2026 08:30:00 +0100',
                body: `Sehr geehrte Damen und Herren,

anbei erhalten Sie die unterschriebene Maklervollmacht f\u00fcr unseren Kunden Karl Bergmann.

Bitte \u00fcbertragen Sie seinen KFZ-Vertrag bei der ERGO in unseren Maklerbestand.

Die Maklervollmacht ist dem Schreiben beigef\u00fcgt.

Gew\u00fcnschtes \u00dcbertragungsdatum: 01.03.2026

Mit freundlichen Gr\u00fc\u00dfen

Petra Hartmann
Hartmann Versicherungsdienst
M\u00fclheimer Str. 22, 51065 K\u00f6ln
Tel.: 0221-4488770`,
                attachments: [{
                    filename: 'Maklervollmacht_Bergmann.docx',
                    mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                    data: vollmacht
                }]
            });
        }
    },
    {
        id: 'teilweise_danzig',
        category: 'email-edge',
        title: 'Teilweise vollst\u00e4ndig \u2013 Danzig (Haftpflicht + Unfall)',
        description: 'Haftpflicht mit VS-Nr vollst\u00e4ndig, Unfall ohne VS-Nr \u2013 teilweise vollst\u00e4ndig.',
        tags: ['EML', 'DOCX', 'VS-Nr fehlt', 'Teilweise'],
        filename: '12_Teilweise_Danzig.eml',
        generate() {
            const vollmacht = buildMaklervollmacht(
                'Sabine Danzig', '25.09.1991',
                'Waldstr. 19, 40229 D\u00fcsseldorf',
                'J\u00fcrgen Becker', 'Becker & Partner Makler',
                'D\u00fcsseldorf', '14.01.2026',
                true // unterschrieben
            );
            return createEml({
                from: '"J\u00fcrgen Becker" <juergen.becker@becker-partner.de>',
                to: 'maklerservice@ergo.de',
                subject: 'Bestands\u00fcbertragung Danzig \u2013 Haftpflicht und Unfall',
                date: 'Wed, 15 Jan 2026 10:45:00 +0100',
                body: `Sehr geehrte Damen und Herren,

f\u00fcr unsere Kundin Sabine Danzig beantragen wir die \u00dcbertragung folgender Vertr\u00e4ge:

1. Haftpflichtversicherung, VS-Nr. ERG-4534201
   Gew\u00fcnschtes \u00dcbertragungsdatum: 01.04.2026

2. Unfallversicherung
   Gew\u00fcnschtes \u00dcbertragungsdatum: 01.04.2026
   Die Versicherungsnummer liegt uns aktuell leider nicht vor. Frau Danzig wird diese nachreichen.

Die unterschriebene Maklervollmacht liegt bei.

Mit freundlichen Gr\u00fc\u00dfen

J\u00fcrgen Becker
Becker & Partner Makler
Graf-Adolf-Str. 88, 40210 D\u00fcsseldorf
Tel.: 0211-9912345`,
                attachments: [{
                    filename: 'Maklervollmacht_Danzig.docx',
                    mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                    data: vollmacht
                }]
            });
        }
    },
    {
        id: 'ohne_datum_lange',
        category: 'email-edge',
        title: 'Kein G\u00fcltigkeitsdatum \u2013 Lange',
        description: 'Anfrage ohne gew\u00fcnschtes \u00dcbertragungsdatum, Vollmacht vorhanden.',
        tags: ['EML', 'DOCX', 'Datum fehlt'],
        filename: '13_Ohne_Datum_Lange.eml',
        generate() {
            const vollmacht = buildMaklervollmacht(
                'Herbert Lange', '17.12.1955',
                'Beethovenstr. 3, 53113 Bonn',
                'Claudia Stein', 'Stein Finanzberatung',
                'Bonn', '10.01.2026',
                true // unterschrieben
            );
            return createEml({
                from: '"Claudia Stein" <claudia.stein@stein-finanz.de>',
                to: 'maklerservice@ergo.de',
                subject: 'Bestands\u00fcbertragung Wohngeb\u00e4ude \u2013 Herbert Lange, ERG-7710234',
                date: 'Fri, 10 Jan 2026 16:20:00 +0100',
                body: `Sehr geehrte Damen und Herren,

unser Kunde Herbert Lange m\u00f6chte seinen Wohngeb\u00e4udevertrag (ERG-7710234) in unseren Maklerbestand \u00fcbertragen lassen.

Anbei die unterschriebene Maklervollmacht.

Bitte leiten Sie die \u00dcbertragung in die Wege.

Mit freundlichen Gr\u00fc\u00dfen

Claudia Stein
Stein Finanzberatung
Adenauerallee 10, 53113 Bonn
Tel.: 0228-5567788`,
                attachments: [{
                    filename: 'Maklervollmacht_Lange.docx',
                    mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                    data: vollmacht
                }]
            });
        }
    },

    // === Category: Vollst\u00e4ndige Neuvorg\u00e4nge ===
    {
        id: 'komplett_kraus',
        category: 'email-word',
        title: 'Komplett Anfrage \u2013 Kraus (Rechtsschutz)',
        description: 'Vollst\u00e4ndige Anfrage mit Maklervollmacht: VS-Nr, Sparte, Datum.',
        tags: ['EML', 'DOCX', 'Maklervollmacht', 'Vollst\u00e4ndig'],
        filename: '14_Komplett_Kraus.eml',
        generate() {
            const vollmacht = buildMaklervollmacht(
                'Doris Kraus', '22.06.1974',
                'Kaiserstr. 55, 53113 Bonn',
                'Markus Reuter', 'Reuter Maklerb\u00fcro',
                'Bonn', '08.01.2026',
                true
            );
            return createEml({
                from: '"Markus Reuter" <markus.reuter@reuter-makler.de>',
                to: 'maklerservice@ergo.de',
                subject: 'Bestands\u00fcbertragung Rechtsschutz \u2013 Doris Kraus, ERG-9012345',
                date: 'Fri, 10 Jan 2026 09:05:00 +0100',
                body: `Sehr geehrte Damen und Herren,

hiermit beantragen wir die Bestands\u00fcbertragung f\u00fcr:

Versicherungsnehmer: Doris Kraus
Versicherungsnummer: ERG-9012345
Sparte: Rechtsschutzversicherung
Gew\u00fcnschtes \u00dcbertragungsdatum: 01.02.2026

Die unterschriebene Maklervollmacht finden Sie im Anhang.

Bitte best\u00e4tigen Sie die \u00dcbertragung.

Mit freundlichen Gr\u00fc\u00dfen

Markus Reuter
Reuter Maklerb\u00fcro
Poppelsdorfer Allee 30, 53115 Bonn
Tel.: 0228-3344221`,
                attachments: [{
                    filename: 'Maklervollmacht_Kraus.docx',
                    mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                    data: vollmacht
                }]
            });
        }
    },
    {
        id: 'komplett_winter',
        category: 'email-word',
        title: 'Komplett Anfrage \u2013 Winter (Leben)',
        description: 'Vollst\u00e4ndige Anfrage Lebensversicherung mit MV.',
        tags: ['EML', 'DOCX', 'Maklervollmacht', 'Vollst\u00e4ndig'],
        filename: '15_Komplett_Winter.eml',
        generate() {
            const vollmacht = buildMaklervollmacht(
                'Gerhard Winter', '03.11.1960',
                'Bonner Str. 120, 50677 K\u00f6ln',
                'Eva Lorenz', 'Lorenz Versicherungsmakler',
                'K\u00f6ln', '09.01.2026',
                true
            );
            return createEml({
                from: '"Eva Lorenz" <eva.lorenz@lorenz-makler.de>',
                to: 'maklerservice@ergo.de',
                subject: 'Bestands\u00fcbertragung Lebensversicherung \u2013 Gerhard Winter, ERG-6678901',
                date: 'Thu, 09 Jan 2026 14:50:00 +0100',
                body: `Sehr geehrte Damen und Herren,

hiermit beantrage ich die \u00dcbertragung des folgenden Vertrags in meinen Maklerbestand:

Versicherungsnehmer: Gerhard Winter
Versicherungsnummer: ERG-6678901
Sparte: Kapitallebensversicherung
Gew\u00fcnschtes \u00dcbertragungsdatum: 01.03.2026

Die Maklervollmacht mit Unterschrift des Kunden liegt als Anhang bei.

Vielen Dank f\u00fcr die z\u00fcgige Bearbeitung.

Mit freundlichen Gr\u00fc\u00dfen

Eva Lorenz
Lorenz Versicherungsmakler
S\u00fclzburgstr. 45, 50937 K\u00f6ln
Tel.: 0221-7723456`,
                attachments: [{
                    filename: 'Maklervollmacht_Winter.docx',
                    mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                    data: vollmacht
                }]
            });
        }
    },
    {
        id: 'komplett_engel',
        category: 'email-word',
        title: 'Komplett Anfrage \u2013 Engel (Unfall)',
        description: 'Vollst\u00e4ndige Anfrage Unfallversicherung mit MV.',
        tags: ['EML', 'DOCX', 'Maklervollmacht', 'Vollst\u00e4ndig'],
        filename: '16_Komplett_Engel.eml',
        generate() {
            const vollmacht = buildMaklervollmacht(
                'Susanne Engel', '28.02.1987',
                'Am Rheinufer 7, 40213 D\u00fcsseldorf',
                'Frank Nowak', 'Nowak Versicherungsservice',
                'D\u00fcsseldorf', '11.01.2026',
                true
            );
            return createEml({
                from: '"Frank Nowak" <frank.nowak@nowak-versicherung.de>',
                to: 'maklerservice@ergo.de',
                subject: 'Bestands\u00fcbertragung Unfall \u2013 Susanne Engel, ERG-5543210',
                date: 'Mon, 13 Jan 2026 11:30:00 +0100',
                body: `Sehr geehrte Damen und Herren,

f\u00fcr unsere Kundin beantragen wir die Bestands\u00fcbertragung:

Versicherungsnehmer: Susanne Engel
Versicherungsnummer: ERG-5543210
Sparte: Unfallversicherung
Gew\u00fcnschtes \u00dcbertragungsdatum: 15.02.2026

Die Maklervollmacht von Frau Engel finden Sie anbei.

Bitte um Best\u00e4tigung.

Frank Nowak
Nowak Versicherungsservice
Schadowstr. 60, 40212 D\u00fcsseldorf
Tel.: 0211-8867543`,
                attachments: [{
                    filename: 'Maklervollmacht_Engel.docx',
                    mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                    data: vollmacht
                }]
            });
        }
    },
    {
        id: 'komplett_sammel_otto_sommer',
        category: 'email-complex',
        title: 'Sammel\u00fcbertragung \u2013 Otto + Sommer (2 VN)',
        description: 'Ein Makler beantragt \u00dcbertragungen f\u00fcr 2 verschiedene Versicherungsnehmer. Beide MVs vorhanden.',
        tags: ['EML', 'DOCX', 'XLSX', '2 VN', 'Vollst\u00e4ndig'],
        filename: '17_Sammel_Otto_Sommer.eml',
        generate() {
            const vollmachtOtto = buildMaklervollmacht(
                'Thomas Otto', '14.09.1976',
                'Danziger Str. 8, 40477 D\u00fcsseldorf',
                'Birgit Feld', 'Feld Finanzberatung',
                'D\u00fcsseldorf', '13.01.2026',
                true
            );
            const vollmachtSommer = buildMaklervollmacht(
                'Karin Sommer', '02.05.1983',
                'Rethelstr. 22, 40237 D\u00fcsseldorf',
                'Birgit Feld', 'Feld Finanzberatung',
                'D\u00fcsseldorf', '13.01.2026',
                true
            );
            const xlsx = buildVersicherungsliste([
                ['ERG-8834001', 'Thomas Otto', 'Hausrat', 'ERGO', '01.06.2025', '01.06.2026', '134,40 \u20ac'],
                ['ERG-8834002', 'Karin Sommer', 'KFZ', 'ERGO', '01.03.2025', '01.03.2026', '780,00 \u20ac'],
            ]);
            return createEml({
                from: '"Birgit Feld" <birgit.feld@feld-finanz.de>',
                to: 'maklerservice@ergo.de',
                subject: 'Bestands\u00fcbertragung Otto + Sommer \u2013 Vollmachten + Vertragsliste',
                date: 'Tue, 14 Jan 2026 09:20:00 +0100',
                body: `Sehr geehrte Damen und Herren,

wir beantragen die Bestands\u00fcbertragung f\u00fcr zwei unserer Kunden:

1. Thomas Otto \u2013 Hausratversicherung, ERG-8834001
2. Karin Sommer \u2013 KFZ-Versicherung, ERG-8834002

Gew\u00fcnschtes \u00dcbertragungsdatum f\u00fcr beide: 01.03.2026

Anbei:
- Unterschriebene Maklervollmacht f\u00fcr Herrn Otto
- Unterschriebene Maklervollmacht f\u00fcr Frau Sommer
- Vertragsliste mit beiden Vertr\u00e4gen

Bitte best\u00e4tigen Sie die \u00dcbertragung f\u00fcr beide Kunden.

Mit freundlichen Gr\u00fc\u00dfen

Birgit Feld
Feld Finanzberatung
Nordstr. 12, 40477 D\u00fcsseldorf
Tel.: 0211-5567890`,
                attachments: [
                    {
                        filename: 'Maklervollmacht_Otto.docx',
                        mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                        data: vollmachtOtto
                    },
                    {
                        filename: 'Maklervollmacht_Sommer.docx',
                        mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                        data: vollmachtSommer
                    },
                    {
                        filename: 'Vertragsliste_Otto_Sommer.xlsx',
                        mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                        data: xlsx
                    }
                ]
            });
        }
    },

    // Nachreichung Antrag fuer Schneider (gehoert zu nachreichung_schneider + antwort_vollmacht_schneider)
    {
        id: 'nachreichung_antrag_schneider',
        category: 'email-word',
        title: 'Nachreichung Antrag \u2013 Schneider',
        description: 'Dritte E-Mail im Schneider-Vorgang: Makler schickt unterschriebenen \u00dcbertragungsantrag nach.',
        tags: ['EML', 'DOCX', 'Antrag', 'Nachreichung'],
        filename: '19_Nachreichung_Antrag_Schneider.eml',
        generate() {
            const antrag = buildAntragSchreiben(
                'ERGO Versicherung AG',
                'Lisa Wagner', 'Wagner Maklerb\u00fcro',
                'Petra Schneider', 'ERG-5567891', 'Berufsunf\u00e4higkeit',
                '20.01.2026'
            );
            return createEml({
                from: '"Lisa Wagner" <lisa.wagner@wagner-makler.de>',
                to: 'maklerservice@ergo.de',
                subject: 'Nachtrag: Unterschriebener Antrag \u2013 Petra Schneider, ERG-5567891',
                date: 'Mon, 20 Jan 2026 09:15:00 +0100',
                body: `Sehr geehrte Damen und Herren,

erg\u00e4nzend zu unserer Maklervollmacht vom 17.01.2026 \u00fcbersende ich Ihnen hiermit den unterschriebenen Antrag auf Bestands\u00fcbertragung f\u00fcr:

Versicherungsnehmer: Petra Schneider
Versicherungsnummer: ERG-5567891
Sparte: Berufsunf\u00e4higkeit
Gew\u00fcnschtes \u00dcbertragungsdatum: 01.03.2026

Damit sollten Ihnen nun alle Unterlagen (Antrag + Maklervollmacht) vorliegen.

Mit freundlichen Gr\u00fc\u00dfen

Lisa Wagner
Wagner Maklerb\u00fcro
Friedrichstr. 22, 40210 D\u00fcsseldorf
Tel.: 0211-7788990`,
                attachments: [{
                    filename: 'Antrag_Bestandsuebertragung_Schneider.docx',
                    mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                    data: antrag
                }]
            });
        }
    },

    // Sammel-E-Mail mit 3 Kunden (Bauer, Klein, Wolf)
    {
        id: 'sammel_bauer_klein_wolf',
        category: 'email-complex',
        title: 'Sammel\u00fcbertragung \u2013 Bauer + Klein + Wolf (3 VN)',
        description: 'Ein Makler beantragt \u00dcbertragungen f\u00fcr 3 Kunden in einer E-Mail. Vollmachten + Vertragsliste.',
        tags: ['EML', 'DOCX', 'XLSX', '3 VN', 'Vollst\u00e4ndig'],
        filename: '20_Sammel_Bauer_Klein_Wolf.eml',
        generate() {
            const vollmachtBauer = buildMaklervollmacht(
                'Stefan Bauer', '18.04.1975',
                'Berliner Str. 33, 51063 K\u00f6ln',
                'Hendrik Falk', 'Falk Versicherungsmakler',
                'K\u00f6ln', '10.03.2026',
                true
            );
            const vollmachtKlein = buildMaklervollmacht(
                'Marina Klein', '07.12.1988',
                'Venloer Str. 112, 50823 K\u00f6ln',
                'Hendrik Falk', 'Falk Versicherungsmakler',
                'K\u00f6ln', '10.03.2026',
                true
            );
            const vollmachtWolf = buildMaklervollmacht(
                'J\u00fcrgen Wolf', '21.08.1962',
                'Aachener Str. 5, 50674 K\u00f6ln',
                'Hendrik Falk', 'Falk Versicherungsmakler',
                'K\u00f6ln', '10.03.2026',
                true
            );
            const xlsx = buildVersicherungsliste([
                ['ERG-9901001', 'Stefan Bauer', 'KFZ', 'ERGO', '01.05.2025', '01.05.2026', '1.045,00 \u20ac'],
                ['ERG-9901002', 'Marina Klein', 'Haftpflicht', 'ERGO', '01.01.2025', '01.01.2026', '98,40 \u20ac'],
                ['ERG-9901003', 'J\u00fcrgen Wolf', 'Unfall', 'ERGO', '01.07.2025', '01.07.2026', '245,00 \u20ac'],
            ]);
            return createEml({
                from: '"Hendrik Falk" <hendrik.falk@falk-makler.de>',
                to: 'maklerservice@ergo.de',
                subject: 'Bestands\u00fcbertragungen M\u00e4rz \u2013 3 Kunden (Bauer, Klein, Wolf)',
                date: 'Thu, 12 Mar 2026 08:30:00 +0100',
                body: `Sehr geehrte Damen und Herren,

hiermit beantragen wir die Bestands\u00fcbertragung f\u00fcr folgende drei Kunden:

1. Stefan Bauer \u2013 KFZ-Versicherung, ERG-9901001
2. Marina Klein \u2013 Haftpflichtversicherung, ERG-9901002
3. J\u00fcrgen Wolf \u2013 Unfallversicherung, ERG-9901003

Gew\u00fcnschtes \u00dcbertragungsdatum f\u00fcr alle: 01.04.2026

Anbei:
- 3 unterschriebene Maklervollmachten (je eine pro Kunde)
- Vertragsliste mit allen betroffenen Vertr\u00e4gen

Bitte best\u00e4tigen Sie die \u00dcbertragung f\u00fcr jeden Kunden einzeln.

Mit freundlichen Gr\u00fc\u00dfen

Hendrik Falk
Falk Versicherungsmakler
Hohenzollernring 22, 50672 K\u00f6ln
Tel.: 0221-3345567`,
                attachments: [
                    {
                        filename: 'Maklervollmacht_Bauer.docx',
                        mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                        data: vollmachtBauer
                    },
                    {
                        filename: 'Maklervollmacht_Klein.docx',
                        mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                        data: vollmachtKlein
                    },
                    {
                        filename: 'Maklervollmacht_Wolf.docx',
                        mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                        data: vollmachtWolf
                    },
                    {
                        filename: 'Vertragsliste_Maerz_2026.xlsx',
                        mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                        data: xlsx
                    }
                ]
            });
        }
    },

    // === Category: Standalone Vorlagen ===
    {
        id: 'vorlage_maklervollmacht',
        category: 'template',
        title: 'Maklervollmacht (Vorlage)',
        description: 'Blanko-Vorlage f\u00fcr eine Maklervollmacht als Word-Dokument.',
        tags: ['DOCX', 'Vorlage'],
        filename: 'Maklervollmacht_Vorlage.docx',
        generate() {
            return buildMaklervollmacht(
                '[Vorname Nachname]', '[TT.MM.JJJJ]',
                '[Stra\u00dfe Nr., PLZ Ort]',
                '[Makler-Name]', '[Makler-Firma]',
                '[Ort]', '[TT.MM.JJJJ]'
            );
        }
    },
    {
        id: 'vorlage_versicherungsliste',
        category: 'template',
        title: 'Versicherungsliste (Vorlage)',
        description: 'Excel-Vorlage mit Spalten f\u00fcr VS-Nr, Kunde, Sparte, Versicherer etc.',
        tags: ['XLSX', 'Vorlage'],
        filename: 'Versicherungsliste_Vorlage.xlsx',
        generate() {
            return buildVersicherungsliste([
                ['ERG-XXXXXXX', 'Nachname, Vorname', 'KFZ', 'ERGO', '01.01.2026', '01.01.2027', '0,00 \u20ac'],
            ]);
        }
    },
    {
        id: 'vorlage_antrag',
        category: 'template',
        title: 'Antrag Bestands\u00fcbertragung (Vorlage)',
        description: 'Word-Vorlage f\u00fcr einen formellen Antrag auf Bestands\u00fcbertragung.',
        tags: ['DOCX', 'Vorlage'],
        filename: 'Antrag_Bestandsuebertragung_Vorlage.docx',
        generate() {
            return buildAntragSchreiben(
                '[Versicherungsgesellschaft]',
                '[Makler-Name]', '[Makler-Firma]',
                '[Kundenname]', '[VS-Nr]', '[Sparte]',
                '[TT.MM.JJJJ]'
            );
        }
    },
];

// ============================================================
// Public API
// ============================================================

export function getFileCatalog() {
    return CATALOG.map(({ id, category, title, description, tags, filename }) =>
        ({ id, category, title, description, tags, filename })
    );
}

export function generateFile(fileId) {
    const entry = CATALOG.find(f => f.id === fileId);
    if (!entry) return null;

    const data = entry.generate();
    const isEml = entry.filename.endsWith('.eml');
    const isXlsx = entry.filename.endsWith('.xlsx');
    const mimeType = isEml
        ? 'message/rfc822'
        : isXlsx
            ? 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
            : 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';

    return { data, filename: entry.filename, mimeType };
}

export function downloadFile(fileId) {
    const result = generateFile(fileId);
    if (!result) return false;

    const blob = new Blob([result.data], { type: result.mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = result.filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    return true;
}

export function downloadAll() {
    CATALOG.forEach(entry => {
        setTimeout(() => downloadFile(entry.id), 0);
    });
}
