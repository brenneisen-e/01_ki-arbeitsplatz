import { FileText, Clock, Sparkles, AlertTriangle, TrendingUp, TrendingDown } from 'lucide-react';

const KPI_DATA = [
  {
    label: 'Offene Vorgänge',
    value: '12',
    trend: '+3 diese Woche',
    trendPositive: false,
    icon: FileText,
  },
  {
    label: 'Ø Bearbeitungszeit',
    value: '4,2 Tage',
    trend: 'Ziel: ≤ 5 Tage',
    trendPositive: true,
    icon: Clock,
  },
  {
    label: 'KI-Vorgeprüft',
    value: '87%',
    trend: 'Anteil mit Analyse',
    trendPositive: true,
    icon: Sparkles,
  },
  {
    label: 'Auffälligkeiten erkannt',
    value: '2',
    trend: 'Sofortige Prüfung',
    trendPositive: false,
    icon: AlertTriangle,
    highlight: true,
  },
];

export default function StatistikHeader() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {KPI_DATA.map((kpi, i) => {
        const Icon = kpi.icon;
        const TrendIcon = kpi.trendPositive ? TrendingUp : TrendingDown;
        return (
          <div
            key={i}
            className={`card-base p-4 animate-fade-in-up ${kpi.highlight ? 'border-l-4 border-l-amber-500' : ''}`}
            style={{ animationDelay: `${i * 80}ms` }}
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs text-slate-500 font-medium mb-1">{kpi.label}</p>
                <p className={`text-2xl font-semibold font-mono ${kpi.highlight ? 'text-amber-600' : 'text-slate-800'}`}>
                  {kpi.value}
                </p>
              </div>
              <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${kpi.highlight ? 'bg-amber-50' : 'bg-slate-50'}`}>
                <Icon size={18} className={kpi.highlight ? 'text-amber-500' : 'text-slate-400'} strokeWidth={1.75} />
              </div>
            </div>
            <div className="mt-2 flex items-center gap-1 text-xs">
              <TrendIcon size={12} className={kpi.trendPositive ? 'text-emerald-500' : 'text-amber-500'} />
              <span className={kpi.trendPositive ? 'text-emerald-600' : 'text-amber-600'}>
                {kpi.trend}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
