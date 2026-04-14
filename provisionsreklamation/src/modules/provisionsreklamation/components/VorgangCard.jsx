import { clsx } from 'clsx';
import { ChevronRight, AlertTriangle, Sparkles } from 'lucide-react';
import StatusBadge from './StatusBadge';

export default function VorgangCard({ vorgang, isActive, onClick }) {
  const formatEur = (val) => {
    return new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(val);
  };
  const formatDatumDe = (iso) => {
    if (!iso) return '';
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return iso;
    return d.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  return (
    <button
      onClick={onClick}
      className={clsx(
        'w-full text-left p-4 rounded-lg border transition-all duration-200 relative',
        vorgang.auffaellig && 'border-l-4 border-l-amber-500',
        vorgang.isNeuEingereicht && !vorgang.auffaellig && 'border-l-4 border-l-blue-500',
        isActive
          ? 'bg-blue-50 border-blue-200 shadow-sm'
          : vorgang.isNeuEingereicht
            ? 'bg-blue-50/40 border-blue-200 hover:bg-blue-50 hover:shadow-sm'
            : 'bg-white border-slate-200 hover:bg-slate-50 hover:shadow-sm'
      )}
    >
      {vorgang.isNeuEingereicht && (
        <span className="absolute top-2 right-2 flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-blue-600 text-white text-[10px] font-bold tracking-wider uppercase shadow-sm">
          <Sparkles size={10} strokeWidth={2.5} />
          Neu eingereicht
        </span>
      )}
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono font-semibold text-slate-700">{vorgang.id}</span>
            {vorgang.auffaellig && (
              <AlertTriangle size={14} className="text-amber-500" strokeWidth={2} />
            )}
          </div>
          <p className="text-sm font-medium text-slate-800 truncate">{vorgang.vermittler}</p>
          <p className="text-xs text-slate-500 truncate mt-0.5">{vorgang.typ}</p>
          <div className="flex items-center gap-2 mt-2">
            <span className="text-xs text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">{vorgang.sparte}</span>
            <StatusBadge status={vorgang.status} />
          </div>
        </div>
        <div className="text-right shrink-0">
          <p className={clsx(
            'text-sm font-mono font-semibold',
            vorgang.differenz < 0 ? 'text-red-600' : vorgang.differenz > 0 ? 'text-emerald-600' : 'text-slate-400'
          )}>{formatEur(vorgang.differenz)}</p>
          <p className="text-xs text-slate-400 mt-1">{formatDatumDe(vorgang.eingangsdatum)}</p>
          <ChevronRight size={16} className="text-slate-300 ml-auto mt-1" />
        </div>
      </div>
    </button>
  );
}
