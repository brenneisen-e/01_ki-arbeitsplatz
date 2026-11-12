/**
 * Alpha Provisionsanalyse-System - Report Generator
 * ==================================================
 * Excel, PDF und JSON Export-Funktionen
 */

class ReportGenerator {
  constructor() {
    this.XLSX = window.XLSX || null;
    this.jsPDF = window.jspdf?.jsPDF || null;
  }

  /**
   * Generiert Excel-Report
   */
  async generateExcelReport(data) {
    if (!this.XLSX) {
      throw new Error('XLSX-Bibliothek nicht geladen');
    }

    const workbook = this.XLSX.utils.book_new();

    // Sheet 1: Übersicht
    const overview = data.map(d => ({
      'Agentur-ID': d.agentur_id,
      'Agentur-Name': d.agentur_name,
      'Periode': d.periode,
      'Upload-Datum': UTILS.formatDate(d.upload_datum, 'short'),
      'Provisionssumme (€)': d.extracted_data.provisionssumme_gesamt,
      'Vertragsanzahl': d.extracted_data.vertragsanzahl_gesamt,
      'Stornoquote (%)': d.extracted_data.stornoquote_gesamt,
      'Risiko-Score': d.ki_analyse.risiko_score,
      'Risiko-Kategorie': d.ki_analyse.risiko_kategorie.toUpperCase(),
      'Anzahl Auffälligkeiten': d.ki_analyse.auffaelligkeiten.length,
      'Handlungsempfehlung': d.ki_analyse.handlungsempfehlung,
    }));

    const ws1 = this.XLSX.utils.json_to_sheet(overview);
    this._autoSizeColumns(ws1, overview);
    this.XLSX.utils.book_append_sheet(workbook, ws1, 'Übersicht');

    // Sheet 2: Detaillierte Auffälligkeiten
    const auffaelligkeiten = [];
    data.forEach(d => {
      d.ki_analyse.auffaelligkeiten.forEach(auff => {
        auffaelligkeiten.push({
          'Agentur-ID': d.agentur_id,
          'Agentur-Name': d.agentur_name,
          'Periode': d.periode,
          'Kategorie': auff.kategorie,
          'Schweregrad': auff.schweregrad.toUpperCase(),
          'Titel': auff.titel,
          'Beschreibung': auff.beschreibung,
          'Empfehlung': auff.empfehlung,
        });
      });
    });

    if (auffaelligkeiten.length > 0) {
      const ws2 = this.XLSX.utils.json_to_sheet(auffaelligkeiten);
      this._autoSizeColumns(ws2, auffaelligkeiten);
      this.XLSX.utils.book_append_sheet(workbook, ws2, 'Auffälligkeiten');
    }

    // Sheet 3: Sparten-Details
    const spartenDetails = [];
    data.forEach(d => {
      Object.keys(d.extracted_data.provisionssumme_sparten).forEach(sparte => {
        spartenDetails.push({
          'Agentur-ID': d.agentur_id,
          'Periode': d.periode,
          'Sparte': sparte.charAt(0).toUpperCase() + sparte.slice(1),
          'Provision (€)': d.extracted_data.provisionssumme_sparten[sparte],
          'Verträge': d.extracted_data.vertragsanzahl_sparten[sparte] || 0,
          'Stornoquote (%)': d.extracted_data.stornoquote_sparten[sparte] || 0,
        });
      });
    });

    const ws3 = this.XLSX.utils.json_to_sheet(spartenDetails);
    this._autoSizeColumns(ws3, spartenDetails);
    this.XLSX.utils.book_append_sheet(workbook, ws3, 'Sparten-Details');

    // Datei speichern
    const fileName = `Alpha_Provisionsanalyse_${new Date().toISOString().split('T')[0]}.xlsx`;
    this.XLSX.writeFile(workbook, fileName);

    return fileName;
  }

  /**
   * Auto-Size für Excel-Spalten
   */
  _autoSizeColumns(worksheet, data) {
    if (!data || data.length === 0) return;

    const keys = Object.keys(data[0]);
    const colWidths = keys.map(key => {
      const maxLength = Math.max(
        key.length,
        ...data.map(row => String(row[key] || '').length)
      );
      return { wch: Math.min(maxLength + 2, 50) };
    });

    worksheet['!cols'] = colWidths;
  }

  /**
   * Generiert PDF-Report
   */
  async generatePDFReport(analysisData) {
    if (!this.jsPDF) {
      throw new Error('jsPDF-Bibliothek nicht geladen');
    }

    const doc = new this.jsPDF();
    let y = 20;

    // Header
    doc.setFontSize(20);
    doc.setTextColor(0, 51, 102); // Alpha Dunkelblau
    doc.text('Alpha Provisionsanalyse', 20, y);

    y += 10;
    doc.setFontSize(12);
    doc.setTextColor(100, 100, 100);
    doc.text(`Bericht vom ${UTILS.formatDate(new Date(), 'long')}`, 20, y);

    y += 15;

    // Executive Summary
    doc.setFontSize(14);
    doc.setTextColor(0, 0, 0);
    doc.text('Executive Summary', 20, y);

    y += 8;
    doc.setFontSize(10);

    const summary = [
      `Analysierte Abrechnungen: ${analysisData.length}`,
      `Auffälligkeiten gesamt: ${analysisData.reduce((sum, d) => sum + d.ki_analyse.auffaelligkeiten.length, 0)}`,
      `Kritische Fälle (Rot): ${analysisData.filter(d => d.ki_analyse.risiko_score >= 4).length}`,
      `Auffällige Fälle (Orange): ${analysisData.filter(d => d.ki_analyse.risiko_score === 3).length}`,
      `Zur Beobachtung (Gelb): ${analysisData.filter(d => d.ki_analyse.risiko_score === 2).length}`,
      `Unauffällig (Grün): ${analysisData.filter(d => d.ki_analyse.risiko_score <= 1).length}`,
    ];

    summary.forEach(line => {
      doc.text(line, 25, y);
      y += 6;
    });

    // Details für jede Agentur
    analysisData.forEach((data, index) => {
      if (y > 250 || index > 0) {
        doc.addPage();
        y = 20;
      }

      doc.setFontSize(16);
      doc.setTextColor(0, 51, 102);
      doc.text(`${data.agentur_id} - ${data.agentur_name}`, 20, y);

      y += 10;
      doc.setFontSize(10);
      doc.setTextColor(0, 0, 0);

      doc.text(`Periode: ${data.periode}`, 20, y);
      y += 6;
      doc.text(`Risiko-Score: ${data.ki_analyse.risiko_score}/5 (${data.ki_analyse.risiko_kategorie.toUpperCase()})`, 20, y);
      y += 6;
      doc.text(`Provisionssumme: ${UTILS.formatCurrency(data.extracted_data.provisionssumme_gesamt)}`, 20, y);
      y += 6;
      doc.text(`Verträge: ${data.extracted_data.vertragsanzahl_gesamt}`, 20, y);

      y += 10;

      // Zusammenfassung
      doc.setFontSize(11);
      doc.setFont(undefined, 'bold');
      doc.text('Zusammenfassung:', 20, y);
      y += 6;
      doc.setFont(undefined, 'normal');
      doc.setFontSize(10);

      const summaryLines = doc.splitTextToSize(data.ki_analyse.zusammenfassung, 170);
      summaryLines.forEach(line => {
        if (y > 280) {
          doc.addPage();
          y = 20;
        }
        doc.text(line, 25, y);
        y += 5;
      });

      y += 5;

      // Auffälligkeiten
      if (data.ki_analyse.auffaelligkeiten.length > 0) {
        doc.setFontSize(11);
        doc.setFont(undefined, 'bold');
        doc.text('Auffälligkeiten:', 20, y);
        y += 6;
        doc.setFont(undefined, 'normal');
        doc.setFontSize(10);

        data.ki_analyse.auffaelligkeiten.forEach((auff, i) => {
          if (y > 250) {
            doc.addPage();
            y = 20;
          }

          doc.text(`${i + 1}. ${auff.titel} (${auff.schweregrad})`, 25, y);
          y += 5;

          const beschreibungLines = doc.splitTextToSize(auff.beschreibung, 160);
          beschreibungLines.forEach(line => {
            if (y > 280) {
              doc.addPage();
              y = 20;
            }
            doc.text(line, 30, y);
            y += 4;
          });

          y += 3;
        });
      } else {
        doc.text('Keine Auffälligkeiten', 25, y);
        y += 6;
      }

      y += 10;
    });

    // Footer auf jeder Seite
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(150, 150, 150);
      doc.text(
        `Seite ${i} von ${pageCount} | Alpha Provisionsanalyse-System`,
        doc.internal.pageSize.width / 2,
        doc.internal.pageSize.height - 10,
        { align: 'center' }
      );
    }

    // Datei speichern
    const fileName = `Alpha_Analyse_${new Date().toISOString().split('T')[0]}.pdf`;
    doc.save(fileName);

    return fileName;
  }

  /**
   * Generiert JSON-Export
   */
  generateJSONExport(data) {
    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = `Alpha_Daten_${new Date().toISOString().split('T')[0]}.json`;
    a.click();

    URL.revokeObjectURL(url);

    return a.download;
  }

  /**
   * Exportiert einzelne Analyse als JSON
   */
  exportSingleAnalysisJSON(analysis) {
    const json = JSON.stringify(analysis, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = `Analyse_${analysis.agentur_id}_${analysis.periode}.json`;
    a.click();

    URL.revokeObjectURL(url);

    return a.download;
  }

  /**
   * Importiert JSON-Daten
   */
  async importJSON(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = async (e) => {
        try {
          const jsonData = JSON.parse(e.target.result);
          resolve(jsonData);
        } catch (error) {
          reject(new Error('Ungültiges JSON-Format'));
        }
      };

      reader.onerror = () => {
        reject(new Error('Fehler beim Lesen der Datei'));
      };

      reader.readAsText(file);
    });
  }
}

// Singleton-Instanz
const reportGenerator = new ReportGenerator();
