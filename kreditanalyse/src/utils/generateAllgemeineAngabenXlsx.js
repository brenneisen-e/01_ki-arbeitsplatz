/**
 * generateAllgemeineAngabenXlsx.js
 *
 * Befüllt die ORIGINALVORLAGE "Template Kreditkontoneuanlage.xlsm" mit den
 * aus dem Vertrag extrahierten Werten und stellt sie zum Download bereit.
 *
 * Vorgehen:
 *   1. Originalvorlage (als App-Asset gebündelt) laden.
 *   2. Im Blatt "Allgemeine Angaben" die Zielzeile je Feld anhand der
 *      Beschriftung in Spalte B finden und den Wert in Spalte D eintragen
 *      (Betrag/Währung gesondert in Spalte D bzw. E der Zeile
 *      "Kreditbetrag und Währung").
 *   3. Datei zum Download geben – alle übrigen Blätter, das Layout und die
 *      Formatierung der Vorlage bleiben erhalten.
 *
 * Hinweis: Ausgabe als .xlsx. Etwaige VBA-Makros der .xlsm-Vorlage werden
 * dabei nicht übernommen; alle Tabellenblätter, Beschriftungen, Listen und
 * Formatierungen bleiben jedoch erhalten.
 */

import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import templateUrl from '../assets/template-kreditkontoneuanlage.xlsm?url';
import {
  TEMPLATE_FIELD_LABELS,
  TEMPLATE_BETRAG_LABEL,
} from '../data/kontoanlageDemo';

const SHEET_NAME = 'Allgemeine Angaben';

// Beschriftung normalisieren (Whitespace zusammenfassen, lowercase), damit
// "Vergabeart KR " und "Vergabeart KR" identisch matchen.
function norm(value) {
  if (value == null) return '';
  // exceljs liefert ggf. Rich-Text-Objekte – auf Klartext reduzieren.
  const text = typeof value === 'object' && value.richText
    ? value.richText.map((r) => r.text).join('')
    : String(value);
  return text.replace(/\s+/g, ' ').trim().toLowerCase();
}

export async function generateAllgemeineAngabenXlsx(dataset) {
  // Originalvorlage laden
  const res = await fetch(templateUrl);
  if (!res.ok) throw new Error(`Vorlage konnte nicht geladen werden (HTTP ${res.status}).`);
  const arrayBuffer = await res.arrayBuffer();

  const wb = new ExcelJS.Workbook();
  await wb.xlsx.load(arrayBuffer);

  const ws = wb.getWorksheet(SHEET_NAME);
  if (!ws) throw new Error(`Blatt "${SHEET_NAME}" nicht in der Vorlage gefunden.`);

  // Beschriftung (Spalte B) -> erste passende Zeilennummer
  const labelToRow = new Map();
  let betragRow = null;
  const maxRow = Math.min(ws.rowCount || 160, 200);
  for (let r = 1; r <= maxRow; r++) {
    const label = norm(ws.getCell(`B${r}`).value);
    if (!label) continue;
    if (!labelToRow.has(label)) labelToRow.set(label, r);
    if (betragRow == null && label === norm(TEMPLATE_BETRAG_LABEL)) betragRow = r;
  }

  const felder = dataset.felder || {};
  let geschrieben = 0;

  // Betrag + Währung in der Zeile "Kreditbetrag und Währung"
  if (betragRow != null) {
    if (felder.kreditbetrag?.wert) {
      ws.getCell(`D${betragRow}`).value = felder.kreditbetrag.wert;
      geschrieben += 1;
    }
    if (felder.waehrung?.wert) {
      ws.getCell(`E${betragRow}`).value = felder.waehrung.wert;
      geschrieben += 1;
    }
  }

  // Übrige gemappte Felder: Wert in Spalte D der passenden Zeile
  for (const [key, templateLabel] of Object.entries(TEMPLATE_FIELD_LABELS)) {
    const field = felder[key];
    if (!field?.wert) continue;
    const row = labelToRow.get(norm(templateLabel));
    if (!row) continue;
    ws.getCell(`D${row}`).value = field.wert;
    geschrieben += 1;
  }

  // Datei ausgeben
  const buffer = await wb.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });
  const safeName = (dataset.kreditnehmer || 'Kreditnehmer').replace(/[^a-zA-Z0-9]+/g, '_');
  saveAs(blob, `Kreditkontoneuanlage_${safeName}.xlsx`);

  return geschrieben;
}
