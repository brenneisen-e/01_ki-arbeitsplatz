// js/makler.js - Makler B2B Modus
// Ecclesia-inspirierter Industriemakler mit institutionellen Kunden

// ========================================
// MODUS-TOGGLE
// ========================================
var maklerModus = false;

function toggleMaklerModus() {
    maklerModus = !maklerModus;
    var toggle = document.getElementById('maklerToggle');
    var label = document.getElementById('maklerToggleLabel');
    if (toggle) toggle.classList.toggle('active', maklerModus);
    if (label) label.textContent = maklerModus ? 'Makler B2B' : 'Privatkunde (AO)';

    // A-02: KPIs + Kundenliste + Tabs umschalten
    applyMaklerModus();

    // Falls A-10 offen: zurück zur Liste
    var a10 = document.getElementById('kundenDetailPage');
    if (a10 && a10.style.display !== 'none') {
        if (typeof closeKundenDetail === 'function') closeKundenDetail();
    }

    localStorage.setItem('maklerModus', maklerModus ? '1' : '0');
}
window.toggleMaklerModus = toggleMaklerModus;

function applyMaklerModus() {
    // KPIs: hide private, show Makler (and vice versa)
    var privatKpis = document.querySelector('.cockpit-kpis:not(#maklerKpis)');
    var maklerKpis = document.getElementById('maklerKpis');
    if (privatKpis) privatKpis.style.display = maklerModus ? 'none' : '';
    if (maklerKpis) maklerKpis.style.display = maklerModus ? '' : 'none';

    // Kundenliste: swap private/Makler when tab-kundenliste is active
    var privatListe = document.getElementById('tab-kundenliste');
    var maklerListe = document.getElementById('tab-kundenliste-makler');

    // A-02 Tab-Buttons: hide private tabs, show Makler tabs
    var headerTabs = document.querySelector('.agentur-page-new .agentur-header-tabs');
    if (headerTabs) {
        // Hide all normal tabs in Makler mode, show Makler tabs
        headerTabs.querySelectorAll('.agentur-tab:not(.agentur-tab-makler)').forEach(function(el) {
            el.style.display = maklerModus ? 'none' : '';
        });
        // Also hide divider
        headerTabs.querySelectorAll('.agentur-tab-divider').forEach(function(el) {
            el.style.display = maklerModus ? 'none' : '';
        });
        headerTabs.querySelectorAll('.agentur-tab-makler').forEach(function(el) {
            el.style.display = maklerModus ? '' : 'none';
        });
    }

    // Tab-Inhalte: deactivate all, show correct one
    if (maklerModus) {
        // Hide all private tab content
        document.querySelectorAll('.agentur-tab-content').forEach(function(el) {
            el.classList.remove('active');
        });
        if (maklerListe) maklerListe.style.display = '';
        if (privatListe) privatListe.style.display = 'none';
        // Show Übersicht as default tab
        showMaklerTab('uebersicht');
    } else {
        // Show private, hide Makler
        if (maklerListe) { maklerListe.style.display = 'none'; maklerListe.classList.remove('active'); }
        if (privatListe) privatListe.style.display = '';
        document.querySelectorAll('.makler-tab-content').forEach(function(el) {
            el.classList.remove('active');
        });
        // Re-activate Übersicht tab
        if (typeof showAgenturTab === 'function') showAgenturTab('uebersicht');
    }

    // Header title
    var titleEl = document.getElementById('agenturPageTitle');
    if (titleEl) {
        titleEl.textContent = maklerModus ? 'Makler B2B' : 'Agentur: Max Mustermann';
    }
    var subtitleId = document.getElementById('agenturIdHeader');
    var subtitleStatus = document.getElementById('agenturStatusHeader');
    if (subtitleId) subtitleId.textContent = maklerModus ? 'Gesundheit & Soziales NRW' : 'VM00001';
    if (subtitleStatus) subtitleStatus.textContent = maklerModus ? 'Ecclesia Gruppe' : 'Aktiv';
}
window.applyMaklerModus = applyMaklerModus;

// ========================================
// MAKLER KPIs
// ========================================
var maklerKpiData = {
    bestandspraemie: { value: '68,5 Mio. €', trend: '+4,2% YoY', trendClass: 'positive' },
    neugeschaeft: { value: '4,2 Mio. €', trend: '+11,8% vs. VJ', trendClass: 'positive' },
    courtage: { value: '5,8 Mio. €', trend: 'Ziel: 6,4 Mio.', trendClass: '' },
    retention: { value: '97,2%', trend: 'Benchmark: 95%', trendClass: 'positive' },
    schadenquote: { value: '62%', trend: 'Ziel: < 65%', trendClass: 'positive' }
};

// ========================================
// Moderne einfarbige Segment-Icons (SVG)
var maklerSegmentIcons = {
    gesundheitswesen: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="14" height="14"><path d="M12 2v20M2 12h20"/><rect x="4" y="4" width="16" height="16" rx="2"/></svg>',
    kirche: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="14" height="14"><path d="M12 2v6M9 5h6M7 22V12l5-4 5 4v10M3 22h18"/></svg>',
    sozialwirtschaft: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="14" height="14"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg>',
    industrie: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="14" height="14"><path d="M2 20V8l5 4V8l5 4V8l5 4V4h5v16H2z"/></svg>',
    transport: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="14" height="14"><path d="M1 3h15v13H1z"/><path d="M16 8h4l3 4v4h-7V8z"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>'
};

// MAKLER MOCK-KUNDEN (Institutionen)
// ========================================
var maklerKunden = [
    // Gesundheitswesen
    {
        name: 'Marienhospital Detmold GmbH',
        id: 'MK-GW-001',
        segment: 'Gesundheitswesen',
        segmentIcon: maklerSegmentIcons.gesundheitswesen,
        branche: 'Akutkrankenhaus',
        betten: 450,
        mitarbeitende: 1800,
        jahresumsatz: '185 Mio. €',
        standorte: 3,
        traeger: 'Evangelisches Klinikum OWL gGmbH',
        keyContact: 'Dr. Thomas Weinert (CFO)',
        risikoklasse: 'B',
        kundeSeit: '2008',
        praemie: 1200000,
        praemieDisplay: '1,2 Mio. €',
        vertraege: 14,
        schadenquote: 58,
        deckungsquote: 78,
        naechstesRenewal: '31.03.2026',
        renewalStatus: 'rot',
        vertraegeDetail: [
            { nr: 1, sparte: 'Betriebshaftpflicht', versicherer: 'Allianz (60%) / Zurich (40%)', praemie: 285000, deckungssumme: '10 Mio. €', sb: '10.000 €', ablauf: '31.12.2026', schadenquote: 58 },
            { nr: 2, sparte: 'Arzthaftpflicht', versicherer: 'EGAS (Rahmenvertrag)', praemie: 340000, deckungssumme: '5 Mio. € p.P.', sb: '5.000 €', ablauf: '31.12.2026', schadenquote: 72 },
            { nr: 3, sparte: 'Gebäudeversicherung', versicherer: 'Provinzial', praemie: 125000, deckungssumme: '95 Mio. €', sb: '25.000 €', ablauf: '30.06.2027', schadenquote: 41 },
            { nr: 4, sparte: 'Inhaltsversicherung', versicherer: 'Provinzial', praemie: 48000, deckungssumme: '12 Mio. €', sb: '5.000 €', ablauf: '30.06.2027', schadenquote: 28 },
            { nr: 5, sparte: 'D&O', versicherer: 'Zurich', praemie: 32000, deckungssumme: '5 Mio. €', sb: '50.000 €', ablauf: '31.12.2026', schadenquote: 0 },
            { nr: 6, sparte: 'Cyberversicherung', versicherer: 'Hiscox', praemie: 45000, deckungssumme: '3 Mio. €', sb: '15.000 €', ablauf: '31.03.2026', schadenquote: 0 },
            { nr: 7, sparte: 'Betriebsunterbrechung', versicherer: 'Allianz', praemie: 68000, deckungssumme: '50 Mio. €', sb: '3 Tage', ablauf: '31.12.2026', schadenquote: 15 },
            { nr: 8, sparte: 'Kfz-Flotte (85 Fzg.)', versicherer: 'Kravag', praemie: 52000, deckungssumme: '—', sb: '500 €', ablauf: '01.01.2027', schadenquote: 68 },
            { nr: 9, sparte: 'Rechtsschutz', versicherer: 'ARAG', praemie: 18000, deckungssumme: '1 Mio. €', sb: '1.000 €', ablauf: '31.12.2026', schadenquote: 45 },
            { nr: 10, sparte: 'Elektronikversicherung', versicherer: 'HDI', praemie: 28000, deckungssumme: '8 Mio. €', sb: '2.500 €', ablauf: '30.09.2026', schadenquote: 22 },
            { nr: 11, sparte: 'Vertrauensschaden', versicherer: 'Zurich', praemie: 12000, deckungssumme: '2 Mio. €', sb: '10.000 €', ablauf: '31.12.2026', schadenquote: 0 },
            { nr: 12, sparte: 'bKV (1.800 MA)', versicherer: 'DKV', praemie: 86000, deckungssumme: 'Budget 600 €/MA', sb: '—', ablauf: '31.12.2026', schadenquote: 82 },
            { nr: 13, sparte: 'bAV (Direktversicherung)', versicherer: 'Allianz', praemie: 42000, deckungssumme: '—', sb: '—', ablauf: 'unbefristet', schadenquote: null },
            { nr: 14, sparte: 'Transportversicherung', versicherer: 'Helvetia', praemie: 8000, deckungssumme: '500.000 €', sb: '500 €', ablauf: '31.12.2026', schadenquote: 12 }
        ],
        deckungsluecken: [
            { risiko: 'Umwelthaftpflicht', status: 'Nicht versichert', empfehlung: 'Separate Police empfohlen (Labor, Gefahrstoffe)', prioritaet: 'Hoch' },
            { risiko: 'Maschinenbruch (med. Großgeräte)', status: 'Nicht separat versichert', empfehlung: 'MRT, CT, OP-Robotik absichern', prioritaet: 'Hoch' },
            { risiko: 'Epidemie-/Pandemie-BU', status: 'Sublimit erschöpft', empfehlung: 'Deckungserweiterung prüfen', prioritaet: 'Mittel' },
            { risiko: 'Organhaftpflicht (Aufsichtsrat)', status: 'Nicht versichert', empfehlung: 'Separate OR-D&O empfohlen', prioritaet: 'Mittel' },
            { risiko: 'Drohnen-Haftpflicht (Helipad)', status: 'Nicht geprüft', empfehlung: 'Neue Risikokategorie evaluieren', prioritaet: 'Niedrig' }
        ],
        schadenhistorie: [
            { jahr: 2025, anzahl: 28, volumen: 580000, quote: 48, groesster: '185.000 € (Arzthaftpflicht)' },
            { jahr: 2024, anzahl: 34, volumen: 720000, quote: 62, groesster: '210.000 € (Arzthaftpflicht)' },
            { jahr: 2023, anzahl: 41, volumen: 890000, quote: 78, groesster: '340.000 € (Gebäude - Wasserschaden)' },
            { jahr: 2022, anzahl: 22, volumen: 410000, quote: 36, groesster: '95.000 € (Betriebshaftpflicht)' },
            { jahr: 2021, anzahl: 31, volumen: 650000, quote: 58, groesster: '280.000 € (Arzthaftpflicht)' }
        ]
    },
    {
        name: 'Reha-Zentrum Ostwestfalen',
        id: 'MK-GW-002',
        segment: 'Gesundheitswesen',
        segmentIcon: maklerSegmentIcons.gesundheitswesen,
        branche: 'Rehabilitationsklinik',
        betten: 120,
        mitarbeitende: 280,
        jahresumsatz: '32 Mio. €',
        standorte: 1,
        traeger: 'Eigenständig',
        keyContact: 'Sandra Meier (Verwaltungsleiterin)',
        risikoklasse: 'C',
        kundeSeit: '2015',
        praemie: 340000,
        praemieDisplay: '340.000 €',
        vertraege: 9,
        schadenquote: 42,
        deckungsquote: 72,
        naechstesRenewal: '31.12.2026',
        renewalStatus: 'gruen',
        vertraegeDetail: [
            { nr: 1, sparte: 'Betriebshaftpflicht', versicherer: 'HDI', praemie: 85000, deckungssumme: '5 Mio. €', sb: '5.000 €', ablauf: '31.12.2026', schadenquote: 35 },
            { nr: 2, sparte: 'Arzthaftpflicht', versicherer: 'EGAS (Rahmenvertrag)', praemie: 95000, deckungssumme: '3 Mio. € p.P.', sb: '2.500 €', ablauf: '31.12.2026', schadenquote: 55 },
            { nr: 3, sparte: 'Gebäudeversicherung', versicherer: 'VGH', praemie: 62000, deckungssumme: '28 Mio. €', sb: '10.000 €', ablauf: '31.12.2026', schadenquote: 22 }
        ],
        deckungsluecken: [
            { risiko: 'Cyberversicherung', status: 'Nicht versichert', empfehlung: 'Patientendaten-Schutz essentiell', prioritaet: 'Hoch' },
            { risiko: 'D&O', status: 'Nicht versichert', empfehlung: 'Managerhaftpflicht empfohlen', prioritaet: 'Mittel' }
        ],
        schadenhistorie: [
            { jahr: 2025, anzahl: 8, volumen: 95000, quote: 28, groesster: '42.000 € (Arzthaftpflicht)' },
            { jahr: 2024, anzahl: 12, volumen: 145000, quote: 43, groesster: '68.000 € (Arzthaftpflicht)' }
        ]
    },
    {
        name: 'MVZ Gesundheit Plus GmbH',
        id: 'MK-GW-003',
        segment: 'Gesundheitswesen',
        segmentIcon: maklerSegmentIcons.gesundheitswesen,
        branche: 'Medizinisches Versorgungszentrum',
        betten: null,
        mitarbeitende: 45,
        jahresumsatz: '6,8 Mio. €',
        standorte: 2,
        traeger: 'Eigenständig',
        keyContact: 'Dr. Petra Schneider (Geschäftsführerin)',
        risikoklasse: 'C',
        kundeSeit: '2020',
        praemie: 85000,
        praemieDisplay: '85.000 €',
        vertraege: 6,
        schadenquote: 18,
        deckungsquote: 65,
        naechstesRenewal: '01.07.2026',
        renewalStatus: 'gelb'
    },
    {
        name: 'Seniorenresidenz Am Kirchplatz',
        id: 'MK-GW-004',
        segment: 'Gesundheitswesen',
        segmentIcon: maklerSegmentIcons.gesundheitswesen,
        branche: 'Pflegeeinrichtung',
        betten: 180,
        mitarbeitende: 220,
        jahresumsatz: '14 Mio. €',
        standorte: 1,
        traeger: 'Diakonisches Werk',
        keyContact: 'Heike Bergmann (Einrichtungsleiterin)',
        risikoklasse: 'B',
        kundeSeit: '2012',
        praemie: 190000,
        praemieDisplay: '190.000 €',
        vertraege: 8,
        schadenquote: 35,
        deckungsquote: 80,
        naechstesRenewal: '31.12.2026',
        renewalStatus: 'gruen'
    },
    // Kirche
    {
        name: 'Evangelische Kirche von Westfalen',
        id: 'MK-KI-001',
        segment: 'Kirche',
        segmentIcon: maklerSegmentIcons.kirche,
        branche: 'Landeskirche',
        betten: null,
        mitarbeitende: null,
        jahresumsatz: null,
        standorte: null,
        traeger: '1.900 Kirchengemeinden',
        keyContact: 'OKR Dr. Friedrich Lange (Finanzdezernent)',
        risikoklasse: 'A',
        kundeSeit: '1998',
        praemie: 12500000,
        praemieDisplay: '12,5 Mio. €',
        vertraege: 38,
        schadenquote: 48,
        deckungsquote: 92,
        naechstesRenewal: '01.01.2027',
        renewalStatus: 'gruen',
        vertraegeDetail: [
            { nr: 1, sparte: 'Gebäude (Rahmenvertrag)', versicherer: 'Provinzial / VGH', praemie: 4800000, deckungssumme: '2,1 Mrd. €', sb: '50.000 €', ablauf: '01.01.2027', schadenquote: 52 },
            { nr: 2, sparte: 'Haftpflicht (Rahmenvertrag)', versicherer: 'Allianz', praemie: 2200000, deckungssumme: '50 Mio. €', sb: '25.000 €', ablauf: '01.01.2027', schadenquote: 38 },
            { nr: 3, sparte: 'Kfz-Flotte (2.400 Fzg.)', versicherer: 'Kravag / R+V', praemie: 1800000, deckungssumme: '—', sb: '1.000 €', ablauf: '01.01.2027', schadenquote: 65 },
            { nr: 4, sparte: 'D&O Leitende', versicherer: 'Zurich', praemie: 180000, deckungssumme: '20 Mio. €', sb: '100.000 €', ablauf: '01.01.2027', schadenquote: 0 }
        ],
        deckungsluecken: [
            { risiko: 'Cyber (Kirchenverwaltungen)', status: 'Nur teilweise', empfehlung: 'Zentraler Rahmenvertrag empfohlen', prioritaet: 'Hoch' },
            { risiko: 'Missbrauchsprävention', status: 'In Prüfung', empfehlung: 'Spezialdeckung evaluieren', prioritaet: 'Hoch' }
        ],
        schadenhistorie: [
            { jahr: 2025, anzahl: 186, volumen: 4200000, quote: 34, groesster: '890.000 € (Gebäude - Kirchenbrand)' },
            { jahr: 2024, anzahl: 224, volumen: 5800000, quote: 46, groesster: '1,2 Mio. € (Gebäude - Sturmschaden)' }
        ]
    },
    {
        name: 'Bistum Paderborn',
        id: 'MK-KI-002',
        segment: 'Kirche',
        segmentIcon: maklerSegmentIcons.kirche,
        branche: 'Bistum',
        betten: null,
        mitarbeitende: null,
        jahresumsatz: null,
        standorte: null,
        traeger: '700 Pfarreien',
        keyContact: 'Msgr. Dr. Michael Hardt (Generalvikar)',
        risikoklasse: 'A',
        kundeSeit: '2001',
        praemie: 8300000,
        praemieDisplay: '8,3 Mio. €',
        vertraege: 29,
        schadenquote: 44,
        deckungsquote: 88,
        naechstesRenewal: '01.01.2027',
        renewalStatus: 'gruen'
    },
    {
        name: 'Kirchenkreis Lippe',
        id: 'MK-KI-003',
        segment: 'Kirche',
        segmentIcon: maklerSegmentIcons.kirche,
        branche: 'Kirchenkreis',
        betten: null,
        mitarbeitende: null,
        jahresumsatz: null,
        standorte: null,
        traeger: '42 Kirchengemeinden',
        keyContact: 'Sup. Karsten Müller',
        risikoklasse: 'B',
        kundeSeit: '2005',
        praemie: 620000,
        praemieDisplay: '620.000 €',
        vertraege: 11,
        schadenquote: 38,
        deckungsquote: 75,
        naechstesRenewal: '01.04.2026',
        renewalStatus: 'gelb'
    },
    // Sozialwirtschaft
    {
        name: 'Diakonisches Werk RWL',
        id: 'MK-SW-001',
        segment: 'Sozialwirtschaft',
        segmentIcon: maklerSegmentIcons.sozialwirtschaft,
        branche: 'Wohlfahrtsverband',
        betten: null,
        mitarbeitende: 4500,
        jahresumsatz: '280 Mio. €',
        standorte: 45,
        traeger: 'Diakonie Deutschland',
        keyContact: 'Dr. Helga Krause (Vorstand Finanzen)',
        risikoklasse: 'B',
        kundeSeit: '2003',
        praemie: 1800000,
        praemieDisplay: '1,8 Mio. €',
        vertraege: 16,
        schadenquote: 52,
        deckungsquote: 82,
        naechstesRenewal: '31.12.2026',
        renewalStatus: 'gruen'
    },
    {
        name: 'Caritas-Werkstätten Paderborn',
        id: 'MK-SW-002',
        segment: 'Sozialwirtschaft',
        segmentIcon: maklerSegmentIcons.sozialwirtschaft,
        branche: 'Behindertenwerkstatt',
        betten: null,
        mitarbeitende: 800,
        jahresumsatz: '22 Mio. €',
        standorte: 4,
        traeger: 'Caritasverband Paderborn',
        keyContact: 'Klaus Hentschel (Geschäftsführer)',
        risikoklasse: 'B',
        kundeSeit: '2011',
        praemie: 280000,
        praemieDisplay: '280.000 €',
        vertraege: 7,
        schadenquote: 32,
        deckungsquote: 70,
        naechstesRenewal: '30.06.2026',
        renewalStatus: 'gelb'
    },
    {
        name: 'AWO Kreisverband Detmold',
        id: 'MK-SW-003',
        segment: 'Sozialwirtschaft',
        segmentIcon: maklerSegmentIcons.sozialwirtschaft,
        branche: 'Wohlfahrtsverband',
        betten: null,
        mitarbeitende: 1200,
        jahresumsatz: '48 Mio. €',
        standorte: 12,
        traeger: 'AWO Bundesverband',
        keyContact: 'Ingrid Falk (Vorständin)',
        risikoklasse: 'B',
        kundeSeit: '2014',
        praemie: 420000,
        praemieDisplay: '420.000 €',
        vertraege: 10,
        schadenquote: 40,
        deckungsquote: 74,
        naechstesRenewal: '31.12.2026',
        renewalStatus: 'gruen'
    },
    // Industrie & Gewerbe
    {
        name: 'Weidmüller Interface GmbH',
        id: 'MK-IG-001',
        segment: 'Industrie & Gewerbe',
        segmentIcon: maklerSegmentIcons.industrie,
        branche: 'Elektrotechnik',
        betten: null,
        mitarbeitende: 5200,
        jahresumsatz: '920 Mio. €',
        standorte: 8,
        traeger: 'Eigenständig (Detmold)',
        keyContact: 'Dr. Martin Köhler (CFO)',
        risikoklasse: 'B',
        kundeSeit: '2010',
        praemie: 3800000,
        praemieDisplay: '3,8 Mio. €',
        vertraege: 22,
        schadenquote: 45,
        deckungsquote: 85,
        naechstesRenewal: '31.12.2026',
        renewalStatus: 'gruen'
    },
    {
        name: 'Phoenix Contact GmbH',
        id: 'MK-IG-002',
        segment: 'Industrie & Gewerbe',
        segmentIcon: maklerSegmentIcons.industrie,
        branche: 'Elektrotechnik / Automatisierung',
        betten: null,
        mitarbeitende: 22000,
        jahresumsatz: '3,4 Mrd. €',
        standorte: 55,
        traeger: 'Eigenständig (Blomberg)',
        keyContact: 'Frank Stührenberg (CEO)',
        risikoklasse: 'A',
        kundeSeit: '2006',
        praemie: 9500000,
        praemieDisplay: '9,5 Mio. €',
        vertraege: 31,
        schadenquote: 38,
        deckungsquote: 94,
        naechstesRenewal: '01.01.2027',
        renewalStatus: 'gruen'
    },
    {
        name: 'Boge Kompressoren GmbH',
        id: 'MK-IG-003',
        segment: 'Industrie & Gewerbe',
        segmentIcon: maklerSegmentIcons.industrie,
        branche: 'Maschinenbau',
        betten: null,
        mitarbeitende: 900,
        jahresumsatz: '145 Mio. €',
        standorte: 3,
        traeger: 'Eigenständig (Bielefeld)',
        keyContact: 'Andrea Flemming (Leiterin Einkauf)',
        risikoklasse: 'B',
        kundeSeit: '2018',
        praemie: 680000,
        praemieDisplay: '680.000 €',
        vertraege: 12,
        schadenquote: 55,
        deckungsquote: 78,
        naechstesRenewal: '30.09.2026',
        renewalStatus: 'gelb'
    },
    // Transport & Logistik
    {
        name: 'Hellmann Worldwide Logistics',
        id: 'MK-TL-001',
        segment: 'Transport & Logistik',
        segmentIcon: maklerSegmentIcons.transport,
        branche: 'Spedition / Logistik',
        betten: null,
        mitarbeitende: 12500,
        jahresumsatz: '4,2 Mrd. €',
        standorte: 260,
        traeger: 'Eigenständig (Osnabrück)',
        keyContact: 'Reiner Heiken (CEO)',
        risikoklasse: 'B',
        kundeSeit: '2009',
        praemie: 2400000,
        praemieDisplay: '2,4 Mio. €',
        vertraege: 18,
        schadenquote: 58,
        deckungsquote: 88,
        naechstesRenewal: '01.01.2027',
        renewalStatus: 'gruen'
    },
    {
        name: 'Emons Spedition GmbH',
        id: 'MK-TL-002',
        segment: 'Transport & Logistik',
        segmentIcon: maklerSegmentIcons.transport,
        branche: 'Spedition',
        betten: null,
        mitarbeitende: 1800,
        jahresumsatz: '380 Mio. €',
        standorte: 22,
        traeger: 'Eigenständig',
        keyContact: 'Jürgen Emons (Geschäftsführer)',
        risikoklasse: 'B',
        kundeSeit: '2013',
        praemie: 740000,
        praemieDisplay: '740.000 €',
        vertraege: 11,
        schadenquote: 62,
        deckungsquote: 75,
        naechstesRenewal: '31.12.2026',
        renewalStatus: 'gruen'
    },
    {
        name: 'RegioFracht OWL GmbH',
        id: 'MK-TL-003',
        segment: 'Transport & Logistik',
        segmentIcon: maklerSegmentIcons.transport,
        branche: 'Regionalspedition',
        betten: null,
        mitarbeitende: 120,
        jahresumsatz: '18 Mio. €',
        standorte: 2,
        traeger: 'Eigenständig',
        keyContact: 'Bernd Wieland (Inhaber)',
        risikoklasse: 'C',
        kundeSeit: '2021',
        praemie: 190000,
        praemieDisplay: '190.000 €',
        vertraege: 7,
        schadenquote: 48,
        deckungsquote: 62,
        naechstesRenewal: '01.04.2026',
        renewalStatus: 'gelb'
    }
];

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

    // Dispatch event for Page ID Tracker
    document.dispatchEvent(new CustomEvent('viewChanged', {
        detail: { module: 'versicherung', view: 'kundendetail' }
    }));
}
window.openMaklerKundenDetail = openMaklerKundenDetail;

// Saved original HTML for restoration
var _origA02HeaderTabs = null;
var _origKundenTabs = null;
var _origStickyBarRight = null;
var _origDropdownHTML = null;
var _maklerDetailActive = false;

function fillMaklerDetail(kunde) {
    _maklerDetailActive = true;

    // ============================
    // 1) SHARED HEADER (top bar)
    // ============================
    var headerTitle = document.getElementById('kundenHeaderTitle');
    if (headerTitle) headerTitle.textContent = 'Makler B2B';
    var headerId = document.getElementById('kundenHeaderId');
    if (headerId) headerId.textContent = 'GS NRW | Ecclesia Gruppe';

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

    // Foto → Segment-Icon
    var foto = document.querySelector('.kunden-foto');
    if (foto) {
        var segColor = '';
        if (kunde.segment === 'Gesundheitswesen') segColor = '#3b82f6';
        else if (kunde.segment === 'Kirche') segColor = '#8b5cf6';
        else if (kunde.segment === 'Sozialwirtschaft') segColor = '#f59e0b';
        else if (kunde.segment === 'Industrie & Gewerbe') segColor = '#64748b';
        else if (kunde.segment === 'Transport & Logistik') segColor = '#22c55e';
        else segColor = '#3b82f6';
        foto.style.background = segColor;
        foto.innerHTML = '<span class="makler-segment-photo-icon">' + kunde.segmentIcon + '</span>';
    }

    // ============================
    // 5) STAMMDATEN → Makler-Stammdaten
    // ============================
    var privatStamm = document.getElementById('privatStammdaten');
    var maklerStamm = document.getElementById('maklerStammdaten');
    if (privatStamm) privatStamm.style.display = 'none';
    if (maklerStamm) {
        maklerStamm.style.display = '';
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
    if (vertraegeBody && kunde.vertraegeDetail) {
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

    // Restore sticky bar labels
    var npsLabel = document.querySelector('#kundenDetailPage .kunde-sticky-kpi:nth-child(1) .kunde-sticky-kpi-label');
    if (npsLabel) npsLabel.textContent = 'NPS';
    var clvLabel = document.querySelector('#kundenDetailPage .kunde-sticky-kpi:nth-child(2) .kunde-sticky-kpi-label');
    if (clvLabel) clvLabel.textContent = 'CLV';
    var segLabel = document.querySelector('#kundenDetailPage .kunde-sticky-kpi:nth-child(3) .kunde-sticky-kpi-label');
    if (segLabel) segLabel.textContent = 'Segment';

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

// Navigate from A-10 back to A-02 Makler tab
function navigateToMaklerTab(tabName) {
    document.getElementById('kundenDetailPage').style.display = 'none';
    var agenturOverview = document.getElementById('agenturOverview');
    if (agenturOverview) agenturOverview.style.display = 'block';
    if (typeof showMaklerTab === 'function') showMaklerTab(tabName);
    document.dispatchEvent(new CustomEvent('viewChanged', { detail: { module: 'versicherung', view: 'agentursicht' } }));
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

// ========================================
// B2B A-10 TAB RENDERERS (separate tabs)
// ========================================

function renderB2bSchadenhistorie(kunde) {
    var container = document.getElementById('b2bSchadenContent');
    if (!container) return;
    if (!kunde.schadenhistorie || kunde.schadenhistorie.length === 0) {
        container.innerHTML = '<p class="text-muted">Keine Schadenhistorie vorhanden.</p>';
        return;
    }

    var rows = kunde.schadenhistorie.map(function(s) {
        var qClass = s.quote > 65 ? 'schaden-hoch' : (s.quote > 50 ? 'schaden-mittel' : 'schaden-niedrig');
        return '<tr><td><strong>' + s.jahr + '</strong></td><td>' + s.anzahl + '</td>' +
            '<td class="text-right">' + s.volumen.toLocaleString('de-DE') + ' €</td>' +
            '<td><span class="' + qClass + '">' + s.quote + '%</span></td>' +
            '<td>' + s.groesster + '</td></tr>';
    }).join('');

    // KPI summary
    var totalSchaden = kunde.schadenhistorie.reduce(function(a, s) { return a + s.volumen; }, 0);
    var avgQuote = Math.round(kunde.schadenhistorie.reduce(function(a, s) { return a + s.quote; }, 0) / kunde.schadenhistorie.length);
    var trend = kunde.schadenhistorie.length >= 2 ? (kunde.schadenhistorie[0].quote - kunde.schadenhistorie[1].quote) : 0;
    var trendClass = trend < 0 ? 'positive' : (trend > 0 ? 'negative' : '');
    var trendText = trend < 0 ? (trend + '% ggü. VJ') : (trend > 0 ? '+' + trend + '% ggü. VJ' : '±0% ggü. VJ');

    container.innerHTML =
        '<div class="mk-kpi-row" style="display:flex;gap:24px;margin-bottom:20px">' +
            '<div class="mk-kpi-box"><span class="mk-kpi-label">Gesamtvolumen (' + kunde.schadenhistorie.length + ' J.)</span><span class="mk-kpi-value">' + (totalSchaden >= 1000000 ? (totalSchaden / 1000000).toFixed(1) + ' Mio. €' : totalSchaden.toLocaleString('de-DE') + ' €') + '</span></div>' +
            '<div class="mk-kpi-box"><span class="mk-kpi-label">Ø Schadenquote</span><span class="mk-kpi-value">' + avgQuote + '%</span></div>' +
            '<div class="mk-kpi-box"><span class="mk-kpi-label">Trend aktuelles Jahr</span><span class="mk-kpi-value ' + trendClass + '">' + trendText + '</span></div>' +
        '</div>' +
        '<table class="makler-detail-table"><thead><tr><th>Jahr</th><th>Anzahl</th><th class="text-right">Volumen</th><th>Quote</th><th>Größter Einzelschaden</th></tr></thead><tbody>' + rows + '</tbody></table>';
}

function renderB2bDeckungsluecken(kunde) {
    var container = document.getElementById('b2bDeckungslueckenContent');
    if (!container) return;
    if (!kunde.deckungsluecken || kunde.deckungsluecken.length === 0) {
        container.innerHTML = '<p class="text-muted">Keine Deckungslücken identifiziert.</p>';
        return;
    }

    var hoch = kunde.deckungsluecken.filter(function(d) { return d.prioritaet === 'Hoch'; }).length;
    var mittel = kunde.deckungsluecken.filter(function(d) { return d.prioritaet === 'Mittel'; }).length;

    var rows = kunde.deckungsluecken.map(function(d) {
        var pClass = d.prioritaet === 'Hoch' ? 'prio-hoch' : (d.prioritaet === 'Mittel' ? 'prio-mittel' : 'prio-niedrig');
        return '<tr><td><strong>' + d.risiko + '</strong></td>' +
            '<td><span class="status-badge-dl">' + d.status + '</span></td>' +
            '<td>' + d.empfehlung + '</td>' +
            '<td><span class="prio-badge ' + pClass + '">' + d.prioritaet + '</span></td></tr>';
    }).join('');

    container.innerHTML =
        '<div class="mk-kpi-row" style="display:flex;gap:24px;margin-bottom:20px">' +
            '<div class="mk-kpi-box"><span class="mk-kpi-label">Gesamt</span><span class="mk-kpi-value">' + kunde.deckungsluecken.length + ' Lücken</span></div>' +
            '<div class="mk-kpi-box"><span class="mk-kpi-label">Hohe Priorität</span><span class="mk-kpi-value negative">' + hoch + '</span></div>' +
            '<div class="mk-kpi-box"><span class="mk-kpi-label">Mittlere Priorität</span><span class="mk-kpi-value">' + mittel + '</span></div>' +
            '<div class="mk-kpi-box"><span class="mk-kpi-label">Deckungsquote</span><span class="mk-kpi-value">' + kunde.deckungsquote + '%</span></div>' +
        '</div>' +
        '<table class="makler-detail-table"><thead><tr><th>Risiko</th><th>Status</th><th>Empfehlung</th><th>Priorität</th></tr></thead><tbody>' + rows + '</tbody></table>';
}

function renderB2bRenewal(kunde) {
    var container = document.getElementById('b2bRenewalContent');
    if (!container) return;
    if (!kunde.vertraegeDetail) { container.innerHTML = '<p class="text-muted">Keine Vertragsdaten vorhanden.</p>'; return; }

    var now = new Date();
    var d30 = new Date(now); d30.setDate(d30.getDate() + 30);
    var d90 = new Date(now); d90.setDate(d90.getDate() + 90);
    var d180 = new Date(now); d180.setDate(d180.getDate() + 180);

    var rot = [], gelb = [], gruen = [], rest = [];
    kunde.vertraegeDetail.forEach(function(v) {
        if (v.ablauf === 'unbefristet') return;
        var parts = v.ablauf.split('.');
        var ablauf = new Date(parts[2], parseInt(parts[1]) - 1, parseInt(parts[0]));
        var item = { sparte: v.sparte, versicherer: v.versicherer, praemie: v.praemie, ablauf: v.ablauf, schadenquote: v.schadenquote };
        if (ablauf <= d30) rot.push(item);
        else if (ablauf <= d90) gelb.push(item);
        else if (ablauf <= d180) gruen.push(item);
        else rest.push(item);
    });

    function renderGroup(label, items, cssClass) {
        if (items.length === 0) return '<div class="renewal-group"><div class="renewal-group-label ' + cssClass + '">' + label + ' (0)</div></div>';
        var rows = items.map(function(i) {
            var sqText = i.schadenquote !== null && i.schadenquote !== undefined ? ' | SQ: ' + i.schadenquote + '%' : '';
            return '<div class="renewal-item"><span class="renewal-sparte">' + i.sparte + '</span><span class="renewal-versicherer">' + i.versicherer + sqText + '</span><span class="renewal-ablauf">' + i.ablauf + '</span></div>';
        }).join('');
        return '<div class="renewal-group"><div class="renewal-group-label ' + cssClass + '">' + label + ' (' + items.length + ')</div>' + rows + '</div>';
    }

    container.innerHTML =
        '<div class="mk-kpi-row" style="display:flex;gap:24px;margin-bottom:20px">' +
            '<div class="mk-kpi-box"><span class="mk-kpi-label">Kritisch (≤30 Tage)</span><span class="mk-kpi-value negative">' + rot.length + '</span></div>' +
            '<div class="mk-kpi-box"><span class="mk-kpi-label">Bald fällig (31-90)</span><span class="mk-kpi-value" style="color:#f59e0b">' + gelb.length + '</span></div>' +
            '<div class="mk-kpi-box"><span class="mk-kpi-label">In 91-180 Tagen</span><span class="mk-kpi-value positive">' + gruen.length + '</span></div>' +
            '<div class="mk-kpi-box"><span class="mk-kpi-label">Nächstes Renewal</span><span class="mk-kpi-value">' + kunde.naechstesRenewal + '</span></div>' +
        '</div>' +
        renderGroup('Kritisch – Nächste 30 Tage', rot, 'renewal-rot') +
        renderGroup('Bald fällig – 31 bis 90 Tage', gelb, 'renewal-gelb') +
        renderGroup('Geplant – 91 bis 180 Tage', gruen, 'renewal-gruen') +
        renderGroup('Langfristig – >180 Tage', rest, 'renewal-gruen');
}

function renderB2bAnsprechpartner(kunde) {
    var container = document.getElementById('b2bAnsprechpartnerContent');
    if (!container) return;

    // Generate Ansprechpartner from customer data
    var contacts = [];
    if (kunde.keyContact) {
        var parts = kunde.keyContact.match(/^(.+?)(?:\s*\((.+?)\))?$/);
        contacts.push({ name: parts ? parts[1] : kunde.keyContact, rolle: parts && parts[2] ? parts[2] : 'Hauptansprechpartner', typ: 'Entscheider', tel: '+49 5231 ' + (70000 + Math.floor(Math.random() * 9999)), email: (parts ? parts[1] : 'kontakt').toLowerCase().replace(/[^a-z]/g, '.').replace(/\.+/g, '.') + '@' + kunde.name.toLowerCase().replace(/[^a-z]/g, '').substring(0, 12) + '.de' });
    }
    // Add some typical contacts based on segment
    if (kunde.segment === 'Gesundheitswesen') {
        contacts.push({ name: 'Barbara Schäfer', rolle: 'Leiterin Einkauf & Vergabe', typ: 'Operativ', tel: '+49 5231 72-450', email: 'b.schaefer@' + kunde.name.toLowerCase().replace(/[^a-z]/g, '').substring(0, 12) + '.de' });
        contacts.push({ name: 'Markus Dietrich', rolle: 'Facility Management', typ: 'Fachlich', tel: '+49 5231 72-280', email: 'm.dietrich@' + kunde.name.toLowerCase().replace(/[^a-z]/g, '').substring(0, 12) + '.de' });
    } else if (kunde.segment === 'Kirche') {
        contacts.push({ name: 'Renate Berger', rolle: 'Leiterin Finanzabteilung', typ: 'Operativ', tel: '+49 521 8321-500', email: 'r.berger@kirche-owl.de' });
    } else {
        contacts.push({ name: 'Petra Hoffmann', rolle: 'Assistenz Geschäftsführung', typ: 'Operativ', tel: '+49 5231 93-100', email: 'p.hoffmann@' + kunde.name.toLowerCase().replace(/[^a-z]/g, '').substring(0, 12) + '.de' });
    }

    var rows = contacts.map(function(c) {
        var typBadge = c.typ === 'Entscheider' ? 'prio-hoch' : (c.typ === 'Operativ' ? 'prio-mittel' : 'prio-niedrig');
        return '<tr>' +
            '<td><strong>' + c.name + '</strong></td>' +
            '<td>' + c.rolle + '</td>' +
            '<td><span class="prio-badge ' + typBadge + '">' + c.typ + '</span></td>' +
            '<td>' + c.tel + '</td>' +
            '<td><a href="mailto:' + c.email + '" style="color:#3b82f6">' + c.email + '</a></td>' +
            '</tr>';
    }).join('');

    container.innerHTML =
        '<div class="mk-kpi-row" style="display:flex;gap:24px;margin-bottom:20px">' +
            '<div class="mk-kpi-box"><span class="mk-kpi-label">Ansprechpartner</span><span class="mk-kpi-value">' + contacts.length + '</span></div>' +
            '<div class="mk-kpi-box"><span class="mk-kpi-label">Key Contact</span><span class="mk-kpi-value" style="font-size:13px">' + (kunde.keyContact || '—') + '</span></div>' +
            '<div class="mk-kpi-box"><span class="mk-kpi-label">Kunde seit</span><span class="mk-kpi-value">' + (kunde.kundeSeit || '—') + '</span></div>' +
        '</div>' +
        '<table class="makler-detail-table"><thead><tr><th>Name</th><th>Rolle / Funktion</th><th>Typ</th><th>Telefon</th><th>E-Mail</th></tr></thead><tbody>' + rows + '</tbody></table>';
}

function renderB2bPotentiale(kunde) {
    var container = document.getElementById('b2bPotentialeContent');
    if (!container) return;

    // Generate potentials based on Deckungslücken and segment
    var potentials = [];

    // From Deckungslücken
    if (kunde.deckungsluecken) {
        kunde.deckungsluecken.forEach(function(d, idx) {
            if (d.prioritaet === 'Hoch' || d.prioritaet === 'Mittel') {
                var estPraemie = d.prioritaet === 'Hoch' ? Math.round(kunde.praemie * 0.08) : Math.round(kunde.praemie * 0.04);
                // Generate rich detail data
                var versicherer = [];
                var naechsteSchritte = [];
                if (d.risiko.includes('Umwelt')) {
                    versicherer = ['Allianz Umwelthaftpflicht (Rahmenvertrag)', 'HDI Umwelthaftpflicht Spezial', 'AXA Eco-Protect'];
                    naechsteSchritte = ['Risiko-Audit vor Ort durchführen', 'Laborbestände und Gefahrstoffklassen erfassen', 'Angebote bei 3 Versicherern einholen'];
                } else if (d.risiko.includes('Maschinen')) {
                    versicherer = ['Allianz Maschinen-Allgefahren', 'Zurich Medical Equipment Cover', 'Provinzial Medizintechnik-Paket'];
                    naechsteSchritte = ['Inventarliste med. Großgeräte anfordern', 'Wartungsverträge prüfen', 'Versicherungssumme kalkulieren'];
                } else if (d.risiko.includes('Cyber')) {
                    versicherer = ['Hiscox CyberClear', 'AIG CyberEdge', 'Zurich Cyber-Police'];
                    naechsteSchritte = ['IT-Sicherheitsaudit initiieren', 'Datenschutz-Compliance prüfen', 'Angebote einholen und vergleichen'];
                } else if (d.risiko.includes('D&O') || d.risiko.includes('Organ')) {
                    versicherer = ['Zurich D&O Executive', 'AIG Directors Shield', 'Chubb Management Liability'];
                    naechsteSchritte = ['Gremienstruktur dokumentieren', 'Haftungsrisiken analysieren', 'Deckungssumme festlegen'];
                } else if (d.risiko.includes('Pandemie') || d.risiko.includes('Epidemie')) {
                    versicherer = ['Allianz BU-Erweiterung', 'Munich Re Parametric', 'Swiss Re Pandemic Cover'];
                    naechsteSchritte = ['Aktuelle Sublimits prüfen', 'Pandemie-Szenario berechnen', 'Erweiterungsangebot verhandeln'];
                } else if (d.risiko.includes('Missbrauch')) {
                    versicherer = ['Ecclesia Missbrauchsprävention', 'Zurich Social Care', 'HDI Institutionen-Schutz'];
                    naechsteSchritte = ['Präventionskonzept bewerten', 'Deckungsumfang definieren', 'Rahmenvertrag prüfen'];
                } else {
                    versicherer = ['Allianz Spezial-Police', 'HDI Firmenschutz', 'Zurich Industrie-Paket'];
                    naechsteSchritte = ['Risikobewertung durchführen', 'Angebote einholen', 'Vorstandsgespräch vereinbaren'];
                }
                potentials.push({
                    id: 'b2bpot-dl-' + idx,
                    produkt: d.risiko,
                    quelle: 'Deckungslücke',
                    prioritaet: d.prioritaet,
                    status: d.status,
                    geschaetztePraemie: estPraemie,
                    empfehlung: d.empfehlung,
                    versicherer: versicherer,
                    naechsteSchritte: naechsteSchritte,
                    herleitung: 'Identifiziert durch Bestandsanalyse: ' + d.status + '. ' + d.empfehlung
                });
            }
        });
    }

    // Add segment-specific cross-selling
    if (kunde.segment === 'Gesundheitswesen') {
        potentials.push({
            id: 'b2bpot-cs-1',
            produkt: 'Erweiterter Haftpflicht-Rahmenvertrag',
            quelle: 'KI-Analyse',
            prioritaet: 'Mittel',
            status: 'Nicht angeboten',
            geschaetztePraemie: Math.round(kunde.praemie * 0.05),
            empfehlung: 'Aktuelle Trends in Klinik-Haftpflicht berücksichtigen',
            versicherer: ['EGAS Rahmenvertrag Plus', 'Allianz Klinik-Haftpflicht XL', 'HDI Medizinische Einrichtungen'],
            naechsteSchritte: ['Aktuelle Haftpflichtdeckung analysieren', 'Gaps zu Branchenstandard identifizieren', 'Erweiterungsangebot erstellen'],
            herleitung: 'KI-Analyse: Kliniken ähnlicher Größe haben 15% höhere Haftpflichtdeckung. Aktuelle Police unter Benchmark.'
        });
        if (!kunde.vertraegeDetail || !kunde.vertraegeDetail.some(function(v) { return v.sparte.includes('bKV'); })) {
            potentials.push({
                id: 'b2bpot-cs-2',
                produkt: 'betriebliche Krankenversicherung (bKV)',
                quelle: 'Cross-Selling',
                prioritaet: 'Mittel',
                status: 'Nicht versichert',
                geschaetztePraemie: Math.round(kunde.mitarbeitende * 50 * 12 * 0.3),
                empfehlung: 'Fachkräftemangel: bKV als Mitarbeiter-Bindungsinstrument',
                versicherer: ['DKV CompanyMed', 'Allianz bKV Konzept', 'Hallesche bKV-Komfort'],
                naechsteSchritte: ['HR-Abteilung kontaktieren', 'Budget pro Mitarbeiter klären', 'Rahmenvertrag-Konditionen einholen'],
                herleitung: 'Cross-Selling: ' + (kunde.mitarbeitende || 0).toLocaleString('de-DE') + ' Mitarbeitende ohne bKV. Fachkräftegewinnung als zentrales Thema identifiziert.'
            });
        }
    } else if (kunde.segment === 'Industrie & Gewerbe') {
        potentials.push({
            id: 'b2bpot-cs-3',
            produkt: 'Erweiterte Produkthaftpflicht',
            quelle: 'KI-Analyse',
            prioritaet: 'Hoch',
            status: 'Prüfen',
            geschaetztePraemie: Math.round(kunde.praemie * 0.06),
            empfehlung: 'Produktrückruf-Absicherung international',
            versicherer: ['Zurich Product Recall', 'AIG Produkt-Rückruf Global', 'Allianz Produkthaftpflicht International'],
            naechsteSchritte: ['Exportmärkte und Produktportfolio analysieren', 'Rückruf-Szenarien durchspielen', 'Internationale Deckung prüfen'],
            herleitung: 'KI-Analyse: Unternehmen mit internationaler Produktion in ' + (kunde.standorte || 0) + ' Standorten benötigt erweiterte Produkthaftpflicht inkl. Rückruf.'
        });
    } else if (kunde.segment === 'Transport & Logistik') {
        potentials.push({
            id: 'b2bpot-cs-4',
            produkt: 'Warentransportversicherung (International)',
            quelle: 'KI-Analyse',
            prioritaet: 'Hoch',
            status: 'Ergänzung',
            geschaetztePraemie: Math.round(kunde.praemie * 0.07),
            empfehlung: 'Internationale Lieferketten absichern',
            versicherer: ['Helvetia Transport International', 'Zurich Cargo Global', 'HDI Transportversicherung'],
            naechsteSchritte: ['Transportvolumen und -routen analysieren', 'Aktuelle Warenversicherung prüfen', 'Lücken bei internationalen Transporten identifizieren'],
            herleitung: 'KI-Analyse: ' + (kunde.standorte || 0) + ' Standorte international – Warentransport nur teilweise versichert.'
        });
    }

    if (potentials.length === 0) {
        container.innerHTML = '<p class="text-muted">Aktuell keine Potentiale identifiziert.</p>';
        return;
    }

    var totalPot = potentials.reduce(function(a, p) { return a + p.geschaetztePraemie; }, 0);
    var hochCount = potentials.filter(function(p) { return p.prioritaet === 'Hoch'; }).length;

    var rows = potentials.map(function(p) {
        var pClass = p.prioritaet === 'Hoch' ? 'prio-hoch' : (p.prioritaet === 'Mittel' ? 'prio-mittel' : 'prio-niedrig');
        var praemieText = p.geschaetztePraemie >= 1000000 ? (p.geschaetztePraemie / 1000000).toFixed(1) + ' Mio. €' : p.geschaetztePraemie.toLocaleString('de-DE') + ' €';

        // Versicherer list
        var versichererHtml = (p.versicherer || []).map(function(v) {
            return '<div style="display:flex;align-items:center;gap:6px;padding:3px 0"><svg viewBox="0 0 24 24" fill="none" stroke="#3b82f6" stroke-width="2" width="14" height="14"><path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg> ' + v + '</div>';
        }).join('');

        // Nächste Schritte list
        var schritteHtml = (p.naechsteSchritte || []).map(function(s, i) {
            return '<div style="display:flex;align-items:flex-start;gap:6px;padding:3px 0"><span style="background:#e2e8f0;color:#475569;border-radius:50%;width:18px;height:18px;display:flex;align-items:center;justify-content:center;font-size:10px;font-weight:700;flex-shrink:0">' + (i + 1) + '</span> ' + s + '</div>';
        }).join('');

        // Detail row
        var detailHtml = '<tr class="impulse-table-detail" id="b2bpot-detail-' + p.id + '"><td colspan="6">' +
            '<div class="impulse-table-detail-inner">' +
                '<div class="impulse-table-herleitung" style="flex:1">' +
                    '<div class="kanban-detail-title">Herleitung</div>' +
                    '<div class="kanban-detail-row"><span class="kanban-detail-label">Quelle</span><span class="kanban-detail-value">' + p.quelle + '</span></div>' +
                    '<div class="kanban-detail-row"><span class="kanban-detail-label">Status</span><span class="kanban-detail-value">' + p.status + '</span></div>' +
                    '<div class="kanban-detail-row"><span class="kanban-detail-label">Analyse</span><span class="kanban-detail-value">' + (p.herleitung || p.empfehlung) + '</span></div>' +
                    '<div style="margin-top:12px"><div class="kanban-detail-title">Versicherer-Empfehlungen</div>' + versichererHtml + '</div>' +
                '</div>' +
                '<div style="flex:1">' +
                    '<div class="kanban-detail-title">Nächste Schritte</div>' + schritteHtml +
                    '<div style="margin-top:14px"><div class="kanban-detail-title">Geschätzte Prämie</div>' +
                    '<div style="font-size:20px;font-weight:700;color:#166534">' + praemieText + ' <span style="font-size:12px;font-weight:400;color:#64748b">p.a.</span></div></div>' +
                '</div>' +
                '<div class="impulse-table-actions">' +
                    '<button class="action-btn icon-only primary small" onclick="event.stopPropagation()" title="Angebot erstellen"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/></svg></button>' +
                    '<button class="action-btn icon-only secondary small" onclick="event.stopPropagation()" title="Termin vereinbaren"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg></button>' +
                    '<button class="action-btn icon-only secondary small" onclick="event.stopPropagation()" title="E-Mail senden"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg></button>' +
                '</div>' +
            '</div></td></tr>';

        return '<tr class="impulse-table-row" onclick="toggleB2bPotDetail(\'' + p.id + '\')">' +
            '<td><strong>' + p.produkt + '</strong></td>' +
            '<td><span class="status-badge-dl">' + p.quelle + '</span></td>' +
            '<td><span class="prio-badge ' + pClass + '">' + p.prioritaet + '</span></td>' +
            '<td class="text-right"><strong>' + praemieText + '</strong></td>' +
            '<td>' + p.empfehlung + '</td>' +
            '<td class="impulse-table-expand-cell"><span class="impulse-table-expand" id="b2bpot-expand-' + p.id + '"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><polyline points="6 9 12 15 18 9"/></svg></span></td>' +
            '</tr>' + detailHtml;
    }).join('');

    container.innerHTML =
        '<div class="mk-kpi-row" style="display:flex;gap:24px;margin-bottom:20px">' +
            '<div class="mk-kpi-box"><span class="mk-kpi-label">Potentiale</span><span class="mk-kpi-value">' + potentials.length + '</span></div>' +
            '<div class="mk-kpi-box"><span class="mk-kpi-label">Hohe Priorität</span><span class="mk-kpi-value negative">' + hochCount + '</span></div>' +
            '<div class="mk-kpi-box"><span class="mk-kpi-label">Geschätztes Prämienvolumen</span><span class="mk-kpi-value positive">' + (totalPot >= 1000000 ? (totalPot / 1000000).toFixed(1) + ' Mio. €' : totalPot.toLocaleString('de-DE') + ' €') + '</span></div>' +
        '</div>' +
        '<table class="impulse-table makler-detail-table"><thead><tr><th>Produkt / Risiko</th><th>Quelle</th><th>Priorität</th><th class="text-right">Geschätzte Prämie</th><th>Empfehlung</th><th></th></tr></thead><tbody>' + rows + '</tbody></table>';
}

function toggleB2bPotDetail(id) {
    var detail = document.getElementById('b2bpot-detail-' + id);
    var expand = document.getElementById('b2bpot-expand-' + id);
    if (detail) {
        detail.classList.toggle('open');
        if (expand) expand.classList.toggle('open');
    }
}
window.toggleB2bPotDetail = toggleB2bPotDetail;

// ========================================
// MAKLER TAB SWITCHING
// ========================================
function showMaklerTab(tabName) {
    // Deactivate all Makler tabs + content
    document.querySelectorAll('.makler-tab-content').forEach(function(el) { el.classList.remove('active'); });
    document.querySelectorAll('.agentur-tab-makler').forEach(function(el) { el.classList.remove('active'); });
    // Also hide kundenliste-makler if switching away
    var maklerListe = document.getElementById('tab-kundenliste-makler');
    if (maklerListe) maklerListe.classList.remove('active');

    var btn = document.querySelector('.agentur-tab-makler[data-mktab="' + tabName + '"]');
    if (btn) btn.classList.add('active');

    if (tabName === 'kunden') {
        if (maklerListe) maklerListe.classList.add('active');
        renderMaklerKundenliste();
    } else {
        var tab = document.getElementById('tab-makler-' + tabName);
        if (tab) tab.classList.add('active');
    }

    // Lazy-render
    if (tabName === 'uebersicht') renderMaklerUebersicht();
    if (tabName === 'stammdaten') renderMaklerStammdaten();
    if (tabName === 'neugeschaeft') renderMaklerNeugeschaeft();
    if (tabName === 'bestand') renderMaklerBestand();
    if (tabName === 'potentiale') renderMaklerPotentiale();
    if (tabName === 'versicherermix') renderVersichererMix();
    if (tabName === 'renewal') renderMaklerRenewalOverview();
    if (tabName === 'schaden') renderMaklerSchadenOverview();
    if (tabName === 'deckungsluecken') renderMaklerDeckungslueckenOverview();
}
window.showMaklerTab = showMaklerTab;

// ========================================
// MAKLER ÜBERSICHT (Dashboard)
// ========================================
function renderMaklerUebersicht() {
    var container = document.getElementById('maklerUebersichtContent');
    if (!container) return;
    try {
    // Top-5 Kunden nach Prämie
    var topKunden = maklerKunden.slice().sort(function(a, b) { return b.praemie - a.praemie; }).slice(0, 5);
    var topKundenRows = topKunden.map(function(k, i) {
        var schadenClass = k.schadenquote > 65 ? 'schaden-hoch' : (k.schadenquote > 50 ? 'schaden-mittel' : 'schaden-niedrig');
        return '<tr class="clickable-row" onclick="openMaklerKundenDetail(\'' + k.id + '\')">' +
            '<td><strong>' + (i + 1) + '.</strong></td>' +
            '<td><strong>' + k.name + '</strong><br><span style="font-size:11px;color:#64748b">' + k.segment + '</span></td>' +
            '<td class="text-right"><strong>' + k.praemieDisplay + '</strong></td>' +
            '<td class="text-center">' + k.vertraege + '</td>' +
            '<td><span class="' + schadenClass + '">' + k.schadenquote + '%</span></td>' +
            '</tr>';
    }).join('');

    // Anstehende Renewals (nächste 90 Tage)
    var now = new Date();
    var d90 = new Date(now); d90.setDate(d90.getDate() + 90);
    var renewals = [];
    maklerKunden.forEach(function(k) {
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
        return '<tr class="clickable-row" onclick="openMaklerKundenDetail(\'' + r.kundeId + '\')">' +
            '<td><span class="renewal-badge ' + urgencyClass + '">' + r.ablauf + '</span></td>' +
            '<td><strong>' + r.kunde + '</strong></td>' +
            '<td>' + r.sparte + '</td>' +
            '<td class="text-right">' + (r.praemie >= 1000000 ? (r.praemie / 1000000).toFixed(1) + ' Mio. \u20AC' : r.praemie.toLocaleString('de-DE') + ' \u20AC') + '</td>' +
            '</tr>';
    }).join('');
    if (renewalRows === '') renewalRows = '<tr><td colspan="4" class="text-muted">Keine Renewals in den n\u00E4chsten 90 Tagen</td></tr>';

    // Segment-Verteilung berechnen
    var segmentMap = {};
    var totalPraemie = 0;
    maklerKunden.forEach(function(k) {
        if (!segmentMap[k.segment]) segmentMap[k.segment] = { praemie: 0, count: 0 };
        segmentMap[k.segment].praemie += k.praemie;
        segmentMap[k.segment].count++;
        totalPraemie += k.praemie;
    });
    var segmentColors = {
        'Gesundheitswesen': '#3b82f6',
        'Kirche': '#8b5cf6',
        'Sozialwirtschaft': '#f59e0b',
        'Industrie & Gewerbe': '#64748b',
        'Transport & Logistik': '#22c55e'
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
    var totalVertraege = maklerKunden.reduce(function(s, k) { return s + k.vertraege; }, 0);
    var avgDeckung = (maklerKunden.reduce(function(s, k) { return s + k.deckungsquote; }, 0) / maklerKunden.length).toFixed(0);
    var avgSchaden = (maklerKunden.reduce(function(s, k) { return s + k.schadenquote; }, 0) / maklerKunden.length).toFixed(0);

    // Top-3 Potentiale
    var prioOrder = { 'Hoch': 0, 'Mittel': 1, 'Niedrig': 2 };
    var topPotentiale = (typeof maklerPotentialeData !== 'undefined' ? maklerPotentialeData : []).slice().sort(function(a, b) {
        return (prioOrder[a.prioritaet] || 2) - (prioOrder[b.prioritaet] || 2);
    }).slice(0, 3);
    var potentialeHtml = topPotentiale.map(function(p) {
        var prioClass = p.prioritaet === 'Hoch' ? 'high' : (p.prioritaet === 'Mittel' ? 'medium' : 'low');
        return '<div class="impuls-item clickable" onclick="openMaklerKundenDetail(\'' + p.kundeId + '\')">' +
            '<div class="impuls-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="24" height="24"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg></div>' +
            '<div class="impuls-text"><strong>' + p.titel + '</strong><p>' + p.kunde + ' \u2013 ' + p.beschreibung + '</p></div>' +
            '<span class="impuls-priority ' + prioClass + '">' + p.potentialPraemie + '</span></div>';
    }).join('');

    // Aufgaben (Tasks)
    var aufgabenHtml =
        '<div class="mk-aufgaben-liste">' +
            '<div class="mk-aufgabe-item prio-rot"><div class="mk-aufgabe-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg></div><div class="mk-aufgabe-text"><strong>Cyber-Renewal Marienhospital</strong><span>Ablauf 31.03.2026 \u2013 Verhandlung mit Hiscox starten</span></div><span class="mk-aufgabe-frist frist-dringend">49 Tage</span></div>' +
            '<div class="mk-aufgabe-item prio-rot"><div class="mk-aufgabe-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg></div><div class="mk-aufgabe-text"><strong>Umwelthaftpflicht-Angebot erstellen</strong><span>Marienhospital \u2013 Gesetzliche Anforderung seit 2024</span></div><span class="mk-aufgabe-frist frist-dringend">Offen</span></div>' +
            '<div class="mk-aufgabe-item prio-gelb"><div class="mk-aufgabe-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg></div><div class="mk-aufgabe-text"><strong>Jahresgespr\u00E4ch Phoenix Contact</strong><span>Produkt-Haftpflicht US-Erweiterung vorbereiten</span></div><span class="mk-aufgabe-frist">15.02.2026</span></div>' +
            '<div class="mk-aufgabe-item prio-gelb"><div class="mk-aufgabe-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/></svg></div><div class="mk-aufgabe-text"><strong>Cyber-Rahmenvertrag Ev. Kirche</strong><span>Ausschreibungsunterlagen vorbereiten (1.900 Gemeinden)</span></div><span class="mk-aufgabe-frist">28.02.2026</span></div>' +
            '<div class="mk-aufgabe-item"><div class="mk-aufgabe-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg></div><div class="mk-aufgabe-text"><strong>bKV-Pr\u00E4sentation Diakonisches Werk</strong><span>Budget-Tarif-Vergleich f\u00FCr 4.500 Mitarbeitende</span></div><span class="mk-aufgabe-frist">10.03.2026</span></div>' +
        '</div>';

    container.innerHTML =
        '<div class="mk-uebersicht-grid">' +
            '<div class="mk-uebersicht-main">' +
                '<div class="uebersicht-card">' +
                    '<div class="uebersicht-card-header"><h3>' +
                        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>' +
                        ' Vertriebskennzahlen</h3></div>' +
                    '<div class="kennzahlen-grid">' +
                        '<div class="kennzahl-item"><div class="kennzahl-value">' + maklerKunden.length + '</div><div class="kennzahl-label">Kunden</div><div class="kennzahl-trend positive">5 Segmente</div></div>' +
                        '<div class="kennzahl-item"><div class="kennzahl-value">' + totalVertraege + '</div><div class="kennzahl-label">Vertr\u00E4ge gesamt</div><div class="kennzahl-trend positive">\u00D8 ' + Math.round(totalVertraege / maklerKunden.length) + ' pro Kunde</div></div>' +
                        '<div class="kennzahl-item"><div class="kennzahl-value">' + avgDeckung + '%</div><div class="kennzahl-label">\u00D8 Deckungsquote</div><div class="kennzahl-trend ' + (Number(avgDeckung) >= 80 ? 'positive' : 'neutral') + '">Ziel: 85%</div></div>' +
                        '<div class="kennzahl-item"><div class="kennzahl-value">' + avgSchaden + '%</div><div class="kennzahl-label">\u00D8 Schadenquote</div><div class="kennzahl-trend ' + (Number(avgSchaden) < 65 ? 'positive' : 'negative') + '">Ziel: &lt; 65%</div></div>' +
                    '</div>' +
                '</div>' +
                '<div class="uebersicht-card">' +
                    '<div class="uebersicht-card-header"><h3>' +
                        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20"><path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>' +
                        ' Aufgaben</h3></div>' +
                    aufgabenHtml +
                '</div>' +
                '<div class="uebersicht-card potentiale-impuls-card">' +
                    '<div class="uebersicht-card-header"><h3>' +
                        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>' +
                        ' Vertriebspotentiale</h3>' +
                        '<a href="#" class="link-alle-anzeigen" onclick="showMaklerTab(\'potentiale\'); return false;">Alle ' + (typeof maklerPotentialeData !== 'undefined' ? maklerPotentialeData.length : 0) + ' Potentiale \u2192</a>' +
                    '</div>' +
                    potentialeHtml +
                '</div>' +
                '<div class="uebersicht-card">' +
                    '<div class="uebersicht-card-header"><h3>' +
                        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20"><path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/></svg>' +
                        ' Top-5 Kunden (Pr\u00E4mienvolumen)</h3>' +
                        '<a href="#" class="link-alle-anzeigen" onclick="showMaklerTab(\'kunden\'); return false;">Alle ' + maklerKunden.length + ' Kunden \u2192</a>' +
                    '</div>' +
                    '<table class="makler-detail-table"><thead><tr><th>#</th><th>Institution</th><th class="text-right">Pr\u00E4mie/a</th><th class="text-center">Vertr\u00E4ge</th><th>Schadenquote</th></tr></thead>' +
                    '<tbody>' + topKundenRows + '</tbody></table>' +
                '</div>' +
                '<div class="uebersicht-card">' +
                    '<div class="uebersicht-card-header"><h3>' +
                        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>' +
                        ' Anstehende Renewals (90 Tage)</h3>' +
                        '<a href="#" class="link-alle-anzeigen" onclick="showMaklerTab(\'renewal\'); return false;">Alle Renewals \u2192</a>' +
                    '</div>' +
                    '<table class="makler-detail-table"><thead><tr><th>Ablauf</th><th>Kunde</th><th>Sparte</th><th class="text-right">Pr\u00E4mie</th></tr></thead>' +
                    '<tbody>' + renewalRows + '</tbody></table>' +
                '</div>' +
            '</div>' +
            '<div class="mk-uebersicht-sidebar">' +
                '<div class="uebersicht-card">' +
                    '<div class="uebersicht-card-header"><h3>' +
                        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20"><circle cx="12" cy="12" r="10"/><path d="M12 2a10 10 0 0110 10"/><path d="M12 2v10h10"/></svg>' +
                        ' Segment-Verteilung</h3></div>' +
                    '<div class="mk-segment-chart">' + segmentBars + '</div>' +
                '</div>' +
                '<div class="uebersicht-card">' +
                    '<div class="uebersicht-card-header"><h3>' +
                        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>' +
                        ' Anstehende Termine</h3></div>' +
                    '<div class="termine-liste">' +
                        '<div class="termin-item heute"><div class="termin-zeit"><span class="termin-tag">Heute</span><span class="termin-uhrzeit">10:00</span></div><div class="termin-details"><strong>Marienhospital Detmold</strong><span>Jahresgespr\u00E4ch CFO Dr. Weinert</span></div></div>' +
                        '<div class="termin-item"><div class="termin-zeit"><span class="termin-tag">Mo, 13.01.</span><span class="termin-uhrzeit">14:00</span></div><div class="termin-details"><strong>Ev. Kirche Westfalen</strong><span>Renewal-Verhandlung Geb\u00E4ude</span></div></div>' +
                        '<div class="termin-item"><div class="termin-zeit"><span class="termin-tag">Di, 14.01.</span><span class="termin-uhrzeit">09:30</span></div><div class="termin-details"><strong>Phoenix Contact</strong><span>Cyber-Risiko Workshop</span></div></div>' +
                        '<div class="termin-item"><div class="termin-zeit"><span class="termin-tag">Mi, 15.01.</span><span class="termin-uhrzeit">11:00</span></div><div class="termin-details"><strong>Hellmann Logistics</strong><span>Flottenversicherung Review</span></div></div>' +
                    '</div>' +
                '</div>' +
                '<div class="uebersicht-card">' +
                    '<div class="uebersicht-card-header"><h3>' +
                        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>' +
                        ' Schnellaktionen</h3></div>' +
                    '<div class="formulare-grid">' +
                        '<button class="formular-btn" onclick="showMaklerTab(\'potentiale\')"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg> Potentiale</button>' +
                        '<button class="formular-btn" onclick="showMaklerTab(\'deckungsluecken\')"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg> Deckungsl\u00FCcken</button>' +
                        '<button class="formular-btn" onclick="showMaklerTab(\'versicherermix\')"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20"><circle cx="12" cy="12" r="10"/><path d="M12 2v20M2 12h20"/></svg> Versicherer-Mix</button>' +
                    '</div>' +
                '</div>' +
            '</div>' +
        '</div>';
    } catch(e) {
        container.innerHTML = '<div style="padding:24px;color:#dc2626;background:#fef2f2;border-radius:8px"><strong>Fehler beim Rendern:</strong> ' + e.message + '</div>';
    }
}
window.renderMaklerUebersicht = renderMaklerUebersicht;

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
        kunde: 'Marienhospital Detmold GmbH',
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
        kunde: 'Marienhospital Detmold GmbH',
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
        kunde: 'Ev. Kirche von Westfalen',
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
        kunde: 'Phoenix Contact GmbH',
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
        kunde: 'Hellmann Worldwide Logistics',
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
        kunde: 'Diakonisches Werk RWL',
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
        kunde: 'Boge Kompressoren GmbH',
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
        kunde: 'Reha-Zentrum Ostwestfalen',
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
        kunde: 'Caritas-Werkst\u00E4tten Paderborn',
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
        kunde: 'RegioFracht OWL GmbH',
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
            '<tr class="clickable-row" onclick="openMaklerKundenDetail(\'MK-GW-001\')"><td>08.01.2026</td><td><strong>Marienhospital Detmold</strong></td><td>Cyberversicherung (Erweiterung)</td><td>Hiscox</td><td class="text-right">45.000 \u20AC</td><td><span class="prio-badge prio-hoch" style="background:#dcfce7;color:#166534">Policiert</span></td></tr>' +
            '<tr class="clickable-row" onclick="openMaklerKundenDetail(\'MK-IG-002\')"><td>15.12.2025</td><td><strong>Phoenix Contact</strong></td><td>Betriebsunterbrechung (Erh\u00F6hung)</td><td>Allianz</td><td class="text-right">120.000 \u20AC</td><td><span class="prio-badge prio-hoch" style="background:#dcfce7;color:#166534">Policiert</span></td></tr>' +
            '<tr class="clickable-row" onclick="openMaklerKundenDetail(\'MK-TL-003\')"><td>28.11.2025</td><td><strong>RegioFracht OWL</strong></td><td>Komplettpaket (Neukunde)</td><td>HDI / Kravag</td><td class="text-right">190.000 \u20AC</td><td><span class="prio-badge prio-hoch" style="background:#dcfce7;color:#166534">Policiert</span></td></tr>' +
            '<tr><td>22.01.2026</td><td><strong>Ev. Kirche Westfalen</strong></td><td>Cyber-Rahmenvertrag</td><td>Ausschreibung</td><td class="text-right">180.000 \u20AC</td><td><span class="prio-badge prio-mittel" style="background:#fef3c7;color:#92400e">In Verhandlung</span></td></tr>' +
            '<tr><td>05.02.2026</td><td><strong>Boge Kompressoren</strong></td><td>Maschinenbruch-Erweiterung</td><td>Allianz</td><td class="text-right">32.000 \u20AC</td><td><span class="prio-badge prio-mittel" style="background:#fef3c7;color:#92400e">Angebot offen</span></td></tr>' +
            '<tr><td>10.02.2026</td><td><strong>Diakonisches Werk RWL</strong></td><td>bKV Rahmenvertrag</td><td>DKV / Signal</td><td class="text-right">95.000 \u20AC</td><td><span class="prio-badge prio-niedrig" style="background:#eff6ff;color:#1e40af">Erstgespr\u00E4ch</span></td></tr>' +
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
    if (localStorage.getItem('maklerModus') === '1') {
        maklerModus = true;
        var toggle = document.getElementById('maklerToggle');
        var label = document.getElementById('maklerToggleLabel');
        if (toggle) toggle.classList.add('active');
        if (label) label.textContent = 'Makler B2B';
        setTimeout(applyMaklerModus, 200);
    }
});
