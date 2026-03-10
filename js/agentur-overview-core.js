(function(){var r=['getAgenturData','kpiDefinitions'];var m=r.filter(function(f){return typeof window[f]==='undefined'});if(m.length)console.debug('[agentur-overview-core.js] Fehlende Deps:',m.join(', '),'← Lade config.js, data.js zuerst!');})();
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
    // Hide B-02/B-10 Banking Berater
    var beraterPageAO = document.getElementById('beraterOverviewPage');
    if (beraterPageAO) beraterPageAO.style.display = 'none';
    var kdBankPageAO = document.getElementById('kundenDetailBankPage');
    if (kdBankPageAO) kdBankPageAO.style.display = 'none';
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

        // OPT-14: Render Widget Dashboard
        if (typeof renderDashboardWidgets === 'function') {
            renderDashboardWidgets('widgetGrid');
        }
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

    // Banking Termine Tag 1-2: übermorgen, +3 Tage
    for (var bi = 1; bi <= 2; bi++) {
        var bEl = document.getElementById('beraterTerminTag' + bi);
        if (bEl) {
            var bd = new Date(now);
            bd.setDate(bd.getDate() + bi + 1);
            bEl.textContent = fmtTag(bd);
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

    // FIDA Consent-Daten dynamisch berechnen
    // Consent erteilt: 10 Monate vor heute, Gültig bis: +24 Monate ab Erteilung (FIDA max. Laufzeit)
    var consentErteilt = new Date(now.getFullYear(), now.getMonth() - 10, now.getDate());
    var consentGueltig = new Date(consentErteilt.getFullYear(), consentErteilt.getMonth() + 24, consentErteilt.getDate());
    function fmtDatum(d) {
        return String(d.getDate()).padStart(2, '0') + '.' + String(d.getMonth() + 1).padStart(2, '0') + '.' + d.getFullYear();
    }
    document.querySelectorAll('[data-dynamic-date="fida-consent-erteilt"]').forEach(function(el) {
        el.textContent = fmtDatum(consentErteilt);
    });
    document.querySelectorAll('[data-dynamic-date="fida-consent-gueltig"]').forEach(function(el) {
        el.textContent = fmtDatum(consentGueltig);
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

    // Unified Potentiale rendering (UNIFY-01)
    if (tabName === 'potential' && typeof renderUnifiedPotentiale === 'function') {
        // Ensure Versicherung mode is active for A-02
        if (typeof setMode === 'function') setMode('versicherung');
        renderUnifiedPotentiale('unifiedPotentialeA02');
    }

    // Cockpit-KPIs (Gesamtbestand etc.) nur in Übersicht anzeigen
    var cockpitKpis = document.querySelector('.cockpit-kpis:not(#maklerKpis):not(#mrhKpis):not([id^="bank"])');
    if (cockpitKpis) {
        cockpitKpis.style.display = (tabName === 'uebersicht') ? '' : 'none';
    }

    // OPT-01: Tagesstart rendering
    if (tabName === 'uebersicht' && typeof renderTagesstart === 'function') {
        renderTagesstart('tagesstartCardA02', 'versicherung');
    }
    // OPT-14: Refresh Widget Dashboard on tab switch
    if (tabName === 'uebersicht' && typeof renderDashboardWidgets === 'function') {
        renderDashboardWidgets('widgetGrid');
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
    const savedPhoto = safeLocalGet('agenturPhoto', null);
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
// OPT-01: INTELLIGENTER TAGESSTART
// ========================================

function renderTagesstart(targetId, mode) {
    var container = document.getElementById(targetId);
    if (!container) return;
    if (container.querySelector('.tagesstart-card')) return; // Already rendered

    var isBanking = mode === 'banking';
    var now = new Date();
    var tage = ['Sonntag', 'Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag'];
    var monate = ['Januar', 'Februar', 'März', 'April', 'Mai', 'Juni', 'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'];
    var datumStr = tage[now.getDay()] + ', ' + now.getDate() + '. ' + monate[now.getMonth()] + ' ' + now.getFullYear();

    var gruss = 'Guten Morgen';
    var h = now.getHours();
    if (h >= 12 && h < 17) gruss = 'Guten Tag';
    if (h >= 17) gruss = 'Guten Abend';

    var items;
    if (isBanking) {
        items = [
            { icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>', label: '3 Termine heute', detail: 'Klaus Fischer 10:00, Sandra Müller 14:00, Markus Wagner 16:30', type: 'termin' },
            { icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>', label: '5 neue Impulse', detail: 'Anschlussfinanzierung Fischer, VR-FinanzPlan Müller, Depot-Eröffnung Wagner', type: 'impuls' },
            { icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18"><path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>', label: '2 Aufgaben offen', detail: 'FIDA-Consent erneuern (Fischer), R+V Rückruf (Lehmann)', type: 'aufgabe' },
            { icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>', label: 'Ertrag MTD: €8.450', detail: 'Zielerreichung 78% — noch €2.350 bis Monatsziel', type: 'target' }
        ];
    } else {
        items = [
            { icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>', label: '4 Termine heute', detail: 'Schmidt 09:30, König 11:00, Braun 14:00, Lehmann 16:00', type: 'termin' },
            { icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>', label: '8 offene Potentiale', detail: '3 hohe Priorität: Risikoleben Schmidt, BU König, Kfz-Wechsel Braun', type: 'impuls' },
            { icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18"><path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>', label: '3 Follow-ups fällig', detail: 'Angebot nachfassen Schmidt, Termin bestätigen König, Vertragssendung Braun', type: 'aufgabe' },
            { icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>', label: 'Neugeschäft MTD: €12.450', detail: 'Zielerreichung 62% — 14 Arbeitstage verbleibend', type: 'target' }
        ];
    }

    var html = '<div class="tagesstart-card">' +
        '<div class="tagesstart-header">' +
            '<div class="tagesstart-greeting">' +
                '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="24" height="24"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>' +
                '<div>' +
                    '<div class="tagesstart-gruss">' + gruss + '</div>' +
                    '<div class="tagesstart-datum">' + datumStr + '</div>' +
                '</div>' +
            '</div>' +
        '</div>' +
        '<div class="tagesstart-items">';

    for (var i = 0; i < items.length; i++) {
        var it = items[i];
        html += '<div class="tagesstart-item tagesstart-type-' + it.type + '">' +
            '<div class="tagesstart-item-icon">' + it.icon + '</div>' +
            '<div class="tagesstart-item-content">' +
                '<div class="tagesstart-item-label">' + it.label + '</div>' +
                '<div class="tagesstart-item-detail">' + it.detail + '</div>' +
            '</div>' +
        '</div>';
    }

    html += '</div></div>';
    container.innerHTML = html;
}
window.renderTagesstart = renderTagesstart;

window.__registerModule('agentur-overview-core.js');
