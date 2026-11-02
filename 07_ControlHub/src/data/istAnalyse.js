// =============================================================================
// Analyzer — Analyse des bestehenden IKS
//
// Bevor optimiert wird, muss der Bestand quantitativ sichtbar sein: Wo im Haus
// liegen wie viele Kontrollen, wie manuell sind sie, wie viele Risiken decken
// sie ab — und was kostet ihre Wirksamkeitsprüfung in Personentagen (PT).
//
// Das Inventar wird je Prozessbereich in Buckets (Ausführungsart × Turnus)
// geführt. Das ist bewusst aggregiert: ein Bestandsinventar dieser Größe wird
// in der Praxis ebenfalls über Merkmale ausgewertet, nicht Kontrolle für
// Kontrolle. Der Auszahlungsprozess aus den anderen beiden Modulen ist Teil des
// Bereichs "Zahlungsverkehr" — die Module bleiben damit fachlich konsistent.
//
// Alle Inhalte sind frei erfunden (synthetische Demo-Daten).
// =============================================================================

import { AUSFUEHRUNG_MAP, KONTROLL_TURNUS_LABEL } from './optimierungAgent';

export { AUSFUEHRUNG_MAP, KONTROLL_TURNUS_LABEL };

// ===== Ordinale Farbrampe für den Automatisierungsgrad =======================
// Eine Hue (Marken-Grün), monoton hell → dunkel: manuell (hell, viel Potenzial)
// bis automatisiert (dunkel, Zielzustand). Gegen weiße Kartenfläche validiert:
// helles Ende 2,21:1, alle Stufenabstände ausreichend, Hue-Spread 4°.
export const ART_RAMPE = {
  manuell: '#6FBF8C',
  systemgestuetzt: '#40A167',
  teilautomatisiert: '#1D7B3F',
  automatisiert: '#0F4D2A',
};

// Reihenfolge der Ausführungsarten — von manuell nach automatisiert.
export const ART_ORDER = ['manuell', 'systemgestuetzt', 'teilautomatisiert', 'automatisiert'];

// =============================================================================
// Annahmen des Prüfaufwandsmodells
//
// "Prüfaufwand" meint den Aufwand für den Wirksamkeitsnachweis einer Kontrolle
// (Kontrolltest, Designbeurteilung, Nachweisdokumentation) — nicht die
// operative Durchführung der Kontrolle im Tagesgeschäft.
//
// Aufwand je Kontrolle
//   = (Stichprobenumfang × Minuten je Stichprobe) / 60          [Testdurchführung]
//   + Grundaufwand je Kontrolle                                  [Design & Doku]
// Schlüsselkontrollen erhalten zusätzlich den Zuschlag für die unabhängige
// Zweitprüfung durch die 2nd Line.
// =============================================================================

export const ANNAHMEN_DEFAULT = {
  stundenProPT: 8,

  // --- Kontrolldurchfuehrung (1st Line, laufender Betrieb) ---------------
  // Ausfuehrungen p. a. ergeben sich aus dem Turnus, der Zeitbedarf je
  // Ausfuehrung aus Turnus (Umfang der Kontrolle) mal Ausfuehrungsart
  // (Automatisierung senkt den Zeitbedarf, ersetzt die Kontrolle aber nicht).
  ausfuehrungenProJahr: {
    'je-vorgang': 250,
    'taeglich': 250,
    'woechentlich': 52,
    'monatlich': 12,
    'quartalsweise': 4,
    'jaehrlich': 1,
    'anlassbezogen': 24,
  },
  minutenJeAusfuehrung: {
    'je-vorgang': 8,
    'taeglich': 20,
    'woechentlich': 45,
    'monatlich': 90,
    'quartalsweise': 150,
    'jaehrlich': 240,
    'anlassbezogen': 60,
  },
  artFaktor: {
    manuell: 1,
    systemgestuetzt: 0.6,
    teilautomatisiert: 0.3,
    automatisiert: 0.1,
  },

  // --- Kontrolltesting (Wirksamkeitsnachweis) ---------------------------
  grundaufwandStd: 2.5,
  schluesselZuschlagProzent: 60,
  stichprobe: {
    'je-vorgang': 25,
    'taeglich': 25,
    'woechentlich': 15,
    'monatlich': 8,
    'quartalsweise': 4,
    'jaehrlich': 1,
    'anlassbezogen': 5,
  },
  minutenJeStichprobe: {
    manuell: 35,
    systemgestuetzt: 25,
    teilautomatisiert: 15,
    automatisiert: 10,
  },
};

// Metadaten fuer die editierbare Herleitung (Grenzen, Schrittweite, Einheit).
export const ANNAHMEN_DEFS = {
  stundenProPT: {
    label: 'Stunden je Personentag',
    hilfe: 'Produktive Arbeitsstunden, mit denen Stunden in PT umgerechnet werden. Gilt für beide Aufwandsarten.',
    einheit: ' Std.', min: 5, max: 10, step: 0.5,
  },
  ausfuehrungenProJahr: {
    label: 'Ausführungen je Jahr',
    hilfe: 'Wie oft eine Kontrolle dieses Turnus im Jahr durchgeführt wird. Bei vorgangsbezogenen Kontrollen die Anzahl der Vorgänge — der grösste Hebel im Modell.',
    einheit: '', min: 0, max: 400, step: 5,
  },
  minutenJeAusfuehrung: {
    label: 'Minuten je Ausführung',
    hilfe: 'Zeitbedarf einer Durchführung, abhängig vom Umfang der Kontrolle. Eine Monatsabstimmung dauert länger als eine Einzelfallprüfung.',
    einheit: ' Min.', min: 0, max: 480, step: 5,
  },
  artFaktor: {
    label: 'Faktor Ausführungsart',
    hilfe: 'Wie stark die Automatisierung den Zeitbedarf senkt. 1,0 = voller manueller Aufwand, 0,1 = nur noch Ausnahmebearbeitung.',
    einheit: '', min: 0, max: 1, step: 0.05,
  },
  grundaufwandStd: {
    label: 'Grundaufwand je Kontrolle',
    hilfe: 'Designbeurteilung, Aufbereitung der Nachweise und Dokumentation des Testergebnisses — fällt unabhängig vom Stichprobenumfang an.',
    einheit: ' Std.', min: 0, max: 8, step: 0.5,
  },
  schluesselZuschlagProzent: {
    label: 'Zuschlag Schlüsselkontrollen',
    hilfe: 'Zusätzlicher Aufwand für die unabhängige Wirksamkeitsprüfung durch die 2nd Line — nur auf Schlüsselkontrollen.',
    einheit: ' %', min: 0, max: 150, step: 5,
  },
  stichprobe: {
    label: 'Stichprobenumfang je Turnus',
    hilfe: 'Anzahl geprüfter Vorgänge je Kontrolle und Jahr. Häufig ausgeführte Kontrollen brauchen größere Stichproben.',
    einheit: '', min: 0, max: 60, step: 1,
  },
  minutenJeStichprobe: {
    label: 'Minuten je Stichprobe',
    hilfe: 'Prüfzeit je Einzelfall. Manuelle Kontrollen erfordern Belegprüfung, automatisierte im Wesentlichen einen Konfigurations- und Lognachweis.',
    einheit: ' Min.', min: 0, max: 90, step: 1,
  },
};

// =============================================================================
// Bestandsinventar je Prozessbereich
// buckets: { art, turnus, anzahl, schluessel } — schluessel ⊆ anzahl
// =============================================================================

export const PROZESSBEREICHE = [
  {
    id: 'kredit',
    name: 'Kreditprozesse',
    kurz: 'Kredit',
    icon: 'Banknote',
    beschreibung: 'Kreditvergabe Firmen- und Privatkunden, Sicherheitenmanagement, Kreditüberwachung und Intensivbetreuung.',
    regulatorik: ['MaRisk BTO 1', '§ 18 KWG', 'CRR'],
    prozesse: 9,
    risiken: 41,
    prozesseMitSchluesselkontrolle: 9,
    risikenMitKontrolle: 41,
    risikenMitSchluesselkontrolle: 38,
    buckets: [
      { art: 'manuell',           turnus: 'je-vorgang',    anzahl: 46, schluessel: 22 },
      { art: 'systemgestuetzt',   turnus: 'je-vorgang',    anzahl: 38, schluessel: 19 },
      { art: 'teilautomatisiert', turnus: 'je-vorgang',    anzahl: 24, schluessel: 11 },
      { art: 'automatisiert',     turnus: 'je-vorgang',    anzahl: 18, schluessel: 8 },
      { art: 'manuell',           turnus: 'monatlich',     anzahl: 27, schluessel: 9 },
      { art: 'manuell',           turnus: 'quartalsweise', anzahl: 15, schluessel: 5 },
    ],
    befund: 'Höchste Kontrolldichte im Haus und der größte Aufwandsblock. Die vorgangsbezogenen Doppelprüfungen in der Marktfolge sind der wesentliche Treiber.',
  },
  {
    id: 'zahlungsverkehr',
    name: 'Zahlungsverkehr',
    kurz: 'Zahlungsverkehr',
    icon: 'ArrowLeftRight',
    beschreibung: 'SEPA- und SWIFT-Zahlungen, Auszahlungsprozess, Clearing, Settlement und Reconciliation.',
    regulatorik: ['MaRisk AT 8.2', 'PSD2', 'GwG', 'CSCF'],
    prozesse: 6,
    risiken: 28,
    prozesseMitSchluesselkontrolle: 6,
    risikenMitKontrolle: 28,
    risikenMitSchluesselkontrolle: 26,
    buckets: [
      { art: 'manuell',           turnus: 'je-vorgang', anzahl: 21, schluessel: 11 },
      { art: 'systemgestuetzt',   turnus: 'je-vorgang', anzahl: 18, schluessel: 10 },
      { art: 'teilautomatisiert', turnus: 'je-vorgang', anzahl: 16, schluessel: 8 },
      { art: 'automatisiert',     turnus: 'je-vorgang', anzahl: 22, schluessel: 12 },
      { art: 'manuell',           turnus: 'taeglich',   anzahl: 19, schluessel: 7 },
      { art: 'teilautomatisiert', turnus: 'taeglich',   anzahl: 9,  schluessel: 4 },
      { art: 'manuell',           turnus: 'monatlich',  anzahl: 7,  schluessel: 2 },
    ],
    befund: 'Bereits am weitesten automatisiert. Der Auszahlungsprozess enthält dennoch mehrere inhaltlich deckungsgleiche Kontrollen — hier setzt der Optimizer an.',
  },
  {
    id: 'finanzprozesse',
    name: 'Finanzprozesse & Rechnungswesen',
    kurz: 'Finanzprozesse',
    icon: 'Calculator',
    beschreibung: 'Monats- und Jahresabschluss, Hauptbuch, Abgrenzungen, Bewertung, Steuern und Konzernkonsolidierung.',
    regulatorik: ['HGB', 'IFRS', 'AO', 'MaRisk AT 4.3'],
    prozesse: 8,
    risiken: 26,
    prozesseMitSchluesselkontrolle: 7,
    risikenMitKontrolle: 25,
    risikenMitSchluesselkontrolle: 21,
    buckets: [
      { art: 'manuell',           turnus: 'monatlich',     anzahl: 48, schluessel: 21 },
      { art: 'systemgestuetzt',   turnus: 'monatlich',     anzahl: 26, schluessel: 12 },
      { art: 'manuell',           turnus: 'quartalsweise', anzahl: 22, schluessel: 9 },
      { art: 'manuell',           turnus: 'jaehrlich',     anzahl: 14, schluessel: 6 },
      { art: 'teilautomatisiert', turnus: 'monatlich',     anzahl: 15, schluessel: 6 },
      { art: 'automatisiert',     turnus: 'taeglich',      anzahl: 9,  schluessel: 3 },
    ],
    befund: 'Der mit Abstand manuellste Bereich. Abschlusskontrollen laufen fast durchgängig über Tabellen und Sichtprüfungen statt über Systemlogik.',
  },
  {
    id: 'wertpapier',
    name: 'Wertpapier & Settlement',
    kurz: 'Wertpapier',
    icon: 'LineChart',
    beschreibung: 'Ordererfassung, Trade Matching, Confirmation, Settlement-Instruktion, Depotführung und Reconciliation.',
    regulatorik: ['MaRisk BTO 2', 'MiFID II', 'CSDR'],
    prozesse: 5,
    risiken: 22,
    prozesseMitSchluesselkontrolle: 5,
    risikenMitKontrolle: 22,
    risikenMitSchluesselkontrolle: 20,
    buckets: [
      { art: 'manuell',           turnus: 'taeglich',      anzahl: 18, schluessel: 9 },
      { art: 'teilautomatisiert', turnus: 'taeglich',      anzahl: 21, schluessel: 11 },
      { art: 'automatisiert',     turnus: 'taeglich',      anzahl: 16, schluessel: 8 },
      { art: 'systemgestuetzt',   turnus: 'je-vorgang',    anzahl: 14, schluessel: 6 },
      { art: 'manuell',           turnus: 'monatlich',     anzahl: 12, schluessel: 4 },
      { art: 'manuell',           turnus: 'quartalsweise', anzahl: 6,  schluessel: 2 },
    ],
    befund: 'Tagesaktuelle Abstimmkontrollen dominieren. Die hohe Stichprobenanforderung bei täglichem Turnus macht den Bereich überproportional prüfaufwendig.',
  },
  {
    id: 'meldewesen',
    name: 'Meldewesen & Regulatorik',
    kurz: 'Meldewesen',
    icon: 'FileBarChart',
    beschreibung: 'Bundesbank- und BaFin-Meldungen, COREP/FINREP, AnaCredit, Millionenkreditmeldung und Offenlegung.',
    regulatorik: ['CRR', 'AnaCredit', '§ 14 KWG', 'MaRisk BT 3'],
    prozesse: 7,
    risiken: 19,
    prozesseMitSchluesselkontrolle: 6,
    risikenMitKontrolle: 18,
    risikenMitSchluesselkontrolle: 15,
    buckets: [
      { art: 'manuell',           turnus: 'monatlich',     anzahl: 31, schluessel: 14 },
      { art: 'manuell',           turnus: 'quartalsweise', anzahl: 26, schluessel: 12 },
      { art: 'systemgestuetzt',   turnus: 'monatlich',     anzahl: 18, schluessel: 8 },
      { art: 'manuell',           turnus: 'jaehrlich',     anzahl: 11, schluessel: 5 },
      { art: 'teilautomatisiert', turnus: 'monatlich',     anzahl: 10, schluessel: 4 },
    ],
    befund: 'Stark stichtagsgetrieben. Die Kontrollen wiederholen sich je Meldestrecke, obwohl sie auf derselben Datenbasis aufsetzen.',
  },
  {
    id: 'auslagerung',
    name: 'Auslagerung & Drittparteien',
    kurz: 'Auslagerung',
    icon: 'Network',
    beschreibung: 'Auslagerungsregister, Dienstleistersteuerung, Wesentlichkeitsbeurteilung, Exit-Strategien und IKT-Drittparteienrisiko.',
    regulatorik: ['DORA', 'MaRisk AT 9', 'EBA Guidelines'],
    prozesse: 4,
    risiken: 15,
    prozesseMitSchluesselkontrolle: 2,
    risikenMitKontrolle: 11,
    risikenMitSchluesselkontrolle: 7,
    buckets: [
      { art: 'manuell',         turnus: 'quartalsweise',  anzahl: 19, schluessel: 9 },
      { art: 'manuell',         turnus: 'jaehrlich',      anzahl: 16, schluessel: 7 },
      { art: 'systemgestuetzt', turnus: 'quartalsweise',  anzahl: 9,  schluessel: 4 },
      { art: 'manuell',         turnus: 'anlassbezogen',  anzahl: 10, schluessel: 4 },
    ],
    befund: 'Kleinstes Inventar, aber die geringste Kontrolldichte je Risiko. Für den DORA-Nachweis ist die Abdeckung hier eher zu dünn als zu dicht.',
  },
  {
    id: 'it-sicherheit',
    name: 'IT & Informationssicherheit',
    kurz: 'IT & Security',
    icon: 'ServerCog',
    beschreibung: 'Berechtigungsmanagement, Change- und Releaseprozess, Backup und Wiederanlauf, Netzwerk- und Endpoint-Sicherheit.',
    regulatorik: ['DORA', 'BAIT', 'ISO 27001'],
    prozesse: 11,
    risiken: 31,
    prozesseMitSchluesselkontrolle: 10,
    risikenMitKontrolle: 30,
    risikenMitSchluesselkontrolle: 27,
    buckets: [
      { art: 'automatisiert',     turnus: 'taeglich',      anzahl: 38, schluessel: 17 },
      { art: 'teilautomatisiert', turnus: 'taeglich',      anzahl: 24, schluessel: 11 },
      { art: 'automatisiert',     turnus: 'woechentlich',  anzahl: 16, schluessel: 7 },
      { art: 'manuell',           turnus: 'monatlich',     anzahl: 18, schluessel: 8 },
      { art: 'manuell',           turnus: 'quartalsweise', anzahl: 13, schluessel: 5 },
      { art: 'systemgestuetzt',   turnus: 'monatlich',     anzahl: 9,  schluessel: 4 },
    ],
    befund: 'Höchster Automatisierungsgrad im Haus. Der verbleibende manuelle Anteil betrifft im Wesentlichen die periodische Berechtigungsrezertifizierung.',
  },
  {
    id: 'personal',
    name: 'Personal & Organisation',
    kurz: 'Personal',
    icon: 'Users',
    beschreibung: 'Einstellungs- und Austrittsprozess, Schulungsnachweise, Vergütungssystem, Interessenkonflikte und Vertretungsregelungen.',
    regulatorik: ['InstitutsVergV', 'MaRisk AT 7', 'WpHG'],
    prozesse: 4,
    risiken: 12,
    prozesseMitSchluesselkontrolle: 3,
    risikenMitKontrolle: 10,
    risikenMitSchluesselkontrolle: 8,
    buckets: [
      { art: 'manuell',         turnus: 'quartalsweise', anzahl: 15, schluessel: 6 },
      { art: 'manuell',         turnus: 'jaehrlich',     anzahl: 14, schluessel: 6 },
      { art: 'systemgestuetzt', turnus: 'monatlich',     anzahl: 8,  schluessel: 3 },
      { art: 'manuell',         turnus: 'anlassbezogen', anzahl: 6,  schluessel: 2 },
    ],
    befund: 'Kleines, überwiegend jährliches Inventar. Aufwand unkritisch — Handlungsbedarf liegt eher bei der Nachweisqualität als bei der Menge.',
  },
];

// =============================================================================
// WhiteSpots — Stellen, an denen der Bestand die Zielstruktur nicht traegt
//
// Drei Dimensionen: ein Risiko ohne Kontrolle, ein Prozess ohne
// Schluesselkontrolle, ein Bereich ohne tragfaehige Kontrollart.
// =============================================================================
export const WHITESPOTS = [
  {
    id: 'ws-1',
    dimension: 'risiko',
    bereichId: 'auslagerung',
    schwere: 'hoch',
    betroffen: 4,
    titel: 'Vier Auslagerungsrisiken ohne jede Kontrolle',
    beschreibung: 'Konzentrationsrisiko bei IKT-Dienstleistern, Weiterverlagerung in Drittstaaten, Exit-Fähigkeit und Datenrückgabe sind im Inventar als Risiko erfasst, aber keiner Kontrolle zugeordnet.',
    folge: 'Für den DORA-Nachweis die größte Lücke im Haus — hier ist nicht zu viel, sondern zu wenig kontrolliert.',
  },
  {
    id: 'ws-2',
    dimension: 'prozess',
    bereichId: 'auslagerung',
    schwere: 'hoch',
    betroffen: 2,
    titel: 'Zwei von vier Auslagerungsprozessen ohne Schlüsselkontrolle',
    beschreibung: 'Wesentlichkeitsbeurteilung und Exit-Planung laufen ohne eine als Schlüsselkontrolle gewidmete Prüfung — es gibt nur begleitende Dokumentationsschritte.',
    folge: 'Die Prozesse sind beschrieben, aber nicht prüfungsfest abgesichert.',
  },
  {
    id: 'ws-3',
    dimension: 'risiko',
    bereichId: 'personal',
    schwere: 'mittel',
    betroffen: 2,
    titel: 'Schlüsselpersonenabhängigkeit ohne Kontrolle',
    beschreibung: 'Vertretungsregelungen und Wissenstransfer bei Austritten sind als Risiko erfasst, im Kontrollinventar aber nicht abgebildet.',
    folge: 'Fällt in der Regel erst bei einer Betriebsprüfung oder im Schadenfall auf.',
  },
  {
    id: 'ws-4',
    dimension: 'risiko',
    bereichId: 'finanzprozesse',
    schwere: 'mittel',
    betroffen: 5,
    titel: 'Fünf Abschlussrisiken nur mit begleitenden Kontrollen',
    beschreibung: 'Bewertungs- und Abgrenzungsrisiken sind zwar kontrolliert, aber keine der zugeordneten Kontrollen ist als Schlüsselkontrolle gewidmet.',
    folge: 'In der Wirksamkeitsprüfung fällt der Bereich damit durch das Raster der 2nd Line.',
  },
  {
    id: 'ws-5',
    dimension: 'bereich',
    bereichId: 'meldewesen',
    schwere: 'mittel',
    betroffen: 1,
    titel: 'Meldewesen ohne detektive Kontrolle nach der Einreichung',
    beschreibung: 'Alle Kontrollen greifen vor der Meldung. Eine nachgelagerte Abstimmung gegen die eingereichten Werte existiert nicht.',
    folge: 'Fehler, die die Vorabkontrollen passieren, werden erst durch Rückfragen der Aufsicht sichtbar.',
  },
  {
    id: 'ws-6',
    dimension: 'risiko',
    bereichId: 'it-sicherheit',
    schwere: 'niedrig',
    betroffen: 1,
    titel: 'Cloud-Exit ohne eigene Kontrolle',
    beschreibung: 'Der Rückführungsfall aus der Public Cloud ist als Risiko erfasst, wird aber nur über den allgemeinen Notfallprozess mit abgedeckt.',
    folge: 'Geringe Eintrittswahrscheinlichkeit, im Eintrittsfall aber ohne eingeübten Ablauf.',
  },
];

export const SCHWERE_MAP = {
  hoch:    { label: 'Hoch',    color: '#B91C1C', bg: '#FEF2F2', rang: 3 },
  mittel:  { label: 'Mittel',  color: '#B45309', bg: '#FFFBEB', rang: 2 },
  niedrig: { label: 'Gering',  color: '#475569', bg: '#F1F5F9', rang: 1 },
};

export const DIMENSIONEN = [
  { id: 'bereich', label: 'Bereich',  hinweis: 'Verteilung des Bestands über die Prozessbereiche des Hauses.' },
  { id: 'prozess', label: 'Prozesse', hinweis: 'Anteil der Prozesse, die mindestens eine Schlüsselkontrolle tragen.' },
  { id: 'risiko',  label: 'Risiko',   hinweis: 'Anteil der Risiken, die kontrolliert und als Schlüsselkontrolle gewidmet sind.' },
];

// =============================================================================
// Kontrolltypen — funktionale Art der Kontrolle
//
// Die Anzahl der im Haus gefuehrten Kontrolltypen ist ein Indikator fuer die
// Komplexität des Kontrollsystems: jeder zusaetzliche Typ bringt eigene
// Nachweisformen, eigene Pruefwege und eigenen Schulungsbedarf mit sich.
// =============================================================================
export const KONTROLLTYPEN = [
  { id: 'plausibilisierung', label: 'Plausibilisierung & Validierung', anzahl: 158, wirkung: 'praeventiv', automatisierbarkeit: 'hoch',   hinweis: 'Regelbasiert und damit am leichtesten systemseitig abzulösen.' },
  { id: 'vier_augen',        label: 'Vier-Augen-Prinzip',              anzahl: 142, wirkung: 'praeventiv', automatisierbarkeit: 'gering', hinweis: 'Bleibt personengebunden; automatisierbar ist nur die Steuerung, nicht die Entscheidung.' },
  { id: 'abstimmung',        label: 'Abstimmung & Reconciliation',     anzahl: 121, wirkung: 'detektiv',   automatisierbarkeit: 'hoch',   hinweis: 'Klassischer Automatisierungskandidat — Abweichungen lassen sich maschinell erkennen.' },
  { id: 'systempruefung',    label: 'Systemseitige Prüfung',          anzahl: 118, wirkung: 'praeventiv', automatisierbarkeit: 'hoch',   hinweis: 'Bereits weitgehend automatisiert; Aufwand liegt in der Konfigurationspflege.' },
  { id: 'freigabe',          label: 'Freigabe & Genehmigung',          anzahl: 96,  wirkung: 'praeventiv', automatisierbarkeit: 'mittel', hinweis: 'Workflowgestützt beschleunigbar, die Entscheidung bleibt beim Menschen.' },
  { id: 'berechtigung',      label: 'Berechtigungskontrolle',          anzahl: 71,  wirkung: 'detektiv',   automatisierbarkeit: 'hoch',   hinweis: 'Rezertifizierung laesst sich kampagnengesteuert weitgehend automatisieren.' },
  { id: 'monitoring',        label: 'Monitoring & Überwachung',       anzahl: 63,  wirkung: 'detektiv',   automatisierbarkeit: 'hoch',   hinweis: 'Schwellenwertbasiert; eignet sich für kontinuierliche statt periodische Überwachung.' },
  { id: 'reporting',         label: 'Reporting & Managementinformation', anzahl: 43, wirkung: 'detektiv', automatisierbarkeit: 'mittel', hinweis: 'Häufig kein echter Kontrollcharakter — Kandidat für Entwidmung.' },
];

export const WIRKUNG_MAP = {
  praeventiv: { label: 'Präventiv', kurz: 'Präv.', color: '#1D7B3F', bg: '#ECFDF5' },
  detektiv:   { label: 'Detektiv',   kurz: 'Detekt.', color: '#2563EB', bg: '#EFF6FF' },
};

export const AUTOMATISIERBARKEIT_MAP = {
  hoch:   { label: 'Hoch',   color: '#047857', bg: '#ECFDF5', rang: 3 },
  mittel: { label: 'Mittel', color: '#B45309', bg: '#FFFBEB', rang: 2 },
  gering: { label: 'Gering', color: '#64748B', bg: '#F1F5F9', rang: 1 },
};

// =============================================================================
// Turnus-Senkung — welche Kontrollen koennen seltener laufen?
//
// Die Ersparnis wird nicht gesetzt, sondern aus demselben Aufwandsmodell
// gerechnet: derselbe Bucket einmal im heutigen und einmal im Zielturnus.
// =============================================================================
export const TURNUS_SENKUNG = [
  {
    id: 'ts-1',
    von: 'taeglich', nach: 'woechentlich',
    art: 'manuell', anzahl: 34, schluessel: 12,
    bereich: 'Wertpapier & Settlement, Zahlungsverkehr',
    begruendung: 'Abstimmkontrollen mit durchgehend niedriger Fehlerquote über die letzten acht Quartale. Ein wöchentlicher Turnus mit täglicher Schwellenwertüberwachung deckt dasselbe Risiko ab.',
    bedingung: 'Voraussetzung ist ein automatisiertes Schwellenwert-Monitoring, das Auffälligkeiten weiterhin taggleich meldet.',
  },
  {
    id: 'ts-2',
    von: 'monatlich', nach: 'quartalsweise',
    art: 'manuell', anzahl: 58, schluessel: 19,
    bereich: 'Finanzprozesse, Meldewesen',
    begruendung: 'Kontrollen auf Positionen unterhalb der Wesentlichkeitsgrenze. Der Monatsturnus stammt aus der Zeit vor Einführung der Wesentlichkeitsgrenze und wurde nie nachgezogen.',
    bedingung: 'Die Wesentlichkeitsgrenze muss dokumentiert und jährlich überprüft werden.',
  },
  {
    id: 'ts-3',
    von: 'quartalsweise', nach: 'jaehrlich',
    art: 'manuell', anzahl: 22, schluessel: 6,
    bereich: 'Personal & Organisation, Auslagerung',
    begruendung: 'Bestandskontrollen auf Stammdaten und Vertragswerken, die sich unterjährig kaum ändern. Ein jährlicher Turnus mit anlassbezogener Zusatzprüfung ist angemessen.',
    bedingung: 'Anlassbezogene Prüfung bei Vertragsänderung oder Dienstleisterwechsel bleibt verpflichtend.',
  },
];

// =============================================================================
// Berechnung
// =============================================================================

/** Aufwand eines Buckets — getrennt nach Durchfuehrung und Testing. */
export function bucketAufwand(bucket, annahmen) {
  // --- Durchfuehrung (1st Line) ---
  const ausfuehrungen = annahmen.ausfuehrungenProJahr[bucket.turnus] ?? 0;
  const minutenJeAusfuehrung = annahmen.minutenJeAusfuehrung[bucket.turnus] ?? 0;
  const faktor = annahmen.artFaktor[bucket.art] ?? 1;
  const dfStdJeKontrolle = (ausfuehrungen * minutenJeAusfuehrung * faktor) / 60;
  const durchfuehrungStd = bucket.anzahl * dfStdJeKontrolle;

  // --- Testing (Wirksamkeitsnachweis) ---
  const stichprobe = annahmen.stichprobe[bucket.turnus] ?? 0;
  const minutenJeStichprobe = annahmen.minutenJeStichprobe[bucket.art] ?? 0;
  const testStd = (stichprobe * minutenJeStichprobe) / 60;
  const tsStdJeKontrolle = testStd + annahmen.grundaufwandStd;
  const basisStd = bucket.anzahl * tsStdJeKontrolle;
  const zuschlagStd = bucket.schluessel * tsStdJeKontrolle * (annahmen.schluesselZuschlagProzent / 100);
  const testingStd = basisStd + zuschlagStd;

  return {
    durchfuehrung: { ausfuehrungen, minutenJeAusfuehrung, faktor, stdJeKontrolle: dfStdJeKontrolle, gesamtStd: durchfuehrungStd },
    testing: { stichprobe, minutenJeStichprobe, testStd, stdJeKontrolle: tsStdJeKontrolle, basisStd, zuschlagStd, gesamtStd: testingStd },
    gesamtStd: durchfuehrungStd + testingStd,
  };
}

function istAutomatisiert(art) {
  return art === 'automatisiert' || art === 'teilautomatisiert';
}

/** Kennzahlen eines Prozessbereichs bei gegebenen Annahmen. */
export function berechneBereich(bereich, annahmen) {
  const kontrollen = bereich.buckets.reduce((s, b) => s + b.anzahl, 0);
  const schluessel = bereich.buckets.reduce((s, b) => s + b.schluessel, 0);
  const manuell = bereich.buckets.filter(b => !istAutomatisiert(b.art)).reduce((s, b) => s + b.anzahl, 0);
  const automatisiert = kontrollen - manuell;

  let durchfuehrungStd = 0, testingStd = 0;
  bereich.buckets.forEach(b => {
    const a = bucketAufwand(b, annahmen);
    durchfuehrungStd += a.durchfuehrung.gesamtStd;
    testingStd += a.testing.gesamtStd;
  });
  const stunden = durchfuehrungStd + testingStd;

  const nachArt = ART_ORDER.map(art => ({
    art,
    anzahl: bereich.buckets.filter(b => b.art === art).reduce((s, b) => s + b.anzahl, 0),
  }));

  return {
    ...bereich,
    kontrollen,
    schluessel,
    manuell,
    automatisiert,
    automatisierungsgrad: kontrollen ? Math.round((automatisiert / kontrollen) * 100) : 0,
    kontrollenJeRisiko: bereich.risiken ? kontrollen / bereich.risiken : 0,
    prozessabdeckung: bereich.prozesse ? Math.round((bereich.prozesseMitSchluesselkontrolle / bereich.prozesse) * 100) : 100,
    risikoabdeckung: bereich.risiken ? Math.round((bereich.risikenMitKontrolle / bereich.risiken) * 100) : 100,
    risikoabdeckungSchluessel: bereich.risiken ? Math.round((bereich.risikenMitSchluesselkontrolle / bereich.risiken) * 100) : 100,
    risikenOhneKontrolle: bereich.risiken - bereich.risikenMitKontrolle,
    prozesseOhneSchluesselkontrolle: bereich.prozesse - bereich.prozesseMitSchluesselkontrolle,
    durchfuehrungStd,
    testingStd,
    stunden,
    durchfuehrungPT: durchfuehrungStd / annahmen.stundenProPT,
    testingPT: testingStd / annahmen.stundenProPT,
    pt: stunden / annahmen.stundenProPT,
    nachArt,
  };
}

/** Gesamte IST-Analyse ueber alle Prozessbereiche. */
export function berechneIstAnalyse(annahmen = ANNAHMEN_DEFAULT) {
  const bereiche = PROZESSBEREICHE.map(b => berechneBereich(b, annahmen))
    .sort((a, b) => b.kontrollen - a.kontrollen);

  const sum = (f) => bereiche.reduce((s, b) => s + f(b), 0);
  const kontrollen = sum(b => b.kontrollen);
  const risiken = sum(b => b.risiken);
  const prozesse = sum(b => b.prozesse);
  const manuell = sum(b => b.manuell);
  const durchfuehrungStd = sum(b => b.durchfuehrungStd);
  const testingStd = sum(b => b.testingStd);
  const stunden = durchfuehrungStd + testingStd;
  const risikenMitKontrolle = sum(b => b.risikenMitKontrolle);
  const risikenMitSchluessel = sum(b => b.risikenMitSchluesselkontrolle);
  const prozesseMitSchluessel = sum(b => b.prozesseMitSchluesselkontrolle);

  const whitespots = WHITESPOTS.map(w => ({
    ...w,
    bereich: PROZESSBEREICHE.find(b => b.id === w.bereichId)?.name || w.bereichId,
  })).sort((a, b) => SCHWERE_MAP[b.schwere].rang - SCHWERE_MAP[a.schwere].rang);

  return {
    bereiche,
    whitespots,
    gesamt: {
      kontrollen,
      schluessel: sum(b => b.schluessel),
      manuell,
      automatisiert: kontrollen - manuell,
      automatisierungsgrad: kontrollen ? Math.round(((kontrollen - manuell) / kontrollen) * 100) : 0,
      risiken,
      prozesse,
      kontrollenJeRisiko: risiken ? kontrollen / risiken : 0,
      risikenMitKontrolle,
      risikenOhneKontrolle: risiken - risikenMitKontrolle,
      risikoabdeckung: risiken ? Math.round((risikenMitKontrolle / risiken) * 100) : 100,
      risikoabdeckungSchluessel: risiken ? Math.round((risikenMitSchluessel / risiken) * 100) : 100,
      prozesseMitSchluessel,
      prozessabdeckung: prozesse ? Math.round((prozesseMitSchluessel / prozesse) * 100) : 100,
      durchfuehrungStd,
      testingStd,
      stunden,
      durchfuehrungPT: durchfuehrungStd / annahmen.stundenProPT,
      testingPT: testingStd / annahmen.stundenProPT,
      pt: stunden / annahmen.stundenProPT,
      fte: stunden / annahmen.stundenProPT / 200,
    },
  };
}

// Schritte der IST-Analyse (Verarbeitungs-Animation und Befundgliederung).
export const IST_STEPS = [
  { id: 'inventar',  titel: 'Kontrollinventar einlesen', detail: 'Kontrollen, Risiken, Ausführungsart, Turnus und Schlüsselkontroll-Kennzeichnung werden strukturiert erfasst.' },
  { id: 'zuordnung', titel: 'Prozessbereichen zuordnen', detail: 'Jede Kontrolle wird ihrem Prozessbereich und der zugehörigen Regulatorik zugeordnet.' },
  { id: 'abdeckung', titel: 'Abdeckung über drei Dimensionen prüfen', detail: 'Bereich, Prozesse und Risiken — wo trägt der Bestand, wo bleiben WhiteSpots.' },
  { id: 'aufwand',   titel: 'Aufwand für Durchführung und Testing herleiten', detail: 'Ausführungshäufigkeit, Zeitbedarf je Ausführung, Stichprobenumfang und Schlüsselkontroll-Zuschlag.' },
];

/** Der Bereich mit dem groessten Optimierungshebel (viel Aufwand, wenig automatisiert). */
export function groessterHebel(bereiche) {
  return [...bereiche].sort((a, b) => (b.pt * (100 - b.automatisierungsgrad)) - (a.pt * (100 - a.automatisierungsgrad)))[0];
}

/** Ersparnis einer Turnus-Senkung — aus demselben Aufwandsmodell gerechnet. */
export function turnusErsparnis(eintrag, annahmen) {
  const vorher = bucketAufwand({ art: eintrag.art, turnus: eintrag.von, anzahl: eintrag.anzahl, schluessel: eintrag.schluessel }, annahmen);
  const nachher = bucketAufwand({ art: eintrag.art, turnus: eintrag.nach, anzahl: eintrag.anzahl, schluessel: eintrag.schluessel }, annahmen);
  const std = vorher.gesamtStd - nachher.gesamtStd;
  return {
    vorherStd: vorher.gesamtStd,
    nachherStd: nachher.gesamtStd,
    ersparnisStd: std,
    ersparnisPT: std / annahmen.stundenProPT,
    vorherPT: vorher.gesamtStd / annahmen.stundenProPT,
    nachherPT: nachher.gesamtStd / annahmen.stundenProPT,
  };
}

/** Kennzahlen zur Kontrolltypen-Verteilung (Komplexitaetsindikator). */
export function kontrolltypenKennzahlen() {
  const gesamt = KONTROLLTYPEN.reduce((s, t) => s + t.anzahl, 0);
  const sortiert = [...KONTROLLTYPEN].sort((a, b) => b.anzahl - a.anzahl);
  const top3 = sortiert.slice(0, 3).reduce((s, t) => s + t.anzahl, 0);
  const automatisierbar = KONTROLLTYPEN.filter(t => t.automatisierbarkeit === 'hoch').reduce((s, t) => s + t.anzahl, 0);
  return {
    gesamt,
    typen: KONTROLLTYPEN.length,
    top3Anteil: gesamt ? Math.round((top3 / gesamt) * 100) : 0,
    praeventiv: KONTROLLTYPEN.filter(t => t.wirkung === 'praeventiv').reduce((s, t) => s + t.anzahl, 0),
    detektiv: KONTROLLTYPEN.filter(t => t.wirkung === 'detektiv').reduce((s, t) => s + t.anzahl, 0),
    hochAutomatisierbar: automatisierbar,
    hochAutomatisierbarAnteil: gesamt ? Math.round((automatisierbar / gesamt) * 100) : 0,
    sortiert,
  };
}
