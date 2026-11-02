import { useRef } from 'react';
import { FileText, Upload, Download, Undo2, Redo2, ZoomIn, ZoomOut, MousePointer2, Type, X, PanelRight, Loader2, Layers } from 'lucide-react';
import { clsx } from 'clsx';

export default function Toolbar({ doc, mode, setMode, zoom, onZoomIn, onZoomOut, canUndo, canRedo, onUndo, onRedo, onOpen, onSave, onClose, changeCount, busy, panelOpen, onTogglePanel, onBatch, queueCount, suffix, onSuffixChange, amountFirst, onAmountFirstChange, amountLabel }) {
  const inputRef = useRef(null);
  return (
    <header className="z-40 border-b border-slate-200 bg-white">
      <div className="flex items-center gap-3 px-4 py-2.5">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600 text-white">
            <FileText size={18} strokeWidth={1.75} />
          </div>
          <div className="leading-tight">
            <div className="text-sm font-semibold text-slate-900">PDF-Editor</div>
            <div className="text-xs text-slate-400">Text im PDF ändern und speichern</div>
          </div>
        </div>

        {doc && (
          <div className="ml-4 hidden min-w-0 items-center gap-2 border-l border-slate-200 pl-4 md:flex">
            <span className="truncate text-sm font-medium text-slate-700" title={doc.name}>{doc.name}</span>
            <span className="shrink-0 rounded-md bg-slate-100 px-1.5 py-0.5 text-xs text-slate-500">{doc.pages.length} {doc.pages.length === 1 ? 'Seite' : 'Seiten'}</span>
            {changeCount > 0 && (
              <span className="shrink-0 rounded-md bg-blue-50 px-1.5 py-0.5 text-xs font-medium text-blue-700">{changeCount} {changeCount === 1 ? 'Änderung' : 'Änderungen'}</span>
            )}
          </div>
        )}

        <div className="ml-auto flex items-center gap-2">
          {busy && (
            <span className="mr-2 hidden items-center gap-1.5 text-xs text-slate-500 lg:flex">
              <Loader2 size={14} className="spin" /> {busy}
            </span>
          )}
          <input ref={inputRef} type="file" accept="application/pdf,.pdf" multiple className="hidden" onChange={(e) => { onOpen(e.target.files); e.target.value = ''; }} />
          <button className="btn" onClick={() => inputRef.current?.click()}>
            <Upload size={15} strokeWidth={1.75} /> {doc ? 'PDFs öffnen' : 'PDFs öffnen'}
          </button>
          {doc && (
            <>
              <button className={clsx(queueCount > 0 ? 'btn-primary' : 'btn')} onClick={onBatch} disabled={!!busy} title="Stapel: Änderungen auf weitere PDFs übertragen, übergreifendes PDF anhängen, alles gesammelt speichern">
                <Layers size={15} strokeWidth={1.75} /> Stapel und Anhang
                {queueCount > 0 && <span className="ml-1 rounded-md bg-white/20 px-1.5 py-0.5 text-xs font-semibold text-white">{queueCount}</span>}
              </button>
              <button className="btn-primary" onClick={onSave} disabled={!!busy}>
                <Download size={15} strokeWidth={1.75} /> Speichern
              </button>
              <button className="btn-icon" onClick={onClose} title="Dokument schließen" aria-label="Dokument schließen">
                <X size={16} strokeWidth={1.75} />
              </button>
            </>
          )}
        </div>
      </div>

      {doc && (
        <div className="flex items-center gap-2 border-t border-slate-100 bg-slate-50/60 px-4 py-1.5">
          <div className="flex items-center gap-1 rounded-lg bg-white p-0.5 ring-1 ring-slate-200">
            <button className={clsx('btn-toggle', mode === 'select' ? 'btn-toggle-on' : 'btn-toggle-off')} onClick={() => setMode('select')} title="Vorhandenen Text anklicken und ändern">
              <MousePointer2 size={15} strokeWidth={1.75} /> Text bearbeiten
            </button>
            <button className={clsx('btn-toggle', mode === 'add' ? 'btn-toggle-on' : 'btn-toggle-off')} onClick={() => setMode('add')} title="Neuen Text an einer beliebigen Stelle einfügen">
              <Type size={15} strokeWidth={1.75} /> Text hinzufügen
            </button>
          </div>

          <div className="ml-2 flex items-center gap-1">
            <button className="btn-icon" onClick={onUndo} disabled={!canUndo} title="Rückgängig (Strg+Z)" aria-label="Rückgängig">
              <Undo2 size={16} strokeWidth={1.75} />
            </button>
            <button className="btn-icon" onClick={onRedo} disabled={!canRedo} title="Wiederholen (Strg+Y)" aria-label="Wiederholen">
              <Redo2 size={16} strokeWidth={1.75} />
            </button>
          </div>

          <div className="ml-2 flex items-center gap-1">
            <button className="btn-icon" onClick={onZoomOut} title="Verkleinern" aria-label="Verkleinern"><ZoomOut size={16} strokeWidth={1.75} /></button>
            <span className="w-12 text-center font-mono text-xs text-slate-600">{Math.round(zoom * 100)} %</span>
            <button className="btn-icon" onClick={onZoomIn} title="Vergrößern" aria-label="Vergrößern"><ZoomIn size={16} strokeWidth={1.75} /></button>
          </div>

          <label className="ml-3 flex items-center gap-1.5 text-xs text-slate-500" title="Wird beim Speichern an den ursprünglichen Dateinamen angehängt, z. B. Rechnung_korrigiert.pdf">
            <span>Dateizusatz</span>
            <input
              type="text"
              value={suffix}
              onChange={(e) => onSuffixChange(e.target.value)}
              placeholder="(kein Zusatz)"
              className="h-8 w-32 rounded-lg border border-slate-200 bg-white px-2 font-mono text-xs text-slate-700 focus:border-blue-400 focus:outline-none"
              aria-label="Dateizusatz beim Speichern"
            />
          </label>

          <label
            className="ml-3 flex cursor-pointer items-center gap-1.5 text-xs text-slate-500"
            title={amountLabel
              ? `Der Dateiname beginnt beim Speichern mit dem erkannten Rechnungsbetrag: ${amountLabel}`
              : 'In diesem Dokument wurde kein Rechnungsbetrag erkannt.'}
          >
            <input
              type="checkbox"
              checked={!!amountFirst}
              onChange={(e) => onAmountFirstChange(e.target.checked)}
              className="h-3.5 w-3.5 cursor-pointer accent-blue-600"
              aria-label="Betrag dem Dateinamen voranstellen"
            />
            <span>Betrag voranstellen</span>
            {amountLabel
              ? <span className="font-mono text-xs text-slate-700">{amountLabel}</span>
              : <span className="text-slate-400">(nicht erkannt)</span>}
          </label>

          <p className="ml-4 hidden text-xs text-slate-500 xl:block">
            {queueCount > 0
              ? `${queueCount} weitere ${queueCount === 1 ? 'PDF wartet' : 'PDFs warten'} im Stapel. Ändere dieses Dokument als Vorlage und klicke dann oben rechts auf „Stapel und Anhang“, um Anhang, Verarbeitung und Sammelspeicherung zu starten.`
              : mode === 'add'
              ? 'Klicke auf die Seite, um an dieser Stelle eine neue Textbox anzulegen.'
              : 'Klicke auf einen Text, um ihn zu ändern. Enter für Zeilenumbruch, Strg+Enter oder Klick daneben übernimmt die Änderung.'}
          </p>

          <button className={clsx('btn-icon ml-auto', panelOpen && 'bg-slate-100')} onClick={onTogglePanel} title="Änderungsliste ein-/ausblenden" aria-label="Änderungsliste">
            <PanelRight size={16} strokeWidth={1.75} />
          </button>
        </div>
      )}
    </header>
  );
}
