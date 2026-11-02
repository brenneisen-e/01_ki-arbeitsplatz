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
      { view: 'contract', label: 'Unterschrift / Rückläufer' },
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
  signature_pending: 8,
  active: 9,
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

  // Neuer Antrag ohne Vorgang: Leiste zeigt Schritt 1 als aktuell, alles
  // Weitere ausstehend
  const neu = !company && state.neuerAntrag && ['customer-application', 'application'].includes(currentView);
  if (!selectedCompanyId && currentView !== 'monitoring' && !neu) return null;

  const activePhaseKey = VIEW_TO_PHASE[currentView] || 'demand';
  const activePhaseIdx = PHASES.findIndex(p => p.key === activePhaseKey);

  // Für den Contract-View gibt es zwei Teilschritte (Kreditvertrag / Unterschrift-Rückläufer).
  // Sobald der Vorgang im Status "signature_pending" (oder später) ist, soll nicht mehr
  // der erste "contract"-Schritt als aktuell markiert werden, sondern der zweite.
  let currentStepIdx = neu ? 0 : FLAT_STEPS.findIndex(s => s.view === currentView);
  if (
    currentView === 'contract' &&
    (company?.status === 'signature_pending' || company?.status === 'active')
  ) {
    let last = -1;
    FLAT_STEPS.forEach((s, i) => { if (s.view === 'contract') last = i; });
    if (last !== -1) currentStepIdx = last;
  }
  const reachedIdx = company ? (STATUS_REACHED_INDEX[company.status] ?? 0) : 0;

  return (
    <div className="bg-surface-card border-b border-border no-print">
      <div className="w-full px-6 pt-3.5 pb-3">

        {/* =========================================================== */}
        {/* Oberer Bereich: Phasen-Überschriften (4 Hauptphasen)         */}
        {/* =========================================================== */}
        <div className="flex items-center">
          <span className="text-[11px] uppercase tracking-wider font-medium text-text-muted mr-4 shrink-0">
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
                    className={`inline-flex items-center gap-1.5 px-3 h-7 rounded-full text-xs font-medium font-headline border transition-colors ${
                      isActive
                        ? 'bg-primary text-white border-primary'
                        : isDone
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-100 hover:bg-emerald-100'
                        : 'bg-surface-card text-text-muted border-border hover:bg-surface-inset hover:text-text-primary'
                    }`}
                    title={`${phase.label} · ${phase.sub}`}
                  >
                    {isDone && <Check size={12} strokeWidth={2.5} />}
                    {phase.label}
                  </button>
                  {idx < PHASES.length - 1 && (
                    <ChevronRight
                      size={14}
                      className={`mx-1 ${idx < activePhaseIdx ? 'text-emerald-600' : 'text-border-strong'}`}
                    />
                  )}
                </div>
              );
            })}
          </div>
          {(company || neu) && (
            <span className="text-xs font-body text-text-muted ml-4 shrink-0">
              Vorgang: <span className="font-medium text-text-primary">{company ? company.firma : 'Neuer Kreditantrag'}</span>
            </span>
          )}
        </div>

        {/* Trennlinie + Sub-Label zur aktiven Phase */}
        <div className="flex items-center gap-3 mt-3 mb-2.5">
          <div className="h-px flex-1 bg-border" />
          <span className="text-[11px] uppercase tracking-wider font-medium text-text-muted">
            {PHASES[activePhaseIdx]?.sub || 'Teilschritte des Vorgangs'}
          </span>
          <div className="h-px flex-1 bg-border" />
        </div>

        {/* =========================================================== */}
        {/* Unterer Bereich: Teilschritte des Vorgangs                   */}
        {/* Kein Subworkflow auf Monitoring — dort keine Vorgang-Bearbeitung */}
        {/* =========================================================== */}
        {(company || neu) && currentView !== 'monitoring' && (
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
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-100 hover:bg-emerald-100'
                  : isInActivePhase
                  ? 'bg-surface-card text-text-primary border-border-strong hover:bg-[var(--mode-pastel)]'
                  : 'bg-surface-inset text-text-muted border-border hover:text-text-primary';

                const labelClass = isCurrent
                  ? 'text-primary'
                  : isDone
                  ? 'text-emerald-700'
                  : 'text-text-muted';

                return (
                  <div key={`${step.view}-${i}`} className="flex items-stretch shrink-0">
                    <div className="flex flex-col items-center min-w-[112px]">
                      <button
                        type="button"
                        onClick={() => navigate(step.view)}
                        disabled={neu && i > 0}
                        className={`w-full px-3 h-8 rounded-[10px] border text-xs font-medium font-body transition-colors flex items-center gap-1.5 justify-center disabled:cursor-default ${btnClass}`}
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
                      <span className={`text-[11px] font-mono text-center mt-1 leading-tight ${labelClass}`}>
                        {isCurrent ? 'aktuell' : isDone && completedAt ? `am ${completedAt}` : 'ausstehend'}
                      </span>
                    </div>
                    {i < FLAT_STEPS.length - 1 && (
                      <div className="flex items-center px-1 mt-2">
                        <div className={`h-px w-4 ${i < reachedIdx ? 'bg-emerald-200' : 'bg-border'}`} />
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
