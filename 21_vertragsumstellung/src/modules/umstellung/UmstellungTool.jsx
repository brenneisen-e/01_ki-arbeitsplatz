import { useState, useMemo, useCallback, useEffect } from 'react'
import {
  Search, LayoutGrid, Table2, ScatterChart as ScatterIkone, Building2, ArrowLeft,
  GitCompare, Filter,
} from 'lucide-react'
import { Karte, KarteKopf, KarteKoerper, KarteFuss, Delta, Btn, Segment, Leer } from '../../ui/basis'
import Tabelle from '../../ui/Tabelle'
import Steuerblock from '../../ui/Steuerblock'
import { ton, Farblegende } from '../../ui/Waage'
import { Verteilung, spartenPaare } from '../../charts'
import { mitUebergang } from '../../lib/bewegung'
import { KUMULIERT_BIS } from '../../lib/modell'
import Institutsakte from './Institutsakte'
import Vergleich from './Vergleich'
import Weg from './Weg'
import { KANAL_KURZ, REFERENZZEITRAUM_TEXT, einheit as findeEinheit } from '../../data/einheiten'
import { euro, euroKompakt, prozentDelta } from '../../lib/format'
import { STATUS_LABEL } from './verhandlung'
import './umstellung.css'

const ANSICHTEN = [
  { id: 'streu', label: 'Verteilung', ikone: ScatterIkone },
  { id: 'tabelle', label: 'Tabelle', ikone: Table2 },
  { id: 'kacheln', label: 'Kacheln', ikone: LayoutGrid },
]

const KANAELE = [
  { id: 'alle', label: 'Alle Wege' },
  { id: 'sparkasse', label: 'Sparkassen' },
  { id: 'ao', label: 'Agenturen' },
  { id: 'direkt', label: 'Direkt' },
]

const AMPEL_STUFEN = [
  { id: 'gewinner', label: 'Gewinner' },
  { id: 'neutral', label: 'Neutral' },
  { id: 'beobachten', label: 'Beobachten' },
  { id: 'kritisch', label: 'Kritisch' },
]

/** Vergütungsbausteine, die das Mini-Säulenpaar je Sparte braucht. */
const KOMPONENTEN = ['apLeben', 'apKomposit', 'lp', 'bpLeben', 'bpKomposit', 'bonus', 'zuschuesse']

/** Ab dieser heutigen Vergütung nimmt eine Kachel zwei Fächer. */
const GROSS_AB = 5_000_000

/** Grundskala des Wegbalkens (±30 %); ein Ausreißer weitet sie auf volle 5 %. */
const WEG_GRUNDSKALA = 30

const FARBE_AMPEL = {
  gewinner: 'var(--vg-positiv-flaeche)',
  neutral: 'var(--vg-neutral-flaeche)',
  beobachten: 'var(--vg-warnung-flaeche)',
  kritisch: 'var(--vg-negativ-flaeche)',
}

// --------------------------------------------------- Hilfen

function summiere(ergebnisse, seite) {
  const s = { gesamt: 0 }
  for (const k of KOMPONENTEN) s[k] = 0
  for (const e of ergebnisse) {
    s.gesamt += e[seite].gesamt
    for (const k of KOMPONENTEN) s[k] += e[seite][k] || 0
  }
  return s
}

function median(werte) {
  if (!werte.length) return 0
  const s = [...werte].sort((a, b) => a - b)
  const m = Math.floor(s.length / 2)
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2
}

function statusVon(e) {
  return STATUS_LABEL[e.einheit.verhandlung?.status || 'nicht_begonnen']
}

/** Verteilungshöhe clamp(420, 46vh, 520) — aus der Fensterhöhe, nicht aus dem Inhalt. */
function useVerteilungsHoehe() {
  const messen = () => (typeof window === 'undefined'
    ? 480
    : Math.round(Math.max(420, Math.min(520, window.innerHeight * 0.46))))
  const [hoehe, setHoehe] = useState(messen)
  useEffect(() => {
    const auf = () => setHoehe(messen())
    window.addEventListener('resize', auf)
    return () => window.removeEventListener('resize', auf)
  }, [])
  return hoehe
}

/**
 * „8,7 → 9,3 Mio. EUR“: Teilen sich beide Beträge die Größenordnung, trägt nur
 * der Zielwert die Einheit; sonst bleiben beide vollständig („843 Tsd. → 1,1 Mio. EUR“).
 */
function Spanne({ ist, ziel, zielKlasse }) {
  const a = euroKompakt(ist, { einheit: false })
  const b = euroKompakt(ziel, { einheit: false })
  const stufe = (s) => (s.match(/(Mrd\.|Mio\.|Tsd\.)$/) || [])[1] || ''
  const vorn = stufe(a) === stufe(b) ? a.replace(/ (Mrd\.|Mio\.|Tsd\.)$/, '') : euroKompakt(ist)
  return (
    <>
      {vorn} <span className="vg-pfeil" aria-label="wird zu" /> <span className={zielKlasse}>{euroKompakt(ziel)}</span>
    </>
  )
}

// --------------------------------------------------- Kachel

function Kachel({ e, index, skala, gedimmt, aufKlick }) {
  const st = statusVon(e)
  return (
    <button
      type="button"
      className="vg-karte vg-kachel vg-buehne-ein"
      data-gross={e.ist.gesamt >= GROSS_AB ? 'true' : undefined}
      data-gedimmt={gedimmt ? 'true' : undefined}
      style={{ animationDelay: `${Math.min(index * 18, 300)}ms` }}
      title={e.einheit.name}
      onClick={aufKlick}
    >
      <span className="vg-kachel-kopf">
        <span>{e.einheit.kurz || e.einheit.name}</span>
        <span className={`vg-ampel-punkt vg-ampel-${e.ampel}`} />
      </span>
      <Weg prozent={e.delta.prozent} uebergang={e.uebergang.prozent} skala={skala} />
      <span className="vg-kachel-betrag">
        <span><Spanne ist={e.ist.gesamt} ziel={e.ziel.gesamt} zielKlasse="vg-kachel-ziel" /></span>
        <Delta prozent={e.delta.prozent} nurProzent />
      </span>
      <span className="vg-kachel-stand" data-ton={st.ton}>
        <span className="vg-punkt" />
        {st.label}
      </span>
    </button>
  )
}

// --------------------------------------------------- Ränder des Portfolios

/** Eine Zeile der Ränder-Liste; Hover und Fokus heben den Ring in der Verteilung hervor. */
function RandZeile({ e, skala, aufHervor, aufKlick }) {
  return (
    <li>
      <button
        type="button"
        className="vg-raender-zeile"
        onMouseEnter={() => aufHervor(e.einheit.id)}
        onMouseLeave={() => aufHervor(null)}
        onFocus={() => aufHervor(e.einheit.id)}
        onBlur={() => aufHervor(null)}
        onClick={aufKlick}
        title={e.einheit.name}
      >
        <span className="vg-kappen">{e.einheit.kurz || e.einheit.name}</span>
        <Weg prozent={e.delta.prozent} uebergang={e.uebergang.prozent} skala={skala} breite={120} />
        <Delta prozent={e.delta.prozent} nurProzent />
      </button>
    </li>
  )
}

// --------------------------------------------------- Steuerblock des Lagebilds

/**
 * Links steht die Summe des Kanalfilters: heute, Zielmodell, dauerhaft —
 * und bei „Alle Wege“ auch die kumulierte Sicht bis 2030, weil der
 * kassenwirksame Verlauf nur für das ganze Portfolio gerechnet ist. Darunter Kanal-Segment und die
 * vier Ampel-Chips, die zugleich Legende und Hervorhebung sind.
 */
function LageSteuerblock({
  portfolio, fassungen, gefiltert, kanal, aufKanal, hervorAmpel, aufHervorAmpel, aufVergleich, vergleichbar,
}) {
  const ist = useMemo(() => summiere(gefiltert, 'ist'), [gefiltert])
  const ziel = useMemo(() => summiere(gefiltert, 'ziel'), [gefiltert])
  const zaehler = useMemo(() => {
    const z = { gewinner: 0, neutral: 0, beobachten: 0, kritisch: 0 }
    for (const e of gefiltert) z[e.ampel] = (z[e.ampel] || 0) + 1
    return z
  }, [gefiltert])

  const alle = kanal === 'alle'
  const jahr1 = portfolio.verlauf[0]
  const deltaProzent = ist.gesamt > 0 ? ((ziel.gesamt - ist.gesamt) / ist.gesamt) * 100 : 0
  // Das ganze Portfolio wird am Budget gemessen — Zahlersicht wie in der
  // Simulation; ein einzelner Weg an seinem Vorzeichen (wie die Akte).
  const tonDauerhaft = alle ? ton(deltaProzent) : undefined

  return (
    <Steuerblock
      oben="Umstellungstool"
      titel={`${gefiltert.length} Einheiten`}
      unter={fassungen?.aktiv?.name}
      heute={ist.gesamt}
      ziel={ziel.gesamt}
      zeitraum={REFERENZZEITRAUM_TEXT}
      deltaLabel="Vergleich Referenzzeitraum*"
      deltaTonWert={tonDauerhaft}
      zweiteSumme={alle ? {
        label: `kumuliert bis ${KUMULIERT_BIS} (Barwert)`,
        heute: portfolio.kumuliert.heute,
        ziel: portfolio.kumuliert.ziel,
        ton: ton(portfolio.kumuliert.prozent),
      } : undefined}
      kompakt
      paare={spartenPaare(ist, ziel)}
      zahlersicht={alle}
      signale={alle ? [
        { label: 'barwertig je Jahrgang', prozent: portfolio.barwert.prozent, ton: ton(portfolio.barwert.prozent) },
      ] : undefined}
      einstellungen={
        <>
          <div className="vg-lage-kanal">
            <Segment wert={kanal} onWaehle={aufKanal} klein optionen={KANAELE} />
          </div>
          <div className="vg-lage-chips" role="group" aria-label="Ampelstufe hervorheben">
            {AMPEL_STUFEN.map(s => (
              <button
                key={s.id}
                type="button"
                className="vg-legende-chip"
                aria-pressed={hervorAmpel === s.id}
                onClick={() => aufHervorAmpel(hervorAmpel === s.id ? null : s.id)}
              >
                <span className={`vg-ampel-punkt vg-ampel-${s.id}`} />
                {zaehler[s.id]} {s.label}
              </button>
            ))}
          </div>
          {alle && <Farblegende />}
        </>
      }
      fuss={
        <Btn ikone={GitCompare} onClick={aufVergleich} disabled={!vergleichbar}
          title="Die drei volumenstärksten Häuser des Filters nebeneinander">
          Vergleichen
        </Btn>
      }
    />
  )
}

// --------------------------------------------------- Lagebild

function Lagebild({ portfolio, fassungen, navigiere, onPalette }) {
  const [ansicht, setAnsichtRoh] = useState('streu')
  const [kanal, setKanal] = useState('alle')
  const [hervorAmpel, setHervorAmpel] = useState(null)
  const [hervorId, setHervorId] = useState(null)
  const hoehe = useVerteilungsHoehe()

  const setAnsicht = useCallback((id) => { mitUebergang(() => setAnsichtRoh(id)) }, [])

  // Volumensortiert: Dresden zuerst, Rico Pfeiffer zuletzt — in jeder Ansicht.
  const gefiltert = useMemo(
    () => portfolio.ergebnisse
      .filter(e => kanal === 'alle' || e.einheit.kanal === kanal)
      .sort((a, b) => b.ist.gesamt - a.ist.gesamt),
    [portfolio, kanal])

  const summe = useMemo(() => ({
    ist: gefiltert.reduce((s, e) => s + e.ist.gesamt, 0),
    ziel: gefiltert.reduce((s, e) => s + e.ziel.gesamt, 0),
  }), [gefiltert])

  // Skala des Wegbalkens aus dem GANZEN Portfolio, damit sie beim Filtern steht.
  const skala = useMemo(() => {
    const max = Math.max(...portfolio.ergebnisse.map(e => Math.abs(e.delta.prozent)), 0)
    return Math.max(WEG_GRUNDSKALA, Math.ceil(max / 5) * 5)
  }, [portfolio])

  const medianProzent = useMemo(() => median(gefiltert.map(e => e.delta.prozent)), [gefiltert])

  const raender = useMemo(() => {
    const s = [...gefiltert].sort((a, b) => a.delta.prozent - b.delta.prozent)
    return { rueckgaenge: s.slice(0, 5), zuwaechse: s.slice(5).slice(-5).reverse() }
  }, [gefiltert])

  // „Vergleichen“: die drei volumenstärksten Sparkassen des Filters (Dresden,
  // Leipzig, Erzgebirge); zeigt der Filter keine zwei Sparkassen, die größten
  // Einheiten des Filters außer dem Direktkanal.
  const vergleichIds = useMemo(() => {
    const sparkassen = gefiltert.filter(e => e.einheit.kanal === 'sparkasse')
    const basis = sparkassen.length >= 2 ? sparkassen : gefiltert.filter(e => e.einheit.kanal !== 'direkt')
    return basis.slice(0, 3).map(e => e.einheit.id)
  }, [gefiltert])

  const gedimmt = (e) => Boolean(hervorAmpel && e.ampel !== hervorAmpel)

  // Hervorhebung einer Ampelstufe: die anderen Ringe treten zurück, statt zu
  // verschwinden — das Bild springt nicht.
  const ampelFarbe = useMemo(() => {
    if (!hervorAmpel) return FARBE_AMPEL
    return Object.fromEntries(Object.entries(FARBE_AMPEL).map(([k, farbe]) => [
      k, k === hervorAmpel ? farbe : `color-mix(in srgb, ${farbe} 28%, transparent)`,
    ]))
  }, [hervorAmpel])

  const zelle = (e, inhalt) => (
    <span className="vg-lage-zelle" data-gedimmt={gedimmt(e) ? 'true' : undefined}>{inhalt}</span>
  )

  const spalten = [
    {
      id: 'name', label: 'Einheit', wert: e => e.einheit.name,
      zelle: e => {
        const st = statusVon(e)
        return zelle(e, (
          <span className="vg-lage-einheit">
            <span className="vg-stark vg-kappen">{e.einheit.name}</span>
            <span className="vg-lage-einheit-unter" data-ton={st.ton}>
              <span className="vg-punkt" />
              {KANAL_KURZ[e.einheit.kanal]} · {st.label}{e.einheit.verhandlung?.beiratsmitglied ? ' · Beirat' : ''}
            </span>
          </span>
        ))
      },
    },
    { id: 'ist', label: 'heute', num: true, wert: e => e.ist.gesamt, zelle: e => zelle(e, euro(e.ist.gesamt)) },
    { id: 'ziel', label: 'Zielmodell', num: true, wert: e => e.ziel.gesamt, zelle: e => zelle(e, <span className="vg-stark">{euro(e.ziel.gesamt)}</span>) },
    {
      id: 'weg', label: 'Veränderung', breite: 172, sortierbar: false,
      titel: 'Weg von heute zum Zielmodell auf der Skala des ganzen Portfolios; die hohle Marke zeigt die Kappung 2028',
      zelle: e => zelle(e, (
        <span className="vg-lage-weg">
          <Weg prozent={e.delta.prozent} uebergang={e.uebergang.prozent} skala={skala} breite={140} />
        </span>
      )),
    },
    {
      id: 'delta', label: 'gegenüber heute', num: true, wert: e => e.delta.prozent,
      zelle: e => zelle(e, <Delta prozent={e.delta.prozent} nurProzent />),
    },
  ]

  const verteilungPunkte = useMemo(() => gefiltert.map(e => ({
    id: e.einheit.id, name: e.einheit.name, kurz: e.einheit.kurz || e.einheit.name,
    basis: e.ist.gesamt, ziel: e.ziel.gesamt,
    delta: e.delta.prozent, groesse: e.einheit.produktion.lebenBs, ampel: e.ampel,
  })), [gefiltert])

  return (
    <div className="vg-buehne">
      <LageSteuerblock
        portfolio={portfolio}
        fassungen={fassungen}
        gefiltert={gefiltert}
        kanal={kanal}
        aufKanal={setKanal}
        hervorAmpel={hervorAmpel}
        aufHervorAmpel={setHervorAmpel}
        vergleichbar={vergleichIds.length >= 2}
        aufVergleich={() => navigiere(`umstellung/vergleich/${vergleichIds.join(',')}`)}
      />

      <div className="vg-stapel">
        <div className="vg-lage-werkzeuge">
          <Segment wert={ansicht} onWaehle={setAnsicht} optionen={ANSICHTEN} />
          {onPalette && (
            <Btn variante="still" nurIkone ikone={Search} onClick={onPalette}
              aria-label="Einheit suchen" title="Einheit suchen · Strg K" />
          )}
        </div>

        <div key={ansicht} className="vg-buehne-ein vg-stapel">
          {ansicht === 'streu' && (
            <>
              <Karte>
                <KarteKoerper>
                  <Verteilung
                    punkte={verteilungPunkte}
                    hoehe={hoehe}
                    hervorgehoben={hervorId}
                    ampelFarbe={ampelFarbe}
                    aufPunkt={p => navigiere(`umstellung/${p.id}`)}
                  />
                </KarteKoerper>
                <KarteFuss>
                  <span>Median {prozentDelta(medianProzent)} über {gefiltert.length} Einheiten</span>
                  <span>Waagerecht die Veränderung, senkrecht die Vergütung heute, Fläche das Neugeschäft — ein Klick öffnet die Akte</span>
                </KarteFuss>
              </Karte>

              <Karte className="vg-raender">
                <KarteKopf
                  titel="Ränder des Portfolios"
                  unter="Fünf stärkste Rückgänge und Zuwächse auf derselben Skala wie jede Kachel"
                />
                <KarteKoerper eng>
                  <div className="vg-raender-spalten">
                    <ul aria-label="Größte Rückgänge">
                      <li className="vg-raender-titel">Rückgänge</li>
                      {raender.rueckgaenge.map(e => (
                        <RandZeile key={e.einheit.id} e={e} skala={skala} aufHervor={setHervorId}
                          aufKlick={() => navigiere(`umstellung/${e.einheit.id}`)} />
                      ))}
                    </ul>
                    <ul aria-label="Größte Zuwächse">
                      <li className="vg-raender-titel">Zuwächse</li>
                      {raender.zuwaechse.map(e => (
                        <RandZeile key={e.einheit.id} e={e} skala={skala} aufHervor={setHervorId}
                          aufKlick={() => navigiere(`umstellung/${e.einheit.id}`)} />
                      ))}
                    </ul>
                  </div>
                </KarteKoerper>
              </Karte>
            </>
          )}

          {ansicht === 'tabelle' && (
            <Tabelle
              klasse="vg-tabelle-lage"
              spalten={spalten}
              zeilen={gefiltert}
              schluessel={e => e.einheit.id}
              standardSortierung={{ id: 'ist', richtung: 'ab' }}
              aufZeile={e => navigiere(`umstellung/${e.einheit.id}`)}
              fusszeile={{
                name: `${gefiltert.length} Einheiten`,
                ist: euro(summe.ist),
                ziel: euro(summe.ziel),
                weg: '',
                delta: <Delta prozent={summe.ist > 0 ? ((summe.ziel - summe.ist) / summe.ist) * 100 : 0} nurProzent />,
              }}
            />
          )}

          {ansicht === 'kacheln' && (
            gefiltert.length === 0
              ? <Leer titel="Keine Einheit in diesem Weg" text="Einen anderen Vertriebsweg wählen." ikone={Filter} />
              : (
                <div className="vg-raster-kacheln">
                  {gefiltert.map((e, i) => (
                    <Kachel
                      key={e.einheit.id}
                      e={e}
                      index={i}
                      skala={skala}
                      gedimmt={gedimmt(e)}
                      aufKlick={() => navigiere(`umstellung/${e.einheit.id}`)}
                    />
                  ))}
                </div>
              )
          )}
        </div>
      </div>
    </div>
  )
}

// --------------------------------------------------- Einstieg

export default function UmstellungTool({ portfolio, hebel, fassungen, navigiere, einheitId, route, onPalette }) {
  if (einheitId === 'vergleich') {
    const ids = (route?.unter || '').split(',').filter(Boolean)
    return <Vergleich ids={ids} portfolio={portfolio} hebel={hebel} navigiere={navigiere} />
  }

  const einheit = einheitId ? findeEinheit(einheitId) : null

  if (einheitId && !einheit) {
    return (
      <Leer
        titel="Einheit nicht gefunden"
        text="Diese Kennung gehört zu keiner Vertriebseinheit im Portfolio."
        ikone={Building2}
        aktion={<Btn ikone={ArrowLeft} onClick={() => navigiere('umstellung')}>Zurück zum Lagebild</Btn>}
      />
    )
  }

  if (einheit) {
    return (
      <Institutsakte
        einheit={einheit}
        portfolio={portfolio}
        hebel={hebel}
        fassungen={fassungen}
        navigiere={navigiere}
      />
    )
  }

  return <Lagebild portfolio={portfolio} fassungen={fassungen} navigiere={navigiere} onPalette={onPalette} />
}
