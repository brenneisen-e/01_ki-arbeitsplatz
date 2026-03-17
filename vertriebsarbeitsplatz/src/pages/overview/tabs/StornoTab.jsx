import KPIGrid from '../../../components/ui/KPIGrid';
import { getLang } from '../../../utils/langHelper';
import Card from '../../../components/ui/Card';
import BarChartComponent from '../../../components/charts/BarChartComponent';
import { useMode } from '../../../hooks/useMode';
import useTranslation from '../../../i18n/useTranslation';
import { STORNO_DATA } from '../../../data';

const GRUND_COLORS = {
  'Preis': 'bg-amber-100 text-amber-700',
  'Wettbewerb': 'bg-blue-100 text-blue-700',
  'Umzug': 'bg-violet-100 text-violet-700',
  'Unzufriedenheit': 'bg-red-100 text-red-700',
  'Sonstiges': 'bg-gray-100 text-gray-600',
};

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

  return (
    <div className="space-y-6">
      <KPIGrid kpiConfig={STORNO_KPI_CONFIG[modeId] || STORNO_KPI_CONFIG.versicherung} kpiValues={data.kpiValues} />

      <Card>
        <h3 className="font-semibold text-slate-800 mb-4">
          {modeId === 'banking' ? t('kuendigungsgruende') : t('stornoGruende')}
        </h3>
        <BarChartComponent
          data={data.gruende}
          height={280}
          color="#ef4444"
        />
      </Card>

      <Card>
        <h3 className="font-semibold text-slate-800 mb-4">
          {modeId === 'banking' ? t('gekuendigteKontenProdukte') : t('stornierteVertraege')}
        </h3>
        {vertraege.length > 0 ? (
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden" style={{ boxShadow: 'var(--card-shadow)' }}>
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50">
                  <th className="px-4 py-3 text-left text-xs uppercase tracking-wider font-semibold text-slate-400">{t('kunde')}</th>
                  <th className="px-4 py-3 text-left text-xs uppercase tracking-wider font-semibold text-slate-400">{t('produkt')}</th>
                  <th className="px-4 py-3 text-left text-xs uppercase tracking-wider font-semibold text-slate-400">{t('sparte')}</th>
                  <th className="px-4 py-3 text-left text-xs uppercase tracking-wider font-semibold text-slate-400">{t('praemieJ')}</th>
                  <th className="px-4 py-3 text-left text-xs uppercase tracking-wider font-semibold text-slate-400">{t('stornoDatum')}</th>
                  <th className="px-4 py-3 text-left text-xs uppercase tracking-wider font-semibold text-slate-400">{t('grund')}</th>
                  <th className="px-4 py-3 text-left text-xs uppercase tracking-wider font-semibold text-slate-400">{t('typ')}</th>
                </tr>
              </thead>
              <tbody>
                {vertraege.map((v, i) => (
                  <tr key={i} className="border-t border-slate-100 hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3 text-sm font-medium text-slate-700">{v.kunde}</td>
                    <td className="px-4 py-3 text-sm text-slate-700">{v.produkt}</td>
                    <td className="px-4 py-3 text-sm text-slate-500">{v.sparte}</td>
                    <td className="px-4 py-3 text-sm font-mono text-slate-700">{v.praemie?.toLocaleString(getLang() === 'en' ? 'en-US' : 'de-DE')}€</td>
                    <td className="px-4 py-3 text-sm text-slate-500">{new Date(v.stornoDatum).toLocaleDateString(getLang() === 'en' ? 'en-GB' : 'de-DE')}</td>
                    <td className="px-4 py-3 text-sm">
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${GRUND_COLORS[v.grund] || GRUND_COLORS['Sonstiges']}`}>
                        {t(`stornoGrund.${v.grund.toLowerCase()}`) || v.grund}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${v.typ === 'Frühstorno' ? 'bg-red-50 text-red-600' : 'bg-slate-100 text-slate-600'}`}>
                        {v.typ}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-sm text-slate-500 py-8 text-center">
            {modeId === 'banking' ? t('keineKuendigungen') : t('keineStornierungen')}
          </div>
        )}
      </Card>
    </div>
  );
}
