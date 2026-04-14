import { useState, useCallback } from 'react';
import { clsx } from 'clsx';
import { Home, User, Building2, FileText, AlertTriangle, Clock, Settings } from 'lucide-react';
import ReklamationFormView from './views/ReklamationFormView';
import BackofficeView from './views/BackofficeView';

function getBasePath() {
  const path = window.location.pathname;
  if (path.includes('/provisionsreklamation/')) {
    return path.substring(0, path.indexOf('/provisionsreklamation/')) + '/';
  }
  return '/';
}

const TABS = [
  { id: 'formular', label: 'Reklamation einreichen', icon: User },
  { id: 'backoffice', label: 'Backoffice', icon: Building2 },
];

const HEADER_STATS = [
  { icon: FileText, text: '12 Offene Vorgänge' },
  { icon: AlertTriangle, text: '2 Auffälligkeiten', className: 'text-amber-300' },
  { icon: Clock, text: 'Ø 4,2 Tage Bearbeitung' },
];

export default function ProvisionsreklamationModule() {
  const [activeTab, setActiveTab] = useState('formular');
  const [vorgaenge, setVorgaenge] = useState([]);

  const addVorgang = useCallback((vorgang) => {
    setVorgaenge(prev => [vorgang, ...prev]);
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-[var(--bg-primary)]">
      {/* Header — orientiert am GlobalHeader des Vertriebsarbeitsplatzes */}
      <header className="transition-all duration-500" style={{ background: 'var(--mode-gradient)' }}>
        {/* Top Row */}
        <div className="px-6 pt-5 pb-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => { window.location.href = getBasePath(); }}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-colors"
              title="Zurück zur Startseite"
            >
              <Home size={16} strokeWidth={1.75} />
              <span className="text-xs font-medium hidden sm:inline">Startseite</span>
            </button>

            <div className="w-10 h-10 rounded-lg bg-white/20 border border-white/30 flex items-center justify-center">
              <FileText size={22} className="text-white" strokeWidth={1.75} />
            </div>

            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full border-2 border-white/50 overflow-hidden bg-white/20">
                <img
                  src="./images/lisa-neumann.png"
                  alt="Lisa Neumann"
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <div className="text-white text-sm font-medium">
                  Sachbearbeiterin: Lisa Neumann
                </div>
                <div className="text-white/60 text-xs">
                  Abt. Provisionsservice | Aktiv
                </div>
              </div>
            </div>

            {/* Header Stats — nur im Backoffice-Tab */}
            {activeTab === 'backoffice' && (
              <div className="flex items-center gap-3 ml-4 pl-4 border-l border-white/20">
                {HEADER_STATS.map((item, i) => {
                  const Icon = item.icon;
                  return (
                    <span key={i} className="flex items-center gap-1 text-white/80 text-xs">
                      <Icon size={13} className={item.className || 'text-white/60'} />
                      {item.text}
                    </span>
                  );
                })}
              </div>
            )}
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/10 text-white text-xs">
              <FileText size={16} className="text-white/80" />
              <span className="font-medium">Provisionsreklamation</span>
            </div>
            <button className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors">
              <Settings size={18} strokeWidth={1.75} />
            </button>
          </div>
        </div>

        {/* Demo-Hinweis */}
        <div className="px-6 flex justify-end -mt-1 pb-1">
          <span className="text-[11px] text-white/40 tracking-wide">
            Demo-Umgebung — Rein synthetische Daten, keine echten Kundendaten
          </span>
        </div>

        {/* Tab-Leiste */}
        <div className="px-6 flex gap-1 overflow-x-auto pb-0">
          {TABS.map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={clsx(
                  'px-4 py-2.5 text-sm font-medium rounded-t-lg transition-all duration-200 whitespace-nowrap flex items-center gap-2',
                  activeTab === tab.id
                    ? 'bg-white text-slate-800'
                    : 'text-white/70 hover:text-white hover:bg-white/10'
                )}
              >
                <Icon size={16} strokeWidth={1.75} />
                {tab.label}
              </button>
            );
          })}
        </div>
      </header>

      {/* Content */}
      <main className="flex-1">
        {activeTab === 'formular' && (
          <ReklamationFormView onSubmit={addVorgang} />
        )}
        {activeTab === 'backoffice' && (
          <BackofficeView zusaetzlicheVorgaenge={vorgaenge} />
        )}
      </main>

      {/* Datenschutz-Footer */}
      <footer className="px-6 py-4 text-center">
        <p className="text-xs text-slate-400">
          Demo-Modus. Alle dargestellten Personen, Verträge und Provisionen sind fiktiv.
          In einer produktiven Umgebung gelten die Anforderungen der DSGVO (Art. 6 Abs. 1 lit. b/f),
          des GDV-Datenschutzkodex sowie eine Aufbewahrungspflicht von 6–10 Jahren gem. HGB/AO.
        </p>
      </footer>
    </div>
  );
}
