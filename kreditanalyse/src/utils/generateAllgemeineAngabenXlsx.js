/**
 * generateAllgemeineAngabenXlsx.js
 *
 * Erzeugt aus einem erkannten Demo-Datensatz (siehe kontoanlageDemo.js) ein
 * ausgefülltes Excel-Arbeitsblatt "Allgemeine Angaben" – nachempfunden dem
 * gleichnamigen Blatt der Vorlage "Template Kreditkontoneuanlage.xlsm".
 *
 * Bewusst als eigenständige, sauber formatierte .xlsx erzeugt (nicht die
 * makro-/passwortgeschützte Originalvorlage überschrieben), damit die
 * Demostrecke robust und ohne VBA-Abhängigkeit funktioniert.
 */

import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import { ALLGEMEINE_ANGABEN_SECTIONS, FIELD_LABELS } from '../data/kontoanlageDemo';

const NAVY = 'FF14304A';
const NAVY_LIGHT = 'FF2D3F6E';
const GREY_BG = 'FFEEF1F6';
const BORDER = 'FFD0D7E2';

const KONFIDENZ_TEXT = {
  hoch: 'Aus Vertrag',
  mittel: 'Abgeleitet',
  manuell: 'Kundenstamm / prüfen',
};

function thinBorder() {
  const side = { style: 'thin', color: { argb: BORDER } };
  return { top: side, left: side, bottom: side, right: side };
}

export async function generateAllgemeineAngabenXlsx(dataset) {
  const wb = new ExcelJS.Workbook();
  wb.creator = 'KI-Kreditanalyse';
  wb.created = new Date();

  const ws = wb.addWorksheet('Allgemeine Angaben', {
    views: [{ showGridLines: false }],
  });

  // Spaltenbreiten: B = Feld, D = Wert, F = Quelle/Hinweis
  ws.getColumn(1).width = 2.5;
  ws.getColumn(2).width = 40;
  ws.getColumn(3).width = 2.5;
  ws.getColumn(4).width = 52;
  ws.getColumn(5).width = 2.5;
  ws.getColumn(6).width = 60;

  // Titelzeile
  ws.mergeCells('B1:F1');
  const title = ws.getCell('B1');
  title.value = 'Kreditkontoneuanlage – Allgemeine Angaben';
  title.font = { bold: true, size: 16, color: { argb: NAVY } };
  ws.getRow(1).height = 26;

  // Kontextzeile
  ws.mergeCells('B2:F2');
  const sub = ws.getCell('B2');
  const dat = new Date().toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' });
  sub.value = `Kreditnehmer: ${dataset.kreditnehmer}  ·  Vertragstyp: ${dataset.vertragstyp}  ·  Vorbelegung erstellt am ${dat}`;
  sub.font = { size: 10, color: { argb: 'FF566074' } };
  ws.getRow(2).height = 18;

  let r = 4;
  // Kopfzeile der Tabelle
  const head = ws.getRow(r);
  head.getCell(2).value = 'Feld';
  head.getCell(4).value = 'Wert';
  head.getCell(6).value = 'Quelle / Hinweis';
  [2, 4, 6].forEach((c) => {
    const cell = head.getCell(c);
    cell.font = { bold: true, size: 10, color: { argb: 'FFFFFFFF' } };
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: NAVY_LIGHT } };
    cell.alignment = { vertical: 'middle' };
    cell.border = thinBorder();
  });
  head.height = 20;
  r += 1;

  for (const section of ALLGEMEINE_ANGABEN_SECTIONS) {
    // Abschnittsüberschrift
    ws.mergeCells(`B${r}:F${r}`);
    const sec = ws.getCell(`B${r}`);
    sec.value = section.title;
    sec.font = { bold: true, size: 11, color: { argb: NAVY } };
    sec.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: GREY_BG } };
    ws.getRow(r).height = 18;
    r += 1;

    for (const key of section.fields) {
      const field = dataset.felder[key];
      if (!field) continue;
      const row = ws.getRow(r);

      const labelCell = row.getCell(2);
      labelCell.value = FIELD_LABELS[key] || key;
      labelCell.font = { size: 10, color: { argb: 'FF333A47' } };
      labelCell.alignment = { vertical: 'top', wrapText: true };
      labelCell.border = thinBorder();

      const valueCell = row.getCell(4);
      valueCell.value = field.wert;
      valueCell.font = { size: 10, bold: field.konfidenz === 'hoch', color: { argb: NAVY } };
      valueCell.alignment = { vertical: 'top', wrapText: true };
      valueCell.border = thinBorder();

      const srcCell = row.getCell(6);
      const tag = KONFIDENZ_TEXT[field.konfidenz] || '';
      srcCell.value = `[${tag}] ${field.quelle}`;
      srcCell.font = { size: 9, italic: true, color: { argb: 'FF6B7280' } };
      srcCell.alignment = { vertical: 'top', wrapText: true };
      srcCell.border = thinBorder();

      r += 1;
    }
  }

  // Fußnote
  r += 1;
  ws.mergeCells(`B${r}:F${r}`);
  const foot = ws.getCell(`B${r}`);
  foot.value = 'Automatisch vorbefüllt durch KI-Kreditanalyse (Demo). Mit „Kundenstamm / prüfen" markierte Felder sind fachlich zu bestätigen, bevor die Anlage in SAP S/4HANA bzw. der Originalvorlage erfolgt.';
  foot.font = { size: 8, italic: true, color: { argb: 'FF94A3B8' } };
  foot.alignment = { wrapText: true };
  ws.getRow(r).height = 28;

  const buffer = await wb.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });
  const safeName = (dataset.kreditnehmer || 'Kreditnehmer').replace(/[^a-zA-Z0-9]+/g, '_');
  saveAs(blob, `Kreditkontoneuanlage_Allgemeine_Angaben_${safeName}.xlsx`);
}
