export default function PipelineBar({ segments }) {
  const total = segments.reduce((s, seg) => s + seg.count, 0);
  if (total === 0) return null;

  return (
    <div className="w-full">
      <div className="flex h-10 rounded-lg overflow-hidden">
        {segments.map((seg, i) => {
          const pct = (seg.count / total) * 100;
          if (pct === 0) return null;
          return (
            <div
              key={seg.label}
              className="flex items-center justify-center text-white text-xs font-bold transition-all duration-500 relative group"
              style={{
                width: `${pct}%`,
                backgroundColor: seg.color,
                borderRadius: i === 0 ? '8px 0 0 8px' : i === segments.length - 1 ? '0 8px 8px 0' : '0',
              }}
            >
              {pct > 8 && <span>{seg.count}</span>}
              <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-white text-slate-700 text-xs px-3 py-1.5 rounded-lg shadow-lg border border-slate-200 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                {seg.label}: {seg.count} ({pct.toFixed(0)}%)
              </div>
            </div>
          );
        })}
      </div>
      <div className="flex mt-2">
        {segments.map(seg => {
          const pct = (seg.count / total) * 100;
          if (pct === 0) return null;
          return (
            <div key={seg.label} className="text-xs text-slate-500 text-center" style={{ width: `${pct}%` }}>
              {seg.label}
            </div>
          );
        })}
      </div>
    </div>
  );
}
