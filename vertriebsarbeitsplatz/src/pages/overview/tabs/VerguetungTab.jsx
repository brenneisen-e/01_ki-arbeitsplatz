import KPIGrid from '../../../components/ui/KPIGrid';
import Card from '../../../components/ui/Card';
import LineChartComponent from '../../../components/charts/LineChartComponent';
import BarChartComponent from '../../../components/charts/BarChartComponent';

const VG_KPI_CONFIG = [
  { id: 'provision', label: 'Provision YTD', format: 'eur', icon: 'Wallet' },
  { id: 'ap', label: 'Abschlussprovision', format: 'eur', icon: 'TrendingUp' },
  { id: 'bp', label: 'Bestandsprovision', format: 'eur', icon: 'Briefcase' },
  { id: 'dynprov', label: 'Dynamikprovision', format: 'eur', icon: 'Zap' },
];

const VG_KPI_VALUES = {
  provision: { wert: 48500, trend: 8.2 },
  ap: { wert: 32000, trend: 12.5 },
  bp: { wert: 14500, trend: 2.1 },
  dynprov: { wert: 2000, trend: 5.0 },
};

const MONTHLY_DATA = [
  { name: 'Jan', value: 4200 },
  { name: 'Feb', value: 5100 },
  { name: 'Mär', value: 4800 },
  { name: 'Apr', value: 6200 },
  { name: 'Mai', value: 5500 },
  { name: 'Jun', value: 7100 },
  { name: 'Jul', value: 4900 },
  { name: 'Aug', value: 3800 },
  { name: 'Sep', value: 5600 },
  { name: 'Okt', value: 6800 },
  { name: 'Nov', value: 5200 },
  { name: 'Dez', value: 8300 },
];

const SPARTEN_DATA = [
  { name: 'Leben', value: 18500 },
  { name: 'Kranken', value: 12000 },
  { name: 'Schaden', value: 9500 },
  { name: 'Kfz', value: 8500 },
];

export default function VerguetungTab() {
  return (
    <div className="space-y-6">
      <KPIGrid kpiConfig={VG_KPI_CONFIG} kpiValues={VG_KPI_VALUES} />

      <div className="grid grid-cols-2 gap-4">
        <Card>
          <h3 className="font-semibold text-slate-800 mb-4">Provisionsentwicklung (12 Monate)</h3>
          <LineChartComponent data={MONTHLY_DATA} height={260} />
        </Card>
        <Card>
          <h3 className="font-semibold text-slate-800 mb-4">Provision nach Sparte</h3>
          <BarChartComponent data={SPARTEN_DATA} height={260} />
        </Card>
      </div>

      <Card>
        <h3 className="font-semibold text-slate-800 mb-4">Provisionsmodell</h3>
        <div className="grid grid-cols-3 gap-6 text-sm">
          <div>
            <div className="text-slate-400 text-xs uppercase tracking-wider mb-2">Abschlussprovision</div>
            <div className="space-y-1 text-slate-600">
              <div>Leben: 40\u2030 AP</div>
              <div>Kranken: 8x Monatsbeitrag</div>
              <div>Schaden: 20% Erstjahresbeitrag</div>
              <div>Kfz: 10% Erstjahresbeitrag</div>
            </div>
          </div>
          <div>
            <div className="text-slate-400 text-xs uppercase tracking-wider mb-2">Bestandsprovision</div>
            <div className="space-y-1 text-slate-600">
              <div>Leben: 2% lfd. Beitrag</div>
              <div>Kranken: 3% lfd. Beitrag</div>
              <div>Schaden: 15% Jahresbeitrag</div>
              <div>Kfz: 8% Jahresbeitrag</div>
            </div>
          </div>
          <div>
            <div className="text-slate-400 text-xs uppercase tracking-wider mb-2">Bonifikation</div>
            <div className="space-y-1 text-slate-600">
              <div>Ziel 100%: +5% Bonus</div>
              <div>Ziel 120%: +10% Bonus</div>
              <div>Storno &lt;5%: +3% Bonus</div>
              <div>Qualitaet A+: +2% Bonus</div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
