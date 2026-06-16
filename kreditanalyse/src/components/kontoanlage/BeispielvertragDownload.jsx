/**
 * BeispielvertragDownload.jsx
 *
 * Stellt die beiden Muster-Kreditverträge (bilateral und syndiziert) als
 * .docx zum Download bereit, damit man die Demostrecke „Kreditvertrag ->
 * Kreditkontoneuanlage" ohne eigenes Dokument ausprobieren kann: Vorlage
 * herunterladen, anschließend oben wieder hochladen.
 *
 * Die Dateien sind als App-Assets gebündelt (?url) und werden per file-saver
 * unter ihrem ursprünglichen Namen gespeichert – die Namen passen zur
 * Vertragserkennung in `detectVertrag` (kontoanlageDemo.js).
 */

import { useState } from 'react';
import { Download, FileText, Loader2 } from 'lucide-react';
import { saveAs } from 'file-saver';
import bilateralUrl from '../../assets/vertrag-bilateral-muster.docx?url';
import syndiziertUrl from '../../assets/vertrag-syndiziert-muster.docx?url';

const DOCX_MIME =
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document';

const VORLAGEN = [
  {
    id: 'bilateral',
    url: bilateralUrl,
    dateiname: 'Helaba_Bilateraler_Kreditvertrag_Muster.docx',
    titel: 'Bilateraler Kreditvertrag (Muster)',
    beschreibung:
      'Kreditnehmer MainRiver Industrials GmbH · EUR 25 Mio. · Festzins 4,35 % p.a. · LMA-orientiertes Einzelinstitut-Muster.',
  },
  {
    id: 'syndiziert',
    url: syndiziertUrl,
    dateiname: 'Beispiel_Syndizierter Kreditvertrag_Helaba AI Cases.docx',
    titel: 'Syndizierter Konsortialkreditvertrag (Muster)',
    beschreibung:
      'Kreditnehmer Vantiv, LLC · mehrteilige USD-Fazilität (Term Loan + Revolving) · Administrative Agent JPMorgan.',
  },
];

export default function BeispielvertragDownload() {
  const [busyId, setBusyId] = useState(null);

  const onDownload = async (vorlage) => {
    setBusyId(vorlage.id);
    try {
      const res = await fetch(vorlage.url);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const blob = await res.blob();
      saveAs(new Blob([blob], { type: DOCX_MIME }), vorlage.dateiname);
    } catch (err) {
      console.error('Vorlage konnte nicht heruntergeladen werden', err);
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="bg-surface-card border border-border rounded-lg p-5">
      <div className="flex items-start gap-3">
        <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-primary/10 text-primary shrink-0">
          <FileText size={16} strokeWidth={1.5} />
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-sm font-headline font-semibold text-text-primary">
            Muster-Kreditverträge zum Ausprobieren
          </div>
          <p className="text-xs text-text-secondary font-body mt-1 max-w-2xl leading-relaxed">
            Kein eigenes Dokument zur Hand? Lade einen der beiden anonymisierten
            Muster-Kreditverträge als .docx herunter und ziehe ihn anschließend oben
            in den Upload-Bereich. Beide Verträge enthalten ausschließlich fiktive
            Demo-Daten.
          </p>

          <div className="mt-4 space-y-2.5">
            {VORLAGEN.map((vorlage) => {
              const busy = busyId === vorlage.id;
              return (
                <div
                  key={vorlage.id}
                  className="flex items-start justify-between gap-4 flex-wrap rounded-md border border-border bg-surface px-3 py-3"
                >
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-medium text-text-primary font-body">
                      {vorlage.titel}
                    </div>
                    <p className="text-[11px] text-text-muted font-body mt-0.5 leading-relaxed">
                      {vorlage.beschreibung}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => onDownload(vorlage)}
                    disabled={busy}
                    className="flex items-center gap-2 px-3 py-2 text-xs font-semibold bg-primary text-white rounded-md hover:bg-primary-dark transition-colors disabled:opacity-60 disabled:cursor-not-allowed shrink-0"
                  >
                    {busy ? (
                      <>
                        <Loader2 size={14} strokeWidth={1.5} className="animate-spin" />
                        Wird geladen
                      </>
                    ) : (
                      <>
                        <Download size={14} strokeWidth={1.5} />
                        .docx herunterladen
                      </>
                    )}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
