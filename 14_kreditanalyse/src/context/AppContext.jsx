import { createContext, useContext, useReducer, useCallback } from 'react';
import { demoCompanies } from '../data/demoCompanies';

const AppContext = createContext(null);

const USERS = [
  { id: 'weber', name: 'M. Weber', role: 'Firmenkundenberater' },
  { id: 'fischer', name: 'Dr. K. Fischer', role: 'Kreditanalyst' },
  { id: 'schneider', name: 'H. Schneider', role: 'Abteilungsleiter Kredit' },
];

const initialState = {
  currentView: 'dashboard',
  currentSubView: null,
  selectedCompanyId: null,
  // Neuer Antrag ohne Vorgang: Prozessleiste steht auf Schritt 1, der Zähler
  // setzt das Antragsformular beim nächsten Start frisch auf
  neuerAntrag: false,
  antragSitzung: 0,
  companies: demoCompanies,
  sidebarCollapsed: false,
  aiPanelOpen: true,
  aiMessages: [],
  aiLoading: false,
  currentUser: USERS[0],
  availableUsers: USERS,
  // Application form draft
  applicationDraft: {
    firma: '', rechtsform: 'GmbH', hrb: '', amtsgericht: '',
    gruendung: '', branche: '', wz_code: '',
    adresse: { strasse: '', plz: '', ort: '' },
    mitarbeiter: '', steuer_id: '', ust_id: '', hauptbank: true,
    gf: [{ name: '', geb: '', funktion: 'GF/Gesellschafter', anteil: '', seit: '', erfahrung: '' }],
    kredit: { art: 'Investitionskredit', betrag: '', laufzeit: '', tilgungsfrei: '', verwendung: '', verwendungKategorie: 'Maschine/Anlage', auszahlung: '' },
    bestehende_verbindlichkeiten: [],
    sicherheiten_vorerfassung: ''
  },
  // KYC state per company
  kycState: {},
  // Qualitative rating answers per company
  qualitativeAnswers: {},
  // Voting state per company
  votingState: {},
  // Sicherheitenerfassung per company (Einträge, Objektunterlagen, Haircuts),
  // abgelegt beim Verlassen der Sicherheitenbewertung
  collateralState: {},
  notifications: []
};

function reducer(state, action) {
  switch (action.type) {
    case 'NAVIGATE':
      return { ...state, currentView: action.view, currentSubView: action.subView || null };
    case 'SELECT_COMPANY':
      return { ...state, selectedCompanyId: action.id, neuerAntrag: false };
    case 'SELECT_AND_NAVIGATE':
      return { ...state, selectedCompanyId: action.id, neuerAntrag: false, currentView: action.view, currentSubView: action.subView || null };
    case 'NEUEN_ANTRAG_STARTEN':
      // Der laufende Vorgang bleibt mit seinem Stand in der Pipeline (companies,
      // kycState, collateralState …); nur die Auswahl wird gelöst.
      return {
        ...state,
        selectedCompanyId: null,
        neuerAntrag: true,
        antragSitzung: state.antragSitzung + 1,
        currentView: action.view || 'customer-application',
        currentSubView: null,
      };
    case 'TOGGLE_SIDEBAR':
      return { ...state, sidebarCollapsed: !state.sidebarCollapsed };
    case 'TOGGLE_AI_PANEL':
      return { ...state, aiPanelOpen: !state.aiPanelOpen };
    case 'SET_AI_PANEL':
      return { ...state, aiPanelOpen: action.open };
    case 'ADD_AI_MESSAGE':
      return { ...state, aiMessages: [...state.aiMessages, action.message] };
    case 'SET_AI_LOADING':
      return { ...state, aiLoading: action.loading };
    case 'UPDATE_APPLICATION_DRAFT':
      return { ...state, applicationDraft: { ...state.applicationDraft, ...action.data } };
    case 'UPDATE_KYC_STATE':
      return {
        ...state,
        kycState: {
          ...state.kycState,
          [action.companyId]: { ...(state.kycState[action.companyId] || {}), ...action.data }
        }
      };
    case 'UPDATE_QUALITATIVE_ANSWERS':
      return {
        ...state,
        qualitativeAnswers: {
          ...state.qualitativeAnswers,
          [action.companyId]: { ...(state.qualitativeAnswers[action.companyId] || {}), ...action.data }
        }
      };
    case 'UPDATE_VOTING_STATE':
      return {
        ...state,
        votingState: {
          ...state.votingState,
          [action.companyId]: { ...(state.votingState[action.companyId] || {}), ...action.data }
        }
      };
    case 'UPDATE_COLLATERAL_STATE':
      return {
        ...state,
        collateralState: { ...state.collateralState, [action.companyId]: action.data },
      };
    case 'ADVANCE_STATUS': {
      const statusFlow = ['eingegangen', 'kyc', 'analysis', 'rating', 'collateral', 'credit-proposal', 'voting'];
      const comp = state.companies.find(c => c.id === action.companyId);
      if (!comp) return state;
      const currentIdx = statusFlow.indexOf(comp.status);
      if (currentIdx < 0 || currentIdx >= statusFlow.length - 1) return state;
      const nextStatus = statusFlow[currentIdx + 1];
      return {
        ...state,
        companies: state.companies.map(c =>
          c.id === action.companyId ? { ...c, status: nextStatus } : c
        ),
      };
    }
    case 'ADVANCE_TO_CONTRACT': {
      const comp = state.companies.find(c => c.id === action.companyId);
      if (!comp || comp.status !== 'approved') return state;
      return {
        ...state,
        companies: state.companies.map(c =>
          c.id === action.companyId ? { ...c, status: 'contract' } : c
        ),
      };
    }
    case 'SET_COMPANY_STATUS':
      return {
        ...state,
        companies: state.companies.map(c =>
          c.id === action.companyId ? { ...c, status: action.status } : c
        ),
      };
    case 'ADD_CUSTOMER_APPLICATION': {
      // Die Kundenperspektive reicht inzwischen realistische Finanzzahlen,
      // Sicherheiten und Bonitätsdaten mit (damit der End-to-End-Flow mit
      // dem eigenen Antrag abgebildet werden kann). Deshalb nur Defaults
      // setzen wo nichts übergeben wurde — vorhandene Werte erhalten.
      const c = action.company;
      const newCompany = {
        ...c,
        bilanz: c.bilanz && Object.keys(c.bilanz).length > 0 ? c.bilanz : {},
        gf: c.gf && c.gf.length > 0
          ? c.gf
          : (c.ansprechpartner
              ? [{ name: c.ansprechpartner.name, funktion: c.ansprechpartner.position || 'GF', anteil: '', seit: '', erfahrung: '' }]
              : []),
        sicherheiten: c.sicherheiten ?? [],
        bestehende_verbindlichkeiten: c.bestehende_verbindlichkeiten ?? [],
        konto: c.konto ?? null,
        schufa: c.schufa ?? null,
        creditreform_index: c.creditreform_index ?? null,
        uploadedDocuments: c.uploadedDocuments || [],
      };
      return {
        ...state,
        companies: [...state.companies, newCompany],
      };
    }
    case 'SWITCH_USER':
      return { ...state, currentUser: state.availableUsers.find(u => u.id === action.userId) || state.currentUser };
    case 'ADD_NOTIFICATION':
      return { ...state, notifications: [...state.notifications, { id: Date.now(), ...action.notification }] };
    case 'DISMISS_NOTIFICATION':
      return { ...state, notifications: state.notifications.filter(n => n.id !== action.id) };
    default:
      return state;
  }
}

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  const navigate = useCallback((view, subView) => {
    dispatch({ type: 'NAVIGATE', view, subView });
  }, []);

  const selectCompany = useCallback((id) => {
    dispatch({ type: 'SELECT_COMPANY', id });
  }, []);

  const selectAndNavigate = useCallback((id, view, subView) => {
    dispatch({ type: 'SELECT_AND_NAVIGATE', id, view, subView });
  }, []);

  const getSelectedCompany = useCallback(() => {
    return state.companies.find(c => c.id === state.selectedCompanyId) || null;
  }, [state.companies, state.selectedCompanyId]);

  const value = { state, dispatch, navigate, selectCompany, selectAndNavigate, getSelectedCompany };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
}

export default AppContext;
