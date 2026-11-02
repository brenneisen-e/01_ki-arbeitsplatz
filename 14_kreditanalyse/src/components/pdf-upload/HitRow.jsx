/**
 * HitRow.jsx
 *
 * Zeile in der Ergebnistabelle. Spaltenlayout (12 Cols):
 *   - 4: Erkanntes Feld + Originalzitat
 *   - 2: Wert + Copy
 *   - 3: SAP-Ziel (Maske + Registerkarte + Feld)
 *   - 2: Mini-Thumbnail der SAP-Maske (klickbar zum Aufklappen)
 *   - 1: Konfidenz
 *
 * Beim Klick auf das Thumbnail klappt darunter die vollständige
 * stilisierte SAP-Maske auf (SapMaskMockup) inkl. Verweis auf das
 * SAP-Handbuch.
 */

import { Copy, Check, BookOpen } from 'lucide-react';
import { useState } from 'react';
import { formatHitValue, confidenceLabel, confidenceClass } from './formatHit';
import MiniMaskThumbnail from './MiniMaskThumbnail';
import SapMaskMockup from './guide/SapMaskMockup';
import { findGuideStepForKey } from '../../data/sapGuideSteps';

export default function HitRow({ hit }) {
  const [copied, setCopied] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const formatted = formatHitValue(hit);
  const step = findGuideStepForKey(hit.key);

  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText(formatted);
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    } catch {
      /* clipboard nicht verfügbar - ignorieren */
    }
  };

  return (
    <div className="border-b border-border last:border-b-0">
      <div className="grid grid-cols-12 gap-3 py-3 px-4 hover:bg-primary/5 transition-colors items-start">
        {/* Feld + Rohzitat */}
        <div className="col-span-4">
          <div className="text-xs font-semibold font-headline text-text-primary">
            {hit.mapping.label}
          </div>
          <div
            className="text-[11px] text-text-muted font-body mt-0.5 line-clamp-2"
            title={hit.raw}
          >
            &laquo;{hit.raw}&raquo;
          </div>
        </div>

        {/* Wert */}
        <div className="col-span-2 flex items-center gap-1.5">
          <span className="text-sm font-mono text-text-primary break-words">{formatted}</span>
          <button
            type="button"
            onClick={onCopy}
            title="In Zwischenablage kopieren"
            className="shrink-0 p-1 rounded hover:bg-primary/10 text-text-muted hover:text-primary transition-colors"
          >
            {copied ? <Check size={12} /> : <Copy size={12} />}
          </button>
        </div>

        {/* SAP-Ziel-Maske */}
        <div className="col-span-3">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-primary font-body flex-wrap">
            <span>{hit.mapping.maskLabel}</span>
            {hit.mapping.transaction && (
              <span className="inline-flex items-center px-1.5 py-0.5 rounded bg-primary/10 text-primary text-[10px] font-mono border border-primary/20">
                {hit.mapping.transaction}
              </span>
            )}
          </div>
          <div className="text-[11px] text-text-muted font-body mt-0.5">
            {hit.mapping.section && (
              <>
                <span className="text-text-primary">{hit.mapping.section}</span> ·{' '}
              </>
            )}
            Feld: <span className="text-text-primary">{hit.mapping.field}</span>
          </div>
        </div>

        {/* Vorschau-Thumbnail */}
        <div className="col-span-2 flex items-center justify-start">
          {step ? (
            <MiniMaskThumbnail
              step={step}
              active={expanded}
              onClick={() => setExpanded((v) => !v)}
            />
          ) : (
            <span className="text-[11px] text-text-muted font-body italic">keine Vorschau</span>
          )}
        </div>

        {/* Konfidenz */}
        <div className="col-span-1 flex items-center justify-end">
          <span
            className={
              'inline-flex items-center px-1.5 py-0.5 rounded border text-[10px] font-body ' +
              confidenceClass(hit.confidence)
            }
            title={`Konfidenz: ${confidenceLabel(hit.confidence)}`}
          >
            {confidenceLabel(hit.confidence)}
          </span>
        </div>
      </div>

      {/* Aufgeklappte SAP-Masken-Vorschau */}
      {expanded && step && (
        <div className="px-4 pb-4 pt-1 bg-slate-50/40 border-t border-border">
          <div className="flex items-start gap-2 mb-2 text-[11px] text-text-secondary font-body">
            <BookOpen size={11} strokeWidth={1.5} className="text-text-muted mt-0.5" />
            <span>
              <span className="font-semibold text-text-primary">{step.title}</span> ·
              SAP-Handbuch: {step.handbuchRef}
            </span>
          </div>
          <SapMaskMockup
            title={step.tabTitle}
            breadcrumb={step.breadcrumb}
            tabs={step.tabs}
            fields={step.fields}
            highlightedNote={step.highlightedNote}
          />
        </div>
      )}
    </div>
  );
}
