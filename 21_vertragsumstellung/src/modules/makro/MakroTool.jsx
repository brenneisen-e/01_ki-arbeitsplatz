import { Fragment, useState, useCallback, useEffect, useMemo, useRef } from 'react'
import VerhandlungsMarke from '../umstellung/VerhandlungsMarke'
import { erklaereReferenzvergleich, erklaereKumuliert } from '../../lib/erklaerung'
import { START_JAHR } from '../../lib/modell'
import { Scale, Check, ClipboardList, Building2, ChevronDown } from 'lucide-react'
import Eingaben from './Eingaben'
import Wirkungstafeln from './Wirkungstafeln'
import BausteinErklaerung from './BausteinErklaerung'
import { Btn, Badge, Hinweis } from '../../ui/basis'
import { Schublade } from '../../ui/Schublade'
import { budgetNeutralerWert, bonusSchwellen, KUMULIERT_BIS } from '../../lib/modell'
import { HEBEL_GRUPPEN, HEBEL, BONUS_SCHWELLE_IDS } from '../../lib/hebel'
import { SZENARIEN } from '../../lib/szenarien'
import { EINHEITEN, EINHEIT_INDEX, KANAL_LABEL, REFERENZZEITRAUM_TEXT } from '../../data/einheiten'
import { spartenPaare } from '../../charts'
import Steuerblock from '../../ui/Steuerblock'
import { formatiere, EINHEIT_ZEICHEN } from '../../ui/Regler'
import { ton, Farblegende } from '../../ui/Waage'
import { STATUS_INDEX } from '../../lib/fassung'
import './makro.css'

/**
 * SIMULATIONSKASTEN
 *
 * Eine Seite, kein geführter Fünfschritt: links der Steuerblock (Fassung,
 * heute / Zielmodell, Beispielhaus, Budgetneutralität, Beschlussvorlage),
 * rechts ein Raster aus Tafeln — oben die Eingaben (alle Stellhebel als
 * dichte Reglerzeilen, die Bonusstaffel als Tabelle), darunter die Wirkung
 * (Produktionszeilen des Portfolios und eines Beispielhauses, Bonusstaffel-
 * Verteilung, Verlauf). Alles rechnet sofort.
 */

const STANDARD_BEISPIELHAUS = 'osd'

// --------------------------------------------------- Szenarien

/** Kennung des Szenarios, dessen Hebelsatz exakt eingestellt ist — sonst null. */
function aktivesSzenario(hebel) {
  for (const s of SZENARIEN) {
    const gleich = HEBEL.every(h => Math.abs((hebel[h.id] ?? h.standard) - (s.hebel[h.id] ?? h.standard)) < 1e-6)
    if (gleich) return s.id
  }
  return null
}

/**
 * Nächstes Szenario in Pfeilrichtung. Ist keines exakt eingestellt (nach
 * einem Reglerzug), springt der erste Tastendruck zum nächstgelegenen —
 * gemessen über den normierten Reglerweg —, damit die Knöpfe einen kurzen
 * Weg gleiten statt quer über die Tafel.
 */
function naechstesSzenario(hebel, richtung) {
  const aktiv = aktivesSzenario(hebel)
  let i
  if (aktiv) {
    i = SZENARIEN.findIndex(s => s.id === aktiv) + richtung
  } else {
    let best = 0, bestAbstand = Infinity
    SZENARIEN.forEach((s, idx) => {
      const abstand = HEBEL.reduce((a, h) => {
        const spanne = h.max - h.min || 1
        const d = ((hebel[h.id] ?? h.standard) - (s.hebel[h.id] ?? h.standard)) / spanne
        return a + d * d
      }, 0)
      if (abstand < bestAbstand) { bestAbstand = abstand; best = idx }
    })
    i = best
  }
  if (i < 0 || i >= SZENARIEN.length) return null
  return SZENARIEN[i]
}

function Szenarienleiste({ hebel, onSetzen }) {
  const aktiv = useMemo(() => aktivesSzenario(hebel), [hebel])
  return (
    <div className="vg-szenarien" role="group" aria-label="Szenario">
      <span className="vg-szenarien-label">Szenario</span>
      {SZENARIEN.map(s => (
        <button
          key={s.id}
          type="button"
          className={`vg-btn vg-btn-sm${aktiv === s.id ? ' vg-btn-primaer' : ''}`}
          aria-pressed={aktiv === s.id}
          onClick={() => onSetzen(s.hebel)}
          title={s.beschreibung}
        >
          {aktiv === s.id && <Check size={12} strokeWidth={2.6} />}
          {s.kurz}
        </button>
      ))}
    </div>
  )
}

// --------------------------------------------------- Steuerblock

/** Einheiten nach Kanal gruppiert, je Gruppe alphabetisch — für die Auswahl */
const HAUS_GRUPPEN = ['sparkasse', 'ao', 'direkt']
  .map(kanal => ({
    kanal,
    label: KANAL_LABEL[kanal] || kanal,
    einheiten: EINHEITEN.filter(e => e.kanal === kanal).slice().sort((a, b) => a.name.localeCompare(b.name, 'de')),
  }))
  .filter(g => g.einheiten.length > 0)

function BeispielhausAuswahl({ wert, onWaehle }) {
  return (
    <label className="vg-kasten-auswahl">
      <span className="vg-label">Beispielhaus</span>
      <span className="vg-kasten-auswahl-feld">
        <select className="vg-feld" value={wert} onChange={e => onWaehle(e.target.value)} aria-label="Beispielhaus wählen">
          {HAUS_GRUPPEN.map(g => (
            <optgroup key={g.kanal} label={g.label}>
              {g.einheiten.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
            </optgroup>
          ))}
        </select>
        <ChevronDown size={14} strokeWidth={2} aria-hidden="true" />
      </span>
    </label>
  )
}

/**
 * Der dunkle Steuer- und Summenblock des Kastens: Fassung und Status oben,
 * darunter heute / Zielmodell mit den zwei Plaketten (dauerhaft und
 * Startjahr 2028), das Säulenpaar je Sparte und das Barwert-Signal; in den
 * Einstellungen die Wahl des Beispielhauses und die Budgetneutralität, im
 * Fuß Beschlussvorlage und Übergabe in die Verhandlung.
 */
function SimulationSteuerblock({
  portfolio, fassungen, onNeutralstellen, hausId, onHaus, aufBeschluss, aufBaustein, navigiere,
}) {
  const jahr1 = portfolio.verlauf[0]
  const st = STATUS_INDEX[fassungen?.aktiv?.status]
  // Tooltips der Plaketten: aus den Zahlen des Portfolios erklärt
  const hebelAktiv = fassungen?.aktiv?.hebel || {}
  const lpDauer = Math.round(hebelAktiv.lpDauer || 12)
  const jahrVoll = START_JAHR + lpDauer - 1
  const tipReferenz = erklaereReferenzvergleich({ heute: portfolio.ist.gesamt, ziel: portfolio.ziel.gesamt, zeitraum: REFERENZZEITRAUM_TEXT, lpDauer, jahrVoll })
  const tipKumuliert = erklaereKumuliert({
    kumuliert: portfolio.kumuliert, verlauf: portfolio.verlauf, heute: portfolio.ist.gesamt, zielReferenz: portfolio.ziel.gesamt,
    diskontsatz: hebelAktiv.diskontsatz ?? 5, lpDauer, jahrVoll,
  })
  return (
    <Steuerblock
      oben="Fassung"
      titel={fassungen?.aktiv?.name || 'Zielmodell'}
      marken={st && <Badge ton={st.ton}>{st.label}</Badge>}
      heute={portfolio.ist.gesamt}
      ziel={portfolio.ziel.gesamt}
      zeitraum={REFERENZZEITRAUM_TEXT}
      deltaLabel="Vergleich Referenzzeitraum*"
      deltaTip={tipReferenz}
      deltaTonWert={ton(portfolio.delta.prozent)}
      zielMarke={<VerhandlungsMarke fassung={fassungen?.aktiv} hebel={fassungen?.aktiv?.hebel} />}
      zweiteSumme={{
        label: `kumuliert bis ${KUMULIERT_BIS} (Barwert)`,
        tip: tipKumuliert,
        heute: portfolio.kumuliert.heute,
        ziel: portfolio.kumuliert.ziel,
        ton: ton(portfolio.kumuliert.prozent),
      }}
      kompakt
      paare={spartenPaare(portfolio.ist, portfolio.ziel)}
      zahlersicht
      aufPaar={aufBaustein ? (paar) => aufBaustein(paar.id) : undefined}
      paareHinweis="Leben, Komposit, Bonus oder Zuschüsse anklicken: so kommt die Zahl zustande"
      signale={[
        { label: 'barwertig je Jahrgang', prozent: portfolio.barwert.prozent, ton: ton(portfolio.barwert.prozent) },
      ]}
      einstellungen={
        <>
          <BeispielhausAuswahl wert={hausId} onWaehle={onHaus} />
          <Btn
            ikone={Scale}
            onClick={() => onNeutralstellen('apLeben')}
            title="Abschlussprovision Leben so setzen, dass das Zielmodell im Referenzzeitraum genau die heutige Vergütung trifft"
          >
            Referenzvergleich auf null stellen
          </Btn>
          <Farblegende zahlersicht />
        </>
      }
      fuss={
        <>
          <Btn ikone={ClipboardList} onClick={aufBeschluss}>Beschlussvorlage</Btn>
          <Btn variante="primaer" ikone={Building2} onClick={() => navigiere('umstellung')}>
            In die Verhandlung übernehmen
          </Btn>
        </>
      }
    />
  )
}

// --------------------------------------------------- Beschlussvorlage

/** „34,0 ‰“, „8 Jahre“ — in der Nachkommazahl des Reglers. */
function wertMitEinheit(wert, def) {
  return `${formatiere(wert, def)} ${EINHEIT_ZEICHEN[def.einheit] ?? ''}`.trim()
}

/** Absolute Veränderung mit Vorzeichen: „+0,75 ‰“, „−8 Jahre“, „+38 %-Punkte“. */
function veraenderungText(heute, ziel, def) {
  const d = ziel - heute
  const vz = d > 0 ? '+' : d < 0 ? '−' : '±'
  if (def.einheit === 'schalter') return formatiere(ziel, def)
  const einheit = def.einheit === 'anteil' || def.einheit === 'prozent'
    ? '%-Punkte'
    : (EINHEIT_ZEICHEN[def.einheit] ?? '')
  return `${vz}${formatiere(Math.abs(d), def)} ${einheit}`.trim()
}

/** Ton wie das Regler-Abzeichen: teurer wird Warnung, günstiger wird positiv. */
function veraenderungTon(heute, ziel, def) {
  const d = ziel - heute
  if (def.richtung === 'neutral' || Math.abs(d) < 1e-9) return 'neutral'
  return (d > 0) === (def.richtung === 'hoch-teurer') ? 'warnung' : 'positiv'
}

/**
 * Die Entscheidungstabelle: alle Regler, die vom heutigen Modell abweichen,
 * nach Gruppen; darunter der Hinweis auf kritische Einheiten und die
 * Begründung für das Gremium. Liegt in der Schublade „Beschlussvorlage“.
 */
function Beschlussvorlage({ portfolio, hebel, fassungen }) {
  const gruppen = useMemo(() => {
    // Schwellen der Staffel stehen so in der Vorlage, wie die Engine sie
    // rechnet (aufsteigend geklemmt) — nicht als roher Hebelwert, damit die
    // Vorlage dieselbe Zahl trägt wie die Staffeltabelle.
    const schwellen = bonusSchwellen(hebel)
    const zielWert = (def) => {
      const i = BONUS_SCHWELLE_IDS.indexOf(def.id)
      return i >= 0 ? schwellen[i] : (hebel[def.id] ?? def.standard)
    }
    const aenderungen = HEBEL
      .map(def => ({ def, heute: def.basis, ziel: zielWert(def) }))
      .filter(x => Math.abs(x.heute - x.ziel) > 1e-9)
    return HEBEL_GRUPPEN
      .map(g => ({ gruppe: g, zeilen: aenderungen.filter(a => a.def.gruppe === g.id) }))
      .filter(g => g.zeilen.length > 0)
  }, [hebel])

  const kritische = portfolio.ergebnisse.filter(e => e.delta.prozent < -8)

  return (
    <div className="vg-stapel">
      <h4 className="vg-t-lg vg-stark" style={{ margin: 0 }}>Änderungen gegenüber dem heutigen Modell</h4>
      <div className="vg-tabelle-rahmen">
        <table className="vg-tabelle vg-tabelle-eng">
          <thead>
            <tr>
              <th>Regler</th>
              <th data-num="true">heute</th><th data-num="true">Zielmodell</th><th data-num="true">Veränderung</th>
            </tr>
          </thead>
          <tbody>
            {gruppen.map(({ gruppe, zeilen }) => (
              <Fragment key={gruppe.id}>
                <tr className="vg-gruppe"><td colSpan={4}>{gruppe.titel}</td></tr>
                {zeilen.map(a => (
                  <tr key={a.def.id}>
                    <td className="vg-erste-spalte">{a.def.label}</td>
                    <td data-num="true" className="vg-mono">{wertMitEinheit(a.heute, a.def)}</td>
                    <td data-num="true" className="vg-mono vg-stark">{wertMitEinheit(a.ziel, a.def)}</td>
                    <td data-num="true">
                      <span className="vg-delta" data-ton={veraenderungTon(a.heute, a.ziel, a.def)}>
                        {veraenderungText(a.heute, a.ziel, a.def)}
                      </span>
                    </td>
                  </tr>
                ))}
              </Fragment>
            ))}
            {gruppen.length === 0 && (
              <tr><td colSpan={4} className="vg-schwach">Kein Regler weicht vom heutigen Modell ab.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {kritische.length > 0 && (
        <Hinweis ton="warnung">
          <strong>{kritische.length} Einheiten verlieren mehr als 8 Prozent.</strong> Sie sind einzeln zu
          verhandeln: {kritische.slice(0, 5).map(e => e.einheit.kurz || e.einheit.name).join(', ')}
          {kritische.length > 5 ? ` und ${kritische.length - 5} weitere` : ''}.
        </Hinweis>
      )}

      <div>
        <label className="vg-label" htmlFor="vorlage-notiz">Begründung für das Gremium</label>
        <textarea
          id="vorlage-notiz"
          className="vg-feld"
          rows={4}
          value={fassungen.aktiv?.notiz || ''}
          onChange={e => fassungen.aendereFassung(fassungen.aktiv.id, { notiz: e.target.value })}
          placeholder="Warum ist dieses Modell die richtige Wahl? Welche Alternativen wurden verworfen?"
        />
      </div>
    </div>
  )
}

// --------------------------------------------------- Hauptkomponente

export default function MakroTool({ portfolio, hebel, fassungen, navigiere, beispielhausId }) {
  const [hausId, setHausId] = useState(() => (
    beispielhausId && EINHEIT_INDEX[beispielhausId] ? beispielhausId : STANDARD_BEISPIELHAUS))
  const [beschlussOffen, setBeschlussOffen] = useState(false)
  const [baustein, setBaustein] = useState(null)   // Erklärungs-Schublade zu Leben, Komposit, Bonus, Zuschüsse

  // Ein über die Route gesetztes Haus (#/simulation?haus=lpz) gewinnt
  useEffect(() => {
    if (beispielhausId && EINHEIT_INDEX[beispielhausId]) setHausId(beispielhausId)
  }, [beispielhausId])

  const beispielhaus = EINHEIT_INDEX[hausId] || EINHEIT_INDEX[STANDARD_BEISPIELHAUS] || EINHEITEN[0]

  const onAendern = useCallback((id, wert) => {
    if (id === null) fassungen.setzeHebel(wert)
    else fassungen.aendereHebel(id, wert)
  }, [fassungen])

  // Neutral gestellt wird die Leitzahl: das Zielmodell im Referenzzeitraum
  // (delta), nicht der Barwert je Jahrgang — sonst stünde nach dem Klick
  // „−0,0 % barwertig“ neben „+14,6 % im Referenzzeitraum“.
  const onNeutralstellen = useCallback((id) => {
    const wert = budgetNeutralerWert(EINHEITEN, hebel, id, { zielGroesse: 'delta' })
    if (wert != null) fassungen.aendereHebel(id, wert)
  }, [hebel, fassungen])

  // Pfeil links/rechts außerhalb von Eingabefeldern wechselt das Szenario —
  // für den Presenter, der keinen Regler zieht. Ein fokussierter Regler ist
  // ein Input und behält seine Pfeiltasten.
  useEffect(() => {
    const auf = (e) => {
      if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return
      if (e.metaKey || e.ctrlKey || e.altKey) return
      const el = e.target
      if (/^(INPUT|TEXTAREA|SELECT)$/.test(el?.tagName) || el?.isContentEditable) return
      const ziel = naechstesSzenario(hebel, e.key === 'ArrowRight' ? 1 : -1)
      if (!ziel) return
      e.preventDefault()
      fassungen.setzeHebel(ziel.hebel)
    }
    document.addEventListener('keydown', auf)
    return () => document.removeEventListener('keydown', auf)
  }, [hebel, fassungen])

  // Der Kopf mit der Szenarienleiste klebt unter der Kontextleiste (CSS in
  // makro.css). Der Steuerblock rückt um die gemessene Kopfhöhe nach unten
  // (--vg-d-kopf), und sobald die Seite scrollt, trägt der Kopf eine
  // Schattenkante gegen den darunter laufenden Inhalt.
  const kopfRef = useRef(null)
  const [kopfHoehe, setKopfHoehe] = useState(0)
  const [kopfHaftet, setKopfHaftet] = useState(false)
  useEffect(() => {
    const el = kopfRef.current
    if (!el) return undefined
    const messen = () => setKopfHoehe(el.offsetHeight)
    messen()
    const beobachter = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(messen) : null
    beobachter?.observe(el)
    const auf = () => setKopfHaftet(window.scrollY > 2)
    auf()
    window.addEventListener('scroll', auf, { passive: true })
    window.addEventListener('resize', messen)
    return () => {
      beobachter?.disconnect()
      window.removeEventListener('scroll', auf)
      window.removeEventListener('resize', messen)
    }
  }, [])

  return (
    <div className="vg-stapel vg-kasten" style={{ '--vg-d-kopf': `${kopfHoehe}px` }}>
      <div ref={kopfRef} className="vg-seitenkopf vg-kasten-kopf" data-haftet={kopfHaftet || undefined}>
        <div className="vg-seitenkopf-titel">
          <h2>Simulationskasten</h2>
          <span className="vg-seitenkopf-unter">
            Alle Stellhebel, sofort gerechnet — Gesamtportfolio und Beispielhaus
          </span>
        </div>
        <div className="vg-seitenkopf-aktionen">
          <Szenarienleiste hebel={hebel} onSetzen={(h) => fassungen.setzeHebel(h)} />
        </div>
      </div>

      <div className="vg-buehne-ein">
        <div className="vg-buehne">
          <SimulationSteuerblock
            portfolio={portfolio}
            fassungen={fassungen}
            onNeutralstellen={onNeutralstellen}
            hausId={beispielhaus.id}
            onHaus={setHausId}
            aufBeschluss={() => setBeschlussOffen(true)}
            aufBaustein={(id) => { setBeschlussOffen(false); setBaustein(id) }}
            navigiere={navigiere}
          />

          <div className="vg-tafeln vg-kasten-tafeln">
            <Eingaben
              hebel={hebel}
              onAendern={onAendern}
              onNeutralstellen={onNeutralstellen}
              portfolio={portfolio}
            />
            <Wirkungstafeln
              portfolio={portfolio}
              hebel={hebel}
              beispielhaus={beispielhaus}
              navigiere={navigiere}
            />
          </div>
        </div>
      </div>

      <Schublade
        offen={beschlussOffen}
        onSchliessen={() => setBeschlussOffen(false)}
        titel="Beschlussvorlage"
        unter={`Fassung „${fassungen.aktiv?.name}“ · automatisch aus dem eingestellten Modell erzeugt`}
        nichtModal
        breite="verhandlung"
        fuss={
          <>
            <Btn onClick={() => fassungen.aendereFassung(fassungen.aktiv.id, { status: 'abstimmung' })}>
              Zur Abstimmung stellen
            </Btn>
            <Btn variante="primaer" ikone={Building2} onClick={() => navigiere('umstellung')}>
              In die Verhandlung übernehmen
            </Btn>
          </>
        }
      >
        <Beschlussvorlage portfolio={portfolio} hebel={hebel} fassungen={fassungen} />
      </Schublade>

      <BausteinErklaerung
        baustein={baustein}
        portfolio={portfolio}
        hebel={hebel}
        onSchliessen={() => setBaustein(null)}
      />
    </div>
  )
}
