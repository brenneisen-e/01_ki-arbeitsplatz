import { useBreite } from '../../charts'
import { Tip } from '../../ui/basis'
import { ton } from '../../ui/Waage'
import { prozentDelta, euroKompaktDelta } from '../../lib/format'

/**
 * WAAGEACHSE — die Budgetsignale auf einer gemeinsamen Toleranzband-Achse
 * (zwei gewertete, der Barwert je Jahrgang nachrichtlich mit eigenem `ton`).
 *
 * Eine Bahn von −10 bis +10 %, das Toleranzband ±2 % als Fläche, die
 * Nullkerbe, und je Signal ein Marker mit Wert darüber und Label darunter.
 * Die Signale tragen dieselben Wortlaute wie der Steuerblock, damit
 * niemand zwei Vokabulare lernen muss. Überschreitet ein Signal die
 * Grundspanne, wächst die Achse symmetrisch auf das nächste Vielfache
 * von 5 — die Nullkerbe bleibt immer in der Mitte.
 *
 * Bewegung nur beim Erscheinen: die Marker blenden gestaffelt ein
 * (500/620/740 ms, animation-delay). Unter prefers-reduced-motion stehen
 * sie sofort (start.css).
 */

const GRUNDSPANNE = 10
const SCHRITT = 5
const TOLERANZ = 2
const VERZOEGERUNG = [500, 620, 740]

// Breitenschätzung je Zeichen in fs-xs; dieselbe Heuristik wie im
// Paarvergleich (paar.jsx), damit die Kollisionsregel ohne Messen der
// Textknoten auskommt.
const PX_JE_ZEICHEN = 6.2

// Marker so nah am Rand, dass ihr Text die Achsenkante überragen würde:
// Text wird an der Kante ausgerichtet, die Skalenkappe weicht.
const RANDZONE = 8

/** Symmetrische Spanne der Achse in Prozentpunkten */
export function achsenSpanne(werte) {
  const max = Math.max(0, ...werte.filter(Number.isFinite).map(Math.abs))
  if (max <= GRUNDSPANNE) return GRUNDSPANNE
  return Math.ceil(max / SCHRITT) * SCHRITT
}

function position(prozent, spanne) {
  const p = Math.max(-spanne, Math.min(spanne, prozent))
  return 50 + (p / spanne) * 50
}

/**
 * @param signale  [{ id, label, prozent, absolut? }] — Reihenfolge bestimmt die Staffel
 * @param leitId   Signal, dessen Wert bereits die Leitzahl trägt: sein Marker
 *                 bekommt keinen zweiten Wert darüber (jede Zahl steht einmal)
 */
export default function WaageAchse({ signale, leitId, toleranz = TOLERANZ }) {
  const [ref, breite] = useBreite(900)
  const spanne = achsenSpanne(signale.map(s => s.prozent))

  // Zwei Marker, deren Labels sich überschneiden würden, bekommen
  // abwechselnd die zweite Labelzeile — die Achse bleibt einzeilig,
  // nur der Text weicht nach unten aus.
  const marker = signale
    .map((s, i) => ({ ...s, pos: position(s.prozent, spanne), verzoegerung: VERZOEGERUNG[i] ?? 740 }))
    .sort((a, b) => a.pos - b.pos)
  // Jede Labelzeile merkt sich ihr rechtes Ende; ein Marker nimmt die erste
  // Zeile, in die sein Label passt. Liegen alle drei Signale übereinander
  // (Fassung = heute), stehen die Labels in drei Zeilen untereinander.
  const zeilenEnde = []
  let vorherPos = -Infinity
  for (const m of marker) {
    const halb = (m.label.length * PX_JE_ZEICHEN) / 2
    const x = (m.pos / 100) * breite
    let z = 0
    while (zeilenEnde[z] != null && x - halb < zeilenEnde[z]) z += 1
    m.zeile = z
    zeilenEnde[z] = x + halb
    // Zwei Marker fast an derselben Stelle: den Wert trägt nur der erste,
    // der zweite behält ihn im Tip — sonst überdrucken sich die Zahlen.
    m.wertVerdeckt = m.pos - vorherPos < 4
    vorherPos = m.pos
  }
  const zeilen = zeilenEnde.length
  const zweiZeilen = zeilen > 1
  const kappeLinks = !marker.some(m => m.pos < RANDZONE)
  const kappeRechts = !marker.some(m => m.pos > 100 - RANDZONE)

  const beschreibung = signale
    .map(s => `${s.label} ${prozentDelta(s.prozent)}`)
    .join(', ')

  return (
    <div
      className="vg-waageachse"
      ref={ref}
      role="img"
      aria-label={`Budgetsignale: ${beschreibung}`}
      data-zwei-zeilen={zweiZeilen || undefined}
      data-zeilen={zeilen > 1 ? zeilen : undefined}
    >
      <div className="vg-waageachse-bahn">
        <span
          className="vg-waageachse-toleranz"
          style={{
            left: `${position(-toleranz, spanne)}%`,
            width: `${position(toleranz, spanne) - position(-toleranz, spanne)}%`,
          }}
        />
        <span className="vg-waageachse-null" />
        {kappeLinks && <span className="vg-waageachse-kappe" data-seite="links">−{spanne} %</span>}
        {kappeRechts && <span className="vg-waageachse-kappe" data-seite="rechts">+{spanne} %</span>}
        {marker.map(m => {
          const tip = m.absolut != null ? `${euroKompaktDelta(m.absolut)} gegenüber heute` : undefined
          const mitWert = m.id !== leitId && !m.wertVerdeckt
          return (
            <div
              className="vg-waageachse-marker"
              key={m.id}
              data-ton={m.ton ?? ton(m.prozent)}
              data-zeile={m.zeile}
              data-leit={!mitWert || undefined}
              data-rand={m.pos < RANDZONE ? 'links' : m.pos > 100 - RANDZONE ? 'rechts' : undefined}
              style={{ left: `${m.pos}%`, animationDelay: `${m.verzoegerung}ms` }}
            >
              {mitWert && (
                <span className="vg-waageachse-wert">
                  <Tip text={tip}><span>{prozentDelta(m.prozent)}</span></Tip>
                </span>
              )}
              <span className="vg-waageachse-kreis" />
              <span className="vg-waageachse-label">
                {mitWert ? m.label : <Tip text={tip}><span>{m.label}</span></Tip>}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
