import { useSyncExternalStore, useMemo, useState } from 'react'
import { SlidersHorizontal } from 'lucide-react'
import { Tafel, VergleichsTafel, LabelWert } from '../../ui/Tafel'
import { Messlatte, Btn } from '../../ui/basis'
import Tabelle from '../../ui/Tabelle'
import Szenarioanalyse from './Szenarioanalyse'
import { REFERENZZEITRAUM_TEXT, KANAL_KURZ } from '../../data/einheiten'
import { HEBEL_INDEX } from '../../lib/hebel'
import { EINHEIT_ZEICHEN } from '../../ui/Regler'
import { PaarVergleich, bauteilPaare, spartenPaare, BestandBalken, SpartenSaeulen } from '../../charts'
import {
  produktionszeilen, bestandszeilen, bonuszeilen, zuschusszeilen, summenzeile, spartenSaeulen, KANALFAKTOR, WAHLMODELLE,
} from '../../lib/modell'
import { achseEuro, euro, euroKompakt, prozent, prozentDelta, zahl, deltaTon } from '../../lib/format'

/** Breiter Bildschirm (≥ 1800 px): Diagramme bekommen mehr Höhe. */
function useBreit(min = 1800) {
  const abfrage = typeof window !== 'undefined' ? window.matchMedia(`(min-width: ${min}px)`) : null
  return useSyncExternalStore(
    (cb) => { abfrage?.addEventListener('change', cb); return () => abfrage?.removeEventListener('change', cb) },
    () => !!abfrage?.matches,
    () => false,
  )
}
import { garantiezeilen } from './verhandlung'

/**
 * ÜBERSICHT — das Ein-Bild-Dashboard der Institutsakte.
 *
 * Vier Rasterspalten (`.vg-akte-tafeln`), vier Reihen:
 *   0  Produktion in den Wertungsjahren (vier Tafeln): Leben, bAV, Biometrie,
 *      Komposit als drei Säulen Vorvorjahr, Vorjahr, Referenzjahr mit der
 *      Jahreszahl darunter, Stufenlinien der Bonusstaffel und Plan-Linie;
 *      das Referenzjahr hervorgehoben — woher die Vergütung kommt
 *   1  vier Sparten-Tafeln — heute gegen Zielmodell je Sparte (Leben, Komposit,
 *      Bonifikation, Zuschüsse), dasselbe Säulenpaar wie im Steuerblock des
 *      Kastens, mit Werten über den Säulen und dem Delta als Marke
 *   1a Datengrundlage im Referenzzeitraum (volle Breite): Produktion je
 *      Sparte mit Vorjahr und Plan, Bestand, Verträge, Kunden, gemeldete
 *      Vergütung, Zielerreichung — die Basis, auf der beide Modelle rechnen
 *   1b Provisionssätze heute gegen Zielmodell (volle Breite): je Komponente
 *      der Satz des Modells (Regler) und der für dieses Haus wirksame Satz
 *      (Betrag ÷ Bemessungsgrundlage) — warum 33 → 34 ‰ im Modell für ein
 *      Haus 33 → 25 ‰ heißen kann
 *   2  Abschlussprovisionen (2 Spalten) · Folgeprovisionen (2 Spalten)
 *   3  Bestand · Bonifikation · Garantien und Übergang · Zuschüsse
 *   4  Heute gegen Zielmodell (2 Spalten) · Qualitätsprofil (2 Spalten)
 *
 * Die Summen der Reihen 2 und 3 (Abschluss + Folge + Bonus + Zuschüsse)
 * ergeben exakt die Zielmodell-Summe im Steuerblock — es sind dieselben
 * Felder aus `berechneEinheit`, nur anders gruppiert.
 */

const MINUS = '−'

// Die Tabellen der Akte tragen kompakte Beträge ohne Einheit („3,1 Mio.“):
// sechs Spalten mit vollen Euro-Beträgen passen bei 1280 px nicht in zwei
// Rasterspalten. „EUR“ steht einmal in der Unterzeile des Kopfbands.
const betrag = (v) => (v == null || Number.isNaN(v) ? '–' : achseEuro(v))
function differenz(v) {
  if (v == null || Number.isNaN(v)) return '–'
  if (Math.abs(v) < 0.5) return '0'
  return (v > 0 ? '+' : MINUS) + achseEuro(Math.abs(v))
}

const SPALTEN_ABSCHLUSS = [
  { id: 'sparte', label: 'Sparte' },
  { id: 'produkt', label: 'Produkt' },
  { id: 'bemessung', label: 'Produktion', format: betrag },
  { id: 'alt', label: 'AP alt', format: betrag },
  { id: 'neu', label: 'AP neu', format: betrag },
  { id: 'differenz', label: 'Differenz', format: differenz },
]
const SPALTEN_FOLGE = [
  { id: 'sparte', label: 'Sparte' },
  { id: 'produkt', label: 'Produkt' },
  { id: 'bemessung', label: 'Bestand', format: betrag },
  { id: 'alt', label: 'FP alt', format: betrag },
  { id: 'neu', label: 'FP neu', format: betrag },
  { id: 'differenz', label: 'Differenz', format: differenz },
]
const SPALTEN_ZUSCHUSS = [
  { id: 'produkt', label: 'Posten' },
  { id: 'alt', label: 'Alt', format: betrag },
  { id: 'neu', label: 'Neu', format: betrag },
  { id: 'differenz', label: 'Differenz', format: differenz },
]

// Was das Säulenpaar je Sparte zusammenfasst — kurz, damit bei 1280 px
// (Tafel rund 220 px) der Titel ganz stehen bleibt; die Einheit trägt die
// Achse des Diagramms. Dieselben vier Paare wie im Steuerblock des Kastens
// (spartenPaare), hier aus Sicht des Instituts gefärbt.
const SPARTEN_UNTER = {
  leben: 'Abschluss, laufend, Bestand',
  komposit: 'Abschluss und Bestand',
  bonus: 'qualitätsgebunden',
  zu: 'Zuschüsse und Sonderposten',
}

// In der Tafel „Zuschüsse“ trägt das Kopfband das Wort; die Posten stehen
// kurz, damit vier Spalten in eine Rasterspalte passen.
const ZUSCHUSS_KURZ = {
  kleinteilig: 'Kleinteilig',
  sonder: 'Sonder',
  fix: 'Fest',
  allgemein: 'Allgemein',
  standort: 'Standort',
}

/**
 * Wertepaar „heute → neu“ als kompakter Betrag: teilen beide dieselbe
 * Größenordnung, steht sie nur einmal („407 → 385 Tsd.“), sonst je Wert
 * („980 Tsd. → 1,2 Mio.“). Die Einheit EUR trägt das Kopfband.
 */
function paarBetrag(alt, neu) {
  const a = betrag(alt), n = betrag(neu)
  const endung = (t) => (t.match(/ (Tsd\.|Mio\.|Mrd\.)$/) || [])[0]
  const ea = endung(a), en = endung(n)
  const links = ea && ea === en ? a.slice(0, -ea.length) : a
  return <>{links} <span className="vg-pfeil" aria-hidden="true" /> {n}</>
}

function tonAus(v) {
  if (v == null || Number.isNaN(v) || Math.abs(v) < 0.5) return 'neutral'
  return v > 0 ? 'positiv' : 'negativ'
}

function kriteriumWert(k, q) {
  const v = k.ist(q)
  if (k.format === 'prozent') return prozent(v * 100)
  if (k.format === 'jahre') return `${zahl(v, 1)} J.`
  return zahl(v, 1)
}

/** Zeilen der Tafel „Bonifikation“: Zielerreichung, Stufe, Satz, Auszahlungsgrad mit Muss-Kriterien, Bonus */
function bonifikationZeilen(bonus, gate, q) {
  const grad = gate?.grad ?? 1
  const geprueft = gate?.geprueft || []
  const verfehltIds = new Set((gate?.verfehlt || []).map(k => k.id))
  const stufe = (i) => (i == null ? '–' : zahl(i + 1))
  const satz = (s) => (s == null ? '–' : prozent(s, 1))

  const zeilen = [
    {
      id: 'ziel', label: 'Zielerreichung',
      wert: bonus.zielerreichung != null ? prozent(bonus.zielerreichung * 100) : '–',
      hinweis: 'Produktion des Referenzjahres im Verhältnis zur Zielvorgabe; sie bestimmt die Stufe der Staffel.',
    },
    {
      id: 'stufe', label: <>Stufe heute <span className="vg-pfeil" aria-hidden="true" /> neu</>,
      wert: <>{stufe(bonus.stufeIndexAlt)} <span className="vg-pfeil" aria-hidden="true" /> {stufe(bonus.stufeIndexNeu)}</>,
      hinweis: bonus.stufeNeu ? `Bereich der neuen Stufe: ${bonus.stufeNeu}` : undefined,
    },
    // Satz und Bonus tragen zwei Werte und stehen gestapelt (Label klein
    // darüber): nebeneinander kappte das Label schon bei 1600 px.
    {
      id: 'satz', label: <>Satz heute <span className="vg-pfeil" aria-hidden="true" /> neu</>,
      gestapelt: true,
      // „19,0 → 25,0 %“: das Prozentzeichen steht einmal, am neuen Wert
      wert: <>{bonus.satzAlt == null ? '–' : zahl(bonus.satzAlt, 1)} <span className="vg-pfeil" aria-hidden="true" /> {satz(bonus.satzNeu)}</>,
      hinweis: 'Effektiver Bonussatz auf die Abschlussvergütung, nach Progression und Kleininstitutssockel.',
    },
    {
      id: 'grad', label: 'Auszahlungsgrad',
      wert: prozent(grad * 100, 0),
      ton: grad >= 1 ? 'positiv' : grad > 0 ? 'warnung' : 'negativ',
      hinweis: geprueft.length
        ? `${geprueft.length} Muss-Kriterien geprüft: alle erfüllt 100 %, eines verfehlt 75 %, mehrere verfehlt 0 %.`
        : 'Es sind keine Muss-Kriterien aktiv; der Bonus wird voll ausgezahlt.',
    },
    ...geprueft.map(k => ({
      id: `kriterium-${k.id}`, label: k.label, hinweis: k.beschreibung,
      wert: kriteriumWert(k, q), punkt: true,
      ton: verfehltIds.has(k.id) ? 'negativ' : 'positiv',
    })),
    {
      id: 'bonus', label: <>Bonus heute <span className="vg-pfeil" aria-hidden="true" /> neu</>,
      gestapelt: true,
      wert: paarBetrag(bonus.alt, bonus.neu),
    },
    {
      id: 'bonusDelta', label: 'Differenz',
      wert: differenz(bonus.differenz), ton: tonAus(bonus.differenz),
    },
  ]
  return zeilen
}

/**
 * Datengrundlage: Produktion je Sparte (Vorjahr, Referenzzeitraum, Plan),
 * Bestand, Verträge, Kunden, gemeldete Vergütung und Zielerreichung. Die
 * Sparten-Paare darüber zeigen das Ergebnis; diese Tafel zeigt, worauf es
 * gerechnet ist — beide Welten laufen auf denselben Zahlen.
 */
function DatengrundlageTafel({ einheit, ergebnis }) {
  const p = einheit.produktion || {}
  const v = einheit.produktionVorjahr || {}
  const vv = einheit.produktionVorvorjahr || {}
  const z = einheit.zielvorgabe || {}
  const b = einheit.bestand || {}
  const jahr = einheit.referenzjahr ?? 2025
  const zielerreichung = ergebnis.ziel.bonusStufe?.zielerreichung ?? einheit.zielerreichung ?? 1
  const komposit = (p.kompositSuh ?? 0) + (p.kompositKfz ?? 0)
  const kompositVorjahr = (v.kompositSuh ?? 0) + (v.kompositKfz ?? 0)
  const kompositVorvorjahr = (vv.kompositSuh ?? 0) + (vv.kompositKfz ?? 0)
  const zeilen = [
    { id: 'leben', groesse: 'Beitragssumme Leben, Neugeschäft', vorvorjahr: vv.lebenBs, vorjahr: v.lebenBs, wert: p.lebenBs, plan: z.lebenBs, art: 'euro' },
    { id: 'bav', groesse: 'davon bAV', vorvorjahr: vv.lebenBsBav, vorjahr: v.lebenBsBav, wert: p.lebenBsBav, plan: z.lebenBsBav, art: 'euro', einzug: true },
    { id: 'bio', groesse: 'davon Biometrie', vorvorjahr: vv.lebenBsBiometrie, vorjahr: v.lebenBsBiometrie, wert: p.lebenBsBiometrie, plan: z.lebenBsBiometrie, art: 'euro', einzug: true },
    { id: 'komposit', groesse: 'Jahresbeitrag Komposit, Neugeschäft', vorvorjahr: kompositVorvorjahr, vorjahr: kompositVorjahr, wert: komposit, plan: z.komposit, art: 'euro' },
    { id: 'kfz', groesse: 'davon Kfz', vorvorjahr: vv.kompositKfz, vorjahr: v.kompositKfz, wert: p.kompositKfz, art: 'euro', einzug: true },
    { id: 'bestandLeben', groesse: 'Bestand Leben, Jahresbeitrag', wert: b.lebenBeitrag, art: 'euro' },
    { id: 'bestandKomposit', groesse: 'Bestand Komposit, Jahresbeitrag', wert: b.kompositBeitrag, art: 'euro' },
    { id: 'vertraege', groesse: 'Verträge im Bestand', wert: b.vertraege, art: 'zahl' },
    { id: 'kunden', groesse: 'Versicherungskunden', wert: b.versicherungskunden, art: 'zahl' },
    { id: 'zielerreichung', groesse: 'Zielerreichung der Bonusstaffel', wert: zielerreichung * 100, plan: 100, art: 'prozent' },
    { id: 'verguetung', groesse: 'Gemeldete Vergütung heute', wert: ergebnis.ist.gesamt, art: 'euroVoll', stark: true },
  ]
  const fmt = (zeile, wert) => {
    if (wert == null || Number.isNaN(wert)) return '–'
    if (zeile.art === 'zahl') return zahl(wert)
    if (zeile.art === 'prozent') return prozent(wert, 0)
    if (zeile.art === 'euroVoll') return euro(wert)
    return euroKompakt(wert)
  }
  const veraenderung = (zeile) => (zeile.vorjahr > 0 && zeile.wert != null ? ((zeile.wert - zeile.vorjahr) / zeile.vorjahr) * 100 : null)
  return (
    <Tafel
      titel="Datengrundlage im Referenzzeitraum"
      ton="neutral" dicht buendig className="vg-akte-reihe-voll"
      unter={`${REFERENZZEITRAUM_TEXT} · Produktion, Bestand und gemeldete Vergütung, auf die beide Modelle kalibriert sind`}
    >
      <Tabelle
        eng
        spalten={[
          { id: 'groesse', label: 'Größe', zelle: zeile => (
            <span className={zeile.einzug ? 'vg-schwach' : zeile.stark ? 'vg-stark' : undefined} style={zeile.einzug ? { paddingLeft: 14 } : undefined}>
              {zeile.groesse}
            </span>
          ) },
          { id: 'vorvorjahr', label: `${jahr - 2}`, num: true, zelle: zeile => <span className="vg-mono vg-schwach">{zeile.vorvorjahr != null ? fmt(zeile, zeile.vorvorjahr) : '–'}</span> },
          { id: 'vorjahr', label: `Vorjahr ${jahr - 1}`, num: true, zelle: zeile => <span className="vg-mono vg-schwach">{zeile.vorjahr != null ? fmt(zeile, zeile.vorjahr) : '–'}</span> },
          { id: 'wert', label: `Referenzzeitraum ${jahr}`, num: true, zelle: zeile => <span className={`vg-mono${zeile.einzug ? '' : ' vg-stark'}`}>{fmt(zeile, zeile.wert)}</span> },
          { id: 'delta', label: 'Veränderung zum Vorjahr', num: true, zelle: zeile => {
            const d = veraenderung(zeile)
            return d == null ? <span className="vg-schwach">–</span> : <span className="vg-mono vg-delta" data-ton={deltaTon(d)}>{prozentDelta(d)}</span>
          } },
          { id: 'plan', label: 'Plan', num: true, zelle: zeile => <span className="vg-mono vg-schwach">{zeile.plan != null ? fmt(zeile, zeile.plan) : '–'}</span> },
        ]}
        zeilen={zeilen}
        schluessel={zeile => zeile.id}
      />
    </Tafel>
  )
}

/**
 * Persönliche Produktion in den Referenzjahren: je Sparte die Säulenpaare
 * Vorjahr gegen Referenzzeitraum — Leben als Basis, bAV und Biometrie in
 * Beitragssumme, Komposit als Sach/Unfall/Haftpflicht und Kfz in
 * Jahresbeitrag — mit Werten und Delta-Marke wie die Vergütungspaare
 * darunter; der Plan des Referenzzeitraums steht in der Unterzeile. Es sind
 * die Zahlen der Datengrundlage-Tafel, hier als Bild: Woher kommt die
 * Vergütung, und wie hat sich das Geschäft zum Vorjahr bewegt? Die Säulen
 * tragen eigene Zeitfarben (Blau hell/dunkel), nicht Grau/Grün: Vorjahr ist
 * nicht „alte Provision“, Referenzzeitraum nicht „Zielmodell“.
 */
/**
 * Produktion in den Wertungsjahren: je Sparte (Leben, bAV, Biometrie in
 * Beitragssumme; Komposit in Jahresbeitrag) drei Säulen — Vorvorjahr,
 * Vorjahr, Referenzjahr — mit der Jahreszahl darunter und dem Wert darüber,
 * dazu die Stufenlinien der Bonusstaffel auf der Zielvorgabe und die
 * Plan-Linie. Keine Delta-Marke: das ist kein Modellvergleich, sondern das
 * Geschäft des Hauses. Das Referenzjahr ist hervorgehoben (Band, kräftiges
 * Zeitblau, „Referenzzeitraum“), weil heute und Zielmodell darauf rechnen.
 */
function ProduktionTafeln({ einheit, hebel, hoehe }) {
  const sparten = useMemo(() => spartenSaeulen(einheit, hebel), [einheit, hebel])
  return sparten.map(sp => (
    <Tafel key={sp.id} titel={sp.label} ton="neutral" unter={sp.einheit}>
      <SpartenSaeulen titel={sp.label} werte={sp.werte} stufen={sp.stufen} plan={sp.plan} hoehe={hoehe} />
    </Tafel>
  ))
}

/**
 * Provisionssätze heute gegen Zielmodell: je Komponente der Satz des Modells
 * (Regler, für alle Häuser gleich) und der für dieses Haus wirksame Satz —
 * Betrag geteilt durch Bemessungsgrundlage, also nach Kanalfaktor,
 * Wahlmodell-Mix, Requalifizierung, Ausschöpfungszuschlag, Journey-Teilung
 * und Kalibrierung. So sieht ein Vorstand, warum 33 → 34 ‰ im Modell für
 * sein Haus 33 → 25 ‰ heißen kann. Die Faktoren stehen mit ihren Werten
 * unter der Tabelle. Bonifikation und Zuschüsse haben eigene Tafeln.
 */
function SaetzeTafel({ einheit, ergebnis, hebel }) {
  const { ist, ziel } = ergebnis
  const p = einheit.produktion || {}
  const b = einheit.bestand || {}
  const kanal = einheit.kanal || 'sparkasse'
  const heute = (id) => HEBEL_INDEX[id]?.basis ?? 0
  const neu = (id) => hebel?.[id] ?? HEBEL_INDEX[id]?.standard ?? 0
  const bsBasis = Math.max(0, (p.lebenBs ?? 0) - (p.lebenBsBav ?? 0) - (p.lebenBsBiometrie ?? 0))
  const quote = (betrag, basis, faktor) => (basis > 0 && Number.isFinite(betrag) ? (betrag / basis) * faktor : null)

  const zeilen = [
    { id: 'apLebenBasis', name: 'Abschlussprovision Leben (Basis)', bemessung: 'Beitragssumme Neugeschäft', einheit: 'promille', stellen: 1,
      nominalAlt: heute('apLeben'), nominalNeu: neu('apLeben'),
      wirksamAlt: quote(ist.apLebenBasis, bsBasis, 1000), wirksamNeu: quote(ziel.apLebenBasis, bsBasis, 1000) },
    { id: 'apLebenBav', name: 'Abschlussprovision bAV', bemessung: 'Beitragssumme bAV, Basissatz plus Zuschlag', einheit: 'promille', stellen: 1,
      nominalAlt: heute('apLeben') * (1 + heute('zuschlagBav') / 100), nominalNeu: neu('apLeben') * (1 + neu('zuschlagBav') / 100),
      wirksamAlt: quote(ist.apLebenBav, p.lebenBsBav, 1000), wirksamNeu: quote(ziel.apLebenBav, p.lebenBsBav, 1000) },
    { id: 'apLebenBio', name: 'Abschlussprovision Biometrie', bemessung: 'Beitragssumme Biometrie, Basissatz plus Zuschlag', einheit: 'promille', stellen: 1,
      nominalAlt: heute('apLeben') * (1 + heute('zuschlagBiometrie') / 100), nominalNeu: neu('apLeben') * (1 + neu('zuschlagBiometrie') / 100),
      wirksamAlt: quote(ist.apLebenBio, p.lebenBsBiometrie, 1000), wirksamNeu: quote(ziel.apLebenBio, p.lebenBsBiometrie, 1000) },
    { id: 'apKompositSuh', name: 'Abschlussprovision Sach, Unfall, Haftpflicht', bemessung: 'Jahresbeitrag Neugeschäft', einheit: 'prozent', stellen: 1,
      nominalAlt: heute('apKomposit'), nominalNeu: neu('apKomposit'),
      wirksamAlt: quote(ist.apKompositSuh, p.kompositSuh, 100), wirksamNeu: quote(ziel.apKompositSuh, p.kompositSuh, 100) },
    { id: 'apKompositKfz', name: 'Abschlussprovision Kfz', bemessung: 'Jahresbeitrag Neugeschäft, nach Kfz-Abschlag', einheit: 'prozent', stellen: 1,
      nominalAlt: heute('apKomposit') * (1 - heute('kfzAbschlag') / 100), nominalNeu: neu('apKomposit') * (1 - neu('kfzAbschlag') / 100),
      wirksamAlt: quote(ist.apKompositKfz, p.kompositKfz, 100), wirksamNeu: quote(ziel.apKompositKfz, p.kompositKfz, 100) },
    { id: 'lpLeben', name: 'Laufende Provision Leben', bemessung: 'Beitragssumme je Neugeschäftsjahrgang, je Jahr der Laufzeit', einheit: 'promille', stellen: 2,
      nominalAlt: heute('lpLeben'), nominalNeu: neu('lpLeben'),
      wirksamAlt: quote(ist.lpProJahrgang, p.lebenBs, 1000), wirksamNeu: quote(ziel.lpProJahrgang, p.lebenBs, 1000) },
    { id: 'lpDauer', name: 'Laufzeit der laufenden Provision', bemessung: 'Jahre je Neugeschäftsjahrgang', einheit: 'jahre', stellen: 0,
      nominalAlt: heute('lpDauer'), nominalNeu: neu('lpDauer'),
      wirksamAlt: ist.lpDauer, wirksamNeu: ziel.lpDauer },
    { id: 'bpLeben', name: 'Bestandsprovision Leben', bemessung: 'Bestandsbeitrag Leben je Jahr', einheit: 'prozent', stellen: 2,
      nominalAlt: heute('bpLeben'), nominalNeu: neu('bpLeben'),
      wirksamAlt: quote(ist.bpLeben, b.lebenBeitrag, 100), wirksamNeu: quote(ziel.bpLeben, b.lebenBeitrag, 100) },
    { id: 'bpKomposit', name: 'Bestandsprovision Komposit', bemessung: 'Bestandsbeitrag Komposit je Jahr', einheit: 'prozent', stellen: 2,
      nominalAlt: heute('bpKomposit'), nominalNeu: neu('bpKomposit'),
      wirksamAlt: quote(ist.bpKomposit, b.kompositBeitrag, 100), wirksamNeu: quote(ziel.bpKomposit, b.kompositBeitrag, 100) },
  ]

  // Gleitkommareste (95 × 0,21 = 19,949999…) vor dem Runden glätten, damit
  // Satz und wirksamer Satz nicht 19,9 gegen 20,0 stehen, wo beide 19,95 sind.
  const glatt = (v) => (v == null || Number.isNaN(v) ? v : Math.round(v * 1e6) / 1e6)
  const satz = (v, z) => (v == null || Number.isNaN(v) ? '–' : `${zahl(glatt(v), z.stellen)} ${EINHEIT_ZEICHEN[z.einheit] ?? ''}`.trim())
  // Veränderung des wirksamen Satzes in Punkten seiner Einheit („−7,4 ‰“,
  // „−38,3 Pkt.“, „−8 Jahre“): relativ sagte die laufende Provision
  // „+2.344 %“, weil sie heute fast null ist.
  const PUNKTE = { promille: '‰', prozent: 'Pkt.', jahre: 'Jahre' }
  const veraenderung = (z) => {
    const a = z.wirksamAlt, n = z.wirksamNeu
    if (a == null || n == null || Number.isNaN(a) || Number.isNaN(n)) return null
    const d = glatt(n - a)
    if (Math.abs(d) < Math.pow(10, -z.stellen) / 2) return { text: '±0', ton: 'neutral' }
    const text = (d > 0 ? '+' : MINUS) + zahl(Math.abs(d), z.stellen)
    return { text: `${text} ${PUNKTE[z.einheit] ?? ''}`.trim(), ton: deltaTon(d) }
  }

  // Die Faktoren, die aus dem Satz des Modells den wirksamen Satz machen
  const faktor = (v) => `×${zahl(v ?? 1, 3)}`
  const mixText = (mix) => {
    const teile = Object.entries(mix || {}).filter(([, a]) => a > 0.005)
    return teile.length ? teile.map(([k, a]) => `${WAHLMODELLE[k]?.kurz ?? k} ${prozent(a * 100, 0)}`).join(', ') : '–'
  }
  const faktoren = [
    `Kanalfaktor ${KANAL_KURZ[kanal] ?? kanal}: Leben ${faktor(KANALFAKTOR.leben[kanal])}, Komposit ${faktor(KANALFAKTOR.komposit[kanal])}`,
    `Wahlmodell-Mix heute ${mixText(ist.saetze?.mix)}, im Zielmodell ${mixText(ziel.saetze?.mix)} (Hybrid und Laufend verlagern Abschluss- in laufende Provision, daher der Sprung der laufenden Provision)`,
    `Requalifizierung ${faktor(ist.requalifizierungsFaktor)} auf ${faktor(ziel.requalifizierungsFaktor)}`,
    `Ausschöpfungszuschlag ${faktor(ist.ausschoepfung?.faktor)} auf ${faktor(ziel.ausschoepfung?.faktor)}`,
    `Journey-Teilung: ${prozent((ist.partnerQuote ?? 1) * 100, 1)} auf ${prozent((ziel.partnerQuote ?? 1) * 100, 1)} der Neugeschäftsvergütung beim Haus`,
    'Kalibrierung auf die gemeldete Vergütung des Referenzzeitraums, je Komponente in beiden Welten gleich',
  ]

  return (
    <Tafel
      titel="Provisionssätze heute gegen Zielmodell"
      ton="neutral" dicht buendig className="vg-akte-reihe-voll"
      unter="Satz des Modells (Regler, für alle gleich) gegen den wirksamen Satz dieses Hauses (Betrag geteilt durch Bemessungsgrundlage)"
    >
      <Tabelle
        eng
        spalten={[
          { id: 'name', label: 'Komponente', zelle: z => (
            <span className="vg-akte-satz-name">
              <span>{z.name}</span>
              <span className="vg-t-sm vg-schwach">{z.bemessung}</span>
            </span>
          ) },
          { id: 'nominalAlt', label: 'Satz heute', num: true, zelle: z => <span className="vg-mono vg-schwach">{satz(z.nominalAlt, z)}</span> },
          { id: 'nominalNeu', label: 'Satz Zielmodell', num: true, zelle: z => (
            <span className={`vg-mono${Math.abs((z.nominalNeu ?? 0) - (z.nominalAlt ?? 0)) > 1e-9 ? ' vg-stark' : ''}`}>{satz(z.nominalNeu, z)}</span>
          ) },
          { id: 'wirksamAlt', label: 'Wirksam heute', num: true, zelle: z => <span className="vg-mono vg-schwach">{satz(z.wirksamAlt, z)}</span> },
          { id: 'wirksamNeu', label: 'Wirksam Zielmodell', num: true, zelle: z => <span className="vg-mono vg-stark">{satz(z.wirksamNeu, z)}</span> },
          { id: 'delta', label: 'Veränderung wirksam', num: true, wert: z => (veraenderung(z) ? z.wirksamNeu - z.wirksamAlt : null), zelle: z => {
            const d = veraenderung(z)
            return d ? <span className="vg-mono vg-delta" data-ton={d.ton}>{d.text}</span> : <span className="vg-schwach">–</span>
          } },
        ]}
        zeilen={zeilen}
        schluessel={z => z.id}
      />
      <p className="vg-t-sm vg-schwach vg-akte-satz-faktoren">
        Wirksam für dieses Haus heißt: {faktoren.join(' · ')}.
      </p>
    </Tafel>
  )
}

export default function Uebersicht({ einheit, ergebnis, hebel, portfolio }) {
  const breit = useBreit()
  const [szenarioOffen, setSzenarioOffen] = useState(false)
  const referenzjahr = einheit.referenzjahr ?? 2025
  const { ist, ziel } = ergebnis
  const q = einheit.qualitaet

  const sparten = useMemo(() => spartenPaare(ist, ziel), [ist, ziel])
  const abschluss = useMemo(() => produktionszeilen(ist, ziel, einheit), [ist, ziel, einheit])
  const folge = useMemo(() => bestandszeilen(ist, ziel, einheit), [ist, ziel, einheit])
  const bonus = useMemo(() => bonuszeilen(ist, ziel)[0], [ist, ziel])
  const zuschuesse = useMemo(
    () => zuschusszeilen(ist, ziel).map(z => ({ ...z, produkt: ZUSCHUSS_KURZ[z.id] ?? z.produkt })),
    [ist, ziel])
  const garantien = useMemo(() => garantiezeilen(ergebnis, hebel), [ergebnis, hebel])
  const bonifikation = useMemo(() => bonifikationZeilen(bonus, ziel.gate, q), [bonus, ziel.gate, q])
  const paare = useMemo(() => bauteilPaare(ist, ziel), [ist, ziel])

  const b = einheit.bestand
  const bestand = [
    { id: 'leben', label: 'Leben', wert: b.lebenBeitrag, anzeige: achseEuro(b.lebenBeitrag), balken: true },
    { id: 'komposit', label: 'Komposit', wert: b.kompositBeitrag, anzeige: achseEuro(b.kompositBeitrag), balken: true },
    { id: 'vertraege', label: 'Verträge', wert: b.vertraege, anzeige: b.vertraege != null ? zahl(b.vertraege) : '–', balken: false },
    { id: 'kunden', label: 'Versicherungskunden', wert: b.versicherungskunden, anzeige: b.versicherungskunden != null ? zahl(b.versicherungskunden) : '–', balken: false },
  ]

  const latten = [
    { id: 'storno', label: 'Storno', wert: ziel.qualitaetsTeil.storno, anzeige: prozent(q.storno * 100) },
    { id: 'duration', label: 'Beitragsduration', wert: ziel.qualitaetsTeil.duration, anzeige: `${zahl(q.duration, 1)} Jahre` },
    { id: 'ausschoepfung', label: 'Bestandsausschöpfung', wert: ziel.qualitaetsTeil.ausschoepfung, anzeige: prozent(q.ausschoepfung * 100) },
    { id: 'weiterbildung', label: 'Weiterbildung', wert: ziel.qualitaetsTeil.weiterbildung, anzeige: prozent(q.weiterbildung * 100) },
  ]

  return (
    <>
    <div className="vg-tafeln vg-akte-tafeln">
      {/* Reihe 0: die persönliche Produktion der Wertungsjahre, woher die
          Vergütung kommt; das Referenzjahr ist die Basis beider Modelle */}
      <div className="vg-akte-werkzeuge">
        <span className="vg-t-sm vg-schwach">Produktion in den Wertungsjahren {referenzjahr - 2} bis {referenzjahr} · das Referenzjahr {referenzjahr} ist die Basis für heute und Zielmodell</span>
      </div>
      <ProduktionTafeln einheit={einheit} hebel={hebel} hoehe={breit ? 190 : 165} />

      {/* Werkzeugzeile über den Sparten: die Szenarioanalyse rechnet beide
          Welten auf veränderter Produktion und verändertem Bestand */}
      <div className="vg-akte-werkzeuge">
        <span className="vg-t-sm vg-schwach">Vergütung je Sparte heute gegen Zielmodell im Referenzzeitraum</span>
        <Btn ikone={SlidersHorizontal} groesse="sm" onClick={() => setSzenarioOffen(true)} aria-expanded={szenarioOffen}>
          Szenarioanalyse
        </Btn>
      </div>

      {/* Reihe 1: Sparten — heute gegen Zielmodell, wie im Kasten */}
      {sparten.map(sp => (
        <Tafel key={sp.id} titel={sp.label} ton="neutral" unter={SPARTEN_UNTER[sp.id]}>
          <PaarVergleich paare={[sp]} hoehe={breit ? 220 : 190} />
        </Tafel>
      ))}

      {/* Reihe 1a: worauf beide Modelle rechnen */}
      <DatengrundlageTafel einheit={einheit} ergebnis={ergebnis} />

      {/* Reihe 1b: mit welchen Sätzen — Modell und wirksam für dieses Haus */}
      <SaetzeTafel einheit={einheit} ergebnis={ergebnis} hebel={hebel} />

      {/* Reihe 2: Abschluss- und Folgeprovisionen */}
      <Tafel titel="Abschlussprovisionen" ton="abschluss" breit={2} dicht buendig unter="Beträge in EUR">
        <VergleichsTafel spalten={SPALTEN_ABSCHLUSS} zeilen={abschluss} summe={summenzeile(abschluss)} />
      </Tafel>
      <Tafel titel="Folgeprovisionen" ton="folge" breit={2} dicht buendig unter="Beträge in EUR">
        <VergleichsTafel spalten={SPALTEN_FOLGE} zeilen={folge} summe={summenzeile(folge)} />
      </Tafel>

      {/* Reihe 3: Bestand, Bonifikation, Garantien, Zuschüsse */}
      {/* Die vier Tafeln tragen `vg-akte-reihe-3`: unter 1280 px spannen sie
          je zwei Rasterspalten (akte.css), weil vier Tabellenspalten und die
          Label/Wert-Listen in 220 px nicht lesbar bleiben. */}
      <Tafel titel="Bestand" ton="neutral" unter="Jahresbeitrag in EUR" className="vg-akte-reihe-3">
        <BestandBalken zeilen={bestand} />
      </Tafel>
      <Tafel titel="Bonifikation" ton="folge" dicht unter="Beträge in EUR" className="vg-akte-reihe-3">
        <LabelWert zeilen={bonifikation} />
      </Tafel>
      <Tafel titel="Garantien und Übergang" ton="sonst" dicht className="vg-akte-reihe-3">
        <LabelWert zeilen={garantien} />
      </Tafel>
      {/* Alle vier Spalten (Posten · Alt · Neu · Differenz) stehen in der
          Referenzbreite: akte.css hält die Alt-Spalte bis 280 px Tafelbreite
          (bei 1600 px ist die Tafel 287 px breit; tafel.css allein nähme sie
          schon unter 300 px). `weichend` bleibt als letztes Netz für
          Zwischenbreiten, in denen vier Spalten nicht mehr tragen. */}
      <Tafel titel="Zuschüsse" ton="sonst" dicht buendig unter="in EUR" className="vg-akte-eng vg-akte-reihe-3">
        <VergleichsTafel spalten={SPALTEN_ZUSCHUSS} zeilen={zuschuesse} summe={summenzeile(zuschuesse)} weichend={['alt']} />
      </Tafel>

      {/* Reihe 4: Paarvergleich und Qualitätsprofil */}
      <Tafel titel="Heute gegen Zielmodell" ton="neutral" breit={2} unter="Je Bauteil zwei Säulen mit ihren Werten, das Delta als Marke darüber">
        <PaarVergleich paare={paare} hoehe={220} />
      </Tafel>
      <Tafel titel="Qualitätsprofil" ton="neutral" breit={2} unter="Wie die Kennzahlen auf die Vergütung wirken">
        <div className="vg-akte-qualitaet">
          {latten.map(t => (
            <div key={t.id} className="vg-akte-messlatte">
              <span className="vg-t-sm vg-akte-messlatte-label" title={t.label}>{t.label}</span>
              <span className="vg-mono vg-t-sm vg-schwach vg-akte-messlatte-wert">{t.anzeige}</span>
              <span className="vg-akte-messlatte-latte">
                <Messlatte
                  anteil={t.wert} hoehe={7}
                  farbe={t.wert >= .66 ? 'var(--vg-positiv)' : t.wert >= .34 ? 'var(--vg-warnung)' : 'var(--vg-negativ)'}
                />
              </span>
            </div>
          ))}
        </div>
      </Tafel>
    </div>
    <Szenarioanalyse
      offen={szenarioOffen}
      onSchliessen={() => setSzenarioOffen(false)}
      einheit={einheit}
      ergebnis={ergebnis}
      hebel={hebel}
      portfolio={portfolio}
    />
    </>
  )
}
