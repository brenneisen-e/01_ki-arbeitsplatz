import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { clsx } from 'clsx';
import {
  Home, ChevronDown, LayoutDashboard, List,
  TrendingUp, TrendingDown, Maximize2, X, Download, Calendar, BarChart3 as BarChartIcon, Activity,
  Sparkles, User, Play, RefreshCw,
} from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import { AreaChart, Area, BarChart, Bar, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import GermanyMap from './GermanyMap';
import DemoWasserzeichen from './DemoWasserzeichen';
import {
  KPI_DEFS, MONTHLY_DATA,
  BUNDESLAND_DATA, ALL_VERMITTLER, TOP_VERMITTLER, fmtVal, fmtCur,
  generateForecastData,
} from './cockpitData';
import { LiveProvider, useLive, mitLiveMonat } from './liveDaten';
import LiveLeiste from './LiveLeiste';
import Zaehler from './Zaehler';
import KiAssistent from './KiAssistent';
import DashboardFlaeche, { DashboardKopf } from './DashboardFlaeche';
import DashboardRaster from './DashboardWidgets';
import { baueDashboard, FRAGEN } from './dashboards';
import Praesentation from './Praesentation';
import { FARBE, euroKompakt, uhrzeit, datum } from './format';

/* ── Filters ──────────────────────────────────── */
const YEARS = [`${new Date().getFullYear()} YTD`, `${new Date().getFullYear() - 1}`];
const SILOS = ['Alle', 'Ausschließlichkeit', 'Makler', 'Direktvertrieb', 'Banken'];
const SEGMENTS = ['Alle', 'Leben', 'Kranken', 'Schaden', 'Kfz'];

/* ── Y-axis tick formatter ────────────────────── */
function fmtTick(val) {
  if (val >= 1000000) return `${(val / 1000000).toFixed(1)}M`;
  if (val >= 1000) return `${(val / 1000).toFixed(0)}k`;
  if (val <= -1000) return `${(val / 1000).toFixed(0)}k`;
  return val % 1 === 0 ? val : val.toFixed(1);
}

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
function KPICard({ kpi, data, forecastEnabled, onExpand }) {
  const [chartView, setChartView] = useState('month');
  const [liveZuwachs, setLiveZuwachs] = useState(null);

  // Use only actual data for KPI values
  const actualData = forecastEnabled ? data.filter(d => !d.isForecast) : data;
  const current = actualData[actualData.length - 1]?.[kpi.id] ?? 0;
  const prev = actualData[actualData.length - 2]?.[kpi.id] ?? 0;
  const trend = prev !== 0 ? ((current - prev) / Math.abs(prev)) * 100 : 0;
  const isGood = kpi.invertTrend ? trend <= 0 : trend >= 0;

  const isAvgKpi = ['storno', 'nps', 'risiko', 'combined', 'underwriting'].includes(kpi.id);
  const ytd = isAvgKpi
    ? actualData.reduce((s, m) => s + (m[kpi.id] || 0), 0) / (actualData.length || 1)
    : actualData.reduce((s, m) => s + (m[kpi.id] || 0), 0);

  const Icon = LucideIcons[kpi.icon] || LucideIcons.BarChart3;
  const chartColor = FARBE.modusHell;

  // Kommt ein Live-Abschluss in den laufenden Monat, zeigt die Kachel kurz den Zuwachs.
  const vorher = useRef(current);
  useEffect(() => {
    const d = current - vorher.current;
    vorher.current = current;
    if (d > 0 && kpi.unit === 'currency') {
      setLiveZuwachs({ d, n: Date.now() });
      const t = setTimeout(() => setLiveZuwachs(null), 2800);
      return () => clearTimeout(t);
    }
    return undefined;
  }, [current, kpi.unit]);

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
      <div className="absolute top-0 left-0 right-0 h-1 rounded-t-2xl opacity-0 group-hover:opacity-100 transition-opacity" style={{ background: chartColor }} />

      {/* Header */}
      <div className="flex items-start justify-between mb-1">
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-sm font-semibold text-slate-800">{kpi.title}</span>
          <Icon size={16} className="text-slate-400 shrink-0" strokeWidth={1.75} />
        </div>
        <span className="text-[11px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-medium whitespace-nowrap shrink-0">
          {actualData[actualData.length - 1]?.month}: {fmtVal(current, kpi.unit)}
        </span>
      </div>
      <div className="text-[11px] text-slate-400 mb-3">{kpi.desc}</div>

      {/* Value */}
      <div className="mb-1">
        <Zaehler wert={ytd} format={v => fmtVal(kpi.unit === 'currency' ? Math.round(v) : +v.toFixed(1), kpi.unit)} className="font-mono text-[2rem] font-extrabold leading-tight whitespace-nowrap" />
      </div>
      <div className="flex items-center justify-between mb-3">
        <div className={clsx('flex items-center gap-1 text-xs font-medium', isGood ? 'text-emerald-600' : 'text-red-500')}>
          {isGood ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
          <span>{Math.abs(trend).toFixed(1)}% vs. Vormonat</span>
        </div>
        {liveZuwachs ? (
          <span key={liveZuwachs.n} className="animate-ticker-in text-[11px] px-2 py-0.5 rounded-full font-semibold whitespace-nowrap" style={{ background: FARBE.modusZart, color: FARBE.modus }}>
            +{euroKompakt(liveZuwachs.d)} live
          </span>
        ) : (
          <span className="text-[11px] text-slate-400">{isAvgKpi ? 'Durchschnitt YTD' : 'Summe YTD'}</span>
        )}
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
              className={clsx('p-1.5 rounded transition-all', chartView === v.id ? 'bg-white shadow-sm text-[#46552b]' : 'text-slate-400 hover:text-slate-600')}
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
              <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} width={30} tickFormatter={fmtTick} />
              <Tooltip content={<ChartTooltip />} />
              <Bar dataKey="value" fill={chartColor} radius={[4, 4, 0, 0]} barSize={24} animationDuration={600} />
            </BarChart>
          ) : (
            <AreaChart data={forecastEnabled ? data.map(d => ({
              ...d,
              fcLine: d.isForecast ? d[kpi.id] : undefined,
            })) : data} margin={{ top: 5, right: 5, bottom: 5, left: 5 }}>
              <defs>
                <linearGradient id={`grad-${kpi.id}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={chartColor} stopOpacity={0.12} />
                  <stop offset="95%" stopColor={chartColor} stopOpacity={0} />
                </linearGradient>
                <linearGradient id={`grad-fc-${kpi.id}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={FARBE.gold} stopOpacity={0.1} />
                  <stop offset="95%" stopColor={FARBE.gold} stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} width={44} domain={['auto', 'auto']} tickFormatter={fmtTick} />
              <Tooltip content={<ChartTooltip />} />
              <Area
                type="monotone" dataKey={kpi.id} stroke={chartColor} strokeWidth={2}
                fill={`url(#grad-${kpi.id})`}
                dot={{ r: 3, fill: chartColor, stroke: '#fff', strokeWidth: 1.5 }}
                activeDot={{ r: 5, fill: chartColor, stroke: '#fff', strokeWidth: 2 }}
                animationDuration={800} animationEasing="ease-out"
              />
              {forecastEnabled && (
                <Area
                  type="monotone" dataKey="fcLine" stroke={FARBE.gold} strokeWidth={2} strokeDasharray="6 3"
                  fill={`url(#grad-fc-${kpi.id})`} connectNulls={false}
                  dot={{ r: 3, fill: FARBE.gold, stroke: '#fff', strokeWidth: 1.5 }}
                  activeDot={{ r: 5, fill: FARBE.gold, stroke: '#fff', strokeWidth: 2 }}
                  animationDuration={800} animationEasing="ease-out"
                />
              )}
            </AreaChart>
          )}
        </ResponsiveContainer>
        {forecastEnabled && chartView !== 'distribution' && (
          <div className="absolute top-1 right-1 flex items-center gap-3 text-[10px] text-slate-400">
            <span className="flex items-center gap-1"><span className="w-3 h-0.5 inline-block" style={{ background: chartColor }} /> Ist</span>
            <span className="flex items-center gap-1"><span className="w-3 h-0.5 inline-block" style={{ background: FARBE.gold, borderTop: `1px dashed ${FARBE.gold}` }} /> Forecast</span>
          </div>
        )}
      </div>
    </div>
  );
}

/* ── Fullscreen Modal ─────────────────────────── */
function FullscreenModal({ kpi, data, forecastEnabled, onClose }) {
  const [chartView, setChartView] = useState('month');
  if (!kpi) return null;
  const Icon = LucideIcons[kpi.icon] || LucideIcons.BarChart3;

  const fsData = forecastEnabled
    ? data.map(d => ({
        ...d,
        fcLine: d.isForecast ? d[kpi.id] : undefined,
      }))
    : data;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center" onClick={onClose}>
      <div className="bg-white rounded-2xl w-[90vw] max-w-5xl max-h-[85vh] overflow-hidden animate-fade-in-up" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <Icon size={20} style={{ color: FARBE.modusHell }} strokeWidth={1.75} />
            <div>
              <h2 className="text-lg font-semibold text-slate-800">{kpi.title}</h2>
              <p className="text-xs text-slate-400">{kpi.desc}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {forecastEnabled && chartView !== 'bar' && (
              <div className="flex items-center gap-3 text-xs text-slate-400 mr-2">
                <span className="flex items-center gap-1"><span className="w-4 h-0.5 inline-block" style={{ background: FARBE.modusHell }} /> Ist-Daten</span>
                <span className="flex items-center gap-1"><span className="w-4 h-0.5 inline-block" style={{ background: FARBE.gold, borderTop: `1px dashed ${FARBE.gold}` }} /> KI-Forecast</span>
              </div>
            )}
            <div className="flex gap-1 bg-slate-100 rounded-lg p-0.5">
              {[['month', 'Monat'], ['bar', 'Verteilung'], ['daily', 'Tagesverlauf']].map(([v, l]) => (
                <button key={v} onClick={() => setChartView(v)}
                  className={clsx('px-3 py-1.5 rounded-md text-xs font-medium transition-colors', chartView === v ? 'bg-white shadow-sm text-[#46552b]' : 'text-slate-500 hover:text-slate-700')}>
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
                <YAxis tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} domain={['auto', 'auto']} tickFormatter={fmtTick} />
                <Tooltip content={<ChartTooltip />} />
                <Bar dataKey={kpi.id} fill={FARBE.modusHell} radius={[6, 6, 0, 0]} barSize={40} animationDuration={600} />
              </BarChart>
            ) : (
              <AreaChart data={fsData} margin={{ top: 10, right: 20, bottom: 10, left: 20 }}>
                <defs>
                  <linearGradient id="fs-grad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={FARBE.modusHell} stopOpacity={0.15} />
                    <stop offset="95%" stopColor={FARBE.modusHell} stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="fs-grad-fc" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={FARBE.gold} stopOpacity={0.15} />
                    <stop offset="95%" stopColor={FARBE.gold} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} domain={['auto', 'auto']} tickFormatter={fmtTick} />
                <Tooltip content={<ChartTooltip />} />
                <Area type="monotone" dataKey={kpi.id} stroke={FARBE.modusHell} strokeWidth={2.5} fill="url(#fs-grad)"
                  dot={{ r: 4, fill: FARBE.modusHell, stroke: '#fff', strokeWidth: 2 }}
                  activeDot={{ r: 6, fill: FARBE.modusHell, stroke: '#fff', strokeWidth: 2 }}
                  animationDuration={600} />
                {forecastEnabled && (
                  <Area type="monotone" dataKey="fcLine" stroke={FARBE.gold} strokeWidth={2.5} strokeDasharray="6 3" fill="url(#fs-grad-fc)" connectNulls={false}
                    dot={{ r: 4, fill: FARBE.gold, stroke: '#fff', strokeWidth: 2 }}
                    activeDot={{ r: 6, fill: FARBE.gold, stroke: '#fff', strokeWidth: 2 }}
                    animationDuration={600} />
                )}
              </AreaChart>
            )}
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

/* ── Scale monthly data by selected states' share ─ */
function scaleMonthlyData(data, selectedStates) {
  if (selectedStates.size === 0) return data;
  const totalBestand = BUNDESLAND_DATA.reduce((s, bl) => s + bl.bestand, 0);
  const selectedBestand = BUNDESLAND_DATA
    .filter(bl => selectedStates.has(bl.name))
    .reduce((s, bl) => s + bl.bestand, 0);
  const ratio = selectedBestand / totalBestand;
  return data.map(m => {
    const scaled = { month: m.month };
    for (const k of Object.keys(m)) {
      if (k === 'month') continue;
      const def = KPI_DEFS.find(d => d.id === k);
      if (def && (def.unit === 'percent' || def.unit === 'score')) {
        // For rates/scores, add slight variation instead of scaling
        scaled[k] = +(m[k] * (0.97 + ratio * 0.06)).toFixed(1);
      } else {
        scaled[k] = Math.round(m[k] * ratio);
      }
    }
    return scaled;
  });
}

/* ══════════════════════════════════════════════════
   CockpitPage - mirrors legacy A-03 Gesamtübersicht
   Layout: flex with kpi-grid (flex:1) + map-sidebar (380px)
   ══════════════════════════════════════════════════ */
export default function CockpitPage() {
  return (
    <LiveProvider>
      <CockpitInhalt />
    </LiveProvider>
  );
}

function CockpitInhalt() {
  const goToLanding = () => {
    const path = window.location.pathname;
    if (path.includes('/23_VSTCockpit/')) {
      window.location.href = path.substring(0, path.indexOf('/23_VSTCockpit/')) + '/';
    } else {
      window.location.href = '/';
    }
  };
  const [view, setView] = useState('dashboard');
  const [year, setYear] = useState(YEARS[0]);
  const [silo, setSilo] = useState('Alle');
  const [segment, setSegment] = useState('Alle');
  const [expandedKpi, setExpandedKpi] = useState(null);
  const [tableView, setTableView] = useState('bundeslaender');
  const [showReport, setShowReport] = useState(false);
  const [selectedStates, setSelectedStates] = useState(new Set());
  const [forecastEnabled, setForecastEnabled] = useState(false);
  const [agentur, setAgentur] = useState('Alle');
  const live = useLive();

  // KI-Assistent und generierte Dashboards
  const [chatOffen, setChatOffen] = useState(true);
  const [flaeche, setFlaeche] = useState(null); // { id, aufbau }
  const [angeheftet, setAngeheftet] = useState([]);
  const assistent = useRef(null);

  // Monatsdaten für die Kacheln: Bundesland-Filter, dann die Live-Abschlüsse des laufenden Monats
  const filteredData = useMemo(
    () => mitLiveMonat(scaleMonthlyData(MONTHLY_DATA, selectedStates), live.ereignisse, selectedStates),
    [selectedStates, live.ereignisse],
  );

  // Dashboards rechnen immer auf allen Bundesländern, inklusive Live-Strom.
  const kontext = useMemo(() => ({ monate: mitLiveMonat(MONTHLY_DATA, live.ereignisse), live }), [live]);
  const kontextRef = useRef(kontext);
  kontextRef.current = kontext;
  const holeSpec = useCallback((id) => baueDashboard(id, kontextRef.current), []);
  const zeigeDashboard = useCallback((id, aufbau = true) => setFlaeche({ id, aufbau, n: Date.now() }), []);
  const anheften = useCallback((id) => setAngeheftet(a => (a.includes(id) ? a.filter(x => x !== id) : [...a, id])), []);
  const flaechenSpec = flaeche ? baueDashboard(flaeche.id, kontext) : null;

  // Präsentation: steuert dieselbe Oberfläche über diese Schnittstelle.
  const [praesentation, setPraesentation] = useState(false);
  const praesApi = {
    setView, setChatOffen, setFlaeche, flaeche, zeigeDashboard, anheften, angeheftet, live, assistent,
    setForecast: setForecastEnabled, setLaender: setSelectedStates,
  };

  // Generate forecast data (stable per toggle, regenerates on toggle off/on)
  const forecastData = useMemo(() => forecastEnabled ? generateForecastData(filteredData) : [], [forecastEnabled, filteredData]);
  const chartData = useMemo(() => forecastEnabled ? [...filteredData.map(d => ({ ...d, isForecast: false })), ...forecastData] : filteredData, [filteredData, forecastData, forecastEnabled]);
  const filteredBundesland = useMemo(() => {
    if (selectedStates.size === 0) return BUNDESLAND_DATA;
    return BUNDESLAND_DATA.filter(bl => selectedStates.has(bl.name));
  }, [selectedStates]);
  const filteredVermittler = useMemo(() => {
    if (selectedStates.size === 0) return TOP_VERMITTLER;
    // Map regions to Bundesland names
    const regionMap = { 'NRW': 'Nordrhein-Westfalen' };
    return TOP_VERMITTLER.filter(vm => {
      const fullRegion = regionMap[vm.region] || vm.region;
      return selectedStates.has(fullRegion) || selectedStates.has(vm.region);
    });
  }, [selectedStates]);

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
      {/* Header — dieselben Maße wie der GlobalHeader des Vertriebsarbeitsplatzes
          (163 px: Kopfzeile mit pt-14 unter der Wasserzeichen-Lasche, Reiter
          mit Akzentlinie), Farbe Oliv. Die Filter stehen rechts in der
          Reiterzeile, damit die Kopfzeile nie umbricht. */}
      <header className="transition-all duration-500 text-white" style={{ background: 'var(--mode-gradient)' }}>
        <div className="px-6 pt-14 pb-3 flex items-center justify-between gap-4 whitespace-nowrap">
          <div className="flex items-center gap-4">
            <button onClick={goToLanding} className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-colors" title="Zurück zur Startseite">
              <Home size={16} strokeWidth={1.75} />
              <span className="text-xs font-medium">Startseite</span>
            </button>
            <div className="w-10 h-10 rounded-lg header-glass flex items-center justify-center">
              <LayoutDashboard size={22} strokeWidth={1.75} />
            </div>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-white/10 border-2 border-white/40 flex items-center justify-center">
                <User size={24} strokeWidth={1.75} />
              </div>
              <div>
                <div className="text-white text-sm font-medium">Vertriebssteuerung</div>
                <div className="text-white/70 text-xs">VST-Cockpit | KPIs, Bestand, Neugeschäft</div>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => setForecastEnabled(f => !f)}
              className={clsx(
                'flex items-center gap-2 px-3 py-1.5 rounded-lg header-glass text-xs font-medium',
                forecastEnabled && 'ring-2 ring-(--mode-accent)'
              )}
            >
              <Sparkles size={15} strokeWidth={1.9} className={forecastEnabled ? 'text-(--mode-accent)' : undefined} />
              AI Forecast
              <span className={clsx(
                'text-[10px] font-bold px-1.5 py-0.5 rounded',
                forecastEnabled ? 'bg-(--mode-accent) text-white' : 'bg-white/15 text-white/60'
              )}>KI</span>
            </button>
            {/* Play-Knopf ganz rechts: startet die Präsentation */}
            <button
              onClick={() => setPraesentation(true)}
              title="Präsentation starten"
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-white bg-white text-(--mode-primary) text-xs font-semibold hover:bg-white/90 transition-colors"
            >
              <Play size={14} strokeWidth={2} fill="currentColor" />
              Präsentation
            </button>
          </div>
        </div>

        <DemoWasserzeichen />

        {/* Reiter und Filter */}
        <div className="px-6 flex items-center justify-between gap-6 border-t border-white/10 mt-1">
          <div className="flex gap-1">
            {[
              { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
              { id: 'table', label: 'Tabelle', icon: List },
              { id: 'ki', label: 'KI-Dashboards', icon: Sparkles, anzahl: angeheftet.length },
            ].map(tab => {
              const Icon = tab.icon;
              return (
                <button key={tab.id} onClick={() => setView(tab.id)} data-praes={tab.id === 'ki' ? 'reiter-ki' : undefined}
                  className={clsx(
                    'px-4 py-2.5 text-sm font-medium border-b-2 transition-colors duration-200 whitespace-nowrap flex items-center gap-2',
                    view === tab.id ? 'border-(--mode-accent) text-white' : 'border-transparent text-white/65 hover:text-white'
                  )}>
                  <Icon size={16} strokeWidth={1.75} />
                  {tab.label}
                  {tab.anzahl > 0 && (
                    <span className="inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 text-[10px] font-bold rounded-full bg-(--mode-accent) text-white">{tab.anzahl}</span>
                  )}
                </button>
              );
            })}
          </div>
          <div className="flex items-center gap-2 text-xs whitespace-nowrap">
            <span className="text-white/50 max-[1279px]:hidden">Jahr:</span>
            <select title="Jahr" value={year} onChange={e => setYear(e.target.value)} className="header-glass rounded-md px-2 py-1 text-xs cursor-pointer">
              {YEARS.map(y => <option key={y} value={y} className="text-slate-800">{y}</option>)}
            </select>
            <span className="text-white/50 ml-2 max-[1279px]:hidden">Vertriebsweg:</span>
            <select title="Vertriebsweg" value={silo} onChange={e => setSilo(e.target.value)} className="header-glass rounded-md px-2 py-1 text-xs cursor-pointer">
              {SILOS.map(s => <option key={s} value={s} className="text-slate-800">{s}</option>)}
            </select>
            <span className="text-white/50 ml-2 max-[1279px]:hidden">Segment:</span>
            <select title="Segment" value={segment} onChange={e => setSegment(e.target.value)} className="header-glass rounded-md px-2 py-1 text-xs cursor-pointer">
              {SEGMENTS.map(s => <option key={s} value={s} className="text-slate-800">{s}</option>)}
            </select>
            <span className="text-white/50 ml-2 max-[1279px]:hidden">Agentur:</span>
            <select title="Agentur" value={agentur} onChange={e => setAgentur(e.target.value)} className="header-glass rounded-md px-2 py-1 text-xs cursor-pointer max-w-[180px]">
              <option value="Alle" className="text-slate-800">Alle</option>
              {ALL_VERMITTLER.map(vm => <option key={vm.id} value={vm.id} className="text-slate-800">{vm.id} – {vm.name}</option>)}
            </select>
          </div>
        </div>
      </header>

      {/* Dashboard View */}
      {view === 'dashboard' && (
        <div className="p-5">
          <LiveLeiste />
          {/* Main: KPI grid + Map sidebar */}
          <div className="flex gap-5 items-stretch">
            <div className="flex-1 min-w-0">
              {selectedStates.size > 0 && (
                <div className="mb-4 flex items-center gap-2 text-sm text-slate-500">
                  <LucideIcons.Filter size={14} />
                  <span>Gefiltert nach: <strong className="text-slate-700">{[...selectedStates].join(', ')}</strong></span>
                  <button onClick={() => setSelectedStates(new Set())} className="text-xs text-[#61753a] hover:text-[#46552b] ml-1">(Filter zurücksetzen)</button>
                </div>
              )}
              <div className="grid grid-cols-3 gap-5" data-praes="kacheln">
                {KPI_DEFS.map((kpi, i) => (
                  <div key={kpi.id} data-praes={i === 0 ? 'kachel-erste' : undefined} className="flex flex-col *:flex-1">
                    <KPICard kpi={kpi} data={chartData} forecastEnabled={forecastEnabled} onExpand={setExpandedKpi} />
                  </div>
                ))}
              </div>
            </div>
            <div data-praes="karte" className="w-[440px] shrink-0 bg-white rounded-2xl border border-slate-200 p-5 flex flex-col self-start sticky top-5" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
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
                  <h3 className="font-semibold text-slate-800">Vertriebsbericht – Eingänge heute, live</h3>
                  <div className="flex items-center gap-4">
                    <div className="flex gap-6 text-sm">
                      <div><span className="text-slate-400">Abschlüsse heute:</span> <span className="font-semibold text-slate-800">{live.heute.abschluesse.toLocaleString('de-DE')}</span></div>
                      <div><span className="text-slate-400">Σ Provision heute:</span> <span className="font-semibold text-emerald-600">{live.heute.provision.toLocaleString('de-DE')} €</span></div>
                    </div>
                    <button className="text-xs text-slate-400 hover:text-slate-600 flex items-center gap-1"><Download size={13} /> CSV</button>
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-slate-100 text-left bg-slate-50/50">
                        {['Eingang', 'Vermittler', 'Produkt', 'Tarif', 'Antragsnr.'].map(h => (
                          <th key={h} className="px-5 py-2.5 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">{h}</th>
                        ))}
                        {['Beitrag', 'Faktor', 'Provision'].map(h => (
                          <th key={h} className="px-5 py-2.5 text-[11px] font-semibold text-slate-500 uppercase tracking-wider text-right">{h}</th>
                        ))}
                        <th className="px-5 py-2.5 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {live.ereignisse.slice(0, 15).map((a) => {
                        const storno = a.art === 'storno';
                        const neu = a.live && Date.now() - a.zeit.getTime() < 12000;
                        return (
                          <tr key={a.id} className={clsx('border-b border-slate-50 hover:bg-slate-50 transition-colors', neu && 'animate-ticker-in bg-[#f6f8f1]')}>
                            <td className="px-5 py-2.5 text-slate-500 whitespace-nowrap">{datum(a.zeit)} <span className="font-mono text-[11px] text-slate-400">{uhrzeit(a.zeit, false)}</span></td>
                            <td className="px-5 py-2.5 font-medium text-slate-700">{a.vermittler.name}</td>
                            <td className="px-5 py-2.5 text-slate-600">{a.produkt}</td>
                            <td className="px-5 py-2.5 text-slate-500">{a.tarif}</td>
                            <td className="px-5 py-2.5 font-mono text-[11px] text-slate-400">{a.antragNr}</td>
                            <td className="px-5 py-2.5 text-right font-mono text-slate-700">{a.beitrag.toLocaleString('de-DE')} €</td>
                            <td className="px-5 py-2.5 text-right font-mono text-slate-500">{storno ? '–' : (a.provision / a.beitrag).toLocaleString('de-DE', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}</td>
                            <td className={clsx('px-5 py-2.5 text-right font-mono font-medium', storno ? 'text-slate-400' : 'text-emerald-600')}>{storno ? '–' : `${a.provision.toLocaleString('de-DE')} €`}</td>
                            <td className="px-5 py-2.5">
                              <span className={clsx('text-[11px] px-2 py-0.5 rounded-full font-medium',
                                storno ? 'bg-red-50 text-red-700' : a.live ? 'bg-[#eef1e6] text-[#46552b]' : 'bg-emerald-50 text-emerald-700'
                              )}>{storno ? 'storniert' : a.live ? 'neu eingegangen' : 'angenommen'}</span>
                            </td>
                          </tr>
                        );
                      })}
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
        <div className="p-5 animate-fade-in-up">
          {selectedStates.size > 0 && (
            <div className="mb-4 flex items-center gap-2 text-sm text-slate-500">
              <LucideIcons.Filter size={14} />
              <span>Gefiltert nach: <strong className="text-slate-700">{[...selectedStates].join(', ')}</strong></span>
              <button onClick={() => setSelectedStates(new Set())} className="text-xs text-[#61753a] hover:text-[#46552b] ml-1">(Filter zurücksetzen)</button>
            </div>
          )}
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
                  {filteredBundesland.map((bl, i) => (
                    <tr key={bl.name} className={clsx('border-b border-slate-50 hover:bg-blue-50/30 transition-colors', selectedStates.has(bl.name) && 'bg-green-50/50')}>
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
                  {filteredVermittler.map((vm, i) => (
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

      {/* Angeheftete KI-Dashboards: laufen live mit, weil sie bei jedem Render neu gerechnet werden */}
      {view === 'ki' && (
        <div data-praes="ki-ansicht" className={clsx('p-5 space-y-5 animate-fade-in-up', chatOffen && 'pr-[476px]')}>
          {angeheftet.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-10 text-center" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
              <Sparkles size={28} className="mx-auto mb-3" style={{ color: FARBE.gold }} />
              <h3 className="text-lg font-semibold text-slate-800">Noch keine KI-Dashboards angeheftet</h3>
              <p className="text-sm text-slate-500 mt-1 max-w-lg mx-auto">Stellen Sie dem KI-Assistenten eine Frage. Er baut daraus ein Dashboard, das Sie hier ans Cockpit heften können. Es läuft dann live mit.</p>
              <div className="mt-5 flex flex-wrap justify-center gap-2">
                {FRAGEN.slice(0, 4).map(f => (
                  <button key={f.id} onClick={() => assistent.current?.frage(f.id)} className="px-3 py-1.5 rounded-lg border border-slate-200 text-sm text-slate-600 hover:border-[#61753a]/50 hover:bg-[#f6f8f1] transition-colors">
                    {f.frage}
                  </button>
                ))}
              </div>
            </div>
          ) : angeheftet.map((id, i) => {
            const spec = baueDashboard(id, kontext);
            return (
              <section key={id} className="bg-[#f6f7f3] rounded-3xl border border-slate-200 overflow-hidden">
                <div data-praes={i === 0 ? 'ki-kopf' : undefined} className="px-6 pt-4 pb-3 bg-white border-b border-slate-200">
                  <DashboardKopf
                    spec={spec}
                    angeheftet
                    onAnheften={() => anheften(id)}
                    rechts={(
                      <button onClick={() => zeigeDashboard(id)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border border-slate-200 text-slate-600 hover:bg-slate-50" title="Neu generieren">
                        <RefreshCw size={14} /> Neu generieren
                      </button>
                    )}
                  />
                </div>
                <div className="p-5"><DashboardRaster spec={spec} /></div>
              </section>
            );
          })}
        </div>
      )}

      <Praesentation offen={praesentation} onClose={() => setPraesentation(false)} api={praesApi} />

      {expandedKpi && <FullscreenModal kpi={expandedKpi} data={chartData} forecastEnabled={forecastEnabled} onClose={() => setExpandedKpi(null)} />}

      <KiAssistent
        ref={assistent}
        offen={chatOffen}
        setOffen={setChatOffen}
        holeSpec={holeSpec}
        onDashboard={zeigeDashboard}
        onAnheften={anheften}
        angeheftet={angeheftet}
        onTabelle={(tv) => { setFlaeche(null); setView('table'); setTableView(tv); }}
      />
      {flaechenSpec && (
        <DashboardFlaeche
          key={flaeche.n}
          spec={flaechenSpec}
          aufbau={flaeche.aufbau}
          chatOffen={chatOffen}
          angeheftet={angeheftet.includes(flaeche.id)}
          onAnheften={() => anheften(flaeche.id)}
          onSchliessen={() => setFlaeche(null)}
        />
      )}
    </div>
  );
}
