import { clsx } from 'clsx'
import { ArrowLeft, Home, FileJson, RefreshCw, User, Settings } from 'lucide-react'
import LogoImg from './LogoImg'

const TABS = [
  { id: 'dashboard', label: 'Dashboard' },
  { id: 'vorgaenge', label: 'Vorgänge', countKey: 'vorgaenge' },
  { id: 'makler', label: 'Makler', countKey: 'makler' },
  { id: 'emails', label: 'E-Mails', countKey: 'emails' },
  { id: 'ai-upload', label: 'KI Upload' },
  { id: 'architektur', label: 'Architektur' },
  { id: 'vorlagen', label: 'E-Mail Vorlagen' },
  { id: 'prozess', label: 'Prozess' },
  { id: 'projektplan', label: 'Projektplan' }
]

export default function Header({ activeView, onViewChange, counts = {}, onImport, onDemoDownload, onReset }) {
  return (
    <header className="transition-all duration-500" style={{ background: 'var(--mode-gradient)' }}>
      {/* Top Row */}
      <div className="px-6 pt-5 pb-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          {/* Home Button */}
          <button
            onClick={() => { window.location.href = '/' }}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-colors"
            title="Zurück zur Startseite"
          >
            <Home size={16} strokeWidth={1.75} />
            <span className="text-xs font-medium">Startseite</span>
          </button>

          {/* Institut Logo */}
          <div className="w-10 h-10 rounded-lg bg-white/20 border border-white/30 flex items-center justify-center overflow-hidden">
            <LogoImg name="ERGO" size={32} />
          </div>

          {/* App Info */}
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-white/20 border-2 border-white/50 flex items-center justify-center">
              <User size={24} className="text-white" strokeWidth={1.75} />
            </div>
            <div>
              <div className="text-white text-base font-medium">
                Bestandsübertragung
              </div>
              <div className="text-white/60 text-sm">
                Sales Operations | Portfolio Transfer Management
              </div>
            </div>
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2">
          <label className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-sm transition-colors cursor-pointer">
            <FileJson size={16} strokeWidth={1.75} /> JSON Import
            <input type="file" accept=".json" className="hidden" onChange={(e) => { if (e.target.files[0]) { onImport(e.target.files[0]); e.target.value = '' } }} />
          </label>
          <button onClick={onDemoDownload} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-sm transition-colors">
            <FileJson size={16} strokeWidth={1.75} /> Demo JSON
          </button>
          <button onClick={onReset} className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors" title="Daten zurücksetzen">
            <RefreshCw size={16} strokeWidth={1.75} />
          </button>
          <button className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors">
            <Settings size={16} strokeWidth={1.75} />
          </button>
        </div>
      </div>

      {/* Demo Notice */}
      <div className="px-6 flex justify-end -mt-1 pb-1">
        <span className="text-[11px] text-white/40 tracking-wide">Demo-Umgebung — Rein synthetische Daten</span>
      </div>

      {/* Tab Bar – inside header like Vertriebsarbeitsplatz */}
      <div className="px-6 flex gap-1 overflow-x-auto pb-0">
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => onViewChange(tab.id)}
            className={clsx(
              'px-4 py-2.5 text-base font-medium rounded-t-lg transition-all duration-200 whitespace-nowrap',
              activeView === tab.id
                ? 'bg-white text-slate-800'
                : 'text-white/70 hover:text-white hover:bg-white/10'
            )}
          >
            {tab.label}
            {tab.countKey && counts[tab.countKey] !== undefined && (
              <span className={clsx(
                'ml-1.5 inline-flex items-center justify-center w-5 h-5 text-[10px] font-bold rounded-full',
                activeView === tab.id
                  ? 'bg-red-500 text-white'
                  : 'bg-white/20 text-white'
              )}>
                {counts[tab.countKey]}
              </span>
            )}
          </button>
        ))}
      </div>
    </header>
  )
}
