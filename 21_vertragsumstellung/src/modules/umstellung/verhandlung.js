// ============================================================
// VERHANDLUNGSLOGIK
//
// Argumentationskarten werden aus den Kennzahlen der Einheit
// abgeleitet, nicht aus einer Textliste gezogen. Jede Karte trägt
// ihre Herkunft, damit im Gespräch nachvollziehbar bleibt, woher
// die Zahl stammt.
// ============================================================

import { euro, euroKompakt, prozent, prozentDelta, zahl } from '../../lib/format'
import { hausZuschuss } from '../../lib/modell'
import { HEBEL_INDEX } from '../../lib/hebel'

export const STATUS_LABEL = {
  nicht_begonnen: { label: 'Nicht begonnen', ton: 'neutral' },
  sondierung: { label: 'Sondierung', ton: 'info' },
  verhandlung: { label: 'In Verhandlung', ton: 'warnung' },
  grundsatzeinigung: { label: 'Grundsatzeinigung', ton: 'positiv' },
  absichtserklaerung_unterzeichnet: { label: 'Absichtserklärung', ton: 'positiv' },
  opt_out_risiko: { label: 'Opt-out-Risiko', ton: 'negativ' },
  abgeschlossen: { label: 'Abgeschlossen', ton: 'positiv' },
}

/**
 * Erzeugt die Argumentationslinie für ein Gespräch.
 * Reihenfolge: erst das Stärkste, dann das Erklärende, zuletzt
 * das Einräumende. Jede Karte nennt ihre Quelle.
 */
export function argumentationskarten(ergebnis, hebel, portfolio) {
  const e = ergebnis.einheit
  const karten = []
  const q = e.qualitaet

  // 1) Bestandsvergütung als Hauptargument
  if (ergebnis.ziel.bpLeben > ergebnis.ist.bpLeben * 1.2 || ergebnis.ziel.bp > ergebnis.ist.bp) {
    karten.push({
      id: 'bestand',
      ton: 'positiv',
      titel: 'Ihr Bestand wird erstmals durchgängig vergütet',
      text: `Auf einen betreuten Bestand von ${euroKompakt(e.bestand.lebenBeitrag + e.bestand.kompositBeitrag)} Jahresbeitrag entfallen künftig ${euroKompakt(ergebnis.ziel.bp)} Bestandsprovision statt heute ${euroKompakt(ergebnis.ist.bp)}. Das ist Vergütung für Betreuung, nicht für Abschluss — und sie fällt jedes Jahr wieder an.`,
      quelle: 'Bestandsdaten des Referenzjahres, Regler Bestandsprovision Leben und Komposit',
    })
  }

  // 2) Qualität
  const gate = ergebnis.ziel.gate
  if ((hebel.qualitaetsSpreizung ?? 0) > 0) {
    const gut = ergebnis.ziel.requalifizierungsFaktor >= 1
    karten.push({
      id: 'qualitaet',
      ton: gut ? 'positiv' : 'warnung',
      titel: gut
        ? 'Ihre Qualität zahlt sich künftig aus'
        : 'Ihre Qualitätskennzahlen kosten Sie Vergütung',
      text: gut
        ? `Mit einer Stornoquote von ${prozent(q.storno * 100)} und einer Beitragsduration von ${zahl(q.duration, 1)} Jahren liegen Sie über dem Portfoliodurchschnitt. Die Requalifizierung hebt Ihre Kernvergütung um ${prozentDelta((ergebnis.ziel.requalifizierungsFaktor - 1) * 100)}.`
        : `Mit einer Stornoquote von ${prozent(q.storno * 100)} und einer Beitragsduration von ${zahl(q.duration, 1)} Jahren liegen Sie unter dem Portfoliodurchschnitt. Die Requalifizierung senkt Ihre Kernvergütung um ${prozentDelta((ergebnis.ziel.requalifizierungsFaktor - 1) * 100)} — dieser Effekt ist steuerbar.`,
      quelle: 'Qualitätskennzahlen des Referenzjahres, Regler Spreizung der Requalifizierung',
    })
  }

  // 3) Bonus-Gate
  if (gate?.verfehlt?.length) {
    karten.push({
      id: 'gate',
      ton: 'warnung',
      titel: `Bonus nur zu ${prozent(gate.grad * 100, 0)} — ${gate.verfehlt.length} ${gate.verfehlt.length === 1 ? 'Kriterium' : 'Kriterien'} verfehlt`,
      text: `Nicht erfüllt: ${gate.verfehlt.map(k => k.label).join(', ')}. Werden diese Kriterien erreicht, steigt die Bonifikation auf ${euroKompakt(ergebnis.ziel.bonusVorGate ?? ergebnis.ziel.bonus / Math.max(0.01, gate.grad))}. Das ist kein Abzug, sondern ein erreichbarer Zuschlag.`,
      quelle: 'Muss-Kriterien der Bonifikation, Regler Anzahl Qualitätskriterien',
    })
  }

  // 4) Bestandsausschöpfung
  if (e.potenzial) {
    karten.push({
      id: 'potenzial',
      ton: 'info',
      titel: 'Ihr größter Hebel liegt in der Bestandsausschöpfung',
      text: `Heute haben ${prozent(q.ausschoepfung * 100)} Ihrer Bankkunden einen Versicherungsvertrag. Auf ${prozent(e.potenzial.zielBestandsausschoepfungsquote)} gehoben wären das ${zahl(e.potenzial.zusaetzlicheVersicherungskunden)} zusätzliche Kunden und rund ${euroKompakt(e.potenzial.zusaetzlicherBestandsbeitragLeben + e.potenzial.zusaetzlicherBestandsbeitragKomposit)} zusätzlicher Bestandsbeitrag — im neuen Modell erstmals dauerhaft vergütet.`,
      quelle: 'Potenzialrechnung aus Bankkundenzahl und Vertragsdichte',
    })
  }

  // 5) Cashflow ehrlich benennen
  const jahr1 = ergebnis.verlauf?.[0]
  if (jahr1 && jahr1.deltaProzent < -1) {
    // Dieselbe Schwelle wie Verlaufsdiagramm und Merksatz (deltaProzent >= 0),
    // sonst nennen Gesprächspunkt und Verlauf verschiedene Ausgleichsjahre.
    const erholung = ergebnis.verlauf.find(v => v.deltaProzent >= 0)
    karten.push({
      id: 'delle',
      ton: 'negativ',
      titel: 'Im ersten Jahr sinkt Ihre Vergütung',
      text: `2028 liegt Ihre Vergütung ${prozentDelta(jahr1.deltaProzent)} unter heute. Ursache ist nicht eine Kürzung, sondern der Aufbau der laufenden Provision über die Jahrgänge. ${erholung ? `Ab ${erholung.jahr} ist der Rückstand ausgeglichen.` : 'Bis 2035 bleibt ein Rückstand — hier ist eine Übergangsregel erforderlich.'}`,
      quelle: 'Kassenwirksame Mehrjahresrechnung mit Übergangsregel',
    })
  }

  // 6) Einordnung im Portfolio
  if (portfolio) {
    const rang = [...portfolio.ergebnisse].sort((a, b) => b.delta.prozent - a.delta.prozent)
      .findIndex(x => x.einheit.id === e.id) + 1
    karten.push({
      id: 'einordnung',
      ton: 'info',
      titel: `Platz ${rang} von ${portfolio.ergebnisse.length} im Portfolio`,
      text: `Ihre Veränderung von ${prozentDelta(ergebnis.delta.prozent)} liegt ${ergebnis.delta.prozent > portfolio.delta.prozent ? 'über' : 'unter'} dem Portfoliodurchschnitt von ${prozentDelta(portfolio.delta.prozent)}. Insgesamt gewinnen ${portfolio.verteilung.gewinner} Einheiten, ${portfolio.verteilung.verlierer} verlieren.`,
      quelle: 'Aggregation aller Vertriebseinheiten',
    })
  }

  return karten
}

/** Typische Einwände und belastbare Antworten */
export function einwaende(ergebnis, hebel) {
  // Bezug ist der heutige Satz aus der Hebeldefinition, nicht eine feste
  // Zahl — und das Verb folgt dem Vorzeichen, sonst steht „sinkt von 33 auf 34“.
  const apBasis = HEBEL_INDEX.apLeben.basis
  const apZiel = hebel.apLeben ?? apBasis
  const apVerb = apZiel > apBasis ? 'steigt' : apZiel < apBasis ? 'sinkt' : 'bleibt'
  const apSatz = apVerb === 'bleibt'
    ? `Der Basissatz bleibt bei ${zahl(apBasis, 1)} Promille.`
    : `Der Basissatz ${apVerb} von ${zahl(apBasis, 1)} auf ${zahl(apZiel, 1)} Promille.`
  // Dieselbe 2028-Zahl wie der Steuerblock: kassenwirksam, mit Übergangsregel.
  const jahr1 = ergebnis.verlauf[0]
  const liste = [
    {
      frage: 'Warum sinkt unsere Abschlussprovision?',
      antwort: `${apSatz} Der Betrag geht nicht verloren, sondern verlagert sich in laufende und Bestandsvergütung. Über die Vertragslaufzeit betrachtet ändert sich Ihre Gesamtvergütung um ${prozentDelta(ergebnis.barwert.prozent)} — was sich ändert, ist der Zeitpunkt.`,
    },
    {
      frage: 'Wir brauchen Planungssicherheit für 2028.',
      antwort: `Dafür gibt es die Übergangsregel. Mit der aktuellen Einstellung liegt Ihre Vergütung im ersten Jahr bei ${euro(jahr1.mitUebergang)}, das sind ${prozentDelta(jahr1.deltaProzent)} gegenüber heute. Die Regel kostet das Unternehmen ${euroKompakt(Math.abs(ergebnis.uebergang.kostenKumuliert))} über die Einschleifphase.`,
    },
    {
      frage: 'Andere Institute werden bessergestellt.',
      antwort: 'Die Sätze sind für alle identisch. Unterschiede entstehen ausschließlich aus dem eigenen Geschäftsmix, der Bestandsgröße und den Qualitätskennzahlen. Beide Größen sind steuerbar — genau das ist der Zweck des Modells.',
    },
    {
      frage: 'Wir sehen keinen Vorteil in der Journey-Teilung.',
      antwort: `Die Teilung wirkt in beide Richtungen. Geschäft, das heute unvergütet an der Zentrale vorbeiläuft, wird künftig anteilig zugeordnet. Mit der aktuellen Einstellung bleiben ${prozent(ergebnis.ziel.partnerQuote * 100)} der Neugeschäftsvergütung bei Ihnen.`,
    },
  ]
  return liste
}

/** Katalog verhandelbarer Zugeständnisse mit Kostenrechnung */
export const ZUGESTAENDNISSE = [
  {
    // Steht fest an erster Stelle: das eine Zugeständnis, das nur dieses Haus
    // betrifft und sofort sichtbar wirkt — im Zielmodell, in jeder Kasse und im
    // Budget. Kein Regler des Modells, sondern ein Verhandlungsergebnis.
    id: 'zuschuss-haus',
    label: 'Individueller Umstellungszuschuss, 100 Tsd. EUR je Jahr',
    haus: { zuschuss: 100_000 },
    fest: true,
    hinweis: 'Fester Zuschuss nur für dieses Haus, ab 2028 jedes Jahr und außerhalb der Übergangsregel gezahlt: wirkt sofort im Zielmodell (Referenzvergleich), in der Kasse jedes Jahres und im Budget.',
  },
  {
    id: 'besitzstand-hoch',
    label: 'Besitzstand auf 97 Prozent anheben',
    hebel: { besitzstandQuote: 97 },
    hinweis: 'Erhöht die Untergrenze im ersten Jahr. Wirkt nur bei Einheiten, die verlieren.',
  },
  {
    id: 'einschleif-lang',
    label: 'Einschleifphase auf fünf Jahre verlängern',
    hebel: { besitzstandJahre: 5 },
    hinweis: 'Streckt den Schutz. Teuerste Einzelmaßnahme, weil sie über Jahre wirkt.',
  },
  {
    id: 'verlustdeckel-eng',
    label: 'Verlustdeckel auf vier Prozent senken',
    hebel: { verlustdeckel: 4 },
    hinweis: 'Begrenzt den maximalen Rückgang je Jahr. Wirkt breit über alle Verlierer.',
  },
  {
    id: 'bestandsprovision-hoch',
    label: 'Bestandsprovision Leben um 0,2 Punkte anheben',
    hebel: null,
    delta: { bpLeben: 0.2 },
    hinweis: 'Modelländerung für alle. Begünstigt bestandsstarke Häuser überproportional.',
  },
  {
    id: 'gewinnvorgriff-hoch',
    label: 'Gewinnvorgriff auf 50 Prozent anheben',
    hebel: { gewinnvorgriff: 50 },
    hinweis: 'Gewinner erhalten die Hälfte ihres strukturellen Gewinns von Anfang an. Für Verlierer ohne Wirkung.',
  },
  {
    id: 'kleininstitut',
    label: 'Kleininstitutssockel auf sechs Prozentpunkte',
    hebel: { kleininstitutSockel: 6 },
    hinweis: 'Zielt gezielt auf kleinere Institute. Für große Häuser wirkungslos.',
  },
  {
    // Der Vorschlagswert des Reglers liegt bei 8 %; ein Zugeständnis muss
    // darunter liegen, sonst wäre es eine Verschärfung (Haus verliert,
    // Budget spart) und stünde als „günstigstes“ oben in der Liste.
    id: 'journey-mild',
    label: 'Journey-Teilung auf 4 Prozent zurücknehmen',
    hebel: { journeyOmnikanal: 4 },
    hinweis: 'Nimmt Druck aus der Neugeschäftsvergütung, schwächt aber die Omnikanal-Steuerung.',
  },
]

/** Hebelsatz mit einem Zugeständnis: Hausbetrag, feste Werte oder Delta. */
export function hebelMitZugestaendnis(hebel, z, einheitId) {
  if (z.haus) {
    const alt = hebel.hausZuschuesse || {}
    return { ...hebel, hausZuschuesse: { ...alt, [einheitId]: (Number(alt[einheitId]) || 0) + z.haus.zuschuss } }
  }
  if (z.hebel) return { ...hebel, ...z.hebel }
  if (z.delta) {
    const neu = { ...hebel }
    for (const [k, v] of Object.entries(z.delta)) neu[k] = (hebel[k] ?? 0) + v
    return neu
  }
  return hebel
}

/**
 * Hebelsatz ohne ein Zugeständnis: der Hausbetrag entfällt, feste Werte
 * kehren auf die Basis der Verhandlung zurück (die Fassung beim ersten
 * Öffnen), ein Delta wird abgezogen.
 */
export function hebelOhneZugestaendnis(hebel, z, einheitId, basis) {
  if (z.haus) {
    const alt = { ...(hebel.hausZuschuesse || {}) }
    delete alt[einheitId]
    return { ...hebel, hausZuschuesse: alt }
  }
  if (z.hebel) {
    const neu = { ...hebel }
    for (const k of Object.keys(z.hebel)) neu[k] = basis?.[k] ?? hebel[k]
    return neu
  }
  if (z.delta) {
    const neu = { ...hebel }
    for (const [k, v] of Object.entries(z.delta)) neu[k] = (hebel[k] ?? 0) - v
    return neu
  }
  return hebel
}

/**
 * Kurzfassung für Steuerblock und Handout. Ein Satz, höchstens rund 90
 * Zeichen: die Unterzeile des Steuerblocks ist auf zwei Zeilen begrenzt und
 * würde einen längeren Text mit Ellipse abschneiden.
 */
export function kernaussage(ergebnis) {
  const d = ergebnis.delta.prozent
  const j1 = ergebnis.verlauf?.[0]?.deltaProzent ?? d
  const name = ergebnis.einheit.kurz || ergebnis.einheit.name

  // Die Übergangsregel kann ein Haus 2028 exakt auf heute halten (Besitzstand
  // 100 %, Verlustdeckel 0 %). Das ist weder „im Plus“ noch ein Rückgang,
  // sondern das heutige Niveau — und bei einem Verlierer der Grund, warum
  // die Akte trotzdem verhandelbar ist.
  const haelt = Math.abs(j1) < 0.5
  if (d >= 2 && haelt) {
    return `${name} gewinnt im Referenzvergleich ${prozentDelta(d)} und hält 2028 sein heutiges Niveau.`
  }
  if (d >= 2 && j1 > 0) {
    return `${name} gewinnt im Referenzvergleich ${prozentDelta(d)} und startet schon 2028 im Plus.`
  }
  if (d >= 2) {
    return `${name} gewinnt im Referenzvergleich ${prozentDelta(d)}, startet 2028 aber mit ${prozentDelta(j1)}.`
  }
  if (d > -2) {
    return `${name} liegt im Referenzvergleich bei ${prozentDelta(d)}: die Struktur wandelt sich, die Höhe kaum.`
  }
  if (haelt) {
    return `${name} verliert im Referenzvergleich ${prozentDelta(d)}; die Übergangsregel hält das Haus 2028 auf heutigem Niveau.`
  }
  return `${name} verliert im Referenzvergleich ${prozentDelta(d)} — ohne Zugeständnis nicht verhandelbar.`
}

/**
 * Label/Wert-Zeilen der Tafel „Garantien und Übergang“ im Akten-Dashboard:
 * die vier Übergangshebel, was sie 2028 für dieses Haus bewirken und was
 * die Regel das Unternehmen kostet. Die 2028-Zahl ist dieselbe wie in der
 * zweiten Plakette des Steuerblocks (kassenwirksam, verlauf[0]), und die
 * Kosten sind dieselben wie in der Jahreswerte-Tabelle — Block, Tafel und
 * Tabelle dürfen nicht drei verschiedene Zahlen nennen.
 */
export function garantiezeilen(ergebnis, hebel) {
  const def = (id) => HEBEL_INDEX[id] || {}
  const quote = hebel?.besitzstandQuote ?? def('besitzstandQuote').basis ?? 0
  const jahre = Math.round(hebel?.besitzstandJahre ?? def('besitzstandJahre').basis ?? 0)
  const verlust = hebel?.verlustdeckel ?? def('verlustdeckel').basis ?? 30
  const gewinn = hebel?.gewinndeckel ?? def('gewinndeckel').basis ?? 60
  const vorgriff = hebel?.gewinnvorgriff ?? def('gewinnvorgriff').basis ?? 0
  const j1 = ergebnis.verlauf?.[0] || null
  const kostenJahr1 = j1?.kostenUebergang ?? ergebnis.uebergang?.kostenJahr1 ?? 0
  const kostenKumuliert = ergebnis.uebergang?.kostenKumuliert ?? 0
  const jahr1 = j1?.jahr ?? 2028
  const jahrEnde = ergebnis.verlauf?.[ergebnis.verlauf.length - 1]?.jahr ?? 2035

  // Schrittweite 0,5 beim Verlustdeckel: nur dann eine Nachkommastelle
  const satz = (v) => prozent(v, Number.isInteger(v) ? 0 : 1)
  const besitzstand = quote > 0 && jahre > 0
  // Deckel am Anschlag (30 % bzw. 60 %) sind laut Hebeldefinition „praktisch kein Deckel“
  const verlustAktiv = verlust < 30
  const gewinnAktiv = gewinn < 60
  const tonJahr1 = j1
    ? (j1.deltaProzent < -2 ? 'negativ' : j1.deltaProzent > 2 ? 'positiv' : 'warnung')
    : 'neutral'
  const zuschussHaus = hausZuschuss(ergebnis.einheit, hebel)

  return [
    ...(zuschussHaus > 0 ? [{
      id: 'zuschussHaus', label: 'Individueller Zuschuss',
      hinweis: 'Verhandlungsergebnis für dieses Haus: fester Zuschuss je Jahr ab 2028, außerhalb der Übergangsregel gezahlt, im Zielmodell enthalten.',
      wert: `${euroKompakt(zuschussHaus)} je Jahr`, ton: 'positiv', punkt: true,
    }] : []),
    {
      id: 'besitzstand', label: 'Besitzstandsquote', hinweis: def('besitzstandQuote').hinweis,
      wert: besitzstand ? satz(quote) : 'keine', ton: besitzstand ? undefined : 'neutral',
    },
    {
      id: 'einschleif', label: 'Einschleifphase', hinweis: def('besitzstandJahre').hinweis,
      wert: jahre > 0 ? (jahre === 1 ? '1 Jahr' : `${zahl(jahre)} Jahre`) : 'keine',
      ton: jahre > 0 ? undefined : 'neutral',
    },
    {
      id: 'verlustdeckel', label: 'Verlustdeckel', hinweis: def('verlustdeckel').hinweis,
      wert: verlustAktiv ? satz(verlust) : 'keiner', ton: verlustAktiv ? undefined : 'neutral',
    },
    {
      id: 'gewinndeckel', label: 'Gewinndeckel', hinweis: def('gewinndeckel').hinweis,
      wert: gewinnAktiv ? satz(gewinn) : 'keiner', ton: gewinnAktiv ? undefined : 'neutral',
    },
    {
      id: 'gewinnvorgriff', label: 'Gewinnvorgriff', hinweis: def('gewinnvorgriff').hinweis,
      wert: vorgriff > 0 ? satz(vorgriff) : 'keiner', ton: vorgriff > 0 ? undefined : 'neutral',
    },
    {
      id: 'jahr1', label: `${jahr1} nach Regel`,
      hinweis: 'Kassenwirksame Vergütung im ersten Jahr nach der Umstellung, mit Übergangsregel.',
      wert: j1 ? euroKompakt(j1.mitUebergang) : '–',
    },
    {
      id: 'jahr1Delta', label: 'gegenüber heute',
      wert: j1 ? prozentDelta(j1.deltaProzent) : '–', ton: tonJahr1,
    },
    // Die beiden Kostenzeilen tragen kurze Labels: „Kosten der Regel, kumuliert“
    // kappte in der Drittel-Tafel schon bei 1600 px. Die erste nennt das
    // Jahr, die zweite hängt sich als „kumuliert bis …“ daran.
    {
      id: 'kostenJahr1', label: `Kosten der Regel ${jahr1}`,
      hinweis: 'Was die Übergangsregel im ersten Jahr kostet: Auszahlung nach Regel abzüglich Zielmodell.',
      wert: kostenJahr1 > 1 ? euroKompakt(kostenJahr1) : '–',
      ton: kostenJahr1 > 1 ? 'warnung' : 'neutral', punkt: kostenJahr1 > 1,
    },
    {
      id: 'kostenKumuliert', label: `kumuliert bis ${jahrEnde}`,
      hinweis: 'Summe der Regelkosten über alle Jahre der Mehrjahresrechnung.',
      wert: kostenKumuliert > 1 ? euroKompakt(kostenKumuliert) : '–',
      ton: kostenKumuliert > 1 ? undefined : 'neutral',
    },
  ]
}
