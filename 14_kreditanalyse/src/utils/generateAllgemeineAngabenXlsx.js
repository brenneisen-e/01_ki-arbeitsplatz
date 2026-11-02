/**
 * generateAllgemeineAngabenXlsx.js
 *
 * Lädt die als App-Asset gebündelte Originalvorlage
 * "Template Kreditkontoneuanlage.xlsm", befüllt das Blatt "Allgemeine Angaben"
 * mit den aus dem Vertrag extrahierten Werten und stellt die Datei als
 * makrofähige .xlsm zum Download bereit (alle Blätter, Formatierung,
 * Dropdown-Listen und VBA-Makros bleiben erhalten – siehe
 * fillKontoanlageTemplate.js).
 */

import { saveAs } from 'file-saver';
import templateUrl from '../assets/template-kreditkontoneuanlage.xlsm?url';
import { fillTemplateXlsm } from './fillKontoanlageTemplate';

const XLSM_MIME = 'application/vnd.ms-excel.sheet.macroEnabled.12';

export async function generateAllgemeineAngabenXlsx(dataset) {
  const res = await fetch(templateUrl);
  if (!res.ok) throw new Error(`Vorlage konnte nicht geladen werden (HTTP ${res.status}).`);
  const arrayBuffer = await res.arrayBuffer();

  const { bytes, count } = fillTemplateXlsm(arrayBuffer, dataset);

  const blob = new Blob([bytes], { type: XLSM_MIME });
  const safeName = (dataset.kreditnehmer || 'Kreditnehmer').replace(/[^a-zA-Z0-9]+/g, '_');
  saveAs(blob, `Kreditkontoneuanlage_${safeName}.xlsm`);

  return count;
}
