// ===========================================================================
// Vergütungswerk — gehobene Diagrammschicht
//
// Drei Diagramme auf angehobenem Niveau:
//   Wasserfall   — eigenes Inline-SVG (recharts kann keine Verbindungslinien,
//                  keine Mindesthöhe für Kleinststufen, keine Kollisionslösung)
//   Verlauf      — recharts, Direktbeschriftung statt Legende, Anmerkungsebene
//   Verteilung   — recharts, Anmerkungsebene und Kollisionslösung
//
// Alle Farben ausschließlich über --vg-*/--brand-* Token. Keine festen Hex.
// Drei Tinten: Grau ist heute, Tiefgrün (--vg-viz-3) ist das Zielmodell,
// Grün/Rot nur für die eine Zahl, die das Diagramm beantwortet.
// ===========================================================================

import { useMemo, useRef, useState, useEffect, useLayoutEffect, useCallback } from 'react'
import {
  ResponsiveContainer, ComposedChart, Line, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ReferenceLine, ReferenceArea,
  ScatterChart, Scatter, ZAxis, Cell, LabelList,
  useXAxisScale, useYAxisScale, usePlotArea,
} from 'recharts'
import {
  euro, euroKompakt, achseEuro, achseEuroFest, euroKompaktDelta, prozentDelta,
} from '../lib/format'
import { AMPEL_SCHWELLEN } from '../lib/modell'
import { DAUER, reduzierteBewegung } from '../lib/bewegung'

// ---------------------------------------------------------------- Grundmaße
//
// Ein Satz Konstanten für alle Diagramme. Wer eine Zahl ändert, ändert sie
// hier — nicht in einem einzelnen Diagramm. Auf Beamerdistanz ist 12 px die
// Untergrenze; kleinere diagrammeigene Größen gibt es nicht mehr.

export const MASS = {
  achseSchrift: 12,        // Achsenwerte
  kategorieSchrift: 12,    // Kategoriennamen unter der x-Achse
  wertSchrift: 12.5,       // Direktbeschriftung am Datenpunkt
  summeSchrift: 13.5,      // Beschriftung der Summenstufen, Netto
  anmerkungSchrift: 12,    // Anmerkungsebene
  balkenMax: 56,           // kein Balken breiter als 56 px
  balkenLuecke: 0.38,      // Lücke = 38 % des Rasterfachs → 61 % der Balkenbreite
  radius: 2,               // nur am Datenende
  gitterZahl: 3,           // 3 waagerechte Gitterlinien, nie mehr
  minStufe: 3,             // kleinste sichtbare Stufenhöhe in px
  reihenBreite: 2.5,       // Linienstärke der Datenreihen
  gutterRechts: 132,       // Platz für Direktbeschriftung am Linienende
}

/** Achsentext: 12 px in der dritten Textstufe — lesbar auf Distanz. */
const ACHSENTEXT = { fontSize: MASS.achseSchrift, fill: 'var(--vg-text-3)' }

/** Y-Werte, die über Linien liegen können, bekommen einen Flächenhof. */
const ACHSENTEXT_HOF = {
  ...ACHSENTEXT,
  paintOrder: 'stroke', stroke: 'var(--vg-flaeche)', strokeWidth: 3, strokeLinejoin: 'round',
}

/**
 * Nice-Ticks ohne d3: 1/2/2,5/5/10er-Schritte, hoechstens `anzahl` + 1 Werte,
 * und der Schritt wird so lange verdoppelt, bis keine zwei Achsenwerte nach
 * der Formatierung gleich lauten („8,3 Mio.“ zweimal untereinander ist
 * der haeufigste Fehler bei gekuerzten Achsen).
 */
export function niceTicks(lo, hi, anzahl = MASS.gitterZahl, format = achseEuro) {
  if (!(hi > lo)) return [lo]
  const groesse = Math.pow(10, Math.floor(Math.log10((hi - lo) / anzahl)))
  const leiter = [1, 2, 2.5, 5, 10, 20, 25, 50, 100]
  for (const f of leiter) {
    const schritt = groesse * f
    const out = []
    for (let v = Math.ceil(lo / schritt) * schritt; v <= hi + schritt * 1e-9; v += schritt) {
      out.push(Number(v.toPrecision(12)))
    }
    if (out.length < 2) continue
    if (out.length > anzahl + 1) continue
    if (format && new Set(out.map(format)).size !== out.length) continue
    return out
  }
  // Notnagel: so eng, dass die Formatierung nicht mehr auflöst — dann lieber
  // zwei Werte als drei gleich lautende.
  const roh = [lo, (lo + hi) / 2, hi]
  const gesehen = new Set()
  return roh.filter(v => {
    const k = format ? format(v) : v
    if (gesehen.has(k)) return false
    gesehen.add(k)
    return true
  })
}

/** Containerbreite in px — für eigenes SVG und für Kollisionsrechnung. */
export function useBreite(startwert = 640) {
  const ref = useRef(null)
  const [breite, setBreite] = useState(startwert)
  useLayoutEffect(() => {
    const el = ref.current
    if (!el) return
    const ro = new ResizeObserver(([e]) => {
      const w = e.contentRect.width
      if (w > 0) setBreite(w)
    })
    ro.observe(el)
    return () => ro.disconnect()
  }, [])
  return [ref, breite]
}

/**
 * Dunkelmodus zur Laufzeit: MarkeProvider schreibt data-theme auf das
 * Wurzelelement, „auto“ entfernt das Attribut und überlässt es dem System.
 * Nötig, weil SVG-Füllungen aus JSX kommen und kein CSS-Selektor sie
 * je nach Modus umschalten kann, ohne eine eigene Stylesheet-Datei.
 */
export function useDunkel() {
  const lesen = () => {
    if (typeof document === 'undefined') return false
    const t = document.documentElement.getAttribute('data-theme')
    if (t === 'dark') return true
    if (t === 'light') return false
    return typeof matchMedia === 'function' && matchMedia('(prefers-color-scheme: dark)').matches
  }
  const [dunkel, setDunkel] = useState(lesen)
  useEffect(() => {
    const aktualisieren = () => setDunkel(lesen())
    const mo = new MutationObserver(aktualisieren)
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] })
    const mq = typeof matchMedia === 'function' ? matchMedia('(prefers-color-scheme: dark)') : null
    mq?.addEventListener?.('change', aktualisieren)
    return () => { mo.disconnect(); mq?.removeEventListener?.('change', aktualisieren) }
  }, [])
  return dunkel
}

// ------------------------------------------------------------- Kurzinfokasten

export function Kasten({ titel, zeilen, fuss }) {
  return (
    <div className="vg-tooltip">
      {titel && <div className="vg-tooltip-titel">{titel}</div>}
      {zeilen.map((z, i) => (
        <div className="vg-tooltip-zeile" key={i}>
          <span className="vg-reihe" style={{ gap: 6 }}>
            {z.farbe && <span className="vg-legende-marke" style={{ background: z.farbe }} />}
            <span className="vg-gedaempft">{z.label}</span>
          </span>
          <span style={{ color: z.ton ? `var(--vg-${z.ton})` : undefined }}>{z.wert}</span>
        </div>
      ))}
      {fuss && <div className="vg-t-sm vg-schwach" style={{ marginTop: 6, maxWidth: 250, lineHeight: 1.45 }}>{fuss}</div>}
    </div>
  )
}

// ------------------------------------------------------------------ Legende
//
// Die eine HTML-Legende für alle Diagramme (8-px-Marke oder 13-px-Linie).
// Liegt hier und nicht in index.jsx, damit paar.jsx sie ohne Ringimport
// erreicht; index.jsx reicht sie unter demselben Namen weiter.

export function Legende({ eintraege }) {
  return (
    <div className="vg-legende">
      {eintraege.map(e => (
        <span className="vg-legende-eintrag" key={e.label}>
          <span
            className={e.linie ? 'vg-legende-linie' : 'vg-legende-marke'}
            style={{ background: e.farbe, ...(e.gestrichelt ? { background: `repeating-linear-gradient(90deg, ${e.farbe} 0 4px, transparent 4px 7px)` } : {}) }}
          />
          {e.label}
        </span>
      ))}
    </div>
  )
}

// ===========================================================================
// 1 — WASSERFALL (Inline-SVG)
// ===========================================================================
//
// Warum kein recharts: (a) die Verbindungslinien zwischen den Stufen sind
// kein recharts-Primitiv, (b) der schwebende Balken braucht einen
// transparenten Sockelbalken, der in Tooltip und Legende mitläuft,
// (c) Kleinststufen brauchen eine Mindesthöhe, (d) recharts löst
// Beschriftungskollisionen nicht auf. Alles vier ist in 200 Zeilen SVG
// billiger als in recharts-Umgehungen.

export function Wasserfall({
  stufen,
  hoehe = 340,
  aufStufe,
  hervor,                       // id einer Stufe, die stehen bleibt
  referenzlinie = true,         // waagerechte Linie auf Höhe „heute“
  nettoPille = true,
}) {
  const [huelle, breite] = useBreite(720)
  const [aktiv, setAktiv] = useState(null)
  const [zeiger, setZeiger] = useState({ x: 0, y: 0 })
  const dunkel = useDunkel()

  // -- Werte in Sockel und Balken zerlegen ---------------------------------
  const daten = useMemo(() => {
    let lauf = 0
    return stufen.map(s => {
      if (s.typ === 'summe') {
        lauf = s.wert
        return { ...s, von: 0, bis: s.wert, ende: s.wert }
      }
      const von = lauf
      const bis = lauf + s.wert
      lauf = bis
      return { ...s, von, bis, ende: bis }
    })
  }, [stufen])

  // -- Achsenausschnitt ----------------------------------------------------
  // Summen bei ~9 Mio., Stufen bei ~200 Tsd.: auf einer Nullachse bleibt ein
  // leeres Bild. Die Achse wird gekürzt, der Schnitt aber sichtbar markiert
  // (Bruchkerbe im Balkenfuß mit Erklärung als Tip), nicht verschwiegen.
  const { unten, oben, gekuerzt, ticks } = useMemo(() => {
    // Summenbalken stehen definitionsgemäß auf null (von = 0). Nähme man
    // ihren Fuß mit auf, wäre das Minimum immer null und die Kürzung fiele
    // aus — genau der Fall, in dem die Stufen als Striche am oberen Rand
    // enden. Von den Summen zählt deshalb nur ihre Höhe.
    const kanten = daten.flatMap(d => (d.typ === 'summe' ? [d.wert] : [d.von, d.bis]))
    const lo = Math.min(...kanten)
    const hi = Math.max(...kanten)
    const spanne = Math.max(hi - lo, Math.abs(hi) * 0.02, 1)
    const u = Math.max(0, lo - spanne * 0.45)
    const o = hi + spanne * 0.18
    return { unten: u, oben: o, gekuerzt: u > 0, ticks: niceTicks(u, o) }
  }, [daten])

  // -- Geometrie -----------------------------------------------------------
  const rand = { oben: 30, unten: 46, links: 56, rechts: 8 }
  const innenB = Math.max(120, breite - rand.links - rand.rechts)
  const innenH = Math.max(90, hoehe - rand.oben - rand.unten)
  const fach = innenB / daten.length
  const balkenB = Math.min(MASS.balkenMax, fach * (1 - MASS.balkenLuecke))
  const y = useCallback(
    (v) => innenH - ((v - unten) / (oben - unten)) * innenH,
    [innenH, unten, oben])

  const geo = daten.map((d, i) => {
    const mitte = fach * i + fach / 2
    const yVon = y(Math.max(d.von, unten))
    const yBis = y(d.bis)
    let top = Math.min(yVon, yBis)
    let h = Math.abs(yVon - yBis)
    const winzig = d.typ !== 'summe' && h < MASS.minStufe
    if (winzig) { h = MASS.minStufe; top = Math.min(top, innenH - MASS.minStufe) }
    // Summenbalken laufen bei gekürzter Achse unten aus dem Bild
    if (d.typ === 'summe') h = innenH - top
    return { ...d, i, mitte, x: mitte - balkenB / 2, top, h, winzig }
  })

  const start = daten[0]?.wert ?? 0
  const ende = daten[daten.length - 1]?.ende ?? 0
  const netto = ende - start
  const zielSaeule = [...geo].reverse().find(d => d.typ === 'summe')

  // Im Dunkelmodus wären zwei große Blöcke in --vg-viz-1 die hellsten
  // Flächen der Seite; die gedeckte Stufe 8 hält die Summen zurück.
  const farbe = (d) => d.typ === 'summe'
    ? (dunkel ? 'var(--vg-viz-8)' : 'var(--vg-viz-1)')
    : d.wert >= 0 ? 'var(--vg-positiv-flaeche)' : 'var(--vg-negativ-flaeche)'

  const gedimmt = (d) => hervor && hervor !== d.id ? 0.3 : 1

  const schnittText = gekuerzt
    ? `Achse gekürzt: sie beginnt bei ${achseEuro(unten)}, nicht bei null. Die Balkenhöhe zeigt die Wirkung der Stufe, nicht das Größenverhältnis der Summen.`
    : ''

  return (
    <div className="vg-diagramm" ref={huelle} style={{ position: 'relative' }}>
      <svg
        width="100%" height={hoehe} role="img"
        aria-label={`Wasserfall von ${euro(start)} auf ${euro(ende)}${gekuerzt ? '. ' + schnittText : ''}`}
        style={{ overflow: 'visible', display: 'block' }}
        onMouseLeave={() => setAktiv(null)}
      >
        <g transform={`translate(${rand.links},${rand.oben})`}>
          {/* --- Gitter: nur waagerecht, 3 Linien, Werte rechtsbündig ----- */}
          {ticks.map(t => (
            <g key={t}>
              <line
                x1={0} x2={innenB} y1={y(t)} y2={y(t)}
                stroke="var(--vg-viz-gitter)" strokeWidth={1} shapeRendering="crispEdges"
              />
              <text
                x={-10} y={y(t)} dy="0.32em" textAnchor="end"
                fontSize={MASS.achseSchrift} fill="var(--vg-text-3)"
                style={{ fontVariantNumeric: 'tabular-nums' }}
              >
                {achseEuroFest(t)}
              </text>
            </g>
          ))}

          {/* --- Referenzlinie „heute“ ------------------------------------ */}
          {referenzlinie && start > unten && (
            <g>
              <line
                x1={0} x2={innenB} y1={y(start)} y2={y(start)}
                stroke="var(--vg-viz-ist)" strokeWidth={1.25} strokeDasharray="5 4"
              />
              {/* Links neben der ersten Stufe, nicht am rechten Rand: dort
                  steht der Zielmodell-Balken und schneidet die Beschriftung an. */}
              {/* Unter der Linie, weil über ihr die Summenbeschriftung des ersten
                  Balkens steht — sonst schreiben beide übereinander. */}
              <text
                x={(geo[0]?.x ?? 0) + balkenB + 10} y={y(start) + 13} textAnchor="start"
                fontSize={MASS.anmerkungSchrift} fill="var(--vg-text-3)"
              >
                Niveau heute
              </text>
            </g>
          )}

          {/* --- Verbindungslinien: nur über die Lücke, nie über Balken --- */}
          {geo.slice(0, -1).map((d, i) => {
            const naechster = geo[i + 1]
            const yy = y(d.ende)
            if (yy < 0 || yy > innenH) return null
            return (
              <line
                key={`v-${d.id}`}
                x1={d.x + balkenB} x2={naechster.x}
                y1={yy} y2={yy}
                stroke="var(--vg-viz-achse)" strokeWidth={1} strokeOpacity={0.55}
                shapeRendering="crispEdges"
              />
            )
          })}

          {/* --- Balken --------------------------------------------------- */}
          {geo.map(d => {
            const r = d.typ === 'summe' ? [MASS.radius, MASS.radius, 0, 0] : null
            const negativ = d.typ !== 'summe' && d.wert < 0
            return (
              <g
                key={d.id}
                opacity={gedimmt(d)}
                onMouseMove={(e) => {
                  const box = huelle.current.getBoundingClientRect()
                  setZeiger({ x: e.clientX - box.left, y: e.clientY - box.top })
                  setAktiv(d)
                }}
                onClick={aufStufe ? () => aufStufe(d) : undefined}
                tabIndex={aufStufe ? 0 : -1}
                role={aufStufe ? 'button' : undefined}
                onKeyDown={aufStufe ? (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); aufStufe(d) } } : undefined}
                style={{ cursor: aufStufe ? 'pointer' : 'default', outline: 'none' }}
              >
                {/* Trefferfläche über das ganze Fach — Hover darf nicht am
                    3-px-Balken hängen */}
                <rect
                  x={d.mitte - fach / 2} y={-rand.oben}
                  width={fach} height={innenH + rand.oben + rand.unten}
                  fill={aktiv?.id === d.id ? 'var(--vg-viz-band)' : 'transparent'}
                />
                {/* Einzeichnen: die innere Gruppe umfasst nur den Balken, damit
                    fill-box an seiner Unterkante ansetzt — nicht an der
                    Trefferfläche. Negative Stufen hängen von oben herab und
                    wachsen deshalb von ihrer Oberkante. */}
                <g
                  className="vg-zeichnen"
                  style={{ '--i': d.i, ...(negativ ? { transformOrigin: 'top' } : {}) }}
                >
                  {r ? (
                    <path
                      d={abgerundet(d.x, d.top, balkenB, d.h, r)} fill={farbe(d)}
                      fillOpacity={dunkel ? 0.8 : 1}
                    />
                  ) : (
                    <rect
                      x={d.x} y={d.top} width={balkenB} height={d.h}
                      rx={Math.min(MASS.radius, d.h / 2)} fill={farbe(d)}
                      fillOpacity={d.winzig ? 0.85 : 1}
                    />
                  )}
                  {/* Kerbe: gekürzte Summenbalken bekommen einen Zickzackfuß;
                      die Erklärung der Kürzung hängt als Tip daran. */}
                  {d.typ === 'summe' && gekuerzt && (
                    <path
                      d={zickzackPfad(d.x, innenH, balkenB)}
                      fill="none" stroke="var(--vg-flaeche)" strokeWidth={3}
                    >
                      <title>{schnittText}</title>
                    </path>
                  )}
                </g>
              </g>
            )
          })}

          {/* --- Direktbeschriftung: Wert am äußeren Balkenende ------------ */}
          {geo.map(d => {
            const summe = d.typ === 'summe'
            const obenLabel = summe || d.wert >= 0
            let ly = obenLabel ? d.top - 7 : d.top + d.h + 13
            if (ly > innenH + 12) ly = d.top - 7
            if (ly < -8) ly = d.top + d.h + 13
            return (
              <text
                key={`l-${d.id}`}
                className="vg-zeichnen-text"
                x={d.mitte} y={ly} textAnchor="middle"
                opacity={gedimmt(d)}
                fontSize={summe ? MASS.summeSchrift : MASS.wertSchrift}
                fontWeight={500}
                fill={summe ? 'var(--vg-text)'
                  : d.wert >= 0 ? 'var(--vg-positiv)' : 'var(--vg-negativ)'}
                style={{ '--i': d.i, fontVariantNumeric: 'tabular-nums', pointerEvents: 'none' }}
              >
                {summe ? euroKompakt(d.wert) : euroKompaktDelta(d.wert)}
              </text>
            )
          })}

          {/* --- Kategoriennamen: zweizeilig, nie gedreht ------------------ */}
          {geo.map(d => {
            const zeilen = String(d.kurz ?? d.label ?? '').split('\n').slice(0, 2)
            return (
              <text
                key={`k-${d.id}`}
                x={d.mitte} y={innenH + 16} textAnchor="middle"
                fontSize={MASS.kategorieSchrift}
                fill={d.typ === 'summe' ? 'var(--vg-text-2)' : 'var(--vg-text-4)'}
                fontWeight={d.typ === 'summe' ? 500 : 400}
                style={{ pointerEvents: 'none' }}
              >
                {zeilen.map((t, i) => (
                  <tspan key={i} x={d.mitte} dy={i === 0 ? 0 : 12}>{t}</tspan>
                ))}
              </text>
            )
          })}
        </g>

        {/* --- Nettoergebnis: die Antwort der Karte, links neben der
               Zielsäule in der obersten Zeile ------------------------------ */}
        {nettoPille && (
          <g transform={`translate(${rand.links + (zielSaeule ? zielSaeule.x - 8 : innenB)},14)`}>
            <text
              className="vg-zeichnen-text"
              x={0} y={0} textAnchor="end"
              fontSize={MASS.summeSchrift} fill="var(--vg-text-3)"
              style={{ '--i': daten.length, pointerEvents: 'none' }}
            >
              <tspan>Netto </tspan>
              <tspan
                fontWeight={500}
                fill={netto >= 0 ? 'var(--vg-positiv)' : 'var(--vg-negativ)'}
                style={{ fontVariantNumeric: 'tabular-nums' }}
              >
                {euroKompaktDelta(netto)}
              </tspan>
              <tspan fill="var(--vg-text-4)" fontSize={MASS.anmerkungSchrift}>
                {' '}({prozentDelta(start ? (netto / start) * 100 : 0)})
              </tspan>
            </text>
          </g>
        )}
      </svg>

      {/* --- Kurzinfo ---------------------------------------------------- */}
      {aktiv && (
        <div
          style={{
            position: 'absolute', pointerEvents: 'none', zIndex: 5,
            left: Math.min(zeiger.x + 14, breite - 200),
            top: Math.max(4, zeiger.y - 12),
          }}
        >
          <Kasten
            titel={aktiv.label}
            zeilen={[
              aktiv.typ === 'summe'
                ? { label: 'Vergütung', wert: euro(aktiv.wert) }
                : { label: 'Wirkung', wert: euroKompaktDelta(aktiv.wert), ton: aktiv.wert >= 0 ? 'positiv' : 'negativ' },
              { label: 'Stand danach', wert: euro(aktiv.ende) },
              ...(aktiv.typ !== 'summe' && start
                ? [{ label: 'Anteil am Nettoeffekt', wert: prozentDelta(netto ? (aktiv.wert / Math.abs(netto)) * 100 : 0) }]
                : []),
            ]}
            fuss={aktiv.winzig
              ? `${aktiv.hinweis ? aktiv.hinweis + ' ' : ''}Der Balken ist auf die Mindesthöhe gesetzt; maßgeblich ist die Zahl.`
              : aktiv.hinweis}
          />
        </div>
      )}
    </div>
  )
}

/** Rechteck mit Radius nur an ausgewählten Ecken. r = [ol, or, ur, ul] */
function abgerundet(x, yy, w, h, r) {
  const [a, b, c, d] = r.map(v => Math.min(v, w / 2, Math.abs(h) / 2))
  return `M${x + a},${yy}
    H${x + w - b} ${b ? `A${b},${b} 0 0 1 ${x + w},${yy + b}` : ''}
    V${yy + h - c} ${c ? `A${c},${c} 0 0 1 ${x + w - c},${yy + h}` : ''}
    H${x + d} ${d ? `A${d},${d} 0 0 1 ${x},${yy + h - d}` : ''}
    V${yy + a} ${a ? `A${a},${a} 0 0 1 ${x + a},${yy}` : ''} Z`
}

/** Zickzacklinie als Bruchkerbe im Balkenfuß. */
function zickzackPfad(x, yy, w) {
  const n = Math.max(3, Math.round(w / 7))
  const s = w / n
  let d = `M${x},${yy}`
  for (let i = 0; i < n; i++) d += ` l${s / 2},-4 l${s / 2},4`
  return d
}

// ===========================================================================
// 2 — MEHRJAHRESVERLAUF (recharts)
// ===========================================================================
//
// Drei Reihen, keine Legende: jede Linie trägt ihren Namen am rechten Ende.
// Die Fläche zwischen Zielmodell und Übergangsregel ist schraffiert — sie ist
// kein Dekor, sondern der Preis der Übergangsregel. „Was tatsächlich fließt“
// (mit Übergangsregel) ist die kräftige Zielmodell-Linie; das reine Zielmodell
// steht bei 45 % dahinter.

const FARBE_ZIELREIHE = 'var(--vg-viz-3)'
const FARBE_ZIELREIHE_REIN = 'color-mix(in srgb, var(--vg-viz-3) 45%, transparent)'

/** Kopfraum: eine Fahne nach oben (Break-even mit Jahr) braucht 49 px über
    dem Punkt; 30 px Rand plus die 12 % Luft der Achse reichen ab 200 px Höhe. */
const VERLAUF_RAND_OBEN = 30
const VERLAUF_RAND_OBEN_KOMPAKT = 18
/** Höhe einer zweizeiligen Anmerkung unter dem Punkt: Fahne 22, Titel 12,
    Unterzeile 13, Luft 4. */
const ANMERKUNG_HOEHE = 51
/** Fahnenlänge und Höhe der X-Achse (recharts-Standard 30). */
const FAHNE = 22
const X_ACHSE_HOEHE = 30

/**
 * @param kompakt  Startseite: keine y-Achse, zwei Gitterlinien, ein Endlabel
 *                 „2035 +2,8 %“, Tiefpunkt nur als Punkt
 * @param breite   feste Breite in px (Druck) — ohne ResponsiveContainer
 */
export function Verlauf({
  reihe,
  hoehe = 300,
  mitUebergang = true,
  referenzLabel = 'Vergütung heute',
  anmerkungen = true,
  kompakt = false,
  breite,
}) {
  const n = reihe.length
  const reduziert = reduzierteBewegung()

  const istKonstant = useMemo(
    () => reihe.every(r => Math.abs(r.ist - reihe[0].ist) < 1),
    [reihe])

  const zeigtUebergang = mitUebergang &&
    reihe.some(r => Math.abs((r.mitUebergang ?? r.ziel) - r.ziel) > 1)

  // Anmerkungsebene: Break-even und Tiefpunkt.
  const marken = useMemo(() => {
    if (!anmerkungen) return {}
    const wert = (r) => (zeigtUebergang ? (r.mitUebergang ?? r.ziel) : r.ziel)
    const tief = reihe.reduce((a, r) => (wert(r) - r.ist < wert(a) - a.ist ? r : a), reihe[0])
    let be = null
    for (let i = 1; i < n; i++) {
      const vorher = wert(reihe[i - 1]) - reihe[i - 1].ist
      const jetzt = wert(reihe[i]) - reihe[i].ist
      if (vorher < 0 && jetzt >= 0) { be = reihe[i]; break }
    }
    return { tief: tief && wert(tief) - tief.ist < 0 ? tief : null, be, wert }
  }, [reihe, n, zeigtUebergang, anmerkungen])

  const randOben = kompakt ? VERLAUF_RAND_OBEN_KOMPAKT : VERLAUF_RAND_OBEN

  // Achsenausschnitt: oben 12 % Luft. Unten so viel, dass die zweizeilige
  // Tiefpunkt-Anmerkung unter den tiefsten Punkt passt — der Tiefpunkt ist
  // per Definition das Minimum, 12 % Luft sind bei 220 px Höhe nur 14 px.
  // Die Luft wird deshalb aus der Pixelhöhe der Zeichenfläche gerechnet.
  const { ticks, domain } = useMemo(() => {
    const werte = reihe.flatMap(r => [r.ist, r.ziel, r.mitUebergang ?? r.ziel])
    const lo = Math.min(...werte), hi = Math.max(...werte)
    const spanne = (hi - lo) || hi * 0.05 || 1
    const flaecheH = Math.max(80, hoehe - randOben - 4 - X_ACHSE_HOEHE)
    const luftOben = 0.12
    const luftUnten = marken.tief && !kompakt
      ? Math.min(0.4, Math.max(0.12, (ANMERKUNG_HOEHE + 6) / flaecheH))
      : 0.12
    const gesamt = spanne / (1 - luftOben - luftUnten)
    const d = [Math.max(0, lo - luftUnten * gesamt), hi + luftOben * gesamt]
    return { domain: d, ticks: niceTicks(d[0], d[1], kompakt ? 2 : MASS.gitterZahl) }
  }, [reihe, kompakt, hoehe, randOben, marken.tief])

  const masse = breite ? { width: breite, height: hoehe } : {}

  const diagramm = (
    <ComposedChart
      data={reihe}
      {...masse}
      margin={{ top: randOben, right: kompakt ? 64 : MASS.gutterRechts, left: kompakt ? 8 : 2, bottom: 4 }}
    >
      <defs>
        {/* Schraffur = „nur wegen der Übergangsregel“ (IBCS-Notation für
            nicht-eingeschwungene Werte). Warnfarbe ist hier legitim: es
            sind Kosten. */}
        <pattern id="vgSchraffur" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
          <rect width="6" height="6" fill="var(--vg-warnung)" fillOpacity="0.07" />
          <line x1="0" y1="0" x2="0" y2="6" stroke="var(--vg-warnung)" strokeWidth="1.4" strokeOpacity="0.34" />
        </pattern>
      </defs>

      <CartesianGrid vertical={false} stroke="var(--vg-viz-gitter)" />

      <XAxis
        dataKey="jahr"
        axisLine={false} tickLine={false}
        interval="preserveStartEnd" minTickGap={26}
        tick={ACHSENTEXT}
        tickMargin={8}
      />
      {/* Einzeilige Werte („65,0 Mio.“ mit geschütztem Leerzeichen), die
          Einheit steht einmal über der Achse, nie je Tick. */}
      <YAxis
        hide={kompakt}
        width={56} domain={domain} ticks={ticks}
        axisLine={false} tickLine={false}
        tick={ACHSENTEXT_HOF}
        tickFormatter={achseEuroFest}
      />

      <Tooltip
        cursor={{ stroke: 'var(--vg-viz-achse)', strokeWidth: 1 }}
        content={({ active, payload, label }) => {
          if (!active || !payload?.length) return null
          const d = payload[0].payload
          const zeilen = [
            { label: referenzLabel, wert: euro(d.ist), farbe: 'var(--vg-viz-ist)' },
            { label: zeigtUebergang ? 'Zielmodell ohne Übergangsregel' : 'Zielmodell', wert: euro(d.ziel), farbe: zeigtUebergang ? FARBE_ZIELREIHE_REIN : FARBE_ZIELREIHE },
          ]
          if (zeigtUebergang && Math.abs(d.mitUebergang - d.ziel) > 1) {
            zeilen.push({ label: 'Zielmodell mit Übergangsregel', wert: euro(d.mitUebergang), farbe: FARBE_ZIELREIHE })
            zeilen.push({ label: 'Preis der Übergangsregel', wert: euroKompakt(d.mitUebergang - d.ziel) })
          }
          zeilen.push({
            label: 'Veränderung',
            wert: `${euroKompaktDelta(d.delta)} (${prozentDelta(d.deltaProzent)})`,
            ton: d.delta >= 0 ? 'positiv' : 'negativ',
          })
          return <Kasten titel={`Wertungsjahr ${label}`} zeilen={zeilen} />
        }}
      />

      {/* Preis der Übergangsregel als Bereichsfläche zwischen zwei Reihen */}
      {zeigtUebergang && (
        <Area
          type="monotone"
          dataKey={(d) => [Math.min(d.ziel, d.mitUebergang), Math.max(d.ziel, d.mitUebergang)]}
          fill="url(#vgSchraffur)" stroke="none"
          isAnimationActive={false} legendType="none" tooltipType="none"
        />
      )}

      {/* Referenzniveau „heute“: eine waagerechte Konstante ist keine
          Datenreihe, sondern die Bezugslinie — dünner, grau, gestrichelt. */}
      {istKonstant ? (
        <ReferenceLine
          y={reihe[0].ist}
          stroke="var(--vg-viz-ist)" strokeWidth={1.25} strokeDasharray="5 4"
        />
      ) : (
        <Line
          type="monotone" dataKey="ist" stroke="var(--vg-viz-ist)"
          strokeWidth={1.5} strokeDasharray="5 4" dot={false} isAnimationActive={false}
        />
      )}

      <Line
        type="monotone" dataKey="ziel"
        stroke={FARBE_ZIELREIHE}
        strokeWidth={zeigtUebergang ? 1.5 : MASS.reihenBreite}
        strokeOpacity={zeigtUebergang ? 0.45 : 1}
        dot={false}
        activeDot={{ r: 4, strokeWidth: 2, stroke: 'var(--vg-flaeche)' }}
        isAnimationActive={!reduziert}
        animationDuration={DAUER.daten}
      />

      {zeigtUebergang && (
        <Line
          type="monotone" dataKey="mitUebergang"
          stroke={FARBE_ZIELREIHE} strokeWidth={MASS.reihenBreite}
          dot={false}
          activeDot={{ r: 4, strokeWidth: 2, stroke: 'var(--vg-flaeche)' }}
          animationDuration={DAUER.daten}
        />
      )}

      {!kompakt && <Achsentitel text="EUR" />}
      <Beschriftungsebene
        reihe={reihe}
        zeigtUebergang={zeigtUebergang}
        referenzLabel={referenzLabel}
        marken={marken}
        kompakt={kompakt}
      />
    </ComposedChart>
  )

  return (
    <div className="vg-diagramm">
      {breite
        ? diagramm
        : <ResponsiveContainer width="100%" height={hoehe}>{diagramm}</ResponsiveContainer>}
    </div>
  )
}

/** Einheit einmal, rechtsbündig über den Achsenwerten. */
function Achsentitel({ text }) {
  const flaeche = usePlotArea()
  if (!flaeche) return null
  return (
    <text
      x={flaeche.x - 8} y={flaeche.y - 6} textAnchor="end"
      fontSize={MASS.achseSchrift} fill="var(--vg-text-4)"
      style={{ pointerEvents: 'none' }}
    >
      {text}
    </text>
  )
}

/**
 * Endbeschriftungen und Anmerkungen an einer Stelle, über die Skalen des
 * Diagramms gerechnet: Laufen Zielmodell und Übergangsregel am rechten
 * Rand zusammen (< 14 px), steht dort nur „Zielmodell“, und die
 * Übergangsregel wird zur Anmerkung am Tiefpunkt-Jahr. Sonst werden die
 * Labels mit 13 px Mindestabstand auseinandergeschoben.
 */
function Beschriftungsebene({ reihe, zeigtUebergang, referenzLabel, marken, kompakt }) {
  const xs = useXAxisScale()
  const ys = useYAxisScale()
  const flaeche = usePlotArea()
  if (!xs || !ys || !reihe.length) return null

  const letzt = reihe[reihe.length - 1]
  const xEnde = xs(letzt.jahr, { position: 'middle' })
  const yZiel = ys(letzt.ziel)
  const yUeb = ys(letzt.mitUebergang ?? letzt.ziel)
  const yIst = ys(letzt.ist)
  if (![xEnde, yZiel, yUeb, yIst].every(Number.isFinite)) return null

  const wertTief = marken.tief ? marken.wert(marken.tief) : null
  const xTief = marken.tief ? xs(marken.tief.jahr, { position: 'middle' }) : null
  const yTief = wertTief != null ? ys(wertTief) : null

  if (kompakt) {
    const fliesst = zeigtUebergang ? (letzt.mitUebergang ?? letzt.ziel) : letzt.ziel
    const dp = letzt.deltaProzent ?? (letzt.ist ? ((fliesst - letzt.ist) / letzt.ist) * 100 : 0)
    return (
      <g style={{ pointerEvents: 'none' }}>
        <EndLabel x={xEnde} y={zeigtUebergang ? yUeb : yZiel} text={`${letzt.jahr} ${prozentDelta(dp)}`} farbe={FARBE_ZIELREIHE} />
        {marken.tief && Number.isFinite(xTief) && Number.isFinite(yTief) && (
          <g>
            <circle cx={xTief} cy={yTief} r={6} fill="var(--vg-flaeche)" />
            <circle cx={xTief} cy={yTief} r={4} fill="var(--vg-negativ)" />
          </g>
        )}
      </g>
    )
  }

  const verschmolzen = zeigtUebergang && Math.abs(yZiel - yUeb) < 14
  const labels = [
    { key: 'ist', y: yIst, text: referenzLabel, farbe: 'var(--vg-text-3)', schwach: true },
    verschmolzen
      ? { key: 'ziel', y: (yZiel + yUeb) / 2, text: 'Zielmodell', farbe: FARBE_ZIELREIHE }
      : { key: 'ziel', y: yZiel, text: 'Zielmodell', farbe: FARBE_ZIELREIHE, schwach: zeigtUebergang },
    ...(zeigtUebergang && !verschmolzen
      ? [{ key: 'ueb', y: yUeb, text: 'mit Übergangsregel', farbe: FARBE_ZIELREIHE }]
      : []),
  ].sort((a, b) => a.y - b.y)

  // Mindestabstand 13 px: erst nach unten schieben, dann die Gruppe als
  // Ganzes zurück über die Unterkante der Zeichenfläche heben.
  for (let i = 1; i < labels.length; i++) {
    if (labels[i].y - labels[i - 1].y < 13) labels[i].y = labels[i - 1].y + 13
  }
  if (flaeche) {
    const unterkante = flaeche.y + flaeche.height
    const ueberhang = labels[labels.length - 1].y - unterkante
    if (ueberhang > 0) for (const l of labels) l.y -= ueberhang
  }

  // Break-even: die Fahne nach oben braucht 49 px bis zur SVG-Oberkante
  // (Zeichenfläche minus Kopfraum); fehlt der Platz, hängt sie unter dem Punkt.
  const yBe = marken.be ? ys(marken.wert(marken.be)) : null
  const svgOben = flaeche ? flaeche.y - VERLAUF_RAND_OBEN : 0
  const beRichtung = yBe != null && yBe - 49 < svgOben + 2 ? 'unten' : 'oben'

  // Tiefpunkt: zweizeilig unter dem Punkt, solange die Zeichenfläche reicht
  // (der Achsenausschnitt hält diesen Platz frei); sonst nach oben. Auf
  // enger Fläche — Handout, kleine Karten — die Unterzeile ohne „EUR“.
  const unterkante = flaeche ? flaeche.y + flaeche.height : Infinity
  const tiefRichtung = yTief != null && yTief + ANMERKUNG_HOEHE > unterkante ? 'oben' : 'unten'
  const eng = flaeche && (flaeche.width < 520 || flaeche.height < 180)
  const tiefDelta = marken.tief ? euroKompaktDelta(wertTief - marken.tief.ist) : ''

  return (
    <g style={{ pointerEvents: 'none' }}>
      {labels.map(l => (
        <EndLabel key={l.key} x={xEnde} y={l.y} text={l.text} farbe={l.farbe} schwach={l.schwach} />
      ))}
      {marken.be && (
        <Anmerkung
          cx={xs(marken.be.jahr, { position: 'middle' })} cy={yBe}
          text="Break-even"
          unter={`${marken.be.jahr}`}
          richtung={beRichtung}
          farbe="var(--vg-positiv)"
          flaeche={flaeche}
        />
      )}
      {marken.tief && (
        verschmolzen ? (
          <Anmerkung
            cx={xTief} cy={yTief}
            text="mit Übergangsregel"
            unter={`Tiefpunkt ${marken.tief.jahr} · ${eng ? tiefDelta.replace(' EUR', '') : tiefDelta}`}
            unterFarbe="var(--vg-negativ)"
            richtung={tiefRichtung}
            farbe={FARBE_ZIELREIHE}
            flaeche={flaeche}
          />
        ) : (
          <Anmerkung
            cx={xTief} cy={yTief}
            text="Tiefpunkt"
            unter={tiefDelta}
            richtung={tiefRichtung}
            farbe="var(--vg-negativ)"
            flaeche={flaeche}
          />
        )
      )}
    </g>
  )
}

/** Direktbeschriftung am rechten Reihenende — ersetzt die Legende. */
function EndLabel({ x, y, text, farbe, schwach }) {
  return (
    <g transform={`translate(${x + 10},${y})`} style={{ pointerEvents: 'none' }}>
      <line x1={-6} x2={-1} y1={0} y2={0} stroke={farbe} strokeWidth={1.5} strokeOpacity={0.6} />
      <text
        x={2} y={0} dy="0.34em"
        fontSize={MASS.wertSchrift} fontWeight={schwach ? 400 : 500} fill={farbe}
      >
        {text}
      </text>
    </g>
  )
}

/**
 * Anmerkung mit Fahne und Punkt — Break-even, Tiefpunkt, Sondereffekt.
 * Der Text bleibt waagerecht in der Zeichenfläche: liefe er über den Rand
 * (Tiefpunkt im zweiten Jahr, links neben den Achsenwerten), rückt er ein
 * und die Fahne läuft schräg vom Punkt zum Text.
 */
function Anmerkung({ cx, cy, text, unter, unterFarbe, richtung = 'oben', farbe, flaeche }) {
  if (!Number.isFinite(cx) || !Number.isFinite(cy)) return null
  const dir = richtung === 'oben' ? -1 : 1
  const breite = Math.max(text.length, (unter ?? '').length) * 6.4
  let tx = cx
  if (flaeche) {
    const min = flaeche.x + breite / 2 + 4
    const max = flaeche.x + flaeche.width - breite / 2 - 4
    tx = min <= max ? Math.min(max, Math.max(min, cx)) : flaeche.x + flaeche.width / 2
  }
  const yFahne = cy + dir * FAHNE
  const yText = yFahne + dir * (dir < 0 ? 4 : 12)
  return (
    <g style={{ pointerEvents: 'none' }}>
      <circle cx={cx} cy={cy} r={5.5} fill="var(--vg-flaeche)" />
      <circle cx={cx} cy={cy} r={3.5} fill={farbe} />
      <line
        x1={cx} x2={tx} y1={cy + dir * 7} y2={yFahne}
        stroke={farbe} strokeWidth={1} strokeOpacity={0.55}
      />
      <text
        x={tx} y={yText} textAnchor="middle"
        fontSize={MASS.anmerkungSchrift} fontWeight={500} fill={farbe}
      >
        {text}
      </text>
      {unter && (
        <text
          x={tx} y={yText + dir * 13}
          textAnchor="middle" fontSize={MASS.anmerkungSchrift} fill={unterFarbe || 'var(--vg-text-4)'}
          style={{ fontVariantNumeric: 'tabular-nums' }}
        >
          {unter}
        </text>
      )}
    </g>
  )
}

// ===========================================================================
// 3 — VERTEILUNG / STREUDIAGRAMM (recharts)
// ===========================================================================
//
// 22 Punkte, drei Zustände, eine Größencodierung. Regeln:
//  - Die Nulllinie ist die Wirbelsäule, nicht eine Gitterlinie unter vielen.
//  - Der neutrale Korridor ist eine Fläche, keine zwei gestrichelten Linien.
//  - Punkte sind Ringe (Fläche 55 %, Kontur 100 %), damit Überlappungen
//    lesbar bleiben.
//  - Beschriftet wird nur, wer die Aussage trägt; Kollisionen werden gelöst.
//  - Beim ersten Erscheinen ziehen die Punkte aus der Nulllinie ein: sie
//    erzählen, dass sie sich von heute wegbewegt haben.

// Deckungsgleich mit ampelFuer() in lib/modell.js: >= +2 Gewinner,
// > -2 neutral, > -8 beobachten, sonst kritisch. Im Diagramm dürfen nur
// Schwellen stehen, die die Farbcodierung auch wirklich verwendet.
const NEUTRAL_KORRIDOR = 2
const KRITISCH_SCHWELLE = AMPEL_SCHWELLEN.kritisch

/** Fläche codiert das Volumen: größter Ring r ≈ 23 px, Dresden r ≈ 16 px. */
const GROESSE_BEREICH = [70, 1600]

/** Kopfraum über der Zeichenfläche: der größte Ring liegt mit dem Mittelpunkt
    auf der Oberkante und braucht seinen Radius plus einen Namen daneben. */
const VERTEILUNG_RAND_OBEN = 40

/** Breite des innen gesetzten Y-Achsenwerts („30,0 Mio.“ samt Hof). */
const Y_TICK_BREITE = 64

const KRITISCH_TEXT = `kritisch ab ${prozentDelta(KRITISCH_SCHWELLE, 0)}`
const ANMERKUNG_TITEL = 'Größter betroffener Partner'

/**
 * @param legende  ReactNode oberhalb rechts im Diagramm (z. B. Ampel-Chips)
 * @param einzug   Punkte ziehen beim Mount aus der Nulllinie ein (700 ms)
 */
export function Verteilung({
  punkte,
  hoehe = 340,
  aufPunkt,
  hervorgehoben,
  mitNamen = true,
  maxNamen = 6,
  ampelFarbe,                 // { gewinner, neutral, beobachten, kritisch }
  legende,
  einzug = true,
}) {
  const FARBE = ampelFarbe || {
    gewinner: 'var(--vg-positiv-flaeche)',
    neutral: 'var(--vg-neutral-flaeche)',
    beobachten: 'var(--vg-warnung-flaeche)',
    kritisch: 'var(--vg-negativ-flaeche)',
  }
  const reduziert = reduzierteBewegung()

  // Symmetrische Achse in Fünferschritten, mindestens ±10 %: so bleibt die
  // Kritisch-Linie bei −8 % sichtbar, und bei ±0 (Fassung = heute) entsteht
  // keine krumme Skala wie „−3 · +1 · +5 · +7“.
  const maxDelta = Math.max(0, ...punkte.map(p => Math.abs(p.delta)))
  const maxAbs = Math.max(10, Math.ceil((maxDelta * 1.1) / 5) * 5)
  const xTicks = useMemo(() => {
    const schritt = maxAbs > 30 ? 10 : 5
    const t = []
    for (let v = -maxAbs; v <= maxAbs + 1e-9; v += schritt) t.push(v)
    return t
  }, [maxAbs])
  const yTicks = useMemo(() => {
    const werte = punkte.map(p => p.basis).filter(v => v > 0)
    if (!werte.length) return undefined
    const lo = Math.min(...werte), hi = Math.max(...werte)
    return [1e4, 3e4, 1e5, 3e5, 1e6, 3e6, 1e7, 3e7, 1e8]
      .filter(v => v >= lo * 0.7 && v <= hi * 1.4)
  }, [punkte])

  // Was beschriftet wird: die größten Einheiten und die stärksten Ausschläge.
  // Die Hervorhebung (Hand über einer Zeile) gehört NICHT in diese Auswahl:
  // sie änderte die Datenreihenfolge, recharts hielt das für neue Daten und
  // ließ alle Punkte neu einschwingen, bevor der Ring erschien. Der
  // hervorgehobene Name kommt unten getrennt dazu — ohne die Daten anzufassen.
  const { sortiert, beschriftet: beschriftetBasis, ausreisser } = useMemo(() => {
    const nachVolumen = [...punkte].sort((a, b) => b.basis - a.basis)
    const nachAusschlag = [...punkte].sort((a, b) => Math.abs(b.delta) - Math.abs(a.delta))
    const wahl = new Set([
      ...nachVolumen.slice(0, Math.ceil(maxNamen / 2)).map(p => p.id),
      ...nachAusschlag.slice(0, Math.floor(maxNamen / 2)).map(p => p.id),
    ])
    // Beschriftete Punkte zuerst rendern → stabile Reihenfolge für die
    // Kollisionslösung, und sie liegen unter den unbeschrifteten nicht begraben.
    const s = [...punkte].sort((a, b) => (wahl.has(b.id) ? 1 : 0) - (wahl.has(a.id) ? 1 : 0))
    // schlimmster großer Verlierer für die Anmerkung
    const gross = nachVolumen.slice(0, Math.max(3, Math.round(punkte.length / 3)))
    const schlimmster = [...gross].sort((a, b) => a.delta - b.delta)[0]
    return {
      sortiert: s,
      beschriftet: wahl,
      ausreisser: schlimmster && schlimmster.delta < -NEUTRAL_KORRIDOR ? schlimmster : null,
    }
  }, [punkte, maxNamen])
  const beschriftet = useMemo(() => {
    if (!hervorgehoben || beschriftetBasis.has(hervorgehoben)) return beschriftetBasis
    return new Set([...beschriftetBasis, hervorgehoben])
  }, [beschriftetBasis, hervorgehoben])

  // Einzug: der erste Render setzt alle Punkte auf die Nulllinie, der nächste
  // Frame die echten Werte — recharts interpoliert die Lage über 700 ms.
  // Danach gilt für Filterwechsel wieder das Datentempo (420 ms).
  const [eingezogen, setEingezogen] = useState(() => !einzug || reduziert)
  const [dauer, setDauer] = useState(() => (einzug && !reduziert ? DAUER.einzug : DAUER.daten))
  useEffect(() => {
    if (eingezogen) return
    const raf = requestAnimationFrame(() => setEingezogen(true))
    return () => cancelAnimationFrame(raf)
  }, [eingezogen])
  // recharts 3 reicht onAnimationEnd am Scatter nicht durch; das Tempo
  // wechselt deshalb per Uhr, sobald der Einzug durch ist.
  useEffect(() => {
    if (!eingezogen || dauer === DAUER.daten) return
    const t = setTimeout(() => setDauer(DAUER.daten), DAUER.einzug + 60)
    return () => clearTimeout(t)
  }, [eingezogen, dauer])
  const daten = useMemo(
    () => (eingezogen ? sortiert : sortiert.map(p => ({ ...p, delta: 0 }))),
    [sortiert, eingezogen])

  // Kollisionslösung: greedy über die bereits gesetzten Kästchen. Die
  // Anmerkung meldet ihr Kästchen vorab an (vorbelegt), damit kein Name sie
  // überdruckt.
  const belegt = useRef([])
  const vorbelegt = useRef([])

  return (
    <div className="vg-diagramm">
      <ResponsiveContainer width="100%" height={hoehe}>
        <ScatterChart margin={{ top: VERTEILUNG_RAND_OBEN, right: 22, left: 2, bottom: 26 }}>
          <CartesianGrid vertical={false} stroke="var(--vg-viz-gitter)" />

          {/* Neutraler Korridor als Fläche — Zustand, nicht Linie */}
          <ReferenceArea
            x1={-NEUTRAL_KORRIDOR} x2={NEUTRAL_KORRIDOR}
            fill="var(--vg-viz-band)" fillOpacity={1} stroke="none"
            ifOverflow="extendDomain"
          />
          {/* Wirbelsäule */}
          <ReferenceLine x={0} stroke="var(--vg-viz-achse)" strokeWidth={1.5} />
          {/* Einzige weitere Klassengrenze, die die Farbe wirklich kennt */}
          <ReferenceLine
            x={KRITISCH_SCHWELLE}
            stroke="var(--vg-negativ)" strokeWidth={1} strokeDasharray="4 4" strokeOpacity={0.5}
            label={{
              value: KRITISCH_TEXT, position: 'insideBottomLeft',
              fill: 'var(--vg-negativ)', fontSize: MASS.anmerkungSchrift, offset: 8,
            }}
          />

          <XAxis
            type="number" dataKey="delta" name="Veränderung"
            domain={[-maxAbs, maxAbs]} ticks={xTicks}
            axisLine={false} tickLine={false} tickMargin={8}
            tick={ACHSENTEXT}
            tickFormatter={(v) => `${v > 0 ? '+' : v < 0 ? '−' : ''}${Math.abs(Math.round(v))} %`}
            label={{
              value: 'Veränderung der Vergütung gegenüber heute',
              position: 'insideBottom', offset: -18,
              fill: 'var(--vg-text-3)', fontSize: MASS.anmerkungSchrift,
            }}
          />
          {/* Logarithmisch: die Einheiten reichen von 80 Tsd. bis 28 Mio. EUR.
              Linear klebt alles außer den drei größten Häusern auf der
              Grundlinie, und genau die kleinen Einheiten sind die, bei denen
              die Umstellung prozentual am härtesten zuschlägt. */}
          <YAxis
            type="number" dataKey="basis" name="Vergütung heute"
            scale="log" domain={['auto', 'auto']} ticks={yTicks}
            mirror width={2} axisLine={false} tickLine={false}
            tick={{ ...ACHSENTEXT_HOF, dy: -7, dx: 2 }}
            tickFormatter={achseEuroFest}
          />
          {/* Die FLÄCHE codiert das Volumen, nicht der Radius. */}
          <ZAxis type="number" dataKey="groesse" range={GROESSE_BEREICH} />

          <Tooltip
            cursor={{ stroke: 'var(--vg-viz-achse)', strokeWidth: 1 }}
            content={({ active, payload }) => {
              if (!active || !payload?.length) return null
              const d = payload[0].payload
              return (
                <Kasten
                  titel={d.name}
                  zeilen={[
                    { label: 'Vergütung heute', wert: euro(d.basis) },
                    { label: 'Zielmodell', wert: euro(d.ziel) },
                    { label: 'Veränderung', wert: prozentDelta(d.delta), ton: d.delta >= 0 ? 'positiv' : 'negativ' },
                    { label: 'Neugeschäft Leben', wert: euroKompakt(d.groesse) },
                  ]}
                  fuss={Math.abs(d.delta) <= NEUTRAL_KORRIDOR
                    ? 'Liegt im neutralen Korridor von ±2 %.' : undefined}
                />
              )
            }}
          />

          {/* Anmeldung aller Kästchen, denen die Namen ausweichen — vor den
              Namen, unsichtbar */}
          <Vorbelegung ausreisser={ausreisser} yTicks={yTicks} vorbelegt={vorbelegt} />

          <Scatter
            data={daten}
            shape={(p) => <Blase {...p} hervorgehoben={hervorgehoben} />}
            onClick={aufPunkt ? (d) => aufPunkt(d.payload ?? d) : undefined}
            cursor={aufPunkt ? 'pointer' : undefined}
            isAnimationActive={!reduziert}
            animationDuration={dauer}
            animationEasing="ease-out"
          >
            {daten.map(p => (
              <Cell key={p.id} fill={FARBE[p.ampel]} stroke={FARBE[p.ampel]} />
            ))}
            {mitNamen && (
              <LabelList
                dataKey="kurz"
                content={(props) => (
                  <PunktName
                    {...props}
                    daten={daten}
                    beschriftet={beschriftet}
                    belegt={belegt}
                    vorbelegt={vorbelegt}
                    hervorgehoben={hervorgehoben}
                  />
                )}
              />
            )}
          </Scatter>

          {/* Anmerkungsebene: der größte betroffene Partner bekommt Text */}
          {ausreisser && (
            <AnmerkungPartner ausreisser={ausreisser} verzoegert={einzug && !reduziert} />
          )}
        </ScatterChart>
      </ResponsiveContainer>

      {legende && (
        <div style={{ position: 'absolute', top: 0, right: 8, zIndex: 2 }}>
          {legende}
        </div>
      )}

      <GroessenLegende
        werte={[
          Math.min(...punkte.map(p => p.groesse)),
          Math.max(...punkte.map(p => p.groesse)),
        ]}
      />
    </div>
  )
}

/** Ring statt Scheibe: Überlappungen bleiben zählbar. */
function Blase({ cx, cy, fill, stroke, payload, hervorgehoben, size }) {
  const r = Math.sqrt((size ?? 120) / Math.PI)
  const aus = hervorgehoben && hervorgehoben !== payload.id
  return (
    <g>
      {hervorgehoben === payload.id && (
        <circle cx={cx} cy={cy} r={r + 4} fill="none" stroke="var(--vg-flaeche)" strokeWidth={3} />
      )}
      <circle
        cx={cx} cy={cy} r={r}
        fill={fill} fillOpacity={aus ? 0.14 : 0.5}
        stroke={hervorgehoben === payload.id ? 'var(--vg-text)' : stroke}
        strokeOpacity={aus ? 0.3 : 1}
        strokeWidth={hervorgehoben === payload.id ? 2 : 1.25}
      />
    </g>
  )
}

/**
 * Lage der Partner-Anmerkung: links vom Punkt, wenn er links der Null
 * liegt (dort ist bei einem Verlierer der Platz), sonst rechts. Läuft der
 * Text aus der Zeichenfläche, wird die Seite gewechselt.
 */
function anmerkungLage(cx, cy, titel, unter, flaeche) {
  // 6,8 px je Zeichen: der 500er Schnitt des Titels läuft breiter als die Namen.
  const breite = Math.max(titel.length, unter.length) * 6.8
  const abstand = 46
  let links = true
  if (flaeche && cx - abstand - breite < flaeche.x) links = false
  const dx = links ? -1 : 1
  const x = cx + dx * abstand
  return {
    links, x,
    linie: { x1: cx + dx * 12, y1: cy - 12, x2: cx + dx * (abstand - 4), y2: cy - 30 },
    // 20 px Puffer seitlich: ein Name in gleicher Schrift darf der Anmerkung
    // nicht so nahe rücken, dass beide als ein Satz gelesen werden.
    kasten: {
      x1: (links ? x - breite : x) - 20, x2: (links ? x : x + breite) + 20,
      y1: cy - 44, y2: cy - 9,
    },
  }
}

function anmerkungUnter(ausreisser) {
  return `${ausreisser.name} · ${prozentDelta(ausreisser.delta)}`
}

/**
 * Meldet vor dem Scatter alle Kästchen an, denen die Namen ausweichen
 * müssen: die innen gesetzten Y-Achsenwerte, das Label der Kritisch-Grenze
 * und die Partner-Anmerkung. Zeichnet nichts; PunktName liest die Liste bei
 * index 0 ein.
 */
function Vorbelegung({ ausreisser, yTicks, vorbelegt }) {
  const xs = useXAxisScale()
  const ys = useYAxisScale()
  const flaeche = usePlotArea()
  if (!xs || !ys || !flaeche) return null
  const unten = flaeche.y + flaeche.height
  const kaesten = []
  for (const t of yTicks ?? []) {
    const y = ys(t)
    if (!Number.isFinite(y) || y < flaeche.y - 1 || y > unten + 1) continue
    // Tick mit dy −7: Grundlinie 7 px über der Gitterlinie, Hof 3 px
    kaesten.push({ x1: flaeche.x, x2: flaeche.x + Y_TICK_BREITE, y1: y - 18, y2: y - 4 })
  }
  const xk = xs(KRITISCH_SCHWELLE)
  if (Number.isFinite(xk)) {
    kaesten.push({ x1: xk + 8, x2: xk + 8 + KRITISCH_TEXT.length * 6.4, y1: unten - 20, y2: unten - 5 })
  }
  if (ausreisser) {
    const cx = xs(ausreisser.delta)
    const cy = ys(ausreisser.basis)
    if (Number.isFinite(cx) && Number.isFinite(cy)) {
      kaesten.push(anmerkungLage(cx, cy, ANMERKUNG_TITEL, anmerkungUnter(ausreisser), flaeche).kasten)
    }
  }
  vorbelegt.current = kaesten
  return null
}

/**
 * Sichtbare Partner-Anmerkung über den Ringen; ihr Kästchen hat Vorbelegung
 * bereits angemeldet. Beim Einzug erscheint der Text erst, wenn die Punkte
 * angekommen sind.
 */
function AnmerkungPartner({ ausreisser, verzoegert = false }) {
  const xs = useXAxisScale()
  const ys = useYAxisScale()
  const flaeche = usePlotArea()
  if (!xs || !ys) return null
  const cx = xs(ausreisser.delta)
  const cy = ys(ausreisser.basis)
  if (!Number.isFinite(cx) || !Number.isFinite(cy)) return null

  const titel = ANMERKUNG_TITEL
  const unter = anmerkungUnter(ausreisser)
  const lage = anmerkungLage(cx, cy, titel, unter, flaeche)
  return (
    <g
      className="vg-anim-ein"
      style={{ pointerEvents: 'none', animationDelay: verzoegert ? 'var(--vg-einzug)' : '0ms' }}
    >
      <line {...lage.linie} stroke="var(--vg-text-3)" strokeWidth={1} />
      <text
        x={lage.x} y={cy - 30} textAnchor={lage.links ? 'end' : 'start'}
        fontSize={MASS.anmerkungSchrift} fontWeight={500} fill="var(--vg-text-2)"
      >
        {titel}
      </text>
      <text
        x={lage.x} y={cy - 17} textAnchor={lage.links ? 'end' : 'start'}
        fontSize={MASS.anmerkungSchrift} fill="var(--vg-text-4)"
      >
        {unter}
      </text>
    </g>
  )
}

/**
 * Lage eines Namens am Ring: über dem Ring, sonst rechts oder links daneben,
 * sonst darunter, dann versetzt. Ein Kasten gilt nur, wenn er in der
 * Zeichenfläche liegt (nach oben bis in den Kopfraum) und keinen belegten
 * Kasten trifft — mit 6 px Luft seitlich, damit zwei Namen nicht aneinander
 * kleben. Bei Stoß mit einem belegten Kasten (Anmerkung, Achsenwert) weicht
 * der Name zuerst auf die dem Kasten abgewandte Seite aus. Liefert null,
 * wenn keine freie Lage bleibt: kein Name statt ein überdruckter.
 */
function namenLage({ cx, cy, r, breite, flaeche, belegt }) {
  const links = flaeche ? flaeche.x : -Infinity
  const rechts = flaeche ? flaeche.x + flaeche.width : Infinity
  // Nach oben darf ein Name in den Kopfraum, aber nicht an die SVG-Kante.
  const oben = flaeche ? flaeche.y - VERTEILUNG_RAND_OBEN + 10 : -Infinity
  const unten = flaeche ? flaeche.y + flaeche.height + 2 : Infinity
  const kasten = (l) => {
    const x1 = l.anker === 'middle' ? l.x - breite / 2 : l.anker === 'start' ? l.x : l.x - breite
    return { x1, x2: x1 + breite, y1: l.y - 10, y2: l.y + 3 }
  }
  const trifft = (k, b) => k.x1 - 6 < b.x2 && k.x2 + 6 > b.x1 && k.y1 - 2 < b.y2 && k.y2 + 2 > b.y1
  const drinnen = (k) => k.x1 >= links && k.x2 <= rechts && k.y1 >= oben && k.y2 <= unten

  const ueber = { x: cx, y: cy - r - 6, anker: 'middle' }
  const rechtsDaneben = { x: cx + r + 6, y: cy + 4, anker: 'start' }
  const linksDaneben = { x: cx - r - 6, y: cy + 4, anker: 'end' }
  const darunter = { x: cx, y: cy + r + 14, anker: 'middle' }

  const k0 = kasten(ueber)
  const stoesser = belegt.find(b => trifft(k0, b))
  let rechtsZuerst = true
  if (stoesser) rechtsZuerst = (stoesser.x1 + stoesser.x2) / 2 <= cx
  else if (k0.x2 > rechts) rechtsZuerst = false
  const seiten = rechtsZuerst ? [rechtsDaneben, linksDaneben] : [linksDaneben, rechtsDaneben]
  // Am linken Rand liegen die Achsenwerte: dort steht der Name rechts vom Ring.
  const amRand = k0.x1 < links + Y_TICK_BREITE
  const kandidaten = [
    ...(amRand ? [rechtsDaneben, ueber, linksDaneben] : [ueber, ...seiten]),
    darunter,
    { ...ueber, y: ueber.y - 14 },
    { ...darunter, y: darunter.y + 14 },
    { ...seiten[0], y: seiten[0].y - 14 },
    { ...seiten[0], y: seiten[0].y + 14 },
    { ...ueber, y: ueber.y - 28 },
    { ...darunter, y: darunter.y + 28 },
  ]
  for (const l of kandidaten) {
    const k = kasten(l)
    if (drinnen(k) && !belegt.some(b => trifft(k, b))) return { ...l, kasten: k }
  }
  return null
}

/**
 * Namen am Punkt mit Kollisionslösung.
 * recharts löst Kollisionen nicht auf; die Kästchen werden hier greedy
 * gesetzt. Die Reihenfolge ist stabil, weil `daten` die beschrifteten
 * Punkte nach vorn zieht und index 0 den Speicher auf die vorbelegten
 * Kästchen (Achsenwerte, Anmerkung) zurücksetzt. Mittelpunkt und Radius
 * kommen aus den Skalen und dem Ringkasten (viewBox), nicht aus den
 * Label-Koordinaten von recharts, die nur die Kastenecke liefern.
 */
function PunktName({ index, value, viewBox, daten, beschriftet, belegt, vorbelegt, hervorgehoben }) {
  const xs = useXAxisScale()
  const ys = useYAxisScale()
  const flaeche = usePlotArea()
  if (index === 0) belegt.current = [...(vorbelegt?.current ?? [])]
  const p = daten[index]
  if (!p || !beschriftet.has(p.id) || !xs || !ys) return null

  const cx = xs(p.delta)
  const cy = ys(p.basis)
  if (!Number.isFinite(cx) || !Number.isFinite(cy)) return null
  const r = viewBox?.width > 0 ? viewBox.width / 2 : Math.sqrt(GROESSE_BEREICH[0] / Math.PI)

  const text = String(value ?? p.kurz ?? p.name)
  const breite = text.length * 6.4
  const lage = namenLage({ cx, cy, r, breite, flaeche, belegt: belegt.current })
  if (!lage) return null
  belegt.current.push(lage.kasten)

  return (
    <text
      x={lage.x} y={lage.y} textAnchor={lage.anker}
      fontSize={MASS.anmerkungSchrift}
      fontWeight={500}
      fill={hervorgehoben === p.id ? 'var(--vg-text)' : 'var(--vg-text-2)'}
      style={{ pointerEvents: 'none', paintOrder: 'stroke' }}
      stroke="var(--vg-flaeche)" strokeWidth={3} strokeLinejoin="round"
    >
      {text}
    </text>
  )
}

/** Größenschlüssel als kleines SVG in der rechten unteren Diagrammecke. */
function GroessenLegende({ werte }) {
  const [klein, gross] = werte
  const r = (s) => Math.sqrt(s / Math.PI)
  const rk = r(GROESSE_BEREICH[0]), rg = r(GROESSE_BEREICH[1])
  const d = Math.ceil(rg * 2) + 2
  const breiteText = 190
  return (
    <svg
      width={d + 8 + breiteText} height={d}
      aria-hidden="true"
      style={{ position: 'absolute', right: 26, bottom: 62, overflow: 'visible', pointerEvents: 'none' }}
    >
      <circle cx={rg + 1} cy={rg + 1} r={rg} fill="none" stroke="var(--vg-viz-achse)" strokeWidth={1} />
      <circle cx={rg + 1} cy={rg + 1 + (rg - rk)} r={rk} fill="none" stroke="var(--vg-viz-achse)" strokeWidth={1} />
      <text x={d + 8} y={rg - 2} fontSize={MASS.anmerkungSchrift} fill="var(--vg-text-4)">
        Kreisfläche: Neugeschäft Leben
      </text>
      <text x={d + 8} y={rg + 12} fontSize={MASS.anmerkungSchrift} fill="var(--vg-text-4)"
        style={{ fontVariantNumeric: 'tabular-nums' }}>
        {euroKompakt(klein)} bis {euroKompakt(gross)}
      </text>
    </svg>
  )
}
