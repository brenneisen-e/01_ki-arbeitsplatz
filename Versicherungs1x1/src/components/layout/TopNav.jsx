import { useModule } from '../../hooks/useModule';
import { LayoutGrid, CheckCircle, BookOpen } from '../../components/ui/Icons';

export default function TopNav({ onGlossary }) {
  const { data, view, chapterId, visited, openChapter, showOverview, openWissencheck } = useModule();

  return (
    <nav className="bg-[#1a1a2e] border-b border-white/10">
      <div className="flex items-center overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
        <button
          className={`topnav-item ${view === 'overview' ? 'active' : ''}`}
          onClick={showOverview}
        >
          <LayoutGrid className="w-4 h-4" />
          <span>Übersicht</span>
        </button>

        {data?.chapters?.map((ch, i) => (
          <button
            key={ch.id}
            className={`topnav-item ${chapterId === ch.id ? 'active' : ''}`}
            onClick={() => openChapter(ch.id)}
          >
            <span className="text-xs opacity-60">{String(i + 1).padStart(2, '0')}</span>
            <span className="hidden lg:inline truncate max-w-[120px]">{ch.title}</span>
            {visited.includes(ch.id) && <span className="visited-dot" />}
          </button>
        ))}

        <div className="w-px h-6 bg-white/10 mx-1 flex-shrink-0" />

        <button
          className={`topnav-item ${view === 'wissenscheck' ? 'active' : ''}`}
          onClick={openWissencheck}
        >
          <CheckCircle className="w-4 h-4" />
          <span>Wissenscheck</span>
        </button>

        <button className="topnav-item" onClick={onGlossary}>
          <BookOpen className="w-4 h-4" />
          <span>Glossar</span>
        </button>
      </div>
    </nav>
  );
}
