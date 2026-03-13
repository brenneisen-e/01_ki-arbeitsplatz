import { useState, useEffect } from 'react';
import { clsx } from 'clsx';
import {
  ArrowLeft, ChevronDown, LayoutDashboard, List,
  TrendingUp, TrendingDown, Maximize2, X, Download, Calendar, BarChart3 as BarChartIcon, Activity,
} from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { useMode } from '../../hooks/useMode';
import GermanyMap from './GermanyMap';
import {
  KPI_DEFS, MONTHLY_DATA,
  BUNDESLAND_DATA, TOP_VERMITTLER, ABSCHLUESSE, fmtVal, fmtCur,
} from './cockpitData';

/* ── Filters ──────────────────────────────────── */
const YEARS = ['2025 YTD', '2024'];
const SILOS = ['Alle', 'Ausschließlichkeit', 'Makler', 'Direktvertrieb', 'Banken'];
const SEGMENTS = ['Alle', 'Leben', 'Kranken', 'Schaden', 'Kfz'];

/* ── Chart tooltip ────────────────────────────── */
function ChartTooltip({ active, payload, label }) {
  if (!active || !payload?.[0]) return null;
  return (
    <div className="bg-white px-3 py-2 rounded-lg shadow-lg border border-slate-200 text-sm z-50">
      <div className="font-medium text-slate-700">{label}</div>
      <div className="text-slate-500">{typeof payload[0].value === 'number' ? payload[0].value.toLocaleString('de-DE') : payload[0].value}</div>
    </div>
  );
}

/* ── KPI Card (matches legacy A-03 layout) ────── */
function KPICard({ kpi, data, onExpand }) {
  const [chartView, setChartView] = useState('month');

  const current = data[data.length - 1]?.[kpi.id] ?? 0;
  const prev = data[data.length - 2]?.[kpi.id] ?? 0;
  const trend = prev !== 0 ? ((current - prev) / Math.abs(prev)) * 100 : 0;
  const isGood = kpi.invertTrend ? trend <= 0 : trend >= 0;

  const isAvgKpi = ['storno', 'nps', 'risiko', 'combined', 'underwriting'].includes(kpi.id);
  const ytd = isAvgKpi
    ? data.reduce((s, m) => s + (m[kpi.id] || 0), 0) / (data.length || 1)
    : data.reduce((s, m) => s + (m[kpi.id] || 0), 0);

  const Icon = LucideIcons[kpi.icon] || LucideIcons.BarChart3;
  const chartColor = '#2563eb';

  const distData = [
    { name: '< 10k', value: 120 }, { name: '10-50k', value: 340 },
    { name: '50-100k', value: 280 }, { name: '100-250k', value: 180 },
    { name: '> 250k', value: 95 },
  ];

  return (
    <div
      className="bg-white rounded-2xl border border-slate-200 p-5 flex flex-col animate-fade-in-up group relative overflow-hidden hover:-translate-y-0.5 hover:shadow-lg transition-all duration-200"
      style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.1)', minHeight: 340 }}
    >
      <div className="absolute top-0 left-0 right-0 h-1 rounded-t-2xl opacity-0 group-hover:opacity-100 transition-opacity" style={{ background: 'linear-gradient(90deg, #86BC25, #2563eb)' }} />

      {/* Header */}
      <div className="flex items-start justify-between mb-1">
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-sm font-semibold text-slate-800">{kpi.title}</span>
          <Icon size={16} className="text-slate-400 shrink-0" strokeWidth={1.75} />
        </div>
        <span className="text-[11px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-medium whitespace-nowrap shrink-0">
          Aktueller Monat: {fmtVal(current, kpi.unit)}
        </span>
      </div>
      <div className="text-[11px] text-slate-400 mb-3">{kpi.desc}</div>

      {/* Value */}
      <div className="font-mono text-[2rem] font-extrabold leading-tight mb-1" style={{ color: chartColor }}>
        {fmtVal(ytd, kpi.unit)}
      </div>
      <div className="flex items-center justify-between mb-3">
        <div className={clsx('flex items-center gap-1 text-xs font-medium', isGood ? 'text-emerald-600' : 'text-red-500')}>
          {isGood ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
          <span>{Math.abs(trend).toFixed(1)}% vs. Vormonat</span>
        </div>
        <span className="text-[11px] text-slate-400">{isAvgKpi ? 'Durchschnitt YTD' : 'Summe YTD'}</span>
      </div>

      {/* View toggle */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex bg-slate-100 rounded-md p-0.5">
          {[
            { id: 'month', icon: Calendar, title: 'Monatsansicht' },
            { id: 'distribution', icon: BarChartIcon, title: 'Verteilung' },
            { id: 'daily', icon: Activity, title: 'Tagesverlauf' },
          ].map(v => (
            <button
              key={v.id}
              onClick={() => setChartView(v.id)}
              className={clsx('p-1.5 rounded transition-all', chartView === v.id ? 'bg-white shadow-sm text-blue-600' : 'text-slate-400 hover:text-slate-600')}
              title={v.title}
            >
              <v.icon size={13} />
            </button>
          ))}
        </div>
        <button
          onClick={() => onExpand(kpi)}
          className="opacity-0 group-hover:opacity-100 p-1.5 rounded hover:bg-slate-100 transition-all text-slate-400 hover:text-slate-600"
          title="Vollbildansicht"
        >
          <Maximize2 size={14} />
        </button>
      </div>

      {/* Chart */}
      <div className="flex-1 min-h-[130px] relative">
        <ResponsiveContainer width="100%" height="100%">
          {chartView === 'distribution' ? (
            <BarChart data={distData} margin={{ top: 5, right: 5, bottom: 5, left: 5 }}>
              <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} width={30} />
              <Tooltip content={<ChartTooltip />} />
              <Bar dataKey="value" fill={chartColor} radius={[4, 4, 0, 0]} barSize={24} animationDuration={600} />
            </BarChart>
          ) : (
            <AreaChart data={data} margin={{ top: 5, right: 5, bottom: 5, left: 5 }}>
              <defs>
                <linearGradient id={`grad-${kpi.id}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={chartColor} stopOpacity={0.12} />
                  <stop offset="95%" stopColor={chartColor} stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} width={40} />
              <Tooltip content={<ChartTooltip />} />
              <Area
                type="monotone" dataKey={kpi.id} stroke={chartColor} strokeWidth={2}
                fill={`url(#grad-${kpi.id})`}
                dot={{ r: 3, fill: chartColor, stroke: '#fff', strokeWidth: 1.5 }}
                activeDot={{ r: 5, fill: chartColor, stroke: '#fff', strokeWidth: 2 }}
                animationDuration={800} animationEasing="ease-out"
              />
            </AreaChart>
          )}
        </ResponsiveContainer>
      </div>
    </div>
  );
}

/* ── Fullscreen Modal ─────────────────────────── */
function FullscreenModal({ kpi, data, onClose }) {
  const [chartView, setChartView] = useState('month');
  if (!kpi) return null;
  const Icon = LucideIcons[kpi.icon] || LucideIcons.BarChart3;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center" onClick={onClose}>
      <div className="bg-white rounded-2xl w-[90vw] max-w-5xl max-h-[85vh] overflow-hidden animate-fade-in-up" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <Icon size={20} className="text-blue-600" strokeWidth={1.75} />
            <div>
              <h2 className="text-lg font-semibold text-slate-800">{kpi.title}</h2>
              <p className="text-xs text-slate-400">{kpi.desc}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex gap-1 bg-slate-100 rounded-lg p-0.5">
              {[['month', 'Monat'], ['bar', 'Verteilung'], ['daily', 'Tagesverlauf']].map(([v, l]) => (
                <button key={v} onClick={() => setChartView(v)}
                  className={clsx('px-3 py-1.5 rounded-md text-xs font-medium transition-colors', chartView === v ? 'bg-white shadow-sm text-blue-600' : 'text-slate-500 hover:text-slate-700')}>
                  {l}
                </button>
              ))}
            </div>
            <button onClick={onClose} className="p-2 rounded-lg hover:bg-slate-100 transition-colors">
              <X size={18} className="text-slate-500" />
            </button>
          </div>
        </div>
        <div className="p-6 h-[60vh]">
          <ResponsiveContainer width="100%" height="100%">
            {chartView === 'bar' ? (
              <BarChart data={data} margin={{ top: 10, right: 20, bottom: 10, left: 20 }}>
                <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <Tooltip content={<ChartTooltip />} />
                <Bar dataKey={kpi.id} fill="#2563eb" radius={[6, 6, 0, 0]} barSize={40} animationDuration={600} />
              </BarChart>
            ) : (
              <AreaChart data={data} margin={{ top: 10, right: 20, bottom: 10, left: 20 }}>
                <defs>
                  <linearGradient id="fs-grad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <Tooltip content={<ChartTooltip />} />
                <Area type="monotone" dataKey={kpi.id} stroke="#2563eb" strokeWidth={2.5} fill="url(#fs-grad)"
                  dot={{ r: 4, fill: '#2563eb', stroke: '#fff', strokeWidth: 2 }}
                  activeDot={{ r: 6, fill: '#2563eb', stroke: '#fff', strokeWidth: 2 }}
                  animationDuration={600} />
              </AreaChart>
            )}
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════
   CockpitPage - mirrors legacy A-03 Gesamtübersicht
   Layout: flex with kpi-grid (flex:1) + map-sidebar (380px)
   ══════════════════════════════════════════════════ */
export default function CockpitPage() {
  const { goBack } = useMode();
  const [view, setView] = useState('dashboard');
  const [year, setYear] = useState('2025 YTD');
  const [silo, setSilo] = useState('Alle');
  const [segment, setSegment] = useState('Alle');
  const [expandedKpi, setExpandedKpi] = useState(null);
  const [tableView, setTableView] = useState('bundeslaender');
  const [showReport, setShowReport] = useState(false);
  const [selectedStates, setSelectedStates] = useState(new Set());

  // Listen for cockpit-navigate events from VertriebsAssistent
  useEffect(() => {
    function onCockpitNavigate(e) {
      const { view: targetView, tableView: targetTableView } = e.detail;
      if (targetView) setView(targetView);
      if (targetTableView) setTableView(targetTableView);
    }
    window.addEventListener('cockpit-navigate', onCockpitNavigate);
    return () => window.removeEventListener('cockpit-navigate', onCockpitNavigate);
  }, []);

  function toggleState(name) {
    setSelectedStates(prev => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name); else next.add(name);
      return next;
    });
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-slate-800 text-white">
        <div className="px-5 pt-3 pb-2 flex items-center justify-between max-w-[1920px] mx-auto">
          <div className="flex items-center gap-3">
            <button onClick={goBack} className="text-white/70 hover:text-white transition-colors p-1">
              <ArrowLeft size={18} strokeWidth={1.75} />
            </button>
            <div className="flex bg-white/10 rounded-lg p-0.5">
              <button onClick={() => setView('dashboard')}
                className={clsx('flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors',
                  view === 'dashboard' ? 'bg-white text-slate-800' : 'text-white/70 hover:text-white')}>
                <LayoutDashboard size={15} /> Dashboard
              </button>
              <button onClick={() => setView('table')}
                className={clsx('flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors',
                  view === 'table' ? 'bg-white text-slate-800' : 'text-white/70 hover:text-white')}>
                <List size={15} /> Tabelle
              </button>
            </div>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <span className="text-white/40 text-xs">Jahr:</span>
            <select value={year} onChange={e => setYear(e.target.value)} className="bg-white/10 text-white border-0 rounded-md px-2 py-1 text-sm cursor-pointer">
              {YEARS.map(y => <option key={y} value={y} className="text-slate-800">{y}</option>)}
            </select>
            <span className="text-white/40 text-xs">Vertriebsweg:</span>
            <select value={silo} onChange={e => setSilo(e.target.value)} className="bg-white/10 text-white border-0 rounded-md px-2 py-1 text-sm cursor-pointer">
              {SILOS.map(s => <option key={s} value={s} className="text-slate-800">{s}</option>)}
            </select>
            <span className="text-white/40 text-xs">Segment:</span>
            <select value={segment} onChange={e => setSegment(e.target.value)} className="bg-white/10 text-white border-0 rounded-md px-2 py-1 text-sm cursor-pointer">
              {SEGMENTS.map(s => <option key={s} value={s} className="text-slate-800">{s}</option>)}
            </select>
          </div>
        </div>
      </header>

      {/* Dashboard View */}
      {view === 'dashboard' && (
        <div className="max-w-[1920px] mx-auto p-5">
          {/* Main: KPI grid + Map sidebar */}
          <div className="flex gap-5 items-stretch">
            <div className="flex-1 min-w-0">
              <div className="grid gap-5" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))' }}>
                {KPI_DEFS.map(kpi => (
                  <KPICard key={kpi.id} kpi={kpi} data={MONTHLY_DATA} onExpand={setExpandedKpi} />
                ))}
              </div>
            </div>
            <div className="w-[380px] shrink-0 bg-white rounded-2xl border border-slate-200 p-5 flex flex-col" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
              <h3 className="text-sm font-semibold text-slate-800 mb-3">Deutschlandkarte</h3>
              <GermanyMap selectedStates={selectedStates} onToggleState={toggleState} />
            </div>
          </div>

          {/* Vertriebsbericht */}
          <div className="mt-5">
            <button onClick={() => setShowReport(!showReport)}
              className="flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-800 transition-colors mb-3">
              <ChevronDown size={16} className={clsx('transition-transform', showReport && 'rotate-180')} />
              Vertriebsbericht {showReport ? 'ausblenden' : 'anzeigen'}
            </button>
            {showReport && (
              <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden animate-fade-in-up" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
                  <h3 className="font-semibold text-slate-800">Vertriebsbericht – Aktuelle Abschlüsse</h3>
                  <div className="flex items-center gap-4">
                    <div className="flex gap-6 text-sm">
                      <div><span className="text-slate-400">Abschlüsse:</span> <span className="font-semibold text-slate-800">{ABSCHLUESSE.length}</span></div>
                      <div><span className="text-slate-400">Σ Provision:</span> <span className="font-semibold text-emerald-600">{ABSCHLUESSE.reduce((s, a) => s + a.provision, 0).toLocaleString('de-DE')}€</span></div>
                    </div>
                    <button className="text-xs text-slate-400 hover:text-slate-600 flex items-center gap-1"><Download size={13} /> CSV</button>
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-slate-100 text-left bg-slate-50/50">
                        {['Datum', 'Versicherungsnehmer', 'Produkt', 'Tarif', 'Antragsnr.'].map(h => (
                          <th key={h} className="px-5 py-2.5 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">{h}</th>
                        ))}
                        {['Beitrag', 'Faktor', 'Provision'].map(h => (
                          <th key={h} className="px-5 py-2.5 text-[11px] font-semibold text-slate-500 uppercase tracking-wider text-right">{h}</th>
                        ))}
                        <th className="px-5 py-2.5 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {ABSCHLUESSE.map((a, i) => (
                        <tr key={i} className="border-b border-slate-50 hover:bg-blue-50/30 transition-colors">
                          <td className="px-5 py-2.5 text-slate-500">{a.datum}</td>
                          <td className="px-5 py-2.5 font-medium text-slate-700">{a.vn}</td>
                          <td className="px-5 py-2.5 text-slate-600">{a.produkt}</td>
                          <td className="px-5 py-2.5 text-slate-500">{a.tarif}</td>
                          <td className="px-5 py-2.5 font-mono text-[11px] text-slate-400">{a.antragNr}</td>
                          <td className="px-5 py-2.5 text-right font-mono text-slate-700">{a.beitrag.toLocaleString('de-DE')}€</td>
                          <td className="px-5 py-2.5 text-right font-mono text-slate-500">{a.faktor.toFixed(1)}</td>
                          <td className="px-5 py-2.5 text-right font-mono font-medium text-emerald-600">{a.provision.toLocaleString('de-DE')}€</td>
                          <td className="px-5 py-2.5">
                            <span className={clsx('text-[11px] px-2 py-0.5 rounded-full font-medium',
                              a.status === 'policiert' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
                            )}>{a.status}</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Table View */}
      {view === 'table' && (
        <div className="max-w-[1920px] mx-auto p-5 animate-fade-in-up">
          <div className="flex gap-2 mb-4">
            {[['bundeslaender', 'Bundesländer'], ['landkreise', 'Landkreise'], ['agenturen', 'Agenturen']].map(([id, label]) => (
              <button key={id} onClick={() => setTableView(id)}
                className={clsx('px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                  tableView === id ? 'bg-slate-800 text-white' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50')}>
                {label}
              </button>
            ))}
          </div>

          {tableView === 'bundeslaender' && (
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 text-left">
                    {['#', 'Bundesland'].map(h => <th key={h} className="px-5 py-3 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">{h}</th>)}
                    {['Neugeschäft', 'Bestand', 'Stornoquote', 'Vermittler', 'Faktor'].map(h => <th key={h} className="px-5 py-3 text-[11px] font-semibold text-slate-500 uppercase tracking-wider text-right">{h}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {BUNDESLAND_DATA.map((bl, i) => (
                    <tr key={bl.name} className="border-b border-slate-50 hover:bg-blue-50/30 transition-colors">
                      <td className="px-5 py-2.5 text-slate-400 text-xs">{i + 1}</td>
                      <td className="px-5 py-2.5 font-medium text-slate-700">{bl.name}</td>
                      <td className="px-5 py-2.5 text-right font-mono text-slate-700">{fmtCur(bl.neugeschaeft)}</td>
                      <td className="px-5 py-2.5 text-right font-mono text-slate-700">{fmtCur(bl.bestand)}</td>
                      <td className="px-5 py-2.5 text-right font-mono"><span className={bl.storno > 5.0 ? 'text-red-500' : 'text-emerald-600'}>{bl.storno.toFixed(1)}%</span></td>
                      <td className="px-5 py-2.5 text-right font-mono text-slate-600">{bl.vermittler}</td>
                      <td className="px-5 py-2.5 text-right font-mono text-slate-500">{bl.factor.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {tableView === 'landkreise' && (
            <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
              <p className="text-slate-400 text-sm">Landkreis-Daten werden bei Auswahl auf der Karte geladen.</p>
            </div>
          )}

          {tableView === 'agenturen' && (
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 text-left">
                    {['#', 'Vermittler', 'Region'].map(h => <th key={h} className="px-5 py-3 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">{h}</th>)}
                    {['Neugeschäft', 'Bestand', 'Stornoquote', 'NPS', 'Abschlüsse'].map(h => <th key={h} className="px-5 py-3 text-[11px] font-semibold text-slate-500 uppercase tracking-wider text-right">{h}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {TOP_VERMITTLER.map((vm, i) => (
                    <tr key={vm.id} className="border-b border-slate-50 hover:bg-blue-50/30 transition-colors">
                      <td className="px-5 py-2.5 text-slate-400 text-xs">{i + 1}</td>
                      <td className="px-5 py-2.5"><div className="font-medium text-slate-700">{vm.name}</div><div className="text-[11px] text-slate-400">{vm.id}</div></td>
                      <td className="px-5 py-2.5 text-slate-600">{vm.region}</td>
                      <td className="px-5 py-2.5 text-right font-mono text-slate-700">{fmtCur(vm.neugeschaeft)}</td>
                      <td className="px-5 py-2.5 text-right font-mono text-slate-700">{fmtCur(vm.bestand)}</td>
                      <td className="px-5 py-2.5 text-right font-mono"><span className={vm.storno > 4.5 ? 'text-red-500' : 'text-emerald-600'}>{vm.storno.toFixed(1)}%</span></td>
                      <td className="px-5 py-2.5 text-right font-mono text-slate-600">{vm.nps}</td>
                      <td className="px-5 py-2.5 text-right font-mono font-medium text-slate-700">{vm.abschluesse}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {expandedKpi && <FullscreenModal kpi={expandedKpi} data={MONTHLY_DATA} onClose={() => setExpandedKpi(null)} />}
    </div>
  );
}
