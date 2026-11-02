import { useState, useCallback, useEffect, useMemo, useRef } from 'react';
import { STANDARD_FONTS } from './lib/session.js';
import { loadPdfjsDocument } from './lib/pdfjs.js';
import { analyzeDocument } from './lib/analyze.js';
import { nextBlockId } from './lib/textBlocks.js';
import { buildDemoPdf } from './lib/demoPdf.js';
import { savePdf, suggestedFileName, loadSuffix, storeSuffix, sanitizeSuffix, loadAmountPrefixOption, storeAmountPrefixOption } from './lib/download.js';
import { findInvoiceAmount, amountPrefix } from './lib/amount.js';
import Toolbar from './components/Toolbar.jsx';
import DropZone from './components/DropZone.jsx';
import PageView from './components/PageView.jsx';
import ChangesPanel from './components/ChangesPanel.jsx';
import BatchDialog from './components/BatchDialog.jsx';

const ZOOM_STEPS = [0.5, 0.65, 0.8, 1, 1.25, 1.5, 1.75, 2, 2.5, 3];

function editIsEmpty(edit) {
  if (!edit) return true;
  return !edit.deleted && edit.text === undefined && !edit.dx && !edit.dy && edit.size === undefined && edit.font === undefined && edit.color === undefined;
}

export default function App() {
  const [doc, setDoc] = useState(null);
  const [blocks, setBlocks] = useState(() => new Map());
  const [edits, setEdits] = useState(() => new Map());
  const editsRef = useRef(edits);
  editsRef.current = edits;
  const historyRef = useRef({ past: [], future: [] });
  const [histVersion, setHistVersion] = useState(0);
  const [rendered, setRendered] = useState(null);
  const [selectedId, setSelectedId] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [mode, setMode] = useState('select');
  const [zoom, setZoom] = useState(1.25);
  const [busy, setBusy] = useState(null);
  const [progress, setProgress] = useState(null);
  const [error, setError] = useState(null);
  const [notice, setNotice] = useState(null);
  const [panelOpen, setPanelOpen] = useState(true);
  const [batchOpen, setBatchOpen] = useState(false);
  const [queue, setQueue] = useState([]);
  const [suffix, setSuffixState] = useState(() => loadSuffix());
  const setSuffix = useCallback((v) => { const clean = sanitizeSuffix(v); setSuffixState(clean); storeSuffix(clean); }, []);
  const [amountFirst, setAmountFirstState] = useState(() => loadAmountPrefixOption());
  const setAmountFirst = useCallback((on) => { setAmountFirstState(on); storeAmountPrefixOption(on); }, []);
  const renderCounter = useRef(0);
  const scrollRef = useRef(null);
  const pageRefs = useRef(new Map());

  const showNotice = useCallback((text, kind = 'info') => {
    setNotice({ text, kind, at: Date.now() });
    window.clearTimeout(showNotice.timer);
    showNotice.timer = window.setTimeout(() => setNotice(null), 4000);
  }, []);

  // ---------- Datei laden ----------
  const openBytes = useCallback(async (bytes, name) => {
    setError(null);
    setBusy('Dokument wird geladen …');
    setProgress(null);
    try {
      const { session, pdfjsDoc, pages, blocks: blockMap, usableFonts, fontNameByEntry } = await analyzeDocument(bytes, (current, total) => {
        setProgress({ current, total });
        setBusy(`Text wird analysiert … Seite ${current} von ${total}`);
      });
      setDoc({ name, bytes, session, pdfjsDoc, pages, usableFonts, fontNameByEntry, amount: findInvoiceAmount(blockMap) });
      setBlocks(blockMap);
      editsRef.current = new Map();
      setEdits(editsRef.current);
      historyRef.current = { past: [], future: [] };
      setHistVersion(v => v + 1);
      setRendered({ pdfjsDoc, bytes, report: {}, version: 0 });
      setSelectedId(null);
      setEditingId(null);
      setMode('select');
      renderCounter.current = 0;
      showNotice(`${name} geladen: ${pages.length} ${pages.length === 1 ? 'Seite' : 'Seiten'}, ${blockMap.size} Textblöcke erkannt.`);
    } catch (e) {
      console.error(e);
      setError('Die Datei konnte nicht geöffnet werden. Ist es ein gültiges, unverschlüsseltes PDF?');
    } finally {
      setBusy(null);
      setProgress(null);
    }
  }, [showNotice]);

  const isPdf = (f) => f && (/\.pdf$/i.test(f.name) || f.type === 'application/pdf');

  /** Erste Datei wird als Vorlage geoeffnet, alle weiteren landen im Stapel. */
  const openFiles = useCallback(async (list) => {
    const pdfs = [...(list || [])].filter(isPdf);
    if (!pdfs.length) { setError('Bitte PDF-Dateien auswählen.'); return; }
    const [first, ...rest] = pdfs;
    const buf = await first.arrayBuffer();
    await openBytes(new Uint8Array(buf), first.name);
    setQueue(rest);
    if (rest.length) showNotice(`${first.name} als Vorlage geöffnet. ${rest.length} weitere ${rest.length === 1 ? 'PDF wartet' : 'PDFs warten'} im Stapel.`);
  }, [openBytes, showNotice]);

  /** Weitere Dateien in den Stapel aufnehmen (Drop auf das offene Dokument). */
  const addToQueue = useCallback((list) => {
    const pdfs = [...(list || [])].filter(isPdf);
    if (!pdfs.length) return;
    setQueue(prev => {
      const known = new Set(prev.map(f => f.name + ':' + f.size));
      const added = pdfs.filter(f => !known.has(f.name + ':' + f.size));
      if (added.length) showNotice(`${added.length} ${added.length === 1 ? 'PDF' : 'PDFs'} zum Stapel hinzugefügt.`);
      return [...prev, ...added];
    });
  }, [showNotice]);

  const openDemo = useCallback(async () => {
    const bytes = await buildDemoPdf();
    await openBytes(bytes, 'Demo-Rechnung.pdf');
  }, [openBytes]);

  const closeDoc = useCallback(() => {
    setDoc(null);
    setBlocks(new Map());
    editsRef.current = new Map();
    setEdits(editsRef.current);
    historyRef.current = { past: [], future: [] };
    setHistVersion(v => v + 1);
    setRendered(null);
    setSelectedId(null);
    setEditingId(null);
    setError(null);
    setQueue([]);
  }, []);

  // ---------- Vorschau neu erzeugen, sobald sich Aenderungen aendern ----------
  useEffect(() => {
    if (!doc) return;
    const my = ++renderCounter.current;
    if (edits.size === 0) {
      setRendered(prev => {
        if (prev && prev.pdfjsDoc === doc.pdfjsDoc) return prev;
        if (prev && prev.pdfjsDoc !== doc.pdfjsDoc) prev.pdfjsDoc.destroy();
        return { pdfjsDoc: doc.pdfjsDoc, bytes: doc.bytes, report: {}, version: my };
      });
      return;
    }
    const timer = window.setTimeout(async () => {
      try {
        setBusy('Vorschau wird aktualisiert …');
        const { bytes, report } = await doc.session.render(blocks, edits);
        if (my !== renderCounter.current) return;
        const pdfjsDoc = await loadPdfjsDocument(bytes);
        if (my !== renderCounter.current) { pdfjsDoc.destroy(); return; }
        setRendered(prev => {
          if (prev && prev.pdfjsDoc !== doc.pdfjsDoc) prev.pdfjsDoc.destroy();
          return { pdfjsDoc, bytes, report, version: my };
        });
      } catch (e) {
        console.error(e);
        setError('Die Änderungen konnten nicht in das PDF geschrieben werden.');
      } finally {
        if (my === renderCounter.current) setBusy(null);
      }
    }, 150);
    return () => window.clearTimeout(timer);
  }, [doc, blocks, edits]);

  // ---------- Aenderungen mit Verlauf ----------
  const commitEdits = useCallback((updater) => {
    const prev = editsRef.current;
    const next = updater(new Map(prev));
    historyRef.current = { past: [...historyRef.current.past.slice(-80), prev], future: [] };
    editsRef.current = next;
    setEdits(next);
    setHistVersion(v => v + 1);
  }, []);

  const updateEdit = useCallback((id, patch) => {
    commitEdits(map => {
      const merged = { ...(map.get(id) || {}), ...patch };
      for (const k of Object.keys(merged)) if (merged[k] === undefined) delete merged[k];
      const block = blocks.get(id);
      if (block && !block.added && merged.text === block.text) delete merged.text;
      if (block && !block.added && merged.size === block.size) delete merged.size;
      if (block && !block.added && merged.font === null) delete merged.font;
      if (!block?.added && editIsEmpty(merged)) map.delete(id); else map.set(id, merged);
      return map;
    });
  }, [commitEdits, blocks]);

  const revertEdit = useCallback((id) => {
    const block = blocks.get(id);
    if (block?.added) {
      setBlocks(prev => { const m = new Map(prev); m.delete(id); return m; });
    }
    commitEdits(map => { map.delete(id); return map; });
    if (selectedId === id) setSelectedId(null);
  }, [blocks, commitEdits, selectedId]);

  const undo = useCallback(() => {
    const h = historyRef.current;
    if (!h.past.length) return;
    const prev = h.past[h.past.length - 1];
    historyRef.current = { past: h.past.slice(0, -1), future: [editsRef.current, ...h.future] };
    editsRef.current = prev;
    setEdits(prev);
    setHistVersion(v => v + 1);
    setEditingId(null);
  }, []);

  const redo = useCallback(() => {
    const h = historyRef.current;
    if (!h.future.length) return;
    const next = h.future[0];
    historyRef.current = { past: [...h.past, editsRef.current], future: h.future.slice(1) };
    editsRef.current = next;
    setEdits(next);
    setHistVersion(v => v + 1);
    setEditingId(null);
  }, []);

  // ---------- Bloecke ----------
  const defaultFontChoice = useMemo(() => {
    if (!doc) return { type: 'standard', name: 'Helvetica' };
    const best = [...doc.usableFonts].sort((a, b) => (b.pages.length - a.pages.length) || ((a.bold || a.italic) - (b.bold || b.italic)))[0];
    return best ? { type: 'entry', id: best.id } : { type: 'standard', name: 'Helvetica' };
  }, [doc]);

  const addBlockAt = useCallback((pageIndex, x, y) => {
    const id = nextBlockId();
    const choice = defaultFontChoice;
    const entry = choice.type === 'entry' ? doc.session.getEntry(choice.id) : null;
    const enc = entry ? doc.session.getEncoder(entry.id) : null;
    const std = choice.type === 'standard' ? STANDARD_FONTS.find(s => s.name === choice.name) : null;
    const block = {
      id, pageIndex, added: true,
      fontName: entry ? (doc.fontNameByEntry.get(entry.id) || null) : null,
      fontEntryId: entry ? entry.id : null,
      standardFont: std ? std.name : 'Helvetica',
      pdfjsFont: { name: entry ? entry.baseFont : (std ? std.name : 'Helvetica'), bold: !!(enc?.bold ?? std?.bold), italic: !!(enc?.italic ?? std?.italic), serif: !!(enc?.serif ?? std?.serif), mono: !!(enc?.mono ?? std?.mono) },
      fontFamily: (enc?.mono ?? std?.mono) ? 'monospace' : (enc?.serif ?? std?.serif) ? 'serif' : 'sans-serif',
      size: 12, angle: 0, x, y, lines: [], lineHeight: 14.4,
      ascent: enc ? enc.ascent : 0.9, descent: enc ? enc.descent : -0.22,
      text: '', width: 0, color: [0, 0, 0], bg: [1, 1, 1], sampled: true,
    };
    setBlocks(prev => new Map(prev).set(id, block));
    commitEdits(map => map.set(id, { text: '', font: choice }));
    setSelectedId(id);
    setEditingId(id);
    setMode('select');
  }, [defaultFontChoice, doc, commitEdits]);

  const onBlocksSampled = useCallback((updates) => {
    setBlocks(prev => {
      const m = new Map(prev);
      for (const [id, colors] of Object.entries(updates)) {
        const b = m.get(id);
        if (b && !b.sampled) m.set(id, { ...b, ...colors, sampled: true });
      }
      return m;
    });
  }, []);

  const finishEditing = useCallback((id, text) => {
    setEditingId(null);
    // Nach dem Uebernehmen die Auswahl aufheben, damit die schwebende Leiste
    // nicht den Text darueber verdeckt.
    setSelectedId(cur => (cur === id ? null : cur));
    const block = blocks.get(id);
    if (!block) return;
    if (block.added && text.trim() === '') { revertEdit(id); return; }
    updateEdit(id, { text });
  }, [blocks, updateEdit, revertEdit]);

  // ---------- Tastatur ----------
  useEffect(() => {
    const onKey = (e) => {
      if (editingId) return;
      const tag = (e.target && e.target.tagName) || '';
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z' && !e.shiftKey) { e.preventDefault(); undo(); }
      else if ((e.ctrlKey || e.metaKey) && (e.key.toLowerCase() === 'y' || (e.key.toLowerCase() === 'z' && e.shiftKey))) { e.preventDefault(); redo(); }
      else if ((e.key === 'Delete' || e.key === 'Backspace') && selectedId) { e.preventDefault(); updateEdit(selectedId, { deleted: true }); }
      else if (e.key === 'Escape') { setSelectedId(null); setMode('select'); }
      else if (e.key === 'Enter' && selectedId) { e.preventDefault(); setEditingId(selectedId); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [editingId, selectedId, undo, redo, updateEdit]);

  // Der Betrag wird aus den aktuellen Bloecken gelesen, damit eine Korrektur
  // am Betrag im Dokument auch im Dateinamen ankommt.
  const amountOfDoc = useMemo(() => {
    if (!doc) return null;
    if (!edits.size) return doc.amount ?? null;
    const aktuell = [...blocks.values()].map(b => {
      const e = edits.get(b.id);
      if (!e) return b;
      if (e.deleted) return { ...b, text: '', deleted: true };
      return e.text === undefined ? b : { ...b, text: e.text };
    });
    return findInvoiceAmount(aktuell) ?? doc.amount ?? null;
  }, [doc, blocks, edits]);

  // ---------- Speichern ----------
  const save = useCallback(async () => {
    if (!doc) return;
    try {
      setBusy('PDF wird erzeugt …');
      const getBytes = async () => (edits.size ? (await doc.session.render(blocks, edits)).bytes : doc.bytes);
      const praefix = amountFirst ? amountPrefix(amountOfDoc) : '';
      const result = await savePdf(getBytes, suggestedFileName(doc.name, suffix, praefix));
      if (result.method === 'picker') showNotice(`Gespeichert als ${result.name}.`, 'success');
      else if (result.method === 'abgebrochen') showNotice('Speichern abgebrochen.');
      else if (result.method === 'download') showNotice(`${result.name} wurde heruntergeladen.`, 'success');
    } catch (e) {
      console.error(e);
      setError('Speichern fehlgeschlagen.');
    } finally {
      setBusy(null);
    }
  }, [doc, blocks, edits, showNotice, suffix, amountFirst, amountOfDoc]);

  const zoomStep = useCallback((dir) => {
    setZoom(z => {
      const idx = ZOOM_STEPS.findIndex(s => Math.abs(s - z) < 0.01);
      const next = idx < 0 ? (dir > 0 ? ZOOM_STEPS.find(s => s > z) : [...ZOOM_STEPS].reverse().find(s => s < z)) : ZOOM_STEPS[Math.min(ZOOM_STEPS.length - 1, Math.max(0, idx + dir))];
      return next || z;
    });
  }, []);

  const jumpToBlock = useCallback((id) => {
    const b = blocks.get(id);
    if (!b) return;
    setSelectedId(id);
    const el = pageRefs.current.get(b.pageIndex);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, [blocks]);

  const blocksByPage = useMemo(() => {
    const m = new Map();
    for (const b of blocks.values()) {
      if (!m.has(b.pageIndex)) m.set(b.pageIndex, []);
      m.get(b.pageIndex).push(b);
    }
    return m;
  }, [blocks]);

  const changeCount = edits.size;

  return (
    <div className="flex h-full flex-col">
      <Toolbar
        doc={doc}
        mode={mode}
        setMode={setMode}
        zoom={zoom}
        onZoomIn={() => zoomStep(1)}
        onZoomOut={() => zoomStep(-1)}
        canUndo={histVersion >= 0 && historyRef.current.past.length > 0}
        canRedo={historyRef.current.future.length > 0}
        onUndo={undo}
        onRedo={redo}
        onOpen={openFiles}
        queueCount={queue.length}
        suffix={suffix}
        onSuffixChange={setSuffix}
        amountFirst={amountFirst}
        onAmountFirstChange={setAmountFirst}
        amountLabel={amountOfDoc ? amountPrefix(amountOfDoc).trim() : null}
        onSave={save}
        onClose={closeDoc}
        changeCount={changeCount}
        busy={busy}
        panelOpen={panelOpen}
        onTogglePanel={() => setPanelOpen(p => !p)}
        onBatch={() => setBatchOpen(true)}
      />

      {batchOpen && doc && (
        <BatchDialog
          template={{ name: doc.name, bytes: doc.bytes, session: doc.session, blocks, edits }}
          initialFiles={queue}
          onFilesChange={setQueue}
          suffix={suffix}
          onSuffixChange={setSuffix}
          amountFirst={amountFirst}
          onAmountFirstChange={setAmountFirst}
          onClose={() => setBatchOpen(false)}
          onNotice={showNotice}
        />
      )}

      {error && (
        <div className="mx-4 mt-3 flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          <span className="flex-1">{error}</span>
          <button className="text-red-500 hover:text-red-700" onClick={() => setError(null)} aria-label="Meldung schließen">×</button>
        </div>
      )}

      {!doc ? (
        <DropZone onFiles={openFiles} onDemo={openDemo} busy={busy} progress={progress} />
      ) : (
        <div className="flex min-h-0 flex-1">
          <div
            ref={scrollRef}
            className="pdf-scroll min-w-0 flex-1 overflow-auto px-6 py-6"
            onMouseDown={(e) => { if (e.target === e.currentTarget) { setSelectedId(null); } }}
            onDragOver={(e) => { if (e.dataTransfer.types.includes('Files')) e.preventDefault(); }}
            onDrop={(e) => { if (e.dataTransfer.files?.length) { e.preventDefault(); addToQueue(e.dataTransfer.files); } }}
          >
            {doc.pages.map(p => (
              <div key={p.index} ref={el => { if (el) pageRefs.current.set(p.index, el); }} className="relative">
                <div className="mx-auto mb-1 flex items-center justify-between text-xs text-slate-400" style={{ width: Math.round(p.width * zoom) }}>
                  <span>Seite {p.index + 1} von {doc.pages.length}</span>
                  <span>{Math.round(p.width * 0.3528)} × {Math.round(p.height * 0.3528)} mm</span>
                </div>
                <PageView
                  pageIndex={p.index}
                  pdfjsDoc={rendered ? rendered.pdfjsDoc : doc.pdfjsDoc}
                  renderVersion={rendered ? rendered.version : 0}
                  isOriginal={!rendered || rendered.pdfjsDoc === doc.pdfjsDoc}
                  session={doc.session}
                  usableFonts={doc.usableFonts}
                  zoom={zoom}
                  blocks={blocksByPage.get(p.index) || []}
                  edits={edits}
                  report={rendered ? rendered.report : {}}
                  selectedId={selectedId}
                  editingId={editingId}
                  mode={mode}
                  onSelect={setSelectedId}
                  onStartEdit={(id) => { setSelectedId(id); setEditingId(id); }}
                  onFinishEdit={finishEditing}
                  onCancelEdit={() => setEditingId(null)}
                  onUpdateEdit={updateEdit}
                  onRevert={revertEdit}
                  onAddBlock={addBlockAt}
                  onBlocksSampled={onBlocksSampled}
                />
              </div>
            ))}
          </div>
          {panelOpen && (
            <ChangesPanel
              doc={doc}
              blocks={blocks}
              edits={edits}
              report={rendered ? rendered.report : {}}
              selectedId={selectedId}
              onJump={jumpToBlock}
              onRevert={revertEdit}
              onClose={() => setPanelOpen(false)}
            />
          )}
        </div>
      )}

      {notice && (
        <div className={`pointer-events-none fixed bottom-5 left-1/2 z-50 -translate-x-1/2 rounded-lg px-4 py-2 text-sm shadow-lg animate-fade-in ${notice.kind === 'success' ? 'bg-emerald-600 text-white' : 'bg-slate-900 text-white'}`}>
          {notice.text}
        </div>
      )}
    </div>
  );
}
