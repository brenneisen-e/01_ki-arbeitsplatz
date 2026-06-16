/**
 * KontoanlageView.jsx
 *
 * Demostrecke "Kreditvertrag -> Kreditkontoneuanlage":
 *   1. Upload eines Kreditvertrags (.docx/.pdf)
 *   2. Simulierte KI-Extraktion (Fortschrittsschritte)
 *   3. Ergebnis: erkannte Felder gemappt auf das Blatt "Allgemeine Angaben",
 *      mit Quelle/Konfidenz je Feld
 *   4. Download des ausgefüllten Excel-Blatts "Allgemeine Angaben"
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import {
  FileSpreadsheet, Loader2, AlertCircle, Download, RotateCcw,
  CheckCircle2, FileText, Sparkles,
} from 'lucide-react';
import KontoanlageDropZone from './KontoanlageDropZone';
import BeispielvertragDownload from './BeispielvertragDownload';
import {
  detectVertrag, ALLGEMEINE_ANGABEN_SECTIONS, FIELD_LABELS, KONFIDENZ_META,
  MAPPED_FIELD_KEYS,
} from '../../data/kontoanlageDemo';
import { generateAllgemeineAngabenXlsx } from '../../utils/generateAllgemeineAngabenXlsx';

const ANALYSE_SCHRITTE = [
  'Dokument wird gelesen …',
  'Vertragstyp wird erkannt …',
  'Klauseln und Konditionen werden extrahiert …',
  'Felder werden auf „Allgemeine Angaben" gemappt …',
  'Vorbelegung wird zusammengestellt …',
];

export default function KontoanlageView() {
  const [status, setStatus] = useState('idle'); // idle | analyzing | done
  const [file, setFile] = useState(null);
  const [dataset, setDataset] = useState(null);
  const [stepIdx, setStepIdx] = useState(0);
  const [generating, setGenerating] = useState(false);
  const timers = useRef([]);

  const clearTimers = () => { timers.current.forEach(clearTimeout); timers.current = []; };
  useEffect(() => () => clearTimers(), []);

  const handleFile = useCallback((selectedFile) => {
    if (!selectedFile) return;
    clearTimers();
    setFile(selectedFile);
    const ds = detectVertrag(selectedFile.name);
    setDataset(ds);
    setStatus('analyzing');
    setStepIdx(0);

    ANALYSE_SCHRITTE.forEach((_, i) => {
      const t = setTimeout(() => {
        setStepIdx(i);
        if (i === ANALYSE_SCHRITTE.length - 1) {
          const done = setTimeout(() => setStatus('done'), 650);
          timers.current.push(done);
        }
      }, i * 700);
      timers.current.push(t);
    });
  }, []);

  const reset = useCallback(() => {
    clearTimers();
    setStatus('idle');
    setFile(null);
    setDataset(null);
    setStepIdx(0);
  }, []);

  const onDownload = useCallback(async () => {
    if (!dataset) return;
    setGenerating(true);
    try {
      await generateAllgemeineAngabenXlsx(dataset);
    } catch (err) {
      console.error('Excel-Erzeugung fehlgeschlagen', err);
    } finally {
      setGenerating(false);
    }
  }, [dataset]);

  const erkannteFelder = dataset
    ? Object.values(dataset.felder).filter((field) => field.konfidenz !== 'manuell').length
    : 0;
  const gesamtFelder = dataset ? Object.keys(dataset.felder).length : 0;

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-12">
      {/* Page Header */}
      <div className="flex items-center gap-3">
        <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary text-white">
          <FileSpreadsheet size={20} strokeWidth={1.5} />
        </div>
        <div>
          <h2 className="text-lg font-headline font-semibold text-text-primary">
            Kreditvertrag → Kreditkontoneuanlage
          </h2>
          <p className="text-xs text-text-muted font-body">
            Lade einen Kreditvertrag (bilateral oder syndiziert) hoch. Die KI liest die
            wesentlichen Konditionen aus und befüllt damit das Blatt „Allgemeine Angaben"
            der Originalvorlage „Template Kreditkontoneuanlage" – zum Download als fertig
            vorbelegte Excel-Datei.
          </p>
        </div>
      </div>

      {/* Idle */}
      {status === 'idle' && (
        <>
          <KontoanlageDropZone onFileSelected={handleFile} />

          <BeispielvertragDownload />

          <div className="bg-surface-card border border-border rounded-lg p-5">
            <div className="flex items-start gap-3">
              <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-primary/10 text-primary shrink-0">
                <Sparkles size={16} strokeWidth={1.5} />
              </div>
              <div className="min-w-0">
                <div className="text-sm font-headline font-semibold text-text-primary">
                  So funktioniert die Strecke
                </div>
                <ol className="mt-2 space-y-1 text-xs text-text-secondary font-body list-decimal list-inside">
                  <li>Vertrag hochladen (z. B. den bilateralen oder den syndizierten Beispielvertrag).</li>
                  <li>Die KI erkennt Vertragstyp, Parteien, Beträge, Laufzeiten und Konditionen.</li>
                  <li>Die Werte werden in das Blatt „Allgemeine Angaben" der Originalvorlage übernommen.</li>
                  <li>Die befüllte Vorlage „Kreditkontoneuanlage" steht zum Download bereit.</li>
                </ol>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Analyzing */}
      {status === 'analyzing' && (
        <div className="bg-surface-card border border-border rounded-lg py-12 px-6 flex flex-col items-center justify-center gap-4">
          <Loader2 size={28} className="text-primary animate-spin" strokeWidth={1.5} />
          <div className="text-sm font-headline font-semibold text-text-primary">
            Kreditvertrag wird analysiert …
          </div>
          <div className="text-xs text-text-muted font-body flex items-center gap-1.5">
            <FileText size={12} strokeWidth={1.5} /> {file?.name}
          </div>
          <div className="w-full max-w-sm space-y-1.5 mt-2">
            {ANALYSE_SCHRITTE.map((schritt, i) => (
              <div
                key={i}
                className={
                  'flex items-center gap-2 text-xs font-body transition-colors ' +
                  (i <= stepIdx ? 'text-text-primary' : 'text-text-muted/50')
                }
              >
                {i < stepIdx ? (
                  <CheckCircle2 size={14} className="text-emerald-500 shrink-0" />
                ) : i === stepIdx ? (
                  <Loader2 size={14} className="text-primary animate-spin shrink-0" />
                ) : (
                  <div className="w-3.5 h-3.5 rounded-full border border-current shrink-0" />
                )}
                {schritt}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Done */}
      {status === 'done' && dataset && (
        <>
          {/* Summary */}
          <div className="bg-surface-card border border-border rounded-lg p-5 flex flex-wrap items-center gap-4 justify-between">
            <div className="flex items-start gap-3 min-w-0">
              <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 shrink-0">
                <CheckCircle2 size={20} strokeWidth={1.5} />
              </div>
              <div className="min-w-0">
                <div className="text-sm font-headline font-semibold text-text-primary truncate">
                  {dataset.vertragstyp}
                </div>
                <div className="text-xs text-text-muted font-body mt-0.5">
                  Kreditnehmer: <span className="text-text-secondary font-medium">{dataset.kreditnehmer}</span>
                  {file?.name ? <> · Quelle: {file.name}</> : null}
                </div>
                <div className="text-xs text-text-muted font-body mt-0.5">
                  {erkannteFelder} von {gesamtFelder} Feldern automatisch aus dem Vertrag belegt
                  {' · '}Konfidenz gesamt {Math.round((dataset.konfidenzGesamt || 0) * 100)} %
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={reset}
                className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-text-secondary border border-border rounded-md hover:bg-surface transition-colors"
              >
                <RotateCcw size={14} strokeWidth={1.5} /> Neuer Vertrag
              </button>
              <button
                type="button"
                onClick={onDownload}
                disabled={generating}
                className="flex items-center gap-2 px-4 py-2 text-sm font-semibold bg-primary text-white rounded-md hover:bg-primary-dark transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {generating ? (
                  <><Loader2 size={14} strokeWidth={1.5} className="animate-spin" /> Vorlage wird befüllt</>
                ) : (
                  <><Download size={14} strokeWidth={1.5} /> Vorlage „Kreditkontoneuanlage" befüllt herunterladen</>
                )}
              </button>
            </div>
          </div>

          {/* Legend */}
          <div className="flex flex-wrap items-center gap-3 text-[11px] font-body text-text-muted">
            <span className="font-semibold text-text-secondary">Konfidenz:</span>
            {Object.entries(KONFIDENZ_META).map(([key, meta]) => (
              <span key={key} className={`inline-flex items-center px-2 py-0.5 rounded-full border ${meta.cls}`}>
                {meta.label}
              </span>
            ))}
          </div>

          {/* Mapped fields */}
          <div className="space-y-4">
            {ALLGEMEINE_ANGABEN_SECTIONS.map((section) => (
              <div key={section.id} className="bg-surface-card border border-border rounded-lg overflow-hidden">
                <div className="px-4 py-2.5 bg-surface border-b border-border">
                  <h3 className="text-sm font-headline font-semibold text-text-primary">{section.title}</h3>
                </div>
                <div className="divide-y divide-border">
                  {section.fields.map((key) => {
                    const field = dataset.felder[key];
                    if (!field) return null;
                    const meta = KONFIDENZ_META[field.konfidenz] || KONFIDENZ_META.manuell;
                    return (
                      <div key={key} className="grid grid-cols-1 md:grid-cols-12 gap-1 md:gap-3 px-4 py-3">
                        <div className="md:col-span-3 text-xs font-medium text-text-secondary font-body">
                          {FIELD_LABELS[key] || key}
                          {MAPPED_FIELD_KEYS.has(key) ? (
                            <span className="ml-1.5 inline-flex items-center text-[9px] uppercase tracking-wide text-primary/70 font-semibold">
                              → Vorlage
                            </span>
                          ) : (
                            <span className="ml-1.5 inline-flex items-center text-[9px] uppercase tracking-wide text-text-muted/60 font-semibold">
                              nur Info
                            </span>
                          )}
                        </div>
                        <div className="md:col-span-4 text-sm text-text-primary font-body">
                          {field.wert}
                        </div>
                        <div className="md:col-span-5 flex items-start gap-2">
                          <span className={`mt-0.5 inline-flex items-center px-2 py-0.5 rounded-full border text-[10px] font-medium shrink-0 ${meta.cls}`}>
                            {meta.label}
                          </span>
                          <span className="text-[11px] text-text-muted font-body leading-snug">
                            {field.quelle}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          <p className="text-[11px] text-text-muted font-body">
            Der Download befüllt das Blatt „Allgemeine Angaben" der Originalvorlage
            „Template Kreditkontoneuanlage" und gibt sie als makrofähige .xlsm aus –
            alle weiteren Blätter, Beschriftungen, Listen und VBA-Makros bleiben erhalten.
            Mit „→ Vorlage" markierte Felder werden eingetragen, „nur Info"-Felder dienen
            der Übersicht. Mit „Kundenstamm / prüfen" markierte Werte sind fachlich zu bestätigen.
          </p>
        </>
      )}
    </div>
  );
}
