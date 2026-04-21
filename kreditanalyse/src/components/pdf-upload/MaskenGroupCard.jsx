/**
 * MaskenGroupCard.jsx
 *
 * Gruppiert alle Treffer einer Ziel-Maske in SAP Complex Loans
 * (z.B. alle Werte, die in Transaktion FN1V einzutragen sind) in einer
 * gemeinsamen Karte.
 */

import { useState, useMemo } from 'react';
import { ChevronDown, ChevronUp, Database } from 'lucide-react';
import HitRow from './HitRow';

export default function MaskenGroupCard({ maskId, maskLabel, hits, defaultOpen = true }) {
  const [open, setOpen] = useState(defaultOpen);

  const transaction = useMemo(() => {
    const t = hits.find((h) => h.mapping.transaction)?.mapping.transaction;
    return t || null;
  }, [hits]);

  if (!hits || hits.length === 0) return null;

  return (
    <div className="bg-surface-card border border-border rounded-lg overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 px-5 py-3.5 border-b border-border bg-gray-50/60">
        <div className="flex items-center gap-3 min-w-0">
          <div className="flex items-center justify-center w-8 h-8 rounded-md bg-primary/10 text-primary shrink-0">
            <Database size={16} strokeWidth={1.5} />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-sm font-headline font-semibold text-text-primary tracking-wide">
                {maskLabel}
              </h3>
              {transaction && (
                <span className="inline-flex items-center px-2 py-0.5 rounded bg-primary/10 text-primary text-[11px] font-mono border border-primary/20">
                  Transaktion {transaction}
                </span>
              )}
            </div>
            <p className="text-[11px] text-text-muted font-body mt-0.5">
              {hits.length} Wert{hits.length === 1 ? '' : 'e'} aus dieser PDF werden in dieser SAP-Maske erfasst.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="p-1.5 text-text-muted hover:text-text-primary hover:bg-gray-100 rounded-md transition-colors shrink-0"
          title={open ? 'Einklappen' : 'Ausklappen'}
        >
          {open ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>
      </div>

      {/* Spaltenkopf + Zeilen */}
      {open && (
        <>
          <div className="grid grid-cols-12 gap-3 py-2 px-4 text-[10px] uppercase tracking-wider font-semibold text-text-muted font-body border-b border-border bg-gray-50/30">
            <div className="col-span-4">Erkanntes Feld</div>
            <div className="col-span-3">Wert aus PDF</div>
            <div className="col-span-4">Ziel in SAP Complex Loans</div>
            <div className="col-span-1 text-right">Konfidenz</div>
          </div>

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
