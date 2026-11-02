/**
 * NeuerAntragDialog -- Rückfrage, wenn man aus einem laufenden Vorgang heraus
 * "Kreditantrag stellen" klickt: Der aktuelle Vorgang bleibt mit seinem Stand
 * in der Pipeline, der neue Antrag beginnt bei Schritt 1.
 */

import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { FilePlus2, Save, X } from 'lucide-react';

const STATUS_SCHRITT = {
  eingegangen: 'Schritt 1 · Antrag',
  kyc: 'Schritt 2 · KYC',
  analysis: 'Schritt 3 · §18 KWG',
  rating: 'Schritt 4 · Rating',
  collateral: 'Schritt 5 · Sicherheiten',
  'credit-proposal': 'Schritt 6 · Empfehlung',
  voting: 'Schritt 7 · Entscheidung',
  decision: 'Schritt 7 · Entscheidung',
  approved: 'genehmigt',
  rejected: 'abgelehnt',
  contract: 'Schritt 8 · Kreditvertrag',
  signature_pending: 'Schritt 9 · Unterschrift',
  active: 'Monitoring',
};

export default function NeuerAntragDialog({ company, onBestaetigen, onAbbrechen }) {
  useEffect(() => {
    const taste = (e) => { if (e.key === 'Escape') onAbbrechen(); };
    window.addEventListener('keydown', taste);
    return () => window.removeEventListener('keydown', taste);
  }, [onAbbrechen]);

  return createPortal(
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center p-4 backdrop-blur-sm bg-[rgba(28,26,23,0.45)]"
      onClick={onAbbrechen}
      role="dialog"
      aria-modal="true"
      aria-labelledby="neuer-antrag-titel"
    >
      <div className="surface-elevated rounded-2xl w-full max-w-lg p-6" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center shrink-0">
            <FilePlus2 size={20} strokeWidth={1.75} />
          </div>
          <div className="flex-1 min-w-0">
            <h2 id="neuer-antrag-titel" className="text-base font-medium text-text-primary">Neuen Kreditantrag starten?</h2>
            <p className="text-sm text-text-secondary mt-1">
              Du bearbeitest gerade einen laufenden Vorgang.
            </p>
          </div>
          <button type="button" onClick={onAbbrechen} className="p-1 rounded-md text-text-muted hover:text-text-primary hover:bg-surface-inset" title="Schließen">
            <X size={18} />
          </button>
        </div>

        <div className="mt-4 rounded-xl border border-border bg-surface px-4 py-3">
          <p className="text-sm font-medium text-text-primary truncate">{company.firma}</p>
          <p className="text-xs text-text-muted mt-0.5">
            <span className="font-mono">{company.id}</span>
            {STATUS_SCHRITT[company.status] && <> · {STATUS_SCHRITT[company.status]}</>}
          </p>
        </div>

        <p className="text-sm text-text-secondary mt-4">
          Der aktuelle Stand wird gespeichert und bleibt in der Pipeline auf dem Dashboard, dort kannst du jederzeit
          weitermachen. Der neue Antrag beginnt bei Schritt 1.
        </p>

        <div className="mt-6 flex flex-col-reverse sm:flex-row sm:justify-end gap-2">
          <button
            type="button"
            onClick={onAbbrechen}
            className="px-4 h-10 rounded-[10px] bg-surface-inset text-sm font-medium text-text-primary hover:bg-border transition-colors whitespace-nowrap"
          >
            Im Vorgang bleiben
          </button>
          <button
            type="button"
            onClick={onBestaetigen}
            autoFocus
            className="inline-flex items-center justify-center gap-2 px-4 h-10 rounded-[10px] bg-primary text-white text-sm font-medium hover:bg-primary-light transition-colors whitespace-nowrap"
          >
            <Save size={16} strokeWidth={1.75} />
            Speichern und neuen Antrag starten
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
