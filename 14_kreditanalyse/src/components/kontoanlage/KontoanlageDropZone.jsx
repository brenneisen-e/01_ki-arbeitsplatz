/**
 * KontoanlageDropZone.jsx
 *
 * Drag-&-Drop-/Klick-Upload für einen Kreditvertrag (.docx oder .pdf).
 * Ruft `onFileSelected(file)` auf. Für die Demostrecke wird der Vertrag
 * anhand des Dateinamens einem Demo-Datensatz zugeordnet.
 */

import { useCallback, useRef, useState } from 'react';
import { UploadCloud, FileText, AlertCircle } from 'lucide-react';

const ACCEPTED = ['.docx', '.pdf', '.doc'];

export default function KontoanlageDropZone({ onFileSelected, disabled }) {
  const inputRef = useRef(null);
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState('');

  const validateAndEmit = useCallback(
    (file) => {
      if (!file) return;
      const name = file.name.toLowerCase();
      const ok = ACCEPTED.some((ext) => name.endsWith(ext));
      if (!ok) {
        setError('Bitte einen Kreditvertrag als .docx oder .pdf auswählen.');
        return;
      }
      if (file.size > 30 * 1024 * 1024) {
        setError('Datei ist größer als 30 MB.');
        return;
      }
      setError('');
      onFileSelected(file);
    },
    [onFileSelected]
  );

  const onDrop = useCallback(
    (event) => {
      event.preventDefault();
      setDragOver(false);
      if (disabled) return;
      validateAndEmit(event.dataTransfer?.files?.[0]);
    },
    [disabled, validateAndEmit]
  );

  return (
    <div>
      <button
        type="button"
        onClick={() => !disabled && inputRef.current?.click()}
        onDrop={onDrop}
        onDragOver={(e) => { e.preventDefault(); if (!disabled) setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        disabled={disabled}
        className={
          'w-full flex flex-col items-center justify-center gap-3 py-10 px-6 ' +
          'rounded-xl border-2 border-dashed transition-colors text-center ' +
          (dragOver
            ? 'border-primary bg-primary/5'
            : 'border-border hover:border-primary-light hover:bg-primary/5') +
          (disabled ? ' opacity-50 cursor-not-allowed' : ' cursor-pointer')
        }
      >
        <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 text-primary">
          <UploadCloud size={22} strokeWidth={1.5} />
        </div>
        <div>
          <div className="text-sm font-semibold font-headline text-text-primary">
            Kreditvertrag hochladen
          </div>
          <div className="text-xs text-text-muted mt-1 font-body">
            Vertrag (.docx oder .pdf) hier ablegen oder klicken. Maximal 30 MB.
          </div>
        </div>
        <div className="flex items-center gap-2 text-[11px] text-text-muted font-body">
          <FileText size={12} strokeWidth={1.5} />
          Unterstützt: bilateraler Kreditvertrag, syndizierter Konsortialkreditvertrag
        </div>
        <input
          ref={inputRef}
          type="file"
          accept=".docx,.doc,.pdf,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
          className="hidden"
          onChange={(e) => validateAndEmit(e.target.files?.[0])}
        />
      </button>

      {error && (
        <div className="mt-3 flex items-start gap-2 text-xs text-danger font-body">
          <AlertCircle size={14} className="mt-0.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}
