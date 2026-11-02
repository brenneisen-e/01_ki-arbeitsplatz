import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ReferenceLine,
} from 'recharts'
import { euro, euroKompakt, achseEuroFest, euroKompaktDelta, prozent } from '../lib/format'
import { Kasten, Legende } from './gehoben'

/* Wasserfall, Verlauf und Verteilung liegen in der gehobenen Schicht:
   eigener SVG-Wasserfall mit Verbindungslinien und Mindeststufenhöhe,
   Direktbeschriftung statt Legende, Anmerkungsebene und Kollisionslösung.
   Sie werden hier weitergereicht, damit die Aufrufstellen unverändert
   bleiben und es weiterhin nur eine Diagrammadresse gibt. Kasten und
   Legende liegen ebenfalls dort (paar.jsx braucht sie ohne Ringimport). */
export { Wasserfall, Verlauf, Verteilung, MASS, niceTicks, Kasten, Legende, useBreite } from './gehoben'
export { PaarVergleich, bauteilPaare, spartenPaare, verdichteStufen } from './paar'
/* Sparten-Säulen und Bestandsbalken der Tafelsprache (Akten-Dashboard) */
export { SpartenSaeulen, BestandBalken } from './stufen'
/* Bausteine je Jahr (Blick nach vorn in der Akte) */
export { BausteinVerlauf } from './bausteine'

// --------------------------------------------------- Grundlagen

export const VIZ = [
  'var(--vg-viz-1)', 'var(--vg-viz-2)', 'var(--vg-viz-3)', 'var(--vg-viz-4)',
  'var(--vg-viz-5)', 'var(--vg-viz-6)', 'var(--vg-viz-7)', 'var(--vg-viz-8)',
]

/**
 * FARBEN DER VERGÜTUNGSBAUTEILE — eine Quelle für die ganze Anwendung.
 *
 * Die Zuordnung erzählt die Reform, statt sieben Farben zu verteilen:
 *   Schiefer  Abschlussvergütung — das, was zurückgefahren wird
 *   Tiefgrün  laufende und Bestandsvergütung — das, was aufgebaut wird
 *   Ocker     Bonifikation — der einzige Gegenton
 *   Grau      Zuschüsse und Restposten
 * Wer die Zuordnung ändert, ändert sie hier und nirgends sonst.
 */
export const BAUTEIL_FARBE = {
  apLeben:     'var(--vg-viz-1)',
  apKomposit:  'var(--vg-viz-2)',
  ap:          'var(--vg-viz-1)',
  lp:          'var(--vg-viz-3)',
  bpLeben:     'var(--vg-viz-4)',
  bpKomposit:  'var(--vg-viz-5)',
  bp:          'var(--vg-viz-4)',
  bonus:       'var(--vg-viz-6)',
  zuschuesse:  'var(--vg-viz-7)',
}

/**
 * Wahlmodelle: dieselbe Leiter, damit „mehr laufend“ überall gleich aussieht.
 * Hybrid steht in Stufe 4 (helles Petrol): die Nachbarschaft zu Stufe 3
 * und 5 fällt sonst beim Palettenprüfer durch (ΔE 8,5 Normalsicht);
 * mit Stufe 4 liegen beide Nachbarpaare bei ΔE 25.
 */
export const WAHLMODELL_FARBE = {
  klassisch: 'var(--vg-viz-1)',
  umdecker:  'var(--vg-viz-2)',
  hybrid:    'var(--vg-viz-4)',
  laufend:   'var(--vg-viz-3)',
}

// Große Flächen bekommen die gedeckten Töne. Ein sattes Signalrot über
// 60 % der Breite liest sich als Alarm, nicht als Verteilung.
export const AMPEL_FARBE = {
  gewinner: 'var(--vg-positiv-flaeche)',
  neutral: 'var(--vg-neutral-flaeche)',
  beobachten: 'var(--vg-warnung-flaeche)',
  kritisch: 'var(--vg-negativ-flaeche)',
}

const achse = {
  tick: { fontSize: 12, fill: 'var(--vg-text-3)' },
  axisLine: false,
  tickLine: false,
}

// --------------------------------------------------- Komponentenvergleich

const KOMPONENTEN = [
  { id: 'apLeben', label: 'AP Leben', farbe: BAUTEIL_FARBE.apLeben },
  { id: 'apKomposit', label: 'AP Komposit', farbe: BAUTEIL_FARBE.apKomposit },
  { id: 'lp', label: 'Laufende Provision', farbe: BAUTEIL_FARBE.lp },
  { id: 'bpLeben', label: 'BP Leben', farbe: BAUTEIL_FARBE.bpLeben },
  { id: 'bpKomposit', label: 'BP Komposit', farbe: BAUTEIL_FARBE.bpKomposit },
  { id: 'bonus', label: 'Bonifikation', farbe: BAUTEIL_FARBE.bonus },
  { id: 'zuschuesse', label: 'Zuschüsse', farbe: BAUTEIL_FARBE.zuschuesse },
]

/** Bleibt exportiert, wird aber von keinem Modul mehr gerendert — der
    Paarvergleich zeigt dieselben Beträge. */
export function KomponentenVergleich({ ist, ziel, hoehe = 250 }) {
  const daten = [
    { welt: 'Heute', ...Object.fromEntries(KOMPONENTEN.map(k => [k.id, ist[k.id] || 0])) },
    { welt: 'Zielmodell', ...Object.fromEntries(KOMPONENTEN.map(k => [k.id, ziel[k.id] || 0])) },
  ]
  return (
    <div>
      <div className="vg-diagramm">
        <ResponsiveContainer width="100%" height={hoehe}>
          <BarChart data={daten} layout="vertical" margin={{ top: 4, right: 12, left: 4, bottom: 0 }} barCategoryGap="30%">
            <CartesianGrid stroke="var(--vg-viz-gitter)" horizontal={false} />
            <XAxis type="number" {...achse} tickFormatter={achseEuroFest} />
            <YAxis type="category" dataKey="welt" {...achse} width={86} tick={{ fontSize: 12, fontWeight: 500, fill: 'var(--vg-text-2)' }} />
            <Tooltip
              cursor={{ fill: 'var(--vg-viz-gitter)' }}
              content={({ active, payload, label }) => {
                if (!active || !payload?.length) return null
                const summe = payload.reduce((s, p) => s + (p.value || 0), 0)
                return (
                  <Kasten
                    titel={label}
                    zeilen={[
                      ...payload.filter(p => p.value > 0).map(p => ({
                        label: KOMPONENTEN.find(k => k.id === p.dataKey)?.label || p.dataKey,
                        wert: euroKompakt(p.value),
                        farbe: p.color,
                      })),
                      { label: 'Gesamt', wert: euro(summe) },
                    ]}
                  />
                )
              }}
            />
            {KOMPONENTEN.map((k, i) => (
              <Bar
                key={k.id} dataKey={k.id} stackId="s" fill={k.farbe}
                radius={i === 0 ? [3, 0, 0, 3] : i === KOMPONENTEN.length - 1 ? [0, 3, 3, 0] : 0}
                animationDuration={420}
              />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </div>
      <Legende eintraege={KOMPONENTEN.map(k => ({ label: k.label, farbe: k.farbe }))} />
    </div>
  )
}

// --------------------------------------------------- Tornado
//
// Beide Richtungen in einem Stapel und einer Farbe: die Position links oder
// rechts der Null sagt bereits, wohin der Regler ging — eine zweite Farbe
// würde nur dasselbe noch einmal codieren.

export function Tornado({ eintraege, hoehe = 320, aufEintrag }) {
  const daten = eintraege.map(e => ({ ...e, name: e.kurz || e.label }))
  const balken = {
    fill: 'var(--vg-viz-1)', fillOpacity: 0.85, stackId: 't', maxBarSize: 14,
    onClick: aufEintrag ? (d) => aufEintrag(d.payload) : undefined,
    cursor: aufEintrag ? 'pointer' : undefined,
    animationDuration: 420,
  }
  return (
    <div className="vg-diagramm">
      <ResponsiveContainer width="100%" height={hoehe}>
        {/* stackOffset „sign“: negative Auslenkung nach links, positive nach
            rechts — im Standardstapel läge der zweite Balken auf dem ersten. */}
        <BarChart
          data={daten} layout="vertical" stackOffset="sign"
          margin={{ top: 4, right: 16, left: 4, bottom: 0 }} barCategoryGap="26%"
        >
          <CartesianGrid stroke="var(--vg-viz-gitter)" horizontal={false} />
          <XAxis type="number" {...achse} tickFormatter={achseEuroFest} />
          <YAxis type="category" dataKey="name" {...achse} width={120} tick={{ fontSize: 12, fill: 'var(--vg-text-2)' }} />
          <ReferenceLine x={0} stroke="var(--vg-viz-achse)" />
          <Tooltip
            cursor={{ fill: 'var(--vg-viz-gitter)' }}
            content={({ active, payload }) => {
              if (!active || !payload?.length) return null
              const d = payload[0].payload
              return (
                <Kasten
                  titel={d.label}
                  zeilen={[
                    { label: 'Regler nach unten', wert: euroKompaktDelta(d.runter), ton: d.runter >= 0 ? 'positiv' : 'negativ' },
                    { label: 'Regler nach oben', wert: euroKompaktDelta(d.rauf), ton: d.rauf >= 0 ? 'positiv' : 'negativ' },
                    { label: 'Spannweite', wert: euroKompakt(d.spannweite) },
                  ]}
                  fuss="Auslenkung um jeweils 15 Prozent des Reglerwegs."
                />
              )
            }}
          />
          <Bar dataKey="runter" radius={[4, 0, 0, 4]} {...balken} />
          <Bar dataKey="rauf" radius={[0, 4, 4, 0]} {...balken} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

// --------------------------------------------------- Gestapelter Anteilsbalken

export function AnteilsBalken({ teile, hoehe = 12, format = euroKompakt, mitLegende = true }) {
  const sichtbar = teile.filter(t => t.wert > 0)
  const summe = sichtbar.reduce((s, t) => s + t.wert, 0) || 1
  return (
    <div>
      <div className="vg-anteilsbalken" style={{ height: hoehe }}>
        {sichtbar.map(t => {
          const anteil = t.wert / summe
          return (
            <div
              key={t.id}
              title={`${t.label}: ${format(t.wert)} (${prozent(anteil * 100)})`}
              style={{ flexBasis: `${anteil * 100}%`, background: t.farbe }}
            />
          )
        })}
      </div>
      {mitLegende && (
        <div className="vg-anteilslegende">
          {sichtbar.map(t => (
            <span className="vg-anteilslegende-eintrag" key={t.id}>
              <span className="vg-legende-marke" style={{ background: t.farbe }} />
              <span className="vg-anteilslegende-label">{t.label}</span>
              <span className="vg-anteilslegende-wert">{prozent((t.wert / summe) * 100, 0)}</span>
            </span>
          ))}
        </div>
      )}
    </div>
  )
}

export { KOMPONENTEN as KOMPONENTEN_LEGENDE }
