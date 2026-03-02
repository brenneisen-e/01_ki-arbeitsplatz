// js/agentur-overview.js - Agentur-Übersicht Funktionalität (Fachkonzept-konform)

// ========================================
// STATE
// ========================================

// Speichert die aktuell angezeigte Agentur-ID
let currentAgenturIdInOverview = null;

// ========================================
// AGENTUR OVERVIEW FUNCTIONS
// ========================================

/**
 * Zeigt die Agentur-Übersichts-Seite für eine bestimmte Agentur
 * @param {string} vermittlerId - Die Vermittler-ID (z.B. 'VM00001')
 */
function showAgenturOverview(vermittlerId) {
    console.log('Zeige Agentur-Übersicht für:', vermittlerId);

    // Verstecke alle anderen Pages
    const landingPage = document.getElementById('landingPage');
    const mainApp = document.getElementById('mainApp');
    const agenturOverview = document.getElementById('agenturOverview');
    const billingCheckPage = document.getElementById('billingCheckPage');
    const potentialPage = document.getElementById('potentialAnalysePage');
    const kundenDetail = document.getElementById('kundenDetailPage');

    if (landingPage) landingPage.style.display = 'none';
    if (mainApp) mainApp.style.display = 'none';
    if (billingCheckPage) billingCheckPage.style.display = 'none';
    if (potentialPage) potentialPage.style.display = 'none';
    if (kundenDetail) kundenDetail.style.display = 'none';
    const bgavPage = document.getElementById('bgavUmstellungPage');
    if (bgavPage) bgavPage.style.display = 'none';
    if (agenturOverview) agenturOverview.style.display = 'block';

    // Öffne den Agentur-Chat automatisch (Vertriebs-Assistent)
    const agenturChatWidget = document.getElementById('agenturChatWidget');
    const agenturChatToggle = document.getElementById('agenturChatToggle');

    if (agenturChatWidget) {
        agenturChatWidget.style.display = 'flex';
    }

    // Toggle Button ausblenden, da Chat bereits geöffnet ist
    if (agenturChatToggle) {
        agenturChatToggle.style.display = 'none';
    }

    // Lade und zeige Agentur-Daten
    loadAgenturData(vermittlerId);

    // Dispatch event for Page ID Tracker
    document.dispatchEvent(new CustomEvent('viewChanged', {
        detail: { module: 'versicherung', view: 'agentursicht' }
    }));

    // Update URL route
    if (window.AppRouter) AppRouter.navigate('/agentur');
}

/**
 * Lädt die Daten für eine bestimmte Agentur und füllt die UI
 * @param {string} vermittlerId - Die Vermittler-ID
 */
function loadAgenturData(vermittlerId) {
    console.log('Lade Daten für Agentur:', vermittlerId);

    // Speichere die aktuelle Agentur-ID für späteren Zugriff
    currentAgenturIdInOverview = vermittlerId;

    // Hole Agentur-Daten aus den bestehenden Funktionen
    const agenturen = typeof getAgenturen === 'function' ? getAgenturen() : [];
    const agentur = agenturen.find(a => a.id === vermittlerId);

    if (!agentur) {
        console.warn('Agentur nicht gefunden:', vermittlerId, '— View-Mode wird trotzdem angewendet');
        // Kein alert/backFromAgentur — MRH/B2B Modi haben eigene Mock-Daten
    } else {
        // Hole detaillierte Daten
        const agenturData = typeof getAgenturData === 'function' ? getAgenturData(vermittlerId) : null;

        console.log('Agentur gefunden:', agentur);
        console.log('Agentur Daten:', agenturData);

        // Fülle alle Bereiche
        fillHeader(agentur, agenturData);
        fillCockpitKPIs(agenturData);
        fillStammdaten(agentur, agenturData);
        fillNeugeschaeftTab(agenturData);
        fillBestandTab(agenturData);
        fillStornoTab(agenturData);
        fillProvisionTab(agenturData);
        fillQualitaetTab(agenturData);
    }

    // Zeige Übersicht-Tab als ersten Tab und wende View-Mode an
    if (typeof viewMode !== 'undefined') {
        applyViewMode();
    } else if (typeof maklerModus !== 'undefined' && maklerModus) {
        applyMaklerModus();
    } else {
        showAgenturTab('uebersicht');
    }

    // Dynamische Daten in der Übersicht setzen
    updateDynamicDates();
}

/**
 * Setzt alle Termine, Aufgaben- und Abschluss-Daten dynamisch relativ zu heute
 */
function updateDynamicDates() {
    var now = new Date();
    var tage = ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'];

    // Hilfsfunktion: Datum formatieren als "Mo, 13.01."
    function fmtTag(d) {
        return tage[d.getDay()] + ', ' + String(d.getDate()).padStart(2, '0') + '.' + String(d.getMonth() + 1).padStart(2, '0') + '.';
    }

    // Heute-Termin: aktuelle Uhrzeit + 2 Stunden
    var heuteZeit = document.getElementById('terminHeuteZeit');
    if (heuteZeit) {
        var plus2 = new Date(now.getTime() + 2 * 60 * 60 * 1000);
        heuteZeit.textContent = String(plus2.getHours()).padStart(2, '0') + ':' + String(Math.floor(plus2.getMinutes() / 15) * 15).padStart(2, '0');
    }

    // Aufgabe 1: Heute + Uhrzeit
    var aufgabeDue1 = document.getElementById('aufgabeDue1');
    if (aufgabeDue1 && heuteZeit) {
        aufgabeDue1.textContent = 'Heute, ' + (heuteZeit.textContent || '16:00');
    }

    // Termine Tag 1-3: morgen, übermorgen, +3 Tage
    for (var i = 1; i <= 3; i++) {
        var el = document.getElementById('terminTag' + i);
        if (el) {
            var d = new Date(now);
            d.setDate(d.getDate() + i);
            if (i === 1) {
                el.textContent = 'Morgen';
            } else {
                el.textContent = fmtTag(d);
            }
        }
    }

    // Abschlüsse: Heute, Gestern, vor 3 Tagen, vor 4 Tagen
    var abschlussOffsets = [0, -1, -3, -4];
    var abschlussLabels = ['Heute', 'Gestern', null, null];
    for (var j = 0; j < abschlussOffsets.length; j++) {
        var el2 = document.getElementById('abschlussDatum' + (j + 1));
        if (el2) {
            if (abschlussLabels[j]) {
                el2.textContent = abschlussLabels[j];
            } else {
                var d2 = new Date(now);
                d2.setDate(d2.getDate() + abschlussOffsets[j]);
                el2.textContent = fmtTag(d2);
            }
        }
    }

    // Letzte Aktion Zellen dynamisch befüllen (mit Jahreszahl)
    var letzteAktionCells = document.querySelectorAll('.letzte-aktion');
    letzteAktionCells.forEach(function(cell) {
        var action = cell.getAttribute('data-action');
        var daysAgo = parseInt(cell.getAttribute('data-days-ago'), 10);
        if (action === null || isNaN(daysAgo)) return;

        var actionDate = new Date(now);
        actionDate.setDate(actionDate.getDate() - daysAgo);

        var label;
        if (daysAgo === 0) {
            label = 'heute';
        } else if (daysAgo === 1) {
            label = 'gestern';
        } else {
            label = String(actionDate.getDate()).padStart(2, '0') + '.'
                  + String(actionDate.getMonth() + 1).padStart(2, '0') + '.'
                  + actionDate.getFullYear();
        }
        cell.textContent = action + ' (' + label + ')';
    });
}

/**
 * Tab-Wechsel Funktion
 */
function showAgenturTab(tabName) {
    // Nur A-02 Tabs deaktivieren (nicht A-10)
    const agenturHeader = document.querySelector('.agentur-page-new .agentur-header-tabs');
    if (agenturHeader) {
        agenturHeader.querySelectorAll('.agentur-tab').forEach(tab => tab.classList.remove('active'));
    }
    document.querySelectorAll('.agentur-tab-content').forEach(content => content.classList.remove('active'));
    // Also deactivate Makler tab content (avoid overlap)
    document.querySelectorAll('.makler-tab-content').forEach(content => content.classList.remove('active'));

    // Gewählten Tab aktivieren
    const tabButton = document.querySelector(`.agentur-tab[onclick="showAgenturTab('${tabName}')"]`);
    const tabContent = document.getElementById(`tab-${tabName}`);

    if (tabButton) tabButton.classList.add('active');
    if (tabContent) tabContent.classList.add('active');

    // Cockpit-KPIs (Gesamtbestand etc.) bei Potentiale-Tab ausblenden
    var cockpitKpis = document.querySelector('.cockpit-kpis:not(#maklerKpis)');
    if (cockpitKpis) {
        cockpitKpis.style.display = (tabName === 'potential') ? 'none' : '';
    }
}

/**
 * Füllt den Header mit Agentur-Info
 */
function fillHeader(agentur, agenturData) {
    const title = document.getElementById('agenturPageTitle');
    const idHeader = document.getElementById('agenturIdHeader');
    const statusHeader = document.getElementById('agenturStatusHeader');

    const displayName = (agentur.name || agentur.id).replace(/[""„"]/g, '');
    if (title) title.textContent = 'Agentur: ' + displayName;
    if (idHeader) idHeader.textContent = agentur.id;
    if (statusHeader) statusHeader.textContent = 'Aktiv';

    // Standard-Profilbild für Maria Musterfrau
    const defaultPhoto = 'assets/images/maria-musterfrau.png';

    // Restore photo container if B2B/MRH replaced it with an icon
    const photoContainer = document.getElementById('agenturPhotoSmall');
    if (photoContainer && photoContainer._origHTML) {
        photoContainer.innerHTML = photoContainer._origHTML;
    }

    // Lade Profilbild (gespeichert oder Standard)
    const savedPhoto = localStorage.getItem('agenturPhoto');
    const photoImgSmall = document.getElementById('agenturPhotoImgSmall');
    const placeholderSmall = document.querySelector('.agentur-photo-placeholder-small');

    const photoToUse = savedPhoto || defaultPhoto;

    if (photoImgSmall) {
        photoImgSmall.src = photoToUse;
        photoImgSmall.style.display = 'block';
        if (placeholderSmall) placeholderSmall.style.display = 'none';
    }
}

/**
 * Füllt die Cockpit-KPIs (Big Numbers)
 */
function fillCockpitKPIs(agenturData) {
    const bestand = agenturData?.bestand || 0;
    const neugeschaeft = agenturData?.neugeschaeft || 0;
    const storno = agenturData?.storno || 0;

    // Bestand
    const cockpitBestand = document.getElementById('cockpitBestand');
    const cockpitBestandTrend = document.getElementById('cockpitBestandTrend');
    if (cockpitBestand) cockpitBestand.textContent = formatCurrency(bestand);
    if (cockpitBestandTrend) {
        const trend = (Math.random() * 10 - 2).toFixed(1);
        cockpitBestandTrend.textContent = `${trend > 0 ? '+' : ''}${trend}%`;
        cockpitBestandTrend.className = `cockpit-kpi-trend ${parseFloat(trend) >= 0 ? 'positive' : 'negative'}`;
    }

    // Neugeschäft
    const cockpitNeugeschaeft = document.getElementById('cockpitNeugeschaeft');
    const cockpitNeugeschaeftTrend = document.getElementById('cockpitNeugeschaeftTrend');
    if (cockpitNeugeschaeft) cockpitNeugeschaeft.textContent = formatCurrency(neugeschaeft);
    if (cockpitNeugeschaeftTrend) {
        const trend = (Math.random() * 15 + 5).toFixed(1);
        cockpitNeugeschaeftTrend.textContent = `+${trend}%`;
        cockpitNeugeschaeftTrend.className = 'cockpit-kpi-trend positive';
    }

    // Storno
    const cockpitStorno = document.getElementById('cockpitStorno');
    const cockpitStornoTrend = document.getElementById('cockpitStornoTrend');
    if (cockpitStorno) cockpitStorno.textContent = `${storno.toFixed(1)}%`;
    if (cockpitStornoTrend) {
        const trend = (Math.random() * 2 - 1).toFixed(1);
        cockpitStornoTrend.textContent = `${trend > 0 ? '+' : ''}${trend}%`;
        cockpitStornoTrend.className = `cockpit-kpi-trend ${parseFloat(trend) <= 0 ? 'positive' : 'negative'}`;
    }

    // Zielerfüllung
    const zielerfuellung = Math.min(100, Math.floor(50 + Math.random() * 60));
    const cockpitZiel = document.getElementById('cockpitZiel');
    const cockpitZielGauge = document.getElementById('cockpitZielGauge');
    if (cockpitZiel) cockpitZiel.textContent = `${zielerfuellung}%`;
    if (cockpitZielGauge) {
        const gaugeFill = cockpitZielGauge.querySelector('.gauge-fill');
        if (gaugeFill) gaugeFill.style.width = `${zielerfuellung}%`;
    }
}

/**
 * Füllt die Stammdaten-Sektion
 */
function fillStammdaten(agentur, agenturData) {
    // Basis-Stammdaten
    setElementText('agenturId', agentur.id);
    setElementText('agenturName', agentur.name || '-');
    setElementText('agenturAdresse', generateAddress(agenturData?.bundesland || 'Deutschland'));
    setElementText('agenturTelefon', generatePhone());
    setElementText('agenturEmail', generateEmail(agentur.name));
    setElementText('agenturTyp', 'Einfirmenvertreter');
    setElementText('agenturEintritt', generateEintrittsdatum());

    // Organisatorische Einordnung
    setElementText('agenturHierarchie', 'OD Süd → RD Bayern → VD München');
    setElementText('agenturVorgesetzter', 'Thomas Schneider (VD)');
    setElementText('agenturRegion', agenturData?.bundesland || 'Bayern');
    setElementText('agenturSilo', agenturData?.silo || 'Ausschließlichkeit');
    setElementText('agenturStufe', calculateAgenturstufe(agenturData?.neugeschaeft || 0));

    // Qualifikation & Zulassung
    const ihkNr = 'D-' + Math.random().toString().substr(2, 8) + '-' + Math.floor(Math.random() * 99);
    setElementText('agenturIHK', ihkNr);
    setElementText('agenturVermittlerStatus', 'Gebundener Vermittler (§34d Abs. 7 GewO)');
    setElementText('agenturProduktfreigaben', 'Leben, Kranken, Schaden, Kfz');

    const weiterbildung = document.getElementById('agenturWeiterbildung');
    if (weiterbildung) {
        const hours = Math.floor(Math.random() * 6) + 12;
        weiterbildung.textContent = hours >= 15 ? 'Erfüllt' : `${hours}/15h`;
        weiterbildung.className = `stammdaten-value status-badge ${hours >= 15 ? 'active' : 'warning'}`;
    }

    // Vertragliche Rahmendaten
    setElementText('agenturProvModell', 'Staffelprovision (5-12%)');
    setElementText('agenturBonus', 'Jahresbonus 2025 aktiv');
    setElementText('agenturStornohaftung', '60 Monate (Leben), 36 Monate (Sach)');
    setElementText('agenturExklusiv', '100% Exklusiv');
}

/**
 * Füllt den Neugeschäft-Tab
 */
function fillNeugeschaeftTab(agenturData) {
    const ng = agenturData?.neugeschaeft || 0;
    const antraege = Math.floor(ng / 5000) + Math.floor(Math.random() * 20);
    const policiert = Math.floor(antraege * (0.75 + Math.random() * 0.2));
    const abschlussquote = antraege > 0 ? (policiert / antraege * 100) : 0;
    const durchschnitt = policiert > 0 ? ng / policiert : 0;
    const crossSelling = 20 + Math.floor(Math.random() * 30);

    setElementText('ngAntraege', antraege.toLocaleString('de-DE'));
    setElementText('ngPoliciert', formatCurrency(ng));
    setElementText('ngAPE', formatCurrency(ng * 0.8));
    setElementText('ngAbschlussquote', `${abschlussquote.toFixed(1)}%`);
    setElementText('ngDurchschnitt', formatCurrency(durchschnitt));
    setElementText('ngCrossSelling', `${crossSelling}%`);

    // Spartenverteilung
    const spartenContainer = document.getElementById('spartenNeugeschaeft');
    if (spartenContainer) {
        const sparten = [
            { name: 'Leben', value: 35 + Math.random() * 15, class: 'leben' },
            { name: 'Kranken', value: 20 + Math.random() * 10, class: 'kranken' },
            { name: 'Schaden', value: 25 + Math.random() * 10, class: 'schaden' },
            { name: 'Kfz', value: 10 + Math.random() * 10, class: 'kfz' }
        ];

        spartenContainer.innerHTML = sparten.map(s => `
            <div class="sparten-bar-item">
                <div class="sparten-bar-label">${s.name}</div>
                <div class="sparten-bar-track">
                    <div class="sparten-bar-fill ${s.class}" style="width: ${s.value}%">${s.value.toFixed(0)}%</div>
                </div>
            </div>
        `).join('');
    }
}

/**
 * Füllt den Bestand-Tab
 */
function fillBestandTab(agenturData) {
    const bestand = agenturData?.bestand || 0;
    const vertraege = Math.floor(bestand / 2000) + Math.floor(Math.random() * 100);
    const kunden = Math.floor(vertraege / 2.3);
    const dichte = vertraege > 0 && kunden > 0 ? (vertraege / kunden).toFixed(1) : '0';
    const wachstum = (Math.random() * 15 - 3).toFixed(1);

    setElementText('bestandGWP', formatCurrency(bestand));
    setElementText('bestandVertraege', vertraege.toLocaleString('de-DE'));
    setElementText('bestandWachstum', `${wachstum > 0 ? '+' : ''}${wachstum}%`);
    setElementText('bestandKunden', kunden.toLocaleString('de-DE'));
    setElementText('bestandDichte', dichte);
}

/**
 * Füllt den Storno-Tab
 */
function fillStornoTab(agenturData) {
    const stornoGesamt = agenturData?.storno || 8;
    const stornoFrueh = (stornoGesamt * 0.4).toFixed(1);
    const stornoSpaet = (stornoGesamt * 0.6).toFixed(1);
    const nettoEntwicklung = (agenturData?.neugeschaeft || 0) - ((agenturData?.bestand || 0) * stornoGesamt / 100);

    setElementText('stornoFrueh', `${stornoFrueh}%`);
    setElementText('stornoSpaet', `${stornoSpaet}%`);
    setElementText('stornoNetto', formatCurrency(nettoEntwicklung));

    // Storno-Gründe
    const gruendeContainer = document.getElementById('stornoGruende');
    if (gruendeContainer) {
        const gruende = [
            { name: 'Preis / zu teuer', count: Math.floor(Math.random() * 30) + 20 },
            { name: 'Wettbewerber', count: Math.floor(Math.random() * 20) + 15 },
            { name: 'Leistung nicht zufrieden', count: Math.floor(Math.random() * 15) + 10 },
            { name: 'Finanzielle Gründe', count: Math.floor(Math.random() * 15) + 8 },
            { name: 'Kein Bedarf mehr', count: Math.floor(Math.random() * 10) + 5 }
        ];

        gruendeContainer.innerHTML = gruende.map(g => `
            <div class="storno-reason-item">
                <span class="storno-reason-name">${g.name}</span>
                <span class="storno-reason-count">${g.count}</span>
            </div>
        `).join('');
    }
}

/**
 * Füllt den Vergütungs-Tab
 */
function fillProvisionTab(agenturData) {
    const ng = agenturData?.neugeschaeft || 0;
    const provision = ng * 0.08; // 8% Provision
    const haftung = ng * 0.02; // 2% Haftung
    const bonus = Math.floor(40 + Math.random() * 50);
    const deckung = agenturData?.deckungsbeitrag || ng * 0.15;

    setElementText('provAnspruch', formatCurrency(provision));
    setElementText('provHaftung', formatCurrency(haftung));
    setElementText('provBonus', `${bonus}%`);
    setElementText('provDeckung', formatCurrency(deckung));
}

/**
 * Füllt den Qualitäts-Tab
 */
function fillQualitaetTab(agenturData) {
    const nps = agenturData?.nps || 42;
    const beschwerden = (Math.random() * 3).toFixed(1);
    const doku = Math.floor(85 + Math.random() * 13);
    const underwriting = agenturData?.underwriting || 86;

    setElementText('qualNPS', nps.toFixed(0));
    setElementText('qualBeschwerden', beschwerden);

    const iddElement = document.getElementById('qualIDD');
    if (iddElement) {
        iddElement.textContent = 'Konform';
        iddElement.className = 'kpi-detail-value status-badge active';
    }

    const schulung = Math.floor(12 + Math.random() * 5);
    setElementText('qualSchulung', `${schulung}/15h`);
    setElementText('qualDoku', `${doku}%`);
    setElementText('qualUnderwriting', `${underwriting.toFixed(0)}%`);
}

/**
 * Hilfs-Funktionen
 */

function setElementText(id, text) {
    const el = document.getElementById(id);
    if (el) el.textContent = text;
}

function formatCurrency(value) {
    if (value >= 1000000) {
        return `€${(value / 1000000).toFixed(2)} Mio`;
    } else if (value >= 1000) {
        return `€${(value / 1000).toFixed(0)}k`;
    }
    return `€${value.toFixed(0)}`;
}

function calculateAgenturstufe(neugeschaeft) {
    if (neugeschaeft >= 5000000) return 'Gold Plus';
    if (neugeschaeft >= 3000000) return 'Gold';
    if (neugeschaeft >= 2000000) return 'Silber Plus';
    if (neugeschaeft >= 1000000) return 'Silber';
    return 'Bronze';
}

function generateAddress(bundesland) {
    const addresses = {
        'Baden-Württemberg': 'Hauptstraße 42, 79098 Freiburg',
        'Bayern': 'Marienplatz 8, 80331 München',
        'Berlin': 'Unter den Linden 5, 10117 Berlin',
        'Hamburg': 'Reeperbahn 1, 20359 Hamburg',
        'Nordrhein-Westfalen': 'Königsallee 60, 40212 Düsseldorf',
        'Hessen': 'Zeil 106, 60313 Frankfurt am Main',
        'Sachsen': 'Prager Straße 12, 01069 Dresden',
        'Niedersachsen': 'Georgstraße 36, 30159 Hannover'
    };

    return addresses[bundesland] || 'Hauptstraße 1, 10115 Berlin';
}

function generatePhone() {
    const prefix = ['089', '030', '040', '069', '0211', '0221'];
    return `${prefix[Math.floor(Math.random() * prefix.length)]} ${Math.floor(Math.random() * 9000000 + 1000000)}`;
}

function generateEmail(name) {
    if (!name) return 'kontakt@agentur.de';
    const cleanName = name.toLowerCase().replace(/\s+/g, '.').replace(/[äöü]/g, c => ({ 'ä': 'ae', 'ö': 'oe', 'ü': 'ue' })[c] || c);
    return `${cleanName}@versicherung.de`;
}

function generateEintrittsdatum() {
    const yearsAgo = Math.floor(Math.random() * 15) + 1;
    const date = new Date();
    date.setFullYear(date.getFullYear() - yearsAgo);
    return date.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

/**
 * Navigation Functions
 */

function backFromAgentur() {
    console.log('Zurück vom Agentur-Overview');

    const landingPage = document.getElementById('landingPage');
    const agenturOverview = document.getElementById('agenturOverview');

    if (landingPage) landingPage.style.display = 'flex';
    if (agenturOverview) agenturOverview.style.display = 'none';

    // Verstecke den Agentur-Chat
    hideAgenturChat();

    // Dispatch event for Page ID Tracker
    document.dispatchEvent(new CustomEvent('viewChanged', {
        detail: { module: 'versicherung', view: 'landing' }
    }));

    // Update URL route
    if (window.AppRouter) AppRouter.navigate('/landing');
}

// ========================================
// BILLING CHECK FUNCTIONS
// ========================================

function openBillingCheck() {
    console.log('Öffne Billing Check');

    const landingPage = document.getElementById('landingPage');
    const mainApp = document.getElementById('mainApp');
    const agenturOverview = document.getElementById('agenturOverview');
    const billingCheckPage = document.getElementById('billingCheckPage');

    if (landingPage) landingPage.style.display = 'none';
    if (mainApp) mainApp.style.display = 'none';
    if (agenturOverview) agenturOverview.style.display = 'none';
    if (billingCheckPage) billingCheckPage.style.display = 'block';

    // Verstecke den Agentur-Chat-Toggle
    hideAgenturChat();
}

function closeBillingCheck() {
    console.log('Schließe Billing Check');

    const landingPage = document.getElementById('landingPage');
    const billingCheckPage = document.getElementById('billingCheckPage');

    if (landingPage) landingPage.style.display = 'flex';
    if (billingCheckPage) billingCheckPage.style.display = 'none';
}

// ========================================
// FIDA POTENTIALE FUNCTIONS
// ========================================

/**
 * Filtert die FIDA-Fälle Tabelle nach Status
 * @param {string} status - Filter-Status (alle, neu, angeschrieben, termin, abgeschlossen)
 */
function filterFidaCases(status) {
    console.log('Filtere FIDA-Fälle nach:', status);

    // Update active filter button
    document.querySelectorAll('.fida-filter-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    const activeBtn = document.querySelector(`.fida-filter-btn[onclick="filterFidaCases('${status}')"]`);
    if (activeBtn) {
        activeBtn.classList.add('active');
    }

    // Filter table rows
    const tableBody = document.getElementById('fidaCasesTableBody');
    if (!tableBody) return;

    const rows = tableBody.querySelectorAll('tr');
    rows.forEach(row => {
        const rowStatus = row.getAttribute('data-status');
        if (status === 'alle' || rowStatus === status) {
            row.style.display = '';
        } else {
            row.style.display = 'none';
        }
    });
}

/**
 * Mapping von Kunden-IDs zu Kundennamen
 */
const kundenMapping = {
    'KD00001': 'Peter Schmidt',
    'KD00002': 'Amira König',
    'KD00003': 'Thomas Weber',
    'KD00004': 'Maria Schneider',
    'KD00005': 'Andreas Müller',
    'KD00006': 'Julia Fischer',
    'KD00007': 'Michael Bauer',
    'KD00008': 'Lisa Wagner',
    'KD00009': 'Stefan Hoffmann',
    'KD00010': 'Claudia Richter'
};

/**
 * Öffnet die Kundendetailansicht für einen Kunden
 * @param {string} kundenId - Die Kunden-ID (z.B. 'KD00001')
 */
function openKundenDetailFromFida(kundenId) {
    console.log('Öffne Kundendetail von FIDA für:', kundenId);

    // Hole Kundennamen aus Mapping
    const kundenName = kundenMapping[kundenId] || kundenId;

    // Wenn openKundenDetail existiert, nutze sie mit korrekten Parametern
    if (typeof window.openKundenDetail === 'function') {
        window.openKundenDetail(kundenName, kundenId);
    } else {
        console.log('openKundenDetail Funktion nicht gefunden');
    }
}

/**
 * Expandiert/Kollabiert die Vertriebspotentiale-Details
 * @param {HTMLElement} item - Das Potential-Item Element
 */
function togglePotentialDetails(item) {
    const details = item.querySelector('.potential-details');
    const isExpanded = item.classList.contains('expanded');

    // Alle anderen schließen
    document.querySelectorAll('.potential-item.expanded').forEach(el => {
        if (el !== item) {
            el.classList.remove('expanded');
            el.querySelector('.potential-details').style.display = 'none';
        }
    });

    // Toggle current
    if (isExpanded) {
        item.classList.remove('expanded');
        details.style.display = 'none';
    } else {
        item.classList.add('expanded');
        details.style.display = 'block';
    }
}

/**
 * Wechselt die Periode für Vertriebskennzahlen
 * @param {string} period - 'week' oder 'month'
 */
function toggleVertriebsPeriod(period) {
    const buttons = document.querySelectorAll('.period-btn');
    buttons.forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');

    const kennzahlenContainer = document.getElementById('vertriebsKennzahlen');

    if (period === 'week') {
        kennzahlenContainer.innerHTML = `
            <div class="kennzahl-item">
                <div class="kennzahl-value">12</div>
                <div class="kennzahl-label">Abschlüsse</div>
                <div class="kennzahl-trend positive">+3 vs. Vorwoche</div>
            </div>
            <div class="kennzahl-item">
                <div class="kennzahl-value">€18.450</div>
                <div class="kennzahl-label">Neugeschäft</div>
                <div class="kennzahl-trend positive">+12%</div>
            </div>
            <div class="kennzahl-item">
                <div class="kennzahl-value">28</div>
                <div class="kennzahl-label">Termine</div>
                <div class="kennzahl-trend neutral">±0</div>
            </div>
            <div class="kennzahl-item">
                <div class="kennzahl-value">68%</div>
                <div class="kennzahl-label">Abschlussquote</div>
                <div class="kennzahl-trend positive">+5%</div>
            </div>
        `;
    } else {
        kennzahlenContainer.innerHTML = `
            <div class="kennzahl-item">
                <div class="kennzahl-value">47</div>
                <div class="kennzahl-label">Abschlüsse</div>
                <div class="kennzahl-trend positive">+8 vs. Vormonat</div>
            </div>
            <div class="kennzahl-item">
                <div class="kennzahl-value">€72.340</div>
                <div class="kennzahl-label">Neugeschäft</div>
                <div class="kennzahl-trend positive">+18%</div>
            </div>
            <div class="kennzahl-item">
                <div class="kennzahl-value">112</div>
                <div class="kennzahl-label">Termine</div>
                <div class="kennzahl-trend positive">+12</div>
            </div>
            <div class="kennzahl-item">
                <div class="kennzahl-value">71%</div>
                <div class="kennzahl-label">Abschlussquote</div>
                <div class="kennzahl-trend positive">+3%</div>
            </div>
        `;
    }
}

/**
 * Öffnet ein Formular (Placeholder)
 * @param {string} formularId - Die ID des Formulars
 */
function openFormular(formularId) {
    console.log('Öffne Formular:', formularId);
    alert('Formular "' + formularId + '" wird geladen...\n\n(Demo-Funktion)');
}

/**
 * Öffnet eine Provisionsabrechnung (PDF)
 * @param {string} period - Der Abrechnungszeitraum (z.B. '2024-12')
 */
function openAbrechnung(period) {
    console.log('Öffne Provisionsabrechnung:', period);
    const [year, month] = period.split('-');
    const monthNames = ['Januar', 'Februar', 'März', 'April', 'Mai', 'Juni',
                       'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'];
    const monthName = monthNames[parseInt(month) - 1];
    alert(`Provisionsabrechnung ${monthName} ${year}\n\nDas PDF wird heruntergeladen...\n\n(Demo-Funktion)`);
}

/**
 * Sendet eine Frage an den Agentur-Chat
 */
function sendAgenturChat() {
    const input = document.getElementById('agenturChatInput');
    const chatBody = document.getElementById('agenturChatBody');
    const question = input.value.trim();

    if (!question) return;

    // Clear welcome message
    const welcome = chatBody.querySelector('.agentur-chat-welcome');
    if (welcome) welcome.style.display = 'none';

    // Add user message
    chatBody.innerHTML += `
        <div class="chat-message user-message">
            <div class="message-content">${question}</div>
        </div>
    `;

    input.value = '';

    // Simulate AI response
    setTimeout(() => {
        const response = getAgenturChatResponse(question);
        chatBody.innerHTML += `
            <div class="chat-message ai-message">
                <div class="message-content">${response}</div>
            </div>
        `;
        chatBody.scrollTop = chatBody.scrollHeight;
    }, 800);
}

/**
 * Stellt eine vordefinierte Frage an den Agentur-Chat
 * @param {string} question - Die vordefinierte Frage
 */
function askAgenturQuestion(question) {
    const input = document.getElementById('agenturChatInput');
    input.value = question;
    sendAgenturChat();
}

/**
 * Generiert eine Chat-Antwort basierend auf der Frage
 * @param {string} question - Die Frage
 * @returns {string} - Die Antwort
 */
function getAgenturChatResponse(question) {
    const q = question.toLowerCase();
    const isMRH = typeof viewMode !== 'undefined' && viewMode === 'mrh';
    const isMakler = isMRH ? false : (typeof maklerModus !== 'undefined' && maklerModus);

    // Dynamische Datums-Helper
    const getDynamicDate = (daysFromNow) => {
        if (window.demoDates && window.demoDates.formatDate) {
            return window.demoDates.formatDate(window.demoDates.addDays(daysFromNow));
        }
        const date = new Date();
        date.setDate(date.getDate() + daysFromNow);
        return date.toLocaleDateString('de-DE');
    };

    // Kunden-Button Helper mit optionaler Tab/Vertrag-Navigation
    const customerBtn = (name, id, tab, contractType) => {
        if (isMakler) {
            return `<button class="chat-customer-btn" onclick="openMaklerKundenDetail('${id}')">${name}</button>`;
        }
        const params = tab
            ? `'${id}', '${tab}', '${contractType || ''}'`
            : `'${id}'`;
        return `<button class="chat-customer-btn" onclick="openKundenDetailFromChat(${params})">${name}</button>`;
    };

    // Vertrag-Badge Helper (Wettbewerber vs. Eigener Vertrag)
    const vertragBadge = (isExtern) => {
        return `<span class="chat-vertrag-badge ${isExtern ? 'extern' : 'eigen'}">${isExtern ? 'Wettbewerber' : 'Eigener Vertrag'}</span>`;
    };

    // Follow-up Vorschläge
    const followUpSuggestions = isMakler ? `
        <div class="chat-followup-suggestions">
            <button onclick="askAgenturQuestion('Welche Renewals stehen in den nächsten 90 Tagen an?')">Anstehende Renewals?</button>
            <button onclick="askAgenturQuestion('Welche Kunden haben Deckungslücken?')">Deckungslücken?</button>
            <button onclick="showNeuePotentiale()">Neue Potentiale?</button>
            <button onclick="askAgenturQuestion('Wie ist die aktuelle Schadenquote?')">Schadenquote?</button>
        </div>` : `
        <div class="chat-followup-suggestions">
            <button onclick="askAgenturQuestion('Welche Verträge laufen in den nächsten 30 Tagen aus?')">Welche Verträge laufen bald aus?</button>
            <button onclick="askAgenturQuestion('Welche Kunden haben Cross-Selling-Potential?')">Wer hat Cross-Selling-Potential?</button>
            <button onclick="showNeuePotentiale()">Neue Potentiale?</button>
            <button onclick="goToSalesReport()">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14" style="vertical-align: middle; margin-right: 4px;">
                    <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"></path>
                    <polyline points="14 2 14 8 20 8"></polyline>
                </svg>
                Vertriebsbericht
            </button>
        </div>`;

    // ========== MRH TROWE 360° RESPONSES ==========
    if (isMRH) {
        const mrhFollowUp = `
            <div class="chat-followup-suggestions">
                <button onclick="askAgenturQuestion('Welche Kunden haben Potential für bAV?')">bAV-Potential?</button>
                <button onclick="askAgenturQuestion('Welche Renewals stehen im Q2 an?')">Q2 Renewals?</button>
                <button onclick="askAgenturQuestion('Was unterscheidet uns von Ecclesia?')">Ecclesia vs. MRH?</button>
                <button onclick="askAgenturQuestion('Wie ist die Cross-Sell-Pipeline?')">Cross-Sell?</button>
            </div>`;

        const mrhCustomerBtn = (name, id) => `<button class="chat-customer-btn" onclick="openMRHKundenDetail('${id}')">${name}</button>`;

        // bAV / Benefits
        if (q.includes('bav') || q.includes('benefit') || q.includes('potential für bav') || q.includes('pension')) {
            return `<strong>bAV-Potentiale (Insurance → Benefits):</strong><br><br>
            B2B-Kunden mit >100 MA ohne Benefits-Mandat:<br><br>
            <div class="chat-customer-item">
                ${mrhCustomerBtn('Rhein-Main Maschinenbau', 'MRH-001')} 340 MA, Prämie 420k, kein bAV<br>
                <span class="chat-recommendation">Geschätztes Potential: 85k bAV-Volumen/Jahr — Steuerberater-Lösung ablösen</span>
            </div>
            <div class="chat-customer-item">
                ${mrhCustomerBtn('Hessenlog Spedition', 'MRH-005')} 210 MA, kein bAV<br>
                <span class="chat-recommendation">Einfaches Modell als Bindungsinstrument gegen Fluktuation</span>
            </div>
            <br>Aktuelle Durchdringung: <strong>38%</strong> (Ziel: 55%)
            ${mrhFollowUp}`;
        }

        // Renewals
        if (q.includes('renewal') || q.includes('q2') || q.includes('ablaufend') || q.includes('vertrag') && q.includes('lauf') || q.includes('30 tag') || q.includes('auslauf') || q.includes('frist')) {
            return `<strong>Anstehende Renewals (Niederlassung Rhein-Main):</strong><br><br>
            <strong>Handlungsbedarf:</strong><br><br>
            <div class="chat-customer-item">
                ${mrhCustomerBtn('Rhein-Main Maschinenbau', 'MRH-001')} Betriebshaftpflicht — 01.04.2026<br>
                <span class="chat-recommendation">420k Prämie — Allianz hat 15% Erhöhung angekündigt</span>
            </div>
            <div class="chat-customer-item">
                ${mrhCustomerBtn('Rhein-Main Verkehr', 'MRH-015')} Flotte + BH ÖPNV — 01.07.2026<br>
                <span class="chat-recommendation">1,45 Mio. Prämie — größtes Renewal des Halbjahres</span>
            </div>
            ${mrhFollowUp}`;
        }

        // Cross-Sell
        if (q.includes('cross-sell') || q.includes('cross sell') || q.includes('pipeline')) {
            return `<strong>Cross-Sell-Pipeline (3 Säulen):</strong><br><br>
            <strong>Insurance → Benefits:</strong> 3 Kunden mit >100 MA ohne bAV<br>
            <strong>Insurance → Finance:</strong> DigiCore SaaS-Kreditversicherung in Prüfung<br>
            <strong>Finance → Insurance:</strong> CNC-Leasing 1,4 Mio. ohne technische Versicherung<br><br>
            Geschätztes Gesamtpotential: <strong>~450k €/a</strong>
            ${mrhFollowUp}`;
        }

        // Ecclesia vs Gewerbemakler
        if (q.includes('ecclesia') || q.includes('unterschied') || q.includes('vergleich')) {
            return `<strong>Gewerbemakler vs. Ecclesia — Kernunterschiede:</strong><br><br>
            <strong>Kundenbasis:</strong> Gewerbemakler bedient B2B + gehobene Privatkunden (500–2.000 Kunden, 20+ Specialties), Ecclesia nur B2B (80–250 Institutionen, 5 Segmente)<br><br>
            <strong>Schwerpunkte:</strong> Gewerbemakler branchenübergreifend (Industrie, Real Estate, Mobilität), Ecclesia fokussiert auf Sozialwirtschaft und Kirche<br><br>
            <strong>Eigentümerstruktur:</strong> PE-gestützt vs. kirchlich-ökumenisch
            ${mrhFollowUp}`;
        }

        // Specialty / Autohaus / Deckung
        if (q.includes('autohaus') || q.includes('kfz') || q.includes('deckung') && q.includes('typisch')) {
            return `<strong>Specialty-Wissen: Autohaus / Kfz-Motor</strong><br><br>
            Typische Deckungen für Autohäuser:<br>
            • Kfz-Handel inkl. Probefahrtrisiko<br>
            • Vorführwagen-Flotte<br>
            • Werkstatt-Inhaltsversicherung<br>
            • Transportversicherung Neuwagen<br>
            • GAP-Versicherung Leasingrückläufer<br>
            • Cyber (Kundendaten, DMS)<br><br>
            <div class="chat-customer-item">
                ${mrhCustomerBtn('AutoZentrum Rhein-Main', 'MRH-004')} Prämie 310k, 14 Verträge<br>
                <span class="chat-recommendation">GAP-Versicherung fehlt — Deckungslücke</span>
            </div>
            ${mrhFollowUp}`;
        }

        // W&I
        if (q.includes('w&i') || q.includes('warranty') || q.includes('m&a') || q.includes('deal')) {
            return `<strong>W&I-Policen (Warranty & Indemnity):</strong><br><br>
            Pricing-Logik: ca. <strong>1–1,5%</strong> der Deckungssumme<br><br>
            <div class="chat-customer-item">
                ${mrhCustomerBtn('Alphatech Holding', 'MRH-014')} 3 abgeschlossene W&I-Policen<br>
                <span class="chat-recommendation">Buy-Side 8 Mio. + 5 Mio., Sell-Side 12 Mio. — über MRH Specialty M&A</span>
            </div>
            ${mrhFollowUp}`;
        }

        // Bestand / Portfolio
        if (q.includes('kredit') || q.includes('finance') || q.includes('bestand')) {
            return `<strong>Bestandsübersicht Niederlassung Rhein-Main:</strong><br><br>
            Gesamtbestand: <strong>42,3 Mio. €</strong> (+6,1% YoY)<br><br>
            <strong>Top-Kunden:</strong><br>
            ${mrhCustomerBtn('Nordpark Projektentwicklung', 'MRH-003')} 680.000 € Prämie<br>
            ${mrhCustomerBtn('Rhein-Main Maschinenbau', 'MRH-001')} 420.000 € Prämie<br>
            ${mrhCustomerBtn('Rhein-Main Verkehr', 'MRH-009')} 380.000 € Prämie
            ${mrhFollowUp}`;
        }

        // Fallback MRH
        return `Ich kann Ihnen als Gewerbemakler 360°-Assistent bei folgenden Themen helfen:
            <br>• Kundenübersicht und Bestandsanalysen
            <br>• Renewal-Management und Fristen
            <br>• Deckungslücken und Potentiale
            <br>• Schadenquoten und Risikobewertung
            ${mrhFollowUp}`;
    }

    // ========== MAKLER B2B RESPONSES ==========
    if (isMakler) {
        // Renewals
        if (q.includes('renewal') || q.includes('ablaufend') || q.includes('vertrag') && q.includes('lauf') || q.includes('30 tag')) {
            return `<strong>Anstehende Renewals (nächste 90 Tage):</strong><br><br>
            <strong>Kritisch (≤30 Tage):</strong><br><br>
            <div class="chat-customer-item">
                ${customerBtn('Klinikum Lippetal', 'MK-GW-001')} Cyberversicherung (Hiscox) – 31.03.2026<br>
                <span class="chat-recommendation">45.000 € Prämie – Erneuerung dringend einleiten</span>
            </div>
            <strong>Bald fällig (31-90 Tage):</strong><br><br>
            <div class="chat-customer-item">
                ${customerBtn('Kirchenkreis Auental', 'MK-KI-003')} Gebäude-Rahmenvertrag – 01.04.2026<br>
                <span class="chat-recommendation">620.000 € Gesamtprämie – Verhandlungen vorbereiten</span>
            </div>
            <div class="chat-customer-item">
                ${customerBtn('Lippeland Fracht', 'MK-TL-003')} 3 Verträge – 01.04.2026<br>
                <span class="chat-recommendation">190.000 € Prämie – Bündelung prüfen</span>
            </div>
            ${followUpSuggestions}`;
        }

        // Deckungslücken
        if (q.includes('deckungslücke') || q.includes('deckungsluecke') || q.includes('lücke')) {
            return `<strong>Deckungslücken-Analyse:</strong><br><br>
            <strong>5 Kunden</strong> mit hoher Priorität:<br><br>
            <div class="chat-customer-item">
                ${customerBtn('Klinikum Lippetal', 'MK-GW-001')} 5 Deckungslücken<br>
                <span class="chat-recommendation">Umwelthaftpflicht & Maschinenbruch fehlen – hohe Priorität</span>
            </div>
            <div class="chat-customer-item">
                ${customerBtn('Reha-Klinik Teutoburg', 'MK-GW-002')} 2 Deckungslücken<br>
                <span class="chat-recommendation">Cyberversicherung & D&O fehlen komplett</span>
            </div>
            <div class="chat-customer-item">
                ${customerBtn('Ev. Landeskirche Teutoburg', 'MK-KI-001')} 2 Deckungslücken<br>
                <span class="chat-recommendation">Cyber nur teilweise, Missbrauchsprävention in Prüfung</span>
            </div>
            <br>Geschätztes Neugeschäft: <strong>~850.000 € p.a.</strong>
            ${followUpSuggestions}`;
        }

        // Cross-Selling / Potential
        if (q.includes('cross-selling') || q.includes('potential')) {
            return `<strong>Cross-Selling Potentiale B2B:</strong><br><br>
            <strong>Top 3 nach Prämienvolumen:</strong><br><br>
            <div class="chat-customer-item">
                ${customerBtn('Ev. Landeskirche Teutoburg', 'MK-KI-001')} Cyber-Rahmenvertrag<br>
                <span class="chat-recommendation">1.900 Kirchengemeinden – geschätzt 1,0 Mio. € Prämie</span>
            </div>
            <div class="chat-customer-item">
                ${customerBtn('Nordlicht Automatisierung', 'MK-IG-002')} Erweiterte Produkthaftpflicht<br>
                <span class="chat-recommendation">Internationale Produktrückruf-Absicherung – ~570.000 € p.a.</span>
            </div>
            <div class="chat-customer-item">
                ${customerBtn('Klinikum Lippetal', 'MK-GW-001')} Umwelthaftpflicht + Maschinenbruch<br>
                <span class="chat-recommendation">Med. Großgeräte & Labor – ~190.000 € p.a.</span>
            </div>
            <br>Gesamtpotential: <strong>~1,8 Mio. € p.a.</strong>
            ${followUpSuggestions}`;
        }

        // Schadenquote
        if (q.includes('schadenquote') || q.includes('schaden') || q.includes('quote')) {
            return `<strong>Schadenquoten-Übersicht:</strong><br><br>
            <strong>Portfolio gesamt:</strong> 62% (Ziel: <65%)<br>
            <strong>Vorjahr:</strong> 58%<br><br>
            <strong>Auffällige Kunden:</strong><br><br>
            <div class="chat-customer-item">
                ${customerBtn('Weserland Spedition', 'MK-TL-002')} Schadenquote <strong>62%</strong><br>
                <span class="chat-recommendation">Kfz-Flotte auffällig – Schadenmanagement-Gespräch empfohlen</span>
            </div>
            <div class="chat-customer-item">
                ${customerBtn('Klinikum Lippetal', 'MK-GW-001')} Schadenquote <strong>58%</strong><br>
                <span class="chat-recommendation">Arzthaftpflicht-Schäden steigend – Trend beobachten</span>
            </div>
            <div class="chat-customer-item">
                ${customerBtn('Teutoburger Maschinenbau', 'MK-IG-003')} Schadenquote <strong>55%</strong><br>
                <span class="chat-recommendation">Betriebsunterbrechung – Prävention besprechen</span>
            </div>
            ${followUpSuggestions}`;
        }

        // Fallback B2B
        return `Ich kann Ihnen bei folgenden Themen helfen:
            ${followUpSuggestions}`;
    }

    // ========== AO PRIVATKUNDE RESPONSES ==========

    // Ablaufende Verträge - ECHTE Daten aus der Datenbank!
    if (q.includes('ablaufend') || q.includes('30 tag') || q.includes('vertrag') && q.includes('lauf')) {
        return `<strong>Ablaufende Verträge (nächste 60 Tage):</strong><br><br>
        <strong>1 Eigener Vertrag</strong> zur Verlängerung:<br><br>
        <div class="chat-customer-item">
            ${customerBtn('Amira König', 'KD00002', 'vertraege', 'leben')} Risikoleben bei <strong>ERGO</strong> (${getDynamicDate(21)})<br>
            ${vertragBadge(false)}
            <span class="chat-recommendation">Vertragsverlängerung vorbereiten – Beitragsanpassung +3.2% kommunizieren</span>
        </div>
        <strong>2 Wettbewerber-Verträge</strong> mit Wechselpotential:<br><br>
        <div class="chat-customer-item">
            ${customerBtn('Peter Schmidt', 'KD00001', 'fida', 'kfz')} Kfz-Versicherung bei <strong>Allianz</strong> (${getDynamicDate(45)})<br>
            ${vertragBadge(true)}
            <span class="chat-recommendation">SF-Klasse 12, €720/Jahr – Wechselangebot mit €180 Ersparnis möglich</span>
        </div>
        <div class="chat-customer-item">
            ${customerBtn('Peter Schmidt', 'KD00001', 'fida', 'hausrat')} Hausratversicherung bei <strong>HUK24</strong> (${getDynamicDate(60)})<br>
            ${vertragBadge(true)}
            <span class="chat-recommendation">Standard-Tarif €142/Jahr – Premium-Upgrade empfohlen</span>
        </div>
        ${followUpSuggestions}`;
    }

    // Cross-Selling LV - basierend auf echten Kundendaten
    if (q.includes('cross-selling') || q.includes('lebensversicherung') || q.includes('potential')) {
        return `<strong>Cross-Selling-Potential Lebensversicherung:</strong><br><br>
        <strong>2 Kunden</strong> ohne LV-Absicherung trotz Bedarf:<br><br>
        <div class="chat-customer-item">
            ${customerBtn('Peter Schmidt', 'KD00001', 'stammdaten', '')} (45 J.) – BU vorhanden, keine Risikoleben<br>
            ${vertragBadge(false)}
            <span class="chat-recommendation">Baufinanzierung €285.000 – Absicherung dringend empfohlen</span>
        </div>
        <div class="chat-customer-item">
            ${customerBtn('Amira König', 'KD00002', 'stammdaten', '')} (38 J.) – 2 Kinder, selbstständig<br>
            <span class="chat-recommendation">Geschätzte Prämie: €1.200/Jahr</span>
        </div>
        <br>Gesamtpotential: <strong>€3.000/Jahr</strong>
        ${followUpSuggestions}`;
    }

    // FIDA-Fälle
    if (q.includes('fida')) {
        return `<strong>FIDA-Fälle diese Woche:</strong><br><br>
        <strong>2 offene Anfragen</strong> mit Frist:<br><br>
        <div class="chat-customer-item">
            <strong>Allianz Anfrage</strong> – ${customerBtn('Peter Schmidt', 'KD00001', 'fida', '')}<br>
            <span class="chat-recommendation">Frist: ${getDynamicDate(3)} | Status: In Bearbeitung</span>
        </div>
        <div class="chat-customer-item">
            <strong>AXA Anfrage</strong> – ${customerBtn('Thomas Weber', 'KD00003', 'fida', '')}<br>
            <span class="chat-recommendation">Frist: ${getDynamicDate(5)} | Status: Neu</span>
        </div>
        <br>Empfehlung: AXA-Anfrage priorisieren
        ${followUpSuggestions}`;
    }

    // Abschlussquote
    if (q.includes('abschlussquote') || q.includes('vergleich') || q.includes('quote')) {
        return `<strong>Abschlussquote im Vergleich:</strong><br><br>
        <strong>Aktueller Monat:</strong> 68% (12 von 18 Angeboten)<br>
        <strong>Vormonat:</strong> 62% (10 von 16 Angeboten)<br><br>
        Veränderung: <strong>+6 Prozentpunkte</strong><br><br>
        Stärkste Sparten:<br>
        • Kfz: 78% Abschlussquote<br>
        • Hausrat: 71% Abschlussquote<br>
        • BU: 45% Abschlussquote (unter Durchschnitt)
        ${followUpSuggestions}`;
    }

    // Fallback für alle anderen Fragen
    return `Ich kann Ihnen bei folgenden Themen helfen:
        ${followUpSuggestions}`;
}

/**
 * Öffnet Kundendetail aus dem Chat heraus
 * @param {string} kundenId - Kunden-ID
 * @param {string} targetTab - Ziel-Tab (optional: 'stammdaten', 'vertraege', 'fida', 'impulse', 'finanzplanung', 'kommunikation')
 * @param {string} contractType - Vertragstyp zum Highlighten (optional: 'leben', 'kfz', 'hausrat', 'rechtsschutz', 'bu', 'unfall', 'haftpflicht')
 */
function openKundenDetailFromChat(kundenId, targetTab, contractType) {
    // Chat bleibt offen, damit Nutzer ihn weiter verwenden kann
    // (Chat-Toggle Button bleibt verfügbar in Kundendetail-Ansicht)

    // Öffne Kundendetail
    if (typeof openKundenDetailFromFida === 'function') {
        openKundenDetailFromFida(kundenId);
    } else if (typeof window.openKundenDetail === 'function') {
        window.openKundenDetail(kundenId);
    } else {
        console.log('Öffne Kunde:', kundenId);
        return;
    }

    // Warte kurz, bis die Kundendetail-Seite geladen ist
    setTimeout(() => {
        // Tab wechseln wenn angegeben
        if (targetTab) {
            const tabBtn = document.querySelector(`[data-tab="${targetTab}"]`);
            if (tabBtn) {
                tabBtn.click();
            }
        }

        // Vertrag highlighten wenn angegeben
        if (contractType) {
            setTimeout(() => {
                highlightContractRow(contractType);
            }, 300);
        }
    }, 200);
}

/**
 * Highlightet eine Vertragszeile für 2 Sekunden
 * @param {string} contractType - Vertragstyp (kfz, hausrat, rechtsschutz, bu)
 */
function highlightContractRow(contractType) {
    // Mapping von Vertragstyp zu Suchbegriff
    const searchTerms = {
        'leben': 'Risikolebensversicherung',
        'kfz': 'Kfz-Versicherung',
        'hausrat': 'Hausratversicherung',
        'rechtsschutz': 'Rechtsschutz',
        'bu': 'Berufsunfähigkeitsversicherung',
        'wohngebaeude': 'Wohngebäudeversicherung',
        'unfall': 'Unfallversicherung',
        'haftpflicht': 'Privathaftpflichtversicherung'
    };

    const searchTerm = searchTerms[contractType] || contractType;

    // Suche in allen sichtbaren Tabellen
    const tables = document.querySelectorAll('.kunden-table tbody tr, .fida-table tbody tr');

    for (const row of tables) {
        const firstCell = row.querySelector('td:first-child');
        if (firstCell && firstCell.textContent.includes(searchTerm)) {
            // Scroll zur Zeile
            row.scrollIntoView({ behavior: 'smooth', block: 'center' });

            // Highlight-Klasse hinzufügen
            row.classList.add('highlight-flash');

            // Nach 2 Sekunden entfernen
            setTimeout(() => {
                row.classList.remove('highlight-flash');
            }, 2000);

            break;
        }
    }
}

/**
 * Toggle für den floating Agentur Chat
 */
function toggleAgenturChat() {
    const widget = document.getElementById('agenturChatWidget');
    const toggle = document.getElementById('agenturChatToggle');

    if (widget.style.display === 'none' || widget.style.display === '') {
        widget.style.display = 'flex';
        toggle.style.display = 'none';
    } else {
        widget.style.display = 'none';
        toggle.style.display = 'flex';
    }
}

/**
 * Versteckt den Agentur Chat komplett (beim Verlassen der Agentursicht)
 */
function hideAgenturChat() {
    const widget = document.getElementById('agenturChatWidget');
    const toggle = document.getElementById('agenturChatToggle');
    if (widget) widget.style.display = 'none';
    if (toggle) toggle.style.display = 'none';
}

/**
 * Toggle für weitere Potentiale in der Übersicht
 */
function toggleWeiterePotentiale() {
    const liste = document.getElementById('weiterePotentialeListe');
    const toggle = document.querySelector('.weitere-potentiale-toggle');

    if (liste.style.display === 'none' || liste.style.display === '') {
        liste.style.display = 'block';
        toggle.classList.add('expanded');
        toggle.querySelector('span:not(.weitere-badge)').textContent = 'Weitere Potentiale ausblenden';
    } else {
        liste.style.display = 'none';
        toggle.classList.remove('expanded');
        toggle.querySelector('span:not(.weitere-badge)').textContent = 'Weitere Potentiale anzeigen';
    }
}

/**
 * Zeigt neue Potentiale mit Ladeanimation und wechselt dann zum Potentiale-Tab
 */
function showNeuePotentiale() {
    // Prüfen ob Chat geschlossen ist (display = 'none' oder '')
    const chatWidget = document.getElementById('agenturChatWidget');
    if (chatWidget && (chatWidget.style.display === 'none' || chatWidget.style.display === '')) {
        // Chat ist geschlossen - öffnen
        toggleAgenturChat();
        // Kurz warten bis Chat geöffnet ist
        setTimeout(() => {
            showNeuePotentialeContent();
        }, 300);
        return;
    }

    // Chat ist bereits offen - direkt Inhalt anzeigen
    showNeuePotentialeContent();
}

function showNeuePotentialeContent() {
    const chatBody = document.getElementById('agenturChatBody');
    if (!chatBody) {
        console.error('agenturChatBody nicht gefunden!');
        return;
    }

    // Welcome message entfernen falls vorhanden
    const welcome = chatBody.querySelector('.agentur-chat-welcome');
    if (welcome) {
        welcome.style.display = 'none';
    }

    // User-Nachricht hinzufügen
    const userMsg = document.createElement('div');
    userMsg.className = 'chat-message user-message';
    userMsg.innerHTML = '<div class="message-content">Neue Potentiale?</div>';
    chatBody.appendChild(userMsg);

    // Typing-Indikator hinzufügen
    const typingMsg = document.createElement('div');
    typingMsg.className = 'chat-message bot-message typing-indicator';
    typingMsg.innerHTML = `
        <div class="message-content">
            <div class="typing-dots">
                <span></span>
                <span></span>
                <span></span>
            </div>
        </div>`;
    chatBody.appendChild(typingMsg);
    chatBody.scrollTop = chatBody.scrollHeight;

    // Nach 1.5 Sekunden: Potentiale nacheinander anzeigen
    setTimeout(() => {
        // Typing-Indikator entfernen
        typingMsg.remove();

        // Bot-Antwort Container erstellen
        const botMsg = document.createElement('div');
        botMsg.className = 'chat-message bot-message';
        botMsg.innerHTML = '<div class="message-content"><strong>Aktuelle Top-Potentiale:</strong><br><br></div>';
        chatBody.appendChild(botMsg);
        chatBody.scrollTop = chatBody.scrollHeight;

        const messageContent = botMsg.querySelector('.message-content');

        // Potentiale nacheinander einblenden - MRH vs B2B vs AO
        var potentiale;
        const isMRHMode = typeof viewMode !== 'undefined' && viewMode === 'mrh';
        if (isMRHMode) {
            potentiale = [
                {
                    name: 'Rhein-Main Maschinenbau',
                    title: 'bAV fehlt (340 MA)',
                    desc: 'Cross-Sell Insurance → Benefits: geschätztes Potential 85k bAV-Volumen/Jahr'
                },
                {
                    name: 'Rhein-Main Maschinenbau',
                    title: 'Renewal BH 01.04.2026',
                    desc: '420k Prämie — Allianz hat 15% Erhöhung angekündigt'
                },
                {
                    name: 'Hessenlog Spedition',
                    title: 'bAV fehlt (210 MA)',
                    desc: 'Einfaches Bindungsmodell gegen Fluktuation möglich'
                },
                {
                    name: 'DigiCore Solutions',
                    title: 'Kreditversicherung prüfen',
                    desc: 'SaaS-Forderungen international — Finance Cross-Sell'
                },
                {
                    name: 'Rhein-Main Verkehr',
                    title: 'Renewal Flotte + BH ÖPNV 01.07.2026',
                    desc: '1,45 Mio. Prämie — größtes Renewal des Halbjahres'
                }
            ];
        } else if (typeof maklerModus !== 'undefined' && maklerModus) {
            potentiale = [
                {
                    name: 'Klinikum Lippetal',
                    title: 'Umwelthaftpflicht fehlt',
                    desc: 'Labor & Gefahrstoffe nicht versichert – hohe Priorität'
                },
                {
                    name: 'Klinikum Lippetal',
                    title: 'Cyber-Renewal in 30 Tagen',
                    desc: 'Hiscox-Vertrag läuft 31.03.2026 aus – Erneuerung einleiten'
                },
                {
                    name: 'Reha-Klinik Teutoburg',
                    title: 'Cyberversicherung fehlt',
                    desc: 'Patientendaten ungeschützt – dringend absichern'
                },
                {
                    name: 'Ev. Landeskirche Teutoburg',
                    title: 'Cyber-Rahmenvertrag',
                    desc: 'Kirchenverwaltungen nur teilweise versichert – 12,5 Mio. € Bestand'
                },
                {
                    name: 'Teutoburger Maschinenbau',
                    title: '3 Renewals in 90 Tagen',
                    desc: '680.000 € Prämienvolumen – Verhandlungen vorbereiten'
                }
            ];
        } else {
            potentiale = [
                {
                    name: 'Peter Schmidt',
                    title: 'Risikoleben fehlt',
                    desc: 'Baufinanzierung €285.000 ohne Absicherung'
                },
                {
                    name: 'Peter Schmidt',
                    title: 'BU-Nachversicherung',
                    desc: 'Nur 41% des Einkommens abgesichert'
                },
                {
                    name: 'Amira König',
                    title: 'Kfz-Wechsel',
                    desc: 'Vertrag läuft bald aus, €200/Jahr Ersparnis möglich'
                },
                {
                    name: 'Thomas Weber',
                    title: 'Risikoleben fehlt',
                    desc: 'Familie unzureichend abgesichert'
                }
            ];
        }

        // Jedes Potential nacheinander mit 400ms Delay einblenden
        potentiale.forEach((potential, index) => {
            setTimeout(() => {
                const item = document.createElement('div');
                item.className = 'chat-customer-item';
                item.style.opacity = '0';
                item.style.transform = 'translateY(10px)';
                item.style.transition = 'all 0.3s ease';
                item.innerHTML = `
                    <strong>${potential.name}</strong> – ${potential.title}<br>
                    <span class="chat-recommendation">${potential.desc}</span>`;
                messageContent.appendChild(item);

                // Fade-in Animation
                setTimeout(() => {
                    item.style.opacity = '1';
                    item.style.transform = 'translateY(0)';
                }, 10);

                chatBody.scrollTop = chatBody.scrollHeight;

                // Nach dem letzten Potential: Hinweis, Follow-up Buttons und Tab-Wechsel
                if (index === potentiale.length - 1) {
                    setTimeout(() => {
                        const footer = document.createElement('div');
                        footer.innerHTML = '<br><strong>→ Wechsle zum Potentiale-Tab für vollständige Übersicht...</strong>';
                        messageContent.appendChild(footer);

                        // Follow-up Buttons hinzufügen (wie bei anderen Chat-Antworten)
                        const followUpDiv = document.createElement('div');
                        followUpDiv.innerHTML = `
                            <div class="chat-followup-suggestions">
                                <button onclick="askAgenturQuestion('Welche Verträge laufen in den nächsten 30 Tagen aus?')">Welche Verträge laufen bald aus?</button>
                                <button onclick="askAgenturQuestion('Welche Kunden haben Cross-Selling-Potential?')">Wer hat Cross-Selling-Potential?</button>
                                <button onclick="showNeuePotentiale()">Neue Potentiale?</button>
                                <button onclick="goToSalesReport()">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14" style="vertical-align: middle; margin-right: 4px;">
                                        <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"></path>
                                        <polyline points="14 2 14 8 20 8"></polyline>
                                    </svg>
                                    Vertriebsbericht
                                </button>
                            </div>`;
                        messageContent.appendChild(followUpDiv);
                        chatBody.scrollTop = chatBody.scrollHeight;

                        // Nach 1,5 Sekunden: Zum Potentiale-Tab wechseln
                        setTimeout(() => {
                            if (typeof viewMode !== 'undefined' && viewMode === 'mrh') {
                                if (typeof showMRHTab === 'function') showMRHTab('potentiale');
                            } else if (typeof maklerModus !== 'undefined' && maklerModus) {
                                if (typeof showMaklerTab === 'function') showMaklerTab('potentiale');
                            } else {
                                showAgenturTab('potential');
                            }
                            // Chat bleibt offen für weitere Interaktionen
                        }, 1500);
                    }, 300);
                }
            }, index * 400);
        });
    }, 1500);
}

/**
 * Navigiert zum Vertriebsbericht in A-03 (Dashboard)
 * mit der aktuellen Agentur gefiltert
 */
function goToSalesReport() {
    const agenturId = currentAgenturIdInOverview || 'VM00001';
    console.log('Navigiere zu Vertriebsbericht für:', agenturId);

    const chatBody = document.getElementById('agenturChatBody');
    if (!chatBody) {
        // Fallback ohne Animation
        if (typeof navigateToSalesReport === 'function') {
            navigateToSalesReport(agenturId);
        }
        return;
    }

    // Welcome message entfernen falls vorhanden
    const welcome = chatBody.querySelector('.agentur-chat-welcome');
    if (welcome) {
        welcome.style.display = 'none';
    }

    // User-Nachricht hinzufügen
    const userMsg = document.createElement('div');
    userMsg.className = 'chat-message user-message';
    userMsg.innerHTML = '<div class="message-content">Vertriebsbericht</div>';
    chatBody.appendChild(userMsg);

    // Typing-Indikator hinzufügen
    const typingMsg = document.createElement('div');
    typingMsg.className = 'chat-message bot-message typing-indicator';
    typingMsg.id = 'salesReportTyping';
    typingMsg.innerHTML = `
        <div class="message-content">
            <div class="typing-dots">
                <span></span>
                <span></span>
                <span></span>
            </div>
        </div>
    `;
    chatBody.appendChild(typingMsg);
    chatBody.scrollTop = chatBody.scrollHeight;

    // Nach kurzer Zeit Bot-Antwort und Navigation
    setTimeout(() => {
        // Typing entfernen
        const typing = document.getElementById('salesReportTyping');
        if (typing) typing.remove();

        // Bot-Antwort hinzufügen
        const botMsg = document.createElement('div');
        botMsg.className = 'chat-message bot-message';
        botMsg.innerHTML = `
            <div class="message-content">
                <strong>Vertriebsbericht wird geladen...</strong><br><br>
                Ich öffne jetzt das Dashboard mit dem Vertriebsbericht für diese Agentur.
            </div>
        `;
        chatBody.appendChild(botMsg);
        chatBody.scrollTop = chatBody.scrollHeight;

        // Nach kurzer Pause navigieren
        setTimeout(() => {
            if (typeof navigateToSalesReport === 'function') {
                navigateToSalesReport(agenturId);
            } else {
                console.error('navigateToSalesReport Funktion nicht gefunden');
                if (typeof openDashboard === 'function') {
                    openDashboard();
                }
            }
        }, 800);
    }, 1500);
}

// Global verfügbar machen
window.goToSalesReport = goToSalesReport;
window.showAgenturTab = showAgenturTab;
window.filterFidaCases = filterFidaCases;
window.togglePotentialDetails = togglePotentialDetails;
window.toggleVertriebsPeriod = toggleVertriebsPeriod;
window.openFormular = openFormular;
window.openAbrechnung = openAbrechnung;
window.sendAgenturChat = sendAgenturChat;
window.askAgenturQuestion = askAgenturQuestion;
window.openKundenDetailFromChat = openKundenDetailFromChat;
window.highlightContractRow = highlightContractRow;
window.openKundenDetailFromFida = openKundenDetailFromFida;
window.toggleAgenturChat = toggleAgenturChat;
window.hideAgenturChat = hideAgenturChat;
window.showNeuePotentiale = showNeuePotentiale;
window.toggleWeiterePotentiale = toggleWeiterePotentiale;

// Dynamische Daten auch bei direktem Seitenaufruf setzen
document.addEventListener('DOMContentLoaded', function() {
    setTimeout(updateDynamicDates, 200);
});
