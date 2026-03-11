import { useState } from 'react';
import { clsx } from 'clsx';
import { Mic, Send, LayoutDashboard, Users, Zap, BarChart3, FileCheck, ArrowLeftRight, Calculator, Shield, Briefcase, BookOpen } from 'lucide-react';
import { useMode } from '../../hooks/useMode';
import { MODE_CONFIGS } from '../../data/modeConfig';

const MODULE_TABS = [
  { id: 'versicherung', label: 'Versicherung' },
  { id: 'banking', label: 'Banken' },
  { id: 'asset', label: 'Asset Manager' },
  { id: 'vermoegensverwaltung', label: 'Vermoegensverwaltung' },
];

const TILES = {
  versicherung: {
    main: [
      { id: 'gesamt', label: 'Gesamtuebersicht', icon: LayoutDashboard, desc: 'KPIs, Bestand, Neugeschaeft' },
      { id: 'agentur', label: 'Agenturansicht', icon: Users, desc: 'Kunden, Vertraege, Details' },
      { id: 'potential', label: 'Potentialanalyse', icon: Zap, desc: 'Cross-Sell, Up-Sell, Whitespots' },
    ],
    ops: [
      { id: 'scoring', label: 'Vermittler-Scoring', icon: BarChart3 },
      { id: 'umstellung', label: 'Vertragsumstellung', icon: ArrowLeftRight },
      { id: 'bestand', label: 'Bestandsuebertragung', icon: FileCheck },
      { id: 'abrechnung', label: 'Abrechnungspruefung', icon: Calculator },
      { id: 'provision', label: 'Provisionsvalidierung', icon: Shield },
    ],
  },
  banking: {
    main: [
      { id: 'gesamt', label: 'Gesamtuebersicht', icon: LayoutDashboard, desc: 'Kunden, Kredit, Einlagen' },
      { id: 'berater', label: 'Berateransicht', icon: Users, desc: 'Firmenkunden, Retail, Vermoegen' },
      { id: 'potential', label: 'Potentialanalyse', icon: Zap, desc: 'R+V, Union Inv., Schw.Hall' },
    ],
    ops: [
      { id: 'scoring', label: 'Kreditscoring', icon: BarChart3 },
      { id: 'compliance', label: 'Compliance-Check', icon: Shield },
    ],
  },
  vermoegensverwaltung: {
    main: [
      { id: 'gesamt', label: 'Gesamtuebersicht', icon: LayoutDashboard, desc: 'AuM, NNM, Performance' },
      { id: 'mandanten', label: 'Mandantenuebersicht', icon: Users, desc: 'Mandate, Portfolios' },
      { id: 'pipeline', label: 'Pipeline', icon: Zap, desc: 'Akquise, Konsolidierung' },
    ],
    ops: [
      { id: 'reporting', label: 'Reporting', icon: BarChart3 },
      { id: 'compliance', label: 'Compliance', icon: Shield },
    ],
  },
  asset: {
    main: [
      { id: 'gesamt', label: 'Gesamtuebersicht', icon: LayoutDashboard, desc: 'Fondsuebersicht' },
    ],
    ops: [],
  },
};

export default function LandingPage() {
  const { switchMode, config } = useMode();
  const [activeModule, setActiveModule] = useState('versicherung');
  const [chatInput, setChatInput] = useState('');

  const tiles = TILES[activeModule] || TILES.versicherung;

  function handleTileClick(tileId) {
    const targetMode = activeModule === 'asset' ? 'vermoegensverwaltung' : activeModule;
    switchMode(targetMode);
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Top Bar */}
      <div className="bg-white border-b border-slate-200 px-10 py-4">
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

      <div className="max-w-6xl mx-auto px-10 py-8">
        {/* Modul-Tabs */}
        <div className="flex gap-2 mb-8">
          {MODULE_TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveModule(tab.id)}
              className={clsx(
                'px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200',
                activeModule === tab.id
                  ? 'bg-slate-800 text-white'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Welcome + Chat */}
        <div className="mb-8">
          <div className="bg-white rounded-xl border border-slate-200 p-6 mb-4" style={{ boxShadow: 'var(--card-shadow)' }}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center">
                <BookOpen size={20} className="text-slate-600" strokeWidth={1.75} />
              </div>
              <p className="text-slate-700">
                Willkommen zurueck <span className="font-semibold">{config.beraterName}</span>, was kann ich fuer dich tun?
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
