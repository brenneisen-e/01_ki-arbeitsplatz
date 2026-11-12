/**
 * Alpha Provisionsanalyse-System - Charts Manager
 * ================================================
 * Chart.js Wrapper für Visualisierungen
 */

class ChartsManager {
  constructor() {
    this.charts = {};
    this.Chart = window.Chart || null;
  }

  /**
   * Erstellt Risiko-Verteilungs-Chart (Donut)
   */
  createRiskDistributionChart(data) {
    const ctx = document.getElementById('risk-distribution-chart');
    if (!ctx) return;

    // Zähle Risiko-Kategorien
    const counts = {
      gruen: 0,
      gelb: 0,
      orange: 0,
      rot: 0,
    };

    data.forEach(item => {
      // Skip demo data without AI analysis
      if (item.ki_analyse) {
        const category = UTILS.getRiskCategory(item.ki_analyse.risiko_score);
        counts[category]++;
      }
    });

    // Zerstöre altes Chart
    if (this.charts.riskDistribution) {
      this.charts.riskDistribution.destroy();
    }

    // Erstelle neues Chart
    this.charts.riskDistribution = new this.Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: [
          'Grün (0-1) - Keine Auffälligkeiten',
          'Gelb (2) - Beobachtung',
          'Orange (3) - Auffällig',
          'Rot (4-5) - Kritisch'
        ],
        datasets: [{
          data: [counts.gruen, counts.gelb, counts.orange, counts.rot],
          backgroundColor: [
            '#10B981', // Grün
            '#F59E0B', // Gelb
            '#F97316', // Orange
            '#EF4444'  // Rot
          ],
          borderWidth: 3,
          borderColor: '#fff',
          hoverOffset: 10,
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              padding: 15,
              font: { size: 12 },
              generateLabels: (chart) => {
                const data = chart.data;
                return data.labels.map((label, i) => ({
                  text: `${label}: ${data.datasets[0].data[i]}`,
                  fillStyle: data.datasets[0].backgroundColor[i],
                  hidden: false,
                  index: i
                }));
              }
            }
          },
          tooltip: {
            callbacks: {
              label: function(context) {
                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                const percentage = ((context.parsed / total) * 100).toFixed(1);
                return `${context.parsed} (${percentage}%)`;
              }
            }
          }
        }
      }
    });
  }

  /**
   * Erstellt Auffälligkeiten-nach-Kategorie-Chart (Bar)
   */
  createCategoryChart(abrechnungen) {
    const ctx = document.getElementById('category-chart');
    if (!ctx) return;

    // Zähle Auffälligkeiten pro Kategorie
    const categories = {};
    abrechnungen.forEach(abr => {
      if (abr.ki_analyse && abr.ki_analyse.auffaelligkeiten) {
        abr.ki_analyse.auffaelligkeiten.forEach(auff => {
          const cat = auff.kategorie || 'Sonstige';
          categories[cat] = (categories[cat] || 0) + 1;
        });
      }
    });

    // Zerstöre altes Chart
    if (this.charts.category) {
      this.charts.category.destroy();
    }

    // Erstelle neues Chart
    this.charts.category = new this.Chart(ctx, {
      type: 'bar',
      data: {
        labels: Object.keys(categories),
        datasets: [{
          label: 'Anzahl Auffälligkeiten',
          data: Object.values(categories),
          backgroundColor: '#00A3E0',
          borderRadius: 8,
          borderWidth: 0,
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: function(context) {
                return `${context.parsed.y} Auffälligkeiten`;
              }
            }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              stepSize: 1,
              precision: 0
            },
            grid: {
              color: 'rgba(0, 0, 0, 0.05)'
            }
          },
          x: {
            grid: {
              display: false
            }
          }
        }
      }
    });
  }

  /**
   * Erstellt historischen Trend-Chart (Line)
   */
  createHistoricalTrendChart(containerId, historicalData, metric, label) {
    const ctx = document.getElementById(containerId);
    if (!ctx) return;

    // Sortiere nach Periode
    const sortedData = [...historicalData].sort((a, b) =>
      new Date(a.periode) - new Date(b.periode)
    );

    // Zerstöre altes Chart falls vorhanden
    if (this.charts[containerId]) {
      this.charts[containerId].destroy();
    }

    // Erstelle Chart
    this.charts[containerId] = new this.Chart(ctx, {
      type: 'line',
      data: {
        labels: sortedData.map(d => d.periode),
        datasets: [{
          label: label || metric,
          data: sortedData.map(d => d.extracted_data?.[metric] || 0),
          borderColor: '#00A3E0',
          backgroundColor: 'rgba(0, 163, 224, 0.1)',
          tension: 0.4,
          fill: true,
          pointRadius: 4,
          pointHoverRadius: 6,
          pointBackgroundColor: '#00A3E0',
          pointBorderColor: '#fff',
          pointBorderWidth: 2,
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: function(context) {
                if (metric.includes('provision')) {
                  return UTILS.formatCurrency(context.parsed.y);
                } else if (metric.includes('quote')) {
                  return UTILS.formatPercent(context.parsed.y);
                } else {
                  return context.parsed.y.toLocaleString('de-DE');
                }
              }
            }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              callback: function(value) {
                if (metric.includes('provision')) {
                  return UTILS.formatCurrency(value);
                } else if (metric.includes('quote')) {
                  return value + '%';
                } else {
                  return value.toLocaleString('de-DE');
                }
              }
            }
          }
        }
      }
    });

    return this.charts[containerId];
  }

  /**
   * Zerstört ein Chart
   */
  destroyChart(chartId) {
    if (this.charts[chartId]) {
      this.charts[chartId].destroy();
      delete this.charts[chartId];
    }
  }

  /**
   * Zerstört alle Charts
   */
  destroyAllCharts() {
    Object.keys(this.charts).forEach(chartId => {
      this.destroyChart(chartId);
    });
  }

  /**
   * Aktualisiert alle Charts
   */
  updateAllCharts(data) {
    this.createRiskDistributionChart(data);
    this.createCategoryChart(data);
  }
}

// Singleton-Instanz
const chartsManager = new ChartsManager();
