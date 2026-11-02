import { CheckCircle2, ArrowRight } from 'lucide-react';
import { useApp } from '../../context/AppContext';

const STEP_CONFIG = {
  kyc: { label: 'KYC abschließen → §18 Prüfung', next: 'analysis', nextLabel: '§18 KWG Prüfung' },
  analysis: { label: '§18 Prüfung abschließen → Rating', next: 'rating', nextLabel: 'Rating' },
  rating: { label: 'Rating abschließen → Sicherheiten', next: 'collateral', nextLabel: 'Sicherheiten' },
  collateral: { label: 'Sicherheiten abschließen → Kreditempfehlung', next: 'credit-proposal', nextLabel: 'Kreditempfehlung' },
  'credit-proposal': { label: 'Kreditempfehlung abschließen → Votierung', next: 'decision', nextLabel: 'Votierung' },
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
        <div className="w-9 h-9 rounded-full bg-emerald-50 flex items-center justify-center">
          <CheckCircle2 size={18} strokeWidth={1.5} className="text-emerald-600" />
        </div>
        <div>
          <p className="text-sm font-medium font-headline text-text-primary">Prozessschritt abschließen</p>
          <p className="text-xs text-text-muted font-body">Weiter zu: {config.nextLabel}</p>
        </div>
      </div>
      <button
        type="button"
        onClick={handleComplete}
        className="inline-flex items-center gap-2 px-5 h-10 bg-primary text-white rounded-[10px] text-sm font-medium font-body hover:bg-primary-light transition-colors"
      >
        {config.label}
        <ArrowRight size={16} strokeWidth={1.5} />
      </button>
    </div>
  );
}
