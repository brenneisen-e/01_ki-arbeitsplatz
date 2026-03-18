import { useState, useEffect } from 'react';
import { clsx } from 'clsx';
import { ArrowLeft, Home, ChevronDown, Download, Settings, User, Calendar, AlertTriangle, Cloud, Sun, CloudRain, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { useMode } from '../../hooks/useMode';
import { MODE_CONFIGS } from '../../data/modeConfig';
import LogoImg from '../ui/LogoImg';
import { downloadDemoData } from '../../utils/downloadDemoData';
import useTranslation from '../../i18n/useTranslation';

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

export default function GlobalHeader({ kundeInfo, tabBadges }) {
  const { config, modeId, switchMode, switchInstitut, activeTab, setActiveTab, currentView, goBack } = useMode();
  const { t, lang } = useTranslation();
  const [showModeDropdown, setShowModeDropdown] = useState(false);
  const tabs = currentView === 'detail' ? config.detailTabs : config.tabs;
  const tagesItems = TAGESSTART_ITEMS[modeId] || TAGESSTART_ITEMS.versicherung;
  const weather = getWeatherData();
  const WeatherIcon = weather.icon;
  const isOverview = currentView !== 'detail';

  return (
    <header className="transition-all duration-500" style={{ background: config.colors.gradient }}>
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
          <button
            onClick={downloadDemoData}
            title={t('demodatenExportieren')}
            className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
          >
            <Download size={18} strokeWidth={1.75} />
          </button>
          <button className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors">
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
