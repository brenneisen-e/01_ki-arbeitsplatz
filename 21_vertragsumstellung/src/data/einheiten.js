// ============================================================
// ADAPTER: Demodaten -> Rechenkontrakt der Engine
//
// Die Demodaten in sparkassen.js / agenturen.js liegen in der
// fachlichen Struktur der Vertriebssteuerung vor. Die Engine in
// src/lib/modell.js erwartet einen schlanken, einheitlichen
// Kontrakt. Dieses Modul übersetzt zwischen beiden.
//
// KALIBRIERUNG: Für jede Einheit wird einmalig ein Faktor je
// Vergütungskomponente bestimmt, sodass die Modellrechnung mit
// den IST-Hebeln exakt die gemeldete Vergütung des Referenz-
// Wertungsjahres trifft. Der Faktor ist eine Konstante der
// Einheit und wirkt in beiden Welten gleich - Deltas, Wasserfall
// und Aggregation bleiben davon unberührt.
// ============================================================

import { institute } from './sparkassen'
import { agenturen, aoSammelposition, direktkanal } from './agenturen'
import { berechneEinheit } from '../lib/modell'
import { istHebel } from '../lib/hebel'
import { datum } from '../lib/format'

export const DEMO_HINWEIS =
  'Demodaten — plausible Größenordnungen, keine realen Vergütungskennzahlen.'

export const REFERENZ_WERTUNGSJAHR = 2025

/**
 * Referenzzeitraum der gemeldeten Zahlen: das letzte abgeschlossene
 * Wertungsjahr, benannt nach seinem Startjahr (Wertungsjahr 2025 läuft vom
 * 01.09.2025 bis 31.08.2026). „Heute“ und „Zielmodell“ rechnen beide auf
 * Produktion und Bestand dieses Zeitraums — nur das Modell unterscheidet
 * sich. Der Steuerblock nennt den Zeitraum unter den Summenzeilen.
 */
export const REFERENZZEITRAUM = {
  von: `${REFERENZ_WERTUNGSJAHR}-09-01`,
  bis: `${REFERENZ_WERTUNGSJAHR + 1}-08-31`,
}
export const REFERENZZEITRAUM_TEXT = `${datum(REFERENZZEITRAUM.von)} – ${datum(REFERENZZEITRAUM.bis)}`
export const GO_LIVE = '2028-01-01'

export const KANAL_LABEL = {
  sparkasse: 'Sparkassen',
  ao: 'Ausschließlichkeitsorganisation',
  direkt: 'Direktkanal und Zentrale',
}

export const KANAL_KURZ = {
  sparkasse: 'Sparkasse',
  ao: 'Agentur',
  direkt: 'Direkt',
}

// --------------------------------------------------- Übersetzung

const PRODUKTIONSFELDER = ['lebenBs', 'lebenBsBav', 'lebenBsBiometrie', 'kompositSuh', 'kompositKfz']

/** Ganzzahliger Streuwert einer Zeichenkette (deterministisch, ohne Zufall) */
function streuwert(text) {
  let h = 0
  for (let i = 0; i < text.length; i++) h = (h * 31 + text.charCodeAt(i)) | 0
  return h
}

/** Nachkommateil von sin(streuwert) · 10000 — gleichverteilt in 0..1, je Aufruf gleich */
function rauschen(schluessel) {
  const x = Math.sin(streuwert(schluessel)) * 10000
  return x - Math.floor(x)
}

/**
 * Vorjahresproduktion: die Demodaten führen nur das Referenzjahr. Das Vorjahr
 * wird je Feld deterministisch aus der Referenzproduktion abgeleitet
 * (Faktor 0,88 bis 1,06), damit die Sparten-Säulen zwei Jahre zeigen können.
 */
function produktionVorjahrVon(id, produktion) {
  const vorjahr = {}
  for (const feld of PRODUKTIONSFELDER) {
    const faktor = 0.88 + 0.18 * rauschen(`${id}:${feld}`)
    vorjahr[feld] = Math.round((produktion[feld] ?? 0) * faktor)
  }
  return vorjahr
}

/**
 * Vorvorjahr: ein weiterer Schritt zurück vom Vorjahr (Faktor 0,90 bis
 * 1,04, eigener Streuschlüssel), damit die Produktions-Tafeln der Akte drei
 * Wertungsjahre zeigen — das Referenzjahr als drittes, hervorgehoben.
 */
function produktionVorvorjahrVon(id, vorjahr) {
  const vorvorjahr = {}
  for (const feld of PRODUKTIONSFELDER) {
    const faktor = 0.9 + 0.14 * rauschen(`${id}:${feld}:vorvorjahr`)
    vorvorjahr[feld] = Math.round((vorjahr[feld] ?? 0) * faktor)
  }
  return vorvorjahr
}

/** Zielvorgabe: die Produktion, bei der die Zielerreichung genau 100 % wäre */
function zielvorgabeVon(produktion, zielerreichung) {
  const z = zielerreichung > 0 ? zielerreichung : 1
  return {
    lebenBs: produktion.lebenBs / z,
    lebenBsBav: (produktion.lebenBsBav ?? 0) / z,
    lebenBsBiometrie: (produktion.lebenBsBiometrie ?? 0) / z,
    komposit: ((produktion.kompositSuh ?? 0) + (produktion.kompositKfz ?? 0)) / z,
  }
}

/**
 * Geschäftsstellen als Bemessung des Standortzuschusses: Sparkassen aus den
 * Stammdaten, eine Agentur zählt als eine Geschäftsstelle (die Sammelposition
 * mit ihrer Anzahl), der Direktkanal als keine.
 */
function geschaeftsstellenVon(roh, kanal) {
  if (kanal === 'direkt') return 0
  if (kanal === 'ao') return roh.anzahlAgenturen ?? 1
  return roh.stammdaten?.geschaeftsstellenGesamt ?? 0
}

function journeyMixVon(steuerung, kanal) {
  const j = steuerung?.journeyMix
  if (j) {
    return {
      vertriebspartner: j.vertriebspartnerJourney ?? 0,
      lead: j.leadJourney ?? 0,
      schrankfertig: j.schrankfertigesGeschaeft ?? 0,
      direkt: j.direktJourney ?? 0,
    }
  }
  if (kanal === 'ao') return { vertriebspartner: 0.78, lead: 0.12, schrankfertig: 0.04, direkt: 0.06 }
  return { vertriebspartner: 0.6, lead: 0.2, schrankfertig: 0.12, direkt: 0.08 }
}

function beschwerdequoteVon(q) {
  // Aus dem Beratungsqualitätsindex abgeleitet, sonst aus dem Storno.
  if (Number.isFinite(q.beratungsqualitaetIndex)) {
    return Math.max(0, Math.round((100 - q.beratungsqualitaetIndex) / 12 * 10) / 10)
  }
  return Math.max(0, Math.round((q.stornoquoteLeben * 0.34) * 10) / 10)
}

/**
 * Lesbarer Kurzname für Diagramme und enge Spalten.
 * Kürzel wie "OSD" sind im Gespräch nicht anschlussfähig - hier wird
 * der sprechende Teil des Namens verwendet.
 */
function kurznameVon(roh, kanal) {
  const name = roh.name || ''
  if (kanal === 'direkt') return 'Direktkanal'
  if (/Sammelposition/i.test(name)) return 'Übrige Agenturen'
  if (kanal === 'ao') return name.replace(/^Agentur\s+/i, '')
  if (/^Erzgebirgssparkasse/i.test(name)) return 'Erzgebirge'
  const rest = name
    .replace(/^(Ostsächsische|Sächsische|Stadt-\s*und\s*)?\s*(Kreissparkasse|Sparkasse)\s*/i, '')
    .trim()
  return rest || roh.sitz || name
}

function baueEinheit(roh, kanal) {
  const ng = roh.neugeschaeft
  const best = roh.bestand
  const q = roh.qualitaet
  const st = roh.steuerung || {}
  const iv = roh.istVerguetung
  const kfz = st.kfzAnteilKomposit ?? 0.35

  const bavAnteil = (ng.bavAnteilProzent ?? 8) / 100
  const bioAnteil = (ng.biometrieAnteilProzent ?? 6) / 100

  const lp = iv.davonLaufendeProvisionLeben ?? 0
  const bpKomposit = (iv.bestandsprovision ?? 0) - lp
  const zielerreichung = st.zielerreichungVorjahr ?? 1

  const produktion = {
    lebenBs: ng.lebenBeitragssumme,
    lebenBsBav: Math.round(ng.lebenBeitragssumme * bavAnteil),
    lebenBsBiometrie: Math.round(ng.lebenBeitragssumme * bioAnteil),
    lebenJahresbeitrag: ng.lebenJahresbeitrag ?? null,
    lebenStueck: ng.lebenStueck ?? null,
    kompositSuh: Math.round(ng.kompositJahresbeitrag * (1 - kfz)),
    kompositKfz: Math.round(ng.kompositJahresbeitrag * kfz),
    kompositJahresbeitrag: ng.kompositJahresbeitrag,
    kompositStueck: ng.kompositStueck ?? null,
  }

  return {
    id: roh.id,
    name: roh.name,
    kurz: kurznameVon(roh, kanal),
    sitz: roh.sitz || roh.ort || 'Dresden',
    region: roh.region || KANAL_LABEL[kanal],
    kanal,
    typ: kanal === 'sparkasse' ? 'institut' : kanal === 'ao' ? 'agentur' : 'kanal',
    groessenklasse: roh.groessenklasse,
    stammdaten: roh.stammdaten,
    mitarbeiter: roh.mitarbeiter,
    anzahlAgenturen: roh.anzahlAgenturen,
    geschaeftsstellen: geschaeftsstellenVon(roh, kanal),
    referenzjahr: REFERENZ_WERTUNGSJAHR,

    produktion,
    produktionVorjahr: produktionVorjahrVon(roh.id, produktion),
    produktionVorvorjahr: produktionVorvorjahrVon(roh.id, produktionVorjahrVon(roh.id, produktion)),
    zielvorgabe: zielvorgabeVon(produktion, zielerreichung),
    bestand: {
      lebenBeitrag: best.lebenJahresbeitrag,
      kompositBeitrag: best.kompositJahresbeitrag,
      vertraege: best.vertraegeGesamt ?? null,
      versicherungskunden: best.versicherungskunden ?? null,
      lebenRestbeitragssumme: best.lebenRestbeitragssumme ?? null,
    },
    qualitaet: {
      storno: q.stornoquoteLeben / 100,
      stornoKomposit: (q.stornoquoteKomposit ?? q.stornoquoteLeben) / 100,
      weiterbildung: q.weiterbildungsquote / 100,
      duration: q.mittlereBeitragsdurationLeben,
      ausschoepfung: (q.bestandsausschoepfungsquote ?? 14) / 100,
      beitragsfreistellung: (q.beitragsfreistellungsquote ?? 8) / 100,
      vertragsdichte: best.vertragsdichte ?? 2,
      beschwerden: beschwerdequoteVon(q),
      beratungsqualitaetIndex: q.beratungsqualitaetIndex ?? null,
    },
    zielerreichung,
    apOnlyQuote: st.apOnlyQuote ?? 0.85,
    kfzAnteil: kfz,
    journeyMix: journeyMixVon(st, kanal),
    erwarteteModellwahl: st.erwarteteModellwahl || null,
    wahlmodellPraeferenz: st.wahlmodellPraeferenz || null,

    zuschuesse: { fix: 0, kleinteilig: iv.zuschuesseSonstiges ?? 0, sonder: 0 },

    // gemeldete Vergütung des Referenzjahres (führende Wahrheit)
    gemeldet: {
      apLeben: iv.apLeben ?? 0,
      apKomposit: iv.apKomposit ?? 0,
      lp,
      bpLeben: 0,
      bpKomposit,
      bonus: iv.bonusstaffel ?? 0,
      zuschuesse: iv.zuschuesseSonstiges ?? 0,
      gesamt: iv.summe ?? 0,
    },

    uebergangsregel: roh.uebergangsregel || null,
    verhandlung: roh.verhandlung || null,
    potenzial: roh.potenzial || null,
    verguetungsklasse: roh.verguetungsklasse || null,
  }
}

// --------------------------------------------------- Kalibrierung

const KOMPONENTEN = ['apLeben', 'apKomposit', 'lp', 'bpKomposit']

/**
 * Zwei Durchgänge: erst die Kernkomponenten, dann der Bonus.
 * Der Bonus bemisst sich an der Abschlussvergütung - sein Faktor
 * darf deshalb erst bestimmt werden, wenn die Abschlussvergütung
 * bereits kalibriert ist. Sonst wird deren Faktor doppelt gezählt
 * und die Modellrechnung verfehlt die gemeldete Vergütung.
 */
function kalibriere(einheit) {
  const basis = istHebel()

  const roh = berechneEinheit({ ...einheit, kalibrierung: null }, basis, { bonusNormierung: 1 })
  const k = { bpLeben: 1 }
  for (const komp of KOMPONENTEN) {
    const soll = einheit.gemeldet[komp]
    const ist = roh[komp]
    k[komp] = ist > 1 && soll > 0 ? soll / ist : (soll > 0 ? 1 : 0)
  }

  const zwischen = berechneEinheit({ ...einheit, kalibrierung: { ...k, bonus: 1 } }, basis, { bonusNormierung: 1 })
  const sollBonus = einheit.gemeldet.bonus
  k.bonus = zwischen.bonusRoh > 1 && sollBonus > 0 ? sollBonus / zwischen.bonusRoh : (sollBonus > 0 ? 1 : 0)

  return { ...einheit, kalibrierung: k }
}

// --------------------------------------------------- Export

export const SPARKASSEN = institute.map(i => kalibriere(baueEinheit(i, 'sparkasse')))

export const AGENTUREN = [
  ...agenturen.map(a => kalibriere(baueEinheit(a, 'ao'))),
  kalibriere(baueEinheit(aoSammelposition, 'ao')),
]

export const DIREKT = [kalibriere(baueEinheit(direktkanal, 'direkt'))]

/** Alle Vertriebseinheiten des Portfolios */
export const EINHEITEN = [...SPARKASSEN, ...AGENTUREN, ...DIREKT]

export const EINHEIT_INDEX = Object.fromEntries(EINHEITEN.map(e => [e.id, e]))

export function einheit(id) {
  return EINHEIT_INDEX[id] || null
}

export function einheitenDesKanals(kanal) {
  return EINHEITEN.filter(e => e.kanal === kanal)
}

// --------------------------------------------------- Kennzahlen

function summeUeber(liste, pfad) {
  return liste.reduce((s, e) => {
    const v = pfad.reduce((a, k) => (a == null ? a : a[k]), e)
    return s + (Number.isFinite(v) ? v : 0)
  }, 0)
}

export const PORTFOLIO_KENNZAHLEN = {
  stichtag: REFERENZZEITRAUM.bis,
  institute: SPARKASSEN.length,
  agenturen:
    agenturen.length + (aoSammelposition.anzahlAgenturen ?? 0),
  berater: SPARKASSEN.reduce((s, i) => s + (i.stammdaten?.sFinanzberater ?? 0), 0),
  vertriebspartner: SPARKASSEN.reduce((s, i) => s + (i.stammdaten?.vertriebspartnerGesamt ?? 0), 0),
  bankkunden: SPARKASSEN.reduce((s, i) => s + (i.stammdaten?.bankkunden ?? 0), 0),
  neugeschaeftLeben: summeUeber(EINHEITEN, ['produktion', 'lebenBs']),
  neugeschaeftKomposit: summeUeber(EINHEITEN, ['produktion', 'kompositJahresbeitrag']),
  bestandLeben: summeUeber(EINHEITEN, ['bestand', 'lebenBeitrag']),
  bestandKomposit: summeUeber(EINHEITEN, ['bestand', 'kompositBeitrag']),
  vertraege: summeUeber(EINHEITEN, ['bestand', 'vertraege']),
  versicherungskunden: summeUeber(EINHEITEN, ['bestand', 'versicherungskunden']),
  verguetungIst: summeUeber(EINHEITEN, ['gemeldet', 'gesamt']),
}

PORTFOLIO_KENNZAHLEN.beitragseinnahmen =
  PORTFOLIO_KENNZAHLEN.bestandLeben + PORTFOLIO_KENNZAHLEN.bestandKomposit

PORTFOLIO_KENNZAHLEN.vertragsdichte =
  PORTFOLIO_KENNZAHLEN.versicherungskunden > 0
    ? PORTFOLIO_KENNZAHLEN.vertraege / PORTFOLIO_KENNZAHLEN.versicherungskunden
    : 0

/**
 * Selbstprüfung: Trifft die kalibrierte Modellrechnung die gemeldete
 * Vergütung? Wird im Marken-/Diagnosepanel angezeigt.
 */
export function pruefeKalibrierung() {
  const basis = istHebel()
  const abweichungen = []
  for (const e of EINHEITEN) {
    const r = berechneEinheit(e, basis, { bonusNormierung: 1 })
    const diff = r.gesamt - e.gemeldet.gesamt
    const rel = e.gemeldet.gesamt > 0 ? Math.abs(diff) / e.gemeldet.gesamt : 0
    if (rel > 0.0005) {
      abweichungen.push({ id: e.id, name: e.name, gemeldet: e.gemeldet.gesamt, berechnet: r.gesamt, abweichung: diff })
    }
  }
  return { bestanden: abweichungen.length === 0, abweichungen }
}

// --------------------------------------------------- Vertriebspartner

import { vertriebspartnerFuer as rohePartner } from './vertriebspartner'

const partnerCache = new Map()

function bauePartner(vp, institut) {
  const kfz = institut.kfzAnteil ?? 0.35
  const jb = vp.produktion.kompositJahresbeitrag
  const bs = vp.produktion.lebenBeitragssumme
  const q = vp.qualitaet
  const iv = vp.istVerguetungsbeitrag
  const zielerreichung = q.zielerreichung ?? 1

  const produktion = {
    lebenBs: bs,
    lebenBsBav: Math.round(bs * 0.09),
    lebenBsBiometrie: Math.round(bs * 0.06),
    lebenJahresbeitrag: Math.round(bs / Math.max(1, q.mittlereBeitragsdurationLeben)),
    lebenStueck: vp.produktion.lebenStueck ?? null,
    kompositSuh: Math.round(jb * (1 - kfz)),
    kompositKfz: Math.round(jb * kfz),
    kompositJahresbeitrag: jb,
    kompositStueck: vp.produktion.kompositStueck ?? null,
  }

  return {
    id: vp.id,
    name: vp.name,
    kurz: vp.name,
    sitz: vp.geschaeftsstelle,
    region: institut.name,
    kanal: institut.kanal,
    typ: 'vertriebspartner',
    institutId: institut.id,
    rolle: vp.rolle,
    geschaeftsstelle: vp.geschaeftsstelle,
    imVertriebSeit: vp.imVertriebSeit,
    wahlmodellPraeferenz: vp.wahlmodellPraeferenz,
    referenzjahr: REFERENZ_WERTUNGSJAHR,

    produktion,
    produktionVorjahr: produktionVorjahrVon(vp.id, produktion),
    produktionVorvorjahr: produktionVorvorjahrVon(vp.id, produktionVorjahrVon(vp.id, produktion)),
    zielvorgabe: zielvorgabeVon(produktion, zielerreichung),
    bestand: {
      lebenBeitrag: vp.betreuterBestand.lebenJahresbeitrag,
      kompositBeitrag: vp.betreuterBestand.kompositJahresbeitrag,
      vertraege: null,
      versicherungskunden: null,
    },
    qualitaet: {
      storno: q.stornoquoteLeben / 100,
      stornoKomposit: (q.stornoquoteLeben * 1.4) / 100,
      weiterbildung: Math.min(1, (q.weiterbildungsstunden ?? 30) / 34),
      duration: q.mittlereBeitragsdurationLeben,
      ausschoepfung: (q.bestandsausschoepfungsquote ?? 14) / 100,
      beitragsfreistellung: institut.qualitaet.beitragsfreistellung,
      vertragsdichte: institut.qualitaet.vertragsdichte,
      beschwerden: institut.qualitaet.beschwerden,
    },
    zielerreichung,
    apOnlyQuote: institut.apOnlyQuote,
    kfzAnteil: kfz,
    journeyMix: institut.journeyMix,
    zuschuesse: { fix: 0, kleinteilig: 0, sonder: 0 },
    gemeldet: {
      apLeben: iv.apLeben ?? 0,
      apKomposit: iv.apKomposit ?? 0,
      lp: 0,
      bpLeben: 0,
      bpKomposit: iv.bestandsprovision ?? 0,
      bonus: iv.bonusanteil ?? 0,
      zuschuesse: 0,
      gesamt: iv.summe ?? 0,
    },
  }
}

/**
 * Vertriebspartner eines Instituts im Rechenkontrakt der Engine.
 *
 * Vor der Kalibrierung werden die Einzelwerte exakt auf die
 * Institutssummen normiert. Ohne diesen Schritt fehlten den
 * Partnern die laufende Provision und die Zuschüsse des Instituts -
 * ihre Kalibrierungsfaktoren würden auf null laufen und das
 * Zielmodell könnte für sie keine laufende Provision erzeugen.
 * Die Summe der Partner ergibt danach exakt den Institutswert.
 */
export function vertriebspartnerEinheiten(institutId) {
  if (partnerCache.has(institutId)) return partnerCache.get(institutId)
  const institut = EINHEIT_INDEX[institutId]
  if (!institut || institut.kanal !== 'sparkasse') { partnerCache.set(institutId, []); return [] }

  const roh = rohePartner(institutId).map(vp => bauePartner(vp, institut))
  if (!roh.length) { partnerCache.set(institutId, []); return [] }

  // Anteil je Partner an der Beitragssumme Leben - Verteilungsschlüssel
  // für alle Größen, die nur auf Institutsebene gemeldet sind.
  const summeBs = roh.reduce((s, p) => s + p.produktion.lebenBs, 0) || 1
  const summeBestandLeben = roh.reduce((s, p) => s + p.bestand.lebenBeitrag, 0) || 1
  const summeBestandKomposit = roh.reduce((s, p) => s + p.bestand.kompositBeitrag, 0) || 1

  const skalaLeben = institut.bestand.lebenBeitrag / summeBestandLeben
  const skalaKomposit = institut.bestand.kompositBeitrag / summeBestandKomposit

  const liste = roh.map(p => {
    const anteil = p.produktion.lebenBs / summeBs
    const bestandLeben = Math.round(p.bestand.lebenBeitrag * skalaLeben)
    const bestandKomposit = Math.round(p.bestand.kompositBeitrag * skalaKomposit)
    const lp = Math.round(institut.gemeldet.lp * anteil)
    const zuschuesse = Math.round(institut.gemeldet.zuschuesse * anteil)
    const bpKomposit = Math.round(p.gemeldet.bpKomposit * skalaKomposit)

    return kalibriere({
      ...p,
      // Anteilig statt je Partner eine Geschäftsstelle: die Summe der Partner
      // muss den Standortzuschuss des Instituts ergeben.
      geschaeftsstellen: (institut.geschaeftsstellen ?? 0) * anteil,
      bestand: { ...p.bestand, lebenBeitrag: bestandLeben, kompositBeitrag: bestandKomposit },
      zuschuesse: { fix: 0, kleinteilig: zuschuesse, sonder: 0 },
      gemeldet: {
        ...p.gemeldet,
        lp,
        bpKomposit,
        zuschuesse,
        gesamt: p.gemeldet.apLeben + p.gemeldet.apKomposit + lp + bpKomposit + p.gemeldet.bonus + zuschuesse,
      },
    })
  })

  partnerCache.set(institutId, liste)
  return liste
}

/** Prüft, ob die Partner eines Instituts exakt dessen Werte ergeben */
export function pruefePartnersummen(institutId) {
  const institut = EINHEIT_INDEX[institutId]
  const liste = vertriebspartnerEinheiten(institutId)
  if (!institut || !liste.length) return null
  const summe = (fn) => liste.reduce((s, p) => s + fn(p), 0)
  return {
    lebenBs: { soll: institut.produktion.lebenBs, ist: summe(p => p.produktion.lebenBs) },
    bestandLeben: { soll: institut.bestand.lebenBeitrag, ist: summe(p => p.bestand.lebenBeitrag) },
    bestandKomposit: { soll: institut.bestand.kompositBeitrag, ist: summe(p => p.bestand.kompositBeitrag) },
    verguetung: { soll: institut.gemeldet.gesamt, ist: summe(p => p.gemeldet.gesamt) },
  }
}
