/* ============================================================
   B-02 BERATER-UEBERSICHT  –  Banking Edition
   Mirrors agentur-overview.js (A-02) structure exactly
   ============================================================ */

// ── STATE ──
var bankViewMode = localStorage.getItem('bankViewMode') || 'retail';
var currentBeraterTab = 'uebersicht';

// ── MOCK BERATER ──
var beraterData = {
    name: 'Thomas Berger',
    id: 'VB-40210',
    photo: 'assets/images/berater-thomas.jpg',
    institut: 'Volksbank Mittelhessen eG',
    center: 'Beratungscenter Giessen-Sued',
    status: 'Aktiv'
};

// ── MOCK KUNDEN (Retail) ──
var bankKundenRetail = [
    { name:'Klaus Fischer',    id:'KDB001', geb:'12.05.1978', beruf:'Maschinenbau-Ingenieur', ort:'Giessen',    segment:'Premium',  produkte:6, ertrag:4850,  finanzplan:true,  letztKontakt:'28.02.2026', avatarBg:'#2563eb', nps:9,  kinder:[{name:'Lukas',alter:12},{name:'Emma',alter:9}], email:'k.fischer@email.de', telefon:'+49 641 98765', adresse:'Hauptstrasse 45, 35390 Giessen', arbeitgeber:'Continental AG', familienstand:'Verheiratet', risikoscore:28, bonitaet:82 },
    { name:'Sandra Mueller',   id:'KDB002', geb:'23.11.1985', beruf:'Aerztin',               ort:'Wetzlar',    segment:'Premium',  produkte:4, ertrag:3200,  finanzplan:false, letztKontakt:'25.02.2026', avatarBg:'#9333ea', nps:7,  kinder:[{name:'Mia',alter:4}], email:'s.mueller@email.de', telefon:'+49 6441 55432', adresse:'Bahnhofstr. 12, 35578 Wetzlar', arbeitgeber:'Uniklinik Giessen', familienstand:'Ledig', risikoscore:15, bonitaet:91 },
    { name:'Markus Wagner',    id:'KDB003', geb:'08.03.1972', beruf:'Lehrer',                 ort:'Marburg',    segment:'Standard', produkte:3, ertrag:1800,  finanzplan:true,  letztKontakt:'20.02.2026', avatarBg:'#16a34a', nps:8,  kinder:[{name:'Tim',alter:14},{name:'Jana',alter:11}], email:'m.wagner@email.de', telefon:'+49 6421 77890', adresse:'Schulstr. 8, 35037 Marburg', arbeitgeber:'Land Hessen', familienstand:'Verheiratet', risikoscore:22, bonitaet:75 },
    { name:'Julia Becker',     id:'KDB004', geb:'15.07.1990', beruf:'Marketing-Managerin',    ort:'Giessen',    segment:'Potenzial',produkte:2, ertrag:980,   finanzplan:false, letztKontakt:'18.02.2026', avatarBg:'#f59e0b', nps:6,  kinder:[], email:'j.becker@email.de', telefon:'+49 641 33210', adresse:'Ludwigstr. 22, 35390 Giessen', arbeitgeber:'Amazon DE', familienstand:'Ledig', risikoscore:18, bonitaet:88 },
    { name:'Peter Hoffmann',   id:'KDB005', geb:'30.01.1970', beruf:'Steuerberater',          ort:'Wetzlar',    segment:'Premium',  produkte:8, ertrag:6200,  finanzplan:true,  letztKontakt:'15.02.2026', avatarBg:'#dc2626', nps:9,  kinder:[{name:'Fabian',alter:22},{name:'Laura',alter:19}], email:'p.hoffmann@email.de', telefon:'+49 6441 88456', adresse:'Friedrichstr. 5, 35578 Wetzlar', arbeitgeber:'Selbstaendig', familienstand:'Verheiratet', risikoscore:35, bonitaet:79 },
    { name:'Andrea Lang',      id:'KDB006', geb:'05.09.1982', beruf:'Steuerberaterin',        ort:'Lich',       segment:'Standard', produkte:5, ertrag:2400,  finanzplan:true,  letztKontakt:'12.02.2026', avatarBg:'#6366f1', nps:8,  kinder:[{name:'Sophie',alter:7}], email:'a.lang@email.de', telefon:'+49 6404 12345', adresse:'Marktplatz 3, 35423 Lich', arbeitgeber:'Kanzlei Lang & Partner', familienstand:'Geschieden', risikoscore:20, bonitaet:85 },
    { name:'Thomas Klein',     id:'KDB007', geb:'18.12.1968', beruf:'Handwerksmeister',       ort:'Buseck',     segment:'Standard', produkte:4, ertrag:1650,  finanzplan:false, letztKontakt:'10.02.2026', avatarBg:'#0891b2', nps:7,  kinder:[{name:'Max',alter:16}], email:'t.klein@email.de', telefon:'+49 6408 99123', adresse:'Am Anger 7, 35418 Buseck', arbeitgeber:'Klein Sanitaer GmbH', familienstand:'Verheiratet', risikoscore:42, bonitaet:68 },
    { name:'Monika Richter',   id:'KDB008', geb:'22.04.1975', beruf:'Lehrerin',               ort:'Giessen',    segment:'Standard', produkte:3, ertrag:1200,  finanzplan:true,  letztKontakt:'08.02.2026', avatarBg:'#d946ef', nps:8,  kinder:[{name:'Anna',alter:10},{name:'Felix',alter:7}], email:'m.richter@email.de', telefon:'+49 641 44567', adresse:'Goethering 15, 35390 Giessen', arbeitgeber:'Land Hessen', familienstand:'Verheiratet', risikoscore:12, bonitaet:80 },
    { name:'Stefan Braun',     id:'KDB009', geb:'11.06.1988', beruf:'IT-Consultant',          ort:'Marburg',    segment:'Potenzial',produkte:2, ertrag:750,   finanzplan:false, letztKontakt:'05.02.2026', avatarBg:'#ea580c', nps:5,  kinder:[], email:'s.braun@email.de', telefon:'+49 6421 55678', adresse:'Technikstr. 20, 35037 Marburg', arbeitgeber:'SAP SE', familienstand:'Ledig', risikoscore:10, bonitaet:92 },
    { name:'Katharina Wolf',   id:'KDB010', geb:'03.03.1988', beruf:'Architektin',            ort:'Giessen',    segment:'Standard', produkte:5, ertrag:2100,  finanzplan:true,  letztKontakt:'01.02.2026', avatarBg:'#059669', nps:9,  kinder:[{name:'Lara',alter:3}], email:'k.wolf@email.de', telefon:'+49 641 77890', adresse:'Schillerstr. 9, 35390 Giessen', arbeitgeber:'Wolf Architekten', familienstand:'Verheiratet', risikoscore:25, bonitaet:84 },
    { name:'Juergen Peters',   id:'KDB011', geb:'14.10.1965', beruf:'Geschaeftsfuehrer',      ort:'Wetzlar',    segment:'Premium',  produkte:7, ertrag:5100,  finanzplan:true,  letztKontakt:'28.01.2026', avatarBg:'#7c3aed', nps:8,  kinder:[{name:'Stefan',alter:28},{name:'Maria',alter:25}], email:'j.peters@email.de', telefon:'+49 6441 33789', adresse:'Industriestr. 18, 35578 Wetzlar', arbeitgeber:'Peters Metallbau GmbH', familienstand:'Verheiratet', risikoscore:30, bonitaet:76 },
    { name:'Sabine Kraus',     id:'KDB012', geb:'27.08.1979', beruf:'Apothekerin',            ort:'Lich',       segment:'Standard', produkte:4, ertrag:1900,  finanzplan:false, letztKontakt:'25.01.2026', avatarBg:'#be185d', nps:7,  kinder:[{name:'Paul',alter:8},{name:'Clara',alter:5}], email:'s.kraus@email.de', telefon:'+49 6404 66789', adresse:'Apothekenstr. 2, 35423 Lich', arbeitgeber:'Loewen-Apotheke', familienstand:'Verheiratet', risikoscore:18, bonitaet:87 }
];

// ── MOCK KUNDEN (Firmenkunde) ──
var bankKundenFK = [
    { name:'Mueller GmbH',          id:'FKB001', branche:'Maschinenbau',    ort:'Giessen',  kreditvol:8500000,  rating:'A+',  mitarbeiter:85,  ertrag:42000 },
    { name:'Schmidt & Partner',     id:'FKB002', branche:'Steuerberatung',  ort:'Wetzlar',  kreditvol:2200000,  rating:'A',   mitarbeiter:32,  ertrag:18500 },
    { name:'Weber Maschinenbau',    id:'FKB003', branche:'Anlagenbau',      ort:'Marburg',  kreditvol:12800000, rating:'A-',  mitarbeiter:145, ertrag:68000 },
    { name:'Hessische Baeckerei',   id:'FKB004', branche:'Lebensmittel',    ort:'Lich',     kreditvol:3100000,  rating:'BBB+',mitarbeiter:48,  ertrag:15200 },
    { name:'TechVision GmbH',       id:'FKB005', branche:'IT-Dienstleistung',ort:'Giessen', kreditvol:1800000,  rating:'A',   mitarbeiter:22,  ertrag:12800 },
    { name:'Lahn-Logistik AG',      id:'FKB006', branche:'Transport',       ort:'Wetzlar',  kreditvol:6200000,  rating:'BBB', mitarbeiter:120, ertrag:34500 },
    { name:'Biotech Mittelhessen',  id:'FKB007', branche:'Pharma',          ort:'Marburg',  kreditvol:4500000,  rating:'A+',  mitarbeiter:65,  ertrag:28000 },
    { name:'Metallwerk Giessen',    id:'FKB008', branche:'Metallverarbeitung',ort:'Giessen',kreditvol:9200000,  rating:'A-',  mitarbeiter:180, ertrag:52000 }
];

// ── MOCK KUNDEN (Vermoegen) ──
var bankKundenVW = [
    { name:'Dr. Friedrich von Hagen', id:'PBB001', ort:'Giessen',  aum:12500000, depot:8200000,  nachfolge:true,  stiftung:true,  ertrag:85000 },
    { name:'Elisabeth Koenig',        id:'PBB002', ort:'Wetzlar',  aum:8800000,  depot:5600000,  nachfolge:true,  stiftung:false, ertrag:62000 },
    { name:'Prof. Hans-Peter Roth',   id:'PBB003', ort:'Marburg',  aum:15200000, depot:11400000, nachfolge:true,  stiftung:true,  ertrag:108000 },
    { name:'Charlotte Steinberg',     id:'PBB004', ort:'Giessen',  aum:6400000,  depot:4100000,  nachfolge:false, stiftung:false, ertrag:42000 },
    { name:'Familie Weidmann',        id:'PBB005', ort:'Lich',     aum:22800000, depot:15200000, nachfolge:true,  stiftung:true,  ertrag:165000 },
    { name:'Industriefamilie Bauer',  id:'PBB006', ort:'Wetzlar',  aum:18500000, depot:12800000, nachfolge:true,  stiftung:true,  ertrag:135000 }
];

// ── MOCK NEUGESCHAEFT ──
var bankNeugeschaeft = [
    { nr:'NG-2026-001', produkt:'Baufinanzierung',         kunde:'Klaus Fischer',   vol:185000,  status:'Policiert', datum:'28.02.2026', sparte:'kredit' },
    { nr:'NG-2026-002', produkt:'VR-MeinDepot Sparplan',   kunde:'Sandra Mueller',  vol:500,     status:'Aktiv',     datum:'25.02.2026', sparte:'wertpapier' },
    { nr:'NG-2026-003', produkt:'Riester-Rente VR',        kunde:'Markus Wagner',   vol:2100,    status:'Policiert', datum:'20.02.2026', sparte:'vorsorge' },
    { nr:'NG-2026-004', produkt:'Privatkredit',             kunde:'Julia Becker',    vol:15000,   status:'Antrag',    datum:'18.02.2026', sparte:'kredit' },
    { nr:'NG-2026-005', produkt:'VR-FinanzPlan',            kunde:'Peter Hoffmann',  vol:0,       status:'Abgeschlossen', datum:'15.02.2026', sparte:'beratung' },
    { nr:'NG-2026-006', produkt:'Tagesgeldkonto Plus',      kunde:'Andrea Lang',     vol:50000,   status:'Aktiv',     datum:'12.02.2026', sparte:'einlage' },
    { nr:'NG-2026-007', produkt:'KfW-Foerderkredit',        kunde:'Thomas Klein',    vol:75000,   status:'Policiert', datum:'10.02.2026', sparte:'kredit' },
    { nr:'NG-2026-008', produkt:'Unfallversicherung VR',    kunde:'Monika Richter',  vol:360,     status:'Policiert', datum:'08.02.2026', sparte:'versicherung' },
    { nr:'NG-2026-009', produkt:'ETF-Depot',                kunde:'Stefan Braun',    vol:25000,   status:'Aktiv',     datum:'05.02.2026', sparte:'wertpapier' },
    { nr:'NG-2026-010', produkt:'Bausparvertrag',           kunde:'Katharina Wolf',  vol:40000,   status:'Policiert', datum:'01.02.2026', sparte:'bausparen' },
    { nr:'NG-2026-011', produkt:'Gewerbekredit',            kunde:'Juergen Peters',  vol:250000,  status:'Antrag',    datum:'28.01.2026', sparte:'kredit' },
    { nr:'NG-2026-012', produkt:'Krankenversicherung ZV',   kunde:'Sabine Kraus',    vol:480,     status:'Policiert', datum:'25.01.2026', sparte:'versicherung' }
];

// ── HELPER FUNCTIONS ──
function fmtEuroBerater(val) {
    if (val >= 1000000) return '\u20AC' + (val/1000000).toFixed(1).replace('.',',') + ' Mio.';
    if (val >= 1000) return '\u20AC' + (val/1000).toFixed(1).replace('.',',') + ' Tsd.';
    return '\u20AC' + val.toLocaleString('de-DE');
}

function fmtNumBerater(val) { return val.toLocaleString('de-DE'); }

function getInitialsBerater(name) {
    var parts = name.split(' ');
    if (parts.length >= 2) return (parts[0][0] + parts[parts.length-1][0]).toUpperCase();
    return name.substring(0,2).toUpperCase();
}

// ── INIT & SHOW OVERVIEW ──
function showBeraterOverview() {
    // Hide landing page and welcome chat
    var landingPage = document.getElementById('landingPage');
    if (landingPage) landingPage.style.display = 'none';
    var welcomeChat = document.getElementById('welcomeChat');
    if (welcomeChat) welcomeChat.style.display = 'none';

    // Hide main app
    var mainApp = document.getElementById('mainApp');
    if (mainApp) mainApp.style.display = 'none';

    // Hide all other modules
    ['bankenModule', 'assetModule', 'cvScannerModule', 'risikoscoringModule',
     'bestandsuebertragungModule', 'pmoToolboxModule', 'hrPipelineModule',
     'versicherungs1x1Module', 'kundenDetailBankPage', 'bgavUmstellungPage'].forEach(function(id) {
        var el = document.getElementById(id);
        if (el) el.style.display = 'none';
    });

    // Show berater overview page
    document.getElementById('beraterOverviewPage').style.display = 'block';

    // Load berater photo
    fillBeraterHeader();
    
    // Apply saved view mode
    setBankViewMode(bankViewMode);
    
    // Fill customer lists
    fillBeraterKundenTable();
    
    // Fill Neugeschaeft tab
    fillBeraterNeugeschaeft();
    
    // Fill further potentials
    fillBeraterWeiterePotentiale();
    
    // Show chat toggle
    var chatToggle = document.getElementById('beraterChatToggle');
    if (chatToggle) chatToggle.style.display = 'flex';
    
    // Update URL route based on current view mode
    if (window.AppRouter) {
        var routeMap = { 'retail': '/berater', 'firmenkunde': '/berater-firmenkunde', 'vermoegen': '/berater-vermoegen' };
        AppRouter.navigate(routeMap[bankViewMode] || '/berater');
    }

    // Dispatch event
    document.dispatchEvent(new CustomEvent('viewChanged', { detail: { view: 'beraterOverview' } }));
}

function fillBeraterHeader() {
    var titleEl = document.getElementById('beraterPageTitle');
    if (titleEl) titleEl.textContent = 'Berater: ' + beraterData.name;
    
    var idEl = document.getElementById('beraterIdHeader');
    if (idEl) idEl.textContent = beraterData.id;
    
    // Photo
    var photoSmall = document.getElementById('beraterPhotoSmall');
    var photoImg = document.getElementById('beraterPhotoImgSmall');
    if (photoSmall && photoImg) {
        var savedPhoto = localStorage.getItem('beraterPhoto');
        var photoToUse = savedPhoto || beraterData.photo;
        if (photoToUse) {
            photoImg.src = photoToUse;
            photoImg.style.display = 'block';
            photoImg.onerror = function() { this.style.display = 'none'; };
        }
    }
}

function handleBeraterPhotoUpload(event) {
    var file = event.target.files[0];
    if (!file) return;
    var reader = new FileReader();
    reader.onload = function(e) {
        localStorage.setItem('beraterPhoto', e.target.result);
        fillBeraterHeader();
    };
    reader.readAsDataURL(file);
}

function backFromBeraterOverview() {
    document.getElementById('beraterOverviewPage').style.display = 'none';
    var chatToggle = document.getElementById('beraterChatToggle');
    if (chatToggle) chatToggle.style.display = 'none';
    var chatWidget = document.getElementById('beraterChatWidget');
    if (chatWidget) chatWidget.style.display = 'none';
    var landing = document.getElementById('landingPage');
    if (landing) landing.style.display = 'flex';
    if (window.AppRouter) AppRouter.navigate('/landing');
    document.dispatchEvent(new CustomEvent('viewChanged', { detail: { view: 'landing' } }));
}

// ── VIEW MODE SWITCHING ──
function setBankViewMode(mode) {
    bankViewMode = mode;
    localStorage.setItem('bankViewMode', mode);
    
    // Update mode selector buttons
    var selector = document.getElementById('beraterViewModeSelector');
    if (selector) {
        var btns = selector.querySelectorAll('.view-mode-btn');
        btns.forEach(function(b) {
            b.classList.toggle('active', b.getAttribute('data-mode') === mode);
        });
    }
    
    // Show/hide tab sets
    var tabClasses = { retail: 'berater-tab-retail', firmenkunde: 'berater-tab-fk', vermoegen: 'berater-tab-vw' };
    Object.keys(tabClasses).forEach(function(m) {
        var tabs = document.querySelectorAll('.agentur-tab.' + tabClasses[m] + ', .agentur-tab-divider.' + tabClasses[m]);
        tabs.forEach(function(t) {
            t.style.display = (m === mode) ? '' : 'none';
        });
    });
    
    // Show/hide KPIs
    ['beraterRetailKpis','beraterFirmenKpis','beraterVermoegenKpis'].forEach(function(id) {
        var el = document.getElementById(id);
        if (el) el.style.display = 'none';
    });
    var kpiMap = { retail:'beraterRetailKpis', firmenkunde:'beraterFirmenKpis', vermoegen:'beraterVermoegenKpis' };
    var activeKpi = document.getElementById(kpiMap[mode]);
    if (activeKpi) activeKpi.style.display = '';
    
    // Show Uebersicht tab
    showBeraterTab('uebersicht');
    
    // Update customer list
    fillBeraterKundenTable();
}

// ── TAB SWITCHING ──
function showBeraterTab(tabName) {
    currentBeraterTab = tabName;
    
    // Deactivate all tab contents
    var contents = document.querySelectorAll('.berater-page-new .agentur-tab-content');
    contents.forEach(function(c) { c.classList.remove('active'); });
    
    // Activate target
    var target = document.getElementById('berater-tab-' + tabName);
    if (target) target.classList.add('active');
    
    // Update tab button active states
    var tabClass = { retail:'berater-tab-retail', firmenkunde:'berater-tab-fk', vermoegen:'berater-tab-vw' }[bankViewMode];
    var allBtns = document.querySelectorAll('.agentur-tab.' + tabClass);
    allBtns.forEach(function(b) { b.classList.remove('active'); });
    
    // Find matching button
    allBtns.forEach(function(b) {
        var onclick = b.getAttribute('onclick') || '';
        if (onclick.indexOf("'" + tabName + "'") > -1) {
            b.classList.add('active');
        }
    });
    
    // Show/hide KPIs (only on uebersicht)
    var kpiIds = ['beraterRetailKpis','beraterFirmenKpis','beraterVermoegenKpis'];
    kpiIds.forEach(function(id) {
        var el = document.getElementById(id);
        if (el && el.style.display !== 'none') {
            el.style.display = (tabName === 'uebersicht') ? '' : 'none';
        }
    });
    // Re-show active KPI on uebersicht
    if (tabName === 'uebersicht') {
        var kpiMap = { retail:'beraterRetailKpis', firmenkunde:'beraterFirmenKpis', vermoegen:'beraterVermoegenKpis' };
        var activeKpi = document.getElementById(kpiMap[bankViewMode]);
        if (activeKpi) activeKpi.style.display = '';
    }
    
    // Fill tab content dynamically
    if (tabName === 'stammdaten') fillBeraterStammdaten();
    if (tabName === 'ertraege') fillBeraterErtraege();
    if (tabName === 'qualitaet') fillBeraterQualitaet();
    if (tabName === 'potentiale') fillBeraterPotentiale();
    if (tabName === 'kreditportfolio') fillBeraterKreditportfolio();
    if (tabName === 'branchenmix') fillBeraterBranchenmix();
    if (tabName === 'portfolioallokation') fillBeraterPortfolio();
    if (tabName === 'performance') fillBeraterPerformance();
    if (tabName === 'nachfolge') fillBeraterNachfolge();
}

// ── FILL STAMMDATEN TAB ──
function fillBeraterStammdaten() {
    var el = document.getElementById('berater-tab-stammdaten');
    if (!el || el.innerHTML.trim() !== '') return;
    el.innerHTML = '<div class="uebersicht-card"><div class="uebersicht-card-header"><h3><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg> Beraterstammdaten</h3></div>' +
        '<div class="kunden-info-grid" style="padding:16px;">' +
        '<div class="info-item"><span class="info-label">Berater-Nr.</span><span class="info-value">' + beraterData.id + '</span></div>' +
        '<div class="info-item"><span class="info-label">Name</span><span class="info-value">' + beraterData.name + '</span></div>' +
        '<div class="info-item"><span class="info-label">Institut</span><span class="info-value">' + beraterData.institut + '</span></div>' +
        '<div class="info-item"><span class="info-label">Beratungscenter</span><span class="info-value">' + beraterData.center + '</span></div>' +
        '<div class="info-item"><span class="info-label">Hierarchie</span><span class="info-value">RD Mittelhessen &rarr; VD Giessen &rarr; BC Giessen-Sued</span></div>' +
        '<div class="info-item"><span class="info-label">Vorgesetzter</span><span class="info-value">Markus Schneider (Filialleiter)</span></div>' +
        '<div class="info-item"><span class="info-label">Telefon</span><span class="info-value">+49 641 7006-240</span></div>' +
        '<div class="info-item"><span class="info-label">E-Mail</span><span class="info-value">thomas.berger@vb-mittelhessen.de</span></div>' +
        '<div class="info-item"><span class="info-label">IHK-Registrierung</span><span class="info-value">D-F-156-PQ89-12</span></div>' +
        '<div class="info-item"><span class="info-label">Zulassungen</span><span class="info-value">WpHG &sect;34d, KWG &sect;25a, Immobiliar &sect;34i</span></div>' +
        '<div class="info-item"><span class="info-label">Weiterbildung</span><span class="info-value">42/40 Std. (105%)</span></div>' +
        '<div class="info-item"><span class="info-label">Status</span><span class="info-value"><span class="status-badge aktiv">Aktiv</span></span></div>' +
        '</div></div>';
}

// ── FILL NEUGESCHAEFT TAB ──
function fillBeraterNeugeschaeft() {
    // KPIs
    var kpiEl = document.getElementById('beraterNgKpis');
    if (kpiEl) {
        var totalVol = 0, count = bankNeugeschaeft.length;
        bankNeugeschaeft.forEach(function(n) { totalVol += n.vol; });
        kpiEl.innerHTML =
            '<div class="kennzahl-item"><div class="kennzahl-value">' + count + '</div><div class="kennzahl-label">Abschluesse</div><div class="kennzahl-trend positive">+4 gg. Vormonat</div></div>' +
            '<div class="kennzahl-item"><div class="kennzahl-value">' + fmtEuroBerater(totalVol) + '</div><div class="kennzahl-label">Gesamtvolumen</div><div class="kennzahl-trend positive">+18%</div></div>' +
            '<div class="kennzahl-item"><div class="kennzahl-value">' + fmtEuroBerater(Math.round(totalVol/count)) + '</div><div class="kennzahl-label">&Oslash; Volumen</div><div class="kennzahl-trend neutral">&plusmn;0</div></div>' +
            '<div class="kennzahl-item"><div class="kennzahl-value">72%</div><div class="kennzahl-label">Abschlussquote</div><div class="kennzahl-trend positive">+8%</div></div>';
    }
    
    // Donut chart
    var donutEl = document.getElementById('beraterNgDonut');
    if (donutEl) {
        var sparten = {};
        bankNeugeschaeft.forEach(function(n) {
            if (!sparten[n.sparte]) sparten[n.sparte] = { count:0, vol:0 };
            sparten[n.sparte].count++;
            sparten[n.sparte].vol += n.vol;
        });
        var colors = { kredit:'#2563eb', wertpapier:'#16a34a', vorsorge:'#9333ea', einlage:'#f59e0b', versicherung:'#ec4899', bausparen:'#0891b2', beratung:'#64748b' };
        var labels = { kredit:'Kredit', wertpapier:'Wertpapier', vorsorge:'Vorsorge', einlage:'Einlage', versicherung:'Versicherung', bausparen:'Bausparen', beratung:'Beratung' };
        var total = bankNeugeschaeft.length;
        var size = 140, sw = 22, cx = 70, cy = 70, r = 54;
        var circ = 2 * Math.PI * r;
        var offset = 0;
        var circles = '';
        var legend = '';
        Object.keys(sparten).forEach(function(key) {
            var pct = sparten[key].count / total;
            var dash = pct * circ;
            var color = colors[key] || '#94a3b8';
            circles += '<circle cx="' + cx + '" cy="' + cy + '" r="' + r + '" fill="none" stroke="' + color + '" stroke-width="' + sw + '" stroke-dasharray="' + dash.toFixed(1) + ' ' + (circ-dash).toFixed(1) + '" stroke-dashoffset="' + (-offset).toFixed(1) + '" transform="rotate(-90 ' + cx + ' ' + cy + ')" stroke-linecap="round"/>';
            offset += dash;
            legend += '<div class="sparten-legend-item"><span class="sparten-legend-dot" style="background:' + color + '"></span><span class="sparten-legend-name">' + (labels[key]||key) + '</span><span class="sparten-legend-val"><strong>' + Math.round(pct*100) + '%</strong> (' + sparten[key].count + ')</span></div>';
        });
        donutEl.innerHTML = '<svg width="' + size + '" height="' + size + '" viewBox="0 0 ' + size + ' ' + size + '">' + circles +
            '<text x="' + cx + '" y="' + (cy+5) + '" text-anchor="middle" font-size="15" font-weight="700" fill="#1e293b">' + total + '</text>' +
            '<text x="' + cx + '" y="' + (cy+19) + '" text-anchor="middle" font-size="10" fill="#94a3b8">Abschluesse</text></svg>' +
            '<div class="sparten-legend">' + legend + '</div>';
    }
    
    // Table
    var tableEl = document.getElementById('beraterNgTable');
    if (tableEl) {
        var rows = '';
        bankNeugeschaeft.forEach(function(n) {
            var statusClass = n.status === 'Policiert' ? 'aktiv' : (n.status === 'Aktiv' ? 'aktiv' : (n.status === 'Antrag' ? 'antrag' : ''));
            rows += '<tr class="clickable-row" onclick="openBankKundenDetail(\'' + n.kunde + '\')"><td>' + n.nr + '</td><td><span class="sparten-badge ' + n.sparte + '">' + (n.sparte.charAt(0).toUpperCase()+n.sparte.slice(1)) + '</span> ' + n.produkt + '</td><td><strong>' + n.kunde + '</strong></td><td class="text-right"><strong>' + fmtEuroBerater(n.vol) + '</strong></td><td><span class="status-badge ' + statusClass + '">' + n.status + '</span></td><td>' + n.datum + '</td></tr>';
        });
        tableEl.innerHTML = rows;
    }
}

function filterBeraterNg() {
    var search = (document.getElementById('beraterNgSearch') || {}).value || '';
    search = search.toLowerCase();
    var rows = document.querySelectorAll('#beraterNgTable tr');
    rows.forEach(function(r) {
        r.style.display = r.textContent.toLowerCase().indexOf(search) > -1 ? '' : 'none';
    });
}

// ── FILL ERTRAEGE TAB ──
function fillBeraterErtraege() {
    var el = document.getElementById('berater-tab-ertraege');
    if (!el || el.innerHTML.trim() !== '') return;
    
    var months = ['Jan','Feb','Marz','Apr','Mai','Jun','Jul','Aug','Sep','Okt','Nov','Dez'];
    var monthData = [18200,21400,19800,22600,24100,20500,23800,25200,21900,26400,24800,0];
    var maxVal = Math.max.apply(null, monthData);
    var bars = '';
    for (var i = 0; i < 11; i++) {
        var h = Math.round((monthData[i] / maxVal) * 120);
        var color = monthData[i] > 22000 ? '#16a34a' : (monthData[i] > 19000 ? '#2563eb' : '#f59e0b');
        bars += '<div style="display:flex;flex-direction:column;align-items:center;gap:4px;"><div style="height:' + h + 'px;width:28px;background:' + color + ';border-radius:4px 4px 0 0;"></div><span style="font-size:10px;color:#64748b;">' + months[i] + '</span><span style="font-size:10px;font-weight:600;">' + fmtEuroBerater(monthData[i]) + '</span></div>';
    }
    
    el.innerHTML = '<div class="uebersicht-card"><div class="uebersicht-card-header"><h3><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20"><line x1="12" y1="1" x2="12" y2="23"></line><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"></path></svg> Ertragsentwicklung 2025</h3></div>' +
        '<div class="kennzahlen-grid" style="margin-bottom:24px;">' +
        '<div class="kennzahl-item"><div class="kennzahl-value">' + fmtEuroBerater(248500) + '</div><div class="kennzahl-label">Gesamt YTD</div><div class="kennzahl-trend positive">+8,2%</div></div>' +
        '<div class="kennzahl-item"><div class="kennzahl-value">' + fmtEuroBerater(24800) + '</div><div class="kennzahl-label">Letzter Monat</div><div class="kennzahl-trend positive">+12%</div></div>' +
        '<div class="kennzahl-item"><div class="kennzahl-value">' + fmtEuroBerater(22600) + '</div><div class="kennzahl-label">&Oslash; Monat</div><div class="kennzahl-trend neutral">&plusmn;0</div></div>' +
        '<div class="kennzahl-item"><div class="kennzahl-value">' + fmtEuroBerater(300000) + '</div><div class="kennzahl-label">Jahresziel</div><div class="kennzahl-trend positive">83% erreicht</div></div>' +
        '</div>' +
        '<div style="display:flex;align-items:flex-end;gap:8px;padding:16px 0;height:180px;">' + bars + '</div></div>' +
        '<div class="uebersicht-card"><div class="uebersicht-card-header"><h3>Ertragsquellen</h3></div>' +
        '<div style="padding:16px;"><div style="display:flex;flex-direction:column;gap:12px;">' +
        buildErtragsBar('Zinsertrag',95000,248500,'#2563eb') +
        buildErtragsBar('Provisionsertrag WP',68000,248500,'#16a34a') +
        buildErtragsBar('Provisionsertrag Versicherung',42000,248500,'#9333ea') +
        buildErtragsBar('Zahlungsverkehr',28000,248500,'#f59e0b') +
        buildErtragsBar('Sonstige',15500,248500,'#94a3b8') +
        '</div></div></div>';
}

function buildErtragsBar(label, val, total, color) {
    var pct = Math.round(val/total*100);
    return '<div><div style="display:flex;justify-content:space-between;margin-bottom:4px;"><span style="font-size:13px;font-weight:600;">' + label + '</span><span style="font-size:13px;"><strong>' + fmtEuroBerater(val) + '</strong> (' + pct + '%)</span></div><div style="height:8px;background:#e2e8f0;border-radius:4px;overflow:hidden;"><div style="height:100%;width:' + pct + '%;background:' + color + ';border-radius:4px;"></div></div></div>';
}

// ── FILL QUALITAET TAB ──
function fillBeraterQualitaet() {
    var el = document.getElementById('berater-tab-qualitaet');
    if (!el || el.innerHTML.trim() !== '') return;
    
    // Complaint trend
    var trendMonths = ['Okt','Nov','Dez','Jan','Feb','Marz'];
    var trendVals = [1.2, 0.8, 1.5, 0.6, 0.9, 0.4];
    var maxTrend = 2.0;
    var trendBars = '';
    for (var i = 0; i < trendMonths.length; i++) {
        var h = Math.round((trendVals[i] / maxTrend) * 80);
        var color = trendVals[i] < 0.8 ? '#16a34a' : (trendVals[i] < 1.2 ? '#d97706' : '#dc2626');
        trendBars += '<div class="qual-trend-bar-group"><div class="qual-trend-bar" style="height:' + h + 'px;background:' + color + ';"><span class="qual-trend-value">' + trendVals[i].toFixed(1) + '</span></div><span class="qual-trend-label">' + trendMonths[i] + '</span></div>';
    }
    
    // Training progress
    var trainings = [
        { name:'WpHG Pflichtschulung', done:12, max:12, color:'#16a34a' },
        { name:'MiFID II Update', done:8, max:8, color:'#16a34a' },
        { name:'Geldwaesche-Praevention', done:4, max:6, color:'#d97706' },
        { name:'Open Finance / FIDA', done:6, max:8, color:'#2563eb' },
        { name:'ESG-Beratung', done:3, max:6, color:'#9333ea' }
    ];
    var trainHtml = '';
    trainings.forEach(function(t) {
        var pct = Math.round(t.done/t.max*100);
        trainHtml += '<div style="margin-bottom:12px;"><div style="display:flex;justify-content:space-between;margin-bottom:4px;"><span style="font-size:13px;">' + t.name + '</span><span style="font-size:12px;color:#64748b;">' + t.done + '/' + t.max + ' Std. (' + pct + '%)</span></div><div class="qual-schulung-bar"><div class="qual-schulung-bar-fill" style="width:' + pct + '%;background:' + t.color + ';"></div></div></div>';
    });
    
    // Compliance checklist
    var checks = [
        { name:'WpHG-Compliance', status:'ok' },
        { name:'MaRisk-Konformitaet', status:'ok' },
        { name:'Geldwaesche (GwG)', status:'ok' },
        { name:'Datenschutz (DSGVO)', status:'ok' },
        { name:'BaFin-Meldepflichten', status:'ok' },
        { name:'Open Finance (FIDA)', status:'warn' },
        { name:'ESG-Transparenz', status:'warn' }
    ];
    var checkHtml = '';
    checks.forEach(function(c) {
        var icon = c.status === 'ok' ? '<svg viewBox="0 0 24 24" fill="none" stroke="#16a34a" stroke-width="2" width="16" height="16"><path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>' : '<svg viewBox="0 0 24 24" fill="none" stroke="#d97706" stroke-width="2" width="16" height="16"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>';
        checkHtml += '<div class="qual-check-item"><span>' + icon + '</span><span style="flex:1;">' + c.name + '</span><span class="qual-check-status ' + c.status + '">' + (c.status==='ok'?'Erfuellt':'Teilweise') + '</span></div>';
    });
    
    el.innerHTML = '<div class="uebersicht-card"><div class="uebersicht-card-header"><h3><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20"><path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg> Qualitaetskennzahlen</h3></div>' +
        '<div class="kennzahlen-grid">' +
        '<div class="kennzahl-item"><div class="kennzahl-value">8,4</div><div class="kennzahl-label">NPS (Durchschnitt)</div><div class="kennzahl-trend positive">+0,3</div></div>' +
        '<div class="kennzahl-item"><div class="kennzahl-value">2</div><div class="kennzahl-label">Beschwerden</div><div class="kennzahl-trend positive">-3 gg. Vorjahr</div></div>' +
        '<div class="kennzahl-item"><div class="kennzahl-value">42 Std.</div><div class="kennzahl-label">Weiterbildung</div><div class="kennzahl-trend positive">105% Soll</div></div>' +
        '<div class="kennzahl-item"><div class="kennzahl-value"><span class="status-badge aktiv">Konform</span></div><div class="kennzahl-label">Compliance-Status</div></div>' +
        '</div></div>' +
        '<div class="uebersicht-card"><div class="uebersicht-card-header"><h3>Beschwerdetrend (6 Monate)</h3></div><div style="display:flex;align-items:flex-end;gap:12px;padding:16px;height:140px;">' + trendBars + '</div></div>' +
        '<div class="uebersicht-card"><div class="uebersicht-card-header"><h3>Weiterbildungsfortschritt</h3></div><div style="padding:16px;">' + trainHtml + '</div></div>' +
        '<div class="uebersicht-card"><div class="uebersicht-card-header"><h3>Compliance-Checkliste</h3></div><div style="padding:16px;display:flex;flex-direction:column;gap:8px;">' + checkHtml + '</div></div>';
}

// ── FILL POTENTIALE TAB ──
function fillBeraterPotentiale() {
    var el = document.getElementById('berater-tab-potentiale');
    if (!el || el.innerHTML.trim() !== '') return;
    
    var potentiale = [
        { kunde:'Klaus Fischer', id:'KDB001', prio:'high', produkt:'Baufinanzierung Anschluss', beschr:'Zinsbindung laeuft 09/2026 aus. Restschuld 185k. Guenstigere Konditionen moeglich.', vol:'185.000', ertrag:'2.775' },
        { kunde:'Sandra Mueller', id:'KDB002', prio:'high', produkt:'VR-FinanzPlan + Altersvorsorge', beschr:'Sparquote 1.800/Mon. ohne AV. Open Finance zeigt nur Tagesgeld.', vol:'500/Mon.', ertrag:'1.800' },
        { kunde:'Markus Wagner', id:'KDB003', prio:'medium', produkt:'Depot-Eroeffnung + ETF-Sparplan', beschr:'Depot bei Neobroker entdeckt (FIDA). Cross-Selling VR-Depot.', vol:'45.000', ertrag:'675' },
        { kunde:'Julia Becker', id:'KDB004', prio:'high', produkt:'FIDA-Consent + Gesamtberatung', beschr:'Nur 2 Produkte. Open Finance koennte weitere Potentiale aufdecken.', vol:'n/a', ertrag:'500' },
        { kunde:'Peter Hoffmann', id:'KDB005', prio:'medium', produkt:'Vermoegensverwaltung', beschr:'Hohe Liquiditaet auf Girokonto. Umschichtung in VV empfohlen.', vol:'120.000', ertrag:'1.800' },
        { kunde:'Andrea Lang', id:'KDB006', prio:'medium', produkt:'Gewerbekredit + Firmenkonto', beschr:'Selbstaendige Steuerberaterin. Kanzlei wachsend, Finanzierungsbedarf.', vol:'80.000', ertrag:'1.200' },
        { kunde:'Thomas Klein', id:'KDB007', prio:'low', produkt:'KfW-Foerderung Sanierung', beschr:'Immobilie Bj. 1975. Energetische Sanierung foerderfaehig.', vol:'75.000', ertrag:'1.125' },
        { kunde:'Stefan Braun', id:'KDB009', prio:'high', produkt:'VR-FinanzPlan', beschr:'Jung, hohes Einkommen, kaum Bankprodukte. Erstberatung dringend.', vol:'n/a', ertrag:'400' },
        { kunde:'Katharina Wolf', id:'KDB010', prio:'medium', produkt:'Risikolebensversicherung', beschr:'Junge Familie, Immobilienfinanzierung ohne Absicherung.', vol:'480/J.', ertrag:'360' },
        { kunde:'Juergen Peters', id:'KDB011', prio:'high', produkt:'Nachfolgeplanung + Stiftung', beschr:'Geschaeftsfuehrer, 60 Jahre. Unternehmensnachfolge ungeklaert.', vol:'n/a', ertrag:'5.000' },
        { kunde:'Sabine Kraus', id:'KDB012', prio:'low', produkt:'Depot-Eroeffnung', beschr:'Apothekerin mit hohem Einkommen. Depot bei Direktbank.', vol:'30.000', ertrag:'450' }
    ];
    
    var html = '<div class="uebersicht-card potentiale-impuls-card"><div class="uebersicht-card-header"><h3><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg> Alle Vertriebspotentiale (' + potentiale.length + ')</h3></div><div class="potentiale-liste-neu">';
    potentiale.forEach(function(p) {
        html += '<div class="potential-card" onclick="event.stopPropagation(); openBankKundenDetail(\'' + p.kunde + '\', \'' + p.id + '\')"><div class="potential-card-left"><div class="potential-kunde"><strong>' + p.kunde + '</strong><span class="potential-kunden-id">' + p.id + '</span><span class="impuls-priority ' + p.prio + '">' + (p.prio==='high'?'Hoch':(p.prio==='medium'?'Mittel':'Niedrig')) + '</span></div><div class="potential-produkt">' + p.produkt + '</div><div class="potential-beschreibung">' + p.beschr + '</div></div><div class="potential-card-right"><div class="potential-kennzahl"><span class="potential-kennzahl-label">Volumen</span><span class="potential-kennzahl-value">\u20AC' + p.vol + '</span></div><div class="potential-kennzahl"><span class="potential-kennzahl-label">Ertrag</span><span class="potential-kennzahl-value prov">\u20AC' + p.ertrag + '</span></div></div></div>';
    });
    html += '</div></div>';
    el.innerHTML = html;
}

// ── FILL WEITERE POTENTIALE (Uebersicht expandable) ──
function fillBeraterWeiterePotentiale() {
    var el = document.getElementById('beraterWeiterePotentialeContent');
    if (!el) return;
    var more = [
        { kunde:'Julia Becker', id:'KDB004', prio:'high', produkt:'FIDA-Consent einholen', beschr:'Nur 2 Produkte. Open Finance Analyse koennte Potentiale aufdecken.', vol:'n/a', ertrag:'500' },
        { kunde:'Peter Hoffmann', id:'KDB005', prio:'medium', produkt:'Vermoegensverwaltung', beschr:'Hohe Liquiditaet ohne Anlage. Beratung zur Vermoegenstrukturierung.', vol:'120.000', ertrag:'1.800' },
        { kunde:'Andrea Lang', id:'KDB006', prio:'medium', produkt:'Praxisfinanzierung', beschr:'Kanzleierweiterung geplant. Foerderfaehig ueber KfW.', vol:'80.000', ertrag:'1.200' },
        { kunde:'Thomas Klein', id:'KDB007', prio:'low', produkt:'KfW-Foerderung', beschr:'Immobilie sanierungsbedurftig. Energieberatung empfohlen.', vol:'75.000', ertrag:'1.125' },
        { kunde:'Stefan Braun', id:'KDB009', prio:'high', produkt:'VR-FinanzPlan', beschr:'IT-Consultant, hohes Einkommen, kein FinanzPlan.', vol:'n/a', ertrag:'400' },
        { kunde:'Katharina Wolf', id:'KDB010', prio:'medium', produkt:'Risikolebensversicherung', beschr:'Immobilie + Kind, keine Absicherung der Restschuld.', vol:'480/J.', ertrag:'360' },
        { kunde:'Juergen Peters', id:'KDB011', prio:'high', produkt:'Nachfolgeplanung', beschr:'Unternehmer 60J. Nachfolge + Stiftungsberatung.', vol:'n/a', ertrag:'5.000' },
        { kunde:'Sabine Kraus', id:'KDB012', prio:'low', produkt:'Depot-Wechsel', beschr:'Depot bei Direktbank. Uebernahme ins VR-NetWorld.', vol:'30.000', ertrag:'450' }
    ];
    var html = '';
    more.forEach(function(p) {
        html += '<div class="potential-card" onclick="event.stopPropagation(); openBankKundenDetail(\'' + p.kunde + '\', \'' + p.id + '\')"><div class="potential-card-left"><div class="potential-kunde"><strong>' + p.kunde + '</strong><span class="potential-kunden-id">' + p.id + '</span><span class="impuls-priority ' + p.prio + '">' + (p.prio==='high'?'Hoch':(p.prio==='medium'?'Mittel':'Niedrig')) + '</span></div><div class="potential-produkt">' + p.produkt + '</div><div class="potential-beschreibung">' + p.beschr + '</div></div><div class="potential-card-right"><div class="potential-kennzahl"><span class="potential-kennzahl-label">Volumen</span><span class="potential-kennzahl-value">\u20AC' + p.vol + '</span></div><div class="potential-kennzahl"><span class="potential-kennzahl-label">Ertrag</span><span class="potential-kennzahl-value prov">\u20AC' + p.ertrag + '</span></div></div></div>';
    });
    el.innerHTML = html;
}

function toggleBeraterWeiterePotentiale() {
    var list = document.getElementById('beraterWeiterePotentialeListe');
    if (!list) return;
    var isHidden = list.style.display === 'none';
    list.style.display = isHidden ? 'block' : 'none';
    var toggle = list.previousElementSibling;
    if (toggle) {
        var arrow = toggle.querySelector('.toggle-arrow');
        if (arrow) arrow.style.transform = isHidden ? 'rotate(180deg)' : '';
        var badge = toggle.querySelector('.weitere-badge');
        if (badge) badge.textContent = isHidden ? '-8' : '+8';
    }
}

// ── FILL FIRMENKUNDE TABS ──
function fillBeraterKreditportfolio() {
    var el = document.getElementById('berater-tab-kreditportfolio');
    if (!el || el.innerHTML.trim() !== '') return;
    var totalKredit = 0;
    bankKundenFK.forEach(function(k) { totalKredit += k.kreditvol; });
    
    var rows = '';
    bankKundenFK.forEach(function(k) {
        rows += '<tr class="clickable-row"><td><strong>' + k.name + '</strong></td><td>' + k.id + '</td><td>' + k.branche + '</td><td class="text-right"><strong>' + fmtEuroBerater(k.kreditvol) + '</strong></td><td><span class="status-badge aktiv">' + k.rating + '</span></td><td>' + k.mitarbeiter + '</td></tr>';
    });
    
    el.innerHTML = '<div class="uebersicht-card"><div class="uebersicht-card-header"><h3><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v16"/></svg> Kreditportfolio</h3></div>' +
        '<div class="kennzahlen-grid">' +
        '<div class="kennzahl-item"><div class="kennzahl-value">' + fmtEuroBerater(totalKredit) + '</div><div class="kennzahl-label">Gesamtvolumen</div><div class="kennzahl-trend positive">+6,1%</div></div>' +
        '<div class="kennzahl-item"><div class="kennzahl-value">' + bankKundenFK.length + '</div><div class="kennzahl-label">Firmenkunden</div></div>' +
        '<div class="kennzahl-item"><div class="kennzahl-value">' + fmtEuroBerater(Math.round(totalKredit/bankKundenFK.length)) + '</div><div class="kennzahl-label">&Oslash; Kreditvolumen</div></div>' +
        '<div class="kennzahl-item"><div class="kennzahl-value">1,2%</div><div class="kennzahl-label">Ausfallrisiko</div><div class="kennzahl-trend positive">unter Benchmark</div></div>' +
        '</div></div>' +
        '<div class="uebersicht-card"><div class="uebersicht-card-header"><h3>Kreditnehmer</h3></div>' +
        '<table class="kundenliste-table"><thead><tr><th>Firma</th><th>Kunden-Nr.</th><th>Branche</th><th class="text-right">Kreditvolumen</th><th>Rating</th><th class="text-right">Mitarbeiter</th></tr></thead><tbody>' + rows + '</tbody></table></div>';
}

function fillBeraterBranchenmix() {
    var el = document.getElementById('berater-tab-branchenmix');
    if (!el || el.innerHTML.trim() !== '') return;
    var branchen = {};
    bankKundenFK.forEach(function(k) {
        if (!branchen[k.branche]) branchen[k.branche] = { count:0, vol:0 };
        branchen[k.branche].count++;
        branchen[k.branche].vol += k.kreditvol;
    });
    var totalVol = 0;
    bankKundenFK.forEach(function(k) { totalVol += k.kreditvol; });
    var colors = ['#2563eb','#16a34a','#9333ea','#f59e0b','#ec4899','#0891b2','#dc2626','#64748b'];
    var i = 0;
    var barsHtml = '';
    Object.keys(branchen).forEach(function(b) {
        var pct = Math.round(branchen[b].vol/totalVol*100);
        var color = colors[i % colors.length]; i++;
        barsHtml += '<div><div style="display:flex;justify-content:space-between;margin-bottom:4px;"><span style="font-size:13px;font-weight:600;">' + b + ' (' + branchen[b].count + ')</span><span style="font-size:13px;">' + fmtEuroBerater(branchen[b].vol) + ' (' + pct + '%)</span></div><div style="height:8px;background:#e2e8f0;border-radius:4px;overflow:hidden;"><div style="height:100%;width:' + pct + '%;background:' + color + ';border-radius:4px;"></div></div></div>';
    });
    el.innerHTML = '<div class="uebersicht-card"><div class="uebersicht-card-header"><h3><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20"><path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"></path></svg> Branchenmix</h3></div><div style="padding:16px;display:flex;flex-direction:column;gap:16px;">' + barsHtml + '</div></div>';
}

// ── FILL VERMOEGEN TABS ──
function fillBeraterPortfolio() {
    var el = document.getElementById('berater-tab-portfolioallokation');
    if (!el || el.innerHTML.trim() !== '') return;
    var allokation = [
        { name:'Aktien', vol:28500000, color:'#2563eb' },
        { name:'Anleihen', vol:22800000, color:'#16a34a' },
        { name:'Immobilien', vol:12400000, color:'#9333ea' },
        { name:'Alternative', vol:8200000, color:'#f59e0b' },
        { name:'Liquiditaet', vol:13300000, color:'#64748b' }
    ];
    var total = 85200000;
    var barsHtml = '';
    allokation.forEach(function(a) {
        barsHtml += buildErtragsBar(a.name, a.vol, total, a.color);
    });
    el.innerHTML = '<div class="uebersicht-card"><div class="uebersicht-card-header"><h3><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20"><circle cx="12" cy="12" r="10"/><path d="M12 2v10l7 7"/></svg> Portfolio-Allokation (AuM: ' + fmtEuroBerater(total) + ')</h3></div><div style="padding:16px;display:flex;flex-direction:column;gap:16px;">' + barsHtml + '</div></div>';
}

function fillBeraterPerformance() {
    var el = document.getElementById('berater-tab-performance');
    if (!el || el.innerHTML.trim() !== '') return;
    el.innerHTML = '<div class="uebersicht-card"><div class="uebersicht-card-header"><h3><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg> Performance-Uebersicht</h3></div>' +
        '<div class="kennzahlen-grid">' +
        '<div class="kennzahl-item"><div class="kennzahl-value">+12,4%</div><div class="kennzahl-label">Portfolio YTD</div><div class="kennzahl-trend positive">vs. Benchmark +8,1%</div></div>' +
        '<div class="kennzahl-item"><div class="kennzahl-value">0,72</div><div class="kennzahl-label">Sharpe Ratio</div><div class="kennzahl-trend positive">Gut</div></div>' +
        '<div class="kennzahl-item"><div class="kennzahl-value">-4,2%</div><div class="kennzahl-label">Max. Drawdown</div><div class="kennzahl-trend positive">Kontrolliert</div></div>' +
        '<div class="kennzahl-item"><div class="kennzahl-value">94%</div><div class="kennzahl-label">Kundenzufriedenheit</div><div class="kennzahl-trend positive">+2%</div></div>' +
        '</div></div>' +
        '<div class="uebersicht-card"><div class="uebersicht-card-header"><h3>Performance nach Anlageklasse</h3></div><div style="padding:16px;display:flex;flex-direction:column;gap:16px;">' +
        buildErtragsBar('Aktien (+18,2%)', 18.2, 25, '#2563eb') +
        buildErtragsBar('Anleihen (+4,8%)', 4.8, 25, '#16a34a') +
        buildErtragsBar('Immobilien (+6,5%)', 6.5, 25, '#9333ea') +
        buildErtragsBar('Alternative (+9,1%)', 9.1, 25, '#f59e0b') +
        '</div></div>';
}

function fillBeraterNachfolge() {
    var el = document.getElementById('berater-tab-nachfolge');
    if (!el || el.innerHTML.trim() !== '') return;
    var clients = bankKundenVW.filter(function(k) { return k.nachfolge; });
    var rows = '';
    clients.forEach(function(k) {
        rows += '<div class="potential-card"><div class="potential-card-left"><div class="potential-kunde"><strong>' + k.name + '</strong><span class="potential-kunden-id">' + k.id + '</span></div><div class="potential-produkt">AuM: ' + fmtEuroBerater(k.aum) + (k.stiftung ? ' | Stiftung aktiv' : '') + '</div><div class="potential-beschreibung">Nachfolgeplanung in Bearbeitung. Generationengespraech empfohlen.</div></div><div class="potential-card-right"><div class="potential-kennzahl"><span class="potential-kennzahl-label">AuM</span><span class="potential-kennzahl-value">' + fmtEuroBerater(k.aum) + '</span></div><div class="potential-kennzahl"><span class="potential-kennzahl-label">Ertrag</span><span class="potential-kennzahl-value prov">' + fmtEuroBerater(k.ertrag) + '</span></div></div></div>';
    });
    el.innerHTML = '<div class="uebersicht-card"><div class="uebersicht-card-header"><h3><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg> Nachfolgeplanung (' + clients.length + ' Mandate)</h3></div><div class="potentiale-liste-neu">' + rows + '</div></div>';
}

// ── KUNDENLISTE TAB ──
function fillBeraterKundenTable() {
    var mode = bankViewMode;
    
    if (mode === 'retail') {
        var tbody = document.getElementById('beraterKundenBody');
        if (!tbody) return;
        var rows = '';
        bankKundenRetail.forEach(function(k) {
            rows += '<tr class="clickable-row" onclick="openBankKundenDetail(\'' + k.name + '\', \'' + k.id + '\')">' +
                '<td><strong>' + k.name + '</strong></td>' +
                '<td>' + k.id + '</td>' +
                '<td>' + k.geb + '</td>' +
                '<td>' + k.beruf + '</td>' +
                '<td class="text-center">' + k.produkte + '</td>' +
                '<td class="text-right"><strong>' + fmtEuroBerater(k.ertrag) + '</strong></td>' +
                '<td class="text-center">' + (k.finanzplan ? '<span class="status-badge aktiv">Ja</span>' : '<span class="status-badge antrag">Nein</span>') + '</td>' +
                '<td>' + k.letztKontakt + '</td></tr>';
        });
        tbody.innerHTML = rows;
        var title = document.getElementById('beraterKundenTitle');
        if (title) title.textContent = 'Kunden (' + bankKundenRetail.length + ')';
    }
    // FK and VW modes use the same table structure
}

function filterBeraterKunden() {
    var search = (document.getElementById('beraterKundenSearch') || {}).value || '';
    search = search.toLowerCase();
    var rows = document.querySelectorAll('#beraterKundenBody tr');
    rows.forEach(function(r) {
        r.style.display = r.textContent.toLowerCase().indexOf(search) > -1 ? '' : 'none';
    });
}

// ── PERIOD TOGGLE ──
function toggleBeraterPeriod(period) {
    var btns = document.querySelectorAll('.berater-page-new .period-toggle .period-btn');
    btns.forEach(function(b) { b.classList.toggle('active', b.textContent.trim().toLowerCase().indexOf(period) > -1); });
    
    var grid = document.getElementById('beraterVertriebsKennzahlen');
    if (!grid) return;
    if (period === 'month') {
        grid.innerHTML =
            '<div class="kennzahl-item clickable" onclick="showBeraterTab(\'neugeschaeft\')"><div class="kennzahl-value">68</div><div class="kennzahl-label">Abschluesse</div><div class="kennzahl-trend positive">+12 vs. Vormonat</div></div>' +
            '<div class="kennzahl-item clickable" onclick="showBeraterTab(\'neugeschaeft\')"><div class="kennzahl-value">\u20AC98.400</div><div class="kennzahl-label">Neugeschaeft</div><div class="kennzahl-trend positive">+22%</div></div>' +
            '<div class="kennzahl-item clickable" onclick="showBeraterTab(\'kundenliste\')"><div class="kennzahl-value">128</div><div class="kennzahl-label">Beratungen</div><div class="kennzahl-trend positive">+18</div></div>' +
            '<div class="kennzahl-item clickable" onclick="showBeraterTab(\'qualitaet\')"><div class="kennzahl-value">72%</div><div class="kennzahl-label">Abschlussquote</div><div class="kennzahl-trend positive">+5%</div></div>';
    } else {
        grid.innerHTML =
            '<div class="kennzahl-item clickable" onclick="showBeraterTab(\'neugeschaeft\')"><div class="kennzahl-value">18</div><div class="kennzahl-label">Abschluesse</div><div class="kennzahl-trend positive">+4 vs. Vorwoche</div></div>' +
            '<div class="kennzahl-item clickable" onclick="showBeraterTab(\'neugeschaeft\')"><div class="kennzahl-value">\u20AC24.800</div><div class="kennzahl-label">Neugeschaeft</div><div class="kennzahl-trend positive">+15%</div></div>' +
            '<div class="kennzahl-item clickable" onclick="showBeraterTab(\'kundenliste\')"><div class="kennzahl-value">32</div><div class="kennzahl-label">Beratungen</div><div class="kennzahl-trend positive">+5</div></div>' +
            '<div class="kennzahl-item clickable" onclick="showBeraterTab(\'qualitaet\')"><div class="kennzahl-value">72%</div><div class="kennzahl-label">Abschlussquote</div><div class="kennzahl-trend positive">+8%</div></div>';
    }
}

// ── NAVIGATE TO KUNDEN DETAIL ──
function openBankKundenDetail(kundenName, kundenId) {
    // Hide overview
    document.getElementById('beraterOverviewPage').style.display = 'none';
    
    // Show detail page
    var detailPage = document.getElementById('kundenDetailBankPage');
    if (detailPage) detailPage.style.display = 'block';
    
    // Copy berater info to shared header
    var headerTitle = document.getElementById('bankKundenHeaderTitle');
    if (headerTitle) headerTitle.textContent = 'Berater: ' + beraterData.name;
    var headerId = document.getElementById('bankKundenHeaderId');
    if (headerId) headerId.textContent = beraterData.id;
    
    // Copy berater photo
    var srcImg = document.getElementById('beraterPhotoImgSmall');
    var destImg = document.getElementById('bankKundenHeaderPhotoImg');
    if (srcImg && destImg && srcImg.style.display !== 'none') {
        destImg.src = srcImg.src;
        destImg.style.display = 'block';
    }
    
    // Set customer dropdown
    var select = document.getElementById('bankKundenSwitchSelect');
    if (select) select.value = kundenName;
    
    // Fill customer detail
    if (typeof fillBankKundenDetail === 'function') {
        fillBankKundenDetail(kundenName);
    }
    
    document.dispatchEvent(new CustomEvent('viewChanged', { detail: { view: 'kundenDetailBank' } }));
}

function closeBankKundenDetail() {
    document.getElementById('kundenDetailBankPage').style.display = 'none';
    document.getElementById('beraterOverviewPage').style.display = 'block';
    showBeraterTab('kundenliste');
    document.dispatchEvent(new CustomEvent('viewChanged', { detail: { view: 'beraterOverview' } }));
}

function switchBankKundeDropdown(kundenName) {
    openBankKundenDetail(kundenName);
}

function navigateToBeraterTab(tabName) {
    closeBankKundenDetail();
    showBeraterTab(tabName);
}

function resetBeraterDemoData() {
    localStorage.removeItem('beraterPhoto');
    localStorage.removeItem('bankViewMode');
    bankViewMode = 'retail';
    // Clear dynamically filled tabs
    ['berater-tab-stammdaten','berater-tab-ertraege','berater-tab-qualitaet','berater-tab-potentiale','berater-tab-kreditportfolio','berater-tab-branchenmix','berater-tab-portfolioallokation','berater-tab-performance','berater-tab-nachfolge'].forEach(function(id) {
        var el = document.getElementById(id);
        if (el) el.innerHTML = '';
    });
    showBeraterOverview();
}

// ── CHAT FUNCTIONS ──
function toggleBeraterChat() {
    var widget = document.getElementById('beraterChatWidget');
    if (!widget) return;
    var isVisible = widget.style.display !== 'none';
    widget.style.display = isVisible ? 'none' : 'flex';
}

function sendBeraterChatMessage() {
    var input = document.getElementById('beraterChatInput');
    var body = document.getElementById('beraterChatBody');
    if (!input || !body) return;
    var question = input.value.trim();
    if (!question) return;
    
    // Hide welcome
    var welcome = body.querySelector('.berater-chat-welcome');
    if (welcome) welcome.style.display = 'none';
    
    // Add user message
    var userMsg = document.createElement('div');
    userMsg.className = 'chat-message user-message';
    userMsg.innerHTML = '<div class="message-content">' + escapeHtmlBerater(question) + '</div>';
    body.appendChild(userMsg);
    input.value = '';
    body.scrollTop = body.scrollHeight;
    
    // Typing indicator
    var typing = document.createElement('div');
    typing.className = 'chat-message bot-message typing-indicator';
    typing.innerHTML = '<div class="message-content"><div class="typing-dots"><span></span><span></span><span></span></div></div>';
    body.appendChild(typing);
    body.scrollTop = body.scrollHeight;
    
    // AI response
    setTimeout(function() {
        body.removeChild(typing);
        var response = getBeraterChatResponse(question);
        var aiMsg = document.createElement('div');
        aiMsg.className = 'chat-message ai-message';
        aiMsg.innerHTML = '<div class="message-content">' + response + '</div>';
        body.appendChild(aiMsg);
        body.scrollTop = body.scrollHeight;
    }, 800);
}

function escapeHtmlBerater(str) {
    return str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}

function getBeraterChatResponse(question) {
    var q = question.toLowerCase();
    
    if (q.indexOf('top 5') > -1 || q.indexOf('ertragspotenzial') > -1) {
        return '<strong>Top 5 Kunden nach Ertragspotenzial:</strong><br><br>' +
            '<div class="chat-customer-item"><button class="chat-customer-btn" onclick="openBankKundenDetail(\'Klaus Fischer\',\'KDB001\')">Klaus Fischer</button> Baufinanzierung Anschluss &euro;185k<br><span class="chat-recommendation">Ertragspotenzial: &euro;2.775</span></div>' +
            '<div class="chat-customer-item"><button class="chat-customer-btn" onclick="openBankKundenDetail(\'Juergen Peters\',\'KDB011\')">Juergen Peters</button> Nachfolgeplanung<br><span class="chat-recommendation">Ertragspotenzial: &euro;5.000</span></div>' +
            '<div class="chat-customer-item"><button class="chat-customer-btn" onclick="openBankKundenDetail(\'Sandra Mueller\',\'KDB002\')">Sandra Mueller</button> VR-FinanzPlan + AV<br><span class="chat-recommendation">Ertragspotenzial: &euro;1.800</span></div>' +
            '<div class="chat-customer-item"><button class="chat-customer-btn" onclick="openBankKundenDetail(\'Peter Hoffmann\',\'KDB005\')">Peter Hoffmann</button> Vermoegensverwaltung<br><span class="chat-recommendation">Ertragspotenzial: &euro;1.800</span></div>' +
            '<div class="chat-customer-item"><button class="chat-customer-btn" onclick="openBankKundenDetail(\'Andrea Lang\',\'KDB006\')">Andrea Lang</button> Praxisfinanzierung<br><span class="chat-recommendation">Ertragspotenzial: &euro;1.200</span></div>' +
            '<div class="chat-followup-suggestions"><button onclick="askBeraterQuestion(\'Detailanalyse Klaus Fischer\')">Details Fischer</button><button onclick="askBeraterQuestion(\'Alle Potentiale anzeigen\')">Alle Potentiale</button></div>';
    }
    
    if (q.indexOf('finanzplan') > -1) {
        var ohneFinanzplan = bankKundenRetail.filter(function(k) { return !k.finanzplan; });
        var html = '<strong>Kunden ohne VR-FinanzPlan (' + ohneFinanzplan.length + '):</strong><br><br>';
        ohneFinanzplan.forEach(function(k) {
            html += '<div class="chat-customer-item"><button class="chat-customer-btn" onclick="openBankKundenDetail(\'' + k.name + '\',\'' + k.id + '\')">' + k.name + '</button> ' + k.beruf + ', Ertrag: ' + fmtEuroBerater(k.ertrag) + '<br><span class="chat-recommendation">Potenzial: FinanzPlan-Gespraech einladen</span></div>';
        });
        html += '<div class="chat-followup-suggestions"><button onclick="askBeraterQuestion(\'Top 5 Kunden nach Ertragspotenzial\')">Top 5 Ertrag</button></div>';
        return html;
    }
    
    if (q.indexOf('open finance') > -1 || q.indexOf('fida') > -1 || q.indexOf('cross-selling') > -1) {
        return '<strong>Open Finance / FIDA Analyse:</strong><br><br>' +
            '<div class="chat-customer-item"><button class="chat-customer-btn" onclick="openBankKundenDetail(\'Markus Wagner\',\'KDB003\')">Markus Wagner</button> Depot bei Neobroker entdeckt (&euro;45k)<br><span class="chat-recommendation">&rarr; Cross-Selling: VR-MeinDepot mit Beratung</span></div>' +
            '<div class="chat-customer-item"><button class="chat-customer-btn" onclick="openBankKundenDetail(\'Sandra Mueller\',\'KDB002\')">Sandra Mueller</button> Hohe Sparquote nur Tagesgeld<br><span class="chat-recommendation">&rarr; Altersvorsorge + Fondssparplan</span></div>' +
            '<div class="chat-customer-item"><button class="chat-customer-btn" onclick="openBankKundenDetail(\'Stefan Braun\',\'KDB009\')">Stefan Braun</button> 2 Bankverbindungen, kaum VR-Produkte<br><span class="chat-recommendation">&rarr; VR-FinanzPlan als Erstberatung</span></div>' +
            '<div class="chat-followup-suggestions"><button onclick="askBeraterQuestion(\'Welche Kunden brauchen FIDA-Consent?\')">FIDA-Consent</button><button onclick="askBeraterQuestion(\'Detailanalyse Markus Wagner\')">Details Wagner</button></div>';
    }
    
    if (q.indexOf('abwanderung') > -1 || q.indexOf('risiko') > -1 || q.indexOf('churn') > -1) {
        return '<strong>Kunden mit Abwanderungsrisiko:</strong><br><br>' +
            '<div class="chat-customer-item"><button class="chat-customer-btn" onclick="openBankKundenDetail(\'Stefan Braun\',\'KDB009\')">Stefan Braun</button> NPS: 5 (Detractor), nur 2 Produkte<br><span class="chat-recommendation">&#9888; Hohes Abwanderungsrisiko. Sofort kontaktieren.</span></div>' +
            '<div class="chat-customer-item"><button class="chat-customer-btn" onclick="openBankKundenDetail(\'Julia Becker\',\'KDB004\')">Julia Becker</button> NPS: 6, kein FinanzPlan<br><span class="chat-recommendation">&#9888; Mittleres Risiko. Beziehung vertiefen.</span></div>' +
            '<div class="chat-followup-suggestions"><button onclick="askBeraterQuestion(\'Top 5 Ertragspotenzial\')">Ertragspotenzial</button><button onclick="askBeraterQuestion(\'FinanzPlan-Potenziale\')">FinanzPlan</button></div>';
    }
    
    // Default
    return 'Ich habe Ihre Frage analysiert. Als KI-Beraterassistent kann ich Ihnen helfen mit:<br><br>' +
        '&bull; <strong>Ertragspotenziale</strong> identifizieren<br>' +
        '&bull; <strong>Open Finance / FIDA</strong> Daten analysieren<br>' +
        '&bull; <strong>Cross-Selling</strong> Chancen aufzeigen<br>' +
        '&bull; <strong>Abwanderungsrisiken</strong> erkennen<br><br>' +
        '<div class="chat-followup-suggestions"><button onclick="askBeraterQuestion(\'Top 5 Kunden nach Ertragspotenzial\')">Top 5 Ertrag</button><button onclick="askBeraterQuestion(\'Open Finance Analyse\')">Open Finance</button><button onclick="askBeraterQuestion(\'Zeige Kunden mit Abwanderungsrisiko\')">Abwanderung</button></div>';
}

function askBeraterQuestion(question) {
    var input = document.getElementById('beraterChatInput');
    if (input) {
        input.value = question;
        sendBeraterChatMessage();
    }
}

// ── WINDOW EXPORTS ──
window.showBeraterOverview = showBeraterOverview;
window.backFromBeraterOverview = backFromBeraterOverview;
window.setBankViewMode = setBankViewMode;
window.showBeraterTab = showBeraterTab;
window.toggleBeraterChat = toggleBeraterChat;
window.sendBeraterChatMessage = sendBeraterChatMessage;
window.askBeraterQuestion = askBeraterQuestion;
window.openBankKundenDetail = openBankKundenDetail;
window.closeBankKundenDetail = closeBankKundenDetail;
window.switchBankKundeDropdown = switchBankKundeDropdown;
window.navigateToBeraterTab = navigateToBeraterTab;
window.resetBeraterDemoData = resetBeraterDemoData;
window.toggleBeraterWeiterePotentiale = toggleBeraterWeiterePotentiale;
window.toggleBeraterPeriod = toggleBeraterPeriod;
window.filterBeraterKunden = filterBeraterKunden;
window.filterBeraterNg = filterBeraterNg;
window.handleBeraterPhotoUpload = handleBeraterPhotoUpload;
window.bankKundenRetail = bankKundenRetail;
window.bankKundenFK = bankKundenFK;
window.bankKundenVW = bankKundenVW;
window.beraterData = beraterData;

// ── INIT: Wire chat example buttons ──
document.addEventListener('DOMContentLoaded', function() {
    var exBtns = document.querySelectorAll('.berater-example-btn');
    exBtns.forEach(function(btn) {
        btn.addEventListener('click', function() {
            var q = btn.getAttribute('data-question');
            if (q) askBeraterQuestion(q);
        });
    });
    // Enter key for chat
    var chatInput = document.getElementById('beraterChatInput');
    if (chatInput) {
        chatInput.addEventListener('keydown', function(e) {
            if (e.key === 'Enter') { e.preventDefault(); sendBeraterChatMessage(); }
        });
    }
});
