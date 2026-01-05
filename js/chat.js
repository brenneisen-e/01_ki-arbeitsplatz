// js/chat.js - AI Chat Logic with Claude API (mit automatischer Datenanalyse nach Filtern)

let chatHistory = [];
let isProcessing = false;
let chatInitialized = false;

// ⚠️ CONFIGURATION - Claude API via Cloudflare Worker
window.CLAUDE_WORKER_URL = 'https://vst-claude-api.eike-3e2.workers.dev';
window.CLAUDE_MODEL = 'claude-haiku-4-5-20251001';

// Fallback: API-Key aus localStorage (falls kein Worker)
function getClaudeApiKey() {
    return localStorage.getItem('claude_api_token') || '';
}

// Prüfe ob Worker oder direkter Zugriff verwendet wird
window.USE_WORKER = window.CLAUDE_WORKER_URL !== '';

// Mock-Modus nur wenn weder Worker noch API-Key vorhanden
function shouldUseMockMode() {
    return !window.USE_WORKER && !getClaudeApiKey();
}

let USE_MOCK_MODE = shouldUseMockMode();

// Initialize chat widget
function initChat() {
    // ✨ v15: Prevent multiple initializations
    if (chatInitialized) {
        console.log('⚠️ Chat bereits initialisiert, überspringe...');
        return;
    }

    console.log('🤖 initChat() aufgerufen');
    console.log('📊 dailyRawData verfügbar:', dailyRawData ? dailyRawData.length + ' Zeilen' : 'NICHT VERFÜGBAR');

    const chatWidget = document.getElementById('chatWidget');
    const chatToggle = document.getElementById('chatToggle');

    if (!chatWidget || !chatToggle) {
        console.error('❌ Chat Elemente nicht gefunden im DOM!');
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
        console.error('❌ Chat Input-Elemente nicht gefunden!');
        return;
    }

    // ✨ v15: Mark as initialized
    chatInitialized = true;

    // Toggle chat
    chatToggle.addEventListener('click', () => {
        console.log('💬 Chat Toggle geklickt');
        chatWidget.style.display = 'flex';
        chatToggle.style.display = 'none';
        chatWidget.classList.remove('minimized'); // ✨ v15: Ensure not minimized when opened
        chatInput.focus();
    });

    // Close chat
    chatClose.addEventListener('click', () => {
        console.log('❌ Chat geschlossen');
        chatWidget.style.display = 'none';
        chatToggle.style.display = 'flex';
        chatWidget.classList.remove('minimized'); // ✨ v15: Reset minimized state
    });

    // Minimize chat
    chatMinimize.addEventListener('click', () => {
        console.log('➖ Chat minimiert/maximiert');
        const isMinimized = chatWidget.classList.toggle('minimized');
        console.log('📐 Minimized state:', isMinimized);
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
        console.log('✅ CSV Daten vorhanden - Chat wird aktiviert');
        chatToggle.style.display = 'flex';
        chatWidget.style.display = 'flex';

        // Auto-hide toggle, show widget after 1 second
        setTimeout(() => {
            console.log('🎯 Chat Toggle ausgeblendet, Widget angezeigt');
            chatToggle.style.display = 'none';
        }, 1000);

        // Show API warning if needed
        if (shouldUseMockMode()) {
            addMessage('assistant', '⚠️ **Mock-Modus aktiv** - Claude AI ist über den Worker konfiguriert.\n\nStelle trotzdem gerne Fragen - ich zeige dir wie die Integration funktioniert!');
        }
    } else {
        console.log('ℹ️ Keine CSV Daten - Chat bleibt verborgen bis Daten geladen werden');
        // Chat ist initialisiert, aber versteckt
        chatToggle.style.display = 'none';
        chatWidget.style.display = 'none';
    }

    console.log('✅ Chat erfolgreich initialisiert!');
}

// Activate chat when data is loaded (call this after CSV upload)
function activateChat() {
    const chatToggle = document.getElementById('chatToggle');
    const chatWidget = document.getElementById('chatWidget');

    if (chatToggle && chatWidget) {
        console.log('✅ Chat wird aktiviert (Daten wurden geladen)');
        chatToggle.style.display = 'flex';
        chatWidget.style.display = 'flex';

        setTimeout(() => {
            chatToggle.style.display = 'none';
        }, 1000);
    }
}

// Make activateChat globally available
window.activateChat = activateChat;

// Send message to Claude (or Mock)
async function sendMessage() {
    const chatInput = document.getElementById('chatInput');
    const message = chatInput.value.trim();
    
    console.log('📤 Nachricht senden:', message);
    
    if (!message || isProcessing) {
        console.log('⚠️ Leere Nachricht oder bereits in Verarbeitung');
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
        console.log('🔑 API-Key Status:', useMock ? 'MOCK-MODUS' : 'API-MODUS AKTIV');

        if (useMock) {
            // Mock response for testing
            console.log('🎭 Mock-Modus - Generiere Test-Antwort');
            await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate delay
            const mockResponse = generateMockResponse(message);
            hideTyping();
            addMessage('assistant', mockResponse);
        } else {
            // Real API call
            console.log('🚀 Rufe Claude API auf...');
            await sendToClaude(message);
        }
        
    } catch (error) {
        console.error('❌ Chat Fehler:', error);
        hideTyping();
        addMessage('assistant', '❌ Entschuldigung, es gab einen Fehler bei der Verarbeitung deiner Anfrage. Bitte versuche es erneut.');
    }
    
    isProcessing = false;
}

// Generate mock response for testing
function generateMockResponse(message) {
    const lowerMessage = message.toLowerCase();
    
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
    
    // Top 10%+ bei KV
    if (lowerMessage.includes('10%') || (lowerMessage.includes('beste') && lowerMessage.includes('kv'))) {
        return `💯 **Top-Performer bei Krankenversicherung (>10% über Durchschnitt):**

1. **VM00042 - Julia Schneider** (+18.3%)
   - Neugeschäft KV: €125k | Storno: 4.2%
   
2. **VM00087 - Thomas Weber** (+15.7%)
   - Neugeschäft KV: €118k | Storno: 5.1%
   
3. **VM00153 - Sandra Hoffmann** (+14.2%)
   - Neugeschäft KV: €112k | Storno: 4.8%
   
4. **VM00201 - Michael Klein** (+12.9%)
   - Neugeschäft KV: €108k | Storno: 5.3%
   
5. **VM00312 - Anna Becker** (+11.4%)
   - Neugeschäft KV: €103k | Storno: 5.7%

📈 **Durchschnitt:** €92k Neugeschäft KV
🎯 **Gemeinsame Erfolgsfaktoren:** Niedrige Stornoquoten, Fokus auf Zusatzversicherungen

💡 *Mit einem API-Key würde ich die echten Daten analysieren!*`;
    }
    
    // Vergleich Bundesländer
    if (lowerMessage.includes('vergleich') || lowerMessage.includes('vs')) {
        return `⚖️ **Vergleich Baden-Württemberg vs Bayern:**

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

🏆 **Winner:** BW bei Storno & NPS, Bayern bei Volumen

💡 *Mit einem API-Key würde ich detaillierte Analysen der CSV-Daten machen!*`;
    }
    
    // Bester NPS
    if (lowerMessage.includes('nps') && lowerMessage.includes('beste')) {
        return `⭐ **Bundesländer mit bestem NPS Score:**

1. 🥇 **Hamburg** - NPS: 82
2. 🥈 **Baden-Württemberg** - NPS: 79
3. 🥉 **Bayern** - NPS: 76
4. **Hessen** - NPS: 74
5. **Nordrhein-Westfalen** - NPS: 72

📊 **Bundesweiter Durchschnitt:** NPS 68

🎯 **Insights:** Starke Stadtstaaten performen überdurchschnittlich

💡 *Mit einem API-Key würde ich die echten NPS-Daten aus deiner CSV analysieren!*`;
    }
    
    // Top performers
    if (lowerMessage.includes('top') || lowerMessage.includes('beste')) {
        const agenturen = getAgenturen().slice(0, 5);
        return `📊 Hier sind die Top 5 Vermittler:\n\n${agenturen.map((a, i) => 
            `${i+1}. **${a.name || a.id}**`
        ).join('\n')}\n\n💡 *Dies ist eine Mock-Antwort. Mit einem API-Key würde ich die tatsächlichen Zahlen analysieren.*`;
    }
    
    // Filter commands
    if (lowerMessage.includes('filter') || lowerMessage.includes('zeig')) {
        if (lowerMessage.includes('max') || lowerMessage.includes('mustermann')) {
            setAgenturFilter('VM00001');
            return `✅ Filter gesetzt auf **Max Mustermann** (VM00001)\n\nDas Dashboard zeigt jetzt nur noch Daten dieser Agentur.`;
        }
        if (lowerMessage.includes('makler')) {
            setSiloFilter('Makler');
            return `✅ Filter gesetzt auf **Makler**\n\nDas Dashboard zeigt jetzt nur noch Makler-Daten.`;
        }
        if (lowerMessage.includes('zurück') || lowerMessage.includes('reset')) {
            clearAllFilters();
            return `✅ Alle Filter wurden zurückgesetzt.\n\nDas Dashboard zeigt wieder alle Daten.`;
        }
    }
    
    // General info
    if (lowerMessage.includes('wie viele') || lowerMessage.includes('anzahl')) {
        const count = dailyRawData ? dailyRawData.length : 0;
        const agentCount = getAgenturen().length;
        return `📊 **Datensatz-Übersicht:**\n\n• ${count.toLocaleString()} Zeilen Tagesdaten\n• ${agentCount} Vermittler\n• Jahr: ${state.filters.year}\n\n💡 *Mit einem API-Key könnte ich detaillierte Analysen durchführen.*`;
    }
    
    // Default response
    return `Ich habe deine Frage verstanden: "${message}"\n\n⚠️ **Mock-Modus aktiv** - Claude AI wird über den Worker konfiguriert.\n\n**Verfügbare Mock-Befehle:**\n• "Zeige Top 5 Vermittler"\n• "Wie ist die Performance von Freiburg?"\n• "Welche Vermittler sind +10% besser bei KV?"\n• "Vergleiche BW vs Bayern"\n• "Welche Bundesländer haben besten NPS?"\n• "Filtere nach Max Mustermann"\n• "Wie viele Daten haben wir?"`;
}

// Send to Claude API (via Worker or direct)
async function sendToClaude(message) {
    console.log('🤖 Sende Anfrage an Claude API...');

    // Prepare context about current data
    const dataContext = getDataContext();

    // System prompt for Claude
    const systemPrompt = `Du bist ein KI-Assistent für ein Versicherungs-Dashboard. Du hast Zugriff auf CSV-Daten und kannst Dashboard-Filter steuern.

VERFÜGBARE FUNKTIONEN:
1. setAgenturFilter(vermittler_id) - Filtert Dashboard nach Agentur
   - Verwende IMMER die Vermittler-ID (z.B. 'VM00001'), NIEMALS den Namen!
   - Beispiel: setAgenturFilter('VM00001') für Max Mustermann
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
   - Beispiel: showAgenturOverview('VM00001') für Max Mustermann
   - Zeigt: Stammdaten, Foto, KPI-Dashboard mit Balken, Vertragshistorie
   - Nutze diese Funktion bei Fragen wie:
     * "Übersicht Agentur Max Mustermann"
     * "Zeige mir Details zu VM00001"
     * "Agentur-Profil von Max Mustermann"
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

    // Build messages array for Claude
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

    // Call Claude API
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
        console.error('❌ Claude API Fehler:', response.status, errorText);
        throw new Error(`API request failed: ${response.status}`);
    }

    const data = await response.json();
    const assistantMessage = data.content[0].text;
    
    console.log('✅ API Antwort erhalten:', assistantMessage.substring(0, 100) + '...');
    console.log('📝 VOLLSTÄNDIGE API-Antwort:', assistantMessage);  // DEBUG

    hideTyping();
    addMessage('assistant', assistantMessage);

    // Check if response contains filter commands and process them
    const filterWasSet = await processFilterCommands(assistantMessage);

    // FALLBACK: Wenn KI keine showTopAgenturen() Funktion nutzte, prüfe User-Message
    if (!filterWasSet && message.toLowerCase().match(/top\s+(\d+)/)) {
        console.log('🔄 FALLBACK: Erkenne "Top X" direkt aus User-Message');
        const match = message.toLowerCase().match(/top\s+(\d+)/);
        const topN = parseInt(match[1]);

        // Erkenne KPI aus Message
        let sortBy = 'neugeschaeft';  // Default
        if (message.toLowerCase().includes('ergebnis')) sortBy = 'ergebnis';
        else if (message.toLowerCase().includes('bestand')) sortBy = 'bestand';
        else if (message.toLowerCase().includes('deckungsbeitrag')) sortBy = 'deckungsbeitrag';

        console.log(`🎯 Führe direkt aus: showTopAgenturen(${topN}, '${sortBy}')`);
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
        console.error('❌ getDataContext: dailyRawData ist leer oder null!');
        return "Keine Daten geladen.";
    }

    console.log('📊 getDataContext: dailyRawData hat', dailyRawData.length, 'Zeilen');
    console.log('📊 Aktuelle Filter:', JSON.stringify(state.filters));

    const agenturen = getAgenturen();
    const bundeslaender = [...new Set(dailyRawData.map(r => r.bundesland))].filter(Boolean);
    const silos = [...new Set(dailyRawData.map(r => r.silo))].filter(Boolean);
    const segments = [...new Set(dailyRawData.map(r => r.segment))].filter(Boolean);

    // Calculate some basic stats from FILTERED data
    const filteredData = getFilteredData();

    console.log('📊 getFilteredData() lieferte', filteredData.length, 'Monate');

    // WICHTIG: Wenn gefilterte Daten leer sind, gib hilfreiche Meldung zurück
    if (filteredData.length === 0) {
        console.warn('⚠️ WARNUNG: Gefilterte Daten sind leer! Filter:', JSON.stringify(state.filters));

        // Finde heraus, welcher Filter das Problem verursacht
        let filterInfo = '';
        if (state.filters.agentur !== 'alle') {
            const agentExists = agenturen.find(a => a.id === state.filters.agentur);
            if (!agentExists) {
                filterInfo = `❌ Der Vermittler "${state.filters.agentur}" existiert nicht in den Daten!\n\nVerfügbare Vermittler:\n`;
                filterInfo += agenturen.slice(0, 10).map(a => `  - ${a.id}: ${a.name}`).join('\n');
                if (agenturen.length > 10) {
                    filterInfo += `\n  ... und ${agenturen.length - 10} weitere`;
                }
            } else {
                filterInfo = `⚠️ Der Vermittler "${state.filters.agentur}" existiert, aber es gibt keine Daten für die aktuelle Filterkombination.`;
            }
        } else {
            filterInfo = `⚠️ Keine Daten für die aktuelle Filterkombination gefunden.`;
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
            console.warn('⚠️ getAgenturData() lieferte null für Agentur:', state.filters.agentur);
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
    console.log('🔍 Prüfe Filter-Befehle in Antwort...');
    console.log('📄 Message to parse:', message.substring(0, 300));  // DEBUG: Erste 300 Zeichen

    let filterWasSet = false;
    let filterInfo = null;

    // NEU: Check for Agentur Overview Command
    const overviewMatch = message.match(/showAgenturOverview\(['"]([^'"]+)['"]\)/);
    if (overviewMatch) {
        const vermittlerId = overviewMatch[1];
        console.log('📊 Gefunden: showAgenturOverview für', vermittlerId);

        if (typeof showAgenturOverview === 'function') {
            showAgenturOverview(vermittlerId);
            return true; // Early return, keine weiteren Filter
        } else {
            console.error('❌ showAgenturOverview Funktion nicht verfügbar!');
        }
    }
    
    // Check for Agentur filter
    if (message.includes('setAgenturFilter')) {
        const match = message.match(/setAgenturFilter\(['"](.+?)['"]\)/);
        if (match) {
            let value = match[1];
            console.log('📊 Gefunden: setAgenturFilter mit Wert:', value);
            
            // Wenn es ein Name ist, konvertiere zu ID
            const agenturen = getAgenturen();
            const byName = agenturen.find(a => 
                a.name && a.name.toLowerCase() === value.toLowerCase()
            );
            
            if (byName) {
                console.log('✅ Name zu ID konvertiert:', value, '→', byName.id);
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
            console.log('📊 Gefunden: setSiloFilter mit Wert:', match[1]);
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
            console.log('📊 Gefunden: setSegmentFilter mit Wert:', match[1]);
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
        console.log('📊 Gefunden: clearAllFilters');
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

        console.log(`📊 Gefunden: Top ${topN} Agenturen nach ${sortBy}`);
        console.log(`📊 Match details:`, topMatch);  // DEBUG

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
        console.log('⚠️ Keine Filter-Befehle gefunden in der Antwort');
    }

    // If a filter was set, automatically trigger analysis
    if (filterWasSet && filterInfo) {
        console.log('✅ Filter wurde gesetzt - starte automatische Analyse...');
        
        // Show confirmation
        setTimeout(() => {
            let confirmationMessage = '';
            
            if (filterInfo.type === 'agentur') {
                confirmationMessage = `✅ **Filter aktiv:** Dashboard zeigt jetzt nur Daten von ${filterInfo.displayName}`;
            } else if (filterInfo.type === 'silo') {
                confirmationMessage = `✅ **Filter aktiv:** Dashboard zeigt jetzt nur ${filterInfo.value}-Daten`;
            } else if (filterInfo.type === 'segment') {
                confirmationMessage = `✅ **Filter aktiv:** Dashboard zeigt jetzt nur ${filterInfo.value}-Segmente`;
            } else if (filterInfo.type === 'clear') {
                confirmationMessage = `✅ **Alle Filter zurückgesetzt:** Dashboard zeigt wieder alle Daten`;
            } else if (filterInfo.type === 'topAgenturen') {
                confirmationMessage = `✅ **Tabellen-Ansicht:** Zeige die Top ${filterInfo.topN} Vermittler nach ${filterInfo.sortBy}`;
                // Skip analysis for topAgenturen - data is already visible in table
                addMessage('assistant', confirmationMessage);
                return;  // Early return - no need for auto-analysis
            }
            
            addMessage('assistant', confirmationMessage);
            
            // Wait a bit then send analysis request
            setTimeout(async () => {
                showTyping();

                try {
                    // Get fresh filtered context
                    const filteredContext = getDataContext();

                    console.log('📊 DEBUG: Filtered Context wird an Claude gesendet:');
                    console.log('📊 Context Länge:', filteredContext.length);
                    console.log('📊 Context erste 500 Zeichen:', filteredContext.substring(0, 500));
                    console.log('📊 Aktuelle Filter:', JSON.stringify(state.filters));

                    // Send analysis request to Claude
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
                    addMessage('assistant', analysisMessage);
                    
                } catch (error) {
                    console.error('❌ Analyse Fehler:', error);
                    hideTyping();
                    addMessage('assistant', '❌ Fehler bei der Datenanalyse. Bitte versuche es erneut.');
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

    console.log('✅ Alle Filter zurückgesetzt, Agentur-Filter gesetzt:', vermittlerId);
}

function setSiloFilter(silo) {
    state.filters.silo = silo;
    document.getElementById('siloFilter').value = silo;
    updateAllKPIs();
    console.log('✅ Filter gesetzt: Silo =', silo);
}

function setSegmentFilter(segments) {
    state.filters.segments = Array.isArray(segments) ? segments : [segments];
    updateSegmentDisplay();
    updateAllKPIs();
    console.log('✅ Filter gesetzt: Segment =', segments);
}

function setBundeslandFilter(bundeslaender) {
    state.selectedStates.clear();
    bundeslaender.forEach(land => state.selectedStates.add(land));
    updateMapSelection();
    updateAllKPIs();
    console.log('✅ Filter gesetzt: Bundesland =', bundeslaender);
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

    console.log('✅ Alle Filter zurückgesetzt');
}

// NEU: Show Top N Agenturen in Table View
function showTopAgenturen(topN = 5, sortBy = 'neugeschaeft') {
    console.log(`📊 Zeige Top ${topN} Agenturen nach ${sortBy}`);

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
    state.currentTableView = 'agenturen';
    document.querySelectorAll('.table-tab-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.view === 'agenturen') {
            btn.classList.add('active');
        }
    });

    // 3. Ermittle Top N Agenturen
    const allAgenturen = getAgenturenData();
    if (allAgenturen.length === 0) {
        console.warn('⚠️ Keine Agenturen gefunden');
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

    console.log(`✅ Top ${topN} Agenturen ausgewählt:`, Array.from(state.selectedAgenturen));
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

    // ✨ v14: Zeige Antwort auch im AI Response Panel
    if (role === 'assistant') {
        showAIResponse(cleanedContent);
    }
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
// ✨ v14 FEATURE: Sample Questions
// ========================================
function askSampleQuestion(question) {
    console.log('📝 Sample Question clicked:', question);

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
        console.log('📝 Using Dashboard Chat (Main App visible)');

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
        console.log('📝 Using Landing Chat (Landing Page visible)');
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
        console.error('❌ Kein sichtbarer Chat gefunden');
    }
}

// ========================================
// ✨ v14 FEATURE: AI Response Panel
// ========================================
function showAIResponse(message) {
    console.log('📊 Show AI Response in Panel');

    const panel = document.getElementById('aiResponsePanel');
    const content = document.getElementById('aiResponseContent');

    if (!panel || !content) {
        console.error('❌ AI Response Panel nicht gefunden');
        return;
    }

    // Formatiere die Nachricht (Markdown-ähnlich)
    const formattedMessage = formatAIMessage(message);

    // Setze den Inhalt
    content.innerHTML = formattedMessage;

    // Zeige das Panel
    panel.style.display = 'block';

    // Scroll to panel
    panel.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

function formatAIMessage(message) {
    // Einfache Markdown-ähnliche Formatierung
    let formatted = message;

    // Überschriften
    formatted = formatted.replace(/^### (.+)$/gm, '<h3>$1</h3>');
    formatted = formatted.replace(/^## (.+)$/gm, '<h2>$1</h2>');
    formatted = formatted.replace(/^# (.+)$/gm, '<h1>$1</h1>');

    // Fett
    formatted = formatted.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');

    // Bullet Points
    formatted = formatted.replace(/^- (.+)$/gm, '<li>$1</li>');
    formatted = formatted.replace(/(<li>.*<\/li>\n?)+/g, '<ul>$&</ul>');

    // Nummerierte Listen
    formatted = formatted.replace(/^\d+\. (.+)$/gm, '<li>$1</li>');

    // Paragraphen (einfache Implementierung)
    const lines = formatted.split('\n');
    const paragraphs = [];
    let currentParagraph = '';

    for (const line of lines) {
        if (line.trim() === '') {
            if (currentParagraph.trim()) {
                // Kein <p> wenn es schon HTML-Tags gibt
                if (!currentParagraph.match(/^<[^>]+>/)) {
                    paragraphs.push('<p>' + currentParagraph + '</p>');
                } else {
                    paragraphs.push(currentParagraph);
                }
                currentParagraph = '';
            }
        } else {
            currentParagraph += line + '\n';
        }
    }

    if (currentParagraph.trim()) {
        if (!currentParagraph.match(/^<[^>]+>/)) {
            paragraphs.push('<p>' + currentParagraph + '</p>');
        } else {
            paragraphs.push(currentParagraph);
        }
    }

    return paragraphs.join('');
}

function hideAIResponse() {
    const panel = document.getElementById('aiResponsePanel');
    if (panel) {
        panel.style.display = 'none';
    }
}

// Initialize AI Response Panel Close Button
function initAIResponsePanel() {
    const closeBtn = document.getElementById('aiResponseClose');
    if (closeBtn) {
        closeBtn.addEventListener('click', hideAIResponse);
    }
}

// Call init on DOM load
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAIResponsePanel);
} else {
    initAIResponsePanel();
}

// Make functions globally available
window.initChat = initChat;
window.setAgenturFilter = setAgenturFilter;
window.setSiloFilter = setSiloFilter;
window.setSegmentFilter = setSegmentFilter;
window.setBundeslandFilter = setBundeslandFilter;
window.clearAllFilters = clearAllFilters;
window.askSampleQuestion = askSampleQuestion;
window.showAIResponse = showAIResponse;
window.hideAIResponse = hideAIResponse;

console.log('✅ chat.js geladen - initChat() ist verfügbar');