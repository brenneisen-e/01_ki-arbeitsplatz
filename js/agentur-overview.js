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

    // Cockpit-KPIs (Gesamtbestand etc.) nur in Übersicht anzeigen
    var cockpitKpis = document.querySelector('.cockpit-kpis:not(#maklerKpis):not(#mrhKpis):not([id^="bank"])');
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

    // Nach Kunden gruppieren (wie Neugeschäft)
    var kundenMap = {};
    var kundenOrder = [];
    mockBestand.forEach(function(v, i) {
        v._bsIdx = i;
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
            var statusClass = v.status === 'Aktiv' ? 'active' : 'ruhend';
            html += '<tr class="clickable-row" data-sparte="' + v.sparte + '" data-kundenid="' + kid + '" data-bs-idx="' + v._bsIdx + '" onclick="openVertragDetail(' + v._bsIdx + ',\'bs\')">' +
                '<td>' + v.vertragsnr + '</td>' +
                '<td><span class="sparten-badge ' + v.sparte + '">' + v.sparteLabel + '</span> ' + v.produkt + '</td>' +
                '<td>' + v.versicherer + '</td>' +
                '<td><strong>' + fmtEuro(v.jahresbeitrag) + '</strong> <span class="ng-zahlweise-label">' + v.zahlweise + '</span></td>' +
                '<td>' + v.vertragsbeginnStr + '</td>' +
                '<td><span class="status-badge ' + statusClass + '">' + v.status + '</span></td></tr>';
        });
    });
    tb.innerHTML = html;
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
    if (tabName === 'neugeschaeft' || tabName === 'bestand') {
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
    if (tabName === 'neugeschaeft' || tabName === 'bestand') {
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
    var visibleKunden = {};
    rows.forEach(function(row) {
        if (row.classList.contains('ng-kunde-header-row')) return;
        if (!cutoff || zeitraum === 'alle') {
            row.style.display = '';
            visibleKunden[row.getAttribute('data-kundenid')] = true;
            return;
        }
        var bsIdx = parseInt(row.getAttribute('data-bs-idx'));
        var v = mockBestand[bsIdx];
        if (v && v.vertragsbeginn) {
            var match = v.vertragsbeginn >= cutoff;
            row.style.display = match ? '' : 'none';
            if (match) visibleKunden[row.getAttribute('data-kundenid')] = true;
        }
    });
    rows.forEach(function(row) {
        if (row.classList.contains('ng-kunde-header-row')) {
            row.style.display = visibleKunden[row.getAttribute('data-kundenid')] ? '' : 'none';
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

    // Hide agentur-specific elements
    const agenturOverview = document.getElementById('agenturOverview');
    if (agenturOverview) agenturOverview.style.display = 'none';
    hideAgenturChat();

    // Use the comprehensive landing reset (handles module tabs, welcome chat, zoom, etc.)
    if (typeof backToLanding === 'function') {
        backToLanding();
    } else {
        // Fallback if backToLanding not yet loaded
        const landingPage = document.getElementById('landingPage');
        if (landingPage) landingPage.style.display = 'flex';
        if (window.AppRouter) AppRouter.navigate('/landing');
    }
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
        } else if (typeof viewMode !== 'undefined' && (viewMode === 'bank-retail' || viewMode === 'bank-fk' || viewMode === 'bank-vw')) {
            potentiale = [
                {
                    name: 'Klaus Fischer',
                    title: 'Anschlussfinanzierung DZ HYP',
                    desc: 'Zinsbindung läuft 09/2026 aus. Restschuld €185.000 – Forward-Darlehen anbieten'
                },
                {
                    name: 'Sandra Müller',
                    title: 'VR-FinanzPlan fehlt',
                    desc: 'Premium-Kundin ohne ganzheitliche Beratung – Cross-Selling-Potential €1.800'
                },
                {
                    name: 'Stefan Braun',
                    title: 'Kontokonsolidierung (FIDA)',
                    desc: 'Hauptkonto bei N26 + Depots extern – VR-MeinDepot + Wero als Einstieg'
                },
                {
                    name: 'Julia Becker',
                    title: 'Altersvorsorge fehlt',
                    desc: 'NPS 6, kein FinanzPlan – UniProfiRente + R+V BU empfehlen'
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
                            } else if (typeof viewMode !== 'undefined' && (viewMode === 'bank-retail' || viewMode === 'bank-fk' || viewMode === 'bank-vw')) {
                                if (typeof showBeraterTab === 'function') showBeraterTab('potentiale');
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

// ── BERATER / BANKING MODULE (merged from berater-overview.js) ──

/* ============================================================
   B-02 BERATER-UEBERSICHT  –  Banking Edition
   Mirrors agentur-overview.js (A-02) structure exactly
   ============================================================ */

// ── STATE ──
var bankViewMode = localStorage.getItem('bankViewMode') || 'retail';
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
var bankKundenRetail = [
    { name:'Klaus Fischer',    id:'KDB001', geb:'12.05.1978', beruf:'Maschinenbau-Ingenieur', ort:'Gießen',     segment:'Premium',  produkte:6, ertrag:4850,  finanzplan:true,  letztKontakt:'28.02.2026', avatarBg:'#2563eb', nps:9,  kinder:[{name:'Lukas',alter:12},{name:'Emma',alter:9}], email:'k.fischer@email.de', telefon:'+49 641 98765', adresse:'Hauptstraße 45, 35390 Gießen', arbeitgeber:'Continental AG', familienstand:'Verheiratet', risikoscore:28, bonitaet:82 },
    { name:'Sandra Müller',    id:'KDB002', geb:'23.11.1985', beruf:'Ärztin',                ort:'Wetzlar',    segment:'Premium',  produkte:4, ertrag:3200,  finanzplan:false, letztKontakt:'25.02.2026', avatarBg:'#9333ea', nps:7,  kinder:[{name:'Mia',alter:4}], email:'s.mueller@email.de', telefon:'+49 6441 55432', adresse:'Bahnhofstr. 12, 35578 Wetzlar', arbeitgeber:'Uniklinik Gießen', familienstand:'Ledig', risikoscore:15, bonitaet:91 },
    { name:'Markus Wagner',    id:'KDB003', geb:'08.03.1972', beruf:'Lehrer',                 ort:'Marburg',    segment:'Standard', produkte:3, ertrag:1800,  finanzplan:true,  letztKontakt:'20.02.2026', avatarBg:'#16a34a', nps:8,  kinder:[{name:'Tim',alter:14},{name:'Jana',alter:11}], email:'m.wagner@email.de', telefon:'+49 6421 77890', adresse:'Schulstr. 8, 35037 Marburg', arbeitgeber:'Land Hessen', familienstand:'Verheiratet', risikoscore:22, bonitaet:75 },
    { name:'Julia Becker',     id:'KDB004', geb:'15.07.1990', beruf:'Marketing-Managerin',    ort:'Gießen',     segment:'Potenzial',produkte:2, ertrag:980,   finanzplan:false, letztKontakt:'18.02.2026', avatarBg:'#f59e0b', nps:6,  kinder:[], email:'j.becker@email.de', telefon:'+49 641 33210', adresse:'Ludwigstr. 22, 35390 Gießen', arbeitgeber:'Amazon DE', familienstand:'Ledig', risikoscore:18, bonitaet:88 },
    { name:'Peter Hoffmann',   id:'KDB005', geb:'30.01.1970', beruf:'Steuerberater',          ort:'Wetzlar',    segment:'Premium',  produkte:8, ertrag:6200,  finanzplan:true,  letztKontakt:'15.02.2026', avatarBg:'#dc2626', nps:9,  kinder:[{name:'Fabian',alter:22},{name:'Laura',alter:19}], email:'p.hoffmann@email.de', telefon:'+49 6441 88456', adresse:'Friedrichstr. 5, 35578 Wetzlar', arbeitgeber:'Selbständig', familienstand:'Verheiratet', risikoscore:35, bonitaet:79 },
    { name:'Andrea Lang',      id:'KDB006', geb:'05.09.1982', beruf:'Steuerberaterin',        ort:'Lich',       segment:'Standard', produkte:5, ertrag:2400,  finanzplan:true,  letztKontakt:'12.02.2026', avatarBg:'#6366f1', nps:8,  kinder:[{name:'Sophie',alter:7}], email:'a.lang@email.de', telefon:'+49 6404 12345', adresse:'Marktplatz 3, 35423 Lich', arbeitgeber:'Kanzlei Lang & Partner', familienstand:'Geschieden', risikoscore:20, bonitaet:85 },
    { name:'Thomas Klein',     id:'KDB007', geb:'18.12.1968', beruf:'Handwerksmeister',       ort:'Buseck',     segment:'Standard', produkte:4, ertrag:1650,  finanzplan:false, letztKontakt:'10.02.2026', avatarBg:'#0891b2', nps:7,  kinder:[{name:'Max',alter:16}], email:'t.klein@email.de', telefon:'+49 6408 99123', adresse:'Am Anger 7, 35418 Buseck', arbeitgeber:'Klein Sanitär GmbH', familienstand:'Verheiratet', risikoscore:42, bonitaet:68 },
    { name:'Monika Richter',   id:'KDB008', geb:'22.04.1975', beruf:'Lehrerin',               ort:'Gießen',     segment:'Standard', produkte:3, ertrag:1200,  finanzplan:true,  letztKontakt:'08.02.2026', avatarBg:'#d946ef', nps:8,  kinder:[{name:'Anna',alter:10},{name:'Felix',alter:7}], email:'m.richter@email.de', telefon:'+49 641 44567', adresse:'Goethering 15, 35390 Gießen', arbeitgeber:'Land Hessen', familienstand:'Verheiratet', risikoscore:12, bonitaet:80 },
    { name:'Stefan Braun',     id:'KDB009', geb:'11.06.1988', beruf:'IT-Consultant',          ort:'Marburg',    segment:'Potenzial',produkte:2, ertrag:750,   finanzplan:false, letztKontakt:'05.02.2026', avatarBg:'#ea580c', nps:5,  kinder:[], email:'s.braun@email.de', telefon:'+49 6421 55678', adresse:'Technikstr. 20, 35037 Marburg', arbeitgeber:'SAP SE', familienstand:'Ledig', risikoscore:10, bonitaet:92 },
    { name:'Katharina Wolf',   id:'KDB010', geb:'03.03.1988', beruf:'Architektin',            ort:'Gießen',     segment:'Standard', produkte:5, ertrag:2100,  finanzplan:true,  letztKontakt:'01.02.2026', avatarBg:'#059669', nps:9,  kinder:[{name:'Lara',alter:3}], email:'k.wolf@email.de', telefon:'+49 641 77890', adresse:'Schillerstr. 9, 35390 Gießen', arbeitgeber:'Wolf Architekten', familienstand:'Verheiratet', risikoscore:25, bonitaet:84 },
    { name:'Jürgen Peters',    id:'KDB011', geb:'14.10.1965', beruf:'Geschäftsführer',        ort:'Wetzlar',    segment:'Premium',  produkte:7, ertrag:5100,  finanzplan:true,  letztKontakt:'28.01.2026', avatarBg:'#7c3aed', nps:8,  kinder:[{name:'Stefan',alter:28},{name:'Maria',alter:25}], email:'j.peters@email.de', telefon:'+49 6441 33789', adresse:'Industriestr. 18, 35578 Wetzlar', arbeitgeber:'Peters Metallbau GmbH', familienstand:'Verheiratet', risikoscore:30, bonitaet:76 },
    { name:'Sabine Kraus',     id:'KDB012', geb:'27.08.1979', beruf:'Apothekerin',            ort:'Lich',       segment:'Standard', produkte:4, ertrag:1900,  finanzplan:false, letztKontakt:'25.01.2026', avatarBg:'#be185d', nps:7,  kinder:[{name:'Paul',alter:8},{name:'Clara',alter:5}], email:'s.kraus@email.de', telefon:'+49 6404 66789', adresse:'Apothekenstr. 2, 35423 Lich', arbeitgeber:'Löwen-Apotheke', familienstand:'Verheiratet', risikoscore:18, bonitaet:87 }
];

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
