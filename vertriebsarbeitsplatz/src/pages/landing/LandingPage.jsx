import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { clsx } from 'clsx';
import { Send, Mic, Briefcase, Shield, Landmark, Wallet, PieChart, Bot, Loader2, Settings, Upload, RotateCcw, User, ChevronDown, ChevronUp, ArrowLeft } from 'lucide-react';
import { useMode } from '../../hooks/useMode';
import { MODE_CONFIGS, MODUS_LIST } from '../../data/modeConfig';
import { getLogoUrl } from '../../utils/logos';
import useTranslation from '../../i18n/useTranslation';
import { invalidateLangCache } from '../../utils/langHelper';
import { TERMINE_BY_MODE, getKundeById } from '../../data';
import TerminPrepModal from '../../components/ui/TerminPrepModal';

// Demo-Private-Banking-Ansprechpartner. Die Landing-Page kennt keine echten
// Kollegen-Stammdaten, daher ein fester kleiner Pool – passt zur Demo-Logik
// der App und liefert Fotos via Adobe Stock Platzhaltern.
// Ansprechpartner nach Abteilung, damit der Berater schnell den richtigen
// Fachbereich aufrufen kann. Freitext-Feld unten ermöglicht beliebige
// Themen, die nicht in der Liste stehen.
const ANSPRECHPARTNER_ABTEILUNGEN = [
  { abteilung: 'Private Banking',       beschreibung: 'Vermögende Privatkunden, Family Office' },
  { abteilung: 'Baufinanzierung',       beschreibung: 'Immobiliendarlehen, Bausparverträge' },
  { abteilung: 'Anlageberatung',        beschreibung: 'Wertpapiere, Fonds, ETFs' },
  { abteilung: 'Firmenkundenbetreuung', beschreibung: 'Geschäftskonten, Betriebsmittelkredite' },
  { abteilung: 'Kreditabteilung',       beschreibung: 'Konsumkredit, Rahmenkredit, Dispo' },
  { abteilung: 'Versicherungsberatung', beschreibung: 'Zukunftsversicherung, BU, RLV' },
  { abteilung: 'Compliance & Recht',    beschreibung: 'Regulatorik, FIDA/PSD2, Geldwäsche' },
  { abteilung: 'Kundenservice',         beschreibung: 'Allgemeine Anfragen, Beschwerden' },
];

// ISO-Datum (YYYY-MM-DD) → DD.MM.YYYY
function formatDateDE(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

function QuickPromptChip({ label, onClick, active = false, hasDropdown = false }) {
  return (
    <button
      onClick={onClick}
      className={clsx(
        'px-3 py-1.5 rounded-full border text-xs font-medium transition-colors backdrop-blur-sm inline-flex items-center gap-1.5',
        active
          ? 'bg-white text-slate-800 border-white shadow-md'
          : 'bg-white/10 hover:bg-white/20 border-white/15 text-white/80'
      )}
    >
      {label}
      {hasDropdown && <ChevronDown size={12} className={active ? 'rotate-180 transition-transform' : 'transition-transform'} />}
    </button>
  );
}

export default function LandingPage() {
  const { t } = useTranslation();

  const MODULE_TABS = [
    { id: 'versicherung', label: t('versicherung'), icon: Shield },
    { id: 'banking', label: t('bankenLabel'), icon: Landmark },
    { id: 'vermoegensverwaltung', label: t('vermoegensverwaltungLabel'), icon: Wallet },
  ];

  const SUGGESTIONS = [
    { trigger: 'zu', label: t('zusammenfassungHeutigerTag'), action: 'overview' },
    { trigger: 'üb', label: t('uebersichtAnzeigen'), action: 'overview' },
    { trigger: 'co', label: t('cockpitOeffnen'), action: 'cockpit' },
    { trigger: 'ku', label: t('kundenlisteAnzeigen'), action: 'kunden' },
    { trigger: 'po', label: t('potenzialeAnzeigen'), action: 'potentiale' },
  ];
  const { switchMode, switchInstitut, navigateTo, config, modeId } = useMode();

  // Restore last selected mode/institut from localStorage
  const [activeModule, setActiveModule] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('kia_last_mode'));
      if (saved?.modeId && MODE_CONFIGS[saved.modeId]) return saved.modeId;
    } catch {}
    return modeId || 'versicherung';
  });
  const [selectedVariant, setSelectedVariant] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('kia_last_mode'));
      if (saved?.variant) return saved.variant;
    } catch {}
    return null;
  });
  const [chatInput, setChatInput] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const [thinkingText, setThinkingText] = useState('');
  const [isListening, setIsListening] = useState(false);
  const inputRef = useRef(null);
  const listenTimeoutsRef = useRef([]);

  // Name prompt on first visit only (check localStorage)
  const [userName, setUserName] = useState(() => localStorage.getItem('kia_user_name') || '');
  const [showNamePrompt, setShowNamePrompt] = useState(() => {
    // Only show on very first visit (no name saved AND no "kia_name_prompted" flag)
    const hasName = !!localStorage.getItem('kia_user_name');
    const wasPrompted = !!localStorage.getItem('kia_name_prompted');
    return !hasName && !wasPrompted;
  });
  const [nameInput, setNameInput] = useState('');
  const nameInputRef = useRef(null);

  // Settings
  const [showSettings, setShowSettings] = useState(false);
  const [showVariants, setShowVariants] = useState(false);
  // Quick-Prompt-Dropdowns unter dem Chat (null | 'termin' | 'ansprechpartner')
  const [openPromptDropdown, setOpenPromptDropdown] = useState(null);
  const [ansprechpartnerFreitext, setAnsprechpartnerFreitext] = useState('');
  // Vorbereitungs-Modal für einen ausgewählten Termin (öffnet sich direkt
  // als Chatbot-Antwort statt einer Navigation).
  const [terminPrep, setTerminPrep] = useState(null); // { kunde, termin } | null
  const [language, setLanguage] = useState(() => localStorage.getItem('kia_language') || 'de');
  const [settingsName, setSettingsName] = useState(() => localStorage.getItem('kia_user_fullname') || '');
  const [settingsPhoto, setSettingsPhoto] = useState(() => localStorage.getItem('kia_user_photo') || '');
  const [settingsGender, setSettingsGender] = useState(() => localStorage.getItem('kia_user_gender') || '');
  const photoInputRef = useRef(null);

  useEffect(() => {
    if (showNamePrompt && nameInputRef.current) nameInputRef.current.focus();
  }, [showNamePrompt]);

  function handleNameSubmit(e) {
    e.preventDefault();
    const trimmed = nameInput.trim();
    if (!trimmed) return;
    localStorage.setItem('kia_user_name', trimmed);
    localStorage.setItem('kia_name_prompted', 'true');
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

  function handleGenderChange(gender) {
    setSettingsGender(gender);
    localStorage.setItem('kia_user_gender', gender);
  }

  function handleSettingsReset() {
    localStorage.removeItem('kia_user_fullname');
    localStorage.removeItem('kia_user_photo');
    localStorage.removeItem('kia_user_name');
    localStorage.removeItem('kia_user_gender');
    setSettingsName('');
    setSettingsPhoto('');
    setSettingsGender('');
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

  function executeSuggestion(suggestion, opts = {}) {
    setIsThinking(true);
    const steps = [
      t('datenWerdenGeladen'),
      t('kpisWerdenBerechnet'),
      t('vertriebspotenzialeAnalysiert'),
      t('uebersichtWirdVorbereitet'),
    ];
    let step = 0;
    setThinkingText(steps[0]);
    const interval = setInterval(() => {
      step++;
      if (step < steps.length) {
        setThinkingText(steps[step]);
      } else {
        clearInterval(interval);
        // Navigate. `modeOverride` lets callers (e.g. the microphone flow)
        // force a specific target mode – otherwise the closure's
        // activeModule could still be stale after a same-tick setState.
        const targetMode = opts.modeOverride || activeModule;
        switchMode(targetMode);
        // Preserve the selected institut variant (e.g. Zukunftsbank). If a
        // caller explicitly passes variantOverride (mic flow) it wins –
        // otherwise fall back to the currently selected one, but only when
        // the mode isn't being forced (which would reset institutOverride).
        const variantToApply = 'variantOverride' in opts ? opts.variantOverride : (opts.modeOverride ? null : selectedVariant);
        if (variantToApply) {
          switchInstitut(variantToApply, targetMode);
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

  // Claude-Chat-Antwort für freie Fragen. Wenn /api/claude nicht erreichbar
  // ist (lokale Dev-Umgebung ohne Pages Functions), fallen wir auf das
  // bisherige Demo-Verhalten (Cockpit-Navigation) zurück.
  const [claudeReply, setClaudeReply] = useState(null); // { prompt, text, error } | null
  const [claudeLoading, setClaudeLoading] = useState(false);

  async function askClaude(prompt) {
    setClaudeLoading(true);
    setClaudeReply({ prompt, text: '', error: null });
    try {
      const res = await fetch('/api/claude', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ prompt }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || `HTTP ${res.status}`);
      setClaudeReply({ prompt, text: data.text || '(leere Antwort)', error: null });
    } catch (err) {
      setClaudeReply({ prompt, text: '', error: String(err.message || err) });
    } finally {
      setClaudeLoading(false);
    }
  }

  function handleSubmit() {
    if (!chatInput.trim()) {
      // Empty input: go straight to overview dashboard
      executeSuggestion({ action: 'overview' });
      return;
    }
    const lower = chatInput.toLowerCase();
    const match = SUGGESTIONS.find(s => s.label.toLowerCase() === lower || lower.includes(s.trigger));
    if (match) {
      executeSuggestion(match);
    } else {
      // Freie Frage → an Claude weiterreichen. Kein Navigations-Sprung.
      askClaude(chatInput.trim());
    }
  }

  function handleMicClick() {
    if (isListening) return;
    // Clear any leftover timers
    listenTimeoutsRef.current.forEach(clearTimeout);
    listenTimeoutsRef.current = [];

    setIsListening(true);
    setShowSuggestions(false);
    setChatInput('Zuhören...');

    // Wait 1-3 seconds before "transcribing"
    const initialDelay = 1000 + Math.random() * 2000;
    const phrase = 'Gib mir meinen Tagesüberblick';
    const words = phrase.split(' ');

    const startTyping = setTimeout(() => {
      setChatInput('');
      let i = 0;
      const typeNext = () => {
        i++;
        const partial = words.slice(0, i).join(' ');
        setChatInput(partial);
        if (i < words.length) {
          const t = setTimeout(typeNext, 220);
          listenTimeoutsRef.current.push(t);
        } else {
          // After typing finishes, briefly keep the "listening" state, then
          // hand off to the same pipeline a chat submit would use: switch to
          // banking and run executeSuggestion so the user sees the normal
          // "thinking" overlay (Daten werden geladen …) before the overview
          // opens.
          const finish = setTimeout(() => {
            setIsListening(false);
            const targetMode = 'banking';
            // Keep the currently selected banking variant (e.g. Zukunftsbank)
            // if the user is already on the banking module. Only when the
            // voice flow actually switches the mode (e.g. from Versicherung)
            // do we reset the variant to the default institut.
            const keepVariant = activeModule === targetMode ? selectedVariant : null;
            setActiveModule(targetMode);
            setSelectedVariant(keepVariant);
            try {
              localStorage.setItem('kia_last_mode', JSON.stringify(
                keepVariant ? { modeId: targetMode, variant: keepVariant } : { modeId: targetMode }
              ));
            } catch {}
            // Hand off to the same pipeline a chat submit would use, so the
            // user sees the thinking overlay (Daten werden geladen …) before
            // the overview opens. modeOverride forces Banking regardless of
            // whatever activeModule was selected on the landing page;
            // variantOverride preserves Zukunftsbank / Sparkasse / etc.
            executeSuggestion(
              { action: 'overview' },
              { modeOverride: targetMode, variantOverride: keepVariant }
            );
          }, 500);
          listenTimeoutsRef.current.push(finish);
        }
      };
      typeNext();
    }, initialDelay);
    listenTimeoutsRef.current.push(startTyping);
  }

  useEffect(() => () => {
    listenTimeoutsRef.current.forEach(clearTimeout);
  }, []);

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
      style={{
        // Stockphoto als Vollbild-Hintergrund mit Dunkel-Overlay für Lesbarkeit.
        backgroundImage: `linear-gradient(180deg, rgba(15,23,42,0.65) 0%, rgba(15,23,42,0.82) 100%), url('./images/zukunftsbank-header.jpeg')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        backgroundAttachment: 'fixed',
      }}
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
                <h2 className="text-lg font-semibold text-slate-800">{t('willkommen')}!</h2>
                <p className="text-sm text-slate-500">KI-Vertriebsarbeitsplatz</p>
              </div>
            </div>
            <label className="block text-sm font-medium text-slate-700 mb-2">{t('wieDarfIchDichNennen')}</label>
            <input
              ref={nameInputRef}
              type="text"
              value={nameInput}
              onChange={e => setNameInput(e.target.value)}
              placeholder={t('deinVorname')}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-400 transition-shadow mb-4"
            />
            <button
              type="submit"
              disabled={!nameInput.trim()}
              className="w-full py-3 rounded-xl bg-slate-800 text-white text-sm font-semibold hover:bg-slate-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {t('losGehts')}
            </button>
          </form>
        </div>
      )}

      {/* Claude-Antwort-Overlay. Zeigt die letzte Frage + Antwort in einem
          zentrierten Panel. Klick auf Hintergrund oder ESC schließt. */}
      {(claudeLoading || claudeReply) && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fade-in"
          onClick={() => { if (!claudeLoading) setClaudeReply(null); }}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[80vh] overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-5 py-3 border-b border-slate-200 flex items-center gap-2">
              <Bot size={16} className="text-violet-600" />
              <span className="text-sm font-semibold text-slate-800">KI-Assistent</span>
              <button
                type="button"
                onClick={() => setClaudeReply(null)}
                disabled={claudeLoading}
                className="ml-auto text-slate-400 hover:text-slate-700 disabled:opacity-40"
                aria-label="Schließen"
              >
                ✕
              </button>
            </div>
            <div className="px-5 py-4 overflow-y-auto space-y-3 text-sm">
              {claudeReply?.prompt && (
                <div>
                  <div className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold mb-1">Frage</div>
                  <div className="text-slate-700 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2">
                    {claudeReply.prompt}
                  </div>
                </div>
              )}
              <div>
                <div className="text-[10px] uppercase tracking-wider text-violet-600 font-semibold mb-1">Antwort</div>
                {claudeLoading ? (
                  <div className="flex items-center gap-2 text-slate-500">
                    <Loader2 size={14} className="animate-spin" />
                    <span>Claude antwortet…</span>
                  </div>
                ) : claudeReply?.error ? (
                  <div className="text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                    {claudeReply.error}
                  </div>
                ) : (
                  <div className="text-slate-800 whitespace-pre-wrap leading-relaxed">
                    {claudeReply?.text}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Gesprächsvorbereitungs-Modal — identisch zu dem Modal, das aus
          den Termin-Kacheln in der Übersicht geöffnet wird. */}
      {terminPrep && (
        <TerminPrepModal
          kunde={terminPrep.kunde}
          termin={terminPrep.termin}
          onClose={() => setTerminPrep(null)}
        />
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
        <div className="flex items-center gap-4">
          <a
            href="../../index.html"
            className="w-9 h-9 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors shrink-0"
            title="Zurück zur Modulübersicht"
          >
            <ArrowLeft size={16} className="text-white/70" strokeWidth={1.75} />
          </a>
          <div className="flex items-center gap-4 bg-white/10 backdrop-blur-sm rounded-2xl px-5 py-3 border border-white/15 shadow-[0_8px_20px_-6px_rgba(0,0,0,0.4)]">
            <img
              src="https://img.logo.dev/deloitte.com?token=pk_H7vb5Y2lTsW47U4Xq-w3HA&size=256&format=png"
              alt="Deloitte"
              className="h-16 w-auto object-contain"
              onError={(e) => { e.currentTarget.src = './images/6364529b74a1f1454594542e_Monitor Deloitte Logo.png'; }}
            />
            <span className="text-white text-2xl font-bold uppercase tracking-[0.2em] leading-none">
              Demo
            </span>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1 bg-white/10 rounded-lg p-0.5">
            <button
              onClick={() => { console.log('[LangSwitch] Clicked DE'); invalidateLangCache(); setLanguage('de'); localStorage.setItem('kia_language', 'de'); window.dispatchEvent(new CustomEvent('kia-language-change', { detail: 'de' })); }}
              className={clsx(
                'flex items-center gap-1.5 px-3 py-2 rounded-md text-xs font-medium transition-all cursor-pointer select-none',
                language === 'de' ? 'bg-white text-slate-800 shadow-sm' : 'text-white/60 hover:text-white hover:bg-white/15'
              )}
            >
              <svg className="w-4 h-3 rounded-sm pointer-events-none" viewBox="0 0 640 480"><rect width="640" height="160" fill="#000"/><rect y="160" width="640" height="160" fill="#D00"/><rect y="320" width="640" height="160" fill="#FFCE00"/></svg>
              <span className="pointer-events-none">DE</span>
            </button>
            <button
              onClick={() => { console.log('[LangSwitch] Clicked EN'); invalidateLangCache(); setLanguage('en'); localStorage.setItem('kia_language', 'en'); window.dispatchEvent(new CustomEvent('kia-language-change', { detail: 'en' })); }}
              className={clsx(
                'flex items-center gap-1.5 px-3 py-2 rounded-md text-xs font-medium transition-all cursor-pointer select-none',
                language === 'en' ? 'bg-white text-slate-800 shadow-sm' : 'text-white/60 hover:text-white hover:bg-white/15'
              )}
            >
              <svg className="w-4 h-3 rounded-sm pointer-events-none" viewBox="0 0 60 30"><clipPath id="s"><path d="M0,0 v30 h60 v-30 z"/></clipPath><clipPath id="t"><path d="M30,15 h30 v15 z v15 h-30 z h-30 v-15 z v-15 h30 z"/></clipPath><g clipPath="url(#s)"><path d="M0,0 v30 h60 v-30 z" fill="#012169"/><path d="M0,0 L60,30 M60,0 L0,30" stroke="#fff" strokeWidth="6"/><path d="M0,0 L60,30 M60,0 L0,30" clipPath="url(#t)" stroke="#C8102E" strokeWidth="4"/><path d="M30,0 v30 M0,15 h60" stroke="#fff" strokeWidth="10"/><path d="M30,0 v30 M0,15 h60" stroke="#C8102E" strokeWidth="6"/></g></svg>
              <span className="pointer-events-none">EN</span>
            </button>
          </div>
          <span className="text-xs text-white/40 font-medium tracking-wider uppercase">Open Finance Suite</span>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 -mt-8">
        {/* Logo + Institutsname in einer weißen Kachel */}
        <div className="mb-8">
          <div className="rounded-3xl bg-white shadow-xl px-6 pt-4 pb-3 flex flex-col items-center">
            <div className="w-24 h-24 flex items-center justify-center">
              {logoUrl ? (
                <img src={logoUrl} alt={currentInstitut} className="max-w-full max-h-full object-contain" />
              ) : (
                <span className="text-slate-700 text-5xl font-bold">{currentInstitut.charAt(0)}</span>
              )}
            </div>
            <span
              className="mt-1 text-black text-[15px] tracking-[0.08em] uppercase"
              style={{ fontFamily: 'Aptos, "Aptos Display", "Segoe UI", system-ui, sans-serif' }}
            >
              {(() => {
                const name = currentInstitut || '';
                const lower = name.toLowerCase();
                const match = lower.match(/^(zukunfts)(.+)$/);
                if (match) {
                  return (
                    <>
                      <span className="font-light">{name.slice(0, match[1].length).toUpperCase()}</span>
                      <span className="font-extrabold">{name.slice(match[1].length).toUpperCase()}</span>
                    </>
                  );
                }
                return <span className="font-light">{name.toUpperCase()}</span>;
              })()}
            </span>
          </div>
        </div>

        {/* Welcome text */}
        <h1 className="text-white text-2xl md:text-3xl font-light text-center mb-2">
          {userName ? t('willkommenZurueck', { name: userName }) : t('willkommen')}
        </h1>
        <p className="text-white/60 text-base mb-8">{userName ? t('wasKannIchHeuteTun') : t('wasKannIchTun')}</p>

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
                placeholder={t('fragMichEtwas')}
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
            <button
              onClick={handleMicClick}
              aria-label="Spracheingabe"
              className={clsx(
                'p-4 rounded-2xl transition-colors backdrop-blur-sm border',
                isListening
                  ? 'bg-white border-white text-red-600 animate-pulse shadow-lg'
                  : 'bg-white/20 hover:bg-white/30 text-white border-white/20'
              )}
            >
              <Mic size={18} strokeWidth={1.75} />
            </button>
          </div>

          {/* Quick-Prompts unter dem Chat. Zwei Prompts ("Vorbereitung
              Gesprächstermin", "Ansprechpartner Private Banking") klappen
              beim Klick ein Kunden-/Kollegen-Auswahl-Dropdown auf. */}
          <div className="flex flex-wrap justify-center gap-2 mt-3">
            <QuickPromptChip label="Vertriebs-Cockpit" onClick={() => { setChatInput('Vertriebs-Cockpit'); executeSuggestion({ action: 'overview' }); }} />
            <QuickPromptChip label="Übersicht Produktlandschaft" onClick={() => { setChatInput('Übersicht Produktlandschaft'); executeSuggestion({ action: 'overview' }); }} />
            <QuickPromptChip
              label="Ansprechpartner"
              active={openPromptDropdown === 'ansprechpartner'}
              onClick={() => setOpenPromptDropdown(d => d === 'ansprechpartner' ? null : 'ansprechpartner')}
              hasDropdown
            />
            <QuickPromptChip label="Übersicht kommende Gespräche" onClick={() => { setChatInput('Übersicht kommende Gespräche'); executeSuggestion({ action: 'overview' }); }} />
            <QuickPromptChip
              label="Vorbereitung Gesprächstermin"
              active={openPromptDropdown === 'termin'}
              onClick={() => setOpenPromptDropdown(d => d === 'termin' ? null : 'termin')}
              hasDropdown
            />
          </div>

          {/* Dropdowns unter den Chips */}
          {openPromptDropdown === 'termin' && (
            <div className="mt-3 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/15 p-3 animate-fade-in">
              <div className="text-[11px] uppercase tracking-wider text-white/60 font-semibold px-2 py-1">
                Kunde für Gesprächsvorbereitung wählen
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 mt-1">
                {(TERMINE_BY_MODE[activeModule] || []).map((termin, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      setOpenPromptDropdown(null);
                      setChatInput(`Vorbereitung Gesprächstermin — ${termin.kunde}`);
                      // Kunde aus den Stammdaten ziehen – falls nicht
                      // vorhanden (reine Termin-Stubs), fallback auf einen
                      // minimalen Kunde-Datensatz aus dem Termin selbst.
                      const kunde = getKundeById(activeModule, termin.kundeId)
                        || { id: termin.kundeId, name: termin.kunde, foto: termin.foto };
                      setTerminPrep({ kunde, termin });
                    }}
                    className="flex items-center gap-3 px-3 py-2 rounded-xl bg-white/5 hover:bg-white/15 border border-white/10 text-left transition-colors"
                  >
                    {termin.foto ? (
                      <img src={termin.foto} alt={termin.kunde} className="w-9 h-9 rounded-full object-cover shrink-0" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
                    ) : (
                      <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center text-white text-xs font-bold shrink-0">
                        {termin.kunde.split(' ').map(n => n[0]).join('').slice(0,2)}
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-semibold text-white truncate">{termin.kunde}</div>
                      <div className="text-[11px] text-white/60 truncate">{formatDateDE(termin.datum)} · {termin.zeit} — {termin.betreff}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {openPromptDropdown === 'ansprechpartner' && (
            <div className="mt-3 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/15 p-3 animate-fade-in">
              <div className="text-[11px] uppercase tracking-wider text-white/60 font-semibold px-2 py-1">
                Ansprechpartner nach Abteilung
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 mt-1">
                {ANSPRECHPARTNER_ABTEILUNGEN.map((a, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      setChatInput(`Ansprechpartner — ${a.abteilung}`);
                      setOpenPromptDropdown(null);
                      executeSuggestion({ action: 'overview' });
                    }}
                    className="flex items-center gap-3 px-3 py-2 rounded-xl bg-white/5 hover:bg-white/15 border border-white/10 text-left transition-colors"
                  >
                    <div className="w-9 h-9 rounded-lg bg-white/15 border border-white/15 flex items-center justify-center shrink-0">
                      <Briefcase size={16} className="text-white/80" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-semibold text-white truncate">{a.abteilung}</div>
                      <div className="text-[11px] text-white/60 truncate">{a.beschreibung}</div>
                    </div>
                  </button>
                ))}
              </div>
              {/* Freitext-Feld für Abteilungen, die nicht in der Liste sind */}
              <div className="mt-3 pt-3 border-t border-white/10">
                <label className="block text-[10px] uppercase tracking-wider text-white/50 font-semibold px-1 mb-1.5">
                  Andere Abteilung / Thema
                </label>
                <input
                  type="text"
                  value={ansprechpartnerFreitext}
                  onChange={(e) => setAnsprechpartnerFreitext(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && ansprechpartnerFreitext.trim()) {
                      setChatInput(`Ansprechpartner — ${ansprechpartnerFreitext.trim()}`);
                      setOpenPromptDropdown(null);
                      setAnsprechpartnerFreitext('');
                      executeSuggestion({ action: 'overview' });
                    }
                  }}
                  placeholder="z. B. Baufinanzierung Team Nord, Treasury, …"
                  className="w-full px-3 py-2 rounded-lg bg-white/10 border border-white/15 text-white text-sm placeholder-white/40 focus:outline-none focus:bg-white/15 focus:border-white/30 transition-all"
                />
              </div>
            </div>
          )}
        </div>

        {/* Module Tabs + Institut-Varianten sind in die Einstellungen unten
            umgezogen, damit der zentrale Landing-Bereich ruhiger bleibt. */}
      </div>

      {/* Settings Section */}
      <div className="px-6 py-4 shrink-0">
        <button
          onClick={() => setShowSettings(v => !v)}
          className="flex items-center gap-2 mx-auto text-white/50 hover:text-white/80 text-xs font-medium transition-colors py-2"
        >
          <Settings size={14} />
          {t('einstellungen')}
          {showSettings ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </button>

        {showSettings && (
          <div className="mt-4 max-w-md mx-auto bg-white/10 backdrop-blur-sm border border-white/15 rounded-2xl p-5 animate-fade-in">
            {/* Modul-Auswahl */}
            <h3 className="text-white text-sm font-semibold mb-3 flex items-center gap-2">
              <Briefcase size={16} />
              Modul
            </h3>
            <div className="flex gap-2 mb-3 flex-wrap">
              {MODULE_TABS.map(tab => {
                const Icon = tab.icon;
                const isActive = activeModule === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => { setActiveModule(tab.id); setSelectedVariant(null); try { localStorage.setItem('kia_last_mode', JSON.stringify({ modeId: tab.id })); } catch {} }}
                    className={clsx(
                      'flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium transition-all duration-200',
                      isActive
                        ? 'bg-white text-slate-800 shadow-md'
                        : 'bg-white/10 text-white/70 hover:bg-white/20 hover:text-white border border-white/10'
                    )}
                  >
                    <Icon size={14} strokeWidth={1.75} />
                    {tab.label}
                  </button>
                );
              })}
            </div>

            {/* Unternehmens-Variante */}
            <button
              onClick={() => setShowVariants(v => !v)}
              className="flex items-center gap-2 text-white/50 hover:text-white/80 text-xs font-medium transition-colors mb-3"
            >
              {showVariants ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
              {showVariants ? t('unternehmenAusblenden') : t('unternehmenAuswaehlen')}
            </button>
            {showVariants && (
              <div className="flex flex-wrap gap-2 mb-4 animate-fade-in">
                {activeConfig.institutVarianten.map((variant) => {
                  const isSelected = selectedVariant?.institut === variant.institut ||
                    (!selectedVariant && variant.institut === activeConfig.institut);
                  const vLogoUrl = getLogoUrl(variant.institut, 32);
                  return (
                    <button
                      key={variant.institut}
                      onClick={() => { setSelectedVariant(variant); try { localStorage.setItem('kia_last_mode', JSON.stringify({ modeId: activeModule, variant })); } catch {} }}
                      className={clsx(
                        'flex items-center gap-2 px-2.5 py-1.5 rounded-xl text-[11px] font-medium transition-all duration-300',
                        isSelected
                          ? 'bg-white text-slate-800 shadow-md'
                          : 'bg-white/10 text-white/70 hover:bg-white/15 border border-white/10'
                      )}
                    >
                      {vLogoUrl ? (
                        <img src={vLogoUrl} alt={variant.institut} className="w-4 h-4 rounded object-contain" />
                      ) : (
                        <span className="w-4 h-4 rounded bg-slate-200 flex items-center justify-center text-[8px] font-bold text-slate-600">
                          {variant.institut.charAt(0)}
                        </span>
                      )}
                      {variant.institut}
                    </button>
                  );
                })}
              </div>
            )}

            <div className="h-px bg-white/10 my-4" />

            <h3 className="text-white text-sm font-semibold mb-4 flex items-center gap-2">
              <User size={16} />
              {t('beraterProfil')}
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
                  {t('bildHochladen')}
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
                    {t('bildEntfernen')}
                  </button>
                )}
              </div>
            </div>

            {/* Anrede */}
            <label className="block text-xs text-white/60 font-medium mb-1.5">{t('anrede')}</label>
            <div className="flex gap-2 mb-4">
              {[
                { value: 'm', label: t('herr') },
                { value: 'w', label: t('frau') },
              ].map(opt => (
                <button
                  key={opt.value}
                  onClick={() => handleGenderChange(opt.value)}
                  className={clsx(
                    'px-4 py-2 rounded-xl text-sm font-medium transition-all',
                    settingsGender === opt.value
                      ? 'bg-white text-slate-800'
                      : 'bg-white/10 border border-white/15 text-white/60 hover:bg-white/20'
                  )}
                >
                  {opt.label}
                </button>
              ))}
            </div>

            {/* Name input */}
            <label className="block text-xs text-white/60 font-medium mb-1.5">{t('vorUndNachname')}</label>
            <input
              type="text"
              value={settingsName}
              onChange={e => setSettingsName(e.target.value)}
              onBlur={handleSettingsSave}
              onKeyDown={e => { if (e.key === 'Enter') handleSettingsSave(); }}
              placeholder={t('namePlaceholder')}
              className="w-full px-4 py-2.5 rounded-xl bg-white/10 border border-white/15 text-white text-sm placeholder-white/30 focus:outline-none focus:bg-white/15 focus:border-white/30 transition-all mb-4"
            />

            {/* Reset */}
            <button
              onClick={handleSettingsReset}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white/50 hover:text-white/70 text-xs font-medium transition-colors"
            >
              <RotateCcw size={12} />
              {t('aufStandardZuruecksetzen')}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
