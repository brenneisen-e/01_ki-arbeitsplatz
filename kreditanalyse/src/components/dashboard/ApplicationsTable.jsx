import { useMemo } from 'react';
import DataTable from '../shared/DataTable';
import StatusBadge from '../shared/StatusBadge';
import { useApp } from '../../context/AppContext';
import {
  formatCurrency,
  formatDate,
  daysRemaining,
  slaColor,
} from '../../utils/formatters';

/**
 * Map a company's workflow status to the most relevant detail view
 * so that clicking a table row takes the user to the right screen.
 */
function targetViewForStatus(status) {
  switch (status) {
    case 'eingegangen':
    case 'kyc':
      return 'kyc';
    case 'analysis':
      return 'analysis';
    case 'rating':
      return 'rating';
    case 'collateral':
      return 'collateral';
    case 'voting':
    case 'decision':
      return 'decision';
    default:
      return 'dashboard';
  }
}

/**
 * ApplicationsTable -- Full-width sortable table listing every credit
 * application.  Columns: Nr, Firma, Branche, Betrag, Status, Bearbeiter,
 * Eingangsdatum, Faellig bis.  Rows are clickable and navigate to the
 * appropriate workflow detail view.
 */
export default function ApplicationsTable() {
  const { state, selectAndNavigate } = useApp();
  const companies = state.companies;

  const columns = useMemo(
    () => [
      {
        key: 'id',
        label: 'Nr.',
        sortable: true,
        render: (value) => (
          <span className="font-mono text-xs text-text-secondary">
            {value}
          </span>
        ),
      },
      {
        key: 'firma',
        label: 'Firma',
        sortable: true,
        render: (value) => (
          <span className="font-semibold font-headline text-text-primary">
            {value}
          </span>
        ),
      },
      {
        key: 'branche',
        label: 'Branche',
        sortable: true,
        render: (value) => (
          <span className="text-text-secondary">{value}</span>
        ),
      },
      {
        key: 'betrag',
        label: 'Betrag',
        align: 'right',
        sortable: true,
        render: (_value, row) => (
          <span className="font-mono font-medium">
            {formatCurrency(row.kredit?.betrag)}
          </span>
        ),
      },
      {
        key: 'status',
        label: 'Status',
        sortable: true,
        render: (value) => <StatusBadge status={value} />,
      },
      {
        key: 'bearbeiter',
        label: 'Bearbeiter',
        sortable: true,
        render: (value) => (
          <span className="text-text-secondary">{value}</span>
        ),
      },
      {
        key: 'eingangsdatum',
        label: 'Eingang',
        sortable: true,
        render: (value) => (
          <span className="font-mono text-xs">{formatDate(value)}</span>
        ),
      },
      {
        key: 'faellig',
        label: 'Fällig bis',
        sortable: true,
        render: (value) => {
          const days = daysRemaining(value);
          const colorClass = slaColor(days);
          return (
            <div className="flex flex-col">
              <span className="font-mono text-xs">{formatDate(value)}</span>
              {days != null && (
                <span
                  className={`text-[11px] font-semibold font-mono ${colorClass}`}
                >
                  {days > 0
                    ? `${days} Tage`
                    : days === 0
                    ? 'Heute'
                    : `${Math.abs(days)}T überfällig`}
                </span>
              )}
            </div>
          );
        },
      },
    ],
    []
  );

  // Flatten kredit.betrag onto the row object so DataTable can sort by it
  const tableData = useMemo(
    () =>
      companies.map((c) => ({
        ...c,
        betrag: c.kredit?.betrag ?? 0,
      })),
    [companies]
  );

  const handleRowClick = (row) => {
    const view = targetViewForStatus(row.status);
    selectAndNavigate(row.id, view);
  };

  return (
    <DataTable
      columns={columns}
      data={tableData}
      onRowClick={handleRowClick}
      emptyMessage="Keine Kreditanträge vorhanden"
    />
  );
}
