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

export default function ProcessBar() {
  const { state } = useApp();
  const { currentView, selectedCompanyId } = state;

  if (!selectedCompanyId && currentView !== 'monitoring') return null;

  const mapping = VIEW_TO_PHASE[currentView] || VIEW_TO_PHASE.dashboard;
  const activeIdx = PHASE_ORDER[mapping.phase];

  return (
    <div className="bg-surface-card border-b border-border px-6 py-3 no-print">
      <div className="max-w-[1440px] mx-auto">
        {/* Phase blocks */}
        <div className="flex items-center gap-1">
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
                <div className={`px-4 py-1.5 rounded-md text-xs font-semibold font-headline ${bgClass} ${textClass} transition-colors`}>
                  {phase.label}
                </div>
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
      </div>
    </div>
  );
}
