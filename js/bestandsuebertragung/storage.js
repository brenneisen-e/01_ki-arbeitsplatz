/**
 * Storage Modul - localStorage Persistenz für Bestandsübertragung
 * ESM Version
 */

// localStorage Keys
const KEYS = {
    CASES: 'bestandsuebertragung_cases',
    PROCESSED: 'bestandsuebertragung_processed',
    SETTINGS: 'bestandsuebertragung_settings',
    UNASSIGNED: 'bestandsuebertragung_unassigned'
};

// Standard-Einstellungen
const DEFAULT_SETTINGS = {
    autoMatch: true,
    confirmDelete: true,
    demoLoaded: false
};

/**
 * Hilfsfunktion zum sicheren JSON-Parsing
 */
function safeJSONParse(str, fallback) {
    try {
        return JSON.parse(str) || fallback;
    } catch (e) {
        console.warn('JSON Parse Error:', e);
        return fallback;
    }
}

/**
 * UUID generieren
 */
export function generateId() {
    return 'case-' + Date.now().toString(36) + '-' + Math.random().toString(36).substr(2, 9);
}

/**
 * Alle Vorgänge laden
 */
export function getCases() {
    const data = localStorage.getItem(KEYS.CASES);
    return safeJSONParse(data, {});
}

/**
 * Alle Vorgänge speichern
 */
export function saveCases(cases) {
    try {
        localStorage.setItem(KEYS.CASES, JSON.stringify(cases));
        return true;
    } catch (e) {
        console.error('Fehler beim Speichern:', e);
        return false;
    }
}

/**
 * Einzelnen Vorgang laden
 */
export function getCase(id) {
    const cases = getCases();
    return cases[id] || null;
}

/**
 * Einzelnen Vorgang speichern oder aktualisieren
 */
export function saveCase(caseData) {
    const cases = getCases();
    const now = new Date().toISOString();

    if (!caseData.id) {
        caseData.id = generateId();
        caseData.createdAt = now;
    }
    caseData.updatedAt = now;

    cases[caseData.id] = caseData;
    return saveCases(cases) ? caseData : null;
}

/**
 * Vorgang löschen
 */
export function deleteCase(id) {
    const cases = getCases();
    if (cases[id]) {
        delete cases[id];
        return saveCases(cases);
    }
    return false;
}

/**
 * Vorgänge als Array (für Filterung/Sortierung)
 */
export function getCasesArray() {
    const cases = getCases();
    return Object.values(cases);
}

/**
 * Verarbeitete Message-IDs laden
 */
export function getProcessedMessageIds() {
    const data = localStorage.getItem(KEYS.PROCESSED);
    return safeJSONParse(data, []);
}

/**
 * Message-ID als verarbeitet markieren
 */
export function markMessageProcessed(messageId) {
    const processed = getProcessedMessageIds();
    if (!processed.includes(messageId)) {
        processed.push(messageId);
        localStorage.setItem(KEYS.PROCESSED, JSON.stringify(processed));
    }
}

/**
 * Mehrere Message-IDs als verarbeitet markieren
 */
export function markMessagesProcessed(messageIds) {
    const processed = getProcessedMessageIds();
    let changed = false;
    messageIds.forEach(id => {
        if (!processed.includes(id)) {
            processed.push(id);
            changed = true;
        }
    });
    if (changed) {
        localStorage.setItem(KEYS.PROCESSED, JSON.stringify(processed));
    }
}

/**
 * Prüfen ob Message bereits verarbeitet
 */
export function isMessageProcessed(messageId) {
    const processed = getProcessedMessageIds();
    return processed.includes(messageId);
}

/**
 * Nicht zugeordnete Mails laden
 */
export function getUnassignedMails() {
    const data = localStorage.getItem(KEYS.UNASSIGNED);
    return safeJSONParse(data, []);
}

/**
 * Nicht zugeordnete Mail hinzufügen
 */
export function addUnassignedMail(mail) {
    const mails = getUnassignedMails();
    if (!mails.find(m => m.entryID === mail.entryID)) {
        mails.push(mail);
        localStorage.setItem(KEYS.UNASSIGNED, JSON.stringify(mails));
    }
}

/**
 * Nicht zugeordnete Mail entfernen
 */
export function removeUnassignedMail(entryID) {
    let mails = getUnassignedMails();
    mails = mails.filter(m => m.entryID !== entryID);
    localStorage.setItem(KEYS.UNASSIGNED, JSON.stringify(mails));
}

/**
 * Alle nicht zugeordneten Mails löschen
 */
export function clearUnassignedMails() {
    localStorage.setItem(KEYS.UNASSIGNED, JSON.stringify([]));
}

/**
 * Einstellungen laden
 */
export function getSettings() {
    const data = localStorage.getItem(KEYS.SETTINGS);
    return { ...DEFAULT_SETTINGS, ...safeJSONParse(data, {}) };
}

/**
 * Einstellungen speichern
 */
export function saveSettings(settings) {
    const current = getSettings();
    const updated = { ...current, ...settings };
    localStorage.setItem(KEYS.SETTINGS, JSON.stringify(updated));
    return updated;
}

/**
 * Alle Daten löschen (für Reset)
 */
export function clearAll() {
    localStorage.removeItem(KEYS.CASES);
    localStorage.removeItem(KEYS.PROCESSED);
    localStorage.removeItem(KEYS.UNASSIGNED);
    localStorage.removeItem('importExportHistory');
    const settings = getSettings();
    settings.demoLoaded = false;
    localStorage.setItem(KEYS.SETTINGS, JSON.stringify(settings));
}

/**
 * Statistiken berechnen
 */
export function getStats() {
    const cases = getCasesArray();
    const stats = {
        total: cases.length,
        bestaetigt: 0,
        abgelehnt: 0,
        offen: 0,
        exportiert: 0
    };

    cases.forEach(c => {
        if (c.status === 'bestaetigt') {
            stats.bestaetigt++;
        } else if (c.status === 'abgelehnt') {
            stats.abgelehnt++;
        } else {
            stats.offen++;
        }
        if (c.exported && c.exported.date) {
            stats.exportiert++;
        }
    });

    return stats;
}

/**
 * Detail-Statistiken für Dashboard
 */
export function getDetailedStats() {
    const cases = getCasesArray();
    const stats = {
        total: cases.length,
        byStatus: {
            neu: 0,
            angefragt: 0,
            'in-bearbeitung': 0,
            bestaetigt: 0,
            abgelehnt: 0
        },
        exportiert: 0,
        exportReady: 0,
        byWorkflow: {
            mailReceived: 0,
            mailUploaded: 0,
            kiRecognized: 0,
            pvValidated: 0,
            exported: 0
        }
    };

    cases.forEach(c => {
        if (stats.byStatus.hasOwnProperty(c.status)) {
            stats.byStatus[c.status]++;
        }
        if (c.exported && c.exported.date) {
            stats.exportiert++;
        }
        if (c.status === 'export-bereit' && (!c.exported || !c.exported.date)) {
            stats.exportReady++;
        }
        if (c.workflow) {
            if (c.workflow.mailReceived) stats.byWorkflow.mailReceived++;
            if (c.workflow.mailUploaded) stats.byWorkflow.mailUploaded++;
            if (c.workflow.kiRecognized && c.status !== 'unvollstaendig') {
                stats.byWorkflow.kiRecognized++;
            }
            if (c.workflow.pvValidated) stats.byWorkflow.pvValidated++;
            if (c.workflow.exported) stats.byWorkflow.exported++;
        }
    });

    return stats;
}

/**
 * Vorgänge die für Export bereit sind
 */
export function getExportReadyCases() {
    const cases = getCasesArray();
    return cases.filter(c =>
        c.workflow && c.workflow.pvValidated &&
        (!c.exported || !c.exported.date)
    );
}

/**
 * Vorgänge die auf PV-Validierung warten
 */
export function getPendingValidationCases() {
    const cases = getCasesArray();
    return cases.filter(c =>
        c.workflow &&
        c.workflow.kiRecognized &&
        !c.workflow.pvValidated &&
        c.status !== 'unvollstaendig'
    );
}

/**
 * Unvollständige Vorgänge
 */
export function getIncompleteCases() {
    const cases = getCasesArray();
    return cases.filter(c => c.status === 'unvollstaendig');
}

/**
 * Vorgang als validiert markieren
 */
export function markCaseValidated(caseId) {
    const caseData = getCase(caseId);
    if (!caseData) return false;

    if (!caseData.workflow) caseData.workflow = {};
    caseData.workflow.pvValidated = new Date().toISOString();

    return saveCase(caseData);
}

/**
 * Mehrere Vorgänge als validiert markieren
 */
export function markCasesValidated(caseIds) {
    const cases = getCases();
    const validationDate = new Date().toISOString();
    let count = 0;

    caseIds.forEach(id => {
        if (cases[id]) {
            if (!cases[id].workflow) cases[id].workflow = {};
            cases[id].workflow.pvValidated = validationDate;
            cases[id].updatedAt = validationDate;
            count++;
        }
    });

    saveCases(cases);
    return count;
}

/**
 * Vorgänge als exportiert markieren
 */
export function markCasesExported(caseIds, exporterName) {
    const cases = getCases();
    const exportDate = new Date().toISOString();
    const exportDateShort = exportDate.split('T')[0];
    let count = 0;

    caseIds.forEach(id => {
        if (cases[id]) {
            const previousStatus = cases[id].status;

            cases[id].exported = {
                date: exportDate,
                by: exporterName
            };
            cases[id].status = 'abgeschlossen';

            if (!cases[id].workflow) cases[id].workflow = {};
            cases[id].workflow.exported = exportDate;

            if (!cases[id].statusHistory) cases[id].statusHistory = [];
            cases[id].statusHistory.push({
                date: exportDateShort,
                from: previousStatus,
                to: 'abgeschlossen',
                note: `Exportiert von ${exporterName}`
            });

            cases[id].updatedAt = exportDate;
            count++;
        }
    });

    saveCases(cases);
    return count;
}

/**
 * Sparten-Statistiken
 */
export function getSpartenStats() {
    const cases = getCasesArray();
    const spartenMap = {};

    cases.forEach(c => {
        const sparte = c.sparte || 'Unbekannt';
        spartenMap[sparte] = (spartenMap[sparte] || 0) + 1;
    });

    return Object.entries(spartenMap)
        .map(([sparte, count]) => ({ sparte, count }))
        .sort((a, b) => b.count - a.count);
}

/**
 * Letzte Aktivitäten
 */
export function getRecentActivity(limit = 10) {
    const cases = getCasesArray();
    const activities = [];

    cases.forEach(c => {
        if (c.statusHistory && c.statusHistory.length > 0) {
            c.statusHistory.forEach(h => {
                activities.push({
                    caseId: c.id,
                    kundeName: c.kunde?.name || 'Unbekannt',
                    maklerName: c.makler?.name || '-',
                    date: h.date,
                    from: h.from,
                    to: h.to,
                    note: h.note,
                    isNew: h.isNew || false
                });
            });
        }
    });

    return activities
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .slice(0, limit);
}

/**
 * Import/Export Historie abrufen
 */
export function getImportExportHistory() {
    try {
        const historyJson = localStorage.getItem('importExportHistory');
        return historyJson ? JSON.parse(historyJson) : [];
    } catch (e) {
        console.error('Error reading import/export history:', e);
        return [];
    }
}

/**
 * Import/Export Event speichern
 */
export function logImportExport(type, count, user) {
    const history = getImportExportHistory();
    history.unshift({
        date: new Date().toISOString(),
        type: type,
        count: count,
        user: user || 'Unbekannt'
    });
    const limited = history.slice(0, 50);
    localStorage.setItem('importExportHistory', JSON.stringify(limited));
}

/**
 * Makler-Statistiken berechnen
 */
export function getMaklerStats() {
    const cases = getCasesArray();
    const maklerMap = {};

    cases.forEach(c => {
        const maklerName = c.makler?.name || 'Unbekannt';
        const maklerEmail = c.makler?.email || '';

        if (!maklerMap[maklerName]) {
            maklerMap[maklerName] = {
                name: maklerName,
                email: maklerEmail,
                total: 0,
                bestaetigt: 0,
                abgelehnt: 0,
                offen: 0,
                cases: []
            };
        }

        maklerMap[maklerName].total++;
        maklerMap[maklerName].cases.push(c);

        if (c.status === 'bestaetigt') {
            maklerMap[maklerName].bestaetigt++;
        } else if (c.status === 'abgelehnt') {
            maklerMap[maklerName].abgelehnt++;
        } else {
            maklerMap[maklerName].offen++;
        }
    });

    return Object.values(maklerMap).sort((a, b) => b.total - a.total);
}

/**
 * Alle E-Mails aus allen Vorgängen holen
 */
export function getAllEmails() {
    const cases = getCasesArray();
    const emails = [];

    cases.forEach(c => {
        if (c.messages && c.messages.length > 0) {
            c.messages.forEach(msg => {
                emails.push({
                    ...msg,
                    caseId: c.id,
                    kundeName: c.kunde?.name || 'Unbekannt',
                    status: c.status
                });
            });
        }
    });

    return emails.sort((a, b) => new Date(b.receivedTime) - new Date(a.receivedTime));
}

/**
 * Vorgang nach ConversationID finden
 */
export function findCaseByConversationId(conversationId) {
    const cases = getCasesArray();
    return cases.find(c =>
        c.conversationIds && c.conversationIds.includes(conversationId)
    );
}

/**
 * Vorgang nach Versicherungsnummer finden
 */
export function findCaseByVsNr(vsNr) {
    if (!vsNr) return null;
    const cases = getCasesArray();
    const normalizedVsNr = vsNr.replace(/[-\s]/g, '').toUpperCase();
    return cases.find(c => {
        if (!c.versicherungsnummer || !c.versicherungsnummer.value) return false;
        const caseVsNr = c.versicherungsnummer.value.replace(/[-\s]/g, '').toUpperCase();
        return caseVsNr === normalizedVsNr;
    });
}

/**
 * Vorgänge nach Kundenname finden
 */
export function findCasesByKunde(name) {
    if (!name) return [];
    const cases = getCasesArray();
    const normalizedName = name.toLowerCase();
    return cases.filter(c => {
        if (!c.kunde || !c.kunde.name) return false;
        return c.kunde.name.toLowerCase().includes(normalizedName);
    });
}

/**
 * Vorgänge nach Makler finden
 */
export function findCasesByMakler(maklerName) {
    if (!maklerName) return [];
    const cases = getCasesArray();
    const normalizedName = maklerName.toLowerCase();
    return cases.filter(c => {
        if (!c.makler || !c.makler.name) return false;
        return c.makler.name.toLowerCase().includes(normalizedName);
    });
}

/**
 * Nachrichten zu einem Vorgang hinzufügen
 */
export function addMessagesToCase(caseId, messages) {
    const caseData = getCase(caseId);
    if (!caseData) return false;

    if (!caseData.messages) caseData.messages = [];
    if (!caseData.messageIds) caseData.messageIds = [];
    if (!caseData.conversationIds) caseData.conversationIds = [];
    if (!caseData.statusHistory) caseData.statusHistory = [];

    let addedCount = 0;
    messages.forEach(msg => {
        if (!caseData.messageIds.includes(msg.entryID)) {
            caseData.messages.push(msg);
            caseData.messageIds.push(msg.entryID);
            addedCount++;

            if (msg.conversationID && !caseData.conversationIds.includes(msg.conversationID)) {
                caseData.conversationIds.push(msg.conversationID);
            }
        }
    });

    if (addedCount > 0) {
        caseData.statusHistory.push({
            date: new Date().toISOString(),
            from: caseData.status,
            to: caseData.status,
            note: `${addedCount} neue Mail${addedCount > 1 ? 's' : ''} erhalten`,
            isNew: true
        });
    }

    return saveCase(caseData);
}

/**
 * Status-Historie Eintrag hinzufügen
 */
export function addStatusHistory(caseId, fromStatus, toStatus, note) {
    const caseData = getCase(caseId);
    if (!caseData) return false;

    if (!caseData.statusHistory) caseData.statusHistory = [];

    caseData.statusHistory.push({
        date: new Date().toISOString(),
        from: fromStatus,
        to: toStatus,
        note: note || '',
        isNew: true
    });

    return saveCase(caseData);
}

/**
 * Speicherplatz-Info
 */
export function getStorageInfo() {
    let total = 0;
    for (let key of Object.values(KEYS)) {
        const item = localStorage.getItem(key);
        if (item) {
            total += item.length * 2;
        }
    }
    return {
        used: total,
        usedKB: (total / 1024).toFixed(2),
        usedMB: (total / 1024 / 1024).toFixed(2),
        limit: '5MB (ca.)'
    };
}

/**
 * Export aller Daten (Backup)
 */
export function exportData() {
    return {
        exportDate: new Date().toISOString(),
        cases: getCases(),
        processed: getProcessedMessageIds(),
        unassigned: getUnassignedMails(),
        settings: getSettings()
    };
}

/**
 * Import von Backup-Daten
 */
export function importData(data) {
    try {
        if (data.cases) {
            localStorage.setItem(KEYS.CASES, JSON.stringify(data.cases));
        }
        if (data.processed) {
            localStorage.setItem(KEYS.PROCESSED, JSON.stringify(data.processed));
        }
        if (data.unassigned) {
            localStorage.setItem(KEYS.UNASSIGNED, JSON.stringify(data.unassigned));
        }
        if (data.settings) {
            localStorage.setItem(KEYS.SETTINGS, JSON.stringify(data.settings));
        }
        return true;
    } catch (e) {
        console.error('Import fehlgeschlagen:', e);
        return false;
    }
}

/**
 * Verknüpfte Vorgänge laden
 */
export function getLinkedCases(caseId) {
    const caseData = getCase(caseId);
    if (!caseData) return [];

    const linkedIds = caseData.linkedCaseIds || [];
    if (linkedIds.length === 0) return [];

    const cases = getCases();
    return linkedIds
        .filter(id => cases[id])
        .map(id => cases[id]);
}

/**
 * Prüfen ob Vorgang verknüpft ist
 */
export function hasLinkedCases(caseId) {
    const caseData = getCase(caseId);
    return caseData && caseData.linkedCaseIds && caseData.linkedCaseIds.length > 0;
}

/**
 * Duplikate finden
 */
export function findDuplicates() {
    const cases = getCasesArray();
    const duplicateGroups = [];
    const processed = new Set();

    const normalizeVsNr = (vsNr) => vsNr ? vsNr.replace(/[-\s.]/g, '').toUpperCase() : '';
    const normalizeKunde = (name) => {
        if (!name) return '';
        return name.toLowerCase()
            .replace(/[,\s]+/g, ' ')
            .replace(/ä/g, 'ae').replace(/ö/g, 'oe').replace(/ü/g, 'ue').replace(/ß/g, 'ss')
            .trim();
    };

    cases.forEach((caseA, indexA) => {
        if (processed.has(caseA.id)) return;

        const duplicates = [caseA];
        const vsNrA = normalizeVsNr(caseA.versicherungsnummer?.value);
        const kundeA = normalizeKunde(caseA.kunde?.name);
        const maklerA = caseA.makler?.email?.toLowerCase() || '';
        const versichererA = caseA.versicherer?.name || '';

        cases.forEach((caseB, indexB) => {
            if (indexA >= indexB || processed.has(caseB.id)) return;

            const vsNrB = normalizeVsNr(caseB.versicherungsnummer?.value);
            const kundeB = normalizeKunde(caseB.kunde?.name);
            const maklerB = caseB.makler?.email?.toLowerCase() || '';
            const versichererB = caseB.versicherer?.name || '';

            let isDuplicate = false;
            let reason = '';

            if (vsNrA && vsNrB && vsNrA === vsNrB) {
                isDuplicate = true;
                reason = 'VS-Nr';
            }
            else if (kundeA && kundeB && maklerA && maklerB && kundeA === kundeB && maklerA === maklerB) {
                isDuplicate = true;
                reason = 'Kunde+Makler';
            }
            else if (kundeA && kundeB && versichererA && versichererB && kundeA === kundeB && versichererA === versichererB) {
                isDuplicate = true;
                reason = 'Kunde+Versicherer';
            }

            if (isDuplicate) {
                duplicates.push({ ...caseB, _duplicateReason: reason });
                processed.add(caseB.id);
            }
        });

        if (duplicates.length > 1) {
            processed.add(caseA.id);
            duplicateGroups.push(duplicates);
        }
    });

    return duplicateGroups;
}

/**
 * Duplikate zusammenführen
 */
export function mergeDuplicates() {
    const duplicateGroups = findDuplicates();
    let mergedCount = 0;
    let deletedCount = 0;

    duplicateGroups.forEach(group => {
        group.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));

        const primary = group[0];
        const duplicates = group.slice(1);

        duplicates.forEach(dup => {
            if (dup.messages && dup.messages.length > 0) {
                addMessagesToCase(primary.id, dup.messages);
            }

            if (dup.notes && dup.notes.trim()) {
                const primaryCase = getCase(primary.id);
                if (primaryCase) {
                    const existingNotes = primaryCase.notes || '';
                    primaryCase.notes = existingNotes + (existingNotes ? '\n---\n' : '') +
                        `[Zusammengeführt aus ${dup.id}]: ` + dup.notes;
                    saveCase(primaryCase);
                }
            }

            addStatusHistory(primary.id, primary.status, primary.status,
                `Duplikat ${dup.kunde?.name || dup.id} zusammengeführt (${dup._duplicateReason || 'manuell'})`);

            deleteCase(dup.id);
            deletedCount++;
        });

        mergedCount++;
    });

    return {
        groupsFound: duplicateGroups.length,
        mergedInto: mergedCount,
        deleted: deletedCount
    };
}

// Default export for backwards compatibility
export default {
    getCases,
    saveCases,
    getCase,
    saveCase,
    deleteCase,
    getCasesArray,
    findCaseByConversationId,
    findCaseByVsNr,
    findCasesByKunde,
    findCasesByMakler,
    addMessagesToCase,
    addStatusHistory,
    getProcessedMessageIds,
    markMessageProcessed,
    markMessagesProcessed,
    isMessageProcessed,
    getUnassignedMails,
    addUnassignedMail,
    removeUnassignedMail,
    clearUnassignedMails,
    getSettings,
    saveSettings,
    getStats,
    getDetailedStats,
    getMaklerStats,
    getSpartenStats,
    getAllEmails,
    getRecentActivity,
    getImportExportHistory,
    logImportExport,
    getPendingValidationCases,
    getIncompleteCases,
    markCaseValidated,
    markCasesValidated,
    getExportReadyCases,
    markCasesExported,
    getLinkedCases,
    hasLinkedCases,
    findDuplicates,
    mergeDuplicates,
    generateId,
    clearAll,
    getStorageInfo,
    exportData,
    importData
};
