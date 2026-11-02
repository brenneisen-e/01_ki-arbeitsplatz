/**
 * StatusBadge – Displays a workflow or document status as a colored pill badge.
 *
 * Props:
 *   status  (string)       – machine-readable status key
 *   size    ('sm' | 'md')  – badge size (default 'sm')
 */

// Prozessstufen tragen ihre Kategoriefarbe nur als Punkt (wie die Spalten
// der Pipeline); Farbe als Fläche gibt es nur für Ergebnisse.
const statusMap = {
  // Workflow stages
  antrag_eingegangen: { label: 'Eingegangen',    punkt: 'bg-blue-500' },
  eingegangen:        { label: 'Eingegangen',    punkt: 'bg-blue-500' },
  kyc:                { label: 'KYC ausstehend', punkt: 'bg-amber-500' },
  kyc_ausstehend:     { label: 'KYC ausstehend', punkt: 'bg-amber-500' },
  analysis:           { label: '§18 Prüfung',    punkt: 'bg-indigo-500' },
  pruefung:           { label: '§18 Prüfung',    punkt: 'bg-indigo-500' },
  rating:             { label: 'Rating',         punkt: 'bg-purple-500' },
  collateral:         { label: 'Sicherheiten',   punkt: 'bg-cyan-500' },
  sicherheiten:       { label: 'Sicherheiten',   punkt: 'bg-cyan-500' },
  'credit-proposal':  { label: 'Kreditempfehlung', punkt: 'bg-teal-500' },
  voting:             { label: 'Votierung',      punkt: 'bg-orange-500' },
  votierung:          { label: 'Votierung',      punkt: 'bg-orange-500' },
  decision:           { label: 'Entscheidung',   punkt: 'bg-blue-500' },
  entscheidung:       { label: 'Entscheidung',   punkt: 'bg-blue-500' },
  approved:           { label: 'Genehmigt',      ton: 'erfolg' },
  genehmigt:          { label: 'Genehmigt',      ton: 'erfolg' },
  rejected:           { label: 'Abgelehnt',      ton: 'gefahr' },
  abgelehnt:          { label: 'Abgelehnt',      ton: 'gefahr' },

  // Document-level statuses
  offen:              { label: 'Offen',          punkt: 'bg-slate-400' },
  eingereicht:        { label: 'Eingereicht',    punkt: 'bg-blue-500' },
  geprueft:           { label: 'Geprüft',        ton: 'erfolg' },
  mangel:             { label: 'Mangel',         ton: 'gefahr' },
};

const TON = {
  erfolg: 'bg-[var(--tint-success)] text-emerald-700',
  gefahr: 'bg-[var(--tint-danger)] text-red-700',
};

export default function StatusBadge({ status, size = 'sm' }) {
  const config = statusMap[status] || { label: status, punkt: 'bg-slate-400' };

  const sizeClasses =
    size === 'sm'
      ? 'px-2 py-0.5 text-xs'
      : 'px-3 py-1 text-sm';

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full font-body font-medium whitespace-nowrap ${sizeClasses} ${
        config.ton ? TON[config.ton] : 'bg-surface-inset text-text-secondary'
      }`}
    >
      {config.punkt && <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${config.punkt}`} aria-hidden="true" />}
      {config.label}
    </span>
  );
}
