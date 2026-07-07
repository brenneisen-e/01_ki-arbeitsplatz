import { useState } from 'react';
import {
  CopyX, Merge, Minimize2, Cpu, CheckCircle2, XCircle, Circle, PencilLine,
  ArrowRight, MessageSquare, UserPlus, Check, X, ChevronDown, Clock, Send, ShieldCheck,
} from 'lucide-react';
import { useOptimierung } from '../../hooks/useOptimierung';
import {
  TYP_MAP, EMPFEHLUNG_STATUS, EMPF_STATUS_MAP, TEAM, getTeamMember,
} from '../../data/optimierungAgent';

const TYP_ICON = { CopyX, Merge, Minimize2, Cpu, CheckCircle2 };
const STATUS_ICON = { Circle, PencilLine, CheckCircle2, XCircle };
const PRIO = {
  hoch: { label: 'Hoch', color: '#DC2626', bg: '#FEF2F2' },
  mittel: { label: 'Mittel', color: '#D97706', bg: '#FFFBEB' },
  niedrig: { label: 'Gering', color: '#059669', bg: '#ECFDF5' },
};

function fmtTime(at) {
  try { return new Date(at).toLocaleString('de-DE', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' }); }
  catch { return ''; }
}

function Impact({ impact }) {
  const items = [];
  if (impact.kontrollenDelta) items.push({ label: 'Kontrollen', val: impact.kontrollenDelta, unit: '' });
  if (impact.aufwandDelta) items.push({ label: 'Aufwand', val: impact.aufwandDelta, unit: ' Std./J.' });
  if (impact.redundanzDelta) items.push({ label: 'Redundanz', val: impact.redundanzDelta, unit: '' });
  if (impact.automatisierung) items.push({ label: 'Automatisierung', val: '+', unit: '', text: 'manuell → automatisiert' });
  if (items.length === 0) return null;
  return (
    <div className="flex flex-wrap gap-1.5 mt-2.5">
      {items.map((it, i) => {
        const positiv = it.text ? true : it.val < 0;
        const color = positiv ? '#047857' : it.val > 0 && it.label !== 'Automatisierung' ? '#B45309' : '#047857';
        return (
          <span key={i} className="inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[11px] font-semibold" style={{ background: 'color-mix(in srgb, #059669 8%, white)', color, border: '1px solid color-mix(in srgb, #059669 20%, transparent)' }}>
            {it.label}: {it.text ? it.text : `${it.val > 0 ? '+' : ''}${it.val}${it.unit}`}
          </span>
        );
      })}
    </div>
  );
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

export default function RecommendationCard({ empfehlung, kontrollById }) {
  const { setEmpfehlungStatus, assignEmpfehlung, addEmpfehlungComment, currentUser } = useOptimierung();
  const [expanded, setExpanded] = useState(false);
  const [assignOpen, setAssignOpen] = useState(false);
  const [commentText, setCommentText] = useState('');

  const typ = TYP_MAP[empfehlung.typ];
  const TypIcon = TYP_ICON[typ.icon] || Circle;
  const status = EMPF_STATUS_MAP[empfehlung.status];
  const StatusIcon = STATUS_ICON[status.icon] || Circle;
  const prio = PRIO[empfehlung.prioritaet] || PRIO.mittel;
  const assignee = empfehlung.assignedTo ? getTeamMember(empfehlung.assignedTo) : null;
  const betroffen = (empfehlung.betroffen || []).map(id => kontrollById[id]).filter(Boolean);
  const angenommen = empfehlung.status === 'angenommen';
  const abgelehnt = empfehlung.status === 'abgelehnt';

  const submitComment = () => {
    if (!commentText.trim()) return;
    addEmpfehlungComment(empfehlung.id, commentText);
    setCommentText('');
  };

  return (
    <div className="card-base overflow-visible" style={{ borderColor: `color-mix(in srgb, ${typ.color} 30%, var(--color-border))`, opacity: abgelehnt ? 0.72 : 1 }}>
      {/* Kopfzeile */}
      <div className="p-4">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: typ.bg, color: typ.color }}>
            <TypIcon size={20} strokeWidth={1.8} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10.5px] font-bold uppercase tracking-wide" style={{ background: typ.bg, color: typ.color }}>{typ.kurz}</span>
              <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10.5px] font-semibold" style={{ background: prio.bg, color: prio.color }}>Priorität {prio.label}</span>
              <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10.5px] font-semibold" style={{ background: status.bg, color: status.color }}>
                <StatusIcon size={11} /> {status.label}
              </span>
            </div>
            <h3 className="text-[14.5px] font-bold mt-1.5 leading-snug">{empfehlung.titel}</h3>
            {betroffen.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-1.5">
                {betroffen.map(k => (
                  <span key={k.id} className="inline-flex items-center gap-1 text-[10.5px] font-mono font-semibold rounded px-1.5 py-0.5 bg-slate-100 text-slate-600 border border-slate-200">{k.code}</span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Vorher → Nachher */}
        <div className="mt-3 grid sm:grid-cols-[1fr_auto_1fr] items-stretch gap-2">
          <div className="rounded-lg p-2.5 bg-slate-50 border border-slate-200">
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Vorher</div>
            <div className="text-[12px] text-slate-700 leading-snug">{empfehlung.vorher}</div>
          </div>
          <div className="hidden sm:flex items-center justify-center text-slate-300"><ArrowRight size={18} /></div>
          <div className="rounded-lg p-2.5 border" style={{ background: 'color-mix(in srgb, var(--mode-primary, #0F4D2A) 5%, white)', borderColor: 'color-mix(in srgb, var(--mode-primary, #0F4D2A) 20%, transparent)' }}>
            <div className="text-[10px] font-bold uppercase tracking-wider mb-1" style={{ color: 'var(--mode-primary, #0F4D2A)' }}>Nachher</div>
            <div className="text-[12px] text-slate-700 leading-snug">{empfehlung.nachher}</div>
          </div>
        </div>

        <Impact impact={empfehlung.impact} />

        {/* Begründung ein-/ausklappen */}
        <button onClick={() => setExpanded(v => !v)} className="mt-2.5 inline-flex items-center gap-1 text-[12px] font-semibold text-slate-500 hover:text-slate-800">
          <ChevronDown size={14} className={`transition-transform ${expanded ? 'rotate-180' : ''}`} /> {expanded ? 'Begründung ausblenden' : 'Begründung & Abdeckung anzeigen'}
        </button>
        {expanded && (
          <div className="mt-2 space-y-2 animate-fade-in">
            <p className="text-[12.5px] text-slate-600 leading-relaxed">{empfehlung.begruendung}</p>
            <div className="rounded-lg p-2.5 flex gap-2" style={{ background: '#ECFDF5', border: '1px solid #A7F3D0' }}>
              <ShieldCheck size={14} className="text-emerald-700 shrink-0 mt-0.5" />
              <div className="text-[12px] text-emerald-900 leading-snug"><span className="font-semibold">Risikoabdeckung: </span>{empfehlung.coverageHinweis}</div>
            </div>
          </div>
        )}
      </div>

      {/* Kollaborations-Leiste */}
      <div className="px-4 py-2.5 border-t border-slate-100 bg-slate-50/60">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          {/* Zuweisung */}
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
            {assignOpen && <AssignMenu current={empfehlung.assignedTo} onPick={(id) => assignEmpfehlung(empfehlung.id, id)} onClose={() => setAssignOpen(false)} />}
          </div>

          {/* Aktionen */}
          <div className="flex items-center gap-1.5">
            {empfehlung.status !== 'in_pruefung' && !angenommen && !abgelehnt && (
              <button onClick={() => setEmpfehlungStatus(empfehlung.id, 'in_pruefung')} className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-[12px] font-semibold border border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100">
                <Clock size={13} /> In Prüfung
              </button>
            )}
            <button onClick={() => setEmpfehlungStatus(empfehlung.id, angenommen ? 'offen' : 'angenommen')}
              className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-[12px] font-semibold transition-colors"
              style={angenommen ? { background: '#059669', color: 'white', border: '1px solid #059669' } : { background: 'white', color: '#047857', border: '1px solid #A7F3D0' }}>
              <Check size={13} /> {angenommen ? 'Angenommen' : 'Annehmen'}
            </button>
            <button onClick={() => setEmpfehlungStatus(empfehlung.id, abgelehnt ? 'offen' : 'abgelehnt')}
              className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-[12px] font-semibold transition-colors"
              style={abgelehnt ? { background: '#DC2626', color: 'white', border: '1px solid #DC2626' } : { background: 'white', color: '#B91C1C', border: '1px solid #FECACA' }}>
              <X size={13} /> {abgelehnt ? 'Abgelehnt' : 'Ablehnen'}
            </button>
          </div>
        </div>

        {/* Kommentare */}
        <div className="mt-2.5">
          {empfehlung.comments?.length > 0 && (
            <div className="space-y-2 mb-2">
              {empfehlung.comments.map(c => {
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
            <button onClick={submitComment} disabled={!commentText.trim()} className="inline-flex items-center justify-center w-8 h-8 rounded-lg text-white disabled:opacity-40 shrink-0" style={{ background: 'var(--mode-primary, #0F4D2A)' }} title="Senden">
              <Send size={14} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
