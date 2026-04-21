/**
 * TemplateDownloadCard.jsx
 *
 * Showcase-Hilfe: Analyst kann einen fiktiven Muster-Konsortialkreditvertrag
 * als PDF herunterladen, um die PDF-Upload-Funktion direkt auszuprobieren.
 * Der Mustervertrag ist so aufgebaut, dass der Parser alle unterstützten
 * Felder erkennt.
 */

import { useState } from 'react';
import { Download, FileDown, Sparkles } from 'lucide-react';
import { generateKonsortialTemplatePdf } from '../../utils/generateTemplatePdf';

export default function TemplateDownloadCard() {
  const [generating, setGenerating] = useState(false);

  const onDownload = async () => {
    setGenerating(true);
    try {
      // In ein Microtask packen, damit der Spinner gerendert wird, bevor
      // jsPDF den Main-Thread kurz blockiert.
      await new Promise((r) => setTimeout(r, 0));
      generateKonsortialTemplatePdf();
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-lg p-4">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="flex items-start gap-3 min-w-0">
          <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-amber-100 text-amber-700 shrink-0">
            <Sparkles size={18} strokeWidth={1.5} />
          </div>
          <div className="min-w-0">
            <div className="text-sm font-headline font-semibold text-amber-900">
              Showcase: Mustervertrag herunterladen
            </div>
            <p className="text-xs text-amber-800/90 font-body mt-1 max-w-xl">
              Du hast gerade keinen echten Konsortialvertrag zur Hand? Lade hier einen
              fiktiven Muster-Konsortialkreditvertrag (15 Mio. EUR, Commerzbank AG als
              Konsortialführer, 60 Monate Laufzeit, Covenants, Sicherheiten) als PDF
              herunter und lade ihn anschließend hier wieder hoch, um die Extraktion
              live zu sehen. Struktur lehnt sich an marktübliche LMA-/BdB-Vorlagen an.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onDownload}
          disabled={generating}
          className="flex items-center gap-2 px-4 py-2 text-sm font-semibold bg-amber-600 text-white rounded-md hover:bg-amber-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed shrink-0"
        >
          {generating ? (
            <>
              <FileDown size={14} strokeWidth={1.5} className="animate-pulse" />
              Wird erzeugt …
            </>
          ) : (
            <>
              <Download size={14} strokeWidth={1.5} />
              Mustervertrag (PDF)
            </>
          )}
        </button>
      </div>
    </div>
  );
}
