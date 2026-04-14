/**
 * ComplianceView — Compliance-Sicht auf alle KI-Funktionen im Kreditprozess.
 *
 * Zeigt pro Prozessschritt, an welchen Stellen KI-Komponenten zum Einsatz kommen,
 * welche Datenquellen sie nutzen, welche regulatorischen Anforderungen gelten und
 * welche menschliche Kontrolle (Human-in-the-Loop) vorgesehen ist.
 *
 * Ziel: Transparenz & Auditierbarkeit der KI-gestützten Entscheidungsprozesse
 * gemäß EU AI Act, MaRisk AT 4.3.1, BAIT sowie DSGVO Art. 22.
 */

import {
  Shield,
  Sparkles,
  FileSearch,
  CheckCircle2,
  AlertTriangle,
  Info,
  Database,
  UserCheck,
  ArrowRight,
  ShieldCheck,
  ClipboardCheck,
  Scale,
  Bot,
  Eye,
  Lock,
  FileText,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import KPIBox from '../shared/KPIBox';

// ---------------------------------------------------------------------------
// Prozessschritte mit KI-Funktionen
// ---------------------------------------------------------------------------

const PROCESS_STEPS = [
  {
    key: 'application',
    name: '1. Kreditantrag',
    view: 'application',
    icon: FileText,
    kiFunctions: [
      {
        name: 'Automatische Dokumentenerkennung (OCR + LLM)',
        purpose: 'Extraktion von Stammdaten aus Handelsregisterauszug, Ausweiskopien, Bilanzen',
        sources: ['Hochgeladene PDFs/Scans', 'Handelsregister (öffentlich)', 'Creditreform-Schnittstelle'],
        risk: 'limited',
        humanControl: '4-Augen-Freigabe der extrahierten Stammdaten durch Firmenkundenberater',
      },
      {
        name: 'Vollständigkeitsprüfung',
        purpose: 'Prüft, ob alle Pflichtunterlagen gemäß §18 KWG vorliegen',
        sources: ['Dokumenten-Checkliste', 'Kreditbetrag (Schwellenwert 750.000 €)'],
        risk: 'minimal',
        humanControl: 'Automatisch, mit manueller Nachkorrektur möglich',
      },
    ],
  },
  {
    key: 'kyc',
    name: '2. KYC & Compliance',
    view: 'kyc',
    icon: ShieldCheck,
    kiFunctions: [
      {
        name: 'KI-Legitimationsprüfung',
        purpose: 'Abgleich Ausweiskopie mit Handelsregister & Transparenzregister',
        sources: ['Handelsregister', 'Transparenzregister', 'Hochgeladene Ausweiskopien'],
        risk: 'high',
        humanControl: 'Pflichtfreigabe durch Compliance-Mitarbeiter (Prüfer-Kürzel + Datum)',
      },
      {
        name: 'PEP- & Sanktionslisten-Screening',
        purpose: 'Automatisches Matching gegen EU/UN/OFAC-Listen, PEP-Kategorien',
        sources: ['EU Consolidated List', 'UN Sanctions List', 'OFAC SDN', 'World-Check / Dow Jones'],
        risk: 'high',
        humanControl: 'Jeder Treffer wird durch Geldwäschebeauftragten manuell geprüft',
      },
      {
        name: 'UBO-Ermittlung',
        purpose: 'Errechnet wirtschaftlich Berechtigte aus Beteiligungsstrukturen',
        sources: ['Gesellschafterliste', 'Transparenzregister'],
        risk: 'limited',
        humanControl: 'Plausibilitätsprüfung durch KYC-Team',
      },
    ],
  },
  {
    key: 'analysis',
    name: '3. §18 KWG Prüfung',
    view: 'analysis',
    icon: FileSearch,
    kiFunctions: [
      {
        name: 'Bilanz- & BWA-Analyse (LLM)',
        purpose: 'Generiert narrative Analyse aus Jahresabschlüssen 2021–2023, BWA',
        sources: ['Jahresabschlüsse (Bilanz, GuV)', 'BWA aktuell', 'Summen-Saldenliste', 'Branchenbenchmarks'],
        risk: 'limited',
        humanControl: 'Analyse als Entscheidungsvorbereitung, finale Bewertung durch Kreditanalyst',
      },
      {
        name: 'Kennzahlenberechnung',
        purpose: 'Berechnet deterministisch EK-Quote, Liquiditätsgrade, Kapitaldienstfähigkeit',
        sources: ['Strukturierte Bilanzdaten'],
        risk: 'minimal',
        humanControl: 'Formeln sind auditierbar, keine Blackbox',
      },
    ],
  },
  {
    key: 'rating',
    name: '4. Rating',
    view: 'rating',
    icon: Scale,
    kiFunctions: [
      {
        name: 'Quantitatives Rating-Modell',
        purpose: 'Berechnet PD-Klasse basierend auf Finanzkennzahlen',
        sources: ['Bilanzkennzahlen', 'Branchen-Benchmark', 'Historische Ausfalldaten'],
        risk: 'high',
        humanControl: 'Override durch Kreditanalyst möglich, begründungspflichtig',
      },
      {
        name: 'Qualitatives Rating (KI-Vorschlag)',
        purpose: 'Schlägt Bewertungen für Management, Markt, Produkt vor',
        sources: ['Managementgespräche', 'Marktberichte', 'Kontoführungsdaten'],
        risk: 'limited',
        humanControl: 'Pflichtfeld: persönliche Einschätzung des Beraters',
      },
    ],
  },
  {
    key: 'collateral',
    name: '5. Sicherheiten',
    view: 'collateral',
    icon: Lock,
    kiFunctions: [
      {
        name: 'Haircut-Empfehlung',
        purpose: 'Schlägt Beleihungswerte gem. institutsinterner Richtlinie vor',
        sources: ['Haircut-Tabelle (Haircut-Rates)', 'Art der Sicherheit', 'Vorlasten'],
        risk: 'limited',
        humanControl: 'Bewertung durch Sicherheitenspezialist bestätigt',
      },
    ],
  },
  {
    key: 'credit-proposal',
    name: '6. Kreditempfehlung',
    view: 'credit-proposal',
    icon: ClipboardCheck,
    kiFunctions: [
      {
        name: 'KI-Kreditempfehlung (LLM)',
        purpose: 'Generiert Entwurf der Kreditvorlage aus allen vorhergehenden Analysen',
        sources: ['Stammdaten', 'KYC-Ergebnis', 'Bilanzanalyse', 'Rating', 'Sicherheitenbewertung'],
        risk: 'limited',
        humanControl: 'Berater übernimmt Text ins Erstvotum und kann beliebig editieren',
      },
    ],
  },
  {
    key: 'decision',
    name: '7. Kreditentscheidung',
    view: 'decision',
    icon: CheckCircle2,
    kiFunctions: [
      {
        name: 'Kompetenzträger-Ermittlung',
        purpose: 'Bestimmt zuständigen Genehmiger aus Kompetenzmatrix',
        sources: ['Kompetenzmatrix', 'Kreditbetrag', 'Rating-Klasse'],
        risk: 'minimal',
        humanControl: 'Deterministische Regel, kein ML-Modell',
      },
      {
        name: 'Votierungs-Plausibilisierung',
        purpose: 'Prüft Konsistenz von Erst- und Zweitvotum, erkennt Divergenzen',
        sources: ['Erstvotum (Markt)', 'Zweitvotum (Marktfolge)'],
        risk: 'limited',
        humanControl: 'Finale Entscheidung immer durch Kompetenzträger (Mensch)',
      },
    ],
  },
  {
    key: 'contract',
    name: '8. Kreditvertrag',
    view: 'contract',
    icon: FileText,
    kiFunctions: [
      {
        name: 'Vertragsgenerator',
        purpose: 'Füllt LMA-Standardvertragsvorlage mit Antragsdaten',
        sources: ['STANDARD LOAN AGREEMENT Vorlage', 'Antragsdaten', 'Konditionen'],
        risk: 'minimal',
        humanControl: 'Rechtsabteilung prüft und gibt finalen Vertrag frei',
      },
    ],
  },
  {
    key: 'monitoring',
    name: '9. Monitoring',
    view: 'monitoring',
    icon: Eye,
    kiFunctions: [
      {
        name: 'Frühwarnindikatoren',
        purpose: 'Erkennt Verschlechterungen in Kontoführung und Kennzahlen',
        sources: ['Kontoumsätze', 'Quartals-BWA', 'Branchennachrichten'],
        risk: 'limited',
        humanControl: 'Jeder Treffer erzeugt Ticket im Watchlist-Management',
      },
      {
        name: 'Rating-Migration',
        purpose: 'Aktualisiert Rating bei neuen Jahresabschlüssen',
        sources: ['Aktualisierte Bilanz', 'BWA', 'Kontoführungsdaten'],
        risk: 'limited',
        humanControl: 'Vier-Augen-Prüfung bei Rating-Verschlechterung > 2 Klassen',
      },
    ],
  },
];

const RISK_STYLES = {
  minimal: { label: 'Minimal', color: 'bg-green-50 text-green-700 border-green-200' },
  limited: { label: 'Begrenzt', color: 'bg-blue-50 text-blue-700 border-blue-200' },
  high: { label: 'Hoch', color: 'bg-amber-50 text-amber-800 border-amber-200' },
};

const GOVERNANCE_PRINCIPLES = [
  {
    icon: UserCheck,
    title: 'Human-in-the-Loop',
    text: 'Jede KI-Entscheidung mit Auswirkung auf den Kunden wird durch einen Mitarbeiter geprüft und freigegeben (§114 MaRisk, EU AI Act Art. 14).',
  },
  {
    icon: Database,
    title: 'Nachvollziehbare Datenquellen',
    text: 'Jede KI-Aussage verweist auf die zugrundeliegende Datenquelle (Bilanz, Register, Checkliste). Der KI-Assistent nennt diese auf Nachfrage.',
  },
  {
    icon: Shield,
    title: 'Auditierbarkeit',
    text: 'Alle KI-Aktionen werden mit Zeitstempel, Modellversion und Input-Hash protokolliert (BAIT, MaRisk AT 7.2).',
  },
  {
    icon: Scale,
    title: 'Keine vollautomatisierte Entscheidung',
    text: 'Kreditentscheidungen werden nicht ausschließlich automatisiert getroffen (DSGVO Art. 22). Endentscheidung trifft stets der Kompetenzträger.',
  },
];

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export default function ComplianceView() {
  const { navigate } = useApp();

  const totalFunctions = PROCESS_STEPS.reduce((s, step) => s + step.kiFunctions.length, 0);
  const highRiskCount = PROCESS_STEPS.reduce(
    (s, step) => s + step.kiFunctions.filter(f => f.risk === 'high').length,
    0,
  );

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-start justify-between gap-6">
        <div>
          <h1 className="text-xl font-bold font-headline text-text-primary flex items-center gap-2">
            <Shield size={22} strokeWidth={1.5} className="text-primary" />
            Compliance-Sicht: KI im Kreditprozess
          </h1>
          <p className="text-sm text-text-secondary mt-1 max-w-3xl">
            Diese Übersicht zeigt transparent, an welchen Stellen im Kreditprozess KI-Funktionen eingesetzt werden,
            welche Datenquellen sie nutzen, welcher Risikoklasse sie nach EU AI Act zuzuordnen sind und welche
            menschliche Kontrolle vorgesehen ist.
          </p>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <KPIBox icon="Sparkles" label="KI-Funktionen gesamt" wert={totalFunctions} format="num" trend={8.3} delay={0} />
        <KPIBox icon="AlertTriangle" label="Hochrisiko-KI (AI Act)" wert={highRiskCount} format="num" trend={-4.2} delay={80} />
        <KPIBox icon="UserCheck" label="Human-in-the-Loop" wert={100} format="pct" trend={0.5} delay={160} />
        <KPIBox icon="CheckCircle2" label="Audit-Events (30 T.)" wert={847} format="num" trend={12.1} delay={240} />
      </div>

      {/* Governance principles */}
      <div className="bg-surface-card border border-border rounded-xl p-6">
        <h2 className="text-base font-semibold font-headline text-text-primary mb-4 flex items-center gap-2">
          <ShieldCheck size={18} strokeWidth={1.5} className="text-primary" />
          Governance-Grundsätze
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {GOVERNANCE_PRINCIPLES.map(p => {
            const Icon = p.icon;
            return (
              <div key={p.title} className="flex gap-3 p-3 rounded-lg bg-surface border border-border">
                <Icon size={20} strokeWidth={1.5} className="text-primary shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-text-primary">{p.title}</p>
                  <p className="text-xs text-text-secondary mt-1">{p.text}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Process timeline */}
      <div className="bg-surface-card border border-border rounded-xl p-6">
        <h2 className="text-base font-semibold font-headline text-text-primary mb-4">
          KI-Funktionen entlang des Kreditprozesses
        </h2>

        <div className="space-y-4">
          {PROCESS_STEPS.map((step, idx) => {
            const Icon = step.icon;
            return (
              <div
                key={step.key}
                className="border border-border rounded-lg overflow-hidden hover:shadow-sm transition-shadow"
              >
                {/* Step header */}
                <div className="flex items-center gap-3 px-4 py-3 bg-surface border-b border-border">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <Icon size={16} strokeWidth={1.5} className="text-primary" />
                  </div>
                  <h3 className="text-sm font-semibold font-headline text-text-primary flex-1">
                    {step.name}
                  </h3>
                  <button
                    type="button"
                    onClick={() => navigate(step.view)}
                    className="inline-flex items-center gap-1 text-xs text-primary hover:text-primary-light transition-colors"
                  >
                    Zum Schritt
                    <ArrowRight size={12} strokeWidth={1.5} />
                  </button>
                </div>

                {/* KI functions */}
                <div className="divide-y divide-border">
                  {step.kiFunctions.map(fn => {
                    const risk = RISK_STYLES[fn.risk];
                    return (
                      <div key={fn.name} className="px-4 py-3">
                        <div className="flex items-start gap-3">
                          <Sparkles size={16} strokeWidth={1.5} className="text-primary shrink-0 mt-0.5" />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <p className="text-sm font-semibold text-text-primary">{fn.name}</p>
                              <span className={`inline-block px-2 py-0.5 text-[10px] font-semibold rounded-full border ${risk.color}`}>
                                AI-Act: {risk.label}
                              </span>
                            </div>
                            <p className="text-xs text-text-secondary mt-1">{fn.purpose}</p>

                            <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                              <div className="flex gap-2 items-start">
                                <Database size={12} strokeWidth={1.5} className="text-text-muted shrink-0 mt-0.5" />
                                <div>
                                  <p className="text-[10px] uppercase tracking-wide text-text-muted">Datenquellen</p>
                                  <p className="text-text-secondary">{fn.sources.join(', ')}</p>
                                </div>
                              </div>
                              <div className="flex gap-2 items-start">
                                <UserCheck size={12} strokeWidth={1.5} className="text-accent shrink-0 mt-0.5" />
                                <div>
                                  <p className="text-[10px] uppercase tracking-wide text-text-muted">Menschliche Kontrolle</p>
                                  <p className="text-text-secondary">{fn.humanControl}</p>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Hinweis */}
      <div className="flex items-start gap-3 p-4 rounded-lg bg-blue-50 border border-blue-200">
        <Info size={18} strokeWidth={1.5} className="text-blue-700 shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-semibold text-blue-900">Hinweis zur Stichprobenprüfung</p>
          <p className="text-xs text-blue-800 mt-1">
            Die interne Revision führt quartalsweise Stichprobenprüfungen aller KI-gestützten Prozessschritte durch.
            Geprüft werden: Datengrundlage, Modellqualität, Ausreißer, Override-Quote, Audit-Log-Vollständigkeit.
            Ergebnisse werden dem Vorstand in einem KI-Compliance-Report vorgelegt.
          </p>
        </div>
      </div>
    </div>
  );
}

