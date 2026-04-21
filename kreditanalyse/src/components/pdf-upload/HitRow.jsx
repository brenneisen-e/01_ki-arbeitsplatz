/**
 * HitRow.jsx
 *
 * Eine Zeile in der Ergebnistabelle. Zeigt für ein extrahiertes Feld:
 *   - Label + Quelle (Originaltext)
 *   - Extrahierten Wert (formatiert)
 *   - Ziel-Maske + Abschnitt + konkretes Feld
 *   - "Zur Maske springen"-Button
 *   - Konfidenz-Badge
 */

import { ArrowRight, Copy, Check } from 'lucide-react';
import { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { formatHitValue, confidenceLabel, confidenceClass } from './formatHit';

export default function HitRow({ hit }) {
  const { navigate } = useApp();
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

      {/* Ziel-Maske */}
      <div className="col-span-4">
        <div className="text-xs font-semibold text-primary font-body">
          {hit.mapping.maskLabel}
          {hit.mapping.section ? (
            <span className="text-text-muted font-normal"> &rsaquo; {hit.mapping.section}</span>
          ) : null}
        </div>
        <div className="text-[11px] text-text-muted font-body mt-0.5">
          Feld: <span className="text-text-primary">{hit.mapping.field}</span>
        </div>
      </div>

      {/* Konfidenz + Sprung-Button */}
      <div className="col-span-1 flex items-center justify-end gap-1">
        <span
          className={
            'inline-flex items-center px-1.5 py-0.5 rounded border text-[10px] font-body ' +
            confidenceClass(hit.confidence)
          }
          title={`Konfidenz: ${confidenceLabel(hit.confidence)}`}
        >
          {confidenceLabel(hit.confidence)}
        </span>
        <button
          type="button"
          onClick={() => navigate(hit.mapping.maskId)}
          className="p-1 rounded text-primary hover:bg-primary/10 transition-colors"
          title={`Zu Maske ${hit.mapping.maskLabel} springen`}
        >
          <ArrowRight size={14} />
        </button>
      </div>
    </div>
  );
}
