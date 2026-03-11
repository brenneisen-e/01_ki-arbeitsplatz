import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

const COLORS = ['#3b82f6', '#10b981', '#8b5cf6', '#f59e0b', '#ec4899', '#6b7280'];

function CustomTooltip({ active, payload }) {
  if (!active || !payload?.[0]) return null;
  const d = payload[0];
  return (
    <div className="bg-white px-3 py-2 rounded-lg shadow-lg border border-slate-200 text-sm">
      <div className="font-medium text-slate-700">{d.name}</div>
      <div className="text-slate-500">{d.value} ({((d.value / d.payload.total) * 100).toFixed(0)}%)</div>
    </div>
  );
}

export default function DonutChart({ data, height = 250, centerLabel, centerValue, colors = COLORS }) {
  const total = data.reduce((s, d) => s + d.value, 0);
  const enriched = data.map(d => ({ ...d, total }));

  return (
    <div className="relative" style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={enriched}
            cx="50%"
            cy="50%"
            innerRadius="60%"
            outerRadius="85%"
            paddingAngle={2}
            dataKey="value"
            animationDuration={800}
            animationEasing="ease-out"
          >
            {enriched.map((_, i) => (
              <Cell key={i} fill={colors[i % colors.length]} className="transition-opacity hover:opacity-80" />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
        </PieChart>
      </ResponsiveContainer>
      {centerValue !== undefined && (
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <div className="font-mono text-2xl font-bold text-slate-900">{centerValue}</div>
          {centerLabel && <div className="text-xs text-slate-500">{centerLabel}</div>}
        </div>
      )}
    </div>
  );
}
