import { createContext, useContext, useState, useCallback } from 'react';
import { MODE_CONFIGS } from '../data/modeConfig';

const ModeContext = createContext(null);

export function ModeProvider({ children }) {
  const [modeId, setModeId] = useState('versicherung');
  const [currentView, setCurrentView] = useState('landing'); // landing | overview | detail
  const [activeTab, setActiveTab] = useState('uebersicht');
  const [selectedKundeId, setSelectedKundeId] = useState(null);

  const config = MODE_CONFIGS[modeId];

  const switchMode = useCallback((newModeId) => {
    setModeId(newModeId);
    setCurrentView('overview');
    setActiveTab('uebersicht');
    setSelectedKundeId(null);
  }, []);

  const navigateTo = useCallback((view, opts = {}) => {
    setCurrentView(view);
    if (opts.tab) setActiveTab(opts.tab);
    if (opts.kundeId !== undefined) setSelectedKundeId(opts.kundeId);
    if (view === 'overview') {
      setActiveTab(opts.tab || 'uebersicht');
      setSelectedKundeId(null);
    }
    if (view === 'detail' && opts.tab) setActiveTab(opts.tab);
    if (view === 'detail' && !opts.tab) setActiveTab(config.detailTabs[0]?.id || 'stammdaten');
    if (view === 'landing') {
      setSelectedKundeId(null);
    }
  }, [config]);

  const goBack = useCallback(() => {
    if (currentView === 'detail') {
      setCurrentView('overview');
      setActiveTab('kunden');
    } else if (currentView === 'overview') {
      setCurrentView('landing');
    }
  }, [currentView]);

  return (
    <ModeContext.Provider value={{
      modeId, config, currentView, activeTab, selectedKundeId,
      switchMode, navigateTo, setActiveTab, setSelectedKundeId, goBack,
    }}>
      <div data-mode={modeId}>
        {children}
      </div>
    </ModeContext.Provider>
  );
}

export function useMode() {
  const ctx = useContext(ModeContext);
  if (!ctx) throw new Error('useMode must be inside ModeProvider');
  return ctx;
}
