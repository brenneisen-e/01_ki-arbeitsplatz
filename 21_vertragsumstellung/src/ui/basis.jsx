import { useState, useId, useRef, useEffect, useLayoutEffect } from 'react'
import { createPortal } from 'react-dom'
import { Info, ChevronDown } from 'lucide-react'
import { euroKompakt, euroKompaktDelta, prozentDelta, deltaTon } from '../lib/format'

// --------------------------------------------------- Karte

export function Karte({ children, ton, className = '', ...rest }) {
  const klassen = ['vg-karte']
  if (ton === 'still') klassen.push('vg-karte-still')
  if (ton === 'erhoben') klassen.push('vg-karte-erhoben')
  if (ton === 'akzent') klassen.push('vg-karte-akzent')
  return <section className={`${klassen.join(' ')} ${className}`} {...rest}>{children}</section>
}

export function KarteKopf({ titel, unter, aktionen, ikone: Ikone }) {
  return (
    <header className="vg-karte-kopf">
      <div className="vg-karte-kopf-titel">
        <h3 className="vg-karte-titel">
          {Ikone && <Ikone size={15} strokeWidth={1.9} style={{ marginRight: 7, verticalAlign: '-2px', opacity: .65 }} />}
          {titel}
        </h3>
        {unter && <span className="vg-karte-unter">{unter}</span>}
      </div>
      {aktionen && <div className="vg-reihe">{aktionen}</div>}
    </header>
  )
}

export function KarteKoerper({ children, eng, style }) {
  return <div className={eng ? 'vg-karte-koerper-eng' : 'vg-karte-koerper'} style={style}>{children}</div>
}

export function KarteFuss({ children }) {
  return <footer className="vg-karte-fuss">{children}</footer>
}

// --------------------------------------------------- Kennzahl

export function Kpi({ titel, wert, fuss, ton = 'neutral', gross, hervor, hinweis, kind }) {
  return (
    <div className={`vg-kpi${hervor ? ' vg-kpi-hervor' : ''}`} data-ton={ton}>
      <div className="vg-kpi-titel">
        {titel}
        {hinweis && <Tip text={hinweis}><span className="vg-info-knopf"><Info size={12} strokeWidth={2} /></span></Tip>}
      </div>
      <div className={`vg-kpi-wert${gross ? ' vg-kpi-wert-gross' : ''}`}>{wert}</div>
      {fuss && <div className="vg-kpi-fuss">{fuss}</div>}
      {kind}
    </div>
  )
}

// --------------------------------------------------- Delta-Chip

export function Delta({ absolut, prozent, gross, invertiert, nurProzent, nurAbsolut }) {
  const bezug = absolut ?? prozent ?? 0
  const ton = deltaTon(bezug, { invertiert })
  const teile = []
  if (!nurProzent && absolut != null) teile.push(euroKompaktDelta(absolut))
  if (!nurAbsolut && prozent != null) teile.push(nurProzent ? prozentDelta(prozent) : `(${prozentDelta(prozent)})`)
  return (
    <span className={`vg-delta${gross ? ' vg-delta-gross' : ''}`} data-ton={ton}>
      {teile.join(' ')}
    </span>
  )
}

// --------------------------------------------------- Abzeichen

export function Badge({ children, ton = 'neutral', punkt }) {
  return (
    <span className="vg-badge" data-ton={ton}>
      {punkt && <span className="vg-punkt" style={{ background: 'currentColor' }} />}
      {children}
    </span>
  )
}

const AMPEL_TEXT = {
  gewinner: 'Gewinner',
  neutral: 'Neutral',
  beobachten: 'Beobachten',
  kritisch: 'Kritisch',
}

export function Ampel({ stufe, mitText = true }) {
  return (
    <span className="vg-reihe" style={{ gap: 6 }}>
      <span className={`vg-ampel-punkt vg-ampel-${stufe}`} />
      {mitText && <span className="vg-t-sm">{AMPEL_TEXT[stufe] || stufe}</span>}
    </span>
  )
}

// --------------------------------------------------- Schaltflächen

export function Btn({
  children, variante = 'standard', groesse = 'md', ikone: Ikone,
  ikoneRechts: IkoneRechts, nurIkone, className = '', ...rest
}) {
  const k = ['vg-btn']
  if (variante === 'primaer') k.push('vg-btn-primaer')
  if (variante === 'still') k.push('vg-btn-still')
  if (variante === 'gefahr') k.push('vg-btn-gefahr')
  if (groesse === 'sm') k.push('vg-btn-sm')
  if (groesse === 'lg') k.push('vg-btn-lg')
  if (nurIkone) k.push('vg-btn-symbol')
  const gr = groesse === 'sm' ? 13 : groesse === 'lg' ? 17 : 15
  return (
    <button type="button" className={`${k.join(' ')} ${className}`} {...rest}>
      {Ikone && <Ikone size={gr} strokeWidth={1.9} />}
      {children}
      {IkoneRechts && <IkoneRechts size={gr} strokeWidth={1.9} />}
    </button>
  )
}

export function Segment({ optionen, wert, onWaehle, klein }) {
  return (
    <div className="vg-segment" role="group">
      {optionen.map(o => (
        <button
          key={o.id}
          type="button"
          aria-pressed={o.id === wert}
          onClick={() => onWaehle(o.id)}
          title={o.titel}
        >
          {o.ikone && <o.ikone size={klein ? 12 : 14} strokeWidth={1.9} />}
          {o.label}
        </button>
      ))}
    </div>
  )
}

export function Reiter({ optionen, wert, onWaehle }) {
  return (
    <div className="vg-reiter" role="tablist">
      {optionen.map(o => (
        <button
          key={o.id}
          type="button"
          role="tab"
          aria-selected={o.id === wert}
          onClick={() => onWaehle(o.id)}
        >
          {o.ikone && <o.ikone size={14} strokeWidth={1.9} />}
          {o.label}
          {o.zaehler != null && <span className="vg-badge">{o.zaehler}</span>}
        </button>
      ))}
    </div>
  )
}

export function Schalter({ an, onAendern, label, beschriftung }) {
  return (
    <label className="vg-reihe" style={{ gap: 9, cursor: 'pointer' }}>
      <button
        type="button"
        role="switch"
        aria-checked={an}
        aria-label={label || beschriftung}
        className="vg-schalter"
        onClick={() => onAendern(!an)}
      />
      {beschriftung && <span className="vg-t-md">{beschriftung}</span>}
    </label>
  )
}

// --------------------------------------------------- Kurzinfo

/**
 * Die Blase liegt als Overlay auf document.body (Portal) und wird im Fenster
 * geklemmt: Tafeln und Karten schneiden mit overflow: hidden ab, was über
 * ihren Rand ragt — so stand der Hinweis zum „Standortzuschuss“ links
 * abgeschnitten da. Der Pfeil bleibt über dem Anker, auch wenn die Blase
 * an den Rand rückt; fehlt oben der Platz, öffnet sie nach unten.
 */
const TIP_RAND = 8
const TIP_ABSTAND = 7

export function Tip({ text, children, breite, block = false }) {
  const [anker, setAnker] = useState(null)   // Ankerlage im Fenster: { x, oben, unten }
  const [mass, setMass] = useState(null)     // gemessene Lage der Blase: { left, pfeil, unten }
  const ref = useRef(null)
  const blase = useRef(null)
  const id = useId()

  const zeigen = () => {
    // `block`: der Hüllen-Span hat keine eigene Box (display: contents), damit
    // das Kind Raster- oder Flex-Kind bleibt; gemessen wird dann das Kind.
    const el = ref.current
    const r = el && (block && el.firstElementChild ? el.firstElementChild : el).getBoundingClientRect()
    if (!r) return
    setMass(null)
    setAnker({ x: r.left + r.width / 2, oben: r.top, unten: r.bottom })
  }
  const verbergen = () => { setAnker(null); setMass(null) }

  useLayoutEffect(() => {
    if (!anker || !blase.current) return
    const b = blase.current.getBoundingClientRect()
    const left = Math.max(TIP_RAND, Math.min(anker.x - b.width / 2, window.innerWidth - b.width - TIP_RAND))
    const unten = anker.oben - b.height - TIP_ABSTAND < TIP_RAND
    setMass({ left, pfeil: anker.x - left, unten })
  }, [anker, text])

  if (!text) return children
  const offen = anker != null
  return (
    <span
      className={block ? 'vg-tip vg-tip-block' : 'vg-tip'}
      ref={ref}
      onMouseEnter={zeigen}
      onMouseLeave={verbergen}
      onFocus={zeigen}
      onBlur={verbergen}
      aria-describedby={offen ? id : undefined}
    >
      {children}
      {offen && createPortal(
        <span
          ref={blase}
          className="vg-tip-blase"
          data-fixiert="true"
          data-unten={mass?.unten ? 'true' : undefined}
          id={id}
          role="tooltip"
          style={{
            maxWidth: breite || undefined,
            left: mass ? mass.left : anker.x,
            top: mass?.unten ? anker.unten + TIP_ABSTAND : anker.oben - TIP_ABSTAND,
            '--tip-pfeil': mass ? `${mass.pfeil}px` : '50%',
            visibility: mass ? 'visible' : 'hidden',
          }}
        >
          {text}
        </span>,
        document.body,
      )}
    </span>
  )
}

export function InfoTip({ text }) {
  return (
    <Tip text={text}>
      <span className="vg-info-knopf" tabIndex={0} role="button" aria-label="Erläuterung">
        <Info size={13} strokeWidth={2} />
      </span>
    </Tip>
  )
}

// --------------------------------------------------- Hinweis

export function Hinweis({ children, ton = 'info', ikone: Ikone }) {
  return (
    <div className="vg-hinweis" data-ton={ton}>
      {Ikone ? <Ikone size={15} strokeWidth={1.9} /> : <Info size={15} strokeWidth={1.9} />}
      <div>{children}</div>
    </div>
  )
}

export function Leer({ titel, text, ikone: Ikone, aktion }) {
  return (
    <div className="vg-leer">
      {Ikone && <Ikone size={30} strokeWidth={1.4} />}
      {titel && <div className="vg-leer-titel">{titel}</div>}
      {text && <div className="vg-t-sm" style={{ maxWidth: 380 }}>{text}</div>}
      {aktion}
    </div>
  )
}

// --------------------------------------------------- Balken

export function Messlatte({ anteil, farbe = 'var(--brand-500)', hoehe }) {
  return (
    <div className="vg-messlatte" style={hoehe ? { height: hoehe } : undefined}>
      <span style={{ width: `${Math.max(0, Math.min(100, anteil * 100))}%`, background: farbe }} />
    </div>
  )
}

/**
 * Zweiseitiger Mini-Balken um eine Nulllinie - für Delta-Spalten
 * in dichten Tabellen.
 */
export function DeltaBalken({ wert, maximum }) {
  const m = Math.max(1e-9, maximum)
  const anteil = Math.max(-1, Math.min(1, wert / m))
  const breite = Math.abs(anteil) * 50
  const links = anteil >= 0 ? 50 : 50 - breite
  const farbe = wert >= 0 ? 'var(--vg-positiv)' : 'var(--vg-negativ)'
  return (
    <div className="vg-mini-balken" aria-hidden="true">
      <span style={{ left: `${links}%`, width: `${breite}%`, background: farbe }} />
      <span style={{ left: '50%', width: 1, background: 'var(--vg-rand-stark)', borderRadius: 0 }} />
    </div>
  )
}

export function Verteilungsstreifen({ teile }) {
  const summe = teile.reduce((s, t) => s + t.wert, 0) || 1
  return (
    <div className="vg-streifen">
      {teile.filter(t => t.wert > 0).map(t => (
        <div
          key={t.id}
          style={{ flexBasis: `${(t.wert / summe) * 100}%`, background: t.farbe }}
          title={`${t.label}: ${t.anzeige ?? t.wert}`}
        >
          {(t.wert / summe) > 0.08 ? (t.anzeige ?? t.wert) : ''}
        </div>
      ))}
    </div>
  )
}

// --------------------------------------------------- Aufklappbereich

export function Aufklapp({ titel, unter, offenStandard = false, aktionen, children, zaehler }) {
  const [offen, setOffen] = useState(offenStandard)
  return (
    <Karte>
      <button
        type="button"
        className="vg-karte-kopf"
        style={{ width: '100%', background: 'none', border: 0, borderBottom: offen ? '1px solid var(--vg-rand)' : 0, cursor: 'pointer', font: 'inherit', textAlign: 'left', color: 'inherit' }}
        aria-expanded={offen}
        onClick={() => setOffen(o => !o)}
      >
        <div className="vg-karte-kopf-titel">
          <span className="vg-karte-titel">
            {titel}
            {zaehler != null && zaehler > 0 && <span className="vg-badge" data-ton="marke" style={{ marginLeft: 8 }}>{zaehler}</span>}
          </span>
          {unter && <span className="vg-karte-unter">{unter}</span>}
        </div>
        <span className="vg-reihe">
          {aktionen}
          <ChevronDown
            size={16}
            strokeWidth={2}
            style={{ transition: 'transform var(--vg-normal) var(--vg-kurve)', transform: offen ? 'rotate(180deg)' : 'none', opacity: .6 }}
          />
        </span>
      </button>
      {offen && <KarteKoerper>{children}</KarteKoerper>}
    </Karte>
  )
}

// --------------------------------------------------- Wert mit Kontext

export function WertZeile({ label, wert, hinweis, ton, stark }) {
  return (
    <div className="vg-reihe-weit" style={{ padding: '5px 0', borderBottom: '1px solid var(--vg-rand)' }}>
      <span className="vg-t-sm vg-gedaempft vg-reihe" style={{ gap: 5 }}>
        {label}
        {hinweis && <InfoTip text={hinweis} />}
      </span>
      <span className={`vg-mono ${stark ? 'vg-fett' : 'vg-stark'}`} style={ton ? { color: `var(--vg-${ton})` } : undefined}>
        {wert}
      </span>
    </div>
  )
}

// --------------------------------------------------- Zahlen-Tweening

/**
 * Weiche Zahlenanimation. Läuft nur, wenn der Nutzer Bewegung
 * zulässt, und bricht bei jedem neuen Zielwert sauber ab.
 */
export function useAnimierteZahl(ziel, dauer = 380) {
  const [wert, setWert] = useState(ziel)
  const vonRef = useRef(ziel)
  const rafRef = useRef(0)

  useEffect(() => {
    const reduziert = typeof matchMedia === 'function' &&
      matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduziert || !Number.isFinite(ziel)) { setWert(ziel); vonRef.current = ziel; return }

    const von = vonRef.current
    if (Math.abs(ziel - von) < 1e-9) return
    const start = performance.now()
    cancelAnimationFrame(rafRef.current)

    const schritt = (jetzt) => {
      const t = Math.min(1, (jetzt - start) / dauer)
      const e = 1 - Math.pow(1 - t, 3)
      const v = von + (ziel - von) * e
      setWert(v)
      vonRef.current = v
      if (t < 1) rafRef.current = requestAnimationFrame(schritt)
      else vonRef.current = ziel
    }
    rafRef.current = requestAnimationFrame(schritt)
    return () => cancelAnimationFrame(rafRef.current)
  }, [ziel, dauer])

  return wert
}

/**
 * Betrag, der beim Wertwechsel nachläuft.
 * @param dauer   Laufzeit in ms — Standard ist --vg-daten (420 ms)
 * @param format  eigener Formatierer (z. B. euro, prozentDelta); ohne ihn
 *                entscheidet `kompakt` zwischen „65,7 Mio. EUR“ und „65.700.000“
 */
export function AnimierterBetrag({ wert, kompakt = true, dauer = 420, format }) {
  const v = useAnimierteZahl(wert, dauer)
  const text = format ? format(v) : (kompakt ? euroKompakt(v) : Math.round(v).toLocaleString('de-DE'))
  return <span className="vg-zahl">{text}</span>
}
