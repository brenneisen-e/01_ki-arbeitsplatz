import { useEffect } from 'react';
import { useModule } from '../../hooks/useModule';
import { Search, ChevronRight, Home } from '../ui/Icons';
import TopNav from './TopNav';
import Breadcrumb from './Breadcrumb';

const LOGO_TOKEN = 'pk_H7vb5Y2lTsW47U4Xq-w3HA';

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
      <div className="header-gradient px-6 pt-5 pb-4">
        <div className="flex items-center justify-between">
          {/* Left: Back + Logo + Title */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => { window.location.href = '/'; }}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition"
              title="Zurück zur Startseite"
            >
              <Home className="w-4 h-4" />
              <span className="text-xs font-medium hidden sm:inline">Startseite</span>
            </button>
            <button onClick={showOverview} className="text-white/80 hover:text-white transition">
              <ChevronRight className="w-5 h-5 rotate-180" />
            </button>
            <div className="w-10 h-10 rounded-lg bg-white/20 border border-white/30 overflow-hidden flex items-center justify-center">
              <img
                src={`https://img.logo.dev/deloitte.com?token=${LOGO_TOKEN}&format=png&size=200`}
                alt="Deloitte"
                className="h-8 w-8 object-contain"
              />
            </div>
            <div>
              <h1 className="text-white font-bold text-xl tracking-tight">Versicherungs-1×1</h1>
              <div className="text-white/50 text-xs">Insurance Strategy & Consulting</div>
            </div>
          </div>

          {/* Right: Search + Progress */}
          <div className="flex items-center gap-4">
            <button
              onClick={onSearch}
              className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white/80 hover:text-white text-sm transition"
            >
              <Search className="w-4 h-4" />
              <span className="hidden sm:inline">Suchen</span>
              <kbd className="hidden sm:inline text-[10px] bg-white/15 px-1.5 py-0.5 rounded font-mono">⌘K</kbd>
            </button>
            <div className="flex items-center gap-3 px-3 py-2 rounded-lg bg-white/10 text-white text-sm">
              <span className="text-white/60 text-xs font-medium">Fortschritt</span>
              <div className="progress-bar w-24">
                <div className="progress-fill" style={{ width: `${pct}%` }} />
              </div>
              <span className="font-mono text-sm font-medium">{pct}%</span>
            </div>
          </div>
        </div>
      </div>

      <TopNav onGlossary={onGlossary} />
      <Breadcrumb />
    </header>
  );
}
