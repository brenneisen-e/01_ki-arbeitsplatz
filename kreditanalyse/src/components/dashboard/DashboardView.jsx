import { useState } from 'react';
import { LayoutGrid, List } from 'lucide-react';
import KPICards from './KPICards';
import PipelineBoard from './PipelineBoard';
import ApplicationsTable from './ApplicationsTable';

/**
 * DashboardView -- Main dashboard screen for the credit-analysis module.
 *
 * Layout:
 *   - Page heading with a Pipeline / Tabelle toggle
 *   - KPI summary cards (always visible)
 *   - Either the Kanban pipeline board or the sortable applications table,
 *     depending on the selected view mode
 */
export default function DashboardView() {
  const [viewMode, setViewMode] = useState('pipeline');

  return (
    <div className="space-y-6">
      {/* Header row: title + view-mode toggle */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold font-headline text-text-primary">
          Kreditantr\u00E4ge \u00DCbersicht
        </h1>

        {/* View-mode toggle group */}
        <div className="flex bg-surface-card border border-border rounded-lg overflow-hidden shadow-sm">
          <button
            type="button"
            onClick={() => setViewMode('pipeline')}
            className={`inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium font-body transition-colors ${
              viewMode === 'pipeline'
                ? 'bg-primary text-white'
                : 'bg-surface-card text-text-secondary hover:bg-surface hover:text-text-primary'
            }`}
          >
            <LayoutGrid size={16} strokeWidth={1.5} />
            Pipeline
          </button>
          <button
            type="button"
            onClick={() => setViewMode('table')}
            className={`inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium font-body transition-colors ${
              viewMode === 'table'
                ? 'bg-primary text-white'
                : 'bg-surface-card text-text-secondary hover:bg-surface hover:text-text-primary'
            }`}
          >
            <List size={16} strokeWidth={1.5} />
            Tabelle
          </button>
        </div>
      </div>

      {/* KPI summary cards -- always visible */}
      <KPICards />

      {/* Conditional content area */}
      {viewMode === 'pipeline' ? <PipelineBoard /> : <ApplicationsTable />}
    </div>
  );
}
