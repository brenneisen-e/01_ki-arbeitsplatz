/**
 * SparklineChart – A tiny inline sparkline rendered via Recharts.
 * Designed to sit inside table cells or beside metrics.
 *
 * Props:
 *   data    Array<number>  – raw numeric data points
 *   color   string         – stroke color (default: Modus-Chartfarbe)
 *   width   number|string  – SVG width in px or "100%" (default 80)
 *   height  number         – SVG height in px (default 24)
 *   filled  boolean        – show area fill under the line (default false)
 */

import { useId } from 'react';
import { LineChart, Line, Area, AreaChart, ResponsiveContainer } from 'recharts';

export default function SparklineChart({
  data = [],
  color = 'var(--mode-chart)',
  width = 80,
  height = 24,
  filled = false,
}) {
  const fillId = `spark-${useId().replace(/:/g, '')}`;
  if (!data || data.length === 0) return null;

  const chartData = data.map((v, i) => ({ v, i }));

  if (filled) {
    return (
      <div style={{ width: width === '100%' ? '100%' : width, height }} className="inline-block align-middle">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 2, right: 2, bottom: 0, left: 2 }}>
            <defs>
              <linearGradient id={fillId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={color} stopOpacity={0.12} />
                <stop offset="100%" stopColor={color} stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <Area
              type="monotone"
              dataKey="v"
              stroke={color}
              strokeWidth={2}
              fill={`url(#${fillId})`}
              dot={false}
              isAnimationActive={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    );
  }

  return (
    <div style={{ width, height }} className="inline-block align-middle">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData}>
          <Line
            type="monotone"
            dataKey="v"
            stroke={color}
            strokeWidth={1.5}
            dot={false}
            isAnimationActive={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
