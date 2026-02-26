// js/autocomplete.js - Chatbot Autocomplete
// Extracted from landing.js for modularity

// CHATBOT AUTOCOMPLETE
// ========================================

const mockAgents = [
    { id: 'VM00001', name: 'Dila Yorulmaz' },
    { id: 'VM00002', name: 'Maria Schmidt' },
    { id: 'VM00003', name: 'Michael Weber' },
    { id: 'VM00004', name: 'Martina Fischer' },
    { id: 'VM00005', name: 'Markus Braun' }
];

const potentialProducts = [
    { id: 'hausrat', name: 'Hausratversicherung' },
    { id: 'haftpflicht', name: 'Haftpflichtversicherung' },
    { id: 'kfz', name: 'Kfz-Versicherung' },
    { id: 'leben', name: 'Lebensversicherung' },
    { id: 'bu', name: 'Berufsunfähigkeitsversicherung' },
    { id: 'unfall', name: 'Unfallversicherung' },
    { id: 'rechtsschutz', name: 'Rechtsschutzversicherung' },
    { id: 'kranken', name: 'Krankenversicherung' },
    { id: 'pflege', name: 'Pflegeversicherung' },
    { id: 'altersvorsorge', name: 'Private Altersvorsorge' },
    { id: 'sach', name: 'Sachversicherung' },
    { id: 'wohngebaeude', name: 'Wohngebäudeversicherung' }
];

let selectedSuggestionIndex = -1;
let currentSuggestionType = null;

// Erweiterte Befehle für Autocomplete
const quickCommands = [
    { pattern: 'gesamtübersicht', label: 'Gesamtübersicht öffnen', action: 'openDashboard', icon: 'grid' },
    { pattern: 'potentialanalyse', label: 'Potentialanalyse öffnen', action: 'openPotentialAnalyse', icon: 'chart' },
    { pattern: 'dashboard', label: 'Dashboard öffnen', action: 'openDashboard', icon: 'grid' },
    { pattern: 'hilfe', label: 'Hilfe anzeigen', action: 'showHelp', icon: 'help' },
    { pattern: 'filter zurücksetzen', label: 'Alle Filter zurücksetzen', action: 'clearFilters', icon: 'x' },
];

// Zusammenfassung-Vorschläge
const zusammenfassungSuggestions = [
    { pattern: 'zusammenfassung heutiger tag', label: 'Zusammenfassung heutiger Tag', action: 'zusammenfassungHeute', icon: 'summary' },
    { pattern: 'zusammenfassung meiner vertriebsschancen', label: 'Zusammenfassung meiner Vertriebsschancen', action: 'zusammenfassungVertriebsschancen', icon: 'summary' },
    { pattern: 'zusammenfassung der aktuellen vertriebskampagnen', label: 'Zusammenfassung der aktuellen Vertriebskampagnen', action: 'zusammenfassungKampagnen', icon: 'summary' },
];

function setupAutocomplete() {
    const chatInput = document.getElementById('landingChatInput');
    const suggestionsContainer = document.getElementById('autocompleteSuggestions');

    if (!chatInput || !suggestionsContainer) return;

    chatInput.addEventListener('input', function(e) {
        const value = e.target.value.toLowerCase().trim();

        // Vorschläge erst ab 3 Zeichen anzeigen
        if (value.length < 3) {
            hideSuggestions(suggestionsContainer);
            return;
        }

        // Sammle alle Vorschläge
        let suggestions = [];

        // 1. Prüfe auf Agenten-Befehle
        const agentPatterns = ['agentur ', 'übersicht ', 'zeige ', 'filter ', 'ansicht '];
        for (const pattern of agentPatterns) {
            if (value.includes(pattern)) {
                const searchTerm = value.split(pattern).pop();
                if (searchTerm && searchTerm.length > 0) {
                    const agentMatches = getAgentSuggestions(searchTerm, pattern);
                    suggestions = suggestions.concat(agentMatches);
                }
                break;
            }
        }

        // 2. Prüfe auf Potential-Befehle (mit Leerzeichen = Produktsuche)
        const potentialPatterns = ['potentiale für ', 'potential für ', 'potentiale ', 'potential '];
        for (const pattern of potentialPatterns) {
            if (value.includes(pattern)) {
                const searchTerm = value.split(pattern).pop();
                if (searchTerm && searchTerm.length > 0) {
                    const potentialMatches = getPotentialSuggestions(searchTerm);
                    suggestions = suggestions.concat(potentialMatches);
                }
                break;
            }
        }

        // 2b. Zusammenfassung-Vorschläge (wenn "zus..." eingegeben wird)
        if (value.startsWith('zus')) {
            const zusammenfassungMatches = zusammenfassungSuggestions.filter(s =>
                s.pattern.includes(value) || s.label.toLowerCase().includes(value)
            ).map(s => ({
                type: 'zusammenfassung',
                label: s.label,
                action: s.action,
                icon: s.icon
            }));
            suggestions = suggestions.concat(zusammenfassungMatches);
        }

        // 2c. Wenn "pot..." eingegeben wird (Beginn von "potential"), zeige alle Potentiale
        if (value.startsWith('pot') && !value.includes(' ')) {
            // Zeige alle Potential-Produkte als Vorschläge
            const allPotentials = potentialProducts.slice(0, 5).map(p => ({
                type: 'potential',
                id: p.id,
                name: p.name,
                label: `Potentiale für ${p.name}`,
                icon: 'chart'
            }));
            suggestions = suggestions.concat(allPotentials);
        }

        // 3. Allgemeine Suche nach Agenten (wenn Name eingegeben wird)
        if (suggestions.length === 0) {
            const agentMatches = getAgentSuggestions(value, '');
            suggestions = suggestions.concat(agentMatches);
        }

        // 4. Quick Commands
        const commandMatches = quickCommands.filter(cmd =>
            cmd.pattern.includes(value) || cmd.label.toLowerCase().includes(value)
        ).map(cmd => ({
            type: 'command',
            label: cmd.label,
            action: cmd.action,
            icon: cmd.icon
        }));
        suggestions = suggestions.concat(commandMatches);

        // 5. Potential-Produkte direkt
        if (suggestions.length < 5) {
            const directPotentials = potentialProducts.filter(p =>
                p.name.toLowerCase().includes(value) || p.id.includes(value)
            ).slice(0, 3).map(p => ({
                type: 'potential',
                id: p.id,
                name: p.name,
                label: `Potentiale für ${p.name}`,
                icon: 'chart'
            }));
            suggestions = suggestions.concat(directPotentials);
        }

        // Zeige Vorschläge (max 8)
        suggestions = suggestions.slice(0, 8);

        if (suggestions.length > 0) {
            showUnifiedSuggestions(suggestions, suggestionsContainer);
        } else {
            hideSuggestions(suggestionsContainer);
        }
    });

    // Keyboard navigation
    chatInput.addEventListener('keydown', function(e) {
        const items = suggestionsContainer.querySelectorAll('.autocomplete-item');

        if (suggestionsContainer.style.display === 'none' || items.length === 0) {
            return;
        }

        if (e.key === 'ArrowDown') {
            e.preventDefault();
            selectedSuggestionIndex = Math.min(selectedSuggestionIndex + 1, items.length - 1);
            updateSuggestionSelection(items);
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            selectedSuggestionIndex = Math.max(selectedSuggestionIndex - 1, 0);
            updateSuggestionSelection(items);
        } else if (e.key === 'Enter' && selectedSuggestionIndex >= 0) {
            e.preventDefault();
            const selectedItem = items[selectedSuggestionIndex];
            if (selectedItem) {
                executeSuggestion(selectedItem);
            }
        }
    });

    // Click outside to close
    document.addEventListener('click', function(e) {
        if (!suggestionsContainer.contains(e.target) && e.target !== chatInput) {
            hideSuggestions(suggestionsContainer);
        }
    });
}

// Neue Hilfsfunktionen für erweitertes Autocomplete
function getAgentSuggestions(searchTerm, prefix) {
    const agenturen = typeof getAgenturen === 'function' ? getAgenturen() : mockAgents;

    return agenturen.filter(a =>
        (a.name && a.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (a.id && a.id.toLowerCase().includes(searchTerm.toLowerCase()))
    ).slice(0, 5).map(agent => ({
        type: 'agent',
        id: agent.id,
        name: agent.name || agent.id,
        label: prefix === 'filter ' ? `Filter auf ${agent.name}` : `Übersicht ${agent.name}`,
        prefix: prefix,
        icon: 'user'
    }));
}

function getPotentialSuggestions(searchTerm) {
    return potentialProducts.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.id.toLowerCase().includes(searchTerm.toLowerCase())
    ).slice(0, 5).map(p => ({
        type: 'potential',
        id: p.id,
        name: p.name,
        label: `Potentiale für ${p.name}`,
        icon: 'chart'
    }));
}

function getIcon(iconType) {
    const icons = {
        user: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>',
        chart: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="20" x2="12" y2="10"></line><line x1="18" y1="20" x2="18" y2="4"></line><line x1="6" y1="20" x2="6" y2="16"></line></svg>',
        grid: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>',
        help: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3"></path><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>',
        x: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>',
        summary: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>'
    };
    return icons[iconType] || icons.user;
}

function showUnifiedSuggestions(suggestions, container) {
    container.innerHTML = suggestions.map((s, i) => `
        <div class="autocomplete-item"
             data-type="${s.type}"
             data-id="${s.id || ''}"
             data-name="${s.name || ''}"
             data-action="${s.action || ''}"
             data-label="${s.label}"
             onclick="executeSuggestion(this)">
            ${getIcon(s.icon)}
            <span class="suggestion-label">${s.label}</span>
            ${s.id ? `<span class="suggestion-id">(${s.id})</span>` : ''}
        </div>
    `).join('');

    container.style.display = 'block';
    selectedSuggestionIndex = -1;
}

function executeSuggestion(element) {
    const type = element.dataset.type;
    const id = element.dataset.id;
    const name = element.dataset.name;
    const action = element.dataset.action;
    const label = element.dataset.label;
    const container = document.getElementById('autocompleteSuggestions');

    hideSuggestions(container);

    // Chat-Input aktualisieren
    const chatInput = document.getElementById('landingChatInput');
    if (chatInput) chatInput.value = '';

    if (type === 'agent') {
        // Agenturansicht öffnen
        if (typeof showAgenturOverview === 'function') {
            showAgenturOverview(id);
        }
    } else if (type === 'potential') {
        // Potentialanalyse mit Filter öffnen
        if (typeof openPotentialAnalyseWithFilter === 'function') {
            openPotentialAnalyseWithFilter(id, name);
        }
    } else if (type === 'zusammenfassung') {
        // Zusammenfassung-Befehle ausführen
        executeZusammenfassung(action, label);
    } else if (type === 'command') {
        // Quick Command ausführen
        if (action === 'openDashboard' && typeof openDashboard === 'function') {
            openDashboard();
        } else if (action === 'openPotentialAnalyse' && typeof openPotentialAnalyse === 'function') {
            openPotentialAnalyse();
        } else if (action === 'clearFilters' && typeof clearAllFilters === 'function') {
            clearAllFilters();
            addLandingChatMessage('assistant', 'Alle Filter wurden zurückgesetzt.');
        } else if (action === 'showHelp') {
            addLandingChatMessage('assistant', '**Verfügbare Befehle:**\n\n• "Übersicht [Name]" - Agenturübersicht öffnen\n• "Potentiale für [Produkt]" - Potentialanalyse filtern\n• "Gesamtübersicht" - Dashboard öffnen\n• "Potentialanalyse" - Potentialanalyse öffnen\n• "Filter zurücksetzen" - Alle Filter entfernen');
        }
    }
}

// Legacy-Funktionen für Rückwärtskompatibilität
function showAgentSuggestions(searchTerm, container) {
    const agenturen = typeof getAgenturen === 'function' ? getAgenturen() : mockAgents;
    const matches = agenturen.filter(a =>
        (a.name && a.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (a.id && a.id.toLowerCase().includes(searchTerm.toLowerCase()))
    ).slice(0, 5);

    if (matches.length === 0) {
        hideSuggestions(container);
        return;
    }

    const suggestions = matches.map(agent => ({
        type: 'agent',
        id: agent.id,
        name: agent.name || agent.id,
        label: `Übersicht ${agent.name || agent.id}`,
        icon: 'user'
    }));

    showUnifiedSuggestions(suggestions, container);
}

function showPotentialSuggestions(searchTerm, container) {
    const matches = potentialProducts.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.id.toLowerCase().includes(searchTerm.toLowerCase())
    ).slice(0, 5);

    if (matches.length === 0) {
        hideSuggestions(container);
        return;
    }

    const suggestions = matches.map(p => ({
        type: 'potential',
        id: p.id,
        name: p.name,
        label: `Potentiale für ${p.name}`,
        icon: 'chart'
    }));

    showUnifiedSuggestions(suggestions, container);
}

function hideSuggestions(container) {
    container.style.display = 'none';
    selectedSuggestionIndex = -1;
    currentSuggestionType = null;
}

function updateSuggestionSelection(items) {
    items.forEach((item, index) => {
        item.classList.toggle('selected', index === selectedSuggestionIndex);
    });
}

function selectAgentSuggestion(agentId, agentName) {
    console.log('Agentur ausgewählt:', agentId, agentName);

    // Verstecke Suggestions
    const container = document.getElementById('autocompleteSuggestions');
    if (container) container.style.display = 'none';

    // Leere Input
    const chatInput = document.getElementById('landingChatInput');
    if (chatInput) chatInput.value = '';

    // Öffne Agenturansicht
    if (typeof showAgenturOverview === 'function') {
        showAgenturOverview(agentId);
    } else {
        // Fallback
        setAgenturFilter(agentId);
        openDashboard();
    }
}

function selectPotentialSuggestion(productId, productName) {
    console.log('Potential ausgewählt:', productId, productName);

    // Verstecke Suggestions
    const container = document.getElementById('autocompleteSuggestions');
    if (container) container.style.display = 'none';

    // Leere Input
    const chatInput = document.getElementById('landingChatInput');
    if (chatInput) chatInput.value = '';

    // Setze Filter und öffne Potentialanalyse
    currentPotentialFilter = productId;
    openPotentialAnalyseWithFilter(productId, productName);
}

// Für Rückwärtskompatibilität
function selectSuggestion(id, name) {
    if (currentSuggestionType === 'potential') {
        selectPotentialSuggestion(id, name);
    } else {
        selectAgentSuggestion(id, name);
    }
}

// ========================================
// ZUSAMMENFASSUNG-BEFEHLE
// ========================================

function executeZusammenfassung(action, label) {
    console.log('Zusammenfassung ausführen:', action);

    // Zeige Thinking-Animation im Chat
    if (typeof showLandingChatTyping === 'function') {
        showLandingChatTyping();
    }

    if (action === 'zusammenfassungHeute') {
        // "Zusammenfassung heutiger Tag" → Thinking, dann zu A-02 navigieren
        setTimeout(function() {
            if (typeof showAgenturOverview === 'function') {
                // Verwende erste Agentur oder Demo-ID
                const agenturen = (typeof getAgenturen === 'function') ? getAgenturen() : [];
                const vermittlerId = (agenturen.length > 0) ? agenturen[0].id : 'DEMO-001';
                showAgenturOverview(vermittlerId);
            } else if (typeof openAgenturView === 'function') {
                openAgenturView();
            }
        }, 2000);
    } else if (action === 'zusammenfassungVertriebsschancen') {
        // "Zusammenfassung meiner Vertriebsschancen" → Mock-Antwort im Chat
        setTimeout(function() {
            if (typeof hideLandingChatTyping === 'function') hideLandingChatTyping();
            if (typeof addLandingChatMessage === 'function') {
                addLandingChatMessage('assistant', `**Zusammenfassung Ihrer Vertriebsschancen:**

**Top-Chancen diese Woche:**
• **Peter Schmidt** – KFZ & BU-Versicherung, Vertragslücken identifiziert
• **Anna Müller** – Kfz-Vertrag läuft 12/2026 aus, Wechselpotential
• **Thomas Weber** – BU-Deckungslücke (nur 60% Nettoeinkommen)
• **Sandra Koch** – Cross-Selling Hausrat (Bestandskundin Leben)

**Offene Potentiale:** 23 Kunden mit identifizierten Lücken
**Geschätztes Prämienvolumen:** €45.800

👉 Tippe **"Vertriebspotentiale"** für die vollständige Liste.`);
            }
        }, 2500);
    } else if (action === 'zusammenfassungKampagnen') {
        // "Zusammenfassung der aktuellen Vertriebskampagnen" → Mock-Antwort im Chat
        setTimeout(function() {
            if (typeof hideLandingChatTyping === 'function') hideLandingChatTyping();
            if (typeof addLandingChatMessage === 'function') {
                addLandingChatMessage('assistant', `**Aktuelle Vertriebskampagnen:**

**1. Kfz-Wechselkampagne (Herbst 2025)**
• Status: Aktiv | Zielgruppe: 1.240 Kunden
• Erfolgsquote: 18,3% | Abschlüsse: 227

**2. BU-Offensive Q1/2026**
• Status: Aktiv | Zielgruppe: 890 Kunden
• Erfolgsquote: 12,1% | Abschlüsse: 108

**3. Cross-Selling Sachversicherung**
• Status: Laufend | Zielgruppe: 2.100 Kunden
• Erfolgsquote: 9,7% | Abschlüsse: 204

**4. Altersvorsorge-Check**
• Status: In Planung | Zielgruppe: 1.500 Kunden
• Start: März 2026

**Gesamt-Performance:** 539 Abschlüsse aus 4.230 Kontakten (12,7%)`);
            }
        }, 2500);
    }
}

// ========================================
