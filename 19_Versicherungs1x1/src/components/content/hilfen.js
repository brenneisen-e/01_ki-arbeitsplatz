// ===========================================================================
// hilfen.js — kleine, reine Helfer der Inhaltsblöcke: Design-Tokens lesen
// (aufgelöst, weil Recharts und SVG echte Farbwerte brauchen), Kontrast und
// Textfarbe nach Helligkeit, deutsches Zahlenparsen für Sortierung, Einheit
// aus einem Diagrammtitel, Satz um eine Quellenmarke, Breite eines Elements,
// Zwischenablage.
// ===========================================================================
import { useLayoutEffect, useState } from 'react';

const TOKEN_ERSATZ = {
  '--viz-1': '#1f7a4d', '--viz-2': '#2a78d6', '--viz-3': '#eb6834',
  '--viz-4': '#4a3aa7', '--viz-5': '#eda100', '--viz-6': '#e34948',
  '--viz-sequenz-100': '#dcefe2', '--viz-sequenz-200': '#b9dfc6', '--viz-sequenz-300': '#8cc9a3',
  '--viz-sequenz-400': '#5fae7f', '--viz-sequenz-500': '#3d9463', '--viz-sequenz-600': '#1f7a4d',
  '--viz-sequenz-700': '#0C4B33',
  '--viz-gitter': '#e2e8f0', '--viz-achse': '#64748b',
  '--neutral-300': '#cbd5e1', '--neutral-400': '#94a3b8', '--neutral-200': '#e2e8f0',
  '--text': '#0f172a', '--text-2': '#475569', '--text-3': '#64748b',
  '--flaeche-karte': '#ffffff', '--marke': '#0C4B33', '--rand': '#e2e8f0', '--rand-stark': '#cbd5e1',
  '--erfolg': '#15803d', '--warnung': '#b45309', '--fehler': '#b91c1c', '--info': '#1d4ed8',
};
const tokenCache = new Map();

/**
 * Liest ein Design-Token als echten Farbwert. Verweise wie `var(--neutral-200)`
 * werden aufgelöst; ohne DOM (oder wenn ein Token fehlt) gilt der Ersatzwert.
 * @param {string} name z. B. '--viz-1'
 */
export function token(name) {
  if (tokenCache.has(name)) return tokenCache.get(name);
  let wert = '';
  try {
    const stil = getComputedStyle(document.documentElement);
    let aktuell = name;
    for (let i = 0; i < 6; i += 1) {
      wert = stil.getPropertyValue(aktuell).trim();
      const verweis = wert.match(/^var\((--[\w-]+)\)$/);
      if (!verweis) break;
      aktuell = verweis[1];
      wert = '';
    }
  } catch {
    wert = '';
  }
  const ergebnis = wert || TOKEN_ERSATZ[name] || '#64748b';
  tokenCache.set(name, ergebnis);
  return ergebnis;
}

/** Zahl der kategorialen Diagrammfarben — nie zyklisch weiterzählen. */
export const VIZ_ANZAHL = 6;

/** Farbe der i-ten Reihe (0-basiert). Ab der siebten Reihe: Sammelgrau („Sonstige“). */
export function vizFarbe(i) {
  return i < VIZ_ANZAHL ? token(`--viz-${i + 1}`) : token('--neutral-300');
}

/** Sequenzielle Grün-Rampe: Stufe 0..6 → --viz-sequenz-100 … 700. */
export function sequenzFarbe(stufe) {
  const s = Math.max(0, Math.min(6, Math.round(stufe)));
  return token(`--viz-sequenz-${(s + 1) * 100}`);
}

function hexZuRgb(hex) {
  const h = String(hex || '').trim().replace('#', '');
  const v = h.length === 3 ? h.split('').map((c) => c + c).join('') : h;
  const n = parseInt(v.slice(0, 6), 16);
  if (!Number.isFinite(n) || v.length < 6) return [128, 128, 128];
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

/** Relative Leuchtdichte nach WCAG (0 dunkel … 1 hell). */
export function luminanz(hex) {
  const [r, g, b] = hexZuRgb(hex).map((c) => {
    const x = c / 255;
    return x <= 0.03928 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/** Kontrastverhältnis zweier Farben (1 … 21). */
export function kontrast(a, b) {
  const la = luminanz(a);
  const lb = luminanz(b);
  return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05);
}

/** Textfarbe auf einer Fläche: Weiß oder Textfarbe — je nachdem, was mehr Kontrast liefert. */
export function textFarbeAuf(hex) {
  const dunkel = token('--text');
  return kontrast(hex, '#ffffff') >= kontrast(hex, dunkel) ? '#ffffff' : dunkel;
}

/**
 * Deutsches Zahlenparsen für Tabellenzellen: „1.234,5“ → 1234.5, „6,6 %“ → 6.6,
 * „−0,5 %“ → −0.5, „~20.000“ → 20000, „2005–2020“ → 2005. Kein Wert → null.
 * @param {unknown} text
 */
export function parseDeutscheZahl(text) {
  if (text == null) return null;
  const s = String(typeof text === 'object' ? text.text ?? '' : text)
    .replace(/<[^>]+>/g, '')
    .replace(/ /g, ' ')
    .trim();
  const m = s.match(/^[~≈><≥≤]?\s*([+\-−–]?)\s*(\d{1,3}(?:\.\d{3})+(?:,\d+)?|\d+(?:,\d+)?)/);
  if (!m) return null;
  const negativ = m[1] === '-' || m[1] === '−' || m[1] === '–';
  const n = Number(m[2].replace(/\./g, '').replace(',', '.'));
  if (!Number.isFinite(n)) return null;
  return negativ ? -n : n;
}

/** Sichtbarer Text einer Zelle (String oder Statuszelle { text, status }). */
export function zellenText(zelle) {
  if (zelle == null) return '';
  if (typeof zelle === 'object') return String(zelle.text ?? '');
  return String(zelle).replace(/<[^>]+>/g, '');
}

const EINHEIT_MUSTER = /[%‰€$]|\bUSD\b|\bEUR\b|\bMrd\b|\bMio\b|\bBio\b|\bTsd\b|Punkte|Stück|Verträge|Personen/;

/**
 * Einheit aus einem Titel wie „Beitragsentwicklung 2015–2025 (Mrd. €)“ oder
 * „Anteile (%, ausgewählte Sparten)“. Liefert '' wenn keine erkennbar ist.
 * @param {...(string|undefined)} titel
 */
export function einheitAusTitel(...titel) {
  for (const t of titel) {
    if (typeof t !== 'string') continue;
    const m = t.match(/\(([^()]*)\)\s*$/);
    if (!m) continue;
    const erster = m[1].split(',')[0].trim();
    if (erster && EINHEIT_MUSTER.test(erster) && erster.length <= 16) return erster;
  }
  return '';
}

const ABKUERZUNGEN = new Set([
  'z. b', 'z.b', 'u. a', 'u.a', 'd. h', 'd.h', 'i. d. r', 'i.d.r', 'i. v. m', 'i.v.m', 'i. h. v', 'i.h.v',
  'i. s. d', 'i.s.d', 'o. ä', 'u. ä', 'a. d', 'mrd', 'mio', 'bio', 'tsd', 'ca', 'bzw', 'nr', 'abs', 'art',
  'vgl', 'dr', 'st', 'inkl', 'ggf', 'evtl', 'sog', 'usw', 'etc', 'jh', 'rd', 'max', 'min', 'bspw', 'gem',
  'lt', 'ff', 'zzgl', 'einschl', 'vs', 'tel', 'str', 'bzgl', 'insb', 'zit', 'sec', 'sek', 'std',
]);

function istSatzgrenze(text, i) {
  const vorher = text.slice(Math.max(0, i - 14), i);
  const wort = (vorher.match(/([\p{L}.\s]*)$/u) || ['', ''])[1].trim().toLowerCase();
  const letztes = wort.split(/\s+/).pop() || '';
  if (ABKUERZUNGEN.has(wort) || ABKUERZUNGEN.has(letztes)) return false;
  for (const a of ABKUERZUNGEN) if (wort.endsWith(` ${a}`) || wort.endsWith(`.${a}`)) return false;
  if (/(^|\s)[A-ZÄÖÜ]$/.test(vorher)) return false; // Initial „S.“, „J.“
  return true;
}

/**
 * Der Satz, in dem eine Stelle (Zeichenindex) liegt — für „Zitat kopieren“.
 * Grenzen sind . ! ? gefolgt von Leerraum und einem Satzanfang; gängige
 * Abkürzungen (z. B., Mrd., Nr.) zählen nicht als Satzende.
 * @param {string} text Klartext des Absatzes
 * @param {number} stelle Index der Quellenmarke im Klartext
 */
export function satzUm(text, stelle) {
  const t = String(text || '');
  if (!t.trim()) return '';
  const grenzen = [0];
  const muster = /[.!?](?=["“”)']*\s+["„(“]?[A-ZÄÖÜ0-9])/g;
  for (const m of t.matchAll(muster)) {
    if (istSatzgrenze(t, m.index)) grenzen.push(m.index + 1);
  }
  grenzen.push(t.length);
  const ziel = Math.max(0, Math.min(t.length - 1, stelle - 1));
  let start = 0;
  let ende = t.length;
  for (let i = 0; i < grenzen.length - 1; i += 1) {
    if (ziel >= grenzen[i] && ziel < grenzen[i + 1]) { start = grenzen[i]; ende = grenzen[i + 1]; break; }
  }
  return t.slice(start, ende).replace(/\s+/g, ' ').trim();
}

/**
 * Breite eines Elements (ResizeObserver), 0 bis zur ersten Messung.
 * @param {import('react').RefObject<HTMLElement>} ref
 */
export function useBreite(ref) {
  const [breite, setBreite] = useState(0);
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return undefined;
    const messe = () => setBreite(el.getBoundingClientRect().width);
    messe();
    if (typeof ResizeObserver === 'undefined') {
      window.addEventListener('resize', messe);
      return () => window.removeEventListener('resize', messe);
    }
    const beobachter = new ResizeObserver(() => messe());
    beobachter.observe(el);
    return () => beobachter.disconnect();
  }, [ref]);
  return breite;
}

/** Text in die Zwischenablage; false, wenn der Browser es verweigert. */
export async function kopiereText(text) {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    // Fallback unten
  }
  try {
    const feld = document.createElement('textarea');
    feld.value = text;
    feld.setAttribute('readonly', '');
    feld.style.position = 'fixed';
    feld.style.top = '-1000px';
    document.body.appendChild(feld);
    feld.select();
    const ok = document.execCommand('copy');
    document.body.removeChild(feld);
    return ok;
  } catch {
    return false;
  }
}

/** Hook: kurzes „Kopiert“-Feedback nach einer Kopieraktion. */
export function useKopieren(dauer = 1600) {
  const [zustand, setZustand] = useState('bereit'); // bereit | kopiert | fehler
  const kopiere = async (text) => {
    const ok = await kopiereText(text);
    setZustand(ok ? 'kopiert' : 'fehler');
    window.setTimeout(() => setZustand('bereit'), dauer);
    return ok;
  };
  return [zustand, kopiere];
}

/** Weiche Trennstriche (U+00AD) aus Datenlabels entfernen, wo Umbruch nicht gewünscht ist. */
export function ohneTrennstriche(text) {
  return String(text ?? '').replace(/­/g, '');
}

/**
 * Saubere Achsenschritte: Obergrenze und Ticks in 1-2-2,5-5-Schritten,
 * z. B. 254 → 0, 50, …, 300. Für Prozentachsen bis 100 feste Viertel.
 * @param {number} max größter Wert
 * @param {number} [anzahl=6] ungefähre Zahl der Ticks
 */
export function schoeneTicks(max, anzahl = 6) {
  const m = Number(max);
  if (!(m > 0)) return { max: 1, ticks: [0, 1] };
  const roh = m / anzahl;
  const mag = 10 ** Math.floor(Math.log10(roh));
  const rest = roh / mag;
  const schritt = (rest <= 1 ? 1 : rest <= 2 ? 2 : rest <= 2.5 ? 2.5 : rest <= 5 ? 5 : 10) * mag;
  const obergrenze = Math.ceil(m / schritt - 1e-9) * schritt;
  const ticks = [];
  for (let v = 0; v <= obergrenze + 1e-9; v += schritt) ticks.push(Number(v.toFixed(10)));
  return { max: Number(obergrenze.toFixed(10)), ticks };
}
