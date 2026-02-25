/**
 * Page ID Tracker - Dynamic Page Identification System
 * Automatically updates page ID based on current module and view
 *
 * Module Prefixes:
 * M = Main (Module Selection Landing)
 * A = Versicherung (Insurance)
 * B = Banken (Banking)
 * P = PMO Toolbox
 * R = Risikoscoring
 * T = Bestandsübertragung (Portfolio Transfer)
 * H = HR Pipeline (Recruiting & Bewerbermanagement)
 */

const PageIDTracker = {
    currentPageId: 'M-01',

    // Page ID mapping for all modules and views
    pageIds: {
        // M - Main Module Selection (Landing Page)
        main: {
            'landing': 'M-01'
        },

        // A - Versicherung Module
        versicherung: {
            'landing': 'A-01',              // Agentur-Auswahl
            'agentursicht': 'A-02',         // Vermittler-Overview (AO)
            'agentursicht-b2b': 'A-02b',    // Vermittler-Overview (Makler B2B)
            'agentursicht-mrh': 'A-02c',    // Vermittler-Overview (Gewerbemakler 360°)
            'dashboard': 'A-03',            // Gesamtsicht (9 KPI-Boxen Dashboard)
            'kundenliste': 'A-04',          // Kunden-Übersicht (Tabellen-Ansicht)
            'potentialanalyse': 'A-05',     // Potentialanalyse
            'fidaCases': 'A-06',            // FIDA Cases Tab
            'eigeneDaten': 'A-07',          // Eigene Daten Tab
            'chat': 'A-08',                 // KI-Chat Versicherung (Mock-Daten)
            'finanzplanung': 'A-09',        // Finanzplanung
            'kundendetail': 'A-10',         // Kunden-Detailansicht (AO)
            'kundendetail-b2b': 'A-10b',    // Kunden-Detail (Makler B2B)
            'kundendetail-mrh': 'A-10c',    // Kunden-Detail (Gewerbemakler 360°)
            'bgav-uebersicht': 'A-11',      // BGAV Übersicht (Vermittler-Tabelle + Charts)
            'bgav-umstellung': 'A-12'       // BGAV Simulation (Provisions-Rechner)
        },

        // B - Banken Module
        banken: {
            'segmentierung': 'B-01',        // Segmentierung
            'aufgaben': 'B-02',             // Aufgaben
            'npl': 'B-03',                  // NPL Dashboard
            'stage2': 'B-04',               // Stage 2 Ampel
            'crm-profile': 'B-05',          // CRM Profil
            'chat': 'B-06',                 // KI-Chat Banken (Mock-Daten)
            'customer-detail': 'B-07'       // Kunden-Detail
        },

        // P - PMO Toolbox Module
        'pmo-toolbox': {
            'landing': 'P-01',              // Projekt-Auswahl
            'dashboard': 'P-02',            // Programm-Dashboard
            'my-workstream': 'P-03',        // Mein Workstream
            'timeline': 'P-04',             // Timeline
            'risiken': 'P-05',              // Risiken & Issues
            'meilensteine': 'P-06',         // Meilensteine
            'gantt': 'P-07',                // Gantt-Chart
            'entscheidungen': 'P-08',       // Entscheidungen
            'suche': 'P-09',                // Suche/Stichwortverzeichnis
            'kpis': 'P-10',                 // KPIs Dashboard (9 KPI-Cards)
            'dokumente': 'P-11'             // Dokumentation/KI-Assistent (Mock-Daten)
        },

        // R - Risikoscoring Module
        risikoscoring: {
            'dashboard': 'R-01',            // Scoring Dashboard
            'vermittler-detail': 'R-02'     // Vermittler-Detail
        },

        // T - Bestandsübertragung Module
        bestandsuebertragung: {
            'dashboard': 'T-01',            // Dashboard
            'vorgaenge': 'T-02',            // Vorgänge
            'makler': 'T-03',              // Makler
            'emails': 'T-04',              // E-Mails
            'ai-upload': 'T-05',           // KI Upload
            'architektur': 'T-06',         // Architektur
            'vorlagen': 'T-07',            // E-Mail Vorlagen
            'prozess': 'T-08',             // Prozess
            'projektplan': 'T-09',          // Projektplan
            'slide-cv': 'T-10',            // Slide CV Scanner
            'slide-bu': 'T-11',            // Slide BÜ Ausgangslage
            'slide-plan': 'T-12',          // Slide Projektplan
            'slide-ape': 'T-13'            // Slide APE-Prognose
        },

        // H - HR Pipeline Module
        'hr-pipeline': {
            'bewerber': 'H-01',             // Bewerber-Portal
            'arbeitgeber': 'H-02'           // Recruiting Dashboard
        }
    },

    init() {
        console.log('🔖 Page ID Tracker initialized');
        this.updatePageId();
        this.setupObservers();
    },

    setupObservers() {
        // Observer for module changes
        const moduleObserver = new MutationObserver(() => {
            this.updatePageId();
        });

        // Observe changes to module-content divs
        document.querySelectorAll('.module-content').forEach(module => {
            moduleObserver.observe(module, {
                attributes: true,
                attributeFilter: ['style', 'class']
            });
        });

        // Observer for PMO view changes
        const pmoContainer = document.getElementById('pmo-toolbox-container');
        if (pmoContainer) {
            const pmoObserver = new MutationObserver(() => {
                this.updatePageId();
            });
            pmoObserver.observe(pmoContainer, {
                childList: true,
                subtree: true,
                attributes: true,
                attributeFilter: ['class']
            });
        }

        // Listen for custom events
        document.addEventListener('moduleChanged', (e) => {
            this.updatePageId(e.detail.module, e.detail.view);
        });

        document.addEventListener('viewChanged', (e) => {
            this.updatePageId(null, e.detail.view);
        });
    },

    updatePageId(forcedModule = null, forcedView = null) {
        const module = forcedModule || this.getCurrentModule();
        const view = forcedView || this.getCurrentView(module);

        let pageId = 'A-01'; // Default

        if (module && this.pageIds[module]) {
            if (view && this.pageIds[module][view]) {
                pageId = this.pageIds[module][view];
            } else {
                // Default to first view of module
                const firstView = Object.keys(this.pageIds[module])[0];
                pageId = this.pageIds[module][firstView];
            }
        }

        this.setPageId(pageId);
    },

    getCurrentModule() {
        // Check if we're on BGAV Umstellung page (belongs to versicherung module)
        const bgavPage = document.getElementById('bgavUmstellungPage');
        if (bgavPage && bgavPage.style.display !== 'none') {
            return 'versicherung';
        }

        // Check if we're on Kundendetail page (belongs to versicherung module)
        const kundenDetailPage = document.getElementById('kundenDetailPage');
        if (kundenDetailPage && kundenDetailPage.style.display !== 'none') {
            return 'versicherung';
        }

        // Check if we're on Agentursicht (belongs to versicherung module)
        const agenturOverview = document.getElementById('agenturOverview');
        if (agenturOverview && agenturOverview.style.display !== 'none') {
            return 'versicherung';
        }

        // Check if we're on Potentialanalyse (belongs to versicherung module)
        const potentialAnalysePage = document.getElementById('potentialAnalysePage');
        if (potentialAnalysePage && potentialAnalysePage.style.display !== 'none') {
            return 'versicherung';
        }

        // Check if mainApp (Dashboard) is visible (belongs to versicherung module)
        const mainApp = document.getElementById('mainApp');
        if (mainApp && mainApp.style.display !== 'none') {
            return 'versicherung';
        }

        // Check if we're on the main landing page (module selection)
        // The welcome chat is only visible on the main landing page
        const welcomeChat = document.getElementById('welcomeChat');
        if (welcomeChat) {
            const computedStyle = window.getComputedStyle(welcomeChat);
            if (computedStyle.display !== 'none') {
                // Welcome chat is visible, we're on the main module selection page
                return 'main';
            }
        }

        // Check which module is currently visible
        const modules = [
            { id: 'versicherungModule', name: 'versicherung' },
            { id: 'bankenModule', name: 'banken' },
            { id: 'pmoToolboxModule', name: 'pmo-toolbox' },
            { id: 'risikoscoringModule', name: 'risikoscoring' },
            { id: 'bestandsuebertragungModule', name: 'bestandsuebertragung' },
            { id: 'hrPipelineModule', name: 'hr-pipeline' }
        ];

        for (const module of modules) {
            const elem = document.getElementById(module.id);
            if (elem && elem.style.display !== 'none' && !elem.classList.contains('hidden')) {
                return module.name;
            }
        }

        // Check active module tab
        const activeTab = document.querySelector('.module-tab.active');
        if (activeTab) {
            return activeTab.getAttribute('data-module');
        }

        return 'versicherung'; // Default
    },

    getCurrentView(module) {
        if (!module) module = this.getCurrentModule();

        // Module-specific view detection
        switch(module) {
            case 'main':
                return 'landing';
            case 'versicherung':
                return this.getVersicherungView();
            case 'banken':
                return this.getBankenView();
            case 'pmo-toolbox':
                return this.getPMOView();
            case 'risikoscoring':
                return this.getRisikoscoringView();
            case 'bestandsuebertragung':
                return this.getBestandsuebertragungView();
            case 'cv-scanner':
                return this.getCVScannerView();
            case 'hr-pipeline':
                return this.getHRPipelineView();
            default:
                return 'landing';
        }
    },

    getVersicherungView() {
        // Check if BGAV Umstellung page is visible
        const bgavPage = document.getElementById('bgavUmstellungPage');
        if (bgavPage && bgavPage.style.display !== 'none') {
            return 'bgav-umstellung';
        }

        // Check if chat is visible (expanded)
        const chatContainer = document.getElementById('chatContainer');
        if (chatContainer && chatContainer.classList.contains('expanded')) {
            return 'chat';
        }

        // Check if on kunden detail page (before agentursicht – A-10 takes priority)
        if (document.getElementById('kundenDetailPage')?.style.display === 'block') {
            return 'kundendetail';
        }

        // Check if on landing page
        if (document.getElementById('agenturGrid')?.style.display !== 'none') {
            return 'landing';
        }

        // Check if on agentursicht
        if (document.getElementById('agenturOverview')?.style.display !== 'none') {
            return 'agentursicht';
        }

        // Check if on potentialanalyse
        if (document.getElementById('potentialAnalysePage')?.style.display !== 'none') {
            // Check which tab is active
            const fidaTab = document.querySelector('.potential-filter-btn.active');
            if (fidaTab?.textContent.includes('FIDA')) {
                return 'fidaCases';
            }
            return 'eigeneDaten';
        }

        // Check if finanzplanung is visible
        if (document.getElementById('finanzplanung')?.style.display !== 'none') {
            return 'finanzplanung';
        }

        // Check if mainApp is visible (Gesamtsicht)
        const mainApp = document.getElementById('mainApp');
        if (mainApp && mainApp.style.display !== 'none') {
            // Check if dashboard or table view is active
            const dashboardView = document.getElementById('dashboardView');
            const tableView = document.getElementById('tableView');

            if (tableView && tableView.style.display !== 'none') {
                return 'kundenliste';  // Table view
            }
            return 'dashboard';  // Dashboard with 9 KPI boxes (default)
        }

        return 'landing';
    },

    getBankenView() {
        // Check if chat is visible (in banken module)
        const bankenChat = document.querySelector('.banken-chat-container.expanded, .banken-chat-container.open');
        if (bankenChat) {
            return 'chat';
        }

        // Check if CRM profile view is open
        const crmProfile = document.getElementById('crm-profile-view');
        if (crmProfile && !crmProfile.classList.contains('hidden')) {
            return 'crm-profile';
        }

        // Check if customer detail modal is open
        const customerDetail = document.getElementById('customer-detail-modal');
        if (customerDetail && customerDetail.classList.contains('active')) {
            return 'customer-detail';
        }

        // Check active section in banken module
        const activeSections = [
            { id: 'segmentierung-section', view: 'segmentierung' },
            { id: 'aufgaben-section', view: 'aufgaben' },
            { id: 'npl-section', view: 'npl' },
            { id: 'stage2-section', view: 'stage2' }
        ];

        for (const section of activeSections) {
            const elem = document.getElementById(section.id);
            if (elem && !elem.classList.contains('hidden') && elem.style.display !== 'none') {
                return section.view;
            }
        }

        return 'segmentierung';
    },

    getPMOView() {
        // Check active PMO view
        const activeView = document.querySelector('.pmo-view.active');
        if (activeView) {
            const viewId = activeView.id.replace('pmo-', '');
            return viewId;
        }

        // Check if on landing
        if (document.getElementById('pmo-landing')?.classList.contains('active')) {
            return 'landing';
        }

        // Check if on my-workstream
        if (document.getElementById('pmo-my-workstream')?.classList.contains('active')) {
            return 'my-workstream';
        }

        return 'landing';
    },

    getRisikoscoringView() {
        // Check if detail view is open
        const detailView = document.querySelector('.vermittler-detail-view');
        if (detailView && detailView.style.display !== 'none') {
            return 'vermittler-detail';
        }
        return 'dashboard';
    },

    getBestandsuebertragungView() {
        // Check active view in bestandsübertragung
        const views = ['dashboard', 'vorgaenge', 'makler', 'emails', 'ai-upload', 'architektur', 'vorlagen', 'slide-cv', 'slide-bu', 'slide-plan', 'slide-ape'];
        const container = document.querySelector('.bestand-page');
        if (container) {
            for (const view of views) {
                const elem = container.querySelector(`#view-${view}.active`);
                if (elem) return view;
            }
        }
        // Also check active nav button as fallback
        const activeBtn = document.querySelector('.bestand-page .nav-btn.active');
        if (activeBtn && activeBtn.dataset.view) {
            return activeBtn.dataset.view;
        }
        return 'dashboard';
    },

    getCVScannerView() {
        const arbeitgeberMode = document.getElementById('cvArbeitgeberMode');
        if (arbeitgeberMode && arbeitgeberMode.classList.contains('active')) {
            return 'arbeitgeber';
        }
        return 'bewerber';
    },

    getHRPipelineView() {
        const arbeitgeberMode = document.getElementById('hpArbeitgeberMode');
        if (arbeitgeberMode && arbeitgeberMode.classList.contains('active')) {
            return 'arbeitgeber';
        }
        return 'bewerber';
    },

    setPageId(pageId) {
        if (this.currentPageId === pageId) return; // No change

        this.currentPageId = pageId;
        const display = document.getElementById('pageIdDisplay');
        if (display) {
            display.textContent = pageId;

            // Animate change
            display.style.transform = 'scale(1.1)';
            setTimeout(() => {
                display.style.transform = 'scale(1)';
            }, 200);
        }

        console.log('📍 Page ID:', pageId);
    },

    getPageId() {
        return this.currentPageId;
    }
};

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => PageIDTracker.init());
} else {
    PageIDTracker.init();
}

// Make globally accessible
window.PageIDTracker = PageIDTracker;
