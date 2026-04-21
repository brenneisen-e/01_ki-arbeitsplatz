/**
 * TemplateDownloadCard.jsx
 *
 * Ermöglicht den Download eines fiktiven Muster-Konsortialkreditvertrags,
 * um die PDF-Extraktions-Pipeline ohne echtes Vertragsdokument zu
 * verifizieren. Struktur und Klauseln orientieren sich an marktüblichen
 * Mustern (LMA Recommended Form of Facility Agreement, BdB-Musterklauseln
 * zu Konsortialkrediten).
 */

import { useState } from 'react';
import { Download, FileDown, FileText } from 'lucide-react';
import { generateKonsortialTemplatePdf } from '../../utils/generateTemplatePdf';

export default function TemplateDownloadCard() {
  const [generating, setGenerating] = useState(false);

  const onDownload = async () => {
    setGenerating(true);
    try {
      await new Promise((r) => setTimeout(r, 0));
      generateKonsortialTemplatePdf();
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="bg-surface-card border border-border rounded-lg p-5">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="flex items-start gap-3 min-w-0">
          <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10 text-primary shrink-0">
            <FileText size={18} strokeWidth={1.5} />
          </div>
          <div className="min-w-0">
            <div className="text-sm font-headline font-semibold text-text-primary">
              Muster-Konsortialkreditvertrag zur Verifikation
            </div>
            <p className="text-xs text-text-secondary font-body mt-1 max-w-2xl leading-relaxed">
              Für Testzwecke steht ein anonymisierter Muster-Konsortialkreditvertrag zur
              Verfügung. Inhalt und Klauselaufbau folgen den gängigen Marktstandards
              (LMA Recommended Form of Facility Agreement sowie Musterklauseln des
              Bundesverbands deutscher Banken). Der Vertrag dient ausschließlich zur
              Validierung der PDF-Extraktion und enthält keine produktiven Daten.
            </p>
            <p className="text-[11px] text-text-muted font-body mt-2">
              Format: PDF · Umfang: ca. 3 Seiten · alle relevanten Felder (Kreditbetrag,
              Zinskonditionen, Laufzeit, Sicherheiten, Financial Covenants) sind enthalten.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onDownload}
          disabled={generating}
          className="flex items-center gap-2 px-4 py-2 text-sm font-semibold bg-primary text-white rounded-md hover:bg-primary-dark transition-colors disabled:opacity-60 disabled:cursor-not-allowed shrink-0"
        >
          {generating ? (
            <>
              <FileDown size={14} strokeWidth={1.5} className="animate-pulse" />
              Wird erzeugt
            </>
          ) : (
            <>
              <Download size={14} strokeWidth={1.5} />
              Muster herunterladen
            </>
          )}
        </button>
      </div>
    </div>
  );
}
