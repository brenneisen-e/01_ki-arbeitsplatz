import { Briefcase, TrendingUp, AlertTriangle, Target, Users, Landmark, PiggyBank, Wallet, BarChart3, X, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { useState, useMemo, useId } from 'react';
import { createPortal } from 'react-dom';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

const KPI_ICONS = { Briefcase, TrendingUp, AlertTriangle, Target, Users, Landmark, PiggyBank, Wallet, BarChart3 };

import { getLang } from '../../utils/langHelper';

function formatValue(wert, format) {
  const loc = getLang() === 'en' ? 'en-US' : 'de-DE';
  const cur = '€';
  if (format === 'eur') {
    return `${Math.round(wert).toLocaleString(loc)}${cur}`;
  }
  if (format === 'pct') return `${wert.toLocaleString(loc, { maximumFractionDigits: 1 })}%`;
  if (format === 'num') return wert.toLocaleString(loc);
  return String(wert);
}

function fmtTick(value, format) {
  if (format === 'eur') {
    if (value >= 1e6) return `${(value / 1e6).toFixed(1)}M`;
    if (value >= 1e3) return `${Math.round(value / 1e3)}k`;
    return Math.round(value).toString();
  }
  if (format === 'pct') return `${value.toFixed(0)}%`;
  if (value >= 1e3) return `${(value / 1e3).toFixed(1)}k`;
  return Math.round(value).toString();
}

function generateMonthlyData(currentValue, trend) {
  const loc = getLang() === 'en' ? 'en-US' : 'de-DE';
  const now = new Date();
  const data = [];
  for (let i = 11; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const monthLabel = d.toLocaleDateString(loc, { month: 'short' });
    const factor = 1 - ((trend / 100) * (i / 11));
    const noise = 1 + (Math.sin(i * 2.7 + currentValue * 0.001) * 0.005);
    data.push({ month: monthLabel, value: Math.round(currentValue * factor * noise) });
  }
  return data;
}

function formatCompact(wert, format) {
  const loc = getLang() === 'en' ? 'en-US' : 'de-DE';
  const cur = '€';
  if (format === 'eur') {
    if (wert >= 1000000) return `${(wert / 1000000).toLocaleString(loc, { maximumFractionDigits: 1 })}M${cur}`;
    if (wert >= 1000) return `${Math.round(wert / 1000).toLocaleString(loc)}k${cur}`;
    return `${Math.round(wert).toLocaleString(loc)}${cur}`;
  }
  return formatValue(wert, format);
}

function ChartTooltip({ active, payload, label, format }) {
  if (!active || !payload?.[0]) return null;
  return (
    <div className="surface-elevated rounded-lg px-2.5 py-1.5 text-xs">
      <div className="font-medium text-(--text-secondary)">{label}</div>
      <div className="font-mono text-(--text-primary)">{formatCompact(payload[0].value, format)}</div>
    </div>
  );
}

/* Aufgeklappter 12-Monats-Verlauf: Säulen in der Modus-Chartfarbe, höchstens
   24 px breit mit 4 px Rundung oben, der laufende Monat in Gold. */
function ExpandedChart({ data, format, label, onClose }) {
  const values = data.map(d => d.value);
  const max = Math.max(...values);
  const min = Math.min(...values);
  const baseline = min > 0 ? min * 0.9 : 0;
  const range = (max - baseline) * 1.1 || 1;
  const BAR_AREA_H = 180;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(28,26,23,0.45)] backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      <div className="surface-elevated rounded-2xl p-6 w-full max-w-2xl mx-4 animate-fade-in-up" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-semibold text-(--text-primary)">{label} · {getLang() === 'en' ? 'Last 12 Months' : 'Letzte 12 Monate'}</h3>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-(--text-tertiary) hover:text-(--text-primary) hover:bg-(--bg-inset) transition-colors"
            aria-label={getLang() === 'en' ? 'Close' : 'Schließen'}
          >
            <X size={18} />
          </button>
        </div>
        <div className="flex items-end gap-1.5 border-b border-(--border-light)">
          {data.map((d, i) => {
            const ratio = (d.value - baseline) / range;
            const barH = Math.max(Math.round(ratio * BAR_AREA_H), 4);
            const isCurrent = i === data.length - 1;
            return (
              <div key={i} className="flex-1 flex flex-col items-center gap-1.5">
                <span className="text-[10px] text-(--text-tertiary) font-mono whitespace-nowrap">{formatCompact(d.value, format)}</span>
                <div
                  className="w-full max-w-6 rounded-t transition-all duration-300"
                  style={{ height: barH, backgroundColor: isCurrent ? 'var(--mode-accent)' : 'var(--mode-chart)' }}
                />
              </div>
            );
          })}
        </div>
        <div className="flex gap-1.5 mt-2">
          {data.map((d, i) => (
            <span key={i} className="flex-1 text-center text-[10px] text-(--text-tertiary) whitespace-nowrap">{d.month}</span>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function KPIBox({ icon, label, wert, format = 'num', trend, delay = 0 }) {
  const [expanded, setExpanded] = useState(false);
  const Icon = KPI_ICONS[icon] || BarChart3;
  const isPositive = trend >= 0;

  const monthlyData = useMemo(() => generateMonthlyData(wert, trend || 0), [wert, trend]);
  const gradientId = `kpi-grad-${useId().replace(/:/g, '')}`;

  return (
    <>
      <div
        className="relative rounded-(--card-radius) border border-(--border-light) p-4 animate-fade-in-up cursor-pointer card-base card-hover hover:-translate-y-px overflow-hidden h-full flex flex-col"
        style={{ animationDelay: `${delay}ms` }}
        onClick={() => setExpanded(true)}
      >
        {/* Kopf: Icon + Label links, Trend-Chip rechts */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center bg-(--bg-inset) kpi-icon-box shrink-0 transition-colors">
              <Icon size={15} className="text-(--mode-accent)" strokeWidth={1.75} />
            </div>
            <span className="text-xs font-medium text-(--text-tertiary) truncate">{label}</span>
          </div>
          {trend !== undefined && (
            <div
              className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md text-[11px] font-semibold shrink-0 ${
                isPositive
                  ? 'bg-(--tint-success) text-(--color-success)'
                  : 'bg-(--tint-danger) text-(--color-danger)'
              }`}
            >
              {isPositive ? <ArrowUpRight size={11} strokeWidth={2.5} /> : <ArrowDownRight size={11} strokeWidth={2.5} />}
              <span>{Math.abs(trend).toFixed(1)}%</span>
            </div>
          )}
        </div>

        {/* Wert: groß, Uniform Tab (Ziffern gleicher Dickte) */}
        <div
          className="font-mono text-[30px] leading-none font-semibold tracking-[-0.02em] text-(--text-primary) mb-2 truncate kpi-value"
          style={{ animationDelay: `${delay}ms` }}
        >
          {formatValue(format === 'pct' ? wert : Math.round(wert), format)}
        </div>

        {/* Sparkline: Fläche in der Modus-Chartfarbe, 12 % Alpha.
            flex-1, damit die Kachel neben der höheren Kundenkarte mitwächst. */}
        <div className="flex-1 min-h-[52px] -mx-1 kpi-sparkline">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={monthlyData} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
              <defs>
                <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--mode-chart)" stopOpacity={0.12} />
                  <stop offset="100%" stopColor="var(--mode-chart)" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <XAxis
                dataKey="month"
                tick={{ fontSize: 9, fill: 'var(--chart-axis)' }}
                axisLine={false}
                tickLine={false}
                interval="preserveStartEnd"
                height={14}
              />
              <YAxis
                tick={{ fontSize: 9, fill: 'var(--chart-axis)' }}
                axisLine={false}
                tickLine={false}
                width={32}
                domain={['auto', 'auto']}
                tickFormatter={(v) => fmtTick(v, format)}
                tickCount={3}
              />
              <Tooltip content={<ChartTooltip format={format} />} cursor={{ stroke: 'var(--border-strong)', strokeWidth: 1 }} />
              <Area
                type="monotone"
                dataKey="value"
                stroke="var(--mode-chart)"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
                fill={`url(#${gradientId})`}
                dot={false}
                activeDot={{ r: 4, fill: 'var(--mode-chart)', stroke: 'var(--bg-card)', strokeWidth: 2 }}
                animationDuration={600}
                animationEasing="ease-out"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Als Portal auf document.body: der Inhaltsbereich trägt eine Transform-
          Animation und wäre sonst der Bezugsrahmen des fixierten Overlays. */}
      {expanded && createPortal(
        <ExpandedChart
          data={monthlyData}
          format={format}
          label={label}
          onClose={() => setExpanded(false)}
        />,
        document.body
      )}
    </>
  );
}
