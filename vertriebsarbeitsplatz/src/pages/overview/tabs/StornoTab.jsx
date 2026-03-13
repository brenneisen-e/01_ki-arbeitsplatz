import KPIGrid from '../../../components/ui/KPIGrid';
import Card from '../../../components/ui/Card';
import BarChartComponent from '../../../components/charts/BarChartComponent';
import { useMode } from '../../../hooks/useMode';
import { STORNO_DATA } from '../../../data';

const STORNO_KPI_CONFIG = {
  versicherung: [
    { id: 'stornoAnzahl', label: 'Stornierungen', format: 'num', icon: 'AlertTriangle' },
    { id: 'stornoQuote', label: 'Storno-Quote', format: 'pct', icon: 'TrendingDown' },
    { id: 'stornoVolumen', label: 'Storno-Volumen', format: 'eur', icon: 'Briefcase' },
    { id: 'fruehstorno', label: 'Frühstorno (<12M)', format: 'num', icon: 'Clock' },
  ],
  banking: [
    { id: 'stornoAnzahl', label: 'Produktkündigungen', format: 'num', icon: 'AlertTriangle' },
    { id: 'stornoQuote', label: 'Kündigungsquote', format: 'pct', icon: 'TrendingDown' },
    { id: 'stornoVolumen', label: 'Abgefl. Volumen', format: 'eur', icon: 'Briefcase' },
    { id: 'fruehstorno', label: 'Kundenabgänge', format: 'num', icon: 'Clock' },
  ],
  vermoegensverwaltung: [
    { id: 'stornoAnzahl', label: 'Mandatskündigungen', format: 'num', icon: 'AlertTriangle' },
    { id: 'stornoQuote', label: 'Kündigungsquote', format: 'pct', icon: 'TrendingDown' },
    { id: 'stornoVolumen', label: 'AuM-Abfluss', format: 'eur', icon: 'Briefcase' },
    { id: 'fruehstorno', label: 'Frühkündigungen', format: 'num', icon: 'Clock' },
  ],
};

export default function StornoTab() {
  const { modeId } = useMode();
  const data = STORNO_DATA[modeId] || STORNO_DATA.versicherung;

  return (
    <div className="space-y-6">
      <KPIGrid kpiConfig={STORNO_KPI_CONFIG[modeId] || STORNO_KPI_CONFIG.versicherung} kpiValues={data.kpiValues} />

      <Card>
        <h3 className="font-semibold text-slate-800 mb-4">
          {modeId === 'banking' ? 'Kündigungsgründe' : 'Storno-Gründe'}
        </h3>
        <BarChartComponent
          data={data.gruende}
          height={280}
          color="#ef4444"
        />
      </Card>

      <Card>
        <h3 className="font-semibold text-slate-800 mb-4">
          {modeId === 'banking' ? 'Gekündigte Konten/Produkte' : 'Stornierte Verträge'}
        </h3>
        <div className="text-sm text-slate-500 py-8 text-center">
          {data.kpiValues.stornoAnzahl.wert} {modeId === 'banking' ? 'Kündigungen' : 'Stornierungen'} in den letzten 12 Monaten. Details in der Detailansicht verfügbar.
        </div>
      </Card>
    </div>
  );
}
