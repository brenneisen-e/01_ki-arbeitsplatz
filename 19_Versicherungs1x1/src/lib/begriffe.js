// ===========================================================================
// begriffe.js — Glossarbegriffe im Text finden.
//
// Regeln: Wortgrenzen (Unicode), längster Begriff zuerst, Groß-/Klein-
// schreibung egal — außer bei Abkürzungen in Großbuchstaben (AO, BU, KV, ZZR),
// die exakt passen müssen, sonst träfe „bu“ jedes „bu…“-Fragment nicht, wohl
// aber ein zufälliges Wort. Einfache Pluraltoleranz: -s, -e, -en, -n.
// Begriffe mit Klammerzusatz („Zinszusatzreserve (ZZR)“) werden in Hauptteil
// und Abkürzung zerlegt; beide zählen.
// ===========================================================================
import { slug, blockText } from './text.js';
import { alleBloecke } from './bloecke.js';

/** Slug eines Begriffs (ASCII, eindeutig genug für #/glossar/:slug). */
export function slugFuerBegriff(term) {
  return slug(term);
}

function entkomme(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Ist `abk` eine plausible Abkürzung von `haupt`? Erster Buchstabe gleich und
 * alle Buchstaben in dieser Reihenfolge im Hauptbegriff enthalten
 * (ZZR ⊂ Zinszusatzreserve, bAV ⊂ betriebliche Altersversorgung) — so bleiben
 * Qualifizierer wie „(GKV)“, „(EU)“ oder „(IDD)“ außen vor.
 */
function passtAbkuerzung(abk, haupt) {
  const a = abk.toLowerCase();
  const h = haupt.toLowerCase();
  if (!a || !h || a[0] !== h[0]) return false;
  let i = 0;
  for (const zeichen of h) if (zeichen === a[i]) i += 1;
  return i >= a.length;
}

function istAbkuerzung(v) {
  return v.length <= 5 && /[A-ZÄÖÜ]/.test(v) && v.replace(/[^a-zäöü]/g, '').length <= 1;
}

/**
 * Schreibvarianten eines Begriffs mit Rang: 0 = der Begriff selbst,
 * 1 = Hauptteil vor der Klammer, 2 = abgeleitet aus dem Klammerzusatz
 * (Abkürzung oder großgeschriebenes Synonym).
 */
function varianten(term) {
  const t = String(term || '').trim();
  if (!t) return [];
  const klammer = t.match(/^(.*?)\s*\((.*?)\)\s*$/);
  if (!klammer) return [{ variante: t, rang: 0 }];
  const ergebnis = [];
  const haupt = klammer[1].trim();
  const zusatz = klammer[2].trim();
  if (haupt.length >= 2) ergebnis.push({ variante: haupt, rang: 1 });
  if (!/\s/.test(zusatz) && !/-$/.test(zusatz)) {
    for (const teil of zusatz.split('/').map((x) => x.trim()).filter(Boolean)) {
      if (istAbkuerzung(teil)) {
        if (passtAbkuerzung(teil, haupt)) ergebnis.push({ variante: teil, rang: 2 });
      } else if (teil.length >= 4 && /^[A-ZÄÖÜ]/.test(teil)) {
        ergebnis.push({ variante: teil, rang: 2 });
      }
    }
  }
  return ergebnis.filter((v) => v.variante.length >= 2);
}

const cache = new WeakMap();

/** Baut (und merkt sich je Glossar-Array) den Suchapparat. */
function apparat(glossar) {
  if (!Array.isArray(glossar)) return null;
  if (cache.has(glossar)) return cache.get(glossar);
  const eintraege = [];
  for (const g of glossar) {
    if (!g || !g.term) continue;
    const s = g.slug || slugFuerBegriff(g.term);
    for (const { variante, rang } of varianten(g.term)) {
      eintraege.push({ variante, rang, schluessel: variante.toLowerCase(), abk: istAbkuerzung(variante), slug: s, term: g.term, eintrag: g });
    }
  }
  // längste Variante zuerst, damit „Combined Ratio“ vor „Ratio“ greift
  eintraege.sort((a, b) => b.variante.length - a.variante.length || a.variante.localeCompare(b.variante));
  // Je Schreibweise gewinnt der Eintrag mit dem niedrigsten Rang: der Begriff
  // selbst schlägt einen Hauptteil, der schlägt eine abgeleitete Abkürzung.
  const nachSchluessel = new Map();
  for (const e of eintraege) {
    const vorhanden = nachSchluessel.get(e.schluessel);
    if (!vorhanden || e.rang < vorhanden.rang) nachSchluessel.set(e.schluessel, e);
  }
  const muster = eintraege.map((e) => entkomme(e.variante)).join('|');
  const regex = muster
    ? new RegExp(`(?<![\\p{L}\\p{N}])(${muster})(s|en|e|n)?(?![\\p{L}\\p{N}])`, 'giu')
    : null;
  const a = { regex, nachSchluessel };
  cache.set(glossar, a);
  return a;
}

/**
 * Findet Glossarbegriffe in einem Klartext.
 * @param {string} text Klartext (HTML vorher mit entferneHtml entfernen)
 * @param {Array<{term:string, definition:string, slug?:string}>} glossar
 * @returns {Array<{ slug: string, term: string, start: number, ende: number, text: string }>}
 */
export function findeBegriffe(text, glossar) {
  const a = apparat(glossar);
  const treffer = [];
  if (!a || !a.regex || !text) return treffer;
  a.regex.lastIndex = 0;
  for (const m of String(text).matchAll(a.regex)) {
    const kern = m[1];
    const eintrag = a.nachSchluessel.get(kern.toLowerCase());
    if (!eintrag) continue;
    if (eintrag.abk && kern !== eintrag.variante) continue; // Abkürzungen exakt
    const start = m.index;
    const ende = start + m[0].length;
    treffer.push({ slug: eintrag.slug, term: eintrag.term, start, ende, text: m[0] });
  }
  return treffer;
}

/**
 * Eindeutige Begriffe, die im Text einer Lerneinheit vorkommen — sortiert nach
 * erstem Auftreten, mit Häufigkeit.
 * @param {object} einheit
 * @param {Array} glossar
 * @returns {Array<{ slug: string, term: string, definition: string, tags: string[], anzahl: number, eintrag: object }>}
 */
export function begriffeInEinheit(einheit, glossar) {
  if (!einheit || !Array.isArray(glossar)) return [];
  const text = alleBloecke(einheit).map((e) => blockText(e.block)).join('\n');
  const gefunden = new Map();
  for (const t of findeBegriffe(text, glossar)) {
    const g = gefunden.get(t.slug);
    if (g) g.anzahl += 1;
    else {
      const eintrag = glossar.find((x) => (x.slug || slugFuerBegriff(x.term)) === t.slug) || {};
      gefunden.set(t.slug, {
        slug: t.slug, term: eintrag.term || t.term, definition: eintrag.definition || '',
        tags: eintrag.tags || [], anzahl: 1, eintrag,
      });
    }
  }
  return [...gefunden.values()];
}

/**
 * Für das Glossar: in welchen Lerneinheiten kommt ein Begriff vor?
 * Liefert je Kapitel/Einheit die Häufigkeit; teuer, deshalb einmal je Sitzung
 * berechnen und merken (der Agent Glossar memoisiert).
 * @returns {Map<string, Array<{ kapitelId: string, einheitId: string, anzahl: number }>>} slug → Vorkommen
 */
export function vorkommenJeBegriff(kapitelListe, glossar) {
  const ergebnis = new Map();
  for (const kapitel of kapitelListe || []) {
    for (const einheit of kapitel.subChapters || []) {
      for (const b of begriffeInEinheit(einheit, glossar)) {
        if (!ergebnis.has(b.slug)) ergebnis.set(b.slug, []);
        ergebnis.get(b.slug).push({ kapitelId: kapitel.id, einheitId: einheit.id, anzahl: b.anzahl });
      }
    }
  }
  return ergebnis;
}
