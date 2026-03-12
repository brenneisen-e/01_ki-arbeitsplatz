import { createContext, useContext, useState, useCallback, useMemo } from 'react';
import { MODE_CONFIGS } from '../data/modeConfig';

function getInitialView() {
  return 'landing';
}

const ModeContext = createContext(null);

export function ModeProvider({ children }) {
  const [modeId, setModeId] = useState('versicherung');
  const [currentView, setCurrentView] = useState(getInitialView); // landing | overview | detail
  const [activeTab, setActiveTab] = useState('uebersicht');
  const [selectedKundeId, setSelectedKundeId] = useState(null);
  const [institutOverride, setInstitutOverride] = useState(null);

  const baseConfig = MODE_CONFIGS[modeId];

  // Merge institut override into config
  const config = useMemo(() => {
    if (!institutOverride) return baseConfig;
    return {
      ...baseConfig,
      institut: institutOverride.institut,
      beraterTitel: institutOverride.beraterTitel || baseConfig.beraterTitel,
      colors: institutOverride.colors || baseConfig.colors,
    };
  }, [baseConfig, institutOverride]);

  const switchMode = useCallback((newModeId) => {
    setModeId(newModeId);
    setInstitutOverride(null);
    setCurrentView('overview');
    setActiveTab('uebersicht');
    setSelectedKundeId(null);
  }, []);

  const switchInstitut = useCallback((variant, newModeId) => {
    if (newModeId && newModeId !== modeId) {
      setModeId(newModeId);
      setCurrentView('overview');
      setActiveTab('uebersicht');
      setSelectedKundeId(null);
    }
    setInstitutOverride(variant);
  }, [modeId]);

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
      // Navigate back to root landing page
      window.location.href = '../';
    }
  }, [currentView]);

  return (
    <ModeContext.Provider value={{
      modeId, config, currentView, activeTab, selectedKundeId,
      switchMode, switchInstitut, navigateTo, setActiveTab, setSelectedKundeId, goBack,
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
