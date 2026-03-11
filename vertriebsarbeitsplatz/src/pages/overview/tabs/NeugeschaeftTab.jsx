import KPIGrid from '../../../components/ui/KPIGrid';
import Card from '../../../components/ui/Card';
import DonutChart from '../../../components/charts/DonutChart';
import DataTable from '../../../components/ui/DataTable';
import LogoImg from '../../../components/ui/LogoImg';
import { SparteBadge, StatusBadge } from '../../../components/ui/Badge';
import { useMode } from '../../../hooks/useMode';
import { NEUGESCHAEFT_DATA } from '../../../data';
import { formatEur } from '../../../utils/formatters';

const NG_KPI_CONFIG = [
  { id: 'antraege', label: 'Antraege', format: 'num', icon: 'FileText' },
  { id: 'policiert', label: 'Policiertes NG', format: 'eur', icon: 'TrendingUp' },
  { id: 'ape', label: 'APE', format: 'eur', icon: 'BarChart3' },
  { id: 'abschlussquote', label: 'Abschlussquote', format: 'pct', icon: 'Target' },
];

const COLUMNS = [
  { id: 'id', label: 'Vertragsnr.', width: '120px' },
  { id: 'sparte', label: 'Sparte', render: (v) => <SparteBadge sparte={v} /> },
  { id: 'produkt', label: 'Produkt' },
  { id: 'versicherer', label: 'Versicherer', render: (v) => (
    <div className="flex items-center gap-2">
      <LogoImg name={v} size={18} />
      <span>{v}</span>
    </div>
  )},
  { id: 'beitrag', label: 'Beitrag', render: (v, row) => `${formatEur(v)}/${row.beitragsart}` },
  { id: 'status', label: 'Status', render: (v) => <StatusBadge status={v} /> },
  { id: 'datum', label: 'Datum' },
];

export default function NeugeschaeftTab() {
  const { modeId } = useMode();
  const data = NEUGESCHAEFT_DATA[modeId] || NEUGESCHAEFT_DATA.versicherung;

  return (
    <div className="space-y-6">
      <KPIGrid kpiConfig={NG_KPI_CONFIG} kpiValues={data.kpiValues} />

      <div className="grid grid-cols-2 gap-4">
        {/* Donut */}
        <Card>
          <h3 className="font-semibold text-slate-800 mb-4">Spartenverteilung Neugeschaeft</h3>
          <DonutChart
            data={data.spartenVerteilung}
            height={220}
            centerValue={data.spartenVerteilung.reduce((s, d) => s + d.value, 0)}
            centerLabel="Gesamt"
            colors={data.spartenVerteilung.map(d => d.color)}
          />
          <div className="mt-4 space-y-2">
            {data.spartenVerteilung.map(d => (
              <div key={d.name} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: d.color }} />
                  <span className="text-slate-600">{d.name}</span>
                </div>
                <span className="font-mono text-slate-700">{d.value} ({((d.value / data.spartenVerteilung.reduce((s, x) => s + x.value, 0)) * 100).toFixed(0)}%)</span>
              </div>
            ))}
          </div>
        </Card>

        {/* Top 5 */}
        <Card>
          <h3 className="font-semibold text-slate-800 mb-4">Top-5 Kunden Neugeschaeft</h3>
          <div className="space-y-3">
            {data.top5.map((k, i) => (
              <div key={i} className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-bold text-slate-400 w-5">{i + 1}.</span>
                  <span className="text-sm font-medium text-slate-700">{k.name}</span>
                </div>
                <span className="font-mono text-sm font-medium text-slate-800">{formatEur(k.betrag)}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Tabelle */}
      <DataTable
        columns={COLUMNS}
        data={data.vertraege}
        groupBy="kunde"
        renderGroupHeader={(kunde, rows) => (
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center text-xs font-bold text-slate-600">
              {kunde.split(' ').map(n => n[0]).join('')}
            </div>
            <span>{kunde}</span>
            <span className="text-slate-400">{rows[0]?.kundeId}</span>
            <span className="text-slate-400">&middot; {rows.length} Vertraege</span>
          </div>
        )}
      />
    </div>
  );
}
