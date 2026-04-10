import { Briefcase, TrendingUp, TrendingDown, AlertTriangle, Target, Users, Landmark, PiggyBank, Wallet, BarChart3, X } from 'lucide-react';
import { useState, useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

const KPI_ICONS = { Briefcase, TrendingUp, AlertTriangle, Target, Users, Landmark, PiggyBank, Wallet, BarChart3 };

import { getLang } from '../../utils/langHelper';

function formatValue(wert, format) {
  const loc = getLang() === 'en' ? 'en-US' : 'de-DE';
  const cur = getLang() === 'en' ? '$' : '\u20ac';
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
  const cur = getLang() === 'en' ? '$' : '\u20ac';
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
    <div className="bg-white px-2.5 py-1.5 rounded-md shadow-md border border-slate-200 text-xs">
      <div className="font-medium text-slate-700">{label}</div>
      <div className="font-mono text-slate-600">{formatCompact(payload[0].value, format)}</div>
    </div>
  );
}

function ExpandedChart({ data, format, label, onClose }) {
  const values = data.map(d => d.value);
  const max = Math.max(...values);
  const min = Math.min(...values);
  const baseline = min > 0 ? min * 0.9 : 0;
  const range = (max - baseline) * 1.1 || 1;
  const BAR_AREA_H = 180;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm animate-fade-in" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-2xl mx-4 animate-fade-in-up" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-slate-800">{label} — {getLang() === 'en' ? 'Last 12 Months' : 'Letzte 12 Monate'}</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X size={18} />
          </button>
        </div>
        <div className="flex items-end gap-1.5 mb-6">
          {data.map((d, i) => {
            const ratio = (d.value - baseline) / range;
            const barH = Math.max(Math.round(ratio * BAR_AREA_H), 4);
            return (
              <div key={i} className="flex-1 flex flex-col items-center gap-1 relative">
                <span className="text-[8px] text-slate-500 font-mono whitespace-nowrap">{formatCompact(d.value, format)}</span>
                <div
                  className="w-full rounded-t transition-all duration-300"
                  style={{ height: barH, backgroundColor: 'var(--mode-primary-light)' }}
                />
                <span className="text-[8px] text-slate-400 absolute -bottom-5 -rotate-45 origin-top-left whitespace-nowrap">{d.month}</span>
              </div>
            );
          })}
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
  const gradientId = useMemo(() => `kpi-grad-${Math.random().toString(36).slice(2, 10)}`, []);

  return (
    <>
      <div
        className="relative rounded-xl border p-4 animate-fade-in-up cursor-pointer card-base overflow-hidden h-full flex flex-col transition-shadow hover:shadow-lg"
        style={{
          animationDelay: `${delay}ms`,
          // Pastel tint derived from the current mode's primary colour so KPI
          // cards visually pop against the white content cards below without a
          // loud accent strip. `color-mix` degrades gracefully to the fallback
          // background on older browsers.
          background:
            'linear-gradient(180deg, color-mix(in srgb, var(--mode-primary-light) 14%, #ffffff) 0%, color-mix(in srgb, var(--mode-primary-light) 6%, #ffffff) 100%)',
          borderColor: 'color-mix(in srgb, var(--mode-primary-light) 22%, #e2e8f0)',
          boxShadow: '0 6px 16px -6px rgba(15, 23, 42, 0.10), 0 2px 6px -2px rgba(15, 23, 42, 0.05)',
        }}
        onClick={() => setExpanded(true)}
      >
        {/* Header: icon + label on left, trend pill on right */}
        <div className="flex items-center justify-between mb-1.5">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center bg-slate-100 kpi-icon-box shrink-0">
              <Icon size={15} style={{ color: 'var(--_fg, var(--mode-primary-light))' }} strokeWidth={1.75} />
            </div>
            <span className="text-xs font-medium text-slate-500 truncate">{label}</span>
          </div>
          {trend !== undefined && (
            <div
              className={`flex items-center gap-0.5 text-[11px] font-semibold ${isPositive ? 'text-emerald-600' : 'text-red-500'}`}
            >
              {isPositive ? <TrendingUp size={11} strokeWidth={2.5} /> : <TrendingDown size={11} strokeWidth={2.5} />}
              <span>{Math.abs(trend).toFixed(1)}%</span>
            </div>
          )}
        </div>

        {/* Value */}
        <div
          className="font-mono text-[1.5rem] leading-tight font-extrabold mb-1 truncate kpi-value"
          style={{ color: 'var(--_fg, #0f172a)', fontFeatureSettings: "'tnum'", animationDelay: `${delay}ms` }}
        >
          {formatValue(format === 'pct' ? wert : Math.round(wert), format)}
        </div>

        {/* Mini Area Chart (VSTCockpit style – recharts with axes)
            flex-1 so it fills the remaining space when the card is stretched
            to match the taller Kundenkarte tile in the KPI row. */}
        <div className="flex-1 min-h-[52px] -mx-1">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={monthlyData} margin={{ top: 2, right: 4, bottom: 0, left: 0 }}>
              <defs>
                <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--mode-primary-light)" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="var(--mode-primary-light)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis
                dataKey="month"
                tick={{ fontSize: 9, fill: '#94a3b8' }}
                axisLine={false}
                tickLine={false}
                interval="preserveStartEnd"
                height={14}
              />
              <YAxis
                tick={{ fontSize: 9, fill: '#94a3b8' }}
                axisLine={false}
                tickLine={false}
                width={32}
                domain={['auto', 'auto']}
                tickFormatter={(v) => fmtTick(v, format)}
                tickCount={3}
              />
              <Tooltip content={<ChartTooltip format={format} />} cursor={{ stroke: '#cbd5e1', strokeDasharray: '3 3' }} />
              <Area
                type="monotone"
                dataKey="value"
                stroke="var(--mode-primary-light)"
                strokeWidth={1.75}
                fill={`url(#${gradientId})`}
                dot={false}
                activeDot={{ r: 3.5, fill: 'var(--mode-primary-light)', stroke: '#fff', strokeWidth: 1.5 }}
                animationDuration={600}
                animationEasing="ease-out"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {expanded && (
        <ExpandedChart
          data={monthlyData}
          format={format}
          label={label}
          onClose={() => setExpanded(false)}
        />
      )}
    </>
  );
}
