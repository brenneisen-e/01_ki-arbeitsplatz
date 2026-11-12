/**
 * Alpha Provisionsanalyse-System - OpenAI Client
 * ===============================================
 * GPT-4o/GPT-5 Integration für KI-gestützte Analyse
 */

class OpenAIClient {
  constructor() {
    this.apiKey = null;
    this.baseURL = CONFIG.OPENAI.BASE_URL;
    this.model = CONFIG.OPENAI.MODELS.PRIMARY;
    this.requestQueue = [];
    this.activeRequests = 0;
    this.costEstimate = 0;
  }

  /**
   * Setzt den API-Key
   */
  setApiKey(key) {
    this.apiKey = key;
    // Speichere verschlüsselt in localStorage
    localStorage.setItem(
      CONFIG.STORAGE_KEYS.API_KEY,
      UTILS.encryptApiKey(key)
    );
  }

  /**
   * Lädt API-Key aus localStorage
   */
  loadApiKey() {
    const encrypted = localStorage.getItem(CONFIG.STORAGE_KEYS.API_KEY);
    if (encrypted) {
      this.apiKey = UTILS.decryptApiKey(encrypted);
      return this.apiKey;
    }
    return null;
  }

  /**
   * Prüft ob API-Key gesetzt ist
   */
  hasApiKey() {
    return this.apiKey !== null && this.apiKey !== '';
  }

  /**
   * Testet API-Key
   */
  async testApiKey(key = this.apiKey) {
    if (!key) {
      throw new Error('Kein API-Key vorhanden');
    }

    try {
      const response = await fetch(`${this.baseURL}/models`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${key}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        console.log('API-Key gültig, verfügbare Modelle:', data.data.length);
        return true;
      } else {
        throw new Error(`API-Key ungültig: ${response.status}`);
      }
    } catch (error) {
      console.error('Fehler beim Testen des API-Keys:', error);
      throw error;
    }
  }

  /**
   * Hauptfunktion: Analysiert eine Abrechnung mit GPT (ERWEITERT FÜR HIERARCHIEN)
   */
  async analyzeAbrechnung(aktuelleAbrechnung, historieDaten = [], opts = {}) {
    if (!this.hasApiKey()) {
      throw new Error(CONFIG.ERRORS.NO_API_KEY);
    }

    // Optionale hierarchische Analyse
    let relatedAbrechnungen = null;
    if (opts.includeHierarchy && aktuelleAbrechnung.vermittler_nummer && aktuelleAbrechnung.periode) {
      try {
        // Lade verwandte Abrechnungen (Vorgesetzter + Untervermittler)
        relatedAbrechnungen = await db.findRelatedAbrechnungen(
          aktuelleAbrechnung.vermittler_nummer,
          aktuelleAbrechnung.periode
        );
        console.log('Hierarchische Daten geladen:', relatedAbrechnungen);
      } catch (error) {
        console.warn('Fehler beim Laden hierarchischer Daten:', error);
        // Fahre fort ohne Hierarchie-Daten
      }
    }

    // Erstelle System-Prompt
    const systemPrompt = this._createSystemPrompt();

    // Erstelle User-Prompt mit Daten (inkl. hierarchische Daten wenn vorhanden)
    const userPrompt = this._createUserPrompt(aktuelleAbrechnung, historieDaten, relatedAbrechnungen);

    // Sende Anfrage an OpenAI
    try {
      const response = await this._makeAPICall([
        {
          role: 'system',
          content: systemPrompt,
        },
        {
          role: 'user',
          content: userPrompt,
        },
      ]);

      // Parse und validiere Response
      const analysis = this._parseAnalysisResponse(response);

      // Füge Hierarchie-Infos hinzu wenn vorhanden
      if (relatedAbrechnungen) {
        analysis.hierarchie_analysiert = true;
        analysis.hat_vorgesetzten = !!relatedAbrechnungen.vorgesetzter;
        analysis.anzahl_untervermittler = relatedAbrechnungen.untervermittler?.length || 0;
      }

      return analysis;
    } catch (error) {
      console.error('Fehler bei der KI-Analyse:', error);
      throw error;
    }
  }

  /**
   * Erstellt System-Prompt (ERWEITERT FÜR HIERARCHIEN)
   */
  _createSystemPrompt() {
    return `Du bist ein hochspezialisierter KI-Analyst für Versicherungsprovisionsabrechnungen mit Expertise in:
- Erkennung von Auffälligkeiten und Anomalien
- Vergleich mit historischen Mustern
- Identifikation von mathematischen Inkonsistenzen
- Bewertung von Risikoniveaus
- **HIERARCHISCHE STRUKTUREN**: Strukturvertrieb, Super-/Differenzprovisionen
- **COMPLIANCE-CHECKS**: Gesamtprovisions-Limits (Vermittler + Superprovision)
- **CROSS-STATEMENT-ANALYSE**: Verstöße nur sichtbar durch Kombinieren mehrerer Abrechnungen

**WICHTIGE ERWEITERUNG - 6 SPEZIELLE AUFFÄLLIGKEITSMUSTER:**

1. **Superprovisions-Compliance-Verstöße**
   - Einzelabrechnung unauffällig, kombiniert über Limit
   - Max. KV: 75%, Sach: 65%, LV/BU: 5 Jahresbeiträge

2. **Mehrstufige Provisionsstapelung**
   - 4+ Hierarchieebenen → ungewöhnlich

3. **Storno-Clustering**
   - >10 Stornos am gleichen Tag = kritisch
   - Zeitliche Häufung prüfen

4. **Systematische Umdeckungen**
   - Storno + Neuabschluss beim gleichen Kunden innerhalb kurzer Zeit
   - >3 Fälle = auffällig

5. **Storno-Neuabschluss-Optimierung (Churning)**
   - Eigene Altverträge durch Neuabschlüsse ersetzen
   - Provisionsmaximierung durch Zyklus

6. **Omnikanal-Kickback**
   - Großmakler leitet an Alpha-Vermittler weiter (statt eigene Courtage)
   - Verdacht auf versteckte Verbindung/Kickback

Analysiere die Abrechnungen präzise, objektiv und strukturiert.
Antworte AUSSCHLIESSLICH im vorgegebenen JSON-Format ohne zusätzlichen Text.`;
  }

  /**
   * Erstellt User-Prompt mit Daten (ERWEITERT FÜR HIERARCHIEN + TRANSAKTIONEN)
   */
  _createUserPrompt(aktuelleAbrechnung, historieDaten, relatedAbrechnungen = null) {
    const hasHistory = historieDaten && historieDaten.length > 0;
    const hasRelated = relatedAbrechnungen && (
      relatedAbrechnungen.vorgesetzter ||
      relatedAbrechnungen.untervermittler?.length > 0
    );
    const hasTransactions = aktuelleAbrechnung.vertraege && aktuelleAbrechnung.vertraege.length > 0;

    let prompt = `Führe eine umfassende Analyse dieser Provisionsabrechnung durch:

═══════════════════════════════════════════════════════
AKTUELLE ABRECHNUNG (zu analysierende Daten)
═══════════════════════════════════════════════════════
${JSON.stringify(aktuelleAbrechnung, null, 2)}

═══════════════════════════════════════════════════════
HISTORISCHE VERGLEICHSDATEN
═══════════════════════════════════════════════════════
${hasHistory
  ? JSON.stringify(historieDaten.map(h => ({
      periode: h.periode,
      provisionssumme: h.extracted_data?.provisionssumme_gesamt || 0,
      vertragsanzahl: h.extracted_data?.vertragsanzahl_gesamt || 0,
      stornoquote: h.extracted_data?.stornoquote_gesamt || 0,
      sparten: h.extracted_data?.provisionssumme_sparten || {},
      risiko_score: h.ki_analyse?.risiko_score || 0,
    })), null, 2)
  : 'Keine historischen Daten vorhanden - dies ist die erste Abrechnung für diese Agentur.'}`;

    // NEUE SEKTION: Verwandte Abrechnungen für Hierarchie-Analyse
    if (hasRelated) {
      prompt += `

═══════════════════════════════════════════════════════
HIERARCHISCHE STRUKTUR (CROSS-STATEMENT-ANALYSE)
═══════════════════════════════════════════════════════
${relatedAbrechnungen.vorgesetzter ? `
**VORGESETZTER GEFUNDEN:**
${JSON.stringify({
  vermittler_nummer: relatedAbrechnungen.vorgesetzter.vermittler_nummer,
  name: relatedAbrechnungen.vorgesetzter.agentur_name,
  superprovisionen: relatedAbrechnungen.vorgesetzter.extracted_data?.superprovisionen || [],
  provisionssumme_gesamt: relatedAbrechnungen.vorgesetzter.extracted_data?.provisionssumme_gesamt || 0
}, null, 2)}

**WICHTIG**: Prüfe ob Vermittler-Provision + Superprovision des Vorgesetzten die Compliance-Grenzen überschreiten!
` : ''}

${relatedAbrechnungen.untervermittler && relatedAbrechnungen.untervermittler.length > 0 ? `
**UNTERVERMITTLER GEFUNDEN (${relatedAbrechnungen.untervermittler.length}):**
${JSON.stringify(relatedAbrechnungen.untervermittler.map(uv => ({
  vermittler_nummer: uv.vermittler_nummer,
  name: uv.agentur_name,
  provisionssumme: uv.extracted_data?.provisionssumme_gesamt || 0,
  vertraege: uv.extracted_data?.vertraege || []
})), null, 2)}

**WICHTIG**: Prüfe ob Superprovisionen korrekt berechnet und Compliance eingehalten wird!
` : ''}`;
    }

    prompt += `

═══════════════════════════════════════════════════════
ANALYSEKRITERIEN
═══════════════════════════════════════════════════════

1. HISTORISCHER VERGLEICH (falls Daten vorhanden):
   - Provisionsentwicklung: Abweichungen >20% markieren
   - Vertragsanzahl: Ungewöhnliche Zu-/Abnahmen
   - Stornoquoten: Erhöhungen >5 Prozentpunkte
   - Spartenverteilung: Signifikante Verschiebungen
   - Saisonale Muster: Abweichungen vom Normverhalten

2. MATHEMATISCHE VALIDIERUNG:
   - Summenbildung korrekt?
   - Prozentsätze plausibel?
   - Verhältnisse logisch konsistent?

3. BRANCHENBENCHMARK:
   - Typische Provisionssätze: Leben 3-5%, Sach 10-15%, Kranken 4-8%, Kfz 12-18%
   - Übliche Stornoquoten: <10% bei Neugeschäft
   - Neugeschäft/Bestand-Ratio: 30/70 bis 40/60

4. ANOMALIE-DETEKTION:
   - Extrem hohe Einzelprovisionen
   - Unplausible Vertragsanzahlen
   - Negative Werte wo nicht üblich
   - Fehlende Pflichtangaben

**5. HIERARCHIE-SPEZIFISCHE PRÜFUNGEN (NEU):**

   a) **SUPERPROVISIONS-COMPLIANCE:**
      - Prüfe JEDEN Vertrag: Vermittler-Provision + Superprovision ≤ Limit?
      - KV: max 75%, Sach: max 65%, LV/BU: max 5 Jahresbeiträge
      - **KRITISCH**: Verstöße oft nur durch Kombination sichtbar!

   b) **STORNO-CLUSTERING:**
      - >5 Stornos am gleichen Tag = Warnung
      - >10 Stornos am gleichen Tag = KRITISCH
      - Prüfe zeitliche Muster (z.B. alle aus gleicher Abschlussperiode)

   c) **UMDECKUNGEN:**
      - Storno + Neuabschluss beim selben Kunden innerhalb 7 Tagen
      - >3 Fälle = systematisches Muster = kritisch
      - Prüfe: War Umdeckung im Kundeninteresse?

   d) **CHURNING:**
      - Eigene Altverträge (18-36 Monate) durch Neuabschlüsse ersetzen
      - Netto-Provisionsgewinn trotz Rückforderung
      - Extrem hohe Neugeschäft-Quote (>70%) + hohe Stornoquote (>10%)

   e) **OMNIKANAL-KICKBACK:**
      - Großmakler leitet an Alpha-Vermittler weiter
      - Kickback-Verdacht wenn Geschäftsweiterleitung statt eigener Courtage

═══════════════════════════════════════════════════════
AUSGABEFORMAT (STRIKT EINHALTEN)
═══════════════════════════════════════════════════════

Antworte mit einem validen JSON-Objekt in folgendem Format:

{
  "agentur_id": "string",
  "agentur_name": "string",
  "abrechnungsperiode": "YYYY-MM",
  "analyse_datum": "ISO-Timestamp",
  "risiko_score": 0-5,
  "risiko_kategorie": "grün|gelb|orange|rot",
  "zusammenfassung": "Kurze Gesamtbewertung in 1-2 Sätzen",
  "auffaelligkeiten": [
    {
      "id": "unique-id",
      "kategorie": "Historischer Vergleich|Mathematische Validierung|Branchenbenchmark|Anomalie|Superprovisions-Compliance|Storno-Clustering|Umdeckungen|Churning|Omnikanal-Kickback",
      "schweregrad": "niedrig|mittel|hoch|kritisch",
      "titel": "Kurze Überschrift",
      "beschreibung": "Detaillierte Erklärung der Auffälligkeit",
      "betroffene_daten": {
        "aktuell": "Wert oder Objekt",
        "referenz": "Vergleichswert oder Objekt",
        "abweichung": "Prozent oder absolut"
      },
      "empfehlung": "Konkrete Handlungsempfehlung"
    }
  ],
  "auffaellige_transaktionen": [
    {
      "vsnr": "Vertragsnummer aus Daten",
      "kunde": "Kundenname",
      "produkt": "Produktname",
      "produkt_typ": "KV|LV|BU|SACH|KFZ|HAUS",
      "jahresbeitrag": 0,
      "provision_prozent": 0,
      "provision_betrag": 0,
      "abschlussdatum": "YYYY-MM-DD oder null",
      "auffaelligkeits_kategorie": "STORNO_NEUABSCHLUSS|AUFFÄLLIGE_PROVISIONSHÖHE|UEBERHÖHTE_PROVISION|HOHER_JAHRESBEITRAG|DUPLIKAT_KUNDE|COMPLIANCE_LIMIT|STORNOQUOTE_ERHÖHT|ZEITLICHE_AUFFÄLLIGKEIT|PRODUKTKOMBINATION|CHURNING_VERDACHT|SUPERPROVISION|SYSTEMATISCH",
      "auffaelligkeits_grund": "Kurze Begründung in 1-2 Sätzen"
    }
  ],
  "kennzahlen_vergleich": {
    "provisionssumme": {
      "aktuell": 0,
      "vorperiode": 0,
      "veraenderung_prozent": 0
    },
    "vertragsanzahl": {
      "aktuell": 0,
      "vorperiode": 0,
      "veraenderung_prozent": 0
    },
    "stornoquote": {
      "aktuell": 0,
      "vorperiode": 0,
      "veraenderung_prozentpunkte": 0
    }
  },
  "handlungsempfehlung": "Keine Maßnahme erforderlich|Beobachten|Prüfung empfohlen|Sofortige Prüfung erforderlich",
  "details": "Weitere relevante Informationen oder Kontext"
}

**KRITISCH WICHTIG - TRANSAKTIONS-LEVEL ANOMALIEN:**
- Analysiere JEDE einzelne Transaktion aus "vertraege" Array
- Flagge verdächtige Transaktionen im "auffaellige_transaktionen" Array
- Verwende die EXAKT GLEICHEN Kategorien wie das Demo-System:
  * STORNO_NEUABSCHLUSS: Storno kurz nach Haftungsende + sofortiger Neuabschluss
  * AUFFÄLLIGE_PROVISIONSHÖHE: Agentur zeigt ungewöhnlich hohe Provisionsabweichung vom historischen Durchschnitt (z.B. 3-4x höher als üblich)
  * UEBERHÖHTE_PROVISION: >35% über Branchendurchschnitt
  * HOHER_JAHRESBEITRAG: >40% über typischem Beitrag
  * DUPLIKAT_KUNDE: ≥3 Verträge gleicher Kunde in 90 Tagen
  * COMPLIANCE_LIMIT: Provision >70% des Jahresbeitrags
  * STORNOQUOTE_ERHÖHT: Agentur-Stornoquote >15%
  * ZEITLICHE_AUFFÄLLIGKEIT: Abschluss außerhalb Geschäftszeiten
  * PRODUKTKOMBINATION: ≥3 hochpreisige Produkte gleichzeitig
  * CHURNING_VERDACHT: >2 Vertragsänderungen in 6 Monaten
  * SUPERPROVISION: Gesamtprovision >85% Jahresbeitrag
  * SYSTEMATISCH: Wiederkehrendes Muster über mehrere Verträge
- Sei angemessen kritisch bei der Anomalieerkennung - wie ein erfahrener Compliance-Analyst
- Nutze Mustererkennung über ALLE Transaktionen hinweg

WICHTIG:
- Risiko-Score-Logik: 0-1 = grün (ok), 2 = gelb (beobachten), 3 = orange (auffällig), 4-5 = rot (nur bei schwerwiegenden Verstößen)
- Bei erster Abrechnung ohne Historie: Fokus auf mathematische Validierung und Branchenbenchmark
- Sei präzise aber nicht übervorsichtig - nicht jede kleine Abweichung ist eine Auffälligkeit
- Hohe Risiko-Scores (4-5) nur bei eindeutigen Compliance-Verstößen oder systematischen Mustern vergeben
- **NEU**: Flagge mindestens 3-5% der Transaktionen als auffällig wenn Muster erkannt werden
- Antworte NUR mit dem JSON-Objekt, ohne zusätzlichen Text`;

    return prompt;
  }

  /**
   * Macht API-Call zu OpenAI
   */
  async _makeAPICall(messages, attempt = 1) {
    // Warte auf Rate-Limit
    while (this.activeRequests >= CONFIG.RATE_LIMIT.MAX_CONCURRENT) {
      await UTILS.sleep(100);
    }

    this.activeRequests++;

    try {
      const response = await fetch(`${this.baseURL}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: this.model,
          messages: messages,
          response_format: { type: "json_object" },
          temperature: CONFIG.OPENAI.TEMPERATURE,
          max_tokens: CONFIG.OPENAI.MAX_TOKENS,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));

        // Spezielle Fehlerbehandlung
        if (response.status === 429) {
          // Rate Limit - retry mit exponential backoff
          if (attempt < CONFIG.OPENAI.RETRY_ATTEMPTS) {
            const delay = CONFIG.OPENAI.RETRY_DELAY * Math.pow(2, attempt - 1);
            console.warn(`Rate limit erreicht, warte ${delay}ms...`);
            await UTILS.sleep(delay);
            this.activeRequests--;
            return this._makeAPICall(messages, attempt + 1);
          }
          throw new Error(CONFIG.ERRORS.RATE_LIMIT);
        } else if (response.status === 401) {
          throw new Error(CONFIG.ERRORS.INVALID_API_KEY);
        } else {
          throw new Error(`OpenAI API Error: ${response.status} - ${errorData.error?.message || 'Unknown error'}`);
        }
      }

      const data = await response.json();

      // Schätze Kosten
      const usage = data.usage;
      if (usage) {
        const modelCosts = CONFIG.COSTS[this.model.toUpperCase().replace(/-/g, '_')] || CONFIG.COSTS.GPT_4O;
        const cost = (usage.prompt_tokens * modelCosts.INPUT_TOKEN_PRICE) +
                     (usage.completion_tokens * modelCosts.OUTPUT_TOKEN_PRICE);
        this.costEstimate += cost;
        console.log(`API-Call-Kosten: $${cost.toFixed(4)}, Tokens: ${usage.total_tokens}`);
      }

      return data.choices[0].message.content;

    } catch (error) {
      console.error('API Call Fehler:', error);

      // Retry bei Netzwerkfehlern
      if (attempt < CONFIG.OPENAI.RETRY_ATTEMPTS &&
          (error.message.includes('network') || error.message.includes('fetch'))) {
        const delay = CONFIG.OPENAI.RETRY_DELAY * attempt;
        console.warn(`Netzwerkfehler, retry in ${delay}ms...`);
        await UTILS.sleep(delay);
        this.activeRequests--;
        return this._makeAPICall(messages, attempt + 1);
      }

      throw error;
    } finally {
      this.activeRequests--;
    }
  }

  /**
   * Parsed die KI-Response (ERWEITERT FÜR TRANSAKTIONS-ANOMALIEN)
   */
  _parseAnalysisResponse(responseText) {
    try {
      const data = JSON.parse(responseText);

      // Validiere erforderliche Felder
      if (!data.risiko_score || data.risiko_score < 0 || data.risiko_score > 5) {
        console.warn('Ungültiger Risiko-Score, setze auf 2 (Beobachtung)');
        data.risiko_score = 2;
      }

      if (!data.risiko_kategorie) {
        data.risiko_kategorie = UTILS.getRiskCategory(data.risiko_score);
      }

      if (!data.auffaelligkeiten) {
        data.auffaelligkeiten = [];
      }

      // NEU: Validiere auffällige Transaktionen
      if (!data.auffaellige_transaktionen) {
        data.auffaellige_transaktionen = [];
      }

      if (!data.analyse_datum) {
        data.analyse_datum = new Date().toISOString();
      }

      // Füge IDs zu Auffälligkeiten hinzu falls nicht vorhanden
      data.auffaelligkeiten = data.auffaelligkeiten.map(auff => ({
        ...auff,
        id: auff.id || UTILS.generateId(),
      }));

      // Validiere Transaktions-Anomalien
      data.auffaellige_transaktionen = data.auffaellige_transaktionen.map(txn => ({
        ...txn,
        // Stelle sicher dass alle erforderlichen Felder vorhanden sind
        vsnr: txn.vsnr || txn.vertrag_nr || 'UNKNOWN',
        provision_betrag: txn.provision_betrag || 0,
        provision_prozent: txn.provision_prozent || 0,
        jahresbeitrag: txn.jahresbeitrag || 0,
      }));

      console.log(`✅ KI-Analyse erfolgreich: ${data.auffaellige_transaktionen.length} auffällige Transaktionen gefunden`);

      return data;
    } catch (error) {
      console.error('Fehler beim Parsen der KI-Response:', error);
      console.log('Response Text:', responseText);

      // Fallback-Analyse
      return this._createFallbackAnalysis();
    }
  }

  /**
   * Erstellt Fallback-Analyse bei Parsing-Fehler
   */
  _createFallbackAnalysis() {
    return {
      agentur_id: 'unknown',
      agentur_name: 'Unknown',
      abrechnungsperiode: new Date().toISOString().slice(0, 7),
      analyse_datum: new Date().toISOString(),
      risiko_score: 2,
      risiko_kategorie: 'gelb',
      zusammenfassung: 'Analyse fehlgeschlagen. Manuelle Prüfung erforderlich.',
      auffaelligkeiten: [{
        id: UTILS.generateId(),
        kategorie: 'Anomalie',
        schweregrad: 'hoch',
        titel: 'KI-Analyse-Fehler',
        beschreibung: 'Die automatische Analyse konnte nicht erfolgreich durchgeführt werden. Bitte prüfen Sie die Abrechnung manuell.',
        betroffene_daten: {},
        empfehlung: 'Manuelle Überprüfung der PDF-Datei erforderlich.',
      }],
      auffaellige_transaktionen: [], // NEU: Leeres Array für Transaktionen
      kennzahlen_vergleich: {},
      handlungsempfehlung: 'Prüfung empfohlen',
      details: 'Automatische Analyse fehlgeschlagen.',
    };
  }

  /**
   * Batch-Analyse mehrerer Abrechnungen
   */
  async analyzeBatch(abrechnungen, onProgress) {
    const results = [];
    const errors = [];
    let totalCost = 0;

    this.costEstimate = 0; // Reset

    for (let i = 0; i < abrechnungen.length; i++) {
      const abr = abrechnungen[i];

      try {
        // Hole historische Daten
        const historie = await db.getHistorieByAgentur(abr.agentur_id);

        // Analysiere
        const analysis = await this.analyzeAbrechnung(abr, historie);

        results.push({
          success: true,
          data: analysis,
          original: abr,
        });

        // Progress Callback
        if (onProgress) {
          onProgress({
            current: i + 1,
            total: abrechnungen.length,
            success: results.length,
            errors: errors.length,
            cost: this.costEstimate,
          });
        }

      } catch (error) {
        console.error(`Fehler bei Analyse von ${abr.agentur_id}:`, error);
        errors.push({
          abrechnung: abr,
          error: error.message,
        });

        if (onProgress) {
          onProgress({
            current: i + 1,
            total: abrechnungen.length,
            success: results.length,
            errors: errors.length,
            cost: this.costEstimate,
          });
        }
      }

      // Kleine Verzögerung zwischen Requests
      if (i < abrechnungen.length - 1) {
        await UTILS.sleep(CONFIG.RATE_LIMIT.DELAY_BETWEEN_REQUESTS);
      }
    }

    return {
      results: results,
      errors: errors,
      totalCost: this.costEstimate,
    };
  }

  /**
   * Holt geschätzte Kosten
   */
  getEstimatedCost() {
    return this.costEstimate;
  }

  /**
   * Reset Kosten-Counter
   */
  resetCostEstimate() {
    this.costEstimate = 0;
  }
}

// Singleton-Instanz
const openaiClient = new OpenAIClient();
