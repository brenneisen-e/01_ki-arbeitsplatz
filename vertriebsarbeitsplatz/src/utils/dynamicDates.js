// Dynamic-date helpers for demo content.
//
// Some lead descriptions reference a relative timestamp like "vor einer Woche"
// which should stay realistic no matter when the dashboard is opened. Rather
// than hard-coding a calendar date (e.g. "25.02.2026") in the data files we
// use placeholders such as {{datumVorEinerWoche}} that are resolved at render
// time by interpolateDynamicDates().
//
// Additionally, we support institut-specific placeholders like
// {{versicherungspartner}} and {{institutKurz}} so that lead texts referencing
// the "hausinterne" Versicherung remain coherent when a user switches between
// different Banking-institut-Varianten (z. B. Volksbank → R+V,
// Zukunftsbank → Zukunftsversicherung).

const PLACEHOLDERS = {
  datumHeute: () => 0,
  datumGestern: () => 1,
  datumVor3Tagen: () => 3,
  datumVor2Tagen: () => 2,
  datumVor5Tagen: () => 5,
  datumVorEinerWoche: () => 7,
  datumVor2Wochen: () => 14,
  datumVor3Wochen: () => 21,
  datumVor4Wochen: () => 28,
  datumVor1Monat: () => 30,
};

function fmt(daysAgo) {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  return d.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

// Map from banking-institut → passende Versicherungsmarke.
// Für "exotische" Institute (Sparkasse → Provinzial, ING → keine etc.) fallen
// wir auf einen generischen Wert zurück, damit die Demo-Texte auch ohne
// konkretes Mapping funktionieren.
const VERSICHERUNGSPARTNER_BY_INSTITUT = {
  'Volksbank Mittelhessen': 'R+V',
  'Sparkasse': 'Provinzial',
  'Commerzbank': 'AMB',
  'Deutsche Bank': 'Zurich',
  'ING': 'NN',
  'Zukunftsbank': 'Zukunftsversicherung',
  // Versicherer-Modus
  'ERGO': 'ERGO',
  'Allianz': 'Allianz',
  'AXA': 'AXA',
  'Generali': 'Generali',
  'Zurich': 'Zurich',
  'Zukunftsversicherung': 'Zukunftsversicherung',
};

export function resolveVersicherungspartner(institut) {
  if (!institut) return 'R+V';
  return VERSICHERUNGSPARTNER_BY_INSTITUT[institut] || institut;
}

export function institutKurz(institut) {
  if (!institut) return '';
  return String(institut).split(' ')[0];
}

// Ersetzt Platzhalter in einem Text. Zusätzlich zum Datum können
// institut-spezifische Werte über den optionalen `ctx` überschrieben werden.
// Unbekannte Platzhalter bleiben unverändert stehen.
export function interpolateDynamicDates(text, ctx = {}) {
  if (!text || typeof text !== 'string') return text;
  const extra = {
    versicherungspartner: ctx.versicherungspartner || resolveVersicherungspartner(ctx.institut),
    institutKurz: ctx.institutKurz || institutKurz(ctx.institut),
    institut: ctx.institut || '',
  };
  return text.replace(/\{\{(\w+)\}\}/g, (match, key) => {
    if (Object.prototype.hasOwnProperty.call(extra, key) && extra[key]) return extra[key];
    const fn = PLACEHOLDERS[key];
    if (!fn) return match; // unknown placeholder – leave it
    return fmt(fn());
  });
}
