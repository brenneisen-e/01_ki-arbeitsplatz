(function(){var r=['safeLocalGet','state'];var m=r.filter(function(f){return typeof window[f]==='undefined'});if(m.length)console.error('[chat.js] Fehlende Deps:',m.join(', '),'← Lade utils.js, data.js zuerst!');})();
// js/chat.js - Chat Logic (mit automatischer Datenanalyse nach Filtern)

let chatHistory = [];
let isProcessing = false;
let chatInitialized = false;

// CONFIGURATION - API via Cloudflare Worker
window.CLAUDE_WORKER_URL = 'https://vst-claude-api.eike-3e2.workers.dev';
window.CLAUDE_MODEL = 'claude-haiku-4-5-20251001';

// Fallback: API-Key aus localStorage (falls kein Worker)
function getClaudeApiKey() {
    return safeLocalGet('claude_api_token', '');
}

// Prüfe ob Worker oder direkter Zugriff verwendet wird
window.USE_WORKER = window.CLAUDE_WORKER_URL !== '';

// Mock-Modus überall außer T-05 (KI-Dokumentenassistent)
function shouldUseMockMode() {
    // Prüfe ob wir auf T-05 (KI-Dokumentenassistent) sind
    const documentAssistantContainer = document.getElementById('documentAssistantContainer');
    const isOnDocumentAssistant = documentAssistantContainer && documentAssistantContainer.style.display !== 'none';

    // Nur auf T-05 echte API nutzen, überall sonst Mock-Modus
    if (isOnDocumentAssistant) {
        return false; // API aktiv auf T-05
    }

    return true; // Mock-Modus im Dashboard Chat (A-03) und überall sonst
}

let USE_MOCK_MODE = shouldUseMockMode();

/**
 * Generiert Follow-up-Vorschläge für den Sales Steering Chat
 * @param {string} context - Kontext der letzten Antwort
 * @returns {string} - HTML mit Vorschlag-Buttons
 */
function getSalesChatSuggestions(context) {
    const suggestions = {
        topAgenturen: [
            { text: 'Top 5 nach Neugeschäft', query: 'Zeige Top 5 Vermittler nach Neugeschäft' },
            { text: 'Wer hat den besten NPS?', query: 'Welche Vermittler haben den höchsten NPS?' },
            { text: 'Stornoquoten vergleichen', query: 'Welche Vermittler haben die niedrigste Stornoquote?' }
        ],
        filter: [
            { text: 'Alle Filter zurücksetzen', query: 'Setze alle Filter zurück' },
            { text: 'Top Performer anzeigen', query: 'Zeige Top 10 Vermittler nach Ergebnis' },
            { text: 'Vergleich Bundesländer', query: 'Vergleiche die Performance nach Bundesländern' }
        ],
        default: [
            { text: 'Top 5 nach Ergebnis', query: 'Zeige Top 5 Vermittler nach Ergebnis' },
            { text: 'Performance Überblick', query: 'Wie ist die Gesamt-Performance?' },
            { text: 'Auffällige Vermittler', query: 'Welche Vermittler haben ungewöhnliche Werte?' }
        ]
    };

    const selected = suggestions[context] || suggestions.default;

    const buttons = selected.map(s =>
        `<button onclick="sendSuggestedQuery('${s.query.replace(/'/g, "\\'")}')">${s.text}</button>`
    ).join('');

    return `\n\n<div class="chat-followup-suggestions">${buttons}</div>`;
}

/**
 * Sendet eine vorgeschlagene Anfrage an den Chat
 */
function sendSuggestedQuery(query) {
    const chatInput = document.getElementById('chatInput');
    if (chatInput) {
        chatInput.value = query;
        sendMessage();
    }
}

// Global verfügbar machen
window.sendSuggestedQuery = sendSuggestedQuery;

// Initialize chat widget
function initChat() {
    // v15: Prevent multiple initializations
    if (chatInitialized) {
        console.log('Chat bereits initialisiert, ueberspringe...');
        return;
    }

    console.log('initChat() aufgerufen');
    console.log('dailyRawData verfuegbar:', dailyRawData ? dailyRawData.length + ' Zeilen' : 'NICHT VERFÜGBAR');

    const chatWidget = document.getElementById('chatWidget');
    const chatToggle = document.getElementById('chatToggle');

    if (!chatWidget || !chatToggle) {
        console.error('Chat Elemente nicht gefunden im DOM!');
        console.log('chatWidget:', chatWidget);
        console.log('chatToggle:', chatToggle);
        return;
    }

    const chatClose = document.getElementById('chatClose');
    const chatMinimize = document.getElementById('chatMinimize');
    const chatSend = document.getElementById('chatSend');
    const chatInput = document.getElementById('chatInput');
    const chatBody = document.getElementById('chatBody');

    if (!chatSend || !chatInput || !chatBody) {
        console.error('Chat Input-Elemente nicht gefunden!');
        return;
    }

    // v15: Mark as initialized
    chatInitialized = true;

    // Toggle chat
    chatToggle.addEventListener('click', () => {
        console.log('Chat Toggle geklickt');
        chatWidget.style.display = 'flex';
        chatToggle.style.display = 'none';
        chatWidget.classList.remove('minimized'); // v15: Ensure not minimized when opened
        chatInput.focus();
    });

    // Close chat
    chatClose.addEventListener('click', () => {
        console.log('Chat geschlossen');
        chatWidget.style.display = 'none';
        chatToggle.style.display = 'flex';
        chatWidget.classList.remove('minimized'); // v15: Reset minimized state
    });

    // Minimize chat
    chatMinimize.addEventListener('click', () => {
        console.log('Chat minimiert/maximiert');
        const isMinimized = chatWidget.classList.toggle('minimized');
        console.log('Minimized state:', isMinimized);
    });
    
    // Send message
    chatSend.addEventListener('click', () => sendMessage());
    
    // Enter to send (Shift+Enter for new line)
    chatInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    });
    
    // Auto-resize textarea
    chatInput.addEventListener('input', () => {
        chatInput.style.height = 'auto';
        chatInput.style.height = chatInput.scrollHeight + 'px';
    });
    
    // Example question buttons
    chatBody.addEventListener('click', (e) => {
        if (e.target.classList.contains('example-btn')) {
            const question = e.target.dataset.question;
            chatInput.value = question;
            sendMessage();
        }
    });

    // Show chat if data is already loaded
    const rawData = window.dailyRawData || (typeof dailyRawData !== 'undefined' ? dailyRawData : null);
    if (rawData && rawData.length > 0) {
        console.log('CSV Daten vorhanden - Chat wird aktiviert');
        chatToggle.style.display = 'flex';
        chatWidget.style.display = 'flex';

        // Auto-hide toggle, show widget after 1 second
        setTimeout(() => {
            console.log('Chat Toggle ausgeblendet, Widget angezeigt');
            chatToggle.style.display = 'none';
        }, 1000);

        // Show welcome message with suggestions
        if (shouldUseMockMode()) {
            const welcomeMessage = 'Hallo! 👋 Ich kann dir bei der Analyse deiner Dashboard-Daten helfen.\n\nHier sind einige Vorschläge:' + getSalesChatSuggestions('default');
            addMessage('assistant', welcomeMessage);
        }
    } else {
        console.log('Keine CSV Daten - Chat bleibt verborgen bis Daten geladen werden');
        // Chat ist initialisiert, aber versteckt
        chatToggle.style.display = 'none';
        chatWidget.style.display = 'none';
    }

    console.log('Chat erfolgreich initialisiert');
}

// Activate chat when data is loaded (call this after CSV upload)
function activateChat() {
    const chatToggle = document.getElementById('chatToggle');
    const chatWidget = document.getElementById('chatWidget');

    if (chatToggle && chatWidget) {
        console.log('Chat wird aktiviert (Daten wurden geladen)');
        chatToggle.style.display = 'flex';
        chatWidget.style.display = 'flex';

        setTimeout(() => {
            chatToggle.style.display = 'none';
        }, 1000);
    }
}

// Make activateChat globally available
window.activateChat = activateChat;

// Send message (or Mock)
async function sendMessage() {
    const chatInput = document.getElementById('chatInput');
    const message = chatInput.value.trim();
    
    console.log('Nachricht senden:', message);

    if (!message || isProcessing) {
        console.log('Leere Nachricht oder bereits in Verarbeitung');
        return;
    }
    
    // Clear input
    chatInput.value = '';
    chatInput.style.height = 'auto';
    
    // Add user message to chat
    addMessage('user', message);
    
    // Show typing indicator
    showTyping();
    
    isProcessing = true;
    
    try {
        // Dynamisch prüfen ob Mock-Modus aktiv ist (erlaubt API-Key Änderung ohne Reload)
        const useMock = shouldUseMockMode();
        console.log('API-Key Status:', useMock ? 'MOCK-MODUS' : 'API-MODUS AKTIV');

        if (useMock) {
            // Mock response for testing
            console.log('Mock-Modus - Generiere Test-Antwort');
            await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate delay
            const mockResponse = generateMockResponse(message);
            hideTyping();
            const suggestions = getSalesChatSuggestions('default');
            addMessage('assistant', mockResponse + suggestions);
        } else {
            // Real API call
            console.log('Rufe API auf...');
            await sendToClaude(message);
        }

    } catch (error) {
        console.error('Chat Fehler:', error);
        hideTyping();
        // Fallback to mock response on API error
        console.log('Fallback auf Mock-Antwort...');
        const mockResponse = generateMockResponse(message);
        const suggestions = getSalesChatSuggestions('default');
        addMessage('assistant', mockResponse + suggestions);
    }
    
    isProcessing = false;
}

// Generate mock response for testing
function generateMockResponse(message) {
    const lowerMessage = message.toLowerCase();

    // ========================================
    // SAMPLE QUESTIONS - Hardcoded Responses
    // ========================================

    // "Zeige mir die Top 5 Vermittler nach Neugeschäft"
    if (lowerMessage.includes('top') && lowerMessage.includes('vermittler') && lowerMessage.includes('neugeschäft')) {
        showTopAgenturen(5, 'neugeschaeft');
        const agenturenData = typeof getAgenturenData === 'function' ? getAgenturenData() : [];
        const sorted = agenturenData.sort((a, b) => (b.neugeschaeft || 0) - (a.neugeschaeft || 0)).slice(0, 5);

        return `**Top 5 Vermittler nach Neugeschäft:**

${sorted.map((a, i) => {
    const ng = a.neugeschaeft ? `€${(a.neugeschaeft / 1000).toFixed(0)}k` : '€0';
    const name = (a.agentur_name || a.agentur || '').replace(/"/g, '');
    return `${i+1}. **${name}** — ${ng}`;
}).join('\n')}

→ *Die Tabelle zeigt jetzt die Top 5 Vermittler.*`;
    }

    // "Welches Bundesland hat die beste Performance?"
    if (lowerMessage.includes('bundesland') && lowerMessage.includes('beste')) {
        return `**Bundesland-Ranking nach Performance:**

1. **Bayern** — Score: 87
   Neugeschäft: €52.1 Mio | Storno: 6.8%

2. **Baden-Württemberg** — Score: 84
   Neugeschäft: €45.2 Mio | Storno: 7.2%

3. **Nordrhein-Westfalen** — Score: 81
   Neugeschäft: €48.7 Mio | Storno: 7.9%

4. **Hessen** — Score: 78
   Neugeschäft: €28.3 Mio | Storno: 7.5%

5. **Niedersachsen** — Score: 75
   Neugeschäft: €22.1 Mio | Storno: 8.1%

→ *Performance-Score = gewichteter Mix aus Neugeschäft, Storno, NPS*`;
    }

    // "Wie entwickelt sich der NPS Score?"
    if (lowerMessage.includes('nps') && (lowerMessage.includes('entwickel') || lowerMessage.includes('entwicklung'))) {
        return `**NPS Score Entwicklung:**

**Jahresverlauf 2024-2025:**
• Jan 2024: NPS 38
• Apr 2024: NPS 40
• Jul 2024: NPS 41
• Okt 2024: NPS 42
• Jan 2025: NPS 42

**Trend:** +4 Punkte YoY (+10.5%)

**Nach Segment:**
• Leben: NPS 45 (+3)
• Kranken: NPS 44 (+5)
• Schaden: NPS 40 (+4)
• Kfz: NPS 38 (+3)

→ *Krankenversicherung zeigt stärkste Verbesserung.*`;
    }

    // "Vergleiche Makler vs. Ausschließlichkeit"
    if (lowerMessage.includes('makler') && lowerMessage.includes('ausschließlichkeit')) {
        return `**Vergleich: Makler vs. Ausschließlichkeit**

| KPI | Makler | Ausschließlichkeit |
|-----|--------|-------------------|
| Neugeschäft | €28.5 Mio | €35.2 Mio |
| Bestand | €1.2 Mrd | €1.8 Mrd |
| Stornoquote | 9.2% | 6.8% |
| NPS Score | 68 | 74 |
| Deckungsbeitrag | €8.1 Mio | €12.4 Mio |

**Fazit:**
• **Ausschließlichkeit** führt bei Volumen & Kundenbindung
• **Makler** haben höhere Stornoquote
• Ausschließlichkeit profitiert von engerer Kundenbeziehung`;
    }

    // "Zeige mir die Stornoquoten nach Segment"
    if (lowerMessage.includes('storno') && lowerMessage.includes('segment')) {
        return `**Stornoquoten nach Segment:**

| Segment | Stornoquote | Trend | Benchmark |
|---------|-------------|-------|-----------|
| **Leben** | 5.8% | -0.3% | 6.5% ✓ |
| **Kranken** | 4.2% | -0.5% | 5.0% ✓ |
| **Schaden** | 8.5% | +0.2% | 8.0% |
| **Kfz** | 12.1% | -0.8% | 11.5% |

**Gesamt:** 8.2% (Ziel: <8.0%)

**Insights:**
• Leben & Kranken unter Benchmark
• Schaden & Kfz leicht über Benchmark
• Kfz zeigt beste Verbesserung (-0.8%)`;
    }

    // "Filtere nach Maria Musterfrau" (specific handling with real filter)
    if (lowerMessage.includes('filtere') && (lowerMessage.includes('maria') || lowerMessage.includes('musterfrau'))) {
        if (typeof setAgenturFilter === 'function') {
            setAgenturFilter('VM00001');
        }
        return `**Filter gesetzt: Maria Musterfrau (VM00001)**

Das Dashboard zeigt jetzt die Daten für diese Agentur.

**Schnellübersicht:**
• Neugeschäft YTD: €245.000
• Bestand: €3.2 Mio
• Stornoquote: 5.2%
• NPS Score: 78

→ *Klicken Sie auf "Alle Filter zurücksetzen" für die Gesamtansicht.*`;
    }

    // "Welche Vermittler haben ungewöhnliche Werte?" / Anomalien
    if (lowerMessage.includes('ungewöhnlich') || lowerMessage.includes('ungewohnlich') ||
        lowerMessage.includes('auffällig') || lowerMessage.includes('auffallig') ||
        lowerMessage.includes('anomalie') || (lowerMessage.includes('vermittler') && lowerMessage.includes('werte'))) {

        // Zeige die auffälligen Vermittler in der Tabelle mit KI-Analyse
        showAnomalyAgenturen();

        return `**Auffällige Vermittler (Anomalie-Erkennung):**

4 Vermittler mit auffälligen Werten identifiziert.
Die Tabelle zeigt jetzt diese Vermittler mit detaillierter KI-Analyse.

**Erkannte Anomalien:**
• 2x Hohe Stornoquote (>15%)
• 1x Niedriger NPS Score (<30)
• 1x Bestandsrückgang (>10% YoY)

→ *Die KI-Analyse-Spalte zeigt Ursachen und Handlungsempfehlungen.*`;
    }

    // Performance von Stadt/Landkreis
    if (lowerMessage.includes('performance') && (lowerMessage.includes('freiburg') || lowerMessage.includes('landkreis') || lowerMessage.includes('stadt'))) {
        return `**Performance-Analyse für Freiburg:**

**Neugeschäft:** €4.2 Mio (Rang 3 in Baden-Württemberg)
**Bestand:** €180 Mio
**Stornoquote:** 6.8% (gut, unter Durchschnitt)
**NPS Score:** 78 (überdurchschnittlich)

**Insights:**
- Starke Marktposition im Südwesten
- Niedrige Stornoquote deutet auf gute Kundenbindung hin
- Überdurchschnittlicher NPS zeigt hohe Kundenzufriedenheit`;
    }

    // Top 10%+ bei KV
    if (lowerMessage.includes('10%') || (lowerMessage.includes('beste') && lowerMessage.includes('kv'))) {
        return `**Top-Performer bei Krankenversicherung (>10% über Durchschnitt):**

1. **VM00042 - Julia Schneider** (+18.3%)
   Neugeschäft KV: €125k | Storno: 4.2%

2. **VM00087 - Thomas Weber** (+15.7%)
   Neugeschäft KV: €118k | Storno: 5.1%

3. **VM00153 - Sandra Hoffmann** (+14.2%)
   Neugeschäft KV: €112k | Storno: 4.8%

4. **VM00201 - Michael Klein** (+12.9%)
   Neugeschäft KV: €108k | Storno: 5.3%

5. **VM00312 - Anna Becker** (+11.4%)
   Neugeschäft KV: €103k | Storno: 5.7%

**Durchschnitt:** €92k Neugeschäft KV
**Erfolgsfaktoren:** Niedrige Stornoquoten, Fokus auf Zusatzversicherungen`;
    }

    // Vergleich Bundesländer
    if (lowerMessage.includes('vergleich') || lowerMessage.includes('vs')) {
        return `**Vergleich Baden-Württemberg vs Bayern:**

**Baden-Württemberg:**
- Stornoquote: 7.2%
- NPS Score: 79
- Neugeschäft: €45.2 Mio
- Bestand: €1.8 Mrd

**Bayern:**
- Stornoquote: 7.8%
- NPS Score: 76
- Neugeschäft: €52.1 Mio
- Bestand: €2.1 Mrd

**Fazit:** BW bei Storno & NPS, Bayern bei Volumen`;
    }

    // Bester NPS
    if (lowerMessage.includes('nps') && lowerMessage.includes('beste')) {
        return `**Bundesländer mit bestem NPS Score:**

1. **Hamburg** — NPS: 82
2. **Baden-Württemberg** — NPS: 79
3. **Bayern** — NPS: 76
4. **Hessen** — NPS: 74
5. **Nordrhein-Westfalen** — NPS: 72

**Bundesweiter Durchschnitt:** NPS 68

→ *Starke Stadtstaaten performen überdurchschnittlich*`;
    }

    // Top performers
    if (lowerMessage.includes('top') || lowerMessage.includes('beste')) {
        // Bestimme die Sortierung basierend auf der Anfrage
        let sortBy = 'neugeschaeft';
        if (lowerMessage.includes('ergebnis')) sortBy = 'ergebnis';
        else if (lowerMessage.includes('bestand')) sortBy = 'bestand';
        else if (lowerMessage.includes('deckungsbeitrag')) sortBy = 'deckungsbeitrag';

        // Extrahiere die Anzahl (z.B. "top 10" -> 10, default 5)
        const topMatch = lowerMessage.match(/top\s*(\d+)/);
        const topN = topMatch ? parseInt(topMatch[1]) : 5;

        // Wechsel zur Agenturen-Tabelle und zeige Top N
        showTopAgenturen(topN, sortBy);

        const agenturenData = typeof getAgenturenData === 'function' ? getAgenturenData() : [];
        const sorted = agenturenData.sort((a, b) => (b[sortBy] || 0) - (a[sortBy] || 0)).slice(0, topN);
        return `**Top ${topN} Vermittler** (nach ${sortBy === 'neugeschaeft' ? 'Neugeschäft' : sortBy}):\n\n${sorted.map((a, i) => {
            const name = (a.agentur_name || a.agentur || '').replace(/"/g, '');
            return `${i+1}. **${name}**`;
        }).join('\n')}\n\n→ *Die Tabelle zeigt jetzt die Top ${topN} Vermittler.*`;
    }

    // Filter commands
    if (lowerMessage.includes('filter') || lowerMessage.includes('zeig')) {
        if (lowerMessage.includes('maria') || lowerMessage.includes('musterfrau')) {
            setAgenturFilter('VM00001');
            return `**Filter gesetzt:** Maria Musterfrau (VM00001)\n\nDas Dashboard zeigt jetzt nur noch Daten dieser Agentur.`;
        }
        if (lowerMessage.includes('makler')) {
            setSiloFilter('Makler');
            return `**Filter gesetzt:** Makler\n\nDas Dashboard zeigt jetzt nur noch Makler-Daten.`;
        }
        if (lowerMessage.includes('zurück') || lowerMessage.includes('reset')) {
            clearAllFilters();
            return `**Filter zurückgesetzt**\n\nDas Dashboard zeigt wieder alle Daten.`;
        }
    }
    
    // General info
    if (lowerMessage.includes('wie viele') || lowerMessage.includes('anzahl')) {
        const count = dailyRawData ? dailyRawData.length : 0;
        const agentCount = getAgenturen().length;
        return `**Datensatz-Übersicht:**\n\n• ${count.toLocaleString()} Zeilen Tagesdaten\n• ${agentCount} Vermittler\n• Jahr: ${state.filters.year}`;
    }

    // Default response
    return `Ich habe Ihre Frage verstanden: "${message}"\n\n**Verfügbare Abfragen:**\n• "Top 5 Vermittler nach Neugeschäft"\n• "Welches Bundesland hat die beste Performance?"\n• "Wie entwickelt sich der NPS Score?"\n• "Vergleiche Makler vs. Ausschließlichkeit"\n• "Stornoquoten nach Segment"\n• "Filtere nach Maria Musterfrau"`;
}

// Send to API (via Worker or direct)
async function sendToClaude(message) {
    console.log('Sende Anfrage an API...');

    // Prepare context about current data
    const dataContext = getDataContext();

    // System prompt
    const systemPrompt = `Du bist ein KI-Assistent für ein Versicherungs-Dashboard. Du hast Zugriff auf CSV-Daten und kannst Dashboard-Filter steuern.

VERFÜGBARE FUNKTIONEN:
1. setAgenturFilter(vermittler_id) - Filtert Dashboard nach Agentur
   - Verwende IMMER die Vermittler-ID (z.B. 'VM00001'), NIEMALS den Namen!
   - Beispiel: setAgenturFilter('VM00001') für Maria Musterfrau
   - Nach dem Filtern erhältst du automatisch die gefilterten Daten zur Analyse

2. setSiloFilter(silo) - Filtert nach Silo
   - Gültige Werte: 'Ausschließlichkeit', 'Makler', 'Direktvertrieb', 'Banken'

3. setSegmentFilter(segments) - Filtert nach Segmenten
   - Gültige Werte: 'Leben', 'Kranken', 'Schaden', 'Kfz'

4. setBundeslandFilter(bundeslaender) - Filtert nach Bundesländern

5. clearAllFilters() - Setzt alle Filter zurück

6. showTopAgenturen(anzahl, sortBy) - Zeigt Top N Vermittler in Tabellenansicht
   - Beispiel: showTopAgenturen(5, 'neugeschaeft') für Top 5 nach Neugeschäft
   - Verfügbare sortBy: 'neugeschaeft', 'bestand', 'ergebnis', 'deckungsbeitrag'
   - Wechselt automatisch zur Tabelle und wählt Top N Agenturen aus
   - Nutze diese Funktion bei Fragen wie "Zeige Top 5 Vermittler"

7. showAgenturOverview(vermittler_id) - NEU! Zeigt detaillierte Agentur-Übersichtsseite
   - Beispiel: showAgenturOverview('VM00001') für Maria Musterfrau
   - Zeigt: Stammdaten, Foto, KPI-Dashboard mit Balken, Vertragshistorie
   - Nutze diese Funktion bei Fragen wie:
     * "Übersicht Agentur Maria Musterfrau"
     * "Zeige mir Details zu VM00001"
     * "Agentur-Profil von Maria Musterfrau"
   - WICHTIG: Verwende IMMER die Vermittler-ID, nicht den Namen!

WICHTIG beim Filtern:
- Nenne die Funktion GENAU so in deiner Antwort: setAgenturFilter('VM00001')
- Verwende für Agenturen IMMER die ID aus der Datenliste
- SAG DEM USER: "Ich setze jetzt den Filter und analysiere dann die Daten..."
- Die Analyse erfolgt dann automatisch mit den gefilterten Daten

WICHTIG bei Analysen:
- Nutze die bereitgestellten Daten aus dem Kontext
- Berechne Summen/Durchschnitte aus den echten Zahlen
- Formatiere große Zahlen lesbar (z.B. "€45.2 Mio")
- Sei präzise und konkret
- Antworte auf Deutsch und sei freundlich`;

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
    const headers = {
        "Content-Type": "application/json"
    };

    if (!window.USE_WORKER) {
        headers["x-api-key"] = getClaudeApiKey();
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
    console.log('VOLLSTAENDIGE API-Antwort:', assistantMessage);

    hideTyping();

    // Check if response contains filter commands and process them
    const filterWasSet = await processFilterCommands(assistantMessage);

    // Add suggestions if no filter was triggered (filters add their own suggestions)
    if (!filterWasSet) {
        const suggestions = getSalesChatSuggestions('default');
        addMessage('assistant', assistantMessage + suggestions);
    } else {
        addMessage('assistant', assistantMessage);
    }

    // FALLBACK: Wenn KI keine showTopAgenturen() Funktion nutzte, prüfe User-Message
    if (!filterWasSet && message.toLowerCase().match(/top\s+(\d+)/)) {
        console.log('FALLBACK: Erkenne "Top X" direkt aus User-Message');
        const match = message.toLowerCase().match(/top\s+(\d+)/);
        const topN = parseInt(match[1]);

        // Erkenne KPI aus Message
        let sortBy = 'neugeschaeft';  // Default
        if (message.toLowerCase().includes('ergebnis')) sortBy = 'ergebnis';
        else if (message.toLowerCase().includes('bestand')) sortBy = 'bestand';
        else if (message.toLowerCase().includes('deckungsbeitrag')) sortBy = 'deckungsbeitrag';

        console.log(`Fuehre direkt aus: showTopAgenturen(${topN}, '${sortBy}')`);
        showTopAgenturen(topN, sortBy);
    }
    
    // Add to history
    chatHistory.push(
        { role: 'user', content: message },
        { role: 'assistant', content: assistantMessage }
    );
}

// Get context about current data
function getDataContext() {
    if (!dailyRawData || dailyRawData.length === 0) {
        console.error('getDataContext: dailyRawData ist leer oder null!');
        return "Keine Daten geladen.";
    }

    console.log('getDataContext: dailyRawData hat', dailyRawData.length, 'Zeilen');
    console.log('Aktuelle Filter:', JSON.stringify(state.filters));

    const agenturen = getAgenturen();
    const bundeslaender = [...new Set(dailyRawData.map(r => r.bundesland))].filter(Boolean);
    const silos = [...new Set(dailyRawData.map(r => r.silo))].filter(Boolean);
    const segments = [...new Set(dailyRawData.map(r => r.segment))].filter(Boolean);

    // Calculate some basic stats from FILTERED data
    const filteredData = getFilteredData();

    console.log('getFilteredData() lieferte', filteredData.length, 'Monate');

    // WICHTIG: Wenn gefilterte Daten leer sind, gib hilfreiche Meldung zurück
    if (filteredData.length === 0) {
        console.warn('Gefilterte Daten sind leer! Filter:', JSON.stringify(state.filters));

        // Finde heraus, welcher Filter das Problem verursacht
        let filterInfo = '';
        if (state.filters.agentur !== 'alle') {
            const agentExists = agenturen.find(a => a.id === state.filters.agentur);
            if (!agentExists) {
                filterInfo = `Der Vermittler "${state.filters.agentur}" existiert nicht in den Daten!\n\nVerfügbare Vermittler:\n`;
                filterInfo += agenturen.slice(0, 10).map(a => `  - ${a.id}: ${a.name}`).join('\n');
                if (agenturen.length > 10) {
                    filterInfo += `\n  ... und ${agenturen.length - 10} weitere`;
                }
            } else {
                filterInfo = `Der Vermittler "${state.filters.agentur}" existiert, aber es gibt keine Daten für die aktuelle Filterkombination.`;
            }
        } else {
            filterInfo = `Keine Daten für die aktuelle Filterkombination gefunden.`;
        }

        return `
Datensatz: ${dailyRawData.length} Zeilen (Tagesdaten) verfügbar
Agenturen: ${agenturen.length} verfügbar

PROBLEM: ${filterInfo}

AKTUELLE FILTER:
- Jahr: ${state.filters.year}
- Agentur: ${state.filters.agentur === 'alle' ? 'Alle' : state.filters.agentur}
- Silo: ${state.filters.silo}
- Segment: ${state.filters.segments.join(', ')}

HINWEIS AN ASSISTENT:
Erkläre dem User freundlich, dass für diese Filterkombination keine Daten vorliegen.
Schlage vor, den Filter anzupassen oder zurückzusetzen.
`;
    }

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
    
    // Check if specific agent is filtered
    let specificAgentData = '';
    if (state.filters.agentur !== 'alle') {
        const agentData = getAgenturData(state.filters.agentur);
        if (agentData) {
            specificAgentData = `

GEFILTERTE AGENTUR-DATEN (${agentData.agentur} - ${agentData.agentur_name}):
- Neugeschäft YTD: €${(agentData.neugeschaeft / 1000000).toFixed(2)} Mio
- Bestand: €${(agentData.bestand / 1000000).toFixed(2)} Mio
- Stornoquote: ${agentData.storno.toFixed(2)}%
- NPS Score: ${agentData.nps.toFixed(1)}
- Risikoscore: ${agentData.risiko.toFixed(1)}
- Combined Ratio: ${agentData.combined.toFixed(1)}%
- Ergebnis: €${(agentData.ergebnis / 1000).toFixed(0)}k
- Underwriting Qualität: ${agentData.underwriting.toFixed(1)}%
- Deckungsbeitrag: €${(agentData.deckungsbeitrag / 1000).toFixed(0)}k
${agentData.bundesland ? `- Bundesland: ${agentData.bundesland}` : ''}
${agentData.silo ? `- Silo: ${agentData.silo}` : ''}
`;
        } else {
            console.warn('getAgenturData() lieferte null fuer Agentur:', state.filters.agentur);
        }
    }
    
    return `
Datensatz: ${dailyRawData.length} Zeilen (Tagesdaten)
Agenturen: ${agenturen.length} verfügbar

WICHTIG - Vermittler-IDs (verwende diese für Filter!):
${agentList}
${agenturen.length > 10 ? `  ... und ${agenturen.length - 10} weitere` : ''}

Bundesländer: ${bundeslaender.join(', ')}
Silos: ${silos.join(', ')}
Segmente: ${segments.join(', ')}

AKTUELLE FILTER-EINSTELLUNGEN:
- Jahr: ${state.filters.year}
- Agentur: ${state.filters.agentur === 'alle' ? 'Alle' : state.filters.agentur}
- Silo: ${state.filters.silo}
- Segment: ${state.filters.segments.join(', ')}
- Bundesländer: ${state.selectedStates.size > 0 ? Array.from(state.selectedStates).join(', ') : 'Alle'}

AGGREGIERTE DATEN (basierend auf aktuellen Filtern):
- Gesamt Neugeschäft YTD: €${(totalNeugeschaeft / 1000000).toFixed(1)} Mio
- Durchschnitt Stornoquote: ${avgStorno.toFixed(2)}%
- Durchschnitt NPS: ${avgNPS.toFixed(1)}
- Gesamt Ergebnis: €${(totalErgebnis / 1000).toFixed(0)}k
- Aktueller Bestand: €${(currentBestand / 1000000).toFixed(1)} Mio
- Anzahl Monate mit Daten: ${filteredData.length}
${specificAgentData}
`;
}

// Process filter commands in response - VERBESSERT mit Auto-Analyse + Agentur-Übersicht!
async function processFilterCommands(message) {
    console.log('Pruefe Filter-Befehle in Antwort...');
    console.log('Message to parse:', message.substring(0, 300));

    let filterWasSet = false;
    let filterInfo = null;

    // NEU: Check for Agentur Overview Command
    const overviewMatch = message.match(/showAgenturOverview\(['"]([^'"]+)['"]\)/);
    if (overviewMatch) {
        const vermittlerId = overviewMatch[1];
        console.log('Gefunden: showAgenturOverview fuer', vermittlerId);

        if (typeof showAgenturOverview === 'function') {
            showAgenturOverview(vermittlerId);
            return true; // Early return, keine weiteren Filter
        } else {
            console.error('showAgenturOverview Funktion nicht verfuegbar!');
        }
    }
    
    // Check for Agentur filter
    if (message.includes('setAgenturFilter')) {
        const match = message.match(/setAgenturFilter\(['"](.+?)['"]\)/);
        if (match) {
            let value = match[1];
            console.log('Gefunden: setAgenturFilter mit Wert:', value);
            
            // Wenn es ein Name ist, konvertiere zu ID
            const agenturen = getAgenturen();
            const byName = agenturen.find(a => 
                a.name && a.name.toLowerCase() === value.toLowerCase()
            );
            
            if (byName) {
                console.log('Name zu ID konvertiert:', value, '->', byName.id);
                value = byName.id;
            }
            
            setAgenturFilter(value);
            filterWasSet = true;
            
            const agentInfo = agenturen.find(a => a.id === value);
            const displayName = agentInfo ? 
                `${agentInfo.id} - ${agentInfo.name}` : 
                value;
            
            filterInfo = {
                type: 'agentur',
                value: value,
                displayName: displayName
            };
        }
    }
    
    // Check for Silo filter
    if (message.includes('setSiloFilter')) {
        const match = message.match(/setSiloFilter\(['"](.+?)['"]\)/);
        if (match) {
            console.log('Gefunden: setSiloFilter mit Wert:', match[1]);
            setSiloFilter(match[1]);
            filterWasSet = true;
            
            filterInfo = {
                type: 'silo',
                value: match[1]
            };
        }
    }
    
    // Check for Segment filter
    if (message.includes('setSegmentFilter')) {
        const match = message.match(/setSegmentFilter\(\[?['"](.+?)['"]\]?\)/);
        if (match) {
            console.log('Gefunden: setSegmentFilter mit Wert:', match[1]);
            const segments = match[1].split(',').map(s => s.trim().replace(/['"]/g, ''));
            setSegmentFilter(segments);
            filterWasSet = true;
            
            filterInfo = {
                type: 'segment',
                value: segments.join(', ')
            };
        }
    }
    
    // Check for clear filters
    if (message.includes('clearAllFilters')) {
        console.log('Gefunden: clearAllFilters');
        clearAllFilters();
        filterWasSet = true;

        filterInfo = {
            type: 'clear'
        };
    }

    // NEU: Check for showTopAgenturen - direkt oder implizit (VERBESSERTER PARSER)
    const topMatch = message.match(/showTopAgenturen\((\d+)(?:,\s*['"](\w+)['"])?\)|top\s*(\d+)\s*(vermittler|agenturen|nach)/i);
    if (topMatch) {
        const topN = parseInt(topMatch[1] || topMatch[3] || '5');
        let sortBy = topMatch[2] || 'neugeschaeft';

        // Erkenne KPI aus Text, falls nicht explizit angegeben
        if (!topMatch[2]) {
            if (message.toLowerCase().includes('ergebnis')) sortBy = 'ergebnis';
            else if (message.toLowerCase().includes('bestand')) sortBy = 'bestand';
            else if (message.toLowerCase().includes('deckungsbeitrag')) sortBy = 'deckungsbeitrag';
            else if (message.toLowerCase().includes('neugeschäft')) sortBy = 'neugeschaeft';
        }

        console.log(`Gefunden: Top ${topN} Agenturen nach ${sortBy}`);
        console.log('Match details:', topMatch);

        showTopAgenturen(topN, sortBy);
        filterWasSet = true;

        filterInfo = {
            type: 'topAgenturen',
            topN: topN,
            sortBy: sortBy
        };
    }

    // DEBUG: Log ob etwas gefunden wurde
    if (!filterWasSet) {
        console.log('Keine Filter-Befehle gefunden in der Antwort');
    }

    // If a filter was set, automatically trigger analysis
    if (filterWasSet && filterInfo) {
        console.log('Filter wurde gesetzt - starte automatische Analyse...');
        
        // Show confirmation
        setTimeout(() => {
            let confirmationMessage = '';
            
            if (filterInfo.type === 'agentur') {
                confirmationMessage = `**Filter aktiv:** Dashboard zeigt jetzt nur Daten von ${filterInfo.displayName}`;
            } else if (filterInfo.type === 'silo') {
                confirmationMessage = `**Filter aktiv:** Dashboard zeigt jetzt nur ${filterInfo.value}-Daten`;
            } else if (filterInfo.type === 'segment') {
                confirmationMessage = `**Filter aktiv:** Dashboard zeigt jetzt nur ${filterInfo.value}-Segmente`;
            } else if (filterInfo.type === 'clear') {
                confirmationMessage = `**Alle Filter zurückgesetzt:** Dashboard zeigt wieder alle Daten`;
            } else if (filterInfo.type === 'topAgenturen') {
                confirmationMessage = `**Tabellen-Ansicht:** Zeige die Top ${filterInfo.topN} Vermittler nach ${filterInfo.sortBy}`;
                // Add follow-up suggestions
                const suggestions = getSalesChatSuggestions('topAgenturen');
                addMessage('assistant', confirmationMessage + suggestions);
                return;  // Early return - no need for auto-analysis
            }
            
            addMessage('assistant', confirmationMessage);
            
            // Wait a bit then send analysis request
            setTimeout(async () => {
                showTyping();

                try {
                    // Get fresh filtered context
                    const filteredContext = getDataContext();

                    console.log('DEBUG: Filtered Context wird gesendet:');
                    console.log('Context Laenge:', filteredContext.length);
                    console.log('Context erste 500 Zeichen:', filteredContext.substring(0, 500));
                    console.log('Aktuelle Filter:', JSON.stringify(state.filters));

                    // Send analysis request
                    const systemPrompt = `Du bist ein KI-Assistent für ein Versicherungs-Dashboard. Analysiere die gefilterten Daten und gib konkrete Insights.`;

                    const messages = [
                        {
                            role: 'user',
                            content: `GEFILTERTE DATEN:
${filteredContext}

Analysiere diese Daten und gib eine detaillierte Performance-Bewertung. Berechne konkrete Kennzahlen und gib Insights zu:
- Neugeschäft und Bestand
- Stornoquote und was sie bedeutet
- NPS Score und Kundenzufriedenheit
- Ergebnis und Profitabilität
- Vergleich mit Durchschnittswerten wenn möglich

Formatiere große Zahlen lesbar (z.B. "€45.2 Mio") und sei konkret mit den echten Zahlen aus den Daten.`
                        }
                    ];

                    const apiUrl = window.USE_WORKER ? window.CLAUDE_WORKER_URL : "https://api.anthropic.com/v1/messages";
                    const headers = { "Content-Type": "application/json" };
                    if (!window.USE_WORKER) {
                        headers["x-api-key"] = getClaudeApiKey();
                        headers["anthropic-version"] = "2023-06-01";
                        headers["anthropic-dangerous-direct-browser-access"] = "true";
                    }

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
                        throw new Error(`API request failed: ${response.status}`);
                    }

                    const data = await response.json();
                    const analysisMessage = data.content[0].text;

                    hideTyping();
                    // Add follow-up suggestions after analysis
                    const suggestions = getSalesChatSuggestions('filter');
                    addMessage('assistant', analysisMessage + suggestions);

                } catch (error) {
                    console.error('Analyse Fehler:', error);
                    hideTyping();
                    const suggestions = getSalesChatSuggestions('default');
                    addMessage('assistant', 'Fehler bei der Datenanalyse. Bitte versuche es erneut.' + suggestions);
                }
            }, 500);
            
        }, 100);
    }
    
    return filterWasSet;
}

// Filter functions
function setAgenturFilter(vermittlerId) {
    // WICHTIG: Erst alle anderen Filter zurücksetzen (außer Jahr)!
    const currentYear = state.filters.year;

    state.filters = {
        year: currentYear,
        agentur: vermittlerId,  // Neuer Agentur-Filter
        silo: 'alle',
        segments: ['alle'],     // WICHTIG: ['alle'] nicht []
        products: ['alle'],
        bundeslaender: []
    };

    // Leere Bundesland-Auswahl
    state.selectedStates.clear();

    // Update UI
    updateAgenturFilterDisplay();
    document.getElementById('siloFilter').value = 'alle';
    updateSegmentDisplay();
    updateMapSelection();
    updateAllKPIs();

    console.log('Alle Filter zurueckgesetzt, Agentur-Filter gesetzt:', vermittlerId);
}

function setSiloFilter(silo) {
    state.filters.silo = silo;
    document.getElementById('siloFilter').value = silo;
    updateAllKPIs();
    console.log('Filter gesetzt: Silo =', silo);
}

function setSegmentFilter(segments) {
    state.filters.segments = Array.isArray(segments) ? segments : [segments];
    updateSegmentDisplay();
    updateAllKPIs();
    console.log('Filter gesetzt: Segment =', segments);
}

function setBundeslandFilter(bundeslaender) {
    state.selectedStates.clear();
    bundeslaender.forEach(land => state.selectedStates.add(land));
    updateMapSelection();
    updateAllKPIs();
    console.log('Filter gesetzt: Bundesland =', bundeslaender);
}

function clearAllFilters() {
    state.filters.agentur = 'alle';
    state.filters.silo = 'alle';
    state.filters.segments = ['alle'];
    state.filters.products = ['alle'];
    state.selectedStates.clear();

    updateAgenturFilterDisplay();
    document.getElementById('siloFilter').value = 'alle';
    updateSegmentDisplay();
    updateMapSelection();
    updateAllKPIs();

    // Entferne KI-Analyse-Spalte falls vorhanden
    removeAnomalyColumn();

    console.log('Alle Filter zurückgesetzt');
}

// NEU: Show Top N Agenturen in Table View
function showTopAgenturen(topN = 5, sortBy = 'neugeschaeft') {
    console.log(`Zeige Top ${topN} Agenturen nach ${sortBy}`);

    // 1. Wechsel zur Tabellenansicht mit existierender Funktion
    if (typeof switchView === 'function') {
        switchView('table');
    } else {
        // Fallback falls switchView nicht verfügbar
        state.currentView = 'table';
        const dashboardView = document.getElementById('dashboardView');
        const tableView = document.getElementById('tableView');
        if (dashboardView) dashboardView.style.display = 'none';
        if (tableView) tableView.classList.add('active');
    }

    // 2. Wechsel zum Agentur-Tab
    state.currentTableView = 'agentur';
    document.querySelectorAll('.table-view-toggle button').forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.tableView === 'agentur') {
            btn.classList.add('active');
        }
    });

    // 3. Ermittle Top N Agenturen
    const allAgenturen = getAgenturenData();
    if (allAgenturen.length === 0) {
        console.warn('Keine Agenturen gefunden');
        return;
    }

    // Sortiere nach gewünschtem KPI
    allAgenturen.sort((a, b) => (b[sortBy] || 0) - (a[sortBy] || 0));

    // Nimm Top N
    const topAgenturen = allAgenturen.slice(0, topN);

    // 4. Wähle diese Agenturen aus
    state.selectedAgenturen.clear();
    topAgenturen.forEach(agentur => {
        state.selectedAgenturen.add(agentur.agentur);
    });

    // 5. Setze Sortierung auf das gewählte KPI (absteigend)
    state.tableSort = {
        column: sortBy,
        direction: 'desc'
    };

    // 6. Rendere Tabelle
    if (typeof renderTable === 'function') {
        renderTable();
    }

    console.log(`Top ${topN} Agenturen ausgewählt:`, Array.from(state.selectedAgenturen));
}

// Zeigt auffällige Vermittler mit KI-Erklärungen
function showAnomalyAgenturen() {
    console.log('Zeige auffällige Vermittler mit KI-Analyse');

    // Mock-Daten für auffällige Vermittler mit KI-Erklärungen
    const anomalyData = {
        'VM00089': {
            reason: 'Hohe Stornoquote',
            analysis: 'Stornoquote 18.2% liegt deutlich über dem Durchschnitt von 7.5%. Hauptursache: 68% der Stornos im Kfz-Bereich, vermutlich durch aggressive Neukundenakquise mit unzureichender Bedarfsanalyse.'
        },
        'VM00156': {
            reason: 'Hohe Stornoquote',
            analysis: 'Stornoquote 15.8% auffällig hoch. Kundenstruktur zeigt hohen Anteil an Einsteigertarifen. Empfehlung: Cross-Selling-Quote erhöhen und Kundenbindungsmaßnahmen verstärken.'
        },
        'VM00203': {
            reason: 'Niedriger NPS',
            analysis: 'NPS Score 28 liegt 14 Punkte unter Durchschnitt. Analyse der Kundenfeedbacks zeigt Beschwerden über Erreichbarkeit und Reaktionszeiten. Schulungsbedarf im Kundenservice.'
        },
        'VM00078': {
            reason: 'Bestandsrückgang',
            analysis: 'Bestand -12% YoY. Wettbewerbsanalyse zeigt verstärkte Aktivität von Direktversicherern in der Region. Handlungsempfehlung: Proaktive Kundenansprache und Tarifoptimierung.'
        }
    };

    // 1. Wechsel zur Tabellenansicht
    if (typeof switchView === 'function') {
        switchView('table');
    } else {
        state.currentView = 'table';
        const dashboardView = document.getElementById('dashboardView');
        const tableView = document.getElementById('tableView');
        if (dashboardView) dashboardView.style.display = 'none';
        if (tableView) tableView.classList.add('active');
    }

    // 2. Wechsel zum Agentur-Tab
    state.currentTableView = 'agentur';
    document.querySelectorAll('.table-view-toggle button').forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.tableView === 'agentur') {
            btn.classList.add('active');
        }
    });

    // 3. Wähle die auffälligen Vermittler aus
    const anomalyIds = Object.keys(anomalyData);
    state.selectedAgenturen.clear();
    anomalyIds.forEach(id => {
        state.selectedAgenturen.add(id);
    });

    // 4. Speichere Anomalie-Daten für Tabellen-Rendering
    window.currentAnomalyData = anomalyData;

    // 5. Rendere Tabelle mit KI-Spalte
    if (typeof renderTable === 'function') {
        renderTable();
    }

    // 6. Füge KI-Analyse-Spalte hinzu (nach kurzer Verzögerung für DOM)
    setTimeout(() => {
        addAnomalyColumn(anomalyData);
    }, 100);

    console.log('Auffällige Vermittler ausgewählt:', anomalyIds);
}

// Fügt KI-Analyse-Spalte zur Tabelle hinzu
function addAnomalyColumn(anomalyData) {
    const table = document.querySelector('#tableView table, .agentur-table');
    if (!table) {
        console.log('Tabelle nicht gefunden');
        return;
    }

    // Prüfe ob Spalte bereits existiert
    if (table.querySelector('.ki-analysis-col')) {
        return;
    }

    // Header hinzufügen
    const headerRow = table.querySelector('thead tr');
    if (headerRow) {
        const th = document.createElement('th');
        th.className = 'ki-analysis-col';
        th.innerHTML = 'KI-Analyse';
        th.style.cssText = 'min-width: 250px; background: #f0fdf4; color: #166534;';
        headerRow.appendChild(th);
    }

    // Zellen für jede Zeile hinzufügen
    const bodyRows = table.querySelectorAll('tbody tr');
    bodyRows.forEach(row => {
        const firstCell = row.querySelector('td');
        if (!firstCell) return;

        // Extrahiere Vermittler-ID aus erster Zelle
        const cellText = firstCell.textContent || '';
        const vmMatch = cellText.match(/VM\d+/);
        const vmId = vmMatch ? vmMatch[0] : null;

        const td = document.createElement('td');
        td.className = 'ki-analysis-col';

        if (vmId && anomalyData[vmId]) {
            const data = anomalyData[vmId];
            td.innerHTML = `
                <div style="font-size: 11px; line-height: 1.4;">
                    <strong style="color: #dc2626;">${data.reason}</strong><br>
                    <span style="color: #475569;">${data.analysis}</span>
                </div>
            `;
            td.style.cssText = 'background: #fef2f2; padding: 8px; max-width: 300px;';
        } else {
            td.innerHTML = '-';
            td.style.color = '#9ca3af';
        }

        row.appendChild(td);
    });

    console.log('KI-Analyse-Spalte hinzugefügt');
}

// Entfernt KI-Analyse-Spalte (bei Filter-Reset)
function removeAnomalyColumn() {
    const cols = document.querySelectorAll('.ki-analysis-col');
    cols.forEach(col => col.remove());
    window.currentAnomalyData = null;
}

// UI functions
function addMessage(role, content) {
    const chatBody = document.getElementById('chatBody');

    // Remove welcome message if exists
    const welcome = chatBody.querySelector('.chat-welcome');
    if (welcome) {
        welcome.remove();
    }

    const messageDiv = document.createElement('div');
    messageDiv.className = `chat-message ${role}`;

    const avatar = document.createElement('div');
    avatar.className = 'chat-avatar';
    avatar.innerHTML = role === 'user'
        ? '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>'
        : '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z"></path></svg>';

    const bubble = document.createElement('div');
    bubble.className = 'chat-bubble';

    // Bereinige technische Funktionsaufrufe aus der Antwort
    let cleanedContent = cleanTechnicalContent(content);

    // Format content (basic markdown support)
    let formattedContent = cleanedContent
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/`(.*?)`/g, '<code>$1</code>')
        .replace(/\n/g, '<br>');

    bubble.innerHTML = formattedContent;

    messageDiv.appendChild(avatar);
    messageDiv.appendChild(bubble);

    chatBody.appendChild(messageDiv);
    chatBody.scrollTop = chatBody.scrollHeight;
}

// Entfernt technische Funktionsaufrufe und Code-Blöcke aus der Antwort
function cleanTechnicalContent(content) {
    let cleaned = content;

    // Entferne Code-Blöcke mit ```plaintext, ```javascript, etc.
    cleaned = cleaned.replace(/```(?:plaintext|javascript|js)?\s*\n?[\s\S]*?```/g, '');

    // Entferne einzelne Funktionsaufrufe wie showTopAgenturen(5, 'neugeschaeft')
    cleaned = cleaned.replace(/\b(showTopAgenturen|setAgenturFilter|setSiloFilter|setSegmentFilter|setBundeslandFilter|clearAllFilters|showAgenturOverview)\s*\([^)]*\)/g, '');

    // Entferne "Ich setze dafür die entsprechende Funktion ein" etc.
    cleaned = cleaned.replace(/Ich setze dafür die entsprechende Funktion ein[^.]*\./gi, '');
    cleaned = cleaned.replace(/Ich werde.*?Funktion.*?ein[setz]*[^.]*\./gi, '');

    // Entferne mehrfache Leerzeilen
    cleaned = cleaned.replace(/\n{3,}/g, '\n\n');

    // Entferne führende/nachfolgende Leerzeichen und Zeilenumbrüche
    cleaned = cleaned.trim();

    return cleaned;
}

function showTyping() {
    const chatBody = document.getElementById('chatBody');
    
    const typingDiv = document.createElement('div');
    typingDiv.className = 'chat-message assistant';
    typingDiv.id = 'typingIndicator';
    
    const avatar = document.createElement('div');
    avatar.className = 'chat-avatar';
    avatar.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z"></path></svg>';

    const typing = document.createElement('div');
    typing.className = 'chat-typing';
    typing.innerHTML = '<span></span><span></span><span></span>';
    
    typingDiv.appendChild(avatar);
    typingDiv.appendChild(typing);
    
    chatBody.appendChild(typingDiv);
    chatBody.scrollTop = chatBody.scrollHeight;
}

function hideTyping() {
    const typing = document.getElementById('typingIndicator');
    if (typing) {
        typing.remove();
    }
}

// ========================================
// v14 FEATURE: Sample Questions
// ========================================
function askSampleQuestion(question) {
    console.log('Sample Question clicked:', question);

    // Check which view is currently visible (not just which elements exist)
    const landingPage = document.getElementById('landingPage');
    const mainApp = document.getElementById('mainApp');
    const chatWidget = document.getElementById('chatWidget');

    const isLandingVisible = landingPage && landingPage.style.display !== 'none';
    const isMainAppVisible = mainApp && mainApp.style.display !== 'none';
    const isChatWidgetVisible = chatWidget && chatWidget.style.display !== 'none';

    const landingChatInput = document.getElementById('landingChatInput');
    const dashboardChatInput = document.getElementById('chatInput');

    // Use dashboard chat if main app is visible OR if chat widget is visible
    if ((isMainAppVisible || isChatWidgetVisible) && dashboardChatInput) {
        // Dashboard Chat
        console.log('Using Dashboard Chat (Main App visible)');

        // Verstecke Welcome Screen
        const welcomeDiv = document.querySelector('.chat-welcome');
        if (welcomeDiv) {
            welcomeDiv.style.display = 'none';
        }

        dashboardChatInput.value = question;

        // Sende die Nachricht
        if (typeof sendMessage === 'function') {
            sendMessage();
        }
    } else if (isLandingVisible && landingChatInput) {
        // Landing Page Chat
        console.log('Using Landing Chat (Landing Page visible)');
        landingChatInput.value = question;

        // Trigger the landing chat send
        if (typeof sendLandingChatMessage === 'function') {
            sendLandingChatMessage();
        } else {
            // Fallback: click the send button
            const sendBtn = document.getElementById('landingChatSend');
            if (sendBtn) sendBtn.click();
        }
    } else {
        console.error('Kein sichtbarer Chat gefunden');
    }
}

// Make functions globally available
window.initChat = initChat;
window.setAgenturFilter = setAgenturFilter;
window.setSiloFilter = setSiloFilter;
window.setSegmentFilter = setSegmentFilter;
window.setBundeslandFilter = setBundeslandFilter;
window.clearAllFilters = clearAllFilters;
window.askSampleQuestion = askSampleQuestion;
window.showAnomalyAgenturen = showAnomalyAgenturen;
window.removeAnomalyColumn = removeAnomalyColumn;

console.log('chat.js geladen - initChat() ist verfuegbar');
window.__registerModule('chat.js');