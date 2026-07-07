// =============================================================================
// b-IKS Optimierung — Datenmodell für den Bestandsoptimierungs-Showcase
//
// Anders als der b-IKS Agent (der aus einem Prozess Risiken & Schlüsselkontrollen
// *ableitet*), liest die Optimierung ein bereits *bestehendes* Risiko- und
// Kontrollinventar (RCM / Risk-Control-Matrix) ein und bewertet es auf:
//   · Duplikate            — dieselbe Wirkung mehrfach abgedeckt → weglassen
//   · Zusammenführung      — überlappende Kontrollen → zu einer mergen
//   · Kontrolldichte       — Überkontrolle bei geringer Wesentlichkeit → reduzieren
//   · Automatisierung      — fehleranfällige manuelle Kontrolle → automatisieren
//   · Beibehaltung         — wirksame Kontrolle → unverändert lassen
//
// Ergebnis: eine Vorher/Nachher-Sicht (Kontrollanzahl, Automatisierungsgrad,
// Prüfaufwand, Redundanzen) bei gleichbleibender Risikoabdeckung — inklusive
// Kollaboration (Empfehlungen annehmen / ablehnen / kommentieren / zuweisen).
//
// Alle Inhalte sind frei erfunden (synthetische Demo-Daten) und beziehen sich auf
// denselben Auszahlungsprozess wie das b-IKS-Agent-Beispiel, damit beide Module
// fachlich konsistent sind.
// =============================================================================

import { TEAM, getTeamMember, STUFE_MAP } from './biksAgent';

export { TEAM, getTeamMember, STUFE_MAP };

// ===== Empfehlungstypen =====================================================
export const EMPFEHLUNG_TYPEN = [
  {
    id: 'duplikat',
    label: 'Duplikat entfernen',
    kurz: 'Duplikat',
    color: '#DC2626',
    bg: '#FEF2F2',
    icon: 'CopyX',
    beschreibung: 'Kontrolle deckt exakt dieselbe Wirkung wie eine bestehende Kontrolle ab und kann ersatzlos entfallen.',
  },
  {
    id: 'merge',
    label: 'Zusammenführen',
    kurz: 'Merge',
    color: '#7C3AED',
    bg: '#F5F3FF',
    icon: 'Merge',
    beschreibung: 'Mehrere überlappende Kontrollen werden zu einer prüfungsfesten Schlüsselkontrolle zusammengeführt.',
  },
  {
    id: 'reduzieren',
    label: 'Kontrolldichte reduzieren',
    kurz: 'Reduzieren',
    color: '#D97706',
    bg: '#FFFBEB',
    icon: 'Minimize2',
    beschreibung: 'Überkontrolle bei geringer Wesentlichkeit — Turnus senken oder als Schlüsselkontrolle entwidmen.',
  },
  {
    id: 'automatisieren',
    label: 'Automatisieren',
    kurz: 'Automatisieren',
    color: '#2563EB',
    bg: '#EFF6FF',
    icon: 'Cpu',
    beschreibung: 'Fehleranfällige, aufwendige manuelle Kontrolle durch eine automatisierte Kontrolle ablösen.',
  },
  {
    id: 'beibehalten',
    label: 'Beibehalten',
    kurz: 'Beibehalten',
    color: '#059669',
    bg: '#ECFDF5',
    icon: 'CheckCircle2',
    beschreibung: 'Wirksame, angemessene Kontrolle — keine Änderung erforderlich.',
  },
];
export const TYP_MAP = Object.fromEntries(EMPFEHLUNG_TYPEN.map(t => [t.id, t]));

// ===== Kollaborations-Status für Empfehlungen ===============================
export const EMPFEHLUNG_STATUS = [
  { id: 'offen',      label: 'Offen',        color: '#64748B', bg: '#F1F5F9', icon: 'Circle' },
  { id: 'in_pruefung',label: 'In Prüfung',   color: '#2563EB', bg: '#EFF6FF', icon: 'PencilLine' },
  { id: 'angenommen', label: 'Angenommen',   color: '#059669', bg: '#ECFDF5', icon: 'CheckCircle2' },
  { id: 'abgelehnt',  label: 'Abgelehnt',    color: '#DC2626', bg: '#FEF2F2', icon: 'XCircle' },
];
export const EMPF_STATUS_MAP = Object.fromEntries(EMPFEHLUNG_STATUS.map(s => [s.id, s]));

// ===== Kontroll-Ausführungsart (für Automatisierungsgrad) ===================
export const AUSFUEHRUNG = [
  { id: 'manuell',          label: 'Manuell',          rank: 0,   color: '#B91C1C', bg: '#FEF2F2' },
  { id: 'systemgestuetzt',  label: 'Manuell (systemgestützt)', rank: 0.5, color: '#B45309', bg: '#FFFBEB' },
  { id: 'teilautomatisiert',label: 'Teilautomatisiert', rank: 0.5, color: '#B45309', bg: '#FFFBEB' },
  { id: 'automatisiert',    label: 'Automatisiert',    rank: 1,   color: '#047857', bg: '#ECFDF5' },
];
export const AUSFUEHRUNG_MAP = Object.fromEntries(AUSFUEHRUNG.map(a => [a.id, a]));
// „Automatisiert oder teilautomatisiert" zählt in den Automatisierungsgrad ein.
function istAutomatisiert(art) {
  return art === 'automatisiert' || art === 'teilautomatisiert';
}

// =============================================================================
// Bestehendes Inventar (Bestand) — Auszahlungsprozess (Bank)
// 14 Kontrollen über 5 Risiken, mit bewusst eingebauten Schwächen
// (Duplikate, Überlappungen, Überkontrolle, manuelle Aufwandstreiber).
// =============================================================================

// Risiken des Bestands-Inventars (Restrisiko = Bewertung nach heutiger Kontrollwirkung).
export const BESTAND_RISIKEN = [
  { id: 'r1', nummer: 1, titel: 'Unautorisierte oder manipulierte Auszahlung', risikoart: 'Betrugsrisiko',          cluster: 'betrug',           schaden: 'hoch', eintritt: 'mittel',        restVorher: { schaden: 'hoch', eintritt: 'mittel' },        restNachher: { schaden: 'hoch', eintritt: 'niedrig-mittel' } },
  { id: 'r2', nummer: 2, titel: 'Auszahlung trotz nicht erfüllter Voraussetzungen', risikoart: 'Rechts-/Compliance-Risiko', cluster: 'recht-compliance', schaden: 'hoch', eintritt: 'mittel',   restVorher: { schaden: 'hoch', eintritt: 'mittel' },        restNachher: { schaden: 'hoch', eintritt: 'mittel' } },
  { id: 'r3', nummer: 3, titel: 'Falsche Empfänger-, Betrags- oder Zahlungsdaten', risikoart: 'Datenqualitätsrisiko', cluster: 'datenqualitaet',  schaden: 'hoch', eintritt: 'mittel',       restVorher: { schaden: 'hoch', eintritt: 'mittel' },        restNachher: { schaden: 'hoch', eintritt: 'niedrig-mittel' } },
  { id: 'r4', nummer: 4, titel: 'Unterlassene Sanktions-/Embargo-/AML-Prüfung',   risikoart: 'Rechts-/Compliance-Risiko', cluster: 'recht-compliance', schaden: 'hoch', eintritt: 'niedrig-mittel', restVorher: { schaden: 'hoch', eintritt: 'niedrig-mittel' }, restNachher: { schaden: 'hoch', eintritt: 'niedrig-mittel' } },
  { id: 'r5', nummer: 5, titel: 'System-/Schnittstellenfehler (Doppel-/Fehlzahlung)', risikoart: 'IT-/Cyberrisiko',    cluster: 'it-cyber',         schaden: 'hoch', eintritt: 'niedrig-mittel', restVorher: { schaden: 'hoch', eintritt: 'mittel' },        restNachher: { schaden: 'hoch', eintritt: 'niedrig-mittel' } },
];

// Bestehende Kontrollen. jaehrlich = geschätzter Prüf-/Durchführungsaufwand in Std./Jahr.
export const BESTAND_KONTROLLEN = [
  { id: 'k1-1', risikoId: 'r1', code: 'AK-01', name: 'Vier-Augen-Freigabe der Auszahlung',                     art: 'systemgestuetzt',   turnus: 'je-vorgang', jaehrlich: 60, wer: 'Marktfolge' },
  { id: 'k1-2', risikoId: 'r1', code: 'AK-02', name: 'Manuelle Zweitprüfung der Empfängerdaten',                art: 'manuell',           turnus: 'je-vorgang', jaehrlich: 55, wer: 'Marktfolge' },
  { id: 'k1-3', risikoId: 'r1', code: 'AK-03', name: 'Transaktionslimit-Kontrolle',                             art: 'manuell',           turnus: 'je-vorgang', jaehrlich: 30, wer: 'Marktfolge' },
  { id: 'k2-1', risikoId: 'r2', code: 'AK-04', name: 'Checkliste Auszahlungsvoraussetzungen',                   art: 'systemgestuetzt',   turnus: 'je-vorgang', jaehrlich: 48, wer: 'Marktfolge' },
  { id: 'k2-2', risikoId: 'r2', code: 'AK-05', name: 'Manuelle Kontrolle der Sicherheitenbestellung',           art: 'manuell',           turnus: 'je-vorgang', jaehrlich: 42, wer: 'Marktfolge' },
  { id: 'k3-1', risikoId: 'r3', code: 'AK-06', name: 'IBAN- und Formatprüfung',                                 art: 'teilautomatisiert', turnus: 'bei-erfassung', jaehrlich: 18, wer: 'System / Fachbereich' },
  { id: 'k3-2', risikoId: 'r3', code: 'AK-07', name: 'Manuelle Sichtprüfung der erfassten Zahlungsdaten',       art: 'manuell',           turnus: 'je-vorgang', jaehrlich: 65, wer: 'Fachbereich' },
  { id: 'k3-3', risikoId: 'r3', code: 'AK-08', name: 'Systemseitige Pflichtfeld- und Plausibilitätsprüfung',    art: 'automatisiert',     turnus: 'bei-erfassung', jaehrlich: 8, wer: 'System' },
  { id: 'k4-1', risikoId: 'r4', code: 'AK-09', name: 'Automatisiertes Sanktions-/AML-Screening',               art: 'automatisiert',     turnus: 'je-vorgang', jaehrlich: 15, wer: 'System / Compliance' },
  { id: 'k4-2', risikoId: 'r4', code: 'AK-10', name: 'Manuelle Nachkontrolle aller Zahlungen gegen Sanktionsliste', art: 'manuell',      turnus: 'taeglich',   jaehrlich: 90, wer: 'Compliance' },
  { id: 'k5-1', risikoId: 'r5', code: 'AK-11', name: 'Tägliche Schnittstellen- und Zahlungsdateiabstimmung',    art: 'teilautomatisiert', turnus: 'taeglich',   jaehrlich: 70, wer: 'Zahlungsverkehr' },
  { id: 'k5-2', risikoId: 'r5', code: 'AK-12', name: 'Manuelle Dublettenprüfung',                               art: 'manuell',           turnus: 'taeglich',   jaehrlich: 58, wer: 'Zahlungsverkehr' },
  { id: 'k5-3', risikoId: 'r5', code: 'AK-13', name: 'Monatlicher Abgleich der Zahlungsdatei',                  art: 'manuell',           turnus: 'monatlich',  jaehrlich: 36, wer: 'Zahlungsverkehr' },
  { id: 'kq-1', risikoId: 'r5', code: 'AK-14', name: 'Monatliche Reporting-Kontrolle Auszahlungsvolumen',       art: 'manuell',           turnus: 'monatlich',  jaehrlich: 30, wer: 'Controlling' },
];

// =============================================================================
// Optimierungs-Empfehlungen des Agents
// Jede Empfehlung referenziert die betroffenen Bestandskontrollen und beschreibt
// den Vorher-/Nachher-Zustand samt Wirkung (Impact).
// =============================================================================

export const EMPFEHLUNGEN_ROH = [
  {
    id: 'e1',
    typ: 'duplikat',
    prioritaet: 'hoch',
    titel: 'Manuelle Sanktions-Nachkontrolle als Duplikat entfernen',
    risikoId: 'r4',
    betroffen: ['k4-2'],
    referenz: 'k4-1',
    begruendung:
      'Die manuelle Nachkontrolle (AK-10) prüft täglich sämtliche Zahlungen erneut gegen die Sanktionsliste — genau das leistet bereits das automatisierte Screening (AK-09) transaktionsbezogen und lückenlos. Es handelt sich um eine vollständige Doppelung ohne zusätzlichen Kontrollnutzen; die Trefferbearbeitung bleibt bei Compliance erhalten.',
    vorher: 'AK-09 (automatisiert, je Vorgang) + AK-10 (manuell, täglich, Vollprüfung)',
    nachher: 'AK-09 mit dokumentierter Trefferbearbeitung durch Compliance — AK-10 entfällt ersatzlos',
    entfaelltKontrollen: ['k4-2'],
    impact: { kontrollenDelta: -1, aufwandDelta: -90, automatisierung: false, redundanzDelta: -1 },
    coverageHinweis: 'Risikoabdeckung R4 unverändert — das automatisierte Screening deckt alle Zahlungen ab.',
  },
  {
    id: 'e2',
    typ: 'merge',
    prioritaet: 'hoch',
    titel: 'Empfänger-Zweitprüfung in die Vier-Augen-Freigabe zusammenführen',
    risikoId: 'r1',
    betroffen: ['k1-1', 'k1-2'],
    begruendung:
      'AK-01 (Vier-Augen-Freigabe) und AK-02 (manuelle Empfänger-Zweitprüfung) werden von derselben Rolle je Vorgang durchgeführt und überschneiden sich inhaltlich. Der Empfängerabgleich wird als verpflichtender Prüfpunkt in die Vier-Augen-Freigabe integriert — eine Kontrolle, ein Audit-Trail, kein doppelter Erfassungsschritt.',
    vorher: 'AK-01 (Vier-Augen-Freigabe) + AK-02 (separate Empfängerprüfung)',
    nachher: 'AK-01 „Vier-Augen-Freigabe mit Berechtigungs- und Empfängerabgleich" (systemgestützt)',
    entfaelltKontrollen: ['k1-2'],
    impact: { kontrollenDelta: -1, aufwandDelta: -40, automatisierung: false, redundanzDelta: -1 },
    coverageHinweis: 'Empfängerabgleich bleibt verbindlicher Freigabe-Prüfpunkt — Abdeckung R1 unverändert.',
  },
  {
    id: 'e3',
    typ: 'merge',
    prioritaet: 'mittel',
    titel: 'Sicherheitenkontrolle in den Voraussetzungscheck integrieren',
    risikoId: 'r2',
    betroffen: ['k2-1', 'k2-2'],
    begruendung:
      'Die manuelle Sicherheitenkontrolle (AK-05) ist ein Teilaspekt der Auszahlungsvoraussetzungen und wird in die verbindliche Checkliste (AK-04) als Pflichtnachweis übernommen. Damit wird der Voraussetzungscheck vollständig und die separate Kontrolle entfällt.',
    vorher: 'AK-04 (Checkliste Voraussetzungen) + AK-05 (separate Sicherheitenkontrolle)',
    nachher: 'AK-04 „Voraussetzungscheck inkl. Sicherheitenbestellung" mit systemischer Auszahlsperre',
    entfaelltKontrollen: ['k2-2'],
    impact: { kontrollenDelta: -1, aufwandDelta: -42, automatisierung: false, redundanzDelta: -1 },
    coverageHinweis: 'Sicherheitenprüfung wird verpflichtender Bestandteil der Freigabe — Abdeckung R2 unverändert.',
  },
  {
    id: 'e4',
    typ: 'automatisieren',
    prioritaet: 'hoch',
    titel: 'Manuelle Sichtprüfung der Zahlungsdaten automatisieren',
    risikoId: 'r3',
    betroffen: ['k3-2'],
    referenz: 'k3-3',
    begruendung:
      'Die manuelle Sichtprüfung (AK-07) ist mit 65 Std./Jahr der größte Aufwandstreiber bei R3 und zugleich fehleranfällig. Durch Ausbau der bestehenden automatisierten Pflichtfeld-/Plausibilitätsprüfung (AK-08) um Betrags-, Referenz- und Empfängerabgleich lässt sich die Sichtprüfung vollständig ablösen — schneller, lückenlos und protokolliert.',
    vorher: 'AK-07 (manuelle Sichtprüfung, je Vorgang, hoher Aufwand)',
    nachher: 'AK-07 „Erweiterte automatisierte Plausibilitäts- und Abgleichsprüfung" (automatisiert)',
    automatisiertKontrollen: ['k3-2'],
    impact: { kontrollenDelta: 0, aufwandDelta: -57, automatisierung: true, redundanzDelta: 0 },
    coverageHinweis: 'Restrisiko R3 sinkt (Eintritt mittel → niedrig-mittel), da manuelle Erfassungsfehler entfallen.',
  },
  {
    id: 'e5',
    typ: 'automatisieren',
    prioritaet: 'mittel',
    titel: 'Manuelle Dublettenprüfung in automatisiertes Monitoring überführen',
    risikoId: 'r5',
    betroffen: ['k5-2'],
    referenz: 'k5-1',
    begruendung:
      'Die manuelle Dublettenprüfung (AK-12) wird als automatisiertes Dublettenmonitoring in die tägliche Schnittstellenabstimmung (AK-11) integriert. Dubletten, Rejects und Teilverarbeitungen werden regelbasiert erkannt; die manuelle Fallbearbeitung bleibt nur noch für echte Ausnahmen.',
    vorher: 'AK-12 (manuelle Dublettenprüfung, täglich)',
    nachher: 'AK-12 „Automatisiertes Dublettenmonitoring" in der täglichen Abstimmung',
    automatisiertKontrollen: ['k5-2'],
    impact: { kontrollenDelta: 0, aufwandDelta: -46, automatisierung: true, redundanzDelta: 0 },
    coverageHinweis: 'Restrisiko R5 sinkt (Eintritt mittel → niedrig-mittel) durch lückenlose maschinelle Erkennung.',
  },
  {
    id: 'e6',
    typ: 'duplikat',
    prioritaet: 'mittel',
    titel: 'Monatlichen Zahlungsdatei-Abgleich als Duplikat entfernen',
    risikoId: 'r5',
    betroffen: ['k5-3'],
    referenz: 'k5-1',
    begruendung:
      'Der monatliche Abgleich der Zahlungsdatei (AK-13) wiederholt zeitverzögert, was die tägliche Abstimmung (AK-11) bereits vollständig und deutlich zeitnäher leistet. Die monatliche Kontrolle bietet keinen zusätzlichen Nutzen und erkennt Fehler später.',
    vorher: 'AK-11 (tägliche Abstimmung) + AK-13 (monatlicher Abgleich, redundant)',
    nachher: 'AK-11 als führende Abstimmung — AK-13 entfällt',
    entfaelltKontrollen: ['k5-3'],
    impact: { kontrollenDelta: -1, aufwandDelta: -36, automatisierung: false, redundanzDelta: -1 },
    coverageHinweis: 'Abdeckung R5 unverändert — tägliche Abstimmung ist engmaschiger als der Monatslauf.',
  },
  {
    id: 'e7',
    typ: 'reduzieren',
    prioritaet: 'niedrig',
    titel: 'Reporting-Kontrolle als Schlüsselkontrolle entwidmen',
    risikoId: 'r5',
    betroffen: ['kq-1'],
    begruendung:
      'Die monatliche Reporting-Kontrolle des Auszahlungsvolumens (AK-14) ist eine Management-Information ohne direkten präventiven oder detektiven Kontrollcharakter für das Zahlungsrisiko. Sie wird als Schlüsselkontrolle entwidmet und als Managementinformation (Turnus quartalsweise) weitergeführt — die Kontrolldichte bei R5 wird angemessen.',
    vorher: 'AK-14 als Schlüsselkontrolle (monatlich)',
    nachher: 'AK-14 als Managementinformation außerhalb des b-IKS (quartalsweise)',
    entfaelltKontrollen: ['kq-1'],
    impact: { kontrollenDelta: -1, aufwandDelta: -20, automatisierung: false, redundanzDelta: 0 },
    coverageHinweis: 'R5 bleibt durch AK-11 und das Dublettenmonitoring vollständig abgedeckt.',
  },
  {
    id: 'e8',
    typ: 'beibehalten',
    prioritaet: 'niedrig',
    titel: 'Wirksame Kernkontrollen unverändert beibehalten',
    risikoId: 'r4',
    betroffen: ['k4-1', 'k3-1', 'k1-3'],
    begruendung:
      'Das automatisierte Sanktions-/AML-Screening (AK-09), die IBAN-/Formatprüfung (AK-06) und die Transaktionslimit-Kontrolle (AK-03) sind angemessen, wirksam und prüfungsfest formuliert. Hier besteht kein Handlungsbedarf — die Kontrollen bleiben unverändert im b-IKS.',
    vorher: 'AK-09, AK-06, AK-03 — wirksam',
    nachher: 'Unverändert beibehalten',
    entfaelltKontrollen: [],
    impact: { kontrollenDelta: 0, aufwandDelta: 0, automatisierung: false, redundanzDelta: 0 },
    coverageHinweis: 'Keine Änderung — die Kontrollen bleiben Bestandteil des Zielinventars.',
  },
];

// ===== Seed-Kollaboration (Demo) — vorbelegter Bearbeitungsstand ============
const SEED_COLLAB = {
  e1: { status: 'angenommen', assignedTo: 'jw', comments: [
    { autorId: 'jw', at: -55, text: 'Aus Compliance-Sicht korrekt — die manuelle Vollprüfung war ein Altbestand aus der Zeit vor dem automatisierten Screening. Kann entfallen.' },
    { autorId: 'sm', at: -40, text: 'Trefferbearbeitung bitte als Kontrollnachweis explizit dokumentieren, dann abnahmefähig.' },
  ] },
  e2: { status: 'in_pruefung', assignedTo: 'tk', comments: [
    { autorId: 'tk', at: -30, text: 'Fachlich sinnvoll. Ich stimme die Anpassung der Freigabemaske mit der Anwendungsbetreuung ab.' },
  ] },
  e4: { status: 'in_pruefung', assignedTo: 'tk', comments: [
    { autorId: 'sm', at: -22, text: 'Großer Hebel beim Aufwand. Vor Automatisierung bitte eine Übergangsphase mit Parallellauf einplanen.' },
  ] },
  e7: { status: 'offen', assignedTo: null, comments: [] },
};

// =============================================================================
// Agent-Vorgehenslogik (für die Verarbeitungs-Animation)
// =============================================================================
export const OPT_STEPS = [
  { id: 'einlesen',   titel: 'Bestandsinventar wird eingelesen', detail: 'Risiko- und Kontrollinventar (RCM) wird strukturiert erfasst — Risiken, Kontrollen, Art, Turnus und Aufwand.', notes: ['14 Kontrollen', '5 Risiken', 'Ausführungsart & Turnus', 'Aufwandsschätzung'] },
  { id: 'abdeckung',  titel: 'Kontrollabdeckung analysieren', detail: 'Zuordnung Kontrolle → Risiko, Prüfung auf Über- und Unterkontrolle je Risiko.', notes: ['Kontrolldichte je Risiko', 'Abdeckungslücken', 'Wesentlichkeitsbezug'] },
  { id: 'duplikate',  titel: 'Duplikate & Überlappungen erkennen', detail: 'Semantischer Abgleich der Kontrollziele — identische Wirkung, überlappende Prüfpunkte, redundante Turnusse.', notes: ['Wirkungsgleichheit', 'Überlappende Prüfpunkte', 'Redundante Turnusse'] },
  { id: 'automatisierung', titel: 'Automatisierungspotenzial bewerten', detail: 'Manuelle, aufwands- und fehlerintensive Kontrollen auf Automatisierbarkeit prüfen.', notes: ['Aufwandstreiber', 'Fehleranfälligkeit', 'Systemseitige Ablösung'] },
  { id: 'ziel',       titel: 'Zielinventar & Vorher/Nachher ableiten', detail: 'Optimiertes Kontrollinventar bei gleichbleibender Risikoabdeckung — mit Wirkung auf Aufwand und Automatisierungsgrad.', notes: ['Zielinventar', 'Restrisiko Vorher/Nachher', 'Aufwands- & Automatisierungswirkung'] },
];

// =============================================================================
// Aufbau des Optimierungs-Objekts (mit Kollaborations-Seed)
// =============================================================================
function berechneKennzahlen(kontrollen) {
  const anzahl = kontrollen.length;
  const manuell = kontrollen.filter(k => k.art === 'manuell' || k.art === 'systemgestuetzt').length;
  const automatisiert = kontrollen.filter(k => istAutomatisiert(k.art)).length;
  const aufwand = kontrollen.reduce((s, k) => s + (k.jaehrlich || 0), 0);
  const automatisierungsgrad = anzahl ? Math.round((automatisiert / anzahl) * 100) : 0;
  return { anzahl, manuell, automatisiert, aufwand, automatisierungsgrad };
}

/**
 * Baut aus Bestand + Empfehlungen das bearbeitbare Optimierungs-Objekt.
 * Das Zielinventar (Nachher) ergibt sich aus den angenommenen Empfehlungen —
 * für die Kennzahlen wird der vorgeschlagene Zielzustand (alle Empfehlungen
 * umgesetzt) zugrunde gelegt.
 */
export function buildOptimierung(input = {}, opts = {}) {
  const nowTs = opts.nowTs || Date.now();
  const seed = opts.seedKollaboration !== false;

  const empfehlungen = EMPFEHLUNGEN_ROH.map(e => {
    const collab = seed ? SEED_COLLAB[e.id] : null;
    return {
      ...e,
      status: collab?.status || 'offen',
      assignedTo: collab?.assignedTo ?? null,
      comments: (collab?.comments || []).map((c, i) => ({
        id: `oc-${e.id}-${i}`,
        autorId: c.autorId,
        text: c.text,
        at: nowTs + c.at * 60 * 1000,
      })),
    };
  });

  // Zielinventar: Kontrollen, die durch angenommene/vorgeschlagene Empfehlungen
  // entfallen bzw. deren Ausführungsart sich ändert.
  const entfallen = new Set();
  const automatisiert = new Set();
  empfehlungen.forEach(e => {
    (e.entfaelltKontrollen || []).forEach(id => entfallen.add(id));
    (e.automatisiertKontrollen || []).forEach(id => automatisiert.add(id));
  });

  const zielKontrollen = BESTAND_KONTROLLEN
    .filter(k => !entfallen.has(k.id))
    .map(k => automatisiert.has(k.id)
      ? { ...k, art: 'automatisiert', jaehrlich: Math.max(4, Math.round(k.jaehrlich * 0.2)) }
      : k);

  const vorher = berechneKennzahlen(BESTAND_KONTROLLEN);
  const nachher = berechneKennzahlen(zielKontrollen);

  const redundanzenVorher = EMPFEHLUNGEN_ROH.reduce((s, e) => s + Math.max(0, -(e.impact?.redundanzDelta || 0)), 0);

  return {
    id: `opt-${nowTs}`,
    prozessName: input.prozessName || 'Auszahlungsprozess (Bank)',
    kategorie: 'Zahlungsverkehr / Kreditgeschäft',
    regulatorik: ['MaRisk', 'GwG', 'DORA', 'BAIT'],
    quelldokument: input.quelldokument || { name: 'Risiko-Kontroll-Matrix_Auszahlung_Bestand.xlsx', typ: 'RCM / Kontrollinventar' },
    prozessDokument: input.prozessDokument || null,
    weitereInfos: input.weitereInfos || '',
    createdAt: new Date(nowTs).toISOString(),
    ergebnisIntro:
      'Das Bestandsinventar ist grundsätzlich tragfähig, weist aber Redundanzen und einen hohen Anteil manueller Kontrollen auf. Ich habe Duplikate identifiziert, überlappende Kontrollen zur Zusammenführung vorgeschlagen und die aufwendigsten manuellen Kontrollen zur Automatisierung markiert — bei durchgehend gleichbleibender Risikoabdeckung.',
    risiken: BESTAND_RISIKEN,
    bestandKontrollen: BESTAND_KONTROLLEN,
    zielKontrollen,
    empfehlungen,
    kennzahlen: {
      vorher: { ...vorher, redundanzen: redundanzenVorher },
      nachher: { ...nachher, redundanzen: 0 },
      abdeckungVorher: 100,
      abdeckungNachher: 100,
    },
  };
}

// Kennzahl-Definitionen für die Vorher/Nachher-Leiste.
export const KENNZAHL_DEFS = [
  { key: 'anzahl',              label: 'Kontrollen gesamt',    einheit: '',      besserWennKleiner: true,  icon: 'ListChecks' },
  { key: 'manuell',            label: 'Manuelle Kontrollen',  einheit: '',      besserWennKleiner: true,  icon: 'Hand' },
  { key: 'automatisierungsgrad', label: 'Automatisierungsgrad', einheit: '%',   besserWennKleiner: false, icon: 'Cpu' },
  { key: 'aufwand',            label: 'Prüfaufwand p. a.',    einheit: ' Std.', besserWennKleiner: true,  icon: 'Clock' },
  { key: 'redundanzen',        label: 'Redundanzen / Duplikate', einheit: '',   besserWennKleiner: true,  icon: 'CopyX' },
];

export const KONTROLL_TURNUS_LABEL = {
  'je-vorgang': 'Je Vorgang',
  'bei-erfassung': 'Bei Erfassung',
  'taeglich': 'Täglich',
  'woechentlich': 'Wöchentlich',
  'monatlich': 'Monatlich',
  'quartalsweise': 'Quartalsweise',
  'anlassbezogen': 'Anlassbezogen',
};
