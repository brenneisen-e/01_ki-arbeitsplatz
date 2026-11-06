import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { clsx } from 'clsx';
import { Send, Mic, Briefcase, Shield, Landmark, Wallet, Bot, Loader2, Settings, Upload, RotateCcw, User, ChevronDown, ChevronUp, ArrowLeft, X, Video, Square } from 'lucide-react';
import { useScreenRecorder } from '../../components/ScreenRecorder';
import { useMode } from '../../hooks/useMode';
import { MODE_CONFIGS, MODUS_LIST } from '../../data/modeConfig';
import { getLogoUrl } from '../../utils/logos';
import useTranslation from '../../i18n/useTranslation';
import { invalidateLangCache } from '../../utils/langHelper';
import { TERMINE_BY_MODE, getKundeById } from '../../data';
import { getTerminStubKunde } from '../../data/banking-termin-stubs';
import TerminPrepModal from '../../components/ui/TerminPrepModal';
import LogoImg from '../../components/ui/LogoImg';
import { PraesentationsKnopf } from '../../components/praesentation/Praesentation';
import { NUR_WHITELABEL, RUECKWEG, sichtbareVarianten, whitelabelVariante, zurueckInDenRahmen } from '../../utils/einbettung';

// Demo-Private-Banking-Ansprechpartner. Die Landing-Page kennt keine echten
// Kollegen-Stammdaten, daher ein fester kleiner Pool – passt zur Demo-Logik
// der App und liefert Fotos via Adobe Stock Platzhaltern.
// Ansprechpartner nach Abteilung, damit der Berater schnell den richtigen
// Fachbereich aufrufen kann. Freitext-Feld unten ermöglicht beliebige
// Themen, die nicht in der Liste stehen.
const ANSPRECHPARTNER_ABTEILUNGEN = [
  { abteilungKey: 'abt.privateBanking',       beschreibungKey: 'abt.privateBankingDesc' },
  { abteilungKey: 'abt.baufinanzierung',      beschreibungKey: 'abt.baufinanzierungDesc' },
  { abteilungKey: 'abt.anlageberatung',       beschreibungKey: 'abt.anlageberatungDesc' },
  { abteilungKey: 'abt.firmenkunden',         beschreibungKey: 'abt.firmenkundenDesc' },
  { abteilungKey: 'abt.kreditabteilung',      beschreibungKey: 'abt.kreditabteilungDesc' },
  { abteilungKey: 'abt.versicherungsberatung', beschreibungKey: 'abt.versicherungsberatungDesc' },
  { abteilungKey: 'abt.compliance',           beschreibungKey: 'abt.complianceDesc' },
  { abteilungKey: 'abt.kundenservice',        beschreibungKey: 'abt.kundenserviceDesc' },
];

// Sicherheitsnetz: das Produkt erlaubt weder Emojis noch Markdown. Wir
// strippen daher Unicode-Emojis und die häufigsten Markdown-Marker clientseitig,
// auch wenn das Modell sich ausnahmsweise doch daran vergreift.
function sanitizeAssistantText(text) {
  if (!text) return '';
  // Emojis / Pictographs / Symbols entfernen.
  let out = text.replace(/[\p{Extended_Pictographic}\p{Emoji_Presentation}]/gu, '');
  // Bold/Italic-Marker (** __  * _) entfernen, Text behalten.
  out = out.replace(/\*\*(.+?)\*\*/g, '$1').replace(/__(.+?)__/g, '$1');
  out = out.replace(/(^|[^*])\*(?!\s)([^*\n]+?)\*(?!\*)/g, '$1$2');
  out = out.replace(/(^|[^_])_(?!\s)([^_\n]+?)_(?!_)/g, '$1$2');
  // Code-Backticks
  out = out.replace(/`([^`]+)`/g, '$1');
  // Überschriften-# am Zeilenanfang
  out = out.replace(/^#{1,6}\s+/gm, '');
  // Bullet-Marker am Zeilenanfang (-, *, •) durch nichts ersetzen
  out = out.replace(/^\s*[-*•]\s+/gm, '');
  return out.trim();
}

// ISO-Datum (YYYY-MM-DD) → DD.MM.YYYY
function formatDateDE(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

// Cockpit 2026: Knopf- und Chip-Stile der Landing-Page. Alles läuft über die
// Tokens aus index.css; die Glasflächen über dem Panorama sind helles Glas
// (--glas, auf dem Wurzelelement gesetzt).
const KNOPF_PRIMAER = 'bg-(--mode-primary) hover:bg-(--mode-primary-light) text-white transition-colors';
const KNOPF_SEKUNDAER = 'bg-(--bg-card) border border-(--border-medium) text-(--text-secondary) hover:border-(--mode-accent) hover:text-(--text-primary) transition-colors';
const GLAS = 'bg-(--glas) backdrop-blur-md border border-(--border-light)';
const FELD = 'surface-inset text-(--text-primary) placeholder:text-(--text-tertiary) focus:border-(--mode-accent) transition-colors';

function QuickPromptChip({ label, onClick, active = false, hasDropdown = false }) {
  return (
    <button
      onClick={onClick}
      className={clsx(
        'h-8 px-3 rounded-full border text-xs font-medium inline-flex items-center gap-1.5 transition-colors',
        active
          ? 'bg-(--mode-primary) border-(--mode-primary) text-white'
          : 'bg-(--bg-card) border-(--border-medium) text-(--text-secondary) hover:border-(--mode-accent) hover:text-(--text-primary)'
      )}
    >
      {label}
      {hasDropdown && <ChevronDown size={12} className={active ? 'rotate-180 transition-transform' : 'transition-transform'} />}
    </button>
  );
}

export default function LandingPage() {
  const { t, lang } = useTranslation();

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
    // Eingebettet mit ?whitelabel bestimmt die Adresse den Modus, nicht die gespeicherte Wahl.
    if (NUR_WHITELABEL && modeId) return modeId;
    try {
      const saved = JSON.parse(localStorage.getItem('kia_last_mode'));
      if (saved?.modeId && MODE_CONFIGS[saved.modeId]) return saved.modeId;
    } catch {}
    return modeId || 'versicherung';
  });
  const [selectedVariant, setSelectedVariant] = useState(() => {
    if (NUR_WHITELABEL) return whitelabelVariante(modeId || 'versicherung');
    try {
      const saved = JSON.parse(localStorage.getItem('kia_last_mode'));
      if (saved?.variant) return saved.variant;
      // Beim allerersten Aufruf (noch kein gespeicherter Modus) standardmäßig
      // Versicherung + Zukunftsversicherung vorauswählen.
      if (!saved?.modeId) {
        return MODE_CONFIGS.versicherung.institutVarianten
          .find(v => v.institut === 'Zukunftsversicherung') || null;
      }
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
    // Eingebettet (Banking Horizon zeigt die Demo auf dem Monitor im Foto)
    // stünde sonst beim ersten Besuch die Namensabfrage auf dem Bildschirm.
    if (RUECKWEG) return false;
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
  const { recordPhase, recordCountdown, startRecording: ctxStartRecording, stopRecording } = useScreenRecorder();
  const startRecording = async () => { await ctxStartRecording(); setShowSettings(false); };
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

  // Sprache wechseln: Cache leeren, Auswahl persistieren und die anderen
  // Komponenten über das Custom-Event informieren.
  function handleLanguageChange(code) {
    invalidateLangCache();
    setLanguage(code);
    localStorage.setItem('kia_language', code);
    window.dispatchEvent(new CustomEvent('kia-language-change', { detail: code }));
  }

  const activeConfig = MODE_CONFIGS[activeModule];
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

  // Ohne Plattform-Server (Download-Fassung, SharePoint, lokaler Server)
  // fehlt /api/claude: dann eine freundliche Meldung statt HTML-Fehlerseite.
  const OHNE_SERVER = 'Der freie KI-Chat braucht den Server der Plattform und ist in dieser Fassung nicht verfügbar. Die vorgeschlagenen Fragen und das Cockpit funktionieren weiter.';

  async function askClaude(prompt) {
    setClaudeLoading(true);
    setClaudeReply({ prompt, text: '', error: null });
    try {
      let res;
      try {
        res = await fetch('/api/claude', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ prompt }),
        });
      } catch {
        throw new Error(OHNE_SERVER);
      }
      const raw = await res.text();
      let data = null;
      try { data = raw ? JSON.parse(raw) : null; } catch { /* leave as text */ }
      if ([404, 405, 501, 503].includes(res.status) || (!data && /^\s*</.test(raw))) {
        throw new Error(OHNE_SERVER);
      }
      if (!res.ok) {
        const msg = data?.error
          || (raw && raw.slice(0, 200))
          || `HTTP ${res.status}`;
        throw new Error(msg);
      }
      if (!data) throw new Error('Leere Antwort vom /api/claude-Endpoint. Ist die Cloudflare Pages Function deployt?');
      setClaudeReply({ prompt, text: sanitizeAssistantText(data.text || '(leere Antwort)'), error: null });
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
    setChatInput(t('zuhoeren'));

    // Wait 1-3 seconds before "transcribing"
    const initialDelay = 1000 + Math.random() * 2000;
    const phrase = t('tagesueberblickPhrase');
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
            const keepVariant = NUR_WHITELABEL ? whitelabelVariante(targetMode) : activeModule === targetMode ? selectedVariant : null;
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

  // Institutsname: bei „Zukunfts…"-Häusern die Vorsilbe leicht, den Rest
  // fett – wie in der Wortmarke.
  function renderInstitutName() {
    const name = currentInstitut || '';
    const match = name.toLowerCase().match(/^(zukunfts)(.+)$/);
    if (match) {
      return (
        <>
          <span className="font-light">{name.slice(0, match[1].length).toUpperCase()}</span>
          <span className="font-extrabold">{name.slice(match[1].length).toUpperCase()}</span>
        </>
      );
    }
    return <span className="font-light">{name.toUpperCase()}</span>;
  }

  return (
    <div
      // Das gewählte Modul färbt die Modus-Tokens der Landing-Page (primärer
      // Knopf, aktive Chips), auch wenn global noch ein anderer Modus aktiv ist.
      data-mode={activeModule}
      className="min-h-screen flex flex-col text-(--text-primary)"
      style={{
        // Panorama als Vollbild-Hintergrund. Der Scrim hellt nach unten in den
        // Seitenhintergrund auf, damit die Seite in das Cockpit übergeht.
        backgroundImage: `linear-gradient(180deg, rgba(250,249,247,0.06) 0%, rgba(250,249,247,0.16) 40%, rgba(250,249,247,0.72) 82%, var(--bg-primary) 100%), url('images/zukunftsbank-header.jpeg')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        backgroundAttachment: 'fixed',
        // Helles Glas für Panels und Chips über dem Panorama.
        '--glas': 'rgba(255,255,255,0.86)',
      }}
    >
      {/* Name Prompt Overlay */}
      {showNamePrompt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(28,26,23,0.45)] backdrop-blur-sm animate-fade-in">
          <form onSubmit={handleNameSubmit} className="surface-elevated rounded-2xl p-8 w-full max-w-md mx-4 animate-fade-in-up">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-xl bg-(--mode-primary) text-white flex items-center justify-center">
                <Briefcase size={22} strokeWidth={1.75} />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-(--text-primary)">{t('willkommen')}!</h2>
                <p className="text-sm text-(--text-tertiary)">{t('kiVertriebsarbeitsplatz')}</p>
              </div>
            </div>
            <label className="block text-sm font-medium text-(--text-secondary) mb-2">{t('wieDarfIchDichNennen')}</label>
            <input
              ref={nameInputRef}
              type="text"
              value={nameInput}
              onChange={e => setNameInput(e.target.value)}
              placeholder={t('deinVorname')}
              className={clsx(FELD, 'w-full h-11 px-4 rounded-xl text-sm mb-4')}
            />
            <button
              type="submit"
              disabled={!nameInput.trim()}
              className={clsx(KNOPF_PRIMAER, 'w-full h-10 rounded-[10px] text-sm font-semibold disabled:opacity-40 disabled:cursor-not-allowed')}
            >
              {t('losGehts')}
            </button>
          </form>
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
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-[rgba(28,26,23,0.45)] backdrop-blur-sm animate-fade-in">
          <div className="surface-elevated rounded-2xl p-8 w-full max-w-sm mx-4 text-center">
            <Loader2 size={32} className="text-(--mode-primary) animate-spin mx-auto mb-4" />
            <div className="text-sm font-medium text-(--text-primary) mb-1">{thinkingText}</div>
            <div className="progress-track w-full rounded-full h-1.5 mt-3 overflow-hidden">
              <div className="progress-fill h-full rounded-full animate-pulse" style={{ width: '60%' }} />
            </div>
          </div>
        </div>
      )}

      {/* Top bar: links der Weg zurück zur Plattform-Startseite mit allen
          Demos; „Deloitte. Demo“ steht wie auf allen Ansichten als Lasche
          mittig an der Oberkante (DemoWasserzeichen.jsx). */}
      <div className="px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {RUECKWEG ? (
            // Eingebettet in Banking Horizon: zurück dorthin (schließt das Vollbild)
            <button
              type="button"
              onClick={zurueckInDenRahmen}
              className={clsx(GLAS, 'h-9 px-3 rounded-[10px] flex items-center gap-2 shrink-0 text-sm font-medium text-(--text-secondary) hover:text-(--text-primary) hover:border-(--mode-accent) transition-colors')}
              title={lang === 'en' ? `Back to ${RUECKWEG.name}` : `Zurück zu ${RUECKWEG.name}`}
            >
              <ArrowLeft size={16} strokeWidth={1.75} />
              {RUECKWEG.name}
            </button>
          ) : (
            <a
              href="../../index.html"
              className={clsx(GLAS, 'h-9 px-3 rounded-[10px] flex items-center gap-2 shrink-0 text-sm font-medium text-(--text-secondary) hover:text-(--text-primary) hover:border-(--mode-accent) transition-colors')}
              title={t('zurueckModuluebersicht')}
            >
              <ArrowLeft size={16} strokeWidth={1.75} />
              {t('alleDemos')}
            </a>
          )}
        </div>
        <div className="flex items-center gap-3">
          <div className={clsx(GLAS, 'flex items-center gap-0.5 rounded-[10px] p-0.5')}>
            {['de', 'en'].map(code => (
              <button
                key={code}
                onClick={() => handleLanguageChange(code)}
                className={clsx(
                  'h-8 px-3 rounded-lg text-xs font-semibold tracking-wide transition-colors cursor-pointer select-none',
                  language === code
                    ? 'bg-(--mode-primary) text-white'
                    : 'text-(--text-secondary) hover:text-(--text-primary) hover:bg-(--bg-inset)'
                )}
              >
                {code.toUpperCase()}
              </button>
            ))}
          </div>
          <span className={clsx(GLAS, 'inline-flex items-center h-9 px-3 rounded-[10px] text-[11px] font-semibold tracking-wider uppercase text-(--text-tertiary)')}>
            Open Finance Suite
          </span>
          <PraesentationsKnopf hell />
        </div>
      </div>

      {/* Main content: eine helle Glas-Tafel über dem Panorama trägt Logo,
          Begrüßung, Eingabe und Vorschläge, damit die dunkle Schrift überall
          lesbar bleibt. */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 -mt-8">
        <div data-praes="landing-chat" className="w-full max-w-2xl rounded-3xl bg-(--glas) backdrop-blur-xl border border-(--border-light) shadow-[0_24px_60px_-24px_rgba(28,26,23,0.4)] px-8 pt-8 pb-6 flex flex-col items-center animate-fade-in-up">
          {/* Logo + Institutsname: zeigt die gewählte Marke, auch wenn im Hintergrund noch das Whitelabel aktiv ist */}
          <div data-echte-namen className="flex flex-col items-center mb-5">
            <div className="w-20 h-20 rounded-2xl bg-(--bg-card) border border-(--border-light) shadow-[0_2px_8px_rgba(28,26,23,0.06)] flex items-center justify-center p-2">
              {logoUrl ? (
                <img src={logoUrl} alt={currentInstitut} className="max-w-full max-h-full object-contain rounded-xl" />
              ) : (
                <span className="text-(--mode-primary) text-4xl font-semibold">{currentInstitut.charAt(0)}</span>
              )}
            </div>
            <span
              className="mt-3 text-(--text-primary) text-[13px] tracking-[0.12em] uppercase"
            >
              {renderInstitutName()}
            </span>
          </div>

          {/* Welcome text */}
          <h1 className="text-(--text-primary) text-2xl md:text-3xl font-semibold text-center mb-1">
            {userName ? t('willkommenZurueck', { name: userName }) : t('willkommen')}
          </h1>
          <p className="text-(--text-secondary) text-[15px] mb-6">{userName ? t('wasKannIchHeuteTun') : t('wasKannIchTun')}</p>

          {/* Chat input */}
          <div className="w-full relative">
            <div className="flex gap-2">
              <div className="flex-1 relative">
                <input
                  ref={inputRef}
                  type="text"
                  value={chatInput}
                  onChange={e => setChatInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={t('fragMichEtwas')}
                  className={clsx(FELD, 'w-full h-12 px-5 rounded-xl text-sm')}
                />
                {/* Autocomplete Suggestions */}
                {showSuggestions && (
                  <div className="surface-elevated absolute top-full left-0 right-0 mt-1 rounded-xl overflow-hidden z-10 animate-fade-in">
                    {filteredSuggestions.map((s, i) => (
                      <button
                        key={i}
                        onClick={() => handleSelectSuggestion(s)}
                        className="w-full px-4 py-3 text-left text-sm text-(--text-primary) hover:bg-(--bg-inset) flex items-center gap-3 transition-colors"
                      >
                        <Bot size={16} className="text-(--text-tertiary) shrink-0" />
                        <span className="font-medium">{s.label}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <button
                onClick={handleSubmit}
                className={clsx(KNOPF_PRIMAER, 'w-12 h-12 rounded-xl flex items-center justify-center shrink-0')}
              >
                <Send size={18} strokeWidth={1.75} />
              </button>
              <button
                onClick={handleMicClick}
                aria-label={t('spracheingabe')}
                className={clsx(
                  'w-12 h-12 rounded-xl flex items-center justify-center shrink-0 border transition-colors',
                  isListening
                    ? 'bg-(--tint-danger) border-(--color-danger) text-(--color-danger) animate-pulse'
                    : 'surface-inset text-(--text-secondary) hover:text-(--text-primary) hover:border-(--mode-accent)'
                )}
              >
                <Mic size={18} strokeWidth={1.75} />
              </button>
            </div>

            {/* Quick-Prompts unter dem Chat. Zwei Prompts ("Vorbereitung
                Gesprächstermin", "Ansprechpartner Private Banking") klappen
                beim Klick ein Kunden-/Kollegen-Auswahl-Dropdown auf. */}
            <div className="flex flex-wrap justify-center gap-2 mt-4">
              <QuickPromptChip label={t('chip.vertriebsCockpit')} onClick={() => { setChatInput(t('chip.vertriebsCockpit')); executeSuggestion({ action: 'overview' }); }} />
              <QuickPromptChip label={t('chip.produktlandschaft')} onClick={() => { setChatInput(t('chip.produktlandschaft')); executeSuggestion({ action: 'overview' }); }} />
              <QuickPromptChip
                label={t('chip.ansprechpartner')}
                active={openPromptDropdown === 'ansprechpartner'}
                onClick={() => setOpenPromptDropdown(d => d === 'ansprechpartner' ? null : 'ansprechpartner')}
                hasDropdown
              />
              <QuickPromptChip label={t('chip.kommendeGespraeche')} onClick={() => { setChatInput(t('chip.kommendeGespraeche')); executeSuggestion({ action: 'overview' }); }} />
              <QuickPromptChip
                label={t('chip.gespraechsvorbereitung')}
                active={openPromptDropdown === 'termin'}
                onClick={() => setOpenPromptDropdown(d => d === 'termin' ? null : 'termin')}
                hasDropdown
              />
            </div>

            {/* Dropdowns unter den Chips */}
            {openPromptDropdown === 'termin' && (
              <div className="surface-inset mt-3 rounded-2xl p-3 animate-fade-in">
                <div className="text-[11px] uppercase tracking-wider text-(--text-tertiary) font-semibold px-2 py-1">
                  {t('kundeFuerGespraechWaehlen')}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 mt-1">
                  {(TERMINE_BY_MODE[activeModule] || []).map((termin, i) => (
                    <button
                      key={i}
                      onClick={() => {
                        setOpenPromptDropdown(null);
                        setChatInput(t('vorbereitungGespraechMit', { kunde: termin.kunde }));
                        // Kunde aus den Stammdaten ziehen – falls nicht
                        // vorhanden (reine Termin-Stubs), fallback auf einen
                        // minimalen Kunde-Datensatz aus dem Termin selbst.
                        const kunde = getKundeById(activeModule, termin.kundeId)
                          || getTerminStubKunde(termin.kundeId)
                          || { id: termin.kundeId, name: termin.kunde, foto: termin.foto };
                        setTerminPrep({ kunde, termin });
                      }}
                      className="flex items-center gap-3 px-3 py-2 rounded-xl bg-(--bg-card) border border-(--border-light) hover:border-(--mode-accent) text-left transition-colors"
                    >
                      {termin.foto ? (
                        <img src={termin.foto} alt={termin.kunde} className="w-9 h-9 rounded-full object-cover shrink-0" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
                      ) : (
                        <div className="w-9 h-9 rounded-full bg-(--mode-primary-soft) text-(--mode-primary) flex items-center justify-center text-xs font-bold shrink-0">
                          {termin.kunde.split(' ').map(n => n[0]).join('').slice(0,2)}
                        </div>
                      )}
                      <div className="min-w-0 flex-1">
                        <div className="text-sm font-semibold text-(--text-primary) truncate">{termin.kunde}</div>
                        <div className="text-[11px] text-(--text-tertiary) truncate">{formatDateDE(termin.datum)} · {termin.zeit} · {termin.betreff}</div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {openPromptDropdown === 'ansprechpartner' && (
              <div className="surface-inset mt-3 rounded-2xl p-3 animate-fade-in">
                <div className="text-[11px] uppercase tracking-wider text-(--text-tertiary) font-semibold px-2 py-1">
                  {t('ansprechpartnerNachAbteilung')}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 mt-1">
                  {ANSPRECHPARTNER_ABTEILUNGEN.map((a, i) => (
                    <button
                      key={i}
                      onClick={() => {
                        setChatInput(t('ansprechpartnerThema', { thema: t(a.abteilungKey) }));
                        setOpenPromptDropdown(null);
                        executeSuggestion({ action: 'overview' });
                      }}
                      className="flex items-center gap-3 px-3 py-2 rounded-xl bg-(--bg-card) border border-(--border-light) hover:border-(--mode-accent) text-left transition-colors"
                    >
                      <div className="w-9 h-9 rounded-lg bg-(--mode-primary-soft) text-(--mode-primary) flex items-center justify-center shrink-0">
                        <Briefcase size={16} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="text-sm font-semibold text-(--text-primary) truncate">{t(a.abteilungKey)}</div>
                        <div className="text-[11px] text-(--text-tertiary) truncate">{t(a.beschreibungKey)}</div>
                      </div>
                    </button>
                  ))}
                </div>
                {/* Freitext-Feld für Abteilungen, die nicht in der Liste sind */}
                <div className="mt-3 pt-3 border-t border-(--border-light)">
                  <label className="block text-[11px] uppercase tracking-wider text-(--text-tertiary) font-semibold px-1 mb-1.5">
                    {t('andereAbteilungThema')}
                  </label>
                  <input
                    type="text"
                    value={ansprechpartnerFreitext}
                    onChange={(e) => setAnsprechpartnerFreitext(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && ansprechpartnerFreitext.trim()) {
                        setChatInput(t('ansprechpartnerThema', { thema: ansprechpartnerFreitext.trim() }));
                        setOpenPromptDropdown(null);
                        setAnsprechpartnerFreitext('');
                        executeSuggestion({ action: 'overview' });
                      }
                    }}
                    placeholder={t('andereAbteilungPlaceholder')}
                    className="w-full h-9 px-3 rounded-lg bg-(--bg-card) border border-(--border-medium) text-(--text-primary) text-sm placeholder:text-(--text-tertiary) focus:border-(--mode-accent) transition-colors"
                  />
                </div>
              </div>
            )}

            {/* Inline-Chatverlauf unter dem Chat-Input. Rechte Blase zeigt die
                gestellte Frage, linke Blase die Antwort des Assistenten. */}
            {(claudeLoading || claudeReply) && (
              <div className="mt-4 space-y-2 animate-fade-in">
                {claudeReply?.prompt && (
                  <div className="flex justify-end">
                    <div className="max-w-[80%] rounded-2xl rounded-tr-md px-4 py-2 bg-(--mode-primary) text-white text-sm">
                      {claudeReply.prompt}
                    </div>
                  </div>
                )}
                <div className="flex justify-start gap-2 items-start">
                  <div className="w-7 h-7 rounded-full bg-(--mode-primary-soft) text-(--mode-primary) flex items-center justify-center shrink-0 mt-0.5">
                    <Bot size={14} />
                  </div>
                  <div className="max-w-[80%] rounded-2xl rounded-tl-md px-4 py-2 bg-(--bg-card) border border-(--border-light) text-(--text-primary) text-sm leading-relaxed whitespace-pre-wrap">
                    {claudeLoading ? (
                      <span className="flex items-center gap-2 text-(--text-secondary)">
                        <Loader2 size={14} className="animate-spin" />
                        {t('kiAntwortet')}
                      </span>
                    ) : claudeReply?.error ? (
                      <span className="text-(--color-danger)">{claudeReply.error}</span>
                    ) : (
                      claudeReply?.text
                    )}
                  </div>
                  {!claudeLoading && (
                    <button
                      type="button"
                      onClick={() => setClaudeReply(null)}
                      className="text-(--text-tertiary) hover:text-(--text-primary) mt-1 transition-colors"
                      aria-label={t('antwortEntfernen')}
                    >
                      <X size={14} />
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Module Tabs + Institut-Varianten sind in die Einstellungen unten
            umgezogen, damit der zentrale Landing-Bereich ruhiger bleibt. */}
      </div>

      {/* Settings Section */}
      <div className="px-6 py-4 shrink-0">
        <button
          onClick={() => setShowSettings(v => !v)}
          className={clsx(GLAS, 'flex items-center gap-2 mx-auto h-8 px-3 rounded-full text-(--text-secondary) hover:text-(--text-primary) hover:border-(--mode-accent) text-xs font-medium transition-colors')}
        >
          <Settings size={14} />
          {t('einstellungen')}
          {showSettings ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </button>

        {showSettings && (
          <div className={clsx(GLAS, 'mt-4 max-w-md mx-auto rounded-2xl p-5 shadow-[0_16px_40px_-20px_rgba(28,26,23,0.35)] animate-fade-in')}>
            {/* Modul-Auswahl */}
            <h3 className="text-(--text-primary) text-sm font-semibold mb-3 flex items-center gap-2">
              <Briefcase size={16} className="text-(--text-tertiary)" />
              {t('modul')}
            </h3>
            <div className="flex gap-2 mb-3 flex-wrap">
              {MODULE_TABS.map(tab => {
                const Icon = tab.icon;
                const isActive = activeModule === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => { setActiveModule(tab.id); setSelectedVariant(NUR_WHITELABEL ? whitelabelVariante(tab.id) : null); try { localStorage.setItem('kia_last_mode', JSON.stringify({ modeId: tab.id })); } catch {} }}
                    className={clsx(
                      'flex items-center gap-2 h-9 px-3 rounded-[10px] text-xs font-medium',
                      isActive ? clsx(KNOPF_PRIMAER, 'border border-(--mode-primary)') : KNOPF_SEKUNDAER
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
              className="flex items-center gap-2 text-(--text-secondary) hover:text-(--text-primary) text-xs font-medium transition-colors mb-3"
            >
              {showVariants ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
              {showVariants ? t('unternehmenAusblenden') : t('unternehmenAuswaehlen')}
            </button>
            {showVariants && (
              <div data-echte-namen className="flex flex-wrap gap-2 mb-4 animate-fade-in">
                {sichtbareVarianten(activeConfig).map((variant) => {
                  const isSelected = selectedVariant?.institut === variant.institut ||
                    (!selectedVariant && variant.institut === activeConfig.institut);
                  return (
                    <button
                      key={variant.institut}
                      onClick={() => { setSelectedVariant(variant); try { localStorage.setItem('kia_last_mode', JSON.stringify({ modeId: activeModule, variant })); } catch {} }}
                      className={clsx(
                        'flex items-center gap-2 h-8 px-2.5 rounded-[10px] text-[11px] font-medium',
                        isSelected ? clsx(KNOPF_PRIMAER, 'border border-(--mode-primary)') : KNOPF_SEKUNDAER
                      )}
                    >
                      <LogoImg name={variant.institut} size={16} echt />
                      {variant.institut}
                    </button>
                  );
                })}
              </div>
            )}

            <div className="h-px bg-(--border-light) my-4" />

            <h3 className="text-(--text-primary) text-sm font-semibold mb-4 flex items-center gap-2">
              <User size={16} className="text-(--text-tertiary)" />
              {t('beraterProfil')}
            </h3>

            {/* Photo */}
            <div className="flex items-center gap-4 mb-4">
              <div className="relative">
                {settingsPhoto ? (
                  <img src={settingsPhoto} alt="Profil" className="w-16 h-16 rounded-full object-cover border-2 border-(--border-light)" />
                ) : (
                  <div className="w-16 h-16 rounded-full bg-(--bg-inset) border-2 border-(--border-light) flex items-center justify-center">
                    <User size={24} className="text-(--text-tertiary)" />
                  </div>
                )}
              </div>
              <div className="flex flex-col gap-1.5">
                <button
                  onClick={() => photoInputRef.current?.click()}
                  className={clsx(KNOPF_SEKUNDAER, 'flex items-center gap-1.5 h-8 px-3 rounded-[10px] text-xs font-medium')}
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
                    className="text-[11px] text-(--text-tertiary) hover:text-(--text-secondary) transition-colors text-left"
                  >
                    {t('bildEntfernen')}
                  </button>
                )}
              </div>
            </div>

            {/* Anrede */}
            <label className="block text-xs text-(--text-secondary) font-medium mb-1.5">{t('anrede')}</label>
            <div className="flex gap-2 mb-4">
              {[
                { value: 'm', label: t('herr') },
                { value: 'w', label: t('frau') },
              ].map(opt => (
                <button
                  key={opt.value}
                  onClick={() => handleGenderChange(opt.value)}
                  className={clsx(
                    'h-9 px-4 rounded-[10px] text-sm font-medium',
                    settingsGender === opt.value ? clsx(KNOPF_PRIMAER, 'border border-(--mode-primary)') : KNOPF_SEKUNDAER
                  )}
                >
                  {opt.label}
                </button>
              ))}
            </div>

            {/* Name input */}
            <label className="block text-xs text-(--text-secondary) font-medium mb-1.5">{t('vorUndNachname')}</label>
            <input
              type="text"
              value={settingsName}
              onChange={e => setSettingsName(e.target.value)}
              onBlur={handleSettingsSave}
              onKeyDown={e => { if (e.key === 'Enter') handleSettingsSave(); }}
              placeholder={t('namePlaceholder')}
              className={clsx(FELD, 'w-full h-10 px-4 rounded-[10px] text-sm mb-4')}
            />

            <div className="h-px bg-(--border-light) my-4" />

            {/* Bildschirmaufnahme */}
            <h3 className="text-(--text-primary) text-sm font-semibold mb-2 flex items-center gap-2">
              <Video size={16} className="text-(--text-tertiary)" />
              {t('bildschirmaufnahme')}
            </h3>
            <p className="text-[12px] text-(--text-tertiary) mb-3 leading-relaxed">
              {t('bildschirmaufnahmeHinweis')}
            </p>
            {recordPhase === 'recording' ? (
              <button
                onClick={stopRecording}
                className="flex items-center gap-1.5 h-8 px-3 rounded-[10px] bg-(--color-danger) hover:opacity-90 text-white text-xs font-medium transition-opacity mb-4"
              >
                <Square size={12} fill="currentColor" /> {t('aufnahmeStoppen')}
              </button>
            ) : (
              <button
                onClick={startRecording}
                disabled={recordPhase === 'countdown'}
                className={clsx(KNOPF_SEKUNDAER, 'flex items-center gap-1.5 h-8 px-3 rounded-[10px] text-xs font-medium mb-4 disabled:opacity-60')}
              >
                <Video size={12} />
                {recordPhase === 'countdown' ? t('aufnahmeStartIn', { n: recordCountdown }) : t('aufnahmeStarten')}
              </button>
            )}

            {/* Reset */}
            <button
              onClick={handleSettingsReset}
              className="flex items-center gap-1.5 h-8 px-3 rounded-[10px] text-(--text-tertiary) hover:text-(--text-primary) hover:bg-(--bg-inset) text-xs font-medium transition-colors"
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
