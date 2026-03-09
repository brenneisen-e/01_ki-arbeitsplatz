// js/makler.js - Makler B2B Modus
// Ecclesia-inspirierter Industriemakler mit institutionellen Kunden

// ========================================
// MODUS-TOGGLE
// ========================================
var maklerModus = false;

function toggleMaklerModus() {
    // Legacy: delegate to 3-way setViewMode if available
    if (typeof setViewMode === 'function') {
        setViewMode(maklerModus ? 'ao' : 'ecclesia');
        return;
    }
    maklerModus = !maklerModus;
    applyMaklerModus();
    var a10 = document.getElementById('kundenDetailPage');
    if (a10 && a10.style.display !== 'none') {
        if (typeof closeKundenDetail === 'function') closeKundenDetail();
    }
    localStorage.setItem('maklerModus', maklerModus ? '1' : '0');
}
window.toggleMaklerModus = toggleMaklerModus;

function applyMaklerModus() {
    // Hide banking elements
    if (typeof hideBankingElements === 'function') hideBankingElements();
    if (typeof showInsuranceTabContents === 'function') showInsuranceTabContents();

    // KPIs: hide private + MRH, show Makler (and vice versa)
    var privatKpis = document.querySelector('.agentur-page-new > .cockpit-kpis:not(#maklerKpis):not(#mrhKpis):not([id^="bank"])');
    var maklerKpis = document.getElementById('maklerKpis');
    var mrhKpis = document.getElementById('mrhKpis');
    var mrhBadges = document.getElementById('mrhSaeulenBadges');
    if (privatKpis) privatKpis.style.display = maklerModus ? 'none' : '';
    if (maklerKpis) maklerKpis.style.display = maklerModus ? '' : 'none';
    if (mrhKpis) mrhKpis.style.display = 'none';
    if (mrhBadges) mrhBadges.style.display = 'none';

    // Remove MRH subheadline if present
    var mrhSub = document.getElementById('mrhSubheadline');
    if (mrhSub) mrhSub.style.display = 'none';

    // Kundenliste: swap private/Makler when tab-kundenliste is active
    var privatListe = document.getElementById('tab-kundenliste');
    var maklerListe = document.getElementById('tab-kundenliste-makler');
    var mrhListe = document.getElementById('tab-kundenliste-mrh');
    if (mrhListe) { mrhListe.style.display = 'none'; mrhListe.classList.remove('active'); }

    // Hide MRH tab contents
    document.querySelectorAll('.mrh-tab-content').forEach(function(el) { el.classList.remove('active'); });

    // A-02 Tab-Buttons: hide private + MRH tabs, show Makler tabs
    var headerTabs = document.querySelector('.agentur-page-new .agentur-header-tabs');
    if (headerTabs) {
        // Hide MRH tabs
        headerTabs.querySelectorAll('.agentur-tab-mrh').forEach(function(el) { el.style.display = 'none'; });
        // Hide all normal tabs in Makler mode, show Makler tabs
        headerTabs.querySelectorAll('.agentur-tab:not(.agentur-tab-makler):not(.agentur-tab-mrh)').forEach(function(el) {
            el.style.display = maklerModus ? 'none' : '';
        });
        // Hide only private dividers (not makler/mrh dividers)
        headerTabs.querySelectorAll('.agentur-tab-divider:not(.agentur-tab-makler):not(.agentur-tab-mrh)').forEach(function(el) {
            el.style.display = maklerModus ? 'none' : '';
        });
        headerTabs.querySelectorAll('.agentur-tab-makler').forEach(function(el) {
            if (maklerModus) {
                // Use explicit display values (empty string may not override inline style reliably)
                el.style.display = el.classList.contains('agentur-tab-divider') ? 'block' : '';
            } else {
                el.style.display = 'none';
            }
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
        titleEl.textContent = maklerModus ? 'GS NRW' : 'Agentur: Maria Musterfrau';
    }
    var subtitleId = document.getElementById('agenturIdHeader');
    if (subtitleId) {
        var subtitleDiv = subtitleId.parentElement;
        if (maklerModus) {
            subtitleDiv.innerHTML = '<span id="agenturIdHeader">Ecclesia Gruppe</span>';
        } else {
            subtitleDiv.innerHTML = '<span id="agenturIdHeader">VM00001</span> | <span id="agenturStatusHeader">Aktiv</span>';
        }
    }

    // A-02 Header-Foto: im Makler-Modus Gebäude-Icon statt persönlichem Foto
    var photoContainer = document.getElementById('agenturPhotoSmall');
    if (photoContainer) {
        if (maklerModus) {
            if (!photoContainer._origHTML) photoContainer._origHTML = photoContainer.innerHTML;
            photoContainer.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="1.5" width="22" height="22" style="margin:auto;display:block;"><path d="M3 21h18M5 21V7l8-4v18M13 21V3l6 3v15M9 9v.01M9 12v.01M9 15v.01M9 18v.01M17 9v.01M17 12v.01M17 15v.01M17 18v.01"/></svg>';
        } else {
            // AO: Original-Foto/Placeholder wiederherstellen
            if (photoContainer._origHTML) {
                photoContainer.innerHTML = photoContainer._origHTML;
            }
        }
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
        name: 'Klinikum Lippetal GmbH',
        id: 'MK-GW-001',
        segment: 'Gesundheitswesen',
        segmentIcon: maklerSegmentIcons.gesundheitswesen,
        branche: 'Akutkrankenhaus',
        betten: 450,
        mitarbeitende: 1800,
        jahresumsatz: '185 Mio. €',
        standorte: 3,
        traeger: 'Klinikverbund Lippetal gGmbH',
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
        name: 'Reha-Klinik Teutoburg',
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
        name: 'MVZ MediVita GmbH',
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
        renewalStatus: 'gelb',
        vertraegeDetail: [
            { nr: 1, sparte: 'Arzthaftpflicht', versicherer: 'EGAS (Rahmenvertrag)', praemie: 28000, deckungssumme: '3 Mio. € p.P.', sb: '2.500 €', ablauf: '01.07.2026', schadenquote: 22 },
            { nr: 2, sparte: 'Betriebshaftpflicht', versicherer: 'HDI', praemie: 22000, deckungssumme: '5 Mio. €', sb: '2.500 €', ablauf: '01.07.2026', schadenquote: 15 },
            { nr: 3, sparte: 'Gebäudeversicherung', versicherer: 'Provinzial', praemie: 14000, deckungssumme: '4,5 Mio. €', sb: '5.000 €', ablauf: '31.12.2026', schadenquote: 8 },
            { nr: 4, sparte: 'Cyberversicherung', versicherer: 'Hiscox', praemie: 9000, deckungssumme: '1 Mio. €', sb: '5.000 €', ablauf: '01.07.2026', schadenquote: 0 },
            { nr: 5, sparte: 'Inhaltsversicherung', versicherer: 'Provinzial', praemie: 6000, deckungssumme: '800.000 €', sb: '2.500 €', ablauf: '31.12.2026', schadenquote: 5 },
            { nr: 6, sparte: 'Rechtsschutz', versicherer: 'ARAG', praemie: 6000, deckungssumme: '500.000 €', sb: '1.000 €', ablauf: '01.07.2026', schadenquote: 12 }
        ]
    },
    {
        name: 'Seniorenresidenz Sonnenhof',
        id: 'MK-GW-004',
        segment: 'Gesundheitswesen',
        segmentIcon: maklerSegmentIcons.gesundheitswesen,
        branche: 'Pflegeeinrichtung',
        betten: 180,
        mitarbeitende: 220,
        jahresumsatz: '14 Mio. €',
        standorte: 1,
        traeger: 'Diakonisches Hilfswerk',
        keyContact: 'Heike Bergmann (Einrichtungsleiterin)',
        risikoklasse: 'B',
        kundeSeit: '2012',
        praemie: 190000,
        praemieDisplay: '190.000 €',
        vertraege: 8,
        schadenquote: 35,
        deckungsquote: 80,
        naechstesRenewal: '31.12.2026',
        renewalStatus: 'gruen',
        vertraegeDetail: [
            { nr: 1, sparte: 'Betriebshaftpflicht', versicherer: 'Allianz', praemie: 48000, deckungssumme: '10 Mio. €', sb: '5.000 €', ablauf: '31.12.2026', schadenquote: 32 },
            { nr: 2, sparte: 'Gebäudeversicherung', versicherer: 'Provinzial', praemie: 38000, deckungssumme: '12 Mio. €', sb: '10.000 €', ablauf: '31.12.2026', schadenquote: 22 },
            { nr: 3, sparte: 'bKV (220 MA)', versicherer: 'DKV', praemie: 32000, deckungssumme: 'Budget 600 €/MA', sb: '—', ablauf: '31.12.2026', schadenquote: 75 },
            { nr: 4, sparte: 'Cyberversicherung', versicherer: 'Hiscox', praemie: 19000, deckungssumme: '2 Mio. €', sb: '10.000 €', ablauf: '31.12.2026', schadenquote: 0 },
            { nr: 5, sparte: 'Kfz-Flotte (18 Fzg.)', versicherer: 'Kravag', praemie: 18000, deckungssumme: '—', sb: '500 €', ablauf: '01.01.2027', schadenquote: 45 },
            { nr: 6, sparte: 'Inhaltsversicherung', versicherer: 'Provinzial', praemie: 15000, deckungssumme: '2 Mio. €', sb: '5.000 €', ablauf: '31.12.2026', schadenquote: 12 },
            { nr: 7, sparte: 'D&O', versicherer: 'Zurich', praemie: 12000, deckungssumme: '2 Mio. €', sb: '10.000 €', ablauf: '31.12.2026', schadenquote: 0 },
            { nr: 8, sparte: 'Rechtsschutz', versicherer: 'ARAG', praemie: 8000, deckungssumme: '500.000 €', sb: '1.000 €', ablauf: '31.12.2026', schadenquote: 18 }
        ]
    },
    // Kirche
    {
        name: 'Evangelische Landeskirche Teutoburg',
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
        name: 'Erzbistum Waldburg',
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
        renewalStatus: 'gruen',
        vertraegeDetail: [
            { nr: 1, sparte: 'Gebäudeversicherung (Rahmenvertrag)', versicherer: 'Provinzial / VGH', praemie: 3200000, deckungssumme: '1,4 Mrd. €', sb: '50.000 €', ablauf: '01.01.2027', schadenquote: 48 },
            { nr: 2, sparte: 'Haftpflicht (Rahmenvertrag)', versicherer: 'Allianz', praemie: 1450000, deckungssumme: '30 Mio. €', sb: '25.000 €', ablauf: '01.01.2027', schadenquote: 35 },
            { nr: 3, sparte: 'Kfz-Flotte (1.200 Fzg.)', versicherer: 'Kravag / R+V', praemie: 850000, deckungssumme: '—', sb: '1.000 €', ablauf: '01.01.2027', schadenquote: 62 },
            { nr: 4, sparte: 'Inhaltsversicherung (Rahmenvertrag)', versicherer: 'Provinzial', praemie: 520000, deckungssumme: '120 Mio. €', sb: '25.000 €', ablauf: '01.01.2027', schadenquote: 28 },
            { nr: 5, sparte: 'Glasversicherung (Kirchenfenster)', versicherer: 'VGH', praemie: 310000, deckungssumme: '85 Mio. €', sb: '5.000 €', ablauf: '01.01.2027', schadenquote: 32 },
            { nr: 6, sparte: 'Betriebsunterbrechung', versicherer: 'Allianz', praemie: 240000, deckungssumme: '50 Mio. €', sb: '5 Tage', ablauf: '01.01.2027', schadenquote: 15 },
            { nr: 7, sparte: 'Gruppenunfallversicherung', versicherer: 'VGH', praemie: 210000, deckungssumme: '200.000 € / 400.000 €', sb: '—', ablauf: '01.01.2027', schadenquote: 38 },
            { nr: 8, sparte: 'Elektronikversicherung', versicherer: 'HDI', praemie: 175000, deckungssumme: '25 Mio. €', sb: '10.000 €', ablauf: '01.01.2027', schadenquote: 18 },
            { nr: 9, sparte: 'Cyberversicherung', versicherer: 'Hiscox', praemie: 155000, deckungssumme: '10 Mio. €', sb: '25.000 €', ablauf: '01.01.2027', schadenquote: 5 },
            { nr: 10, sparte: 'bAV (Rahmenvertrag)', versicherer: 'Allianz', praemie: 125000, deckungssumme: '—', sb: '—', ablauf: 'unbefristet', schadenquote: null },
            { nr: 11, sparte: 'D&O Leitende', versicherer: 'Zurich', praemie: 125000, deckungssumme: '15 Mio. €', sb: '100.000 €', ablauf: '01.01.2027', schadenquote: 0 },
            { nr: 12, sparte: 'Rechtsschutz', versicherer: 'ARAG', praemie: 110000, deckungssumme: '3 Mio. €', sb: '2.500 €', ablauf: '01.01.2027', schadenquote: 28 },
            { nr: 13, sparte: 'Organhaftpflicht', versicherer: 'Zurich', praemie: 85000, deckungssumme: '10 Mio. €', sb: '50.000 €', ablauf: '01.01.2027', schadenquote: 0 },
            { nr: 14, sparte: 'Bauherrenhaftpflicht', versicherer: 'HDI', praemie: 80000, deckungssumme: '10 Mio. €', sb: '10.000 €', ablauf: '01.01.2027', schadenquote: 22 },
            { nr: 15, sparte: 'Kindergartenhaftpflicht', versicherer: 'R+V', praemie: 72000, deckungssumme: '5 Mio. €', sb: '2.500 €', ablauf: '01.01.2027', schadenquote: 45 },
            { nr: 16, sparte: 'Vertrauensschaden', versicherer: 'Zurich', praemie: 68000, deckungssumme: '5 Mio. €', sb: '25.000 €', ablauf: '01.01.2027', schadenquote: 0 },
            { nr: 17, sparte: 'Gewässerschadenhaftpflicht', versicherer: 'HDI', praemie: 60000, deckungssumme: '10 Mio. €', sb: '10.000 €', ablauf: '01.01.2027', schadenquote: 8 },
            { nr: 18, sparte: 'Leitungswasserversicherung', versicherer: 'Provinzial', praemie: 58000, deckungssumme: '20 Mio. €', sb: '10.000 €', ablauf: '01.01.2027', schadenquote: 55 },
            { nr: 19, sparte: 'Veranstaltungshaftpflicht', versicherer: 'R+V', praemie: 55000, deckungssumme: '5 Mio. €', sb: '2.500 €', ablauf: '01.01.2027', schadenquote: 18 },
            { nr: 20, sparte: 'Montageversicherung', versicherer: 'ERGO', praemie: 55000, deckungssumme: '5 Mio. €', sb: '10.000 €', ablauf: '01.01.2027', schadenquote: 12 },
            { nr: 21, sparte: 'Sturmversicherung (Zusatz)', versicherer: 'Provinzial', praemie: 52000, deckungssumme: '50 Mio. €', sb: '25.000 €', ablauf: '01.01.2027', schadenquote: 42 },
            { nr: 22, sparte: 'Vermögensschadenhaftpflicht', versicherer: 'AXA', praemie: 44000, deckungssumme: '5 Mio. €', sb: '10.000 €', ablauf: '01.01.2027', schadenquote: 0 },
            { nr: 23, sparte: 'Photovoltaikversicherung', versicherer: 'Generali', praemie: 38000, deckungssumme: '8 Mio. €', sb: '5.000 €', ablauf: '01.01.2027', schadenquote: 15 },
            { nr: 24, sparte: 'Friedhofsunfallversicherung', versicherer: 'VGH', praemie: 35000, deckungssumme: '100.000 €', sb: '—', ablauf: '01.01.2027', schadenquote: 28 },
            { nr: 25, sparte: 'Transportversicherung', versicherer: 'Helvetia', praemie: 35000, deckungssumme: '500.000 €', sb: '1.000 €', ablauf: '01.01.2027', schadenquote: 10 },
            { nr: 26, sparte: 'Dienstfahrradversicherung', versicherer: 'R+V', praemie: 26000, deckungssumme: '5.000 € pro Rad', sb: '100 €', ablauf: '01.01.2027', schadenquote: 35 },
            { nr: 27, sparte: 'Waldbrandversicherung', versicherer: 'Provinzial', praemie: 25000, deckungssumme: '5 Mio. €', sb: '10.000 €', ablauf: '01.01.2027', schadenquote: 0 },
            { nr: 28, sparte: 'Reisegruppenversicherung', versicherer: 'ERGO', praemie: 22000, deckungssumme: '50.000 € p.P.', sb: '100 €', ablauf: '01.01.2027', schadenquote: 42 },
            { nr: 29, sparte: 'Auslandskrankenversicherung', versicherer: 'DKV', praemie: 20000, deckungssumme: 'unbegrenzt', sb: '—', ablauf: '01.01.2027', schadenquote: 55 }
        ]
    },
    {
        name: 'Kirchenkreis Auental',
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
        renewalStatus: 'gelb',
        vertraegeDetail: [
            { nr: 1, sparte: 'Gebäudeversicherung (Rahmenvertrag)', versicherer: 'Provinzial', praemie: 245000, deckungssumme: '95 Mio. €', sb: '10.000 €', ablauf: '01.04.2026', schadenquote: 42 },
            { nr: 2, sparte: 'Haftpflicht (Rahmenvertrag)', versicherer: 'HDI', praemie: 115000, deckungssumme: '10 Mio. €', sb: '5.000 €', ablauf: '01.04.2026', schadenquote: 32 },
            { nr: 3, sparte: 'Kfz-Flotte (85 Fzg.)', versicherer: 'Kravag', praemie: 68000, deckungssumme: '—', sb: '500 €', ablauf: '01.01.2027', schadenquote: 58 },
            { nr: 4, sparte: 'Inhaltsversicherung', versicherer: 'Provinzial', praemie: 52000, deckungssumme: '4 Mio. €', sb: '5.000 €', ablauf: '01.04.2026', schadenquote: 18 },
            { nr: 5, sparte: 'Glasversicherung (Kirchenfenster)', versicherer: 'VGH', praemie: 38000, deckungssumme: '3 Mio. €', sb: '2.500 €', ablauf: '01.04.2026', schadenquote: 25 },
            { nr: 6, sparte: 'Gruppenunfallversicherung', versicherer: 'VGH', praemie: 28000, deckungssumme: '100.000 € / 200.000 €', sb: '—', ablauf: '01.04.2026', schadenquote: 35 },
            { nr: 7, sparte: 'Elektronikversicherung', versicherer: 'HDI', praemie: 22000, deckungssumme: '1,5 Mio. €', sb: '2.500 €', ablauf: '01.04.2026', schadenquote: 12 },
            { nr: 8, sparte: 'Cyberversicherung', versicherer: 'Hiscox', praemie: 18000, deckungssumme: '1 Mio. €', sb: '5.000 €', ablauf: '01.04.2026', schadenquote: 0 },
            { nr: 9, sparte: 'Rechtsschutz', versicherer: 'ARAG', praemie: 14000, deckungssumme: '500.000 €', sb: '1.000 €', ablauf: '01.04.2026', schadenquote: 22 },
            { nr: 10, sparte: 'Gewässerschadenhaftpflicht', versicherer: 'HDI', praemie: 12000, deckungssumme: '3 Mio. €', sb: '2.500 €', ablauf: '01.04.2026', schadenquote: 0 },
            { nr: 11, sparte: 'Veranstaltungshaftpflicht', versicherer: 'R+V', praemie: 8000, deckungssumme: '2 Mio. €', sb: '500 €', ablauf: '01.04.2026', schadenquote: 15 }
        ]
    },
    // Sozialwirtschaft
    {
        name: 'Diakonisches Hilfswerk Westmark',
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
        renewalStatus: 'gruen',
        vertraegeDetail: [
            { nr: 1, sparte: 'Betriebshaftpflicht (Rahmenvertrag)', versicherer: 'Allianz', praemie: 380000, deckungssumme: '20 Mio. €', sb: '10.000 €', ablauf: '31.12.2026', schadenquote: 45 },
            { nr: 2, sparte: 'Gebäudeversicherung', versicherer: 'Provinzial', praemie: 320000, deckungssumme: '85 Mio. €', sb: '25.000 €', ablauf: '31.12.2026', schadenquote: 38 },
            { nr: 3, sparte: 'Kfz-Flotte (320 Fzg.)', versicherer: 'Kravag', praemie: 185000, deckungssumme: '—', sb: '500 €', ablauf: '01.01.2027', schadenquote: 62 },
            { nr: 4, sparte: 'Inhaltsversicherung', versicherer: 'Provinzial', praemie: 145000, deckungssumme: '18 Mio. €', sb: '10.000 €', ablauf: '31.12.2026', schadenquote: 25 },
            { nr: 5, sparte: 'bKV (4.500 MA)', versicherer: 'DKV', praemie: 125000, deckungssumme: 'Budget 600 €/MA', sb: '—', ablauf: '31.12.2026', schadenquote: 78 },
            { nr: 6, sparte: 'Betriebsunterbrechung', versicherer: 'Allianz', praemie: 120000, deckungssumme: '80 Mio. €', sb: '3 Tage', ablauf: '31.12.2026', schadenquote: 18 },
            { nr: 7, sparte: 'Gruppenunfallversicherung', versicherer: 'VGH', praemie: 95000, deckungssumme: '200.000 € / 400.000 €', sb: '—', ablauf: '31.12.2026', schadenquote: 42 },
            { nr: 8, sparte: 'Cyberversicherung', versicherer: 'Hiscox', praemie: 85000, deckungssumme: '5 Mio. €', sb: '15.000 €', ablauf: '31.12.2026', schadenquote: 5 },
            { nr: 9, sparte: 'bAV (Rahmenvertrag)', versicherer: 'Allianz', praemie: 68000, deckungssumme: '—', sb: '—', ablauf: 'unbefristet', schadenquote: null },
            { nr: 10, sparte: 'D&O', versicherer: 'Zurich', praemie: 65000, deckungssumme: '5 Mio. €', sb: '50.000 €', ablauf: '31.12.2026', schadenquote: 0 },
            { nr: 11, sparte: 'Elektronikversicherung', versicherer: 'HDI', praemie: 58000, deckungssumme: '8 Mio. €', sb: '5.000 €', ablauf: '31.12.2026', schadenquote: 15 },
            { nr: 12, sparte: 'Rechtsschutz', versicherer: 'ARAG', praemie: 42000, deckungssumme: '2 Mio. €', sb: '1.000 €', ablauf: '31.12.2026', schadenquote: 32 },
            { nr: 13, sparte: 'Vertrauensschaden', versicherer: 'Zurich', praemie: 35000, deckungssumme: '2 Mio. €', sb: '10.000 €', ablauf: '31.12.2026', schadenquote: 0 },
            { nr: 14, sparte: 'Vermögensschadenhaftpflicht', versicherer: 'AXA', praemie: 28000, deckungssumme: '5 Mio. €', sb: '10.000 €', ablauf: '31.12.2026', schadenquote: 0 },
            { nr: 15, sparte: 'Transportversicherung', versicherer: 'Helvetia', praemie: 27000, deckungssumme: '1 Mio. €', sb: '1.000 €', ablauf: '31.12.2026', schadenquote: 15 },
            { nr: 16, sparte: 'Gewässerschadenhaftpflicht', versicherer: 'HDI', praemie: 22000, deckungssumme: '5 Mio. €', sb: '5.000 €', ablauf: '31.12.2026', schadenquote: 0 }
        ]
    },
    {
        name: 'Sozialwerkstätten Bergland',
        id: 'MK-SW-002',
        segment: 'Sozialwirtschaft',
        segmentIcon: maklerSegmentIcons.sozialwirtschaft,
        branche: 'Behindertenwerkstatt',
        betten: null,
        mitarbeitende: 800,
        jahresumsatz: '22 Mio. €',
        standorte: 4,
        traeger: 'Sozialverband Bergland',
        keyContact: 'Klaus Hentschel (Geschäftsführer)',
        risikoklasse: 'B',
        kundeSeit: '2011',
        praemie: 280000,
        praemieDisplay: '280.000 €',
        vertraege: 7,
        schadenquote: 32,
        deckungsquote: 70,
        naechstesRenewal: '30.06.2026',
        renewalStatus: 'gelb',
        vertraegeDetail: [
            { nr: 1, sparte: 'Betriebshaftpflicht', versicherer: 'HDI', praemie: 72000, deckungssumme: '5 Mio. €', sb: '5.000 €', ablauf: '30.06.2026', schadenquote: 28 },
            { nr: 2, sparte: 'Gebäudeversicherung', versicherer: 'VGH', praemie: 58000, deckungssumme: '15 Mio. €', sb: '10.000 €', ablauf: '31.12.2026', schadenquote: 22 },
            { nr: 3, sparte: 'Maschinenversicherung', versicherer: 'Allianz', praemie: 42000, deckungssumme: '8 Mio. €', sb: '5.000 €', ablauf: '30.06.2026', schadenquote: 45 },
            { nr: 4, sparte: 'Kfz-Flotte (45 Fzg.)', versicherer: 'Kravag', praemie: 35000, deckungssumme: '—', sb: '500 €', ablauf: '01.01.2027', schadenquote: 52 },
            { nr: 5, sparte: 'Inhaltsversicherung', versicherer: 'VGH', praemie: 28000, deckungssumme: '3 Mio. €', sb: '5.000 €', ablauf: '31.12.2026', schadenquote: 15 },
            { nr: 6, sparte: 'Elektronikversicherung', versicherer: 'HDI', praemie: 25000, deckungssumme: '2 Mio. €', sb: '2.500 €', ablauf: '30.06.2026', schadenquote: 18 },
            { nr: 7, sparte: 'Gruppenunfallversicherung', versicherer: 'VGH', praemie: 20000, deckungssumme: '100.000 € / 200.000 €', sb: '—', ablauf: '30.06.2026', schadenquote: 35 }
        ]
    },
    {
        name: 'Wohlfahrtswerk Kreisverband Auental',
        id: 'MK-SW-003',
        segment: 'Sozialwirtschaft',
        segmentIcon: maklerSegmentIcons.sozialwirtschaft,
        branche: 'Wohlfahrtsverband',
        betten: null,
        mitarbeitende: 1200,
        jahresumsatz: '48 Mio. €',
        standorte: 12,
        traeger: 'Wohlfahrtswerk Bundesverband',
        keyContact: 'Ingrid Falk (Vorständin)',
        risikoklasse: 'B',
        kundeSeit: '2014',
        praemie: 420000,
        praemieDisplay: '420.000 €',
        vertraege: 10,
        schadenquote: 40,
        deckungsquote: 74,
        naechstesRenewal: '31.12.2026',
        renewalStatus: 'gruen',
        vertraegeDetail: [
            { nr: 1, sparte: 'Betriebshaftpflicht', versicherer: 'HDI', praemie: 95000, deckungssumme: '10 Mio. €', sb: '5.000 €', ablauf: '31.12.2026', schadenquote: 38 },
            { nr: 2, sparte: 'Gebäudeversicherung', versicherer: 'Provinzial', praemie: 82000, deckungssumme: '22 Mio. €', sb: '10.000 €', ablauf: '31.12.2026', schadenquote: 28 },
            { nr: 3, sparte: 'Kfz-Flotte (95 Fzg.)', versicherer: 'Kravag', praemie: 52000, deckungssumme: '—', sb: '500 €', ablauf: '01.01.2027', schadenquote: 55 },
            { nr: 4, sparte: 'Inhaltsversicherung', versicherer: 'Provinzial', praemie: 38000, deckungssumme: '5 Mio. €', sb: '5.000 €', ablauf: '31.12.2026', schadenquote: 18 },
            { nr: 5, sparte: 'Cyberversicherung', versicherer: 'Hiscox', praemie: 35000, deckungssumme: '2 Mio. €', sb: '10.000 €', ablauf: '31.12.2026', schadenquote: 0 },
            { nr: 6, sparte: 'Gruppenunfallversicherung', versicherer: 'VGH', praemie: 32000, deckungssumme: '100.000 € / 200.000 €', sb: '—', ablauf: '31.12.2026', schadenquote: 42 },
            { nr: 7, sparte: 'bKV (1.200 MA)', versicherer: 'DKV', praemie: 28000, deckungssumme: 'Budget 300 €/MA', sb: '—', ablauf: '31.12.2026', schadenquote: 72 },
            { nr: 8, sparte: 'D&O', versicherer: 'Zurich', praemie: 22000, deckungssumme: '3 Mio. €', sb: '25.000 €', ablauf: '31.12.2026', schadenquote: 0 },
            { nr: 9, sparte: 'Rechtsschutz', versicherer: 'ARAG', praemie: 18000, deckungssumme: '1 Mio. €', sb: '1.000 €', ablauf: '31.12.2026', schadenquote: 28 },
            { nr: 10, sparte: 'Elektronikversicherung', versicherer: 'HDI', praemie: 18000, deckungssumme: '2 Mio. €', sb: '2.500 €', ablauf: '31.12.2026', schadenquote: 12 }
        ]
    },
    // Industrie & Gewerbe
    {
        name: 'Westfalia Elektronik GmbH',
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
        renewalStatus: 'gruen',
        vertraegeDetail: [
            { nr: 1, sparte: 'Betriebshaftpflicht', versicherer: 'Allianz (60%) / Zurich (40%)', praemie: 580000, deckungssumme: '25 Mio. €', sb: '25.000 €', ablauf: '31.12.2026', schadenquote: 42 },
            { nr: 2, sparte: 'Produkthaftpflicht', versicherer: 'Zurich', praemie: 420000, deckungssumme: '20 Mio. €', sb: '25.000 €', ablauf: '31.12.2026', schadenquote: 55 },
            { nr: 3, sparte: 'Gebäudeversicherung', versicherer: 'Provinzial', praemie: 380000, deckungssumme: '180 Mio. €', sb: '50.000 €', ablauf: '31.12.2026', schadenquote: 28 },
            { nr: 4, sparte: 'Betriebsunterbrechung', versicherer: 'Allianz', praemie: 350000, deckungssumme: '200 Mio. €', sb: '5 Tage', ablauf: '31.12.2026', schadenquote: 15 },
            { nr: 5, sparte: 'Inhaltsversicherung', versicherer: 'Provinzial', praemie: 285000, deckungssumme: '45 Mio. €', sb: '25.000 €', ablauf: '31.12.2026', schadenquote: 20 },
            { nr: 6, sparte: 'Maschinenversicherung', versicherer: 'Allianz', praemie: 220000, deckungssumme: '60 Mio. €', sb: '25.000 €', ablauf: '31.12.2026', schadenquote: 48 },
            { nr: 7, sparte: 'Elektronikversicherung', versicherer: 'HDI', praemie: 195000, deckungssumme: '35 Mio. €', sb: '10.000 €', ablauf: '31.12.2026', schadenquote: 22 },
            { nr: 8, sparte: 'Cyberversicherung', versicherer: 'Hiscox', praemie: 180000, deckungssumme: '10 Mio. €', sb: '25.000 €', ablauf: '31.12.2026', schadenquote: 8 },
            { nr: 9, sparte: 'Kfz-Flotte (380 Fzg.)', versicherer: 'Kravag', praemie: 165000, deckungssumme: '—', sb: '500 €', ablauf: '01.01.2027', schadenquote: 62 },
            { nr: 10, sparte: 'D&O', versicherer: 'Zurich', praemie: 145000, deckungssumme: '10 Mio. €', sb: '50.000 €', ablauf: '31.12.2026', schadenquote: 0 },
            { nr: 11, sparte: 'Transportversicherung', versicherer: 'Helvetia', praemie: 125000, deckungssumme: '5 Mio. €', sb: '5.000 €', ablauf: '31.12.2026', schadenquote: 32 },
            { nr: 12, sparte: 'bKV (5.200 MA)', versicherer: 'DKV', praemie: 120000, deckungssumme: 'Budget 600 €/MA', sb: '—', ablauf: '31.12.2026', schadenquote: 80 },
            { nr: 13, sparte: 'Gruppenunfallversicherung', versicherer: 'VGH', praemie: 95000, deckungssumme: '200.000 € / 400.000 €', sb: '—', ablauf: '31.12.2026', schadenquote: 38 },
            { nr: 14, sparte: 'Umwelthaftpflicht', versicherer: 'HDI', praemie: 85000, deckungssumme: '10 Mio. €', sb: '10.000 €', ablauf: '31.12.2026', schadenquote: 5 },
            { nr: 15, sparte: 'bAV (Direktversicherung)', versicherer: 'Allianz', praemie: 85000, deckungssumme: '—', sb: '—', ablauf: 'unbefristet', schadenquote: null },
            { nr: 16, sparte: 'Montageversicherung', versicherer: 'ERGO', praemie: 68000, deckungssumme: '8 Mio. €', sb: '10.000 €', ablauf: '31.12.2026', schadenquote: 25 },
            { nr: 17, sparte: 'Rechtsschutz', versicherer: 'ARAG', praemie: 65000, deckungssumme: '2 Mio. €', sb: '2.500 €', ablauf: '31.12.2026', schadenquote: 30 },
            { nr: 18, sparte: 'Vermögensschadenhaftpflicht', versicherer: 'AXA', praemie: 55000, deckungssumme: '5 Mio. €', sb: '10.000 €', ablauf: '31.12.2026', schadenquote: 0 },
            { nr: 19, sparte: 'Exportkreditversicherung', versicherer: 'Euler Hermes', praemie: 52000, deckungssumme: '20 Mio. €', sb: '10 %', ablauf: '31.12.2026', schadenquote: 35 },
            { nr: 20, sparte: 'Vertrauensschaden', versicherer: 'Zurich', praemie: 48000, deckungssumme: '3 Mio. €', sb: '15.000 €', ablauf: '31.12.2026', schadenquote: 0 },
            { nr: 21, sparte: 'Feuer-BU (Zuschlag)', versicherer: 'Allianz', praemie: 42000, deckungssumme: '50 Mio. €', sb: '3 Tage', ablauf: '31.12.2026', schadenquote: 12 },
            { nr: 22, sparte: 'Patentrechtsschutz', versicherer: 'ARAG', praemie: 40000, deckungssumme: '3 Mio. €', sb: '5.000 €', ablauf: '31.12.2026', schadenquote: 15 }
        ]
    },
    {
        name: 'Nordlicht Automatisierung GmbH',
        id: 'MK-IG-002',
        segment: 'Industrie & Gewerbe',
        segmentIcon: maklerSegmentIcons.industrie,
        branche: 'Elektrotechnik / Automatisierung',
        betten: null,
        mitarbeitende: 22000,
        jahresumsatz: '3,4 Mrd. €',
        standorte: 55,
        traeger: 'Eigenständig (Blomberg)',
        keyContact: 'Dr. Marcus Kellner (CEO)',
        risikoklasse: 'A',
        kundeSeit: '2006',
        praemie: 9500000,
        praemieDisplay: '9,5 Mio. €',
        vertraege: 31,
        schadenquote: 38,
        deckungsquote: 94,
        naechstesRenewal: '01.01.2027',
        renewalStatus: 'gruen',
        vertraegeDetail: [
            { nr: 1, sparte: 'Betriebshaftpflicht (international)', versicherer: 'Allianz (60%) / Zurich (40%)', praemie: 1350000, deckungssumme: '50 Mio. €', sb: '50.000 €', ablauf: '01.01.2027', schadenquote: 35 },
            { nr: 2, sparte: 'Produkthaftpflicht (international)', versicherer: 'Zurich', praemie: 1050000, deckungssumme: '50 Mio. €', sb: '50.000 €', ablauf: '01.01.2027', schadenquote: 42 },
            { nr: 3, sparte: 'Gebäudeversicherung (Rahmenvertrag)', versicherer: 'Provinzial / VGH', praemie: 850000, deckungssumme: '680 Mio. €', sb: '100.000 €', ablauf: '01.01.2027', schadenquote: 28 },
            { nr: 4, sparte: 'Betriebsunterbrechung', versicherer: 'Allianz', praemie: 680000, deckungssumme: '500 Mio. €', sb: '5 Tage', ablauf: '01.01.2027', schadenquote: 18 },
            { nr: 5, sparte: 'Inhaltsversicherung', versicherer: 'Provinzial', praemie: 520000, deckungssumme: '120 Mio. €', sb: '50.000 €', ablauf: '01.01.2027', schadenquote: 22 },
            { nr: 6, sparte: 'bKV (22.000 MA)', versicherer: 'DKV', praemie: 510000, deckungssumme: 'Budget 600 €/MA', sb: '—', ablauf: '01.01.2027', schadenquote: 78 },
            { nr: 7, sparte: 'Maschinenversicherung', versicherer: 'Allianz', praemie: 480000, deckungssumme: '200 Mio. €', sb: '50.000 €', ablauf: '01.01.2027', schadenquote: 45 },
            { nr: 8, sparte: 'Cyberversicherung', versicherer: 'Hiscox / AXA', praemie: 450000, deckungssumme: '25 Mio. €', sb: '100.000 €', ablauf: '01.01.2027', schadenquote: 12 },
            { nr: 9, sparte: 'Kfz-Flotte (1.800 Fzg.)', versicherer: 'Kravag / R+V', praemie: 385000, deckungssumme: '—', sb: '1.000 €', ablauf: '01.01.2027', schadenquote: 58 },
            { nr: 10, sparte: 'D&O', versicherer: 'Zurich', praemie: 380000, deckungssumme: '25 Mio. €', sb: '100.000 €', ablauf: '01.01.2027', schadenquote: 0 },
            { nr: 11, sparte: 'Elektronikversicherung', versicherer: 'HDI', praemie: 350000, deckungssumme: '80 Mio. €', sb: '25.000 €', ablauf: '01.01.2027', schadenquote: 25 },
            { nr: 12, sparte: 'bAV (Rahmenvertrag)', versicherer: 'Allianz', praemie: 350000, deckungssumme: '—', sb: '—', ablauf: 'unbefristet', schadenquote: null },
            { nr: 13, sparte: 'Transportversicherung (international)', versicherer: 'Helvetia', praemie: 345000, deckungssumme: '10 Mio. €', sb: '10.000 €', ablauf: '01.01.2027', schadenquote: 38 },
            { nr: 14, sparte: 'Gruppenunfallversicherung', versicherer: 'VGH', praemie: 210000, deckungssumme: '200.000 € / 400.000 €', sb: '—', ablauf: '01.01.2027', schadenquote: 35 },
            { nr: 15, sparte: 'Umwelthaftpflicht', versicherer: 'HDI', praemie: 185000, deckungssumme: '20 Mio. €', sb: '25.000 €', ablauf: '01.01.2027', schadenquote: 8 },
            { nr: 16, sparte: 'Exportkreditversicherung', versicherer: 'Euler Hermes', praemie: 165000, deckungssumme: '50 Mio. €', sb: '10 %', ablauf: '01.01.2027', schadenquote: 42 },
            { nr: 17, sparte: 'Montageversicherung', versicherer: 'ERGO', praemie: 145000, deckungssumme: '15 Mio. €', sb: '25.000 €', ablauf: '01.01.2027', schadenquote: 32 },
            { nr: 18, sparte: 'Rechtsschutz', versicherer: 'ARAG', praemie: 145000, deckungssumme: '5 Mio. €', sb: '5.000 €', ablauf: '01.01.2027', schadenquote: 28 },
            { nr: 19, sparte: 'Bauleistungsversicherung', versicherer: 'Generali', praemie: 120000, deckungssumme: '20 Mio. €', sb: '25.000 €', ablauf: '01.01.2027', schadenquote: 15 },
            { nr: 20, sparte: 'Vermögensschadenhaftpflicht', versicherer: 'AXA', praemie: 120000, deckungssumme: '10 Mio. €', sb: '25.000 €', ablauf: '01.01.2027', schadenquote: 5 },
            { nr: 21, sparte: 'Rückrufkosten', versicherer: 'Zurich', praemie: 110000, deckungssumme: '10 Mio. €', sb: '50.000 €', ablauf: '01.01.2027', schadenquote: 22 },
            { nr: 22, sparte: 'Patentrechtsschutz', versicherer: 'ARAG', praemie: 105000, deckungssumme: '5 Mio. €', sb: '10.000 €', ablauf: '01.01.2027', schadenquote: 18 },
            { nr: 23, sparte: 'Vertrauensschaden', versicherer: 'Zurich', praemie: 95000, deckungssumme: '5 Mio. €', sb: '25.000 €', ablauf: '01.01.2027', schadenquote: 0 },
            { nr: 24, sparte: 'Feuer-BU (Zuschlag)', versicherer: 'Allianz', praemie: 95000, deckungssumme: '100 Mio. €', sb: '5 Tage', ablauf: '01.01.2027', schadenquote: 10 },
            { nr: 25, sparte: 'Auslandskrankenversicherung', versicherer: 'DKV', praemie: 75000, deckungssumme: 'unbegrenzt', sb: '—', ablauf: '01.01.2027', schadenquote: 55 },
            { nr: 26, sparte: 'Gewässerschadenhaftpflicht', versicherer: 'HDI', praemie: 65000, deckungssumme: '10 Mio. €', sb: '10.000 €', ablauf: '01.01.2027', schadenquote: 0 },
            { nr: 27, sparte: 'Managerrechtsschutz', versicherer: 'ARAG', praemie: 52000, deckungssumme: '3 Mio. €', sb: '5.000 €', ablauf: '01.01.2027', schadenquote: 15 },
            { nr: 28, sparte: 'Luftfahrthaftpflicht (Drohnen)', versicherer: 'Allianz', praemie: 42000, deckungssumme: '3 Mio. €', sb: '5.000 €', ablauf: '01.01.2027', schadenquote: 0 },
            { nr: 29, sparte: 'Messeversicherung', versicherer: 'ERGO', praemie: 38000, deckungssumme: '2 Mio. €', sb: '5.000 €', ablauf: '01.01.2027', schadenquote: 25 },
            { nr: 30, sparte: 'Schlüsselverlustversicherung', versicherer: 'R+V', praemie: 18000, deckungssumme: '500.000 €', sb: '500 €', ablauf: '01.01.2027', schadenquote: 30 },
            { nr: 31, sparte: 'Reisegepäckversicherung', versicherer: 'ERGO', praemie: 15000, deckungssumme: '10.000 € p.P.', sb: '100 €', ablauf: '01.01.2027', schadenquote: 40 }
        ]
    },
    {
        name: 'Teutoburger Maschinenbau GmbH',
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
        renewalStatus: 'gelb',
        vertraegeDetail: [
            { nr: 1, sparte: 'Betriebshaftpflicht', versicherer: 'Allianz', praemie: 135000, deckungssumme: '10 Mio. €', sb: '10.000 €', ablauf: '30.09.2026', schadenquote: 52 },
            { nr: 2, sparte: 'Produkthaftpflicht', versicherer: 'Zurich', praemie: 98000, deckungssumme: '10 Mio. €', sb: '10.000 €', ablauf: '30.09.2026', schadenquote: 65 },
            { nr: 3, sparte: 'Gebäudeversicherung', versicherer: 'Provinzial', praemie: 85000, deckungssumme: '32 Mio. €', sb: '15.000 €', ablauf: '31.12.2026', schadenquote: 28 },
            { nr: 4, sparte: 'Maschinenversicherung', versicherer: 'Allianz', praemie: 72000, deckungssumme: '18 Mio. €', sb: '10.000 €', ablauf: '30.09.2026', schadenquote: 58 },
            { nr: 5, sparte: 'Betriebsunterbrechung', versicherer: 'HDI', praemie: 68000, deckungssumme: '40 Mio. €', sb: '3 Tage', ablauf: '30.09.2026', schadenquote: 42 },
            { nr: 6, sparte: 'Inhaltsversicherung', versicherer: 'Provinzial', praemie: 45000, deckungssumme: '8 Mio. €', sb: '5.000 €', ablauf: '31.12.2026', schadenquote: 22 },
            { nr: 7, sparte: 'Kfz-Flotte (60 Fzg.)', versicherer: 'Kravag', praemie: 38000, deckungssumme: '—', sb: '500 €', ablauf: '01.01.2027', schadenquote: 62 },
            { nr: 8, sparte: 'D&O', versicherer: 'Zurich', praemie: 32000, deckungssumme: '5 Mio. €', sb: '25.000 €', ablauf: '30.09.2026', schadenquote: 0 },
            { nr: 9, sparte: 'Cyberversicherung', versicherer: 'Hiscox', praemie: 35000, deckungssumme: '3 Mio. €', sb: '10.000 €', ablauf: '30.09.2026', schadenquote: 0 },
            { nr: 10, sparte: 'Transportversicherung', versicherer: 'Helvetia', praemie: 28000, deckungssumme: '1 Mio. €', sb: '2.500 €', ablauf: '30.09.2026', schadenquote: 35 },
            { nr: 11, sparte: 'Elektronikversicherung', versicherer: 'HDI', praemie: 25000, deckungssumme: '4 Mio. €', sb: '2.500 €', ablauf: '31.12.2026', schadenquote: 18 },
            { nr: 12, sparte: 'Rechtsschutz', versicherer: 'ARAG', praemie: 19000, deckungssumme: '1 Mio. €', sb: '1.000 €', ablauf: '30.09.2026', schadenquote: 28 }
        ]
    },
    // Transport & Logistik
    {
        name: 'Nordwest Cargo Logistics',
        id: 'MK-TL-001',
        segment: 'Transport & Logistik',
        segmentIcon: maklerSegmentIcons.transport,
        branche: 'Spedition / Logistik',
        betten: null,
        mitarbeitende: 12500,
        jahresumsatz: '4,2 Mrd. €',
        standorte: 260,
        traeger: 'Eigenständig (Osnabrück)',
        keyContact: 'Stefan Brinkmann (CEO)',
        risikoklasse: 'B',
        kundeSeit: '2009',
        praemie: 2400000,
        praemieDisplay: '2,4 Mio. €',
        vertraege: 18,
        schadenquote: 58,
        deckungsquote: 88,
        naechstesRenewal: '01.01.2027',
        renewalStatus: 'gruen',
        vertraegeDetail: [
            { nr: 1, sparte: 'Verkehrshaftpflicht (Rahmenvertrag)', versicherer: 'Zurich (50%) / R+V (50%)', praemie: 480000, deckungssumme: '20 Mio. €', sb: '25.000 €', ablauf: '01.01.2027', schadenquote: 62 },
            { nr: 2, sparte: 'Betriebshaftpflicht', versicherer: 'Allianz', praemie: 320000, deckungssumme: '25 Mio. €', sb: '10.000 €', ablauf: '01.01.2027', schadenquote: 48 },
            { nr: 3, sparte: 'Kfz-Flotte (4.500 Fzg.)', versicherer: 'Kravag / R+V', praemie: 385000, deckungssumme: '—', sb: '1.000 €', ablauf: '01.01.2027', schadenquote: 72 },
            { nr: 4, sparte: 'Transportversicherung', versicherer: 'Helvetia', praemie: 245000, deckungssumme: '10 Mio. €', sb: '10.000 €', ablauf: '01.01.2027', schadenquote: 55 },
            { nr: 5, sparte: 'Gebäudeversicherung', versicherer: 'Provinzial', praemie: 195000, deckungssumme: '85 Mio. €', sb: '25.000 €', ablauf: '01.01.2027', schadenquote: 32 },
            { nr: 6, sparte: 'D&O', versicherer: 'Zurich', praemie: 85000, deckungssumme: '10 Mio. €', sb: '50.000 €', ablauf: '01.01.2027', schadenquote: 0 },
            { nr: 7, sparte: 'Betriebsunterbrechung', versicherer: 'Allianz', praemie: 145000, deckungssumme: '100 Mio. €', sb: '3 Tage', ablauf: '01.01.2027', schadenquote: 22 },
            { nr: 8, sparte: 'Cyberversicherung', versicherer: 'Hiscox', praemie: 95000, deckungssumme: '5 Mio. €', sb: '15.000 €', ablauf: '01.01.2027', schadenquote: 8 },
            { nr: 9, sparte: 'Inhaltsversicherung', versicherer: 'Provinzial', praemie: 72000, deckungssumme: '15 Mio. €', sb: '10.000 €', ablauf: '01.01.2027', schadenquote: 18 },
            { nr: 10, sparte: 'Umwelthaftpflicht', versicherer: 'HDI', praemie: 65000, deckungssumme: '10 Mio. €', sb: '10.000 €', ablauf: '01.01.2027', schadenquote: 5 },
            { nr: 11, sparte: 'Rechtsschutz', versicherer: 'ARAG', praemie: 48000, deckungssumme: '2 Mio. €', sb: '2.500 €', ablauf: '01.01.2027', schadenquote: 35 },
            { nr: 12, sparte: 'Elektronikversicherung', versicherer: 'HDI', praemie: 55000, deckungssumme: '8 Mio. €', sb: '5.000 €', ablauf: '01.01.2027', schadenquote: 15 },
            { nr: 13, sparte: 'Maschinenversicherung', versicherer: 'Allianz', praemie: 42000, deckungssumme: '12 Mio. €', sb: '10.000 €', ablauf: '01.01.2027', schadenquote: 28 },
            { nr: 14, sparte: 'Gruppenunfallversicherung', versicherer: 'VGH', praemie: 68000, deckungssumme: '200.000 € / 400.000 €', sb: '—', ablauf: '01.01.2027', schadenquote: 42 },
            { nr: 15, sparte: 'bKV (12.500 MA)', versicherer: 'DKV', praemie: 38000, deckungssumme: 'Budget 300 €/MA', sb: '—', ablauf: '01.01.2027', schadenquote: 75 },
            { nr: 16, sparte: 'Vertrauensschaden', versicherer: 'Zurich', praemie: 28000, deckungssumme: '3 Mio. €', sb: '15.000 €', ablauf: '01.01.2027', schadenquote: 0 },
            { nr: 17, sparte: 'Vermögensschadenhaftpflicht', versicherer: 'AXA', praemie: 22000, deckungssumme: '5 Mio. €', sb: '10.000 €', ablauf: '01.01.2027', schadenquote: 0 },
            { nr: 18, sparte: 'Lagerversicherung', versicherer: 'Generali', praemie: 12000, deckungssumme: '5 Mio. €', sb: '5.000 €', ablauf: '01.01.2027', schadenquote: 20 }
        ]
    },
    {
        name: 'Weserland Spedition GmbH',
        id: 'MK-TL-002',
        segment: 'Transport & Logistik',
        segmentIcon: maklerSegmentIcons.transport,
        branche: 'Spedition',
        betten: null,
        mitarbeitende: 1800,
        jahresumsatz: '380 Mio. €',
        standorte: 22,
        traeger: 'Eigenständig',
        keyContact: 'Thomas Hartwig (Geschäftsführer)',
        risikoklasse: 'B',
        kundeSeit: '2013',
        praemie: 740000,
        praemieDisplay: '740.000 €',
        vertraege: 11,
        schadenquote: 62,
        deckungsquote: 75,
        naechstesRenewal: '31.12.2026',
        renewalStatus: 'gruen',
        vertraegeDetail: [
            { nr: 1, sparte: 'Verkehrshaftpflicht', versicherer: 'Zurich', praemie: 165000, deckungssumme: '5 Mio. €', sb: '5.000 €', ablauf: '31.12.2026', schadenquote: 58 },
            { nr: 2, sparte: 'Betriebshaftpflicht', versicherer: 'HDI', praemie: 115000, deckungssumme: '10 Mio. €', sb: '5.000 €', ablauf: '31.12.2026', schadenquote: 48 },
            { nr: 3, sparte: 'Kfz-Flotte (650 Fzg.)', versicherer: 'Kravag', praemie: 145000, deckungssumme: '—', sb: '500 €', ablauf: '01.01.2027', schadenquote: 72 },
            { nr: 4, sparte: 'Transportversicherung', versicherer: 'Helvetia', praemie: 82000, deckungssumme: '2 Mio. €', sb: '2.500 €', ablauf: '31.12.2026', schadenquote: 55 },
            { nr: 5, sparte: 'Gebäudeversicherung', versicherer: 'Provinzial', praemie: 68000, deckungssumme: '12 Mio. €', sb: '10.000 €', ablauf: '31.12.2026', schadenquote: 25 },
            { nr: 6, sparte: 'Betriebsunterbrechung', versicherer: 'Allianz', praemie: 48000, deckungssumme: '20 Mio. €', sb: '3 Tage', ablauf: '31.12.2026', schadenquote: 18 },
            { nr: 7, sparte: 'Inhaltsversicherung', versicherer: 'Provinzial', praemie: 32000, deckungssumme: '4 Mio. €', sb: '5.000 €', ablauf: '31.12.2026', schadenquote: 12 },
            { nr: 8, sparte: 'D&O', versicherer: 'Zurich', praemie: 28000, deckungssumme: '3 Mio. €', sb: '25.000 €', ablauf: '31.12.2026', schadenquote: 0 },
            { nr: 9, sparte: 'Cyberversicherung', versicherer: 'Hiscox', praemie: 22000, deckungssumme: '2 Mio. €', sb: '10.000 €', ablauf: '31.12.2026', schadenquote: 0 },
            { nr: 10, sparte: 'Rechtsschutz', versicherer: 'ARAG', praemie: 18000, deckungssumme: '1 Mio. €', sb: '1.000 €', ablauf: '31.12.2026', schadenquote: 32 },
            { nr: 11, sparte: 'Umwelthaftpflicht', versicherer: 'HDI', praemie: 17000, deckungssumme: '5 Mio. €', sb: '5.000 €', ablauf: '31.12.2026', schadenquote: 0 }
        ]
    },
    {
        name: 'Lippeland Fracht GmbH',
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
        renewalStatus: 'gelb',
        vertraegeDetail: [
            { nr: 1, sparte: 'Verkehrshaftpflicht', versicherer: 'R+V', praemie: 48000, deckungssumme: '2 Mio. €', sb: '2.500 €', ablauf: '01.04.2026', schadenquote: 52 },
            { nr: 2, sparte: 'Betriebshaftpflicht', versicherer: 'HDI', praemie: 35000, deckungssumme: '5 Mio. €', sb: '2.500 €', ablauf: '01.04.2026', schadenquote: 38 },
            { nr: 3, sparte: 'Kfz-Flotte (45 Fzg.)', versicherer: 'Kravag', praemie: 42000, deckungssumme: '—', sb: '500 €', ablauf: '01.01.2027', schadenquote: 65 },
            { nr: 4, sparte: 'Transportversicherung', versicherer: 'Helvetia', praemie: 25000, deckungssumme: '500.000 €', sb: '1.000 €', ablauf: '01.04.2026', schadenquote: 42 },
            { nr: 5, sparte: 'Gebäudeversicherung', versicherer: 'Provinzial', praemie: 22000, deckungssumme: '3,5 Mio. €', sb: '5.000 €', ablauf: '31.12.2026', schadenquote: 15 },
            { nr: 6, sparte: 'Inhaltsversicherung', versicherer: 'Provinzial', praemie: 10000, deckungssumme: '800.000 €', sb: '2.500 €', ablauf: '31.12.2026', schadenquote: 8 },
            { nr: 7, sparte: 'Rechtsschutz', versicherer: 'ARAG', praemie: 8000, deckungssumme: '500.000 €', sb: '1.000 €', ablauf: '01.04.2026', schadenquote: 22 }
        ]
    }
];

