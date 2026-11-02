import { memo, useCallback, useRef, useState, useEffect } from 'react'
import { RotateCcw, Scale } from 'lucide-react'
import { Tip } from './basis'
import { zahl } from '../lib/format'
import './regler.css'

export const EINHEIT_ZEICHEN = {
  promille: '‰',
  prozent: '%',
  anteil: '%',
  faktor: '×',
  jahre: 'Jahre',
  anzahl: '',
  euro: 'EUR',
  schalter: '',
}

const NACHKOMMA = {
  promille: 2,
  prozent: 2,
  anteil: 0,
  faktor: 1,
  jahre: 0,
  anzahl: 0,
  euro: 0,
  schalter: 0,
}

export function formatiere(wert, def) {
  // Ein Schalter kennt nur zwei Rasten — als Wort, nicht als 0/1
  if (def.einheit === 'schalter') return wert >= 0.5 ? 'an' : 'aus'
  const stellen = def.step >= 1 ? 0 : (def.step >= 0.1 ? 1 : 2)
  return zahl(wert, Math.min(stellen, NACHKOMMA[def.einheit] ?? 2))
}

const klemme = p => Math.min(100, Math.max(0, p))

/**
 * Eine Reglerzeile. Das meistgenutzte Bauteil der Anwendung.
 * Ein Bezug: alles misst gegen heute (def.basis). Die Bahn zeigt das
 * Abweichungsstück von der Kerbe „heute“ zum Knopf; der native Range-Input
 * liegt unsichtbar obenauf und trägt Maus, Tastatur und Screenreader.
 * Nur „Zurücksetzen“ bezieht sich auf den Vorschlagswert (def.standard).
 *
 * `dicht` setzt die Zeile auf 44 px: Name, Bahn und Wert in EINER Zeile
 * (Name so breit wie nötig bis 150 px, notfalls zweizeilig; Wert 58 px
 * rechtsbündig, Abzeichen als Chip hinter dem Wert). Waage und Zurück
 * stehen dann im Kopf hinter dem Namen und erscheinen nur bei Hand oder
 * Fokus über dem Namensende — so liegen sie nie über dem Knopf der Bahn,
 * wie breit der Name auch ist. Das Raster (regler.css) ordnet um.
 */
function ReglerZeile({
  def, wert, onAendern, onNeutralstellen,
  hinweisZeigen = false, kompakt = false, ohneChip = false, dicht = false,
  // Der Hinweis unter der Zeile erscheint bei Fokus und lässt die Zeile um
  // rund 50 px wachsen; wo darunter Knöpfe stehen (Verhandlungsmodus), springt
  // beim Klick die Fläche unter dem Zeiger weg — dort wird er abgeschaltet.
  hinweisBeiFokus = true,
}) {
  const [tippt, setTippt] = useState(false)
  const [entwurf, setEntwurf] = useState('')
  const [zieht, setZieht] = useState(false)
  const [fokus, setFokus] = useState(false)
  const eingabeRef = useRef(null)

  const spanne = def.max - def.min
  const fuellung = klemme(spanne > 0 ? ((wert - def.min) / spanne) * 100 : 0)
  const basisPos = klemme(spanne > 0 ? ((def.basis - def.min) / spanne) * 100 : 0)
  const basisImBereich = def.basis >= def.min && def.basis <= def.max
  const abweichungVonHeute = wert - def.basis
  const veraendert = Math.abs(abweichungVonHeute) > 1e-9
  const aufVorschlag = Math.abs(wert - def.standard) < 1e-9

  const uebernehmen = useCallback(() => {
    const roh = parseFloat(String(entwurf).replace(',', '.'))
    setTippt(false)
    if (!Number.isFinite(roh)) return
    const geklemmt = Math.min(def.max, Math.max(def.min, roh))
    onAendern(def.id, Math.round(geklemmt / def.step) * def.step)
  }, [entwurf, def, onAendern])

  useEffect(() => {
    if (tippt) eingabeRef.current?.select()
  }, [tippt])

  // Lässt die Hand außerhalb des Inputs los, kommt kein pointerup am Element
  // an — das Fenster fängt ihn, sonst bliebe die Fahne stehen.
  useEffect(() => {
    if (!zieht) return undefined
    const loslassen = () => setZieht(false)
    window.addEventListener('pointerup', loslassen)
    window.addEventListener('pointercancel', loslassen)
    return () => {
      window.removeEventListener('pointerup', loslassen)
      window.removeEventListener('pointercancel', loslassen)
    }
  }, [zieht])

  const zeichen = EINHEIT_ZEICHEN[def.einheit] ?? ''
  const schalter = def.einheit === 'schalter'
  const wertText = `${formatiere(wert, def)} ${zeichen}`.trim()
  const basisText = `${formatiere(def.basis, def)} ${zeichen}`.trim()
  const abzeichen = !ohneChip && veraendert && (
    <span
      className="vg-badge"
      data-ton={def.richtung === 'neutral' ? 'neutral' : (abweichungVonHeute > 0) === (def.richtung === 'hoch-teurer') ? 'warnung' : 'positiv'}
      title={`Heute: ${basisText}`}
    >
      {schalter
        ? formatiere(wert, def)
        : <>{abweichungVonHeute > 0 ? '+' : '−'}{formatiere(Math.abs(abweichungVonHeute), def)}</>}
    </span>
  )

  // Waage (Budgetneutralität) und Zurück (Vorschlagswert)
  const knoepfe = (
    <>
      {onNeutralstellen && (
        <Tip text="Diesen Regler so setzen, dass das Gesamtbudget neutral bleibt">
          <button
            type="button"
            className="vg-btn vg-btn-still vg-btn-sm vg-btn-symbol"
            onClick={() => onNeutralstellen(def.id)}
            aria-label={`${def.label} auf Budgetneutralität stellen`}
          >
            <Scale size={13} strokeWidth={1.9} />
          </button>
        </Tip>
      )}
      <Tip text={`Zurück auf den Vorschlagswert ${formatiere(def.standard, def)} ${zeichen}`.trim()}>
        <button
          type="button"
          className="vg-btn vg-btn-still vg-btn-sm vg-btn-symbol"
          onClick={() => onAendern(def.id, def.standard)}
          disabled={aufVorschlag}
          aria-label={`${def.label} zurücksetzen`}
        >
          <RotateCcw size={13} strokeWidth={1.9} />
        </button>
      </Tip>
    </>
  )

  return (
    <div
      className="vg-regler"
      data-veraendert={veraendert}
      data-dicht={dicht || undefined}
      data-schalter={schalter || undefined}
      style={{ '--fuellung': `${fuellung}%` }}
    >
      <div className="vg-regler-kopf">
        {/* In der Schublade (hinweisZeigen) steht der Hinweis bei Fokus unter
            der Bahn; eine Kurzinfo am Namen würde ihn doppeln und an der
            Schubladenkante abgeschnitten. */}
        {hinweisZeigen ? (
          <span className="vg-regler-name" data-ohne-tip="true">{def.label}</span>
        ) : (
          <Tip text={def.hinweis} breite={330}>
            <span className="vg-regler-name">{def.label}</span>
          </Tip>
        )}
        {/* In der dichten Zeile steht das Abzeichen hinter dem Wert; Waage
            und Zurück liegen dann hier, absolut über dem Namensende, und
            werden erst bei Hand oder Fokus sichtbar (regler.css) */}
        {!dicht && abzeichen}
        {dicht && <span className="vg-regler-knoepfe">{knoepfe}</span>}
      </div>

      <div className="vg-regler-werkzeuge">
        {tippt && !schalter ? (
          <input
            ref={eingabeRef}
            className="vg-regler-eingabe"
            value={entwurf}
            onChange={e => setEntwurf(e.target.value)}
            onBlur={uebernehmen}
            onKeyDown={e => {
              if (e.key === 'Enter') uebernehmen()
              if (e.key === 'Escape') setTippt(false)
            }}
            inputMode="decimal"
            aria-label={`${def.label} als Zahl eingeben`}
          />
        ) : (
          <button
            type="button"
            className="vg-regler-wert"
            style={{ border: 0, background: 'none', cursor: schalter ? 'pointer' : 'text', color: 'inherit', padding: 0 }}
            onClick={schalter
              ? () => onAendern(def.id, wert >= 0.5 ? def.min : def.max)
              : () => { setEntwurf(formatiere(wert, def).replace('.', '')); setTippt(true) }}
            title={schalter ? 'Umschalten' : 'Wert direkt eingeben'}
          >
            {formatiere(wert, def)}
            {zeichen && <span className="vg-regler-einheit">{zeichen}</span>}
          </button>
        )}
        {dicht && <span className="vg-regler-chip">{abzeichen}</span>}
        {!dicht && knoepfe}
      </div>

      <div
        className="vg-regler-bahn"
        data-zieht={zieht}
        onFocus={() => setFokus(true)}
        onBlur={() => setFokus(false)}
      >
        {/* Schalter: zwei Rasten an den Bahnenden */}
        {schalter && (
          <>
            <span className="vg-regler-raste" style={{ left: 0 }} aria-hidden="true" />
            <span className="vg-regler-raste" style={{ left: '100%' }} aria-hidden="true" />
          </>
        )}
        {basisImBereich && (
          <span
            className="vg-regler-basis"
            style={{ left: `${basisPos}%`, '--vg-pos': basisPos }}
            data-label={`heute ${basisText}`}
            aria-hidden="true"
          />
        )}
        {/* Bleibt bei Wert = heute mit Breite 0 im DOM, damit es beim
            Szenario-Klick aus der Kerbe herauswächst statt hart zu erscheinen. */}
        <span
          className="vg-regler-abweichung"
          style={{
            left: `${Math.min(basisPos, fuellung)}%`,
            width: `${Math.abs(fuellung - basisPos)}%`,
          }}
          aria-hidden="true"
        />
        <span
          className="vg-regler-knopf"
          style={{ left: `${fuellung}%`, '--vg-pos': fuellung }}
          data-wert={wertText}
          aria-hidden="true"
        />
        <input
          type="range"
          min={def.min}
          max={def.max}
          step={def.step}
          value={wert}
          onChange={e => onAendern(def.id, parseFloat(e.target.value))}
          onPointerDown={() => setZieht(true)}
          onPointerUp={() => setZieht(false)}
          onPointerCancel={() => setZieht(false)}
          onBlur={() => setZieht(false)}
          aria-label={def.label}
          aria-valuetext={`${wertText}, heute ${basisText}`}
        />
      </div>

      {hinweisZeigen && !kompakt && fokus && hinweisBeiFokus && (
        <div className="vg-regler-hinweis">{def.hinweis}</div>
      )}
    </div>
  )
}

export default memo(ReglerZeile)
