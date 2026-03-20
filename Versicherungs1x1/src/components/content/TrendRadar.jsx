import { useMemo } from 'react';

const RING_COLORS = ['#10B981', '#2563EB', '#F59E0B', '#EF4444'];
const RING_BG = ['rgba(16,185,129,0.1)', 'rgba(37,99,235,0.1)', 'rgba(245,158,11,0.1)', 'rgba(239,68,68,0.1)'];

export default function TrendRadar({ block, chapter }) {
  const chartData = chapter?.chartData?.[block.chartKey];

  const svg = useMemo(() => {
    if (!chartData) return null;
    const rings = chartData.rings || ['Adopt', 'Trial', 'Assess', 'Hold'];
    const segments = chartData.segments || [];
    const items = chartData.items || [];
    const W = 500, H = 500;
    const cx = W / 2, cy = H / 2, maxR = W * 0.43;
    const numSeg = segments.length;
    const segAngle = numSeg > 0 ? (2 * Math.PI / numSeg) : (2 * Math.PI);

    return (
      <svg width="100%" viewBox={`0 0 ${W} ${H}`} className="max-w-[500px] mx-auto block">
        {/* Rings */}
        {rings.map((ring, ri) => {
          const r = maxR * ((rings.length - ri) / rings.length);
          return (
            <g key={ri}>
              <circle cx={cx} cy={cy} r={r} fill={RING_BG[ri]} stroke={RING_COLORS[ri]} strokeWidth="1.5" strokeDasharray="4,2" />
              <text x={cx} y={cy - r + 14} textAnchor="middle" fontSize="10" fill={RING_COLORS[ri]} fontWeight="600">{ring}</text>
            </g>
          );
        })}
        {/* Segment dividers */}
        {segments.map((seg, si) => {
          const angle = (si / numSeg) * 2 * Math.PI - Math.PI / 2;
          const midAngle = ((si + 0.5) / numSeg) * 2 * Math.PI - Math.PI / 2;
          const labelR = maxR + 20;
          return (
            <g key={si}>
              <line x1={cx} y1={cy} x2={cx + maxR * Math.cos(angle)} y2={cy + maxR * Math.sin(angle)} stroke="#E5E7EB" strokeWidth="1" />
              <text x={cx + labelR * Math.cos(midAngle)} y={cy + labelR * Math.sin(midAngle) + 4} textAnchor="middle" fontSize="9" fill="#6B7280" fontWeight="500">{seg}</text>
            </g>
          );
        })}
        {/* Items */}
        {items.map((item, ii) => {
          const seg = item.segment || 0;
          const ring = item.ring ?? 2;
          const r = maxR * ((rings.length - ring - 0.5) / rings.length);
          const baseAngle = (seg / numSeg) * 2 * Math.PI - Math.PI / 2;
          const spread = baseAngle + (segAngle * 0.2) + (ii % 3) * (segAngle * 0.25);
          const jitter = (ii * 37 % 20 - 10) / maxR;
          const x = cx + (r + jitter) * Math.cos(spread);
          const y = cy + (r + jitter) * Math.sin(spread);
          return (
            <circle key={ii} cx={x} cy={y} r="5" fill={RING_COLORS[ring] || '#6B7280'} stroke="white" strokeWidth="1.5">
              <title>{item.label}</title>
            </circle>
          );
        })}
      </svg>
    );
  }, [chartData]);

  if (!chartData) return null;

  const rings = chartData.rings || ['Adopt', 'Trial', 'Assess', 'Hold'];
  const items = chartData.items || [];

  // Group items by ring
  const grouped = {};
  items.forEach(item => {
    const ring = item.ring ?? 2;
    const label = rings[ring] || 'Unknown';
    if (!grouped[label]) grouped[label] = [];
    grouped[label].push(item);
  });

  return (
    <div className="my-6">
      {block.title && (
        <h3 className="text-base font-bold text-slate-900 mb-3">{block.title}</h3>
      )}
      {svg}
      <div className="flex justify-center gap-3 mt-3">
        {rings.map((r, i) => (
          <span key={i} className={`tr-ring ${r.toLowerCase()}`}>{r}</span>
        ))}
      </div>
      {/* Items list */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
        {Object.entries(grouped).map(([ringLabel, groupItems]) => (
          <div key={ringLabel}>
            <div className={`tr-ring ${ringLabel.toLowerCase()} mb-2`}>{ringLabel}</div>
            {groupItems.map((item, i) => (
              <div key={i} className="text-xs text-slate-600 mb-1">
                <strong className="text-slate-800">{item.label}</strong> — {item.description}
              </div>
            ))}
          </div>
        ))}
      </div>
      {block.source && <div className="text-xs text-slate-400 mt-2">Quelle: {block.source}</div>}
    </div>
  );
}
