// Erkennt den Rechnungsbetrag in den Textbloecken eines PDF und liefert ein
// Praefix fuer den Dateinamen, z. B. "121,14 EUR ".
//
// Vorgehen: Alle Geldbetraege im Dokument sammeln und bewerten. Ein Betrag
// gewinnt, wenn in seiner Naehe ein Schlagwort wie "Gesamtbetrag" oder
// "Amount due" steht; sonst entscheidet der groesste Betrag.

/** Schlagwoerter mit Gewicht. Je spezifischer, desto hoeher. */
const KEYWORDS = [
  [/\b(amount\s+due|zahlbetrag|rechnungsbetrag|gesamtbetrag|endbetrag|zu\s+zahlen(der\s+betrag)?|fälliger\s+betrag|faelliger\s+betrag)\b/i, 100],
  [/\b(total\s+(amount|due|incl|including)|gesamtsumme|rechnungssumme|bruttobetrag|brutto\s*summe)\b/i, 80],
  [/\b(gesamt|total|summe|brutto)\b/i, 45],
  [/\b(nettobetrag|subtotal|zwischensumme|netto|total\s+excluding)\b/i, -40],
  [/\b(ust|mwst|vat|umsatzsteuer|mehrwertsteuer|steuer|tax)\b/i, -60],
  [/\b(unit\s+price|einzelpreis|stückpreis|stueckpreis)\b/i, -60],
];

/**
 * Findet Geldbetraege in einem Text.
 * Unterstuetzt deutsche (1.234,56) und englische (1,234.56) Schreibweise,
 * jeweils mit vor- oder nachgestelltem Waehrungszeichen.
 */
const MONEY = /(?:(€|EUR|eur)\s*)?(\d{1,3}(?:[., \s]\d{3})*(?:[.,]\d{1,2})?|\d+(?:[.,]\d{1,2})?)(?:\s*(€|EUR|eur))?/g;

/** Wandelt eine Betragszeichenkette in eine Zahl. */
export function parseAmount(raw) {
  let s = String(raw).replace(/[ \s]/g, '');
  const komma = s.lastIndexOf(',');
  const punkt = s.lastIndexOf('.');
  if (komma > -1 && punkt > -1) {
    // Das hintere Zeichen ist das Dezimaltrennzeichen.
    if (komma > punkt) s = s.replace(/\./g, '').replace(',', '.');
    else s = s.replace(/,/g, '');
  } else if (komma > -1) {
    // Nur Komma: Dezimaltrennzeichen, wenn hoechstens zwei Stellen folgen.
    s = s.length - komma <= 3 ? s.replace(',', '.') : s.replace(/,/g, '');
  } else if (punkt > -1) {
    if (s.length - punkt > 3) s = s.replace(/\./g, '');
  }
  const n = Number.parseFloat(s);
  return Number.isFinite(n) ? n : null;
}

function keywordScore(text) {
  let score = 0;
  for (const [re, w] of KEYWORDS) if (re.test(text)) score += w;
  return score;
}

/** Bloecke, die auf derselben Zeile links vom Betrag stehen. */
function nachbarText(block, blocks) {
  const toleranz = Math.max(block.size || 10, 6) * 0.9;
  let text = '';
  for (const b of blocks) {
    if (b === block || b.pageIndex !== block.pageIndex) continue;
    if (Math.abs((b.y ?? 0) - (block.y ?? 0)) > toleranz) continue;
    if ((b.x ?? 0) >= (block.x ?? 0)) continue;
    text += ' ' + (b.text || '');
  }
  return text;
}

/**
 * Sucht den Rechnungsbetrag.
 * blocks: Iterable der Textbloecke (Map-Values oder Array).
 * Rueckgabe: { value, text, currency } oder null.
 */
export function findInvoiceAmount(blocks) {
  const liste = Array.isArray(blocks) ? blocks : [...(blocks?.values?.() || [])];
  if (!liste.length) return null;
  const kandidaten = [];
  for (const b of liste) {
    const text = b?.text || '';
    if (!text || b?.deleted) continue;
    const eigen = keywordScore(text);
    let nachbar = null;
    MONEY.lastIndex = 0;
    let m;
    while ((m = MONEY.exec(text)) !== null) {
      const waehrungVorn = m[1];
      const waehrungHinten = m[3];
      if (!waehrungVorn && !waehrungHinten) continue; // ohne Waehrung ignorieren
      // Folgt direkt eine weitere Ziffer, ist der Treffer abgeschnitten
      // (z. B. der Stueckpreis 101.7968228). Solche Werte sind unbrauchbar.
      const zahlEnde = m.index + m[0].indexOf(m[2]) + m[2].length;
      if (/\d/.test(text.charAt(zahlEnde))) continue;
      const value = parseAmount(m[2]);
      if (value === null || value <= 0) continue;
      if (nachbar === null) nachbar = keywordScore(nachbarText(b, liste));
      const score = Math.max(eigen, 0) + Math.max(nachbar, 0) + Math.min(eigen, 0) + Math.min(nachbar, 0);
      kandidaten.push({ value, score, seite: b.pageIndex ?? 0, y: b.y ?? 0 });
    }
  }
  if (!kandidaten.length) return null;
  kandidaten.sort((a, b) => (b.score - a.score) || (b.value - a.value) || (a.seite - b.seite));
  const best = kandidaten[0];
  // Ohne Schlagwort ist der groesste Betrag die beste Annaeherung.
  if (best.score <= 0) {
    kandidaten.sort((a, b) => b.value - a.value);
  }
  const gewinner = kandidaten[0];
  return { value: gewinner.value, currency: 'EUR', text: formatAmount(gewinner.value) };
}

/** 121.14 -> "121,14" */
export function formatAmount(value) {
  return value.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

/**
 * Dateinamen-Praefix fuer einen Betrag, z. B. "1.234,56 EUR ".
 * Punkte als Tausendertrennzeichen werden entfernt, damit der Name keine
 * zusaetzlichen Punkte enthaelt.
 */
export function amountPrefix(amount) {
  if (!amount || !Number.isFinite(amount.value)) return '';
  return `${formatAmount(amount.value).replace(/\./g, '')} EUR `;
}
