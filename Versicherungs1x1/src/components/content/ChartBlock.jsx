import { useMemo } from 'react';
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, CartesianGrid,
} from 'recharts';

const COLORS = ['#0C4B33', '#86BC25', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#10b981', '#ec4899'];

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-slate-200 rounded-lg p-3 shadow-lg text-xs">
      <div className="font-semibold text-slate-700 mb-1">{label}</div>
      {payload.map((p, i) => (
        <div key={i} className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full" style={{ background: p.color }} />
          <span className="text-slate-600">{p.name}: {p.value}</span>
        </div>
      ))}
    </div>
  );
}

export default function ChartBlock({ block, chapter }) {
  const chartKey = block.chartKey;
  const chartData = chapter?.chartData?.[chartKey];

  const data = useMemo(() => {
    if (!chartData) return [];
    return (chartData.labels || []).map((label, i) => {
      const point = { name: label };
      (chartData.datasets || []).forEach(ds => {
        point[ds.label] = ds.data[i];
      });
      return point;
    });
  }, [chartData]);

  if (!chartData) return null;

  const type = chartData.type || (block.type === 'chartDonut' ? 'doughnut' : block.type === 'chartBar' ? 'bar' : 'line');
  const isStacked = chartData.options?.scales?.x?.stacked || chartData.options?.scales?.y?.stacked;
  const isHorizontal = chartData.options?.indexAxis === 'y';

  return (
    <div className="my-6">
      {block.title && (
        <div className="text-sm font-semibold text-slate-700 mb-3">{block.title}</div>
      )}
      <div className="bg-white border border-slate-200 rounded-xl p-4">
        <ResponsiveContainer width="100%" height={type === 'doughnut' ? 280 : isHorizontal ? Math.max(300, data.length * 40) : 300}>
          {type === 'doughnut' || type === 'pie' ? (
            <PieChart>
              <Pie
                data={(chartData.datasets?.[0]?.data || []).map((val, i) => ({
                  name: chartData.labels?.[i] || '',
                  value: val,
                }))}
                cx="50%"
                cy="50%"
                innerRadius={type === 'doughnut' ? 60 : 0}
                outerRadius={100}
                dataKey="value"
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                labelLine={false}
              >
                {(chartData.datasets?.[0]?.data || []).map((_, i) => (
                  <Cell
                    key={i}
                    fill={chartData.datasets?.[0]?.backgroundColor?.[i] || COLORS[i % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          ) : type === 'bar' ? (
            <BarChart data={data} layout={isHorizontal ? 'vertical' : 'horizontal'}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              {isHorizontal ? (
                <>
                  <XAxis type="number" tick={{ fontSize: 11 }} />
                  <YAxis dataKey="name" type="category" tick={{ fontSize: 11 }} width={100} />
                </>
              ) : (
                <>
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                </>
              )}
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              {(chartData.datasets || []).map((ds, i) => (
                <Bar
                  key={i}
                  dataKey={ds.label}
                  fill={ds.backgroundColor || COLORS[i % COLORS.length]}
                  stackId={isStacked ? 'stack' : undefined}
                  radius={[2, 2, 0, 0]}
                />
              ))}
            </BarChart>
          ) : (
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              {(chartData.datasets || []).map((ds, i) => (
                <Line
                  key={i}
                  type="monotone"
                  dataKey={ds.label}
                  stroke={ds.borderColor || COLORS[i % COLORS.length]}
                  strokeWidth={2}
                  dot={{ r: 3 }}
                />
              ))}
            </LineChart>
          )}
        </ResponsiveContainer>
      </div>
      {block.source && (
        <div className="text-xs text-slate-400 mt-2">Quelle: {block.source}</div>
      )}
    </div>
  );
}
