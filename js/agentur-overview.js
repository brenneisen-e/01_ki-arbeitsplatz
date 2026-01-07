// js/agentur-overview.js - Agentur-Übersicht Funktionalität (Fachkonzept-konform)

// ========================================
// AGENTUR OVERVIEW FUNCTIONS
// ========================================

/**
 * Zeigt die Agentur-Übersichts-Seite für eine bestimmte Agentur
 * @param {string} vermittlerId - Die Vermittler-ID (z.B. 'VM00001')
 */
function showAgenturOverview(vermittlerId) {
    console.log('📊 Zeige Agentur-Übersicht für:', vermittlerId);

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
    if (agenturOverview) agenturOverview.style.display = 'block';

    // Lade und zeige Agentur-Daten
    loadAgenturData(vermittlerId);
}

/**
 * Lädt die Daten für eine bestimmte Agentur und füllt die UI
 * @param {string} vermittlerId - Die Vermittler-ID
 */
function loadAgenturData(vermittlerId) {
    console.log('📂 Lade Daten für Agentur:', vermittlerId);

    // Hole Agentur-Daten aus den bestehenden Funktionen
    const agenturen = typeof getAgenturen === 'function' ? getAgenturen() : [];
    const agentur = agenturen.find(a => a.id === vermittlerId);

    if (!agentur) {
        console.error('❌ Agentur nicht gefunden:', vermittlerId);
        alert('Agentur nicht gefunden: ' + vermittlerId);
        backFromAgentur();
        return;
    }

    // Hole detaillierte Daten
    const agenturData = typeof getAgenturData === 'function' ? getAgenturData(vermittlerId) : null;

    console.log('✅ Agentur gefunden:', agentur);
    console.log('📊 Agentur Daten:', agenturData);

    // Fülle alle Bereiche
    fillHeader(agentur, agenturData);
    fillCockpitKPIs(agenturData);
    fillStammdaten(agentur, agenturData);
    fillNeugeschaeftTab(agenturData);
    fillBestandTab(agenturData);
    fillStornoTab(agenturData);
    fillProvisionTab(agenturData);
    fillQualitaetTab(agenturData);

    // Zeige Übersicht-Tab als ersten Tab
    showAgenturTab('uebersicht');
}

/**
 * Tab-Wechsel Funktion
 */
function showAgenturTab(tabName) {
    // Alle Tabs deaktivieren
    document.querySelectorAll('.agentur-tab').forEach(tab => tab.classList.remove('active'));
    document.querySelectorAll('.agentur-tab-content').forEach(content => content.classList.remove('active'));

    // Gewählten Tab aktivieren
    const tabButton = document.querySelector(`.agentur-tab[onclick="showAgenturTab('${tabName}')"]`);
    const tabContent = document.getElementById(`tab-${tabName}`);

    if (tabButton) tabButton.classList.add('active');
    if (tabContent) tabContent.classList.add('active');
}

/**
 * Füllt den Header mit Agentur-Info
 */
function fillHeader(agentur, agenturData) {
    const title = document.getElementById('agenturPageTitle');
    const idHeader = document.getElementById('agenturIdHeader');
    const statusHeader = document.getElementById('agenturStatusHeader');

    if (title) title.textContent = agentur.name || agentur.id;
    if (idHeader) idHeader.textContent = agentur.id;
    if (statusHeader) statusHeader.textContent = 'Aktiv';

    // Standard-Profilbild für Max Mustermann
    const defaultPhoto = 'https://raw.githubusercontent.com/brenneisen-e/VSTEike/main/AdobeStock_1091012713.jpeg';

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
    console.log('🔙 Zurück vom Agentur-Overview');

    const landingPage = document.getElementById('landingPage');
    const agenturOverview = document.getElementById('agenturOverview');

    if (landingPage) landingPage.style.display = 'flex';
    if (agenturOverview) agenturOverview.style.display = 'none';
}

// ========================================
// BILLING CHECK FUNCTIONS
// ========================================

function openBillingCheck() {
    console.log('💳 Öffne Billing Check');

    const landingPage = document.getElementById('landingPage');
    const mainApp = document.getElementById('mainApp');
    const agenturOverview = document.getElementById('agenturOverview');
    const billingCheckPage = document.getElementById('billingCheckPage');

    if (landingPage) landingPage.style.display = 'none';
    if (mainApp) mainApp.style.display = 'none';
    if (agenturOverview) agenturOverview.style.display = 'none';
    if (billingCheckPage) billingCheckPage.style.display = 'block';
}

function closeBillingCheck() {
    console.log('🔙 Schließe Billing Check');

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
    console.log('🔍 Filtere FIDA-Fälle nach:', status);

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
 * Öffnet die Kundendetailansicht für einen Kunden
 * @param {string} kundenId - Die Kunden-ID (z.B. 'VM00001')
 */
function openKundenDetailFromFida(kundenId) {
    console.log('👤 Öffne Kundendetail von FIDA für:', kundenId);

    // Wenn openKundenDetail existiert, nutze sie
    if (typeof window.openKundenDetail === 'function') {
        window.openKundenDetail(kundenId);
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
    console.log('📄 Öffne Formular:', formularId);
    alert('Formular "' + formularId + '" wird geladen...\n\n(Demo-Funktion)');
}

/**
 * Öffnet eine Provisionsabrechnung (PDF)
 * @param {string} period - Der Abrechnungszeitraum (z.B. '2024-12')
 */
function openAbrechnung(period) {
    console.log('📄 Öffne Provisionsabrechnung:', period);
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

    if (q.includes('potential') || q.includes('woche')) {
        return `<strong>Ihre Vertriebspotentiale diese Woche:</strong><br><br>
        • <strong>5 aktive Potentiale</strong> mit Gesamtvolumen €12.750/Jahr<br>
        • <strong>Peter Schmidt</strong> - Übergreifend (€8.500) - Hohe Priorität<br>
        • <strong>Sabine König</strong> - Kfz-Wechsel (€650)<br>
        • <strong>Thomas Weber</strong> - Risikoleben (€1.800)<br><br>
        Empfehlung: Fokus auf Peter Schmidt - hier ist der größte Hebel.`;
    }

    if (q.includes('aufgabe') || q.includes('offen')) {
        return `<strong>Ihre offenen Aufgaben:</strong><br><br>
        🔴 <strong>Heute:</strong> Rückruf Peter Schmidt - Beratungstermin (14:00)<br>
        🟡 <strong>Morgen:</strong> Angebot Kfz für König erstellen<br>
        ⚪ <strong>Diese Woche:</strong> Quartalsreporting vorbereiten<br><br>
        Tipp: Der Termin mit Schmidt ist in 2 Stunden!`;
    }

    if (q.includes('kennzahl') || q.includes('vertrieb')) {
        return `<strong>Ihre Vertriebskennzahlen:</strong><br><br>
        📈 <strong>Diese Woche:</strong><br>
        • 12 Abschlüsse (+3 vs. Vorwoche)<br>
        • €18.450 Neugeschäft (+12%)<br>
        • 68% Abschlussquote (+5%)<br><br>
        👏 Starke Woche! Sie liegen über dem Durchschnitt.`;
    }

    if (q.includes('top') || q.includes('höchst')) {
        return `<strong>Kunden mit höchstem Potential:</strong><br><br>
        1. <strong>Peter Schmidt</strong> - €8.500/Jahr (BU-Erhöhung)<br>
        2. <strong>Thomas Weber</strong> - €1.800/Jahr (Risikoleben)<br>
        3. <strong>Sabine König</strong> - €650/Jahr (Kfz-Wechsel)<br><br>
        Gesamtpotential: €10.950/Jahr`;
    }

    return `Ich habe Ihre Anfrage verstanden. Hier sind einige Möglichkeiten:<br><br>
    • Fragen Sie nach <strong>"Potentiale"</strong> für Ihre aktuellen Vertriebschancen<br>
    • Fragen Sie nach <strong>"Aufgaben"</strong> für Ihre offenen To-Dos<br>
    • Fragen Sie nach <strong>"Kennzahlen"</strong> für Ihre Performance`;
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

// Global verfügbar machen
window.showAgenturTab = showAgenturTab;
window.filterFidaCases = filterFidaCases;
window.togglePotentialDetails = togglePotentialDetails;
window.toggleVertriebsPeriod = toggleVertriebsPeriod;
window.openFormular = openFormular;
window.openAbrechnung = openAbrechnung;
window.sendAgenturChat = sendAgenturChat;
window.askAgenturQuestion = askAgenturQuestion;
window.openKundenDetailFromFida = openKundenDetailFromFida;
window.toggleAgenturChat = toggleAgenturChat;
window.toggleWeiterePotentiale = toggleWeiterePotentiale;
