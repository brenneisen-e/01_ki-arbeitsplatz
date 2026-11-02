import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import {
  X, Pencil, Check, Plus, KeyRound, AlertOctagon, History, ChevronRight,
  Minus, PencilLine, Bot,
} from 'lucide-react';
import { useBiks } from '../../hooks/useBiks';
import { CLUSTER_MAP, STUFEN, getTeamMember, emptyKontrolle } from '../../data/biksAgent';
import { StatusMenu } from './StatusControls';
import { PrioTier, HeatmapMini } from './RiskBits';
import SchluesselkontrolleCard from './SchluesselkontrolleCard';
import CommentThread from './CommentThread';
import { formatDateTimeDe } from '../../utils/datetime';

function ChangeRow({ c }) {
  const map = {
    added: { color: '#059669', bg: '#ECFDF5', Icon: Plus, label: 'Neu' },
    removed: { color: '#DC2626', bg: '#FEF2F2', Icon: Minus, label: 'Entfernt' },
    changed: { color: '#D97706', bg: '#FFFBEB', Icon: PencilLine, label: 'Geändert' },
  };
  const s = map[c.type] || map.changed;
  const Icon = s.Icon;
  return (
    <div className="flex items-start gap-2 rounded-lg p-2.5" style={{ background: s.bg, border: `1px solid color-mix(in srgb, ${s.color} 22%, transparent)` }}>
      <span className="w-5 h-5 rounded-md flex items-center justify-center shrink-0 mt-0.5" style={{ background: 'white' }}>
        <Icon size={13} style={{ color: s.color }} />
      </span>
      <div className="min-w-0 text-[12.5px] flex-1">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="inline-flex items-center rounded-full px-1.5 py-[1px] text-[10px] font-bold uppercase tracking-wide" style={{ background: s.color, color: 'white' }}>{s.label}</span>
          <span className="font-semibold" style={{ color: s.color }}>{c.feld}</span>
        </div>
        {c.type === 'changed' ? (
          <div className="text-slate-600 mt-1 break-words">
            <span className="line-through text-slate-400">{c.alt || '—'}</span>
            <span className="mx-1.5 text-slate-400">→</span>
            <span className="text-slate-800 font-medium">{c.neu || '—'}</span>
          </div>
        ) : (
          <div className="text-slate-700 mt-1 break-words">{c.type === 'removed' ? c.alt : c.neu}</div>
        )}
      </div>
    </div>
  );
}

function VersionSlider({ versionen }) {
  const [idx, setIdx] = useState(Math.max(0, versionen.length - 1));
  const nRef = useRef(versionen.length);
  // Wenn neue Versionen dazukommen, automatisch zur neuesten springen.
  useEffect(() => {
    if (versionen.length !== nRef.current) { setIdx(versionen.length - 1); nRef.current = versionen.length; }
  }, [versionen.length]);

  if (!versionen.length) return <div className="text-[13px] text-slate-400">Keine Versionen vorhanden.</div>;
  const safeIdx = Math.min(idx, versionen.length - 1);
  const v = versionen[safeIdx];
  const m = getTeamMember(v.autorId);
  const isAgent = m.id === 'agent';

  return (
    <div>
      {/* Schieberegler */}
      <input
        type="range"
        min={0}
        max={versionen.length - 1}
        value={safeIdx}
        onChange={(e) => setIdx(Number(e.target.value))}
        className="w-full accent-emerald-700 cursor-pointer"
      />
      <div className="flex items-center justify-between text-[10.5px] text-slate-400 mt-1 mb-3">
        <span>Erstversion</span>
        <span className="font-semibold text-slate-500">Version {safeIdx + 1} / {versionen.length}</span>
        <span>Aktuell</span>
      </div>

      {/* Metadaten der gewählten Version */}
      <div className="flex items-center gap-2.5 mb-3">
        <span className="w-8 h-8 rounded-full flex items-center justify-center text-white text-[11px] font-semibold shrink-0" style={{ background: m.color }}>
          {isAgent ? <Bot size={15} /> : m.initialen}
        </span>
        <div className="min-w-0">
          <div className="text-[13px] font-semibold text-slate-800">{v.aktion}</div>
          <div className="text-[11px] text-slate-500">{m.name} · {formatDateTimeDe(v.at)}</div>
        </div>
      </div>

      {/* Änderungen dieser Version */}
      <div className="space-y-1.5">
        {(v.changes || []).map((c, i) => <ChangeRow key={i} c={c} />)}
      </div>
    </div>
  );
}

export default function RisikoDetailDrawer({ risikoId, onClose }) {
  const { analyse, setRisikoStatus, updateRisiko, commitRisikoVersion, addKontrolle, addRisikoComment } = useBiks();
  const [editing, setEditing] = useState(false);
  const [showVerlauf, setShowVerlauf] = useState(false);
  const [newKontrolleId, setNewKontrolleId] = useState(null);
  const beforeEditRef = useRef(null);

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

  const toggleEdit = () => {
    if (editing) {
      commitRisikoVersion(risiko.id, beforeEditRef.current);
      beforeEditRef.current = null;
      setEditing(false);
    } else {
      beforeEditRef.current = {
        titel: risiko.titel, risikospezifikation: risiko.risikospezifikation,
        wesentlichkeit: risiko.wesentlichkeit, schaden: risiko.schaden, eintritt: risiko.eintritt,
      };
      setEditing(true);
    }
  };

  const handleAddKontrolle = () => {
    const id = addKontrolle(risiko.id, { ...emptyKontrolle(Date.now()), name: '', art: 'praeventiv', typ: 'manuell', turnus: 'je-vorgang' });
    setNewKontrolleId(id);
  };

  return createPortal(
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-[1px] animate-fade-in" onClick={onClose} />

      {/* Drawer */}
      <div className="relative w-full max-w-[1040px] bg-slate-50 h-full min-h-0 overflow-hidden shadow-2xl flex flex-col drawer-slide-in">
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
                onClick={toggleEdit}
                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-[12px] font-semibold transition-colors"
                style={{ background: 'rgba(255,255,255,0.16)', color: 'white' }}
              >
                {editing ? <><Check size={13} /> Fertig</> : <><Pencil size={13} /> Risiko bearbeiten</>}
              </button>
              <button
                onClick={() => setShowVerlauf(v => !v)}
                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-[12px] font-semibold transition-colors"
                style={{ background: showVerlauf ? 'white' : 'rgba(255,255,255,0.16)', color: showVerlauf ? 'var(--mode-primary, #0F4D2A)' : 'white' }}
              >
                <History size={13} /> Verlauf
                <span
                  className="inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full text-[10.5px] font-bold"
                  style={{ background: showVerlauf ? 'var(--mode-primary, #0F4D2A)' : 'white', color: showVerlauf ? 'white' : 'var(--mode-primary, #0F4D2A)' }}
                >
                  {risiko.versionen?.length || 0}
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* Scrollbereich */}
        <div className="flex-1 min-h-0 overflow-y-auto scrollbar-thin p-5 space-y-4">
          {showVerlauf && (
            <div className="card-base p-4">
              <div className="flex items-center gap-2 mb-3">
                <History size={15} className="text-slate-400" />
                <span className="text-[13px] font-semibold">Versionsverlauf</span>
                <span className="text-[11px] text-slate-400">— durch die Versionen schieben</span>
              </div>
              <VersionSlider versionen={risiko.versionen || []} />
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
    </div>,
    document.body,
  );
}
