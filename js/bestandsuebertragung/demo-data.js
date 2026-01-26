/**
 * Demo Data Modul - Generierung von Testdaten für Bestandsübertragung
 * ESM Version
 */

import * as Storage from './storage.js';

// Makler-Stammdaten (realistisch)
export const MAKLER_POOL = [
    { name: 'Thomas Meier', email: 'thomas.meier@meier-makler.de' },
    { name: 'Sandra Müller', email: 'mueller@vsm-versicherung.de' },
    { name: 'Michael Schmidt', email: 'm.schmidt@schmidt-finanz.de' },
    { name: 'Andrea Weber', email: 'weber@finanzkonzepte.de' },
    { name: 'Stefan Bauer', email: 'bauer@makler-bauer.de' },
    { name: 'Christine Fischer', email: 'c.fischer@fischer-makler.de' },
    { name: 'Peter Wagner', email: 'pwagner@vfb-versicherung.de' },
    { name: 'Sabine Koch', email: 'koch@skv-makler.de' },
    { name: 'Klaus Becker', email: 'becker@becker-assekuranz.de' },
    { name: 'Martina Hoffmann', email: 'hoffmann@mh-versicherungen.de' },
    { name: 'Frank Schulz', email: 'schulz@schulz-makler.de' },
    { name: 'Julia Richter', email: 'j.richter@richter-finanz.de' },
    { name: 'Hans Klein', email: 'klein@kleinmaklerbüro.de' },
    { name: 'Petra Wolf', email: 'p.wolf@wolf-assekuranz.de' },
    { name: 'Ralf Schäfer', email: 'schaefer@rs-versicherungen.de' },
    { name: 'Monika Neumann', email: 'neumann@neumann-makler.de' },
    { name: 'Jürgen Schwarz', email: 'schwarz@jsm-versicherung.de' },
    { name: 'Angelika Braun', email: 'braun@ab-finanzservice.de' },
    { name: 'Werner Zimmermann', email: 'zimmermann@wz-makler.de' },
    { name: 'Elisabeth Hartmann', email: 'hartmann@hartmann-versicherungen.de' }
];

// Sparten
export const SPARTEN = ['KFZ', 'Leben', 'Kranken', 'Haftpflicht', 'Hausrat', 'Rechtsschutz', 'Unfall', 'BU', 'Wohngebäude', 'Rente'];

// Kundennamen-Pool
export const KUNDEN_POOL = [
    'Müller, Hans', 'Schmidt, Peter', 'Schneider, Maria', 'Fischer, Anna',
    'Weber, Thomas', 'Meyer, Julia', 'Wagner, Michael', 'Becker, Sandra',
    'Schulz, Klaus', 'Hoffmann, Petra', 'Koch, Stefan', 'Richter, Sabine',
    'Klein, Frank', 'Wolf, Martina', 'Schröder, Andreas', 'Neumann, Christine',
    'Schwarz, Ralf', 'Zimmermann, Elisabeth', 'Braun, Werner', 'Krüger, Monika',
    'Hartmann, Jürgen', 'Lange, Angelika', 'Schmitt, Bernd', 'Werner, Susanne',
    'Schmitz, Oliver', 'Krause, Birgit', 'Meier, Dieter', 'Lehmann, Karin',
    'Schmid, Wolfgang', 'Schulze, Renate', 'Maier, Heinz', 'Köhler, Ingrid',
    'Herrmann, Manfred', 'König, Ursula', 'Walter, Günter', 'Mayer, Helga',
    'Huber, Roland', 'Kaiser, Gisela', 'Fuchs, Horst', 'Peters, Erika'
];

/**
 * Zufällige VS-Nr generieren
 */
export function generateVsNr() {
    const prefix = 'ERG';
    const num = Math.floor(1000000 + Math.random() * 9000000);
    return `${prefix}-${num}`;
}

/**
 * Zufälliges Datum in Bereich generieren
 */
export function randomDate(start, end) {
    return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

/**
 * Datum formatieren
 */
export function formatDate(date) {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}.${month}.${year}`;
}

/**
 * ISO Datum formatieren
 */
export function formatISODate(date) {
    return date.toISOString();
}

/**
 * Zufälligen Makler wählen
 */
export function randomMakler() {
    return MAKLER_POOL[Math.floor(Math.random() * MAKLER_POOL.length)];
}

/**
 * Zufällige Sparte wählen
 */
export function randomSparte() {
    return SPARTEN[Math.floor(Math.random() * SPARTEN.length)];
}

/**
 * Zufälligen Kundennamen wählen
 */
export function randomKunde() {
    return KUNDEN_POOL[Math.floor(Math.random() * KUNDEN_POOL.length)];
}

/**
 * Realistische E-Mail generieren
 */
export function generateEmail(kunde, vsNr, sparte, makler, type = 'request', receivedDate) {
    const subjects = {
        request: [
            `Bestandsübertragung für ${kunde}`,
            `Antrag auf Bestandsübertragung - ${vsNr}`,
            `${sparte}-Vertrag ${kunde} - Maklerwechsel`,
            `Übertragungsantrag ${vsNr}`
        ],
        confirmation: [
            `Bestätigung Bestandsübertragung ${vsNr}`,
            `Maklerwechsel erfolgreich - ${kunde}`,
            `RE: Bestandsübertragung ${vsNr} wurde durchgeführt`
        ],
        reminder: [
            `Erinnerung: Bestandsübertragung ${kunde}`,
            `Nachfrage zu ${vsNr}`,
            `WG: Bestandsübertragung ausstehend`
        ],
        incomplete: [
            `Fehlende Unterlagen zu ${vsNr}`,
            `Rückfrage zur Bestandsübertragung`,
            `Unterlagen unvollständig - ${kunde}`
        ]
    };

    const bodies = {
        request: `Sehr geehrte Damen und Herren,

hiermit beantrage ich die Übertragung des Vertrages auf mein Maklermandat.

Kundendaten:
- Versicherungsnehmer: ${kunde}
- Versicherungsnummer: ${vsNr}
- Sparte: ${sparte}

Bitte bestätigen Sie mir die Übertragung.

Mit freundlichen Grüßen

${makler.name}
Versicherungsmakler
${makler.email}`,
        confirmation: `Sehr geehrte Damen und Herren,

wir bestätigen hiermit die erfolgreiche Übertragung des Vertrages ${vsNr} auf das Maklermandat von ${makler.name}.

Die Übertragung ist ab sofort wirksam.

Mit freundlichen Grüßen
ERGO Bestandsservice`,
        reminder: `Sehr geehrte Damen und Herren,

ich möchte nachfragen, wie der aktuelle Stand zur Bestandsübertragung für ${kunde} (VS-Nr: ${vsNr}) ist.

Vielen Dank für eine kurze Rückmeldung.

Mit freundlichen Grüßen
${makler.name}`,
        incomplete: `Sehr geehrter Herr ${makler.name.split(' ')[0]},

zur Bearbeitung der Bestandsübertragung für ${kunde} benötigen wir noch folgende Unterlagen:
- Unterschriebene Maklervollmacht
- Ausweiskopie des Versicherungsnehmers

Bitte reichen Sie diese nach.

Mit freundlichen Grüßen
ERGO Bestandsservice`
    };

    const subjectArray = subjects[type] || subjects.request;
    const body = bodies[type] || bodies.request;

    const dateStr = receivedDate
        ? `${String(receivedDate.getDate()).padStart(2, '0')}.${String(receivedDate.getMonth() + 1).padStart(2, '0')}.${receivedDate.getFullYear()} ${String(receivedDate.getHours()).padStart(2, '0')}:${String(receivedDate.getMinutes()).padStart(2, '0')}:00`
        : formatDate(new Date()) + ' 10:30:00';

    return {
        entryID: 'demo-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9),
        conversationID: 'conv-' + vsNr.replace(/[^a-zA-Z0-9]/g, ''),
        subject: subjectArray[Math.floor(Math.random() * subjectArray.length)],
        senderEmail: type === 'confirmation' || type === 'incomplete' ? 'bestand@ergo.de' : makler.email,
        receivedTime: dateStr,
        bodyPlain: body,
        folder: type === 'confirmation' || type === 'incomplete' ? 'inbox' : 'sent'
    };
}

/**
 * Einzelnen Demo-Vorgang erstellen
 */
export function generateDemoCase(status, workflowLevel) {
    const makler = randomMakler();
    const kunde = randomKunde();
    const vsNr = generateVsNr();
    const sparte = randomSparte();

    const now = new Date();
    const created = randomDate(new Date(now - 30 * 24 * 60 * 60 * 1000), now);
    const updated = randomDate(created, now);

    // Gültigkeitsdatum (1-3 Monate in der Zukunft)
    const gueltigDatum = new Date(now.getTime() + (30 + Math.random() * 60) * 24 * 60 * 60 * 1000);

    const workflow = {
        mailReceived: formatISODate(randomDate(new Date(created.getTime() - 2 * 24 * 60 * 60 * 1000), created)),
        mailUploaded: formatISODate(created),
        kiRecognized: workflowLevel >= 1 ? formatISODate(created) : null,
        pvValidated: workflowLevel >= 2 ? formatISODate(randomDate(created, updated)) : null,
        exported: workflowLevel >= 3 ? formatISODate(updated) : null
    };

    const messages = [];

    // Erste Mail (Request)
    messages.push(generateEmail(kunde, vsNr, sparte, makler, 'request', created));

    // Bei weiterem Fortschritt: Bestätigung oder Reminder
    if (workflowLevel >= 2) {
        messages.push(generateEmail(kunde, vsNr, sparte, makler, 'confirmation', updated));
    } else if (status === 'wiedervorlage') {
        messages.push(generateEmail(kunde, vsNr, sparte, makler, 'reminder', updated));
    }

    const statusHistory = [
        { date: formatISODate(created), from: null, to: 'unvollstaendig', note: 'Aus E-Mail erstellt' }
    ];

    if (workflowLevel >= 1) {
        statusHistory.push({ date: formatISODate(created), from: 'unvollstaendig', to: 'zu-validieren', note: 'Automatisch erkannt' });
    }
    if (workflowLevel >= 2) {
        statusHistory.push({ date: formatISODate(updated), from: 'zu-validieren', to: 'export-bereit', note: 'PV validiert' });
    }
    if (workflowLevel >= 3) {
        statusHistory.push({ date: formatISODate(updated), from: 'export-bereit', to: 'abgeschlossen', note: 'Exportiert' });
    }

    return {
        id: Storage.generateId(),
        createdAt: formatISODate(created),
        updatedAt: formatISODate(updated),
        kunde: {
            name: kunde,
            confidence: 0.9 + Math.random() * 0.1,
            source: 'auto'
        },
        versicherungsnummer: {
            value: vsNr,
            confidence: 0.95 + Math.random() * 0.05,
            source: 'auto'
        },
        gueltigkeitsdatum: {
            value: formatDate(gueltigDatum),
            confidence: 0.85 + Math.random() * 0.1,
            source: 'auto'
        },
        versicherer: { name: 'ERGO', confidence: 1.0, source: 'email-domain' },
        makler: makler,
        status: status,
        sparte: sparte,
        notes: '',
        flagged: false,
        workflow: workflow,
        conversationIds: [messages[0].conversationID],
        messageIds: messages.map(m => m.entryID),
        messages: messages,
        statusHistory: statusHistory,
        validationHistory: workflowLevel >= 2 ? [{ date: formatISODate(updated), user: 'Demo', action: 'validiert' }] : [],
        exported: workflowLevel >= 3 ? { date: formatISODate(updated), by: 'Demo-Export' } : null
    };
}

/**
 * Demo-Daten generieren (26 Vorgänge)
 */
export function generateDemoCases() {
    const cases = [];

    // 6 Export-Bereit
    for (let i = 0; i < 6; i++) {
        cases.push(generateDemoCase('export-bereit', 2));
    }

    // 5 Zu-Validieren
    for (let i = 0; i < 5; i++) {
        cases.push(generateDemoCase('zu-validieren', 1));
    }

    // 2 Wiedervorlage
    for (let i = 0; i < 2; i++) {
        const c = generateDemoCase('wiedervorlage', 1);
        c.wiedervorlage = formatDate(new Date(Date.now() + 14 * 24 * 60 * 60 * 1000));
        cases.push(c);
    }

    // 2 Abgeschlossen
    for (let i = 0; i < 2; i++) {
        cases.push(generateDemoCase('abgeschlossen', 3));
    }

    // 3 Unvollständig
    for (let i = 0; i < 3; i++) {
        const c = generateDemoCase('unvollstaendig', 0);
        // Eines ohne VS-Nr
        if (i === 0) {
            c.versicherungsnummer = { value: '', confidence: 0, source: 'manual' };
        }
        // Eines ohne Kunde
        if (i === 1) {
            c.kunde = { name: '', confidence: 0, source: 'manual' };
        }
        cases.push(c);
    }

    // 2 Abgelehnt
    for (let i = 0; i < 2; i++) {
        const c = generateDemoCase('abgelehnt', 2);
        c.status = 'abgelehnt';
        c.rejectReason = i === 0 ? 'Maklervollmacht fehlt' : 'Vertrag bereits gekündigt';
        cases.push(c);
    }

    // 6 aus 2 Sammelmails (je 3 Vorgänge)
    for (let batch = 0; batch < 2; batch++) {
        const batchMakler = randomMakler();
        const batchSparte = randomSparte();
        const linkedIds = [];

        for (let i = 0; i < 3; i++) {
            const c = generateDemoCase('zu-validieren', 1);
            c.makler = batchMakler;
            c.sparte = batchSparte;
            linkedIds.push(c.id);
            cases.push(c);
        }

        // Verknüpfungen setzen
        linkedIds.forEach((id, idx) => {
            const c = cases.find(c => c.id === id);
            if (c) {
                c.linkedCaseIds = linkedIds.filter(lid => lid !== id);
                c.sourceEmailId = 'sammelmail-' + batch;
            }
        });
    }

    return cases;
}

/**
 * Demo-Daten laden
 */
export function loadDemoData(force = false) {
    const settings = Storage.getSettings();

    if (settings.demoLoaded && !force) {
        return false;
    }

    if (force) {
        Storage.clearAll();
    }

    const cases = generateDemoCases();
    const casesObj = {};
    cases.forEach(c => {
        casesObj[c.id] = c;
    });

    Storage.saveCases(casesObj);
    Storage.saveSettings({ demoLoaded: true });

    return true;
}

/**
 * Export-JSON mit 1000 E-Mails generieren
 */
export function generateDemoExportJSON() {
    const conversations = [];

    for (let i = 0; i < 800; i++) {
        const makler = randomMakler();
        const kunde = randomKunde();
        const vsNr = generateVsNr();
        const sparte = randomSparte();

        const receivedDate = randomDate(new Date(Date.now() - 90 * 24 * 60 * 60 * 1000), new Date());

        conversations.push({
            conversationID: 'conv-' + i + '-' + Math.random().toString(36).substr(2, 6),
            emails: [generateEmail(kunde, vsNr, sparte, makler, 'request', receivedDate)]
        });
    }

    // 200 Reminder/Rückfragen
    for (let i = 0; i < 200; i++) {
        const makler = randomMakler();
        const kunde = randomKunde();
        const vsNr = generateVsNr();
        const sparte = randomSparte();

        const receivedDate = randomDate(new Date(Date.now() - 60 * 24 * 60 * 60 * 1000), new Date());

        conversations.push({
            conversationID: 'conv-reminder-' + i + '-' + Math.random().toString(36).substr(2, 6),
            emails: [
                generateEmail(kunde, vsNr, sparte, makler, 'request', new Date(receivedDate.getTime() - 7 * 24 * 60 * 60 * 1000)),
                generateEmail(kunde, vsNr, sparte, makler, 'reminder', receivedDate)
            ]
        });
    }

    return {
        exportDate: new Date().toISOString(),
        source: 'Demo-Generator',
        conversations: conversations
    };
}

/**
 * Demo-JSON herunterladen
 */
export function downloadDemoExportJSON() {
    const data = generateDemoExportJSON();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = `demo_outlook_export_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    return data.conversations.reduce((sum, c) => sum + c.emails.length, 0);
}

// Default export
export default {
    loadDemoData,
    generateDemoCases,
    generateDemoExportJSON,
    downloadDemoExportJSON,
    generateEmail,
    generateVsNr,
    randomDate,
    formatDate,
    MAKLER_POOL,
    SPARTEN,
    KUNDEN_POOL
};
