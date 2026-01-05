/**
 * state.esm.js - ES6 Module for State Management
 *
 * This module exports the global application state.
 * It also provides backward compatibility by setting global variables.
 */

/**
 * Global application state
 * @type {Object}
 */
export const state = {
    filters: {
        year: '2025',
        silo: 'alle',
        segments: ['alle'],
        products: ['alle'],
        agentur: 'alle'
    },
    selectedStates: new Set(),
    selectedCounties: new Set(),
    selectedAgenturen: new Set(),
    charts: {},
    fullscreenChart: null,
    useUploadedData: false,
    uploadedData: null,
    timeNavigation: {},
    currentView: 'dashboard',
    currentTableView: 'bundeslaender',
    selectedAgentur: null,
    tableSort: {
        column: null,
        direction: 'asc'
    }
};

/**
 * Store for daily raw data
 * @type {Array|null}
 */
export let dailyRawData = null;

/**
 * Set daily raw data
 * @param {Array} data - The daily data array
 */
export function setDailyRawData(data) {
    dailyRawData = data;
    // Update global for backward compatibility
    if (typeof window !== 'undefined') {
        window.dailyRawData = data;
    }
}

/**
 * Get daily raw data
 * @returns {Array|null} The daily data array
 */
export function getDailyRawData() {
    return dailyRawData;
}

/**
 * Reset state to initial values
 */
export function resetState() {
    state.filters = {
        year: '2025',
        silo: 'alle',
        segments: ['alle'],
        products: ['alle'],
        agentur: 'alle'
    };
    state.selectedStates.clear();
    state.selectedCounties.clear();
    state.selectedAgenturen.clear();
    state.charts = {};
    state.fullscreenChart = null;
    state.useUploadedData = false;
    state.uploadedData = null;
    state.timeNavigation = {};
    state.currentView = 'dashboard';
    state.currentTableView = 'bundeslaender';
    state.selectedAgentur = null;
    state.tableSort = { column: null, direction: 'asc' };
}

// ============================================
// BRIDGE: Set global variables for backward compatibility
// ============================================
if (typeof window !== 'undefined') {
    window.state = state;
    window.dailyRawData = dailyRawData;
    window.setDailyRawData = setDailyRawData;
    window.getDailyRawData = getDailyRawData;
    window.resetState = resetState;

    console.log('[ESM] state.esm.js loaded');
}
