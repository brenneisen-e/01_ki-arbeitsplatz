// =============================================================================
// Gap Analyzer — Abgleich zweier Kontrollinventare (Ausblick)
//
// Die anderen beiden Module arbeiten auf *einem* Inventar: eines wird
// abgeleitet, eines verschlankt. Dieses Modul stellt *zwei* Inventare
// gegenüber und beantwortet die Frage, die bei jeder Strukturveränderung
// zuerst kommt: Welche Kontrollen fehlen der neuen Einheit — und was davon
// muss zum Vollzugsstichtag stehen?
//
//   · Carve-out — eine Tochter wird herausgelöst. Kontrollen, die bisher der
//     Konzern erbracht hat (Shared Services, Konzern-IT, Treasury, Compliance),
//     fallen weg. Zusätzlich greifen Anforderungen, die vorher auf
//     Konzernebene erfüllt wurden.
//   · Fusion — zwei Inventare treffen aufeinander. Es entstehen Doppelungen,
//     Schwellen- und Designkonflikte, und beide Häuser haben Lücken, die das
//     jeweils andere schließt.
//
// Alle Inhalte sind frei erfunden (synthetische Demo-Daten) und knüpfen an
// dieselben Prozessbereiche an wie die IST-Analyse.
// =============================================================================

import { TEAM, getTeamMember, STUFE_MAP } from './biksAgent';

export { TEAM, getTeamMember, STUFE_MAP };

// ===== Szenarien =============================================================
export const SZENARIEN = [
  {
    id: 'carve-out',
    label: 'Carve-out',
    kurz: 'Carve-out',
    icon: 'Split',
    frage: 'Was fehlt der herausgelösten Einheit, wenn der Konzern wegfällt?',
    beschreibung:
      'Eine Tochtergesellschaft wird aus dem Konzernverbund herausgelöst und muss ihr IKS eigenständig tragen. Der Agent prüft, welche Kontrollen bisher zentral erbracht wurden, welche regulatorischen Pflichten neu auf die Einheit übergehen und was bis zum Vollzugsstichtag stehen muss.',
    einheitA: { id: 'konzern', label: 'Konzern (abgebend)', kurz: 'Konzern' },
    einheitB: { id: 'zieleinheit', label: 'Zieleinheit (Carve-out)', kurz: 'Zieleinheit' },
    beispielA: { name: 'Kontrollinventar_Konzern_Gesamt.xlsx', typ: 'RCM / Konzerninventar', size: 214870 },
    beispielB: { name: 'Kontrollinventar_Nordbank-Direkt_Standalone.xlsx', typ: 'RCM / Zieleinheit', size: 61240 },
    zielName: 'Nordbank Direkt AG',
    fahrplanTitel: 'Fahrplan nach Vollzugsstichtag',
    stichtagLabel: 'Vollzugsstichtag',
    zielLabel: 'Zielzustand Zieleinheit',
  },
  {
    id: 'fusion',
    label: 'Fusion',
    kurz: 'Fusion',
    icon: 'Merge',
    frage: 'Wo überschneiden, wo widersprechen sich die beiden Inventare?',
    beschreibung:
      'Zwei Institute verschmelzen. Der Agent gleicht beide Kontrollinventare semantisch ab: welche Kontrollen inhaltlich deckungsgleich sind, wo Schwellenwerte und Kontrolldesign auseinanderlaufen, welche Lücken die jeweils andere Seite schließt und welche Anforderungen durch die neue Größe erstmals greifen.',
    einheitA: { id: 'aufnehmend', label: 'Aufnehmendes Institut', kurz: 'Institut A' },
    einheitB: { id: 'uebertragend', label: 'Übertragendes Institut', kurz: 'Institut B' },
    beispielA: { name: 'Kontrollinventar_Nordbank_Bestand.xlsx', typ: 'RCM / aufnehmend', size: 158330 },
    beispielB: { name: 'Kontrollinventar_Suedwest-Kreditbank.xlsx', typ: 'RCM / übertragend', size: 132910 },
    zielName: 'Nordbank / Südwest Kreditbank',
    fahrplanTitel: 'Fahrplan nach Vollzugsstichtag',
    stichtagLabel: 'Vollzugsstichtag',
    zielLabel: 'Zielzustand fusioniertes Institut',
  },
  {
    id: 'anlehnung',
    label: 'Anlehnung',
    kurz: 'Anlehnung',
    icon: 'Building2',
    frage: 'Wo weicht das IKS der Tochter vom Konzernstandard ab?',
    beschreibung:
      'Eine Tochtergesellschaft möchte ihr IKS an den Konzernstandard anlehnen, ohne dass eine Transaktion dahintersteht — etwa um Prüfungsfeststellungen zu begegnen oder die Konzernberichterstattung anschlussfähig zu machen. Der Agent vergleicht beide Inventare gegen den Konzern als Referenz: wo die Tochter hinter dem Standard zurückbleibt, wo sie über ihn hinausgeht und wo der Standard fachlich gar nicht auf sie passt.',
    einheitA: { id: 'konzern', label: 'Konzernstandard (Referenz)', kurz: 'Konzernstandard' },
    einheitB: { id: 'tochter', label: 'Tochtergesellschaft', kurz: 'Tochter' },
    beispielA: { name: 'Konzern-Kontrollstandard_2026.xlsx', typ: 'RCM / Konzernstandard', size: 189440 },
    beispielB: { name: 'Kontrollinventar_Nordbank-Leasing.xlsx', typ: 'RCM / Tochter', size: 54120 },
    zielName: 'Nordbank Leasing GmbH',
    fahrplanTitel: 'Fahrplan der Angleichung',
    stichtagLabel: 'Zieltermin der Angleichung',
    zielLabel: 'Zielzustand nach Anlehnung',
    // Ohne Transaktion gibt es keinen Vollzugsstichtag — die Fristen heissen anders.
    fristen: {
      day1:     { label: 'Kurzfristig', lang: 'Innerhalb des laufenden Jahres', hinweis: 'Bezieht sich auf offene Prüfungsfeststellungen oder Konzernvorgaben mit gesetzter Frist.' },
      day100:   { label: 'Mittelfristig', lang: 'Nächster Planungszyklus', hinweis: 'Fachlich unstrittig, aber an Budget- oder Systemvorhaben gebunden.' },
      zielbild: { label: 'Zielbild', lang: 'Zielbild', hinweis: 'Wünschenswerte Angleichung ohne Terminbindung.' },
    },
  },
];
export const SZENARIO_MAP = Object.fromEntries(SZENARIEN.map(s => [s.id, s]));

// ===== Gap-Typen =============================================================
export const GAP_TYPEN = [
  {
    id: 'luecke',
    label: 'Kontrolle fehlt',
    kurz: 'Lücke',
    color: '#DC2626',
    bg: '#FEF2F2',
    icon: 'CircleSlash',
    beschreibung: 'Für ein wesentliches Risiko existiert in der Zieleinheit keine Kontrolle — weder eigene noch übernommene.',
    szenarien: ['carve-out', 'fusion', 'anlehnung'],
  },
  {
    id: 'konzernabhaengig',
    label: 'Konzernabhängig',
    kurz: 'Konzern',
    color: '#EA580C',
    bg: '#FFF7ED',
    icon: 'Unplug',
    beschreibung: 'Die Kontrolle wird heute zentral erbracht und steht nach dem Vollzug nicht mehr zur Verfügung.',
    szenarien: ['carve-out'],
  },
  {
    id: 'doppelt',
    label: 'Doppelt vorhanden',
    kurz: 'Doppelt',
    color: '#7C3AED',
    bg: '#F5F3FF',
    icon: 'CopyX',
    beschreibung: 'Beide Häuser führen für dasselbe Risiko eine eigene Kontrolle — im Zielinventar bleibt eine davon.',
    szenarien: ['fusion'],
  },
  {
    id: 'abweichend',
    label: 'Abweichendes Design',
    kurz: 'Abweichung',
    color: '#D97706',
    bg: '#FFFBEB',
    icon: 'GitCompareArrows',
    beschreibung: 'Die Kontrolle existiert auf beiden Seiten, aber mit unterschiedlichem Schwellenwert, Turnus oder Reifegrad.',
    szenarien: ['carve-out', 'fusion', 'anlehnung'],
  },
  {
    id: 'regulatorisch_neu',
    label: 'Neue Anforderung',
    kurz: 'Neu',
    color: '#2563EB',
    bg: '#EFF6FF',
    icon: 'Gavel',
    beschreibung: 'Durch die neue Struktur greift eine Anforderung, die vorher nicht auf dieser Ebene erfüllt werden musste.',
    szenarien: ['carve-out', 'fusion', 'anlehnung'],
  },
  {
    id: 'ueber_standard',
    label: 'Über Standard',
    kurz: 'Über Standard',
    color: '#0891B2',
    bg: '#ECFEFF',
    icon: 'TrendingUp',
    beschreibung: 'Die Einheit kontrolliert enger als der Referenzstandard verlangt — prüfen, ob der Mehraufwand gerechtfertigt ist.',
    szenarien: ['anlehnung'],
  },
  {
    id: 'deckungsgleich',
    label: 'Deckungsgleich',
    kurz: 'Deckungsgleich',
    color: '#059669',
    bg: '#ECFDF5',
    icon: 'CheckCircle2',
    beschreibung: 'Die Abdeckung trägt unverändert — kein Handlungsbedarf zum Vollzug.',
    szenarien: ['carve-out', 'fusion', 'anlehnung'],
  },
];
export const GAP_TYP_MAP = Object.fromEntries(GAP_TYPEN.map(t => [t.id, t]));

// ===== Zeitliche Kritikalität ===============================================
export const KRITIKALITAET = [
  { id: 'day1',    label: 'Day 1',    lang: 'Zum Vollzugsstichtag', color: '#B91C1C', bg: '#FEF2F2', rang: 3, hinweis: 'Ohne diese Kontrolle ist die Einheit am Stichtag nicht aufsichtskonform handlungsfähig.' },
  { id: 'day100',  label: 'Day 100',  lang: 'Erste 100 Tage',       color: '#B45309', bg: '#FFFBEB', rang: 2, hinweis: 'Übergangsweise über eine Service-Vereinbarung tragbar, aber zeitnah eigenständig zu lösen.' },
  { id: 'zielbild',label: 'Zielbild', lang: 'Zielbild',             color: '#475569', bg: '#F1F5F9', rang: 1, hinweis: 'Strukturell wünschenswert, ohne Fristendruck zum Vollzug.' },
];
export const KRIT_MAP = Object.fromEntries(KRITIKALITAET.map(k => [k.id, k]));

/** Fristenstufen fuer ein Szenario — mit dessen Ueberschreibungen, falls vorhanden. */
export function getKritikalitaet(szenarioId) {
  const ueber = SZENARIO_MAP[szenarioId]?.fristen;
  return KRITIKALITAET.map(k => (ueber?.[k.id] ? { ...k, ...ueber[k.id] } : k));
}
export function getKritMap(szenarioId) {
  return Object.fromEntries(getKritikalitaet(szenarioId).map(k => [k.id, k]));
}

// ===== Bearbeitungsstatus (Kollaboration) ===================================
export const GAP_STATUS = [
  { id: 'offen',        label: 'Offen',        color: '#64748B', bg: '#F1F5F9', icon: 'Circle' },
  { id: 'in_klaerung',  label: 'In Klärung',   color: '#2563EB', bg: '#EFF6FF', icon: 'PencilLine' },
  { id: 'eingeplant',   label: 'Eingeplant',   color: '#059669', bg: '#ECFDF5', icon: 'CalendarCheck' },
  { id: 'nicht_relevant', label: 'Nicht relevant', color: '#DC2626', bg: '#FEF2F2', icon: 'XCircle' },
];
export const GAP_STATUS_MAP = Object.fromEntries(GAP_STATUS.map(s => [s.id, s]));

// =============================================================================
// Abdeckung je Prozessbereich
// soll      = Kontrollen, die die Zielstruktur fachlich verlangt
// vorhanden = Kontrollen, die die Zieleinheit heute eigenständig trägt
// =============================================================================
export const ABDECKUNG = {
  'carve-out': [
    { bereichId: 'kredit',        name: 'Kreditprozesse',                soll: 62, vorhanden: 58 },
    { bereichId: 'zahlungsverkehr', name: 'Zahlungsverkehr',             soll: 48, vorhanden: 29 },
    { bereichId: 'finanzprozesse', name: 'Finanzprozesse & Rechnungswesen', soll: 44, vorhanden: 37 },
    { bereichId: 'meldewesen',    name: 'Meldewesen & Regulatorik',      soll: 38, vorhanden: 11 },
    { bereichId: 'auslagerung',   name: 'Auslagerung & Drittparteien',   soll: 26, vorhanden: 7 },
    { bereichId: 'it-sicherheit', name: 'IT & Informationssicherheit',   soll: 52, vorhanden: 24 },
    { bereichId: 'personal',      name: 'Personal & Organisation',       soll: 21, vorhanden: 16 },
  ],
  fusion: [
    { bereichId: 'kredit',        name: 'Kreditprozesse',                soll: 71, vorhanden: 68 },
    { bereichId: 'zahlungsverkehr', name: 'Zahlungsverkehr',             soll: 54, vorhanden: 54 },
    { bereichId: 'finanzprozesse', name: 'Finanzprozesse & Rechnungswesen', soll: 58, vorhanden: 52 },
    { bereichId: 'meldewesen',    name: 'Meldewesen & Regulatorik',      soll: 46, vorhanden: 39 },
    { bereichId: 'auslagerung',   name: 'Auslagerung & Drittparteien',   soll: 29, vorhanden: 24 },
    { bereichId: 'it-sicherheit', name: 'IT & Informationssicherheit',   soll: 61, vorhanden: 55 },
    { bereichId: 'personal',      name: 'Personal & Organisation',       soll: 24, vorhanden: 22 },
  ],
  anlehnung: [
    { bereichId: 'kredit',          name: 'Kreditprozesse',                 soll: 44, vorhanden: 39 },
    { bereichId: 'zahlungsverkehr', name: 'Zahlungsverkehr',                soll: 21, vorhanden: 18 },
    { bereichId: 'finanzprozesse',  name: 'Finanzprozesse & Rechnungswesen', soll: 33, vorhanden: 31 },
    { bereichId: 'meldewesen',      name: 'Meldewesen & Regulatorik',       soll: 24, vorhanden: 14 },
    { bereichId: 'auslagerung',     name: 'Auslagerung & Drittparteien',    soll: 19, vorhanden: 9 },
    { bereichId: 'it-sicherheit',   name: 'IT & Informationssicherheit',    soll: 37, vorhanden: 21 },
    { bereichId: 'personal',        name: 'Personal & Organisation',        soll: 16, vorhanden: 15 },
  ],
};

// =============================================================================
// Befunde
// =============================================================================
const GAPS_CARVE_OUT = [
  {
    id: 'co-1',
    typ: 'konzernabhaengig',
    kritikalitaet: 'day1',
    bereich: 'Zahlungsverkehr',
    titel: 'Sanktions- und AML-Screening läuft über die Konzern-Compliance-Plattform',
    risiko: 'Unterlassene Sanktions-/Embargo-/AML-Prüfung',
    istZustand: 'Screening aller Zahlungen über das zentrale Konzernsystem, Trefferbearbeitung durch Konzern-Compliance. Die Zieleinheit hat weder Lizenz noch Listenversorgung.',
    zielZustand: 'Eigene Screening-Lösung mit eigener Listenversorgung und eigener Trefferbearbeitung — oder befristete Service-Vereinbarung mit dem Konzern bis zur Ablösung.',
    begruendung: 'Ohne Screening darf die Einheit am Stichtag keinen Zahlungsverkehr abwickeln. Es ist der einzige Befund, der einen Geschäftsbetrieb unmittelbar blockiert.',
    regulatorik: ['GwG § 25h KWG', 'EU-Sanktionsverordnungen'],
    aufwandPT: 85,
  },
  {
    id: 'co-2',
    typ: 'konzernabhaengig',
    kritikalitaet: 'day1',
    bereich: 'Zahlungsverkehr',
    titel: 'Zahlungsfreigabe und Limitsteuerung über Konzern-Treasury',
    risiko: 'Unautorisierte oder manipulierte Auszahlung',
    istZustand: 'Freigaben oberhalb der Bereichslimits laufen über das Konzern-Treasury; die Limitpflege erfolgt zentral im Konzernsystem.',
    zielZustand: 'Eigene Freigabestrecke mit eigenem Kompetenzregelwerk, eigener Limitpflege und dokumentiertem Vier-Augen-Prinzip in der Zieleinheit.',
    begruendung: 'Die Kompetenzordnung der Zieleinheit endet heute unterhalb der eigenen Geschäftsgrößen — oberhalb greift niemand mehr.',
    regulatorik: ['MaRisk AT 4.3.1', 'MaRisk BTO'],
    aufwandPT: 40,
  },
  {
    id: 'co-3',
    typ: 'luecke',
    kritikalitaet: 'day1',
    bereich: 'Meldewesen & Regulatorik',
    titel: 'Keine eigene Kontrollstrecke für das aufsichtliche Meldewesen',
    risiko: 'Fehlerhafte oder verspätete aufsichtliche Meldung',
    istZustand: 'Die Zieleinheit liefert heute nur Daten zu; Plausibilisierung, Freigabe und Einreichung verantwortet das Konzern-Meldewesen.',
    zielZustand: 'Eigenständige Meldestrecke inklusive Plausibilitätskontrollen, Freigabe durch die Geschäftsleitung und Fristenüberwachung für COREP, FINREP und AnaCredit.',
    begruendung: 'Mit eigener Institutseigenschaft wird die Zieleinheit selbst meldepflichtig — ab dem ersten Meldestichtag nach Vollzug.',
    regulatorik: ['CRR', 'AnaCredit', '§ 14 KWG'],
    aufwandPT: 120,
  },
  {
    id: 'co-4',
    typ: 'konzernabhaengig',
    kritikalitaet: 'day100',
    bereich: 'IT & Informationssicherheit',
    titel: 'Berechtigungsrezertifizierung über das Konzern-IAM',
    risiko: 'Unberechtigter Systemzugriff',
    istZustand: 'Rezertifizierungskampagnen werden zentral im Konzern-IAM ausgesteuert; die Zieleinheit bestätigt lediglich.',
    zielZustand: 'Eigener Rezertifizierungsprozess mit eigenem Rollenmodell, mindestens halbjährlich, mit dokumentierter Entzugskontrolle.',
    begruendung: 'Über eine Service-Vereinbarung übergangsweise tragbar, aber das Rollenmodell des Konzerns passt nicht auf die schlankere Zielorganisation.',
    regulatorik: ['BAIT', 'DORA Art. 9'],
    aufwandPT: 45,
  },
  {
    id: 'co-5',
    typ: 'regulatorisch_neu',
    kritikalitaet: 'day100',
    bereich: 'Auslagerung & Drittparteien',
    titel: 'Eigenes Informationsregister für IKT-Drittparteien erforderlich',
    risiko: 'Auslagerungs- und Drittparteienrisiko',
    istZustand: 'Die Zieleinheit ist heute Teil des Konzernregisters und führt kein eigenes Register.',
    zielZustand: 'Eigenes DORA-Informationsregister inklusive Wesentlichkeitsbeurteilung, Exit-Strategien und Meldung an die Aufsicht.',
    begruendung: 'Nach dem Vollzug wird die bisherige Konzern-IT selbst zum wesentlichen IKT-Drittdienstleister — die Einheit muss ihren größten Dienstleister erstmals selbst steuern.',
    regulatorik: ['DORA Art. 28', 'MaRisk AT 9'],
    aufwandPT: 55,
  },
  {
    id: 'co-6',
    typ: 'luecke',
    kritikalitaet: 'day100',
    bereich: 'IT & Informationssicherheit',
    titel: 'Kein eigener Nachweis für Notfall- und Wiederanlauftests',
    risiko: 'Ausfall geschäftskritischer Systeme',
    istZustand: 'Wiederanlauftests finden im Konzernrechenzentrum statt; die Zieleinheit hat weder eigene Testfälle noch eigene Nachweise.',
    zielZustand: 'Eigener Notfallplan je kritischer Funktion mit jährlichem Wiederanlauftest und dokumentiertem Testnachweis.',
    begruendung: 'Der Nachweis ist an die kritischen Funktionen der Einheit gebunden — er lässt sich nicht aus dem Konzerntest ableiten.',
    regulatorik: ['DORA Art. 11', 'MaRisk AT 7.3'],
    aufwandPT: 35,
  },
  {
    id: 'co-7',
    typ: 'abweichend',
    kritikalitaet: 'day100',
    bereich: 'Kreditprozesse',
    titel: 'Vier-Augen-Freigabe ohne systemische Limitprüfung',
    risiko: 'Auszahlung trotz nicht erfüllter Voraussetzungen',
    istZustand: 'Die Zieleinheit hat eine eigene Vier-Augen-Freigabe, die Kompetenzprüfung erfolgt jedoch manuell gegen eine Tabelle statt systemisch.',
    zielZustand: 'Systemseitige Kompetenz- und Limitprüfung mit harter Auszahlsperre bei Überschreitung — analog dem Konzernstandard.',
    begruendung: 'Die Kontrolle existiert, ihr Design bleibt aber hinter dem Standard zurück, den die Innenrevision beim Konzern zugrunde legt.',
    regulatorik: ['MaRisk BTO 1.2'],
    aufwandPT: 25,
  },
  {
    id: 'co-8',
    typ: 'regulatorisch_neu',
    kritikalitaet: 'zielbild',
    bereich: 'Personal & Organisation',
    titel: 'Eigene Risikoberichterstattung an Aufsichtsrat und Risikoausschuss',
    risiko: 'Unzureichende Governance',
    istZustand: 'Die Risikoberichterstattung erfolgt aggregiert auf Konzernebene; die Einheit liefert Zahlen zu, ohne eigenes Berichtsformat.',
    zielZustand: 'Eigener Risikobericht mit eigenem Turnus, eigenen Schwellenwerten und dokumentierter Befassung des Aufsichtsorgans.',
    begruendung: 'Mit eigenem Aufsichtsorgan entsteht eine eigene Berichtspflicht — fachlich anspruchsvoll, aber ohne Fristendruck zum Vollzug.',
    regulatorik: ['MaRisk AT 4.3.2', 'MaRisk BT 3'],
    aufwandPT: 30,
  },
  {
    id: 'co-9',
    typ: 'deckungsgleich',
    kritikalitaet: 'zielbild',
    bereich: 'Kreditprozesse',
    titel: 'Kreditvergabekontrollen tragen eigenständig',
    risiko: 'Kreditrisiko / Prozessrisiko',
    istZustand: 'Antragsprüfung, Bonitätsanalyse nach § 18 KWG, Sicherheitenbewertung und Kreditüberwachung laufen vollständig in der Zieleinheit.',
    zielZustand: 'Unverändert übernehmen.',
    begruendung: 'Das Kreditgeschäft war schon bisher operativ eigenständig — hier entsteht durch den Carve-out kein Handlungsbedarf.',
    regulatorik: ['MaRisk BTO 1', '§ 18 KWG'],
    aufwandPT: 0,
  },
];

const GAPS_FUSION = [
  {
    id: 'fu-1',
    typ: 'abweichend',
    kritikalitaet: 'day1',
    bereich: 'Zahlungsverkehr',
    titel: 'Freigabeschwellen laufen um Faktor fünf auseinander',
    risiko: 'Unautorisierte oder manipulierte Auszahlung',
    istZustand: 'Institut A verlangt die Vier-Augen-Freigabe ab 50 TEUR, Institut B erst ab 250 TEUR. Beide Kontrollen sind für sich wirksam dokumentiert.',
    zielZustand: 'Einheitliche Freigabeschwelle für das fusionierte Institut, hergeleitet aus der neuen Bilanzsumme und Risikotragfähigkeit — mit Übergangsregel für Altbestände.',
    begruendung: 'Ab dem Vollzugstag gilt eine gemeinsame Kompetenzordnung. Ohne Entscheidung entsteht am Stichtag ein ungeregelter Zustand im Zahlungsverkehr beider Häuser.',
    regulatorik: ['MaRisk AT 4.3.1'],
    aufwandPT: 20,
  },
  {
    id: 'fu-2',
    typ: 'regulatorisch_neu',
    kritikalitaet: 'day1',
    bereich: 'Meldewesen & Regulatorik',
    titel: 'Neue Meldeschwellen durch die gemeinsame Bilanzsumme',
    risiko: 'Fehlerhafte oder verspätete aufsichtliche Meldung',
    istZustand: 'Beide Institute melden heute in der Kategorie kleiner, nicht komplexer Institute mit reduziertem Meldeumfang.',
    zielZustand: 'Erweiterter Melde- und Offenlegungsumfang mit zusätzlichen Kontrollen für die neu hinzukommenden Meldestrecken.',
    begruendung: 'Die addierte Bilanzsumme überschreitet die Schwelle zum SNCI-Status. Der erweiterte Umfang greift ab dem ersten Meldestichtag nach Vollzug.',
    regulatorik: ['CRR Art. 4 (145)', 'CRR Offenlegung'],
    aufwandPT: 65,
  },
  {
    id: 'fu-3',
    typ: 'doppelt',
    kritikalitaet: 'day100',
    bereich: 'Zahlungsverkehr',
    titel: 'Zwei getrennte Sanktionsscreening-Strecken',
    risiko: 'Unterlassene Sanktions-/Embargo-/AML-Prüfung',
    istZustand: 'Beide Häuser betreiben ein eigenes Screening auf unterschiedlichen Systemen, mit unterschiedlicher Listenversorgung und getrennter Trefferbearbeitung.',
    zielZustand: 'Eine führende Screening-Plattform für das fusionierte Institut; das zweite System wird nach Migration abgeschaltet.',
    begruendung: 'Fachlich decken beide dasselbe Risiko vollständig ab. Der Parallelbetrieb kostet doppelt und erzeugt zwei getrennte Nachweisstrecken für dieselbe Pflicht.',
    regulatorik: ['GwG § 25h KWG'],
    aufwandPT: 70,
  },
  {
    id: 'fu-4',
    typ: 'abweichend',
    kritikalitaet: 'day100',
    bereich: 'Kreditprozesse',
    titel: 'Zweitvotum ab unterschiedlicher Kredithöhe',
    risiko: 'Kreditrisiko / fehlerhafte Kreditentscheidung',
    istZustand: 'Institut A verlangt ein Marktfolge-Zweitvotum ab 1,0 Mio. EUR, Institut B ab 2,5 Mio. EUR.',
    zielZustand: 'Einheitliche Votierungsgrenze mit einheitlicher Definition des Kreditnehmerverbunds.',
    begruendung: 'Beide Grenzen sind für sich hergeleitet, aber nicht vergleichbar — sie beziehen sich auf unterschiedlich abgegrenzte Verbünde.',
    regulatorik: ['MaRisk BTO 1.1', '§ 18 KWG'],
    aufwandPT: 25,
  },
  {
    id: 'fu-5',
    typ: 'doppelt',
    kritikalitaet: 'day100',
    bereich: 'Finanzprozesse & Rechnungswesen',
    titel: 'Doppelte Abschlusskontrollen auf derselben Datenbasis',
    risiko: 'Fehlerhafte Rechnungslegung',
    istZustand: 'Nach der Migration auf ein gemeinsames Hauptbuch laufen die Abstimm- und Abgrenzungskontrollen beider Häuser zunächst parallel weiter.',
    zielZustand: 'Ein Kontrollsatz je Abschlussschritt, ausgerichtet am gemeinsamen Hauptbuch.',
    begruendung: 'Die Doppelung entsteht durch die Migration und löst sich nicht von selbst auf — ohne Entscheidung bleiben beide Sätze im Inventar stehen.',
    regulatorik: ['HGB', 'MaRisk AT 4.3'],
    aufwandPT: 30,
  },
  {
    id: 'fu-6',
    typ: 'luecke',
    kritikalitaet: 'day100',
    bereich: 'IT & Informationssicherheit',
    titel: 'Keine dokumentierte Freigabekontrolle für IT-Changes bei Institut B',
    risiko: 'Fehlerhafte Systemänderung im Produktivbetrieb',
    istZustand: 'Institut B führt Changes über ein Ticketsystem, ohne dokumentierte Freigabekontrolle und ohne Trennung von Entwicklung und Freigabe.',
    zielZustand: 'Übernahme des Change-Advisory-Board-Prozesses von Institut A für den gesamten fusionierten IT-Betrieb.',
    begruendung: 'Eine echte Lücke, die die Gegenseite bereits geschlossen hat — die Fusion löst sie durch Übernahme statt durch Neubau.',
    regulatorik: ['BAIT', 'DORA Art. 8'],
    aufwandPT: 20,
  },
  {
    id: 'fu-7',
    typ: 'abweichend',
    kritikalitaet: 'zielbild',
    bereich: 'Auslagerung & Drittparteien',
    titel: 'Wesentlichkeitsbeurteilung nach unterschiedlichen Kriterien',
    risiko: 'Auslagerungs- und Drittparteienrisiko',
    istZustand: 'Institut A beurteilt anhand eines Punktemodells, Institut B anhand fester Schwellenwerte. Derselbe Dienstleister wird dadurch unterschiedlich eingestuft.',
    zielZustand: 'Ein gemeinsames Beurteilungsmodell mit Neubewertung des gesamten Dienstleisterbestands.',
    begruendung: 'Solange beide Modelle nebeneinander stehen, ist das gemeinsame Auslagerungsregister in sich widersprüchlich.',
    regulatorik: ['DORA Art. 28', 'MaRisk AT 9'],
    aufwandPT: 35,
  },
  {
    id: 'fu-8',
    typ: 'deckungsgleich',
    kritikalitaet: 'zielbild',
    bereich: 'Zahlungsverkehr',
    titel: 'Abstimm- und Dublettenkontrollen inhaltlich deckungsgleich',
    risiko: 'System-/Schnittstellenfehler (Doppel-/Fehlzahlung)',
    istZustand: 'Beide Häuser stimmen täglich Zahlungsdateien und Schnittstellen ab, mit gleichem Prüfumfang und gleicher Eskalation.',
    zielZustand: 'Kontrolle von Institut A übernehmen, Beschreibung unverändert.',
    begruendung: 'Wortlaut und Wirkung stimmen weitgehend überein — hier ist die Zusammenführung reine Formsache.',
    regulatorik: ['MaRisk AT 8.2'],
    aufwandPT: 0,
  },
];

const GAPS_ANLEHNUNG = [
  {
    id: 'an-1',
    typ: 'luecke',
    kritikalitaet: 'day1',
    bereich: 'IT & Informationssicherheit',
    titel: 'Keine Berechtigungsrezertifizierung nach Konzernstandard',
    risiko: 'Unberechtigter Systemzugriff',
    istZustand: 'Die Tochter prüft Berechtigungen anlassbezogen bei Austritten. Der Konzernstandard verlangt eine halbjährliche Vollrezertifizierung mit dokumentiertem Entzugsnachweis.',
    zielZustand: 'Übernahme des Konzernprozesses inklusive Kampagnensteuerung und Entzugskontrolle — die Tochter wird an das Konzern-IAM angebunden.',
    begruendung: 'Die grösste Einzelabweichung zum Standard und zugleich eine offene Feststellung der Konzernrevision aus dem Vorjahr.',
    regulatorik: ['BAIT', 'DORA Art. 9'],
    aufwandPT: 40,
  },
  {
    id: 'an-2',
    typ: 'luecke',
    kritikalitaet: 'day1',
    bereich: 'Meldewesen & Regulatorik',
    titel: 'Zulieferung an das Konzernmeldewesen ohne eigene Plausibilisierung',
    risiko: 'Fehlerhafte Datenzulieferung an den Konzern',
    istZustand: 'Die Tochter liefert Rohdaten ohne dokumentierte Vollständigkeits- und Plausibilitätskontrolle; Fehler fallen erst im Konzern auf.',
    zielZustand: 'Vorgelagerte Plausibilisierung nach Konzernvorgabe mit Vier-Augen-Freigabe vor der Zulieferung.',
    begruendung: 'Der Konzern haftet für die Meldung, kann die Datenqualität der Tochter aber nicht rückwirkend herstellen. Der Standard verlangt die Kontrolle an der Quelle.',
    regulatorik: ['CRR', 'AnaCredit', 'MaRisk BT 3'],
    aufwandPT: 30,
  },
  {
    id: 'an-3',
    typ: 'luecke',
    kritikalitaet: 'day100',
    bereich: 'Auslagerung & Drittparteien',
    titel: 'Auslagerungsregister nicht am Konzernmodell ausgerichtet',
    risiko: 'Auslagerungs- und Drittparteienrisiko',
    istZustand: 'Die Tochter führt ein eigenes Register mit abweichenden Feldern; eine Konsolidierung auf Konzernebene ist nur manuell möglich.',
    zielZustand: 'Übernahme des Konzern-Datenmodells inklusive Wesentlichkeitsbeurteilung und Exit-Strategien.',
    begruendung: 'Ohne einheitliches Modell bleibt das Konzernregister unvollständig — DORA verlangt die Sicht über alle Gesellschaften.',
    regulatorik: ['DORA Art. 28', 'MaRisk AT 9'],
    aufwandPT: 35,
  },
  {
    id: 'an-4',
    typ: 'abweichend',
    kritikalitaet: 'day100',
    bereich: 'Kreditprozesse',
    titel: 'Votierungsgrenze deutlich über dem Konzernstandard',
    risiko: 'Fehlerhafte Kreditentscheidung',
    istZustand: 'Die Tochter verlangt ein Zweitvotum ab 2,0 Mio. EUR, der Konzernstandard ab 750 TEUR — bezogen auf eine deutlich kleinere Bilanzsumme.',
    zielZustand: 'Angleichung an den Konzernstandard oder dokumentierte Abweichungsentscheidung des Konzernrisikomanagements.',
    begruendung: 'Eine Abweichung dieser Grössenordnung ist begründungspflichtig. Fachlich vertretbar wäre eine an die Bilanzsumme skalierte Grenze — das muss aber entschieden und dokumentiert sein.',
    regulatorik: ['MaRisk BTO 1.1'],
    aufwandPT: 10,
  },
  {
    id: 'an-5',
    typ: 'abweichend',
    kritikalitaet: 'day100',
    bereich: 'Finanzprozesse & Rechnungswesen',
    titel: 'Abschlusskontrollen ohne die im Konzern übliche Wesentlichkeitsgrenze',
    risiko: 'Fehlerhafte Rechnungslegung',
    istZustand: 'Die Tochter prüft alle Abgrenzungsposten unabhängig von der Höhe; der Konzern arbeitet mit einer definierten Wesentlichkeitsgrenze.',
    zielZustand: 'Wesentlichkeitsgrenze des Konzerns übernehmen und die Kontrolle darauf ausrichten.',
    begruendung: 'Hier bringt die Anlehnung Entlastung statt Mehraufwand — die Tochter kontrolliert enger als nötig.',
    regulatorik: ['HGB', 'MaRisk AT 4.3'],
    aufwandPT: 8,
  },
  {
    id: 'an-6',
    typ: 'ueber_standard',
    kritikalitaet: 'zielbild',
    bereich: 'Zahlungsverkehr',
    titel: 'Tägliche Vollabstimmung über den Konzernstandard hinaus',
    risiko: 'System-/Schnittstellenfehler (Doppel-/Fehlzahlung)',
    istZustand: 'Die Tochter stimmt täglich sämtliche Zahlungsausgänge vollständig ab. Der Konzernstandard sieht eine risikoorientierte Stichprobe vor.',
    zielZustand: 'Wechsel auf die risikoorientierte Stichprobe des Konzerns, Vollabstimmung nur bei Auffälligkeiten.',
    begruendung: 'Die Kontrolle ist wirksam, aber überdimensioniert. Bei angeglichenem Design entfällt Aufwand ohne zusätzliches Risiko.',
    regulatorik: ['MaRisk AT 8.2'],
    aufwandPT: 12,
  },
  {
    id: 'an-7',
    typ: 'regulatorisch_neu',
    kritikalitaet: 'zielbild',
    bereich: 'Personal & Organisation',
    titel: 'Konzernvorgaben zur Vergütungsgovernance greifen künftig auch für die Tochter',
    risiko: 'Unzureichende Governance',
    istZustand: 'Die Tochter fällt heute unter die Ausnahme für kleine Institute und führt keine eigene Vergütungskontrolle.',
    zielZustand: 'Übernahme der Konzernkontrollen zur Identifizierung von Risikoträgern und zur Vergütungsobergrenze.',
    begruendung: 'Bei konsolidierter Betrachtung greifen die Vorgaben gruppenweit — die Ausnahme trägt nur solange die Tochter isoliert betrachtet wird.',
    regulatorik: ['InstitutsVergV', 'MaRisk AT 7'],
    aufwandPT: 18,
  },
  {
    id: 'an-8',
    typ: 'deckungsgleich',
    kritikalitaet: 'zielbild',
    bereich: 'Kreditprozesse',
    titel: 'Sicherheitenbewertung entspricht dem Konzernstandard',
    risiko: 'Kreditrisiko',
    istZustand: 'Bewertungsverfahren, Haircuts und Überwachungsturnus sind bereits deckungsgleich mit dem Konzernmodell.',
    zielZustand: 'Unverändert beibehalten.',
    begruendung: 'Die Tochter hat dieses Verfahren bereits vor zwei Jahren angeglichen — kein Handlungsbedarf.',
    regulatorik: ['MaRisk BTO 1.2', 'CRR'],
    aufwandPT: 0,
  },
];

export const GAPS_ROH = { 'carve-out': GAPS_CARVE_OUT, fusion: GAPS_FUSION, anlehnung: GAPS_ANLEHNUNG };

// ===== Seed-Kollaboration (Demo) ============================================
const SEED_COLLAB = {
  'co-1': { status: 'eingeplant', assignedTo: 'jw', comments: [
    { autorId: 'jw', at: -70, text: 'Wir verhandeln parallel eine befristete Service-Vereinbarung mit dem Konzern über zwölf Monate. Die eigene Lösung wird dadurch nicht überflüssig, aber der Stichtag ist gehalten.' },
    { autorId: 'sm', at: -52, text: 'Bitte die Übergangslösung als eigene Kontrolle im Zielinventar führen, sonst fehlt für die Zwischenzeit der Nachweis.' },
  ] },
  'co-3': { status: 'in_klaerung', assignedTo: 'sm', comments: [
    { autorId: 'sm', at: -38, text: 'Der Aufwand von 120 PT scheint mir eher untere Grenze — die Plausibilisierung für AnaCredit unterschätzen wir erfahrungsgemäß.' },
  ] },
  'co-5': { status: 'in_klaerung', assignedTo: 'tk', comments: [
    { autorId: 'tk', at: -25, text: 'Der Konzern wird nach Vollzug unser größter IKT-Dienstleister. Das Register muss den Konzern selbst als Drittpartei führen.' },
  ] },
  'co-9': { status: 'eingeplant', assignedTo: null, comments: [] },
  'fu-1': { status: 'in_klaerung', assignedTo: 'tk', comments: [
    { autorId: 'tk', at: -44, text: 'Vorschlag: 100 TEUR als gemeinsame Schwelle. Liegt zwischen beiden Häusern und passt zur neuen Bilanzsumme.' },
  ] },
  'fu-3': { status: 'eingeplant', assignedTo: 'jw', comments: [
    { autorId: 'jw', at: -31, text: 'Die Plattform von Institut A bleibt führend, sie deckt mehr Listen ab. Migration nach dem ersten Quartalsabschluss.' },
  ] },
  'fu-6': { status: 'offen', assignedTo: null, comments: [] },
  'an-1': { status: 'eingeplant', assignedTo: 'tk', comments: [
    { autorId: 'tk', at: -60, text: 'Anbindung an das Konzern-IAM ist beauftragt. Die erste Rezertifizierungskampagne läuft im kommenden Quartal.' },
  ] },
  'an-5': { status: 'in_klaerung', assignedTo: 'sm', comments: [
    { autorId: 'sm', at: -35, text: 'Hier bitte sauber dokumentieren, dass die Lockerung eine bewusste Angleichung ist und keine Absenkung des Kontrollniveaus.' },
  ] },
  'an-6': { status: 'offen', assignedTo: null, comments: [] },
};

// =============================================================================
// Verarbeitungsschritte (Animation)
// =============================================================================
export const GAP_STEPS = [
  { id: 'einlesen',   titel: 'Beide Kontrollinventare einlesen', detail: 'Kontrollen, Risiken und Verantwortlichkeiten beider Einheiten werden strukturiert erfasst und normalisiert.' },
  { id: 'matching',   titel: 'Kontrollen semantisch zuordnen',   detail: 'Abgleich der Kontrollziele über Formulierungsunterschiede hinweg — gleiche Wirkung zählt, nicht gleicher Wortlaut.' },
  { id: 'luecken',    titel: 'Lücken und Abhängigkeiten erkennen', detail: 'Welche Kontrolle wird zentral erbracht, welche fehlt der Zieleinheit vollständig, wo weicht das Design ab?' },
  { id: 'regulatorik',titel: 'Neue regulatorische Pflichten prüfen', detail: 'Anforderungen, die durch die neue Struktur erstmals auf dieser Ebene greifen.' },
  { id: 'fahrplan',   titel: 'Nach Day 1 / Day 100 priorisieren', detail: 'Zeitliche Kritikalität je Befund und Aufwandsschätzung für die Schließung.' },
];

// =============================================================================
// Aufbau des Gap-Analyse-Objekts
// =============================================================================
export function buildGapAnalyse(input = {}, opts = {}) {
  const nowTs = opts.nowTs || Date.now();
  const seed = opts.seedKollaboration !== false;
  const szenarioId = input.szenario || 'carve-out';
  const szenario = SZENARIO_MAP[szenarioId];

  const gaps = (GAPS_ROH[szenarioId] || []).map(g => {
    const collab = seed ? SEED_COLLAB[g.id] : null;
    return {
      ...g,
      status: collab?.status || 'offen',
      assignedTo: collab?.assignedTo ?? null,
      comments: (collab?.comments || []).map((c, i) => ({
        id: `gc-${g.id}-${i}`,
        autorId: c.autorId,
        text: c.text,
        at: nowTs + c.at * 60 * 1000,
      })),
    };
  });

  const abdeckung = (ABDECKUNG[szenarioId] || []).map(a => ({
    ...a,
    fehlend: a.soll - a.vorhanden,
    grad: a.soll ? Math.round((a.vorhanden / a.soll) * 100) : 100,
  })).sort((a, b) => a.grad - b.grad);

  const sollGesamt = abdeckung.reduce((s, a) => s + a.soll, 0);
  const vorhandenGesamt = abdeckung.reduce((s, a) => s + a.vorhanden, 0);

  const handlungsbedarf = gaps.filter(g => g.typ !== 'deckungsgleich');
  const day1 = handlungsbedarf.filter(g => g.kritikalitaet === 'day1');

  return {
    id: `gap-${nowTs}`,
    szenario: szenarioId,
    szenarioLabel: szenario.label,
    zielName: input.zielName || szenario.zielName,
    quelldokumentA: input.quelldokumentA || szenario.beispielA,
    quelldokumentB: input.quelldokumentB || szenario.beispielB,
    stichtag: input.stichtag || '',
    weitereInfos: input.weitereInfos || '',
    createdAt: new Date(nowTs).toISOString(),
    ergebnisIntro: szenarioId === 'anlehnung'
      ? 'Die Tochter trägt ihr Kerngeschäft nach eigenem, funktionierendem Standard — die Abweichungen liegen in den konzernnahen Themen: Berechtigungssteuerung, Meldewesen-Zulieferung und Auslagerungsregister. Zwei Befunde gehen in die andere Richtung: dort kontrolliert die Tochter enger als der Konzern verlangt, was sich bei der Angleichung als Entlastung auflöst.'
      : szenarioId === 'carve-out'
      ? 'Die Zieleinheit trägt ihr Kernbankgeschäft bereits eigenständig — die Lücken liegen dort, wo der Konzern bisher unsichtbar mitgetragen hat: Screening, Meldewesen und IT-Steuerung. Drei Befunde blockieren den Vollzugsstichtag unmittelbar, der Rest ist über Service-Vereinbarungen überbrückbar.'
      : 'Beide Inventare sind für sich tragfähig; die Arbeit liegt nicht im Schließen von Lücken, sondern im Auflösen von Widersprüchen. Wo Schwellenwerte auseinanderlaufen, braucht es eine Entscheidung — und die neue Bilanzsumme bringt Meldepflichten mit, die keines der beiden Häuser bisher hatte.',
    gaps,
    abdeckung,
    kennzahlen: {
      befunde: gaps.length,
      handlungsbedarf: handlungsbedarf.length,
      day1: day1.length,
      day100: handlungsbedarf.filter(g => g.kritikalitaet === 'day100').length,
      zielbild: handlungsbedarf.filter(g => g.kritikalitaet === 'zielbild').length,
      aufwandPT: gaps.reduce((s, g) => s + (g.aufwandPT || 0), 0),
      aufwandDay1PT: day1.reduce((s, g) => s + (g.aufwandPT || 0), 0),
      sollGesamt,
      vorhandenGesamt,
      abdeckungHeute: sollGesamt ? Math.round((vorhandenGesamt / sollGesamt) * 100) : 100,
    },
  };
}
