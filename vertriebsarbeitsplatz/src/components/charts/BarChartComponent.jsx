import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
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

export default function BarChartComponent({ data, dataKey = 'value', xKey = 'name', height = 250, color }) {
  const fillColor = color || 'var(--mode-primary-light)';

  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} margin={{ top: 5, right: 5, bottom: 5, left: 5 }}>
        <XAxis dataKey={xKey} tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
        <Tooltip content={<CustomTooltip />} />
        <Bar
          dataKey={dataKey}
          fill={fillColor}
          radius={[6, 6, 0, 0]}
          barSize={32}
          animationDuration={800}
          animationEasing="ease-out"
        />
      </BarChart>
    </ResponsiveContainer>
  );
}
