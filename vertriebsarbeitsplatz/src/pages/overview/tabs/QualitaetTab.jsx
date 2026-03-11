import KPIGrid from '../../../components/ui/KPIGrid';
import Card from '../../../components/ui/Card';
import LineChartComponent from '../../../components/charts/LineChartComponent';
import { CheckCircle, XCircle, Clock } from 'lucide-react';

const Q_KPI_CONFIG = [
  { id: 'gesamtNote', label: 'Gesamtnote', format: 'num', icon: 'Award' },
  { id: 'complianceQuote', label: 'Compliance-Quote', format: 'pct', icon: 'Shield' },
  { id: 'schulungStunden', label: 'Schulungsstd. YTD', format: 'num', icon: 'BookOpen' },
  { id: 'beschwerdeQuote', label: 'Beschwerde-Quote', format: 'pct', icon: 'MessageCircle' },
];

const Q_KPI_VALUES = {
  gesamtNote: { wert: 1.8, trend: -5.3 },
  complianceQuote: { wert: 98.5, trend: 0.5 },
  schulungStunden: { wert: 24, trend: 20.0 },
  beschwerdeQuote: { wert: 2.1, trend: -15.0 },
};

const TREND_DATA = [
  { name: 'Q1/25', value: 2.1 },
  { name: 'Q2/25', value: 2.0 },
  { name: 'Q3/25', value: 1.9 },
  { name: 'Q4/25', value: 1.9 },
  { name: 'Q1/26', value: 1.8 },
];

const COMPLIANCE_ITEMS = [
  { label: 'IDD-Dokumentation', status: 'ok' },
  { label: 'Beratungsprotokolle', status: 'ok' },
  { label: 'Datenschutz-Schulung', status: 'ok' },
  { label: 'Geldwaesche-Pruefung', status: 'ok' },
  { label: 'Interessenkonflikte', status: 'pending' },
];

const SCHULUNGEN = [
  { name: 'IDD Weiterbildung 2026', stunden: 12, status: 'ok' },
  { name: 'Datenschutz Update', stunden: 4, status: 'ok' },
  { name: 'Produktschulung BU Neu', stunden: 4, status: 'ok' },
  { name: 'ESG-Beratung', stunden: 4, status: 'ok' },
  { name: 'Cyber-Sicherheit', stunden: 2, status: 'pending' },
];

export default function QualitaetTab() {
  return (
    <div className="space-y-6">
      <KPIGrid kpiConfig={Q_KPI_CONFIG} kpiValues={Q_KPI_VALUES} />

      <div className="grid grid-cols-2 gap-4">
        <Card>
          <h3 className="font-semibold text-slate-800 mb-4">Qualitaetstrend (Gesamtnote)</h3>
          <LineChartComponent data={TREND_DATA} height={220} color="#10b981" />
          <div className="mt-2 text-xs text-slate-400 text-center">Niedrigere Note = besser (Schulnoten-System)</div>
        </Card>

        <Card>
          <h3 className="font-semibold text-slate-800 mb-4">Compliance-Status</h3>
          <div className="space-y-3">
            {COMPLIANCE_ITEMS.map((item, i) => (
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
          {SCHULUNGEN.map((s, i) => (
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
