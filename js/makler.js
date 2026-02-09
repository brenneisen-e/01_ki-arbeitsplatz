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
    var a10 = document.getElementById('kundenDetailPanel');
    if (a10 && a10.classList.contains('active')) {
        var backBtn = document.querySelector('.back-to-list');
        if (backBtn) backBtn.click();
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
        // Show Makler kundenliste
        if (maklerListe) { maklerListe.style.display = ''; maklerListe.classList.add('active'); }
        if (privatListe) privatListe.style.display = 'none';
        // Render Makler list
        renderMaklerKundenliste();
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
        titleEl.textContent = maklerModus ? 'Maklerteam: Gesundheit & Soziales NRW' : 'Agentur: Max Mustermann';
    }
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
// MAKLER MOCK-KUNDEN (Institutionen)
// ========================================
var maklerKunden = [
    // Gesundheitswesen
    {
        name: 'Marienhospital Detmold GmbH',
        id: 'MK-GW-001',
        segment: 'Gesundheitswesen',
        segmentIcon: '🏥',
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
        segmentIcon: '🏥',
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
        segmentIcon: '🏥',
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
        segmentIcon: '🏥',
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
        segmentIcon: '⛪',
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
        segmentIcon: '⛪',
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
        segmentIcon: '⛪',
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
        segmentIcon: '🤝',
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
        segmentIcon: '🤝',
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
        segmentIcon: '🤝',
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
        segmentIcon: '🏭',
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
        segmentIcon: '🏭',
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
        segmentIcon: '🏭',
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
        segmentIcon: '🚛',
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
        segmentIcon: '🚛',
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
        segmentIcon: '🚛',
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
            '<td><div class="deckung-mini-bar"><div class="deckung-mini-fill" style="width:' + k.deckungsquote + '%"></div><span>' + k.deckungsquote + '%</span></div></td>' +
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

    // Switch to A-10
    if (typeof openKundenDetail === 'function') {
        // Use existing navigation to show detail panel
        var detailPanel = document.getElementById('kundenDetailPanel');
        var agenturPage = document.querySelector('.agentur-page-new');
        if (detailPanel && agenturPage) {
            agenturPage.classList.remove('active');
            detailPanel.classList.add('active');
        }
    }

    fillMaklerDetail(kunde);
}
window.openMaklerKundenDetail = openMaklerKundenDetail;

function fillMaklerDetail(kunde) {
    // Name + ID
    var nameEl = document.getElementById('kundenName');
    if (nameEl) nameEl.textContent = kunde.name;
    var idEl = document.getElementById('kundenVermittlerId');
    if (idEl) idEl.textContent = kunde.id;

    // Foto → Segment-Icon
    var foto = document.querySelector('.kunden-foto');
    if (foto) foto.innerHTML = '<span style="font-size:40px;line-height:80px">' + kunde.segmentIcon + '</span>';

    // Stammdaten → Makler-Stammdaten umschalten
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

        // Risikoklasse-Farbe
        var rkEl = document.getElementById('mkRisikoklasse');
        if (rkEl) {
            rkEl.className = 'info-value risikoklasse-badge rk-' + (kunde.risikoklasse || 'C').toLowerCase();
        }
    }

    // Verträge (B2B) - Tabellenkopf anpassen
    var vertraegeTable = document.getElementById('betreuteVertraegeTable');
    if (vertraegeTable) {
        var thead = vertraegeTable.querySelector('thead tr');
        if (thead) {
            thead.innerHTML = '<th>Sparte</th><th>Versicherer</th><th class="text-right">Prämie/a</th><th>Deckungssumme</th><th>SB</th><th>Ablauf</th><th>Schadenquote</th>';
        }
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

    // Hide irrelevant tabs, show Makler tabs
    document.querySelectorAll('.kunden-tab').forEach(function(tab) {
        var tabName = tab.getAttribute('data-tab');
        if (['fida', 'impulse', 'finanzplanung', 'kommunikation'].includes(tabName)) {
            tab.style.display = 'none';
        }
    });

    // Schadenhistorie rendern (in neuem Tab-Bereich)
    renderMaklerSchadenhistorie(kunde);
    renderMaklerDeckungsluecken(kunde);
    renderMaklerRenewalAmpel(kunde);

    // NPS/Scores ausblenden
    var npsWrapper = document.getElementById('kundenNpsWrapper');
    if (npsWrapper) npsWrapper.closest('.info-item').style.display = 'none';
    ['kundenRisikoscore', 'kundenBonitaetsscore', 'kundenTiere', 'kundenArbeitgeber', 'kundenBeschaeftigtSeit'].forEach(function(id) {
        var el = document.getElementById(id);
        if (el) {
            var item = el.closest('.info-item');
            if (item) item.style.display = 'none';
        }
    });

    // CLV ausblenden im Makler-Modus
    var clvCard = document.getElementById('clvDetailCard');
    if (clvCard) clvCard.style.display = 'none';
    var clvBadge = document.getElementById('clvHeaderBadge');
    if (clvBadge) clvBadge.style.display = 'none';

    // Makler-spezifische Karten anzeigen
    var schadenCard = document.getElementById('maklerSchadenCard');
    if (schadenCard) schadenCard.style.display = '';
    var dlCard = document.getElementById('maklerDeckungslueckenCard');
    if (dlCard) dlCard.style.display = '';
    var renewalCard = document.getElementById('maklerRenewalCard');
    if (renewalCard) renewalCard.style.display = '';

    // Sticky bar anpassen
    updateMaklerStickyBar(kunde);

    // Aktivieren des Stammdaten-Tabs
    if (typeof switchKundenTab === 'function') switchKundenTab('stammdaten');
}

function updateMaklerStickyBar(kunde) {
    var nameEl = document.getElementById('kundeBarName');
    if (nameEl) nameEl.textContent = kunde.name;
    var idEl = document.getElementById('kundeBarId');
    if (idEl) idEl.textContent = kunde.id;
    var npsEl = document.getElementById('kundeBarNpsB');
    if (npsEl) npsEl.innerHTML = '<span class="makler-segment-badge-sm">' + kunde.segmentIcon + ' ' + kunde.segment + '</span>';
    var clvEl = document.getElementById('kundeBarCLV');
    if (clvEl) clvEl.textContent = kunde.praemieDisplay;
    var segEl = document.getElementById('kundeBarSegment');
    if (segEl) segEl.textContent = 'Deckung: ' + kunde.deckungsquote + '%';
}

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
        // Show Makler kundenliste
        if (maklerListe) maklerListe.classList.add('active');
        renderMaklerKundenliste();
    } else {
        var tab = document.getElementById('tab-makler-' + tabName);
        if (tab) tab.classList.add('active');
    }

    // Lazy-render
    if (tabName === 'versicherermix') renderVersichererMix();
}
window.showMaklerTab = showMaklerTab;

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
