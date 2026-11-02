// ===========================================================================
// begriffsDaten.js — gemeinsamer, gecachter Zugriff auf Glossar und
// Vorkommen für Hover-Card, Begriffs-Chips und Glossarseite.
//
// `vorkommenJeBegriff` scannt den Text aller 48 Lerneinheiten (rund 30 ms)
// und wird deshalb erst beim ersten Zugriff gerechnet und je Datenstand
// gemerkt (WeakMap auf dem Glossar-Array des Stores, das je `daten`
// memoisiert ist).
// ===========================================================================
import { useMemo } from 'react';
import { useWissen } from '../../store/Wissen.jsx';
import { vorkommenJeBegriff } from '../../lib/begriffe.js';

const cache = new WeakMap();

/**
 * Nachschlagewerke für ein (kapitelListe, glossar)-Paar.
 * @returns {{ nachSlug: Map<string, object>, einheiten: Map<string, {kapitel, einheit, kapitelIndex, einheitIndex}>, vorkommen: Map<string, Array> }}
 */
export function begriffsDaten(kapitelListe, glossar) {
  const liste = Array.isArray(glossar) ? glossar : [];
  const kapitel = Array.isArray(kapitelListe) ? kapitelListe : [];
  let d = cache.get(liste);
  if (d && d.kapitelListe === kapitel) return d;

  const nachSlug = new Map();
  for (const g of liste) if (g && g.slug) nachSlug.set(g.slug, g);
  const einheiten = new Map();
  kapitel.forEach((k, ki) => (k.subChapters || []).forEach((e, ei) => einheiten.set(`${k.id}/${e.id}`, { kapitel: k, einheit: e, kapitelIndex: ki, einheitIndex: ei })));

  let vorkommenCache = null;
  d = {
    kapitelListe: kapitel,
    nachSlug,
    einheiten,
    /** slug → [{ kapitelId, einheitId, anzahl }] in Lernreihenfolge; erst beim ersten Zugriff gerechnet. */
    get vorkommen() {
      if (!vorkommenCache) vorkommenCache = vorkommenJeBegriff(kapitel, liste);
      return vorkommenCache;
    },
  };
  cache.set(liste, d);
  return d;
}

/** Hook-Variante auf dem Store. */
export function useBegriffsDaten() {
  const { kapitelListe, glossar } = useWissen();
  return useMemo(() => begriffsDaten(kapitelListe, glossar), [kapitelListe, glossar]);
}

/**
 * Vorkommen eines Begriffs mit aufgelösten Kapitel-/Einheitsobjekten.
 * @returns {Array<{ kapitelId: string, einheitId: string, anzahl: number, kapitel: object, einheit: object, kapitelIndex: number }>}
 */
export function vorkommenVon(daten, slug) {
  if (!daten || !slug) return [];
  const liste = daten.vorkommen.get(slug) || [];
  return liste
    .map((v) => {
      const e = daten.einheiten.get(`${v.kapitelId}/${v.einheitId}`);
      return e ? { ...v, ...e } : null;
    })
    .filter(Boolean);
}
