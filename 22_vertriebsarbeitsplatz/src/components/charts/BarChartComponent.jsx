import { memo } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
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
 * Säulen in der Modus-Chartfarbe: höchstens 24 px breit, 4 px Rundung oben,
 * waagerechte Hairlines, Achsen in --chart-axis, Tooltip als Popover.
 */
export default memo(function BarChartComponent({ data, dataKey = 'value', xKey = 'name', height = 250, color }) {
  const fillColor = color || 'var(--mode-chart)';

  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} margin={{ top: 5, right: 5, bottom: 5, left: 5 }}>
        <CartesianGrid vertical={false} stroke="var(--chart-grid)" />
        <XAxis dataKey={xKey} tick={{ fontSize: 11, fill: 'var(--chart-axis)' }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fontSize: 11, fill: 'var(--chart-axis)' }} axisLine={false} tickLine={false} />
        <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(28, 26, 23, 0.04)' }} />
        <Bar
          dataKey={dataKey}
          fill={fillColor}
          radius={[4, 4, 0, 0]}
          maxBarSize={24}
          animationDuration={800}
          animationEasing="ease-out"
        />
      </BarChart>
    </ResponsiveContainer>
  );
});
