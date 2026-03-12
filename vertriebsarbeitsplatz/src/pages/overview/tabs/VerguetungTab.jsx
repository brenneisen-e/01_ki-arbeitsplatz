import KPIGrid from '../../../components/ui/KPIGrid';
import Card from '../../../components/ui/Card';
import LineChartComponent from '../../../components/charts/LineChartComponent';
import BarChartComponent from '../../../components/charts/BarChartComponent';
import { useMode } from '../../../hooks/useMode';
import { VERGUETUNG_DATA } from '../../../data';

const DEFAULT_KPI_CONFIG = [
  { id: 'provision', label: 'Provision YTD', format: 'eur', icon: 'Wallet' },
  { id: 'ap', label: 'Abschlussprovision', format: 'eur', icon: 'TrendingUp' },
  { id: 'bp', label: 'Bestandsprovision', format: 'eur', icon: 'Briefcase' },
  { id: 'dynprov', label: 'Dynamikprovision', format: 'eur', icon: 'Zap' },
];

export default function VerguetungTab() {
  const { modeId } = useMode();
  const data = VERGUETUNG_DATA[modeId] || VERGUETUNG_DATA.versicherung;
  const kpiConfig = data.kpiConfig || DEFAULT_KPI_CONFIG;

  const tabTitle = modeId === 'banking' ? 'Erträge' : modeId === 'vermoegensverwaltung' ? 'Erträge' : 'Vergütung';
  const chartTitle = modeId === 'vermoegensverwaltung' ? 'Ertragsentwicklung (12 Monate)' : modeId === 'banking' ? 'Ertragsentwicklung (12 Monate)' : 'Provisionsentwicklung (12 Monate)';
  const spartenTitle = modeId === 'vermoegensverwaltung' ? 'Erträge nach Quelle' : modeId === 'banking' ? 'Ertragsquellen' : 'Provision nach Sparte';

  return (
    <div className="space-y-6">
      <KPIGrid kpiConfig={kpiConfig} kpiValues={data.kpiValues} />

      <div className="grid grid-cols-2 gap-4">
        <Card>
          <h3 className="font-semibold text-slate-800 mb-4">{chartTitle}</h3>
          <LineChartComponent data={data.monthlyData} height={260} />
        </Card>
        <Card>
          <h3 className="font-semibold text-slate-800 mb-4">{spartenTitle}</h3>
          <BarChartComponent data={data.spartenData} height={260} />
        </Card>
      </div>

      <Card>
        <h3 className="font-semibold text-slate-800 mb-4">
          {modeId === 'vermoegensverwaltung' ? 'Gebührenmodell' : modeId === 'banking' ? 'Vergütungsmodell' : 'Provisionsmodell'}
        </h3>
        <div className="grid grid-cols-3 gap-6 text-sm">
          <div>
            <div className="text-slate-400 text-xs uppercase tracking-wider mb-2">
              {modeId === 'vermoegensverwaltung' ? 'Management Fee' : modeId === 'banking' ? 'Neugeschäft' : 'Abschlussprovision'}
            </div>
            <div className="space-y-1 text-slate-600">
              {data.modell.abschluss.map((line, i) => <div key={i}>{line}</div>)}
            </div>
          </div>
          <div>
            <div className="text-slate-400 text-xs uppercase tracking-wider mb-2">
              {modeId === 'vermoegensverwaltung' ? 'Laufende Erträge' : modeId === 'banking' ? 'Bestand' : 'Bestandsprovision'}
            </div>
            <div className="space-y-1 text-slate-600">
              {data.modell.bestand.map((line, i) => <div key={i}>{line}</div>)}
            </div>
          </div>
          <div>
            <div className="text-slate-400 text-xs uppercase tracking-wider mb-2">Bonifikation</div>
            <div className="space-y-1 text-slate-600">
              {data.modell.bonus.map((line, i) => <div key={i}>{line}</div>)}
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
