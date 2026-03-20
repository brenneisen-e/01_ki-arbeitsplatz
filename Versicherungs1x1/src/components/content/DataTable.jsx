import { useState, useCallback } from 'react';
import { ChevronDown } from '../ui/Icons';

export default function DataTable({ block }) {
  const headers = block.headers || block.columns || [];
  const [sortCol, setSortCol] = useState(null);
  const [sortAsc, setSortAsc] = useState(true);

  const handleSort = useCallback((colIdx) => {
    if (!block.sortable) return;
    if (sortCol === colIdx) {
      setSortAsc(prev => !prev);
    } else {
      setSortCol(colIdx);
      setSortAsc(true);
    }
  }, [block.sortable, sortCol]);

  let rows = block.rows || [];
  if (sortCol !== null && block.sortable) {
    rows = [...rows].sort((a, b) => {
      const va = a[sortCol] || '';
      const vb = b[sortCol] || '';
      const na = parseFloat(va.replace(/[^0-9.,\-]/g, '').replace(',', '.'));
      const nb = parseFloat(vb.replace(/[^0-9.,\-]/g, '').replace(',', '.'));
      if (!isNaN(na) && !isNaN(nb)) return sortAsc ? na - nb : nb - na;
      return sortAsc ? va.localeCompare(vb) : vb.localeCompare(va);
    });
  }

  return (
    <div className="my-4">
      {(block.title || block.caption) && (
        <div className="text-sm font-semibold text-slate-700 mb-2">{block.title || block.caption}</div>
      )}
      <div className="overflow-x-auto rounded-lg border border-slate-200">
        <table className="v-table">
          <thead>
            <tr>
              {headers.map((h, i) => (
                <th
                  key={i}
                  className={block.sortable ? 'sortable' : ''}
                  onClick={() => handleSort(i)}
                >
                  <span className="flex items-center gap-1">
                    {h}
                    {sortCol === i && (
                      <ChevronDown className={`w-3 h-3 transition ${sortAsc ? '' : 'rotate-180'}`} />
                    )}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, ri) => (
              <tr key={ri}>
                {row.map((cell, ci) => (
                  <td key={ci}>{cell}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
