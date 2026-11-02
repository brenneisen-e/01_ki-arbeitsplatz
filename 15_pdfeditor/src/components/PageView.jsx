import { useEffect, useMemo, useRef, useState } from 'react';
import { clsx } from 'clsx';
import { sampleColors } from '../lib/pdfjs.js';
import BlockOverlay from './BlockOverlay.jsx';

/** Rechteck (CSS-Pixel im Seiten-Container) um alle Zeilen eines Layouts. */
function cssBounds(viewport, lay) {
  const cos = Math.cos(lay.angle), sin = Math.sin(lay.angle);
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  const push = (x, y) => {
    const [vx, vy] = viewport.convertToViewportPoint(x, y);
    minX = Math.min(minX, vx); maxX = Math.max(maxX, vx);
    minY = Math.min(minY, vy); maxY = Math.max(maxY, vy);
  };
  const asc = lay.ascent * lay.size, desc = lay.descent * lay.size;
  for (const l of lay.lines) {
    const w = Math.max(l.width, lay.size * 0.6);
    for (const [along, up] of [[0, asc], [w, asc], [0, desc], [w, desc]]) {
      push(l.x + cos * along - sin * up, l.y + sin * along + cos * up);
    }
  }
  if (!isFinite(minX)) return { x: 0, y: 0, w: 0, h: 0 };
  return { x: minX, y: minY, w: maxX - minX, h: maxY - minY };
}

export default function PageView({
  pageIndex, pdfjsDoc, renderVersion, isOriginal, session, usableFonts, zoom, blocks, edits, report,
  selectedId, editingId, mode, onSelect, onStartEdit, onFinishEdit, onCancelEdit, onUpdateEdit, onRevert, onAddBlock, onBlocksSampled,
}) {
  const canvasRef = useRef(null);
  const blocksRef = useRef(blocks);
  blocksRef.current = blocks;
  const [viewport, setViewport] = useState(null);
  const [size, setSize] = useState(null);

  // Seitengroesse sofort setzen (Platzhalter, bevor gerendert ist)
  useEffect(() => {
    let cancelled = false;
    pdfjsDoc.getPage(pageIndex + 1).then(page => {
      if (cancelled) return;
      const vp = page.getViewport({ scale: zoom });
      setSize({ w: vp.width, h: vp.height });
    });
    return () => { cancelled = true; };
  }, [pdfjsDoc, pageIndex, zoom]);

  // Rendern in ein Offscreen-Canvas, dann in einem Zug anzeigen (kein Flackern)
  useEffect(() => {
    let cancelled = false;
    let task = null;
    (async () => {
      let page;
      try { page = await pdfjsDoc.getPage(pageIndex + 1); } catch { return; }
      if (cancelled) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const vp = page.getViewport({ scale: zoom });
      const off = document.createElement('canvas');
      off.width = Math.floor(vp.width * dpr);
      off.height = Math.floor(vp.height * dpr);
      const offCtx = off.getContext('2d', { willReadFrequently: true });
      task = page.render({ canvasContext: offCtx, viewport: page.getViewport({ scale: zoom * dpr }) });
      try { await task.promise; } catch (e) { if (e && e.name !== 'RenderingCancelledException') console.warn(e); return; }
      if (cancelled) return;
      const canvas = canvasRef.current;
      if (!canvas) return;
      canvas.width = off.width;
      canvas.height = off.height;
      canvas.style.width = vp.width + 'px';
      canvas.style.height = vp.height + 'px';
      canvas.getContext('2d').drawImage(off, 0, 0);
      setViewport(vp);

      // Farben nur aus dem unveraenderten Original abtasten, einmal je Block
      if (isOriginal) {
        const updates = {};
        for (const b of blocksRef.current) {
          if (b.sampled || b.added) continue;
          const lay = session.layout(b, {});
          const r = cssBounds(vp, lay);
          const colors = sampleColors(offCtx, { x: r.x * dpr, y: r.y * dpr, w: r.w * dpr, h: r.h * dpr }, off.width, off.height);
          updates[b.id] = colors;
        }
        if (Object.keys(updates).length) onBlocksSampled(updates);
      }
    })();
    return () => { cancelled = true; if (task) task.cancel(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pdfjsDoc, pageIndex, zoom, renderVersion]);

  const layouts = useMemo(() => {
    if (!viewport) return [];
    return blocks.map(b => {
      const edit = edits.get(b.id) || {};
      const lay = session.layout(b, edit);
      const rect = cssBounds(viewport, lay);
      const [bx, by] = viewport.convertToViewportPoint(lay.x, lay.y);
      return { block: b, edit, lay, rect, baseline: { x: bx, y: by } };
    });
  }, [blocks, edits, session, viewport]);

  const handleOverlayClick = (e) => {
    if (mode !== 'add' || !viewport) return;
    if (e.target !== e.currentTarget) return;
    const r = e.currentTarget.getBoundingClientRect();
    const [x, y] = viewport.convertToPdfPoint(e.clientX - r.left, e.clientY - r.top);
    onAddBlock(pageIndex, x, y);
  };

  const w = size ? size.w : 0, h = size ? size.h : 0;
  return (
    <div className="pdf-page" style={{ width: w, height: h }}>
      <canvas ref={canvasRef} />
      <div
        className={clsx('pdf-overlay', mode === 'add' && 'mode-add')}
        onClick={handleOverlayClick}
        onMouseDown={(e) => { if (e.target === e.currentTarget) onSelect(null); }}
      >
        {layouts.map(({ block, edit, lay, rect, baseline }) => (
          <BlockOverlay
            key={block.id}
            block={block}
            edit={edit}
            lay={lay}
            rect={rect}
            baseline={baseline}
            zoom={zoom}
            viewport={viewport}
            pageWidth={w}
            report={report[block.id]}
            usableFonts={usableFonts}
            selected={selectedId === block.id}
            editing={editingId === block.id}
            interactive={mode !== 'add'}
            onSelect={onSelect}
            onStartEdit={onStartEdit}
            onFinishEdit={onFinishEdit}
            onCancelEdit={onCancelEdit}
            onUpdateEdit={onUpdateEdit}
            onRevert={onRevert}
          />
        ))}
      </div>
    </div>
  );
}
