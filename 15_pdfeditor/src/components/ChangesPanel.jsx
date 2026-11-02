import { X, RotateCcw, AlertTriangle, Type, Trash2, Move, Plus } from 'lucide-react';
import { clsx } from 'clsx';

function describe(block, edit) {
  if (block.added) return { icon: Plus, label: 'Neuer Text' };
  if (edit.deleted) return { icon: Trash2, label: 'Gelöscht' };
  if (edit.text !== undefined) return { icon: Type, label: 'Text geändert' };
  if (edit.dx || edit.dy) return { icon: Move, label: 'Verschoben' };
  return { icon: Type, label: 'Formatiert' };
}

function shorten(text, n = 60) {
  const t = (text || '').replace(/\s+/g, ' ').trim();
  return t.length > n ? t.slice(0, n - 1) + '…' : t;
}

export default function ChangesPanel({ doc, blocks, edits, report, selectedId, onJump, onRevert, onClose }) {
  const items = [...edits.entries()].map(([id, edit]) => ({ id, edit, block: blocks.get(id) })).filter(x => x.block);
  items.sort((a, b) => a.block.pageIndex - b.block.pageIndex || b.block.y - a.block.y);
  const fonts = doc.usableFonts;

  return (
    <aside className="flex w-80 shrink-0 flex-col border-l border-slate-200 bg-white">
      <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
        <div>
          <div className="text-sm font-semibold text-slate-800">Änderungen</div>
          <div className="text-xs text-slate-400">{items.length === 0 ? 'Noch keine Änderungen' : `${items.length} ${items.length === 1 ? 'Eintrag' : 'Einträge'}`}</div>
        </div>
        <button className="btn-icon" onClick={onClose} aria-label="Leiste schließen"><X size={15} strokeWidth={1.75} /></button>
      </div>

      <div className="min-h-0 flex-1 overflow-auto">
        {items.length === 0 ? (
          <div className="px-4 py-6 text-xs leading-relaxed text-slate-500">
            Klicke im Dokument auf einen Textblock, um ihn zu ändern. Jede Änderung erscheint hier mit Angabe der verwendeten Schrift.
          </div>
        ) : (
          <ul className="divide-y divide-slate-100">
            {items.map(({ id, edit, block }) => {
              const d = describe(block, edit);
              const r = report[id];
              return (
                <li
                  key={id}
                  className={clsx('cursor-pointer px-4 py-3 transition-colors hover:bg-slate-50', selectedId === id && 'bg-blue-50/60')}
                  onClick={() => onJump(id)}
                >
                  <div className="flex items-center gap-2">
                    <d.icon size={14} strokeWidth={1.75} className="text-slate-500" />
                    <span className="text-xs font-medium text-slate-700">{d.label}</span>
                    <span className="ml-auto text-xs text-slate-400">Seite {block.pageIndex + 1}</span>
                    <button className="btn-icon h-6 w-6" title="Änderung zurücksetzen" aria-label="Zurücksetzen" onClick={(e) => { e.stopPropagation(); onRevert(id); }}>
                      <RotateCcw size={12} strokeWidth={1.75} />
                    </button>
                  </div>
                  {!block.added && (
                    <div className="mt-1.5 text-xs text-slate-400 line-through decoration-slate-300">{shorten(block.text)}</div>
                  )}
                  {!edit.deleted && (
                    <div className="mt-0.5 text-xs text-slate-800">{shorten(edit.text ?? block.text) || <span className="italic text-slate-400">leer</span>}</div>
                  )}
                  {r && !edit.deleted && (
                    <div className={clsx('mt-1.5 flex items-start gap-1.5 text-[11px] leading-snug', r.fallback ? 'text-amber-700' : 'text-slate-500')}>
                      {r.fallback ? <AlertTriangle size={12} strokeWidth={1.75} className="mt-0.5 shrink-0" /> : <Type size={12} strokeWidth={1.75} className="mt-0.5 shrink-0" />}
                      <span>
                        {r.fallback
                          ? <>Ersatzschrift {r.label}{r.originalLabel ? <> statt {r.originalLabel}</> : null}{r.missing?.length ? <>: „{r.missing.join(' ')}“ {r.missing.length === 1 ? 'fehlt' : 'fehlen'} in der eingebetteten Schrift.</> : r.reason === 'unsupported' ? '. Die Originalschrift lässt sich nicht wiederverwenden.' : '.'}</>
                          : <>Schrift: {r.label}{r.mode === 'entry' ? ' (Original)' : ''}</>}
                        {r.missingStd?.length ? <> Nicht darstellbar: „{r.missingStd.join(' ')}“.</> : null}
                      </span>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </div>

      <div className="border-t border-slate-100 px-4 py-3">
        <div className="mb-1 text-xs font-medium text-slate-600">Schriften im Dokument</div>
        {fonts.length === 0 ? (
          <div className="text-xs text-slate-400">Keine wiederverwendbare Schrift gefunden. Änderungen nutzen Standardschriften.</div>
        ) : (
          <ul className="max-h-28 space-y-0.5 overflow-auto text-xs text-slate-500">
            {fonts.map(f => <li key={f.id} className="truncate">{f.label}</li>)}
          </ul>
        )}
      </div>
    </aside>
  );
}
