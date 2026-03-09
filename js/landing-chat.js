// ========================================
// GOOGLE CLOUD SPEECH-TO-TEXT (kept for settings compatibility)
// ========================================
function getSpeechApiKey() {
    return localStorage.getItem('google_speech_api_key') || '';
}

function saveSpeechApiKey() {
    const input = document.getElementById('speechApiKeyInput');
    const status = document.getElementById('speechApiKeyStatus');
    if (!input) return;
    const key = input.value.trim();
    if (key && key.startsWith('AIza')) {
        localStorage.setItem('google_speech_api_key', key);
        if (status) { status.className = 'api-token-status success'; status.textContent = '✅ Google Cloud Key gespeichert – Speech-to-Text aktiv'; }
    } else if (!key) {
        localStorage.removeItem('google_speech_api_key');
        if (status) { status.className = 'api-token-status'; status.textContent = 'Key entfernt – Browser Speech API wird genutzt'; }
    } else {
        if (status) { status.className = 'api-token-status error'; status.textContent = '❌ Ungültiger Key (muss mit "AIza" beginnen)'; }
    }
}

// ========================================
// VOICE INPUT (Microphone Button) — Simuliert (wie eikecase Intro.jsx)
// Kein echtes Mikrofon nötig. Komplett gescriptete Sequenz.
// ========================================
let isRecording = false;

const FAKE_INTERIM_TEXT = 'hey chatbot, zeig meine';
const FAKE_FULL_TEXT = 'Hey Chatbot, zeig meine Vertriebspotentiale in meiner Agentur';

function stopRecordingUI() {
    const micBtn = document.getElementById('landingChatMic');
    const chatInput = document.getElementById('landingChatInput');
    isRecording = false;
    if (micBtn) micBtn.classList.remove('recording');
    if (chatInput) {
        chatInput.readOnly = false;
        chatInput.style.borderColor = '';
        chatInput.placeholder = 'Frag mich etwas...';
    }
}

function toggleVoiceInput() {
    if (isRecording) return; // Während Aufnahme ignorieren

    const micBtn = document.getElementById('landingChatMic');
    const chatInput = document.getElementById('landingChatInput');

    // Sofort: Recording starten, Input leeren
    isRecording = true;
    if (micBtn) micBtn.classList.add('recording');
    if (chatInput) {
        chatInput.readOnly = true;
        chatInput.style.borderColor = '#ef4444';
        chatInput.value = '';
        chatInput.placeholder = 'Höre zu...';
    }

    // Nach 3s: Zwischentext erscheint (simulierte Live-Transkription)
    setTimeout(() => {
        if (!isRecording) return;
        if (chatInput) {
            chatInput.value = FAKE_INTERIM_TEXT;
            chatInput.style.height = 'auto';
            chatInput.style.height = chatInput.scrollHeight + 'px';
        }
    }, 3000);

    // Nach 4.5s: Voller Text + Recording stoppt
    setTimeout(() => {
        if (!isRecording) return;
        if (chatInput) {
            chatInput.value = FAKE_FULL_TEXT;
            chatInput.style.height = 'auto';
            chatInput.style.height = chatInput.scrollHeight + 'px';
        }
        stopRecordingUI();
    }, 4500);

    // Nach 5s: Auto-Submit
    setTimeout(() => {
        sendLandingChatMessage();
    }, 5000);
}

// ========================================
// DUAL VIEW: Stammdaten + Potentiale nebeneinander
// ========================================
function openKundenDetailDualView(kundenName, vermittlerId) {
    // If called from landing page (M-01), override the source tracking
    var landingPage = document.getElementById('landingPage');
    if (landingPage && landingPage.style.display !== 'none') {
        if (typeof previousViewBeforeKundenDetail !== 'undefined') {
            previousViewBeforeKundenDetail = 'landing';
        }
        // Sicherstellen, dass der A-02 Header "Maria Musterfrau" zeigt (nicht Makler-Header),
        // da updateKundenSharedHeader() diese Werte auf A-10 kopiert.
        var titleEl = document.getElementById('agenturPageTitle');
        var subtitleId = document.getElementById('agenturIdHeader');
        if (titleEl) titleEl.textContent = 'Agentur: Maria Musterfrau';
        if (subtitleId) {
            var subtitleDiv = subtitleId.parentElement;
            if (subtitleDiv) {
                subtitleDiv.innerHTML = '<span id="agenturIdHeader">VM00001</span> | <span id="agenturStatusHeader">Aktiv</span>';
            }
        }
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
window.saveSpeechApiKey = saveSpeechApiKey;

// Google Cloud Speech Key Status beim Laden anzeigen
(function() {
    const key = getSpeechApiKey();
    setTimeout(() => {
        const input = document.getElementById('speechApiKeyInput');
        const status = document.getElementById('speechApiKeyStatus');
        if (key && input) { input.value = key; }
        if (key && status) { status.className = 'api-token-status success'; status.textContent = '✅ Google Cloud Speech-to-Text aktiv'; }
    }, 500);
})();

// Send message in landing chat - NUTZT GLEICHE LOGIK WIE DASHBOARD
async function sendLandingChatMessage() {
    const chatInput = document.getElementById('landingChatInput');
    const message = chatInput.value.trim();
    
    console.log('Landing Nachricht senden:', message);
    
    if (!message || isLandingChatProcessing) {
        console.log('Leere Nachricht oder bereits in Verarbeitung');
        return;
    }
    
    // Input-Text stehen lassen (nicht leeren)
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
   - Beispiel: setAgenturFilter('VM00001') für Maria Musterfrau

2. setSiloFilter(silo) - Filtert nach Silo
   - Gültige Werte: 'Ausschließlichkeit', 'Makler', 'Direktvertrieb', 'Banken'

3. setSegmentFilter(segments) - Filtert nach Segmenten
   - Gültige Werte: 'Leben', 'Kranken', 'Schaden', 'Kfz'

4. setBundeslandFilter(bundeslaender) - Filtert nach Bundesländern

5. clearAllFilters() - Setzt alle Filter zurück

6. showAgenturOverview(vermittler_id) - Zeigt detaillierte Agentur-Übersichtsseite
   - Beispiel: showAgenturOverview('VM00001') für Maria Musterfrau
   - Zeigt: Stammdaten, Foto, KPI-Dashboard mit Balken, Vertragshistorie
   - Nutze diese Funktion bei Fragen wie "Übersicht Agentur Maria Musterfrau"
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

        const userName = localStorage.getItem('userName') || 'Maria';
        return `Hallo ${userName}, sehr gerne. Ich habe folgende Vertriebspotentiale identifiziert:
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

