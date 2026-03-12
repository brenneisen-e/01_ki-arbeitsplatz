import { createContext, useContext, useState, useCallback, useMemo, useEffect, useRef } from 'react';
import { MODE_CONFIGS } from '../data/modeConfig';

const ModeContext = createContext(null);

/* ── Legacy module definitions ─────────────────────────────── */

const LEGACY_MODULES = {
  'dashboard':           { title: 'VST-Cockpit',             route: 'dashboard' },
  'agentur':             { title: 'Vermittler-Ansicht (v01)', route: 'agentur' },
  'potentialanalyse':    { title: 'Potentialanalyse',         route: 'potentialanalyse' },
  'risikoscoring':       { title: 'Vermittler-Scoring',       route: 'risikoscoring' },
  'bgav-umstellung':     { title: 'Vertragsumstellung',       route: 'bgav-umstellung' },
  'bestandsuebertragung':{ title: 'Bestandsübertragung',      route: 'bestandsuebertragung' },
  'pmo-toolbox':         { title: 'PMO Toolbox',              route: 'pmo-toolbox' },
  'hr-pipeline':         { title: 'HR Pipeline',              route: 'hr-pipeline' },
  'versicherungs-1x1':   { title: 'Versicherungs-1×1',        route: 'versicherungs-1x1' },
  'kreditanalyse':       { title: 'KI-Kreditanalyse',         route: 'kreditanalyse' },
};

/* ── Hash-URL helpers ──────────────────────────────────────── */

function buildHash(modeId, view, tab, kundeId, legacyModuleId) {
  // Legacy: #/module/dashboard
  if (view === 'legacy' && legacyModuleId) {
    return `#/module/${legacyModuleId}`;
  }
  // React: #/versicherung/overview/uebersicht
  //        #/versicherung/detail/KD00001/stammdaten
  let hash = `#/${modeId}/${view}`;
  if (view === 'detail' && kundeId) hash += `/${kundeId}`;
  if (tab) hash += `/${tab}`;
  return hash;
}

function parseHash(hash) {
  const raw = hash.replace(/^#\/?/, '');
  const parts = raw.split('/').filter(Boolean);

  // Check for legacy module route: #/module/dashboard
  if (parts[0] === 'module' && parts.length >= 2 && LEGACY_MODULES[parts[1]]) {
    return {
      modeId: 'versicherung',
      view: 'legacy',
      tab: null,
      kundeId: null,
      legacyModuleId: parts[1],
    };
  }

  // Default: versicherung / overview / uebersicht
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

  return { modeId, view, tab, kundeId, legacyModuleId: null };
}

/* ── Provider ──────────────────────────────────────────────── */

export function ModeProvider({ children }) {
  const initial = parseHash(window.location.hash);

  const [modeId, setModeId] = useState(initial.modeId);
  const [currentView, setCurrentView] = useState(initial.view);  // 'overview' | 'detail' | 'legacy'
  const [activeTab, setActiveTab] = useState(initial.tab || 'uebersicht');
  const [selectedKundeId, setSelectedKundeId] = useState(initial.kundeId);
  const [institutOverride, setInstitutOverride] = useState(null);
  const [legacyModuleId, setLegacyModuleId] = useState(initial.legacyModuleId);

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

  // Legacy module info (for LegacyModule component)
  const legacyInfo = legacyModuleId ? LEGACY_MODULES[legacyModuleId] : null;
  const legacyRoute = legacyInfo?.route || '';
  const legacyTitle = legacyInfo?.title || '';

  /* ── Sync state → URL ────────────────────────────────────── */
  useEffect(() => {
    if (skipNextPush.current) {
      skipNextPush.current = false;
      return;
    }
    const newHash = buildHash(modeId, currentView, activeTab, selectedKundeId, legacyModuleId);
    if (window.location.hash !== newHash) {
      window.history.pushState(null, '', newHash);
    }
  }, [modeId, currentView, activeTab, selectedKundeId, legacyModuleId]);

  /* ── Browser back/forward ────────────────────────────────── */
  useEffect(() => {
    function onPopState() {
      const parsed = parseHash(window.location.hash);
      skipNextPush.current = true;
      setModeId(parsed.modeId);
      setCurrentView(parsed.view);
      setActiveTab(parsed.tab || getDefaultTab(parsed.modeId, parsed.view));
      setSelectedKundeId(parsed.kundeId);
      setLegacyModuleId(parsed.legacyModuleId);
      setInstitutOverride(null);
    }
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  /* ── Set initial hash if empty ───────────────────────────── */
  useEffect(() => {
    if (!window.location.hash || window.location.hash === '#' || window.location.hash === '#/') {
      const newHash = buildHash(modeId, currentView, activeTab, selectedKundeId, legacyModuleId);
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
    setLegacyModuleId(null);
  }, []);

  const switchInstitut = useCallback((variant, newModeId) => {
    if (newModeId && newModeId !== modeId) {
      setModeId(newModeId);
      setCurrentView('overview');
      setActiveTab('uebersicht');
      setSelectedKundeId(null);
      setLegacyModuleId(null);
    }
    setInstitutOverride(variant);
  }, [modeId]);

  const navigateTo = useCallback((view, opts = {}) => {
    setCurrentView(view);
    setLegacyModuleId(null);
    if (view === 'overview') {
      setActiveTab(opts.tab || 'uebersicht');
      setSelectedKundeId(null);
    } else if (view === 'detail') {
      if (opts.kundeId !== undefined) setSelectedKundeId(opts.kundeId);
      setActiveTab(opts.tab || config.detailTabs[0]?.id || 'stammdaten');
    }
  }, [config]);

  const openLegacyModule = useCallback((moduleId) => {
    if (!LEGACY_MODULES[moduleId]) {
      console.warn('Unknown legacy module:', moduleId);
      return;
    }
    setCurrentView('legacy');
    setLegacyModuleId(moduleId);
    setSelectedKundeId(null);
  }, []);

  const goBack = useCallback(() => {
    if (currentView === 'detail') {
      const kundenTab = baseConfig.tabs.find(t =>
        t.id === 'kunden' || t.id === 'mandatsliste'
      );
      setCurrentView('overview');
      setActiveTab(kundenTab?.id || 'kunden');
      setSelectedKundeId(null);
      setLegacyModuleId(null);
    } else if (currentView === 'legacy' || currentView === 'overview') {
      // Back to landing page
      window.location.href = getBasePath();
    }
  }, [currentView, baseConfig]);

  return (
    <ModeContext.Provider value={{
      modeId, config, currentView, activeTab, selectedKundeId,
      legacyRoute, legacyTitle, legacyModuleId,
      switchMode, switchInstitut, navigateTo, openLegacyModule,
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
