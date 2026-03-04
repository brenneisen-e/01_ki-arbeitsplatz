import { useMemo } from 'react';
import { TrendingUp, Clock, CheckCircle, Euro } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { formatCurrencyCompact } from '../../utils/formatters';
import SparklineChart from '../shared/SparklineChart';

/**
 * KPICards -- Four key-performance-indicator cards displayed in a horizontal
 * row at the top of the credit-analysis dashboard.
 *
 * Metrics:
 *   1. Offene Antraege   -- count of companies not yet approved or rejected
 *   2. Bearbeitungszeit  -- average processing time (hardcoded demo value)
 *   3. Genehmigungsquote -- approved / (approved + rejected) * 100
 *   4. Volumen           -- sum of kredit.betrag for all open applications
 */
export default function KPICards() {
  const { state } = useApp();
  const companies = state.companies;

  const { openCount, approvalRate, totalVolume } = useMemo(() => {
    const open = companies.filter(
      (c) => c.status !== 'approved' && c.status !== 'rejected'
    );
    const approved = companies.filter((c) => c.status === 'approved').length;
    const rejected = companies.filter((c) => c.status === 'rejected').length;
    const decided = approved + rejected;
    const rate = decided > 0 ? Math.round((approved / decided) * 100) : 0;
    const volume = open.reduce((sum, c) => sum + (c.kredit?.betrag || 0), 0);

    return {
      openCount: open.length,
      approvalRate: rate,
      totalVolume: volume,
    };
  }, [companies]);

  // Synthetic sparkline data points to visualise a positive approval-rate trend
  const approvalSparkline = [62, 68, 65, 71, 74, 70, 78, approvalRate];

  const kpis = [
    {
      label: 'Offene Anträge',
      value: openCount,
      icon: TrendingUp,
      color: 'border-primary',
      iconColor: 'text-primary',
      suffix: null,
      sparkline: null,
    },
    {
      label: 'Ø Bearbeitungszeit',
      value: '12',
      icon: Clock,
      color: 'border-accent-warm',
      iconColor: 'text-accent-warm',
      suffix: 'Tage',
      sparkline: null,
    },
    {
      label: 'Genehmigungsquote',
      value: `${approvalRate}`,
      icon: CheckCircle,
      color: 'border-accent',
      iconColor: 'text-accent',
      suffix: '%',
      sparkline: approvalSparkline,
    },
    {
      label: 'Volumen in Bearbeitung',
      value: formatCurrencyCompact(totalVolume),
      icon: Euro,
      color: 'border-primary-light',
      iconColor: 'text-primary-light',
      suffix: null,
      sparkline: null,
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
      {kpis.map((kpi) => {
        const Icon = kpi.icon;
        return (
          <div
            key={kpi.label}
            className={`bg-surface-card border border-border ${kpi.color} border-l-4 rounded-lg p-5 shadow-sm hover:shadow-md transition-shadow`}
          >
            <div className="flex items-start justify-between">
              {/* Metric content */}
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-text-secondary uppercase tracking-wide font-body mb-2">
                  {kpi.label}
                </p>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-2xl font-bold font-mono text-text-primary leading-none">
                    {kpi.value}
                  </span>
                  {kpi.suffix && (
                    <span className="text-sm font-medium text-text-secondary font-body">
                      {kpi.suffix}
                    </span>
                  )}
                </div>
                {kpi.sparkline && (
                  <div className="mt-2">
                    <SparklineChart
                      data={kpi.sparkline}
                      color="#00875A"
                      width={96}
                      height={24}
                    />
                  </div>
                )}
              </div>

              {/* Icon badge */}
              <div
                className={`flex-shrink-0 p-2 rounded-lg bg-surface ${kpi.iconColor}`}
              >
                <Icon size={20} strokeWidth={1.5} />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
