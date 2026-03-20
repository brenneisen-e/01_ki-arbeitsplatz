import { useEffect } from 'react';
import { useModule } from '../../hooks/useModule';
import { Search, ChevronRight } from '../ui/Icons';
import TopNav from './TopNav';
import Breadcrumb from './Breadcrumb';

export default function Header({ onGlossary, onSearch }) {
  const { data, visited, showOverview } = useModule();

  useEffect(() => {
    const handler = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        onSearch();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onSearch]);

  const total = data?.chapters?.length || 0;
  const pct = total > 0 ? Math.round((visited.length / total) * 100) : 0;

  return (
    <header className="sticky top-0 z-40">
      {/* Top Bar */}
      <div className="header-gradient px-6 pt-5 pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={showOverview} className="text-white/80 hover:text-white transition">
              <ChevronRight className="w-5 h-5 rotate-180" />
            </button>
            <h1 className="text-white font-bold text-lg tracking-tight">Versicherungs-1×1</h1>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onSearch}
              className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white/80 hover:text-white text-sm transition"
            >
              <Search className="w-4 h-4" />
              <span className="hidden sm:inline">Suchen</span>
              <kbd className="hidden sm:inline text-[10px] bg-white/15 px-1.5 py-0.5 rounded font-mono">⌘K</kbd>
            </button>
            <div className="flex items-center gap-2 text-white/70 text-xs">
              <span className="hidden sm:inline">Fortschritt</span>
              <div className="progress-bar">
                <div className="progress-fill" style={{ width: `${pct}%` }} />
              </div>
              <span className="font-mono text-white/90">{pct}%</span>
            </div>
          </div>
        </div>
      </div>

      <TopNav onGlossary={onGlossary} />
      <Breadcrumb />
    </header>
  );
}
