// js/landing.js - Landing Page Logic

// ========================================
// AUTO-ZOOM: Seite proportional skalieren
// Optimiert für 27 Zoll (1920px Breite)
// Verbessert: Fallback für Firefox (transform), debounced resize
// ========================================
(function() {
    var DESIGN_WIDTH = 1920;
    var MIN_ZOOM = 0.52; // Nicht kleiner als 52%
    var resizeTimer = null;
    var supportsZoom = 'zoom' in document.documentElement.style && !/firefox/i.test(navigator.userAgent);

    function applyAutoZoom() {
        // Nutze screen.width statt innerWidth für konsistentere Ergebnisse
        // innerWidth ändert sich bei Zoom - screen.width bleibt stabil
        var screenW = window.screen.width;
        var vw = window.innerWidth;

        // Verwende den effektiveren Wert
        var referenceWidth = Math.max(vw, screenW > 2500 ? DESIGN_WIDTH : vw);

        if (referenceWidth >= DESIGN_WIDTH) {
            if (supportsZoom) {
                document.documentElement.style.zoom = '1';
                document.body.style.transform = '';
                document.body.style.transformOrigin = '';
                document.body.style.width = '';
            }
            return;
        }

        var zoom = Math.max(referenceWidth / DESIGN_WIDTH, MIN_ZOOM);

        if (supportsZoom) {
            // Chrome/Edge/Safari: CSS zoom property
            document.documentElement.style.zoom = String(zoom);
            document.body.style.transform = '';
            document.body.style.transformOrigin = '';
            document.body.style.width = '';
        } else {
            // Firefox fallback: CSS transform
            document.documentElement.style.zoom = '';
            document.body.style.transformOrigin = 'top left';
            document.body.style.transform = 'scale(' + zoom + ')';
            document.body.style.width = (100 / zoom) + '%';
        }
    }

    // Debounced resize handler
    function onResize() {
        if (resizeTimer) clearTimeout(resizeTimer);
        resizeTimer = setTimeout(applyAutoZoom, 100);
    }

    // Export for other modules to re-apply zoom
    window.applyAutoZoom = applyAutoZoom;

    // Sofort beim Laden + bei Resize (debounced)
    applyAutoZoom();
    window.addEventListener('resize', onResize);
    window.addEventListener('DOMContentLoaded', applyAutoZoom);

    // Re-apply after all resources loaded (fonts etc. können Layout ändern)
    window.addEventListener('load', function() {
        setTimeout(applyAutoZoom, 200);
    });
})();

// ========================================
// CLAUDE API CONFIGURATION
// ========================================

// API via Cloudflare Worker (nutze window, um Konflikte mit chat.js zu vermeiden)
window.CLAUDE_WORKER_URL = window.CLAUDE_WORKER_URL || 'https://vst-claude-api.eike-3e2.workers.dev';
window.CLAUDE_MODEL = window.CLAUDE_MODEL || 'claude-haiku-4-5-20251001';

// Fallback: API-Key aus localStorage
function getApiToken() {
    return safeLocalGet('claude_api_token', '');
}

// Save API token to localStorage
function saveApiToken(token) {
    if (token && token.trim()) {
        safeLocalSet('claude_api_token', token.trim());
        return true;
    }
    return false;
}

// Clear API token from localStorage
function clearApiToken() {
    localStorage.removeItem('claude_api_token');
}

// Prüfe ob Worker oder API-Key vorhanden
window.USE_WORKER = window.CLAUDE_WORKER_URL !== '';

// Mock-Modus überall außer T-05 (KI-Dokumentenassistent)
function isUsingMockMode() {
    // Prüfe ob wir auf T-05 (KI-Dokumentenassistent) sind
    const documentAssistantContainer = document.getElementById('documentAssistantContainer');
    const isOnDocumentAssistant = documentAssistantContainer && documentAssistantContainer.style.display !== 'none';

    // Nur auf T-05 echte API nutzen, überall sonst Mock-Modus
    if (isOnDocumentAssistant) {
        return false; // API aktiv auf T-05
    }

    return true; // Mock-Modus überall sonst (M-01 Landing Chat, A-03 Dashboard Chat, etc.)
}

// Setup API Token Input
function setupApiTokenInput() {
    const tokenInput = document.getElementById('apiTokenInput');
    const toggleBtn = document.getElementById('apiTokenToggle');
    const saveBtn = document.getElementById('apiTokenSave');
    const statusDiv = document.getElementById('apiTokenStatus');

    if (!tokenInput || !toggleBtn || !saveBtn) return;

    // Status anzeigen - KI-Assistent aktiv
    statusDiv.className = 'api-token-status success';
    statusDiv.textContent = '✅ KI-Assistent aktiv | Dokumentenanalyse auf T-05';

    // Toggle password visibility
    toggleBtn.addEventListener('click', () => {
        if (tokenInput.type === 'password') {
            tokenInput.type = 'text';
            toggleBtn.textContent = '🙈';
        } else {
            tokenInput.type = 'password';
            toggleBtn.textContent = '👁️';
        }
    });

    // Save token
    saveBtn.addEventListener('click', () => {
        const token = tokenInput.value.trim();

        if (!token) {
            // Clear token
            clearApiToken();
            statusDiv.className = 'api-token-status';
            statusDiv.textContent = 'ℹ️ Mock-Modus aktiv (vorgefertigte Antworten)';
            return;
        }

        if (!token.startsWith('sk-')) {
            statusDiv.className = 'api-token-status error';
            statusDiv.textContent = '❌ Ungültiger API-Key (muss mit "sk-" beginnen)';
            return;
        }

        if (saveApiToken(token)) {
            statusDiv.className = 'api-token-status success';
            statusDiv.textContent = 'API-Key gespeichert! KI-Modus ist jetzt aktiv.';

            // Update mock mode status
            window.USE_MOCK_MODE = false;
        } else {
            statusDiv.className = 'api-token-status error';
            statusDiv.textContent = '❌ Fehler beim Speichern';
        }
    });

    // Save on Enter
    tokenInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            saveBtn.click();
        }
    });
}

// ========================================
// CSV UPLOAD
// ========================================

// Setup quick CSV upload on landing page
function setupQuickUpload() {
    const uploadInput = document.getElementById('quickCsvUpload');
    const uploadBox = uploadInput.parentElement;
    const statusDiv = document.getElementById('quickUploadStatus');
    
    uploadInput.addEventListener('change', function(e) {
        handleQuickUpload(e.target.files[0]);
    });
    
    // Drag & Drop
    uploadBox.addEventListener('dragover', function(e) {
        e.preventDefault();
        uploadBox.style.borderColor = '#667eea';
        uploadBox.style.background = '#f1f5f9';
    });
    
    uploadBox.addEventListener('dragleave', function(e) {
        e.preventDefault();
        uploadBox.style.borderColor = '#cbd5e1';
        uploadBox.style.background = '#f8fafc';
    });
    
    uploadBox.addEventListener('drop', function(e) {
        e.preventDefault();
        uploadBox.style.borderColor = '#cbd5e1';
        uploadBox.style.background = '#f8fafc';
        
        const files = e.dataTransfer.files;
        if (files.length > 0 && files[0].name.endsWith('.csv')) {
            handleQuickUpload(files[0]);
        } else {
            statusDiv.className = 'upload-status error';
            statusDiv.textContent = '❌ Bitte nur CSV-Dateien hochladen';
        }
    });
}

// Handle quick upload - IDENTISCH ZUM COCKPIT
function handleQuickUpload(file) {
    const statusDiv = document.getElementById('quickUploadStatus');

    if (!file) return;

    statusDiv.className = 'upload-status';
    statusDiv.textContent = '⏳ Lade Datei...';

    const reader = new FileReader();
    reader.onload = function(event) {
        try {
            const csvText = event.target.result;
            const parsedData = parseCSV(csvText);

            const firstRow = parsedData[0] || {};
            const hasDay = 'day' in firstRow;
            const hasMonth = 'month' in firstRow;
            const hasYear = 'year' in firstRow;
            const hasVermittler = 'vermittler_id' in firstRow;
            const hasLandkreis = 'landkreis' in firstRow || 'kreis' in firstRow;

            // EXAKT GLEICHE LOGIK WIE IM COCKPIT (main.js:421-448)
            if (hasDay && hasVermittler) {
                // Tagesdaten
                window.dailyRawData = parsedData;
                dailyRawData = parsedData;
                console.log('Stored', dailyRawData.length, 'daily records');

                const monthlyData = aggregateDailyToMonthly(parsedData);
                state.uploadedData = monthlyData;

                const landkreisInfo = hasLandkreis ? ' mit Landkreisen' : '';
                statusDiv.className = 'upload-status success';
                statusDiv.textContent = `${file.name} geladen (${parsedData.length} Tagesdaten → ${monthlyData.length} Monate${landkreisInfo})`;
            } else if (hasMonth && !hasDay) {
                // Monatsdaten
                state.uploadedData = parsedData;
                window.dailyRawData = null;
                dailyRawData = null;

                statusDiv.className = 'upload-status success';
                statusDiv.textContent = `✅ ${file.name} geladen (${parsedData.length} Monatsdaten)`;
            } else {
                // Unbekanntes Format
                state.uploadedData = parsedData;
                window.dailyRawData = null;
                dailyRawData = null;

                statusDiv.className = 'upload-status success';
                statusDiv.textContent = `⚠️ ${file.name} geladen (${parsedData.length} Zeilen)`;
            }

            state.useUploadedData = true;

            // Update year filter if years are present
            if (hasYear && parsedData.length > 0) {
                const years = [...new Set(parsedData.map(row => row.year))].sort();
                console.log('Gefundene Jahre:', years);

                // Store years for Dashboard initialization
                state.availableYears = years;

                // Set current year to first available year if not already set
                if (!years.includes(parseInt(state.filters.year))) {
                    state.filters.year = String(years[0]);
                    console.log('Jahr-Filter gesetzt auf:', years[0]);
                }
            }

            console.log('Daten erfolgreich geladen:', parsedData.length, 'Zeilen');

        } catch (error) {
            console.error('Fehler beim Parsen:', error);
            statusDiv.className = 'upload-status error';
            statusDiv.textContent = '❌ Fehler beim Laden der Datei: ' + error.message;
        }
    };

    reader.onerror = function() {
        statusDiv.className = 'upload-status error';
        statusDiv.textContent = '❌ Fehler beim Lesen der Datei';
    };

    reader.readAsText(file);
}

// Open main dashboard - MIT CHAT!
function openDashboard() {
    console.log('Dashboard öffnen...');

    // Hide landing page
    const landingPage = document.getElementById('landingPage');
    if (landingPage) {
        landingPage.style.display = 'none';
    }

    // Hide BGAV page if open
    const bgavPage = document.getElementById('bgavUmstellungPage');
    if (bgavPage) bgavPage.style.display = 'none';

    // Show main app
    const mainApp = document.getElementById('mainApp');
    if (mainApp) {
        mainApp.style.display = 'block';

        // Dispatch event for Page ID Tracker (A-03)
        document.dispatchEvent(new CustomEvent('viewChanged', {
            detail: { module: 'versicherung', view: 'dashboard' }
        }));
    }

    // Globale Suche einblenden
    if (typeof showGlobalSearch === 'function') showGlobalSearch();

    // Update URL route
    if (window.AppRouter) AppRouter.navigate('/dashboard');

    // Initialize dashboard
    setTimeout(function() {
        if (typeof waitForLibraries === 'function') {
            waitForLibraries(function() {
                console.log('Libraries geladen, initialisiere Dashboard...');

                // Update year filter if years were loaded from CSV
                if (state.availableYears && state.availableYears.length > 0) {
                    const yearFilter = document.getElementById('yearFilter');
                    if (yearFilter) {
                        state.availableYears.forEach(year => {
                            if (!Array.from(yearFilter.options).some(opt => opt.value == year)) {
                                const option = document.createElement('option');
                                option.value = year;
                                option.textContent = year;
                                yearFilter.appendChild(option);
                            }
                        });
                        yearFilter.value = state.filters.year;
                        console.log('Jahr-Filter aktualisiert:', state.availableYears);
                    }
                }

                // Update Agentur dropdown with uploaded data
                if (typeof updateAgenturFilterDropdown === 'function') {
                    updateAgenturFilterDropdown();
                    console.log('Agentur-Filter Dropdown aktualisiert');
                }

                if (typeof initKPIGrid === 'function') {
                    initKPIGrid();
                    console.log('KPI Grid initialisiert');
                }

                if (typeof updateAllKPIs === 'function') {
                    updateAllKPIs();
                    console.log('KPIs aktualisiert');
                }
                
                setTimeout(() => {
                    if (typeof initMap === 'function') {
                        initMap();
                        console.log('Map initialisiert');
                    }
                }, 500);
                
                // WICHTIG: Chat RICHTIG aktivieren!
                setTimeout(() => {
                    console.log('Initialisiere Chat...');
                    
                    const chatWidget = document.getElementById('chatWidget');
                    const chatToggle = document.getElementById('chatToggle');
                    
                    if (!chatWidget || !chatToggle) {
                        console.error('Chat Elemente nicht gefunden!');
                        return;
                    }
                    
                    // Chat Widget anzeigen
                    chatWidget.style.display = 'flex';
                    chatToggle.style.display = 'none';
                    
                    // Chat RICHTIG initialisieren (aus chat.js)
                    if (typeof initChat === 'function') {
                        console.log('Rufe initChat() auf...');
                        initChat();
                    } else {
                        console.error('initChat() Funktion nicht gefunden!');
                        
                        // Fallback: Manuell Event Listeners setzen
                        console.log('Fallback: Setze Chat Event Listeners manuell...');
                        setupChatManually();
                    }
                }, 1000);
            });
        } else {
            console.error('waitForLibraries nicht gefunden!');
        }
    }, 100);
}

// Fallback: Chat manuell setup falls initChat nicht funktioniert
function setupChatManually() {
    const chatClose = document.getElementById('chatClose');
    const chatMinimize = document.getElementById('chatMinimize');
    const chatSend = document.getElementById('chatSend');
    const chatInput = document.getElementById('chatInput');
    const chatToggle = document.getElementById('chatToggle');
    const chatWidget = document.getElementById('chatWidget');
    
    if (!chatSend || !chatInput) {
        console.error('Chat Input/Send Buttons nicht gefunden!');
        return;
    }
    
    console.log('Chat Elemente gefunden, setze Event Listeners...');
    
    // Close chat
    if (chatClose) {
        chatClose.addEventListener('click', () => {
            console.log('Chat geschlossen');
            chatWidget.style.display = 'none';
            chatToggle.style.display = 'flex';
        });
    }
    
    // Minimize chat
    if (chatMinimize) {
        chatMinimize.addEventListener('click', () => {
            console.log('Chat minimiert/maximiert');
            chatWidget.classList.toggle('minimized');
        });
    }
    
    // Send message
    chatSend.addEventListener('click', () => {
        console.log('Send Button geklickt');
        if (typeof sendMessage === 'function') {
            sendMessage();
        } else {
            console.error('sendMessage() nicht gefunden!');
        }
    });
    
    // Enter to send
    chatInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            console.log('Enter gedrückt');
            if (typeof sendMessage === 'function') {
                sendMessage();
            } else {
                console.error('sendMessage() nicht gefunden!');
            }
        }
    });
    
    // Auto-resize textarea
    chatInput.addEventListener('input', () => {
        chatInput.style.height = 'auto';
        chatInput.style.height = chatInput.scrollHeight + 'px';
    });
    
    // Toggle chat
    if (chatToggle) {
        chatToggle.addEventListener('click', () => {
            console.log('Chat Toggle geklickt');
            chatWidget.style.display = 'flex';
            chatToggle.style.display = 'none';
            chatInput.focus();
        });
    }
    
    console.log('Chat manuell initialisiert!');
}

// Open upload dialog
function openUploadDialog() {
    console.log('Öffne Upload-Dialog...');
    document.getElementById('quickCsvUpload').click();
}

// Open CSV generator
function openGenerator() {
    console.log('Öffne Generator...');
    window.location.href = 'csv-generator.html';
}

// Back to landing page → redirect to React M-01
function backToLanding() {
    console.log('Zurück zur React M-01 Landing Page...');
    window.location.href = '/';
    return;

    // Legacy code below (no longer reached)
    const landingPage = document.getElementById('landingPage');
    const mainApp = document.getElementById('mainApp');
    const agenturOverview = document.getElementById('agenturOverview');
    const potentialAnalysePage = document.getElementById('potentialAnalysePage');
    const kundenDetailPage = document.getElementById('kundenDetailPage');
    const billingCheckPage = document.getElementById('billingCheckPage');

    // Alle Seiten verstecken
    if (mainApp) mainApp.style.display = 'none';
    if (agenturOverview) agenturOverview.style.display = 'none';
    if (potentialAnalysePage) potentialAnalysePage.style.display = 'none';
    if (kundenDetailPage) kundenDetailPage.style.display = 'none';
    if (billingCheckPage) billingCheckPage.style.display = 'none';

    // Globale Suche ausblenden
    if (typeof hideGlobalSearch === 'function') hideGlobalSearch();

    // B-02/B-10 Banking Berater verstecken
    var beraterOverviewPage = document.getElementById('beraterOverviewPage');
    if (beraterOverviewPage) beraterOverviewPage.style.display = 'none';
    var kundenDetailBankPage = document.getElementById('kundenDetailBankPage');
    if (kundenDetailBankPage) kundenDetailBankPage.style.display = 'none';

    // OPT-24: Globale Header-Controls zurück nach A-02 (Home-Slot)
    if (typeof moveGlobalControls === 'function') moveGlobalControls('a02ControlsSlot');

    // VV-02/VV-10 Vermögensverwaltung verstecken
    var vvOverviewPage = document.getElementById('vvOverviewPage');
    if (vvOverviewPage) vvOverviewPage.style.display = 'none';
    var vvDetailPage = document.getElementById('vvDetailPage');
    if (vvDetailPage) vvDetailPage.style.display = 'none';

    // Asset Management Module verstecken
    const assetModule = document.getElementById('assetModule');
    if (assetModule) {
        assetModule.style.display = 'none';
        assetModule.classList.remove('active');
    }

    // Alle Module-Contents deaktivieren und Versicherung reaktivieren
    document.querySelectorAll('.module-content').forEach(function(el) {
        el.classList.remove('active');
    });
    const versicherungModule = document.getElementById('versicherungModule');
    if (versicherungModule) versicherungModule.classList.add('active');

    // Module-Tabs zurücksetzen
    document.querySelectorAll('.module-tab').forEach(function(tab) {
        tab.classList.remove('active');
        if (tab.dataset.module === 'versicherung') tab.classList.add('active');
    });

    // localStorage zurücksetzen damit beim Reload nicht Asset Management öffnet
    safeLocalSet('currentModule', 'versicherung');

    // BGAV page verstecken
    const bgavPage = document.getElementById('bgavUmstellungPage');
    if (bgavPage) bgavPage.style.display = 'none';

    // Reset any zoom overrides from sub-tools (e.g. BGAV)
    document.documentElement.style.zoom = '';
    document.documentElement.style.transform = '';
    document.documentElement.style.transformOrigin = '';
    if (typeof applyAutoZoom === 'function') {
        setTimeout(applyAutoZoom, 50);
    }

    // Landing Page anzeigen
    if (landingPage) {
        landingPage.style.display = 'flex';

        // Welcome Chat wieder anzeigen (wird beim Init auf display:none gesetzt)
        var welcomeChat = document.getElementById('welcomeChat');
        if (welcomeChat) welcomeChat.style.display = 'block';

        // Dispatch event for Page ID Tracker (M-01)
        document.dispatchEvent(new CustomEvent('moduleChanged', {
            detail: { module: 'main', view: 'landing' }
        }));
    }

    // Update URL route
    window.location.href = '/';

    // Reset the landing chat response container (clear loading indicator)
    const responseContainer = document.getElementById('landingChatResponse');
    if (responseContainer) {
        responseContainer.style.display = 'none';
        responseContainer.innerHTML = '';
    }

    // Clear the chat input
    const chatInput = document.getElementById('landingChatInput');
    if (chatInput) {
        chatInput.value = '';
    }
}


// // Landing Page Chat Funktionalität - NUTZT GLEICHE FUNKTIONEN WIE DASHBOARD CHAT
let landingChatHistory = [];
let isLandingChatProcessing = false;

// Initialize landing page chat
function initLandingChat() {
    const chatSend = document.getElementById('landingChatSend');
    const chatInput = document.getElementById('landingChatInput');
    
    if (!chatSend || !chatInput) return;
    
    // Send message on button click
    chatSend.addEventListener('click', () => sendLandingChatMessage());
    
    // Enter to send (Shift+Enter for new line)
    chatInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendLandingChatMessage();
        }
    });
    
    // Auto-resize textarea
    chatInput.addEventListener('input', () => {
        chatInput.style.height = 'auto';
        chatInput.style.height = chatInput.scrollHeight + 'px';
    });
    
    console.log('Landing Chat initialisiert');
}
window.__registerModule('landing-core.js');
