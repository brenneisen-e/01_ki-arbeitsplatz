// js/landing.js - Landing Page Logic

// ========================================
// AUTO-ZOOM: Seite proportional skalieren
// Optimiert für 27 Zoll (1920px Breite)
// ========================================
(function() {
    var DESIGN_WIDTH = 1920;
    var MIN_ZOOM = 0.55; // Nicht kleiner als 55%

    function applyAutoZoom() {
        var vw = window.innerWidth;
        if (vw >= DESIGN_WIDTH) {
            document.documentElement.style.zoom = '1';
        } else {
            var zoom = Math.max(vw / DESIGN_WIDTH, MIN_ZOOM);
            document.documentElement.style.zoom = zoom;
        }
    }

    // Sofort beim Laden + bei Resize
    applyAutoZoom();
    window.addEventListener('resize', applyAutoZoom);
    window.addEventListener('DOMContentLoaded', applyAutoZoom);
})();

// ========================================
// CLAUDE API CONFIGURATION
// ========================================

// API via Cloudflare Worker (nutze window, um Konflikte mit chat.js zu vermeiden)
window.CLAUDE_WORKER_URL = window.CLAUDE_WORKER_URL || 'https://vst-claude-api.eike-3e2.workers.dev';
window.CLAUDE_MODEL = window.CLAUDE_MODEL || 'claude-haiku-4-5-20251001';

// Fallback: API-Key aus localStorage
function getApiToken() {
    return localStorage.getItem('claude_api_token') || '';
}

// Save API token to localStorage
function saveApiToken(token) {
    if (token && token.trim()) {
        localStorage.setItem('claude_api_token', token.trim());
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

    // Show main app
    const mainApp = document.getElementById('mainApp');
    if (mainApp) {
        mainApp.style.display = 'block';

        // Dispatch event for Page ID Tracker (A-03)
        document.dispatchEvent(new CustomEvent('viewChanged', {
            detail: { module: 'versicherung', view: 'dashboard' }
        }));
    }

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

// Back to landing page (ohne Reload)
function backToLanding() {
    console.log('Zurück zur Landing Page...');

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

    // Landing Page anzeigen
    if (landingPage) {
        landingPage.style.display = 'flex';

        // Dispatch event for Page ID Tracker (M-01)
        document.dispatchEvent(new CustomEvent('moduleChanged', {
            detail: { module: 'main', view: 'landing' }
        }));
    }

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

// ========================================
// VOICE INPUT (Microphone Button)
// ========================================
let voiceRecognition = null;
let isRecording = false;

function stopRecordingUI() {
    const micBtn = document.getElementById('landingChatMic');
    const chatInput = document.getElementById('landingChatInput');
    isRecording = false;
    if (micBtn) micBtn.classList.remove('recording');
    if (chatInput) {
        chatInput.readOnly = false;
        chatInput.style.borderColor = '';
    }
}

function runDemoVoiceInput() {
    const micBtn = document.getElementById('landingChatMic');
    const chatInput = document.getElementById('landingChatInput');
    if (micBtn) micBtn.classList.add('recording');
    isRecording = true;
    if (chatInput) { chatInput.readOnly = true; chatInput.style.borderColor = '#ef4444'; chatInput.value = ''; }
    const demoText = 'Gib mir aktuelle Vertriebspotentiale';
    let charIndex = 0;

    // Wait 1.5s simulating "listening", then gradually type text
    setTimeout(() => {
        const typeInterval = setInterval(() => {
            if (!isRecording) { clearInterval(typeInterval); return; }
            if (charIndex < demoText.length) {
                chatInput.value = demoText.substring(0, charIndex + 1);
                chatInput.style.height = 'auto';
                chatInput.style.height = chatInput.scrollHeight + 'px';
                charIndex++;
            } else {
                clearInterval(typeInterval);
                stopRecordingUI();
                setTimeout(() => { sendLandingChatMessage(); }, 300);
            }
        }, 65);
    }, 1500);
}

function toggleVoiceInput() {
    const micBtn = document.getElementById('landingChatMic');
    const chatInput = document.getElementById('landingChatInput');

    if (isRecording) {
        if (voiceRecognition) voiceRecognition.stop();
        stopRecordingUI();
        return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
        runDemoVoiceInput();
        return;
    }

    // Erst Mikrofon-Berechtigung explizit anfragen (triggert Browser-Prompt)
    // Dann SpeechRecognition starten
    navigator.mediaDevices.getUserMedia({ audio: true })
        .then(stream => {
            // Mikrofon sofort wieder freigeben (wir brauchen nur die Berechtigung)
            stream.getTracks().forEach(track => track.stop());
            startSpeechRecognition(micBtn, chatInput);
        })
        .catch(err => {
            console.warn('Mikrofon-Zugriff verweigert:', err.message);
            // Berechtigung verweigert → Demo-Fallback
            runDemoVoiceInput();
        });
}

let speechSendTimer = null;

function startSpeechRecognition(micBtn, chatInput) {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    voiceRecognition = new SpeechRecognition();
    voiceRecognition.lang = 'de-DE';
    voiceRecognition.continuous = true;
    voiceRecognition.interimResults = true;

    voiceRecognition.onstart = () => {
        isRecording = true;
        if (micBtn) micBtn.classList.add('recording');
        if (chatInput) { chatInput.readOnly = true; chatInput.style.borderColor = '#ef4444'; }
    };

    voiceRecognition.onresult = (event) => {
        // Alle Ergebnisse zusammenbauen (interim + final)
        let transcript = '';
        for (let i = 0; i < event.results.length; i++) {
            transcript += event.results[i][0].transcript;
        }
        if (chatInput) {
            chatInput.value = transcript;
            chatInput.style.height = 'auto';
            chatInput.style.height = chatInput.scrollHeight + 'px';
        }

        // Debounce: nach 2s Stille automatisch absenden
        if (speechSendTimer) clearTimeout(speechSendTimer);
        speechSendTimer = setTimeout(() => {
            if (isRecording && chatInput && chatInput.value.trim()) {
                stopRecordingUI();
                if (voiceRecognition) { voiceRecognition.stop(); voiceRecognition = null; }
                setTimeout(() => { sendLandingChatMessage(); }, 300);
            }
        }, 2000);
    };

    voiceRecognition.onend = () => {
        // continuous mode kann unerwartet enden - nicht sofort senden
        if (!isRecording) return;
        // Warte noch kurz ob der Timer schon senden will
        if (!speechSendTimer && chatInput && chatInput.value.trim()) {
            stopRecordingUI();
            setTimeout(() => { sendLandingChatMessage(); }, 300);
        }
    };

    voiceRecognition.onerror = (event) => {
        console.warn('Speech recognition error:', event.error);
        if (speechSendTimer) { clearTimeout(speechSendTimer); speechSendTimer = null; }
        stopRecordingUI();
        voiceRecognition = null;
        if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
            runDemoVoiceInput();
        }
    };

    voiceRecognition.start();
}

// ========================================
// DUAL VIEW: Stammdaten + Potentiale nebeneinander
// ========================================
function openKundenDetailDualView(kundenName, vermittlerId) {
    // Track that we came from landing (M-01 chat)
    if (typeof previousViewBeforeKundenDetail !== 'undefined') {
        previousViewBeforeKundenDetail = 'landing';
    }

    // Open customer detail page normally
    openKundenDetail(kundenName, vermittlerId);

    // Wait for the page to load, then activate dual view
    setTimeout(() => {
        const kundenContent = document.querySelector('.kunden-content');
        if (!kundenContent) return;

        kundenContent.classList.add('dual-view');

        document.querySelectorAll('.kunden-tab').forEach(tab => tab.classList.remove('active'));
        document.querySelectorAll('.kunden-tab-content').forEach(content => {
            content.classList.remove('active');
            content.classList.remove('dual-visible');
        });

        const stammdatenTab = document.querySelector('.kunden-tab[data-tab="stammdaten"]');
        const impulseTab = document.querySelector('.kunden-tab[data-tab="impulse"]');
        if (stammdatenTab) stammdatenTab.classList.add('active');
        if (impulseTab) impulseTab.classList.add('active');

        const tabStammdaten = document.getElementById('tabStammdaten');
        const tabImpulse = document.getElementById('tabImpulse');
        if (tabStammdaten) tabStammdaten.classList.add('active', 'dual-visible');
        if (tabImpulse) tabImpulse.classList.add('active', 'dual-visible');

        // Add class to page for full-width dual layout
        const kundenPage = document.getElementById('kundenDetailPage');
        if (kundenPage) kundenPage.classList.add('dual-view-active');

        console.log('Dual View aktiviert: Stammdaten + Potentiale');
    }, 300);
}

function closeDualView() {
    const kundenContent = document.querySelector('.kunden-content');
    if (!kundenContent) return;

    kundenContent.classList.remove('dual-view');
    document.querySelectorAll('.kunden-tab-content').forEach(content => {
        content.classList.remove('dual-visible');
    });

    const kundenPage = document.getElementById('kundenDetailPage');
    if (kundenPage) kundenPage.classList.remove('dual-view-active');

    if (typeof switchKundenTab === 'function') {
        switchKundenTab('stammdaten');
    }
}

window.openKundenDetailDualView = openKundenDetailDualView;
window.closeDualView = closeDualView;
window.toggleVoiceInput = toggleVoiceInput;

// Send message in landing chat - NUTZT GLEICHE LOGIK WIE DASHBOARD
async function sendLandingChatMessage() {
    const chatInput = document.getElementById('landingChatInput');
    const message = chatInput.value.trim();
    
    console.log('Landing Nachricht senden:', message);
    
    if (!message || isLandingChatProcessing) {
        console.log('Leere Nachricht oder bereits in Verarbeitung');
        return;
    }
    
    // Clear input
    chatInput.value = '';
    chatInput.style.height = 'auto';
    
    // Add user message
    addLandingChatMessage('user', message);
    
    // Show typing indicator
    showLandingChatTyping();
    
    isLandingChatProcessing = true;
    
    try {
        if (isUsingMockMode()) {
            // Mock response
            console.log('Mock-Modus - Generiere Test-Antwort');
            await new Promise(resolve => setTimeout(resolve, 2500));
            const mockResponse = generateLandingMockResponse(message);
            hideLandingChatTyping();
            addLandingChatMessage('assistant', mockResponse);
        } else {
            // Real API call via Worker
            console.log('Rufe API auf...');
            await sendLandingMessageToClaude(message);
        }
        
    } catch (error) {
        console.error('Landing Chat Fehler:', error);
        hideLandingChatTyping();
        // Fallback to mock response on API error
        console.log('Fallback auf Mock-Antwort...');
        const mockResponse = generateLandingMockResponse(message);
        addLandingChatMessage('assistant', mockResponse);
    }
    
    isLandingChatProcessing = false;
}

// Send to API via Worker
async function sendLandingMessageToClaude(message) {
    console.log('Sende Anfrage an API...');

    // Prepare context about current data
    const dataContext = getLandingDataContext();

    // System prompt
    const systemPrompt = `Du bist ein KI-Assistent für ein Versicherungs-Dashboard. Du hast Zugriff auf CSV-Daten und kannst Dashboard-Filter steuern.

VERFÜGBARE FUNKTIONEN:
1. setAgenturFilter(vermittler_id) - Filtert Dashboard nach Agentur
   - Verwende IMMER die Vermittler-ID (z.B. 'VM00001'), NIEMALS den Namen!
   - Beispiel: setAgenturFilter('VM00001') für Max Mustermann

2. setSiloFilter(silo) - Filtert nach Silo
   - Gültige Werte: 'Ausschließlichkeit', 'Makler', 'Direktvertrieb', 'Banken'

3. setSegmentFilter(segments) - Filtert nach Segmenten
   - Gültige Werte: 'Leben', 'Kranken', 'Schaden', 'Kfz'

4. setBundeslandFilter(bundeslaender) - Filtert nach Bundesländern

5. clearAllFilters() - Setzt alle Filter zurück

6. showAgenturOverview(vermittler_id) - Zeigt detaillierte Agentur-Übersichtsseite
   - Beispiel: showAgenturOverview('VM00001') für Max Mustermann
   - Zeigt: Stammdaten, Foto, KPI-Dashboard mit Balken, Vertragshistorie
   - Nutze diese Funktion bei Fragen wie "Übersicht Agentur Max Mustermann"
   - WICHTIG: Verwende IMMER die Vermittler-ID, nicht den Namen!

WICHTIG:
- Nutze die bereitgestellten Daten aus dem Kontext
- Berechne Summen/Durchschnitte aus den echten Zahlen
- Formatiere große Zahlen lesbar (z.B. "€45.2 Mio")
- Sei präzise und konkret
- Antworte auf Deutsch und sei freundlich
- Wenn keine Daten vorhanden sind, erkläre dass der User zuerst eine CSV hochladen oder zum Dashboard gehen sollte`;

    // Build messages array
    const messages = [
        {
            role: 'user',
            content: `AKTUELLE DATEN:
${dataContext}

USER FRAGE: ${message}`
        }
    ];

    // API URL (Worker or direct)
    const apiUrl = window.USE_WORKER ? window.CLAUDE_WORKER_URL : "https://api.anthropic.com/v1/messages";

    // Headers
    const headers = { "Content-Type": "application/json" };
    if (!window.USE_WORKER) {
        headers["x-api-key"] = getApiToken();
        headers["anthropic-version"] = "2023-06-01";
        headers["anthropic-dangerous-direct-browser-access"] = "true";
    }

    // Call API
    const response = await fetch(apiUrl, {
        method: "POST",
        headers: headers,
        body: JSON.stringify({
            model: window.CLAUDE_MODEL,
            max_tokens: 2000,
            system: systemPrompt,
            messages: messages
        })
    });

    if (!response.ok) {
        const errorText = await response.text();
        console.error('API Fehler:', response.status, errorText);
        throw new Error(`API request failed: ${response.status}`);
    }

    const data = await response.json();
    const assistantMessage = data.content[0].text;
    
    console.log('API Antwort erhalten:', assistantMessage.substring(0, 100) + '...');
    
    hideLandingChatTyping();
    addLandingChatMessage('assistant', assistantMessage);

    landingChatHistory.push(
        { role: 'user', content: message },
        { role: 'assistant', content: assistantMessage }
    );

    // NEU: Parse und führe Filter-Befehle aus
    await parseAndExecuteCommands(assistantMessage);
}

// Get context about current data - GLEICHE FUNKTION WIE DASHBOARD
function getLandingDataContext() {
    // Check both window.dailyRawData and global dailyRawData
    const rawData = window.dailyRawData || (typeof dailyRawData !== 'undefined' ? dailyRawData : null);

    // Prüfe ob Daten geladen sind
    if (!rawData || rawData.length === 0) {
        return `Keine Daten geladen.

Der Nutzer ist auf der Landing Page und hat noch keine CSV-Datei hochgeladen.

HINWEIS FÜR ASSISTENT:
- Erkläre, dass zuerst Daten hochgeladen werden müssen
- Biete an, beim Upload zu helfen
- Oder schlage vor, zum Dashboard zu gehen und dort Test-Daten zu generieren`;
    }
    
    // GLEICHE LOGIK WIE IM DASHBOARD CHAT (getDataContext aus chat.js)
    const agenturen = typeof getAgenturen === 'function' ? getAgenturen() : [];
    const bundeslaender = [...new Set(rawData.map(r => r.bundesland))].filter(Boolean);
    const silos = [...new Set(rawData.map(r => r.silo))].filter(Boolean);
    const segments = [...new Set(rawData.map(r => r.segment))].filter(Boolean);
    
    // Calculate basic stats
    const filteredData = typeof getFilteredData === 'function' ? getFilteredData() : [];
    
    const totalNeugeschaeft = filteredData.reduce((sum, m) => sum + (m.neugeschaeft || 0), 0);
    const avgStorno = filteredData.length > 0 ? 
        filteredData.reduce((sum, m) => sum + (m.storno || 0), 0) / filteredData.length : 0;
    const avgNPS = filteredData.length > 0 ?
        filteredData.reduce((sum, m) => sum + (m.nps || 0), 0) / filteredData.length : 0;
    const totalErgebnis = filteredData.reduce((sum, m) => sum + (m.ergebnis || 0), 0);
    const currentBestand = filteredData.length > 0 ? filteredData[filteredData.length - 1].bestand : 0;
    
    const agentList = agenturen.slice(0, 10).map(a => 
        `  - ${a.id}: ${a.name || 'Kein Name'}`
    ).join('\n');
    
    return `
Datensatz: ${rawData.length} Zeilen (Tagesdaten)
Agenturen: ${agenturen.length} verfügbar

WICHTIG - Vermittler-IDs (verwende diese für Filter!):
${agentList}
${agenturen.length > 10 ? `  ... und ${agenturen.length - 10} weitere` : ''}

Bundesländer: ${bundeslaender.join(', ')}
Silos: ${silos.join(', ')}
Segmente: ${segments.join(', ')}

AGGREGIERTE DATEN:
- Gesamt Neugeschäft YTD: €${(totalNeugeschaeft / 1000000).toFixed(1)} Mio
- Durchschnitt Stornoquote: ${avgStorno.toFixed(2)}%
- Durchschnitt NPS: ${avgNPS.toFixed(1)}
- Gesamt Ergebnis: €${(totalErgebnis / 1000).toFixed(0)}k
- Aktueller Bestand: €${(currentBestand / 1000000).toFixed(1)} Mio
- Anzahl Monate mit Daten: ${filteredData.length}
`;
}

// Generate mock response - VERBESSERT
function generateLandingMockResponse(message) {
    const lowerMessage = message.toLowerCase();

    // ========================================
    // VERTRIEBSPOTENTIALE - Kunden mit Potentialen
    // ========================================
    if (lowerMessage.includes('vertriebspotentiale') || lowerMessage.includes('vertriebspotenziale') ||
        (lowerMessage.includes('potentiale') && !lowerMessage.includes('option')) ||
        (lowerMessage.includes('potenziale') && !lowerMessage.includes('option'))) {

        return `Hallo Eike, sehr gerne. Ich habe folgende Vertriebspotentiale identifiziert:
<div class="chat-potentiale-list"><div class="chat-potentiale-item"><div class="kunde-info"><div class="kunde-avatar">PS</div><div class="kunde-details"><span class="kunde-name">Peter Schmidt</span><span class="kunde-potential multiple">Mehrere Potentiale erkannt</span><span class="kunde-desc">KFZ, BU & Hausrat – Vertragslücken identifiziert</span></div></div><button class="kunde-btn" onclick="openKundenDetailDualView('Peter Schmidt', 'KD00001')">Zum Kunden</button></div><div class="chat-potentiale-item"><div class="kunde-info"><div class="kunde-avatar">AM</div><div class="kunde-details"><span class="kunde-name">Anna Müller</span><span class="kunde-potential">Kfz-Versicherung – Wechselpotential</span><span class="kunde-desc">Vertrag läuft 12/2026 aus, Angebot erstellen</span></div></div><button class="kunde-btn" onclick="openKundenDetailDualView('Anna Müller', 'KD00042')">Zum Kunden</button></div><div class="chat-potentiale-item"><div class="kunde-info"><div class="kunde-avatar">TW</div><div class="kunde-details"><span class="kunde-name">Thomas Weber</span><span class="kunde-potential">BU-Versicherung – Deckungslücke</span><span class="kunde-desc">Aktuelle Absicherung deckt nur 60% des Nettoeinkommens</span></div></div><button class="kunde-btn" onclick="openKundenDetailDualView('Thomas Weber', 'KD00087')">Zum Kunden</button></div><div class="chat-potentiale-item"><div class="kunde-info"><div class="kunde-avatar">SK</div><div class="kunde-details"><span class="kunde-name">Sandra Koch</span><span class="kunde-potential">Hausratversicherung – Cross-Selling</span><span class="kunde-desc">Bestandskundin Leben, kein Sachvertrag vorhanden</span></div></div><button class="kunde-btn" onclick="openKundenDetailDualView('Sandra Koch', 'KD00023')">Zum Kunden</button></div><div class="chat-potentiale-item"><div class="kunde-info"><div class="kunde-avatar">MF</div><div class="kunde-details"><span class="kunde-name">Michael Fischer</span><span class="kunde-potential">Altersvorsorge – Nachholbedarf</span><span class="kunde-desc">38 Jahre, keine private Altersvorsorge, hohe Sparquote</span></div></div><button class="kunde-btn" onclick="openKundenDetailDualView('Michael Fischer', 'KD00056')">Zum Kunden</button></div></div>
Klicke auf **"Zum Kunden"** um die Details und Potentiale einzusehen.`;
    }

    // ========================================
    // SAMPLE QUESTIONS - Hardcoded Responses
    // ========================================

    // "Was kann ich mit diesem Tool alles machen?"
    if (lowerMessage.includes('was kann ich') && lowerMessage.includes('machen')) {
        return `**Willkommen beim Vertriebssteuerungs-Dashboard!**

Dieses Tool bietet Ihnen:

**Analyse & Monitoring**
• Echtzeit-Übersicht über Neugeschäft, Bestand und Storno
• Performance-Vergleich nach Region, Segment und Vertriebskanal
• Interaktive Landkarte mit Regierungsbezirk-Drill-Down

**KI-gestützte Features**
• Natürlichsprachliche Datenabfragen
• Automatische Anomalie-Erkennung
• Intelligente Handlungsempfehlungen

**Steuerung & Filter**
• Flexible Filterung nach Zeitraum, Bundesland, Segment
• Export-Funktionen für Reports
• Personalisierbare Dashboards

👉 Klicken Sie auf **"Zum Dashboard"** um loszulegen!`;
    }

    // "Welche Use Cases gibt es für dieses Dashboard?"
    if (lowerMessage.includes('use case')) {
        return `**Typische Use Cases für das Dashboard:**

**1. Vertriebsleiter**
• Tägliche Performance-Übersicht aller Vermittler
• Identifikation von Top- und Low-Performern
• Regionale Marktanalysen

**2. Regionalmanager**
• Vergleich der Vertriebskanäle in der Region
• Stornoquoten-Monitoring
• NPS-Tracking für Kundenzufriedenheit

**3. Controlling**
• Monatliche Berichtskonsolidierung
• Trend-Analysen über Zeiträume
• Segment-übergreifende Auswertungen

**4. Vorstand**
• High-Level KPI-Übersicht
• Strategische Entscheidungsunterstützung
• Benchmark-Vergleiche

👉 Wählen Sie im Dashboard den für Sie relevanten Bereich!`;
    }

    // "Zeige mir eine Übersicht meiner Daten"
    if (lowerMessage.includes('übersicht') && lowerMessage.includes('daten')) {
        const count = dailyRawData ? dailyRawData.length : 0;
        const agentCount = typeof getAgenturen === 'function' ? getAgenturen().length : 0;

        if (count > 0) {
            return `**Ihre Datenübersicht:**

**Datenbasis**
• ${count.toLocaleString()} Datensätze geladen
• ${agentCount} Vermittler im System
• Zeitraum: 2024 - 2025

**Verfügbare Dimensionen**
• **Segmente:** Leben, Kranken, Schaden, Kfz
• **Vertriebskanäle:** Ausschließlichkeit, Makler, Direktvertrieb, Banken
• **Regionen:** Alle Bundesländer und Regierungsbezirke

**KPIs im Dashboard**
• Neugeschäft (Prämienvolumen)
• Bestand (verwaltetes Volumen)
• Stornoquote
• NPS Score
• Deckungsbeitrag

👉 Gehen Sie zum **Dashboard** für detaillierte Analysen!`;
        }
        return `**Datenübersicht**

⚠️ Aktuell sind keine Daten geladen.

**So starten Sie:**
1. Laden Sie eine CSV-Datei hoch (Drag & Drop unten)
2. Oder klicken Sie auf "Zum Dashboard" für Demo-Daten

**Unterstützte Formate:**
• CSV mit Tages-Granularität
• Felder: Datum, Vermittler, Segment, KPIs

👉 Nach dem Upload analysiere ich Ihre Daten automatisch!`;
    }

    // Prüfe ob Daten vorhanden sind
    if (!dailyRawData || dailyRawData.length === 0) {
        if (lowerMessage.includes('daten') || lowerMessage.includes('analyse') || lowerMessage.includes('zahlen')) {
            return '**Keine Daten vorhanden**\n\nBitte lade zuerst eine CSV-Datei hoch (unten in der Box) oder gehe zum Dashboard und generiere Test-Daten.\n\nDann kann ich dir bei der Analyse helfen!';
        }
    }
    
    // Performance von Stadt/Landkreis
    if (lowerMessage.includes('performance') && (lowerMessage.includes('freiburg') || lowerMessage.includes('landkreis') || lowerMessage.includes('stadt'))) {
        return `📊 **Performance-Analyse für Freiburg:**

**Neugeschäft:** €4.2 Mio (Rang 3 in Baden-Württemberg)
**Bestand:** €180 Mio
**Stornoquote:** 6.8% (gut, unter Durchschnitt)
**NPS Score:** 78 (überdurchschnittlich)

🎯 **Insights:**
- Starke Marktposition im Südwesten
- Niedrige Stornoquote deutet auf gute Kundenbindung hin
- Überdurchschnittlicher NPS zeigt hohe Kundenzufriedenheit

💡 *Mit einem API-Key würde ich detaillierte Echtzeitdaten aus deiner CSV analysieren.*`;
    }

    // ========================================
    // SPECIAL: Best Sales Regions Query
    // ========================================
    if ((lowerMessage.includes('beste') || lowerMessage.includes('top')) &&
        (lowerMessage.includes('vertriebsregion') || lowerMessage.includes('region') || lowerMessage.includes('gebiet'))) {

        // Extract number if provided (default to 5)
        const numberMatch = lowerMessage.match(/(\d+)/);
        const count = numberMatch ? Math.min(parseInt(numberMatch[1]), 10) : 5;

        // Trigger the special query handler
        setTimeout(() => handleTopRegionsQuery(count), 100);

        return `🔍 **Analysiere die ${count} besten Vertriebsregionen...**\n\nEinen Moment, ich navigiere zum Dashboard und zeige dir die Regionen auf der Karte.`;
    }

    // ========================================
    // SPECIAL: Single Region Query (e.g. "Vertriebszahlen aus Düsseldorf" or "Vertriebskennzahlen München")
    // ========================================
    const regionKeywords = ['vertriebszahlen', 'vertriebskennzahlen', 'kennzahlen', 'zahlen', 'daten', 'performance', 'wie läuft', 'wie geht', 'ergebnisse', 'umsatz', 'neugeschäft'];
    const locationPreps = ['aus', 'von', 'in', 'für', 'zu'];

    // Known cities/regions for direct matching (without preposition)
    const knownLocations = [
        'münchen', 'munich', 'berlin', 'hamburg', 'köln', 'cologne', 'düsseldorf', 'dusseldorf',
        'frankfurt', 'stuttgart', 'dortmund', 'essen', 'bremen', 'dresden', 'leipzig', 'hannover',
        'nürnberg', 'nuremberg', 'duisburg', 'bochum', 'wuppertal', 'bielefeld', 'bonn', 'münster',
        'karlsruhe', 'mannheim', 'augsburg', 'wiesbaden', 'mainz', 'freiburg', 'koblenz', 'trier',
        'kassel', 'braunschweig', 'magdeburg', 'erfurt', 'rostock', 'kiel', 'lübeck', 'potsdam',
        'oberbayern', 'niederbayern', 'oberpfalz', 'oberfranken', 'mittelfranken', 'unterfranken',
        'schwaben', 'arnsberg', 'detmold', 'köln', 'düsseldorf', 'darmstadt', 'gießen'
    ];

    const hasRegionKeyword = regionKeywords.some(kw => lowerMessage.includes(kw));
    const hasLocationPrep = locationPreps.some(prep => lowerMessage.includes(' ' + prep + ' '));

    // Check for direct city name match (e.g. "Vertriebskennzahlen München")
    const foundLocation = knownLocations.find(loc => lowerMessage.includes(loc));

    if (hasRegionKeyword && (hasLocationPrep || foundLocation)) {
        let regionName = null;

        // First try with preposition
        if (hasLocationPrep) {
            const regionMatch = message.match(/(?:aus|von|in|für|zu)\s+([A-ZÄÖÜa-zäöüß][A-ZÄÖÜa-zäöüß\-\s]+?)(?:\s*\?|$|\s+und|\s+oder|\s+mit)/i);
            if (regionMatch) {
                regionName = regionMatch[1].trim();
            }
        }

        // If no preposition match, try direct city match
        if (!regionName && foundLocation) {
            // Find the properly capitalized version in the original message
            const cityMatch = message.match(new RegExp(foundLocation, 'i'));
            if (cityMatch) {
                regionName = cityMatch[0];
            }
        }

        if (regionName) {
            setTimeout(() => handleSingleRegionQuery(regionName), 100);
            return `🔍 **Lade Vertriebsdaten für ${regionName}...**\n\nEinen Moment, ich navigiere zum Dashboard und zeige dir die Region auf der Karte.`;
        }
    }

    // Top performers (Vermittler)
    if (lowerMessage.includes('top') || lowerMessage.includes('beste')) {
        if (dailyRawData && dailyRawData.length > 0) {
            const agenturen = typeof getAgenturen === 'function' ? getAgenturen().slice(0, 5) : [];
            if (agenturen.length > 0) {
                return `📊 **Top 5 Vermittler:**\n\n${agenturen.map((a, i) =>
                    `${i+1}. **${a.name || a.id}**`
                ).join('\n')}\n\n💡 *Mit einem API-Key würde ich die tatsächlichen Zahlen analysieren.*`;
            }
        }
        return '📊 Bitte lade zuerst Daten hoch, dann kann ich dir die Top-Performer zeigen!';
    }
    
    // General info
    if (lowerMessage.includes('wie viele') || lowerMessage.includes('anzahl')) {
        const count = dailyRawData ? dailyRawData.length : 0;
        const agentCount = typeof getAgenturen === 'function' ? getAgenturen().length : 0;
        
        if (count > 0) {
            return `📊 **Datensatz-Übersicht:**\n\n• ${count.toLocaleString()} Zeilen Tagesdaten\n• ${agentCount} Vermittler\n\n💡 *Mit einem API-Key könnte ich detaillierte Analysen durchführen.*`;
        }
        return '📊 Noch keine Daten geladen. Lade eine CSV hoch oder gehe zum Dashboard!';
    }
    
    // Default
    if (lowerMessage.includes('hallo') || lowerMessage.includes('hi')) {
        return 'Hallo! 👋 Ich kann dir beim Einstieg ins Dashboard helfen. Möchtest du eine CSV hochladen oder direkt zum Dashboard?';
    }
    
    const suggestions = [
        { text: 'Kennzahlen München', query: 'Kennzahlen München' },
        { text: 'Top 5 Vertriebsregionen', query: 'Top 5 Vertriebsregionen' },
        { text: 'Übersicht Daten', query: 'Wie viele Daten haben wir?' }
    ];

    const buttons = suggestions.map(s =>
        `<button onclick="document.getElementById('landingChatInput').value='${s.query.replace(/'/g, "\\'")}'; sendLandingChatMessage();">${s.text}</button>`
    ).join('');

    return `Ich habe deine Frage verstanden: "${message}"\n\nHier sind einige Dinge, die ich für dich tun kann:\n\n<div class="chat-followup-suggestions">${buttons}</div>`;
}

// Add message to chat - Display in response container below input
function addLandingChatMessage(role, content) {
    const responseContainer = document.getElementById('landingChatResponse');
    if (!responseContainer) {
        console.error('Landing chat response container not found');
        return;
    }

    // Show the container
    responseContainer.style.display = 'block';

    // For assistant messages, replace entire content (cleaner UX)
    if (role === 'assistant') {
        // Format content (basic markdown support)
        let formattedContent = content
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/`(.*?)`/g, '<code>$1</code>');

        // Smart newline handling: don't convert \n inside HTML blocks
        if (content.includes('<div')) {
            const htmlStart = formattedContent.indexOf('<div');
            const htmlEnd = formattedContent.lastIndexOf('</div>') + 6;
            const textBefore = formattedContent.substring(0, htmlStart).replace(/\n/g, '<br>');
            const htmlBlock = formattedContent.substring(htmlStart, htmlEnd);
            const textAfter = formattedContent.substring(htmlEnd).replace(/\n/g, '<br>');
            formattedContent = textBefore + htmlBlock + textAfter;
        } else {
            formattedContent = formattedContent.replace(/\n/g, '<br>');
        }
        formattedContent = formattedContent.replace(/• /g, '<br>• ');

        responseContainer.innerHTML = `
            <div class="landing-response-card">
                <div class="landing-response-header">
                    <div class="chat-avatar-deloitte"><span class="deloitte-d">D</span></div>
                    <span class="landing-response-title">Antwort</span>
                </div>
                <div class="landing-response-content">${formattedContent}</div>
            </div>
        `;
    }
    // User messages are not displayed (just sent)
}

// Show typing indicator
function showLandingChatTyping() {
    const responseContainer = document.getElementById('landingChatResponse');
    if (!responseContainer) return;

    responseContainer.style.display = 'block';
    responseContainer.innerHTML = `
        <div class="landing-response-card">
            <div class="landing-response-header">
                <div class="chat-avatar-deloitte"><span class="deloitte-d">D</span></div>
                <span class="landing-response-title">Denke nach...</span>
            </div>
            <div class="landing-chat-typing" id="landingTypingIndicator">
                <span></span><span></span><span></span>
            </div>
        </div>
    `;
}

// Hide typing indicator
function hideLandingChatTyping() {
    // Typing gets replaced by the actual response, no action needed
}

// OLD FUNCTIONS - kept for reference but not used
function showLandingChatTypingOLD() {
    const chatMessages = document.getElementById('landingChatMessages');

    const typingDiv = document.createElement('div');
    typingDiv.className = 'landing-chat-message assistant';
    typingDiv.id = 'landingTypingIndicator';

    const avatar = document.createElement('div');
    avatar.className = 'chat-avatar-deloitte';
    avatar.innerHTML = '<span class="deloitte-d">D</span>';

    const typing = document.createElement('div');
    typing.className = 'landing-chat-typing';
    typing.innerHTML = '<span></span><span></span><span></span>';

    typingDiv.appendChild(avatar);
    typingDiv.appendChild(typing);

    chatMessages.appendChild(typingDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Hide typing indicator
function hideLandingChatTyping() {
    const typing = document.getElementById('landingTypingIndicator');
    if (typing) {
        typing.remove();
    }
}

// ========================================
// SPECIAL QUERY HANDLER: Top Sales Regions
// ========================================

/**
 * Handle the "beste Vertriebsregionen" query
 * - Navigate to Dashboard (A-03)
 * - Calculate top regions from data
 * - Select regions on the map
 * - Show interactive response with export buttons
 */
async function handleTopRegionsQuery(count = 5) {
    console.log(`[Query] Top ${count} Vertriebsregionen gestartet...`);

    // Check if data is available
    const rawData = window.dailyRawData || (typeof dailyRawData !== 'undefined' ? dailyRawData : null);
    if (!rawData || rawData.length === 0) {
        showTopRegionsResponse(null, count, 'Keine Daten verfügbar. Bitte lade zuerst eine CSV-Datei hoch.');
        return;
    }

    // Show loading indicator on landing page
    const responseContainer = document.getElementById('landingChatResponse');
    if (responseContainer) {
        responseContainer.style.display = 'block';
        responseContainer.innerHTML = `
            <div class="landing-response-card" style="text-align: center; padding: 24px;">
                <div style="margin-bottom: 12px;">
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#0ea5e9" stroke-width="2" style="animation: spin 1s linear infinite;">
                        <path d="M21 12a9 9 0 11-6.219-8.56"/>
                    </svg>
                </div>
                <div style="font-weight: 600; color: #1e293b;">Lade Dashboard und Karte...</div>
                <div style="font-size: 12px; color: #64748b; margin-top: 4px;">Regionen werden analysiert</div>
            </div>
            <style>
                @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
            </style>
        `;
    }

    // Initialize dashboard in background (hidden)
    const landingPage = document.getElementById('landingPage');
    const mainApp = document.getElementById('mainApp');

    // Show mainApp but keep it invisible for initialization
    if (mainApp) {
        mainApp.style.display = 'block';
        mainApp.style.visibility = 'hidden';
        mainApp.style.position = 'absolute';
        mainApp.style.left = '-9999px';
    }

    // Trigger dashboard initialization
    if (typeof waitForLibraries === 'function') {
        waitForLibraries(function() {
            if (typeof initKPIGrid === 'function') initKPIGrid();
            if (typeof updateAllKPIs === 'function') updateAllKPIs();
            if (typeof initMap === 'function') initMap();
        });
    }

    // Wait for map to fully initialize with polling
    let mapHandler = null;
    let attempts = 0;
    const maxAttempts = 40; // 40 * 150ms = 6 seconds max

    while (!mapHandler && attempts < maxAttempts) {
        await new Promise(resolve => setTimeout(resolve, 150));
        mapHandler = window.countyMapHandler;
        attempts++;

        // Check if map has data
        if (mapHandler && mapHandler.counties && mapHandler.counties.size > 0) {
            const hasData = Array.from(mapHandler.counties.values()).some(c => c.value > 0);
            if (!hasData) {
                mapHandler = null;
            }
        } else {
            mapHandler = null;
        }
    }

    if (!mapHandler) {
        console.error('[Query] Map handler nicht gefunden nach Timeout');
        // Reset mainApp visibility
        if (mainApp) {
            mainApp.style.display = 'none';
            mainApp.style.visibility = '';
            mainApp.style.position = '';
            mainApp.style.left = '';
        }
        showTopRegionsResponse(null, count, 'Karte konnte nicht geladen werden. Bitte versuche es erneut.');
        return;
    }

    console.log(`[Query] Karte geladen nach ${attempts * 150}ms`);

    // Get top regions
    const topRegions = mapHandler.getTopRegions(count);

    if (topRegions.length === 0) {
        if (mainApp) {
            mainApp.style.display = 'none';
            mainApp.style.visibility = '';
            mainApp.style.position = '';
            mainApp.style.left = '';
        }
        showTopRegionsResponse(null, count, 'Keine Regionsdaten verfügbar.');
        return;
    }

    // Select the top regions on the map BEFORE showing
    const regionNames = topRegions.map(r => r.name);
    mapHandler.selectMultipleCounties(regionNames);

    // Small delay to ensure selection is rendered
    await new Promise(resolve => setTimeout(resolve, 100));

    // NOW show the dashboard (everything is ready)
    if (landingPage) landingPage.style.display = 'none';
    if (mainApp) {
        mainApp.style.visibility = '';
        mainApp.style.position = '';
        mainApp.style.left = '';
    }

    // Dispatch event for page tracker
    document.dispatchEvent(new CustomEvent('viewChanged', {
        detail: { module: 'versicherung', view: 'dashboard' }
    }));

    // Show the interactive response in dashboard chat
    showTopRegionsResponse(topRegions, count);
}

// ========================================
// SPECIAL QUERY HANDLER: Single Region
// ========================================

// Mapping of city names to their Regierungsbezirke
const CITY_TO_REGION_MAP = {
    // Bayern
    'münchen': 'Oberbayern',
    'munich': 'Oberbayern',
    'augsburg': 'Schwaben',
    'nürnberg': 'Mittelfranken',
    'nuremberg': 'Mittelfranken',
    'würzburg': 'Unterfranken',
    'regensburg': 'Oberpfalz',
    'bayreuth': 'Oberfranken',
    'passau': 'Niederbayern',
    'ingolstadt': 'Oberbayern',
    // Baden-Württemberg
    'stuttgart': 'Stuttgart',
    'karlsruhe': 'Karlsruhe',
    'freiburg': 'Freiburg',
    'heidelberg': 'Karlsruhe',
    'mannheim': 'Karlsruhe',
    'ulm': 'Tübingen',
    'reutlingen': 'Tübingen',
    // NRW
    'düsseldorf': 'Düsseldorf',
    'dusseldorf': 'Düsseldorf',
    'köln': 'Köln',
    'koln': 'Köln',
    'cologne': 'Köln',
    'bonn': 'Köln',
    'essen': 'Düsseldorf',
    'dortmund': 'Arnsberg',
    'bielefeld': 'Detmold',
    'münster': 'Munster',
    'aachen': 'Köln',
    'wuppertal': 'Düsseldorf',
    'duisburg': 'Düsseldorf',
    // Niedersachsen
    'hannover': 'Hannover',
    'braunschweig': 'Braunschweig',
    'osnabrück': 'Weser-Ems',
    'oldenburg': 'Weser-Ems',
    'göttingen': 'Braunschweig',
    'wolfsburg': 'Braunschweig',
    // Hessen
    'frankfurt': 'Darmstadt',
    'wiesbaden': 'Darmstadt',
    'kassel': 'Kassel',
    'darmstadt': 'Darmstadt',
    'gießen': 'Gießen',
    'marburg': 'Gießen',
    // Sachsen
    'dresden': 'Dresden',
    'leipzig': 'Leipzig',
    'chemnitz': 'Chemnitz',
    // Sachsen-Anhalt
    'magdeburg': 'Magdeburg',
    'halle': 'Halle',
    'dessau': 'Dessau',
    // Rheinland-Pfalz
    'mainz': 'Rheinhessen-Pfalz',
    'koblenz': 'Koblenz',
    'trier': 'Trier',
    'ludwigshafen': 'Rheinhessen-Pfalz',
    // Stadtstaaten & Flächenländer ohne Bezirke
    'berlin': 'Berlin',
    'hamburg': 'Hamburg',
    'bremen': 'Bremen',
    'saarbrücken': 'Saarland',
    'kiel': 'Schleswig-Holstein',
    'lübeck': 'Schleswig-Holstein',
    'rostock': 'Mecklenburg-Vorpommern',
    'schwerin': 'Mecklenburg-Vorpommern',
    'erfurt': 'Thüringen',
    'jena': 'Thüringen',
    'potsdam': 'Brandenburg',
    'cottbus': 'Brandenburg'
};

/**
 * Handle single region query (e.g. "Vertriebszahlen aus Düsseldorf")
 * - Navigate to Dashboard (A-03)
 * - Select the region on the map
 * - Show region data in chat
 */
async function handleSingleRegionQuery(regionName) {
    console.log(`[Query] Einzelregion "${regionName}" gestartet...`);

    // Check if city name maps to a Regierungsbezirk
    const lowerName = regionName.toLowerCase().trim();
    const mappedRegion = CITY_TO_REGION_MAP[lowerName];
    const searchRegion = mappedRegion || regionName;
    const displayName = mappedRegion ? `${regionName} (${mappedRegion})` : regionName;

    console.log(`[Query] Suche nach: ${searchRegion} (Original: ${regionName})`);

    // Check if data is available
    const rawData = window.dailyRawData || (typeof dailyRawData !== 'undefined' ? dailyRawData : null);
    if (!rawData || rawData.length === 0) {
        showSingleRegionResponse(null, regionName, 'Keine Daten verfügbar. Bitte lade zuerst eine CSV-Datei hoch.');
        return;
    }

    // Show loading indicator on landing page
    const responseContainer = document.getElementById('landingChatResponse');
    if (responseContainer) {
        responseContainer.style.display = 'block';
        responseContainer.innerHTML = `
            <div class="landing-response-card" style="text-align: center; padding: 24px;">
                <div style="margin-bottom: 12px;">
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#0ea5e9" stroke-width="2" style="animation: spin 1s linear infinite;">
                        <path d="M21 12a9 9 0 11-6.219-8.56"/>
                    </svg>
                </div>
                <div style="font-weight: 600; color: #1e293b;">Lade Dashboard und Karte...</div>
                <div style="font-size: 12px; color: #64748b; margin-top: 4px;">Suche nach ${regionName}</div>
            </div>
            <style>
                @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
            </style>
        `;
    }

    // Initialize dashboard in background (hidden)
    const landingPage = document.getElementById('landingPage');
    const mainApp = document.getElementById('mainApp');

    if (mainApp) {
        mainApp.style.display = 'block';
        mainApp.style.visibility = 'hidden';
        mainApp.style.position = 'absolute';
        mainApp.style.left = '-9999px';
    }

    // Trigger dashboard initialization
    if (typeof waitForLibraries === 'function') {
        waitForLibraries(function() {
            if (typeof initKPIGrid === 'function') initKPIGrid();
            if (typeof updateAllKPIs === 'function') updateAllKPIs();
            if (typeof initMap === 'function') initMap();
        });
    }

    // Wait for map to fully initialize with polling
    let mapHandler = null;
    let attempts = 0;
    const maxAttempts = 40;

    while (!mapHandler && attempts < maxAttempts) {
        await new Promise(resolve => setTimeout(resolve, 150));
        mapHandler = window.countyMapHandler;
        attempts++;

        if (mapHandler && mapHandler.counties && mapHandler.counties.size > 0) {
            const hasData = Array.from(mapHandler.counties.values()).some(c => c.value > 0);
            if (!hasData) {
                mapHandler = null;
            }
        } else {
            mapHandler = null;
        }
    }

    if (!mapHandler) {
        console.error('[Query] Map handler nicht gefunden nach Timeout');
        if (mainApp) {
            mainApp.style.display = 'none';
            mainApp.style.visibility = '';
            mainApp.style.position = '';
            mainApp.style.left = '';
        }
        showSingleRegionResponse(null, regionName, 'Karte konnte nicht geladen werden. Bitte versuche es erneut.');
        return;
    }

    console.log(`[Query] Karte geladen nach ${attempts * 150}ms`);

    // Find the region on the map (use searchRegion which may be mapped from city name)
    const foundRegion = mapHandler.findCountyByName(searchRegion);

    if (!foundRegion) {
        if (mainApp) {
            mainApp.style.display = 'none';
            mainApp.style.visibility = '';
            mainApp.style.position = '';
            mainApp.style.left = '';
        }
        const hint = mappedRegion
            ? `Stadt "${regionName}" wurde der Region "${mappedRegion}" zugeordnet, aber diese wurde nicht gefunden.`
            : `Region "${regionName}" wurde nicht gefunden. Verfügbare Regionen sind z.B. Düsseldorf, Köln, Oberbayern (München), Berlin, Hamburg...`;
        showSingleRegionResponse(null, displayName, hint);
        return;
    }

    // Get region data
    const county = mapHandler.counties.get(foundRegion);
    const regionData = {
        name: foundRegion,
        value: county ? county.value : 0,
        state: county ? county.state : '',
        originalQuery: regionName,
        mappedFrom: mappedRegion ? regionName : null
    };

    // Select the region on the map
    mapHandler.selectMultipleCounties([foundRegion]);

    // Small delay to ensure selection is rendered
    await new Promise(resolve => setTimeout(resolve, 100));

    // NOW show the dashboard
    if (landingPage) landingPage.style.display = 'none';
    if (mainApp) {
        mainApp.style.visibility = '';
        mainApp.style.position = '';
        mainApp.style.left = '';
    }

    // Dispatch event for page tracker
    document.dispatchEvent(new CustomEvent('viewChanged', {
        detail: { module: 'versicherung', view: 'dashboard' }
    }));

    // Show the response in dashboard chat
    showSingleRegionResponse(regionData, displayName);
}

/**
 * Show single region response in dashboard chat
 */
function showSingleRegionResponse(regionData, regionName, errorMessage = null) {
    const mainApp = document.getElementById('mainApp');
    const isInDashboard = mainApp && mainApp.style.display !== 'none';

    const formatCurrency = (value) => {
        if (value >= 1000000) return `€${(value / 1000000).toFixed(2)} Mio`;
        if (value >= 1000) return `€${(value / 1000).toFixed(0)}k`;
        return `€${value.toFixed(0)}`;
    };

    if (isInDashboard) {
        // Use dashboard chat
        const chatWidget = document.getElementById('chatWidget');
        const chatToggle = document.getElementById('chatToggle');
        const chatBody = document.getElementById('chatBody');

        if (chatWidget) {
            chatWidget.style.display = 'flex';
            chatWidget.classList.remove('minimized');
        }
        if (chatToggle) chatToggle.style.display = 'none';
        if (!chatBody) return;

        const welcome = chatBody.querySelector('.chat-welcome');
        if (welcome) welcome.remove();

        const messageDiv = document.createElement('div');
        messageDiv.className = 'chat-message assistant';

        const avatar = document.createElement('div');
        avatar.className = 'chat-avatar';
        avatar.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20"><circle cx="12" cy="12" r="10"></circle><path d="M12 16v-4M12 8h.01"></path></svg>';

        const bubble = document.createElement('div');
        bubble.className = 'chat-bubble';

        if (errorMessage) {
            bubble.innerHTML = `<strong>Fehler</strong><br><br>${errorMessage}`;
        } else {
            // Show mapping info if city was mapped to region
            const mappingInfo = regionData.mappedFrom
                ? `<em style="color: #64748b; font-size: 12px;">(${regionData.mappedFrom} → Region ${regionData.name})</em><br><br>`
                : '';

            bubble.innerHTML = `
                <strong>Vertriebsdaten für ${regionData.name}:</strong><br>
                ${mappingInfo}
                <strong>Neugeschäft:</strong> ${formatCurrency(regionData.value)}<br>
                <strong>Bundesland:</strong> ${regionData.state}<br><br>
                → <em>Die Region ist auf der Karte markiert.</em>

                <div class="chat-followup-suggestions" style="margin-top: 12px;">
                    <button onclick="showTopVermittlerInRegions()">Top 5 Vermittler</button>
                    <button onclick="askSampleQuestion('Welche Vermittler haben ungewöhnliche Werte?')">Auffällige Vermittler</button>
                </div>
            `;
        }

        messageDiv.appendChild(avatar);
        messageDiv.appendChild(bubble);
        chatBody.appendChild(messageDiv);
        chatBody.scrollTop = chatBody.scrollHeight;

        // Store region for later
        window._currentRegionData = regionData;
    } else {
        // Use landing page response
        const responseContainer = document.getElementById('landingChatResponse');
        if (!responseContainer) return;

        responseContainer.style.display = 'block';
        if (errorMessage) {
            responseContainer.innerHTML = `
                <div class="landing-response-card">
                    <div class="landing-response-header">
                        <div class="chat-avatar-deloitte"><span class="deloitte-d">D</span></div>
                        <span class="landing-response-title">Fehler</span>
                    </div>
                    <div class="landing-response-content">⚠️ ${errorMessage}</div>
                </div>
            `;
        }
    }
}

/**
 * Show the top regions response with export buttons and action button
 * Uses the dashboard chat (A-03) when in dashboard view
 */
function showTopRegionsResponse(regions, count, errorMessage = null) {
    // Check if we're in dashboard view
    const mainApp = document.getElementById('mainApp');
    const isInDashboard = mainApp && mainApp.style.display !== 'none';

    if (isInDashboard) {
        // Use the dashboard chat widget
        showTopRegionsInDashboardChat(regions, count, errorMessage);
        return;
    }

    // Otherwise use the landing page response container
    const responseContainer = document.getElementById('landingChatResponse');
    if (!responseContainer) return;

    responseContainer.style.display = 'block';

    if (errorMessage) {
        responseContainer.innerHTML = `
            <div class="landing-response-card">
                <div class="landing-response-header">
                    <div class="chat-avatar-deloitte"><span class="deloitte-d">D</span></div>
                    <span class="landing-response-title">Fehler</span>
                </div>
                <div class="landing-response-content">
                    ⚠️ ${errorMessage}
                </div>
            </div>
        `;
        return;
    }

    // Format currency
    const formatCurrency = (value) => {
        if (value >= 1000000) {
            return `€${(value / 1000000).toFixed(2)} Mio`;
        } else if (value >= 1000) {
            return `€${(value / 1000).toFixed(0)}k`;
        }
        return `€${value.toFixed(0)}`;
    };

    // Build regions list
    const regionsList = regions.map((r, i) => `
        <div class="top-region-item" style="display: flex; justify-content: space-between; align-items: center; padding: 8px 12px; background: ${i < 3 ? '#f0fdf4' : '#f8fafc'}; border-radius: 8px; margin-bottom: 6px; border-left: 4px solid ${i === 0 ? '#22c55e' : i === 1 ? '#86efac' : i === 2 ? '#bbf7d0' : '#e2e8f0'};">
            <div style="display: flex; align-items: center; gap: 10px;">
                <span style="font-weight: 700; color: ${i < 3 ? '#166534' : '#64748b'}; min-width: 24px;">#${i + 1}</span>
                <div>
                    <div style="font-weight: 600; color: #1e293b;">${r.name}</div>
                    <div style="font-size: 11px; color: #64748b;">${r.state}</div>
                </div>
            </div>
            <div style="text-align: right;">
                <div style="font-weight: 700; color: #0ea5e9;">${formatCurrency(r.value)}</div>
                <div style="font-size: 10px; color: #94a3b8;">Neugeschäft</div>
            </div>
        </div>
    `).join('');

    // Calculate total
    const total = regions.reduce((sum, r) => sum + r.value, 0);

    responseContainer.innerHTML = `
        <div class="landing-response-card" style="max-width: 500px; position: relative;">
            <div class="landing-response-header">
                <div class="chat-avatar-deloitte"><span class="deloitte-d">D</span></div>
                <span class="landing-response-title">Top ${count} Vertriebsregionen</span>
            </div>

            <div class="landing-response-content" style="padding: 0;">
                <!-- Regions List -->
                <div style="padding: 16px;">
                    ${regionsList}

                    <!-- Total -->
                    <div style="margin-top: 12px; padding: 12px; background: linear-gradient(135deg, #0ea5e9 0%, #3b82f6 100%); border-radius: 10px; color: white;">
                        <div style="display: flex; justify-content: space-between; align-items: center;">
                            <span style="font-weight: 500;">Gesamt Top ${count}</span>
                            <span style="font-weight: 700; font-size: 18px;">${formatCurrency(total)}</span>
                        </div>
                    </div>
                </div>

                <!-- Info Text -->
                <div style="padding: 0 16px 12px; font-size: 13px; color: #64748b;">
                    📍 Die Regionen sind auf der Karte markiert. Du kannst die Ergebnisse exportieren oder weitere Analysen durchführen.
                </div>

                <!-- Export Buttons -->
                <div style="padding: 12px 16px; background: #f8fafc; border-top: 1px solid #e2e8f0;">
                    <div style="font-size: 12px; color: #64748b; margin-bottom: 8px;">📥 Ergebnisse exportieren:</div>
                    <div style="display: flex; gap: 8px; flex-wrap: wrap;">
                        <button onclick="exportTopRegionsPDF()" class="export-btn" style="display: flex; align-items: center; gap: 6px; padding: 8px 14px; background: #dc2626; color: white; border: none; border-radius: 6px; font-size: 13px; font-weight: 500; cursor: pointer; transition: all 0.2s;">
                            <span>📄</span> PDF Export
                        </button>
                        <button onclick="exportTopRegionsExcel()" class="export-btn" style="display: flex; align-items: center; gap: 6px; padding: 8px 14px; background: #16a34a; color: white; border: none; border-radius: 6px; font-size: 13px; font-weight: 500; cursor: pointer; transition: all 0.2s;">
                            <span>📊</span> Excel Export
                        </button>
                    </div>
                </div>

                <!-- Action Button: Top Vermittler -->
                <div style="padding: 12px 16px; border-top: 1px solid #e2e8f0;">
                    <div style="font-size: 12px; color: #64748b; margin-bottom: 8px;">Weitere Analyse:</div>
                    <button onclick="showTopVermittlerInRegions()" class="action-btn" style="width: 100%; display: flex; align-items: center; justify-content: center; gap: 8px; padding: 12px 16px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border: none; border-radius: 8px; font-size: 14px; font-weight: 600; cursor: pointer; transition: all 0.2s; box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                        Top 5 Vermittler anzeigen
                    </button>
                </div>
            </div>
        </div>
    `;

    // Store regions for export functions
    window._topRegionsData = regions;
}

/**
 * Show top regions in the dashboard chat widget (A-03)
 */
function showTopRegionsInDashboardChat(regions, count, errorMessage = null) {
    // Open and show the chat widget
    const chatWidget = document.getElementById('chatWidget');
    const chatToggle = document.getElementById('chatToggle');
    const chatBody = document.getElementById('chatBody');

    if (chatWidget) {
        chatWidget.style.display = 'flex';
        chatWidget.classList.remove('minimized');
    }
    if (chatToggle) {
        chatToggle.style.display = 'none';
    }

    if (!chatBody) {
        console.error('Chat Body nicht gefunden');
        return;
    }

    // Remove welcome message if exists
    const welcome = chatBody.querySelector('.chat-welcome');
    if (welcome) welcome.remove();

    // Create message div
    const messageDiv = document.createElement('div');
    messageDiv.className = 'chat-message assistant';

    const avatar = document.createElement('div');
    avatar.className = 'chat-avatar';
    avatar.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20"><circle cx="12" cy="12" r="10"></circle><path d="M12 16v-4M12 8h.01"></path></svg>';

    const bubble = document.createElement('div');
    bubble.className = 'chat-bubble';

    if (errorMessage) {
        bubble.innerHTML = `<strong style="color: #dc2626;">Fehler</strong><br><br>${errorMessage}`;
        messageDiv.appendChild(avatar);
        messageDiv.appendChild(bubble);
        chatBody.appendChild(messageDiv);
        chatBody.scrollTop = chatBody.scrollHeight;
        return;
    }

    // Format currency
    const formatCurrency = (value) => {
        if (value >= 1000000) return `€${(value / 1000000).toFixed(2)} Mio`;
        if (value >= 1000) return `€${(value / 1000).toFixed(0)}k`;
        return `€${value.toFixed(0)}`;
    };

    // Simple text-based list matching original chat style
    const regionsList = regions.map((r, i) =>
        `<strong>${i + 1}. ${r.name}</strong> (${r.state}) — ${formatCurrency(r.value)}`
    ).join('<br>');

    const total = regions.reduce((sum, r) => sum + r.value, 0);

    bubble.innerHTML = `
        <strong>Top ${count} Vertriebsregionen:</strong><br><br>
        ${regionsList}
        <br><br>
        <em>Gesamt: ${formatCurrency(total)}</em>
        <br><br>
        → <em>Die Regionen sind auf der Karte markiert.</em>

        <div class="chat-followup-suggestions" style="margin-top: 12px;">
            <button onclick="showTopVermittlerInRegions()">Top 5 Vermittler</button>
            <button onclick="askSampleQuestion('Welche Vermittler haben ungewöhnliche Werte?')">Auffällige Vermittler</button>
            <button onclick="exportTopRegionsPDF()">PDF Export</button>
            <button onclick="exportTopRegionsExcel()">Excel Export</button>
        </div>
    `;

    messageDiv.appendChild(avatar);
    messageDiv.appendChild(bubble);
    chatBody.appendChild(messageDiv);
    chatBody.scrollTop = chatBody.scrollHeight;

    // Store regions for export functions
    window._topRegionsData = regions;
}

/**
 * Export top regions as PDF
 */
function exportTopRegionsPDF() {
    const regions = window._topRegionsData;
    if (!regions) {
        alert('Keine Daten zum Exportieren verfügbar.');
        return;
    }

    // Simple PDF export using browser print
    const formatCurrency = (value) => {
        if (value >= 1000000) return `€${(value / 1000000).toFixed(2)} Mio`;
        if (value >= 1000) return `€${(value / 1000).toFixed(0)}k`;
        return `€${value.toFixed(0)}`;
    };

    const total = regions.reduce((sum, r) => sum + r.value, 0);
    const date = new Date().toLocaleDateString('de-DE');

    const content = `
        <html>
        <head>
            <title>Top Vertriebsregionen - ${date}</title>
            <style>
                body { font-family: Arial, sans-serif; padding: 40px; }
                h1 { color: #1e293b; border-bottom: 3px solid #0ea5e9; padding-bottom: 10px; }
                .region { display: flex; justify-content: space-between; padding: 12px; border-bottom: 1px solid #e2e8f0; }
                .region:nth-child(odd) { background: #f8fafc; }
                .rank { font-weight: bold; color: #0ea5e9; width: 40px; }
                .name { flex: 1; }
                .state { color: #64748b; font-size: 12px; }
                .value { font-weight: bold; color: #16a34a; }
                .total { margin-top: 20px; padding: 16px; background: #0ea5e9; color: white; border-radius: 8px; display: flex; justify-content: space-between; }
                .footer { margin-top: 40px; color: #94a3b8; font-size: 12px; }
            </style>
        </head>
        <body>
            <h1>📊 Top ${regions.length} Vertriebsregionen</h1>
            <p>Exportiert am ${date}</p>
            ${regions.map((r, i) => `
                <div class="region">
                    <span class="rank">#${i + 1}</span>
                    <div class="name">${r.name}<br><span class="state">${r.state}</span></div>
                    <span class="value">${formatCurrency(r.value)}</span>
                </div>
            `).join('')}
            <div class="total">
                <span>Gesamt</span>
                <span>${formatCurrency(total)}</span>
            </div>
            <div class="footer">
                Generiert vom Vertriebssteuerungs-Dashboard
            </div>
        </body>
        </html>
    `;

    const printWindow = window.open('', '_blank');
    printWindow.document.write(content);
    printWindow.document.close();
    printWindow.print();
}

/**
 * Export top regions as Excel (CSV)
 */
function exportTopRegionsExcel() {
    const regions = window._topRegionsData;
    if (!regions) {
        alert('Keine Daten zum Exportieren verfügbar.');
        return;
    }

    // Create CSV content
    const headers = ['Rang', 'Region', 'Bundesland', 'Neugeschäft (EUR)'];
    const rows = regions.map((r, i) => [i + 1, r.name, r.state, r.value.toFixed(2)]);

    // Add total row
    const total = regions.reduce((sum, r) => sum + r.value, 0);
    rows.push(['', 'GESAMT', '', total.toFixed(2)]);

    // Convert to CSV
    const csvContent = [headers, ...rows]
        .map(row => row.map(cell => `"${cell}"`).join(';'))
        .join('\n');

    // Add BOM for Excel UTF-8 compatibility
    const BOM = '\uFEFF';
    const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });

    // Download
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `Top_Vertriebsregionen_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
}

/**
 * Show top 5 Vermittler overall (switches to table view)
 * Note: Shows best Vermittler across all regions, not filtered by selected regions
 */
function showTopVermittlerInRegions() {
    console.log('Zeige Top 5 Vermittler (gesamt)...');

    const rawData = window.dailyRawData || dailyRawData;

    if (!rawData || rawData.length === 0) {
        alert('Keine Daten verfügbar.');
        return;
    }

    // Get current year filter
    const currentYear = window.state?.filters?.year || new Date().getFullYear();

    // Filter by year only (no region filter - show overall top Vermittler)
    const filteredData = rawData.filter(row => row.year == currentYear);

    // Aggregate by Vermittler
    const vermittlerMap = new Map();
    filteredData.forEach(row => {
        const id = row.vermittler_id;
        if (!id) return;

        if (!vermittlerMap.has(id)) {
            vermittlerMap.set(id, {
                id: id,
                name: row.vermittler_name || row.agentur_name || id,
                neugeschaeft: 0,
                count: 0
            });
        }
        const v = vermittlerMap.get(id);
        v.neugeschaeft += parseFloat(row.neugeschaeft) || 0;
        v.count++;
    });

    // Sort by Neugeschäft and get top 5
    const topVermittler = Array.from(vermittlerMap.values())
        .sort((a, b) => b.neugeschaeft - a.neugeschaeft)
        .slice(0, 5);

    // Get the IDs of the top 5 Vermittler
    const top5Ids = topVermittler.map(v => v.id);
    console.log('Top 5 Vermittler IDs:', top5Ids);

    // Switch to table view with Agenturen data
    const dashboardView = document.getElementById('dashboardView');
    const tableView = document.getElementById('tableView');

    if (dashboardView) dashboardView.style.display = 'none';
    if (tableView) tableView.style.display = 'block';

    // Set filters to show only top 5 Vermittler
    if (window.state) {
        window.state.currentView = 'table';
        window.state.currentTableView = 'agentur'; // Show Agenturen tab
        window.state.selectedCounties = new Set(); // Clear region filter
        window.state.selectedAgenturen = new Set(top5Ids); // Filter to top 5 Vermittler
    }

    // Also clear map selection visually
    const mapHandler = window.countyMapHandler;
    if (mapHandler) {
        mapHandler.clearSelection();
    }

    // Activate the Agenturen tab button
    const tableViewBtns = document.querySelectorAll('.table-view-btn');
    tableViewBtns.forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.tableView === 'agentur') {
            btn.classList.add('active');
        }
    });

    // Render the table (filtered to top 5 Vermittler)
    if (typeof renderTable === 'function') {
        renderTable();
    }

    // Update the response to show Vermittler data
    showTopVermittlerResponse(topVermittler, []);
}

/**
 * Show top Vermittler response - uses dashboard chat when in dashboard
 * Simple text-based style matching original chat format
 */
function showTopVermittlerResponse(vermittler, regions) {
    const mainApp = document.getElementById('mainApp');
    const isInDashboard = mainApp && mainApp.style.display !== 'none';

    const formatCurrency = (value) => {
        if (value >= 1000000) return `€${(value / 1000000).toFixed(2)} Mio`;
        if (value >= 1000) return `€${(value / 1000).toFixed(0)}k`;
        return `€${value.toFixed(0)}`;
    };

    // Simple text list matching original chat style
    const vermittlerList = vermittler.map((v, i) =>
        `<strong>${i + 1}. ${v.name}</strong> — ${formatCurrency(v.neugeschaeft)}`
    ).join('<br>');

    if (isInDashboard) {
        // Use dashboard chat
        const chatBody = document.getElementById('chatBody');
        if (!chatBody) return;

        const messageDiv = document.createElement('div');
        messageDiv.className = 'chat-message assistant';

        const avatar = document.createElement('div');
        avatar.className = 'chat-avatar';
        avatar.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20"><circle cx="12" cy="12" r="10"></circle><path d="M12 16v-4M12 8h.01"></path></svg>';

        const bubble = document.createElement('div');
        bubble.className = 'chat-bubble';

        bubble.innerHTML = `
            <strong>Top 5 Vermittler nach Neugeschäft:</strong><br><br>
            ${vermittlerList}
            <br><br>
            → <em>Die Tabelle zeigt jetzt die Top 5 Vermittler.</em>

            <div class="chat-followup-suggestions" style="margin-top: 12px;">
                <button onclick="askSampleQuestion('Welche Vermittler haben ungewöhnliche Werte?')">Auffällige Vermittler</button>
                <button onclick="backToRegionsView()">Zurück zur Karte</button>
            </div>
        `;

        messageDiv.appendChild(avatar);
        messageDiv.appendChild(bubble);
        chatBody.appendChild(messageDiv);
        chatBody.scrollTop = chatBody.scrollHeight;
    } else {
        // Use landing page response container - simple style
        const responseContainer = document.getElementById('landingChatResponse');
        if (!responseContainer) return;

        responseContainer.innerHTML = `
            <div class="landing-response-card" style="max-width: 500px;">
                <div class="landing-response-header">
                    <div class="chat-avatar-deloitte"><span class="deloitte-d">D</span></div>
                    <span class="landing-response-title">Top 5 Vermittler</span>
                </div>

                <div class="landing-response-content" style="padding: 16px;">
                    <strong>Top 5 Vermittler nach Neugeschäft:</strong><br><br>
                    ${vermittlerList}
                    <br><br>
                    → <em>Die Tabelle zeigt jetzt die Top 5 Vermittler.</em>

                    <div class="chat-followup-suggestions" style="margin-top: 12px;">
                        <button onclick="askSampleQuestion('Welche Vermittler haben ungewöhnliche Werte?')">Auffällige Vermittler</button>
                        <button onclick="backToRegionsView()">Zurück zur Karte</button>
                    </div>
                </div>
            </div>
        `;
    }
}

/**
 * Switch back to dashboard view from table view
 */
function backToRegionsView() {
    const dashboardView = document.getElementById('dashboardView');
    const tableView = document.getElementById('tableView');

    if (dashboardView) dashboardView.style.display = 'flex';
    if (tableView) tableView.style.display = 'none';

    if (window.state) window.state.currentView = 'dashboard';

    // Restore the regions response
    if (window._topRegionsData) {
        showTopRegionsResponse(window._topRegionsData, window._topRegionsData.length);
    }
}

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
        localStorage.setItem('userName', newName);

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
    const savedName = localStorage.getItem('userName');
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

    if (!rawData || rawData.length === 0) {
        // Keine Daten - zeige Hinweis
        addLandingChatMessage('assistant', '⚠️ **Bitte lade zuerst Daten hoch.**\n\nUm die Agenturansicht zu nutzen, benötigst du CSV-Daten mit Vermittler-Informationen.\n\nKlicke auf "Settings" und dann auf "CSV Upload" oder "Test-Daten generieren".');
        return;
    }

    // Daten vorhanden - zeige erste Agentur oder lass User wählen
    const agenturen = typeof getAgenturen === 'function' ? getAgenturen() : [];

    if (agenturen.length > 0) {
        // Zeige erste Agentur
        const firstAgentur = agenturen[0];
        if (typeof showAgenturOverview === 'function') {
            showAgenturOverview(firstAgentur.id);
        } else {
            // Fallback: Öffne Dashboard mit Agentur-Filter
            setAgenturFilter(firstAgentur.id);
            openDashboard();
        }
    } else {
        addLandingChatMessage('assistant', '⚠️ Keine Agenturen in den Daten gefunden. Bitte überprüfe deine CSV-Datei.');
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

    // Benutzername aus localStorage laden
    loadUserName();

    // Navigation initial deaktivieren bis Daten geladen
    setNavigationEnabled(false);

    // Auto-load CSV Mock-Daten beim Start (mit Callback wenn fertig)
    loadDefaultCSVData().then(() => {
        // Daten geladen - Navigation aktivieren
        setNavigationEnabled(true);

        // Loading Animation ausblenden und Welcome Chat zeigen
        const loadingAnim = document.getElementById('loadingAnimation');
        const welcomeChat = document.getElementById('welcomeChat');

        if (loadingAnim) loadingAnim.style.display = 'none';
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

    // Hide CV Scanner if visible
    const cvModule = document.getElementById('cvScannerModule');
    if (cvModule) {
        cvModule.style.display = 'none';
    }

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

// ========================================
// AUTO-LOAD CSV MOCK DATA
// ========================================

/**
 * Lädt automatisch die Standard-CSV-Daten beim Start
 */
async function loadDefaultCSVData() {
    console.log('Lade Standard-CSV-Daten...');

    // Start loading animation
    updateMainLoadingProgress(10, 'Initialisiere Anwendung...');
    await sleep(200);

    updateMainLoadingProgress(25, 'Lade Ressourcen...');
    await sleep(300);

    // Lokale CSV-Datei (im data-Ordner)
    const localCsvPath = 'data/mock-data.csv';

    try {
        updateMainLoadingProgress(40, 'Lade Kundendaten...');
        const response = await fetch(localCsvPath);

        if (!response.ok) {
            throw new Error('Lokale CSV nicht gefunden');
        }

        updateMainLoadingProgress(60, 'Verarbeite Datensätze...');
        await sleep(200);
        const csvText = await response.text();

        updateMainLoadingProgress(75, 'Analysiere Daten...');
        await sleep(200);
        processCSVData(csvText);

        updateMainLoadingProgress(80, 'Lade Feedback-Kommentare...');
        await loadFeedbackData();

        updateMainLoadingProgress(95, 'Erstelle Dashboard...');
        await sleep(300);

        updateMainLoadingProgress(100, 'Fertig!');
        await sleep(400);

        console.log('Alle Daten geladen');

    } catch (error) {
        console.warn('Fehler beim Laden der CSV-Daten:', error);
        console.log('Generiere Fallback-Demo-Daten...');

        updateMainLoadingProgress(50, 'Generiere Demo-Daten...');
        await sleep(200);

        const fallbackCSV = generateFallbackDemoCSV();
        updateMainLoadingProgress(75, 'Verarbeite Demo-Daten...');
        await sleep(200);
        processCSVData(fallbackCSV);

        updateMainLoadingProgress(90, 'Lade Feedback-Kommentare...');
        await loadFeedbackData();
        updateMainLoadingProgress(100, 'Fertig!');
        await sleep(400);
        console.log('Fallback-Demo-Daten geladen');
    }
}

/**
 * Generiert Demo-CSV-Daten als Fallback wenn der Fetch fehlschlaegt
 * (z.B. bei file:// Protokoll oder fehlender Netzwerkverbindung)
 */
function generateFallbackDemoCSV() {
    const silos = ['Ausschließlichkeit', 'Makler', 'Banken', 'Direktvertrieb'];
    const segments = ['Leben', 'Kranken', 'Schaden', 'Kfz'];
    const products = {
        'Leben': ['Risikoleben', 'Kapitallebensversicherung', 'Berufsunfähigkeit', 'Rentenversicherung', 'Fondsgebundene LV'],
        'Kranken': ['Vollversicherung', 'Zahnzusatz', 'Zusatzversicherung', 'Pflegeversicherung', 'Auslandsreise'],
        'Schaden': ['Haftpflicht', 'Hausrat', 'Wohngebäude', 'Rechtsschutz', 'Gewerbe'],
        'Kfz': ['Kfz-Haftpflicht', 'Vollkasko', 'Teilkasko', 'Schutzbrief', 'Flottenversicherung']
    };
    const bundeslaender = [
        {name: 'Bayern', kreise: ['Oberbayern', 'Niederbayern', 'Oberpfalz', 'Oberfranken', 'Mittelfranken', 'Unterfranken', 'Schwaben']},
        {name: 'Nordrhein-Westfalen', kreise: ['Düsseldorf', 'Köln', 'Munster', 'Detmold', 'Arnsberg']},
        {name: 'Baden-Württemberg', kreise: ['Stuttgart', 'Karlsruhe', 'Freiburg', 'Tübingen']},
        {name: 'Hessen', kreise: ['Darmstadt', 'Gießen', 'Kassel']},
        {name: 'Niedersachsen', kreise: ['Hannover', 'Braunschweig', 'Luneburg', 'Weser-Ems']},
        {name: 'Sachsen', kreise: ['Dresden', 'Leipzig', 'Chemnitz']},
        {name: 'Berlin', kreise: ['Berlin']},
        {name: 'Hamburg', kreise: ['Hamburg']},
        {name: 'Rheinland-Pfalz', kreise: ['Koblenz', 'Trier', 'Rheinhessen-Pfalz']},
        {name: 'Schleswig-Holstein', kreise: ['Schleswig-Holstein']},
        {name: 'Brandenburg', kreise: ['Brandenburg']},
        {name: 'Thüringen', kreise: ['Thüringen']},
        {name: 'Sachsen-Anhalt', kreise: ['Halle', 'Dessau', 'Magdeburg']},
        {name: 'Mecklenburg-Vorpommern', kreise: ['Mecklenburg-Vorpommern']},
        {name: 'Saarland', kreise: ['Saarland']},
        {name: 'Bremen', kreise: ['Bremen']}
    ];

    const namen = [
        'Max Mustermann', 'Emma Ludwig', 'Thomas Schneider', 'Anna Fischer',
        'Michael Weber', 'Sophie Wagner', 'Andreas Becker', 'Laura Hoffmann',
        'Stefan Schulz', 'Marie Koch', 'Christian Werner', 'Julia Braun',
        'Markus Lehmann', 'Katharina Schmitt', 'Daniel Krüger', 'Lisa Hartmann',
        'Patrick Meier', 'Sabine Lange', 'Frank Richter', 'Claudia Wolf'
    ];

    const rand = (min, max) => (Math.random() * (max - min) + min);
    const pick = arr => arr[Math.floor(Math.random() * arr.length)];

    const header = 'year,month,day,vermittler_id,vermittler_name,silo,segment,product,bundesland,landkreis,neugeschaeft,bestand,storno,nps,risiko,combined,ergebnis,underwriting,deckungsbeitrag';
    const rows = [header];

    // 20 Vermittler, 24 Monate (2024-2025), 5 Tage pro Monat = 2400 Zeilen
    for (let v = 0; v < namen.length; v++) {
        const vmId = 'VM' + String(v + 1).padStart(5, '0');
        const vmName = namen[v];
        const vmSilo = silos[v % silos.length];
        const bl = bundeslaender[v % bundeslaender.length];
        const kreis = pick(bl.kreise);
        const performanceFactor = 0.5 + Math.random() * 1.5;

        for (let year = 2024; year <= 2025; year++) {
            for (let month = 1; month <= 12; month++) {
                const daysInMonth = new Date(year, month, 0).getDate();
                const sampleDays = [3, 8, 14, 20, 26].filter(d => d <= daysInMonth);

                for (const day of sampleDays) {
                    const seg = pick(segments);
                    const prod = pick(products[seg]);
                    const seasonal = 1 + 0.15 * Math.sin((month - 1) * Math.PI / 6);

                    const ng = rand(50, 5000) * performanceFactor * seasonal;
                    const bs = rand(1000000, 15000000) * performanceFactor;
                    const st = rand(0, 18);
                    const nps = rand(-5, 95);
                    const risk = rand(20, 80);
                    const comb = rand(65, 120);
                    const erg = rand(50, 2500) * performanceFactor;
                    const uw = rand(65, 100);
                    const db = rand(200, 12000) * performanceFactor;

                    rows.push(`${year},${month},${day},${vmId},"${vmName}",${vmSilo},${seg},${prod},${bl.name},"${kreis}",${ng.toFixed(2)},${bs.toFixed(2)},${st.toFixed(2)},${nps.toFixed(2)},${risk.toFixed(2)},${comb.toFixed(2)},${erg.toFixed(2)},${uw.toFixed(2)},${db.toFixed(2)}`);
                }
            }
        }
    }

    console.log('Fallback-Demo-Daten generiert:', rows.length - 1, 'Datensätze');
    return rows.join('\n');
}

/**
 * Lädt die Feedback-Kommentare
 */
async function loadFeedbackData() {
    const FEEDBACK_API_URL = 'https://vsteike-feedback.eike-3e2.workers.dev';
    try {
        const response = await fetch(`${FEEDBACK_API_URL}/feedback`);
        if (response.ok) {
            const result = await response.json();
            if (result.success && result.data) {
                window.preloadedFeedback = result.data;
                console.log(`${result.data.length} Feedback-Kommentare geladen`);
            }
        }
    } catch (error) {
        console.warn('Feedback konnte nicht vorgeladen werden:', error);
    }
}

// Helper function for delays
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Aktualisiert den Ladefortschritt (Balken + Text + Prozent)
 */
function updateMainLoadingProgress(percent, text) {
    const progressBar = document.getElementById('mainProgressBar');
    const statusText = document.getElementById('loadingStatus');
    const percentText = document.getElementById('loadingPercent');

    console.log(`Loading: ${percent}% - ${text}`);
    if (progressBar) progressBar.style.width = `${percent}%`;
    if (statusText) statusText.textContent = text;
    if (percentText) percentText.textContent = `${percent}%`;
}

// Legacy function for backwards compatibility
function updateLoadingText(text) {
    const statusText = document.getElementById('loadingStatus');
    if (statusText) {
        statusText.textContent = text;
    }
}

/**
 * Verarbeitet die CSV-Daten und speichert sie global
 */
function processCSVData(csvText) {
    try {
        const parsedData = parseCSV(csvText);

        if (parsedData && parsedData.length > 0) {
            // Speichere als globale Daten
            window.dailyRawData = parsedData;
            if (typeof dailyRawData !== 'undefined') {
                dailyRawData = parsedData;
            }

            // Aggregiere zu Monatsdaten für state.uploadedData
            if (typeof aggregateDailyToMonthly === 'function') {
                const monthlyData = aggregateDailyToMonthly(parsedData);
                state.uploadedData = monthlyData;
                state.useUploadedData = true;
            }

            console.log('CSV-Daten geladen:', parsedData.length, 'Datensätze');

            // Aktualisiere Filter-Dropdowns
            if (typeof updateAgenturFilterDropdown === 'function') {
                updateAgenturFilterDropdown();
            }

            // Aktualisiere KPIs und Charts
            if (typeof updateAllKPIs === 'function') {
                updateAllKPIs();
            }

            // Aktualisiere Karte falls vorhanden
            if (typeof countyMapHandler !== 'undefined' && countyMapHandler && typeof getFilteredData === 'function') {
                const data = getFilteredData();
                countyMapHandler.updateMapData(data);
            }

            // Optional: Update UI Status
            const statusEl = document.getElementById('quickUploadStatus');
            if (statusEl) {
                statusEl.innerHTML = '<span style="color: #16a34a;">✓ ' + parsedData.length + ' Datensätze geladen</span>';
            }
        }
    } catch (error) {
        console.error('Fehler beim Parsen der CSV:', error);
    }
}

// ========================================
// v14 FEATURE: KI Filter Commands + Auto-Navigation
// ========================================

// Parse KI-Antwort und führe Filter-Befehle aus
async function parseAndExecuteCommands(message) {
    console.log('Parse KI-Antwort nach Befehlen...');

    let hasExecutedCommands = false;

    // NEU: Check for Agentur Overview Command
    const overviewMatch = message.match(/showAgenturOverview\(['"]([^'"]+)['"]\)/);
    if (overviewMatch) {
        const vermittlerId = overviewMatch[1];
        console.log('Gefunden: showAgenturOverview für', vermittlerId);

        if (typeof showAgenturOverview === 'function') {
            showAgenturOverview(vermittlerId);
            return true; // Early return
        } else {
            console.error('showAgenturOverview Funktion nicht verfügbar!');
        }
    }

    // Regex patterns für Befehle
    const patterns = {
        setAgenturFilter: /setAgenturFilter\(['"]([^'"]+)['"]\)/gi,
        setSiloFilter: /setSiloFilter\(['"]([^'"]+)['"]\)/gi,
        setSegmentFilter: /setSegmentFilter\(\[([^\]]+)\]\)/gi,
        setBundeslandFilter: /setBundeslandFilter\(\[([^\]]+)\]\)/gi,
        clearAllFilters: /clearAllFilters\(\)/gi
    };

    // Agentur Filter
    let match;
    while ((match = patterns.setAgenturFilter.exec(message)) !== null) {
        const agenturId = match[1];
        console.log('Setze Agentur-Filter:', agenturId);
        setAgenturFilter(agenturId);
        hasExecutedCommands = true;
    }

    // Silo Filter
    patterns.setSiloFilter.lastIndex = 0;
    while ((match = patterns.setSiloFilter.exec(message)) !== null) {
        const silo = match[1];
        console.log('Setze Silo-Filter:', silo);
        setSiloFilter(silo);
        hasExecutedCommands = true;
    }

    // Segment Filter
    patterns.setSegmentFilter.lastIndex = 0;
    while ((match = patterns.setSegmentFilter.exec(message)) !== null) {
        const segmentsStr = match[1];
        const segments = segmentsStr.split(',').map(s => s.trim().replace(/['"]/g, ''));
        console.log('Setze Segment-Filter:', segments);
        setSegmentFilter(segments);
        hasExecutedCommands = true;
    }

    // Bundesland Filter
    patterns.setBundeslandFilter.lastIndex = 0;
    while ((match = patterns.setBundeslandFilter.exec(message)) !== null) {
        const laenderStr = match[1];
        const laender = laenderStr.split(',').map(s => s.trim().replace(/['"]/g, ''));
        console.log('Setze Bundesland-Filter:', laender);
        setBundeslandFilter(laender);
        hasExecutedCommands = true;
    }

    // Clear Filters
    if (patterns.clearAllFilters.test(message)) {
        console.log('Lösche alle Filter');
        clearAllFilters();
        hasExecutedCommands = true;
    }

    // Wenn Befehle ausgeführt wurden, navigiere zum Dashboard
    if (hasExecutedCommands) {
        console.log('Filter wurden gesetzt - navigiere zum Dashboard...');

        // Zeige Bestätigung
        addLandingChatMessage('system', '✅ Filter wurden angewendet. Öffne Dashboard...');

        // Warte kurz, dann navigiere
        setTimeout(() => {
            openDashboard();
        }, 1500);
    }
}

// Filter-Funktionen
function setAgenturFilter(vermittlerId) {
    console.log('setAgenturFilter:', vermittlerId);

    // WICHTIG: Erst alle anderen Filter zurücksetzen!
    if (typeof state !== 'undefined') {
        // Speichere aktuelles Jahr
        const currentYear = state.filters.year;

        // Setze alle Filter zurück (außer Jahr)
        state.filters = {
            year: currentYear,
            agentur: vermittlerId,  // Neuer Agentur-Filter
            silo: 'alle',
            segments: ['alle'],      // WICHTIG: ['alle'] nicht []
            products: ['alle'],      // WICHTIG: Muss gesetzt sein!
            bundeslaender: []
        };

        console.log('Filter zurückgesetzt und Agentur-Filter gesetzt:', state.filters);
    } else {
        // Falls state noch nicht existiert, speichere im localStorage
        localStorage.removeItem('pendingSiloFilter');
        localStorage.removeItem('pendingSegmentFilter');
        localStorage.removeItem('pendingBundeslandFilter');
        localStorage.setItem('pendingAgenturFilter', vermittlerId);
        console.log('Filter im localStorage gespeichert');
    }
}

function setSiloFilter(silo) {
    console.log('setSiloFilter:', silo);

    if (typeof state !== 'undefined') {
        state.filters.silo = silo;
    } else {
        localStorage.setItem('pendingSiloFilter', silo);
    }
}

function setSegmentFilter(segments) {
    console.log('setSegmentFilter:', segments);

    if (typeof state !== 'undefined') {
        state.filters.segments = segments;
    } else {
        localStorage.setItem('pendingSegmentFilter', JSON.stringify(segments));
    }
}

function setBundeslandFilter(laender) {
    console.log('setBundeslandFilter:', laender);

    if (typeof state !== 'undefined') {
        state.filters.bundeslaender = laender;
    } else {
        localStorage.setItem('pendingBundeslandFilter', JSON.stringify(laender));
    }
}

function clearAllFilters() {
    console.log('clearAllFilters');

    if (typeof state !== 'undefined') {
        state.filters = {
            year: 2024,
            agentur: 'alle',
            silo: 'alle',
            segments: [],
            bundeslaender: []
        };
    } else {
        localStorage.removeItem('pendingAgenturFilter');
        localStorage.removeItem('pendingSiloFilter');
        localStorage.removeItem('pendingSegmentFilter');
        localStorage.removeItem('pendingBundeslandFilter');
    }
}

// v16: Predefined answers for standard questions (no AI needed)
const standardAnswers = {
    'Was kann ich hier machen?': `**Willkommen im Vertriebssteuerungs-Cockpit!** 🎯

Hier kannst du:
• **Dashboard öffnen** - Visualisiere deine Versicherungsdaten mit interaktiven Charts
• **CSV-Daten hochladen** - Lade deine eigenen Daten hoch oder nutze den Generator
• **Daten generieren** - Erstelle realistische Testdaten mit dem CSV-Generator
• **KI-Analysen** - Stelle Fragen zu deinen Daten (powered by KI)

Klicke auf "Zur Gesamtübersicht" um loszulegen!`,

    'Zeige mir ein Beispiel Dashboard': `**So funktioniert das Dashboard:** 📊

1. **Klicke auf "Zur Gesamtübersicht"** oben
2. Das Dashboard lädt automatisch mit Beispieldaten
3. Du siehst:
   - KPI-Kacheln (Neugeschäft, Bestand, etc.)
   - Interaktive Charts
   - Deutschland-Karte mit Regionen
   - Filter-Optionen

**Oder:** Generiere eigene Daten mit dem CSV-Generator!`,

    'Wie lade ich Daten hoch?': `**Daten hochladen - 2 Optionen:** 📤

**Option 1: Direkt hier**
• Ziehe eine CSV-Datei in das Upload-Feld oben
• Oder klicke drauf zum Auswählen

**Option 2: Im Dashboard**
• Öffne das Dashboard
• Nutze den Upload-Button oben
• Wähle deine CSV-Datei

**Oder generiere Testdaten:**
• Klicke auf "Test-Daten generieren"
• Wähle Unternehmensgröße
• Download CSV und lade sie hoch`
};

// v16 FEATURE: Landing Page Sample Questions with instant answers
function askLandingSampleQuestion(question) {
    console.log('Landing Sample Question clicked:', question);

    // Verstecke Sample Questions nach erstem Click
    const sampleQuestions = document.getElementById('landingSampleQuestions');
    if (sampleQuestions) {
        sampleQuestions.style.display = 'none';
    }

    // Check if this is a standard question
    if (standardAnswers[question]) {
        console.log('Using predefined answer (no AI)');

        // Add user message
        addLandingChatMessage('user', question);

        // Add instant answer
        setTimeout(() => {
            addLandingChatMessage('assistant', standardAnswers[question]);
        }, 300);

        return;
    }

    // For non-standard questions, use AI
    const chatInput = document.getElementById('landingChatInput');
    if (chatInput) {
        chatInput.value = question;
    }

    if (typeof sendLandingChatMessage === 'function') {
        sendLandingChatMessage();
    }
}

// Make function globally available
window.askLandingSampleQuestion = askLandingSampleQuestion;

// ========================================
// UPLOAD MODUS
// ========================================

var uploadModeActive = true; // Standardmäßig aktiviert

function toggleUploadMode() {
    const toggle = document.getElementById('uploadModeToggle');
    const hint = document.getElementById('uploadModeHint');
    const body = document.body;

    uploadModeActive = toggle ? toggle.checked : true;

    if (uploadModeActive) {
        body.classList.add('upload-mode-active');
        if (hint) hint.style.display = 'block';
        console.log('Upload-Modus aktiviert');
    } else {
        body.classList.remove('upload-mode-active');
        if (hint) hint.style.display = 'none';
        console.log('Upload-Modus deaktiviert');
    }
}

// Upload-Modus beim Start aktivieren
function initUploadMode() {
    const toggle = document.getElementById('uploadModeToggle');
    if (toggle) {
        toggle.checked = true;
    }
    document.body.classList.add('upload-mode-active');
    const hint = document.getElementById('uploadModeHint');
    if (hint) hint.style.display = 'block';
    uploadModeActive = true;
    console.log('Upload-Modus standardmäßig aktiviert');
}

// Logo Upload
function triggerLogoUpload() {
    if (!uploadModeActive) {
        console.log('Upload-Modus nicht aktiv');
        return;
    }
    document.getElementById('logoUploadInput').click();
}

function handleLogoUpload(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(e) {
        const logoImg = document.getElementById('uploadedLogo');
        const placeholder = document.getElementById('logoPlaceholder');

        logoImg.src = e.target.result;
        logoImg.style.display = 'block';
        placeholder.style.display = 'none';

        // Speichern im localStorage
        localStorage.setItem('customLogo', e.target.result);
        console.log('Logo hochgeladen und gespeichert');
    };
    reader.readAsDataURL(file);
}

// Profilbild Upload (für Agentur und Kunden)
function triggerProfileUpload(vermittlerId) {
    // Kein uploadModeActive Check - Foto kann immer geändert werden
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = function(e) {
        handleProfileUpload(e, vermittlerId);
    };
    input.click();
}

function handleProfileUpload(event, vermittlerId) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(e) {
        // Speichern im localStorage
        localStorage.setItem('profileImage_' + vermittlerId, e.target.result);

        // Je nach Kontext das richtige Element aktualisieren
        if (vermittlerId === 'kunde') {
            // Kunden-Foto auf der Kundendetail-Seite
            const kundenFoto = document.querySelector('.kunden-foto');
            if (kundenFoto) {
                kundenFoto.innerHTML = `<img src="${e.target.result}" alt="Kundenfoto" style="width:100%;height:100%;object-fit:cover;border-radius:50%;">`;
            }
            console.log('Kundenfoto gespeichert');
        } else {
            // Bild in Agenturansicht aktualisieren
            const photoContainer = document.getElementById('agenturPhoto');
            if (photoContainer) {
                photoContainer.innerHTML = `<img src="${e.target.result}" alt="Profilbild">`;
            }
            console.log('Profilbild gespeichert für:', vermittlerId);
        }
    };
    reader.readAsDataURL(file);
}

// Agentur Photo Upload (direkt auf der Agenturübersicht-Seite)
function triggerAgenturPhotoUpload() {
    // Kein uploadModeActive Check - Foto kann immer geändert werden
    document.getElementById('agenturPhotoInput').click();
}

function handleAgenturPhotoUpload(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(e) {
        // Korrekter Element-Name: agenturPhotoImgSmall
        const photoImg = document.getElementById('agenturPhotoImgSmall');
        const placeholder = document.querySelector('.agentur-photo-placeholder-small');

        if (photoImg) {
            photoImg.src = e.target.result;
            photoImg.style.display = 'block';
        }
        if (placeholder) {
            placeholder.style.display = 'none';
        }

        // Speichern im localStorage
        localStorage.setItem('agenturPhoto', e.target.result);
        console.log('Agentur-Foto hochgeladen und gespeichert');
    };
    reader.readAsDataURL(file);
}

// Gespeichertes Logo laden (mit Fallback auf assets/images-config.json)
async function loadSavedImages() {
    // Versuche zuerst, die Konfigurationsdatei zu laden
    let configImages = { logo: null, profile: null };
    try {
        const response = await fetch('assets/images/images-config.json');
        if (response.ok) {
            configImages = await response.json();
        }
    } catch (e) {
        console.log('Keine images-config.json gefunden, nutze Fallbacks');
    }

    // Logo laden: localStorage > config > default SVG
    const savedLogo = localStorage.getItem('customLogo');
    const logoImg = document.getElementById('uploadedLogo');
    const logoPlaceholder = document.getElementById('logoPlaceholder');

    if (logoImg && logoPlaceholder) {
        if (savedLogo) {
            logoImg.src = savedLogo;
            logoImg.style.display = 'block';
            logoPlaceholder.style.display = 'none';
        } else if (configImages.logo) {
            logoImg.src = configImages.logo;
            logoImg.style.display = 'block';
            logoPlaceholder.style.display = 'none';
        } else {
            // Fallback: Standard-Logo aus assets
            logoImg.src = 'assets/images/default-logo.svg';
            logoImg.style.display = 'block';
            logoPlaceholder.style.display = 'none';
        }
    }

    // Agentur Photo laden: localStorage > config > default SVG
    const savedAgenturPhoto = localStorage.getItem('agenturPhoto');
    const photoImg = document.getElementById('agenturPhotoImg');
    const photoPlaceholder = document.querySelector('.agentur-photo-placeholder');

    if (photoImg) {
        if (savedAgenturPhoto) {
            photoImg.src = savedAgenturPhoto;
            photoImg.style.display = 'block';
            if (photoPlaceholder) photoPlaceholder.style.display = 'none';
        } else if (configImages.profile) {
            photoImg.src = configImages.profile;
            photoImg.style.display = 'block';
            if (photoPlaceholder) photoPlaceholder.style.display = 'none';
        } else {
            // Fallback: Standard-Profilbild für Max Mustermann
            photoImg.src = 'assets/images/AdobeStock_1091012713.jpeg';
            photoImg.style.display = 'block';
            if (photoPlaceholder) photoPlaceholder.style.display = 'none';
        }
    }

    // AUCH das kleine Agentur-Foto im Header laden
    const photoImgSmall = document.getElementById('agenturPhotoImgSmall');
    const photoPlaceholderSmall = document.querySelector('.agentur-photo-placeholder-small');

    if (photoImgSmall) {
        if (savedAgenturPhoto) {
            photoImgSmall.src = savedAgenturPhoto;
            photoImgSmall.style.display = 'block';
            if (photoPlaceholderSmall) photoPlaceholderSmall.style.display = 'none';
        } else if (configImages.profile) {
            photoImgSmall.src = configImages.profile;
            photoImgSmall.style.display = 'block';
            if (photoPlaceholderSmall) photoPlaceholderSmall.style.display = 'none';
        } else {
            // Fallback: Standard-Profilbild für Max Mustermann
            photoImgSmall.src = 'assets/images/AdobeStock_1091012713.jpeg';
            photoImgSmall.style.display = 'block';
            if (photoPlaceholderSmall) photoPlaceholderSmall.style.display = 'none';
        }
    }
}

// Exportiere hochgeladene Bilder für GitHub
function exportImagesForGitHub() {
    const images = {};

    const logo = localStorage.getItem('customLogo');
    if (logo) images.logo = logo;

    const photo = localStorage.getItem('agenturPhoto');
    if (photo) images.photo = photo;

    if (Object.keys(images).length === 0) {
        alert('Keine hochgeladenen Bilder gefunden.');
        return;
    }

    // Download als JSON
    const blob = new Blob([JSON.stringify(images, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'uploaded-images.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    console.log('Bilder exportiert für GitHub');
}

// ========================================
// POTENTIALANALYSE
// ========================================

let currentPotentialFilter = null;

function openPotentialAnalyse() {
    console.log('Potentialanalyse öffnen...');

    // Verstecke alle Seiten
    document.getElementById('landingPage').style.display = 'none';
    document.getElementById('mainApp').style.display = 'none';
    const agenturOverview = document.getElementById('agenturOverview');
    if (agenturOverview) agenturOverview.style.display = 'none';
    const kundenDetail = document.getElementById('kundenDetailPage');
    if (kundenDetail) kundenDetail.style.display = 'none';

    // Zeige Potentialanalyse
    document.getElementById('potentialAnalysePage').style.display = 'block';

    // Reset Filter
    currentPotentialFilter = null;
    updatePotentialFilter();

    // Dispatch event for Page ID Tracker
    document.dispatchEvent(new CustomEvent('viewChanged', {
        detail: { module: 'versicherung', view: 'potentialanalyse' }
    }));
}

function openPotentialAnalyseWithFilter(productId, productName) {
    console.log('Potentialanalyse öffnen mit Filter:', productId);

    // Verstecke alle Seiten
    document.getElementById('landingPage').style.display = 'none';
    document.getElementById('mainApp').style.display = 'none';
    const agenturOverview = document.getElementById('agenturOverview');
    if (agenturOverview) agenturOverview.style.display = 'none';
    const kundenDetail = document.getElementById('kundenDetailPage');
    if (kundenDetail) kundenDetail.style.display = 'none';

    // Zeige Potentialanalyse
    document.getElementById('potentialAnalysePage').style.display = 'block';

    // Setze Filter
    currentPotentialFilter = productId;
    const filterSelect = document.getElementById('potentialProductFilter');
    if (filterSelect) {
        filterSelect.value = productId;
    }
    updatePotentialFilter();

    // Dispatch event for Page ID Tracker
    document.dispatchEvent(new CustomEvent('viewChanged', {
        detail: { module: 'versicherung', view: 'potentialanalyse' }
    }));
}

function closePotentialAnalyse() {
    document.getElementById('potentialAnalysePage').style.display = 'none';
    document.getElementById('landingPage').style.display = 'flex';
    currentPotentialFilter = null;

    // Dispatch event for Page ID Tracker
    document.dispatchEvent(new CustomEvent('viewChanged', {
        detail: { module: 'versicherung', view: 'landing' }
    }));
}

function showEigeneDaten() {
    document.getElementById('eigeneDatenContainer').style.display = 'block';
    document.getElementById('fidaContainer').style.display = 'none';
    document.getElementById('eigeneDatenBtn').classList.add('active');
    document.getElementById('fidaBtn').classList.remove('active');

    // Dispatch event for Page ID Tracker
    document.dispatchEvent(new CustomEvent('viewChanged', {
        detail: { module: 'versicherung', view: 'eigeneDaten' }
    }));
}

function showFidaDaten() {
    // Open Finance erweitert die eigenen Daten - beide anzeigen
    document.getElementById('eigeneDatenContainer').style.display = 'block';
    document.getElementById('fidaContainer').style.display = 'block';
    document.getElementById('eigeneDatenBtn').classList.remove('active');
    document.getElementById('fidaBtn').classList.add('active');

    // Dispatch event for Page ID Tracker
    document.dispatchEvent(new CustomEvent('viewChanged', {
        detail: { module: 'versicherung', view: 'fidaCases' }
    }));
}

function updatePotentialFilter() {
    const filter = currentPotentialFilter;

    // Wenn kein Filter aktiv ist, gruppierte Ansicht zeigen
    if (!filter) {
        renderGroupedPotentials('eigeneDatenTable');
        renderGroupedPotentials('fidaTable');
    } else {
        // Bei aktivem Filter: Flache Ansicht mit Filter
        renderFlatPotentials('eigeneDatenTable', filter);
        renderFlatPotentials('fidaTable', filter);
    }

    // Update aktiven Filter-Button
    const filterBtns = document.querySelectorAll('.potential-filter-btn');
    filterBtns.forEach(btn => {
        btn.classList.toggle('active', btn.dataset.filter === filter);
    });
}

// Rendert die Tabelle mit Gruppierung nach Hauptsegmenten (Leben, Kranken, SHU, Kfz)
function renderGroupedPotentials(tableId) {
    const table = document.getElementById(tableId);
    if (!table) return;

    const tbody = table.querySelector('tbody');
    if (!tbody) return;

    // Header in gruppierter Ansicht ausblenden
    const thead = table.querySelector('thead');
    if (thead) thead.style.display = 'none';

    // Sammle alle Original-Zeilen (ohne Gruppen-Zeilen)
    const originalRows = Array.from(tbody.querySelectorAll('tr:not(.potential-group-row)'));
    if (originalRows.length === 0) return;

    // Speichere Original-HTML falls noch nicht geschehen
    if (!tbody.dataset.originalHtml) {
        tbody.dataset.originalHtml = tbody.innerHTML;
    }

    // Mapping von Produkten zu Hauptsegmenten
    const productToSegment = {
        // Leben
        'bu': 'leben',
        'leben': 'leben',
        'altersvorsorge': 'leben',
        // Kranken
        'pflege': 'kranken',
        'kranken': 'kranken',
        // SHU (Sach/Haftpflicht/Unfall)
        'hausrat': 'shu',
        'haftpflicht': 'shu',
        'unfall': 'shu',
        'rechtsschutz': 'shu',
        'sach': 'shu',
        'wohngebaeude': 'shu',
        // Kfz
        'kfz': 'kfz'
    };

    // Hauptsegment-Namen, Reihenfolge und Icons
    const mainSegments = {
        'leben': {
            name: 'Leben',
            order: 1,
            icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>'
        },
        'kranken': {
            name: 'Kranken',
            order: 2,
            icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 12h-4l-3 9L9 3l-3 9H2"></path></svg>'
        },
        'shu': {
            name: 'Sach / Haftpflicht / Unfall',
            order: 3,
            icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>'
        },
        'kfz': {
            name: 'Kfz',
            order: 4,
            icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 17a2 2 0 1 0 4 0 2 2 0 0 0-4 0zm10 0a2 2 0 1 0 4 0 2 2 0 0 0-4 0z"></path><path d="M3 17h2m14 0h2M5 17H3v-4l2-5h10l4 5v4h-2"></path></svg>'
        }
    };

    // Parse Original-HTML und gruppiere
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = '<table><tbody>' + tbody.dataset.originalHtml + '</tbody></table>';
    const rows = Array.from(tempDiv.querySelectorAll('tr'));

    const groups = {};

    rows.forEach(row => {
        const badge = row.querySelector('.potential-badge');
        if (badge) {
            // Finde Produkt-Klasse
            const classes = Array.from(badge.classList);
            const product = classes.find(c => c !== 'potential-badge') || 'sonstige';

            // Mappe zu Hauptsegment
            const mainSegment = productToSegment[product] || 'shu';

            if (!groups[mainSegment]) {
                groups[mainSegment] = [];
            }

            // Ermittle Priorität
            const priorityEl = row.querySelector('.priority');
            let priority = 'medium';
            if (priorityEl) {
                if (priorityEl.classList.contains('high')) priority = 'high';
                else if (priorityEl.classList.contains('low')) priority = 'low';
            }

            // Ermittle Kundenname für Sortierung
            const firstCell = row.querySelector('td');
            const kundenName = firstCell ? firstCell.textContent.trim() : '';

            groups[mainSegment].push({
                html: row.outerHTML,
                priority: priority,
                kundenName: kundenName,
                product: product
            });
        }
    });

    // Sortiere Segmente nach definierter Reihenfolge
    const sortedSegments = Object.keys(groups).sort((a, b) => {
        const orderA = mainSegments[a]?.order || 99;
        const orderB = mainSegments[b]?.order || 99;
        return orderA - orderB;
    });

    // Ermittle Spaltenanzahl aus Tabellen-Header
    const colCount = table.querySelectorAll('thead th').length || 5;

    // Baue neue Tabellen-Struktur
    let newHtml = '';

    sortedSegments.forEach(segment => {
        const items = groups[segment];

        // Sortiere Vorgänge alphabetisch nach Kundenname
        items.sort((a, b) => a.kundenName.localeCompare(b.kundenName));

        // Zähle Prioritäten
        const highCount = items.filter(i => i.priority === 'high').length;
        const mediumCount = items.filter(i => i.priority === 'medium').length;
        const lowCount = items.filter(i => i.priority === 'low').length;

        const segmentInfo = mainSegments[segment] || { name: segment, icon: '' };

        // Gruppen-Zeile
        newHtml += `
            <tr class="potential-group-row" data-segment="${segment}" onclick="togglePotentialGroup(this)">
                <td colspan="${colCount}">
                    <div class="group-toggle">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16">
                            <polyline points="9 18 15 12 9 6"></polyline>
                        </svg>
                        <span class="segment-badge segment-${segment}">${segmentInfo.icon || ''}${segmentInfo.name}</span>
                        <span class="group-count">${items.length}</span>
                        <div class="group-priorities">
                            ${highCount > 0 ? `<span class="priority-count high">${highCount} Hoch</span>` : ''}
                            ${mediumCount > 0 ? `<span class="priority-count medium">${mediumCount} Mittel</span>` : ''}
                            ${lowCount > 0 ? `<span class="priority-count low">${lowCount} Niedrig</span>` : ''}
                        </div>
                    </div>
                </td>
            </tr>
        `;

        // Detail-Zeilen
        items.forEach(item => {
            // Füge Klasse für versteckte Zeilen hinzu - berücksichtige existierende class-Attribute
            let rowHtml = item.html;
            if (rowHtml.includes('class="')) {
                // Existierende class erweitern
                rowHtml = rowHtml.replace(/class="([^"]*)"/, `class="$1 potential-detail-row" data-segment="${segment}"`);
            } else {
                // Neue class hinzufügen
                rowHtml = rowHtml.replace('<tr', `<tr class="potential-detail-row" data-segment="${segment}"`);
            }
            newHtml += rowHtml;
        });
    });

    tbody.innerHTML = newHtml;
}

// Rendert die Tabelle flach (ohne Gruppierung) mit optionalem Filter
function renderFlatPotentials(tableId, filter) {
    const table = document.getElementById(tableId);
    if (!table) return;

    const tbody = table.querySelector('tbody');
    if (!tbody) return;

    // Header bei gefilterter Ansicht wieder einblenden
    const thead = table.querySelector('thead');
    if (thead) thead.style.display = '';

    // Stelle Original-HTML wieder her falls vorhanden
    if (tbody.dataset.originalHtml) {
        tbody.innerHTML = tbody.dataset.originalHtml;
    }

    // Wende Filter an
    const rows = tbody.querySelectorAll('tr');
    rows.forEach(row => {
        if (!filter) {
            row.style.display = '';
        } else {
            const badge = row.querySelector('.potential-badge');
            if (badge && badge.classList.contains(filter)) {
                row.style.display = '';
            } else {
                row.style.display = 'none';
            }
        }
    });
}

// Toggle Gruppen-Zeilen ein/aus
function togglePotentialGroup(groupRow) {
    const segment = groupRow.dataset.segment;
    const isExpanded = groupRow.classList.contains('expanded');

    groupRow.classList.toggle('expanded');

    // Finde alle Detail-Zeilen dieser Gruppe
    const table = groupRow.closest('table');
    const detailRows = table.querySelectorAll(`.potential-detail-row[data-segment="${segment}"]`);

    detailRows.forEach(row => {
        row.classList.toggle('visible', !isExpanded);
    });
}

function filterPotentials(productId) {
    currentPotentialFilter = productId === 'alle' ? null : productId;
    updatePotentialFilter();
}

// Globale Funktion für Toggle
window.togglePotentialGroup = togglePotentialGroup;

// ========================================
