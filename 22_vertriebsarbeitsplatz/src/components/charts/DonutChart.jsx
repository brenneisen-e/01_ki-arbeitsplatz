import { memo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

// Eine Modusfarbe plus Gold, als Tonleiter: Modus-Chartfarbe und Gold in
// hellen und dunklen Stufen, so geordnet, dass benachbarte Segmente in allen
// drei Modi klar auseinanderliegen (OKLab ΔE ≥ 15 je Nachbarpaar); die
// Legende der Aufrufer benennt die Segmente, die Farbe trägt nur die Zuordnung.
const COLORS = [
  'var(--mode-chart)',
  'color-mix(in srgb, var(--mode-accent) 50%, white)',
  'color-mix(in srgb, var(--mode-accent) 60%, black)',
  'color-mix(in srgb, var(--mode-chart) 55%, white)',
  'color-mix(in srgb, var(--mode-chart) 65%, black)',
  'var(--text-tertiary)',
];

function CustomTooltip({ active, payload }) {
  if (!active || !payload?.[0]) return null;
  const d = payload[0];
  return (
    <div className="surface-elevated rounded-lg px-3 py-2 text-sm">
      <div className="font-medium text-(--text-secondary)">{d.name}</div>
      <div className="font-mono text-(--text-primary)">{d.value} ({((d.value / d.payload.total) * 100).toFixed(0)}%)</div>
    </div>
  );
}

export default memo(function DonutChart({ data, height = 250, centerLabel, centerValue, colors = COLORS }) {
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
            stroke="var(--bg-card)"
            strokeWidth={2}
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
          <div className="font-mono text-2xl font-semibold text-(--text-primary)">{centerValue}</div>
          {centerLabel && <div className="text-xs text-(--text-tertiary)">{centerLabel}</div>}
        </div>
      )}
    </div>
  );
});
