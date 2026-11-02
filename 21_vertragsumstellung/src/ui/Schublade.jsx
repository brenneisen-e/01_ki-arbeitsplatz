import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'
import { Btn } from './basis'
import './schublade.css'

function useEscape(onSchliessen) {
  useEffect(() => {
    if (!onSchliessen) return undefined
    const auf = (e) => { if (e.key === 'Escape') onSchliessen() }
    document.addEventListener('keydown', auf)
    return () => document.removeEventListener('keydown', auf)
  }, [onSchliessen])
}

function useFokusfalle(ref) {
  useEffect(() => {
    const vorher = document.activeElement
    const knoten = ref.current
    if (!knoten) return
    const ziel = knoten.querySelector('[data-autofokus]') || knoten
    ziel.focus?.()
    const auf = (e) => {
      if (e.key !== 'Tab') return
      const fokussierbar = knoten.querySelectorAll(
        'a[href], button:not([disabled]), input:not([disabled]), select, textarea, [tabindex]:not([tabindex="-1"])')
      if (!fokussierbar.length) return
      const erster = fokussierbar[0]
      const letzter = fokussierbar[fokussierbar.length - 1]
      if (e.shiftKey && document.activeElement === erster) { e.preventDefault(); letzter.focus() }
      else if (!e.shiftKey && document.activeElement === letzter) { e.preventDefault(); erster.focus() }
    }
    knoten.addEventListener('keydown', auf)
    return () => { knoten.removeEventListener('keydown', auf); vorher?.focus?.() }
  }, [ref])
}

/** Nicht-modal: der Fokus geht einmal hinein und beim Schließen zurück,
    Tab darf die Schublade aber jederzeit verlassen — die Seite dahinter
    bleibt bedienbar. */
function useAnfangsfokus(ref) {
  useEffect(() => {
    const vorher = document.activeElement
    const knoten = ref.current
    if (!knoten) return
    const ziel = knoten.querySelector('[data-autofokus]') || knoten
    ziel.focus?.()
    return () => { vorher?.focus?.() }
  }, [ref])
}

const KEIN_KNOTEN = { current: null }

/** true unterhalb von 1024 px — dort ist jede Schublade modal. */
function useSchmal() {
  const [schmal, setSchmal] = useState(() =>
    typeof matchMedia === 'function' && matchMedia('(max-width: 1024px)').matches)
  useEffect(() => {
    if (typeof matchMedia !== 'function') return undefined
    const abfrage = matchMedia('(max-width: 1024px)')
    const auf = (e) => setSchmal(e.matches)
    abfrage.addEventListener('change', auf)
    return () => abfrage.removeEventListener('change', auf)
  }, [])
  return schmal
}

/**
 * Schublade von rechts.
 * - `nichtModal`: kein Schleier, keine Fokusfalle, role=complementary; Esc und
 *   das X bleiben. Unter 1024 px wird sie trotzdem modal (volle Breite).
 * - `leiste`: zweite Zeile im Kopf mit Haarlinie; bleibt beim Scrollen stehen.
 * - `breite="verhandlung"`: Breite, die den Steuerblock links freilässt.
 */
export function Schublade({ offen, onSchliessen, titel, unter, breit, breite, leiste, nichtModal, fuss, children }) {
  const ref = useRef(null)
  const schmal = useSchmal()
  const modal = !nichtModal || schmal
  useEscape(offen ? onSchliessen : null)
  useFokusfalle(offen && modal ? ref : KEIN_KNOTEN)
  useAnfangsfokus(offen && !modal ? ref : KEIN_KNOTEN)
  if (!offen) return null

  const klassen = ['vg-schublade', 'vg-nicht-drucken']
  if (breit) klassen.push('vg-schublade-breit')
  if (breite === 'verhandlung') klassen.push('vg-schublade-verhandlung')

  return createPortal(
    <>
      {modal && <div className="vg-schleier vg-nicht-drucken" onClick={onSchliessen} />}
      <aside
        ref={ref}
        className={klassen.join(' ')}
        role={modal ? 'dialog' : 'complementary'}
        aria-modal={modal ? 'true' : undefined}
        aria-label={titel}
        tabIndex={-1}
      >
        <header className={`vg-schublade-kopf${leiste ? ' vg-schublade-kopf-mit-leiste' : ''}`}>
          <div className="vg-schublade-kopfzeile">
            <div className="vg-karte-kopf-titel">
              <span className="vg-karte-titel">{titel}</span>
              {unter && <span className="vg-karte-unter">{unter}</span>}
            </div>
            <Btn variante="still" nurIkone ikone={X} onClick={onSchliessen} aria-label="Schließen" />
          </div>
          {leiste && <div className="vg-schublade-leiste">{leiste}</div>}
        </header>
        <div className="vg-schublade-koerper">{children}</div>
        {fuss && <footer className="vg-schublade-fuss">{fuss}</footer>}
      </aside>
    </>,
    document.body,
  )
}

export function Dialog({ offen, onSchliessen, titel, unter, fuss, children }) {
  const ref = useRef(null)
  useEscape(offen ? onSchliessen : null)
  useFokusfalle(offen ? ref : KEIN_KNOTEN)
  if (!offen) return null

  return createPortal(
    <>
      <div className="vg-schleier vg-nicht-drucken" onClick={onSchliessen} />
      <div ref={ref} className="vg-dialog vg-nicht-drucken" role="dialog" aria-modal="true" aria-label={titel} tabIndex={-1}>
        <header className="vg-schublade-kopf">
          <div className="vg-karte-kopf-titel">
            <span className="vg-karte-titel">{titel}</span>
            {unter && <span className="vg-karte-unter">{unter}</span>}
          </div>
          <Btn variante="still" nurIkone ikone={X} onClick={onSchliessen} aria-label="Schließen" />
        </header>
        <div className="vg-schublade-koerper">{children}</div>
        {fuss && <footer className="vg-schublade-fuss">{fuss}</footer>}
      </div>
    </>,
    document.body,
  )
}
