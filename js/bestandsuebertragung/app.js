/**
 * App Modul - Hauptapplikation für Bestandsübertragung Tool
 * ESM Version
 */

import * as Storage from './storage.js';
import * as UI from './ui.js';
import * as Export from './export.js';
import * as DemoData from './demo-data.js';
import * as Matcher from './matcher.js';
import * as DemoFiles from './demo-files.js';

// Aktueller Zustand
let currentView = 'dashboard';
let maklerSortField = 'total';
let maklerSortDir = 'desc';

/**
 * Anwendung initialisieren
 */
export function init() {
    console.log('Bestandsübertragung Tool wird initialisiert...');

    UI.init();

    if (DemoData.loadDemoData()) {
        console.log('Demo-Daten wurden geladen');
        UI.showToast('26 Demo-Vorgänge wurden geladen', 'success');
    }

    setupEventListeners();
    refreshData();

    console.log('Initialisierung abgeschlossen');
}

/**
 * Event-Listener einrichten
 */
function setupEventListeners() {
    document.getElementById('fileInput')?.addEventListener('change', handleFileImport);
    document.getElementById('resetDemoBtn')?.addEventListener('click', handleResetDemo);
    document.getElementById('downloadDemoBtn')?.addEventListener('click', handleDownloadDemo);

    const bestandContainer = document.querySelector('.bestand-page') || document;
    bestandContainer.querySelectorAll('.nav-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            currentView = btn.dataset.view;
            UI.switchView(currentView);
            refreshCurrentView();
        });
    });

    document.getElementById('showIncompleteBtn')?.addEventListener('click', handleShowIncomplete);
    document.getElementById('validateAllBtn')?.addEventListener('click', handleValidateAll);
    document.getElementById('massValidateBtn')?.addEventListener('click', handleMassValidate);
    document.getElementById('exportReadyBtn')?.addEventListener('click', handleExportReady);
    document.getElementById('exportToRoboticsBtn')?.addEventListener('click', handleExportToRobotics);
    document.getElementById('recentActivityBody')?.addEventListener('click', handleActivityRowClick);
    document.getElementById('dashboardSearch')?.addEventListener('input', debounce(handleDashboardSearch, 300));
    document.getElementById('dashboardSearchResults')?.addEventListener('click', handleDashboardSearchClick);
    document.getElementById('activityStatusFilter')?.addEventListener('change', refreshDashboard);
    document.getElementById('activitySort')?.addEventListener('change', refreshDashboard);

    document.getElementById('newCaseBtn')?.addEventListener('click', () => openCaseModal(null));
    document.getElementById('vorgaengeSearch')?.addEventListener('input', debounce(refreshVorgaengeView, 300));
    document.getElementById('filterSparte')?.addEventListener('change', refreshVorgaengeView);
    document.getElementById('filterExport')?.addEventListener('change', refreshVorgaengeView);
    document.getElementById('casesGroupedContainer')?.addEventListener('click', handleListItemClick);

    document.getElementById('maklerSearch')?.addEventListener('input', debounce(refreshMaklerView, 300));
    document.querySelectorAll('#view-makler th.sortable').forEach(th => {
        th.addEventListener('click', () => handleMaklerSort(th.dataset.sort));
    });
    document.getElementById('maklerTableBody')?.addEventListener('click', handleMaklerRowClick);

    document.getElementById('emailSearch')?.addEventListener('input', debounce(refreshEmailsView, 300));
    document.getElementById('emailSort')?.addEventListener('change', refreshEmailsView);
    document.getElementById('emailsTableBody')?.addEventListener('click', handleEmailRowClick);

    document.getElementById('maklerCasesBody')?.addEventListener('click', handleMaklerCaseClick);

    document.getElementById('modalClose')?.addEventListener('click', () => UI.closeCaseModal());
    document.getElementById('cancelCase')?.addEventListener('click', () => UI.closeCaseModal());
    document.getElementById('saveCase')?.addEventListener('click', handleSaveCase);
    document.getElementById('deleteCase')?.addEventListener('click', handleDeleteCase);
    document.getElementById('validateCaseBtn')?.addEventListener('click', handleValidateSingleCase);

    document.getElementById('maklerModalClose')?.addEventListener('click', () => UI.closeMaklerModal());
    document.getElementById('closeMaklerModal')?.addEventListener('click', () => UI.closeMaklerModal());

    document.getElementById('exportModalClose')?.addEventListener('click', () => UI.closeExportModal());
    document.getElementById('cancelExport')?.addEventListener('click', () => UI.closeExportModal());
    document.getElementById('confirmExport')?.addEventListener('click', handleConfirmExport);

    document.getElementById('validationModalClose')?.addEventListener('click', () => UI.closeValidationModal());
    document.getElementById('validationSkip')?.addEventListener('click', handleValidationSkip);
    document.getElementById('validationConfirm')?.addEventListener('click', handleValidationConfirm);
    document.getElementById('validationReject')?.addEventListener('click', handleValidationReject);
    document.getElementById('validationWiedervorlage')?.addEventListener('click', handleValidationWiedervorlage);

    document.getElementById('emailTemplatesBtn')?.addEventListener('click', openEmailTemplatesModal);
    document.getElementById('emailTemplatesModalClose')?.addEventListener('click', closeEmailTemplatesModal);
    document.getElementById('closeEmailTemplates')?.addEventListener('click', closeEmailTemplatesModal);
    document.getElementById('emailTemplatesModal')?.addEventListener('click', (e) => {
        if (e.target.id === 'emailTemplatesModal') closeEmailTemplatesModal();
    });

    document.querySelectorAll('.btn-copy').forEach(btn => {
        btn.addEventListener('click', handleCopyTemplate);
    });

    // Demo file downloads
    document.querySelectorAll('.btn-demo-dl[data-demo-file]').forEach(btn => {
        btn.addEventListener('click', handleDemoFileDownload);
    });
    const downloadAllBtn = document.getElementById('downloadAllDemoFiles');
    if (downloadAllBtn) {
        downloadAllBtn.addEventListener('click', handleDownloadAllDemoFiles);
    }

    setupDragAndDrop();

    document.getElementById('caseModal')?.addEventListener('click', (e) => {
        if (e.target.id === 'caseModal') UI.closeCaseModal();
    });
    document.getElementById('maklerModal')?.addEventListener('click', (e) => {
        if (e.target.id === 'maklerModal') UI.closeMaklerModal();
    });
    document.getElementById('exportModal')?.addEventListener('click', (e) => {
        if (e.target.id === 'exportModal') UI.closeExportModal();
    });

    document.getElementById('linkedCasesList')?.addEventListener('click', (e) => {
        const linkedItem = e.target.closest('.linked-case-item');
        if (linkedItem) {
            const caseId = linkedItem.dataset.caseId;
            if (caseId) {
                const caseData = Storage.getCase(caseId);
                if (caseData) {
                    UI.openCaseModal(caseData);
                }
            }
        }
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            UI.closeCaseModal();
            UI.closeMaklerModal();
            UI.closeExportModal();
            UI.closeValidationModal();
            closeEmailTemplatesModal();
        }
    });

    document.getElementById('validationModal')?.addEventListener('click', (e) => {
        if (e.target.id === 'validationModal') UI.closeValidationModal();
    });

    // T-13 Waterfall ↔ AP cross-hover interaction
    setupWaterfallHover();
}

/**
 * Waterfall chart ↔ AP box cross-highlight on hover
 */
function setupWaterfallHover() {
    const page = document.querySelector('.slide-ape-page');
    if (!page) return;

    const blocks = page.querySelectorAll('.slide-ape-wf-block[data-ap]');
    const apBoxes = page.querySelectorAll('.slide-ape-ap[data-ap]');

    function highlight(apId) {
        blocks.forEach(b => {
            if (b.dataset.ap === apId) b.classList.add('wf-highlight');
        });
        apBoxes.forEach(a => {
            if (a.dataset.ap === apId) a.classList.add('ap-highlight');
        });
    }

    function clearAll() {
        blocks.forEach(b => b.classList.remove('wf-highlight'));
        apBoxes.forEach(a => a.classList.remove('ap-highlight'));
    }

    blocks.forEach(block => {
        if (!block.dataset.ap) return;
        block.addEventListener('mouseenter', () => highlight(block.dataset.ap));
        block.addEventListener('mouseleave', clearAll);
    });

    apBoxes.forEach(box => {
        if (!box.dataset.ap) return;
        box.addEventListener('mouseenter', () => highlight(box.dataset.ap));
        box.addEventListener('mouseleave', clearAll);
    });
}

/**
 * Drag & Drop für JSON-Import
 */
function setupDragAndDrop() {
    const body = document.body;

    body.addEventListener('dragenter', (e) => {
        e.preventDefault();
        UI.showDropOverlay(true);
    });

    body.addEventListener('dragover', (e) => {
        e.preventDefault();
    });

    body.addEventListener('dragleave', (e) => {
        if (e.target === document.getElementById('dropOverlay')) {
            UI.showDropOverlay(false);
        }
    });

    body.addEventListener('drop', (e) => {
        e.preventDefault();
        UI.showDropOverlay(false);

        const files = e.dataTransfer.files;
        if (files.length > 0 && files[0].type === 'application/json') {
            processImportFile(files[0]);
        } else {
            UI.showToast('Bitte nur JSON-Dateien importieren', 'warning');
        }
    });
}

/**
 * Alle Daten aktualisieren
 */
export function refreshData() {
    const cases = Storage.getCasesArray();
    const maklerStats = Storage.getMaklerStats();
    const emails = Storage.getAllEmails();
    UI.updateNavCounts(cases.length, maklerStats.length, emails.length);

    refreshCurrentView();
}

/**
 * Aktuellen View aktualisieren
 */
function refreshCurrentView() {
    switch (currentView) {
        case 'dashboard':
            refreshDashboard();
            break;
        case 'vorgaenge':
            refreshVorgaengeView();
            break;
        case 'makler':
            refreshMaklerView();
            break;
        case 'emails':
            refreshEmailsView();
            break;
    }
}

/**
 * Dashboard aktualisieren
 */
function refreshDashboard() {
    const stats = Storage.getDetailedStats();
    const spartenStats = Storage.getSpartenStats();
    const recentActivity = Storage.getRecentActivity(26);
    const importExportHistory = Storage.getImportExportHistory();
    const activityFilters = UI.getActivityFilterValues();

    UI.renderDashboardKPIs(stats);
    UI.renderSpartenList(spartenStats);
    UI.renderRecentActivity(recentActivity, activityFilters.status, activityFilters.sort);
    UI.renderImportExportHistory(importExportHistory);

    const massValidateBtn = document.getElementById('massValidateBtn');
    if (massValidateBtn) {
        massValidateBtn.style.display = stats.total >= 100 ? '' : 'none';
    }
}

/**
 * Vorgänge View aktualisieren
 */
function refreshVorgaengeView() {
    const filters = UI.getVorgaengeFilterValues();
    let cases = Storage.getCasesArray();

    cases = filterVorgaenge(cases, filters);

    cases.sort((a, b) => {
        const aHasLinked = a.linkedCaseIds && a.linkedCaseIds.length > 0 ? 1 : 0;
        const bHasLinked = b.linkedCaseIds && b.linkedCaseIds.length > 0 ? 1 : 0;

        if (bHasLinked !== aHasLinked) {
            return bHasLinked - aHasLinked;
        }

        return new Date(b.updatedAt || 0) - new Date(a.updatedAt || 0);
    });

    UI.renderCaseTiles(cases);
}

/**
 * Vorgänge filtern
 */
function filterVorgaenge(cases, filters) {
    return cases.filter(c => {
        if (filters.search) {
            const searchText = filters.search.toLowerCase();
            const searchFields = [
                c.kunde?.name,
                c.versicherungsnummer?.value,
                c.makler?.name,
                c.sparte,
                c.notes
            ].filter(Boolean).join(' ').toLowerCase();

            if (!searchFields.includes(searchText)) {
                return false;
            }
        }

        if (filters.sparte && c.sparte !== filters.sparte) {
            return false;
        }

        if (filters.exportFilter === 'exported' && (!c.exported || !c.exported.date)) {
            return false;
        }
        if (filters.exportFilter === 'not-exported' && c.exported && c.exported.date) {
            return false;
        }

        return true;
    });
}

/**
 * Makler View aktualisieren
 */
function refreshMaklerView() {
    const search = UI.getMaklerSearchValue();
    let maklerStats = Storage.getMaklerStats();

    if (search) {
        maklerStats = maklerStats.filter(m =>
            m.name.toLowerCase().includes(search) ||
            m.email.toLowerCase().includes(search)
        );
    }

    maklerStats = sortMakler(maklerStats, maklerSortField, maklerSortDir);

    UI.renderMaklerTable(maklerStats);
}

/**
 * Makler sortieren
 */
function sortMakler(maklerStats, field, direction) {
    const multiplier = direction === 'desc' ? -1 : 1;

    return maklerStats.sort((a, b) => {
        let valueA, valueB;

        switch (field) {
            case 'name':
                valueA = a.name.toLowerCase();
                valueB = b.name.toLowerCase();
                break;
            case 'total':
                valueA = a.total;
                valueB = b.total;
                break;
            case 'bestaetigt':
                valueA = a.bestaetigt;
                valueB = b.bestaetigt;
                break;
            case 'offen':
                valueA = a.offen;
                valueB = b.offen;
                break;
            case 'abgelehnt':
                valueA = a.abgelehnt;
                valueB = b.abgelehnt;
                break;
            default:
                return 0;
        }

        if (valueA < valueB) return -1 * multiplier;
        if (valueA > valueB) return 1 * multiplier;
        return 0;
    });
}

/**
 * Makler-Sortierung Handler
 */
function handleMaklerSort(field) {
    if (maklerSortField === field) {
        maklerSortDir = maklerSortDir === 'desc' ? 'asc' : 'desc';
    } else {
        maklerSortField = field;
        maklerSortDir = 'desc';
    }

    updateSortIndicators('#view-makler', field, maklerSortDir);
    refreshMaklerView();
}

/**
 * E-Mails View aktualisieren
 */
function refreshEmailsView() {
    const filters = UI.getEmailFilterValues();
    let emails = Storage.getAllEmails();

    if (filters.search) {
        emails = emails.filter(e => {
            const searchFields = [
                e.subject,
                e.senderEmail,
                e.kundeName,
                e.bodyPlain
            ].filter(Boolean).join(' ').toLowerCase();

            return searchFields.includes(filters.search);
        });
    }

    if (filters.sort === 'asc') {
        emails.sort((a, b) => new Date(a.receivedTime) - new Date(b.receivedTime));
    } else {
        emails.sort((a, b) => new Date(b.receivedTime) - new Date(a.receivedTime));
    }

    UI.renderEmailsTable(emails);
}

/**
 * Sortier-Indikatoren aktualisieren
 */
function updateSortIndicators(tableSelector, activeField, direction) {
    const arrow = direction === 'desc' ? ' ↓' : ' ↑';

    document.querySelectorAll(`${tableSelector} th.sortable`).forEach(th => {
        const field = th.dataset.sort;
        const text = th.textContent.replace(/ [↓↑]$/, '');

        if (field === activeField) {
            th.classList.add('active');
            th.textContent = text + arrow;
        } else {
            th.classList.remove('active');
            th.textContent = text;
        }
    });
}

/**
 * Klick auf Activity-Zeile
 */
function handleActivityRowClick(e) {
    const row = e.target.closest('tr.clickable-row');
    if (!row) return;

    const caseId = row.dataset.caseId;
    const caseData = Storage.getCase(caseId);

    if (caseData) {
        openCaseModal(caseData);
    }
}

/**
 * Dashboard Live-Suche
 */
function handleDashboardSearch(e) {
    const query = e.target.value.trim();

    if (query.length < 2) {
        UI.renderDashboardSearchResults([], query);
        return;
    }

    const allCases = Storage.getCasesArray();
    const queryLower = query.toLowerCase();

    const matches = allCases.filter(c => {
        const kundeName = (c.kunde?.name || '').toLowerCase();
        const vsNr = (c.versicherungsnummer?.value || '').toLowerCase();
        const maklerName = (c.makler?.name || '').toLowerCase();
        const maklerEmail = (c.makler?.email || '').toLowerCase();
        const sparte = (c.sparte || '').toLowerCase();

        return kundeName.includes(queryLower) ||
               vsNr.includes(queryLower) ||
               maklerName.includes(queryLower) ||
               maklerEmail.includes(queryLower) ||
               sparte.includes(queryLower);
    });

    UI.renderDashboardSearchResults(matches, query);
}

/**
 * Dashboard Suchergebnis-Klick
 */
function handleDashboardSearchClick(e) {
    const item = e.target.closest('.search-result-item');
    if (!item) return;

    const caseId = item.dataset.caseId;
    const caseData = Storage.getCase(caseId);

    if (caseData) {
        openCaseModal(caseData);
    }
}

/**
 * Klick auf Vorgänge-Kachel
 */
function handleListItemClick(e) {
    const item = e.target.closest('.case-list-item');
    if (!item) return;

    const caseId = item.dataset.caseId;
    const caseData = Storage.getCase(caseId);

    if (caseData) {
        openCaseModal(caseData);
    }
}

/**
 * Klick auf Makler-Zeile
 */
function handleMaklerRowClick(e) {
    const row = e.target.closest('tr.clickable-row');
    if (!row) return;

    const maklerName = row.dataset.maklerName;
    const maklerStats = Storage.getMaklerStats();
    const maklerData = maklerStats.find(m => m.name === maklerName);

    if (maklerData) {
        const cases = Storage.findCasesByMakler(maklerName);
        UI.openMaklerModal(maklerData, cases);
    }
}

/**
 * Klick auf E-Mail-Zeile
 */
function handleEmailRowClick(e) {
    const row = e.target.closest('tr.clickable-row');
    if (!row) return;

    const caseId = row.dataset.caseId;
    const caseData = Storage.getCase(caseId);

    if (caseData) {
        openCaseModal(caseData);
    }
}

/**
 * Klick auf Vorgang in Makler-Modal
 */
function handleMaklerCaseClick(e) {
    const row = e.target.closest('tr.clickable-row');
    if (!row) return;

    const caseId = row.dataset.caseId;
    const caseData = Storage.getCase(caseId);

    if (caseData) {
        UI.closeMaklerModal();
        openCaseModal(caseData);
    }
}

/**
 * Vorgang Modal öffnen
 */
function openCaseModal(caseData) {
    UI.openCaseModal(caseData);

    const validateBtn = document.getElementById('validateCaseBtn');
    if (validateBtn) {
        if (caseData && caseData.status === 'zu-validieren') {
            validateBtn.style.display = 'inline-flex';
        } else {
            validateBtn.style.display = 'none';
        }
    }
}

/**
 * Vorgang speichern
 */
function handleSaveCase() {
    const formData = UI.getCaseFormData();

    if (!formData.kunde.name && !formData.versicherungsnummer.value) {
        UI.showToast('Bitte mindestens Kunde oder VS-Nr angeben', 'warning');
        return;
    }

    let caseData;
    const isNew = !formData.id;

    if (isNew) {
        caseData = {
            ...formData,
            conversationIds: [],
            messageIds: [],
            messages: [],
            statusHistory: [
                { date: new Date().toISOString().split('T')[0], from: null, to: formData.status, note: 'Manuell erstellt' }
            ]
        };
    } else {
        caseData = Storage.getCase(formData.id);
        const oldStatus = caseData.status;

        caseData.kunde = formData.kunde;
        caseData.versicherungsnummer = formData.versicherungsnummer;
        caseData.sparte = formData.sparte;
        caseData.status = formData.status;
        caseData.gueltigkeitsdatum = formData.gueltigkeitsdatum;
        caseData.makler = formData.makler;
        caseData.notes = formData.notes;

        if (oldStatus === 'unvollstaendig' && formData.status === 'unvollstaendig') {
            const hasKunde = formData.kunde && formData.kunde.name && formData.kunde.name.trim();
            const hasVsNr = formData.versicherungsnummer && formData.versicherungsnummer.value && formData.versicherungsnummer.value.trim();

            if (hasKunde && hasVsNr) {
                caseData.status = 'zu-validieren';
                UI.showToast('Daten vollständig - Status auf "Zu Validieren" geändert', 'success');
            }
        }

        if (oldStatus !== caseData.status) {
            if (!caseData.statusHistory) caseData.statusHistory = [];
            caseData.statusHistory.push({
                date: new Date().toISOString().split('T')[0],
                from: oldStatus,
                to: caseData.status,
                note: oldStatus === 'unvollstaendig' ? 'Daten ergänzt' : 'Manuell geändert'
            });
        }
    }

    const saved = Storage.saveCase(caseData);

    if (saved) {
        UI.showToast(isNew ? 'Vorgang erstellt' : 'Vorgang gespeichert', 'success');
        UI.closeCaseModal();
        refreshData();
    } else {
        UI.showToast('Fehler beim Speichern', 'error');
    }
}

/**
 * Vorgang löschen
 */
function handleDeleteCase() {
    const caseId = document.getElementById('caseId').value;

    if (!caseId) {
        UI.closeCaseModal();
        return;
    }

    if (confirm('Vorgang wirklich löschen?')) {
        const deleted = Storage.deleteCase(caseId);

        if (deleted) {
            UI.showToast('Vorgang gelöscht', 'success');
            UI.closeCaseModal();
            refreshData();
        } else {
            UI.showToast('Fehler beim Löschen', 'error');
        }
    }
}

/**
 * Unvollständige Vorgänge anzeigen
 */
function handleShowIncomplete() {
    const incompleteCases = Storage.getIncompleteCases();

    if (incompleteCases.length === 0) {
        UI.showToast('Keine unvollständigen Vorgänge', 'info');
        return;
    }

    currentView = 'vorgaenge';
    UI.switchView(currentView);

    const filterStatus = document.getElementById('filterStatus');
    if (filterStatus) {
        filterStatus.value = 'unvollstaendig';
    }

    refreshVorgaengeView();
    UI.showToast(`${incompleteCases.length} unvollständige Vorgänge`, 'info');
}

/**
 * Offene Validierung Button Handler
 */
function handleValidateAll() {
    const pendingCases = Storage.getPendingValidationCases();

    if (pendingCases.length === 0) {
        UI.showToast('Keine Vorgänge zur Validierung', 'info');
        return;
    }

    UI.openValidationModal(pendingCases);
}

/**
 * Massenvalidierung
 */
function handleMassValidate() {
    const pendingCases = Storage.getPendingValidationCases();

    if (pendingCases.length === 0) {
        UI.showToast('Keine Vorgänge zur Validierung', 'info');
        return;
    }

    const highConfidenceCases = pendingCases.filter(c => {
        const kundeConf = c.kunde?.confidence || 0;
        const vsNrConf = c.versicherungsnummer?.confidence || 0;
        return kundeConf >= 0.7 && vsNrConf >= 0.7;
    });

    if (highConfidenceCases.length === 0) {
        UI.showToast('Keine Vorgänge mit hoher Konfidenz gefunden', 'info');
        return;
    }

    const toValidate = highConfidenceCases.slice(0, 400);

    const confirmed = confirm(
        `Massenvalidierung: ${toValidate.length} Vorgänge mit hoher KI-Konfidenz werden als "Export-Bereit" markiert.\n\nFortfahren?`
    );

    if (!confirmed) return;

    let successCount = 0;
    const now = new Date().toISOString();

    toValidate.forEach(caseData => {
        try {
            const oldStatus = caseData.status;
            caseData.status = 'export-bereit';
            caseData.workflow = caseData.workflow || {};
            caseData.workflow.pvValidated = now;

            caseData.statusHistory = caseData.statusHistory || [];
            caseData.statusHistory.push({
                date: now,
                from: oldStatus,
                to: 'export-bereit',
                note: 'Massenvalidierung (hohe Konfidenz)'
            });

            Storage.saveCase(caseData);
            successCount++;
        } catch (e) {
            console.error(`Fehler bei Validierung von ${caseData.id}:`, e);
        }
    });

    UI.showToast(`${successCount} Vorgänge erfolgreich validiert`, 'success');
    refreshDashboard();
}

/**
 * Einzelnen Vorgang aus Case-Modal validieren
 */
function handleValidateSingleCase() {
    const caseId = document.getElementById('caseId')?.value;
    if (!caseId) {
        UI.showToast('Kein Vorgang ausgewählt', 'warning');
        return;
    }

    const caseData = Storage.getCase(caseId);
    if (!caseData) {
        UI.showToast('Vorgang nicht gefunden', 'error');
        return;
    }

    if (caseData.status !== 'zu-validieren') {
        UI.showToast('Vorgang hat nicht den Status "Zu Validieren"', 'warning');
        return;
    }

    UI.closeCaseModal();
    UI.openValidationModal([caseData]);
}

/**
 * Validation Modal: Überspringen
 */
function handleValidationSkip() {
    if (UI.hasMoreValidationCases()) {
        UI.nextValidationCase();
    } else {
        UI.closeValidationModal();
        UI.showToast('Validierung abgeschlossen', 'info');
        refreshData();
    }
}

/**
 * Validation Modal: Als validiert markieren
 */
function handleValidationConfirm() {
    const currentCase = UI.getCurrentValidationCase();

    if (currentCase) {
        const formData = UI.getValidationFormData();

        const changes = [];
        if (formData.kunde !== (currentCase.kunde?.name || '')) changes.push('Kunde');
        if (formData.vsNr !== (currentCase.versicherungsnummer?.value || '')) changes.push('VS-Nr');
        if (formData.sparte !== (currentCase.sparte || '')) changes.push('Sparte');
        if (formData.makler !== (currentCase.makler?.name || '')) changes.push('Makler');
        if (formData.wiedervorlage) changes.push('Wiedervorlage');

        if (!currentCase.kunde) currentCase.kunde = {};
        currentCase.kunde.name = formData.kunde;

        if (!currentCase.versicherungsnummer) currentCase.versicherungsnummer = {};
        currentCase.versicherungsnummer.value = formData.vsNr;

        currentCase.sparte = formData.sparte;

        if (!currentCase.gueltigkeitsdatum) currentCase.gueltigkeitsdatum = {};
        currentCase.gueltigkeitsdatum.value = formData.datum;

        if (!currentCase.makler) currentCase.makler = {};
        currentCase.makler.name = formData.makler;

        if (formData.wiedervorlage) {
            currentCase.wiedervorlage = formData.wiedervorlage;
            currentCase.status = 'wiedervorlage';
        } else {
            currentCase.wiedervorlage = null;
            currentCase.status = 'export-bereit';
        }
        currentCase.updatedAt = new Date().toISOString();

        if (!currentCase.statusHistory) currentCase.statusHistory = [];
        currentCase.statusHistory.push({
            date: new Date().toISOString().split('T')[0],
            from: 'zu-validieren',
            to: currentCase.status,
            note: currentCase.status === 'wiedervorlage' ? 'PV-Validierung: Wiedervorlage' : 'PV-Validierung abgeschlossen'
        });

        if (!currentCase.validationHistory) currentCase.validationHistory = [];
        currentCase.validationHistory.push({
            date: new Date().toISOString(),
            user: 'PV-Bearbeiter',
            action: 'validiert',
            changes: changes.length > 0 ? changes : null
        });

        Storage.saveCase(currentCase);
        Storage.markCasesValidated([currentCase.id]);
    }

    if (UI.hasMoreValidationCases()) {
        UI.nextValidationCase();
        UI.showToast('Vorgang validiert', 'success');
    } else {
        UI.closeValidationModal();
        UI.showToast('Alle Vorgänge validiert', 'success');
        refreshData();
    }
}

/**
 * Validation Modal: Wiedervorlage
 */
function handleValidationWiedervorlage() {
    const currentCase = UI.getCurrentValidationCase();

    if (currentCase) {
        const formData = UI.getValidationFormData();

        if (!currentCase.kunde) currentCase.kunde = {};
        currentCase.kunde.name = formData.kunde;

        if (!currentCase.versicherungsnummer) currentCase.versicherungsnummer = {};
        currentCase.versicherungsnummer.value = formData.vsNr;

        currentCase.sparte = formData.sparte;

        if (!currentCase.gueltigkeitsdatum) currentCase.gueltigkeitsdatum = {};
        currentCase.gueltigkeitsdatum.value = formData.datum;

        if (!currentCase.makler) currentCase.makler = {};
        currentCase.makler.name = formData.makler;

        let wiedervorlageDate = formData.wiedervorlage;
        if (!wiedervorlageDate) {
            const futureDate = new Date();
            futureDate.setDate(futureDate.getDate() + 14);
            wiedervorlageDate = futureDate.toISOString().split('T')[0];
        }

        currentCase.wiedervorlage = wiedervorlageDate;
        currentCase.status = 'wiedervorlage';
        currentCase.updatedAt = new Date().toISOString();

        if (!currentCase.workflow) currentCase.workflow = {};
        currentCase.workflow.pvValidated = new Date().toISOString();

        if (!currentCase.statusHistory) currentCase.statusHistory = [];
        currentCase.statusHistory.push({
            date: new Date().toISOString().split('T')[0],
            from: 'zu-validieren',
            to: 'wiedervorlage',
            note: 'PV-Validierung: Wiedervorlage bis ' + wiedervorlageDate
        });

        if (!currentCase.validationHistory) currentCase.validationHistory = [];
        currentCase.validationHistory.push({
            date: new Date().toISOString(),
            user: 'PV-Bearbeiter',
            action: 'wiedervorlage',
            wiedervorlageDate: wiedervorlageDate
        });

        Storage.saveCase(currentCase);
        Storage.markCaseValidated(currentCase.id);
    }

    if (UI.hasMoreValidationCases()) {
        UI.nextValidationCase();
        UI.showToast('Wiedervorlage gesetzt', 'success');
    } else {
        UI.closeValidationModal();
        UI.showToast('Alle Vorgänge validiert', 'success');
        refreshData();
    }
}

/**
 * Validation Modal: Ablehnen
 */
function handleValidationReject() {
    const currentCase = UI.getCurrentValidationCase();

    const rejectSection = document.getElementById('valRejectSection');
    if (rejectSection && rejectSection.style.display === 'none') {
        UI.toggleRejectSection(true);
        return;
    }

    if (!UI.hasRejectReason()) {
        UI.showToast('Bitte Ablehnungsgrund angeben', 'warning');
        return;
    }

    if (currentCase) {
        const formData = UI.getValidationFormData();

        if (!currentCase.kunde) currentCase.kunde = {};
        currentCase.kunde.name = formData.kunde;

        if (!currentCase.versicherungsnummer) currentCase.versicherungsnummer = {};
        currentCase.versicherungsnummer.value = formData.vsNr;

        currentCase.sparte = formData.sparte;

        if (!currentCase.gueltigkeitsdatum) currentCase.gueltigkeitsdatum = {};
        currentCase.gueltigkeitsdatum.value = formData.datum;

        if (!currentCase.makler) currentCase.makler = {};
        currentCase.makler.name = formData.makler;

        currentCase.status = 'abgelehnt';
        currentCase.rejectReason = formData.rejectReason;
        currentCase.updatedAt = new Date().toISOString();

        if (!currentCase.workflow) currentCase.workflow = {};
        currentCase.workflow.pvValidated = new Date().toISOString();

        if (!currentCase.validationHistory) currentCase.validationHistory = [];
        currentCase.validationHistory.push({
            date: new Date().toISOString(),
            user: 'PV-Bearbeiter',
            action: 'abgelehnt',
            reason: formData.rejectReason
        });

        if (!currentCase.statusHistory) currentCase.statusHistory = [];
        currentCase.statusHistory.push({
            date: new Date().toISOString().split('T')[0],
            from: currentCase.status,
            to: 'abgelehnt',
            note: 'Abgelehnt: ' + formData.rejectReason
        });

        Storage.saveCase(currentCase);
    }

    UI.toggleRejectSection(false);

    if (UI.hasMoreValidationCases()) {
        UI.nextValidationCase();
        UI.showToast('Vorgang abgelehnt', 'info');
    } else {
        UI.closeValidationModal();
        UI.showToast('Validierung abgeschlossen', 'success');
        refreshData();
    }
}

/**
 * Email Templates Modal öffnen
 */
function openEmailTemplatesModal() {
    const modal = document.getElementById('emailTemplatesModal');
    if (modal) modal.style.display = 'flex';
}

/**
 * Email Templates Modal schließen
 */
function closeEmailTemplatesModal() {
    const modal = document.getElementById('emailTemplatesModal');
    if (modal) modal.style.display = 'none';
}

/**
 * Email Template kopieren
 */
function handleCopyTemplate(e) {
    const templateId = e.target.dataset.template;
    const templateContent = document.getElementById(templateId);

    if (templateContent) {
        const text = templateContent.textContent;

        navigator.clipboard.writeText(text).then(() => {
            UI.showToast('Vorlage in Zwischenablage kopiert', 'success');
            e.target.textContent = 'Kopiert!';
            setTimeout(() => {
                e.target.textContent = 'Kopieren';
            }, 2000);
        }).catch(err => {
            console.error('Kopieren fehlgeschlagen:', err);
            UI.showToast('Kopieren fehlgeschlagen', 'error');
        });
    }
}

function handleDemoFileDownload(e) {
    const fileId = e.currentTarget.dataset.demoFile;
    if (!fileId) return;
    const btn = e.currentTarget;
    const origText = btn.textContent;
    btn.textContent = '...';
    btn.disabled = true;
    setTimeout(() => {
        try {
            const ok = DemoFiles.downloadFile(fileId);
            if (ok) {
                UI.showToast('Datei heruntergeladen', 'success');
            } else {
                UI.showToast('Datei konnte nicht erzeugt werden', 'error');
            }
        } catch (err) {
            console.error('Demo-Datei Download fehlgeschlagen:', err);
            UI.showToast('Download fehlgeschlagen: ' + err.message, 'error');
        }
        btn.textContent = origText;
        btn.disabled = false;
    }, 50);
}

function handleDownloadAllDemoFiles() {
    const catalog = DemoFiles.getFileCatalog();
    let delay = 0;
    catalog.forEach(entry => {
        setTimeout(() => {
            DemoFiles.downloadFile(entry.id);
        }, delay);
        delay += 300;
    });
    UI.showToast(`${catalog.length} Dateien werden heruntergeladen...`, 'success');
}

/**
 * Export-bereit Button Handler
 */
function handleExportReady() {
    const exportReadyCases = Storage.getExportReadyCases();

    if (exportReadyCases.length === 0) {
        UI.showToast('Keine Vorgänge zum Exportieren', 'info');
        return;
    }

    UI.openExportModal(exportReadyCases.length);
}

/**
 * Export nach Robotics
 */
function handleExportToRobotics(e) {
    e.stopPropagation();
    handleExportReady();
}

/**
 * Export bestätigen
 */
function handleConfirmExport() {
    const exporterName = UI.getExporterName();

    if (!exporterName) {
        UI.showToast('Bitte Namen eingeben', 'warning');
        return;
    }

    const exportReadyCases = Storage.getExportReadyCases();
    const caseIds = exportReadyCases.map(c => c.id);

    Export.exportToCSV(exportReadyCases, `ergo_robotics_export_${Export.formatDateForFilename(new Date())}.csv`);

    const count = Storage.markCasesExported(caseIds, exporterName);

    Storage.logImportExport('export', count, exporterName);

    UI.closeExportModal();
    UI.showToast(`${count} Vorgänge exportiert und als "exportiert" markiert`, 'success');
    refreshData();
}

/**
 * Demo-JSON herunterladen
 */
function handleDownloadDemo() {
    const count = DemoData.downloadDemoExportJSON();
    UI.showToast(`Demo-JSON mit ${count} E-Mails heruntergeladen`, 'success');
}

/**
 * Demo-Daten zurücksetzen
 */
function handleResetDemo() {
    if (confirm('Alle Daten zurücksetzen und Demo-Daten neu laden?')) {
        Storage.clearAll();
        DemoData.loadDemoData(true);
        UI.showToast('Demo-Daten wurden neu geladen', 'success');
        refreshData();
    }
}

/**
 * Datei-Import Handler
 */
function handleFileImport(e) {
    const file = e.target.files[0];
    if (file) {
        processImportFile(file);
    }
    e.target.value = '';
}

/**
 * Import-Datei verarbeiten
 */
async function processImportFile(file) {
    try {
        const result = await Export.importFromJSON(file);

        if (result.type === 'backup') {
            const cases = Storage.getCasesArray();
            Storage.logImportExport('import', cases.length, 'Backup-Import');
            UI.showToast('Backup erfolgreich importiert', 'success');
            refreshData();
        } else if (result.type === 'outlook') {
            const processResult = Export.processOutlookExport(result.data);

            let message = `${processResult.processed} E-Mails verarbeitet`;
            if (processResult.created > 0) {
                message += `, ${processResult.created} neue Vorgänge erstellt`;
            }
            if (processResult.matched > 0) {
                message += `, ${processResult.matched} zugeordnet`;
            }

            const importCount = processResult.created + processResult.matched;
            if (importCount > 0) {
                Storage.logImportExport('import', importCount, 'Outlook-Import');
            }

            UI.showToast(message, (processResult.created > 0 || processResult.matched > 0) ? 'success' : 'info');
            refreshData();
        }
    } catch (error) {
        console.error('Import-Fehler:', error);
        UI.showToast(error.message, 'error');
    }
}

/**
 * Debounce Hilfsfunktion
 */
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Default export
export default {
    init,
    refreshData
};

// Global exports für Integration
// Note: window.initBestandApp is set by index.js (includes AILanding.init)
if (typeof window !== 'undefined') {
    window.BestandApp = { init, refreshData };
}
