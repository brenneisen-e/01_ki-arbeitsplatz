/**
 * utils.esm.js - ES6 Module Version of Utility Functions
 *
 * This module exports all utility functions.
 * It also provides backward compatibility by setting global variables.
 */

import { agentDistributions, bundeslandFactors } from './config.esm.js';

/**
 * Format value based on unit type
 * @param {number} value - The value to format
 * @param {string} unit - The unit type ('currency', 'percent', 'score')
 * @returns {string} Formatted value
 */
export function formatValue(value, unit) {
    if (value === null || typeof value === 'undefined' || isNaN(value)) return '--';
    const numValue = Number(value);

    switch(unit) {
        case 'currency':
            const absValue = Math.abs(numValue);
            let formatted = '';
            if (absValue >= 1000000000) {
                formatted = '€' + (absValue / 1000000000).toFixed(2) + ' Mrd';
            } else if (absValue >= 1000000) {
                formatted = '€' + (absValue / 1000000).toFixed(1) + ' Mio';
            } else if (absValue >= 1000) {
                formatted = '€' + (absValue / 1000).toFixed(0) + 'k';
            } else {
                formatted = '€' + absValue.toFixed(0);
            }
            return numValue < 0 ? '-' + formatted : formatted;
        case 'percent':
            return numValue.toFixed(1) + '%';
        case 'score':
            return (numValue > 0 ? '+' : '') + Math.round(numValue);
        default:
            return numValue.toFixed(0);
    }
}

/**
 * Get month name in German
 * @param {number} monthNum - Month number (1-12)
 * @returns {string} Month name
 */
export function getMonthName(monthNum) {
    const months = ['Januar', 'Februar', 'März', 'April', 'Mai', 'Juni',
                   'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'];
    return months[monthNum - 1] || '';
}

/**
 * Parse CSV text into array of objects
 * @param {string} csvText - Raw CSV text
 * @returns {Array} Array of parsed row objects
 */
export function parseCSV(csvText) {
    const lines = csvText.split('\n').filter(line => line.trim());
    const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
    const data = [];

    for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',').map(v => v.trim());
        const row = {};
        headers.forEach((header, index) => {
            const value = values[index];
            let normalizedHeader = header;

            const headerMapping = {
                'vermittler_id': 'vermittler_id',
                'vermittlerid': 'vermittler_id',
                'agent_id': 'vermittler_id',
                'agentid': 'vermittler_id'
            };

            if (headerMapping[header]) {
                normalizedHeader = headerMapping[header];
            }

            if (!isNaN(value) && value !== '') {
                row[normalizedHeader] = parseFloat(value);
            } else {
                row[normalizedHeader] = value;
            }
        });
        data.push(row);
    }

    console.log('CSV parsed:', data.length, 'rows');
    console.log('Headers:', headers);
    console.log('Sample row:', data[0]);

    return data;
}

/**
 * Toggle dropdown visibility
 * @param {string} dropdownId - ID of the dropdown menu element
 */
export function toggleDropdown(dropdownId) {
    const menu = document.getElementById(dropdownId);
    const allMenus = document.querySelectorAll('.dropdown-menu');

    allMenus.forEach(m => {
        if (m.id !== dropdownId) {
            m.classList.remove('show');
        }
    });

    menu.classList.toggle('show');
}

/**
 * Wait for external libraries (Leaflet, Chart.js) to load
 * @param {Function} callback - Function to call when libraries are ready
 */
export function waitForLibraries(callback) {
    const checkInterval = setInterval(function() {
        if (typeof L !== 'undefined' && typeof Chart !== 'undefined') {
            clearInterval(checkInterval);
            callback();
        }
    }, 100);

    setTimeout(function() {
        clearInterval(checkInterval);
        if (typeof L === 'undefined') {
            console.error('Failed to load Leaflet');
            const mapEl = document.getElementById('map');
            if (mapEl) {
                mapEl.innerHTML = '<div style="padding: 2rem; text-align: center; color: #64748b;">Karte konnte nicht geladen werden</div>';
            }
        }
    }, 5000);
}

/**
 * Generate agent distribution based on KPI and current filters
 * Note: This function depends on global 'state' variable
 * @param {string} kpiId - The KPI identifier
 * @param {number} currentValue - Current value for the KPI
 * @returns {Array} Distribution array with range and count
 */
export function generateAgentDistribution(kpiId, currentValue) {
    // Access global state (bridge compatibility)
    const state = window.state || { selectedStates: new Set(), filters: { silo: 'alle' } };

    let baseDistribution = agentDistributions[kpiId] || agentDistributions['neugeschaeft'];

    // Adjust based on selected states
    if (state.selectedStates.size > 0) {
        const allStatesTotal = Object.values(bundeslandFactors).reduce((sum, f) => sum + f, 0);
        let selectedTotal = 0;
        state.selectedStates.forEach(land => {
            selectedTotal += (bundeslandFactors[land] || 1.0);
        });
        const proportion = selectedTotal / allStatesTotal;

        baseDistribution = baseDistribution.map(item => ({
            ...item,
            count: Math.round(item.count * proportion)
        }));
    }

    // Adjust based on silo filter
    if (state.filters.silo !== 'alle') {
        const siloMultiplier = {
            'Ausschließlichkeit': 1.2,
            'Makler': 0.9,
            'Direktvertrieb': 0.6,
            'Banken': 0.3
        }[state.filters.silo] || 1;

        baseDistribution = baseDistribution.map(item => ({
            ...item,
            count: Math.round(item.count * siloMultiplier)
        }));
    }

    return baseDistribution;
}

// ============================================
// BRIDGE: Set global variables for backward compatibility
// ============================================
if (typeof window !== 'undefined') {
    window.formatValue = formatValue;
    window.getMonthName = getMonthName;
    window.parseCSV = parseCSV;
    window.toggleDropdown = toggleDropdown;
    window.waitForLibraries = waitForLibraries;
    window.generateAgentDistribution = generateAgentDistribution;

    console.log('[ESM] utils.esm.js loaded');
}
