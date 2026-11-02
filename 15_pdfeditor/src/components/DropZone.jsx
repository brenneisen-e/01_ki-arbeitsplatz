import { useRef, useState } from 'react';
import { FileUp, FilePlus2, Loader2, Type, ShieldCheck, Download } from 'lucide-react';
import { clsx } from 'clsx';

const FEATURES = [
  { icon: Type, title: 'Text direkt ändern', text: 'Vorhandene Textblöcke anklicken, überschreiben, verschieben oder löschen. Neue Textboxen an beliebiger Stelle einfügen.' },
  { icon: ShieldCheck, title: 'Schrift bleibt erhalten', text: 'Geänderter Text wird mit der im PDF eingebetteten Originalschrift geschrieben. Nur wenn ein Zeichen dort fehlt, springt eine passende Standardschrift ein.' },
  { icon: Download, title: 'Einzeln oder im Stapel speichern', text: 'Alles läuft im Browser, nichts wird hochgeladen. Ein PDF speicherst du direkt, viele gleich aufgebaute PDFs gesammelt als ZIP oder in einen Ordner.' },
];

export default function DropZone({ onFiles, onDemo, busy, progress }) {
  const inputRef = useRef(null);
  const [over, setOver] = useState(false);

  const onDrop = (e) => {
    e.preventDefault();
    setOver(false);
    if (e.dataTransfer.files?.length) onFiles(e.dataTransfer.files);
  };

  return (
    <div className="flex flex-1 items-start justify-center overflow-auto px-6 py-10">
      <div className="w-full max-w-3xl">
        <div
          className={clsx(
            'card-base flex flex-col items-center px-8 py-14 text-center transition-colors',
            over && 'border-blue-400 bg-blue-50/40',
          )}
          onDragOver={(e) => { e.preventDefault(); setOver(true); }}
          onDragLeave={() => setOver(false)}
          onDrop={onDrop}
        >
          <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
            {busy ? <Loader2 size={26} className="spin" strokeWidth={1.75} /> : <FileUp size={26} strokeWidth={1.75} />}
          </div>
          {busy ? (
            <>
              <h1 className="text-lg font-semibold text-slate-900">{busy}</h1>
              {progress && (
                <div className="mt-4 h-1.5 w-64 overflow-hidden rounded-full bg-slate-100">
                  <div className="h-full rounded-full bg-blue-600 transition-all" style={{ width: `${Math.round((progress.current / progress.total) * 100)}%` }} />
                </div>
              )}
            </>
          ) : (
            <>
              <h1 className="text-xl font-semibold text-slate-900">PDFs hierher ziehen oder auswählen</h1>
              <p className="mt-2 max-w-md text-sm text-slate-500">
                Die Dateien bleiben auf deinem Rechner. Bei mehreren PDFs wird das erste zur Vorlage: Du änderst es einmal, die übrigen werden anschließend im Stapel genauso bearbeitet.
              </p>
              <input ref={inputRef} type="file" accept="application/pdf,.pdf" multiple className="hidden" onChange={(e) => { onFiles(e.target.files); e.target.value = ''; }} />
              <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
                <button className="btn-primary" onClick={() => inputRef.current?.click()}>
                  <FileUp size={15} strokeWidth={1.75} /> PDFs auswählen
                </button>
                <button className="btn" onClick={onDemo}>
                  <FilePlus2 size={15} strokeWidth={1.75} /> Demo-Rechnung laden
                </button>
              </div>
            </>
          )}
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {FEATURES.map(f => (
            <div key={f.title} className="card-base p-4">
              <div className="mb-2 flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-slate-700">
                <f.icon size={16} strokeWidth={1.75} />
              </div>
              <div className="text-sm font-semibold text-slate-800">{f.title}</div>
              <p className="mt-1 text-xs leading-relaxed text-slate-500">{f.text}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
