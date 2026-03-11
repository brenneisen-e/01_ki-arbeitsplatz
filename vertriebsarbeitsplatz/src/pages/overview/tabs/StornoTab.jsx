import KPIGrid from '../../../components/ui/KPIGrid';
import Card from '../../../components/ui/Card';
import BarChartComponent from '../../../components/charts/BarChartComponent';
import { useMode } from '../../../hooks/useMode';
import { STORNO_DATA } from '../../../data';

const STORNO_KPI_CONFIG = [
  { id: 'stornoAnzahl', label: 'Stornierungen', format: 'num', icon: 'AlertTriangle' },
  { id: 'stornoQuote', label: 'Storno-Quote', format: 'pct', icon: 'TrendingDown' },
  { id: 'stornoVolumen', label: 'Storno-Volumen', format: 'eur', icon: 'Briefcase' },
  { id: 'fruehstorno', label: 'Fruehstorno (<12M)', format: 'num', icon: 'Clock' },
];

export default function StornoTab() {
  const { modeId } = useMode();
  const data = STORNO_DATA[modeId] || STORNO_DATA.versicherung;

  return (
    <div className="space-y-6">
      <KPIGrid kpiConfig={STORNO_KPI_CONFIG} kpiValues={data.kpiValues} />

      <Card>
        <h3 className="font-semibold text-slate-800 mb-4">
          {modeId === 'banking' ? 'Kuendigungsgruende' : 'Storno-Gruende'}
        </h3>
        <BarChartComponent
          data={data.gruende}
          height={280}
          color="#ef4444"
        />
      </Card>

      <Card>
        <h3 className="font-semibold text-slate-800 mb-4">
          {modeId === 'banking' ? 'Gekuendigte Konten/Produkte' : 'Stornierte Vertraege'}
        </h3>
        <div className="text-sm text-slate-500 py-8 text-center">
          {data.kpiValues.stornoAnzahl.wert} {modeId === 'banking' ? 'Kuendigungen' : 'Stornierungen'} in den letzten 12 Monaten. Details in der Detailansicht verfuegbar.
        </div>
      </Card>
    </div>
  );
}
