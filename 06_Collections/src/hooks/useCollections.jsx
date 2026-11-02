import { createContext, useCallback, useContext, useMemo, useState } from 'react';

const CollectionsContext = createContext(null);

const LEER_FILTER = { segment: '', produkt: '', suche: '', dpdBucket: '', ids: null };

/**
 * Zentraler Zustand des Collections-Moduls: aktive Sicht, Filter der
 * Kundenliste, geoeffnete Overlays, Zustand der Next-Best-Action-Queue und
 * der Agenten-Freigaben sowie die Toast-Warteschlange.
 */
export function CollectionsProvider({ children }) {
  const [section, setSection] = useState('cockpit');
  const [filter, setFilter] = useState(LEER_FILTER);
  const [detailKunde, setDetailKunde] = useState(null);   // Schnellblick: { id }
  const [crmKunde, setCrmKunde] = useState(null);         // Akte: { id, hinweis?, sektion? }
  const [scannerOffen, setScannerOffen] = useState(false);
  const [chatOffen, setChatOffen] = useState(false);
  const [feedbackOffen, setFeedbackOffen] = useState(false);
  // Schluessel aus der NBA-Queue, die erledigt, verschoben oder verworfen wurden.
  const [nbaEntfernt, setNbaEntfernt] = useState(() => new Set());
  // Erteilte Agenten-Freigaben ("kundeId:aktionId").
  const [freigegeben, setFreigegeben] = useState(() => new Set());
  const [toasts, setToasts] = useState([]);

  const toast = useCallback((text, art = 'info') => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    setToasts(t => [...t, { id, text, art }]);
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 4000);
  }, []);

  const schliesseToast = useCallback(id => {
    setToasts(t => t.filter(x => x.id !== id));
  }, []);

  const gotoSection = useCallback(id => {
    setSection(id);
    setCrmKunde(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const setzeFilter = useCallback(patch => {
    setFilter(f => ({ ...f, ...patch }));
  }, []);

  const filterZuruecksetzen = useCallback(() => setFilter(LEER_FILTER), []);

  // Springt zur Kundenliste im Portfolio und filtert auf eine konkrete ID-Menge.
  const zeigeKunden = useCallback((ids, hinweis) => {
    setFilter({ ...LEER_FILTER, ids });
    setSection('portfolio');
    setCrmKunde(null);
    setChatOffen(false);
    if (hinweis) toast(hinweis, 'info');
    requestAnimationFrame(() => {
      document.getElementById('kundenliste')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  }, [toast]);

  const oeffneKunde = useCallback(id => {
    setDetailKunde({ id });
  }, []);

  const oeffneCrm = useCallback((id, opts = {}) => {
    setDetailKunde(null);
    setCrmKunde({ id, hinweis: opts.hinweis || null, sektion: opts.sektion || 'overview' });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const nbaEntfernen = useCallback(key => {
    setNbaEntfernt(prev => new Set(prev).add(key));
  }, []);

  const freigabeErteilen = useCallback(key => {
    setFreigegeben(prev => new Set(prev).add(key));
  }, []);

  const value = useMemo(() => ({
    section, gotoSection,
    filter, setzeFilter, filterZuruecksetzen, zeigeKunden,
    detailKunde, oeffneKunde, schliesseKunde: () => setDetailKunde(null),
    crmKunde, oeffneCrm, schliesseCrm: () => setCrmKunde(null),
    scannerOffen, setScannerOffen,
    chatOffen, setChatOffen,
    feedbackOffen, setFeedbackOffen,
    nbaEntfernt, nbaEntfernen,
    freigegeben, freigabeErteilen,
    toasts, toast, schliesseToast,
  }), [section, gotoSection, filter, setzeFilter, filterZuruecksetzen, zeigeKunden,
       detailKunde, oeffneKunde, crmKunde, oeffneCrm, scannerOffen, chatOffen,
       feedbackOffen, nbaEntfernt, nbaEntfernen, freigegeben, freigabeErteilen,
       toasts, toast, schliesseToast]);

  return <CollectionsContext.Provider value={value}>{children}</CollectionsContext.Provider>;
}

export function useCollections() {
  const ctx = useContext(CollectionsContext);
  if (!ctx) throw new Error('useCollections muss innerhalb von CollectionsProvider verwendet werden');
  return ctx;
}
