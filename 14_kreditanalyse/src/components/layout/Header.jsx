import { useState, useRef, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { MessageSquare, Bell, User, ChevronRight, Home, ChevronDown, Upload, RotateCcw } from 'lucide-react';

const viewTitles = {
  dashboard: 'Dashboard',
  application: 'Kreditantrag',
  kyc: 'KYC & Compliance',
  analysis: '§18 KWG Prüfung',
  rating: 'Rating',
  collateral: 'Sicherheitenbewertung',
  'credit-proposal': 'Kreditempfehlung',
  decision: 'Kreditentscheidung',
  contract: 'Kreditvertrag',
  monitoring: 'Monitoring & Frühwarnung',
  'customer-application': 'Kreditantrag stellen',
  compliance: 'Compliance-Sicht',
  'pdf-upload': 'Konsortialkredit-PDF',
  kontoanlage: 'Vertrag → Kreditkonto',
};

function goToLanding() {
  window.location.href = '/index.html';
}

export default function Header() {
  const { state, dispatch, getSelectedCompany } = useApp();
  const company = getSelectedCompany();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);
  const photoInputRef = useRef(null);

  // Profile state from localStorage (same keys as vertriebsarbeitsplatz)
  const [profileName, setProfileName] = useState(() => localStorage.getItem('kia_user_fullname') || '');
  const [profilePhoto, setProfilePhoto] = useState(() => localStorage.getItem('kia_user_photo') || '');
  const [profileGender, setProfileGender] = useState(() => localStorage.getItem('kia_user_gender') || '');

  // Derived display values
  // profileName (e.g. "Eike Brenneisen") steht für die angemeldete Person,
  // die primär der Markt-Rolle (weber) zugeordnet ist. Wenn der Nutzer per
  // "Benutzer wechseln" in eine andere Rolle schlüpft (Fischer, Schneider),
  // soll der Header den tatsächlichen switched-User zeigen und nicht mehr
  // den eigenen Profilnamen überschreiben.
  const isSelfRole = state.currentUser.id === 'weber';
  const displayName = isSelfRole && profileName ? profileName : state.currentUser.name;
  const displayRole = state.currentUser.role;

  // Close menu on outside click
  useEffect(() => {
    if (!menuOpen) return;
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [menuOpen]);

  function handleSaveName() {
    localStorage.setItem('kia_user_fullname', profileName);
    const firstName = profileName.trim().split(' ')[0];
    if (firstName) {
      localStorage.setItem('kia_user_name', firstName);
    } else {
      localStorage.removeItem('kia_user_name');
    }
  }

  function handlePhotoUpload(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const dataUrl = ev.target.result;
      localStorage.setItem('kia_user_photo', dataUrl);
      setProfilePhoto(dataUrl);
    };
    reader.readAsDataURL(file);
  }

  function handleGenderChange(gender) {
    setProfileGender(gender);
    localStorage.setItem('kia_user_gender', gender);
  }

  function handleReset() {
    localStorage.removeItem('kia_user_fullname');
    localStorage.removeItem('kia_user_photo');
    localStorage.removeItem('kia_user_name');
    localStorage.removeItem('kia_user_gender');
    setProfileName('');
    setProfilePhoto('');
    setProfileGender('');
  }

  return (
    <header className="kopfleiste h-14 flex items-center justify-between px-6 shrink-0">
      <div className="flex items-center gap-2 text-sm min-w-0">
        <button
          onClick={goToLanding}
          className="header-glass flex items-center gap-1.5 px-2.5 h-8 mr-2 rounded-lg shrink-0"
          title="Zurück zur Startseite"
        >
          <Home size={15} strokeWidth={1.5} />
          <span className="text-xs hidden sm:inline">Startseite</span>
        </button>
        <span className="font-medium font-headline text-white truncate">
          {viewTitles[state.currentView] || state.currentView}
        </span>
        {company && state.currentView !== 'dashboard' && state.currentView !== 'application' && (
          <>
            <ChevronRight size={14} className="text-white/45 shrink-0" />
            <span className="text-white/75 truncate">{company.firma}</span>
          </>
        )}
        {state.currentSubView && (
          <>
            <ChevronRight size={14} className="text-white/45 shrink-0" />
            <span className="text-white/75 truncate">{state.currentSubView}</span>
          </>
        )}
      </div>

      <div className="flex items-center gap-2.5 shrink-0">
        <button
          onClick={() => dispatch({ type: 'TOGGLE_AI_PANEL' })}
          className={`flex items-center gap-2 px-3 h-8 rounded-lg text-sm transition-colors ${
            state.aiPanelOpen
              ? 'bg-white text-primary border border-white'
              : 'header-glass'
          }`}
        >
          <MessageSquare size={15} strokeWidth={1.5} />
          <span className="hidden sm:inline">KI-Assistent</span>
        </button>
        <button className="header-glass relative w-8 h-8 rounded-lg flex items-center justify-center" title="Benachrichtigungen">
          <Bell size={16} strokeWidth={1.5} />
          {state.notifications.length > 0 && (
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-gold rounded-full" />
          )}
        </button>

        {/* User profile area */}
        <div className="relative pl-2.5 border-l border-white/15" ref={menuRef}>
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="flex items-center gap-2 hover:bg-white/10 rounded-lg px-2 py-1 transition-colors"
          >
            {profilePhoto ? (
              <img src={profilePhoto} alt="Profil" className="w-8 h-8 rounded-full object-cover ring-1 ring-white/30" />
            ) : (
              <div className="w-8 h-8 rounded-full header-glass flex items-center justify-center">
                <User size={14} className="text-white" />
              </div>
            )}
            <div className="hidden sm:block text-xs text-left">
              <div className="font-medium text-white">{displayName}</div>
              <div className="text-white/60">{displayRole}</div>
            </div>
            <ChevronDown size={14} className="text-white/60 hidden sm:block" />
          </button>

          {menuOpen && (
            <div className="absolute right-0 top-full mt-2 w-72 surface-elevated rounded-xl z-50 p-4 space-y-4 text-text-primary">
              <h3 className="text-sm font-semibold text-text-primary flex items-center gap-2">
                <User size={15} />
                Berater-Profil
              </h3>

              {/* Photo */}
              <div className="flex items-center gap-3">
                <div className="relative shrink-0">
                  {profilePhoto ? (
                    <img src={profilePhoto} alt="Profil" className="w-14 h-14 rounded-full object-cover border-2 border-border" />
                  ) : (
                    <div className="w-14 h-14 rounded-full bg-surface border-2 border-border flex items-center justify-center">
                      <User size={20} className="text-text-muted" />
                    </div>
                  )}
                </div>
                <div className="flex flex-col gap-1.5">
                  <button
                    onClick={() => photoInputRef.current?.click()}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface hover:bg-gray-100 text-text-secondary text-xs font-medium transition-colors"
                  >
                    <Upload size={12} />
                    Bild hochladen
                  </button>
                  <input
                    ref={photoInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    className="hidden"
                  />
                  {profilePhoto && (
                    <button
                      onClick={() => { setProfilePhoto(''); localStorage.removeItem('kia_user_photo'); }}
                      className="text-[10px] text-text-muted hover:text-text-secondary transition-colors text-left"
                    >
                      Bild entfernen
                    </button>
                  )}
                </div>
              </div>

              {/* Anrede */}
              <div>
                <label className="block text-xs text-text-muted font-medium mb-1.5">Anrede</label>
                <div className="flex gap-2">
                  {[
                    { value: 'm', label: 'Herr' },
                    { value: 'w', label: 'Frau' },
                  ].map(opt => (
                    <button
                      key={opt.value}
                      onClick={() => handleGenderChange(opt.value)}
                      className={`px-4 py-1.5 rounded-lg text-xs font-medium transition-all ${
                        profileGender === opt.value
                          ? 'bg-primary text-white'
                          : 'bg-surface text-text-secondary hover:bg-gray-100'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Name */}
              <div>
                <label className="block text-xs text-text-muted font-medium mb-1.5">Vor- und Nachname</label>
                <input
                  type="text"
                  value={profileName}
                  onChange={e => setProfileName(e.target.value)}
                  onBlur={handleSaveName}
                  onKeyDown={e => { if (e.key === 'Enter') handleSaveName(); }}
                  placeholder="z.B. Max Weber"
                  className="w-full px-3 py-2 rounded-lg bg-surface border border-border text-sm text-text-primary placeholder-text-muted focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all"
                />
              </div>

              {/* User-Rolle wechseln */}
              <div>
                <label className="block text-xs text-text-muted font-medium mb-1.5">Benutzer wechseln</label>
                <div className="space-y-1">
                  {state.availableUsers.map((user) => (
                    <button
                      key={user.id}
                      onClick={() => dispatch({ type: 'SWITCH_USER', userId: user.id })}
                      className={`w-full text-left px-3 py-2 rounded-lg text-xs transition-colors ${
                        state.currentUser.id === user.id
                          ? 'bg-primary/10 text-primary font-medium ring-1 ring-primary/20'
                          : 'hover:bg-surface text-text-secondary'
                      }`}
                    >
                      <div className="font-medium">{user.name}</div>
                      <div className={`text-[10px] mt-0.5 ${state.currentUser.id === user.id ? 'text-primary/70' : 'text-text-muted'}`}>{user.role}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Reset */}
              <div className="pt-2 border-t border-border">
                <button
                  onClick={handleReset}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-surface text-text-muted hover:text-text-secondary text-xs font-medium transition-colors"
                >
                  <RotateCcw size={12} />
                  Auf Standard zurücksetzen
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
