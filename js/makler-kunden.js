// ========================================
// KUNDENLISTE RENDERING
// ========================================
function renderMaklerKundenliste() {
    var tbody = document.getElementById('maklerKundenlisteBody');
    if (!tbody) return;

    tbody.innerHTML = maklerKunden.map(function(k) {
        var renewalClass = 'renewal-' + k.renewalStatus;
        var schadenClass = k.schadenquote > 65 ? 'schaden-hoch' : (k.schadenquote > 50 ? 'schaden-mittel' : 'schaden-niedrig');
        return '<tr class="clickable-row" onclick="openMaklerKundenDetail(\'' + k.id + '\')">' +
            '<td><strong>' + k.name + '</strong></td>' +
            '<td><span class="makler-segment-badge segment-' + k.segment.toLowerCase().replace(/[&\s]/g, '-') + '">' + k.segmentIcon + ' ' + k.segment + '</span></td>' +
            '<td>' + k.id + '</td>' +
            '<td class="text-right"><strong>' + k.praemieDisplay + '</strong></td>' +
            '<td class="text-center">' + k.vertraege + '</td>' +
            '<td><span class="' + schadenClass + '">' + k.schadenquote + '%</span></td>' +
            '<td><div class="deckung-mini-bar"><div><div class="deckung-mini-fill" style="width:' + k.deckungsquote + '%"></div></div><span>' + k.deckungsquote + '%</span></div></td>' +
            '<td><span class="renewal-badge ' + renewalClass + '">' + k.naechstesRenewal + '</span></td>' +
            '</tr>';
    }).join('');
}

function filterMaklerKundenliste(searchText) {
    var rows = document.querySelectorAll('#maklerKundenlisteBody tr');
    var term = searchText.toLowerCase();
    rows.forEach(function(row) {
        row.style.display = row.textContent.toLowerCase().includes(term) ? '' : 'none';
    });
}
window.filterMaklerKundenliste = filterMaklerKundenliste;

// ========================================
// KUNDEN-DETAIL (A-10 für Makler)
// ========================================
function openMaklerKundenDetail(kundeId) {
    var kunde = maklerKunden.find(function(k) { return k.id === kundeId; });
    if (!kunde) return;

    // Remember we came from Agentursicht for back-navigation
    if (typeof previousViewBeforeKundenDetail !== 'undefined') {
        previousViewBeforeKundenDetail = 'agentursicht';
    }

    // Clean up any prior MRH kundendetail state before applying B2B
    if (typeof restoreMRHKundenDetail === 'function') restoreMRHKundenDetail();

    // Hide all pages, show kundenDetailPage
    var agenturOverview = document.getElementById('agenturOverview');
    var kundenDetailPage = document.getElementById('kundenDetailPage');
    var landingPage = document.getElementById('landingPage');
    var mainApp = document.getElementById('mainApp');
    var potentialAnalyse = document.getElementById('potentialAnalysePage');

    if (landingPage) landingPage.style.display = 'none';
    if (mainApp) mainApp.style.display = 'none';
    if (potentialAnalyse) potentialAnalyse.style.display = 'none';
    if (agenturOverview) agenturOverview.style.display = 'none';

    if (kundenDetailPage) {
        kundenDetailPage.style.display = 'block';
        kundenDetailPage.classList.remove('makler-view', 'ao-view');
        kundenDetailPage.classList.add('makler-view');
    }

    fillMaklerDetail(kunde);

    // Update Page ID to A-10b (Kunden-Detail B2B)
    document.dispatchEvent(new CustomEvent('viewChanged', {
        detail: { module: 'versicherung', view: 'kundendetail-b2b' }
    }));

    // Update URL route to A-10b
    if (window.AppRouter) AppRouter.navigate('/kundendetail-b2b');
}
window.openMaklerKundenDetail = openMaklerKundenDetail;

// Saved original HTML for restoration
var _origA02HeaderTabs = null;
var _origKundenTabs = null;
var _origStickyBarRight = null;
var _origDropdownHTML = null;
var _origA10Subtitle = null;
var _maklerDetailActive = false;

function fillMaklerDetail(kunde) {
    _maklerDetailActive = true;

    // ============================
    // 1) SHARED HEADER (top bar)
    // ============================
    var headerTitle = document.getElementById('kundenHeaderTitle');
    if (headerTitle) headerTitle.textContent = 'GS NRW';
    var headerId = document.getElementById('kundenHeaderId');
    if (headerId) {
        // Gesamte Subtitle-Zeile ersetzen (entfernt "| Aktiv"), wie bei A-02
        var headerSubtitle = headerId.parentElement;
        if (!_origA10Subtitle) _origA10Subtitle = headerSubtitle.innerHTML;
        headerSubtitle.innerHTML = '<span id="kundenHeaderId">Ecclesia Gruppe</span>';
    }

    // A-10 Header-Foto: Gebäude-Icon statt Personen-Placeholder
    var headerPhoto = document.getElementById('kundenHeaderPhoto');
    if (headerPhoto) {
        if (!headerPhoto._origHTML) headerPhoto._origHTML = headerPhoto.innerHTML;
        headerPhoto.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="1.5" width="22" height="22" style="margin:auto;display:block;"><path d="M3 21h18M5 21V7l8-4v18M13 21V3l6 3v15M9 9v.01M9 12v.01M9 15v.01M9 18v.01M17 9v.01M17 12v.01M17 15v.01M17 18v.01"/></svg>';
    }

    // Customer dropdown → institution selector
    var dropdown = document.querySelector('.kunden-switch-dropdown');
    if (dropdown) {
        if (!_origDropdownHTML) _origDropdownHTML = dropdown.innerHTML;
        var opts = maklerKunden.map(function(k) {
            var sel = k.id === kunde.id ? ' selected' : '';
            return '<option value="' + k.id + '"' + sel + '>' + k.name + ' (' + k.id + ')</option>';
        }).join('');
        dropdown.innerHTML = '<label>Institution:</label><select id="maklerKundenSwitchSelect" onchange="switchMaklerKundeDropdown(this.value)" style="font-weight:600;font-size:13px;color:#1e293b;border:1px solid #e2e8f0;border-radius:6px;padding:4px 8px;background:#fff;max-width:320px">' + opts + '</select>';
    }

    // ============================
    // 2) A-02 HEADER TABS → Makler tabs
    // ============================
    var a02Tabs = document.querySelector('#kundenDetailPage .agentur-header-tabs');
    if (a02Tabs) {
        if (!_origA02HeaderTabs) _origA02HeaderTabs = a02Tabs.innerHTML;
        a02Tabs.innerHTML =
            '<button class="agentur-tab" onclick="navigateToMaklerTab(\'uebersicht\')">' +
                '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg> Übersicht</button>' +
            '<button class="agentur-tab" onclick="navigateToMaklerTab(\'stammdaten\')">' +
                '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg> Stammdaten</button>' +
            '<button class="agentur-tab" onclick="navigateToMaklerTab(\'neugeschaeft\')">' +
                '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14"><line x1="12" y1="20" x2="12" y2="10"/><line x1="18" y1="20" x2="18" y2="4"/><line x1="6" y1="20" x2="6" y2="16"/></svg> Neugeschäft</button>' +
            '<button class="agentur-tab" onclick="navigateToMaklerTab(\'bestand\')">' +
                '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14"><path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/></svg> Bestand</button>' +
            '<button class="agentur-tab" onclick="navigateToMaklerTab(\'versicherermix\')">' +
                '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14"><circle cx="12" cy="12" r="10"/><path d="M12 2a10 10 0 0110 10"/><line x1="12" y1="12" x2="12" y2="2"/><line x1="12" y1="12" x2="22" y2="12"/></svg> Versicherer-Mix</button>' +
            '<button class="agentur-tab" onclick="navigateToMaklerTab(\'renewal\')">' +
                '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg> Renewals</button>' +
            '<button class="agentur-tab" onclick="navigateToMaklerTab(\'schaden\')">' +
                '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/></svg> Schäden</button>' +
            '<button class="agentur-tab" onclick="navigateToMaklerTab(\'deckungsluecken\')">' +
                '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg> Deckungslücken</button>' +
            '<div class="agentur-tab-divider"></div>' +
            '<button class="agentur-tab active" onclick="navigateToMaklerTab(\'kunden\')">' +
                '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg> Kunden</button>' +
            '<button class="agentur-tab" onclick="navigateToMaklerTab(\'potentiale\')">' +
                '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg> Potentiale</button>';
    }

    // ============================
    // 3) A-10 INNER TABS → B2B tabs
    // ============================
    var kundenTabs = document.querySelector('#kundenDetailPage .kunden-tabs');
    if (kundenTabs) {
        if (!_origKundenTabs) _origKundenTabs = kundenTabs.innerHTML;
        kundenTabs.innerHTML =
            '<button class="kunden-tab active" data-tab="stammdaten" onclick="switchKundenTab(\'stammdaten\')">' +
                '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg> Stammdaten</button>' +
            '<button class="kunden-tab" data-tab="vertraege" onclick="switchKundenTab(\'vertraege\')">' +
                '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/></svg> Verträge</button>' +
            '<button class="kunden-tab" data-tab="schadenhistorie" onclick="switchKundenTab(\'schadenhistorie\')">' +
                '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/></svg> Schadenhistorie</button>' +
            '<button class="kunden-tab" data-tab="deckungsluecken" onclick="switchKundenTab(\'deckungsluecken\')">' +
                '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg> Deckungslücken</button>' +
            '<button class="kunden-tab" data-tab="renewal" onclick="switchKundenTab(\'renewal\')">' +
                '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg> Renewal-Ampel</button>' +
            '<button class="kunden-tab" data-tab="ansprechpartner" onclick="switchKundenTab(\'ansprechpartner\')">' +
                '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg> Ansprechpartner</button>' +
            '<button class="kunden-tab" data-tab="b2bpotentiale" onclick="switchKundenTab(\'b2bpotentiale\')">' +
                '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg> Potentiale</button>';
    }

    // ============================
    // 4) NAME + ID + PHOTO
    // ============================
    var nameEl = document.getElementById('kundenName');
    if (nameEl) nameEl.textContent = kunde.name;
    var idEl = document.getElementById('kundenVermittlerId');
    if (idEl) idEl.textContent = kunde.id;

    // Foto → Platzhalter-Icon (Gebäude)
    var foto = document.querySelector('.kunden-foto');
    if (foto) {
        foto.style.background = '#94a3b8';
        foto.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="48" height="48" style="color:#fff"><path d="M3 21h18M5 21V7l8-4v18M13 21V3l6 3v15M9 9v.01M9 12v.01M9 15v.01M9 18v.01M17 9v.01M17 12v.01M17 15v.01M17 18v.01"/></svg>';
    }

    // ============================
    // 5) STAMMDATEN → Makler-Stammdaten
    // ============================
    var privatStamm = document.getElementById('privatStammdaten');
    var maklerStamm = document.getElementById('maklerStammdaten');
    if (privatStamm) privatStamm.style.display = 'none';
    if (maklerStamm) {
        maklerStamm.style.display = 'grid';
        document.getElementById('mkBranche').textContent = kunde.branche || '—';
        document.getElementById('mkSegment').textContent = kunde.segment || '—';
        document.getElementById('mkMitarbeitende').textContent = kunde.mitarbeitende ? kunde.mitarbeitende.toLocaleString('de-DE') : '—';
        document.getElementById('mkJahresumsatz').textContent = kunde.jahresumsatz || '—';
        document.getElementById('mkBetten').textContent = kunde.betten || '—';
        document.getElementById('mkStandorte').textContent = kunde.standorte || '—';
        document.getElementById('mkTraeger').textContent = kunde.traeger || '—';
        document.getElementById('mkKeyContact').textContent = kunde.keyContact || '—';
        document.getElementById('mkRisikoklasse').textContent = kunde.risikoklasse || '—';
        document.getElementById('mkKundeSeit').textContent = kunde.kundeSeit || '—';
        var rkEl = document.getElementById('mkRisikoklasse');
        if (rkEl) rkEl.className = 'info-value risikoklasse-badge rk-' + (kunde.risikoklasse || 'C').toLowerCase();
    }

    // ============================
    // 6) VERTRÄGE TAB - B2B Tabellenkopf
    // ============================
    var vertraegeTable = document.getElementById('betreuteVertraegeTable');
    if (vertraegeTable) {
        var thead = vertraegeTable.querySelector('thead tr');
        if (thead) thead.innerHTML = '<th>Sparte</th><th>Versicherer</th><th class="text-right">Prämie/a</th><th>Deckungssumme</th><th>SB</th><th>Ablauf</th><th>Schadenquote</th>';
    }
    var vertraegeBody = document.getElementById('kundenVertraege');
    if (vertraegeBody) {
        if (kunde.vertraegeDetail && kunde.vertraegeDetail.length > 0) {
            vertraegeBody.innerHTML = kunde.vertraegeDetail.map(function(v) {
                var sqClass = v.schadenquote === null ? '' : (v.schadenquote > 65 ? 'schaden-hoch' : (v.schadenquote > 50 ? 'schaden-mittel' : 'schaden-niedrig'));
                var sqText = v.schadenquote === null ? '—' : v.schadenquote + '%';
                return '<tr>' +
                    '<td><strong>' + v.sparte + '</strong></td>' +
                    '<td>' + v.versicherer + '</td>' +
                    '<td class="text-right">' + (v.praemie >= 1000000 ? (v.praemie / 1000000).toFixed(1) + ' Mio. €' : v.praemie.toLocaleString('de-DE') + ' €') + '</td>' +
                    '<td>' + v.deckungssumme + '</td>' +
                    '<td>' + v.sb + '</td>' +
                    '<td>' + v.ablauf + '</td>' +
                    '<td><span class="' + sqClass + '">' + sqText + '</span></td>' +
                    '</tr>';
            }).join('');
        } else {
            vertraegeBody.innerHTML = '<tr><td colspan="7" style="text-align:center;color:#94a3b8;padding:24px;">Keine Vertragsdaten hinterlegt</td></tr>';
        }
    }

    // ============================
    // 7) RENDER B2B TAB CONTENT
    // ============================
    // Schadenhistorie in eigenen Tab
    renderB2bSchadenhistorie(kunde);
    // Deckungslücken in eigenen Tab
    renderB2bDeckungsluecken(kunde);
    // Renewal-Ampel in eigenen Tab
    renderB2bRenewal(kunde);
    // Ansprechpartner
    renderB2bAnsprechpartner(kunde);
    // Potentiale
    renderB2bPotentiale(kunde);

    // ============================
    // 8) HIDE AO-ONLY ELEMENTS
    // ============================
    // NPS/Scores ausblenden
    var npsWrapper = document.getElementById('kundenNpsWrapper');
    if (npsWrapper) { var npsItem = npsWrapper.closest('.info-item'); if (npsItem) npsItem.style.display = 'none'; }
    ['kundenRisikoscore', 'kundenBonitaetsscore', 'kundenTiere', 'kundenArbeitgeber', 'kundenBeschaeftigtSeit'].forEach(function(id) {
        var el = document.getElementById(id);
        if (el) { var item = el.closest('.info-item'); if (item) item.style.display = 'none'; }
    });
    var clvCard = document.getElementById('clvDetailCard');
    if (clvCard) clvCard.style.display = 'none';
    var clvBadge = document.getElementById('clvHeaderBadge');
    if (clvBadge) clvBadge.style.display = 'none';

    // Hide old Makler cards in Stammdaten (they now have their own tabs)
    var schadenCard = document.getElementById('maklerSchadenCard');
    if (schadenCard) schadenCard.style.display = 'none';
    var dlCard = document.getElementById('maklerDeckungslueckenCard');
    if (dlCard) dlCard.style.display = 'none';
    var renewalCard = document.getElementById('maklerRenewalCard');
    if (renewalCard) renewalCard.style.display = 'none';

    // ============================
    // 9) STICKY BAR → B2B KPIs
    // ============================
    updateMaklerStickyBar(kunde);

    // ============================
    // 10) ACTIVATE STAMMDATEN TAB
    // ============================
    if (typeof switchKundenTab === 'function') switchKundenTab('stammdaten');
}

function updateMaklerStickyBar(kunde) {
    // Sticky-Bar Icon: Gebäude statt Person für B2B
    var stickyBarLeft = document.querySelector('.kunde-sticky-bar-left');
    if (stickyBarLeft) {
        var stickyIcon = stickyBarLeft.querySelector('svg');
        if (stickyIcon) {
            stickyIcon.innerHTML = '<path d="M3 21h18M5 21V7l8-4v18M13 21V3l6 3v15M9 9v.01M9 12v.01M9 15v.01M9 18v.01M17 9v.01M17 12v.01M17 15v.01M17 18v.01"/>';
            stickyIcon.setAttribute('stroke-width', '1.5');
        }
    }

    var nameEl = document.getElementById('kundeBarNameB');
    if (nameEl) nameEl.textContent = kunde.name;
    var idEl = document.getElementById('kundeBarIdB');
    if (idEl) idEl.textContent = kunde.id;

    // Replace NPS with Segment
    var npsLabel = document.querySelector('#kundenDetailPage .kunde-sticky-kpi:nth-child(1) .kunde-sticky-kpi-label');
    var npsEl = document.getElementById('kundeBarNpsB');
    if (npsLabel) npsLabel.textContent = 'Segment';
    if (npsEl) npsEl.innerHTML = '<span class="makler-segment-badge-sm">' + kunde.segmentIcon + ' ' + kunde.segment + '</span>';

    // Replace CLV with Prämienvolumen
    var clvLabel = document.querySelector('#kundenDetailPage .kunde-sticky-kpi:nth-child(2) .kunde-sticky-kpi-label');
    var clvEl = document.getElementById('kundeBarClvB');
    if (clvLabel) clvLabel.textContent = 'Prämie';
    if (clvEl) clvEl.textContent = kunde.praemieDisplay;

    // Replace Segment with Deckungsquote
    var segLabel = document.querySelector('#kundenDetailPage .kunde-sticky-kpi:nth-child(3) .kunde-sticky-kpi-label');
    var segEl = document.getElementById('kundeBarSegmentB');
    if (segLabel) segLabel.textContent = 'Deckung';
    if (segEl) segEl.textContent = kunde.deckungsquote + '%';
}

// Restore AO kundenDetail state
function restoreAOKundenDetail() {
    if (!_maklerDetailActive) return;
    _maklerDetailActive = false;

    var a02Tabs = document.querySelector('#kundenDetailPage .agentur-header-tabs');
    if (a02Tabs && _origA02HeaderTabs) a02Tabs.innerHTML = _origA02HeaderTabs;

    var kundenTabs = document.querySelector('#kundenDetailPage .kunden-tabs');
    if (kundenTabs && _origKundenTabs) kundenTabs.innerHTML = _origKundenTabs;

    var dropdown = document.querySelector('.kunden-switch-dropdown');
    if (dropdown && _origDropdownHTML) dropdown.innerHTML = _origDropdownHTML;

    // Restore A-10 subtitle
    var headerId = document.getElementById('kundenHeaderId');
    if (headerId && _origA10Subtitle) headerId.parentElement.innerHTML = _origA10Subtitle;

    // Restore A-10 header photo
    var headerPhoto = document.getElementById('kundenHeaderPhoto');
    if (headerPhoto && headerPhoto._origHTML) {
        headerPhoto.innerHTML = headerPhoto._origHTML;
    }

    // Restore sticky bar labels
    var npsLabel = document.querySelector('#kundenDetailPage .kunde-sticky-kpi:nth-child(1) .kunde-sticky-kpi-label');
    if (npsLabel) npsLabel.textContent = 'NPS';
    var clvLabel = document.querySelector('#kundenDetailPage .kunde-sticky-kpi:nth-child(2) .kunde-sticky-kpi-label');
    if (clvLabel) clvLabel.textContent = 'CLV';
    var segLabel = document.querySelector('#kundenDetailPage .kunde-sticky-kpi:nth-child(3) .kunde-sticky-kpi-label');
    if (segLabel) segLabel.textContent = 'Segment';

    // Restore sticky bar icon (Personen-SVG für AO)
    var stickyBarLeft = document.querySelector('.kunde-sticky-bar-left');
    if (stickyBarLeft) {
        var stickyIcon = stickyBarLeft.querySelector('svg');
        if (stickyIcon) {
            stickyIcon.innerHTML = '<path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"></path><circle cx="12" cy="7" r="4"></circle>';
            stickyIcon.setAttribute('stroke-width', '2');
        }
    }

    // Restore foto background (B2B sets grey, AO uses CSS default)
    var foto = document.querySelector('.kunden-foto');
    if (foto) foto.style.background = '';

    // Restore hidden AO elements
    var privatStamm = document.getElementById('privatStammdaten');
    if (privatStamm) privatStamm.style.display = '';
    var maklerStamm = document.getElementById('maklerStammdaten');
    if (maklerStamm) maklerStamm.style.display = 'none';

    var clvCard = document.getElementById('clvDetailCard');
    if (clvCard) clvCard.style.display = '';
    var clvBadge = document.getElementById('clvHeaderBadge');
    if (clvBadge) clvBadge.style.display = '';

    // Show AO-specific tabs
    document.querySelectorAll('.kunden-tab').forEach(function(tab) { tab.style.display = ''; });
}
window.restoreAOKundenDetail = restoreAOKundenDetail;

// Navigate from A-10b back to A-02b Makler tab
function navigateToMaklerTab(tabName) {
    document.getElementById('kundenDetailPage').style.display = 'none';
    var agenturOverview = document.getElementById('agenturOverview');
    if (agenturOverview) agenturOverview.style.display = 'block';
    if (typeof showMaklerTab === 'function') showMaklerTab(tabName);
    document.dispatchEvent(new CustomEvent('viewChanged', { detail: { module: 'versicherung', view: 'agentursicht-b2b' } }));
    if (window.AppRouter) AppRouter.navigate('/agentur-b2b');
}
window.navigateToMaklerTab = navigateToMaklerTab;

// Switch Makler customer from dropdown on A-10
function switchMaklerKundeDropdown(kundeId) {
    if (!kundeId) return;
    openMaklerKundenDetail(kundeId);
}
window.switchMaklerKundeDropdown = switchMaklerKundeDropdown;

// ========================================
// SCHADENHISTORIE RENDERING
// ========================================
function renderMaklerSchadenhistorie(kunde) {
    var container = document.getElementById('maklerSchadenContent');
    if (!container || !kunde.schadenhistorie) { if (container) container.innerHTML = '<p class="text-muted">Keine Schadenhistorie vorhanden.</p>'; return; }

    var rows = kunde.schadenhistorie.map(function(s) {
        var qClass = s.quote > 65 ? 'schaden-hoch' : (s.quote > 50 ? 'schaden-mittel' : 'schaden-niedrig');
        return '<tr><td><strong>' + s.jahr + '</strong></td><td>' + s.anzahl + '</td>' +
            '<td class="text-right">' + s.volumen.toLocaleString('de-DE') + ' €</td>' +
            '<td><span class="' + qClass + '">' + s.quote + '%</span></td>' +
            '<td>' + s.groesster + '</td></tr>';
    }).join('');

    container.innerHTML = '<table class="makler-detail-table"><thead><tr><th>Jahr</th><th>Anzahl</th><th>Volumen</th><th>Quote</th><th>Größter Einzelschaden</th></tr></thead><tbody>' + rows + '</tbody></table>';
}

// ========================================
// DECKUNGSLÜCKEN RENDERING
// ========================================
function renderMaklerDeckungsluecken(kunde) {
    var container = document.getElementById('maklerDeckungslueckenContent');
    if (!container || !kunde.deckungsluecken) { if (container) container.innerHTML = '<p class="text-muted">Keine Deckungslücken identifiziert.</p>'; return; }

    var rows = kunde.deckungsluecken.map(function(d) {
        var pClass = d.prioritaet === 'Hoch' ? 'prio-hoch' : (d.prioritaet === 'Mittel' ? 'prio-mittel' : 'prio-niedrig');
        return '<tr><td><strong>' + d.risiko + '</strong></td>' +
            '<td><span class="status-badge-dl">' + d.status + '</span></td>' +
            '<td>' + d.empfehlung + '</td>' +
            '<td><span class="prio-badge ' + pClass + '">' + d.prioritaet + '</span></td></tr>';
    }).join('');

    container.innerHTML = '<table class="makler-detail-table"><thead><tr><th>Risiko</th><th>Status</th><th>Empfehlung</th><th>Priorität</th></tr></thead><tbody>' + rows + '</tbody></table>';
}

// ========================================
// RENEWAL-AMPEL RENDERING
// ========================================
function renderMaklerRenewalAmpel(kunde) {
    var container = document.getElementById('maklerRenewalContent');
    if (!container || !kunde.vertraegeDetail) return;

    var now = new Date();
    var d30 = new Date(now); d30.setDate(d30.getDate() + 30);
    var d90 = new Date(now); d90.setDate(d90.getDate() + 90);
    var d180 = new Date(now); d180.setDate(d180.getDate() + 180);

    var rot = [], gelb = [], gruen = [];
    kunde.vertraegeDetail.forEach(function(v) {
        if (v.ablauf === 'unbefristet') return;
        var parts = v.ablauf.split('.');
        var ablauf = new Date(parts[2], parseInt(parts[1]) - 1, parseInt(parts[0]));
        var item = { sparte: v.sparte, versicherer: v.versicherer, praemie: v.praemie, ablauf: v.ablauf };
        if (ablauf <= d30) rot.push(item);
        else if (ablauf <= d90) gelb.push(item);
        else if (ablauf <= d180) gruen.push(item);
    });

    function renderGroup(label, items, cssClass) {
        if (items.length === 0) return '<div class="renewal-group"><div class="renewal-group-label ' + cssClass + '">' + label + ' (0)</div></div>';
        var rows = items.map(function(i) {
            return '<div class="renewal-item"><span class="renewal-sparte">' + i.sparte + '</span><span class="renewal-versicherer">' + i.versicherer + '</span><span class="renewal-ablauf">' + i.ablauf + '</span></div>';
        }).join('');
        return '<div class="renewal-group"><div class="renewal-group-label ' + cssClass + '">' + label + ' (' + items.length + ')</div>' + rows + '</div>';
    }

    container.innerHTML = renderGroup('Nächste 30 Tage', rot, 'renewal-rot') +
        renderGroup('31 - 90 Tage', gelb, 'renewal-gelb') +
        renderGroup('91 - 180 Tage', gruen, 'renewal-gruen');
}

// ========================================
// VERSICHERER-MIX (Donut für A-02)
// ========================================
function renderVersichererMix() {
    var container = document.getElementById('maklerVersichererContent');
    if (!container) return;

    var mix = [
        { name: 'Allianz', anteil: 22, color: '#003781' },
        { name: 'HDI', anteil: 18, color: '#00843D' },
        { name: 'Zurich', anteil: 15, color: '#1D71B8' },
        { name: 'R+V', anteil: 12, color: '#E30613' },
        { name: 'EGAS', anteil: 10, color: '#8B5CF6' },
        { name: 'AXA', anteil: 8, color: '#00008F' },
        { name: 'Sonstige', anteil: 15, color: '#94a3b8' }
    ];

    var svgSize = 160, cx = 80, cy = 80, r = 65;
    var circ = 2 * Math.PI * r;
    var offset = 0;
    var paths = '';
    mix.forEach(function(v) {
        var dash = (v.anteil / 100) * circ;
        paths += '<circle cx="'+cx+'" cy="'+cy+'" r="'+r+'" fill="none" stroke="'+v.color+'" stroke-width="18" stroke-dasharray="'+dash+' '+(circ-dash)+'" stroke-dashoffset="'+(-offset)+'" transform="rotate(-90 '+cx+' '+cy+')"/>';
        offset += dash;
    });
    var donut = '<svg width="'+svgSize+'" height="'+svgSize+'" viewBox="0 0 '+svgSize+' '+svgSize+'">'+paths+
        '<text x="'+cx+'" y="'+(cy-2)+'" text-anchor="middle" font-size="13" font-weight="700" fill="#1e293b">68,5 Mio.</text>' +
        '<text x="'+cx+'" y="'+(cy+14)+'" text-anchor="middle" font-size="10" fill="#94a3b8">Bestand</text></svg>';

    var legend = mix.map(function(v) {
        return '<div class="versicherer-legend-item"><span class="bezahlen-legend-dot" style="background:'+v.color+'"></span><span class="bezahlen-legend-label">'+v.name+'</span><span class="bezahlen-legend-value">'+v.anteil+'%</span></div>';
    }).join('');

    container.innerHTML = '<div class="bezahlen-donut-container"><div class="bezahlen-donut-chart">'+donut+'</div><div class="bezahlen-donut-legend">'+legend+'</div></div>';
}
window.renderVersichererMix = renderVersichererMix;
window.__registerModule('makler-kunden.js');
