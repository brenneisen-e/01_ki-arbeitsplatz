export default function HeatmapGrid({ block }) {
  const rows = block.rows || [];
  const cols = block.columns || [];
  const data = block.data || [];

  return (
    <div className="my-6">
      {block.title && (
        <h3 className="text-base font-bold text-slate-900 mb-3">{block.title}</h3>
      )}
      {block.source && (
        <div className="text-xs text-slate-400 mb-2">Quelle: {block.source}</div>
      )}
      <div className="overflow-x-auto rounded-lg border border-slate-200">
        <table className="w-full border-collapse text-xs">
          <thead>
            <tr>
              <th className="p-2 bg-slate-50 text-left font-semibold text-slate-600 border-b border-slate-200" />
              {cols.map((col, i) => (
                <th key={i} className="p-2 bg-slate-50 text-center font-semibold text-slate-600 border-b border-slate-200">
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, ri) => (
              <tr key={ri}>
                <td className="p-2 font-medium text-slate-700 bg-slate-50 border-r border-slate-200 whitespace-nowrap">
                  {row}
                </td>
                {(data[ri] || []).map((val, ci) => {
                  const intensity = val / 100;
                  const bg = `rgba(37,99,235,${(intensity * 0.8 + 0.05).toFixed(2)})`;
                  const color = intensity > 0.4 ? 'white' : '#111827';
                  return (
                    <td key={ci} className="heatmap-cell" style={{ background: bg, color }} title={`${val}%`}>
                      {val}%
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="flex items-center gap-2 mt-2">
        <span className="text-xs text-slate-500">Intensität:</span>
        <div className="w-24 h-2 rounded" style={{
          background: 'linear-gradient(to right, rgba(37,99,235,0.05), rgba(37,99,235,0.85))'
        }} />
        <span className="text-[10px] text-slate-400">niedrig → hoch</span>
      </div>
    </div>
  );
}
