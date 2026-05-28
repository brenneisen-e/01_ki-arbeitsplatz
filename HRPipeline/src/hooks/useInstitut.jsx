import { createContext, useContext, useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { INSTITUT_VARIANTEN, DEFAULT_INSTITUT } from '../data/institutConfig';

const InstitutContext = createContext(null);

export function InstitutProvider({ children }) {
  const [selected, setSelected] = useState(() => {
    try {
      const saved = localStorage.getItem('hp_institut');
      if (saved) {
        const parsed = JSON.parse(saved);
        return INSTITUT_VARIANTEN.find(v => v.institut === parsed.institut) || DEFAULT_INSTITUT;
      }
    } catch {}
    return DEFAULT_INSTITUT;
  });

  const containerRef = useRef(null);

  const switchInstitut = useCallback((variant) => {
    setSelected(variant);
    localStorage.setItem('hp_institut', JSON.stringify({ institut: variant.institut }));
  }, []);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const c = selected.colors;
    el.style.setProperty('--mode-primary', c.primary);
    el.style.setProperty('--mode-primary-light', c.primaryLight);
    el.style.setProperty('--mode-gradient', c.gradient);
    if (c.accent) el.style.setProperty('--mode-accent', c.accent);
    el.style.setProperty('--ai-primary', c.primary);
    el.style.setProperty('--ai-primary-light', c.primaryLight);
    el.style.setProperty('--ai-gradient', c.gradient);
  }, [selected]);

  const value = useMemo(() => ({
    institut: selected,
    varianten: INSTITUT_VARIANTEN,
    switchInstitut,
  }), [selected, switchInstitut]);

  return (
    <InstitutContext.Provider value={value}>
      <div ref={containerRef}>
        {children}
      </div>
    </InstitutContext.Provider>
  );
}

export function useInstitut() {
  return useContext(InstitutContext);
}
