import { ModuleProvider, useModule } from './hooks/useModule';
import Header from './components/layout/Header';
import Overview from './pages/Overview';
import ChapterView from './pages/ChapterView';
import Wissenscheck from './pages/Wissenscheck';
import SearchOverlay from './components/search/SearchOverlay';
import Glossary from './components/glossary/Glossary';
import { useState } from 'react';

function AppRouter() {
  const { view, loading, error } = useModule();
  const [glossaryOpen, setGlossaryOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-3 border-slate-300 border-t-emerald-600 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-500 text-sm">Daten werden geladen…</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <p className="text-slate-400">Fehler beim Laden der Daten. Bitte Seite neu laden.</p>
      </div>
    );
  }

  let content;
  switch (view) {
    case 'chapter':
      content = <ChapterView />;
      break;
    case 'wissenscheck':
      content = <Wissenscheck />;
      break;
    default:
      content = <Overview />;
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Header
        onGlossary={() => setGlossaryOpen(true)}
        onSearch={() => setSearchOpen(true)}
      />
      <main>
        {content}
      </main>
      {glossaryOpen && <Glossary onClose={() => setGlossaryOpen(false)} />}
      {searchOpen && <SearchOverlay onClose={() => setSearchOpen(false)} />}
    </div>
  );
}

export default function App() {
  return (
    <ModuleProvider>
      <AppRouter />
    </ModuleProvider>
  );
}
