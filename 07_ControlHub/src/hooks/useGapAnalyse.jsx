import { createContext, useContext, useState, useCallback, useMemo, useEffect, useRef } from 'react';
import { buildGapAnalyse } from '../data/gapAnalyseAgent';
import { CURRENT_USER_DEFAULT } from '../data/biksAgent';

const GapAnalyseContext = createContext(null);
const STORAGE_KEY = 'iks_gapanalyse_state_v1';

function clone(obj) { return JSON.parse(JSON.stringify(obj)); }

function loadPersisted() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed?.analyse) return parsed;
    }
  } catch {}
  return null;
}

export function GapAnalyseProvider({ children }) {
  const persisted = useRef(loadPersisted()).current;
  // phase: 'idle' | 'processing' | 'result'
  const [phase, setPhase] = useState(persisted?.analyse ? 'result' : 'idle');
  const [analyse, setAnalyse] = useState(persisted?.analyse || null);
  const [currentUser, setCurrentUser] = useState(persisted?.currentUser || CURRENT_USER_DEFAULT);
  const [pendingInput, setPendingInput] = useState(null);

  useEffect(() => {
    try {
      if (analyse) localStorage.setItem(STORAGE_KEY, JSON.stringify({ analyse, currentUser }));
      else localStorage.removeItem(STORAGE_KEY);
    } catch {}
  }, [analyse, currentUser]);

  const startProcessing = useCallback((input) => {
    setPendingInput(input);
    setPhase('processing');
    return input;
  }, []);

  const finishProcessing = useCallback(() => {
    const result = buildGapAnalyse(pendingInput || {}, { nowTs: Date.now() });
    setAnalyse(result);
    setPendingInput(null);
    setPhase('result');
    return result;
  }, [pendingInput]);

  const resetGapAnalyse = useCallback(() => {
    setAnalyse(null);
    setPendingInput(null);
    setPhase('idle');
  }, []);

  // --- Kollaboration auf Befunden ------------------------------------------
  const mutateGap = useCallback((gapId, fn) => {
    setAnalyse(prev => {
      if (!prev) return prev;
      const next = clone(prev);
      const g = next.gaps.find(x => x.id === gapId);
      if (!g) return prev;
      fn(g, next);
      return next;
    });
  }, []);

  const setGapStatus = useCallback((gapId, status) => {
    mutateGap(gapId, (g) => { g.status = status; });
  }, [mutateGap]);

  const assignGap = useCallback((gapId, userId) => {
    mutateGap(gapId, (g) => { g.assignedTo = userId; });
  }, [mutateGap]);

  const addGapComment = useCallback((gapId, text) => {
    if (!text?.trim()) return;
    mutateGap(gapId, (g) => {
      g.comments = [...(g.comments || []), { id: `gc-${gapId}-${Date.now()}`, autorId: currentUser, text: text.trim(), at: Date.now() }];
    });
  }, [mutateGap, currentUser]);

  const value = useMemo(() => ({
    phase, setPhase,
    analyse,
    pendingInput,
    currentUser, setCurrentUser,
    startProcessing, finishProcessing, resetGapAnalyse,
    setGapStatus, assignGap, addGapComment,
  }), [
    phase, analyse, pendingInput, currentUser,
    startProcessing, finishProcessing, resetGapAnalyse,
    setGapStatus, assignGap, addGapComment,
  ]);

  return <GapAnalyseContext.Provider value={value}>{children}</GapAnalyseContext.Provider>;
}

export function useGapAnalyse() {
  return useContext(GapAnalyseContext);
}
