/**
 * Export Modul - Import/Export Funktionen für Bestandsübertragung
 * ESM Version
 */

import * as Storage from './storage.js';
import * as Matcher from './matcher.js';
import * as Extractor from './extractor.js';

/**
 * Mojibake reparieren (falsch kodierte UTF-8 Zeichen)
 */
export function fixMojibake(text) {
    if (!text) return text;

    // Keys use Unicode escapes to avoid encoding corruption in the source file.
    // Each key is the mojibake sequence (UTF-8 bytes misread as Windows-1252).
    const replacements = {
        '\u00c3\u00a4': '\u00e4',       // Ã¤ → ä
        '\u00c3\u00b6': '\u00f6',       // Ã¶ → ö
        '\u00c3\u00bc': '\u00fc',       // Ã¼ → ü
        '\u00c3\u201e': '\u00c4',       // Ã„ → Ä
        '\u00c3\u2013': '\u00d6',       // Ã– → Ö
        '\u00c3\u0153': '\u00dc',       // Ãœ → Ü
        '\u00c3\u0178': '\u00df',       // ÃŸ → ß
        '\u00e2\u20ac\u201c': '\u2013', // â€" → – (en-dash)
        '\u00e2\u20ac\u201d': '\u2014', // â€" → — (em-dash)
        '\u00e2\u20ac\u0153': '\u201c', // â€œ → " (left double quote)
        '\u00e2\u20ac\u009d': '\u201d', // â€\x9d → " (right double quote)
        '\u00e2\u20ac\u02dc': '\u2018', // â€˜ → ' (left single quote)
        '\u00e2\u20ac\u2122': '\u2019', // â€™ → ' (right single quote)
        '\u00e2\u20ac\u00a6': '\u2026', // â€¦ → … (ellipsis)
        '\u00c3\u00a9': '\u00e9',       // Ã© → é
        '\u00c3\u00a8': '\u00e8',       // Ã¨ → è
        '\u00c3\u00aa': '\u00ea',       // Ãª → ê
        '\u00c3\u00a0': '\u00e0',       // Ã  → à
        '\u00c3\u00a2': '\u00e2',       // Ã¢ → â
        '\u00c3\u00a7': '\u00e7',       // Ã§ → ç
        '\u00e2\u201a\u00ac': '\u20ac'  // â‚¬ → €
    };

    let fixed = text;
    for (const [wrong, correct] of Object.entries(replacements)) {
        fixed = fixed.split(wrong).join(correct);
    }

    return fixed;
}

/**
 * E-Mail-Objekt Encoding reparieren
 */
export function fixEmailEncoding(email) {
    if (!email) return email;

    return {
        ...email,
        subject: fixMojibake(email.subject),
        bodyPlain: fixMojibake(email.bodyPlain),
        body: fixMojibake(email.body),
        senderName: fixMojibake(email.senderName),
        senderEmail: email.senderEmail,
        recipientName: fixMojibake(email.recipientName),
        recipientEmail: email.recipientEmail
    };
}

/**
 * Datums-String für Dateiname formatieren
 */
export function formatDateForFilename(date) {
    const d = date || new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const hour = String(d.getHours()).padStart(2, '0');
    const min = String(d.getMinutes()).padStart(2, '0');
    return `${year}${month}${day}_${hour}${min}`;
}

/**
 * ISO-Datum zu deutschem Format konvertieren
 */
function formatGermanDate(isoDate) {
    if (!isoDate) return '';
    try {
        const date = new Date(isoDate);
        if (isNaN(date.getTime())) return isoDate;
        return `${String(date.getDate()).padStart(2, '0')}.${String(date.getMonth() + 1).padStart(2, '0')}.${date.getFullYear()}`;
    } catch (e) {
        return isoDate;
    }
}

/**
 * CSV-Export für Robotics
 */
export function exportToCSV(cases, filename) {
    const headers = [
        'ID',
        'Kunde',
        'VS-Nr',
        'Sparte',
        'Status',
        'Gültig ab',
        'Makler',
        'Makler E-Mail',
        'Notizen',
        'Mails',
        'Erstellt',
        'Aktualisiert'
    ];

    const rows = cases.map(c => {
        const gueltigDatum = c.gueltigkeitsdatum?.value || '';
        // Wenn es im ISO-Format ist, zu deutschem Format konvertieren
        const formattedDatum = gueltigDatum.includes('-') ?
            formatGermanDate(gueltigDatum) : gueltigDatum;

        return [
            c.id,
            c.kunde?.name || '',
            c.versicherungsnummer?.value || '',
            c.sparte || '',
            c.status || '',
            formattedDatum,
            c.makler?.name || '',
            c.makler?.email || '',
            (c.notes || '').replace(/[\r\n]+/g, ' '),
            c.messages?.length || 0,
            formatGermanDate(c.createdAt),
            formatGermanDate(c.updatedAt)
        ];
    });

    // CSV mit BOM für Excel
    const BOM = '\uFEFF';
    const csvContent = BOM + [
        headers.join(';'),
        ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(';'))
    ].join('\r\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = filename || `bestand_export_${formatDateForFilename(new Date())}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    return rows.length;
}

/**
 * Vollständiger JSON-Export (Backup)
 */
export function exportToJSON(filename) {
    const data = Storage.exportData();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = filename || `bestand_backup_${formatDateForFilename(new Date())}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    return true;
}

/**
 * JSON-Datei importieren
 */
export function importFromJSON(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = (e) => {
            try {
                const data = JSON.parse(e.target.result);

                // Backup-Format erkennen
                if (data.cases && data.exportDate) {
                    Storage.importData(data);
                    resolve({ type: 'backup', data: data });
                }
                // Outlook Export Format
                else if (data.conversations || data.emails) {
                    resolve({ type: 'outlook', data: data });
                }
                else {
                    reject(new Error('Unbekanntes Dateiformat'));
                }
            } catch (err) {
                reject(new Error('Fehler beim Parsen der JSON-Datei: ' + err.message));
            }
        };

        reader.onerror = () => {
            reject(new Error('Fehler beim Lesen der Datei'));
        };

        reader.readAsText(file, 'UTF-8');
    });
}

/**
 * Outlook-Export verarbeiten
 */
export function processOutlookExport(data) {
    const results = {
        processed: 0,
        created: 0,
        matched: 0,
        errors: 0,
        skipped: 0
    };

    const cases = Storage.getCasesArray();
    let emails = [];

    // Conversations-Format (gruppiert)
    if (data.conversations && Array.isArray(data.conversations)) {
        data.conversations.forEach(conv => {
            if (conv.emails && Array.isArray(conv.emails)) {
                conv.emails.forEach(email => {
                    email.conversationID = conv.conversationID || email.conversationID;
                    emails.push(fixEmailEncoding(email));
                });
            }
        });
    }
    // Flaches E-Mail-Format
    else if (data.emails && Array.isArray(data.emails)) {
        emails = data.emails.map(e => fixEmailEncoding(e));
    }

    // Nach Conversation-ID gruppieren
    const conversationGroups = {};
    emails.forEach(email => {
        const convId = email.conversationID || email.entryID;
        if (!conversationGroups[convId]) {
            conversationGroups[convId] = [];
        }
        conversationGroups[convId].push(email);
    });

    // Jede Konversation verarbeiten
    Object.values(conversationGroups).forEach(convEmails => {
        results.processed += convEmails.length;

        // Bereits verarbeitet?
        const allProcessed = convEmails.every(e => Storage.isMessageProcessed(e.entryID));
        if (allProcessed) {
            results.skipped += convEmails.length;
            return;
        }

        // Matching versuchen
        const primaryEmail = convEmails[0];
        const matchResult = Matcher.findMatches(primaryEmail, cases);

        if (matchResult.autoAssign && matchResult.bestMatch) {
            // Zu existierendem Vorgang hinzufügen
            try {
                Storage.addMessagesToCase(matchResult.bestMatch.caseId, convEmails);
                Storage.markMessagesProcessed(convEmails.map(e => e.entryID));
                results.matched += convEmails.length;
            } catch (e) {
                console.error('Fehler beim Zuordnen:', e);
                results.errors++;
            }
        } else {
            // Neuen Vorgang erstellen
            try {
                const newCase = Matcher.createCaseFromEmail(primaryEmail, convEmails);
                if (newCase) {
                    results.created++;
                    // Zur lokalen Cases-Liste hinzufügen für weitere Matches
                    cases.push(newCase);
                }
            } catch (e) {
                console.error('Fehler beim Erstellen:', e);
                results.errors++;
            }
        }
    });

    return results;
}

/**
 * Text-Report generieren
 */
export function generateReport() {
    const stats = Storage.getDetailedStats();
    const cases = Storage.getCasesArray();

    const lines = [
        '=== BESTANDSÜBERTRAGUNG REPORT ===',
        `Datum: ${new Date().toLocaleDateString('de-DE')}`,
        '',
        '--- ÜBERSICHT ---',
        `Vorgänge gesamt: ${stats.total}`,
        `Exportiert: ${stats.exportiert}`,
        `Export-Bereit: ${stats.exportReady}`,
        '',
        '--- WORKFLOW ---',
        `Mail erhalten: ${stats.byWorkflow.mailReceived}`,
        `Importiert: ${stats.byWorkflow.mailUploaded}`,
        `KI erkannt: ${stats.byWorkflow.kiRecognized}`,
        `PV validiert: ${stats.byWorkflow.pvValidated}`,
        `Exportiert: ${stats.byWorkflow.exported}`,
        '',
        '--- SPARTEN ---'
    ];

    const spartenStats = Storage.getSpartenStats();
    spartenStats.forEach(s => {
        lines.push(`${s.sparte}: ${s.count}`);
    });

    lines.push('');
    lines.push('--- MAKLER TOP 10 ---');

    const maklerStats = Storage.getMaklerStats().slice(0, 10);
    maklerStats.forEach((m, i) => {
        lines.push(`${i + 1}. ${m.name}: ${m.total} Vorgänge (${m.bestaetigt} bestätigt)`);
    });

    return lines.join('\n');
}

/**
 * Report als Textdatei herunterladen
 */
export function downloadReport() {
    const report = generateReport();
    const blob = new Blob([report], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = `bestand_report_${formatDateForFilename(new Date())}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    return true;
}

// Default export
export default {
    exportToCSV,
    exportToJSON,
    importFromJSON,
    processOutlookExport,
    generateReport,
    downloadReport,
    formatDateForFilename,
    fixMojibake,
    fixEmailEncoding
};
