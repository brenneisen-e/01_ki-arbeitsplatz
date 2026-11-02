import { useState, useMemo, useCallback, useEffect } from 'react'
import { Plus, Check, RotateCcw } from 'lucide-react'
import { Karte, KarteKopf, KarteKoerper, Btn, InfoTip, Tip, useAnimierteZahl } from '../../ui/basis'
import ReglerZeile from '../../ui/Regler'
import { Schublade } from '../../ui/Schublade'
import { berechneEinzel, berechnePortfolio, KUMULIERT_BIS } from '../../lib/modell'
import { hebelDerGruppe } from '../../lib/hebel'
import { EINHEITEN } from '../../data/einheiten'
import { euro, euroKompakt, euroKompaktDelta, prozentDelta } from '../../lib/format'
import { ZUGESTAENDNISSE, hebelMitZugestaendnis, hebelOhneZugestaendnis } from './verhandlung'
import './verhandlungsmodus.css'

const DAUER_ZAHL = 420

/** Betrag ohne „EUR“ — die Zelle ist 84 px breit, die Einheit steht im Tip. */
const kompakt = v => euroKompakt(v, { einheit: false })
const kompaktDelta = v => euroKompaktDelta(v).replace(' EUR', '')

function tonJahr(prozentWert) {
  return prozentWert < -2 ? 'negativ' : prozentWert > 2 ? 'positiv' : 'warnung'
}

// --------------------------------------------------- Leiste

/**
 * Ein Wert der Leiste mit seinem Abstand zur Verhandlungsbasis (die Fassung
 * beim ersten Öffnen). Zahlen laufen in 420 ms nach, damit ein gezogener
 * Regler oder ein Haken hier sichtbar wirkt — auch wenn der Körper gescrollt ist.
 * `zahlersicht`: mehr ist Warnung (Budget), sonst Sicht des Hauses.
 */
function LeistenBlock({ label, wert, basis, tonWert, zahlersicht = false, kompaktWert = false }) {
  const w = useAnimierteZahl(wert, DAUER_ZAHL)
  const delta = wert - basis
  const wirkt = Math.abs(delta) > 1
  const ton = !wirkt ? 'neutral' : zahlersicht ? (delta > 0 ? 'warnung' : 'positiv') : (delta > 0 ? 'positiv' : 'negativ')
  return (
    <div className="vg-verh-block">
      <span className="vg-verh-block-label">{label}</span>
      <span className="vg-verh-block-wert" data-ton={tonWert}>{kompaktWert ? euroKompakt(w) : euro(w)}</span>
      <span className="vg-verh-block-delta" data-ton={ton}>
        {wirkt ? `${euroKompaktDelta(delta)} gegenüber der Fassung` : 'wie in der Fassung'}
      </span>
    </div>
  )
}

/**
 * Die drei Größen, um die verhandelt wird: das erste Jahr des Hauses nach
 * Regel, sein Zielmodell im Referenzvergleich und das Budget der SV Sachsen
 * kumuliert bis 2030. Jede Bewegung eines Reglers oder ein Haken landet in
 * mindestens einer der drei — Besitzstand und Verlustdeckel im Budget,
 * Gewinnvorgriff im ersten Jahr, Sätze und der Hauszuschuss im Zielmodell.
 */
function Leiste({ ergebnis, basisErgebnis, portfolio, basisPortfolio }) {
  const jahr1 = ergebnis.verlauf[0]
  return (
    <div className="vg-verh-leiste">
      <LeistenBlock
        label={`${jahr1.jahr} nach Regel`}
        wert={jahr1.mitUebergang} basis={basisErgebnis.verlauf[0].mitUebergang}
        tonWert={tonJahr(jahr1.deltaProzent)}
      />
      <LeistenBlock
        label="Zielmodell im Referenzvergleich"
        wert={ergebnis.ziel.gesamt} basis={basisErgebnis.ziel.gesamt}
      />
      <LeistenBlock
        label={`Budget kumuliert bis ${KUMULIERT_BIS}`}
        wert={portfolio.kumuliert.ziel} basis={basisPortfolio.kumuliert.ziel}
        zahlersicht kompaktWert
      />
    </div>
  )
}

// --------------------------------------------------- Zugeständnisse

function Zugestaendnis({ z, angewendet, onAnwenden, onZuruecknehmen }) {
  const hausWirkt = Math.abs(z.hausKumuliert) > 1
  const budgetWirkt = Math.abs(z.budget) > 1
  // Kein Zugeständnis in dieser Fassung: entweder wäre es eine Verschärfung
  // (die Fassung ist schon großzügiger, das Haus verlöre) oder es bewegt
  // nichts, weil die Fassung den Punkt bereits abdeckt. Die Zeile bleibt
  // stehen, damit die Liste nicht springt, aber ohne Zahlen und Knopf.
  if (z.entfaellt && !angewendet) {
    const grund = z.verschaerfung
      ? (z.hausKumuliert < -1
        ? `In dieser Fassung eine Verschärfung, kein Zugeständnis: das Haus verlöre ${euroKompakt(Math.abs(z.hausKumuliert))} über acht Jahre.`
        : `In dieser Fassung eine Verschärfung für andere Häuser (Budget ${euroKompakt(Math.abs(z.budget))} weniger), für dieses Haus ohne Wirkung.`)
      : 'Die Fassung geht an dieser Stelle bereits weiter — ohne Wirkung für Haus und Budget.'
    return (
      <li className="vg-verh-zeile" data-entfaellt="true" style={{ opacity: .55 }}>
        <span className="vg-verh-titel vg-stark" title={z.label}>{z.label}</span>
        <InfoTip text={z.hinweis} />
        <span className="vg-verh-zahl vg-mono"><Tip text={grund}><span>–</span></Tip></span>
        <span className="vg-verh-zahl vg-mono"><Tip text={grund}><span>–</span></Tip></span>
        <Btn variante="still" groesse="sm" nurIkone ikone={Plus} disabled aria-label={`${z.label} — entfällt in dieser Fassung`} title="Entfällt in dieser Fassung" />
      </li>
    )
  }
  return (
    <li className="vg-verh-zeile" data-angewendet={angewendet ? 'true' : undefined} data-fest={z.fest ? 'true' : undefined}>
      <span className="vg-verh-titel vg-stark" title={z.label}>{z.label}</span>
      <InfoTip text={z.hinweis} />
      <span className="vg-verh-zahl vg-mono" data-ton={hausWirkt && z.hausKumuliert > 0 ? 'positiv' : undefined}>
        <Tip text={hausWirkt
          ? `Wirkung 2028 für das Haus: ${euroKompaktDelta(z.hausJahr1)} · kumuliert über acht Jahre ${euroKompaktDelta(z.hausKumuliert)}${z.zielDelta > 1 ? ` · Zielmodell im Referenzvergleich ${euroKompaktDelta(z.zielDelta)}` : ''}`
          : 'Für dieses Haus ohne Wirkung'}>
          <span>{hausWirkt ? kompaktDelta(z.hausKumuliert) : '–'}</span>
        </Tip>
      </span>
      <span className="vg-verh-zahl vg-mono" data-ton={budgetWirkt ? (z.budget > 0 ? 'negativ' : 'positiv') : undefined}>
        <Tip text={budgetWirkt
          ? `Mehrkosten für das Gesamtbudget, kumuliert über acht Jahre: ${euroKompakt(z.budget)} (${prozentDelta(z.budgetProzent)} im Startjahr)`
          : 'Ohne Wirkung auf das Gesamtbudget'}>
          <span>{budgetWirkt ? kompakt(z.budget) : '–'}</span>
        </Tip>
      </span>
      <Btn
        variante={angewendet ? 'primaer' : 'still'}
        groesse="sm"
        nurIkone
        ikone={angewendet ? Check : Plus}
        onClick={() => (angewendet ? onZuruecknehmen(z) : onAnwenden(z))}
        aria-pressed={angewendet}
        aria-label={angewendet ? `${z.label} — angewendet, zurücknehmen` : `${z.label} anwenden`}
        title={angewendet ? 'Angewendet — klicken nimmt es zurück' : 'Anwenden'}
      />
    </li>
  )
}

// --------------------------------------------------- Inhalt

function VerhandlungsmodusInhalt({ onSchliessen, einheit, hebel, fassungen, portfolio }) {
  const fassung = fassungen.aktiv
  const uebergangHebel = hebelDerGruppe('uebergang')

  // Die Verhandlungsbasis ist die Fassung beim ersten Öffnen: dagegen misst
  // die Leiste, und dahin nimmt „Alle zurücknehmen“ zurück. Sie liegt in der
  // Fassung selbst (bleibt über Schließen und Neuladen erhalten); ein Demo-
  // Reset (#/start?frisch) löscht sie mit den Fassungen.
  const stand = fassung?.verhandlung
  useEffect(() => {
    if (fassung && !fassung.verhandlung) {
      fassungen.aendereFassung(fassung.id, { verhandlung: { basis: { ...hebel }, angewendet: [] } })
    }
  }, [fassung, fassungen, hebel])
  const basis = useMemo(() => stand?.basis || { ...hebel }, [stand, hebel])
  const angewendet = useMemo(() => new Set(stand?.angewendet || []), [stand])

  const ergebnis = useMemo(
    () => berechneEinzel(einheit, hebel, { bonusNormierung: portfolio.bonusNormierung }),
    [einheit, hebel, portfolio.bonusNormierung])
  const basisPortfolio = useMemo(() => berechnePortfolio(EINHEITEN, basis), [basis])
  const basisErgebnis = useMemo(
    () => berechneEinzel(einheit, basis, { bonusNormierung: basisPortfolio.bonusNormierung }),
    [einheit, basis, basisPortfolio.bonusNormierung])

  const merke = useCallback((ids) => {
    fassungen.aendereFassung(fassung.id, { verhandlung: { basis, angewendet: ids } })
  }, [fassungen, fassung, basis])

  const anwenden = useCallback((z) => {
    fassungen.setzeHebel(hebelMitZugestaendnis(hebel, z, einheit.id))
    merke([...angewendet, z.id])
  }, [fassungen, hebel, einheit.id, angewendet, merke])

  const zuruecknehmen = useCallback((z) => {
    fassungen.setzeHebel(hebelOhneZugestaendnis(hebel, z, einheit.id, basis))
    merke([...angewendet].filter(id => id !== z.id))
  }, [fassungen, hebel, einheit.id, basis, angewendet, merke])

  const alleZuruecknehmen = useCallback(() => {
    fassungen.setzeHebel({ ...hebel, ...basis, hausZuschuesse: basis.hausZuschuesse || {} })
    merke([])
  }, [fassungen, hebel, basis, merke])

  // Weicht die Fassung von der Basis ab — durch Haken oder gezogene Regler?
  const abweichend = useMemo(() => {
    if (angewendet.size) return true
    const schluessel = new Set([...Object.keys(hebel), ...Object.keys(basis)])
    for (const k of schluessel) {
      if (k === 'hausZuschuesse') {
        if (JSON.stringify(hebel.hausZuschuesse || {}) !== JSON.stringify(basis.hausZuschuesse || {})) return true
      } else if (Math.abs((hebel[k] ?? 0) - (basis[k] ?? 0)) > 1e-9) return true
    }
    return false
  }, [hebel, basis, angewendet])

  // Was kostet ein Zugeständnis — für dieses Haus und für das Gesamtbudget?
  // Angewendete werden gegen die Fassung ohne sie gemessen, damit die Zahl
  // nach dem Haken stehen bleibt und nicht auf null fällt.
  const kosten = useMemo(() => ZUGESTAENDNISSE.map(z => {
    const ist = angewendet.has(z.id)
    const mit = ist ? hebel : hebelMitZugestaendnis(hebel, z, einheit.id)
    const ohne = ist ? hebelOhneZugestaendnis(hebel, z, einheit.id, basis) : hebel
    const einzelnMit = ist ? ergebnis : berechneEinzel(einheit, mit, { bonusNormierung: portfolio.bonusNormierung })
    const einzelnOhne = ist ? berechneEinzel(einheit, ohne, { bonusNormierung: portfolio.bonusNormierung }) : ergebnis
    const gesamtMit = ist ? portfolio : berechnePortfolio(EINHEITEN, mit)
    const gesamtOhne = ist ? berechnePortfolio(EINHEITEN, ohne) : portfolio
    const summe = (r) => r.verlauf.reduce((s, v) => s + v.mitUebergang, 0)
    const hausKumuliert = summe(einzelnMit) - summe(einzelnOhne)
    const budgetKumuliert = summe(gesamtMit) - summe(gesamtOhne)
    // Eine Verschärfung ist kein Zugeständnis (Fassung mit Verlustdeckel 0 %:
    // „auf vier Prozent senken“ nähme dem Haus Geld); ein Hebel-Zugeständnis,
    // das weder Haus noch Budget bewegt, ist von der Fassung schon überholt
    // (Besitzstand 97 % bei eingestellten 100 %). Spart die Änderung Budget,
    // ist sie irgendwo eine Verschärfung — auch wenn dieses Haus (ein
    // Gewinner) davon nichts merkt.
    const verschaerfung = hausKumuliert < -1 || budgetKumuliert < -1
    const ueberholt = !!z.hebel && Math.abs(hausKumuliert) <= 1 && Math.abs(budgetKumuliert) <= 1
    return {
      ...z,
      hausJahr1: einzelnMit.verlauf[0].mitUebergang - einzelnOhne.verlauf[0].mitUebergang,
      hausKumuliert,
      zielDelta: einzelnMit.ziel.gesamt - einzelnOhne.ziel.gesamt,
      budget: budgetKumuliert,
      budgetProzent: gesamtMit.uebergang.prozent - gesamtOhne.uebergang.prozent,
      verschaerfung,
      entfaellt: verschaerfung || ueberholt,
    }
  }), [hebel, basis, einheit, ergebnis, portfolio, angewendet])

  // Reihenfolge: das feste Hauszugeständnis zuerst, dann nach Mehrkosten
  // aufsteigend, was in dieser Fassung entfällt am Ende — einmal beim Öffnen
  // festgelegt, damit die Zeilen beim Ziehen eines Reglers nicht springen.
  const [ordnung] = useState(() => [...kosten]
    .sort((a, b) => (Number(!!b.fest) - Number(!!a.fest)) || (Number(a.entfaellt) - Number(b.entfaellt)) || (a.budget - b.budget))
    .map(z => z.id))
  const zeilen = useMemo(
    () => ordnung.map(id => kosten.find(z => z.id === id)).filter(Boolean),
    [ordnung, kosten])

  // Wirkung jedes Übergangsreglers für dieses Haus im ersten Jahr: gegen
  // denselben Hebelsatz ohne diesen Regler (Basiswert heute). Bei einem
  // Gewinner wie Dresden greifen Besitzstand und Verlustdeckel nicht — das
  // steht dann als „ohne Wirkung“ unter dem Regler, statt dass die Zahl
  // stumm stehen bleibt.
  const wirkungen = useMemo(() => Object.fromEntries(uebergangHebel.map(def => {
    const ohne = berechneEinzel(einheit, { ...hebel, [def.id]: def.basis }, { bonusNormierung: portfolio.bonusNormierung })
    return [def.id, ergebnis.verlauf[0].mitUebergang - ohne.verlauf[0].mitUebergang]
  })), [uebergangHebel, einheit, hebel, ergebnis, portfolio.bonusNormierung])

  const regelKosten = ergebnis.uebergang

  return (
    <Schublade
      offen
      nichtModal
      breite="verhandlung"
      onSchliessen={onSchliessen}
      titel="Verhandlungsmodus"
      unter={`${einheit.name} · Fassung „${fassung?.name}“${abweichend ? ' · mit Zugeständnissen' : ''}`}
      leiste={<Leiste ergebnis={ergebnis} basisErgebnis={basisErgebnis} portfolio={portfolio} basisPortfolio={basisPortfolio} />}
    >
      <div className="vg-stapel">
        <Karte>
          <KarteKopf
            titel="Übergangsregeln"
            unter={`Wirken sofort auf alle Einheiten der Fassung · für dieses Haus kostet die Regel ${euroKompakt(regelKosten.kostenKumuliert)} über acht Jahre, Barwert ${euroKompakt(regelKosten.kostenBarwert)}`}
          />
          <KarteKoerper eng>
            {uebergangHebel.map(def => {
              const w = wirkungen[def.id] ?? 0
              const wirkt = Math.abs(w) > 1
              return (
                <div key={def.id} className="vg-verh-regler">
                  <ReglerZeile
                    def={def}
                    wert={hebel[def.id] ?? def.standard}
                    onAendern={(id, wert) => fassungen.aendereHebel(id, wert)}
                    ohneChip
                    hinweisZeigen
                    hinweisBeiFokus={false}
                  />
                  <div className="vg-verh-wirkung" data-ton={wirkt ? (w > 0 ? 'positiv' : 'negativ') : 'neutral'}>
                    {wirkt
                      ? `Wirkung für dieses Haus 2028: ${euroKompaktDelta(w)}`
                      : 'Ohne Wirkung für dieses Haus in dieser Fassung'}
                  </div>
                </div>
              )
            })}
          </KarteKoerper>
        </Karte>

        <Karte>
          <KarteKopf
            titel="Zugeständnisrechner"
            unter="Haus: Mehrvergütung dieses Hauses, Budget: Mehrkosten der SV Sachsen über alle Einheiten, beides kassenwirksam und kumuliert 2028 bis 2035. Das individuelle Zugeständnis zuerst, dann das Günstigste."
            aktionen={
              <Btn variante="still" groesse="sm" ikone={RotateCcw} onClick={alleZuruecknehmen} disabled={!abweichend} title="Alle Zugeständnisse und Reglerbewegungen auf die Fassung zurücksetzen">
                Alle zurücknehmen
              </Btn>
            }
          />
          <KarteKoerper eng>
            <div className="vg-verh-kopfzeile">
              <span />
              <span />
              <span className="vg-verh-kopf-zahl" title="Haus: Mehrvergütung für dieses Haus, kassenwirksam nach Übergangsregel, kumuliert 2028 bis 2035">Haus</span>
              <span className="vg-verh-kopf-zahl" title="Budget: Mehrkosten der SV Sachsen über alle Einheiten, kumuliert 2028 bis 2035">Budget</span>
              <span className="vg-verh-kopf-knopf" />
            </div>
            <ul className="vg-verh-liste">
              {zeilen.map(z => (
                <Zugestaendnis key={z.id} z={z} angewendet={angewendet.has(z.id)} onAnwenden={anwenden} onZuruecknehmen={zuruecknehmen} />
              ))}
            </ul>
          </KarteKoerper>
        </Karte>

        <div>
          <label className="vg-label" htmlFor="verh-notiz">Gesprächsnotiz</label>
          <textarea
            id="verh-notiz"
            className="vg-feld"
            rows={4}
            placeholder="Positionen, Zusagen, offene Punkte"
            value={fassung?.notiz || ''}
            onChange={e => fassungen.aendereFassung(fassung.id, { notiz: e.target.value })}
          />
        </div>
      </div>
    </Schublade>
  )
}

/**
 * Verhandlungsmodus der Institutsakte: nicht-modale Schublade neben dem
 * Steuerblock. Props wie bisher (offen, onSchliessen, einheit, hebel,
 * fassungen, portfolio). Der Inhalt wird erst bei offen=true aufgebaut —
 * die Portfolio-Rechnungen des Zugeständnisrechners laufen sonst bei jeder
 * Reglerbewegung der Akte mit, ohne dass jemand sie sieht.
 */
export default function Verhandlungsmodus({ offen, ...rest }) {
  if (!offen) return null
  return <VerhandlungsmodusInhalt {...rest} />
}
