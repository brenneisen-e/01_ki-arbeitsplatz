(function(){var r=['dailyRawData'];var m=r.filter(function(f){return typeof window[f]==='undefined'});if(m.length)console.error('[landing-regions.js] Fehlende Deps:',m.join(', '),'← Lade data.js zuerst!');})();
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

window.__registerModule('landing-regions.js');
