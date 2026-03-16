import { useMemo } from 'react';
import { TrendingUp, TrendingDown, Clock, CheckCircle, XCircle, Euro, FileText, Banknote, Timer } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { formatCurrencyCompact } from '../../utils/formatters';
import SparklineChart from '../shared/SparklineChart';

/**
 * KPICards -- Key-performance-indicator cards displayed at the top of the
 * credit-analysis dashboard.
 */
export default function KPICards() {
  const { state } = useApp();
  const companies = state.companies;

  const { openCount, approvalRate, totalVolume, approvedVolume, rejectedCount, avgBetrag } = useMemo(() => {
    const open = companies.filter(
      (c) => c.status !== 'approved' && c.status !== 'rejected'
    );
    const approved = companies.filter((c) => c.status === 'approved');
    const rejected = companies.filter((c) => c.status === 'rejected');
    const decided = approved.length + rejected.length;
    const rate = decided > 0 ? Math.round((approved.length / decided) * 100) : 0;
    const volume = open.reduce((sum, c) => sum + (c.kredit?.betrag || 0), 0);
    const apprVol = approved.reduce((sum, c) => sum + (c.kredit?.betrag || 0), 0);
    const allBetrag = companies.reduce((sum, c) => sum + (c.kredit?.betrag || 0), 0);
    const avg = companies.length > 0 ? Math.round(allBetrag / companies.length) : 0;

    return {
      openCount: open.length,
      approvalRate: rate,
      totalVolume: volume,
      approvedVolume: apprVol,
      rejectedCount: rejected.length,
      avgBetrag: avg,
    };
  }, [companies]);

  const kpis = [
    {
      label: 'Offene Anträge',
      value: openCount,
      icon: FileText,
      suffix: null,
      trend: { value: 12, positive: true },
      sparkline: [5, 7, 6, 8, 7, 9, 8, openCount],
      bgColor: '#EEF2FF',
      iconColor: '#4F46E5',
      sparkColor: '#4F46E5',
    },
    {
      label: 'Ø Bearbeitungszeit',
      value: '12',
      icon: Clock,
      suffix: 'Tage',
      trend: { value: 8, positive: false },
      sparkline: [18, 16, 15, 14, 13, 14, 13, 12],
      bgColor: '#FFF7ED',
      iconColor: '#D97706',
      sparkColor: '#D97706',
    },
    {
      label: 'Genehmigungsquote',
      value: `${approvalRate}`,
      icon: CheckCircle,
      suffix: '%',
      trend: { value: 5, positive: true },
      sparkline: [62, 68, 65, 71, 74, 70, 78, approvalRate],
      bgColor: '#ECFDF5',
      iconColor: '#059669',
      sparkColor: '#059669',
    },
    {
      label: 'Volumen in Bearbeitung',
      value: formatCurrencyCompact(totalVolume),
      icon: Euro,
      suffix: null,
      trend: { value: 3.2, positive: true },
      sparkline: [2.1, 2.4, 2.2, 2.8, 3.1, 2.9, 3.3, 3.5],
      bgColor: '#EFF6FF',
      iconColor: '#2563EB',
      sparkColor: '#2563EB',
    },
    {
      label: 'Genehmigtes Volumen',
      value: formatCurrencyCompact(approvedVolume),
      icon: Banknote,
      suffix: null,
      trend: { value: 15, positive: true },
      sparkline: [0.8, 1.2, 1.0, 1.5, 1.8, 2.0, 2.2, approvedVolume / 1000000 || 0.5],
      bgColor: '#F0FDF4',
      iconColor: '#16A34A',
      sparkColor: '#16A34A',
    },
    {
      label: 'Abgelehnte Anträge',
      value: rejectedCount,
      icon: XCircle,
      suffix: null,
      trend: { value: 3, positive: false },
      sparkline: [2, 1, 3, 2, 1, 2, 1, rejectedCount],
      bgColor: '#FEF2F2',
      iconColor: '#DC2626',
      sparkColor: '#DC2626',
    },
    {
      label: 'Ø Kreditbetrag',
      value: formatCurrencyCompact(avgBetrag),
      icon: Timer,
      suffix: null,
      trend: { value: 4.5, positive: true },
      sparkline: [1.2, 1.4, 1.3, 1.5, 1.6, 1.8, 1.7, avgBetrag / 1000000 || 1.5],
      bgColor: '#FAF5FF',
      iconColor: '#7C3AED',
      sparkColor: '#7C3AED',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {kpis.map((kpi) => {
        const Icon = kpi.icon;
        const TrendIcon = kpi.trend.positive ? TrendingUp : TrendingDown;
        return (
          <div
            key={kpi.label}
            className="bg-surface-card border border-border rounded-xl p-5 shadow-sm hover:shadow-lg transition-all duration-200 hover:-translate-y-0.5"
          >
            {/* Top row: icon badge + trend */}
            <div className="flex items-center justify-between mb-3">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ backgroundColor: kpi.bgColor }}
              >
                <Icon size={20} strokeWidth={1.75} style={{ color: kpi.iconColor }} />
              </div>
              {kpi.trend && (
                <span
                  className={`flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full ${
                    kpi.trend.positive
                      ? 'bg-emerald-50 text-emerald-600'
                      : 'bg-red-50 text-red-500'
                  }`}
                >
                  <TrendIcon size={12} />
                  {kpi.trend.value}%
                </span>
              )}
            </div>

            {/* Value */}
            <div className="flex items-baseline gap-1.5 mb-1">
              <span className="text-2xl font-bold font-mono text-text-primary leading-none">
                {kpi.value}
              </span>
              {kpi.suffix && (
                <span className="text-sm font-medium text-text-secondary font-body">
                  {kpi.suffix}
                </span>
              )}
            </div>

            {/* Label */}
            <p className="text-xs font-medium text-text-secondary font-body mb-3">
              {kpi.label}
            </p>

            {/* Sparkline */}
            {kpi.sparkline && (
              <div className="pt-2 border-t border-border/50">
                <SparklineChart
                  data={kpi.sparkline}
                  color={kpi.sparkColor}
                  width="100%"
                  height={32}
                  filled
                />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
