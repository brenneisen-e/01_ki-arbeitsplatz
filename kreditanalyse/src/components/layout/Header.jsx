import { useState, useRef, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { MessageSquare, Bell, User, ChevronRight, Home, ChevronDown, Check } from 'lucide-react';

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
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const menuRef = useRef(null);

  // Close menu on outside click
  useEffect(() => {
    if (!userMenuOpen) return;
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [userMenuOpen]);

  const { currentUser, availableUsers } = state;

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
        <div className="relative pl-3 border-l border-border" ref={menuRef}>
          <button
            onClick={() => setUserMenuOpen(!userMenuOpen)}
            className="flex items-center gap-2 hover:bg-surface rounded-lg px-2 py-1 transition-colors"
          >
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
              <User size={14} className="text-white" />
            </div>
            <div className="hidden sm:block text-xs text-left">
              <div className="font-medium text-text-primary">{currentUser.name}</div>
              <div className="text-text-muted">{currentUser.role}</div>
            </div>
            <ChevronDown size={14} className="text-text-muted hidden sm:block" />
          </button>

          {userMenuOpen && (
            <div className="absolute right-0 top-full mt-1 w-64 bg-white border border-border rounded-lg shadow-lg z-50 py-1">
              <div className="px-3 py-2 text-xs text-text-muted font-medium border-b border-border">
                Benutzer wechseln
              </div>
              {availableUsers.map((user) => (
                <button
                  key={user.id}
                  onClick={() => {
                    dispatch({ type: 'SWITCH_USER', userId: user.id });
                    setUserMenuOpen(false);
                  }}
                  className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-surface transition-colors text-left"
                >
                  <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <User size={12} className="text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-text-primary">{user.name}</div>
                    <div className="text-xs text-text-muted">{user.role}</div>
                  </div>
                  {currentUser.id === user.id && (
                    <Check size={16} className="text-accent shrink-0" />
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
