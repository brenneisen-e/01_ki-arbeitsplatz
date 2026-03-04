/**
 * StatusBadge – Displays a workflow or document status as a colored pill badge.
 *
 * Props:
 *   status  (string)       – machine-readable status key
 *   size    ('sm' | 'md')  – badge size (default 'sm')
 */

const statusMap = {
  // Workflow stages
  antrag_eingegangen: { label: 'Eingegangen',    bg: 'bg-blue-100',   text: 'text-blue-700' },
  eingegangen:        { label: 'Eingegangen',    bg: 'bg-blue-100',   text: 'text-blue-700' },
  kyc:                { label: 'KYC ausstehend', bg: 'bg-amber-100',  text: 'text-amber-700' },
  kyc_ausstehend:     { label: 'KYC ausstehend', bg: 'bg-amber-100',  text: 'text-amber-700' },
  analysis:           { label: '§18 Prüfung',    bg: 'bg-indigo-100', text: 'text-indigo-700' },
  pruefung:           { label: '§18 Prüfung',    bg: 'bg-indigo-100', text: 'text-indigo-700' },
  rating:             { label: 'Rating',          bg: 'bg-purple-100', text: 'text-purple-700' },
  collateral:         { label: 'Sicherheiten',   bg: 'bg-cyan-100',   text: 'text-cyan-700' },
  sicherheiten:       { label: 'Sicherheiten',   bg: 'bg-cyan-100',   text: 'text-cyan-700' },
  voting:             { label: 'Votierung',       bg: 'bg-orange-100', text: 'text-orange-700' },
  votierung:          { label: 'Votierung',       bg: 'bg-orange-100', text: 'text-orange-700' },
  decision:           { label: 'Entscheidung',   bg: 'bg-blue-100',   text: 'text-blue-700' },
  entscheidung:       { label: 'Entscheidung',   bg: 'bg-blue-100',   text: 'text-blue-700' },
  approved:           { label: 'Genehmigt',      bg: 'bg-green-100',  text: 'text-green-700' },
  genehmigt:          { label: 'Genehmigt',      bg: 'bg-green-100',  text: 'text-green-700' },
  rejected:           { label: 'Abgelehnt',      bg: 'bg-red-100',    text: 'text-red-700' },
  abgelehnt:          { label: 'Abgelehnt',      bg: 'bg-red-100',    text: 'text-red-700' },

  // Document-level statuses
  offen:              { label: 'Offen',           bg: 'bg-gray-100',   text: 'text-gray-700' },
  eingereicht:        { label: 'Eingereicht',     bg: 'bg-blue-100',   text: 'text-blue-700' },
  geprueft:           { label: 'Geprüft',         bg: 'bg-green-100',  text: 'text-green-700' },
  mangel:             { label: 'Mangel',           bg: 'bg-red-100',    text: 'text-red-700' },
};

export default function StatusBadge({ status, size = 'sm' }) {
  const config = statusMap[status] || {
    label: status,
    bg: 'bg-gray-100',
    text: 'text-gray-700',
  };

  const sizeClasses =
    size === 'sm'
      ? 'px-2 py-0.5 text-xs'
      : 'px-3 py-1 text-sm';

  return (
    <span
      className={`inline-flex items-center rounded-full font-body font-medium whitespace-nowrap ${sizeClasses} ${config.bg} ${config.text}`}
    >
      {config.label}
    </span>
  );
}
