import { useEffect } from 'react';
import { useModule } from '../../hooks/useModule';
import { Search, Home, LayoutGrid, CheckCircle, BookOpen } from '../ui/Icons';
import Breadcrumb from './Breadcrumb';

export default function Header({ onGlossary, onSearch }) {
  const { data, visited, view, chapterId, openChapter, showOverview, openWissencheck } = useModule();

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

  const tabClass = (active) => active
    ? 'bg-white text-slate-800 font-medium'
    : 'text-white/70 hover:text-white hover:bg-white/10';

  return (
    <header className="sticky top-0 z-40 bg-[#1a1a2e]">
      {/* Row 1: Home + Search + Progress */}
      <div className="px-6 pt-4 pb-2 flex items-center justify-between">
        <button
          onClick={() => { window.location.href = '/'; }}
          className="flex items-center gap-1.5 px-2.5 py-1.5 text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition"
          title="Zurück zur Startseite"
        >
          <Home className="w-4 h-4" />
          <span className="text-sm font-medium">Startseite</span>
        </button>

        <div className="flex items-center gap-3">
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

      {/* Row 2: Tabs */}
      <div className="px-6 flex items-center gap-1 overflow-x-auto pb-0" style={{ scrollbarWidth: 'none' }}>
        <button
          className={`flex items-center gap-1.5 px-4 py-2.5 text-sm rounded-t-lg transition-all whitespace-nowrap ${tabClass(view === 'overview')}`}
          onClick={showOverview}
        >
          <LayoutGrid className="w-4 h-4" />
          <span>Übersicht</span>
        </button>

        {data?.chapters?.map((ch, i) => (
          <button
            key={ch.id}
            className={`relative flex items-center gap-1.5 px-4 py-2.5 text-sm rounded-t-lg transition-all whitespace-nowrap ${tabClass(chapterId === ch.id)}`}
            onClick={() => openChapter(ch.id)}
          >
            <span className="text-xs opacity-60">{String(i + 1).padStart(2, '0')}</span>
            <span className="hidden lg:inline truncate max-w-[120px]">{ch.title}</span>
            {visited.includes(ch.id) && (
              <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-emerald-400" />
            )}
          </button>
        ))}

        <div className="w-px h-6 bg-white/20 mx-1 flex-shrink-0" />

        <button
          className={`flex items-center gap-1.5 px-4 py-2.5 text-sm rounded-t-lg transition-all whitespace-nowrap ${tabClass(view === 'wissenscheck')}`}
          onClick={openWissencheck}
        >
          <CheckCircle className="w-4 h-4" />
          <span>Wissenscheck</span>
        </button>

        <button
          className="flex items-center gap-1.5 px-4 py-2.5 text-sm rounded-t-lg transition-all whitespace-nowrap text-white/70 hover:text-white hover:bg-white/10"
          onClick={onGlossary}
        >
          <BookOpen className="w-4 h-4" />
          <span>Glossar</span>
        </button>
      </div>

      <Breadcrumb />
    </header>
  );
}
