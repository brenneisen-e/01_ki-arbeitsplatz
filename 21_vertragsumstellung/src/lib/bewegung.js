// ============================================================
// Bewegung — die eine Stelle, an der Ansichtswechsel, Zählwerte
// und Erst-Render-Erkennung entschieden werden.
//
// Dauern und Kurven stehen als Token in index.css (Abschnitt 2.10);
// hier liegen nur die Werte, die JavaScript selbst braucht, und die
// Regel, dass unter prefers-reduced-motion nichts läuft.
// ============================================================

import { useEffect, useRef, useState } from 'react'

/** Dauern in ms — spiegeln die Token --vg-* aus index.css. */
export const DAUER = {
  sofort: 60,
  schnell: 120,
  normal: 180,
  ruhig: 260,
  bahn: 340,
  daten: 420,
  einzug: 700,
  zaehl: 900,
  staffel: 45,
  staffelKachel: 18,
}

/** Kurve für Zählwerte und Zahlen-Tweening: schnell los, weich ankommen. */
export function easeOutCubic(t) {
  return 1 - Math.pow(1 - t, 3)
}

/** true, wenn der Nutzer Bewegung ausgeschaltet hat. */
export function reduzierteBewegung() {
  return typeof matchMedia === 'function' &&
    matchMedia('(prefers-reduced-motion: reduce)').matches
}

// Wartefrist auf den DOM-Umbau nach fn(). React schreibt Zustandsänderungen
// aus einem View-Transition-Rückruf erst in einer späteren Aufgabe ins DOM,
// und die Hash-Navigation braucht zusätzlich das hashchange-Ereignis. Ein
// MutationObserver erkennt beides, ohne in React einzugreifen; die Frist
// fängt nur den Fall ab, dass fn() gar nichts verändert.
const UMBAU_FRIST = 200

/**
 * Führt fn als View Transition aus, wenn der Browser sie kennt und der
 * Nutzer Bewegung zulässt — sonst sofort und ohne Übergang. Der Rückruf
 * darf synchron Zustand setzen (Reiter, Schritt), den Hash wechseln oder
 * Token auf das Wurzelelement schreiben; der Übergang wartet auf den
 * ersten DOM-Umbau danach. Gibt die ViewTransition zurück oder null.
 */
export function mitUebergang(fn) {
  if (typeof document === 'undefined' ||
      typeof document.startViewTransition !== 'function' ||
      reduzierteBewegung()) {
    fn()
    return null
  }
  try {
    return document.startViewTransition(() => new Promise((fertig) => {
      const wurzel = document.documentElement
      let beobachter = null
      let frist = 0
      const abschliessen = () => {
        clearTimeout(frist)
        beobachter?.disconnect()
        fertig()
      }
      beobachter = new MutationObserver(abschliessen)
      beobachter.observe(wurzel, { childList: true, subtree: true, attributes: true, characterData: true })

      let ergebnis
      try { ergebnis = fn() } catch (fehler) { abschliessen(); throw fehler }

      if (ergebnis && typeof ergebnis.then === 'function') {
        ergebnis.then(abschliessen, abschliessen)
        return
      }
      // fn hat das DOM bereits synchron verändert: nicht warten.
      if (beobachter.takeRecords().length) { abschliessen(); return }
      frist = setTimeout(abschliessen, UMBAU_FRIST)
    }))
  } catch {
    fn()
    return null
  }
}

/**
 * Zählwert: läuft beim ersten Erscheinen einmal von `von` (Standard 0) auf
 * `ziel` — Leitzahl der Startseite, 900 ms, easeOutCubic. Spätere
 * Zieländerungen laufen wie jede andere Zahl in 420 ms vom aktuellen
 * Stand weiter. Unter prefers-reduced-motion steht sofort der Endwert.
 *
 * Fortschritt für das Einfärben „ab 90 % des Wegs“:
 *   Math.abs(wert - von) >= 0.9 * Math.abs(ziel - von)
 */
export function useZaehlwert(ziel, { dauer = DAUER.zaehl, von = 0 } = {}) {
  const sofort = reduzierteBewegung() || !Number.isFinite(ziel)
  const [wert, setWert] = useState(sofort ? ziel : von)
  const aktuellRef = useRef(sofort ? ziel : von)
  const erstesRef = useRef(true)

  useEffect(() => {
    if (!Number.isFinite(ziel) || reduzierteBewegung()) {
      aktuellRef.current = ziel
      setWert(ziel)
      return
    }
    const erstes = erstesRef.current
    const startWert = erstes ? von : aktuellRef.current
    const laufzeit = erstes ? dauer : DAUER.daten
    if (Math.abs(ziel - startWert) < 1e-9) { setWert(ziel); return }

    const start = performance.now()
    let raf = 0
    const schritt = (jetzt) => {
      // Erst mit dem ersten gezeichneten Bild gilt der Zählwert als
      // angelaufen — so übersteht er ein Abbrechen vor dem ersten Frame.
      erstesRef.current = false
      const t = Math.min(1, (jetzt - start) / laufzeit)
      const v = startWert + (ziel - startWert) * easeOutCubic(t)
      aktuellRef.current = v
      setWert(v)
      if (t < 1) raf = requestAnimationFrame(schritt)
      else aktuellRef.current = ziel
    }
    raf = requestAnimationFrame(schritt)
    return () => cancelAnimationFrame(raf)
  }, [ziel, dauer, von])

  return wert
}

/**
 * Ref-Flag, das nur beim ersten Rendern true ist. Diagramme entscheiden
 * damit zwischen Aufbau aus der Grundlinie (Mount) und dem 420-ms-Morph
 * bei jedem späteren Wertwechsel: `const erstes = useErstesRendern()`
 * und im Rumpf `erstes.current`.
 */
export function useErstesRendern() {
  const ref = useRef(true)
  useEffect(() => { ref.current = false }, [])
  return ref
}
