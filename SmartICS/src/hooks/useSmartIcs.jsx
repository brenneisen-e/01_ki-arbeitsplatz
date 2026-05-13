import { createContext, useContext, useState, useCallback, useMemo, useEffect } from 'react';
import { DEMO_PROZESSE, RISIKO_VORSCHLAEGE, KONTROLL_VORSCHLAEGE, RISIKO_BEWERTUNG_DEFAULT } from '../data/risikoKatalog';

const SmartIcsContext = createContext(null);

const STORAGE_KEY = 'smartics_state_v1';

function defaultBewertung(confidence) {
  if (confidence === 'first') return RISIKO_BEWERTUNG_DEFAULT.high;
  if (confidence === 'second') return RISIKO_BEWERTUNG_DEFAULT.mid;
  return RISIKO_BEWERTUNG_DEFAULT.low;
}

// Helper: erzeugt Initialdatenstruktur für einen Prozess
function buildProzessSession(prozess) {
  const aktivitaeten = prozess.aktivitaeten.map(a => ({
    ...a,
    confirmed: true,
    selectedRisiken: [],
  }));

  const risikoCandidates = {};
  for (const a of prozess.aktivitaeten) {
    const list = (RISIKO_VORSCHLAEGE[a.id] || []).map((r, idx) => {
      const id = `${a.id}-r${idx}`;
      const b = defaultBewertung(r.confidence);
      return {
        id,
        aktivitaetId: a.id,
        ...r,
        selected: false,
        finalBeschreibung: r.beschreibung,
        eintrittsW: b.eintrittsW,
        schaden: b.schaden,
        tier: b.tier,
      };
    });
    risikoCandidates[a.id] = list;
  }

  return {
    prozessId: prozess.id,
    name: prozess.name,
    kategorie: prozess.kategorie,
    beschreibung: prozess.beschreibung,
    quelldokument: null,
    aktivitaeten,
    risikoCandidates,
    kontrollCandidates: {},
    createdAt: new Date().toISOString(),
  };
}

export function SmartIcsProvider({ children }) {
  const [step, setStep] = useState(0); // 0 .. 3
  const [session, setSession] = useState(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) return JSON.parse(raw);
    } catch {}
    return null;
  });
  const [aiPanelOpen, setAiPanelOpen] = useState(false);
  const [aiMessages, setAiMessages] = useState([]);
  const [uploadedDocs, setUploadedDocs] = useState([]);

  useEffect(() => {
    if (session) {
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(session)); } catch {}
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, [session]);

  const startSession = useCallback((prozessId, quelldokument) => {
    const prozess = DEMO_PROZESSE.find(p => p.id === prozessId);
    if (!prozess) return;
    const s = buildProzessSession(prozess);
    s.quelldokument = quelldokument || null;
    setSession(s);
    setStep(0);
    return s;
  }, []);

  const resetSession = useCallback(() => {
    setSession(null);
    setStep(0);
    setAiMessages([]);
  }, []);

  const updateAktivitaet = useCallback((aktivitaetId, patch) => {
    setSession(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        aktivitaeten: prev.aktivitaeten.map(a => a.id === aktivitaetId ? { ...a, ...patch } : a),
      };
    });
  }, []);

  const toggleRisiko = useCallback((aktivitaetId, risikoId) => {
    setSession(prev => {
      if (!prev) return prev;
      const list = prev.risikoCandidates[aktivitaetId] || [];
      return {
        ...prev,
        risikoCandidates: {
          ...prev.risikoCandidates,
          [aktivitaetId]: list.map(r => r.id === risikoId ? { ...r, selected: !r.selected } : r),
        },
      };
    });
  }, []);

  const updateRisiko = useCallback((aktivitaetId, risikoId, patch) => {
    setSession(prev => {
      if (!prev) return prev;
      const list = prev.risikoCandidates[aktivitaetId] || [];
      return {
        ...prev,
        risikoCandidates: {
          ...prev.risikoCandidates,
          [aktivitaetId]: list.map(r => r.id === risikoId ? { ...r, ...patch } : r),
        },
      };
    });
  }, []);

  const addCustomRisiko = useCallback((aktivitaetId, risiko) => {
    setSession(prev => {
      if (!prev) return prev;
      const list = prev.risikoCandidates[aktivitaetId] || [];
      const id = `${aktivitaetId}-custom-${list.length}`;
      return {
        ...prev,
        risikoCandidates: {
          ...prev.risikoCandidates,
          [aktivitaetId]: [...list, {
            id,
            aktivitaetId,
            kategorie: risiko.kategorie,
            unterart: risiko.unterart,
            confidence: 'first',
            beschreibung: risiko.beschreibung,
            finalBeschreibung: risiko.beschreibung,
            eintrittsW: RISIKO_BEWERTUNG_DEFAULT.mid.eintrittsW,
            schaden: RISIKO_BEWERTUNG_DEFAULT.mid.schaden,
            tier: 'mid',
            selected: true,
            custom: true,
          }],
        },
      };
    });
  }, []);

  // Schritt 4: Kontrollen-Vorschläge generieren
  const generateKontrollCandidates = useCallback(() => {
    setSession(prev => {
      if (!prev) return prev;
      const all = {};
      Object.values(prev.risikoCandidates).flat().filter(r => r.selected).forEach(r => {
        const baseCandidates = (KONTROLL_VORSCHLAEGE[r.unterart] || []).slice(0, 4);
        all[r.id] = baseCandidates.map((c, idx) => ({
          id: `${r.id}-k${idx}`,
          risikoId: r.id,
          ...c,
          selected: idx === 0, // erste Kontrolle vorausgewählt als Schlüsselkontrolle
          isKey: idx === 0,
        }));
      });
      return { ...prev, kontrollCandidates: all };
    });
  }, []);

  const toggleKontrolle = useCallback((risikoId, kontrolleId) => {
    setSession(prev => {
      if (!prev) return prev;
      const list = prev.kontrollCandidates[risikoId] || [];
      return {
        ...prev,
        kontrollCandidates: {
          ...prev.kontrollCandidates,
          [risikoId]: list.map(k => k.id === kontrolleId ? { ...k, selected: !k.selected } : k),
        },
      };
    });
  }, []);

  const toggleIsKey = useCallback((risikoId, kontrolleId) => {
    setSession(prev => {
      if (!prev) return prev;
      const list = prev.kontrollCandidates[risikoId] || [];
      return {
        ...prev,
        kontrollCandidates: {
          ...prev.kontrollCandidates,
          [risikoId]: list.map(k => k.id === kontrolleId ? { ...k, isKey: !k.isKey, selected: true } : k),
        },
      };
    });
  }, []);

  const updateKontrolle = useCallback((risikoId, kontrolleId, patch) => {
    setSession(prev => {
      if (!prev) return prev;
      const list = prev.kontrollCandidates[risikoId] || [];
      return {
        ...prev,
        kontrollCandidates: {
          ...prev.kontrollCandidates,
          [risikoId]: list.map(k => k.id === kontrolleId ? { ...k, ...patch } : k),
        },
      };
    });
  }, []);

  const addCustomKontrolle = useCallback((risikoId, kontrolle) => {
    setSession(prev => {
      if (!prev) return prev;
      const list = prev.kontrollCandidates[risikoId] || [];
      const id = `${risikoId}-k-custom-${list.length}`;
      return {
        ...prev,
        kontrollCandidates: {
          ...prev.kontrollCandidates,
          [risikoId]: [...list, { id, risikoId, ...kontrolle, selected: true, isKey: true, custom: true }],
        },
      };
    });
  }, []);

  // === Chat ===
  const addAiMessage = useCallback((msg) => {
    setAiMessages(prev => [...prev, msg]);
  }, []);
  const clearChat = useCallback(() => setAiMessages([]), []);

  // === Uploaded Docs ===
  const addUploadedDoc = useCallback((doc) => setUploadedDocs(prev => [...prev, doc]), []);
  const removeUploadedDoc = useCallback((id) => setUploadedDocs(prev => prev.filter(d => d.id !== id)), []);

  const value = useMemo(() => ({
    step, setStep,
    session,
    startSession, resetSession,
    updateAktivitaet,
    toggleRisiko, updateRisiko, addCustomRisiko,
    generateKontrollCandidates, toggleKontrolle, toggleIsKey, updateKontrolle, addCustomKontrolle,
    aiPanelOpen, setAiPanelOpen,
    aiMessages, addAiMessage, clearChat,
    uploadedDocs, addUploadedDoc, removeUploadedDoc,
  }), [step, session, aiPanelOpen, aiMessages, uploadedDocs,
       startSession, resetSession, updateAktivitaet, toggleRisiko, updateRisiko, addCustomRisiko,
       generateKontrollCandidates, toggleKontrolle, toggleIsKey, updateKontrolle, addCustomKontrolle,
       addAiMessage, clearChat, addUploadedDoc, removeUploadedDoc]);

  return (
    <SmartIcsContext.Provider value={value}>
      {children}
    </SmartIcsContext.Provider>
  );
}

export function useSmartIcs() {
  return useContext(SmartIcsContext);
}
