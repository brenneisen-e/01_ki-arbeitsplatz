/**
 * KPIBox — angelehnt an den Banken-KPI-Stil aus dem Vertriebsarbeitsplatz.
 *
 * Eigenschaften:
 *  - Pastellfarbener Gradient-Hintergrund
 *  - 12-Monate Mini Area-Chart mit Verlauf-Füllung (recharts)
 *  - Trend-Pill oben rechts (positiv grün / negativ rot)
 *  - Große Mono-Zahl, Hover-Animation
 *  - Klickbar mit Vollbild-Balken-Chart (letzte 12 Monate)
 */

import { useState, useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import {
  Sparkles, AlertTriangle, UserCheck, CheckCircle2, TrendingUp, TrendingDown,
  Shield, ShieldAlert, FileCheck, Bot, Eye, Lock, X,
} from 'lucide-react';

const KPI_ICONS = { Sparkles, AlertTriangle, UserCheck, CheckCircle2, Shield, ShieldAlert, FileCheck, Bot, Eye, Lock };

const PRIMARY = '#1B2B4B';
const PRIMARY_LIGHT = '#2D4A7A';

function formatValue(wert, format) {
  if (format === 'eur') return `${Math.round(wert).toLocaleString('de-DE')} €`;
  if (format === 'pct') return `${wert.toLocaleString('de-DE', { maximumFractionDigits: 1 })}%`;
  if (format === 'num') return wert.toLocaleString('de-DE');
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
  const now = new Date();
  const data = [];
  const numValue = Number(currentValue);
  const base = isFinite(numValue) && numValue !== 0 ? numValue : 100;
  for (let i = 11; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const monthLabel = d.toLocaleDateString('de-DE', { month: 'short' });
    const factor = 1 - ((trend / 100) * (i / 11));
    const noise = 1 + (Math.sin(i * 2.7 + base * 0.001) * 0.02);
    data.push({ month: monthLabel, value: Math.max(0, Math.round(base * factor * noise * 100) / 100) });
  }
  return data;
}

function formatCompact(wert, format) {
  if (format === 'eur') {
    if (wert >= 1e6) return `${(wert / 1e6).toLocaleString('de-DE', { maximumFractionDigits: 1 })}M €`;
    if (wert >= 1e3) return `${Math.round(wert / 1e3).toLocaleString('de-DE')}k €`;
    return `${Math.round(wert).toLocaleString('de-DE')} €`;
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-2xl mx-4" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-slate-800">{label} — Letzte 12 Monate</h3>
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
                  style={{ height: barH, backgroundColor: PRIMARY_LIGHT }}
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
  const Icon = KPI_ICONS[icon] || Sparkles;
  const isPositive = (trend ?? 0) >= 0;

  const isNumeric = typeof wert === 'number' && isFinite(wert);
  const monthlyData = useMemo(
    () => generateMonthlyData(isNumeric ? wert : 100, trend ?? 0),
    [wert, trend, isNumeric],
  );
  const gradientId = useMemo(() => `kpi-grad-${Math.random().toString(36).slice(2, 10)}`, []);

  return (
    <>
      <div
        className="relative rounded-xl border p-4 cursor-pointer overflow-hidden h-full flex flex-col transition-shadow hover:shadow-md"
        style={{
          background: `linear-gradient(180deg, color-mix(in srgb, ${PRIMARY_LIGHT} 14%, #ffffff) 0%, color-mix(in srgb, ${PRIMARY_LIGHT} 6%, #ffffff) 100%)`,
          borderColor: `color-mix(in srgb, ${PRIMARY_LIGHT} 22%, #e2e8f0)`,
          boxShadow: '0 6px 16px -6px rgba(15, 23, 42, 0.10), 0 2px 6px -2px rgba(15, 23, 42, 0.05)',
          animationDelay: `${delay}ms`,
        }}
        onClick={() => isNumeric && setExpanded(true)}
      >
        {/* Header: icon + label on left, trend pill on right */}
        <div className="flex items-center justify-between mb-1.5">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center bg-slate-100 shrink-0">
              <Icon size={15} style={{ color: PRIMARY_LIGHT }} strokeWidth={1.75} />
            </div>
            <span className="text-xs font-medium text-slate-500 truncate">{label}</span>
          </div>
          {trend !== undefined && (
            <div className={`flex items-center gap-0.5 text-[11px] font-semibold ${isPositive ? 'text-emerald-600' : 'text-red-500'}`}>
              {isPositive ? <TrendingUp size={11} strokeWidth={2.5} /> : <TrendingDown size={11} strokeWidth={2.5} />}
              <span>{Math.abs(trend).toFixed(1)}%</span>
            </div>
          )}
        </div>

        {/* Value */}
        <div
          className="font-mono text-[1.5rem] leading-tight font-extrabold mb-1 truncate"
          style={{ color: PRIMARY, fontFeatureSettings: "'tnum'" }}
        >
          {isNumeric ? formatValue(format === 'pct' ? wert : Math.round(wert), format) : String(wert)}
        </div>

        {/* Mini Area Chart */}
        <div className="flex-1 min-h-[52px] -mx-1">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={monthlyData} margin={{ top: 2, right: 4, bottom: 0, left: 0 }}>
              <defs>
                <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={PRIMARY_LIGHT} stopOpacity={0.25} />
                  <stop offset="95%" stopColor={PRIMARY_LIGHT} stopOpacity={0} />
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
                stroke={PRIMARY_LIGHT}
                strokeWidth={1.75}
                fill={`url(#${gradientId})`}
                dot={false}
                activeDot={{ r: 3.5, fill: PRIMARY_LIGHT, stroke: '#fff', strokeWidth: 1.5 }}
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
