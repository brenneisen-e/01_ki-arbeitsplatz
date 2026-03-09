(function(){var r=['getFilteredData','kpiDefinitions'];var m=r.filter(function(f){return typeof window[f]==='undefined'});if(m.length)console.debug('[makler-overview.js] Fehlende Deps:',m.join(', '),'← Lade config.js, data.js zuerst!');})();

// ========================================
// MAKLER RENEWAL OVERVIEW (A-02)
// ========================================
function renderMaklerRenewalOverview() {
    var container = document.getElementById('maklerRenewalOverview');
    if (!container) return;

    var now = new Date();
    var d30 = new Date(now); d30.setDate(d30.getDate() + 30);
    var d90 = new Date(now); d90.setDate(d90.getDate() + 90);
    var d180 = new Date(now); d180.setDate(d180.getDate() + 180);

    var rot = [], gelb = [], gruen = [];
    maklerKunden.forEach(function(k) {
        if (!k.vertraegeDetail) return;
        k.vertraegeDetail.forEach(function(v) {
            if (v.ablauf === 'unbefristet') return;
            var parts = v.ablauf.split('.');
            var ablauf = new Date(parts[2], parseInt(parts[1]) - 1, parseInt(parts[0]));
            var item = { kunde: k.name, kundeId: k.id, sparte: v.sparte, versicherer: v.versicherer, praemie: v.praemie, ablauf: v.ablauf };
            if (ablauf <= d30) rot.push(item);
            else if (ablauf <= d90) gelb.push(item);
            else if (ablauf <= d180) gruen.push(item);
        });
    });

    function renderGroup(label, items, cssClass) {
        if (items.length === 0) return '<div class="renewal-group"><div class="renewal-group-label ' + cssClass + '">' + label + ' (0)</div></div>';
        var rows = items.map(function(i) {
            return '<div class="renewal-item" style="cursor:pointer" onclick="openMaklerKundenDetail(\'' + i.kundeId + '\')">' +
                '<span class="renewal-sparte">' + i.sparte + '</span>' +
                '<span class="renewal-versicherer">' + i.kunde + '</span>' +
                '<span class="renewal-ablauf">' + i.ablauf + '</span></div>';
        }).join('');
        return '<div class="renewal-group"><div class="renewal-group-label ' + cssClass + '">' + label + ' (' + items.length + ')</div>' + rows + '</div>';
    }

    container.innerHTML = renderGroup('N\u00E4chste 30 Tage', rot, 'renewal-rot') +
        renderGroup('31 \u2013 90 Tage', gelb, 'renewal-gelb') +
        renderGroup('91 \u2013 180 Tage', gruen, 'renewal-gruen');
}

// ========================================
// MAKLER SCHADEN OVERVIEW (A-02)
// ========================================
function renderMaklerSchadenOverview() {
    var container = document.getElementById('maklerSchadenOverview');
    if (!container) return;

    var rows = maklerKunden.filter(function(k) { return k.schadenhistorie && k.schadenhistorie.length > 0; }).map(function(k) {
        var latest = k.schadenhistorie[0];
        var qClass = latest.quote > 65 ? 'schaden-hoch' : (latest.quote > 50 ? 'schaden-mittel' : 'schaden-niedrig');
        return '<tr class="clickable-row" onclick="openMaklerKundenDetail(\'' + k.id + '\')">' +
            '<td><strong>' + k.name + '</strong></td>' +
            '<td>' + k.segment + '</td>' +
            '<td class="text-center">' + latest.anzahl + '</td>' +
            '<td class="text-right">' + latest.volumen.toLocaleString('de-DE') + ' \u20AC</td>' +
            '<td><span class="' + qClass + '">' + latest.quote + '%</span></td>' +
            '<td>' + latest.groesster + '</td></tr>';
    }).join('');

    container.innerHTML = '<table class="makler-detail-table"><thead><tr><th>Institution</th><th>Segment</th><th class="text-center">Sch\u00E4den (' + new Date().getFullYear() + ')</th><th class="text-right">Volumen</th><th>Quote</th><th>Gr\u00F6\u00DFter Schaden</th></tr></thead><tbody>' + rows + '</tbody></table>';
}

// ========================================
// MAKLER DECKUNGSLÜCKEN OVERVIEW (A-02)
// ========================================
function renderMaklerDeckungslueckenOverview() {
    var container = document.getElementById('maklerDeckungslueckenOverview');
    if (!container) return;

    var allGaps = [];
    maklerKunden.forEach(function(k) {
        if (!k.deckungsluecken) return;
        k.deckungsluecken.forEach(function(d) {
            allGaps.push({ kunde: k.name, kundeId: k.id, segment: k.segment, risiko: d.risiko, status: d.status, empfehlung: d.empfehlung, prioritaet: d.prioritaet });
        });
    });
    // Sort by priority
    var prioOrder = { 'Hoch': 0, 'Mittel': 1, 'Niedrig': 2 };
    allGaps.sort(function(a, b) { return (prioOrder[a.prioritaet] || 2) - (prioOrder[b.prioritaet] || 2); });

    var rows = allGaps.map(function(g) {
        var pClass = g.prioritaet === 'Hoch' ? 'prio-hoch' : (g.prioritaet === 'Mittel' ? 'prio-mittel' : 'prio-niedrig');
        return '<tr class="clickable-row" onclick="openMaklerKundenDetail(\'' + g.kundeId + '\')">' +
            '<td><span class="prio-badge ' + pClass + '">' + g.prioritaet + '</span></td>' +
            '<td><strong>' + g.kunde + '</strong></td>' +
            '<td>' + g.risiko + '</td>' +
            '<td><span class="status-badge-dl">' + g.status + '</span></td>' +
            '<td>' + g.empfehlung + '</td></tr>';
    }).join('');

    container.innerHTML = '<table class="makler-detail-table"><thead><tr><th>Prio</th><th>Institution</th><th>Risiko</th><th>Status</th><th>Empfehlung</th></tr></thead><tbody>' + rows + '</tbody></table>';
}

// ========================================
// MAKLER POTENTIALE (B2B Cross-Selling)
// ========================================
var maklerPotentialeData = [
    {
        id: 'mp-01',
        kunde: 'Klinikum Lippetal GmbH',
        kundeId: 'MK-GW-001',
        titel: 'Umwelthaftpflicht fehlt',
        beschreibung: 'Labor und Gefahrstofflager ohne separate Umweltdeckung. Gesetzliche Pflicht seit 2024.',
        kategorie: 'Deckungsl\u00FCcke',
        prioritaet: 'Hoch',
        potentialPraemie: '45.000 \u20AC/a',
        quelle: 'Risikoanalyse',
        herleitung: 'Labor mit Gefahrstoffen (Klasse 3+4), Radiologie mit Kontrastmitteln, Zytostatikazubereitung \u2013 separate Umwelthaftpflicht gesetzlich empfohlen.',
        empfehlung: 'Umwelthaftpflichtversicherung mit Deckungssumme 5 Mio. \u20AC'
    },
    {
        id: 'mp-02',
        kunde: 'Klinikum Lippetal GmbH',
        kundeId: 'MK-GW-001',
        titel: 'Maschinenbruch med. Gro\u00DFger\u00E4te',
        beschreibung: 'MRT, CT und OP-Robotik (da Vinci) nicht separat gegen Maschinenbruch versichert.',
        kategorie: 'Deckungsl\u00FCcke',
        prioritaet: 'Hoch',
        potentialPraemie: '28.000 \u20AC/a',
        quelle: 'Bestandsanalyse',
        herleitung: 'Ger\u00E4tewert > 8 Mio. \u20AC (MRT: 2,5 Mio., CT: 1,8 Mio., da Vinci: 3,2 Mio.). Nur \u00FCber Inhaltsversicherung gedeckt \u2013 Sublimit 500.000 \u20AC.',
        empfehlung: 'Separate Maschinenbruchversicherung mit Neuwertentsch\u00E4digung'
    },
    {
        id: 'mp-03',
        kunde: 'Ev. Landeskirche Teutoburg',
        kundeId: 'MK-KI-001',
        titel: 'Cyber-Rahmenvertrag f\u00FCr Kirchenverwaltungen',
        beschreibung: 'Nur 12% der 1.900 Gemeinden haben Cyber-Schutz. Zentraler Rahmenvertrag m\u00F6glich.',
        kategorie: 'Cross-Selling',
        prioritaet: 'Hoch',
        potentialPraemie: '180.000 \u20AC/a',
        quelle: 'Marktanalyse',
        herleitung: '1.900 Kirchengemeinden mit zunehmender Digitalisierung (Kirchenb\u00FCros, Meldewesen, Spendenverwaltung). Aktuell nur 228 Gemeinden mit Cyber-Deckung.',
        empfehlung: 'Rahmenvertrag Cyber mit Gruppenrabatt, Mindestdeckung 500.000 \u20AC pro Gemeinde'
    },
    {
        id: 'mp-04',
        kunde: 'Nordlicht Automatisierung GmbH',
        kundeId: 'MK-IG-002',
        titel: 'Produkthaftpflicht-Erweiterung (US-Gesch\u00E4ft)',
        beschreibung: 'Wachsendes US-Gesch\u00E4ft (35% Umsatzanteil) erfordert US-Deckungserweiterung.',
        kategorie: 'Anpassung',
        prioritaet: 'Hoch',
        potentialPraemie: '120.000 \u20AC/a',
        quelle: 'Gesch\u00E4ftsbericht',
        herleitung: 'US-Umsatz 2025: 1,2 Mrd. \u20AC (+18% YoY). Aktuelle Produkthaftpflicht nur mit europ\u00E4ischem Geltungsbereich. US Product Liability separat erforderlich.',
        empfehlung: 'US Product Liability Policy, Deckungssumme $25 Mio., mit R\u00FCckrufkostendeckung'
    },
    {
        id: 'mp-05',
        kunde: 'Nordwest Cargo Logistics',
        kundeId: 'MK-TL-001',
        titel: 'Transportversicherung Erweiterung (Luftfracht)',
        beschreibung: 'Neues Luftfracht-Segment seit Q3/2025 nicht in bestehender Transport-Police abgedeckt.',
        kategorie: 'Anpassung',
        prioritaet: 'Mittel',
        potentialPraemie: '85.000 \u20AC/a',
        quelle: 'Kundenmeldung',
        herleitung: 'Neue Luftfrachtstrecken (Frankfurt-Shanghai, M\u00FCnchen-Chicago). Bestehende Police deckt nur See- und Landtransport.',
        empfehlung: 'Erweiterung Transportpolice um Luftfrachtdeckung, oder separate Luftfracht-Cargo-Police'
    },
    {
        id: 'mp-06',
        kunde: 'Diakonisches Hilfswerk Westmark',
        kundeId: 'MK-SW-001',
        titel: 'bKV f\u00FCr Mitarbeitende',
        beschreibung: '4.500 Mitarbeitende ohne betriebliche Krankenversicherung. Gutes Instrument gegen Fachkr\u00E4ftemangel.',
        kategorie: 'Cross-Selling',
        prioritaet: 'Mittel',
        potentialPraemie: '95.000 \u20AC/a',
        quelle: 'Markttrend',
        herleitung: 'Hohe Fluktuation im Pflegebereich (18% p.a.). bKV als Mitarbeiterbindungsinstrument. Vergleichbare Tr\u00E4ger haben 15% geringere Fluktuation mit bKV.',
        empfehlung: 'bKV-Rahmenvertrag Budget-Tarif 300\u20AC/MA, mit Zahnzusatz und Vorsorge'
    },
    {
        id: 'mp-07',
        kunde: 'Teutoburger Maschinenbau GmbH',
        kundeId: 'MK-IG-003',
        titel: 'Maschinenbruch + BU-Erweiterung',
        beschreibung: 'Neue CNC-Fertigungslinie (Invest 4,5 Mio. \u20AC) nicht in bestehender Police ber\u00FCcksichtigt.',
        kategorie: 'Anpassung',
        prioritaet: 'Mittel',
        potentialPraemie: '32.000 \u20AC/a',
        quelle: 'Kundengespr\u00E4ch',
        herleitung: 'CNC-Investition Q2/2025. Bestehende Maschinenbruch-VSU nur bis 2 Mio. \u20AC. Betriebsunterbrechung bei Ausfall der Linie: gesch\u00E4tzt 500.000 \u20AC/Monat.',
        empfehlung: 'Erh\u00F6hung Maschinenbruch-VSU auf 8 Mio. \u20AC, BU-Nachhaftung auf 12 Monate'
    },
    {
        id: 'mp-08',
        kunde: 'Reha-Klinik Teutoburg',
        kundeId: 'MK-GW-002',
        titel: 'D&O-Versicherung fehlt',
        beschreibung: 'Keine Managerhaftpflicht trotz GmbH-Struktur und angestellten Gesch\u00E4ftsf\u00FChrern.',
        kategorie: 'Deckungsl\u00FCcke',
        prioritaet: 'Mittel',
        potentialPraemie: '8.500 \u20AC/a',
        quelle: 'Risikoanalyse',
        herleitung: 'GmbH mit 3 Gesch\u00E4ftsf\u00FChrern, 280 Mitarbeitenden, 32 Mio. \u20AC Umsatz. Pers\u00F6nliche Haftung der GF nicht abgesichert.',
        empfehlung: 'D&O-Versicherung, Deckungssumme 3 Mio. \u20AC'
    },
    {
        id: 'mp-09',
        kunde: 'Sozialwerkstätten Bergland',
        kundeId: 'MK-SW-002',
        titel: 'Arbeitsst\u00E4ttenversicherung pr\u00FCfen',
        beschreibung: 'Werkst\u00E4tten mit erh\u00F6htem Unfallrisiko \u2013 aktuelle Deckung evtl. unzureichend.',
        kategorie: 'Anpassung',
        prioritaet: 'Niedrig',
        potentialPraemie: '12.000 \u20AC/a',
        quelle: 'Bestandsanalyse',
        herleitung: '4 Werkstatt-Standorte mit Holz-, Metall- und Textilverarbeitung. Besch\u00E4ftigte mit Behinderung (480 Pl\u00E4tze). Erh\u00F6htes Betriebsrisiko.',
        empfehlung: 'Pr\u00FCfung der Betriebshaftpflicht auf erweiterten Personenkreis'
    },
    {
        id: 'mp-10',
        kunde: 'Lippeland Fracht GmbH',
        kundeId: 'MK-TL-003',
        titel: 'Fuhrpark-Erweiterung absichern',
        beschreibung: '8 neue Lkw bestellt (Lieferung Q2/2026), noch nicht in Flottenpolice aufgenommen.',
        kategorie: 'Cross-Selling',
        prioritaet: 'Niedrig',
        potentialPraemie: '18.000 \u20AC/a',
        quelle: 'Kundenmeldung',
        herleitung: 'Aktuelle Flotte: 22 Fahrzeuge. Erweiterung auf 30 Fahrzeuge geplant. Neue Strecke OWL-Hamburg.',
        empfehlung: 'Erweiterung Flottenpolice, ggf. Neuausschreibung bei > 25 Fahrzeugen'
    }
];

function renderMaklerPotentiale() {
    var container = document.getElementById('maklerPotentialeContent');
    if (!container) return;

    var prioOrder = { 'Hoch': 0, 'Mittel': 1, 'Niedrig': 2 };
    var sorted = maklerPotentialeData.slice().sort(function(a, b) { return (prioOrder[a.prioritaet] || 2) - (prioOrder[b.prioritaet] || 2); });

    var rows = sorted.map(function(p) {
        var prioClass = p.prioritaet === 'Hoch' ? 'prio-hoch' : (p.prioritaet === 'Mittel' ? 'prio-mittel' : 'prio-niedrig');
        var katClass = p.kategorie === 'Deckungsl\u00FCcke' ? 'whitespots' : (p.kategorie === 'Anpassung' ? 'anpassung' : 'whitespots');

        var detailHtml = '<tr class="impulse-table-detail" id="mk-pot-detail-' + p.id + '">' +
            '<td colspan="7"><div class="impulse-table-detail-inner">' +
                '<div class="impulse-table-herleitung">' +
                    '<div class="kanban-detail-title">Herleitung</div>' +
                    '<div class="kanban-detail-row"><span class="kanban-detail-label">Quelle</span><span class="kanban-detail-value">' + p.quelle + '</span></div>' +
                    '<div class="kanban-detail-row"><span class="kanban-detail-label">Analyse</span><span class="kanban-detail-value">' + p.herleitung + '</span></div>' +
                    '<div class="kanban-detail-row"><span class="kanban-detail-label">Empfehlung</span><span class="kanban-detail-value" style="color:#166534;font-weight:600">' + p.empfehlung + '</span></div>' +
                '</div>' +
                '<div class="impulse-table-actions">' +
                    '<button class="action-btn icon-only primary small" onclick="event.stopPropagation(); openMaklerKundenDetail(\'' + p.kundeId + '\')" title="Kunde \u00F6ffnen"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg></button>' +
                    '<button class="action-btn icon-only secondary small" title="Termin vereinbaren"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg></button>' +
                    '<button class="action-btn icon-only secondary small" title="Angebot erstellen"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/></svg></button>' +
                '</div>' +
            '</div></td></tr>';

        return '<tr class="impulse-table-row" onclick="toggleMaklerPotDetail(\'' + p.id + '\')">' +
            '<td><span class="prio-badge ' + prioClass + '">' + p.prioritaet + '</span></td>' +
            '<td><strong>' + p.titel + '</strong><div class="impulse-table-desc">' + p.beschreibung + '</div></td>' +
            '<td>' + p.kunde + '</td>' +
            '<td><span class="impulse-kat-badge ' + katClass + '">' + p.kategorie + '</span></td>' +
            '<td class="text-right"><strong>' + p.potentialPraemie + '</strong></td>' +
            '<td class="impulse-table-expand-cell"><span class="impulse-table-expand" id="mk-pot-expand-' + p.id + '"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><polyline points="6 9 12 15 18 9"/></svg></span></td>' +
            '</tr>' + detailHtml;
    }).join('');

    var totalPotential = sorted.reduce(function(sum, p) {
        var num = parseInt(p.potentialPraemie.replace(/[^\d]/g, ''));
        return sum + num;
    }, 0);

    container.innerHTML =
        '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:16px">' +
            '<h3 class="section-title" style="margin:0">' +
                '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>' +
                ' Potentiale & Cross-Selling (' + sorted.length + ')' +
            '</h3>' +
            '<span style="font-size:14px;font-weight:700;color:#166534;background:#dcfce7;padding:4px 12px;border-radius:8px">Gesamt-Potential: ' + totalPotential.toLocaleString('de-DE') + ' \u20AC/a</span>' +
        '</div>' +
        '<table class="impulse-table"><thead><tr>' +
            '<th>Prio</th><th>Potential</th><th>Kunde</th><th>Kategorie</th><th class="text-right">Pr\u00E4mie</th><th></th>' +
        '</tr></thead><tbody>' + rows + '</tbody></table>';
}
window.renderMaklerPotentiale = renderMaklerPotentiale;

function toggleMaklerPotDetail(id) {
    var detail = document.getElementById('mk-pot-detail-' + id);
    var expand = document.getElementById('mk-pot-expand-' + id);
    if (detail) {
        detail.classList.toggle('open');
        if (expand) expand.classList.toggle('open');
    }
}
window.toggleMaklerPotDetail = toggleMaklerPotDetail;

// ========================================
// MAKLER STAMMDATEN (Team-/Makler-Info)
// ========================================
function renderMaklerStammdaten() {
    var container = document.getElementById('maklerStammdatenContent');
    if (!container) return;

    container.innerHTML =
        '<h3 class="section-title"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg> Maklerteam-Stammdaten</h3>' +
        '<div class="stammdaten-sections"><div class="stammdaten-section"><h3>Basis-Stammdaten</h3><div class="stammdaten-grid-new">' +
            '<div class="stammdaten-item-new"><div class="stammdaten-label">Maklerhaus</div><div class="stammdaten-value">Ecclesia Gruppe</div></div>' +
            '<div class="stammdaten-item-new"><div class="stammdaten-label">Team</div><div class="stammdaten-value">Gesundheit &amp; Soziales NRW</div></div>' +
            '<div class="stammdaten-item-new"><div class="stammdaten-label">Teamleiter</div><div class="stammdaten-value">Dr. Stefan Krause</div></div>' +
            '<div class="stammdaten-item-new"><div class="stammdaten-label">Adresse</div><div class="stammdaten-value">Klingenbergstra\u00DFe 4, 32758 Detmold</div></div>' +
            '<div class="stammdaten-item-new"><div class="stammdaten-label">Telefon</div><div class="stammdaten-value">+49 5231 603-0</div></div>' +
            '<div class="stammdaten-item-new"><div class="stammdaten-label">E-Mail</div><div class="stammdaten-value">gesundheit-nrw@ecclesia.de</div></div>' +
            '<div class="stammdaten-item-new"><div class="stammdaten-label">IHK-Registrierung</div><div class="stammdaten-value">D-FXYZ-ABCDE-12</div></div>' +
            '<div class="stammdaten-item-new"><div class="stammdaten-label">Mitarbeitende</div><div class="stammdaten-value">12 (davon 8 Kundenberater)</div></div>' +
        '</div></div>' +
        '<div class="stammdaten-section"><h3>Spezialisierung</h3><div class="stammdaten-grid-new">' +
            '<div class="stammdaten-item-new"><div class="stammdaten-label">Segmente</div><div class="stammdaten-value">Gesundheitswesen, Kirche, Sozialwirtschaft, Industrie, Transport</div></div>' +
            '<div class="stammdaten-item-new"><div class="stammdaten-label">Kooperationspartner</div><div class="stammdaten-value">EGAS (Arzthaftpflicht), Kravag (Flotte), Funk Gruppe (R\u00FCckversicherung)</div></div>' +
            '<div class="stammdaten-item-new"><div class="stammdaten-label">Rahmenvertr\u00E4ge</div><div class="stammdaten-value">14 aktive Rahmenvertr\u00E4ge bei 8 Versicherern</div></div>' +
            '<div class="stammdaten-item-new"><div class="stammdaten-label">Bestandsgr\u00F6\u00DFe</div><div class="stammdaten-value">' + maklerKunden.length + ' institutionelle Kunden, 68,5 Mio. \u20AC Pr\u00E4mienvolumen</div></div>' +
        '</div></div></div>';
}

// ========================================
// MAKLER NEUGESCHÄFT
// ========================================
function renderMaklerNeugeschaeft() {
    var container = document.getElementById('maklerNeugeschaeftContent');
    if (!container) return;

    container.innerHTML =
        '<h3 class="section-title"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20"><line x1="12" y1="20" x2="12" y2="10"/><line x1="18" y1="20" x2="18" y2="4"/><line x1="6" y1="20" x2="6" y2="16"/></svg> Neugesch\u00E4ft YTD</h3>' +
        '<div class="kennzahlen-grid" style="margin-bottom:24px">' +
            '<div class="kennzahl-item"><div class="kennzahl-value">4,2 Mio. \u20AC</div><div class="kennzahl-label">Neugesch\u00E4ft Gesamt</div><div class="kennzahl-trend positive">+11,8% vs. VJ</div></div>' +
            '<div class="kennzahl-item"><div class="kennzahl-value">18</div><div class="kennzahl-label">Neue Vertr\u00E4ge</div><div class="kennzahl-trend positive">+4 vs. VJ</div></div>' +
            '<div class="kennzahl-item"><div class="kennzahl-value">3</div><div class="kennzahl-label">Neue Kunden</div><div class="kennzahl-trend positive">Ziel: 5/Jahr</div></div>' +
            '<div class="kennzahl-item"><div class="kennzahl-value">233.000 \u20AC</div><div class="kennzahl-label">\u00D8 Pr\u00E4mie/Vertrag</div><div class="kennzahl-trend positive">+12%</div></div>' +
        '</div>' +
        '<table class="makler-detail-table"><thead><tr><th>Datum</th><th>Kunde</th><th>Sparte</th><th>Versicherer</th><th class="text-right">Pr\u00E4mie/a</th><th>Status</th></tr></thead><tbody>' +
            '<tr class="clickable-row" onclick="openMaklerKundenDetail(\'MK-GW-001\')"><td>08.01.2026</td><td><strong>Klinikum Lippetal</strong></td><td>Cyberversicherung (Erweiterung)</td><td>Hiscox</td><td class="text-right">45.000 \u20AC</td><td><span class="prio-badge prio-hoch" style="background:#dcfce7;color:#166534">Policiert</span></td></tr>' +
            '<tr class="clickable-row" onclick="openMaklerKundenDetail(\'MK-IG-002\')"><td>15.12.2025</td><td><strong>Nordlicht Automatisierung</strong></td><td>Betriebsunterbrechung (Erh\u00F6hung)</td><td>Allianz</td><td class="text-right">120.000 \u20AC</td><td><span class="prio-badge prio-hoch" style="background:#dcfce7;color:#166534">Policiert</span></td></tr>' +
            '<tr class="clickable-row" onclick="openMaklerKundenDetail(\'MK-TL-003\')"><td>28.11.2025</td><td><strong>Lippeland Fracht</strong></td><td>Komplettpaket (Neukunde)</td><td>HDI / Kravag</td><td class="text-right">190.000 \u20AC</td><td><span class="prio-badge prio-hoch" style="background:#dcfce7;color:#166534">Policiert</span></td></tr>' +
            '<tr><td>22.01.2026</td><td><strong>Ev. Landeskirche Teutoburg</strong></td><td>Cyber-Rahmenvertrag</td><td>Ausschreibung</td><td class="text-right">180.000 \u20AC</td><td><span class="prio-badge prio-mittel" style="background:#fef3c7;color:#92400e">In Verhandlung</span></td></tr>' +
            '<tr><td>05.02.2026</td><td><strong>Teutoburger Maschinenbau</strong></td><td>Maschinenbruch-Erweiterung</td><td>Allianz</td><td class="text-right">32.000 \u20AC</td><td><span class="prio-badge prio-mittel" style="background:#fef3c7;color:#92400e">Angebot offen</span></td></tr>' +
            '<tr><td>10.02.2026</td><td><strong>Diakonisches Hilfswerk Westmark</strong></td><td>bKV Rahmenvertrag</td><td>DKV / Signal</td><td class="text-right">95.000 \u20AC</td><td><span class="prio-badge prio-niedrig" style="background:#eff6ff;color:#1e40af">Erstgespr\u00E4ch</span></td></tr>' +
        '</tbody></table>';
}

// ========================================
// MAKLER BESTAND
// ========================================
function renderMaklerBestand() {
    var container = document.getElementById('maklerBestandContent');
    if (!container) return;

    // Bestandsübersicht aus echten Daten
    var segmentMap = {};
    var totalPraemie = 0;
    var totalVertraege = 0;
    maklerKunden.forEach(function(k) {
        if (!segmentMap[k.segment]) segmentMap[k.segment] = { praemie: 0, vertraege: 0, kunden: 0, avgSchaden: 0 };
        segmentMap[k.segment].praemie += k.praemie;
        segmentMap[k.segment].vertraege += k.vertraege;
        segmentMap[k.segment].kunden++;
        segmentMap[k.segment].avgSchaden += k.schadenquote;
        totalPraemie += k.praemie;
        totalVertraege += k.vertraege;
    });

    var segmentRows = Object.keys(segmentMap).sort(function(a, b) { return segmentMap[b].praemie - segmentMap[a].praemie; }).map(function(seg) {
        var s = segmentMap[seg];
        var avgSch = Math.round(s.avgSchaden / s.kunden);
        var schadenClass = avgSch > 65 ? 'schaden-hoch' : (avgSch > 50 ? 'schaden-mittel' : 'schaden-niedrig');
        var pct = (s.praemie / totalPraemie * 100).toFixed(1);
        return '<tr>' +
            '<td><strong>' + seg + '</strong></td>' +
            '<td class="text-center">' + s.kunden + '</td>' +
            '<td class="text-center">' + s.vertraege + '</td>' +
            '<td class="text-right"><strong>' + (s.praemie >= 1000000 ? (s.praemie / 1000000).toFixed(1) + ' Mio. \u20AC' : s.praemie.toLocaleString('de-DE') + ' \u20AC') + '</strong></td>' +
            '<td>' + pct + '%</td>' +
            '<td><span class="' + schadenClass + '">' + avgSch + '%</span></td>' +
            '</tr>';
    }).join('');

    container.innerHTML =
        '<h3 class="section-title"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20"><path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/></svg> Bestand\u00FCbersicht</h3>' +
        '<div class="kennzahlen-grid" style="margin-bottom:24px">' +
            '<div class="kennzahl-item"><div class="kennzahl-value">68,5 Mio. \u20AC</div><div class="kennzahl-label">Gesamtbestand</div><div class="kennzahl-trend positive">+4,2% YoY</div></div>' +
            '<div class="kennzahl-item"><div class="kennzahl-value">' + totalVertraege + '</div><div class="kennzahl-label">Vertr\u00E4ge aktiv</div><div class="kennzahl-trend positive">' + maklerKunden.length + ' Kunden</div></div>' +
            '<div class="kennzahl-item"><div class="kennzahl-value">97,2%</div><div class="kennzahl-label">Retention Rate</div><div class="kennzahl-trend positive">Benchmark: 95%</div></div>' +
            '<div class="kennzahl-item"><div class="kennzahl-value">5,8 Mio. \u20AC</div><div class="kennzahl-label">Courtage YTD</div><div class="kennzahl-trend">Ziel: 6,4 Mio.</div></div>' +
        '</div>' +
        '<h4 style="margin:0 0 12px;font-size:14px;color:#475569">Bestand nach Segment</h4>' +
        '<table class="makler-detail-table"><thead><tr><th>Segment</th><th class="text-center">Kunden</th><th class="text-center">Vertr\u00E4ge</th><th class="text-right">Pr\u00E4mie/a</th><th>Anteil</th><th>\u00D8 Schadenquote</th></tr></thead>' +
        '<tbody>' + segmentRows + '</tbody></table>';
}

// ========================================
// INIT
// ========================================
document.addEventListener('DOMContentLoaded', function() {
    // Restore Makler mode
    if (safeLocalGet('maklerModus', '0') === '1') {
        maklerModus = true;
        var toggle = document.getElementById('maklerToggle');
        var label = document.getElementById('maklerToggleLabel');
        if (toggle) toggle.classList.add('active');
        if (label) label.textContent = 'Makler B2B';
        setTimeout(applyMaklerModus, 200);
    }
});

window.__registerModule('makler-overview.js');
