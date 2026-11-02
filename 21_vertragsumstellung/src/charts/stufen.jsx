// ===========================================================================
// Vergütungswerk — Sparten-Säulen und Bestandsbalken
//
// Zwei kleine Diagramme für die Sparten-Tafeln des Akten-Dashboards:
//
//   SpartenSaeulen  drei schmale Säulen (Vorvorjahr, Vorjahr, Referenzjahr) mit
//                   dem Wert über jeder Säule, gestrichelten Stufenlinien der
//                   Bonusstaffel und der durchgezogenen Plan-Linie. Trägt ein
//                   Wert `referenz: true`, ist seine Säule hervorgehoben: Band
//                   dahinter, kräftiges Zeitblau (--vg-viz-referenz gegen
//                   --vg-viz-vorjahr), „Referenzzeitraum“ unter der Jahreszahl —
//                   auf ihm rechnen heute und Zielmodell. Keine Delta-Marke,
//                   das ist kein Modellvergleich. Inline-SVG wie paar.jsx.
//   BestandBalken   waagerechte Balken je Zeile, Label links, Wert rechts.
//
// Die Stufenlinien liegen im Regelfall dicht beieinander (85 bis 115 % des
// Plans, in einer 150-px-Tafel rund 30 px Bande). Ihre Beschriftungen
// stehen deshalb nicht in der Zeichenfläche, sondern in einer 44-px-Spalte
// rechts daneben: nur der Prozentwert („85 %“), der Plan als „Plan“. Dort
// bekommt jede Linie ihren Text: Beschriftungen, die einander näher kämen
// als eine Zeile, rücken auseinander (Gruppen um den Mittelwert ihrer
// Linien zentriert) und ein kurzer Zeiger führt vom Text zur Linie. Die
// Säulenwerte stehen auf einem Feld in Flächenfarbe; schneidet das Feld
// eine Linie, rückt es über die oberste Linie — kein Wert wirkt
// durchgestrichen.
// ===========================================================================

import { useMemo } from 'react'
import { achseEuro, euroKompakt } from '../lib/format'
import { useAnimierteZahl } from '../ui/basis'
import { useErstesRendern } from '../lib/bewegung'
import { MASS, useBreite } from './gehoben'
import '../ui/tafel.css'

const FARBE_SAEULE = ['var(--vg-viz-2)', 'var(--vg-viz-heute)', 'var(--vg-viz-1)']

/** Zeichenbreite in px je Schriftgröße (Uniform Tab, Tabellenziffern). */
const zeichenBreite = (fs) => fs * 0.52

/** Kurzform einer Stufenbeschriftung: „Stufe 2 · 85 %“ → „85 %“. */
function kurzform(label) {
  const s = String(label ?? '')
  const i = s.lastIndexOf(' · ')
  return i >= 0 ? s.slice(i + 3) : s
}

/** Zeilenabstand zweier Beschriftungen in der rechten Spalte (px). */
const ZEILENABSTAND = 11

/**
 * Verteilt Beschriftungen entlang der Senkrechten: Eingabe sind die Linien-
 * Positionen (aufsteigend), Ausgabe Textpositionen in derselben Reihenfolge
 * mit mindestens ZEILENABSTAND Abstand. Benachbarte Texte, die einander
 * berühren, bilden eine Gruppe, die um den Mittelwert ihrer Linien zentriert
 * steht; berühren sich zwei Gruppen, verschmelzen sie. So bleibt jeder
 * Text so nah wie möglich an seiner Linie, und nichts überlagert sich.
 */
function verteile(ys, abstand, min, max) {
  const gruppen = []
  for (const y of ys) {
    let akt = { summe: y, n: 1 }
    while (gruppen.length) {
      const vor = gruppen[gruppen.length - 1]
      const vorUnten = vor.summe / vor.n + ((vor.n - 1) * abstand) / 2
      const aktOben = akt.summe / akt.n - ((akt.n - 1) * abstand) / 2
      if (aktOben - vorUnten >= abstand) break
      gruppen.pop()
      akt = { summe: vor.summe + akt.summe, n: vor.n + akt.n }
    }
    gruppen.push(akt)
  }
  const pos = []
  for (const g of gruppen) {
    const oben = g.summe / g.n - ((g.n - 1) * abstand) / 2
    for (let i = 0; i < g.n; i++) pos.push(oben + i * abstand)
  }
  // Innerhalb der Zeichenhöhe halten: die ganze Reihe verschieben, nie einzeln
  if (pos.length) {
    const ueber = Math.max(0, pos[pos.length - 1] - max)
    const unter = Math.max(0, min - (pos[0] - ueber))
    return pos.map(p => p - ueber + unter)
  }
  return pos
}

/**
 * @param titel    Bezeichnung der Sparte (nur für den Zugänglichkeitsnamen; die Tafel trägt den Titel)
 * @param werte    [{ label: '2024', wert }, { label: '2025', wert }, { label: 'Ø', wert }]
 * @param stufen   [{ label: 'Stufe 2 · 85 %', wert, kurz? }] — gestrichelte Linien
 * @param plan     { label: 'Plan', wert } — durchgezogene Linie
 * @param format   Formatierer der Werte über den Säulen (Standard: kompakt ohne Einheit)
 * @param hoehe    Gesamthöhe in px (150)
 */
export function SpartenSaeulen({ titel, werte = [], stufen = [], plan, format = achseEuro, hoehe = 150 }) {
  const [huelle, breite] = useBreite(260)
  const erstes = useErstesRendern()

  const mitLinien = stufen.length > 0 || Boolean(plan)
  const mitReferenz = werte.some(w => w.referenz)
  // Rechts die Spalte für die Linienbeschriftung (44 px: Zeiger 12 px, Text
  // „115 %“ rund 28 px), oben Kopfraum für den Wert über der höchsten Säule
  // (eine Zeile, notfalls zwei versetzt); unten eine zweite Zeile, wenn unter
  // dem Referenzjahr „Referenzzeitraum“ steht
  const rand = { oben: 20, unten: mitReferenz ? 31 : 18, links: 4, rechts: mitLinien ? 44 : 4 }
  const innenB = Math.max(80, breite - rand.links - rand.rechts)
  const innenH = Math.max(40, hoehe - rand.oben - rand.unten)

  // Nullachse; Kopfraum für die Werte über der höchsten Säule oder Linie
  const hi = useMemo(() => {
    const alles = [
      ...werte.map(w => w.wert || 0),
      ...stufen.map(s => s.wert || 0),
      plan?.wert || 0,
    ]
    return Math.max(1, ...alles) * 1.12
  }, [werte, stufen, plan])
  const y = (v) => innenH - (Math.max(0, v) / hi) * innenH

  // Ein Fach je Säule über die ganze Zeichenfläche, Säule höchstens 26 px
  const anzahl = Math.max(1, werte.length)
  const fach = innenB / anzahl
  const saeuleB = Math.min(26, fach * 0.55)
  const wertFs = MASS.achseSchrift          // 12 px — fs-xs
  const linieFs = 10.5                      // fs-2xs

  const saeulen = werte.map((w, i) => {
    const mitte = fach * i + fach / 2
    const text = format(w.wert || 0)
    const b = text.length * zeichenBreite(wertFs)
    return { ...w, i, mitte, x: mitte - saeuleB / 2, yOben: y(w.wert || 0), text, b }
  })

  // Linien von oben nach unten; jede bekommt eine Beschriftung rechts
  const linien = (() => {
    const roh = [
      ...stufen.map(s => ({ ...s, art: 'stufe', text: s.kurz || kurzform(s.label) })),
      ...(plan ? [{ ...plan, art: 'plan', text: String(plan.label ?? 'Plan') }] : []),
    ]
      .filter(l => Number.isFinite(l.wert) && l.wert > 0)
      .sort((a, b) => b.wert - a.wert)
      .map(l => ({ ...l, yLinie: y(l.wert) }))
    const yTexte = verteile(
      roh.map(l => l.yLinie), ZEILENABSTAND,
      -rand.oben + linieFs, innenH + rand.unten - 3,
    )
    return roh.map((l, i) => ({ ...l, yText: yTexte[i] }))
  })()

  // Werte über den Säulen: 6 px über der Säule. Schneidet das Wertfeld eine
  // Linie, rückt es über die oberste Linie — dort ist es frei, und der
  // Bezug zur Säule bleibt über die Spalte erhalten. Passt der Text nicht
  // ins Fach, rückt die mittlere Säule zusätzlich eine Zeile höher (wie im
  // Paarvergleich).
  const eng = saeulen.some(s => s.b + 4 > fach)
  const obersteLinie = linien.length ? Math.min(...linien.map(l => l.yLinie)) : null
  const yTexte = saeulen.map(s => {
    let yText = s.yOben - 6
    const feldOben = yText - wertFs - 2
    const feldUnten = yText + 3
    const schneidet = linien.some(l => l.yLinie >= feldOben && l.yLinie <= feldUnten)
    if (schneidet && obersteLinie != null) yText = Math.min(yText, obersteLinie - 4)
    const versatz = eng && s.i % 2 === 1 ? -(wertFs + 1) : 0
    return yText + versatz
  })

  return (
    <div className="vg-diagramm vg-sparten" ref={huelle}>
      <svg
        width="100%" height={hoehe} role="img"
        aria-label={titel ? `${titel}: ${werte.map(w => `${w.label} ${format(w.wert || 0)}`).join(', ')}` : undefined}
        style={{ overflow: 'visible', display: 'block' }}
      >
        <g transform={`translate(${rand.links},${rand.oben})`}>
          {/* Band hinter dem Referenzjahr: von der Zeichenfläche bis unter die Beschriftung */}
          {saeulen.filter(s => s.referenz).map(s => (
            <rect
              key={`band-${s.label}`}
              x={s.mitte - fach / 2 + 2} y={-rand.oben + 4} width={fach - 4} height={innenH + rand.oben + rand.unten - 6}
              rx={4} fill="var(--vg-viz-gitter)" fillOpacity={0.45}
            />
          ))}
          <line x1={0} x2={innenB} y1={innenH} y2={innenH} stroke="var(--vg-viz-achse)" strokeWidth={1} />

          {/* Stufen- und Plan-Linien; Beschriftung rechts außerhalb der
              Fläche, ein kurzer Zeiger führt vom Text zur Linie */}
          {linien.map((l, i) => (
            <g key={`${l.art}-${l.label}-${i}`}>
              <line
                x1={0} x2={innenB} y1={l.yLinie} y2={l.yLinie}
                stroke={l.art === 'plan' ? 'var(--vg-text-3)' : 'var(--vg-viz-achse)'}
                strokeWidth={l.art === 'plan' ? 1.25 : 1}
                strokeDasharray={l.art === 'plan' ? undefined : '3 3'}
              >
                <title>{`${l.label}: ${euroKompakt(l.wert)}`}</title>
              </line>
              <path
                d={`M${innenB},${l.yLinie}h4L${innenB + 8},${l.yText}h2`}
                fill="none"
                stroke={l.art === 'plan' ? 'var(--vg-text-3)' : 'var(--vg-viz-achse)'}
                strokeWidth={1}
                style={{ transition: 'd var(--vg-daten) var(--vg-kurve)' }}
              />
              <text
                x={innenB + 12} y={l.yText + linieFs * 0.36}
                textAnchor="start"
                fontSize={linieFs}
                fill={l.art === 'plan' ? 'var(--vg-text-3)' : 'var(--vg-text-4)'}
                style={{ fontVariantNumeric: 'tabular-nums', pointerEvents: 'none' }}
              >
                {l.text}
              </text>
            </g>
          ))}

          {/* Säulen mit Wert darüber und Kategorie darunter */}
          {saeulen.map((s, i) => (
            <Saeule
              key={s.label ?? i}
              s={s} i={i} innenH={innenH} saeuleB={saeuleB}
              farbe={mitReferenz ? (s.referenz ? 'var(--vg-viz-referenz)' : 'var(--vg-viz-vorjahr)') : FARBE_SAEULE[i % FARBE_SAEULE.length]}
              yText={yTexte[i]}
              wertFs={wertFs}
              animiert={erstes.current}
              format={format}
            />
          ))}
        </g>
      </svg>
    </div>
  )
}

/**
 * Eine Säule: wächst beim Mount aus der Grundlinie, morpht danach 420 ms.
 * Ein 2-px-Rand in Flächenfarbe hebt sie von den Linien ab; der Wert darüber
 * steht auf einem Feld in Flächenfarbe (ein Hof allein lässt die Linie
 * zwischen den Ziffern durchscheinen, der Wert wirkte durchgestrichen).
 */
function Saeule({ s, i, innenH, saeuleB, farbe, yText, wertFs, animiert, format }) {
  const wert = useAnimierteZahl(s.wert || 0, 420)
  const h = Math.max(0, innenH - s.yOben)
  const r = Math.min(3, h / 2, saeuleB / 2)
  const d = h <= 0.5
    ? `M${s.x},${innenH}h${saeuleB}v0h${-saeuleB}z`
    : `M${s.x},${innenH}V${s.yOben + r}a${r},${r} 0 0 1 ${r},${-r}h${saeuleB - 2 * r}a${r},${r} 0 0 1 ${r},${r}V${innenH}z`
  return (
    <g>
      <path
        className={animiert ? 'vg-zeichnen' : undefined}
        d={d}
        fill={farbe}
        paintOrder="stroke" stroke="var(--vg-flaeche)" strokeWidth={2}
        style={{ '--i': i, transition: 'd var(--vg-daten) var(--vg-kurve)' }}
      >
        <title>{`${s.label}: ${euroKompakt(s.wert || 0)}`}</title>
      </path>
      <rect
        x={s.mitte - s.b / 2 - 4} y={yText - wertFs - 1}
        width={s.b + 8} height={wertFs + 4} rx={2}
        fill="var(--vg-flaeche)"
        style={{ transition: 'y var(--vg-daten) var(--vg-kurve)', pointerEvents: 'none' }}
      />
      <text
        x={s.mitte} y={yText} textAnchor="middle"
        fontSize={wertFs} fontWeight={500} fill="var(--vg-text)"
        style={{ fontVariantNumeric: 'tabular-nums', pointerEvents: 'none' }}
      >
        {format(wert)}
      </text>
      <text
        x={s.mitte} y={innenH + 13} textAnchor="middle"
        fontSize={MASS.kategorieSchrift} fontWeight={s.referenz ? 500 : 400}
        fill={s.referenz ? 'var(--vg-text)' : 'var(--vg-text-3)'}
      >
        {s.label}
      </text>
      {s.referenz && (
        <text x={s.mitte} y={innenH + 26} textAnchor="middle" fontSize={10.5} fill="var(--vg-text-3)">
          Referenzzeitraum
        </text>
      )}
    </g>
  )
}

// ---------------------------------------------------------------- Bestand

/**
 * Waagerechte Balken je Zeile: Label links (88 px), Balken (viz-1) relativ
 * zum größten Wert der Balkenzeilen, Wert rechts. Zeilen ohne `balken`
 * zeigen nur den Wert (Stückzahlen).
 *
 * @param zeilen  [{ id?, label, wert, anzeige, balken }]
 * @param hoehe   Zeilenhöhe in px (24)
 */
export function BestandBalken({ zeilen = [], hoehe = 24 }) {
  const maximum = Math.max(1, ...zeilen.filter(z => z.balken !== false).map(z => z.wert || 0))
  return (
    <div className="vg-bestand" role="list" style={{ '--zeile': `${hoehe}px` }}>
      {zeilen.map((z, i) => (
        <BestandZeile key={z.id ?? z.label ?? i} zeile={z} maximum={maximum} />
      ))}
    </div>
  )
}

function BestandZeile({ zeile: z, maximum }) {
  const wert = useAnimierteZahl(z.wert || 0, 420)
  const mitBalken = z.balken !== false
  const anteil = mitBalken ? Math.max(0, Math.min(1, wert / maximum)) : 0
  return (
    <div className="vg-bestand-zeile" role="listitem" title={`${z.label}: ${z.anzeige ?? euroKompakt(z.wert)}`}>
      <span className="vg-bestand-label">{z.label}</span>
      <span className="vg-bestand-bahn" aria-hidden="true">
        {mitBalken && <span className="vg-bestand-balken" style={{ width: `${anteil * 100}%` }} />}
      </span>
      <span className="vg-bestand-wert">{z.anzeige ?? euroKompakt(z.wert)}</span>
    </div>
  )
}
