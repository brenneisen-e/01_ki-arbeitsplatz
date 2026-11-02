// ===========================================================================
// Vergütungswerk — Paarvergleich
//
// Das Säulenmuster des alten Werkzeugs, neu gesetzt: je Bauteil zwei Säulen
// nebeneinander — heute (neutral) und Zielmodell (Tiefgrün) — mit dem Wert
// über jeder Säule und dem Delta als farbige, gerundete Marke darüber. Fünf
// Paare erzählen die Reform in einem Blick: Abschluss sinkt, laufende und
// Bestandsvergütung wachsen. Kein Wasserfall mit zehn Stufen.
//
// Die Säulenwerte stehen ohne Einheit (die Achse trägt sie; im Steuerblock
// ohne Achse nennt sie der Hinweis darunter, siehe `paarEinheit`), damit
// zwei Werte über 18 bis 24 px schmalen Säulen nebeneinander Platz haben.
//
// Farben: „heute“ ist absichtlich unbunt (--vg-viz-heute), damit Farbe knapp
// bleibt; Identität tragen Legende und Beschriftung, nie die Farbe allein.
// Hell heute #868e96 gegen Ziel #1f6b58: ΔE 17,2 Normalsicht, 13,0 Protan.
// Dunkel heute #6b727a gegen Ziel #4fbdae: ΔE 20,7 Normalsicht, 18,0 Deutan.
// `farbeAlt`/`farbeNeu` überschreiben die beiden Reihenfarben, wenn das Paar
// nicht heute gegen Zielmodell ist (Produktion Vorjahr gegen Referenzzeitraum
// in der Akte: --vg-viz-vorjahr / --vg-viz-referenz, Blau statt Grau/Grün).
//
// Bewegung: beim Erscheinen wachsen die Säulen aus der Grundlinie (420 ms,
// 45 ms Staffel je Paar) und die Deltas zählen hoch; bei jedem späteren
// Wertwechsel morphen die Pfade in 420 ms (d-Transition).
// ===========================================================================

import { useMemo, useState } from 'react'
import { euro, euroKompakt, euroKompaktDelta, prozentDelta, achseEuroFest } from '../lib/format'
import { DAUER, useZaehlwert } from '../lib/bewegung'
import { MASS, niceTicks, useBreite, Legende } from './gehoben'

const FARBE_HEUTE = 'var(--vg-viz-heute)'
const FARBE_ZIEL = 'var(--vg-viz-3)'

/** Zeichenbreite der Kategoriennamen in px (Uniform, 12 px). */
const ZEICHEN_BREITE = 6.2
/** Säulenwerte: 10,5 px, Tabellenziffern. */
export const WERT_SCHRIFT = 10.5
const WERT_ZEICHEN = 5.6
/** Delta-Marke: 11 px Schrift in einer gerundeten Box, 17 px hoch, 12 px Innenabstand. */
const MARKE_SCHRIFT = 11
const MARKE_ZEICHEN = 5.5
export const MARKE_HOEHE = 17
const MARKE_INNEN = 12
const MARKE_RADIUS = 5
/** Höhe der HTML-Legende unter dem SVG — wird von `hoehe` abgezogen. */
const LEGENDE_HOEHE = 22

/** Delta ohne Einheit: die Achse trägt „Mio.“, der Tooltip trägt EUR. */
function deltaText(v) {
  return euroKompaktDelta(v).replace(' EUR', '')
}

/**
 * Einheit der Säulenwerte: die des größten Werts — Mio., Tsd. oder EUR.
 * Die Werte stehen ohne Einheit über den Säulen; Achse oder Hinweis
 * nennen sie einmal.
 */
export function paarEinheit(paare) {
  const hi = Math.max(0, ...paare.flatMap(p => [p.alt || 0, p.neu || 0]))
  if (hi >= 1e6) return { teiler: 1e6, label: 'Mio. EUR', stellen: 1 }
  if (hi >= 1e3) return { teiler: 1e3, label: 'Tsd. EUR', stellen: 0 }
  return { teiler: 1, label: 'EUR', stellen: 0 }
}

/** Säulenwert in der Diagrammeinheit: „24,1“, „0,7“, „<0,1“, „0“. */
function wertText(v, einheit) {
  if (!(Math.abs(v) > 0)) return '0'
  const w = v / einheit.teiler
  if (Math.abs(w) < (einheit.stellen ? 0.05 : 0.5)) return einheit.stellen ? '<0,1' : '<1'
  return w.toLocaleString('de-DE', { minimumFractionDigits: einheit.stellen, maximumFractionDigits: einheit.stellen })
}

/**
 * @param paare      [{ id, label, alt, neu, hinweis? }]  — alt = heute, neu = Zielmodell
 * @param hoehe      Gesamthöhe in px (inklusive Legende)
 * @param format     Formatierer für Tooltip-Werte
 * @param altLabel   Legendenname der ersten Serie
 * @param neuLabel   Legendenname der zweiten Serie
 * @param hervor     id eines Paares, das stehen bleibt (die anderen dimmen)
 * @param aufPaar    Klick auf ein Paar
 * @param achse      false: keine Achsenwerte, schmaler Rand (Mini-Fassung im Steuerblock)
 * @param animiert   false: kein Einzeichnen, keine Zählwerte (Druck)
 * @param mitWerten  false: keine Werte über den Säulen, nur die Delta-Marke
 */
export function PaarVergleich({
  paare,
  hoehe = 250,
  format = euro,
  altLabel = 'Heute',
  neuLabel = 'Zielmodell',
  hervor,
  aufPaar,
  mitLegende = true,
  achse = true,
  animiert = true,
  zahlersicht = false,
  mitWerten = true,
  farbeAlt = FARBE_HEUTE,
  farbeNeu = FARBE_ZIEL,
}) {
  const [huelle, breite] = useBreite(640)
  const [aktiv, setAktiv] = useState(null)

  const sichtbar = useMemo(() => paare.filter(p => p.alt > 0 || p.neu > 0), [paare])
  const einheit = useMemo(() => paarEinheit(sichtbar), [sichtbar])

  // Nullachse — Größenvergleich zweier Zustände, kein gekürzter Bereich.
  const { oben, ticks } = useMemo(() => {
    const hi = Math.max(1, ...sichtbar.flatMap(p => [p.alt, p.neu]))
    const o = hi * 1.22
    return { oben: o, ticks: niceTicks(0, o).filter(t => t <= hi * 1.08) }
  }, [sichtbar])

  const svgHoehe = mitLegende ? hoehe - LEGENDE_HOEHE : hoehe
  // Über der höchsten Säule stehen Wert (12 px) und Marke (17 px) — dafür
  // braucht der obere Rand 40 px statt 30.
  const rand = { oben: mitWerten ? 40 : 30, unten: 34, links: achse ? 52 : 10, rechts: 8 }
  const innenB = Math.max(120, breite - rand.links - rand.rechts)
  const innenH = Math.max(80, svgHoehe - rand.oben - rand.unten)
  const fach = innenB / Math.max(1, sichtbar.length)
  const luecke = 2                                        // Flächenabstand zwischen den Säulen eines Paars
  // Dünne Marken: höchstens 24 px je Säule, der Rest des Fachs bleibt Luft.
  const saeuleB = Math.min(24, (fach * 0.52 - luecke) / 2)
  const y = (v) => innenH - (v / oben) * innenH

  const geo = sichtbar.map((p, i) => {
    const mitte = fach * i + fach / 2
    return {
      ...p, i, mitte,
      xAlt: mitte - luecke / 2 - saeuleB,
      xNeu: mitte + luecke / 2,
      yAlt: y(p.alt), yNeu: y(p.neu),
      delta: p.neu - p.alt,
      prozent: p.alt > 0 ? ((p.neu - p.alt) / p.alt) * 100 : 0,
    }
  })

  // Welche Deltas beschriftet werden: alle, wenn das breiteste Label ins Fach
  // passt — sonst nur die zwei betragsgrößten (der Rest steht im Tooltip).
  // Liegen die zwei nebeneinander und ist das Fach knapp, rückt das zweite
  // eine Zeile höher.
  const labelBreite = Math.max(0, ...geo.map(g => deltaText(g.delta).length)) * MARKE_ZEICHEN + MARKE_INNEN
  const alleDeltas = fach >= labelBreite + 2
  const zeigen = new Set(alleDeltas
    ? geo.map(g => g.id)
    : [...geo].sort((a, b) => Math.abs(b.delta) - Math.abs(a.delta)).slice(0, 2).map(g => g.id))
  const versatz = {}
  let vorheriger = null
  for (const g of geo) {
    if (!zeigen.has(g.id)) continue
    versatz[g.id] = vorheriger != null && g.i === vorheriger + 1 && fach < labelBreite + 2 ? -(MARKE_HOEHE + 2) : 0
    vorheriger = g.i
  }

  // Säulenwerte: mittig über der Säule, wenn sie hineinpassen; sonst nach
  // außen gesetzt — heute rechtsbündig an der rechten Kante der grauen,
  // Zielmodell linksbündig an der linken Kante der grünen Säule. So können
  // sich die beiden Werte eines Paars nicht überlagern, auch nicht bei
  // gleich hohen Säulen.
  const wertBreite = mitWerten
    ? Math.max(0, ...geo.flatMap(g => [wertText(g.alt, einheit).length, wertText(g.neu, einheit).length])) * WERT_ZEICHEN
    : 0
  const werteMittig = wertBreite <= saeuleB

  // Kategoriennamen eigenständig prüfen — nicht an die Delta-Entscheidung
  // koppeln: bei 44-px-Fächern (Dreispalter bei 1024) passen die Deltas noch
  // knapp, „Abschluss“ in 12 px (≈ 56 px) aber nicht mehr. Dann Kurzform
  // und 10,5 px, sonst laufen die Namen unter der Grundlinie ineinander.
  const kategorieBreite = Math.max(0, ...geo.map(g => String(g.label ?? '').length)) * ZEICHEN_BREITE
  const kategorieEng = !achse || fach < kategorieBreite + 4
  const kategorieSchrift = kategorieEng ? 10.5 : MASS.kategorieSchrift

  const dimm = (p) => (hervor && hervor !== p.id) || (aktiv && aktiv !== p.id) ? 0.32 : 1
  const aktivesPaar = geo.find(g => g.id === aktiv)

  // Tinte der Deltas: aus Sicht des Instituts ist mehr positiv; aus Sicht des
  // Zahlenden (Simulationskasten) ist mehr eine Warnung und weniger positiv.
  const tonVon = (d) => (d === 0 ? 'neutral' : zahlersicht ? (d > 0 ? 'warnung' : 'positiv') : (d > 0 ? 'positiv' : 'negativ'))

  const saeuleStil = (i) => ({
    '--i': i,
    transition: 'd var(--vg-daten) var(--vg-kurve)',
  })

  return (
    <div className="vg-diagramm vg-paar" ref={huelle} style={{ position: 'relative' }}>
      <svg
        width="100%" height={svgHoehe} role="img"
        aria-label={`${altLabel} und ${neuLabel} je Bauteil`}
        style={{ overflow: 'visible', display: 'block' }}
        onMouseLeave={() => setAktiv(null)}
      >
        <g transform={`translate(${rand.links},${rand.oben})`}>
          {/* Gitter: wenige, helle, durchgezogene Linien; Achsenwert links */}
          {ticks.map(t => (
            <g key={t}>
              <line x1={0} x2={innenB} y1={y(t)} y2={y(t)} stroke="var(--vg-viz-gitter)" strokeWidth={1} />
              {achse && (
                <text x={-8} y={y(t) + 3.5} textAnchor="end" fontSize={MASS.achseSchrift} fill="var(--vg-text-3)">
                  {achseEuroFest(t)}
                </text>
              )}
            </g>
          ))}
          <line x1={0} x2={innenB} y1={innenH} y2={innenH} stroke="var(--vg-viz-achse)" strokeWidth={1} />

          {geo.map(g => {
            const hAlt = Math.max(0, innenH - g.yAlt)
            const hNeu = Math.max(0, innenH - g.yNeu)
            const spitze = Math.min(g.yAlt, g.yNeu)
            const ton = tonVon(g.delta)
            return (
              <g
                key={g.id}
                opacity={dimm(g)}
                style={{ transition: 'opacity var(--vg-schnell) var(--vg-kurve)', cursor: aufPaar ? 'pointer' : 'default' }}
                onMouseEnter={() => setAktiv(g.id)}
                onClick={aufPaar ? () => aufPaar(g) : undefined}
              >
                {/* Trefferfläche größer als die Marke */}
                <rect x={g.mitte - fach / 2} y={0} width={fach} height={innenH} fill="transparent" />

                {/* heute: eckig an der Grundlinie, 4 px gerundet am Datenende */}
                <path
                  className={animiert ? 'vg-zeichnen' : undefined}
                  d={saeule(g.xAlt, g.yAlt, saeuleB, hAlt)}
                  fill={farbeAlt}
                  style={saeuleStil(g.i)}
                />
                <path
                  className={animiert ? 'vg-zeichnen' : undefined}
                  d={saeule(g.xNeu, g.yNeu, saeuleB, hNeu)}
                  fill={farbeNeu}
                  style={saeuleStil(g.i)}
                />

                {/* Werte über den Säulen: heute gedämpft, Zielmodell betont */}
                {mitWerten && (
                  <>
                    <text
                      className={animiert ? 'vg-zeichnen-text' : undefined}
                      x={werteMittig ? g.xAlt + saeuleB / 2 : g.xAlt + saeuleB - 1}
                      y={g.yAlt - 4}
                      textAnchor={werteMittig ? 'middle' : 'end'}
                      fontSize={WERT_SCHRIFT} fill="var(--vg-text-3)"
                      style={{ '--i': g.i, fontVariantNumeric: 'tabular-nums', pointerEvents: 'none' }}
                    >
                      {wertText(g.alt, einheit)}
                    </text>
                    <text
                      className={animiert ? 'vg-zeichnen-text' : undefined}
                      x={werteMittig ? g.xNeu + saeuleB / 2 : g.xNeu + 1}
                      y={g.yNeu - 4}
                      textAnchor={werteMittig ? 'middle' : 'start'}
                      fontSize={WERT_SCHRIFT} fontWeight={500} fill="var(--vg-text)"
                      style={{ '--i': g.i, fontVariantNumeric: 'tabular-nums', pointerEvents: 'none' }}
                    >
                      {wertText(g.neu, einheit)}
                    </text>
                  </>
                )}

                {/* Delta über dem Paar als farbige Marke — die eine Zahl, die zählt */}
                {zeigen.has(g.id) && (
                  <DeltaMarke
                    x={g.mitte}
                    yUnten={spitze - (mitWerten ? 17 : 5) + (versatz[g.id] || 0)}
                    delta={g.delta} ton={ton} i={g.i} animiert={animiert}
                  />
                )}

                {/* Kategorie unter der Grundlinie */}
                <text
                  x={g.mitte} y={innenH + 16} textAnchor="middle"
                  fontSize={kategorieSchrift} fill="var(--vg-text-3)"
                >
                  {kategorieEng ? (g.kurz || g.label) : g.label}
                </text>
              </g>
            )
          })}
        </g>
      </svg>

      {mitLegende && (
        <div style={{ marginTop: 4 }}>
          <Legende eintraege={[
            { label: altLabel, farbe: farbeAlt },
            { label: neuLabel, farbe: farbeNeu },
          ]} />
        </div>
      )}

      {aktivesPaar && (
        <div
          className="vg-tooltip"
          style={{
            position: 'absolute',
            left: Math.min(breite - 230, Math.max(0, rand.links + aktivesPaar.mitte - 110)),
            top: Math.max(0, rand.oben + Math.min(aktivesPaar.yAlt, aktivesPaar.yNeu) - 96),
            pointerEvents: 'none',
          }}
        >
          <div className="vg-tooltip-titel">{aktivesPaar.label}</div>
          <div className="vg-tooltip-zeile">
            <span className="vg-reihe" style={{ gap: 6 }}>
              <span className="vg-legende-marke" style={{ background: farbeAlt }} />
              <span className="vg-gedaempft">{altLabel}</span>
            </span>
            <span>{format(aktivesPaar.alt)}</span>
          </div>
          <div className="vg-tooltip-zeile">
            <span className="vg-reihe" style={{ gap: 6 }}>
              <span className="vg-legende-marke" style={{ background: farbeNeu }} />
              <span className="vg-gedaempft">{neuLabel}</span>
            </span>
            <span>{format(aktivesPaar.neu)}</span>
          </div>
          <div className="vg-tooltip-zeile">
            <span className="vg-gedaempft">Veränderung</span>
            <span style={{ color: tonVon(aktivesPaar.delta) === 'neutral' ? 'var(--vg-text-3)' : `var(--vg-${tonVon(aktivesPaar.delta)})` }}>
              {euroKompaktDelta(aktivesPaar.delta)} ({prozentDelta(aktivesPaar.prozent)})
            </span>
          </div>
          {aktivesPaar.hinweis && (
            <div className="vg-t-sm vg-schwach" style={{ marginTop: 6, maxWidth: 240, lineHeight: 1.45 }}>{aktivesPaar.hinweis}</div>
          )}
        </div>
      )}
    </div>
  )
}

/**
 * Gerundete Marke: Box in der Tonfarbe (positiv, warnung, negativ; neutral
 * in der neutralen Fläche), Schrift in --vg-pille-text (hell auf den
 * 500er-Tönen, dunkel im Steuerblock und im Dunkelmodus, wo die Töne hell
 * sind). `massText` bemisst die Box, wenn der gezeigte Text noch zählt
 * (DeltaMarke), damit sie beim Zählen nicht atmet. Auch das Bausteine-
 * Diagramm (bausteine.jsx) setzt sie über seine Säulen.
 */
export function Marke({ x, yUnten, text, ton, massText = text }) {
  const breite = massText.length * MARKE_ZEICHEN + MARKE_INNEN
  const neutral = ton === 'neutral'
  return (
    <>
      <rect
        x={x - breite / 2} y={yUnten - MARKE_HOEHE} width={breite} height={MARKE_HOEHE}
        rx={MARKE_RADIUS} ry={MARKE_RADIUS}
        fill={neutral ? 'var(--vg-neutral-flaeche)' : `var(--vg-${ton})`}
        style={{ transition: 'x var(--vg-daten) var(--vg-kurve), y var(--vg-daten) var(--vg-kurve), width var(--vg-daten) var(--vg-kurve)' }}
      />
      <text
        x={x} y={yUnten - 5} textAnchor="middle"
        fontSize={MARKE_SCHRIFT} fontWeight={500}
        fill={neutral ? 'var(--vg-text)' : 'var(--vg-pille-text, #ffffff)'}
        style={{ fontVariantNumeric: 'tabular-nums', transition: 'y var(--vg-daten) var(--vg-kurve)' }}
      >
        {text}
      </text>
    </>
  )
}

/**
 * Delta-Marke des Paardiagramms: der Wert zählt beim Erscheinen von null
 * hoch und läuft bei jedem späteren Wertwechsel in 420 ms nach. Ohne
 * `animiert` steht der Endwert sofort (Druck).
 */
function DeltaMarke({ x, yUnten, delta, ton, i, animiert }) {
  const wert = useZaehlwert(delta, { dauer: DAUER.daten, von: animiert ? 0 : delta })
  return (
    <g
      className={animiert ? 'vg-zeichnen-text' : undefined}
      style={{ '--i': i, pointerEvents: 'none' }}
    >
      <Marke x={x} yUnten={yUnten} text={deltaText(wert)} massText={deltaText(delta)} ton={ton} />
    </g>
  )
}

/** Säulenpfad: unten eckig, oben 4 px gerundet; bei winzigen Höhen ohne Rundung. */
function saeule(x, y, b, h) {
  const r = Math.min(4, h / 2, b / 2)
  if (h <= 0.5) return `M${x},${y + h}h${b}v0h${-b}z`
  return `M${x},${y + h}V${y + r}a${r},${r} 0 0 1 ${r},${-r}h${b - 2 * r}a${r},${r} 0 0 1 ${r},${r}V${y + h}z`
}

// ---------------------------------------------------------------- Paare bilden

/**
 * Die fünf Paare, die die Reform erzählen. Aus zwei Ergebnisobjekten
 * (heute, Ziel) mit den Bauteilen apLeben, apKomposit, lp, bpLeben,
 * bpKomposit, bonus, zuschuesse.
 */
export function bauteilPaare(ist, ziel) {
  const s = (o, ...k) => k.reduce((a, key) => a + (o?.[key] || 0), 0)
  return [
    { id: 'ap', label: 'Abschluss', kurz: 'Abschl.', alt: s(ist, 'apLeben', 'apKomposit'), neu: s(ziel, 'apLeben', 'apKomposit'),
      hinweis: 'Einmalige Vergütung beim Vertragsabschluss, Leben und Komposit.' },
    { id: 'lp', label: 'Laufend', kurz: 'Lfd.', alt: s(ist, 'lp'), neu: s(ziel, 'lp'),
      hinweis: 'Laufende Provision über die Vertragslaufzeit — im Zielmodell neu aufgebaut.' },
    { id: 'bp', label: 'Bestand', kurz: 'Best.', alt: s(ist, 'bpLeben', 'bpKomposit'), neu: s(ziel, 'bpLeben', 'bpKomposit'),
      hinweis: 'Vergütung des betreuten Bestands statt allein des Abschlusses.' },
    { id: 'bonus', label: 'Bonifikation', kurz: 'Bonus', alt: s(ist, 'bonus'), neu: s(ziel, 'bonus'),
      hinweis: 'Qualitätsgebundene Bonifikation.' },
    { id: 'zu', label: 'Zuschüsse', kurz: 'Zusch.', alt: s(ist, 'zuschuesse'), neu: s(ziel, 'zuschuesse'),
      hinweis: 'Zuschüsse und Sonderpositionen.' },
  ]
}

/** Paare je Sparte — Leben gegen Komposit, wie im alten Werkzeug. */
export function spartenPaare(ist, ziel) {
  const s = (o, ...k) => k.reduce((a, key) => a + (o?.[key] || 0), 0)
  return [
    { id: 'leben', label: 'Leben', alt: s(ist, 'apLeben', 'lp', 'bpLeben'), neu: s(ziel, 'apLeben', 'lp', 'bpLeben') },
    { id: 'komposit', label: 'Komposit', kurz: 'Komp.', alt: s(ist, 'apKomposit', 'bpKomposit'), neu: s(ziel, 'apKomposit', 'bpKomposit') },
    { id: 'bonus', label: 'Bonifikation', kurz: 'Bonus', alt: s(ist, 'bonus'), neu: s(ziel, 'bonus') },
    { id: 'zu', label: 'Zuschüsse', kurz: 'Zusch.', alt: s(ist, 'zuschuesse'), neu: s(ziel, 'zuschuesse') },
  ]
}

// ---------------------------------------------------------------- Wasserfall verdichten

/**
 * Zehn Stufen sind für eine Zerlegung richtig und für einen Pitch zu viele.
 * Diese Verdichtung fasst benachbarte Stufen zu vier Gruppen zusammen — die
 * Summe bleibt exakt, weil nur addiert wird.
 */
const GRUPPEN = [
  { id: 'abschluss', kurz: 'Abschluss', label: 'Abschlussvergütung und Fokusfelder', stufen: ['apSaetze', 'fokusfelder'] },
  { id: 'aufbau', kurz: 'Laufend und\nBestand', label: 'Laufende und Bestandsvergütung', stufen: ['laufend', 'bestand'] },
  { id: 'steuerung', kurz: 'Steuerung', label: 'Wahlmodelle, Requalifizierung, Bonifikation', stufen: ['wahlmodelle', 'qualitaet', 'bonus'] },
  { id: 'rest', kurz: 'Journey und\nZuschüsse', label: 'Journey-Teilung und Zuschüsse', stufen: ['journey', 'zuschuesse'] },
]

export function verdichteStufen(stufen) {
  const nachId = Object.fromEntries(stufen.map(s => [s.id, s]))
  const aus = []
  const start = stufen.find(s => s.typ === 'summe')
  if (start) aus.push(start)
  for (const g of GRUPPEN) {
    const teile = g.stufen.map(id => nachId[id]).filter(Boolean)
    if (!teile.length) continue
    aus.push({
      id: g.id, typ: 'schritt', label: g.label, kurz: g.kurz,
      wert: teile.reduce((a, t) => a + t.wert, 0),
      hinweis: teile.map(t => t.label).join(', '),
    })
  }
  for (const s of stufen) {
    if (s.typ === 'summe' && s !== start) aus.push(s)
    else if (s.id === 'uebergang') aus.push(s)
  }
  return aus
}

export { euroKompakt as _paarFormatKompakt }
