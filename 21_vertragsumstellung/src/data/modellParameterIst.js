// ============================================================
// IST-Vergütungsmodell (Wertungsjahr 2025) - Parameter & Formeln
// Alle Demodaten in sparkassen.js / agenturen.js / portfolio.js
// sind exakt mit diesen Sätzen gerechnet und damit reproduzierbar.
// Geldbeträge: Zahlen in EUR. Quoten: Prozent als Zahl (7.8 = 7,8 %),
// Provisionssätze: Dezimalfaktor (0.035 = 35 Promille).
// ============================================================

export const WERTUNGSJAHR_IST = 2025
export const GO_LIVE_ZIELMODELL = '2028-01-01'

/** Bankenvertrieb (Sparkassen) */
export const istParameterSparkassen = {
  // Leben: Abschlussprovision auf die Beitragssumme
  apSatzLebenApOnly: 0.035,      // 35 Promille (AP-only, > 75 % Wahlanteil)
  apSatzLebenLvrg: 0.020,        // 20 Promille (LVRG-konforme Variante)
  lpSatzLebenLvrg: 0.0015,       // 1,5 Promille p. a. auf die Beitragssumme
  lvrgJahrgaenge: 5,             // kumulierte LVRG-Tranchen im Bestand
  lvrgStornoAbschlag: 0.97,

  // Komposit: Abschlussprovision als Anteil eines Jahresbeitrags
  apKompositSach: 0.95,
  apKompositKfz: 0.20,
  // Komposit: Bestands-/Folgeprovision auf den Bestandsjahresbeitrag
  bpKompositSach: 0.060,
  bpKompositKfz: 0.020,

  // Bonusstaffel auf Institutsebene, progressiv, Basis = AP Leben + AP Komposit
  bonusStaffel: [
    { abZielerreichung: 1.25, satz: 0.13 },
    { abZielerreichung: 1.10, satz: 0.10 },
    { abZielerreichung: 1.00, satz: 0.07 },
    { abZielerreichung: 0.90, satz: 0.04 },
    { abZielerreichung: 0.00, satz: 0.00 },
  ],
  // Kleininstitutszuschlag (greift nur, wenn die Staffel überhaupt zündet)
  kleininstitutszuschlag: [
    { bisBilanzsumme: 1_500_000_000, punkte: 0.03 },
    { bisBilanzsumme: 2_500_000_000, punkte: 0.02 },
    { bisBilanzsumme: Infinity, punkte: 0.00 },
  ],

  // Zuschüsse / Sonstiges
  zuschussJeBerater: 1400,
  zuschussJeGeschaeftsstelle: 950,
  aktionsbudgetAnteilAbschluss: 0.025,
}

/** Ausschließlichkeitsorganisation (AO) */
export const istParameterAo = {
  apSatzLebenApOnly: 0.038,
  apSatzLebenLvrg: 0.022,
  lpSatzLebenLvrg: 0.0015,
  lvrgJahrgaenge: 5,
  lvrgStornoAbschlag: 0.97,
  apKompositSach: 1.05,
  apKompositKfz: 0.22,
  bpKompositSach: 0.060,
  bpKompositKfz: 0.025,
  leistungsbonus: [
    { abZielerreichung: 1.10, satz: 0.080 },
    { abZielerreichung: 1.00, satz: 0.055 },
    { abZielerreichung: 0.90, satz: 0.030 },
    { abZielerreichung: 0.00, satz: 0.000 },
  ],
  infrastrukturJeMitarbeiter: 2600,
}

/** Mischsatz Komposit aus Sach- und Kfz-Satz über den Kfz-Anteil */
export function kompositMischsatz(sachSatz, kfzSatz, kfzAnteil) {
  return sachSatz - (sachSatz - kfzSatz) * kfzAnteil
}

export function apLebenIst(beitragssumme, apOnlyQuote, p = istParameterSparkassen) {
  return Math.round(beitragssumme * (apOnlyQuote * p.apSatzLebenApOnly + (1 - apOnlyQuote) * p.apSatzLebenLvrg))
}

export function apKompositIst(jahresbeitrag, kfzAnteil, p = istParameterSparkassen) {
  return Math.round(jahresbeitrag * kompositMischsatz(p.apKompositSach, p.apKompositKfz, kfzAnteil))
}

export function bestandsprovisionIst(bestandKompositJahresbeitrag, lvrgBemessungsgrundlage, kfzAnteil, p = istParameterSparkassen) {
  const bp = Math.round(bestandKompositJahresbeitrag * kompositMischsatz(p.bpKompositSach, p.bpKompositKfz, kfzAnteil))
  const lp = Math.round(lvrgBemessungsgrundlage * p.lpSatzLebenLvrg)
  return { bestandsprovisionKomposit: bp, laufendeProvisionLeben: lp, summe: bp + lp }
}

export function bonussatzIst(zielerreichung, bilanzsummeEur, p = istParameterSparkassen) {
  const stufe = p.bonusStaffel.find(s => zielerreichung >= s.abZielerreichung)
  if (!stufe || stufe.satz === 0) return 0
  const zuschlag = p.kleininstitutszuschlag.find(k => bilanzsummeEur <= k.bisBilanzsumme).punkte
  return stufe.satz + zuschlag
}

/**
 * Qualitäts-Verrechnungsfaktor auf den Bonus (0 / 75 / 100 %).
 * Dieselbe Logik wird im Zielmodell als Verrechnungsfaktor auf den
 * Auszahlungsgrad der Bonifikation weiterverwendet.
 */
export function qualitaetsstufe({ stornoquoteLeben, weiterbildungsquote, beitragsfreistellungsquote }) {
  if (stornoquoteLeben <= 5.0 && weiterbildungsquote >= 80 && beitragsfreistellungsquote <= 9.0) return 100
  if (stornoquoteLeben <= 6.5 && weiterbildungsquote >= 65) return 75
  return 0
}

/** Beratungsqualitätsindex 0-100 (nur Anzeige-/Sortierkennzahl) */
export function beratungsqualitaetIndex({ weiterbildungsquote, stornoquoteLeben, beitragsfreistellungsquote }) {
  const v = 0.4 * weiterbildungsquote + 0.3 * (100 - stornoquoteLeben * 10) + 0.3 * (100 - beitragsfreistellungsquote * 4)
  return Math.round(v * 10) / 10
}

/** Wahlmodelle des Zielmodells (Stammdaten für Auswahl-UI und Simulation) */
export const wahlmodelle = [
  { key: 'apFpModell', label: 'AP/FP-Modell', kurz: 'AP/FP',
    beschreibung: 'Klassische Aufteilung aus Abschlussprovision und Folgeprovision. Cashflow-Profil wie heute.' },
  { key: 'umdeckerModell', label: 'Umdecker-Modell', kurz: 'Umdecker',
    beschreibung: 'Befristet erhöhte Abschlussprovision als Aktivierungshebel für Wechsel- und Neuanbindungsgeschäft.' },
  { key: 'hybridModell', label: 'Hybrid-Modell', kurz: 'Hybrid',
    beschreibung: 'Verlagerung von Abschluss- zu Folge- und laufender Provision, stärkere Bestandsorientierung.' },
  { key: 'laufendesModell', label: 'Laufendes Modell', kurz: 'Laufend',
    beschreibung: 'Wertintensivierendes Modell für Bestandsvertriebspartner, Schwerpunkt Bestands- und Laufendprovision.' },
]

/** Referenz-Journeys für die Teilungslogik im Zielmodell */
export const referenzJourneys = [
  { key: 'vertriebspartnerJourney', nummer: 1, label: 'Vertriebspartner-Journey',
    beschreibung: 'Kontakt, Beratung und Abschluss vollständig beim Vertriebspartner.' },
  { key: 'leadJourney', nummer: 2, label: 'Lead-Journey',
    beschreibung: 'Lead entsteht zentral oder digital, Beratung und Abschluss beim Vertriebspartner.' },
  { key: 'schrankfertigesGeschaeft', nummer: 3, label: 'Schrankfertiges Geschäft',
    beschreibung: 'Zentrale bringt den abschlussreifen Vorgang, Vertriebspartner betreut den Kunden weiter.' },
  { key: 'direktJourney', nummer: 4, label: 'Direkt-Journey',
    beschreibung: 'Kontakt, Abschluss und Betreuung im Direktkanal, Vertriebspartner erhält Betreuungsanteil.' },
]

/** Journey-Phasen für die Scoring-/Teilungslogik (Summe der Punkte = 100) */
export const journeyPhasen = [
  { key: 'kontakt', label: 'Kontakt', punkte: 10 },
  { key: 'lead', label: 'Lead', punkte: 15 },
  { key: 'beratung', label: 'Beratung', punkte: 40 },
  { key: 'abschluss', label: 'Abschluss', punkte: 20 },
  { key: 'betreuung', label: 'Betreuung', punkte: 15 },
]

export const verhandlungsStatus = [
  { key: 'nicht_begonnen', label: 'Nicht begonnen', ton: 'neutral' },
  { key: 'sondierung', label: 'Sondierung', ton: 'neutral' },
  { key: 'verhandlung', label: 'In Verhandlung', ton: 'warnung' },
  { key: 'grundsatzeinigung', label: 'Grundsatzeinigung', ton: 'positiv' },
  { key: 'absichtserklaerung_unterzeichnet', label: 'Absichtserklärung unterzeichnet', ton: 'positiv' },
  { key: 'opt_out_risiko', label: 'Opt-out-Risiko', ton: 'negativ' },
]

export const rollen = [
  { key: 'S-Finanzberater', label: 'S-Finanzberater' },
  { key: 'Individualkundenberater', label: 'Individualkundenberater' },
  { key: 'Vermögensberater', label: 'Vermögensberater' },
  { key: 'Geschäftsstellenleiter', label: 'Geschäftsstellenleiter' },
]
