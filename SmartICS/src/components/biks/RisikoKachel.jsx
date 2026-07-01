import { KeyRound, MessageSquare, ArrowUpRight } from 'lucide-react';
import { CLUSTER_MAP } from '../../data/biksAgent';
import { useBiks } from '../../hooks/useBiks';
import { StatusMenu } from './StatusControls';
import { RisikoartBadge, SchadenEintritt, PrioTier, HeatmapMini } from './RiskBits';

export default function RisikoKachel({ risiko, onOpen }) {
  const { setRisikoStatus } = useBiks();
  const c = CLUSTER_MAP[risiko.cluster];
  const kontrollen = risiko.schluesselkontrollen || [];
  const commentCount = (risiko.comments?.length || 0) + kontrollen.reduce((n, k) => n + (k.comments?.length || 0), 0);

  return (
    <button
      onClick={onOpen}
      className="card-base text-left p-0 flex flex-col group hover:shadow-lg transition-all duration-200 hover:-translate-y-0.5 relative overflow-hidden"
      style={{ borderColor: '#E2E8F0' }}
    >
      {/* Farbleiste nach Cluster */}
      <span className="absolute top-0 left-0 h-full w-1" style={{ background: c?.color || '#94A3B8' }} />

      <div className="p-4 pl-5 flex flex-col h-full gap-3">
        {/* Kopf */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <span
              className="w-7 h-7 rounded-lg flex items-center justify-center text-white text-[13px] font-bold shrink-0"
              style={{ background: c?.color || '#94A3B8' }}
            >
              {risiko.nummer}
            </span>
            <RisikoartBadge clusterId={risiko.cluster} label={risiko.risikoart} />
          </div>
          <div onClick={(e) => e.stopPropagation()}>
            <StatusMenu statusId={risiko.status} onChange={(s) => setRisikoStatus(risiko.id, s)} align="right" />
          </div>
        </div>

        {/* Titel + Spezifikation */}
        <div className="min-w-0 flex-1">
          <div className="text-[15px] font-bold leading-snug text-slate-800 group-hover:text-slate-900">
            {risiko.titel}
          </div>
          <p className="text-[12.5px] text-slate-500 leading-snug mt-1.5 line-clamp-3">
            {risiko.risikospezifikation}
          </p>
        </div>

        {/* Bewertung */}
        <div className="flex items-center justify-between gap-2 pt-1">
          <div className="flex flex-col gap-1.5">
            <SchadenEintritt schaden={risiko.schaden} eintritt={risiko.eintritt} />
            <PrioTier schaden={risiko.schaden} eintritt={risiko.eintritt} />
          </div>
          <HeatmapMini schaden={risiko.schaden} eintritt={risiko.eintritt} />
        </div>

        {/* Fuß */}
        <div className="flex items-center justify-between gap-2 pt-2.5 border-t border-slate-100">
          <div className="flex items-center gap-3 text-[11.5px] text-slate-500">
            <span className="inline-flex items-center gap-1" title="Schlüsselkontrollen">
              <KeyRound size={13} className="text-emerald-600" /> {kontrollen.length} Schlüsselkontrolle{kontrollen.length === 1 ? '' : 'n'}
            </span>
            {commentCount > 0 && (
              <span className="inline-flex items-center gap-1" title="Kommentare">
                <MessageSquare size={12} /> {commentCount}
              </span>
            )}
          </div>
          <span className="inline-flex items-center gap-1 text-[11.5px] font-semibold text-slate-400 group-hover:text-emerald-700 transition-colors">
            Öffnen <ArrowUpRight size={13} />
          </span>
        </div>
      </div>
    </button>
  );
}
