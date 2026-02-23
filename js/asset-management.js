// ========================================
// ASSET MANAGEMENT MODULE
// Portfolio Management Dashboard - Active Equities
// Dark Finance Terminal Theme
// ========================================

var assetModuleLoaded = false;

(function() {
    'use strict';

    // ========================================
    // SVG ICON LIBRARY (Lucide-style)
    // ========================================
    var ICONS = {
        chart: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline></svg>',
        chevronDown: '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>',
        chevronRight: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>',
        chevronLeft: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>',
        settings: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>',
        user: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>',
        arrowLeft: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>',
        search: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>',
        alertTriangle: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>',
        alertCircle: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>',
        check: '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>',
        checkCircle: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>',
        clock: '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>',
        x: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>',
        panelRight: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="15" y1="3" x2="15" y2="21"></line></svg>',
        panelLeft: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="9" y1="3" x2="9" y2="21"></line></svg>',
        portfolio: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path></svg>',
        cash: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="1" x2="12" y2="23"></line><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>',
        currency: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="2" y1="12" x2="22" y2="12"></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path></svg>',
        strategy: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 2 7 12 12 22 7 12 2"></polygon><polyline points="2 17 12 22 22 17"></polyline><polyline points="2 12 12 17 22 12"></polyline></svg>',
        optimizer: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="4 17 10 11 4 5"></polyline><line x1="12" y1="19" x2="20" y2="19"></line></svg>',
        am: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path></svg>',
        corc: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line></svg>',
        bot: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="10" rx="2"></rect><circle cx="12" cy="5" r="2"></circle><path d="M12 7v4"></path><line x1="8" y1="16" x2="8" y2="16"></line><line x1="16" y1="16" x2="16" y2="16"></line></svg>',
        send: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>',
        messageSquare: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>',
        info: '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>',
        arrowUpDown: '<svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M7 15l5 5 5-5"></path><path d="M7 9l5-5 5 5"></path></svg>',
        arrowUp: '<svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 19V5"></path><polyline points="5 12 12 5 19 12"></polyline></svg>',
        arrowDown: '<svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 5v14"></path><polyline points="19 12 12 19 5 12"></polyline></svg>',
        zap: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg>'
    };

    // ========================================
    // DUMMY DATA
    // ========================================

    var SOD_CHANGE_REASONS = [
        'Flow missing', 'Overbought', 'Oversold', 'Income received',
        'Mgmt/service fee booked', 'Market movement on trades',
        'Provision (NAV) vs definitive flow', 'Custodian holiday',
        'Dual trade', 'Flow CSV mismatch', 'Cashflow - fund distribution',
        'Price correction', 'FX rate change', 'Settlement failure'
    ];

    var PM_NAMES = ['John Smith', 'Sarah Johnson', 'Michael Chen'];

    var PORTFOLIOS = [
        { id: 'S0174903', name: 'UBS (LUX) Thematic Opportunities Equity', model: 'MESGAAWY1', ccy: 'USD', aum: 245300000, cashTarget: 0.85, cashDrift: -0.12, cashActual: 0.73, assetClass: 'Active EQ', pm: 'John Smith' },
        { id: 'S0174901', name: 'UBS (LUX) AI and Robotics Equity Fund', model: 'MESGAASH', ccy: 'USD', aum: 187600000, cashTarget: 1.20, cashDrift: 0.05, cashActual: 1.25, assetClass: 'Active EQ', pm: 'Sarah Johnson' },
        { id: 'S0174905', name: 'UBS D.L100 Security Equity Fund', model: 'MESGBBR1', ccy: 'EUR', aum: 92400000, cashTarget: 0.50, cashDrift: -0.08, cashActual: 0.42, assetClass: 'Fixed Income', pm: 'Michael Chen' },
        { id: 'S0174907', name: 'UBS D.L100 All Rounder Equity Fund', model: 'MESGBBR2', ccy: 'EUR', aum: 134800000, cashTarget: 0.65, cashDrift: 0.03, cashActual: 0.68, assetClass: 'Multi Asset', pm: 'John Smith' },
        { id: 'S0174909', name: 'UBS (CH) Global Leaders Equity', model: 'MESGCCW1', ccy: 'CHF', aum: 312500000, cashTarget: 1.00, cashDrift: -0.15, cashActual: 0.85, assetClass: 'Active EQ', pm: 'Sarah Johnson' },
        { id: 'S0174911', name: 'UBS (LUX) Sustainable Climate Equity', model: 'MESGDDX1', ccy: 'EUR', aum: 78900000, cashTarget: 0.45, cashDrift: 0.02, cashActual: 0.47, assetClass: 'Active EQ', pm: 'Michael Chen' },
        { id: 'S0174913', name: 'UBS (LUX) Digital Health Equity Fund', model: 'MESGDDX2', ccy: 'USD', aum: 156200000, cashTarget: 0.90, cashDrift: -0.11, cashActual: 0.79, assetClass: 'Active EQ', pm: 'John Smith' },
        { id: 'S0174915', name: 'UBS (GB) UK Opportunities Equity', model: 'MESGEEY1', ccy: 'GBP', aum: 203700000, cashTarget: 0.75, cashDrift: 0.08, cashActual: 0.83, assetClass: 'Multi Asset', pm: 'Sarah Johnson' },
        { id: 'S0174917', name: 'UBS (LUX) China Innovation Equity', model: 'MESGEEY2', ccy: 'USD', aum: 67800000, cashTarget: 1.50, cashDrift: -0.09, cashActual: 1.41, assetClass: 'Active EQ', pm: 'Michael Chen' },
        { id: 'S0174919', name: 'UBS (CH) Swiss Mid Cap Equity', model: 'MESGFFZ1', ccy: 'CHF', aum: 445600000, cashTarget: 0.30, cashDrift: 0.01, cashActual: 0.31, assetClass: 'Active EQ', pm: 'John Smith' },
        { id: 'S0174921', name: 'UBS (LUX) European Value Equity', model: 'MESGFFZ2', ccy: 'EUR', aum: 289100000, cashTarget: 0.60, cashDrift: -0.05, cashActual: 0.55, assetClass: 'Fixed Income', pm: 'Sarah Johnson' },
        { id: 'S0174923', name: 'UBS (LUX) Asia Pacific Growth Equity', model: 'MESGGGW1', ccy: 'USD', aum: 118400000, cashTarget: 1.10, cashDrift: 0.10, cashActual: 1.20, assetClass: 'Active EQ', pm: 'Michael Chen' },
        { id: 'S0174925', name: 'UBS (LUX) Global Dividend Kings Fund', model: 'MESGGGW2', ccy: 'USD', aum: 356700000, cashTarget: 0.80, cashDrift: -0.04, cashActual: 0.76, assetClass: 'Multi Asset', pm: 'John Smith' },
        { id: 'S0174927', name: 'UBS (DE) Germany Blue Chip Equity', model: 'MESGHHY1', ccy: 'EUR', aum: 198300000, cashTarget: 0.55, cashDrift: 0.06, cashActual: 0.61, assetClass: 'Active EQ', pm: 'Sarah Johnson' },
        { id: 'S0174929', name: 'UBS (LUX) FinTech Innovation Equity', model: 'MESGHHY2', ccy: 'USD', aum: 54200000, cashTarget: 2.00, cashDrift: -0.13, cashActual: 1.87, assetClass: 'Active EQ', pm: 'Michael Chen' },
        { id: 'S0174931', name: 'UBS (LUX) Infrastructure Equity Fund', model: 'MESGIIZ1', ccy: 'EUR', aum: 267900000, cashTarget: 0.70, cashDrift: 0.04, cashActual: 0.74, assetClass: 'Fixed Income', pm: 'John Smith' },
        { id: 'S0174933', name: 'UBS (LUX) Clean Energy Transition Equity', model: 'MESGIIZ2', ccy: 'USD', aum: 143500000, cashTarget: 0.95, cashDrift: -0.07, cashActual: 0.88, assetClass: 'Multi Asset', pm: 'Sarah Johnson' },
        { id: 'S0174935', name: 'UBS (CH) Swiss Large Cap Equity', model: 'MESGJJW1', ccy: 'CHF', aum: 498200000, cashTarget: 0.35, cashDrift: 0.02, cashActual: 0.37, assetClass: 'Active EQ', pm: 'Michael Chen' },
        { id: 'S0174937', name: 'UBS (LUX) Emerging Markets Leaders Equity', model: 'MESGJJW2', ccy: 'USD', aum: 87600000, cashTarget: 1.30, cashDrift: -0.10, cashActual: 1.20, assetClass: 'Active EQ', pm: 'John Smith' },
        { id: 'S0174939', name: 'UBS (LUX) US Quality Growth Equity', model: 'MESGKKX1', ccy: 'USD', aum: 412800000, cashTarget: 0.40, cashDrift: 0.01, cashActual: 0.41, assetClass: 'Active EQ', pm: 'Sarah Johnson' },
        { id: 'S0174941', name: 'UBS (GB) UK Small Cap Equity Fund', model: 'MESGKKX2', ccy: 'GBP', aum: 34500000, cashTarget: 1.80, cashDrift: -0.06, cashActual: 1.74, assetClass: 'Fixed Income', pm: 'Michael Chen' },
        { id: 'S0174943', name: 'UBS (LUX) Metaverse & Web3 Equity', model: 'MESGLLY1', ccy: 'USD', aum: 28900000, cashTarget: 1.60, cashDrift: 0.09, cashActual: 1.69, assetClass: 'Active EQ', pm: 'John Smith' },
        { id: 'S0174945', name: 'UBS (LUX) Nordic Equity Opportunities', model: 'MESGLLY2', ccy: 'EUR', aum: 76300000, cashTarget: 0.50, cashDrift: -0.03, cashActual: 0.47, assetClass: 'Multi Asset', pm: 'Sarah Johnson' },
        { id: 'S0174947', name: 'UBS (LUX) Japan Select Equity Fund', model: 'MESGMMZ1', ccy: 'USD', aum: 165400000, cashTarget: 0.75, cashDrift: 0.07, cashActual: 0.82, assetClass: 'Multi Asset', pm: 'Michael Chen' },
        { id: 'S0174949', name: 'UBS (LUX) Global Biotech Equity Fund', model: 'MESGMMZ2', ccy: 'USD', aum: 93100000, cashTarget: 1.40, cashDrift: -0.14, cashActual: 1.26, assetClass: 'Fixed Income', pm: 'John Smith' }
    ];

    // Event Monitor Data
    var EVENT_MONITOR_DATA = {
        incoming: [
            { priority: 'critical', wfStatus: 'New', portfolio: PORTFOLIOS[0], event: 'Cashflow', wfId: 'WF-8841', wfStep: 1, wfTotal: 3, countdown: 540, pfStatus: 'Active', orderStatus: 'Draft', sodReason: '', sodComplete: false, asOfDate: '2025-06-18', cfAmount: -2500000 },
            { priority: 'critical', wfStatus: 'New', portfolio: PORTFOLIOS[4], event: 'SOD Break', wfId: 'WF-8842', wfStep: 0, wfTotal: 2, countdown: 0, pfStatus: 'Active', orderStatus: '', sodReason: '', sodComplete: false, asOfDate: '2025-06-18', cfAmount: 0 },
            { priority: 'warning', wfStatus: 'New', portfolio: PORTFOLIOS[8], event: 'Rebalance', wfId: 'WF-8843', wfStep: 0, wfTotal: 3, countdown: 0, pfStatus: 'Active', orderStatus: '', sodReason: '', sodComplete: false, asOfDate: '2025-06-18', cfAmount: 0 },
            { priority: 'warning', wfStatus: 'New', portfolio: PORTFOLIOS[12], event: 'Cash Drift', wfId: 'WF-8844', wfStep: 0, wfTotal: 3, countdown: 0, pfStatus: 'Active', orderStatus: '', sodReason: '', sodComplete: false, asOfDate: '2025-06-18', cfAmount: 0 }
        ],
        attention: [
            { priority: 'critical', wfStatus: 'In Progress', portfolio: PORTFOLIOS[1], event: 'Cashflow', wfId: 'WF-8830', wfStep: 2, wfTotal: 3, countdown: 320, pfStatus: 'Active', orderStatus: 'PTC completed', sodReason: 'Flow missing', sodComplete: true, asOfDate: '2025-06-18', cfAmount: 5000000 },
            { priority: 'warning', wfStatus: 'In Progress', portfolio: PORTFOLIOS[3], event: 'SOD Break', wfId: 'WF-8831', wfStep: 1, wfTotal: 2, countdown: 0, pfStatus: 'Review', orderStatus: '', sodReason: 'Price correction', sodComplete: false, asOfDate: '2025-06-18', cfAmount: 0 },
            { priority: 'warning', wfStatus: 'In Progress', portfolio: PORTFOLIOS[6], event: 'Cashflow', wfId: 'WF-8832', wfStep: 2, wfTotal: 3, countdown: 180, pfStatus: 'Active', orderStatus: 'Ready to send', sodReason: '', sodComplete: true, asOfDate: '2025-06-18', cfAmount: -1800000 },
            { priority: 'info', wfStatus: 'In Progress', portfolio: PORTFOLIOS[10], event: 'Rebalance', wfId: 'WF-8833', wfStep: 1, wfTotal: 3, countdown: 0, pfStatus: 'Active', orderStatus: 'Draft', sodReason: '', sodComplete: true, asOfDate: '2025-06-18', cfAmount: 0 },
            { priority: 'info', wfStatus: 'Pending', portfolio: PORTFOLIOS[14], event: 'Cash Drift', wfId: 'WF-8834', wfStep: 1, wfTotal: 3, countdown: 0, pfStatus: 'Active', orderStatus: '', sodReason: 'FX rate change', sodComplete: true, asOfDate: '2025-06-18', cfAmount: 0 }
        ],
        completed: []
    };

    // Generate 16 completed events
    var completedIndices = [2, 5, 7, 9, 11, 13, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24];
    var completedEvents = ['Cashflow', 'SOD Break', 'Rebalance', 'Cash Drift', 'Cashflow', 'SOD Break', 'Rebalance', 'Cashflow', 'Cash Drift', 'SOD Break', 'Cashflow', 'Rebalance', 'SOD Break', 'Cashflow', 'Cash Drift', 'Rebalance'];
    var completedReasons = ['Flow missing', 'Price correction', '', 'FX rate change', 'Income received', 'Market movement on trades', '', 'Mgmt/service fee booked', '', 'Overbought', 'Cashflow - fund distribution', '', 'Settlement failure', 'Flow missing', 'Dual trade', ''];
    for (var ci = 0; ci < 16; ci++) {
        var pIdx = completedIndices[ci] < PORTFOLIOS.length ? completedIndices[ci] : ci % PORTFOLIOS.length;
        EVENT_MONITOR_DATA.completed.push({
            priority: 'info', wfStatus: 'Completed', portfolio: PORTFOLIOS[pIdx],
            event: completedEvents[ci], wfId: 'WF-88' + (10 + ci), wfStep: 3, wfTotal: 3,
            countdown: 0, pfStatus: 'Active', orderStatus: 'Completed', sodReason: completedReasons[ci],
            sodComplete: true, asOfDate: '2025-06-18', cfAmount: ci % 3 === 0 ? (ci % 2 === 0 ? 3200000 : -1500000) : 0
        });
    }

    // Cashflow Data (12 portfolios)
    var CASHFLOW_DATA = [
        { portfolio: PORTFOLIOS[0], cfAmount: -2500000, cfType: 'Redemption', wfStep: 1, wfTotal: 3, countdown: 540, orderStatus: 'Draft', tradeRequired: true, orders: 8 },
        { portfolio: PORTFOLIOS[1], cfAmount: 5000000, cfType: 'Subscription', wfStep: 2, wfTotal: 3, countdown: 0, orderStatus: 'PTC completed', tradeRequired: true, orders: 12 },
        { portfolio: PORTFOLIOS[6], cfAmount: -1800000, cfType: 'Redemption', wfStep: 3, wfTotal: 3, countdown: 0, orderStatus: 'Ready to send', tradeRequired: true, orders: 6 },
        { portfolio: PORTFOLIOS[3], cfAmount: 3200000, cfType: 'Subscription', wfStep: 1, wfTotal: 3, countdown: 420, orderStatus: 'Draft', tradeRequired: true, orders: 10 },
        { portfolio: PORTFOLIOS[9], cfAmount: -950000, cfType: 'Redemption', wfStep: 3, wfTotal: 3, countdown: 0, orderStatus: 'Trading', tradeRequired: false, orders: 4 },
        { portfolio: PORTFOLIOS[12], cfAmount: 7500000, cfType: 'Subscription', wfStep: 2, wfTotal: 3, countdown: 0, orderStatus: 'PTC completed', tradeRequired: true, orders: 15 },
        { portfolio: PORTFOLIOS[15], cfAmount: -4100000, cfType: 'Redemption', wfStep: 3, wfTotal: 3, countdown: 0, orderStatus: 'Ready to send', tradeRequired: true, orders: 9 },
        { portfolio: PORTFOLIOS[7], cfAmount: 1200000, cfType: 'Subscription', wfStep: 3, wfTotal: 3, countdown: 0, orderStatus: 'Completed', tradeRequired: false, orders: 5 },
        { portfolio: PORTFOLIOS[19], cfAmount: -680000, cfType: 'Redemption', wfStep: 2, wfTotal: 3, countdown: 0, orderStatus: 'Draft', tradeRequired: true, orders: 3 },
        { portfolio: PORTFOLIOS[11], cfAmount: 2900000, cfType: 'Subscription', wfStep: 3, wfTotal: 3, countdown: 0, orderStatus: 'Trading', tradeRequired: false, orders: 7 },
        { portfolio: PORTFOLIOS[16], cfAmount: -3300000, cfType: 'Redemption', wfStep: 1, wfTotal: 3, countdown: 280, orderStatus: 'Draft', tradeRequired: true, orders: 11 },
        { portfolio: PORTFOLIOS[23], cfAmount: 1500000, cfType: 'Subscription', wfStep: 3, wfTotal: 3, countdown: 0, orderStatus: 'Completed', tradeRequired: false, orders: 6 }
    ];

    // SOD Alert Data (6 portfolios)
    var SOD_ALERT_DATA = [
        { portfolio: PORTFOLIOS[4], reason: 'Flow missing', autoDetected: true, investigated: true, eodPct: 0.85, sodPct: 0.70, changePct: -0.15, attributes: [
            { attr: 'Cash Position', eod: '0.85%', sod: '0.70%', change: '-0.15%', comment: 'Unexpected cash decrease' },
            { attr: 'NAV', eod: '312.5M', sod: '311.8M', change: '-0.22%', comment: 'NAV drift detected' },
            { attr: 'FX Rate (USD/CHF)', eod: '0.8921', sod: '0.8918', change: '-0.03%', comment: 'Minor FX movement' },
            { attr: 'Position Count', eod: '147', sod: '147', change: '0', comment: 'No change' }
        ]},
        { portfolio: PORTFOLIOS[8], reason: 'Price correction', autoDetected: true, investigated: false, eodPct: 1.50, sodPct: 1.41, changePct: -0.09, attributes: [
            { attr: 'Cash Position', eod: '1.50%', sod: '1.41%', change: '-0.09%', comment: 'Price adj. impact' },
            { attr: 'NAV', eod: '67.8M', sod: '67.2M', change: '-0.88%', comment: 'Significant NAV change' },
            { attr: 'Top Holding Wt.', eod: '4.82%', sod: '4.91%', change: '+0.09%', comment: 'Weight shift from price' },
            { attr: 'Tracking Error', eod: '1.23%', sod: '1.31%', change: '+0.08%', comment: 'TE increase' }
        ]},
        { portfolio: PORTFOLIOS[14], reason: 'FX rate change', autoDetected: true, investigated: true, eodPct: 2.00, sodPct: 1.87, changePct: -0.13, attributes: [
            { attr: 'Cash Position', eod: '2.00%', sod: '1.87%', change: '-0.13%', comment: 'FX impact on cash' },
            { attr: 'FX Rate (EUR/USD)', eod: '1.0842', sod: '1.0791', change: '-0.47%', comment: 'Significant FX move' },
            { attr: 'NAV (local)', eod: '54.2M', sod: '53.9M', change: '-0.55%', comment: 'FX driven' },
            { attr: 'Hedge Ratio', eod: '98.2%', sod: '97.8%', change: '-0.4%', comment: 'Below threshold' }
        ]},
        { portfolio: PORTFOLIOS[2], reason: '', autoDetected: false, investigated: false, eodPct: 0.50, sodPct: 0.42, changePct: -0.08, attributes: [
            { attr: 'Cash Position', eod: '0.50%', sod: '0.42%', change: '-0.08%', comment: 'Reason unknown' },
            { attr: 'NAV', eod: '92.4M', sod: '92.1M', change: '-0.32%', comment: 'Under investigation' },
            { attr: 'Accrued Income', eod: '0.12M', sod: '0.09M', change: '-25.0%', comment: 'Significant drop' },
            { attr: 'Trade Settl.', eod: '3', sod: '1', change: '-2', comment: 'Settlements processed' }
        ]},
        { portfolio: PORTFOLIOS[16], reason: '', autoDetected: false, investigated: false, eodPct: 0.95, sodPct: 0.88, changePct: -0.07, attributes: [
            { attr: 'Cash Position', eod: '0.95%', sod: '0.88%', change: '-0.07%', comment: 'Pending analysis' },
            { attr: 'NAV', eod: '143.5M', sod: '143.1M', change: '-0.28%', comment: 'Minor NAV change' },
            { attr: 'Corp. Actions', eod: '0', sod: '1', change: '+1', comment: 'New corporate action' },
            { attr: 'Dividend Accrual', eod: '0.34M', sod: '0.29M', change: '-14.7%', comment: 'Ex-date impact?' }
        ]},
        { portfolio: PORTFOLIOS[20], reason: '', autoDetected: false, investigated: false, eodPct: 1.80, sodPct: 1.74, changePct: -0.06, attributes: [
            { attr: 'Cash Position', eod: '1.80%', sod: '1.74%', change: '-0.06%', comment: 'Small deviation' },
            { attr: 'NAV', eod: '34.5M', sod: '34.3M', change: '-0.58%', comment: 'Check required' },
            { attr: 'FX Rate (GBP/USD)', eod: '1.2714', sod: '1.2698', change: '-0.13%', comment: 'Minor FX' },
            { attr: 'Open Orders', eod: '2', sod: '0', change: '-2', comment: 'Orders settled' }
        ]}
    ];

    // SOD Item Changes Data (52 items)
    var SOD_ITEM_CHANGES = [];
    var itemAttributes = ['Cash Position', 'NAV', 'FX Rate', 'Position Weight', 'Accrued Income', 'Tracking Error', 'Settlement Status', 'Dividend Accrual'];
    var itemStatuses = ['Resolved', 'Pending', 'Under Review', 'Acknowledged'];
    for (var si = 0; si < 52; si++) {
        var pfIndex = si % PORTFOLIOS.length;
        var attrIndex = si % itemAttributes.length;
        var statusIndex = si % itemStatuses.length;
        var eodVal = (Math.random() * 100).toFixed(2);
        var changeVal = ((Math.random() - 0.5) * 2).toFixed(4);
        var sodVal = (parseFloat(eodVal) + parseFloat(changeVal)).toFixed(2);
        SOD_ITEM_CHANGES.push({
            num: si + 1,
            portfolio: PORTFOLIOS[pfIndex],
            securityId: 'ISIN' + String(1000000 + si),
            securityName: ['Apple Inc.', 'Microsoft Corp.', 'Nestle SA', 'Novartis AG', 'ASML Holding', 'LVMH', 'Samsung Electronics', 'Toyota Motor', 'Roche Holding', 'SAP SE', 'Siemens AG', 'AstraZeneca', 'Shell PLC', 'Unilever PLC', 'BHP Group'][si % 15],
            attribute: itemAttributes[attrIndex],
            eodValue: eodVal,
            sodValue: sodVal,
            change: changeVal,
            status: itemStatuses[statusIndex]
        });
    }

    // Ongoing Orders Data (58 orders)
    var ONGOING_ORDERS = [];
    var orderStatuses = ['Working', 'Partially Filled', 'Filled', 'Pending', 'Cancelled', 'Working', 'Partially Filled', 'Working'];
    var sides = ['Buy', 'Sell'];
    var traders = ['M. Weber', 'S. Chen', 'J. Mueller', 'A. Patel', 'L. Rossi', 'K. Tanaka'];
    var securities = ['AAPL US', 'MSFT US', 'NESN SW', 'NOVN SW', 'ASML NA', 'MC FP', '005930 KS', '7203 JP', 'ROG SW', 'SAP GR', 'SIE GR', 'AZN LN', 'SHEL LN', 'ULVR LN', 'BHP AU', 'AMZN US', 'GOOGL US', 'TSLA US', 'NVDA US', 'META US'];
    for (var oi = 0; oi < 58; oi++) {
        var pfIdx = oi % PORTFOLIOS.length;
        var secIdx = oi % securities.length;
        var sideIdx = oi % 2;
        var statusIdx = oi % orderStatuses.length;
        var traderIdx = oi % traders.length;
        var qty = Math.floor(Math.random() * 50000) + 1000;
        var limitPrice = (Math.random() * 500 + 10).toFixed(2);
        var fillPct = orderStatuses[statusIdx] === 'Filled' ? 100 : orderStatuses[statusIdx] === 'Cancelled' ? 0 : orderStatuses[statusIdx] === 'Pending' ? 0 : Math.floor(Math.random() * 85) + 10;
        var hours = 7 + Math.floor(oi / 10);
        var mins = (oi * 7) % 60;
        ONGOING_ORDERS.push({
            orderId: 'ORD-' + String(100000 + oi),
            portfolio: PORTFOLIOS[pfIdx],
            security: securities[secIdx],
            side: sides[sideIdx],
            quantity: qty,
            limitPrice: parseFloat(limitPrice),
            fillPct: fillPct,
            status: orderStatuses[statusIdx],
            trader: traders[traderIdx],
            timestamp: String(hours).padStart(2, '0') + ':' + String(mins).padStart(2, '0') + ':' + String((oi * 13) % 60).padStart(2, '0')
        });
    }


    // ========================================
    // STATE MANAGEMENT
    // ========================================
    var state = {
        activeTab: 'eventMonitor',
        activeSidebar: 'portfolio',
        assetClass: 'Active EQ',
        pm: 'All',
        selectedPortfolio: null,
        selectedRowIndex: null,
        panelMode: null, // 'detail' | 'chatbot' | null
        chatMessages: [],
        searchQuery: '',
        activeFilter: 'all',
        sortColumn: null,
        sortDirection: 'asc',
        collapsedGroups: new Set(),
        countdownTimers: {},
        sodSubTab: 'detailed',
        lastUpdated: new Date()
    };

    var timerIntervals = [];

    // ========================================
    // UTILITY FUNCTIONS
    // ========================================

    function formatNumber(num) {
        return num.toLocaleString('en-US');
    }

    function formatCurrency(num, ccy) {
        if (Math.abs(num) >= 1000000) {
            return (num / 1000000).toFixed(1) + 'M ' + ccy;
        }
        return formatNumber(num) + ' ' + ccy;
    }

    function formatAum(num) {
        if (num >= 1000000000) return (num / 1000000000).toFixed(1) + 'B';
        if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
        return formatNumber(num);
    }

    function formatDate(dateStr) {
        var parts = dateStr.split('-');
        var months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
        return parts[2] + '. ' + months[parseInt(parts[1]) - 1] + '. ' + parts[0];
    }

    function formatTime(date) {
        return String(date.getHours()).padStart(2, '0') + ':' +
               String(date.getMinutes()).padStart(2, '0') + ':' +
               String(date.getSeconds()).padStart(2, '0');
    }

    function formatCountdown(seconds) {
        if (seconds <= 0) return '--:--';
        var m = Math.floor(seconds / 60);
        var s = seconds % 60;
        return String(m).padStart(2, '0') + ':' + String(s).padStart(2, '0') + ' remaining';
    }

    function escapeHtml(str) {
        var div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }

    function updateLastUpdated() {
        state.lastUpdated = new Date();
        var el = document.getElementById('amLastUpdated');
        if (el) el.textContent = formatTime(state.lastUpdated);
    }

    function clearAllTimers() {
        timerIntervals.forEach(function(id) { clearInterval(id); });
        timerIntervals = [];
    }

    // ========================================
    // PORTFOLIO FILTERING (Asset Class + PM)
    // ========================================

    function portfolioMatchesFilters(portfolio) {
        if (state.assetClass && portfolio.assetClass !== state.assetClass) return false;
        if (state.pm && state.pm !== 'All' && portfolio.pm !== state.pm) return false;
        return true;
    }

    function getFilteredPortfolios() {
        return PORTFOLIOS.filter(portfolioMatchesFilters);
    }

    // ========================================
    // RENDER: HEADER BAR
    // ========================================

    function renderHeader() {
        var assetClasses = ['Active EQ', 'Fixed Income', 'Multi Asset'];
        var assetOpts = assetClasses.map(function(ac) {
            return '<option' + (state.assetClass === ac ? ' selected' : '') + '>' + ac + '</option>';
        }).join('');

        var pmOpts = '<option' + (state.pm === 'All' ? ' selected' : '') + '>All</option>';
        pmOpts += PM_NAMES.map(function(name) {
            return '<option' + (state.pm === name ? ' selected' : '') + '>' + name + '</option>';
        }).join('');

        var filteredCount = getFilteredPortfolios().length;

        return '<div class="am-header">' +
            '<div class="am-header-left">' +
                '<div class="am-logo">' + ICONS.chart + ' Active Equities</div>' +
                '<select class="am-header-select" onchange="amSetAssetClass(this.value)">' +
                    assetOpts +
                '</select>' +
                '<select class="am-header-select" onchange="amSetPm(this.value)">' +
                    pmOpts +
                '</select>' +
                '<span class="am-filter-count">' + filteredCount + ' / ' + PORTFOLIOS.length + '</span>' +
            '</div>' +
            '<div class="am-header-right">' +
                '<div class="am-live-indicator"><div class="am-live-dot"></div>LIVE</div>' +
                '<span class="am-last-updated" id="amLastUpdated">' + formatTime(state.lastUpdated) + '</span>' +
                '<button class="am-header-btn" title="Settings">' + ICONS.settings + '</button>' +
                '<button class="am-header-btn" title="User">' + ICONS.user + '</button>' +
                '<button class="am-back-btn" onclick="backToLanding()">' + ICONS.arrowLeft + ' Back</button>' +
            '</div>' +
        '</div>';
    }

    // ========================================
    // RENDER: FILTER BAR
    // ========================================

    function renderFilterBar() {
        var filters = [
            { key: 'all', label: 'All' },
            { key: 'sod', label: 'SOD' },
            { key: 'cashflow', label: 'Cashflow' },
            { key: 'alerts', label: 'Alerts' }
        ];

        var chipsHtml = filters.map(function(f) {
            return '<button class="am-filter-chip' + (state.activeFilter === f.key ? ' active' : '') +
                '" onclick="amSetFilter(\'' + f.key + '\')">' + f.label + '</button>';
        }).join('');

        return '<div class="am-filter-bar">' +
            '<span class="am-filter-label">Portfolios:</span>' +
            '<span class="am-filter-value">' + getFilteredPortfolios().length + ' of ' + PORTFOLIOS.length + '</span>' +
            '<div class="am-filter-divider"></div>' +
            '<span class="am-filter-label">Incl. OIS orders:</span>' +
            '<select class="am-header-select" style="font-size:11px;padding:2px 20px 2px 6px;">' +
                '<option>Yes</option><option>No</option>' +
            '</select>' +
            '<div class="am-filter-divider"></div>' +
            '<div class="am-filter-chips">' + chipsHtml + '</div>' +
            '<div class="am-search-wrapper">' +
                ICONS.search +
                '<input type="text" class="am-search-input" placeholder="Search portfolios..." value="' + escapeHtml(state.searchQuery) + '" oninput="amSearch(this.value)" />' +
            '</div>' +
        '</div>';
    }

    // ========================================
    // RENDER: TAB NAVIGATION
    // ========================================

    // Tabs per sidebar section
    var SIDEBAR_TABS = {
        portfolio: [
            { key: 'eventMonitor', label: 'Event Monitor', badge: '4', alert: true },
            { key: 'sodAlert', label: 'SOD Alert', badge: '6', alert: true },
            { key: 'sodItemChanges', label: 'SOD Item Changes', badge: '52', alert: false },
            { key: 'cashflows', label: 'Cashflows', badge: '12', alert: false },
            { key: 'ongoingOrders', label: 'Ongoing Orders', badge: '58', alert: false }
        ],
        cash: [
            { key: 'cashBalances', label: 'Cash Balances', badge: String(PORTFOLIOS.length), alert: false },
            { key: 'cashProjection', label: 'Cash Projection', badge: '5', alert: false },
            { key: 'cashDrift', label: 'Cash Drift', badge: String(PORTFOLIOS.filter(function(p) { return Math.abs(p.cashDrift) > 0.05; }).length), alert: true }
        ],
        currency: [
            { key: 'fxExposure', label: 'FX Exposure', badge: '4', alert: false },
            { key: 'hedging', label: 'Hedging Ratios', badge: '2', alert: true },
            { key: 'fxOrders', label: 'FX Orders', badge: '8', alert: false }
        ],
        strategy: [
            { key: 'modelAllocation', label: 'Model Allocation', badge: String(PORTFOLIOS.length), alert: false },
            { key: 'trackingError', label: 'Tracking Error', badge: '3', alert: true },
            { key: 'rebalancing', label: 'Rebalancing Queue', badge: '4', alert: false }
        ],
        optimizer: [
            { key: 'optimizerQueue', label: 'Optimizer Queue', badge: '7', alert: false },
            { key: 'tradeList', label: 'Trade List', badge: '34', alert: false },
            { key: 'constraints', label: 'Constraints', badge: '2', alert: true }
        ],
        am: [
            { key: 'amOverview', label: 'AM Overview', badge: '', alert: false },
            { key: 'amTasks', label: 'Tasks', badge: '12', alert: true },
            { key: 'amReporting', label: 'Reporting', badge: '3', alert: false }
        ],
        corc: [
            { key: 'compliance', label: 'Compliance', badge: '5', alert: true },
            { key: 'riskMonitor', label: 'Risk Monitor', badge: '8', alert: true },
            { key: 'controls', label: 'Controls', badge: '14', alert: false }
        ]
    };

    function getDefaultTab(sidebarKey) {
        var tabs = SIDEBAR_TABS[sidebarKey];
        return tabs && tabs.length > 0 ? tabs[0].key : 'eventMonitor';
    }

    function renderTabNav() {
        var tabs = SIDEBAR_TABS[state.activeSidebar] || SIDEBAR_TABS.portfolio;

        var tabsHtml = tabs.map(function(t) {
            var cls = 'am-tab' + (state.activeTab === t.key ? ' active' : '');
            var badgeCls = 'am-tab-badge' + (t.alert ? ' alert' : '');
            var badgeHtml = t.badge ? '<span class="' + badgeCls + '">' + t.badge + '</span>' : '';
            return '<button class="' + cls + '" onclick="amSwitchTab(\'' + t.key + '\')">' +
                t.label + badgeHtml + '</button>';
        }).join('');

        return '<div class="am-tab-nav">' + tabsHtml + '</div>';
    }

    // ========================================
    // RENDER: LEFT SIDEBAR
    // ========================================

    function renderSidebar() {
        var items = [
            { key: 'portfolio', icon: 'portfolio', label: 'Portfolio' },
            { key: 'cash', icon: 'cash', label: 'Cash' },
            { key: 'currency', icon: 'currency', label: 'Currency' },
            { key: 'strategy', icon: 'strategy', label: 'Strategy' },
            { key: 'optimizer', icon: 'optimizer', label: 'Optimizer' },
            { key: 'am', icon: 'am', label: 'AM' },
            { key: 'corc', icon: 'corc', label: 'CORC' }
        ];

        var itemsHtml = items.map(function(item) {
            var isActive = state.activeSidebar === item.key;
            return '<button class="am-sidebar-item' + (isActive ? ' active' : '') + '" onclick="amSwitchSidebar(\'' + item.key + '\')">' +
                ICONS[item.icon] +
                '<span class="am-sidebar-label">' + item.label + '</span>' +
            '</button>';
        }).join('');

        return '<div class="am-sidebar">' + itemsHtml + '</div>';
    }

    // ========================================
    // RENDER: PRIORITY ICON
    // ========================================

    function renderPriorityIcon(priority) {
        if (priority === 'critical') {
            return '<span class="am-priority-critical">' + ICONS.alertCircle + '</span>';
        } else if (priority === 'warning') {
            return '<span class="am-priority-warning">' + ICONS.alertTriangle + '</span>';
        }
        return '<span class="am-priority-info">' + ICONS.info + '</span>';
    }

    // ========================================
    // RENDER: BADGE
    // ========================================

    function renderBadge(text, color) {
        if (!text) return '';
        return '<span class="am-badge am-badge-' + color + '">' + text + '</span>';
    }

    // ========================================
    // RENDER: STEPPER
    // ========================================

    function renderStepper(current, total) {
        var steps = '';
        for (var i = 1; i <= total; i++) {
            var cls = 'am-stepper-step';
            if (i < current) cls += ' completed';
            else if (i === current) cls += ' current';
            steps += '<div class="' + cls + '"></div>';
        }
        return '<div class="am-stepper">' + steps + '</div>';
    }

    // ========================================
    // RENDER: SORT ICON
    // ========================================

    function renderSortIcon(column) {
        if (state.sortColumn === column) {
            return '<span class="am-sort-icon">' + (state.sortDirection === 'asc' ? ICONS.arrowUp : ICONS.arrowDown) + '</span>';
        }
        return '<span class="am-sort-icon">' + ICONS.arrowUpDown + '</span>';
    }

    // ========================================
    // RENDER: EVENT STATUS BADGE COLOR
    // ========================================

    function getEventBadgeColor(event) {
        switch (event) {
            case 'Cashflow': return 'blue';
            case 'SOD Break': return 'red';
            case 'Rebalance': return 'amber';
            case 'Cash Drift': return 'cyan';
            default: return 'grey';
        }
    }

    function getOrderBadgeColor(status) {
        switch (status) {
            case 'Draft': return 'grey';
            case 'PTC completed': return 'blue';
            case 'Ready to send': return 'cyan';
            case 'Trading': return 'orange';
            case 'Completed': return 'green';
            default: return 'grey';
        }
    }

    function getWfStatusBadgeColor(status) {
        switch (status) {
            case 'New': return 'amber';
            case 'In Progress': return 'blue';
            case 'Pending': return 'grey';
            case 'Completed': return 'green';
            default: return 'grey';
        }
    }

    function getPfStatusBadgeColor(status) {
        switch (status) {
            case 'Active': return 'green';
            case 'Review': return 'amber';
            case 'Restricted': return 'red';
            default: return 'grey';
        }
    }


    // ========================================
    // TAB 1: EVENT MONITOR
    // ========================================

    function renderEventMonitorTable() {
        var groups = [
            { key: 'incoming', title: 'Incoming Event', data: EVENT_MONITOR_DATA.incoming, count: EVENT_MONITOR_DATA.incoming.length },
            { key: 'attention', title: 'Requires Attention', data: EVENT_MONITOR_DATA.attention, count: EVENT_MONITOR_DATA.attention.length },
            { key: 'completed', title: 'Completed', data: EVENT_MONITOR_DATA.completed, count: EVENT_MONITOR_DATA.completed.length }
        ];

        var html = '<div class="am-table-container">';

        // Table header
        html += '<table class="am-table"><thead><tr>' +
            '<th class="am-col-priority" onclick="amSort(\'priority\')">' + renderSortIcon('priority') + '</th>' +
            '<th class="am-col-status" onclick="amSort(\'wfStatus\')">Status' + renderSortIcon('wfStatus') + '</th>' +
            '<th class="am-col-id" onclick="amSort(\'id\')">Portfolio ID' + renderSortIcon('id') + '</th>' +
            '<th class="am-col-name" onclick="amSort(\'name\')">Name' + renderSortIcon('name') + '</th>' +
            '<th class="am-col-model" onclick="amSort(\'model\')">Model/PF' + renderSortIcon('model') + '</th>' +
            '<th class="am-col-event" onclick="amSort(\'event\')">Event' + renderSortIcon('event') + '</th>' +
            '<th class="am-col-wfid">WF ID</th>' +
            '<th class="am-col-action">WF Action</th>' +
            '<th class="am-col-countdown">Countdown</th>' +
            '<th class="am-col-pf-status">PF Status</th>' +
            '<th class="am-col-order">Order Status</th>' +
            '<th class="am-col-reason">SOD Reason</th>' +
            '<th class="am-col-sod">SOD</th>' +
            '<th class="am-col-date">As of Date</th>' +
            '<th class="am-col-ccy">CCY</th>' +
            '<th class="am-col-aum">Market Value</th>' +
            '<th class="am-col-target">Cash Tgt%</th>' +
            '<th class="am-col-cf-amount">CF Amount</th>' +
            '<th class="am-col-drift">Drift%</th>' +
            '<th class="am-col-actual">Actual%</th>' +
            '</tr></thead></table>';

        groups.forEach(function(group) {
            var isCollapsed = state.collapsedGroups.has(group.key);
            var chevronCls = 'am-group-chevron' + (isCollapsed ? ' collapsed' : '');

            html += '<div class="am-group-header" onclick="amToggleGroup(\'' + group.key + '\')">' +
                '<span class="' + chevronCls + '">' + ICONS.chevronDown + '</span>' +
                '<span class="am-group-title">' + group.title + '</span>' +
                '<span class="am-group-count">(' + group.count + ')</span>' +
            '</div>';

            if (!isCollapsed) {
                html += '<table class="am-table"><tbody>';
                var filteredData = filterEventData(group.data);
                filteredData.forEach(function(row, idx) {
                    var globalIdx = group.key + '-' + idx;
                    var selectedCls = (state.selectedRowIndex === globalIdx) ? ' selected' : '';
                    var p = row.portfolio;
                    var driftCls = p.cashDrift < 0 ? 'negative' : (p.cashDrift > 0 ? 'positive' : '');
                    var countdownId = 'em-cd-' + globalIdx;

                    html += '<tr class="' + selectedCls + '" onclick="amSelectEventRow(\'' + globalIdx + '\', \'' + group.key + '\', ' + idx + ')">' +
                        '<td class="am-col-priority">' + renderPriorityIcon(row.priority) + '</td>' +
                        '<td class="am-col-status">' + renderBadge(row.wfStatus, getWfStatusBadgeColor(row.wfStatus)) + '</td>' +
                        '<td class="am-col-id"><span class="am-mono">' + p.id + '</span></td>' +
                        '<td class="am-col-name">' + escapeHtml(p.name) + '</td>' +
                        '<td class="am-col-model"><span class="am-mono">' + p.model + '</span></td>' +
                        '<td class="am-col-event">' + renderBadge(row.event, getEventBadgeColor(row.event)) + '</td>' +
                        '<td class="am-col-wfid"><span class="am-mono">' + row.wfId + '</span></td>' +
                        '<td class="am-col-action">' + renderStepper(row.wfStep, row.wfTotal) + '</td>' +
                        '<td class="am-col-countdown">' + (row.countdown > 0 ? '<span class="am-countdown" id="' + countdownId + '">' + ICONS.clock + ' ' + formatCountdown(row.countdown) + '</span>' : '<span class="am-wf-start">08:31</span>') + '</td>' +
                        '<td class="am-col-pf-status">' + renderBadge(row.pfStatus, getPfStatusBadgeColor(row.pfStatus)) + '</td>' +
                        '<td class="am-col-order">' + (row.orderStatus ? renderBadge(row.orderStatus, getOrderBadgeColor(row.orderStatus)) : '') + '</td>' +
                        '<td class="am-col-reason">' + (row.sodReason ? '<span class="am-tag">' + row.sodReason + '</span>' : '') + '</td>' +
                        '<td class="am-col-sod">' + (row.sodComplete ? '<span class="am-check-icon">' + ICONS.check + '</span>' : '') + '</td>' +
                        '<td class="am-col-date"><span class="am-mono">' + formatDate(row.asOfDate) + '</span></td>' +
                        '<td class="am-col-ccy"><span class="am-mono">' + p.ccy + '</span></td>' +
                        '<td class="am-col-aum"><span class="am-num">' + formatAum(p.aum) + '</span></td>' +
                        '<td class="am-col-target"><span class="am-num">' + p.cashTarget.toFixed(2) + '%</span></td>' +
                        '<td class="am-col-cf-amount"><span class="am-num">' + (row.cfAmount !== 0 ? formatCurrency(row.cfAmount, p.ccy) : '') + '</span></td>' +
                        '<td class="am-col-drift"><span class="am-num ' + driftCls + '">' + (p.cashDrift >= 0 ? '+' : '') + p.cashDrift.toFixed(2) + '%</span></td>' +
                        '<td class="am-col-actual"><span class="am-num">' + p.cashActual.toFixed(2) + '%</span></td>' +
                    '</tr>';
                });
                html += '</tbody></table>';
            }
        });

        html += '</div>';
        return html;
    }

    function filterEventData(data) {
        return data.filter(function(row) {
            var p = row.portfolio;
            if (!portfolioMatchesFilters(p)) return false;
            if (state.searchQuery) {
                var q = state.searchQuery.toLowerCase();
                if (p.name.toLowerCase().indexOf(q) === -1 && p.id.toLowerCase().indexOf(q) === -1) return false;
            }
            if (state.activeFilter === 'sod') return row.event === 'SOD Break';
            if (state.activeFilter === 'cashflow') return row.event === 'Cashflow';
            if (state.activeFilter === 'alerts') return row.priority === 'critical' || row.priority === 'warning';
            return true;
        });
    }

    // ========================================
    // TAB 2: CASHFLOWS
    // ========================================

    function renderCashflowsTable() {
        var html = '<div class="am-table-container">';
        html += '<table class="am-table"><thead><tr>' +
            '<th class="am-col-id" onclick="amSort(\'id\')">Portfolio ID' + renderSortIcon('id') + '</th>' +
            '<th class="am-col-name" onclick="amSort(\'name\')">Name' + renderSortIcon('name') + '</th>' +
            '<th class="am-col-ccy">CCY</th>' +
            '<th class="am-col-event">CF Type</th>' +
            '<th class="am-col-cf-amount" onclick="amSort(\'cfAmount\')">CF Amount' + renderSortIcon('cfAmount') + '</th>' +
            '<th style="width:200px">Workflow</th>' +
            '<th class="am-col-countdown">Countdown</th>' +
            '<th class="am-col-order" onclick="amSort(\'orderStatus\')">Order Status' + renderSortIcon('orderStatus') + '</th>' +
            '<th style="width:60px;text-align:center">Orders</th>' +
            '<th style="width:60px;text-align:center">Trade</th>' +
            '<th style="width:220px">Actions</th>' +
            '<th class="am-col-aum">Market Value</th>' +
            '<th class="am-col-target">Cash Tgt%</th>' +
            '<th class="am-col-drift">Drift%</th>' +
            '</tr></thead><tbody>';

        var filtered = CASHFLOW_DATA.filter(function(row) {
            var p = row.portfolio;
            if (!portfolioMatchesFilters(p)) return false;
            if (state.searchQuery) {
                var q = state.searchQuery.toLowerCase();
                if (p.name.toLowerCase().indexOf(q) === -1 && p.id.toLowerCase().indexOf(q) === -1) return false;
            }
            return true;
        });

        filtered.forEach(function(row, idx) {
            var p = row.portfolio;
            var selectedCls = (state.selectedRowIndex === 'cf-' + idx) ? ' selected' : '';
            var driftCls = p.cashDrift < 0 ? 'negative' : (p.cashDrift > 0 ? 'positive' : '');
            var cfCls = row.cfAmount < 0 ? 'negative' : 'positive';
            var countdownId = 'cf-cd-' + idx;

            // Workflow stepper with labels
            var stepLabels = ['Wait for all CFs', 'Optimize portfolio', 'Run PTC'];
            var wfHtml = '<div style="display:flex;align-items:center;gap:4px;">';
            for (var s = 1; s <= 3; s++) {
                var stepCls = 'am-stepper-step';
                if (s < row.wfStep) stepCls += ' completed';
                else if (s === row.wfStep) stepCls += ' current';
                wfHtml += '<div class="' + stepCls + '" title="' + stepLabels[s-1] + '"></div>';
            }
            wfHtml += '<span class="am-stepper-text">' + stepLabels[Math.min(row.wfStep, 3) - 1] + '</span></div>';

            // Action buttons
            var actionsHtml = '';
            if (row.orderStatus === 'PTC completed') {
                actionsHtml = '<button class="am-action-btn" onclick="event.stopPropagation();amCfAction(' + idx + ',\'request4eye\')">Request 4-eye</button>';
            } else if (row.orderStatus === 'Ready to send') {
                actionsHtml = '<button class="am-action-btn success" onclick="event.stopPropagation();amCfAction(' + idx + ',\'sendOrders\')">Send Orders</button>';
            } else if (row.orderStatus === 'Draft' && row.wfStep >= 2) {
                actionsHtml = '<button class="am-action-btn primary" onclick="event.stopPropagation();amCfAction(' + idx + ',\'approvePtc\')">Approve PTC</button>';
            }

            html += '<tr class="' + selectedCls + '" onclick="amSelectCfRow(' + idx + ')">' +
                '<td class="am-col-id"><span class="am-mono">' + p.id + '</span></td>' +
                '<td class="am-col-name">' + escapeHtml(p.name) + '</td>' +
                '<td class="am-col-ccy"><span class="am-mono">' + p.ccy + '</span></td>' +
                '<td class="am-col-event">' + renderBadge(row.cfType, row.cfType === 'Subscription' ? 'green' : 'red') + '</td>' +
                '<td class="am-col-cf-amount"><span class="am-num ' + cfCls + '">' + formatCurrency(row.cfAmount, p.ccy) + '</span></td>' +
                '<td>' + wfHtml + '</td>' +
                '<td class="am-col-countdown">' + (row.countdown > 0 ? '<span class="am-countdown" id="' + countdownId + '">' + ICONS.clock + ' ' + formatCountdown(row.countdown) + '</span>' : '<span class="am-wf-start">--:--</span>') + '</td>' +
                '<td class="am-col-order">' + renderBadge(row.orderStatus, getOrderBadgeColor(row.orderStatus)) + '</td>' +
                '<td style="text-align:center"><span class="am-mono">' + row.orders + '</span></td>' +
                '<td style="text-align:center">' + (row.tradeRequired ? '<span class="am-badge am-badge-amber">Required</span>' : '<span class="am-badge am-badge-grey">No</span>') + '</td>' +
                '<td>' + actionsHtml + '</td>' +
                '<td class="am-col-aum"><span class="am-num">' + formatAum(p.aum) + '</span></td>' +
                '<td class="am-col-target"><span class="am-num">' + p.cashTarget.toFixed(2) + '%</span></td>' +
                '<td class="am-col-drift"><span class="am-num ' + driftCls + '">' + (p.cashDrift >= 0 ? '+' : '') + p.cashDrift.toFixed(2) + '%</span></td>' +
            '</tr>';
        });

        html += '</tbody></table></div>';
        return html;
    }


    // ========================================
    // TAB 3: SOD ALERT
    // ========================================

    function renderSodAlertTable() {
        var html = '';

        // Sub-tabs
        html += '<div class="am-sub-tabs">' +
            '<button class="am-sub-tab' + (state.sodSubTab === 'detailed' ? ' active' : '') + '" onclick="amSetSodSubTab(\'detailed\')">Detailed View</button>' +
            '<button class="am-sub-tab' + (state.sodSubTab === 'transactions' ? ' active' : '') + '" onclick="amSetSodSubTab(\'transactions\')">Transaction Data</button>' +
            '<button class="am-sub-tab' + (state.sodSubTab === 'instruments' ? ' active' : '') + '" onclick="amSetSodSubTab(\'instruments\')">Instr. Changes</button>' +
        '</div>';

        if (state.sodSubTab === 'detailed') {
            html += '<div class="am-table-container">';
            html += '<table class="am-table"><thead><tr>' +
                '<th class="am-col-priority">!</th>' +
                '<th class="am-col-id" onclick="amSort(\'id\')">Portfolio ID' + renderSortIcon('id') + '</th>' +
                '<th class="am-col-name" onclick="amSort(\'name\')">Name' + renderSortIcon('name') + '</th>' +
                '<th class="am-col-model">Model/PF</th>' +
                '<th class="am-col-ccy">CCY</th>' +
                '<th style="width:80px;text-align:right">EOD %</th>' +
                '<th style="width:80px;text-align:right">SOD %</th>' +
                '<th style="width:80px;text-align:right">Change %</th>' +
                '<th style="width:180px">SOD Change Reason</th>' +
                '<th style="width:100px">Auto-Detected</th>' +
                '<th style="width:200px">Workflow</th>' +
                '<th class="am-col-aum">Market Value</th>' +
                '</tr></thead><tbody>';

            SOD_ALERT_DATA.forEach(function(row, idx) {
                var p = row.portfolio;
                if (!portfolioMatchesFilters(p)) return;
                var selectedCls = (state.selectedRowIndex === 'sod-' + idx) ? ' selected' : '';
                var changeCls = row.changePct < 0 ? 'negative' : (row.changePct > 0 ? 'positive' : '');

                // Reason dropdown or tag
                var reasonHtml = '';
                if (row.reason) {
                    reasonHtml = '<span class="am-tag">' + row.reason + '</span>';
                } else {
                    reasonHtml = '<select class="am-reason-select" onclick="event.stopPropagation()" onchange="amSetSodReason(' + idx + ', this.value)">' +
                        '<option value="">-- Select --</option>';
                    SOD_CHANGE_REASONS.forEach(function(r) {
                        reasonHtml += '<option value="' + r + '">' + r + '</option>';
                    });
                    reasonHtml += '</select>';
                }

                // Workflow: Investigate -> Check
                var wfHtml = '<div style="display:flex;align-items:center;gap:4px;">';
                var step1Cls = 'am-stepper-step' + (row.reason ? ' completed' : ' current');
                var step2Cls = 'am-stepper-step' + (row.investigated ? ' completed' : (row.reason ? ' current' : ''));
                wfHtml += '<div class="' + step1Cls + '" title="Investigate change reason"></div>';
                wfHtml += '<div class="' + step2Cls + '" title="Check portfolio"></div>';
                var stepText = !row.reason ? 'Investigate reason' : (!row.investigated ? 'Check portfolio' : 'Complete');
                wfHtml += '<span class="am-stepper-text">' + stepText + '</span></div>';

                html += '<tr class="' + selectedCls + '" onclick="amSelectSodRow(' + idx + ')">' +
                    '<td class="am-col-priority">' + renderPriorityIcon(row.changePct < -0.10 ? 'critical' : (row.changePct < -0.05 ? 'warning' : 'info')) + '</td>' +
                    '<td class="am-col-id"><span class="am-mono">' + p.id + '</span></td>' +
                    '<td class="am-col-name">' + escapeHtml(p.name) + '</td>' +
                    '<td class="am-col-model"><span class="am-mono">' + p.model + '</span></td>' +
                    '<td class="am-col-ccy"><span class="am-mono">' + p.ccy + '</span></td>' +
                    '<td style="text-align:right"><span class="am-num">' + row.eodPct.toFixed(2) + '%</span></td>' +
                    '<td style="text-align:right"><span class="am-num">' + row.sodPct.toFixed(2) + '%</span></td>' +
                    '<td style="text-align:right"><span class="am-num ' + changeCls + '">' + (row.changePct >= 0 ? '+' : '') + row.changePct.toFixed(2) + '%</span></td>' +
                    '<td>' + reasonHtml + '</td>' +
                    '<td>' + (row.autoDetected ? '<span class="am-badge am-badge-green">AI Detected</span>' : '<span class="am-badge am-badge-grey">Manual</span>') + '</td>' +
                    '<td>' + wfHtml + '</td>' +
                    '<td class="am-col-aum"><span class="am-num">' + formatAum(p.aum) + '</span></td>' +
                '</tr>';
            });

            html += '</tbody></table></div>';
        } else if (state.sodSubTab === 'transactions') {
            html += '<div class="am-table-container" style="padding:20px;"><p style="color:var(--am-text-muted);font-size:13px;">Transaction data for the selected SOD period. Select a portfolio from the Detailed View to view its transactions.</p></div>';
        } else {
            html += '<div class="am-table-container" style="padding:20px;"><p style="color:var(--am-text-muted);font-size:13px;">Instrument-level changes for the SOD period. Select a portfolio from the Detailed View to view instrument changes.</p></div>';
        }

        return html;
    }

    // ========================================
    // TAB 4: SOD ITEM CHANGES
    // ========================================

    function renderSodItemChangesTable() {
        var html = '<div class="am-table-container">';
        html += '<table class="am-table"><thead><tr>' +
            '<th style="width:40px;text-align:center">#</th>' +
            '<th class="am-col-id" onclick="amSort(\'id\')">Portfolio ID' + renderSortIcon('id') + '</th>' +
            '<th style="width:220px" onclick="amSort(\'name\')">Portfolio Name' + renderSortIcon('name') + '</th>' +
            '<th style="width:100px">Security ID</th>' +
            '<th style="width:150px">Security Name</th>' +
            '<th style="width:120px">Attribute</th>' +
            '<th style="width:80px;text-align:right">EOD Value</th>' +
            '<th style="width:80px;text-align:right">SOD Value</th>' +
            '<th style="width:80px;text-align:right">Change</th>' +
            '<th style="width:100px">Status</th>' +
            '</tr></thead><tbody>';

        var filtered = SOD_ITEM_CHANGES.filter(function(row) {
            if (!portfolioMatchesFilters(row.portfolio)) return false;
            if (state.searchQuery) {
                var q = state.searchQuery.toLowerCase();
                if (row.portfolio.name.toLowerCase().indexOf(q) === -1 &&
                    row.portfolio.id.toLowerCase().indexOf(q) === -1 &&
                    row.securityName.toLowerCase().indexOf(q) === -1) return false;
            }
            return true;
        });

        filtered.forEach(function(row, idx) {
            var changeCls = parseFloat(row.change) < 0 ? 'negative' : (parseFloat(row.change) > 0 ? 'positive' : '');
            var statusColor = row.status === 'Resolved' ? 'green' : (row.status === 'Pending' ? 'amber' : (row.status === 'Under Review' ? 'blue' : 'grey'));

            html += '<tr onclick="amSelectItemChangeRow(' + idx + ')">' +
                '<td style="text-align:center"><span class="am-mono">' + row.num + '</span></td>' +
                '<td class="am-col-id"><span class="am-mono">' + row.portfolio.id + '</span></td>' +
                '<td style="width:220px">' + escapeHtml(row.portfolio.name) + '</td>' +
                '<td><span class="am-mono">' + row.securityId + '</span></td>' +
                '<td>' + escapeHtml(row.securityName) + '</td>' +
                '<td>' + row.attribute + '</td>' +
                '<td style="text-align:right"><span class="am-num">' + row.eodValue + '</span></td>' +
                '<td style="text-align:right"><span class="am-num">' + row.sodValue + '</span></td>' +
                '<td style="text-align:right"><span class="am-num ' + changeCls + '">' + row.change + '</span></td>' +
                '<td>' + renderBadge(row.status, statusColor) + '</td>' +
            '</tr>';
        });

        html += '</tbody></table></div>';
        return html;
    }

    // ========================================
    // TAB 5: ONGOING ORDERS
    // ========================================

    function renderOngoingOrdersTable() {
        var html = '<div class="am-table-container">';
        html += '<table class="am-table"><thead><tr>' +
            '<th style="width:95px" onclick="amSort(\'orderId\')">Order ID' + renderSortIcon('orderId') + '</th>' +
            '<th class="am-col-id">Portfolio</th>' +
            '<th style="width:100px">Security</th>' +
            '<th style="width:60px">Side</th>' +
            '<th style="width:80px;text-align:right">Quantity</th>' +
            '<th style="width:80px;text-align:right">Limit Price</th>' +
            '<th style="width:110px">Fill %</th>' +
            '<th style="width:100px" onclick="amSort(\'status\')">Status' + renderSortIcon('status') + '</th>' +
            '<th style="width:90px">Trader</th>' +
            '<th style="width:80px">Timestamp</th>' +
            '</tr></thead><tbody>';

        var filtered = ONGOING_ORDERS.filter(function(row) {
            if (!portfolioMatchesFilters(row.portfolio)) return false;
            if (state.searchQuery) {
                var q = state.searchQuery.toLowerCase();
                if (row.portfolio.name.toLowerCase().indexOf(q) === -1 &&
                    row.portfolio.id.toLowerCase().indexOf(q) === -1 &&
                    row.security.toLowerCase().indexOf(q) === -1 &&
                    row.orderId.toLowerCase().indexOf(q) === -1) return false;
            }
            return true;
        });

        filtered.forEach(function(row, idx) {
            var sideBadge = row.side === 'Buy' ? 'green' : 'red';
            var statusColor = row.status === 'Filled' ? 'green' : (row.status === 'Partially Filled' ? 'cyan' : (row.status === 'Working' ? 'blue' : (row.status === 'Cancelled' ? 'red' : 'grey')));

            html += '<tr onclick="amSelectOrderRow(' + idx + ')">' +
                '<td><span class="am-mono">' + row.orderId + '</span></td>' +
                '<td class="am-col-id"><span class="am-mono">' + row.portfolio.id + '</span></td>' +
                '<td><span class="am-mono">' + row.security + '</span></td>' +
                '<td>' + renderBadge(row.side, sideBadge) + '</td>' +
                '<td style="text-align:right"><span class="am-num">' + formatNumber(row.quantity) + '</span></td>' +
                '<td style="text-align:right"><span class="am-num">' + row.limitPrice.toFixed(2) + '</span></td>' +
                '<td><div class="am-fill-bar"><div class="am-fill-bar-track"><div class="am-fill-bar-fill" style="width:' + row.fillPct + '%"></div></div><span class="am-fill-bar-text">' + row.fillPct + '%</span></div></td>' +
                '<td>' + renderBadge(row.status, statusColor) + '</td>' +
                '<td>' + row.trader + '</td>' +
                '<td><span class="am-mono">' + row.timestamp + '</span></td>' +
            '</tr>';
        });

        html += '</tbody></table></div>';
        return html;
    }


    // ========================================
    // SIDEBAR: CASH — Cash Balances
    // ========================================

    function renderCashBalancesTable() {
        var html = '<div class="am-table-container">';
        html += '<table class="am-table"><thead><tr>' +
            '<th class="am-col-id" onclick="amSort(\'id\')">Portfolio ID' + renderSortIcon('id') + '</th>' +
            '<th class="am-col-name" onclick="amSort(\'name\')">Name' + renderSortIcon('name') + '</th>' +
            '<th class="am-col-ccy">CCY</th>' +
            '<th style="width:120px;text-align:right">Market Value</th>' +
            '<th style="width:100px;text-align:right">Cash Balance</th>' +
            '<th style="width:80px;text-align:right">Cash %</th>' +
            '<th style="width:80px;text-align:right">Target %</th>' +
            '<th style="width:80px;text-align:right">Drift %</th>' +
            '<th style="width:100px">Status</th>' +
            '</tr></thead><tbody>';

        var filtered = PORTFOLIOS.filter(function(p) {
            if (!portfolioMatchesFilters(p)) return false;
            if (state.searchQuery) {
                var q = state.searchQuery.toLowerCase();
                if (p.name.toLowerCase().indexOf(q) === -1 && p.id.toLowerCase().indexOf(q) === -1) return false;
            }
            return true;
        });

        filtered.forEach(function(p) {
            var driftCls = p.cashDrift < 0 ? 'negative' : (p.cashDrift > 0 ? 'positive' : '');
            var cashBal = p.aum * p.cashActual / 100;
            var statusText = Math.abs(p.cashDrift) > 0.10 ? 'Breach' : (Math.abs(p.cashDrift) > 0.05 ? 'Warning' : 'OK');
            var statusColor = Math.abs(p.cashDrift) > 0.10 ? 'red' : (Math.abs(p.cashDrift) > 0.05 ? 'amber' : 'green');

            html += '<tr>' +
                '<td class="am-col-id"><span class="am-mono">' + p.id + '</span></td>' +
                '<td class="am-col-name">' + escapeHtml(p.name) + '</td>' +
                '<td class="am-col-ccy"><span class="am-mono">' + p.ccy + '</span></td>' +
                '<td style="text-align:right"><span class="am-num">' + formatAum(p.aum) + '</span></td>' +
                '<td style="text-align:right"><span class="am-num">' + formatCurrency(cashBal, p.ccy) + '</span></td>' +
                '<td style="text-align:right"><span class="am-num">' + p.cashActual.toFixed(2) + '%</span></td>' +
                '<td style="text-align:right"><span class="am-num">' + p.cashTarget.toFixed(2) + '%</span></td>' +
                '<td style="text-align:right"><span class="am-num ' + driftCls + '">' + (p.cashDrift >= 0 ? '+' : '') + p.cashDrift.toFixed(2) + '%</span></td>' +
                '<td>' + renderBadge(statusText, statusColor) + '</td>' +
            '</tr>';
        });

        html += '</tbody></table></div>';
        return html;
    }

    // ========================================
    // SIDEBAR: CASH — Cash Projection
    // ========================================

    function renderCashProjectionTable() {
        var projDays = ['+1D', '+2D', '+3D', '+1W', '+2W'];
        var html = '<div class="am-table-container">';
        html += '<table class="am-table"><thead><tr>' +
            '<th class="am-col-id">Portfolio ID</th>' +
            '<th class="am-col-name">Name</th>' +
            '<th class="am-col-ccy">CCY</th>' +
            '<th style="width:100px;text-align:right">Current Cash</th>';
        projDays.forEach(function(d) { html += '<th style="width:90px;text-align:right">' + d + '</th>'; });
        html += '</tr></thead><tbody>';

        var subset = PORTFOLIOS.slice(0, 5);
        subset.forEach(function(p) {
            var cashNow = p.aum * p.cashActual / 100;
            html += '<tr>' +
                '<td class="am-col-id"><span class="am-mono">' + p.id + '</span></td>' +
                '<td class="am-col-name">' + escapeHtml(p.name) + '</td>' +
                '<td class="am-col-ccy"><span class="am-mono">' + p.ccy + '</span></td>' +
                '<td style="text-align:right"><span class="am-num">' + formatCurrency(cashNow, p.ccy) + '</span></td>';
            var running = cashNow;
            projDays.forEach(function() {
                var delta = (Math.random() - 0.4) * cashNow * 0.05;
                running += delta;
                var cls = delta < 0 ? 'negative' : 'positive';
                html += '<td style="text-align:right"><span class="am-num ' + cls + '">' + formatCurrency(running, p.ccy) + '</span></td>';
            });
            html += '</tr>';
        });

        html += '</tbody></table></div>';
        return html;
    }

    // ========================================
    // SIDEBAR: CASH — Cash Drift
    // ========================================

    function renderCashDriftTable() {
        var drifted = PORTFOLIOS.filter(function(p) { return portfolioMatchesFilters(p) && Math.abs(p.cashDrift) > 0.05; });
        var html = '<div class="am-table-container">';
        html += '<table class="am-table"><thead><tr>' +
            '<th class="am-col-id">Portfolio ID</th>' +
            '<th class="am-col-name">Name</th>' +
            '<th class="am-col-ccy">CCY</th>' +
            '<th style="width:80px;text-align:right">Target %</th>' +
            '<th style="width:80px;text-align:right">Actual %</th>' +
            '<th style="width:80px;text-align:right">Drift %</th>' +
            '<th style="width:120px">Severity</th>' +
            '<th style="width:160px">Action</th>' +
            '</tr></thead><tbody>';

        drifted.forEach(function(p, idx) {
            var driftCls = p.cashDrift < 0 ? 'negative' : 'positive';
            var severity = Math.abs(p.cashDrift) > 0.10 ? 'Critical' : 'Warning';
            var sevColor = severity === 'Critical' ? 'red' : 'amber';

            html += '<tr>' +
                '<td class="am-col-id"><span class="am-mono">' + p.id + '</span></td>' +
                '<td class="am-col-name">' + escapeHtml(p.name) + '</td>' +
                '<td class="am-col-ccy"><span class="am-mono">' + p.ccy + '</span></td>' +
                '<td style="text-align:right"><span class="am-num">' + p.cashTarget.toFixed(2) + '%</span></td>' +
                '<td style="text-align:right"><span class="am-num">' + p.cashActual.toFixed(2) + '%</span></td>' +
                '<td style="text-align:right"><span class="am-num ' + driftCls + '">' + (p.cashDrift >= 0 ? '+' : '') + p.cashDrift.toFixed(2) + '%</span></td>' +
                '<td>' + renderBadge(severity, sevColor) + '</td>' +
                '<td><button class="am-action-btn primary" onclick="event.stopPropagation()">Rebalance</button></td>' +
            '</tr>';
        });

        html += '</tbody></table></div>';
        return html;
    }


    // ========================================
    // SIDEBAR: CURRENCY — FX Exposure
    // ========================================

    var FX_CURRENCIES = ['USD', 'EUR', 'CHF', 'GBP'];

    function renderFxExposureTable() {
        var ccyTotals = {};
        PORTFOLIOS.forEach(function(p) {
            if (!ccyTotals[p.ccy]) ccyTotals[p.ccy] = { count: 0, aum: 0 };
            ccyTotals[p.ccy].count++;
            ccyTotals[p.ccy].aum += p.aum;
        });
        var totalAum = PORTFOLIOS.reduce(function(s, p) { return s + p.aum; }, 0);

        var html = '<div class="am-table-container">';
        html += '<table class="am-table"><thead><tr>' +
            '<th style="width:80px">Currency</th>' +
            '<th style="width:80px;text-align:right">Portfolios</th>' +
            '<th style="width:140px;text-align:right">Total AUM</th>' +
            '<th style="width:100px;text-align:right">Weight %</th>' +
            '<th style="width:160px">Allocation</th>' +
            '<th style="width:100px;text-align:right">FX Rate (vs USD)</th>' +
            '<th style="width:100px;text-align:right">1D Change</th>' +
            '</tr></thead><tbody>';

        var fxRates = { USD: 1.0000, EUR: 1.0842, CHF: 0.8921, GBP: 1.2714 };
        var fxChanges = { USD: 0.00, EUR: -0.12, CHF: +0.08, GBP: -0.05 };

        FX_CURRENCIES.forEach(function(ccy) {
            var data = ccyTotals[ccy] || { count: 0, aum: 0 };
            var weight = totalAum > 0 ? (data.aum / totalAum * 100) : 0;
            var changeCls = fxChanges[ccy] < 0 ? 'negative' : (fxChanges[ccy] > 0 ? 'positive' : '');
            var barWidth = Math.min(weight, 100);

            html += '<tr>' +
                '<td><span class="am-mono" style="font-weight:600">' + ccy + '</span></td>' +
                '<td style="text-align:right"><span class="am-num">' + data.count + '</span></td>' +
                '<td style="text-align:right"><span class="am-num">' + formatAum(data.aum) + '</span></td>' +
                '<td style="text-align:right"><span class="am-num">' + weight.toFixed(1) + '%</span></td>' +
                '<td><div class="am-fill-bar"><div class="am-fill-bar-track"><div class="am-fill-bar-fill" style="width:' + barWidth + '%"></div></div></div></td>' +
                '<td style="text-align:right"><span class="am-mono">' + fxRates[ccy].toFixed(4) + '</span></td>' +
                '<td style="text-align:right"><span class="am-num ' + changeCls + '">' + (fxChanges[ccy] >= 0 ? '+' : '') + fxChanges[ccy].toFixed(2) + '%</span></td>' +
            '</tr>';
        });

        html += '</tbody></table></div>';
        return html;
    }

    // ========================================
    // SIDEBAR: CURRENCY — Hedging Ratios
    // ========================================

    function renderHedgingTable() {
        var hedgeData = [
            { pair: 'EUR/USD', target: 100, actual: 97.8, notional: '142M', status: 'Below Threshold' },
            { pair: 'CHF/USD', target: 100, actual: 99.2, notional: '256M', status: 'OK' },
            { pair: 'GBP/USD', target: 95, actual: 94.1, notional: '48M', status: 'Below Threshold' },
            { pair: 'JPY/USD', target: 100, actual: 100.0, notional: '33M', status: 'OK' }
        ];

        var html = '<div class="am-table-container">';
        html += '<table class="am-table"><thead><tr>' +
            '<th style="width:100px">CCY Pair</th>' +
            '<th style="width:100px;text-align:right">Target Ratio</th>' +
            '<th style="width:100px;text-align:right">Actual Ratio</th>' +
            '<th style="width:100px;text-align:right">Gap</th>' +
            '<th style="width:120px;text-align:right">Notional</th>' +
            '<th style="width:120px">Status</th>' +
            '<th style="width:160px">Action</th>' +
            '</tr></thead><tbody>';

        hedgeData.forEach(function(row) {
            var gap = row.actual - row.target;
            var gapCls = gap < 0 ? 'negative' : (gap > 0 ? 'positive' : '');
            var statusColor = row.status === 'OK' ? 'green' : 'amber';

            html += '<tr>' +
                '<td><span class="am-mono" style="font-weight:600">' + row.pair + '</span></td>' +
                '<td style="text-align:right"><span class="am-num">' + row.target.toFixed(1) + '%</span></td>' +
                '<td style="text-align:right"><span class="am-num">' + row.actual.toFixed(1) + '%</span></td>' +
                '<td style="text-align:right"><span class="am-num ' + gapCls + '">' + (gap >= 0 ? '+' : '') + gap.toFixed(1) + '%</span></td>' +
                '<td style="text-align:right"><span class="am-num">' + row.notional + '</span></td>' +
                '<td>' + renderBadge(row.status, statusColor) + '</td>' +
                '<td>' + (row.status !== 'OK' ? '<button class="am-action-btn primary" onclick="event.stopPropagation()">Adjust Hedge</button>' : '') + '</td>' +
            '</tr>';
        });

        html += '</tbody></table></div>';
        return html;
    }

    // ========================================
    // SIDEBAR: CURRENCY — FX Orders
    // ========================================

    function renderFxOrdersTable() {
        var fxOrders = [
            { id: 'FX-001', pair: 'EUR/USD', side: 'Buy', notional: '5.2M EUR', rate: 1.0842, status: 'Working', trader: 'M. Weber', ts: '09:14:22' },
            { id: 'FX-002', pair: 'CHF/USD', side: 'Sell', notional: '3.8M CHF', rate: 0.8921, status: 'Filled', trader: 'S. Chen', ts: '08:55:10' },
            { id: 'FX-003', pair: 'GBP/USD', side: 'Buy', notional: '1.5M GBP', rate: 1.2714, status: 'Working', trader: 'A. Patel', ts: '09:32:45' },
            { id: 'FX-004', pair: 'EUR/CHF', side: 'Sell', notional: '7.1M EUR', rate: 1.2150, status: 'Partially Filled', trader: 'J. Mueller', ts: '09:01:33' },
            { id: 'FX-005', pair: 'USD/JPY', side: 'Buy', notional: '12.0M USD', rate: 149.82, status: 'Pending', trader: 'K. Tanaka', ts: '10:05:17' },
            { id: 'FX-006', pair: 'GBP/EUR', side: 'Sell', notional: '2.3M GBP', rate: 0.8515, status: 'Working', trader: 'L. Rossi', ts: '09:47:02' },
            { id: 'FX-007', pair: 'EUR/USD', side: 'Buy', notional: '8.9M EUR', rate: 1.0838, status: 'Filled', trader: 'M. Weber', ts: '08:22:41' },
            { id: 'FX-008', pair: 'CHF/USD', side: 'Buy', notional: '4.6M CHF', rate: 0.8925, status: 'Working', trader: 'S. Chen', ts: '10:11:55' }
        ];

        var html = '<div class="am-table-container">';
        html += '<table class="am-table"><thead><tr>' +
            '<th style="width:80px">Order ID</th>' +
            '<th style="width:90px">CCY Pair</th>' +
            '<th style="width:60px">Side</th>' +
            '<th style="width:120px;text-align:right">Notional</th>' +
            '<th style="width:90px;text-align:right">Rate</th>' +
            '<th style="width:110px">Status</th>' +
            '<th style="width:90px">Trader</th>' +
            '<th style="width:80px">Timestamp</th>' +
            '</tr></thead><tbody>';

        fxOrders.forEach(function(row) {
            var sideBadge = row.side === 'Buy' ? 'green' : 'red';
            var statusColor = row.status === 'Filled' ? 'green' : (row.status === 'Partially Filled' ? 'cyan' : (row.status === 'Working' ? 'blue' : 'grey'));

            html += '<tr>' +
                '<td><span class="am-mono">' + row.id + '</span></td>' +
                '<td><span class="am-mono">' + row.pair + '</span></td>' +
                '<td>' + renderBadge(row.side, sideBadge) + '</td>' +
                '<td style="text-align:right"><span class="am-num">' + row.notional + '</span></td>' +
                '<td style="text-align:right"><span class="am-mono">' + row.rate.toFixed(4) + '</span></td>' +
                '<td>' + renderBadge(row.status, statusColor) + '</td>' +
                '<td>' + row.trader + '</td>' +
                '<td><span class="am-mono">' + row.ts + '</span></td>' +
            '</tr>';
        });

        html += '</tbody></table></div>';
        return html;
    }


    // ========================================
    // SIDEBAR: STRATEGY — Model Allocation
    // ========================================

    function renderModelAllocationTable() {
        var html = '<div class="am-table-container">';
        html += '<table class="am-table"><thead><tr>' +
            '<th class="am-col-id">Portfolio ID</th>' +
            '<th class="am-col-name">Name</th>' +
            '<th style="width:100px">Model</th>' +
            '<th class="am-col-ccy">CCY</th>' +
            '<th style="width:120px;text-align:right">AUM</th>' +
            '<th style="width:80px;text-align:right">Positions</th>' +
            '<th style="width:100px;text-align:right">Active Wt.</th>' +
            '<th style="width:100px">Benchmark</th>' +
            '</tr></thead><tbody>';

        var filtered = PORTFOLIOS.filter(function(p) {
            if (!portfolioMatchesFilters(p)) return false;
            if (state.searchQuery) {
                var q = state.searchQuery.toLowerCase();
                if (p.name.toLowerCase().indexOf(q) === -1 && p.id.toLowerCase().indexOf(q) === -1 && p.model.toLowerCase().indexOf(q) === -1) return false;
            }
            return true;
        });

        filtered.forEach(function(p, idx) {
            var positions = 80 + (idx * 7) % 120;
            var activeWt = ((idx * 3.7 + 1.2) % 8 - 4).toFixed(2);
            var activeWtCls = parseFloat(activeWt) < 0 ? 'negative' : 'positive';
            var benchmarks = ['MSCI World', 'MSCI ACWI', 'SPI', 'STOXX Europe 600', 'FTSE 100', 'S&P 500'];

            html += '<tr>' +
                '<td class="am-col-id"><span class="am-mono">' + p.id + '</span></td>' +
                '<td class="am-col-name">' + escapeHtml(p.name) + '</td>' +
                '<td><span class="am-mono">' + p.model + '</span></td>' +
                '<td class="am-col-ccy"><span class="am-mono">' + p.ccy + '</span></td>' +
                '<td style="text-align:right"><span class="am-num">' + formatAum(p.aum) + '</span></td>' +
                '<td style="text-align:right"><span class="am-num">' + positions + '</span></td>' +
                '<td style="text-align:right"><span class="am-num ' + activeWtCls + '">' + (parseFloat(activeWt) >= 0 ? '+' : '') + activeWt + '%</span></td>' +
                '<td>' + benchmarks[idx % benchmarks.length] + '</td>' +
            '</tr>';
        });

        html += '</tbody></table></div>';
        return html;
    }

    // ========================================
    // SIDEBAR: STRATEGY — Tracking Error
    // ========================================

    function renderTrackingErrorTable() {
        var teData = [
            { portfolio: PORTFOLIOS[0], te: 2.34, limit: 3.00, utilization: 78.0, status: 'OK' },
            { portfolio: PORTFOLIOS[4], te: 2.91, limit: 3.00, utilization: 97.0, status: 'Near Limit' },
            { portfolio: PORTFOLIOS[14], te: 3.12, limit: 3.00, utilization: 104.0, status: 'Breach' }
        ];

        var html = '<div class="am-table-container">';
        html += '<table class="am-table"><thead><tr>' +
            '<th class="am-col-id">Portfolio ID</th>' +
            '<th class="am-col-name">Name</th>' +
            '<th style="width:100px;text-align:right">TE (ex-ante)</th>' +
            '<th style="width:80px;text-align:right">Limit</th>' +
            '<th style="width:120px">Utilization</th>' +
            '<th style="width:100px">Status</th>' +
            '<th style="width:160px">Action</th>' +
            '</tr></thead><tbody>';

        teData.forEach(function(row) {
            var statusColor = row.status === 'Breach' ? 'red' : (row.status === 'Near Limit' ? 'amber' : 'green');
            var barWidth = Math.min(row.utilization, 100);

            html += '<tr>' +
                '<td class="am-col-id"><span class="am-mono">' + row.portfolio.id + '</span></td>' +
                '<td class="am-col-name">' + escapeHtml(row.portfolio.name) + '</td>' +
                '<td style="text-align:right"><span class="am-num">' + row.te.toFixed(2) + '%</span></td>' +
                '<td style="text-align:right"><span class="am-num">' + row.limit.toFixed(2) + '%</span></td>' +
                '<td><div class="am-fill-bar"><div class="am-fill-bar-track"><div class="am-fill-bar-fill" style="width:' + barWidth + '%;background:' + (row.utilization > 100 ? 'var(--am-red)' : (row.utilization > 90 ? 'var(--am-amber)' : 'var(--am-green)')) + '"></div></div><span class="am-fill-bar-text">' + row.utilization.toFixed(0) + '%</span></div></td>' +
                '<td>' + renderBadge(row.status, statusColor) + '</td>' +
                '<td>' + (row.status !== 'OK' ? '<button class="am-action-btn primary" onclick="event.stopPropagation()">Review</button>' : '') + '</td>' +
            '</tr>';
        });

        html += '</tbody></table></div>';
        return html;
    }

    // ========================================
    // SIDEBAR: STRATEGY — Rebalancing Queue
    // ========================================

    function renderRebalancingTable() {
        var rebalData = [
            { portfolio: PORTFOLIOS[8], trigger: 'Drift > 5%', priority: 'critical', status: 'Pending', trades: 14, scheduled: '11:00' },
            { portfolio: PORTFOLIOS[12], trigger: 'Cash Drift', priority: 'warning', status: 'Queued', trades: 8, scheduled: '11:30' },
            { portfolio: PORTFOLIOS[3], trigger: 'Model Change', priority: 'warning', status: 'Queued', trades: 22, scheduled: '12:00' },
            { portfolio: PORTFOLIOS[16], trigger: 'Periodic', priority: 'info', status: 'Scheduled', trades: 6, scheduled: '14:00' }
        ];

        var html = '<div class="am-table-container">';
        html += '<table class="am-table"><thead><tr>' +
            '<th class="am-col-id">Portfolio ID</th>' +
            '<th class="am-col-name">Name</th>' +
            '<th style="width:100px">Trigger</th>' +
            '<th style="width:80px">Priority</th>' +
            '<th style="width:100px">Status</th>' +
            '<th style="width:80px;text-align:right">Est. Trades</th>' +
            '<th style="width:90px">Scheduled</th>' +
            '<th style="width:160px">Action</th>' +
            '</tr></thead><tbody>';

        rebalData.forEach(function(row) {
            var statusColor = row.status === 'Pending' ? 'amber' : (row.status === 'Queued' ? 'blue' : 'grey');

            html += '<tr>' +
                '<td class="am-col-id"><span class="am-mono">' + row.portfolio.id + '</span></td>' +
                '<td class="am-col-name">' + escapeHtml(row.portfolio.name) + '</td>' +
                '<td>' + row.trigger + '</td>' +
                '<td>' + renderPriorityIcon(row.priority) + '</td>' +
                '<td>' + renderBadge(row.status, statusColor) + '</td>' +
                '<td style="text-align:right"><span class="am-num">' + row.trades + '</span></td>' +
                '<td><span class="am-mono">' + row.scheduled + '</span></td>' +
                '<td><button class="am-action-btn primary" onclick="event.stopPropagation()">Run Optimizer</button></td>' +
            '</tr>';
        });

        html += '</tbody></table></div>';
        return html;
    }


    // ========================================
    // SIDEBAR: OPTIMIZER — Optimizer Queue
    // ========================================

    function renderOptimizerQueueTable() {
        var queueData = [
            { portfolio: PORTFOLIOS[0], reason: 'Cashflow -2.5M', status: 'Running', progress: 72, startedAt: '09:42:15', estComplete: '09:44:00' },
            { portfolio: PORTFOLIOS[1], reason: 'Cashflow +5.0M', status: 'Completed', progress: 100, startedAt: '09:38:01', estComplete: '09:40:22' },
            { portfolio: PORTFOLIOS[8], reason: 'Rebalance', status: 'Queued', progress: 0, startedAt: '--', estComplete: '~09:46' },
            { portfolio: PORTFOLIOS[12], reason: 'Cash Drift', status: 'Queued', progress: 0, startedAt: '--', estComplete: '~09:48' },
            { portfolio: PORTFOLIOS[3], reason: 'Model Change', status: 'Queued', progress: 0, startedAt: '--', estComplete: '~09:50' },
            { portfolio: PORTFOLIOS[16], reason: 'Periodic Rebal.', status: 'Scheduled', progress: 0, startedAt: '--', estComplete: '14:00' },
            { portfolio: PORTFOLIOS[6], reason: 'Cashflow -1.8M', status: 'Completed', progress: 100, startedAt: '09:30:10', estComplete: '09:32:44' }
        ];

        var html = '<div class="am-table-container">';
        html += '<table class="am-table"><thead><tr>' +
            '<th class="am-col-id">Portfolio ID</th>' +
            '<th class="am-col-name">Name</th>' +
            '<th style="width:120px">Reason</th>' +
            '<th style="width:100px">Status</th>' +
            '<th style="width:140px">Progress</th>' +
            '<th style="width:90px">Started</th>' +
            '<th style="width:90px">Est. Complete</th>' +
            '</tr></thead><tbody>';

        queueData.forEach(function(row) {
            var statusColor = row.status === 'Completed' ? 'green' : (row.status === 'Running' ? 'blue' : (row.status === 'Queued' ? 'amber' : 'grey'));

            html += '<tr>' +
                '<td class="am-col-id"><span class="am-mono">' + row.portfolio.id + '</span></td>' +
                '<td class="am-col-name">' + escapeHtml(row.portfolio.name) + '</td>' +
                '<td>' + row.reason + '</td>' +
                '<td>' + renderBadge(row.status, statusColor) + '</td>' +
                '<td><div class="am-fill-bar"><div class="am-fill-bar-track"><div class="am-fill-bar-fill" style="width:' + row.progress + '%"></div></div><span class="am-fill-bar-text">' + row.progress + '%</span></div></td>' +
                '<td><span class="am-mono">' + row.startedAt + '</span></td>' +
                '<td><span class="am-mono">' + row.estComplete + '</span></td>' +
            '</tr>';
        });

        html += '</tbody></table></div>';
        return html;
    }

    // ========================================
    // SIDEBAR: OPTIMIZER — Trade List
    // ========================================

    function renderTradeListTable() {
        var trades = [];
        var tradeSecurities = ['AAPL US', 'MSFT US', 'NESN SW', 'NOVN SW', 'ASML NA', 'MC FP', 'ROG SW', 'SAP GR', 'AMZN US', 'NVDA US'];
        var tradeSides = ['Buy', 'Sell'];
        for (var ti = 0; ti < 34; ti++) {
            var pfIdx = ti % PORTFOLIOS.length;
            trades.push({
                portfolio: PORTFOLIOS[pfIdx],
                security: tradeSecurities[ti % tradeSecurities.length],
                side: tradeSides[ti % 2],
                quantity: Math.floor(Math.random() * 20000) + 500,
                targetWt: ((Math.random() * 4) + 0.5).toFixed(2),
                currentWt: ((Math.random() * 4) + 0.5).toFixed(2),
                status: ti < 12 ? 'Ready' : (ti < 24 ? 'Pending Approval' : 'Draft')
            });
        }

        var html = '<div class="am-table-container">';
        html += '<table class="am-table"><thead><tr>' +
            '<th class="am-col-id">Portfolio</th>' +
            '<th style="width:90px">Security</th>' +
            '<th style="width:60px">Side</th>' +
            '<th style="width:80px;text-align:right">Quantity</th>' +
            '<th style="width:90px;text-align:right">Current Wt.</th>' +
            '<th style="width:90px;text-align:right">Target Wt.</th>' +
            '<th style="width:110px">Status</th>' +
            '</tr></thead><tbody>';

        var filtered = trades.filter(function(t) {
            if (!portfolioMatchesFilters(t.portfolio)) return false;
            if (state.searchQuery) {
                var q = state.searchQuery.toLowerCase();
                if (t.portfolio.id.toLowerCase().indexOf(q) === -1 && t.security.toLowerCase().indexOf(q) === -1) return false;
            }
            return true;
        });

        filtered.forEach(function(row) {
            var sideBadge = row.side === 'Buy' ? 'green' : 'red';
            var statusColor = row.status === 'Ready' ? 'green' : (row.status === 'Pending Approval' ? 'amber' : 'grey');

            html += '<tr>' +
                '<td class="am-col-id"><span class="am-mono">' + row.portfolio.id + '</span></td>' +
                '<td><span class="am-mono">' + row.security + '</span></td>' +
                '<td>' + renderBadge(row.side, sideBadge) + '</td>' +
                '<td style="text-align:right"><span class="am-num">' + formatNumber(row.quantity) + '</span></td>' +
                '<td style="text-align:right"><span class="am-num">' + row.currentWt + '%</span></td>' +
                '<td style="text-align:right"><span class="am-num">' + row.targetWt + '%</span></td>' +
                '<td>' + renderBadge(row.status, statusColor) + '</td>' +
            '</tr>';
        });

        html += '</tbody></table></div>';
        return html;
    }

    // ========================================
    // SIDEBAR: OPTIMIZER — Constraints
    // ========================================

    function renderConstraintsTable() {
        var constraints = [
            { name: 'Max Single Position', type: 'Hard', limit: '5.00%', current: '4.82%', utilization: 96.4, status: 'Near Limit' },
            { name: 'Max Sector Weight', type: 'Hard', limit: '25.00%', current: '23.10%', utilization: 92.4, status: 'Near Limit' },
            { name: 'Min Cash Holding', type: 'Hard', limit: '0.30%', current: '0.73%', utilization: 41.1, status: 'OK' },
            { name: 'Max Tracking Error', type: 'Soft', limit: '3.00%', current: '2.34%', utilization: 78.0, status: 'OK' },
            { name: 'Max Turnover (annual)', type: 'Soft', limit: '80.00%', current: '62.50%', utilization: 78.1, status: 'OK' },
            { name: 'ESG Score Floor', type: 'Hard', limit: '6.0', current: '7.2', utilization: 83.3, status: 'OK' },
            { name: 'Max Country Weight', type: 'Soft', limit: '40.00%', current: '38.90%', utilization: 97.3, status: 'Near Limit' },
            { name: 'Min # Holdings', type: 'Hard', limit: '40', current: '87', utilization: 45.9, status: 'OK' }
        ];

        var html = '<div class="am-table-container">';
        html += '<table class="am-table"><thead><tr>' +
            '<th style="width:200px">Constraint</th>' +
            '<th style="width:60px">Type</th>' +
            '<th style="width:100px;text-align:right">Limit</th>' +
            '<th style="width:100px;text-align:right">Current</th>' +
            '<th style="width:140px">Utilization</th>' +
            '<th style="width:100px">Status</th>' +
            '</tr></thead><tbody>';

        constraints.forEach(function(row) {
            var statusColor = row.status === 'Near Limit' ? 'amber' : 'green';
            var typeBadge = row.type === 'Hard' ? 'red' : 'blue';
            var barColor = row.utilization > 95 ? 'var(--am-amber)' : 'var(--am-green)';

            html += '<tr>' +
                '<td>' + row.name + '</td>' +
                '<td>' + renderBadge(row.type, typeBadge) + '</td>' +
                '<td style="text-align:right"><span class="am-num">' + row.limit + '</span></td>' +
                '<td style="text-align:right"><span class="am-num">' + row.current + '</span></td>' +
                '<td><div class="am-fill-bar"><div class="am-fill-bar-track"><div class="am-fill-bar-fill" style="width:' + Math.min(row.utilization, 100) + '%;background:' + barColor + '"></div></div><span class="am-fill-bar-text">' + row.utilization.toFixed(1) + '%</span></div></td>' +
                '<td>' + renderBadge(row.status, statusColor) + '</td>' +
            '</tr>';
        });

        html += '</tbody></table></div>';
        return html;
    }


    // ========================================
    // SIDEBAR: AM — Overview
    // ========================================

    function renderAmOverviewContent() {
        var fp = getFilteredPortfolios();
        var totalAum = fp.reduce(function(s, p) { return s + p.aum; }, 0);
        var avgDrift = fp.length > 0 ? fp.reduce(function(s, p) { return s + Math.abs(p.cashDrift); }, 0) / fp.length : 0;
        var breaches = fp.filter(function(p) { return Math.abs(p.cashDrift) > 0.10; }).length;
        var filteredIncoming = EVENT_MONITOR_DATA.incoming.filter(function(r) { return portfolioMatchesFilters(r.portfolio); });
        var filteredAttention = EVENT_MONITOR_DATA.attention.filter(function(r) { return portfolioMatchesFilters(r.portfolio); });
        var activeEvents = filteredIncoming.length + filteredAttention.length;

        var html = '<div class="am-overview-grid">';

        // Summary cards
        html += '<div class="am-overview-card">' +
            '<div class="am-overview-card-label">Total AUM</div>' +
            '<div class="am-overview-card-value">' + formatAum(totalAum) + '</div>' +
            '<div class="am-overview-card-sub">' + fp.length + ' portfolios</div>' +
        '</div>';

        html += '<div class="am-overview-card">' +
            '<div class="am-overview-card-label">Active Events</div>' +
            '<div class="am-overview-card-value" style="color:var(--am-amber)">' + activeEvents + '</div>' +
            '<div class="am-overview-card-sub">' + filteredIncoming.length + ' incoming / ' + filteredAttention.length + ' attention</div>' +
        '</div>';

        html += '<div class="am-overview-card">' +
            '<div class="am-overview-card-label">Cash Drift (avg)</div>' +
            '<div class="am-overview-card-value">' + avgDrift.toFixed(2) + '%</div>' +
            '<div class="am-overview-card-sub">' + breaches + ' breach' + (breaches !== 1 ? 'es' : '') + '</div>' +
        '</div>';

        var filteredOrders = ONGOING_ORDERS.filter(function(o) { return portfolioMatchesFilters(o.portfolio); });
        html += '<div class="am-overview-card">' +
            '<div class="am-overview-card-label">Ongoing Orders</div>' +
            '<div class="am-overview-card-value">' + filteredOrders.length + '</div>' +
            '<div class="am-overview-card-sub">' + filteredOrders.filter(function(o) { return o.status === 'Working'; }).length + ' working</div>' +
        '</div>';

        html += '</div>';

        // Portfolios by currency breakdown
        html += '<div class="am-table-container" style="margin-top:16px">';
        html += '<div style="padding:8px 12px;color:var(--am-text-secondary);font-size:11px;text-transform:uppercase;letter-spacing:0.5px">Portfolio Summary by Currency</div>';
        html += '<table class="am-table"><thead><tr>' +
            '<th style="width:80px">Currency</th>' +
            '<th style="width:80px;text-align:right">Count</th>' +
            '<th style="width:140px;text-align:right">Total AUM</th>' +
            '<th style="width:100px;text-align:right">Avg Cash %</th>' +
            '<th style="width:100px;text-align:right">Avg Drift %</th>' +
            '</tr></thead><tbody>';

        var ccyGroups = {};
        fp.forEach(function(p) {
            if (!ccyGroups[p.ccy]) ccyGroups[p.ccy] = { count: 0, aum: 0, cashSum: 0, driftSum: 0 };
            ccyGroups[p.ccy].count++;
            ccyGroups[p.ccy].aum += p.aum;
            ccyGroups[p.ccy].cashSum += p.cashActual;
            ccyGroups[p.ccy].driftSum += p.cashDrift;
        });

        Object.keys(ccyGroups).sort().forEach(function(ccy) {
            var g = ccyGroups[ccy];
            var avgCash = g.cashSum / g.count;
            var avgDr = g.driftSum / g.count;
            var driftCls = avgDr < 0 ? 'negative' : (avgDr > 0 ? 'positive' : '');

            html += '<tr>' +
                '<td><span class="am-mono" style="font-weight:600">' + ccy + '</span></td>' +
                '<td style="text-align:right"><span class="am-num">' + g.count + '</span></td>' +
                '<td style="text-align:right"><span class="am-num">' + formatAum(g.aum) + '</span></td>' +
                '<td style="text-align:right"><span class="am-num">' + avgCash.toFixed(2) + '%</span></td>' +
                '<td style="text-align:right"><span class="am-num ' + driftCls + '">' + (avgDr >= 0 ? '+' : '') + avgDr.toFixed(2) + '%</span></td>' +
            '</tr>';
        });

        html += '</tbody></table></div>';
        return html;
    }

    // ========================================
    // SIDEBAR: AM — Tasks
    // ========================================

    function renderAmTasksTable() {
        var tasks = [
            { id: 'T-001', title: 'Review SOD breaks for S0174909', assignee: 'J. Smith', priority: 'critical', status: 'Open', due: '10:30', category: 'SOD' },
            { id: 'T-002', title: 'Approve PTC for AI & Robotics Fund', assignee: 'S. Johnson', priority: 'critical', status: 'Open', due: '11:00', category: 'PTC' },
            { id: 'T-003', title: 'Investigate cash drift on FinTech Fund', assignee: 'M. Chen', priority: 'warning', status: 'In Progress', due: '11:30', category: 'Cash' },
            { id: 'T-004', title: 'Send orders for UK Opportunities', assignee: 'J. Smith', priority: 'warning', status: 'Open', due: '12:00', category: 'Orders' },
            { id: 'T-005', title: 'Rebalance China Innovation Equity', assignee: 'S. Johnson', priority: 'warning', status: 'Queued', due: '13:00', category: 'Rebal' },
            { id: 'T-006', title: 'FX hedge adjustment EUR/USD', assignee: 'M. Chen', priority: 'info', status: 'Queued', due: '14:00', category: 'FX' },
            { id: 'T-007', title: 'Monthly reporting — Swiss Large Cap', assignee: 'J. Smith', priority: 'info', status: 'Open', due: 'EOD', category: 'Report' },
            { id: 'T-008', title: 'Compliance check — ESG scoring', assignee: 'S. Johnson', priority: 'info', status: 'In Progress', due: 'EOD', category: 'Compl.' },
            { id: 'T-009', title: 'Review new model allocation changes', assignee: 'M. Chen', priority: 'warning', status: 'Open', due: '15:00', category: 'Model' },
            { id: 'T-010', title: 'Validate cashflow for Nordic Equity', assignee: 'J. Smith', priority: 'info', status: 'Queued', due: '16:00', category: 'Cash' },
            { id: 'T-011', title: 'Update benchmark for Japan Select', assignee: 'S. Johnson', priority: 'info', status: 'Queued', due: 'EOD', category: 'Model' },
            { id: 'T-012', title: 'End-of-day reconciliation prep', assignee: 'M. Chen', priority: 'info', status: 'Queued', due: '17:00', category: 'Recon' }
        ];

        var html = '<div class="am-table-container">';
        html += '<table class="am-table"><thead><tr>' +
            '<th style="width:60px">Task ID</th>' +
            '<th style="min-width:240px">Description</th>' +
            '<th style="width:70px">Category</th>' +
            '<th style="width:100px">Assignee</th>' +
            '<th style="width:60px">Priority</th>' +
            '<th style="width:100px">Status</th>' +
            '<th style="width:60px">Due</th>' +
            '</tr></thead><tbody>';

        tasks.forEach(function(row) {
            var statusColor = row.status === 'Open' ? 'amber' : (row.status === 'In Progress' ? 'blue' : 'grey');
            var catColor = row.category === 'SOD' ? 'red' : (row.category === 'PTC' ? 'cyan' : (row.category === 'Cash' ? 'blue' : (row.category === 'Orders' ? 'green' : 'grey')));

            html += '<tr>' +
                '<td><span class="am-mono">' + row.id + '</span></td>' +
                '<td>' + row.title + '</td>' +
                '<td>' + renderBadge(row.category, catColor) + '</td>' +
                '<td>' + row.assignee + '</td>' +
                '<td>' + renderPriorityIcon(row.priority) + '</td>' +
                '<td>' + renderBadge(row.status, statusColor) + '</td>' +
                '<td><span class="am-mono">' + row.due + '</span></td>' +
            '</tr>';
        });

        html += '</tbody></table></div>';
        return html;
    }

    // ========================================
    // SIDEBAR: AM — Reporting
    // ========================================

    function renderAmReportingTable() {
        var reports = [
            { name: 'Daily NAV Report', type: 'Daily', lastRun: '09:15:00', status: 'Completed', recipients: 3 },
            { name: 'Cash Position Summary', type: 'Daily', lastRun: '09:20:00', status: 'Completed', recipients: 5 },
            { name: 'Weekly Performance Attribution', type: 'Weekly', lastRun: '2025-06-16', status: 'Scheduled', recipients: 8 }
        ];

        var html = '<div class="am-table-container">';
        html += '<table class="am-table"><thead><tr>' +
            '<th style="min-width:240px">Report Name</th>' +
            '<th style="width:80px">Frequency</th>' +
            '<th style="width:120px">Last Run</th>' +
            '<th style="width:100px">Status</th>' +
            '<th style="width:80px;text-align:right">Recipients</th>' +
            '<th style="width:160px">Action</th>' +
            '</tr></thead><tbody>';

        reports.forEach(function(row) {
            var statusColor = row.status === 'Completed' ? 'green' : (row.status === 'Scheduled' ? 'blue' : 'grey');

            html += '<tr>' +
                '<td>' + row.name + '</td>' +
                '<td>' + renderBadge(row.type, 'grey') + '</td>' +
                '<td><span class="am-mono">' + row.lastRun + '</span></td>' +
                '<td>' + renderBadge(row.status, statusColor) + '</td>' +
                '<td style="text-align:right"><span class="am-num">' + row.recipients + '</span></td>' +
                '<td><button class="am-action-btn" onclick="event.stopPropagation()">Run Now</button> <button class="am-action-btn" onclick="event.stopPropagation()">Download</button></td>' +
            '</tr>';
        });

        html += '</tbody></table></div>';
        return html;
    }


    // ========================================
    // SIDEBAR: CORC — Compliance
    // ========================================

    function renderComplianceTable() {
        var complianceData = [
            { rule: 'Max Single Position 5%', portfolio: PORTFOLIOS[0], current: '4.82%', limit: '5.00%', status: 'OK', lastCheck: '09:45' },
            { rule: 'ESG Score >= 6.0', portfolio: PORTFOLIOS[11], current: '5.8', limit: '6.0', status: 'Breach', lastCheck: '09:45' },
            { rule: 'Sanctioned Securities', portfolio: PORTFOLIOS[4], current: '0', limit: '0', status: 'OK', lastCheck: '09:45' },
            { rule: 'Max Leverage 1.0x', portfolio: PORTFOLIOS[14], current: '1.02x', limit: '1.00x', status: 'Breach', lastCheck: '09:40' },
            { rule: 'Min Diversification (40 pos.)', portfolio: PORTFOLIOS[20], current: '38', limit: '40', status: 'Warning', lastCheck: '09:45' }
        ];

        var html = '<div class="am-table-container">';
        html += '<table class="am-table"><thead><tr>' +
            '<th style="min-width:200px">Rule</th>' +
            '<th class="am-col-id">Portfolio</th>' +
            '<th class="am-col-name">Name</th>' +
            '<th style="width:80px;text-align:right">Current</th>' +
            '<th style="width:80px;text-align:right">Limit</th>' +
            '<th style="width:100px">Status</th>' +
            '<th style="width:80px">Last Check</th>' +
            '</tr></thead><tbody>';

        complianceData.forEach(function(row) {
            var statusColor = row.status === 'Breach' ? 'red' : (row.status === 'Warning' ? 'amber' : 'green');

            html += '<tr>' +
                '<td>' + row.rule + '</td>' +
                '<td class="am-col-id"><span class="am-mono">' + row.portfolio.id + '</span></td>' +
                '<td class="am-col-name">' + escapeHtml(row.portfolio.name) + '</td>' +
                '<td style="text-align:right"><span class="am-num">' + row.current + '</span></td>' +
                '<td style="text-align:right"><span class="am-num">' + row.limit + '</span></td>' +
                '<td>' + renderBadge(row.status, statusColor) + '</td>' +
                '<td><span class="am-mono">' + row.lastCheck + '</span></td>' +
            '</tr>';
        });

        html += '</tbody></table></div>';
        return html;
    }

    // ========================================
    // SIDEBAR: CORC — Risk Monitor
    // ========================================

    function renderRiskMonitorTable() {
        var riskData = [
            { metric: 'Portfolio VaR (95%)', portfolio: PORTFOLIOS[0], value: '1.42%', limit: '2.00%', utilization: 71, status: 'OK' },
            { metric: 'Portfolio VaR (95%)', portfolio: PORTFOLIOS[4], value: '1.89%', limit: '2.00%', utilization: 94.5, status: 'Near Limit' },
            { metric: 'Tracking Error', portfolio: PORTFOLIOS[14], value: '3.12%', limit: '3.00%', utilization: 104, status: 'Breach' },
            { metric: 'Beta to Benchmark', portfolio: PORTFOLIOS[1], value: '1.15', limit: '1.20', utilization: 95.8, status: 'Near Limit' },
            { metric: 'Concentration Risk', portfolio: PORTFOLIOS[8], value: '18.4%', limit: '20.0%', utilization: 92, status: 'OK' },
            { metric: 'Liquidity Score', portfolio: PORTFOLIOS[20], value: '72', limit: '80', utilization: 90, status: 'Near Limit' },
            { metric: 'Counterparty Exp.', portfolio: PORTFOLIOS[12], value: '8.2%', limit: '10.0%', utilization: 82, status: 'OK' },
            { metric: 'FX Exposure (unhedged)', portfolio: PORTFOLIOS[16], value: '4.1%', limit: '5.0%', utilization: 82, status: 'OK' }
        ];

        var html = '<div class="am-table-container">';
        html += '<table class="am-table"><thead><tr>' +
            '<th style="width:180px">Risk Metric</th>' +
            '<th class="am-col-id">Portfolio</th>' +
            '<th class="am-col-name">Name</th>' +
            '<th style="width:80px;text-align:right">Value</th>' +
            '<th style="width:80px;text-align:right">Limit</th>' +
            '<th style="width:140px">Utilization</th>' +
            '<th style="width:100px">Status</th>' +
            '</tr></thead><tbody>';

        riskData.forEach(function(row) {
            var statusColor = row.status === 'Breach' ? 'red' : (row.status === 'Near Limit' ? 'amber' : 'green');
            var barColor = row.utilization > 100 ? 'var(--am-red)' : (row.utilization > 90 ? 'var(--am-amber)' : 'var(--am-green)');

            html += '<tr>' +
                '<td>' + row.metric + '</td>' +
                '<td class="am-col-id"><span class="am-mono">' + row.portfolio.id + '</span></td>' +
                '<td class="am-col-name">' + escapeHtml(row.portfolio.name) + '</td>' +
                '<td style="text-align:right"><span class="am-num">' + row.value + '</span></td>' +
                '<td style="text-align:right"><span class="am-num">' + row.limit + '</span></td>' +
                '<td><div class="am-fill-bar"><div class="am-fill-bar-track"><div class="am-fill-bar-fill" style="width:' + Math.min(row.utilization, 100) + '%;background:' + barColor + '"></div></div><span class="am-fill-bar-text">' + row.utilization.toFixed(0) + '%</span></div></td>' +
                '<td>' + renderBadge(row.status, statusColor) + '</td>' +
            '</tr>';
        });

        html += '</tbody></table></div>';
        return html;
    }

    // ========================================
    // SIDEBAR: CORC — Controls
    // ========================================

    function renderControlsTable() {
        var controls = [
            { id: 'CTL-001', name: '4-Eye Principle — Order Approval', frequency: 'Per Trade', lastExec: '09:42', result: 'Pass', owner: 'J. Smith' },
            { id: 'CTL-002', name: 'SOD Reconciliation', frequency: 'Daily', lastExec: '07:00', result: 'Pass', owner: 'Ops Team' },
            { id: 'CTL-003', name: 'NAV Validation', frequency: 'Daily', lastExec: '08:15', result: 'Pass', owner: 'Ops Team' },
            { id: 'CTL-004', name: 'Trade Limit Check', frequency: 'Per Trade', lastExec: '09:38', result: 'Pass', owner: 'Risk Team' },
            { id: 'CTL-005', name: 'Pre-Trade Compliance', frequency: 'Per Trade', lastExec: '09:42', result: 'Fail', owner: 'Compliance' },
            { id: 'CTL-006', name: 'Cash Balance Verification', frequency: 'Daily', lastExec: '08:30', result: 'Pass', owner: 'Ops Team' },
            { id: 'CTL-007', name: 'FX Rate Source Validation', frequency: 'Daily', lastExec: '07:15', result: 'Pass', owner: 'Ops Team' },
            { id: 'CTL-008', name: 'Corporate Action Processing', frequency: 'Daily', lastExec: '08:00', result: 'Warning', owner: 'Ops Team' },
            { id: 'CTL-009', name: 'Benchmark Data Quality', frequency: 'Daily', lastExec: '07:30', result: 'Pass', owner: 'Data Team' },
            { id: 'CTL-010', name: 'Position Limit Monitoring', frequency: 'Continuous', lastExec: '09:45', result: 'Pass', owner: 'Risk Team' },
            { id: 'CTL-011', name: 'Settlement Instruction Check', frequency: 'Per Trade', lastExec: '09:40', result: 'Pass', owner: 'Ops Team' },
            { id: 'CTL-012', name: 'Pricing Source Comparison', frequency: 'Daily', lastExec: '08:45', result: 'Pass', owner: 'Data Team' },
            { id: 'CTL-013', name: 'Regulatory Exposure Report', frequency: 'Weekly', lastExec: '2025-06-16', result: 'Pass', owner: 'Compliance' },
            { id: 'CTL-014', name: 'Client Mandate Compliance', frequency: 'Daily', lastExec: '09:00', result: 'Warning', owner: 'Compliance' }
        ];

        var html = '<div class="am-table-container">';
        html += '<table class="am-table"><thead><tr>' +
            '<th style="width:70px">Control ID</th>' +
            '<th style="min-width:240px">Control Name</th>' +
            '<th style="width:90px">Frequency</th>' +
            '<th style="width:100px">Last Executed</th>' +
            '<th style="width:80px">Result</th>' +
            '<th style="width:100px">Owner</th>' +
            '</tr></thead><tbody>';

        controls.forEach(function(row) {
            var resultColor = row.result === 'Pass' ? 'green' : (row.result === 'Fail' ? 'red' : 'amber');

            html += '<tr>' +
                '<td><span class="am-mono">' + row.id + '</span></td>' +
                '<td>' + row.name + '</td>' +
                '<td>' + renderBadge(row.frequency, 'grey') + '</td>' +
                '<td><span class="am-mono">' + row.lastExec + '</span></td>' +
                '<td>' + renderBadge(row.result, resultColor) + '</td>' +
                '<td>' + row.owner + '</td>' +
            '</tr>';
        });

        html += '</tbody></table></div>';
        return html;
    }


    // ========================================
    // DETAIL PANEL (Right Side)
    // ========================================

    function renderDetailPanel() {
        if (state.panelMode === null) {
            return '<div class="am-detail-panel collapsed"></div>';
        }

        if (state.panelMode === 'chatbot') {
            return renderChatbotPanel();
        }

        // Detail mode
        var p = state.selectedPortfolio;
        if (!p) return '<div class="am-detail-panel collapsed"></div>';

        var html = '<div class="am-detail-panel">';

        // Panel header
        html += '<div class="am-panel-header">' +
            '<div class="am-panel-title">' + ICONS.portfolio + ' Portfolio Detail</div>' +
            '<button class="am-panel-close" onclick="amClosePanel()">' + ICONS.x + '</button>' +
        '</div>';

        // Panel body
        html += '<div class="am-panel-body">';

        // Portfolio Info
        html += '<div class="am-panel-section">' +
            '<div class="am-panel-section-title">Portfolio Information</div>' +
            '<div class="am-panel-row"><span class="am-panel-label">ID</span><span class="am-panel-value mono">' + p.id + '</span></div>' +
            '<div class="am-panel-row"><span class="am-panel-label">Name</span><span class="am-panel-value">' + escapeHtml(p.name) + '</span></div>' +
            '<div class="am-panel-row"><span class="am-panel-label">Model</span><span class="am-panel-value mono">' + p.model + '</span></div>' +
            '<div class="am-panel-row"><span class="am-panel-label">Currency</span><span class="am-panel-value mono">' + p.ccy + '</span></div>' +
            '<div class="am-panel-row"><span class="am-panel-label">Market Value</span><span class="am-panel-value mono">' + formatCurrency(p.aum, p.ccy) + '</span></div>' +
        '</div>';

        // Cash Position Breakdown
        var maxPct = Math.max(p.cashTarget, p.cashActual, 2.5);
        var targetWidth = (p.cashTarget / maxPct * 100).toFixed(1);
        var actualWidth = (p.cashActual / maxPct * 100).toFixed(1);
        var driftAbs = Math.abs(p.cashDrift);
        var driftWidth = (driftAbs / maxPct * 100).toFixed(1);
        var driftCls = p.cashDrift < 0 ? 'drift-neg' : 'drift-pos';

        html += '<div class="am-panel-section">' +
            '<div class="am-panel-section-title">Cash Position Breakdown</div>' +
            '<div class="am-cash-bar-container">' +
                '<div class="am-cash-bar-row">' +
                    '<span class="am-cash-bar-label">Target</span>' +
                    '<div class="am-cash-bar-track"><div class="am-cash-bar-fill target" style="width:' + targetWidth + '%"></div></div>' +
                    '<span class="am-cash-bar-value">' + p.cashTarget.toFixed(2) + '%</span>' +
                '</div>' +
                '<div class="am-cash-bar-row">' +
                    '<span class="am-cash-bar-label">Actual</span>' +
                    '<div class="am-cash-bar-track"><div class="am-cash-bar-fill actual" style="width:' + actualWidth + '%"></div></div>' +
                    '<span class="am-cash-bar-value">' + p.cashActual.toFixed(2) + '%</span>' +
                '</div>' +
                '<div class="am-cash-bar-row">' +
                    '<span class="am-cash-bar-label">Drift</span>' +
                    '<div class="am-cash-bar-track"><div class="am-cash-bar-fill ' + driftCls + '" style="width:' + driftWidth + '%"></div></div>' +
                    '<span class="am-cash-bar-value" style="color:' + (p.cashDrift < 0 ? 'var(--am-accent-red)' : 'var(--am-accent-green)') + '">' + (p.cashDrift >= 0 ? '+' : '') + p.cashDrift.toFixed(2) + '%</span>' +
                '</div>' +
            '</div>' +
        '</div>';

        // Order List (sample)
        html += '<div class="am-panel-section">' +
            '<div class="am-panel-section-title">Recent Orders</div>' +
            '<ul class="am-order-list">' +
                '<li class="am-order-item"><span>' + renderBadge('Buy', 'green') + ' AAPL US</span><span class="am-mono">2,500 @ 189.42</span></li>' +
                '<li class="am-order-item"><span>' + renderBadge('Sell', 'red') + ' MSFT US</span><span class="am-mono">1,200 @ 442.10</span></li>' +
                '<li class="am-order-item"><span>' + renderBadge('Buy', 'green') + ' NESN SW</span><span class="am-mono">800 @ 98.54</span></li>' +
                '<li class="am-order-item"><span>' + renderBadge('Sell', 'red') + ' ROG SW</span><span class="am-mono">350 @ 271.30</span></li>' +
            '</ul>' +
        '</div>';

        // Timeline
        html += '<div class="am-panel-section">' +
            '<div class="am-panel-section-title">Timeline</div>' +
            '<div class="am-timeline">' +
                '<div class="am-timeline-item completed"><div>SOD check completed</div><div class="am-timeline-time">07:15:22</div></div>' +
                '<div class="am-timeline-item completed"><div>Cashflow received</div><div class="am-timeline-time">07:45:10</div></div>' +
                '<div class="am-timeline-item completed"><div>Portfolio optimized</div><div class="am-timeline-time">08:02:33</div></div>' +
                '<div class="am-timeline-item current"><div>PTC check in progress</div><div class="am-timeline-time">08:15:47</div></div>' +
                '<div class="am-timeline-item"><div>Orders pending</div><div class="am-timeline-time">--:--:--</div></div>' +
            '</div>' +
        '</div>';

        html += '</div>'; // panel-body
        html += '</div>'; // detail-panel
        return html;
    }

    // ========================================
    // CHATBOT PANEL
    // ========================================

    function renderChatbotPanel() {
        var p = state.selectedPortfolio;
        if (!p) return '<div class="am-detail-panel collapsed"></div>';

        // Find SOD data for this portfolio
        var sodData = null;
        var sodIdx = -1;
        SOD_ALERT_DATA.forEach(function(d, i) {
            if (d.portfolio.id === p.id) { sodData = d; sodIdx = i; }
        });

        var html = '<div class="am-detail-panel">';
        html += '<div class="am-chatbot-panel">';

        // Agent header
        html += '<div class="am-chat-agent-header">' +
            '<div class="am-chat-agent-icon">' + ICONS.bot + '</div>' +
            '<div>' +
                '<div class="am-chat-agent-name">Active Equities Agent</div>' +
                '<div class="am-chat-agent-context">Analyzing ' + p.id + '</div>' +
            '</div>' +
            '<button class="am-panel-close" style="margin-left:auto;" onclick="amClosePanel()">' + ICONS.x + '</button>' +
        '</div>';

        // Messages area
        html += '<div class="am-chat-messages" id="amChatMessages">';

        // Initial AI message with data table
        if (sodData) {
            html += '<div class="am-chat-bubble ai">';
            html += '<p style="margin:0 0 8px 0;">I detected the following data changes for <strong>' + p.id + '</strong> (' + escapeHtml(p.name) + '):</p>';
            html += '<table class="am-chat-data-table"><thead><tr><th>Attribute</th><th>EOD %</th><th>SOD %</th><th>Change %</th><th>Comments</th></tr></thead><tbody>';
            sodData.attributes.forEach(function(attr) {
                html += '<tr><td style="color:var(--am-text-primary)">' + attr.attr + '</td><td>' + attr.eod + '</td><td>' + attr.sod + '</td><td style="color:' + (attr.change.indexOf('-') === 0 ? 'var(--am-accent-red)' : 'var(--am-accent-green)') + '">' + attr.change + '</td><td style="font-family:var(--am-font-body);color:var(--am-text-muted);font-size:10px">' + attr.comment + '</td></tr>';
            });
            html += '</tbody></table>';
            html += '<p style="margin:8px 0 0 0;color:var(--am-text-secondary);font-size:11px;">Please select a change reason or ask me for more details.</p>';
            html += '</div>';
        }

        // Render user chat messages
        state.chatMessages.forEach(function(msg) {
            html += '<div class="am-chat-bubble ' + msg.role + '">' + msg.content + '</div>';
        });

        html += '</div>'; // messages

        // Quick Actions
        html += '<div class="am-quick-actions">' +
            '<div class="am-quick-actions-title">Quick Actions</div>' +
            '<button class="am-quick-action-btn" onclick="amQuickAction(\'Flow missing\')">' +
                '<span>Mark as Flow Missing</span>' + ICONS.chevronRight +
            '</button>' +
            '<button class="am-quick-action-btn" onclick="amQuickAction(\'Price correction\')">' +
                '<span>Mark as Price Correction</span>' + ICONS.chevronRight +
            '</button>' +
            '<button class="am-quick-action-btn" onclick="amQuickAction(\'FX rate change\')">' +
                '<span>Mark as FX Rate Change</span>' + ICONS.chevronRight +
            '</button>' +
        '</div>';

        // Suggested Prompts
        html += '<div class="am-suggested-prompts">' +
            '<div class="am-suggested-title">Suggested Prompts</div>' +
            '<div class="am-suggested-prompt" onclick="amFillPrompt(\'Show all unresolved breaks by priority\')">' + ICONS.messageSquare + ' Show all unresolved breaks by priority</div>' +
            '<div class="am-suggested-prompt" onclick="amFillPrompt(\'Compare positions with custodian\')">' + ICONS.messageSquare + ' Compare positions with custodian</div>' +
            '<div class="am-suggested-prompt" onclick="amFillPrompt(\'Explain NAV difference for this portfolio\')">' + ICONS.messageSquare + ' Explain NAV difference for this portfolio</div>' +
            '<div class="am-suggested-prompt" onclick="amFillPrompt(\'Show corporate actions affecting this portfolio\')">' + ICONS.messageSquare + ' Show corporate actions affecting this portfolio</div>' +
            '<div class="am-suggested-prompt" onclick="amFillPrompt(\'Show instrument changes\')">' + ICONS.messageSquare + ' Show instrument changes</div>' +
        '</div>';

        // Chat Input
        html += '<div class="am-chat-input-area">' +
            '<div class="am-chat-input-wrapper">' +
                '<input type="text" class="am-chat-input" id="amChatInput" placeholder="Ask about this portfolio..." onkeydown="if(event.key===\'Enter\')amSendChat()" />' +
                '<button class="am-chat-send-btn" onclick="amSendChat()">' + ICONS.send + '</button>' +
            '</div>' +
        '</div>';

        // Disclaimer
        html += '<div class="am-chat-disclaimer">' + ICONS.info + ' Do not use AI-generated content as investment advice.</div>';

        html += '</div>'; // chatbot-panel
        html += '</div>'; // detail-panel
        return html;
    }


    // ========================================
    // MAIN RENDER
    // ========================================

    function renderContent() {
        // Portfolio sidebar uses the original tab-based routing
        if (state.activeSidebar === 'portfolio') {
            switch (state.activeTab) {
                case 'eventMonitor': return renderEventMonitorTable();
                case 'cashflows': return renderCashflowsTable();
                case 'sodAlert': return renderSodAlertTable();
                case 'sodItemChanges': return renderSodItemChangesTable();
                case 'ongoingOrders': return renderOngoingOrdersTable();
            }
            return '';
        }

        // Other sidebar sections dispatch by activeTab
        switch (state.activeTab) {
            // Cash
            case 'cashBalances': return renderCashBalancesTable();
            case 'cashProjection': return renderCashProjectionTable();
            case 'cashDrift': return renderCashDriftTable();
            // Currency
            case 'fxExposure': return renderFxExposureTable();
            case 'hedging': return renderHedgingTable();
            case 'fxOrders': return renderFxOrdersTable();
            // Strategy
            case 'modelAllocation': return renderModelAllocationTable();
            case 'trackingError': return renderTrackingErrorTable();
            case 'rebalancing': return renderRebalancingTable();
            // Optimizer
            case 'optimizerQueue': return renderOptimizerQueueTable();
            case 'tradeList': return renderTradeListTable();
            case 'constraints': return renderConstraintsTable();
            // AM
            case 'amOverview': return renderAmOverviewContent();
            case 'amTasks': return renderAmTasksTable();
            case 'amReporting': return renderAmReportingTable();
            // CORC
            case 'compliance': return renderComplianceTable();
            case 'riskMonitor': return renderRiskMonitorTable();
            case 'controls': return renderControlsTable();
        }
        return '';
    }

    function renderAll() {
        clearAllTimers();

        var container = document.getElementById('assetModule');
        if (!container) return;

        var html = renderHeader() +
            renderFilterBar() +
            renderTabNav() +
            '<div class="am-container">' +
                renderSidebar() +
                '<div class="am-main">' +
                    '<div class="am-content-wrapper">' +
                        '<div class="am-table-area am-fade-in">' + renderContent() + '</div>' +
                        renderDetailPanel() +
                    '</div>' +
                '</div>' +
            '</div>';

        container.innerHTML = html;

        // Start countdown timers
        startCountdownTimers();
    }

    // ========================================
    // COUNTDOWN TIMER LOGIC
    // ========================================

    function startCountdownTimers() {
        // Event Monitor countdowns
        ['incoming', 'attention'].forEach(function(groupKey) {
            var group = EVENT_MONITOR_DATA[groupKey];
            if (!group) return;
            group.forEach(function(row, idx) {
                if (row.countdown > 0) {
                    var elId = 'em-cd-' + groupKey + '-' + idx;
                    var intervalId = setInterval(function() {
                        row.countdown--;
                        if (row.countdown <= 0) {
                            row.countdown = 0;
                            clearInterval(intervalId);
                        }
                        var el = document.getElementById(elId);
                        if (el) {
                            el.innerHTML = ICONS.clock + ' ' + formatCountdown(row.countdown);
                        }
                    }, 1000);
                    timerIntervals.push(intervalId);
                }
            });
        });

        // Cashflow countdowns
        CASHFLOW_DATA.forEach(function(row, idx) {
            if (row.countdown > 0) {
                var elId = 'cf-cd-' + idx;
                var intervalId = setInterval(function() {
                    row.countdown--;
                    if (row.countdown <= 0) {
                        row.countdown = 0;
                        clearInterval(intervalId);
                    }
                    var el = document.getElementById(elId);
                    if (el) {
                        el.innerHTML = ICONS.clock + ' ' + formatCountdown(row.countdown);
                    }
                }, 1000);
                timerIntervals.push(intervalId);
            }
        });

        // Update "last updated" timestamp periodically
        var tsInterval = setInterval(function() {
            var el = document.getElementById('amLastUpdated');
            if (el) el.textContent = formatTime(new Date());
        }, 1000);
        timerIntervals.push(tsInterval);
    }

    // ========================================
    // EVENT HANDLERS
    // ========================================

    // Asset Class filter
    window.amSetAssetClass = function(value) {
        state.assetClass = value;
        state.selectedPortfolio = null;
        state.selectedRowIndex = null;
        state.panelMode = null;
        renderAll();
    };

    // PM filter
    window.amSetPm = function(value) {
        state.pm = value;
        state.selectedPortfolio = null;
        state.selectedRowIndex = null;
        state.panelMode = null;
        renderAll();
    };

    // Tab switching
    window.amSwitchTab = function(tab) {
        state.activeTab = tab;
        state.selectedPortfolio = null;
        state.selectedRowIndex = null;
        state.panelMode = null;
        state.chatMessages = [];
        state.sortColumn = null;
        state.sortDirection = 'asc';
        renderAll();
    };

    // Sidebar navigation
    window.amSwitchSidebar = function(key) {
        state.activeSidebar = key;
        state.activeTab = getDefaultTab(key);
        state.selectedPortfolio = null;
        state.selectedRowIndex = null;
        state.panelMode = null;
        state.chatMessages = [];
        state.searchQuery = '';
        state.activeFilter = 'all';
        renderAll();
    };

    // Filter chips
    window.amSetFilter = function(filter) {
        state.activeFilter = filter;
        renderAll();
    };

    // Search
    window.amSearch = function(query) {
        state.searchQuery = query;
        renderAll();
    };

    // Collapse groups
    window.amToggleGroup = function(groupKey) {
        if (state.collapsedGroups.has(groupKey)) {
            state.collapsedGroups.delete(groupKey);
        } else {
            state.collapsedGroups.add(groupKey);
        }
        renderAll();
    };

    // Sort
    window.amSort = function(column) {
        if (state.sortColumn === column) {
            state.sortDirection = state.sortDirection === 'asc' ? 'desc' : 'asc';
        } else {
            state.sortColumn = column;
            state.sortDirection = 'asc';
        }
        // For simplicity, re-render (sorting applied in render functions)
        renderAll();
    };

    // Close panel
    window.amClosePanel = function() {
        state.panelMode = null;
        state.selectedPortfolio = null;
        state.selectedRowIndex = null;
        state.chatMessages = [];
        renderAll();
    };

    // Event Monitor row select
    window.amSelectEventRow = function(globalIdx, groupKey, idx) {
        state.selectedRowIndex = globalIdx;
        var row = EVENT_MONITOR_DATA[groupKey][idx];
        if (row) {
            state.selectedPortfolio = row.portfolio;
            state.panelMode = 'detail';
            state.chatMessages = [];
        }
        renderAll();
    };

    // Cashflow row select
    window.amSelectCfRow = function(idx) {
        state.selectedRowIndex = 'cf-' + idx;
        var row = CASHFLOW_DATA[idx];
        if (row) {
            state.selectedPortfolio = row.portfolio;
            state.panelMode = 'detail';
            state.chatMessages = [];
        }
        renderAll();
    };

    // SOD row select
    window.amSelectSodRow = function(idx) {
        state.selectedRowIndex = 'sod-' + idx;
        var row = SOD_ALERT_DATA[idx];
        if (row) {
            state.selectedPortfolio = row.portfolio;
            state.chatMessages = [];
            // If no reason set, show chatbot; otherwise show detail
            if (!row.reason) {
                state.panelMode = 'chatbot';
            } else {
                state.panelMode = 'detail';
            }
        }
        renderAll();
    };

    // SOD Item Changes row select
    window.amSelectItemChangeRow = function(idx) {
        var row = SOD_ITEM_CHANGES[idx];
        if (row) {
            state.selectedPortfolio = row.portfolio;
            state.panelMode = 'detail';
            state.selectedRowIndex = 'item-' + idx;
            state.chatMessages = [];
        }
        renderAll();
    };

    // Order row select
    window.amSelectOrderRow = function(idx) {
        var row = ONGOING_ORDERS[idx];
        if (row) {
            state.selectedPortfolio = row.portfolio;
            state.panelMode = 'detail';
            state.selectedRowIndex = 'order-' + idx;
            state.chatMessages = [];
        }
        renderAll();
    };

    // Set SOD reason from dropdown
    window.amSetSodReason = function(idx, reason) {
        if (reason && SOD_ALERT_DATA[idx]) {
            SOD_ALERT_DATA[idx].reason = reason;
            updateLastUpdated();
            renderAll();
        }
    };

    // SOD sub-tab switch
    window.amSetSodSubTab = function(tab) {
        state.sodSubTab = tab;
        renderAll();
    };

    // Cashflow actions
    window.amCfAction = function(idx, action) {
        var row = CASHFLOW_DATA[idx];
        if (!row) return;

        switch (action) {
            case 'approvePtc':
                row.orderStatus = 'PTC completed';
                row.wfStep = 3;
                break;
            case 'request4eye':
                row.orderStatus = 'Ready to send';
                break;
            case 'sendOrders':
                row.orderStatus = 'Trading';
                row.tradeRequired = false;
                break;
        }
        updateLastUpdated();
        renderAll();
    };

    // Chat: fill prompt
    window.amFillPrompt = function(text) {
        var input = document.getElementById('amChatInput');
        if (input) {
            input.value = text;
            input.focus();
        }
    };

    // Chat: send message
    window.amSendChat = function() {
        var input = document.getElementById('amChatInput');
        if (!input || !input.value.trim()) return;

        var userMsg = input.value.trim();
        state.chatMessages.push({ role: 'user', content: escapeHtml(userMsg) });
        input.value = '';

        // Re-render to show user message
        renderAll();

        // Simulate AI response after delay
        setTimeout(function() {
            var aiResponse = generateAiResponse(userMsg);
            state.chatMessages.push({ role: 'ai', content: aiResponse });
            renderAll();

            // Scroll to bottom
            var messagesEl = document.getElementById('amChatMessages');
            if (messagesEl) messagesEl.scrollTop = messagesEl.scrollHeight;
        }, 800);
    };

    function generateAiResponse(query) {
        var q = query.toLowerCase();
        var p = state.selectedPortfolio;

        if (q.indexOf('unresolved breaks') !== -1 || q.indexOf('priority') !== -1) {
            return 'Based on current data, there are <strong>3 unresolved breaks</strong> sorted by priority:<br><br>' +
                '1. <strong>' + PORTFOLIOS[4].id + '</strong> - Cash position deviation of -0.15% (Critical)<br>' +
                '2. <strong>' + PORTFOLIOS[16].id + '</strong> - Unexplained NAV movement of -0.28% (Warning)<br>' +
                '3. <strong>' + PORTFOLIOS[20].id + '</strong> - Minor cash drift of -0.06% (Info)<br><br>' +
                'Would you like me to investigate any of these in detail?';
        }
        if (q.indexOf('custodian') !== -1 || q.indexOf('compare positions') !== -1) {
            return 'Position comparison with custodian for <strong>' + (p ? p.id : 'selected portfolio') + '</strong>:<br><br>' +
                'Total positions: 147 (internal) vs 147 (custodian)<br>' +
                'Matching: 145 positions (98.6%)<br>' +
                'Differences: 2 positions with minor quantity discrepancies<br><br>' +
                '- AAPL US: Internal 12,500 vs Custodian 12,480 (pending settlement)<br>' +
                '- NOVN SW: Internal 3,200 vs Custodian 3,210 (rounding)';
        }
        if (q.indexOf('nav') !== -1 || q.indexOf('difference') !== -1) {
            return 'NAV analysis for <strong>' + (p ? p.id : 'selected portfolio') + '</strong>:<br><br>' +
                'EOD NAV: ' + (p ? formatAum(p.aum) : 'N/A') + '<br>' +
                'SOD NAV: ' + (p ? formatAum(p.aum * 0.997) : 'N/A') + '<br>' +
                'Difference: -0.30%<br><br>' +
                'Breakdown:<br>' +
                '- Market movement: -0.18%<br>' +
                '- FX impact: -0.08%<br>' +
                '- Cash flow impact: -0.04%<br><br>' +
                'The primary driver is overnight market movement in US equities.';
        }
        if (q.indexOf('corporate actions') !== -1) {
            return 'Corporate actions for <strong>' + (p ? p.id : 'selected portfolio') + '</strong>:<br><br>' +
                'No pending corporate actions detected for today.<br><br>' +
                'Recent (last 5 days):<br>' +
                '- MSFT US: Dividend ex-date Jun 15 ($0.75/share) - processed<br>' +
                '- NESN SW: Stock split record date Jun 16 - applied<br><br>' +
                'Upcoming (next 5 days):<br>' +
                '- AAPL US: Dividend ex-date Jun 21 ($0.96/share)';
        }
        if (q.indexOf('instrument') !== -1 || q.indexOf('changes') !== -1) {
            return 'Instrument changes detected for <strong>' + (p ? p.id : 'selected portfolio') + '</strong>:<br><br>' +
                'Total instruments: 147<br>' +
                'Changed: 4 instruments<br><br>' +
                '1. AAPL US - Price: $189.42 to $188.75 (-0.35%)<br>' +
                '2. NVDA US - Price: $131.20 to $133.85 (+2.02%)<br>' +
                '3. ASML NA - Rating: Hold to Buy (analyst upgrade)<br>' +
                '4. ROG SW - FX adjusted: CHF 271.30 to CHF 270.85';
        }

        return 'Thank you for your question. Based on the current data for <strong>' + (p ? p.id : 'this portfolio') + '</strong>, ' +
            'I can see that the portfolio has ' + (p ? formatAum(p.aum) + ' ' + p.ccy : 'N/A') + ' in assets under management ' +
            'with a cash target of ' + (p ? p.cashTarget.toFixed(2) + '%' : 'N/A') + ' and current actual cash of ' + (p ? p.cashActual.toFixed(2) + '%' : 'N/A') + '. ' +
            'Would you like me to provide more specific analysis?';
    }

    // Quick Actions in chatbot
    window.amQuickAction = function(reason) {
        if (!state.selectedPortfolio) return;

        // Find SOD data for this portfolio and set reason
        SOD_ALERT_DATA.forEach(function(d) {
            if (d.portfolio.id === state.selectedPortfolio.id) {
                d.reason = reason;
            }
        });

        state.chatMessages.push({ role: 'ai', content: 'SOD change reason set to <strong>"' + reason + '"</strong> for portfolio ' + state.selectedPortfolio.id + '. The workflow has been advanced to the next step.' });
        updateLastUpdated();
        renderAll();
    };


    // ========================================
    // MODULE LOAD & OPEN FUNCTIONS
    // ========================================

    function loadAssetModule() {
        if (assetModuleLoaded) return;

        var container = document.getElementById('assetModule');
        if (!container) {
            console.warn('Asset Management: #assetModule container not found');
            return;
        }

        assetModuleLoaded = true;
        renderAll();
        console.log('Asset Management module loaded');
    }

    function openAssetManagement() {
        var container = document.getElementById('assetModule');
        if (container) {
            container.style.display = '';
        }
        if (!assetModuleLoaded) {
            loadAssetModule();
        } else {
            renderAll();
        }
    }

    // Expose global functions
    window.loadAssetModule = loadAssetModule;
    window.openAssetManagement = openAssetManagement;

    // Cleanup on unload
    window.addEventListener('beforeunload', function() {
        clearAllTimers();
    });

})();
