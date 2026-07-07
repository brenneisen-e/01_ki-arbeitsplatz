import { createContext, useContext, useState, useCallback, useMemo, useEffect, useRef } from 'react';
import { buildOptimierung } from '../data/optimierungAgent';
import { CURRENT_USER_DEFAULT } from '../data/biksAgent';

const OptimierungContext = createContext(null);
const STORAGE_KEY = 'biks_optimierung_state_v1';

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

  useEffect(() => {
    try {
      if (optimierung) localStorage.setItem(STORAGE_KEY, JSON.stringify({ optimierung, currentUser }));
      else localStorage.removeItem(STORAGE_KEY);
    } catch {}
  }, [optimierung, currentUser]);

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
  }), [
    phase, optimierung, pendingInput, currentUser,
    startProcessing, finishProcessing, resetOptimierung,
    setEmpfehlungStatus, assignEmpfehlung, addEmpfehlungComment,
  ]);

  return <OptimierungContext.Provider value={value}>{children}</OptimierungContext.Provider>;
}

export function useOptimierung() {
  return useContext(OptimierungContext);
}
