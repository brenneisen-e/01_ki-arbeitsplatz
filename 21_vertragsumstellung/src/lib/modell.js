// ============================================================
// RECHEN-ENGINE DES VERGÜTUNGSMODELLS
//
// Eine Engine für beide Werkzeuge:
//   Modell-Simulation (Makro) = Aggregation über alle Einheiten
//   Umstellungstool   (Mikro) = dieselbe Einheit einzeln
//
// Invariante: Summe der Einzelergebnisse = Makro-Ergebnis.
// Es gibt keine zweite Formel, keine zweite Bonuslogik.
//
// Zwei Bewertungssichten, die im Zielmodell auseinanderfallen
// und genau deshalb beide gezeigt werden:
//   EINGESCHWUNGEN  alle Jahrgänge der laufenden Provision zahlen
//   KASSENWIRKSAM   Zahlungsstrom des konkreten Kalenderjahres
// ============================================================

import { HEBEL, HEBEL_INDEX, istHebel, anteilKlassisch, BONUS_SATZ_IDS, BONUS_SCHWELLE_IDS } from './hebel'

// --------------------------------------------------- Modellkonstanten

/** Faktorprofile der vier Wahlmodelle auf dieselben Basissätze */
export const WAHLMODELLE = {
  klassisch: {
    id: 'klassisch', label: 'AP/FP-Modell', kurz: 'AP/FP',
    beschreibung: 'Unveränderte Abschlussorientierung. Heute das Modell von über drei Vierteln der Partner.',
    leben: { ap: 1.0, lp: 1.0, bp: 1.0 }, komposit: { ap: 1.0, bp: 1.0 },
  },
  umdecker: {
    id: 'umdecker', label: 'Umdecker-Modell', kurz: 'Umdecker',
    beschreibung: 'Befristet erhöhte Abschlussvergütung als Aktivierungshebel gegen den Wettbewerb.',
    leben: { ap: 1.25, lp: 0.0, bp: 0.6 }, komposit: { ap: 1.36, bp: 0.78 },
  },
  hybrid: {
    id: 'hybrid', label: 'Hybrid-Modell', kurz: 'Hybrid',
    beschreibung: 'Verlagert Vergütung von der Abschluss- in die laufende und Bestandsvergütung.',
    leben: { ap: 0.68, lp: 3.2, bp: 2.4 }, komposit: { ap: 0.64, bp: 1.44 },
  },
  laufend: {
    id: 'laufend', label: 'Laufendes Modell', kurz: 'Laufende\nProvision', kurz: 'Laufend',
    beschreibung: 'Für bestandsorientierte Partner: minimale Vorab-, hohe laufende Vergütung.',
    leben: { ap: 0.34, lp: 6.4, bp: 4.0 }, komposit: { ap: 0.27, bp: 1.89 },
  },
}

/** Kanalfaktoren auf die Basissätze (Struktur, kein Verhandlungsgegenstand) */
export const KANALFAKTOR = {
  leben: { sparkasse: 1.0, ao: 1.0, zentrale: 0.86, direkt: 0.34 },
  komposit: { sparkasse: 0.96, ao: 1.18, zentrale: 0.82, direkt: 0.27 },
}

/**
 * Progressive Bonusstaffel auf Institutsebene (Sprungstaffel), heutiger Stand.
 * `satz` ist der heutige Satz (Basiswert der Hebel bonusSatz1..6), `bis`/`ab`
 * die heutigen Schwellen (Basiswerte der Hebel bonusSchwelle1..5);
 * gerechnet wird mit Sätzen und Schwellen aus dem Hebelsatz, siehe bonusStaffel(h).
 */
export const BONUS_STAFFEL = [
  { bis: 0.85, satz: 0.0, label: 'unter 85 %', ab: 0 },
  { bis: 0.95, satz: 0.06, label: '85 – 95 %', ab: 0.85 },
  { bis: 1.05, satz: 0.12, label: '95 – 105 %', ab: 0.95 },
  { bis: 1.15, satz: 0.19, label: '105 – 115 %', ab: 1.05 },
  { bis: 1.30, satz: 0.26, label: '115 – 130 %', ab: 1.15 },
  { bis: Infinity, satz: 0.32, label: 'über 130 %', ab: 1.3 },
]

/** Mittel der heutigen Staffel (Bezugsgröße vor dem Umbau, bleibt exportiert) */
export const BONUS_STAFFEL_MITTEL =
  BONUS_STAFFEL.reduce((a, s) => a + s.satz, 0) / BONUS_STAFFEL.length

const prozentZahl = new Intl.NumberFormat('de-DE', { maximumFractionDigits: 1 })

/**
 * Schwellen der Staffel aus dem Hebelsatz, in Prozent und aufsteigend geklemmt:
 * Schwelle n liegt mindestens einen Punkt über Schwelle n−1. Fehlt ein Hebel
 * (ältere Fassung), gilt die heutige Schwelle.
 */
export function bonusSchwellen(h) {
  const schwellen = []
  BONUS_SCHWELLE_IDS.forEach((id, i) => {
    const wert = h?.[id]
    const roh = Number.isFinite(wert) ? wert : BONUS_STAFFEL[i].bis * 100
    schwellen.push(i === 0 ? roh : Math.max(roh, schwellen[i - 1] + 1))
  })
  return schwellen
}

/** Bereichslabel einer Stufe aus den Schwellen in Prozent (untere/obere Grenze) */
function stufenLabel(ab, bis) {
  if (ab == null) return `unter ${prozentZahl.format(bis)} %`
  if (bis == null) return `über ${prozentZahl.format(ab)} %`
  return `${prozentZahl.format(ab)} – ${prozentZahl.format(bis)} %`
}

/**
 * Staffel aus dem Hebelsatz: Sätze (bonusSatz1..6, Prozent → Anteil) und
 * Schwellen (bonusSchwelle1..5, Prozent → Anteil). Die letzte Stufe ist offen.
 */
export function bonusStaffel(h) {
  const schwellen = bonusSchwellen(h)
  return BONUS_STAFFEL.map((stufe, i) => {
    const wert = h?.[BONUS_SATZ_IDS[i]]
    const abProzent = i === 0 ? null : schwellen[i - 1]
    const bisProzent = i < schwellen.length ? schwellen[i] : null
    return {
      satz: Number.isFinite(wert) ? wert / 100 : stufe.satz,
      ab: abProzent == null ? 0 : abProzent / 100,
      bis: bisProzent == null ? Infinity : bisProzent / 100,
      label: stufenLabel(abProzent, bisProzent),
    }
  })
}

/** Mittel der Hebelstaffel — die Progression spreizt um diesen Wert */
export function bonusStaffelMittel(h) {
  const staffel = bonusStaffel(h)
  return staffel.reduce((a, s) => a + s.satz, 0) / staffel.length
}

/** Volumenschwelle, unterhalb der der Kleininstitutssockel greift */
export const KLEININSTITUT_SCHWELLE = 800_000

/** Muss-Qualitätskriterien in fester Prüfreihenfolge */
export const QUALITAETSKRITERIEN = [
  {
    id: 'storno', label: 'Stornoquote Leben',
    beschreibung: 'Frühstorno innerhalb der Haftungszeit unter dem Schwellenwert.',
    pruefe: (q, h) => q.storno <= (h.stornoSchwelle ?? 8) / 100,
    ist: q => q.storno, format: 'prozent',
  },
  {
    id: 'weiterbildung', label: 'Weiterbildungsquote',
    beschreibung: 'Anteil der Berater mit erfüllter Weiterbildungspflicht, mindestens 80 %.',
    pruefe: q => q.weiterbildung >= 0.8,
    ist: q => q.weiterbildung, format: 'prozent',
  },
  {
    id: 'beitragsfreistellung', label: 'Beitragsfreistellungsquote',
    beschreibung: 'Anteil beitragsfrei gestellter Verträge, höchstens 9 %.',
    pruefe: q => (q.beitragsfreistellung ?? 0) <= 0.09,
    ist: q => q.beitragsfreistellung ?? 0, format: 'prozent',
  },
  {
    id: 'duration', label: 'Beitragsduration',
    beschreibung: 'Mittlere Beitragszahlungsdauer im Neugeschäft, mindestens 12 Jahre.',
    pruefe: q => q.duration >= 12,
    ist: q => q.duration, format: 'jahre',
  },
  {
    id: 'beschwerden', label: 'Beschwerdequote',
    beschreibung: 'Beschwerden je tausend Verträge, höchstens 3,0.',
    pruefe: q => (q.beschwerden ?? 0) <= 3.0,
    ist: q => q.beschwerden ?? 0, format: 'quote',
  },
]

/**
 * Neutralitätsanker der Requalifizierung. Bei diesem Qualitätsscore
 * ist der Faktor exakt 1,00. Der Wert entspricht dem gewichteten
 * Durchschnitt des heutigen Portfolios - dadurch ist das Qualitäts-
 * system per Konstruktion budgetneutral und wirkt nur umverteilend.
 */
export const QUALITAET_NEUTRAL = 0.583

/** Gewichte der vier Teilscores */
export const QUALITAETS_GEWICHTE = {
  storno: 0.4, duration: 0.25, ausschoepfung: 0.2, weiterbildung: 0.15,
}

/** Stufen der Kundenreise mit Punktgewichten (Summe 100) */
export const JOURNEY_STUFEN = ['kontakt', 'lead', 'beratung', 'abschluss', 'betreuung']

export const JOURNEYS = [
  {
    id: 'vertriebspartner', label: 'Vertriebspartner-Journey',
    beschreibung: 'Ansprache, Beratung, Abschluss und Betreuung liegen beim Partner.',
    eigner: { kontakt: 'partner', lead: 'partner', beratung: 'partner', abschluss: 'partner', betreuung: 'partner' },
  },
  {
    id: 'lead', label: 'Lead-Journey',
    beschreibung: 'Der Lead kommt aus einer zentralen Maßnahme, Beratung und Abschluss beim Partner.',
    eigner: { kontakt: 'zentrale', lead: 'zentrale', beratung: 'partner', abschluss: 'partner', betreuung: 'partner' },
  },
  {
    id: 'schrankfertig', label: 'Schrankfertiges Geschäft',
    beschreibung: 'Zentrale Einheit erstellt Beratung und Angebot, der Partner schließt ab.',
    eigner: { kontakt: 'zentrale', lead: 'zentrale', beratung: 'zentrale', abschluss: 'partner', betreuung: 'zentrale' },
  },
  {
    id: 'direkt', label: 'Direkt-Journey',
    beschreibung: 'Abschluss online oder über die zentrale Einheit, Betreuung beim Partner.',
    eigner: { kontakt: 'direkt', lead: 'direkt', beratung: 'direkt', abschluss: 'direkt', betreuung: 'partner' },
  },
]

/** Bewertungssichten */
export const SICHT = { EINGESCHWUNGEN: 'eingeschwungen', KASSENWIRKSAM: 'kassenwirksam' }

export const START_JAHR = 2028

/** Mittlere Vertragsdauer im Komposit-Neugeschäft (Jahre) */
export const KOMPOSIT_VERTRAGSDAUER = 8.6

// --------------------------------------------------- Hilfsfunktionen

const klemme = (v, min, max) => Math.min(max, Math.max(min, v))
const clamp01 = v => klemme(v, 0, 1)

/** Überlebensfaktor eines Jahrgangs nach k Jahren */
function ueberleben(abgang, k) {
  return Math.pow(1 - klemme(abgang, 0, 0.5), k)
}

/** Summe der Überlebensfaktoren über n Jahre (Aufbau der Jahrgänge) */
function jahrgangsSumme(abgang, n) {
  const jahre = Math.max(0, Math.min(Math.round(n), 40))
  let s = 0
  for (let k = 0; k < jahre; k++) s += ueberleben(abgang, k)
  return s
}

/** Barwert einer laufenden Zahlung über n Jahre, abgangs- und zinsbereinigt */
function barwertFaktor(abgang, n, zins) {
  const jahre = Math.max(0, Math.min(Math.round(n), 40))
  let s = 0
  for (let k = 1; k <= jahre; k++) s += ueberleben(abgang, k) / Math.pow(1 + zins, k)
  return s
}

/** Teilscore: linear zwischen "schlecht" und "gut", geklemmt auf 0..1 */
function teilscore(wert, gut, schlecht) {
  if (gut === schlecht) return 0.5
  return clamp01((schlecht - wert) / (schlecht - gut))
}

// --------------------------------------------------- Sätze

/**
 * Mixgewichtete Basissätze aus dem Wahlmodell-Mix.
 * Das klassische Modell ist Residuum, damit die Summe im UI
 * nie manuell auf 100 gebracht werden muss.
 */
export function wahlmodellMix(h, jahr = 1) {
  const befristung = h.umdeckerBefristung ?? 3
  const umdecker = jahr <= befristung ? (h.anteilUmdecker ?? 0) / 100 : 0
  const hybrid = (h.anteilHybrid ?? 0) / 100
  const laufend = (h.anteilLaufend ?? 0) / 100
  const belegt = umdecker + hybrid + laufend
  const skal = belegt > 1 ? 1 / belegt : 1
  const mix = {
    umdecker: umdecker * skal,
    hybrid: hybrid * skal,
    laufend: laufend * skal,
  }
  mix.klassisch = Math.max(0, 1 - mix.umdecker - mix.hybrid - mix.laufend)
  return mix
}

/** Effektive Sätze nach Wahlmodell-Mix und Kanal */
export function effektiveSaetze(h, kanal = 'sparkasse', jahr = 1) {
  const mix = wahlmodellMix(h, jahr)
  let apL = 0, lpL = 0, bpL = 0, apK = 0, bpK = 0
  for (const [key, anteil] of Object.entries(mix)) {
    const m = WAHLMODELLE[key]
    apL += anteil * m.leben.ap
    lpL += anteil * m.leben.lp
    bpL += anteil * m.leben.bp
    apK += anteil * m.komposit.ap
    bpK += anteil * m.komposit.bp
  }
  const kfL = KANALFAKTOR.leben[kanal] ?? 1
  const kfK = KANALFAKTOR.komposit[kanal] ?? 1
  return {
    mix,
    apLeben: (h.apLeben ?? 0) * apL * kfL,
    lpLeben: (h.lpLeben ?? 0) * lpL * kfL,
    bpLeben: (h.bpLeben ?? 0) * bpL * kfL,
    apKomposit: (h.apKomposit ?? 0) * apK * kfK,
    bpKomposit: (h.bpKomposit ?? 0) * bpK * kfK,
  }
}

// --------------------------------------------------- Qualität

/** Qualitätsscore 0..1 mit Teilscores */
export function qualitaetsScore(einheit, h) {
  const q = einheit.qualitaet
  const schwelle = (h.stornoSchwelle ?? 8) / 100
  const teil = {
    storno: teilscore(q.storno, Math.max(0.005, schwelle - 0.015), schwelle + 0.02),
    duration: teilscore(-q.duration, -16, -10),
    ausschoepfung: teilscore(-q.ausschoepfung, -0.25, -0.1),
    weiterbildung: teilscore(-q.weiterbildung, -1, -0.8),
  }
  const g = QUALITAETS_GEWICHTE
  const score =
    g.storno * teil.storno + g.duration * teil.duration +
    g.ausschoepfung * teil.ausschoepfung + g.weiterbildung * teil.weiterbildung
  return { score, teil }
}

/** Requalifizierungsfaktor, verankert am Portfoliodurchschnitt */
export function requalifizierungsFaktor(score, h) {
  const s = (h.qualitaetsSpreizung ?? 0) / 100
  if (s <= 0) return 1
  const roh = 1 + ((score - QUALITAET_NEUTRAL) / (1 - QUALITAET_NEUTRAL)) * s
  return klemme(roh, 1 - s, 1 + s)
}

/** Zuschlag aus Bestandsausschöpfung und Infrastruktur */
export function ausschoepfungsZuschlag(einheit, h) {
  const schwelle = (h.ausschoepfungsSchwelle ?? 15) / 100
  const je = (h.ausschoepfungsZuschlag ?? 0) / 100
  const ist = einheit.qualitaet.ausschoepfung
  let stufen = 0
  if (ist >= schwelle) stufen = 1
  if (ist >= schwelle + 0.05) stufen = 2
  if (ist >= schwelle + 0.1) stufen = 3
  return { stufen, faktor: 1 + stufen * je }
}

/** Auszahlungsgrad des erreichten Bonus: 100 %, 75 % oder 0 % */
export function qualitaetsGate(einheit, h) {
  const anzahl = Math.round(h.qualitaetskriterien ?? 0)
  if (anzahl <= 0) return { grad: 1, verfehlt: [], geprueft: [] }
  const geprueft = QUALITAETSKRITERIEN.slice(0, anzahl)
  const verfehlt = geprueft.filter(k => !k.pruefe(einheit.qualitaet, h))
  const grad = verfehlt.length === 0 ? 1 : verfehlt.length === 1 ? 0.75 : 0
  return { grad, verfehlt, geprueft }
}

// --------------------------------------------------- Journey

/** Punktgewichte der Kundenreise */
export function journeyGewichte(h) {
  const betreuung = klemme(Math.round(h.betreuungsGewicht ?? 10), 5, 30)
  const abschluss = Math.max(15, 40 - betreuung)
  const stufen = { kontakt: 10, lead: 20, beratung: 30, abschluss, betreuung }
  const summe = Object.values(stufen).reduce((a, b) => a + b, 0)
  return { stufen, summe }
}

/**
 * Anteil der Neugeschäftsvergütung, der beim Vertriebspartner bleibt.
 * Der Rest wandert an Zentrale bzw. Direktkanal.
 */
export function partnerQuote(einheit, h) {
  const { stufen, summe } = journeyGewichte(h)
  const mix = einheit.journeyMix || { vertriebspartner: 1, lead: 0, schrankfertig: 0, direkt: 0 }

  // Der Omnikanal-Hebel verschiebt Volumen aus der reinen Partner-Journey
  const omni = clamp01((h.journeyOmnikanal ?? 10) / 100)
  const restBasis = 1 - (mix.vertriebspartner ?? 0)
  const anteile = {}
  for (const j of JOURNEYS) {
    if (j.id === 'vertriebspartner') anteile[j.id] = 1 - omni
    else anteile[j.id] = restBasis > 0 ? ((mix[j.id] ?? 0) / restBasis) * omni : 0
  }

  let quote = 0
  for (const j of JOURNEYS) {
    for (const stufe of JOURNEY_STUFEN) {
      if (j.eigner[stufe] === 'partner') {
        quote += (anteile[j.id] ?? 0) * (stufen[stufe] / summe)
      }
    }
  }
  return { quote: clamp01(quote), anteile, stufen }
}

// --------------------------------------------------- Zugeständnis je Haus

/**
 * Individueller Umstellungszuschuss eines Hauses (EUR je Jahr), als
 * Verhandlungsergebnis in der Fassung hinterlegt: h.hausZuschuesse[einheitId].
 * Kein Regler des Modells; heute (istHebel) kennt ihn nicht, das Zielmodell
 * zählt ihn zu den Zuschüssen. Er wird außerhalb der Übergangsregel gezahlt
 * (siehe mitRegel), damit ein Gewinner ihn nicht in der Untergrenze verliert.
 */
export function hausZuschuss(einheit, h) {
  const v = h?.hausZuschuesse?.[einheit?.id]
  return Number.isFinite(v) ? v : 0
}

/** Übergangsregel auf das Modell ohne den Hauszuschuss, der Zuschuss kommt obendrauf. */
export function mitRegel(istWert, zielWert, h, jahr, zielEingeschwungen, zuschuss = 0) {
  return wendeUebergangAn(istWert, zielWert - zuschuss, h, jahr, zielEingeschwungen - zuschuss) + zuschuss
}

// --------------------------------------------------- Vergütung je Einheit

/**
 * Vergütung einer Einheit für ein Hebel-Set.
 * Liefert die eingeschwungene Jahressicht, den Barwert einer
 * Neugeschäftskohorte und alle Zwischengrößen für die Erklärung.
 *
 * bonusNormierung wird vom Portfolio gesetzt (Budgetnormierung des
 * Bonus über alle Einheiten hinweg). Ohne Normierung = 1.
 */
export function berechneEinheit(einheit, h, { jahr = 1, bonusNormierung = 1 } = {}) {
  const p = einheit.produktion
  const b = einheit.bestand
  const kanal = einheit.kanal || 'sparkasse'
  const s = effektiveSaetze(h, kanal, jahr)

  const qs = qualitaetsScore(einheit, h)
  const reFaktor = requalifizierungsFaktor(qs.score, h)
  const az = ausschoepfungsZuschlag(einheit, h)
  const pq = partnerQuote(einheit, h)
  const abgang = einheit.qualitaet.storno + (einheit.qualitaet.beitragsfreistellung ?? 0.02)

  // Kalibrierung: gleicht die Modellrechnung auf die gemeldete
  // Vergütung des Referenz-Wertungsjahres ab. Ein konstanter Faktor
  // je Komponente und Einheit - er wirkt in beiden Welten gleich und
  // lässt Deltas, Wasserfall und Aggregation unberührt.
  const kal = einheit.kalibrierung || {}
  const kf = (name) => (Number.isFinite(kal[name]) ? kal[name] : 1)

  // --- Abschlussvergütung Leben inklusive Fokusfeld-Zuschlägen
  const apSatzEffektiv = (s.apLeben / 1000) * reFaktor * az.faktor
  const bsBav = p.lebenBsBav || 0
  const bsBio = p.lebenBsBiometrie || 0
  const bsBasis = Math.max(0, p.lebenBs - bsBav - bsBio)
  const apLebenFaktor = pq.quote * kf('apLeben')
  const apLebenBasis = bsBasis * apSatzEffektiv * apLebenFaktor
  const apLebenBav = bsBav * apSatzEffektiv * (1 + (h.zuschlagBav ?? 0) / 100) * apLebenFaktor
  const apLebenBio = bsBio * apSatzEffektiv * (1 + (h.zuschlagBiometrie ?? 0) / 100) * apLebenFaktor
  const apLeben = apLebenBasis + apLebenBav + apLebenBio

  // --- Abschlussvergütung Komposit (Kfz mit Abschlag)
  const kfzAbschlag = clamp01((h.kfzAbschlag ?? 80) / 100)
  const apKompositSatz = (s.apKomposit / 100) * reFaktor
  const apKompositFaktor = pq.quote * kf('apKomposit')
  const apKompositSuh = p.kompositSuh * apKompositSatz * apKompositFaktor
  const apKompositKfz = p.kompositKfz * apKompositSatz * (1 - kfzAbschlag) * apKompositFaktor
  const apKomposit = apKompositSuh + apKompositKfz

  // --- Laufende Provision Leben (eingeschwungen: alle Jahrgänge zahlen)
  const lpProJahrgang = p.lebenBs * (s.lpLeben / 1000) * reFaktor * pq.quote * kf('lp')
  const lpDauer = Math.round(h.lpDauer ?? 0)
  const aufbauVoll = jahrgangsSumme(abgang, lpDauer)
  const lpEingeschwungen = lpProJahrgang * aufbauVoll

  // --- Bestandsprovision
  const altbestandQuote = clamp01((h.bpAltbestand ?? 100) / 100)
  const bpLeben = b.lebenBeitrag * (s.bpLeben / 100) * az.faktor * altbestandQuote * kf('bpLeben')
  const bpKomposit = b.kompositBeitrag * (s.bpKomposit / 100) * az.faktor * kf('bpKomposit')

  // --- Bonus (Rohwert; die Normierung kommt aus dem Portfolio)
  const ziel = einheit.zielerreichung ?? 1
  const staffel = bonusStaffel(h)
  const stufenIndex = Math.max(0, staffel.findIndex(x => ziel < x.bis))
  const stufe = staffel[stufenIndex] ?? staffel[staffel.length - 1]
  const mittel = bonusStaffelMittel(h)
  const progression = h.bonusProgression ?? 1
  let bonusSatz = Math.max(0, mittel + (stufe.satz - mittel) * progression)
  const apBasis = apLeben + apKomposit
  if (apBasis < KLEININSTITUT_SCHWELLE) bonusSatz += (h.kleininstitutSockel ?? 0) / 100
  const gate = qualitaetsGate(einheit, h)
  const bonusRoh = apBasis * bonusSatz * kf('bonus')
  const bonus = bonusRoh * bonusNormierung * gate.grad
  const bonusStufe = {
    index: stufenIndex,
    label: stufe.label,
    satzRoh: stufe.satz,
    satzEffektiv: bonusSatz,
    // Was tatsächlich gezahlt wird: mit Normierung auf das Budget skaliert.
    // Kasten und Akte zeigen diese Zahl, damit „Satz neu“ überall dasselbe heißt.
    satzNormiert: bonusSatz * bonusNormierung,
    zielerreichung: ziel,
  }

  // --- Zuschüsse: bestehende Posten (Abbau) plus allgemeiner und Standortzuschuss
  const zu = einheit.zuschuesse || { fix: 0, kleinteilig: 0, sonder: 0 }
  const abbau = clamp01((h.zuschussAbbau ?? 0) / 100)
  const ap = apLeben + apKomposit
  const zuschussTeile = {
    kleinteilig: (zu.kleinteilig ?? 0) * (1 - abbau),
    sonder: (zu.sonder ?? 0) * (1 - abbau),
    fix: zu.fix ?? 0,
    allgemein: ap * (h.zuschussAllgemein ?? 0) / 100,
    standort: (einheit.geschaeftsstellen ?? 0) * (h.zuschussStandort ?? 0),
    individuell: hausZuschuss(einheit, h),
  }
  const zuschuesse = zuschussTeile.kleinteilig + zuschussTeile.sonder + zuschussTeile.fix
    + zuschussTeile.allgemein + zuschussTeile.standort + zuschussTeile.individuell

  const bp = bpLeben + bpKomposit
  const gesamt = ap + lpEingeschwungen + bp + bonus + zuschuesse

  // --- Barwert EINER Neugeschäftskohorte
  // Abschlussvergütung sofort, laufende Provision über die Laufzeit,
  // Bestandsprovision auf den vom Jahrgang selbst erzeugten Beitrag.
  // Nur diese Größe erlaubt die Aussage "barwertgleich, aber anderes
  // Cashflow-Profil" - sie ist die eigentliche Leitplanke.
  const zins = (h.diskontsatz ?? 5) / 100
  const bwLp = lpProJahrgang * barwertFaktor(abgang, lpDauer, zins)

  const jbLeben = p.lebenJahresbeitrag || (p.lebenBs / Math.max(1, einheit.qualitaet.duration))
  const jbKomposit = p.kompositSuh + p.kompositKfz
  const bwBpLeben = jbLeben * (s.bpLeben / 100) * az.faktor * kf('bpLeben')
    * barwertFaktor(abgang, einheit.qualitaet.duration, zins)
  const bwBpKomposit = jbKomposit * (s.bpKomposit / 100) * az.faktor * kf('bpKomposit')
    * barwertFaktor(einheit.qualitaet.stornoKomposit ?? 0.07, KOMPOSIT_VERTRAGSDAUER, zins)

  const barwertKohorte = ap + bwLp + bwBpLeben + bwBpKomposit

  // --- Kohortenbarwert Leben je Promille Beitragssumme (Kalibrierungsgröße)
  const bwPromille = p.lebenBs > 0
    ? ((apLeben + bwLp + bwBpLeben) / p.lebenBs) * 1000
    : 0

  return {
    einheitId: einheit.id,
    kanal,
    apLeben, apKomposit, ap,
    apLebenBasis, apLebenBav, apLebenBio,
    apKompositSuh, apKompositKfz,
    lp: lpEingeschwungen,
    lpProJahrgang, lpDauer, aufbauVoll,
    bpLeben, bpKomposit, bp,
    bonus, bonusRoh, bonusSatz, bonusStufe,
    zuschuesse, zuschussTeile,
    gesamt,
    barwertKohorte,
    bwBpLeben, bwBpKomposit, bwLp,
    bwPromille,
    qualitaetsScore: qs.score,
    qualitaetsTeil: qs.teil,
    requalifizierungsFaktor: reFaktor,
    ausschoepfung: az,
    gate,
    bonusVorGate: bonusRoh * bonusNormierung, // erreichbarer Bonus, wenn alle Muss-Kriterien erfüllt wären
    partnerQuote: pq.quote,
    journeyAnteile: pq.anteile,
    saetze: s,
    abgang,
  }
}

/**
 * Kassenwirksame Vergütung im Jahr j nach Umstellung.
 * Die laufende Provision baut sich über die Jahrgänge auf - das ist
 * die Ursache der Vergütungsdelle in den ersten Jahren und der
 * eigentliche Verhandlungsgegenstand.
 */
export function verguetungImJahr(einheit, h, jahr, ergebnisEingeschwungen, referenzLp) {
  const e = ergebnisEingeschwungen
  const anteil = e.aufbauVoll > 0
    ? jahrgangsSumme(e.abgang, Math.min(jahr, e.lpDauer)) / e.aufbauVoll
    : 0
  // Nur die Veränderung gegenüber der heutigen laufenden Provision baut sich auf.
  // Dadurch reproduziert das IST-Hebelset exakt die heutige Reihe.
  const lpJahr = referenzLp + (e.lp - referenzLp) * anteil
  return e.ap + lpJahr + e.bp + e.bonus + e.zuschuesse
}

// --------------------------------------------------- Bausteine je Jahr

/**
 * Zerlegung der kassenwirksamen Vergütung nach Umstellung je Jahr in ihre
 * Bausteine — der Blick nach vorn in der Akte: die Abschlussprovision
 * steht ab dem ersten Jahr auf dem neuen Satz, die laufende Provision
 * wächst Jahrgang für Jahrgang (wie in verguetungImJahr), Bestandsprovision,
 * Bonifikation und Zuschüsse stehen sofort; die Übergangsregel füllt, was
 * bis heute fehlt. Summe je Jahr = verlauf[j].mitUebergang, solange kein
 * Gewinndeckel kappt.
 */
export function bausteinVerlauf(ergebnis) {
  const { ist, ziel, verlauf, eingeschwungen } = ergebnis
  const reihe = verlauf.map(v => {
    const anteil = ziel.aufbauVoll > 0
      ? jahrgangsSumme(ziel.abgang, Math.min(v.periode, ziel.lpDauer)) / ziel.aufbauVoll
      : 0
    const lp = ist.lp + (ziel.lp - ist.lp) * anteil
    return {
      jahr: v.jahr, label: String(v.jahr),
      ap: ziel.ap, lp, bp: ziel.bp, bonus: ziel.bonus, zuschuesse: ziel.zuschuesse,
      uebergang: Math.max(0, v.kostenUebergang),
      heute: ist.gesamt,
      gesamt: v.mitUebergang,
    }
  })
  // Liegt der eingeschwungene Zustand hinter dem Horizont, steht er als
  // eigene Säule „ab 2039“ (Jahr des vollen Aufbaus) rechts: alle Jahrgänge zahlen, die Summe ist
  // der Wert des Referenzvergleichs (plus Übergangsregel, wo sie noch greift).
  if (eingeschwungen && !eingeschwungen.imHorizont) {
    reihe.push({
      jahr: eingeschwungen.jahr, label: `ab ${eingeschwungen.jahr}`, eingeschwungen: true,
      ap: ziel.ap, lp: ziel.lp, bp: ziel.bp, bonus: ziel.bonus, zuschuesse: ziel.zuschuesse,
      uebergang: Math.max(0, eingeschwungen.kostenUebergang),
      heute: ist.gesamt,
      gesamt: eingeschwungen.mitUebergang,
    })
  }
  return reihe
}

// --------------------------------------------------- Szenarioanalyse der Akte

/**
 * Variante einer Einheit mit veränderter Produktion und verändertem Bestand
 * gegenüber dem Referenzzeitraum (Prozent je Regler: leben, bav, biometrie,
 * komposit, bestandLeben, bestandKomposit). Sätze, Kalibrierung und
 * Qualität bleiben; die Zielerreichung der Bonusstaffel folgt der
 * Produktion, gewichtet mit der heutigen Abschlussprovision je Sparte.
 */
export function einheitMitSzenario(einheit, sz, apHeute = { leben: 1, komposit: 1 }) {
  const f = k => 1 + ((sz && sz[k]) || 0) / 100
  const p = einheit.produktion
  const b = einheit.bestand
  const bavAlt = p.lebenBsBav || 0
  const bioAlt = p.lebenBsBiometrie || 0
  const bav = bavAlt * f('bav')
  const bio = bioAlt * f('biometrie')
  const basis = Math.max(0, p.lebenBs - bavAlt - bioAlt) * f('leben')
  const lebenBs = basis + bav + bio
  const fLeben = p.lebenBs > 0 ? lebenBs / p.lebenBs : 1
  const fKomposit = f('komposit')
  const produktion = {
    ...p,
    lebenBs, lebenBsBav: bav, lebenBsBiometrie: bio,
    lebenJahresbeitrag: p.lebenJahresbeitrag != null ? p.lebenJahresbeitrag * fLeben : p.lebenJahresbeitrag,
    kompositSuh: (p.kompositSuh || 0) * fKomposit,
    kompositKfz: (p.kompositKfz || 0) * fKomposit,
    kompositJahresbeitrag: p.kompositJahresbeitrag != null ? p.kompositJahresbeitrag * fKomposit : p.kompositJahresbeitrag,
  }
  const bestand = {
    ...b,
    lebenBeitrag: (b.lebenBeitrag || 0) * f('bestandLeben'),
    kompositBeitrag: (b.kompositBeitrag || 0) * f('bestandKomposit'),
  }
  const gewicht = (apHeute.leben || 0) + (apHeute.komposit || 0)
  const produktionsFaktor = gewicht > 0
    ? ((apHeute.leben || 0) * fLeben + (apHeute.komposit || 0) * fKomposit) / gewicht
    : (fLeben + fKomposit) / 2
  return {
    ...einheit,
    produktion,
    bestand,
    zielerreichung: (einheit.zielerreichung ?? 1) * produktionsFaktor,
    szenario: { ...sz, produktionsFaktor, fLeben, fKomposit },
  }
}

// --------------------------------------------------- Kumuliert bis 2030

/** Letztes Jahr der kumulierten Sicht: die Einführungsphase 2028 bis 2030 */
export const KUMULIERT_BIS = 2030

/**
 * Kumulierte Veränderung der kassenwirksamen Jahre bis KUMULIERT_BIS
 * gegenüber heute, mit Übergangsregel, abgezinst mit dem Diskontsatz der
 * Fassung auf den Umstellungszeitpunkt (erstes Jahr eine Periode, wie der
 * Barwert der Regelkosten in berechneEinzel). Das ist der Preis der
 * Einführungsphase — die zweite Plakette des Steuerblocks.
 */
export function kumuliertBarwert(verlauf, h, bisJahr = KUMULIERT_BIS) {
  const zins = (h.diskontsatz ?? 5) / 100
  let heute = 0, ziel = 0, jahre = 0
  for (const v of verlauf) {
    if (v.jahr > bisJahr) break
    const f = Math.pow(1 + zins, jahre + 1)
    heute += v.ist / f
    ziel += v.mitUebergang / f
    jahre += 1
  }
  return {
    heute, ziel, jahre, bisJahr,
    absolut: ziel - heute,
    prozent: heute > 0 ? ((ziel - heute) / heute) * 100 : 0,
  }
}

// --------------------------------------------------- Übergangsregeln

/**
 * Besitzstand, Verlust- und Gewinndeckel auf einen Jahreswert.
 * jahr = 1 ist das erste Jahr nach der Umstellung.
 */
export function wendeUebergangAn(istWert, zielWert, h, jahr = 1, zielEingeschwungen = null) {
  if (!(istWert > 0)) return zielWert

  const jahre = Math.round(h.besitzstandJahre ?? 0)
  const quote = clamp01((h.besitzstandQuote ?? 0) / 100)
  const verlustdeckel = klemme((h.verlustdeckel ?? 100) / 100, 0, 10)
  const gewinndeckel = klemme((h.gewinndeckel ?? 100) / 100, 0, 100)

  let wert = zielWert

  if (jahre > 0 && jahr <= jahre && quote > 0) {
    const wirksam = (jahre - jahr + 1) / jahre
    const untergrenze = zielWert + (istWert * quote - zielWert) * wirksam
    if (untergrenze > wert) wert = Math.min(untergrenze, istWert)
  }

  if (verlustdeckel < 0.3) {
    const untergrenze = istWert * (1 - verlustdeckel * jahr)
    if (untergrenze > wert) wert = Math.min(untergrenze, istWert)
  }

  // Gewinnvorgriff: ein Gewinner (Zielmodell im Referenzzeitraum über heute)
  // erhält von Anfang an mindestens heute plus Vorgriff × Gewinn — sonst
  // stünde er wegen des Aufbaus der laufenden Provision jahrelang genau auf
  // heute, obwohl das Modell ihn besserstellt. Sobald der Aufbau die
  // Untergrenze überholt, greift sie nicht mehr.
  const vorgriff = clamp01((h.gewinnvorgriff ?? 0) / 100)
  if (vorgriff > 0 && Number.isFinite(zielEingeschwungen) && zielEingeschwungen > istWert) {
    const untergrenze = istWert + (zielEingeschwungen - istWert) * vorgriff
    if (untergrenze > wert) wert = Math.min(untergrenze, zielEingeschwungen)
  }

  if (gewinndeckel < 0.6 && wert > istWert) {
    wert = Math.min(wert, istWert * (1 + gewinndeckel * jahr))
  }

  return wert
}

// --------------------------------------------------- Wasserfall

/**
 * Reihenfolge der Brückenstufen. Fachlich fixiert und bewusst nicht
 * konfigurierbar, damit Wasserfälle zwischen Einheiten vergleichbar
 * bleiben. Jede Stufe ist die Differenz zweier Vollberechnungen -
 * die Summe geht deshalb exakt auf.
 */
export const WASSERFALL_STUFEN = [
  {
    id: 'apSaetze', label: 'Abschlussprovision', kurz: 'Abschluss',
    hinweis: 'Absenkung der einmaligen Vorabvergütung in Leben und Komposit.',
    felder: ['apLeben', 'apKomposit', 'kfzAbschlag'],
  },
  {
    id: 'fokusfelder', label: 'Fokusfelder bAV und Biometrie', kurz: 'bAV und\nBiometrie',
    hinweis: 'Gezielte Vergütungsimpulse in die Wachstumsmärkte.',
    felder: ['zuschlagBav', 'zuschlagBiometrie'],
  },
  {
    id: 'laufend', label: 'Laufende Provision',
    hinweis: 'Neue laufende Vergütung über die Vertragslaufzeit.',
    felder: ['lpLeben', 'lpDauer'],
  },
  {
    id: 'bestand', label: 'Bestandsprovision', kurz: 'Bestands-\nprovision',
    hinweis: 'Vergütung des betreuten Bestands statt allein des Abschlusses.',
    felder: ['bpLeben', 'bpKomposit', 'bpAltbestand'],
  },
  {
    id: 'wahlmodelle', label: 'Wahlmodelle', kurz: 'Wahl-\nmodelle',
    hinweis: 'Verteilung der Partner auf klassisches, Hybrid-, laufendes und Umdecker-Modell.',
    felder: ['anteilUmdecker', 'anteilHybrid', 'anteilLaufend', 'umdeckerBefristung'],
  },
  {
    id: 'qualitaet', label: 'Requalifizierung', kurz: 'Requali-\nfizierung',
    hinweis: 'Auf- und Abstufung über Storno, Duration, Ausschöpfung und Weiterbildung.',
    felder: ['qualitaetsSpreizung', 'stornoSchwelle', 'ausschoepfungsZuschlag', 'ausschoepfungsSchwelle'],
  },
  {
    id: 'bonus', label: 'Bonifikation', kurz: 'Bonifikation',
    hinweis: 'Neue Staffel mit Qualitäts- und Servicekriterien als Auszahlungsfilter.',
    // Sätze UND Schwellen der Staffel gehören in dieselbe Stufe: wasserfall()
    // übernimmt nur Hebel, die hier stehen — fehlt einer, geht die Brücke
    // nicht auf und der Zielmodell-Balken weicht vom Steuerblock ab.
    felder: ['bonusBudget', 'bonusProgression', 'qualitaetskriterien', 'kleininstitutSockel',
      ...BONUS_SATZ_IDS, ...BONUS_SCHWELLE_IDS, 'bonusNormierung'],
  },
  {
    id: 'journey', label: 'Journey-Teilung', kurz: 'Journey-\nTeilung',
    hinweis: 'Vergütung folgt dem Wertbeitrag entlang der Kundenreise.',
    felder: ['journeyOmnikanal', 'betreuungsGewicht'],
  },
  {
    id: 'zuschuesse', label: 'Zuschüsse', kurz: 'Zuschüsse',
    hinweis: 'Abbau kleinteiliger Nebenvergütungen; allgemeiner und Standortzuschuss.',
    felder: ['zuschussAbbau', 'zuschussAllgemein', 'zuschussStandort'],
  },
]

// --------------------------------------------------- Bonusnormierung

/**
 * Normierungsfaktor, mit dem der Rohbonus auf das Zielbudget gebracht wird.
 * Bezugsgröße ist das heutige Bonusvolumen. Die Normierung wirkt VOR dem
 * Qualitätsgate, damit das Gate real Geld einspart und nicht wegnormiert wird.
 */
function bonusNormierungFuer(einheiten, h, istBonusGesamt) {
  // Schalter aus: die Staffel wirkt direkt, das Budget folgt der Staffel.
  if ((h.bonusNormierung ?? 1) <= 0) return 1
  const budget = (h.bonusBudget ?? 100) / 100
  if (budget <= 0) return 0
  let roh = 0
  for (const e of einheiten) {
    roh += berechneEinheit(e, h, { bonusNormierung: 1 }).bonusRoh
  }
  if (roh <= 0) return 0
  return (istBonusGesamt * budget) / roh
}

/** Heutiges Bonusvolumen des Portfolios (Bezugsgröße der Normierung) */
export function istBonusVolumen(einheiten) {
  const basis = istHebel()
  let roh = 0
  for (const e of einheiten) roh += berechneEinheit(e, basis, { bonusNormierung: 1 }).bonusRoh
  return roh
}

// --------------------------------------------------- Portfolio (Makro)

/**
 * Aggregation über alle Einheiten. Makro ist definitionsgemäß die
 * Summe der Mikro-Ergebnisse - inklusive der institutsscharf
 * gerechneten Sprungstaffel, die auf dem Aggregat nicht korrekt wäre.
 */
export function berechnePortfolio(einheiten, h, { jahre = 8 } = {}) {
  const basis = istHebel()
  const istBonus = istBonusVolumen(einheiten)
  const normIst = 1
  const normZiel = bonusNormierungFuer(einheiten, h, istBonus)

  const ergebnisse = einheiten.map(e => {
    const ist = berechneEinheit(e, basis, { bonusNormierung: normIst })
    const ziel = berechneEinheit(e, h, { bonusNormierung: normZiel })
    const nachUebergang = mitRegel(ist.gesamt, ziel.gesamt, h, 1, ziel.gesamt, hausZuschuss(e, h))
    const deltaAbs = ziel.gesamt - ist.gesamt
    return {
      einheit: e,
      ist,
      ziel,
      delta: {
        absolut: deltaAbs,
        prozent: ist.gesamt > 0 ? (deltaAbs / ist.gesamt) * 100 : 0,
      },
      uebergang: {
        wert: nachUebergang,
        absolut: nachUebergang - ist.gesamt,
        prozent: ist.gesamt > 0 ? ((nachUebergang - ist.gesamt) / ist.gesamt) * 100 : 0,
        kosten: nachUebergang - ziel.gesamt,
      },
      barwert: {
        ist: ist.barwertKohorte,
        ziel: ziel.barwertKohorte,
        absolut: ziel.barwertKohorte - ist.barwertKohorte,
        prozent: ist.barwertKohorte > 0
          ? ((ziel.barwertKohorte - ist.barwertKohorte) / ist.barwertKohorte) * 100 : 0,
      },
      ampel: ampelFuer(ist.gesamt > 0 ? (deltaAbs / ist.gesamt) * 100 : 0),
    }
  })

  const sum = (fn) => ergebnisse.reduce((s, e) => s + fn(e), 0)

  const istGesamt = sum(e => e.ist.gesamt)
  const zielGesamt = sum(e => e.ziel.gesamt)
  const uebergangGesamt = sum(e => e.uebergang.wert)

  const komponenten = {
    ist: summiereKomponenten(ergebnisse.map(e => e.ist), istGesamt),
    ziel: summiereKomponenten(ergebnisse.map(e => e.ziel), zielGesamt),
  }

  // Bemessungsgrundlagen des Portfolios — damit die Zeilenhelfer für das
  // Gesamtportfolio dieselben Spalten füllen können wie für eine Einheit.
  const produktion = summiereFelder(einheiten.map(e => e.produktion),
    ['lebenBs', 'lebenBsBav', 'lebenBsBiometrie', 'kompositSuh', 'kompositKfz', 'kompositJahresbeitrag'])
  const bestand = summiereFelder(einheiten.map(e => e.bestand),
    ['lebenBeitrag', 'kompositBeitrag', 'vertraege', 'versicherungskunden'])
  const geschaeftsstellen = einheiten.reduce((a, e) => a + (e.geschaeftsstellen ?? 0), 0)

  // Bonusstaffel: wer landet wo — je Stufe Einheiten und Volumen, heute und neu
  const staffelHeute = bonusStaffel(basis)
  const staffelNeu = bonusStaffel(h)
  const bonusVerteilung = staffelNeu.map((stufe, index) => {
    const heute = ergebnisse.filter(e => e.ist.bonusStufe?.index === index)
    const neu = ergebnisse.filter(e => e.ziel.bonusStufe?.index === index)
    return {
      index,
      label: stufe.label,
      labelHeute: staffelHeute[index].label,
      schwelleHeute: Number.isFinite(staffelHeute[index].ab) ? staffelHeute[index].ab * 100 : null,
      schwelleNeu: Number.isFinite(stufe.ab) ? stufe.ab * 100 : null,
      satzHeute: staffelHeute[index].satz * 100,
      // gezahlter Satz (normiert) — der Rohsatz des Hebels steht daneben
      satzNeu: staffelNeu[index].satz * 100 * ((h.bonusNormierung ?? 1) ? normZiel : 1),
      satzRohNeu: staffelNeu[index].satz * 100,
      einheitenHeute: heute.length,
      einheitenNeu: neu.length,
      volumenHeute: heute.reduce((a, e) => a + e.ist.bonus, 0),
      volumenNeu: neu.reduce((a, e) => a + e.ziel.bonus, 0),
    }
  })

  // Kassenwirksamer Verlauf
  const referenzLpJe = Object.fromEntries(ergebnisse.map(e => [e.einheit.id, e.ist.lp]))
  const verlauf = []
  for (let j = 1; j <= jahre; j++) {
    let ist = 0, ziel = 0, mitUebergang = 0
    for (const e of ergebnisse) {
      const zielJahr = verguetungImJahr(e.einheit, h, j, e.ziel, referenzLpJe[e.einheit.id])
      ist += e.ist.gesamt
      ziel += zielJahr
      mitUebergang += mitRegel(e.ist.gesamt, zielJahr, h, j, e.ziel.gesamt, hausZuschuss(e.einheit, h))
    }
    verlauf.push({
      jahr: START_JAHR + j - 1, periode: j, ist, ziel, mitUebergang,
      delta: mitUebergang - ist,
      deltaProzent: ist > 0 ? ((mitUebergang - ist) / ist) * 100 : 0,
    })
  }

  const barwertIst = sum(e => e.barwert.ist)
  const barwertZiel = sum(e => e.barwert.ziel)

  const bezug = einheiten.reduce((a, e) => ({
    beitragseinnahmen: a.beitragseinnahmen + e.bestand.lebenBeitrag + e.bestand.kompositBeitrag,
    lebenBs: a.lebenBs + e.produktion.lebenBs,
    kompositNg: a.kompositNg + e.produktion.kompositSuh + e.produktion.kompositKfz,
  }), { beitragseinnahmen: 0, lebenBs: 0, kompositNg: 0 })

  // Verteilungswirkung nach Anzahl und nach Volumen
  const verteilung = { gewinner: 0, neutral: 0, verlierer: 0 }
  const verteilungVolumen = { gewinner: 0, neutral: 0, verlierer: 0 }
  for (const e of ergebnisse) {
    const klasse = e.delta.prozent > 2 ? 'gewinner' : e.delta.prozent < -2 ? 'verlierer' : 'neutral'
    verteilung[klasse] += 1
    verteilungVolumen[klasse] += e.ist.gesamt
  }

  const deltaProzent = istGesamt > 0 ? ((zielGesamt - istGesamt) / istGesamt) * 100 : 0
  const barwertProzent = barwertIst > 0 ? ((barwertZiel - barwertIst) / barwertIst) * 100 : 0

  const strukturIst = anteile(komponenten.ist)
  const strukturZiel = anteile(komponenten.ziel)

  return {
    ergebnisse,
    ist: komponenten.ist,
    ziel: komponenten.ziel,
    struktur: { ist: strukturIst, ziel: strukturZiel },
    verschiebungApPunkte: (strukturZiel.ap - strukturIst.ap) * 100,
    delta: { absolut: zielGesamt - istGesamt, prozent: deltaProzent },
    uebergang: {
      gesamt: uebergangGesamt,
      kosten: uebergangGesamt - zielGesamt,
      prozent: istGesamt > 0 ? ((uebergangGesamt - istGesamt) / istGesamt) * 100 : 0,
    },
    barwert: {
      ist: barwertIst, ziel: barwertZiel,
      absolut: barwertZiel - barwertIst, prozent: barwertProzent,
      promilleIst: bezug.lebenBs > 0 ? (sum(e => e.ist.apLeben) / bezug.lebenBs) * 1000 : 0,
      promilleZiel: bezug.lebenBs > 0 ? (sum(e => e.ziel.apLeben) / bezug.lebenBs) * 1000 : 0,
    },
    quoten: {
      beitragseinnahmen: bezug.beitragseinnahmen,
      lebenBs: bezug.lebenBs,
      kompositNg: bezug.kompositNg,
      istQuote: bezug.beitragseinnahmen > 0 ? (istGesamt / bezug.beitragseinnahmen) * 100 : 0,
      zielQuote: bezug.beitragseinnahmen > 0 ? (zielGesamt / bezug.beitragseinnahmen) * 100 : 0,
    },
    verteilung,
    verteilungVolumen,
    bonusVerteilung,
    geschaeftsstellen,
    produktion,
    bestand,
    ampelBarwert: budgetAmpel(barwertProzent),
    ampelJahr1: budgetAmpel(verlauf[0] ? verlauf[0].deltaProzent : deltaProzent),
    verlauf,
    kumuliert: kumuliertBarwert(verlauf, h),
    komplexitaet: komplexitaet(h),
    steuerung: steuerungswirkung(h, { ist: komponenten.ist, ziel: komponenten.ziel, verlauf, barwert: { promilleIst: 0, promilleZiel: 0 } }),
    verhandlungsrisiko: verhandlungsrisiko(ergebnisse, h, strukturZiel.ap - strukturIst.ap, barwertProzent),
    bonusNormierung: normZiel,
  }
}

/** Summe der Ergebnisfelder über Einheiten — die Komponenten des Portfolios */
function summiereKomponenten(liste, gesamt) {
  const s = (fn) => liste.reduce((a, e) => a + fn(e), 0)
  return {
    apLeben: s(e => e.apLeben), apKomposit: s(e => e.apKomposit), ap: s(e => e.ap),
    apLebenBasis: s(e => e.apLebenBasis), apLebenBav: s(e => e.apLebenBav), apLebenBio: s(e => e.apLebenBio),
    apKompositSuh: s(e => e.apKompositSuh), apKompositKfz: s(e => e.apKompositKfz),
    lp: s(e => e.lp),
    bpLeben: s(e => e.bpLeben), bpKomposit: s(e => e.bpKomposit), bp: s(e => e.bp),
    bonus: s(e => e.bonus), bonusRoh: s(e => e.bonusRoh),
    zuschuesse: s(e => e.zuschuesse),
    zuschussTeile: {
      kleinteilig: s(e => e.zuschussTeile?.kleinteilig ?? 0),
      sonder: s(e => e.zuschussTeile?.sonder ?? 0),
      fix: s(e => e.zuschussTeile?.fix ?? 0),
      allgemein: s(e => e.zuschussTeile?.allgemein ?? 0),
      standort: s(e => e.zuschussTeile?.standort ?? 0),
    },
    gesamt,
  }
}

function summiereFelder(liste, felder) {
  const summe = {}
  for (const f of felder) summe[f] = liste.reduce((a, o) => a + (Number.isFinite(o?.[f]) ? o[f] : 0), 0)
  return summe
}

function anteile(k) {
  const g = k.gesamt || 1
  return { ap: k.ap / g, lp: k.lp / g, bp: k.bp / g, bonus: k.bonus / g, zuschuesse: k.zuschuesse / g }
}

/**
 * Klassengrenzen der Ampel in Prozent. Eine einzige Quelle — die
 * Diagramme zeichnen ihre Hilfslinien aus denselben Werten, sonst
 * steht irgendwann eine Linie bei −8 %, während die Farben bei −6 %
 * umschlagen.
 */
export const AMPEL_SCHWELLEN = { gewinner: 2, neutral: -2, kritisch: -8 }

export function ampelFuer(prozent) {
  if (prozent >= AMPEL_SCHWELLEN.gewinner) return 'gewinner'
  if (prozent > AMPEL_SCHWELLEN.neutral) return 'neutral'
  if (prozent > AMPEL_SCHWELLEN.kritisch) return 'beobachten'
  return 'kritisch'
}

export function budgetAmpel(prozent) {
  const a = Math.abs(prozent)
  if (a <= 1.5) return { stufe: 'gruen', label: 'Im Referenzvergleich neutral' }
  if (a <= 4) return { stufe: 'gelb', label: 'Im Toleranzband' }
  return { stufe: 'rot', label: prozent > 0 ? 'Budget überschritten' : 'Budget unterschritten' }
}

// --------------------------------------------------- Einzelergebnis (Mikro)

/**
 * Vollständiges Ergebnis für eine Einheit inklusive Wasserfall und
 * Mehrjahresverlauf. Die Bonusnormierung muss von außen übergeben
 * werden, damit die Mikro-Sicht exakt zur Makro-Sicht passt.
 */
export function berechneEinzel(einheit, h, { jahre = 8, bonusNormierung = 1 } = {}) {
  const basis = istHebel()
  const ist = berechneEinheit(einheit, basis, { bonusNormierung: 1 })
  const ziel = berechneEinheit(einheit, h, { bonusNormierung })
  const zuschuss = hausZuschuss(einheit, h)
  const nachUebergang = mitRegel(ist.gesamt, ziel.gesamt, h, 1, ziel.gesamt, zuschuss)

  const stufen = wasserfall(einheit, h, { bonusNormierung })

  const verlauf = []
  for (let j = 1; j <= jahre; j++) {
    const zielJahr = verguetungImJahr(einheit, h, j, ziel, ist.lp)
    const mitUebergang = mitRegel(ist.gesamt, zielJahr, h, j, ziel.gesamt, zuschuss)
    verlauf.push({
      jahr: START_JAHR + j - 1, periode: j,
      ist: ist.gesamt, ziel: zielJahr, mitUebergang,
      delta: mitUebergang - ist.gesamt,
      deltaProzent: ist.gesamt > 0 ? ((mitUebergang - ist.gesamt) / ist.gesamt) * 100 : 0,
      kostenUebergang: mitUebergang - zielJahr,
    })
  }

  const zins = (h.diskontsatz ?? 5) / 100
  const kostenUebergangBarwert = verlauf.reduce(
    (s, v, i) => s + v.kostenUebergang / Math.pow(1 + zins, i + 1), 0)

  // Eingeschwungen: alle Jahrgänge der laufenden Provision zahlen, das
  // Zielmodell steht auf dem Wert des Referenzvergleichs (ziel.gesamt).
  // Erreicht im Jahr START_JAHR + lpDauer − 1, mit der Übergangsregel dieses
  // Jahres — so findet man die 9,4 Mio. des Steuerblocks im Zeitverlauf
  // wieder (2035 zahlen erst acht von zwölf Jahrgängen).
  const periodeVoll = Math.max(1, Math.round(ziel.lpDauer || 1))
  const mitUebergangVoll = mitRegel(ist.gesamt, ziel.gesamt, h, periodeVoll, ziel.gesamt, zuschuss)
  const eingeschwungen = {
    jahr: START_JAHR + periodeVoll - 1, periode: periodeVoll,
    imHorizont: periodeVoll <= jahre,
    ist: ist.gesamt, ziel: ziel.gesamt, mitUebergang: mitUebergangVoll,
    delta: mitUebergangVoll - ist.gesamt,
    deltaProzent: ist.gesamt > 0 ? ((mitUebergangVoll - ist.gesamt) / ist.gesamt) * 100 : 0,
    kostenUebergang: mitUebergangVoll - ziel.gesamt,
  }

  return {
    einheit,
    ist,
    ziel,
    delta: {
      absolut: ziel.gesamt - ist.gesamt,
      prozent: ist.gesamt > 0 ? ((ziel.gesamt - ist.gesamt) / ist.gesamt) * 100 : 0,
    },
    uebergang: {
      wert: nachUebergang,
      absolut: nachUebergang - ist.gesamt,
      prozent: ist.gesamt > 0 ? ((nachUebergang - ist.gesamt) / ist.gesamt) * 100 : 0,
      kostenJahr1: nachUebergang - ziel.gesamt,
      kostenKumuliert: verlauf.reduce((s, v) => s + v.kostenUebergang, 0),
      kostenBarwert: kostenUebergangBarwert,
    },
    barwert: {
      ist: ist.barwertKohorte, ziel: ziel.barwertKohorte,
      absolut: ziel.barwertKohorte - ist.barwertKohorte,
      prozent: ist.barwertKohorte > 0
        ? ((ziel.barwertKohorte - ist.barwertKohorte) / ist.barwertKohorte) * 100 : 0,
      promilleIst: ist.bwPromille, promilleZiel: ziel.bwPromille,
    },
    wasserfall: stufen,
    verlauf,
    eingeschwungen,
    kumuliert: kumuliertBarwert(verlauf, h),
    ampel: ampelFuer(ist.gesamt > 0 ? ((ziel.gesamt - ist.gesamt) / ist.gesamt) * 100 : 0),
  }
}

/**
 * Brücke von heute zum Zielmodell durch sequenzielle Parametersubstitution.
 *   mass       misst statt `gesamt` einen Baustein (BAUSTEINE[id].mass)
 *   uebergang  hängt die Übergangsregel des ersten Jahres an (nur für gesamt sinnvoll)
 */
export function wasserfall(einheit, h, { bonusNormierung = 1, mass = null, uebergang = true } = {}) {
  const messe = (r) => (mass ? mass(r) : r.gesamt)
  const lauf = istHebel()
  let vorher = messe(berechneEinheit(einheit, lauf, { bonusNormierung: 1 }))
  const start = vorher
  const stufen = [{ id: 'ist', label: 'Vergütung heute', kurz: 'Vergütung\nheute', typ: 'summe', wert: start, basis: 0, hoehe: start }]

  for (const stufe of WASSERFALL_STUFEN) {
    for (const feld of stufe.felder) {
      if (h[feld] !== undefined) lauf[feld] = h[feld]
    }
    // Der individuelle Hauszuschuss (Verhandlungsergebnis) zählt zur Stufe Zuschüsse
    if (stufe.id === 'zuschuesse' && h.hausZuschuesse) lauf.hausZuschuesse = h.hausZuschuesse
    // Die Bonusnormierung greift erst, sobald die Bonusstufe erreicht ist
    const norm = stufen.some(s => s.id === 'bonus') || stufe.id === 'bonus' ? bonusNormierung : 1
    const nachher = messe(berechneEinheit(einheit, lauf, { bonusNormierung: norm }))
    const beitrag = nachher - vorher
    stufen.push({
      id: stufe.id,
      label: stufe.label,
      kurz: stufe.kurz || stufe.label,
      hinweis: stufe.hinweis,
      typ: 'schritt',
      wert: beitrag,
      basis: Math.min(vorher, nachher),
      hoehe: Math.abs(beitrag),
    })
    vorher = nachher
  }

  stufen.push({ id: 'ziel', label: 'Zielmodell', kurz: 'Zielmodell', typ: 'summe', wert: vorher, basis: 0, hoehe: vorher })

  const nachUebergang = uebergang ? mitRegel(start, vorher, h, 1, vorher, mass ? 0 : hausZuschuss(einheit, h)) : vorher
  if (uebergang && Math.abs(nachUebergang - vorher) > 1) {
    stufen.push({
      id: 'uebergang', label: 'Übergangsregel', kurz: 'Übergangs-\nregel',
      hinweis: 'Besitzstand und Deckel im ersten Jahr nach der Umstellung.',
      typ: 'schritt', wert: nachUebergang - vorher,
      basis: Math.min(vorher, nachUebergang), hoehe: Math.abs(nachUebergang - vorher),
    })
    stufen.push({
      id: 'final', label: 'Erstes Jahr', typ: 'summe',
      wert: nachUebergang, basis: 0, hoehe: nachUebergang,
    })
  }

  return stufen
}

/**
 * Bausteine des Säulenpaars im Steuerblock (spartenPaare): Messgröße auf dem
 * Ergebnis einer Einheit oder den Portfolio-Komponenten, die Reglergruppen,
 * die den Baustein direkt bilden, die Gruppen, die als Faktoren mitwirken,
 * und der Rechenweg in einem Satz — für die Erklärungs-Schublade des Kastens.
 */
export const BAUSTEINE = {
  leben: {
    id: 'leben', label: 'Leben',
    mass: e => (e.apLeben || 0) + (e.lp || 0) + (e.bpLeben || 0),
    hebelGruppen: ['lebenKern'], mitwirkend: ['wahlmodelle', 'qualitaet', 'journey'],
    erklaerung: 'Abschlussprovision in Promille der Beitragssumme (mit Zuschlägen für bAV und Biometrie), laufende Provision je Neugeschäftsjahrgang über die Laufzeit und Bestandsprovision in Prozent des Bestandsbeitrags Leben. Wahlmodell-Mix, Requalifizierung und Journey-Teilung wirken als Faktoren darauf.',
  },
  komposit: {
    id: 'komposit', label: 'Komposit',
    mass: e => (e.apKomposit || 0) + (e.bpKomposit || 0),
    hebelGruppen: ['kompositKern'], mitwirkend: ['wahlmodelle', 'qualitaet', 'journey'],
    erklaerung: 'Abschlussprovision in Prozent des Jahresnettobeitrags im Neugeschäft (Kfz nur mit dem Rest nach Abschlag) und Bestandsprovision in Prozent des Bestandsbeitrags Komposit. Wahlmodell-Mix, Requalifizierung und Journey-Teilung wirken als Faktoren darauf.',
  },
  bonus: {
    id: 'bonus', label: 'Bonifikation',
    mass: e => e.bonus || 0,
    hebelGruppen: ['bonus'], mitwirkend: ['qualitaet'],
    erklaerung: 'Rohbonus = Abschlussvergütung × Stufensatz der Staffel nach Zielerreichung (nach Progression, plus Sockel für kleine Institute), auf das Bonusbudget normiert; danach der Auszahlungsgrad der Muss-Kriterien: 100, 75 oder 0 Prozent.',
  },
  zu: {
    id: 'zu', label: 'Zuschüsse',
    mass: e => e.zuschuesse || 0,
    hebelGruppen: ['zuschuesse'], mitwirkend: [],
    erklaerung: 'Kleinteilige und Sonderzuschüsse × (1 − Abbau), feste Zuschüsse unverändert, dazu ein allgemeiner Zuschuss in Prozent der Abschlussvergütung und ein Standortzuschuss je Geschäftsstelle.',
  },
}

/**
 * Wasserfall über alle Einheiten: je Stufe die Summe der Einzelbeiträge.
 * Jede Einzelstufe ist die Differenz zweier vollständiger Rechnungen, die
 * Summe ist daher exakt der Portfolio-Wasserfall des gemessenen Bausteins.
 */
export function wasserfallPortfolio(einheiten, h, { bonusNormierung = 1, mass = null } = {}) {
  const einzeln = einheiten.map(e => wasserfall(e, h, { bonusNormierung, mass, uebergang: false }))
  if (!einzeln.length) return []
  const stufen = []
  let laufend = 0
  einzeln[0].forEach((vorlage, i) => {
    const wert = einzeln.reduce((s, st) => s + (st[i]?.wert || 0), 0)
    if (vorlage.typ === 'summe') {
      laufend = wert
      stufen.push({ ...vorlage, wert, basis: 0, hoehe: wert })
    } else {
      const vorher = laufend
      laufend += wert
      stufen.push({ ...vorlage, wert, basis: Math.min(vorher, laufend), hoehe: Math.abs(wert) })
    }
  })
  return stufen
}

// --------------------------------------------------- Kennzahlen

/** Zählbarer Komplexitätsindex - Einfachheit wird gemessen, nicht behauptet */
export function komplexitaet(h) {
  const mix = wahlmodellMix(h)
  let n = Object.values(mix).filter(a => a > 0.02).length * 3
  n += Math.round(h.qualitaetskriterien ?? 0)
  n += (h.qualitaetsSpreizung ?? 0) > 0 ? 1 : 0
  n += (h.ausschoepfungsZuschlag ?? 0) > 0 ? 3 : 0
  n += (h.bonusBudget ?? 0) > 0 ? 2 : 0
  n += (h.journeyOmnikanal ?? 0) > 20 ? 4 : 0
  n += Math.ceil(3 * (1 - (h.zuschussAbbau ?? 0) / 100))
  return n
}

export const KOMPLEXITAET_MIN = 6
export const KOMPLEXITAET_MAX = 30

export const STEUERUNGSZIELE = [
  { id: 'neugeschaeft', label: 'Neugeschäft aktivieren', hinweis: 'Erstjahresvergütung gegenüber heute. Was der Vertrieb im Umstellungsjahr tatsächlich sieht.' },
  { id: 'bestandswert', label: 'Bestandswert heben', hinweis: 'Anteil der Vergütung, der nicht im Abschlussjahr, sondern über Laufzeit und Bestand fließt.' },
  { id: 'qualitaet', label: 'Qualität verankern', hinweis: 'Anteil der Gesamtvergütung, der von Qualitätskennzahlen abhängt.' },
  { id: 'profitabilitaet', label: 'Profitabilität sichern', hinweis: 'Entlastung der Abschlusskosten je Neugeschäftskohorte.' },
  { id: 'omnikanal', label: 'Omnikanal verzahnen', hinweis: 'Berücksichtigung hybrider Kundenreisen und der Betreuungsleistung.' },
  { id: 'einfachheit', label: 'Einfachheit erhalten', hinweis: 'Anzahl wirksamer Vergütungselemente gegenüber heute.' },
]

/** Steuerungswirkung je strategischem Ziel, 0..100, jeweils herleitbar */
export function steuerungswirkung(h, erg) {
  const clamp11 = v => klemme(v, -1, 1)
  const jahr1 = erg.verlauf?.[0]
  const rNeu = jahr1 && jahr1.ist > 0 ? jahr1.ziel / jahr1.ist - 1 : 0

  const gesamtZiel = erg.ziel.gesamt || 1
  const anteilNachAbschluss = (erg.ziel.lp + erg.ziel.bp) / gesamtZiel

  const kern = erg.ziel.ap + erg.ziel.lp + erg.ziel.bp
  const qAnteil = (erg.ziel.bonus + kern * ((h.qualitaetsSpreizung ?? 0) / 100)) / gesamtZiel

  const apAnteilIst = erg.ist.ap / (erg.ist.gesamt || 1)
  const apAnteilZiel = erg.ziel.ap / gesamtZiel

  const werte = {
    neugeschaeft: 50 + 50 * clamp11(rNeu / 0.25),
    bestandswert: 100 * clamp01(anteilNachAbschluss / 0.65),
    qualitaet: 100 * clamp01(qAnteil / 0.14),
    profitabilitaet: 50 + 50 * clamp11((apAnteilIst - apAnteilZiel) / 0.35),
    omnikanal: 100 * clamp01(
      0.7 * ((h.journeyOmnikanal ?? 10) / 100) / 0.6 +
      0.3 * ((h.betreuungsGewicht ?? 10) / 30)),
    einfachheit: 100 * clamp01(
      (KOMPLEXITAET_MAX - komplexitaet(h)) / (KOMPLEXITAET_MAX - KOMPLEXITAET_MIN)),
  }

  return STEUERUNGSZIELE.map(z => ({ ...z, wert: Math.round(klemme(werte[z.id], 0, 100)) }))
}

/**
 * Verhandlungsrisiko 0..100. Entscheidend ist die Volumensicht:
 * elf kleine Gewinner und drei große Verlierer sind nach Anzahl ein
 * Erfolg und nach Volumen ein Scheitern.
 */
export function verhandlungsrisiko(ergebnisse, h, strukturbruchAnteil, barwertProzent) {
  const vol = ergebnisse.reduce((a, e) => a + e.ist.gesamt, 0) || 1

  const verliererVolumen = ergebnisse
    .filter(e => e.delta.prozent < -2)
    .reduce((a, e) => a + e.ist.gesamt, 0) / vol

  const top5 = [...ergebnisse].sort((a, b) => b.ist.gesamt - a.ist.gesamt).slice(0, 5)
  const maxVerlust = clamp01(Math.max(0, ...top5.map(e => -e.delta.prozent / 100)) / 0.15)

  const strukturbruch = clamp01(Math.abs(strukturbruchAnteil) / 0.4)
  const komplexZuwachs = clamp01((komplexitaet(h) - KOMPLEXITAET_MIN) / (KOMPLEXITAET_MAX - KOMPLEXITAET_MIN))
  const budget = clamp01(Math.max(0, -barwertProzent) / 8)

  const index = 100 * clamp01(
    0.4 * verliererVolumen + 0.25 * maxVerlust + 0.15 * strukturbruch +
    0.1 * komplexZuwachs + 0.1 * budget)

  return {
    index: Math.round(index),
    stufe: index <= 25 ? 'belastbar' : index <= 50 ? 'verhandelbar' : index <= 75 ? 'kritisch' : 'optout',
    treiber: [
      { id: 'verlierer', label: 'Verliereranteil nach Volumen', wert: verliererVolumen, gewicht: 0.4 },
      { id: 'maxVerlust', label: 'Größter Verlust unter den Top 5', wert: maxVerlust, gewicht: 0.25 },
      { id: 'strukturbruch', label: 'Verschiebung der Vergütungsstruktur', wert: strukturbruch, gewicht: 0.15 },
      { id: 'komplexitaet', label: 'Komplexitätszuwachs', wert: komplexZuwachs, gewicht: 0.1 },
      { id: 'budget', label: 'Budgetkürzung im Barwert', wert: budget, gewicht: 0.1 },
    ],
  }
}

// --------------------------------------------------- Sensitivität

/**
 * Tornado: Wirkung jedes Hebels auf das Gesamtvolumen bei Auslenkung
 * um ±15 % seines Wertebereichs.
 */
export function sensitivitaet(einheiten, h) {
  const referenz = berechnePortfolio(einheiten, h).ziel.gesamt
  const kandidaten = HEBEL.filter(x => x.gruppe !== 'uebergang' && x.gruppe !== 'rahmen' && x.einheit !== 'schalter')

  return kandidaten.map(def => {
    const spanne = (def.max - def.min) * 0.15
    const wert = h[def.id] ?? def.standard
    const a = berechnePortfolio(einheiten, { ...h, [def.id]: klemme(wert - spanne, def.min, def.max) }).ziel.gesamt
    const b = berechnePortfolio(einheiten, { ...h, [def.id]: klemme(wert + spanne, def.min, def.max) }).ziel.gesamt
    return {
      id: def.id, label: def.label, kurz: def.kurz, gruppe: def.gruppe,
      runter: a - referenz, rauf: b - referenz,
      spannweite: Math.abs(b - a), referenz,
    }
  }).sort((x, y) => y.spannweite - x.spannweite)
}

/**
 * Sucht den Hebelwert, der das Gesamtbudget neutral stellt.
 * Binäre Suche, deterministisch, ohne Zufall.
 */
export function budgetNeutralerWert(einheiten, h, hebelId, { zielGroesse = 'barwert' } = {}) {
  const def = HEBEL_INDEX[hebelId]
  if (!def) return null

  const ziel = (p) => zielGroesse === 'barwert' ? p.barwert.prozent : p.delta.prozent
  const f = (v) => ziel(berechnePortfolio(einheiten, { ...h, [hebelId]: v }))

  let lo = def.min
  let hi = def.max
  const fLo = f(lo)
  const fHi = f(hi)
  if (fLo === fHi) return null
  if (fLo * fHi > 0) return null

  for (let i = 0; i < 34; i++) {
    const mitte = (lo + hi) / 2
    const fm = f(mitte)
    if (Math.abs(fm) < 0.05) { lo = mitte; hi = mitte; break }
    if (fm * fLo < 0) hi = mitte
    else lo = mitte
  }
  const roh = (lo + hi) / 2
  return klemme(Math.round(roh / def.step) * def.step, def.min, def.max)
}

// --------------------------------------------------- Zeilenhelfer (Tafeln)
//
// Dieselben Helfer füllen die Vergleichstabellen für eine Einheit und für
// das Gesamtportfolio: `ist`/`ziel` sind entweder Ergebnisse von
// berechneEinheit oder die Komponenten aus berechnePortfolio; `quelle` ist
// die Einheit, das Portfolio-Ergebnis (trägt `produktion`/`bestand`) oder
// null — dann bleibt die Bemessung leer.

function zeile(id, sparte, produkt, bemessung, alt, neu, rest = {}) {
  const a = alt ?? 0
  const n = neu ?? 0
  return { id, sparte, produkt, bemessung: bemessung ?? null, alt: a, neu: n, differenz: n - a, ...rest }
}

/** Fünf Produktionszeilen der Abschlussvergütung */
export function produktionszeilen(ist, ziel, quelle) {
  const p = quelle?.produktion || null
  const bsBasis = p ? Math.max(0, (p.lebenBs ?? 0) - (p.lebenBsBav ?? 0) - (p.lebenBsBiometrie ?? 0)) : null
  return [
    zeile('lebenBasis', 'Leben', 'Leben (Basis)', bsBasis, ist.apLebenBasis, ziel.apLebenBasis),
    zeile('lebenBav', 'Leben', 'bAV', p?.lebenBsBav, ist.apLebenBav, ziel.apLebenBav),
    zeile('lebenBio', 'Leben', 'Biometrie', p?.lebenBsBiometrie, ist.apLebenBio, ziel.apLebenBio),
    zeile('kompositSuh', 'Komposit', 'Sach, Unfall, Haftpflicht', p?.kompositSuh, ist.apKompositSuh, ziel.apKompositSuh),
    zeile('kompositKfz', 'Komposit', 'Kfz', p?.kompositKfz, ist.apKompositKfz, ziel.apKompositKfz),
  ]
}

/**
 * Laufende und Bestandsprovision. Die beiden Bestandszeilen tragen die Sparte
 * im Produktnamen und keine eigene Sparte: der Kasten zeigt keine Sparten-
 * Spalte und müsste sonst zwei gleichlautende Zeilen „Bestandsprovision“
 * nebeneinanderstellen; die Akte zeigt die Sparte-Spalte und ließe sonst
 * „Komposit · Bestandsprovision Komposit“ doppelt stehen.
 */
export function bestandszeilen(ist, ziel, quelle) {
  const p = quelle?.produktion || null
  const b = quelle?.bestand || null
  return [
    zeile('lpLeben', 'Leben', 'Laufende Provision', p?.lebenBs, ist.lp, ziel.lp),
    // Sparte gesetzt, Produkt kurz: die Akte zeigt die Sparte in ihrer Spalte,
    // der Kasten (ohne Sparten-Spalte) hängt sie über produktName() selbst an.
    zeile('bpLeben', 'Leben', 'Bestandsprovision', b?.lebenBeitrag, ist.bpLeben, ziel.bpLeben),
    zeile('bpKomposit', 'Komposit', 'Bestandsprovision', b?.kompositBeitrag, ist.bpKomposit, ziel.bpKomposit),
  ]
}

/** Bonifikation mit Stufe, Satz und Auszahlungsgrad (Einheit) — im Portfolio bleiben diese Felder null */
export function bonuszeilen(ist, ziel) {
  const grad = ziel.gate?.grad ?? null
  return [
    zeile('bonus', 'Bonifikation', 'Bonifikation', ziel.ap ?? null, ist.bonus, ziel.bonus, {
      stufeAlt: ist.bonusStufe?.label ?? null,
      stufeNeu: ziel.bonusStufe?.label ?? null,
      stufeIndexAlt: ist.bonusStufe?.index ?? null,
      stufeIndexNeu: ziel.bonusStufe?.index ?? null,
      satzAlt: ist.bonusStufe ? (ist.bonusStufe.satzNormiert ?? ist.bonusStufe.satzEffektiv) * 100 : null,
      satzNeu: ziel.bonusStufe ? (ziel.bonusStufe.satzNormiert ?? ziel.bonusStufe.satzEffektiv) * 100 : null,
      satzRohNeu: ziel.bonusStufe ? ziel.bonusStufe.satzEffektiv * 100 : null,
      auszahlungsgrad: grad,
      zielerreichung: ziel.bonusStufe?.zielerreichung ?? null,
    }),
  ]
}

/** Zuschusszeilen — Posten, die heute und neu null sind, entfallen */
export function zuschusszeilen(ist, ziel) {
  const a = ist.zuschussTeile || {}
  const n = ziel.zuschussTeile || {}
  const alle = [
    zeile('kleinteilig', 'Zuschüsse', 'Kleinteilige Zuschüsse', null, a.kleinteilig, n.kleinteilig),
    zeile('sonder', 'Zuschüsse', 'Sonderzuschüsse', null, a.sonder, n.sonder),
    zeile('fix', 'Zuschüsse', 'Feste Zuschüsse', null, a.fix, n.fix),
    zeile('allgemein', 'Zuschüsse', 'Allgemeiner Zuschuss', null, a.allgemein, n.allgemein),
    zeile('standort', 'Zuschüsse', 'Standortzuschuss', null, a.standort, n.standort),
  ]
  return alle.filter(z => z.id === 'kleinteilig' || z.id === 'allgemein' || z.id === 'standort' || z.alt > 0 || z.neu > 0)
}

/** Summe über Zeilen mit alt/neu */
export function summenzeile(zeilen) {
  const alt = zeilen.reduce((a, z) => a + (z.alt ?? 0), 0)
  const neu = zeilen.reduce((a, z) => a + (z.neu ?? 0), 0)
  return { alt, neu, differenz: neu - alt }
}

/** Stufen der Staffel, die als Linien über den Säulen stehen (Schwellen 85 bis 115 %) */
const SAEULEN_STUFEN = [1, 2, 3, 4]

/**
 * Sparten-Säulen einer Einheit: drei Wertungsjahre — Vorvorjahr, Vorjahr und
 * das Referenzjahr (hervorgehoben, `referenz: true`), auf dem heute und
 * Zielmodell rechnen; dazu die Stufenlinien der Bonusstaffel auf der
 * Zielvorgabe und die Plan-Linie. Ohne Hebelsatz stehen die Linien auf den
 * heutigen Schwellen. Keine Delta-Marke: das ist kein Modellvergleich.
 */
export function spartenSaeulen(einheit, h = null) {
  const staffel = h ? bonusStaffel(h) : BONUS_STAFFEL
  const p = einheit.produktion || {}
  const v = einheit.produktionVorjahr || {}
  const vv = einheit.produktionVorvorjahr || {}
  const z = einheit.zielvorgabe || {}
  const jahr = einheit.referenzjahr ?? 2025
  const sparten = [
    { id: 'leben', label: 'Leben', einheit: 'Beitragssumme Neugeschäft', ist: p.lebenBs, vorjahr: v.lebenBs, vorvorjahr: vv.lebenBs, plan: z.lebenBs },
    { id: 'bav', label: 'bAV', einheit: 'Beitragssumme Neugeschäft', ist: p.lebenBsBav, vorjahr: v.lebenBsBav, vorvorjahr: vv.lebenBsBav, plan: z.lebenBsBav },
    { id: 'biometrie', label: 'Biometrie', einheit: 'Beitragssumme Neugeschäft', ist: p.lebenBsBiometrie, vorjahr: v.lebenBsBiometrie, vorvorjahr: vv.lebenBsBiometrie, plan: z.lebenBsBiometrie },
    {
      id: 'komposit', label: 'Komposit', einheit: 'Jahresbeitrag Neugeschäft',
      ist: (p.kompositSuh ?? 0) + (p.kompositKfz ?? 0),
      vorjahr: (v.kompositSuh ?? 0) + (v.kompositKfz ?? 0),
      vorvorjahr: (vv.kompositSuh ?? 0) + (vv.kompositKfz ?? 0),
      plan: z.komposit,
    },
  ]
  return sparten.map(sp => {
    const ist = sp.ist ?? 0
    const vorjahr = sp.vorjahr ?? ist
    const vorvorjahr = sp.vorvorjahr ?? vorjahr
    const plan = sp.plan ?? ist
    return {
      id: sp.id,
      label: sp.label,
      einheit: sp.einheit,
      werte: [
        { label: String(jahr - 2), wert: vorvorjahr },
        { label: String(jahr - 1), wert: vorjahr },
        { label: String(jahr), wert: ist, referenz: true },
      ],
      stufen: SAEULEN_STUFEN.map(i => ({
        label: `Stufe ${i + 1} · ${prozentZahl.format(staffel[i].ab * 100)} %`,
        wert: staffel[i].ab * plan,
      })),
      plan: { label: 'Plan', wert: plan },
    }
  })
}

/** Prüft die Invariante Makro = Summe Mikro (für die Selbstprüfung im UI) */
export function pruefeKonsistenz(einheiten, h) {
  const portfolio = berechnePortfolio(einheiten, h)
  const einzeln = einheiten.reduce(
    (s, e) => s + berechneEinzel(e, h, { bonusNormierung: portfolio.bonusNormierung }).ziel.gesamt, 0)
  const abweichung = Math.abs(einzeln - portfolio.ziel.gesamt)
  return {
    makro: portfolio.ziel.gesamt,
    summeMikro: einzeln,
    abweichung,
    bestanden: abweichung / Math.max(1, portfolio.ziel.gesamt) < 0.0005,
  }
}

export { anteilKlassisch }
