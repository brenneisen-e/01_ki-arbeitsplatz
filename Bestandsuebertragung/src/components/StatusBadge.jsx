import { STATUS_ICONS, STATUS_LABELS } from '../utils/constants'

const badgeClasses = {
  'unvollstaendig': 'bg-yellow-100 text-yellow-800',
  'zu-validieren': 'bg-blue-100 text-blue-800',
  'export-bereit': 'bg-green-100 text-green-800',
  'abgeschlossen': 'bg-emerald-100 text-emerald-800',
  'abgelehnt': 'bg-red-100 text-red-800',
  'wiedervorlage': 'bg-gray-100 text-gray-700'
}

export default function StatusBadge({ status, showLabel = true }) {
  const icon = STATUS_ICONS[status] || '○'
  const label = STATUS_LABELS[status] || status
  const cls = badgeClasses[status] || 'bg-gray-100 text-gray-600'

  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${cls}`}>
      <span>{icon}</span>
      {showLabel && <span>{label}</span>}
    </span>
  )
}
