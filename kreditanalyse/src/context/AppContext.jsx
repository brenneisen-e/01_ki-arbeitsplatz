import { createContext, useContext, useReducer, useCallback } from 'react';
import { demoCompanies } from '../data/demoCompanies';

const AppContext = createContext(null);

const initialState = {
  currentView: 'dashboard',
  currentSubView: null,
  selectedCompanyId: null,
  companies: demoCompanies,
  sidebarCollapsed: false,
  aiPanelOpen: false,
  aiMessages: [],
  aiLoading: false,
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
  notifications: []
};

function reducer(state, action) {
  switch (action.type) {
    case 'NAVIGATE':
      return { ...state, currentView: action.view, currentSubView: action.subView || null };
    case 'SELECT_COMPANY':
      return { ...state, selectedCompanyId: action.id };
    case 'SELECT_AND_NAVIGATE':
      return { ...state, selectedCompanyId: action.id, currentView: action.view, currentSubView: action.subView || null };
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
    case 'ADVANCE_STATUS': {
      const statusFlow = ['eingegangen', 'kyc', 'analysis', 'rating', 'collateral', 'decision', 'voting'];
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
    case 'SET_COMPANY_STATUS':
      return {
        ...state,
        companies: state.companies.map(c =>
          c.id === action.companyId ? { ...c, status: action.status } : c
        ),
      };
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
