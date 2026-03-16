import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { clsx } from 'clsx';
import { Send, Briefcase, Shield, Landmark, Wallet, PieChart, Bot, Loader2, Settings, Upload, RotateCcw, User, ChevronDown, ChevronUp } from 'lucide-react';
import { useMode } from '../../hooks/useMode';
import { MODE_CONFIGS, MODUS_LIST } from '../../data/modeConfig';
import { getLogoUrl } from '../../utils/logos';

const MODULE_TABS = [
  { id: 'versicherung', label: 'Versicherung', icon: Shield },
  { id: 'banking', label: 'Banken', icon: Landmark },
  { id: 'vermoegensverwaltung', label: 'Vermögensverwaltung', icon: Wallet },
];

const SUGGESTIONS = [
  { trigger: 'zu', label: 'Zusammenfassung heutiger Tag', action: 'overview' },
  { trigger: 'üb', label: 'Übersicht anzeigen', action: 'overview' },
  { trigger: 'co', label: 'Cockpit öffnen', action: 'cockpit' },
  { trigger: 'ku', label: 'Kundenliste anzeigen', action: 'kunden' },
  { trigger: 'po', label: 'Potenziale anzeigen', action: 'potentiale' },
];

export default function LandingPage() {
  const { switchMode, switchInstitut, navigateTo, config, modeId } = useMode();
  const [activeModule, setActiveModule] = useState(modeId || 'versicherung');
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [chatInput, setChatInput] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const [thinkingText, setThinkingText] = useState('');
  const inputRef = useRef(null);

  // Name prompt on first visit
  const [userName, setUserName] = useState(() => localStorage.getItem('kia_user_name') || '');
  const [showNamePrompt, setShowNamePrompt] = useState(!userName);
  const [nameInput, setNameInput] = useState('');
  const nameInputRef = useRef(null);

  // Settings
  const [showSettings, setShowSettings] = useState(false);
  const [settingsName, setSettingsName] = useState(() => localStorage.getItem('kia_user_fullname') || '');
  const [settingsPhoto, setSettingsPhoto] = useState(() => localStorage.getItem('kia_user_photo') || '');
  const photoInputRef = useRef(null);

  useEffect(() => {
    if (showNamePrompt && nameInputRef.current) nameInputRef.current.focus();
  }, [showNamePrompt]);

  function handleNameSubmit(e) {
    e.preventDefault();
    const trimmed = nameInput.trim();
    if (!trimmed) return;
    localStorage.setItem('kia_user_name', trimmed);
    setUserName(trimmed);
    setShowNamePrompt(false);
  }

  function handleSettingsSave() {
    localStorage.setItem('kia_user_fullname', settingsName);
    // Update display name (first name from full name)
    const firstName = settingsName.trim().split(' ')[0];
    if (firstName) {
      localStorage.setItem('kia_user_name', firstName);
      setUserName(firstName);
    } else {
      localStorage.removeItem('kia_user_name');
      setUserName('');
    }
  }

  function handlePhotoUpload(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const dataUrl = ev.target.result;
      localStorage.setItem('kia_user_photo', dataUrl);
      setSettingsPhoto(dataUrl);
    };
    reader.readAsDataURL(file);
  }

  function handleSettingsReset() {
    localStorage.removeItem('kia_user_fullname');
    localStorage.removeItem('kia_user_photo');
    localStorage.removeItem('kia_user_name');
    setSettingsName('');
    setSettingsPhoto('');
    setUserName('');
  }

  const activeConfig = MODE_CONFIGS[activeModule];
  const currentColors = selectedVariant?.colors || activeConfig.colors;
  const currentInstitut = selectedVariant?.institut || activeConfig.institut;

  const logoUrl = useMemo(() => getLogoUrl(currentInstitut, 128), [currentInstitut]);

  // Filter suggestions based on input
  const filteredSuggestions = useMemo(() => {
    if (!chatInput.trim()) return [];
    const lower = chatInput.toLowerCase();
    return SUGGESTIONS.filter(s => s.label.toLowerCase().includes(lower) || s.trigger.startsWith(lower));
  }, [chatInput]);

  useEffect(() => {
    setShowSuggestions(filteredSuggestions.length > 0 && chatInput.length > 0);
  }, [filteredSuggestions, chatInput]);

  function handleSelectSuggestion(suggestion) {
    setChatInput(suggestion.label);
    setShowSuggestions(false);
    executeSuggestion(suggestion);
  }

  function executeSuggestion(suggestion) {
    setIsThinking(true);
    const steps = [
      'Daten werden geladen...',
      'KPIs werden berechnet...',
      'Vertriebspotenziale analysiert...',
      'Übersicht wird vorbereitet...',
    ];
    let step = 0;
    setThinkingText(steps[0]);
    const interval = setInterval(() => {
      step++;
      if (step < steps.length) {
        setThinkingText(steps[step]);
      } else {
        clearInterval(interval);
        // Navigate
        const targetMode = activeModule;
        switchMode(targetMode);
        if (selectedVariant) {
          switchInstitut(selectedVariant, targetMode);
        }
        if (suggestion.action === 'cockpit') {
          navigateTo('cockpit');
        } else if (suggestion.action === 'kunden' || suggestion.action === 'potentiale') {
          navigateTo('overview', { tab: suggestion.action });
        } else {
          navigateTo('overview');
        }
        setIsThinking(false);
      }
    }, 600);
  }

  function handleSubmit() {
    if (!chatInput.trim()) return;
    const lower = chatInput.toLowerCase();
    const match = SUGGESTIONS.find(s => s.label.toLowerCase() === lower || lower.includes(s.trigger));
    if (match) {
      executeSuggestion(match);
    } else {
      // Default: go to overview
      executeSuggestion({ action: 'overview' });
    }
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter') {
      if (showSuggestions && filteredSuggestions.length > 0) {
        handleSelectSuggestion(filteredSuggestions[0]);
      } else {
        handleSubmit();
      }
    }
  }

  return (
    <div
      className="min-h-screen transition-colors duration-500 flex flex-col"
      style={{ background: currentColors.gradient }}
    >
      {/* Name Prompt Overlay */}
      {showNamePrompt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm animate-fade-in">
          <form onSubmit={handleNameSubmit} className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md mx-4 animate-fade-in-up">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-xl bg-slate-800 flex items-center justify-center">
                <Briefcase size={22} className="text-white" strokeWidth={1.75} />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-slate-800">Willkommen!</h2>
                <p className="text-sm text-slate-500">KI-Vertriebsarbeitsplatz</p>
              </div>
            </div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Wie darf ich dich nennen?</label>
            <input
              ref={nameInputRef}
              type="text"
              value={nameInput}
              onChange={e => setNameInput(e.target.value)}
              placeholder="Dein Vorname..."
              className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-400 transition-shadow mb-4"
            />
            <button
              type="submit"
              disabled={!nameInput.trim()}
              className="w-full py-3 rounded-xl bg-slate-800 text-white text-sm font-semibold hover:bg-slate-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Los geht's
            </button>
          </form>
        </div>
      )}

      {/* Thinking Overlay */}
      {isThinking && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/30 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-sm mx-4 text-center">
            <Loader2 size={32} className="text-slate-600 animate-spin mx-auto mb-4" />
            <div className="text-sm font-medium text-slate-700 mb-1">{thinkingText}</div>
            <div className="w-full bg-slate-100 rounded-full h-1.5 mt-3 overflow-hidden">
              <div className="bg-slate-600 h-full rounded-full animate-pulse" style={{ width: '60%' }} />
            </div>
          </div>
        </div>
      )}

      {/* Top bar */}
      <div className="px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
            <Briefcase size={16} className="text-white" strokeWidth={1.75} />
          </div>
          <span className="text-white/80 text-sm font-medium">KI-Vertriebsarbeitsplatz</span>
        </div>
        <span className="text-xs text-white/40 font-medium tracking-wider uppercase">Open Finance Suite</span>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 -mt-16">
        {/* Logo */}
        <div className="mb-8">
          {logoUrl ? (
            <div className="w-32 h-32 rounded-3xl bg-white shadow-xl flex items-center justify-center p-4">
              <img src={logoUrl} alt={currentInstitut} className="max-w-full max-h-full object-contain" />
            </div>
          ) : (
            <div className="w-32 h-32 rounded-3xl bg-white/15 backdrop-blur-sm border border-white/20 shadow-xl flex items-center justify-center">
              <span className="text-white text-2xl font-bold tracking-tight text-center px-2 leading-tight">{currentInstitut}</span>
            </div>
          )}
        </div>

        {/* Welcome text */}
        <h1 className="text-white text-2xl md:text-3xl font-light text-center mb-2">
          Willkommen zurück{userName ? `, ${userName}` : ''}
        </h1>
        <p className="text-white/60 text-base mb-8">Was kann ich heute für dich tun?</p>

        {/* Chat input */}
        <div className="w-full max-w-xl relative mb-10">
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <input
                ref={inputRef}
                type="text"
                value={chatInput}
                onChange={e => setChatInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Frag mich etwas..."
                className="w-full px-5 py-4 rounded-2xl bg-white/15 backdrop-blur-sm border border-white/20 text-white text-sm placeholder-white/40 focus:outline-none focus:bg-white/20 focus:border-white/40 transition-all"
              />
              {/* Autocomplete Suggestions */}
              {showSuggestions && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden z-10 animate-fade-in">
                  {filteredSuggestions.map((s, i) => (
                    <button
                      key={i}
                      onClick={() => handleSelectSuggestion(s)}
                      className="w-full px-4 py-3 text-left text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-3 transition-colors"
                    >
                      <Bot size={16} className="text-slate-400 shrink-0" />
                      <span className="font-medium">{s.label}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
            <button
              onClick={handleSubmit}
              className="p-4 rounded-2xl bg-white/20 hover:bg-white/30 text-white transition-colors backdrop-blur-sm border border-white/20"
            >
              <Send size={18} strokeWidth={1.75} />
            </button>
          </div>
        </div>

        {/* Module Tabs */}
        <div className="flex gap-3 mb-6">
          {MODULE_TABS.map(tab => {
            const Icon = tab.icon;
            const isActive = activeModule === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => { setActiveModule(tab.id); setSelectedVariant(null); }}
                className={clsx(
                  'flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200',
                  isActive
                    ? 'bg-white text-slate-800 shadow-md'
                    : 'bg-white/10 text-white/70 hover:bg-white/20 hover:text-white border border-white/10'
                )}
              >
                <Icon size={16} strokeWidth={1.75} />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Institute variants */}
        <div className="flex flex-wrap gap-2 justify-center max-w-3xl">
          {activeConfig.institutVarianten.map((variant) => {
            const isSelected = selectedVariant?.institut === variant.institut ||
              (!selectedVariant && variant.institut === activeConfig.institut);
            const vLogoUrl = getLogoUrl(variant.institut, 32);
            return (
              <button
                key={variant.institut}
                onClick={() => setSelectedVariant(variant)}
                className={clsx(
                  'flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium transition-all duration-300',
                  isSelected
                    ? 'bg-white text-slate-800 shadow-md'
                    : 'bg-white/10 text-white/70 hover:bg-white/15 border border-white/10'
                )}
              >
                {vLogoUrl ? (
                  <img src={vLogoUrl} alt={variant.institut} className="w-5 h-5 rounded object-contain" />
                ) : (
                  <span className="w-5 h-5 rounded bg-slate-200 flex items-center justify-center text-[9px] font-bold text-slate-600">
                    {variant.institut.charAt(0)}
                  </span>
                )}
                {variant.institut}
              </button>
            );
          })}
        </div>
      </div>

      {/* Settings Section */}
      <div className="px-6 pb-6">
        <button
          onClick={() => setShowSettings(v => !v)}
          className="flex items-center gap-2 mx-auto text-white/40 hover:text-white/70 text-xs font-medium transition-colors"
        >
          <Settings size={14} />
          Einstellungen
          {showSettings ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </button>

        {showSettings && (
          <div className="mt-4 max-w-md mx-auto bg-white/10 backdrop-blur-sm border border-white/15 rounded-2xl p-5 animate-fade-in">
            <h3 className="text-white text-sm font-semibold mb-4 flex items-center gap-2">
              <User size={16} />
              Berater-Profil
            </h3>

            {/* Photo */}
            <div className="flex items-center gap-4 mb-4">
              <div className="relative">
                {settingsPhoto ? (
                  <img src={settingsPhoto} alt="Profil" className="w-16 h-16 rounded-full object-cover border-2 border-white/20" />
                ) : (
                  <div className="w-16 h-16 rounded-full bg-white/15 border-2 border-white/20 flex items-center justify-center">
                    <User size={24} className="text-white/40" />
                  </div>
                )}
              </div>
              <div className="flex flex-col gap-1.5">
                <button
                  onClick={() => photoInputRef.current?.click()}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/15 hover:bg-white/25 text-white/80 text-xs font-medium transition-colors"
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
                {settingsPhoto && (
                  <button
                    onClick={() => { setSettingsPhoto(''); localStorage.removeItem('kia_user_photo'); }}
                    className="text-[10px] text-white/40 hover:text-white/60 transition-colors text-left"
                  >
                    Bild entfernen
                  </button>
                )}
              </div>
            </div>

            {/* Name input */}
            <label className="block text-xs text-white/60 font-medium mb-1.5">Vor- und Nachname</label>
            <input
              type="text"
              value={settingsName}
              onChange={e => setSettingsName(e.target.value)}
              onBlur={handleSettingsSave}
              onKeyDown={e => { if (e.key === 'Enter') handleSettingsSave(); }}
              placeholder="z.B. Eike Brenneisen"
              className="w-full px-4 py-2.5 rounded-xl bg-white/10 border border-white/15 text-white text-sm placeholder-white/30 focus:outline-none focus:bg-white/15 focus:border-white/30 transition-all mb-4"
            />

            {/* Reset */}
            <button
              onClick={handleSettingsReset}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white/50 hover:text-white/70 text-xs font-medium transition-colors"
            >
              <RotateCcw size={12} />
              Auf Standard zurücksetzen
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
