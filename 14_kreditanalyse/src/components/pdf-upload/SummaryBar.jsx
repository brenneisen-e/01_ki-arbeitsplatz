/**
 * SummaryBar.jsx
 *
 * Zeigt oberhalb der Ergebnisliste eine Zusammenfassung:
 *   - Dateiname
 *   - Anzahl erkannte Felder
 *   - Anzahl betroffene Masken
 *   - Button: "Neue PDF laden"
 */

import { RefreshCw, FileCheck, Layers } from 'lucide-react';

export default function SummaryBar({ fileName, numHits, numMasks, onReset }) {
  return (
    <div className="bg-surface-card border border-border rounded-xl px-5 py-4">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-4 min-w-0">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-[var(--mode-pastel)] text-primary shrink-0">
            <FileCheck size={20} strokeWidth={1.5} />
          </div>
          <div className="min-w-0">
            <div className="text-sm font-headline font-semibold text-text-primary truncate">
              {fileName || 'PDF analysiert'}
            </div>
            <div className="text-xs text-text-muted font-body flex items-center gap-4 mt-0.5">
              <span>
                <span className="font-semibold text-text-primary">{numHits}</span> Feld
                {numHits === 1 ? '' : 'er'} erkannt
              </span>
              <span className="flex items-center gap-1">
                <Layers size={11} strokeWidth={1.5} />
                <span className="font-semibold text-text-primary">{numMasks}</span> Maske
                {numMasks === 1 ? '' : 'n'} betroffen
              </span>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={onReset}
          className="flex items-center gap-2 px-3 py-2 text-xs font-semibold text-text-secondary hover:text-primary hover:bg-white/60 rounded-md border border-border transition-colors"
        >
          <RefreshCw size={12} strokeWidth={1.5} />
          Andere PDF laden
        </button>
      </div>
    </div>
  );
}
