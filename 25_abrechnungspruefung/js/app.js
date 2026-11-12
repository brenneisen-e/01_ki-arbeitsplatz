/**
 * Alpha Provisionsanalyse-System - Main Application
 * ==================================================
 * Haupt-Orchestrierung und Event-Handler
 */

class App {
  constructor() {
    this.files = [];
    this.isProcessing = false;
  }

  /**
   * Initialisiert die Anwendung
   */
  async init() {
    console.log('🚀 Alpha Provisionsanalyse-System wird initialisiert...');

    try {
      // Prüfe ob IndexedDB verfügbar ist
      if (!window.indexedDB) {
        throw new Error('IndexedDB ist in diesem Browser nicht verfügbar. Bitte verwenden Sie einen modernen Browser oder deaktivieren Sie den Privacy-Modus.');
      }

      // Initialisiere Datenbank
      try {
        await db.init();
        console.log('✓ Datenbank initialisiert');
      } catch (dbError) {
        console.error('⚠️ Datenbank-Initialisierung fehlgeschlagen:', dbError);

        // Fallback: Zeige Warnung aber lade App trotzdem
        ui.showToast(
          '⚠️ Datenbank konnte nicht initialisiert werden.\n\n' +
          'Mögliche Ursachen:\n' +
          '• Privater Browsing-Modus aktiv\n' +
          '• Browser-Einstellungen blockieren lokale Datenbanken\n' +
          '• Speicherplatz voll\n\n' +
          'Die App läuft im eingeschränkten Modus ohne Datenpersistenz.',
          'warning',
          10000
        );

        // Setze Mock-DB für UI
        this.db = {
          isAvailable: false,
          getTransaktionenStats: async () => ({
            gesamt: 0,
            auffaellig: 0,
            prozent_auffaellig: 0,
            nach_status: { NEU: 0, GEPRÜFT: 0, OK: 0, GEFLAGGT: 0 },
            gesamt_provision: 0,
            anzahl_agenturen: 0,
            anzahl_perioden: 0,
            anzahl_abrechnungen: 0
          })
        };
      }

      // Auto-Load Mass Demo Data (wenn noch keine Daten vorhanden)
      let massDataResult = null;
      if (db.db) { // Nur wenn DB erfolgreich initialisiert
        try {
          console.log('Prüfe ob massDataGenerator verfügbar ist:', typeof massDataGenerator);
          massDataResult = await massDataGenerator.autoLoadIfNeeded();
          if (massDataResult) {
            console.log(`✓ ${massDataResult.transaktionen} Demo-Transaktionen geladen (${massDataResult.auffaelligkeiten} Auffälligkeiten)`);
          } else {
            console.log('✓ Demo-Daten bereits vorhanden oder Generierung übersprungen');
          }
        } catch (error) {
          console.error('⚠️ Fehler beim Laden der Demo-Daten:', error);
          console.error('Error Stack:', error.stack);
          // Fahre trotzdem fort, um die App nutzbar zu halten
        }
      } else {
        console.warn('⚠️ Demo-Daten werden nicht geladen (DB nicht verfügbar)');
      }

      // Lade API-Key
      const apiKey = openaiClient.loadApiKey();
      if (apiKey) {
        console.log('✓ API-Key geladen');
        ui.updateAPIStatus(true);
      }

      // Binde Event-Listener
      this.bindEventListeners();
      console.log('✓ Event-Listener gebunden');

      // Aktualisiere UI (nur wenn DB verfügbar)
      if (db.db) {
        await this.refreshDashboard();
        await ui.updateKPIDashboard();
        console.log('✓ Dashboard aktualisiert');
      } else {
        // Mock-Update für UI ohne DB
        console.log('⚠️ Dashboard-Update übersprungen (DB nicht verfügbar)');
        await ui.updateKPIDashboard(); // Zeigt Nullen
      }

      console.log('✅ Initialisierung abgeschlossen');

      // Willkommens-Toast
      if (massDataResult) {
        ui.showToast(`Demo-System bereit mit ${UTILS.formatNumber(massDataResult.transaktionen)} Transaktionen!`, 'success');
      } else {
        ui.showToast('Alpha Provisionsanalyse-System bereit!', 'success');
      }

    } catch (error) {
      console.error('❌ Fehler bei Initialisierung:', error);
      ui.showToast('Fehler beim Laden der Anwendung: ' + error.message, 'error');
    }
  }

  /**
   * Bindet alle Event-Listener
   */
  bindEventListeners() {
    // Navigation
    document.querySelectorAll('.nav-item').forEach(item => {
      item.addEventListener('click', (e) => {
        e.preventDefault();
        const section = item.dataset.section;
        if (section) {
          ui.switchSection(section);
          if (section === 'kpi') ui.updateKPIDashboard();
          if (section === 'transactions') ui.updateTransactionsTable();
          if (section === 'dashboard') this.refreshDashboard();
          if (section === 'history') ui.updateHistoryTable();
          if (section === 'agencies') ui.updateAgenciesGrid();
        }
      });
    });

    // File Upload
    const dropZone = document.getElementById('drop-zone');
    const fileInput = document.getElementById('file-input');
    const selectFilesBtn = document.getElementById('select-files-btn');

    if (dropZone) {
      dropZone.addEventListener('click', () => fileInput.click());
      dropZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropZone.classList.add('drag-over');
      });
      dropZone.addEventListener('dragleave', () => {
        dropZone.classList.remove('drag-over');
      });
      dropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropZone.classList.remove('drag-over');
        this.handleFiles(e.dataTransfer.files);
      });
    }

    if (selectFilesBtn) {
      selectFilesBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        fileInput.click();
      });
    }

    if (fileInput) {
      fileInput.addEventListener('change', (e) => {
        this.handleFiles(e.target.files);
      });
    }

    // API-Key Management
    const saveApiKeyBtn = document.getElementById('save-api-key');
    const testApiKeyBtn = document.getElementById('test-api-key');

    if (saveApiKeyBtn) {
      saveApiKeyBtn.addEventListener('click', () => this.saveApiKey());
    }

    if (testApiKeyBtn) {
      testApiKeyBtn.addEventListener('click', () => this.testApiKey());
    }

    // Analysis Controls
    const startAnalysisBtn = document.getElementById('start-analysis-btn');
    const clearFilesBtn = document.getElementById('clear-files');

    if (startAnalysisBtn) {
      startAnalysisBtn.addEventListener('click', () => this.startAnalysis());
    }

    if (clearFilesBtn) {
      clearFilesBtn.addEventListener('click', () => this.clearFiles());
    }

    // Modal Controls
    document.querySelectorAll('.modal-close').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const modal = e.target.closest('.modal');
        if (modal) ui.closeModal(modal.id);
      });
    });

    const closeModalBtn = document.getElementById('close-modal');
    if (closeModalBtn) {
      closeModalBtn.addEventListener('click', () => ui.closeModal('analysis-modal'));
    }

    // Settings
    const settingsBtn = document.getElementById('settings-btn');
    const saveSettingsBtn = document.getElementById('save-settings');
    const cancelSettingsBtn = document.getElementById('cancel-settings');
    const selectAllFiltersBtn = document.getElementById('select-all-filters');
    const deselectAllFiltersBtn = document.getElementById('deselect-all-filters');

    if (settingsBtn) {
      settingsBtn.addEventListener('click', () => {
        this.loadSettings();
        document.getElementById('settings-modal').classList.add('active');
      });
    }

    if (saveSettingsBtn) {
      saveSettingsBtn.addEventListener('click', () => {
        this.saveSettings();
        document.getElementById('settings-modal').classList.remove('active');
      });
    }

    if (cancelSettingsBtn) {
      cancelSettingsBtn.addEventListener('click', () => {
        document.getElementById('settings-modal').classList.remove('active');
      });
    }

    if (selectAllFiltersBtn) {
      selectAllFiltersBtn.addEventListener('click', () => {
        document.querySelectorAll('.anomaly-filter').forEach(cb => cb.checked = true);
      });
    }

    if (deselectAllFiltersBtn) {
      deselectAllFiltersBtn.addEventListener('click', () => {
        document.querySelectorAll('.anomaly-filter').forEach(cb => cb.checked = false);
      });
    }

    // Demo Mode
    const demoModeBtn = document.getElementById('demo-mode-btn');
    if (demoModeBtn) {
      demoModeBtn.addEventListener('click', () => ui.toggleDemoPanel());
    }

    const closeDemoPanelBtn = document.getElementById('close-demo-panel');
    if (closeDemoPanelBtn) {
      closeDemoPanelBtn.addEventListener('click', () => ui.toggleDemoPanel());
    }

    document.querySelectorAll('.demo-btn').forEach(btn => {
      btn.addEventListener('click', () => this.loadDemoScenario(btn.dataset.scenario));
    });

    // Export Buttons
    const exportExcelBtn = document.getElementById('export-excel');
    const exportPdfBtn = document.getElementById('export-pdf-report');
    const exportJsonBtn = document.getElementById('export-json');
    const exportHistoryBtn = document.getElementById('export-history');
    const exportDashboardBtn = document.getElementById('export-dashboard');

    if (exportExcelBtn) {
      exportExcelBtn.addEventListener('click', () => this.exportExcel());
    }

    if (exportPdfBtn) {
      exportPdfBtn.addEventListener('click', () => this.exportPDF());
    }

    if (exportJsonBtn) {
      exportJsonBtn.addEventListener('click', () => this.exportJSON());
    }

    if (exportHistoryBtn) {
      exportHistoryBtn.addEventListener('click', () => this.exportExcel());
    }

    if (exportDashboardBtn) {
      exportDashboardBtn.addEventListener('click', () => this.exportExcel());
    }

    // Import
    const importJsonBtn = document.getElementById('import-json-btn');
    const importJsonInput = document.getElementById('import-json-input');

    if (importJsonBtn) {
      importJsonBtn.addEventListener('click', () => importJsonInput.click());
    }

    if (importJsonInput) {
      importJsonInput.addEventListener('change', (e) => this.importJSON(e.target.files[0]));
    }

    // Clear Database
    const clearDbBtn = document.getElementById('clear-database');
    if (clearDbBtn) {
      clearDbBtn.addEventListener('click', () => this.clearDatabase());
    }

    // Search
    const searchHistory = document.getElementById('search-history');
    if (searchHistory) {
      searchHistory.addEventListener('input', UTILS.debounce((e) => {
        ui.updateHistoryTable({ search: e.target.value });
      }, 300));
    }

    // Filters
    const filterRisk = document.getElementById('filter-risk');
    const filterPeriod = document.getElementById('filter-period');

    if (filterRisk) {
      filterRisk.addEventListener('change', () => this.refreshDashboard());
    }

    if (filterPeriod) {
      filterPeriod.addEventListener('change', () => this.refreshDashboard());
    }

    // KPI Dashboard Buttons
    const viewAuffaelligkeitenBtn = document.getElementById('view-auffaelligkeiten-btn');
    const generatePdfBtn = document.getElementById('generate-pdf-btn');
    const reloadDemoDataBtn = document.getElementById('reload-demo-data-btn');

    if (viewAuffaelligkeitenBtn) {
      viewAuffaelligkeitenBtn.addEventListener('click', () => {
        ui.switchSection('transactions');
        ui.updateTransactionsTable();
      });
    }

    if (generatePdfBtn) {
      generatePdfBtn.addEventListener('click', () => this.generateTestPDF());
    }

    if (reloadDemoDataBtn) {
      reloadDemoDataBtn.addEventListener('click', () => this.reloadDemoData());
    }

    // Transaction Filters
    const filterTxnStatus = document.getElementById('filter-txn-status');
    const searchTransactions = document.getElementById('search-transactions');
    const exportTransactions = document.getElementById('export-transactions');

    if (filterTxnStatus) {
      filterTxnStatus.addEventListener('change', () => {
        ui.updateTransactionsTable({
          status: filterTxnStatus.value,
          search: searchTransactions?.value
        });
      });
    }

    if (searchTransactions) {
      searchTransactions.addEventListener('input', UTILS.debounce(() => {
        ui.updateTransactionsTable({
          status: filterTxnStatus?.value,
          search: searchTransactions.value
        });
      }, 300));
    }

    if (exportTransactions) {
      exportTransactions.addEventListener('click', () => this.exportTransactions());
    }
  }

  /**
   * Verarbeitet hochgeladene Dateien
   */
  handleFiles(fileList) {
    const newFiles = Array.from(fileList);

    // Validierung
    const errors = [];

    if (this.files.length + newFiles.length > CONFIG.UPLOAD.MAX_FILES) {
      errors.push(CONFIG.ERRORS.TOO_MANY_FILES);
    }

    newFiles.forEach(file => {
      if (file.size > CONFIG.UPLOAD.MAX_FILE_SIZE) {
        errors.push(`${file.name}: ${CONFIG.ERRORS.FILE_TOO_LARGE}`);
      }
      if (!CONFIG.UPLOAD.ACCEPTED_TYPES.includes(file.type)) {
        errors.push(`${file.name}: ${CONFIG.ERRORS.INVALID_FILE_TYPE}`);
      }
    });

    if (errors.length > 0) {
      ui.showToast(errors.join('\n'), 'error');
      return;
    }

    // Füge Dateien hinzu
    this.files.push(...newFiles);
    ui.updateFileList(this.files);
    ui.showToast(`${newFiles.length} Datei(en) hinzugefügt`, 'success');
  }

  /**
   * Entfernt Datei
   */
  removeFile(index) {
    this.files.splice(index, 1);
    ui.updateFileList(this.files);
  }

  /**
   * Löscht alle Dateien
   */
  clearFiles() {
    this.files = [];
    ui.updateFileList(this.files);
  }

  /**
   * Speichert API-Key
   */
  async saveApiKey() {
    const input = document.getElementById('api-key-input');
    const apiKey = input.value.trim();

    if (!apiKey) {
      ui.showToast('Bitte geben Sie einen API-Key ein', 'warning');
      return;
    }

    if (!UTILS.isValidApiKey(apiKey)) {
      ui.showToast('API-Key-Format ungültig', 'error');
      return;
    }

    openaiClient.setApiKey(apiKey);
    ui.updateAPIStatus(true);
    ui.showToast(CONFIG.SUCCESS.API_KEY_SAVED, 'success');
  }

  /**
   * Testet API-Key
   */
  async testApiKey() {
    const input = document.getElementById('api-key-input');
    const apiKey = input.value.trim() || openaiClient.apiKey;

    if (!apiKey) {
      ui.showToast('Kein API-Key vorhanden', 'warning');
      return;
    }

    try {
      ui.showToast('Teste API-Key...', 'info');
      await openaiClient.testApiKey(apiKey);
      ui.showToast(CONFIG.SUCCESS.API_KEY_VALID, 'success');
    } catch (error) {
      ui.showToast('API-Key ungültig: ' + error.message, 'error');
    }
  }

  /**
   * Startet Analyse (DEMO-MODUS: Simuliert KI-Analyse)
   */
  async startAnalysis() {
    if (this.isProcessing) {
      ui.showToast('Analyse läuft bereits', 'warning');
      return;
    }

    if (this.files.length === 0) {
      ui.showToast('Keine Dateien zum Analysieren', 'warning');
      return;
    }

    // DEMO-MODUS: Keine API-Key-Prüfung nötig
    this.isProcessing = true;
    const startTime = Date.now();

    try {
      console.log('🎭 DEMO-MODUS: Simuliere KI-Analyse...');
      ui.showProgress(0, this.files.length);

      // Simuliere kurze Analyse-Zeit für jede Datei
      for (let i = 0; i < this.files.length; i++) {
        const file = this.files[i];
        ui.updateFileStatus(i, 'processing', 'PDF wird verarbeitet...');
        await new Promise(resolve => setTimeout(resolve, 500));

        ui.updateFileStatus(i, 'processing', 'KI-Analyse läuft...');
        await new Promise(resolve => setTimeout(resolve, 800));

        ui.updateFileStatus(i, 'success');
        ui.showProgress(i + 1, this.files.length);
      }

      ui.hideProgress();
      ui.showToast('Analyse abgeschlossen - 3 neue Auffälligkeiten gefunden!', 'success');

      // Hole 3 zufällige nicht-auffällige Transaktionen
      const allTransaktionen = await db.getAllTransaktionen();
      const normalTransaktionen = allTransaktionen.filter(t => !t.ist_auffaellig);

      if (normalTransaktionen.length >= 3) {
        // Wähle 3 zufällige Transaktionen
        const selectedIndices = new Set();
        while (selectedIndices.size < 3) {
          selectedIndices.add(Math.floor(Math.random() * normalTransaktionen.length));
        }

        const newlyFlagged = Array.from(selectedIndices).map(idx => normalTransaktionen[idx]);

        // Definiere verschiedene Auffälligkeitskategorien
        const categories = [
          { key: 'AUFFÄLLIGE_PROVISIONSHÖHE', grund: 'Agentur zeigt ungewöhnlich hohe Provisionen im Vergleich zu historischen Durchschnittswerten.' },
          { key: 'COMPLIANCE_LIMIT', grund: 'Provisionshöhe liegt über der festgelegten Compliance-Grenze für diese Produktkategorie.' },
          { key: 'CHURNING_VERDACHT', grund: 'Verdacht auf Churning: Mehrfache Vertragsänderungen in kurzer Zeit erkennbar.' }
        ];

        // Markiere die Transaktionen als auffällig
        const flaggedIds = [];
        for (let i = 0; i < newlyFlagged.length; i++) {
          const txn = newlyFlagged[i];
          const category = categories[i];

          // Setze ein zufälliges Oktober-Datum (2025)
          const oktoberTag = Math.floor(Math.random() * 31) + 1; // 1-31
          const oktoberDatum = new Date(2025, 9, oktoberTag); // Monat 9 = Oktober (0-basiert)

          txn.ist_auffaellig = true;
          txn.auffaelligkeits_kategorie = category.key;
          txn.auffaelligkeits_grund = category.grund;
          txn.status = 'NEU';
          txn.erstellt_am = oktoberDatum.toISOString();
          txn.geflaggt_am = oktoberDatum.toISOString();
          txn.ai_detected = true;

          await db.updateTransaktion(txn);
          flaggedIds.push(txn.transaktion_id);
        }

        console.log(`✅ 3 Transaktionen als auffällig markiert:`, flaggedIds);

        // Speichere die IDs für die Blink-Animation
        window.newlyFlaggedTransactions = flaggedIds;

        // Warte kurz und wechsle dann zur Auffälligkeiten-Seite
        await new Promise(resolve => setTimeout(resolve, 500));
        ui.switchSection('transactions');
        await ui.updateTransactionsTable();
        await ui.updateKPIDashboard();

        // Trigger Blink-Animation nach dem Rendern
        setTimeout(() => {
          flaggedIds.forEach(id => {
            const row = document.querySelector(`tr[data-txn-id="${id}"]`);
            if (row) {
              row.classList.add('newly-flagged');
              // Entferne die Klasse nach der Animation
              setTimeout(() => row.classList.remove('newly-flagged'), 3000);
            }
          });
        }, 100);
      } else {
        ui.showToast('Nicht genug Transaktionen für Demo verfügbar', 'warning');
      }

      // Lösche Dateien
      this.clearFiles();

    } catch (error) {
      console.error('Fehler bei Analyse:', error);
      ui.showToast('Fehler bei Analyse: ' + error.message, 'error');
      ui.hideProgress();
    } finally {
      this.isProcessing = false;
    }
  }

  /**
   * Aktualisiert Dashboard
   */
  async refreshDashboard() {
    await ui.updateDashboard();
    await ui.updateLastImportKPIs(); // Zeige Import-KPIs
  }

  /**
   * Zeigt Analyse-Details
   */
  async showAnalysisDetail(analysisId) {
    const analysis = await db.getAbrechnungById(analysisId);
    if (analysis) {
      ui.showAnalysisModal(analysis);
    }
  }

  /**
   * Zeigt Agentur-Details mit allen Transaktionen
   */
  async showAgencyDetail(agenturId) {
    const agenturen = await db.getAllAgenturen();
    const agentur = agenturen.find(ag => ag.agentur_id === agenturId);

    if (agentur) {
      ui.showAgencyTransactionsModal(agenturId, agentur.agentur_name);
    } else {
      ui.showToast('Agentur nicht gefunden', 'error');
    }
  }

  /**
   * Zeigt Auffälligkeits-Detail-Modal
   */
  async showAnomalyDetail(transaktionId) {
    await ui.showAnomalyDetailModal(transaktionId);
  }

  /**
   * Löscht Analyse
   */
  async deleteAnalysis(analysisId) {
    if (!confirm('Möchten Sie diese Analyse wirklich löschen?')) {
      return;
    }

    try {
      await db.deleteAbrechnung(analysisId);
      ui.showToast('Analyse gelöscht', 'success');
      await this.refreshDashboard();
      await ui.updateHistoryTable();
    } catch (error) {
      ui.showToast('Fehler beim Löschen: ' + error.message, 'error');
    }
  }

  /**
   * Lädt Demo-Szenario
   */
  async loadDemoScenario(scenario) {
    try {
      ui.showToast('Lade Demo-Daten...', 'info');
      const count = await demoMode.loadScenario(scenario);
      ui.showToast(`${count} Demo-Abrechnung(en) geladen`, 'success');
      ui.toggleDemoPanel();
      await this.refreshDashboard();
      ui.switchSection('dashboard');
    } catch (error) {
      ui.showToast('Fehler beim Laden der Demo-Daten: ' + error.message, 'error');
    }
  }

  /**
   * Exportiert als Excel
   */
  async exportExcel() {
    try {
      const data = await db.getAllAbrechnungen();
      if (data.length === 0) {
        ui.showToast('Keine Daten zum Exportieren', 'warning');
        return;
      }

      const fileName = await reportGenerator.generateExcelReport(data);
      ui.showToast(`Excel-Report erstellt: ${fileName}`, 'success');
    } catch (error) {
      ui.showToast('Fehler beim Excel-Export: ' + error.message, 'error');
    }
  }

  /**
   * Exportiert als PDF
   */
  async exportPDF() {
    try {
      const data = await db.getAllAbrechnungen();
      if (data.length === 0) {
        ui.showToast('Keine Daten zum Exportieren', 'warning');
        return;
      }

      const fileName = await reportGenerator.generatePDFReport(data);
      ui.showToast(`PDF-Report erstellt: ${fileName}`, 'success');
    } catch (error) {
      ui.showToast('Fehler beim PDF-Export: ' + error.message, 'error');
    }
  }

  /**
   * Exportiert als JSON
   */
  async exportJSON() {
    try {
      const data = await db.exportDatabase();
      reportGenerator.generateJSONExport(data);
      ui.showToast(CONFIG.SUCCESS.EXPORT_COMPLETE, 'success');
    } catch (error) {
      ui.showToast('Fehler beim JSON-Export: ' + error.message, 'error');
    }
  }

  /**
   * Importiert JSON
   */
  async importJSON(file) {
    if (!file) return;

    try {
      ui.showToast('Importiere Daten...', 'info');
      const jsonData = await reportGenerator.importJSON(file);
      const result = await db.importDatabase(jsonData);

      ui.showToast(
        `Import abgeschlossen: ${result.success} Einträge importiert, ${result.errors.length} Fehler`,
        result.errors.length > 0 ? 'warning' : 'success'
      );

      await this.refreshDashboard();
    } catch (error) {
      ui.showToast('Fehler beim Import: ' + error.message, 'error');
    }
  }

  /**
   * Löscht Datenbank
   */
  async clearDatabase() {
    if (!confirm('ACHTUNG: Alle Daten werden unwiderruflich gelöscht!\n\nFortfahren?')) {
      return;
    }

    try {
      await db.clearAllData();
      ui.showToast(CONFIG.SUCCESS.DATABASE_CLEARED, 'success');
      await this.refreshDashboard();
      await ui.updateHistoryTable();
    } catch (error) {
      ui.showToast('Fehler beim Löschen: ' + error.message, 'error');
    }
  }

  /**
   * Ändert Status einer Transaktion
   */
  async changeTransactionStatus(transaktionId, newStatus) {
    try {
      await db.updateTransaktionStatus(transaktionId, newStatus);
      ui.showToast(`Status auf "${newStatus}" geändert`, 'success');
      await ui.updateTransactionsTable();
      await ui.updateKPIDashboard();
    } catch (error) {
      ui.showToast('Fehler beim Ändern des Status: ' + error.message, 'error');
    }
  }

  /**
   * Zeigt Transaktions-Details
   */
  async viewTransactionDetail(transaktionId) {
    try {
      const all = await db.getAllTransaktionen();
      const txn = all.find(t => t.transaktion_id === transaktionId);
      if (!txn) {
        ui.showToast('Transaktion nicht gefunden', 'error');
        return;
      }

      // Create detail view in modal
      const modal = document.getElementById('analysis-modal');
      const modalBody = document.getElementById('analysis-modal-body');

      modalBody.innerHTML = `
        <div style="padding: 1rem;">
          <h3>Transaktions-Details: ${txn.transaktion_id}</h3>

          <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 1rem; margin-top: 1.5rem;">
            <div>
              <strong>Status:</strong><br>
              <span class="status-badge status-${txn.status.toLowerCase()}">${ui.getStatusIcon(txn.status)} ${txn.status}</span>
            </div>
            <div><strong>Agentur:</strong><br>${txn.agentur_name} (${txn.agentur_id})</div>
            <div><strong>Kunde:</strong><br>${txn.kunde}</div>
            <div><strong>Vertragsnummer:</strong><br><code>${txn.vertrag_nr}</code></div>
            <div><strong>Produkt:</strong><br>${txn.produkt} (${txn.produkt_typ})</div>
            <div><strong>Periode:</strong><br>${txn.periode}</div>
            <div><strong>Jahresbeitrag:</strong><br>${UTILS.formatCurrency(txn.jahresbeitrag)}</div>
            <div><strong>Provision:</strong><br>${UTILS.formatCurrency(txn.betrag)} (${txn.provision_prozent}%)</div>
            <div><strong>Erstellt am:</strong><br>${UTILS.formatDate(txn.erstellt_am, 'long')}</div>
            ${txn.ai_detected ? `
              <div style="grid-column: 1 / -1;">
                <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 1rem; border-radius: 8px; margin-top: 0.5rem;">
                  <strong>🤖 Von OpenAI GPT-4o erkannt</strong><br>
                  <div style="margin-top: 0.5rem; font-size: 0.9rem;">
                    Geflaggt am: ${UTILS.formatDate(txn.geflaggt_am, 'long')}<br>
                    ${txn.ai_confidence ? `Confidence: ${(txn.ai_confidence * 100).toFixed(0)}%` : ''}
                  </div>
                </div>
              </div>
            ` : ''}
            ${txn.ist_auffaellig ? `
              <div style="grid-column: 1 / -1;">
                <strong>Auffälligkeitsgrund:</strong><br>
                <div style="background: #FEF3C7; padding: 1rem; border-radius: 8px; margin-top: 0.5rem;">
                  ${txn.auffaelligkeits_grund}
                </div>
              </div>
            ` : ''}
            ${txn.bearbeiter ? `
              <div style="grid-column: 1 / -1;">
                <strong>Bearbeiter:</strong><br>
                <div style="background: #E0E7FF; padding: 1rem; border-radius: 8px; margin-top: 0.5rem;">
                  👤 ${txn.bearbeiter}
                  ${txn.status_geaendert_am ? `<br><small>Zuletzt geändert: ${UTILS.formatDate(txn.status_geaendert_am, 'long')}</small>` : ''}
                </div>
              </div>
            ` : ''}
            ${txn.kommentare && txn.kommentare.length > 0 ? `
              <div style="grid-column: 1 / -1;">
                <strong>Kommentare:</strong>
                <div style="margin-top: 0.5rem;">
                  ${txn.kommentare.map(k => `
                    <div style="background: #F3F4F6; padding: 1rem; border-radius: 8px; margin-bottom: 0.5rem; border-left: 4px solid #3B82F6;">
                      <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem;">
                        <strong>👤 ${k.bearbeiter}</strong>
                        <span style="font-size: 0.85rem; color: #666;">
                          ${UTILS.formatDate(k.timestamp, 'long')}
                        </span>
                      </div>
                      <div style="margin-bottom: 0.5rem;">
                        <span class="status-badge status-${k.status.toLowerCase()}">${k.status}</span>
                      </div>
                      <div>${k.kommentar || '<em>Kein Kommentar</em>'}</div>
                    </div>
                  `).join('')}
                </div>
              </div>
            ` : ''}
          </div>
        </div>
      `;

      modal.classList.add('active');
    } catch (error) {
      ui.showToast('Fehler beim Laden der Details: ' + error.message, 'error');
    }
  }

  /**
   * Behandelt Status-Änderungen in der Auffälligkeiten-Tabelle
   */
  async handleStatusChange(selectElement) {
    try {
      const transaktionId = selectElement.getAttribute('data-txn-id');
      const newStatus = selectElement.value;

      console.log(`🔄 Status-Änderung: ${transaktionId} → ${newStatus}`);

      // Öffne Kommentar-Modal
      const kommentar = await this._showStatusChangeModal(newStatus);

      // Wenn abgebrochen, setze Status zurück
      if (kommentar === null) {
        // Lade alte Transaktion und setze alten Status
        const all = await db.getAllTransaktionen();
        const txn = all.find(t => t.transaktion_id === transaktionId);
        if (txn && txn.status) {
          selectElement.value = txn.status;
        }
        return;
      }

      // Update dropdown color immediately for better UX
      const statusColors = {
        'NEW': { bg: '#FEF3C7', text: '#92400E' },
        'NEU': { bg: '#FEF3C7', text: '#92400E' },
        'IN_BEARBEITUNG': { bg: '#FEF3C7', text: '#92400E' },
        'GEPRÜFT': { bg: '#DBEAFE', text: '#1E40AF' },
        'GEFLAGGT': { bg: '#FEE2E2', text: '#991B1B' },
        'OK': { bg: '#D1FAE5', text: '#065F46' },
        'ARCHIVIERT': { bg: '#F3F4F6', text: '#6B7280' }
      };
      const statusColor = statusColors[newStatus] || statusColors['NEW'];
      selectElement.style.backgroundColor = statusColor.bg;
      selectElement.style.color = statusColor.text;

      // Lade Transaktion
      const all = await db.getAllTransaktionen();
      const txn = all.find(t => t.transaktion_id === transaktionId);
      if (!txn) {
        ui.showToast('Transaktion nicht gefunden', 'error');
        return;
      }

      // Aktualisiere Status und setze IMMER den Bearbeiter
      const bearbeiter = this._getSystemUser();
      txn.status = newStatus;
      txn.status_geaendert_am = new Date().toISOString();
      txn.bearbeiter = bearbeiter; // Immer setzen!

      // Füge Kommentar hinzu
      if (kommentar) {
        if (!txn.kommentare) {
          txn.kommentare = [];
        }
        txn.kommentare.push({
          bearbeiter: bearbeiter,
          kommentar: kommentar,
          status: newStatus,
          timestamp: new Date().toISOString()
        });
      }

      // Wenn "In Bearbeitung", setze zusätzlich Zeitstempel
      if (newStatus === 'IN_BEARBEITUNG') {
        txn.in_bearbeitung_seit = new Date().toISOString();
      }

      console.log(`👤 Bearbeiter gesetzt: ${bearbeiter}`);

      // Speichere aktualisierte Transaktion
      await db.updateTransaktion(txn);

      // Zeige Bestätigung
      ui.showToast(`Status geändert zu: ${newStatus}`, 'success');

      // Aktualisiere Tabelle
      await ui.updateTransactionsTable();

    } catch (error) {
      console.error('❌ Fehler beim Ändern des Status:', error);
      ui.showToast('Fehler beim Ändern des Status', 'error');
    }
  }

  /**
   * Zeigt Modal für Statusänderung mit Kommentarfeld
   */
  async _showStatusChangeModal(newStatus) {
    return new Promise((resolve) => {
      const modal = document.createElement('div');
      modal.className = 'modal';
      modal.style.display = 'flex';
      modal.innerHTML = `
        <div class="modal-content" style="max-width: 500px;">
          <div class="modal-header">
            <h2>Status ändern zu: ${this._getStatusLabel(newStatus)}</h2>
          </div>
          <div class="modal-body">
            <div class="form-group">
              <label for="status-kommentar">Kommentar (optional)</label>
              <textarea
                id="status-kommentar"
                class="input-field"
                rows="4"
                placeholder="Fügen Sie einen Kommentar zur Statusänderung hinzu..."></textarea>
            </div>
          </div>
          <div class="modal-footer">
            <button class="btn-secondary" id="cancel-status-change">Abbrechen</button>
            <button class="btn-primary" id="confirm-status-change">Bestätigen</button>
          </div>
        </div>
      `;

      document.body.appendChild(modal);

      const textarea = modal.querySelector('#status-kommentar');
      const cancelBtn = modal.querySelector('#cancel-status-change');
      const confirmBtn = modal.querySelector('#confirm-status-change');

      textarea.focus();

      cancelBtn.onclick = () => {
        document.body.removeChild(modal);
        resolve(null); // Abbruch
      };

      confirmBtn.onclick = () => {
        const kommentar = textarea.value.trim();
        document.body.removeChild(modal);
        resolve(kommentar || ''); // Leerer String wenn kein Kommentar
      };

      // ESC zum Abbrechen
      modal.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
          cancelBtn.click();
        }
      });
    });
  }

  /**
   * Gibt lesbare Status-Labels zurück
   */
  _getStatusLabel(status) {
    const labels = {
      'NEW': 'Neu',
      'NEU': 'Neu',
      'IN_BEARBEITUNG': 'In Bearbeitung',
      'GEPRÜFT': 'Geprüft',
      'GEFLAGGT': 'Geflaggt',
      'OK': 'OK',
      'ARCHIVIERT': 'Archiviert'
    };
    return labels[status] || status;
  }

  /**
   * Ermittelt den aktuellen System-User
   */
  _getSystemUser() {
    // Standardbearbeiter: Eike Brenneisen
    return 'Eike Brenneisen';
  }

  /**
   * Generiert Test-PDF mit 100 Transaktionen
   */
  async generateTestPDF() {
    try {
      ui.showToast('Generiere Test-PDF mit strukturierten Auffälligkeiten...', 'info');

      // Get all transactions
      const all = await db.getAllTransaktionen();
      if (all.length === 0) {
        ui.showToast('Keine Transaktionen vorhanden', 'warning');
        return;
      }

      // INTELLIGENT SELECTION: Bevorzuge auffällige Transaktionen
      const auffaellig = all.filter(t => t.ist_auffaellig);
      const normal = all.filter(t => !t.ist_auffaellig);

      console.log(`📊 Gefunden: ${auffaellig.length} auffällige, ${normal.length} normale Transaktionen`);

      let selected = [];

      // 1. Füge ALLE verfügbaren Auffälligkeiten hinzu (max 20)
      selected = selected.concat(auffaellig.slice(0, 20));

      // 2. Füge Transaktionen mit Compliance-Verstößen hinzu (Provision >70%)
      const complianceVerstoesse = normal.filter(t => t.provision_prozent > 70).slice(0, 5);
      selected = selected.concat(complianceVerstoesse);

      // 3. Füge überhöhte Provisionen hinzu (Top 10%)
      const sortedByProvision = [...normal].sort((a, b) => b.provision_prozent - a.provision_prozent);
      const ueberhoehteProvisionen = sortedByProvision.slice(0, 10);
      selected = selected.concat(ueberhoehteProvisionen);

      // 4. Füge Churning-Pattern hinzu: Finde Kunden mit mehreren Verträgen
      const kundenMap = {};
      normal.forEach(t => {
        if (!kundenMap[t.kunde]) kundenMap[t.kunde] = [];
        kundenMap[t.kunde].push(t);
      });
      const churningKunden = Object.entries(kundenMap)
        .filter(([kunde, txns]) => txns.length >= 3)
        .slice(0, 3); // Top 3 Churning-Kunden
      churningKunden.forEach(([kunde, txns]) => {
        selected = selected.concat(txns.slice(0, 3)); // 3 Verträge pro Kunde
      });

      // 5. Fülle auf 100 mit normalen Transaktionen auf
      const remaining = normal.filter(t => !selected.includes(t));
      const shuffled = remaining.sort(() => 0.5 - Math.random());
      selected = selected.concat(shuffled.slice(0, Math.max(0, 100 - selected.length)));

      // Begrenze auf 100
      selected = selected.slice(0, 100);

      console.log(`✅ ${selected.length} Transaktionen für PDF ausgewählt`);
      console.log(`   - Davon auffällig: ${selected.filter(t => t.ist_auffaellig).length}`);
      console.log(`   - Compliance >70%: ${selected.filter(t => t.provision_prozent > 70).length}`);

      // Get agency from first transaction
      const randomAgentur = selected[0].agentur_id;
      const agenturName = selected[0].agentur_name;

      // Create PDF using jsPDF
      const { jsPDF } = window.jspdf;
      const doc = new jsPDF();

      // ==========================================
      // REALISTISCHE PROVISIONSABRECHNUNG
      // ==========================================

      // Header
      doc.setFontSize(16);
      doc.setFont(undefined, 'bold');
      doc.text('ALPHA VERSICHERUNGEN AG', 105, 15, { align: 'center' });
      doc.setFontSize(14);
      doc.text('Provisionsabrechnung', 105, 23, { align: 'center' });

      doc.setFont(undefined, 'normal');
      doc.setFontSize(10);
      doc.line(20, 28, 190, 28);

      // Agentur-Info
      let y = 35;
      doc.setFontSize(11);
      doc.setFont(undefined, 'bold');
      doc.text('Agentur:', 20, y);
      doc.setFont(undefined, 'normal');
      doc.text(`${agenturName}`, 50, y);
      y += 6;
      doc.setFont(undefined, 'bold');
      doc.text('Agentur-Nr:', 20, y);
      doc.setFont(undefined, 'normal');
      doc.text(`${randomAgentur}`, 50, y);
      y += 6;
      doc.setFont(undefined, 'bold');
      doc.text('Periode:', 20, y);
      doc.setFont(undefined, 'normal');
      doc.text(`${selected[0].periode}`, 50, y);
      y += 6;
      doc.setFont(undefined, 'bold');
      doc.text('Abrechnungsdatum:', 20, y);
      doc.setFont(undefined, 'normal');
      doc.text(new Date().toLocaleDateString('de-DE'), 50, y);

      y += 10;
      doc.line(20, y, 190, y);
      y += 8;

      // Table Header
      doc.setFontSize(8);
      doc.setFont(undefined, 'bold');
      doc.text('Vertrags-Nr', 20, y);
      doc.text('Kunde', 50, y);
      doc.text('Produkt', 85, y);
      doc.text('Jahresbeitrag', 110, y, { align: 'right' });
      doc.text('Prov.%', 130, y, { align: 'right' });
      doc.text('Provision €', 160, y, { align: 'right' });
      doc.text('Abschluss', 185, y, { align: 'right' });

      y += 2;
      doc.line(20, y, 190, y);
      y += 5;

      // Table Rows
      doc.setFont(undefined, 'normal');
      doc.setFontSize(7);

      const totalProvision = selected.reduce((sum, t) => sum + t.betrag, 0);

      selected.forEach((txn, index) => {
        if (y > 270) {
          doc.addPage();
          y = 20;

          // Repeat header on new page
          doc.setFontSize(8);
          doc.setFont(undefined, 'bold');
          doc.text('Vertrags-Nr', 20, y);
          doc.text('Kunde', 50, y);
          doc.text('Produkt', 85, y);
          doc.text('Jahresbeitrag', 110, y, { align: 'right' });
          doc.text('Prov.%', 130, y, { align: 'right' });
          doc.text('Provision €', 160, y, { align: 'right' });
          doc.text('Abschluss', 185, y, { align: 'right' });
          y += 2;
          doc.line(20, y, 190, y);
          y += 5;
          doc.setFont(undefined, 'normal');
          doc.setFontSize(7);
        }

        // Generate realistic VSNR with product prefix
        const vsnr = `${txn.produkt_typ}-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 10000)).padStart(4, '0')}`;

        doc.text(vsnr, 20, y);
        doc.text(txn.kunde.substring(0, 18), 50, y);
        doc.text(txn.produkt_typ, 85, y);
        doc.text(UTILS.formatCurrency(txn.jahresbeitrag), 110, y, { align: 'right' });
        doc.text(`${txn.provision_prozent.toFixed(2)}%`, 130, y, { align: 'right' });
        doc.text(UTILS.formatCurrency(txn.betrag), 160, y, { align: 'right' });
        doc.text(new Date(txn.erstellt_am).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: '2-digit' }), 185, y, { align: 'right' });

        y += 4;
      });

      // Summary section
      y += 5;
      doc.line(20, y, 190, y);
      y += 6;

      doc.setFontSize(9);
      doc.setFont(undefined, 'bold');
      doc.text('Gesamtsumme:', 130, y);
      doc.text(UTILS.formatCurrency(totalProvision), 160, y, { align: 'right' });

      y += 8;
      doc.setFontSize(8);
      doc.setFont(undefined, 'normal');
      doc.text(`Anzahl Verträge: ${selected.length}`, 20, y);

      const avgProvision = selected.length > 0 ? (selected.reduce((sum, t) => sum + t.provision_prozent, 0) / selected.length).toFixed(2) : 0;
      doc.text(`Durchschnittliche Provision: ${avgProvision}%`, 20, y + 5);

      // Download PDF
      const fileName = `Abrechnung_${randomAgentur}_${selected[0].periode}_${Date.now()}.pdf`;
      doc.save(fileName);

      ui.showToast(`PDF generiert: ${fileName}`, 'success');

    } catch (error) {
      console.error('Fehler beim Generieren des PDFs:', error);
      ui.showToast('Fehler beim Generieren des PDFs: ' + error.message, 'error');
    }
  }

  /**
   * Lädt Demo-Daten neu
   */
  async reloadDemoData() {
    if (!confirm('ACHTUNG: Alle vorhandenen Daten werden gelöscht und neu generiert!\n\nFortfahren?')) {
      return;
    }

    try {
      console.log('🔄 Starte Neuladen der Demo-Daten...');
      ui.showToast('Lösche alte Daten...', 'info');

      // Lösche ALLE Daten (Transaktionen UND Abrechnungen)
      await db.clearAllData();
      console.log('✓ Alle Daten gelöscht');

      ui.showToast('Generiere neue Demo-Daten...', 'info');
      console.log('Rufe generateAllData auf...');
      const result = await massDataGenerator.generateAllData();
      console.log('Ergebnis:', result);

      ui.showToast(`${UTILS.formatNumber(result.transaktionen)} neue Transaktionen generiert!`, 'success');

      console.log('Aktualisiere UI...');
      await ui.updateKPIDashboard();
      await ui.updateTransactionsTable();
      console.log('✓ UI aktualisiert');

    } catch (error) {
      console.error('❌ Fehler beim Neuladen:', error);
      ui.showToast('Fehler beim Neuladen: ' + error.message, 'error');
    }
  }

  /**
   * Lädt Settings aus localStorage
   */
  loadSettings() {
    const settingsJson = localStorage.getItem('alpha_settings');
    if (settingsJson) {
      try {
        const settings = JSON.parse(settingsJson);

        // Load anomaly filters
        if (settings.anomalyFilters) {
          document.querySelectorAll('.anomaly-filter').forEach(cb => {
            const category = cb.getAttribute('data-category');
            cb.checked = settings.anomalyFilters[category] !== false; // Default: true
          });
        }
      } catch (error) {
        console.error('Fehler beim Laden der Settings:', error);
      }
    }
  }

  /**
   * Speichert Settings in localStorage
   */
  saveSettings() {
    try {
      const settings = {
        anomalyFilters: {}
      };

      // Save anomaly filter states
      document.querySelectorAll('.anomaly-filter').forEach(cb => {
        const category = cb.getAttribute('data-category');
        settings.anomalyFilters[category] = cb.checked;
      });

      localStorage.setItem('alpha_settings', JSON.stringify(settings));
      ui.showToast('Einstellungen gespeichert', 'success');

      // Reload transactions table to apply filters
      ui.updateTransactionsTable();
    } catch (error) {
      console.error('Fehler beim Speichern der Settings:', error);
      ui.showToast('Fehler beim Speichern: ' + error.message, 'error');
    }
  }

  /**
   * Gibt die aktivierten Anomalie-Filter zurück
   */
  getEnabledAnomalyFilters() {
    const settingsJson = localStorage.getItem('alpha_settings');
    if (settingsJson) {
      try {
        const settings = JSON.parse(settingsJson);
        if (settings.anomalyFilters) {
          return Object.keys(settings.anomalyFilters).filter(key => settings.anomalyFilters[key]);
        }
      } catch (error) {
        console.error('Fehler beim Laden der Filter:', error);
      }
    }
    // Default: Nur ausgewählte Filter aktiviert (ohne: UEBERHÖHTE_PROVISION, HOHER_JAHRESBEITRAG, ZEITLICHE_AUFFÄLLIGKEIT, PRODUKTKOMBINATION, SYSTEMATISCH)
    return ['STORNO_NEUABSCHLUSS', 'AUFFÄLLIGE_PROVISIONSHÖHE', 'DUPLIKAT_KUNDE', 'COMPLIANCE_LIMIT', 'STORNOQUOTE_ERHÖHT', 'CHURNING_VERDACHT', 'SUPERPROVISION'];
  }

  /**
   * Exportiert Transaktionen als Excel
   */
  async exportTransactions() {
    try {
      const transactions = await db.getAuffaelligeTransaktionen();
      if (transactions.length === 0) {
        ui.showToast('Keine Transaktionen zum Exportieren', 'warning');
        return;
      }

      // Prepare data for Excel
      const exportData = transactions.map(t => ({
        'Status': t.status,
        'TXN-ID': t.transaktion_id,
        'Agentur-ID': t.agentur_id,
        'Agentur': t.agentur_name,
        'Kunde': t.kunde,
        'Vertragsnummer': t.vertrag_nr,
        'Produkt-Typ': t.produkt_typ,
        'Produkt': t.produkt,
        'Jahresbeitrag': t.jahresbeitrag,
        'Provision %': UTILS.formatProvision(t),
        'Provisionsbetrag': t.betrag,
        'Periode': t.periode,
        'Auffälligkeitsgrund': t.auffaelligkeits_grund || '',
        'Erstellt am': t.erstellt_am
      }));

      // Create Excel file
      const ws = XLSX.utils.json_to_sheet(exportData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Auffälligkeiten');

      // Download
      const fileName = `Auffaelligkeiten_Export_${new Date().toISOString().split('T')[0]}.xlsx`;
      XLSX.writeFile(wb, fileName);

      ui.showToast(`Export erstellt: ${fileName}`, 'success');

    } catch (error) {
      ui.showToast('Fehler beim Export: ' + error.message, 'error');
    }
  }
}

// Initialisiere App
const app = new App();

// Mache app global verfügbar für onclick-Handler
window.app = app;

// Start bei DOM-Ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => app.init());
} else {
  app.init();
}
