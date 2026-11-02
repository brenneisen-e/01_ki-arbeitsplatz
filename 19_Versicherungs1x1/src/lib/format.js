// ===========================================================================
// format.js — deutsche Formate. Alle Ausgaben nutzen geschützte Leerzeichen
// (U+00A0) zwischen Zahl und Einheit, damit „6,6 %“ und „254 Mrd. €“ nie
// am Zeilenende auseinanderbrechen.
// ===========================================================================

const NBSP = ' ';
const MONATE = ['Januar', 'Februar', 'März', 'April', 'Mai', 'Juni', 'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'];
const formatierer = new Map();

function nf(min, max) {
  const k = `${min}/${max}`;
  if (!formatierer.has(k)) {
    formatierer.set(k, new Intl.NumberFormat('de-DE', { minimumFractionDigits: min, maximumFractionDigits: max }));
  }
  return formatierer.get(k);
}

/** Dezimalstellen einer Zahl (höchstens `max`), z. B. 17,4 → 1. */
export function dezimalenVon(n, max = 2) {
  if (!Number.isFinite(n)) return 0;
  const s = String(n);
  const i = s.indexOf('.');
  return i < 0 ? 0 : Math.min(max, s.length - i - 1);
}

/**
 * Zahl mit Tausenderpunkt und Dezimalkomma. Ohne `dezimalen` werden so viele
 * Stellen gezeigt, wie die Zahl hat (höchstens zwei) — 17,4 bleibt 17,4.
 * @param {number} n
 * @param {number} [dezimalen]
 */
export function zahl(n, dezimalen) {
  if (n == null || !Number.isFinite(Number(n))) return '–';
  const d = dezimalen == null ? dezimalenVon(Number(n)) : dezimalen;
  return nf(d, d).format(Number(n)).replace(/-/g, '−');
}

/**
 * Prozentwert (6.6 → „6,6 %“). Der Wert ist bereits in Prozent, kein Anteil.
 * @param {number} n
 * @param {number} [dezimalen]
 */
export function prozent(n, dezimalen) {
  if (n == null || !Number.isFinite(Number(n))) return '–';
  return `${zahl(n, dezimalen)}${NBSP}%`;
}

/**
 * Anteil 0..1 als Prozent (0.34 → „34 %“).
 * @param {number} a
 * @param {number} [dezimalen=0]
 */
export function anteil(a, dezimalen = 0) {
  if (a == null || !Number.isFinite(Number(a))) return '–';
  return prozent(Number(a) * 100, dezimalen);
}

/**
 * Euro: ganze Beträge ohne Nachkommastellen („1.234 €“), sonst zwei („1.234,56 €“).
 * @param {number} n
 * @param {number} [dezimalen]
 */
export function euro(n, dezimalen) {
  if (n == null || !Number.isFinite(Number(n))) return '–';
  const d = dezimalen == null ? (Number.isInteger(Number(n)) ? 0 : 2) : dezimalen;
  return `${zahl(n, d)}${NBSP}€`;
}

/**
 * Kompakte Zahl: 1.900.000 → „1,9 Mio.“, 254e9 → „254 Mrd.“, 1,2e12 → „1,2 Bio.“;
 * unter einer Million die normale Zahl.
 * @param {number} n
 */
export function kompakt(n) {
  if (n == null || !Number.isFinite(Number(n))) return '–';
  const v = Number(n);
  const abs = Math.abs(v);
  const stufen = [[1e12, 'Bio.'], [1e9, 'Mrd.'], [1e6, 'Mio.']];
  for (const [grenze, einheit] of stufen) {
    if (abs >= grenze) {
      const w = v / grenze;
      const d = Math.abs(w) >= 100 ? 0 : 1;
      return `${zahl(w, d)}${NBSP}${einheit}`;
    }
  }
  return zahl(v, 0);
}

function alsDatum(iso) {
  if (iso == null || iso === '') return null;
  const d = iso instanceof Date ? iso : new Date(iso);
  return Number.isNaN(d.getTime()) ? null : d;
}

/** ISO-Datum → „26.02.2026“. */
export function datum(iso) {
  const d = alsDatum(iso);
  if (!d) return '–';
  return d.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

/** ISO-Datum → „26. Februar 2026“. */
export function datumLang(iso) {
  const d = alsDatum(iso);
  if (!d) return '–';
  return `${d.getDate()}. ${MONATE[d.getMonth()]} ${d.getFullYear()}`;
}

/** ISO-Zeit → „14:30“. */
export function uhrzeit(iso) {
  const d = alsDatum(iso);
  if (!d) return '–';
  return d.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' });
}

/**
 * Relatives Datum in Alltagssprache: „heute“, „gestern“, „vor 3 Tagen“,
 * ab 14 Tagen das Datum.
 */
export function datumRelativ(iso, jetzt = new Date()) {
  const d = alsDatum(iso);
  if (!d) return '–';
  const tagStart = (x) => new Date(x.getFullYear(), x.getMonth(), x.getDate()).getTime();
  const tage = Math.round((tagStart(jetzt) - tagStart(d)) / 86400000);
  if (tage <= 0) return 'heute';
  if (tage === 1) return 'gestern';
  if (tage < 14) return `vor ${tage}${NBSP}Tagen`;
  return datum(d);
}

/** Minuten → „24 Min.“; ab 90 Minuten „1 Std. 30 Min.“. */
export function minuten(n) {
  const m = Math.max(0, Math.round(Number(n) || 0));
  if (m >= 90) {
    const std = Math.floor(m / 60);
    const rest = m % 60;
    return rest ? `${std}${NBSP}Std. ${rest}${NBSP}Min.` : `${std}${NBSP}Std.`;
  }
  return `${m}${NBSP}Min.`;
}

/** Mehrzahl: (1, 'Lerneinheit', 'Lerneinheiten') → „1 Lerneinheit“. */
export function mehrzahl(n, einzahl, mehr) {
  return `${zahl(n, 0)}${NBSP}${n === 1 ? einzahl : mehr}`;
}
