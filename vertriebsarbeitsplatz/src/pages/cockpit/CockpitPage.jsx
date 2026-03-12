import { useState, useEffect } from 'react';
import { clsx } from 'clsx';
import {
  ArrowLeft, ChevronDown, LayoutDashboard, List, Filter,
  TrendingUp, TrendingDown, Maximize2, X, Download,
  MapPin, Settings,
} from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { useMode } from '../../hooks/useMode';
import {
  KPI_DEFS, MONTHLY_DATA, SEGMENT_VERTEILUNG, VERTRIEBSWEG_VERTEILUNG,
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

/* ── KPI Sparkline Card ───────────────────────── */
function KPICard({ kpi, data, onExpand }) {
  const current = data[data.length - 1]?.[kpi.id] ?? 0;
  const prev = data[data.length - 2]?.[kpi.id] ?? 0;
  const trend = prev !== 0 ? ((current - prev) / Math.abs(prev)) * 100 : 0;
  const isGood = kpi.invertTrend ? trend <= 0 : trend >= 0;

  // YTD aggregate
  const isAvgKpi = ['storno', 'nps', 'risiko', 'combined', 'underwriting'].includes(kpi.id);
  const ytd = isAvgKpi
    ? data.reduce((s, m) => s + (m[kpi.id] || 0), 0) / (data.length || 1)
    : data.reduce((s, m) => s + (m[kpi.id] || 0), 0);

  const Icon = LucideIcons[kpi.icon] || LucideIcons.BarChart3;

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4 animate-fade-in-up group" style={{ boxShadow: 'var(--card-shadow)' }}>
      {/* Header */}
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center">
            <Icon size={15} className="text-slate-500" strokeWidth={1.75} />
          </div>
          <span className="text-xs font-semibold text-slate-700">{kpi.title}</span>
        </div>
        <button
          onClick={() => onExpand(kpi)}
          className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-slate-100 transition-all"
          title="Vollbild"
        >
          <Maximize2 size={13} className="text-slate-400" />
        </button>
      </div>
      <div className="text-[10px] text-slate-400 mb-2">{kpi.desc}</div>

      {/* Value + Trend */}
      <div className="flex items-end justify-between mb-2">
        <div className="font-mono text-xl font-bold text-slate-900">{fmtVal(ytd, kpi.unit)}</div>
        <div className={clsx('flex items-center gap-0.5 text-xs font-medium', isGood ? 'text-emerald-600' : 'text-red-500')}>
          {isGood ? <TrendingUp size={13} /> : <TrendingDown size={13} />}
          {Math.abs(trend).toFixed(1)}%
        </div>
      </div>
      <div className="flex items-center justify-between text-[10px] text-slate-400 mb-2">
        <span>Aktuell: {fmtVal(current, kpi.unit)}</span>
        <span>{isAvgKpi ? 'Ø YTD' : 'Summe YTD'}</span>
      </div>

      {/* Sparkline */}
      <div className="h-16 -mx-1">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 2, right: 2, bottom: 2, left: 2 }}>
            <defs>
              <linearGradient id={`g-${kpi.id}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={isGood ? '#10b981' : '#ef4444'} stopOpacity={0.15} />
                <stop offset="95%" stopColor={isGood ? '#10b981' : '#ef4444'} stopOpacity={0} />
              </linearGradient>
            </defs>
            <Tooltip content={<ChartTooltip />} />
            <Area
              type="monotone" dataKey={kpi.id} stroke={isGood ? '#10b981' : '#ef4444'}
              strokeWidth={2} fill={`url(#g-${kpi.id})`} dot={false}
              activeDot={{ r: 3, fill: isGood ? '#10b981' : '#ef4444', stroke: '#fff', strokeWidth: 1.5 }}
            />
          </AreaChart>
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
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center animate-fade-in-up" onClick={onClose}>
      <div className="bg-white rounded-2xl w-[90vw] max-w-5xl max-h-[85vh] overflow-hidden" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center">
              <Icon size={18} className="text-slate-600" strokeWidth={1.75} />
            </div>
            <div>
              <h2 className="font-semibold text-slate-800">{kpi.title}</h2>
              <p className="text-xs text-slate-400">{kpi.desc}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex gap-1 text-xs">
              {[['month', 'Monat'], ['bar', 'Verteilung'], ['daily', 'Tagesverlauf']].map(([v, l]) => (
                <button
                  key={v}
                  onClick={() => setChartView(v)}
                  className={clsx('px-3 py-1.5 rounded-lg transition-colors', chartView === v ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-500 hover:bg-slate-200')}
                >
                  {l}
                </button>
              ))}
            </div>
            <button onClick={onClose} className="p-2 rounded-lg hover:bg-slate-100 transition-colors ml-2">
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
                <Bar dataKey={kpi.id} fill="#3b82f6" radius={[6, 6, 0, 0]} barSize={40} animationDuration={600} />
              </BarChart>
            ) : (
              <AreaChart data={data} margin={{ top: 10, right: 20, bottom: 10, left: 20 }}>
                <defs>
                  <linearGradient id="fullscreen-grad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <Tooltip content={<ChartTooltip />} />
                <Area type="monotone" dataKey={kpi.id} stroke="#3b82f6" strokeWidth={2.5} fill="url(#fullscreen-grad)"
                  dot={{ r: 4, fill: '#3b82f6', stroke: '#fff', strokeWidth: 2 }}
                  activeDot={{ r: 6, fill: '#3b82f6', stroke: '#fff', strokeWidth: 2 }}
                  animationDuration={600}
                />
              </AreaChart>
            )}
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

/* ── Main CockpitPage ─────────────────────────── */
export default function CockpitPage() {
  const { goBack } = useMode();
  const [view, setView] = useState('dashboard'); // dashboard | table
  const [year, setYear] = useState('2025 YTD');
  const [silo, setSilo] = useState('Alle');
  const [segment, setSegment] = useState('Alle');
  const [expandedKpi, setExpandedKpi] = useState(null);
  const [tableView, setTableView] = useState('bundeslaender'); // bundeslaender | agenturen
  const [showReport, setShowReport] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50">
      {/* ── Header ────────────────────────────── */}
      <header className="bg-slate-800 text-white">
        <div className="px-6 pt-4 pb-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={goBack} className="text-white/70 hover:text-white transition-colors p-1" title="Zurück zur Startseite">
              <ArrowLeft size={20} strokeWidth={1.75} />
            </button>
            <div className="flex items-center gap-2">
              <LayoutDashboard size={20} className="text-white/80" />
              <h1 className="text-lg font-semibold">VST-Cockpit · Gesamtübersicht</h1>
            </div>
          </div>

          {/* View toggle */}
          <div className="flex items-center gap-3">
            <div className="flex gap-1 bg-white/10 rounded-lg p-0.5">
              <button
                onClick={() => setView('dashboard')}
                className={clsx('flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors',
                  view === 'dashboard' ? 'bg-white text-slate-800' : 'text-white/70 hover:text-white')}
              >
                <LayoutDashboard size={15} /> Dashboard
              </button>
              <button
                onClick={() => setView('table')}
                className={clsx('flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors',
                  view === 'table' ? 'bg-white text-slate-800' : 'text-white/70 hover:text-white')}
              >
                <List size={15} /> Tabelle
              </button>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="px-6 pb-3 flex items-center gap-4 text-sm">
          <div className="flex items-center gap-1.5">
            <Filter size={14} className="text-white/50" />
            <span className="text-white/50">Filter:</span>
          </div>
          <select value={year} onChange={e => setYear(e.target.value)} className="bg-white/10 text-white border-0 rounded-md px-2 py-1 text-sm">
            {YEARS.map(y => <option key={y} value={y} className="text-slate-800">{y}</option>)}
          </select>
          <select value={silo} onChange={e => setSilo(e.target.value)} className="bg-white/10 text-white border-0 rounded-md px-2 py-1 text-sm">
            {SILOS.map(s => <option key={s} value={s} className="text-slate-800">{s}</option>)}
          </select>
          <select value={segment} onChange={e => setSegment(e.target.value)} className="bg-white/10 text-white border-0 rounded-md px-2 py-1 text-sm">
            {SEGMENTS.map(s => <option key={s} value={s} className="text-slate-800">{s}</option>)}
          </select>
        </div>
      </header>

      {/* ── Dashboard View ────────────────────── */}
      {view === 'dashboard' && (
        <div className="px-6 py-6 animate-fade-in-up">
          {/* KPI Grid - 3 columns, 3 rows = 9 cards */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            {KPI_DEFS.map(kpi => (
              <KPICard key={kpi.id} kpi={kpi} data={MONTHLY_DATA} onExpand={setExpandedKpi} />
            ))}
          </div>

          {/* Bottom row: Segments + Regionen + Vertriebsbericht */}
          <div className="grid grid-cols-3 gap-4">
            {/* Spartenverteilung */}
            <div className="bg-white rounded-xl border border-slate-200 p-5" style={{ boxShadow: 'var(--card-shadow)' }}>
              <h3 className="text-sm font-semibold text-slate-700 mb-4">Spartenverteilung</h3>
              <div className="relative h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={SEGMENT_VERTEILUNG} cx="50%" cy="50%" innerRadius="55%" outerRadius="85%" paddingAngle={2} dataKey="value" animationDuration={600}>
                      {SEGMENT_VERTEILUNG.map((s, i) => <Cell key={i} fill={s.color} />)}
                    </Pie>
                    <Tooltip content={<ChartTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex flex-wrap gap-3 mt-2 justify-center">
                {SEGMENT_VERTEILUNG.map(s => (
                  <div key={s.name} className="flex items-center gap-1.5 text-xs text-slate-600">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: s.color }} />
                    {s.name} ({s.value}%)
                  </div>
                ))}
              </div>
            </div>

            {/* Vertriebswege */}
            <div className="bg-white rounded-xl border border-slate-200 p-5" style={{ boxShadow: 'var(--card-shadow)' }}>
              <h3 className="text-sm font-semibold text-slate-700 mb-4">Vertriebswege</h3>
              <div className="relative h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={VERTRIEBSWEG_VERTEILUNG} cx="50%" cy="50%" innerRadius="55%" outerRadius="85%" paddingAngle={2} dataKey="value" animationDuration={600}>
                      {VERTRIEBSWEG_VERTEILUNG.map((s, i) => <Cell key={i} fill={s.color} />)}
                    </Pie>
                    <Tooltip content={<ChartTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex flex-wrap gap-3 mt-2 justify-center">
                {VERTRIEBSWEG_VERTEILUNG.map(s => (
                  <div key={s.name} className="flex items-center gap-1.5 text-xs text-slate-600">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: s.color }} />
                    {s.name} ({s.value}%)
                  </div>
                ))}
              </div>
            </div>

            {/* Regionen Übersicht */}
            <div className="bg-white rounded-xl border border-slate-200 p-5" style={{ boxShadow: 'var(--card-shadow)' }}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-slate-700 flex items-center gap-1.5">
                  <MapPin size={15} className="text-slate-400" /> Top Regionen
                </h3>
              </div>
              <div className="space-y-2">
                {BUNDESLAND_DATA.slice(0, 8).map((bl, i) => (
                  <div key={bl.name} className="flex items-center justify-between text-sm py-1">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-xs text-slate-400 w-4 text-right">{i + 1}</span>
                      <span className="text-slate-700 truncate">{bl.name}</span>
                    </div>
                    <span className="font-mono text-xs font-medium text-slate-600 shrink-0">{fmtCur(bl.neugeschaeft)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Vertriebsbericht Toggle */}
          <div className="mt-6">
            <button
              onClick={() => setShowReport(!showReport)}
              className="flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-800 transition-colors"
            >
              <ChevronDown size={16} className={clsx('transition-transform', showReport && 'rotate-180')} />
              Vertriebsbericht {showReport ? 'ausblenden' : 'anzeigen'}
            </button>

            {showReport && (
              <div className="mt-4 bg-white rounded-xl border border-slate-200 overflow-hidden animate-fade-in-up" style={{ boxShadow: 'var(--card-shadow)' }}>
                <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
                  <h3 className="font-semibold text-slate-800">Vertriebsbericht – Aktuelle Abschlüsse</h3>
                  <button className="text-xs text-slate-400 hover:text-slate-600 flex items-center gap-1">
                    <Download size={13} /> Export
                  </button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-slate-100 text-left">
                        <th className="px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Datum</th>
                        <th className="px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Versicherungsnehmer</th>
                        <th className="px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Produkt</th>
                        <th className="px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Tarif</th>
                        <th className="px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Antragsnr.</th>
                        <th className="px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Beitrag</th>
                        <th className="px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Faktor</th>
                        <th className="px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Provision</th>
                        <th className="px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {ABSCHLUESSE.map((a, i) => (
                        <tr key={i} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                          <td className="px-5 py-3 text-slate-500">{a.datum}</td>
                          <td className="px-5 py-3 font-medium text-slate-700">{a.vn}</td>
                          <td className="px-5 py-3 text-slate-600">{a.produkt}</td>
                          <td className="px-5 py-3 text-slate-500">{a.tarif}</td>
                          <td className="px-5 py-3 font-mono text-xs text-slate-400">{a.antragNr}</td>
                          <td className="px-5 py-3 text-right font-mono text-slate-700">{a.beitrag.toLocaleString('de-DE')}€</td>
                          <td className="px-5 py-3 text-right font-mono text-slate-500">{a.faktor.toFixed(1)}</td>
                          <td className="px-5 py-3 text-right font-mono font-medium text-emerald-600">{a.provision.toLocaleString('de-DE')}€</td>
                          <td className="px-5 py-3">
                            <span className={clsx('text-xs px-2 py-0.5 rounded-full font-medium',
                              a.status === 'policiert' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
                            )}>
                              {a.status}
                            </span>
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

      {/* ── Table View ────────────────────────── */}
      {view === 'table' && (
        <div className="px-6 py-6 animate-fade-in-up">
          {/* Table sub-toggle */}
          <div className="flex gap-2 mb-4">
            {[['bundeslaender', 'Bundesländer'], ['agenturen', 'Agenturen']].map(([id, label]) => (
              <button
                key={id}
                onClick={() => setTableView(id)}
                className={clsx('px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                  tableView === id ? 'bg-slate-800 text-white' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                )}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Bundesländer Table */}
          {tableView === 'bundeslaender' && (
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden" style={{ boxShadow: 'var(--card-shadow)' }}>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50 text-left">
                      <th className="px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">#</th>
                      <th className="px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Bundesland</th>
                      <th className="px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Neugeschäft</th>
                      <th className="px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Bestand</th>
                      <th className="px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Stornoquote</th>
                      <th className="px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Vermittler</th>
                      <th className="px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Faktor</th>
                    </tr>
                  </thead>
                  <tbody>
                    {BUNDESLAND_DATA.map((bl, i) => (
                      <tr key={bl.name} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                        <td className="px-5 py-3 text-slate-400">{i + 1}</td>
                        <td className="px-5 py-3 font-medium text-slate-700">{bl.name}</td>
                        <td className="px-5 py-3 text-right font-mono text-slate-700">{fmtCur(bl.neugeschaeft)}</td>
                        <td className="px-5 py-3 text-right font-mono text-slate-700">{fmtCur(bl.bestand)}</td>
                        <td className="px-5 py-3 text-right font-mono">
                          <span className={bl.storno > 5.0 ? 'text-red-500' : 'text-emerald-600'}>{bl.storno.toFixed(1)}%</span>
                        </td>
                        <td className="px-5 py-3 text-right font-mono text-slate-600">{bl.vermittler}</td>
                        <td className="px-5 py-3 text-right font-mono text-slate-500">{bl.factor.toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Agenturen Table */}
          {tableView === 'agenturen' && (
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden" style={{ boxShadow: 'var(--card-shadow)' }}>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50 text-left">
                      <th className="px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">#</th>
                      <th className="px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Vermittler</th>
                      <th className="px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Region</th>
                      <th className="px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Neugeschäft</th>
                      <th className="px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Bestand</th>
                      <th className="px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Stornoquote</th>
                      <th className="px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">NPS</th>
                      <th className="px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Abschlüsse</th>
                    </tr>
                  </thead>
                  <tbody>
                    {TOP_VERMITTLER.map((vm, i) => (
                      <tr key={vm.id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                        <td className="px-5 py-3 text-slate-400">{i + 1}</td>
                        <td className="px-5 py-3">
                          <div className="font-medium text-slate-700">{vm.name}</div>
                          <div className="text-xs text-slate-400">{vm.id}</div>
                        </td>
                        <td className="px-5 py-3 text-slate-600">{vm.region}</td>
                        <td className="px-5 py-3 text-right font-mono text-slate-700">{fmtCur(vm.neugeschaeft)}</td>
                        <td className="px-5 py-3 text-right font-mono text-slate-700">{fmtCur(vm.bestand)}</td>
                        <td className="px-5 py-3 text-right font-mono">
                          <span className={vm.storno > 4.5 ? 'text-red-500' : 'text-emerald-600'}>{vm.storno.toFixed(1)}%</span>
                        </td>
                        <td className="px-5 py-3 text-right font-mono text-slate-600">{vm.nps}</td>
                        <td className="px-5 py-3 text-right font-mono font-medium text-slate-700">{vm.abschluesse}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── Fullscreen Modal ──────────────────── */}
      {expandedKpi && <FullscreenModal kpi={expandedKpi} data={MONTHLY_DATA} onClose={() => setExpandedKpi(null)} />}
    </div>
  );
}
