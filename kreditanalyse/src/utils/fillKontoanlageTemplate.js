/**
 * fillKontoanlageTemplate.js
 *
 * Befüllt die Originalvorlage "Template Kreditkontoneuanlage.xlsm" und erhält
 * dabei ALLES (alle Blätter, Formatierung, Dropdown-Listen UND die VBA-Makros).
 *
 * Dazu wird die .xlsm als ZIP geöffnet (fflate) und ausschließlich das Blatt
 * "Allgemeine Angaben" (dessen sheetN.xml) bearbeitet: in den Ziel-Zeilen wird
 * der Wert in Spalte D (bzw. E für die Währung) als Inline-String gesetzt; der
 * vorhandene Zell-Style (s="…") bleibt erhalten. Anschließend wird das Archiv
 * unverändert um genau diese eine Datei neu gepackt – die Makro-Binärdatei
 * vbaProject.bin und [Content_Types].xml bleiben unangetastet, sodass das
 * Ergebnis eine gültige, makrofähige .xlsm ist.
 *
 * Diese Datei enthält bewusst KEINE Browser-spezifischen Imports (fetch/?url),
 * damit die Logik isoliert (auch in Node) getestet werden kann.
 */

import { unzipSync, zipSync, strToU8, strFromU8 } from 'fflate';
import { TEMPLATE_FIELD_LABELS, TEMPLATE_BETRAG_LABEL } from '../data/kontoanlageDemo.js';

const SHEET_NAME = 'Allgemeine Angaben';

function xmlUnescape(s) {
  return String(s)
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&#10;/g, '\n')
    .replace(/&amp;/g, '&');
}

function xmlEscape(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function norm(s) {
  return String(s ?? '').replace(/\s+/g, ' ').trim().toLowerCase();
}

function colToNum(col) {
  let n = 0;
  for (let i = 0; i < col.length; i++) n = n * 26 + (col.charCodeAt(i) - 64);
  return n;
}

function parseSharedStrings(xml) {
  const arr = [];
  if (!xml) return arr;
  const reSi = /<si>([\s\S]*?)<\/si>/g;
  let m;
  while ((m = reSi.exec(xml))) {
    const parts = [...m[1].matchAll(/<t[^>]*>([\s\S]*?)<\/t>/g)].map((x) => xmlUnescape(x[1]));
    arr.push(parts.join(''));
  }
  return arr;
}

// Pfad der sheetN.xml für SHEET_NAME über workbook.xml + rels auflösen.
function resolveSheetPath(files) {
  const wb = files['xl/workbook.xml'] ? strFromU8(files['xl/workbook.xml']) : '';
  const sm = wb.match(new RegExp(`<sheet[^>]*name="${SHEET_NAME}"[^>]*r:id="([^"]+)"`));
  if (!sm) return 'xl/worksheets/sheet1.xml';
  const rels = files['xl/_rels/workbook.xml.rels'] ? strFromU8(files['xl/_rels/workbook.xml.rels']) : '';
  const rm = rels.match(new RegExp(`<Relationship[^>]*Id="${sm[1]}"[^>]*Target="([^"]+)"`));
  let target = rm ? rm[1] : 'worksheets/sheet1.xml';
  target = target.replace(/^\/?xl\//, '').replace(/^\//, '');
  return `xl/${target}`;
}

// Spalte B -> erste passende Zeilennummer (Label normalisiert).
function buildLabelMap(sheetXml, shared) {
  const map = new Map();
  let betragRow = null;
  const reC = /<c r="B(\d+)"([^>]*?)(?:\/>|>([\s\S]*?)<\/c>)/g;
  let m;
  while ((m = reC.exec(sheetXml))) {
    const row = +m[1];
    const attrs = m[2];
    const body = m[3] || '';
    let text = '';
    const vm = body.match(/<v>([\s\S]*?)<\/v>/);
    if (/t="s"/.test(attrs)) {
      if (vm) text = shared[+vm[1]] || '';
    } else if (/t="inlineStr"/.test(attrs)) {
      const im = body.match(/<t[^>]*>([\s\S]*?)<\/t>/);
      text = im ? xmlUnescape(im[1]) : '';
    } else if (vm) {
      text = xmlUnescape(vm[1]);
    }
    const key = norm(text);
    if (key && !map.has(key)) map.set(key, row);
    if (betragRow == null && key === norm(TEMPLATE_BETRAG_LABEL)) betragRow = row;
  }
  return { map, betragRow };
}

// Einen Zellwert (Inline-String) in den Zeilen-Body setzen; Style bleibt.
function setCellInRowBody(rowBody, ref, value) {
  const targetCol = ref.match(/^[A-Z]+/)[0];
  const cells = [];
  let existingStyle = null;
  const cellRe = /<c r="([A-Z]+)(\d+)"([^>]*?)(?:\/>|>([\s\S]*?)<\/c>)/g;
  let m;
  while ((m = cellRe.exec(rowBody))) {
    const col = m[1];
    if (col === targetCol) {
      const sm = m[3].match(/s="(\d+)"/);
      existingStyle = sm ? sm[1] : null;
      continue; // bestehende Zielzelle entfernen, wird neu gesetzt
    }
    cells.push({ num: colToNum(col), xml: m[0] });
  }
  const sAttr = existingStyle != null ? ` s="${existingStyle}"` : '';
  const newCell = `<c r="${ref}"${sAttr} t="inlineStr"><is><t xml:space="preserve">${xmlEscape(value)}</t></is></c>`;
  cells.push({ num: colToNum(targetCol), xml: newCell });
  cells.sort((a, b) => a.num - b.num);
  return cells.map((c) => c.xml).join('');
}

function setCell(sheetXml, ref, value) {
  const rowNum = ref.match(/\d+/)[0];
  const rowRe = new RegExp(`(<row r="${rowNum}"[^>]*>)([\\s\\S]*?)(</row>)`);
  const rm = sheetXml.match(rowRe);
  if (!rm) return sheetXml; // Zeile nicht vorhanden -> überspringen
  const newBody = setCellInRowBody(rm[2], ref, value);
  return sheetXml.slice(0, rm.index) + rm[1] + newBody + rm[3] + sheetXml.slice(rm.index + rm[0].length);
}

/**
 * Befüllt die Vorlage und liefert die fertige .xlsm als Uint8Array.
 * @param {ArrayBuffer|Uint8Array} input  Bytes der Originalvorlage
 * @param {object} dataset                Demo-Datensatz (siehe kontoanlageDemo.js)
 * @returns {{ bytes: Uint8Array, count: number }}
 */
export function fillTemplateXlsm(input, dataset) {
  const files = unzipSync(input instanceof Uint8Array ? input : new Uint8Array(input));
  const sheetPath = resolveSheetPath(files);
  if (!files[sheetPath]) throw new Error(`Blatt-Datei ${sheetPath} nicht in der Vorlage gefunden.`);

  const shared = parseSharedStrings(files['xl/sharedStrings.xml'] ? strFromU8(files['xl/sharedStrings.xml']) : '');
  let sheetXml = strFromU8(files[sheetPath]);
  const { map, betragRow } = buildLabelMap(sheetXml, shared);

  const F = dataset.felder || {};
  let count = 0;

  if (betragRow != null) {
    if (F.kreditbetrag?.wert) { sheetXml = setCell(sheetXml, `D${betragRow}`, F.kreditbetrag.wert); count += 1; }
    if (F.waehrung?.wert) { sheetXml = setCell(sheetXml, `E${betragRow}`, F.waehrung.wert); count += 1; }
  }

  for (const [key, label] of Object.entries(TEMPLATE_FIELD_LABELS)) {
    const field = F[key];
    if (!field?.wert) continue;
    const row = map.get(norm(label));
    if (!row) continue;
    sheetXml = setCell(sheetXml, `D${row}`, field.wert);
    count += 1;
  }

  files[sheetPath] = strToU8(sheetXml);
  const bytes = zipSync(files, { level: 6 });
  return { bytes, count };
}
