import { useState, useEffect, useRef } from 'react';
import { clsx } from 'clsx';
import { ArrowLeft, Home, ChevronDown, Download, Settings, User, Calendar, AlertTriangle, Cloud, Sun, CloudRain, TrendingUp, TrendingDown, Minus, Image as ImageIcon, Upload, Trash2, X, Clock, Sparkles, CheckCircle } from 'lucide-react';
import { useMode } from '../../hooks/useMode';
import { MODE_CONFIGS } from '../../data/modeConfig';
import LogoImg from '../ui/LogoImg';
import { downloadDemoData } from '../../utils/downloadDemoData';
import useTranslation from '../../i18n/useTranslation';
import { isDayAdvanced, setDayAdvanced, useDayAdvanced, formatAppointmentDate, formatAppointmentTime, getSimulatedAppointment } from '../../utils/demoClock';

function getBasePath() {
  const path = window.location.pathname;
  if (path.includes('/vertriebsarbeitsplatz/')) {
    return path.substring(0, path.indexOf('/vertriebsarbeitsplatz/')) + '/';
  }
  return '/';
}

const TAGESSTART_ITEMS = {
  versicherung: [
    { icon: Calendar, textKey: 'termineHeute', textPrefix: '4 ' },
    { icon: AlertTriangle, textKey: 'offenePotenziale', textPrefix: '8 ', className: 'text-amber-300' },
    { icon: Calendar, textKey: 'followupsFaellig', textPrefix: '3 ' },
  ],
  banking: [
    { icon: Calendar, textKey: 'termine', textPrefix: '4 ' },
    { icon: Calendar, textKey: 'rueckruf', textPrefix: '1 ' },
    { icon: AlertTriangle, textKey: 'fidaConsentsOffen', textPrefix: '2 ', className: 'text-amber-300' },
  ],
  vermoegensverwaltung: [
    { icon: Calendar, textKey: 'mandateMeetings', textPrefix: '2 ' },
    { icon: Calendar, textKey: 'followupsFaellig', textPrefix: '3 ' },
    { icon: AlertTriangle, textKey: 'wphgAbgelaufen', textPrefix: '1 ', className: 'text-red-300' },
  ],
};

// Mock weather data
function getWeatherData() {
  const h = new Date().getHours();
  if (h < 12) return { temp: 8, conditionKey: 'bewoelkt', icon: Cloud, high: 14, low: 4 };
  if (h < 17) return { temp: 13, conditionKey: 'teilwSonnig', icon: Sun, high: 14, low: 4 };
  return { temp: 9, conditionKey: 'bewoelkt', icon: Cloud, high: 14, low: 4 };
}

// Mock Bloomberg market data
const MARKET_DATA = [
  { symbol: 'DAX', value: '18.245', change: '+0,42%', positive: true },
  { symbol: 'S&P 500', value: '5.892', change: '+0,18%', positive: true },
  { symbol: 'EUR/USD', value: '1,0847', change: '-0,12%', positive: false },
  { symbol: 'Bund 10Y', value: '2,31%', change: '+2bp', positive: null },
  { symbol: 'Gold', value: '2.185', change: '+0,65%', positive: true },
];

// Default header images per institut variant. The user can override them
// by uploading their own image, or hide them entirely via the toggle.
const DEFAULT_HEADER_IMAGES = {
  'Zukunftsbank': './images/zukunftsbank-header.jpeg',
  // Zukunftsversicherung teilt sich das Header-Stockphoto des Bankfrontends
  // (Whitelabel-Geschwister), damit die Marken optisch zusammen auftreten.
  'Zukunftsversicherung': './images/zukunftsbank-header.jpeg',
};

function readHeaderImage() {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem('kia_header_image');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function readHeaderImageEnabled() {
  if (typeof window === 'undefined') return true;
  try {
    const raw = localStorage.getItem('kia_header_image_enabled');
    if (raw === null) return true; // default ON
    return raw !== 'false';
  } catch {
    return true;
  }
}

function readDefaultHeaderPos() {
  if (typeof window === 'undefined') return { posX: 50, posY: 50 };
  try {
    const raw = localStorage.getItem('kia_header_default_pos');
    if (raw) return JSON.parse(raw);
  } catch {}
  return { posX: 50, posY: 50 };
}

export default function GlobalHeader({ kundeInfo, tabBadges }) {
  const { config, modeId, switchMode, switchInstitut, navigateTo, activeTab, setActiveTab, currentView, goBack } = useMode();
  const { t, lang } = useTranslation();
  const [showModeDropdown, setShowModeDropdown] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showDayAdvanceOverlay, setShowDayAdvanceOverlay] = useState(false);
  const dayAdvanced = useDayAdvanced();
  const [headerImage, setHeaderImage] = useState(() => readHeaderImage());
  const [headerImageEnabled, setHeaderImageEnabled] = useState(() => readHeaderImageEnabled());
  const [defaultHeaderPos, setDefaultHeaderPos] = useState(() => readDefaultHeaderPos());
  const fileInputRef = useRef(null);
  const tabs = currentView === 'detail' ? config.detailTabs : config.tabs;
  const tagesItems = TAGESSTART_ITEMS[modeId] || TAGESSTART_ITEMS.versicherung;
  const weather = getWeatherData();
  const WeatherIcon = weather.icon;
  const isOverview = currentView !== 'detail';

  // Default header image lookup based on the active institut variant
  const defaultHeaderImageUrl = DEFAULT_HEADER_IMAGES[config.institut] || null;

  // Persist header image overrides whenever they change
  useEffect(() => {
    try {
      if (headerImage) localStorage.setItem('kia_header_image', JSON.stringify(headerImage));
      else localStorage.removeItem('kia_header_image');
    } catch {}
  }, [headerImage]);

  useEffect(() => {
    try {
      localStorage.setItem('kia_header_image_enabled', String(headerImageEnabled));
    } catch {}
  }, [headerImageEnabled]);

  useEffect(() => {
    try {
      localStorage.setItem('kia_header_default_pos', JSON.stringify(defaultHeaderPos));
    } catch {}
  }, [defaultHeaderPos]);

  function handleFileSelect(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setHeaderImage({
        dataUrl: reader.result,
        posX: 50,
        posY: 50,
      });
    };
    reader.readAsDataURL(file);
  }

  // Build the header background style:
  // 1. If toggle is OFF → mode gradient
  // 2. Else if user uploaded image → use it
  // 3. Else if institut has a default image → use that
  // 4. Else mode gradient
  let headerStyle;
  if (!headerImageEnabled) {
    headerStyle = { background: config.colors.gradient };
  } else if (headerImage) {
    headerStyle = {
      backgroundImage: `linear-gradient(rgba(15,23,42,0.55), rgba(15,23,42,0.55)), url(${headerImage.dataUrl})`,
      backgroundSize: 'cover',
      backgroundPosition: `${headerImage.posX}% ${headerImage.posY}%`,
      backgroundRepeat: 'no-repeat',
    };
  } else if (defaultHeaderImageUrl) {
    headerStyle = {
      backgroundImage: `linear-gradient(rgba(15,23,42,0.55), rgba(15,23,42,0.55)), url(${defaultHeaderImageUrl})`,
      backgroundSize: 'cover',
      backgroundPosition: `${defaultHeaderPos.posX}% ${defaultHeaderPos.posY}%`,
      backgroundRepeat: 'no-repeat',
    };
  } else {
    headerStyle = { background: config.colors.gradient };
  }

  return (
    <header className="transition-all duration-500" style={headerStyle}>
      {/* Top Row */}
      <div className="px-6 pt-5 pb-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => { window.location.href = getBasePath(); }}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-colors"
            title={t('zurueckStartseite')}
          >
            <Home size={16} strokeWidth={1.75} />
            <span className="text-xs font-medium hidden sm:inline">{t('startseite')}</span>
          </button>
          {currentView === 'detail' && (
            <button onClick={goBack} className="text-white/70 hover:text-white transition-colors p-1" title={t('zurueckUebersicht')}>
              <ArrowLeft size={20} strokeWidth={1.75} />
            </button>
          )}
          <div className="w-10 h-10 rounded-lg bg-white/20 border border-white/30 flex items-center justify-center overflow-hidden">
            <LogoImg name={config.institut} size={32} />
          </div>
          <div className="flex items-center gap-3">
            {(() => {
              const customPhoto = typeof window !== 'undefined' ? localStorage.getItem('kia_user_photo') : null;
              const customName = typeof window !== 'undefined' ? localStorage.getItem('kia_user_fullname') : null;
              const displayName = customName || config.beraterName;
              const displayPhoto = customPhoto || config.beraterFoto;
              return (
                <>
                  {displayPhoto ? (
                    <div className="w-12 h-12 rounded-full border-2 border-white/50 overflow-hidden">
                      <img src={displayPhoto} alt={displayName} className="w-full h-full object-cover" />
                    </div>
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-white/20 border-2 border-white/50 flex items-center justify-center">
                      <User size={24} className="text-white" strokeWidth={1.75} />
                    </div>
                  )}
                  <div>
                    <div className="text-white text-sm font-medium">
                      {(() => {
                        if (lang === 'en' && config.beraterTitelEn) return config.beraterTitelEn;
                        const gender = localStorage.getItem('kia_user_gender');
                        if (gender === 'm' && config.beraterTitelM) return config.beraterTitelM;
                        if (gender === 'w' && config.beraterTitelW) return config.beraterTitelW;
                        return config.beraterTitel;
                      })()}: {displayName}
                    </div>
                    <div className="text-white/60 text-xs">
                      {config.beraterId} | {t('aktiv')}
                    </div>
                  </div>
                </>
              );
            })()}
          </div>

          {/* To-Dos inline next to advisor name */}
          {isOverview && (
            <div className="flex items-center gap-3 ml-4 pl-4 border-l border-white/20">
              {tagesItems.map((item, i) => {
                const Icon = item.icon;
                return (
                  <span key={i} className="flex items-center gap-1 text-white/80 text-xs">
                    <Icon size={13} className={item.className || 'text-white/60'} />
                    {item.textPrefix}{t(item.textKey)}
                  </span>
                );
              })}
            </div>
          )}
        </div>

        <div className="flex items-center gap-3">
          {/* Weather Widget */}
          {isOverview && (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/10 text-white text-xs">
              <WeatherIcon size={16} className="text-white/80" />
              <span className="font-medium">{weather.temp}°C</span>
              <span className="text-white/50">{t(weather.conditionKey)}</span>
            </div>
          )}

          <div className="relative">
            <button
              onClick={() => setShowModeDropdown(!showModeDropdown)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-sm transition-colors"
            >
              {config.institut} <ChevronDown size={16} />
            </button>
            {showModeDropdown && (
              <ModeDropdown
                currentMode={modeId}
                currentInstitut={config.institut}
                onSelect={(mId, variant) => { switchInstitut(variant, mId); setShowModeDropdown(false); }}
                onClose={() => setShowModeDropdown(false)}
              />
            )}
          </div>
          {/* Demo-Zeitmaschine (nur Banking) */}
          {modeId === 'banking' && (
            <button
              onClick={() => {
                if (dayAdvanced) {
                  // Bereits aktiv → zurücksetzen
                  setDayAdvanced(false);
                  return;
                }
                setShowDayAdvanceOverlay(true);
                setTimeout(() => {
                  setDayAdvanced(true);
                  setTimeout(() => {
                    setShowDayAdvanceOverlay(false);
                    // Nach der Nacht-Simulation immer auf der Übersicht landen,
                    // damit der neue Termin direkt sichtbar ist.
                    navigateTo('overview', { tab: 'uebersicht' });
                  }, 850);
                }, 1600);
              }}
              title="Demo-Zeitmaschine: einen Tag weiter springen"
              className={clsx(
                'p-2 rounded-lg text-white transition-colors relative',
                dayAdvanced ? 'bg-emerald-500/40 hover:bg-emerald-500/50' : 'bg-white/10 hover:bg-white/20'
              )}
            >
              <Clock size={18} strokeWidth={1.75} />
              {dayAdvanced && (
                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-400 border border-white" />
              )}
            </button>
          )}
          <button
            onClick={downloadDemoData}
            title={t('demodatenExportieren')}
            className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
          >
            <Download size={18} strokeWidth={1.75} />
          </button>
          <button
            onClick={() => setShowSettings(true)}
            className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
            title={lang === 'en' ? 'Header settings' : 'Header-Einstellungen'}
          >
            <Settings size={18} strokeWidth={1.75} />
          </button>
        </div>
      </div>
      {/* Demo-Hinweis rechts */}
      <div className="px-6 flex justify-end -mt-1 pb-1">
        <span className="text-[11px] text-white/40 tracking-wide">Demo-Umgebung — Rein synthetische Daten, keine echten Kundendaten</span>
      </div>

      {/* Bloomberg Market Ticker - only on overview in VV mode */}
      {isOverview && modeId === 'vermoegensverwaltung' && (
        <div className="px-6 pb-2">
          <div className="flex items-center gap-4 text-xs overflow-x-auto">
            <span className="text-white/40 font-medium shrink-0">{t('maerkte')}</span>
            {MARKET_DATA.map((m, i) => (
              <div key={i} className="flex items-center gap-1.5 shrink-0">
                <span className="text-white/60">{m.symbol}</span>
                <span className="text-white font-mono font-medium">{m.value}</span>
                <span className={clsx(
                  'font-mono font-medium flex items-center gap-0.5',
                  m.positive === true ? 'text-emerald-300' : m.positive === false ? 'text-red-300' : 'text-white/50'
                )}>
                  {m.positive === true && <TrendingUp size={10} />}
                  {m.positive === false && <TrendingDown size={10} />}
                  {m.positive === null && <Minus size={10} />}
                  {m.change}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Kunden-Zeile (Detail-Ansicht) */}
      {kundeInfo && (
        <div className="px-6 pb-2">
          <div className="flex items-center gap-3 text-white/80 text-sm">
            <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center text-sm font-bold text-white">
              {kundeInfo.name.split(/\s+/).filter(w => !/^(Dr\.|Prof\.|Fam\.|Dipl\.-Ing\.)$/i.test(w)).map(n => n[0]).join('')}
            </div>
            <span className="font-medium text-white">{kundeInfo.name}</span>
            <span className="text-white/50">|</span>
            <span>{kundeInfo.id}</span>
            {kundeInfo.beruf && <><span className="text-white/50">|</span><span>{kundeInfo.beruf}</span></>}
          </div>
        </div>
      )}

      {/* Tab-Leiste */}
      <div className="px-6 flex gap-1 overflow-x-auto pb-0">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={clsx(
              'px-4 py-2.5 text-sm font-medium rounded-t-lg transition-all duration-200 whitespace-nowrap',
              activeTab === tab.id
                ? 'bg-white text-slate-800'
                : 'text-white/70 hover:text-white hover:bg-white/10'
            )}
          >
            {tab.labelKey ? t(tab.labelKey) : (lang === 'en' && tab.labelEn ? tab.labelEn : tab.label)}
            {tabBadges?.[tab.id] > 0 && (
              <span className="ml-1.5 inline-flex items-center justify-center w-5 h-5 text-[10px] font-bold rounded-full bg-red-500 text-white">{tabBadges[tab.id]}</span>
            )}
          </button>
        ))}
      </div>

      {/* Demo-Zeitmaschinen-Overlay: täuscht Nacht-zu-nächster-Tag vor und
          setzt dann das Flag, damit neue Aktivitäten sichtbar werden. */}
      {showDayAdvanceOverlay && (
        <div className="fixed inset-0 z-[90] flex items-center justify-center bg-slate-950/70 backdrop-blur-md animate-fade-in">
          <div className="text-center text-white space-y-5 px-6">
            <div className="w-20 h-20 mx-auto rounded-2xl flex items-center justify-center shadow-2xl" style={{ background: 'linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)' }}>
              <Clock size={38} className="animate-pulse" />
            </div>
            <div className="space-y-1">
              <div className="text-xl font-semibold">Nacht simulieren …</div>
              <div className="text-sm text-white/70 max-w-md mx-auto">
                KI wartet auf Reaktionen Ihrer Kunden und sammelt neue Aktivitäten für den nächsten Tag.
              </div>
            </div>
            <div className="flex items-center justify-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-white/80 animate-pulse" />
              <span className="w-2 h-2 rounded-full bg-white/60 animate-pulse [animation-delay:150ms]" />
              <span className="w-2 h-2 rounded-full bg-white/40 animate-pulse [animation-delay:300ms]" />
            </div>
            {dayAdvanced && (
              <div className="inline-flex items-center gap-2 text-emerald-300 text-sm font-medium bg-emerald-500/10 border border-emerald-400/30 px-3 py-1.5 rounded-full">
                <CheckCircle size={14} /> Neue Termin­zusage eingegangen
              </div>
            )}
          </div>
        </div>
      )}

      {/* Settings modal — header background image upload + crop position */}
      {showSettings && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm p-6"
          onClick={() => setShowSettings(false)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <ImageIcon size={20} className="text-slate-600" strokeWidth={1.75} />
                <h3 className="font-semibold text-slate-800">{lang === 'en' ? 'Header background' : 'Header-Hintergrund'}</h3>
              </div>
              <button
                onClick={() => setShowSettings(false)}
                className="p-2 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-slate-700 transition-colors"
                aria-label="Close"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-5 space-y-4">
              {/* On/off toggle */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200">
                <div>
                  <div className="text-sm font-semibold text-slate-800">
                    {lang === 'en' ? 'Show header image' : 'Header-Bild anzeigen'}
                  </div>
                  <div className="text-xs text-slate-500 mt-0.5">
                    {lang === 'en'
                      ? 'When off, the header uses the institut gradient instead.'
                      : 'Wenn aus, nutzt der Header den Institut-Gradient stattdessen.'}
                  </div>
                </div>
                <button
                  type="button"
                  role="switch"
                  aria-checked={headerImageEnabled}
                  onClick={() => setHeaderImageEnabled((v) => !v)}
                  className="relative inline-flex h-7 w-12 shrink-0 items-center rounded-full transition-colors"
                  style={{ backgroundColor: headerImageEnabled ? '#10b981' : '#cbd5e1' }}
                >
                  <span
                    className="inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform"
                    style={{ transform: headerImageEnabled ? 'translateX(24px)' : 'translateX(4px)' }}
                  />
                </button>
              </div>

              <p className="text-sm text-slate-600">
                {lang === 'en'
                  ? 'Upload a landscape photo to use as the header background. After uploading you can pan the visible crop with the sliders.'
                  : 'Lade ein Querformat-Foto hoch, das als Header-Hintergrund verwendet wird. Nach dem Upload kannst du den sichtbaren Bildausschnitt mit den Reglern verschieben.'}
              </p>

              {/* Default image notice (e.g. Zukunftsbank) */}
              {!headerImage && defaultHeaderImageUrl && (
                <div className="flex items-start gap-2 p-3 rounded-xl bg-indigo-50 border border-indigo-100 text-xs text-indigo-800">
                  <ImageIcon size={14} className="text-indigo-500 shrink-0 mt-0.5" />
                  <div>
                    {lang === 'en' ? 'A default header image is active for ' : 'Für '}
                    <strong>{config.institut}</strong>
                    {lang === 'en' ? '. Upload your own to override.' : ' ist ein Standard-Headerbild aktiv. Lade ein eigenes hoch, um es zu ersetzen.'}
                  </div>
                </div>
              )}

              <div className="flex items-center gap-3">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileSelect}
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-900 text-white text-sm font-medium hover:bg-slate-700 transition-colors"
                >
                  <Upload size={14} strokeWidth={2} />
                  <span>{headerImage ? (lang === 'en' ? 'Replace image' : 'Bild ersetzen') : (lang === 'en' ? 'Upload image' : 'Bild hochladen')}</span>
                </button>
                {headerImage && (
                  <button
                    onClick={() => setHeaderImage(null)}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-50 text-red-700 text-sm font-medium hover:bg-red-100 transition-colors"
                  >
                    <Trash2 size={14} strokeWidth={2} />
                    <span>{lang === 'en' ? 'Remove' : 'Entfernen'}</span>
                  </button>
                )}
              </div>

              {/* Position sliders for the default image */}
              {!headerImage && defaultHeaderImageUrl && headerImageEnabled && (
                <div className="space-y-3">
                  <div className="text-xs uppercase font-bold text-slate-500 tracking-wider">
                    {lang === 'en' ? 'Default image preview' : 'Standard-Bild Vorschau'}
                  </div>
                  <div
                    className="w-full rounded-xl border border-slate-200 overflow-hidden"
                    style={{
                      height: 140,
                      backgroundImage: `linear-gradient(rgba(15,23,42,0.55), rgba(15,23,42,0.55)), url(${defaultHeaderImageUrl})`,
                      backgroundSize: 'cover',
                      backgroundPosition: `${defaultHeaderPos.posX}% ${defaultHeaderPos.posY}%`,
                      backgroundRepeat: 'no-repeat',
                    }}
                  >
                    <div className="h-full w-full flex items-center px-4 text-white text-sm font-medium">
                      {config.institut}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                        {lang === 'en' ? 'Horizontal' : 'Horizontal'} ({defaultHeaderPos.posX}%)
                      </label>
                      <input
                        type="range"
                        min={0}
                        max={100}
                        value={defaultHeaderPos.posX}
                        onChange={(e) => setDefaultHeaderPos({ ...defaultHeaderPos, posX: Number(e.target.value) })}
                        className="w-full"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                        {lang === 'en' ? 'Vertical' : 'Vertikal'} ({defaultHeaderPos.posY}%)
                      </label>
                      <input
                        type="range"
                        min={0}
                        max={100}
                        value={defaultHeaderPos.posY}
                        onChange={(e) => setDefaultHeaderPos({ ...defaultHeaderPos, posY: Number(e.target.value) })}
                        className="w-full"
                      />
                    </div>
                  </div>
                </div>
              )}

              {headerImage && (
                <div className="space-y-3">
                  <div className="text-xs uppercase font-bold text-slate-500 tracking-wider">
                    {lang === 'en' ? 'Preview' : 'Vorschau'}
                  </div>
                  <div
                    className="w-full rounded-xl border border-slate-200 overflow-hidden"
                    style={{
                      height: 140,
                      backgroundImage: `linear-gradient(rgba(15,23,42,0.55), rgba(15,23,42,0.55)), url(${headerImage.dataUrl})`,
                      backgroundSize: 'cover',
                      backgroundPosition: `${headerImage.posX}% ${headerImage.posY}%`,
                      backgroundRepeat: 'no-repeat',
                    }}
                  >
                    <div className="h-full w-full flex items-center px-4 text-white text-sm font-medium">
                      {lang === 'en' ? 'Header preview' : 'Header-Vorschau'}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                        {lang === 'en' ? 'Horizontal' : 'Horizontal'} ({headerImage.posX}%)
                      </label>
                      <input
                        type="range"
                        min={0}
                        max={100}
                        value={headerImage.posX}
                        onChange={(e) => setHeaderImage({ ...headerImage, posX: Number(e.target.value) })}
                        className="w-full"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                        {lang === 'en' ? 'Vertical' : 'Vertikal'} ({headerImage.posY}%)
                      </label>
                      <input
                        type="range"
                        min={0}
                        max={100}
                        value={headerImage.posY}
                        onChange={(e) => setHeaderImage({ ...headerImage, posY: Number(e.target.value) })}
                        className="w-full"
                      />
                    </div>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    {lang === 'en'
                      ? 'A dark overlay is added so the header text stays readable.'
                      : 'Ein dunkles Overlay wird automatisch hinzugefügt, damit der Header-Text lesbar bleibt.'}
                  </p>
                </div>
              )}
            </div>

            <div className="px-5 py-3 border-t border-slate-200 flex items-center justify-end">
              <button
                onClick={() => setShowSettings(false)}
                className="px-4 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-100 transition-colors"
              >
                {lang === 'en' ? 'Done' : 'Fertig'}
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

function ModeDropdown({ currentMode, currentInstitut, onSelect, onClose }) {
  const { lang } = useTranslation();
  const modes = Object.values(MODE_CONFIGS);

  return (
    <>
      <div className="fixed inset-0 z-40" onClick={onClose} />
      <div className="absolute right-0 top-full mt-2 w-72 bg-white rounded-xl shadow-xl border border-slate-200 z-50 animate-scale-in overflow-hidden max-h-[70vh] overflow-y-auto">
        {modes.map((m, mi) => (
          <div key={m.id}>
            {/* Mode category header */}
            <div
              className={clsx(
                'px-4 py-2 text-xs font-semibold text-white uppercase tracking-wider',
                mi > 0 && 'border-t border-slate-200'
              )}
              style={{ background: m.colors.gradient }}
            >
              {lang === 'en' && m.labelEn ? m.labelEn : m.label}
            </div>
            {/* Institute variants */}
            <div className="p-1.5">
              {(m.institutVarianten || []).map(variant => {
                const isActive = currentMode === m.id && currentInstitut === variant.institut;
                return (
                  <button
                    key={variant.institut}
                    onClick={() => onSelect(m.id, variant)}
                    className={clsx(
                      'w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors text-left',
                      isActive ? 'bg-slate-100 font-medium ring-1 ring-slate-300' : 'hover:bg-slate-50'
                    )}
                  >
                    <div className="w-7 h-7 rounded-md border border-slate-200 bg-white flex items-center justify-center overflow-hidden shrink-0">
                      <LogoImg name={variant.institut} size={22} />
                    </div>
                    <div className="min-w-0">
                      <div className="text-slate-800 truncate">{variant.institut}</div>
                      <div className="text-xs text-slate-400">{variant.beraterTitel}</div>
                    </div>
                    {isActive && (
                      <div className="ml-auto w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: variant.colors.primary }} />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
