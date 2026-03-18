import { clsx } from 'clsx';
import * as LucideIcons from 'lucide-react';
import { useEffect, useState, useMemo } from 'react';

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

function Sparkline({ data, color = 'var(--mode-primary-light)' }) {
  const values = data.map(d => d.value);
  const min = Math.min(...values) * 0.95;
  const max = Math.max(...values) * 1.05;
  const range = max - min || 1;
  const w = 120;
  const h = 28;
  const points = values.map((v, i) => {
    const x = (i / (values.length - 1)) * w;
    const y = h - ((v - min) / range) * h;
    return `${x},${y}`;
  }).join(' ');

  return (
    <svg width={w} height={h} className="mt-1">
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
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
            <LucideIcons.X size={18} />
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
  const [displayed, setDisplayed] = useState(0);
  const [expanded, setExpanded] = useState(false);
  const Icon = LucideIcons[icon] || LucideIcons.BarChart3;
  const isPositive = trend >= 0;

  const monthlyData = useMemo(() => generateMonthlyData(wert, trend || 0), [wert, trend]);

  useEffect(() => {
    const duration = 800;
    const steps = 30;
    const stepTime = duration / steps;
    let current = 0;
    const timer = setInterval(() => {
      current++;
      const progress = current / steps;
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplayed(wert * eased);
      if (current >= steps) {
        setDisplayed(wert);
        clearInterval(timer);
      }
    }, stepTime);
    return () => clearInterval(timer);
  }, [wert]);

  return (
    <>
      <div
        className="rounded-xl border border-slate-200 p-5 animate-fade-in-up cursor-pointer card-base card-hover"
        style={{ animationDelay: `${delay}ms` }}
        onClick={() => setExpanded(true)}
      >
        <div className="flex items-center justify-between mb-3">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-slate-100">
            <Icon size={18} style={{ color: 'var(--mode-primary-light)' }} strokeWidth={1.75} />
          </div>
          {trend !== undefined && (
            <span className={clsx('text-xs font-medium', isPositive ? 'text-emerald-600' : 'text-red-500')}>
              {isPositive ? '\u2191' : '\u2193'} {Math.abs(trend).toFixed(1)}%
            </span>
          )}
        </div>
        <div className="font-mono text-2xl font-bold text-slate-900 mb-1 truncate" style={{ fontFeatureSettings: "'tnum'" }}>
          {formatValue(format === 'pct' ? displayed : Math.round(displayed), format)}
        </div>
        <div className="flex items-center justify-between">
          <div className="text-sm text-slate-500">{label}</div>
          <Sparkline data={monthlyData} />
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
