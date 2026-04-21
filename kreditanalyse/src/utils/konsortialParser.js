/**
 * konsortialParser.js
 *
 * Verbindet die Extraktoren aus `konsortialExtractors.js` mit dem
 * Masken-Mapping aus `maskenMapping.js`. Das Ergebnis ist eine Liste
 * von Treffern, die in der UI direkt als "Wert X in Maske Y, Feld Z"
 * angezeigt werden kann.
 */

import { MASKEN_MAPPING } from '../data/maskenMapping';
import {
  extractKreditbetrag,
  extractZinssatz,
  extractLaufzeit,
  extractTilgungsfrei,
  extractKonsortialfuehrer,
  extractKreditnehmer,
  extractRestschuld,
  extractLaufzeitende,
  extractAuszahlungstermin,
  extractVerwendungszweck,
  extractSicherheiten,
  extractCovenants,
} from './konsortialExtractors';

/**
 * Reihenfolge ist wichtig: Einige Felder (z.B. Restschuld) überschreiben
 * generischere Matches wie Kreditbetrag NICHT, weil sie einen anderen Key
 * im Mapping haben.
 */
const EXTRACTOR_PIPELINE = [
  { key: 'firma', fn: extractKreditnehmer },
  { key: 'konsortialfuehrer', fn: extractKonsortialfuehrer },
  { key: 'kreditbetrag', fn: extractKreditbetrag },
  { key: 'ursprungsbetrag', fn: extractKreditbetrag },
  { key: 'restschuld', fn: extractRestschuld },
  { key: 'zinssatz', fn: extractZinssatz },
  { key: 'laufzeit', fn: extractLaufzeit },
  { key: 'tilgungsfrei', fn: extractTilgungsfrei },
  { key: 'laufzeitende', fn: extractLaufzeitende },
  { key: 'auszahlung', fn: extractAuszahlungstermin },
  { key: 'verwendung', fn: extractVerwendungszweck },
  { key: 'sicherheit_bezeichnung', fn: extractSicherheiten },
  { key: 'covenant', fn: extractCovenants },
];

/**
 * Normalisiert den Rohtext: ersetzt geschütztes Leerzeichen durch
 * normales Leerzeichen und komprimiert mehrfache Spaces.
 */
function normalizeText(raw) {
  return String(raw || '')
    .replace(/\u00A0/g, ' ')
    .replace(/[\t\r]+/g, ' ')
    .replace(/ {2,}/g, ' ')
    .trim();
}

/**
 * Hauptfunktion: nimmt den Rohtext, lässt alle Extraktoren laufen und
 * verknüpft jeden Treffer mit dem passenden Mapping-Eintrag.
 *
 * @returns {Array<{key, value, raw, confidence, mapping}>}
 */
export function parseKonsortialText(rawText) {
  const text = normalizeText(rawText);
  const hits = [];
  const seen = new Set();

  for (const { key, fn } of EXTRACTOR_PIPELINE) {
    // Falls zwei Extraktoren denselben Mapping-Key bedienen würden (z.B.
    // kreditbetrag vs. ursprungsbetrag via extractKreditbetrag), stellen
    // wir sicher, dass nur einer pro Key durchkommt.
    if (seen.has(key)) continue;
    const mapping = MASKEN_MAPPING[key];
    if (!mapping) continue;
    try {
      const res = fn(text);
      if (res && res.value !== null && res.value !== undefined && res.value !== '') {
        hits.push({ key, ...res, mapping });
        seen.add(key);
      }
    } catch (err) {
      // Extraktoren laufen im Browser - wir wollen keinen Render-Crash.
      // eslint-disable-next-line no-console
      console.warn('Extractor failed:', key, err);
    }
  }

  return hits;
}

/**
 * Liefert die erwarteten aber nicht extrahierten Felder - damit die UI
 * dem Nutzer sagen kann, was er ggf. händisch ergänzen muss.
 */
export function findMissingKeys(hits) {
  const foundKeys = new Set(hits.map((h) => h.key));
  const expected = Object.keys(MASKEN_MAPPING);
  return expected.filter((k) => !foundKeys.has(k));
}
