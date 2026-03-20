import { useState, useMemo } from 'react';
import { useModule } from '../../hooks/useModule';
import { X, Search } from '../ui/Icons';

const TAG_ORDER = ['all', 'Markt', 'Produkte', 'Vertrieb', 'Regulatorik', 'Finanzen', 'Technik'];
const ALPHA = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

export default function Glossary({ onClose }) {
  const { data } = useModule();
  const [letterFilter, setLetterFilter] = useState('');
  const [tagFilter, setTagFilter] = useState('all');
  const [textFilter, setTextFilter] = useState('');

  const glossary = data?.glossary || [];

  const usedLetters = useMemo(() => {
    const set = new Set();
    glossary.forEach(g => set.add(g.term.charAt(0).toUpperCase()));
    return set;
  }, [glossary]);

  const allTags = useMemo(() => {
    const set = new Set();
    glossary.forEach(g => g.tags?.forEach(t => set.add(t)));
    const ordered = TAG_ORDER.filter(t => t === 'all' || set.has(t));
    set.forEach(t => { if (!ordered.includes(t)) ordered.push(t); });
    return ordered;
  }, [glossary]);

  const filtered = useMemo(() => {
    let items = glossary.slice();
    if (letterFilter) items = items.filter(g => g.term.charAt(0).toUpperCase() === letterFilter);
    if (tagFilter !== 'all') items = items.filter(g => g.tags?.includes(tagFilter));
    if (textFilter) {
      const q = textFilter.toLowerCase();
      items = items.filter(g => g.term.toLowerCase().includes(q) || g.definition.toLowerCase().includes(q));
    }
    return items.sort((a, b) => a.term.localeCompare(b.term));
  }, [glossary, letterFilter, tagFilter, textFilter]);

  return (
    <div className="glossary-overlay" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="glossary-panel">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 sticky top-0 bg-white z-10">
          <h2 className="text-lg font-bold text-slate-900">Glossar</h2>
          <button onClick={onClose} className="p-1 hover:bg-slate-100 rounded-lg transition">
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>

        <div className="px-5 py-3 space-y-3">
          {/* Alpha */}
          <div className="flex flex-wrap gap-1">
            <button className={`glossary-alpha-btn ${!letterFilter ? 'active' : ''}`} onClick={() => setLetterFilter('')}>Alle</button>
            {ALPHA.map(l => (
              <button key={l} className={`glossary-alpha-btn ${letterFilter === l ? 'active' : ''}`} disabled={!usedLetters.has(l)} onClick={() => setLetterFilter(l)}>{l}</button>
            ))}
          </div>
          {/* Tags */}
          <div className="flex flex-wrap gap-1.5">
            {allTags.map(tag => (
              <button key={tag} className={`text-xs px-2.5 py-1 rounded-full border transition ${tagFilter === tag ? 'bg-emerald-700 text-white border-emerald-700' : 'bg-white text-slate-600 border-slate-200 hover:border-emerald-400'}`} onClick={() => setTagFilter(tag)}>
                {tag === 'all' ? 'Alle' : tag}
              </button>
            ))}
          </div>
          {/* Search */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input type="text" value={textFilter} onChange={e => setTextFilter(e.target.value)} placeholder="Begriff suchen..." className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg text-sm outline-none focus:border-emerald-500" />
          </div>
        </div>

        <div className="px-5 pb-5 space-y-3">
          {filtered.length === 0 && <p className="text-sm text-slate-400 py-4 text-center">Keine Treffer.</p>}
          {filtered.map((g, i) => (
            <div key={i} className="pb-3 border-b border-slate-100">
              <div className="font-semibold text-sm text-slate-800">{g.term}</div>
              <div className="text-sm text-slate-600 mt-1 leading-relaxed">{g.definition}</div>
              {g.tags?.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {g.tags.map(tag => (
                    <span key={tag} className="glossary-tag" onClick={() => setTagFilter(tag)}>{tag}</span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
