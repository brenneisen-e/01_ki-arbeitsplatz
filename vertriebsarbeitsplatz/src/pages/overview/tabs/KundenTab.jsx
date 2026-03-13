import { useState } from 'react';
import KPIGrid from '../../../components/ui/KPIGrid';
import Avatar from '../../../components/ui/Avatar';
import { useMode } from '../../../hooks/useMode';
import { KUNDEN_BY_MODE } from '../../../data';
import { formatEur, potentialSterne } from '../../../utils/formatters';
import { Star, Search, TrendingDown, Minus, AlertTriangle, ChevronRight } from 'lucide-react';

const K_KPI_CONFIG = [
  { id: 'kundenAnzahl', label: 'Kunden', format: 'num', icon: 'Users' },
  { id: 'avgVertraege', label: '\u00d8 Vertraege/Kunde', format: 'num', icon: 'FileText' },
  { id: 'avgVolumen', label: '\u00d8 Bestandsvolumen', format: 'eur', icon: 'Briefcase' },
  { id: 'avgNps', label: '\u00d8 NPS', format: 'num', icon: 'ThumbsUp' },
];

const VV_KPI_CONFIG = [
  { id: 'mandatAnzahl', label: 'Mandate', format: 'num', icon: 'Users' },
  { id: 'gesamtAuM', label: 'AuM Gesamt', format: 'eur', icon: 'Wallet' },
  { id: 'avgAuM', label: '\u00d8 AuM/Mandant', format: 'eur', icon: 'Briefcase' },
  { id: 'avgNps', label: '\u00d8 NPS', format: 'num', icon: 'ThumbsUp' },
];

function StarRating({ score }) {
  const { full, half, empty } = potentialSterne(score);
  return (
    <div className="flex items-center gap-0.5">
      {Array(full).fill(0).map((_, i) => <Star key={`f${i}`} size={13} className="text-amber-400 fill-amber-400" />)}
      {half ? <Star size={13} className="text-amber-400 fill-amber-400/50" /> : null}
      {Array(empty).fill(0).map((_, i) => <Star key={`e${i}`} size={13} className="text-slate-200" />)}
    </div>
  );
}

function formatAuM(val) {
  if (val == null || val === 0) return '-';
  if (val >= 1000000) return `${(val / 1000000).toFixed(1)}M\u20ac`;
  if (val >= 1000) return `${Math.round(val / 1000)}k\u20ac`;
  return formatEur(val);
}

function SegmentBadge({ typ }) {
  if (!typ) return null;
  const styles = {
    FairValue: 'bg-blue-50 text-blue-700 border-blue-200',
    SmartValue: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    Spezialmandat: 'bg-purple-50 text-purple-700 border-purple-200',
  };
  return (
    <span className={`inline-flex items-center text-[10px] font-semibold px-2 py-0.5 rounded-full border ${styles[typ] || 'bg-slate-50 text-slate-500 border-slate-200'}`}>
      {typ}
    </span>
  );
}

function RiskBadge({ risk }) {
  if (!risk) return null;
  const styles = {
    niedrig: 'text-emerald-600',
    mittel: 'text-amber-600',
    hoch: 'text-red-600',
  };
  const icons = {
    niedrig: <TrendingDown size={11} />,
    mittel: <Minus size={11} />,
    hoch: <AlertTriangle size={11} />,
  };
  return (
    <span className={`inline-flex items-center gap-0.5 text-[10px] font-medium ${styles[risk] || 'text-slate-400'}`}>
      {icons[risk]} {risk === 'niedrig' ? 'Stabil' : risk === 'mittel' ? 'Beobachten' : 'Risiko'}
    </span>
  );
}

function NpsBadge({ nps }) {
  if (nps == null) return <span className="text-xs text-slate-300">-</span>;
  return (
    <span className={`text-sm font-semibold ${nps >= 7 ? 'text-emerald-600' : nps >= 5 ? 'text-amber-600' : 'text-red-600'}`}>
      {nps}
    </span>
  );
}

// ─── Compact Card Row (shared across all modes) ───
function KundenCardRow({ kunde, modeId, navigateTo }) {
  const isVV = modeId === 'vermoegensverwaltung';
  const isBanking = modeId === 'banking';

  const volumen = isVV
    ? (kunde.aum || kunde.eigeneProdukte?.reduce((s, p) => s + (p.volumen || 0), 0) || 0)
    : (kunde.eigeneProdukte?.reduce((s, p) => s + (p.praemie || p.volumen || 0), 0) || 0);

  const letzterKontakt = kunde.kommunikation?.[0]?.datum;
  const potCount = kunde.potentiale?.filter(p => p.status !== 'abgeschlossen')?.length || 0;

  return (
    <div
      onClick={() => navigateTo('detail', { kundeId: kunde.id })}
      className="group bg-white rounded-xl border border-slate-200 px-4 py-3 flex items-center gap-3 cursor-pointer transition-all duration-150 hover:border-slate-300 hover:shadow-sm"
      style={{ boxShadow: 'var(--card-shadow)' }}
    >
      {/* Avatar + Name + Beruf */}
      <div className="flex items-center gap-3 min-w-0 w-[200px] shrink-0">
        <Avatar name={kunde.name} foto={kunde.foto} size={36} />
        <div className="min-w-0">
          <div className="font-semibold text-sm text-slate-800 truncate">{kunde.name}</div>
          <div className="text-[11px] text-slate-400 truncate">{kunde.beruf}</div>
        </div>
      </div>

      {/* Segment Badge (VV only) */}
      {isVV && (
        <div className="w-[85px] shrink-0">
          <SegmentBadge typ={kunde.mandatsTyp} />
        </div>
      )}

      {/* Volume / AuM */}
      <div className="w-[90px] shrink-0 text-right">
        <div className="text-sm font-semibold text-slate-800 font-mono">
          {isVV ? formatAuM(volumen) : formatEur(volumen)}
        </div>
        <div className="text-[10px] text-slate-400">{isVV ? 'AuM' : isBanking ? 'Volumen' : 'Praemie'}</div>
      </div>

      {/* Performance YTD (VV only) */}
      {isVV && (
        <div className="w-[60px] shrink-0 text-right">
          {kunde.portfolio?.performance?.ytd != null ? (
            <>
              <div className={`text-sm font-semibold font-mono ${kunde.portfolio.performance.ytd >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                {kunde.portfolio.performance.ytd >= 0 ? '+' : ''}{kunde.portfolio.performance.ytd.toFixed(1)}%
              </div>
              <div className="text-[10px] text-slate-400">YTD</div>
            </>
          ) : (
            <span className="text-xs text-slate-300">-</span>
          )}
        </div>
      )}

      {/* Potenzial Stars */}
      <div className="w-[80px] shrink-0">
        <StarRating score={kunde.potentialScore || 0} />
        {potCount > 0 && (
          <div className="text-[10px] text-slate-400 mt-0.5">{potCount} offen</div>
        )}
      </div>

      {/* NPS */}
      <div className="w-[40px] shrink-0 text-center">
        <NpsBadge nps={kunde.nps} />
        <div className="text-[10px] text-slate-400">NPS</div>
      </div>

      {/* Risk / Abwanderung */}
      <div className="w-[65px] shrink-0 text-center">
        <RiskBadge risk={kunde.abwanderungsrisiko} />
      </div>

      {/* Last Contact */}
      <div className="w-[55px] shrink-0 text-right">
        {letzterKontakt ? (
          <span className="text-xs text-slate-500">{letzterKontakt.slice(5)}</span>
        ) : (
          <span className="text-xs text-slate-300">-</span>
        )}
      </div>

      {/* Chevron */}
      <ChevronRight size={16} className="text-slate-300 group-hover:text-slate-500 shrink-0 ml-auto transition-colors" />
    </div>
  );
}

export default function KundenTab() {
  const { modeId, navigateTo } = useMode();
  const kunden = KUNDEN_BY_MODE[modeId] || [];
  const [filter, setFilter] = useState('');
  const isVV = modeId === 'vermoegensverwaltung';

  const filtered = kunden.filter(k =>
    !filter || k.name.toLowerCase().includes(filter.toLowerCase())
  );

  let kpiConfig, kpiValues;

  if (isVV) {
    const gesamtAuM = kunden.reduce((s, k) => s + (k.aum || k.eigeneProdukte?.reduce((ps, p) => ps + (p.volumen || 0), 0) || 0), 0);
    const avgAuM = gesamtAuM / (kunden.length || 1);
    const avgNps = kunden.reduce((s, k) => s + (k.nps || 0), 0) / (kunden.length || 1);

    kpiConfig = VV_KPI_CONFIG;
    kpiValues = {
      mandatAnzahl: { wert: kunden.length, trend: 2.1 },
      gesamtAuM: { wert: gesamtAuM, trend: 4.5 },
      avgAuM: { wert: Math.round(avgAuM), trend: 2.3 },
      avgNps: { wert: parseFloat(avgNps.toFixed(1)), trend: 0.3 },
    };
  } else {
    const avgVertraege = kunden.reduce((s, k) => s + (k.eigeneProdukte?.length || 0), 0) / (kunden.length || 1);
    const avgVolumen = kunden.reduce((s, k) => s + k.eigeneProdukte?.reduce((ps, p) => ps + (p.praemie || 0), 0), 0) / (kunden.length || 1);
    const avgNps = kunden.reduce((s, k) => s + (k.nps || 0), 0) / (kunden.length || 1);

    kpiConfig = K_KPI_CONFIG;
    kpiValues = {
      kundenAnzahl: { wert: kunden.length, trend: 3.2 },
      avgVertraege: { wert: parseFloat(avgVertraege.toFixed(1)), trend: 0.2 },
      avgVolumen: { wert: Math.round(avgVolumen), trend: 1.5 },
      avgNps: { wert: parseFloat(avgNps.toFixed(1)), trend: 0.3 },
    };
  }

  const kundenLabel = isVV ? 'Mandant' : 'Kunde';

  return (
    <div className="space-y-5">
      <KPIGrid kpiConfig={kpiConfig} kpiValues={kpiValues} />

      <div className="flex gap-3 items-center">
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={filter}
            onChange={e => setFilter(e.target.value)}
            placeholder={`${kundenLabel} suchen...`}
            className="pl-9 pr-4 py-2 rounded-lg border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-slate-300 w-64"
          />
        </div>
        <div className="text-xs text-slate-400 ml-2">
          {filtered.length} {filtered.length === 1 ? kundenLabel : isVV ? 'Mandanten' : 'Kunden'}
        </div>
      </div>

      {/* Column headers */}
      <div className="flex items-center gap-3 px-4 text-[10px] uppercase tracking-wider font-semibold text-slate-400">
        <div className="w-[200px] shrink-0 pl-12">Name</div>
        {isVV && <div className="w-[85px] shrink-0">Segment</div>}
        <div className="w-[90px] shrink-0 text-right">{isVV ? 'AuM' : 'Volumen'}</div>
        {isVV && <div className="w-[60px] shrink-0 text-right">Perf.</div>}
        <div className="w-[80px] shrink-0">Potenzial</div>
        <div className="w-[40px] shrink-0 text-center">NPS</div>
        <div className="w-[65px] shrink-0 text-center">Status</div>
        <div className="w-[55px] shrink-0 text-right">Kontakt</div>
      </div>

      {/* Card rows */}
      <div className="space-y-1.5">
        {filtered.map(k => (
          <KundenCardRow key={k.id} kunde={k} modeId={modeId} navigateTo={navigateTo} />
        ))}
      </div>
    </div>
  );
}
