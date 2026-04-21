/**
 * PdfUploadView.jsx
 *
 * Hauptansicht: "Externen Konsortialkredit hochladen".
 *
 * Fluss:
 *   1. DropZone -> Datei auswählen
 *   2. Spinner während Parsing
 *   3. SummaryBar + nach Masken gruppierte Ergebnisse
 *   4. MissingKeysPanel (was muss manuell ergänzt werden)
 *   5. RawTextPanel (aufklappbare Rohtext-Vorschau)
 */

import { FileSearch, Loader2, AlertCircle } from 'lucide-react';
import DropZone from './DropZone';
import SummaryBar from './SummaryBar';
import ResultSection from './ResultSection';
import MissingKeysPanel from './MissingKeysPanel';
import RawTextPanel from './RawTextPanel';
import usePdfUpload from './usePdfUpload';

export default function PdfUploadView() {
  const {
    status, file, rawText, numPages, hits, missingKeys, error, handleFile, reset,
  } = usePdfUpload();

  const uniqueMasks = new Set(hits.map((h) => h.mapping.maskId));

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-12">
      {/* Page Header */}
      <div className="flex items-center gap-3">
        <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary text-white">
          <FileSearch size={20} strokeWidth={1.5} />
        </div>
        <div>
          <h2 className="text-lg font-headline font-semibold text-text-primary">
            Externer Konsortialkredit – PDF-Upload
          </h2>
          <p className="text-xs text-text-muted font-body">
            Lade einen Konsortialvertrag oder ein Term-Sheet hoch. Die KI extrahiert
            die zentralen Werte und zeigt dir, in welche Maske der Kreditanalyse sie
            jeweils eingetragen werden müssen.
          </p>
        </div>
      </div>

      {/* Schritt 1: Upload */}
      {status === 'idle' && (
        <DropZone onFileSelected={handleFile} />
      )}

      {/* Schritt 2: Parsing */}
      {status === 'parsing' && (
        <div className="bg-surface-card border border-border rounded-lg py-12 flex flex-col items-center justify-center gap-3">
          <Loader2 size={28} className="text-primary animate-spin" strokeWidth={1.5} />
          <div className="text-sm font-headline font-semibold text-text-primary">
            PDF wird analysiert …
          </div>
          <div className="text-xs text-text-muted font-body">
            {file?.name} – bitte einen Moment
          </div>
        </div>
      )}

      {/* Schritt 3: Fehler */}
      {status === 'error' && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
          <AlertCircle size={18} className="text-danger mt-0.5 shrink-0" />
          <div className="flex-1">
            <div className="text-sm font-semibold text-danger">PDF konnte nicht analysiert werden</div>
            <p className="text-xs text-red-700 mt-1 font-body">{error}</p>
            <button
              type="button"
              onClick={reset}
              className="mt-3 text-xs font-semibold text-primary hover:underline"
            >
              Erneut versuchen
            </button>
          </div>
        </div>
      )}

      {/* Schritt 4: Ergebnis */}
      {status === 'done' && (
        <>
          <SummaryBar
            fileName={file?.name}
            numHits={hits.length}
            numMasks={uniqueMasks.size}
            onReset={reset}
          />
          <ResultSection hits={hits} />
          <MissingKeysPanel missingKeys={missingKeys} />
          <RawTextPanel numPages={numPages} text={rawText} />
        </>
      )}
    </div>
  );
}
