/**
 * RawTextPanel.jsx
 *
 * Aufklappbare Vorschau des aus der PDF extrahierten Rohtexts. Nützlich,
 * damit der Analyst überprüfen kann, was der Parser gesehen hat.
 */

import { useState } from 'react';
import { ChevronDown, ChevronUp, FileText } from 'lucide-react';

export default function RawTextPanel({ numPages, text }) {
  const [open, setOpen] = useState(false);
  if (!text) return null;

  return (
    <div className="bg-surface-card border border-border rounded-xl">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between gap-3 px-5 py-3 text-left hover:bg-primary/5 transition-colors"
      >
        <div className="flex items-center gap-3">
          <FileText size={16} className="text-text-muted" strokeWidth={1.5} />
          <div>
            <div className="text-sm font-headline font-semibold text-text-primary">
              Extrahierter Rohtext
            </div>
            <div className="text-[11px] text-text-muted font-body">
              {numPages} Seite{numPages === 1 ? '' : 'n'} &middot; {text.length.toLocaleString('de-DE')} Zeichen
            </div>
          </div>
        </div>
        {open ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
      </button>

      {open && (
        <div className="px-5 pb-5">
          <pre className="mt-2 p-4 bg-gray-50 border border-border rounded text-[11px] font-mono text-text-primary max-h-96 overflow-auto whitespace-pre-wrap break-words">
            {text}
          </pre>
        </div>
      )}
    </div>
  );
}
