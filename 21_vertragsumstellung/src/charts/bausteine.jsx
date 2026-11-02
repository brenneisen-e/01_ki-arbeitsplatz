// ===========================================================================
// Vergütungswerk — Bausteine je Jahr
//
// Gestapelte Säulen 2028 bis 2035: woraus die kassenwirksame Vergütung im
// Zielmodell Jahr für Jahr besteht. Abschlussprovision (Schiefer) steht
// sofort auf dem neuen Satz, die laufende Provision (Tiefgrün) wächst
// Jahrgang für Jahrgang, Bestandsprovision, Bonifikation und Zuschüsse
// stehen ab dem ersten Jahr, die Übergangsregel (Ocker, halbtransparent)
// füllt bis heute auf. Die gestrichelte Linie ist die Vergütung heute.
// Farben aus BAUTEIL_FARBE (index.jsx) — dieselbe Zuordnung wie überall.
//
// Werte im Bild: über jeder Säule die Summe nach Übergangsregel („8,9 Mio.“),
// darüber ihr Abstand zu heute als Marke wie im Paardiagramm (aus Sicht des
// Hauses: mehr grün, weniger rot, exakt heute neutral); in jedem Segment,
// das hoch genug ist, sein Wert ohne Einheit in der Achseneinheit („4,2“ bei
// einer Achse in Mio.) — so passt er auch in 44 px schmale Säulen (1280 px). Die Summen trägt eine unsichtbare Linie auf
// „gesamt“, deren Punkte genau auf der Stapeloberkante liegen — so hängt die
// Beschriftung nicht am Segment „Übergangsregel“, das in späten Jahren null
// hoch ist. recharts zeigt Beschriftungen erst nach der Einzeichnung. Die Heute-Linie
// liegt hinter den Säulen (zwischen ihnen sichtbar, durch die Übergangs-
// füllung hindurch), damit sie keinen Segmentwert durchstreicht: recharts 3
// ordnet nach zIndex-Ebenen (Säulen 300, Linien 400), nicht nach JSX-Reihen-
// folge, deshalb zIndex 250 an der Linie.
//
// Rechts kann eine aufgehellte Säule „ab 2039“ (Jahr des vollen Aufbaus) stehen (`eingeschwungen`):
// alle Jahrgänge der laufenden Provision zahlen, die Summe ist der Wert des
// Referenzvergleichs im Steuerblock — so ist die 9,4 Mio. wiederzufinden.
// ===========================================================================

import {
  ResponsiveContainer, ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, LabelList, ReferenceArea, Cell,
} from 'recharts'
import { euro, euroKompakt, prozentDelta, deltaTon, achseEuroFest } from '../lib/format'
import { Kasten, Legende, MASS } from './gehoben'
import { Marke, MARKE_HOEHE } from './paar'

// `schrift`: Farbe des Segmentwerts. Schiefer und Tiefgrün sind im Hellmodus
// dunkel und im Dunkelmodus hell — genau wie die 500er-Töne der Marken, also
// trägt --vg-pille-text. Grün hell, Grau und die Übergangsfüllung kehren das
// um (--vg-text). Ocker bleibt in beiden Modi ein Mittelton: dunkle Schrift.
const BAUSTEINE = [
  { id: 'ap', label: 'Abschlussprovision', farbe: 'var(--vg-viz-1)', schrift: 'var(--vg-pille-text, #ffffff)' },
  { id: 'lp', label: 'Laufende Provision', farbe: 'var(--vg-viz-3)', schrift: 'var(--vg-pille-text, #ffffff)' },
  { id: 'bp', label: 'Bestandsprovision', farbe: 'var(--vg-viz-4)', schrift: 'var(--vg-text)' },
  { id: 'bonus', label: 'Bonifikation', farbe: 'var(--vg-viz-6)', schrift: 'var(--vg-n950)' },
  { id: 'zuschuesse', label: 'Zuschüsse', farbe: 'var(--vg-viz-7)', schrift: 'var(--vg-text)' },
  { id: 'uebergang', label: 'Übergangsregel', farbe: 'var(--vg-warnung)', deckung: 0.45, schrift: 'var(--vg-text)' },
]

const achse = { tick: { fontSize: MASS.achseSchrift, fill: 'var(--vg-text-3)' }, axisLine: false, tickLine: false }

/** Segmentwert ab dieser Höhe in px (12-px-Schrift mit Luft). */
const SEGMENT_MIN = 17
/** Zeichenbreite der 12-px-Werte, für die Breitenprüfung im Segment. */
const SEGMENT_ZEICHEN = 6.6
/** Kopfraum über der höchsten Säule: Wert (12,5 px), Luft, Marke (17 px). */
const KOPFRAUM = MASS.wertSchrift + 3 + MARKE_HOEHE + 10

/** Summe: „8,9 Mio.“ — Größenwort ja, Währung nein; die Achse trägt sie. */
function kurz(v) {
  return euroKompakt(v, { einheit: false })
}

/** Einheit der Segmentwerte: die der größten Summe — Mio. mit einer Stelle, sonst Tsd. ohne. */
function segmentEinheit(reihe) {
  const hi = Math.max(0, ...reihe.map(d => d.gesamt || 0))
  return hi >= 1e6 ? { teiler: 1e6, stellen: 1 } : { teiler: 1e3, stellen: 0 }
}

/** Segmentwert ohne Einheit: „4,2“, „0,7“ (Mio.) oder „429“ (Tsd.). */
function segmentText(v, e) {
  return (v / e.teiler).toLocaleString('de-DE', { minimumFractionDigits: e.stellen, maximumFractionDigits: e.stellen })
}

/**
 * Summe nach Übergangsregel über der Säule, darüber der Abstand zu heute als
 * Marke. Kommt als `label` der unsichtbaren Linie auf „gesamt“: x, y sind
 * der Punkt auf der Stapeloberkante, `payload` die Jahreszeile.
 */
function SummenMarke({ x, y, index, payload, reihe }) {
  const d = payload ?? reihe[index]
  if (!d || !Number.isFinite(x) || !Number.isFinite(y)) return null
  const delta = d.heute > 0 ? (d.gesamt / d.heute - 1) * 100 : 0
  const ton = Math.abs(delta) < 0.05 ? 'neutral' : deltaTon(delta)
  const yWert = y - 7
  return (
    <g style={{ pointerEvents: 'none' }}>
      <text
        x={x} y={yWert} textAnchor="middle"
        fontSize={MASS.wertSchrift} fontWeight={500} fill="var(--vg-text)"
        style={{ fontVariantNumeric: 'tabular-nums', paintOrder: 'stroke', stroke: 'var(--vg-flaeche)', strokeWidth: 3, strokeLinejoin: 'round' }}
      >
        {kurz(d.gesamt)}
      </text>
      <Marke x={x} yUnten={yWert - MASS.wertSchrift - 3} text={prozentDelta(delta)} ton={ton} />
    </g>
  )
}

/** Wert mitten im Segment, nur wenn Höhe und Breite dafür reichen. */
function SegmentWert({ x, y, width, height, index, payload, baustein, reihe, einheit }) {
  const d = payload ?? reihe[index]
  const v = d?.[baustein.id]
  if (!(v > 0) || !(height >= SEGMENT_MIN)) return null
  const text = segmentText(v, einheit)
  if (!(width >= text.length * SEGMENT_ZEICHEN + 6)) return null
  return (
    <text
      x={x + width / 2} y={y + height / 2 + 4} textAnchor="middle"
      fontSize={MASS.achseSchrift} fill={baustein.schrift}
      style={{ fontVariantNumeric: 'tabular-nums', pointerEvents: 'none' }}
    >
      {text}
    </text>
  )
}

/**
 * @param reihe  [{ jahr, ap, lp, bp, bonus, zuschuesse, uebergang, heute, gesamt }] — bausteinVerlauf()
 */
export function BausteinVerlauf({ reihe, hoehe = 340, heuteLabel = 'Vergütung heute' }) {
  const einheit = segmentEinheit(reihe)
  const daten = reihe.map(d => ({ ...d, label: d.label ?? String(d.jahr) }))
  const eingeschwungen = daten.find(d => d.eingeschwungen)
  return (
    <div>
      <div className="vg-diagramm">
        <ResponsiveContainer width="100%" height={hoehe}>
          <ComposedChart data={daten} margin={{ top: 12, right: 16, left: 8, bottom: 0 }} barCategoryGap="28%">
            <CartesianGrid stroke="var(--vg-viz-gitter)" vertical={false} />
            {eingeschwungen && (
              <ReferenceArea x1={eingeschwungen.label} x2={eingeschwungen.label} fill="var(--vg-viz-gitter)" fillOpacity={0.45} ifOverflow="visible" />
            )}
            <XAxis dataKey="label" {...achse} />
            <YAxis {...achse} tickFormatter={achseEuroFest} width={66} padding={{ top: KOPFRAUM }} />
            <Tooltip
              cursor={{ fill: 'var(--vg-viz-gitter)' }}
              content={({ active, payload, label }) => {
                if (!active || !payload?.length) return null
                const d = payload[0].payload
                return (
                  <Kasten
                    titel={d.eingeschwungen ? `Eingeschwungen, ab ${d.jahr}: alle Jahrgänge zahlen` : String(label)}
                    zeilen={[
                      ...BAUSTEINE.filter(b => d[b.id] > 0.5).map(b => ({ label: b.label, wert: euroKompakt(d[b.id]), farbe: b.farbe })),
                      { label: 'Nach Übergangsregel', wert: euro(d.gesamt) },
                      { label: heuteLabel, wert: euro(d.heute) },
                    ]}
                  />
                )
              }}
            />
            <Line
              type="monotone" dataKey="heute" stroke="var(--vg-viz-ist)"
              strokeDasharray="5 4" strokeWidth={2} dot={false} activeDot={false} animationDuration={420}
              zIndex={250}
            />
            {BAUSTEINE.map(b => (
              <Bar key={b.id} dataKey={b.id} stackId="z" fill={b.farbe} fillOpacity={b.deckung ?? 1} animationDuration={420}>
                {daten.map(d => (
                  <Cell key={d.label} fillOpacity={(b.deckung ?? 1) * (d.eingeschwungen ? 0.62 : 1)} />
                ))}
                <LabelList dataKey={b.id} content={(p) => <SegmentWert {...p} baustein={b} reihe={daten} einheit={einheit} />} />
              </Bar>
            ))}
            <Line
              dataKey="gesamt" stroke="none" dot={false} activeDot={false}
              legendType="none" tooltipType="none" animationDuration={420}
              label={<SummenMarke reihe={daten} />}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
      <Legende eintraege={[
        ...BAUSTEINE.map(b => ({ label: b.label, farbe: b.farbe })),
        { label: heuteLabel, farbe: 'var(--vg-viz-ist)', linie: true, gestrichelt: true },
      ]} />
    </div>
  )
}
