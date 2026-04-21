/**
 * PdfUploadView.jsx
 *
 * Hauptansicht "Externer Konsortialkredit". Drei Bereiche:
 *   1. Upload + Muster-Download (solange keine PDF verarbeitet ist)
 *   2. Tab "Extraktionsergebnis": Parser-Treffer gruppiert nach SAP-Maske
 *   3. Tab "Bilderanleitung SAP Complex Loans": Schritt-für-Schritt-Guide
 *      mit stilisierten SAP-Masken und Hervorhebung der Zielfelder
 */

import { useState } from 'react';
import { FileSearch, Loader2, AlertCircle, BookOpen } from 'lucide-react';
import DropZone from './DropZone';
import SummaryBar from './SummaryBar';
import ResultSection from './ResultSection';
import MissingKeysPanel from './MissingKeysPanel';
import RawTextPanel from './RawTextPanel';
import TemplateDownloadCard from './TemplateDownloadCard';
import ViewTabs from './ViewTabs';
import SapGuidePanel from './guide/SapGuidePanel';
import usePdfUpload from './usePdfUpload';

export default function PdfUploadView() {
  const {
    status, file, rawText, numPages, hits, missingKeys, error, handleFile, reset,
  } = usePdfUpload();
  const [activeTab, setActiveTab] = useState('result');

  const uniqueMasks = new Set(hits.map((h) => h.mapping.maskId));

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-12">
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
            Lade einen Konsortialvertrag oder ein Term-Sheet hoch. Die KI extrahiert die
            zentralen Werte und zeigt, in welche Maske des Finanzierungsarbeitsplatzes
            von SAP S/4HANA Banking for Complex Loans sie jeweils eingetragen werden.
          </p>
        </div>
      </div>

      {/* Idle-State: Upload + Muster + Einstieg in die Anleitung */}
      {status === 'idle' && (
        <>
          <DropZone onFileSelected={handleFile} />
          <TemplateDownloadCard />

          {/* Einstieg in die Bilderanleitung auch ohne Upload verfügbar */}
          <button
            type="button"
            onClick={() => setActiveTab(activeTab === 'guide' ? 'result' : 'guide')}
            className="w-full flex items-center justify-between gap-3 px-5 py-4 bg-surface-card border border-border rounded-lg hover:bg-primary/5 transition-colors text-left"
          >
            <div className="flex items-center gap-3">
              <BookOpen size={18} className="text-primary" strokeWidth={1.5} />
              <div>
                <div className="text-sm font-headline font-semibold text-text-primary">
                  {activeTab === 'guide' ? 'Bilderanleitung ausblenden' : 'Bilderanleitung anzeigen'}
                </div>
                <p className="text-xs text-text-muted font-body">
                  Schritt-für-Schritt: Konsortialkredit im Finanzierungsarbeitsplatz von
                  SAP Complex Loans erfassen – Partner, Finanzierung, Syndizierung,
                  Konditionen, Ziehung, Referenzen, Covenants.
                </p>
              </div>
            </div>
          </button>

          {activeTab === 'guide' && <SapGuidePanel parserHits={[]} />}
        </>
      )}

      {/* Parsing */}
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

      {/* Fehler */}
      {status === 'error' && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
          <AlertCircle size={18} className="text-danger mt-0.5 shrink-0" />
          <div className="flex-1">
            <div className="text-sm font-semibold text-danger">
              PDF konnte nicht analysiert werden
            </div>
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

      {/* Ergebnis mit Tab-Umschalter */}
      {status === 'done' && (
        <>
          <SummaryBar
            fileName={file?.name}
            numHits={hits.length}
            numMasks={uniqueMasks.size}
            onReset={reset}
          />

          <ViewTabs activeTab={activeTab} onChange={setActiveTab} />

          {activeTab === 'result' && (
            <>
              <ResultSection hits={hits} />
              <MissingKeysPanel missingKeys={missingKeys} />
              <RawTextPanel numPages={numPages} text={rawText} />
            </>
          )}

          {activeTab === 'guide' && <SapGuidePanel parserHits={hits} />}
        </>
      )}
    </div>
  );
}
