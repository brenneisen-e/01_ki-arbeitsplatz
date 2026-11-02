/**
 * data-functions.esm.js - ES6 Module for Data Access Functions
 *
 * This module exports all data manipulation and access functions.
 * It also provides backward compatibility by setting global variables.
 */

import { state, dailyRawData } from './state.esm.js';
import { kpiDefinitions } from './config.esm.js';

/**
 * Aggregate daily data to monthly
 * @param {Array} dailyData - Array of daily data rows
 * @returns {Array} Array of monthly aggregated data
 */
export function aggregateDailyToMonthly(dailyData) {
    const monthlyData = {};

    dailyData.forEach(row => {
        const key = `${row.year || 2025}-${row.month}`;
        if (!monthlyData[key]) {
            monthlyData[key] = {
                year: row.year || 2025,
                month: row.month,
                neugeschaeft: 0,
                bestand: {},
                storno: [],
                nps: [],
                risiko: [],
                combined: [],
                ergebnis: 0,
                underwriting: [],
                deckungsbeitrag: 0,
                count: 0
            };
        }

        const monthData = monthlyData[key];

        monthData.neugeschaeft += parseFloat(row.neugeschaeft) || 0;
        monthData.ergebnis += parseFloat(row.ergebnis) || 0;
        monthData.deckungsbeitrag += parseFloat(row.deckungsbeitrag) || 0;

        const bestandValue = parseFloat(row.bestand);
        const stornoValue = parseFloat(row.storno);
        const npsValue = parseFloat(row.nps);
        const risikoValue = parseFloat(row.risiko);
        const combinedValue = parseFloat(row.combined);
        const underwritingValue = parseFloat(row.underwriting);

        if (!isNaN(bestandValue) && row.vermittler_id) {
            monthData.bestand[row.vermittler_id] = bestandValue;
        }

        if (!isNaN(stornoValue)) monthData.storno.push(stornoValue);
        if (!isNaN(npsValue)) monthData.nps.push(npsValue);
        if (!isNaN(risikoValue)) monthData.risiko.push(risikoValue);
        if (!isNaN(combinedValue)) monthData.combined.push(combinedValue);
        if (!isNaN(underwritingValue)) monthData.underwriting.push(underwritingValue);

        monthData.count++;
    });

    const result = Object.values(monthlyData).map(month => {
        const bestandValues = Object.values(month.bestand);
        const totalBestand = bestandValues.reduce((sum, val) => sum + val, 0);

        return {
            month: month.month,
            neugeschaeft: month.neugeschaeft,
            bestand: totalBestand,
            storno: month.storno.length > 0 ? month.storno.reduce((a,b) => a+b, 0) / month.storno.length : 0,
            nps: month.nps.length > 0 ? month.nps.reduce((a,b) => a+b, 0) / month.nps.length : 0,
            risiko: month.risiko.length > 0 ? month.risiko.reduce((a,b) => a+b, 0) / month.risiko.length : 0,
            combined: month.combined.length > 0 ? month.combined.reduce((a,b) => a+b, 0) / month.combined.length : 0,
            ergebnis: month.ergebnis,
            underwriting: month.underwriting.length > 0 ? month.underwriting.reduce((a,b) => a+b, 0) / month.underwriting.length : 0,
            deckungsbeitrag: month.deckungsbeitrag
        };
    });

    result.sort((a, b) => a.month - b.month);
    return result;
}

/**
 * Get filtered data based on current state filters
 * @returns {Array} Filtered and aggregated monthly data
 */
export function getFilteredData() {
    // Access global dailyRawData for compatibility
    const rawData = window.dailyRawData || dailyRawData;
    const currentState = window.state || state;
    const year = currentState.filters.year;

    if (rawData && rawData.length > 0) {
        let filteredDaily = rawData;

        if (rawData[0].year !== undefined) {
            filteredDaily = filteredDaily.filter(row => row.year == year || row.year == parseInt(year));
        }

        if (currentState.filters.agentur !== 'alle' && rawData[0].vermittler_id !== undefined) {
            filteredDaily = filteredDaily.filter(row => row.vermittler_id === currentState.filters.agentur);
        }

        if (currentState.selectedStates.size > 0) {
            filteredDaily = filteredDaily.filter(row => currentState.selectedStates.has(row.bundesland));
        }

        if (currentState.selectedCounties && currentState.selectedCounties.size > 0) {
            console.log('Filtere nach Regionen:', Array.from(currentState.selectedCounties));
            const beforeCount = filteredDaily.length;

            filteredDaily = filteredDaily.filter(row => {
                let kreis = row.landkreis || row.kreis;
                if (!kreis) return false;
                if (typeof kreis === 'string') {
                    kreis = kreis.replace(/^["']|["']$/g, '').trim();
                }
                return currentState.selectedCounties.has(kreis);
            });

            console.log(`📉 Gefiltert: ${beforeCount} → ${filteredDaily.length} Zeilen`);
        }

        if (currentState.filters.silo !== 'alle' && rawData[0].silo !== undefined) {
            filteredDaily = filteredDaily.filter(row => row.silo === currentState.filters.silo);
        }

        if (!currentState.filters.segments.includes('alle') && rawData[0].segment !== undefined) {
            filteredDaily = filteredDaily.filter(row => currentState.filters.segments.includes(row.segment));
        }

        if (!currentState.filters.products.includes('alle') && rawData[0].product !== undefined) {
            filteredDaily = filteredDaily.filter(row => currentState.filters.products.includes(row.product));
        }

        return aggregateDailyToMonthly(filteredDaily);
    }

    if (currentState.uploadedData && currentState.uploadedData.length > 0) {
        return currentState.uploadedData;
    }

    return [];
}

/**
 * Get list of available agents
 * @returns {Array} Array of agent objects with id and name
 */
export function getAgenturen() {
    const rawData = window.dailyRawData || dailyRawData;
    if (!rawData || rawData.length === 0) return [];

    const agenturenMap = new Map();

    rawData.forEach(row => {
        if (row.vermittler_id) {
            if (!agenturenMap.has(row.vermittler_id)) {
                agenturenMap.set(row.vermittler_id, {
                    id: row.vermittler_id,
                    name: row.vermittler_name || row.vermittler_id
                });
            }
        }
    });

    const agenturen = Array.from(agenturenMap.values());

    agenturen.sort((a, b) => {
        const numA = parseFloat(a.id.replace(/\D/g, ''));
        const numB = parseFloat(b.id.replace(/\D/g, ''));
        if (!isNaN(numA) && !isNaN(numB)) {
            return numA - numB;
        }
        return String(a.id).localeCompare(String(b.id));
    });

    return agenturen;
}

/**
 * Get data for a specific agent
 * @param {string} agenturId - The agent ID
 * @returns {Object|null} Agent data object or null
 */
export function getAgenturData(agenturId) {
    const rawData = window.dailyRawData || dailyRawData;
    const currentState = window.state || state;
    const kpis = window.kpiDefinitions || kpiDefinitions;

    if (!rawData || rawData.length === 0) return null;

    let agenturData = rawData.filter(row => row.vermittler_id == agenturId);

    const year = currentState.filters.year;
    if (agenturData[0] && agenturData[0].year !== undefined) {
        agenturData = agenturData.filter(row => row.year == year);
    }

    if (currentState.filters.silo !== 'alle' && agenturData[0] && agenturData[0].silo !== undefined) {
        agenturData = agenturData.filter(row => row.silo === currentState.filters.silo);
    }

    if (!currentState.filters.segments.includes('alle') && agenturData[0] && agenturData[0].segment !== undefined) {
        agenturData = agenturData.filter(row => currentState.filters.segments.includes(row.segment));
    }

    if (!currentState.filters.products.includes('alle') && agenturData[0] && agenturData[0].product !== undefined) {
        agenturData = agenturData.filter(row => currentState.filters.products.includes(row.product));
    }

    if (agenturData.length === 0) return null;

    const monthlyData = aggregateDailyToMonthly(agenturData);
    const row = {
        agentur: agenturId,
        agentur_name: agenturData[0].vermittler_name || agenturId
    };

    kpis.forEach(kpi => {
        if (['storno', 'nps', 'risiko', 'combined', 'underwriting'].includes(kpi.id)) {
            const sum = monthlyData.reduce((acc, month) => acc + (month[kpi.id] || 0), 0);
            row[kpi.id] = monthlyData.length > 0 ? sum / monthlyData.length : 0;
        } else {
            row[kpi.id] = monthlyData.reduce((sum, month) => sum + (month[kpi.id] || 0), 0);
        }
    });

    const firstRow = agenturData[0];
    if (firstRow.bundesland) row.bundesland = firstRow.bundesland;
    if (firstRow.silo) row.silo = firstRow.silo;
    if (firstRow.segment) row.segment = firstRow.segment;

    return row;
}

/**
 * Get data grouped by Bundesland
 * @returns {Array} Array of Bundesland data objects
 */
export function getBundeslaenderData() {
    const rawData = window.dailyRawData || dailyRawData;
    const currentState = window.state || state;

    if (!rawData || rawData.length === 0) return [];

    const bundeslandMap = {};
    let filteredData = rawData;

    const year = currentState.filters.year;
    if (filteredData[0] && filteredData[0].year !== undefined) {
        filteredData = filteredData.filter(row => row.year == year);
    }

    if (currentState.filters.agentur !== 'alle' && filteredData[0] && filteredData[0].vermittler_id !== undefined) {
        filteredData = filteredData.filter(row => row.vermittler_id === currentState.filters.agentur);
    }

    if (currentState.filters.silo !== 'alle' && filteredData[0] && filteredData[0].silo !== undefined) {
        filteredData = filteredData.filter(row => row.silo === currentState.filters.silo);
    }

    if (!currentState.filters.segments.includes('alle') && filteredData[0] && filteredData[0].segment !== undefined) {
        filteredData = filteredData.filter(row => currentState.filters.segments.includes(row.segment));
    }

    if (!currentState.filters.products.includes('alle') && filteredData[0] && filteredData[0].product !== undefined) {
        filteredData = filteredData.filter(row => currentState.filters.products.includes(row.product));
    }

    filteredData.forEach(row => {
        const land = row.bundesland;
        if (!land) return;

        if (!bundeslandMap[land]) {
            bundeslandMap[land] = {
                bundesland: land,
                neugeschaeft: 0,
                bestand: {},
                storno: [],
                nps: [],
                risiko: [],
                combined: [],
                ergebnis: 0,
                underwriting: [],
                deckungsbeitrag: 0
            };
        }

        const data = bundeslandMap[land];
        data.neugeschaeft += parseFloat(row.neugeschaeft) || 0;
        data.ergebnis += parseFloat(row.ergebnis) || 0;
        data.deckungsbeitrag += parseFloat(row.deckungsbeitrag) || 0;

        if (!isNaN(parseFloat(row.bestand)) && row.vermittler_id) {
            data.bestand[row.vermittler_id] = parseFloat(row.bestand);
        }

        if (!isNaN(parseFloat(row.storno))) data.storno.push(parseFloat(row.storno));
        if (!isNaN(parseFloat(row.nps))) data.nps.push(parseFloat(row.nps));
        if (!isNaN(parseFloat(row.risiko))) data.risiko.push(parseFloat(row.risiko));
        if (!isNaN(parseFloat(row.combined))) data.combined.push(parseFloat(row.combined));
        if (!isNaN(parseFloat(row.underwriting))) data.underwriting.push(parseFloat(row.underwriting));
    });

    const result = Object.values(bundeslandMap).map(data => ({
        bundesland: data.bundesland,
        neugeschaeft: data.neugeschaeft,
        bestand: Object.values(data.bestand).reduce((sum, val) => sum + val, 0),
        storno: data.storno.length > 0 ? data.storno.reduce((a,b) => a+b, 0) / data.storno.length : 0,
        nps: data.nps.length > 0 ? data.nps.reduce((a,b) => a+b, 0) / data.nps.length : 0,
        risiko: data.risiko.length > 0 ? data.risiko.reduce((a,b) => a+b, 0) / data.risiko.length : 0,
        combined: data.combined.length > 0 ? data.combined.reduce((a,b) => a+b, 0) / data.combined.length : 0,
        ergebnis: data.ergebnis,
        underwriting: data.underwriting.length > 0 ? data.underwriting.reduce((a,b) => a+b, 0) / data.underwriting.length : 0,
        deckungsbeitrag: data.deckungsbeitrag
    }));

    return result.sort((a, b) => a.bundesland.localeCompare(b.bundesland));
}

/**
 * Get data grouped by Landkreise
 * @returns {Array} Array of Landkreis data objects
 */
export function getLandkreiseData() {
    const rawData = window.dailyRawData || dailyRawData;
    const currentState = window.state || state;

    if (!rawData || rawData.length === 0) return [];

    const kreisMap = {};
    let filteredData = rawData.filter(row => row.year == currentState.filters.year);

    if (currentState.filters.agentur !== 'alle') {
        filteredData = filteredData.filter(row => row.vermittler_id === currentState.filters.agentur);
    }
    if (currentState.filters.silo !== 'alle') {
        filteredData = filteredData.filter(row => row.silo === currentState.filters.silo);
    }
    if (!currentState.filters.segments.includes('alle')) {
        filteredData = filteredData.filter(row => currentState.filters.segments.includes(row.segment));
    }

    filteredData.forEach(row => {
        let kreis = row.landkreis || row.kreis;
        if (!kreis) return;

        if (typeof kreis === 'string') {
            kreis = kreis.replace(/^["']|["']$/g, '').trim();
        }

        if (!kreisMap[kreis]) {
            kreisMap[kreis] = {
                landkreis: kreis,
                bundesland: row.bundesland,
                neugeschaeft: 0,
                bestand: {},
                storno: [],
                nps: [],
                risiko: [],
                combined: [],
                ergebnis: 0,
                underwriting: [],
                deckungsbeitrag: 0
            };
        }

        const data = kreisMap[kreis];
        data.neugeschaeft += parseFloat(row.neugeschaeft) || 0;
        data.ergebnis += parseFloat(row.ergebnis) || 0;
        data.deckungsbeitrag += parseFloat(row.deckungsbeitrag) || 0;

        if (!isNaN(parseFloat(row.bestand)) && row.vermittler_id) {
            data.bestand[row.vermittler_id] = parseFloat(row.bestand);
        }

        if (!isNaN(parseFloat(row.storno))) data.storno.push(parseFloat(row.storno));
        if (!isNaN(parseFloat(row.nps))) data.nps.push(parseFloat(row.nps));
        if (!isNaN(parseFloat(row.risiko))) data.risiko.push(parseFloat(row.risiko));
        if (!isNaN(parseFloat(row.combined))) data.combined.push(parseFloat(row.combined));
        if (!isNaN(parseFloat(row.underwriting))) data.underwriting.push(parseFloat(row.underwriting));
    });

    const result = Object.values(kreisMap).map(data => ({
        landkreis: data.landkreis,
        bundesland: data.bundesland,
        neugeschaeft: data.neugeschaeft,
        bestand: Object.values(data.bestand).reduce((sum, val) => sum + val, 0),
        storno: data.storno.length > 0 ? data.storno.reduce((a,b) => a+b, 0) / data.storno.length : 0,
        nps: data.nps.length > 0 ? data.nps.reduce((a,b) => a+b, 0) / data.nps.length : 0,
        risiko: data.risiko.length > 0 ? data.risiko.reduce((a,b) => a+b, 0) / data.risiko.length : 0,
        combined: data.combined.length > 0 ? data.combined.reduce((a,b) => a+b, 0) / data.combined.length : 0,
        ergebnis: data.ergebnis,
        underwriting: data.underwriting.length > 0 ? data.underwriting.reduce((a,b) => a+b, 0) / data.underwriting.length : 0,
        deckungsbeitrag: data.deckungsbeitrag
    }));

    return result.sort((a, b) => a.landkreis.localeCompare(b.landkreis));
}

/**
 * Update the Agentur filter display button
 */
export function updateAgenturFilterDisplay() {
    const button = document.getElementById('agenturFilterButton');
    const currentState = window.state || state;
    if (!button) return;

    if (currentState.filters.agentur === 'alle') {
        button.querySelector('span').textContent = 'Alle Agenturen';
    } else {
        const agenturen = getAgenturen();
        const selected = agenturen.find(a => a.id === currentState.filters.agentur);
        if (selected) {
            const displayText = selected.name ?
                `${selected.id} - ${selected.name}` :
                selected.id;
            button.querySelector('span').textContent = displayText;
        }
    }
}

/**
 * Get data for multiple agents (for table view)
 * @returns {Array} Array of agent data objects
 */
export function getAgenturenData() {
    const rawData = window.dailyRawData || dailyRawData;
    const currentState = window.state || state;
    const kpis = window.kpiDefinitions || kpiDefinitions;

    if (!rawData || rawData.length === 0) return [];

    const agenturen = getAgenturen();
    const selectedIds = Array.from(currentState.selectedAgenturen);

    const agenturenToShow = selectedIds.length > 0 ?
        agenturen.filter(a => selectedIds.includes(a.id)) :
        agenturen;

    return agenturenToShow.map(agentur => {
        const agenturData = getAgenturData(agentur.id);
        return agenturData || {
            agentur: agentur.id,
            agentur_name: agentur.name || agentur.id,
            ...Object.fromEntries(kpis.map(kpi => [kpi.id, 0]))
        };
    }).filter(a => a !== null);
}

// ============================================
// BRIDGE: Set global variables for backward compatibility
// ============================================
if (typeof window !== 'undefined') {
    window.aggregateDailyToMonthly = aggregateDailyToMonthly;
    window.getFilteredData = getFilteredData;
    window.getAgenturen = getAgenturen;
    window.getAgenturData = getAgenturData;
    window.getBundeslaenderData = getBundeslaenderData;
    window.getLandkreiseData = getLandkreiseData;
    window.updateAgenturFilterDisplay = updateAgenturFilterDisplay;
    window.getAgenturenData = getAgenturenData;

    console.log('[ESM] data-functions.esm.js loaded');
}
