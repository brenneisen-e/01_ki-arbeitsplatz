import { Briefcase, TrendingUp, AlertTriangle, Target, Users, Landmark, PiggyBank, Wallet, BarChart3, X } from 'lucide-react';
import { useState, useMemo } from 'react';

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

function generateMonthlyData(currentValue, trend) {
  const loc = getLang() === 'en' ? 'en-US' : 'de-DE';
  const now = new Date();
  const data = [];
  for (let i = 11; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const monthLabel = d.toLocaleDateString(loc, { month: 'short', year: '2-digit' });
    const factor = 1 - ((trend / 100) * (i / 11));
    // Very subtle noise (~0.5%) for realistic AuM progression
    const noise = 1 + (Math.sin(i * 2.7 + currentValue * 0.001) * 0.005);
    data.push({ month: monthLabel, value: Math.round(currentValue * factor * noise) });
  }
  return data;
}

function formatAxisLabel(value, format) {
  if (format === 'eur') {
    if (value >= 1e6) return `${(value / 1e6).toFixed(1)}M`;
    if (value >= 1e3) return `${Math.round(value / 1e3)}k`;
    return Math.round(value).toString();
  }
  if (format === 'pct') return `${value.toFixed(1)}%`;
  if (format === 'num') {
    if (value >= 1e3) return `${(value / 1e3).toFixed(1)}k`;
    return Math.round(value).toString();
  }
  return String(Math.round(value));
}

function ChartWithAxes({ data, color = 'var(--mode-primary-light)', format = 'num', gradientId }) {
  const values = data.map(d => d.value);
  const min = Math.min(...values) * 0.98;
  const max = Math.max(...values) * 1.02;
  const range = max - min || 1;
  const mid = (min + max) / 2;

  const w = 260;
  const h = 88;
  const padL = 36;
  const padR = 8;
  const padT = 6;
  const padB = 18;
  const plotW = w - padL - padR;
  const plotH = h - padT - padB;

  const points = values.map((v, i) => {
    const x = padL + (i / (values.length - 1)) * plotW;
    const y = padT + (1 - (v - min) / range) * plotH;
    return { x, y };
  });

  const linePath = points
    .map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x.toFixed(1)},${p.y.toFixed(1)}`)
    .join(' ');

  const areaPath =
    `${linePath} L${points[points.length - 1].x.toFixed(1)},${(padT + plotH).toFixed(1)} ` +
    `L${padL.toFixed(1)},${(padT + plotH).toFixed(1)} Z`;

  const yTicks = [max, mid, min];
  const xTickIndices = [0, Math.floor((values.length - 1) / 2), values.length - 1];
  const last = points[points.length - 1];

  return (
    <svg width="100%" viewBox={`0 0 ${w} ${h}`} className="block overflow-visible">
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity={0.35} />
          <stop offset="100%" stopColor={color} stopOpacity={0} />
        </linearGradient>
      </defs>

      {/* Horizontal gridlines */}
      {yTicks.map((v, i) => {
        const y = padT + (1 - (v - min) / range) * plotH;
        return (
          <line
            key={`g${i}`}
            x1={padL}
            y1={y}
            x2={padL + plotW}
            y2={y}
            stroke="#e2e8f0"
            strokeWidth={1}
            strokeDasharray={i === yTicks.length - 1 ? '0' : '2 3'}
          />
        );
      })}

      {/* Y-axis */}
      <line x1={padL} y1={padT} x2={padL} y2={padT + plotH} stroke="#cbd5e1" strokeWidth={1} />

      {/* X-axis */}
      <line x1={padL} y1={padT + plotH} x2={padL + plotW} y2={padT + plotH} stroke="#cbd5e1" strokeWidth={1} />

      {/* Y-axis labels */}
      {yTicks.map((v, i) => {
        const y = padT + (1 - (v - min) / range) * plotH;
        return (
          <text
            key={`yl${i}`}
            x={padL - 5}
            y={y}
            textAnchor="end"
            dominantBaseline="middle"
            fontSize="9"
            fill="#94a3b8"
            fontFamily="'JetBrains Mono', monospace"
          >
            {formatAxisLabel(v, format)}
          </text>
        );
      })}

      {/* X-axis labels */}
      {xTickIndices.map((idx) => {
        const x = padL + (idx / (values.length - 1)) * plotW;
        return (
          <text
            key={`xl${idx}`}
            x={x}
            y={h - 4}
            textAnchor={idx === 0 ? 'start' : idx === values.length - 1 ? 'end' : 'middle'}
            fontSize="9"
            fill="#94a3b8"
            fontFamily="'DM Sans', sans-serif"
          >
            {data[idx].month}
          </text>
        );
      })}

      {/* Area fill */}
      <path d={areaPath} fill={`url(#${gradientId})`} />

      {/* Line */}
      <path
        d={linePath}
        fill="none"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* End dot with pulse */}
      <circle cx={last.x} cy={last.y} r={5} fill={color} opacity={0.25}>
        <animate attributeName="r" from="4" to="8" dur="1.6s" repeatCount="indefinite" />
        <animate attributeName="opacity" from="0.4" to="0" dur="1.6s" repeatCount="indefinite" />
      </circle>
      <circle cx={last.x} cy={last.y} r={3.2} fill={color} stroke="white" strokeWidth={1.5} />
    </svg>
  );
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

function ExpandedChart({ data, format, label, onClose }) {
  const values = data.map(d => d.value);
  const max = Math.max(...values);
  const min = Math.min(...values);
  const baseline = min > 0 ? min * 0.9 : 0;
  const range = (max - baseline) * 1.1 || 1;
  const BAR_AREA_H = 180; // fixed pixel height for bars

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
  const gradientId = useMemo(() => `spark-grad-${Math.random().toString(36).slice(2, 10)}`, []);

  return (
    <>
      <div
        className="relative rounded-2xl border border-slate-200 bg-white p-5 animate-fade-in-up cursor-pointer card-base card-hover overflow-hidden group"
        style={{ animationDelay: `${delay}ms` }}
        onClick={() => setExpanded(true)}
      >
        {/* Subtle top gradient accent */}
        <div
          className="absolute top-0 left-0 right-0 h-1 opacity-80"
          style={{ background: 'linear-gradient(90deg, var(--mode-primary-light), var(--mode-primary))' }}
        />

        {/* Header: icon + trend */}
        <div className="flex items-start justify-between mb-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center shadow-sm kpi-icon-box"
            style={{
              background: 'linear-gradient(135deg, var(--mode-primary-light), var(--mode-primary))',
            }}
          >
            <Icon size={20} className="text-white" strokeWidth={2} />
          </div>
          {trend !== undefined && (
            <div
              className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold"
              style={{
                backgroundColor: isPositive ? '#ecfdf5' : '#fef2f2',
                color: isPositive ? '#059669' : '#dc2626',
              }}
            >
              <span>{isPositive ? '↑' : '↓'}</span>
              <span>{Math.abs(trend).toFixed(1)}%</span>
            </div>
          )}
        </div>

        {/* Value */}
        <div
          className="font-mono text-[1.75rem] leading-tight font-extrabold mb-0.5 truncate kpi-value"
          style={{ color: 'var(--_fg, #0f172a)', fontFeatureSettings: "'tnum'", animationDelay: `${delay}ms` }}
        >
          {formatValue(format === 'pct' ? wert : Math.round(wert), format)}
        </div>

        {/* Label */}
        <div className="text-xs font-medium uppercase tracking-wider mb-3" style={{ color: 'var(--_fg, #64748b)' }}>
          {label}
        </div>

        {/* Chart with axes */}
        <div className="mt-2">
          <ChartWithAxes
            data={monthlyData}
            color="var(--mode-primary-light)"
            format={format}
            gradientId={gradientId}
          />
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
