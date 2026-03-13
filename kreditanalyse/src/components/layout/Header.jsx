import { useApp } from '../../context/AppContext';
import { MessageSquare, Bell, User, ChevronRight, Home } from 'lucide-react';

const viewTitles = {
  dashboard: 'Dashboard',
  application: 'Kreditantrag',
  kyc: 'KYC & Compliance',
  analysis: '§18 KWG Prüfung',
  rating: 'Rating',
  collateral: 'Sicherheitenbewertung',
  decision: 'Kreditentscheidung',
  contract: 'Kreditvertrag',
  monitoring: 'Monitoring & Frühwarnung',
};

function goToLanding() {
  // Navigate directly to the landing page
  window.location.href = '/index.html';
}

export default function Header() {
  const { state, dispatch, getSelectedCompany } = useApp();
  const company = getSelectedCompany();

  return (
    <header className="h-14 bg-white border-b border-border flex items-center justify-between px-6 shrink-0">
      <div className="flex items-center gap-2 text-sm">
        <button
          onClick={goToLanding}
          className="flex items-center gap-1.5 px-2.5 py-1.5 -ml-2 mr-1 rounded-lg text-text-secondary hover:bg-surface hover:text-primary transition-colors"
          title="Zurück zur Startseite"
        >
          <Home size={16} strokeWidth={1.5} />
          <span className="text-xs font-medium hidden sm:inline">Startseite</span>
        </button>
        <span className="font-semibold font-headline text-text-primary">
          {viewTitles[state.currentView] || state.currentView}
        </span>
        {company && state.currentView !== 'dashboard' && state.currentView !== 'application' && (
          <>
            <ChevronRight size={14} className="text-text-muted" />
            <span className="text-text-secondary">{company.firma}</span>
          </>
        )}
        {state.currentSubView && (
          <>
            <ChevronRight size={14} className="text-text-muted" />
            <span className="text-text-secondary">{state.currentSubView}</span>
          </>
        )}
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={() => dispatch({ type: 'TOGGLE_AI_PANEL' })}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-colors ${
            state.aiPanelOpen
              ? 'bg-primary text-white'
              : 'text-text-secondary hover:bg-surface hover:text-text-primary'
          }`}
        >
          <MessageSquare size={16} strokeWidth={1.5} />
          <span className="hidden sm:inline">KI-Assistent</span>
        </button>
        <button className="relative p-2 text-text-secondary hover:text-text-primary transition-colors">
          <Bell size={18} strokeWidth={1.5} />
          {state.notifications.length > 0 && (
            <span className="absolute top-1 right-1 w-2 h-2 bg-danger rounded-full" />
          )}
        </button>
        <div className="flex items-center gap-2 pl-3 border-l border-border">
          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
            <User size={14} className="text-white" />
          </div>
          <div className="hidden sm:block text-xs">
            <div className="font-medium text-text-primary">M. Weber</div>
            <div className="text-text-muted">Firmenkundenberater</div>
          </div>
        </div>
      </div>
    </header>
  );
}
