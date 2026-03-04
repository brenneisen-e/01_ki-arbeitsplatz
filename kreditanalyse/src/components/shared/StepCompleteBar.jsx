import { CheckCircle2, ArrowRight } from 'lucide-react';
import { useApp } from '../../context/AppContext';

const STEP_CONFIG = {
  kyc: { label: 'KYC abschließen', next: 'analysis', nextLabel: '§18 KWG Prüfung' },
  analysis: { label: '§18 Prüfung abschließen', next: 'rating', nextLabel: 'Rating' },
  rating: { label: 'Rating abschließen', next: 'collateral', nextLabel: 'Sicherheiten' },
  collateral: { label: 'Sicherheiten abschließen', next: 'decision', nextLabel: 'Kreditentscheidung' },
  decision: { label: 'Votierung abschließen', next: 'voting', nextLabel: 'Genehmigung' },
};

export default function StepCompleteBar({ currentStep }) {
  const { state, dispatch, navigate } = useApp();
  const company = state.companies.find(c => c.id === state.selectedCompanyId);
  const config = STEP_CONFIG[currentStep];

  if (!config || !company) return null;

  const handleComplete = () => {
    dispatch({ type: 'ADVANCE_STATUS', companyId: company.id });
    navigate(config.next);
  };

  return (
    <div className="flex items-center justify-between bg-surface-card border border-border rounded-xl p-4 mt-6">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center">
          <CheckCircle2 size={18} strokeWidth={1.5} className="text-accent" />
        </div>
        <div>
          <p className="text-sm font-semibold font-headline text-text-primary">Prozessschritt abschließen</p>
          <p className="text-xs text-text-muted font-body">Weiter zu: {config.nextLabel}</p>
        </div>
      </div>
      <button
        type="button"
        onClick={handleComplete}
        className="inline-flex items-center gap-2 px-5 py-2.5 bg-accent text-white rounded-lg text-sm font-semibold font-body hover:bg-accent/90 transition-colors shadow-sm"
      >
        {config.label}
        <ArrowRight size={16} strokeWidth={1.5} />
      </button>
    </div>
  );
}
