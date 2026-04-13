// Dynamic-date helpers for demo content.
//
// Some lead descriptions reference a relative timestamp like "vor einer Woche"
// which should stay realistic no matter when the dashboard is opened. Rather
// than hard-coding a calendar date (e.g. "25.02.2026") in the data files we
// use placeholders such as {{datumVorEinerWoche}} that are resolved at render
// time by interpolateDynamicDates().

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

export function interpolateDynamicDates(text) {
  if (!text || typeof text !== 'string') return text;
  return text.replace(/\{\{(\w+)\}\}/g, (match, key) => {
    const fn = PLACEHOLDERS[key];
    if (!fn) return match; // unknown placeholder – leave it
    return fmt(fn());
  });
}
