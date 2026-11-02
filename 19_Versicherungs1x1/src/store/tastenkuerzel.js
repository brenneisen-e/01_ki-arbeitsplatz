// ===========================================================================
// tastenkuerzel.js — globale Kürzel (Brief §3) und ihre Liste für den
// Hilfedialog. Kürzel gelten nicht in Eingabefeldern, nicht mit Modifiern
// (außer ⌘/Strg+K) und nicht, solange Suche, Hilfe oder Schublade offen sind.
// ===========================================================================
import { useEffect } from 'react';
import { useWissen } from './Wissen.jsx';
import { naechsteTiefe } from '../lib/bloecke.js';

/** Für die Tastaturhilfe: Gruppen mit Tasten (Token „mod“ = ⌘ bzw. Strg). */
export const KUERZEL = [
  {
    gruppe: 'Überall',
    eintraege: [
      { tasten: [['mod', 'K'], ['/']], wirkung: 'Suche öffnen' },
      { tasten: [['g']], wirkung: 'Glossar öffnen' },
      { tasten: [['w']], wirkung: 'Wissenscheck öffnen' },
      { tasten: [['?']], wirkung: 'Diese Tastaturhilfe' },
      { tasten: [['Esc']], wirkung: 'Dialog, Suche oder Menü schließen' },
    ],
  },
  {
    gruppe: 'In einer Lerneinheit',
    eintraege: [
      { tasten: [['ArrowRight']], wirkung: 'Nächste Lerneinheit' },
      { tasten: [['ArrowLeft']], wirkung: 'Vorige Lerneinheit' },
      { tasten: [['t']], wirkung: 'Tiefe wechseln (Basis · Vertiefung · Experte)' },
    ],
  },
  {
    gruppe: 'Im Wissenscheck',
    eintraege: [
      { tasten: [['1'], ['4']], wirkung: 'Antwort wählen (oder die Buchstaben A bis D)', verbinder: 'bis' },
      { tasten: [['Enter'], ['ArrowRight']], wirkung: 'Weiter zur nächsten Frage' },
      { tasten: [['Esc']], wirkung: 'Durchgang abbrechen (mit Rückfrage)' },
    ],
  },
];

function inEingabe(ziel) {
  if (!ziel || !(ziel instanceof Element)) return false;
  const tag = ziel.tagName;
  if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return true;
  if (ziel.isContentEditable) return true;
  return Boolean(ziel.closest('[contenteditable="true"]'));
}

// Elemente, die Pfeiltasten selbst auswerten
const PFEIL_SELBST = '[role="radiogroup"], [role="dialog"], [role="listbox"], [role="menu"], [role="tablist"], [role="slider"], input[type="range"], [data-pfeile-selbst]';

/** Einmal in der App-Shell aufrufen. */
export function useTastenkuerzel() {
  const {
    route, kapitel, einheit, tiefe, setzeTiefe,
    naechsteEinheit, vorherigeEinheit, oeffneKapitel,
    sucheOffen, oeffneSuche, schliesseSuche, oeffneGlossar, oeffneWissenscheck,
    hilfeOffen, oeffneHilfe, schliesseHilfe, drawerOffen, umfang,
  } = useWissen();

  useEffect(() => {
    const aufTaste = (e) => {
      if (e.defaultPrevented) return;
      const taste = e.key;

      // ⌘K / Strg K: Suche umschalten — auch aus Eingabefeldern heraus
      if ((e.metaKey || e.ctrlKey) && !e.altKey && !e.shiftKey && taste.toLowerCase() === 'k') {
        e.preventDefault();
        if (sucheOffen) schliesseSuche(); else oeffneSuche();
        return;
      }
      // Umfang: ⌘/Strg + Umschalt + U. Steht bewusst nicht in KUERZEL —
      // die Einstellung gehört nicht in die Tastaturhilfe.
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && !e.altKey && taste.toLowerCase() === 'u') {
        e.preventDefault();
        umfang.schaltePanel();
        return;
      }
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      if (inEingabe(e.target)) return;
      if (e.repeat && (taste === '?' || taste === '/')) return;

      // Solange ein Overlay offen ist, gelten nur dessen Tasten (Esc regelt es selbst)
      if (sucheOffen || drawerOffen) return;
      if (hilfeOffen) {
        if (taste === '?') { e.preventDefault(); schliesseHilfe(); }
        return;
      }

      switch (taste) {
        case '/':
          e.preventDefault();
          oeffneSuche();
          return;
        case '?':
          e.preventDefault();
          oeffneHilfe();
          return;
        case 'g':
          oeffneGlossar();
          return;
        case 'w':
          oeffneWissenscheck();
          return;
        case 't':
          // Tiefen ohne Inhalt in dieser Lerneinheit werden übersprungen
          if (route.name === 'kapitel') setzeTiefe(naechsteTiefe(tiefe, einheit));
          return;
        case 'ArrowRight':
        case 'ArrowLeft': {
          if (route.name !== 'kapitel' || !kapitel || !einheit) return;
          if (e.target instanceof Element && e.target.closest(PFEIL_SELBST)) return;
          const ziel = taste === 'ArrowRight'
            ? naechsteEinheit(kapitel.id, einheit.id)
            : vorherigeEinheit(kapitel.id, einheit.id);
          if (ziel) {
            e.preventDefault();
            oeffneKapitel(ziel.kapitel.id, ziel.einheit.id);
          }
          return;
        }
        default:
      }
    };
    window.addEventListener('keydown', aufTaste);
    return () => window.removeEventListener('keydown', aufTaste);
  }, [
    route.name, kapitel, einheit, tiefe, setzeTiefe, naechsteEinheit, vorherigeEinheit, oeffneKapitel,
    sucheOffen, oeffneSuche, schliesseSuche, oeffneGlossar, oeffneWissenscheck,
    hilfeOffen, oeffneHilfe, schliesseHilfe, drawerOffen, umfang,
  ]);
}
