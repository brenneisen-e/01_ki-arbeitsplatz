import KPIGrid from '../../../components/ui/KPIGrid';
import { getLang } from '../../../utils/langHelper';
import Card from '../../../components/ui/Card';
import BarChartComponent from '../../../components/charts/BarChartComponent';
import { useMode } from '../../../hooks/useMode';
import useTranslation from '../../../i18n/useTranslation';
import { STORNO_DATA } from '../../../data';
import { clsx } from 'clsx';

// Stornogrund als getönte Plakette: zarte Fläche in der Statusfarbe, Text in
// derselben Farbe, kein Rahmen in Signalfarbe (Cockpit 2026).
const GRUND_COLORS = {
  'Preis': 'bg-(--tint-warning) text-(--color-warning)',
  'Wettbewerb': 'bg-(--tint-info) text-(--color-info)',
  'Umzug': 'bg-violet-50 text-violet-700',
  'Unzufriedenheit': 'bg-(--tint-danger) text-(--color-danger)',
  'Sonstiges': 'bg-(--bg-inset) text-(--text-secondary)',
};

const TH = 'px-4 py-3 text-left text-[11px] uppercase tracking-wider font-semibold text-(--text-tertiary)';

export default function StornoTab() {
  const { modeId } = useMode();
  const { t } = useTranslation();

  const STORNO_KPI_CONFIG = {
    versicherung: [
      { id: 'stornoAnzahl', label: t('stornierungen'), format: 'num', icon: 'AlertTriangle' },
      { id: 'stornoQuote', label: t('stornoQuote'), format: 'pct', icon: 'TrendingDown' },
      { id: 'stornoVolumen', label: t('stornoVolumen'), format: 'eur', icon: 'Briefcase' },
      { id: 'fruehstorno', label: t('fruehstornoKurz'), format: 'num', icon: 'Clock' },
    ],
    banking: [
      { id: 'stornoAnzahl', label: t('produktkuendigungen'), format: 'num', icon: 'AlertTriangle' },
      { id: 'stornoQuote', label: t('kuendigungsquote'), format: 'pct', icon: 'TrendingDown' },
      { id: 'stornoVolumen', label: t('abgeflVolumen'), format: 'eur', icon: 'Briefcase' },
      { id: 'fruehstorno', label: t('kundenabgaenge'), format: 'num', icon: 'Clock' },
    ],
    vermoegensverwaltung: [
      { id: 'stornoAnzahl', label: t('mandatskuendigungen'), format: 'num', icon: 'AlertTriangle' },
      { id: 'stornoQuote', label: t('kuendigungsquote'), format: 'pct', icon: 'TrendingDown' },
      { id: 'stornoVolumen', label: t('aumAbfluss'), format: 'eur', icon: 'Briefcase' },
      { id: 'fruehstorno', label: t('fruehkuendigungen'), format: 'num', icon: 'Clock' },
    ],
  };
  const data = STORNO_DATA[modeId] || STORNO_DATA.versicherung;
  const vertraege = data.vertraege || [];
  const lang = getLang();

  return (
    <div className="space-y-6">
      <KPIGrid kpiConfig={STORNO_KPI_CONFIG[modeId] || STORNO_KPI_CONFIG.versicherung} kpiValues={data.kpiValues} />

      <Card>
        <h3 className="font-semibold text-(--text-primary) mb-4">
          {modeId === 'banking' ? t('kuendigungsgruende') : t('stornoGruende')}
        </h3>
        <BarChartComponent
          data={data.gruende}
          height={280}
          color="var(--mode-chart)"
        />
      </Card>

      <Card hover={false}>
        <h3 className="font-semibold text-(--text-primary) mb-4">
          {modeId === 'banking' ? t('gekuendigteKontenProdukte') : t('stornierteVertraege')}
        </h3>
        {vertraege.length > 0 ? (
          <div className="surface-inset rounded-xl overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="bg-(--bg-card) border-b border-(--border-light)">
                  <th className={TH}>{t('kunde')}</th>
                  <th className={TH}>{t('produkt')}</th>
                  <th className={TH}>{t('sparte')}</th>
                  <th className={clsx(TH, 'text-right')}>{t('praemieJ')}</th>
                  <th className={TH}>{t('stornoDatum')}</th>
                  <th className={TH}>{t('grund')}</th>
                  <th className={TH}>{t('typ')}</th>
                </tr>
              </thead>
              <tbody>
                {vertraege.map((v, i) => (
                  <tr
                    key={i}
                    className={clsx(
                      'border-t border-(--border-light) transition-colors duration-150 cursor-pointer hover:bg-(--bg-table-hover)',
                      i % 2 === 0 ? 'bg-(--bg-card)' : 'bg-(--bg-table-stripe)'
                    )}
                  >
                    <td className="px-4 py-3 text-sm font-medium text-(--text-primary)">{v.kunde}</td>
                    <td className="px-4 py-3 text-sm text-(--text-primary)">{v.produkt}</td>
                    <td className="px-4 py-3 text-sm text-(--text-secondary)">{v.sparte}</td>
                    <td className="px-4 py-3 text-sm font-mono text-(--text-primary) text-right">{v.praemie?.toLocaleString(lang === 'en' ? 'en-US' : 'de-DE')}€</td>
                    <td className="px-4 py-3 text-sm text-(--text-secondary)">{new Date(v.stornoDatum).toLocaleDateString(lang === 'en' ? 'en-GB' : 'de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' })}</td>
                    <td className="px-4 py-3 text-sm">
                      <span className={clsx('inline-flex px-2 py-0.5 rounded-full text-xs font-medium', GRUND_COLORS[v.grund] || GRUND_COLORS['Sonstiges'])}>
                        {t(`stornoGrund.${v.grund.toLowerCase()}`) || v.grund}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <span className={clsx('inline-flex px-2 py-0.5 rounded-full text-xs font-medium', v.typ === 'Frühstorno' ? 'bg-(--tint-danger) text-(--color-danger)' : 'bg-(--bg-inset) text-(--text-secondary)')}>
                        {v.typ}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-sm text-(--text-tertiary) py-8 text-center">
            {modeId === 'banking' ? t('keineKuendigungen') : t('keineStornierungen')}
          </div>
        )}
      </Card>
    </div>
  );
}
