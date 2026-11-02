/**
 * RatingBadge – Renders a credit rating class (e.g. "3a") with risk-based
 * color coding and an optional probability-of-default percentage.
 *
 * Props:
 *   klasse  (string)        – rating class, e.g. "3a", "7", "10"
 *   pd      (number | null) – probability of default in percent (optional)
 *   size    ('sm' | 'md')   – badge size (default 'sm')
 */

import { formatNumber } from '../../utils/formatters';

function getColorClasses(klasse) {
  // Extract the leading numeric portion from the rating class string.
  // Handles forms like "3a", "10", "7b", etc.
  const num = parseInt(klasse, 10) || parseInt(String(klasse).replace(/[a-c]/gi, ''), 10) || 0;

  if (num >= 10) return 'bg-red-100 text-red-800';
  if (num >= 8)  return 'bg-orange-100 text-orange-800';
  if (num >= 6)  return 'bg-amber-100 text-amber-800';
  if (num >= 4)  return 'bg-lime-100 text-lime-800';
  return 'bg-green-100 text-green-800';
}

export default function RatingBadge({ klasse, pd, size = 'sm' }) {
  if (!klasse) return null;

  const colorClasses = getColorClasses(klasse);

  const sizeClasses =
    size === 'sm'
      ? 'px-2 py-0.5 text-xs'
      : 'px-3 py-1 text-sm';

  return (
    <span
      className={`inline-flex items-center gap-1 rounded font-mono font-semibold whitespace-nowrap ${sizeClasses} ${colorClasses}`}
    >
      {klasse}
      {pd != null && (
        <span className="font-normal opacity-70">
          ({formatNumber(pd, 2)}%)
        </span>
      )}
    </span>
  );
}
