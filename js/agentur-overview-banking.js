(function(){var r=['safeLocalGet'];var m=r.filter(function(f){return typeof window[f]==='undefined'});if(m.length)console.error('[agentur-overview-banking.js] Fehlende Deps:',m.join(', '),'← Lade utils.js zuerst!');})();
// ── BERATER / BANKING MODULE (merged from berater-overview.js) ──

/* ============================================================
   B-02 BERATER-UEBERSICHT  –  Banking Edition
   Mirrors agentur-overview.js (A-02) structure exactly
   ============================================================ */

// ── STATE ──
var bankViewMode = safeLocalGet('bankViewMode', 'retail');
var currentBeraterTab = 'uebersicht';

// ── MOCK BERATER (Atruvia agree21/OKP BankingWorkspace) ──
var beraterData = {
    name: 'Maria Musterfrau',
    id: 'VB-40210',
    photo: 'assets/images/maria-musterfrau.png',
    institut: 'Volksbank Mittelhessen eG',
    center: 'Beratungscenter Gießen-Süd',
    status: 'Aktiv',
    plattform: 'agree21 / Omnikanalplattform (OKP)',
    workspace: 'BankingWorkspace'
};

// ── MOCK KUNDEN (Retail) ──
// Derived from bankMockKunden (single source of truth, defined in kunden-detail.js)
// Populated on DOMContentLoaded after all scripts have loaded
var bankKundenRetail = [];

function _deriveBankKundenRetailFromMockKunden() {
    if (typeof bankMockKunden === 'undefined') return;
    bankKundenRetail.length = 0;
    Object.keys(bankMockKunden).forEach(function(name) {
        var kd = bankMockKunden[name];
        bankKundenRetail.push({
            name: name,
            id: kd.id || 'KDB000',
            geb: kd.geburtsdatum,
            beruf: kd.beruf,
            ort: kd.ort || '',
            segment: kd.segment || 'Standard',
            produkte: kd.konten ? kd.konten.length : 0,
            ertrag: kd.ertrag || 0,
            finanzplan: kd.finanzplan || false,
            letztKontakt: kd.letztKontakt || '',
            avatarBg: kd.avatarBg,
            nps: kd.nps ? kd.nps.score : 7,
            kinder: kd.kinder || [],
            email: kd.email,
            telefon: kd.telefon,
            adresse: kd.adresse,
            arbeitgeber: kd.arbeitgeber,
            familienstand: kd.familienstand,
            risikoscore: kd.risikoscore,
            bonitaet: kd.bonitaet
        });
    });
    window.bankKundenRetail = bankKundenRetail;
}
document.addEventListener('DOMContentLoaded', _deriveBankKundenRetailFromMockKunden);

// ── MOCK KUNDEN (Firmenkunde) ──
var bankKundenFK = [
    { name:'Müller GmbH',           id:'FKB001', branche:'Maschinenbau',    ort:'Gießen',   kreditvol:8500000,  rating:'A+',  mitarbeiter:85,  ertrag:42000 },
    { name:'Schmidt & Partner',     id:'FKB002', branche:'Steuerberatung',  ort:'Wetzlar',  kreditvol:2200000,  rating:'A',   mitarbeiter:32,  ertrag:18500 },
    { name:'Weber Maschinenbau',    id:'FKB003', branche:'Anlagenbau',      ort:'Marburg',  kreditvol:12800000, rating:'A-',  mitarbeiter:145, ertrag:68000 },
    { name:'Hessische Bäckerei',    id:'FKB004', branche:'Lebensmittel',    ort:'Lich',     kreditvol:3100000,  rating:'BBB+',mitarbeiter:48,  ertrag:15200 },
    { name:'TechVision GmbH',       id:'FKB005', branche:'IT-Dienstleistung',ort:'Gießen', kreditvol:1800000,  rating:'A',   mitarbeiter:22,  ertrag:12800 },
    { name:'Lahn-Logistik AG',      id:'FKB006', branche:'Transport',       ort:'Wetzlar',  kreditvol:6200000,  rating:'BBB', mitarbeiter:120, ertrag:34500 },
    { name:'Biotech Mittelhessen',  id:'FKB007', branche:'Pharma',          ort:'Marburg',  kreditvol:4500000,  rating:'A+',  mitarbeiter:65,  ertrag:28000 },
    { name:'Metallwerk Gießen',     id:'FKB008', branche:'Metallverarbeitung',ort:'Gießen', kreditvol:9200000,  rating:'A-',  mitarbeiter:180, ertrag:52000 }
];

// ── MOCK KUNDEN (Vermoegen) ──
var bankKundenVW = [
    { name:'Dr. Friedrich von Hagen', id:'PBB001', ort:'Gießen',   aum:12500000, depot:8200000,  nachfolge:true,  stiftung:true,  ertrag:85000 },
    { name:'Elisabeth König',         id:'PBB002', ort:'Wetzlar',  aum:8800000,  depot:5600000,  nachfolge:true,  stiftung:false, ertrag:62000 },
    { name:'Prof. Hans-Peter Roth',   id:'PBB003', ort:'Marburg',  aum:15200000, depot:11400000, nachfolge:true,  stiftung:true,  ertrag:108000 },
    { name:'Charlotte Steinberg',     id:'PBB004', ort:'Gießen',   aum:6400000,  depot:4100000,  nachfolge:false, stiftung:false, ertrag:42000 },
    { name:'Familie Weidmann',        id:'PBB005', ort:'Lich',     aum:22800000, depot:15200000, nachfolge:true,  stiftung:true,  ertrag:165000 },
    { name:'Industriefamilie Bauer',  id:'PBB006', ort:'Wetzlar',  aum:18500000, depot:12800000, nachfolge:true,  stiftung:true,  ertrag:135000 }
];

// ── MOCK NEUGESCHAEFT (agree21/OKP-Plattform Produkte, Verbundpartner) ──
var bankNeugeschaeft = [
    { nr:'NG-2026-001', produkt:'Baufinanzierung (DZ HYP)',         kunde:'Klaus Fischer',   vol:185000,  status:'Policiert', datum:'28.02.2026', sparte:'kredit', verbund:'DZ HYP' },
    { nr:'NG-2026-002', produkt:'UnionDepot Sparplan',              kunde:'Sandra Müller',   vol:500,     status:'Aktiv',     datum:'25.02.2026', sparte:'wertpapier', verbund:'Union Investment' },
    { nr:'NG-2026-003', produkt:'Riester-Rente (Union Investment)', kunde:'Markus Wagner',   vol:2100,    status:'Policiert', datum:'20.02.2026', sparte:'vorsorge', verbund:'Union Investment' },
    { nr:'NG-2026-004', produkt:'easyCredit Ratenkredit',           kunde:'Julia Becker',    vol:15000,   status:'Antrag',    datum:'18.02.2026', sparte:'kredit', verbund:'TeamBank' },
    { nr:'NG-2026-005', produkt:'VR-FinanzPlan (OKP)',              kunde:'Peter Hoffmann',  vol:0,       status:'Abgeschlossen', datum:'15.02.2026', sparte:'beratung' },
    { nr:'NG-2026-006', produkt:'VR-Tagesgeld Extra',               kunde:'Andrea Lang',     vol:50000,   status:'Aktiv',     datum:'12.02.2026', sparte:'einlage' },
    { nr:'NG-2026-007', produkt:'VR-KlimaKredit (KfW-Förderung)',  kunde:'Thomas Klein',    vol:75000,   status:'Policiert', datum:'10.02.2026', sparte:'kredit' },
    { nr:'NG-2026-008', produkt:'R+V Unfallversicherung Komfort',   kunde:'Monika Richter',  vol:360,     status:'Policiert', datum:'08.02.2026', sparte:'versicherung', verbund:'R+V Versicherung' },
    { nr:'NG-2026-009', produkt:'VR-MeinDepot ETF-Sparplan',        kunde:'Stefan Braun',    vol:25000,   status:'Aktiv',     datum:'05.02.2026', sparte:'wertpapier', verbund:'Union Investment' },
    { nr:'NG-2026-010', produkt:'FuchsImmo XS (Schwäbisch Hall)',  kunde:'Katharina Wolf',  vol:40000,   status:'Policiert', datum:'01.02.2026', sparte:'bausparen', verbund:'Bauspark. Schwäbisch Hall' },
    { nr:'NG-2026-011', produkt:'VR Smart flexibel (Gewerbekredit)',kunde:'Jürgen Peters',   vol:250000,  status:'Antrag',    datum:'28.01.2026', sparte:'kredit', verbund:'VR Smart Finanz' },
    { nr:'NG-2026-012', produkt:'R+V Kranken-ZV Familie',           kunde:'Sabine Kraus',    vol:480,     status:'Policiert', datum:'25.01.2026', sparte:'versicherung', verbund:'R+V Versicherung' }
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
    // Redirect to A-02 with banking mode
    var bankMode = 'bank-' + (bankViewMode === 'firmenkunde' ? 'fk' : (bankViewMode === 'vermoegen' ? 'vw' : 'retail'));
    if (typeof showAgenturOverview === 'function') {
        showAgenturOverview('VM00001');
        if (typeof setViewMode === 'function') {
            setViewMode(bankMode);
        }
        return;
    }

    // Fallback: standalone B-02
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
    
    // Show chat toggle and auto-open chat widget
    var chatToggle = document.getElementById('beraterChatToggle');
    if (chatToggle) chatToggle.style.display = 'flex';
    var chatWidget = document.getElementById('beraterChatWidget');
    if (chatWidget) chatWidget.style.display = 'flex';
    
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
    if (titleEl) titleEl.textContent = 'Beraterin: ' + beraterData.name;
    
    var idEl = document.getElementById('beraterIdHeader');
    if (idEl) idEl.textContent = beraterData.id;
    
    // Photo
    var photoSmall = document.getElementById('beraterPhotoSmall');
    var photoImg = document.getElementById('beraterPhotoImgSmall');
    if (photoSmall && photoImg) {
        var savedPhoto = safeLocalGet('beraterPhoto', null);
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
        safeLocalSet('beraterPhoto', e.target.result);
        fillBeraterHeader();
    };
    reader.readAsDataURL(file);
}

function backFromBeraterOverview() {
    // Hide B-02 specific elements (chat toggle + widget)
    var chatToggle = document.getElementById('beraterChatToggle');
    if (chatToggle) chatToggle.style.display = 'none';
    var chatWidget = document.getElementById('beraterChatWidget');
    if (chatWidget) chatWidget.style.display = 'none';

    // Delegate to backToLanding() which properly resets all page states,
    // module tabs, and dispatches the correct events for M-01
    if (typeof backToLanding === 'function') {
        backToLanding();
    } else {
        // Fallback if backToLanding not available
        document.getElementById('beraterOverviewPage').style.display = 'none';
        var landing = document.getElementById('landingPage');
        if (landing) landing.style.display = 'flex';
        if (window.AppRouter) AppRouter.navigate('/landing');
    }
}

// ── VIEW MODE SWITCHING ──
function setBankViewMode(mode) {
    bankViewMode = mode;
    safeLocalSet('bankViewMode', mode);
    
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
    
    // Show Übersicht tab
    showBeraterTab('uebersicht');
    
    // Update customer list
    fillBeraterKundenTable();
}

// ── TAB SWITCHING ──
function showBeraterTab(tabName) {
    currentBeraterTab = tabName;

    // Deactivate all berater tab contents (both in A-02 merged and standalone B-02)
    document.querySelectorAll('[id^="berater-tab-"]').forEach(function(c) { c.classList.remove('active'); });
    // Also deactivate insurance tabs so they don't overlap
    document.querySelectorAll('.agentur-tab-content[id^="tab-"]').forEach(function(c) { c.classList.remove('active'); });

    // Activate target
    var target = document.getElementById('berater-tab-' + tabName);
    if (target) target.classList.add('active');

    // Determine which tab button class to use based on viewMode or bankViewMode
    var modeForTabs = (typeof viewMode !== 'undefined' && viewMode.indexOf('bank-') === 0) ? viewMode : ('bank-' + (bankViewMode || 'retail'));
    var tabClassMap = { 'bank-retail':'agentur-tab-bank-retail', 'bank-fk':'agentur-tab-bank-fk', 'bank-vw':'agentur-tab-bank-vw' };
    var tabClass = tabClassMap[modeForTabs];
    if (tabClass) {
        var allBtns = document.querySelectorAll('.agentur-tab.' + tabClass);
        allBtns.forEach(function(b) { b.classList.remove('active'); });
        allBtns.forEach(function(b) {
            var onclick = b.getAttribute('onclick') || '';
            if (onclick.indexOf("'" + tabName + "'") > -1) {
                b.classList.add('active');
            }
        });
    }

    // Show/hide KPIs (only on uebersicht)
    var kpiIds = ['bankRetailKpis','bankFkKpis','bankVwKpis'];
    kpiIds.forEach(function(id) {
        var el = document.getElementById(id);
        if (el && el.style.display !== 'none') {
            el.style.display = (tabName === 'uebersicht') ? '' : 'none';
        }
    });
    // Re-show active KPI on uebersicht
    if (tabName === 'uebersicht') {
        var kpiMap = { retail:'bankRetailKpis', firmenkunde:'bankFkKpis', vermoegen:'bankVwKpis' };
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
    el.innerHTML = '<div class="uebersicht-card"><div class="uebersicht-card-header"><h3><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg> Beraterin-Stammdaten</h3></div>' +
        '<div class="kunden-info-grid" style="padding:16px;">' +
        '<div class="info-item"><span class="info-label">Berater-Nr.</span><span class="info-value">' + beraterData.id + '</span></div>' +
        '<div class="info-item"><span class="info-label">Name</span><span class="info-value">' + beraterData.name + '</span></div>' +
        '<div class="info-item"><span class="info-label">Institut</span><span class="info-value">' + beraterData.institut + '</span></div>' +
        '<div class="info-item"><span class="info-label">Beratungscenter</span><span class="info-value">' + beraterData.center + '</span></div>' +
        '<div class="info-item"><span class="info-label">Hierarchie</span><span class="info-value">RD Mittelhessen &rarr; VD Gießen &rarr; BC Gießen-Süd</span></div>' +
        '<div class="info-item"><span class="info-label">Vorgesetzter</span><span class="info-value">Markus Schneider (Filialleiter)</span></div>' +
        '<div class="info-item"><span class="info-label">Telefon</span><span class="info-value">+49 641 7006-240</span></div>' +
        '<div class="info-item"><span class="info-label">E-Mail</span><span class="info-value">maria.musterfrau@vb-mittelhessen.de</span></div>' +
        '<div class="info-item"><span class="info-label">IHK-Registrierung</span><span class="info-value">D-F-156-PQ89-12</span></div>' +
        '<div class="info-item"><span class="info-label">Zulassungen</span><span class="info-value">WpHG &sect;34d, KWG &sect;25a, Immobiliar &sect;34i</span></div>' +
        '<div class="info-item"><span class="info-label">Weiterbildung</span><span class="info-value">42/40 Std. (105%)</span></div>' +
        '<div class="info-item"><span class="info-label">Plattform</span><span class="info-value">agree21 &middot; Omnikanalplattform (OKP) &middot; BankingWorkspace</span></div>' +
        '<div class="info-item"><span class="info-label">KI-Tools</span><span class="info-value">genoGPT &middot; Truuco Impulsmanager &middot; Wissensmanagement-Bot</span></div>' +
        '<div class="info-item"><span class="info-label">Digitale Kanäle</span><span class="info-value">VR Banking App &middot; OnlineBanking &middot; Wero &middot; VideoBeratung</span></div>' +
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
            '<div class="kennzahl-item"><div class="kennzahl-value">' + count + '</div><div class="kennzahl-label">Abschlüsse</div><div class="kennzahl-trend positive">+4 gg. Vormonat</div></div>' +
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
            '<text x="' + cx + '" y="' + (cy+19) + '" text-anchor="middle" font-size="10" fill="#94a3b8">Abschlüsse</text></svg>' +
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
    
    var months = ['Jan','Feb','März','Apr','Mai','Jun','Jul','Aug','Sep','Okt','Nov','Dez'];
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
        buildErtragsBar('Provision WP (Union Investment / GENO Broker)',68000,248500,'#16a34a') +
        buildErtragsBar('Provision Versicherung (R+V)',42000,248500,'#9333ea') +
        buildErtragsBar('Zahlungsverkehr (VR Payment / Wero)',28000,248500,'#f59e0b') +
        buildErtragsBar('Bausparen (Schwäbisch Hall) / Sonstige',15500,248500,'#94a3b8') +
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
    var trendMonths = ['Okt','Nov','Dez','Jan','Feb','März'];
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
        { name:'Geldwäsche-Prävention', done:4, max:6, color:'#d97706' },
        { name:'Open Finance / FIDA (EU-VO)', done:6, max:8, color:'#2563eb' },
        { name:'ESG-Beratung (Taxonomie)', done:3, max:6, color:'#9333ea' },
        { name:'Truuco Impulsmanager / genoGPT', done:4, max:4, color:'#16a34a' },
        { name:'Wero / Digitale girocard', done:2, max:2, color:'#16a34a' }
    ];
    var trainHtml = '';
    trainings.forEach(function(t) {
        var pct = Math.round(t.done/t.max*100);
        trainHtml += '<div style="margin-bottom:12px;"><div style="display:flex;justify-content:space-between;margin-bottom:4px;"><span style="font-size:13px;">' + t.name + '</span><span style="font-size:12px;color:#64748b;">' + t.done + '/' + t.max + ' Std. (' + pct + '%)</span></div><div class="qual-schulung-bar"><div class="qual-schulung-bar-fill" style="width:' + pct + '%;background:' + t.color + ';"></div></div></div>';
    });
    
    // Compliance checklist
    var checks = [
        { name:'WpHG-Compliance', status:'ok' },
        { name:'MaRisk-Konformität', status:'ok' },
        { name:'Geldwaesche (GwG)', status:'ok' },
        { name:'Datenschutz (DSGVO)', status:'ok' },
        { name:'BaFin-Meldepflichten', status:'ok' },
        { name:'Open Finance (FIDA)', status:'warn' },
        { name:'ESG-Transparenz', status:'warn' }
    ];
    var checkHtml = '';
    checks.forEach(function(c) {
        var icon = c.status === 'ok' ? '<svg viewBox="0 0 24 24" fill="none" stroke="#16a34a" stroke-width="2" width="16" height="16"><path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>' : '<svg viewBox="0 0 24 24" fill="none" stroke="#d97706" stroke-width="2" width="16" height="16"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>';
        checkHtml += '<div class="qual-check-item"><span>' + icon + '</span><span style="flex:1;">' + c.name + '</span><span class="qual-check-status ' + c.status + '">' + (c.status==='ok'?'Erfüllt':'Teilweise') + '</span></div>';
    });
    
    el.innerHTML = '<div class="uebersicht-card"><div class="uebersicht-card-header"><h3><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20"><path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg> Qualitätskennzahlen</h3></div>' +
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
    
    // Potentiale generiert durch Truuco Impulsmanager (Data Intelligence Platform)
    var potentiale = [
        { kunde:'Klaus Fischer', id:'KDB001', prio:'high', produkt:'Anschlussfinanzierung (DZ HYP / Münchener Hyp)', beschr:'Zinsbindung läuft 09/2026 aus. Restschuld 185k. Forward-Darlehen mit günstigeren Konditionen über DZ HYP oder Münchener Hypothekenbank möglich.', vol:'185.000', ertrag:'2.775', quelle:'Truuco' },
        { kunde:'Sandra Müller', id:'KDB002', prio:'high', produkt:'VR-FinanzPlan + Union Investment Sparplan', beschr:'Sparquote 1.800/Mon. ohne Altersvorsorge. Open Finance zeigt nur Tagesgeld bei ING. UnionDepot mit VermögenPlus-Beratung empfohlen.', vol:'500/Mon.', ertrag:'1.800', quelle:'Truuco/FIDA' },
        { kunde:'Markus Wagner', id:'KDB003', prio:'medium', produkt:'VR-MeinDepot + ETF-Sparplan', beschr:'Depot bei Trade Republic (FIDA). Umzug in VR-MeinDepot mit persönlicher Beratung und niedrigeren Kosten ab 4,95\u20AC/Trade.', vol:'45.000', ertrag:'675', quelle:'FIDA' },
        { kunde:'Julia Becker', id:'KDB004', prio:'high', produkt:'FIDA-Consent + Wero-Aktivierung', beschr:'Nur 2 Produkte. Open Finance Consent einholen. Wero als Einstieg in digitale VR-Welt, dann VR-FinanzPlan.', vol:'n/a', ertrag:'500', quelle:'Impulsmanager' },
        { kunde:'Peter Hoffmann', id:'KDB005', prio:'medium', produkt:'VermögenPlus (Union Investment)', beschr:'120k auf Tagesgeld. Digitale Fondsvermögensverwaltung VermögenPlus empfohlen (0,80-1,25% Gebühren je Volumen).', vol:'120.000', ertrag:'1.800', quelle:'Truuco' },
        { kunde:'Andrea Lang', id:'KDB006', prio:'medium', produkt:'VR Smart Finanz Praxiskredit', beschr:'Kanzleierweiterung geplant. KMU-Kredit über VR Smart Finanz inkl. KfW-Förderung.', vol:'80.000', ertrag:'1.200', quelle:'Impulsmanager' },
        { kunde:'Thomas Klein', id:'KDB007', prio:'low', produkt:'VR-KlimaKredit + KfW-Förderung', beschr:'Immobilie Bj. 1975. VR-KlimaKredit bis 75.000\u20AC für energieeffiziente Sanierung. KfW-Fördermittel beantragen.', vol:'75.000', ertrag:'1.125', quelle:'Truuco' },
        { kunde:'Stefan Braun', id:'KDB009', prio:'high', produkt:'VR-FinanzPlan + Digitale girocard', beschr:'IT-affin, hohes Einkommen, kaum VR-Produkte. VR Banking App + digitale girocard als Einstieg, dann FinanzPlan.', vol:'n/a', ertrag:'400', quelle:'Impulsmanager' },
        { kunde:'Katharina Wolf', id:'KDB010', prio:'medium', produkt:'R+V Risikolebensversicherung', beschr:'Junge Familie, Baufinanzierung 180k ohne Todesfallabsicherung. R+V Premium mit Nachversicherungsgarantie.', vol:'480/J.', ertrag:'360', quelle:'Truuco' },
        { kunde:'Jürgen Peters', id:'KDB011', prio:'high', produkt:'DZ PRIVATBANK Nachfolgeplanung', beschr:'Geschäftsführer, 60 Jahre. DZ PRIVATBANK für Nachfolge + Stiftungsberatung. Kapital-LV bei Swiss Life läuft 2028 ab (FIDA).', vol:'n/a', ertrag:'5.000', quelle:'Truuco/FIDA' },
        { kunde:'Sabine Kraus', id:'KDB012', prio:'low', produkt:'UnionDepot + GENO Broker Depot-Wechsel', beschr:'52k Depot bei Comdirect (FIDA). Wechsel zu UnionDepot oder GENO Broker mit persönlicher Beratung.', vol:'30.000', ertrag:'450', quelle:'FIDA' }
    ];
    
    var html = '<div class="uebersicht-card potentiale-impuls-card"><div class="uebersicht-card-header"><h3><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg> Truuco Impulsmanager \u2013 Vertriebspotentiale (' + potentiale.length + ')</h3><span style="font-size:11px;background:rgba(37,99,235,0.1);color:#2563eb;padding:3px 10px;border-radius:12px;font-weight:600;">KI-generiert via Data Intelligence Platform</span></div><div class="potentiale-liste-neu">';
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
        { kunde:'Julia Becker', id:'KDB004', prio:'high', produkt:'FIDA-Consent + Wero-Onboarding', beschr:'Nur 2 Produkte. FIDA-Consent einholen, Wero-Aktivierung als Einstieg in digitales VR-Ökosystem.', vol:'n/a', ertrag:'500' },
        { kunde:'Peter Hoffmann', id:'KDB005', prio:'medium', produkt:'VermögenPlus (Union Investment)', beschr:'120k Liquidität. Digitale Fondsvermögensverwaltung VermögenPlus empfohlen.', vol:'120.000', ertrag:'1.800' },
        { kunde:'Andrea Lang', id:'KDB006', prio:'medium', produkt:'VR Smart Finanz Praxiskredit', beschr:'Kanzleierweiterung. KMU-Kredit über VR Smart Finanz + KfW-Förderung.', vol:'80.000', ertrag:'1.200' },
        { kunde:'Thomas Klein', id:'KDB007', prio:'low', produkt:'VR-KlimaKredit (KfW)', beschr:'Immobilie Bj. 1975. VR-KlimaKredit bis 75k\u20AC für energetische Sanierung.', vol:'75.000', ertrag:'1.125' },
        { kunde:'Stefan Braun', id:'KDB009', prio:'high', produkt:'VR-FinanzPlan + Digitale girocard', beschr:'IT-affin, hohes Einkommen. Digitale girocard in VR Banking App + FinanzPlan.', vol:'n/a', ertrag:'400' },
        { kunde:'Katharina Wolf', id:'KDB010', prio:'medium', produkt:'R+V Risikolebensversicherung', beschr:'Baufinanzierung 180k ohne Absicherung. R+V Premium empfohlen.', vol:'480/J.', ertrag:'360' },
        { kunde:'Jürgen Peters', id:'KDB011', prio:'high', produkt:'DZ PRIVATBANK Nachfolgeplanung', beschr:'Unternehmer 60J. DZ PRIVATBANK + Stiftungsberatung, Swiss Life LV-Ablauf 2028 (FIDA).', vol:'n/a', ertrag:'5.000' },
        { kunde:'Sabine Kraus', id:'KDB012', prio:'low', produkt:'UnionDepot / GENO Broker Wechsel', beschr:'52k Depot bei Comdirect (FIDA). Wechsel mit Beratung + Mitglieder-Vorteil.', vol:'30.000', ertrag:'450' }
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
        { name:'Liquidität', vol:13300000, color:'#64748b' }
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
    el.innerHTML = '<div class="uebersicht-card"><div class="uebersicht-card-header"><h3><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg> Performance-Übersicht</h3></div>' +
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
        var kundenFotos = (typeof bankKundenFotos !== 'undefined') ? bankKundenFotos : {};
        bankKundenRetail.forEach(function(k) {
            var foto = kundenFotos[k.name] || '';
            var avatarHtml = foto
                ? '<div style="width:28px;height:28px;border-radius:50%;overflow:hidden;display:inline-block;vertical-align:middle;margin-right:8px;flex-shrink:0;background:' + k.avatarBg + ';"><img src="' + foto + '" alt="' + k.name + '" style="width:100%;height:100%;object-fit:cover;" onerror="this.parentElement.innerHTML=\'' + k.name.split(' ').map(function(n){return n[0];}).join('') + '\'"></div>'
                : '<div style="width:28px;height:28px;border-radius:50%;display:inline-flex;align-items:center;justify-content:center;font-size:11px;font-weight:600;color:white;background:' + k.avatarBg + ';vertical-align:middle;margin-right:8px;flex-shrink:0;">' + k.name.split(' ').map(function(n){return n[0];}).join('') + '</div>';
            rows += '<tr class="clickable-row" onclick="openBankKundenDetail(\'' + k.name + '\', \'' + k.id + '\')">' +
                '<td><div style="display:flex;align-items:center;">' + avatarHtml + '<strong>' + k.name + '</strong></div></td>' +
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
            '<div class="kennzahl-item clickable" onclick="showBeraterTab(\'neugeschaeft\')"><div class="kennzahl-value">68</div><div class="kennzahl-label">Abschlüsse</div><div class="kennzahl-trend positive">+12 vs. Vormonat</div></div>' +
            '<div class="kennzahl-item clickable" onclick="showBeraterTab(\'neugeschaeft\')"><div class="kennzahl-value">\u20AC98.400</div><div class="kennzahl-label">Neugeschäft</div><div class="kennzahl-trend positive">+22%</div></div>' +
            '<div class="kennzahl-item clickable" onclick="showBeraterTab(\'kundenliste\')"><div class="kennzahl-value">128</div><div class="kennzahl-label">Beratungen</div><div class="kennzahl-trend positive">+18</div></div>' +
            '<div class="kennzahl-item clickable" onclick="showBeraterTab(\'qualitaet\')"><div class="kennzahl-value">72%</div><div class="kennzahl-label">Abschlussquote</div><div class="kennzahl-trend positive">+5%</div></div>';
    } else {
        grid.innerHTML =
            '<div class="kennzahl-item clickable" onclick="showBeraterTab(\'neugeschaeft\')"><div class="kennzahl-value">18</div><div class="kennzahl-label">Abschlüsse</div><div class="kennzahl-trend positive">+4 vs. Vorwoche</div></div>' +
            '<div class="kennzahl-item clickable" onclick="showBeraterTab(\'neugeschaeft\')"><div class="kennzahl-value">\u20AC24.800</div><div class="kennzahl-label">Neugeschäft</div><div class="kennzahl-trend positive">+15%</div></div>' +
            '<div class="kennzahl-item clickable" onclick="showBeraterTab(\'kundenliste\')"><div class="kennzahl-value">32</div><div class="kennzahl-label">Beratungen</div><div class="kennzahl-trend positive">+5</div></div>' +
            '<div class="kennzahl-item clickable" onclick="showBeraterTab(\'qualitaet\')"><div class="kennzahl-value">72%</div><div class="kennzahl-label">Abschlussquote</div><div class="kennzahl-trend positive">+8%</div></div>';
    }
}

// ── NAVIGATE TO KUNDEN DETAIL ──
// Redirects to unified A-10 page instead of separate B-10
function openBankKundenDetail(kundenName, kundenId) {
    // Track that we came from berater overview (B-02)
    if (typeof previousViewBeforeKundenDetail !== 'undefined') {
        previousViewBeforeKundenDetail = 'beraterOverview';
    }

    // Update A-02 header to show berater info (so updateKundenSharedHeader copies it to A-10)
    var titleEl = document.getElementById('agenturPageTitle');
    var subtitleId = document.getElementById('agenturIdHeader');
    if (titleEl) titleEl.textContent = 'Beraterin: ' + beraterData.name;
    if (subtitleId) {
        var subtitleDiv = subtitleId.parentElement;
        if (subtitleDiv) {
            subtitleDiv.innerHTML = '<span id="agenturIdHeader">' + beraterData.id + '</span> | <span id="agenturStatusHeader">Aktiv</span>';
        }
    }

    // Copy berater photo to agentur photo (so A-10 shared header picks it up)
    var srcImg = document.getElementById('beraterPhotoImgSmall');
    var destImg = document.getElementById('agenturPhotoImgSmall');
    if (srcImg && destImg && srcImg.style.display !== 'none') {
        destImg.src = srcImg.src;
        destImg.style.display = 'block';
    }

    // Populate A-10 dropdown with bank customers
    populateA10BankDropdown();

    // Open unified A-10 customer detail page
    openKundenDetail(kundenName, kundenId || 'KDB000');

    // After A-10 loads, fill bank-specific data
    setTimeout(function() {
        if (typeof fillBankKundenDetail === 'function') {
            fillBankKundenDetail(kundenName);
        }
        // Adapt A-10 tabs for bank mode
        adaptA10ForBankMode(kundenName);
    }, 100);
}

// Populate A-10 customer dropdown with bank customers
function populateA10BankDropdown() {
    var select = document.getElementById('kundenSwitchSelect');
    if (!select) return;

    // Get list of bank customers based on viewMode
    var customers = [];
    if (typeof viewMode !== 'undefined') {
        if (viewMode === 'bank-retail' && typeof bankKundenRetail !== 'undefined') {
            customers = bankKundenRetail;
        } else if (viewMode === 'bank-fk' && typeof bankKundenFK !== 'undefined') {
            customers = bankKundenFK;
        } else if (viewMode === 'bank-vw' && typeof bankKundenVW !== 'undefined') {
            customers = bankKundenVW;
        }
    }

    if (customers.length > 0) {
        select.innerHTML = '';
        customers.forEach(function(k) {
            var opt = document.createElement('option');
            opt.value = k.name;
            opt.textContent = k.name;
            select.appendChild(opt);
        });
    }
}

// Adapt A-10 page tabs and content for bank mode
function adaptA10ForBankMode(kundenName) {
    var kundenPage = document.getElementById('kundenDetailPage');
    if (!kundenPage) return;

    kundenPage.classList.add('bank-mode');

    // Rename "Betreute Verträge" tab to "Konten & Produkte"
    var vertraegeTab = kundenPage.querySelector('.kunden-tab[data-tab="vertraege"]');
    if (vertraegeTab) {
        vertraegeTab.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline></svg> Konten & Produkte';
    }

    // Fill bank stammdaten into A-10 elements
    var kd = null;
    if (typeof bankMockKunden !== 'undefined') {
        kd = bankMockKunden[kundenName];
    }
    if (!kd) return;

    // Override A-10 stammdaten with bank data
    var nameEl = document.getElementById('kundenName');
    if (nameEl) nameEl.textContent = kundenName;

    var fields = {
        'kundenGeburtsdatum': kd.geburtsdatum,
        'kundenAdresse': kd.adresse,
        'kundenTelefon': kd.telefon,
        'kundenEmail': kd.email,
        'kundenBeruf': kd.beruf,
        'kundenFamilienstand': kd.familienstand,
        'kundenArbeitgeber': kd.arbeitgeber,
        'kundenBeschaeftigt': kd.beschaeftigtSeit,
        'kundenEinkommen': '\u20AC' + kd.nettoeinkommen.toLocaleString('de-DE') + '/Mon.'
    };
    for (var id in fields) {
        var el = document.getElementById(id);
        if (el) el.textContent = fields[id];
    }

    // Fill Konten & Produkte (reuse vertraege tab content)
    var kontenBody = document.getElementById('kundenVertraege');
    if (kontenBody && kd.konten) {
        kontenBody.innerHTML = '';
        kd.konten.forEach(function(k) {
            var saldo = typeof k.saldo === 'number' ? (k.saldo < 0 ? '-' : '') + '\u20AC' + Math.abs(k.saldo).toLocaleString('de-DE') : k.saldo;
            var statusClass = k.status === 'Aktiv' ? 'aktiv' : 'storniert';
            kontenBody.innerHTML += '<tr><td>' + k.produkt + '</td><td>' + k.details + '</td><td class="text-right">' + saldo + '</td><td>' + k.eroeffnung + '</td><td><span class="status-badge ' + statusClass + '">' + k.status + '</span></td></tr>';
        });
    }

    // Adapt shared header tabs for bank module
    adaptA10HeaderTabsForBank();
}

// Adapt A-10 shared header tabs for bank navigation
function adaptA10HeaderTabsForBank() {
    var headerTabs = document.querySelector('#kundenDetailPage .agentur-header-tabs');
    if (!headerTabs) return;

    headerTabs.innerHTML = '' +
        '<button class="agentur-tab" onclick="navigateToBeraterTabFromA10(\'uebersicht\')">' +
            '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg> Übersicht' +
        '</button>' +
        '<button class="agentur-tab" onclick="navigateToBeraterTabFromA10(\'stammdaten\')">' +
            '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg> Stammdaten' +
        '</button>' +
        '<button class="agentur-tab" onclick="navigateToBeraterTabFromA10(\'neugeschaeft\')">' +
            '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14"><line x1="12" y1="20" x2="12" y2="10"></line><line x1="18" y1="20" x2="18" y2="4"></line><line x1="6" y1="20" x2="6" y2="16"></line></svg> Neugeschäft' +
        '</button>' +
        '<button class="agentur-tab" onclick="navigateToBeraterTabFromA10(\'ertraege\')">' +
            '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14"><circle cx="12" cy="12" r="10"></circle><text x="12" y="16" text-anchor="middle" fill="currentColor" stroke="none" font-size="12" font-weight="bold">\u20AC</text></svg> Erträge' +
        '</button>' +
        '<button class="agentur-tab" onclick="navigateToBeraterTabFromA10(\'qualitaet\')">' +
            '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14"><path d="M22 11.08V12a10 10 0 11-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg> Qualität' +
        '</button>' +
        '<div class="agentur-tab-divider"></div>' +
        '<button class="agentur-tab active" onclick="navigateToBeraterTabFromA10(\'kundenliste\')">' +
            '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 00-3-3.87"></path><path d="M16 3.13a4 4 0 010 7.75"></path></svg> Kunden' +
        '</button>' +
        '<button class="agentur-tab" onclick="navigateToBeraterTabFromA10(\'potentiale\')">' +
            '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg> Potentiale' +
        '</button>';
}

// Navigate from A-10 back to B-02 berater tab
function navigateToBeraterTabFromA10(tabName) {
    document.getElementById('kundenDetailPage').style.display = 'none';
    restoreA10InsuranceMode();

    var beraterPage = document.getElementById('beraterOverviewPage');
    var agenturOverview = document.getElementById('agenturOverview');

    if (agenturOverview && agenturOverview.querySelector('#beraterOverviewPage')) {
        agenturOverview.style.display = 'block';
    } else if (beraterPage) {
        beraterPage.style.display = 'block';
    } else if (agenturOverview) {
        agenturOverview.style.display = 'block';
    }

    if (typeof showBeraterTab === 'function') {
        showBeraterTab(tabName);
    }

    document.dispatchEvent(new CustomEvent('viewChanged', { detail: { view: 'beraterOverview' } }));
}

// Restore A-10 to insurance mode when leaving bank context
function restoreA10InsuranceMode() {
    var kundenPage = document.getElementById('kundenDetailPage');
    if (!kundenPage || !kundenPage.classList.contains('bank-mode')) return;

    kundenPage.classList.remove('bank-mode');

    // Restore "Betreute Verträge" tab label
    var vertraegeTab = kundenPage.querySelector('.kunden-tab[data-tab="vertraege"]');
    if (vertraegeTab) {
        vertraegeTab.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline></svg> Betreute Verträge';
    }

    // Restore A-10 dropdown with insurance customers
    restoreA10InsuranceDropdown();

    // Restore A-02 header tabs
    restoreA10InsuranceHeaderTabs();
}

function restoreA10InsuranceDropdown() {
    var select = document.getElementById('kundenSwitchSelect');
    if (!select) return;
    var insuranceCustomers = ['Peter Schmidt','Amira König','Thomas Weber','Anna Hoffmann','Michael Braun','Lisa Müller','Klaus Meier','Matthias Engel','Christian Bauer','Martin Wolf','Eva Hartmann'];
    select.innerHTML = '';
    insuranceCustomers.forEach(function(name) {
        var opt = document.createElement('option');
        opt.value = name;
        opt.textContent = name;
        select.appendChild(opt);
    });
}

function restoreA10InsuranceHeaderTabs() {
    var headerTabs = document.querySelector('#kundenDetailPage .agentur-header-tabs');
    if (!headerTabs) return;

    headerTabs.innerHTML = '' +
        '<button class="agentur-tab" onclick="navigateToAgenturTab(\'uebersicht\')">' +
            '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg> Übersicht' +
        '</button>' +
        '<button class="agentur-tab" onclick="navigateToAgenturTab(\'stammdaten\')">' +
            '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg> Stammdaten' +
        '</button>' +
        '<button class="agentur-tab" onclick="navigateToAgenturTab(\'neugeschaeft\')">' +
            '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14"><line x1="12" y1="20" x2="12" y2="10"></line><line x1="18" y1="20" x2="18" y2="4"></line><line x1="6" y1="20" x2="6" y2="16"></line></svg> Neugeschäft' +
        '</button>' +
        '<button class="agentur-tab" onclick="navigateToAgenturTab(\'bestand\')">' +
            '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14"><path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"></path></svg> Bestand' +
        '</button>' +
        '<button class="agentur-tab" onclick="navigateToAgenturTab(\'storno\')">' +
            '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg> Storno' +
        '</button>' +
        '<button class="agentur-tab" onclick="navigateToAgenturTab(\'provision\')">' +
            '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14"><circle cx="12" cy="12" r="10"></circle><text x="12" y="16" text-anchor="middle" fill="currentColor" stroke="none" font-size="12" font-weight="bold">\u20AC</text></svg> Vergütung' +
        '</button>' +
        '<button class="agentur-tab" onclick="navigateToAgenturTab(\'qualitaet\')">' +
            '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14"><path d="M22 11.08V12a10 10 0 11-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg> Qualität' +
        '</button>' +
        '<div class="agentur-tab-divider"></div>' +
        '<button class="agentur-tab active" onclick="navigateToAgenturTab(\'kundenliste\')">' +
            '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 00-3-3.87"></path><path d="M16 3.13a4 4 0 010 7.75"></path></svg> Kunden' +
        '</button>' +
        '<button class="agentur-tab" onclick="navigateToAgenturTab(\'potential\')">' +
            '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg> Potentiale' +
        '</button>';
}

function closeBankKundenDetail() {
    // Now A-10 is used for bank customers too, so close it and restore insurance mode
    document.getElementById('kundenDetailPage').style.display = 'none';
    restoreA10InsuranceMode();

    // Return to A-02 (merged) if available, otherwise standalone B-02
    var agenturOverview = document.getElementById('agenturOverview');
    if (agenturOverview) {
        agenturOverview.style.display = 'block';
    } else {
        var beraterPage = document.getElementById('beraterOverviewPage');
        if (beraterPage) beraterPage.style.display = 'block';
    }
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
        return '<strong>Top 5 Kunden nach Ertragspotenzial</strong> <span style="font-size:10px;background:#dbeafe;color:#1e40af;padding:2px 8px;border-radius:10px;">Truuco Impulsmanager</span><br><br>' +
            '<div class="chat-customer-item"><button class="chat-customer-btn" onclick="openBankKundenDetail(\'Klaus Fischer\',\'KDB001\')">Klaus Fischer</button> Anschlussfinanzierung DZ HYP &euro;185k<br><span class="chat-recommendation">Ertragspotenzial: &euro;2.775</span></div>' +
            '<div class="chat-customer-item"><button class="chat-customer-btn" onclick="openBankKundenDetail(\'Jürgen Peters\',\'KDB011\')">Jürgen Peters</button> DZ PRIVATBANK Nachfolgeplanung<br><span class="chat-recommendation">Ertragspotenzial: &euro;5.000</span></div>' +
            '<div class="chat-customer-item"><button class="chat-customer-btn" onclick="openBankKundenDetail(\'Sandra Müller\',\'KDB002\')">Sandra Müller</button> Union Investment Sparplan + VR-FinanzPlan<br><span class="chat-recommendation">Ertragspotenzial: &euro;1.800</span></div>' +
            '<div class="chat-customer-item"><button class="chat-customer-btn" onclick="openBankKundenDetail(\'Peter Hoffmann\',\'KDB005\')">Peter Hoffmann</button> VermögenPlus (Union Investment)<br><span class="chat-recommendation">Ertragspotenzial: &euro;1.800</span></div>' +
            '<div class="chat-customer-item"><button class="chat-customer-btn" onclick="openBankKundenDetail(\'Andrea Lang\',\'KDB006\')">Andrea Lang</button> VR Smart Finanz Praxiskredit<br><span class="chat-recommendation">Ertragspotenzial: &euro;1.200</span></div>' +
            '<div class="chat-followup-suggestions"><button onclick="askBeraterQuestion(\'Detailanalyse Klaus Fischer\')">Details Fischer</button><button onclick="askBeraterQuestion(\'Alle Potentiale anzeigen\')">Alle Potentiale</button><button onclick="askBeraterQuestion(\'Verbundpartner-Produkte\')">Verbundpartner</button></div>';
    }
    
    if (q.indexOf('finanzplan') > -1) {
        var ohneFinanzplan = bankKundenRetail.filter(function(k) { return !k.finanzplan; });
        var html = '<strong>Kunden ohne VR-FinanzPlan (' + ohneFinanzplan.length + '):</strong><br><br>';
        ohneFinanzplan.forEach(function(k) {
            html += '<div class="chat-customer-item"><button class="chat-customer-btn" onclick="openBankKundenDetail(\'' + k.name + '\',\'' + k.id + '\')">' + k.name + '</button> ' + k.beruf + ', Ertrag: ' + fmtEuroBerater(k.ertrag) + '<br><span class="chat-recommendation">Potenzial: FinanzPlan-Gespräch einladen</span></div>';
        });
        html += '<div class="chat-followup-suggestions"><button onclick="askBeraterQuestion(\'Top 5 Kunden nach Ertragspotenzial\')">Top 5 Ertrag</button></div>';
        return html;
    }
    
    if (q.indexOf('open finance') > -1 || q.indexOf('fida') > -1 || q.indexOf('cross-selling') > -1) {
        return '<strong>Open Finance / FIDA Analyse</strong> <span style="font-size:10px;background:#dbeafe;color:#1e40af;padding:2px 8px;border-radius:10px;">Data Intelligence Platform</span><br><br>' +
            '<div class="chat-customer-item"><button class="chat-customer-btn" onclick="openBankKundenDetail(\'Markus Wagner\',\'KDB003\')">Markus Wagner</button> Depot bei Trade Republic (&euro;45k via FIDA)<br><span class="chat-recommendation">&rarr; Cross-Selling: VR-MeinDepot ab 4,95&euro;/Trade mit pers&ouml;nlicher Beratung</span></div>' +
            '<div class="chat-customer-item"><button class="chat-customer-btn" onclick="openBankKundenDetail(\'Sandra Müller\',\'KDB002\')">Sandra Müller</button> &euro;85k Tagesgeld + Scalable Capital Depot<br><span class="chat-recommendation">&rarr; UnionDepot Sparplan + VermögenPlus Beratung</span></div>' +
            '<div class="chat-customer-item"><button class="chat-customer-btn" onclick="openBankKundenDetail(\'Stefan Braun\',\'KDB009\')">Stefan Braun</button> Hauptkonto N26, Depots bei Trade Republic + Scalable<br><span class="chat-recommendation">&rarr; VR-FinanzPlan + Wero + Digitale girocard als Einstieg</span></div>' +
            '<div class="chat-followup-suggestions"><button onclick="askBeraterQuestion(\'Welche Kunden brauchen FIDA-Consent?\')">FIDA-Consent</button><button onclick="askBeraterQuestion(\'Detailanalyse Markus Wagner\')">Details Wagner</button><button onclick="askBeraterQuestion(\'Verbundpartner-Produkte\')">Verbundpartner</button></div>';
    }

    if (q.indexOf('verbundpartner') > -1 || q.indexOf('verbund') > -1) {
        return '<strong>Verbundpartner-Produkte der DZ BANK Gruppe:</strong><br><br>' +
            '&bull; <strong>Union Investment</strong> \u2013 UnionDepot, VermögenPlus, Fondssparpläne ab 25&euro;/Mon.<br>' +
            '&bull; <strong>Schwäbisch Hall</strong> \u2013 FuchsImmo XS (ab 1,95%), XP, XL, FuchsEco (XE)<br>' +
            '&bull; <strong>R+V Versicherung</strong> \u2013 Vollsortiment, Mitglieder-Plus bis 10% Cashback<br>' +
            '&bull; <strong>TeamBank (easyCredit)</strong> \u2013 Raten-/Rahmenkredit, Sofortentscheidung<br>' +
            '&bull; <strong>DZ HYP / Münchener Hyp</strong> \u2013 Baufinanzierung, Forward-Darlehen<br>' +
            '&bull; <strong>DZ PRIVATBANK</strong> \u2013 Private Banking, Nachfolgeplanung<br>' +
            '&bull; <strong>VR Smart Finanz</strong> \u2013 Leasing, Mietkauf, KMU-Kredite<br>' +
            '&bull; <strong>GENO Broker</strong> \u2013 Wertpapier-Brokerage<br>' +
            '&bull; <strong>ReiseBank</strong> \u2013 Edelmetalle (Gold/Silber online)<br><br>' +
            '<div class="chat-followup-suggestions"><button onclick="askBeraterQuestion(\'Top 5 Ertragspotenzial\')">Top 5 Ertrag</button><button onclick="askBeraterQuestion(\'Open Finance Analyse\')">Open Finance</button></div>';
    }
    
    if (q.indexOf('abwanderung') > -1 || q.indexOf('risiko') > -1 || q.indexOf('churn') > -1) {
        return '<strong>Kunden mit Abwanderungsrisiko:</strong><br><br>' +
            '<div class="chat-customer-item"><button class="chat-customer-btn" onclick="openBankKundenDetail(\'Stefan Braun\',\'KDB009\')">Stefan Braun</button> NPS: 5 (Detractor), nur 2 Produkte<br><span class="chat-recommendation">&#9888; Hohes Abwanderungsrisiko. Sofort kontaktieren.</span></div>' +
            '<div class="chat-customer-item"><button class="chat-customer-btn" onclick="openBankKundenDetail(\'Julia Becker\',\'KDB004\')">Julia Becker</button> NPS: 6, kein FinanzPlan<br><span class="chat-recommendation">&#9888; Mittleres Risiko. Beziehung vertiefen.</span></div>' +
            '<div class="chat-followup-suggestions"><button onclick="askBeraterQuestion(\'Top 5 Ertragspotenzial\')">Ertragspotenzial</button><button onclick="askBeraterQuestion(\'FinanzPlan-Potenziale\')">FinanzPlan</button></div>';
    }
    
    // Default
    return 'Ich bin Ihr <strong>genoGPT Vertriebs-Assistent</strong> auf der Omnikanalplattform. Ich kann Ihnen helfen mit:<br><br>' +
        '&bull; <strong>Truuco Impulse</strong> \u2013 KI-gest\u00fctzte Vertriebspotentiale<br>' +
        '&bull; <strong>Open Finance / FIDA</strong> \u2013 Drittbank-Daten analysieren<br>' +
        '&bull; <strong>Verbundpartner</strong> \u2013 DZ BANK Gruppe Produkte<br>' +
        '&bull; <strong>Abwanderungsrisiken</strong> \u2013 NPS-basierte Analyse<br><br>' +
        '<div class="chat-followup-suggestions"><button onclick="askBeraterQuestion(\'Top 5 Kunden nach Ertragspotenzial\')">Top 5 Ertrag</button><button onclick="askBeraterQuestion(\'Open Finance Analyse\')">Open Finance</button><button onclick="askBeraterQuestion(\'Verbundpartner-Produkte\')">Verbundpartner</button><button onclick="askBeraterQuestion(\'Zeige Kunden mit Abwanderungsrisiko\')">Abwanderung</button></div>';
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
window.__registerModule('agentur-overview-banking.js');
