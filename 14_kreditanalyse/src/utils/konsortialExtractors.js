/**
 * konsortialExtractors.js
 *
 * Regex-basierte Extraktoren für typische Felder eines externen
 * Konsortialkredit-PDFs (Konsortialvertrag, Term-Sheet, Faxbestätigung).
 *
 * Jeder Extraktor liefert entweder `null` oder ein Objekt:
 *   { value: any, raw: string, confidence: 'high' | 'medium' | 'low' }
 *
 * Alle Extraktoren laufen über denselben normalisierten Gesamttext,
 * der von `konsortialParser.js` orchestriert wird.
 */

// --- Hilfsfunktionen ---

/** Deutsche Zahl "1.234,56" -> Number 1234.56 */
export function parseGermanNumber(str) {
  if (!str) return null;
  const cleaned = String(str)
    .replace(/\s/g, '')
    .replace(/\./g, '')
    .replace(',', '.');
  const n = parseFloat(cleaned);
  return Number.isFinite(n) ? n : null;
}

/** Findet das erste Match einer Liste von Regex im Text. */
function firstMatch(text, patterns) {
  for (const pattern of patterns) {
    const m = text.match(pattern);
    if (m) return m;
  }
  return null;
}

// --- Einzelne Extraktoren ---

export function extractKreditbetrag(text) {
  const m = firstMatch(text, [
    /(?:Kreditbetrag|Nominalbetrag|Darlehensbetrag|Gesamtbetrag|Kreditsumme)\s*[:\s]+(?:EUR|€)?\s*([\d.]+(?:,\d{2})?)/i,
    /(?:EUR|€)\s*([\d.]+(?:,\d{2})?)\s*(?:Kreditbetrag|Nominalbetrag|Darlehen)/i,
  ]);
  if (!m) return null;
  const value = parseGermanNumber(m[1]);
  return value ? { value, raw: m[0], confidence: 'high' } : null;
}

export function extractZinssatz(text) {
  const m = firstMatch(text, [
    /(?:Zinssatz|Nominalzins|Sollzins|Marge)\s*[:\s]+([\d]{1,2}(?:,\d{1,3})?)\s*%/i,
    /([\d]{1,2}(?:,\d{1,3})?)\s*%\s*(?:p\.?\s*a\.?|jährlich)/i,
  ]);
  if (!m) return null;
  const value = parseGermanNumber(m[1]);
  return value != null ? { value, raw: m[0], confidence: 'high' } : null;
}

export function extractLaufzeit(text) {
  const m = firstMatch(text, [
    /Laufzeit\s*[:\s]+(\d{1,3})\s*(Monate|Jahre)/i,
    /(\d{1,3})\s*(Monate|Jahre)\s*Laufzeit/i,
  ]);
  if (!m) return null;
  const num = parseInt(m[1], 10);
  const monate = /jahr/i.test(m[2]) ? num * 12 : num;
  return { value: monate, raw: m[0], confidence: 'high' };
}

export function extractTilgungsfrei(text) {
  const m = firstMatch(text, [
    /Tilgungsfrei(?:e\s*Zeit)?\s*[:\s]+(\d{1,2})\s*(Monate|Jahre)/i,
    /(\d{1,2})\s*(Monate|Jahre)\s*tilgungsfrei/i,
  ]);
  if (!m) return null;
  const num = parseInt(m[1], 10);
  const monate = /jahr/i.test(m[2]) ? num * 12 : num;
  return { value: monate, raw: m[0], confidence: 'medium' };
}

export function extractKonsortialfuehrer(text) {
  const m = firstMatch(text, [
    /Konsortial(?:führer|fuehrer)\s*[:\s]+([A-ZÄÖÜ][\wÄÖÜäöüß &.\-]{2,60}?)(?:\s{2,}|\n|,|;|\s*HRB)/,
    /(?:Agent|Lead\s*Arranger|Facility\s*Agent)\s*[:\s]+([A-ZÄÖÜ][\wÄÖÜäöüß &.\-]{2,60}?)(?:\s{2,}|\n|,|;)/i,
  ]);
  if (!m) return null;
  return { value: m[1].trim(), raw: m[0], confidence: 'medium' };
}

export function extractKreditnehmer(text) {
  const m = firstMatch(text, [
    /(?:Kreditnehmer|Darlehensnehmer|Borrower)\s*[:\s]+([A-ZÄÖÜ][\wÄÖÜäöüß &.\-]{2,60}?\s*(?:GmbH|AG|KG|UG|GbR|OHG|SE|Co\.\s*KG))/,
  ]);
  if (!m) return null;
  return { value: m[1].trim(), raw: m[0], confidence: 'high' };
}

export function extractRestschuld(text) {
  const m = firstMatch(text, [
    /(?:Restschuld|Restvaluta|aushaftender\s+Betrag)\s*[:\s]+(?:EUR|€)?\s*([\d.]+(?:,\d{2})?)/i,
  ]);
  if (!m) return null;
  const value = parseGermanNumber(m[1]);
  return value ? { value, raw: m[0], confidence: 'high' } : null;
}

export function extractLaufzeitende(text) {
  const m = firstMatch(text, [
    /(?:Laufzeitende|Endfälligkeit|Endfaelligkeit|Fälligkeit|Faelligkeit)\s*[:\s]+(\d{2}\.\d{2}\.\d{4})/i,
  ]);
  if (!m) return null;
  return { value: m[1], raw: m[0], confidence: 'high' };
}

export function extractAuszahlungstermin(text) {
  const m = firstMatch(text, [
    /(?:Auszahlungstermin|Valutierung|Valuta)\s*[:\s]+(\d{2}\.\d{2}\.\d{4})/i,
  ]);
  if (!m) return null;
  return { value: m[1], raw: m[0], confidence: 'medium' };
}

export function extractVerwendungszweck(text) {
  const m = firstMatch(text, [
    /(?:Verwendungszweck|Finanzierungszweck|Zweck\s+des\s+Kredits)\s*[:\s]+([^\n]{5,180}?)(?:\s{3,}|\n|\.)/i,
  ]);
  if (!m) return null;
  return { value: m[1].trim(), raw: m[0], confidence: 'medium' };
}

export function extractSicherheiten(text) {
  const m = firstMatch(text, [
    /(?:Sicherheiten|Besicherung|Collateral)\s*[:\s]+([^\n]{5,220}?)(?:\s{3,}|\n)/i,
  ]);
  if (!m) return null;
  return { value: m[1].trim(), raw: m[0], confidence: 'medium' };
}

export function extractCovenants(text) {
  const m = firstMatch(text, [
    /(?:Covenants?|Financial\s+Covenants?|Auflagen)\s*[:\s]+([^\n]{5,220}?)(?:\s{3,}|\n)/i,
  ]);
  if (!m) return null;
  return { value: m[1].trim(), raw: m[0], confidence: 'low' };
}
