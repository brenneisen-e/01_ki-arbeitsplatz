import { useState, useRef } from 'react';
import {
  KeyRound, ChevronDown, Pencil, Check, Trash2, MessageSquare, Sparkles,
} from 'lucide-react';
import { useBiks } from '../../hooks/useBiks';
import { KONTROLL_ART, KONTROLL_TYP, KONTROLL_TURNUS } from '../../data/biksAgent';
import { StatusMenu } from './StatusControls';
import CommentThread from './CommentThread';

function label(list, id) { return list.find(x => x.id === id)?.label || id; }

const BESCHREIBUNG_FELDER = [
  { key: 'was', label: 'Was wird kontrolliert?' },
  { key: 'wie', label: 'Wie wird kontrolliert?' },
  { key: 'wer', label: 'Wer führt die Kontrolle aus?' },
  { key: 'abweichung', label: 'Wann liegt eine Abweichung / ein Fehler vor?' },
  { key: 'umgang', label: 'Umgang mit festgestellten Fehlern' },
  { key: 'dokumentation', label: 'Dokumentation der Kontrolldurchführung' },
  { key: 'anwendung', label: 'Anwendung zur Kontrolldurchführung' },
];

function ReadField({ label, value }) {
  if (!value) return null;
  return (
    <div>
      <div className="text-[10.5px] font-bold tracking-wider uppercase text-slate-400 mb-0.5">{label}</div>
      <div className="text-[13px] text-slate-700 leading-snug">{value}</div>
    </div>
  );
}

function EditField({ label, value, onChange, rows = 2 }) {
  return (
    <label className="block">
      <span className="block text-[10.5px] font-bold tracking-wider uppercase text-slate-400 mb-1">{label}</span>
      <textarea
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        rows={rows}
        className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-[13px] resize-none focus:outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
      />
    </label>
  );
}

export default function SchluesselkontrolleCard({ risikoId, kontrolle, defaultOpen = false }) {
  const { setKontrolleStatus, updateKontrolle, commitKontrolleVersion, removeKontrolle, addKontrolleComment } = useBiks();
  const [open, setOpen] = useState(defaultOpen);
  const [editing, setEditing] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const beforeEditRef = useRef(null);

  const k = kontrolle;
  const art = KONTROLL_ART.find(a => a.id === k.art);
  const set = (patch) => updateKontrolle(risikoId, k.id, patch);

  const toggleEdit = () => {
    if (editing) {
      commitKontrolleVersion(risikoId, k.id, beforeEditRef.current);
      beforeEditRef.current = null;
      setEditing(false);
    } else {
      beforeEditRef.current = { name: k.name, ziel: k.ziel, art: k.art, typ: k.typ, turnus: k.turnus, was: k.was, wie: k.wie, wer: k.wer, abweichung: k.abweichung, umgang: k.umgang, dokumentation: k.dokumentation, anwendung: k.anwendung };
      setEditing(true);
    }
  };

  return (
    <div className="rounded-xl border transition-colors" style={{ borderColor: open ? 'color-mix(in srgb, #16A34A 40%, #E2E8F0)' : '#E2E8F0', background: 'white' }}>
      {/* Kopfzeile */}
      <div className="p-3.5 flex items-start gap-3">
        <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: 'color-mix(in srgb, #16A34A 12%, white)', color: '#15803D' }}>
          <KeyRound size={16} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              {editing ? (
                <input
                  value={k.name}
                  onChange={(e) => set({ name: e.target.value })}
                  placeholder="Bezeichnung der Schlüsselkontrolle"
                  className="w-full text-[14px] font-semibold px-2 py-1 border border-slate-300 rounded-lg focus:outline-none focus:border-emerald-600"
                />
              ) : (
                <button onClick={() => setOpen(v => !v)} className="text-left">
                  <span className="text-[14px] font-semibold text-slate-800 leading-snug">{k.name || 'Neue Schlüsselkontrolle'}</span>
                </button>
              )}
              <div className="flex items-center gap-1.5 flex-wrap mt-1.5">
                {k.custom
                  ? <span className="chip" style={{ background: '#FEF3C7', color: '#92400E', borderColor: '#FCD34D' }}>eigene Kontrolle</span>
                  : <span className="chip" style={{ background: 'color-mix(in srgb, #16A34A 10%, white)', color: '#15803D', borderColor: 'transparent' }}><Sparkles size={10} /> Vorschlag</span>}
                <span className="chip" style={{ background: art?.bg, color: art?.color, borderColor: 'transparent' }}>{art?.label}</span>
                <span className="chip">{label(KONTROLL_TYP, k.typ)}</span>
                <span className="chip">{label(KONTROLL_TURNUS, k.turnus)}</span>
              </div>
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              <StatusMenu statusId={k.status} onChange={(s) => setKontrolleStatus(risikoId, k.id, s)} align="right" />
              <button onClick={() => setOpen(v => !v)} className="p-1 text-slate-400 hover:text-slate-700 transition-colors" title={open ? 'Einklappen' : 'Aufklappen'}>
                <ChevronDown size={18} className={`transition-transform ${open ? 'rotate-180' : ''}`} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Inhalt */}
      {open && (
        <div className="px-3.5 pb-3.5 pl-[3.75rem] space-y-4 animate-fade-in-up">
          {/* Aktionsleiste */}
          <div className="flex items-center gap-2 -mt-1">
            <button
              onClick={toggleEdit}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[12px] font-medium border transition-colors"
              style={editing
                ? { background: 'var(--mode-primary, #0F4D2A)', color: 'white', borderColor: 'transparent' }
                : { borderColor: '#E2E8F0', color: '#475569' }}
            >
              {editing ? <><Check size={13} /> Fertig</> : <><Pencil size={13} /> Bearbeiten</>}
            </button>
            <button
              onClick={() => setShowComments(v => !v)}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[12px] font-medium border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors"
            >
              <MessageSquare size={13} /> Kommentare{k.comments?.length ? ` (${k.comments.length})` : ''}
            </button>
            {k.custom && (
              <button
                onClick={() => removeKontrolle(risikoId, k.id)}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[12px] font-medium border border-slate-200 text-slate-500 hover:text-red-600 hover:border-red-200 transition-colors ml-auto"
              >
                <Trash2 size={13} /> Entfernen
              </button>
            )}
          </div>

          {/* Kontrollziel */}
          {editing ? (
            <EditField label="Kontrollziel" value={k.ziel} onChange={(v) => set({ ziel: v })} rows={2} />
          ) : (
            <ReadField label="Kontrollziel" value={k.ziel} />
          )}

          {/* Kontrollansatz */}
          {editing ? (
            <div>
              <span className="block text-[10.5px] font-bold tracking-wider uppercase text-slate-400 mb-1">Möglicher Kontrollansatz</span>
              <div className="grid grid-cols-3 gap-2">
                <select value={k.art} onChange={(e) => set({ art: e.target.value })} className="px-2 py-1.5 border border-slate-300 rounded-lg text-[12.5px]">
                  {KONTROLL_ART.map(a => <option key={a.id} value={a.id}>{a.label}</option>)}
                </select>
                <select value={k.typ} onChange={(e) => set({ typ: e.target.value })} className="px-2 py-1.5 border border-slate-300 rounded-lg text-[12.5px]">
                  {KONTROLL_TYP.map(t => <option key={t.id} value={t.id}>{t.label}</option>)}
                </select>
                <select value={k.turnus} onChange={(e) => set({ turnus: e.target.value })} className="px-2 py-1.5 border border-slate-300 rounded-lg text-[12.5px]">
                  {KONTROLL_TURNUS.map(t => <option key={t.id} value={t.id}>{t.label}</option>)}
                </select>
              </div>
            </div>
          ) : (
            <ReadField label="Möglicher Kontrollansatz" value={k.ansatzText || `${art?.label}, ${label(KONTROLL_TYP, k.typ)}, ${label(KONTROLL_TURNUS, k.turnus)}`} />
          )}

          {/* Kontrollbeschreibung (W-Fragen) */}
          <div className="rounded-xl p-3.5" style={{ background: '#F8FAFC', border: '1px solid #EEF2F6' }}>
            <div className="text-[11px] font-bold tracking-wider uppercase mb-3" style={{ color: 'var(--mode-primary, #0F4D2A)' }}>Kontrollbeschreibung</div>
            {editing ? (
              <div className="space-y-3">
                {BESCHREIBUNG_FELDER.map(f => (
                  <EditField key={f.key} label={f.label} value={k[f.key]} onChange={(v) => set({ [f.key]: v })} rows={f.key === 'was' || f.key === 'wie' ? 2 : 1} />
                ))}
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 gap-x-5 gap-y-3">
                {BESCHREIBUNG_FELDER.map(f => <ReadField key={f.key} label={f.label} value={k[f.key]} />)}
              </div>
            )}
          </div>

          {/* Kommentare */}
          {showComments && (
            <div className="rounded-xl p-3.5" style={{ background: 'white', border: '1px solid #E2E8F0' }}>
              <CommentThread comments={k.comments || []} onAdd={(text) => addKontrolleComment(risikoId, k.id, text)} />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
