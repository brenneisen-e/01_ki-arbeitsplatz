import { useApp } from '../../context/AppContext';
import { ChevronRight } from 'lucide-react';

const PHASES = [
  { key: 'demand', label: 'Demand Mgmt' },
  { key: 'pre-signature', label: 'Pre-Signature' },
  { key: 'post-signature', label: 'Post-Signature' },
  { key: 'aftercare', label: 'Aftercare' },
];

const VIEW_TO_PHASE = {
  dashboard: { phase: 'demand', sub: 'Customer Lead Generation' },
  application: { phase: 'pre-signature', sub: 'Contact & Commercial Pre-Assessment' },
  kyc: { phase: 'pre-signature', sub: 'Gathering Customer Data' },
  analysis: { phase: 'pre-signature', sub: 'Gathering Customer Data' },
  rating: { phase: 'pre-signature', sub: 'Credit Analysis & Evaluation' },
  collateral: { phase: 'pre-signature', sub: 'Credit Analysis & Evaluation' },
  'credit-proposal': { phase: 'pre-signature', sub: 'Approval & Negotiation' },
  decision: { phase: 'pre-signature', sub: 'Approval & Negotiation' },
  contract: { phase: 'post-signature', sub: 'Draft & Close Contract' },
  monitoring: { phase: 'aftercare', sub: 'Aftercare & Monitoring' },
};

const PHASE_ORDER = { demand: 0, 'pre-signature': 1, 'post-signature': 2, aftercare: 3 };

// Reihenfolge der Prozessschritte eines Vorgangs (Bearbeiter-Sicht).
// Dient dem zweiten Stepper, über den der Nutzer jederzeit zu
// vorherigen (oder späteren) Schritten eines Vorgangs zurückspringen kann.
const WORKFLOW_STEPS = [
  { view: 'application', label: 'Antrag' },
  { view: 'kyc', label: 'KYC' },
  { view: 'analysis', label: '§18 KWG' },
  { view: 'rating', label: 'Rating' },
  { view: 'collateral', label: 'Sicherheiten' },
  { view: 'credit-proposal', label: 'Empfehlung' },
  { view: 'decision', label: 'Entscheidung' },
  { view: 'contract', label: 'Vertrag' },
  { view: 'monitoring', label: 'Monitoring' },
];

// Welcher Vorgangsstatus entspricht welchem bereits "erreichten" Schritt?
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

/** Deterministisches Mock-Datum: wann hat dieser Vorgang welchen Schritt abgeschlossen?
 *  Basis: heute minus (reachedIndex - stepIndex) * (n Tage + deterministischer Offset).
 */
function getStepCompletionDate(company, stepIndex) {
  if (!company) return null;
  const reached = STATUS_REACHED_INDEX[company.status] ?? 0;
  if (stepIndex >= reached) return null;

  // Seed aus company.id damit die Daten stabil/reproduzierbar sind
  const seed = String(company.id).split('').reduce((a, c) => a + c.charCodeAt(0), 0);
  const daysPerStep = 3;
  const stepsBack = reached - stepIndex;
  const jitter = ((seed + stepIndex) % 4) - 1; // -1 .. +2
  const totalDaysAgo = stepsBack * daysPerStep + jitter;
  const d = new Date();
  d.setDate(d.getDate() - Math.max(1, totalDaysAgo));
  return d.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

export default function ProcessBar() {
  const { state, navigate, getSelectedCompany } = useApp();
  const { currentView, selectedCompanyId } = state;
  const company = getSelectedCompany();

  if (!selectedCompanyId && currentView !== 'monitoring') return null;

  const mapping = VIEW_TO_PHASE[currentView] || VIEW_TO_PHASE.dashboard;
  const activeIdx = PHASE_ORDER[mapping.phase];

  const currentStepIdx = WORKFLOW_STEPS.findIndex(s => s.view === currentView);
  const reachedIdx = company ? (STATUS_REACHED_INDEX[company.status] ?? 0) : 0;

  const handlePhaseClick = (phaseKey) => {
    // Springe zum jeweils ersten View der geklickten Phase
    const target = Object.entries(VIEW_TO_PHASE).find(([, v]) => v.phase === phaseKey);
    if (target) navigate(target[0]);
  };

  return (
    <div className="bg-surface-card border-b border-border px-6 py-3 no-print">
      <div className="w-full">
        {/* Phase blocks */}
        <div className="flex items-center gap-1 flex-wrap">
          {PHASES.map((phase, idx) => {
            const isActive = idx === activeIdx;
            const isDone = idx < activeIdx;
            const isFuture = idx > activeIdx;

            let bgClass = '';
            let textClass = '';
            if (isActive) {
              bgClass = 'bg-[#00A3BF]';
              textClass = 'text-white';
            } else if (isDone) {
              bgClass = 'bg-accent';
              textClass = 'text-white';
            } else {
              bgClass = 'bg-border';
              textClass = 'text-text-muted';
            }

            return (
              <div key={phase.key} className="flex items-center">
                <button
                  type="button"
                  onClick={() => handlePhaseClick(phase.key)}
                  className={`px-4 py-1.5 rounded-md text-xs font-semibold font-headline ${bgClass} ${textClass} hover:opacity-85 transition-all`}
                  title={`Zu Phase "${phase.label}" wechseln`}
                >
                  {phase.label}
                </button>
                {idx < PHASES.length - 1 && (
                  <ChevronRight size={14} className={`mx-1 ${isFuture ? 'text-border' : 'text-text-muted'}`} />
                )}
              </div>
            );
          })}
        </div>

        {/* Sub-process label */}
        <p className="text-[11px] text-text-secondary mt-1.5 font-body">
          {mapping.sub}
        </p>

        {/* Detail-Workflow stepper für den aktuellen Vorgang.
            Jeder Schritt ist klickbar (Bearbeiter kann jederzeit zu
            früheren Schritten zurückkehren). Pro abgeschlossenem Schritt
            wird der Zeitpunkt angezeigt. */}
        {company && currentStepIdx >= 0 && (
          <div className="mt-3 overflow-x-auto scrollbar-thin pb-1">
            <div className="flex items-start gap-0">
              {WORKFLOW_STEPS.map((step, i) => {
                const isCurrent = i === currentStepIdx;
                const isDone = i < reachedIdx;
                const isReached = i <= reachedIdx;
                const completedAt = isDone ? getStepCompletionDate(company, i) : null;

                const cls = isCurrent
                  ? 'bg-primary text-white border-primary'
                  : isDone
                  ? 'bg-accent/10 text-accent border-accent/30 hover:bg-accent/20'
                  : isReached
                  ? 'bg-primary/10 text-primary border-primary/20 hover:bg-primary/20'
                  : 'bg-surface text-text-muted border-border hover:bg-border hover:text-text-primary';

                return (
                  <div key={step.view} className="flex items-start shrink-0">
                    <div className="flex flex-col items-stretch min-w-[90px]">
                      <button
                        type="button"
                        onClick={() => navigate(step.view)}
                        className={`px-2.5 py-1 rounded-md text-[11px] font-medium font-body border transition-colors flex items-center gap-1 ${cls}`}
                        title={`${step.label} öffnen`}
                      >
                        <span className="font-mono text-[9px] opacity-70">{i + 1}</span>
                        <span className="truncate">{step.label}</span>
                        {isDone && (
                          <svg width="10" height="10" viewBox="0 0 12 12" fill="none" className="shrink-0 opacity-80">
                            <path d="M2.5 6L5 8.5L9.5 3.5" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        )}
                      </button>
                      <span className={`text-[9px] font-mono text-center mt-0.5 leading-tight ${isDone ? 'text-accent' : isCurrent ? 'text-primary' : 'text-text-muted'}`}>
                        {isCurrent && 'aktuell'}
                        {isDone && completedAt && `abgeschl. ${completedAt}`}
                        {!isCurrent && !isDone && 'ausstehend'}
                      </span>
                    </div>
                    {i < WORKFLOW_STEPS.length - 1 && (
                      <ChevronRight size={10} className="mx-0.5 text-text-muted mt-1.5" />
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
