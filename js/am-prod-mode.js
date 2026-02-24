// ========================================
// AM-01 PROD MODE MODULE
// Portfolio Management Dashboard - Prod Mode
// Welcome Screen + Start Screen + Workflows + Chatbot
// ========================================

(function() {
    'use strict';

    // ========================================
    // STATE
    // ========================================
    var prodModeActive = false;
    var currentView = 'welcome'; // welcome | dashboard
    var activeTab = 'eventMonitor'; // eventMonitor | cashflows | sod | portfolios
    var chatOpen = false;
    var chatMessages = [];
    var workflowExpandedId = null;
    var contextMenuTarget = null;

    // Profile data
    var PROFILE = {
        name: 'Doreen',
        fullName: 'Doreen Duenscheude',
        role: 'Portfolio Manager',
        photo: '1623835026886.jpg'
    };

    // Workflow data based on PDF concept
    var WORKFLOWS = [
        { id: 'WF-039237', portfolio: 'AI and Robotics Equity Fund', portfolioId: 'S0174901', event: 'Cash inflow', action: 'Draft', step: 0, totalSteps: 3, status: 'attention', amount: 5000000, ccy: 'USD' },
        { id: 'WF-039345', portfolio: 'Security Equity Fund', portfolioId: 'S0174905', event: 'Cash inflow', action: 'Awaiting approval', step: 1, totalSteps: 3, status: 'attention', amount: 3200000, ccy: 'EUR' },
        { id: 'WF-039770', portfolio: 'Thematic Opportunities Equity', portfolioId: 'S0174903', event: 'Cash inflow', action: 'PTC complete', step: 2, totalSteps: 3, status: 'attention', amount: -2500000, ccy: 'USD' },
        { id: 'WF-039107', portfolio: 'Infrastructure Equity Fund', portfolioId: 'S0174931', event: 'Cash inflow', action: 'Trading', step: 3, totalSteps: 3, status: 'completed', amount: 1200000, ccy: 'EUR' },
        { id: 'WF-032015', portfolio: 'Energy Evolution Fund', portfolioId: 'S0174933', event: 'Cash inflow', action: 'Trading', step: 3, totalSteps: 3, status: 'completed', amount: -950000, ccy: 'USD' },
        { id: 'WF-035012', portfolio: 'AI and Robotics Equity Fund', portfolioId: 'S0174901', event: 'Cash inflow', action: 'Trading', step: 3, totalSteps: 3, status: 'completed', amount: 7500000, ccy: 'USD' },
        { id: 'WF-039890', portfolio: 'Global Leaders Equity', portfolioId: 'S0174909', event: 'SOD Break', action: 'Investigating', step: 1, totalSteps: 2, status: 'attention', amount: 0, ccy: 'CHF' },
        { id: 'WF-039901', portfolio: 'Digital Health Equity Fund', portfolioId: 'S0174913', event: 'Rebalance', action: 'Optimizing', step: 1, totalSteps: 3, status: 'attention', amount: 0, ccy: 'USD' }
    ];

    // Workflow step definitions
    var WORKFLOW_STEPS = {
        cashflow: [
            { label: 'Wait for all cashflows', icon: 'clock' },
            { label: 'Publish cash & check portfolio', icon: 'check' },
            { label: 'Optimize portfolio', icon: 'zap' },
            { label: 'Run PTC', icon: 'shield' }
        ],
        sod: [
            { label: 'Investigate change', icon: 'search' },
            { label: 'Resolve & confirm', icon: 'check' }
        ],
        rebalance: [
            { label: 'Analyze drift', icon: 'chart' },
            { label: 'Optimize allocation', icon: 'zap' },
            { label: 'Run PTC & trade', icon: 'shield' }
        ]
    };

    // Chatbot suggestions
    var CHAT_SUGGESTIONS = [
        'Show me all portfolios with status trade required',
        'Show me all draft orders',
        'Which portfolios need attention today?',
        'Show cash drift summary'
    ];

    // Mock chatbot responses
    var CHAT_RESPONSES = {
        'trade required': {
            text: 'Here are the portfolios with trade required status:',
            table: [
                { portfolio: 'Thematic Opportunities Equity', status: 'PTC complete', orders: 8 },
                { portfolio: 'Security Equity Fund', status: 'Awaiting approval', orders: 12 }
            ]
        },
        'draft orders': {
            text: 'Currently there are 2 portfolios with draft orders:',
            table: [
                { portfolio: 'AI and Robotics Equity Fund', orders: 12, amount: '$5.0M' },
                { portfolio: 'Infrastructure Equity Fund', orders: 10, amount: 'EUR 3.2M' }
            ]
        },
        'attention': {
            text: '5 portfolios require your attention today:',
            table: [
                { portfolio: 'AI and Robotics Equity Fund', event: 'Cash inflow', action: 'Draft' },
                { portfolio: 'Security Equity Fund', event: 'Cash inflow', action: 'Awaiting approval' },
                { portfolio: 'Thematic Opportunities Equity', event: 'Cash inflow', action: 'PTC complete' },
                { portfolio: 'Global Leaders Equity', event: 'SOD Break', action: 'Investigating' },
                { portfolio: 'Digital Health Equity Fund', event: 'Rebalance', action: 'Optimizing' }
            ]
        },
        'cash drift': {
            text: 'Cash drift summary across portfolios:',
            table: [
                { portfolio: 'Thematic Opportunities Equity', target: '0.85%', actual: '0.73%', drift: '-0.12%' },
                { portfolio: 'Global Leaders Equity', target: '1.00%', actual: '0.85%', drift: '-0.15%' },
                { portfolio: 'FinTech Innovation Equity', target: '2.00%', actual: '1.87%', drift: '-0.13%' }
            ]
        }
    };

    // ========================================
    // ICONS (subset needed for prod mode)
    // ========================================
    var ICONS = {
        bot: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="11" width="18" height="10" rx="2"></rect><circle cx="12" cy="5" r="2"></circle><path d="M12 7v4"></path><line x1="8" y1="16" x2="8" y2="16"></line><line x1="16" y1="16" x2="16" y2="16"></line></svg>',
        send: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>',
        x: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>',
        chevronRight: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><polyline points="9 18 15 12 9 6"></polyline></svg>',
        arrowLeft: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>',
        clock: '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>',
        check: '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"></polyline></svg>',
        zap: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg>',
        alertTriangle: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>',
        moreVertical: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="5" r="1"></circle><circle cx="12" cy="12" r="1"></circle><circle cx="12" cy="19" r="1"></circle></svg>',
        play: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>',
        pause: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="6" y="4" width="4" height="16"></rect><rect x="14" y="4" width="4" height="16"></rect></svg>',
        eye: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>',
        refresh: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><polyline points="23 4 23 10 17 10"></polyline><path d="M20.49 15a9 9 0 11-2.12-9.36L23 10"></path></svg>',
        chart: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline></svg>'
    };

    // ========================================
    // TOGGLE HANDLER
    // ========================================

    window.toggleAmProdMode = function() {
        var toggle = document.getElementById('amProdModeToggle');
        prodModeActive = toggle ? toggle.checked : false;
        localStorage.setItem('amProdMode', prodModeActive ? '1' : '0');

        // If asset module is currently visible, re-render
        var assetModule = document.getElementById('assetModule');
        if (assetModule && assetModule.style.display !== 'none') {
            if (prodModeActive) {
                currentView = 'welcome';
                renderProdMode();
            } else {
                // Restore original asset module
                if (typeof window.openAssetManagement === 'function') {
                    window.openAssetManagement();
                }
            }
        }
    };

    // ========================================
    // WELCOME SCREEN
    // ========================================

    function renderWelcomeScreen() {
        return '<div class="amp-welcome-screen">' +
            '<div class="amp-welcome-content">' +
                '<div class="amp-welcome-photo-wrapper">' +
                    '<img src="' + PROFILE.photo + '" alt="' + PROFILE.fullName + '" class="amp-welcome-photo" />' +
                '</div>' +
                '<h1 class="amp-welcome-title">Welcome ' + PROFILE.name + '</h1>' +
                '<p class="amp-welcome-subtitle">' + PROFILE.fullName + '</p>' +
                '<p class="amp-welcome-role">' + PROFILE.role + '</p>' +
                '<div class="amp-welcome-stats">' +
                    '<div class="amp-welcome-stat">' +
                        '<span class="amp-welcome-stat-value">735</span>' +
                        '<span class="amp-welcome-stat-label">Live Portfolios</span>' +
                    '</div>' +
                    '<div class="amp-welcome-stat">' +
                        '<span class="amp-welcome-stat-value">5</span>' +
                        '<span class="amp-welcome-stat-label">Requires Attention</span>' +
                    '</div>' +
                    '<div class="amp-welcome-stat">' +
                        '<span class="amp-welcome-stat-value">12</span>' +
                        '<span class="amp-welcome-stat-label">Draft Orders</span>' +
                    '</div>' +
                '</div>' +
                '<button class="amp-welcome-enter-btn" onclick="ampEnterDashboard()">' +
                    'Enter Dashboard ' + ICONS.chevronRight +
                '</button>' +
            '</div>' +
        '</div>';
    }

    // ========================================
    // LOADING ANIMATION
    // ========================================

    function showLoadingAnimation(callback) {
        var container = document.getElementById('assetModule');
        if (!container) return callback();

        container.innerHTML = '<div class="amp-loading-screen">' +
            '<div class="amp-loading-content">' +
                '<div class="amp-loading-logo">' + ICONS.chart + '</div>' +
                '<h2 class="amp-loading-title">Portfolio Management Dashboard</h2>' +
                '<div class="amp-loading-bar-wrapper">' +
                    '<div class="amp-loading-bar-track">' +
                        '<div class="amp-loading-bar-fill" id="ampLoadingBar"></div>' +
                    '</div>' +
                '</div>' +
                '<p class="amp-loading-status" id="ampLoadingStatus">Initializing modules...</p>' +
            '</div>' +
        '</div>';

        var bar = document.getElementById('ampLoadingBar');
        var status = document.getElementById('ampLoadingStatus');
        var steps = [
            { pct: 20, text: 'Loading portfolio data...' },
            { pct: 45, text: 'Connecting to event monitor...' },
            { pct: 65, text: 'Syncing cashflow data...' },
            { pct: 85, text: 'Preparing workflows...' },
            { pct: 100, text: 'Ready' }
        ];
        var stepIdx = 0;

        var interval = setInterval(function() {
            if (stepIdx >= steps.length) {
                clearInterval(interval);
                setTimeout(callback, 300);
                return;
            }
            if (bar) bar.style.width = steps[stepIdx].pct + '%';
            if (status) status.textContent = steps[stepIdx].text;
            stepIdx++;
        }, 350);
    }

    // ========================================
    // START / DASHBOARD SCREEN
    // ========================================

    // Tab definitions
    var TABS = [
        { key: 'eventMonitor', label: 'Event Monitor' },
        { key: 'cashflows', label: 'Cashflows' },
        { key: 'sod', label: 'SOD' },
        { key: 'portfolios', label: 'Portfolios' }
    ];

    // Cashflow mock data
    var CASHFLOW_PROD_DATA = [
        { id: 'CF-001', portfolio: 'AI and Robotics Equity Fund', portfolioId: 'S0174901', type: 'Inflow', amount: 5000000, ccy: 'USD', valueDate: '24.02.2026', status: 'Pending', steps: 1, totalSteps: 3 },
        { id: 'CF-002', portfolio: 'Security Equity Fund', portfolioId: 'S0174905', type: 'Inflow', amount: 3200000, ccy: 'EUR', valueDate: '24.02.2026', status: 'Draft', steps: 0, totalSteps: 3 },
        { id: 'CF-003', portfolio: 'Infrastructure Equity Fund', portfolioId: 'S0174931', type: 'Inflow', amount: 1200000, ccy: 'EUR', valueDate: '25.02.2026', status: 'PTC complete', steps: 2, totalSteps: 3 },
        { id: 'CF-004', portfolio: 'Thematic Opportunities Equity', portfolioId: 'S0174903', type: 'Outflow', amount: -2500000, ccy: 'USD', valueDate: '24.02.2026', status: 'Ready to send', steps: 3, totalSteps: 3 },
        { id: 'CF-005', portfolio: 'Energy Evolution Fund', portfolioId: 'S0174933', type: 'Outflow', amount: -950000, ccy: 'USD', valueDate: '25.02.2026', status: 'Trading', steps: 3, totalSteps: 3 },
        { id: 'CF-006', portfolio: 'Global Leaders Equity', portfolioId: 'S0174909', type: 'Inflow', amount: 4100000, ccy: 'CHF', valueDate: '26.02.2026', status: 'Pending', steps: 0, totalSteps: 3 },
        { id: 'CF-007', portfolio: 'Digital Health Equity Fund', portfolioId: 'S0174913', type: 'Inflow', amount: 2800000, ccy: 'USD', valueDate: '24.02.2026', status: 'Draft', steps: 1, totalSteps: 3 },
        { id: 'CF-008', portfolio: 'FinTech Innovation Equity', portfolioId: 'S0174917', type: 'Outflow', amount: -1600000, ccy: 'EUR', valueDate: '25.02.2026', status: 'PTC complete', steps: 2, totalSteps: 3 }
    ];

    // SOD mock data
    var SOD_DATA = [
        { portfolio: 'AI and Robotics Equity Fund', portfolioId: 'S0174901', changeReason: 'NAV recalculation', severity: 'high', autoResolved: false, items: 3 },
        { portfolio: 'Global Leaders Equity', portfolioId: 'S0174909', changeReason: 'Position mismatch', severity: 'high', autoResolved: false, items: 1 },
        { portfolio: 'Thematic Opportunities Equity', portfolioId: 'S0174903', changeReason: 'FX rate update', severity: 'medium', autoResolved: true, items: 2 },
        { portfolio: 'Security Equity Fund', portfolioId: 'S0174905', changeReason: 'Corporate action', severity: 'medium', autoResolved: true, items: 1 },
        { portfolio: 'Infrastructure Equity Fund', portfolioId: 'S0174931', changeReason: 'Cash reconciliation', severity: 'low', autoResolved: true, items: 4 },
        { portfolio: 'Energy Evolution Fund', portfolioId: 'S0174933', changeReason: 'Benchmark change', severity: 'low', autoResolved: true, items: 1 }
    ];

    // Portfolio overview mock data
    var PORTFOLIO_DATA = [
        { id: 'S0174901', name: 'AI and Robotics Equity Fund', pm: 'Doreen Duenscheude', ccy: 'USD', aum: 245600000, cashPct: 1.23, driftPct: -0.12, status: 'Trade required', orders: 12 },
        { id: 'S0174905', name: 'Security Equity Fund', pm: 'Doreen Duenscheude', ccy: 'EUR', aum: 189300000, cashPct: 0.95, driftPct: 0.05, status: 'Active', orders: 5 },
        { id: 'S0174903', name: 'Thematic Opportunities Equity', pm: 'Doreen Duenscheude', ccy: 'USD', aum: 312400000, cashPct: 0.73, driftPct: -0.15, status: 'PTC pending', orders: 8 },
        { id: 'S0174931', name: 'Infrastructure Equity Fund', pm: 'Doreen Duenscheude', ccy: 'EUR', aum: 156700000, cashPct: 2.10, driftPct: 0.10, status: 'Active', orders: 0 },
        { id: 'S0174933', name: 'Energy Evolution Fund', pm: 'Doreen Duenscheude', ccy: 'USD', aum: 98200000, cashPct: 1.87, driftPct: -0.03, status: 'Trading', orders: 3 },
        { id: 'S0174909', name: 'Global Leaders Equity', pm: 'Doreen Duenscheude', ccy: 'CHF', aum: 421500000, cashPct: 0.85, driftPct: -0.22, status: 'SOD break', orders: 0 },
        { id: 'S0174913', name: 'Digital Health Equity Fund', pm: 'Doreen Duenscheude', ccy: 'USD', aum: 134800000, cashPct: 1.54, driftPct: 0.08, status: 'Rebalancing', orders: 6 },
        { id: 'S0174917', name: 'FinTech Innovation Equity', pm: 'Doreen Duenscheude', ccy: 'EUR', aum: 267900000, cashPct: 2.00, driftPct: -0.13, status: 'Active', orders: 0 }
    ];

    function renderDashboardScreen() {
        return '<div class="amp-dashboard">' +
            renderDashboardHeader() +
            '<div class="amp-dashboard-body">' +
                renderTabs() +
                renderTabContent() +
            '</div>' +
            renderChatWidget() +
        '</div>';
    }

    function renderTabs() {
        var tabsHtml = TABS.map(function(tab) {
            return '<button class="amp-tab' + (activeTab === tab.key ? ' active' : '') +
                '" onclick="ampSwitchTab(\'' + tab.key + '\')">' + tab.label + '</button>';
        }).join('');

        return '<div class="amp-dashboard-tabs">' + tabsHtml + '</div>';
    }

    function renderTabContent() {
        switch (activeTab) {
            case 'eventMonitor': return renderEventMonitorTab();
            case 'cashflows': return renderCashflowsTab();
            case 'sod': return renderSodTab();
            case 'portfolios': return renderPortfoliosTab();
            default: return renderEventMonitorTab();
        }
    }

    // --- Event Monitor Tab (original workflow view) ---
    function renderEventMonitorTab() {
        var attentionWfs = WORKFLOWS.filter(function(w) { return w.status === 'attention'; });
        var completedWfs = WORKFLOWS.filter(function(w) { return w.status === 'completed'; });

        return '<div class="amp-tab-content amp-fade-in">' +
            '<div class="amp-kpi-row">' +
                renderKpiCard('Live Portfolios', '735', 'neutral') +
                renderKpiCard('Requires Attention', String(attentionWfs.length), 'warning') +
                renderKpiCard('Draft Orders', '12', 'info') +
                renderKpiCard('Cash Changes', '8', 'info') +
                renderKpiCard('Completed Today', String(completedWfs.length), 'success') +
            '</div>' +
            '<div class="amp-workflow-sections">' +
                '<div class="amp-workflow-section">' +
                    '<div class="amp-section-header">' +
                        '<h3 class="amp-section-title">' + ICONS.alertTriangle + ' Requires Attention</h3>' +
                        '<span class="amp-section-badge attention">' + attentionWfs.length + '</span>' +
                    '</div>' +
                    renderWorkflowTable(attentionWfs) +
                '</div>' +
                '<div class="amp-workflow-section">' +
                    '<div class="amp-section-header">' +
                        '<h3 class="amp-section-title">' + ICONS.check + ' Completed</h3>' +
                        '<span class="amp-section-badge completed">' + completedWfs.length + '</span>' +
                    '</div>' +
                    renderWorkflowTable(completedWfs) +
                '</div>' +
            '</div>' +
        '</div>';
    }

    // --- Cashflows Tab ---
    function renderCashflowsTab() {
        var pending = CASHFLOW_PROD_DATA.filter(function(c) { return c.status !== 'Trading'; });
        var completed = CASHFLOW_PROD_DATA.filter(function(c) { return c.status === 'Trading'; });
        var totalInflow = CASHFLOW_PROD_DATA.filter(function(c) { return c.amount > 0; })
            .reduce(function(s, c) { return s + c.amount; }, 0);
        var totalOutflow = CASHFLOW_PROD_DATA.filter(function(c) { return c.amount < 0; })
            .reduce(function(s, c) { return s + c.amount; }, 0);

        return '<div class="amp-tab-content amp-fade-in">' +
            '<div class="amp-kpi-row">' +
                renderKpiCard('Total Cashflows', String(CASHFLOW_PROD_DATA.length), 'neutral') +
                renderKpiCard('Inflows', formatCompact(totalInflow), 'success') +
                renderKpiCard('Outflows', formatCompact(Math.abs(totalOutflow)), 'warning') +
                renderKpiCard('Pending', String(pending.length), 'info') +
                renderKpiCard('Completed', String(completed.length), 'success') +
            '</div>' +
            '<div class="amp-workflow-sections">' +
                '<div class="amp-workflow-section">' +
                    '<div class="amp-section-header">' +
                        '<h3 class="amp-section-title">' + ICONS.alertTriangle + ' Pending Cashflows</h3>' +
                        '<span class="amp-section-badge attention">' + pending.length + '</span>' +
                    '</div>' +
                    renderCashflowTable(pending) +
                '</div>' +
                '<div class="amp-workflow-section">' +
                    '<div class="amp-section-header">' +
                        '<h3 class="amp-section-title">' + ICONS.check + ' Completed</h3>' +
                        '<span class="amp-section-badge completed">' + completed.length + '</span>' +
                    '</div>' +
                    renderCashflowTable(completed) +
                '</div>' +
            '</div>' +
        '</div>';
    }

    function renderCashflowTable(data) {
        if (!data.length) return '<div class="amp-no-data">No cashflows</div>';

        var rows = data.map(function(cf) {
            var amountStr = formatAmount(cf.amount, cf.ccy);
            var statusCls = cf.status === 'Trading' ? 'trading' :
                           cf.status === 'PTC complete' ? 'ptc-complete' :
                           cf.status === 'Ready to send' ? 'ptc-complete' :
                           cf.status === 'Draft' ? 'draft' : 'pending';

            return '<tr class="amp-wf-row">' +
                '<td class="amp-wf-id">' + cf.id + '</td>' +
                '<td class="amp-wf-portfolio">' + cf.portfolio + '</td>' +
                '<td><span class="amp-event-badge ' + (cf.amount > 0 ? 'amp-event-cashflow' : 'amp-event-sod') + '">' + cf.type + '</span></td>' +
                '<td class="amp-wf-amount">' + amountStr + '</td>' +
                '<td>' + cf.valueDate + '</td>' +
                '<td><span class="amp-action-badge amp-action-' + statusCls + '">' + cf.status + '</span></td>' +
                '<td class="amp-wf-progress">' + renderProgressSteps(cf.steps, cf.totalSteps) + '</td>' +
            '</tr>';
        }).join('');

        return '<div class="amp-table-wrapper">' +
            '<table class="amp-wf-table">' +
                '<thead><tr>' +
                    '<th>ID</th><th>Portfolio</th><th>Type</th><th>Amount</th><th>Value Date</th><th>Status</th><th>Progress</th>' +
                '</tr></thead>' +
                '<tbody>' + rows + '</tbody>' +
            '</table>' +
        '</div>';
    }

    // --- SOD Tab ---
    function renderSodTab() {
        var unresolved = SOD_DATA.filter(function(s) { return !s.autoResolved; });
        var resolved = SOD_DATA.filter(function(s) { return s.autoResolved; });

        return '<div class="amp-tab-content amp-fade-in">' +
            '<div class="amp-kpi-row">' +
                renderKpiCard('SOD Alerts', String(SOD_DATA.length), 'neutral') +
                renderKpiCard('Manual Review', String(unresolved.length), 'warning') +
                renderKpiCard('Auto-Resolved', String(resolved.length), 'success') +
                renderKpiCard('Total Items', String(SOD_DATA.reduce(function(s, d) { return s + d.items; }, 0)), 'info') +
                renderKpiCard('High Severity', String(SOD_DATA.filter(function(s) { return s.severity === 'high'; }).length), 'warning') +
            '</div>' +
            '<div class="amp-workflow-sections">' +
                '<div class="amp-workflow-section">' +
                    '<div class="amp-section-header">' +
                        '<h3 class="amp-section-title">' + ICONS.alertTriangle + ' Requires Manual Review</h3>' +
                        '<span class="amp-section-badge attention">' + unresolved.length + '</span>' +
                    '</div>' +
                    renderSodTable(unresolved) +
                '</div>' +
                '<div class="amp-workflow-section">' +
                    '<div class="amp-section-header">' +
                        '<h3 class="amp-section-title">' + ICONS.check + ' Auto-Resolved</h3>' +
                        '<span class="amp-section-badge completed">' + resolved.length + '</span>' +
                    '</div>' +
                    renderSodTable(resolved) +
                '</div>' +
            '</div>' +
        '</div>';
    }

    function renderSodTable(data) {
        if (!data.length) return '<div class="amp-no-data">No SOD alerts</div>';

        var rows = data.map(function(sod) {
            var sevCls = sod.severity === 'high' ? 'amp-event-sod' :
                        sod.severity === 'medium' ? 'amp-event-rebalance' : 'amp-event-cashflow';
            var statusLabel = sod.autoResolved ? 'Auto-Resolved' : 'Manual Review';
            var statusCls = sod.autoResolved ? 'amp-action-trading' : 'amp-action-awaiting-approval';

            return '<tr class="amp-wf-row">' +
                '<td class="amp-wf-id">' + sod.portfolioId + '</td>' +
                '<td class="amp-wf-portfolio">' + sod.portfolio + '</td>' +
                '<td>' + sod.changeReason + '</td>' +
                '<td><span class="amp-event-badge ' + sevCls + '">' + sod.severity.charAt(0).toUpperCase() + sod.severity.slice(1) + '</span></td>' +
                '<td>' + sod.items + ' item' + (sod.items > 1 ? 's' : '') + '</td>' +
                '<td><span class="amp-action-badge ' + statusCls + '">' + statusLabel + '</span></td>' +
            '</tr>';
        }).join('');

        return '<div class="amp-table-wrapper">' +
            '<table class="amp-wf-table">' +
                '<thead><tr>' +
                    '<th>Portfolio ID</th><th>Portfolio</th><th>Change Reason</th><th>Severity</th><th>Items</th><th>Status</th>' +
                '</tr></thead>' +
                '<tbody>' + rows + '</tbody>' +
            '</table>' +
        '</div>';
    }

    // --- Portfolios Tab ---
    function renderPortfoliosTab() {
        var activeCount = PORTFOLIO_DATA.filter(function(p) { return p.status === 'Active'; }).length;
        var totalAum = PORTFOLIO_DATA.reduce(function(s, p) { return s + p.aum; }, 0);

        return '<div class="amp-tab-content amp-fade-in">' +
            '<div class="amp-kpi-row">' +
                renderKpiCard('Total Portfolios', String(PORTFOLIO_DATA.length), 'neutral') +
                renderKpiCard('Total AUM', formatCompact(totalAum), 'info') +
                renderKpiCard('Active', String(activeCount), 'success') +
                renderKpiCard('With Orders', String(PORTFOLIO_DATA.filter(function(p) { return p.orders > 0; }).length), 'info') +
                renderKpiCard('Avg Cash %', (PORTFOLIO_DATA.reduce(function(s, p) { return s + p.cashPct; }, 0) / PORTFOLIO_DATA.length).toFixed(2) + '%', 'neutral') +
            '</div>' +
            '<div class="amp-workflow-section">' +
                renderPortfolioTable() +
            '</div>' +
        '</div>';
    }

    function renderPortfolioTable() {
        var rows = PORTFOLIO_DATA.map(function(p) {
            var statusCls = p.status === 'Active' ? 'amp-action-trading' :
                           p.status === 'Trading' ? 'amp-action-trading' :
                           p.status === 'Trade required' ? 'amp-action-awaiting-approval' :
                           p.status === 'PTC pending' ? 'amp-action-ptc-complete' :
                           p.status === 'SOD break' ? 'amp-action-awaiting-approval' :
                           p.status === 'Rebalancing' ? 'amp-action-investigating' : 'amp-action-draft';
            var driftCls = p.driftPct < -0.1 ? 'negative' : p.driftPct > 0.1 ? 'positive' : '';

            return '<tr class="amp-wf-row">' +
                '<td class="amp-wf-id">' + p.id + '</td>' +
                '<td class="amp-wf-portfolio">' + p.name + '</td>' +
                '<td>' + p.ccy + '</td>' +
                '<td class="amp-wf-amount"><span class="amp-amount">' + formatCompact(p.aum) + '</span></td>' +
                '<td>' + p.cashPct.toFixed(2) + '%</td>' +
                '<td><span class="amp-amount ' + driftCls + '">' + (p.driftPct >= 0 ? '+' : '') + p.driftPct.toFixed(2) + '%</span></td>' +
                '<td><span class="amp-action-badge ' + statusCls + '">' + p.status + '</span></td>' +
                '<td>' + (p.orders > 0 ? p.orders : '-') + '</td>' +
            '</tr>';
        }).join('');

        return '<div class="amp-table-wrapper">' +
            '<table class="amp-wf-table">' +
                '<thead><tr>' +
                    '<th>ID</th><th>Portfolio</th><th>CCY</th><th>AUM</th><th>Cash %</th><th>Drift</th><th>Status</th><th>Orders</th>' +
                '</tr></thead>' +
                '<tbody>' + rows + '</tbody>' +
            '</table>' +
        '</div>';
    }

    function formatCompact(val) {
        var abs = Math.abs(val);
        if (abs >= 1000000000) return (val / 1000000000).toFixed(1) + 'B';
        if (abs >= 1000000) return (val / 1000000).toFixed(1) + 'M';
        if (abs >= 1000) return (val / 1000).toFixed(0) + 'K';
        return String(val);
    }

    function renderDashboardHeader() {
        return '<div class="amp-dash-header">' +
            '<div class="amp-dash-header-left">' +
                '<div class="amp-dash-logo">' + ICONS.chart + ' Active Equities</div>' +
                '<div class="amp-dash-live"><div class="amp-live-dot"></div>LIVE</div>' +
            '</div>' +
            '<div class="amp-dash-header-right">' +
                '<div class="amp-dash-user">' +
                    '<img src="' + PROFILE.photo + '" alt="" class="amp-dash-avatar" />' +
                    '<span>' + PROFILE.name + '</span>' +
                '</div>' +
                '<button class="amp-back-btn" onclick="backToLanding()">' + ICONS.arrowLeft + ' Back</button>' +
            '</div>' +
        '</div>';
    }

    function renderKpiCard(label, value, type) {
        return '<div class="amp-kpi-card amp-kpi-' + type + '">' +
            '<div class="amp-kpi-value">' + value + '</div>' +
            '<div class="amp-kpi-label">' + label + '</div>' +
        '</div>';
    }

    // ========================================
    // WORKFLOW TABLE
    // ========================================

    function renderWorkflowTable(workflows) {
        if (!workflows.length) return '<div class="amp-no-data">No workflows</div>';

        var rows = workflows.map(function(wf) {
            var stepType = wf.event.toLowerCase().indexOf('cash') >= 0 ? 'cashflow' :
                          wf.event.toLowerCase().indexOf('sod') >= 0 ? 'sod' : 'rebalance';
            var steps = WORKFLOW_STEPS[stepType];
            var isExpanded = workflowExpandedId === wf.id;
            var amountStr = wf.amount !== 0 ? formatAmount(wf.amount, wf.ccy) : '-';

            var row = '<tr class="amp-wf-row' + (isExpanded ? ' expanded' : '') + '" onclick="ampToggleWorkflow(\'' + wf.id + '\')">' +
                '<td class="amp-wf-id">' + wf.id + '</td>' +
                '<td class="amp-wf-portfolio">' + wf.portfolio + '</td>' +
                '<td class="amp-wf-event">' +
                    '<span class="amp-event-badge amp-event-' + stepType + '">' + wf.event + '</span>' +
                '</td>' +
                '<td class="amp-wf-action">' +
                    '<span class="amp-action-badge amp-action-' + wf.action.toLowerCase().replace(/\s+/g, '-') + '">' + wf.action + '</span>' +
                '</td>' +
                '<td class="amp-wf-progress">' +
                    renderProgressSteps(wf.step, wf.totalSteps) +
                '</td>' +
                '<td class="amp-wf-amount">' + amountStr + '</td>' +
                '<td class="amp-wf-actions">' +
                    '<button class="amp-ctx-btn" onclick="event.stopPropagation(); ampShowContextMenu(event, \'' + wf.id + '\')">' + ICONS.moreVertical + '</button>' +
                '</td>' +
            '</tr>';

            // Expanded detail row
            if (isExpanded) {
                row += '<tr class="amp-wf-detail-row"><td colspan="7">' +
                    '<div class="amp-wf-detail amp-fade-in">' +
                        '<div class="amp-wf-steps-detail">' +
                            '<h4>Workflow Steps</h4>' +
                            renderDetailSteps(wf, steps) +
                        '</div>' +
                        '<div class="amp-wf-detail-actions">' +
                            (wf.status === 'attention' ?
                                '<button class="amp-action-primary" onclick="event.stopPropagation(); ampAdvanceWorkflow(\'' + wf.id + '\')">Approve & Advance</button>' +
                                '<button class="amp-action-secondary" onclick="event.stopPropagation();">View Portfolio</button>' :
                                '<button class="amp-action-secondary" onclick="event.stopPropagation();">View Details</button>'
                            ) +
                        '</div>' +
                    '</div>' +
                '</td></tr>';
            }

            return row;
        }).join('');

        return '<div class="amp-table-wrapper">' +
            '<table class="amp-wf-table">' +
                '<thead><tr>' +
                    '<th>Workflow ID</th>' +
                    '<th>Portfolio</th>' +
                    '<th>Event</th>' +
                    '<th>Action</th>' +
                    '<th>Progress</th>' +
                    '<th>Amount</th>' +
                    '<th></th>' +
                '</tr></thead>' +
                '<tbody>' + rows + '</tbody>' +
            '</table>' +
        '</div>';
    }

    function renderProgressSteps(current, total) {
        var html = '<div class="amp-progress-steps">';
        for (var i = 0; i <= total; i++) {
            var cls = i < current ? 'done' : i === current ? 'active' : 'pending';
            html += '<div class="amp-step-dot ' + cls + '"></div>';
            if (i < total) {
                html += '<div class="amp-step-line ' + (i < current ? 'done' : '') + '"></div>';
            }
        }
        html += '<span class="amp-step-label">' + current + '/' + total + '</span>';
        html += '</div>';
        return html;
    }

    function renderDetailSteps(wf, steps) {
        return '<div class="amp-detail-steps">' +
            steps.map(function(step, idx) {
                var status = idx < wf.step ? 'completed' :
                            idx === wf.step ? 'current' : 'upcoming';
                var icon = status === 'completed' ? ICONS.check :
                          status === 'current' ? '<div class="amp-step-pulse"></div>' :
                          ICONS.clock;
                return '<div class="amp-detail-step ' + status + '">' +
                    '<div class="amp-detail-step-icon">' + icon + '</div>' +
                    '<div class="amp-detail-step-info">' +
                        '<span class="amp-detail-step-label">' + step.label + '</span>' +
                        '<span class="amp-detail-step-status">' +
                            (status === 'completed' ? 'Completed' :
                             status === 'current' ? (wf.step === wf.totalSteps ? 'In Progress' : 'Current Step') :
                             'Upcoming') +
                        '</span>' +
                    '</div>' +
                '</div>';
            }).join('') +
        '</div>';
    }

    // ========================================
    // CONTEXT MENU
    // ========================================

    function renderContextMenu(wfId, x, y) {
        removeContextMenu();
        var wf = WORKFLOWS.filter(function(w) { return w.id === wfId; })[0];
        if (!wf) return;

        var menu = document.createElement('div');
        menu.className = 'amp-context-menu amp-fade-in';
        menu.id = 'ampContextMenu';
        menu.style.left = x + 'px';
        menu.style.top = y + 'px';

        var items = [
            { icon: ICONS.eye, label: 'View Portfolio', action: 'view' },
            { icon: ICONS.play, label: 'Advance Workflow', action: 'advance' },
            { icon: ICONS.pause, label: 'Pause Workflow', action: 'pause' },
            { icon: ICONS.refresh, label: 'Reset Workflow', action: 'reset' }
        ];

        menu.innerHTML = '<div class="amp-ctx-header">' + wf.id + ' - ' + wf.portfolio + '</div>' +
            items.map(function(item) {
                return '<button class="amp-ctx-item" onclick="ampContextAction(\'' + item.action + '\', \'' + wfId + '\')">' +
                    item.icon + '<span>' + item.label + '</span></button>';
            }).join('');

        document.body.appendChild(menu);

        // Adjust position if off-screen
        var rect = menu.getBoundingClientRect();
        if (rect.right > window.innerWidth) menu.style.left = (x - rect.width) + 'px';
        if (rect.bottom > window.innerHeight) menu.style.top = (y - rect.height) + 'px';

        // Close on outside click
        setTimeout(function() {
            document.addEventListener('click', removeContextMenu, { once: true });
        }, 10);
    }

    function removeContextMenu() {
        var menu = document.getElementById('ampContextMenu');
        if (menu) menu.remove();
    }

    // ========================================
    // CHATBOT
    // ========================================

    function renderChatWidget() {
        if (!chatOpen) {
            return '<button class="amp-chat-toggle" onclick="ampToggleChat()">' +
                ICONS.bot + '<span>How can I help?</span>' +
            '</button>';
        }

        var messagesHtml = chatMessages.map(function(msg) {
            return '<div class="amp-chat-msg amp-chat-' + msg.role + '">' +
                (msg.role === 'assistant' ? '<div class="amp-chat-avatar">' + ICONS.bot + '</div>' : '') +
                '<div class="amp-chat-bubble">' + msg.html + '</div>' +
            '</div>';
        }).join('');

        var suggestionsHtml = chatMessages.length === 0 ? (
            '<div class="amp-chat-suggestions">' +
                CHAT_SUGGESTIONS.map(function(s) {
                    return '<button class="amp-chat-suggestion" onclick="ampSendChat(\'' + escapeAttr(s) + '\')">' + s + '</button>';
                }).join('') +
            '</div>'
        ) : '';

        return '<div class="amp-chat-panel amp-slide-up">' +
            '<div class="amp-chat-header">' +
                '<div class="amp-chat-header-left">' + ICONS.bot + ' <span>Portfolio Assistant</span></div>' +
                '<button class="amp-chat-close" onclick="ampToggleChat()">' + ICONS.x + '</button>' +
            '</div>' +
            '<div class="amp-chat-body" id="ampChatBody">' +
                (chatMessages.length === 0 ? '<div class="amp-chat-welcome"><p>How can I help you today?</p></div>' : '') +
                messagesHtml +
                suggestionsHtml +
            '</div>' +
            '<div class="amp-chat-input-area">' +
                '<input type="text" class="amp-chat-input" id="ampChatInput" placeholder="Ask about your portfolios..." onkeydown="if(event.key===\'Enter\')ampSendChat()" />' +
                '<button class="amp-chat-send" onclick="ampSendChat()">' + ICONS.send + '</button>' +
            '</div>' +
        '</div>';
    }

    // ========================================
    // HELPERS
    // ========================================

    function formatAmount(amount, ccy) {
        var prefix = amount < 0 ? '-' : '+';
        var abs = Math.abs(amount);
        var formatted;
        if (abs >= 1000000) {
            formatted = (abs / 1000000).toFixed(1) + 'M';
        } else if (abs >= 1000) {
            formatted = (abs / 1000).toFixed(0) + 'K';
        } else {
            formatted = String(abs);
        }
        return '<span class="amp-amount ' + (amount < 0 ? 'negative' : 'positive') + '">' + prefix + ccy + ' ' + formatted + '</span>';
    }

    function escapeAttr(str) {
        return str.replace(/'/g, "\\'").replace(/"/g, '&quot;');
    }

    function escapeHtml(str) {
        var div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }

    // ========================================
    // RENDER ORCHESTRATOR
    // ========================================

    function renderProdMode() {
        var container = document.getElementById('assetModule');
        if (!container) return;

        if (currentView === 'welcome') {
            container.innerHTML = renderWelcomeScreen();
        } else {
            container.innerHTML = renderDashboardScreen();
        }
    }

    // ========================================
    // GLOBAL ACTIONS
    // ========================================

    window.ampSwitchTab = function(tabKey) {
        activeTab = tabKey;
        workflowExpandedId = null;
        renderProdMode();
    };

    window.ampEnterDashboard = function() {
        currentView = 'loading';
        showLoadingAnimation(function() {
            currentView = 'dashboard';
            renderProdMode();
        });
    };

    window.ampToggleWorkflow = function(wfId) {
        workflowExpandedId = workflowExpandedId === wfId ? null : wfId;
        renderProdMode();
    };

    window.ampShowContextMenu = function(e, wfId) {
        e.preventDefault();
        e.stopPropagation();
        renderContextMenu(wfId, e.clientX, e.clientY);
    };

    window.ampContextAction = function(action, wfId) {
        removeContextMenu();
        var wf = WORKFLOWS.filter(function(w) { return w.id === wfId; })[0];
        if (!wf) return;

        if (action === 'advance') {
            ampAdvanceWorkflow(wfId);
        }
    };

    window.ampAdvanceWorkflow = function(wfId) {
        var wf = WORKFLOWS.filter(function(w) { return w.id === wfId; })[0];
        if (!wf) return;

        wf.step = Math.min(wf.step + 1, wf.totalSteps);
        if (wf.step >= wf.totalSteps) {
            wf.status = 'completed';
            wf.action = 'Trading';
        } else {
            var stepType = wf.event.toLowerCase().indexOf('cash') >= 0 ? 'cashflow' :
                          wf.event.toLowerCase().indexOf('sod') >= 0 ? 'sod' : 'rebalance';
            var steps = WORKFLOW_STEPS[stepType];
            if (steps[wf.step]) {
                wf.action = steps[wf.step].label;
            }
        }
        workflowExpandedId = null;
        renderProdMode();
    };

    window.ampToggleChat = function() {
        chatOpen = !chatOpen;
        renderProdMode();
        if (chatOpen) {
            var input = document.getElementById('ampChatInput');
            if (input) input.focus();
        }
    };

    window.ampSendChat = function(text) {
        var input = document.getElementById('ampChatInput');
        var msg = text || (input ? input.value : '');
        if (!msg || !msg.trim()) return;

        // Add user message
        chatMessages.push({ role: 'user', html: escapeHtml(msg) });
        renderProdMode();

        // Scroll to bottom
        var body = document.getElementById('ampChatBody');
        if (body) body.scrollTop = body.scrollHeight;

        // Typing indicator
        setTimeout(function() {
            // Find matching response
            var responseKey = null;
            var lowerMsg = msg.toLowerCase();
            Object.keys(CHAT_RESPONSES).forEach(function(key) {
                if (lowerMsg.indexOf(key) >= 0) responseKey = key;
            });

            var response = responseKey ? CHAT_RESPONSES[responseKey] : {
                text: 'I can help you with portfolio management queries. Try asking about trade required portfolios, draft orders, portfolios needing attention, or cash drift summary.',
                table: null
            };

            var responseHtml = '<p>' + response.text + '</p>';
            if (response.table) {
                var cols = Object.keys(response.table[0]);
                responseHtml += '<table class="amp-chat-table"><thead><tr>' +
                    cols.map(function(c) { return '<th>' + c.charAt(0).toUpperCase() + c.slice(1) + '</th>'; }).join('') +
                    '</tr></thead><tbody>' +
                    response.table.map(function(row) {
                        return '<tr>' + cols.map(function(c) { return '<td>' + row[c] + '</td>'; }).join('') + '</tr>';
                    }).join('') +
                    '</tbody></table>';
            }

            chatMessages.push({ role: 'assistant', html: responseHtml });
            renderProdMode();

            var body2 = document.getElementById('ampChatBody');
            if (body2) body2.scrollTop = body2.scrollHeight;
        }, 800);
    };

    // ========================================
    // HOOK INTO ASSET MODULE OPEN
    // ========================================

    var originalOpenAssetManagement = window.openAssetManagement;

    window.openAssetManagement = function() {
        if (prodModeActive) {
            var container = document.getElementById('assetModule');
            if (container) container.style.display = '';
            currentView = 'welcome';
            chatMessages = [];
            chatOpen = false;
            workflowExpandedId = null;
            renderProdMode();
        } else {
            if (typeof originalOpenAssetManagement === 'function') {
                originalOpenAssetManagement();
            }
        }
    };

    // ========================================
    // INITIALIZATION
    // ========================================

    function init() {
        // Restore toggle state from localStorage
        var savedState = localStorage.getItem('amProdMode');
        prodModeActive = savedState === '1';
        var toggle = document.getElementById('amProdModeToggle');
        if (toggle) toggle.checked = prodModeActive;
    }

    // Init on DOMContentLoaded or immediately if already loaded
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();
