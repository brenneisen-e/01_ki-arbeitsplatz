import { createContext, useContext, useState, useCallback, useMemo, useEffect, useRef } from 'react';
import {
  matchProzess, findProzess, buildAnalyse, emptyKontrolle,
  CURRENT_USER_DEFAULT, DEFAULT_STATUS,
} from '../data/biksAgent';

const BiksContext = createContext(null);

const STORAGE_KEY = 'biks_agent_state_v1';

// Deep-clone hilfsfunktion für die (kleine) Analyse-Struktur.
function clone(obj) {
  return JSON.parse(JSON.stringify(obj));
}

// Persistierten Zustand einmalig synchron laden (vermeidet Save-vor-Load-Race).
function loadPersisted() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed?.analyse) return { analyse: parsed.analyse, currentUser: parsed.currentUser || CURRENT_USER_DEFAULT };
    }
  } catch {}
  return null;
}

export function BiksProvider({ children }) {
  const persisted = useRef(loadPersisted()).current;
  // phase: 'idle' | 'processing' | 'result'
  const [phase, setPhase] = useState(persisted?.analyse ? 'result' : 'idle');
  const [analyse, setAnalyse] = useState(persisted?.analyse || null);
  const [currentUser, setCurrentUser] = useState(persisted?.currentUser || CURRENT_USER_DEFAULT);
  const [activeRisikoId, setActiveRisikoId] = useState(null);
  const [pendingInput, setPendingInput] = useState(null);

  // Persistenz speichern
  useEffect(() => {
    try {
      if (analyse) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify({ analyse, currentUser }));
      } else {
        localStorage.removeItem(STORAGE_KEY);
      }
    } catch {}
  }, [analyse, currentUser]);

  // --- Analyse-Lifecycle ---------------------------------------------------
  const startProcessing = useCallback((input) => {
    setPendingInput(input);
    setPhase('processing');
    return input;
  }, []);

  // Wird nach Ablauf der Animation aufgerufen.
  const finishProcessing = useCallback(() => {
    const input = pendingInput || {};
    const prozess = input?.prozessId
      ? (findProzess(input.prozessId) || matchProzess(input?.quelldokument?.name))
      : matchProzess(input?.quelldokument?.name);
    const result = buildAnalyse(prozess, input, { nowTs: Date.now() });
    setAnalyse(result);
    setPendingInput(null);
    setPhase('result');
    return result;
  }, [pendingInput]);

  const resetAnalyse = useCallback(() => {
    setAnalyse(null);
    setActiveRisikoId(null);
    setPendingInput(null);
    setPhase('idle');
  }, []);

  // --- Mutationen ----------------------------------------------------------
  const mutateRisiko = useCallback((risikoId, fn) => {
    setAnalyse(prev => {
      if (!prev) return prev;
      const next = clone(prev);
      const r = next.risiken.find(x => x.id === risikoId);
      if (!r) return prev;
      fn(r, next);
      return next;
    });
  }, []);

  const mutateKontrolle = useCallback((risikoId, kontrolleId, fn) => {
    mutateRisiko(risikoId, (r) => {
      const k = r.schluesselkontrollen.find(x => x.id === kontrolleId);
      if (k) fn(k, r);
    });
  }, [mutateRisiko]);

  const setRisikoStatus = useCallback((risikoId, status, note) => {
    mutateRisiko(risikoId, (r) => {
      r.status = status;
      r.statusHistorie = [...(r.statusHistorie || []), { status, autorId: currentUser, at: Date.now(), note: note || '' }];
    });
  }, [mutateRisiko, currentUser]);

  const setKontrolleStatus = useCallback((risikoId, kontrolleId, status, note) => {
    mutateKontrolle(risikoId, kontrolleId, (k) => {
      k.status = status;
      k.statusHistorie = [...(k.statusHistorie || []), { status, autorId: currentUser, at: Date.now(), note: note || '' }];
    });
  }, [mutateKontrolle, currentUser]);

  const updateRisiko = useCallback((risikoId, patch) => {
    mutateRisiko(risikoId, (r) => { Object.assign(r, patch); });
  }, [mutateRisiko]);

  const updateKontrolle = useCallback((risikoId, kontrolleId, patch) => {
    mutateKontrolle(risikoId, kontrolleId, (k) => { Object.assign(k, patch); });
  }, [mutateKontrolle]);

  const addKontrolle = useCallback((risikoId, kontrolle) => {
    const k = { ...emptyKontrolle(Date.now()), ...kontrolle };
    let newId = k.id;
    mutateRisiko(risikoId, (r) => {
      newId = `${risikoId}-k-${r.schluesselkontrollen.length + 1}-${Date.now()}`;
      r.schluesselkontrollen.push({ ...k, id: newId, custom: true, vorgeschlagen: false, status: DEFAULT_STATUS, statusHistorie: [], comments: [] });
    });
    return newId;
  }, [mutateRisiko]);

  const removeKontrolle = useCallback((risikoId, kontrolleId) => {
    mutateRisiko(risikoId, (r) => {
      r.schluesselkontrollen = r.schluesselkontrollen.filter(k => k.id !== kontrolleId);
    });
  }, [mutateRisiko]);

  // --- Kommentare ----------------------------------------------------------
  const addRisikoComment = useCallback((risikoId, text) => {
    if (!text?.trim()) return;
    mutateRisiko(risikoId, (r) => {
      r.comments = [...(r.comments || []), { id: `c-${Date.now()}`, autorId: currentUser, text: text.trim(), at: Date.now() }];
    });
  }, [mutateRisiko, currentUser]);

  const addKontrolleComment = useCallback((risikoId, kontrolleId, text) => {
    if (!text?.trim()) return;
    mutateKontrolle(risikoId, kontrolleId, (k) => {
      k.comments = [...(k.comments || []), { id: `c-${Date.now()}`, autorId: currentUser, text: text.trim(), at: Date.now() }];
    });
  }, [mutateKontrolle, currentUser]);

  const value = useMemo(() => ({
    phase, setPhase,
    analyse,
    pendingInput,
    currentUser, setCurrentUser,
    activeRisikoId, setActiveRisikoId,
    startProcessing, finishProcessing, resetAnalyse,
    setRisikoStatus, setKontrolleStatus,
    updateRisiko, updateKontrolle,
    addKontrolle, removeKontrolle,
    addRisikoComment, addKontrolleComment,
  }), [
    phase, analyse, pendingInput, currentUser, activeRisikoId,
    startProcessing, finishProcessing, resetAnalyse,
    setRisikoStatus, setKontrolleStatus,
    updateRisiko, updateKontrolle, addKontrolle, removeKontrolle,
    addRisikoComment, addKontrolleComment,
  ]);

  return <BiksContext.Provider value={value}>{children}</BiksContext.Provider>;
}

export function useBiks() {
  return useContext(BiksContext);
}
