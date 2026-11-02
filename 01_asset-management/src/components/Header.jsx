import { useState, useEffect } from 'react';
import { Activity, Clock, ArrowLeft, Home } from 'lucide-react';
import { PROFILE } from '../data';

function getBasePath() {
  const path = window.location.pathname;
  if (path.includes('/01_asset-management/')) {
    return path.substring(0, path.indexOf('/01_asset-management/')) + '/';
  }
  return '/';
}

const TABS = [
  { key: 'eventMonitor', label: 'Event Monitor' },
  { key: 'cashflows', label: 'Cashflows' },
  { key: 'sod', label: 'SOD' },
  { key: 'portfolios', label: 'Portfolios' },
];

export default function Header({ activeTab, onTabChange, onBack }) {
  const [clock, setClock] = useState('');

  useEffect(() => {
    const update = () => {
      const now = new Date();
      setClock(
        String(now.getHours()).padStart(2, '0') + ':' +
        String(now.getMinutes()).padStart(2, '0') + ':' +
        String(now.getSeconds()).padStart(2, '0')
      );
    };
    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <header className="transition-all duration-500" style={{ background: 'var(--am-gradient)' }}>
      {/* Top Row */}
      <div className="px-6 pt-5 pb-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => { window.location.href = getBasePath(); }}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-colors"
            title="Back to Home"
          >
            <Home size={16} strokeWidth={1.75} />
            <span className="text-xs font-medium">Home</span>
          </button>
          <button onClick={onBack} className="text-white/70 hover:text-white transition-colors p-1" title="Back to Welcome">
            <ArrowLeft size={20} strokeWidth={1.75} />
          </button>
          <div className="flex items-center gap-2">
            <Activity size={20} className="text-[#86BC25]" />
            <span className="text-[15px] font-semibold text-white">Active Equities</span>
          </div>
          <div className="flex items-center gap-1.5 text-[15px] font-semibold text-[#86BC25] tracking-wide">
            <div className="w-1.5 h-1.5 bg-[#86BC25] rounded-full" style={{ animation: 'liveDot 1.5s ease-in-out infinite' }} />
            LIVE
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-[15px] text-white/70 font-mono px-2.5 py-1 bg-white/[0.06] rounded-lg border border-white/[0.08]">
            <Clock size={14} className="opacity-60" />
            <span>{clock}</span>
          </div>
          <div className="flex items-center gap-2 text-[15px] text-white">
            <img src={PROFILE.photo} alt="" className="w-7 h-7 rounded-full object-cover border-[1.5px] border-white/30" />
            <span>{PROFILE.name}</span>
          </div>
        </div>
      </div>

      {/* Demo notice */}
      <div className="px-6 flex justify-end -mt-1 pb-1">
        <span className="text-[11px] text-white/40 tracking-wide">Demo — Synthetic data only</span>
      </div>

      {/* Tab Bar */}
      <div className="px-6 flex gap-1 overflow-x-auto pb-0">
        {TABS.map(tab => (
          <button
            key={tab.key}
            onClick={() => onTabChange(tab.key)}
            className={`px-4 py-2.5 text-sm font-medium rounded-t-lg transition-all duration-200 whitespace-nowrap
              ${activeTab === tab.key
                ? 'bg-white text-slate-800'
                : 'text-white/70 hover:text-white hover:bg-white/10'
              }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
    </header>
  );
}
