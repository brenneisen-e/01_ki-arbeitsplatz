import { useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import KPIBox from '../shared/KPIBox';

/**
 * KPICards -- Key-performance-indicator cards displayed at the top of the
 * credit-analysis dashboard. Übernimmt den Banken-KPI-Stil (Pastell-Gradient,
 * Icon-Box, große Mono-Zahl, Trend-Pill, 12-Monate-Area-Chart).
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
      icon: 'FileText', label: 'Offene Anträge', wert: openCount, format: 'num', trend: 12,
      description: 'Anträge in Bearbeitung (alle Stufen vor Entscheidung)',
      period: 'aktueller Bestand',
    },
    {
      icon: 'Clock', label: 'Ø Bearbeitungszeit', wert: 12, format: 'num', trend: -8,
      description: 'Durchschnitt Eingang bis Entscheidung, in Tagen',
      period: 'letzte 90 Tage',
    },
    {
      icon: 'CheckCircle2', label: 'Genehmigungsquote', wert: approvalRate, format: 'pct', trend: 5,
      description: 'Anteil genehmigter an entschiedenen Anträgen',
      period: 'YTD 2026',
    },
    {
      icon: 'Euro', label: 'Volumen in Bearbeitung', wert: totalVolume, format: 'eur', trend: 3.2,
      description: 'Summe beantragter Kreditbeträge offener Anträge',
      period: 'Stand heute',
    },
    {
      icon: 'Banknote', label: 'Genehmigtes Volumen', wert: approvedVolume, format: 'eur', trend: 15,
      description: 'Summe bewilligter Kreditbeträge',
      period: 'YTD 2026',
    },
    {
      icon: 'XCircle', label: 'Abgelehnte Anträge', wert: rejectedCount, format: 'num', trend: -3,
      description: 'Zahl negativ entschiedener Anträge',
      period: 'YTD 2026',
    },
    {
      icon: 'Timer', label: 'Ø Kreditbetrag', wert: avgBetrag, format: 'eur', trend: 4.5,
      description: 'Durchschnittliches Kreditvolumen je Antrag',
      period: 'letzte 12 Monate',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {kpis.map((kpi, i) => (
        <KPIBox
          key={kpi.label}
          icon={kpi.icon}
          label={kpi.label}
          wert={kpi.wert}
          format={kpi.format}
          trend={kpi.trend}
          description={kpi.description}
          period={kpi.period}
          delay={i * 60}
        />
      ))}
    </div>
  );
}
