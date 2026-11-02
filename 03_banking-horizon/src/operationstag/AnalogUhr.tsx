// ─────────────────────────────────────────────────────────────────────────────
// AnalogUhr — die Tageszeit der aktuellen Szene als analoge Uhr.
//
// Gestaltung nach dem Braun/Rams-Prinzip „weniger, aber besser": reines weißes
// Zifferblatt, feine Minuterie mit vier betonten Viertelstunden, drei klar
// unterscheidbare Zeiger (kurz und kräftig für die Stunde, lang und schlank für
// die Minute, haarfein in Akzentgrün für die Sekunde). Kein Rahmen-Chrome,
// keine Verzierung — nur das, was man zum Ablesen braucht.
//
// Beim Stationswechsel läuft die Uhr sichtbar VOR statt umzuspringen: die
// Zeiger drehen sich bis zur neuen Szenenzeit, und zwar über die gesamte Länge
// des Videoübergangs — die Uhr ist also genau so lange unterwegs wie Mara.
// Zwischen den Wechseln tickt sie ruhig in Echtzeit weiter.
//
// WICHTIG für die Wiedergabe: Die Zeiger werden direkt am DOM gesetzt, nicht
// über React-State. Ein setState je Einzelbild hieße bei einem 13 Sekunden
// langen Vorlauf mehrere hundert Renderings parallel zur Videodekodierung —
// genau das hat die Übergänge ruckeln lassen. Hier rendert React nur noch,
// wenn sich die Zielzeit ändert.
// ─────────────────────────────────────────────────────────────────────────────

import { useEffect, useRef, useState } from 'react'
import styles from './OperationsTag.module.css'

/** 'HH:MM' → Minuten seit Mitternacht. */
function toMinutes(zeit: string): number {
  const [h, m] = zeit.split(':').map((n) => parseInt(n, 10))
  return (Number.isFinite(h) ? h : 0) * 60 + (Number.isFinite(m) ? m : 0)
}

const R = 50 // Radius im viewBox

/** Punkt auf dem Zifferblatt für einen Winkel in Grad (0 = 12 Uhr). */
function pt(grad: number, laenge: number): [number, number] {
  const a = (grad * Math.PI) / 180
  return [R + laenge * Math.sin(a), R - laenge * Math.cos(a)]
}

/**
 * @param zeit  Szenenzeit 'HH:MM', auf die die Uhr laufen soll.
 * @param dauer Laufzeit des Vorlaufs in Millisekunden. Läuft gerade ein
 *   Videoübergang, ist das dessen Laufzeit: die Uhr ist dann genau so lange
 *   unterwegs wie Mara. Ohne Angabe (Sprung über die Zeitleiste) wird eine
 *   kurze Dauer aus der Zeitspanne abgeleitet.
 */
export function AnalogUhr({ zeit, dauer }: { zeit: string; dauer?: number }): React.ReactElement {
  const ziel = toMinutes(zeit)
  const [vorlauf, setVorlauf] = useState(false)

  const minuten = useRef(ziel)
  const raf = useRef(0)
  const dauerRef = useRef(dauer)
  dauerRef.current = dauer

  const stunde = useRef<SVGLineElement>(null)
  const minute = useRef<SVGLineElement>(null)
  const sekunde = useRef<SVGLineElement>(null)
  const stundeText = useRef<HTMLSpanElement>(null)
  const minuteText = useRef<HTMLSpanElement>(null)
  const svg = useRef<SVGSVGElement>(null)

  /** Zeiger und Ziffernanzeige unmittelbar am DOM setzen. */
  const zeichne = (m: number) => {
    minuten.current = m
    const setze = (el: SVGLineElement | null, grad: number, laenge: number) => {
      if (!el) return
      const [x, y] = pt(grad, laenge)
      el.setAttribute('x2', String(x))
      el.setAttribute('y2', String(y))
    }
    setze(stunde.current, ((m % 720) / 720) * 360, 25)
    setze(minute.current, ((m % 60) / 60) * 360, 36)
    setze(sekunde.current, ((m * 60) % 60) * 6, 38)
    const hh = String(Math.floor(m / 60) % 24).padStart(2, '0')
    const mm = String(Math.floor(m % 60)).padStart(2, '0')
    // Nur schreiben, wenn sich die angezeigte Minute wirklich aendert.
    if (stundeText.current && stundeText.current.textContent !== hh) {
      stundeText.current.textContent = hh
    }
    if (minuteText.current && minuteText.current.textContent !== mm) {
      minuteText.current.textContent = mm
      svg.current?.setAttribute('aria-label', `Uhrzeit ${hh}:${mm}`)
    }
  }

  // Erststand setzen.
  useEffect(() => {
    zeichne(minuten.current)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Vorlauf auf die neue Szenenzeit.
  useEffect(() => {
    const von = minuten.current
    const delta = ziel - von
    if (Math.abs(delta) < 0.5) return
    const lauf = dauerRef.current ?? Math.min(2400, Math.max(700, Math.abs(delta) * 12))
    const start = performance.now()
    setVorlauf(true)
    const tick = (ts: number) => {
      const p = Math.min(1, (ts - start) / lauf)
      // sanft an- und auslaufen, dazwischen zügig
      const e = p < 0.5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2
      zeichne(von + delta * e)
      if (p < 1) raf.current = requestAnimationFrame(tick)
      else setVorlauf(false)
    }
    raf.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf.current)
    // Bewusst nur auf die Zielzeit reagieren, nicht auf das laufende Ticken.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ziel])

  // Steht man in einer Szene, laeuft die Uhr in Echtzeit weiter: sichtbar
  // bewegt sich nur der Sekundenzeiger, der Minutenzeiger kriecht wie bei einer
  // echten Uhr. Der grosse Sprung passiert allein beim Stationswechsel.
  useEffect(() => {
    const id = window.setInterval(() => zeichne(minuten.current + 1 / 60), 1000)
    return () => window.clearInterval(id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className={styles.uhrBox} data-vorlauf={vorlauf || undefined}>
      <svg ref={svg} viewBox="0 0 100 100" className={styles.uhr} role="img" aria-label="Uhrzeit">
        <circle cx={R} cy={R} r="48" className={styles.uhrBlatt} />
        {Array.from({ length: 12 }, (_, i) => {
          const viertel = i % 3 === 0
          const [x1, y1] = pt(i * 30, viertel ? 37 : 41)
          const [x2, y2] = pt(i * 30, 44)
          return (
            <line
              key={i}
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              className={viertel ? styles.uhrStrichLang : styles.uhrStrich}
            />
          )
        })}
        <line ref={stunde} x1={R} y1={R} x2={R} y2={R} className={styles.zeigerStunde} />
        <line ref={minute} x1={R} y1={R} x2={R} y2={R} className={styles.zeigerMinute} />
        <line ref={sekunde} x1={R} y1={R} x2={R} y2={R} className={styles.zeigerSekunde} />
        <circle cx={R} cy={R} r="2.4" className={styles.uhrMitte} />
      </svg>
      <span className={styles.uhrZeit}>
        <span ref={stundeText} />
        <span className={styles.uhrDoppelpunkt}>:</span>
        <span ref={minuteText} />
      </span>
    </div>
  )
}
