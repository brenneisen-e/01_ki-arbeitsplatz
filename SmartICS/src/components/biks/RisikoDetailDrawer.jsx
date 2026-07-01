import { useState, useEffect } from 'react';
import {
  X, Pencil, Check, Plus, KeyRound, AlertOctagon, History, ChevronRight,
} from 'lucide-react';
import { useBiks } from '../../hooks/useBiks';
import { CLUSTER_MAP, STUFEN, STATUS_MAP, getTeamMember, emptyKontrolle } from '../../data/biksAgent';
import { StatusMenu, StatusIcon } from './StatusControls';
import { PrioTier, HeatmapMini } from './RiskBits';
import SchluesselkontrolleCard from './SchluesselkontrolleCard';
import CommentThread from './CommentThread';
import { formatRelativeDe } from '../../utils/datetime';

function Verlauf({ historie }) {
  if (!historie?.length) return null;
  return (
    <ul className="space-y-1.5">
      {[...historie].reverse().map((h, i) => {
        const m = getTeamMember(h.autorId);
        const s = STATUS_MAP[h.status];
        return (
          <li key={i} className="flex items-center gap-2 text-[12px]">
            <StatusIcon statusId={h.status} />
            <span className="font-semibold" style={{ color: s?.color }}>{s?.label}</span>
            <span className="text-slate-400">·</span>
            <span className="text-slate-500">{m.name}</span>
            {h.note ? <span className="text-slate-400 truncate">— {h.note}</span> : null}
            <span className="text-slate-300 ml-auto shrink-0">{formatRelativeDe(h.at)}</span>
          </li>
        );
      })}
    </ul>
  );
}

export default function RisikoDetailDrawer({ risikoId, onClose }) {
  const { analyse, setRisikoStatus, updateRisiko, addKontrolle, addRisikoComment } = useBiks();
  const [editing, setEditing] = useState(false);
  const [showVerlauf, setShowVerlauf] = useState(false);
  const [newKontrolleId, setNewKontrolleId] = useState(null);

  const risiko = analyse?.risiken.find(r => r.id === risikoId) || null;

  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => { document.removeEventListener('keydown', onKey); document.body.style.overflow = ''; };
  }, [onClose]);

  if (!risiko) return null;
  const c = CLUSTER_MAP[risiko.cluster];
  const set = (patch) => updateRisiko(risiko.id, patch);

  const handleAddKontrolle = () => {
    const id = addKontrolle(risiko.id, { ...emptyKontrolle(Date.now()), name: '', art: 'praeventiv', typ: 'manuell', turnus: 'je-vorgang' });
    setNewKontrolleId(id);
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-[1px] animate-fade-in" onClick={onClose} />

      {/* Drawer */}
      <div className="relative w-full max-w-[720px] bg-slate-50 h-full shadow-2xl flex flex-col drawer-slide-in">
        {/* Kopf */}
        <div className="shrink-0 text-white" style={{ background: 'var(--mode-gradient, linear-gradient(135deg,#0F4D2A,#1D7B3F))' }}>
          <div className="px-5 pt-4 pb-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-2.5 min-w-0">
                <span className="w-8 h-8 rounded-lg flex items-center justify-center text-[14px] font-bold shrink-0" style={{ background: 'rgba(255,255,255,0.22)' }}>
                  {risiko.nummer}
                </span>
                <div className="min-w-0">
                  <div className="text-[11px] uppercase tracking-wider text-white/70 font-semibold">Risiko {risiko.nummer} von 5</div>
                  <div className="text-[12px] text-white/85 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full" style={{ background: c?.color }} /> {risiko.risikoart}
                  </div>
                </div>
              </div>
              <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-white/15 transition-colors shrink-0" title="Schließen (Esc)">
                <X size={20} />
              </button>
            </div>
            {editing ? (
              <input
                value={risiko.titel}
                onChange={(e) => set({ titel: e.target.value })}
                className="mt-3 w-full text-[18px] font-bold bg-white/15 border border-white/25 rounded-lg px-2.5 py-1.5 text-white placeholder-white/50 focus:outline-none"
              />
            ) : (
              <h2 className="mt-3 text-[19px] font-bold leading-snug">{risiko.titel}</h2>
            )}
            <div className="mt-3 flex items-center gap-2 flex-wrap">
              <div onClick={(e) => e.stopPropagation()}>
                <StatusMenu statusId={risiko.status} onChange={(s) => setRisikoStatus(risiko.id, s)} />
              </div>
              <button
                onClick={() => setEditing(v => !v)}
                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-[12px] font-semibold transition-colors"
                style={{ background: 'rgba(255,255,255,0.16)', color: 'white' }}
              >
                {editing ? <><Check size={13} /> Fertig</> : <><Pencil size={13} /> Risiko bearbeiten</>}
              </button>
              <button
                onClick={() => setShowVerlauf(v => !v)}
                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-[12px] font-semibold transition-colors"
                style={{ background: 'rgba(255,255,255,0.16)', color: 'white' }}
              >
                <History size={13} /> Verlauf
              </button>
            </div>
          </div>
        </div>

        {/* Scrollbereich */}
        <div className="flex-1 overflow-y-auto scrollbar-thin p-5 space-y-4">
          {showVerlauf && (
            <div className="card-base p-4">
              <div className="text-[11px] font-bold tracking-wider uppercase text-slate-400 mb-2">Statusverlauf</div>
              <Verlauf historie={risiko.statusHistorie} />
            </div>
          )}

          {/* Risikospezifikation */}
          <div className="card-base p-4">
            <div className="flex items-center gap-2 mb-2">
              <AlertOctagon size={15} style={{ color: c?.color }} />
              <span className="text-[13px] font-semibold">Risikospezifikation</span>
            </div>
            {editing ? (
              <textarea
                value={risiko.risikospezifikation}
                onChange={(e) => set({ risikospezifikation: e.target.value })}
                rows={4}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-[13.5px] resize-none focus:outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
              />
            ) : (
              <p className="text-[13.5px] text-slate-700 leading-relaxed">{risiko.risikospezifikation}</p>
            )}
          </div>

          {/* Wesentlichkeit */}
          <div className="card-base p-4">
            <div className="flex items-center justify-between gap-3 mb-3">
              <span className="text-[13px] font-semibold">Begründung der Wesentlichkeit</span>
              <PrioTier schaden={risiko.schaden} eintritt={risiko.eintritt} />
            </div>
            <div className="flex items-start gap-4">
              <div className="shrink-0 flex flex-col items-center gap-1.5">
                <HeatmapMini schaden={risiko.schaden} eintritt={risiko.eintritt} />
                <span className="text-[9.5px] text-slate-400 uppercase tracking-wider">Schaden × EW</span>
              </div>
              <div className="flex-1 min-w-0">
                {editing && (
                  <div className="grid grid-cols-2 gap-2 mb-2.5">
                    <label className="block">
                      <span className="block text-[10.5px] font-bold uppercase tracking-wider text-slate-400 mb-1">Schadenshöhe</span>
                      <select value={risiko.schaden} onChange={(e) => set({ schaden: e.target.value })} className="w-full px-2 py-1.5 border border-slate-300 rounded-lg text-[12.5px]">
                        {STUFEN.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
                      </select>
                    </label>
                    <label className="block">
                      <span className="block text-[10.5px] font-bold uppercase tracking-wider text-slate-400 mb-1">Eintrittswahrscheinlichkeit</span>
                      <select value={risiko.eintritt} onChange={(e) => set({ eintritt: e.target.value })} className="w-full px-2 py-1.5 border border-slate-300 rounded-lg text-[12.5px]">
                        {STUFEN.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
                      </select>
                    </label>
                  </div>
                )}
                {editing ? (
                  <textarea
                    value={risiko.wesentlichkeit}
                    onChange={(e) => set({ wesentlichkeit: e.target.value })}
                    rows={4}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-[13.5px] resize-none focus:outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
                  />
                ) : (
                  <p className="text-[13.5px] text-slate-700 leading-relaxed">{risiko.wesentlichkeit}</p>
                )}
              </div>
            </div>
          </div>

          {/* Schlüsselkontrollen */}
          <div>
            <div className="flex items-center justify-between gap-2 mb-2.5 px-1">
              <div className="flex items-center gap-2">
                <KeyRound size={15} className="text-emerald-600" />
                <span className="text-[13px] font-semibold">Vorgeschlagene Schlüsselkontrollen</span>
                <span className="chip">{risiko.schluesselkontrollen.length}</span>
              </div>
              <button
                onClick={handleAddKontrolle}
                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[12px] font-semibold text-white transition-colors hover:brightness-110"
                style={{ background: 'var(--mode-primary, #0F4D2A)' }}
              >
                <Plus size={14} /> Kontrolle ergänzen
              </button>
            </div>
            <div className="space-y-2.5">
              {risiko.schluesselkontrollen.map(k => (
                <SchluesselkontrolleCard
                  key={k.id}
                  risikoId={risiko.id}
                  kontrolle={k}
                  defaultOpen={k.id === newKontrolleId || risiko.schluesselkontrollen.length === 1}
                />
              ))}
              {risiko.schluesselkontrollen.length === 0 && (
                <div className="card-base p-6 text-center text-[13px] text-slate-400">
                  Noch keine Schlüsselkontrolle. Ergänzen Sie eine passende Kontrolle.
                </div>
              )}
            </div>
          </div>

          {/* Kollaboration auf Risiko-Ebene */}
          <div className="card-base p-4">
            <CommentThread comments={risiko.comments || []} onAdd={(text) => addRisikoComment(risiko.id, text)} />
          </div>

          <div className="text-[11px] text-slate-400 text-center pt-1 pb-2 flex items-center justify-center gap-1">
            Änderungen werden automatisch gespeichert <ChevronRight size={11} />
          </div>
        </div>
      </div>
    </div>
  );
}
