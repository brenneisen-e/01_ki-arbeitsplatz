import Card from '../../../components/ui/Card';
import LineChartComponent from '../../../components/charts/LineChartComponent';
import DonutChart from '../../../components/charts/DonutChart';
import { useMode } from '../../../hooks/useMode';
import useTranslation from '../../../i18n/useTranslation';
import { formatEur } from '../../../utils/formatters';
import { Wallet, TrendingUp, BarChart3, Target } from 'lucide-react';

import { VV_REVENUE } from '../../../data/vvExtended';

const FEE_COLORS = ['#1a365d', '#2b4c7e', '#c4a35a', '#6b7280'];

export default function RevenueTab() {
  const { config } = useMode();
  const { t, tn } = useTranslation();
  const data = VV_REVENUE;

  // Cumulative revenue YTD (running total) - more meaningful than monthly billing amounts
  let cumulative = 0;
  const monthlyTotal = data.monthlyRevenue.map(m => {
    cumulative += m.managementFee + m.performanceFee + m.sonstiges;
    return { name: m.name, value: cumulative };
  });
  const ytdTotal = data.monthlyRevenue.reduce((s, m) => s + m.managementFee + m.performanceFee + m.sonstiges, 0);
  const ytdMgmt = data.monthlyRevenue.reduce((s, m) => s + m.managementFee, 0);
  const ytdPerf = data.monthlyRevenue.reduce((s, m) => s + m.performanceFee, 0);
  const forecastTotal = data.forecast.q1 + data.forecast.q2 + data.forecast.q3 + data.forecast.q4;

  const feeDonut = data.feeStruktur.map(f => ({ name: f.typ, value: f.volumen }));

  return (
    <div className="space-y-4">
      {/* KPIs */}
      <div className="grid grid-cols-4 gap-4">
        <KPI icon={Wallet} label={t('ertragYtd')} value={formatEur(ytdTotal)} color="text-slate-800" />
        <KPI icon={TrendingUp} label={t('managementFee')} value={formatEur(ytdMgmt)} color="text-blue-700" />
        <KPI icon={BarChart3} label={t('performanceFee')} value={formatEur(ytdPerf)} color="text-emerald-700" />
        <KPI icon={Target} label={t('forecast')} value={formatEur(forecastTotal)} color="text-amber-700" />
      </div>

      {/* Revenue Trend */}
      <div className="grid grid-cols-3 gap-4">
        <div className="col-span-2">
          <Card>
            <h3 className="font-semibold text-slate-800 mb-4">{t('kumulierterErtragYtd')}</h3>
            <LineChartComponent data={monthlyTotal} height={280} color={config.colors.primaryLight} />
          </Card>
        </div>
        <Card>
          <h3 className="font-semibold text-slate-800 mb-4">{t('feeStruktur')}</h3>
          <DonutChart
            data={feeDonut}
            height={200}
            centerValue={formatEur(ytdTotal)}
            centerLabel={t('gesamt')}
            colors={FEE_COLORS}
          />
          <div className="mt-3 space-y-1.5">
            {data.feeStruktur.map((f, i) => (
              <div key={f.typ} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full legend-dot" style={{ backgroundColor: FEE_COLORS[i] }} />
                  <span className="text-slate-600">{f.typ}</span>
                </div>
                <span className="font-mono text-slate-700">{f.anteil}%</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Mandanten Revenue */}
      <Card hover={false}>
        <h3 className="font-semibold text-slate-800 mb-4">{t('ertragNachMandant')}</h3>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-200 text-left text-xs text-slate-400 uppercase">
              <th className="py-2 pr-3">{t('mandant')}</th>
              <th className="py-2 pr-3 text-right">{t('aum')}</th>
              <th className="py-2 pr-3 text-right">{t('feePA')}</th>
              <th className="py-2 pr-3 text-right">{t('ertragYtd')}</th>
              <th className="py-2">{t('anteil')}</th>
            </tr>
          </thead>
          <tbody>
            {data.mandantenRevenue.map((m, i) => {
              const anteil = ytdTotal > 0 ? ((m.ertrag / ytdTotal) * 100).toFixed(1) : 0;
              return (
                <tr key={i} className="border-b border-slate-100 row-hover cursor-pointer">
                  <td className="py-2.5 pr-3 font-medium text-slate-800">{tn(m.name)}</td>
                  <td className="py-2.5 pr-3 text-right font-mono text-slate-700">{formatEur(m.aum)}</td>
                  <td className="py-2.5 pr-3 text-right font-mono text-slate-600">{m.fee}%</td>
                  <td className="py-2.5 pr-3 text-right font-mono font-medium" style={{ color: config.colors.primaryLight }}>{formatEur(m.ertrag)}</td>
                  <td className="py-2.5">
                    <div className="flex items-center gap-1.5">
                      <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full rounded-full" style={{ width: `${anteil}%`, backgroundColor: config.colors.primaryLight }} />
                      </div>
                      <span className="text-xs text-slate-500">{anteil}%</span>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
          <tfoot>
            <tr className="border-t-2 border-slate-300">
              <td className="py-2.5 pr-3 font-bold text-slate-800">{t('gesamt')}</td>
              <td className="py-2.5 pr-3 text-right font-mono font-bold text-slate-800">
                {formatEur(data.mandantenRevenue.reduce((s, m) => s + m.aum, 0))}
              </td>
              <td className="py-2.5 pr-3 text-right text-slate-400">—</td>
              <td className="py-2.5 pr-3 text-right font-mono font-bold" style={{ color: config.colors.primaryLight }}>
                {formatEur(data.mandantenRevenue.reduce((s, m) => s + m.ertrag, 0))}
              </td>
              <td className="py-2.5 text-xs text-slate-400">100%</td>
            </tr>
          </tfoot>
        </table>
      </Card>

      {/* Forecast */}
      <Card hover={false}>
        <h3 className="font-semibold text-slate-800 mb-4">{t('forecast')}</h3>
        <div className="grid grid-cols-4 gap-4">
          {['Q1', 'Q2', 'Q3', 'Q4'].map((q, i) => {
            const val = [data.forecast.q1, data.forecast.q2, data.forecast.q3, data.forecast.q4][i];
            const isActual = i === 0;
            return (
              <div key={q} className={`text-center py-3 rounded-lg border card-hover ${isActual ? 'border-emerald-200 bg-emerald-50' : 'border-slate-200 bg-slate-50'}`}>
                <div className="text-xs text-slate-400 uppercase mb-1">{q} {isActual ? t('ist') : t('plan')}</div>
                <div className={`text-lg font-mono font-bold ${isActual ? 'text-emerald-700' : 'text-slate-700'}`}>{formatEur(val)}</div>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}

function KPI({ icon: Icon, label, value, color }) {
  return (
    <Card>
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-slate-100">
          <Icon size={20} className="text-slate-500" />
        </div>
        <div>
          <div className={`text-xl font-bold ${color || 'text-slate-800'}`}>{value}</div>
          <div className="text-xs text-slate-500">{label}</div>
        </div>
      </div>
    </Card>
  );
}
