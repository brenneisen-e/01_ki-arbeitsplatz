/**
 * Alpha Provisionsanalyse-System - UI Controller
 * ===============================================
 * User Interface Steuerung und DOM-Manipulationen
 */

class UIController {
  constructor() {
    this.currentSection = 'upload';
    this.uploadedFiles = [];
    this.selectedAnalysisId = null;
  }

  /**
   * Zeigt Toast-Benachrichtigung
   */
  showToast(message, type = 'info', duration = CONFIG.UI.TOAST_DURATION) {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;

    const icon = {
      success: '✓',
      error: '✗',
      warning: '⚠',
      info: 'ℹ'
    }[type] || 'ℹ';

    toast.innerHTML = `
      <span class="icon">${icon}</span>
      <div class="toast-content">
        <p>${message}</p>
      </div>
      <button class="toast-close">&times;</button>
    `;

    container.appendChild(toast);

    // Auto-remove nach Dauer
    setTimeout(() => {
      toast.style.opacity = '0';
      setTimeout(() => toast.remove(), 300);
    }, duration);

    // Close-Button
    toast.querySelector('.toast-close').addEventListener('click', () => {
      toast.style.opacity = '0';
      setTimeout(() => toast.remove(), 300);
    });
  }

  /**
   * Wechselt zwischen Sektionen
   */
  switchSection(sectionId) {
    // Verstecke alle Sektionen
    document.querySelectorAll('.section').forEach(section => {
      section.classList.remove('active');
    });

    // Zeige gewählte Sektion
    const targetSection = document.getElementById(`${sectionId}-section`);
    if (targetSection) {
      targetSection.classList.add('active');
      this.currentSection = sectionId;
    }

    // Aktualisiere Navigation
    document.querySelectorAll('.nav-item').forEach(item => {
      item.classList.remove('active');
      if (item.dataset.section === sectionId) {
        item.classList.add('active');
      }
    });
  }

  /**
   * Aktualisiert Dateiliste
   */
  updateFileList(files) {
    const fileList = document.getElementById('file-list');
    const filesContainer = document.getElementById('files-container');
    const fileCountSpan = document.getElementById('file-count');

    if (files.length === 0) {
      fileList.style.display = 'none';
      document.getElementById('analysis-controls').style.display = 'none';
      return;
    }

    fileList.style.display = 'block';
    document.getElementById('analysis-controls').style.display = 'block';
    fileCountSpan.textContent = files.length;

    filesContainer.innerHTML = '';

    files.forEach((file, index) => {
      const fileItem = document.createElement('div');
      fileItem.className = 'file-item';
      fileItem.dataset.index = index;

      fileItem.innerHTML = `
        <div class="file-info">
          <span class="file-icon">📄</span>
          <div class="file-details">
            <div class="file-name">${file.name}</div>
            <div class="file-meta">${UTILS.formatFileSize(file.size)}</div>
          </div>
        </div>
        <span class="file-status pending">Wartend</span>
        <button class="btn-text" onclick="app.removeFile(${index})">✕</button>
      `;

      filesContainer.appendChild(fileItem);
    });
  }

  /**
   * Aktualisiert Datei-Status
   */
  updateFileStatus(index, status, message = '') {
    const fileItem = document.querySelector(`.file-item[data-index="${index}"]`);
    if (!fileItem) return;

    const statusSpan = fileItem.querySelector('.file-status');
    statusSpan.className = `file-status ${status}`;

    const statusTexts = {
      pending: 'Wartend',
      processing: 'Verarbeitung...',
      success: 'Fertig',
      error: 'Fehler'
    };

    statusSpan.textContent = message || statusTexts[status] || status;
  }

  /**
   * Zeigt Fortschritt an
   */
  showProgress(current, total) {
    const progressSection = document.getElementById('progress-section');
    const progressCurrent = document.getElementById('progress-current');
    const progressTotal = document.getElementById('progress-total');
    const progressBar = document.getElementById('main-progress-bar');
    const estimatedTimeElement = document.getElementById('estimated-time');

    progressSection.style.display = 'block';
    progressCurrent.textContent = current;
    progressTotal.textContent = total;

    const percentage = (current / total) * 100;
    progressBar.style.width = `${percentage}%`;

    // Berechne geschätzte Restzeit
    if (current > 0) {
      // Tracking: Speichere Startzeit beim ersten Aufruf
      if (!this._progressStartTime) {
        this._progressStartTime = Date.now();
      }

      const elapsed = (Date.now() - this._progressStartTime) / 1000; // in Sekunden
      const avgTimePerFile = elapsed / current;
      const remaining = (total - current) * avgTimePerFile;

      // Formatiere Zeit
      const minutes = Math.floor(remaining / 60);
      const seconds = Math.floor(remaining % 60);
      const timeString = `${minutes}:${seconds.toString().padStart(2, '0')} Min`;

      if (estimatedTimeElement) {
        estimatedTimeElement.textContent = timeString;
      }
    } else {
      // Reset Startzeit
      this._progressStartTime = Date.now();
      if (estimatedTimeElement) {
        estimatedTimeElement.textContent = 'Wird berechnet...';
      }
    }
  }

  /**
   * Versteckt Fortschrittsanzeige
   */
  hideProgress() {
    const progressSection = document.getElementById('progress-section');
    if (progressSection) {
      progressSection.style.display = 'none';
    }
    // Reset Startzeit
    this._progressStartTime = null;
  }

  /**
   * Aktualisiert Kosten-Schätzung
   */
  updateCostEstimate(cost) {
    const costElement = document.getElementById('estimated-cost');
    if (costElement) {
      costElement.textContent = `$${cost.toFixed(4)}`;
    }
  }

  /**
   * Aktualisiert Dashboard (ERWEITERT MIT HIERARCHIE-STATS)
   */
  async updateDashboard() {
    const stats = await db.getDashboardStats();

    // Aktualisiere Summary Cards
    document.getElementById('count-green').textContent = stats.riskCounts.gruen;
    document.getElementById('count-yellow').textContent = stats.riskCounts.gelb;
    document.getElementById('count-orange').textContent = stats.riskCounts.orange;
    document.getElementById('count-red').textContent = stats.riskCounts.rot;

    // Aktualisiere Sidebar Stats
    document.getElementById('total-agencies').textContent = stats.totalAgenturen;
    document.getElementById('total-analyses').textContent = stats.totalAbrechnungen;
    document.getElementById('total-alerts').textContent = stats.totalAuffaelligkeiten;

    // **NEU**: Lade Hierarchie-Statistiken
    try {
      const hierarchieStats = await db.getHierarchieStatistik();

      // Zeige Hierarchie-Sektion wenn hierarchische Daten vorhanden
      const hierarchieSection = document.getElementById('hierarchie-stats-section');
      if (hierarchieStats.hierarchische_abrechnungen > 0) {
        hierarchieSection.style.display = 'block';

        // Aktualisiere Hierarchie-Zahlen
        document.getElementById('hierarchie-count').textContent = hierarchieStats.hierarchische_abrechnungen;
        document.getElementById('supervisor-count').textContent = hierarchieStats.vermittler_mit_vorgesetzten;
        document.getElementById('subordinate-count').textContent = hierarchieStats.vorgesetzte_mit_untervermittlern;
        document.getElementById('superprovision-count').textContent = hierarchieStats.superprovisions_abrechnungen;
        document.getElementById('combined-analysis-count').textContent = hierarchieStats.kombinierte_analysen;
      } else {
        hierarchieSection.style.display = 'none';
      }
    } catch (error) {
      console.warn('Hierarchie-Statistiken nicht verfügbar:', error);
    }

    // Lade alle Abrechnungen und aktualisiere Charts
    const abrechnungen = await db.getAllAbrechnungen();
    if (abrechnungen.length > 0) {
      chartsManager.updateAllCharts(abrechnungen);
      this.updateAnalysesGrid(abrechnungen);
    } else {
      document.getElementById('analyses-grid').innerHTML = '<p class="empty-state">Noch keine Analysen vorhanden. Laden Sie PDFs hoch, um zu beginnen.</p>';
    }
  }

  /**
   * Aktualisiert Analysen-Grid (ERWEITERT MIT HIERARCHIE-BADGES)
   */
  updateAnalysesGrid(abrechnungen) {
    const grid = document.getElementById('analyses-grid');
    if (!grid) return;

    if (abrechnungen.length === 0) {
      grid.innerHTML = '<p class="empty-state">Keine Analysen vorhanden</p>';
      return;
    }

    // Zeige neueste 12 Analysen (skip demo data without AI analysis)
    const recent = abrechnungen
      .filter(abr => abr.ki_analyse !== null && abr.ki_analyse !== undefined)
      .sort((a, b) => new Date(b.upload_datum) - new Date(a.upload_datum))
      .slice(0, 12);

    grid.innerHTML = recent.map(abr => {
      const riskColor = UTILS.getRiskColor(abr.ki_analyse.risiko_kategorie);

      // **NEU**: Hierarchie-Badges
      let hierarchieBadges = '';
      const isHierarchical = abr.vermittler_nummer !== undefined;
      const isCombined = abr.metadaten?.is_combined_analysis === true;
      const hasVorgesetzter = abr.extracted_data?.vorgesetzter !== undefined;
      const hasSuperprovisionen = abr.extracted_data?.superprovisionen && abr.extracted_data.superprovisionen.length > 0;

      if (isCombined) {
        hierarchieBadges += '<span class="hierarchie-badge combined">🔗 Kombinierte Analyse</span>';
      } else if (isHierarchical) {
        hierarchieBadges += '<span class="hierarchie-badge">👥 Hierarchisch</span>';
        if (hasVorgesetzter) {
          hierarchieBadges += '<span class="hierarchie-badge supervisor">⬆️ UV</span>';
        }
        if (hasSuperprovisionen) {
          hierarchieBadges += '<span class="hierarchie-badge subordinate">⬇️ HV</span>';
        }
      }

      const cardClass = isCombined ? 'analysis-card combined-analysis' : (isHierarchical ? 'analysis-card hierarchical' : 'analysis-card');

      return `
        <div class="${cardClass}" onclick="app.showAnalysisDetail(${abr.id})">
          <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 0.5rem;">
            <div>
              <strong>${abr.agentur_id} - ${abr.agentur_name}</strong>
              ${abr.vermittler_nummer ? `<div style="font-size: 0.75rem; color: var(--gray-500); margin-top: 0.25rem;">${abr.vermittler_nummer}</div>` : ''}
            </div>
            <span class="risk-badge ${abr.ki_analyse.risiko_kategorie}">
              ${abr.ki_analyse.risiko_score}/5
            </span>
          </div>
          ${hierarchieBadges ? `<div style="margin-bottom: 0.5rem;">${hierarchieBadges}</div>` : ''}
          <div style="font-size: 0.875rem; color: var(--gray-600); margin-bottom: 0.5rem;">
            Periode: ${abr.periode} | ${UTILS.formatDate(abr.upload_datum, 'short')}
          </div>
          <div style="font-size: 0.875rem;">
            Provision: ${UTILS.formatCurrency(abr.extracted_data.provisionssumme_gesamt || 0)}
          </div>
          <div style="font-size: 0.875rem;">
            Auffälligkeiten: ${abr.ki_analyse.auffaelligkeiten.length}
          </div>
        </div>
      `;
    }).join('');
  }

  /**
   * Aktualisiert Verlaufs-Tabelle
   */
  async updateHistoryTable(filters = {}) {
    const tbody = document.getElementById('history-table-body');
    if (!tbody) return;

    const abrechnungen = await db.getAbrechnungenFiltered(filters);

    if (abrechnungen.length === 0) {
      tbody.innerHTML = '<tr><td colspan="8" class="empty-state">Keine Einträge vorhanden</td></tr>';
      return;
    }

    tbody.innerHTML = abrechnungen.map(abr => `
      <tr>
        <td>${UTILS.formatDate(abr.upload_datum, 'short')}</td>
        <td>${abr.agentur_id}</td>
        <td>${abr.agentur_name}</td>
        <td>${abr.periode}</td>
        <td>${UTILS.formatCurrency(abr.extracted_data.provisionssumme_gesamt)}</td>
        <td>
          <span class="risk-badge ${abr.ki_analyse.risiko_kategorie}">
            ${abr.ki_analyse.risiko_kategorie.toUpperCase()} (${abr.ki_analyse.risiko_score})
          </span>
        </td>
        <td>${abr.ki_analyse.auffaelligkeiten.length}</td>
        <td>
          <button class="btn-text" onclick="app.showAnalysisDetail(${abr.id})" title="Details anzeigen">👁</button>
          <button class="btn-text" onclick="app.deleteAnalysis(${abr.id})" title="Löschen">🗑</button>
        </td>
      </tr>
    `).join('');
  }

  /**
   * Aktualisiert Agenturen-Grid
   */
  async updateAgenciesGrid() {
    const grid = document.getElementById('agencies-grid');
    if (!grid) return;

    const agenturen = await db.getAllAgenturen();

    if (agenturen.length === 0) {
      grid.innerHTML = '<p class="empty-state">Keine Agenturen vorhanden</p>';
      return;
    }

    grid.innerHTML = agenturen.map(ag => `
      <div class="agency-card" onclick="app.showAgencyDetail('${ag.agentur_id}')" style="cursor: pointer;">
        <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 0.5rem;">
          <strong>${ag.agentur_id}</strong>
          <span class="risk-badge ${ag.risiko_kategorie}">
            ${ag.durchschnitt_risiko}% OK
          </span>
        </div>
        <div style="margin-bottom: 0.5rem;">${ag.agentur_name}</div>
        <div style="font-size: 0.875rem; color: var(--gray-600);">
          Abrechnungen: ${ag.anzahl_abrechnungen}<br>
          Letzte Periode: ${ag.letzte_periode}<br>
          Auffälligkeiten: ${ag.auffaelligkeiten_gesamt}
        </div>
      </div>
    `).join('');
  }

  /**
   * Zeigt Analyse-Detail-Modal
   */
  showAnalysisModal(analysis) {
    const modal = document.getElementById('analysis-modal');
    const modalBody = document.getElementById('analysis-modal-body');

    if (!modal || !modalBody) return;

    // Skip demo data without AI analysis
    if (!analysis.ki_analyse) {
      this.showToast('Diese Abrechnung hat noch keine KI-Analyse', 'warning');
      return;
    }

    const riskColor = UTILS.getRiskColor(analysis.ki_analyse.risiko_kategorie);

    modalBody.innerHTML = `
      <div style="margin-bottom: 2rem;">
        <h3 style="color: var(--primary-color);">
          ${analysis.agentur_id} - ${analysis.agentur_name}
        </h3>
        <p style="color: var(--gray-600);">
          Periode: ${analysis.periode} | Upload: ${UTILS.formatDate(analysis.upload_datum, 'long')}
        </p>
      </div>

      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem; margin-bottom: 2rem;">
        <div class="summary-card" style="margin: 0;">
          <div class="card-icon ${analysis.ki_analyse.risiko_kategorie}">
            ${analysis.ki_analyse.risiko_score}
          </div>
          <div class="card-content">
            <div class="card-value">${analysis.ki_analyse.risiko_kategorie.toUpperCase()}</div>
            <div class="card-label">Risiko-Kategorie</div>
          </div>
        </div>

        <div style="background: var(--gray-50); padding: 1rem; border-radius: var(--radius-md);">
          <div style="font-size: 0.875rem; color: var(--gray-600); margin-bottom: 0.25rem;">Provisionssumme</div>
          <div style="font-size: 1.5rem; font-weight: 700; color: var(--primary-color);">
            ${UTILS.formatCurrency(analysis.extracted_data.provisionssumme_gesamt)}
          </div>
        </div>

        <div style="background: var(--gray-50); padding: 1rem; border-radius: var(--radius-md);">
          <div style="font-size: 0.875rem; color: var(--gray-600); margin-bottom: 0.25rem;">Verträge</div>
          <div style="font-size: 1.5rem; font-weight: 700; color: var(--primary-color);">
            ${analysis.extracted_data.vertragsanzahl_gesamt}
          </div>
        </div>

        <div style="background: var(--gray-50); padding: 1rem; border-radius: var(--radius-md);">
          <div style="font-size: 0.875rem; color: var(--gray-600); margin-bottom: 0.25rem;">Stornoquote</div>
          <div style="font-size: 1.5rem; font-weight: 700; color: var(--primary-color);">
            ${analysis.extracted_data.stornoquote_gesamt}%
          </div>
        </div>
      </div>

      <div style="margin-bottom: 2rem;">
        <h4 style="margin-bottom: 0.5rem;">Zusammenfassung</h4>
        <p style="background: var(--gray-50); padding: 1rem; border-radius: var(--radius-md); border-left: 4px solid ${riskColor};">
          ${analysis.ki_analyse.zusammenfassung}
        </p>
      </div>

      <div style="margin-bottom: 2rem;">
        <h4 style="margin-bottom: 0.5rem;">Handlungsempfehlung</h4>
        <p style="background: var(--gray-50); padding: 1rem; border-radius: var(--radius-md); font-weight: 600;">
          ${analysis.ki_analyse.handlungsempfehlung}
        </p>
      </div>

      ${analysis.ki_analyse.auffaelligkeiten.length > 0 ? `
        <div style="margin-bottom: 2rem;">
          <h4 style="margin-bottom: 1rem;">Auffälligkeiten (${analysis.ki_analyse.auffaelligkeiten.length})</h4>
          ${analysis.ki_analyse.auffaelligkeiten.map((auff, i) => `
            <div style="background: var(--gray-50); padding: 1rem; border-radius: var(--radius-md); margin-bottom: 1rem; border-left: 4px solid ${
              auff.schweregrad === 'kritisch' ? 'var(--danger-color)' :
              auff.schweregrad === 'hoch' ? 'var(--warning-color)' :
              auff.schweregrad === 'mittel' ? 'var(--info-color)' : 'var(--success-color)'
            };">
              <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem;">
                <strong>${i + 1}. ${auff.titel}</strong>
                <span style="padding: 0.25rem 0.5rem; background: white; border-radius: var(--radius-sm); font-size: 0.75rem; font-weight: 600;">
                  ${auff.schweregrad.toUpperCase()}
                </span>
              </div>
              <div style="font-size: 0.875rem; color: var(--gray-600); margin-bottom: 0.5rem;">
                Kategorie: ${auff.kategorie}
              </div>
              <p style="margin-bottom: 0.5rem;">${auff.beschreibung}</p>
              <div style="background: white; padding: 0.75rem; border-radius: var(--radius-sm); font-size: 0.875rem;">
                <strong>Empfehlung:</strong> ${auff.empfehlung}
              </div>
            </div>
          `).join('')}
        </div>
      ` : '<p style="color: var(--success-color); font-weight: 600;">✓ Keine Auffälligkeiten gefunden</p>'}
    `;

    modal.classList.add('active');

    // Store current analysis ID for export
    this.selectedAnalysisId = analysis.id;
  }

  /**
   * Schließt Modal
   */
  closeModal(modalId = 'analysis-modal') {
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.classList.remove('active');
      modal.style.display = 'none'; // Fix: Reset inline style
    }
  }

  /**
   * Aktualisiert API-Status
   */
  updateAPIStatus(isValid) {
    const statusBadge = document.getElementById('api-status');
    if (statusBadge) {
      if (isValid) {
        statusBadge.textContent = 'Konfiguriert';
        statusBadge.className = 'status-badge success';
      } else {
        statusBadge.textContent = 'Nicht konfiguriert';
        statusBadge.className = 'status-badge';
      }
    }
  }

  /**
   * Zeigt/Versteckt Demo-Panel
   */
  toggleDemoPanel() {
    const panel = document.getElementById('demo-panel');
    if (panel) {
      panel.style.display = panel.style.display === 'none' ? 'block' : 'none';
    }
  }

  /**
   * Aktualisiert KPI-Dashboard
   */
  async updateKPIDashboard() {
    try {
      console.log('📊 Aktualisiere KPI-Dashboard...');
      const stats = await db.getTransaktionenStats();
      console.log('Stats:', stats);

      // Update KPI Cards
      const el = (id) => document.getElementById(id);

      if (el('kpi-abrechnungen')) el('kpi-abrechnungen').textContent = UTILS.formatNumber(stats.anzahl_abrechnungen || 0);
      if (el('kpi-agenturen')) el('kpi-agenturen').textContent = UTILS.formatNumber(stats.anzahl_agenturen || 0);
      if (el('kpi-transaktionen')) el('kpi-transaktionen').textContent = UTILS.formatNumber(stats.gesamt || 0);
      if (el('kpi-provisionen')) el('kpi-provisionen').textContent = UTILS.formatCurrency(stats.gesamt_provision || 0);
      if (el('kpi-zeitraum')) el('kpi-zeitraum').textContent = stats.anzahl_perioden || '--';
      if (el('kpi-auffaelligkeiten')) el('kpi-auffaelligkeiten').textContent = UTILS.formatNumber(stats.auffaellig || 0);
      if (el('kpi-auffaelligkeiten-prozent')) el('kpi-auffaelligkeiten-prozent').textContent = `${stats.prozent_auffaellig}%`;

      // Update Status Breakdown
      if (el('kpi-status-neu')) el('kpi-status-neu').textContent = UTILS.formatNumber(stats.nach_status.NEU || 0);
      if (el('kpi-status-geprueft')) el('kpi-status-geprueft').textContent = UTILS.formatNumber(stats.nach_status.GEPRÜFT || 0);
      if (el('kpi-status-geflaggt')) el('kpi-status-geflaggt').textContent = UTILS.formatNumber(stats.nach_status.GEFLAGGT || 0);
      if (el('kpi-status-ok')) el('kpi-status-ok').textContent = UTILS.formatNumber(stats.nach_status.OK || 0);

      // Update Sidebar Stats
      if (el('total-agencies')) el('total-agencies').textContent = stats.anzahl_agenturen || 0;
      if (el('total-analyses')) el('total-analyses').textContent = stats.anzahl_abrechnungen || 0;
      if (el('total-alerts')) el('total-alerts').textContent = stats.auffaellig || 0;

      console.log('✓ KPI-Dashboard aktualisiert');

      // Update KPI Charts
      this.updateKPICharts(stats);

    } catch (error) {
      console.error('❌ Fehler beim Aktualisieren des KPI-Dashboards:', error);
      console.error('Error Stack:', error.stack);
    }
  }

  /**
   * Aktualisiert die Mini-Charts in den KPI-Cards
   */
  async updateKPICharts(stats) {
    try {
      // Generate historical data for charts (in production, this would come from database)
      const allTransaktionen = await db.getAllTransaktionen();

      if (allTransaktionen.length === 0) return;

      // Group transactions by month for trends
      const monthlyData = this.groupTransactionsByMonth(allTransaktionen);

      // 1. Abrechnungen - Line Chart (Trend über Monate)
      if (window.kpiCharts && document.getElementById('chart-abrechnungen')) {
        const chart = window.kpiCharts.create('chart-abrechnungen', {
          type: 'line',
          color: '#003366',
          animate: true
        });
        chart.setData(monthlyData.counts, monthlyData.labels);
      }

      // 2. Agenturen - No Chart (as per user request)

      // 3. Transaktionen - Area Chart (Volumen über Zeit)
      if (window.kpiCharts && document.getElementById('chart-transaktionen')) {
        const chart = window.kpiCharts.create('chart-transaktionen', {
          type: 'area',
          color: '#003366',
          animate: true
        });
        chart.setData(monthlyData.counts, monthlyData.labels);
      }

      // 4. Provisionen - Area Chart mit Gradient (Provisionsfluss)
      if (window.kpiCharts && document.getElementById('chart-provisionen')) {
        const chart = window.kpiCharts.create('chart-provisionen', {
          type: 'area',
          color: '#10B981',
          animate: true,
          format: 'currency'
        });
        chart.setData(monthlyData.provisions, monthlyData.labels);
      }

      // 5. Zeitraum - Timeline Bar Chart
      if (window.kpiCharts && document.getElementById('chart-zeitraum')) {
        const chart = window.kpiCharts.create('chart-zeitraum', {
          type: 'bar',
          color: '#003366',
          animate: true
        });
        chart.setData(monthlyData.counts, monthlyData.labels);
      }

      // 6. Auffälligkeiten - No Chart (as per user request)

      console.log('✓ KPI-Charts aktualisiert');

    } catch (error) {
      console.error('❌ Fehler beim Aktualisieren der KPI-Charts:', error);
    }
  }

  /**
   * Gruppiert Transaktionen nach Monat
   */
  groupTransactionsByMonth(transactions) {
    const monthlyMap = new Map();

    transactions.forEach(txn => {
      const date = new Date(txn.erstellt_am);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

      if (!monthlyMap.has(monthKey)) {
        monthlyMap.set(monthKey, { count: 0, provision: 0 });
      }

      const data = monthlyMap.get(monthKey);
      data.count++;
      data.provision += txn.betrag || 0;
    });

    // Get last 6 months
    const sortedMonths = Array.from(monthlyMap.keys()).sort().slice(-6);

    const labels = sortedMonths.map(key => {
      const [year, month] = key.split('-');
      const date = new Date(year, parseInt(month) - 1);
      return date.toLocaleDateString('de-DE', { month: 'short', year: '2-digit' });
    });

    const counts = sortedMonths.map(key => monthlyMap.get(key).count);
    const provisions = sortedMonths.map(key => monthlyMap.get(key).provision);

    return { labels, counts, provisions };
  }

  /**
   * Holt Top Agenturen nach Transaktionsanzahl
   */
  getTopAgencies(transactions, limit = 6) {
    const agencyMap = new Map();

    transactions.forEach(txn => {
      const key = txn.agentur_name || txn.agentur_id || 'Unbekannt';
      agencyMap.set(key, (agencyMap.get(key) || 0) + 1);
    });

    const sorted = Array.from(agencyMap.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit);

    const labels = sorted.map(([name]) => name.length > 12 ? name.substring(0, 12) + '...' : name);
    const counts = sorted.map(([, count]) => count);

    return { labels, counts };
  }

  /**
   * Holt Verteilung der Auffälligkeiten nach Kategorien
   */
  getAnomalyDistribution(transactions) {
    const anomalies = transactions.filter(txn => txn.ist_auffaellig);

    if (anomalies.length === 0) {
      return { labels: ['Keine'], counts: [1] };
    }

    const categoryMap = new Map();

    anomalies.forEach(txn => {
      const category = txn.auffaelligkeits_kategorie || 'Sonstige';
      categoryMap.set(category, (categoryMap.get(category) || 0) + 1);
    });

    // Get top 5 categories
    const sorted = Array.from(categoryMap.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);

    const labels = sorted.map(([cat]) => {
      const shortNames = {
        'STORNO_NEUABSCHLUSS': 'Storno',
        'AUFFÄLLIGE_PROVISIONSHÖHE': 'Prov.höhe',
        'UEBERHÖHTE_PROVISION': 'Provision',
        'COMPLIANCE_LIMIT': 'Compliance',
        'CHURNING_VERDACHT': 'Churning',
        'DUPLIKAT_KUNDE': 'Duplikat',
        'HOHER_JAHRESBEITRAG': 'Hoher Beitrag',
        'SUPERPROVISION': 'Superprov.',
        'SYSTEMATISCH': 'Systematisch'
      };
      return shortNames[cat] || cat;
    });
    const counts = sorted.map(([, count]) => count);

    return { labels, counts };
  }

  /**
   * Aktualisiert Letzter-Import-KPIs
   */
  async updateLastImportKPIs() {
    try {
      // Lade alle Abrechnungen und finde die neuesten (letzten 2 Minuten)
      const allAbrechnungen = await db.getAllAbrechnungen();
      if (allAbrechnungen.length === 0) return;

      const twoMinutesAgo = new Date(Date.now() - 2 * 60 * 1000);
      const recentAbrechnungen = allAbrechnungen.filter(abr =>
        new Date(abr.upload_datum) > twoMinutesAgo
      );

      if (recentAbrechnungen.length === 0) return;

      // Sammle unique Agentur-IDs
      const agenturIds = new Set(recentAbrechnungen.map(abr => abr.agentur_id));

      // Lade alle Transaktionen der importierten Abrechnungen
      const allTransaktionen = await db.getAllTransaktionen();
      const abrechnungIds = new Set(recentAbrechnungen.map(abr => `ABR-${abr.id}`));
      const importTransaktionen = allTransaktionen.filter(txn =>
        abrechnungIds.has(txn.abrechnung_id)
      );

      // Berechne KPIs
      const totalVolumen = importTransaktionen.reduce((sum, txn) => sum + (txn.betrag || 0), 0);
      const auffaelligeCount = importTransaktionen.filter(txn => txn.ist_auffaellig).length;

      // Update UI
      const el = (id) => document.getElementById(id);

      if (el('import-abrechnungen-count')) el('import-abrechnungen-count').textContent = recentAbrechnungen.length;
      if (el('import-agenturen-count')) el('import-agenturen-count').textContent = agenturIds.size;
      if (el('import-transaktionen-count')) el('import-transaktionen-count').textContent = UTILS.formatNumber(importTransaktionen.length);
      if (el('import-volumen')) el('import-volumen').textContent = UTILS.formatCurrency(totalVolumen);
      if (el('import-auffaellig-count')) el('import-auffaellig-count').textContent = UTILS.formatNumber(auffaelligeCount);

      // Zeige Upload-Zeit der neuesten Abrechnung
      const neuesteAbrechnung = recentAbrechnungen.sort((a, b) =>
        new Date(b.upload_datum) - new Date(a.upload_datum)
      )[0];
      if (el('last-import-time')) {
        el('last-import-time').textContent = UTILS.formatDate(neuesteAbrechnung.upload_datum, 'short');
      }

      // Zeige die Sektion
      const section = document.getElementById('last-import-kpis');
      if (section) section.style.display = 'block';

      console.log('✅ Letzter-Import-KPIs aktualisiert');

    } catch (error) {
      console.error('❌ Fehler beim Aktualisieren der Import-KPIs:', error);
    }
  }

  /**
   * Aktualisiert Transaktions-Tabelle
   */
  async updateTransactionsTable(filters = {}) {
    try {
      let transactions = await db.getAuffaelligeTransaktionen();

      // Apply anomaly category filters
      const enabledFilters = window.app ? window.app.getEnabledAnomalyFilters() : null;
      if (enabledFilters && enabledFilters.length > 0) {
        transactions = transactions.filter(t => {
          // If transaction has no category, show it
          if (!t.auffaelligkeits_kategorie) return true;
          // Otherwise, only show if category is enabled
          return enabledFilters.includes(t.auffaelligkeits_kategorie);
        });
      }

      // Apply status filter
      if (filters.status && filters.status !== 'all') {
        transactions = transactions.filter(t => t.status === filters.status);
      }

      // Apply search filter
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        transactions = transactions.filter(t =>
          t.kunde?.toLowerCase().includes(searchLower) ||
          t.vertrag_nr?.toLowerCase().includes(searchLower) ||
          t.agentur_name?.toLowerCase().includes(searchLower) ||
          t.transaktion_id?.toLowerCase().includes(searchLower)
        );
      }

      // Sort: NEU status first, then by date (newest first)
      transactions.sort((a, b) => {
        // NEU status kommt zuerst
        const aIsNew = a.status === 'NEU';
        const bIsNew = b.status === 'NEU';

        if (aIsNew && !bIsNew) return -1;
        if (!aIsNew && bIsNew) return 1;

        // Wenn beide NEU oder beide nicht NEU, sortiere nach Datum
        return new Date(b.erstellt_am) - new Date(a.erstellt_am);
      });

      // Update count
      document.getElementById('txn-count').textContent = transactions.length;

      // Update table
      const tbody = document.getElementById('transactions-table-body');
      if (!tbody) return;

      if (transactions.length === 0) {
        tbody.innerHTML = '<tr><td colspan="9" class="empty-state">Keine Auffälligkeiten vorhanden</td></tr>';
        return;
      }

      tbody.innerHTML = transactions.map(txn => {
        // Check if this is a newly flagged transaction
        const isNewlyFlagged = txn.status === 'NEU';
        const neuIndicator = isNewlyFlagged ? '<span style="background: #F59E0B; color: white; padding: 3px 8px; border-radius: 4px; font-size: 0.75rem; font-weight: 600; margin-left: 0.5rem;">NEU</span>' : '';

        // Get status colors
        const statusColors = {
          'NEW': { bg: '#FEF3C7', text: '#92400E' },
          'IN_BEARBEITUNG': { bg: '#FEF3C7', text: '#92400E' },
          'GEPRÜFT': { bg: '#DBEAFE', text: '#1E40AF' },
          'GEFLAGGT': { bg: '#FEE2E2', text: '#991B1B' },
          'OK': { bg: '#D1FAE5', text: '#065F46' },
          'ARCHIVIERT': { bg: '#F3F4F6', text: '#6B7280' }
        };
        const currentStatus = txn.status || 'NEW';
        const statusColor = statusColors[currentStatus] || statusColors['NEW'];

        return `
        <tr data-txn-id="${txn.transaktion_id}" class="txn-row" style="cursor: pointer;" title="Klicken für Details">
          <td class="status-cell" onclick="event.stopPropagation();">
            <select class="modern-status-dropdown" data-txn-id="${txn.transaktion_id}" onchange="app.handleStatusChange(this)" style="background-color: ${statusColor.bg}; color: ${statusColor.text}; border: none; border-radius: 12px; padding: 0.375rem 1.75rem 0.375rem 0.75rem; font-weight: 600;">
              <option value="NEW" ${txn.status === 'NEW' ? 'selected' : ''}>◇ Neu</option>
              <option value="IN_BEARBEITUNG" ${txn.status === 'IN_BEARBEITUNG' ? 'selected' : ''}>◷ In Bearbeitung</option>
              <option value="GEPRÜFT" ${txn.status === 'GEPRÜFT' ? 'selected' : ''}>○ Geprüft</option>
              <option value="GEFLAGGT" ${txn.status === 'GEFLAGGT' ? 'selected' : ''}>⚠ Geflaggt</option>
              <option value="OK" ${txn.status === 'OK' ? 'selected' : ''}>✓ OK</option>
              <option value="ARCHIVIERT" ${txn.status === 'ARCHIVIERT' ? 'selected' : ''}>▣ Archiviert</option>
            </select>
            ${neuIndicator}
            ${txn.bearbeiter ? `
              <div style="font-size: 0.7rem; color: var(--gray-600); margin-top: 0.25rem;">
                ◉ ${txn.bearbeiter}
              </div>
              ${txn.kommentare && txn.kommentare.length > 0 ? `
                <div style="font-size: 0.7rem; color: var(--gray-600); margin-top: 0.25rem; font-style: italic;">
                  ${txn.kommentare[txn.kommentare.length - 1].kommentar}
                </div>
              ` : ''}
            ` : ''}
          </td>
          <td style="white-space: nowrap;">${UTILS.formatDate(txn.erstellt_am, 'short')}</td>
          <td><code>${txn.transaktion_id}</code></td>
          <td>
            <div style="font-size: 0.85rem; color: #666;">${txn.agentur_id}</div>
            <div style="font-size: 0.9rem;">${txn.agentur_name}</div>
          </td>
          <td>${txn.kunde}</td>
          <td>
            <div style="font-weight: 600;">${txn.produkt_typ}</div>
            <div style="font-size: 0.85rem; color: #666;">${txn.produkt}</div>
          </td>
          <td style="text-align: right; font-weight: 600;">${UTILS.formatCurrency(txn.betrag)}</td>
          <td style="text-align: right;">${UTILS.formatProvision(txn)}</td>
          <td>
            <div style="font-size: 0.85rem; color: #666; max-width: 200px;">
              ${txn.auffaelligkeits_grund || '-'}
              ${txn.auffaelligkeits_kategorie ? `<br><a href="#" class="anomaly-details-link" data-txn-id="${txn.transaktion_id}" style="color: var(--secondary-color); text-decoration: none; font-weight: 500;">→ Details anzeigen</a>` : ''}
            </div>
          </td>
          <td class="action-cell">
            <div style="display: flex; gap: 0.5rem;">
              <button class="btn-icon" onclick="app.changeTransactionStatus('${txn.transaktion_id}', 'OK')" title="Als OK markieren">
                ✅
              </button>
              <button class="btn-icon" onclick="app.changeTransactionStatus('${txn.transaktion_id}', 'GEFLAGGT')" title="Als kritisch markieren">
                🚫
              </button>
              <button class="btn-icon" onclick="app.viewTransactionDetail('${txn.transaktion_id}')" title="Details anzeigen">
                👁️
              </button>
            </div>
          </td>
        </tr>
        `;
      }).join('');

      // Event Listener für Zeilen-Klicks hinzufügen
      tbody.querySelectorAll('tr.txn-row').forEach(row => {
        row.addEventListener('click', (e) => {
          // Ignoriere Klicks auf Buttons oder innerhalb der Aktions-Spalte
          if (e.target.closest('.action-cell') || e.target.closest('button')) {
            return;
          }

          const txnId = row.getAttribute('data-txn-id');
          if (txnId) {
            app.showAnomalyDetail(txnId);
          }
        });
      });

      // Event Listener für Details-Links
      tbody.querySelectorAll('.anomaly-details-link').forEach(link => {
        link.addEventListener('click', (e) => {
          e.preventDefault();
          e.stopPropagation(); // Verhindert doppelten Trigger durch Zeilen-Klick
          const txnId = link.getAttribute('data-txn-id');
          if (txnId) {
            app.showAnomalyDetail(txnId);
          }
        });
      });

      // Sortier-Event-Listener für Tabellen-Header
      const table = document.getElementById('transactions-table');
      if (table) {
        const headers = table.querySelectorAll('th[data-sort]');
        headers.forEach(header => {
          header.addEventListener('click', () => {
            const sortBy = header.getAttribute('data-sort');
            this.sortTransactionsTable(sortBy, transactions);
          });
        });
      }

    } catch (error) {
      console.error('Fehler beim Aktualisieren der Transaktions-Tabelle:', error);
    }
  }

  /**
   * Sortiert die Transaktions-Tabelle
   */
  sortTransactionsTable(sortBy, transactions) {
    // Toggle sort direction
    if (!this.tableSortState) {
      this.tableSortState = { column: null, direction: 'asc' };
    }

    if (this.tableSortState.column === sortBy) {
      this.tableSortState.direction = this.tableSortState.direction === 'asc' ? 'desc' : 'asc';
    } else {
      this.tableSortState.column = sortBy;
      this.tableSortState.direction = 'asc';
    }

    // Sort transactions
    transactions.sort((a, b) => {
      let aVal, bVal;

      switch(sortBy) {
        case 'status':
          aVal = a.status || 'NEW';
          bVal = b.status || 'NEW';
          break;
        case 'datum':
          aVal = new Date(a.erstellt_am);
          bVal = new Date(b.erstellt_am);
          break;
        case 'txn_id':
          aVal = a.transaktion_id;
          bVal = b.transaktion_id;
          break;
        case 'agentur':
          aVal = a.agentur_name;
          bVal = b.agentur_name;
          break;
        case 'kunde':
          aVal = a.kunde;
          bVal = b.kunde;
          break;
        case 'produkt':
          aVal = a.produkt_typ;
          bVal = b.produkt_typ;
          break;
        case 'betrag':
          aVal = a.betrag || 0;
          bVal = b.betrag || 0;
          break;
        case 'provision':
          aVal = a.provision_prozent || 0;
          bVal = b.provision_prozent || 0;
          break;
        case 'grund':
          aVal = a.auffaelligkeits_grund || '';
          bVal = b.auffaelligkeits_grund || '';
          break;
        default:
          return 0;
      }

      let comparison = 0;
      if (aVal < bVal) comparison = -1;
      if (aVal > bVal) comparison = 1;

      return this.tableSortState.direction === 'asc' ? comparison : -comparison;
    });

    // Update sort indicators
    const table = document.getElementById('transactions-table');
    if (table) {
      table.querySelectorAll('.sort-indicator').forEach(indicator => {
        indicator.textContent = '';
      });

      const activeHeader = table.querySelector(`th[data-sort="${sortBy}"] .sort-indicator`);
      if (activeHeader) {
        activeHeader.textContent = this.tableSortState.direction === 'asc' ? ' ▲' : ' ▼';
      }
    }

    // Re-render table with sorted data
    this.renderTransactionsTableBody(transactions);
  }

  /**
   * Rendert den Tabellen-Body mit den gegebenen Transaktionen
   */
  renderTransactionsTableBody(transactions) {
    const tbody = document.getElementById('transactions-table-body');
    if (!tbody) return;

    if (transactions.length === 0) {
      tbody.innerHTML = '<tr><td colspan="10" class="empty-state">Keine Auffälligkeiten vorhanden</td></tr>';
      return;
    }

    const statusColors = {
      'NEW': { bg: '#FEF3C7', text: '#92400E' },
      'IN_BEARBEITUNG': { bg: '#FEF3C7', text: '#92400E' },
      'GEPRÜFT': { bg: '#DBEAFE', text: '#1E40AF' },
      'GEFLAGGT': { bg: '#FEE2E2', text: '#991B1B' },
      'OK': { bg: '#D1FAE5', text: '#065F46' },
      'ARCHIVIERT': { bg: '#F3F4F6', text: '#6B7280' }
    };

    tbody.innerHTML = transactions.map(txn => {
      const isAiDetected = txn.ai_detected === true;
      const aiIndicator = isAiDetected ? '<span style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 2px 6px; border-radius: 4px; font-size: 0.75rem; margin-left: 0.5rem;" title="Von OpenAI GPT-4o erkannt">🤖 AI</span>' : '';

      const currentStatus = txn.status || 'NEW';
      const statusColor = statusColors[currentStatus] || statusColors['NEW'];

      return `
      <tr data-txn-id="${txn.transaktion_id}" class="txn-row" style="cursor: pointer;" title="Klicken für Details">
        <td class="status-cell" onclick="event.stopPropagation();">
          <select class="modern-status-dropdown" data-txn-id="${txn.transaktion_id}" onchange="app.handleStatusChange(this)" style="background-color: ${statusColor.bg}; color: ${statusColor.text}; border: none; border-radius: 12px; padding: 0.375rem 1.75rem 0.375rem 0.75rem; font-weight: 600;">
            <option value="NEW" ${txn.status === 'NEW' ? 'selected' : ''}>◇ Neu</option>
            <option value="IN_BEARBEITUNG" ${txn.status === 'IN_BEARBEITUNG' ? 'selected' : ''}>◷ In Bearbeitung</option>
            <option value="GEPRÜFT" ${txn.status === 'GEPRÜFT' ? 'selected' : ''}>○ Geprüft</option>
            <option value="GEFLAGGT" ${txn.status === 'GEFLAGGT' ? 'selected' : ''}>⚠ Geflaggt</option>
            <option value="OK" ${txn.status === 'OK' ? 'selected' : ''}>✓ OK</option>
            <option value="ARCHIVIERT" ${txn.status === 'ARCHIVIERT' ? 'selected' : ''}>▣ Archiviert</option>
          </select>
          ${aiIndicator}
          ${txn.bearbeiter ? `<div style="font-size: 0.7rem; color: var(--gray-600); margin-top: 0.25rem;">◉ ${txn.bearbeiter}</div>` : ''}
        </td>
        <td style="white-space: nowrap;">${UTILS.formatDate(txn.erstellt_am, 'short')}</td>
        <td><code>${txn.transaktion_id}</code></td>
        <td>
          <div style="font-size: 0.85rem; color: #666;">${txn.agentur_id}</div>
          <div style="font-size: 0.9rem;">${txn.agentur_name}</div>
        </td>
        <td>${txn.kunde}</td>
        <td>
          <div style="font-weight: 600;">${txn.produkt_typ}</div>
          <div style="font-size: 0.85rem; color: #666;">${txn.produkt}</div>
        </td>
        <td style="text-align: right; font-weight: 600;">${UTILS.formatCurrency(txn.betrag)}</td>
        <td style="text-align: right;">${UTILS.formatProvision(txn)}</td>
        <td>
          <div style="font-size: 0.85rem; color: #666; max-width: 200px;">
            ${txn.auffaelligkeits_grund || '-'}
            ${txn.auffaelligkeits_kategorie ? `<br><a href="#" class="anomaly-details-link" data-txn-id="${txn.transaktion_id}" style="color: var(--secondary-color); text-decoration: none; font-weight: 500;">→ Details anzeigen</a>` : ''}
          </div>
        </td>
        <td class="action-cell">
          <div style="display: flex; gap: 0.5rem;">
            <button class="btn-icon" onclick="app.changeTransactionStatus('${txn.transaktion_id}', 'OK')" title="Als OK markieren">
              ✅
            </button>
            <button class="btn-icon" onclick="app.changeTransactionStatus('${txn.transaktion_id}', 'GEFLAGGT')" title="Als kritisch markieren">
              🚫
            </button>
            <button class="btn-icon" onclick="app.viewTransactionDetail('${txn.transaktion_id}')" title="Details anzeigen">
              👁️
            </button>
          </div>
        </td>
      </tr>
      `;
    }).join('');

    // Re-attach event listeners
    tbody.querySelectorAll('tr.txn-row').forEach(row => {
      row.addEventListener('click', (e) => {
        if (e.target.closest('.action-cell') || e.target.closest('button')) {
          return;
        }
        const txnId = row.getAttribute('data-txn-id');
        if (txnId) {
          app.showAnomalyDetail(txnId);
        }
      });
    });

    tbody.querySelectorAll('.anomaly-details-link').forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        const txnId = link.getAttribute('data-txn-id');
        if (txnId) {
          app.showAnomalyDetail(txnId);
        }
      });
    });
  }

  /**
   * Hilfsfunktion: Status-Icon
   */
  getStatusIcon(status) {
    const icons = {
      'NEU': '🆕',
      'GEPRÜFT': '🔍',
      'GEFLAGGT': '🚫',
      'OK': '✅'
    };
    return icons[status] || '❓';
  }

  /**
   * Zeigt Agentur-Transaktionen-Modal
   */
  async showAgencyTransactionsModal(agenturId, agenturName) {
    const modal = document.getElementById('analysis-modal');
    const modalBody = document.getElementById('analysis-modal-body');

    if (!modal || !modalBody) return;

    try {
      const transaktionen = await db.getTransaktionenByAgentur(agenturId);

      if (transaktionen.length === 0) {
        modalBody.innerHTML = `
          <h3>${agenturName} (${agenturId})</h3>
          <p>Keine Transaktionen für diese Agentur gefunden.</p>
        `;
        modal.style.display = 'block';
        return;
      }

      const auffaellig = transaktionen.filter(t => t.ist_auffaellig).length;

      modalBody.innerHTML = `
        <div style="margin-bottom: 1.5rem;">
          <h3 style="color: var(--primary-color); margin-bottom: 0.5rem;">
            ${agenturName} (${agenturId})
          </h3>
          <div style="font-size: 0.95rem; color: var(--gray-600);">
            ${transaktionen.length} Transaktionen | ${auffaellig} Auffälligkeiten
          </div>
        </div>

        <div style="overflow-x: auto; max-height: 500px; overflow-y: auto;">
          <table id="agency-txn-table" style="width: 100%; border-collapse: collapse; font-size: 12px;">
            <thead style="position: sticky; top: 0; background: white; border-bottom: 2px solid var(--gray-300);">
              <tr>
                <th style="text-align: left; padding: 0.75rem 0.5rem; font-weight: 600;">Datum</th>
                <th style="text-align: left; padding: 0.75rem 0.5rem; font-weight: 600;">Kunde</th>
                <th style="text-align: left; padding: 0.75rem 0.5rem; font-weight: 600;">Vertrag</th>
                <th style="text-align: left; padding: 0.75rem 0.5rem; font-weight: 600;">Produkt</th>
                <th style="text-align: right; padding: 0.75rem 0.5rem; font-weight: 600;">Beitrag</th>
                <th style="text-align: right; padding: 0.75rem 0.5rem; font-weight: 600;">Prov %</th>
                <th style="text-align: right; padding: 0.75rem 0.5rem; font-weight: 600;">Provision</th>
                <th style="text-align: left; padding: 0.75rem 0.5rem; font-weight: 600;">Status</th>
                <th style="text-align: left; padding: 0.75rem 0.5rem; font-weight: 600; min-width: 250px;">Begründung</th>
              </tr>
            </thead>
            <tbody>
              ${transaktionen.map(txn => `
                <tr class="agency-txn-row" data-txn-id="${txn.transaktion_id}" style="border-bottom: 1px solid var(--gray-200); ${txn.ist_auffaellig ? 'background: #FEF3C7; cursor: pointer;' : ''}" ${txn.ist_auffaellig ? 'title="Klicken für Details"' : ''}>
                  <td style="padding: 0.75rem 0.5rem; white-space: nowrap;">${UTILS.formatDate(txn.erstellt_am, 'short')}</td>
                  <td style="padding: 0.75rem 0.5rem;">${txn.kunde}</td>
                  <td style="padding: 0.75rem 0.5rem; font-family: monospace;">${txn.vertrag_nr}</td>
                  <td style="padding: 0.75rem 0.5rem;">${txn.produkt_typ}</td>
                  <td style="padding: 0.75rem 0.5rem; text-align: right;">${UTILS.formatCurrency(txn.jahresbeitrag)}</td>
                  <td style="padding: 0.75rem 0.5rem; text-align: right;">${UTILS.formatProvision(txn)}</td>
                  <td style="padding: 0.75rem 0.5rem; text-align: right; font-weight: 600;">${UTILS.formatCurrency(txn.betrag)}</td>
                  <td style="padding: 0.75rem 0.5rem;">
                    <span class="status-badge status-${txn.status.toLowerCase()}" style="font-size: 11px; padding: 0.25rem 0.5rem;">
                      ${txn.status}
                    </span>
                  </td>
                  <td style="padding: 0.75rem 0.5rem; font-size: 11px; color: #666; line-height: 1.4;">
                    ${txn.auffaelligkeits_grund || '-'}
                    ${txn.auffaelligkeits_kategorie ? `<br><a href="#" class="anomaly-details-link-agency" data-txn-id="${txn.transaktion_id}" style="color: var(--secondary-color); text-decoration: none; font-weight: 600;">→ Details</a>` : ''}
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      `;

      modal.style.display = 'block';

      // Event Listener für Zeilen-Klicks (nur auffällige Transaktionen)
      const table = document.getElementById('agency-txn-table');
      if (table) {
        table.querySelectorAll('tr.agency-txn-row').forEach(row => {
          row.addEventListener('click', (e) => {
            const txnId = row.getAttribute('data-txn-id');
            const txn = transaktionen.find(t => t.transaktion_id === txnId);

            // Nur für auffällige Transaktionen
            if (txn && txn.ist_auffaellig && txnId) {
              app.showAnomalyDetail(txnId);
            }
          });
        });

        // Event Listener für Details-Links
        table.querySelectorAll('.anomaly-details-link-agency').forEach(link => {
          link.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            const txnId = link.getAttribute('data-txn-id');
            if (txnId) {
              app.showAnomalyDetail(txnId);
            }
          });
        });
      }
    } catch (error) {
      console.error('Fehler beim Laden der Agentur-Transaktionen:', error);
      this.showToast('Fehler beim Laden der Transaktionen', 'error');
    }
  }

  /**
   * Zeigt Detail-Modal für Auffälligkeit
   */
  async showAnomalyDetailModal(transaktionId) {
    const modal = document.getElementById('analysis-modal');
    const modalBody = document.getElementById('analysis-modal-body');

    if (!modal || !modalBody) return;

    try {
      // Hole Transaktion
      const allTxn = await db.getAllTransaktionen();
      const txn = allTxn.find(t => t.transaktion_id === transaktionId);

      if (!txn) {
        this.showToast('Transaktion nicht gefunden', 'error');
        return;
      }

      if (!txn.auffaelligkeits_kategorie) {
        console.warn('⚠️ Transaktion hat keine auffaelligkeits_kategorie:', txn);
        console.warn('⚠️ Wahrscheinlich alte Daten - bitte Browser-Cache leeren und Seite neu laden');
        modalBody.innerHTML = `
          <h3>Auffälligkeitsdetails</h3>
          <p><strong>Transaktion:</strong> ${txn.transaktion_id}</p>
          <p><strong>Kunde:</strong> ${txn.kunde}</p>
          <p><strong>Grund:</strong> ${txn.auffaelligkeits_grund || 'Keine Details verfügbar'}</p>
          <div style="margin-top: 1rem; padding: 1rem; background: #FEF3C7; border-left: 4px solid #F59E0B;">
            <strong>⚠️ Hinweis:</strong> Diese Transaktion wurde mit einer älteren Version erstellt.<br>
            Bitte führen Sie einen <strong>Hard Refresh</strong> durch (Strg+Shift+R / Cmd+Shift+R),<br>
            um die Datenbank mit den neuen Kategorien neu zu initialisieren.
          </div>
        `;
        modal.style.display = 'block';
        return;
      }

      // Hole Kategorie-Details
      const kategorien = massDataGenerator.getAuffaelligkeitsKategorien();
      const kategorie = kategorien[txn.auffaelligkeits_kategorie];

      console.log('📊 Kategorie Details:', {
        kategorie_key: txn.auffaelligkeits_kategorie,
        kategorie: kategorie,
        verfügbare_kategorien: Object.keys(kategorien)
      });

      if (!kategorie) {
        modalBody.innerHTML = `<p>Kategorie nicht gefunden</p>`;
        modal.style.display = 'block';
        return;
      }

      // Zeige detaillierte Analyse
      modalBody.innerHTML = `
        <div style="margin-bottom: 1.5rem;">
          <h3 style="color: var(--primary-color); margin-bottom: 0.5rem;">
            ${kategorie.titel}
          </h3>
          <div style="font-size: 0.9rem; color: var(--gray-600); margin-bottom: 1rem;">
            <strong>Transaktion:</strong> ${txn.transaktion_id} |
            <strong>Kunde:</strong> ${txn.kunde} |
            <strong>Vertrag:</strong> ${txn.vertrag_nr}
          </div>
        </div>

        <div style="line-height: 1.6; font-size: 0.95rem;">
          ${kategorie.detail(txn)}
        </div>

        <div style="margin-top: 2rem; padding-top: 1rem; border-top: 2px solid var(--gray-200);">
          <h4 style="margin-bottom: 0.5rem;">Transaktionsdetails</h4>
          <table style="width: 100%; font-size: 0.9rem;">
            <tr>
              <td style="padding: 0.25rem 0;"><strong>Produkt:</strong></td>
              <td style="padding: 0.25rem 0;">${txn.produkt_typ} (${txn.produkt})</td>
            </tr>
            <tr>
              <td style="padding: 0.25rem 0;"><strong>Jahresbeitrag:</strong></td>
              <td style="padding: 0.25rem 0;">${UTILS.formatCurrency(txn.jahresbeitrag)}</td>
            </tr>
            <tr>
              <td style="padding: 0.25rem 0;"><strong>Provision:</strong></td>
              <td style="padding: 0.25rem 0;">${UTILS.formatCurrency(txn.betrag)} (${UTILS.formatProvision(txn)})</td>
            </tr>
            <tr>
              <td style="padding: 0.25rem 0;"><strong>Agentur:</strong></td>
              <td style="padding: 0.25rem 0;">${txn.agentur_name} (${txn.agentur_id})</td>
            </tr>
            <tr>
              <td style="padding: 0.25rem 0;"><strong>Periode:</strong></td>
              <td style="padding: 0.25rem 0;">${txn.periode}</td>
            </tr>
            <tr>
              <td style="padding: 0.25rem 0;"><strong>Status:</strong></td>
              <td style="padding: 0.25rem 0;">
                <span class="status-badge status-${txn.status.toLowerCase()}">${txn.status}</span>
              </td>
            </tr>
          </table>
        </div>
      `;

      modal.style.display = 'block';
    } catch (error) {
      console.error('Fehler beim Laden der Auffälligkeitsdetails:', error);
      this.showToast('Fehler beim Laden der Details', 'error');
    }
  }
}

// Singleton-Instanz
const ui = new UIController();
