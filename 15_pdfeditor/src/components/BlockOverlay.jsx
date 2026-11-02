import { useEffect, useRef, useState } from 'react';
import { clsx } from 'clsx';
import { Move, Trash2, RotateCcw, AlertTriangle, Minus, Plus, Undo2 } from 'lucide-react';
import { STANDARD_FONTS } from '../lib/session.js';

function cssColor(c) {
  if (!c) return '#000';
  return `rgb(${Math.round(c[0] * 255)}, ${Math.round(c[1] * 255)}, ${Math.round(c[2] * 255)})`;
}

function fallbackFamily(block) {
  const f = block.pdfjsFont || {};
  if (f.mono || block.fontFamily === 'monospace') return '"JetBrains Mono", Consolas, "Courier New", monospace';
  if (f.serif || block.fontFamily === 'serif') return 'Georgia, "Times New Roman", serif';
  return 'Helvetica, Arial, sans-serif';
}

function fontChoiceValue(edit) {
  const f = edit.font;
  if (!f) return '';
  return f.type === 'entry' ? 'entry:' + f.id : 'std:' + f.name;
}

export default function BlockOverlay({
  block, edit, lay, rect, baseline, zoom, viewport, pageWidth, report, usableFonts,
  selected, editing, interactive, onSelect, onStartEdit, onFinishEdit, onCancelEdit, onUpdateEdit, onRevert,
}) {
  const textareaRef = useRef(null);
  const [draft, setDraft] = useState(lay.text);
  const [drag, setDrag] = useState(null);

  useEffect(() => {
    if (editing) {
      setDraft(lay.text);
      const el = textareaRef.current;
      if (el) {
        el.focus();
        el.select();
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editing]);

  const edited = Object.keys(edit).length > 0;
  const deleted = !!edit.deleted;
  const sizeCss = lay.size * zoom;
  const lhCss = lay.lineHeight * zoom;
  const isRotated = Math.abs(lay.angle) > 0.01;

  // ----- Editor-Geometrie -----
  const lineCount = Math.max(1, draft.split('\n').length);
  const measure = (text) => {
    const c = measure.canvas || (measure.canvas = document.createElement('canvas'));
    const ctx = c.getContext('2d');
    ctx.font = `${block.pdfjsFont?.italic ? 'italic ' : ''}${block.pdfjsFont?.bold ? 'bold ' : ''}${sizeCss}px "${block.fontName || 'x'}", ${fallbackFamily(block)}`;
    return Math.max(...text.split('\n').map(l => ctx.measureText(l || ' ').width));
  };
  const editorWidth = editing ? Math.max(rect.w + 6, measure(draft) + 14, sizeCss * 2) : 0;
  const editorTop = baseline.y - (lhCss - sizeCss) / 2 - 0.8 * sizeCss;
  const editorLeft = baseline.x - 3;

  const commit = () => onFinishEdit(block.id, draft);
  const onKeyDown = (e) => {
    if (e.key === 'Escape') { e.preventDefault(); e.stopPropagation(); onCancelEdit(); }
    else if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) { e.preventDefault(); commit(); }
    e.stopPropagation();
  };

  // ----- Verschieben -----
  const onDragStart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    e.currentTarget.setPointerCapture(e.pointerId);
    setDrag({ startX: e.clientX, startY: e.clientY, dx: 0, dy: 0 });
  };
  const onDragMove = (e) => {
    if (!drag) return;
    setDrag(d => ({ ...d, dx: e.clientX - d.startX, dy: e.clientY - d.startY }));
  };
  const onDragEnd = (e) => {
    if (!drag) return;
    const d = drag;
    setDrag(null);
    if (Math.abs(d.dx) < 1 && Math.abs(d.dy) < 1) return;
    const p0 = viewport.convertToPdfPoint(0, 0);
    const p1 = viewport.convertToPdfPoint(d.dx, d.dy);
    onUpdateEdit(block.id, { dx: (edit.dx || 0) + (p1[0] - p0[0]), dy: (edit.dy || 0) + (p1[1] - p0[1]) });
  };

  const changeSize = (delta) => {
    const next = Math.max(4, Math.round((lay.size + delta) * 2) / 2);
    onUpdateEdit(block.id, { size: next });
  };
  const setSize = (v) => {
    const n = parseFloat(v);
    if (!isNaN(n) && n >= 2 && n <= 400) onUpdateEdit(block.id, { size: n });
  };
  const changeFont = (v) => {
    if (v === '') onUpdateEdit(block.id, { font: null });
    else if (v.startsWith('entry:')) onUpdateEdit(block.id, { font: { type: 'entry', id: v.slice(6) } });
    else onUpdateEdit(block.id, { font: { type: 'standard', name: v.slice(4) } });
  };

  // ----- Toolbar-Position -----
  const toolbarWidth = 430;
  const tbLeft = Math.max(0, Math.min(rect.x, Math.max(0, pageWidth - toolbarWidth)));
  const tbTop = rect.y - 40 >= 0 ? rect.y - 40 : rect.y + rect.h + 8;
  const transform = drag ? `translate(${drag.dx}px, ${drag.dy}px)` : undefined;

  const title = deleted
    ? 'Gelöschter Text (Klick zum Auswählen, „Wiederherstellen“ in der Leiste)'
    : report?.fallback
      ? `Ersatzschrift ${report.label}: ${report.missing?.length ? '„' + report.missing.join(' ') + '“ fehlt in der eingebetteten Schrift' : 'Originalschrift nicht wiederverwendbar'}`
      : lay.font.label + (lay.font.mode === 'entry' ? ' (Originalschrift)' : '');

  return (
    <>
      {!editing && (
        <div
          className={clsx('text-block', selected && 'is-selected', edited && 'is-edited', deleted && 'is-deleted', report?.fallback && 'is-fallback')}
          style={{
            left: rect.x - 2, top: rect.y - 2, width: Math.max(rect.w + 4, 10), height: Math.max(rect.h + 4, 8),
            pointerEvents: interactive ? 'auto' : 'none', transform,
          }}
          title={title}
          role="button"
          aria-label={lay.text || 'Leere Textbox'}
          data-block-id={block.id}
          onMouseDown={(e) => { e.stopPropagation(); onSelect(block.id); }}
          onClick={(e) => { e.stopPropagation(); if (!deleted) onStartEdit(block.id); }}
        />
      )}

      {editing && (
        <textarea
          ref={textareaRef}
          className="text-editor"
          value={draft}
          rows={lineCount}
          spellCheck={false}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={onKeyDown}
          onBlur={commit}
          onMouseDown={(e) => e.stopPropagation()}
          onClick={(e) => e.stopPropagation()}
          style={{
            left: editorLeft,
            top: editorTop,
            width: editorWidth,
            height: lineCount * lhCss + 4,
            padding: '2px 3px',
            fontFamily: block.fontName ? `"${block.fontName}", ${fallbackFamily(block)}` : fallbackFamily(block),
            fontWeight: block.pdfjsFont?.bold ? 700 : 400,
            fontStyle: block.pdfjsFont?.italic ? 'italic' : 'normal',
            fontSize: sizeCss,
            lineHeight: `${lhCss}px`,
            color: cssColor(lay.color),
            background: cssColor(block.bg),
            transform: isRotated ? `rotate(${-lay.angle * 180 / Math.PI}deg)` : undefined,
            transformOrigin: '0 100%',
          }}
        />
      )}

      {selected && interactive && (
        <div className="block-toolbar animate-fade-in" style={{ left: tbLeft, top: tbTop }} onMouseDown={(e) => e.stopPropagation()} onClick={(e) => e.stopPropagation()}>
          <select value={fontChoiceValue(edit)} onChange={(e) => changeFont(e.target.value)} title="Schriftart" style={{ maxWidth: 190 }}>
            {!block.added && <option value="">Original{block.fontEntryId ? ` (${usableFonts.find(f => f.id === block.fontEntryId)?.label || lay.font.originalLabel || lay.font.label})` : ''}</option>}
            {usableFonts.length > 0 && (
              <optgroup label="Schriften im Dokument">
                {usableFonts.map(f => <option key={f.id} value={'entry:' + f.id}>{f.label}</option>)}
              </optgroup>
            )}
            <optgroup label="Standardschriften">
              {STANDARD_FONTS.map(f => <option key={f.name} value={'std:' + f.name}>{f.label}</option>)}
            </optgroup>
          </select>
          <span className="tb-sep" />
          <button className="tb-btn" title="Kleiner" onClick={() => changeSize(-1)}><Minus size={14} strokeWidth={1.75} /></button>
          <input type="number" step="0.5" min="2" max="400" value={Math.round(lay.size * 10) / 10} onChange={(e) => setSize(e.target.value)} title="Schriftgröße in pt" />
          <button className="tb-btn" title="Größer" onClick={() => changeSize(1)}><Plus size={14} strokeWidth={1.75} /></button>
          <span className="tb-sep" />
          <button className="tb-btn move" title="Verschieben (ziehen)" onPointerDown={onDragStart} onPointerMove={onDragMove} onPointerUp={onDragEnd} onPointerCancel={onDragEnd}>
            <Move size={14} strokeWidth={1.75} />
          </button>
          {deleted ? (
            <button className="tb-btn" title="Wiederherstellen" onClick={() => onUpdateEdit(block.id, { deleted: undefined })}><RotateCcw size={14} strokeWidth={1.75} /></button>
          ) : (
            <button className="tb-btn danger" title={block.added ? 'Textbox entfernen' : 'Text löschen (Entf)'} onClick={() => block.added ? onRevert(block.id) : onUpdateEdit(block.id, { deleted: true })}><Trash2 size={14} strokeWidth={1.75} /></button>
          )}
          {edited && !block.added && (
            <button className="tb-btn" title="Alle Änderungen an diesem Block zurücksetzen" onClick={() => onRevert(block.id)}><Undo2 size={14} strokeWidth={1.75} /></button>
          )}
          {report?.fallback && (
            <>
              <span className="tb-sep" />
              <span className="inline-flex items-center gap-1 pr-1 text-[11px] text-amber-700" title={title}>
                <AlertTriangle size={13} strokeWidth={1.75} /> Ersatzschrift
              </span>
            </>
          )}
        </div>
      )}
    </>
  );
}
