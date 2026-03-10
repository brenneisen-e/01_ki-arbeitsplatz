// js/vv-overview.js – OPT-21: Vermögensverwaltung Overview (VV-02) + Detail (VV-10)
// Berater-Cockpit, Mandantenliste, Pipeline, Portfolio-Übersicht, Compliance, Reporting
// Mandanten-Detail: Client 360°, Portfolio, Vermögensbilanz, Compliance, Potentiale

(function() {
    'use strict';

    var currentVVTab = 'uebersicht';
    var currentVVDetailTab = 'stammdaten';
    var currentVVMandant = null;

    // ── HELPER FUNCTIONS ──
    function fmtEuroVV(val) {
        if (val >= 1000000) return (val / 1000000).toFixed(1).replace('.', ',') + 'M €';
        if (val >= 1000) return (val / 1000).toFixed(0) + 'k €';
        return val.toLocaleString('de-DE') + ' €';
    }

    function fmtEuroFull(val) {
        return val.toLocaleString('de-DE', { minimumFractionDigits: 0, maximumFractionDigits: 0 }) + ' €';
    }

    function fmtPercent(val) {
        return (val >= 0 ? '+' : '') + val.toFixed(1).replace('.', ',') + '%';
    }

    function getInitialsVV(name) {
        var parts = name.replace(/Dr\.\s*/g, '').replace(/Prof\.\s*/g, '').split(' ');
        if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
        return name.substring(0, 2).toUpperCase();
    }

    function getStatusBadge(status) {
        var map = {
            'ok': '<span class="vv-status-badge vv-status-ok">✓ ok</span>',
            'drift': '<span class="vv-status-badge vv-status-warning">⚠ Drift</span>',
            'wphg': '<span class="vv-status-badge vv-status-warning">⚠ WpHG</span>',
            'risk': '<span class="vv-status-badge vv-status-danger">⚠ At-Risk</span>'
        };
        return map[status] || map['ok'];
    }

    // ── SHOW VV OVERVIEW ──
    function showVVOverview() {
        // Hide all other pages
        ['landingPage', 'mainApp', 'agenturOverview', 'beraterOverviewPage',
         'kundenDetailPage', 'kundenDetailBankPage', 'billingCheckPage',
         'potentialAnalysePage', 'bgavUmstellungPage', 'vvDetailPage'].forEach(function(id) {
            var el = document.getElementById(id);
            if (el) el.style.display = 'none';
        });

        // Show VV overview
        var vvPage = document.getElementById('vvOverviewPage');
        if (vvPage) vvPage.style.display = 'block';

        // Set mode
        if (typeof setMode === 'function') setMode('vermoegensverwaltung');

        // Fill data
        fillVVHeader();
        fillVVKPIs();
        showVVTab('uebersicht');

        // Dispatch event
        document.dispatchEvent(new CustomEvent('viewChanged', { detail: { module: 'vermoegensverwaltung', view: 'vvOverview' } }));

        if (window.AppRouter) AppRouter.navigate('/vv-overview');
    }

    // ── FILL HEADER ──
    function fillVVHeader() {
        var data = window.vvBeraterData;
        if (!data) return;
        var title = document.getElementById('vvPageTitle');
        if (title) title.textContent = 'Berater: ' + data.name;
        var sub = document.getElementById('vvSubtitle');
        if (sub) sub.textContent = data.titel + ' · ' + data.standort + ' · seit ' + data.seit;
    }

    // ── FILL KPIs ──
    function fillVVKPIs() {
        var mandanten = window.vvMockMandanten || {};
        var names = Object.keys(mandanten);

        var totalAuM = 0, totalNNM = 0, totalErtrag = 0, totalMarge = 0, atRisk = 0;
        names.forEach(function(n) {
            var m = mandanten[n];
            totalAuM += m.aum || 0;
            totalNNM += m.netNewMoney || 0;
            totalErtrag += m.ertragProJahr || 0;
            totalMarge += m.managementFee || 0;
            if (m.statusIcon === 'risk' || m.statusIcon === 'drift' || m.statusIcon === 'wphg') atRisk++;
        });
        var avgMarge = names.length > 0 ? (totalMarge / names.length * 100) : 0;

        var kpiData = [
            { id: 'vvKpiAuM', value: fmtEuroVV(totalAuM), trend: '+12% YoY' },
            { id: 'vvKpiNNM', value: '+' + fmtEuroVV(totalNNM), trend: 'YTD' },
            { id: 'vvKpiErtrag', value: fmtEuroVV(totalErtrag), trend: 'YTD' },
            { id: 'vvKpiMandate', value: names.length.toString(), trend: '+5 YTD' },
            { id: 'vvKpiMarge', value: avgMarge.toFixed(2).replace('.', ',') + '%', trend: '-0,03pp' },
            { id: 'vvKpiAtRisk', value: atRisk.toString(), trend: fmtEuroVV(names.reduce(function(s, n) { var m = mandanten[n]; return s + ((m.statusIcon !== 'ok') ? m.aum : 0); }, 0)) + ' AuM' }
        ];
        kpiData.forEach(function(k) {
            var el = document.getElementById(k.id);
            if (el) el.querySelector('.vv-kpi-value').textContent = k.value;
            if (el) el.querySelector('.vv-kpi-trend').textContent = k.trend;
        });
    }

    // ── TAB SWITCHING ──
    function showVVTab(tabName) {
        currentVVTab = tabName;

        // Deactivate all tabs
        document.querySelectorAll('.vv-tab-content').forEach(function(c) { c.classList.remove('active'); });
        document.querySelectorAll('.vv-tab-btn').forEach(function(b) { b.classList.remove('active'); });

        // Activate target
        var target = document.getElementById('vv-tab-' + tabName);
        if (target) target.classList.add('active');
        var btn = document.querySelector('.vv-tab-btn[data-tab="' + tabName + '"]');
        if (btn) btn.classList.add('active');

        // Fill tab content
        if (tabName === 'uebersicht') fillVVUebersicht();
        if (tabName === 'mandatsliste') fillVVMandatsliste();
        if (tabName === 'pipeline') fillVVPipeline();
        if (tabName === 'portfolio') fillVVPortfolioOverview();
        if (tabName === 'compliance') fillVVComplianceOverview();
        if (tabName === 'reporting') fillVVReporting();
    }

    // ── ÜBERSICHT TAB ──
    function fillVVUebersicht() {
        var el = document.getElementById('vv-tab-uebersicht');
        if (!el) return;

        // Tagesstart
        var html = '<div class="uebersicht-card vv-card"><div class="uebersicht-card-header"><h3>';
        html += '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>';
        html += ' Tagesstart – 10. März 2026</h3></div><div style="padding:16px;">';
        html += '<div class="vv-tagesstart-items">';
        html += '<div class="vv-tagesstart-item vv-prio-hoch"><span class="vv-ts-icon">⚠</span> Geeignetheitsbericht Q1 für <strong>Keller NextGen</strong> in 21 Tagen fällig</div>';
        html += '<div class="vv-tagesstart-item vv-prio-hoch"><span class="vv-ts-icon">⚠</span> WpHG-Bogen <strong>Keller NextGen</strong> abgelaufen – Aktualisierung erforderlich</div>';
        html += '<div class="vv-tagesstart-item vv-prio-mittel"><span class="vv-ts-icon">📊</span> Rebalancing-Bedarf bei <strong>Dr. von Trott</strong>: Aktienquote +2pp über Soll</div>';
        html += '<div class="vv-tagesstart-item vv-prio-mittel"><span class="vv-ts-icon">📧</span> Anlagevorschlag für <strong>Dr. Meier</strong> (Pipeline) bis 15.03. versenden</div>';
        html += '<div class="vv-tagesstart-item vv-prio-niedrig"><span class="vv-ts-icon">✅</span> Onboarding <strong>Dr. Anna Fischer</strong>: Depoteröffnung abschließen</div>';
        html += '</div></div></div>';

        // Quick portfolio overview
        html += '<div class="uebersicht-card vv-card"><div class="uebersicht-card-header"><h3>';
        html += '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20"><circle cx="12" cy="12" r="10"/><path d="M12 2a10 10 0 0110 10"/><line x1="12" y1="12" x2="12" y2="2"/><line x1="12" y1="12" x2="22" y2="12"/></svg>';
        html += ' Portfolio-Einzeiler</h3></div><div style="padding:16px;">';
        html += '<div class="vv-einzeiler">';
        html += '<span class="vv-einzeiler-item"><strong>AuM:</strong> 78,0M €</span>';
        html += '<span class="vv-einzeiler-sep">|</span>';
        html += '<span class="vv-einzeiler-item"><strong>Ø Perf. YTD:</strong> +5,6%</span>';
        html += '<span class="vv-einzeiler-sep">|</span>';
        html += '<span class="vv-einzeiler-item"><strong>Outperformance:</strong> +0,7pp vs. Benchmark</span>';
        html += '<span class="vv-einzeiler-sep">|</span>';
        html += '<span class="vv-einzeiler-item"><strong>Pipeline:</strong> 45M € (12 Leads)</span>';
        html += '</div></div></div>';

        el.innerHTML = html;
    }

    // ── MANDATSLISTE TAB ──
    function fillVVMandatsliste() {
        var el = document.getElementById('vv-tab-mandatsliste');
        if (!el) return;
        var mandanten = window.vvMockMandanten || {};
        var names = Object.keys(mandanten);

        var html = '<div class="uebersicht-card vv-card"><div class="uebersicht-card-header"><h3>';
        html += '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg>';
        html += ' Mandantenliste (' + names.length + ' Mandate)</h3></div>';
        html += '<div class="vv-table-wrap"><table class="vv-table"><thead><tr>';
        html += '<th>Mandant</th><th>Segment</th><th>AuM</th><th>Mandat</th><th>Marge</th><th>Perf YTD</th><th>Status</th>';
        html += '</tr></thead><tbody>';

        names.sort(function(a, b) { return (mandanten[b].aum || 0) - (mandanten[a].aum || 0); });

        names.forEach(function(name) {
            var m = mandanten[name];
            html += '<tr class="vv-table-row" onclick="openVVMandantDetail(\'' + name.replace(/'/g, "\\'") + '\')">';
            html += '<td><div class="vv-mandant-cell"><span class="vv-avatar" style="background:' + (m.avatarBg || '#1a365d') + '">' + getInitialsVV(name) + '</span> ' + name + '</div></td>';
            html += '<td>' + (m.segment || '-') + '</td>';
            html += '<td class="vv-num">' + fmtEuroVV(m.aum || 0) + '</td>';
            html += '<td>' + (m.mandatstyp || '-') + '</td>';
            html += '<td class="vv-num">' + ((m.managementFee || 0) * 100).toFixed(2).replace('.', ',') + '%</td>';
            html += '<td class="vv-num ' + (m.performance && m.performance.ytd >= 0 ? 'vv-positive' : 'vv-negative') + '">' + fmtPercent(m.performance ? m.performance.ytd : 0) + '</td>';
            html += '<td>' + getStatusBadge(m.statusIcon) + '</td>';
            html += '</tr>';
        });

        html += '</tbody></table></div></div>';
        el.innerHTML = html;
    }

    // ── PIPELINE TAB ──
    function fillVVPipeline() {
        var el = document.getElementById('vv-tab-pipeline');
        if (!el) return;
        var pipeline = window.vvPipeline || [];

        var stages = {
            lead: { label: 'Lead', count: 0 },
            kennenlerngespraech: { label: 'Kennenlernen', count: 0 },
            beratungsgespraech: { label: 'Beratung', count: 0 },
            analyse_vorschlag: { label: 'Analyse', count: 0 },
            onboarding: { label: 'Onboarding', count: 0 }
        };
        var totalVol = 0;
        pipeline.forEach(function(p) {
            if (stages[p.stadium]) stages[p.stadium].count++;
            totalVol += p.volEst || 0;
        });

        var html = '<div class="uebersicht-card vv-card"><div class="uebersicht-card-header"><h3>';
        html += '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>';
        html += ' Pipeline (Q1 2026)</h3></div><div style="padding:16px;">';

        // Funnel
        html += '<div class="vv-funnel">';
        Object.keys(stages).forEach(function(key) {
            var s = stages[key];
            html += '<div class="vv-funnel-stage"><div class="vv-funnel-count">' + s.count + '</div><div class="vv-funnel-label">' + s.label + '</div></div>';
            if (key !== 'onboarding') html += '<div class="vv-funnel-arrow">→</div>';
        });
        html += '</div>';

        html += '<div class="vv-pipeline-summary">Erwartetes Volumen: <strong>' + fmtEuroVV(totalVol) + '</strong> | Konversionsrate: <strong>8,3%</strong></div>';

        // Table
        html += '<table class="vv-table" style="margin-top:16px;"><thead><tr>';
        html += '<th>Prospect</th><th>Stadium</th><th>Vol. est.</th><th>Nächster Schritt</th>';
        html += '</tr></thead><tbody>';

        var stageOrder = ['onboarding', 'analyse_vorschlag', 'beratungsgespraech', 'kennenlerngespraech', 'lead'];
        pipeline.sort(function(a, b) { return stageOrder.indexOf(a.stadium) - stageOrder.indexOf(b.stadium); });

        pipeline.forEach(function(p) {
            var stageLabel = stages[p.stadium] ? stages[p.stadium].label : p.stadium;
            html += '<tr><td>' + p.name + '</td>';
            html += '<td><span class="vv-stage-badge vv-stage-' + p.stadium + '">' + stageLabel + '</span></td>';
            html += '<td class="vv-num">' + fmtEuroVV(p.volEst) + '</td>';
            html += '<td>' + p.naechsterSchritt + '</td></tr>';
        });

        html += '</tbody></table></div></div>';
        el.innerHTML = html;
    }

    // ── PORTFOLIO OVERVIEW TAB ──
    function fillVVPortfolioOverview() {
        var el = document.getElementById('vv-tab-portfolio');
        if (!el) return;
        var mandanten = window.vvMockMandanten || {};
        var names = Object.keys(mandanten);

        // Aggregate asset allocation
        var totalAuM = 0;
        var aggAlloc = { aktien: 0, renten: 0, alternatives: 0, cash: 0, pe: 0 };
        names.forEach(function(n) {
            var m = mandanten[n];
            var aum = m.aum || 0;
            totalAuM += aum;
            Object.keys(aggAlloc).forEach(function(k) {
                aggAlloc[k] += (m.assetAllocation ? (m.assetAllocation[k] || 0) : 0) * aum / 100;
            });
        });

        var html = '<div class="uebersicht-card vv-card"><div class="uebersicht-card-header"><h3>';
        html += '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20"><circle cx="12" cy="12" r="10"/><path d="M12 2a10 10 0 0110 10"/><line x1="12" y1="12" x2="12" y2="2"/><line x1="12" y1="12" x2="22" y2="12"/></svg>';
        html += ' Aggregierte Asset Allocation (alle Mandate)</h3></div><div style="padding:16px;">';

        html += '<table class="vv-table"><thead><tr><th>Assetklasse</th><th>Volumen</th><th>Anteil</th><th>Visualisierung</th></tr></thead><tbody>';
        var colors = { aktien: '#3182ce', renten: '#38a169', alternatives: '#d69e2e', cash: '#718096', pe: '#805ad5' };
        var labels = { aktien: 'Aktien', renten: 'Renten', alternatives: 'Alternatives', cash: 'Cash', pe: 'Private Equity' };
        Object.keys(aggAlloc).forEach(function(k) {
            var pct = totalAuM > 0 ? (aggAlloc[k] / totalAuM * 100) : 0;
            html += '<tr><td>' + (labels[k] || k) + '</td>';
            html += '<td class="vv-num">' + fmtEuroVV(aggAlloc[k]) + '</td>';
            html += '<td class="vv-num">' + pct.toFixed(1).replace('.', ',') + '%</td>';
            html += '<td><div class="vv-bar-bg"><div class="vv-bar-fill" style="width:' + pct + '%;background:' + (colors[k] || '#3182ce') + '"></div></div></td>';
            html += '</tr>';
        });
        html += '</tbody></table></div></div>';

        // Drift monitoring
        html += '<div class="uebersicht-card vv-card"><div class="uebersicht-card-header"><h3>';
        html += '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>';
        html += ' Drift-Monitoring</h3></div><div style="padding:16px;">';
        html += '<table class="vv-table"><thead><tr><th>Mandant</th><th>Assetklasse</th><th>Ist</th><th>Soll</th><th>Drift</th><th>Status</th></tr></thead><tbody>';

        names.forEach(function(n) {
            var m = mandanten[n];
            if (!m.assetAllocation || !m.sollAllocation) return;
            Object.keys(m.sollAllocation).forEach(function(k) {
                var diff = (m.assetAllocation[k] || 0) - (m.sollAllocation[k] || 0);
                if (Math.abs(diff) >= 2) {
                    html += '<tr><td>' + n + '</td><td>' + (labels[k] || k) + '</td>';
                    html += '<td class="vv-num">' + (m.assetAllocation[k] || 0) + '%</td>';
                    html += '<td class="vv-num">' + (m.sollAllocation[k] || 0) + '%</td>';
                    html += '<td class="vv-num ' + (Math.abs(diff) >= 5 ? 'vv-negative' : 'vv-warning') + '">' + (diff > 0 ? '+' : '') + diff + 'pp</td>';
                    html += '<td>' + (Math.abs(diff) >= 5 ? '<span class="vv-status-badge vv-status-danger">⚠ Überschreitung</span>' : '<span class="vv-status-badge vv-status-warning">⚠ Drift</span>') + '</td>';
                    html += '</tr>';
                }
            });
        });

        html += '</tbody></table></div></div>';
        el.innerHTML = html;
    }

    // ── COMPLIANCE OVERVIEW TAB ──
    function fillVVComplianceOverview() {
        var el = document.getElementById('vv-tab-compliance');
        if (!el) return;
        var mandanten = window.vvMockMandanten || {};
        var names = Object.keys(mandanten);

        var html = '<div class="uebersicht-card vv-card"><div class="uebersicht-card-header"><h3>';
        html += '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>';
        html += ' Compliance-Übersicht</h3></div><div style="padding:16px;">';

        html += '<table class="vv-table"><thead><tr><th>Mandant</th><th>WpHG-Bogen</th><th>Letzte Aktualisierung</th><th>Geeignetheitsber.</th><th>Verlustschwelle</th></tr></thead><tbody>';

        names.forEach(function(n) {
            var m = mandanten[n];
            var wphg = m.wphgBogen || {};
            var gb = m.geeignetheitsbericht || {};
            var vs = m.verlustschwelle || {};

            var wphgStatus = wphg.status === 'vollstaendig' ? '<span class="vv-status-badge vv-status-ok">✓ Vollständig</span>' : '<span class="vv-status-badge vv-status-danger">⚠ Aktualisierung nötig</span>';
            var gbStatus = gb.status === 'erstellt' ? '<span class="vv-status-badge vv-status-ok">✓ Erstellt</span>' : '<span class="vv-status-badge vv-status-warning">⚠ Offen</span>';

            var puffer = m.aum && vs.hoechststand ? (m.aum - vs.hoechststand * (1 - (vs.schwelle || 0.1))) : 0;
            var vsStatus = puffer > m.aum * 0.08 ? '<span class="vv-status-badge vv-status-ok">✓ OK</span>' : '<span class="vv-status-badge vv-status-warning">⚠ ' + fmtEuroVV(Math.max(0, puffer)) + ' Puffer</span>';

            html += '<tr onclick="openVVMandantDetail(\'' + n.replace(/'/g, "\\'") + '\')" style="cursor:pointer;">';
            html += '<td>' + n + '</td>';
            html += '<td>' + wphgStatus + '</td>';
            html += '<td>' + (wphg.letzteAktualisierung || '-') + '</td>';
            html += '<td>' + gbStatus + '</td>';
            html += '<td>' + vsStatus + '</td>';
            html += '</tr>';
        });

        html += '</tbody></table></div></div>';
        el.innerHTML = html;
    }

    // ── REPORTING TAB ──
    function fillVVReporting() {
        var el = document.getElementById('vv-tab-reporting');
        if (!el) return;
        var mandanten = window.vvMockMandanten || {};
        var names = Object.keys(mandanten);

        var html = '<div class="uebersicht-card vv-card"><div class="uebersicht-card-header"><h3>';
        html += '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>';
        html += ' Mandantenreporting</h3></div><div style="padding:16px;">';

        html += '<table class="vv-table"><thead><tr><th>Mandant</th><th>Performance YTD</th><th>vs. Benchmark</th><th>Ex-Ante</th><th>Ex-Post</th><th>Kostenquote</th></tr></thead><tbody>';

        names.forEach(function(n) {
            var m = mandanten[n];
            var perf = m.performance || {};
            var outperf = (perf.ytd || 0) - (perf.benchmark_ytd || 0);
            html += '<tr>';
            html += '<td>' + n + '</td>';
            html += '<td class="vv-num ' + (perf.ytd >= 0 ? 'vv-positive' : 'vv-negative') + '">' + fmtPercent(perf.ytd || 0) + '</td>';
            html += '<td class="vv-num ' + (outperf >= 0 ? 'vv-positive' : 'vv-negative') + '">' + fmtPercent(outperf) + '</td>';
            html += '<td>' + (m.exAnteKosten ? '✓ ' + (m.exAnteKosten.bereitgestellt || '') : '-') + '</td>';
            html += '<td>' + (m.exPostKosten ? '✓ ' + (m.exPostKosten.bereitgestellt || '') : '-') + '</td>';
            html += '<td class="vv-num">' + ((m.exAnteKosten ? m.exAnteKosten.quote * 100 : 0).toFixed(2).replace('.', ',')) + '%</td>';
            html += '</tr>';
        });

        html += '</tbody></table></div></div>';
        el.innerHTML = html;
    }

    // ======================================
    // VV-10: MANDANTEN-DETAIL (Client 360°)
    // ======================================

    function openVVMandantDetail(name) {
        var mandanten = window.vvMockMandanten || {};
        var mandant = mandanten[name];
        if (!mandant) { console.warn('VV Mandant nicht gefunden:', name); return; }

        currentVVMandant = name;

        // Hide overview, show detail
        var overview = document.getElementById('vvOverviewPage');
        if (overview) overview.style.display = 'none';

        var detail = document.getElementById('vvDetailPage');
        if (detail) detail.style.display = 'block';

        // Fill header
        var titleEl = document.getElementById('vvDetailTitle');
        if (titleEl) titleEl.textContent = 'Mandant: ' + name;
        var subtitleEl = document.getElementById('vvDetailSubtitle');
        if (subtitleEl) subtitleEl.textContent = mandant.segment + ' · ' + mandant.mandatstyp;

        // Show first tab
        showVVDetailTab('stammdaten');

        // Dispatch event
        document.dispatchEvent(new CustomEvent('viewChanged', { detail: { module: 'vermoegensverwaltung', view: 'vvDetail', mandant: name } }));
    }

    // ── DETAIL TAB SWITCHING ──
    function showVVDetailTab(tabName) {
        currentVVDetailTab = tabName;

        document.querySelectorAll('.vv-detail-tab-content').forEach(function(c) { c.classList.remove('active'); });
        document.querySelectorAll('.vv-detail-tab-btn').forEach(function(b) { b.classList.remove('active'); });

        var target = document.getElementById('vvd-tab-' + tabName);
        if (target) target.classList.add('active');
        var btn = document.querySelector('.vv-detail-tab-btn[data-tab="' + tabName + '"]');
        if (btn) btn.classList.add('active');

        var mandant = (window.vvMockMandanten || {})[currentVVMandant];
        if (!mandant) return;

        if (tabName === 'stammdaten') fillVVDetailStammdaten(mandant);
        if (tabName === 'portfolio') fillVVDetailPortfolio(mandant);
        if (tabName === 'finanzplanung') fillVVDetailVermoegensbilanz(mandant);
        if (tabName === 'compliance') fillVVDetailCompliance(mandant);
        if (tabName === 'impulse') fillVVDetailPotentiale(mandant);
        if (tabName === 'kommunikation') fillVVDetailKommunikation(mandant);
    }

    // ── CLIENT 360° TAB ──
    function fillVVDetailStammdaten(m) {
        var el = document.getElementById('vvd-tab-stammdaten');
        if (!el) return;

        var name = currentVVMandant;
        var alter = '';
        if (m.geburtsdatum) {
            var parts = m.geburtsdatum.split('-');
            alter = (new Date().getFullYear() - parseInt(parts[0])).toString();
        }

        var gesamtLiquid = (m.aum || 0) + (m.fremdVermoegen || []).reduce(function(s, f) { return s + (f.volumen || 0); }, 0);
        var gesamtImmobilien = (m.immobilien || []).reduce(function(s, i) { return s + (i.wert || 0); }, 0);
        var gesamtUnternehmen = (m.unternehmen || []).reduce(function(s, u) { return s + (u.schaetzwert || 0); }, 0);
        var gesamtPE = (m.peBeteiligungen || []).reduce(function(s, p) { return s + (p.investiert || 0); }, 0);
        var gesamtVermoegen = gesamtLiquid + gesamtImmobilien + gesamtUnternehmen + gesamtPE;
        var betreutPct = gesamtVermoegen > 0 ? ((m.aum || 0) / gesamtVermoegen * 100) : 0;
        var fremdTotal = (m.fremdVermoegen || []).reduce(function(s, f) { return s + (f.volumen || 0); }, 0);

        var html = '<div class="vv-detail-grid">';

        // Personal info
        html += '<div class="uebersicht-card vv-card"><div class="uebersicht-card-header"><h3>';
        html += '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>';
        html += ' Client 360°</h3></div><div style="padding:16px;">';
        html += '<div class="vv-client-header"><span class="vv-avatar vv-avatar-lg" style="background:' + (m.avatarBg || '#1a365d') + '">' + getInitialsVV(name) + '</span>';
        html += '<div class="vv-client-info"><strong>' + name + '</strong>, ' + alter;
        html += '<br>' + (m.adresse || '') + '<br>' + (m.beruf || '') + ' · ' + (m.familienstand || '');
        html += '<br>Lebensphase: ' + (m.lebensphase || '-');
        html += '</div></div>';

        // Mandat
        html += '<div class="vv-info-section"><h4>Mandatsübersicht</h4>';
        html += '<div class="kunden-info-grid">';
        html += '<div class="info-item"><span class="info-label">AuM</span><span class="info-value">' + fmtEuroFull(m.aum || 0) + '</span></div>';
        html += '<div class="info-item"><span class="info-label">Mandat seit</span><span class="info-value">' + (m.mandatSeit || '-') + '</span></div>';
        html += '<div class="info-item"><span class="info-label">Mandatstyp</span><span class="info-value">' + (m.segment || '') + ' ' + (m.mandatstyp || '') + '</span></div>';
        html += '<div class="info-item"><span class="info-label">Risikoprofil</span><span class="info-value">' + (m.risikoprofil || '-') + '</span></div>';
        html += '<div class="info-item"><span class="info-label">ESG-Präferenz</span><span class="info-value">' + (m.esgPraeferenz ? m.esgPraeferenz.sfdr : '-') + (m.esgPraeferenz && m.esgPraeferenz.pai ? ', PAI' : '') + '</span></div>';
        html += '<div class="info-item"><span class="info-label">Benchmark</span><span class="info-value">' + (m.benchmark || '-') + '</span></div>';
        html += '</div></div>';
        html += '</div></div>';

        // Family & Wealth structure
        html += '<div class="uebersicht-card vv-card"><div class="uebersicht-card-header"><h3>';
        html += '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg>';
        html += ' Familien- & Vermögensstruktur</h3></div><div style="padding:16px;">';

        // Family tree
        if (m.kinder && m.kinder.length > 0) {
            html += '<div class="vv-family-tree">';
            html += '<div class="vv-family-node vv-family-root">' + name + (m.familienstand === 'verheiratet' ? ' ─── Ehepartner' : '') + '</div>';
            m.kinder.forEach(function(k) {
                html += '<div class="vv-family-node vv-family-child">├─ ' + k.name + ' (' + k.alter + ')';
                if (k.eigenesMandat) html += ' <span class="vv-status-badge vv-status-ok">' + k.mandatTyp + ' ' + fmtEuroVV(k.aum) + '</span>';
                else html += ' <span class="vv-status-badge vv-status-info">← NextGen-Potenzial</span>';
                html += '</div>';
            });
            html += '</div>';
        }

        // Wealth overview
        html += '<div class="vv-info-section" style="margin-top:16px;"><h4>Vermögensübersicht</h4>';
        html += '<div class="vv-wealth-table">';
        html += '<div class="vv-wealth-row"><span>Liquid (bei uns):</span><strong>' + fmtEuroFull(m.aum || 0) + '</strong></div>';
        if (fremdTotal > 0) {
            html += '<div class="vv-wealth-row"><span>Liquid (Fremd):</span><strong>' + fmtEuroFull(fremdTotal) + '</strong></div>';
            (m.fremdVermoegen || []).forEach(function(f) {
                html += '<div class="vv-wealth-row vv-wealth-sub"><span>' + f.institut + ' (' + f.typ + ')</span><span>' + fmtEuroFull(f.volumen) + '</span></div>';
            });
        }
        if (gesamtImmobilien > 0) html += '<div class="vv-wealth-row"><span>Immobilien:</span><strong>' + fmtEuroFull(gesamtImmobilien) + '</strong></div>';
        if (gesamtUnternehmen > 0) html += '<div class="vv-wealth-row"><span>Unternehmen:</span><strong>~' + fmtEuroFull(gesamtUnternehmen) + '</strong></div>';
        if (gesamtPE > 0) html += '<div class="vv-wealth-row"><span>PE-Beteiligungen:</span><strong>' + fmtEuroFull(gesamtPE) + '</strong></div>';
        html += '<div class="vv-wealth-divider"></div>';
        html += '<div class="vv-wealth-row vv-wealth-total"><span>Gesamtvermögen:</span><strong>~' + fmtEuroFull(gesamtVermoegen) + '</strong></div>';
        html += '<div class="vv-wealth-row"><span>Davon betreut:</span><strong>' + betreutPct.toFixed(1).replace('.', ',') + '% (' + fmtEuroFull(m.aum || 0) + ')</strong></div>';
        if (fremdTotal > 0) html += '<div class="vv-wealth-row vv-wealth-potential"><span>Potenzial:</span><strong>+' + fmtEuroFull(fremdTotal) + ' (Fremdbank)</strong></div>';
        html += '</div></div>';

        html += '</div></div>';
        html += '</div>';
        el.innerHTML = html;
    }

    // ── PORTFOLIO TAB ──
    function fillVVDetailPortfolio(m) {
        var el = document.getElementById('vvd-tab-portfolio');
        if (!el) return;
        var perf = m.performance || {};
        var outperf = (perf.ytd || 0) - (perf.benchmark_ytd || 0);

        var html = '<div class="vv-detail-grid">';

        // Asset Allocation
        html += '<div class="uebersicht-card vv-card"><div class="uebersicht-card-header"><h3>Asset Allocation (Ist vs. Soll)</h3></div><div style="padding:16px;">';
        html += '<table class="vv-table"><thead><tr><th>Klasse</th><th>Ist</th><th>Soll</th><th>Drift</th></tr></thead><tbody>';
        var labels = { aktien: 'Aktien', renten: 'Renten', alternatives: 'Alternatives', cash: 'Cash', pe: 'PE' };
        if (m.sollAllocation) {
            Object.keys(m.sollAllocation).forEach(function(k) {
                var ist = m.assetAllocation ? (m.assetAllocation[k] || 0) : 0;
                var soll = m.sollAllocation[k] || 0;
                var diff = ist - soll;
                var toleranz = k === 'aktien' ? 5 : 3;
                var status = Math.abs(diff) > toleranz ? '⚠' : '✓';
                html += '<tr><td>' + (labels[k] || k) + '</td>';
                html += '<td class="vv-num">' + ist + '%</td>';
                html += '<td class="vv-num">' + soll + '%</td>';
                html += '<td class="vv-num ' + (Math.abs(diff) > toleranz ? 'vv-negative' : '') + '">' + (diff > 0 ? '+' : '') + diff + 'pp ' + status + '</td>';
                html += '</tr>';
            });
        }
        html += '</tbody></table>';

        // Rebalancing recommendation
        if (m.assetAllocation && m.sollAllocation) {
            var aktienDiff = (m.assetAllocation.aktien || 0) - (m.sollAllocation.aktien || 0);
            if (Math.abs(aktienDiff) >= 2) {
                var umschichtung = Math.abs(aktienDiff) / 100 * (m.aum || 0);
                html += '<div class="vv-rebalancing-hint">';
                html += '<strong>Rebalancing-Empfehlung:</strong><br>';
                html += '• Aktienquote um ' + Math.abs(aktienDiff) + 'pp ' + (aktienDiff > 0 ? 'reduzieren' : 'erhöhen') + ' → ' + fmtEuroVV(umschichtung) + ' umschichten<br>';
                html += '<button class="vv-btn vv-btn-primary" style="margin-top:8px;">Rebalancing starten</button> ';
                html += '<button class="vv-btn vv-btn-secondary">Pre-Trade-Check</button>';
                html += '</div>';
            }
        }
        html += '</div></div>';

        // Performance
        html += '<div class="uebersicht-card vv-card"><div class="uebersicht-card-header"><h3>Performance</h3></div><div style="padding:16px;">';
        html += '<div class="vv-perf-grid">';
        html += '<div class="vv-perf-item"><span class="vv-perf-label">Portfolio</span><span class="vv-perf-value ' + (perf.ytd >= 0 ? 'vv-positive' : 'vv-negative') + '">' + fmtPercent(perf.ytd || 0) + '</span></div>';
        html += '<div class="vv-perf-item"><span class="vv-perf-label">Benchmark</span><span class="vv-perf-value">' + fmtPercent(perf.benchmark_ytd || 0) + '</span></div>';
        html += '<div class="vv-perf-item"><span class="vv-perf-label">Outperformance</span><span class="vv-perf-value ' + (outperf >= 0 ? 'vv-positive' : 'vv-negative') + '">' + fmtPercent(outperf) + '</span></div>';
        html += '<div class="vv-perf-item"><span class="vv-perf-label">Volatilität</span><span class="vv-perf-value">' + (perf.volatilitaet || 0).toFixed(1) + '%</span></div>';
        html += '<div class="vv-perf-item"><span class="vv-perf-label">Max Drawdown</span><span class="vv-perf-value vv-negative">' + (perf.maxDrawdown || 0).toFixed(1) + '%</span></div>';
        html += '<div class="vv-perf-item"><span class="vv-perf-label">Sharpe Ratio</span><span class="vv-perf-value">' + (perf.sharpe || 0).toFixed(2) + '</span></div>';
        html += '</div></div></div>';

        html += '</div>';
        el.innerHTML = html;
    }

    // ── VERMÖGENSBILANZ TAB ──
    function fillVVDetailVermoegensbilanz(m) {
        var el = document.getElementById('vvd-tab-finanzplanung');
        if (!el) return;

        var fremdTotal = (m.fremdVermoegen || []).reduce(function(s, f) { return s + (f.volumen || 0); }, 0);
        var gesamtLiquid = (m.aum || 0) + fremdTotal;
        var gesamtImmobilien = (m.immobilien || []).reduce(function(s, i) { return s + (i.wert || 0); }, 0);
        var gesamtUnternehmen = (m.unternehmen || []).reduce(function(s, u) { return s + (u.schaetzwert || 0); }, 0);
        var gesamtPE = (m.peBeteiligungen || []).reduce(function(s, p) { return s + (p.investiert || 0); }, 0);
        var gesamtVermoegen = gesamtLiquid + gesamtImmobilien + gesamtUnternehmen + gesamtPE;
        var anteilBeiUns = gesamtLiquid > 0 ? ((m.aum || 0) / gesamtLiquid * 100) : 0;

        var html = '<div class="uebersicht-card vv-card"><div class="uebersicht-card-header"><h3>';
        html += '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v16"/></svg>';
        html += ' Vermögensbilanz: ' + currentVVMandant + '</h3></div><div style="padding:16px;">';

        // Liquid
        html += '<div class="vv-bilanz-section"><h4>Liquides Vermögen</h4>';
        html += '<div class="vv-wealth-table">';
        html += '<div class="vv-wealth-row vv-wealth-highlight"><span>Bei uns (HRK LUNIS):</span><strong>' + fmtEuroFull(m.aum || 0) + '</strong></div>';
        if (m.fremdVermoegen && m.fremdVermoegen.length > 0) {
            html += '<div class="vv-wealth-row"><span>Fremdbanken (bekannt):</span><strong>' + fmtEuroFull(fremdTotal) + '</strong></div>';
            m.fremdVermoegen.forEach(function(f) {
                html += '<div class="vv-wealth-row vv-wealth-sub"><span>' + f.institut + ' (' + f.typ + ')</span><span>' + fmtEuroFull(f.volumen) + '</span></div>';
            });
        }
        html += '<div class="vv-wealth-divider"></div>';
        html += '<div class="vv-wealth-row"><span>Gesamt liquid:</span><strong>' + fmtEuroFull(gesamtLiquid) + '</strong></div>';
        html += '<div class="vv-wealth-row"><span>Anteil bei uns:</span><strong>' + anteilBeiUns.toFixed(1).replace('.', ',') + '%</strong></div>';
        html += '</div></div>';

        // Illiquid
        html += '<div class="vv-bilanz-section"><h4>Illiquides Vermögen</h4>';
        html += '<div class="vv-wealth-table">';
        if (m.immobilien && m.immobilien.length > 0) {
            html += '<div class="vv-wealth-row"><span>Immobilien:</span><strong>' + fmtEuroFull(gesamtImmobilien) + '</strong></div>';
            m.immobilien.forEach(function(i) {
                html += '<div class="vv-wealth-row vv-wealth-sub"><span>' + i.bezeichnung + ' (' + i.typ + ')</span><span>' + fmtEuroFull(i.wert) + '</span></div>';
            });
        }
        if (m.unternehmen && m.unternehmen.length > 0) {
            m.unternehmen.forEach(function(u) {
                html += '<div class="vv-wealth-row"><span>Unternehmen: ' + u.name + ' (' + u.anteil + '%)</span><strong>~' + fmtEuroFull(u.schaetzwert) + '</strong></div>';
            });
        }
        if (m.peBeteiligungen && m.peBeteiligungen.length > 0) {
            html += '<div class="vv-wealth-row"><span>PE-Beteiligungen:</span><strong>' + fmtEuroFull(gesamtPE) + '</strong></div>';
            m.peBeteiligungen.forEach(function(p) {
                html += '<div class="vv-wealth-row vv-wealth-sub"><span>' + p.fonds + ' (Jg. ' + p.jahrgang + ')</span><span>' + fmtEuroFull(p.investiert) + '</span></div>';
            });
        }
        html += '</div></div>';

        // Total
        html += '<div class="vv-bilanz-total">';
        html += '<div class="vv-wealth-row vv-wealth-total"><span>Gesamtvermögen:</span><strong>~' + fmtEuroFull(gesamtVermoegen) + '</strong></div>';
        html += '<div class="vv-wealth-row"><span>Von uns betreut:</span><strong>' + (gesamtVermoegen > 0 ? ((m.aum || 0) / gesamtVermoegen * 100).toFixed(1).replace('.', ',') : '0') + '%</strong></div>';
        if (fremdTotal > 0) {
            html += '<div class="vv-wealth-row vv-wealth-potential"><span>Cross-Selling-Potenzial:</span><strong>+' + fmtEuroFull(fremdTotal) + ' (Fremdbank)</strong></div>';
        }
        html += '</div>';

        html += '</div></div>';
        el.innerHTML = html;
    }

    // ── COMPLIANCE TAB (Detail) ──
    function fillVVDetailCompliance(m) {
        var el = document.getElementById('vvd-tab-compliance');
        if (!el) return;

        var wphg = m.wphgBogen || {};
        var gb = m.geeignetheitsbericht || {};
        var vs = m.verlustschwelle || {};
        var trigger = vs.hoechststand ? vs.hoechststand * (1 - (vs.schwelle || 0.1)) : 0;
        var puffer = (m.aum || 0) - trigger;
        var currentPct = vs.hoechststand ? ((vs.hoechststand - (m.aum || 0)) / vs.hoechststand * 100) : 0;

        var html = '<div class="vv-detail-grid">';

        // WpHG-Bogen
        html += '<div class="uebersicht-card vv-card"><div class="uebersicht-card-header"><h3>WpHG-Bogen</h3></div><div style="padding:16px;">';
        html += '<div class="kunden-info-grid">';
        html += '<div class="info-item"><span class="info-label">Status</span><span class="info-value">' + (wphg.status === 'vollstaendig' ? '✓ Vollständig' : '⚠ Aktualisierung nötig') + '</span></div>';
        html += '<div class="info-item"><span class="info-label">Letzte Aktualisierung</span><span class="info-value">' + (wphg.letzteAktualisierung || '-') + '</span></div>';
        html += '<div class="info-item"><span class="info-label">Nächste Fälligkeit</span><span class="info-value">' + (wphg.naechsteFaelligkeit || '-') + '</span></div>';
        html += '<div class="info-item"><span class="info-label">ESG-Präferenzen</span><span class="info-value">' + (m.esgPraeferenz ? m.esgPraeferenz.sfdr : '-') + '</span></div>';
        html += '</div>';
        html += '<button class="vv-btn vv-btn-secondary" style="margin-top:8px;">WpHG-Bogen öffnen</button> ';
        html += '<button class="vv-btn vv-btn-primary">Aktualisierung anstoßen</button>';
        html += '</div></div>';

        // Geeignetheitsprüfung
        html += '<div class="uebersicht-card vv-card"><div class="uebersicht-card-header"><h3>Geeignetheitsprüfung</h3></div><div style="padding:16px;">';
        html += '<div class="kunden-info-grid">';
        html += '<div class="info-item"><span class="info-label">Letzter Bericht</span><span class="info-value">' + (gb.letzter || '-') + '</span></div>';
        html += '<div class="info-item"><span class="info-label">Nächster fällig</span><span class="info-value">' + (gb.naechsterFaellig || '-') + '</span></div>';
        html += '<div class="info-item"><span class="info-label">Status</span><span class="info-value">' + (gb.status === 'erstellt' ? '✓ Erstellt' : '⚠ Offen') + '</span></div>';
        html += '</div>';
        html += '<button class="vv-btn vv-btn-primary" style="margin-top:8px;">Bericht generieren</button>';
        html += '</div></div>';

        // Verlustschwelle
        html += '<div class="uebersicht-card vv-card"><div class="uebersicht-card-header"><h3>Verlustschwelle (Art. 62 DelVO)</h3></div><div style="padding:16px;">';
        html += '<div class="kunden-info-grid">';
        html += '<div class="info-item"><span class="info-label">Schwelle</span><span class="info-value">-' + ((vs.schwelle || 0.1) * 100) + '% vom Höchststand</span></div>';
        html += '<div class="info-item"><span class="info-label">Höchststand</span><span class="info-value">' + fmtEuroFull(vs.hoechststand || 0) + ' (am ' + (vs.hoechststandDatum || '-') + ')</span></div>';
        html += '<div class="info-item"><span class="info-label">Aktueller Stand</span><span class="info-value">' + fmtEuroFull(m.aum || 0) + ' (-' + currentPct.toFixed(1) + '%)</span></div>';
        html += '<div class="info-item"><span class="info-label">Trigger bei</span><span class="info-value">' + fmtEuroFull(trigger) + ' (noch ' + fmtEuroVV(Math.max(0, puffer)) + ' Puffer)</span></div>';
        html += '</div>';
        html += '<div class="vv-status-badge ' + (puffer > (m.aum || 0) * 0.08 ? 'vv-status-ok' : 'vv-status-warning') + '" style="margin-top:8px;">' + (puffer > (m.aum || 0) * 0.08 ? '✓ Kein Handlungsbedarf' : '⚠ Puffer beachten') + '</div>';
        html += '</div></div>';

        // Kosteninformation
        html += '<div class="uebersicht-card vv-card"><div class="uebersicht-card-header"><h3>Kosteninformation</h3></div><div style="padding:16px;">';
        html += '<div class="kunden-info-grid">';
        if (m.exAnteKosten) {
            html += '<div class="info-item"><span class="info-label">Ex-Ante (aktuelles Jahr)</span><span class="info-value">Bereitgestellt ' + m.exAnteKosten.bereitgestellt + '</span></div>';
        }
        if (m.exPostKosten) {
            html += '<div class="info-item"><span class="info-label">Ex-Post (Vorjahr)</span><span class="info-value">Bereitgestellt ' + m.exPostKosten.bereitgestellt + '</span></div>';
            html += '<div class="info-item"><span class="info-label">Gesamtkosten 2025</span><span class="info-value">' + fmtEuroFull(m.exPostKosten.gesamtkosten) + ' (' + (m.exPostKosten.quote * 100).toFixed(2) + '% vom Ø AuM)</span></div>';
        }
        html += '</div>';
        html += '<button class="vv-btn vv-btn-secondary" style="margin-top:8px;">Ex-Ante ansehen</button> ';
        html += '<button class="vv-btn vv-btn-secondary">Ex-Post ansehen</button>';
        html += '</div></div>';

        html += '</div>';
        el.innerHTML = html;
    }

    // ── POTENTIALE TAB (Detail) ──
    function fillVVDetailPotentiale(m) {
        var el = document.getElementById('vvd-tab-impulse');
        if (!el) return;

        // Get impulses from mode config
        var impulse = typeof evaluateImpulse === 'function' ? evaluateImpulse(m) : [];

        // Get potentiale for this mandant
        var potentiale = (window.vvPotentiale || []).filter(function(p) { return p.kundenName === currentVVMandant; });

        var html = '';

        // Impulse section
        if (impulse.length > 0) {
            html += '<div class="uebersicht-card vv-card"><div class="uebersicht-card-header"><h3>';
            html += '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>';
            html += ' KI-Vertriebsassistent – Anpassungsbedarfe</h3></div><div style="padding:16px;">';
            impulse.forEach(function(imp) {
                var prioClass = 'vv-prio-' + imp.prioritaet;
                html += '<div class="vv-impulse-card ' + prioClass + '">';
                html += '<div class="vv-impulse-header"><span class="vv-impulse-prio">' + imp.prioritaet.toUpperCase() + '</span> ' + imp.impuls + '</div>';
                if (imp.produkt) html += '<div class="vv-impulse-produkt">Produkt: ' + imp.produkt + '</div>';
                html += '</div>';
            });
            html += '</div></div>';
        }

        // Potentiale (Whitespots)
        if (potentiale.length > 0) {
            html += '<div class="uebersicht-card vv-card"><div class="uebersicht-card-header"><h3>';
            html += '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>';
            html += ' Whitespots – Neugeschäftspotentiale</h3></div><div style="padding:16px;">';

            potentiale.forEach(function(p) {
                html += '<div class="vv-potential-card">';
                html += '<div class="vv-potential-header">';
                html += '<span class="vv-impulse-prio">' + p.prioritaet.toUpperCase() + '</span> ';
                html += '<strong>' + p.produkt + '</strong>';
                html += '<span class="vv-potential-vol">' + fmtEuroVV(p.volumen) + '</span>';
                html += '</div>';
                html += '<div class="vv-potential-desc">' + p.beschreibung + '</div>';
                html += '<div class="vv-potential-status">Status: <span class="vv-stage-badge">' + p.status + '</span> · Letzte Aktion: ' + p.letzteAktion + '</div>';
                html += '</div>';
            });

            html += '</div></div>';
        }

        if (!impulse.length && !potentiale.length) {
            html = '<div class="uebersicht-card vv-card"><div style="padding:32px;text-align:center;color:#64748b;">Keine Potentiale oder Anpassungsbedarfe identifiziert.</div></div>';
        }

        el.innerHTML = html;
    }

    // ── KOMMUNIKATION TAB (Detail) ──
    function fillVVDetailKommunikation(m) {
        var el = document.getElementById('vvd-tab-kommunikation');
        if (!el) return;

        var komm = m.kommunikation || [];
        var html = '<div class="uebersicht-card vv-card"><div class="uebersicht-card-header"><h3>';
        html += '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>';
        html += ' Kommunikationshistorie</h3></div><div style="padding:16px;">';

        if (komm.length === 0) {
            html += '<div style="text-align:center;color:#64748b;padding:16px;">Keine Einträge vorhanden.</div>';
        } else {
            var typIcons = { meeting: '📅', email: '📧', anruf: '📞', chat: '💬' };
            komm.sort(function(a, b) { return b.datum.localeCompare(a.datum); });
            komm.forEach(function(k) {
                html += '<div class="vv-komm-item">';
                html += '<span class="vv-komm-icon">' + (typIcons[k.typ] || '📄') + '</span>';
                html += '<div class="vv-komm-content"><strong>' + k.betreff + '</strong>';
                html += '<div class="vv-komm-meta">' + k.datum + ' · ' + k.typ + '</div>';
                if (k.notiz) html += '<div class="vv-komm-notiz">' + k.notiz + '</div>';
                html += '</div></div>';
            });
        }

        html += '</div></div>';
        el.innerHTML = html;
    }

    // ── BACK NAVIGATION ──
    function backFromVVDetail() {
        var detail = document.getElementById('vvDetailPage');
        if (detail) detail.style.display = 'none';
        showVVOverview();
    }

    function backFromVVOverview() {
        var vvPage = document.getElementById('vvOverviewPage');
        if (vvPage) vvPage.style.display = 'none';
        if (typeof backToLanding === 'function') {
            backToLanding();
        } else {
            var landing = document.getElementById('landingPage');
            if (landing) landing.style.display = 'flex';
        }
    }

    // ── WINDOW EXPORTS ──
    window.showVVOverview = showVVOverview;
    window.showVVTab = showVVTab;
    window.openVVMandantDetail = openVVMandantDetail;
    window.showVVDetailTab = showVVDetailTab;
    window.backFromVVDetail = backFromVVDetail;
    window.backFromVVOverview = backFromVVOverview;

})();
