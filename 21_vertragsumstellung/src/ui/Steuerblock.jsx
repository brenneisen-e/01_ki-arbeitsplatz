import { useEffect, useRef, useState } from 'react'
import { ArrowLeft } from 'lucide-react'
import { PaarVergleich, paarEinheit } from '../charts/paar'
import { useBreite } from '../charts/gehoben'
import { euro, euroKompakt, euroKompaktDelta, achseEuro, prozentDelta, deltaTon } from '../lib/format'
import { Btn, useAnimierteZahl, Tip } from './basis'
import './steuerblock.css'

/**
 * STEUERBLOCK
 *
 * Der dunkle Steuer- und Summenblock links — die Signatur der Anwendung.
 * Oben, was man einstellt (Fassung, Haus, Status), darunter die Summe
 * heute / Zielmodell, zwei Plaketten gleicher Bauart (dauerhaft und
 * Startjahr), ein Mini-Säulenpaar und die Signale. Genau eine dunkle
 * Fläche je Ansicht; rechts bleibt alles hell.
 *
 * Alle Zahlen laufen animiert nach, damit beim Reglerziehen sichtbar ist,
 * dass hier gerechnet wird. Wechselt eine Plakette den Ton, pulst sie
 * einmal — der Moment, in dem sich etwas entschieden hat.
 */
export default function Steuerblock({
  oben,             // Zeile über dem Titel, z. B. „Modell-Simulation“
  titel,
  unter,
  marken,           // Abzeichen, Ampel — was den Zustand benennt
  zurueck,          // Handler: zeigt einen Zurück-Knopf im Kopf
  heute,            // Vergütung heute (absolut)
  ziel,             // Vergütung im Zielmodell (absolut)
  deltaLabel = 'Veränderung',
  deltaTonWert,     // optionaler Ton der ersten Plakette, sonst aus dem Vorzeichen
  deltaTip,         // Tooltip der ersten Plakette: wie der Wert zustande kommt
  zweiteSumme,      // zweite Plakette: { label, heute, ziel, ton?, tip? }
  kompakt = false,  // kompakte Beträge (65,7 Mio. EUR) statt voller Euro
  paare,            // Mini-Säulenpaar: [{ id, label, alt, neu }]
  zahlersicht = false, // Tinte der Paar-Deltas aus Sicht des Zahlenden (mehr = Warnung)
  aufPaar,          // Klick auf ein Säulenpaar: (paar) => void — öffnet im Kasten die Erklärung
  paareHinweis,     // kleine Zeile unter dem Säulenpaar, z. B. „Baustein anklicken“
  stapel,           // gestapelter Alt/Neu-Balken statt des Mini-Paars:
                    // { alt: { abschluss, folge, bonus, zuschuesse }, neu: { … } }
  stammdaten,       // Label/Wert-Liste zwischen Marken und Summe:
                    // [{ label, wert, ton?, unter? }] — `unter` steht als
                    // zweite, gedämpfte Zeile unter dem Wert (Funktion des
                    // Ansprechpartners); ohne `unter` bricht ein langer Wert
                    // selbst auf zwei Zeilen um
  altLabel = 'Heute',
  neuLabel = 'Zielmodell',
  zielMarke,        // Slot neben dem Zielmodell-Label, z. B. Marke „mit Zugeständnissen“
  zeitraum,         // Referenzzeitraum der Summenzeilen, z. B. „01.09.2025 – 31.08.2026“:
                    // beide Zeilen bekommen den Zusatz „(Referenzzeitraum)“, der
                    // Zeitraum steht ausgeschrieben darunter
  signale,          // [{ label, prozent, ton? }] — ein etwaiges `hinweis` wird nicht gezeigt
  einstellungen,    // Slot: Schalter, Auswahl, Knöpfe
  fuss,             // Slot: Aktionen ganz unten
  children,
}) {
  const h = useAnimierteZahl(heute ?? 0, 420)
  const z = useAnimierteZahl(ziel ?? 0, 420)
  const d = z - h
  const p = h > 0 ? (d / h) * 100 : 0
  const ton = deltaTonWert || deltaTon(ziel - heute)
  const betrag = kompakt ? euroKompakt : euro

  return (
    <aside className="vg-steuerblock" aria-label={titel}>
      <div className="vg-sb-kopf">
        {(oben || zurueck) && (
          <div className="vg-reihe-weit vg-sb-kopfzeile" style={{ gap: 8 }}>
            {oben && <span className="vg-sb-oben">{oben}</span>}
            {zurueck && (
              <Btn variante="still" groesse="sm" ikone={ArrowLeft} onClick={zurueck} aria-label="Zurück">
                Zurück
              </Btn>
            )}
          </div>
        )}
        {titel && <h2 className="vg-sb-titel">{titel}</h2>}
        {unter && <div className="vg-sb-unter">{unter}</div>}
        {marken && <div className="vg-sb-marken">{marken}</div>}
      </div>

      <div className="vg-sb-mitte">
        {stammdaten && stammdaten.length > 0 && (
          <dl className="vg-sb-stammdaten">
            {stammdaten.map((z, i) => (
              <div className="vg-sb-stammdatum" key={z.id ?? z.label ?? i}>
                <dt className="vg-sb-stammdatum-label">{z.label}</dt>
                <dd
                  className="vg-sb-stammdatum-wert"
                  data-ton={z.ton}
                  title={typeof z.wert === 'string' ? (z.unter ? `${z.wert}, ${z.unter}` : z.wert) : undefined}
                >
                  {z.wert ?? '–'}
                  {z.unter && <span className="vg-sb-stammdatum-unter">{z.unter}</span>}
                </dd>
              </div>
            ))}
          </dl>
        )}

        {heute != null && ziel != null && (
          <div className="vg-sb-summe">
            <div className="vg-sb-betraege">
              <div className="vg-sb-zeile">
                <span className="vg-sb-zeile-label">
                  <span className="vg-legende-marke" style={{ background: 'var(--vg-viz-heute)' }} />
                  <span className="vg-sb-zeile-text">
                    {altLabel}
                    {zeitraum && <span className="vg-sb-zeile-zusatz">(Referenzzeitraum)</span>}
                  </span>
                </span>
                <span className="vg-sb-zeile-wert">{betrag(h)}</span>
              </div>
              {/* Nur im Band (≤ 1024 px) sichtbar: „heute → Zielmodell“ in einer Zeile */}
              <span className="vg-pfeil vg-sb-pfeil" aria-hidden="true" />
              <div className="vg-sb-zeile">
                <span className="vg-sb-zeile-label">
                  <span className="vg-legende-marke" style={{ background: 'var(--vg-viz-3)' }} />
                  <span className="vg-sb-zeile-text">
                    {neuLabel}
                    {zeitraum && <span className="vg-sb-zeile-zusatz">(Referenzzeitraum)</span>}
                    {zielMarke}
                  </span>
                </span>
                <span className="vg-sb-zeile-wert">{betrag(z)}</span>
              </div>
              {zeitraum && (
                <div className="vg-sb-zeitraum" title="Produktion, Bestand und gemeldete Vergütung dieses Zeitraums liegen beiden Summen zugrunde. Das Zielmodell ist so gerechnet, als gälte es dort bereits vollständig: alle Jahrgänge der laufenden Provision zahlen.">
                  * Referenzzeitraum {zeitraum}; Zielmodell so gerechnet, als gälte es dort bereits vollständig
                </div>
              )}
            </div>
            <Plakette rang={1} label={deltaLabel} delta={d} prozent={p} ton={ton} tip={deltaTip} />
            {zweiteSumme && <ZweitePlakette {...zweiteSumme} />}
          </div>
        )}

        {stapel && (
          <div className="vg-sb-stapel">
            <StapelBalken stapel={stapel} altLabel={altLabel} neuLabel={neuLabel} format={betrag} />
          </div>
        )}

        {!stapel && paare && paare.length > 0 && (
          <div className="vg-sb-paar">
            <PaarVergleich
              paare={paare}
              hoehe={132}
              achse={false}
              mitLegende={false}
              altLabel={altLabel}
              neuLabel={neuLabel}
              format={betrag}
              zahlersicht={zahlersicht}
              aufPaar={aufPaar}
            />
            {/* Ohne Achse nennt der Hinweis die Einheit der Säulenwerte */}
            <div className="vg-sb-zeitraum">
              {[`Säulenwerte in ${paarEinheit(paare).label}`, paareHinweis].filter(Boolean).join(' · ')}
            </div>
          </div>
        )}

        {signale && signale.length > 0 && (
          <div className="vg-sb-signale">
            {signale.map(s => (
              <div className="vg-sb-signal" key={s.label} data-ton={s.ton || deltaTon(s.prozent)}>
                <span className="vg-sb-signal-punkt" />
                <span className="vg-sb-signal-label">{s.label}</span>
                <span className="vg-sb-signal-wert">{prozentDelta(s.prozent)}</span>
              </div>
            ))}
          </div>
        )}

        {(einstellungen || children) && (
          <div className="vg-sb-einstellungen">
            {einstellungen}
            {children}
          </div>
        )}
      </div>

      {fuss && <div className="vg-sb-fuss">{fuss}</div>}
    </aside>
  )
}

/**
 * Die zweite Plakette rechnet ihre Beträge selbst animiert nach, damit die
 * Aufrufstelle nur Rohwerte liefert — gleiche Bauart wie die erste.
 */
function ZweitePlakette({ label, heute, ziel, ton, tip }) {
  const h = useAnimierteZahl(heute ?? 0, 420)
  const z = useAnimierteZahl(ziel ?? 0, 420)
  const d = z - h
  const p = h > 0 ? (d / h) * 100 : 0
  return (
    <Plakette
      rang={2}
      label={label}
      delta={d}
      prozent={p}
      ton={ton || deltaTon((ziel ?? 0) - (heute ?? 0))}
      tip={tip}
    />
  )
}

/**
 * Plakette: Label oben, Betrag und Prozent darunter (im 1024-Band einzeilig,
 * Label links, Wert rechts), Ton über data-ton.
 * Bei Tonwechsel wird data-neu für die Dauer des Pulses (260 ms) gesetzt;
 * der erste Ton beim Einhängen löst keinen Puls aus.
 */
function Plakette({ rang, label, delta, prozent, ton, tip }) {
  const [neu, setNeu] = useState(false)
  const vorherRef = useRef(ton)

  useEffect(() => {
    if (vorherRef.current === ton) return
    vorherRef.current = ton
    setNeu(true)
    const timer = setTimeout(() => setNeu(false), 260)
    return () => clearTimeout(timer)
  }, [ton])

  // Der Tooltip erklärt, wie der Wert zustande kommt; die Hülle hat keine
  // eigene Box (Tip block), damit die Plakette Flex- bzw. Rasterkind bleibt.
  return (
    <Tip text={tip ? <PlaketteTip e={tip} /> : null} block breite={380}>
      <div className="vg-sb-delta" data-ton={ton} data-rang={rang} data-neu={neu || undefined} tabIndex={tip ? 0 : undefined}>
        <span className="vg-sb-delta-label">{label}</span>
        <span className="vg-sb-delta-wert">
          <span className="vg-sb-delta-betrag">{euroKompaktDelta(delta)}</span>
          <span className="vg-sb-delta-prozent">{prozentDelta(prozent)}</span>
        </span>
      </div>
    </Tip>
  )
}

/**
 * Inhalt des Plaketten-Tooltips (Struktur aus `src/lib/erklaerung.js`):
 * Titel und Untertitel, drei Rechenzeilen mit Wert rechts, optional die
 * Frage nach dem Vielfachen, dann kurze Punkte. Nur Spans mit Rollen, weil
 * die Blase selbst ein Span ist.
 */
function PlaketteTip({ e }) {
  return (
    <span className="vg-pl-tip">
      <span className="vg-pl-tip-kopf">
        <span className="vg-pl-tip-titel">{e.titel}</span>
        {e.unter && <span className="vg-pl-tip-unter">{e.unter}</span>}
      </span>
      <span className="vg-pl-tip-zeilen" role="table">
        {e.zeilen.map(z => (
          <span key={z.label} className="vg-pl-tip-zeile" role="row" data-summe={z.summe || undefined}>
            <span role="cell">{z.label}</span>
            <b role="cell">{z.wert}</b>
          </span>
        ))}
      </span>
      {e.frage && <span className="vg-pl-tip-frage">{e.frage}</span>}
      <span className="vg-pl-tip-punkte" role="list">
        {e.punkte.map(t => <span key={t} className="vg-pl-tip-punkt" role="listitem">{t}</span>)}
      </span>
    </span>
  )
}

/**
 * Gestapelter Alt/Neu-Balken (Akte): zwei Säulen mit vier Segmenten —
 * Abschluss, Laufend und Bestand, Bonus, Zuschüsse — Summe über jeder
 * Säule, Segmentwerte in der Säule, sobald sie 28 px hoch ist. Alle acht
 * Werte laufen 420 ms nach; die Summen folgen aus den laufenden Werten.
 * Farben sind blockeigene Töne, die auf Tiefgrün lesbar bleiben.
 */
const STAPEL_TEILE = [
  { id: 'abschluss', label: 'Abschluss', farbe: 'var(--sb-viz-abschluss)' },
  { id: 'folge', label: 'Laufend und Bestand', farbe: 'var(--sb-viz-folge)' },
  { id: 'bonus', label: 'Bonus', farbe: 'var(--sb-viz-bonus)' },
  { id: 'zuschuesse', label: 'Zuschüsse', farbe: 'var(--sb-viz-zuschuesse)' },
]
// Höhe 144 px: mit der zweizeiligen Legende darunter stehen Achsenlabels
// und alle vier Einträge bei 1600 × 1000 im Block (über dem Balken liegen
// Stammdaten, Summe und zwei Plaketten); 190 px schoben die Legende unter
// die Scrollkante.
const STAPEL = { hoehe: 144, oben: 18, unten: 18, saeule: 72, segmentText: 28 }

/** Die vier Segmentwerte einer Säule, jeder 420 ms nachlaufend (feste Hook-Reihenfolge). */
function useVierWerte(o) {
  const abschluss = useAnimierteZahl(o?.abschluss || 0, 420)
  const folge = useAnimierteZahl(o?.folge || 0, 420)
  const bonus = useAnimierteZahl(o?.bonus || 0, 420)
  const zuschuesse = useAnimierteZahl(o?.zuschuesse || 0, 420)
  return [abschluss, folge, bonus, zuschuesse]
}

function StapelBalken({ stapel, altLabel, neuLabel, format }) {
  // `format` (voll oder kompakt) gilt für die Segment-Tips; die Summen über
  // den Säulen sind immer kompakt, damit sie sich über 72 px nicht berühren.
  const [huelle, breite] = useBreite(296)
  const hoehe = STAPEL.hoehe
  const innenH = hoehe - STAPEL.oben - STAPEL.unten

  const alt = useVierWerte(stapel.alt)
  const neu = useVierWerte(stapel.neu)
  const summeAlt = alt.reduce((a, b) => a + b, 0)
  const summeNeu = neu.reduce((a, b) => a + b, 0)
  const zielSumme = Math.max(
    STAPEL_TEILE.reduce((a, t) => a + (stapel.alt?.[t.id] || 0), 0),
    STAPEL_TEILE.reduce((a, t) => a + (stapel.neu?.[t.id] || 0), 0),
    1,
  )
  // Skala nach den Zielwerten, damit die Säulen beim Nachlaufen nicht atmen
  const skala = innenH / (zielSumme * 1.06)

  const saeuleB = Math.min(STAPEL.saeule, breite * 0.3)
  const xAlt = breite / 2 - saeuleB - 20
  const xNeu = breite / 2 + 20

  const saeule = (werte, x, summe, label) => {
    let y = innenH
    const segmente = werte.map((w, i) => {
      const h = w * skala
      y -= h
      return { ...STAPEL_TEILE[i], wert: w, h, y }
    })
    return (
      <g>
        {segmente.map(seg => (
          <g key={seg.id}>
            <rect x={x} y={seg.y} width={saeuleB} height={Math.max(0, seg.h)} fill={seg.farbe}>
              <title>{`${seg.label}: ${format(seg.wert)}`}</title>
            </rect>
            {seg.h >= STAPEL.segmentText && (
              <text
                x={x + saeuleB / 2} y={seg.y + seg.h / 2 + 4}
                textAnchor="middle" fontSize={11} fill="var(--sb-flaeche)"
                style={{ fontVariantNumeric: 'tabular-nums', pointerEvents: 'none' }}
              >
                {achseEuro(seg.wert)}
              </text>
            )}
          </g>
        ))}
        <text
          x={x + saeuleB / 2} y={y - 6} textAnchor="middle"
          fontSize={12.5} fontWeight={500} fill="var(--sb-text)"
          style={{ fontVariantNumeric: 'tabular-nums' }}
        >
          {euroKompakt(summe)}
        </text>
        <text x={x + saeuleB / 2} y={innenH + 14} textAnchor="middle" fontSize={11.5} fill="var(--sb-text-3)">
          {label}
        </text>
      </g>
    )
  }

  return (
    <div ref={huelle} className="vg-diagramm vg-sb-stapel-diagramm">
      <svg width="100%" height={hoehe} role="img" aria-label={`${altLabel} und ${neuLabel} nach Bauteilen`} style={{ display: 'block', overflow: 'visible' }}>
        <g transform={`translate(0,${STAPEL.oben})`}>
          <line x1={0} x2={breite} y1={innenH} y2={innenH} stroke="var(--vg-viz-achse)" strokeWidth={1} />
          {saeule(alt, xAlt, summeAlt, altLabel)}
          {saeule(neu, xNeu, summeNeu, neuLabel)}
        </g>
      </svg>
      <div className="vg-sb-stapel-legende">
        {STAPEL_TEILE.map(t => (
          <span className="vg-sb-stapel-eintrag" key={t.id}>
            <span className="vg-sb-stapel-marke" style={{ background: t.farbe }} />
            {t.label}
          </span>
        ))}
      </div>
    </div>
  )
}
