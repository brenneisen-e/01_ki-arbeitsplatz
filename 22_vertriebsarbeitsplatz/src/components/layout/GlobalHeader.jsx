import { useState, useEffect, useRef } from 'react';
import { clsx } from 'clsx';
import { ArrowLeft, Home, ChevronDown, Download, Settings, User, Calendar, AlertTriangle, Cloud, Sun, CloudRain, TrendingUp, TrendingDown, Minus, Image as ImageIcon, Upload, Trash2, X, Clock, Sparkles, CheckCircle, RotateCcw, ScanLine, Check } from 'lucide-react';
import { useMode } from '../../hooks/useMode';
import { MODE_CONFIGS } from '../../data/modeConfig';
import LogoImg from '../ui/LogoImg';
import { downloadDemoData } from '../../utils/downloadDemoData';
import useTranslation from '../../i18n/useTranslation';
import { isDayAdvanced, setDayAdvanced, useDayAdvanced, formatAppointmentDate, formatAppointmentTime, getSimulatedAppointment } from '../../utils/demoClock';
import DatenabfrageFlow from '../datenabfrage/DatenabfrageFlow';
import { PraesentationsKnopf } from '../praesentation/Praesentation';
import { sichtbareVarianten } from '../../utils/einbettung';

function getBasePath() {
  const path = window.location.pathname;
  if (path.includes('/22_vertriebsarbeitsplatz/')) {
    return path.substring(0, path.indexOf('/22_vertriebsarbeitsplatz/')) + '/';
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
  'Zukunftsbank': 'images/zukunftsbank-header.jpeg',
  // Zukunftsversicherung teilt sich das Header-Stockphoto des Bankfrontends
  // (Whitelabel-Geschwister), damit die Marken optisch zusammen auftreten.
  'Zukunftsversicherung': 'images/zukunftsbank-header.jpeg',
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
  const [showDatenabfrage, setShowDatenabfrage] = useState(false);
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
  const istVV = modeId === 'vermoegensverwaltung';

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
  // Dunkler Verlaufs-Scrim über dem Foto: oben leichter, unten dichter,
  // damit Beratername, Chips und Reiter auf ruhiger dunkler Fläche stehen.
  const HEADER_SCRIM = 'linear-gradient(180deg, rgba(20,16,18,0.45) 0%, rgba(20,16,18,0.62) 55%, rgba(20,16,18,0.82) 100%)';
  let headerStyle;
  if (!headerImageEnabled) {
    headerStyle = { background: config.colors.gradient };
  } else if (headerImage) {
    headerStyle = {
      backgroundImage: `${HEADER_SCRIM}, url(${headerImage.dataUrl})`,
      backgroundSize: 'cover',
      backgroundPosition: `${headerImage.posX}% ${headerImage.posY}%`,
      backgroundRepeat: 'no-repeat',
    };
  } else if (defaultHeaderImageUrl) {
    headerStyle = {
      backgroundImage: `${HEADER_SCRIM}, url(${defaultHeaderImageUrl})`,
      backgroundSize: 'cover',
      backgroundPosition: `${defaultHeaderPos.posX}% ${defaultHeaderPos.posY}%`,
      backgroundRepeat: 'no-repeat',
    };
  } else {
    headerStyle = { background: config.colors.gradient };
  }

  return (
    <header className="transition-all duration-500 text-white" style={headerStyle}>
      {/* Top Row: pt-14 hält den Streifen unter der mittig angedockten
          Wasserzeichen-Lasche (DemoWasserzeichen.jsx, 55 px hoch) frei, damit
          Chips und To-dos mit Luft unter der Lasche stehen. Die Zeile bricht
          nie um, damit der Kopf in jeder Breite gleich hoch bleibt (163 px,
          dieselben Maße wie in Bestandsübertragung, Provisionsreklamation und
          VST-Cockpit); was nicht passt, blendet sich in schmalen Fenstern aus. */}
      <div className="px-6 pt-14 pb-3 flex items-center justify-between gap-4 whitespace-nowrap">
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
          <div className="w-10 h-10 rounded-lg header-glass flex items-center justify-center overflow-hidden">
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
                    <div className="w-12 h-12 rounded-full border-2 border-white/40 overflow-hidden">
                      <img src={displayPhoto} alt={displayName} className="w-full h-full object-cover" />
                    </div>
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-white/10 border-2 border-white/40 flex items-center justify-center">
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
                    <div className="text-white/70 text-xs font-mono">
                      {config.beraterId} | {t('aktiv')}
                    </div>
                  </div>
                </>
              );
            })()}
          </div>

          {/* To-Dos inline next to advisor name. Sie erscheinen erst, wenn die
              Kopfzeile sie einzeilig fasst (gemessen am längsten Institut und
              Titel je Modus, mit Play-Knopf): ab 1580 px, in der
              Vermögensverwaltung mit ihren längeren Titeln ab 1660 px. */}
          {isOverview && (
            <div className={clsx(
              'hidden items-center gap-3 ml-4 pl-4 border-l border-white/15',
              istVV ? 'min-[1660px]:flex' : 'min-[1580px]:flex'
            )}>
              {tagesItems.map((item, i) => {
                const Icon = item.icon;
                return (
                  <span key={i} className="flex items-center gap-1 text-white/70 text-xs">
                    <Icon size={13} className={item.className || 'text-white/50'} />
                    {item.textPrefix}{t(item.textKey)}
                  </span>
                );
              })}
            </div>
          )}
        </div>

        <div className="flex items-center gap-3 shrink-0">
          {/* Weather Widget: unter 1280 px ausgeblendet, der Wettertext erst
              ab 1760 px (Vermögensverwaltung 1840 px). */}
          {isOverview && (
            <div className="flex max-[1279px]:hidden items-center gap-2 px-3 py-1.5 rounded-lg header-glass text-xs">
              <WeatherIcon size={16} className="text-white/80" />
              <span className="font-medium">{weather.temp}°C</span>
              <span className={clsx('text-white/50 hidden', istVV ? 'min-[1840px]:inline' : 'min-[1760px]:inline')}>{t(weather.conditionKey)}</span>
            </div>
          )}

          {/* Datenabfrage – PSD2/Open-Banking-Landingpage für den Kunden */}
          <button
            onClick={() => setShowDatenabfrage(true)}
            title={lang === 'en' ? 'PSD2 / Open Banking customer data request' : 'PSD2 / Open-Banking Kunden-Datenabfrage'}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg header-glass text-xs font-medium"
          >
            <ScanLine size={15} strokeWidth={1.9} />
            {/* Beschriftung ab 1680 px (Vermögensverwaltung 1760 px), darunter nur das Icon */}
            <span className={clsx('hidden', istVV ? 'min-[1760px]:inline' : 'min-[1680px]:inline')}>{lang === 'en' ? 'Data request' : 'Datenabfrage'}</span>
          </button>

          <div className="relative">
            <button
              onClick={() => setShowModeDropdown(!showModeDropdown)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg header-glass text-sm"
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
          {/* Demo-Zeitmaschine (Banking + Versicherung) */}
          {(modeId === 'banking' || modeId === 'versicherung') && (
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
              title={t('demoZeitmaschineTitle')}
              className={clsx(
                'p-2 rounded-lg header-glass relative',
                dayAdvanced && 'ring-2 ring-(--color-success)'
              )}
            >
              <Clock size={18} strokeWidth={1.75} />
              {dayAdvanced && (
                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-(--color-success) border border-white" />
              )}
            </button>
          )}
          <button
            onClick={downloadDemoData}
            title={t('demodatenExportieren')}
            className="p-2 rounded-lg header-glass"
          >
            <Download size={18} strokeWidth={1.75} />
          </button>
          <button
            onClick={() => {
              const ok = window.confirm(t('demoDatenZuruecksetzenConfirm'));
              if (!ok) return;
              try {
                // Beraterprofil (Name, Foto, Anrede) ist KEIN Demo-Inhalt und
                // bleibt beim Zurücksetzen erhalten – nur die Demo-Daten (z. B.
                // der erkannte Hund) werden geleert.
                const PRESERVE = new Set([
                  'kia_user_fullname', 'kia_user_photo', 'kia_user_name', 'kia_user_gender',
                ]);
                const keys = [];
                for (let i = 0; i < localStorage.length; i++) {
                  const key = localStorage.key(i);
                  if (key && (key.startsWith('haustier_') || key.startsWith('kia_')) && !PRESERVE.has(key)) keys.push(key);
                }
                keys.forEach((k) => localStorage.removeItem(k));
              } catch {}
              window.location.reload();
            }}
            title={t('demoDatenZuruecksetzenTitle')}
            className="p-2 rounded-lg header-glass"
          >
            <RotateCcw size={18} strokeWidth={1.75} />
          </button>
          <button
            onClick={() => setShowSettings(true)}
            className="p-2 rounded-lg header-glass"
            title={lang === 'en' ? 'Header settings' : 'Header-Einstellungen'}
          >
            <Settings size={18} strokeWidth={1.75} />
          </button>
          {/* Play-Knopf ganz rechts: startet den geführten Durchlauf (components/praesentation) */}
          <PraesentationsKnopf />
        </div>
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
            <div className="w-9 h-9 rounded-full header-glass flex items-center justify-center text-sm font-bold">
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
      <div className="px-6 flex gap-1 overflow-x-auto pb-0 border-t border-white/10 mt-1">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={clsx(
              'px-4 py-2.5 text-sm font-medium border-b-2 transition-colors duration-200 whitespace-nowrap',
              activeTab === tab.id
                ? 'border-(--mode-accent) text-white'
                : 'border-transparent text-white/65 hover:text-white'
            )}
          >
            {tab.labelKey ? t(tab.labelKey) : (lang === 'en' && tab.labelEn ? tab.labelEn : tab.label)}
            {tabBadges?.[tab.id] > 0 && (
              <span className="ml-1.5 inline-flex items-center justify-center w-5 h-5 text-[10px] font-bold rounded-full bg-(--color-danger) text-white">{tabBadges[tab.id]}</span>
            )}
          </button>
        ))}
      </div>

      {/* Demo-Zeitmaschinen-Overlay: täuscht Nacht-zu-nächster-Tag vor und
          setzt dann das Flag, damit neue Aktivitäten sichtbar werden. */}
      {showDayAdvanceOverlay && (
        <div className="fixed inset-0 z-[90] flex items-center justify-center bg-slate-950/70 backdrop-blur-md animate-fade-in">
          <div className="text-center text-white space-y-5 px-6">
            <div className="w-20 h-20 mx-auto rounded-2xl flex items-center justify-center shadow-2xl border border-white/15" style={{ background: 'var(--mode-gradient)' }}>
              <Clock size={38} className="animate-pulse text-(--mode-accent)" />
            </div>
            <div className="space-y-1">
              <div className="text-xl font-semibold">{t('nachtSimulieren')}</div>
              <div className="text-sm text-white/70 max-w-md mx-auto">
                {t('nachtSimulierenText')}
              </div>
            </div>
            <div className="flex items-center justify-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-white/80 animate-pulse" />
              <span className="w-2 h-2 rounded-full bg-white/60 animate-pulse [animation-delay:150ms]" />
              <span className="w-2 h-2 rounded-full bg-white/40 animate-pulse [animation-delay:300ms]" />
            </div>
            {dayAdvanced && (
              <div className="inline-flex items-center gap-2 text-emerald-300 text-sm font-medium bg-white/10 px-3 py-1.5 rounded-full">
                <CheckCircle size={14} /> {t('neueTerminzusage')}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Settings modal — header background image upload + crop position */}
      {showSettings && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-[rgba(28,26,23,0.45)] backdrop-blur-sm p-6"
          onClick={() => setShowSettings(false)}
        >
          <div
            className="surface-elevated rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto text-(--text-primary)"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-5 py-4 border-b border-(--border-light)">
              <div className="flex items-center gap-2">
                <ImageIcon size={20} className="text-(--text-secondary)" strokeWidth={1.75} />
                <h3 className="font-semibold text-(--text-primary)">{lang === 'en' ? 'Header background' : 'Header-Hintergrund'}</h3>
              </div>
              <button
                onClick={() => setShowSettings(false)}
                className="p-2 rounded-lg hover:bg-(--bg-inset) text-(--text-tertiary) hover:text-(--text-primary) transition-colors"
                aria-label="Close"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-5 space-y-4">
              {/* On/off toggle */}
              <div className="flex items-center justify-between p-3 rounded-xl surface-inset">
                <div>
                  <div className="text-sm font-semibold text-(--text-primary)">
                    {lang === 'en' ? 'Show header image' : 'Header-Bild anzeigen'}
                  </div>
                  <div className="text-xs text-(--text-tertiary) mt-0.5">
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
                  style={{ backgroundColor: headerImageEnabled ? 'var(--color-success)' : 'var(--border-strong)' }}
                >
                  <span
                    className="inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform"
                    style={{ transform: headerImageEnabled ? 'translateX(24px)' : 'translateX(4px)' }}
                  />
                </button>
              </div>

              <p className="text-sm text-(--text-secondary)">
                {lang === 'en'
                  ? 'Upload a landscape photo to use as the header background. After uploading you can pan the visible crop with the sliders.'
                  : 'Lade ein Querformat-Foto hoch, das als Header-Hintergrund verwendet wird. Nach dem Upload kannst du den sichtbaren Bildausschnitt mit den Reglern verschieben.'}
              </p>

              {/* Default image notice (e.g. Zukunftsbank) */}
              {!headerImage && defaultHeaderImageUrl && (
                <div className="flex items-start gap-2 p-3 rounded-xl bg-(--tint-info) text-xs text-(--color-info)">
                  <ImageIcon size={14} className="shrink-0 mt-0.5" />
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
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-(--mode-primary) text-white text-sm font-medium hover:bg-(--mode-primary-light) transition-colors"
                >
                  <Upload size={14} strokeWidth={2} />
                  <span>{headerImage ? (lang === 'en' ? 'Replace image' : 'Bild ersetzen') : (lang === 'en' ? 'Upload image' : 'Bild hochladen')}</span>
                </button>
                {headerImage && (
                  <button
                    onClick={() => setHeaderImage(null)}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-(--tint-danger) text-(--color-danger) text-sm font-medium hover:bg-red-100 transition-colors"
                  >
                    <Trash2 size={14} strokeWidth={2} />
                    <span>{lang === 'en' ? 'Remove' : 'Entfernen'}</span>
                  </button>
                )}
              </div>

              {/* Position sliders for the default image */}
              {!headerImage && defaultHeaderImageUrl && headerImageEnabled && (
                <div className="space-y-3">
                  <div className="text-[11px] uppercase font-semibold text-(--text-tertiary) tracking-wider">
                    {lang === 'en' ? 'Default image preview' : 'Standard-Bild Vorschau'}
                  </div>
                  <div
                    className="w-full rounded-xl border border-(--border-light) overflow-hidden"
                    style={{
                      height: 140,
                      backgroundImage: `${HEADER_SCRIM}, url(${defaultHeaderImageUrl})`,
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
                      <label className="block text-[11px] font-semibold text-(--text-tertiary) uppercase tracking-wider mb-1">
                        {lang === 'en' ? 'Horizontal' : 'Horizontal'} ({defaultHeaderPos.posX}%)
                      </label>
                      <input
                        type="range"
                        min={0}
                        max={100}
                        value={defaultHeaderPos.posX}
                        onChange={(e) => setDefaultHeaderPos({ ...defaultHeaderPos, posX: Number(e.target.value) })}
                        className="w-full accent-(--mode-primary)"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-(--text-tertiary) uppercase tracking-wider mb-1">
                        {lang === 'en' ? 'Vertical' : 'Vertikal'} ({defaultHeaderPos.posY}%)
                      </label>
                      <input
                        type="range"
                        min={0}
                        max={100}
                        value={defaultHeaderPos.posY}
                        onChange={(e) => setDefaultHeaderPos({ ...defaultHeaderPos, posY: Number(e.target.value) })}
                        className="w-full accent-(--mode-primary)"
                      />
                    </div>
                  </div>
                </div>
              )}

              {headerImage && (
                <div className="space-y-3">
                  <div className="text-[11px] uppercase font-semibold text-(--text-tertiary) tracking-wider">
                    {lang === 'en' ? 'Preview' : 'Vorschau'}
                  </div>
                  <div
                    className="w-full rounded-xl border border-(--border-light) overflow-hidden"
                    style={{
                      height: 140,
                      backgroundImage: `${HEADER_SCRIM}, url(${headerImage.dataUrl})`,
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
                      <label className="block text-[11px] font-semibold text-(--text-tertiary) uppercase tracking-wider mb-1">
                        {lang === 'en' ? 'Horizontal' : 'Horizontal'} ({headerImage.posX}%)
                      </label>
                      <input
                        type="range"
                        min={0}
                        max={100}
                        value={headerImage.posX}
                        onChange={(e) => setHeaderImage({ ...headerImage, posX: Number(e.target.value) })}
                        className="w-full accent-(--mode-primary)"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-(--text-tertiary) uppercase tracking-wider mb-1">
                        {lang === 'en' ? 'Vertical' : 'Vertikal'} ({headerImage.posY}%)
                      </label>
                      <input
                        type="range"
                        min={0}
                        max={100}
                        value={headerImage.posY}
                        onChange={(e) => setHeaderImage({ ...headerImage, posY: Number(e.target.value) })}
                        className="w-full accent-(--mode-primary)"
                      />
                    </div>
                  </div>
                  <p className="text-[11px] text-(--text-tertiary)">
                    {lang === 'en'
                      ? 'A dark overlay is added so the header text stays readable.'
                      : 'Ein dunkles Overlay wird automatisch hinzugefügt, damit der Header-Text lesbar bleibt.'}
                  </p>
                </div>
              )}
            </div>

            <div className="px-5 py-3 border-t border-(--border-light) flex items-center justify-end">
              <button
                onClick={() => setShowSettings(false)}
                className="px-4 py-2 rounded-lg text-sm font-medium text-(--text-primary) hover:bg-(--bg-inset) transition-colors"
              >
                {lang === 'en' ? 'Done' : 'Fertig'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PSD2 / Open-Banking Kunden-Datenabfrage (Landingpage für den Kunden) */}
      <DatenabfrageFlow open={showDatenabfrage} onClose={() => setShowDatenabfrage(false)} />
    </header>
  );
}

function ModeDropdown({ currentMode, currentInstitut, onSelect, onClose }) {
  const { lang } = useTranslation();
  const modes = Object.values(MODE_CONFIGS);

  return (
    <>
      <div className="fixed inset-0 z-40" onClick={onClose} />
      {/* Instituts-Auswahl: zeigt die echten Marken auch im Whitelabel (data-echte-namen) */}
      <div data-echte-namen className="absolute right-0 top-full mt-2 w-72 surface-elevated rounded-xl z-50 animate-scale-in overflow-hidden max-h-[70vh] overflow-y-auto text-(--text-primary)">
        {modes.map((m, mi) => (
          <div key={m.id}>
            {/* Modus-Kicker mit Farbpunkt in der Modusfarbe */}
            <div
              className={clsx(
                'px-4 pt-3 pb-1.5 flex items-center gap-2 text-[11px] font-semibold text-(--text-tertiary) uppercase tracking-wider',
                mi > 0 && 'border-t border-(--border-light)'
              )}
            >
              <span className="w-2 h-2 rounded-full shrink-0" style={{ background: m.colors.gradient }} />
              {lang === 'en' && m.labelEn ? m.labelEn : m.label}
            </div>
            {/* Institute variants */}
            <div className="p-1.5">
              {sichtbareVarianten(m).map(variant => {
                const isActive = currentMode === m.id && currentInstitut === variant.institut;
                return (
                  <button
                    key={variant.institut}
                    onClick={() => onSelect(m.id, variant)}
                    className={clsx(
                      'w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors text-left',
                      isActive ? 'bg-(--mode-pastel) font-medium' : 'hover:bg-(--bg-inset)'
                    )}
                  >
                    <div className="w-7 h-7 rounded-md border border-(--border-light) bg-white flex items-center justify-center overflow-hidden shrink-0">
                      <LogoImg name={variant.institut} size={22} echt />
                    </div>
                    <div className="min-w-0">
                      <div className="text-(--text-primary) truncate">{variant.institut}</div>
                      <div className="text-xs text-(--text-tertiary)">{variant.beraterTitel}</div>
                    </div>
                    {isActive && (
                      <Check size={14} className="ml-auto shrink-0 text-(--mode-primary)" strokeWidth={2.5} />
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
