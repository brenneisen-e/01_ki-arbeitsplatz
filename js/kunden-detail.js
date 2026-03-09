// js/kunden-detail.js - Kundendetail-Seite (A-10)
// Mock-Daten, fillKundenDetail, Sticky Bar, Tab Navigation
// Extracted from landing.js for modularity

// ========================================
// VERSICHERER LOGO HELPER (logo.dev)
// ========================================
var versichererLogoDomains = {
    'Allianz': 'allianz.de',
    'ERGO': 'ergo.de',
    'VHV': 'vhv.de',
    'Helvetia': 'helvetia.com',
    'Alte Leipziger': 'alte-leipziger.de',
    'Axa': 'axa.de',
    'AXA': 'axa.de',
    'N\u00FCrnberger': 'nuernberger.de',
    'Hiscox': 'hiscox.de',
    'Hannoversche': 'hannoversche.de',
    'CosmosDirekt': 'cosmosdirekt.de',
    'HUK-Coburg': 'huk.de',
    'HUK24': 'huk24.de',
    'Condor': 'condor-versicherungen.de',
    'Zurich': 'zurich.de',
    'HDI': 'hdi.de',
    'R+V': 'ruv.de',
    'Generali': 'generali.de',
    'Gothaer': 'gothaer.de',
    'Debeka': 'debeka.de',
    'Sparkasse': 'sparkasse.de',
    'Volksbank': 'volksbank.de',
    'ING DiBa': 'ing.de',
    'ING': 'ing.de',
    'DKB': 'dkb.de',
    'DWS': 'dws.de',
    'Kravag': 'kravag.de',
    'ARAG': 'arag.de',
    'Fressnapf': 'fressnapf.de',
    'Bausparkasse Schw\u00E4bisch Hall': 'schwaebisch-hall.de',
    'Bausparkasse LBS': 'lbs.de',
    'Targobank': 'targobank.de',
    'N26': 'n26.com',
    'Trade Republic': 'traderepublic.com',
    'Scalable Capital': 'scalable.capital',
    'Commerzbank': 'commerzbank.de',
    'Consorsbank': 'consorsbank.de',
    'Deutsche Bank': 'db.com',
    'Deka': 'deka.de',
    'Comdirect': 'comdirect.de',
    'KfW': 'kfw.de',
    'Union Investment': 'union-investment.de',
    'Santander': 'santander.de',
    'Swiss Life': 'swisslife.de',
    'Apobank': 'apobank.de',
    'Sparkasse Gießen': 'sparkasse.de',
    'Sparkasse Marburg': 'sparkasse.de',
    'Sparkasse Lich': 'sparkasse.de',
    'Sparkasse Essen': 'sparkasse.de',
    'Sparkasse Braunschweig': 'sparkasse.de',
    'Volksbank Dortmund': 'volksbank.de'
};

function getVersichererLogoUrl(name, size) {
    size = size || 32;
    var domain = versichererLogoDomains[name];
    // Fallback: try matching start of name (e.g. "Sparkasse Gießen" -> "Sparkasse")
    if (!domain) {
        for (var key in versichererLogoDomains) {
            if (name.indexOf(key) === 0 || key.indexOf(name) === 0) {
                domain = versichererLogoDomains[key];
                break;
            }
        }
    }
    if (!domain) return '';
    return 'https://img.logo.dev/' + domain + '?token=pk_H7vb5Y2lTsW47U4Xq-w3HA&size=' + size + '&format=png';
}

function versichererLogoImg(name, size) {
    size = size || 20;
    var url = getVersichererLogoUrl(name, size * 2);
    if (!url) return '';
    return '<img src="' + url + '" alt="' + name + '" class="versicherer-logo" width="' + size + '" height="' + size + '" style="vertical-align:middle;border-radius:4px;object-fit:contain;" onerror="this.style.display=\'none\'">';
}
window.versichererLogoImg = versichererLogoImg;
window.getVersichererLogoUrl = getVersichererLogoUrl;

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
    // Also hide berater overview (B-02) if visible
    var beraterPage = document.getElementById('beraterOverviewPage');
    if (beraterPage) beraterPage.style.display = 'none';

    // Restore AO tabs if Makler/MRH was active
    if (typeof restoreAOKundenDetail === 'function') restoreAOKundenDetail();
    if (typeof restoreMRHKundenDetail === 'function') restoreMRHKundenDetail();

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

        // Sync A-10 finance toggle with current financeMode
        syncA10FinanceToggle();

        // Dispatch event for Page ID Tracker
        document.dispatchEvent(new CustomEvent('viewChanged', {
            detail: { module: 'versicherung', view: 'kundendetail' }
        }));
    }

    // Update URL route
    if (window.AppRouter) AppRouter.navigate('/kundendetail');
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

// Sync finance toggle on A-10 with current global financeMode
function syncA10FinanceToggle() {
    var mode = (typeof financeMode !== 'undefined') ? financeMode : (localStorage.getItem('financeMode') || 'closed');
    var toggleBtns = document.querySelectorAll('#a10FinanceModeToggle .finance-mode-btn');
    toggleBtns.forEach(function(btn) {
        btn.classList.toggle('active', btn.dataset.fmode === mode);
    });
}
window.syncA10FinanceToggle = syncA10FinanceToggle;

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
        document.getElementById('landingPage').style.display = 'flex';
        window.scrollTo(0, 0);
        console.log('Zurück zur Landing Page (M-01)');

        // Dispatch event for Page ID Tracker
        document.dispatchEvent(new CustomEvent('viewChanged', {
            detail: { module: 'main', view: 'landing' }
        }));

        // Update URL route
        if (window.AppRouter) AppRouter.navigate('/landing');
    } else if (previousViewBeforeKundenDetail === 'beraterOverview') {
        // Restore A-10 to insurance mode and go back to B-02
        if (typeof restoreA10InsuranceMode === 'function') restoreA10InsuranceMode();

        var agenturOverview = document.getElementById('agenturOverview');
        var beraterPage = document.getElementById('beraterOverviewPage');
        if (agenturOverview) {
            agenturOverview.style.display = 'block';
        } else if (beraterPage) {
            beraterPage.style.display = 'block';
        }
        if (typeof showBeraterTab === 'function') showBeraterTab('kundenliste');
        console.log('Zurück zur Beraterübersicht (B-02)');

        document.dispatchEvent(new CustomEvent('viewChanged', {
            detail: { module: 'banking', view: 'beraterOverview' }
        }));

        if (window.AppRouter) AppRouter.navigate('/berater');
    } else if (previousViewBeforeKundenDetail === 'agentursicht') {
        const agenturOverview = document.getElementById('agenturOverview');
        if (agenturOverview) {
            agenturOverview.style.display = 'block';
            console.log('Zurück zur Agentursicht');

            // Dispatch event for Page ID Tracker
            document.dispatchEvent(new CustomEvent('viewChanged', {
                detail: { module: 'versicherung', view: 'agentursicht' }
            }));

            // Update URL route
            if (window.AppRouter) AppRouter.navigate('/agentur');
        }
    } else {
        // Default: Potentialanalyse
        document.getElementById('potentialAnalysePage').style.display = 'block';
        console.log('Zurück zur Potentialanalyse');

        // Dispatch event for Page ID Tracker
        document.dispatchEvent(new CustomEvent('viewChanged', {
            detail: { module: 'versicherung', view: 'potentialanalyse' }
        }));

        // Update URL route
        if (window.AppRouter) AppRouter.navigate('/potentialanalyse');
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

    // Try source image first, fall back to localStorage or default photo
    let photoSrc = null;
    if (sourceImg && sourceImg.src && sourceImg.style.display !== 'none') {
        photoSrc = sourceImg.src;
    } else {
        photoSrc = localStorage.getItem('agenturPhoto') || 'assets/images/maria-musterfrau.png';
    }

    if (targetImg && photoSrc) {
        targetImg.src = photoSrc;
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
    var kundenPage = document.getElementById('kundenDetailPage');
    var isBankMode = kundenPage && kundenPage.classList.contains('bank-mode');

    if (isBankMode && typeof openBankKundenDetail === 'function') {
        // In bank mode, use bank customer detail flow
        openBankKundenDetail(kundenName);
    } else {
        const vermittlerId = currentKundenVermittlerId || 'VM00001';
        openKundenDetail(kundenName, vermittlerId);
    }
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
        'Amira König': {
            geburtsdatum: '08.11.1979',
            adresse: 'Lindenweg 7, 60329 Frankfurt',
            telefon: '+49 69 7654321',
            email: 'amira.koenig@email.de',
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
        var kundenFotos = {
            'Peter Schmidt': 'assets/images/AdobeStock_624564221.jpeg',
            'Amira König': 'assets/images/AdobeStock_252262042.jpeg',
            'Thomas Weber': 'assets/images/AdobeStock_361342769.jpeg',
            'Sabine Danzig': 'assets/images/AdobeStock_612932760.jpeg'
        };
        if (kundenFotos[kundenName]) {
            kundenFoto.innerHTML = `<img src="${kundenFotos[kundenName]}" alt="${kundenName}" style="width:100%;height:100%;object-fit:cover;border-radius:50%;">`;
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

    // Tiere - Badge + Bestätigungs-Button
    const tierHintRow = document.getElementById('tierHintRow');
    const tiereEl = document.getElementById('kundenTiere');
    if (tiereEl) {
        if (kunde.tiere === 'unbekannt') {
            // Hinweise-Badge + Confirm-Button anzeigen (HTML ist bereits im Template)
            if (tierHintRow) tierHintRow.style.display = 'flex';
        } else if (kunde.tiere === 'keine') {
            if (tierHintRow) tierHintRow.style.display = 'none';
            tiereEl.innerHTML = '<span class="tier-none-badge">Keine bekannt</span>';
        } else {
            if (tierHintRow) tierHintRow.style.display = 'none';
            tiereEl.innerHTML = '<span class="tier-known-badge"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14"><ellipse cx="7" cy="4" rx="2" ry="2.5"/><ellipse cx="17" cy="4" rx="2" ry="2.5"/><ellipse cx="4" cy="10" rx="2" ry="2.5"/><ellipse cx="20" cy="10" rx="2" ry="2.5"/><path d="M12 22c-3 0-7-3-7-7a7 7 0 0114 0c0 4-4 7-7 7z"/></svg> ' +
                kunde.tiere + '</span>';
        }
    }
    // Haustier-Formular initialisieren
    initTierForm();

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
                <td class="makler-only-col">${versichererLogoImg(v.versicherer, 18)} ${v.versicherer || ''}</td>
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
                <td>${versichererLogoImg(v.anbieter, 18)} ${v.anbieter}</td>
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
                '<td>' + versichererLogoImg(s.versicherer, 16) + ' ' + s.versicherer + '</td>' +
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
// HAUSTIER-EINGABEFORMULAR (localStorage)
// ========================================

function getTierStorageKey() {
    var kundenName = document.getElementById('kundenHeaderTitle');
    var name = kundenName ? kundenName.textContent.replace('Kunde: ', '').trim() : 'default';
    return 'tierInfo_' + name;
}

// SVG-Icons für Hund und Katze (einfarbig, modern)
var tierSvgIcons = {
    Hund: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="16" height="16"><ellipse cx="7" cy="4" rx="2" ry="2.5"/><ellipse cx="17" cy="4" rx="2" ry="2.5"/><ellipse cx="4" cy="10" rx="2" ry="2.5"/><ellipse cx="20" cy="10" rx="2" ry="2.5"/><path d="M12 22c-3 0-7-3-7-7a7 7 0 0114 0c0 4-4 7-7 7z"/></svg>',
    Katze: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="16" height="16"><path d="M4 7V2l4 4"/><path d="M20 7V2l-4 4"/><circle cx="12" cy="14" r="7"/><circle cx="10" cy="12.5" r="1" fill="currentColor"/><circle cx="14" cy="12.5" r="1" fill="currentColor"/><path d="M10 15.5s1 1 2 1 2-1 2-1"/></svg>'
};

function initTierForm() {
    var saved = localStorage.getItem(getTierStorageKey());
    if (saved) {
        try {
            var data = JSON.parse(saved);
            showSavedTierDisplay(data);
        } catch(e) { /* ignore */ }
    }
}

function onTierArtChange() {
    var select = document.getElementById('tierArtSelect');
    var detailsRow = document.getElementById('tierDetailsRow');
    if (!select || !detailsRow) return;
    detailsRow.style.display = select.value ? 'block' : 'none';
}
window.onTierArtChange = onTierArtChange;

function saveTierInfo() {
    var art = document.getElementById('tierArtSelect');
    var name = document.getElementById('tierNameInput');
    var alter = document.getElementById('tierAlterInput');
    if (!art || !art.value) return;

    var data = {
        art: art.value,
        name: name ? name.value.trim() : '',
        alter: alter ? alter.value : ''
    };

    localStorage.setItem(getTierStorageKey(), JSON.stringify(data));
    showSavedTierDisplay(data);
}
window.saveTierInfo = saveTierInfo;

function showSavedTierDisplay(data) {
    var display = document.getElementById('tierDisplay');
    var badge = document.getElementById('tierDisplayBadge');
    var tierHintRow = document.getElementById('tierHintRow');

    if (!display || !badge) return;

    var icon = tierSvgIcons[data.art] || tierSvgIcons.Hund;
    var text = data.art;
    if (data.name) text += ' \u201E' + data.name + '\u201C';
    if (data.alter) text += ', ' + data.alter + ' J.';

    badge.innerHTML = '<span class="tier-display-icon">' + icon + '</span><span>' + text + '</span>';
    display.style.display = 'flex';

    // Hinweis-Zeile verstecken
    if (tierHintRow) tierHintRow.style.display = 'none';

    // Popup schließen
    closeTierPopup();
}

function openTierPopup(isEdit) {
    var overlay = document.getElementById('tierPopupOverlay');
    var popup = document.getElementById('tierPopup');
    if (!overlay || !popup) return;

    overlay.style.display = 'block';
    popup.style.display = 'block';

    // Felder vorbelegen wenn edit
    if (isEdit) {
        var saved = localStorage.getItem(getTierStorageKey());
        if (saved) {
            try {
                var data = JSON.parse(saved);
                var artSelect = document.getElementById('tierArtSelect');
                var nameInput = document.getElementById('tierNameInput');
                var alterInput = document.getElementById('tierAlterInput');
                var detailsRow = document.getElementById('tierDetailsRow');
                if (artSelect) artSelect.value = data.art || '';
                if (nameInput) nameInput.value = data.name || '';
                if (alterInput) alterInput.value = data.alter || '';
                if (detailsRow) detailsRow.style.display = data.art ? 'block' : 'none';
            } catch(e) { /* ignore */ }
        }
    } else {
        // Reset form
        var artSelect = document.getElementById('tierArtSelect');
        var nameInput = document.getElementById('tierNameInput');
        var alterInput = document.getElementById('tierAlterInput');
        var detailsRow = document.getElementById('tierDetailsRow');
        if (artSelect) artSelect.value = '';
        if (nameInput) nameInput.value = '';
        if (alterInput) alterInput.value = '';
        if (detailsRow) detailsRow.style.display = 'none';
    }
}
window.openTierPopup = openTierPopup;

function closeTierPopup() {
    var overlay = document.getElementById('tierPopupOverlay');
    var popup = document.getElementById('tierPopup');
    if (overlay) overlay.style.display = 'none';
    if (popup) popup.style.display = 'none';
}
window.closeTierPopup = closeTierPopup;

function removeTierInfo() {
    localStorage.removeItem(getTierStorageKey());
    var display = document.getElementById('tierDisplay');
    if (display) display.style.display = 'none';
    // Hint-Zeile wieder anzeigen
    var tierHintRow = document.getElementById('tierHintRow');
    if (tierHintRow) tierHintRow.style.display = 'flex';
    // Popup schließen
    closeTierPopup();
    // Formular zurücksetzen
    var artSelect = document.getElementById('tierArtSelect');
    var detailsRow = document.getElementById('tierDetailsRow');
    var nameInput = document.getElementById('tierNameInput');
    var alterInput = document.getElementById('tierAlterInput');
    if (artSelect) artSelect.value = '';
    if (detailsRow) detailsRow.style.display = 'none';
    if (nameInput) nameInput.value = '';
    if (alterInput) alterInput.value = '';
}
window.removeTierInfo = removeTierInfo;

// ========================================
// ANGEBOT ERSTELLEN - KONTEXTMENÜ
// ========================================

function toggleAngebotMenu(event, btn) {
    event.stopPropagation();
    var wrapper = btn.closest('.angebot-dropdown-wrapper');
    if (!wrapper) return;
    var menu = wrapper.querySelector('.angebot-context-menu');
    if (!menu) return;

    // Alle anderen offenen Menüs schließen
    document.querySelectorAll('.angebot-context-menu').forEach(function(m) {
        if (m !== menu) m.style.display = 'none';
    });

    // Toggle
    if (menu.style.display === 'none' || !menu.style.display) {
        menu.style.display = 'block';
        // Klick außerhalb schließt das Menü
        setTimeout(function() {
            document.addEventListener('click', closeAllAngebotMenus);
        }, 0);
    } else {
        menu.style.display = 'none';
    }
}
window.toggleAngebotMenu = toggleAngebotMenu;

function closeAllAngebotMenus() {
    document.querySelectorAll('.angebot-context-menu').forEach(function(m) {
        m.style.display = 'none';
    });
    document.removeEventListener('click', closeAllAngebotMenus);
}

function angebotAction(typ, el) {
    closeAllAngebotMenus();
    var wrapper = el ? el.closest('.angebot-dropdown-wrapper') : null;
    var produkt = wrapper ? wrapper.getAttribute('data-produkt') : 'Versicherung';
    var empfehlung = wrapper ? wrapper.getAttribute('data-empfehlung') : '';

    if (typ === 'pdf') {
        showAngebotToast('loading', 'PDF wird generiert: ' + produkt + '...');
        setTimeout(function() {
            showAngebotToast('success', 'PDF erstellt: Angebot ' + produkt + ' für Peter Schmidt');
        }, 1800);
    } else if (typ === 'entwurf') {
        showAngebotToast('success', 'Entwurf gespeichert: ' + produkt);
    } else if (typ === 'vergleich') {
        openTarifvergleich(produkt, empfehlung);
    }
}
window.angebotAction = angebotAction;

function showAngebotToast(type, message) {
    var toast = document.getElementById('angebotToast');
    if (!toast) return;
    var icon = type === 'success'
        ? '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18"><path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>'
        : '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18" class="angebot-toast-spinner"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>';
    toast.className = 'angebot-toast ' + type + ' show';
    toast.innerHTML = '<div class="angebot-toast-icon">' + icon + '</div><span>' + message + '</span>';
    if (type === 'success') {
        setTimeout(function() { toast.classList.remove('show'); }, 3500);
    }
}

function openTarifvergleich(produkt, empfehlung) {
    var modal = document.getElementById('tarifvergleichModal');
    if (!modal) return;
    var title = document.getElementById('tvModalTitle');
    var body = document.getElementById('tvModalBody');
    if (title) title.textContent = 'Tarifvergleich: ' + produkt;

    var tarife = getTarifData(produkt);
    var html = '<div class="tv-empfehlung"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg> <strong>Empfehlung:</strong> ' + (empfehlung || produkt) + '</div>';
    html += '<table class="tv-table"><thead><tr><th>Versicherer</th><th>Tarif</th><th>Beitrag</th><th>Leistung</th><th>Bewertung</th><th></th></tr></thead><tbody>';
    tarife.forEach(function(t) {
        var stars = '';
        for (var s = 0; s < 5; s++) { stars += s < t.rating ? '<span class="tv-star filled">★</span>' : '<span class="tv-star">☆</span>'; }
        html += '<tr' + (t.empfohlen ? ' class="tv-empfohlen"' : '') + '>' +
            '<td>' + versichererLogoImg(t.versicherer, 18) + ' <strong>' + t.versicherer + '</strong></td>' +
            '<td>' + t.tarif + '</td>' +
            '<td><strong>' + t.beitrag + '</strong></td>' +
            '<td>' + t.leistung + '</td>' +
            '<td class="tv-stars">' + stars + '</td>' +
            '<td>' + (t.empfohlen ? '<span class="tv-badge-empfohlen">Empfohlen</span>' : '') + '</td>' +
            '</tr>';
    });
    html += '</tbody></table>';
    if (body) body.innerHTML = html;

    modal.style.display = 'flex';
}

function closeTarifvergleich() {
    var modal = document.getElementById('tarifvergleichModal');
    if (modal) modal.style.display = 'none';
}
window.openTarifvergleich = openTarifvergleich;
window.closeTarifvergleich = closeTarifvergleich;

function getTarifData(produkt) {
    var tarifSets = {
        'Risikolebensversicherung': [
            { versicherer: 'Hannoversche', tarif: 'T1 Plus', beitrag: '€18/Mon.', leistung: '€300.000, 20 J.', rating: 5, empfohlen: true },
            { versicherer: 'CosmosDirekt', tarif: 'Risiko Comfort', beitrag: '€21/Mon.', leistung: '€300.000, 20 J.', rating: 4, empfohlen: false },
            { versicherer: 'HUK-Coburg', tarif: 'Risiko PLUS', beitrag: '€24/Mon.', leistung: '€300.000, 20 J.', rating: 4, empfohlen: false },
            { versicherer: 'ERGO', tarif: 'RisikoLeben Premium', beitrag: '€28/Mon.', leistung: '€300.000, 20 J., Unfall +', rating: 3, empfohlen: false }
        ],
        'Fondsgebundene Rentenversicherung': [
            { versicherer: 'Alte Leipziger', tarif: 'FR10 Fonds', beitrag: '€250/Mon.', leistung: 'ETF-basiert, Steuervorteil', rating: 5, empfohlen: true },
            { versicherer: 'Condor', tarif: 'C78 Comfort', beitrag: '€250/Mon.', leistung: 'Fondsgeb., flex. Entnahme', rating: 4, empfohlen: false },
            { versicherer: 'Allianz', tarif: 'InvestFlex', beitrag: '€260/Mon.', leistung: 'Garantie + Fondsanlage', rating: 4, empfohlen: false },
            { versicherer: 'Zurich', tarif: 'VorsorgePlus', beitrag: '€245/Mon.', leistung: 'Fondsgeb., Todesfallschutz', rating: 3, empfohlen: false }
        ],
        'Kfz-Versicherung': [
            { versicherer: 'HDI', tarif: 'Kfz-Vollkasko Comfort', beitrag: '€52/Mon.', leistung: 'VK, SF8, Weltweit', rating: 5, empfohlen: true },
            { versicherer: 'HUK-Coburg', tarif: 'VK Plus', beitrag: '€48/Mon.', leistung: 'VK, SF8, EU-Schutz', rating: 4, empfohlen: false },
            { versicherer: 'Allianz', tarif: 'AutoBest', beitrag: '€58/Mon.', leistung: 'VK, Neupreis 24 Mon.', rating: 4, empfohlen: false },
            { versicherer: 'VHV', tarif: 'Klassik-Garant', beitrag: '€45/Mon.', leistung: 'VK, SF8, Basis', rating: 3, empfohlen: false }
        ],
        'BU-Nachversicherung': [
            { versicherer: 'ERGO', tarif: 'BU Premium Protect', beitrag: '€145/Mon.', leistung: '€3.700/Mon., NVG', rating: 5, empfohlen: true },
            { versicherer: 'Alte Leipziger', tarif: 'BU10 Plus', beitrag: '€138/Mon.', leistung: '€3.700/Mon., AU-Klausel', rating: 5, empfohlen: false },
            { versicherer: 'HDI', tarif: 'EGO Top', beitrag: '€155/Mon.', leistung: '€3.700/Mon., Infektionsklausel', rating: 4, empfohlen: false },
            { versicherer: 'Nürnberger', tarif: 'BU Premium', beitrag: '€142/Mon.', leistung: '€3.700/Mon., Dienstunfähigkeit', rating: 4, empfohlen: false }
        ]
    };
    return tarifSets[produkt] || tarifSets['Risikolebensversicherung'];
}

// ========================================
// KUNDEN TAB NAVIGATION
// ========================================

function switchKundenTab(tabName) {
    // Exit dual-view when user clicks any tab manually
    if (typeof closeDualView === 'function') {
        const kundenContent = document.querySelector('.kunden-content.dual-view');
        if (kundenContent) closeDualView();
    }

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

// ── BANKING KUNDEN-DETAIL (merged from kunden-detail-bank.js) ──

/* ============================================================
   B-10 KUNDEN-DETAIL BANK  –  Banking Customer Detail
   Mirrors kunden-detail.js (A-10) structure exactly
   ============================================================ */

// ── MOCK KUNDEN DETAIL DATA ──
var bankMockKunden = {
    'Klaus Fischer': {
        geburtsdatum:'12.05.1978', adresse:'Hauptstraße 45, 35390 Gießen', telefon:'+49 641 98765', email:'k.fischer@email.de',
        beruf:'Maschinenbau-Ingenieur', familienstand:'Verheiratet', arbeitgeber:'Continental AG', beschaeftigtSeit:'01.04.2008',
        nettoeinkommen:4850, kinder:[{name:'Lukas',alter:12},{name:'Emma',alter:9}],
        risikoscore:28, bonitaet:82,
        nps: { score:9, kategorie:'promoter', datum:'15.01.2026', kampagne:'Jahresumfrage 2026', details:[{name:'Beratungsqualität',wert:9},{name:'Zufriedenheit',wert:9},{name:'Weiterempfehlung',wert:10},{name:'Preis-Leistung',wert:8},{name:'Erreichbarkeit',wert:9}] },
        konten: [
            { produkt:'VR-Girokonto Plus', details:'IBAN DE89 5066 1639 0012 3456 78 \u2022 girocard NFC + Digitale girocard (VR Banking App) \u2022 Wero aktiv', saldo:8450, eroeffnung:'15.03.2010', status:'Aktiv' },
            { produkt:'VR-Tagesgeld Extra', details:'Zinssatz 2,8% p.a.', saldo:42000, eroeffnung:'01.06.2020', status:'Aktiv' },
            { produkt:'Baufinanzierung (DZ HYP)', details:'Restschuld, Zinsbindung bis 09/2026 \u2013 Anschlussfinanzierung erforderlich', saldo:-185000, eroeffnung:'01.09.2016', status:'Aktiv' },
            { produkt:'VR-MeinDepot (Union Investment)', details:'ETF-Sparplan 300/Mon. \u2022 UnionDepot', saldo:28500, eroeffnung:'15.01.2022', status:'Aktiv' },
            { produkt:'Riester-Rente (Union Investment)', details:'Beitrag 175/Mon. \u2022 UniProfiRente', saldo:18200, eroeffnung:'01.04.2018', status:'Aktiv' },
            { produkt:'R+V Unfallversicherung Komfort', details:'Grundsumme 80.000 \u2022 R+V Versicherung', saldo:0, eroeffnung:'01.01.2020', status:'Aktiv' }
        ],
        fidaVertraege: [
            { institut:'Sparkasse Gießen', typ:'Girokonto', info:'Zweitkonto, Gehalt', consent:'12.01.2026', gueltig:'12.01.2027' },
            { institut:'ING', typ:'Extra-Konto', info:'Tagesgeld €18.500', consent:'12.01.2026', gueltig:'12.01.2027' },
            { institut:'Trade Republic', typ:'Depot', info:'ETF-Sparplan 200/Mon.', consent:'12.01.2026', gueltig:'12.01.2027' }
        ],
        // ── BEDARFSFELD: SPAREN & VORSORGEN ──
        sparenGeldmarkt: [
            { produkt:'VR-Tagesgeld Extra', anbieter:'Volksbank Mittelhessen', volumen:42000, zinssatz:'2,80% p.a.', laufzeit:'Flexibel' },
            { produkt:'Tagesgeldkonto', anbieter:'ING', volumen:18500, zinssatz:'2,75% p.a.', laufzeit:'Flexibel', quelle:'FIDA' }
        ],
        sparenKapitalmarkt: [
            { produkt:'VR-MeinDepot ETF-Sparplan', anbieter:'Union Investment', volumen:28500, sparrate:'€300/Mon.', performance:'+9,4%' },
            { produkt:'Riester-Rente VR', anbieter:'Union Investment', volumen:18200, sparrate:'€175/Mon.', performance:'+4,2%' },
            { produkt:'ETF-Portfolio', anbieter:'Trade Republic', volumen:12800, sparrate:'€200/Mon.', performance:'+11,7%', quelle:'FIDA' }
        ],
        // ── BEDARFSFELD: ABSICHERN ──
        versicherungenEigen: [
            { versicherung:'Unfallversicherung', anbieter:'R+V Versicherung', deckung:'Grundsumme €80.000', tarifart:'Komfort', leistungen:['Invalidität','Bergungskosten','Krankenhaustagegeld'], praemie:'€180/Jahr', vertrag:'UV-2020-11234' },
            { versicherung:'Risikolebensversicherung', anbieter:'R+V Versicherung', deckung:'€200.000', tarifart:'Premium', leistungen:['Todesfallschutz','Nachversicherung','Vorgezogene Leistung'], praemie:'€240/Jahr', vertrag:'RL-2016-44821' }
        ],
        versicherungenFremd: [
            { versicherung:'Kfz-Versicherung', anbieter:'HUK-Coburg', deckung:'VK €45.000 / TK €20.000', tarifart:'Standard', leistungen:['Marderschäden','Auslandsschutz'], selbstbehalt:'€300 VK', praemie:'€680/Jahr', kuendigung:'30.11.2026' },
            { versicherung:'Hausratversicherung', anbieter:'Allianz', deckung:'€75.000', tarifart:'Komfort', leistungen:['Fahrraddiebstahl','Überspannung','Elementar'], selbstbehalt:'€150', praemie:'€165/Jahr', kuendigung:'01.03.2027' },
            { versicherung:'Privathaftpflicht', anbieter:'HUK24', deckung:'€50 Mio. pauschal', tarifart:'Premium', leistungen:['Schlüsselverlust','Ehrenamt','Deliktunfähige Kinder'], selbstbehalt:'€0', praemie:'€68/Jahr', kuendigung:'01.01.2027' }
        ],
        // ── BEDARFSFELD: FINANZIEREN ──
        finanzierungen: [
            { kredit:'Baufinanzierung', kreditgeber:'Volksbank Mittelhessen', ursprung:280000, restschuld:185000, zinssatz:'1,85% p.a.', rate:'€1.180/Mon.', laufzeit:'09/2026', absicherung:'Grundschuld', hinweis:'Zinsbindung endet 09/2026 – Anschlussfinanzierung erforderlich' }
        ],
        kommunikation: [
            { typ:'email', datum:'28.02.2026', betreff:'Anschlussfinanzierung Angebot', inhalt:'Angebot für Baufi-Anschluss gesendet', status:'Geöffnet' },
            { typ:'call', datum:'20.02.2026', betreff:'Telefonat Baufinanzierung', inhalt:'Beratungsgespräch zu Anschlussoptionen', status:'Erledigt' },
            { typ:'termin', datum:'15.02.2026', betreff:'Jahresgespräch', inhalt:'VR-FinanzPlan Review durchgeführt', status:'Erledigt' },
            { typ:'brief', datum:'10.01.2026', betreff:'Kontoauszug Q4 2025', inhalt:'Quartalsauszug Depot + Konten', status:'Versendet' }
        ],
        avatarBg:'#2563eb', foto:'assets/images/AdobeStock_624564221.jpeg'
    },
    'Sandra Müller': {
        geburtsdatum:'23.11.1985', adresse:'Bahnhofstr. 12, 35578 Wetzlar', telefon:'+49 6441 55432', email:'s.mueller@email.de',
        beruf:'Ärztin', familienstand:'Ledig', arbeitgeber:'Uniklinik Gießen', beschaeftigtSeit:'01.08.2015',
        nettoeinkommen:5200, kinder:[{name:'Mia',alter:4}],
        risikoscore:15, bonitaet:91,
        nps: { score:7, kategorie:'passive', datum:'15.01.2026', kampagne:'Jahresumfrage 2026', details:[{name:'Beratungsqualität',wert:7},{name:'Zufriedenheit',wert:7},{name:'Weiterempfehlung',wert:6},{name:'Preis-Leistung',wert:8},{name:'Erreichbarkeit',wert:7}] },
        konten: [
            { produkt:'VR-Girokonto Komfort', details:'IBAN DE89 5066 1639 0098 7654 32', saldo:12800, eroeffnung:'01.09.2015', status:'Aktiv' },
            { produkt:'VR-Tagesgeld Extra', details:'Zinssatz 2,8% p.a.', saldo:85000, eroeffnung:'15.03.2020', status:'Aktiv' },
            { produkt:'VR-Festgeld 12M', details:'3,2% p.a., Fälligkeit 06/2026', saldo:50000, eroeffnung:'01.06.2025', status:'Aktiv' },
            { produkt:'Kreditkarte Gold', details:'Limit 5.000', saldo:-1200, eroeffnung:'01.01.2018', status:'Aktiv' },
            { produkt:'Berufsunfähigkeitsvers.', details:'BU-Rente €2.500/Mon., Endalter 67', saldo:0, eroeffnung:'01.01.2020', status:'Aktiv' }
        ],
        fidaVertraege: [
            { institut:'Commerzbank', typ:'Girokonto', info:'Gehaltskonto €5.200/Mon.', consent:'20.01.2026', gueltig:'20.01.2027' },
            { institut:'N26', typ:'Girokonto', info:'Zweitkonto, Reisen', consent:'20.01.2026', gueltig:'20.01.2027' },
            { institut:'Scalable Capital', typ:'Depot', info:'ETF-Portfolio €32.000', consent:'20.01.2026', gueltig:'20.01.2027' }
        ],
        sparenGeldmarkt: [
            { produkt:'VR-Tagesgeld Extra', anbieter:'Volksbank Mittelhessen', volumen:85000, zinssatz:'2,80% p.a.', laufzeit:'Flexibel' },
            { produkt:'VR-Festgeld 12M', anbieter:'Volksbank Mittelhessen', volumen:50000, zinssatz:'3,20% p.a.', laufzeit:'bis 06/2026' }
        ],
        sparenKapitalmarkt: [
            { produkt:'ETF-Portfolio', anbieter:'Scalable Capital', volumen:32000, sparrate:'€500/Mon.', performance:'+10,8%', quelle:'FIDA' }
        ],
        versicherungenEigen: [
            { versicherung:'Berufsunfähigkeitsversicherung', anbieter:'R+V Versicherung', deckung:'BU-Rente €2.500/Mon.', tarifart:'Premium', leistungen:['Endalter 67','Nachversicherung','Weltweiter Schutz'], praemie:'€125/Monat', vertrag:'BU-2020-55891' }
        ],
        versicherungenFremd: [
            { versicherung:'Privathaftpflicht', anbieter:'Allianz', deckung:'€50 Mio.', tarifart:'Komfort', leistungen:['Schlüsselverlust','Mietsachschäden'], selbstbehalt:'€150', praemie:'€58/Jahr', kuendigung:'01.04.2027' }
        ],
        finanzierungen: [],
        kommunikation: [
            { typ:'email', datum:'25.02.2026', betreff:'Festgeld Verlängerung', inhalt:'Info zu Festgeld-Konditionen bei Fälligkeit', status:'Geöffnet' },
            { typ:'call', datum:'18.02.2026', betreff:'Altersvorsorge-Beratung', inhalt:'Erstgespräch Altersvorsorge-Konzept', status:'Erledigt' },
            { typ:'termin', datum:'05.02.2026', betreff:'VR-FinanzPlan Erstberatung', inhalt:'Ganzheitliche Finanzplanung besprochen', status:'Erledigt' },
            { typ:'email', datum:'15.01.2026', betreff:'Depotvergleich', inhalt:'Vergleich VR-MeinDepot vs. Scalable Capital', status:'Versendet' }
        ],
        avatarBg:'#9333ea', foto:'assets/images/AdobeStock_252262042.jpeg'
    },
    'Markus Wagner': {
        geburtsdatum:'08.03.1972', adresse:'Schulstr. 8, 35037 Marburg', telefon:'+49 6421 77890', email:'m.wagner@email.de',
        beruf:'Lehrer', familienstand:'Verheiratet', arbeitgeber:'Land Hessen', beschaeftigtSeit:'01.02.2000',
        nettoeinkommen:3800, kinder:[{name:'Tim',alter:14},{name:'Jana',alter:11}],
        risikoscore:22, bonitaet:75,
        nps: { score:8, kategorie:'promoter', datum:'15.01.2026', kampagne:'Jahresumfrage 2026', details:[{name:'Beratungsqualität',wert:8},{name:'Zufriedenheit',wert:8},{name:'Weiterempfehlung',wert:9},{name:'Preis-Leistung',wert:7},{name:'Erreichbarkeit',wert:8}] },
        konten: [
            { produkt:'VR-Girokonto', details:'IBAN DE89 5066 1639 0045 6789 01', saldo:4200, eroeffnung:'01.03.2005', status:'Aktiv' },
            { produkt:'Bausparvertrag', details:'Wüstenrot, Bausparsumme 60.000', saldo:35000, eroeffnung:'01.01.2012', status:'Aktiv' },
            { produkt:'Riester-Rente VR', details:'Beitrag 162,17/Mon.', saldo:22400, eroeffnung:'01.01.2010', status:'Aktiv' },
            { produkt:'Risikolebensversicherung', details:'Vers.-Summe €200.000, Laufzeit bis 2035', saldo:0, eroeffnung:'01.06.2015', status:'Aktiv' }
        ],
        fidaVertraege: [
            { institut:'Sparkasse Marburg', typ:'Girokonto', info:'Gehaltskonto Ehefrau', consent:'10.02.2026', gueltig:'10.02.2027' }
        ],
        sparenGeldmarkt: [],
        sparenKapitalmarkt: [
            { produkt:'Bausparvertrag', anbieter:'Wüstenrot', volumen:35000, sparrate:'€250/Mon.', performance:'1,0%' },
            { produkt:'Riester-Rente VR', anbieter:'Union Investment', volumen:22400, sparrate:'€162/Mon.', performance:'+3,8%' }
        ],
        versicherungenEigen: [
            { versicherung:'Risikolebensversicherung', anbieter:'R+V Versicherung', deckung:'€200.000', tarifart:'Standard', leistungen:['Todesfallschutz','Laufzeit bis 2035'], praemie:'€180/Jahr', vertrag:'RL-2015-22450' }
        ],
        versicherungenFremd: [],
        finanzierungen: [],
        kommunikation: [
            { typ:'termin', datum:'20.02.2026', betreff:'VR-FinanzPlan Review', inhalt:'Jährliches Review der Finanzplanung', status:'Erledigt' },
            { typ:'email', datum:'10.02.2026', betreff:'ETF-Sparplan Info', inhalt:'Informationen zu VR-MeinDepot Sparplan', status:'Geöffnet' },
            { typ:'call', datum:'28.01.2026', betreff:'Depoteröffnung Interesse', inhalt:'Telefonat zu ETF-Sparplänen für Kinder', status:'Erledigt' }
        ],
        avatarBg:'#16a34a', foto:'assets/images/AdobeStock_361342769.jpeg'
    },
    'Julia Becker': {
        geburtsdatum:'15.07.1990', adresse:'Ludwigstr. 22, 35390 Gießen', telefon:'+49 641 33210', email:'j.becker@email.de',
        beruf:'Marketing-Managerin', familienstand:'Ledig', arbeitgeber:'Amazon DE', beschaeftigtSeit:'01.03.2019',
        nettoeinkommen:3600, kinder:[],
        risikoscore:18, bonitaet:88,
        nps: { score:6, kategorie:'passive', datum:'15.01.2026', kampagne:'Jahresumfrage 2026', details:[{name:'Beratungsqualität',wert:6},{name:'Zufriedenheit',wert:5},{name:'Weiterempfehlung',wert:6},{name:'Preis-Leistung',wert:7},{name:'Erreichbarkeit',wert:6}] },
        konten: [
            { produkt:'VR-Girokonto', details:'IBAN DE89 5066 1639 0023 4567 89', saldo:5800, eroeffnung:'01.05.2019', status:'Aktiv' },
            { produkt:'Kreditkarte Classic', details:'Limit 3.000', saldo:-450, eroeffnung:'01.06.2019', status:'Aktiv' }
        ],
        fidaVertraege: [],
        sparenGeldmarkt: [],
        sparenKapitalmarkt: [],
        versicherungenEigen: [],
        versicherungenFremd: [],
        finanzierungen: [],
        kommunikation: [
            { typ:'email', datum:'18.02.2026', betreff:'FIDA-Consent Einladung', inhalt:'Open Finance Datenfreigabe angefragt', status:'Geöffnet' },
            { typ:'call', datum:'05.02.2026', betreff:'Erstberatung', inhalt:'Telefonat zur ganzheitlichen Beratung', status:'Erledigt' }
        ],
        avatarBg:'#f59e0b', foto:null
    },
    'Peter Hoffmann': {
        geburtsdatum:'30.01.1970', adresse:'Friedrichstr. 5, 35578 Wetzlar', telefon:'+49 6441 88456', email:'p.hoffmann@email.de',
        beruf:'Steuerberater', familienstand:'Verheiratet', arbeitgeber:'Selbständig', beschaeftigtSeit:'01.01.1998',
        nettoeinkommen:7500, kinder:[{name:'Fabian',alter:22},{name:'Laura',alter:19}],
        risikoscore:35, bonitaet:79,
        nps: { score:9, kategorie:'promoter', datum:'15.01.2026', kampagne:'Jahresumfrage 2026', details:[{name:'Beratungsqualität',wert:9},{name:'Zufriedenheit',wert:9},{name:'Weiterempfehlung',wert:10},{name:'Preis-Leistung',wert:8},{name:'Erreichbarkeit',wert:9}] },
        konten: [
            { produkt:'VR-Girokonto Premium', details:'IBAN DE89 5066 1639 0034 5678 90', saldo:18200, eroeffnung:'01.01.2005', status:'Aktiv' },
            { produkt:'VR-Geschäftskonto', details:'Kanzlei Hoffmann & Partner', saldo:42500, eroeffnung:'01.01.2005', status:'Aktiv' },
            { produkt:'VR-Tagesgeld Extra', details:'Zinssatz 2,8% p.a.', saldo:120000, eroeffnung:'01.03.2018', status:'Aktiv' },
            { produkt:'VR-MeinDepot', details:'Aktien + ETF, Volumen €85.000', saldo:85000, eroeffnung:'15.06.2015', status:'Aktiv' },
            { produkt:'Baufinanzierung', details:'Tilgung 2,5%, Restschuld', saldo:-220000, eroeffnung:'01.04.2012', status:'Aktiv' },
            { produkt:'Risikolebensversicherung', details:'Vers.-Summe €500.000', saldo:0, eroeffnung:'01.04.2012', status:'Aktiv' },
            { produkt:'Berufsunfähigkeitsvers.', details:'BU-Rente €3.000/Mon.', saldo:0, eroeffnung:'01.01.2005', status:'Aktiv' },
            { produkt:'Rechtsschutzversicherung', details:'Premium inkl. Beruf + Privat', saldo:0, eroeffnung:'01.01.2010', status:'Aktiv' }
        ],
        fidaVertraege: [
            { institut:'Deutsche Bank', typ:'Girokonto', info:'Kanzleikonto €42.000', consent:'05.01.2026', gueltig:'05.01.2027' },
            { institut:'Deka', typ:'Depot', info:'Fondsanlage €65.000', consent:'05.01.2026', gueltig:'05.01.2027' },
            { institut:'Allianz', typ:'Lebensversicherung', info:'Kapital-LV, Ablauf 2030', consent:'05.01.2026', gueltig:'05.01.2027' }
        ],
        sparenGeldmarkt: [
            { produkt:'VR-Tagesgeld Extra', anbieter:'Volksbank Mittelhessen', volumen:120000, zinssatz:'2,80% p.a.', laufzeit:'Flexibel' }
        ],
        sparenKapitalmarkt: [
            { produkt:'VR-MeinDepot', anbieter:'Union Investment', volumen:85000, sparrate:'€500/Mon.', performance:'+8,1%' },
            { produkt:'Fondsanlage', anbieter:'Deka', volumen:65000, sparrate:'€300/Mon.', performance:'+6,5%', quelle:'FIDA' },
            { produkt:'Kapital-Lebensversicherung', anbieter:'Allianz', volumen:48000, sparrate:'€200/Mon.', performance:'+2,8%', quelle:'FIDA' }
        ],
        versicherungenEigen: [
            { versicherung:'Risikolebensversicherung', anbieter:'R+V Versicherung', deckung:'€500.000', tarifart:'Premium', leistungen:['Todesfallschutz','Nachversicherung'], praemie:'€420/Jahr', vertrag:'RL-2012-33567' },
            { versicherung:'Berufsunfähigkeitsversicherung', anbieter:'R+V Versicherung', deckung:'BU-Rente €3.000/Mon.', tarifart:'Premium', leistungen:['Endalter 67','Weltweiter Schutz','Selbständige'], praemie:'€185/Monat', vertrag:'BU-2005-11234' },
            { versicherung:'Rechtsschutzversicherung', anbieter:'R+V Versicherung', deckung:'€500.000 Privat+Beruf', tarifart:'Premium', leistungen:['Arbeitsrecht','Verkehr','Vertragsrecht'], praemie:'€295/Jahr', vertrag:'RS-2010-88912' }
        ],
        versicherungenFremd: [
            { versicherung:'Wohngebäudeversicherung', anbieter:'Allianz', deckung:'€520.000', tarifart:'Komfort', leistungen:['Elementarschäden','Glasbruch'], selbstbehalt:'€500', praemie:'€480/Jahr', kuendigung:'01.07.2026' }
        ],
        finanzierungen: [
            { kredit:'Baufinanzierung', kreditgeber:'Volksbank Mittelhessen', ursprung:350000, restschuld:220000, zinssatz:'2,10% p.a.', rate:'€1.450/Mon.', laufzeit:'04/2032', absicherung:'Grundschuld + RLV' }
        ],
        kommunikation: [
            { typ:'termin', datum:'15.02.2026', betreff:'VR-FinanzPlan Review', inhalt:'Jährliche Vermögensübersicht besprochen', status:'Erledigt' },
            { typ:'email', datum:'10.02.2026', betreff:'Vermögensverwaltung Angebot', inhalt:'VR-Vermögensverwaltung Konzept zugesandt', status:'Geöffnet' },
            { typ:'call', datum:'28.01.2026', betreff:'Nachfolgeplanung Kanzlei', inhalt:'Erstgespräch Unternehmensnachfolge', status:'Erledigt' },
            { typ:'brief', datum:'15.01.2026', betreff:'Kontoauszug Q4 2025', inhalt:'Quartalsauszug alle Konten + Depot', status:'Versendet' }
        ],
        avatarBg:'#dc2626', foto:'assets/images/AdobeStock_612932760.jpeg'
    },
    'Andrea Lang': {
        geburtsdatum:'05.09.1982', adresse:'Marktplatz 3, 35423 Lich', telefon:'+49 6404 12345', email:'a.lang@email.de',
        beruf:'Steuerberaterin', familienstand:'Geschieden', arbeitgeber:'Kanzlei Lang & Partner', beschaeftigtSeit:'01.06.2012',
        nettoeinkommen:5800, kinder:[{name:'Sophie',alter:7}],
        risikoscore:20, bonitaet:85,
        nps: { score:8, kategorie:'promoter', datum:'15.01.2026', kampagne:'Jahresumfrage 2026', details:[{name:'Beratungsqualität',wert:8},{name:'Zufriedenheit',wert:8},{name:'Weiterempfehlung',wert:8},{name:'Preis-Leistung',wert:7},{name:'Erreichbarkeit',wert:9}] },
        konten: [
            { produkt:'VR-Girokonto Komfort', details:'IBAN DE89 5066 1639 0056 7890 12', saldo:9800, eroeffnung:'01.01.2013', status:'Aktiv' },
            { produkt:'VR-Geschäftskonto', details:'Kanzlei Lang & Partner', saldo:28000, eroeffnung:'01.06.2012', status:'Aktiv' },
            { produkt:'VR-Tagesgeld Extra', details:'Zinssatz 2,8% p.a.', saldo:50000, eroeffnung:'01.09.2019', status:'Aktiv' },
            { produkt:'Unfallversicherung', details:'Grundsumme €100.000, Progression 350%', saldo:0, eroeffnung:'01.01.2015', status:'Aktiv' },
            { produkt:'Risikolebensversicherung', details:'Vers.-Summe €250.000', saldo:0, eroeffnung:'01.01.2016', status:'Aktiv' }
        ],
        fidaVertraege: [
            { institut:'Sparkasse Lich', typ:'Girokonto', info:'Zweitkonto, Kindergeld', consent:'15.01.2026', gueltig:'15.01.2027' },
            { institut:'Union Investment', typ:'Depot', info:'Fondssparen €280/Mon.', consent:'15.01.2026', gueltig:'15.01.2027' }
        ],
        sparenGeldmarkt: [
            { produkt:'VR-Tagesgeld Extra', anbieter:'Volksbank Mittelhessen', volumen:50000, zinssatz:'2,80% p.a.', laufzeit:'Flexibel' }
        ],
        sparenKapitalmarkt: [
            { produkt:'Fondssparen', anbieter:'Union Investment', volumen:18500, sparrate:'€280/Mon.', performance:'+7,2%', quelle:'FIDA' }
        ],
        versicherungenEigen: [
            { versicherung:'Unfallversicherung', anbieter:'R+V Versicherung', deckung:'€100.000, Progression 350%', tarifart:'Premium', leistungen:['Invalidität','Bergungskosten','Kosmetische OPs'], praemie:'€245/Jahr', vertrag:'UV-2015-33789' },
            { versicherung:'Risikolebensversicherung', anbieter:'R+V Versicherung', deckung:'€250.000', tarifart:'Komfort', leistungen:['Todesfallschutz','Nachversicherung'], praemie:'€195/Jahr', vertrag:'RL-2016-44125' }
        ],
        versicherungenFremd: [],
        finanzierungen: [],
        kommunikation: [
            { typ:'termin', datum:'12.02.2026', betreff:'Gewerbekredit Beratung', inhalt:'Kanzleierweiterung – Finanzierungskonzept', status:'Erledigt' },
            { typ:'email', datum:'05.02.2026', betreff:'KfW-Förderung Info', inhalt:'Informationen zu KfW-Förderkrediten', status:'Geöffnet' },
            { typ:'call', datum:'20.01.2026', betreff:'Jahresplanung', inhalt:'Telefonat zur Kanzlei-Finanzplanung 2026', status:'Erledigt' }
        ],
        avatarBg:'#6366f1', foto:null
    },
    'Thomas Klein': {
        geburtsdatum:'18.12.1968', adresse:'Am Anger 7, 35418 Buseck', telefon:'+49 6408 99123', email:'t.klein@email.de',
        beruf:'Handwerksmeister', familienstand:'Verheiratet', arbeitgeber:'Klein Sanitär GmbH', beschaeftigtSeit:'01.01.1995',
        nettoeinkommen:4200, kinder:[{name:'Max',alter:16}],
        risikoscore:42, bonitaet:68,
        nps: { score:7, kategorie:'passive', datum:'15.01.2026', kampagne:'Jahresumfrage 2026', details:[{name:'Beratungsqualität',wert:7},{name:'Zufriedenheit',wert:7},{name:'Weiterempfehlung',wert:7},{name:'Preis-Leistung',wert:6},{name:'Erreichbarkeit',wert:8}] },
        konten: [
            { produkt:'VR-Girokonto', details:'IBAN DE89 5066 1639 0067 8901 23', saldo:3200, eroeffnung:'01.01.2000', status:'Aktiv' },
            { produkt:'VR-Geschäftskonto', details:'Klein Sanitär GmbH', saldo:15800, eroeffnung:'01.01.1995', status:'Aktiv' },
            { produkt:'KfW-Förderkredit', details:'Energetische Sanierung, Tilgung 1,5%', saldo:-75000, eroeffnung:'01.10.2025', status:'Aktiv' },
            { produkt:'Wohngebäudeversicherung', details:'Vers.-Summe €380.000, inkl. Elementar', saldo:0, eroeffnung:'01.01.2000', status:'Aktiv' }
        ],
        fidaVertraege: [
            { institut:'Sparkasse Gießen', typ:'Girokonto', info:'Geschäftszweitkonto', consent:'08.02.2026', gueltig:'08.02.2027' }
        ],
        kommunikation: [
            { typ:'termin', datum:'10.02.2026', betreff:'KfW-Förderung Beratung', inhalt:'Energetische Sanierung – Fördermöglichkeiten', status:'Erledigt' },
            { typ:'email', datum:'25.01.2026', betreff:'Sanierungsfahrplan', inhalt:'Unterlagen Energieberatung zugesandt', status:'Geöffnet' },
            { typ:'brief', datum:'10.01.2026', betreff:'Kontoauszug Q4 2025', inhalt:'Quartalsauszug Geschäfts- + Privatkonto', status:'Versendet' }
        ],
        avatarBg:'#0891b2', foto:null
    },
    'Monika Richter': {
        geburtsdatum:'22.04.1975', adresse:'Goethering 15, 35390 Gießen', telefon:'+49 641 44567', email:'m.richter@email.de',
        beruf:'Lehrerin', familienstand:'Verheiratet', arbeitgeber:'Land Hessen', beschaeftigtSeit:'01.08.2002',
        nettoeinkommen:3400, kinder:[{name:'Anna',alter:10},{name:'Felix',alter:7}],
        risikoscore:12, bonitaet:80,
        nps: { score:8, kategorie:'promoter', datum:'15.01.2026', kampagne:'Jahresumfrage 2026', details:[{name:'Beratungsqualität',wert:8},{name:'Zufriedenheit',wert:9},{name:'Weiterempfehlung',wert:8},{name:'Preis-Leistung',wert:7},{name:'Erreichbarkeit',wert:8}] },
        konten: [
            { produkt:'VR-Girokonto', details:'IBAN DE89 5066 1639 0078 9012 34', saldo:5600, eroeffnung:'01.09.2002', status:'Aktiv' },
            { produkt:'VR-Tagesgeld Extra', details:'Zinssatz 2,8% p.a.', saldo:22000, eroeffnung:'01.01.2018', status:'Aktiv' },
            { produkt:'Unfallversicherung VR', details:'Familie, Grundsumme €120.000', saldo:0, eroeffnung:'01.08.2020', status:'Aktiv' }
        ],
        fidaVertraege: [
            { institut:'Sparkasse Gießen', typ:'Girokonto', info:'Gehaltskonto Ehemann €3.800', consent:'12.02.2026', gueltig:'12.02.2027' },
            { institut:'DWS', typ:'Depot', info:'Kindersparen 2x €50/Mon.', consent:'12.02.2026', gueltig:'12.02.2027' }
        ],
        kommunikation: [
            { typ:'termin', datum:'08.02.2026', betreff:'Beratung Unfallversicherung', inhalt:'Absicherung Familie erweitert', status:'Erledigt' },
            { typ:'email', datum:'01.02.2026', betreff:'Kindersparen Info', inhalt:'Informationen zu VR-MeinDepot Junior', status:'Geöffnet' }
        ],
        avatarBg:'#d946ef', foto:null
    },
    'Stefan Braun': {
        geburtsdatum:'11.06.1988', adresse:'Technikstr. 20, 35037 Marburg', telefon:'+49 6421 55678', email:'s.braun@email.de',
        beruf:'IT-Consultant', familienstand:'Ledig', arbeitgeber:'SAP SE', beschaeftigtSeit:'01.09.2018',
        nettoeinkommen:5500, kinder:[],
        risikoscore:10, bonitaet:92,
        nps: { score:5, kategorie:'detractor', datum:'15.01.2026', kampagne:'Jahresumfrage 2026', details:[{name:'Beratungsqualität',wert:5},{name:'Zufriedenheit',wert:4},{name:'Weiterempfehlung',wert:5},{name:'Preis-Leistung',wert:6},{name:'Erreichbarkeit',wert:5}] },
        konten: [
            { produkt:'VR-Girokonto', details:'IBAN DE89 5066 1639 0089 0123 45', saldo:8200, eroeffnung:'01.10.2018', status:'Aktiv' },
            { produkt:'ETF-Depot VR', details:'MSCI World + EM, Sparplan €500/Mon.', saldo:25000, eroeffnung:'01.03.2023', status:'Aktiv' }
        ],
        fidaVertraege: [
            { institut:'N26', typ:'Girokonto', info:'Hauptkonto, Gehalt €5.500', consent:'25.01.2026', gueltig:'25.01.2027' },
            { institut:'Trade Republic', typ:'Depot', info:'Aktien + Krypto, €45.000', consent:'25.01.2026', gueltig:'25.01.2027' },
            { institut:'Scalable Capital', typ:'Depot', info:'ETF-Portfolio €18.000', consent:'25.01.2026', gueltig:'25.01.2027' }
        ],
        kommunikation: [
            { typ:'email', datum:'05.02.2026', betreff:'VR-FinanzPlan Einladung', inhalt:'Einladung zur ganzheitlichen Finanzberatung', status:'Geöffnet' },
            { typ:'call', datum:'20.01.2026', betreff:'Kundenbindungsgespräch', inhalt:'NPS-Rückmeldung besprochen, Verbesserungen zugesagt', status:'Erledigt' }
        ],
        avatarBg:'#ea580c', foto:null
    },
    'Katharina Wolf': {
        geburtsdatum:'03.03.1988', adresse:'Schillerstr. 9, 35390 Gießen', telefon:'+49 641 77890', email:'k.wolf@email.de',
        beruf:'Architektin', familienstand:'Verheiratet', arbeitgeber:'Wolf Architekten', beschaeftigtSeit:'01.01.2016',
        nettoeinkommen:4600, kinder:[{name:'Lara',alter:3}],
        risikoscore:25, bonitaet:84,
        nps: { score:9, kategorie:'promoter', datum:'15.01.2026', kampagne:'Jahresumfrage 2026', details:[{name:'Beratungsqualität',wert:9},{name:'Zufriedenheit',wert:9},{name:'Weiterempfehlung',wert:10},{name:'Preis-Leistung',wert:8},{name:'Erreichbarkeit',wert:9}] },
        konten: [
            { produkt:'VR-Girokonto Komfort', details:'IBAN DE89 5066 1639 0090 1234 56', saldo:7400, eroeffnung:'01.01.2016', status:'Aktiv' },
            { produkt:'VR-Geschäftskonto', details:'Wolf Architekten', saldo:22000, eroeffnung:'01.01.2016', status:'Aktiv' },
            { produkt:'FuchsImmo XS (Schwäbisch Hall)', details:'Bausparsumme 80.000 \u2022 Effektivzins ab 1,95% \u2022 Zuteilungsreif 2026', saldo:40000, eroeffnung:'01.06.2020', status:'Aktiv' },
            { produkt:'VR-MeinDepot', details:'ETF-Sparplan €200/Mon.', saldo:15600, eroeffnung:'01.01.2023', status:'Aktiv' },
            { produkt:'Baufinanzierung', details:'Tilgung 3%, Restschuld €180.000', saldo:-180000, eroeffnung:'01.03.2022', status:'Aktiv' }
        ],
        fidaVertraege: [
            { institut:'Commerzbank', typ:'Girokonto', info:'Gehaltskonto Ehemann €4.200', consent:'18.01.2026', gueltig:'18.01.2027' },
            { institut:'Bausparkasse Schwäbisch Hall', typ:'Bausparvertrag', info:'Zuteilungsreif 2026', consent:'18.01.2026', gueltig:'18.01.2027' }
        ],
        sparenGeldmarkt: [],
        sparenKapitalmarkt: [
            { produkt:'VR-MeinDepot ETF-Sparplan', anbieter:'Union Investment', volumen:15600, sparrate:'€200/Mon.', performance:'+10,1%' },
            { produkt:'Bausparvertrag', anbieter:'Schwäbisch Hall', volumen:40000, sparrate:'€250/Mon.', performance:'1,0%' }
        ],
        versicherungenEigen: [],
        versicherungenFremd: [],
        finanzierungen: [
            { kredit:'Baufinanzierung', kreditgeber:'Volksbank Mittelhessen', ursprung:260000, restschuld:180000, zinssatz:'2,45% p.a.', rate:'€1.250/Mon.', laufzeit:'03/2037', absicherung:'Grundschuld' }
        ],
        kommunikation: [
            { typ:'termin', datum:'01.02.2026', betreff:'VR-FinanzPlan Review', inhalt:'Finanzplanung mit Immobilie + Kind aktualisiert', status:'Erledigt' },
            { typ:'email', datum:'25.01.2026', betreff:'Risikolebensversicherung', inhalt:'Angebot Absicherung Baufinanzierung', status:'Geöffnet' },
            { typ:'call', datum:'15.01.2026', betreff:'Bausparvertrag Zuteilung', inhalt:'Info zu Zuteilungsoptionen', status:'Erledigt' },
            { typ:'brief', datum:'10.01.2026', betreff:'Kontoauszug Q4 2025', inhalt:'Quartalsauszug alle Konten', status:'Versendet' }
        ],
        avatarBg:'#059669', foto:null
    },
    'Jürgen Peters': {
        geburtsdatum:'14.10.1965', adresse:'Industriestr. 18, 35578 Wetzlar', telefon:'+49 6441 33789', email:'j.peters@email.de',
        beruf:'Geschäftsführer', familienstand:'Verheiratet', arbeitgeber:'Peters Metallbau GmbH', beschaeftigtSeit:'01.01.1992',
        nettoeinkommen:9500, kinder:[{name:'Stefan',alter:28},{name:'Maria',alter:25}],
        risikoscore:30, bonitaet:76,
        nps: { score:8, kategorie:'promoter', datum:'15.01.2026', kampagne:'Jahresumfrage 2026', details:[{name:'Beratungsqualität',wert:8},{name:'Zufriedenheit',wert:8},{name:'Weiterempfehlung',wert:9},{name:'Preis-Leistung',wert:7},{name:'Erreichbarkeit',wert:8}] },
        konten: [
            { produkt:'VR-Girokonto Premium', details:'IBAN DE89 5066 1639 0011 2233 44', saldo:25000, eroeffnung:'01.01.1992', status:'Aktiv' },
            { produkt:'VR-Geschäftskonto', details:'Peters Metallbau GmbH', saldo:185000, eroeffnung:'01.01.1992', status:'Aktiv' },
            { produkt:'Gewerbekredit', details:'Investitionskredit, Tilgung 3%', saldo:-250000, eroeffnung:'01.06.2024', status:'Aktiv' },
            { produkt:'VR-MeinDepot', details:'Aktien + Fonds, Volumen €120.000', saldo:120000, eroeffnung:'01.01.2008', status:'Aktiv' },
            { produkt:'Risikolebensversicherung', details:'Vers.-Summe €750.000 (Kreuzversicherung)', saldo:0, eroeffnung:'01.01.2000', status:'Aktiv' },
            { produkt:'Berufsunfähigkeitsvers.', details:'BU-Rente €4.000/Mon., Endalter 67', saldo:0, eroeffnung:'01.01.1995', status:'Aktiv' },
            { produkt:'Betriebliche Altersvorsorge', details:'Direktversicherung, Beitrag €535/Mon.', saldo:0, eroeffnung:'01.01.2005', status:'Aktiv' }
        ],
        fidaVertraege: [
            { institut:'Deutsche Bank', typ:'Geschäftskonto', info:'Zweitkonto Firma €95.000', consent:'02.01.2026', gueltig:'02.01.2027' },
            { institut:'Deka', typ:'Depot', info:'Vermögensverwaltung €280.000', consent:'02.01.2026', gueltig:'02.01.2027' },
            { institut:'Swiss Life', typ:'Lebensversicherung', info:'Kapital-LV, Ablauf 2028, €180.000', consent:'02.01.2026', gueltig:'02.01.2027' },
            { institut:'Allianz', typ:'Sachversicherung', info:'Betriebshaftpflicht + Inhaltsvers.', consent:'02.01.2026', gueltig:'02.01.2027' }
        ],
        kommunikation: [
            { typ:'termin', datum:'28.01.2026', betreff:'Nachfolgeplanung', inhalt:'Unternehmensnachfolge – Sohn Stefan als Nachfolger', status:'Erledigt' },
            { typ:'email', datum:'22.01.2026', betreff:'Stiftungsmodell', inhalt:'Informationen zur Familienstiftung', status:'Geöffnet' },
            { typ:'call', datum:'15.01.2026', betreff:'Gewerbekredit Prolongation', inhalt:'Konditionen für Kreditverlängerung besprochen', status:'Erledigt' },
            { typ:'termin', datum:'08.01.2026', betreff:'Jahresgespräch Firma', inhalt:'Geschäftsentwicklung und Finanzierungsbedarf 2026', status:'Erledigt' },
            { typ:'brief', datum:'02.01.2026', betreff:'Kontoauszug Q4 2025', inhalt:'Quartalsauszug Geschäfts- + Privatkonten', status:'Versendet' }
        ],
        avatarBg:'#7c3aed', foto:null
    },
    'Sabine Kraus': {
        geburtsdatum:'27.08.1979', adresse:'Apothekenstr. 2, 35423 Lich', telefon:'+49 6404 66789', email:'s.kraus@email.de',
        beruf:'Apothekerin', familienstand:'Verheiratet', arbeitgeber:'Löwen-Apotheke', beschaeftigtSeit:'01.01.2008',
        nettoeinkommen:5000, kinder:[{name:'Paul',alter:8},{name:'Clara',alter:5}],
        risikoscore:18, bonitaet:87,
        nps: { score:7, kategorie:'passive', datum:'15.01.2026', kampagne:'Jahresumfrage 2026', details:[{name:'Beratungsqualität',wert:7},{name:'Zufriedenheit',wert:7},{name:'Weiterempfehlung',wert:7},{name:'Preis-Leistung',wert:7},{name:'Erreichbarkeit',wert:7}] },
        konten: [
            { produkt:'VR-Girokonto Komfort', details:'IBAN DE89 5066 1639 0022 3344 55', saldo:8900, eroeffnung:'01.01.2008', status:'Aktiv' },
            { produkt:'VR-Geschäftskonto', details:'Löwen-Apotheke', saldo:35000, eroeffnung:'01.01.2008', status:'Aktiv' },
            { produkt:'VR-Tagesgeld Extra', details:'Zinssatz 2,8% p.a.', saldo:45000, eroeffnung:'01.06.2018', status:'Aktiv' },
            { produkt:'Krankenversicherung ZV', details:'Privat-Zusatzvers., Familie', saldo:0, eroeffnung:'01.01.2020', status:'Aktiv' }
        ],
        fidaVertraege: [
            { institut:'Apobank', typ:'Girokonto', info:'Berufskonto Apotheker', consent:'10.01.2026', gueltig:'10.01.2027' },
            { institut:'Comdirect', typ:'Depot', info:'ETF + Einzelaktien €52.000', consent:'10.01.2026', gueltig:'10.01.2027' }
        ],
        kommunikation: [
            { typ:'email', datum:'25.01.2026', betreff:'Depot-Wechsel Angebot', inhalt:'VR-MeinDepot Vergleich zu Comdirect', status:'Geöffnet' },
            { typ:'call', datum:'18.01.2026', betreff:'Krankenversicherung Erweiterung', inhalt:'Zusatzversicherung für Kinder besprochen', status:'Erledigt' },
            { typ:'termin', datum:'10.01.2026', betreff:'Jahresgespräch', inhalt:'Finanzplanung Familie + Apotheke', status:'Erledigt' }
        ],
        avatarBg:'#be185d', foto:null
    }
};

// Default for any customer not explicitly defined
var bankDefaultKunde = {
    geburtsdatum:'01.01.1980', adresse:'Musterstr. 1, 35390 Gießen', telefon:'+49 641 00000', email:'kunde@email.de',
    beruf:'Angestellt', familienstand:'Ledig', arbeitgeber:'Firma GmbH', beschaeftigtSeit:'01.01.2010',
    nettoeinkommen:3500, kinder:[],
    risikoscore:25, bonitaet:75,
    nps: { score:7, kategorie:'passive', datum:'01.01.2026', kampagne:'Standard', details:[{name:'Beratungsqualität',wert:7},{name:'Zufriedenheit',wert:7},{name:'Weiterempfehlung',wert:7},{name:'Preis-Leistung',wert:7},{name:'Erreichbarkeit',wert:7}] },
    konten: [{ produkt:'VR-Girokonto', details:'Standardkonto', saldo:2500, eroeffnung:'01.01.2015', status:'Aktiv' }],
    fidaVertraege: [],
    kommunikation: [{ typ:'email', datum:'01.01.2026', betreff:'Willkommen', inhalt:'Begrüßung', status:'Versendet' }],
    avatarBg:'#64748b', foto:null
};

// ── CUSTOMER PHOTOS MAP ──
var bankKundenFotos = {
    'Klaus Fischer': 'assets/images/AdobeStock_624564221.jpeg',
    'Sandra Müller': 'assets/images/AdobeStock_252262042.jpeg',
    'Markus Wagner': 'assets/images/AdobeStock_361342769.jpeg',
    'Peter Hoffmann': 'assets/images/AdobeStock_612932760.jpeg'
};

// ── FILL KUNDEN DETAIL (main entry) ──
function fillBankKundenDetail(kundenName) {
    var kd = bankMockKunden[kundenName] || bankDefaultKunde;
    
    // Also try to find retail data from berater-overview
    var retailData = null;
    if (typeof bankKundenRetail !== 'undefined') {
        for (var i = 0; i < bankKundenRetail.length; i++) {
            if (bankKundenRetail[i].name === kundenName) { retailData = bankKundenRetail[i]; break; }
        }
    }
    
    // Fill Stammdaten
    setTextById('bankKundenName', kundenName);
    setTextById('bankKundenVermittlerId', retailData ? retailData.id : 'KDB000');
    setTextById('bankKundenGeburtsdatum', kd.geburtsdatum);
    setTextById('bankKundenAdresse', kd.adresse);
    setTextById('bankKundenTelefon', kd.telefon);
    setTextById('bankKundenEmail', kd.email);
    setTextById('bankKundenBeruf', kd.beruf);
    setTextById('bankKundenFamilienstand', kd.familienstand);
    setTextById('bankKundenArbeitgeber', kd.arbeitgeber);
    setTextById('bankKundenBeschaeftigt', kd.beschaeftigtSeit);
    setTextById('bankKundenEinkommen', '\u20AC' + kd.nettoeinkommen.toLocaleString('de-DE') + '/Mon.');
    
    // Kinder
    var kinderEl = document.getElementById('bankKundenKinder');
    if (kinderEl) {
        if (kd.kinder.length === 0) {
            kinderEl.innerHTML = '<span style="color:#94a3b8;">Keine</span>';
        } else {
            kinderEl.innerHTML = kd.kinder.map(function(k) { return '<span class="kinder-badge">' + k.name + ' (' + k.alter + ' Jahre)</span>'; }).join('');
        }
    }
    
    // Customer photo
    var fotoEl = document.getElementById('bankKundenFoto');
    if (fotoEl) {
        var fotoPath = bankKundenFotos[kundenName] || (kd.foto);
        if (fotoPath) {
            fotoEl.innerHTML = '<img src="' + fotoPath + '" style="width:100%;height:100%;object-fit:cover;border-radius:50%;" onerror="this.parentNode.innerHTML=\'<svg viewBox=&quot;0 0 24 24&quot; fill=&quot;none&quot; stroke=&quot;currentColor&quot; stroke-width=&quot;2&quot;><path d=&quot;M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2&quot;></path><circle cx=&quot;12&quot; cy=&quot;7&quot; r=&quot;4&quot;></circle></svg>\'">';
        } else {
            var bg = kd.avatarBg || '#64748b';
            var initials = getInitialsBerater(kundenName);
            fotoEl.innerHTML = '<div style="width:100%;height:100%;border-radius:50%;background:linear-gradient(135deg,' + bg + ',' + adjustColor(bg, -30) + ');display:flex;align-items:center;justify-content:center;font-size:32px;font-weight:700;color:white;">' + initials + '</div>';
        }
    }
    
    // Risikoscore
    var risikoEl = document.getElementById('bankRisikoScoreDisplay');
    if (risikoEl) {
        var rs = kd.risikoscore;
        var rColor = rs <= 30 ? '#16a34a' : (rs <= 60 ? '#d97706' : '#dc2626');
        var rLabel = rs <= 30 ? 'Niedrig' : (rs <= 60 ? 'Mittel' : 'Hoch');
        risikoEl.innerHTML = '<div style="display:flex;align-items:center;gap:8px;"><div class="score-bar-track" style="flex:1;height:8px;background:#e2e8f0;border-radius:4px;overflow:hidden;"><div class="score-bar-fill" style="height:100%;width:' + rs + '%;background:' + rColor + ';border-radius:4px;"></div></div><span class="score-bar-value" style="font-weight:600;color:' + rColor + ';">' + rs + ' (' + rLabel + ')</span></div>';
    }
    
    // Bonitaetsscore
    var bonitaetEl = document.getElementById('bankBonitaetScoreDisplay');
    if (bonitaetEl) {
        var bs = kd.bonitaet;
        var bColor = bs >= 70 ? '#16a34a' : (bs >= 40 ? '#d97706' : '#dc2626');
        var bLabel = bs >= 70 ? 'Gut' : (bs >= 40 ? 'Mittel' : 'Schwach');
        bonitaetEl.innerHTML = '<div style="display:flex;align-items:center;gap:8px;"><div class="score-bar-track" style="flex:1;height:8px;background:#e2e8f0;border-radius:4px;overflow:hidden;"><div class="score-bar-fill" style="height:100%;width:' + bs + '%;background:' + bColor + ';border-radius:4px;"></div></div><span class="score-bar-value" style="font-weight:600;color:' + bColor + ';">' + bs + ' (' + bLabel + ')</span></div>';
    }
    
    // NPS
    var npsEl = document.getElementById('bankKundenNpsBadge');
    if (npsEl) {
        var nps = kd.nps;
        var stars = '';
        for (var s = 1; s <= 10; s++) {
            stars += '<span style="color:' + (s <= nps.score ? '#f59e0b' : '#e2e8f0') + ';">\u2605</span>';
        }
        npsEl.innerHTML = '<span class="nps-stars-display">' + stars + '</span> <span style="font-weight:600;">' + nps.score + '/10</span> <span class="status-badge ' + (nps.kategorie === 'promoter' ? 'aktiv' : (nps.kategorie === 'passive' ? 'antrag' : 'storniert')) + '" style="font-size:10px;">' + nps.kategorie.charAt(0).toUpperCase() + nps.kategorie.slice(1) + '</span>';
    }
    
    // CLV (simplified calculation)
    var clv = calculateBankCLV(kd, retailData);
    var clvValEl = document.getElementById('bankClvHeaderValue');
    if (clvValEl) clvValEl.textContent = '\u20AC' + clv.value.toLocaleString('de-DE');
    var clvSegEl = document.getElementById('bankClvHeaderSegment');
    if (clvSegEl) clvSegEl.textContent = clv.segment;
    var clvDetailEl = document.getElementById('bankClvDetailContent');
    if (clvDetailEl) {
        clvDetailEl.innerHTML = '<div class="clv-summary" style="display:grid;grid-template-columns:repeat(4,1fr);gap:12px;padding:16px;">' +
            '<div style="text-align:center;padding:12px;background:#f8fafc;border-radius:8px;"><div style="font-size:11px;color:#64748b;text-transform:uppercase;">Gesamt CLV</div><div style="font-size:20px;font-weight:700;color:#1e293b;">\u20AC' + clv.value.toLocaleString('de-DE') + '</div></div>' +
            '<div style="text-align:center;padding:12px;background:#f8fafc;border-radius:8px;"><div style="font-size:11px;color:#64748b;text-transform:uppercase;">Segment</div><div style="font-size:20px;font-weight:700;color:#1e293b;">' + clv.segment + '</div></div>' +
            '<div style="text-align:center;padding:12px;background:#f8fafc;border-radius:8px;"><div style="font-size:11px;color:#64748b;text-transform:uppercase;">Haltedauer (Prognose)</div><div style="font-size:20px;font-weight:700;color:#1e293b;">' + clv.haltedauer + ' J.</div></div>' +
            '<div style="text-align:center;padding:12px;background:#f8fafc;border-radius:8px;"><div style="font-size:11px;color:#64748b;text-transform:uppercase;">Abwanderungsrisiko</div><div style="font-size:20px;font-weight:700;color:' + (clv.churnRisk < 10 ? '#16a34a' : '#dc2626') + ';">' + clv.churnRisk + '%</div></div>' +
            '</div>';
    }
    
    // Sticky bar
    fillBankStickyBar(kundenName, retailData, kd, clv);
    
    // Fill Konten tab
    fillBankKonten(kd);
    
    // Fill FIDA tab
    fillBankFida(kd);
    
    // Fill Impulse tab
    fillBankImpulse(kundenName, kd, retailData);
    
    // Fill Finanzplanung tab
    fillBankFinanzplanung(kd);
    
    // Fill Kommunikation tab
    fillBankKommunikation(kd);
    
    // Switch to Stammdaten tab
    switchBankKundenTab('stammdaten');
}

function setTextById(id, text) {
    var el = document.getElementById(id);
    if (el) el.textContent = text;
}

function adjustColor(hex, amount) {
    hex = hex.replace('#', '');
    var r = Math.max(0, Math.min(255, parseInt(hex.substring(0,2), 16) + amount));
    var g = Math.max(0, Math.min(255, parseInt(hex.substring(2,4), 16) + amount));
    var b = Math.max(0, Math.min(255, parseInt(hex.substring(4,6), 16) + amount));
    return '#' + r.toString(16).padStart(2,'0') + g.toString(16).padStart(2,'0') + b.toString(16).padStart(2,'0');
}

function calculateBankCLV(kd, retailData) {
    var ertrag = retailData ? retailData.ertrag : 2000;
    var years = 15;
    if (kd.nps.score >= 8) years = 20;
    if (kd.nps.score <= 5) years = 8;
    var value = Math.round(ertrag * years * 0.85);
    var segment = value >= 50000 ? 'Platinum' : (value >= 25000 ? 'Gold' : (value >= 10000 ? 'Silber' : 'Standard'));
    var churnRisk = kd.nps.score >= 8 ? 5 : (kd.nps.score >= 6 ? 12 : 25);
    return { value:value, segment:segment, haltedauer:years, churnRisk:churnRisk };
}

// ── STICKY BAR ──
function fillBankStickyBar(kundenName, retailData, kd, clv) {
    var nameEl = document.getElementById('bankKundeBarName');
    if (nameEl) nameEl.textContent = kundenName;
    var idEl = document.getElementById('bankKundeBarId');
    if (idEl) idEl.textContent = retailData ? retailData.id : 'KDB000';
    
    // Avatar in sticky bar
    var avatarEl = document.getElementById('bankKundeStickyAvatar');
    if (avatarEl) {
        var fotoPath = bankKundenFotos[kundenName] || (kd.foto);
        if (fotoPath) {
            avatarEl.innerHTML = '<img src="' + fotoPath + '" style="width:100%;height:100%;object-fit:cover;border-radius:50%;">';
        } else {
            var bg = kd.avatarBg || '#64748b';
            avatarEl.innerHTML = '<div style="width:100%;height:100%;border-radius:50%;background:' + bg + ';display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:700;color:white;">' + getInitialsBerater(kundenName) + '</div>';
        }
    }
    
    // NPS stars
    var npsEl = document.getElementById('bankKundeBarNps');
    if (npsEl) {
        var stars = '';
        for (var i = 1; i <= 5; i++) {
            var filled = (kd.nps.score / 2) >= i;
            stars += '<span style="color:' + (filled ? '#f59e0b' : '#e2e8f0') + ';font-size:12px;">\u2605</span>';
        }
        npsEl.innerHTML = stars;
    }
    
    var clvEl = document.getElementById('bankKundeBarClv');
    if (clvEl) clvEl.textContent = '\u20AC' + clv.value.toLocaleString('de-DE');
    
    var segEl = document.getElementById('bankKundeBarSegment');
    if (segEl) segEl.textContent = clv.segment;
}

// ── TAB SWITCHING ──
function switchBankKundenTab(tabName) {
    // Deactivate all
    var tabs = document.querySelectorAll('#kundenDetailBankPage .kunden-tab-content');
    tabs.forEach(function(t) { t.classList.remove('active'); });
    
    // Activate target
    var tabMap = {
        'stammdaten': 'bankTabStammdaten',
        'konten': 'bankTabKonten',
        'fida': 'bankTabFida',
        'impulse': 'bankTabImpulse',
        'finanzplanung': 'bankTabFinanzplanung',
        'kommunikation': 'bankTabKommunikation'
    };
    var target = document.getElementById(tabMap[tabName]);
    if (target) target.classList.add('active');
    
    // Update tab button states
    var btns = document.querySelectorAll('#bankKundenTabs .kunden-tab');
    btns.forEach(function(b) {
        b.classList.toggle('active', b.getAttribute('data-tab') === tabName);
    });
}

// ── FILL KONTEN TAB ──
function fillBankKonten(kd) {
    var el = document.getElementById('bankKundenKonten');
    if (!el) return;
    var countEl = document.getElementById('bankProdukteCount');
    if (countEl) countEl.textContent = kd.konten.length + ' Produkte';
    
    var rows = '';
    kd.konten.forEach(function(k) {
        var saldoColor = k.saldo >= 0 ? '#1e293b' : '#dc2626';
        var saldoStr = k.saldo < 0 ? '-\u20AC' + Math.abs(k.saldo).toLocaleString('de-DE') : '\u20AC' + k.saldo.toLocaleString('de-DE');
        rows += '<tr><td><strong>' + k.produkt + '</strong></td><td>' + k.details + '</td><td class="text-right" style="color:' + saldoColor + ';font-weight:600;">' + saldoStr + '</td><td>' + k.eroeffnung + '</td><td><span class="status-badge aktiv">' + k.status + '</span></td></tr>';
    });
    el.innerHTML = rows;
}

// ── FILL FIDA TAB ──
function fillBankFida(kd) {
    // Status grid
    var statusEl = document.getElementById('bankFidaStatusGrid');
    if (statusEl) {
        var hasConsent = kd.fidaVertraege.length > 0;
        statusEl.innerHTML = '<div style="display:grid;grid-template-columns:repeat(4,1fr);gap:12px;padding:16px;">' +
            '<div style="text-align:center;padding:12px;background:#f8fafc;border-radius:8px;"><div style="font-size:11px;color:#64748b;">Consent-Status</div><div style="font-size:14px;font-weight:700;"><span class="status-badge ' + (hasConsent?'aktiv':'storniert') + '">' + (hasConsent?'Aktiv':'Nicht erteilt') + '</span></div></div>' +
            '<div style="text-align:center;padding:12px;background:#f8fafc;border-radius:8px;"><div style="font-size:11px;color:#64748b;">Erteilt am</div><div style="font-size:14px;font-weight:700;">' + (hasConsent ? kd.fidaVertraege[0].consent : '&mdash;') + '</div></div>' +
            '<div style="text-align:center;padding:12px;background:#f8fafc;border-radius:8px;"><div style="font-size:11px;color:#64748b;">Gültig bis</div><div style="font-size:14px;font-weight:700;">' + (hasConsent ? kd.fidaVertraege[0].gueltig : '&mdash;') + '</div></div>' +
            '<div style="text-align:center;padding:12px;background:#f8fafc;border-radius:8px;"><div style="font-size:11px;color:#64748b;">Datenquellen</div><div style="font-size:14px;font-weight:700;">' + kd.fidaVertraege.length + '</div></div>' +
            '</div>';
    }
    
    // External connections table
    var tableEl = document.getElementById('bankFidaVertraege');
    if (tableEl) {
        if (kd.fidaVertraege.length === 0) {
            tableEl.innerHTML = '<tr><td colspan="5" style="text-align:center;color:#94a3b8;padding:24px;">Kein Open Finance Consent erteilt. FIDA-Consent anfordern um Drittbank-Daten zu analysieren.</td></tr>';
        } else {
            var rows = '';
            kd.fidaVertraege.forEach(function(f) {
                var logo = (typeof versichererLogoImg === 'function') ? versichererLogoImg(f.institut, 18) : '';
                rows += '<tr><td>' + logo + ' <strong>' + f.institut + '</strong></td><td>' + f.typ + '</td><td>' + f.info + '</td><td>' + f.consent + '</td><td>' + f.gueltig + '</td></tr>';
            });
            tableEl.innerHTML = rows;
        }
    }
    
    // Bedarfsfeld cards (simplified content)
    var bezahlenEl = document.getElementById('bankFidaBezahlenContent');
    if (bezahlenEl && kd.fidaVertraege.length > 0) {
        bezahlenEl.innerHTML = '<div style="padding:16px;"><div class="fida-finance-grid" style="display:grid;grid-template-columns:repeat(3,1fr);gap:12px;">' +
            '<div style="padding:12px;background:#f0fdf4;border-radius:8px;text-align:center;"><div style="font-size:11px;color:#64748b;">Nettoeinkommen</div><div style="font-size:18px;font-weight:700;color:#16a34a;">\u20AC' + kd.nettoeinkommen.toLocaleString('de-DE') + '</div></div>' +
            '<div style="padding:12px;background:#fef2f2;border-radius:8px;text-align:center;"><div style="font-size:11px;color:#64748b;">Ausgaben (Schnitt)</div><div style="font-size:18px;font-weight:700;color:#dc2626;">\u20AC' + Math.round(kd.nettoeinkommen * 0.65).toLocaleString('de-DE') + '</div></div>' +
            '<div style="padding:12px;background:#eff6ff;border-radius:8px;text-align:center;"><div style="font-size:11px;color:#64748b;">Freies Einkommen</div><div style="font-size:18px;font-weight:700;color:#2563eb;">\u20AC' + Math.round(kd.nettoeinkommen * 0.35).toLocaleString('de-DE') + '</div></div>' +
            '</div></div>';
    }

    // ── BEDARFSFELD: SPAREN & VORSORGEN ──
    var sparenEl = document.getElementById('bankFidaSparenContent');
    if (sparenEl) {
        var sparenHtml = '';
        // Geldmarkt
        var geldmarkt = kd.sparenGeldmarkt || [];
        if (geldmarkt.length > 0) {
            var totalGeld = 0;
            sparenHtml += '<div class="bedarfsfeld-section" style="padding:0 16px 16px;"><h4 class="section-subtitle" style="font-size:13px;font-weight:600;color:#475569;margin:16px 0 8px;">Geldmarkt</h4>' +
                '<table class="kunden-table fida-table"><thead><tr><th>Produkt</th><th>Anbieter</th><th>Volumen</th><th>Zinssatz</th><th>Laufzeit</th></tr></thead><tbody>';
            geldmarkt.forEach(function(g) {
                totalGeld += g.volumen;
                var gLogo = (typeof versichererLogoImg === 'function') ? versichererLogoImg(g.anbieter, 16) : '';
                sparenHtml += '<tr><td><strong>' + g.produkt + '</strong>' + (g.quelle === 'FIDA' ? ' <span style="font-size:10px;background:#dbeafe;color:#1e40af;padding:1px 6px;border-radius:10px;">FIDA</span>' : '') + '</td>' +
                    '<td>' + gLogo + ' ' + g.anbieter + '</td><td>\u20AC' + g.volumen.toLocaleString('de-DE') + '</td><td>' + g.zinssatz + '</td><td>' + g.laufzeit + '</td></tr>';
            });
            sparenHtml += '<tr style="background:#f8fafc;font-weight:600;"><td>Gesamt Geldmarkt</td><td></td><td>\u20AC' + totalGeld.toLocaleString('de-DE') + '</td><td></td><td></td></tr>';
            sparenHtml += '</tbody></table></div>';
        }
        // Kapitalmarkt
        var kapital = kd.sparenKapitalmarkt || [];
        if (kapital.length > 0) {
            var totalKap = 0;
            sparenHtml += '<div class="bedarfsfeld-section" style="padding:0 16px 16px;"><h4 class="section-subtitle" style="font-size:13px;font-weight:600;color:#475569;margin:16px 0 8px;">Kapitalmarkt</h4>' +
                '<table class="kunden-table fida-table"><thead><tr><th>Produkt</th><th>Anbieter</th><th>Volumen</th><th>Sparrate</th><th>Performance YTD</th></tr></thead><tbody>';
            kapital.forEach(function(k) {
                totalKap += k.volumen;
                var kLogo = (typeof versichererLogoImg === 'function') ? versichererLogoImg(k.anbieter, 16) : '';
                sparenHtml += '<tr><td><strong>' + k.produkt + '</strong>' + (k.quelle === 'FIDA' ? ' <span style="font-size:10px;background:#dbeafe;color:#1e40af;padding:1px 6px;border-radius:10px;">FIDA</span>' : '') + '</td>' +
                    '<td>' + kLogo + ' ' + k.anbieter + '</td><td>\u20AC' + k.volumen.toLocaleString('de-DE') + '</td><td>' + k.sparrate + '</td><td style="color:#16a34a;">' + k.performance + '</td></tr>';
            });
            sparenHtml += '<tr style="background:#f8fafc;font-weight:600;"><td>Gesamt Depot</td><td></td><td>\u20AC' + totalKap.toLocaleString('de-DE') + '</td><td></td><td></td></tr>';
            sparenHtml += '</tbody></table></div>';
        }
        if (sparenHtml === '') {
            sparenHtml = '<div style="padding:24px;text-align:center;color:#94a3b8;">Keine Spar- oder Vorsorgeprodukte vorhanden.</div>';
        }
        sparenEl.innerHTML = sparenHtml;
    }

    // ── BEDARFSFELD: ABSICHERN ──
    var absichernEl = document.getElementById('bankFidaAbsichernContent');
    if (absichernEl) {
        var absHtml = '';
        // Eigene Versicherungen (Genossenschaftliche Partner)
        var eigen = kd.versicherungenEigen || [];
        if (eigen.length > 0) {
            absHtml += '<div class="bedarfsfeld-section" style="padding:0 16px 16px;"><h4 class="section-subtitle" style="font-size:13px;font-weight:600;color:#475569;margin:16px 0 8px;">Eigene Versicherungen (R+V / VR)</h4>' +
                '<table class="kunden-table fida-table"><thead><tr><th>Versicherung</th><th>Anbieter</th><th>Deckungssumme</th><th>Tarifart</th><th>Leistungsumfang</th><th>Prämie</th><th>Vertragsnr.</th></tr></thead><tbody>';
            eigen.forEach(function(v) {
                var tags = v.leistungen.map(function(l) { return '<span class="leistung-tag" style="display:inline-block;font-size:10px;background:#f1f5f9;color:#475569;padding:2px 6px;border-radius:4px;margin:1px;">' + l + '</span>'; }).join(' ');
                var eLogo = (typeof versichererLogoImg === 'function') ? versichererLogoImg(v.anbieter, 16) : '';
                absHtml += '<tr><td><strong>' + v.versicherung + '</strong></td><td>' + eLogo + ' ' + v.anbieter + '</td><td>' + v.deckung + '</td>' +
                    '<td><span class="tarif-badge" style="font-size:10px;padding:2px 8px;border-radius:10px;background:#dbeafe;color:#1e40af;">' + v.tarifart + '</span></td>' +
                    '<td>' + tags + '</td><td>' + v.praemie + '</td><td>' + v.vertrag + '</td></tr>';
            });
            absHtml += '</tbody></table></div>';
        }
        // Fremd-Versicherungen (Wettbewerber)
        var fremd = kd.versicherungenFremd || [];
        if (fremd.length > 0) {
            absHtml += '<div class="bedarfsfeld-section" style="padding:0 16px 16px;"><h4 class="section-subtitle" style="font-size:13px;font-weight:600;color:#475569;margin:16px 0 8px;">Wettbewerber-Versicherungen</h4>' +
                '<table class="kunden-table fida-table"><thead><tr><th>Versicherung</th><th>Anbieter</th><th>Deckungssumme</th><th>Tarifart</th><th>Leistungsumfang</th><th>Selbstbehalt</th><th>Prämie</th><th>Kündigungsfrist</th></tr></thead><tbody>';
            fremd.forEach(function(v) {
                var tags = v.leistungen.map(function(l) { return '<span class="leistung-tag" style="display:inline-block;font-size:10px;background:#f1f5f9;color:#475569;padding:2px 6px;border-radius:4px;margin:1px;">' + l + '</span>'; }).join(' ');
                var fLogo = (typeof versichererLogoImg === 'function') ? versichererLogoImg(v.anbieter, 16) : '';
                absHtml += '<tr><td><strong>' + v.versicherung + '</strong></td><td>' + fLogo + ' ' + v.anbieter + '</td><td>' + v.deckung + '</td>' +
                    '<td><span class="tarif-badge" style="font-size:10px;padding:2px 8px;border-radius:10px;background:#fef3c7;color:#92400e;">' + v.tarifart + '</span></td>' +
                    '<td>' + tags + '</td><td>' + v.selbstbehalt + '</td><td>' + v.praemie + '</td><td>' + v.kuendigung + '</td></tr>';
            });
            absHtml += '</tbody></table></div>';
        }
        if (absHtml === '') {
            absHtml = '<div style="padding:24px;text-align:center;color:#94a3b8;">Keine Versicherungsdaten vorhanden.</div>';
        }
        absichernEl.innerHTML = absHtml;
    }

    // ── BEDARFSFELD: FINANZIEREN ──
    var finanzEl = document.getElementById('bankFidaFinanzierenContent');
    if (finanzEl) {
        var finHtml = '';
        var finanz = kd.finanzierungen || [];
        if (finanz.length > 0) {
            var totalRest = 0;
            finHtml += '<div style="padding:0 16px 16px;"><table class="kunden-table fida-table"><thead><tr><th>Kredit</th><th>Kreditgeber</th><th>Ursprungsbetrag</th><th>Restschuld</th><th>Zinssatz</th><th>Rate</th><th>Laufzeit bis</th><th>Absicherung</th></tr></thead><tbody>';
            finanz.forEach(function(f) {
                totalRest += f.restschuld;
                var fkLogo = (typeof versichererLogoImg === 'function') ? versichererLogoImg(f.kreditgeber, 16) : '';
                finHtml += '<tr><td><strong>' + f.kredit + '</strong></td><td>' + fkLogo + ' ' + f.kreditgeber + '</td>' +
                    '<td>\u20AC' + f.ursprung.toLocaleString('de-DE') + '</td><td>\u20AC' + f.restschuld.toLocaleString('de-DE') + '</td>' +
                    '<td>' + f.zinssatz + '</td><td>' + f.rate + '</td><td>' + f.laufzeit + '</td><td>' + f.absicherung + '</td></tr>';
            });
            finHtml += '<tr style="background:#f8fafc;font-weight:600;"><td>Gesamt Verbindlichkeiten</td><td></td><td></td><td>\u20AC' + totalRest.toLocaleString('de-DE') + '</td><td></td><td></td><td></td><td></td></tr>';
            finHtml += '</tbody></table></div>';
            // Hinweise
            finanz.forEach(function(f) {
                if (f.hinweis) {
                    finHtml += '<div style="margin:0 16px 16px;padding:12px 16px;background:#fef3c7;border-left:4px solid #f59e0b;border-radius:4px;font-size:13px;color:#92400e;">' +
                        '<strong>Hinweis:</strong> ' + f.hinweis + '</div>';
                }
            });
        } else {
            finHtml = '<div style="padding:24px;text-align:center;color:#94a3b8;">Keine Finanzierungen vorhanden.</div>';
        }
        finanzEl.innerHTML = finHtml;
    }
}

// ── FILL IMPULSE TAB ──
function fillBankImpulse(kundenName, kd, retailData) {
    var el = document.getElementById('bankImpulseContent');
    if (!el) return;

    var impulse = [];
    // Impulse generiert durch Truuco Impulsmanager (Data Intelligence Platform / genoGPT)
    if (!retailData || !retailData.finanzplan) {
        impulse.push({
            id: 'bank-impuls-finanzplan', icon:'plan',
            title:'VR-FinanzPlan erstellen (OKP-Beratungsstrecke)',
            beschr:'Kein FinanzPlan vorhanden. Ganzheitliche Beratung empfohlen.',
            prio:'high', quelle:'Intern',
            herleitung: [
                { label:'Datenquelle', value:'Interne Kundendaten' },
                { label:'Erkannte Situation', value:'Kein VR-FinanzPlan hinterlegt' },
                { label:'Empfehlung', value:'Ganzheitliche Finanzplanung erstellen, alle Lebensbereiche abdecken' }
            ],
            produkt: 'VR-FinanzPlan', empfehlung: 'Ganzheitliche Beratung inkl. Vorsorge, Absicherung, Vermögen'
        });
    }
    if (kd.fidaVertraege.length > 0) {
        var fidaInfo = kd.fidaVertraege.map(function(f) { return f.institut + ' (' + f.typ + ')'; }).join(', ');
        impulse.push({
            id: 'bank-impuls-crossselling', icon:'fida',
            title:'Cross-Selling aus Open Finance',
            beschr:'Drittbank-Daten zeigen Optimierungspotential. Konsolidierung empfohlen.',
            prio:'high', quelle:'FIDA',
            herleitung: [
                { label:'Datenquelle', value:'Open Finance (FIDA) - ' + kd.fidaVertraege.length + ' Drittbank-Vertr\u00e4ge' },
                { label:'Erkannte Situation', value: fidaInfo },
                { label:'Optimierungspotential', value:'Konsolidierung der Konten/Depots f\u00fcr bessere Konditionen und \u00dcbersicht' },
                { label:'Empfehlung', value:'Beratungsgespr\u00e4ch zur Konsolidierung und Produktoptimierung' }
            ],
            produkt: 'Kontokonsolidierung', empfehlung: 'Drittbank-Produkte in VR-Angebote \u00fcberf\u00fchren'
        });
    } else {
        impulse.push({
            id: 'bank-impuls-fida', icon:'fida',
            title:'FIDA-Consent einholen',
            beschr:'Open Finance Daten fehlen. Consent anfordern f\u00fcr vollst\u00e4ndige Analyse.',
            prio:'medium', quelle:'System',
            herleitung: [
                { label:'Datenquelle', value:'System - Keine Open Finance Daten vorhanden' },
                { label:'Erkannte Situation', value:'Kundeneinwilligung f\u00fcr FIDA fehlt' },
                { label:'Empfehlung', value:'FIDA-Consent im n\u00e4chsten Beratungsgespr\u00e4ch einholen' }
            ],
            produkt: 'FIDA-Consent', empfehlung: 'Open Finance Einwilligung f\u00fcr ganzheitliche Analyse'
        });
    }
    if (kd.konten.length < 4) {
        impulse.push({
            id: 'bank-impuls-cross', icon:'cross',
            title:'Produktbreite erh\u00f6hen',
            beschr:'Nur ' + kd.konten.length + ' Produkte. Cross-Selling-Potential identifiziert.',
            prio:'medium', quelle:'KI',
            herleitung: [
                { label:'Datenquelle', value:'Interne Produktanalyse (KI)' },
                { label:'Erkannte Situation', value:'Nur ' + kd.konten.length + ' aktive Produkte \u2013 unter Durchschnitt' },
                { label:'Empfehlung', value:'Passende Zusatzprodukte je nach Lebenssituation anbieten' }
            ],
            produkt: 'Cross-Selling Paket', empfehlung: 'Produktportfolio erweitern'
        });
    }
    if (kd.nps.score <= 6) {
        impulse.push({
            id: 'bank-impuls-nps', icon:'nps',
            title:'Kundenzufriedenheit verbessern',
            beschr:'NPS Score ' + kd.nps.score + '/10. Pers\u00f6nliches Gespr\u00e4ch empfohlen.',
            prio:'high', quelle:'NPS',
            herleitung: [
                { label:'Datenquelle', value:'NPS-Umfrage ' + (kd.nps.kampagne || '') },
                { label:'Erkannte Situation', value:'NPS Score ' + kd.nps.score + '/10 \u2013 Detractor/Passive' },
                { label:'Schwachstellen', value: kd.nps.details ? kd.nps.details.filter(function(d){return d.wert<=6;}).map(function(d){return d.name+' ('+d.wert+'/10)';}).join(', ') || 'Keine kritischen Einzelwerte' : 'Keine Details' },
                { label:'Empfehlung', value:'Pers\u00f6nliches Gespr\u00e4ch zur Zufriedenheitsverbesserung' }
            ],
            produkt: 'Kundenr\u00fcckgewinnung', empfehlung: 'Pers\u00f6nliches Gespr\u00e4ch und Service-Upgrade'
        });
    }

    // Baufinanzierung Anschluss prüfen
    var hasBaufi = kd.konten.some(function(k) { return k.produkt.indexOf('Baufinanzierung') >= 0; });
    if (hasBaufi) {
        var baufi = kd.konten.find(function(k) { return k.produkt.indexOf('Baufinanzierung') >= 0; });
        impulse.push({
            id: 'bank-impuls-baufi', icon:'finanz',
            title:'Anschlussfinanzierung pr\u00fcfen',
            beschr:'Baufinanzierung vorhanden. Zinsbindung und Konditionen pr\u00fcfen.',
            prio:'high', quelle:'KI',
            herleitung: [
                { label:'Datenquelle', value:'Interne Kreditdaten' },
                { label:'Erkannte Situation', value: baufi.produkt + ' \u2013 ' + baufi.details },
                { label:'Restschuld', value: baufi.saldo ? '\u20AC' + Math.abs(baufi.saldo).toLocaleString('de-DE') : 'k.A.' },
                { label:'Empfehlung', value:'Fr\u00fchzeitig Anschlusskonditionen anbieten, Prolongation sichern' }
            ],
            produkt: 'Anschlussfinanzierung', empfehlung: 'G\u00fcnstigere Konditionen f\u00fcr Restschuld'
        });
    }

    impulse.push({
        id: 'bank-impuls-vorsorge', icon:'vorsorge',
        title:'Altersvorsorge pr\u00fcfen (Union Investment / R+V)',
        beschr:'Versorgungsl\u00fccke im Alter durch Truuco Impulsmanager identifiziert. Verbundpartner-Beratung empfohlen.',
        prio:'medium', quelle:'Truuco',
        herleitung: [
            { label:'Datenquelle', value:'Truuco Impulsmanager \u2013 genoGPT Einkommens- und Vorsorgeanalyse' },
            { label:'Erkannte Situation', value:'Nettoeinkommen \u20AC' + (kd.nettoeinkommen || 0).toLocaleString('de-DE') + ' \u2013 Versorgungsl\u00fccke wahrscheinlich' },
            { label:'Verbundpartner', value:'Union Investment (UniProfiRente, VermögenPlus), R+V (BU-Versicherung), Schwäbisch Hall (Wohn-Riester)' },
            { label:'Empfehlung', value:'Rentenl\u00fccken-Analyse via VR-FinanzPlan (OKP), Zusatzvorsorge \u00fcber Verbundpartner empfehlen' }
        ],
        produkt: 'Altersvorsorge', empfehlung: 'Rentenl\u00fccke schlie\u00dfen mit VR-Vorsorgekonzept'
    });

    var iconSvgs = {
        plan: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="24" height="24"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>',
        fida: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="24" height="24"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z"/></svg>',
        cross: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="24" height="24"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="9" y1="21" x2="9" y2="9"/></svg>',
        nps: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="24" height="24"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>',
        vorsorge: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="24" height="24"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>',
        finanz: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="24" height="24"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>'
    };

    var expandSvg = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><polyline points="6 9 12 15 18 9"></polyline></svg>';

    var html = '';
    impulse.forEach(function(imp) {
        // Clickable header
        html += '<div class="impuls-item highlight clickable" onclick="toggleImpulsDetail(\'' + imp.id + '\')">' +
            '<div class="impuls-icon">' + (iconSvgs[imp.icon] || '') + '</div>' +
            '<div class="impuls-text">' +
                '<strong>' + imp.title + '</strong>' +
                '<p>' + (imp.quelle === 'FIDA' ? '<span class="fida-source-badge small">Open Finance</span> ' : '') + imp.beschr + '</p>' +
            '</div>' +
            '<span class="impuls-priority ' + imp.prio + '">' + (imp.prio==='high'?'Hohe Priorit\u00e4t':'Mittlere Priorit\u00e4t') + '</span>' +
            '<span class="impuls-expand">' + expandSvg + '</span>' +
        '</div>';

        // Expandable detail panel
        html += '<div class="impuls-detail" id="' + imp.id + '" style="display:none;">' +
            '<div class="impuls-detail-section">' +
                '<h4>Herleitung des Impulses</h4>' +
                '<div class="herleitung-grid">';

        if (imp.herleitung) {
            imp.herleitung.forEach(function(h) {
                html += '<div class="herleitung-item">' +
                    '<span class="herleitung-label">' + h.label + '</span>' +
                    '<span class="herleitung-value">' + h.value + '</span>' +
                '</div>';
            });
        }

        html += '</div></div>' +
            '<div class="impuls-detail-section">' +
                '<h4>Aktionen</h4>' +
                '<div class="impuls-actions">' +
                    '<button class="action-btn primary" onclick="event.stopPropagation();">' +
                        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>' +
                        ' Angebot erstellen' +
                    '</button>' +
                    '<button class="action-btn secondary" onclick="event.stopPropagation();">' +
                        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>' +
                        ' Termin vereinbaren' +
                    '</button>' +
                '</div>' +
            '</div>' +
        '</div>';
    });
    el.innerHTML = html;
}

// ── FILL FINANZPLANUNG TAB ──
function fillBankFinanzplanung(kd) {
    var liqEl = document.getElementById('bankLiquiditaetContent');
    if (liqEl) {
        var einkommen = kd.nettoeinkommen;
        var fixeAusgaben = Math.round(einkommen * 0.45);
        var variableAusgaben = Math.round(einkommen * 0.20);
        var frei = einkommen - fixeAusgaben - variableAusgaben;
        var sparquote = Math.round(frei / einkommen * 100);
        
        liqEl.innerHTML = '<div style="padding:16px;">' +
            '<div class="liquiditaet-row" style="display:flex;align-items:center;gap:12px;padding:8px 0;border-bottom:1px solid #f1f5f9;"><span style="flex:1;font-size:13px;">Nettoeinkommen (fix)</span><div style="width:200px;height:8px;background:#e2e8f0;border-radius:4px;overflow:hidden;"><div style="height:100%;width:100%;background:#16a34a;border-radius:4px;"></div></div><span style="width:100px;text-align:right;font-weight:600;">\u20AC' + einkommen.toLocaleString('de-DE') + '</span></div>' +
            '<div class="liquiditaet-row" style="display:flex;align-items:center;gap:12px;padding:8px 0;border-bottom:1px solid #f1f5f9;"><span style="flex:1;font-size:13px;">Fixe Ausgaben</span><div style="width:200px;height:8px;background:#e2e8f0;border-radius:4px;overflow:hidden;"><div style="height:100%;width:45%;background:#dc2626;border-radius:4px;"></div></div><span style="width:100px;text-align:right;font-weight:600;color:#dc2626;">-\u20AC' + fixeAusgaben.toLocaleString('de-DE') + '</span></div>' +
            '<div class="liquiditaet-row" style="display:flex;align-items:center;gap:12px;padding:8px 0;border-bottom:1px solid #f1f5f9;"><span style="flex:1;font-size:13px;">Variable Ausgaben</span><div style="width:200px;height:8px;background:#e2e8f0;border-radius:4px;overflow:hidden;"><div style="height:100%;width:20%;background:#f59e0b;border-radius:4px;"></div></div><span style="width:100px;text-align:right;font-weight:600;color:#f59e0b;">-\u20AC' + variableAusgaben.toLocaleString('de-DE') + '</span></div>' +
            '<div class="liquiditaet-row" style="display:flex;align-items:center;gap:12px;padding:12px 0;border-top:2px solid #1e293b;margin-top:8px;"><span style="flex:1;font-size:14px;font-weight:700;">Freies Einkommen</span><div style="width:200px;height:8px;background:#e2e8f0;border-radius:4px;overflow:hidden;"><div style="height:100%;width:' + (frei/einkommen*100) + '%;background:#2563eb;border-radius:4px;"></div></div><span style="width:100px;text-align:right;font-weight:700;color:#2563eb;">\u20AC' + frei.toLocaleString('de-DE') + '</span></div>' +
            '<div style="margin-top:16px;padding:12px;background:#eff6ff;border-radius:8px;border-left:3px solid #2563eb;"><strong>Sparquote: ' + sparquote + '%</strong> &mdash; ' + (sparquote >= 20 ? 'Gute Sparquote. Potential für Anlage-Beratung.' : 'Unter Durchschnitt. Budgetberatung empfohlen.') + '</div>' +
            '</div>';
    }
    
    var sparEl = document.getElementById('bankSparzieleContent');
    if (sparEl) {
        sparEl.innerHTML = '<div style="padding:16px;">' +
            '<div style="padding:16px;border:1px solid #e2e8f0;border-radius:8px;margin-bottom:12px;">' +
            '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;"><strong>Eigenheim-Renovierung</strong><span class="status-badge aktiv">Aktiv</span></div>' +
            '<div style="height:8px;background:#e2e8f0;border-radius:4px;overflow:hidden;margin-bottom:4px;"><div style="height:100%;width:65%;background:#16a34a;border-radius:4px;"></div></div>' +
            '<div style="display:flex;justify-content:space-between;font-size:12px;color:#64748b;"><span>\u20AC32.500 von \u20AC50.000</span><span>65%</span></div></div>' +
            '<div style="padding:16px;border:1px solid #e2e8f0;border-radius:8px;">' +
            '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;"><strong>Ausbildung Kinder</strong><span class="status-badge antrag">Geplant</span></div>' +
            '<div style="height:8px;background:#e2e8f0;border-radius:4px;overflow:hidden;margin-bottom:4px;"><div style="height:100%;width:28%;background:#2563eb;border-radius:4px;"></div></div>' +
            '<div style="display:flex;justify-content:space-between;font-size:12px;color:#64748b;"><span>\u20AC14.000 von \u20AC50.000</span><span>28%</span></div></div>' +
            '</div>';
    }
}

// ── FILL KOMMUNIKATION TAB ──
function fillBankKommunikation(kd) {
    var el = document.getElementById('bankKundenKommunikation');
    if (!el) return;
    
    var iconMap = {
        email: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>',
        call: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/></svg>',
        termin: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>',
        brief: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>'
    };
    
    var statusColors = { 'Geöffnet':'#16a34a', 'Erledigt':'#2563eb', 'Versendet':'#64748b', 'Geplant':'#f59e0b' };
    
    var html = '';
    kd.kommunikation.forEach(function(k) {
        var color = statusColors[k.status] || '#64748b';
        html += '<div class="komm-item" style="display:flex;gap:16px;padding:16px 0;border-bottom:1px solid #f1f5f9;">' +
            '<div class="komm-icon" style="width:36px;height:36px;border-radius:50%;background:#f1f5f9;display:flex;align-items:center;justify-content:center;flex-shrink:0;">' + (iconMap[k.typ] || '') + '</div>' +
            '<div class="komm-content" style="flex:1;">' +
            '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:4px;"><span style="font-size:12px;color:#64748b;">' + k.typ.charAt(0).toUpperCase() + k.typ.slice(1) + ' &middot; ' + k.datum + '</span><span class="status-badge" style="background:' + color + '20;color:' + color + ';padding:2px 8px;border-radius:4px;font-size:11px;">' + k.status + '</span></div>' +
            '<div style="font-weight:600;margin-bottom:2px;">' + k.betreff + '</div>' +
            '<div style="font-size:12px;color:#64748b;">' + k.inhalt + '</div>' +
            '</div></div>';
    });
    el.innerHTML = html;
}

// ── WINDOW EXPORTS ──
window.fillBankKundenDetail = fillBankKundenDetail;
window.switchBankKundenTab = switchBankKundenTab;
window.bankMockKunden = bankMockKunden;
