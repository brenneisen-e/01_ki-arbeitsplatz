import { useMemo } from 'react';
import { clsx } from 'clsx';
import {
  TrendingUp, TrendingDown, Maximize2, Target,
  BarChart3, Banknote, Wallet, Percent, Layers, Activity, Scale, PieChart,
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, ResponsiveContainer, Tooltip, ReferenceLine,
} from 'recharts';
import {
  KPI_VALUES, buildHistory, fmtVal, fmtCompact,
  deviationPct, ampelColor, AMPEL_COLORS,
} from '../data/kpiData';

const KPI_ICONS = {
  neugeschaeft:       Banknote,
  neugeschaeftsmarge: Percent,
  aktivvolumen:       BarChart3,
  aktivmarge:         Percent,
  einlagenvolumen:    Wallet,
  einlagenmarge:      Percent,
  rwa:                Scale,
  rwaProd:            Activity,
  roRac:              PieChart,
  cir:                Layers,
};

function ChartTooltip({ active, payload, label, unit }) {
  if (!active || !payload?.length) return null;
  const ist = payload.find((p) => p.dataKey === 'ist');
  const plan = payload.find((p) => p.dataKey === 'plan');
  return (
    <div className="bg-white px-3 py-2 rounded-lg shadow-lg border border-slate-200 text-xs">
      <div className="font-medium text-slate-700 mb-1">{label}</div>
      {ist && (
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-blue-500" />
          <span className="text-slate-500">Ist:</span>
          <span className="font-mono font-semibold text-slate-800">
            {fmtCompact(ist.value, unit)}
          </span>
        </div>
      )}
      {plan && (
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-slate-400" />
          <span className="text-slate-500">Plan:</span>
          <span className="font-mono font-semibold text-slate-600">
            {fmtCompact(plan.value, unit)}
          </span>
        </div>
      )}
    </div>
  );
}

export default function KPICard({ kpi, segmentId, segmentLabel, bank, onExpand, delay = 0 }) {
  const cell = KPI_VALUES[kpi.id]?.[segmentId];
  const history = useMemo(() => buildHistory(kpi.id, segmentId), [kpi.id, segmentId]);
  if (!cell) return null;

  const dev = deviationPct(cell.ist, cell.plan, kpi.invertTrend);
  const ampel = ampelColor(cell.ist, cell.plan, kpi.invertTrend);
  const ampelCfg = AMPEL_COLORS[ampel];
  const Icon = KPI_ICONS[kpi.id] || BarChart3;

  // Trend vs. vorletzten Monat
  const last = history[history.length - 1]?.ist ?? cell.ist;
  const prev = history[history.length - 2]?.ist ?? last;
  const trend = prev !== 0 ? ((last - prev) / Math.abs(prev)) * 100 : 0;
  const trendGood = kpi.invertTrend ? trend <= 0 : trend >= 0;

  return (
    <div
      className="bg-white rounded-2xl border border-slate-200 p-5 flex flex-col animate-fade-in-up group relative overflow-hidden hover:-translate-y-0.5 hover:shadow-lg transition-all duration-200"
      style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.06)', minHeight: 320, animationDelay: delay + 'ms' }}
    >
      <div
        className="absolute top-0 left-0 right-0 h-1 rounded-t-2xl opacity-0 group-hover:opacity-100 transition-opacity"
        style={{ background: bank.gradient }}
      />

      {/* Header */}
      <div className="flex items-start justify-between mb-1 gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <Icon size={16} className="text-slate-400 shrink-0" strokeWidth={1.75} />
          <span className="text-sm font-semibold text-slate-800 truncate">{kpi.label}</span>
        </div>
        <span
          className="text-[11px] px-2 py-0.5 rounded-full font-semibold whitespace-nowrap shrink-0 flex items-center gap-1"
          style={{ background: ampelCfg.bg, color: ampelCfg.text }}
        >
          <span className="w-1.5 h-1.5 rounded-full" style={{ background: ampelCfg.dot }} />
          {ampel === 'green' ? 'im Plan' : ampel === 'yellow' ? 'unter Plan' : 'kritisch'}
        </span>
      </div>
      <div className="text-[11px] text-slate-400 mb-3">{segmentLabel} · gem. XYZ-Meldung</div>

      {/* Value */}
      <div
        className="font-mono text-[1.9rem] font-extrabold leading-tight mb-1"
        style={{ color: bank.primary }}
      >
        {fmtVal(cell.ist, kpi.unit)}
      </div>
      <div className="flex items-center justify-between mb-3 text-xs">
        <div className="flex items-center gap-1 text-slate-500">
          <Target size={12} strokeWidth={1.75} />
          <span>Plan: {fmtVal(cell.plan, kpi.unit)}</span>
        </div>
        {dev !== null && (
          <div className={clsx('flex items-center gap-1 font-medium', ampel === 'green' ? 'text-emerald-600' : 'text-red-500')}>
            {dev >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
            <span>
              {dev >= 0 ? '+' : ''}
              {dev.toLocaleString('de-DE', { minimumFractionDigits: 1, maximumFractionDigits: 2 })} %
              <span className="text-slate-400 ml-1">vs. Plan</span>
            </span>
          </div>
        )}
      </div>

      {/* Chart */}
      <div className="flex-1 -ml-1 -mr-1" style={{ minHeight: 120 }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={history} margin={{ top: 6, right: 6, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id={`grad-${kpi.id}-${segmentId}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={bank.primary} stopOpacity={0.35} />
                <stop offset="100%" stopColor={bank.primary} stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis
              dataKey="month"
              tick={{ fontSize: 10, fill: '#94a3b8' }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis hide domain={['auto', 'auto']} />
            <Tooltip content={<ChartTooltip unit={kpi.unit} />} cursor={{ stroke: '#e2e8f0' }} />
            <ReferenceLine
              y={cell.plan}
              stroke="#94a3b8"
              strokeDasharray="4 4"
              strokeWidth={1}
            />
            <Area
              type="monotone"
              dataKey="ist"
              stroke={bank.primary}
              strokeWidth={2.5}
              fill={`url(#grad-${kpi.id}-${segmentId})`}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100">
        <div className={clsx('flex items-center gap-1 text-[11px] font-medium', trendGood ? 'text-emerald-600' : 'text-red-500')}>
          {trendGood ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
          <span>{Math.abs(trend).toLocaleString('de-DE', { maximumFractionDigits: 1 })}% vs. Vormonat</span>
        </div>
        {onExpand && (
          <button
            onClick={() => onExpand({ kpi, segmentId, segmentLabel, history, cell })}
            className="text-slate-400 hover:text-slate-700 transition-colors"
            title="Details"
          >
            <Maximize2 size={14} strokeWidth={1.75} />
          </button>
        )}
      </div>
    </div>
  );
}
