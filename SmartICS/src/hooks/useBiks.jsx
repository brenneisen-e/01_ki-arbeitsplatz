import { createContext, useContext, useState, useCallback, useMemo, useEffect, useRef } from 'react';
import {
  matchProzess, findProzess, buildAnalyse, emptyKontrolle,
  CURRENT_USER_DEFAULT, DEFAULT_STATUS,
  STATUS_MAP, STUFE_MAP, KONTROLL_ART, KONTROLL_TYP, KONTROLL_TURNUS,
} from '../data/biksAgent';

const BiksContext = createContext(null);

const STORAGE_KEY = 'biks_agent_state_v1';

// Deep-clone hilfsfunktion für die (kleine) Analyse-Struktur.
function clone(obj) {
  return JSON.parse(JSON.stringify(obj));
}

// --- Versionshistorie: Feld-Labels & Wert-Formatierung ---------------------
const RISIKO_FELD_LABEL = {
  titel: 'Titel', risikospezifikation: 'Risikospezifikation',
  wesentlichkeit: 'Begründung der Wesentlichkeit', schaden: 'Schadenshöhe',
  eintritt: 'Eintrittswahrscheinlichkeit',
};
const KONTROLL_FELD_LABEL = {
  name: 'Bezeichnung', ziel: 'Kontrollziel', art: 'Kontrollart', typ: 'Kontrolltyp',
  turnus: 'Turnus', ansatzText: 'Kontrollansatz', was: 'Was wird kontrolliert?',
  wie: 'Wie wird kontrolliert?', wer: 'Wer', abweichung: 'Abweichung/Fehler',
  umgang: 'Umgang mit Fehlern', dokumentation: 'Dokumentation', anwendung: 'Anwendung',
};
function fmtVal(feld, val, scope) {
  if (feld === 'status') return STATUS_MAP[val]?.label || val;
  if (feld === 'schaden' || feld === 'eintritt') return STUFE_MAP[val]?.label || val;
  if (scope === 'kontrolle') {
    if (feld === 'art') return KONTROLL_ART.find(x => x.id === val)?.label || val;
    if (feld === 'typ') return KONTROLL_TYP.find(x => x.id === val)?.label || val;
    if (feld === 'turnus') return KONTROLL_TURNUS.find(x => x.id === val)?.label || val;
  }
  return val;
}
function pushVersion(r, autorId, aktion, changes) {
  if (!changes || changes.length === 0) return;
  r.versionen = r.versionen || [];
  r.versionen.push({ id: `v-${Date.now()}-${r.versionen.length}`, at: Date.now(), autorId, aktion, changes });
}

// Stellt sicher, dass jedes Risiko mit der KI-Erstversion beginnt. Migriert auch
// ältere gespeicherte Stände (ohne bzw. mit unvollständiger Versionshistorie).
function normalizeAnalyse(analyse) {
  if (!analyse?.risiken) return analyse;
  const baseTs = analyse.createdAt ? new Date(analyse.createdAt).getTime() : Date.now();
  analyse.risiken.forEach(r => {
    r.versionen = Array.isArray(r.versionen) ? r.versionen : [];
    const hasCreate = r.versionen[0] && r.versionen[0].autorId === 'agent';
    if (!hasCreate) {
      const earliest = r.versionen.length ? Math.min(...r.versionen.map(v => v.at || baseTs)) : baseTs;
      r.versionen.unshift({
        id: `v-create-${r.id}`,
        at: earliest - 60000,
        autorId: 'agent',
        aktion: 'Risiko vom b-IKS Agent erstellt',
        changes: [
          { type: 'added', feld: 'Risiko identifiziert', neu: r.titel },
          ...(r.schluesselkontrollen?.[0] ? [{ type: 'added', feld: 'Schlüsselkontrolle vorgeschlagen', neu: r.schluesselkontrollen[0].name }] : []),
        ],
      });
    }
  });
  return analyse;
}

// Persistierten Zustand einmalig synchron laden (vermeidet Save-vor-Load-Race).
function loadPersisted() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed?.analyse) return { analyse: normalizeAnalyse(parsed.analyse), currentUser: parsed.currentUser || CURRENT_USER_DEFAULT };
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
    const result = normalizeAnalyse(buildAnalyse(prozess, input, { nowTs: Date.now() }));
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
      const alt = r.status;
      if (alt === status) return;
      r.status = status;
      r.statusHistorie = [...(r.statusHistorie || []), { status, autorId: currentUser, at: Date.now(), note: note || '' }];
      pushVersion(r, currentUser, 'Status geändert', [{ type: 'changed', feld: 'Status', alt: fmtVal('status', alt), neu: fmtVal('status', status) }]);
    });
  }, [mutateRisiko, currentUser]);

  const setKontrolleStatus = useCallback((risikoId, kontrolleId, status, note) => {
    mutateRisiko(risikoId, (r) => {
      const k = r.schluesselkontrollen.find(x => x.id === kontrolleId);
      if (!k || k.status === status) return;
      const alt = k.status;
      k.status = status;
      k.statusHistorie = [...(k.statusHistorie || []), { status, autorId: currentUser, at: Date.now(), note: note || '' }];
      pushVersion(r, currentUser, `Kontroll-Status geändert — ${k.name}`, [{ type: 'changed', feld: 'Kontroll-Status', alt: fmtVal('status', alt), neu: fmtVal('status', status) }]);
    });
  }, [mutateRisiko, currentUser]);

  // Feld-Edits werden live angewendet, aber erst beim Abschluss ("Fertig")
  // als eine Version festgehalten (siehe commit* unten).
  const updateRisiko = useCallback((risikoId, patch) => {
    mutateRisiko(risikoId, (r) => { Object.assign(r, patch); });
  }, [mutateRisiko]);

  const updateKontrolle = useCallback((risikoId, kontrolleId, patch) => {
    mutateKontrolle(risikoId, kontrolleId, (k) => { Object.assign(k, patch); });
  }, [mutateKontrolle]);

  const commitRisikoVersion = useCallback((risikoId, before) => {
    if (!before) return;
    mutateRisiko(risikoId, (r) => {
      const changes = [];
      ['titel', 'risikospezifikation', 'wesentlichkeit', 'schaden', 'eintritt'].forEach(k => {
        if (before[k] !== r[k]) changes.push({ type: 'changed', feld: RISIKO_FELD_LABEL[k] || k, alt: fmtVal(k, before[k]), neu: fmtVal(k, r[k]) });
      });
      pushVersion(r, currentUser, 'Risiko bearbeitet', changes);
    });
  }, [mutateRisiko, currentUser]);

  const commitKontrolleVersion = useCallback((risikoId, kontrolleId, before) => {
    if (!before) return;
    mutateRisiko(risikoId, (r) => {
      const k = r.schluesselkontrollen.find(x => x.id === kontrolleId);
      if (!k) return;
      const changes = [];
      ['name', 'ziel', 'art', 'typ', 'turnus', 'was', 'wie', 'wer', 'abweichung', 'umgang', 'dokumentation', 'anwendung'].forEach(f => {
        if (before[f] !== k[f]) changes.push({ type: 'changed', feld: `Kontrolle: ${KONTROLL_FELD_LABEL[f] || f}`, alt: fmtVal(f, before[f], 'kontrolle'), neu: fmtVal(f, k[f], 'kontrolle') });
      });
      pushVersion(r, currentUser, `Kontrolle bearbeitet — ${k.name}`, changes);
    });
  }, [mutateRisiko, currentUser]);

  const addKontrolle = useCallback((risikoId, kontrolle) => {
    const k = { ...emptyKontrolle(Date.now()), ...kontrolle };
    let newId = k.id;
    mutateRisiko(risikoId, (r) => {
      newId = `${risikoId}-k-${r.schluesselkontrollen.length + 1}-${Date.now()}`;
      r.schluesselkontrollen.push({ ...k, id: newId, custom: true, vorgeschlagen: false, status: DEFAULT_STATUS, statusHistorie: [], comments: [] });
      pushVersion(r, currentUser, 'Schlüsselkontrolle ergänzt', [{ type: 'added', feld: 'Schlüsselkontrolle', neu: k.name || '(neue Kontrolle)' }]);
    });
    return newId;
  }, [mutateRisiko, currentUser]);

  const removeKontrolle = useCallback((risikoId, kontrolleId) => {
    mutateRisiko(risikoId, (r) => {
      const k = r.schluesselkontrollen.find(x => x.id === kontrolleId);
      r.schluesselkontrollen = r.schluesselkontrollen.filter(x => x.id !== kontrolleId);
      pushVersion(r, currentUser, 'Schlüsselkontrolle entfernt', [{ type: 'removed', feld: 'Schlüsselkontrolle', alt: k?.name || '(Kontrolle)' }]);
    });
  }, [mutateRisiko, currentUser]);

  // --- Kommentare ----------------------------------------------------------
  const addRisikoComment = useCallback((risikoId, text) => {
    if (!text?.trim()) return;
    mutateRisiko(risikoId, (r) => {
      r.comments = [...(r.comments || []), { id: `c-${Date.now()}`, autorId: currentUser, text: text.trim(), at: Date.now() }];
      pushVersion(r, currentUser, 'Kommentar hinzugefügt', [{ type: 'added', feld: 'Kommentar', neu: text.trim() }]);
    });
  }, [mutateRisiko, currentUser]);

  const addKontrolleComment = useCallback((risikoId, kontrolleId, text) => {
    if (!text?.trim()) return;
    mutateRisiko(risikoId, (r) => {
      const k = r.schluesselkontrollen.find(x => x.id === kontrolleId);
      if (!k) return;
      k.comments = [...(k.comments || []), { id: `c-${Date.now()}`, autorId: currentUser, text: text.trim(), at: Date.now() }];
      pushVersion(r, currentUser, `Kommentar zu Kontrolle — ${k.name}`, [{ type: 'added', feld: 'Kommentar', neu: text.trim() }]);
    });
  }, [mutateRisiko, currentUser]);

  const value = useMemo(() => ({
    phase, setPhase,
    analyse,
    pendingInput,
    currentUser, setCurrentUser,
    activeRisikoId, setActiveRisikoId,
    startProcessing, finishProcessing, resetAnalyse,
    setRisikoStatus, setKontrolleStatus,
    updateRisiko, updateKontrolle,
    commitRisikoVersion, commitKontrolleVersion,
    addKontrolle, removeKontrolle,
    addRisikoComment, addKontrolleComment,
  }), [
    phase, analyse, pendingInput, currentUser, activeRisikoId,
    startProcessing, finishProcessing, resetAnalyse,
    setRisikoStatus, setKontrolleStatus,
    updateRisiko, updateKontrolle, commitRisikoVersion, commitKontrolleVersion,
    addKontrolle, removeKontrolle,
    addRisikoComment, addKontrolleComment,
  ]);

  return <BiksContext.Provider value={value}>{children}</BiksContext.Provider>;
}

export function useBiks() {
  return useContext(BiksContext);
}
