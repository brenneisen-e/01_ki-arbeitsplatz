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

const GRUND_COLORS = {
  'Preis': 'bg-amber-100 text-amber-700',
  'Wettbewerb': 'bg-blue-100 text-blue-700',
  'Umzug': 'bg-violet-100 text-violet-700',
  'Unzufriedenheit': 'bg-red-100 text-red-700',
  'Sonstiges': 'bg-gray-100 text-gray-600',
};

export default function StornoTab() {
  const { modeId } = useMode();
  const data = STORNO_DATA[modeId] || STORNO_DATA.versicherung;
  const vertraege = data.vertraege || [];

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
        {vertraege.length > 0 ? (
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden" style={{ boxShadow: 'var(--card-shadow)' }}>
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50">
                  <th className="px-4 py-3 text-left text-xs uppercase tracking-wider font-semibold text-slate-400">Kunde</th>
                  <th className="px-4 py-3 text-left text-xs uppercase tracking-wider font-semibold text-slate-400">Produkt</th>
                  <th className="px-4 py-3 text-left text-xs uppercase tracking-wider font-semibold text-slate-400">Sparte</th>
                  <th className="px-4 py-3 text-left text-xs uppercase tracking-wider font-semibold text-slate-400">Prämie/J.</th>
                  <th className="px-4 py-3 text-left text-xs uppercase tracking-wider font-semibold text-slate-400">Storno-Datum</th>
                  <th className="px-4 py-3 text-left text-xs uppercase tracking-wider font-semibold text-slate-400">Grund</th>
                  <th className="px-4 py-3 text-left text-xs uppercase tracking-wider font-semibold text-slate-400">Typ</th>
                </tr>
              </thead>
              <tbody>
                {vertraege.map((v, i) => (
                  <tr key={i} className="border-t border-slate-100 hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3 text-sm font-medium text-slate-700">{v.kunde}</td>
                    <td className="px-4 py-3 text-sm text-slate-700">{v.produkt}</td>
                    <td className="px-4 py-3 text-sm text-slate-500">{v.sparte}</td>
                    <td className="px-4 py-3 text-sm font-mono text-slate-700">{v.praemie?.toLocaleString('de-DE')}€</td>
                    <td className="px-4 py-3 text-sm text-slate-500">{new Date(v.stornoDatum).toLocaleDateString('de-DE')}</td>
                    <td className="px-4 py-3 text-sm">
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${GRUND_COLORS[v.grund] || GRUND_COLORS['Sonstiges']}`}>
                        {v.grund}
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
            Keine {modeId === 'banking' ? 'Kündigungen' : 'Stornierungen'} im aktuellen Zeitraum.
          </div>
        )}
      </Card>
    </div>
  );
}
