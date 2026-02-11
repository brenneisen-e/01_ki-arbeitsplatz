// js/kunden-detail.js - Kundendetail-Seite (A-10)
// Mock-Daten, fillKundenDetail, Sticky Bar, Tab Navigation
// Extracted from landing.js for modularity

// KUNDENDETAIL SEITE
// ========================================

// Speichert ob FIDA in der Potentialanalyse aktiv war
let fidaActiveInPotentialAnalyse = false;

// Speichert von welcher View der Nutzer zur Kundendetail-Seite gekommen ist
let previousViewBeforeKundenDetail = 'potentialanalyse';

// Speichert die aktuelle Vermittler-ID in der Kundendetail-Seite
let currentKundenVermittlerId = null;

function openKundenDetail(kundenName, vermittlerId) {
    console.log('Kundendetail öffnen:', kundenName, vermittlerId);

    // Speichere die Vermittler-ID für späteren Zugriff (z.B. Vertriebsbericht)
    currentKundenVermittlerId = vermittlerId || 'VM00001';

    // Prüfe ob FIDA in der Potentialanalyse aktiv ist (mehrere Checks für Zuverlässigkeit)
    const fidaBtn = document.getElementById('fidaBtn');
    const fidaContainer = document.getElementById('fidaContainer');

    // FIDA ist aktiv wenn Container sichtbar ist (display: block)
    const fidaContainerDisplay = fidaContainer ? fidaContainer.style.display : 'none';
    fidaActiveInPotentialAnalyse = (fidaContainerDisplay === 'block');
    console.log('FIDA Check - Container display:', fidaContainerDisplay, '| FIDA aktiv:', fidaActiveInPotentialAnalyse);

    // Speichere von welcher View wir kommen (für korrekten Zurück-Button)
    const agenturOverview = document.getElementById('agenturOverview');
    const potentialAnalyse = document.getElementById('potentialAnalysePage');

    if (agenturOverview && agenturOverview.style.display !== 'none') {
        previousViewBeforeKundenDetail = 'agentursicht';
        console.log('Komme von: Agentursicht');
    } else if (potentialAnalyse && potentialAnalyse.style.display !== 'none') {
        previousViewBeforeKundenDetail = 'potentialanalyse';
        console.log('Komme von: Potentialanalyse');
    }

    // Verstecke alle Seiten
    document.getElementById('landingPage').style.display = 'none';
    document.getElementById('mainApp').style.display = 'none';
    document.getElementById('potentialAnalysePage').style.display = 'none';
    if (agenturOverview) agenturOverview.style.display = 'none';

    // Restore AO tabs if Makler was active
    if (typeof restoreAOKundenDetail === 'function') restoreAOKundenDetail();

    // Zeige Kundendetail-Seite
    const kundenDetail = document.getElementById('kundenDetailPage');
    if (kundenDetail) {
        kundenDetail.style.display = 'block';

        // Setze initiale Makler/AO-Ansicht
        kundenDetail.classList.remove('makler-view', 'ao-view');
        kundenDetail.classList.add(currentVermittlerMode === 'makler' ? 'makler-view' : 'ao-view');

        // Toggle-Buttons auf den aktuellen Modus setzen
        const toggleBtns = document.querySelectorAll('.toggle-option');
        toggleBtns.forEach(btn => {
            btn.classList.remove('active');
            if (btn.dataset.mode === currentVermittlerMode) {
                btn.classList.add('active');
            }
        });

        // Fülle Kundendaten
        fillKundenDetail(kundenName, vermittlerId);

        // Update shared header on A-10
        updateKundenSharedHeader(kundenName, vermittlerId);

        // Aktiviere FIDA in Kundendetail wenn es in Potentialanalyse aktiv war
        initKundenFidaState();

        // Dispatch event for Page ID Tracker
        document.dispatchEvent(new CustomEvent('viewChanged', {
            detail: { module: 'versicherung', view: 'kundendetail' }
        }));
    }
}

// Initialisiert den FIDA-Status in der Kundendetail-Seite
function initKundenFidaState() {
    const fidaDaten = document.getElementById('kundenFidaDaten');
    const fidaBtn = document.getElementById('kundenFidaBtn');

    if (fidaActiveInPotentialAnalyse) {
        // FIDA aktivieren
        if (fidaDaten) fidaDaten.style.display = 'block';
        if (fidaBtn) {
            fidaBtn.classList.add('active');
            fidaBtn.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><circle cx="12" cy="12" r="10"></circle><path d="M12 16v-4"></path><path d="M12 8h.01"></path></svg> Open Finance aktiv';
        }
        console.log('FIDA in Kundendetail aktiviert');
    } else {
        // FIDA deaktivieren (Standard)
        if (fidaDaten) fidaDaten.style.display = 'none';
        if (fidaBtn) {
            fidaBtn.classList.remove('active');
            fidaBtn.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><circle cx="12" cy="12" r="10"></circle><path d="M12 16v-4"></path><path d="M12 8h.01"></path></svg> Open Finance';
        }
    }
}

// Speichert den aktuellen Vermittlermodus (makler/ao)
let currentVermittlerMode = 'ao'; // Default: AO ERGO Makler

// Wechselt zwischen Makler und AO Modus
function switchVermittlerMode(mode) {
    currentVermittlerMode = mode;
    console.log('Vermittlermodus gewechselt zu:', mode);

    // Toggle-Buttons aktualisieren
    const toggleBtns = document.querySelectorAll('.toggle-option');
    toggleBtns.forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.mode === mode) {
            btn.classList.add('active');
        }
    });

    // Produktvorschläge Label aktualisieren
    const label = document.getElementById('produktvorschlaegeLabel');
    if (label) {
        if (mode === 'makler') {
            label.textContent = 'Top-Produktvorschläge (Makler-Vergleich)';
        } else {
            label.textContent = 'ERGO Produktempfehlung (Ausschließlichkeit)';
        }
    }

    // Produktvorschläge anzeigen/verstecken
    const maklerProdukte = document.getElementById('maklerProdukte');
    const aoProdukte = document.getElementById('aoProdukte');

    if (maklerProdukte && aoProdukte) {
        if (mode === 'makler') {
            maklerProdukte.style.display = 'flex';
            aoProdukte.style.display = 'none';
        } else {
            maklerProdukte.style.display = 'none';
            aoProdukte.style.display = 'flex';
        }
    }

    // Bei AO-Modus: Fremdprodukte in der Open Finance Tabelle anpassen
    updateOpenFinanceTable(mode);

    // Makler/AO-Ansicht für Betreute Verträge Tabelle
    const kundenDetailPage = document.getElementById('kundenDetailPage');
    if (kundenDetailPage) {
        kundenDetailPage.classList.remove('makler-view', 'ao-view');
        kundenDetailPage.classList.add(mode === 'makler' ? 'makler-view' : 'ao-view');
    }
}

// Passt die Open Finance Tabelle je nach Modus an
function updateOpenFinanceTable(mode) {
    // Bei AO (ERGO) sollten die ERGO-Produkte ausgeblendet werden
    // da diese als eigene Produkte gelten und nicht als "Fremdprodukte" angezeigt werden
    console.log('Open Finance Tabelle für Modus:', mode);

    const ergoRows = document.querySelectorAll('tr[data-anbieter="ergo"]');
    const sourceTag = document.querySelector('.fida-source-tag');

    ergoRows.forEach(row => {
        if (mode === 'ao') {
            row.style.display = 'none';
        } else {
            row.style.display = '';
        }
    });

    // Source Tag aktualisieren
    if (sourceTag) {
        if (mode === 'ao') {
            sourceTag.textContent = 'Allianz, HUK24, ARAG (ohne ERGO)';
        } else {
            sourceTag.textContent = 'Allianz, ERGO, HUK24, ARAG';
        }
    }
}

function closeKundenDetail() {
    document.getElementById('kundenDetailPage').style.display = 'none';

    // Remove dual view if active
    if (typeof closeDualView === 'function') closeDualView();

    // Gehe zurück zur vorherigen View
    if (previousViewBeforeKundenDetail === 'landing') {
        document.getElementById('landingPage').style.display = 'block';
        console.log('Zurück zur Landing Page (M-01)');

        // Dispatch event for Page ID Tracker
        document.dispatchEvent(new CustomEvent('viewChanged', {
            detail: { module: 'main', view: 'landing' }
        }));
    } else if (previousViewBeforeKundenDetail === 'agentursicht') {
        const agenturOverview = document.getElementById('agenturOverview');
        if (agenturOverview) {
            agenturOverview.style.display = 'block';
            console.log('Zurück zur Agentursicht');

            // Dispatch event for Page ID Tracker
            document.dispatchEvent(new CustomEvent('viewChanged', {
                detail: { module: 'versicherung', view: 'agentursicht' }
            }));
        }
    } else {
        // Default: Potentialanalyse
        document.getElementById('potentialAnalysePage').style.display = 'block';
        console.log('Zurück zur Potentialanalyse');

        // Dispatch event for Page ID Tracker
        document.dispatchEvent(new CustomEvent('viewChanged', {
            detail: { module: 'versicherung', view: 'potentialanalyse' }
        }));
    }
}

/**
 * Update the shared header on A-10 with agent info and customer dropdown
 */
function updateKundenSharedHeader(kundenName, vermittlerId) {
    // Update customer dropdown selection
    const select = document.getElementById('kundenSwitchSelect');
    if (select) {
        select.value = kundenName;
    }

    // Update agent name/ID in shared header
    const title = document.getElementById('kundenHeaderTitle');
    const idSpan = document.getElementById('kundenHeaderId');
    if (title) {
        const agenturTitle = document.getElementById('agenturPageTitle');
        title.textContent = agenturTitle ? agenturTitle.textContent : 'Agentur-Übersicht';
    }
    if (idSpan) {
        const agenturId = document.getElementById('agenturIdHeader');
        idSpan.textContent = agenturId ? agenturId.textContent : vermittlerId;
    }

    // Copy agent photo to shared header
    const sourceImg = document.getElementById('agenturPhotoImgSmall');
    const targetImg = document.getElementById('kundenHeaderPhotoImg');
    const targetPlaceholder = document.querySelector('#kundenHeaderPhoto .agentur-photo-placeholder-small');
    if (sourceImg && sourceImg.style.display !== 'none' && targetImg) {
        targetImg.src = sourceImg.src;
        targetImg.style.display = 'block';
        if (targetPlaceholder) targetPlaceholder.style.display = 'none';
    }
}
window.updateKundenSharedHeader = updateKundenSharedHeader;

/**
 * Navigate from A-10 back to A-02 and show a specific tab
 */
function navigateToAgenturTab(tabName) {
    // Close Kundendetail
    document.getElementById('kundenDetailPage').style.display = 'none';

    // Show Agenturansicht
    const agenturOverview = document.getElementById('agenturOverview');
    if (agenturOverview) {
        agenturOverview.style.display = 'block';
    }

    // Switch to the requested tab
    if (typeof showAgenturTab === 'function') {
        showAgenturTab(tabName);
    }

    document.dispatchEvent(new CustomEvent('viewChanged', {
        detail: { module: 'versicherung', view: 'agentursicht' }
    }));
}
window.navigateToAgenturTab = navigateToAgenturTab;

/**
 * Switch customer from dropdown on A-10
 */
function switchKundeDropdown(kundenName) {
    if (!kundenName) return;
    const vermittlerId = currentKundenVermittlerId || 'VM00001';
    openKundenDetail(kundenName, vermittlerId);
}
window.switchKundeDropdown = switchKundeDropdown;

function showNpsDetail() {
    var popup = document.getElementById('npsDetailPopup');
    if (!popup) return;
    var wrapper = document.getElementById('kundenNpsWrapper');
    if (wrapper) {
        var rect = wrapper.getBoundingClientRect();
        popup.style.left = rect.left + 'px';
        popup.style.top = (rect.bottom + 4) + 'px';
        popup.style.display = 'block';
        var popupRect = popup.getBoundingClientRect();
        if (popupRect.bottom > window.innerHeight) {
            popup.style.top = (rect.top - popupRect.height - 4) + 'px';
        }
        if (popupRect.right > window.innerWidth) {
            popup.style.left = (window.innerWidth - popupRect.width - 16) + 'px';
        }
    }
}
window.showNpsDetail = showNpsDetail;

function hideNpsDetail() {
    var popup = document.getElementById('npsDetailPopup');
    if (popup) popup.style.display = 'none';
}
window.hideNpsDetail = hideNpsDetail;

// ========================================
// KUNDE STICKY BAR
// ========================================
function updateKundeStickyBar(kundenName, kundenId, npsData, clvValue, segmentValue) {
    var nameB = document.getElementById('kundeBarNameB');
    var idB = document.getElementById('kundeBarIdB');
    var npsB = document.getElementById('kundeBarNpsB');
    var clvB = document.getElementById('kundeBarClvB');
    var segB = document.getElementById('kundeBarSegmentB');
    if (nameB) nameB.textContent = kundenName;
    if (idB) idB.textContent = kundenId;
    if (npsB && npsData) {
        npsB.innerHTML = renderNpsStars(npsData.score, 'nps-stars-display-small');
        npsB.className = 'nps-stars-display-small';
    }
    if (clvB) clvB.textContent = clvValue || '\u2014';
    if (segB) segB.textContent = segmentValue || '\u2014';
}

function filterKundenliste(searchText) {
    const rows = document.querySelectorAll('#kundenlisteTableBody tr');
    const term = searchText.toLowerCase();
    rows.forEach(row => {
        const text = row.textContent.toLowerCase();
        row.style.display = text.includes(term) ? '' : 'none';
    });
}
window.filterKundenliste = filterKundenliste;

// ========================================
/**
 * Navigiert zum Vertriebsbericht aus der Kundendetail-Seite
 */
function goToSalesReportFromKundenDetail() {
    const agenturId = currentKundenVermittlerId || 'VM00001';
    console.log('Navigiere zu Vertriebsbericht für:', agenturId);

    // Verstecke Kundendetail-Seite
    document.getElementById('kundenDetailPage').style.display = 'none';

    // Nutze die globale Navigation-Funktion aus sales-report.js
    if (typeof navigateToSalesReport === 'function') {
        navigateToSalesReport(agenturId);
    } else {
        console.error('navigateToSalesReport Funktion nicht gefunden');
        // Fallback: Manuell navigieren
        if (typeof openDashboard === 'function') {
            openDashboard();
        }
    }
}

function fillKundenDetail(kundenName, vermittlerId) {
    // Stammdaten füllen
    const nameEl = document.getElementById('kundenName');
    if (nameEl) nameEl.textContent = kundenName;

    const idEl = document.getElementById('kundenVermittlerId');
    if (idEl) idEl.textContent = vermittlerId;

    // Mock-Daten für Demo
    const mockKunden = {
        'Peter Schmidt': {
            geburtsdatum: '15.03.1985',
            adresse: 'Musterstra\u00DFe 123, 12345 Musterstadt',
            telefon: '+49 123 456789',
            email: 'peter.schmidt@email.de',
            beruf: 'Angestellter',
            familienstand: 'Verheiratet',
            arbeitgeber: 'TechCorp GmbH',
            beschaeftigtSeit: '01.03.2016',
            tiere: 'unbekannt',
            risikoscore: 35,
            risikoDetails: [
                'Skydive Academy Stuttgart \u2013 Risikosport (Open Finance)',
                'Bungee Events GmbH \u2013 Extremsport (Open Finance)',
                'BU-Leistungsfall (WG-Schaden, Aug. 2024)',
                'Wohngeb\u00E4udeschaden Sturm (Nov. 2024)'
            ],
            bonitaetsscore: 82,
            schadenhistorie: [
                { datum: '15.11.2024', sparte: 'Wohngeb\u00E4ude', beschreibung: 'Sturmschaden Dach \u2013 Ziegel abgedeckt', status: 'Reguliert', betrag: '\u20AC4.250', versicherer: 'VHV' },
                { datum: '03.08.2024', sparte: 'BU-Versicherung', beschreibung: 'Leistungspr\u00FCfung wg. Bandscheibenvorfall \u2013 4 Wochen AU', status: 'Reguliert', betrag: '\u20AC1.500', versicherer: 'ERGO' },
                { datum: '22.03.2023', sparte: 'Kfz-Haftpflicht', beschreibung: 'Parkschaden am Nachbarfahrzeug', status: 'Reguliert', betrag: '\u20AC890', versicherer: 'Allianz' }
            ],
            kinder: [{ name: 'Lena', alter: 8 }, { name: 'Paul', alter: 5 }],
            nps: { score: 9, kategorie: 'promoter', datum: '15.10.2025', kampagne: 'Herbst-Zufriedenheitsbefragung 2025 (E-Mail)', details: [
                { name: 'Beratungsqualit\u00E4t', wert: 9 },
                { name: 'Zufriedenheit mit dem Unternehmen', wert: 8 },
                { name: 'Weiterempfehlung an Freunde', wert: 10 },
                { name: 'Preis-Leistungs-Verh\u00E4ltnis', wert: 8 },
                { name: 'Erreichbarkeit & Service', wert: 9 }
            ]},
            vertraege: [
                { typ: 'Berufsunfähigkeitsversicherung', versicherer: 'ERGO', details: 'BU-Rente: €1.500/Mon., Endalter 67, ohne Ausschlüsse', praemie: '€89/Mon.', beginn: '01.03.2018', status: 'Aktiv' },
                { typ: 'Wohngebäudeversicherung', versicherer: 'VHV', details: 'Vers.-Summe: €450.000, inkl. Elementar, gleitender Neuwert', praemie: '€450/Jahr', beginn: '15.06.2019', status: 'Aktiv' }
            ],
            fidaVertraege: [
                { anbieter: 'Sparkasse', typ: 'Girokonto', info: 'Hauptkonto' },
                { anbieter: 'ING DiBa', typ: 'Tagesgeld', info: 'Sparkonto' },
                { anbieter: 'DWS', typ: 'Depot', info: 'Fondssparen' }
            ]
        },
        'Sabine König': {
            geburtsdatum: '08.11.1979',
            adresse: 'Lindenweg 7, 60329 Frankfurt',
            telefon: '+49 69 7654321',
            email: 'sabine.koenig@email.de',
            beruf: 'Lehrerin',
            familienstand: 'Geschieden',
            arbeitgeber: 'Stadtverwaltung Köln',
            beschaeftigtSeit: '01.08.2008',
            tiere: 'keine',
            risikoscore: 22,
            bonitaetsscore: 75,
            kinder: [{ name: 'Max', alter: 12 }],
            nps: { score: 7, kategorie: 'passive', datum: '08.10.2025', kampagne: 'Herbst-Zufriedenheitsbefragung 2025 (E-Mail)', details: [
                { name: 'Beratungsqualität', wert: 7 },
                { name: 'Zufriedenheit mit dem Unternehmen', wert: 6 },
                { name: 'Weiterempfehlung an Freunde', wert: 7 },
                { name: 'Preis-Leistungs-Verhältnis', wert: 7 },
                { name: 'Erreichbarkeit & Service', wert: 8 }
            ]},
            vertraege: [
                { typ: 'Risikolebensversicherung', versicherer: 'ERGO', details: 'Vers.-Summe: €150.000, Laufzeit bis 02/2026', praemie: '€18/Mon.', beginn: '01.02.2016', status: 'Aktiv' },
                { typ: 'Berufsunfähigkeitsversicherung', versicherer: 'ERGO', details: 'BU-Rente: €1.800/Mon., Endalter 67', praemie: '€95/Mon.', beginn: '01.09.2015', status: 'Aktiv' },
                { typ: 'Unfallversicherung', versicherer: 'Helvetia', details: 'Invalidität €100.000, Progression 350%', praemie: '€180/Jahr', beginn: '01.01.2020', status: 'Aktiv' }
            ],
            fidaVertraege: [
                { anbieter: 'Volksbank', typ: 'Girokonto', info: 'Gehaltskonto' },
                { anbieter: 'DKB', typ: 'Tagesgeld', info: 'Notgroschen' }
            ]
        },
        'Thomas Weber': {
            geburtsdatum: '25.04.1990',
            adresse: 'Bergstraße 22, 80331 München',
            telefon: '+49 89 1234567',
            email: 'thomas.weber@email.de',
            beruf: 'Software-Entwickler',
            familienstand: 'Ledig',
            arbeitgeber: 'SAP SE',
            beschaeftigtSeit: '15.06.2020',
            tiere: 'Katze (Mietze)',
            risikoscore: 28,
            bonitaetsscore: 88,
            kinder: [],
            nps: { score: 8, kategorie: 'promoter', datum: '03.11.2025', kampagne: 'Nach-Beratungs-Feedback (E-Mail)', details: [
                { name: 'Beratungsqualität', wert: 8 },
                { name: 'Zufriedenheit mit dem Unternehmen', wert: 7 },
                { name: 'Weiterempfehlung an Freunde', wert: 9 },
                { name: 'Preis-Leistungs-Verhältnis', wert: 8 },
                { name: 'Erreichbarkeit & Service', wert: 7 }
            ]},
            vertraege: [
                { typ: 'Privathaftpflichtversicherung', versicherer: 'ERGO', details: 'Single, €50 Mio. Deckung', praemie: '€65/Jahr', beginn: '01.03.2021', status: 'Aktiv' }
            ],
            fidaVertraege: [
                { anbieter: 'N26', typ: 'Girokonto', info: 'Hauptkonto' },
                { anbieter: 'Trade Republic', typ: 'Depot', info: 'ETF-Sparplan €500/Mon.' },
                { anbieter: 'Scalable Capital', typ: 'Depot', info: 'Einzelaktien' }
            ]
        },
        'Anna Hoffmann': {
            geburtsdatum: '03.06.1988',
            adresse: 'Rosenstraße 15, 50667 Köln',
            telefon: '+49 221 9876543',
            email: 'anna.hoffmann@email.de',
            beruf: 'Marketing-Managerin',
            familienstand: 'Verheiratet',
            arbeitgeber: 'Universitätsklinikum Köln',
            beschaeftigtSeit: '01.04.2015',
            tiere: 'keine',
            risikoscore: 15,
            bonitaetsscore: 91,
            kinder: [{ name: 'Sophie', alter: 3 }, { name: 'Emma', alter: 1 }],
            nps: { score: 10, kategorie: 'promoter', datum: '15.10.2025', kampagne: 'Herbst-Zufriedenheitsbefragung 2025 (E-Mail)', details: [
                { name: 'Beratungsqualität', wert: 10 },
                { name: 'Zufriedenheit mit dem Unternehmen', wert: 9 },
                { name: 'Weiterempfehlung an Freunde', wert: 10 },
                { name: 'Preis-Leistungs-Verhältnis', wert: 9 },
                { name: 'Erreichbarkeit & Service', wert: 10 }
            ]},
            vertraege: [
                { typ: 'Risikolebensversicherung', versicherer: 'ERGO', details: 'Vers.-Summe: €300.000, Laufzeit bis 2045', praemie: '€25/Mon.', beginn: '01.07.2020', status: 'Aktiv' },
                { typ: 'Berufsunfähigkeitsversicherung', versicherer: 'Alte Leipziger', details: 'BU-Rente: €2.000/Mon., Endalter 67', praemie: '€110/Mon.', beginn: '01.01.2019', status: 'Aktiv' }
            ],
            fidaVertraege: [
                { anbieter: 'Commerzbank', typ: 'Girokonto', info: 'Familienkonto' },
                { anbieter: 'Consorsbank', typ: 'Depot', info: 'Kindersparen' }
            ]
        },
        'Michael Braun': {
            geburtsdatum: '17.09.1975',
            adresse: 'Industriestraße 88, 70173 Stuttgart',
            telefon: '+49 711 5432167',
            email: 'michael.braun@email.de',
            beruf: 'Geschäftsführer',
            familienstand: 'Verheiratet',
            arbeitgeber: 'Meisterbetrieb Braun GmbH',
            beschaeftigtSeit: '01.01.2005',
            tiere: 'Hund (Rex)',
            risikoscore: 55,
            bonitaetsscore: 58,
            kinder: [{ name: 'Lukas', alter: 18 }, { name: 'Jana', alter: 15 }],
            nps: { score: 4, kategorie: 'detractor', datum: '22.09.2025', kampagne: 'Jahres-Kundenbefragung Q3/2025 (Brief)', details: [
                { name: 'Beratungsqualität', wert: 5 },
                { name: 'Zufriedenheit mit dem Unternehmen', wert: 3 },
                { name: 'Weiterempfehlung an Freunde', wert: 4 },
                { name: 'Preis-Leistungs-Verhältnis', wert: 3 },
                { name: 'Erreichbarkeit & Service', wert: 5 }
            ]},
            vertraege: [
                { typ: 'Berufsunfähigkeitsversicherung', versicherer: 'ERGO', details: 'BU-Rente: €3.500/Mon., Endalter 65', praemie: '€220/Mon.', beginn: '01.06.2010', status: 'Aktiv' },
                { typ: 'Wohngebäudeversicherung', versicherer: 'Axa', details: 'Vers.-Summe: €750.000, inkl. Elementar', praemie: '€680/Jahr', beginn: '01.01.2012', status: 'Aktiv' },
                { typ: 'Rechtsschutzversicherung', versicherer: 'ERGO', details: 'Premium inkl. Beruf, Verkehr, Privat', praemie: '€380/Jahr', beginn: '01.04.2018', status: 'Aktiv' }
            ],
            fidaVertraege: [
                { anbieter: 'Deutsche Bank', typ: 'Girokonto', info: 'Geschäftskonto' },
                { anbieter: 'Deka', typ: 'Depot', info: 'Vermögensaufbau €180.000' },
                { anbieter: 'Bausparkasse Schwäbisch Hall', typ: 'Bausparvertrag', info: 'Zuteilungsreif' }
            ]
        },
        'Lisa Müller': {
            geburtsdatum: '29.12.1992',
            adresse: 'Parkallee 5, 20095 Hamburg',
            telefon: '+49 40 8765432',
            email: 'lisa.mueller@email.de',
            beruf: 'Ärztin (Assistenz)',
            familienstand: 'In Partnerschaft',
            arbeitgeber: 'Medienhaus München GmbH',
            beschaeftigtSeit: '01.09.2017',
            tiere: 'keine',
            risikoscore: 20,
            bonitaetsscore: 80,
            kinder: [],
            nps: { score: 7, kategorie: 'passive', datum: '08.10.2025', kampagne: 'Herbst-Zufriedenheitsbefragung 2025 (E-Mail)', details: [
                { name: 'Beratungsqualität', wert: 8 },
                { name: 'Zufriedenheit mit dem Unternehmen', wert: 7 },
                { name: 'Weiterempfehlung an Freunde', wert: 7 },
                { name: 'Preis-Leistungs-Verhältnis', wert: 6 },
                { name: 'Erreichbarkeit & Service', wert: 7 }
            ]},
            vertraege: [
                { typ: 'Berufsunfähigkeitsversicherung', versicherer: 'ERGO', details: 'BU-Rente: €2.500/Mon., Dienstunfähigkeitsklausel', praemie: '€145/Mon.', beginn: '01.08.2022', status: 'Aktiv' }
            ],
            fidaVertraege: [
                { anbieter: 'Comdirect', typ: 'Girokonto', info: 'Gehaltskonto' },
                { anbieter: 'ING', typ: 'Extra-Konto', info: 'Tagesgeld €15.000' },
                { anbieter: 'KfW', typ: 'Studienkredit', info: 'Restschuld €18.000' }
            ]
        },
        'Klaus Meier': {
            geburtsdatum: '22.07.1978',
            adresse: 'Hauptstraße 45, 54321 Beispielstadt',
            telefon: '+49 987 654321',
            email: 'klaus.meier@email.de',
            beruf: 'Selbstständig (Handwerk)',
            familienstand: 'Verheiratet',
            arbeitgeber: 'Freelance IT-Consulting',
            beschaeftigtSeit: '01.03.2019',
            tiere: 'keine',
            risikoscore: 30,
            bonitaetsscore: 85,
            kinder: [{ name: 'Tim', alter: 10 }, { name: 'Mia', alter: 7 }],
            nps: { score: 9, kategorie: 'promoter', datum: '15.10.2025', kampagne: 'Herbst-Zufriedenheitsbefragung 2025 (E-Mail)', details: [
                { name: 'Beratungsqualität', wert: 9 },
                { name: 'Zufriedenheit mit dem Unternehmen', wert: 9 },
                { name: 'Weiterempfehlung an Freunde', wert: 10 },
                { name: 'Preis-Leistungs-Verhältnis', wert: 8 },
                { name: 'Erreichbarkeit & Service', wert: 9 }
            ]},
            vertraege: [
                { typ: 'Betriebshaftpflicht', versicherer: 'ERGO', details: '€5 Mio. Deckung, Handwerksbetrieb', praemie: '€890/Jahr', beginn: '01.01.2015', status: 'Aktiv' },
                { typ: 'Berufsunfähigkeitsversicherung', versicherer: 'Nürnberger', details: 'BU-Rente: €2.000/Mon., Handwerker-Tarif', praemie: '€135/Mon.', beginn: '01.03.2016', status: 'Aktiv' }
            ],
            fidaVertraege: [
                { anbieter: 'Commerzbank', typ: 'Geschäftskonto', info: 'Betriebskonto' },
                { anbieter: 'Union Investment', typ: 'Riester', info: 'Altersvorsorge €45.000' }
            ]
        },
        'Matthias Engel': {
            geburtsdatum: '14.08.1982',
            adresse: 'Schillerstraße 78, 45127 Essen',
            telefon: '+49 201 3456789',
            email: 'matthias.engel@email.de',
            beruf: 'IT-Consultant',
            familienstand: 'Verheiratet',
            arbeitgeber: 'Bauer Architekturbüro',
            beschaeftigtSeit: '01.07.2012',
            tiere: 'keine',
            risikoscore: 18,
            bonitaetsscore: 78,
            kinder: [{ name: 'Jonas', alter: 6 }, { name: 'Lea', alter: 4 }],
            nps: { score: 6, kategorie: 'passive', datum: '08.10.2025', kampagne: 'Herbst-Zufriedenheitsbefragung 2025 (E-Mail)', details: [
                { name: 'Beratungsqualität', wert: 6 },
                { name: 'Zufriedenheit mit dem Unternehmen', wert: 6 },
                { name: 'Weiterempfehlung an Freunde', wert: 5 },
                { name: 'Preis-Leistungs-Verhältnis', wert: 7 },
                { name: 'Erreichbarkeit & Service', wert: 6 }
            ]},
            vertraege: [
                { typ: 'Berufsunfähigkeitsversicherung', versicherer: 'Allianz', details: 'BU-Rente: €1.200/Mon., Endalter 65 - UNTERDECKT', praemie: '€75/Mon.', beginn: '01.04.2015', status: 'Aktiv' },
                { typ: 'Privathaftpflichtversicherung', versicherer: 'ERGO', details: 'Familie, €50 Mio. Deckung', praemie: '€85/Jahr', beginn: '01.01.2018', status: 'Aktiv' }
            ],
            fidaVertraege: [
                { anbieter: 'Sparkasse Essen', typ: 'Girokonto', info: 'Gehalt €4.200 netto/Mon.' },
                { anbieter: 'ING', typ: 'Depot', info: 'ETF-Sparplan €400/Mon.' },
                { anbieter: 'Allianz', typ: 'BU-Versicherung', info: 'Nur €1.200/Mon. - Deckungslücke!' }
            ]
        },
        'Christian Bauer': {
            geburtsdatum: '23.01.1989',
            adresse: 'Königsallee 15, 40212 Düsseldorf',
            telefon: '+49 211 9876543',
            email: 'christian.bauer@email.de',
            beruf: 'Projektmanager',
            familienstand: 'Ledig',
            arbeitgeber: 'DesignStudio Hamburg',
            beschaeftigtSeit: '01.10.2021',
            tiere: 'Hamster',
            risikoscore: 25,
            bonitaetsscore: 72,
            kinder: [],
            nps: { score: 8, kategorie: 'promoter', datum: '03.11.2025', kampagne: 'Nach-Beratungs-Feedback (E-Mail)', details: [
                { name: 'Beratungsqualität', wert: 8 },
                { name: 'Zufriedenheit mit dem Unternehmen', wert: 8 },
                { name: 'Weiterempfehlung an Freunde', wert: 9 },
                { name: 'Preis-Leistungs-Verhältnis', wert: 7 },
                { name: 'Erreichbarkeit & Service', wert: 8 }
            ]},
            vertraege: [
                { typ: 'Rechtsschutzversicherung', versicherer: 'ERGO', details: 'Beruf & Privat, €300 SB', praemie: '€280/Jahr', beginn: '01.06.2021', status: 'Aktiv' }
            ],
            fidaVertraege: [
                { anbieter: 'Commerzbank', typ: 'Girokonto', info: 'Gehalt €3.800 netto/Mon.' },
                { anbieter: 'Trade Republic', typ: 'Depot', info: 'Aktien €45.000' },
                { anbieter: 'keine', typ: 'BU-Versicherung', info: 'NICHT VORHANDEN!' }
            ]
        },
        'Martin Wolf': {
            geburtsdatum: '05.05.1987',
            adresse: 'Handwerkerweg 9, 44135 Dortmund',
            telefon: '+49 231 7654321',
            email: 'martin.wolf@email.de',
            beruf: 'Dachdecker (Meister)',
            familienstand: 'Verheiratet',
            arbeitgeber: 'Kanzlei Wolf & Partner',
            beschaeftigtSeit: '01.02.2003',
            tiere: 'Hund (Bruno)',
            risikoscore: 12,
            bonitaetsscore: 93,
            kinder: [{ name: 'Felix', alter: 9 }, { name: 'Marie', alter: 7 }, { name: 'Ben', alter: 3 }],
            nps: { score: 3, kategorie: 'detractor', datum: '22.09.2025', kampagne: 'Jahres-Kundenbefragung Q3/2025 (Brief)', details: [
                { name: 'Beratungsqualität', wert: 4 },
                { name: 'Zufriedenheit mit dem Unternehmen', wert: 2 },
                { name: 'Weiterempfehlung an Freunde', wert: 3 },
                { name: 'Preis-Leistungs-Verhältnis', wert: 2 },
                { name: 'Erreichbarkeit & Service', wert: 4 }
            ]},
            vertraege: [
                { typ: 'Unfallversicherung', versicherer: 'ERGO', details: 'Invalidität €150.000, Progression 500%', praemie: '€320/Jahr', beginn: '01.03.2017', status: 'Aktiv' },
                { typ: 'Wohngebäudeversicherung', versicherer: 'VHV', details: 'Vers.-Summe: €380.000, inkl. Elementar', praemie: '€520/Jahr', beginn: '01.07.2016', status: 'Aktiv' }
            ],
            fidaVertraege: [
                { anbieter: 'Volksbank Dortmund', typ: 'Girokonto', info: 'Gehalt €3.200 netto/Mon.' },
                { anbieter: 'Bausparkasse LBS', typ: 'Bausparvertrag', info: 'Ansparphase €28.000' },
                { anbieter: 'keine', typ: 'BU-Versicherung', info: 'NICHT VORHANDEN - Hochrisiko-Beruf!' }
            ]
        },
        'Eva Hartmann': {
            geburtsdatum: '19.11.1991',
            adresse: 'Kunststraße 33, 50674 Köln',
            telefon: '+49 221 1234567',
            email: 'eva.hartmann@email.de',
            beruf: 'Grafikdesignerin (selbstständig)',
            familienstand: 'In Partnerschaft',
            arbeitgeber: 'Schmidt Holding AG',
            beschaeftigtSeit: '01.01.1995',
            tiere: 'keine',
            risikoscore: 10,
            bonitaetsscore: 95,
            kinder: [{ name: 'Mila', alter: 2 }],
            nps: { score: 9, kategorie: 'promoter', datum: '15.10.2025', kampagne: 'Herbst-Zufriedenheitsbefragung 2025 (E-Mail)', details: [
                { name: 'Beratungsqualität', wert: 9 },
                { name: 'Zufriedenheit mit dem Unternehmen', wert: 9 },
                { name: 'Weiterempfehlung an Freunde', wert: 10 },
                { name: 'Preis-Leistungs-Verhältnis', wert: 8 },
                { name: 'Erreichbarkeit & Service', wert: 9 }
            ]},
            vertraege: [
                { typ: 'Berufsunfähigkeitsversicherung', versicherer: 'ERGO', details: 'BU-Rente: €1.000/Mon., Endalter 67 - Aufstockung empfohlen', praemie: '€68/Mon.', beginn: '01.09.2019', status: 'Aktiv' },
                { typ: 'Betriebshaftpflicht', versicherer: 'Hiscox', details: '€2 Mio. Deckung, Freelancer-Tarif', praemie: '€290/Jahr', beginn: '01.01.2020', status: 'Aktiv' }
            ],
            fidaVertraege: [
                { anbieter: 'N26', typ: 'Geschäftskonto', info: 'Selbstständigen-Einkommen variabel' },
                { anbieter: 'ING', typ: 'Tagesgeld', info: 'Rücklage €12.000' },
                { anbieter: 'KfW', typ: 'Gründerkredit', info: 'Restschuld €15.000' }
            ]
        }
    };

    const kunde = mockKunden[kundenName] || mockKunden['Peter Schmidt'];

    // Kundenfoto setzen
    const kundenFoto = document.querySelector('.kunden-foto');
    if (kundenFoto) {
        if (kundenName === 'Peter Schmidt') {
            kundenFoto.innerHTML = `<img src="AdobeStock_624564221.jpeg" alt="Peter Schmidt" style="width:100%;height:100%;object-fit:cover;border-radius:50%;">`;
        } else {
            kundenFoto.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
            </svg>`;
        }
    }

    // Stammdaten
    document.getElementById('kundenGeburtsdatum').textContent = kunde.geburtsdatum;
    document.getElementById('kundenAdresse').textContent = kunde.adresse;
    document.getElementById('kundenTelefon').textContent = kunde.telefon;
    document.getElementById('kundenEmail').textContent = kunde.email;
    document.getElementById('kundenBeruf').textContent = kunde.beruf;
    document.getElementById('kundenFamilienstand').textContent = kunde.familienstand;

    // Kinder
    const kinderList = document.getElementById('kundenKinder');
    if (kinderList) {
        if (kunde.kinder.length > 0) {
            kinderList.innerHTML = kunde.kinder.map(k =>
                `<span class="kinder-badge">${k.name} (${k.alter} Jahre)</span>`
            ).join('');
        } else {
            kinderList.innerHTML = '<span class="no-children">Keine Kinder</span>';
        }
    }

    // NPS (Stars + Survey Meta)
    const npsBadge = document.getElementById('kundenNpsBadge');
    const npsRows = document.getElementById('npsDetailRows');
    const npsSurveyMeta = document.getElementById('npsSurveyMeta');
    const npsDetailSurvey = document.getElementById('npsDetailSurvey');
    if (npsBadge && kunde.nps) {
        npsBadge.innerHTML = renderNpsStars(kunde.nps.score, 'nps-stars-display');
        npsBadge.className = 'nps-stars-display';
        // Survey date + campaign info inline
        if (npsSurveyMeta) {
            npsSurveyMeta.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="12" height="12"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg> ' +
                (kunde.nps.datum || '') + ' &mdash; ' + (kunde.nps.kampagne || '');
        }
        // Popup header with survey info
        if (npsDetailSurvey) {
            npsDetailSurvey.innerHTML = '<span class="nps-survey-date">' + (kunde.nps.datum || '') + '</span>' +
                '<span class="nps-survey-kampagne">' + (kunde.nps.kampagne || '') + '</span>';
        }
        if (npsRows) {
            npsRows.innerHTML = kunde.nps.details.map(d => {
                return `<div class="nps-detail-row">
                    <span class="nps-detail-label">${d.name}</span>
                    ${renderNpsStars(d.wert)}
                </div>`;
            }).join('');
        }
    }
    const npsPopup = document.getElementById('npsDetailPopup');
    if (npsPopup) npsPopup.style.display = 'none';

    // Arbeitgeber + Beschäftigt seit
    const arbeitgeberEl = document.getElementById('kundenArbeitgeber');
    if (arbeitgeberEl) arbeitgeberEl.textContent = kunde.arbeitgeber || '—';
    const beschaeftigtEl = document.getElementById('kundenBeschaeftigtSeit');
    if (beschaeftigtEl) beschaeftigtEl.textContent = kunde.beschaeftigtSeit || '—';

    // Tiere
    const tiereEl = document.getElementById('kundenTiere');
    if (tiereEl) {
        if (kunde.tiere === 'unbekannt') {
            tiereEl.innerHTML = '<span class="tier-unknown-badge" id="kundenTiereBadge" ' +
                'title="Aus Open Finance Kontoumsätzen wurden Hinweise auf Tierhaltung erkannt (z.B. Fressnapf, Tierarzt). Klicken Sie hier, um zu den Umsätzen zu navigieren." ' +
                'onclick="navigateToTierUmsaetze()">' +
                '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg> ' +
                'Hinweise aus Kontoumsätzen</span>';
        } else if (kunde.tiere === 'keine') {
            tiereEl.innerHTML = '<span class="tier-none-badge">Keine bekannt</span>';
        } else {
            tiereEl.innerHTML = '<span class="tier-known-badge"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14"><path d="M10 5.172C10 3.782 8.884 2.5 7.5 2.5S5 3.782 5 5.172c0 1.39 2.5 4.328 2.5 4.328S10 6.562 10 5.172z"/><path d="M19 5.172C19 3.782 17.884 2.5 16.5 2.5S14 3.782 14 5.172c0 1.39 2.5 4.328 2.5 4.328S19 6.562 19 5.172z"/><path d="M12 22c-4-3-8-6.58-8-10.5a4 4 0 018 0 4 4 0 018 0c0 3.92-4 7.5-8 10.5z"/></svg> ' +
                kunde.tiere + '</span>';
        }
    }

    // Risikoscore (0-100) mit Tooltip-Erklärung
    const risikoEl = document.getElementById('risikoScoreDisplay');
    if (risikoEl && kunde.risikoscore !== undefined) {
        var rColor = kunde.risikoscore <= 30 ? '#16a34a' : (kunde.risikoscore <= 60 ? '#d97706' : '#dc2626');
        var rLabel = kunde.risikoscore <= 30 ? 'Niedrig' : (kunde.risikoscore <= 60 ? 'Mittel' : 'Hoch');
        var rTooltip = '';
        if (kunde.risikoDetails && kunde.risikoDetails.length > 0) {
            rTooltip = '<div class="risiko-tooltip-trigger" tabindex="0">' +
                '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>' +
                '<div class="risiko-tooltip-content"><div class="risiko-tooltip-title">Risikofaktoren</div>' +
                kunde.risikoDetails.map(function(d) { return '<div class="risiko-tooltip-item">\u2022 ' + d + '</div>'; }).join('') +
                '</div></div>';
        }
        risikoEl.innerHTML = '<div class="score-bar-track"><div class="score-bar-fill" style="width:' + kunde.risikoscore + '%;background:' + rColor + '"></div></div>' +
            '<span class="score-bar-value" style="color:' + rColor + '">' + kunde.risikoscore + ' <small>(' + rLabel + ')</small></span>' + rTooltip;
    }

    // Bonitätsscore (0-100)
    const bonitaetEl = document.getElementById('bonitaetScoreDisplay');
    if (bonitaetEl && kunde.bonitaetsscore !== undefined) {
        var bColor = kunde.bonitaetsscore >= 70 ? '#16a34a' : (kunde.bonitaetsscore >= 40 ? '#d97706' : '#dc2626');
        var bLabel = kunde.bonitaetsscore >= 70 ? 'Gut' : (kunde.bonitaetsscore >= 40 ? 'Mittel' : 'Schwach');
        bonitaetEl.innerHTML = '<div class="score-bar-track"><div class="score-bar-fill" style="width:' + kunde.bonitaetsscore + '%;background:' + bColor + '"></div></div>' +
            '<span class="score-bar-value" style="color:' + bColor + '">' + kunde.bonitaetsscore + ' <small>(' + bLabel + ')</small></span>';
    }

    // Verträge
    const vertraegeBody = document.getElementById('kundenVertraege');
    if (vertraegeBody) {
        vertraegeBody.innerHTML = kunde.vertraege.map(v => `
            <tr>
                <td><strong>${v.typ}</strong></td>
                <td class="makler-only-col">${v.versicherer || ''}</td>
                <td>${v.details || ''}</td>
                <td>${v.praemie}</td>
                <td>${v.beginn || ''}</td>
                <td><span class="status-badge aktiv">${v.status}</span></td>
            </tr>
        `).join('');
    }

    // FIDA Verträge
    const fidaBody = document.getElementById('kundenFidaVertraege');
    if (fidaBody) {
        fidaBody.innerHTML = kunde.fidaVertraege.map(v => `
            <tr>
                <td>${v.anbieter}</td>
                <td>${v.typ}</td>
                <td>${v.info}</td>
            </tr>
        `).join('');
    }

    // Schadenhistorie / Leistungen
    const schadenEl = document.getElementById('kundenSchadenhistorie');
    if (schadenEl && kunde.schadenhistorie && kunde.schadenhistorie.length > 0) {
        schadenEl.innerHTML = kunde.schadenhistorie.map(function(s) {
            var statusClass = s.status === 'Reguliert' ? 'reguliert' : (s.status === 'Offen' ? 'offen' : 'abgelehnt');
            return '<tr>' +
                '<td>' + s.datum + '</td>' +
                '<td><strong>' + s.sparte + '</strong></td>' +
                '<td>' + s.beschreibung + '</td>' +
                '<td><span class="schaden-status-badge ' + statusClass + '">' + s.status + '</span></td>' +
                '<td class="text-right">' + s.betrag + '</td>' +
                '<td>' + s.versicherer + '</td>' +
                '</tr>';
        }).join('');
        var schadenCard = document.getElementById('schadenhistorieCard');
        if (schadenCard) schadenCard.style.display = '';
    } else {
        var schadenCard = document.getElementById('schadenhistorieCard');
        if (schadenCard) schadenCard.style.display = 'none';
    }

    // CLV berechnen und rendern
    const clvResult = calculateCLV(kunde.vertraege, kundenName);
    if (clvResult) {
        renderCLV(clvResult);
    }

    // Kunde Sticky Bar aktualisieren
    var clvStr = clvResult ? formatEuroCLV(clvResult.gesamtCLV) : '\u2014';
    var segStr = clvResult ? clvResult.segment : '\u2014';
    updateKundeStickyBar(kundenName, vermittlerId, kunde.nps, clvStr, segStr);
}

// ========================================
// KUNDEN TAB NAVIGATION
// ========================================

function switchKundenTab(tabName) {
    // Alle Tabs deaktivieren
    document.querySelectorAll('.kunden-tab').forEach(tab => {
        tab.classList.remove('active');
    });

    // Alle Tab-Inhalte verstecken
    document.querySelectorAll('.kunden-tab-content').forEach(content => {
        content.classList.remove('active');
    });

    // Aktiven Tab markieren
    const activeTab = document.querySelector(`.kunden-tab[data-tab="${tabName}"]`);
    if (activeTab) {
        activeTab.classList.add('active');
    }

    // Tab-Inhalt anzeigen
    const tabContent = document.getElementById('tab' + tabName.charAt(0).toUpperCase() + tabName.slice(1));
    if (tabContent) {
        tabContent.classList.add('active');
    }

    console.log('Tab gewechselt zu:', tabName);

    // Render dynamic content for tabs
    if (tabName === 'fida') setTimeout(function() { if (typeof renderBezahlenContent === 'function') renderBezahlenContent(); }, 50);
    if (tabName === 'impulse') setTimeout(function() { if (typeof renderImpulseContent === 'function') renderImpulseContent(); }, 50);
    if (tabName === 'kommunikation') setTimeout(function() { if (typeof renderKommContent === 'function') renderKommContent(); }, 50);
}

// Toggle Impuls Detail
function toggleImpulsDetail(impulsId) {
    const detailElement = document.getElementById(impulsId);
    if (detailElement) {
        const isVisible = detailElement.style.display !== 'none';
        detailElement.style.display = isVisible ? 'none' : 'block';

        // Rotate the expand icon
        const parentItem = detailElement.previousElementSibling;
        if (parentItem) {
            const expandIcon = parentItem.querySelector('.impuls-expand');
            if (expandIcon) {
                expandIcon.style.transform = isVisible ? 'rotate(0deg)' : 'rotate(180deg)';
            }
        }
    }
}

// Kommunikation ansehen
function viewKommunikation(kommId) {
    console.log('Kommunikation ansehen:', kommId);

    // Mock-Daten für Kommunikation
    const kommunikationen = {
        'email-1': {
            typ: 'E-Mail',
            datum: '28.11.2025, 09:15',
            betreff: 'Kfz-Versicherung: Ihr Vertrag läuft aus',
            inhalt: `Sehr geehrter Herr Mustermann,

Ihr Kfz-Vertrag bei der Allianz (Kennzeichen: M-AB 1234) läuft am 31.12.2025 aus.

Basierend auf Ihrer Schadenfreiheitsklasse SF12 und Ihren Fahrzeugdaten haben wir ein attraktives Angebot für Sie:

- Haftpflicht + Vollkasko: €520/Jahr (statt €680 aktuell)
- Ersparnis: €160/Jahr

Interesse? Antworten Sie einfach auf diese E-Mail oder rufen Sie uns an.

Mit freundlichen Grüßen
Ihre Versicherungsagentur`,
            status: 'Geöffnet am 28.11.2025, 14:32'
        },
        'brief-1': {
            typ: 'Brief',
            datum: '15.11.2025',
            betreff: 'Open Finance Datenfreigabe: Neue Potentiale erkannt',
            inhalt: `Sehr geehrter Herr Mustermann,

vielen Dank für Ihre Open Finance Datenfreigabe vom 15.03.2024.

Basierend auf der Analyse Ihrer Finanzdaten haben wir folgende Optimierungsmöglichkeiten identifiziert:

1. Risikolebensversicherung
   Ihre Hypothek (€320.000) ist derzeit nicht abgesichert.

2. Private Altersvorsorge
   Bei Ihrer Sparrate von €800/Monat können wir Ihre Rentenlücke schließen.

Wir würden uns freuen, diese Möglichkeiten in einem persönlichen Gespräch mit Ihnen zu besprechen.

Mit freundlichen Grüßen
Ihre Versicherungsagentur`,
            status: 'Versendet'
        },
        'call-1': {
            typ: 'Telefonat',
            datum: '10.11.2025, 11:20',
            betreff: 'Rückruf wegen Altersvorsorge-Angebot',
            inhalt: `Gesprächsnotiz:

Kunde rief zurück wegen Brief vom 15.11.

- Interesse an fondsgebundener Rentenversicherung
- Möchte Angebot mit verschiedenen Fonds-Optionen
- Bevorzugt nachhaltige ETFs
- Budget: ca. €400/Monat zusätzlich zur bestehenden Sparrate

Termin vereinbart: 12.12.2025, 14:00 Uhr
Ort: Agentur

Vorbereitung:
- 3 Angebote mit unterschiedlichen Risikoprofilen
- ESG-Fonds-Optionen`,
            status: 'Termin: 12.12.2025'
        },
        'email-2': {
            typ: 'E-Mail',
            datum: '01.10.2025, 08:00',
            betreff: 'Willkommen bei Open Finance - Ihre Daten sind jetzt verknüpft',
            inhalt: `Sehr geehrter Herr Mustermann,

vielen Dank für Ihre Open Finance Datenfreigabe!

Ab sofort können wir Ihnen personalisierte Versicherungsempfehlungen basierend auf Ihrer Finanzsituation anbieten.

Was bedeutet das für Sie?
- Wir erkennen automatisch, wenn sich Ihre Lebensumstände ändern
- Sie erhalten nur relevante Angebote
- Ihre Daten sind sicher und DSGVO-konform geschützt

Ihre freigegebenen Datenquellen:
- Sparkasse (Girokonto)
- DWS (Depot)
- Sparkasse (Hypothekendarlehen)
- Allianz (Kfz-Versicherung)

Sie können Ihre Einwilligung jederzeit über das Open Finance Dashboard widerrufen.

Mit freundlichen Grüßen
Ihre Versicherungsagentur`,
            status: 'Geöffnet am 01.10.2025, 19:45'
        }
    };

    const komm = kommunikationen[kommId];
    if (komm) {
        alert(`${komm.typ} vom ${komm.datum}\n\nBetreff: ${komm.betreff}\n\n${komm.inhalt}\n\nStatus: ${komm.status}`);
    }
}

// Legacy-Funktion für Kompatibilität
function toggleKundenFida() {
    switchKundenTab('fida');
}

// Window-Exports für globale Verfügbarkeit
window.toggleImpulsDetail = toggleImpulsDetail;

// ========================================
