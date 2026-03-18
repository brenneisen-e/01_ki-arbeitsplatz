import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { getLang } from '../../utils/langHelper';

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.[0]) return null;
  return (
    <div className="bg-white px-3 py-2 rounded-lg shadow-lg border border-slate-200 text-sm">
      <div className="font-medium text-slate-700">{label}</div>
      <div className="text-slate-500">{payload[0].value.toLocaleString(getLang() === 'en' ? 'en-US' : 'de-DE')}</div>
    </div>
  );
}

import { memo } from 'react';

export default memo(function LineChartComponent({ data, dataKey = 'value', xKey = 'name', height = 250, color }) {
  const strokeColor = color || 'var(--mode-primary-light)';
  const gradientId = `area-gradient-${dataKey}`;

  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={data} margin={{ top: 5, right: 5, bottom: 5, left: 5 }}>
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={strokeColor} stopOpacity={0.15} />
            <stop offset="95%" stopColor={strokeColor} stopOpacity={0} />
          </linearGradient>
        </defs>
        <XAxis dataKey={xKey} tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
        <Tooltip content={<CustomTooltip />} />
        <Area
          type="monotone"
          dataKey={dataKey}
          stroke={strokeColor}
          strokeWidth={2.5}
          fill={`url(#${gradientId})`}
          dot={false}
          activeDot={{ r: 5, fill: strokeColor, stroke: '#fff', strokeWidth: 2 }}
          animationDuration={800}
          animationEasing="ease-out"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
});
