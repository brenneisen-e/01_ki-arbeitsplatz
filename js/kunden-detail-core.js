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
    'VR / Volksbank': 'vr.de',
    'Volksbank': 'vr.de',
    'Volksbank Dortmund': 'volksbank.de',
    'Volksbank Mittelhessen': 'volksbank.de',
    'R+V Versicherung': 'ruv.de',
    'Schwäbisch Hall': 'schwaebisch-hall.de',
    'DZ HYP': 'dzhyp.de',
    'TeamBank': 'teambank.de',
    'easyCredit': 'easycredit.de',
    'VR Smart Finanz': 'vr-smart-finanz.de',
    'GENO Broker': 'genobroker.de',
    'ReiseBank': 'reisebank.de',
    'DZ BANK': 'dzbank.de',
    'DZ PRIVATBANK': 'dz-privatbank.de',
    'Münchener Hyp': 'muenchenerhyp.de'
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
let previousViewBeforeKundenDetail = null;

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
    var mode = (typeof financeMode !== 'undefined') ? financeMode : (safeLocalGet('financeMode', 'closed'));
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
        // Fallback: Zur zuletzt sichtbaren Seite navigieren, oder Landing als sicherer Default
        var potentialPage = document.getElementById('potentialAnalysePage');
        var landingPage = document.getElementById('landingPage');
        if (potentialPage && potentialPage.dataset.lastVisited) {
            potentialPage.style.display = 'block';
            console.log('Zurück zur Potentialanalyse (Fallback)');
            document.dispatchEvent(new CustomEvent('viewChanged', {
                detail: { module: 'versicherung', view: 'potentialanalyse' }
            }));
            if (window.AppRouter) AppRouter.navigate('/potentialanalyse');
        } else if (landingPage) {
            landingPage.style.display = 'flex';
            window.scrollTo(0, 0);
            console.log('Zurück zur Landing Page (Fallback, kein previousView gesetzt)');
            document.dispatchEvent(new CustomEvent('viewChanged', {
                detail: { module: 'main', view: 'landing' }
            }));
            if (window.AppRouter) AppRouter.navigate('/landing');
        } else {
            // Absoluter Fallback: Potentialanalyse
            if (potentialPage) potentialPage.style.display = 'block';
            console.log('Zurück zur Potentialanalyse (absoluter Fallback)');
            document.dispatchEvent(new CustomEvent('viewChanged', {
                detail: { module: 'versicherung', view: 'potentialanalyse' }
            }));
            if (window.AppRouter) AppRouter.navigate('/potentialanalyse');
        }
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
        photoSrc = safeLocalGet('agenturPhoto', 'assets/images/maria-musterfrau.png');
    }

    if (targetImg && photoSrc) {
        targetImg.src = photoSrc;
        targetImg.style.display = 'block';
        if (targetPlaceholder) targetPlaceholder.style.display = 'none';
    }

    // Institution logo, name, standort, modus badge (analog zu A-02 setInsurer/setBank)
    updateA10InstitutInfo();

    // 20-B: Lebenssituations-Badge
    if (typeof renderLebenssituationBadge === 'function') {
        renderLebenssituationBadge(kundenName);
    }
}
window.updateKundenSharedHeader = updateKundenSharedHeader;

/**
 * Update institution logo, name, location, and mode badge in A-10 header.
 * Mirrors the logo logic from setInsurer()/setBank() in mrh-trowe-modes.js.
 */
function updateA10InstitutInfo() {
    var kundenPage = document.getElementById('kundenDetailPage');
    var isBankMode = kundenPage && kundenPage.classList.contains('bank-mode');

    var logoImg = document.getElementById('a10InstitutLogoImg');
    var logoFallback = document.getElementById('a10InstitutLogoFallback');
    var institutNameEl = document.getElementById('a10InstitutName');
    var modusBadge = document.getElementById('a10ModusIndikator');

    if (isBankMode) {
        // Banking mode: use bank config
        var bankKey = (typeof selectedBank !== 'undefined') ? selectedBank : 'vr';
        var bankCfg = (typeof bankConfig !== 'undefined' && bankConfig[bankKey]) ? bankConfig[bankKey] : null;
        var cfgName = bankCfg ? bankCfg.name : 'VR / Volksbank';
        var cfgPrimary = bankCfg ? bankCfg.primary : '#003399';

        _setA10Logo(logoImg, logoFallback, cfgName, cfgPrimary);

        if (institutNameEl) institutNameEl.textContent = (typeof beraterData !== 'undefined' && beraterData.institut) ? beraterData.institut : 'Volksbank Mittelhessen eG';

        // Modus badge: segment label
        var bvm = (typeof bankViewMode !== 'undefined') ? bankViewMode : 'retail';
        var segmentLabels = { 'retail': 'Privatkunden', 'firmenkunde': 'Firmenkunden', 'vermoegen': 'Vermögenskunden' };
        if (modusBadge) modusBadge.textContent = segmentLabels[bvm] || 'Privatkunden';
    } else {
        // Insurance mode: use insurer config
        var insKey = (typeof selectedInsurer !== 'undefined') ? selectedInsurer : 'ergo';
        var insCfg = (typeof insurerConfig !== 'undefined' && insurerConfig[insKey]) ? insurerConfig[insKey] : null;
        var insName = insCfg ? insCfg.name : 'ERGO';
        var insPrimary = insCfg ? insCfg.primary : '#6B1C2A';

        _setA10Logo(logoImg, logoFallback, insName, insPrimary);

        // Institut full name mapping
        var institutFullNames = {
            'ergo': 'ERGO Versicherung AG',
            'allianz': 'Allianz Versicherungs-AG',
            'axa': 'AXA Versicherung AG',
            'zurich': 'Zurich Versicherung AG',
            'generali': 'Generali Deutschland AG',
            'hdi': 'HDI Versicherung AG',
            'ruv': 'R+V Versicherung AG',
            'signal-iduna': 'Signal Iduna Gruppe',
            'gothaer': 'Gothaer Versicherung AG',
            'debeka': 'Debeka Versicherungsgruppe'
        };
        if (institutNameEl) institutNameEl.textContent = institutFullNames[insKey] || insName + ' Versicherung AG';

        // Modus badge: AO or Makler
        var mode = (typeof currentVermittlerMode !== 'undefined') ? currentVermittlerMode : 'ao';
        if (modusBadge) modusBadge.textContent = (mode === 'makler') ? 'Makler' : 'AO';
    }
}
window.updateA10InstitutInfo = updateA10InstitutInfo;

/**
 * Set logo image or fallback in A-10 header (mirrors setInsurer/setBank logo logic).
 */
function _setA10Logo(logoImg, logoFallback, name, primaryColor) {
    if (!logoImg) return;
    var logoUrl = (typeof getVersichererLogoUrl === 'function')
        ? getVersichererLogoUrl(name, 120)
        : '';
    if (logoUrl) {
        logoImg.src = logoUrl;
        logoImg.alt = name;
        logoImg.style.display = '';
        logoImg.onerror = function() {
            logoImg.style.display = 'none';
            if (logoFallback) {
                logoFallback.style.display = 'flex';
                logoFallback.textContent = name.substring(0, 2).toUpperCase();
                logoFallback.style.background = primaryColor;
            }
        };
        if (logoFallback) logoFallback.style.display = 'none';
    } else if (logoFallback) {
        logoImg.style.display = 'none';
        logoFallback.style.display = 'flex';
        logoFallback.textContent = name.substring(0, 2).toUpperCase();
        logoFallback.style.background = primaryColor;
    }
}

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
window.__registerModule('kunden-detail-core.js');
