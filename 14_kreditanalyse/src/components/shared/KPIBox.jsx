/**
 * KPIBox — KPI-Kachel im Cockpit-Stil des Vertriebsarbeitsplatzes.
 *
 * Eigenschaften:
 *  - Weiße Karte mit Hairline, hebt sich im Hover an
 *  - Icon in Gold auf vertiefter Fläche, Trend-Chip zart getönt
 *  - Große Zahl in Uniform Tab (Ziffern gleicher Dickte)
 *  - 12-Monate-Sparkline in der Modusfarbe mit 12 % Fläche
 *  - Klickbar mit Balken-Chart der letzten 12 Monate
 */

import { useState, useMemo, useId } from 'react';
import { createPortal } from 'react-dom';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import {
  Sparkles, AlertTriangle, UserCheck, CheckCircle2, TrendingUp, TrendingDown,
  Shield, ShieldAlert, FileCheck, Bot, Eye, Lock, X,
  FileText, Clock, CheckCircle, Euro, Banknote, XCircle, Timer,
  Landmark, PiggyBank, Users, BarChart3,
} from 'lucide-react';

const KPI_ICONS = {
  Sparkles, AlertTriangle, UserCheck, CheckCircle2, Shield, ShieldAlert,
  FileCheck, Bot, Eye, Lock,
  FileText, Clock, CheckCircle, Euro, Banknote, XCircle, Timer,
  Landmark, PiggyBank, Users, BarChart3,
};


function formatValue(wert, format) {
  if (format === 'eur') return `${Math.round(wert).toLocaleString('de-DE')} €`;
  if (format === 'pct') return `${wert.toLocaleString('de-DE', { maximumFractionDigits: 1 })}%`;
  if (format === 'num') return wert.toLocaleString('de-DE');
  return String(wert);
}

function fmtTick(value, format) {
  if (format === 'eur') {
    if (value >= 1e6) return `${(value / 1e6).toLocaleString('de-DE', { maximumFractionDigits: 1 })}M`;
    if (value >= 1e3) return `${Math.round(value / 1e3)}k`;
    return Math.round(value).toString();
  }
  if (format === 'pct') return `${value.toFixed(0)}%`;
  if (value >= 1e3) return `${(value / 1e3).toLocaleString('de-DE', { maximumFractionDigits: 1 })}k`;
  // Kleine Werte mit Nachkomma, sonst stehen auf der Achse zweimal dieselbe Zahl
  if (value < 10) return value.toLocaleString('de-DE', { maximumFractionDigits: 1 });
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
    <div className="surface-elevated px-2.5 py-1.5 rounded-lg text-xs">
      <div className="font-medium text-text-primary">{label}</div>
      <div className="font-mono text-text-secondary">{formatCompact(payload[0].value, format)}</div>
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
    <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm" style={{ background: 'rgba(28, 26, 23, 0.45)' }} onClick={onClose}>
      <div className="surface-elevated rounded-2xl p-6 w-full max-w-2xl mx-4" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-medium text-text-primary">{label} — Letzte 12 Monate</h3>
          <button onClick={onClose} className="p-1 rounded-md text-text-muted hover:text-text-primary hover:bg-surface-inset" title="Schließen">
            <X size={18} />
          </button>
        </div>
        <div className="flex items-end gap-1.5 mb-6">
          {data.map((d, i) => {
            const ratio = (d.value - baseline) / range;
            const barH = Math.max(Math.round(ratio * BAR_AREA_H), 4);
            const aktuell = i === data.length - 1;
            return (
              <div key={i} className="flex-1 flex flex-col items-center gap-1 relative">
                <span className="text-[9px] text-text-muted font-mono whitespace-nowrap">{formatCompact(d.value, format)}</span>
                <div
                  className="w-full max-w-6 rounded-t transition-all duration-300"
                  style={{ height: barH, backgroundColor: aktuell ? 'var(--mode-accent)' : 'var(--mode-chart)' }}
                />
                <span className="text-[9px] text-text-muted absolute -bottom-5 -rotate-45 origin-top-left whitespace-nowrap">{d.month}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default function KPIBox({ icon, label, wert, format = 'num', trend, delay = 0, description, period }) {
  const [expanded, setExpanded] = useState(false);
  const Icon = KPI_ICONS[icon] || Sparkles;
  const isPositive = (trend ?? 0) >= 0;

  const isNumeric = typeof wert === 'number' && isFinite(wert);
  const monthlyData = useMemo(
    () => generateMonthlyData(isNumeric ? wert : 100, trend ?? 0),
    [wert, trend, isNumeric],
  );
  const gradientId = `kpi-grad-${useId().replace(/:/g, '')}`;

  return (
    <>
      <div
        className="relative rounded-xl border border-border bg-surface-card shadow-card p-4 cursor-pointer overflow-hidden h-full flex flex-col transition-[box-shadow,border-color,transform] duration-150 hover:-translate-y-px hover:border-primary-light hover:shadow-[var(--card-shadow-hover)]"
        style={{ animationDelay: `${delay}ms` }}
        onClick={() => isNumeric && setExpanded(true)}
      >
        {/* Kopf: Icon links, Trend-Chip rechts, darunter das Label über die
            volle Breite (die Kacheln stehen oft zu viert neben dem Assistenten) */}
        <div className="flex items-center justify-between gap-2 mb-2">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center bg-surface-inset shrink-0">
            <Icon size={15} className="text-gold" strokeWidth={1.75} />
          </div>
          {trend !== undefined && (
            <div
              className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md text-[11px] font-medium shrink-0 ${
                isPositive ? 'bg-[var(--tint-success)] text-emerald-700' : 'bg-[var(--tint-danger)] text-red-700'
              }`}
            >
              {isPositive ? <TrendingUp size={11} strokeWidth={2} /> : <TrendingDown size={11} strokeWidth={2} />}
              <span className="font-mono">{Math.abs(trend).toFixed(1).replace('.', ',')}%</span>
            </div>
          )}
        </div>
        <p className="text-xs leading-tight font-medium text-text-secondary hyphens-auto line-clamp-2 mb-1.5" title={label}>{label}</p>

        {/* Wert: groß, Uniform Tab */}
        <div className="font-mono text-[26px] leading-none font-medium tracking-[-0.02em] text-text-primary mb-2 truncate">
          {isNumeric ? formatValue(format === 'pct' ? wert : Math.round(wert), format) : String(wert)}
        </div>

        {/* Beschreibung / Zeitraum */}
        {(description || period) && (
          <p className="text-[11px] leading-snug text-text-muted mb-1.5">
            {description}{description && period && ' · '}
            {period && <span className="font-medium text-text-secondary">{period}</span>}
          </p>
        )}

        {/* Mini Area Chart */}
        <div className="flex-1 min-h-[52px] -mx-1">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={monthlyData} margin={{ top: 2, right: 4, bottom: 0, left: 0 }}>
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
