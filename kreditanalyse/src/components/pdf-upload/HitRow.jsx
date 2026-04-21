/**
 * HitRow.jsx
 *
 * Eine Zeile in der Ergebnistabelle. Zeigt für ein extrahiertes Feld:
 *   - Label + Quelle (Originaltext)
 *   - Extrahierten Wert (formatiert) + Copy-Button
 *   - Ziel-Maske in SAP Complex Loans (Transaktion, Registerkarte, Feld)
 *   - Konfidenz-Badge
 */

import { Copy, Check } from 'lucide-react';
import { useState } from 'react';
import { formatHitValue, confidenceLabel, confidenceClass } from './formatHit';

export default function HitRow({ hit }) {
  const [copied, setCopied] = useState(false);
  const formatted = formatHitValue(hit);

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
    <div className="grid grid-cols-12 gap-3 py-3 px-4 border-b border-border last:border-b-0 hover:bg-primary/5 transition-colors">
      {/* Feld + Rohzitat */}
      <div className="col-span-4">
        <div className="text-xs font-semibold font-headline text-text-primary">
          {hit.mapping.label}
        </div>
        <div className="text-[11px] text-text-muted font-body mt-0.5 line-clamp-2" title={hit.raw}>
          &laquo;{hit.raw}&raquo;
        </div>
      </div>

      {/* Wert */}
      <div className="col-span-3 flex items-center gap-2">
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
      <div className="col-span-4">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-primary font-body flex-wrap">
          <span>{hit.mapping.maskLabel}</span>
          {hit.mapping.transaction && (
            <span className="inline-flex items-center px-1.5 py-0.5 rounded bg-primary/10 text-primary text-[10px] font-mono border border-primary/20">
              TA {hit.mapping.transaction}
            </span>
          )}
        </div>
        <div className="text-[11px] text-text-muted font-body mt-0.5">
          {hit.mapping.section && (
            <>Reg.: <span className="text-text-primary">{hit.mapping.section}</span> · </>
          )}
          Feld: <span className="text-text-primary">{hit.mapping.field}</span>
        </div>
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
  );
}
