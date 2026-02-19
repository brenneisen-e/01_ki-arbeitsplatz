// ========================================
// ROUTER - Hash-basierte URL-Navigation
// Jedes Tool bekommt eine eigene Route
// z.B. kiarbeitsplatz.pages.dev/#/bgav-umstellung
// ========================================

(function() {
    'use strict';

    const Router = {
        // Route definitions: hash → { open function, pageId, title }
        routes: {
            '/':                    { view: 'landing',              pageId: 'M-01', title: 'Startseite' },
            '/landing':             { view: 'landing',              pageId: 'M-01', title: 'Startseite' },
            '/dashboard':           { view: 'dashboard',            pageId: 'A-03', title: 'Gesamtübersicht' },
            '/agentur':             { view: 'agentursicht',         pageId: 'A-02', title: 'Vermittler-Ansicht' },
            '/potentialanalyse':    { view: 'potentialanalyse',     pageId: 'A-05', title: 'Potentialanalyse' },
            '/kundendetail':        { view: 'kundendetail',         pageId: 'A-10', title: 'Kunden-Detail' },
            '/bgav-umstellung':     { view: 'bgav-umstellung',      pageId: 'A-11', title: 'BGAV Umstellung' },
            '/banken':              { view: 'banken',               pageId: 'B-01', title: 'Banken' },
            '/risikoscoring':       { view: 'risikoscoring',        pageId: 'R-01', title: 'Risikoscoring' },
            '/bestandsuebertragung':{ view: 'bestandsuebertragung', pageId: 'T-01', title: 'Bestandsübertragung' },
            '/pmo-toolbox':         { view: 'pmo-toolbox',          pageId: 'P-01', title: 'PMO Toolbox' },
            '/hr-pipeline':         { view: 'hr-pipeline',          pageId: 'H-01', title: 'HR Pipeline' },
        },

        // Reverse map: view name → hash route
        viewToRoute: {},

        currentRoute: '/',
        isNavigating: false,  // Prevent re-entry during navigation

        init() {
            // Build reverse map
            Object.entries(this.routes).forEach(([hash, config]) => {
                if (!this.viewToRoute[config.view]) {
                    this.viewToRoute[config.view] = hash;
                }
            });

            // Listen for hash changes (browser back/forward)
            window.addEventListener('hashchange', () => {
                if (!this.isNavigating) {
                    this.handleHashChange();
                }
            });

            // Listen for popstate (history navigation)
            window.addEventListener('popstate', (e) => {
                if (!this.isNavigating && e.state && e.state.view) {
                    this.navigateToView(e.state.view, false);
                }
            });

            // Handle initial hash on page load (after everything is initialized)
            // Delay to allow all modules to load first
            setTimeout(() => {
                const hash = window.location.hash.replace('#', '') || '/';
                if (hash !== '/' && hash !== '/landing') {
                    this.handleHashChange();
                }
            }, 2000);

            console.log('Router initialized. Routes:', Object.keys(this.routes).length);
        },

        // Navigate to a route (called from code)
        navigate(hash, pushState = true) {
            if (this.isNavigating) return;
            this.isNavigating = true;

            const normalizedHash = hash.startsWith('/') ? hash : '/' + hash;
            const route = this.routes[normalizedHash];

            if (!route) {
                console.warn('Router: Unknown route:', normalizedHash);
                this.isNavigating = false;
                return;
            }

            this.currentRoute = normalizedHash;

            // Update URL
            if (pushState) {
                window.history.pushState(
                    { view: route.view, pageId: route.pageId },
                    route.title,
                    '#' + normalizedHash
                );
            }

            // Update document title
            document.title = route.title + ' | KI Vertriebsarbeitsplatz';

            // Update page ID
            if (typeof PageIDTracker !== 'undefined') {
                setTimeout(() => {
                    PageIDTracker.setPageId(route.pageId);
                }, 100);
            }

            this.isNavigating = false;
        },

        // Handle hash change from URL bar or back/forward
        handleHashChange() {
            const hash = window.location.hash.replace('#', '') || '/';
            const route = this.routes[hash];

            if (!route) return;

            this.currentRoute = hash;
            this.navigateToView(route.view, false);
        },

        // Navigate to a named view by calling its open function
        navigateToView(viewName, updateHash = true) {
            switch (viewName) {
                case 'landing':
                    if (typeof backToLanding === 'function') backToLanding();
                    break;
                case 'dashboard':
                    if (typeof openDashboard === 'function') openDashboard();
                    break;
                case 'agentursicht':
                    if (typeof openAgenturView === 'function') openAgenturView();
                    break;
                case 'potentialanalyse':
                    if (typeof openPotentialAnalyse === 'function') openPotentialAnalyse();
                    break;
                case 'kundendetail':
                    // Can't navigate directly without customer context
                    if (typeof backToLanding === 'function') backToLanding();
                    break;
                case 'bgav-umstellung':
                    if (typeof openBgavTool === 'function') openBgavTool();
                    break;
                case 'banken':
                    if (typeof switchModule === 'function') switchModule('banken');
                    break;
                case 'risikoscoring':
                    if (typeof openRisikoscoring === 'function') openRisikoscoring();
                    break;
                case 'bestandsuebertragung':
                    if (typeof openBestandsuebertragung === 'function') openBestandsuebertragung();
                    break;
                case 'pmo-toolbox':
                    if (typeof openPMOToolbox === 'function') openPMOToolbox();
                    break;
                case 'hr-pipeline':
                    if (typeof openHRPipeline === 'function') openHRPipeline();
                    break;
                default:
                    console.warn('Router: No handler for view:', viewName);
            }
        },

        // Get current route info
        getCurrentRoute() {
            return this.routes[this.currentRoute] || this.routes['/'];
        },

        // Get hash for a view name
        getHashForView(viewName) {
            return this.viewToRoute[viewName] || '/';
        }
    };

    // Global access
    window.AppRouter = Router;

    // Init after DOM is ready and other scripts have loaded
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            setTimeout(() => Router.init(), 500);
        });
    } else {
        setTimeout(() => Router.init(), 500);
    }

})();
