/**
 * Page ID Tracker - Dynamic Page Identification System
 * Automatically updates page ID based on current module and view
 *
 * Module Prefixes:
 * A = Versicherung (Insurance)
 * B = Banken (Banking)
 * P = PMO Toolbox
 * R = Risikoscoring
 * T = Bestandsübertragung (Portfolio Transfer)
 */

const PageIDTracker = {
    currentPageId: 'A-01',

    // Page ID mapping for all modules and views
    pageIds: {
        // A - Versicherung Module
        versicherung: {
            'landing': 'A-01',
            'agentursicht': 'A-02',
            'kundenliste': 'A-03',
            'potentialanalyse': 'A-04',
            'fidaCases': 'A-05',
            'eigeneDaten': 'A-06',
            'chat': 'A-07',
            'finanzplanung': 'A-08'
        },

        // B - Banken Module
        banken: {
            'segmentierung': 'B-01',
            'aufgaben': 'B-02',
            'npl': 'B-03',
            'stage2': 'B-04',
            'crm-profile': 'B-05'
        },

        // P - PMO Toolbox Module
        'pmo-toolbox': {
            'landing': 'P-01',
            'dashboard': 'P-02',
            'my-workstream': 'P-03',
            'timeline': 'P-04',
            'risiken': 'P-05',
            'meilensteine': 'P-06',
            'gantt': 'P-07',
            'entscheidungen': 'P-08',
            'suche': 'P-09',
            'dokumente': 'P-10'
        },

        // R - Risikoscoring Module
        risikoscoring: {
            'dashboard': 'R-01',
            'vermittler-detail': 'R-02'
        },

        // T - Bestandsübertragung Module
        bestandsuebertragung: {
            'upload': 'T-01',
            'mapping': 'T-02',
            'preview': 'T-03',
            'export': 'T-04'
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
        // Check which module is currently visible
        const modules = [
            { id: 'versicherungModule', name: 'versicherung' },
            { id: 'bankenModule', name: 'banken' },
            { id: 'pmoToolboxModule', name: 'pmo-toolbox' },
            { id: 'risikoscoringModule', name: 'risikoscoring' },
            { id: 'bestandsuebertragungModule', name: 'bestandsuebertragung' }
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
            default:
                return 'landing';
        }
    },

    getVersicherungView() {
        // Check if on landing page
        if (document.getElementById('agenturGrid')?.style.display !== 'none') {
            return 'landing';
        }

        // Check if on agentursicht
        if (document.getElementById('agenturOverview')?.style.display !== 'none') {
            return 'agentursicht';
        }

        // Check if on potentialanalyse
        if (document.getElementById('potentialanalyse')?.style.display !== 'none') {
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

        return 'landing';
    },

    getBankenView() {
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
        // Check active step in bestandsübertragung
        const steps = ['upload', 'mapping', 'preview', 'export'];
        for (const step of steps) {
            const elem = document.querySelector(`.bestand-step-${step}.active`);
            if (elem) return step;
        }
        return 'upload';
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
