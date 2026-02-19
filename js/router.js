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
        isNavigating: false,
        deepLinkTarget: null,  // Set when a deep-link is detected on page load

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

            // Deep-link detection on page load
            const initialHash = window.location.hash.replace('#', '') || '/';
            if (initialHash !== '/' && initialHash !== '/landing') {
                const route = this.routes[initialHash];
                if (route) {
                    this.deepLinkTarget = { hash: initialHash, view: route.view };
                    console.log('Router: Deep-link detected →', initialHash);

                    // IMMEDIATELY hide landing page (before any async code runs)
                    var lp = document.getElementById('landingPage');
                    if (lp) {
                        lp.style.display = 'none';
                        lp.setAttribute('data-deeplink-hidden', 'true');
                    }

                    // Attempt navigation at multiple intervals for robustness
                    // (target view function may not be available immediately)
                    var self = this;
                    var navigated = false;
                    function attemptDeepLink() {
                        if (navigated) return;
                        try {
                            self.handleHashChange();
                            navigated = true;
                            console.log('Router: Deep-link navigation successful →', initialHash);
                            // Re-hide landing page in case something showed it
                            var lp2 = document.getElementById('landingPage');
                            if (lp2) lp2.style.display = 'none';
                        } catch (e) {
                            console.warn('Router: Deep-link attempt failed, will retry', e);
                        }
                    }
                    setTimeout(attemptDeepLink, 300);
                    setTimeout(attemptDeepLink, 800);
                    setTimeout(attemptDeepLink, 2000);
                    setTimeout(attemptDeepLink, 4000);
                }
            }

            console.log('Router initialized. Routes:', Object.keys(this.routes).length);
        },

        // Check if we're in a deep-link page load (used by landing.js to skip setup)
        isDeepLink() {
            return this.deepLinkTarget !== null;
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

    // Init immediately so routes are available for deep-link checks,
    // but defer hash handling to allow modules to load
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            Router.init();
        });
    } else {
        Router.init();
    }

})();
