import { createContext, useContext, useState, useEffect, useCallback } from 'react';

const ModuleContext = createContext(null);

export function ModuleProvider({ children }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [view, setView] = useState('overview'); // overview | chapter | wissenscheck
  const [chapterId, setChapterId] = useState(null);
  const [subChapterId, setSubChapterId] = useState(null);
  const [visited, setVisited] = useState([]);

  useEffect(() => {
    fetch('./data/chapters.json')
      .then(r => { if (!r.ok) throw new Error('Failed'); return r.json(); })
      .then(d => { setData(d); setLoading(false); })
      .catch(e => { setError(e.message); setLoading(false); });
  }, []);

  // Hash-based routing
  useEffect(() => {
    const handle = () => {
      const hash = window.location.hash.slice(1);
      if (!hash) { setView('overview'); return; }
      const parts = hash.split('/');
      if (parts[0] === 'chapter' && parts[1]) {
        setChapterId(parts[1]);
        setSubChapterId(parts[2] || null);
        setView('chapter');
      } else if (parts[0] === 'wissenscheck') {
        setView('wissenscheck');
      } else if (parts[0] === 'overview') {
        setView('overview');
      }
    };
    handle();
    window.addEventListener('hashchange', handle);
    return () => window.removeEventListener('hashchange', handle);
  }, []);

  const navigate = useCallback((newView, id, subId) => {
    if (newView === 'overview') {
      window.location.hash = '#overview';
    } else if (newView === 'chapter') {
      window.location.hash = subId ? `#chapter/${id}/${subId}` : `#chapter/${id}`;
    } else if (newView === 'wissenscheck') {
      window.location.hash = '#wissenscheck';
    }
  }, []);

  const openChapter = useCallback((id, subId) => {
    setVisited(prev => prev.includes(id) ? prev : [...prev, id]);
    navigate('chapter', id, subId);
  }, [navigate]);

  const showOverview = useCallback(() => navigate('overview'), [navigate]);
  const openWissencheck = useCallback(() => navigate('wissenscheck'), [navigate]);

  const openSubChapter = useCallback((chapId, subId) => {
    navigate('chapter', chapId, subId);
  }, [navigate]);

  const chapter = data?.chapters?.find(c => c.id === chapterId) || null;
  const chapterIndex = data?.chapters?.findIndex(c => c.id === chapterId) ?? -1;

  return (
    <ModuleContext.Provider value={{
      data, loading, error,
      view, chapterId, subChapterId, setSubChapterId,
      chapter, chapterIndex,
      visited,
      openChapter, showOverview, openWissencheck, openSubChapter,
    }}>
      {children}
    </ModuleContext.Provider>
  );
}

export function useModule() {
  const ctx = useContext(ModuleContext);
  if (!ctx) throw new Error('useModule must be used within ModuleProvider');
  return ctx;
}
