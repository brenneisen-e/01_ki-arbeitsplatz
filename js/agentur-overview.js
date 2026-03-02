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

    // Pipeline-Zeitraum setzen (01.01.YYYY – heute)
    var pipelineZeitraum = document.getElementById('pipelineZeitraum');
    if (pipelineZeitraum) {
        var jahresanfang = '01.01.' + now.getFullYear();
        var heute = String(now.getDate()).padStart(2, '0') + '.'
                  + String(now.getMonth() + 1).padStart(2, '0') + '.'
                  + now.getFullYear();
        pipelineZeitraum.textContent = 'Zeitraum: ' + jahresanfang + ' – ' + heute;
    }

    // Provisionsabrechnungen dynamisch (Vormonat, Vor-Vormonat, Vor-Vor-Vormonat)
    var monatsnamen = ['Januar','Februar','März','April','Mai','Juni','Juli','August','September','Oktober','November','Dezember'];
    for (var m = 1; m <= 3; m++) {
        var abrMonat = new Date(now.getFullYear(), now.getMonth() - m, 1);
        var erstelltTag = 2 + Math.floor(Math.random() * 4); // 2.-5. des Folgemonats
        var erstelltDatum = new Date(abrMonat.getFullYear(), abrMonat.getMonth() + 1, erstelltTag);

        var monatEl = document.getElementById('abrechnungMonat' + m);
        if (monatEl) monatEl.textContent = monatsnamen[abrMonat.getMonth()] + ' ' + abrMonat.getFullYear();

        var datumEl = document.getElementById('abrechnungDatum' + m);
        if (datumEl) datumEl.textContent = 'Erstellt: ' + String(erstelltDatum.getDate()).padStart(2,'0') + '.' + String(erstelltDatum.getMonth()+1).padStart(2,'0') + '.' + erstelltDatum.getFullYear();
    }
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

    // Cockpit-KPIs (Gesamtbestand etc.) nur in Übersicht anzeigen
    var cockpitKpis = document.querySelector('.cockpit-kpis:not(#maklerKpis)');
    if (cockpitKpis) {
        cockpitKpis.style.display = (tabName === 'uebersicht') ? '' : 'none';
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

    // Spartenverteilung als Donut-Chart
    const spartenContainer = document.getElementById('spartenNeugeschaeft');
    if (spartenContainer) {
        const sparten = [
            { name: 'Leben', value: 35 + Math.random() * 15, color: '#2563eb' },
            { name: 'Kranken', value: 20 + Math.random() * 10, color: '#16a34a' },
            { name: 'Schaden', value: 25 + Math.random() * 10, color: '#9333ea' },
            { name: 'Kfz', value: 10 + Math.random() * 10, color: '#f59e0b' }
        ];
        const total = sparten.reduce((s, sp) => s + sp.value, 0);
        // Donut SVG
        const size = 140, sw = 22, cx = size/2, cy = size/2, r = size/2 - sw/2 - 4;
        const circ = 2 * Math.PI * r;
        let offset = 0;
        let paths = '';
        sparten.forEach(sp => {
            const pct = sp.value / total;
            const dash = pct * circ;
            paths += `<circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${sp.color}" stroke-width="${sw}" stroke-dasharray="${dash} ${circ - dash}" stroke-dashoffset="${-offset}" transform="rotate(-90 ${cx} ${cy})" stroke-linecap="round"/>`;
            offset += dash;
        });
        const donutSvg = `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">${paths}<text x="${cx}" y="${cy + 5}" text-anchor="middle" font-size="15" font-weight="700" fill="#1e293b">${antraege}</text><text x="${cx}" y="${cy + 19}" text-anchor="middle" font-size="10" fill="#94a3b8">Anträge</text></svg>`;
        // Legende
        const legend = sparten.map(sp => {
            const pct = (sp.value / total * 100).toFixed(0);
            const count = Math.round(antraege * sp.value / total);
            return `<div class="sparten-legend-item"><span class="sparten-legend-dot" style="background:${sp.color}"></span><span class="sparten-legend-name">${sp.name}</span><span class="sparten-legend-val"><strong>${pct}%</strong> (${count})</span></div>`;
        }).join('');
        spartenContainer.innerHTML = `<div class="sparten-donut-layout"><div class="sparten-donut-svg">${donutSvg}</div><div class="sparten-legend">${legend}</div></div>`;
    }

    // Vertragstabelle befüllen
    if (mockNeugeschaeft.length === 0) generateMockVertraege();
    fillNeugeschaeftTable();
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

    // Vertragstabelle befüllen
    if (mockBestand.length === 0) generateMockVertraege();
    fillBestandTable();
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
            { name: 'Preis / zu teuer', count: Math.floor(Math.random() * 30) + 20, color: '#ef4444' },
            { name: 'Wettbewerber', count: Math.floor(Math.random() * 20) + 15, color: '#f97316' },
            { name: 'Leistung nicht zufrieden', count: Math.floor(Math.random() * 15) + 10, color: '#eab308' },
            { name: 'Finanzielle Gründe', count: Math.floor(Math.random() * 15) + 8, color: '#8b5cf6' },
            { name: 'Kein Bedarf mehr', count: Math.floor(Math.random() * 10) + 5, color: '#94a3b8' }
        ];
        const maxCount = Math.max(...gruende.map(g => g.count));
        const totalCount = gruende.reduce((s, g) => s + g.count, 0);

        gruendeContainer.innerHTML = gruende.map(g => {
            const pct = (g.count / totalCount * 100).toFixed(0);
            const barWidth = (g.count / maxCount * 100).toFixed(0);
            return `<div class="storno-reason-item">
                <div class="storno-reason-top">
                    <span class="storno-reason-name">${g.name}</span>
                    <span class="storno-reason-stats"><strong>${g.count}</strong> Verträge · ${pct}%</span>
                </div>
                <div class="storno-reason-bar-track">
                    <div class="storno-reason-bar-fill" style="width:${barWidth}%; background:${g.color};"></div>
                </div>
            </div>`;
        }).join('');
    }

    // Vertragstabelle befüllen
    if (mockStorno.length === 0) generateMockVertraege();
    fillStornoTable();
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

    // Beschwerden-Trend (6 Monate)
    const trendEl = document.getElementById('qualTrendChart');
    if (trendEl) {
        const monate = ['Januar','Februar','März','April','Mai','Juni','Juli','August','September','Oktober','November','Dezember'];
        const now = new Date();
        const trendData = [];
        for (let i = 5; i >= 0; i--) {
            const m = new Date(now.getFullYear(), now.getMonth() - i, 1);
            const val = +(Math.random() * 3 + 0.5).toFixed(1);
            trendData.push({ monat: monate[m.getMonth()].substring(0, 3), val: val });
        }
        const maxVal = Math.max(...trendData.map(d => d.val), 4);
        trendEl.innerHTML = trendData.map(d => {
            const h = Math.round((d.val / maxVal) * 90);
            const color = d.val < 1.5 ? '#16a34a' : (d.val < 2.5 ? '#d97706' : '#dc2626');
            return '<div class="qual-trend-bar-group">' +
                '<div class="qual-trend-bar" style="height:' + h + 'px;background:' + color + ';">' +
                '<span class="qual-trend-value">' + d.val + '</span></div>' +
                '<span class="qual-trend-label">' + d.monat + '</span></div>';
        }).join('');
    }

    // Schulungsfortschritt
    const schulungList = document.getElementById('qualSchulungList');
    if (schulungList) {
        const kurse = [
            { name: 'IDD-Weiterbildung', stunden: schulung, max: 15, color: '#86BC25' },
            { name: 'Produktschulung Leben', stunden: Math.min(Math.floor(Math.random() * 5 + 3), 6), max: 6, color: '#3b82f6' },
            { name: 'Datenschutz (DSGVO)', stunden: 2, max: 2, color: '#8b5cf6' },
            { name: 'Geldwäscheprävention', stunden: Math.floor(Math.random() * 2 + 1), max: 2, color: '#f59e0b' },
            { name: 'Digitale Beratungskompetenz', stunden: Math.floor(Math.random() * 3 + 1), max: 4, color: '#06b6d4' }
        ];
        schulungList.innerHTML = kurse.map(k => {
            const pct = Math.round((k.stunden / k.max) * 100);
            return '<div class="qual-schulung-item">' +
                '<div class="qual-schulung-top"><span class="qual-schulung-name">' + k.name + '</span>' +
                '<span class="qual-schulung-hours">' + k.stunden + '/' + k.max + 'h (' + pct + '%)</span></div>' +
                '<div class="qual-schulung-bar"><div class="qual-schulung-bar-fill" style="width:' + pct + '%;background:' + k.color + ';"></div></div>' +
                '</div>';
        }).join('');
    }

    // Compliance-Checkliste
    const checkEl = document.getElementById('qualChecklist');
    if (checkEl) {
        const checks = [
            { text: 'Beratungsdokumentation vollständig', status: 'ok', label: 'Erfüllt' },
            { text: 'Interessenkonflikt-Erklärung aktuell', status: 'ok', label: 'Erfüllt' },
            { text: 'Beschwerdemanagement-Prozess', status: 'ok', label: 'Erfüllt' },
            { text: 'Produktfreigabeverfahren (POG)', status: 'ok', label: 'Erfüllt' },
            { text: 'Nachhaltigkeitspräferenzen (ESG)', status: 'warn', label: 'Teilweise' },
            { text: 'Zielmarktbestimmung dokumentiert', status: 'ok', label: 'Erfüllt' },
            { text: 'Vergütungstransparenz (§48a VAG)', status: 'ok', label: 'Erfüllt' }
        ];
        const icons = {
            ok: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="12" height="12"><polyline points="20 6 9 17 4 12"/></svg>',
            warn: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="12" height="12"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>',
            fail: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="12" height="12"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>'
        };
        checkEl.innerHTML = checks.map(c => {
            return '<div class="qual-check-item">' +
                '<div class="qual-check-icon ' + c.status + '">' + icons[c.status] + '</div>' +
                '<span class="qual-check-text">' + c.text + '</span>' +
                '<span class="qual-check-status ' + c.status + '">' + c.label + '</span></div>';
        }).join('');
    }

    // Letzte Qualitätsprüfungen
    const pruefEl = document.getElementById('qualPruefungen');
    if (pruefEl) {
        const now = new Date();
        const fmt = d => d.getDate().toString().padStart(2,'0') + '.' + (d.getMonth()+1).toString().padStart(2,'0') + '.' + d.getFullYear();
        const pruefungen = [
            { datum: new Date(now.getFullYear(), now.getMonth(), now.getDate() - 5), text: 'IDD-Jahresaudit Beratungsdoku', ergebnis: 'bestanden', label: 'Bestanden' },
            { datum: new Date(now.getFullYear(), now.getMonth(), now.getDate() - 18), text: 'Stichprobe Risikoanalysen Q1', ergebnis: 'bestanden', label: 'Bestanden' },
            { datum: new Date(now.getFullYear(), now.getMonth() - 1, 12), text: 'DSGVO-Konformitätsprüfung', ergebnis: 'teilweise', label: 'Teilweise' },
            { datum: new Date(now.getFullYear(), now.getMonth() - 1, 3), text: 'ESG-Beratungspflicht Audit', ergebnis: 'teilweise', label: 'Nacharbeit' },
            { datum: new Date(now.getFullYear(), now.getMonth() - 2, 20), text: 'GwG-Prüfung Identifikation', ergebnis: 'bestanden', label: 'Bestanden' },
            { datum: new Date(now.getFullYear(), now.getMonth() - 2, 8), text: 'Beschwerdemanagement Review', ergebnis: 'bestanden', label: 'Bestanden' }
        ];
        pruefEl.innerHTML = pruefungen.map(p => {
            return '<div class="qual-pruefung-item">' +
                '<span class="qual-pruefung-datum">' + fmt(p.datum) + '</span>' +
                '<span class="qual-pruefung-text">' + p.text + '</span>' +
                '<span class="qual-pruefung-ergebnis ' + p.ergebnis + '">' + p.label + '</span></div>';
        }).join('');
    }
}

// ========================================
// VERTRAGSTABELLEN - Mock-Daten & Funktionen
// ========================================

var mockNeugeschaeft = [];
var mockBestand = [];
var mockStorno = [];

var spartenLabels = { leben: 'Leben', kranken: 'Kranken', schaden: 'Schaden', kfz: 'Kfz' };
var zahlweisen = ['Monatlich', 'Vierteljährlich', 'Halbjährlich', 'Jährlich'];
var stornoGruende = ['Preis / zu teuer', 'Wettbewerber', 'Leistung unzureichend', 'Finanzielle Gründe', 'Kein Bedarf mehr'];

function fmtDatum(d) {
    return String(d.getDate()).padStart(2, '0') + '.' + String(d.getMonth() + 1).padStart(2, '0') + '.' + d.getFullYear();
}

function fmtEuro(val) {
    return '€' + val.toLocaleString('de-DE', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
}

function randomItem(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

// Sparten-Mapping aus Versicherungstyp
function getSparte(typ) {
    typ = (typ || '').toLowerCase();
    if (typ.indexOf('leben') >= 0 || typ.indexOf('bu') >= 0 || typ.indexOf('berufsunf') >= 0 || typ.indexOf('risiko') >= 0) return 'leben';
    if (typ.indexOf('kranken') >= 0 || typ.indexOf('pflege') >= 0 || typ.indexOf('zahn') >= 0) return 'kranken';
    if (typ.indexOf('kfz') >= 0 || typ.indexOf('kasko') >= 0) return 'kfz';
    return 'schaden'; // Haftpflicht, Wohngebäude, Rechtsschutz, Unfall, Betriebshaftpflicht etc.
}

// Jahresbeitrag aus Prämie-String berechnen
function parsePraemie(praemieStr) {
    if (!praemieStr) return 0;
    var match = praemieStr.match(/[\d.,]+/);
    if (!match) return 0;
    var val = parseFloat(match[0].replace('.', '').replace(',', '.'));
    if (praemieStr.indexOf('/Mon') >= 0) return Math.round(val * 12);
    if (praemieStr.indexOf('/Jahr') >= 0) return Math.round(val);
    return Math.round(val);
}

// Zahlweise aus Prämie-String ableiten
function parseZahlweise(praemieStr) {
    if (!praemieStr) return 'Jährlich';
    if (praemieStr.indexOf('/Mon') >= 0) return 'Monatlich';
    return 'Jährlich';
}

// Bestandsverträge aus den Demo-Kundendaten (identisch mit Kunden-Detail Betreute Verträge)
var kundenBestandVertraege = [
    // Peter Schmidt KD00001
    { kunde: 'Peter Schmidt', kundenId: 'KD00001', typ: 'Berufsunfähigkeitsversicherung', versicherer: 'ERGO', details: 'BU-Rente: €1.500/Mon., Endalter 67, ohne Ausschlüsse', praemie: '€89/Mon.', beginn: '01.03.2018', status: 'Aktiv' },
    { kunde: 'Peter Schmidt', kundenId: 'KD00001', typ: 'Wohngebäudeversicherung', versicherer: 'VHV', details: 'Vers.-Summe: €450.000, inkl. Elementar, gleitender Neuwert', praemie: '€450/Jahr', beginn: '15.06.2019', status: 'Aktiv' },
    // Amira König KD00002
    { kunde: 'Amira König', kundenId: 'KD00002', typ: 'Risikolebensversicherung', versicherer: 'ERGO', details: 'Vers.-Summe: €150.000, Laufzeit bis 02/2026', praemie: '€18/Mon.', beginn: '01.02.2016', status: 'Aktiv' },
    { kunde: 'Amira König', kundenId: 'KD00002', typ: 'Berufsunfähigkeitsversicherung', versicherer: 'ERGO', details: 'BU-Rente: €1.800/Mon., Endalter 67', praemie: '€95/Mon.', beginn: '01.09.2015', status: 'Aktiv' },
    { kunde: 'Amira König', kundenId: 'KD00002', typ: 'Unfallversicherung', versicherer: 'Helvetia', details: 'Invalidität €100.000, Progression 350%', praemie: '€180/Jahr', beginn: '01.01.2020', status: 'Aktiv' },
    // Thomas Weber KD00003
    { kunde: 'Thomas Weber', kundenId: 'KD00003', typ: 'Privathaftpflichtversicherung', versicherer: 'ERGO', details: 'Single, €50 Mio. Deckung', praemie: '€65/Jahr', beginn: '01.03.2021', status: 'Aktiv' },
    // Anna Hoffmann KD00004
    { kunde: 'Anna Hoffmann', kundenId: 'KD00004', typ: 'Risikolebensversicherung', versicherer: 'ERGO', details: 'Vers.-Summe: €300.000, Laufzeit bis 2045', praemie: '€25/Mon.', beginn: '01.07.2020', status: 'Aktiv' },
    { kunde: 'Anna Hoffmann', kundenId: 'KD00004', typ: 'Berufsunfähigkeitsversicherung', versicherer: 'Alte Leipziger', details: 'BU-Rente: €2.000/Mon., Endalter 67', praemie: '€110/Mon.', beginn: '01.01.2019', status: 'Aktiv' },
    // Michael Braun KD00005
    { kunde: 'Michael Braun', kundenId: 'KD00005', typ: 'Berufsunfähigkeitsversicherung', versicherer: 'ERGO', details: 'BU-Rente: €3.500/Mon., Endalter 65', praemie: '€220/Mon.', beginn: '01.06.2010', status: 'Aktiv' },
    { kunde: 'Michael Braun', kundenId: 'KD00005', typ: 'Wohngebäudeversicherung', versicherer: 'Axa', details: 'Vers.-Summe: €750.000, inkl. Elementar', praemie: '€680/Jahr', beginn: '01.01.2012', status: 'Aktiv' },
    { kunde: 'Michael Braun', kundenId: 'KD00005', typ: 'Rechtsschutzversicherung', versicherer: 'ERGO', details: 'Premium inkl. Beruf, Verkehr, Privat', praemie: '€380/Jahr', beginn: '01.04.2018', status: 'Aktiv' },
    // Lisa Müller KD00006
    { kunde: 'Lisa Müller', kundenId: 'KD00006', typ: 'Berufsunfähigkeitsversicherung', versicherer: 'ERGO', details: 'BU-Rente: €2.500/Mon., Dienstunfähigkeitsklausel', praemie: '€145/Mon.', beginn: '01.08.2022', status: 'Aktiv' },
    // Matthias Engel KD00007
    { kunde: 'Matthias Engel', kundenId: 'KD00007', typ: 'Berufsunfähigkeitsversicherung', versicherer: 'Allianz', details: 'BU-Rente: €1.200/Mon., Endalter 65 - UNTERDECKT', praemie: '€75/Mon.', beginn: '01.04.2015', status: 'Aktiv' },
    { kunde: 'Matthias Engel', kundenId: 'KD00007', typ: 'Privathaftpflichtversicherung', versicherer: 'ERGO', details: 'Familie, €50 Mio. Deckung', praemie: '€85/Jahr', beginn: '01.01.2018', status: 'Aktiv' },
    // Christian Bauer KD00008
    { kunde: 'Christian Bauer', kundenId: 'KD00008', typ: 'Rechtsschutzversicherung', versicherer: 'ERGO', details: 'Beruf & Privat, €300 SB', praemie: '€280/Jahr', beginn: '01.06.2021', status: 'Aktiv' },
    // Martin Wolf KD00009
    { kunde: 'Martin Wolf', kundenId: 'KD00009', typ: 'Unfallversicherung', versicherer: 'ERGO', details: 'Invalidität €150.000, Progression 500%', praemie: '€320/Jahr', beginn: '01.03.2017', status: 'Aktiv' },
    { kunde: 'Martin Wolf', kundenId: 'KD00009', typ: 'Wohngebäudeversicherung', versicherer: 'VHV', details: 'Vers.-Summe: €380.000, inkl. Elementar', praemie: '€520/Jahr', beginn: '01.07.2016', status: 'Aktiv' },
    // Eva Hartmann KD00010
    { kunde: 'Eva Hartmann', kundenId: 'KD00010', typ: 'Berufsunfähigkeitsversicherung', versicherer: 'ERGO', details: 'BU-Rente: €1.000/Mon., Endalter 67 - Aufstockung empfohlen', praemie: '€68/Mon.', beginn: '01.09.2019', status: 'Aktiv' },
    { kunde: 'Eva Hartmann', kundenId: 'KD00010', typ: 'Betriebshaftpflicht', versicherer: 'Hiscox', details: '€2 Mio. Deckung, Freelancer-Tarif', praemie: '€290/Jahr', beginn: '01.01.2020', status: 'Aktiv' },
    // Neugeschäft-Kunden (Bestandsverträge)
    { kunde: 'Ralf Dietrich', kundenId: 'KD00026', typ: 'Wohngebäudeversicherung', versicherer: 'AXA', details: 'Vers.-Summe: €380.000, inkl. Elementar', praemie: '€420/Jahr', beginn: '01.05.2020', status: 'Aktiv' },
    { kunde: 'Ingrid Sommer', kundenId: 'KD00027', typ: 'Berufsunfähigkeitsversicherung', versicherer: 'ERGO', details: 'BU-Rente: €1.500/Mon., Endalter 67', praemie: '€92/Mon.', beginn: '01.11.2018', status: 'Aktiv' },
    { kunde: 'Dirk Hoffmann', kundenId: 'KD00028', typ: 'Berufsunfähigkeitsversicherung', versicherer: 'Alte Leipziger', details: 'BU-Rente: €2.200/Mon., Endalter 67', praemie: '€135/Mon.', beginn: '01.02.2017', status: 'Aktiv' },
    { kunde: 'Karin Albrecht', kundenId: 'KD00029', typ: 'Risikolebensversicherung', versicherer: 'ERGO', details: 'Vers.-Summe: €200.000, Laufzeit bis 2042', praemie: '€20/Mon.', beginn: '01.06.2019', status: 'Aktiv' },
    { kunde: 'Bernd Schuster', kundenId: 'KD00030', typ: 'Rechtsschutzversicherung', versicherer: 'ERGO', details: 'Familie, inkl. Beruf & Verkehr', praemie: '€350/Jahr', beginn: '01.01.2021', status: 'Aktiv' },
    { kunde: 'Andrea Haas', kundenId: 'KD00031', typ: 'Privathaftpflichtversicherung', versicherer: 'Allianz', details: 'Single, €50 Mio. Deckung', praemie: '€70/Jahr', beginn: '01.08.2022', status: 'Aktiv' },
    { kunde: 'Holger Friedrich', kundenId: 'KD00032', typ: 'Wohngebäudeversicherung', versicherer: 'Generali', details: 'Vers.-Summe: €300.000, gleitender Neuwert', praemie: '€380/Jahr', beginn: '01.03.2019', status: 'Aktiv' },
    { kunde: 'Sabine Stein', kundenId: 'KD00033', typ: 'Berufsunfähigkeitsversicherung', versicherer: 'HDI', details: 'BU-Rente: €1.800/Mon., Endalter 67', praemie: '€105/Mon.', beginn: '01.07.2020', status: 'Aktiv' },
    { kunde: 'Norbert Keller', kundenId: 'KD00034', typ: 'Unfallversicherung', versicherer: 'ERGO', details: 'Invalidität €120.000, Progression 300%', praemie: '€210/Jahr', beginn: '01.04.2018', status: 'Aktiv' },
    { kunde: 'Ulrike Maier', kundenId: 'KD00035', typ: 'Berufsunfähigkeitsversicherung', versicherer: 'Zurich', details: 'BU-Rente: €1.600/Mon., Endalter 67', praemie: '€88/Mon.', beginn: '01.10.2021', status: 'Aktiv' }
];

function generateMockVertraege() {
    var now = new Date();
    var bsNr = 1;

    // ======== BESTAND: Echte Verträge aus Kundendaten ========
    mockBestand = [];
    kundenBestandVertraege.forEach(function(v) {
        var sparte = getSparte(v.typ);
        var jahresbeitrag = parsePraemie(v.praemie);
        var provFaktor = sparte === 'leben' ? 5 : (sparte === 'kranken' ? 3 : (sparte === 'kfz' ? 0.2 : 0.25));
        // Beginn-Datum parsen
        var bParts = v.beginn.split('.');
        var beginnDate = new Date(parseInt(bParts[2]), parseInt(bParts[1]) - 1, parseInt(bParts[0]));
        var laufzeit = now.getFullYear() - beginnDate.getFullYear();
        mockBestand.push({
            vertragsnr: 'BS-' + bParts[2] + '-' + String(bsNr++).padStart(3, '0'),
            kunde: v.kunde, kundenId: v.kundenId,
            sparte: sparte, sparteLabel: spartenLabels[sparte],
            produkt: v.typ, versicherer: v.versicherer,
            jahresbeitrag: jahresbeitrag, status: v.status,
            vertragsbeginn: beginnDate, vertragsbeginnStr: v.beginn,
            zahlweise: parseZahlweise(v.praemie),
            provision: Math.floor(jahresbeitrag * provFaktor),
            hauptfaelligkeit: '01.01.' + (now.getFullYear() + 1),
            laufzeit: laufzeit + ' Jahre',
            details: v.details
        });
    });

    // ======== NEUGESCHÄFT: Neue Verträge für bestehende Kunden (letzte 90 Tage) ========
    mockNeugeschaeft = [];
    var ngVertraege = [
        { kunde: 'Ralf Dietrich', kundenId: 'KD00026', typ: 'Berufsunfähigkeitsversicherung', versicherer: 'HDI', details: 'BU-Rente: €2.000/Mon., Endalter 67', praemie: '€125/Mon.', daysAgo: 5, status: 'Policiert' },
        { kunde: 'Ralf Dietrich', kundenId: 'KD00026', typ: 'Privathaftpflichtversicherung', versicherer: 'HDI', details: 'Familie, €50 Mio. Deckung', praemie: '€85/Jahr', daysAgo: 5, status: 'Policiert' },
        { kunde: 'Ingrid Sommer', kundenId: 'KD00027', typ: 'Zahnzusatzversicherung', versicherer: 'DKV', details: 'Zahnersatz 90%, Prophylaxe 100%', praemie: '€32/Mon.', daysAgo: 8, status: 'Policiert' },
        { kunde: 'Ingrid Sommer', kundenId: 'KD00027', typ: 'Hausratversicherung', versicherer: 'Allianz', details: 'Vers.-Summe: €65.000, inkl. Fahrrad', praemie: '€130/Jahr', daysAgo: 12, status: 'Policiert' },
        { kunde: 'Dirk Hoffmann', kundenId: 'KD00028', typ: 'Kfz-Versicherung', versicherer: 'HUK-Coburg', details: 'Kfz-Vollkasko, SF-Klasse 8, BMW 3er', praemie: '€980/Jahr', daysAgo: 10, status: 'Antrag' },
        { kunde: 'Dirk Hoffmann', kundenId: 'KD00028', typ: 'Rechtsschutzversicherung', versicherer: 'ARAG', details: 'Familie, inkl. Beruf & Verkehr', praemie: '€420/Jahr', daysAgo: 18, status: 'Policiert' },
        { kunde: 'Karin Albrecht', kundenId: 'KD00029', typ: 'Unfallversicherung', versicherer: 'Zurich', details: 'Familie, Invalidität €200.000', praemie: '€280/Jahr', daysAgo: 15, status: 'Policiert' },
        { kunde: 'Karin Albrecht', kundenId: 'KD00029', typ: 'Pflegezusatzversicherung', versicherer: 'Signal Iduna', details: 'Pflege-Bahr, €600/Mon.', praemie: '€45/Mon.', daysAgo: 20, status: 'Policiert' },
        { kunde: 'Bernd Schuster', kundenId: 'KD00030', typ: 'Wohngebäudeversicherung', versicherer: 'VHV', details: 'Vers.-Summe: €520.000, inkl. Elementar', praemie: '€580/Jahr', daysAgo: 22, status: 'Policiert' },
        { kunde: 'Andrea Haas', kundenId: 'KD00031', typ: 'Krankentagegeld', versicherer: 'DKV', details: 'Ab 43. Tag, €100/Tag', praemie: '€55/Mon.', daysAgo: 25, status: 'Policiert' },
        { kunde: 'Andrea Haas', kundenId: 'KD00031', typ: 'Berufsunfähigkeitsversicherung', versicherer: 'Nürnberger', details: 'BU-Rente: €1.800/Mon., Endalter 67', praemie: '€98/Mon.', daysAgo: 30, status: 'Antrag' },
        { kunde: 'Holger Friedrich', kundenId: 'KD00032', typ: 'Kfz-Versicherung', versicherer: 'VHV', details: 'Kfz-Teilkasko, VW Passat', praemie: '€480/Jahr', daysAgo: 35, status: 'Policiert' },
        { kunde: 'Sabine Stein', kundenId: 'KD00033', typ: 'Risikolebensversicherung', versicherer: 'ERGO', details: 'Vers.-Summe: €250.000, Laufzeit bis 2050', praemie: '€22/Mon.', daysAgo: 38, status: 'Policiert' },
        { kunde: 'Norbert Keller', kundenId: 'KD00034', typ: 'Hausratversicherung', versicherer: 'Generali', details: 'Vers.-Summe: €60.000, Single', praemie: '€110/Jahr', daysAgo: 42, status: 'Policiert' },
        { kunde: 'Norbert Keller', kundenId: 'KD00034', typ: 'Krankenversicherung Zusatz', versicherer: 'Debeka', details: 'Heilpraktiker & Sehhilfen', praemie: '€28/Mon.', daysAgo: 45, status: 'Policiert' },
        { kunde: 'Ulrike Maier', kundenId: 'KD00035', typ: 'Unfallversicherung', versicherer: 'Helvetia', details: 'Invalidität €150.000, Progression 350%', praemie: '€220/Jahr', daysAgo: 50, status: 'Policiert' },
        { kunde: 'Ulrike Maier', kundenId: 'KD00035', typ: 'Privathaftpflichtversicherung', versicherer: 'Allianz', details: 'Single mit Partner, €50 Mio.', praemie: '€75/Jahr', daysAgo: 55, status: 'Policiert' }
    ];

    ngVertraege.forEach(function(v, i) {
        var sparte = getSparte(v.typ);
        var jahresbeitrag = parsePraemie(v.praemie);
        var antragDate = new Date(now); antragDate.setDate(antragDate.getDate() - v.daysAgo);
        var provFaktor = sparte === 'leben' ? 5 : (sparte === 'kranken' ? 3 : (sparte === 'kfz' ? 0.2 : 0.25));
        mockNeugeschaeft.push({
            vertragsnr: 'NG-' + now.getFullYear() + '-' + String(i + 1).padStart(3, '0'),
            kunde: v.kunde, kundenId: v.kundenId,
            sparte: sparte, sparteLabel: spartenLabels[sparte],
            produkt: v.typ, versicherer: v.versicherer,
            jahresbeitrag: jahresbeitrag, status: v.status,
            antragsdatum: antragDate, antragsdatumStr: fmtDatum(antragDate),
            zahlweise: parseZahlweise(v.praemie),
            provision: Math.floor(jahresbeitrag * provFaktor),
            vertragsbeginn: antragDate, vertragsbeginnStr: fmtDatum(antragDate),
            hauptfaelligkeit: '01.01.' + (now.getFullYear() + 1),
            laufzeit: '1 Jahr',
            details: v.details
        });
    });

    // ======== STORNO: Stornierte Verträge für reale Kunden ========
    mockStorno = [];
    // Storno-Verträge: bewusst ANDERE Kunden als auf der A-02 Übersicht
    var stVertraege = [
        { kunde: 'Herbert Lange', kundenId: 'KD00015', typ: 'Kfz-Versicherung', versicherer: 'HUK-Coburg', details: 'Kfz-Haftpflicht, alter Vertrag', praemie: '€580/Jahr', daysAgo: 30, grund: 'Wettbewerber', frueh: false },
        { kunde: 'Sandra Richter', kundenId: 'KD00016', typ: 'Hausratversicherung', versicherer: 'AXA', details: 'Vers.-Summe: €40.000', praemie: '€120/Jahr', daysAgo: 60, grund: 'Kein Bedarf mehr', frueh: false },
        { kunde: 'Frank Zimmermann', kundenId: 'KD00017', typ: 'Unfallversicherung', versicherer: 'Zurich', details: 'Basis-Tarif, Invalidität €50.000', praemie: '€150/Jahr', daysAgo: 15, grund: 'Preis / zu teuer', frueh: true },
        { kunde: 'Monika Schwarz', kundenId: 'KD00018', typ: 'Privathaftpflichtversicherung', versicherer: 'HDI', details: 'Alter Tarif, €10 Mio. Deckung', praemie: '€95/Jahr', daysAgo: 90, grund: 'Wettbewerber', frueh: false },
        { kunde: 'Werner Krüger', kundenId: 'KD00019', typ: 'Rechtsschutzversicherung', versicherer: 'ARAG', details: 'Privat, €500 SB', praemie: '€240/Jahr', daysAgo: 45, grund: 'Preis / zu teuer', frueh: true },
        { kunde: 'Birgit Neumann', kundenId: 'KD00020', typ: 'Zahnzusatzversicherung', versicherer: 'DKV', details: 'Zahnersatz 60%', praemie: '€22/Mon.', daysAgo: 25, grund: 'Leistung unzureichend', frueh: true },
        { kunde: 'Jürgen Fischer', kundenId: 'KD00021', typ: 'Kfz-Versicherung', versicherer: 'Allianz', details: 'Teilkasko, BMW 3er', praemie: '€380/Jahr', daysAgo: 75, grund: 'Wettbewerber', frueh: false },
        { kunde: 'Klaus Wagner', kundenId: 'KD00022', typ: 'Berufsunfähigkeitsversicherung', versicherer: 'Generali', details: 'BU-Rente: €800/Mon.', praemie: '€180/Mon.', daysAgo: 120, grund: 'Finanzielle Gründe', frueh: true },
        { kunde: 'Petra Schneider', kundenId: 'KD00023', typ: 'Rechtsschutzversicherung', versicherer: 'ERGO', details: 'Privat & Beruf', praemie: '€260/Jahr', daysAgo: 100, grund: 'Kein Bedarf mehr', frueh: false },
        { kunde: 'Stefan Becker', kundenId: 'KD00024', typ: 'Kfz-Versicherung', versicherer: 'VHV', details: 'Kfz-Haftpflicht, Zweitwagen', praemie: '€350/Jahr', daysAgo: 40, grund: 'Preis / zu teuer', frueh: true },
        { kunde: 'Susanne Vogel', kundenId: 'KD00025', typ: 'Zahnzusatzversicherung', versicherer: 'Allianz', details: 'Zahnersatz 70%, Prophylaxe', praemie: '€28/Mon.', daysAgo: 150, grund: 'Leistung unzureichend', frueh: false }
    ];

    stVertraege.forEach(function(v, i) {
        var sparte = getSparte(v.typ);
        var jahresbeitrag = parsePraemie(v.praemie);
        var stornoDate = new Date(now); stornoDate.setDate(stornoDate.getDate() - v.daysAgo);
        var provFaktor = sparte === 'leben' ? 5 : (sparte === 'kranken' ? 3 : (sparte === 'kfz' ? 0.2 : 0.25));
        mockStorno.push({
            vertragsnr: 'ST-' + now.getFullYear() + '-' + String(i + 1).padStart(3, '0'),
            kunde: v.kunde, kundenId: v.kundenId,
            sparte: sparte, sparteLabel: spartenLabels[sparte],
            produkt: v.typ, versicherer: v.versicherer,
            jahresbeitrag: jahresbeitrag, status: 'Storniert',
            stornodatum: stornoDate, stornodatumStr: fmtDatum(stornoDate),
            stornogrund: v.grund,
            stornoTyp: v.frueh ? 'Frühstorno' : 'Spätstorno',
            stornoTypClass: v.frueh ? 'frueh' : 'spaet',
            zahlweise: parseZahlweise(v.praemie),
            provision: Math.floor(jahresbeitrag * provFaktor),
            vertragsbeginn: stornoDate, vertragsbeginnStr: fmtDatum(stornoDate),
            hauptfaelligkeit: '-',
            laufzeit: '-',
            details: v.details
        });
    });
}

function fillNeugeschaeftTable() {
    var tb = document.getElementById('neugeschaeftTableBody');
    if (!tb) return;

    // Nach Kunden gruppieren
    var kundenMap = {};
    var kundenOrder = [];
    mockNeugeschaeft.forEach(function(v, i) {
        v._ngIdx = i;
        if (!kundenMap[v.kundenId]) {
            kundenMap[v.kundenId] = { kunde: v.kunde, kundenId: v.kundenId, vertraege: [] };
            kundenOrder.push(v.kundenId);
        }
        kundenMap[v.kundenId].vertraege.push(v);
    });

    var html = '';
    kundenOrder.forEach(function(kid) {
        var g = kundenMap[kid];
        var anzahl = g.vertraege.length;
        var gesamtBeitrag = g.vertraege.reduce(function(s, v) { return s + v.jahresbeitrag; }, 0);
        html += '<tr class="ng-kunde-header-row" data-kundenid="' + kid + '">' +
            '<td colspan="6"><strong>' + g.kunde + '</strong> <span class="ng-kunde-meta">' + kid + ' &middot; ' + anzahl + ' Vertrag' + (anzahl > 1 ? 'e' : '') + ' &middot; Gesamt: ' + fmtEuro(gesamtBeitrag) + '</span></td>' +
            '</tr>';
        g.vertraege.forEach(function(v) {
            var statusClass = v.status === 'Policiert' ? 'active' : (v.status === 'Abgelehnt' ? 'storniert' : 'antrag');
            html += '<tr class="clickable-row" data-sparte="' + v.sparte + '" data-kundenid="' + kid + '" onclick="openVertragDetail(' + v._ngIdx + ',\'ng\')">' +
                '<td>' + v.vertragsnr + '</td>' +
                '<td><span class="sparten-badge ' + v.sparte + '">' + v.sparteLabel + '</span> ' + v.produkt + '</td>' +
                '<td>' + v.versicherer + '</td>' +
                '<td><strong>' + fmtEuro(v.jahresbeitrag) + '</strong> <span class="ng-zahlweise-label">' + v.zahlweise + '</span></td>' +
                '<td><span class="status-badge ' + statusClass + '">' + v.status + '</span></td>' +
                '<td>' + v.antragsdatumStr + '</td>' +
                '</tr>';
        });
    });
    tb.innerHTML = html;
}

function fillBestandTable() {
    var tb = document.getElementById('bestandTableBody');
    if (!tb) return;
    tb.innerHTML = mockBestand.map(function(v, i) {
        var statusClass = v.status === 'Aktiv' ? 'active' : 'ruhend';
        return '<tr class="clickable-row" data-sparte="' + v.sparte + '" onclick="openVertragDetail(' + i + ',\'bs\')">' +
            '<td>' + v.vertragsnr + '</td>' +
            '<td><strong>' + v.kunde + '</strong></td>' +
            '<td>' + v.kundenId + '</td>' +
            '<td><span class="sparten-badge ' + v.sparte + '">' + v.sparteLabel + '</span></td>' +
            '<td>' + v.produkt + '</td>' +
            '<td><strong>' + fmtEuro(v.jahresbeitrag) + '</strong></td>' +
            '<td>' + v.vertragsbeginnStr + '</td>' +
            '<td><span class="status-badge ' + statusClass + '">' + v.status + '</span></td></tr>';
    }).join('');
}

function fillStornoTable() {
    var tb = document.getElementById('stornoTableBody');
    if (!tb) return;
    tb.innerHTML = mockStorno.map(function(v, i) {
        return '<tr class="clickable-row" data-stornotyp="' + v.stornoTypClass + '" data-sparte="' + v.sparte + '" onclick="openVertragDetail(' + i + ',\'st\')">' +
            '<td>' + v.vertragsnr + '</td>' +
            '<td><strong>' + v.kunde + '</strong></td>' +
            '<td>' + v.kundenId + '</td>' +
            '<td><span class="sparten-badge ' + v.sparte + '">' + v.sparteLabel + '</span></td>' +
            '<td>' + v.produkt + '</td>' +
            '<td><strong>' + fmtEuro(v.jahresbeitrag) + '</strong></td>' +
            '<td>' + v.stornodatumStr + '</td>' +
            '<td>' + v.stornogrund + '</td>' +
            '<td><span class="storno-typ-badge ' + v.stornoTypClass + '">' + v.stornoTyp + '</span></td></tr>';
    }).join('');
}

function filterVertraegeSparte(tabName, sparte) {
    var section = document.getElementById('tab-' + tabName);
    if (!section) return;
    section.querySelectorAll('.fida-filter-btn').forEach(function(b) { b.classList.remove('active'); });
    var clicked = section.querySelector('.fida-filter-btn[data-filter="' + sparte + '"]');
    if (clicked) clicked.classList.add('active');

    var rows = section.querySelectorAll('tbody tr');
    if (tabName === 'neugeschaeft') {
        // Tabelle mit Kunden-Header-Rows
        var visibleKunden = {};
        rows.forEach(function(row) {
            if (row.classList.contains('ng-kunde-header-row')) return;
            if (sparte === 'alle') { row.style.display = ''; visibleKunden[row.getAttribute('data-kundenid')] = true; }
            else {
                var match = row.getAttribute('data-sparte') === sparte;
                row.style.display = match ? '' : 'none';
                if (match) visibleKunden[row.getAttribute('data-kundenid')] = true;
            }
        });
        rows.forEach(function(row) {
            if (row.classList.contains('ng-kunde-header-row')) {
                row.style.display = visibleKunden[row.getAttribute('data-kundenid')] ? '' : 'none';
            }
        });
    } else {
        rows.forEach(function(row) {
            if (sparte === 'alle') { row.style.display = ''; }
            else { row.style.display = row.getAttribute('data-sparte') === sparte ? '' : 'none'; }
        });
    }
}

function filterStornoTyp(typ) {
    var section = document.getElementById('tab-storno');
    if (!section) return;
    section.querySelectorAll('.fida-filter-btn').forEach(function(b) { b.classList.remove('active'); });
    var clicked = section.querySelector('.fida-filter-btn[data-filter="' + typ + '"]');
    if (clicked) clicked.classList.add('active');
    var rows = section.querySelectorAll('tbody tr');
    rows.forEach(function(row) {
        if (typ === 'alle') { row.style.display = ''; }
        else { row.style.display = row.getAttribute('data-stornotyp') === typ ? '' : 'none'; }
    });
}

function searchVertraege(tabName) {
    var section = document.getElementById('tab-' + tabName);
    if (!section) return;
    var input = section.querySelector('.vertrags-search input');
    if (!input) return;
    var q = input.value.toLowerCase();

    var rows = section.querySelectorAll('tbody tr');
    if (tabName === 'neugeschaeft') {
        var visibleKunden = {};
        rows.forEach(function(row) {
            if (row.classList.contains('ng-kunde-header-row')) return;
            var match = row.textContent.toLowerCase().indexOf(q) >= 0;
            row.style.display = match ? '' : 'none';
            if (match) visibleKunden[row.getAttribute('data-kundenid')] = true;
        });
        // Auch Header-Row nach Kundenname durchsuchen
        rows.forEach(function(row) {
            if (row.classList.contains('ng-kunde-header-row')) {
                if (row.textContent.toLowerCase().indexOf(q) >= 0) {
                    visibleKunden[row.getAttribute('data-kundenid')] = true;
                }
                row.style.display = visibleKunden[row.getAttribute('data-kundenid')] ? '' : 'none';
            }
        });
        // Wenn Kunden-Header matched, alle Verträge dieses Kunden anzeigen
        rows.forEach(function(row) {
            if (!row.classList.contains('ng-kunde-header-row') && visibleKunden[row.getAttribute('data-kundenid')]) {
                row.style.display = '';
            }
        });
    } else {
        rows.forEach(function(row) {
            row.style.display = row.textContent.toLowerCase().indexOf(q) >= 0 ? '' : 'none';
        });
    }
}

// Bestand Zeitraum-Filter
function filterBestandZeitraum(zeitraum) {
    var section = document.getElementById('tab-bestand');
    if (!section) return;
    section.querySelectorAll('.zeitraum-btn').forEach(function(b) { b.classList.remove('active'); });
    if (event && event.target) event.target.classList.add('active');

    var now = new Date();
    var cutoff = null;
    if (zeitraum === '1j') cutoff = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
    else if (zeitraum === '3j') cutoff = new Date(now.getFullYear() - 3, now.getMonth(), now.getDate());
    else if (zeitraum === '5j') cutoff = new Date(now.getFullYear() - 5, now.getMonth(), now.getDate());

    var rows = section.querySelectorAll('#bestandTableBody tr');
    rows.forEach(function(row, idx) {
        if (!cutoff || zeitraum === 'alle') { row.style.display = ''; return; }
        var v = mockBestand[idx];
        if (v && v.vertragsbeginn) {
            row.style.display = v.vertragsbeginn >= cutoff ? '' : 'none';
        }
    });
}
window.filterBestandZeitraum = filterBestandZeitraum;

// Vertragsdetail Modal
function openVertragDetail(idx, typ) {
    var v;
    if (typ === 'ng') v = mockNeugeschaeft[idx];
    else if (typ === 'bs') v = mockBestand[idx];
    else if (typ === 'st') v = mockStorno[idx];
    if (!v) return;

    var modal = document.getElementById('vertragDetailModal');
    if (!modal) { console.error('vertragDetailModal nicht gefunden'); return; }
    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';

    setElementText('vertragDetailTitle', 'Vertrag: ' + v.vertragsnr);
    var statusEl = document.getElementById('vertragDetailStatus');
    if (statusEl) { statusEl.textContent = v.status; statusEl.className = 'vertrag-status-badge status-badge ' + (v.status === 'Policiert' || v.status === 'Aktiv' ? 'active' : (v.status === 'Storniert' ? 'storniert' : 'antrag')); }

    setElementText('vdVertragsnr', v.vertragsnr);
    setElementText('vdSparte', v.sparteLabel);
    setElementText('vdProdukt', v.produkt);
    setElementText('vdVersicherer', v.versicherer);
    setElementText('vdStatus', v.status);
    setElementText('vdJahresbeitrag', fmtEuro(v.jahresbeitrag));
    setElementText('vdZahlweise', v.zahlweise);
    setElementText('vdProvision', fmtEuro(v.provision));
    setElementText('vdBeginn', v.vertragsbeginnStr);
    setElementText('vdFaelligkeit', v.hauptfaelligkeit);
    setElementText('vdLaufzeit', v.laufzeit);
    setElementText('vdKunde', v.kunde);
    setElementText('vdKundenId', v.kundenId);

    var kundeBtn = document.getElementById('vdKundeBtn');
    if (kundeBtn) {
        kundeBtn.onclick = function() { closeVertragDetail(); openKundenDetail(v.kunde, v.kundenId); };
    }

    var stornoSection = document.getElementById('vdStornoSection');
    if (stornoSection) {
        if (typ === 'st') {
            stornoSection.style.display = 'block';
            setElementText('vdStornodatum', v.stornodatumStr);
            setElementText('vdStornogrund', v.stornogrund);
            setElementText('vdStornoTyp', v.stornoTyp);
        } else {
            stornoSection.style.display = 'none';
        }
    }
}

function closeVertragDetail() {
    var modal = document.getElementById('vertragDetailModal');
    if (modal) {
        modal.style.display = 'none';
    }
    document.body.style.overflow = '';
}

// ESC schließt offene Modals
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        closeVertragDetail();
        if (typeof closeTarifvergleich === 'function') closeTarifvergleich();
    }
});

window.openVertragDetail = openVertragDetail;
window.closeVertragDetail = closeVertragDetail;
window.filterVertraegeSparte = filterVertraegeSparte;
window.filterStornoTyp = filterStornoTyp;
window.searchVertraege = searchVertraege;

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

/**
 * Setzt alle Demo-Daten zurück (localStorage löschen + Seite neu laden)
 */
function resetDemoData() {
    localStorage.clear();
    location.reload();
}
window.resetDemoData = resetDemoData;

// Dynamische Daten auch bei direktem Seitenaufruf setzen
document.addEventListener('DOMContentLoaded', function() {
    setTimeout(updateDynamicDates, 200);
});
