import { useModule } from '../../hooks/useModule';
import { ChevronRight } from '../ui/Icons';

export default function Breadcrumb() {
  const { view, chapter, showOverview } = useModule();

  if (view === 'overview') return null;

  const label = view === 'wissenscheck' ? 'Wissenscheck' : chapter?.title;
  if (!label) return null;

  return (
    <div className="bg-white border-b border-slate-200 px-6 py-2 text-sm flex items-center gap-2">
      <button onClick={showOverview} className="text-slate-500 hover:text-emerald-700 transition">
        Übersicht
      </button>
      <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
      <span className="text-slate-700 font-medium">{label}</span>
    </div>
  );
}
