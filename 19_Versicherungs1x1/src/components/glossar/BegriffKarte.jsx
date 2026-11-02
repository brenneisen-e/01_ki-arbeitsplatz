// ===========================================================================
// BegriffKarte — Hover-Card für Glossarbegriffe (Brief §5, Muster 8).
//
// `useBegriffKarte(slug)` liefert die Props für den Auslöser (Link im Text
// oder Chip) und die Karte als Portal. Die Karte ist ein nicht-modaler
// Dialog: kein Schleier, keine Fokusfalle, im Fenster geklemmt.
//
// Öffnen: nach ~600 ms Hover, bei Fokus (Tab), bei Klick/Tipp (dann „fest“:
// schließt nicht, wenn die Maus den Begriff verlässt). Ist die Karte schon
// offen, folgt ein Klick dem Link ins Glossar. Pfeil runter führt den Fokus
// in die Karte; Tab aus der Karte hinaus, Esc, Klick außerhalb und ein
// Routenwechsel schließen sie. Es ist immer nur eine Karte offen.
// ===========================================================================
import { useCallback, useEffect, useId, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { BookOpen } from 'lucide-react';
import { useWissen } from '../../store/Wissen.jsx';
import Knopf from '../ui/Knopf.jsx';
import { berechnePosition, fokussierbare } from '../ui/schweben.js';
import { mehrzahl } from '../../lib/format.js';
import { useBegriffsDaten } from './begriffsDaten.js';

const HOVER_MS = 600;
const FOKUS_MS = 120;
const VERLASSEN_MS = 220;

/** Die eine offene Karte (Modul-Register): { id, schliesse } oder null. */
let offeneKarte = null;

function inEingabe(ziel) {
  return ziel instanceof Element && (ziel.tagName === 'INPUT' || ziel.tagName === 'TEXTAREA' || ziel.isContentEditable);
}

/**
 * @param {string} slug Glossar-Slug
 * @returns {{ eintrag: object|null, offen: boolean, ankerProps: object, karte: import('react').ReactNode }}
 */
export function useBegriffKarte(slug) {
  const { routeZuHash } = useWissen();
  const daten = useBegriffsDaten();
  const eintrag = daten.nachSlug.get(slug) || null;
  const id = useId();
  const karteId = `begriffkarte-${id}`;

  const [offen, setOffen] = useState(false);
  const [fest, setFest] = useState(false);
  const [pos, setPos] = useState(null);
  const offenRef = useRef(false);
  const festRef = useRef(false);
  const ankerRef = useRef(null);
  const karteRef = useRef(null);
  const timerAuf = useRef(0);
  const timerZu = useRef(0);
  // Fokus, den die Karte selbst zurückgibt (Esc, Tab hinaus), darf sie nicht gleich wieder öffnen
  const fokusStumm = useRef(false);

  const loescheTimer = () => { window.clearTimeout(timerAuf.current); window.clearTimeout(timerZu.current); };

  const schliesse = useCallback((fokusZurueck = false) => {
    loescheTimer();
    if (offeneKarte && offeneKarte.id === id) offeneKarte = null;
    offenRef.current = false;
    festRef.current = false;
    setOffen(false);
    setFest(false);
    if (fokusZurueck && ankerRef.current) {
      fokusStumm.current = true;
      ankerRef.current.focus({ preventScroll: true });
      window.setTimeout(() => { fokusStumm.current = false; }, 0);
    }
  }, [id]);

  const oeffne = useCallback((festOeffnen) => {
    loescheTimer();
    if (offeneKarte && offeneKarte.id !== id) offeneKarte.schliesse();
    offeneKarte = { id, schliesse: () => schliesse(false) };
    offenRef.current = true;
    setOffen(true);
    if (festOeffnen) { festRef.current = true; setFest(true); }
  }, [id, schliesse]);

  const planeSchliessen = useCallback(() => {
    if (festRef.current) return;
    window.clearTimeout(timerZu.current);
    timerZu.current = window.setTimeout(() => {
      if (karteRef.current && karteRef.current.matches(':hover')) return;
      if (karteRef.current && karteRef.current.contains(document.activeElement)) return;
      schliesse(false);
    }, VERLASSEN_MS);
  }, [schliesse]);

  useEffect(() => () => { loescheTimer(); if (offeneKarte && offeneKarte.id === id) offeneKarte = null; }, [id]);

  // Position am Anker, im Fenster geklemmt; folgt Scrollen und Größenänderung
  useLayoutEffect(() => {
    if (!offen || !ankerRef.current || !karteRef.current) { setPos(null); return undefined; }
    const setze = () => {
      if (!ankerRef.current || !karteRef.current) return;
      const anker = ankerRef.current.getBoundingClientRect();
      const b = karteRef.current.getBoundingClientRect();
      setPos(berechnePosition(anker, { width: b.width, height: b.height }, { seite: 'unten', ausrichtung: 'anfang', abstand: 6, rand: 12 }));
    };
    setze();
    window.addEventListener('scroll', setze, true);
    window.addEventListener('resize', setze);
    return () => { window.removeEventListener('scroll', setze, true); window.removeEventListener('resize', setze); };
  }, [offen, eintrag]);

  // Klick außerhalb, Esc, globale Kürzel (Suche, Hilfe) und Routenwechsel schließen
  useEffect(() => {
    if (!offen) return undefined;
    const aufZeiger = (e) => {
      if (karteRef.current?.contains(e.target) || ankerRef.current?.contains(e.target)) return;
      schliesse(false);
    };
    const aufTaste = (e) => {
      if (e.key === 'Escape') {
        const innen = karteRef.current?.contains(document.activeElement) || document.activeElement === ankerRef.current;
        schliesse(Boolean(innen));
        return;
      }
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') { schliesse(false); return; }
      if ((e.key === '/' || e.key === '?') && !inEingabe(e.target)) schliesse(false);
    };
    const aufRoute = () => schliesse(false);
    document.addEventListener('pointerdown', aufZeiger, true);
    document.addEventListener('keydown', aufTaste);
    window.addEventListener('hashchange', aufRoute);
    return () => {
      document.removeEventListener('pointerdown', aufZeiger, true);
      document.removeEventListener('keydown', aufTaste);
      window.removeEventListener('hashchange', aufRoute);
    };
  }, [offen, schliesse]);

  const fokusInKarte = () => {
    const ziel = fokussierbare(karteRef.current)[0] || karteRef.current;
    if (ziel) ziel.focus({ preventScroll: true });
  };

  const ankerProps = eintrag ? {
    ref: ankerRef,
    'aria-haspopup': 'dialog',
    'aria-expanded': offen,
    'aria-controls': offen ? karteId : undefined,
    'data-begriff': slug,
    onMouseEnter: () => {
      window.clearTimeout(timerZu.current);
      if (offenRef.current) return;
      window.clearTimeout(timerAuf.current);
      timerAuf.current = window.setTimeout(() => oeffne(false), HOVER_MS);
    },
    onMouseLeave: () => {
      window.clearTimeout(timerAuf.current);
      if (offenRef.current) planeSchliessen();
    },
    onFocus: () => {
      if (fokusStumm.current) { fokusStumm.current = false; return; }
      if (offenRef.current) return;
      window.clearTimeout(timerAuf.current);
      timerAuf.current = window.setTimeout(() => oeffne(false), FOKUS_MS);
    },
    onBlur: () => {
      window.clearTimeout(timerAuf.current);
      window.setTimeout(() => {
        if (!offenRef.current) return;
        const aktiv = document.activeElement;
        if (karteRef.current?.contains(aktiv) || aktiv === ankerRef.current) return;
        schliesse(false);
      }, 0);
    },
    onClick: (e) => {
      if (offenRef.current) { schliesse(false); return; } // Karte offen → der Link führt ins Glossar
      e.preventDefault();
      oeffne(true);
    },
    onKeyDown: (e) => {
      if (e.key === 'ArrowDown' && offenRef.current) { e.preventDefault(); fokusInKarte(); }
      else if (e.key === 'ArrowDown') { e.preventDefault(); oeffne(true); window.requestAnimationFrame(fokusInKarte); }
    },
  } : {};

  const aufKarteTaste = (e) => {
    if (e.key !== 'Tab') return;
    const liste = fokussierbare(karteRef.current);
    const erstes = liste[0];
    const letztes = liste[liste.length - 1];
    if ((!e.shiftKey && (document.activeElement === letztes || liste.length === 0))
      || (e.shiftKey && (document.activeElement === erstes || document.activeElement === karteRef.current))) {
      e.preventDefault();
      schliesse(true);
    }
  };

  const anzahlEinheiten = offen && eintrag ? (daten.vorkommen.get(eintrag.slug) || []).length : 0;

  const karte = offen && eintrag ? createPortal(
    <div
      ref={karteRef}
      id={karteId}
      role="dialog"
      aria-label={`${eintrag.term} – Begriffserklärung`}
      tabIndex={-1}
      className="hoverkarte"
      data-fest={fest ? 'true' : 'false'}
      style={{ top: pos ? pos.top : -9999, left: pos ? pos.left : -9999, visibility: pos ? 'visible' : 'hidden' }}
      onMouseEnter={() => window.clearTimeout(timerZu.current)}
      onMouseLeave={planeSchliessen}
      onKeyDown={aufKarteTaste}
    >
      <div className="hoverkarte-kopf">
        <span className="hoverkarte-begriff">{eintrag.term}</span>
        {eintrag.tags && eintrag.tags.length > 0 && <span className="hoverkarte-tags">{eintrag.tags.join(' · ')}</span>}
      </div>
      <p className="hoverkarte-text">{eintrag.definition}</p>
      <div className="hoverkarte-fuss">
        <Knopf variante="weich" groesse="klein" symbol={BookOpen} href={routeZuHash({ name: 'glossar', slug: eintrag.slug })} onClick={() => schliesse(false)}>
          Im Glossar öffnen
        </Knopf>
        {anzahlEinheiten > 0 && (
          <span className="hoverkarte-vorkommen">Kommt vor in {mehrzahl(anzahlEinheiten, 'Lerneinheit', 'Lerneinheiten')}</span>
        )}
      </div>
    </div>,
    document.body,
  ) : null;

  return { eintrag, offen, ankerProps, karte };
}
