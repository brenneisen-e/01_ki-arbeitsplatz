/**
 * tables.esm.js - ES6 Module for Table Functions
 *
 * This module handles table rendering and interactions.
 */

import { state } from './state.esm.js';
import { kpiDefinitions } from './config.esm.js';
import { formatValue } from './utils.esm.js';
import { getBundeslaenderData, getLandkreiseData, getAgenturenData, getAgenturen } from './data-functions.esm.js';

/**
 * Render table based on current view
 */
export function renderTable() {
    const currentState = window.state || state;
    const kpis = window.kpiDefinitions || kpiDefinitions;
    const tableHead = document.getElementById('tableHead');
    const tableBody = document.getElementById('tableBody');

    if (!tableHead || !tableBody) return;

    if (currentState.currentTableView === 'bundeslaender') {
        const data = getBundeslaenderData();

        tableHead.innerHTML = `
            <tr>
                <th class="sortable" data-column="bundesland">Bundesland</th>
                ${kpis.map(kpi => `
                    <th class="sortable" data-column="${kpi.id}">${kpi.title}</th>
                `).join('')}
            </tr>
        `;

        // Apply sorting
        if (currentState.tableSort.column) {
            data.sort((a, b) => {
                const valA = a[currentState.tableSort.column];
                const valB = b[currentState.tableSort.column];

                if (typeof valA === 'string') {
                    return currentState.tableSort.direction === 'asc' ?
                        valA.localeCompare(valB) : valB.localeCompare(valA);
                } else {
                    return currentState.tableSort.direction === 'asc' ?
                        valA - valB : valB - valA;
                }
            });

            const sortedHeader = tableHead.querySelector(`[data-column="${currentState.tableSort.column}"]`);
            if (sortedHeader) {
                sortedHeader.classList.add(`sorted-${currentState.tableSort.direction}`);
            }
        }

        if (data.length === 0) {
            tableBody.innerHTML = '<tr><td colspan="10" class="table-empty">Keine Daten verfügbar - bitte CSV-Datei mit Bundesland-Spalte hochladen</td></tr>';
        } else {
            tableBody.innerHTML = data.map(row => `
                <tr>
                    <td class="row-header">${row.bundesland}</td>
                    ${kpis.map(kpi => {
                        const value = row[kpi.id];
                        let cssClass = 'number';
                        if (kpi.id === 'ergebnis') {
                            cssClass += value >= 0 ? ' positive' : ' negative';
                        }
                        return `<td class="${cssClass}">${formatValue(value, kpi.unit)}</td>`;
                    }).join('')}
                </tr>
            `).join('');
        }

    } else if (currentState.currentTableView === 'landkreise') {
        const data = getLandkreiseData();

        tableHead.innerHTML = `
            <tr>
                <th class="sortable" data-column="landkreis">Landkreis</th>
                <th class="sortable" data-column="bundesland">Bundesland</th>
                ${kpis.map(kpi => `
                    <th class="sortable" data-column="${kpi.id}">${kpi.title}</th>
                `).join('')}
            </tr>
        `;

        // Apply sorting
        if (currentState.tableSort.column) {
            data.sort((a, b) => {
                const valA = a[currentState.tableSort.column];
                const valB = b[currentState.tableSort.column];

                if (typeof valA === 'string') {
                    return currentState.tableSort.direction === 'asc' ?
                        valA.localeCompare(valB) : valB.localeCompare(valA);
                } else {
                    return currentState.tableSort.direction === 'asc' ?
                        valA - valB : valB - valA;
                }
            });

            const sortedHeader = tableHead.querySelector(`[data-column="${currentState.tableSort.column}"]`);
            if (sortedHeader) {
                sortedHeader.classList.add(`sorted-${currentState.tableSort.direction}`);
            }
        }

        if (data.length === 0) {
            tableBody.innerHTML = '<tr><td colspan="11" class="table-empty">Keine Landkreis-Daten verfügbar - bitte CSV-Datei mit Landkreis-Spalte hochladen</td></tr>';
        } else {
            tableBody.innerHTML = data.map(row => `
                <tr>
                    <td class="row-header">${row.landkreis}</td>
                    <td>${row.bundesland}</td>
                    ${kpis.map(kpi => {
                        const value = row[kpi.id];
                        let cssClass = 'number';
                        if (kpi.id === 'ergebnis') {
                            cssClass += value >= 0 ? ' positive' : ' negative';
                        }
                        return `<td class="${cssClass}">${formatValue(value, kpi.unit)}</td>`;
                    }).join('')}
                </tr>
            `).join('');
        }

    } else {
        // Agentur view
        const data = getAgenturenData();

        tableHead.innerHTML = `
            <tr>
                <th class="sortable" data-column="agentur">Agentur</th>
                ${kpis.map(kpi => `
                    <th class="sortable" data-column="${kpi.id}">${kpi.title}</th>
                `).join('')}
            </tr>
        `;

        // Apply sorting
        if (currentState.tableSort.column) {
            data.sort((a, b) => {
                const valA = a[currentState.tableSort.column];
                const valB = b[currentState.tableSort.column];

                if (typeof valA === 'string') {
                    return currentState.tableSort.direction === 'asc' ?
                        valA.localeCompare(valB) : valB.localeCompare(valA);
                } else {
                    return currentState.tableSort.direction === 'asc' ?
                        valA - valB : valB - valA;
                }
            });

            const sortedHeader = tableHead.querySelector(`[data-column="${currentState.tableSort.column}"]`);
            if (sortedHeader) {
                sortedHeader.classList.add(`sorted-${currentState.tableSort.direction}`);
            }
        }

        if (data.length === 0) {
            tableBody.innerHTML = '<tr><td colspan="10" class="table-empty">Keine Agenturen verfügbar - bitte CSV-Datei hochladen</td></tr>';
        } else {
            tableBody.innerHTML = data.map(row => {
                const displayName = row.agentur_name ?
                    `${row.agentur} - ${row.agentur_name}` :
                    row.agentur;

                return `
                    <tr>
                        <td class="row-header">${displayName}</td>
                        ${kpis.map(kpi => {
                            const value = row[kpi.id];
                            let cssClass = 'number';
                            if (kpi.id === 'ergebnis') {
                                cssClass += value >= 0 ? ' positive' : ' negative';
                            }
                            return `<td class="${cssClass}">${formatValue(value, kpi.unit)}</td>`;
                        }).join('')}
                    </tr>
                `;
            }).join('');
        }
    }
}

/**
 * Update Agentur selector with names
 */
export function updateAgenturSelector() {
    const currentState = window.state || state;
    const selector = document.getElementById('agenturSelect');

    if (!selector) {
        console.log('ℹ️ agenturSelect nicht gefunden - Multi-Select UI wird verwendet');
        return;
    }

    const agenturen = getAgenturen();

    if (agenturen.length === 0) {
        selector.innerHTML = '<option value="">Keine Agenturen verfügbar (CSV hochladen)</option>';
        selector.disabled = true;
        return;
    }

    selector.disabled = false;
    selector.innerHTML = '<option value="">-- Agentur wählen --</option>' +
        agenturen.map(agent => {
            const displayText = agent.name ?
                `${agent.id} - ${agent.name}` :
                agent.id;
            return `<option value="${agent.id}">${displayText}</option>`;
        }).join('');

    if (currentState.selectedAgentur) {
        selector.value = currentState.selectedAgentur;
    }
}

// ============================================
// BRIDGE: Set global variables for backward compatibility
// ============================================
if (typeof window !== 'undefined') {
    window.renderTable = renderTable;
    window.updateAgenturSelector = updateAgenturSelector;

    console.log('[ESM] tables.esm.js loaded');
}
