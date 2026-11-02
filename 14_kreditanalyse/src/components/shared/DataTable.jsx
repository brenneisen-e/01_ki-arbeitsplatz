/**
 * DataTable – A reusable, client-side sortable table with striped rows,
 * hover highlighting, and optional row-click behaviour.
 *
 * Props:
 *   columns       Array<{ key, label, render?, align?, sortable? }>
 *   data          Array<object>
 *   onRowClick    (row) => void           – optional click handler
 *   emptyMessage  string                  – placeholder when data is empty
 */

import { useState, useMemo, useCallback } from 'react';
import { ChevronUp, ChevronDown } from 'lucide-react';

const alignmentClasses = {
  left:   'text-left',
  center: 'text-center',
  right:  'text-right',
};

export default function DataTable({
  columns,
  data,
  onRowClick,
  emptyMessage = 'Keine Daten vorhanden',
}) {
  const [sortKey, setSortKey] = useState(null);
  const [sortDir, setSortDir] = useState('asc');

  // Toggle sort when a sortable column header is clicked.
  const handleSort = useCallback(
    (key) => {
      if (sortKey === key) {
        setSortDir((prev) => (prev === 'asc' ? 'desc' : 'asc'));
      } else {
        setSortKey(key);
        setSortDir('asc');
      }
    },
    [sortKey],
  );

  // Sort rows in memory whenever sort state or data changes.
  const sortedData = useMemo(() => {
    if (!sortKey) return data;

    return [...data].sort((a, b) => {
      const aVal = a[sortKey];
      const bVal = b[sortKey];

      // Handle null / undefined
      if (aVal == null && bVal == null) return 0;
      if (aVal == null) return 1;
      if (bVal == null) return -1;

      let cmp = 0;
      if (typeof aVal === 'number' && typeof bVal === 'number') {
        cmp = aVal - bVal;
      } else {
        cmp = String(aVal).localeCompare(String(bVal), 'de');
      }

      return sortDir === 'asc' ? cmp : -cmp;
    });
  }, [data, sortKey, sortDir]);

  // -------------------------------------------------------------------------
  // Render
  // -------------------------------------------------------------------------

  return (
    <div className="w-full overflow-x-auto rounded-lg border border-border">
      <table className="w-full text-sm font-body">
        {/* ---- Header ---- */}
        <thead>
          <tr className="border-b border-border bg-surface">
            {columns.map((col) => {
              const align = alignmentClasses[col.align] || 'text-left';
              const isSortable = col.sortable !== false;
              const isActive = sortKey === col.key;

              return (
                <th
                  key={col.key}
                  className={`px-4 py-3 text-xs font-semibold uppercase tracking-wider text-text-secondary ${align} ${
                    isSortable ? 'cursor-pointer select-none hover:text-text-primary' : ''
                  }`}
                  onClick={isSortable ? () => handleSort(col.key) : undefined}
                >
                  <span className="inline-flex items-center gap-1">
                    {col.label}
                    {isSortable && (
                      <span className="inline-flex flex-col leading-none">
                        <ChevronUp
                          size={12}
                          className={
                            isActive && sortDir === 'asc'
                              ? 'text-primary'
                              : 'text-text-muted'
                          }
                        />
                        <ChevronDown
                          size={12}
                          className={
                            isActive && sortDir === 'desc'
                              ? 'text-primary'
                              : 'text-text-muted'
                          }
                        />
                      </span>
                    )}
                  </span>
                </th>
              );
            })}
          </tr>
        </thead>

        {/* ---- Body ---- */}
        <tbody>
          {sortedData.length === 0 ? (
            <tr>
              <td
                colSpan={columns.length}
                className="px-4 py-10 text-center text-text-muted"
              >
                {emptyMessage}
              </td>
            </tr>
          ) : (
            sortedData.map((row, rowIndex) => (
              <tr
                key={row.id ?? rowIndex}
                className={`border-b border-border last:border-0 transition-colors ${
                  rowIndex % 2 === 0 ? 'bg-surface-card' : 'bg-surface'
                } ${
                  onRowClick
                    ? 'cursor-pointer hover:bg-primary/5'
                    : 'hover:bg-surface'
                }`}
                onClick={onRowClick ? () => onRowClick(row) : undefined}
              >
                {columns.map((col) => {
                  const align = alignmentClasses[col.align] || 'text-left';
                  const cellValue = row[col.key];

                  return (
                    <td
                      key={col.key}
                      className={`px-4 py-3 text-text-primary ${align}`}
                    >
                      {col.render ? col.render(cellValue, row) : cellValue}
                    </td>
                  );
                })}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
