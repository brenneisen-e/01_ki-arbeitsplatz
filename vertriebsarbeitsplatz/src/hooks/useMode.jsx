import { createContext, useContext, useState, useCallback, useMemo, useEffect, useRef } from 'react';
import { MODE_CONFIGS } from '../data/modeConfig';

const ModeContext = createContext(null);

/* ── Hash-URL helpers ──────────────────────────────────────── */

function buildHash(modeId, view, tab, kundeId) {
  let hash = `#/${modeId}/${view}`;
  if (view === 'detail' && kundeId) hash += `/${kundeId}`;
  if (tab) hash += `/${tab}`;
  return hash;
}

function parseHash(hash) {
  const raw = hash.replace(/^#\/?/, '');
  const parts = raw.split('/').filter(Boolean);

  let modeId = 'versicherung';
  let view = 'overview';
  let tab = null;
  let kundeId = null;

  if (parts.length >= 1 && MODE_CONFIGS[parts[0]]) {
    modeId = parts[0];
  }

  if (parts.length >= 2) {
    if (parts[1] === 'detail' || parts[1] === 'overview') {
      view = parts[1];
    }
  }

  if (view === 'detail') {
    if (parts.length >= 3) kundeId = parts[2];
    if (parts.length >= 4) tab = parts[3];
  } else {
    if (parts.length >= 3) tab = parts[2];
  }

  return { modeId, view, tab, kundeId };
}

/* ── Provider ──────────────────────────────────────────────── */

export function ModeProvider({ children }) {
  const initial = parseHash(window.location.hash);

  const [modeId, setModeId] = useState(initial.modeId);
  const [currentView, setCurrentView] = useState(initial.view);
  const [activeTab, setActiveTab] = useState(initial.tab || 'uebersicht');
  const [selectedKundeId, setSelectedKundeId] = useState(initial.kundeId);
  const [institutOverride, setInstitutOverride] = useState(null);

  const skipNextPush = useRef(false);

  const baseConfig = MODE_CONFIGS[modeId];
  const config = useMemo(() => {
    if (!institutOverride) return baseConfig;
    return {
      ...baseConfig,
      institut: institutOverride.institut,
      beraterTitel: institutOverride.beraterTitel || baseConfig.beraterTitel,
      colors: institutOverride.colors || baseConfig.colors,
    };
  }, [baseConfig, institutOverride]);

  /* ── Sync state → URL ────────────────────────────────────── */
  useEffect(() => {
    if (skipNextPush.current) {
      skipNextPush.current = false;
      return;
    }
    const newHash = buildHash(modeId, currentView, activeTab, selectedKundeId);
    if (window.location.hash !== newHash) {
      window.history.pushState(null, '', newHash);
    }
  }, [modeId, currentView, activeTab, selectedKundeId]);

  /* ── Browser back/forward ────────────────────────────────── */
  useEffect(() => {
    function onHashChange() {
      const parsed = parseHash(window.location.hash);
      skipNextPush.current = true;
      setModeId(parsed.modeId);
      setCurrentView(parsed.view);
      setActiveTab(parsed.tab || getDefaultTab(parsed.modeId, parsed.view));
      setSelectedKundeId(parsed.kundeId);
      setInstitutOverride(null);
    }
    window.addEventListener('popstate', onHashChange);
    window.addEventListener('hashchange', onHashChange);
    return () => {
      window.removeEventListener('popstate', onHashChange);
      window.removeEventListener('hashchange', onHashChange);
    };
  }, []);

  /* ── Set initial hash if empty ───────────────────────────── */
  useEffect(() => {
    if (!window.location.hash || window.location.hash === '#' || window.location.hash === '#/') {
      const newHash = buildHash(modeId, currentView, activeTab, selectedKundeId);
      window.history.replaceState(null, '', newHash);
    }
  }, []);

  /* ── Navigation methods ──────────────────────────────────── */

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
    if (view === 'overview') {
      setActiveTab(opts.tab || 'uebersicht');
      setSelectedKundeId(null);
    } else if (view === 'detail') {
      if (opts.kundeId !== undefined) setSelectedKundeId(opts.kundeId);
      setActiveTab(opts.tab || config.detailTabs[0]?.id || 'stammdaten');
    }
  }, [config]);

  const goBack = useCallback(() => {
    if (currentView === 'detail') {
      const kundenTab = baseConfig.tabs.find(t =>
        t.id === 'kunden' || t.id === 'mandatsliste'
      );
      setCurrentView('overview');
      setActiveTab(kundenTab?.id || 'kunden');
      setSelectedKundeId(null);
    } else if (currentView === 'overview') {
      window.location.href = getBasePath();
    }
  }, [currentView, baseConfig]);

  return (
    <ModeContext.Provider value={{
      modeId, config, currentView, activeTab, selectedKundeId,
      switchMode, switchInstitut, navigateTo,
      setActiveTab, setSelectedKundeId, goBack,
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

/* ── Utilities ─────────────────────────────────────────────── */

function getDefaultTab(modeId, view) {
  const cfg = MODE_CONFIGS[modeId];
  if (!cfg) return 'uebersicht';
  if (view === 'detail') return cfg.detailTabs[0]?.id || 'stammdaten';
  return 'uebersicht';
}

function getBasePath() {
  const path = window.location.pathname;
  if (path.includes('/vertriebsarbeitsplatz/')) {
    return path.substring(0, path.indexOf('/vertriebsarbeitsplatz/')) + '/';
  }
  return '/';
}
