import { createContext, useContext, useState, useCallback, useMemo, useEffect, useRef } from 'react';
import { buildOptimierung } from '../data/optimierungAgent';
import { ANNAHMEN_DEFAULT, berechneIstAnalyse } from '../data/istAnalyse';
import { CURRENT_USER_DEFAULT } from '../data/biksAgent';

const OptimierungContext = createContext(null);
// v2: Das Aufwandsmodell hat mit der Kontrolldurchfuehrung neue Annahmen
// bekommen. Der Schluessel ist mitversioniert, damit gespeicherte Staende der
// Vorversion nicht in die neue Struktur laufen.
const STORAGE_KEY = 'controlhub_optimierung_v2';

/**
 * Gespeicherte Annahmen gegen die Standardannahmen mergen.
 *
 * Ergebnis hat immer exakt die Struktur von ANNAHMEN_DEFAULT: fehlende oder
 * unbekannte Schluessel fallen auf den Standard zurueck, nur gueltige Zahlen
 * werden uebernommen. Damit kann ein alter oder manipulierter Eintrag im
 * localStorage die Berechnung nicht mehr zum Absturz bringen.
 */
function mergeAnnahmen(gespeichert) {
  if (!gespeichert || typeof gespeichert !== 'object') return ANNAHMEN_DEFAULT;
  const zahl = (v) => typeof v === 'number' && Number.isFinite(v);
  const out = {};
  for (const [key, standard] of Object.entries(ANNAHMEN_DEFAULT)) {
    const wert = gespeichert[key];
    if (standard && typeof standard === 'object') {
      out[key] = { ...standard };
      if (wert && typeof wert === 'object') {
        for (const unterKey of Object.keys(standard)) {
          if (zahl(wert[unterKey])) out[key][unterKey] = wert[unterKey];
        }
      }
    } else {
      out[key] = zahl(wert) ? wert : standard;
    }
  }
  return out;
}

function clone(obj) { return JSON.parse(JSON.stringify(obj)); }

function loadPersisted() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed?.optimierung) return parsed;
    }
  } catch {}
  return null;
}

export function OptimierungProvider({ children }) {
  const persisted = useRef(loadPersisted()).current;
  // phase: 'idle' | 'processing' | 'result'
  const [phase, setPhase] = useState(persisted?.optimierung ? 'result' : 'idle');
  const [optimierung, setOptimierung] = useState(persisted?.optimierung || null);
  const [currentUser, setCurrentUser] = useState(persisted?.currentUser || CURRENT_USER_DEFAULT);
  const [pendingInput, setPendingInput] = useState(null);
  // Überschreibbare Annahmen des Prüfaufwandsmodells.
  const [annahmen, setAnnahmen] = useState(() => mergeAnnahmen(persisted?.annahmen));

  useEffect(() => {
    try {
      if (optimierung) localStorage.setItem(STORAGE_KEY, JSON.stringify({ optimierung, currentUser, annahmen }));
      else localStorage.removeItem(STORAGE_KEY);
    } catch {}
  }, [optimierung, currentUser, annahmen]);

  const startProcessing = useCallback((input) => {
    setPendingInput(input);
    setPhase('processing');
    return input;
  }, []);

  const finishProcessing = useCallback(() => {
    const result = buildOptimierung(pendingInput || {}, { nowTs: Date.now() });
    setOptimierung(result);
    setPendingInput(null);
    setPhase('result');
    return result;
  }, [pendingInput]);

  const resetOptimierung = useCallback(() => {
    setOptimierung(null);
    setPendingInput(null);
    setPhase('idle');
  }, []);

  // --- Annahmen des Prüfaufwandsmodells -----------------------------------
  // Skalare Annahme setzen (z. B. stundenProPT).
  const setAnnahme = useCallback((key, wert) => {
    setAnnahmen(prev => ({ ...prev, [key]: wert }));
  }, []);

  // Verschachtelte Annahme setzen (stichprobe / minutenJeStichprobe).
  const setAnnahmeDetail = useCallback((key, unterKey, wert) => {
    setAnnahmen(prev => ({ ...prev, [key]: { ...prev[key], [unterKey]: wert } }));
  }, []);

  const resetAnnahmen = useCallback(() => setAnnahmen(ANNAHMEN_DEFAULT), []);

  // IST-Analyse rechnet bei jeder Annahmenänderung neu durch.
  const istAnalyse = useMemo(() => berechneIstAnalyse(annahmen), [annahmen]);
  const istAnalyseStandard = useMemo(() => berechneIstAnalyse(ANNAHMEN_DEFAULT), []);
  const annahmenGeaendert = useMemo(
    () => JSON.stringify(annahmen) !== JSON.stringify(ANNAHMEN_DEFAULT),
    [annahmen]
  );

  // --- Kollaboration auf Empfehlungen -------------------------------------
  const mutateEmpfehlung = useCallback((empfId, fn) => {
    setOptimierung(prev => {
      if (!prev) return prev;
      const next = clone(prev);
      const e = next.empfehlungen.find(x => x.id === empfId);
      if (!e) return prev;
      fn(e, next);
      return next;
    });
  }, []);

  const setEmpfehlungStatus = useCallback((empfId, status) => {
    mutateEmpfehlung(empfId, (e) => { e.status = status; });
  }, [mutateEmpfehlung]);

  const assignEmpfehlung = useCallback((empfId, userId) => {
    mutateEmpfehlung(empfId, (e) => { e.assignedTo = userId; });
  }, [mutateEmpfehlung]);

  const addEmpfehlungComment = useCallback((empfId, text) => {
    if (!text?.trim()) return;
    mutateEmpfehlung(empfId, (e) => {
      e.comments = [...(e.comments || []), { id: `oc-${empfId}-${Date.now()}`, autorId: currentUser, text: text.trim(), at: Date.now() }];
    });
  }, [mutateEmpfehlung, currentUser]);

  const value = useMemo(() => ({
    phase, setPhase,
    optimierung,
    pendingInput,
    currentUser, setCurrentUser,
    startProcessing, finishProcessing, resetOptimierung,
    setEmpfehlungStatus, assignEmpfehlung, addEmpfehlungComment,
    annahmen, setAnnahme, setAnnahmeDetail, resetAnnahmen, annahmenGeaendert,
    istAnalyse, istAnalyseStandard,
  }), [
    phase, optimierung, pendingInput, currentUser,
    startProcessing, finishProcessing, resetOptimierung,
    setEmpfehlungStatus, assignEmpfehlung, addEmpfehlungComment,
    annahmen, setAnnahme, setAnnahmeDetail, resetAnnahmen, annahmenGeaendert,
    istAnalyse, istAnalyseStandard,
  ]);

  return <OptimierungContext.Provider value={value}>{children}</OptimierungContext.Provider>;
}

export function useOptimierung() {
  return useContext(OptimierungContext);
}
