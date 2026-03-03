// ========================================
// B-02 Berater-Uebersicht (Banking)
// Drei Modi: VR Retail, VR Firmenkunde, VR Vermoegen
// ========================================

(function() {
    'use strict';

    // ── State ──────────────────────────────
    var bankViewMode = localStorage.getItem('bankViewMode') || 'retail';

    // ── Mock-Daten: Retail-Kunden ──────────
    var retailKunden = [
        { id: 'PK-10021', name: 'Markus Hoffmann', segment: 'A-Top', ort: 'Giessen', produkte: 5, ertrag: 1850, finanzplan: true, kontostand: 12400, baufi: true },
        { id: 'PK-10034', name: 'Sabine Kramer', segment: 'A-Top', ort: 'Wetzlar', produkte: 4, ertrag: 2100, finanzplan: true, kontostand: 28900, baufi: false },
        { id: 'PK-10056', name: 'Thomas Mueller', segment: 'B-Wachstum', ort: 'Marburg', produkte: 3, ertrag: 980, finanzplan: false, kontostand: 5600, baufi: false },
        { id: 'PK-10078', name: 'Andrea Fischer', segment: 'B-Wachstum', ort: 'Giessen', produkte: 3, ertrag: 1200, finanzplan: true, kontostand: 18200, baufi: true },
        { id: 'PK-10089', name: 'Klaus Weber', segment: 'B-Wachstum', ort: 'Wetzlar', produkte: 2, ertrag: 760, finanzplan: false, kontostand: 3400, baufi: false },
        { id: 'PK-10102', name: 'Julia Braun', segment: 'C-Basis', ort: 'Marburg', produkte: 2, ertrag: 420, finanzplan: false, kontostand: 1850, baufi: false },
        { id: 'PK-10115', name: 'Michael Schneider', segment: 'Abwanderung', ort: 'Giessen', produkte: 1, ertrag: 180, finanzplan: false, kontostand: 450, baufi: false },
        { id: 'PK-10128', name: 'Petra Lang', segment: 'C-Basis', ort: 'Wetzlar', produkte: 2, ertrag: 540, finanzplan: false, kontostand: 2100, baufi: false }
    ];

    // ── Mock-Daten: Firmenkunden ────────────
    var firmenKunden = [
        { id: 'FK-20010', name: 'Metallbau Schaefer GmbH', branche: 'handwerk', brancheLabel: 'Handwerk/Bau', ort: 'Giessen', kreditvol: 4200000, rating: 'A', mitarbeiter: 85, umsatz: 12500000 },
        { id: 'FK-20023', name: 'TechSolutions Mittelhessen AG', branche: 'dienstleistung', brancheLabel: 'Dienstleistung/IT', ort: 'Wetzlar', kreditvol: 2800000, rating: 'AA', mitarbeiter: 120, umsatz: 18000000 },
        { id: 'FK-20035', name: 'Gasthaus zur Linde KG', branche: 'handel', brancheLabel: 'Handel/Gastro', ort: 'Marburg', kreditvol: 850000, rating: 'BBB', mitarbeiter: 22, umsatz: 2800000 },
        { id: 'FK-20048', name: 'Agrar Becker OHG', branche: 'landwirtschaft', brancheLabel: 'Landwirtschaft', ort: 'Giessen', kreditvol: 3100000, rating: 'A', mitarbeiter: 15, umsatz: 4200000 },
        { id: 'FK-20061', name: 'Dr. med. Karin Engel — Praxisgemeinschaft', branche: 'heilberufe', brancheLabel: 'Heilberufe', ort: 'Wetzlar', kreditvol: 1200000, rating: 'AA', mitarbeiter: 8, umsatz: 1800000 },
        { id: 'FK-20074', name: 'Wetzlarer Maschinenbau GmbH', branche: 'produktion', brancheLabel: 'Produktion/Industrie', ort: 'Wetzlar', kreditvol: 6800000, rating: 'A', mitarbeiter: 210, umsatz: 32000000 }
    ];

    // ── Mock-Daten: Vermoegenskunden ────────
    var vermoegenKunden = [
        { id: 'VK-30010', name: 'Dr. Heinrich von Stein', ort: 'Giessen', aum: 8200000, depot: 5400000, vorsorge: 1800000, nachfolge: true, stiftung: false },
        { id: 'VK-30023', name: 'Elisabeth Koenig-Hartmann', ort: 'Marburg', aum: 12500000, depot: 8200000, vorsorge: 2800000, nachfolge: true, stiftung: true },
        { id: 'VK-30035', name: 'Familie Riedel', ort: 'Wetzlar', aum: 4800000, depot: 3100000, vorsorge: 1200000, nachfolge: false, stiftung: false },
        { id: 'VK-30048', name: 'Prof. Dr. Ulrich Baumann', ort: 'Giessen', aum: 6200000, depot: 4100000, vorsorge: 1500000, nachfolge: true, stiftung: true }
    ];

    // ── Berater-Profile je Modus ────────────
    var beraterProfile = {
        retail: { name: 'Thomas Berger', nr: 'VB-40210', bank: 'Volksbank Mittelhessen eG', region: 'Beratungscenter Giessen-Sued' },
        firmenkunde: { name: 'Carola Weiss', nr: 'VB-40210-FK', bank: 'Volksbank Mittelhessen eG', region: 'Firmenkundencenter Mittelhessen' },
        vermoegen: { name: 'Dr. Julia Rademacher', nr: 'PB-Center Giessen', bank: 'Volksbank Mittelhessen eG', region: 'Ganzheitliche Vermoegensbetreuung' }
    };

    // ── Formatierung ────────────────────────
    function fmtEuro(val) {
        if (val >= 1000000) return (val / 1000000).toFixed(1).replace('.', ',') + ' Mio. EUR';
        if (val >= 1000) return (val / 1000).toFixed(0) + ' Tsd. EUR';
        return val.toLocaleString('de-DE') + ' EUR';
    }

    function fmtNum(val) {
        return val.toLocaleString('de-DE');
    }

    // ── setBankViewMode ─────────────────────
    function setBankViewMode(mode) {
        bankViewMode = mode;
        localStorage.setItem('bankViewMode', mode);

        // Update mode buttons
        document.querySelectorAll('.bank-mode-btn').forEach(function(btn) {
            btn.classList.toggle('active', btn.dataset.mode === mode);
        });

        applyBankViewMode();

        // Dispatch event for Page ID Tracker
        var viewMap = { retail: 'berater-retail', firmenkunde: 'berater-firmenkunde', vermoegen: 'berater-vermoegen' };
        document.dispatchEvent(new CustomEvent('viewChanged', {
            detail: { module: 'bankenBerater', view: viewMap[mode] || 'berater-retail' }
        }));

        // Update URL route
        var routeMap = { retail: '/berater', firmenkunde: '/berater-firmenkunde', vermoegen: '/berater-vermoegen' };
        if (window.AppRouter) AppRouter.navigate(routeMap[mode] || '/berater');
    }

    // ── applyBankViewMode ───────────────────
    function applyBankViewMode() {
        var mode = bankViewMode;
        var profile = beraterProfile[mode];

        // Header
        var headerName = document.getElementById('beraterHeaderName');
        var headerMeta = document.getElementById('beraterHeaderMeta');
        if (headerName) headerName.textContent = profile.name;
        if (headerMeta) headerMeta.innerHTML = '<span>Berater-Nr. ' + profile.nr + '</span><span>' + profile.bank + '</span><span>' + profile.region + '</span>';

        // KPIs
        document.querySelectorAll('[data-bank-kpi-set]').forEach(function(el) {
            el.style.display = el.dataset.bankKpiSet === mode ? 'grid' : 'none';
        });

        // Tabs
        document.querySelectorAll('[data-bank-tab-set]').forEach(function(el) {
            el.style.display = el.dataset.bankTabSet === mode ? 'flex' : 'none';
        });

        // Saeulen-Karten (only in vermoegen mode)
        var saeulenGrid = document.getElementById('beraterSaeulenGrid');
        if (saeulenGrid) saeulenGrid.style.display = mode === 'vermoegen' ? 'grid' : 'none';

        // Kundenlisten
        document.querySelectorAll('[data-bank-kunden-set]').forEach(function(el) {
            el.style.display = el.dataset.bankKundenSet === mode ? 'block' : 'none';
        });

        // Tab Content
        document.querySelectorAll('.banking-tab-content').forEach(function(el) {
            el.classList.remove('active');
        });

        // Fill Kundenlisten
        if (mode === 'retail') fillRetailKundenliste();
        else if (mode === 'firmenkunde') fillFirmenKundenliste();
        else if (mode === 'vermoegen') fillVermoegenKundenliste();
    }

    // ── Kundenliste: Retail ─────────────────
    function fillRetailKundenliste() {
        var tbody = document.getElementById('retailKundenBody');
        if (!tbody) return;

        var html = '';
        retailKunden.forEach(function(k) {
            var segmentClass = k.segment === 'A-Top' ? 'segment-exklusiv' :
                               k.segment === 'B-Wachstum' ? 'segment-komfort' :
                               k.segment === 'Abwanderung' ? 'segment-basis' : 'segment-basis';
            var fpIcon = k.finanzplan ? '<span style="color:#16a34a">&#10003;</span>' : '<span style="color:#94a3b8">—</span>';

            html += '<tr class="clickable-row" onclick="openBankKundenDetail(\'' + k.id + '\',\'retail\')">' +
                '<td><strong>' + k.name + '</strong></td>' +
                '<td>' + k.id + '</td>' +
                '<td><span class="kundensegment-badge ' + segmentClass + '">' + k.segment + '</span></td>' +
                '<td>' + k.ort + '</td>' +
                '<td class="text-center">' + k.produkte + '</td>' +
                '<td class="text-right">' + fmtNum(k.ertrag) + ' EUR</td>' +
                '<td class="text-center">' + fpIcon + '</td>' +
                '</tr>';
        });
        tbody.innerHTML = html;
    }

    // ── Kundenliste: Firmenkunde ────────────
    function fillFirmenKundenliste() {
        var tbody = document.getElementById('firmenKundenBody');
        if (!tbody) return;

        var html = '';
        firmenKunden.forEach(function(k) {
            html += '<tr class="clickable-row" onclick="openBankKundenDetail(\'' + k.id + '\',\'firmenkunde\')">' +
                '<td><strong>' + k.name + '</strong></td>' +
                '<td>' + k.id + '</td>' +
                '<td><span class="branche-badge branche-' + k.branche + '">' + k.brancheLabel + '</span></td>' +
                '<td>' + k.ort + '</td>' +
                '<td class="text-right">' + fmtEuro(k.kreditvol) + '</td>' +
                '<td><span class="rating-badge rating-' + k.rating.toLowerCase() + '">' + k.rating + '</span></td>' +
                '<td class="text-right">' + k.mitarbeiter + '</td>' +
                '</tr>';
        });
        tbody.innerHTML = html;
    }

    // ── Kundenliste: Vermoegen ──────────────
    function fillVermoegenKundenliste() {
        var tbody = document.getElementById('vermoegenKundenBody');
        if (!tbody) return;

        var html = '';
        vermoegenKunden.forEach(function(k) {
            var nachfolgeIcon = k.nachfolge ? '<span style="color:#B8860B">&#10003;</span>' : '<span style="color:#94a3b8">—</span>';
            var stiftungIcon = k.stiftung ? '<span style="color:#7c3aed">&#10003;</span>' : '<span style="color:#94a3b8">—</span>';

            html += '<tr class="clickable-row" onclick="openBankKundenDetail(\'' + k.id + '\',\'vermoegen\')">' +
                '<td><strong>' + k.name + '</strong></td>' +
                '<td>' + k.id + '</td>' +
                '<td>' + k.ort + '</td>' +
                '<td class="text-right">' + fmtEuro(k.aum) + '</td>' +
                '<td class="text-right">' + fmtEuro(k.depot) + '</td>' +
                '<td class="text-center">' + nachfolgeIcon + '</td>' +
                '<td class="text-center">' + stiftungIcon + '</td>' +
                '</tr>';
        });
        tbody.innerHTML = html;
    }

    // ── openBeraterOverview ─────────────────
    function openBeraterOverview() {
        console.log('B-02: Berater-Uebersicht oeffnen (Modus: ' + bankViewMode + ')');

        // Alle anderen Seiten verstecken
        var idsToHide = ['landingPage', 'mainApp', 'agenturOverview', 'potentialAnalysePage',
            'kundenDetailPage', 'bgavUmstellungPage', 'billingCheckPage',
            'bankenModule', 'assetModule', 'risikoscoringModule',
            'bestandsuebertragungModule', 'pmoToolboxModule', 'hrPipelineModule',
            'versicherungs1x1Module', 'kundenDetailBankPage'];
        idsToHide.forEach(function(id) {
            var el = document.getElementById(id);
            if (el) el.style.display = 'none';
        });

        // Welcome Chat verstecken
        var welcomeChat = document.getElementById('welcomeChat');
        if (welcomeChat) welcomeChat.style.display = 'none';

        // B-02 anzeigen
        var page = document.getElementById('beraterOverviewPage');
        if (page) page.style.display = 'block';

        // Mode-Buttons synchronisieren
        document.querySelectorAll('.bank-mode-btn').forEach(function(btn) {
            btn.classList.toggle('active', btn.dataset.mode === bankViewMode);
        });

        applyBankViewMode();
    }

    // ── backFromBeraterOverview ──────────────
    function backFromBeraterOverview() {
        console.log('B-02: Zurueck zur Landing Page');

        var page = document.getElementById('beraterOverviewPage');
        if (page) page.style.display = 'none';

        var landing = document.getElementById('landingPage');
        if (landing) landing.style.display = 'flex';

        // Dispatch event for Page ID Tracker
        document.dispatchEvent(new CustomEvent('viewChanged', {
            detail: { module: 'main', view: 'landing' }
        }));

        if (window.AppRouter) AppRouter.navigate('/landing');
    }

    // ── Berater Tab wechseln ────────────────
    function switchBeraterTab(tabId, mode) {
        // Deactivate all tabs of this mode
        var tabSet = document.querySelector('[data-bank-tab-set="' + mode + '"]');
        if (!tabSet) return;
        tabSet.querySelectorAll('.berater-tab-btn').forEach(function(btn) {
            btn.classList.remove('active');
        });
        // Activate clicked tab
        var clickedBtn = tabSet.querySelector('[data-tab="' + tabId + '"]');
        if (clickedBtn) clickedBtn.classList.add('active');

        // Show/hide content
        document.querySelectorAll('.banking-tab-content[data-bank-mode="' + mode + '"]').forEach(function(c) {
            c.classList.toggle('active', c.dataset.tab === tabId);
        });
    }

    // ── Expose globally ─────────────────────
    window.setBankViewMode = setBankViewMode;
    window.openBeraterOverview = openBeraterOverview;
    window.backFromBeraterOverview = backFromBeraterOverview;
    window.switchBeraterTab = switchBeraterTab;
    window.bankViewMode = bankViewMode;

    // Data exports for B-10
    window.bankRetailKunden = retailKunden;
    window.bankFirmenKunden = firmenKunden;
    window.bankVermoegenKunden = vermoegenKunden;

})();
