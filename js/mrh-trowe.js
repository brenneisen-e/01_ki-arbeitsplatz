// js/mrh-trowe.js - Gewerbemakler 360° Modus
// PE-gestützter Konsolidierer: Insurance + Benefits + Finance

// ========================================
// GLOBAL VIEW MODE STATE
// ========================================
var viewMode = 'ao'; // 'ao' | 'ecclesia' | 'mrh'

function setViewMode(mode) {
    viewMode = mode;

    // Update selector buttons
    document.querySelectorAll('.view-mode-btn').forEach(function(btn) {
        btn.classList.toggle('active', btn.dataset.mode === mode);
    });

    // Backward compat: keep maklerModus in sync
    if (typeof maklerModus !== 'undefined') {
        maklerModus = (mode === 'ecclesia');
    }

    applyViewMode();

    // Close A-10 if open and update URL based on which page is visible
    var a10 = document.getElementById('kundenDetailPage');
    if (a10 && a10.style.display !== 'none') {
        if (typeof closeKundenDetail === 'function') closeKundenDetail();
    }

    // Update URL to reflect the active view mode on A-02
    var agenturPage = document.getElementById('agenturOverview');
    if (agenturPage && agenturPage.style.display !== 'none' && window.AppRouter) {
        if (mode === 'ecclesia') {
            AppRouter.navigate('/agentur-b2b');
        } else if (mode === 'mrh') {
            AppRouter.navigate('/agentur-gewerbe');
        } else {
            AppRouter.navigate('/agentur');
        }
    }

    localStorage.setItem('viewMode', mode);
}
window.setViewMode = setViewMode;

function applyViewMode() {
    if (viewMode === 'ao') {
        applyAOModus();
    } else if (viewMode === 'ecclesia') {
        // Reuse existing Makler logic
        if (typeof maklerModus !== 'undefined') maklerModus = true;
        if (typeof applyMaklerModus === 'function') applyMaklerModus();
    } else if (viewMode === 'mrh') {
        applyMRHModus();
    }
}
window.applyViewMode = applyViewMode;

function applyAOModus() {
    if (typeof maklerModus !== 'undefined') maklerModus = false;

    // KPIs
    var privatKpis = document.querySelector('.cockpit-kpis:not(#maklerKpis):not(#mrhKpis)');
    var maklerKpis = document.getElementById('maklerKpis');
    var mrhKpis = document.getElementById('mrhKpis');
    var mrhBadges = document.getElementById('mrhSaeulenBadges');
    if (privatKpis) privatKpis.style.display = '';
    if (maklerKpis) maklerKpis.style.display = 'none';
    if (mrhKpis) mrhKpis.style.display = 'none';
    if (mrhBadges) mrhBadges.style.display = 'none';

    // Tabs: show AO, hide Makler + MRH
    var headerTabs = document.querySelector('.agentur-page-new .agentur-header-tabs');
    if (headerTabs) {
        headerTabs.querySelectorAll('.agentur-tab:not(.agentur-tab-makler):not(.agentur-tab-mrh)').forEach(function(el) {
            el.style.display = '';
        });
        headerTabs.querySelectorAll('.agentur-tab-divider:not(.agentur-tab-makler):not(.agentur-tab-mrh)').forEach(function(el) {
            el.style.display = '';
        });
        headerTabs.querySelectorAll('.agentur-tab-makler').forEach(function(el) { el.style.display = 'none'; });
        headerTabs.querySelectorAll('.agentur-tab-mrh').forEach(function(el) { el.style.display = 'none'; });
    }

    // Kundenlisten
    var privatListe = document.getElementById('tab-kundenliste');
    var maklerListe = document.getElementById('tab-kundenliste-makler');
    var mrhListe = document.getElementById('tab-kundenliste-mrh');
    if (privatListe) privatListe.style.display = '';
    if (maklerListe) { maklerListe.style.display = 'none'; maklerListe.classList.remove('active'); }
    if (mrhListe) { mrhListe.style.display = 'none'; mrhListe.classList.remove('active'); }

    // Hide MRH/Makler tab contents
    document.querySelectorAll('.makler-tab-content').forEach(function(el) { el.classList.remove('active'); });
    document.querySelectorAll('.mrh-tab-content').forEach(function(el) { el.classList.remove('active'); });

    // Header
    var titleEl = document.getElementById('agenturPageTitle');
    if (titleEl) titleEl.textContent = 'Agentur: Dila Yorulmaz';
    var subtitleId = document.getElementById('agenturIdHeader');
    if (subtitleId) {
        var subtitleDiv = subtitleId.parentElement;
        subtitleDiv.innerHTML = '<span id="agenturIdHeader">VM00001</span> | <span id="agenturStatusHeader">Aktiv</span>';
    }
    // Remove subheadline
    var subheadline = document.getElementById('mrhSubheadline');
    if (subheadline) subheadline.style.display = 'none';

    // Photo
    var photoContainer = document.getElementById('agenturPhotoSmall');
    if (photoContainer && photoContainer._origHTML) {
        photoContainer.innerHTML = photoContainer._origHTML;
    }

    // Restore AO chat welcome message
    var chatBody = document.getElementById('agenturChatBody');
    if (chatBody && chatBody._origWelcomeHTML) {
        chatBody.innerHTML = chatBody._origWelcomeHTML;
    }

    if (typeof showAgenturTab === 'function') showAgenturTab('uebersicht');
}
window.applyAOModus = applyAOModus;


// ========================================
// MRH SPECIALTY ICONS
// ========================================
var mrhSpecialtyIcons = {
    maschinenbau: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="14" height="14"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/></svg>',
    realEstate: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="14" height="14"><path d="M3 21h18M5 21V7l8-4v18M13 21V3l6 3v15M9 9v.01M9 12v.01M9 15v.01M9 18v.01M17 9v.01M17 12v.01M17 15v.01M17 18v.01"/></svg>',
    kfzMotor: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="14" height="14"><path d="M14 16H9m10 0h3v-3.15a1 1 0 00-.84-.99L16 11l-2.7-3.6a1 1 0 00-.8-.4H5.24a2 2 0 00-1.8 1.1l-.8 1.63A6 6 0 002 12.28V16h3"/><circle cx="6.5" cy="16.5" r="2.5"/><circle cx="16.5" cy="16.5" r="2.5"/></svg>',
    logistik: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="14" height="14"><path d="M1 3h15v13H1z"/><path d="M16 8h4l3 4v4h-7V8z"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>',
    itHightech: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="14" height="14"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>',
    healthcare: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="14" height="14"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>',
    rechtsanwaelte: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="14" height="14"><path d="M12 3v18M3 7l9-4 9 4M3 7v4a9 9 0 009 9 9 9 0 009-9V7"/></svg>',
    bauHandwerk: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="14" height="14"><path d="M2 20h20M4 20V10l8-6 8 6v10"/><path d="M9 20v-6h6v6"/></svg>',
    eventsSport: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="14" height="14"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><path d="M3 10h18"/><path d="M8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h.01"/></svg>',
    touristik: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="14" height="14"><path d="M17.8 19.2L16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.2c.4-.3.6-.7.5-1.2z"/></svg>',
    fineArt: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="14" height="14"><circle cx="13.5" cy="6.5" r="2.5"/><path d="M17 3a2.83 2.83 0 014 4L7.5 20.5 2 22l1.5-5.5L17 3z"/></svg>',
    wiMA: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="14" height="14"><path d="M20 6L9 17l-5-5"/></svg>',
    oepnv: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="14" height="14"><path d="M8 6v6M16 6v6M2 12h20M6 18h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v10a2 2 0 002 2zM6 18l-2 2M18 18l2 2"/></svg>',
    privatkunde: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="14" height="14"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>'
};


// ========================================
// MRH MOCK-KUNDEN (15+ aus 7+ Specialties)
// ========================================
var mrhKunden = [
    {
        name: 'Rhein-Main Maschinenbau GmbH', id: 'MRH-001', typ: 'B2B',
        specialty: 'Maschinenbau', specialtyClass: 'specialty-maschinenbau', specialtyIcon: mrhSpecialtyIcons.maschinenbau,
        branche: 'Sondermaschinenbau', mitarbeitende: 340, jahresumsatz: '78 Mio. EUR',
        standorte: 'Frankfurt, Hanau, Bratislava', gesellschaftsform: 'GmbH',
        eigentuemer: 'Familienbesitz (3. Generation)',
        keyContacts: ['CFO Markus Schäfer', 'Prokuristin Lisa Wendel (Einkauf)', 'BR-Vors. Jürgen Kalt'],
        beziehungsstatus: 'Bestand', beraterInsurance: 'Frank Moser', beraterBenefits: '—', beraterFinance: 'Nina Hecht',
        insurance: { praemie: 420000, praemieDisplay: '420.000 €', vertraege: 11, renewalDate: '01.04.2026', renewalStatus: 'gelb' },
        benefits: { aktiv: false, bavVolumen: '—', durchdringung: '0%', hinweis: 'Cross-Sell-Potential hoch (340 MA)' },
        finance: { aktiv: true, kreditvers: 'Euler Hermes (Obligo 12 Mio.)', avale: '2 Avale à 500k (Zurich)', leasing: 'CNC-Fräszentrum 1,4 Mio. in Pipeline', courtage: '45.000 €' },
        vertraegeDetail: [
            { sparte: 'Betriebshaftpflicht', versicherer: 'Allianz', praemie: 95000, ds: '1,8 Mio. €', ablauf: '01.04.2026', saeule: 'I' },
            { sparte: 'Sach/Feuer', versicherer: 'Zurich', praemie: 78000, ds: '45 Mio. €', ablauf: '31.12.2026', saeule: 'I' },
            { sparte: 'Maschinenbruch', versicherer: 'HDI', praemie: 42000, ds: '8 Mio. €', ablauf: '31.12.2026', saeule: 'I' },
            { sparte: 'D&O', versicherer: 'AIG', praemie: 28000, ds: '5 Mio. €', ablauf: '31.12.2026', saeule: 'I' },
            { sparte: 'Cyber', versicherer: 'Hiscox', praemie: 35000, ds: '3 Mio. €', ablauf: '30.06.2026', saeule: 'I' },
            { sparte: 'Kfz-Flotte (38 Fzg.)', versicherer: 'Helvetia', praemie: 48000, ds: '—', ablauf: '01.01.2027', saeule: 'I' },
            { sparte: 'Kreditversicherung', versicherer: 'Euler Hermes', praemie: 38000, ds: '12 Mio. Obligo', ablauf: '31.12.2026', saeule: 'F' }
        ],
        schadenhistorie: [
            { jahr: 2025, beschreibung: 'Cyber-Vorfall (abgewehrt)', betrag: 22000 },
            { jahr: 2024, beschreibung: 'Haftpflicht Montageunfall', betrag: 95000 },
            { jahr: 2023, beschreibung: 'Maschinenbruch', betrag: 180000 }
        ],
        deckungsluecken: ['Produktrückruf nicht versichert (Export 25%)', 'Vertrauensschaden fehlt', 'Umwelthaftpflicht DS zu niedrig'],
        timeline: [
            { datum: '10.01.2026', saeule: 'insurance', text: 'Renewal-Gespräch BH vorbereitet', person: 'Frank Moser' },
            { datum: '15.12.2025', saeule: 'finance', text: 'CNC-Leasing-Anfrage eingegangen', person: 'Nina Hecht' },
            { datum: '20.11.2025', saeule: 'insurance', text: 'Cyber-Vorfall gemeldet & reguliert', person: 'Frank Moser' }
        ]
    },
    {
        name: 'Nordpark Projektentwicklung AG', id: 'MRH-003', typ: 'B2B',
        specialty: 'Real Estate', specialtyClass: 'specialty-real-estate', specialtyIcon: mrhSpecialtyIcons.realEstate,
        branche: 'Immobilienentwicklung', mitarbeitende: 45, jahresumsatz: '120 Mio. EUR (Projektvolumen)',
        standorte: 'Frankfurt, Wiesbaden', gesellschaftsform: 'AG (SDAX)', eigentuemer: 'Börsennotiert',
        keyContacts: ['Vorstand Kai Fischer', 'Risikomanagerin Dr. Anna Bergholz'],
        beziehungsstatus: 'Bestand', beraterInsurance: 'Thomas Bergmann', beraterBenefits: 'Katja Lurse', beraterFinance: 'Nina Hecht',
        insurance: { praemie: 680000, praemieDisplay: '680.000 €', vertraege: 9, renewalDate: '30.06.2026', renewalStatus: 'gruen' },
        benefits: { aktiv: true, bavVolumen: '1,2 Mio. €', durchdringung: 'Vorstand + leit. Angestellte', hinweis: 'U-Kasse über Heubeck' },
        finance: { aktiv: true, kreditvers: '—', avale: '8,5 Mio. (Vertragserfüllung, Gewährleistung)', leasing: '—', courtage: '120.000 €' },
        vertraegeDetail: [
            { sparte: 'Bauleistung (4 Projekte)', versicherer: 'Zurich', praemie: 280000, ds: '45 Mio. €', ablauf: 'projektbezogen', saeule: 'I' },
            { sparte: 'D&O', versicherer: 'AIG', praemie: 65000, ds: '10 Mio. €', ablauf: '31.12.2026', saeule: 'I' },
            { sparte: 'Avale', versicherer: 'Zurich/R+V', praemie: 0, ds: '8,5 Mio. €', ablauf: 'projektbezogen', saeule: 'F' }
        ],
        schadenhistorie: [{ jahr: 2024, beschreibung: 'Bauverzögerung Mainufer HP-Schaden', betrag: 340000 }],
        deckungsluecken: ['Keine Fertigstellungsgarantie-Versicherung für Großprojekt'],
        timeline: [
            { datum: '08.01.2026', saeule: 'finance', text: 'Debt Advisory Projektfinanzierung 35 Mio. gestartet', person: 'Nina Hecht' },
            { datum: '15.11.2025', saeule: 'insurance', text: 'Bauleistungsversicherung neues Projekt abgeschlossen', person: 'Thomas Bergmann' }
        ]
    },
    {
        name: 'Hessenlog Spedition GmbH', id: 'MRH-005', typ: 'B2B',
        specialty: 'Logistik', specialtyClass: 'specialty-logistik', specialtyIcon: mrhSpecialtyIcons.logistik,
        branche: 'Stückgut/Lagerlogistik, 62 LKW', mitarbeitende: 210, jahresumsatz: '48 Mio. EUR',
        standorte: 'Frankfurt', gesellschaftsform: 'GmbH', eigentuemer: 'Familienbesitz',
        keyContacts: ['GF Thomas Ritter', 'Disponentin Sabine Kraft'],
        beziehungsstatus: 'Bestand', beraterInsurance: 'Frank Moser', beraterBenefits: '—', beraterFinance: 'Nina Hecht',
        insurance: { praemie: 280000, praemieDisplay: '280.000 €', vertraege: 6, renewalDate: '01.01.2027', renewalStatus: 'gruen' },
        benefits: { aktiv: false, bavVolumen: '—', durchdringung: '0%', hinweis: 'Hohe Fluktuation — einfaches Modell möglich' },
        finance: { aktiv: true, kreditvers: '—', avale: '—', leasing: '8 neue LKW (2,8 Mio.)', courtage: '28.000 €' },
        vertraegeDetail: [
            { sparte: 'Frachtführerhaftpflicht', versicherer: 'HDI', praemie: 65000, ds: '5 Mio. €', ablauf: '01.01.2027', saeule: 'I' },
            { sparte: 'Kfz-Flotte (62 LKW + 18 Trailer)', versicherer: 'Kravag', praemie: 120000, ds: '—', ablauf: '01.01.2027', saeule: 'I' },
            { sparte: 'Leasing 8 LKW', versicherer: 'FM LeasingPartner', praemie: 0, ds: '2,8 Mio.', ablauf: '31.12.2030', saeule: 'F' }
        ],
        schadenhistorie: [],
        deckungsluecken: ['Keine Ladungsversicherung für temperaturgeführte Transporte'],
        timeline: []
    },
    {
        name: 'DigiCore Solutions GmbH', id: 'MRH-007', typ: 'B2B',
        specialty: 'IT/Hightech', specialtyClass: 'specialty-it-hightech', specialtyIcon: mrhSpecialtyIcons.itHightech,
        branche: 'Software, Cloud, KI-Lösungen', mitarbeitende: 95, jahresumsatz: '18 Mio. EUR',
        standorte: 'Frankfurt', gesellschaftsform: 'GmbH', eigentuemer: 'Gründer 70%, Angel 30%',
        keyContacts: ['CEO Jan Richter', 'COO Maria Santos'],
        beziehungsstatus: 'Wachstum', beraterInsurance: 'Frank Moser', beraterBenefits: 'Katja Lurse', beraterFinance: '—',
        insurance: { praemie: 82000, praemieDisplay: '82.000 €', vertraege: 6, renewalDate: '31.12.2026', renewalStatus: 'gruen' },
        benefits: { aktiv: true, bavVolumen: '380.000 €', durchdringung: '78%', hinweis: 'P·LIVE aktiv, Recruiting-Instrument' },
        finance: { aktiv: false, kreditvers: 'SaaS-Forderungen in Prüfung', avale: '—', leasing: '—', courtage: '—' },
        vertraegeDetail: [
            { sparte: 'IT-Haftpflicht/E&O', versicherer: 'Markel', praemie: 32000, ds: '5 Mio. €', ablauf: '31.12.2026', saeule: 'I' },
            { sparte: 'Cyber', versicherer: 'Hiscox', praemie: 18000, ds: '3 Mio. €', ablauf: '31.12.2026', saeule: 'I' },
            { sparte: 'bAV (P·LIVE)', versicherer: 'Zurich', praemie: 0, ds: '380k Volumen', ablauf: 'unbefristet', saeule: 'B' }
        ],
        schadenhistorie: [],
        deckungsluecken: ['Keine IP-Schutzversicherung (Patent-Trolling bei KI-Produkten)'],
        timeline: [
            { datum: '03.01.2026', saeule: 'benefits', text: 'P·LIVE Jahresbericht erstellt — 78% Teilnahme', person: 'Katja Lurse' }
        ]
    },
    {
        name: 'Medicum Rhein-Main MVZ GmbH', id: 'MRH-008', typ: 'B2B',
        specialty: 'Healthcare', specialtyClass: 'specialty-healthcare', specialtyIcon: mrhSpecialtyIcons.healthcare,
        branche: 'MVZ, 8 Standorte, 22 Ärzte', mitarbeitende: 140, jahresumsatz: '—',
        standorte: '8 Standorte Rhein-Main', gesellschaftsform: 'GmbH', eigentuemer: 'Ärztegemeinschaft',
        keyContacts: ['Ärztl. Leitung Dr. Hoffmann', 'Verwaltungsleiterin Kirsten Bauer'],
        beziehungsstatus: 'Bestand', beraterInsurance: 'Thomas Bergmann', beraterBenefits: 'Katja Lurse', beraterFinance: 'Nina Hecht',
        insurance: { praemie: 165000, praemieDisplay: '165.000 €', vertraege: 6, renewalDate: '31.12.2026', renewalStatus: 'gruen' },
        benefits: { aktiv: true, bavVolumen: '890.000 €', durchdringung: 'Ärzte + Verwaltung', hinweis: 'Versorgungswerk-Optimierung' },
        finance: { aktiv: true, kreditvers: '—', avale: '—', leasing: 'Medizintechnik (MRT, CT) 3,2 Mio.', courtage: '48.000 €' },
        vertraegeDetail: [
            { sparte: 'Berufshaftpflicht Ärzte', versicherer: 'HDI', praemie: 72000, ds: '5 Mio. € p.P.', ablauf: '31.12.2026', saeule: 'I' },
            { sparte: 'Leasing Medizintechnik', versicherer: 'FM LeasingPartner', praemie: 0, ds: '3,2 Mio.', ablauf: '31.12.2030', saeule: 'F' }
        ],
        schadenhistorie: [],
        deckungsluecken: ['Keine Vertrauensschadenversicherung (Abrechnungsbetrug-Risiko)'],
        timeline: []
    },
    {
        name: 'Hessenbau Generalunternehmer GmbH', id: 'MRH-013', typ: 'B2B',
        specialty: 'Bau/Handwerk', specialtyClass: 'specialty-bau-handwerk', specialtyIcon: mrhSpecialtyIcons.bauHandwerk,
        branche: 'Generalunternehmer, Wohn-/Gewerbebau', mitarbeitende: 160, jahresumsatz: '52 Mio. EUR',
        standorte: 'Frankfurt', gesellschaftsform: 'GmbH', eigentuemer: 'Familienbesitz',
        keyContacts: ['GF Ralf Schuster', 'Bauleiter-Team'],
        beziehungsstatus: 'Wachstum', beraterInsurance: 'Frank Moser', beraterBenefits: 'Katja Lurse', beraterFinance: 'Nina Hecht',
        insurance: { praemie: 290000, praemieDisplay: '290.000 €', vertraege: 9, renewalDate: '31.12.2026', renewalStatus: 'gruen' },
        benefits: { aktiv: true, bavVolumen: '320.000 €', durchdringung: 'Im Aufbau über Lurse', hinweis: 'Bindungsinstrument gewerbliche MA' },
        finance: { aktiv: true, kreditvers: '—', avale: '4,2 Mio. (Vertragserfüllung, Gewährleistung)', leasing: 'Baumaschinen 1,8 Mio.', courtage: '65.000 €' },
        vertraegeDetail: [
            { sparte: 'Bauwesenversicherung', versicherer: 'Zurich', praemie: 85000, ds: '25 Mio. €', ablauf: 'projektbezogen', saeule: 'I' },
            { sparte: 'Betriebshaftpflicht Bau', versicherer: 'HDI', praemie: 62000, ds: '10 Mio. €', ablauf: '31.12.2026', saeule: 'I' },
            { sparte: 'Avale', versicherer: 'R+V', praemie: 0, ds: '4,2 Mio.', ablauf: 'projektbezogen', saeule: 'F' },
            { sparte: 'Leasing Baumaschinen', versicherer: 'FM LeasingPartner', praemie: 0, ds: '1,8 Mio.', ablauf: '31.12.2029', saeule: 'F' }
        ],
        schadenhistorie: [],
        deckungsluecken: ['Keine Baufertigstellungsversicherung > 10 Mio.'],
        timeline: [
            { datum: '08.01.2026', saeule: 'benefits', text: 'bAV-Aufbau Phase 2 gestartet', person: 'Katja Lurse' }
        ]
    },
    {
        name: 'Rhein-Main Verkehr GmbH', id: 'MRH-015', typ: 'B2B',
        specialty: 'ÖPNV/SPNV', specialtyClass: 'specialty-oepnv-spnv', specialtyIcon: mrhSpecialtyIcons.oepnv,
        branche: 'ÖPNV, 180 Busse, 3 Straßenbahnlinien', mitarbeitende: 620, jahresumsatz: '95 Mio. EUR',
        standorte: 'Frankfurt', gesellschaftsform: 'GmbH', eigentuemer: 'Kommunal',
        keyContacts: ['Vorstand Klaus Wendt', 'Abt.leit. Versicherung Maria Engel'],
        beziehungsstatus: 'Bestand', beraterInsurance: 'Thomas Bergmann', beraterBenefits: 'Katja Lurse', beraterFinance: 'Nina Hecht',
        insurance: { praemie: 1450000, praemieDisplay: '1,45 Mio. €', vertraege: 8, renewalDate: '01.07.2026', renewalStatus: 'gelb' },
        benefits: { aktiv: true, bavVolumen: '4,8 Mio. €', durchdringung: '620 MA (ZVK + Aufstockung)', hinweis: 'Heubeck-Gutachten jährlich' },
        finance: { aktiv: true, kreditvers: '—', avale: '—', leasing: '20 E-Busse (9,5 Mio.)', courtage: '142.000 €' },
        vertraegeDetail: [
            { sparte: 'Kfz-Flotte (180 Busse + 45 Bahn)', versicherer: 'Kravag/Allianz', praemie: 680000, ds: '—', ablauf: '01.07.2026', saeule: 'I' },
            { sparte: 'Betriebshaftpflicht ÖPNV', versicherer: 'HDI', praemie: 320000, ds: '25 Mio. €', ablauf: '01.07.2026', saeule: 'I' },
            { sparte: 'bAV (ZVK + Aufstockung)', versicherer: 'Heubeck/Allianz', praemie: 0, ds: '4,8 Mio. Volumen', ablauf: 'unbefristet', saeule: 'B' },
            { sparte: 'Leasing 20 E-Busse', versicherer: 'FM LeasingPartner', praemie: 0, ds: '9,5 Mio.', ablauf: '31.12.2033', saeule: 'F' }
        ],
        schadenhistorie: [
            { jahr: 2025, beschreibung: 'Kollision Bus/PKW — Personenschaden', betrag: 85000 },
            { jahr: 2024, beschreibung: 'Vandalismus an 3 Haltestellen', betrag: 42000 }
        ],
        deckungsluecken: ['Keine Betriebsunterbrechung für Cyberangriff auf Leittechnik'],
        timeline: [
            { datum: '15.01.2026', saeule: 'finance', text: 'E-Bus-Leasing Tranche 2 in Verhandlung', person: 'Nina Hecht' },
            { datum: '10.01.2026', saeule: 'insurance', text: 'Renewal-Vorbereitung Flotte/BH gestartet', person: 'Thomas Bergmann' },
            { datum: '01.12.2025', saeule: 'benefits', text: 'Heubeck-Gutachten 2025 abgeschlossen', person: 'Katja Lurse' }
        ]
    }
];


// ========================================
// APPLY MRH MODUS
// ========================================
function applyMRHModus() {
    // KPIs
    var privatKpis = document.querySelector('.cockpit-kpis:not(#maklerKpis):not(#mrhKpis)');
    var maklerKpis = document.getElementById('maklerKpis');
    var mrhKpis = document.getElementById('mrhKpis');
    var mrhBadges = document.getElementById('mrhSaeulenBadges');
    if (privatKpis) privatKpis.style.display = 'none';
    if (maklerKpis) maklerKpis.style.display = 'none';
    if (mrhKpis) mrhKpis.style.display = '';
    if (mrhBadges) mrhBadges.style.display = 'none';

    // Tabs: hide AO + Makler, show MRH
    var headerTabs = document.querySelector('.agentur-page-new .agentur-header-tabs');
    if (headerTabs) {
        headerTabs.querySelectorAll('.agentur-tab:not(.agentur-tab-makler):not(.agentur-tab-mrh)').forEach(function(el) {
            el.style.display = 'none';
        });
        headerTabs.querySelectorAll('.agentur-tab-divider:not(.agentur-tab-makler):not(.agentur-tab-mrh)').forEach(function(el) {
            el.style.display = 'none';
        });
        headerTabs.querySelectorAll('.agentur-tab-makler').forEach(function(el) { el.style.display = 'none'; });
        headerTabs.querySelectorAll('.agentur-tab-mrh').forEach(function(el) {
            el.style.display = el.classList.contains('agentur-tab-divider') ? 'block' : '';
        });
    }

    // Kundenlisten
    var privatListe = document.getElementById('tab-kundenliste');
    var maklerListe = document.getElementById('tab-kundenliste-makler');
    var mrhListe = document.getElementById('tab-kundenliste-mrh');
    if (privatListe) privatListe.style.display = 'none';
    if (maklerListe) { maklerListe.style.display = 'none'; maklerListe.classList.remove('active'); }
    if (mrhListe) mrhListe.style.display = '';

    // Hide AO + Makler tab contents
    document.querySelectorAll('.agentur-tab-content').forEach(function(el) { el.classList.remove('active'); });
    document.querySelectorAll('.makler-tab-content').forEach(function(el) { el.classList.remove('active'); });
    if (privatListe) privatListe.style.display = 'none';

    // Header
    var titleEl = document.getElementById('agenturPageTitle');
    if (titleEl) titleEl.textContent = 'Niederlassung Rhein-Main';
    var subtitleId = document.getElementById('agenturIdHeader');
    if (subtitleId) {
        var subtitleDiv = subtitleId.parentElement;
        subtitleDiv.innerHTML = '<span id="agenturIdHeader">Gewerbemakler 360°</span>';
    }

    // Photo: modern office icon with 360° badge
    var photoContainer = document.getElementById('agenturPhotoSmall');
    if (photoContainer) {
        if (!photoContainer._origHTML) photoContainer._origHTML = photoContainer.innerHTML;
        photoContainer.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="1.5" width="22" height="22" style="margin:auto;display:block;"><path d="M3 21h18M5 21V7l8-4v18M13 21V3l6 3v15"/><circle cx="18" cy="8" r="3" fill="rgba(134,188,37,0.8)" stroke="none"/><text x="18" y="9.5" text-anchor="middle" font-size="4" fill="white" stroke="none" font-weight="bold">360</text></svg>';
    }

    // Reset chat welcome message for MRH mode
    var chatBody = document.getElementById('agenturChatBody');
    if (chatBody) {
        // Save original AO welcome if not yet saved
        if (!chatBody._origWelcomeHTML) chatBody._origWelcomeHTML = chatBody.innerHTML;
        chatBody.innerHTML =
            '<div class="agentur-chat-welcome">' +
                '<h4>Gewerbemakler 360° Assistent</h4>' +
                '<p>Fragen Sie mich zu Kunden, Renewals, Bestand oder Potentialen.</p>' +
                '<div class="welcome-examples">' +
                    '<button class="example-btn" onclick="askAgenturQuestion(\'Welche Renewals stehen im Q2 an?\')">Q2 Renewals</button>' +
                    '<button class="example-btn" onclick="showNeuePotentiale()">Neue Potentiale</button>' +
                    '<button class="example-btn" onclick="askAgenturQuestion(\'Zeige Bestandsübersicht\')">Bestand</button>' +
                '</div>' +
            '</div>';
    }

    // Show MRH Übersicht as default
    showMRHTab('uebersicht');
}
window.applyMRHModus = applyMRHModus;

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
                '<h5><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/></svg> Finance</h5>' +
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
    var saved = localStorage.getItem('viewMode');
    if (saved && (saved === 'ao' || saved === 'ecclesia' || saved === 'mrh')) {
        viewMode = saved;
    }
    // Apply on next tick (after DOM ready)
    setTimeout(function() {
        document.querySelectorAll('.view-mode-btn').forEach(function(btn) {
            btn.classList.toggle('active', btn.dataset.mode === viewMode);
        });
        applyViewMode();
    }, 100);
})();

