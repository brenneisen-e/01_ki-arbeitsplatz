// A-10 KUNDEN-DETAIL (MRH Modus)
// ========================================
var _mrhDetailActive = false;
var _origA02HeaderTabsMRH = null;
var _origKundenTabsMRH = null;
var _origDropdownMRH = null;
var _origA10SubtitleMRH = null;

function openMRHKundenDetail(kundeId) {
    var kunde = mrhKunden.find(function(k) { return k.id === kundeId; });
    if (!kunde) return;

    if (typeof previousViewBeforeKundenDetail !== 'undefined') {
        previousViewBeforeKundenDetail = 'agentursicht';
    }

    // Clean up any prior B2B/AO kundendetail state before applying MRH
    if (typeof restoreAOKundenDetail === 'function') restoreAOKundenDetail();

    // Hide all pages
    ['landingPage','mainApp','potentialAnalysePage','agenturOverview'].forEach(function(id) {
        var el = document.getElementById(id);
        if (el) el.style.display = 'none';
    });

    var kundenDetailPage = document.getElementById('kundenDetailPage');
    if (kundenDetailPage) {
        kundenDetailPage.style.display = 'block';
        kundenDetailPage.classList.remove('makler-view','ao-view');
        kundenDetailPage.classList.add('makler-view');
    }

    fillMRHDetail(kunde);

    // Force page ID to A-10c via multiple mechanisms
    if (typeof PageIDTracker !== 'undefined') PageIDTracker.setPageId('A-10c');
    document.dispatchEvent(new CustomEvent('viewChanged', { detail: { module: 'versicherung', view: 'kundendetail-mrh' } }));
    if (window.AppRouter) AppRouter.navigate('/kundendetail-gewerbe');

    // Ensure sticky bar, CLV hiding, and page ID persist after any async resets
    setTimeout(function() {
        updateMRHStickyBar(kunde);
        var clvCard = document.getElementById('clvDetailCard');
        if (clvCard) clvCard.style.display = 'none';
        var clvBadge = document.getElementById('clvHeaderBadge');
        if (clvBadge) clvBadge.style.display = 'none';
        if (typeof PageIDTracker !== 'undefined') PageIDTracker.setPageId('A-10c');
    }, 300);
}
window.openMRHKundenDetail = openMRHKundenDetail;

function fillMRHDetail(kunde) {
    _mrhDetailActive = true;

    // 1) Shared header
    var headerTitle = document.getElementById('kundenHeaderTitle');
    if (headerTitle) headerTitle.textContent = 'Niederlassung Rhein-Main';
    var headerId = document.getElementById('kundenHeaderId');
    if (headerId) {
        var headerSubtitle = headerId.parentElement;
        if (!_origA10SubtitleMRH) _origA10SubtitleMRH = headerSubtitle.innerHTML;
        headerSubtitle.innerHTML = '<span id="kundenHeaderId">Gewerbemakler 360°</span>';
    }

    // Photo
    var headerPhoto = document.getElementById('kundenHeaderPhoto');
    if (headerPhoto) {
        if (!headerPhoto._origHTML) headerPhoto._origHTML = headerPhoto.innerHTML;
        headerPhoto.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="1.5" width="22" height="22" style="margin:auto;display:block;"><path d="M3 21h18M5 21V7l8-4v18M13 21V3l6 3v15"/><circle cx="18" cy="8" r="3" fill="rgba(134,188,37,0.8)" stroke="none"/><text x="18" y="9.5" text-anchor="middle" font-size="4" fill="white" stroke="none" font-weight="bold">360</text></svg>';
    }

    // Customer dropdown
    var dropdown = document.querySelector('.kunden-switch-dropdown');
    if (dropdown) {
        if (!_origDropdownMRH) _origDropdownMRH = dropdown.innerHTML;
        var opts = mrhKunden.map(function(k) {
            var sel = k.id === kunde.id ? ' selected' : '';
            var label = k.typ === 'Privat' ? k.name + ' (Privat)' : k.name;
            return '<option value="' + k.id + '"' + sel + '>' + label + '</option>';
        }).join('');
        dropdown.innerHTML = '<label>Kunde:</label><select id="mrhKundenSwitchSelect" onchange="switchMRHKundeDropdown(this.value)" style="font-weight:600;font-size:13px;color:#1e293b;border:1px solid #e2e8f0;border-radius:6px;padding:4px 8px;background:#fff;max-width:320px">' + opts + '</select>';
    }

    // 2) A-02 header tabs → MRH tabs (navigate back) – same structure as B2B
    var a02Tabs = document.querySelector('#kundenDetailPage .agentur-header-tabs');
    if (a02Tabs) {
        if (!_origA02HeaderTabsMRH) _origA02HeaderTabsMRH = a02Tabs.innerHTML;
        a02Tabs.innerHTML =
            '<button class="agentur-tab" onclick="navigateToMRHTab(\'uebersicht\')">' +
                '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg> Übersicht</button>' +
            '<button class="agentur-tab" onclick="navigateToMRHTab(\'stammdaten\')">' +
                '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg> Stammdaten</button>' +
            '<button class="agentur-tab" onclick="navigateToMRHTab(\'neugeschaeft\')">' +
                '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14"><line x1="12" y1="20" x2="12" y2="10"/><line x1="18" y1="20" x2="18" y2="4"/><line x1="6" y1="20" x2="6" y2="16"/></svg> Neugeschäft</button>' +
            '<button class="agentur-tab" onclick="navigateToMRHTab(\'bestand\')">' +
                '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14"><path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/></svg> Bestand</button>' +
            '<button class="agentur-tab" onclick="navigateToMRHTab(\'versicherermix\')">' +
                '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14"><circle cx="12" cy="12" r="10"/><path d="M12 2a10 10 0 0110 10"/><line x1="12" y1="12" x2="12" y2="2"/><line x1="12" y1="12" x2="22" y2="12"/></svg> Versicherer-Mix</button>' +
            '<button class="agentur-tab" onclick="navigateToMRHTab(\'renewal\')">' +
                '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg> Renewals</button>' +
            '<button class="agentur-tab" onclick="navigateToMRHTab(\'schaden\')">' +
                '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/></svg> Schäden</button>' +
            '<button class="agentur-tab" onclick="navigateToMRHTab(\'deckungsluecken\')">' +
                '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg> Deckungslücken</button>' +
            '<div class="agentur-tab-divider"></div>' +
            '<button class="agentur-tab active" onclick="navigateToMRHTab(\'kunden\')">' +
                '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg> Kunden</button>' +
            '<button class="agentur-tab" onclick="navigateToMRHTab(\'potentiale\')">' +
                '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg> Potentiale</button>';
    }

    // 3) Inner tabs for MRH – same structure as B2B with SVG icons
    var kundenTabs = document.querySelector('#kundenDetailPage .kunden-tabs');
    if (kundenTabs) {
        if (!_origKundenTabsMRH) _origKundenTabsMRH = kundenTabs.innerHTML;
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

    // 4) Name, ID, Photo
    var nameEl = document.getElementById('kundenName');
    if (nameEl) nameEl.textContent = kunde.name;
    var idEl = document.getElementById('kundenVermittlerId');
    if (idEl) idEl.textContent = kunde.id;

    var foto = document.querySelector('.kunden-foto');
    if (foto) {
        foto.style.background = kunde.typ === 'Privat' ? '#64748b' : '#0076A8';
        var icon = kunde.specialtyIcon || mrhSpecialtyIcons.privatkunde;
        foto.innerHTML = '<div style="display:flex;align-items:center;justify-content:center;width:100%;height:100%;color:white">' +
            '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="48" height="48" style="color:#fff">' + icon.replace(/<svg[^>]*>/, '').replace(/<\/svg>/, '') + '</svg></div>';
    }

    // 5) Stammdaten: hide private + B2B, show MRH-specific stammdaten
    var privatStamm = document.getElementById('privatStammdaten');
    var maklerStamm = document.getElementById('maklerStammdaten');
    var mrhStamm = document.getElementById('mrhStammdatenA10');
    if (privatStamm) privatStamm.style.display = 'none';
    if (maklerStamm) maklerStamm.style.display = 'none';
    if (mrhStamm) {
        mrhStamm.style.display = 'grid';
        var s = function(id, val) { var el = document.getElementById(id); if (el) el.textContent = val || '—'; };
        s('mrhBranche', kunde.branche);
        s('mrhSpecialty', kunde.specialty);
        s('mrhMitarbeitende', kunde.mitarbeitende ? kunde.mitarbeitende.toLocaleString('de-DE') : null);
        s('mrhJahresumsatz', kunde.jahresumsatz);
        s('mrhStandorte', kunde.standorte);
        s('mrhGesellschaftsform', kunde.gesellschaftsform);
        s('mrhEigentuemer', kunde.eigentuemer);
        s('mrhKeyContacts', (kunde.keyContacts || []).join(', '));
        s('mrhBeziehung', kunde.beziehungsstatus);
        s('mrhBeraterIns', kunde.beraterInsurance);
        s('mrhBeraterBen', kunde.beraterBenefits);
        s('mrhBeraterFin', kunde.beraterFinance);
    }

    // 6) Inject 3-Säulen-Karten above stammdaten-card (outside kunden-stammdaten to preserve 2-col layout)
    var stammdatenCard = mrhStamm ? mrhStamm.closest('.stammdaten-card') : null;
    var existingSaeulen = document.getElementById('mrhA10SaeulenGrid');
    if (existingSaeulen) existingSaeulen.remove();

    if (stammdatenCard) {
        var saeulenHtml = '<div class="mrh-a10-saeulen-grid" id="mrhA10SaeulenGrid">' +
            '<div class="mrh-a10-saeulen-card insurance">' +
                '<h5><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg> Insurance</h5>' +
                '<div class="mrh-a10-saeulen-metric"><span class="label">Prämie</span><span class="value">' + kunde.insurance.praemieDisplay + '</span></div>' +
                '<div class="mrh-a10-saeulen-metric"><span class="label">Verträge</span><span class="value">' + kunde.insurance.vertraege + '</span></div>' +
                '<div class="mrh-a10-saeulen-metric"><span class="label">Renewal</span><span class="value">' + kunde.insurance.renewalDate + '</span></div>' +
            '</div>' +
            '<div class="mrh-a10-saeulen-card benefits' + (!kunde.benefits.aktiv ? ' inactive' : '') + '">' +
                '<h5><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/></svg> Benefits</h5>' +
                '<div class="mrh-a10-saeulen-metric"><span class="label">bAV-Volumen</span><span class="value">' + (kunde.benefits.bavVolumen || '—') + '</span></div>' +
                '<div class="mrh-a10-saeulen-metric"><span class="label">Durchdringung</span><span class="value">' + (kunde.benefits.durchdringung || '—') + '</span></div>' +
                '<div class="mrh-a10-saeulen-metric"><span class="label">Status</span><span class="value">' + (kunde.benefits.aktiv ? 'Aktiv' : 'Kein Mandat') + '</span></div>' +
            '</div>' +
            '<div class="mrh-a10-saeulen-card finance' + (!kunde.finance.aktiv ? ' inactive' : '') + '">' +
                '<h5><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14"><path d="M18 5a8 8 0 00-12 7 8 8 0 0012 7"/><line x1="4" y1="10" x2="16" y2="10"/><line x1="4" y1="14" x2="16" y2="14"/></svg> Finance</h5>' +
                '<div class="mrh-a10-saeulen-metric"><span class="label">Kreditvers.</span><span class="value">' + (kunde.finance.kreditvers || '—') + '</span></div>' +
                '<div class="mrh-a10-saeulen-metric"><span class="label">Leasing</span><span class="value">' + (kunde.finance.leasing || '—') + '</span></div>' +
                '<div class="mrh-a10-saeulen-metric"><span class="label">Courtage</span><span class="value">' + (kunde.finance.courtage || '—') + '</span></div>' +
            '</div>' +
        '</div>';
        stammdatenCard.insertAdjacentHTML('beforebegin', saeulenHtml);
    }

    // 7) Verträge table
    var vertraegeBody = document.getElementById('kundenVertraege');
    var vertraegeTable = document.getElementById('betreuteVertraegeTable');
    if (vertraegeTable) {
        var thead = vertraegeTable.querySelector('thead tr');
        if (thead) thead.innerHTML = '<th>Sparte</th><th>Versicherer</th><th class="text-right">Prämie/a</th><th>DS</th><th>Ablauf</th><th>Säule</th>';
    }
    if (vertraegeBody) {
        if (kunde.vertraegeDetail && kunde.vertraegeDetail.length > 0) {
            vertraegeBody.innerHTML = kunde.vertraegeDetail.map(function(v) {
                var saeuleClass = v.saeule === 'I' ? 'insurance' : (v.saeule === 'B' ? 'benefits' : 'finance');
                return '<tr><td><strong>' + v.sparte + '</strong></td><td>' + v.versicherer + '</td>' +
                    '<td class="text-right">' + (v.praemie > 0 ? v.praemie.toLocaleString('de-DE') + ' €' : '—') + '</td>' +
                    '<td>' + v.ds + '</td><td>' + v.ablauf + '</td>' +
                    '<td><span class="mrh-saeulen-tag ' + saeuleClass + '">' + v.saeule + '</span></td></tr>';
            }).join('');
        } else {
            vertraegeBody.innerHTML = '<tr><td colspan="6" class="text-muted">Keine Vertragsdaten</td></tr>';
        }
    }

    // 8) Render B2B tab content (reuse existing renderers where possible)
    try {
        if (typeof renderB2bSchadenhistorie === 'function') {
            var schadenData = { schadenhistorie: (kunde.schadenhistorie || []).map(function(s) { return { jahr: s.jahr, anzahl: 1, volumen: s.betrag, quote: 0, groesster: s.beschreibung }; }) };
            renderB2bSchadenhistorie(schadenData);
        }
        if (typeof renderB2bDeckungsluecken === 'function') {
            var dlData = { deckungsluecken: (kunde.deckungsluecken || []).map(function(d) { return { risiko: d, status: 'Nicht versichert', empfehlung: 'Prüfung empfohlen', prioritaet: 'Hoch' }; }) };
            renderB2bDeckungsluecken(dlData);
        }
        if (typeof renderB2bRenewal === 'function') {
            var renewalData = { vertraegeDetail: (kunde.vertraegeDetail || []).map(function(v) { return { sparte: v.sparte, versicherer: v.versicherer, praemie: v.praemie, ablauf: v.ablauf }; }) };
            renderB2bRenewal(renewalData);
        }
        if (typeof renderB2bAnsprechpartner === 'function') {
            renderB2bAnsprechpartner({ name: kunde.name, segment: kunde.specialty, keyContact: (kunde.keyContacts || [])[0], keyContacts: kunde.keyContacts, beraterInsurance: kunde.beraterInsurance, beraterBenefits: kunde.beraterBenefits, beraterFinance: kunde.beraterFinance });
        }
    } catch(e) { console.warn('MRH: B2B tab render error (non-critical):', e); }
    // Cross-Sell Potentials in b2bpotentiale tab (use B2B renderer for expandable rows)
    try {
        if (typeof renderB2bPotentiale === 'function') {
            var standorteCount = (kunde.standorte || '').split(',').length;
            renderB2bPotentiale({
                deckungsluecken: (kunde.deckungsluecken || []).map(function(d) { return { risiko: d, status: 'Nicht versichert', empfehlung: 'Prüfung empfohlen', prioritaet: 'Hoch' }; }),
                praemie: kunde.insurance ? kunde.insurance.praemie : 0,
                segment: kunde.specialty || '',
                mitarbeitende: kunde.mitarbeitende || 0,
                vertraegeDetail: kunde.vertraegeDetail || [],
                standorte: standorteCount
            });
        }
    } catch(e) { console.warn('MRH: Potentiale render error (non-critical):', e); }

    // Render Relationship Timeline into Ansprechpartner tab
    var apContent = document.getElementById('b2bAnsprechpartnerContent');
    if (apContent && kunde.timeline && kunde.timeline.length > 0) {
        var timelineHtml = '<h4 style="margin-top:20px;font-size:14px;font-weight:700;color:#1e293b">Relationship-Timeline</h4><div class="mrh-timeline">';
        kunde.timeline.forEach(function(t) {
            timelineHtml += '<div class="mrh-timeline-item ' + t.saeule + '">' +
                '<div class="mrh-timeline-date">' + t.datum + '</div>' +
                '<div class="mrh-timeline-text">' + t.text + '</div>' +
                '<div class="mrh-timeline-person">' + t.person + '</div>' +
            '</div>';
        });
        timelineHtml += '</div>';
        apContent.innerHTML += timelineHtml;
    }

    // 9) Hide AO-only elements
    var npsWrapper = document.getElementById('kundenNpsWrapper');
    if (npsWrapper) { var npsItem = npsWrapper.closest('.info-item'); if (npsItem) npsItem.style.display = 'none'; }
    ['kundenRisikoscore','kundenBonitaetsscore','kundenTiere','kundenArbeitgeber','kundenBeschaeftigtSeit'].forEach(function(id) {
        var el = document.getElementById(id);
        if (el) { var item = el.closest('.info-item'); if (item) item.style.display = 'none'; }
    });
    var clvCard = document.getElementById('clvDetailCard');
    if (clvCard) clvCard.style.display = 'none';
    var clvBadge = document.getElementById('clvHeaderBadge');
    if (clvBadge) clvBadge.style.display = 'none';
    var schadenCard = document.getElementById('maklerSchadenCard');
    if (schadenCard) schadenCard.style.display = 'none';
    var dlCard = document.getElementById('maklerDeckungslueckenCard');
    if (dlCard) dlCard.style.display = 'none';
    var renewalCard = document.getElementById('maklerRenewalCard');
    if (renewalCard) renewalCard.style.display = 'none';

    // 10) Default tab
    if (typeof switchKundenTab === 'function') switchKundenTab('stammdaten');

    // 11) Sticky bar – update last to ensure no other function resets it
    updateMRHStickyBar(kunde);
    // Also set after a short delay in case other scripts reset the values
    setTimeout(function() { updateMRHStickyBar(kunde); }, 100);
}

function updateMRHStickyBar(kunde) {
    var nameEl = document.getElementById('kundeBarNameB');
    if (nameEl) nameEl.textContent = kunde.name;
    var idEl = document.getElementById('kundeBarIdB');
    if (idEl) idEl.textContent = kunde.id;

    // Update labels and values via parent container to avoid nth-child issues
    var stickyBar = document.getElementById('kundeOptionB');
    if (stickyBar) {
        var kpis = stickyBar.querySelectorAll('.kunde-sticky-kpi');
        if (kpis[0]) {
            var label0 = kpis[0].querySelector('.kunde-sticky-kpi-label');
            if (label0) label0.textContent = 'Specialty';
            var npsEl = document.getElementById('kundeBarNpsB');
            if (npsEl) npsEl.innerHTML = '<span class="mrh-specialty-badge ' + (kunde.specialtyClass || '') + '" style="font-size:10px">' + (kunde.specialtyIcon || '') + ' ' + (kunde.specialty || '') + '</span>';
        }
        if (kpis[1]) {
            var label1 = kpis[1].querySelector('.kunde-sticky-kpi-label');
            if (label1) label1.textContent = 'Prämie';
            var clvEl = document.getElementById('kundeBarClvB');
            if (clvEl) clvEl.textContent = kunde.insurance ? kunde.insurance.praemieDisplay : '—';
        }
        if (kpis[2]) {
            var label2 = kpis[2].querySelector('.kunde-sticky-kpi-label');
            if (label2) label2.textContent = 'Säulen';
            var segEl = document.getElementById('kundeBarSegmentB');
            if (segEl) {
                var tags = '<span class="mrh-saeulen-tag insurance">I</span>';
                if (kunde.benefits && kunde.benefits.aktiv) tags += '<span class="mrh-saeulen-tag benefits">B</span>';
                if (kunde.finance && kunde.finance.aktiv) tags += '<span class="mrh-saeulen-tag finance">F</span>';
                segEl.innerHTML = tags;
            }
        }
    }
}

// Restore MRH detail
function restoreMRHKundenDetail() {
    if (!_mrhDetailActive) return;
    _mrhDetailActive = false;

    var a02Tabs = document.querySelector('#kundenDetailPage .agentur-header-tabs');
    if (a02Tabs && _origA02HeaderTabsMRH) a02Tabs.innerHTML = _origA02HeaderTabsMRH;
    var kundenTabs = document.querySelector('#kundenDetailPage .kunden-tabs');
    if (kundenTabs && _origKundenTabsMRH) kundenTabs.innerHTML = _origKundenTabsMRH;
    var dropdown = document.querySelector('.kunden-switch-dropdown');
    if (dropdown && _origDropdownMRH) dropdown.innerHTML = _origDropdownMRH;
    var headerId = document.getElementById('kundenHeaderId');
    if (headerId && _origA10SubtitleMRH) headerId.parentElement.innerHTML = _origA10SubtitleMRH;
    var headerPhoto = document.getElementById('kundenHeaderPhoto');
    if (headerPhoto && headerPhoto._origHTML) headerPhoto.innerHTML = headerPhoto._origHTML;

    var saeulen = document.getElementById('mrhA10SaeulenGrid');
    if (saeulen) saeulen.remove();

    // Hide MRH-specific stammdaten
    var mrhStamm = document.getElementById('mrhStammdatenA10');
    if (mrhStamm) mrhStamm.style.display = 'none';

    var foto = document.querySelector('.kunden-foto');
    if (foto) foto.style.background = '';
}
window.restoreMRHKundenDetail = restoreMRHKundenDetail;

function navigateToMRHTab(tabName) {
    document.getElementById('kundenDetailPage').style.display = 'none';
    var agenturOverview = document.getElementById('agenturOverview');
    if (agenturOverview) agenturOverview.style.display = 'block';
    showMRHTab(tabName);
    document.dispatchEvent(new CustomEvent('viewChanged', { detail: { module: 'versicherung', view: 'agentursicht-mrh' } }));
    if (window.AppRouter) AppRouter.navigate('/agentur-gewerbe');
}
window.navigateToMRHTab = navigateToMRHTab;

function switchMRHKundeDropdown(kundeId) {
    if (!kundeId) return;
    openMRHKundenDetail(kundeId);
}
window.switchMRHKundeDropdown = switchMRHKundeDropdown;

// ========================================
// INIT: Restore viewMode from localStorage
// ========================================
(function() {
    var saved = safeLocalGet('viewMode', null);
    if (saved && (saved === 'ao' || saved === 'ecclesia' || saved === 'mrh')) {
        viewMode = saved;
    }
    var savedFinance = safeLocalGet('financeMode', null);
    if (savedFinance && (savedFinance === 'open' || savedFinance === 'closed')) {
        financeMode = savedFinance;
    }
    // Apply on next tick (after DOM ready)
    setTimeout(function() {
        document.querySelectorAll('.view-mode-btn').forEach(function(btn) {
            btn.classList.toggle('active', btn.dataset.mode === viewMode);
        });
        applyViewMode();
        // Restore finance mode toggle state
        if (financeMode === 'open') {
            setFinanceMode('open');
        }
    }, 100);
})();

window.__registerModule('mrh-trowe-detail.js');
