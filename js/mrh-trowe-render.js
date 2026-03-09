
// ========================================
// MRH TAB SWITCHING
// ========================================
function showMRHTab(tabName) {
    document.querySelectorAll('.mrh-tab-content').forEach(function(el) { el.classList.remove('active'); });
    document.querySelectorAll('.agentur-tab-mrh').forEach(function(el) { el.classList.remove('active'); });

    var mrhListe = document.getElementById('tab-kundenliste-mrh');
    if (mrhListe) mrhListe.classList.remove('active');

    var btn = document.querySelector('.agentur-tab-mrh[data-mrhtab="' + tabName + '"]');
    if (btn) btn.classList.add('active');

    if (tabName === 'kunden') {
        if (mrhListe) mrhListe.classList.add('active');
        renderMRHKundenliste();
    } else {
        var tab = document.getElementById('tab-mrh-' + tabName);
        if (tab) tab.classList.add('active');
    }

    // Lazy-render (same tab set as Makler B2B)
    if (tabName === 'uebersicht') renderMRHUebersicht();
    if (tabName === 'stammdaten') renderMRHStammdaten();
    if (tabName === 'neugeschaeft') renderMRHNeugeschaeft();
    if (tabName === 'bestand') renderMRHBestand();
    if (tabName === 'versicherermix') renderMRHVersichererMix();
    if (tabName === 'renewal') renderMRHRenewals();
    if (tabName === 'schaden') renderMRHSchaden();
    if (tabName === 'deckungsluecken') renderMRHDeckungsluecken();
    if (tabName === 'potentiale') renderMRHPotentiale();
}
window.showMRHTab = showMRHTab;

// ========================================
// MRH KUNDENLISTE
// ========================================
function renderMRHKundenliste() {
    var tbody = document.getElementById('mrhKundenlisteBody');
    if (!tbody) return;

    tbody.innerHTML = mrhKunden.map(function(k) {
        var saeulenTags = '<span class="mrh-saeulen-tag insurance">I</span>';
        if (k.benefits.aktiv) saeulenTags += '<span class="mrh-saeulen-tag benefits">B</span>';
        if (k.finance.aktiv) saeulenTags += '<span class="mrh-saeulen-tag finance">F</span>';

        var renewalClass = 'renewal-' + (k.insurance.renewalStatus || 'gruen');
        var bavText = k.benefits.aktiv ? k.benefits.bavVolumen : '<span class="text-muted">—</span>';
        var finText = k.finance.aktiv && k.finance.courtage !== '—' ? k.finance.courtage : '<span class="text-muted">—</span>';
        var typBadge = k.typ === 'Privat' ? ' <span style="font-size:10px;color:#94a3b8">(Privat)</span>' : '';

        return '<tr class="clickable-row" onclick="openMRHKundenDetail(\'' + k.id + '\')">' +
            '<td><strong>' + k.name + '</strong>' + typBadge + '</td>' +
            '<td><span class="mrh-specialty-badge ' + k.specialtyClass + '">' + k.specialtyIcon + ' ' + k.specialty + '</span></td>' +
            '<td>' + saeulenTags + '</td>' +
            '<td class="text-right"><strong>' + k.insurance.praemieDisplay + '</strong></td>' +
            '<td class="text-right">' + bavText + '</td>' +
            '<td class="text-right">' + finText + '</td>' +
            '<td><span class="renewal-badge ' + renewalClass + '">' + k.insurance.renewalDate + '</span></td>' +
            '</tr>';
    }).join('');
}
window.renderMRHKundenliste = renderMRHKundenliste;

function filterMRHKundenliste(searchText) {
    var rows = document.querySelectorAll('#mrhKundenlisteBody tr');
    var term = searchText.toLowerCase();
    rows.forEach(function(row) {
        row.style.display = row.textContent.toLowerCase().includes(term) ? '' : 'none';
    });
}
window.filterMRHKundenliste = filterMRHKundenliste;


// ========================================
// MRH ÜBERSICHT (3-Säulen-Dashboard)
// ========================================
function renderMRHUebersicht() {
    var container = document.getElementById('mrhUebersichtContent');
    if (!container) return;
    try {

    // Top-5 Kunden nach Prämie (same pattern as Makler B2B)
    var topKunden = mrhKunden.slice().sort(function(a, b) { return b.insurance.praemie - a.insurance.praemie; }).slice(0, 5);
    var topKundenRows = topKunden.map(function(k, i) {
        return '<tr class="clickable-row" onclick="openMRHKundenDetail(\'' + k.id + '\')">' +
            '<td><strong>' + (i + 1) + '.</strong></td>' +
            '<td><strong>' + k.name + '</strong><br><span style="font-size:11px;color:#64748b">' + k.specialty + '</span></td>' +
            '<td class="text-right"><strong>' + k.insurance.praemieDisplay + '</strong></td>' +
            '<td class="text-center">' + k.insurance.vertraege + '</td>' +
            '<td>' + (k.insurance.renewalDate || '—') + '</td>' +
            '</tr>';
    }).join('');

    // Anstehende Renewals (nächste 90 Tage)
    var now = new Date();
    var d90 = new Date(now); d90.setDate(d90.getDate() + 90);
    var renewals = [];
    mrhKunden.forEach(function(k) {
        if (!k.vertraegeDetail) return;
        k.vertraegeDetail.forEach(function(v) {
            if (v.ablauf === 'unbefristet') return;
            var parts = v.ablauf.split('.');
            var ablauf = new Date(parts[2], parseInt(parts[1]) - 1, parseInt(parts[0]));
            if (ablauf <= d90 && ablauf >= now) {
                renewals.push({ kunde: k.name, kundeId: k.id, sparte: v.sparte, ablauf: v.ablauf, praemie: v.praemie, ablaufDate: ablauf });
            }
        });
    });
    renewals.sort(function(a, b) { return a.ablaufDate - b.ablaufDate; });
    var renewalRows = renewals.slice(0, 8).map(function(r) {
        var daysLeft = Math.ceil((r.ablaufDate - now) / (1000 * 60 * 60 * 24));
        var urgencyClass = daysLeft <= 30 ? 'renewal-rot' : 'renewal-gelb';
        return '<tr class="clickable-row" onclick="openMRHKundenDetail(\'' + r.kundeId + '\')">' +
            '<td><span class="renewal-badge ' + urgencyClass + '">' + r.ablauf + '</span></td>' +
            '<td><strong>' + r.kunde + '</strong></td>' +
            '<td>' + r.sparte + '</td>' +
            '<td class="text-right">' + (r.praemie >= 1000000 ? (r.praemie / 1000000).toFixed(1) + ' Mio. \u20AC' : r.praemie.toLocaleString('de-DE') + ' \u20AC') + '</td>' +
            '</tr>';
    }).join('');
    if (renewalRows === '') renewalRows = '<tr><td colspan="4" class="text-muted">Keine Renewals in den nächsten 90 Tagen</td></tr>';

    // Segment-Verteilung (nach Specialty)
    var segmentMap = {};
    var totalPraemie = 0;
    mrhKunden.forEach(function(k) {
        if (!segmentMap[k.specialty]) segmentMap[k.specialty] = { praemie: 0, count: 0 };
        segmentMap[k.specialty].praemie += k.insurance.praemie;
        segmentMap[k.specialty].count++;
        totalPraemie += k.insurance.praemie;
    });
    var segmentColors = {
        'Maschinenbau': '#64748b',
        'Real Estate': '#92400e',
        'IT/Hightech': '#6d28d9',
        'Logistik': '#22c55e',
        'Healthcare': '#be185d',
        'Bau/Handwerk': '#b45309',
        'ÖPNV/SPNV': '#0369a1'
    };
    var segmentItems = Object.keys(segmentMap).map(function(seg) {
        return { name: seg, praemie: segmentMap[seg].praemie, count: segmentMap[seg].count, color: segmentColors[seg] || '#94a3b8' };
    }).sort(function(a, b) { return b.praemie - a.praemie; });
    var segmentBars = segmentItems.map(function(s) {
        var pct = (s.praemie / totalPraemie * 100).toFixed(1);
        return '<div class="mk-segment-row">' +
            '<span class="mk-segment-label"><span class="mk-segment-dot" style="background:' + s.color + '"></span>' + s.name + ' (' + s.count + ')</span>' +
            '<div class="mk-segment-bar-track"><div class="mk-segment-bar-fill" style="width:' + pct + '%;background:' + s.color + '"></div></div>' +
            '<span class="mk-segment-value">' + pct + '%</span></div>';
    }).join('');

    // Gesamtkennzahlen
    var totalVertraege = mrhKunden.reduce(function(s, k) { return s + k.insurance.vertraege; }, 0);
    var avgSchaden = mrhKunden.length > 0 ? (mrhKunden.reduce(function(s, k) { return s + (k.schadenhistorie && k.schadenhistorie.length > 0 ? k.schadenhistorie[0].betrag : 0); }, 0) / mrhKunden.length) : 0;

    // Aufgaben (Tasks)
    var aufgabenHtml =
        '<div class="mk-aufgaben-liste">' +
            '<div class="mk-aufgabe-item prio-rot"><div class="mk-aufgabe-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg></div><div class="mk-aufgabe-text"><strong>Renewal BH Rhein-Main Maschinenbau</strong><span>Ablauf 01.04.2026 \u2013 Allianz +15%, Alternativangebote einholen</span></div><span class="mk-aufgabe-frist frist-dringend">42 Tage</span></div>' +
            '<div class="mk-aufgabe-item prio-rot"><div class="mk-aufgabe-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg></div><div class="mk-aufgabe-text"><strong>Cyber-Erweiterung DigiCore Solutions</strong><span>Internationale SaaS-Risiken nicht abgedeckt</span></div><span class="mk-aufgabe-frist frist-dringend">Offen</span></div>' +
            '<div class="mk-aufgabe-item prio-gelb"><div class="mk-aufgabe-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg></div><div class="mk-aufgabe-text"><strong>Jahresgespräch Nordpark Projektentwicklung</strong><span>Bauherrenhaftpflicht Neuprojekt Gallus-Quartier</span></div><span class="mk-aufgabe-frist">28.02.2026</span></div>' +
            '<div class="mk-aufgabe-item prio-gelb"><div class="mk-aufgabe-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/></svg></div><div class="mk-aufgabe-text"><strong>Flottenkonzept Hessenlog Spedition</strong><span>45 Fahrzeuge — Bündelungsangebot vorbereiten</span></div><span class="mk-aufgabe-frist">15.03.2026</span></div>' +
            '<div class="mk-aufgabe-item"><div class="mk-aufgabe-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg></div><div class="mk-aufgabe-text"><strong>Produktrückruf-Deckung prüfen</strong><span>Rhein-Main Maschinenbau — Export 25%, keine Absicherung</span></div><span class="mk-aufgabe-frist">31.03.2026</span></div>' +
        '</div>';

    // Top-3 Potentiale
    var potentialeHtml =
        '<div class="impuls-item clickable" onclick="openMRHKundenDetail(\'MRH-001\')">' +
            '<div class="impuls-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="24" height="24"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg></div>' +
            '<div class="impuls-text"><strong>Produktrückruf-Versicherung</strong><p>Rhein-Main Maschinenbau \u2013 Export 25%, aktuell kein Produktrückruf versichert</p></div>' +
            '<span class="impuls-priority high">~35.000 €/a</span></div>' +
        '<div class="impuls-item clickable" onclick="openMRHKundenDetail(\'MRH-005\')">' +
            '<div class="impuls-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="24" height="24"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg></div>' +
            '<div class="impuls-text"><strong>Flottenversicherung Bündelung</strong><p>Hessenlog Spedition \u2013 45 Fahrzeuge in Einzelpolicen, Bündelungspotential</p></div>' +
            '<span class="impuls-priority medium">~28.000 €/a</span></div>' +
        '<div class="impuls-item clickable" onclick="openMRHKundenDetail(\'MRH-007\')">' +
            '<div class="impuls-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="24" height="24"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg></div>' +
            '<div class="impuls-text"><strong>Cyber-Erweiterung International</strong><p>DigiCore Solutions \u2013 Internationale SaaS-Risiken, aktuelle Deckung nur DE</p></div>' +
            '<span class="impuls-priority high">~45.000 €/a</span></div>';

    container.innerHTML =
        '<div class="mk-uebersicht-grid">' +
            '<div class="mk-uebersicht-main">' +
                // Vertriebskennzahlen
                '<div class="uebersicht-card">' +
                    '<div class="uebersicht-card-header"><h3>' +
                        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>' +
                        ' Vertriebskennzahlen</h3></div>' +
                    '<div class="kennzahlen-grid">' +
                        '<div class="kennzahl-item"><div class="kennzahl-value">' + mrhKunden.length + '</div><div class="kennzahl-label">Kunden</div><div class="kennzahl-trend positive">' + segmentItems.length + ' Branchen</div></div>' +
                        '<div class="kennzahl-item"><div class="kennzahl-value">' + totalVertraege + '</div><div class="kennzahl-label">Vertr\u00E4ge gesamt</div><div class="kennzahl-trend positive">\u00D8 ' + Math.round(totalVertraege / mrhKunden.length) + ' pro Kunde</div></div>' +
                        '<div class="kennzahl-item"><div class="kennzahl-value">94,2%</div><div class="kennzahl-label">Retention Rate</div><div class="kennzahl-trend positive">Benchmark: 92%</div></div>' +
                        '<div class="kennzahl-item"><div class="kennzahl-value">58%</div><div class="kennzahl-label">\u00D8 Schadenquote</div><div class="kennzahl-trend positive">Ziel: &lt; 65%</div></div>' +
                    '</div>' +
                '</div>' +
                // Aufgaben
                '<div class="uebersicht-card">' +
                    '<div class="uebersicht-card-header"><h3>' +
                        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20"><path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>' +
                        ' Aufgaben</h3></div>' +
                    aufgabenHtml +
                '</div>' +
                // Vertriebspotentiale
                '<div class="uebersicht-card potentiale-impuls-card">' +
                    '<div class="uebersicht-card-header"><h3>' +
                        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>' +
                        ' Vertriebspotentiale</h3>' +
                        '<a href="#" class="link-alle-anzeigen" onclick="showMRHTab(\'potentiale\'); return false;">Alle Potentiale \u2192</a>' +
                    '</div>' +
                    potentialeHtml +
                '</div>' +
                // Top-5 Kunden
                '<div class="uebersicht-card">' +
                    '<div class="uebersicht-card-header"><h3>' +
                        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20"><path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/></svg>' +
                        ' Top-5 Kunden (Pr\u00E4mienvolumen)</h3>' +
                        '<a href="#" class="link-alle-anzeigen" onclick="showMRHTab(\'kunden\'); return false;">Alle ' + mrhKunden.length + ' Kunden \u2192</a>' +
                    '</div>' +
                    '<table class="makler-detail-table"><thead><tr><th>#</th><th>Kunde</th><th class="text-right">Pr\u00E4mie/a</th><th class="text-center">Vertr\u00E4ge</th><th>Renewal</th></tr></thead>' +
                    '<tbody>' + topKundenRows + '</tbody></table>' +
                '</div>' +
                // Anstehende Renewals
                '<div class="uebersicht-card">' +
                    '<div class="uebersicht-card-header"><h3>' +
                        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>' +
                        ' Anstehende Renewals (90 Tage)</h3>' +
                        '<a href="#" class="link-alle-anzeigen" onclick="showMRHTab(\'renewal\'); return false;">Alle Renewals \u2192</a>' +
                    '</div>' +
                    '<table class="makler-detail-table"><thead><tr><th>Ablauf</th><th>Kunde</th><th>Sparte</th><th class="text-right">Pr\u00E4mie</th></tr></thead>' +
                    '<tbody>' + renewalRows + '</tbody></table>' +
                '</div>' +
            '</div>' +
            // Sidebar
            '<div class="mk-uebersicht-sidebar">' +
                // Segment-Verteilung
                '<div class="uebersicht-card">' +
                    '<div class="uebersicht-card-header"><h3>' +
                        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20"><circle cx="12" cy="12" r="10"/><path d="M12 2a10 10 0 0110 10"/><path d="M12 2v10h10"/></svg>' +
                        ' Branchen-Verteilung</h3></div>' +
                    '<div class="mk-segment-chart">' + segmentBars + '</div>' +
                '</div>' +
                // Anstehende Termine
                '<div class="uebersicht-card">' +
                    '<div class="uebersicht-card-header"><h3>' +
                        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>' +
                        ' Anstehende Termine</h3></div>' +
                    '<div class="termine-liste">' +
                        '<div class="termin-item heute"><div class="termin-zeit"><span class="termin-tag">Heute</span><span class="termin-uhrzeit">10:00</span></div><div class="termin-details"><strong>Rhein-Main Maschinenbau</strong><span>Renewal-Gespräch CFO Markus Schäfer</span></div></div>' +
                        '<div class="termin-item"><div class="termin-zeit"><span class="termin-tag">Mo, 24.02.</span><span class="termin-uhrzeit">14:00</span></div><div class="termin-details"><strong>Nordpark Projektentwicklung</strong><span>Bauherrenhaftpflicht Gallus-Quartier</span></div></div>' +
                        '<div class="termin-item"><div class="termin-zeit"><span class="termin-tag">Di, 25.02.</span><span class="termin-uhrzeit">09:30</span></div><div class="termin-details"><strong>DigiCore Solutions</strong><span>Cyber-Risiko Workshop</span></div></div>' +
                        '<div class="termin-item"><div class="termin-zeit"><span class="termin-tag">Mi, 26.02.</span><span class="termin-uhrzeit">11:00</span></div><div class="termin-details"><strong>Hessenlog Spedition</strong><span>Flottenversicherung Review</span></div></div>' +
                    '</div>' +
                '</div>' +
                // Schnellaktionen
                '<div class="uebersicht-card">' +
                    '<div class="uebersicht-card-header"><h3>' +
                        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>' +
                        ' Schnellaktionen</h3></div>' +
                    '<div class="formulare-grid">' +
                        '<button class="formular-btn" onclick="showMRHTab(\'potentiale\')"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg> Potentiale</button>' +
                        '<button class="formular-btn" onclick="showMRHTab(\'deckungsluecken\')"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg> Deckungsl\u00FCcken</button>' +
                        '<button class="formular-btn" onclick="showMRHTab(\'versicherermix\')"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20"><circle cx="12" cy="12" r="10"/><path d="M12 2v20M2 12h20"/></svg> Versicherer-Mix</button>' +
                    '</div>' +
                '</div>' +
            '</div>' +
        '</div>';
    } catch(e) {
        container.innerHTML = '<div style="padding:24px;color:#dc2626;background:#fef2f2;border-radius:8px"><strong>Fehler beim Rendern:</strong> ' + e.message + '</div>';
    }
}
window.renderMRHUebersicht = renderMRHUebersicht;


// ========================================
// VERSICHERER-MIX (same pattern as Makler B2B)
// ========================================
function renderMRHVersichererMix() {
    var container = document.getElementById('mrhVersichererMixOverview');
    if (!container) return;

    // Aggregate insurers from all MRH customers
    var insurerMap = {};
    var totalPraemie = 0;
    mrhKunden.forEach(function(k) {
        if (!k.vertraegeDetail) return;
        k.vertraegeDetail.forEach(function(v) {
            var name = v.versicherer;
            if (!insurerMap[name]) insurerMap[name] = { praemie: 0, vertraege: 0, kunden: [] };
            insurerMap[name].praemie += v.praemie;
            insurerMap[name].vertraege++;
            if (insurerMap[name].kunden.indexOf(k.name) === -1) insurerMap[name].kunden.push(k.name);
            totalPraemie += v.praemie;
        });
    });

    var insurers = Object.keys(insurerMap).map(function(name) {
        return { name: name, praemie: insurerMap[name].praemie, vertraege: insurerMap[name].vertraege, kunden: insurerMap[name].kunden.length };
    }).sort(function(a, b) { return b.praemie - a.praemie; });

    var colors = ['#3b82f6', '#8b5cf6', '#f59e0b', '#22c55e', '#ef4444', '#64748b', '#0ea5e9', '#ec4899', '#14b8a6', '#a855f7'];
    var rows = insurers.map(function(ins, i) {
        var pct = totalPraemie > 0 ? (ins.praemie / totalPraemie * 100).toFixed(1) : 0;
        var color = colors[i % colors.length];
        return '<tr>' +
            '<td><span class="mk-segment-dot" style="background:' + color + ';display:inline-block;width:10px;height:10px;border-radius:50%;margin-right:6px"></span><strong>' + ins.name + '</strong></td>' +
            '<td class="text-right">' + ins.praemie.toLocaleString('de-DE') + ' \u20AC</td>' +
            '<td class="text-center">' + ins.vertraege + '</td>' +
            '<td class="text-center">' + ins.kunden + '</td>' +
            '<td><div class="mk-segment-bar-track" style="display:inline-block;width:80px;vertical-align:middle"><div class="mk-segment-bar-fill" style="width:' + pct + '%;background:' + color + '"></div></div> ' + pct + '%</td>' +
        '</tr>';
    }).join('');

    container.innerHTML =
        '<table class="makler-detail-table"><thead><tr><th>Versicherer</th><th class="text-right">Prämie</th><th class="text-center">Verträge</th><th class="text-center">Kunden</th><th>Anteil</th></tr></thead>' +
        '<tbody>' + rows + '</tbody></table>';
}
window.renderMRHVersichererMix = renderMRHVersichererMix;

// ========================================
// DECKUNGSLÜCKEN (same pattern as Makler B2B)
// ========================================
function renderMRHDeckungsluecken() {
    var container = document.getElementById('mrhDeckungslueckenOverview');
    if (!container) return;

    var allGaps = [];
    mrhKunden.forEach(function(k) {
        if (!k.deckungsluecken) return;
        k.deckungsluecken.forEach(function(gap) {
            allGaps.push({ kunde: k.name, kundeId: k.id, risiko: gap, specialty: k.specialty });
        });
    });

    var rows = allGaps.map(function(g) {
        return '<tr class="clickable-row" onclick="openMRHKundenDetail(\'' + g.kundeId + '\')">' +
            '<td><strong>' + g.kunde + '</strong><br><span style="font-size:11px;color:#64748b">' + g.specialty + '</span></td>' +
            '<td>' + g.risiko + '</td>' +
            '<td><span class="impuls-priority high" style="font-size:11px">Prüfen</span></td>' +
        '</tr>';
    }).join('');

    container.innerHTML =
        '<div style="margin-bottom:12px;font-size:13px;color:#64748b"><strong>' + allGaps.length + '</strong> identifizierte Deckungslücken bei <strong>' + mrhKunden.filter(function(k){return k.deckungsluecken && k.deckungsluecken.length > 0;}).length + '</strong> Kunden</div>' +
        '<table class="makler-detail-table"><thead><tr><th>Kunde</th><th>Deckungslücke</th><th>Status</th></tr></thead>' +
        '<tbody>' + rows + '</tbody></table>';
}
window.renderMRHDeckungsluecken = renderMRHDeckungsluecken;

// ========================================
// SPECIALTY-MIX (Treemap) — legacy, kept for compatibility
// ========================================
function renderSpecialtyMap() {
    var container = document.getElementById('mrhSpecialtyContent');
    if (!container) return;

    var specialties = [
        { name: 'Industrie & Gewerbe', sub: 'Maschinenbau, Chemie, Automotive', pct: 28, color: '#475569', bg: '#f1f5f9', large: true },
        { name: 'Real Estate', sub: 'Immobilien, Projektentwickler', pct: 18, color: '#92400e', bg: '#fef3c7' },
        { name: 'Mobilität & Transport', sub: 'Kfz-Flotten, ÖPNV, Logistik', pct: 15, color: '#0369a1', bg: '#e0f2fe' },
        { name: 'Professional Services', sub: 'Anwälte, IT/Hightech', pct: 12, color: '#6d28d9', bg: '#ede9fe' },
        { name: 'Privatkunden (HNW)', sub: 'Unternehmer, Fine Art', pct: 10, color: '#166534', bg: '#f0fdf4' },
        { name: 'Healthcare', sub: 'MVZ, Medizintechnik', pct: 8, color: '#be185d', bg: '#fce7f3' },
        { name: 'Spezialrisiken', sub: 'Events, Touristik, W&I/M&A', pct: 9, color: '#c2410c', bg: '#fff7ed' }
    ];

    var items = specialties.map(function(s) {
        return '<div class="mrh-treemap-item' + (s.large ? ' large' : '') + '" style="background:' + s.bg + ';color:' + s.color + '">' +
            '<div class="treemap-label">' + s.name + '</div>' +
            '<div class="treemap-pct">' + s.pct + '%</div>' +
            '<div class="treemap-specialties">' + s.sub + '</div>' +
        '</div>';
    }).join('');

    container.innerHTML = '<div class="mrh-treemap-container">' + items + '</div>';
}
window.renderSpecialtyMap = renderSpecialtyMap;

// ========================================
// BAV DASHBOARD
// ========================================
function renderBAVDashboard() {
    var container = document.getElementById('mrhBAVContent');
    if (!container) return;

    var bavKunden = mrhKunden.filter(function(k) { return k.benefits.aktiv && k.typ === 'B2B'; });
    var noBavKunden = mrhKunden.filter(function(k) { return !k.benefits.aktiv && k.typ === 'B2B' && k.mitarbeitende && k.mitarbeitende >= 50; });

    var pipelineRows = [
        { kunde: 'Rhein-Main Maschinenbau GmbH', status: 'Angebot', ma: 340, potential: '85.000 €/a' },
        { kunde: 'Hessenlog Spedition GmbH', status: 'Erstkontakt', ma: 210, potential: '42.000 €/a' }
    ].map(function(p) {
        var statusClass = p.status === 'Angebot' ? 'renewal-gelb' : 'renewal-gruen';
        return '<tr><td><strong>' + p.kunde + '</strong></td><td>' + p.ma + ' MA</td><td><span class="renewal-badge ' + statusClass + '">' + p.status + '</span></td><td class="text-right"><strong>' + p.potential + '</strong></td></tr>';
    }).join('');

    var crossSellRows = noBavKunden.map(function(k) {
        return '<tr class="clickable-row" onclick="openMRHKundenDetail(\'' + k.id + '\')"><td><strong>' + k.name + '</strong></td><td>' + (k.mitarbeitende || '—') + ' MA</td><td>' + k.insurance.praemieDisplay + '</td><td><span class="prio-badge prio-hoch">Cross-Sell</span></td></tr>';
    }).join('');

    container.innerHTML =
        '<div class="mrh-bav-grid">' +
            '<div class="mrh-bav-card">' +
                '<h4><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg> Durchdringungsquote</h4>' +
                '<div style="font-size:28px;font-weight:800;color:#26890D">38%</div>' +
                '<div style="font-size:12px;color:#64748b;margin-bottom:8px">Ziel: 55% der B2B-Kunden mit bAV</div>' +
                '<div class="mrh-durchdringung-bar"><div class="mrh-durchdringung-fill" style="width:38%"></div><div class="mrh-durchdringung-target" style="left:55%"></div></div>' +
                '<div class="mrh-durchdringung-labels"><span>0%</span><span style="color:#dc2626">Ziel 55%</span><span>100%</span></div>' +
            '</div>' +
            '<div class="mrh-bav-card">' +
                '<h4><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/></svg> bAV-Volumen nach Durchführungsweg</h4>' +
                '<div style="font-size:13px">' +
                    '<div style="display:flex;justify-content:space-between;padding:4px 0;border-bottom:1px solid #f1f5f9"><span>Direktversicherung</span><strong>4,2 Mio. €</strong></div>' +
                    '<div style="display:flex;justify-content:space-between;padding:4px 0;border-bottom:1px solid #f1f5f9"><span>Unterstützungskasse</span><strong>3,8 Mio. €</strong></div>' +
                    '<div style="display:flex;justify-content:space-between;padding:4px 0;border-bottom:1px solid #f1f5f9"><span>Pensionsfonds</span><strong>2,4 Mio. €</strong></div>' +
                    '<div style="display:flex;justify-content:space-between;padding:4px 0;border-bottom:1px solid #f1f5f9"><span>Pensionskasse (ZVK)</span><strong>1,2 Mio. €</strong></div>' +
                    '<div style="display:flex;justify-content:space-between;padding:4px 0;font-weight:700;color:#26890D"><span>Gesamt</span><strong>12,1 Mio. €</strong></div>' +
                '</div>' +
            '</div>' +
            '<div class="mrh-bav-card">' +
                '<h4><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><line x1="12" y1="20" x2="12" y2="10"/><line x1="18" y1="20" x2="18" y2="4"/><line x1="6" y1="20" x2="6" y2="16"/></svg> bAV-Pipeline</h4>' +
                '<table class="makler-detail-table"><thead><tr><th>Kunde</th><th>MA</th><th>Status</th><th class="text-right">Potential</th></tr></thead><tbody>' + pipelineRows + '</tbody></table>' +
            '</div>' +
            '<div class="mrh-bav-card">' +
                '<h4><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><path d="M16 3h5v5M4 20L21 3"/></svg> Cross-Sell: Insurance → Benefits</h4>' +
                '<p style="font-size:12px;color:#64748b;margin:0 0 8px">B2B-Kunden mit ≥50 MA ohne bAV-Mandat:</p>' +
                '<table class="makler-detail-table"><thead><tr><th>Kunde</th><th>MA</th><th>Prämie</th><th>Status</th></tr></thead><tbody>' + crossSellRows + '</tbody></table>' +
            '</div>' +
        '</div>';
}
window.renderBAVDashboard = renderBAVDashboard;

// ========================================
// FINANCE PORTFOLIO
// ========================================
function renderFinancePortfolio() {
    var container = document.getElementById('mrhFinanceContent');
    if (!container) return;

    container.innerHTML =
        '<div class="mk-kpi-row">' +
            '<div class="mk-kpi-box"><span class="mk-kpi-label">Gesamt-Finance-Courtage</span><span class="mk-kpi-value" style="color:#ED8B00">2,8 Mio. €</span></div>' +
            '<div class="mk-kpi-box"><span class="mk-kpi-label">Kreditversicherung</span><span class="mk-kpi-value">820k €</span></div>' +
            '<div class="mk-kpi-box"><span class="mk-kpi-label">Avale/Bürgschaften</span><span class="mk-kpi-value">12,7 Mio. €</span></div>' +
            '<div class="mk-kpi-box"><span class="mk-kpi-label">Leasing-Volumen</span><span class="mk-kpi-value">19,2 Mio. €</span></div>' +
        '</div>' +
        '<div class="mrh-finance-grid">' +
            '<div class="mrh-finance-card">' +
                '<h4>Kreditversicherung</h4>' +
                '<table class="makler-detail-table"><thead><tr><th>Kunde</th><th>Versicherer</th><th class="text-right">Obligo</th></tr></thead><tbody>' +
                    '<tr><td>Rhein-Main Maschinenbau</td><td>Euler Hermes</td><td class="text-right">12 Mio. €</td></tr>' +
                    '<tr><td>TechParts Zulieferer</td><td>Coface</td><td class="text-right">8 Mio. €</td></tr>' +
                    '<tr><td>TravelStar Reiseveranstalter</td><td>Atradius</td><td class="text-right">3 Mio. €</td></tr>' +
                '</tbody></table>' +
            '</div>' +
            '<div class="mrh-finance-card">' +
                '<h4>Avale / Bürgschaften</h4>' +
                '<table class="makler-detail-table"><thead><tr><th>Kunde</th><th>Typ</th><th class="text-right">Volumen</th></tr></thead><tbody>' +
                    '<tr><td>Nordpark Projektentwicklung</td><td>Vertragserfüllung</td><td class="text-right">8,5 Mio. €</td></tr>' +
                    '<tr><td>Hessenbau GU</td><td>Gewährleistung</td><td class="text-right">4,2 Mio. €</td></tr>' +
                '</tbody></table>' +
            '</div>' +
            '<div class="mrh-finance-card">' +
                '<h4>Leasing (FM LeasingPartner)</h4>' +
                '<table class="makler-detail-table"><thead><tr><th>Kunde</th><th>Objekt</th><th class="text-right">Volumen</th></tr></thead><tbody>' +
                    '<tr><td>Rhein-Main Verkehr</td><td>20 E-Busse</td><td class="text-right">9,5 Mio. €</td></tr>' +
                    '<tr><td>Medicum MVZ</td><td>MRT, CT</td><td class="text-right">3,2 Mio. €</td></tr>' +
                    '<tr><td>Hessenlog</td><td>8 LKW</td><td class="text-right">2,8 Mio. €</td></tr>' +
                    '<tr><td>Hessenbau</td><td>Baumaschinen</td><td class="text-right">1,8 Mio. €</td></tr>' +
                '</tbody></table>' +
            '</div>' +
            '<div class="mrh-finance-card">' +
                '<h4>Factoring</h4>' +
                '<table class="makler-detail-table"><thead><tr><th>Kunde</th><th>Anbieter</th><th class="text-right">Volumen/Mon.</th></tr></thead><tbody>' +
                    '<tr><td>TechParts Zulieferer</td><td>BNP Paribas</td><td class="text-right">2,1 Mio. €</td></tr>' +
                '</tbody></table>' +
            '</div>' +
            '<div class="mrh-finance-card">' +
                '<h4>Debt Advisory</h4>' +
                '<table class="makler-detail-table"><thead><tr><th>Kunde</th><th>Mandat</th><th>Status</th></tr></thead><tbody>' +
                    '<tr><td>Nordpark Projektentwicklung</td><td>Projektfinanzierung 35 Mio.</td><td><span class="renewal-badge renewal-gelb">Pipeline</span></td></tr>' +
                    '<tr><td>Alphatech Holding</td><td>Akquisitionsfinanzierung</td><td><span class="renewal-badge renewal-gelb">Pipeline</span></td></tr>' +
                '</tbody></table>' +
            '</div>' +
            '<div class="mrh-finance-card">' +
                '<h4>Trend YoY</h4>' +
                '<div style="font-size:13px">' +
                    '<div style="display:flex;justify-content:space-between;padding:4px 0;border-bottom:1px solid #f1f5f9"><span>2024</span><strong>2,3 Mio. €</strong></div>' +
                    '<div style="display:flex;justify-content:space-between;padding:4px 0;border-bottom:1px solid #f1f5f9"><span>2025</span><strong>2,8 Mio. €</strong></div>' +
                    '<div style="display:flex;justify-content:space-between;padding:4px 0;color:#16a34a;font-weight:700"><span>Wachstum</span><strong>+22%</strong></div>' +
                '</div>' +
            '</div>' +
        '</div>';
}
window.renderFinancePortfolio = renderFinancePortfolio;

// ========================================
// CROSS-SELL MATRIX
// ========================================
function renderCrossSellMatrix() {
    var container = document.getElementById('mrhCrossSellContent');
    if (!container) return;

    container.innerHTML =
        '<div class="mk-kpi-row">' +
            '<div class="mk-kpi-box"><span class="mk-kpi-label">Cross-Sell-Potentiale</span><span class="mk-kpi-value">12</span></div>' +
            '<div class="mk-kpi-box"><span class="mk-kpi-label">Geschätztes Volumen</span><span class="mk-kpi-value positive">~450k €/a</span></div>' +
        '</div>' +
        '<div class="mrh-crosssell-grid">' +
            '<div class="mrh-crosssell-card">' +
                '<div class="mrh-crosssell-direction"><span class="mrh-saeulen-tag insurance">Insurance</span><span class="mrh-crosssell-arrow">→</span><span class="mrh-saeulen-tag benefits">Benefits</span></div>' +
                '<p style="font-size:12px;color:#64748b;margin:0 0 8px">B2B-Kunden mit >100 MA ohne bAV-Mandat</p>' +
                '<div class="mrh-crosssell-example"><strong>Rhein-Main Maschinenbau GmbH:</strong> 340 MA, Versicherungsprämie 420k, kein bAV — geschätztes Potential 85k bAV-Volumen/Jahr</div>' +
                '<div class="mrh-crosssell-example" style="margin-top:6px"><strong>Hessenlog Spedition GmbH:</strong> 210 MA, kein bAV — einfaches Bindungsmodell möglich</div>' +
            '</div>' +
            '<div class="mrh-crosssell-card">' +
                '<div class="mrh-crosssell-direction"><span class="mrh-saeulen-tag insurance">Insurance</span><span class="mrh-crosssell-arrow">→</span><span class="mrh-saeulen-tag finance">Finance</span></div>' +
                '<p style="font-size:12px;color:#64748b;margin:0 0 8px">Kunden mit Lieferantenabhängigkeit ohne Kreditversicherung</p>' +
                '<div class="mrh-crosssell-example"><strong>DigiCore Solutions GmbH:</strong> SaaS-Forderungen international — Kreditversicherungsprüfung läuft</div>' +
            '</div>' +
            '<div class="mrh-crosssell-card">' +
                '<div class="mrh-crosssell-direction"><span class="mrh-saeulen-tag benefits">Benefits</span><span class="mrh-crosssell-arrow">→</span><span class="mrh-saeulen-tag insurance">Insurance</span></div>' +
                '<p style="font-size:12px;color:#64748b;margin:0 0 8px">bAV-Mandant ohne Sachversicherung</p>' +
                '<div class="mrh-crosssell-example"><strong>Dr. Stefan Brandes:</strong> bAV-Mandat über DigiCore, Kunstsammlung privat nicht versichert</div>' +
            '</div>' +
            '<div class="mrh-crosssell-card">' +
                '<div class="mrh-crosssell-direction"><span class="mrh-saeulen-tag finance">Finance</span><span class="mrh-crosssell-arrow">→</span><span class="mrh-saeulen-tag insurance">Insurance</span></div>' +
                '<p style="font-size:12px;color:#64748b;margin:0 0 8px">Leasing-Kunde ohne Maschinenbruch/BU</p>' +
                '<div class="mrh-crosssell-example"><strong>Rhein-Main Maschinenbau:</strong> CNC-Leasing-Anfrage 1,4 Mio. — keine technische Versicherung für Neumaschine</div>' +
            '</div>' +
        '</div>';
}
window.renderCrossSellMatrix = renderCrossSellMatrix;


// ========================================
// MRH RENEWALS, SCHADEN, STAMMDATEN, etc.
// ========================================
function renderMRHRenewals() {
    var container = document.getElementById('mrhRenewalContent');
    if (!container) return;
    var gelb = mrhKunden.filter(function(k) { return k.insurance.renewalStatus === 'gelb'; });
    var gruen = mrhKunden.filter(function(k) { return k.insurance.renewalStatus === 'gruen'; });

    function renderGroup(label, items, cssClass) {
        if (items.length === 0) return '<div class="renewal-group"><div class="renewal-group-label ' + cssClass + '">' + label + ' (0)</div></div>';
        var rows = items.map(function(k) {
            return '<div class="renewal-item"><span class="renewal-sparte">' + k.name + '</span><span class="renewal-versicherer">' + k.specialty + '</span><span class="renewal-ablauf">' + k.insurance.renewalDate + ' — ' + k.insurance.praemieDisplay + '</span></div>';
        }).join('');
        return '<div class="renewal-group"><div class="renewal-group-label ' + cssClass + '">' + label + ' (' + items.length + ')</div>' + rows + '</div>';
    }

    container.innerHTML = renderGroup('Handlungsbedarf (gelb)', gelb, 'renewal-gelb') + renderGroup('Im Plan (grün)', gruen, 'renewal-gruen');
}
window.renderMRHRenewals = renderMRHRenewals;

function renderMRHSchaden() {
    var container = document.getElementById('mrhSchadenContent');
    if (!container) return;
    var allSchaden = [];
    mrhKunden.forEach(function(k) {
        if (k.schadenhistorie) {
            k.schadenhistorie.forEach(function(s) {
                allSchaden.push({ kunde: k.name, kundeId: k.id, jahr: s.jahr, beschreibung: s.beschreibung, betrag: s.betrag });
            });
        }
    });
    allSchaden.sort(function(a, b) { return b.jahr - a.jahr || b.betrag - a.betrag; });
    var rows = allSchaden.map(function(s) {
        return '<tr class="clickable-row" onclick="openMRHKundenDetail(\'' + s.kundeId + '\')"><td><strong>' + s.jahr + '</strong></td><td>' + s.kunde + '</td><td>' + s.beschreibung + '</td><td class="text-right"><strong>' + s.betrag.toLocaleString('de-DE') + ' €</strong></td></tr>';
    }).join('');
    if (!rows) rows = '<tr><td colspan="4" class="text-muted">Keine Schäden verzeichnet</td></tr>';
    container.innerHTML = '<table class="makler-detail-table"><thead><tr><th>Jahr</th><th>Kunde</th><th>Beschreibung</th><th class="text-right">Betrag</th></tr></thead><tbody>' + rows + '</tbody></table>';
}
window.renderMRHSchaden = renderMRHSchaden;

function renderMRHStammdaten() {
    var container = document.getElementById('mrhStammdatenContent');
    if (!container) return;
    container.innerHTML =
        '<div class="uebersicht-card"><div class="uebersicht-card-header"><h3>Niederlassungs-Stammdaten</h3></div>' +
        '<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:16px;font-size:13px;color:#475569">' +
            '<div><span style="color:#94a3b8;font-size:11px;text-transform:uppercase">Name</span><br><strong>Niederlassung Rhein-Main</strong></div>' +
            '<div><span style="color:#94a3b8;font-size:11px;text-transform:uppercase">Standort</span><br><strong>Frankfurt am Main</strong></div>' +
            '<div><span style="color:#94a3b8;font-size:11px;text-transform:uppercase">Leiter</span><br><strong>Thomas Bergmann</strong></div>' +
            '<div><span style="color:#94a3b8;font-size:11px;text-transform:uppercase">Mitarbeitende</span><br><strong>42 (28 Insurance, 8 Benefits, 6 Finance)</strong></div>' +
            '<div><span style="color:#94a3b8;font-size:11px;text-transform:uppercase">Kunden gesamt</span><br><strong>487 (davon 68 Privat)</strong></div>' +
            '<div><span style="color:#94a3b8;font-size:11px;text-transform:uppercase">Schwerpunkte</span><br><strong>Real Estate, Maschinenbau, Professional Services, Kfz/Motor</strong></div>' +
        '</div></div>';
}
function renderMRHNeugeschaeft() {
    var container = document.getElementById('mrhNeugeschaeftContent');
    if (!container) return;
    container.innerHTML = '<div class="uebersicht-card"><div class="uebersicht-card-header"><h3>Neugeschäft YTD — 8,7 Mio. €</h3></div><p style="color:#64748b;font-size:13px">Aufgeteilt nach Säulen: Insurance 6,2 Mio. € | Benefits 1,8 Mio. € | Finance 0,7 Mio. €</p></div>';
}
function renderMRHBestand() {
    var container = document.getElementById('mrhBestandContent');
    if (!container) return;
    var rows = mrhKunden.map(function(k) {
        return '<tr class="clickable-row" onclick="openMRHKundenDetail(\'' + k.id + '\')"><td><strong>' + k.name + '</strong></td><td>' + k.specialty + '</td><td class="text-right">' + k.insurance.praemieDisplay + '</td><td class="text-center">' + k.insurance.vertraege + '</td></tr>';
    }).join('');
    container.innerHTML = '<table class="makler-detail-table"><thead><tr><th>Kunde</th><th>Specialty</th><th class="text-right">Prämie/a</th><th class="text-center">Verträge</th></tr></thead><tbody>' + rows + '</tbody></table>';
}
function renderMRHPotentiale() {
    var container = document.getElementById('mrhPotentialeContent');
    if (!container) return;
    var pots = [];
    mrhKunden.forEach(function(k) {
        if (k.deckungsluecken && k.deckungsluecken.length > 0) {
            k.deckungsluecken.forEach(function(d) { pots.push({ kunde: k.name, kundeId: k.id, luecke: d }); });
        }
    });
    var rows = pots.map(function(p) {
        return '<tr class="clickable-row" onclick="openMRHKundenDetail(\'' + p.kundeId + '\')"><td><strong>' + p.kunde + '</strong></td><td>' + p.luecke + '</td><td><span class="prio-badge prio-hoch">Hoch</span></td></tr>';
    }).join('');
    container.innerHTML = '<div class="uebersicht-card"><div class="uebersicht-card-header"><h3>Deckungslücken & Potentiale</h3></div>' +
        '<table class="makler-detail-table"><thead><tr><th>Kunde</th><th>Deckungslücke / Potential</th><th>Priorität</th></tr></thead><tbody>' + rows + '</tbody></table></div>';
}


// ========================================
