/**
 * SparklineChart – A tiny inline sparkline rendered via Recharts.
 * Designed to sit inside table cells or beside metrics.
 *
 * Props:
 *   data    Array<number>  – raw numeric data points
 *   color   string         – stroke color (default: primary #1B2B4B)
 *   width   number         – SVG width in px  (default 80)
 *   height  number         – SVG height in px (default 24)
 */

import { LineChart, Line, ResponsiveContainer } from 'recharts';

export default function SparklineChart({
  data = [],
  color = '#1B2B4B',
  width = 80,
  height = 24,
}) {
  if (!data || data.length === 0) return null;

  const chartData = data.map((v, i) => ({ v, i }));

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
