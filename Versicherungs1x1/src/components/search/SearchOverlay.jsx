import { useState, useEffect, useRef } from 'react';
import { useModule } from '../../hooks/useModule';
import { Search } from '../ui/Icons';

export default function SearchOverlay({ onClose }) {
  const { data, openChapter } = useModule();
  const [query, setQuery] = useState('');
  const inputRef = useRef(null);

  useEffect(() => {
    inputRef.current?.focus();
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  const ql = query.toLowerCase().trim();
  const results = [];
  if (ql.length >= 1 && data) {
    data.chapters?.forEach(ch => {
      if (ch.title.toLowerCase().includes(ql)) {
        results.push({ type: 'chapter', label: ch.title, id: ch.id });
      }
    });
    data.glossary?.forEach(g => {
      if (g.term.toLowerCase().includes(ql) || g.definition.toLowerCase().includes(ql)) {
        results.push({ type: 'glossary', label: g.term, sub: g.definition.slice(0, 80) + '…' });
      }
    });
  }

  return (
    <div className="search-overlay" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="search-panel">
        <div className="flex items-center gap-3 px-5 py-4 border-b border-slate-200">
          <Search className="w-5 h-5 text-slate-400" />
          <input ref={inputRef} type="text" value={query} onChange={e => setQuery(e.target.value)} placeholder="Kapitel oder Begriff suchen…" className="flex-1 text-base outline-none bg-transparent" />
          <button onClick={onClose} className="text-xs text-slate-400 bg-slate-100 px-2 py-1 rounded font-mono">Esc</button>
        </div>
        <div className="max-h-[50vh] overflow-y-auto">
          {ql.length < 1 && <div className="px-5 py-8 text-sm text-slate-400 text-center">Tippe um zu suchen — Kapitel, Glossar, Begriffe</div>}
          {ql.length >= 1 && results.length === 0 && <div className="px-5 py-8 text-sm text-slate-400 text-center">Keine Treffer für „{query}"</div>}
          {results.slice(0, 10).map((r, i) => (
            <button key={i} className="w-full text-left px-5 py-3 hover:bg-slate-50 transition flex items-start gap-3 border-b border-slate-100" onClick={() => { if (r.type === 'chapter') openChapter(r.id); onClose(); }}>
              <span className={`text-[10px] font-bold uppercase px-1.5 py-0.5 rounded ${r.type === 'chapter' ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-100 text-blue-700'}`}>
                {r.type === 'chapter' ? 'Kapitel' : 'Glossar'}
              </span>
              <div className="flex-1 min-w-0">
                <div className="font-medium text-sm text-slate-800 truncate">{r.label}</div>
                {r.sub && <div className="text-xs text-slate-500 truncate">{r.sub}</div>}
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
