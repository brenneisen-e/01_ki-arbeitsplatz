/**
 * StepIntroCard — Breite Info-Kachel oben in jedem Prozess-Teilschritt.
 *
 * Zeigt:
 *  - Überschrift & Kurzbeschreibung des Schritts
 *  - Liste der "zu erledigenden" Aufgaben (was muss der Bearbeiter tun?)
 *  - Liste der KI-Unterstützung (wo greift die KI dem Bearbeiter unter die Arme?)
 *
 * Usage:  <StepIntroCard stepKey="kyc" />
 */

import { useState } from 'react';
import {
  FileText, ShieldCheck, FileSearch, BarChart3, Lock,
  ClipboardList, Gavel, FileSignature, Activity, Sparkles,
  CheckCircle2, ChevronDown, ChevronUp,
} from 'lucide-react';

const STEP_INFO = {
  application: {
    icon: FileText,
    title: 'Kreditantrag erfassen',
    subtitle: 'Schritt 1 — Demand Management / Contact & Pre-Assessment',
    description: 'Strukturierte Aufnahme aller antragsrelevanten Stammdaten des Kunden, der Geschäftsführung, des Kreditwunschs und bestehender Verbindlichkeiten. Grundlage für alle folgenden Prüfungen und die KI-gestützte Voranalyse.',
    tasks: [
      'Firmendaten erfassen (Firma, Rechtsform, HRB, Sitz, Gründungsjahr)',
      'Geschäftsführer & Gesellschafter erfassen (inkl. Anteile, Funktion, Branchenerfahrung)',
      'Kreditwunsch definieren (Art, Betrag, Laufzeit, Verwendung)',
      'Bestehende Verbindlichkeiten & Sicherheiten vorerfassen',
      'Unterlagen (Bilanz, BWA, Handelsregister) anhängen',
    ],
    ki: [
      'Automatische Dokumentenerkennung (OCR + LLM) befüllt Stammdatenfelder vor',
      'Jedes KI-vorbefüllte Feld zeigt per Klick die Quelle im Dokument (gelbe Markierung)',
      'Vollständigkeitsprüfung gem. §18 KWG (Schwelle 750 T€) in Echtzeit',
      'Plausibilitätsprüfung der Pflichtfelder, Warnung bei Inkonsistenzen',
    ],
  },
  kyc: {
    icon: ShieldCheck,
    title: 'KYC & Compliance',
    subtitle: 'Schritt 2 — Gathering Customer Data / Know Your Customer',
    description: 'Gesetzlich vorgeschriebene Identitäts- und Legitimationsprüfung gem. GwG und KWG. Prüfung auf PEP, Sanktionslisten und Ermittlung der wirtschaftlich Berechtigten (UBO).',
    tasks: [
      'Identitäts-Checkliste abarbeiten (Handelsregister, Gesellschaftervertrag, Ausweiskopie, …)',
      'Wirtschaftlich Berechtigte (UBO) aus Beteiligungsstruktur ermitteln & Transparenzregister abgleichen',
      'PEP-Screening aller Gesellschafter und Geschäftsführer',
      'Sanktionslisten-Abgleich (EU / UN / OFAC)',
      'Pro Dokument: Prüfung durch Compliance-Mitarbeiter (Prüfer-Kürzel + Datum)',
    ],
    ki: [
      'OCR & Entity-Extraktion aus den hochgeladenen Legitimationsdokumenten',
      'Automatischer Abgleich Handelsregister ↔ Transparenzregister ↔ Ausweis',
      'Automatisches PEP- & Sanktions-Screening gegen Weltregister (Dow Jones, Worldcheck)',
      'UBO-Berechnung aus Kapital-/Stimmrechtsstrukturen (Durchgriffsregel)',
      'Jede KI-Freigabe erhält Pflicht-Vier-Augen-Prüfung (Human-in-the-Loop)',
    ],
  },
  analysis: {
    icon: FileSearch,
    title: '§18 KWG Prüfung — Bilanz- & BWA-Analyse',
    subtitle: 'Schritt 3 — Gathering Customer Data / Financial Deep-Dive',
    description: 'Offenlegung der wirtschaftlichen Verhältnisse gemäß §18 KWG. Drei-Jahres-Vergleich der Jahresabschlüsse, BWA-Auswertung, Kennzahlen und Kapitaldienstfähigkeit.',
    tasks: [
      'Jahresabschlüsse 2021–2023 einlesen & extrahieren (Bilanz, GuV)',
      'Aktuelle BWA analysieren',
      'Kennzahlen berechnen (EK-Quote, DSCR, Liquidität, Dynamischer Verschuldungsgrad …)',
      'Kapitaldienstfähigkeit im Basis-, Stress- und Worst-Case berechnen',
      'Branchenvergleich anstellen, narrative Analyse verfassen',
    ],
    ki: [
      'Automatische Bilanz-Extraktion aus PDF-Jahresabschlüssen (OCR + LLM)',
      'Kennzahlen werden deterministisch berechnet (keine Blackbox)',
      'Narrative Bilanzanalyse & Kommentierung durch LLM — auditierbar, mit Quellenangaben',
      'Branchenbenchmark automatisch aus Bankdatenbank (anhand WZ-Code) gezogen',
      'KI-Erkennung von Auffälligkeiten (z. B. Margendruck, Working-Capital-Anstieg)',
    ],
  },
  rating: {
    icon: BarChart3,
    title: 'Rating',
    subtitle: 'Schritt 4 — Credit Analysis & Evaluation',
    description: 'Ermittlung des internen Ratings aus quantitativen Kennzahlen und qualitativen Faktoren (Management, Markt, Produkt). Ergebnis: Rating-Klasse mit zugeordneter Ausfallwahrscheinlichkeit (PD).',
    tasks: [
      'Quantitatives Rating aus Bilanzkennzahlen generieren',
      'Qualitatives Rating (Managementqualität, Marktposition, Produktstärke) einschätzen',
      'Eigentümer-Rating (Creditreform, Schufa) einholen',
      'Kontoführungsscore prüfen',
      'Bei Bedarf Override mit Begründung vornehmen',
    ],
    ki: [
      'Quantitatives Rating-Modell (Scorecard) errechnet PD-Klasse',
      'KI-Vorschlag für qualitative Komponenten aus Managementgesprächs-Notizen',
      'Automatische Anbindung Creditreform/Schufa für Eigentümer-Rating',
      'Override durch Bearbeiter möglich — begründungspflichtig und protokolliert',
    ],
  },
  collateral: {
    icon: Lock,
    title: 'Sicherheiten',
    subtitle: 'Schritt 5 — Credit Analysis & Evaluation',
    description: 'Erfassung, Bewertung und Beleihungsgrad-Berechnung aller angebotenen Sicherheiten. Ermittlung des Blankoanteils und der Gesamtdeckung.',
    tasks: [
      'Immobiliensicherheiten erfassen und Objektunterlagen hochladen (Energieausweis, Mieterliste, Objekt-Cashflow)',
      'Sonstige Sicherheiten erfassen (Bürgschaft, Abtretung, Sicherungsübereignung, …)',
      'Marktwert aus Gutachten / interner Bewertung eintragen',
      'Vorlasten berücksichtigen',
      'Beleihungswerte mit Haircut-Tabelle berechnen',
      'Deckungsgrad und Blankoanteil ableiten',
    ],
    ki: [
      'Objektunterlagen werden ausgelesen: jährlicher Cashflow, Mieterträge, Leerstandsquote und Energiekennwerte landen in den Feldern',
      'Jedes vorbefüllte Feld zeigt per Klick seine Fundstelle im Dokument (gelbe Markierung)',
      'Haircut-Empfehlung automatisch aus institutsinterner Tabelle (pro Sicherheitenart)',
      'Auto-Plausibilisierung: Mieterliste gegen Objekt-Cashflow, Marktwert gegen Verkehrswert-Gutachten',
      'Warnung bei übermäßigem Blankoanteil oder Kompetenzüberschreitung',
    ],
  },
  'credit-proposal': {
    icon: ClipboardList,
    title: 'Kreditempfehlung',
    subtitle: 'Schritt 6 — Approval & Negotiation',
    description: 'Zusammenfassung aller vorhergehenden Analysen in einer Kreditvorlage inkl. Finanzierungsstruktur, Konditionenberechnung und Empfehlung.',
    tasks: [
      'Finanzierungsstruktur entwerfen (Investitionssumme, Eigenanteil, Kreditanteil)',
      'Konditionen kalkulieren (Zins-Kalkulation, Refi, Marge, Standardrisiko)',
      'Marktkonditionen-Vergleich durchführen',
      'Tilgungsplan erstellen',
      'Kreditvorlage-Text entwerfen',
    ],
    ki: [
      'KI-Kreditempfehlung generiert vollständigen Vorlagentext aus allen vorherigen Schritten',
      'Automatische Konditionen-Optimierung im Branchenrahmen',
      'Tilgungsplan-Generator mit Stress-Szenarien',
    ],
  },
  decision: {
    icon: Gavel,
    title: 'Kreditentscheidung',
    subtitle: 'Schritt 7 — Approval & Negotiation',
    description: 'Dualer Votierungsprozess (Markt & Marktfolge) und finale Genehmigung durch den zuständigen Kompetenzträger gem. Kompetenzmatrix.',
    tasks: [
      'Erstvotum (Markt) ausfüllen, begründen und digital signieren',
      'Zweitvotum (Marktfolge) unabhängig ausfüllen',
      'Auflagen & Covenants festlegen',
      'Kompetenzträger-Entscheidung (Genehmigung oder Ablehnung)',
    ],
    ki: [
      'Kompetenzmatrix-Ermittlung (richtiger Genehmiger anhand Betrag + Rating)',
      'Votierungs-Plausibilisierung: KI erkennt Divergenzen zwischen Erst- und Zweitvotum',
      '"KI-Kreditempfehlung"-Button: generiert vollständigen Votum-Text auf Knopfdruck',
      'Finale Entscheidung immer durch Mensch (§22 DSGVO konform)',
    ],
  },
  contract: {
    icon: FileSignature,
    title: 'Kreditvertrag',
    subtitle: 'Schritt 8 — Draft & Close Contract',
    description: 'Erstellung des Kreditvertrags auf Basis der LMA-Standardvorlage (STANDARD LOAN AGREEMENT). Einbindung aller Covenants, Sicherheiten und Auszahlungsbedingungen.',
    tasks: [
      'Kreditvertrag aus Vorlage generieren und vorausfüllen',
      'Vertragsklauseln prüfen (Covenants, Kündigungsrechte, Sicherheitenverträge)',
      'Rechtsabteilung zur Freigabe vorlegen',
      'Vertrag bankseitig unterzeichnen und zur Gegenzeichnung an den Kreditnehmer versenden',
    ],
    ki: [
      'Automatisches Befüllen der LMA-Standardvorlage mit Antrags- und Entscheidungsdaten',
      'Klauselvorschläge passend zu Rating, Branche und Sicherheitenstruktur',
      'Konsistenzprüfung: Auszahlungsbedingungen vs. festgelegte Auflagen',
    ],
  },
  signature: {
    icon: FileSignature,
    title: 'Unterschrift / Rückläufer',
    subtitle: 'Schritt 9 — Signature Management & Contract Return',
    description: 'Der bankseitig unterschriebene Vertrag ist an den Kreditnehmer versandt. In diesem Schritt wird auf die Rücksendung des gegengezeichneten Vertrags gewartet und anschließend die Auszahlungsfreigabe vorbereitet.',
    tasks: [
      'Status des Rückläufers überwachen (14-Tage-Frist)',
      'Unterzeichneten Vertrag vom Kreditnehmer entgegennehmen',
      'Unterschriften und Anlagen auf Vollständigkeit prüfen',
      'Auszahlungsvoraussetzungen final abgleichen und Vertrag archivieren',
    ],
    ki: [
      'Automatische Fristen- und Erinnerungsüberwachung bei ausbleibendem Rückläufer',
      'OCR- und Plausibilitätsprüfung der eingegangenen Unterschriften',
      'Konsistenzabgleich zwischen versandtem und zurückgesandtem Vertragstext',
    ],
  },
  monitoring: {
    icon: Activity,
    title: 'Monitoring & Frühwarnung',
    subtitle: 'Schritt 10 — Aftercare & Monitoring',
    description: 'Laufende Überwachung des Kreditengagements: Frühwarnindikatoren, Rating-Migration, Covenant-Einhaltung und Watchlist-Management.',
    tasks: [
      'Frühwarnindikatoren überwachen (Kontoumsätze, BWA, Branchennachrichten)',
      'Jahresabschluss-Update einholen & Rating-Migration prüfen',
      'Covenant-Compliance quartalsweise prüfen',
      'Auffälligkeiten in die Watchlist überführen',
    ],
    ki: [
      'Automatische Frühwarnindikatoren aus Kontoumsätzen & BWA',
      'Branchenmonitoring aus News- und Creditreform-Feeds',
      'Rating-Migration bei neuem Jahresabschluss automatisch — bei >2 Klassen Verschlechterung Pflicht-Vier-Augen-Prüfung',
    ],
  },
};

export default function StepIntroCard({ stepKey }) {
  const info = STEP_INFO[stepKey];
  const [expanded, setExpanded] = useState(true);
  if (!info) return null;
  const Icon = info.icon;

  return (
    <div className="surface-card overflow-hidden mb-6">
      {/* Header */}
      <div className="flex items-start gap-4 p-5">
        <div className="w-11 h-11 rounded-xl bg-primary text-white flex items-center justify-center shrink-0">
          <Icon size={20} strokeWidth={1.5} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[11px] uppercase tracking-wider font-medium text-text-muted">
            {info.subtitle}
          </p>
          <h2 className="text-lg font-medium font-headline text-text-primary mt-0.5">
            {info.title}
          </h2>
          <p className="text-sm text-text-secondary mt-1 leading-relaxed">
            {info.description}
          </p>
        </div>
        <button
          type="button"
          onClick={() => setExpanded(v => !v)}
          className="p-1.5 rounded-lg text-text-muted hover:text-text-primary hover:bg-surface-inset transition-colors shrink-0"
          title={expanded ? 'Einklappen' : 'Ausklappen'}
        >
          {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>
      </div>

      {/* Body */}
      {expanded && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-0 border-t border-border">
          {/* Aufgaben */}
          <div className="p-5 border-b lg:border-b-0 lg:border-r border-border">
            <div className="flex items-center gap-2 mb-2.5">
              <div className="w-6 h-6 rounded-md bg-[var(--mode-pastel)] flex items-center justify-center">
                <CheckCircle2 size={14} strokeWidth={1.75} className="text-primary" />
              </div>
              <h3 className="text-sm font-medium font-headline text-text-primary">
                Was in diesem Schritt zu tun ist
              </h3>
            </div>
            <ul className="space-y-1.5">
              {info.tasks.map((t, i) => (
                <li key={i} className="flex items-start gap-2 text-[13px] text-text-secondary">
                  <span className="font-mono text-[11px] text-text-muted mt-0.5 shrink-0 w-4">{i + 1}.</span>
                  <span>{t}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* KI-Unterstützung */}
          <div className="p-5 bg-surface">
            <div className="flex items-center gap-2 mb-2.5">
              <div className="w-6 h-6 rounded-md bg-violet-50 flex items-center justify-center">
                <Sparkles size={14} strokeWidth={1.75} className="text-violet-600" />
              </div>
              <h3 className="text-sm font-medium font-headline text-text-primary">
                Wo die KI dir hilft
              </h3>
            </div>
            <ul className="space-y-1.5">
              {info.ki.map((k, i) => (
                <li key={i} className="flex items-start gap-2 text-[13px] text-text-secondary">
                  <Sparkles size={11} strokeWidth={1.75} className="text-violet-500 mt-1 shrink-0" />
                  <span>{k}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
