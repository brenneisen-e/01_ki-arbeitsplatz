import Card from '../../../components/ui/Card';
import LineChartComponent from '../../../components/charts/LineChartComponent';
import DonutChart from '../../../components/charts/DonutChart';
import useTranslation from '../../../i18n/useTranslation';
import { formatEur } from '../../../utils/formatters';
import { Wallet, TrendingUp, BarChart3, Target } from 'lucide-react';
import { clsx } from 'clsx';

import { VV_REVENUE } from '../../../data/vvExtended';

// Cockpit 2026: Modusfarbe, Gold, eine Tönung und Neutral — mehr Farbe
// bekommt kein Chart.
const FEE_COLORS = [
  'var(--mode-chart)',
  'var(--mode-accent)',
  'color-mix(in oklab, var(--mode-chart) 45%, white)',
  'var(--border-strong)',
];

const TH = 'py-2.5 pr-3 text-[11px] font-semibold uppercase tracking-wider text-(--text-tertiary)';

export default function RevenueTab() {
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
  const mandantenAuM = data.mandantenRevenue.reduce((s, m) => s + m.aum, 0);
  const mandantenErtrag = data.mandantenRevenue.reduce((s, m) => s + m.ertrag, 0);

  return (
    <div className="space-y-4">
      {/* KPIs */}
      <div className="grid grid-cols-4 gap-4">
        <KPI icon={Wallet} label={t('ertragYtd')} value={formatEur(ytdTotal)} />
        <KPI icon={TrendingUp} label={t('managementFee')} value={formatEur(ytdMgmt)} />
        <KPI icon={BarChart3} label={t('performanceFee')} value={formatEur(ytdPerf)} />
        <KPI icon={Target} label={t('forecast')} value={formatEur(forecastTotal)} accent />
      </div>

      {/* Revenue Trend */}
      <div className="grid grid-cols-3 gap-4">
        <div className="col-span-2">
          <Card>
            <h3 className="font-semibold text-(--text-primary) mb-4">{t('kumulierterErtragYtd')}</h3>
            <LineChartComponent data={monthlyTotal} height={280} color="var(--mode-chart)" />
          </Card>
        </div>
        <Card>
          <h3 className="font-semibold text-(--text-primary) mb-4">{t('feeStruktur')}</h3>
          <DonutChart
            data={feeDonut}
            height={250}
            centerValue={formatEur(ytdTotal)}
            centerLabel={t('gesamt')}
            colors={FEE_COLORS}
          />
          <div className="mt-3 space-y-1.5">
            {data.feeStruktur.map((f, i) => (
              <div key={f.typ} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: FEE_COLORS[i % FEE_COLORS.length] }} />
                  <span className="text-(--text-secondary)">{f.typ}</span>
                </div>
                <span className="font-mono text-(--text-primary)">{f.anteil}%</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Mandanten Revenue */}
      <Card hover={false}>
        <h3 className="font-semibold text-(--text-primary) mb-4">{t('ertragNachMandant')}</h3>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-(--border-light) text-left">
              <th className={TH}>{t('mandant')}</th>
              <th className={clsx(TH, 'text-right')}>{t('aum')}</th>
              <th className={clsx(TH, 'text-right')}>{t('feePA')}</th>
              <th className={clsx(TH, 'text-right')}>{t('ertragYtd')}</th>
              <th className={clsx(TH, 'pr-0')}>{t('anteil')}</th>
            </tr>
          </thead>
          <tbody>
            {data.mandantenRevenue.map((m, i) => {
              const anteil = ytdTotal > 0 ? ((m.ertrag / ytdTotal) * 100).toFixed(1) : 0;
              return (
                <tr
                  key={i}
                  className={clsx(
                    'border-b border-(--border-light) cursor-pointer transition-colors duration-150 hover:bg-(--bg-table-hover)',
                    i % 2 === 1 && 'bg-(--bg-table-stripe)'
                  )}
                >
                  <td className="py-2.5 pr-3 pl-2 font-medium text-(--text-primary)">{tn(m.name)}</td>
                  <td className="py-2.5 pr-3 text-right font-mono text-(--text-primary)">{formatEur(m.aum)}</td>
                  <td className="py-2.5 pr-3 text-right font-mono text-(--text-secondary)">{m.fee}%</td>
                  <td className="py-2.5 pr-3 text-right font-mono font-medium text-(--mode-primary)">{formatEur(m.ertrag)}</td>
                  <td className="py-2.5">
                    <div className="flex items-center gap-1.5">
                      <div className="progress-track w-16 h-1.5 rounded-full overflow-hidden">
                        <div className="progress-fill h-full rounded-full" style={{ width: `${anteil}%` }} />
                      </div>
                      <span className="text-xs font-mono text-(--text-tertiary)">{anteil}%</span>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
          <tfoot>
            <tr className="border-t border-(--border-strong)">
              <td className="py-2.5 pr-3 pl-2 font-semibold text-(--text-primary)">{t('gesamt')}</td>
              <td className="py-2.5 pr-3 text-right font-mono font-semibold text-(--text-primary)">
                {formatEur(mandantenAuM)}
              </td>
              <td className="py-2.5 pr-3 text-right text-(--text-tertiary)">–</td>
              <td className="py-2.5 pr-3 text-right font-mono font-semibold text-(--mode-primary)">
                {formatEur(mandantenErtrag)}
              </td>
              <td className="py-2.5 text-xs font-mono text-(--text-tertiary)">100%</td>
            </tr>
          </tfoot>
        </table>
      </Card>

      {/* Forecast */}
      <Card hover={false}>
        <h3 className="font-semibold text-(--text-primary) mb-4">{t('forecast')}</h3>
        <div className="grid grid-cols-4 gap-4">
          {['Q1', 'Q2', 'Q3', 'Q4'].map((q, i) => {
            const val = [data.forecast.q1, data.forecast.q2, data.forecast.q3, data.forecast.q4][i];
            const isActual = i === 0;
            return (
              <div
                key={q}
                className={clsx(
                  'text-center py-3 rounded-[10px] border card-hover',
                  isActual ? 'bg-(--tint-success) border-transparent' : 'surface-inset'
                )}
              >
                <div className="text-[11px] font-semibold uppercase tracking-wider text-(--text-tertiary) mb-1">{q} {isActual ? t('ist') : t('plan')}</div>
                <div className={clsx('text-lg font-mono font-semibold', isActual ? 'text-(--color-success)' : 'text-(--text-primary)')}>{formatEur(val)}</div>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}

function KPI({ icon: Icon, label, value, accent = false }) {
  return (
    <Card>
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-[10px] bg-(--mode-primary-soft) kpi-icon-box">
          <Icon size={20} style={{ color: 'var(--_fg, var(--mode-primary))' }} />
        </div>
        <div className="min-w-0">
          <div className={clsx('text-xl font-mono font-semibold truncate', accent ? 'text-(--mode-accent)' : 'text-(--text-primary)')}>{value}</div>
          <div className="text-xs text-(--text-tertiary)">{label}</div>
        </div>
      </div>
    </Card>
  );
}
