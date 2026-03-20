import { useState, useEffect, useMemo, useRef } from 'react';
import { clsx } from 'clsx';
import {
  Home, ChevronDown, LayoutDashboard, List,
  TrendingUp, TrendingDown, Maximize2, X, Download, Calendar, BarChart3 as BarChartIcon, Activity,
  MessageSquare, Send, Sparkles, ArrowRight,
} from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import GermanyMap from './GermanyMap';
import {
  KPI_DEFS, MONTHLY_DATA,
  BUNDESLAND_DATA, TOP_VERMITTLER, ABSCHLUESSE, fmtVal, fmtCur,
  generateForecastData,
} from './cockpitData';

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
              <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} width={30} tickFormatter={fmtTick} />
              <Tooltip content={<ChartTooltip />} />
              <Bar dataKey="value" fill={chartColor} radius={[4, 4, 0, 0]} barSize={24} animationDuration={600} />
            </BarChart>
          ) : (
            <AreaChart data={forecastEnabled ? data.map((d, i, arr) => {
              const isLast = !d.isForecast && (i === arr.length - 1 || arr[i + 1]?.isForecast);
              return { ...d, actual: d.isForecast ? null : d[kpi.id], forecast: d.isForecast ? d[kpi.id] : isLast ? d[kpi.id] : null };
            }) : data} margin={{ top: 5, right: 5, bottom: 5, left: 5 }}>
              <defs>
                <linearGradient id={`grad-${kpi.id}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={chartColor} stopOpacity={0.12} />
                  <stop offset="95%" stopColor={chartColor} stopOpacity={0} />
                </linearGradient>
                <linearGradient id={`grad-fc-${kpi.id}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#86BC25" stopOpacity={0.12} />
                  <stop offset="95%" stopColor="#86BC25" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} width={44} domain={['auto', 'auto']} tickFormatter={fmtTick} />
              <Tooltip content={<ChartTooltip />} />
              {forecastEnabled ? (
                <>
                  <Area
                    type="monotone" dataKey="actual" stroke={chartColor} strokeWidth={2}
                    fill={`url(#grad-${kpi.id})`} connectNulls={false}
                    dot={{ r: 3, fill: chartColor, stroke: '#fff', strokeWidth: 1.5 }}
                    activeDot={{ r: 5, fill: chartColor, stroke: '#fff', strokeWidth: 2 }}
                    animationDuration={800} animationEasing="ease-out"
                  />
                  <Area
                    type="monotone" dataKey="forecast" stroke="#86BC25" strokeWidth={2} strokeDasharray="6 3"
                    fill={`url(#grad-fc-${kpi.id})`} connectNulls
                    dot={{ r: 3, fill: '#86BC25', stroke: '#fff', strokeWidth: 1.5 }}
                    activeDot={{ r: 5, fill: '#86BC25', stroke: '#fff', strokeWidth: 2 }}
                    animationDuration={800} animationEasing="ease-out"
                  />
                </>
              ) : (
                <Area
                  type="monotone" dataKey={kpi.id} stroke={chartColor} strokeWidth={2}
                  fill={`url(#grad-${kpi.id})`}
                  dot={{ r: 3, fill: chartColor, stroke: '#fff', strokeWidth: 1.5 }}
                  activeDot={{ r: 5, fill: chartColor, stroke: '#fff', strokeWidth: 2 }}
                  animationDuration={800} animationEasing="ease-out"
                />
              )}
            </AreaChart>
          )}
        </ResponsiveContainer>
        {forecastEnabled && chartView !== 'distribution' && (
          <div className="absolute top-1 right-1 flex items-center gap-3 text-[10px] text-slate-400">
            <span className="flex items-center gap-1"><span className="w-3 h-0.5 bg-blue-600 inline-block" /> Ist</span>
            <span className="flex items-center gap-1"><span className="w-3 h-0.5 inline-block" style={{ background: '#86BC25', borderTop: '1px dashed #86BC25' }} /> Forecast</span>
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
    ? data.map((d, i, arr) => {
        const isLast = !d.isForecast && (i === arr.length - 1 || arr[i + 1]?.isForecast);
        return { ...d, actual: d.isForecast ? null : d[kpi.id], forecast: d.isForecast ? d[kpi.id] : isLast ? d[kpi.id] : null };
      })
    : data;

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
            {forecastEnabled && chartView !== 'bar' && (
              <div className="flex items-center gap-3 text-xs text-slate-400 mr-2">
                <span className="flex items-center gap-1"><span className="w-4 h-0.5 bg-blue-600 inline-block" /> Ist-Daten</span>
                <span className="flex items-center gap-1"><span className="w-4 h-0.5 inline-block" style={{ background: '#86BC25', borderTop: '1px dashed #86BC25' }} /> KI-Forecast</span>
              </div>
            )}
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
                <YAxis tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} domain={['auto', 'auto']} tickFormatter={fmtTick} />
                <Tooltip content={<ChartTooltip />} />
                <Bar dataKey={kpi.id} fill="#2563eb" radius={[6, 6, 0, 0]} barSize={40} animationDuration={600} />
              </BarChart>
            ) : (
              <AreaChart data={fsData} margin={{ top: 10, right: 20, bottom: 10, left: 20 }}>
                <defs>
                  <linearGradient id="fs-grad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="fs-grad-fc" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#86BC25" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#86BC25" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} domain={['auto', 'auto']} tickFormatter={fmtTick} />
                <Tooltip content={<ChartTooltip />} />
                {forecastEnabled ? (
                  <>
                    <Area type="monotone" dataKey="actual" stroke="#2563eb" strokeWidth={2.5} fill="url(#fs-grad)" connectNulls={false}
                      dot={{ r: 4, fill: '#2563eb', stroke: '#fff', strokeWidth: 2 }}
                      activeDot={{ r: 6, fill: '#2563eb', stroke: '#fff', strokeWidth: 2 }}
                      animationDuration={600} />
                    <Area type="monotone" dataKey="forecast" stroke="#86BC25" strokeWidth={2.5} strokeDasharray="6 3" fill="url(#fs-grad-fc)" connectNulls
                      dot={{ r: 4, fill: '#86BC25', stroke: '#fff', strokeWidth: 2 }}
                      activeDot={{ r: 6, fill: '#86BC25', stroke: '#fff', strokeWidth: 2 }}
                      animationDuration={600} />
                  </>
                ) : (
                  <Area type="monotone" dataKey={kpi.id} stroke="#2563eb" strokeWidth={2.5} fill="url(#fs-grad)"
                    dot={{ r: 4, fill: '#2563eb', stroke: '#fff', strokeWidth: 2 }}
                    activeDot={{ r: 6, fill: '#2563eb', stroke: '#fff', strokeWidth: 2 }}
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

/* ── Cockpit Chatbot ──────────────────────────────── */
const QUICK_ACTIONS = [
  { label: 'Top 5 Vermittler nach Ergebnis', icon: 'TrendingUp' },
  { label: 'Auffällige Stornoquoten', icon: 'AlertTriangle' },
  { label: 'Performance Überblick', icon: 'BarChart3' },
  { label: 'Bundesland-Vergleich', icon: 'Map' },
];

const DEMO_RESPONSES = {
  'Top 5 Vermittler nach Ergebnis': {
    text: 'Hier sind die Top 5 Vermittler nach Neugeschäftsvolumen:',
    table: TOP_VERMITTLER.slice(0, 5).map((v, i) => `${i + 1}. **${v.name}** (${v.region}) — ${fmtCur(v.neugeschaeft)} NG, ${v.abschluesse} Abschlüsse`),
    action: { label: 'Agenturen-Tabelle öffnen', view: 'table', tableView: 'agenturen' },
  },
  'Auffällige Stornoquoten': {
    text: 'Bundesländer mit überdurchschnittlicher Stornoquote (> 5,0%):',
    table: BUNDESLAND_DATA.filter(bl => bl.storno > 5.0)
      .sort((a, b) => b.storno - a.storno)
      .map(bl => `• **${bl.name}**: ${bl.storno.toFixed(1)}% Stornoquote (${bl.vermittler} Vermittler)`),
    action: { label: 'Bundesländer-Tabelle öffnen', view: 'table', tableView: 'bundeslaender' },
  },
  'Performance Überblick': {
    text: 'Aktuelle Vertriebsperformance im Überblick:',
    table: [
      `• **Neugeschäft YTD**: ${fmtCur(MONTHLY_DATA.reduce((s, m) => s + m.neugeschaeft, 0))}`,
      `• **Bestandsvolumen**: ${fmtCur(MONTHLY_DATA[MONTHLY_DATA.length - 1].bestand)}`,
      `• **Stornoquote**: ${MONTHLY_DATA[MONTHLY_DATA.length - 1].storno.toFixed(1)}%`,
      `• **NPS Score**: ${MONTHLY_DATA[MONTHLY_DATA.length - 1].nps}`,
      `• **Combined Ratio**: ${MONTHLY_DATA[MONTHLY_DATA.length - 1].combined.toFixed(1)}%`,
    ],
    action: null,
  },
  'Bundesland-Vergleich': {
    text: 'Top 5 Bundesländer nach Neugeschäft:',
    table: [...BUNDESLAND_DATA].sort((a, b) => b.neugeschaeft - a.neugeschaeft).slice(0, 5)
      .map((bl, i) => `${i + 1}. **${bl.name}** — ${fmtCur(bl.neugeschaeft)} NG, Faktor ${bl.factor.toFixed(2)}`),
    action: { label: 'Bundesländer-Tabelle öffnen', view: 'table', tableView: 'bundeslaender' },
  },
};

function CockpitChatbot({ onNavigate }) {
  const [open, setOpen] = useState(true);
  const [messages, setMessages] = useState([
    { role: 'bot', text: 'Willkommen im KI-Vertriebsassistenten. Was möchten Sie analysieren?', actions: QUICK_ACTIONS },
  ]);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, typing]);

  function handleQuickAction(label) {
    setMessages(prev => [...prev, { role: 'user', text: label }]);
    setTyping(true);
    setTimeout(() => {
      const resp = DEMO_RESPONSES[label];
      if (resp) {
        setMessages(prev => [...prev, {
          role: 'bot',
          text: resp.text,
          list: resp.table,
          action: resp.action,
          actions: QUICK_ACTIONS,
        }]);
      } else {
        setMessages(prev => [...prev, {
          role: 'bot',
          text: 'Diese Analyse wird gerade vorbereitet. Bitte versuchen Sie eine der vordefinierten Aktionen.',
          actions: QUICK_ACTIONS,
        }]);
      }
      setTyping(false);
    }, 800 + Math.random() * 400);
  }

  function handleSend() {
    if (!input.trim()) return;
    const text = input.trim();
    setInput('');
    // Check if input matches a quick action
    const match = Object.keys(DEMO_RESPONSES).find(k => text.toLowerCase().includes(k.toLowerCase().split(' ')[0]));
    if (match) {
      handleQuickAction(match);
    } else {
      setMessages(prev => [...prev, { role: 'user', text }]);
      setTyping(true);
      setTimeout(() => {
        setMessages(prev => [...prev, {
          role: 'bot',
          text: `Ihre Anfrage "${text}" wird analysiert. In der Demo stehen folgende Auswertungen zur Verfügung:`,
          actions: QUICK_ACTIONS,
        }]);
        setTyping(false);
      }, 600);
    }
  }

  function handleAction(action) {
    if (action && onNavigate) {
      onNavigate(action);
      setOpen(false);
    }
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 z-40 w-14 h-14 rounded-full bg-slate-800 text-white shadow-xl hover:bg-slate-700 hover:scale-105 transition-all flex items-center justify-center"
        title="KI-Assistent"
      >
        <Sparkles size={22} />
      </button>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 z-40 w-[440px] h-[600px] bg-white rounded-2xl shadow-2xl border border-slate-200 flex flex-col animate-fade-in-up overflow-hidden">
      {/* Header */}
      <div className="bg-slate-800 text-white px-4 py-3 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <Sparkles size={16} />
          <span className="font-semibold text-sm">KI-Vertriebsassistent</span>
        </div>
        <button onClick={() => setOpen(false)} className="p-1 hover:bg-white/10 rounded transition-colors">
          <X size={16} />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg, i) => (
          <div key={i} className={clsx('flex', msg.role === 'user' ? 'justify-end' : 'justify-start')}>
            <div className={clsx(
              'max-w-[85%] rounded-xl px-3 py-2 text-sm',
              msg.role === 'user'
                ? 'bg-slate-800 text-white rounded-br-sm'
                : 'bg-slate-100 text-slate-700 rounded-bl-sm'
            )}>
              <p>{msg.text}</p>
              {msg.list && (
                <div className="mt-2 space-y-1 text-[13px]">
                  {msg.list.map((item, j) => (
                    <div key={j} className="text-slate-600" dangerouslySetInnerHTML={{
                      __html: item.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                    }} />
                  ))}
                </div>
              )}
              {msg.action && (
                <button
                  onClick={() => handleAction(msg.action)}
                  className="mt-2 flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700 font-medium"
                >
                  {msg.action.label} <ArrowRight size={12} />
                </button>
              )}
              {msg.actions && (
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {msg.actions.map(a => {
                    const AIcon = LucideIcons[a.icon] || MessageSquare;
                    return (
                      <button
                        key={a.label}
                        onClick={() => handleQuickAction(a.label)}
                        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white border border-slate-200 text-xs text-slate-600 hover:bg-blue-50 hover:border-blue-200 hover:text-blue-700 transition-colors"
                      >
                        <AIcon size={12} />
                        {a.label}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        ))}
        {typing && (
          <div className="flex justify-start">
            <div className="bg-slate-100 rounded-xl px-4 py-2.5 rounded-bl-sm">
              <div className="flex gap-1">
                <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="p-3 border-t border-slate-100 shrink-0">
        <div className="flex gap-2">
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSend()}
            placeholder="Frag mich etwas..."
            className="flex-1 px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:border-blue-300 focus:ring-1 focus:ring-blue-100"
          />
          <button onClick={handleSend} className="p-2 rounded-lg bg-slate-800 text-white hover:bg-slate-700 transition-colors">
            <Send size={16} />
          </button>
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
  const goToLanding = () => {
    const path = window.location.pathname;
    if (path.includes('/VSTCockpit/')) {
      window.location.href = path.substring(0, path.indexOf('/VSTCockpit/')) + '/';
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

  // Filtered data based on selected states
  const filteredData = useMemo(() => scaleMonthlyData(MONTHLY_DATA, selectedStates), [selectedStates]);

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

  function handleChatNavigate(action) {
    if (action.view) setView(action.view);
    if (action.tableView) setTableView(action.tableView);
  }

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
        <div className="px-5 pt-3 pb-2 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={goToLanding} className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-colors" title="Zurück zur Startseite">
              <Home size={16} strokeWidth={1.75} />
              <span className="text-xs font-medium">Startseite</span>
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
          <div className="flex items-center gap-3 text-sm shrink-0">
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
            <div className="h-5 w-px bg-white/20 mx-1" />
            <button
              onClick={() => setForecastEnabled(f => !f)}
              className={clsx(
                'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all border',
                forecastEnabled
                  ? 'bg-emerald-500/20 border-emerald-400/50 text-emerald-300'
                  : 'bg-white/10 border-white/10 text-white/70 hover:text-white hover:bg-white/15'
              )}
            >
              <Sparkles size={14} />
              AI Forecast
              <span className={clsx(
                'text-[10px] font-bold px-1.5 py-0.5 rounded',
                forecastEnabled ? 'bg-emerald-400/30 text-emerald-200' : 'bg-white/15 text-white/50'
              )}>KI</span>
            </button>
          </div>
        </div>
      </header>

      {/* Dashboard View */}
      {view === 'dashboard' && (
        <div className="p-5">
          {/* Main: KPI grid + Map sidebar */}
          <div className="flex gap-5 items-stretch">
            <div className="flex-1 min-w-0">
              {selectedStates.size > 0 && (
                <div className="mb-4 flex items-center gap-2 text-sm text-slate-500">
                  <LucideIcons.Filter size={14} />
                  <span>Gefiltert nach: <strong className="text-slate-700">{[...selectedStates].join(', ')}</strong></span>
                  <button onClick={() => setSelectedStates(new Set())} className="text-xs text-blue-600 hover:text-blue-700 ml-1">(Filter zurücksetzen)</button>
                </div>
              )}
              <div className="grid gap-5" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))' }}>
                {KPI_DEFS.map(kpi => (
                  <KPICard key={kpi.id} kpi={kpi} data={chartData} forecastEnabled={forecastEnabled} onExpand={setExpandedKpi} />
                ))}
              </div>
            </div>
            <div className="w-[440px] shrink-0 bg-white rounded-2xl border border-slate-200 p-5 flex flex-col self-start sticky top-5" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
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
        <div className="p-5 animate-fade-in-up">
          {selectedStates.size > 0 && (
            <div className="mb-4 flex items-center gap-2 text-sm text-slate-500">
              <LucideIcons.Filter size={14} />
              <span>Gefiltert nach: <strong className="text-slate-700">{[...selectedStates].join(', ')}</strong></span>
              <button onClick={() => setSelectedStates(new Set())} className="text-xs text-blue-600 hover:text-blue-700 ml-1">(Filter zurücksetzen)</button>
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

      {expandedKpi && <FullscreenModal kpi={expandedKpi} data={chartData} forecastEnabled={forecastEnabled} onClose={() => setExpandedKpi(null)} />}

      <CockpitChatbot onNavigate={handleChatNavigate} />
    </div>
  );
}
