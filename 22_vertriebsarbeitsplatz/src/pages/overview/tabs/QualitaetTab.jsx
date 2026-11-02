import KPIGrid from '../../../components/ui/KPIGrid';
import Card from '../../../components/ui/Card';
import LineChartComponent from '../../../components/charts/LineChartComponent';
import { CheckCircle, XCircle, Clock } from 'lucide-react';
import { useMode } from '../../../hooks/useMode';
import useTranslation from '../../../i18n/useTranslation';
import { QUALITAET_DATA } from '../../../data';

export default function QualitaetTab() {
  const { modeId } = useMode();
  const { t } = useTranslation();

  const DEFAULT_KPI_CONFIG = [
    { id: 'gesamtNote', label: t('gesamtnote'), format: 'num', icon: 'Award' },
    { id: 'complianceQuote', label: t('complianceQuote'), format: 'pct', icon: 'Shield' },
    { id: 'schulungStunden', label: t('schulungStunden'), format: 'num', icon: 'BookOpen' },
    { id: 'beschwerdeQuote', label: t('beschwerdeQuote'), format: 'pct', icon: 'MessageCircle' },
  ];
  const data = QUALITAET_DATA[modeId] || QUALITAET_DATA.versicherung;
  const kpiConfig = data.kpiConfig || DEFAULT_KPI_CONFIG;

  const trendLabel = data.trendLabel || t('qualitaetstrend');
  const trendHint = modeId === 'versicherung'
    ? t('niedrigereNoteBesser')
    : modeId === 'vermoegensverwaltung'
    ? t('hoeherBesser')
    : null;

  return (
    <div className="space-y-6">
      <KPIGrid kpiConfig={kpiConfig} kpiValues={data.kpiValues} />

      <div className="grid grid-cols-2 gap-4">
        <Card>
          <h3 className="font-semibold text-(--text-primary) mb-4">{trendLabel}</h3>
          <LineChartComponent data={data.trendData} height={220} color="var(--mode-chart)" />
          {trendHint && (
            <div className="mt-2 text-xs text-(--text-tertiary) text-center">{trendHint}</div>
          )}
        </Card>

        <Card>
          <h3 className="font-semibold text-(--text-primary) mb-4">{t('complianceStatusLabel')}</h3>
          <div className="space-y-3">
            {data.compliance.map((item, i) => (
              <div key={i} className="flex items-center justify-between py-1">
                <span className="text-sm text-(--text-primary)">{item.label}</span>
                {item.status === 'ok' ? (
                  <CheckCircle size={18} className="text-(--color-success)" />
                ) : item.status === 'pending' ? (
                  <Clock size={18} className="text-(--color-warning)" />
                ) : (
                  <XCircle size={18} className="text-(--color-danger)" />
                )}
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Card>
        <h3 className="font-semibold text-(--text-primary) mb-4">{t('schulungenWeiterbildung')}</h3>
        <div className="space-y-3">
          {data.schulungen.map((s, i) => (
            <div key={i} className="flex items-center justify-between py-2 border-b border-(--border-light) last:border-0">
              <div className="flex items-center gap-3">
                {s.status === 'ok' ? (
                  <CheckCircle size={16} className="text-(--color-success)" />
                ) : (
                  <Clock size={16} className="text-(--color-warning)" />
                )}
                <span className="text-sm text-(--text-primary)">{s.name}</span>
              </div>
              <span className="text-sm text-(--text-secondary) font-mono">{s.stunden}h</span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
