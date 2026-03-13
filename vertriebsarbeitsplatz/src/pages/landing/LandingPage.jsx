import { useState, useEffect, useRef } from 'react';
import { clsx } from 'clsx';
import { Mic, Send, LayoutDashboard, Users, Zap, BarChart3, FileCheck, ArrowLeftRight, Calculator, Shield, Briefcase, BookOpen, Landmark, Wallet, PieChart } from 'lucide-react';
import { useMode } from '../../hooks/useMode';
import { MODE_CONFIGS } from '../../data/modeConfig';

const MODULE_TABS = [
  { id: 'versicherung', label: 'Versicherung', icon: Shield, desc: 'Bestand, Neugeschäft, Storno', color: MODE_CONFIGS.versicherung.colors.primary },
  { id: 'banking', label: 'Banken', icon: Landmark, desc: 'Kredit, Einlagen, Erträge', color: MODE_CONFIGS.banking.colors.primary },
  { id: 'asset', label: 'Asset Manager', icon: PieChart, desc: 'Fonds & Anlageprodukte', color: '#4a5568' },
  { id: 'vermoegensverwaltung', label: 'Vermögensverwaltung', icon: Wallet, desc: 'AuM, Mandate, Pipeline', color: MODE_CONFIGS.vermoegensverwaltung.colors.primary },
];

const TILES = {
  versicherung: {
    main: [
      { id: 'gesamt', label: 'Gesamtübersicht', icon: LayoutDashboard, desc: 'KPIs, Bestand, Neugeschäft' },
      { id: 'agentur', label: 'Agenturansicht', icon: Users, desc: 'Kunden, Verträge, Details' },
      { id: 'potential', label: 'Potentialanalyse', icon: Zap, desc: 'Cross-Sell, Up-Sell, Whitespots' },
    ],
    ops: [
      { id: 'scoring', label: 'Vermittler-Scoring', icon: BarChart3 },
      { id: 'umstellung', label: 'Vertragsumstellung', icon: ArrowLeftRight },
      { id: 'bestand', label: 'Bestandsübertragung', icon: FileCheck },
      { id: 'abrechnung', label: 'Abrechnungsprüfung', icon: Calculator },
      { id: 'provision', label: 'Provisionsvalidierung', icon: Shield },
    ],
  },
  banking: {
    main: [
      { id: 'gesamt', label: 'Gesamtübersicht', icon: LayoutDashboard, desc: 'Kunden, Kredit, Einlagen' },
      { id: 'berater', label: 'Berateransicht', icon: Users, desc: 'Firmenkunden, Retail, Vermögen' },
      { id: 'potential', label: 'Potentialanalyse', icon: Zap, desc: 'R+V, Union Inv., Schw.Hall' },
    ],
    ops: [
      { id: 'scoring', label: 'Kreditscoring', icon: BarChart3 },
      { id: 'compliance', label: 'Compliance-Check', icon: Shield },
    ],
  },
  vermoegensverwaltung: {
    main: [
      { id: 'gesamt', label: 'Gesamtübersicht', icon: LayoutDashboard, desc: 'AuM, NNM, Performance' },
      { id: 'mandanten', label: 'Mandantenübersicht', icon: Users, desc: 'Mandate, Portfolios' },
      { id: 'pipeline', label: 'Pipeline', icon: Zap, desc: 'Akquise, Konsolidierung' },
    ],
    ops: [
      { id: 'reporting', label: 'Reporting', icon: BarChart3 },
      { id: 'compliance', label: 'Compliance', icon: Shield },
    ],
  },
  asset: {
    main: [
      { id: 'gesamt', label: 'Gesamtübersicht', icon: LayoutDashboard, desc: 'Fondsübersicht' },
    ],
    ops: [],
  },
};

export default function LandingPage() {
  const { switchMode, navigateTo, config, modeId } = useMode();
  const [activeModule, setActiveModule] = useState(modeId || 'versicherung');
  const [chatInput, setChatInput] = useState('');

  // Name prompt on first visit
  const [userName, setUserName] = useState(() => localStorage.getItem('kia_user_name') || '');
  const [showNamePrompt, setShowNamePrompt] = useState(!userName);
  const [nameInput, setNameInput] = useState('');
  const nameInputRef = useRef(null);

  useEffect(() => {
    if (showNamePrompt && nameInputRef.current) nameInputRef.current.focus();
  }, [showNamePrompt]);

  function handleNameSubmit(e) {
    e.preventDefault();
    const trimmed = nameInput.trim();
    if (!trimmed) return;
    localStorage.setItem('kia_user_name', trimmed);
    setUserName(trimmed);
    setShowNamePrompt(false);
  }

  const tiles = TILES[activeModule] || TILES.versicherung;

  function handleTileClick(tileId) {
    const targetMode = activeModule === 'asset' ? 'vermoegensverwaltung' : activeModule;
    switchMode(targetMode);
    if (tileId === 'gesamt') {
      // Navigate to VST-Cockpit (Gesamtübersicht)
      navigateTo('cockpit');
    }
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Name Prompt Overlay */}
      {showNamePrompt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm animate-fade-in">
          <form onSubmit={handleNameSubmit} className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md mx-4 animate-fade-in-up">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-xl bg-slate-800 flex items-center justify-center">
                <Briefcase size={22} className="text-white" strokeWidth={1.75} />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-slate-800">Willkommen!</h2>
                <p className="text-sm text-slate-500">KI-Vertriebsarbeitsplatz</p>
              </div>
            </div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Wie darf ich dich nennen?</label>
            <input
              ref={nameInputRef}
              type="text"
              value={nameInput}
              onChange={e => setNameInput(e.target.value)}
              placeholder="Dein Vorname..."
              className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-400 transition-shadow mb-4"
            />
            <button
              type="submit"
              disabled={!nameInput.trim()}
              className="w-full py-3 rounded-xl bg-slate-800 text-white text-sm font-semibold hover:bg-slate-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Los geht's
            </button>
          </form>
        </div>
      )}

      {/* Top Bar */}
      <div className="bg-white border-b border-slate-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center">
              <Briefcase size={16} className="text-white" strokeWidth={1.75} />
            </div>
            <span className="text-lg font-semibold text-slate-800">KI-Vertriebsarbeitsplatz</span>
          </div>
          <span className="text-xs text-slate-400 font-medium tracking-wider uppercase">Open Finance Suite</span>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Modul-Tabs */}
        <div className="grid grid-cols-4 gap-3 mb-8">
          {MODULE_TABS.map(tab => {
            const Icon = tab.icon;
            const isActive = activeModule === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveModule(tab.id)}
                className={clsx(
                  'flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all duration-200',
                  isActive
                    ? 'text-white shadow-md'
                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50 hover:-translate-y-px hover:shadow-sm'
                )}
                style={isActive ? { background: tab.color } : undefined}
              >
                <div className={clsx(
                  'w-9 h-9 rounded-lg flex items-center justify-center shrink-0',
                  isActive ? 'bg-white/20' : 'bg-slate-100'
                )}>
                  <Icon size={18} className={isActive ? 'text-white' : 'text-slate-500'} strokeWidth={1.75} />
                </div>
                <div className="min-w-0">
                  <div className={clsx('text-sm font-semibold truncate', isActive ? 'text-white' : 'text-slate-800')}>
                    {tab.label}
                  </div>
                  <div className={clsx('text-[11px] truncate', isActive ? 'text-white/70' : 'text-slate-400')}>
                    {tab.desc}
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Welcome + Chat */}
        <div className="mb-8">
          <div className="bg-white rounded-xl border border-slate-200 p-6 mb-4" style={{ boxShadow: 'var(--card-shadow)' }}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center">
                <BookOpen size={20} className="text-slate-600" strokeWidth={1.75} />
              </div>
              <p className="text-slate-700">
                Willkommen zurück <span className="font-semibold">{userName || config.beraterName}</span>, was kann ich für dich tun?
              </p>
            </div>
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              value={chatInput}
              onChange={e => setChatInput(e.target.value)}
              placeholder="Frag mich etwas..."
              className="flex-1 px-4 py-3 rounded-xl border border-slate-200 bg-white text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-300 transition-shadow"
            />
            <button className="p-3 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 transition-colors">
              <Mic size={18} className="text-slate-500" strokeWidth={1.75} />
            </button>
            <button className="p-3 rounded-xl bg-slate-800 hover:bg-slate-700 transition-colors">
              <Send size={18} className="text-white" strokeWidth={1.75} />
            </button>
          </div>
        </div>

        {/* Main Tiles */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {tiles.main.map((tile, i) => {
            const Icon = tile.icon;
            return (
              <button
                key={tile.id}
                onClick={() => handleTileClick(tile.id)}
                className="bg-white rounded-xl border border-slate-200 p-6 text-left hover:-translate-y-px hover:shadow-md transition-all duration-200 animate-fade-in-up"
                style={{ boxShadow: 'var(--card-shadow)', animationDelay: `${i * 50}ms` }}
              >
                <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center mb-3">
                  <Icon size={20} className="text-slate-600" strokeWidth={1.75} />
                </div>
                <div className="font-semibold text-slate-800 mb-1">{tile.label}</div>
                {tile.desc && <div className="text-xs text-slate-400">{tile.desc}</div>}
              </button>
            );
          })}
        </div>

        {/* Sales Ops */}
        {tiles.ops.length > 0 && (
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">Sales Operations</h3>
            <div className="grid grid-cols-5 gap-3">
              {tiles.ops.map((tile, i) => {
                const Icon = tile.icon;
                return (
                  <button
                    key={tile.id}
                    className="bg-white rounded-xl border border-slate-200 p-4 text-left hover:-translate-y-px hover:shadow-md transition-all duration-200 animate-fade-in-up"
                    style={{ boxShadow: 'var(--card-shadow)', animationDelay: `${(tiles.main.length + i) * 50}ms` }}
                  >
                    <Icon size={18} className="text-slate-500 mb-2" strokeWidth={1.75} />
                    <div className="text-sm font-medium text-slate-700">{tile.label}</div>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
