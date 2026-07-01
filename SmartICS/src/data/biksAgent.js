// =============================================================================
// b-IKS Agent — Datenmodell für den Upload-/Analyse-Workflow
//
// Der Agent liest eine Arbeitsanweisung (bzw. ein Prozessmodell) ein und leitet
// daraus die wesentlichen Risiken und vorgeschlagenen Schlüsselkontrollen ab.
// Grundlage sind die synthetischen Beispiel-Dokumente
//   · b-IKS Agent Beispiel Arbeitsanweisung_Auszahlungsprozess
//   · b-IKS Agent Beispiel Ergebnis
//   · b-IKS Agent Beispiel Operationelle_Risiken_Framework
//   · b-IKS Agent Prompt
// Alle Inhalte sind frei erfunden (synthetische Demo-Daten).
// =============================================================================

// ===== Status-Modell für Risiken & Schlüsselkontrollen ======================
export const BIKS_STATUS = [
  { id: 'neu',            label: 'Neu',             color: '#64748B', bg: '#F1F5F9', icon: 'Circle',       hint: 'Vom Agent vorgeschlagen, noch nicht bearbeitet' },
  { id: 'in_bearbeitung', label: 'In Bearbeitung',  color: '#2563EB', bg: '#EFF6FF', icon: 'PencilLine',   hint: 'Wird fachlich geprüft und geschärft' },
  { id: 'in_abnahme',     label: 'In Abnahme',      color: '#D97706', bg: '#FFFBEB', icon: 'Clock',        hint: 'Zur Abnahme durch die 2nd Line vorgelegt' },
  { id: 'abgelehnt',      label: 'Abgelehnt',       color: '#DC2626', bg: '#FEF2F2', icon: 'XCircle',      hint: 'Nicht übernommen (z. B. nicht wesentlich)' },
  { id: 'abgenommen',     label: 'Abgenommen',      color: '#059669', bg: '#ECFDF5', icon: 'CheckCircle2', hint: 'Final abgenommen und ins b-IKS übernommen' },
];

export const STATUS_MAP = Object.fromEntries(BIKS_STATUS.map(s => [s.id, s]));
export const DEFAULT_STATUS = 'neu';

// ===== Risikofunktionslandkarte (operationelle Risiken) =====================
// Cluster gemäß Framework-Dokument. Dient der Einfärbung & Filterung.
export const RISIKO_CLUSTER = [
  { id: 'it-cyber',       name: 'IT- und Cyberrisiken',                    kurz: 'IT/Cyber',        color: '#0EA5E9' },
  { id: 'prozess',        name: 'Prozessrisiken',                          kurz: 'Prozess',         color: '#6366F1' },
  { id: 'personal',       name: 'Personalrisiken',                         kurz: 'Personal',        color: '#8B5CF6' },
  { id: 'extern',         name: 'Externe Risiken',                         kurz: 'Extern',          color: '#0F766E' },
  { id: 'recht-compliance', name: 'Rechts- und Compliance-Risiken',        kurz: 'Recht/Compliance',color: '#7C3AED' },
  { id: 'datenqualitaet', name: 'Datenqualitäts- und Reportingrisiken',    kurz: 'Datenqualität',   color: '#0891B2' },
  { id: 'betrug',         name: 'Betrugsrisiken',                          kurz: 'Betrug',          color: '#DC2626' },
  { id: 'modell',         name: 'Modellrisiken',                           kurz: 'Modell',          color: '#EA580C' },
];

export const CLUSTER_MAP = Object.fromEntries(RISIKO_CLUSTER.map(c => [c.id, c]));

// ===== Bewertungs-Skalen ====================================================
export const STUFEN = [
  { id: 'niedrig',        label: 'Niedrig',         rank: 1, color: '#059669' },
  { id: 'niedrig-mittel', label: 'Niedrig–Mittel',  rank: 1.5, color: '#65A30D' },
  { id: 'mittel',         label: 'Mittel',          rank: 2, color: '#D97706' },
  { id: 'mittel-hoch',    label: 'Mittel–Hoch',     rank: 2.5, color: '#EA580C' },
  { id: 'hoch',           label: 'Hoch',            rank: 3, color: '#DC2626' },
];
export const STUFE_MAP = Object.fromEntries(STUFEN.map(s => [s.id, s]));

// Priorität = Schaden × Eintrittswahrscheinlichkeit → Tier
// Klassische Risikomatrix-Diagonale: hoch×niedrig bzw. niedrig×hoch = mittel.
export function bewertePrioritaet(schadenId, eintrittId) {
  const s = STUFE_MAP[schadenId]?.rank || 2;
  const e = STUFE_MAP[eintrittId]?.rank || 2;
  const score = s * e;
  if (score >= 6) return { tier: 'high', label: 'Hoch', color: '#DC2626' };
  if (score >= 3) return { tier: 'mid', label: 'Mittel', color: '#D97706' };
  return { tier: 'low', label: 'Gering', color: '#059669' };
}

// ===== Kontroll-Vokabular ===================================================
export const KONTROLL_ART = [
  { id: 'praeventiv', label: 'Präventiv', color: '#1E40AF', bg: '#DBEAFE' },
  { id: 'detektiv',   label: 'Detektiv',  color: '#9A3412', bg: '#FFEDD5' },
];
export const KONTROLL_TYP = [
  { id: 'manuell',       label: 'Manuell' },
  { id: 'systemgestuetzt', label: 'Manuell (systemgestützt)' },
  { id: 'teilautomatisiert', label: 'Teilautomatisiert' },
  { id: 'automatisiert', label: 'Automatisiert' },
  { id: 'hybrid',        label: 'Automatisiert mit manueller Fallbearbeitung' },
];
export const KONTROLL_TURNUS = [
  { id: 'je-vorgang',   label: 'Je Auszahlungsvorgang' },
  { id: 'bei-erfassung',label: 'Bei Erfassung & vor Freigabe' },
  { id: 'taeglich',     label: 'Täglich bzw. nach Lauf' },
  { id: 'woechentlich', label: 'Wöchentlich' },
  { id: 'monatlich',    label: 'Monatlich' },
  { id: 'quartalsweise',label: 'Quartalsweise' },
  { id: 'anlassbezogen',label: 'Anlassbezogen' },
];

// ===== Team / Kollaboration =================================================
export const TEAM = [
  { id: 'eb', name: 'Eike Brenneisen',   rolle: 'IKS-Verantwortlicher (1st Line)',   initialen: 'EB', color: '#0F4D2A' },
  { id: 'sm', name: 'Sabine Möller',      rolle: 'Operational Risk (2nd Line)',       initialen: 'SM', color: '#7C3AED' },
  { id: 'tk', name: 'Thomas Krause',      rolle: 'Marktfolge Aktiv',                  initialen: 'TK', color: '#2563EB' },
  { id: 'jw', name: 'Julia Wagner',       rolle: 'Compliance / Geldwäscheprävention', initialen: 'JW', color: '#B91C1C' },
  { id: 'agent', name: 'b-IKS Agent',     rolle: 'KI-Assistent',                      initialen: 'AI', color: '#5A8F19' },
];
export const CURRENT_USER_DEFAULT = 'eb';
export function getTeamMember(id) { return TEAM.find(m => m.id === id) || TEAM[0]; }

// ===== Agent-Vorgehenslogik (für die Analyse-Animation) =====================
// Angelehnt an das Prompt-Dokument (Vorgehenslogik & Qualitätskriterien).
export const AGENT_STEPS = [
  {
    id: 'lesen',
    titel: 'Dokument wird eingelesen',
    detail: 'Arbeitsanweisung wird strukturiert erfasst — Kapitel, Rollen und Prozessschritte.',
    notes: ['Ziel & Zweck', 'Geltungsbereich', 'Rollen (Three Lines of Defense)', 'Prozessbeschreibung 4.1–4.5'],
  },
  {
    id: 'analyse',
    titel: 'Fachliche & regulatorische Analyse',
    detail: 'Prozess wird gegen MaRisk, DORA, GwG und die interne Kontrolllandschaft gespiegelt.',
    notes: ['MaRisk AT 4.3 / BTO', 'DORA & BAIT', 'GwG · Sanktionen · Embargo', 'Funktionstrennung & Vier-Augen-Prinzip'],
  },
  {
    id: 'identifikation',
    titel: 'Prozessinhärente Risiken identifizieren',
    detail: 'Nur Risiken mit wesentlichem finanziellen, regulatorischen oder reputativen Schaden.',
    notes: ['Betrug & Manipulation', 'Nicht erfüllte Voraussetzungen', 'Datenqualität', 'Sanktions-/AML-Screening', 'Schnittstellen & Dubletten'],
  },
  {
    id: 'wesentlichkeit',
    titel: 'Wesentlichkeit bewerten',
    detail: 'Bewertung nach Schadenshöhe und Eintrittswahrscheinlichkeit, Priorisierung nach Schaden.',
    notes: ['Schaden hoch/mittel/niedrig', 'Eintrittswahrscheinlichkeit', 'Schwelle 100.000 EUR', 'Regulatorische Relevanz'],
  },
  {
    id: 'kontrollen',
    titel: 'Schlüsselkontrollen ableiten',
    detail: 'Bestehende Kontrollen werden auf Wirksamkeit geprüft, Lücken geschlossen, Redundanzen vermieden.',
    notes: ['Wirksamkeit bestehender Kontrollen', 'Lückenanalyse', 'Präventiv / Detektiv', 'Kontrollziel & W-Fragen'],
  },
  {
    id: 'priorisierung',
    titel: 'Top-5 priorisieren & aufbereiten',
    detail: 'Die fünf wesentlichsten Risiken samt zugeordneter Schlüsselkontrollen werden strukturiert.',
    notes: ['Priorisierung 1–5', 'Prüfungs- & aufsichtstaugliche Formulierung', 'Konsistente Terminologie'],
  },
];

// ===== Risiko-Vorgaben (optional hochladbares Dokument) =====================
// Gemäß Prompt: die hochgeladene Risikofunktionslandkarte / Wesentlichkeits-
// kriterien bestimmen die Benennung der Risiken. Ohne Vorgabe greift der Agent
// auf die operationellen Risikoarten der Knowledge Base zurück.
export const BEISPIEL_VORGABEN = {
  name: 'Operationelle_Risiken_Framework.docx',
  typ: 'Risikofunktionslandkarte',
};

// Wesentlichkeitskriterien (Kurzfassung aus dem Framework-Dokument)
export const WESENTLICHKEIT_KRITERIEN = [
  { titel: 'Finanzielle Schadenshöhe', text: 'Einzelschaden ≥ 100.000 EUR bzw. kumuliert ≥ 250.000 EUR p. a.; ab 1 Mio. EUR hoch wesentlich.' },
  { titel: 'Eintrittswahrscheinlichkeit', text: 'Mindestens „mittel" (Eintritt ≥ 1× in 3 Jahren) oder > 3 gleichartige Feststellungen pro Quartal.' },
  { titel: 'Regulatorische Relevanz', text: 'Bezug zu MaRisk, BAIT, DORA, KWG, CRR, Datenschutz oder Meldewesen — unabhängig von der Schadenshöhe.' },
  { titel: 'Reputationswirkung', text: 'Öffentliches Bekanntwerden führt zu spürbarem Vertrauensverlust bei Kunden, Aufsicht oder Eigentümern.' },
  { titel: 'Kritische Prozesse', text: 'Beeinträchtigung eines Kern-/zeitkritischen Prozesses (> 4 h Unterbrechung, keine manuelle Ausweichlösung).' },
  { titel: 'Daten- & Meldewesen', text: 'Betrifft Daten für regulatorische Meldungen (COREP, FINREP, AnaCredit) oder Managemententscheidungen.' },
];

// =============================================================================
// Prozess-Bibliothek — analysierbare Eingangsdokumente
// =============================================================================

const AUSZAHLUNG = {
  id: 'auszahlungsprozess',
  name: 'Auszahlungsprozess (Bank)',
  kategorie: 'Zahlungsverkehr / Kreditgeschäft',
  dateiname: 'Arbeitsanweisung_Auszahlungsprozess.docx',
  typ: 'Arbeitsanweisung',
  regulatorik: ['MaRisk', 'GwG', 'DORA', 'BAIT'],
  kurzbeschreibung:
    'Standardisierter Auszahlungsprozess für Kredit-, Treasury- und sonstige bankfachliche Geschäftsvorfälle — von der Erfassung über die Vier-Augen-Freigabe bis zur Nachbearbeitung.',
  ergebnis_intro:
    'Nach Analyse des Auszahlungsprozesses sind die beschriebenen Basis-Kontrollen fachlich grundsätzlich passend. Für ein prüfungsfestes b-IKS habe ich die fünf wesentlichen Risiken priorisiert und nur die notwendigen Schlüsselkontrollen ergänzt bzw. geschärft, ohne Redundanzen zu erzeugen.',

  // Prozessschritte (Kapitel 4 der Arbeitsanweisung) — für Flow & Quellansicht
  prozessschritte: [
    { id: 'p1', name: 'Auszahlung erfassen', beschreibung: 'Anstoß durch die Fachabteilung, Erfassung von Geschäftsvorfall, Empfänger, Betrag, Währung, Valuta, IBAN, Vertragsreferenzen und Auflagen im führenden System; Prüfung auf Vollständigkeit und Plausibilität.' },
    { id: 'p2', name: 'Voraussetzungen prüfen', beschreibung: 'Sicherstellen aller fachlichen, rechtlichen und regulatorischen Voraussetzungen: Genehmigung, Vertragsunterlagen, Sicherheiten, Auflagen, Limits sowie Compliance-, Geldwäsche-, Sanktions- und Embargo-Prüfung.' },
    { id: 'p3', name: 'Freigabe', beschreibung: 'Dokumentierte Freigabe im Vier-Augen-Prinzip: sachliche Richtigkeit, Kompetenzordnung, Plausibilität der Zahlungsdaten und Übereinstimmung mit der Genehmigung. Sonderfreigaben sind gesondert zu begründen.' },
    { id: 'p4', name: 'Auszahlung durchführen', beschreibung: 'Übermittlung der Zahlungsanweisung an das Zahlungsverkehrssystem, technische Format- und Systemprüfungen, Ausführung unter Beachtung von Cut-off-Zeiten und Valutavorgaben.' },
    { id: 'p5', name: 'Nachbearbeitung', beschreibung: 'Prüfung von Buchung, Valuta, Empfängerdaten und Zahlungsstatus; vollständige Dokumentation; Nachverfolgung von Rückläufern, Differenzen und nicht ausgeführten Zahlungen.' },
  ],

  // Quelldokument-Abschnitte für die Ansicht „Quelle anzeigen"
  quelltext: [
    { titel: '1. Ziel und Zweck', text: 'Sicherstellen, dass Auszahlungen ausschließlich auf Grundlage genehmigter Geschäfte, vollständig erfüllter Voraussetzungen und korrekt erfasster Zahlungsdaten erfolgen — ordnungsgemäß, fristgerecht und nachvollziehbar gemäß MaRisk und internen Organisationsrichtlinien.' },
    { titel: '3. Rollen und Verantwortlichkeiten', text: 'Markt (fachlicher Anstoß), Marktfolge (unabhängige Prüfung der Voraussetzungen), Zahlungsverkehr (technische Ausführung), Compliance/Geldwäscheprävention (Screening), IKS-/Kontrollfunktion (Überwachung) und Interne Revision (risikoorientierte Prüfung) — Three Lines of Defense.' },
    { titel: '5. Kontrollen (IKS)', text: 'Präventiv: Pflichtfeld- und Plausibilitätsprüfungen, Berechtigungs- und Limitkontrollen, IBAN-/Empfängerabgleich, systemseitige Sperren, Vier-Augen-Prinzip. Detektiv: stichprobenhafte Nachkontrollen, Abgleich von Zahlungsdateien, Monitoring von Rückläufern und manuellen Übersteuerungen.' },
    { titel: '6. Risiken', text: 'Operationelle Risiken (Datenerfassung, falsche Empfängerdaten, Systemstörungen), rechtliche Risiken (fehlende Vertragsgrundlage), regulatorische Risiken (MaRisk, GwG, Sanktionen), finanzielle Risiken (Doppel-/Fehlzahlungen) und Reputationsrisiken.' },
  ],

  // ===== Ergebnis: Top-5 Risiken + Schlüsselkontrollen =====================
  risiken: [
    {
      id: 'r1',
      nummer: 1,
      titel: 'Unautorisierte oder manipulierte Auszahlung',
      risikoart: 'Betrugsrisiko',
      risikoartMarisk: 'Finanzkriminalität & Betrug',
      cluster: 'betrug',
      risikospezifikation:
        'Im Auszahlungsprozess kann durch Identitätsmissbrauch, Kompetenzüberschreitung, interne Manipulation oder Umgehung der Freigabekette eine Auszahlung an einen unberechtigten Empfänger oder in falscher Höhe veranlasst werden.',
      schaden: 'hoch',
      eintritt: 'mittel',
      wesentlichkeit:
        'Bereits einzelne Fehl- oder Betrugszahlungen können zu erheblichen Vermögensschäden, Rückforderungsaufwand, Haftungsfragen und Reputationsschäden führen. Der Prozess ist wegen manueller Anstoß- und Freigabeschritte grundsätzlich anfällig.',
      schluesselkontrollen: [
        {
          id: 'r1-k1',
          name: 'Vier-Augen-Freigabe mit Berechtigungs- und Empfängerabgleich',
          ziel: 'Sicherstellen, dass jede Auszahlung nur durch eine berechtigte zweite Instanz freigegeben wird und exakt dem genehmigten Geschäft sowie dem vorgesehenen Zahlungsempfänger entspricht.',
          art: 'praeventiv',
          typ: 'systemgestuetzt',
          turnus: 'je-vorgang',
          ansatzText: 'Präventiv, manuell mit systemischer Unterstützung, je Auszahlungsvorgang',
          was: 'Auszahlungsbetrag, Empfänger, IBAN, Valuta, Vertragsreferenz, Genehmigungslage und Kompetenzordnung.',
          wie: 'Geprüft wird durch eine zweite berechtigte Person in der Auszahlungs-/Workflow-Anwendung; die Freigabe ist nur möglich, wenn alle Pflichtangaben und die Zuordnung zum genehmigten Geschäft plausibel sind.',
          wer: 'Marktfolge bzw. freigabeberechtigte Funktion',
          abweichung: 'Fehlende Zweitfreigabe, unplausible Empfängerdaten, Abweichung zur Genehmigung, Kompetenzüberschreitung, manuelle Übersteuerung ohne Dokumentation.',
          umgang: 'Auszahlung sperren, Sachverhalt klären, ggf. Eskalation an Führungskraft/IKS/Compliance, Sonderfreigaben separat begründen.',
          dokumentation: 'Freigabeprotokoll, Audit-Trail und Begründung in der Anwendung; Kontrollnachweis revisionssicher abgelegt.',
          anwendung: 'Auszahlungs-Workflow-/Kreditverwaltungssystem',
        },
      ],
    },
    {
      id: 'r2',
      nummer: 2,
      titel: 'Auszahlung trotz nicht erfüllter Auszahlungsvoraussetzungen',
      risikoart: 'Rechts- und Compliance-Risiko',
      risikoartMarisk: 'Compliance- & Rechtsrisiko',
      cluster: 'recht-compliance',
      risikospezifikation:
        'Eine Auszahlung wird freigegeben, obwohl Vertragsunterlagen nicht wirksam unterzeichnet sind, Sicherheiten nicht bestellt oder werthaltig sind, Auflagen nicht erfüllt wurden oder Auszahlungslimits überschritten sind.',
      schaden: 'hoch',
      eintritt: 'mittel',
      wesentlichkeit:
        'Eine Auszahlung ohne wirksame Grundlage kann zu Rückabwicklungsbedarf, Verlusten, Vertragsstreitigkeiten, aufsichtsrechtlichen Feststellungen und möglichen Schadensersatzansprüchen führen.',
      schluesselkontrollen: [
        {
          id: 'r2-k1',
          name: 'Voraussetzungscheck mit systemischer Auszahlsperre',
          ziel: 'Verhindern, dass Auszahlungen vor vollständiger Erfüllung aller fachlichen, rechtlichen und regulatorischen Auszahlungsvoraussetzungen erfolgen.',
          art: 'praeventiv',
          typ: 'teilautomatisiert',
          turnus: 'je-vorgang',
          ansatzText: 'Präventiv, teils automatisiert, je Auszahlungsvorgang',
          was: 'Die für den Geschäftsvorfall definierten Auszahlungsvoraussetzungen, insbesondere Genehmigung, Vertragsunterlagen, Sicherheiten, Auflagen, Limits und erforderliche Fachfreigaben.',
          wie: 'Prüfung anhand einer verbindlichen Checkliste in der Anwendung; fehlende Pflichtnachweise oder offene Bedingungen sperren die Auszahlung systemseitig oder verhindern die Freigabe.',
          wer: 'Marktfolge',
          abweichung: 'Nicht dokumentierte oder nicht erfüllte Bedingung, fehlender Nachweis, abgelaufene Genehmigung, Limitverletzung.',
          umgang: 'Auszahlung bis zur Klärung gesperrt, Nachforderung der Unterlagen, Eskalation bei Frist- oder Grundsatzverstößen.',
          dokumentation: 'Checkliste, Nachweise und Sperrvermerke in der Auszahlungs-/Dokumentenmanagement-Anwendung.',
          anwendung: 'Auszahlungs-Workflow / Kreditaktenmanagement',
        },
      ],
    },
    {
      id: 'r3',
      nummer: 3,
      titel: 'Falsche Empfänger-, Betrags- oder Zahlungsdaten',
      risikoart: 'Datenqualitäts- und Prozessrisiko',
      risikoartMarisk: 'Operationelles Risiko',
      cluster: 'datenqualitaet',
      risikospezifikation:
        'Durch fehlerhafte Erfassung oder Übernahme von IBAN, Empfängername, Betrag, Währung, Valuta oder Vertragsreferenz kann die Auszahlung an den falschen Empfänger, in falscher Höhe oder mit falscher Wertstellung erfolgen.',
      schaden: 'hoch',
      eintritt: 'mittel',
      wesentlichkeit:
        'Fehlgeleitete Zahlungen können zu Verlusten, Rückholkosten, Zinsnachteilen, Kundenbeschwerden und Reputationsschäden führen; bei Kredit-/Treasury-Auszahlungen ist die finanzielle Relevanz regelmäßig wesentlich.',
      schluesselkontrollen: [
        {
          id: 'r3-k1',
          name: 'Systemseitige Pflichtfeld-, Plausibilitäts- und IBAN-Prüfung',
          ziel: 'Sicherstellen, dass nur vollständige und plausible Zahlungsdaten in die Auszahlung gelangen und typische Eingabefehler frühzeitig abgefangen werden.',
          art: 'praeventiv',
          typ: 'automatisiert',
          turnus: 'bei-erfassung',
          ansatzText: 'Präventiv, automatisiert, bei Erfassung und vor Freigabe',
          was: 'Vollständigkeit und formale/logische Plausibilität aller zahlungsrelevanten Daten sowie deren Übereinstimmung mit den genehmigten Unterlagen.',
          wie: 'Prüfung in der führenden Anwendung und im Zahlungsverkehrssystem über Pflichtfelder, IBAN-/Formatprüfung, Betragsgrenzen, Währungslogik und Referenzabgleich.',
          wer: 'Systemgestützt im Fachbereich; Endkontrolle durch Marktfolge',
          abweichung: 'Fehlendes Pflichtfeld, unplausibler Betrag, abweichende IBAN/Empfängerreferenz, inkonsistente Valuta/Währung.',
          umgang: 'Erfassung/Freigabe blockieren, Korrektur durch Fachbereich, erneute Prüfung vor Freigabe.',
          dokumentation: 'Systemprotokoll, Fehlerliste bzw. Ausnahmejournal, Korrekturvermerk.',
          anwendung: 'Führendes Auszahlungs-/Zahlungsverkehrssystem',
        },
      ],
    },
    {
      id: 'r4',
      nummer: 4,
      titel: 'Unterlassene oder fehlerhafte Sanktions-, Embargo- oder AML-Prüfung',
      risikoart: 'Rechts- und Compliance-Risiko',
      risikoartMarisk: 'Compliance- & Rechtsrisiko',
      cluster: 'recht-compliance',
      risikospezifikation:
        'Eine Auszahlung wird an einen sanktionierten, embargobehafteten oder anderweitig auffälligen Empfänger veranlasst, weil die erforderliche Screening-Prüfung nicht erfolgt, nicht vollständig ist oder ein Treffer nicht ordnungsgemäß bearbeitet wurde.',
      schaden: 'hoch',
      eintritt: 'niedrig-mittel',
      wesentlichkeit:
        'Mögliche Folgen sind aufsichtsrechtliche Maßnahmen, Geldbußen, Blockierung von Zahlungen, Meldepflichten und erhebliche Reputationsschäden. Aufgrund der regulatorischen Relevanz ist das Risiko unabhängig von der finanziellen Einzelschadenshöhe wesentlich.',
      schluesselkontrollen: [
        {
          id: 'r4-k1',
          name: 'Verbindliche Screening-Freigabe vor Auszahlung',
          ziel: 'Gewährleisten, dass keine Auszahlung ohne wirksame Sanktions-/Embargo-/AML-Prüfung und dokumentierte Freigabe erfolgt.',
          art: 'praeventiv',
          typ: 'hybrid',
          turnus: 'je-vorgang',
          ansatzText: 'Präventiv, automatisiert mit manueller Fallbearbeitung, je Auszahlungsvorgang',
          was: 'Ob für den Auszahlungsempfänger bzw. die Transaktion ein positives Screening-Ergebnis oder eine dokumentierte Entwarnung vorliegt.',
          wie: 'Kontrolle über das Sanktions-/AML-Screeningtool und die vorgelagerte Freigabelogik; bei Treffern oder offenen Fällen darf keine Auszahlung erfolgen.',
          wer: 'Automatisierte Prüfung, Bearbeitung von Treffern durch Compliance/Geldwäscheprävention',
          abweichung: 'Fehlendes Screening-Ergebnis, offener Treffer, abgelaufene Freigabe, manuelle Übersteuerung ohne Genehmigung.',
          umgang: 'Zahlung sperren, Trefferbearbeitung und Eskalation an Compliance, ggf. Meldung gemäß internen Vorgaben.',
          dokumentation: 'Screening-Ergebnis, Fallbearbeitung, Freigabe- oder Sperrvermerk in der Anwendung.',
          anwendung: 'Sanktions-/AML-Screeningtool und Workflow-Anwendung',
        },
      ],
    },
    {
      id: 'r5',
      nummer: 5,
      titel: 'System- oder Schnittstellenfehler mit Doppel- oder Fehlverarbeitung',
      risikoart: 'IT- und Cyberrisiko',
      risikoartMarisk: 'Operationelles Risiko',
      cluster: 'it-cyber',
      risikospezifikation:
        'Fehler in der Übermittlung vom führenden System an das Zahlungsverkehrssystem, Schnittstellenstörungen, Dubletten oder fehlerhafte Systemverarbeitung können dazu führen, dass Zahlungen doppelt, unvollständig oder gar nicht ausgeführt werden.',
      schaden: 'hoch',
      eintritt: 'niedrig-mittel',
      wesentlichkeit:
        'Doppelte Auszahlungen, nicht erkannte Fehlausführungen oder verzögerte Zahlungen können hohe Vermögensschäden, Korrekturaufwand und Kunden-/Kontrahentenbeschwerden verursachen. Der Prozess ist zeitkritisch und aufsichtsrelevant.',
      schluesselkontrollen: [
        {
          id: 'r5-k1',
          name: 'Tägliche Schnittstellen- und Zahlungsdateiabstimmung mit Dublettenmonitoring',
          ziel: 'Sicherstellen, dass freigegebene Auszahlungen vollständig, einmalig und korrekt im Zahlungsverkehr verarbeitet werden.',
          art: 'detektiv',
          typ: 'hybrid',
          turnus: 'taeglich',
          ansatzText: 'Detektiv, automatisiert mit manueller Nachbearbeitung, täglich bzw. nach Lauf',
          was: 'Abgleich zwischen freigegebenen Auszahlungsfällen, übermittelten Zahlungsdateien und tatsächlich ausgeführten Buchungen.',
          wie: 'Kontrolle über eine Abstimmungsanwendung bzw. Auswertungen im Zahlungsverkehrssystem; Dubletten, fehlende Läufe, Fehlbuchungen und technische Rejects werden identifiziert.',
          wer: 'Zahlungsverkehr/Operations; technische Ursachen durch IT/Anwendungsbetrieb',
          abweichung: 'Nicht gematchte Positionen, doppelte Ausführung, Rejects, Teilverarbeitungen, Buchungsdifferenzen.',
          umgang: 'Sofortige Analyse, Stopp weiterer Läufe bei systemischem Fehler, Korrekturbuchung/Storno, Eskalation an IT und Fachbereich.',
          dokumentation: 'Abstimmreport, Fehler-/Incident-Ticket, Korrektur- und Freigabenachweis.',
          anwendung: 'Zahlungsverkehrssystem und Abstimmungs-/Monitoring-Anwendung',
        },
      ],
    },
  ],
};

export const PROZESS_BIBLIOTHEK = [AUSZAHLUNG];

export function findProzess(prozessId) {
  return PROZESS_BIBLIOTHEK.find(p => p.id === prozessId) || null;
}

// Einfache Heuristik: Dateiname → Prozess der Bibliothek.
export function matchProzess(filename = '') {
  const n = filename.toLowerCase();
  if (n.includes('auszahl')) return AUSZAHLUNG;
  // Fallback für die Demo: der Auszahlungsprozess ist das referenzierte Beispiel.
  return AUSZAHLUNG;
}

// =============================================================================
// Analyse-Objekt aufbauen (angereichert um Status, Historie & Kommentare)
// =============================================================================

function makeComment(autorId, text, tsOffsetMin, nowTs) {
  return {
    id: `c-${autorId}-${tsOffsetMin}`,
    autorId,
    text,
    at: nowTs - tsOffsetMin * 60 * 1000,
  };
}

function makeStatusEvent(status, autorId, tsOffsetMin, nowTs, note) {
  return { status, autorId, at: nowTs - tsOffsetMin * 60 * 1000, note };
}

let _vseq = 0;
function makeVersion(autorId, aktion, changes, tsOffsetMin, nowTs) {
  return { id: `v-seed-${nowTs}-${_vseq++}`, at: nowTs - tsOffsetMin * 60 * 1000, autorId, aktion, changes };
}

/**
 * Baut aus einem Prozess der Bibliothek das bearbeitbare Analyse-Objekt.
 * @param {object} prozess  Eintrag aus PROZESS_BIBLIOTHEK
 * @param {object} input    { prozessName, weitereInfos, risikoVorgaben, quelldokument }
 * @param {object} opts     { nowTs, seedKollaboration }
 */
export function buildAnalyse(prozess, input = {}, opts = {}) {
  const nowTs = opts.nowTs || Date.now();
  const seed = opts.seedKollaboration !== false;
  // Sind Risiko-Vorgaben (Risikofunktionslandkarte) hinterlegt, benennt der Agent
  // die Risiken entsprechend dieser (siehe Prompt). Ohne Vorgabe greift er auf die
  // operationellen Risikoarten der Knowledge Base zurück (Fallback-Benennung).
  const hatVorgaben = !!input.risikoVorgaben;

  const risiken = prozess.risiken.map((r, idx) => {
    const risikoart = hatVorgaben ? r.risikoart : (r.risikoartMarisk || r.risikoart);
    // Etwas gestreute Demo-Kollaboration, damit Status/Kommentare sichtbar sind.
    let status = DEFAULT_STATUS;
    let statusHistorie = [makeStatusEvent('neu', 'agent', 30, nowTs, 'Vom b-IKS Agent vorgeschlagen')];
    let comments = [];

    if (seed) {
      if (idx === 0) {
        status = 'in_bearbeitung';
        statusHistorie.push(makeStatusEvent('in_bearbeitung', 'tk', 18, nowTs, 'Fachliche Prüfung gestartet'));
        comments = [
          makeComment('tk', 'Vier-Augen-Freigabe ist bei uns bereits produktiv — ich schärfe die Empfängerabgleich-Logik noch nach.', 16, nowTs),
          makeComment('sm', 'Bitte den Umgang mit Sonderfreigaben (manuelle Übersteuerung) explizit dokumentieren, das prüft die Revision regelmäßig.', 9, nowTs),
        ];
      } else if (idx === 3) {
        status = 'in_abnahme';
        statusHistorie.push(makeStatusEvent('in_abnahme', 'jw', 12, nowTs, 'Zur Abnahme an Compliance'));
        comments = [
          makeComment('jw', 'Screening-Freigabe vor Auszahlung ist regulatorisch zwingend — aus Compliance-Sicht abnahmefähig.', 11, nowTs),
        ];
      }
    }

    const schluesselkontrollen = r.schluesselkontrollen.map((k, ki) => ({
      ...k,
      status: (seed && idx === 3) ? 'in_abnahme' : DEFAULT_STATUS,
      statusHistorie: [makeStatusEvent('neu', 'agent', 30, nowTs, 'Vorgeschlagene Schlüsselkontrolle')],
      comments: [],
      vorgeschlagen: true,
      custom: false,
    }));

    // Versionshistorie (für den Schieberegler). Zwei Risiken erhalten einen
    // vollständigen Beispiel-Verlauf mit allen Änderungstypen (neu/geändert/gelöscht).
    const kName = schluesselkontrollen[0]?.name;
    const createVersion = makeVersion('agent', 'Risiko vom b-IKS Agent erstellt', [
      { type: 'added', feld: 'Risiko identifiziert', neu: r.titel },
      { type: 'added', feld: 'Schlüsselkontrolle vorgeschlagen', neu: kName },
    ], seed && (idx === 0 || idx === 3) ? 190 : 30, nowTs);

    let versionen;
    if (seed && idx === 0) {
      versionen = [
        createVersion,
        makeVersion('tk', 'Status geändert', [{ type: 'changed', feld: 'Status', alt: 'Neu', neu: 'In Bearbeitung' }], 95, nowTs),
        makeVersion('tk', 'Risiko bearbeitet', [{ type: 'changed', feld: 'Risikospezifikation', alt: 'Auszahlung an einen unberechtigten Empfänger ist möglich.', neu: r.risikospezifikation }], 82, nowTs),
        makeVersion('sm', 'Schlüsselkontrolle ergänzt', [{ type: 'added', feld: 'Schlüsselkontrolle', neu: 'Transaktionslimit-Kontrolle für Auszahlungen' }], 64, nowTs),
        makeVersion('tk', 'Kontrolle bearbeitet — Transaktionslimit-Kontrolle für Auszahlungen', [{ type: 'changed', feld: 'Kontrolle: Turnus', alt: 'Täglich bzw. nach Lauf', neu: 'Je Auszahlungsvorgang' }], 50, nowTs),
        makeVersion('sm', 'Schlüsselkontrolle entfernt', [{ type: 'removed', feld: 'Schlüsselkontrolle', alt: 'Transaktionslimit-Kontrolle für Auszahlungen (redundant zur Vier-Augen-Freigabe)' }], 38, nowTs),
        makeVersion('tk', 'Kommentar hinzugefügt', [{ type: 'added', feld: 'Kommentar', neu: comments[0]?.text }], 16, nowTs),
        makeVersion('sm', 'Kommentar hinzugefügt', [{ type: 'added', feld: 'Kommentar', neu: comments[1]?.text }], 9, nowTs),
      ];
    } else if (seed && idx === 3) {
      versionen = [
        createVersion,
        makeVersion('jw', 'Schlüsselkontrolle ergänzt', [{ type: 'added', feld: 'Schlüsselkontrolle', neu: 'Manuelle Nachkontrolle der Sanktionstreffer' }], 88, nowTs),
        makeVersion('sm', 'Risiko bearbeitet', [{ type: 'changed', feld: 'Begründung der Wesentlichkeit', alt: 'Regulatorisch relevant; Schaden hoch.', neu: r.wesentlichkeit }], 70, nowTs),
        makeVersion('jw', `Kontrolle bearbeitet — ${kName}`, [{ type: 'changed', feld: 'Kontrolle: Anwendung', alt: 'Sanktions-/AML-Screeningtool', neu: 'Sanktions-/AML-Screeningtool und Workflow-Anwendung' }], 55, nowTs),
        makeVersion('sm', 'Schlüsselkontrolle entfernt', [{ type: 'removed', feld: 'Schlüsselkontrolle', alt: 'Manuelle Nachkontrolle der Sanktionstreffer (durch automatisiertes Screening abgedeckt)' }], 42, nowTs),
        makeVersion('tk', 'Status geändert', [{ type: 'changed', feld: 'Status', alt: 'Neu', neu: 'In Bearbeitung' }], 30, nowTs),
        makeVersion('jw', `Kontroll-Status geändert — ${kName}`, [{ type: 'changed', feld: 'Kontroll-Status', alt: 'Neu', neu: 'In Abnahme' }], 20, nowTs),
        makeVersion('jw', 'Status geändert', [{ type: 'changed', feld: 'Status', alt: 'In Bearbeitung', neu: 'In Abnahme' }], 12, nowTs),
        makeVersion('jw', 'Kommentar hinzugefügt', [{ type: 'added', feld: 'Kommentar', neu: comments[0]?.text }], 11, nowTs),
      ];
    } else {
      versionen = [createVersion];
    }

    return {
      ...r,
      risikoart,
      status,
      statusHistorie,
      comments,
      schluesselkontrollen,
      versionen,
    };
  });

  return {
    id: `analyse-${nowTs}`,
    prozessId: prozess.id,
    prozessName: input.prozessName || prozess.name,
    kategorie: prozess.kategorie,
    typ: prozess.typ,
    regulatorik: prozess.regulatorik,
    kurzbeschreibung: prozess.kurzbeschreibung,
    ergebnisIntro: prozess.ergebnis_intro,
    prozessschritte: prozess.prozessschritte,
    quelltext: prozess.quelltext,
    weitereInfos: input.weitereInfos || '',
    risikoVorgaben: input.risikoVorgaben || null,
    quelldokument: input.quelldokument || { name: prozess.dateiname, typ: prozess.typ },
    createdAt: new Date(nowTs).toISOString(),
    risiken,
  };
}

// Leere Schlüsselkontrolle für „Kontrolle ergänzen"
export function emptyKontrolle(nowTs = Date.now()) {
  return {
    id: `k-custom-${nowTs}`,
    name: '',
    ziel: '',
    art: 'praeventiv',
    typ: 'manuell',
    turnus: 'je-vorgang',
    ansatzText: '',
    was: '',
    wie: '',
    wer: '',
    abweichung: '',
    umgang: '',
    dokumentation: '',
    anwendung: '',
    status: DEFAULT_STATUS,
    statusHistorie: [],
    comments: [],
    vorgeschlagen: false,
    custom: true,
  };
}
