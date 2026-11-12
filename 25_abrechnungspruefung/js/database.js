/**
 * Alpha Provisionsanalyse-System - Database Manager
 * ==================================================
 * IndexedDB Manager für lokale Datenpersistenz
 */

class DatabaseManager {
  constructor() {
    this.db = null;
    this.dbName = CONFIG.DATABASE.NAME;
    this.dbVersion = CONFIG.DATABASE.VERSION;
    this.isInitializing = false;
  }

  /**
   * Stellt sicher, dass die DB-Verbindung gültig ist
   */
  async ensureConnection() {
    // Prüfe ob DB-Verbindung existiert und nicht geschlossen ist
    if (this.db && this.db.name) {
      try {
        // Teste die Verbindung mit einer einfachen Transaktion
        const test = this.db.transaction(['transaktionen'], 'readonly');
        return true;
      } catch (error) {
        console.warn('DB-Verbindung ungültig, öffne neu...', error);
        this.db = null;
      }
    }

    // Verbindung neu öffnen
    if (!this.db && !this.isInitializing) {
      console.log('Öffne DB-Verbindung neu...');
      await this.init();
    }

    return !!this.db;
  }

  /**
   * Initialisiert die Datenbank
   */
  async init(retryCount = 0) {
    console.log(`🔵 db.init() gestartet... (Versuch ${retryCount + 1})`);
    this.isInitializing = true;

    // Wenn dies ein Retry ist, lösche die alte DB zuerst
    if (retryCount > 0) {
      console.log('🗑️ Lösche alte Datenbank...');
      await new Promise((resolve) => {
        const deleteReq = indexedDB.deleteDatabase(this.dbName);
        deleteReq.onsuccess = () => {
          console.log('✅ Alte Datenbank gelöscht');
          resolve();
        };
        deleteReq.onerror = () => {
          console.warn('⚠️ Fehler beim Löschen der alten DB, fahre fort...');
          resolve();
        };
        // Fallback falls kein Event kommt
        setTimeout(resolve, 2000);
      });
    }

    return new Promise((resolve, reject) => {
      // Timeout nach 15 Sekunden
      const timeout = setTimeout(async () => {
        console.error('❌ DB init Timeout nach 15 Sekunden!');

        // Beim ersten Versuch: Automatisch retry mit DB-Löschung
        if (retryCount === 0) {
          console.log('🔄 Versuche erneut mit DB-Löschung...');
          try {
            const result = await this.init(1);
            resolve(result);
          } catch (error) {
            reject(error);
          }
        } else {
          console.error('Die Datenbank-Initialisierung schlug auch nach Retry fehl.');
          reject(new Error('Database initialization timeout'));
        }
      }, 15000);

      console.log('🔵 Öffne IndexedDB:', this.dbName, 'Version:', this.dbVersion);
      const request = indexedDB.open(this.dbName, this.dbVersion);

      request.onerror = () => {
        clearTimeout(timeout);
        this.isInitializing = false;
        console.error('❌ Fehler beim Öffnen der Datenbank:', request.error);
        reject(request.error);
      };

      request.onblocked = () => {
        clearTimeout(timeout);
        this.isInitializing = false;
        console.error('⚠️ Datenbank wird von anderem Tab blockiert!');
        console.error('Bitte schließen Sie alle anderen Tabs dieser App und laden Sie die Seite neu.');
        alert('⚠️ Datenbank-Upgrade blockiert!\n\nBitte schließen Sie alle anderen Tabs dieser Seite und laden Sie neu.\n\nOder öffnen Sie die Browser DevTools (F12) → Application → IndexedDB → Rechtsklick auf "AlphaProvisionsDB" → Delete Database');
        reject(new Error('Database blocked by other tab'));
      };

      request.onsuccess = () => {
        clearTimeout(timeout);
        this.isInitializing = false;
        this.db = request.result;
        console.log('✅ Datenbank erfolgreich initialisiert');
        resolve(this.db);
      };

      request.onupgradeneeded = (event) => {
        console.log('🔵 onupgradeneeded Event gefeuert');
        const db = event.target.result;
        const oldVersion = event.oldVersion;
        const newVersion = event.newVersion;
        console.log(`🔄 Datenbank wird aktualisiert von Version ${oldVersion} auf ${newVersion}...`);

        try {
          // Store: abrechnungen
          if (!db.objectStoreNames.contains('abrechnungen')) {
            console.log('🔵 Erstelle Store: abrechnungen');
            const abrechnungenStore = db.createObjectStore('abrechnungen', {
              keyPath: 'id',
              autoIncrement: true
            });

            // Basis-Indizes (Version 1)
            abrechnungenStore.createIndex('agentur_id', 'agentur_id', { unique: false });
            abrechnungenStore.createIndex('periode', 'periode', { unique: false });
            abrechnungenStore.createIndex('upload_datum', 'upload_datum', { unique: false });
            abrechnungenStore.createIndex('agentur_periode', ['agentur_id', 'periode'], { unique: false });
            abrechnungenStore.createIndex('risiko_score', 'ki_analyse.risiko_score', { unique: false });

            console.log('✅ Store "abrechnungen" erstellt');
          }

          // Version 2: Hierarchie-Support
          if (oldVersion < 2 && db.objectStoreNames.contains('abrechnungen')) {
            console.log('🔵 Füge Version 2 Hierarchie-Indizes hinzu...');
            const transaction = event.target.transaction;
            const abrechnungenStore = transaction.objectStore('abrechnungen');

            // Neue Indizes für Hierarchien
            if (!abrechnungenStore.indexNames.contains('vermittler_nummer')) {
              abrechnungenStore.createIndex('vermittler_nummer', 'vermittler_nummer', { unique: false });
            }
            if (!abrechnungenStore.indexNames.contains('vorgesetzter')) {
              abrechnungenStore.createIndex('vorgesetzter', 'extracted_data.vorgesetzter', { unique: false });
            }
            if (!abrechnungenStore.indexNames.contains('vermittler_periode')) {
              abrechnungenStore.createIndex('vermittler_periode', ['vermittler_nummer', 'periode'], { unique: false });
            }
            if (!abrechnungenStore.indexNames.contains('demo_mode')) {
              abrechnungenStore.createIndex('demo_mode', 'metadaten.demo_mode', { unique: false });
            }
            if (!abrechnungenStore.indexNames.contains('scenario_key')) {
              abrechnungenStore.createIndex('scenario_key', 'metadaten.scenario_key', { unique: false });
            }

            console.log('✅ Version 2: Hierarchie-Indizes hinzugefügt');
          }

          // Store: agenturen (für aggregierte Daten)
          if (!db.objectStoreNames.contains('agenturen')) {
            console.log('🔵 Erstelle Store: agenturen');
            const agenturenStore = db.createObjectStore('agenturen', {
              keyPath: 'agentur_id'
            });

            agenturenStore.createIndex('name', 'name', { unique: false });
            agenturenStore.createIndex('letzter_upload', 'letzter_upload', { unique: false });

            console.log('✅ Store "agenturen" erstellt');
          }

          // Version 3: Transaktionen-Support
          if (oldVersion < 3) {
            console.log('🔵 Füge Version 3 Transaktionen-Store hinzu...');
            if (!db.objectStoreNames.contains('transaktionen')) {
              const transaktionenStore = db.createObjectStore('transaktionen', {
                keyPath: 'id',
                autoIncrement: true
              });

              // Indizes für Transaktionen
              transaktionenStore.createIndex('transaktion_id', 'transaktion_id', { unique: true });
              transaktionenStore.createIndex('agentur_id', 'agentur_id', { unique: false });
              transaktionenStore.createIndex('abrechnung_id', 'abrechnung_id', { unique: false });
              transaktionenStore.createIndex('periode', 'periode', { unique: false });
              transaktionenStore.createIndex('ist_auffaellig', 'ist_auffaellig', { unique: false });
              transaktionenStore.createIndex('status', 'status', { unique: false });
              transaktionenStore.createIndex('agentur_periode', ['agentur_id', 'periode'], { unique: false });

              console.log('✅ Store "transaktionen" erstellt (Version 3)');
            }
          }

          console.log('✅ onupgradeneeded abgeschlossen');
        } catch (error) {
          clearTimeout(timeout);
          console.error('❌ Fehler in onupgradeneeded:', error);
          reject(error);
        }
      };
    });
  }

  /**
   * Speichert eine Abrechnung
   */
  async saveAbrechnung(data) {
    if (!this.db) {
      throw new Error('Datenbank nicht initialisiert');
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['abrechnungen'], 'readwrite');
      const store = transaction.objectStore('abrechnungen');

      // Füge Timestamp hinzu falls nicht vorhanden
      if (!data.upload_datum) {
        data.upload_datum = new Date().toISOString();
      }

      const request = store.add(data);

      request.onsuccess = () => {
        console.log('Abrechnung gespeichert mit ID:', request.result);
        resolve(request.result);
      };

      request.onerror = () => {
        console.error('Fehler beim Speichern der Abrechnung:', request.error);
        reject(request.error);
      };
    });
  }

  /**
   * Aktualisiert eine bestehende Abrechnung
   */
  async updateAbrechnung(data) {
    if (!this.db) {
      throw new Error('Datenbank nicht initialisiert');
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['abrechnungen'], 'readwrite');
      const store = transaction.objectStore('abrechnungen');

      const request = store.put(data);

      request.onsuccess = () => {
        console.log('Abrechnung aktualisiert:', data.id);
        resolve(request.result);
      };

      request.onerror = () => {
        console.error('Fehler beim Aktualisieren der Abrechnung:', request.error);
        reject(request.error);
      };
    });
  }

  /**
   * Holt historische Abrechnungen für eine Agentur
   */
  async getHistorieByAgentur(agenturId, limit = CONFIG.ANALYSIS.HISTORICAL_MONTHS) {
    if (!this.db) {
      throw new Error('Datenbank nicht initialisiert');
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['abrechnungen'], 'readonly');
      const store = transaction.objectStore('abrechnungen');
      const index = store.index('agentur_id');

      const request = index.getAll(agenturId);

      request.onsuccess = () => {
        const results = request.result
          .sort((a, b) => new Date(b.periode) - new Date(a.periode))
          .slice(0, limit);

        console.log(`${results.length} historische Einträge für Agentur ${agenturId} geladen`);
        resolve(results);
      };

      request.onerror = () => {
        console.error('Fehler beim Laden der Historie:', request.error);
        reject(request.error);
      };
    });
  }

  /**
   * Holt eine einzelne Abrechnung per ID
   */
  async getAbrechnungById(id) {
    if (!this.db) {
      throw new Error('Datenbank nicht initialisiert');
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['abrechnungen'], 'readonly');
      const store = transaction.objectStore('abrechnungen');
      const request = store.get(id);

      request.onsuccess = () => {
        resolve(request.result);
      };

      request.onerror = () => {
        reject(request.error);
      };
    });
  }

  /**
   * Holt alle Abrechnungen
   */
  async getAllAbrechnungen() {
    if (!this.db) {
      throw new Error('Datenbank nicht initialisiert');
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['abrechnungen'], 'readonly');
      const store = transaction.objectStore('abrechnungen');
      const request = store.getAll();

      request.onsuccess = () => {
        console.log(`${request.result.length} Abrechnungen geladen`);
        resolve(request.result);
      };

      request.onerror = () => {
        console.error('Fehler beim Laden aller Abrechnungen:', request.error);
        reject(request.error);
      };
    });
  }

  /**
   * Holt Abrechnungen mit Filter
   */
  async getAbrechnungenFiltered(filters = {}) {
    const allAbrechnungen = await this.getAllAbrechnungen();

    return allAbrechnungen.filter(abr => {
      // Always skip demo data without AI analysis
      if (!abr.ki_analyse) return false;

      // Filter nach Risiko
      if (filters.risk && filters.risk !== 'all') {
        const category = UTILS.getRiskCategory(abr.ki_analyse.risiko_score);
        if (category !== filters.risk) return false;
      }

      // Filter nach Periode
      if (filters.period && filters.period !== 'all') {
        const abrDate = new Date(abr.periode);
        const now = new Date();

        if (filters.period === 'current-month') {
          if (abrDate.getMonth() !== now.getMonth() ||
              abrDate.getFullYear() !== now.getFullYear()) {
            return false;
          }
        } else if (filters.period === 'last-3-months') {
          const threeMonthsAgo = new Date(now.setMonth(now.getMonth() - 3));
          if (abrDate < threeMonthsAgo) return false;
        } else if (filters.period === 'last-6-months') {
          const sixMonthsAgo = new Date(now.setMonth(now.getMonth() - 6));
          if (abrDate < sixMonthsAgo) return false;
        } else if (filters.period === 'current-year') {
          if (abrDate.getFullYear() !== now.getFullYear()) return false;
        }
      }

      // Filter nach Suchtext
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        const matches =
          abr.agentur_id.toLowerCase().includes(searchLower) ||
          abr.agentur_name.toLowerCase().includes(searchLower);
        if (!matches) return false;
      }

      return true;
    });
  }

  /**
   * Holt aggregierte Agenturen-Daten
   */
  async getAllAgenturen() {
    const abrechnungen = await this.getAllAbrechnungen();
    const transaktionen = await this.getAllTransaktionen();
    const agenturen = {};

    abrechnungen.forEach(abr => {
      if (!agenturen[abr.agentur_id]) {
        agenturen[abr.agentur_id] = {
          agentur_id: abr.agentur_id,
          agentur_name: abr.agentur_name,
          anzahl_abrechnungen: 0,
          letzter_upload: abr.upload_datum,
          letzte_periode: abr.periode,
          durchschnitt_risiko: 0,
          gesamt_risiko: 0,
          auffaelligkeiten_gesamt: 0,
          hoechster_risiko_score: 0,
          anzahl_mit_ki_analyse: 0, // NEU: Zähle nur Abrechnungen mit KI-Analyse
        };
      }

      const ag = agenturen[abr.agentur_id];
      ag.anzahl_abrechnungen++;

      // Add null check for ki_analyse (demo data may not have AI analysis)
      if (abr.ki_analyse) {
        ag.anzahl_mit_ki_analyse++;
        ag.gesamt_risiko += abr.ki_analyse.risiko_score;
        ag.auffaelligkeiten_gesamt += abr.ki_analyse.auffaelligkeiten.length;

        if (abr.ki_analyse.risiko_score > ag.hoechster_risiko_score) {
          ag.hoechster_risiko_score = abr.ki_analyse.risiko_score;
        }
      }

      if (new Date(abr.upload_datum) > new Date(ag.letzter_upload)) {
        ag.letzter_upload = abr.upload_datum;
        ag.letzte_periode = abr.periode;
      }
    });

    // Berechne Durchschnitte
    Object.values(agenturen).forEach(ag => {
      // Wenn es echte KI-Analysen gibt, nutze diese
      if (ag.anzahl_mit_ki_analyse > 0) {
        ag.durchschnitt_risiko = (ag.gesamt_risiko / ag.anzahl_mit_ki_analyse).toFixed(1);
      } else {
        // Fallback für Demo-Daten: Berechne OK-Rate basierend auf Transaktionen
        const agenturTxns = transaktionen.filter(t => t.agentur_id === ag.agentur_id);
        const auffaelligeTxns = agenturTxns.filter(t => t.ist_auffaellig);

        if (agenturTxns.length > 0) {
          // OK-Rate: Anteil der NICHT-geflaggten Transaktionen in %
          const okRate = ((agenturTxns.length - auffaelligeTxns.length) / agenturTxns.length) * 100;
          ag.durchschnitt_risiko = okRate.toFixed(1);
          ag.auffaelligkeiten_gesamt = auffaelligeTxns.length;
        } else {
          ag.durchschnitt_risiko = '0.0';
        }
      }

      // Kategorisierung basierend auf OK-Rate (höher = besser)
      const okRate = parseFloat(ag.durchschnitt_risiko);
      if (okRate >= 95) {
        ag.risiko_kategorie = 'gruen'; // >= 95% OK = sehr gut
      } else if (okRate >= 90) {
        ag.risiko_kategorie = 'gelb';  // 90-95% OK = gut
      } else if (okRate >= 85) {
        ag.risiko_kategorie = 'orange'; // 85-90% OK = mittel
      } else {
        ag.risiko_kategorie = 'rot';    // < 85% OK = kritisch
      }
    });

    return Object.values(agenturen);
  }

  /**
   * Aktualisiert Agentur-Statistiken
   */
  async updateAgenturStats(agenturId) {
    // Wird automatisch bei getAllAgenturen() berechnet
    // Placeholder für zukünftige Optimierungen
  }

  /**
   * Löscht eine Abrechnung
   */
  async deleteAbrechnung(id) {
    if (!this.db) {
      throw new Error('Datenbank nicht initialisiert');
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['abrechnungen'], 'readwrite');
      const store = transaction.objectStore('abrechnungen');
      const request = store.delete(id);

      request.onsuccess = () => {
        console.log('Abrechnung gelöscht:', id);
        resolve();
      };

      request.onerror = () => {
        console.error('Fehler beim Löschen der Abrechnung:', request.error);
        reject(request.error);
      };
    });
  }

  /**
   * Löscht alle Daten
   */
  async clearAllData() {
    if (!this.db) {
      throw new Error('Datenbank nicht initialisiert');
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['abrechnungen', 'agenturen', 'transaktionen'], 'readwrite');

      const abrechnungenStore = transaction.objectStore('abrechnungen');
      const agenturenStore = transaction.objectStore('agenturen');
      const transaktionenStore = transaction.objectStore('transaktionen');

      const clearAbr = abrechnungenStore.clear();
      const clearAg = agenturenStore.clear();
      const clearTxn = transaktionenStore.clear();

      transaction.oncomplete = () => {
        console.log('Alle Daten gelöscht (Abrechnungen, Agenturen, Transaktionen)');
        resolve();
      };

      transaction.onerror = () => {
        console.error('Fehler beim Löschen der Daten:', transaction.error);
        reject(transaction.error);
      };
    });
  }

  /**
   * Exportiert alle Daten als JSON
   */
  async exportDatabase() {
    const abrechnungen = await this.getAllAbrechnungen();
    return {
      version: this.dbVersion,
      exportDate: new Date().toISOString(),
      count: abrechnungen.length,
      data: abrechnungen,
    };
  }

  /**
   * Importiert Daten aus JSON
   */
  async importDatabase(jsonData) {
    if (!jsonData.data || !Array.isArray(jsonData.data)) {
      throw new Error('Ungültiges Datenformat');
    }

    let importCount = 0;
    const errors = [];

    for (const item of jsonData.data) {
      try {
        // Entferne ID, um neue ID zu generieren
        const itemCopy = { ...item };
        delete itemCopy.id;

        await this.saveAbrechnung(itemCopy);
        importCount++;
      } catch (error) {
        errors.push({
          item: item.agentur_id,
          error: error.message,
        });
      }
    }

    console.log(`Import abgeschlossen: ${importCount} Einträge importiert, ${errors.length} Fehler`);

    return {
      success: importCount,
      errors: errors,
      total: jsonData.data.length,
    };
  }

  /**
   * Zählt Abrechnungen nach Risiko-Kategorie
   */
  async getCountByRisk() {
    const abrechnungen = await this.getAllAbrechnungen();

    const counts = {
      gruen: 0,
      gelb: 0,
      orange: 0,
      rot: 0,
    };

    abrechnungen.forEach(abr => {
      // Skip demo data without AI analysis
      if (abr.ki_analyse) {
        const category = UTILS.getRiskCategory(abr.ki_analyse.risiko_score);
        counts[category]++;
      }
    });

    return counts;
  }

  /**
   * Holt Statistiken für Dashboard
   */
  async getDashboardStats() {
    const abrechnungen = await this.getAllAbrechnungen();
    const agenturen = await this.getAllAgenturen();
    const riskCounts = await this.getCountByRisk();

    // Zähle Auffälligkeiten
    let totalAuffaelligkeiten = 0;
    const auffaelligkeitenByKategorie = {};

    abrechnungen.forEach(abr => {
      // Skip demo data without AI analysis
      if (abr.ki_analyse) {
        totalAuffaelligkeiten += abr.ki_analyse.auffaelligkeiten.length;

        abr.ki_analyse.auffaelligkeiten.forEach(auff => {
          if (!auffaelligkeitenByKategorie[auff.kategorie]) {
            auffaelligkeitenByKategorie[auff.kategorie] = 0;
          }
          auffaelligkeitenByKategorie[auff.kategorie]++;
        });
      }
    });

    return {
      totalAbrechnungen: abrechnungen.length,
      totalAgenturen: agenturen.length,
      totalAuffaelligkeiten: totalAuffaelligkeiten,
      riskCounts: riskCounts,
      auffaelligkeitenByKategorie: auffaelligkeitenByKategorie,
      letzteAnalyse: abrechnungen.length > 0
        ? abrechnungen.sort((a, b) => new Date(b.upload_datum) - new Date(a.upload_datum))[0].upload_datum
        : null,
    };
  }

  /**
   * ==============================================
   * NEUE METHODEN FÜR HIERARCHIE-SUPPORT (V2)
   * ==============================================
   */

  /**
   * Holt Abrechnungen für einen spezifischen Vermittler
   */
  async getAbrechnungenByVermittler(vermittlerNummer, periode = null) {
    if (!this.db) {
      throw new Error('Datenbank nicht initialisiert');
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['abrechnungen'], 'readonly');
      const store = transaction.objectStore('abrechnungen');

      let request;
      if (periode) {
        // Suche nach Vermittler + Periode
        const index = store.index('vermittler_periode');
        request = index.getAll([vermittlerNummer, periode]);
      } else {
        // Suche nach Vermittler (alle Perioden)
        const index = store.index('vermittler_nummer');
        request = index.getAll(vermittlerNummer);
      }

      request.onsuccess = () => {
        console.log(`${request.result.length} Abrechnungen für Vermittler ${vermittlerNummer} gefunden`);
        resolve(request.result);
      };

      request.onerror = () => {
        reject(request.error);
      };
    });
  }

  /**
   * Holt alle Abrechnungen von Untervermittlern eines Vorgesetzten
   */
  async getUntervermittlerAbrechnungen(vorgesetzterNummer, periode = null) {
    // Hole Untervermittler aus hierarchieManager
    const untervermittler = hierarchieManager.getUntervermittler(vorgesetzterNummer);

    const abrechnungen = [];
    for (const uv of untervermittler) {
      const uvAbrechnungen = await this.getAbrechnungenByVermittler(uv.nummer, periode);
      abrechnungen.push(...uvAbrechnungen);
    }

    return abrechnungen;
  }

  /**
   * Findet verwandte Abrechnungen (Vorgesetzter + Untervermittler) für Cross-Analyse
   */
  async findRelatedAbrechnungen(vermittlerNummer, periode) {
    const results = {
      vermittler: null,
      vorgesetzter: null,
      untervermittler: [],
      hierarchie: null
    };

    // Hole Vermittler-Abrechnung
    const vermittlerAbrechnungen = await this.getAbrechnungenByVermittler(vermittlerNummer, periode);
    if (vermittlerAbrechnungen.length > 0) {
      results.vermittler = vermittlerAbrechnungen[0];
    }

    // Hole Hierarchie-Info
    results.hierarchie = hierarchieManager.getVermittlerInfo(vermittlerNummer);

    // Hat der Vermittler einen Vorgesetzten?
    if (hierarchieManager.hatVorgesetzten(vermittlerNummer)) {
      const vorgesetzterInfo = hierarchieManager.getVorgesetzter(vermittlerNummer);
      if (vorgesetzterInfo) {
        // Suche Vorgesetzten-Abrechnung mit Vermittler-Nummer aus hierarchieManager
        const vorgesetzterNummer = results.hierarchie.vorgesetzter;
        const vorgesetzterAbrechnungen = await this.getAbrechnungenByVermittler(vorgesetzterNummer, periode);
        if (vorgesetzterAbrechnungen.length > 0) {
          results.vorgesetzter = vorgesetzterAbrechnungen[0];
        }
      }
    }

    // Ist der Vermittler ein Vorgesetzter mit Untervermittlern?
    const untervermittler = hierarchieManager.getUntervermittler(vermittlerNummer);
    if (untervermittler.length > 0) {
      for (const uv of untervermittler) {
        const uvAbrechnungen = await this.getAbrechnungenByVermittler(uv.nummer, periode);
        if (uvAbrechnungen.length > 0) {
          results.untervermittler.push(...uvAbrechnungen);
        }
      }
    }

    return results;
  }

  /**
   * Holt kombinierte Analysen (aus hierarchical_scenarios)
   */
  async getCombinedAnalyses() {
    const allAbrechnungen = await this.getAllAbrechnungen();
    return allAbrechnungen.filter(abr =>
      abr.metadaten &&
      abr.metadaten.is_combined_analysis === true
    );
  }

  /**
   * Holt Abrechnungen nach Szenario-Key (für Demo-Mode)
   */
  async getAbrechnungenByScenario(scenarioKey) {
    const allAbrechnungen = await this.getAllAbrechnungen();
    return allAbrechnungen.filter(abr =>
      abr.metadaten &&
      abr.metadaten.scenario_key === scenarioKey
    );
  }

  /**
   * Prüft auf Superprovisions-Compliance-Verstöße
   * Kombiniert Vermittler- und Vorgesetzten-Abrechnungen
   */
  async analyzeSuperProvisionCompliance(periode) {
    const allAbrechnungen = await this.getAllAbrechnungen();
    const periodeAbrechnungen = allAbrechnungen.filter(abr => abr.periode === periode);

    const violations = [];

    for (const abr of periodeAbrechnungen) {
      if (!abr.vermittler_nummer) continue;

      // Suche verwandte Abrechnungen
      const related = await this.findRelatedAbrechnungen(abr.vermittler_nummer, periode);

      // Wenn sowohl Vermittler als auch Vorgesetzter vorhanden
      if (related.vermittler && related.vorgesetzter) {
        // Extrahiere Verträge
        const vermittlerVertraege = related.vermittler.extracted_data?.vertraege || [];
        const superprovisionen = related.vorgesetzter.extracted_data?.superprovisionen || [];

        // Finde Überlappungen
        if (vermittlerVertraege.length > 0 && superprovisionen.length > 0) {
          const ueberlappung = hierarchieManager.findeUeberlappung(vermittlerVertraege, superprovisionen);

          // Prüfe Compliance für jede Überlappung
          const verstoesse = hierarchieManager.pruefeAlleComplianceVerstoesse(ueberlappung);

          if (verstoesse.length > 0) {
            violations.push({
              vermittler: related.vermittler,
              vorgesetzter: related.vorgesetzter,
              verstoesse: verstoesse
            });
          }
        }
      }
    }

    return violations;
  }

  /**
   * Generiert Hierarchie-Übersicht für Dashboard
   */
  async getHierarchieStatistik() {
    const allAbrechnungen = await this.getAllAbrechnungen();

    const stats = {
      vermittler_mit_vorgesetzten: 0,
      vorgesetzte_mit_untervermittlern: 0,
      superprovisions_abrechnungen: 0,
      hierarchische_abrechnungen: allAbrechnungen.filter(abr => abr.vermittler_nummer).length,
      kombinierte_analysen: 0
    };

    allAbrechnungen.forEach(abr => {
      if (abr.vermittler_nummer) {
        // Prüfe ob Vorgesetzter
        if (abr.extracted_data?.vorgesetzter) {
          stats.vermittler_mit_vorgesetzten++;
        }
        // Prüfe ob Superprovisionen vorhanden
        if (abr.extracted_data?.superprovisionen && abr.extracted_data.superprovisionen.length > 0) {
          stats.superprovisions_abrechnungen++;
          stats.vorgesetzte_mit_untervermittlern++;
        }
      }
      // Kombinierte Analysen
      if (abr.metadaten?.is_combined_analysis) {
        stats.kombinierte_analysen++;
      }
    });

    return stats;
  }

  /**
   * ==============================================
   * TRANSAKTIONS-MANAGEMENT (V3)
   * ==============================================
   */

  /**
   * Speichert eine Transaktion
   */
  async saveTransaktion(data) {
    if (!this.db) {
      throw new Error('Datenbank nicht initialisiert');
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['transaktionen'], 'readwrite');
      const store = transaction.objectStore('transaktionen');

      const request = store.add(data);

      request.onsuccess = () => {
        resolve(request.result);
      };

      request.onerror = () => {
        console.error('Fehler beim Speichern der Transaktion:', request.error);
        reject(request.error);
      };
    });
  }

  /**
   * Speichert mehrere Transaktionen (Bulk)
   */
  async saveTransaktionenBulk(transaktionen) {
    if (!this.db) {
      throw new Error('Datenbank nicht initialisiert');
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['transaktionen'], 'readwrite');
      const store = transaction.objectStore('transaktionen');

      let count = 0;
      const errors = [];

      transaktionen.forEach((txn, index) => {
        const request = store.add(txn);

        request.onsuccess = () => {
          count++;
          if (count === transaktionen.length && errors.length === 0) {
            resolve(count);
          }
        };

        request.onerror = () => {
          const errorMsg = request.error ? request.error.message : 'Unknown error';
          errors.push({ index, error: errorMsg, txn: txn.transaktion_id });
          console.error(`❌ Fehler beim Speichern von Transaktion ${index} (${txn.transaktion_id}):`, errorMsg);
          if (count + errors.length === transaktionen.length) {
            if (errors.length > 0) {
              reject(new Error(`${errors.length} Fehler beim Speichern: ${errors[0].error}`));
            } else {
              resolve(count);
            }
          }
        };
      });
    });
  }

  /**
   * Speichert AI-gefundene Anomalien als Transaktionen
   * Konvertiert AI-Analyse-Response in Transaktions-Objekte
   */
  async saveAITransaktionen(abrechnungId, agenturData, aiTransaktionen) {
    if (!this.db) {
      throw new Error('Datenbank nicht initialisiert');
    }

    console.log(`💾 Speichere ${aiTransaktionen.length} AI-gefundene Transaktionen...`);

    // Konvertiere AI-Transaktionen in vollständige Transaktions-Objekte
    const transaktionen = aiTransaktionen.map((aiTxn, index) => {
      // Generiere eindeutige Transaktions-ID
      const txnId = `AI-${abrechnungId}-${String(index + 1).padStart(3, '0')}`;

      // Berechne Provision aus Prozent und Jahresbeitrag falls nicht vorhanden
      let provisionBetrag = aiTxn.provision_betrag || 0;
      if (!provisionBetrag && aiTxn.provision_prozent && aiTxn.jahresbeitrag) {
        provisionBetrag = Math.round((aiTxn.jahresbeitrag * aiTxn.provision_prozent / 100) * 100) / 100;
      }

      return {
        transaktion_id: txnId,
        agentur_id: agenturData.agentur_id,
        agentur_name: agenturData.agentur_name,
        abrechnung_id: abrechnungId,
        periode: agenturData.periode,

        // Transaktionsdetails
        transaktion_typ: 'Provision',
        kunde: aiTxn.kunde || 'Unbekannt',
        vertrag_nr: aiTxn.vsnr || aiTxn.vertrag_nr || `V-${Date.now()}-${index}`,
        produkt_typ: aiTxn.produkt_typ || 'UNKNOWN',
        produkt: aiTxn.produkt || this._mapProduktTypToName(aiTxn.produkt_typ),
        jahresbeitrag: aiTxn.jahresbeitrag || 0,
        provision_prozent: aiTxn.provision_prozent || 0,
        betrag: provisionBetrag,

        // Auffälligkeits-Daten
        ist_auffaellig: true, // AI hat diese als auffällig markiert
        auffaelligkeits_kategorie: aiTxn.auffaelligkeits_kategorie,
        auffaelligkeits_grund: aiTxn.auffaelligkeits_grund || 'KI-Anomalieerkennung',
        status: 'NEW', // Neu gefundene AI-Anomalien bekommen Status "NEU"

        // Metadaten
        erstellt_am: aiTxn.abschlussdatum || new Date().toISOString(),
        geflaggt_am: new Date().toISOString(),
        geflaggt_durch: 'OpenAI GPT-4o',
        geprueft_am: null,
        geprueft_von: null,

        // Zusätzliche AI-Metadaten
        ai_detected: true,
        ai_confidence: aiTxn.confidence || 0.85
      };
    });

    // Speichere alle Transaktionen
    try {
      const count = await this.saveTransaktionenBulk(transaktionen);
      console.log(`✅ ${count} AI-Transaktionen erfolgreich gespeichert`);
      return count;
    } catch (error) {
      console.error('❌ Fehler beim Speichern der AI-Transaktionen:', error);
      throw error;
    }
  }

  /**
   * Hilfsmethode: Mapped Produkt-Typ zu vollständigem Namen
   */
  _mapProduktTypToName(typ) {
    const mapping = {
      'KV': 'Krankenversicherung',
      'LV': 'Lebensversicherung',
      'BU': 'Berufsunfähigkeitsversicherung',
      'SACH': 'Sachversicherung',
      'KFZ': 'Kfz-Versicherung',
      'HAUS': 'Hausratversicherung'
    };
    return mapping[typ] || typ;
  }

  /**
   * Holt alle Transaktionen
   */
  async getAllTransaktionen() {
    // Stelle sicher, dass DB-Verbindung gültig ist
    await this.ensureConnection();

    if (!this.db) {
      throw new Error('Datenbank nicht initialisiert');
    }

    return new Promise((resolve, reject) => {
      try {
        const transaction = this.db.transaction(['transaktionen'], 'readonly');
        const store = transaction.objectStore('transaktionen');
        const request = store.getAll();

        // Error handler for transaction
        transaction.onerror = () => {
          console.error('Transaction error:', transaction.error);
          reject(transaction.error);
        };

        transaction.onabort = () => {
          console.error('Transaction aborted');
          reject(new Error('Transaction was aborted'));
        };

        request.onsuccess = () => {
          console.log(`${request.result.length} Transaktionen geladen`);
          resolve(request.result);
        };

        request.onerror = () => {
          console.error('Request error:', request.error);
          reject(request.error);
        };
      } catch (error) {
        console.error('Error creating transaction:', error);
        reject(error);
      }
    });
  }

  /**
   * Holt geflaggte Transaktionen (Auffälligkeiten)
   */
  async getAuffaelligeTransaktionen() {
    if (!this.db) {
      throw new Error('Datenbank nicht initialisiert');
    }

    // Get all transactions and filter in memory (more reliable than index query)
    const allTransaktionen = await this.getAllTransaktionen();
    return allTransaktionen.filter(txn => txn.ist_auffaellig === true);
  }

  /**
   * Holt alle Transaktionen für eine spezifische Agentur
   */
  async getTransaktionenByAgentur(agenturId) {
    if (!this.db) {
      throw new Error('Datenbank nicht initialisiert');
    }

    const allTransaktionen = await this.getAllTransaktionen();
    return allTransaktionen
      .filter(txn => txn.agentur_id === agenturId)
      .sort((a, b) => new Date(b.erstellt_am) - new Date(a.erstellt_am)); // Neueste zuerst
  }

  /**
   * Aktualisiert Status einer Transaktion
   */
  async updateTransaktionStatus(transaktionId, newStatus) {
    if (!this.db) {
      throw new Error('Datenbank nicht initialisiert');
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['transaktionen'], 'readwrite');
      const store = transaction.objectStore('transaktionen');
      const index = store.index('transaktion_id');

      const getRequest = index.get(transaktionId);

      getRequest.onsuccess = () => {
        const txn = getRequest.result;
        if (!txn) {
          reject(new Error(`Transaktion ${transaktionId} nicht gefunden`));
          return;
        }

        txn.status = newStatus;
        txn.geprueft_am = new Date().toISOString();

        const updateRequest = store.put(txn);

        updateRequest.onsuccess = () => {
          resolve(txn);
        };

        updateRequest.onerror = () => {
          reject(updateRequest.error);
        };
      };

      getRequest.onerror = () => {
        reject(getRequest.error);
      };
    });
  }

  /**
   * Aktualisiert eine gesamte Transaktion
   */
  async updateTransaktion(transaktion) {
    if (!this.db) {
      throw new Error('Datenbank nicht initialisiert');
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['transaktionen'], 'readwrite');
      const store = transaction.objectStore('transaktionen');

      const request = store.put(transaktion);

      request.onsuccess = () => {
        console.log('Transaktion aktualisiert:', transaktion.transaktion_id);
        resolve(request.result);
      };

      request.onerror = () => {
        console.error('Fehler beim Aktualisieren der Transaktion:', request.error);
        reject(request.error);
      };
    });
  }

  /**
   * Flaggt/Entflaggt eine Transaktion
   */
  async toggleTransaktionFlag(transaktionId, grund = null) {
    if (!this.db) {
      throw new Error('Datenbank nicht initialisiert');
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['transaktionen'], 'readwrite');
      const store = transaction.objectStore('transaktionen');
      const index = store.index('transaktion_id');

      const getRequest = index.get(transaktionId);

      getRequest.onsuccess = () => {
        const txn = getRequest.result;
        if (!txn) {
          reject(new Error(`Transaktion ${transaktionId} nicht gefunden`));
          return;
        }

        // Toggle flag
        txn.ist_auffaellig = !txn.ist_auffaellig;

        if (txn.ist_auffaellig) {
          txn.status = 'GEFLAGGT';
          txn.auffaelligkeits_grund = grund || 'Manuell geflaggt';
        } else {
          txn.status = 'OK';
          txn.auffaelligkeits_grund = null;
        }

        txn.geprueft_am = new Date().toISOString();

        const updateRequest = store.put(txn);

        updateRequest.onsuccess = () => {
          resolve(txn);
        };

        updateRequest.onerror = () => {
          reject(updateRequest.error);
        };
      };

      getRequest.onerror = () => {
        reject(getRequest.error);
      };
    });
  }

  /**
   * Holt Transaktionen-Statistiken
   */
  async getTransaktionenStats() {
    const all = await this.getAllTransaktionen();
    const auffaellig = await this.getAuffaelligeTransaktionen();
    const abrechnungen = await this.getAllAbrechnungen();

    const stats = {
      gesamt: all.length,
      auffaellig: auffaellig.length,
      prozent_auffaellig: all.length > 0 ? ((auffaellig.length / all.length) * 100).toFixed(2) : 0,
      nach_status: {
        NEU: 0,
        GEPRÜFT: 0,
        OK: 0,
        GEFLAGGT: 0
      },
      gesamt_provision: 0,
      agenturen: new Set(),
      perioden: new Set(),
      anzahl_abrechnungen: abrechnungen.length
    };

    all.forEach(txn => {
      if (txn.status && stats.nach_status[txn.status] !== undefined) {
        stats.nach_status[txn.status]++;
      }
      stats.gesamt_provision += txn.betrag || 0;
      if (txn.agentur_id) stats.agenturen.add(txn.agentur_id);
      if (txn.periode) stats.perioden.add(txn.periode);
    });

    stats.anzahl_agenturen = stats.agenturen.size;
    stats.anzahl_perioden = stats.perioden.size;

    delete stats.agenturen;  // Sets können nicht direkt zu JSON
    delete stats.perioden;

    return stats;
  }

  /**
   * Löscht alle Transaktionen (für Reset)
   */
  async clearAllTransaktionen() {
    if (!this.db) {
      throw new Error('Datenbank nicht initialisiert');
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['transaktionen'], 'readwrite');
      const store = transaction.objectStore('transaktionen');
      const request = store.clear();

      request.onsuccess = () => {
        console.log('Alle Transaktionen gelöscht');
        resolve();
      };

      request.onerror = () => {
        reject(request.error);
      };
    });
  }

  /**
   * Schließt die Datenbankverbindung
   */
  close() {
    if (this.db) {
      this.db.close();
      this.db = null;
      console.log('Datenbank geschlossen');
    }
  }
}

// Singleton-Instanz
const db = new DatabaseManager();
