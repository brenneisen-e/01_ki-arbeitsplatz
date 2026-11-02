// ===========================================================================
// schweben.js — gemeinsame Mechanik schwebender Flächen (Tooltip, Popover,
// Dialog, Schublade): Position am Anker mit Klemmung im Fenster, Fokusfalle,
// Fokus-Rückgabe, Scroll-Sperre und `inert` für den Hintergrund.
// ===========================================================================
import { useEffect, useLayoutEffect, useRef } from 'react';

export const FOKUSSIERBAR = [
  'a[href]', 'button:not([disabled])', 'input:not([disabled]):not([type="hidden"])',
  'select:not([disabled])', 'textarea:not([disabled])', '[tabindex]:not([tabindex="-1"])',
  '[contenteditable="true"]',
].join(',');

/** Alle sichtbaren fokussierbaren Elemente in einem Container. */
export function fokussierbare(container) {
  if (!container) return [];
  return [...container.querySelectorAll(FOKUSSIERBAR)].filter((el) => {
    if (el.getAttribute('aria-hidden') === 'true') return false;
    const r = el.getBoundingClientRect();
    return r.width > 0 || r.height > 0 || el === document.activeElement;
  });
}

/**
 * Position einer Fläche relativ zu einem Anker, im Fenster geklemmt.
 * @param {DOMRect} anker
 * @param {{width:number,height:number}} groesse
 * @param {{ seite?: 'unten'|'oben'|'rechts'|'links', ausrichtung?: 'mitte'|'anfang'|'ende', abstand?: number, rand?: number }} [opt]
 * @returns {{ top:number, left:number, seite:string }}
 */
export function berechnePosition(anker, groesse, opt = {}) {
  const { ausrichtung = 'mitte', abstand = 8, rand = 8 } = opt;
  let { seite = 'unten' } = opt;
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const b = groesse.width;
  const h = groesse.height;

  // Seite wechseln, wenn unten/oben kein Platz ist
  if (seite === 'unten' && anker.bottom + abstand + h > vh - rand && anker.top - abstand - h >= rand) seite = 'oben';
  else if (seite === 'oben' && anker.top - abstand - h < rand && anker.bottom + abstand + h <= vh - rand) seite = 'unten';

  let top;
  let left;
  if (seite === 'unten' || seite === 'oben') {
    top = seite === 'unten' ? anker.bottom + abstand : anker.top - abstand - h;
    if (ausrichtung === 'anfang') left = anker.left;
    else if (ausrichtung === 'ende') left = anker.right - b;
    else left = anker.left + anker.width / 2 - b / 2;
  } else {
    left = seite === 'rechts' ? anker.right + abstand : anker.left - abstand - b;
    top = anker.top + anker.height / 2 - h / 2;
  }
  left = Math.max(rand, Math.min(left, vw - rand - b));
  top = Math.max(rand, Math.min(top, vh - rand - h));
  return { top: Math.round(top), left: Math.round(left), seite };
}

/**
 * Hält den Fokus in `ref`, solange `aktiv`; setzt den Fokus beim Öffnen auf
 * [data-autofokus], sonst (anfang = 'erstes') das erste fokussierbare Element
 * bzw. (anfang = 'container') den Container selbst; gibt ihn beim Schließen an
 * das vorher fokussierte Element zurück.
 */
export function useFokusfalle(ref, aktiv, { anfang = 'erstes' } = {}) {
  const vorher = useRef(null);
  useLayoutEffect(() => {
    if (!aktiv) return undefined;
    vorher.current = document.activeElement;
    const container = ref.current;
    if (container && anfang) {
      const ziel = container.querySelector('[data-autofokus]')
        || (anfang === 'container' ? container : (fokussierbare(container)[0] || container));
      // nach dem Einblenden fokussieren, sonst springt die Seite
      requestAnimationFrame(() => ziel && ziel.focus({ preventScroll: true }));
    }
    return () => {
      const z = vorher.current;
      if (!z || typeof z.focus !== 'function' || !document.contains(z)) return;
      z.focus({ preventScroll: true });
      if (document.activeElement === z) return;
      // Trägt der Hintergrund noch `inert` (die Aufräumfunktion von
      // useHintergrundInert läuft erst nach dieser, wenn sie später deklariert
      // ist), verfällt focus() und der Fokus liegt im <body>. Einen Frame
      // später ist `inert` weg: noch einmal versuchen — aber nur, wenn
      // inzwischen niemand anders den Fokus geholt hat.
      requestAnimationFrame(() => {
        const aktuell = document.activeElement;
        if ((!aktuell || aktuell === document.body) && document.contains(z)) z.focus({ preventScroll: true });
      });
    };
  }, [aktiv, ref, anfang]);

  useEffect(() => {
    if (!aktiv) return undefined;
    const aufTab = (e) => {
      if (e.key !== 'Tab' || !ref.current) return;
      const liste = fokussierbare(ref.current);
      if (liste.length === 0) { e.preventDefault(); ref.current.focus(); return; }
      const erstes = liste[0];
      const letztes = liste[liste.length - 1];
      const aktuell = document.activeElement;
      if (e.shiftKey && (aktuell === erstes || !ref.current.contains(aktuell))) { e.preventDefault(); letztes.focus(); }
      else if (!e.shiftKey && (aktuell === letztes || !ref.current.contains(aktuell))) { e.preventDefault(); erstes.focus(); }
    };
    document.addEventListener('keydown', aufTab, true);
    return () => document.removeEventListener('keydown', aufTab, true);
  }, [aktiv, ref]);
}

/** Ruft `beiEsc`, wenn Escape gedrückt wird (nur solange aktiv). */
export function useEscape(aktiv, beiEsc) {
  useEffect(() => {
    if (!aktiv) return undefined;
    const aufTaste = (e) => {
      if (e.key === 'Escape' && !e.defaultPrevented) { e.preventDefault(); e.stopPropagation(); beiEsc && beiEsc(); }
    };
    document.addEventListener('keydown', aufTaste, true);
    return () => document.removeEventListener('keydown', aufTaste, true);
  }, [aktiv, beiEsc]);
}

let sperren = 0;
/** Sperrt das Scrollen der Seite (mehrfach verschachtelbar, Scrollbalken kompensiert). */
export function useScrollSperre(aktiv) {
  useLayoutEffect(() => {
    if (!aktiv) return undefined;
    sperren += 1;
    const html = document.documentElement;
    const alt = { overflow: html.style.overflow, padding: html.style.paddingRight };
    if (sperren === 1) {
      const breite = window.innerWidth - html.clientWidth;
      html.style.overflow = 'hidden';
      if (breite > 0) html.style.paddingRight = `${breite}px`;
    }
    return () => {
      sperren -= 1;
      if (sperren === 0) { html.style.overflow = alt.overflow; html.style.paddingRight = alt.padding; }
    };
  }, [aktiv]);
}

let inertZaehler = 0;
/** Setzt `inert` auf #root, solange ein modales Element offen ist. */
export function useHintergrundInert(aktiv) {
  useLayoutEffect(() => {
    if (!aktiv) return undefined;
    const root = document.getElementById('root');
    if (!root) return undefined;
    inertZaehler += 1;
    root.inert = true;
    root.setAttribute('aria-hidden', 'true');
    return () => {
      inertZaehler -= 1;
      if (inertZaehler === 0) { root.inert = false; root.removeAttribute('aria-hidden'); }
    };
  }, [aktiv]);
}
