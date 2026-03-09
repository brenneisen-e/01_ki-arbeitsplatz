(function(){var r=['safeLocalSet'];var m=r.filter(function(f){return typeof window[f]==='undefined'});if(m.length)console.error('[landing-modules.js] Fehlende Deps:',m.join(', '),'← Lade utils.js zuerst!');})();
// Toggle Modules
function toggleModules() {
    const container = document.getElementById('modulesContainer');
    const btn = document.getElementById('modulesToggle');
    if (!container || !btn) return;

    const isOpen = container.style.display !== 'none';
    container.style.display = isOpen ? 'none' : 'block';
    btn.classList.toggle('open', !isOpen);
}

// Toggle Settings Box
let settingsUnlocked = false;

function toggleSettings() {
    const settingsBox = document.querySelector('.settings-collapsible');
    if (!settingsBox) return;

    // If already open, just close
    if (settingsBox.classList.contains('open')) {
        settingsBox.classList.remove('open');
        return;
    }

    // If not yet unlocked, require password
    if (!settingsUnlocked) {
        const pw = prompt('Passwort eingeben:');
        if (pw !== 'brenneisen') {
            if (pw !== null) alert('Falsches Passwort.');
            return;
        }
        settingsUnlocked = true;
    }

    settingsBox.classList.add('open');
}

// Benutzername speichern und aktualisieren
function saveUserName() {
    const input = document.getElementById('userNameInput');
    const welcomeSpan = document.getElementById('welcomeUserName');

    if (input && input.value.trim()) {
        const newName = input.value.trim();

        // Im localStorage speichern
        safeLocalSet('userName', newName);

        // Willkommensnachricht aktualisieren
        if (welcomeSpan) {
            welcomeSpan.textContent = newName;
        }

        // Kurze Bestätigung anzeigen
        const saveBtn = document.getElementById('userNameSave');
        if (saveBtn) {
            const originalText = saveBtn.textContent;
            saveBtn.textContent = '✓ Gespeichert';
            saveBtn.style.background = '#86BC25';
            setTimeout(() => {
                saveBtn.textContent = originalText;
                saveBtn.style.background = '';
            }, 1500);
        }
    }
}

// Benutzername beim Laden wiederherstellen
function loadUserName() {
    const savedName = safeLocalGet('userName', null);
    if (savedName) {
        const input = document.getElementById('userNameInput');
        const welcomeSpan = document.getElementById('welcomeUserName');

        if (input) input.value = savedName;
        if (welcomeSpan) welcomeSpan.textContent = savedName;
    }
}

// Open Agentur View (zeigt Agentur-Auswahl oder direkt die Übersicht)
function openAgenturView() {
    console.log('Agenturansicht öffnen...');

    // Prüfe ob Daten vorhanden sind
    const rawData = window.dailyRawData || (typeof dailyRawData !== 'undefined' ? dailyRawData : null);
    const agenturen = (rawData && rawData.length > 0 && typeof getAgenturen === 'function') ? getAgenturen() : [];

    if (agenturen.length > 0 && typeof showAgenturOverview === 'function') {
        // CSV-Daten vorhanden - zeige erste Agentur
        showAgenturOverview(agenturen[0].id);
    } else if (typeof showAgenturOverview === 'function') {
        // Keine CSV-Daten — trotzdem navigieren (MRH/B2B haben eigene Mock-Daten)
        showAgenturOverview('DEMO-001');
    } else {
        addLandingChatMessage('assistant', '⚠️ Agenturansicht konnte nicht geladen werden.');
    }
}

// Make functions globally available
window.openDashboard = openDashboard;
window.openUploadDialog = openUploadDialog;
window.openGenerator = openGenerator;
window.backToLanding = backToLanding;
window.toggleSettings = toggleSettings;
window.openAgenturView = openAgenturView;
window.openRisikoscoring = openRisikoscoring;
window.closeRisikoscoring = closeRisikoscoring;
window.openKreditanalyse = openKreditanalyse;
window.closeKreditanalyse = closeKreditanalyse;
window.openBestandsuebertragung = openBestandsuebertragung;
window.closeBestandsuebertragung = closeBestandsuebertragung;
window.saveUserName = saveUserName;
window.loadUserName = loadUserName;
window.handleTopRegionsQuery = handleTopRegionsQuery;
window.handleSingleRegionQuery = handleSingleRegionQuery;

// WICHTIG: Entfernen Sie den ersten DOMContentLoaded von ganz oben!
// Hier ist der einzige DOMContentLoaded Listener:
window.addEventListener('DOMContentLoaded', function() {
    console.log('Landing Page wird geladen...');

    // Check if Router detected a deep-link → skip landing page entirely
    var _isDeepLink = (window.AppRouter && window.AppRouter.isDeepLink && window.AppRouter.isDeepLink());
    if (!_isDeepLink) {
        // Fallback: also check hash directly
        var _h = window.location.hash.replace('#', '') || '/';
        _isDeepLink = (_h !== '/' && _h !== '/landing' &&
            window.AppRouter && window.AppRouter.routes && window.AppRouter.routes[_h]);
    }

    if (_isDeepLink) {
        console.log('Deep-link mode: skipping landing page setup');
        var lp = document.getElementById('landingPage');
        if (lp) lp.style.display = 'none';
    }

    // Benutzername aus localStorage laden
    loadUserName();

    // Navigation initial deaktivieren bis Daten geladen
    setNavigationEnabled(false);

    // Auto-load CSV Mock-Daten beim Start (mit Callback wenn fertig)
    loadDefaultCSVData().then(() => {
        // Daten geladen - Navigation aktivieren
        setNavigationEnabled(true);

        // Loading Animation ausblenden
        const loadingAnim = document.getElementById('loadingAnimation');
        if (loadingAnim) loadingAnim.style.display = 'none';

        // Deep-link: navigate to target route, skip landing setup
        if (_isDeepLink || (window.AppRouter && window.AppRouter.isDeepLink && window.AppRouter.isDeepLink())) {
            console.log('Deep-link: CSV loaded, triggering navigation');
            // Let the router re-navigate now that CSV data is available
            if (window.AppRouter) window.AppRouter.handleHashChange();
            return;
        }

        // Normal landing page flow
        const welcomeChat = document.getElementById('welcomeChat');
        if (welcomeChat) welcomeChat.style.display = 'block';
        console.log('Welcome Chat angezeigt');

        // Dispatch event for Page ID Tracker (M-01)
        document.dispatchEvent(new CustomEvent('moduleChanged', {
            detail: { module: 'main', view: 'landing' }
        }));

        // WICHTIG: Initialize landing chat
        initLandingChat();
    });

    // Setup quick upload
    setupQuickUpload();

    // Setup API token input
    setupApiTokenInput();

    // Render NPS stars in Kundenliste
    setTimeout(renderNpsStyleAll, 100);
});

/**
 * Aktiviert/Deaktiviert die Navigation-Buttons
 */
function setNavigationEnabled(enabled) {
    const navBoxes = document.querySelectorAll('.nav-box');
    navBoxes.forEach(box => {
        if (enabled) {
            box.classList.remove('disabled');
            box.style.pointerEvents = 'auto';
            box.style.opacity = '1';
        } else {
            box.classList.add('disabled');
            box.style.pointerEvents = 'none';
            box.style.opacity = '0.5';
        }
    });
}

// ========================================
// RISIKOSCORING MODULE
// ========================================

let risikoscoringLoaded = false;

async function openRisikoscoring() {
    console.log('Risikoscoring öffnen...');

    // Hide landing page
    const landingPage = document.getElementById('landingPage');
    if (landingPage) {
        landingPage.style.display = 'none';
    }

    // Hide main app if visible
    const mainApp = document.getElementById('mainApp');
    if (mainApp) {
        mainApp.style.display = 'none';
    }

    // Hide banken module if visible
    const bankenModule = document.getElementById('bankenModule');
    if (bankenModule) {
        bankenModule.style.display = 'none';
    }

    // Hide asset module if visible
    const assetModuleRS = document.getElementById('assetModule');
    if (assetModuleRS) {
        assetModuleRS.style.display = 'none';
    }

    // Hide CV Scanner if visible
    const cvModule = document.getElementById('cvScannerModule');
    if (cvModule) {
        cvModule.style.display = 'none';
    }

    // Hide B-02/B-10 Banking Berater if visible
    var beraterPageRS = document.getElementById('beraterOverviewPage');
    if (beraterPageRS) beraterPageRS.style.display = 'none';
    var kdBankPageRS = document.getElementById('kundenDetailBankPage');
    if (kdBankPageRS) kdBankPageRS.style.display = 'none';

    // Show risikoscoring module
    const rsModule = document.getElementById('risikoscoringModule');
    if (rsModule) {
        rsModule.style.display = 'block';

        // Load content if not already loaded
        if (!risikoscoringLoaded) {
            try {
                const response = await fetch('partials/risikoscoring-module.html');
                if (response.ok) {
                    const html = await response.text();
                    rsModule.innerHTML = html;
                    risikoscoringLoaded = true;

                    // Initialize the module
                    if (typeof initRisikoscoring === 'function') {
                        initRisikoscoring();
                    }
                    console.log('Risikoscoring Modul geladen');
                } else {
                    rsModule.innerHTML = '<div class="error-message">Fehler beim Laden des Risikoscoring-Moduls</div>';
                }
            } catch (error) {
                console.error('Error loading risikoscoring module:', error);
                rsModule.innerHTML = '<div class="error-message">Fehler beim Laden des Risikoscoring-Moduls</div>';
            }
        }
    }

    // Update URL route
    if (window.AppRouter) AppRouter.navigate('/risikoscoring');
}

function closeRisikoscoring() {
    console.log('Risikoscoring schließen...');

    // Hide risikoscoring module
    const rsModule = document.getElementById('risikoscoringModule');
    if (rsModule) {
        rsModule.style.display = 'none';
    }

    // Show landing page (use flex for proper centering)
    const landingPage = document.getElementById('landingPage');
    if (landingPage) {
        landingPage.style.display = 'flex';
    }

    // Update URL route
    if (window.AppRouter) AppRouter.navigate('/landing');
}

// ========================================
// KI-KREDITANALYSE MODULE
// ========================================

let kreditanalyseLoaded = false;

async function openKreditanalyse() {
    console.log('KI-Kreditanalyse öffnen...');

    // Hide landing page
    const landingPage = document.getElementById('landingPage');
    if (landingPage) {
        landingPage.style.display = 'none';
    }

    // Hide main app if visible
    const mainApp = document.getElementById('mainApp');
    if (mainApp) {
        mainApp.style.display = 'none';
    }

    // Hide other modules
    ['bankenModule', 'assetModule', 'risikoscoringModule', 'bestandsuebertragungModule',
     'pmoToolboxModule', 'hrPipelineModule', 'versicherungs1x1Module',
     'beraterOverviewPage', 'kundenDetailBankPage'].forEach(function(id) {
        var el = document.getElementById(id);
        if (el) el.style.display = 'none';
    });

    // Show kreditanalyse module
    const kaModule = document.getElementById('kreditanalyseModule');
    if (kaModule) {
        kaModule.style.display = 'block';

        // Load iframe if not already loaded
        if (!kreditanalyseLoaded) {
            const iframe = document.getElementById('kreditanalyseIframe');
            if (iframe) {
                iframe.src = 'kreditanalyse/dist/index.html';
                kreditanalyseLoaded = true;
                console.log('KI-Kreditanalyse Modul geladen');
            }
        }
    }

    // Update URL route
    if (window.AppRouter) AppRouter.navigate('/kreditanalyse');
}

function closeKreditanalyse() {
    console.log('KI-Kreditanalyse schließen...');

    const kaModule = document.getElementById('kreditanalyseModule');
    if (kaModule) {
        kaModule.style.display = 'none';
    }

    // Show landing page
    const landingPage = document.getElementById('landingPage');
    if (landingPage) {
        landingPage.style.display = 'flex';
    }

    if (window.AppRouter) AppRouter.navigate('/landing');
}

// ========================================
// BESTANDSUEBERTRAGUNG MODULE
// ========================================

let bestandsuebertragungLoaded = false;

/**
 * Fallback: Stellt sicher, dass Navigation-Tabs funktionieren,
 * auch wenn das ESM-Modul noch nicht geladen ist oder fehlschlägt.
 */
function setupBestandNavFallback(moduleEl) {
    const bestandPage = moduleEl.querySelector('.bestand-page');
    if (!bestandPage) return;

    const navBtns = bestandPage.querySelectorAll('.nav-btn');
    const views = bestandPage.querySelectorAll('.view');

    if (navBtns.length === 0) return;

    navBtns.forEach(btn => {
        // Only add fallback if no click handler was attached by ESM module
        if (!btn._bestandNavInit) {
            btn._bestandNavInit = true;
            btn.addEventListener('click', function() {
                const viewName = this.dataset.view;

                // Toggle active nav button
                navBtns.forEach(b => b.classList.remove('active'));
                this.classList.add('active');

                // Toggle active view
                views.forEach(v => {
                    v.classList.toggle('active', v.id === 'view-' + viewName);
                });

                // Try to call ESM module's switchView and refresh
                try {
                    if (typeof UI !== 'undefined' && typeof UI.switchView === 'function') {
                        UI.switchView(viewName);
                    }
                    if (typeof BestandApp !== 'undefined' && typeof BestandApp.refreshData === 'function') {
                        BestandApp.refreshData();
                    }
                } catch (e) {
                    // Fallback is already handling the view switch
                }
            });
        }
    });

    // Retry ESM init after a short delay if not yet available
    if (typeof initBestandApp !== 'function' && typeof BestandApp === 'undefined') {
        setTimeout(() => {
            try {
                if (typeof initBestandApp === 'function') {
                    initBestandApp();
                    console.log('Bestandsübertragung verzögert initialisiert');
                } else if (typeof BestandApp !== 'undefined' && typeof BestandApp.init === 'function') {
                    BestandApp.init();
                    console.log('Bestandsübertragung via BestandApp verzögert initialisiert');
                }
            } catch (e) {
                console.error('Verzögerte Initialisierung fehlgeschlagen:', e);
            }
        }, 500);
    }
}

async function openBestandsuebertragung() {
    console.log('Bestandsübertragung öffnen...');

    // Hide landing page
    const landingPage = document.getElementById('landingPage');
    if (landingPage) {
        landingPage.style.display = 'none';
    }

    // Hide main app if visible
    const mainApp = document.getElementById('mainApp');
    if (mainApp) {
        mainApp.style.display = 'none';
    }

    // Hide welcome chat (sibling of landing page)
    const welcomeChat = document.getElementById('welcomeChat');
    if (welcomeChat) {
        welcomeChat.style.display = 'none';
    }

    // Hide all other modules
    const versicherungModule = document.getElementById('versicherungModule');
    if (versicherungModule) {
        versicherungModule.style.display = 'none';
    }

    const bankenModule = document.getElementById('bankenModule');
    if (bankenModule) {
        bankenModule.style.display = 'none';
    }

    const assetModuleBU = document.getElementById('assetModule');
    if (assetModuleBU) {
        assetModuleBU.style.display = 'none';
    }

    const rsModule = document.getElementById('risikoscoringModule');
    if (rsModule) {
        rsModule.style.display = 'none';
    }

    const pmoModule = document.getElementById('pmoToolboxModule');
    if (pmoModule) {
        pmoModule.style.display = 'none';
    }

    const cvModule = document.getElementById('cvScannerModule');
    if (cvModule) {
        cvModule.style.display = 'none';
    }

    // Hide B-02/B-10 Banking Berater
    var beraterPageBU = document.getElementById('beraterOverviewPage');
    if (beraterPageBU) beraterPageBU.style.display = 'none';
    var kdBankPageBU = document.getElementById('kundenDetailBankPage');
    if (kdBankPageBU) kdBankPageBU.style.display = 'none';

    // Show bestandsuebertragung module
    const bestandModule = document.getElementById('bestandsuebertragungModule');
    if (bestandModule) {
        bestandModule.style.display = 'block';

        // Load content if not already loaded
        if (!bestandsuebertragungLoaded) {
            try {
                const response = await fetch('partials/bestandsuebertragung-module.html');
                if (response.ok) {
                    const html = await response.text();
                    bestandModule.innerHTML = html;
                    bestandsuebertragungLoaded = true;

                    // Fix stale demoLoaded flag: if settings say loaded
                    // but no cases exist, reset the flag so demo data regenerates
                    try {
                        var bSettings = JSON.parse(localStorage.getItem('bestandsuebertragung_settings') || '{}');
                        var bCases = JSON.parse(localStorage.getItem('bestandsuebertragung_cases') || '{}');
                        if (bSettings.demoLoaded && Object.keys(bCases).length === 0) {
                            bSettings.demoLoaded = false;
                            localStorage.setItem('bestandsuebertragung_settings', JSON.stringify(bSettings));
                            console.log('Stale demoLoaded flag zurückgesetzt');
                        }
                    } catch (e) { /* ignore */ }

                    // Initialize the bestandsuebertragung app
                    try {
                        if (typeof initBestandApp === 'function') {
                            initBestandApp();
                            console.log('Bestandsübertragung via initBestandApp() initialisiert');
                        } else if (typeof BestandApp !== 'undefined' && typeof BestandApp.init === 'function') {
                            BestandApp.init();
                            console.log('Bestandsübertragung via BestandApp.init() initialisiert');
                        } else {
                            console.warn('initBestandApp nicht verfügbar, warte auf ESM-Modul...');
                        }
                    } catch (initError) {
                        console.error('Fehler bei Bestandsübertragung-Initialisierung:', initError);
                    }

                    // Fallback: ensure nav tabs work even if ESM init failed
                    setupBestandNavFallback(bestandModule);

                    console.log('Bestandsübertragung Modul geladen');
                } else {
                    bestandModule.innerHTML = '<div class="error-message">Fehler beim Laden des Bestandsübertragung-Moduls</div>';
                }
            } catch (error) {
                console.error('Error loading bestandsuebertragung module:', error);
                bestandModule.innerHTML = '<div class="error-message">Fehler beim Laden des Bestandsübertragung-Moduls</div>';
            }
        }
    }

    // Dispatch event for Page ID Tracker
    document.dispatchEvent(new CustomEvent('moduleChanged', {
        detail: { module: 'bestandsuebertragung', view: 'dashboard' }
    }));

    // Force immediate Page ID update
    if (window.PageIDTracker) {
        window.PageIDTracker.updatePageId('bestandsuebertragung', 'dashboard');
    }

    // Update URL route
    if (window.AppRouter) AppRouter.navigate('/bestandsuebertragung');
}

function closeBestandsuebertragung() {
    console.log('Bestandsübertragung schließen...');

    // Hide bestandsuebertragung module
    const bestandModule = document.getElementById('bestandsuebertragungModule');
    if (bestandModule) {
        bestandModule.style.display = 'none';
    }

    // Hide other modules
    const bankenModule = document.getElementById('bankenModule');
    if (bankenModule) {
        bankenModule.style.display = 'none';
    }

    const assetModuleCB = document.getElementById('assetModule');
    if (assetModuleCB) {
        assetModuleCB.style.display = 'none';
    }

    const risikoscoringModule = document.getElementById('risikoscoringModule');
    if (risikoscoringModule) {
        risikoscoringModule.style.display = 'none';
    }

    const pmoModule = document.getElementById('pmoToolboxModule');
    if (pmoModule) {
        pmoModule.style.display = 'none';
    }

    const cvScannerModule2 = document.getElementById('cvScannerModule');
    if (cvScannerModule2) {
        cvScannerModule2.style.display = 'none';
    }

    // Show versicherungModule (contains the landing page!)
    const versicherungModule = document.getElementById('versicherungModule');
    if (versicherungModule) {
        versicherungModule.style.display = 'block';
    }

    // Hide all versicherung sub-views
    const mainApp = document.getElementById('mainApp');
    if (mainApp) {
        mainApp.style.display = 'none';
    }

    const agenturOverview = document.getElementById('agenturOverview');
    if (agenturOverview) {
        agenturOverview.style.display = 'none';
    }

    const kundenDetailPage = document.getElementById('kundenDetailPage');
    if (kundenDetailPage) {
        kundenDetailPage.style.display = 'none';
    }

    const potentialAnalysePage = document.getElementById('potentialAnalysePage');
    if (potentialAnalysePage) {
        potentialAnalysePage.style.display = 'none';
    }

    const finanzplanung = document.getElementById('finanzplanung');
    if (finanzplanung) {
        finanzplanung.style.display = 'none';
    }

    const agenturGrid = document.getElementById('agenturGrid');
    if (agenturGrid) {
        agenturGrid.style.display = 'none';
    }

    // Show landing page (use flex for proper centering)
    const landingPage = document.getElementById('landingPage');
    if (landingPage) {
        landingPage.style.display = 'flex';
    }

    // Show welcome chat again
    const welcomeChat = document.getElementById('welcomeChat');
    if (welcomeChat) {
        welcomeChat.style.display = 'block';
    }

    // Update URL route
    if (window.AppRouter) AppRouter.navigate('/landing');

    // Dispatch event to update Page ID back to M-01
    setTimeout(() => {
        document.dispatchEvent(new CustomEvent('moduleChanged', {
            detail: { module: 'main', view: 'landing' }
        }));

        if (window.PageIDTracker) {
            window.PageIDTracker.updatePageId('main', 'landing');
        }
    }, 50);
}

// ========================================
// PMO TOOLBOX MODULE
// ========================================

let pmoToolboxLoaded = false;

async function openPMOToolbox() {
    console.log('PMO Toolbox öffnen...');

    // Hide landing page
    const landingPage = document.getElementById('landingPage');
    if (landingPage) {
        landingPage.style.display = 'none';
    }

    // Hide welcome chat (sibling of landing page)
    const welcomeChat = document.getElementById('welcomeChat');
    if (welcomeChat) {
        welcomeChat.style.display = 'none';
    }

    // Hide main app if visible
    const mainApp = document.getElementById('mainApp');
    if (mainApp) {
        mainApp.style.display = 'none';
    }

    // Hide other modules
    const versicherungModule = document.getElementById('versicherungModule');
    if (versicherungModule) {
        versicherungModule.style.display = 'none';
    }

    const bankenModule = document.getElementById('bankenModule');
    if (bankenModule) {
        bankenModule.style.display = 'none';
    }

    const assetModulePMO = document.getElementById('assetModule');
    if (assetModulePMO) {
        assetModulePMO.style.display = 'none';
    }

    const rsModule = document.getElementById('risikoscoringModule');
    if (rsModule) {
        rsModule.style.display = 'none';
    }

    const bestandModule = document.getElementById('bestandsuebertragungModule');
    if (bestandModule) {
        bestandModule.style.display = 'none';
    }

    const cvModule = document.getElementById('cvScannerModule');
    if (cvModule) {
        cvModule.style.display = 'none';
    }

    // Hide B-02/B-10 Banking Berater
    var beraterPagePMO = document.getElementById('beraterOverviewPage');
    if (beraterPagePMO) beraterPagePMO.style.display = 'none';
    var kdBankPagePMO = document.getElementById('kundenDetailBankPage');
    if (kdBankPagePMO) kdBankPagePMO.style.display = 'none';

    // Hide main chat widget and toggle (they should not appear in PMO Toolbox)
    const chatWidget = document.getElementById('chatWidget');
    if (chatWidget) {
        chatWidget.style.display = 'none';
    }
    const chatToggle = document.getElementById('chatToggle');
    if (chatToggle) {
        chatToggle.style.display = 'none';
    }

    // Show PMO Toolbox module
    const pmoModule = document.getElementById('pmoToolboxModule');
    if (pmoModule) {
        pmoModule.style.display = 'block';

        // Dispatch event for Page ID Tracker
        document.dispatchEvent(new CustomEvent('moduleChanged', {
            detail: { module: 'pmo-toolbox', view: 'landing' }
        }));

        // Load module content if not already loaded
        if (!pmoToolboxLoaded) {
            try {
                const response = await fetch('partials/pmo-toolbox-module.html');
                if (response.ok) {
                    const html = await response.text();
                    pmoModule.innerHTML = html;
                    pmoToolboxLoaded = true;

                    // Execute scripts manually (innerHTML doesn't execute scripts)
                    const scripts = pmoModule.querySelectorAll('script');
                    scripts.forEach(oldScript => {
                        const newScript = document.createElement('script');
                        // Copy type attribute (important for ES6 modules!)
                        if (oldScript.type) {
                            newScript.type = oldScript.type;
                        }
                        if (oldScript.src) {
                            newScript.src = oldScript.src;
                        } else {
                            newScript.textContent = oldScript.textContent;
                        }
                        oldScript.parentNode.replaceChild(newScript, oldScript);
                    });

                    console.log('PMO Toolbox Modul geladen');
                } else {
                    pmoModule.innerHTML = '<div class="error-message">Fehler beim Laden des PMO Toolbox-Moduls</div>';
                }
            } catch (error) {
                console.error('Error loading PMO Toolbox module:', error);
                pmoModule.innerHTML = '<div class="error-message">Fehler beim Laden des PMO Toolbox-Moduls</div>';
            }
        }
    }

    // Update URL route
    if (window.AppRouter) AppRouter.navigate('/pmo-toolbox');
}

function closePMOToolbox() {
    console.log('PMO Toolbox schließen...');

    // Hide PMO Toolbox module
    const pmoModule = document.getElementById('pmoToolboxModule');
    if (pmoModule) {
        pmoModule.style.display = 'none';
    }

    // Hide other modules (but NOT versicherungModule, as landingPage is inside it!)
    const bankenModule = document.getElementById('bankenModule');
    if (bankenModule) {
        bankenModule.style.display = 'none';
    }

    const assetModuleCP = document.getElementById('assetModule');
    if (assetModuleCP) {
        assetModuleCP.style.display = 'none';
    }

    const risikoscoringModule = document.getElementById('risikoscoringModule');
    if (risikoscoringModule) {
        risikoscoringModule.style.display = 'none';
    }

    const bestandsModule = document.getElementById('bestandsuebertragungModule');
    if (bestandsModule) {
        bestandsModule.style.display = 'none';
    }

    const cvScannerModule = document.getElementById('cvScannerModule');
    if (cvScannerModule) {
        cvScannerModule.style.display = 'none';
    }

    // Show versicherungModule (contains the landing page!)
    const versicherungModule = document.getElementById('versicherungModule');
    if (versicherungModule) {
        versicherungModule.style.display = 'block';
    }

    // Hide all versicherung sub-views
    const mainApp = document.getElementById('mainApp');
    if (mainApp) {
        mainApp.style.display = 'none';
    }

    const agenturOverview = document.getElementById('agenturOverview');
    if (agenturOverview) {
        agenturOverview.style.display = 'none';
    }

    const kundenDetailPage = document.getElementById('kundenDetailPage');
    if (kundenDetailPage) {
        kundenDetailPage.style.display = 'none';
    }

    const potentialAnalysePage = document.getElementById('potentialAnalysePage');
    if (potentialAnalysePage) {
        potentialAnalysePage.style.display = 'none';
    }

    const finanzplanung = document.getElementById('finanzplanung');
    if (finanzplanung) {
        finanzplanung.style.display = 'none';
    }

    const agenturGrid = document.getElementById('agenturGrid');
    if (agenturGrid) {
        agenturGrid.style.display = 'none';
    }

    // Show landing page (use flex for proper centering)
    const landingPage = document.getElementById('landingPage');
    if (landingPage) {
        landingPage.style.display = 'flex';
    }

    // Show welcome chat again
    const welcomeChat = document.getElementById('welcomeChat');
    if (welcomeChat) {
        welcomeChat.style.display = 'block';
    }

    // Update URL route
    if (window.AppRouter) AppRouter.navigate('/landing');

    // Dispatch event to update Page ID back to M-01
    // Use setTimeout to ensure DOM is updated first
    setTimeout(() => {
        document.dispatchEvent(new CustomEvent('moduleChanged', {
            detail: { module: 'main', view: 'landing' }
        }));

        // Force an immediate update
        if (window.PageIDTracker) {
            window.PageIDTracker.updatePageId('main', 'landing');
        }
    }, 50);
}

window.__registerModule('landing-modules.js');
