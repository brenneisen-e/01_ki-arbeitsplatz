// Erzeugt eine kleine Demo-Rechnung, damit das Modul ohne eigene Datei
// ausprobiert werden kann.
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';

export async function buildDemoPdf(options = {}) {
  const nummer = options.nummer || 'RE-2026-00418';
  const datum = options.datum || '25.08.2026';
  const faellig = options.faellig || '08.09.2026';
  const empfaenger = options.empfaenger || ['Eike Brenneisen', 'Brenneisen Consulting', 'Hauptstraße 1', '50667 Köln', 'Deutschland'];
  const doc = await PDFDocument.create();
  doc.setTitle('Demo-Rechnung');
  const helv = await doc.embedFont(StandardFonts.Helvetica);
  const bold = await doc.embedFont(StandardFonts.HelveticaBold);
  const times = await doc.embedFont(StandardFonts.TimesRoman);

  const page = doc.addPage([595.28, 841.89]);
  const navy = rgb(0.047, 0.137, 0.25);
  const slate = rgb(0.28, 0.33, 0.41);
  const black = rgb(0.06, 0.09, 0.16);

  page.drawRectangle({ x: 0, y: 741.89, width: 595.28, height: 100, color: navy });
  page.drawText('Rechnung', { x: 48, y: 785, size: 26, font: bold, color: rgb(1, 1, 1) });
  page.drawText('Musterfirma GmbH · Schirmerstraße 18 · 50823 Köln', { x: 48, y: 762, size: 10, font: helv, color: rgb(0.8, 0.86, 0.95) });

  const rows = [
    ['Rechnungsnummer', nummer],
    ['Rechnungsdatum', datum],
    ['Fällig am', faellig],
    ['USt-IdNr.', 'DE 123 456 789'],
  ];
  rows.forEach(([k, v], i) => {
    page.drawText(k, { x: 48, y: 700 - i * 18, size: 11, font: bold, color: black });
    page.drawText(v, { x: 180, y: 700 - i * 18, size: 11, font: helv, color: black });
  });

  page.drawText('Rechnungsempfänger', { x: 340, y: 700, size: 11, font: bold, color: black });
  empfaenger.forEach((l, i) => {
    page.drawText(l, { x: 340, y: 682 - i * 15, size: 11, font: helv, color: black });
  });

  // Positionstabelle
  const top = 580;
  page.drawLine({ start: { x: 48, y: top + 16 }, end: { x: 547, y: top + 16 }, thickness: 0.8, color: slate });
  page.drawText('Pos.', { x: 48, y: top, size: 10, font: bold, color: slate });
  page.drawText('Beschreibung', { x: 90, y: top, size: 10, font: bold, color: slate });
  page.drawText('Menge', { x: 380, y: top, size: 10, font: bold, color: slate });
  page.drawText('Einzelpreis', { x: 430, y: top, size: 10, font: bold, color: slate });
  page.drawText('Betrag', { x: 505, y: top, size: 10, font: bold, color: slate });
  page.drawLine({ start: { x: 48, y: top - 8 }, end: { x: 547, y: top - 8 }, thickness: 0.5, color: slate });
  const items = [
    ['1', 'KI-Arbeitsplatz Lizenz (Monat August)', '1', '1.200,00 €', '1.200,00 €'],
    ['2', 'Workshop „Bank der Zukunft“ (2 Tage)', '2', '1.850,00 €', '3.700,00 €'],
    ['3', 'Reisekosten Köln – Frankfurt', '1', '148,50 €', '148,50 €'],
  ];
  items.forEach((cols, i) => {
    const y = top - 30 - i * 20;
    page.drawText(cols[0], { x: 48, y, size: 10.5, font: helv, color: black });
    page.drawText(cols[1], { x: 90, y, size: 10.5, font: helv, color: black });
    page.drawText(cols[2], { x: 392, y, size: 10.5, font: helv, color: black });
    page.drawText(cols[3], { x: 430, y, size: 10.5, font: helv, color: black });
    page.drawText(cols[4], { x: 495, y, size: 10.5, font: helv, color: black });
  });
  const sumY = top - 30 - items.length * 20 - 14;
  page.drawLine({ start: { x: 380, y: sumY + 22 }, end: { x: 547, y: sumY + 22 }, thickness: 0.5, color: slate });
  page.drawText('Nettobetrag', { x: 380, y: sumY, size: 10.5, font: helv, color: black });
  page.drawText('5.048,50 €', { x: 492, y: sumY, size: 10.5, font: helv, color: black });
  page.drawText('19 % USt.', { x: 380, y: sumY - 18, size: 10.5, font: helv, color: black });
  page.drawText('959,22 €', { x: 500, y: sumY - 18, size: 10.5, font: helv, color: black });
  page.drawText('Gesamtbetrag', { x: 380, y: sumY - 42, size: 13, font: bold, color: black });
  page.drawText('6.007,72 €', { x: 480, y: sumY - 42, size: 13, font: bold, color: black });

  page.drawText(`6.007,72 € fällig bis ${faellig}`, { x: 48, y: 340, size: 20, font: bold, color: black });
  const note = [
    'Vielen Dank für Ihren Auftrag. Bitte überweisen Sie den Gesamtbetrag unter Angabe der',
    'Rechnungsnummer auf das unten genannte Konto. Bei Rückfragen erreichen Sie uns werktags',
    'zwischen 9 und 17 Uhr telefonisch oder per E-Mail.',
  ];
  note.forEach((l, i) => page.drawText(l, { x: 48, y: 300 - i * 15, size: 11, font: times, color: black }));

  page.drawLine({ start: { x: 48, y: 96 }, end: { x: 547, y: 96 }, thickness: 0.5, color: slate });
  page.drawText('Musterfirma GmbH · Geschäftsführung: Eike Brenneisen · Amtsgericht Köln HRB 12345', { x: 48, y: 80, size: 8.5, font: helv, color: slate });
  page.drawText('IBAN DE12 3456 7890 1234 5678 90 · BIC COLSDE33 · rechnung@musterfirma.de', { x: 48, y: 68, size: 8.5, font: helv, color: slate });

  return doc.save();
}
