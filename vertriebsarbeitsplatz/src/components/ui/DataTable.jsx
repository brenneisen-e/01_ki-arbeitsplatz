import { useState } from 'react';
import { clsx } from 'clsx';
import { ChevronUp, ChevronDown } from 'lucide-react';

export default function DataTable({ columns, data, onRowClick, groupBy, renderGroupHeader }) {
  const [sortCol, setSortCol] = useState(null);
  const [sortDir, setSortDir] = useState('asc');

  function handleSort(colId) {
    if (sortCol === colId) {
      setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    } else {
      setSortCol(colId);
      setSortDir('asc');
    }
  }

  let rows = [...data];
  if (sortCol && !groupBy) {
    rows.sort((a, b) => {
      const va = a[sortCol];
      const vb = b[sortCol];
      if (va == null) return 1;
      if (vb == null) return -1;
      const cmp = typeof va === 'number' ? va - vb : String(va).localeCompare(String(vb), 'de');
      return sortDir === 'asc' ? cmp : -cmp;
    });
  }

  // Group rows
  let groups = null;
  if (groupBy) {
    const map = new Map();
    rows.forEach(row => {
      const key = row[groupBy];
      if (!map.has(key)) map.set(key, []);
      map.get(key).push(row);
    });
    groups = Array.from(map.entries());
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden" style={{ boxShadow: 'var(--card-shadow)' }}>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-slate-50">
              {columns.map(col => (
                <th
                  key={col.id}
                  className={clsx(
                    'px-4 py-3 text-left text-xs uppercase tracking-wider font-semibold text-slate-400',
                    col.sortable !== false && 'cursor-pointer select-none hover:text-slate-600'
                  )}
                  style={{ width: col.width }}
                  onClick={() => col.sortable !== false && handleSort(col.id)}
                >
                  <div className="flex items-center gap-1">
                    {col.label}
                    {sortCol === col.id && (
                      sortDir === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {groups ? groups.map(([key, groupRows]) => (
              <GroupRows
                key={key}
                groupKey={key}
                rows={groupRows}
                columns={columns}
                renderGroupHeader={renderGroupHeader}
                onRowClick={onRowClick}
              />
            )) : rows.map((row, i) => (
              <DataRow key={row.id || i} row={row} columns={columns} index={i} onRowClick={onRowClick} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function GroupRows({ groupKey, rows, columns, renderGroupHeader, onRowClick }) {
  return (
    <>
      {renderGroupHeader && (
        <tr className="bg-slate-100 border-t border-slate-200">
          <td colSpan={columns.length} className="px-4 py-3 font-semibold text-sm text-slate-700">
            {renderGroupHeader(groupKey, rows)}
          </td>
        </tr>
      )}
      {rows.map((row, i) => (
        <DataRow key={row.id || i} row={row} columns={columns} index={i} onRowClick={onRowClick} indent />
      ))}
    </>
  );
}

function DataRow({ row, columns, index, onRowClick, indent }) {
  return (
    <tr
      className={clsx(
        'border-t border-slate-100 transition-colors duration-150 row-hover',
        index % 2 === 0 ? 'bg-white' : 'bg-slate-50/50',
        onRowClick && 'cursor-pointer'
      )}
      onClick={() => onRowClick?.(row)}
    >
      {columns.map((col, ci) => (
        <td key={col.id} className={clsx('px-4 py-3 text-sm', ci === 0 && indent && 'pl-8')}>
          {col.render ? col.render(row[col.id], row) : row[col.id]}
        </td>
      ))}
    </tr>
  );
}
