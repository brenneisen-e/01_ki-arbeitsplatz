export default function ComparisonTable({ block }) {
  const rawCols = block.columns || [];
  const rows = block.rows || [];
  const highlight = block.highlightColumn || null;

  const columns = typeof rawCols[0] === 'string'
    ? rawCols.map((s, i) => ({ key: i, label: s }))
    : rawCols;

  return (
    <div className="my-6">
      {block.title && (
        <h3 className="text-base font-bold text-slate-900 mb-3">{block.title}</h3>
      )}
      <div className="overflow-x-auto rounded-lg border border-slate-200">
        <table className="comparison-table">
          <thead>
            <tr>
              {columns.map((col, i) => (
                <th key={i} className={col.key === highlight ? 'highlight-col' : ''}>
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, ri) => (
              <tr key={ri} className={ri % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
                {columns.map((col, ci) => {
                  const val = Array.isArray(row) ? row[col.key] : row[col.key];
                  return (
                    <td key={ci} className={col.key === highlight ? 'highlight-col' : ''}>
                      {val !== undefined ? String(val) : ''}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
