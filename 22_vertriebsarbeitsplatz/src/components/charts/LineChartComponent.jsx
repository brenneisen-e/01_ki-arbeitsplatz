import { memo, useId } from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { getLang } from '../../utils/langHelper';

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.[0]) return null;
  return (
    <div className="surface-elevated rounded-lg px-3 py-2 text-sm">
      <div className="font-medium text-(--text-secondary)">{label}</div>
      <div className="font-mono text-(--text-primary)">{payload[0].value.toLocaleString(getLang() === 'en' ? 'en-US' : 'de-DE')}</div>
    </div>
  );
}

/**
 * Linie 2 px in der Modus-Chartfarbe mit 12-%-Fläche, Punkte 8 px mit
 * weißem Ring, waagerechte Hairlines, Achsen in --chart-axis.
 */
export default memo(function LineChartComponent({ data, dataKey = 'value', xKey = 'name', height = 250, color }) {
  const strokeColor = color || 'var(--mode-chart)';
  const gradientId = `area-gradient-${useId().replace(/:/g, '')}`;

  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={data} margin={{ top: 5, right: 5, bottom: 5, left: 5 }}>
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={strokeColor} stopOpacity={0.12} />
            <stop offset="100%" stopColor={strokeColor} stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid vertical={false} stroke="var(--chart-grid)" />
        <XAxis dataKey={xKey} tick={{ fontSize: 11, fill: 'var(--chart-axis)' }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fontSize: 11, fill: 'var(--chart-axis)' }} axisLine={false} tickLine={false} />
        <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'var(--border-strong)', strokeWidth: 1 }} />
        <Area
          type="monotone"
          dataKey={dataKey}
          stroke={strokeColor}
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          fill={`url(#${gradientId})`}
          dot={false}
          activeDot={{ r: 4, fill: strokeColor, stroke: 'var(--bg-card)', strokeWidth: 2 }}
          animationDuration={800}
          animationEasing="ease-out"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
});
