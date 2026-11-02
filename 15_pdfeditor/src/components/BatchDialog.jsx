import { useEffect, useMemo, useRef, useState } from 'react';
import { X, FileUp, Layers, Loader2, Check, AlertTriangle, Download, FolderDown, Eye, ChevronDown, ChevronRight, Trash2, Paperclip } from 'lucide-react';
import { clsx } from 'clsx';
import { processBatch, outputNameFor, mergeWithAttachment, pdfPageCount } from '../lib/batch.js';
import { findInvoiceAmount, amountPrefix } from '../lib/amount.js';
import { buildZip } from '../lib/zip.js';

function shorten(text, n = 48) {
  const t = (text || '').replace(/\s+/g, ' ').trim();
  return t.length > n ? t.slice(0, n - 1) + '…' : t;
}

function downloadBytes(bytes, name, type = 'application/pdf') {
  const url = URL.createObjectURL(new Blob([bytes], { type }));
  const a = document.createElement('a');
  a.href = url;
  a.download = name;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 10000);
}

function describeEdit(block, edit) {
  if (!block) return 'Änderung';
  if (block.added) return 'Neuer Text';
  if (edit.deleted) return 'Löschen';
  if (edit.text !== undefined) return 'Text ersetzen';
  if (edit.dx || edit.dy) return 'Verschieben';
  return 'Formatieren';
}

export default function BatchDialog({ template, initialFiles = [], onFilesChange, suffix = '_bearbeitet', onSuffixChange, amountFirst = false, onAmountFirstChange, onClose, onNotice }) {
  const inputRef = useRef(null);
  const [files, setFilesState] = useState(initialFiles);
  const setFiles = (updater) => setFilesState(prev => { const next = typeof updater === 'function' ? updater(prev) : updater; if (onFilesChange) onFilesChange(next); return next; });
  const [over, setOver] = useState(false);
  const [phase, setPhase] = useState('select');
  const [progress, setProgress] = useState(null);
  const [results, setResults] = useState([]);
  const [expanded, setExpanded] = useState(() => new Set());
  const [attachment, setAttachment] = useState(null); // { file, bytes, pages }
  const [attachmentPosition, setAttachmentPosition] = useState('hinten');
  const [attachmentOver, setAttachmentOver] = useState(false);
  const attachmentInputRef = useRef(null);

  const setAttachmentFile = async (file) => {
    if (!file) return;
    if (!(/\.pdf$/i.test(file.name) || file.type === 'application/pdf')) { onNotice('Der Anhang muss eine PDF-Datei sein.'); return; }
    try {
      const bytes = new Uint8Array(await file.arrayBuffer());
      const pages = await pdfPageCount(bytes);
      setAttachment({ file, bytes, pages });
    } catch {
      onNotice('Der Anhang konnte nicht gelesen werden.');
    }
  };
  const editCount = template.edits.size;
  const canPickFolder = typeof window.showDirectoryPicker === 'function' && window.self === window.top;

  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const addFiles = (list) => {
    const pdfs = [...(list || [])].filter(f => /\.pdf$/i.test(f.name) || f.type === 'application/pdf');
    setFiles(prev => {
      const known = new Set(prev.map(f => f.name + ':' + f.size));
      return [...prev, ...pdfs.filter(f => !known.has(f.name + ':' + f.size))];
    });
  };

  const run = async () => {
    setPhase('running');
    setProgress({ index: 0, total: files.length + 1, name: template.name });
    const out = [];
    const options = { suffix, amountPrefix: amountFirst, ...(attachment ? { attachment: attachment.bytes, attachmentPosition } : {}) };
    // Betrag der Vorlage aus den bearbeiteten Bloecken lesen
    const vorlagePraefix = amountFirst
      ? amountPrefix(findInvoiceAmount([...template.blocks.values()].map(b => {
          const e = template.edits.get(b.id);
          if (!e) return b;
          if (e.deleted) return { ...b, text: '', deleted: true };
          return e.text === undefined ? b : { ...b, text: e.text };
        })))
      : '';
    try {
      let { bytes, report } = await template.session.render(template.blocks, template.edits);
      if (attachment) bytes = await mergeWithAttachment(bytes, attachment.bytes, attachmentPosition);
      out.push({
        name: template.name, outputName: outputNameFor(template.name, suffix, vorlagePraefix), bytes, report, isTemplate: true, error: null,
        matches: [...template.edits.entries()].map(([id]) => ({ editId: id, targetId: id, status: 'ok', templateText: template.blocks.get(id)?.text, targetText: template.blocks.get(id)?.text })),
      });
    } catch (e) {
      out.push({ name: template.name, outputName: outputNameFor(template.name, suffix, vorlagePraefix), bytes: null, report: {}, isTemplate: true, matches: [], error: e?.message || String(e) });
    }
    const rest = await processBatch(files, template, (index, total, name) => setProgress({ index: index + 1, total: total + 1, name }), options);
    setResults([...out, ...rest]);
    setPhase('done');
  };

  const okResults = results.filter(r => r.bytes);
  const summary = useMemo(() => {
    const missing = results.reduce((n, r) => n + r.matches.filter(m => m.status === 'missing').length, 0);
    const fallbacks = results.reduce((n, r) => n + Object.values(r.report || {}).filter(x => x.fallback).length, 0);
    const errors = results.filter(r => r.error).length;
    return { missing, fallbacks, errors };
  }, [results]);

  const downloadZip = () => {
    const zip = buildZip(okResults.map(r => ({ name: r.outputName, bytes: r.bytes })));
    const date = new Date().toISOString().slice(0, 10);
    downloadBytes(zip, `pdf-stapel_${date}.zip`, 'application/zip');
    onNotice(`ZIP mit ${okResults.length} PDFs wurde heruntergeladen.`, 'success');
  };

  const saveToFolder = async () => {
    try {
      const dir = await window.showDirectoryPicker({ mode: 'readwrite' });
      let n = 0;
      for (const r of okResults) {
        const handle = await dir.getFileHandle(r.outputName, { create: true });
        const w = await handle.createWritable();
        await w.write(new Blob([r.bytes], { type: 'application/pdf' }));
        await w.close();
        n++;
      }
      onNotice(`${n} PDFs im Ordner gespeichert.`, 'success');
    } catch (e) {
      if (e?.name !== 'AbortError') onNotice('Speichern im Ordner fehlgeschlagen. Nutze stattdessen den ZIP-Download.');
    }
  };

  const preview = (r) => {
    const url = URL.createObjectURL(new Blob([r.bytes], { type: 'application/pdf' }));
    window.open(url, '_blank', 'noopener');
    setTimeout(() => URL.revokeObjectURL(url), 60000);
  };

  const toggle = (i) => setExpanded(prev => { const s = new Set(prev); if (s.has(i)) s.delete(i); else s.add(i); return s; });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 animate-fade-in" onMouseDown={(e) => { if (e.target === e.currentTarget && phase !== 'running') onClose(); }}>
      <div className="card-base flex max-h-[90vh] w-full max-w-4xl flex-col overflow-hidden" role="dialog" aria-modal="true" aria-labelledby="batch-title">
        <div className="flex items-start gap-3 border-b border-slate-100 px-5 py-4">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
            <Layers size={18} strokeWidth={1.75} />
          </div>
          <div className="min-w-0 flex-1">
            <h2 id="batch-title" className="text-base font-semibold text-slate-900">Stapel und Anhang</h2>
            <p className="mt-0.5 text-xs leading-relaxed text-slate-500">
              {editCount > 0
                ? <>Die {editCount} {editCount === 1 ? 'Änderung' : 'Änderungen'} aus <span className="font-medium text-slate-700">{template.name}</span> werden auf gleich aufgebaute PDFs übertragen. Felder werden über Seite, Position, Schriftgröße und Schrift wiedererkannt. Alle Ergebnisse lassen sich zusammen speichern.</>
                : <>Noch keine Änderung an <span className="font-medium text-slate-700">{template.name}</span>. Du kannst den Stapel trotzdem verarbeiten, etwa um nur das übergreifende PDF anzuhängen. Wenn Textänderungen übertragen werden sollen, schließe den Dialog, ändere zuerst die Vorlage und komme hierher zurück.</>}
            </p>
          </div>
          <button className="btn-icon" onClick={onClose} disabled={phase === 'running'} aria-label="Dialog schließen"><X size={16} strokeWidth={1.75} /></button>
        </div>

        <div className="min-h-0 flex-1 overflow-auto px-5 py-4">
          {phase === 'select' && (
            <>
              {editCount > 0 && <div className="mb-4 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
                <div className="mb-1 text-xs font-medium text-slate-600">Diese Änderungen werden übertragen</div>
                <ul className="space-y-0.5 text-xs text-slate-600">
                  {[...template.edits.entries()].map(([id, edit]) => {
                    const b = template.blocks.get(id);
                    return (
                      <li key={id} className="flex gap-2">
                        <span className="w-24 shrink-0 text-slate-400">{describeEdit(b, edit)}</span>
                        <span className="truncate">
                          {b && !b.added && <span className="text-slate-400 line-through decoration-slate-300">{shorten(b.text, 40)}</span>}
                          {b && !b.added && !edit.deleted && edit.text !== undefined && <span className="mx-1 text-slate-300">›</span>}
                          {!edit.deleted && <span className="text-slate-800">{shorten(edit.text ?? b?.text, 60)}</span>}
                        </span>
                      </li>
                    );
                  })}
                </ul>
              </div>}

              <div
                className={clsx('flex flex-col items-center rounded-xl border-2 border-dashed px-6 py-8 text-center transition-colors', over ? 'border-blue-400 bg-blue-50/40' : 'border-slate-200')}
                onDragOver={(e) => { e.preventDefault(); setOver(true); }}
                onDragLeave={() => setOver(false)}
                onDrop={(e) => { e.preventDefault(); setOver(false); addFiles(e.dataTransfer.files); }}
              >
                <FileUp size={22} strokeWidth={1.75} className="mb-2 text-slate-400" />
                <div className="text-sm font-medium text-slate-800">Weitere PDFs hierher ziehen</div>
                <div className="mt-1 text-xs text-slate-500">oder mehrere Dateien auf einmal auswählen</div>
                <input ref={inputRef} type="file" accept="application/pdf,.pdf" multiple className="hidden" onChange={(e) => { addFiles(e.target.files); e.target.value = ''; }} />
                <button className="btn mt-3" onClick={() => inputRef.current?.click()}><FileUp size={14} strokeWidth={1.75} /> PDFs auswählen</button>
              </div>

              <div
                className={clsx('mt-4 rounded-lg border px-3 py-3 transition-colors', attachmentOver ? 'border-blue-400 bg-blue-50/40' : 'border-slate-200')}
                onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); setAttachmentOver(true); }}
                onDragLeave={() => setAttachmentOver(false)}
                onDrop={(e) => { e.preventDefault(); e.stopPropagation(); setAttachmentOver(false); setAttachmentFile(e.dataTransfer.files?.[0]); }}
              >
                <div className="flex items-start gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
                    <Paperclip size={15} strokeWidth={1.75} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-medium text-slate-800">Übergreifendes PDF anhängen <span className="font-normal text-slate-400">(optional)</span></div>
                    <p className="mt-0.5 text-xs leading-relaxed text-slate-500">
                      Zum Beispiel Anschreiben oder AGB: Dieses PDF wird mit jedem korrigierten Einzel-PDF zu einer Datei verbunden.
                    </p>
                    <input ref={attachmentInputRef} type="file" accept="application/pdf,.pdf" className="hidden" onChange={(e) => { setAttachmentFile(e.target.files?.[0]); e.target.value = ''; }} />
                    {attachment ? (
                      <div className="mt-2 flex flex-wrap items-center gap-2 text-sm">
                        <span className="inline-flex items-center gap-1.5 rounded-md bg-slate-100 px-2 py-1 text-slate-700">
                          <Paperclip size={13} strokeWidth={1.75} /> {attachment.file.name}
                          <span className="text-xs text-slate-400">{attachment.pages} {attachment.pages === 1 ? 'Seite' : 'Seiten'}</span>
                        </span>
                        <select value={attachmentPosition} onChange={(e) => setAttachmentPosition(e.target.value)} className="rounded-md border border-slate-200 bg-white px-2 py-1 text-xs text-slate-700" aria-label="Position des Anhangs">
                          <option value="hinten">hinten anfügen (Einzel-PDF + Anhang)</option>
                          <option value="vorne">vorne voranstellen (Anhang + Einzel-PDF)</option>
                        </select>
                        <button className="btn-icon h-7 w-7" onClick={() => setAttachment(null)} aria-label="Anhang entfernen" title="Anhang entfernen"><Trash2 size={13} strokeWidth={1.75} /></button>
                      </div>
                    ) : (
                      <button className="btn mt-2" onClick={() => attachmentInputRef.current?.click()}><FileUp size={14} strokeWidth={1.75} /> Anhang-PDF auswählen</button>
                    )}
                  </div>
                </div>
              </div>

              <div className="mt-4 flex flex-wrap items-center gap-3 rounded-lg border border-slate-200 px-3 py-3">
                <label className="flex items-center gap-2 text-sm text-slate-800">
                  <span className="font-medium">Dateizusatz</span>
                  <input
                    type="text"
                    value={suffix}
                    onChange={(e) => onSuffixChange && onSuffixChange(e.target.value)}
                    placeholder="(kein Zusatz)"
                    className="h-8 w-40 rounded-lg border border-slate-200 bg-white px-2 font-mono text-xs text-slate-700 focus:border-blue-400 focus:outline-none"
                    aria-label="Dateizusatz für die Ausgabedateien"
                  />
                </label>
                <label className="flex cursor-pointer items-center gap-2 text-sm text-slate-800">
                  <input
                    type="checkbox"
                    checked={!!amountFirst}
                    onChange={(e) => onAmountFirstChange && onAmountFirstChange(e.target.checked)}
                    className="h-4 w-4 cursor-pointer accent-blue-600"
                    aria-label="Betrag dem Dateinamen voranstellen"
                  />
                  <span className="font-medium">Betrag voranstellen</span>
                </label>
                <span className="text-xs text-slate-500">
                  Ergebnis z. B. <span className="font-mono text-slate-700">{outputNameFor(files[0]?.name || template.name, suffix, amountFirst ? '121,14 EUR ' : '')}</span>
                  {amountFirst && <span className="ml-1">Der Betrag wird je Datei aus dem jeweiligen PDF gelesen.</span>}
                  {suffix === '' && !amountFirst && <span className="ml-1 text-amber-700">Ohne Zusatz behalten die Dateien ihren ursprünglichen Namen.</span>}
                </span>
              </div>

              {files.length > 0 && (
                <ul className="mt-4 divide-y divide-slate-100 rounded-lg border border-slate-200">
                  {files.map((f, i) => (
                    <li key={f.name + i} className="flex items-center gap-3 px-3 py-2 text-sm">
                      <span className="min-w-0 flex-1 truncate text-slate-700">{f.name}</span>
                      <span className="shrink-0 text-xs text-slate-400">{(f.size / 1024).toLocaleString('de-DE', { maximumFractionDigits: 0 })} KB</span>
                      <button className="btn-icon h-7 w-7" onClick={() => setFiles(prev => prev.filter((_, j) => j !== i))} aria-label="Datei entfernen"><Trash2 size={13} strokeWidth={1.75} /></button>
                    </li>
                  ))}
                </ul>
              )}
            </>
          )}

          {phase === 'running' && progress && (
            <div className="flex flex-col items-center py-12 text-center">
              <Loader2 size={26} className="spin mb-4 text-blue-600" strokeWidth={1.75} />
              <div className="text-sm font-medium text-slate-800">Verarbeite {progress.index} von {progress.total}</div>
              <div className="mt-1 max-w-md truncate text-xs text-slate-500">{progress.name || ''}</div>
              <div className="mt-4 h-1.5 w-72 overflow-hidden rounded-full bg-slate-100">
                <div className="h-full rounded-full bg-blue-600 transition-all" style={{ width: `${Math.round((progress.index / progress.total) * 100)}%` }} />
              </div>
            </div>
          )}

          {phase === 'done' && (
            <>
              <div className="mb-3 flex flex-wrap items-center gap-2 text-xs">
                <span className="inline-flex items-center gap-1 rounded-md bg-emerald-50 px-2 py-1 font-medium text-emerald-700"><Check size={13} strokeWidth={2} /> {okResults.length} von {results.length} PDFs erzeugt</span>
                {summary.missing > 0 && <span className="inline-flex items-center gap-1 rounded-md bg-amber-50 px-2 py-1 font-medium text-amber-700"><AlertTriangle size={13} strokeWidth={1.75} /> {summary.missing} {summary.missing === 1 ? 'Feld' : 'Felder'} nicht gefunden</span>}
                {summary.fallbacks > 0 && <span className="inline-flex items-center gap-1 rounded-md bg-amber-50 px-2 py-1 font-medium text-amber-700"><AlertTriangle size={13} strokeWidth={1.75} /> {summary.fallbacks}× Ersatzschrift</span>}
                {summary.errors > 0 && <span className="inline-flex items-center gap-1 rounded-md bg-red-50 px-2 py-1 font-medium text-red-700"><AlertTriangle size={13} strokeWidth={1.75} /> {summary.errors} {summary.errors === 1 ? 'Fehler' : 'Fehler'}</span>}
              </div>
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs text-slate-400">
                    <th className="w-6 pb-2"></th>
                    <th className="pb-2 font-medium">Datei</th>
                    <th className="pb-2 font-medium">Felder</th>
                    <th className="pb-2 font-medium">Hinweise</th>
                    <th className="pb-2 text-right font-medium">Aktionen</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {results.map((r, i) => {
                    const ok = r.matches.filter(m => m.status !== 'missing').length;
                    const fallbacks = Object.values(r.report || {}).filter(x => x.fallback);
                    const isOpen = expanded.has(i);
                    return (
                      <RowGroup key={i} open={isOpen}>
                        <tr className={clsx('align-top', r.error && 'bg-red-50/40')}>
                          <td className="py-2 pr-1">
                            <button className="btn-icon h-6 w-6" onClick={() => toggle(i)} aria-label="Details">{isOpen ? <ChevronDown size={13} /> : <ChevronRight size={13} />}</button>
                          </td>
                          <td className="py-2 pr-3">
                            <div className="truncate font-medium text-slate-800" title={r.name}>{r.outputName}</div>
                            <div className="text-xs text-slate-400">{r.isTemplate ? 'Vorlage' : `aus ${r.name}`}</div>
                          </td>
                          <td className="py-2 pr-3 whitespace-nowrap text-xs">
                            {r.error ? <span className="text-red-600">Fehler</span> : r.matches.length === 0 ? <span className="text-slate-400">keine</span> : (
                              <span className={clsx('inline-flex items-center gap-1', ok === r.matches.length ? 'text-emerald-700' : 'text-amber-700')}>
                                {ok === r.matches.length ? <Check size={13} strokeWidth={2} /> : <AlertTriangle size={13} strokeWidth={1.75} />}
                                {ok} von {r.matches.length}
                              </span>
                            )}
                          </td>
                          <td className="py-2 pr-3 text-xs text-slate-500">
                            {r.error ? <span className="text-red-600">{r.error}</span>
                              : fallbacks.length ? <span className="text-amber-700">{fallbacks.length}× Ersatzschrift ({[...new Set(fallbacks.map(f => f.label))].join(', ')})</span>
                              : <span>Originalschrift</span>}
                            {!r.error && attachment && <span className="ml-1 text-slate-500">+ Anhang ({attachment.pages} {attachment.pages === 1 ? 'Seite' : 'Seiten'} {attachmentPosition === 'vorne' ? 'vorne' : 'hinten'})</span>}
                          </td>
                          <td className="py-2 text-right whitespace-nowrap">
                            {r.bytes && (
                              <>
                                <button className="btn-icon h-7 w-7" title="Vorschau in neuem Tab" onClick={() => preview(r)} aria-label="Vorschau"><Eye size={14} strokeWidth={1.75} /></button>
                                <button className="btn-icon ml-1 h-7 w-7" title="Diese Datei herunterladen" onClick={() => downloadBytes(r.bytes, r.outputName)} aria-label="Herunterladen"><Download size={14} strokeWidth={1.75} /></button>
                              </>
                            )}
                          </td>
                        </tr>
                        {isOpen && (
                          <tr>
                            <td></td>
                            <td colSpan={4} className="pb-3">
                              <ul className="space-y-1 rounded-lg bg-slate-50 px-3 py-2 text-xs">
                                {r.matches.map((m, j) => {
                                  const b = template.blocks.get(m.editId);
                                  const e = template.edits.get(m.editId) || {};
                                  const rep = m.targetId ? r.report[m.targetId] : null;
                                  return (
                                    <li key={j} className="flex gap-2">
                                      <span className={clsx('w-4 shrink-0', m.status === 'missing' ? 'text-amber-600' : 'text-emerald-600')}>
                                        {m.status === 'missing' ? <AlertTriangle size={12} strokeWidth={1.75} /> : <Check size={12} strokeWidth={2} />}
                                      </span>
                                      <span className="w-24 shrink-0 text-slate-400">{describeEdit(b, e)}</span>
                                      <span className="min-w-0 flex-1">
                                        {m.status === 'missing' ? (
                                          <span className="text-amber-700">Kein passendes Feld gefunden für „{shorten(m.templateText, 40)}“</span>
                                        ) : (
                                          <>
                                            {m.targetText !== null && !b?.added && <span className="text-slate-400 line-through decoration-slate-300">{shorten(m.targetText, 40)}</span>}
                                            {!e.deleted && e.text !== undefined && <><span className="mx-1 text-slate-300">›</span><span className="text-slate-800">{shorten(e.text, 60)}</span></>}
                                            {rep?.fallback && <span className="ml-2 text-amber-700">Ersatzschrift {rep.label}{rep.missing?.length ? ` („${rep.missing.join(' ')}“ fehlt)` : ''}</span>}
                                          </>
                                        )}
                                      </span>
                                    </li>
                                  );
                                })}
                              </ul>
                            </td>
                          </tr>
                        )}
                      </RowGroup>
                    );
                  })}
                </tbody>
              </table>
            </>
          )}
        </div>

        <div className="flex items-center gap-2 border-t border-slate-100 px-5 py-3">
          {phase === 'select' && (
            <>
              <span className="text-xs text-slate-500">{files.length === 0 ? 'Noch keine Dateien ausgewählt.' : `${files.length} ${files.length === 1 ? 'Datei' : 'Dateien'} ausgewählt. Die Vorlage wird ebenfalls ausgegeben.`}{attachment ? ' Jede Datei erhält den Anhang.' : ''}</span>
              <button className="btn ml-auto" onClick={onClose}>Abbrechen</button>
              <button className="btn-primary" onClick={run} disabled={files.length === 0}><Layers size={15} strokeWidth={1.75} /> {files.length + 1} PDFs verarbeiten</button>
            </>
          )}
          {phase === 'running' && <span className="text-xs text-slate-500">Bitte warten, die Dateien werden im Browser verarbeitet.</span>}
          {phase === 'done' && (
            <>
              <button className="btn" onClick={() => { setPhase('select'); setResults([]); }}>Weitere Dateien</button>
              <button className="btn ml-auto" onClick={onClose}>Schließen</button>
              {canPickFolder && <button className="btn" onClick={saveToFolder} disabled={!okResults.length}><FolderDown size={15} strokeWidth={1.75} /> In Ordner speichern</button>}
              <button className="btn-primary" onClick={downloadZip} disabled={!okResults.length}><Download size={15} strokeWidth={1.75} /> Alle als ZIP ({okResults.length})</button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function RowGroup({ children }) {
  return <>{children}</>;
}
