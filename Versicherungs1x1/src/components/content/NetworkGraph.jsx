import { useMemo } from 'react';

const TYPE_COLORS = {
  aufsicht: '#EF4444', verband: '#2563EB', verbraucher: '#8B5CF6',
  schlichtung: '#10B981', rating: '#F59E0B', sicherung: '#6B7280',
};
const TYPE_LABELS = {
  aufsicht: 'Aufsicht', verband: 'Verband', verbraucher: 'Verbraucher',
  schlichtung: 'Schlichtung', rating: 'Rating', sicherung: 'Sicherung',
};

export default function NetworkGraph({ block, chapter }) {
  const chartData = chapter?.chartData?.[block.chartKey];

  const svg = useMemo(() => {
    if (!chartData) return null;
    const nodes = chartData.nodes || [];
    const links = chartData.links || [];
    const W = 640, H = 400;

    const positions = {};
    nodes.forEach((node, i) => {
      const angle = (i / nodes.length) * 2 * Math.PI - Math.PI / 2;
      const r = H * 0.35;
      positions[node.id] = { x: W / 2 + r * Math.cos(angle), y: H / 2 + r * Math.sin(angle) };
    });

    return (
      <svg width="100%" viewBox={`0 0 ${W} ${H}`}>
        {links.map((link, i) => {
          const src = positions[link.source];
          const tgt = positions[link.target];
          if (!src || !tgt) return null;
          return <line key={i} x1={src.x} y1={src.y} x2={tgt.x} y2={tgt.y} stroke="#E5E7EB" strokeWidth="1.5" />;
        })}
        {nodes.map((node) => {
          const pos = positions[node.id];
          if (!pos) return null;
          const color = TYPE_COLORS[node.type] || '#6B7280';
          return (
            <g key={node.id}>
              <circle cx={pos.x} cy={pos.y} r="18" fill={color} opacity="0.15" stroke={color} strokeWidth="2" />
              <text x={pos.x} y={pos.y - 24} textAnchor="middle" fontSize="11" fontWeight="600" fill="#111827">{node.label}</text>
            </g>
          );
        })}
      </svg>
    );
  }, [chartData]);

  if (!chartData) return null;

  return (
    <div className="my-6">
      {block.title && (
        <h3 className="text-base font-bold text-slate-900 mb-3">{block.title}</h3>
      )}
      {svg}
      <div className="network-legend">
        {Object.entries(TYPE_COLORS).map(([type, color]) => (
          <span key={type} className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ background: color }} />
            {TYPE_LABELS[type] || type}
          </span>
        ))}
      </div>
    </div>
  );
}
