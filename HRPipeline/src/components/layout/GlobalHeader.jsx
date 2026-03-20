import { Home, UserPlus, LayoutDashboard, Shield, ShieldCheck } from 'lucide-react';
import { clsx } from 'clsx';

function getBasePath() {
  const path = window.location.pathname;
  if (path.includes('/HRPipeline/')) {
    return path.substring(0, path.indexOf('/HRPipeline/')) + '/';
  }
  return '/';
}

export default function GlobalHeader({ currentMode, onModeChange }) {
  const modes = [
    { id: 'bewerber', label: 'Bewerber-Portal', icon: UserPlus },
    { id: 'arbeitgeber', label: 'Recruiting Dashboard', icon: LayoutDashboard },
    { id: 'cockpit', label: 'HR-Cockpit', icon: Shield },
  ];

  return (
    <header className="transition-all duration-500" style={{ background: 'linear-gradient(135deg, #5a1018 0%, #86181d 40%, #a02028 100%)' }}>
      {/* Top Row */}
      <div className="px-6 pt-5 pb-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => { window.location.href = getBasePath(); }}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-colors"
            title="Zurück zur Startseite"
          >
            <Home size={16} strokeWidth={1.75} />
            <span className="text-xs font-medium">Startseite</span>
          </button>
          <div className="w-10 h-10 rounded-lg bg-white/20 border border-white/30 flex items-center justify-center overflow-hidden">
            <span className="text-white font-bold text-sm">ERGO</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-white/20 border-2 border-white/50 flex items-center justify-center">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="24" height="24" className="text-white">
                <path d="M16 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="8.5" cy="7" r="4"/><line x1="20" y1="8" x2="20" y2="14"/><line x1="23" y1="11" x2="17" y2="11"/>
              </svg>
            </div>
            <div>
              <div className="text-white text-sm font-medium">HR Pipeline</div>
              <div className="text-white/60 text-xs">KI-gestütztes Recruiting & Bewerbermanagement</div>
            </div>
          </div>

          {/* Compliance Badges */}
          <div className="flex items-center gap-2 ml-4 pl-4 border-l border-white/20">
            <span className="flex items-center gap-1 text-emerald-300 text-xs bg-white/10 px-2.5 py-1 rounded-full">
              <ShieldCheck size={13} />
              EU AI Act
            </span>
            <span className="flex items-center gap-1 text-emerald-300 text-xs bg-white/10 px-2.5 py-1 rounded-full">
              <ShieldCheck size={13} />
              DSGVO
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-[11px] text-white/40 tracking-wide">Demo-Umgebung — Rein synthetische Daten</span>
        </div>
      </div>

      {/* Mode Tab-Leiste */}
      <div className="px-6 flex gap-1 overflow-x-auto pb-0">
        {modes.map(mode => {
          const Icon = mode.icon;
          return (
            <button
              key={mode.id}
              onClick={() => onModeChange(mode.id)}
              className={clsx(
                'flex items-center gap-2 px-5 py-2.5 text-sm font-medium rounded-t-lg transition-all duration-200 whitespace-nowrap',
                currentMode === mode.id
                  ? 'bg-white text-slate-800'
                  : 'text-white/70 hover:text-white hover:bg-white/10'
              )}
            >
              <Icon size={16} strokeWidth={1.75} />
              {mode.label}
            </button>
          );
        })}
      </div>
    </header>
  );
}
