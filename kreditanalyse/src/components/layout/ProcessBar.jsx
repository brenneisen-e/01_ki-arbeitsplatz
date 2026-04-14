import { useApp } from '../../context/AppContext';
import { ChevronRight, Check } from 'lucide-react';

// ---------------------------------------------------------------------------
// Phasen (Top-Level) und deren Sub-Schritte (Bottom-Level)
// ---------------------------------------------------------------------------

const PHASES = [
  {
    key: 'demand',
    label: 'Demand Mgmt',
    sub: 'Customer Lead Generation',
    steps: [], // keine Vorgangs-Teilschritte in Demand Mgmt
  },
  {
    key: 'pre-signature',
    label: 'Pre-Signature',
    sub: 'Approval & Negotiation',
    steps: [
      { view: 'application', label: 'Antrag' },
      { view: 'kyc', label: 'KYC' },
      { view: 'analysis', label: '§18 KWG' },
      { view: 'rating', label: 'Rating' },
      { view: 'collateral', label: 'Sicherheiten' },
      { view: 'credit-proposal', label: 'Empfehlung' },
      { view: 'decision', label: 'Entscheidung' },
    ],
  },
  {
    key: 'post-signature',
    label: 'Post-Signature',
    sub: 'Draft & Close Contract',
    steps: [
      { view: 'contract', label: 'Kreditvertrag' },
    ],
  },
  {
    key: 'aftercare',
    label: 'Aftercare',
    sub: 'Monitoring & Aftercare',
    steps: [
      { view: 'monitoring', label: 'Monitoring' },
    ],
  },
];

const VIEW_TO_PHASE = {
  dashboard: 'demand',
  application: 'pre-signature',
  kyc: 'pre-signature',
  analysis: 'pre-signature',
  rating: 'pre-signature',
  collateral: 'pre-signature',
  'credit-proposal': 'pre-signature',
  decision: 'pre-signature',
  contract: 'post-signature',
  monitoring: 'aftercare',
};

// Status → reached index im globalen Vorgangs-Workflow
const STATUS_REACHED_INDEX = {
  eingegangen: 0,
  kyc: 1,
  analysis: 2,
  rating: 3,
  collateral: 4,
  'credit-proposal': 5,
  voting: 6,
  decision: 6,
  approved: 6,
  rejected: 6,
  contract: 7,
  active: 8,
};

// Flacher Workflow für Rechnen des reachedIndex
const FLAT_STEPS = PHASES.flatMap(p => p.steps);

/** Deterministisches Mock-Datum: wann hat dieser Vorgang welchen Schritt abgeschlossen? */
function getStepCompletionDate(company, stepIndex) {
  if (!company) return null;
  const reached = STATUS_REACHED_INDEX[company.status] ?? 0;
  if (stepIndex >= reached) return null;
  const seed = String(company.id).split('').reduce((a, c) => a + c.charCodeAt(0), 0);
  const daysPerStep = 3;
  const stepsBack = reached - stepIndex;
  const jitter = ((seed + stepIndex) % 4) - 1;
  const totalDaysAgo = stepsBack * daysPerStep + jitter;
  const d = new Date();
  d.setDate(d.getDate() - Math.max(1, totalDaysAgo));
  return d.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

// ---------------------------------------------------------------------------
// Komponente
// ---------------------------------------------------------------------------

export default function ProcessBar() {
  const { state, navigate, getSelectedCompany } = useApp();
  const { currentView, selectedCompanyId } = state;
  const company = getSelectedCompany();

  if (!selectedCompanyId && currentView !== 'monitoring') return null;

  const activePhaseKey = VIEW_TO_PHASE[currentView] || 'demand';
  const activePhaseIdx = PHASES.findIndex(p => p.key === activePhaseKey);

  const currentStepIdx = FLAT_STEPS.findIndex(s => s.view === currentView);
  const reachedIdx = company ? (STATUS_REACHED_INDEX[company.status] ?? 0) : 0;

  return (
    <div className="bg-surface-card border-b border-border no-print">
      <div className="w-full px-6 py-4">

        {/* =========================================================== */}
        {/* Oberer Bereich: Phasen-Überschriften (4 Hauptphasen)         */}
        {/* =========================================================== */}
        <div className="flex items-center">
          <span className="text-[10px] uppercase tracking-wider font-semibold text-text-muted mr-4 shrink-0">
            Phase
          </span>
          <div className="flex items-center gap-0 flex-1">
            {PHASES.map((phase, idx) => {
              const isActive = idx === activePhaseIdx;
              const isDone = idx < activePhaseIdx;

              return (
                <div key={phase.key} className="flex items-center">
                  <button
                    type="button"
                    onClick={() => {
                      // Springe auf den ersten View der Phase (bzw. dashboard für demand)
                      if (phase.key === 'demand') navigate('dashboard');
                      else if (phase.steps.length) navigate(phase.steps[0].view);
                    }}
                    className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-md text-xs font-semibold font-headline transition-all ${
                      isActive
                        ? 'bg-accent-teal text-white shadow-sm'
                        : isDone
                        ? 'bg-accent text-white hover:opacity-85'
                        : 'bg-surface text-text-muted border border-border hover:bg-border hover:text-text-primary'
                    }`}
                    title={`${phase.label} · ${phase.sub}`}
                  >
                    {isDone && <Check size={12} strokeWidth={2.5} />}
                    {phase.label}
                  </button>
                  {idx < PHASES.length - 1 && (
                    <ChevronRight
                      size={14}
                      className={`mx-1 ${idx < activePhaseIdx ? 'text-accent' : 'text-border'}`}
                    />
                  )}
                </div>
              );
            })}
          </div>
          {company && (
            <span className="text-[11px] font-body text-text-muted ml-4 shrink-0">
              Vorgang: <span className="font-semibold text-text-secondary">{company.firma}</span>
            </span>
          )}
        </div>

        {/* Trennlinie + Sub-Label zur aktiven Phase */}
        <div className="flex items-center gap-3 mt-3 mb-3">
          <div className="h-px flex-1 bg-border" />
          <span className="text-[10px] uppercase tracking-wider font-semibold text-text-muted">
            {PHASES[activePhaseIdx]?.sub || 'Teilschritte des Vorgangs'}
          </span>
          <div className="h-px flex-1 bg-border" />
        </div>

        {/* =========================================================== */}
        {/* Unterer Bereich: Teilschritte des Vorgangs                   */}
        {/* Kein Subworkflow auf Monitoring — dort keine Vorgang-Bearbeitung */}
        {/* =========================================================== */}
        {company && currentView !== 'monitoring' && (
          <div className="overflow-x-auto scrollbar-thin pb-1">
            <div className="flex items-stretch">
              {FLAT_STEPS.map((step, i) => {
                const isCurrent = i === currentStepIdx;
                const isDone = i < reachedIdx;
                const completedAt = isDone ? getStepCompletionDate(company, i) : null;

                // Phase-Zugehörigkeit berechnen für dezente Farb-Group-Markierung
                const ownerPhaseIdx = PHASES.findIndex(p => p.steps.some(s => s.view === step.view));
                const isInActivePhase = ownerPhaseIdx === activePhaseIdx;

                const btnClass = isCurrent
                  ? 'bg-primary text-white border-primary shadow-sm'
                  : isDone
                  ? 'bg-accent/10 text-accent border-accent/30 hover:bg-accent/20'
                  : isInActivePhase
                  ? 'bg-white text-primary border-primary/30 hover:bg-primary/5'
                  : 'bg-surface text-text-muted border-border hover:bg-border hover:text-text-primary';

                const labelClass = isCurrent
                  ? 'text-primary'
                  : isDone
                  ? 'text-accent'
                  : 'text-text-muted';

                return (
                  <div key={step.view} className="flex items-stretch shrink-0">
                    <div className="flex flex-col items-center min-w-[112px]">
                      <button
                        type="button"
                        onClick={() => navigate(step.view)}
                        className={`w-full px-3 py-2 rounded-lg border text-[12px] font-medium font-body transition-colors flex items-center gap-1.5 justify-center ${btnClass}`}
                        title={`${step.label} öffnen`}
                      >
                        <span className={`font-mono text-[10px] ${isCurrent ? 'text-white/80' : 'opacity-70'}`}>
                          {i + 1}
                        </span>
                        <span className="truncate">{step.label}</span>
                        {isDone && (
                          <Check size={11} strokeWidth={2.5} className="shrink-0" />
                        )}
                      </button>
                      <span className={`text-[10px] font-mono text-center mt-1 leading-tight ${labelClass}`}>
                        {isCurrent && '● aktuell'}
                        {isDone && completedAt && `am ${completedAt}`}
                        {!isCurrent && !isDone && 'ausstehend'}
                      </span>
                    </div>
                    {i < FLAT_STEPS.length - 1 && (
                      <div className="flex items-center px-1 mt-2">
                        <div className={`h-px w-4 ${i < reachedIdx ? 'bg-accent/40' : 'bg-border'}`} />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
