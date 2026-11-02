import { useMemo } from 'react'
import { ArrowRight } from 'lucide-react'
import { Tafel, VergleichsTafel } from '../../ui/Tafel'
import { Btn, Messlatte, AnimierterBetrag, useAnimierteZahl } from '../../ui/basis'
import { Verlauf, AMPEL_FARBE } from '../../charts'
import {
  berechneEinzel, produktionszeilen, bestandszeilen, bonuszeilen, zuschusszeilen, summenzeile,
} from '../../lib/modell'
import { euroKompakt, euroKompaktDelta, achseEuro, prozent, prozentDelta, zahl, deltaTon } from '../../lib/format'

/**
 * WIRKUNGS-TAFELN des Simulationskastens — vier Tafeln, alle aus derselben
 * Portfoliorechnung, alle Zahlen laufen 420 ms nach.
 *
 * Tinte aus Sicht des Zahlenden: Mehrkosten sind Warnung, Ersparnis ist
 * positiv — wie die Regler-Abzeichen der Eingabe-Tafeln. Die Akte färbt
 * dieselben Zahlen aus Sicht des Instituts, bewusst umgekehrt.
 *
 *   Produktionszeilen Gesamtportfolio (2 Spalten) │ Bonusstaffel
 *   Beispielhaus (2 Spalten)                       │ Verlauf
 *
 * Bonusstaffel und Verlauf stehen als gestapelte Gruppe in der dritten
 * Spalte (.vg-kasten-spalte), damit die Leere zwischen den Karten liegt
 * und nicht in ihnen; bei zwei Rasterspalten (≤ 1024 px) stehen die beiden
 * nebeneinander unter den Produktionszeilen.
 */

const SPALTEN_PRODUKTION = [
  { id: 'produkt', label: 'Produkt' },
  { id: 'bemessung', label: 'Bemessung' },
  { id: 'alt', label: 'Alt' },
  { id: 'neu', label: 'Neu' },
  { id: 'differenz', label: 'Differenz' },
]

/**
 * Abschnitte und Summe der Vergleichstabelle — für das Portfolio (quelle =
 * portfolio mit produktion/bestand) wie für eine Einheit.
 */
function produktionsAbschnitte(ist, ziel, quelle, mitStufe = false) {
  const abschluss = produktionszeilen(ist, ziel, quelle)
  const folge = bestandszeilen(ist, ziel, quelle)
  const bonus = bonuszeilen(ist, ziel).map(z => (mitStufe && z.stufeNeu ? {
    ...z,
    hinweis: `Stufe heute ${z.stufeAlt} (${prozent(z.satzAlt)}), neu ${z.stufeNeu} (${prozent(z.satzNeu)})`
      + (z.auszahlungsgrad != null ? ` · Auszahlungsgrad ${prozent(z.auszahlungsgrad * 100, 0)}` : ''),
  } : z))
  const zuschuesse = zuschusszeilen(ist, ziel)
  const alle = [...abschluss, ...folge, ...bonus, ...zuschuesse]
  return {
    abschnitte: [
      { id: 'abschluss', titel: 'Abschluss', zeilen: abschluss },
      { id: 'folge', titel: 'Laufend und Bestand', zeilen: folge },
      { id: 'bonus', titel: 'Bonifikation', zeilen: bonus },
      { id: 'zuschuesse', titel: 'Zuschüsse', zeilen: zuschuesse },
    ],
    summe: summenzeile(alle),
  }
}

// --------------------------------------------------- Produktionszeilen

export function ProduktionsTafel({ portfolio }) {
  const { abschnitte, summe } = useMemo(
    () => produktionsAbschnitte(portfolio.ist, portfolio.ziel, portfolio),
    [portfolio])
  return (
    <Tafel titel="Produktionszeilen — Gesamtportfolio" ton="abschluss" breit={2} dicht buendig
      unter="Abschluss, Laufend und Bestand, Bonifikation, Zuschüsse">
      <VergleichsTafel spalten={SPALTEN_PRODUKTION} abschnitte={abschnitte} summe={summe} zahlersicht />
    </Tafel>
  )
}

// --------------------------------------------------- Bonusstaffel

// Die Zellen tragen „heute → neu“; die Einheit steht einmal im Kopf, damit
// die Zelle in einer Drittel-Tafel bleibt („759 Tsd. → 768 Tsd.“).
const SPALTEN_STAFFEL = [
  { id: 'produkt', label: 'Bereich' },
  { id: 'bemessung', label: 'Einheiten', num: true },
  { id: 'neu', label: 'Volumen in EUR', num: true },
]

/**
 * „4 → 7“ — heute und neu in einer Zelle, das Neue betont; beide laufen nach.
 * Pfeil und neuer Wert bilden eine Einheit: stapelt die Zelle bei 1280 px
 * (makro.css), steht der Pfeil vor der zweiten Zeile und sagt weiter, welche
 * Zahl die neue ist.
 */
function HeuteNeu({ heute, neu, format = zahl }) {
  return (
    <span className="vg-kasten-heuteneu">
      <span className="vg-kasten-heuteneu-alt"><AnimierterBetrag wert={heute} format={format} /></span>
      <span className="vg-kasten-heuteneu-zu">
        <span className="vg-pfeil" aria-hidden="true" />
        <span className="vg-kasten-heuteneu-neu"><AnimierterBetrag wert={neu} format={format} /></span>
      </span>
    </span>
  )
}

export function StaffelWirkungTafel({ portfolio }) {
  const verteilung = portfolio.bonusVerteilung || []
  const zeilen = useMemo(() => verteilung.map(s => ({
    id: `stufe-${s.index}`,
    produkt: s.label,
    bemessung: <HeuteNeu heute={s.einheitenHeute} neu={s.einheitenNeu} />,
    neu: <HeuteNeu heute={s.volumenHeute} neu={s.volumenNeu} format={achseEuro} />,
  })), [verteilung])

  // Summenzeile: alle Einheiten, das ganze Bonusvolumen — heute → neu
  const einheitenHeute = verteilung.reduce((a, s) => a + s.einheitenHeute, 0)
  const einheitenNeu = verteilung.reduce((a, s) => a + s.einheitenNeu, 0)
  const alt = portfolio.ist.bonus
  const neu = portfolio.ziel.bonus
  const summe = useMemo(() => ({
    label: 'Gesamt',
    bemessung: <HeuteNeu heute={einheitenHeute} neu={einheitenNeu} />,
    neu: <HeuteNeu heute={alt} neu={neu} format={achseEuro} />,
  }), [einheitenHeute, einheitenNeu, alt, neu])

  const differenz = neu - alt
  const differenzProzent = alt > 0 ? (differenz / alt) * 100 : 0

  return (
    <Tafel
      titel="Bonusstaffel — wer landet wo"
      unter={<>heute <span className="vg-pfeil" aria-hidden="true" /> neu je Stufe</>}
      ton="folge" dicht buendig
      className="vg-kasten-tafel-staffel vg-kasten-unter-weicht"
    >
      <VergleichsTafel spalten={SPALTEN_STAFFEL} zeilen={zeilen} summe={summe} />
      {/* Nur die Differenz: heute und neu stehen in der Summenzeile darüber */}
      <div className="vg-kasten-bilanz">
        <span className="vg-kasten-bilanz-label">Bonusvolumen</span>
        <span className="vg-kasten-bilanz-differenz" data-ton={deltaTon(differenz, { zahlersicht: true })}>
          <AnimierterBetrag wert={differenz} format={euroKompaktDelta} />
        </span>
        <span className="vg-kasten-bilanz-prozent" data-ton={deltaTon(differenz, { zahlersicht: true })}>
          <AnimierterBetrag wert={differenzProzent} format={v => prozentDelta(v)} />
        </span>
      </div>
    </Tafel>
  )
}

// --------------------------------------------------- Beispielhaus

/**
 * Die zwei Plaketten des Beispielhauses färben wie der Steuerblock der Akte,
 * aus Sicht des Hauses: gewinnt es, grün; verliert es 2028 mehr als 2 %, rot.
 * So färbt „Akte öffnen“ nichts um. Die Differenz-Spalten darunter bleiben
 * Zahlersicht (Mehrkosten orange), wie überall im Kasten.
 */
// Sicht des Instituts: exakt heute (Übergangsregel hält das Haus) ist grau,
// nicht orange — die Warnung gilt kleinen Abweichungen, nicht der Garantie.
const tonStartjahr = (p) => (Math.abs(p) < 0.05 ? 'neutral' : p <= -0.5 ? 'negativ' : p >= 0.5 ? 'positiv' : 'warnung')

/**
 * Kleine Plakette im Tafelkopf: Label und Prozent, Ton wie im Steuerblock.
 * Unter 1280 px weicht das Label (makro.css); der Tooltip trägt es weiter.
 */
function KleinePlakette({ label, prozent: p, ton }) {
  const v = useAnimierteZahl(p ?? 0, 420)
  return (
    <span className="vg-kasten-plakette" data-ton={ton} title={label}>
      <span className="vg-kasten-plakette-label">{label}</span>
      <span className="vg-kasten-plakette-wert">{prozentDelta(v)}</span>
    </span>
  )
}

export function BeispielhausTafel({ einheit, hebel, portfolio, navigiere }) {
  // Eine Einheit, mit der Bonusnormierung des Portfolios gerechnet — so
  // stimmt die Tafel exakt mit der Akte und mit der Zeile im Lagebild überein.
  const ergebnis = useMemo(
    () => berechneEinzel(einheit, hebel, { bonusNormierung: portfolio.bonusNormierung }),
    [einheit, hebel, portfolio.bonusNormierung])
  const { abschnitte, summe } = useMemo(
    () => produktionsAbschnitte(ergebnis.ist, ergebnis.ziel, einheit, true),
    [ergebnis, einheit])
  const jahr1 = ergebnis.verlauf[0]

  // Keine Unterzeile: der Name trägt Kanal und Sitz bereits („Ostsächsische
  // Sparkasse Dresden“), und der Titel muss auch bei 1280 px ganz stehen.
  return (
    <Tafel
      titel={`Beispielhaus: ${einheit.name}`}
      ton="abschluss" breit={2} dicht buendig
      className="vg-kasten-tafel-haus"
      aktionen={
        <>
          <KleinePlakette label="Referenzzeitraum" prozent={ergebnis.delta.prozent} ton={deltaTon(ergebnis.delta.absolut)} />
          <KleinePlakette
            label="bis 2030, Barwert"
            prozent={ergebnis.kumuliert?.prozent ?? 0}
            ton={tonStartjahr(ergebnis.kumuliert?.prozent ?? 0)}
          />
          {navigiere && (
            <Btn variante="still" groesse="sm" ikoneRechts={ArrowRight} onClick={() => navigiere(`umstellung/${einheit.id}`)}>
              Akte öffnen
            </Btn>
          )}
        </>
      }
    >
      <VergleichsTafel spalten={SPALTEN_PRODUKTION} abschnitte={abschnitte} summe={summe} zahlersicht />
    </Tafel>
  )
}

// --------------------------------------------------- Verlauf

const STREIFEN = [
  { id: 'gewinner', label: 'Gewinner', farbe: AMPEL_FARBE.gewinner },
  { id: 'neutral', label: 'Neutral', farbe: AMPEL_FARBE.neutral },
  { id: 'verlierer', label: 'Verlierer', farbe: AMPEL_FARBE.kritisch },
]

export function VerlaufTafel({ portfolio }) {
  const v = portfolio.verteilung
  const vv = portfolio.verteilungVolumen
  const gesamtVol = vv.gewinner + vv.neutral + vv.verlierer || 1
  return (
    <Tafel titel="Verlauf 2028–2035" ton="neutral" unter="kassenwirksam, mit Übergangsregel"
      className="vg-kasten-tafel-verlauf vg-kasten-unter-weicht">
      <Verlauf reihe={portfolio.verlauf} hoehe={190} kompakt />
      <div className="vg-kasten-streifen" role="group" aria-label="Gewinner, Neutral und Verlierer nach Vergütungsvolumen">
        {STREIFEN.map(k => (
          <div className="vg-kasten-streifen-teil" key={k.id}>
            <div className="vg-kasten-streifen-kopf">
              <span className="vg-punkt" style={{ background: k.farbe }} />
              <span className="vg-kasten-streifen-label">{k.label}</span>
              <span className="vg-kasten-streifen-anzahl">{zahl(v[k.id])}</span>
            </div>
            <Messlatte anteil={vv[k.id] / gesamtVol} farbe={k.farbe} />
            <div className="vg-kasten-streifen-fuss">
              {prozent((vv[k.id] / gesamtVol) * 100, 0)} · {euroKompakt(vv[k.id])}
            </div>
          </div>
        ))}
      </div>
    </Tafel>
  )
}

// --------------------------------------------------- Gewinner und Verlierer je Vertriebsweg

/**
 * Acht Klassen der Veränderung im Referenzvergleich, von „unter −20 %“ bis
 * „über +20 %“. Rot ist, wer mehr als 5 % verliert — das sind die klaren
 * Verlierer, um die es in der Fachfrage geht; bis 5 % weniger hält das
 * Niveau und steht hellgrün, darüber Grün, je kräftiger, desto stärker.
 */
// `kurz` steht direkt unter der Säule, in der Schreibweise der Fachfrage
// („<−10 %“ ist die Klasse zwischen −20 und −10, weil links davon „<−20 %“
// steht). „bis 0 %“ statt „≤ 0 %“: Uniform führt kein ≤.
const KLASSEN = [
  { id: 'v20', label: 'unter −20 %', kurz: '<−20 %', test: d => d < -20, ton: 'negativ', staerke: 1 },
  { id: 'v10', label: '−20 bis −10 %', kurz: '<−10 %', test: d => d < -10, ton: 'negativ', staerke: .75 },
  { id: 'v5', label: '−10 bis −5 %', kurz: '<−5 %', test: d => d < -5, ton: 'negativ', staerke: .5 },
  { id: 'v0', label: '−5 bis 0 %', kurz: 'bis 0 %', test: d => d <= 0, ton: 'positiv', staerke: .28 },
  { id: 'g5', label: '0 bis +5 %', kurz: '>0 %', test: d => d <= 5, ton: 'positiv', staerke: .45 },
  { id: 'g10', label: '+5 bis +10 %', kurz: '>5 %', test: d => d <= 10, ton: 'positiv', staerke: .62 },
  { id: 'g20', label: '+10 bis +20 %', kurz: '>10 %', test: d => d <= 20, ton: 'positiv', staerke: .8 },
  { id: 'g99', label: 'über +20 %', kurz: '>20 %', test: () => true, ton: 'positiv', staerke: 1 },
]

const WEGE = [
  { id: 'sparkasse', label: 'Sparkassen' },
  { id: 'ao', label: 'Agenturen' },
  { id: 'alle', label: 'Alle Einheiten' },
]

/**
 * Anteile je Klasse, gewichtet mit der Zahl der vertretenen Einheiten: die
 * Sammelposition der Ausschließlichkeit steht für 138 Agenturen und zählt
 * so, sonst wäre „95 % der Agenturen“ eine Aussage über neun Zeilen.
 * Kopfzeile: gewinnen (über null), bis 5 % weniger (hält das Niveau),
 * verlieren (mehr als 5 % weniger); exakt null steht als „unverändert“
 * (heutiges Modell: alle auf null).
 */
function verteilungVon(ergebnisse) {
  const gewicht = e => e.einheit.anzahlAgenturen ?? 1
  const n = ergebnisse.reduce((s, e) => s + gewicht(e), 0) || 1
  const zaehler = KLASSEN.map(() => 0)
  let gewinner = 0
  let unveraendert = 0
  let mild = 0
  let verlierer = 0
  for (const e of ergebnisse) {
    const d = e.delta.prozent
    zaehler[KLASSEN.findIndex(k => k.test(d))] += gewicht(e)
    if (d > 0.05) gewinner += gewicht(e)
    else if (d >= -0.05) unveraendert += gewicht(e)
    else if (d >= -5) mild += gewicht(e)
    else verlierer += gewicht(e)
  }
  const anteil = z => (z / n) * 100
  return {
    n,
    anteile: zaehler.map(anteil),
    gewinner: anteil(gewinner),
    unveraendert: anteil(unveraendert),
    mild: anteil(mild),
    verlierer: anteil(verlierer),
  }
}

/** Eine Reihe der Verteilung: Kopfzeile mit Summen, acht Säulen auf 100 %, Klassen darunter */
function VerteilungReihe({ weg }) {
  const beschreibung = KLASSEN.map((k, i) => `${k.label}: ${prozent(weg.anteile[i], 0)}`).join(', ')
  return (
    <div className="vg-vert-reihe">
      <div className="vg-reihe-weit vg-vert-kopf">
        <span className="vg-stark vg-t-sm">
          {weg.label} <span className="vg-schwach vg-t-xs">· {zahl(weg.n)} Einheiten</span>
        </span>
        <span className="vg-t-xs vg-vert-summen">
          <span className="vg-delta" data-ton={weg.gewinner > 0 ? 'positiv' : undefined}>{prozent(weg.gewinner, 0)} gewinnen</span>
          {weg.unveraendert > 0.5 && <span className="vg-schwach"> · {prozent(weg.unveraendert, 0)} unverändert</span>}
          {weg.mild > 0.5 && <span className="vg-schwach"> · {prozent(weg.mild, 0)} bis 5 % weniger</span>}
          {' · '}
          <span className="vg-delta" data-ton={weg.verlierer > 0 ? 'negativ' : undefined}>{prozent(weg.verlierer, 0)} verlieren</span>
        </span>
      </div>
      <div className="vg-vert-saeulen" role="img" aria-label={`${weg.label}: ${beschreibung}`}>
        {KLASSEN.map((k, i) => {
          const a = weg.anteile[i]
          // Ab 72 % steht der Wert in der Säule (3 px unter ihrer Oberkante),
          // sonst reicht die Höhe nicht mehr für den Text darüber; auf
          // kräftigen Flächen hell, sonst dunkel.
          const innen = a > 72
          return (
            <div key={k.id} className="vg-vert-fach" title={`${k.label}: ${prozent(a, 1)} der Einheiten`}>
              <div
                className="vg-vert-saeule"
                data-ton={k.ton}
                style={{ height: `${a > 0 ? Math.max(a, 1.5) : 0}%`, opacity: k.staerke }}
              />
              {a >= 0.5 && (
                <span
                  className="vg-vert-wert"
                  data-innen={innen || undefined}
                  style={innen
                    ? { top: `calc(${100 - a}% + 3px)`, color: k.staerke >= .75 ? 'var(--vg-pille-text)' : 'var(--vg-text)' }
                    : { bottom: `calc(${Math.max(a, 1.5)}% + 3px)` }}
                >
                  {prozent(a, 0)}
                </span>
              )}
            </div>
          )
        })}
      </div>
      <div className="vg-vert-klassen" aria-hidden="true">
        {KLASSEN.map(k => <span key={k.id} title={k.label}>{k.kurz}</span>)}
      </div>
    </div>
  )
}

export function VerteilungTafel({ portfolio }) {
  const wege = useMemo(() => WEGE.map(w => {
    const liste = w.id === 'alle' ? portfolio.ergebnisse : portfolio.ergebnisse.filter(e => e.einheit.kanal === w.id)
    return { ...w, ...verteilungVon(liste) }
  }).filter(w => w.n > 0), [portfolio])

  return (
    <Tafel titel="Gewinner und Verlierer" ton="neutral"
      unter="je Vertriebsweg"
      className="vg-kasten-tafel-verteilung vg-kasten-unter-weicht">
      <div className="vg-stapel" style={{ gap: 12 }}>
        {wege.map(w => <VerteilungReihe key={w.id} weg={w} />)}
        <p className="vg-t-xs vg-schwach" style={{ margin: 0 }}>
          Anteil der Einheiten je Klasse der Veränderung im Referenzvergleich, von unter −20 % bis über
          +20 %. Rot verliert mehr als 5 %; Grün hält das Niveau (bis 5 % weniger) oder gewinnt, kräftiger
          heißt stärker. Agenturen zählen mit ihrer Anzahl.
        </p>
      </div>
    </Tafel>
  )
}

/**
 * Alle Wirkungs-Tafeln — direkt im Raster des Kastens; Bonusstaffel,
 * Verlauf und Verteilung als gestapelte Gruppe in der dritten Spalte.
 */
export default function Wirkungstafeln({ portfolio, hebel, beispielhaus, navigiere }) {
  return (
    <>
      <ProduktionsTafel portfolio={portfolio} />
      <div className="vg-kasten-spalte">
        <StaffelWirkungTafel portfolio={portfolio} />
        <VerlaufTafel portfolio={portfolio} />
        <VerteilungTafel portfolio={portfolio} />
      </div>
      {beispielhaus && (
        <BeispielhausTafel einheit={beispielhaus} hebel={hebel} portfolio={portfolio} navigiere={navigiere} />
      )}
    </>
  )
}
