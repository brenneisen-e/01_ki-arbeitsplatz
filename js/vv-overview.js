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
        try {
            // Hide all other pages
            ['landingPage', 'mainApp', 'agenturOverview', 'beraterOverviewPage',
             'kundenDetailPage', 'kundenDetailBankPage', 'billingCheckPage',
             'potentialAnalysePage', 'bgavUmstellungPage', 'vvDetailPage'].forEach(function(id) {
                var el = document.getElementById(id);
                if (el) el.style.display = 'none';
            });

            // Show VV module container + overview page
            var vvModule = document.getElementById('vermoegensverwaltungModule');
            if (vvModule) { vvModule.style.display = 'block'; vvModule.classList.add('active'); }
            var vvPage = document.getElementById('vvOverviewPage');
            if (vvPage) vvPage.style.display = 'block';

            // Set mode
            if (typeof setMode === 'function') setMode('vermoegensverwaltung');

            // OPT-24: Globale Header-Controls nach VV-02 verschieben
            if (typeof moveGlobalControls === 'function') moveGlobalControls('vv02ControlsSlot');

            // Fill data
            fillVVHeader();
            fillVVKPIs();
            showVVTab('uebersicht');

            // Dispatch event
            document.dispatchEvent(new CustomEvent('viewChanged', { detail: { module: 'vermoegensverwaltung', view: 'vvOverview' } }));

            if (window.AppRouter) AppRouter.navigate('/vv-overview');
        } catch (e) {
            console.error('VV Overview Fehler:', e);
        }
    }

    // ── FILL HEADER (OPT-24: same structure as A-02) ──
    function fillVVHeader() {
        var data = window.vvBeraterData;
        if (!data) return;
        var title = document.getElementById('vvPageTitle');
        if (title) title.textContent = 'Berater: ' + data.name;
        var sub = document.getElementById('vvSubtitle');
        if (sub) sub.textContent = data.titel + ' · ' + data.standort + ' · seit ' + data.seit;

        // Photo (re-use A-02 pattern)
        var photoImg = document.getElementById('vvPhotoImgSmall');
        if (photoImg && data.photo) {
            photoImg.src = data.photo;
            photoImg.style.display = 'block';
            var placeholder = document.querySelector('#vvPhotoSmall .agentur-photo-placeholder-small');
            if (placeholder) placeholder.style.display = 'none';
        }
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
        try {
            var mandanten = window.vvMockMandanten || {};
            var mandant = mandanten[name];
            if (!mandant) { console.warn('VV Mandant nicht gefunden:', name); return; }

            currentVVMandant = name;

            // Hide overview, show detail
            var overview = document.getElementById('vvOverviewPage');
            if (overview) overview.style.display = 'none';

            var detail = document.getElementById('vvDetailPage');
            if (detail) detail.style.display = 'block';

            // OPT-24: Globale Header-Controls nach VV-10 verschieben
            if (typeof moveGlobalControls === 'function') moveGlobalControls('vv10ControlsSlot');

            // Fill header (OPT-24: Berater info + Mandant line)
            var beraterTitle = document.getElementById('vvDetailBeraterTitle');
            var vvData = window.vvBeraterData;
            if (beraterTitle && vvData) beraterTitle.textContent = 'Berater: ' + vvData.name;

            var titleEl = document.getElementById('vvDetailTitle');
            if (titleEl) titleEl.textContent = name;
            var subtitleEl = document.getElementById('vvDetailSubtitle');
            if (subtitleEl) subtitleEl.textContent = (mandant.segment || '') + ' · ' + (mandant.mandatstyp || '');

            // Show first tab
            showVVDetailTab('stammdaten');

            // Dispatch event
            document.dispatchEvent(new CustomEvent('viewChanged', { detail: { module: 'vermoegensverwaltung', view: 'vvDetail', mandant: name } }));
        } catch (e) {
            console.error('VV Detail Fehler:', e);
        }
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

        // Cross-module links (23-E)
        var crossRef = window.kundenCrossRef ? window.kundenCrossRef[name] : null;
        if (crossRef) {
            html += '<div class="vv-info-section"><h4>Cross-Modul-Referenzen</h4>';
            html += '<div class="kunden-info-grid">';
            if (crossRef.bankId) {
                html += '<div class="info-item"><span class="info-label">Banking</span><span class="info-value">' + (crossRef.bankName || name) + ' (' + crossRef.bankId + ')';
                html += ' <button class="vv-btn vv-btn-secondary" style="font-size:11px;padding:2px 8px;margin-left:8px;" onclick="if(typeof switchModule===\'function\'){switchModule(\'banken\');}">Banking oeffnen</button>';
                html += '</span></div>';
            }
            if (crossRef.versId) {
                html += '<div class="info-item"><span class="info-label">Versicherung</span><span class="info-value">' + crossRef.versId;
                html += ' <button class="vv-btn vv-btn-secondary" style="font-size:11px;padding:2px 8px;margin-left:8px;" onclick="if(typeof openAgenturView===\'function\'){openAgenturView();}">Versicherung oeffnen</button>';
                html += '</span></div>';
            }
            html += '</div></div>';
        }

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
        showVVOverview(); // showVVOverview already moves controls to vv02ControlsSlot
    }

    function backFromVVOverview() {
        // Redirect to React M-01
        window.location.href = '/';
        return;
    }

    // ══════════════════════════════════════════════════
    // 22-A: VV KI-CHAT (Mock, Keyword-basiert)
    // ══════════════════════════════════════════════════

    function toggleVVChat() {
        var widget = document.getElementById('vvChatWidget');
        var toggle = document.getElementById('vvChatToggle');
        if (!widget || !toggle) return;

        if (widget.style.display === 'none' || widget.style.display === '') {
            widget.style.display = 'flex';
            toggle.style.display = 'none';
        } else {
            widget.style.display = 'none';
            toggle.style.display = 'flex';
        }
    }

    function sendVVChat() {
        var input = document.getElementById('vvChatInput');
        var chatBody = document.getElementById('vvChatBody');
        if (!input || !chatBody) return;
        var question = input.value.trim();
        if (!question) return;

        // Hide welcome
        var welcome = chatBody.querySelector('.vv-chat-welcome');
        if (welcome) welcome.style.display = 'none';

        // Add user message
        chatBody.innerHTML += '<div class="vv-chat-msg vv-chat-user"><div class="vv-chat-msg-content">' + question + '</div></div>';
        input.value = '';

        // Simulate typing delay
        setTimeout(function() {
            var response = getVVChatResponse(question);
            chatBody.innerHTML += '<div class="vv-chat-msg vv-chat-ai"><div class="vv-chat-msg-content">' + response + '</div></div>';
            chatBody.scrollTop = chatBody.scrollHeight;
        }, 600);
    }

    function askVVQuestion(question) {
        var input = document.getElementById('vvChatInput');
        if (input) input.value = question;
        sendVVChat();
    }

    function getVVChatResponse(question) {
        var q = question.toLowerCase();
        var mandant = currentVVMandant ? (window.vvMockMandanten || {})[currentVVMandant] : null;
        var mandanten = window.vvMockMandanten || {};

        // Quick-action follow-ups
        var followUp = '<div class="vv-chat-followups">' +
            '<button class="vv-chat-quick-btn" onclick="askVVQuestion(\'Rebalancing-Bedarf pruefen\')">Rebalancing?</button>' +
            '<button class="vv-chat-quick-btn" onclick="askVVQuestion(\'Compliance-Status Mandant\')">Compliance?</button>' +
            '<button class="vv-chat-quick-btn" onclick="askVVQuestion(\'Pipeline-Status\')">Pipeline?</button>' +
            '</div>';

        // Portfolio / Performance / Rendite
        if (q.match(/portfolio|performance|rendite/)) {
            if (mandant) {
                var perf = mandant.performance || {};
                var outperf = (perf.ytd || 0) - (perf.benchmark_ytd || 0);
                return '<strong>Portfolio-Analyse: ' + currentVVMandant + '</strong><br><br>' +
                    'AuM: <strong>' + fmtEuroFull(mandant.aum || 0) + '</strong><br>' +
                    'Performance YTD: <strong>' + fmtPercent(perf.ytd || 0) + '</strong><br>' +
                    'Benchmark: ' + fmtPercent(perf.benchmark_ytd || 0) + '<br>' +
                    'Outperformance: <strong>' + fmtPercent(outperf) + '</strong><br>' +
                    'Sharpe Ratio: ' + (perf.sharpe || 0).toFixed(2) + '<br>' +
                    'Volatilitaet: ' + (perf.volatilitaet || 0).toFixed(1) + '%<br><br>' +
                    'Benchmark: ' + (mandant.benchmark || '-') + followUp;
            }
            // Aggregate
            var names = Object.keys(mandanten);
            var totalAuM = 0, avgPerf = 0;
            names.forEach(function(n) { totalAuM += mandanten[n].aum || 0; avgPerf += (mandanten[n].performance ? mandanten[n].performance.ytd : 0); });
            avgPerf = names.length > 0 ? avgPerf / names.length : 0;
            return '<strong>Portfolio-Uebersicht (alle Mandate):</strong><br><br>' +
                'Gesamtes AuM: <strong>' + fmtEuroVV(totalAuM) + '</strong><br>' +
                'Mandate: ' + names.length + '<br>' +
                'Durchschnittl. Performance YTD: <strong>' + fmtPercent(avgPerf) + '</strong><br><br>' +
                'Top-Performer: Winterberg GmbH (+6,7%), Dr. von Trott (+8,2%)<br>' +
                'Underperformer: Prof. Hartmann (+2,8%), Keller NextGen (+4,2%)' + followUp;
        }

        // Rebalancing / Drift / Umschichten
        if (q.match(/rebalancing|drift|umschicht/)) {
            var drifts = [];
            Object.keys(mandanten).forEach(function(n) {
                var m = mandanten[n];
                if (m.assetAllocation && m.sollAllocation) {
                    Object.keys(m.sollAllocation).forEach(function(k) {
                        var diff = (m.assetAllocation[k] || 0) - (m.sollAllocation[k] || 0);
                        if (Math.abs(diff) >= 2) {
                            drifts.push({ name: n, klasse: k, diff: diff, vol: Math.abs(diff) / 100 * (m.aum || 0) });
                        }
                    });
                }
            });
            if (drifts.length === 0) {
                return '<strong>Rebalancing-Analyse:</strong><br><br>Alle Mandate innerhalb der Toleranz. Kein Rebalancing-Bedarf erkannt.' + followUp;
            }
            var html = '<strong>Rebalancing-Bedarf erkannt (' + drifts.length + ' Abweichungen):</strong><br><br>';
            drifts.forEach(function(d) {
                html += '<strong>' + d.name + '</strong>: ' + d.klasse + ' ' + (d.diff > 0 ? '+' : '') + d.diff + 'pp → ' + fmtEuroVV(d.vol) + ' umschichten<br>';
            });
            html += '<br>Empfehlung: Aktien-Quote bei Ueberschreitung reduzieren, Renten aufstocken.' + followUp;
            return html;
        }

        // Compliance / WpHG / Geeignetheit
        if (q.match(/compliance|wphg|geeignet/)) {
            var issues = [];
            Object.keys(mandanten).forEach(function(n) {
                var m = mandanten[n];
                if (m.wphgBogen && m.wphgBogen.status !== 'vollstaendig') {
                    issues.push(n + ': WpHG-Bogen aktualisierungsbeduerftig');
                }
                if (m.geeignetheitsbericht && m.geeignetheitsbericht.status === 'offen') {
                    issues.push(n + ': Geeignetheitsbericht offen (faellig ' + m.geeignetheitsbericht.naechsterFaellig + ')');
                }
            });
            if (mandant) {
                var wphg = mandant.wphgBogen || {};
                var gb = mandant.geeignetheitsbericht || {};
                return '<strong>Compliance-Status: ' + currentVVMandant + '</strong><br><br>' +
                    'WpHG-Bogen: ' + (wphg.status === 'vollstaendig' ? 'Vollstaendig' : 'Aktualisierung noetig') + '<br>' +
                    'Letzte Aktualisierung: ' + (wphg.letzteAktualisierung || '-') + '<br>' +
                    'Geeignetheitsbericht: ' + (gb.status === 'erstellt' ? 'Erstellt' : 'Offen') + '<br>' +
                    'Naechster faellig: ' + (gb.naechsterFaellig || '-') + '<br>' +
                    'ESG: ' + (mandant.esgPraeferenz ? mandant.esgPraeferenz.sfdr : '-') + followUp;
            }
            return '<strong>Compliance-Uebersicht:</strong><br><br>' +
                (issues.length > 0 ? issues.join('<br>') : 'Alle Compliance-Items aktuell.') +
                '<br><br>Offene Items: <strong>' + issues.length + '</strong>' + followUp;
        }

        // Markt / Zinsen / Konjunktur
        if (q.match(/markt|zinsen|konjunktur|umfeld/)) {
            return '<strong>Marktumfeld-Zusammenfassung (Q1 2026):</strong><br><br>' +
                '<strong>Aktien:</strong> MSCI World +5,2% YTD. US-Markt fuehrend, Europa holt auf.<br>' +
                '<strong>Renten:</strong> Euro-Staatsanleihen 10J bei 2,8%. EZB-Leitzins 3,25%.<br>' +
                '<strong>Alternatives:</strong> PE-Markt stabil, Infra-Fonds nachgefragt.<br>' +
                '<strong>ESG:</strong> Art. 8/9 Fonds mit Zuflüssen, Taxonomie-Reporting verschaerft.<br><br>' +
                'Empfehlung: Leichte Uebergewichtung Euro-Renten, Aktien-Engagement beibehalten.' + followUp;
        }

        // Mandant / Client / Kunde
        if (q.match(/mandant|client|kunde/) && mandant) {
            return '<strong>Mandanten-Schnelluebersicht: ' + currentVVMandant + '</strong><br><br>' +
                'Segment: ' + (mandant.segment || '-') + '<br>' +
                'Mandatstyp: ' + (mandant.mandatstyp || '-') + '<br>' +
                'AuM: <strong>' + fmtEuroFull(mandant.aum || 0) + '</strong><br>' +
                'Mandat seit: ' + (mandant.mandatSeit || '-') + '<br>' +
                'Risikoprofil: ' + (mandant.risikoprofil || '-') + '<br>' +
                'NPS: ' + (mandant.nps ? mandant.nps.score : '-') + '/10<br>' +
                'Status: ' + (mandant.statusIcon || 'ok') + followUp;
        }

        // Pipeline / Prospect / Akquise
        if (q.match(/pipeline|prospect|akquise/)) {
            var pipeline = window.vvPipeline || [];
            var totalVol = 0;
            pipeline.forEach(function(p) { totalVol += p.volEst || 0; });
            var html = '<strong>Pipeline-Status (Q1 2026):</strong><br><br>' +
                'Gesamt: <strong>' + pipeline.length + ' Prospects</strong><br>' +
                'Erwartetes Volumen: <strong>' + fmtEuroVV(totalVol) + '</strong><br><br>';
            html += '<strong>Naechste Schritte:</strong><br>';
            pipeline.slice(0, 5).forEach(function(p) {
                html += '- ' + p.name + ': ' + p.naechsterSchritt + ' (' + p.datum + ')<br>';
            });
            return html + followUp;
        }

        // Fallback
        return '<strong>KI-Vertriebsassistent</strong><br><br>' +
            'Ich kann Ihnen bei folgenden Themen helfen:<br><br>' +
            '- <strong>Portfolio-Performance</strong> analysieren<br>' +
            '- <strong>Rebalancing-Bedarf</strong> pruefen<br>' +
            '- <strong>Compliance-Status</strong> abfragen<br>' +
            '- <strong>Marktumfeld</strong> zusammenfassen<br>' +
            '- <strong>Pipeline</strong> und Prospects anzeigen<br>' +
            '- <strong>Mandanten</strong>-Details abrufen<br><br>' +
            'Bitte formulieren Sie Ihre Frage mit einem der genannten Stichworte.' + followUp;
    }

    function showVVChatToggle() {
        var toggle = document.getElementById('vvChatToggle');
        if (toggle) toggle.style.display = 'flex';
    }

    function hideVVChat() {
        var widget = document.getElementById('vvChatWidget');
        var toggle = document.getElementById('vvChatToggle');
        if (widget) widget.style.display = 'none';
        if (toggle) toggle.style.display = 'none';
    }

    // ══════════════════════════════════════════════════
    // 22-C: VV PDF-EXPORT MANDANTENANALYSE
    // ══════════════════════════════════════════════════

    function exportVVMandantenPDF() {
        var name = currentVVMandant;
        var mandant = name ? (window.vvMockMandanten || {})[name] : null;
        if (!mandant) { alert('Bitte zuerst einen Mandanten auswaehlen.'); return; }

        try {
            /* jshint newcap: false */
            var doc = new window.jspdf.jsPDF('p', 'mm', 'a4');
            var y = 15;
            var lm = 15; // left margin
            var pw = 180; // page width usable
            var berater = window.vvBeraterData || {};
            var today = new Date().toLocaleDateString('de-DE');

            // Header
            doc.setFillColor(26, 54, 93); // vv-primary
            doc.rect(0, 0, 210, 28, 'F');
            doc.setFillColor(196, 163, 90); // vv-accent
            doc.rect(lm, 7, 40, 14, 'F');
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(11);
            doc.setTextColor(26, 54, 93);
            doc.text('HRK LUNIS', lm + 4, 16);
            doc.setTextColor(255, 255, 255);
            doc.setFontSize(14);
            doc.text('Mandantenanalyse', 65, 13);
            doc.setFontSize(10);
            doc.setFont('helvetica', 'normal');
            doc.text('Berater: ' + berater.name + ' | ' + today, 65, 21);
            y = 36;

            // Section 1: Mandant
            doc.setTextColor(26, 54, 93);
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(12);
            doc.text('1. Mandant', lm, y); y += 7;
            doc.setFont('helvetica', 'normal');
            doc.setFontSize(10);
            doc.setTextColor(30, 41, 59);

            var info = [
                ['Name', name],
                ['Segment', mandant.segment || '-'],
                ['Mandatstyp', mandant.mandatstyp || '-'],
                ['Mandat seit', mandant.mandatSeit || '-'],
                ['AuM', fmtEuroFull(mandant.aum || 0)],
                ['Risikoprofil', mandant.risikoprofil || '-'],
                ['ESG', mandant.esgPraeferenz ? mandant.esgPraeferenz.sfdr : '-']
            ];
            info.forEach(function(row) {
                doc.setFont('helvetica', 'bold');
                doc.text(row[0] + ':', lm, y);
                doc.setFont('helvetica', 'normal');
                doc.text(row[1], lm + 40, y);
                y += 5;
            });
            y += 5;

            // Section 2: Portfolio
            doc.setTextColor(26, 54, 93);
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(12);
            doc.text('2. Portfolio', lm, y); y += 7;
            doc.setFontSize(10);
            doc.setTextColor(30, 41, 59);

            // Asset Allocation table
            var allocLabels = { aktien: 'Aktien', renten: 'Renten', alternatives: 'Alternatives', cash: 'Cash', pe: 'PE' };
            doc.setFont('helvetica', 'bold');
            doc.text('Assetklasse', lm, y);
            doc.text('Ist', lm + 50, y);
            doc.text('Soll', lm + 70, y);
            doc.text('Drift', lm + 90, y);
            y += 5;
            doc.setFont('helvetica', 'normal');
            if (mandant.sollAllocation) {
                Object.keys(mandant.sollAllocation).forEach(function(k) {
                    var ist = mandant.assetAllocation ? (mandant.assetAllocation[k] || 0) : 0;
                    var soll = mandant.sollAllocation[k] || 0;
                    var diff = ist - soll;
                    doc.text(allocLabels[k] || k, lm, y);
                    doc.text(ist + '%', lm + 50, y);
                    doc.text(soll + '%', lm + 70, y);
                    doc.text((diff > 0 ? '+' : '') + diff + 'pp', lm + 90, y);
                    y += 5;
                });
            }
            y += 3;
            var perf = mandant.performance || {};
            doc.setFont('helvetica', 'bold');
            doc.text('Performance YTD: ' + fmtPercent(perf.ytd || 0), lm, y);
            doc.setFont('helvetica', 'normal');
            doc.text('Benchmark: ' + fmtPercent(perf.benchmark_ytd || 0), lm + 60, y);
            y += 8;

            // Section 3: Vermoegensbilanz
            doc.setTextColor(26, 54, 93);
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(12);
            doc.text('3. Vermoegensbilanz', lm, y); y += 7;
            doc.setFontSize(10);
            doc.setTextColor(30, 41, 59);

            var fremdTotal = (mandant.fremdVermoegen || []).reduce(function(s, f) { return s + (f.volumen || 0); }, 0);
            var gesamtLiquid = (mandant.aum || 0) + fremdTotal;
            var gesamtImmo = (mandant.immobilien || []).reduce(function(s, i) { return s + (i.wert || 0); }, 0);
            var gesamtUntern = (mandant.unternehmen || []).reduce(function(s, u) { return s + (u.schaetzwert || 0); }, 0);
            var gesamtPE = (mandant.peBeteiligungen || []).reduce(function(s, p) { return s + (p.investiert || 0); }, 0);
            var gesamt = gesamtLiquid + gesamtImmo + gesamtUntern + gesamtPE;

            doc.setFont('helvetica', 'normal');
            doc.text('Liquid (bei uns): ' + fmtEuroFull(mandant.aum || 0), lm, y); y += 5;
            if (fremdTotal > 0) { doc.text('Liquid (Fremd): ' + fmtEuroFull(fremdTotal), lm, y); y += 5; }
            if (gesamtImmo > 0) { doc.text('Immobilien: ' + fmtEuroFull(gesamtImmo), lm, y); y += 5; }
            if (gesamtUntern > 0) { doc.text('Unternehmen: ~' + fmtEuroFull(gesamtUntern), lm, y); y += 5; }
            if (gesamtPE > 0) { doc.text('PE-Beteiligungen: ' + fmtEuroFull(gesamtPE), lm, y); y += 5; }
            doc.setFont('helvetica', 'bold');
            doc.text('Gesamtvermoegen: ~' + fmtEuroFull(gesamt), lm, y); y += 8;

            // Section 4: Compliance
            doc.setTextColor(26, 54, 93);
            doc.setFontSize(12);
            doc.text('4. Compliance-Status', lm, y); y += 7;
            doc.setFontSize(10);
            doc.setTextColor(30, 41, 59);
            doc.setFont('helvetica', 'normal');

            var wphg = mandant.wphgBogen || {};
            var gb = mandant.geeignetheitsbericht || {};
            doc.text('WpHG-Bogen: ' + (wphg.status === 'vollstaendig' ? 'Vollstaendig' : 'Aktualisierung noetig') + ' (Stand: ' + (wphg.letzteAktualisierung || '-') + ')', lm, y); y += 5;
            doc.text('Geeignetheitsbericht: ' + (gb.status === 'erstellt' ? 'Erstellt' : 'Offen') + ' (naechster: ' + (gb.naechsterFaellig || '-') + ')', lm, y); y += 5;
            var vs = mandant.verlustschwelle || {};
            doc.text('Verlustschwelle: -' + ((vs.schwelle || 0.1) * 100) + '% vom Hoechststand ' + fmtEuroFull(vs.hoechststand || 0), lm, y); y += 8;

            // Section 5: Top-3 Potentiale
            doc.setTextColor(26, 54, 93);
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(12);
            doc.text('5. Top-Potentiale', lm, y); y += 7;
            doc.setFontSize(10);
            doc.setTextColor(30, 41, 59);
            doc.setFont('helvetica', 'normal');

            var potentiale = (window.vvPotentiale || []).filter(function(p) { return p.kundenName === name; });
            if (potentiale.length > 0) {
                potentiale.slice(0, 3).forEach(function(p, i) {
                    doc.text((i + 1) + '. ' + p.produkt + ' (' + fmtEuroVV(p.volumen) + ')', lm, y); y += 5;
                    var desc = p.beschreibung.length > 80 ? p.beschreibung.substring(0, 80) + '...' : p.beschreibung;
                    doc.setTextColor(100, 116, 139);
                    doc.text('   ' + desc, lm, y); y += 6;
                    doc.setTextColor(30, 41, 59);
                });
            } else {
                doc.text('Keine Potentiale identifiziert.', lm, y); y += 6;
            }

            // Footer / Disclaimer
            doc.setDrawColor(226, 232, 240);
            doc.line(lm, 275, lm + pw, 275);
            doc.setFontSize(8);
            doc.setTextColor(100, 116, 139);
            doc.text('Erstellt mit KI-Vertriebsarbeitsplatz | ' + today + ' | Nicht zur Weitergabe an Dritte bestimmt', lm, 280);

            // Save
            var filename = 'Mandantenanalyse_' + name.replace(/[^a-zA-Z0-9]/g, '_') + '_' + today.replace(/\./g, '') + '.pdf';
            doc.save(filename);
        } catch (e) {
            console.error('PDF-Export Fehler:', e);
            alert('PDF-Export fehlgeschlagen. Bitte pruefen Sie die Konsole.');
        }
    }

    // ══════════════════════════════════════════════════
    // 22-E: VV NOTIFICATION BELL
    // ══════════════════════════════════════════════════

    function generateVVNotifications() {
        var notifications = [];
        var mandanten = window.vvMockMandanten || {};

        Object.keys(mandanten).forEach(function(name) {
            var m = mandanten[name];

            // WpHG-Bogen faellig
            if (m.wphgBogen && m.wphgBogen.status !== 'vollstaendig') {
                notifications.push({ prio: 'hoch', text: 'WpHG-Bogen ' + name + ': Aktualisierung erforderlich', mandant: name, icon: 'shield' });
            }

            // Geeignetheitsbericht ueberfaellig
            if (m.geeignetheitsbericht && m.geeignetheitsbericht.status === 'offen') {
                notifications.push({ prio: 'hoch', text: 'Geeignetheitsbericht ' + name + ': Status offen (faellig ' + m.geeignetheitsbericht.naechsterFaellig + ')', mandant: name, icon: 'file' });
            }

            // Verlustschwelle <5% Puffer
            if (m.verlustschwelle && m.aum) {
                var trigger = m.verlustschwelle.hoechststand * (1 - (m.verlustschwelle.schwelle || 0.1));
                var puffer = m.aum - trigger;
                if (puffer < m.aum * 0.05 && puffer > 0) {
                    notifications.push({ prio: 'hoch', text: 'Verlustschwelle ' + name + ': Nur noch ' + fmtEuroVV(puffer) + ' Puffer', mandant: name, icon: 'alert' });
                }
            }

            // Rebalancing-Alert (Drift >= 3pp)
            if (m.assetAllocation && m.sollAllocation) {
                Object.keys(m.sollAllocation).forEach(function(k) {
                    var diff = Math.abs((m.assetAllocation[k] || 0) - (m.sollAllocation[k] || 0));
                    if (diff >= 3) {
                        notifications.push({ prio: 'mittel', text: 'Rebalancing ' + name + ': ' + k + ' Drift ' + diff + 'pp', mandant: name, icon: 'trending' });
                    }
                });
            }
        });

        // Pipeline-Prospect Termine
        var pipeline = window.vvPipeline || [];
        pipeline.forEach(function(p) {
            if (p.stadium === 'onboarding' || p.stadium === 'analyse_vorschlag') {
                notifications.push({ prio: 'mittel', text: 'Pipeline ' + p.name + ': ' + p.naechsterSchritt, mandant: null, icon: 'users' });
            }
        });

        return notifications;
    }

    function toggleVVNotifications() {
        var dropdown = document.getElementById('vvNotificationDropdown');
        if (!dropdown) return;

        if (dropdown.style.display === 'none' || dropdown.style.display === '') {
            var notifications = generateVVNotifications();
            renderVVNotificationDropdown(notifications);
            dropdown.style.display = 'block';
            // Close on outside click
            setTimeout(function() {
                document.addEventListener('click', closeVVNotificationsOnOutsideClick);
            }, 10);
        } else {
            dropdown.style.display = 'none';
            document.removeEventListener('click', closeVVNotificationsOnOutsideClick);
        }
    }

    function closeVVNotificationsOnOutsideClick(e) {
        var dropdown = document.getElementById('vvNotificationDropdown');
        var btn = document.getElementById('vvNotificationBtn');
        if (dropdown && btn && !dropdown.contains(e.target) && !btn.contains(e.target)) {
            dropdown.style.display = 'none';
            document.removeEventListener('click', closeVVNotificationsOnOutsideClick);
        }
    }

    function renderVVNotificationDropdown(notifications) {
        var dropdown = document.getElementById('vvNotificationDropdown');
        if (!dropdown) return;

        var svgIcons = {
            shield: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>',
            file: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>',
            alert: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>',
            trending: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/></svg>',
            users: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>'
        };

        if (notifications.length === 0) {
            dropdown.innerHTML = '<div class="vv-notif-empty">Keine Benachrichtigungen</div>';
            return;
        }

        var html = '<div class="vv-notif-header">Benachrichtigungen (' + notifications.length + ')</div>';
        notifications.forEach(function(n) {
            var prioClass = n.prio === 'hoch' ? 'vv-notif-hoch' : 'vv-notif-mittel';
            var onclick = n.mandant ? ' onclick="openVVMandantDetail(\'' + n.mandant.replace(/'/g, "\\'") + '\')"' : '';
            html += '<div class="vv-notif-item ' + prioClass + '"' + onclick + '>';
            html += '<span class="vv-notif-icon">' + (svgIcons[n.icon] || svgIcons.alert) + '</span>';
            html += '<span class="vv-notif-text">' + n.text + '</span>';
            html += '</div>';
        });
        dropdown.innerHTML = html;
    }

    function updateVVNotificationBadge() {
        var badge = document.getElementById('vvNotificationBadge');
        if (!badge) return;
        var notifications = generateVVNotifications();
        var count = notifications.filter(function(n) { return n.prio === 'hoch'; }).length;
        badge.textContent = count.toString();
        badge.style.display = count > 0 ? 'flex' : 'none';
    }

    // ══════════════════════════════════════════════════
    // 22-E: LUECKEN-LEISTE / ABDECKUNGSSTATUS
    // ══════════════════════════════════════════════════

    function renderVVAbdeckungsLeiste(m) {
        var kategorien = [
            { key: 'aktien', label: 'Aktien' },
            { key: 'renten', label: 'Renten' },
            { key: 'alternatives', label: 'Alternatives' },
            { key: 'pe', label: 'PE' },
            { key: 'cash', label: 'Cash' },
            { key: 'immobilienfonds', label: 'Immobilienfonds' },
            { key: 'esg', label: 'ESG' },
            { key: 'rohstoffe', label: 'Rohstoffe' }
        ];

        var luecken = [];
        var html = '<div class="vv-abdeckung-leiste">';

        kategorien.forEach(function(kat) {
            var vorhanden = false;

            if (kat.key === 'esg') {
                vorhanden = m.esgPraeferenz && m.esgPraeferenz.sfdr && m.esgPraeferenz.sfdr !== 'keine';
                if (!vorhanden && m.esgPraeferenz && m.esgPraeferenz.sfdr && m.esgPraeferenz.sfdr !== 'keine') {
                    luecken.push({ label: 'ESG', text: 'Portfolio nicht ESG-konform (Mandant wuenscht ' + m.esgPraeferenz.sfdr + ')' });
                }
            } else if (kat.key === 'immobilienfonds') {
                vorhanden = false; // No real estate funds in asset allocation model
                if (m.aum > 3000000) {
                    luecken.push({ label: 'Immobilienfonds', text: 'Keine Immobilienfonds-Allokation (Empfehlung bei >3M AuM)' });
                }
            } else if (kat.key === 'rohstoffe') {
                vorhanden = false; // No commodities in asset allocation model
            } else {
                vorhanden = m.assetAllocation && (m.assetAllocation[kat.key] || 0) > 0;
                if (!vorhanden && kat.key === 'pe' && (m.aum || 0) > 5000000) {
                    luecken.push({ label: 'PE', text: 'Keine PE-Allokation (Empfehlung bei >5M AuM)' });
                }
            }

            var statusClass = vorhanden ? 'vv-abdeckung-ok' : 'vv-abdeckung-luecke';
            var statusIcon = vorhanden ?
                '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="12" height="12"><polyline points="20 6 9 17 4 12"/></svg>' :
                '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="12" height="12"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>';
            html += '<span class="vv-abdeckung-badge ' + statusClass + '" title="' + kat.label + '">' + statusIcon + ' ' + kat.label + '</span>';
        });

        html += '</div>';

        if (luecken.length > 0) {
            html += '<div class="vv-luecken-info"><strong>' + luecken.length + ' Luecken erkannt:</strong><br>';
            luecken.forEach(function(l, i) {
                html += '<div class="vv-luecke-item">' + (i + 1) + '. ' + l.text +
                    ' <button class="vv-btn vv-btn-secondary" style="font-size:11px;padding:2px 8px;" onclick="showVVDetailTab(\'impulse\')">Impuls oeffnen</button></div>';
            });
            html += '</div>';
        }

        return html;
    }

    // ══════════════════════════════════════════════════
    // 22-E: POTENZIAL-STERNE IN MANDATSLISTE
    // ══════════════════════════════════════════════════

    function calculateVVPotenzialScore(mandant) {
        var score = 0;

        // Cross-Selling: +1 pro Fremdbank
        if (mandant.fremdVermoegen) {
            score += mandant.fremdVermoegen.length;
        }

        // NextGen: +1 pro Kind >25 ohne Mandat
        if (mandant.kinder) {
            mandant.kinder.forEach(function(k) {
                if (k.alter >= 25 && !k.eigenesMandat) score += 1;
            });
        }

        // Compliance-Items: +1 pro offener
        if (mandant.wphgBogen && mandant.wphgBogen.status !== 'vollstaendig') score += 1;
        if (mandant.geeignetheitsbericht && mandant.geeignetheitsbericht.status === 'offen') score += 1;

        // Mandatstyp-Upgrade: +1 wenn SmartValue und >3M AuM
        if (mandant.segment === 'SmartValue' && (mandant.aum || 0) > 3000000) score += 1;

        return Math.min(score, 5); // Cap at 5 stars
    }

    function renderVVSterne(score) {
        var html = '';
        for (var i = 0; i < 5; i++) {
            if (i < score) {
                html += '<svg viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="1" width="14" height="14" class="vv-star-filled"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>';
            } else {
                html += '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" width="14" height="14" class="vv-star-empty"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>';
            }
        }
        return '<span class="vv-sterne" title="Potenzial-Score: ' + score + '/5">' + html + '</span>';
    }

    // ══════════════════════════════════════════════════
    // 22-E: DYNAMIC PORTFOLIO-EINZEILER
    // ══════════════════════════════════════════════════

    function generateVVEinzeiler() {
        var mandanten = window.vvMockMandanten || {};
        var names = Object.keys(mandanten);

        var totalAuM = 0, complianceItems = 0;
        names.forEach(function(n) {
            var m = mandanten[n];
            totalAuM += m.aum || 0;
            if (m.wphgBogen && m.wphgBogen.status !== 'vollstaendig') complianceItems++;
            if (m.geeignetheitsbericht && m.geeignetheitsbericht.status === 'offen') complianceItems++;
        });

        // Find top impulse (largest drift)
        var topImpuls = 'Keine aktuellen Impulse';
        var maxDrift = 0;
        names.forEach(function(n) {
            var m = mandanten[n];
            if (m.assetAllocation && m.sollAllocation) {
                Object.keys(m.sollAllocation).forEach(function(k) {
                    var diff = Math.abs((m.assetAllocation[k] || 0) - (m.sollAllocation[k] || 0));
                    if (diff > maxDrift) {
                        maxDrift = diff;
                        topImpuls = 'Rebalancing ' + n + ' (' + fmtEuroVV(m.aum || 0) + ')';
                    }
                });
            }
        });

        return names.length + ' Mandate · ' + fmtEuroVV(totalAuM) + ' AuM · ' +
            complianceItems + ' Compliance-Items offen · Fokus: ' + topImpuls;
    }

    // ══════════════════════════════════════════════════
    // OVERRIDE: Enhanced fillVVUebersicht with dynamic Einzeiler
    // ══════════════════════════════════════════════════

    // Store original and replace with enhanced version
    var _origFillVVUebersicht = fillVVUebersicht;
    fillVVUebersicht = function() {
        _origFillVVUebersicht();

        // Replace static Einzeiler with dynamic one
        var el = document.getElementById('vv-tab-uebersicht');
        if (!el) return;

        var einzeilerDiv = el.querySelector('.vv-einzeiler');
        if (einzeilerDiv) {
            einzeilerDiv.innerHTML = '<span class="vv-einzeiler-item">' + generateVVEinzeiler() + '</span>';
        }
    };

    // ══════════════════════════════════════════════════
    // OVERRIDE: Enhanced fillVVMandatsliste with Sterne
    // ══════════════════════════════════════════════════

    var _origFillVVMandatsliste = fillVVMandatsliste;
    fillVVMandatsliste = function() {
        var el = document.getElementById('vv-tab-mandatsliste');
        if (!el) return;
        var mandanten = window.vvMockMandanten || {};
        var names = Object.keys(mandanten);

        var html = '<div class="uebersicht-card vv-card"><div class="uebersicht-card-header"><h3>';
        html += '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg>';
        html += ' Mandantenliste (' + names.length + ' Mandate)</h3></div>';
        html += '<div class="vv-table-wrap"><table class="vv-table"><thead><tr>';
        html += '<th>Mandant</th><th>Segment</th><th>AuM</th><th>Mandat</th><th>Marge</th><th>Perf YTD</th><th>Potenzial</th><th>Status</th>';
        html += '</tr></thead><tbody>';

        names.sort(function(a, b) { return (mandanten[b].aum || 0) - (mandanten[a].aum || 0); });

        names.forEach(function(name) {
            var m = mandanten[name];
            var score = calculateVVPotenzialScore(m);
            html += '<tr class="vv-table-row" onclick="openVVMandantDetail(\'' + name.replace(/'/g, "\\'") + '\')">';
            html += '<td><div class="vv-mandant-cell"><span class="vv-avatar" style="background:' + (m.avatarBg || '#1a365d') + '">' + getInitialsVV(name) + '</span> ' + name + '</div></td>';
            html += '<td>' + (m.segment || '-') + '</td>';
            html += '<td class="vv-num">' + fmtEuroVV(m.aum || 0) + '</td>';
            html += '<td>' + (m.mandatstyp || '-') + '</td>';
            html += '<td class="vv-num">' + ((m.managementFee || 0) * 100).toFixed(2).replace('.', ',') + '%</td>';
            html += '<td class="vv-num ' + (m.performance && m.performance.ytd >= 0 ? 'vv-positive' : 'vv-negative') + '">' + fmtPercent(m.performance ? m.performance.ytd : 0) + '</td>';
            html += '<td>' + renderVVSterne(score) + '</td>';
            html += '<td>' + getStatusBadge(m.statusIcon) + '</td>';
            html += '</tr>';
        });

        html += '</tbody></table></div></div>';
        el.innerHTML = html;
    };

    // ══════════════════════════════════════════════════
    // OVERRIDE: Enhanced fillVVDetailPortfolio with Abdeckungsleiste
    // ══════════════════════════════════════════════════

    var _origFillVVDetailPortfolio = fillVVDetailPortfolio;
    fillVVDetailPortfolio = function(m) {
        _origFillVVDetailPortfolio(m);

        // Prepend Abdeckungsleiste above the Asset Allocation
        var el = document.getElementById('vvd-tab-portfolio');
        if (!el) return;

        var abdeckung = '<div class="uebersicht-card vv-card" style="grid-column:1/-1;"><div class="uebersicht-card-header"><h3>';
        abdeckung += '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20"><path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>';
        abdeckung += ' Anlage-Abdeckung</h3></div><div style="padding:16px;">';
        abdeckung += renderVVAbdeckungsLeiste(m);
        abdeckung += '</div></div>';

        // Insert at top of grid
        var grid = el.querySelector('.vv-detail-grid');
        if (grid) {
            grid.insertAdjacentHTML('afterbegin', abdeckung);
        } else {
            el.insertAdjacentHTML('afterbegin', abdeckung);
        }
    };

    // ══════════════════════════════════════════════════
    // SHOW/HIDE CHAT ON PAGE NAVIGATION
    // ══════════════════════════════════════════════════

    var _origShowVVOverview = showVVOverview;
    showVVOverview = function() {
        _origShowVVOverview();
        showVVChatToggle();
        updateVVNotificationBadge();
    };

    var _origOpenVVMandantDetail = openVVMandantDetail;
    openVVMandantDetail = function(name) {
        _origOpenVVMandantDetail(name);
        showVVChatToggle();
    };

    // ══════════════════════════════════════════════════
    // 22-D: VV GUIDED TOUR (via event, steps defined below)
    // ══════════════════════════════════════════════════

    function startVVTour() {
        if (!window.guidedTour) { console.warn('Guided Tour nicht geladen.'); return; }

        // Save original steps and replace with VV steps
        var tour = window.guidedTour;
        var originalSteps = tour.steps;

        var icons = {
            chart: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="20" x2="18" y2="10"></line><line x1="12" y1="20" x2="12" y2="4"></line><line x1="6" y1="20" x2="6" y2="14"></line></svg>',
            users: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg>',
            trending: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>',
            shield: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>',
            welcome: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 01-3.46 0"/></svg>',
            pie: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 2a10 10 0 0110 10"/><line x1="12" y1="12" x2="12" y2="2"/><line x1="12" y1="12" x2="22" y2="12"/></svg>',
            briefcase: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v16"/></svg>',
            bolt: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>',
            user: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>',
            check: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>'
        };

        // VV-02 tour steps
        tour.steps = [
            {
                title: 'Willkommen bei HRK LUNIS',
                description: 'Diese Tour zeigt Ihnen die wichtigsten Funktionen des Vermoegensverwaltungs-Cockpits.',
                icon: icons.welcome,
                element: null,
                position: 'center'
            },
            {
                title: 'KPI-Cockpit',
                description: 'Ihre wichtigsten Kennzahlen auf einen Blick: AuM, Net New Money, Ertrag, Mandate, Marge und At-Risk-Mandate.',
                icon: icons.chart,
                element: '.vv-kpi-row',
                position: 'bottom'
            },
            {
                title: 'Mandatsliste',
                description: 'Alle Mandate sortiert nach AuM. Potenzial-Sterne zeigen Cross-Selling-Chancen. Klicken Sie auf einen Mandanten fuer die 360-Grad-Ansicht.',
                icon: icons.users,
                element: '.vv-tab-btn[data-tab="mandatsliste"]',
                position: 'bottom',
                beforeShow: function() { showVVTab('mandatsliste'); return new Promise(function(r) { setTimeout(r, 200); }); }
            },
            {
                title: 'Sales Pipeline',
                description: 'Ihr Sales-Funnel von Lead bis Onboarding. Sehen Sie erwartete Volumina und naechste Schritte.',
                icon: icons.trending,
                element: '.vv-tab-btn[data-tab="pipeline"]',
                position: 'bottom',
                beforeShow: function() { showVVTab('pipeline'); return new Promise(function(r) { setTimeout(r, 200); }); }
            },
            {
                title: 'Compliance-Uebersicht',
                description: 'Ueberfaellige WpHG-Boegen und Geeignetheitsberichte sofort erkennen. Verlustschwellen-Monitoring fuer alle Mandate.',
                icon: icons.shield,
                element: '.vv-tab-btn[data-tab="compliance"]',
                position: 'bottom',
                beforeShow: function() { showVVTab('compliance'); return new Promise(function(r) { setTimeout(r, 200); }); }
            },
            {
                title: 'Tour abgeschlossen!',
                description: 'Sie kennen jetzt das Berater-Cockpit. Klicken Sie auf einen Mandanten, um die Client-360-Grad-Ansicht zu erkunden.',
                icon: icons.check,
                element: null,
                position: 'center',
                isLast: true,
                beforeShow: function() { showVVTab('uebersicht'); return new Promise(function(r) { setTimeout(r, 200); }); }
            }
        ];

        tour.onComplete = function() {
            tour.steps = originalSteps;
            tour.onComplete = null;
        };

        tour.start();
    }

    // ══════════════════════════════════════════════════
    // 22-D: VV-10 DETAIL GUIDED TOUR
    // ══════════════════════════════════════════════════

    function startVVDetailTour() {
        if (!window.guidedTour) { console.warn('Guided Tour nicht geladen.'); return; }
        if (!currentVVMandant) { console.warn('Kein Mandant ausgewaehlt.'); return; }

        var tour = window.guidedTour;
        var originalSteps = tour.steps;

        var icons = {
            user: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>',
            pie: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 2a10 10 0 0110 10"/><line x1="12" y1="12" x2="12" y2="2"/><line x1="12" y1="12" x2="22" y2="12"/></svg>',
            briefcase: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v16"/></svg>',
            shield: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>',
            bolt: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>',
            welcome: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 01-3.46 0"/></svg>',
            check: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>'
        };

        tour.steps = [
            {
                title: 'Mandant: ' + currentVVMandant,
                description: 'Diese Tour fuehrt Sie durch die 360-Grad-Ansicht des Mandanten.',
                icon: icons.welcome,
                element: null,
                position: 'center'
            },
            {
                title: 'Client 360°',
                description: 'Alle Informationen zum Mandanten: Stammdaten, Familie, Beruf, Vermoegensueberblick und Kommunikationshistorie.',
                icon: icons.user,
                element: '.vv-detail-tab-btn[data-tab="stammdaten"]',
                position: 'bottom',
                beforeShow: function() { showVVDetailTab('stammdaten'); return new Promise(function(r) { setTimeout(r, 200); }); }
            },
            {
                title: 'Portfolio',
                description: 'Ist- vs. Soll-Allokation, Drift erkennen, Performance-Kennzahlen und die Anlage-Abdeckungsleiste.',
                icon: icons.pie,
                element: '.vv-detail-tab-btn[data-tab="portfolio"]',
                position: 'bottom',
                beforeShow: function() { showVVDetailTab('portfolio'); return new Promise(function(r) { setTimeout(r, 200); }); }
            },
            {
                title: 'Vermoegensbilanz',
                description: 'Liquides Vermoegen bei uns und fremd, Immobilien, Unternehmensbeteiligungen und PE-Stakes auf einen Blick.',
                icon: icons.briefcase,
                element: '.vv-detail-tab-btn[data-tab="finanzplanung"]',
                position: 'bottom',
                beforeShow: function() { showVVDetailTab('finanzplanung'); return new Promise(function(r) { setTimeout(r, 200); }); }
            },
            {
                title: 'Compliance',
                description: 'WpHG-Bogen-Status, Geeignetheitsberichte, Verlustschwellen-Monitoring und Kostenreporting.',
                icon: icons.shield,
                element: '.vv-detail-tab-btn[data-tab="compliance"]',
                position: 'bottom',
                beforeShow: function() { showVVDetailTab('compliance'); return new Promise(function(r) { setTimeout(r, 200); }); }
            },
            {
                title: 'Potentiale',
                description: 'KI-gestuetzte Empfehlungen: Konsolidierung, NextGen-Mandate, Cross-Selling und Nachfolgeplanung.',
                icon: icons.bolt,
                element: '.vv-detail-tab-btn[data-tab="impulse"]',
                position: 'bottom',
                beforeShow: function() { showVVDetailTab('impulse'); return new Promise(function(r) { setTimeout(r, 200); }); }
            },
            {
                title: 'Tour abgeschlossen!',
                description: 'Sie kennen jetzt alle Bereiche der Mandantenansicht. Nutzen Sie den PDF-Export oben rechts fuer Berichte.',
                icon: icons.check,
                element: null,
                position: 'center',
                isLast: true,
                beforeShow: function() { showVVDetailTab('stammdaten'); return new Promise(function(r) { setTimeout(r, 200); }); }
            }
        ];

        tour.onComplete = function() {
            tour.steps = originalSteps;
            tour.onComplete = null;
        };

        tour.start();
    }

    // ══════════════════════════════════════════════════
    // 23-E: VV KUNDEN-ID CROSS-REFERENZ
    // ══════════════════════════════════════════════════

    function initVVCrossRef() {
        if (!window.kundenCrossRef) return;
        // Add VV mandants to cross-reference
        // Dr. von Trott could be a banking customer too (Private Banking)
        window.kundenCrossRef['Dr. Heinrich von Trott'] = {
            bankName: 'Dr. Heinrich von Trott',
            bankId: 'PBB001',
            versId: null,
            vvId: 'VV001',
            vvName: 'Dr. Heinrich von Trott'
        };
        // Familie Bergmann-Roth - VV only, no banking/insurance yet
        window.kundenCrossRef['Familie Bergmann-Roth'] = {
            bankName: null,
            bankId: null,
            versId: null,
            vvId: 'VV008',
            vvName: 'Familie Bergmann-Roth'
        };
        // Dr. Schreiber - has insurance contracts at ERGO
        window.kundenCrossRef['Dr. Marcus Schreiber'] = {
            bankName: null,
            bankId: null,
            versId: 'KD00005',
            vvId: 'VV007',
            vvName: 'Dr. Marcus Schreiber'
        };
        // Prof. Hartmann - has banking relationship with VR
        window.kundenCrossRef['Prof. Dr. Elisabeth Hartmann'] = {
            bankName: 'Prof. Dr. Hartmann',
            bankId: 'PBB003',
            versId: null,
            vvId: 'VV006',
            vvName: 'Prof. Dr. Elisabeth Hartmann'
        };
    }

    // Initialize on load
    try { initVVCrossRef(); } catch(e) { /* silently fail if config not loaded yet */ }

    // ── WINDOW EXPORTS ──
    window.showVVOverview = showVVOverview;
    window.showVVTab = showVVTab;
    window.openVVMandantDetail = openVVMandantDetail;
    window.showVVDetailTab = showVVDetailTab;
    window.backFromVVDetail = backFromVVDetail;
    window.backFromVVOverview = backFromVVOverview;
    window.toggleVVChat = toggleVVChat;
    window.sendVVChat = sendVVChat;
    window.askVVQuestion = askVVQuestion;
    window.hideVVChat = hideVVChat;
    window.exportVVMandantenPDF = exportVVMandantenPDF;
    window.toggleVVNotifications = toggleVVNotifications;
    window.startVVTour = startVVTour;
    window.startVVDetailTour = startVVDetailTour;
    window.calculateVVPotenzialScore = calculateVVPotenzialScore;
    window.generateVVNotifications = generateVVNotifications;
    window.generateVVEinzeiler = generateVVEinzeiler;
    window.renderVVAbdeckungsLeiste = renderVVAbdeckungsLeiste;

})();
