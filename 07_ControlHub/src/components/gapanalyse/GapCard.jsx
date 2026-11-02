import { useState } from 'react';
import {
  CircleSlash, Unplug, CopyX, GitCompareArrows, Gavel, CheckCircle2, TrendingUp,
  Circle, PencilLine, CalendarCheck, XCircle, ArrowRight, MessageSquare,
  UserPlus, Check, X, ChevronDown, Send, ShieldCheck, Clock, Layers,
} from 'lucide-react';
import { useGapAnalyse } from '../../hooks/useGapAnalyse';
import {
  GAP_TYP_MAP, GAP_STATUS_MAP, SZENARIO_MAP, getKritMap, TEAM, getTeamMember,
} from '../../data/gapAnalyseAgent';

const TYP_ICON = { CircleSlash, Unplug, CopyX, GitCompareArrows, Gavel, CheckCircle2, TrendingUp };
const STATUS_ICON = { Circle, PencilLine, CalendarCheck, XCircle };

function fmtTime(at) {
  try { return new Date(at).toLocaleString('de-DE', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' }); }
  catch { return ''; }
}

function AssignMenu({ current, onPick, onClose }) {
  return (
    <div className="dropdown-menu" style={{ minWidth: 230, right: 0, left: 'auto', top: 'calc(100% + 4px)' }}>
      <div className="dropdown-title">Zuweisen an</div>
      <button className="dropdown-item" onClick={() => { onPick(null); onClose(); }}>
        <span className="w-7 h-7 rounded-full flex items-center justify-center bg-slate-100 text-slate-400 shrink-0"><X size={13} /></span>
        <span className="text-[13px]">Zuweisung entfernen</span>
      </button>
      {TEAM.filter(m => m.id !== 'agent').map(m => (
        <button key={m.id} className={`dropdown-item ${current === m.id ? 'active' : ''}`} onClick={() => { onPick(m.id); onClose(); }}>
          <span className="w-7 h-7 rounded-full flex items-center justify-center text-white text-[11px] font-semibold shrink-0" style={{ background: m.color }}>{m.initialen}</span>
          <span className="flex-1 min-w-0">
            <span className="block text-[13px] font-semibold leading-tight">{m.name}</span>
            <span className="block text-[11px] text-slate-500 leading-snug">{m.rolle}</span>
          </span>
          {current === m.id && <Check size={14} className="text-emerald-600 shrink-0" />}
        </button>
      ))}
    </div>
  );
}

export default function GapCard({ gap, szenario }) {
  const { setGapStatus, assignGap, addGapComment } = useGapAnalyse();
  const [expanded, setExpanded] = useState(false);
  const [assignOpen, setAssignOpen] = useState(false);
  const [commentText, setCommentText] = useState('');

  const typ = GAP_TYP_MAP[gap.typ];
  const TypIcon = TYP_ICON[typ.icon] || Circle;
  const status = GAP_STATUS_MAP[gap.status];
  const StatusIcon = STATUS_ICON[status.icon] || Circle;
  const krit = getKritMap(szenario)[gap.kritikalitaet];
  const assignee = gap.assignedTo ? getTeamMember(gap.assignedTo) : null;
  const eingeplant = gap.status === 'eingeplant';
  const nichtRelevant = gap.status === 'nicht_relevant';

  const submitComment = () => {
    if (!commentText.trim()) return;
    addGapComment(gap.id, commentText);
    setCommentText('');
  };

  return (
    <div
      className="card-base overflow-visible"
      style={{
        borderColor: `color-mix(in srgb, ${typ.color} 30%, var(--color-border))`,
        opacity: nichtRelevant ? 0.72 : 1,
      }}
    >
      <div className="p-4">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: typ.bg, color: typ.color }}>
            <TypIcon size={20} strokeWidth={1.8} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10.5px] font-bold uppercase tracking-wide"
                    style={{ background: typ.bg, color: typ.color }}>{typ.kurz}</span>
              <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10.5px] font-bold uppercase tracking-wide"
                    style={{ background: krit.bg, color: krit.color }} title={krit.hinweis}>
                <Clock size={11} /> {krit.label}
              </span>
              <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10.5px] font-semibold"
                    style={{ background: status.bg, color: status.color }}>
                <StatusIcon size={11} /> {status.label}
              </span>
              {gap.aufwandPT > 0 && (
                <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10.5px] font-semibold bg-slate-100 text-slate-600">
                  {gap.aufwandPT} PT
                </span>
              )}
            </div>
            <h3 className="text-[14.5px] font-bold mt-1.5 leading-snug">{gap.titel}</h3>
            <div className="flex flex-wrap gap-1.5 mt-1.5">
              <span className="chip"><Layers size={11} /> {gap.bereich}</span>
              <span className="chip">Risiko: {gap.risiko}</span>
            </div>
          </div>
        </div>

        {/* Ist → Ziel */}
        <div className="mt-3 grid sm:grid-cols-[1fr_auto_1fr] items-stretch gap-2">
          <div className="rounded-lg p-2.5 bg-slate-50 border border-slate-200">
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Heute</div>
            <div className="text-[12px] text-slate-700 leading-snug">{gap.istZustand}</div>
          </div>
          <div className="hidden sm:flex items-center justify-center text-slate-300"><ArrowRight size={18} /></div>
          <div className="rounded-lg p-2.5 border"
               style={{ background: 'color-mix(in srgb, var(--mode-primary, #0F4D2A) 5%, white)', borderColor: 'color-mix(in srgb, var(--mode-primary, #0F4D2A) 20%, transparent)' }}>
            <div className="text-[10px] font-bold uppercase tracking-wider mb-1" style={{ color: 'var(--mode-primary, #0F4D2A)' }}>
              {SZENARIO_MAP[szenario]?.zielLabel || 'Zielzustand'}
            </div>
            <div className="text-[12px] text-slate-700 leading-snug">{gap.zielZustand}</div>
          </div>
        </div>

        {gap.regulatorik?.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-2.5">
            {gap.regulatorik.map(r => (
              <span key={r} className="chip"><ShieldCheck size={11} /> {r}</span>
            ))}
          </div>
        )}

        <button onClick={() => setExpanded(v => !v)} className="mt-2.5 inline-flex items-center gap-1 text-[12px] font-semibold text-slate-500 hover:text-slate-800">
          <ChevronDown size={14} className={`transition-transform ${expanded ? 'rotate-180' : ''}`} />
          {expanded ? 'Einordnung ausblenden' : 'Einordnung des Agents anzeigen'}
        </button>
        {expanded && (
          <div className="mt-2 space-y-2 animate-fade-in">
            <p className="text-[12.5px] text-slate-600 leading-relaxed">{gap.begruendung}</p>
            <div className="rounded-lg p-2.5 flex gap-2" style={{ background: krit.bg, border: `1px solid color-mix(in srgb, ${krit.color} 25%, transparent)` }}>
              <Clock size={14} className="shrink-0 mt-0.5" style={{ color: krit.color }} />
              <div className="text-[12px] leading-snug text-slate-700">
                <span className="font-semibold" style={{ color: krit.color }}>{krit.lang}: </span>{krit.hinweis}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Kollaboration */}
      <div className="px-4 py-2.5 border-t border-slate-100 bg-slate-50/60">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div className="relative">
            <button onClick={() => setAssignOpen(v => !v)} className="inline-flex items-center gap-1.5 rounded-lg px-2 py-1 text-[12px] font-medium border border-slate-200 bg-white hover:bg-slate-50">
              {assignee ? (
                <>
                  <span className="w-5 h-5 rounded-full flex items-center justify-center text-white text-[9px] font-bold" style={{ background: assignee.color }}>{assignee.initialen}</span>
                  <span className="font-semibold">{assignee.name}</span>
                </>
              ) : (
                <><UserPlus size={13} className="text-slate-400" /> <span className="text-slate-500">Zuweisen</span></>
              )}
              <ChevronDown size={12} className="text-slate-400" />
            </button>
            {assignOpen && <AssignMenu current={gap.assignedTo} onPick={(id) => assignGap(gap.id, id)} onClose={() => setAssignOpen(false)} />}
          </div>

          <div className="flex items-center gap-1.5">
            {gap.status !== 'in_klaerung' && !eingeplant && !nichtRelevant && (
              <button onClick={() => setGapStatus(gap.id, 'in_klaerung')}
                      className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-[12px] font-semibold border border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100">
                <PencilLine size={13} /> In Klärung
              </button>
            )}
            <button onClick={() => setGapStatus(gap.id, eingeplant ? 'offen' : 'eingeplant')}
                    className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-[12px] font-semibold transition-colors"
                    style={eingeplant ? { background: '#059669', color: 'white', border: '1px solid #059669' } : { background: 'white', color: '#047857', border: '1px solid #A7F3D0' }}>
              <CalendarCheck size={13} /> {eingeplant ? 'Eingeplant' : 'Einplanen'}
            </button>
            <button onClick={() => setGapStatus(gap.id, nichtRelevant ? 'offen' : 'nicht_relevant')}
                    className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-[12px] font-semibold transition-colors"
                    style={nichtRelevant ? { background: '#DC2626', color: 'white', border: '1px solid #DC2626' } : { background: 'white', color: '#B91C1C', border: '1px solid #FECACA' }}>
              <X size={13} /> {nichtRelevant ? 'Nicht relevant' : 'Verwerfen'}
            </button>
          </div>
        </div>

        <div className="mt-2.5">
          {gap.comments?.length > 0 && (
            <div className="space-y-2 mb-2">
              {gap.comments.map(c => {
                const autor = getTeamMember(c.autorId);
                return (
                  <div key={c.id} className="flex gap-2">
                    <span className="w-6 h-6 rounded-full flex items-center justify-center text-white text-[9px] font-bold shrink-0 mt-0.5" style={{ background: autor.color }}>{autor.initialen}</span>
                    <div className="min-w-0 flex-1">
                      <div className="text-[11.5px]"><span className="font-semibold">{autor.name}</span> <span className="text-slate-400">· {fmtTime(c.at)}</span></div>
                      <div className="text-[12.5px] text-slate-700 leading-snug">{c.text}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
          <div className="flex items-center gap-2">
            <MessageSquare size={14} className="text-slate-300 shrink-0" />
            <input
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') submitComment(); }}
              placeholder="Kommentar hinzufügen …"
              className="flex-1 min-w-0 px-2.5 py-1.5 border border-slate-200 rounded-lg text-[12.5px] focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
            />
            <button onClick={submitComment} disabled={!commentText.trim()}
                    className="inline-flex items-center justify-center w-8 h-8 rounded-lg text-white disabled:opacity-40 shrink-0"
                    style={{ background: 'var(--mode-primary, #0F4D2A)' }} title="Senden">
              <Send size={14} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
