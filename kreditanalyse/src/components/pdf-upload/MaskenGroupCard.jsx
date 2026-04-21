/**
 * MaskenGroupCard.jsx
 *
 * Gruppiert alle Treffer einer Ziel-Maske (z.B. alle Felder, die in die
 * Kreditantrag-Maske gehören) in einer gemeinsamen Karte. So sieht der
 * Analyst auf einen Blick: "In Maske Kreditantrag gehören 7 Werte".
 */

import { useState } from 'react';
import { ChevronDown, ChevronUp, ExternalLink, ClipboardList } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import HitRow from './HitRow';

const ICON_BY_MASK = {
  application: 'Kreditantrag',
  collateral: 'Sicherheiten',
  contract: 'Kreditvertrag',
  analysis: '§18 KWG Prüfung',
};

export default function MaskenGroupCard({ maskId, maskLabel, hits, defaultOpen = true }) {
  const { navigate } = useApp();
  const [open, setOpen] = useState(defaultOpen);

  if (!hits || hits.length === 0) return null;

  return (
    <div className="bg-surface-card border border-border rounded-lg overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 px-5 py-3.5 border-b border-border bg-gray-50/60">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-8 h-8 rounded-md bg-primary/10 text-primary">
            <ClipboardList size={16} strokeWidth={1.5} />
          </div>
          <div>
            <h3 className="text-sm font-headline font-semibold text-text-primary tracking-wide">
              Maske: {maskLabel}
            </h3>
            <p className="text-[11px] text-text-muted font-body">
              {hits.length} Wert{hits.length === 1 ? '' : 'e'} dieser PDF gehört in diese Maske.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => navigate(maskId)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-primary hover:bg-primary/10 rounded-md transition-colors"
          >
            <ExternalLink size={12} strokeWidth={1.5} />
            Maske öffnen
          </button>
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="p-1.5 text-text-muted hover:text-text-primary hover:bg-gray-100 rounded-md transition-colors"
            title={open ? 'Einklappen' : 'Ausklappen'}
          >
            {open ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
        </div>
      </div>

      {/* Spaltenkopf */}
      {open && (
        <>
          <div className="grid grid-cols-12 gap-3 py-2 px-4 text-[10px] uppercase tracking-wider font-semibold text-text-muted font-body border-b border-border bg-gray-50/30">
            <div className="col-span-4">Erkanntes Feld</div>
            <div className="col-span-3">Wert aus PDF</div>
            <div className="col-span-4">Ziel in der Maske</div>
            <div className="col-span-1 text-right">Aktion</div>
          </div>

          {/* Zeilen */}
          <div>
            {hits.map((hit) => (
              <HitRow key={hit.key} hit={hit} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export { ICON_BY_MASK };
