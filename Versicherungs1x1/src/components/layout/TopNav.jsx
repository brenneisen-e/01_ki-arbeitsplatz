import { useModule } from '../../hooks/useModule';
import { LayoutGrid, CheckCircle, BookOpen } from '../../components/ui/Icons';

export default function TopNav({ onGlossary }) {
  const { data, view, chapterId, visited, openChapter, showOverview, openWissencheck } = useModule();

  const isActive = (condition) => condition
    ? 'bg-white text-slate-800 font-medium'
    : 'text-white/70 hover:text-white hover:bg-white/10';

  return (
    <nav className="header-gradient px-6">
      <div className="flex items-center gap-1 overflow-x-auto pb-0" style={{ scrollbarWidth: 'none' }}>
        <button
          className={`flex items-center gap-1.5 px-4 py-2.5 text-sm rounded-t-lg transition-all duration-200 whitespace-nowrap ${isActive(view === 'overview')}`}
          onClick={showOverview}
        >
          <LayoutGrid className="w-4 h-4" />
          <span>Übersicht</span>
        </button>

        {data?.chapters?.map((ch, i) => (
          <button
            key={ch.id}
            className={`relative flex items-center gap-1.5 px-4 py-2.5 text-sm rounded-t-lg transition-all duration-200 whitespace-nowrap ${isActive(chapterId === ch.id)}`}
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
          className={`flex items-center gap-1.5 px-4 py-2.5 text-sm rounded-t-lg transition-all duration-200 whitespace-nowrap ${isActive(view === 'wissenscheck')}`}
          onClick={openWissencheck}
        >
          <CheckCircle className="w-4 h-4" />
          <span>Wissenscheck</span>
        </button>

        <button
          className={`flex items-center gap-1.5 px-4 py-2.5 text-sm rounded-t-lg transition-all duration-200 whitespace-nowrap text-white/70 hover:text-white hover:bg-white/10`}
          onClick={onGlossary}
        >
          <BookOpen className="w-4 h-4" />
          <span>Glossar</span>
        </button>
      </div>
    </nav>
  );
}
