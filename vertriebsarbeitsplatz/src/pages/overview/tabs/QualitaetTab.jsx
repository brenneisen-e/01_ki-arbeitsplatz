import KPIGrid from '../../../components/ui/KPIGrid';
import Card from '../../../components/ui/Card';
import LineChartComponent from '../../../components/charts/LineChartComponent';
import { CheckCircle, XCircle, Clock } from 'lucide-react';
import { useMode } from '../../../hooks/useMode';
import { QUALITAET_DATA } from '../../../data';

const DEFAULT_KPI_CONFIG = [
  { id: 'gesamtNote', label: 'Gesamtnote', format: 'num', icon: 'Award' },
  { id: 'complianceQuote', label: 'Compliance-Quote', format: 'pct', icon: 'Shield' },
  { id: 'schulungStunden', label: 'Schulungsstd. YTD', format: 'num', icon: 'BookOpen' },
  { id: 'beschwerdeQuote', label: 'Beschwerde-Quote', format: 'pct', icon: 'MessageCircle' },
];

export default function QualitaetTab() {
  const { modeId } = useMode();
  const data = QUALITAET_DATA[modeId] || QUALITAET_DATA.versicherung;
  const kpiConfig = data.kpiConfig || DEFAULT_KPI_CONFIG;

  const trendLabel = data.trendLabel || 'Qualitätstrend (Gesamtnote)';
  const trendHint = modeId === 'versicherung'
    ? 'Niedrigere Note = besser (Schulnoten-System)'
    : modeId === 'vermoegensverwaltung'
    ? 'Höher = besser'
    : null;

  return (
    <div className="space-y-6">
      <KPIGrid kpiConfig={kpiConfig} kpiValues={data.kpiValues} />

      <div className="grid grid-cols-2 gap-4">
        <Card>
          <h3 className="font-semibold text-slate-800 mb-4">{trendLabel}</h3>
          <LineChartComponent data={data.trendData} height={220} color="#10b981" />
          {trendHint && (
            <div className="mt-2 text-xs text-slate-400 text-center">{trendHint}</div>
          )}
        </Card>

        <Card>
          <h3 className="font-semibold text-slate-800 mb-4">Compliance-Status</h3>
          <div className="space-y-3">
            {data.compliance.map((item, i) => (
              <div key={i} className="flex items-center justify-between py-1">
                <span className="text-sm text-slate-700">{item.label}</span>
                {item.status === 'ok' ? (
                  <CheckCircle size={18} className="text-emerald-500" />
                ) : item.status === 'pending' ? (
                  <Clock size={18} className="text-amber-500" />
                ) : (
                  <XCircle size={18} className="text-red-500" />
                )}
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Card>
        <h3 className="font-semibold text-slate-800 mb-4">Schulungen & Weiterbildung</h3>
        <div className="space-y-3">
          {data.schulungen.map((s, i) => (
            <div key={i} className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0">
              <div className="flex items-center gap-3">
                {s.status === 'ok' ? (
                  <CheckCircle size={16} className="text-emerald-500" />
                ) : (
                  <Clock size={16} className="text-amber-500" />
                )}
                <span className="text-sm text-slate-700">{s.name}</span>
              </div>
              <span className="text-sm text-slate-500 font-mono">{s.stunden}h</span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
