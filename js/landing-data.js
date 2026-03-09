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
        'Maria Musterfrau', 'Emma Ludwig', 'Thomas Schneider', 'Anna Fischer',
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
        safeLocalSet('pendingAgenturFilter', vermittlerId);
        console.log('Filter im localStorage gespeichert');
    }
}

function setSiloFilter(silo) {
    console.log('setSiloFilter:', silo);

    if (typeof state !== 'undefined') {
        state.filters.silo = silo;
    } else {
        safeLocalSet('pendingSiloFilter', silo);
    }
}

function setSegmentFilter(segments) {
    console.log('setSegmentFilter:', segments);

    if (typeof state !== 'undefined') {
        state.filters.segments = segments;
    } else {
        safeLocalSet('pendingSegmentFilter', JSON.stringify(segments));
    }
}

function setBundeslandFilter(laender) {
    console.log('setBundeslandFilter:', laender);

    if (typeof state !== 'undefined') {
        state.filters.bundeslaender = laender;
    } else {
        safeLocalSet('pendingBundeslandFilter', JSON.stringify(laender));
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

window.__registerModule('landing-data.js');
