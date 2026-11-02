// =============================================================================
// Demo PDF Generator – Creates sample Bilanz, GuV, BWA PDFs
// for Müller Maschinenbau GmbH using jsPDF
// =============================================================================

import { jsPDF } from 'jspdf';

const fmt = new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR', minimumFractionDigits: 0 });
const f = (v) => fmt.format(v);

function addHeader(doc, title, subtitle) {
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.text(title, 105, 25, { align: 'center' });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.text(subtitle, 105, 33, { align: 'center' });
  doc.setDrawColor(0);
  doc.setLineWidth(0.5);
  doc.line(20, 37, 190, 37);
}

function addCompanyBlock(doc, y) {
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text('Müller Maschinenbau GmbH', 20, y);
  doc.text('Industriestr. 42, 51149 Köln', 20, y + 5);
  doc.text('HRB 54321 · Amtsgericht Köln · Steuernr. DE123456789', 20, y + 10);
  return y + 18;
}

function addTableRow(doc, y, label, v2023, v2022, v2021, opts = {}) {
  const { bold, indent, separator } = opts;
  if (separator) {
    doc.setDrawColor(180);
    doc.setLineWidth(0.3);
    doc.line(20, y - 1, 190, y - 1);
  }
  doc.setFont('helvetica', bold ? 'bold' : 'normal');
  doc.setFontSize(9);
  const x = indent ? 28 : 20;
  doc.text(label, x, y);
  doc.text(f(v2023), 110, y, { align: 'right' });
  doc.text(f(v2022), 145, y, { align: 'right' });
  doc.text(f(v2021), 180, y, { align: 'right' });
  return y + 6;
}

function addYearHeaders(doc, y) {
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.text('Position', 20, y);
  doc.text('2023', 110, y, { align: 'right' });
  doc.text('2022', 145, y, { align: 'right' });
  doc.text('2021', 180, y, { align: 'right' });
  doc.setDrawColor(0);
  doc.setLineWidth(0.5);
  doc.line(20, y + 2, 190, y + 2);
  return y + 8;
}

/**
 * Generate a demo Bilanz (Balance Sheet) PDF
 */
export function generateBilanzPdf() {
  const doc = new jsPDF();
  addHeader(doc, 'Jahresabschluss – Bilanz', 'Müller Maschinenbau GmbH · Geschäftsjahre 2021–2023');
  let y = addCompanyBlock(doc, 44);

  // AKTIVA
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text('AKTIVA', 20, y);
  y += 8;
  y = addYearHeaders(doc, y);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.text('A. Anlagevermögen', 20, y); y += 6;
  y = addTableRow(doc, y, 'I. Immaterielle Vermögensgegenstände', 45000, 52000, 60000, { indent: true });
  y = addTableRow(doc, y, 'II. Sachanlagen', 2230000, 2060000, 1960000, { indent: true });
  y = addTableRow(doc, y, 'III. Finanzanlagen', 205000, 198000, 200000, { indent: true });
  y = addTableRow(doc, y, 'Summe Anlagevermögen', 2480000, 2310000, 2220000, { bold: true, separator: true });
  y += 2;

  doc.setFont('helvetica', 'bold');
  doc.text('B. Umlaufvermögen', 20, y); y += 6;
  y = addTableRow(doc, y, 'I. Vorräte', 980000, 920000, 850000, { indent: true });
  y = addTableRow(doc, y, 'II. Forderungen', 1250000, 1180000, 1100000, { indent: true });
  y = addTableRow(doc, y, 'III. Liquide Mittel', 420000, 370000, 350000, { indent: true });
  y = addTableRow(doc, y, 'Summe Umlaufvermögen', 2650000, 2470000, 2300000, { bold: true, separator: true });
  y += 2;
  y = addTableRow(doc, y, 'SUMME AKTIVA', 5130000, 4780000, 4520000, { bold: true, separator: true });
  y += 8;

  // PASSIVA
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text('PASSIVA', 20, y);
  y += 8;
  y = addYearHeaders(doc, y);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.text('A. Eigenkapital', 20, y); y += 6;
  y = addTableRow(doc, y, 'Gezeichnetes Kapital + Rücklagen', 1650000, 1380000, 1150000, { indent: true });
  y += 2;

  doc.setFont('helvetica', 'bold');
  doc.text('B. Rückstellungen', 20, y); y += 6;
  y = addTableRow(doc, y, 'Sonstige Rückstellungen', 280000, 260000, 240000, { indent: true });
  y += 2;

  doc.setFont('helvetica', 'bold');
  doc.text('C. Verbindlichkeiten', 20, y); y += 6;
  y = addTableRow(doc, y, 'Kurzfristige Verbindlichkeiten', 1400000, 1350000, 1280000, { indent: true });
  y = addTableRow(doc, y, 'Langfristige Verbindlichkeiten', 1800000, 1790000, 1850000, { indent: true });
  y = addTableRow(doc, y, 'Summe Verbindlichkeiten', 3200000, 3140000, 3130000, { bold: true, separator: true });
  y += 2;
  y = addTableRow(doc, y, 'SUMME PASSIVA', 5130000, 4780000, 4520000, { bold: true, separator: true });

  // Footer
  y += 12;
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(8);
  doc.text('Erstellt am: 15.03.2024 · Wirtschaftsprüfungsgesellschaft Berger & Partner, Köln', 20, y);

  doc.save('Bilanz_Mueller_Maschinenbau_2021-2023.pdf');
}

/**
 * Generate a demo GuV (Income Statement) PDF
 */
export function generateGuvPdf() {
  const doc = new jsPDF();
  addHeader(doc, 'Gewinn- und Verlustrechnung', 'Müller Maschinenbau GmbH · Geschäftsjahre 2021–2023');
  let y = addCompanyBlock(doc, 44);

  y = addYearHeaders(doc, y);

  y = addTableRow(doc, y, '1. Umsatzerlöse', 12500000, 11800000, 10200000, { bold: true });
  y = addTableRow(doc, y, '2. Sonstige betriebliche Erträge', 500000, 430000, 380000);
  y = addTableRow(doc, y, 'Gesamtleistung', 13000000, 12230000, 10580000, { bold: true, separator: true });
  y += 2;
  y = addTableRow(doc, y, '3. Materialaufwand', -5800000, -5520000, -4900000);
  y = addTableRow(doc, y, '4. Personalaufwand', -3200000, -3050000, -2850000);
  y = addTableRow(doc, y, '5. Abschreibungen', -380000, -350000, -320000);
  y = addTableRow(doc, y, '6. Sonstige betriebl. Aufwendungen', -1870000, -1800000, -1600000);
  y += 2;
  y = addTableRow(doc, y, 'Betriebsergebnis (EBIT)', 1750000, 1510000, 910000, { bold: true, separator: true });
  y += 2;
  y = addTableRow(doc, y, '7. Zinsaufwand', -95000, -82000, -78000);
  y = addTableRow(doc, y, 'Ergebnis vor Steuern (EBT)', 1655000, 1428000, 832000, { bold: true, separator: true });
  y += 2;
  y = addTableRow(doc, y, '8. Steuern vom Einkommen und Ertrag', -170000, -128000, -82000);
  y += 2;
  y = addTableRow(doc, y, 'Jahresüberschuss', 485000, 370000, 230000, { bold: true, separator: true });

  // Key ratios
  y += 12;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text('Kennzahlen', 20, y);
  y += 7;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  const rows = [
    ['Umsatzrendite', '3,9%', '3,1%', '2,3%'],
    ['EBIT-Marge', '14,0%', '12,8%', '8,9%'],
    ['Materialquote', '46,4%', '46,8%', '48,0%'],
    ['Personalquote', '25,6%', '25,8%', '27,9%'],
  ];
  rows.forEach(([label, v1, v2, v3]) => {
    doc.text(label, 20, y);
    doc.text(v1, 110, y, { align: 'right' });
    doc.text(v2, 145, y, { align: 'right' });
    doc.text(v3, 180, y, { align: 'right' });
    y += 5;
  });

  y += 8;
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(8);
  doc.text('Erstellt am: 15.03.2024 · Wirtschaftsprüfungsgesellschaft Berger & Partner, Köln', 20, y);

  doc.save('GuV_Mueller_Maschinenbau_2021-2023.pdf');
}

/**
 * Generate a demo BWA (Betriebswirtschaftliche Auswertung) PDF
 */
export function generateBwaPdf() {
  const doc = new jsPDF();
  addHeader(doc, 'Betriebswirtschaftliche Auswertung (BWA)', 'Müller Maschinenbau GmbH · Dezember 2023 (kumuliert)');
  let y = addCompanyBlock(doc, 44);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.text('Position', 20, y);
  doc.text('Monat 12/2023', 110, y, { align: 'right' });
  doc.text('kum. 2023', 150, y, { align: 'right' });
  doc.text('Vorjahr kum.', 185, y, { align: 'right' });
  doc.setLineWidth(0.5);
  doc.line(20, y + 2, 190, y + 2);
  y += 8;

  const bwaRow = (label, m, cum, prev, opts = {}) => {
    if (opts.separator) {
      doc.setDrawColor(180);
      doc.setLineWidth(0.3);
      doc.line(20, y - 1, 190, y - 1);
    }
    doc.setFont('helvetica', opts.bold ? 'bold' : 'normal');
    doc.text(opts.indent ? '   ' + label : label, 20, y);
    doc.text(f(m), 110, y, { align: 'right' });
    doc.text(f(cum), 150, y, { align: 'right' });
    doc.text(f(prev), 185, y, { align: 'right' });
    y += 6;
  };

  bwaRow('Umsatzerlöse', 1125000, 12500000, 11800000, { bold: true });
  bwaRow('Sonstige Erträge', 42000, 500000, 430000);
  bwaRow('Gesamtleistung', 1167000, 13000000, 12230000, { bold: true, separator: true });
  y += 2;
  bwaRow('Wareneinsatz / Material', -520000, -5800000, -5520000);
  bwaRow('Rohertrag', 647000, 7200000, 6710000, { bold: true, separator: true });
  y += 2;
  bwaRow('Personalkosten', -275000, -3200000, -3050000);
  bwaRow('Raumkosten', -18000, -210000, -195000, { indent: true });
  bwaRow('Versicherungen', -4500, -52000, -48000, { indent: true });
  bwaRow('Kfz-Kosten', -8200, -95000, -88000, { indent: true });
  bwaRow('Werbekosten', -12000, -140000, -125000, { indent: true });
  bwaRow('Sonstige Kosten', -115000, -1373000, -1344000, { indent: true });
  bwaRow('Abschreibungen', -33000, -380000, -350000);
  y += 2;
  bwaRow('Betriebsergebnis', 181300, 1750000, 1510000, { bold: true, separator: true });
  y += 2;
  bwaRow('Zinsen und Finanzierungskosten', -8200, -95000, -82000);
  bwaRow('Ergebnis vor Steuern', 173100, 1655000, 1428000, { bold: true, separator: true });
  bwaRow('Steuern', -14500, -170000, -128000);
  y += 2;
  bwaRow('Vorläufiges Ergebnis', 158600, 485000, 370000, { bold: true, separator: true });

  y += 10;
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(8);
  doc.text('DATEV-BWA · Erstellt am: 18.01.2024 · Steuerberater Dr. Schmidt, Köln', 20, y);

  doc.save('BWA_Mueller_Maschinenbau_12-2023.pdf');
}

/**
 * Simulated AI extraction result for demo purposes.
 * Returns extracted data as if AI analyzed the uploaded documents.
 */
export const DEMO_EXTRACTION_RESULT = {
  firma: 'Müller Maschinenbau GmbH',
  rechtsform: 'GmbH',
  branche: 'Maschinenbau',
  gruendung: '1998',
  strasse: 'Industriestr. 42',
  plz: '51149',
  ort: 'Köln',
  mitarbeiter: '85',
  ansprechpartner: 'Thomas Müller',
  position: 'Geschäftsführer',
  email: 't.mueller@mueller-maschinenbau.de',
  telefon: '+49 221 9876543',
  kreditArt: 'Investitionskredit',
  betrag: 1500000,
  laufzeit: '84',
  verwendungKategorie: 'Maschine/Anlage',
  verwendung: 'Anschaffung eines neuen CNC-Bearbeitungszentrums (DMG MORI NHX 5000) zur Erweiterung der Produktionskapazität sowie Modernisierung der bestehenden Fertigungslinie.',
  sicherheiten: 'Grundschuld auf Betriebsgelände Köln-Porz (Marktwert ca. 1,8 Mio. EUR), Sicherungsübereignung der zu finanzierenden Maschine, Globalzession der Forderungen',
  // Extracted financial summary for display
  financialSummary: {
    umsatz2023: 12500000,
    umsatz2022: 11800000,
    umsatz2021: 10200000,
    jahresueberschuss2023: 485000,
    eigenkapital2023: 1650000,
    bilanzsumme2023: 5130000,
    eigenkapitalquote: '32,2%',
    umsatzrendite: '3,9%',
  },
};
