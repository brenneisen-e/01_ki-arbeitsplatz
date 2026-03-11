import { useState } from 'react';
import { clsx } from 'clsx';
import { ArrowLeft, ChevronDown, Settings, User } from 'lucide-react';
import { useMode } from '../../hooks/useMode';
import { MODE_CONFIGS } from '../../data/modeConfig';
import LogoImg from '../ui/LogoImg';

export default function GlobalHeader({ kundeInfo }) {
  const { config, modeId, switchMode, activeTab, setActiveTab, currentView, goBack } = useMode();
  const [showModeDropdown, setShowModeDropdown] = useState(false);
  const tabs = currentView === 'detail' ? config.detailTabs : config.tabs;

  return (
    <header className="transition-all duration-500" style={{ background: config.colors.gradient }}>
      {/* Top Row */}
      <div className="px-6 pt-5 pb-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          {currentView !== 'landing' && (
            <button onClick={goBack} className="text-white/70 hover:text-white transition-colors p-1">
              <ArrowLeft size={20} strokeWidth={1.75} />
            </button>
          )}
          <div className="w-10 h-10 rounded-lg bg-white/20 border border-white/30 flex items-center justify-center overflow-hidden">
            <LogoImg name={config.institut} size={32} />
          </div>
          <div className="flex items-center gap-3">
            {config.beraterFoto ? (
              <div className="w-10 h-10 rounded-full border-2 border-white/50 overflow-hidden">
                <img src={config.beraterFoto} alt={config.beraterName} className="w-full h-full object-cover" />
              </div>
            ) : (
              <div className="w-10 h-10 rounded-full bg-white/20 border-2 border-white/50 flex items-center justify-center">
                <User size={20} className="text-white" strokeWidth={1.75} />
              </div>
            )}
            <div>
              <div className="text-white text-sm font-medium">
                {config.beraterTitel}: {config.beraterName}
              </div>
              <div className="text-white/60 text-xs">
                {config.beraterId} | Aktiv
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <button
              onClick={() => setShowModeDropdown(!showModeDropdown)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-sm transition-colors"
            >
              {config.label} <ChevronDown size={16} />
            </button>
            {showModeDropdown && (
              <ModeDropdown
                currentMode={modeId}
                onSelect={(id) => { switchMode(id); setShowModeDropdown(false); }}
                onClose={() => setShowModeDropdown(false)}
              />
            )}
          </div>
          <button className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors">
            <Settings size={18} strokeWidth={1.75} />
          </button>
        </div>
      </div>

      {/* Kunden-Zeile (Detail-Ansicht) */}
      {kundeInfo && (
        <div className="px-6 pb-2">
          <div className="flex items-center gap-3 text-white/80 text-sm">
            <div className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center text-xs font-bold text-white">
              {kundeInfo.name.split(' ').map(n => n[0]).join('')}
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
            {tab.label}
          </button>
        ))}
      </div>
    </header>
  );
}

function ModeDropdown({ currentMode, onSelect, onClose }) {
  const modes = Object.values(MODE_CONFIGS);

  return (
    <>
      <div className="fixed inset-0 z-40" onClick={onClose} />
      <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-xl shadow-xl border border-slate-200 z-50 animate-scale-in overflow-hidden">
        <div className="p-2">
          {modes.map(m => (
            <button
              key={m.id}
              onClick={() => onSelect(m.id)}
              className={clsx(
                'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors text-left',
                currentMode === m.id ? 'bg-slate-100 font-medium' : 'hover:bg-slate-50'
              )}
            >
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold"
                style={{ background: m.colors.gradient }}
              >
                {m.institut.charAt(0)}
              </div>
              <div>
                <div className="text-slate-800">{m.label}</div>
                <div className="text-xs text-slate-400">{m.institut}</div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </>
  );
}
