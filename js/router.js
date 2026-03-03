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
            '/agentur-b2b':         { view: 'agentursicht-b2b',     pageId: 'A-02b', title: 'Vermittler B2B' },
            '/agentur-gewerbe':     { view: 'agentursicht-mrh',     pageId: 'A-02c', title: 'Vermittler Gewerbe 360°' },
            '/potentialanalyse':    { view: 'potentialanalyse',     pageId: 'A-05', title: 'Potentialanalyse' },
            '/kundendetail':        { view: 'kundendetail',         pageId: 'A-10', title: 'Kunden-Detail' },
            '/kundendetail-b2b':    { view: 'kundendetail-b2b',     pageId: 'A-10b', title: 'Kunden-Detail B2B' },
            '/kundendetail-gewerbe':{ view: 'kundendetail-mrh',     pageId: 'A-10c', title: 'Kunden-Detail Gewerbe 360°' },
            '/bgav-uebersicht':     { view: 'bgav-uebersicht',       pageId: 'A-11', title: 'BGAV Übersicht' },
            '/bgav-umstellung':     { view: 'bgav-umstellung',       pageId: 'A-12', title: 'BGAV Simulation' },
            '/banken':              { view: 'banken',               pageId: 'B-01', title: 'Banken' },
            '/asset-management':    { view: 'asset-management',     pageId: 'AM-01', title: 'Asset Management' },
            '/risikoscoring':       { view: 'risikoscoring',        pageId: 'R-01', title: 'Risikoscoring' },
            '/bestandsuebertragung':{ view: 'bestandsuebertragung', pageId: 'T-01', title: 'Bestandsübertragung' },
            '/pmo-toolbox':         { view: 'pmo-toolbox',          pageId: 'P-01', title: 'PMO Toolbox' },
            '/hr-pipeline':         { view: 'hr-pipeline',          pageId: 'H-01', title: 'HR Pipeline' },
            '/versicherungs-1x1':   { view: 'versicherungs-1x1',    pageId: 'V-01', title: 'Versicherungs-1×1' },
            '/berater':             { view: 'berater-retail',       pageId: 'B-02', title: 'Berater Retail' },
            '/berater-firmenkunde': { view: 'berater-firmenkunde',  pageId: 'B-02b', title: 'Berater Firmenkunde' },
            '/berater-vermoegen':   { view: 'berater-vermoegen',    pageId: 'B-02c', title: 'Berater Vermögen' },
            '/kundendetail-bank':   { view: 'kundendetail-bank',    pageId: 'B-10', title: 'Kunden-Detail Bank' },
            '/kundendetail-bank-fk':{ view: 'kundendetail-bank-fk', pageId: 'B-10b', title: 'Kunden-Detail FK' },
            '/kundendetail-bank-pb':{ view: 'kundendetail-bank-pb', pageId: 'B-10c', title: 'Kunden-Detail PB' },
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
                    }

                    // Attempt navigation at multiple intervals for robustness.
                    // navigateToView returns true only when the view function
                    // actually existed and was called.
                    var self = this;
                    var navigated = false;
                    function attemptDeepLink() {
                        if (navigated) return;
                        var ok = self.navigateToView(route.view, false);
                        if (ok) {
                            navigated = true;
                            self.currentRoute = initialHash;
                            console.log('Router: Deep-link navigation OK →', initialHash);
                        } else {
                            console.log('Router: Deep-link view not ready, will retry →', route.view);
                        }
                        // Always keep landing hidden
                        var lp2 = document.getElementById('landingPage');
                        if (lp2) lp2.style.display = 'none';
                    }
                    setTimeout(attemptDeepLink, 100);
                    setTimeout(attemptDeepLink, 500);
                    setTimeout(attemptDeepLink, 1500);
                    setTimeout(attemptDeepLink, 3000);
                    setTimeout(attemptDeepLink, 5000);
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

        // Navigate to a named view by calling its open function.
        // Returns true if the view function existed and was called.
        navigateToView(viewName, updateHash) {
            var fnMap = {
                'landing':              function() { return typeof backToLanding === 'function' ? (backToLanding(), true) : false; },
                'dashboard':            function() { return typeof openDashboard === 'function' ? (openDashboard(), true) : false; },
                'agentursicht':         function() { return typeof openAgenturView === 'function' ? (openAgenturView(), true) : false; },
                'agentursicht-b2b':     function() { return typeof openAgenturView === 'function' && typeof setViewMode === 'function' ? (setViewMode('ecclesia'), openAgenturView(), true) : false; },
                'agentursicht-mrh':     function() { return typeof openAgenturView === 'function' && typeof setViewMode === 'function' ? (setViewMode('mrh'), openAgenturView(), true) : false; },
                'potentialanalyse':     function() { return typeof openPotentialAnalyse === 'function' ? (openPotentialAnalyse(), true) : false; },
                'kundendetail':         function() { return typeof backToLanding === 'function' ? (backToLanding(), true) : false; },
                'kundendetail-b2b':     function() { return typeof openAgenturView === 'function' && typeof setViewMode === 'function' ? (setViewMode('ecclesia'), openAgenturView(), true) : false; },
                'kundendetail-mrh':     function() { return typeof openAgenturView === 'function' && typeof setViewMode === 'function' ? (setViewMode('mrh'), openAgenturView(), true) : false; },
                'bgav-uebersicht':      function() { return typeof openBgavUebersicht === 'function' ? (openBgavUebersicht(), true) : false; },
                'bgav-umstellung':      function() { return typeof openBgavTool === 'function' ? (openBgavTool(), true) : false; },
                'banken':               function() { return typeof switchModule === 'function' ? (switchModule('banken'), true) : false; },
                'asset-management':     function() { return typeof switchModule === 'function' ? (switchModule('asset'), true) : false; },
                'risikoscoring':        function() { return typeof openRisikoscoring === 'function' ? (openRisikoscoring(), true) : false; },
                'bestandsuebertragung': function() { return typeof openBestandsuebertragung === 'function' ? (openBestandsuebertragung(), true) : false; },
                'pmo-toolbox':          function() { return typeof openPMOToolbox === 'function' ? (openPMOToolbox(), true) : false; },
                'hr-pipeline':          function() { return typeof openHRPipeline === 'function' ? (openHRPipeline(), true) : false; },
                'versicherungs-1x1':    function() { return typeof openVersicherungs1x1 === 'function' ? (openVersicherungs1x1(), true) : false; },
                'berater-retail':       function() { return typeof showBeraterOverview === 'function' && typeof setBankViewMode === 'function' ? (setBankViewMode('retail'), showBeraterOverview(), true) : false; },
                'berater-firmenkunde':  function() { return typeof showBeraterOverview === 'function' && typeof setBankViewMode === 'function' ? (setBankViewMode('firmenkunde'), showBeraterOverview(), true) : false; },
                'berater-vermoegen':    function() { return typeof showBeraterOverview === 'function' && typeof setBankViewMode === 'function' ? (setBankViewMode('vermoegen'), showBeraterOverview(), true) : false; },
                'kundendetail-bank':    function() { return typeof showBeraterOverview === 'function' ? (showBeraterOverview(), true) : false; },
                'kundendetail-bank-fk': function() { return typeof showBeraterOverview === 'function' && typeof setBankViewMode === 'function' ? (setBankViewMode('firmenkunde'), showBeraterOverview(), true) : false; },
                'kundendetail-bank-pb': function() { return typeof showBeraterOverview === 'function' && typeof setBankViewMode === 'function' ? (setBankViewMode('vermoegen'), showBeraterOverview(), true) : false; }
            };

            var handler = fnMap[viewName];
            if (handler) {
                return handler();
            }
            console.warn('Router: No handler for view:', viewName);
            return false;
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
