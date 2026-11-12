/**
 * Alpha Provisionsanalyse-System - PDF Processor
 * ===============================================
 * PDF-Extraktion und Datenverarbeitung mit PDF.js
 */

class PDFProcessor {
  constructor() {
    this.pdfjsLib = window.pdfjsLib || null;
  }

  /**
   * Extrahiert Text und Daten aus PDF
   */
  async extractPdfData(file) {
    if (!this.pdfjsLib) {
      throw new Error('PDF.js nicht geladen');
    }

    try {
      // Konvertiere File zu ArrayBuffer
      const arrayBuffer = await file.arrayBuffer();

      // Lade PDF-Dokument
      const loadingTask = this.pdfjsLib.getDocument({ data: arrayBuffer });
      const pdf = await loadingTask.promise;

      console.log(`PDF geladen: ${pdf.numPages} Seiten`);

      // Extrahiere Text von allen Seiten mit Zeilenstruktur
      let fullText = '';
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();

        // Gruppiere Text-Items nach Y-Position (Zeilen)
        const lines = new Map();

        textContent.items.forEach(item => {
          if (!item.str.trim()) return; // Skip leere Items

          // Runde Y-Position auf 1 Dezimalstelle, um Items in derselben Zeile zu gruppieren
          const y = Math.round(item.transform[5] * 10) / 10;

          if (!lines.has(y)) {
            lines.set(y, []);
          }
          lines.get(y).push({
            x: item.transform[4],
            text: item.str
          });
        });

        // Sortiere Zeilen nach Y-Position (von oben nach unten)
        const sortedLines = Array.from(lines.entries())
          .sort((a, b) => b[0] - a[0]); // Höhere Y = weiter oben

        // Für jede Zeile: Sortiere Items nach X-Position und füge zusammen
        sortedLines.forEach(([y, items]) => {
          const sortedItems = items.sort((a, b) => a.x - b.x);
          const lineText = sortedItems.map(item => item.text).join(' ');
          fullText += lineText + '\n';
        });
      }

      // Parse Abrechnungsdaten
      const extractedData = this._parseAbrechnungsdaten(fullText, file.name);

      return {
        fileName: file.name,
        fileSize: file.size,
        pageCount: pdf.numPages,
        extractedText: fullText,
        extractedData: extractedData,
      };

    } catch (error) {
      console.error('Fehler beim Extrahieren der PDF-Daten:', error);
      throw new Error(CONFIG.ERRORS.PARSING_ERROR + ': ' + error.message);
    }
  }

  /**
   * Parsed Abrechnungsdaten aus Text (ERWEITERT FÜR HIERARCHIEN)
   */
  _parseAbrechnungsdaten(text, fileName) {
    // Extrahiere Agentur-ID (aus Dateiname oder Text)
    const agenturId = this._extractAgenturId(text, fileName);

    // Extrahiere Periode
    const periode = this._extractPeriode(text, fileName);

    // Extrahiere Agentur-Name
    const agenturName = this._extractAgenturName(text);

    // **NEU**: Extrahiere Vermittler-Nummer
    const vermittlerNummer = this._extractVermittlerNummer(text, fileName);

    // Extrahiere Provisionen
    const provisionen = this._extractProvisionen(text);

    // Extrahiere Vertragsanzahlen
    const vertraege = this._extractVertragsanzahlen(text);

    // Extrahiere Stornoquoten
    const stornoquoten = this._extractStornoquoten(text);

    // Extrahiere weitere Daten
    const sonstige = this._extractSonstigeDaten(text);

    // **NEU**: Extrahiere Vertrags-Details (für Hierarchie-Analyse)
    const vertragsDetails = this._extractVertragsDetails(text);

    // **NEU**: Extrahiere Stornierungen mit Details
    const stornierungen = this._extractStornierungen(text);

    // **NEU**: Extrahiere Superprovisionen
    const superprovisionen = this._extractSuperprovisionen(text);

    // **NEU**: Extrahiere Vorgesetzten (falls vorhanden)
    const vorgesetzter = this._extractVorgesetzter(text);

    const result = {
      agentur_id: agenturId,
      agentur_name: agenturName,
      periode: periode,
      provisionssumme_gesamt: provisionen.gesamt,
      provisionssumme_sparten: provisionen.sparten,
      vertragsanzahl_gesamt: vertraege.gesamt,
      vertragsanzahl_sparten: vertraege.sparten,
      stornoquote_gesamt: stornoquoten.gesamt,
      stornoquote_sparten: stornoquoten.sparten,
      neugeschaeft_provision: sonstige.neugeschaeft,
      bestand_provision: sonstige.bestand,
      bonuszahlungen: sonstige.bonus,
      auszahlungsbetrag: sonstige.auszahlung,
      auszahlungsdatum: sonstige.auszahlungsdatum,
    };

    // Füge hierarchische Daten hinzu wenn vorhanden
    if (vermittlerNummer) {
      result.vermittler_nummer = vermittlerNummer;
    }
    if (vorgesetzter) {
      result.vorgesetzter = vorgesetzter;
    }
    if (vertragsDetails.length > 0) {
      result.vertraege = vertragsDetails;
    }
    if (stornierungen.length > 0) {
      result.stornierungen = stornierungen;
    }
    if (superprovisionen.length > 0) {
      result.superprovisionen = superprovisionen;
    }

    return result;
  }

  /**
   * Extrahiert Agentur-ID
   */
  _extractAgenturId(text, fileName) {
    // Versuche aus Dateiname zu extrahieren
    let match = fileName.match(/(\d{3,})/);
    if (match) return match[1];

    // Versuche aus Text zu extrahieren
    match = text.match(/(?:Agentur|AG|ID|Vermittler)[\s:-]*(\d{3,})/i);
    if (match) return match[1];

    // Fallback: Generiere aus Dateiname
    return fileName.replace(/[^0-9]/g, '').slice(0, 6) || '999999';
  }

  /**
   * Extrahiert Periode
   */
  _extractPeriode(text, fileName) {
    // Versuche aus Dateiname
    let match = fileName.match(/(\d{4})[-_](\d{2})/);
    if (match) return `${match[1]}-${match[2]}`;

    match = fileName.match(/(\d{2})[-_](\d{4})/);
    if (match) return `${match[2]}-${match[1]}`;

    // Versuche aus Text
    match = text.match(/(?:Periode|Monat|Abrechnungszeitraum)[\s:-]*(\d{1,2})\/(\d{4})/i);
    if (match) return `${match[2]}-${match[1].padStart(2, '0')}`;

    match = text.match(/(\d{4})-(\d{2})/);
    if (match) return `${match[1]}-${match[2]}`;

    // Fallback: Aktueller Monat
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  }

  /**
   * Extrahiert Agentur-Name
   */
  _extractAgenturName(text) {
    // Suche nach typischen Mustern
    const patterns = [
      /(?:Agentur|Vermittler)[\s:-]*([A-ZÄÖÜa-zäöü\s&.-]+(?:GmbH|AG|e\.K\.|OHG|KG))/i,
      /(?:Name|Firma)[\s:-]*([A-ZÄÖÜa-zäöü\s&.-]+)/i,
    ];

    for (const pattern of patterns) {
      const match = text.match(pattern);
      if (match && match[1].length > 3) {
        return match[1].trim();
      }
    }

    return 'Unbekannte Agentur';
  }

  /**
   * Extrahiert Provisionen
   */
  _extractProvisionen(text) {
    const betraege = this._extractAllBetraege(text);

    // Intelligente Heuristik zur Identifikation der Gesamtsumme
    const gesamt = betraege.length > 0
      ? Math.max(...betraege.filter(b => b > 100 && b < 1000000))
      : 0;

    // Extrahiere Sparten (vereinfacht)
    const sparten = {
      leben: this._extractSparteProvision(text, 'Leben'),
      sach: this._extractSparteProvision(text, 'Sach'),
      kranken: this._extractSparteProvision(text, 'Kranken'),
      kfz: this._extractSparteProvision(text, 'Kfz'),
    };

    // Korrigiere wenn Sparten > Gesamt
    const spartenSumme = Object.values(sparten).reduce((a, b) => a + b, 0);
    if (spartenSumme > gesamt && spartenSumme > 0) {
      return { gesamt: spartenSumme, sparten };
    }

    return { gesamt, sparten };
  }

  /**
   * Extrahiert Provision für eine Sparte
   */
  _extractSparteProvision(text, sparte) {
    const pattern = new RegExp(`${sparte}[\\s\\S]{0,50}?(\\d{1,3}(?:\\.\\d{3})*(?:,\\d{2})?)`, 'i');
    const match = text.match(pattern);
    if (match) {
      return UTILS.parseGermanNumber(match[1]);
    }
    return 0;
  }

  /**
   * Extrahiert alle Beträge aus Text
   */
  _extractAllBetraege(text) {
    const matches = text.matchAll(/(\d{1,3}(?:\.\d{3})*(?:,\d{2})?)\s*(?:EUR|€)?/g);
    const betraege = [];

    for (const match of matches) {
      const betrag = UTILS.parseGermanNumber(match[1]);
      if (betrag > 0) {
        betraege.push(betrag);
      }
    }

    return betraege;
  }

  /**
   * Extrahiert Vertragsanzahlen
   */
  _extractVertragsanzahlen(text) {
    // Suche nach Vertragsanzahl-Mustern
    const patterns = [
      /(?:Verträge|Contracts|Anzahl)[\s:-]*(\d+)/i,
      /(\d+)\s*(?:Verträge|Contracts)/i,
    ];

    let gesamt = 0;
    for (const pattern of patterns) {
      const match = text.match(pattern);
      if (match) {
        gesamt = Math.max(gesamt, parseInt(match[1]));
      }
    }

    // Extrahiere Sparten
    const sparten = {
      leben: this._extractSparteVertraege(text, 'Leben'),
      sach: this._extractSparteVertraege(text, 'Sach'),
      kranken: this._extractSparteVertraege(text, 'Kranken'),
      kfz: this._extractSparteVertraege(text, 'Kfz'),
    };

    const spartenSumme = Object.values(sparten).reduce((a, b) => a + b, 0);
    if (spartenSumme > gesamt) gesamt = spartenSumme;

    return { gesamt: gesamt || 0, sparten };
  }

  /**
   * Extrahiert Vertragsanzahl für Sparte
   */
  _extractSparteVertraege(text, sparte) {
    const pattern = new RegExp(`${sparte}[\\s\\S]{0,50}?(\\d+)\\s*(?:Verträge|Contracts)`, 'i');
    const match = text.match(pattern);
    if (match) {
      return parseInt(match[1]);
    }
    return 0;
  }

  /**
   * Extrahiert Stornoquoten
   */
  _extractStornoquoten(text) {
    const pattern = /(?:Storno|Cancellation)[\s:-]*(\d{1,2}(?:,\d{1,2})?)\s*%/i;
    const match = text.match(pattern);

    const gesamt = match ? UTILS.parseGermanNumber(match[1]) : 0;

    const sparten = {
      leben: this._extractSparteStorno(text, 'Leben'),
      sach: this._extractSparteStorno(text, 'Sach'),
      kranken: this._extractSparteStorno(text, 'Kranken'),
      kfz: this._extractSparteStorno(text, 'Kfz'),
    };

    return { gesamt, sparten };
  }

  /**
   * Extrahiert Stornoquote für Sparte
   */
  _extractSparteStorno(text, sparte) {
    const pattern = new RegExp(`${sparte}[\\s\\S]{0,50}?(\\d{1,2}(?:,\\d{1,2})?)\\s*%`, 'i');
    const match = text.match(pattern);
    if (match) {
      return UTILS.parseGermanNumber(match[1]);
    }
    return 0;
  }

  /**
   * Extrahiert sonstige Daten
   */
  _extractSonstigeDaten(text) {
    const result = {
      neugeschaeft: 0,
      bestand: 0,
      bonus: 0,
      auszahlung: 0,
      auszahlungsdatum: null,
    };

    // Neugeschäft
    let match = text.match(/(?:Neugeschäft|New Business)[\s:-]*(\d{1,3}(?:\.\d{3})*(?:,\d{2})?)/i);
    if (match) result.neugeschaeft = UTILS.parseGermanNumber(match[1]);

    // Bestand
    match = text.match(/(?:Bestand|Existing)[\s:-]*(\d{1,3}(?:\.\d{3})*(?:,\d{2})?)/i);
    if (match) result.bestand = UTILS.parseGermanNumber(match[1]);

    // Bonus
    match = text.match(/(?:Bonus|Prämie)[\s:-]*(\d{1,3}(?:\.\d{3})*(?:,\d{2})?)/i);
    if (match) result.bonus = UTILS.parseGermanNumber(match[1]);

    // Auszahlung
    match = text.match(/(?:Auszahlung|Payment)[\s:-]*(\d{1,3}(?:\.\d{3})*(?:,\d{2})?)/i);
    if (match) result.auszahlung = UTILS.parseGermanNumber(match[1]);

    // Datum
    match = text.match(/(?:Auszahlungsdatum|Payment Date)[\s:-]*(\d{1,2})\.(\d{1,2})\.(\d{4})/i);
    if (match) {
      result.auszahlungsdatum = `${match[3]}-${match[2].padStart(2, '0')}-${match[1].padStart(2, '0')}`;
    }

    return result;
  }

  /**
   * Validiert extrahierte Daten
   */
  validateExtractedData(data) {
    const errors = [];
    const warnings = [];

    // Pflichtfelder prüfen
    if (!data.agentur_id) {
      errors.push('Agentur-ID fehlt');
    }

    if (!data.periode) {
      errors.push('Periode fehlt');
    }

    // Plausibilitätsprüfungen
    if (data.provisionssumme_gesamt < 0) {
      warnings.push('Negative Provisionssumme');
    }

    if (data.provisionssumme_gesamt > 10000000) {
      warnings.push('Sehr hohe Provisionssumme (>10 Mio)');
    }

    if (data.vertragsanzahl_gesamt === 0) {
      warnings.push('Keine Verträge gefunden');
    }

    if (data.stornoquote_gesamt > 50) {
      warnings.push('Unrealistisch hohe Stornoquote');
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    };
  }

  /**
   * ==============================================
   * NEUE METHODEN FÜR HIERARCHIE-SUPPORT
   * ==============================================
   */

  /**
   * Extrahiert Vermittler-Nummer
   */
  _extractVermittlerNummer(text, fileName) {
    // Versuche aus Dateiname (z.B. "0300_0005_2025-01.pdf")
    let match = fileName.match(/(\d{4})[_\/](\d{4})/);
    if (match) return `${match[1]}/${match[2]}`;

    // Versuche aus Text
    const patterns = [
      /(?:Vermittler|Agent|Berater)[-\s]*(?:Nr|Nummer|No|#)[\s:-]*(\d{4}[\/\-]\d{4})/i,
      /(\d{4}[\/\-]\d{4})[\s]*(?:Vermittler|Agent|Berater)/i,
    ];

    for (const pattern of patterns) {
      match = text.match(pattern);
      if (match) {
        return match[1].replace('-', '/');
      }
    }

    return null;
  }

  /**
   * Extrahiert Vorgesetzten-Nummer (falls vorhanden)
   */
  _extractVorgesetzter(text) {
    const patterns = [
      /(?:Vorgesetzter|Supervisor|Teamleiter)[\s:-]*(\d{4}[\/\-]\d{4})/i,
      /(?:Untersteht|Reports to)[\s:-]*(\d{4}[\/\-]\d{4})/i,
    ];

    for (const pattern of patterns) {
      const match = text.match(pattern);
      if (match) {
        return match[1].replace('-', '/');
      }
    }

    return null;
  }

  /**
   * Extrahiert Vertrags-Details (für Compliance-Checks)
   */
  _extractVertragsDetails(text) {
    const vertraege = [];

    console.log('📄 Extrahiere Verträge aus PDF...');

    // Suche nach tabellarischen Vertrags-Einträgen
    // Format: VSNR | Kunde | Produkt | Jahresbeitrag | Provision%  | Provision€
    const lines = text.split('\n');
    console.log(`   Anzahl Zeilen: ${lines.length}`);

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      // Suche nach Versicherungsnummer-Pattern
      // Akzeptiere beide Formate: "KV-1234-5678" ODER "KV-2025-1234" ODER "V-123456"
      const vsnrMatch = line.match(/((?:KV|LV|BU|SACH|KFZ|V)-\d{4,6}(?:-\d{4,6})?)/);
      if (!vsnrMatch) continue;

      console.log(`   🔍 Gefunden: ${vsnrMatch[1]} in Zeile ${i}`);

      // Extrahiere Daten aus dieser und den nächsten Zeilen
      const vsnr = vsnrMatch[1];

      // Kunde (meist nach VSNR)
      const kundeMatch = line.match(/(?:KV|LV|BU|SACH|KFZ|V)-\d{4,6}(?:-\d{4,6})?\s+([A-ZÄÖÜa-zäöüß\s.]+?)(?:\s{2,}|€)/);
      const kunde = kundeMatch ? kundeMatch[1].trim() : 'Unbekannt';

      // Jahresbeitrag (Beträge mit Punkt als Tausender, Komma als Dezimal)
      const jahresbeitragMatch = line.match(/(\d{1,3}(?:\.\d{3})*(?:,\d{2})?)(?:\s*€|\s*EUR)/);
      const jahresbeitrag = jahresbeitragMatch ? UTILS.parseGermanNumber(jahresbeitragMatch[1]) : 0;

      // Provisionssatz (Prozent)
      const prozentMatch = line.match(/(\d{1,3}(?:,\d{1,2})?)\s*%/);
      const provision_prozent = prozentMatch ? UTILS.parseGermanNumber(prozentMatch[1]) : 0;

      // Provisions-Betrag
      const provisionMatch = line.match(/Provision[\s:]+(\d{1,3}(?:\.\d{3})*(?:,\d{2})?)/i);
      const provision_betrag = provisionMatch ? UTILS.parseGermanNumber(provisionMatch[1]) : (jahresbeitrag * provision_prozent / 100);

      // Produkt (aus VSNR ableiten oder aus Line extrahieren)
      let produkt = 'Unbekannt';
      let produkt_typ = 'UNKNOWN';

      if (vsnr.startsWith('KV')) {
        produkt = 'Krankenversicherung';
        produkt_typ = 'KV';
      } else if (vsnr.startsWith('LV')) {
        produkt = 'Lebensversicherung';
        produkt_typ = 'LV';
      } else if (vsnr.startsWith('BU')) {
        produkt = 'Berufsunfähigkeitsversicherung';
        produkt_typ = 'BU';
      } else if (vsnr.startsWith('SACH')) {
        produkt = 'Sachversicherung';
        produkt_typ = 'SACH';
      } else if (vsnr.startsWith('KFZ')) {
        produkt = 'Kfz-Versicherung';
        produkt_typ = 'KFZ';
      } else if (vsnr.startsWith('V-')) {
        // Für allgemeine Vertragsnummern ohne Typ-Präfix
        produkt = 'Versicherung';
        produkt_typ = 'UNKNOWN';
      }

      // Abschlussdatum
      const datumMatch = line.match(/(\d{1,2})\.(\d{1,2})\.(\d{4})/);
      const abschlussdatum = datumMatch ? `${datumMatch[3]}-${datumMatch[2].padStart(2, '0')}-${datumMatch[1].padStart(2, '0')}` : null;

      if (jahresbeitrag > 0 || provision_betrag > 0) {
        vertraege.push({
          vsnr,
          kunde,
          produkt,
          produkt_typ,
          jahresbeitrag,
          provision_prozent,
          provision_betrag,
          abschlussdatum
        });
      }
    }

    console.log(`✅ ${vertraege.length} Verträge extrahiert`);
    if (vertraege.length > 0) {
      console.log('   Beispiel:', vertraege[0]);
    }

    return vertraege;
  }

  /**
   * Extrahiert Stornierungen mit Details (für Clustering-Analyse)
   */
  _extractStornierungen(text) {
    const stornierungen = [];
    const lines = text.split('\n');

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      // Suche nach Storno-Markern
      if (!(line.toLowerCase().includes('storno') || line.toLowerCase().includes('kündigung'))) {
        continue;
      }

      // Extrahiere VSNR
      const vsnrMatch = line.match(/((?:KV|LV|BU|SACH|KFZ|V)-\d{4,6}(?:-\d{4,6})?)/);
      if (!vsnrMatch) continue;

      const vsnr = vsnrMatch[1];

      // Kunde
      const kundeMatch = line.match(/(?:KV|LV|BU|SACH|KFZ|V)-\d{4,6}(?:-\d{4,6})?\s+([A-ZÄÖÜa-zäöüß\s.]+?)(?:\s{2,}|\t|Storno)/i);
      const kunde = kundeMatch ? kundeMatch[1].trim() : 'Unbekannt';

      // Stornodatum
      const stornoMatch = line.match(/Storno(?:datum)?[\s:]*(\d{1,2})\.(\d{1,2})\.(\d{4})/i);
      const stornodatum = stornoMatch ? `${stornoMatch[3]}-${stornoMatch[2].padStart(2, '0')}-${stornoMatch[1].padStart(2, '0')}` : null;

      // Abschlussdatum (für Laufzeit-Berechnung)
      const abschlussMatch = line.match(/Abschluss[\s:]*(\d{1,2})\.(\d{1,2})\.(\d{4})/i);
      const abschlussdatum = abschlussMatch ? `${abschlussMatch[3]}-${abschlussMatch[2].padStart(2, '0')}-${abschlussMatch[1].padStart(2, '0')}` : null;

      // Rückforderung
      const rueckMatch = line.match(/Rückforderung[\s:]+(\d{1,3}(?:\.\d{3})*(?:,\d{2})?)/i);
      const provision_zurueck = rueckMatch ? UTILS.parseGermanNumber(rueckMatch[1]) : 0;

      stornierungen.push({
        vsnr,
        kunde,
        stornodatum,
        abschlussdatum,
        provision_zurueck
      });
    }

    return stornierungen;
  }

  /**
   * Extrahiert Superprovisionen (von Untervermittlern)
   */
  _extractSuperprovisionen(text) {
    const superprovisionen = [];
    const lines = text.split('\n');

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      // Suche nach Superprovisions-Markern
      if (!(line.toLowerCase().includes('superprovision') || line.toLowerCase().includes('differenzprovision'))) {
        continue;
      }

      // Untervermittler-Nummer
      const uvMatch = line.match(/(?:UV|Untervermittler)[\s:-]*(\d{4}[\/\-]\d{4})/i);
      const untervermittler_nummer = uvMatch ? uvMatch[1].replace('-', '/') : null;

      // Untervermittler-Name
      const nameMatch = line.match(/(?:UV|Untervermittler)[\s:-]*\d{4}[\/\-]\d{4}\s+([A-ZÄÖÜa-zäöüß\s.]+?)(?:\s{2,}|\t)/i);
      const untervermittler_name = nameMatch ? nameMatch[1].trim() : 'Unbekannt';

      // Superprovisions-Betrag
      const betragMatch = line.match(/Superprovision[\s:]+(\d{1,3}(?:\.\d{3})*(?:,\d{2})?)/i);
      const superprovision_betrag = betragMatch ? UTILS.parseGermanNumber(betragMatch[1]) : 0;

      // Superprovisions-Prozent
      const prozentMatch = line.match(/(\d{1,2}(?:,\d{1,2})?)\s*%/);
      const superprovision_prozent = prozentMatch ? UTILS.parseGermanNumber(prozentMatch[1]) : 0;

      if (untervermittler_nummer) {
        // Prüfe ob bereits vorhanden
        let existing = superprovisionen.find(sp => sp.untervermittler_nummer === untervermittler_nummer);
        if (!existing) {
          existing = {
            untervermittler_nummer,
            untervermittler_name,
            vertraege: [],
            superprovision_gesamt: 0
          };
          superprovisionen.push(existing);
        }

        // Füge Betrag hinzu
        existing.superprovision_gesamt += superprovision_betrag;

        // Versuche VSNR für diesen Eintrag zu finden
        const vsnrMatch = line.match(/((?:KV|LV|BU|SACH|KFZ|V)-\d{4,6}(?:-\d{4,6})?)/);
        if (vsnrMatch) {
          existing.vertraege.push({
            vsnr: vsnrMatch[1],
            superprovision_betrag,
            superprovision_prozent
          });
        }
      }
    }

    return superprovisionen;
  }

  /**
   * Batch-Verarbeitung mehrerer PDFs
   */
  async processBatch(files, onProgress) {
    const results = [];
    const errors = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];

      try {
        const extracted = await this.extractPdfData(file);
        const validation = this.validateExtractedData(extracted.extractedData);

        results.push({
          success: true,
          file: file,
          data: extracted,
          validation: validation,
        });

        if (onProgress) {
          onProgress({
            current: i + 1,
            total: files.length,
            fileName: file.name,
            success: true,
          });
        }

      } catch (error) {
        console.error(`Fehler bei ${file.name}:`, error);
        errors.push({
          file: file,
          error: error.message,
        });

        if (onProgress) {
          onProgress({
            current: i + 1,
            total: files.length,
            fileName: file.name,
            success: false,
            error: error.message,
          });
        }
      }
    }

    return {
      results,
      errors,
      successCount: results.length,
      errorCount: errors.length,
    };
  }
}

// Singleton-Instanz
const pdfProcessor = new PDFProcessor();
