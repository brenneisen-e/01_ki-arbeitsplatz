/**
 * Alle Eingänge des Demo-Postfachs.
 *
 * Fünf davon sind die verfremdeten Beispielanfragen aus dem Fachbereich
 * (beispiel 1–5), die übrigen sind frei erfunden. Jeder Eingang besteht aus
 *   mail        Absender, Betreff und Anhänge, wie sie im Postfach stehen
 *   dokumente   der Eingang als nachgebaute Seiten (zugleich die Abschrift), mit den
 *               Fundstellen der KI als Markierungen im Text
 *   felder      die daraus gelesenen Werte des Deckblatts
 *   betriebsarten, risikofragen, auffaelligkeiten, gesamteinschaetzung
 *
 * Die Beispielanfragen erscheinen in der Oberfläche als Seiten des gelieferten
 * PDF; die Lage ihrer Fundstellen steht in originale.js (erzeugt, siehe
 * scripts/originale/). Der Nachbau hier bleibt die Quelle der Markierungen.
 *
 * Hausbegriffe stehen als Platzhalter ({postfach}, {linie} …) in den Texten
 * und werden hier einmal für die aktive Marke aufgelöst.
 */

import { markenObjekt } from '../utils/branding.js'
import beispiel1 from './beispiel1.js'
import beispiel2 from './beispiel2.js'
import beispiel3 from './beispiel3.js'
import beispiel4 from './beispiel4.js'
import beispiel5 from './beispiel5.js'
import { SYNTHETISCH } from './synthetisch.js'

const isoDatum = (v) => {
  const [t, m, j] = v.eingang.split('.')
  return `${j}-${m}-${t}T${v.uhrzeit || '00:00'}`
}

const ROH = [beispiel1, beispiel2, beispiel3, beispiel4, beispiel5, ...SYNTHETISCH].map(v => ({
  risikofragen: [],
  auffaelligkeiten: [],
  betriebsarten: [],
  ...v,
  sortierung: isoDatum(v)
}))

/** Neueste zuerst, wie in einem Postfach. */
export const VORGAENGE = markenObjekt(ROH).sort((a, b) => b.sortierung.localeCompare(a.sortierung))

/** Die fünf Beispielanfragen in ihrer Nummernfolge. */
export const BEISPIELE = VORGAENGE.filter(v => v.beispiel).sort((a, b) => a.beispiel - b.beispiel)

export const vorgangNachId = (id) => VORGAENGE.find(v => v.id === id) || null

/** Der Eingang, an dem der Präsentationsmodus die Strecke zuerst vorführt. */
export const DEMO_VORGANG_ID = 'ANG-2026-2102'

/** Bezeichnung eines Eingangs für Listen: „Beispiel 2“, „Synthetisch“ oder „Live gelesen“. */
export const herkunft = (v) => (v.beispiel ? `Beispiel ${v.beispiel}` : v.live ? 'Live gelesen' : 'Synthetisch')
