// js/sales-report.js - Vertriebsbericht Funktionalität

// ========================================
// DEMO-DATEN FÜR ABSCHLÜSSE
// ========================================

// Demo-Abschlüsse für Maria Musterfrau (VM00001)
const demoAbschluesse = [
    {
        id: 'AB-2026-001',
        datum: '2026-01-20',
        versicherungsnehmer: 'Peter Schmidt',
        produkt: 'Risikolebensversicherung',
        tarif: 'Premium Plus',
        antragsnummer: 'ANT-2026-00142',
        beitrag: 89.00,
        zahlweise: 'monatlich',
        faktor: 12.0,
        ape: 1068.00,
        provision: 534.00,
        provisionssatz: 50.0,
        status: 'policiert'
    },
    {
        id: 'AB-2026-002',
        datum: '2026-01-15',
        versicherungsnehmer: 'Sabine König',
        produkt: 'Berufsunfähigkeitsversicherung',
        tarif: 'BU Comfort',
        antragsnummer: 'ANT-2026-00138',
        beitrag: 145.00,
        zahlweise: 'monatlich',
        faktor: 12.0,
        ape: 1740.00,
        provision: 1305.00,
        provisionssatz: 75.0,
        status: 'policiert'
    },
    {
        id: 'AB-2026-003',
        datum: '2026-01-10',
        versicherungsnehmer: 'Thomas Weber',
        produkt: 'Kfz-Versicherung',
        tarif: 'Vollkasko Premium',
        antragsnummer: 'ANT-2026-00135',
        beitrag: 720.00,
        zahlweise: 'jährlich',
        faktor: 1.0,
        ape: 720.00,
        provision: 108.00,
        provisionssatz: 15.0,
        status: 'policiert'
    },
    {
        id: 'AB-2026-004',
        datum: '2026-01-05',
        versicherungsnehmer: 'Maria Schneider',
        produkt: 'Hausratversicherung',
        tarif: 'Hausrat Plus',
        antragsnummer: 'ANT-2026-00129',
        beitrag: 185.00,
        zahlweise: 'jährlich',
        faktor: 1.0,
        ape: 185.00,
        provision: 37.00,
        provisionssatz: 20.0,
        status: 'policiert'
    },
    {
        id: 'AB-2025-098',
        datum: '2025-12-28',
        versicherungsnehmer: 'Andreas Müller',
        produkt: 'Private Krankenversicherung',
        tarif: 'PKV Basis',
        antragsnummer: 'ANT-2025-01922',
        beitrag: 485.00,
        zahlweise: 'monatlich',
        faktor: 12.0,
        ape: 5820.00,
        provision: 2910.00,
        provisionssatz: 50.0,
        status: 'policiert'
    },
    {
        id: 'AB-2025-097',
        datum: '2025-12-20',
        versicherungsnehmer: 'Julia Fischer',
        produkt: 'Unfallversicherung',
        tarif: 'Unfall Premium',
        antragsnummer: 'ANT-2025-01876',
        beitrag: 220.00,
        zahlweise: 'jährlich',
        faktor: 1.0,
        ape: 220.00,
        provision: 55.00,
        provisionssatz: 25.0,
        status: 'policiert'
    },
    {
        id: 'AB-2025-096',
        datum: '2025-12-15',
        versicherungsnehmer: 'Michael Bauer',
        produkt: 'Rechtsschutzversicherung',
        tarif: 'Rundum-Schutz',
        antragsnummer: 'ANT-2025-01865',
        beitrag: 280.00,
        zahlweise: 'jährlich',
        faktor: 1.0,
        ape: 280.00,
        provision: 84.00,
        provisionssatz: 30.0,
        status: 'policiert'
    },
    {
        id: 'AB-2025-095',
        datum: '2025-12-10',
        versicherungsnehmer: 'Lisa Wagner',
        produkt: 'Risikolebensversicherung',
        tarif: 'Standard',
        antragsnummer: 'ANT-2025-01852',
        beitrag: 45.00,
        zahlweise: 'monatlich',
        faktor: 12.0,
        ape: 540.00,
        provision: 270.00,
        provisionssatz: 50.0,
        status: 'policiert'
    },
    {
        id: 'AB-2025-094',
        datum: '2025-12-05',
        versicherungsnehmer: 'Stefan Hoffmann',
        produkt: 'Wohngebäudeversicherung',
        tarif: 'Gebäude Komfort',
        antragsnummer: 'ANT-2025-01840',
        beitrag: 450.00,
        zahlweise: 'jährlich',
        faktor: 1.0,
        ape: 450.00,
        provision: 90.00,
        provisionssatz: 20.0,
        status: 'policiert'
    },
    {
        id: 'AB-2025-093',
        datum: '2025-11-28',
        versicherungsnehmer: 'Claudia Richter',
        produkt: 'Berufsunfähigkeitsversicherung',
        tarif: 'BU Premium',
        antragsnummer: 'ANT-2025-01828',
        beitrag: 178.00,
        zahlweise: 'monatlich',
        faktor: 12.0,
        ape: 2136.00,
        provision: 1602.00,
        provisionssatz: 75.0,
        status: 'policiert'
    },
    {
        id: 'AB-2025-092',
        datum: '2025-11-22',
        versicherungsnehmer: 'Robert Klein',
        produkt: 'Kfz-Versicherung',
        tarif: 'Haftpflicht Plus',
        antragsnummer: 'ANT-2025-01815',
        beitrag: 380.00,
        zahlweise: 'jährlich',
        faktor: 1.0,
        ape: 380.00,
        provision: 57.00,
        provisionssatz: 15.0,
        status: 'policiert'
    },
    {
        id: 'AB-2025-091',
        datum: '2025-11-15',
        versicherungsnehmer: 'Anna Berger',
        produkt: 'Private Haftpflichtversicherung',
        tarif: 'Haftpflicht Family',
        antragsnummer: 'ANT-2025-01798',
        beitrag: 85.00,
        zahlweise: 'jährlich',
        faktor: 1.0,
        ape: 85.00,
        provision: 21.25,
        provisionssatz: 25.0,
        status: 'policiert'
    },
    {
        id: 'AB-2025-090',
        datum: '2025-11-08',
        versicherungsnehmer: 'Frank Neumann',
        produkt: 'Rentenversicherung',
        tarif: 'Rente Flex',
        antragsnummer: 'ANT-2025-01780',
        beitrag: 200.00,
        zahlweise: 'monatlich',
        faktor: 12.0,
        ape: 2400.00,
        provision: 1200.00,
        provisionssatz: 50.0,
        status: 'policiert'
    },
    {
        id: 'AB-2025-089',
        datum: '2025-11-02',
        versicherungsnehmer: 'Sandra Wolf',
        produkt: 'Zahnzusatzversicherung',
        tarif: 'Zahn Premium',
        antragsnummer: 'ANT-2025-01765',
        beitrag: 35.00,
        zahlweise: 'monatlich',
        faktor: 12.0,
        ape: 420.00,
        provision: 126.00,
        provisionssatz: 30.0,
        status: 'policiert'
    },
    {
        id: 'AB-2025-088',
        datum: '2025-10-25',
        versicherungsnehmer: 'Markus Schwarz',
        produkt: 'Berufsunfähigkeitsversicherung',
        tarif: 'BU Basis',
        antragsnummer: 'ANT-2025-01752',
        beitrag: 95.00,
        zahlweise: 'monatlich',
        faktor: 12.0,
        ape: 1140.00,
        provision: 855.00,
        provisionssatz: 75.0,
        status: 'policiert'
    }
];

// Produktkategorien für Reiter
const produktKategorien = {
    'alle': 'Alle Produkte',
    'leben': 'Leben',
    'kranken': 'Kranken',
    'sach': 'Sach/Kfz'
};

// Mapping von Produkten zu Kategorien
const produktZuKategorie = {
    'Risikolebensversicherung': 'leben',
    'Berufsunfähigkeitsversicherung': 'leben',
    'Rentenversicherung': 'leben',
    'Private Krankenversicherung': 'kranken',
    'Zahnzusatzversicherung': 'kranken',
    'Kfz-Versicherung': 'sach',
    'Hausratversicherung': 'sach',
    'Wohngebäudeversicherung': 'sach',
    'Unfallversicherung': 'sach',
    'Rechtsschutzversicherung': 'sach',
    'Private Haftpflichtversicherung': 'sach'
};

// Status für Reiter
const statusOptionen = {
    'alle': 'Alle Status',
    'policiert': 'Policiert',
    'in_bearbeitung': 'In Bearbeitung',
    'storniert': 'Storniert'
};

// Zeitraum für Reiter
const zeitraumOptionen = {
    'alle': 'Gesamter Zeitraum',
    '30': 'Letzte 30 Tage',
    '90': 'Letzte 90 Tage',
    '365': 'Letztes Jahr'
};

// ========================================
// VERTRIEBSBERICHT STATE
// ========================================

let salesReportState = {
    currentFilter: {
        zeitraum: 'alle',
        kategorie: 'alle',
        status: 'alle'
    },
    currentPage: 1,
    itemsPerPage: 10,
    filteredAgentur: null, // Wird gesetzt wenn über Chatbot navigiert
    isVisible: false
};

// ========================================
// VERTRIEBSBERICHT FUNKTIONEN
// ========================================

/**
 * Zeigt den Vertriebsbericht-Bereich an
 * @param {string} agenturId - Optional: Agentur-ID zum Filtern
 */
function showSalesReport(agenturId = null) {
    console.log('Zeige Vertriebsbericht für:', agenturId || 'Alle');

    salesReportState.filteredAgentur = agenturId;
    salesReportState.isVisible = true;
    salesReportState.currentPage = 1;

    const container = document.getElementById('salesReportContainer');
    if (container) {
        container.style.display = 'block';
        renderSalesReport();
        generateAISummary();

        // Scroll zum Vertriebsbericht
        setTimeout(() => {
            container.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 100);
    }
}

/**
 * Versteckt den Vertriebsbericht-Bereich
 */
function hideSalesReport() {
    salesReportState.isVisible = false;
    const container = document.getElementById('salesReportContainer');
    if (container) {
        container.style.display = 'none';
    }
}

/**
 * Filtert Abschlüsse basierend auf aktuellen Filtern
 */
function getFilteredAbschluesse() {
    let filtered = [...demoAbschluesse];

    // Zeitraum-Filter
    if (salesReportState.currentFilter.zeitraum !== 'alle') {
        const days = parseInt(salesReportState.currentFilter.zeitraum);
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - days);

        filtered = filtered.filter(a => new Date(a.datum) >= cutoffDate);
    }

    // Kategorie-Filter
    if (salesReportState.currentFilter.kategorie !== 'alle') {
        filtered = filtered.filter(a => {
            const kategorie = produktZuKategorie[a.produkt] || 'sach';
            return kategorie === salesReportState.currentFilter.kategorie;
        });
    }

    // Status-Filter
    if (salesReportState.currentFilter.status !== 'alle') {
        filtered = filtered.filter(a => a.status === salesReportState.currentFilter.status);
    }

    return filtered;
}

/**
 * Rendert den Vertriebsbericht
 */
function renderSalesReport() {
    renderFilterTabs();
    renderAbschlussTabelle();
    renderPagination();
    renderKennzahlenSummary();
}

/**
 * Rendert die Filter-Tabs
 */
function renderFilterTabs() {
    const tabsContainer = document.getElementById('salesReportTabs');
    if (!tabsContainer) return;

    tabsContainer.innerHTML = `
        <div class="sales-report-filter-group">
            <label>Zeitraum:</label>
            <div class="filter-tabs">
                ${Object.entries(zeitraumOptionen).map(([key, label]) => `
                    <button class="filter-tab ${salesReportState.currentFilter.zeitraum === key ? 'active' : ''}"
                            onclick="setSalesReportFilter('zeitraum', '${key}')">
                        ${label}
                    </button>
                `).join('')}
            </div>
        </div>
        <div class="sales-report-filter-group">
            <label>Produkt:</label>
            <div class="filter-tabs">
                ${Object.entries(produktKategorien).map(([key, label]) => `
                    <button class="filter-tab ${salesReportState.currentFilter.kategorie === key ? 'active' : ''}"
                            onclick="setSalesReportFilter('kategorie', '${key}')">
                        ${label}
                    </button>
                `).join('')}
            </div>
        </div>
        <div class="sales-report-filter-group">
            <label>Status:</label>
            <div class="filter-tabs">
                ${Object.entries(statusOptionen).map(([key, label]) => `
                    <button class="filter-tab ${salesReportState.currentFilter.status === key ? 'active' : ''}"
                            onclick="setSalesReportFilter('status', '${key}')">
                        ${label}
                    </button>
                `).join('')}
            </div>
        </div>
    `;
}

/**
 * Setzt einen Filter und aktualisiert die Anzeige
 */
function setSalesReportFilter(filterType, value) {
    salesReportState.currentFilter[filterType] = value;
    salesReportState.currentPage = 1;
    renderSalesReport();
}

/**
 * Rendert die Abschluss-Tabelle
 */
function renderAbschlussTabelle() {
    const tableBody = document.getElementById('salesReportTableBody');
    if (!tableBody) return;

    const filtered = getFilteredAbschluesse();
    const startIndex = (salesReportState.currentPage - 1) * salesReportState.itemsPerPage;
    const endIndex = startIndex + salesReportState.itemsPerPage;
    const pageItems = filtered.slice(startIndex, endIndex);

    if (pageItems.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="9" class="empty-state">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="48" height="48">
                        <circle cx="12" cy="12" r="10"></circle>
                        <line x1="12" y1="8" x2="12" y2="12"></line>
                        <line x1="12" y1="16" x2="12.01" y2="16"></line>
                    </svg>
                    <p>Keine Abschlüsse für die ausgewählten Filter gefunden.</p>
                </td>
            </tr>
        `;
        return;
    }

    tableBody.innerHTML = pageItems.map(abschluss => {
        const formattedDate = new Date(abschluss.datum).toLocaleDateString('de-DE');
        const statusClass = abschluss.status === 'policiert' ? 'success' :
                           abschluss.status === 'in_bearbeitung' ? 'warning' : 'error';

        return `
            <tr>
                <td>${formattedDate}</td>
                <td><strong>${abschluss.versicherungsnehmer}</strong></td>
                <td>${abschluss.produkt}</td>
                <td>${abschluss.tarif}</td>
                <td class="mono">${abschluss.antragsnummer}</td>
                <td class="number">€${abschluss.beitrag.toFixed(2)} <span class="zahlweise">${abschluss.zahlweise}</span></td>
                <td class="number">${abschluss.faktor.toFixed(1)}</td>
                <td class="number highlight">€${abschluss.provision.toFixed(2)}</td>
                <td><span class="status-badge ${statusClass}">${abschluss.status}</span></td>
            </tr>
        `;
    }).join('');
}

/**
 * Rendert die Pagination
 */
function renderPagination() {
    const paginationContainer = document.getElementById('salesReportPagination');
    if (!paginationContainer) return;

    const filtered = getFilteredAbschluesse();
    const totalPages = Math.ceil(filtered.length / salesReportState.itemsPerPage);

    if (totalPages <= 1) {
        paginationContainer.innerHTML = `<span class="pagination-info">${filtered.length} Abschlüsse</span>`;
        return;
    }

    let paginationHTML = `<span class="pagination-info">${filtered.length} Abschlüsse</span>`;
    paginationHTML += '<div class="pagination-buttons">';

    // Vorherige Seite
    paginationHTML += `
        <button class="pagination-btn" ${salesReportState.currentPage === 1 ? 'disabled' : ''}
                onclick="changeSalesReportPage(${salesReportState.currentPage - 1})">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16">
                <polyline points="15 18 9 12 15 6"></polyline>
            </svg>
        </button>
    `;

    // Seiten-Nummern
    for (let i = 1; i <= totalPages; i++) {
        if (i === 1 || i === totalPages || (i >= salesReportState.currentPage - 1 && i <= salesReportState.currentPage + 1)) {
            paginationHTML += `
                <button class="pagination-btn ${i === salesReportState.currentPage ? 'active' : ''}"
                        onclick="changeSalesReportPage(${i})">${i}</button>
            `;
        } else if (i === salesReportState.currentPage - 2 || i === salesReportState.currentPage + 2) {
            paginationHTML += '<span class="pagination-ellipsis">...</span>';
        }
    }

    // Nächste Seite
    paginationHTML += `
        <button class="pagination-btn" ${salesReportState.currentPage === totalPages ? 'disabled' : ''}
                onclick="changeSalesReportPage(${salesReportState.currentPage + 1})">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16">
                <polyline points="9 18 15 12 9 6"></polyline>
            </svg>
        </button>
    `;

    paginationHTML += '</div>';
    paginationContainer.innerHTML = paginationHTML;
}

/**
 * Wechselt die Seite
 */
function changeSalesReportPage(page) {
    const filtered = getFilteredAbschluesse();
    const totalPages = Math.ceil(filtered.length / salesReportState.itemsPerPage);

    if (page < 1 || page > totalPages) return;

    salesReportState.currentPage = page;
    renderAbschlussTabelle();
    renderPagination();
}

/**
 * Rendert die Kennzahlen-Zusammenfassung
 */
function renderKennzahlenSummary() {
    const summaryContainer = document.getElementById('salesReportSummary');
    if (!summaryContainer) return;

    const filtered = getFilteredAbschluesse();

    const totalAPE = filtered.reduce((sum, a) => sum + a.ape, 0);
    const totalProvision = filtered.reduce((sum, a) => sum + a.provision, 0);
    const avgProvisionRate = filtered.length > 0 ?
        filtered.reduce((sum, a) => sum + a.provisionssatz, 0) / filtered.length : 0;
    const avgBeitrag = filtered.length > 0 ?
        filtered.reduce((sum, a) => sum + a.beitrag, 0) / filtered.length : 0;

    summaryContainer.innerHTML = `
        <div class="summary-card">
            <div class="summary-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="24" height="24">
                    <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"></path>
                    <polyline points="14 2 14 8 20 8"></polyline>
                </svg>
            </div>
            <div class="summary-content">
                <div class="summary-value">${filtered.length}</div>
                <div class="summary-label">Abschlüsse</div>
            </div>
        </div>
        <div class="summary-card">
            <div class="summary-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="24" height="24">
                    <line x1="12" y1="1" x2="12" y2="23"></line>
                    <path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"></path>
                </svg>
            </div>
            <div class="summary-content">
                <div class="summary-value">€${formatNumber(totalAPE)}</div>
                <div class="summary-label">APE Gesamt</div>
            </div>
        </div>
        <div class="summary-card highlight">
            <div class="summary-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="24" height="24">
                    <rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect>
                    <line x1="1" y1="10" x2="23" y2="10"></line>
                </svg>
            </div>
            <div class="summary-content">
                <div class="summary-value">€${formatNumber(totalProvision)}</div>
                <div class="summary-label">Provision Gesamt</div>
            </div>
        </div>
        <div class="summary-card">
            <div class="summary-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="24" height="24">
                    <line x1="18" y1="20" x2="18" y2="10"></line>
                    <line x1="12" y1="20" x2="12" y2="4"></line>
                    <line x1="6" y1="20" x2="6" y2="14"></line>
                </svg>
            </div>
            <div class="summary-content">
                <div class="summary-value">${avgProvisionRate.toFixed(1)}%</div>
                <div class="summary-label">Ø Provisionssatz</div>
            </div>
        </div>
    `;
}

/**
 * Formatiert eine Zahl für die Anzeige
 */
function formatNumber(value) {
    if (value >= 1000000) {
        return (value / 1000000).toFixed(2) + ' Mio';
    } else if (value >= 1000) {
        return (value / 1000).toFixed(1) + 'k';
    }
    return value.toFixed(2);
}

// ========================================
// KI-ZUSAMMENFASSUNG
// ========================================

/**
 * Generiert die KI-Zusammenfassung für die letzten 3 Monate
 */
function generateAISummary() {
    const summaryContainer = document.getElementById('salesReportAISummary');
    if (!summaryContainer) return;

    // Zeige Loading-State
    summaryContainer.innerHTML = `
        <div class="ai-summary-loading">
            <div class="ai-loading-spinner"></div>
            <span>KI-Analyse wird erstellt...</span>
        </div>
    `;

    // Simuliere API-Aufruf (in Produktion wuerde hier der API Call stehen)
    setTimeout(() => {
        const summary = generateLocalAISummary();
        renderAISummary(summary);
    }, 1500);
}

/**
 * Generiert eine lokale KI-Zusammenfassung basierend auf den Daten
 */
function generateLocalAISummary() {
    // Filtere auf letzte 3 Monate
    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

    const recentAbschluesse = demoAbschluesse.filter(a => new Date(a.datum) >= threeMonthsAgo);

    // Berechne Kennzahlen
    const totalAbschluesse = recentAbschluesse.length;
    const totalAPE = recentAbschluesse.reduce((sum, a) => sum + a.ape, 0);
    const totalProvision = recentAbschluesse.reduce((sum, a) => sum + a.provision, 0);

    // Kategorien-Verteilung
    const kategorienCount = {};
    recentAbschluesse.forEach(a => {
        const kat = produktZuKategorie[a.produkt] || 'sonstiges';
        kategorienCount[kat] = (kategorienCount[kat] || 0) + 1;
    });

    // Top-Kategorie ermitteln
    const topKategorie = Object.entries(kategorienCount).sort((a, b) => b[1] - a[1])[0];

    // Durchschnittliche APE pro Abschluss
    const avgAPE = totalAbschluesse > 0 ? totalAPE / totalAbschluesse : 0;

    // Terminquote berechnen (simuliert: Angebote vs. Abschlüsse)
    const simulatedAngebote = Math.floor(totalAbschluesse * 1.4); // 70% Abschlussquote
    const terminquote = ((totalAbschluesse / simulatedAngebote) * 100).toFixed(1);

    // Trend berechnen (simuliert)
    const trendPositiv = totalAPE > 10000;

    // Berechne Kategorie-Verteilung für Fließtext
    const sachCount = kategorienCount['sach'] || 0;
    const lebenCount = kategorienCount['leben'] || 0;
    const krankenCount = kategorienCount['kranken'] || 0;

    // Generiere Fließtext-Zusammenfassung (4-5 Sätze)
    const topKatName = topKategorie ? produktKategorien[topKategorie[0]] : 'Sach/Kfz';
    const avgProvision = totalAbschluesse > 0 ? (totalProvision / totalAbschluesse) : 0;

    let fliesstext = `In den letzten drei Monaten wurden <strong>${totalAbschluesse} Verträge</strong> mit einem Gesamtvolumen von <strong>€${formatNumber(totalAPE)} APE</strong> abgeschlossen, was einer durchschnittlichen Provision von <strong>€${formatNumber(avgProvision)}</strong> pro Abschluss entspricht. `;
    fliesstext += `Der Vertriebsschwerpunkt lag mit <strong>${topKategorie ? topKategorie[1] : 0} Abschlüssen</strong> im Bereich <strong>${topKatName}</strong>, gefolgt von ${lebenCount > 0 ? 'Leben-Produkten' : 'anderen Sparten'}. `;
    fliesstext += `Die <strong>Terminquote von ${terminquote}%</strong> liegt ${parseFloat(terminquote) > 65 ? 'über' : 'unter'} dem Branchendurchschnitt von 65% und zeigt ${parseFloat(terminquote) > 65 ? '<strong>eine effiziente Kundenakquise</strong>' : 'Optimierungspotential bei der Terminvereinbarung'}. `;
    fliesstext += `Besonders lukrativ war das <strong>BU-Geschäft</strong> mit einem durchschnittlichen Provisionssatz von <strong>75%</strong>, welches weiter ausgebaut werden sollte. `;
    fliesstext += trendPositiv
        ? `Insgesamt zeigt die Agentur eine <strong>positive Entwicklung</strong> und ist auf einem guten Weg, die Jahresziele zu erreichen.`
        : `Um die Jahresziele zu erreichen, wird empfohlen, den Fokus auf höherwertige Produkte wie <strong>BU und PKV</strong> zu legen.`;

    return {
        zeitraum: 'Letzte 3 Monate',
        totalAbschluesse,
        totalAPE,
        totalProvision,
        avgAPE,
        topKategorie: topKategorie ? { name: produktKategorien[topKategorie[0]] || topKategorie[0], count: topKategorie[1] } : null,
        terminquote,
        simulatedAngebote,
        trendPositiv,
        fliesstext,
        insights: [
            {
                type: trendPositiv ? 'positive' : 'warning',
                text: trendPositiv
                    ? `Starke Performance mit €${formatNumber(totalAPE)} APE in den letzten 3 Monaten.`
                    : `APE-Entwicklung unter Ziel. Fokus auf höherwertige Produkte empfohlen.`
            },
            {
                type: 'info',
                text: `Schwerpunkt liegt auf ${topKategorie ? produktKategorien[topKategorie[0]] : 'Sach'}-Produkten (${topKategorie ? topKategorie[1] : 0} Abschlüsse).`
            },
            {
                type: parseFloat(terminquote) > 65 ? 'positive' : 'warning',
                text: `Terminquote von ${terminquote}% ${parseFloat(terminquote) > 65 ? 'überdurchschnittlich' : 'mit Optimierungspotential'}.`
            },
            {
                type: 'recommendation',
                text: 'Empfehlung: BU-Geschäft mit durchschnittlich 75% Provisionssatz weiter ausbauen.'
            }
        ]
    };
}

/**
 * Rendert die KI-Zusammenfassung
 */
function renderAISummary(summary) {
    const summaryContainer = document.getElementById('salesReportAISummary');
    if (!summaryContainer) return;

    summaryContainer.innerHTML = `
        <div class="ai-summary-header">
            <div class="ai-summary-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="24" height="24">
                    <circle cx="12" cy="12" r="3"></circle>
                    <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z"></path>
                </svg>
            </div>
            <div class="ai-summary-title">
                <h4>KI-Analyse: ${summary.zeitraum}</h4>
                <span class="ai-badge">Automatisch generiert</span>
            </div>
        </div>

        <div class="ai-summary-metrics">
            <div class="ai-metric">
                <span class="ai-metric-label">Abschlüsse</span>
                <span class="ai-metric-value">${summary.totalAbschluesse}</span>
            </div>
            <div class="ai-metric">
                <span class="ai-metric-label">APE</span>
                <span class="ai-metric-value">€${formatNumber(summary.totalAPE)}</span>
            </div>
            <div class="ai-metric">
                <span class="ai-metric-label">Provision</span>
                <span class="ai-metric-value">€${formatNumber(summary.totalProvision)}</span>
            </div>
            <div class="ai-metric">
                <span class="ai-metric-label">Terminquote</span>
                <span class="ai-metric-value">${summary.terminquote}%</span>
            </div>
        </div>

        <div class="ai-summary-text">
            <p>${summary.fliesstext}</p>
        </div>

        <div class="ai-summary-insights">
            ${summary.insights.map(insight => `
                <div class="ai-insight ${insight.type}">
                    <span class="insight-icon">
                        ${insight.type === 'positive' ? '✓' :
                          insight.type === 'warning' ? '!' :
                          insight.type === 'recommendation' ? '→' : 'i'}
                    </span>
                    <span class="insight-text">${insight.text}</span>
                </div>
            `).join('')}
        </div>
    `;
}

// ========================================
// NAVIGATION: CHATBOT -> VERTRIEBSBERICHT
// ========================================

/**
 * Navigiert zum Dashboard (A-03) und zeigt den Vertriebsbericht für eine Agentur
 * @param {string} agenturId - Die Agentur-ID (z.B. 'VM00001')
 */
function navigateToSalesReport(agenturId) {
    console.log('Navigation zu Vertriebsbericht für:', agenturId);

    // 1. Verstecke andere Seiten und zeige Dashboard
    const pages = ['landingPage', 'agenturOverview', 'potentialAnalysePage', 'kundenDetailPage', 'billingCheckPage'];
    pages.forEach(pageId => {
        const page = document.getElementById(pageId);
        if (page) page.style.display = 'none';
    });

    // Verstecke auch den Agentur-Chat
    const agenturChatWidget = document.getElementById('agenturChatWidget');
    const agenturChatToggle = document.getElementById('agenturChatToggle');
    if (agenturChatWidget) agenturChatWidget.style.display = 'none';
    if (agenturChatToggle) agenturChatToggle.style.display = 'none';

    // Zeige Dashboard
    const mainApp = document.getElementById('mainApp');
    const dashboardView = document.getElementById('dashboardView');
    if (mainApp) {
        mainApp.style.display = 'block';
    }
    if (dashboardView) {
        dashboardView.style.display = 'flex';
    }

    // 2. Setze Agentur-Filter und aktualisiere UI (verzögert um sicherzustellen dass Dashboard initialisiert ist)
    setTimeout(() => {
        if (typeof setAgenturFilter === 'function') {
            setAgenturFilter(agenturId);
            console.log('setAgenturFilter aufgerufen mit:', agenturId);
        } else if (typeof state !== 'undefined') {
            // Fallback: State direkt setzen
            state.filters.agentur = agenturId;
            console.log('state.filters.agentur direkt gesetzt:', agenturId);
            // Update Agentur-Dropdown UI
            if (typeof updateAgenturFilterDisplay === 'function') {
                updateAgenturFilterDisplay();
            }
        }

        // Immer KPIs aktualisieren um sicherzustellen dass die Filter angewendet werden
        if (typeof updateAllKPIs === 'function') {
            updateAllKPIs();
            console.log('updateAllKPIs aufgerufen');
        }

        // Update Agentur-Dropdown nochmal zur Sicherheit
        if (typeof updateAgenturFilterDisplay === 'function') {
            updateAgenturFilterDisplay();
        }
    }, 100);

    // 3. Zeige Vertriebsbericht
    setTimeout(() => {
        showSalesReport(agenturId);
    }, 400);

    // 4. Dispatch Event für Page-ID-Tracker
    document.dispatchEvent(new CustomEvent('viewChanged', {
        detail: { module: 'versicherung', view: 'dashboard' }
    }));
}

// ========================================
// GLOBAL EXPORTS
// ========================================

window.showSalesReport = showSalesReport;
window.hideSalesReport = hideSalesReport;
window.setSalesReportFilter = setSalesReportFilter;
window.changeSalesReportPage = changeSalesReportPage;
window.navigateToSalesReport = navigateToSalesReport;
window.demoAbschluesse = demoAbschluesse;

console.log('sales-report.js geladen');
