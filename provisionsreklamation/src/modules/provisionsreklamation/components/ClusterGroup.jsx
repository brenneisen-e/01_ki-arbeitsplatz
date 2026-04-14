import { useState } from 'react';
import { Layers, ChevronDown, Sparkles } from 'lucide-react';
import VorgangCard from './VorgangCard';

// Cluster-Titel je clusterId. Der Titel erscheint als Kopfzeile über den
// gruppierten Vorgang-Cards und erklärt dem Sachbearbeiter auf einen Blick,
// warum die KI diese Vorgänge inhaltlich zusammengefasst hat.
const CLUSTER_META = {
  'cluster-tfrv-dynamik': {
    titel: 'T-FRV Dynamik-AP fehlend',
    beschreibung: 'Dynamikerhöhungen werden auf Tarif T-FRV umgesetzt, aber es wird keine Abschlussprovision auf den Mehrbeitrag gebucht. KI hat diese Reklamationen als inhaltlich identisch erkannt.',
  },
};

export default function ClusterGroup({ clusterId, vorgaenge, selectedId, onSelect }) {
  const [expanded, setExpanded] = useState(true);
  const meta = CLUSTER_META[clusterId] || { titel: 'Cluster', beschreibung: 'Inhaltlich identische Vorgänge.' };
  const count = vorgaenge.length;

  const fmtEur = (val) => new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(val);
  const summe = vorgaenge.reduce((s, v) => s + (Number(v.differenz) || 0), 0);

  return (
    <div className="rounded-lg border-2 border-amber-300 bg-amber-50/60 overflow-hidden">
      <button
        type="button"
        onClick={() => setExpanded(v => !v)}
        className="w-full text-left px-3 py-2.5 flex items-start justify-between gap-2 hover:bg-amber-100/60 transition-colors"
      >
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5 text-[10px] font-bold tracking-wider uppercase text-amber-700 mb-0.5">
            <Sparkles size={11} strokeWidth={2.5} />
            KI-Cluster erkannt
          </div>
          <div className="flex items-center gap-2">
            <Layers size={14} className="text-amber-600 shrink-0" strokeWidth={2} />
            <p className="text-sm font-semibold text-slate-800 truncate">
              {count} inhaltlich identische Vorgänge
            </p>
          </div>
          <p className="text-xs font-medium text-amber-800 mt-0.5">{meta.titel}</p>
          <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">{meta.beschreibung}</p>
          <p className="text-[11px] text-slate-600 mt-1">
            Summe Differenzen: <span className="font-mono font-semibold text-red-600">{fmtEur(summe)}</span>
          </p>
        </div>
        <ChevronDown
          size={16}
          className={`text-amber-700 shrink-0 mt-1 transition-transform ${expanded ? 'rotate-180' : ''}`}
          strokeWidth={2}
        />
      </button>

      {expanded && (
        <div className="px-2 pb-2 pt-1 space-y-2 bg-white/60">
          {vorgaenge.map(v => (
            <VorgangCard
              key={v.id}
              vorgang={v}
              isActive={selectedId === v.id}
              onClick={() => onSelect(v)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
