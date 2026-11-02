import { useEffect, useMemo, useRef, useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { InfoTip, useAnimierteZahl } from './basis'
import { euro, euroKompakt, achseEuro, zahl, prozent } from '../lib/format'
import './tafel.css'

/**
 * TAFELSPRACHE — dichte Kacheln für Simulationskasten und Akten-Dashboard.
 *
 *   <Tafel>            Karte mit 34-px-Kopfband und dichtem Körper
 *   <VergleichsTafel>  Sparte · Produkt · Bemessung · Alt · Neu · Differenz
 *   <StaffelTabelle>   eine Zeile je Bonusstufe, Satz neu als Eingabe
 *   <LabelWert>        Label/Wert-Liste (Stammdaten, Garantien)
 *
 * Burgund im Kopfband heißt „hier wird bedient“ (ton eingabe); die
 * Wirkungs-Tafeln tragen Stahlblau (abschluss), Tiefgrün (folge) oder
 * Grau (sonst); Diagramm-Tafeln haben kein Band (neutral).
 */

// --------------------------------------------------------------- Tafel

/**
 * @param titel      Titel im Kopfband (fs-md, 500)
 * @param unter      Unterzeile rechts im Kopfband (fs-xs, gedämpft)
 * @param ton        'eingabe' | 'abschluss' | 'folge' | 'sonst' | 'neutral'
 * @param aktionen   Slot rechts im Kopfband (Plaketten, Links, Knöpfe)
 * @param dicht      halbiert die Zeilenhöhen der Tabellen im Körper (28 statt 34 px)
 * @param breit      2: die Tafel spannt zwei Rasterspalten
 * @param zaehler    kleine Zahl hinter dem Titel („3 verändert“ als Zahl)
 * @param aufklappbar  Kopf als Knopf; `offenStandard` bestimmt den Anfang
 * @param buendig    Körper ohne Innenabstand (Tabellen bis an die Kante)
 */
export function Tafel({
  titel, unter, ton = 'neutral', aktionen, dicht = false, breit = 1, zaehler,
  aufklappbar = false, offenStandard = true, buendig = false,
  className = '', children, ...rest
}) {
  const [offen, setOffen] = useState(offenStandard)
  const zu = aufklappbar && !offen

  const kopfInhalt = (
    <>
      <h3 className="vg-tafel-titel">
        <span className="vg-kappen">{titel}</span>
        {zaehler != null && <span className="vg-tafel-zaehler">{zaehler}</span>}
      </h3>
      {unter && <span className="vg-tafel-unter">{unter}</span>}
      {aktionen && <div className="vg-tafel-aktionen">{aktionen}</div>}
      {aufklappbar && <ChevronDown size={15} strokeWidth={2} className="vg-tafel-pfeil" aria-hidden="true" />}
    </>
  )

  return (
    <section
      className={`vg-karte vg-tafel ${className}`.trim()}
      data-ton={ton}
      data-breit={breit === 2 ? '2' : undefined}
      data-dicht={dicht || undefined}
      data-zu={zu || undefined}
      aria-label={typeof titel === 'string' ? titel : undefined}
      {...rest}
    >
      {aufklappbar ? (
        <button
          type="button"
          className="vg-tafel-kopf vg-tafel-kopf-knopf"
          aria-expanded={offen}
          onClick={() => setOffen(o => !o)}
        >
          {kopfInhalt}
        </button>
      ) : (
        <header className="vg-tafel-kopf">{kopfInhalt}</header>
      )}
      {!zu && (
        <div className="vg-tafel-koerper" data-buendig={buendig || undefined}>
          {children}
        </div>
      )}
    </section>
  )
}

// --------------------------------------------------------- Formatierer

/** Beträge ohne Nachkommastellen; ab 100 Mio. kompakt, sonst voll. */
export function betragTafel(v) {
  if (v == null || Number.isNaN(v)) return '–'
  return Math.abs(v) >= 100_000_000 ? euroKompakt(v) : euro(v)
}

/** Differenz mit Vorzeichen; null steht als „0“. */
export function differenzTafel(v) {
  if (v == null || Number.isNaN(v)) return '–'
  if (Math.abs(v) < 0.5) return '0'
  return (v > 0 ? '+' : '−') + betragTafel(Math.abs(v))
}

function tonAus(v) {
  if (v == null || Number.isNaN(v) || Math.abs(v) < 0.5) return 'neutral'
  return v > 0 ? 'positiv' : 'negativ'
}

/** Wie tonAus, aber aus Sicht des Zahlenden: mehr ist Warnung, weniger positiv. */
function tonAusZahler(v) {
  if (v == null || Number.isNaN(v) || Math.abs(v) < 0.5) return 'neutral'
  return v > 0 ? 'warnung' : 'positiv'
}

/**
 * Eine Zahl, die beim Wertwechsel 420 ms nachläuft — Zellen der
 * Vergleichstabelle. Der Ton kommt vom Zielwert, nicht vom Zwischenstand,
 * damit die Tinte beim Nachlaufen nicht flackert.
 */
function Zahl({ wert, format, animiert }) {
  const v = useAnimierteZahl(Number.isFinite(wert) ? wert : 0, 420)
  if (!Number.isFinite(wert)) return format(wert)
  return format(animiert ? v : wert)
}

// ------------------------------------------------------ VergleichsTafel

const STANDARD_SPALTEN = [
  { id: 'sparte', label: 'Sparte', num: false },
  { id: 'produkt', label: 'Produkt', num: false },
  { id: 'bemessung', label: 'Bemessung', num: true, format: betragTafel },
  { id: 'alt', label: 'Alt', num: true, format: betragTafel },
  { id: 'neu', label: 'Neu', num: true, format: betragTafel },
  { id: 'differenz', label: 'Differenz', num: true, format: differenzTafel },
]

/**
 * Vergleichstabelle: Sparte (nicht wiederholt) · Produkt · Bemessung ·
 * Alt · Neu (hinterlegt) · Differenz (Tinte nach Vorzeichen).
 *
 * @param spalten     [{ id, label, num, breite, format }] — überschreibt je id
 *                    die Standardspalte; fehlt die Liste, zeigt die Tafel die
 *                    Standardspalten, deren Werte in den Zeilen vorkommen
 * @param zeilen      [{ id, sparte, produkt, bemessung, alt, neu, differenz, ton }]
 * @param abschnitte  [{ titel, zeilen }] — Zwischenkopf je Abschnitt
 * @param summe       { alt, neu, differenz, bemessung?, label? }
 * @param hervor      id der Zeile, die hervorgehoben wird
 * @param dicht       Zeilen 28 px statt 34 px (auch über die Tafel setzbar)
 * @param animiert    Zahlen laufen beim Wertwechsel 420 ms nach
 * @param zahlersicht Differenz-Tinte aus Sicht des Zahlenden (mehr = Warnung,
 *                    weniger = positiv) — der Simulationskasten; die Akte
 *                    färbt ohne diese Angabe aus Sicht des Instituts
 * @param weichend    Spalten-ids, die in einer schmalen Tafel ausgeblendet
 *                    werden statt stumm hinter der Kartenkante zu liegen:
 *                    `bemessung` weicht unter 360 px Tafelbreite, `alt` unter
 *                    300 px (Container-Abfrage in tafel.css). Ohne Angabe
 *                    weichen beide, sobald die Tafel fünf oder mehr Spalten
 *                    zeigt; kleinere Tabellen behalten alle Spalten.
 */
export function VergleichsTafel({
  spalten, zeilen = [], abschnitte = [], summe, hervor, dicht = false, animiert = true, ohneKopf = false,
  weichend, zahlersicht = false,
}) {
  const tonDifferenz = zahlersicht ? tonAusZahler : tonAus
  const alleZeilen = useMemo(
    () => [...zeilen, ...abschnitte.flatMap(a => a.zeilen || [])],
    [zeilen, abschnitte],
  )

  // Welche Spalten stehen: ausdrücklich genannte, sonst die Standardspalten,
  // für die mindestens eine Zeile einen Wert trägt (Produkt immer).
  const sichtbar = useMemo(() => {
    if (spalten && spalten.length) {
      return spalten.map(s => ({ ...(STANDARD_SPALTEN.find(x => x.id === s.id) || {}), ...s }))
    }
    return STANDARD_SPALTEN.filter(s =>
      s.id === 'produkt' || alleZeilen.some(z => z[s.id] != null && z[s.id] !== ''))
  }, [spalten, alleZeilen])

  const anzahl = sichtbar.length
  const weicht = (weichend ?? (anzahl >= 5 ? ['bemessung', 'alt'] : []))
    .filter(id => sichtbar.some(s => s.id === id))

  // Ohne Sparten-Spalte trägt ein Produkt, das in seinem Block mehrfach
  // vorkommt, die Sparte im Namen („Bestandsprovision Leben“ und
  // „Bestandsprovision Komposit“) — sonst stünden zwei gleiche Zeilen mit
  // verschiedenen Zahlen untereinander, ohne dass man sie auseinanderhält.
  const mitSparte = sichtbar.some(s => s.id === 'sparte')
  const produktName = (z, liste) => {
    const text = z.produkt ?? ''
    if (mitSparte || !z.sparte || typeof text !== 'string') return text
    const doppelt = liste.some(o => o !== z && o.produkt === z.produkt && o.sparte !== z.sparte)
    return doppelt ? `${text} ${z.sparte}` : text
  }

  const zelle = (z, s, vorherigeSparte, liste) => {
    if (s.id === 'sparte') {
      const gleich = vorherigeSparte != null && vorherigeSparte === z.sparte
      return (
        <td key={s.id} data-spalte="sparte" title={gleich ? z.sparte : undefined}>
          {gleich ? '' : (z.sparte ?? '')}
        </td>
      )
    }
    if (s.id === 'produkt') {
      const text = produktName(z, liste)
      return (
        <td key={s.id} data-spalte="produkt" title={typeof text === 'string' ? text : undefined}>
          {text}
          {z.hinweis && <span style={{ marginLeft: 4 }}><InfoTip text={z.hinweis} /></span>}
        </td>
      )
    }
    const wert = z[s.id]
    const format = s.format || (v => (v == null ? '–' : String(v)))
    const ton = s.id === 'differenz' ? (z.ton || tonDifferenz(wert)) : undefined
    return (
      <td key={s.id} data-spalte={s.id} data-num={s.num ? 'true' : undefined} data-ton={ton}>
        {typeof wert === 'number'
          ? <Zahl wert={wert} format={format} animiert={animiert} />
          : (wert ?? '–')}
      </td>
    )
  }

  const zeilenBlock = (liste) => {
    let vorherige = null
    return liste.map(z => {
      const tr = (
        <tr key={z.id} data-hervor={hervor != null && hervor === z.id ? 'true' : undefined}>
          {sichtbar.map(s => zelle(z, s, vorherige, liste))}
        </tr>
      )
      vorherige = z.sparte ?? null
      return tr
    })
  }

  return (
    <div
      className="vg-vergleich-rahmen"
      data-weichend={weicht.length ? weicht.join(' ') : undefined}
      style={dicht ? { '--tafel-zeile': '28px' } : undefined}
    >
      <table className="vg-vergleich">
        {!ohneKopf && (
          <thead>
            <tr>
              {sichtbar.map(s => (
                <th
                  key={s.id}
                  data-spalte={s.id}
                  data-num={s.num ? 'true' : undefined}
                  style={s.breite ? { width: s.breite } : undefined}
                >
                  {s.label}
                </th>
              ))}
            </tr>
          </thead>
        )}
        <tbody>
          {zeilenBlock(zeilen)}
          {abschnitte.map((a, i) => (
            <AbschnittZeilen key={a.id || a.titel || i} titel={a.titel} anzahl={anzahl}>
              {zeilenBlock(a.zeilen || [])}
            </AbschnittZeilen>
          ))}
          {summe && (
            <tr className="vg-vergleich-summe">
              {sichtbar.map((s, i) => {
                if (s.id === 'sparte') return <td key={s.id} data-spalte="sparte" />
                if (s.id === 'produkt') return <td key={s.id} data-spalte="produkt">{summe.label ?? 'Summe'}</td>
                const wert = summe[s.id]
                if (wert == null) return <td key={s.id} data-spalte={s.id} data-num="true" />
                const format = s.format || (v => String(v))
                const ton = s.id === 'differenz' ? (summe.ton || tonDifferenz(wert)) : undefined
                return (
                  <td key={s.id} data-spalte={s.id} data-num="true" data-ton={ton}>
                    {typeof wert === 'number'
                      ? <Zahl wert={wert} format={format} animiert={animiert} />
                      : wert}
                  </td>
                )
              })}
            </tr>
          )}
        </tbody>
      </table>
    </div>
  )
}

/** Zwischenkopf eines Abschnitts, gefolgt von seinen Zeilen (Fragment im tbody). */
function AbschnittZeilen({ titel, anzahl, children }) {
  return (
    <>
      {titel && (
        <tr className="vg-vergleich-abschnitt">
          <th colSpan={anzahl} scope="colgroup">{titel}</th>
        </tr>
      )}
      {children}
    </>
  )
}

// -------------------------------------------------------- StaffelTabelle

const MINUS = '−'

/** Spalten der Staffeltabelle mit ihrem Gewicht an der Tabellenbreite. */
const STAFFEL_SPALTEN = {
  bereich:   { label: 'Bereich', gewicht: 22, num: false },
  schwelle:  { label: 'ab', gewicht: 18, num: true },
  satzHeute: { label: 'Satz heute', gewicht: 14, num: true },
  satz:      { label: 'Satz neu', gewicht: 28, num: true },
  einheiten: { label: 'Einheiten', gewicht: 18, num: true },
  volumen:   { label: 'Volumen neu', gewicht: 16, num: true },
}
// Standard ohne Volumen (das zeigt die Wirkungs-Tafel „Bonusstaffel“) —
// „Satz heute“ bleibt die zweite Spalte, weil der Kasten sie unter 1280 px
// über ihre Position ausblendet (makro.css); wer die Form mit Kleintext
// „heute 19,0“ unter der Eingabe will, lässt 'satzHeute' in `spalten` weg.
const STAFFEL_STANDARD = ['bereich', 'schwelle', 'satzHeute', 'satz', 'einheiten']

/**
 * Bereichslabel einer Stufe aus den Schwellen: „unter 85 %“, „85 – 95 %“,
 * „über 125 %“. Fehlen die Schwellen, gilt das gelieferte Label.
 */
function bereichLabel(stufen, i) {
  const s = stufen[i]
  const eigene = s.schwelle
  const naechste = stufen[i + 1]?.schwelle
  if (eigene == null && naechste == null) return s.label
  if (eigene == null) return `unter ${zahl(naechste)} %`
  if (naechste == null) return `über ${zahl(eigene)} %`
  return `${zahl(eigene)} – ${zahl(naechste)} %`
}

/**
 * Eine Zeile je Bonusstufe: Bereich · ab (Schwelle, Eingabe) · Satz heute ·
 * Satz neu (Eingabe) · Einheiten heute → neu; auf Wunsch Volumen neu. Ohne
 * die Spalte „Satz heute“ steht der heutige Satz klein unter der Eingabe
 * („heute 19,0 %“). Beide Eingaben sind 48 px breit (Tabellenziffern);
 * Pfeil hoch/runter schrittet den Satz um 0,5 und die Schwelle um 1. Ein geänderter Satz trägt das Abzeichen des Reglers
 * (höherer Bonussatz = teurer → warnung, niedriger → positiv) an der Stelle
 * des Prozentzeichens neben der Eingabe — nicht als eigene Spalte, damit
 * die Tabelle in eine Drittel-Tafel passt. Die Tabelle ist `table-layout:
 * fixed`; ein Rahmen mit waagerechtem Scrollen ist das letzte Netz.
 *
 * @param stufen    [{ index, label, schwelle?, satzHeute, satzNeu, einheitenHeute, einheitenNeu, volumenNeu }]
 *                  `schwelle` = Beginn der Stufe in Prozent der Zielerreichung (Stufe 1 hat keine)
 * @param onSatz    (index, wert) => …
 * @param onSchwelle (index, wert) => … — fehlt sie, steht die Schwelle als Text
 * @param basis     Sätze des heutigen Modells je Stufe (Bezug für das Abzeichen); fehlt sie, gilt satzHeute
 * @param spalten   Reihenfolge und Auswahl: 'bereich' | 'schwelle' | 'satzHeute' | 'satz' | 'einheiten' | 'volumen'
 *                  (Standard: bereich, schwelle, satzHeute, satz, einheiten; `schwelle` nur, wenn
 *                  eine Stufe eine trägt; ohne 'satzHeute' steht der heutige Satz klein unter der Eingabe)
 * @param min/max/step  Wertebereich der Satz-Eingabe (0 / 60 / 0,5)
 * @param schwelleMin/schwelleMax  Wertebereich der Schwellen-Eingabe (50 / 200)
 */
export function StaffelTabelle({
  stufen = [], onSatz, onSchwelle, basis, min = 0, max = 60, step = 0.5,
  schwelleMin = 50, schwelleMax = 200,
  spalten, mitVolumen, mitEinheiten,
}) {
  const mitSchwellen = stufen.some(s => s.schwelle != null)
  const sichtbar = useMemo(() => {
    let ids = spalten ? [...spalten] : [...STAFFEL_STANDARD]
    // Ältere Aufrufe steuern über mitVolumen/mitEinheiten
    if (!spalten && mitVolumen === true) ids.push('volumen')
    if (mitEinheiten === false) ids = ids.filter(id => id !== 'einheiten')
    if (mitVolumen === false) ids = ids.filter(id => id !== 'volumen')
    if (!mitSchwellen) ids = ids.filter(id => id !== 'schwelle')
    return ids.filter(id => STAFFEL_SPALTEN[id])
  }, [spalten, mitVolumen, mitEinheiten, mitSchwellen])
  const gewichtSumme = sichtbar.reduce((a, id) => a + STAFFEL_SPALTEN[id].gewicht, 0)
  const breite = (id) => `${((STAFFEL_SPALTEN[id].gewicht / gewichtSumme) * 100).toFixed(1)}%`
  const heuteKlein = !sichtbar.includes('satzHeute')

  return (
    <div className="vg-staffel-rahmen">
      <table className="vg-staffel">
        {/* Breiten am Kopf, nicht als colgroup: blendet eine Aufrufstelle
            eine Spalte aus, verteilt die feste Tabelle den Rest auf die
            sichtbaren Spalten statt auf eine leere. */}
        <thead>
          <tr>
            {sichtbar.map(id => (
              <th
                key={id}
                data-spalte={id === 'satzHeute' ? 'heute' : id === 'satz' ? 'neu' : id}
                data-num={STAFFEL_SPALTEN[id].num ? 'true' : undefined}
                style={{ width: breite(id) }}
              >
                {STAFFEL_SPALTEN[id].label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {stufen.map((s, i) => {
            const index = s.index ?? i
            const bezug = basis?.[index] ?? s.satzHeute ?? 0
            const abweichung = (s.satzNeu ?? 0) - bezug
            const veraendert = Math.abs(abweichung) > 1e-9
            const label = bereichLabel(stufen, i)
            const zellen = {
              bereich: (
                <td key="bereich" data-spalte="bereich" title={label}>{label}</td>
              ),
              schwelle: (
                <td key="schwelle" data-spalte="schwelle" data-num="true">
                  {s.schwelle == null ? (
                    <span className="vg-staffel-leer" aria-label="keine Schwelle">–</span>
                  ) : onSchwelle ? (
                    <span className="vg-staffel-neu">
                      <ZahlEingabe
                        wert={s.schwelle}
                        label={`Schwelle Stufe ${index + 1} in Prozent der Zielerreichung`}
                        min={schwelleMin} max={schwelleMax} step={1} stellen={0}
                        onAendern={w => onSchwelle(index, w)}
                      />
                      <span className="vg-staffel-einheit">%</span>
                    </span>
                  ) : (
                    <>{zahl(s.schwelle)} %</>
                  )}
                </td>
              ),
              satzHeute: (
                <td key="satzHeute" data-spalte="heute" data-num="true">{prozent(s.satzHeute ?? 0, 1)}</td>
              ),
              satz: (
                <td key="satz" data-spalte="neu" data-num="true">
                  <span className="vg-staffel-satz">
                    <span className="vg-staffel-neu">
                      <ZahlEingabe
                        wert={s.satzNeu ?? 0}
                        label={`Bonussatz ${label} neu`}
                        min={min} max={max} step={step} stellen={1}
                        onAendern={w => onSatz?.(index, w)}
                      />
                      {/* Das Abzeichen tritt an die Stelle des Prozentzeichens:
                          kein zusätzlicher Spaltenplatz, keine Überlagerung,
                          die Zeile bleibt gleich hoch. */}
                      {veraendert ? (
                        <span
                          className="vg-badge vg-staffel-chip"
                          data-ton={abweichung > 0 ? 'warnung' : 'positiv'}
                          title={`Heute: ${prozent(bezug, 1)}`}
                        >
                          {abweichung > 0 ? '+' : MINUS}{zahl(Math.abs(abweichung), 1)}
                        </span>
                      ) : (
                        <span className="vg-staffel-einheit">%</span>
                      )}
                    </span>
                    {/* Ohne Spalte „Satz heute“: der heutige Satz klein darunter,
                        in jeder Zeile, damit die Höhen gleich bleiben */}
                    {heuteKlein && (
                      <span className="vg-staffel-unter">
                        <span className="vg-staffel-heute">heute {zahl(s.satzHeute ?? bezug, 1)} %</span>
                      </span>
                    )}
                  </span>
                </td>
              ),
              einheiten: (
                <td key="einheiten" data-spalte="einheiten" data-num="true">
                  {zahl(s.einheitenHeute ?? 0)}
                  <span className="vg-pfeil" aria-hidden="true" />
                  <span className="vg-staffel-neuwert">{zahl(s.einheitenNeu ?? 0)}</span>
                </td>
              ),
              volumen: (
                <td key="volumen" data-spalte="volumen" data-num="true">
                  <Zahl wert={s.volumenNeu ?? 0} format={achseEuro} animiert />
                </td>
              ),
            }
            return (
              <tr key={index} data-veraendert={veraendert ? 'true' : 'false'}>
                {sichtbar.map(id => zellen[id])}
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

/**
 * Zahleneingabe der Staffel: Text mit Komma, übernimmt bei Enter und Blur,
 * Escape verwirft, Pfeil hoch/runter schrittet um `step` und übernimmt
 * sofort. `stellen` = Nachkommastellen der Anzeige (Satz 1, Schwelle 0).
 */
function ZahlEingabe({ wert, label, min, max, step, stellen = 1, onAendern }) {
  const [entwurf, setEntwurf] = useState(() => zahl(wert, stellen))
  const [tippt, setTippt] = useState(false)
  const ref = useRef(null)

  // Von außen gesetzte Werte (Szenario, Zurücksetzen) landen im Feld,
  // solange niemand darin tippt.
  useEffect(() => {
    if (!tippt) setEntwurf(zahl(wert, stellen))
  }, [wert, tippt, stellen])

  const klemme = v => Math.min(max, Math.max(min, Math.round(v / step) * step))

  const uebernehmen = () => {
    setTippt(false)
    const roh = parseFloat(String(entwurf).replace(/\s/g, '').replace(',', '.'))
    if (!Number.isFinite(roh)) { setEntwurf(zahl(wert, stellen)); return }
    const neu = klemme(roh)
    setEntwurf(zahl(neu, stellen))
    if (Math.abs(neu - wert) > 1e-9) onAendern(neu)
  }

  const schritt = (richtung) => {
    const neu = klemme(wert + richtung * step)
    setEntwurf(zahl(neu, stellen))
    if (Math.abs(neu - wert) > 1e-9) onAendern(neu)
  }

  return (
    <input
      ref={ref}
      className="vg-staffel-eingabe"
      type="text"
      inputMode="decimal"
      value={entwurf}
      aria-label={label}
      role="spinbutton"
      aria-valuenow={wert}
      aria-valuemin={min}
      aria-valuemax={max}
      onFocus={() => { setTippt(true); requestAnimationFrame(() => ref.current?.select()) }}
      onChange={e => setEntwurf(e.target.value)}
      onBlur={uebernehmen}
      onKeyDown={e => {
        if (e.key === 'Enter') { uebernehmen(); e.currentTarget.blur() }
        else if (e.key === 'Escape') { setEntwurf(zahl(wert, stellen)); setTippt(false); e.currentTarget.blur() }
        else if (e.key === 'ArrowUp') { e.preventDefault(); schritt(+1) }
        else if (e.key === 'ArrowDown') { e.preventDefault(); schritt(-1) }
      }}
    />
  )
}

// -------------------------------------------------------------- LabelWert

/**
 * Sichtbare Textlänge eines Werts — für die Entscheidung, ob eine Zeile
 * gestapelt wird. Zeichenketten zählen ihre Länge, Elemente ihre Kinder;
 * ein Pfeil (.vg-pfeil) zählt wie drei Zeichen.
 */
function textLaenge(knoten) {
  if (knoten == null || typeof knoten === 'boolean') return 0
  if (typeof knoten === 'string' || typeof knoten === 'number') return String(knoten).length
  if (Array.isArray(knoten)) return knoten.reduce((a, k) => a + textLaenge(k), 0)
  if (typeof knoten === 'object' && knoten.props) {
    if (typeof knoten.props.className === 'string' && knoten.props.className.includes('vg-pfeil')) return 3
    return textLaenge(knoten.props.children)
  }
  return 0
}

/** Ab dieser Länge nimmt ein Wert die Zeile allein (gestapelt). */
const STAPEL_AB = 14

/**
 * Label/Wert-Liste für Stammdaten und Garantien. Das Label darf auf zwei
 * Zeilen umbrechen, der Wert steht rechts in einer Zeile; keiner von
 * beiden kappt auf Ellipse. Ein Wert, der breiter wäre als etwa die halbe
 * Zeile (mehr als 14 Zeichen), steht gestapelt: Label klein und gedämpft
 * darüber, Wert links darunter.
 *
 * @param zeilen     [{ label, wert, ton?, hinweis?, punkt?, gestapelt? }]
 *                   ton färbt den Wert (positiv/negativ/warnung/neutral);
 *                   punkt zeigt einen 8-px-Statuspunkt im Ton vor dem Wert;
 *                   hinweis hängt eine Kurzinfo direkt an den Labeltext
 * @param dicht      Zeilen mindestens 28 statt 34 px
 * @param gestapelt  alle Zeilen gestapelt (schmale Spalten)
 */
export function LabelWert({ zeilen = [], dicht = false, gestapelt = false }) {
  return (
    <div className="vg-labelwert" style={dicht ? { '--tafel-zeile': '28px' } : undefined}>
      {zeilen.map((z, i) => {
        const stapel = gestapelt || z.gestapelt || textLaenge(z.wert) > STAPEL_AB
        return (
          <div className="vg-labelwert-zeile" key={z.id ?? i} data-gestapelt={stapel || undefined}>
            <div className="vg-labelwert-label">
              <span>{z.label}</span>
              {/* Die Kurzinfo steht neben dem Text, nicht darin: der Text ist
                  auf zwei Zeilen geklammert (overflow hidden) und würde die
                  Blase kappen. */}
              {z.hinweis && <span className="vg-labelwert-info"><InfoTip text={z.hinweis} /></span>}
            </div>
            <div className="vg-labelwert-wert" data-ton={z.ton}>
              {z.punkt && <span className="vg-labelwert-punkt" aria-hidden="true" />}
              {z.wert ?? '–'}
            </div>
          </div>
        )
      })}
    </div>
  )
}

export default Tafel
