/**
 * map.esm.js - ES6 Module for Map Functions
 *
 * This module handles the D3.js-based county map rendering and interactions.
 * Requires D3.js to be loaded globally.
 */

import { state } from './state.esm.js';
import { formatValue } from './utils.esm.js';
import { getFilteredData } from './data-functions.esm.js';

/**
 * County Map Handler Class
 * Manages the interactive map of German counties (Regierungsbezirke)
 */
export class CountyMapHandler {
    constructor() {
        this.svg = null;
        this.projection = null;
        this.path = null;
        this.counties = new Map();
        this.selectedCounties = new Set();
        this.zoom = null;
    }

    async init() {
        console.log('🗺️ Initialisiere Landkreis-Karte...');

        const container = d3.select('#map');
        container.html('');

        const width = 380;
        const height = 500;

        // SVG mit Zoom
        this.svg = container
            .append('svg')
            .attr('width', width)
            .attr('height', height)
            .attr('viewBox', `0 0 ${width} ${height}`);

        // Hintergrund
        this.svg.append('rect')
            .attr('class', 'map-background')
            .attr('width', width)
            .attr('height', height)
            .attr('fill', '#f8fafc');

        // Lade Regierungsbezirke GeoJSON
        console.log('📥 Lade Regierungsbezirke...');
        const geojson = await d3.json('assets/geo/regierungsbezirke.geo.json');

        console.log(`✅ ${geojson.features.length} Regierungsbezirke geladen`);

        // Projektion
        this.projection = d3.geoMercator()
            .fitSize([width, height], geojson);

        this.path = d3.geoPath().projection(this.projection);

        // Landkreise zeichnen
        const countiesGroup = this.svg.append('g')
            .attr('id', 'counties-layer');

        countiesGroup.selectAll('path')
            .data(geojson.features)
            .enter()
            .append('path')
            .attr('d', this.path)
            .attr('class', 'county-path')
            .attr('data-county', d => this.getCountyName(d))
            .attr('data-state', d => d.properties.Bundesland || d.properties.VARNAME_1)
            .attr('fill', '#ffffff')
            .attr('stroke', '#cbd5e1')
            .attr('stroke-width', 0.5)
            .style('cursor', 'pointer')
            .on('mouseenter', (event, d) => this.onMouseEnter(event, d))
            .on('mouseleave', (event, d) => this.onMouseLeave(event, d))
            .on('click', (event, d) => this.onClick(event, d));

        // Bundesland-Grenzen
        const statesGeoJSON = await d3.json('assets/geo/bundeslaender.geo.json');

        this.svg.append('g')
            .attr('id', 'states-borders')
            .selectAll('path')
            .data(statesGeoJSON.features)
            .enter()
            .append('path')
            .attr('d', this.path)
            .attr('fill', 'none')
            .attr('stroke', '#94a3b8')
            .attr('stroke-width', 1.5)
            .style('pointer-events', 'none');

        // Speichere Referenzen
        geojson.features.forEach(feature => {
            const name = this.getCountyName(feature);
            this.counties.set(name, {
                name: name,
                state: feature.properties.Bundesland || feature.properties.VARNAME_1,
                feature: feature,
                selected: false,
                value: 0
            });
        });

        console.log('✅ Karte initialisiert:', this.counties.size, 'Regierungsbezirke');

        this.logCountiesByState();
    }

    logCountiesByState() {
        const byState = {};
        this.counties.forEach((county, name) => {
            if (!byState[county.state]) {
                byState[county.state] = [];
            }
            byState[county.state].push(name);
        });

        console.log('📋 REGIERUNGSBEZIRKE NACH BUNDESLAND:');
        Object.keys(byState).sort().forEach(state => {
            console.log(`'${state}': [${byState[state].map(n => `'${n}'`).join(', ')}],`);
        });

        console.log('\n💡 Kopiere diese Namen in den CSV-Generator!');
    }

    getCountyName(feature) {
        return feature.properties.GEN ||
               feature.properties.name ||
               feature.properties.NAME_2 ||
               feature.id;
    }

    normalizeCountyName(name) {
        if (!name) return '';
        return name
            .toLowerCase()
            .replace(/\s+/g, ' ')
            .replace(/ä/g, 'a')
            .replace(/ö/g, 'o')
            .replace(/ü/g, 'u')
            .replace(/ß/g, 'ss')
            .replace(/[()]/g, '')
            .trim();
    }

    findCountyByName(searchName) {
        const normalized = this.normalizeCountyName(searchName);

        for (const [name, county] of this.counties) {
            if (this.normalizeCountyName(name) === normalized) {
                return name;
            }
        }

        for (const [name, county] of this.counties) {
            const normalizedCounty = this.normalizeCountyName(name);
            if (normalizedCounty.includes(normalized) || normalized.includes(normalizedCounty)) {
                return name;
            }
        }

        return null;
    }

    onMouseEnter(event, d) {
        const name = this.getCountyName(d);
        const county = this.counties.get(name);

        if (!county) return;

        const element = d3.select(event.target);

        if (!county.selected) {
            element
                .attr('fill', '#e0f2fe')
                .attr('stroke-width', 2)
                .attr('stroke', '#0ea5e9');
        }

        element
            .raise()
            .style('filter', 'drop-shadow(0 4px 8px rgba(14, 165, 233, 0.4))');

        this.showTooltip(event, county);
    }

    onMouseLeave(event, d) {
        const name = this.getCountyName(d);
        const county = this.counties.get(name);

        if (!county) return;

        const element = d3.select(event.target);

        if (!county.selected) {
            element
                .attr('fill', '#ffffff')
                .attr('stroke-width', 1)
                .attr('stroke', '#cbd5e1')
                .style('filter', 'none');
        } else {
            element
                .style('filter', 'drop-shadow(0 0 8px rgba(59, 130, 246, 1))');
        }

        this.hideTooltip();
    }

    onClick(event, d) {
        const name = this.getCountyName(d);
        this.toggleCounty(name);
    }

    toggleCounty(countyName) {
        const county = this.counties.get(countyName);
        if (!county) return;

        // SINGLE SELECTION
        if (!county.selected && this.selectedCounties.size > 0) {
            this.selectedCounties.forEach(selectedName => {
                const selectedCounty = this.counties.get(selectedName);
                if (selectedCounty) {
                    selectedCounty.selected = false;

                    this.svg.select(`[data-county="${selectedName}"]`)
                        .attr('stroke', '#cbd5e1')
                        .attr('stroke-width', 1)
                        .attr('fill', '#ffffff')
                        .style('filter', 'none');
                }
            });
            this.selectedCounties.clear();
        }

        county.selected = !county.selected;

        if (county.selected) {
            this.selectedCounties.add(countyName);
        } else {
            this.selectedCounties.delete(countyName);
        }

        const element = this.svg.select(`[data-county="${countyName}"]`);

        if (county.selected) {
            const color = this.getColorForValue(county.value);
            element
                .attr('stroke', '#3b82f6')
                .attr('stroke-width', 3)
                .attr('fill', color)
                .style('filter', 'drop-shadow(0 0 8px rgba(59, 130, 246, 1))')
                .raise();
        } else {
            element
                .attr('stroke', '#cbd5e1')
                .attr('stroke-width', 1)
                .attr('fill', '#ffffff')
                .style('filter', 'none');
        }

        this.updateDashboard();
    }

    updateMapData(monthlyData) {
        const currentState = window.state || state;
        const dailyData = window.dailyRawData;

        console.log('🎨 Update Landkreis-Map');

        if (!dailyData || dailyData.length === 0) {
            console.log('⚠️ Keine Daten - Karte bleibt weiß');
            this.counties.forEach((countyData, countyName) => {
                countyData.value = 0;
                this.svg.select(`[data-county="${countyName}"]`)
                    .attr('fill', '#ffffff');
            });
            return;
        }

        const countyValues = new Map();

        let filtered = dailyData.filter(row => {
            if (row.year != currentState.filters.year) return false;
            if (currentState.filters.silo !== 'alle' && row.silo !== currentState.filters.silo) return false;
            if (!currentState.filters.segments.includes('alle') && !currentState.filters.segments.includes(row.segment)) return false;
            if (currentState.filters.agentur !== 'alle' && row.vermittler_id !== currentState.filters.agentur) return false;
            return true;
        });

        filtered.forEach(row => {
            let kreis = row.landkreis || row.kreis;
            if (!kreis) return;

            if (typeof kreis === 'string') {
                kreis = kreis.replace(/^["']|["']$/g, '').trim();
            }

            if (this.counties.has(kreis)) {
                const current = countyValues.get(kreis) || 0;
                countyValues.set(kreis, current + (parseFloat(row.neugeschaeft) || 0));
            }
        });

        console.log(`📊 ${countyValues.size} von ${this.counties.size} Regionen haben Daten`);

        this.counties.forEach((countyData, countyName) => {
            const value = countyValues.get(countyName) || 0;
            countyData.value = value;

            if (countyData.selected) {
                const color = this.getColorForValue(value);
                this.svg.select(`[data-county="${countyName}"]`)
                    .attr('fill', color);
            } else {
                this.svg.select(`[data-county="${countyName}"]`)
                    .attr('fill', '#ffffff');
            }
        });
    }

    fallbackToStates(filteredData) {
        const stateValues = new Map();

        filteredData.forEach(row => {
            const land = row.bundesland;
            if (!land) return;

            const current = stateValues.get(land) || 0;
            stateValues.set(land, current + (parseFloat(row.neugeschaeft) || 0));
        });

        this.counties.forEach((countyData, countyName) => {
            const stateValue = stateValues.get(countyData.state) || 0;

            let countiesInState = 0;
            this.counties.forEach(c => {
                if (c.state === countyData.state) countiesInState++;
            });

            const baseValue = stateValue / countiesInState;
            const randomFactor = 0.7 + Math.random() * 0.6;
            const value = baseValue * randomFactor;

            countyData.value = value;

            const color = this.getColorForValue(value);

            this.svg.select(`[data-county="${countyName}"]`)
                .transition()
                .duration(300)
                .attr('fill', color);
        });
    }

    getColorForValue(value) {
        if (value === 0) return '#ffffff';

        const scale = d3.scaleThreshold()
            .domain([50000, 200000, 500000, 1000000, 5000000])
            .range([
                '#eff6ff',
                '#dbeafe',
                '#bfdbfe',
                '#93c5fd',
                '#60a5fa',
                '#3b82f6'
            ]);

        return scale(value);
    }

    showTooltip(event, county) {
        const formatFn = window.formatValue || formatValue;
        const tooltip = d3.select('#info-tooltip');

        tooltip
            .html(`
                <div style="font-size: 16px; font-weight: 700; margin-bottom: 4px; color: #0f172a;">
                    ${county.name}
                </div>
                <div style="font-size: 12px; color: #64748b; margin-bottom: 10px;">
                    📍 ${county.state}
                </div>
                <div style="font-size: 13px; color: #1e293b; background: #f8fafc; padding: 8px; border-radius: 6px; margin-top: 8px;">
                    <div style="font-size: 11px; color: #64748b; margin-bottom: 2px;">Neugeschäft</div>
                    <div style="font-size: 15px; font-weight: 600; color: #0ea5e9;">${formatFn(county.value, 'currency')}</div>
                </div>
            `)
            .style('display', 'block')
            .style('left', (event.pageX + 15) + 'px')
            .style('top', (event.pageY - 60) + 'px')
            .style('background', 'white')
            .style('padding', '14px 16px')
            .style('border-radius', '12px')
            .style('box-shadow', '0 10px 25px rgba(0,0,0,0.15)')
            .style('pointer-events', 'none')
            .style('z-index', '10000')
            .style('border', '1px solid #e2e8f0')
            .style('max-width', '280px')
            .style('font-family', '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif');
    }

    hideTooltip() {
        d3.select('#info-tooltip').style('display', 'none');
    }

    updateDashboard() {
        const currentState = window.state || state;

        currentState.selectedCounties = new Set(this.selectedCounties);

        console.log('🔄 Dashboard Update - Ausgewählte Regionen:', Array.from(this.selectedCounties));

        if (this.selectedCounties.size > 0 && currentState.filters.agentur !== 'alle') {
            console.log('🔄 Bundesland ausgewählt - Setze Agenturfilter zurück');
            currentState.filters.agentur = 'alle';

            const agenturSelect = document.getElementById('agenturFilterSelect');
            if (agenturSelect) {
                agenturSelect.value = 'alle';
            }
        }

        updateCountySelection();

        if (typeof window.updateAllKPIs === 'function') {
            console.log('📊 Aktualisiere KPIs...');
            window.updateAllKPIs();
        } else {
            console.error('❌ updateAllKPIs Funktion nicht gefunden!');
        }

        if (currentState.currentView === 'table') {
            if (typeof window.renderTable === 'function') {
                window.renderTable();
            }
        }
    }

    clearSelection() {
        this.selectedCounties.clear();
        this.counties.forEach((countyData, countyName) => {
            countyData.selected = false;

            this.svg.select(`[data-county="${countyName}"]`)
                .attr('stroke', '#cbd5e1')
                .attr('stroke-width', 0.5)
                .style('filter', 'none');
        });
        this.updateDashboard();
    }

    /**
     * Select multiple counties programmatically (for AI queries)
     * @param {Array<string>} countyNames - Array of county names to select
     * @param {boolean} clearFirst - Whether to clear existing selection first (default: true)
     */
    selectMultipleCounties(countyNames, clearFirst = true) {
        console.log('🗺️ Programmatische Multi-Selektion:', countyNames);

        // Clear existing selection if requested
        if (clearFirst) {
            this.selectedCounties.clear();
            this.counties.forEach((countyData, countyName) => {
                countyData.selected = false;
                this.svg.select(`[data-county="${countyName}"]`)
                    .attr('stroke', '#cbd5e1')
                    .attr('stroke-width', 0.5)
                    .attr('fill', '#ffffff')
                    .style('filter', 'none');
            });
        }

        // Select each county
        countyNames.forEach(searchName => {
            // Try to find the county (with fuzzy matching)
            const foundName = this.findCountyByName(searchName);
            if (!foundName) {
                console.warn(`⚠️ Region nicht gefunden: ${searchName}`);
                return;
            }

            const county = this.counties.get(foundName);
            if (!county) return;

            county.selected = true;
            this.selectedCounties.add(foundName);

            const color = this.getColorForValue(county.value);
            this.svg.select(`[data-county="${foundName}"]`)
                .attr('stroke', '#3b82f6')
                .attr('stroke-width', 3)
                .attr('fill', color)
                .style('filter', 'drop-shadow(0 0 8px rgba(59, 130, 246, 1))')
                .raise();
        });

        console.log(`✅ ${this.selectedCounties.size} Regionen selektiert`);
        this.updateDashboard();
    }

    /**
     * Get top N regions by value (Neugeschäft)
     * @param {number} n - Number of top regions to return
     * @returns {Array<{name: string, value: number, state: string}>}
     */
    getTopRegions(n = 5) {
        const regions = [];
        this.counties.forEach((county, name) => {
            if (county.value > 0) {
                regions.push({
                    name: name,
                    value: county.value,
                    state: county.state
                });
            }
        });

        // Sort by value descending
        regions.sort((a, b) => b.value - a.value);

        return regions.slice(0, n);
    }

    zoomToState(stateName) {
        const stateCounties = [];
        this.counties.forEach((county, name) => {
            if (county.state === stateName) {
                stateCounties.push(county.feature);
            }
        });

        if (stateCounties.length === 0) return;

        const bounds = this.path.bounds({
            type: 'FeatureCollection',
            features: stateCounties
        });

        const dx = bounds[1][0] - bounds[0][0];
        const dy = bounds[1][1] - bounds[0][1];
        const x = (bounds[0][0] + bounds[1][0]) / 2;
        const y = (bounds[0][1] + bounds[1][1]) / 2;
        const scale = Math.max(1, Math.min(8, 0.9 / Math.max(dx / 380, dy / 500)));
        const translate = [380 / 2 - scale * x, 500 / 2 - scale * y];

        this.svg.transition()
            .duration(750)
            .call(
                this.zoom.transform,
                d3.zoomIdentity.translate(translate[0], translate[1]).scale(scale)
            );
    }
}

// Global instance
export let countyMapHandler;

/**
 * Initialize the map
 */
export async function initMap() {
    console.log('🗺️ initMap() aufgerufen');

    const container = document.getElementById('map');
    if (container) {
        container.innerHTML = '<div style="display:flex;align-items:center;justify-content:center;height:100%;color:#64748b;"><span>Karte wird geladen...</span></div>';
    }

    try {
        countyMapHandler = new CountyMapHandler();
        await countyMapHandler.init();

        const dailyData = window.dailyRawData;
        if (dailyData && dailyData.length > 0) {
            const data = getFilteredData();
            countyMapHandler.updateMapData(data);
        }

        console.log('✅ Karte erfolgreich initialisiert');
    } catch (error) {
        console.error('❌ Fehler bei Karteninitialisierung:', error);
        if (container) {
            container.innerHTML = '<div style="display:flex;align-items:center;justify-content:center;height:100%;color:#ef4444;text-align:center;padding:1rem;"><span>Karte konnte nicht geladen werden.<br>Bitte Seite neu laden.</span></div>';
        }
    }
}

/**
 * Update county selection display
 */
export function updateCountySelection() {
    const selectedContainer = document.getElementById('selectedStates');
    const clearButton = document.getElementById('clearStates');

    if (!countyMapHandler || !selectedContainer) return;

    if (countyMapHandler.selectedCounties.size > 0) {
        const sorted = Array.from(countyMapHandler.selectedCounties).sort();

        selectedContainer.innerHTML = sorted.map(name =>
            `<span class="state-tag" onclick="removeCounty('${name}')">${name} ×</span>`
        ).join('');
        if (clearButton) clearButton.disabled = false;
    } else {
        selectedContainer.innerHTML = '<span class="empty-state">— keine —</span>';
        if (clearButton) clearButton.disabled = true;
    }
}

/**
 * Remove a county from selection
 * @param {string} name - County name
 */
export function removeCounty(name) {
    if (countyMapHandler) {
        countyMapHandler.toggleCounty(name);
    }
}

/**
 * Clear all selected states/counties
 */
export function clearAllStates() {
    if (countyMapHandler) {
        countyMapHandler.clearSelection();
    }
}

// ============================================
// BRIDGE: Set global variables for backward compatibility
// ============================================
if (typeof window !== 'undefined') {
    window.CountyMapHandler = CountyMapHandler;
    window.initMap = initMap;
    window.updateCountySelection = updateCountySelection;
    window.removeCounty = removeCounty;
    window.clearAllStates = clearAllStates;

    // Note: countyMapHandler is set after init
    Object.defineProperty(window, 'countyMapHandler', {
        get: () => countyMapHandler,
        set: (value) => { countyMapHandler = value; }
    });

    console.log('[ESM] map.esm.js loaded');
}
