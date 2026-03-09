// ========================================
// NEW: Dashboard Functions
// ========================================

// Store chart instances for updates
let scatterPlotChart = null;
let portfolioChart = null;

// Initialize Banken Charts
function initBankenCharts() {
    console.log('Initializing Banken charts...');
    initScatterPlot();
    initPortfolioChart();
}

// Initialize Scatter Plot for Willingness vs. Ability Matrix
function initScatterPlot() {
    const canvas = document.getElementById('scatterPlotCanvas');
    if (!canvas) {
        console.warn('Scatter plot canvas not found');
        return;
    }

    const ctx = canvas.getContext('2d');

    // Generate sample data points for each quadrant
    const generatePoints = (count, xMin, xMax, yMin, yMax, color) => {
        const points = [];
        for (let i = 0; i < count; i++) {
            points.push({
                x: xMin + Math.random() * (xMax - xMin),
                y: yMin + Math.random() * (yMax - yMin),
            });
        }
        return points;
    };

    // Quadrant data (Willingness = X, Ability = Y)
    // Q1: High Willingness, High Ability (Priorität) - top right
    const prioritaetData = generatePoints(45, 55, 95, 55, 95, '#22c55e');
    // Q2: Low Willingness, High Ability (Restrukturierung) - top left
    const restrukturierungData = generatePoints(60, 5, 45, 55, 95, '#eab308');
    // Q3: Low Willingness, Low Ability (Eskalation) - bottom left
    const eskalationData = generatePoints(35, 5, 45, 5, 45, '#f97316');
    // Q4: High Willingness, Low Ability (Abwicklung) - bottom right
    const abwicklungData = generatePoints(55, 55, 95, 5, 45, '#ef4444');

    // Destroy existing chart if exists
    if (scatterPlotChart) {
        scatterPlotChart.destroy();
    }

    scatterPlotChart = new Chart(ctx, {
        type: 'scatter',
        data: {
            datasets: [
                {
                    label: 'Priorität',
                    data: prioritaetData,
                    backgroundColor: 'rgba(34, 197, 94, 0.6)',
                    borderColor: '#22c55e',
                    pointRadius: 5,
                    pointHoverRadius: 7
                },
                {
                    label: 'Restrukturierung',
                    data: restrukturierungData,
                    backgroundColor: 'rgba(234, 179, 8, 0.6)',
                    borderColor: '#eab308',
                    pointRadius: 5,
                    pointHoverRadius: 7
                },
                {
                    label: 'Eskalation',
                    data: eskalationData,
                    backgroundColor: 'rgba(249, 115, 22, 0.6)',
                    borderColor: '#f97316',
                    pointRadius: 5,
                    pointHoverRadius: 7
                },
                {
                    label: 'Abwicklung',
                    data: abwicklungData,
                    backgroundColor: 'rgba(239, 68, 68, 0.6)',
                    borderColor: '#ef4444',
                    pointRadius: 5,
                    pointHoverRadius: 7
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false // Legend is shown below the chart
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return `Willingness: ${context.parsed.x.toFixed(0)}%, Ability: ${context.parsed.y.toFixed(0)}%`;
                        }
                    }
                }
            },
            scales: {
                x: {
                    min: 0,
                    max: 100,
                    title: {
                        display: true,
                        text: 'Willingness to Pay (%)',
                        font: { size: 11 }
                    },
                    grid: {
                        color: 'rgba(0, 0, 0, 0.05)'
                    }
                },
                y: {
                    min: 0,
                    max: 100,
                    title: {
                        display: true,
                        text: 'Ability to Pay (%)',
                        font: { size: 11 }
                    },
                    grid: {
                        color: 'rgba(0, 0, 0, 0.05)'
                    }
                }
            }
        }
    });

    console.log('Scatter plot initialized');
}

// Initialize Portfolio Evolution Chart
function initPortfolioChart(period = '12m') {
    const canvas = document.getElementById('portfolioEvolutionChart');
    if (!canvas) {
        console.warn('Portfolio chart canvas not found');
        return;
    }

    const ctx = canvas.getContext('2d');

    // Generate monthly labels based on period
    const months = period === '12m' ? 12 : period === '6m' ? 6 : 3;
    const labels = [];
    const now = new Date();
    for (let i = months - 1; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        labels.push(d.toLocaleDateString('de-DE', { month: 'short', year: '2-digit' }));
    }

    // Generate realistic portfolio data
    let baseValue = 9500;
    const portfolioData = labels.map((_, i) => {
        baseValue += Math.floor(Math.random() * 400) - 150;
        return baseValue;
    });

    // Destroy existing chart if exists
    if (portfolioChart) {
        portfolioChart.destroy();
    }

    portfolioChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Portfolio-Bestand',
                data: portfolioData,
                borderColor: '#3b82f6',
                backgroundColor: 'rgba(59, 130, 246, 0.1)',
                fill: true,
                tension: 0.3,
                pointRadius: 4,
                pointBackgroundColor: '#3b82f6',
                pointBorderColor: '#fff',
                pointBorderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return `Fälle: ${context.parsed.y.toLocaleString('de-DE')}`;
                        }
                    }
                }
            },
            scales: {
                x: {
                    grid: {
                        display: false
                    }
                },
                y: {
                    beginAtZero: false,
                    grid: {
                        color: 'rgba(0, 0, 0, 0.05)'
                    },
                    ticks: {
                        callback: function(value) {
                            return value.toLocaleString('de-DE');
                        }
                    }
                }
            }
        }
    });

    console.log('Portfolio chart initialized for period:', period);
}

// Refresh Scatter Plot
function refreshScatterPlot() {
    showNotification('Matrix wird aktualisiert...', 'info');
    initScatterPlot();
}

// Export Matrix
function exportMatrix() {
    showNotification('Matrix wird exportiert...', 'info');
    console.log('Exporting matrix');
}

// Update Portfolio Chart
function updatePortfolioChart(period) {
    initPortfolioChart(period);
}

// Show All New Cases
function showAllNewCases() {
    showNotification('Alle neuen Fälle werden geladen...', 'info');
}

// Show All Resolved Cases
function showAllResolvedCases() {
    showNotification('Alle erledigten Fälle werden geladen...', 'info');
}

// Filter Customers
function filterCustomers(filterType, value) {
    console.log('Filtering customers by', filterType, ':', value);
}

// Customer Table Sorting State
let currentSortColumn = 'priority'; // Default: Priorität (Verzugstage + Forderung)
let currentSortDirection = 'desc';

// Sort Customer Table
function sortCustomerTable(column) {
    const table = document.querySelector('.customer-table');
    if (!table) return;

    const tbody = table.querySelector('tbody');
    if (!tbody) return;

    const rows = Array.from(tbody.querySelectorAll('tr'));

    // Toggle direction if same column clicked
    if (currentSortColumn === column) {
        currentSortDirection = currentSortDirection === 'asc' ? 'desc' : 'asc';
    } else {
        currentSortColumn = column;
        currentSortDirection = 'desc'; // Default to descending
    }

    // Update header sort indicators
    table.querySelectorAll('th.sortable').forEach(th => {
        th.classList.remove('sort-asc', 'sort-desc');
    });

    const columnIndex = getColumnIndex(column);
    const activeHeader = table.querySelectorAll('th')[columnIndex];
    if (activeHeader) {
        activeHeader.classList.add(currentSortDirection === 'asc' ? 'sort-asc' : 'sort-desc');
    }

    // Sort rows
    rows.sort((a, b) => {
        let valueA = getCellValue(a, column);
        let valueB = getCellValue(b, column);

        // Handle numeric vs string comparison
        if (typeof valueA === 'number' && typeof valueB === 'number') {
            return currentSortDirection === 'asc' ? valueA - valueB : valueB - valueA;
        }

        // String comparison
        return currentSortDirection === 'asc'
            ? String(valueA).localeCompare(String(valueB), 'de')
            : String(valueB).localeCompare(String(valueA), 'de');
    });

    // Re-append sorted rows
    rows.forEach(row => tbody.appendChild(row));

    showNotification(`Sortiert nach ${getColumnLabel(column)} (${currentSortDirection === 'asc' ? 'aufsteigend' : 'absteigend'})`, 'info');
}

// Get column index for sorting
function getColumnIndex(column) {
    const columnMap = {
        'name': 0,
        'amount': 2,
        'dpd': 3,
        'segment': 4,
        'mahnstufe': 6,
        'action': 7
    };
    return columnMap[column] || 0;
}

// Get cell value for comparison
function getCellValue(row, column) {
    const cells = row.querySelectorAll('td');
    const columnIndex = getColumnIndex(column);

    if (!cells[columnIndex]) return '';

    const cellText = cells[columnIndex].textContent.trim();

    switch (column) {
        case 'name':
            return cells[0].querySelector('strong')?.textContent?.trim() || cellText;

        case 'amount':
            // Parse currency: "€12.500" -> 12500
            const amountMatch = cellText.replace(/[€.]/g, '').replace(',', '.');
            return parseFloat(amountMatch) || 0;

        case 'dpd':
            // Parse days: "45 Tage" -> 45
            const dpdMatch = cellText.match(/(\d+)/);
            return dpdMatch ? parseInt(dpdMatch[1]) : 0;

        case 'mahnstufe':
            // Parse Mahnstufe: "M3" -> 3
            const mMatch = cellText.match(/M(\d+)/);
            return mMatch ? parseInt(mMatch[1]) : 0;

        case 'segment':
            // Priority order: Abwicklung > Eskalation > Restrukturierung > Priorität
            const segmentPriority = {
                'Abwicklung': 4,
                'Eskalation': 3,
                'Restrukturierung': 2,
                'Priorität': 1
            };
            return segmentPriority[cellText] || 0;

        case 'action':
            // Sort by date
            const dateMatch = cellText.match(/(\d{2})\.(\d{2})\.(\d{4})/);
            if (dateMatch) {
                return new Date(dateMatch[3], dateMatch[2] - 1, dateMatch[1]).getTime();
            }
            return 0;

        default:
            return cellText;
    }
}

// Get column label for notification
function getColumnLabel(column) {
    const labels = {
        'name': 'Name',
        'amount': 'Forderung',
        'dpd': 'Verzugstage',
        'segment': 'Segment',
        'mahnstufe': 'Mahnstufe',
        'action': 'Nächste Aktion',
        'priority': 'Priorität'
    };
    return labels[column] || column;
}

// Sort by priority (combined score: high DPD + high amount + critical segment)
function sortByPriority() {
    const table = document.querySelector('.customer-table');
    if (!table) return;

    const tbody = table.querySelector('tbody');
    if (!tbody) return;

    const rows = Array.from(tbody.querySelectorAll('tr'));

    rows.sort((a, b) => {
        const scoreA = calculatePriorityScore(a);
        const scoreB = calculatePriorityScore(b);
        return scoreB - scoreA; // Higher score = higher priority
    });

    rows.forEach(row => tbody.appendChild(row));
}

// Calculate priority score for a row
function calculatePriorityScore(row) {
    const cells = row.querySelectorAll('td');

    // Get DPD (higher = more urgent)
    const dpdText = cells[3]?.textContent || '0';
    const dpd = parseInt(dpdText.match(/(\d+)/)?.[1]) || 0;

    // Get Amount (higher = more important)
    const amountText = cells[2]?.textContent || '0';
    const amount = parseFloat(amountText.replace(/[€.]/g, '').replace(',', '.')) || 0;

    // Get Mahnstufe (higher = more urgent)
    const mahnstufeText = cells[6]?.textContent || 'M0';
    const mahnstufe = parseInt(mahnstufeText.match(/M(\d+)/)?.[1]) || 0;

    // Get Segment priority
    const segmentText = cells[4]?.textContent?.trim() || '';
    const segmentWeight = {
        'Abwicklung': 100,
        'Eskalation': 80,
        'Restrukturierung': 40,
        'Priorität': 20
    }[segmentText] || 0;

    // Combined priority score
    return (dpd * 2) + (amount / 1000) + (mahnstufe * 10) + segmentWeight;
}

// Initialize default sort on page load
function initCustomerTableSort() {
    const table = document.querySelector('.customer-table');
    if (table) {
        sortByPriority();
    }
}

// Search Customers
function searchCustomers(query) {
    console.log('Searching customers:', query);

    const searchTerm = query.toLowerCase().trim();
    const table = document.querySelector('.customers-table');
    if (!table) return;

    const rows = table.querySelectorAll('tbody tr');
    let matchCount = 0;

    rows.forEach(row => {
        if (!searchTerm) {
            // Show all rows when search is empty
            row.style.display = '';
            matchCount++;
            return;
        }

        // Get searchable content from the row
        const kundenNr = row.querySelector('.customer-id')?.textContent?.toLowerCase() || '';
        const kundenName = row.querySelector('.customer-name')?.textContent?.toLowerCase() || '';
        const cells = row.querySelectorAll('td');
        let rowText = '';
        cells.forEach(cell => rowText += ' ' + cell.textContent.toLowerCase());

        // Check if any field matches
        const matches = kundenNr.includes(searchTerm) ||
                       kundenName.includes(searchTerm) ||
                       rowText.includes(searchTerm);

        if (matches) {
            row.style.display = '';
            matchCount++;
        } else {
            row.style.display = 'none';
        }
    });

    // Update pagination text
    const paginationText = document.querySelector('.pagination-text');
    if (paginationText) {
        if (searchTerm) {
            paginationText.textContent = `${matchCount} Treffer für "${query}"`;
        } else {
            paginationText.textContent = 'Zeige 1-10 von 47 Fällen';
        }
    }

    // Show notification for search
    if (searchTerm && matchCount === 0) {
        showNotification(`Keine Kunden gefunden für "${query}"`, 'warning');
    }
}

// ========================================
// NEW: NPL Actions
// ========================================

// Review for Sale
function reviewForSale() {
    showNotification('Fälle für Verkauf werden geprüft...', 'info');
}

// Review for Write Off
function reviewForWriteOff() {
    showNotification('Fälle für Abschreibung werden geprüft...', 'info');
}

// Review for Restructure
function reviewForRestructure() {
    showNotification('Fälle für Restrukturierung werden geprüft...', 'info');
}


// Exports
window.initBankenCharts = initBankenCharts;
window.initScatterPlot = initScatterPlot;
window.initPortfolioChart = initPortfolioChart;
window.refreshScatterPlot = refreshScatterPlot;
window.exportMatrix = exportMatrix;
window.updatePortfolioChart = updatePortfolioChart;
window.showAllNewCases = showAllNewCases;
window.showAllResolvedCases = showAllResolvedCases;
window.reviewForSale = reviewForSale;
window.reviewForWriteOff = reviewForWriteOff;
window.reviewForRestructure = reviewForRestructure;
window.filterCustomers = filterCustomers;
window.searchCustomers = searchCustomers;
window.sortCustomerTable = sortCustomerTable;
window.sortByPriority = sortByPriority;
window.initCustomerTableSort = initCustomerTableSort;
