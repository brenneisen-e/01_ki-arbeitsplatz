import KPIGrid from '../../../components/ui/KPIGrid';
import Card from '../../../components/ui/Card';
import LineChartComponent from '../../../components/charts/LineChartComponent';
import BarChartComponent from '../../../components/charts/BarChartComponent';
import { useMode } from '../../../hooks/useMode';
import useTranslation from '../../../i18n/useTranslation';
import { VERGUETUNG_DATA } from '../../../data';

export default function VerguetungTab() {
  const { modeId } = useMode();
  const { t } = useTranslation();

  const DEFAULT_KPI_CONFIG = [
    { id: 'provision', label: t('provisionYtd'), format: 'eur', icon: 'Wallet' },
    { id: 'ap', label: t('abschlussprovision'), format: 'eur', icon: 'TrendingUp' },
    { id: 'bp', label: t('bestandsprovision'), format: 'eur', icon: 'Briefcase' },
    { id: 'dynprov', label: t('dynamikprovision'), format: 'eur', icon: 'Zap' },
  ];
  const data = VERGUETUNG_DATA[modeId] || VERGUETUNG_DATA.versicherung;
  const kpiConfig = data.kpiConfig || DEFAULT_KPI_CONFIG;

  const tabTitle = modeId === 'banking' ? t('ertraegeVerguetung') : modeId === 'vermoegensverwaltung' ? t('ertraegeLabel') : t('verguetungLabel');
  const chartTitle = modeId === 'vermoegensverwaltung' ? t('ertragsentwicklung') : modeId === 'banking' ? t('deckungsbeitrag') : t('provisionsentwicklung');
  const spartenTitle = modeId === 'vermoegensverwaltung' ? t('ertraegeNachQuelle') : modeId === 'banking' ? t('deckungsbeitragNachQuelle') : t('provisionNachSparte');

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
          {modeId === 'vermoegensverwaltung' ? t('gebuehrenmodell') : modeId === 'banking' ? t('verguetungBerater') : t('provisionsmodell')}
        </h3>
        <div className="grid grid-cols-3 gap-6 text-sm">
          <div>
            <div className="text-slate-400 text-xs uppercase tracking-wider mb-2">
              {modeId === 'vermoegensverwaltung' ? t('managementFee') : modeId === 'banking' ? t('verbundProvisionen') : t('abschlussprovision')}
            </div>
            <div className="space-y-1 text-slate-600">
              {data.modell.abschluss.map((line, i) => <div key={i}>{line}</div>)}
            </div>
          </div>
          <div>
            <div className="text-slate-400 text-xs uppercase tracking-wider mb-2">
              {modeId === 'vermoegensverwaltung' ? t('laufendeErtraege') : modeId === 'banking' ? t('festgehaltBankertrag') : t('bestandsprovision')}
            </div>
            <div className="space-y-1 text-slate-600">
              {data.modell.bestand.map((line, i) => <div key={i}>{line}</div>)}
            </div>
          </div>
          <div>
            <div className="text-slate-400 text-xs uppercase tracking-wider mb-2">{t('bonifikation')}</div>
            <div className="space-y-1 text-slate-600">
              {data.modell.bonus.map((line, i) => <div key={i}>{line}</div>)}
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
