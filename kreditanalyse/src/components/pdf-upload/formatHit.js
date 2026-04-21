/**
 * formatHit.js
 *
 * Formatiert einen Parser-Treffer für die UI-Anzeige in deutschem Locale.
 */

const currencyFmt = new Intl.NumberFormat('de-DE', {
  style: 'currency',
  currency: 'EUR',
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
});

const percentFmt = new Intl.NumberFormat('de-DE', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 3,
});

export function formatHitValue(hit) {
  if (!hit) return '';
  const { value, mapping } = hit;
  if (value === null || value === undefined || value === '') return '';

  switch (mapping.format) {
    case 'currency':
      return typeof value === 'number' ? currencyFmt.format(value) : String(value);
    case 'percent':
      return typeof value === 'number' ? `${percentFmt.format(value)} %` : String(value);
    case 'years': {
      const n = Number(value);
      if (!Number.isFinite(n)) return String(value);
      if (n % 12 === 0) return `${n} Monate (${n / 12} Jahre)`;
      return `${n} Monate`;
    }
    case 'date':
      return String(value);
    case 'text':
    default:
      return String(value);
  }
}

export function confidenceLabel(c) {
  if (c === 'high') return 'Sicher';
  if (c === 'medium') return 'Wahrscheinlich';
  return 'Unsicher';
}

export function confidenceClass(c) {
  if (c === 'high') return 'bg-green-50 text-green-700 border-green-200';
  if (c === 'medium') return 'bg-amber-50 text-amber-700 border-amber-200';
  return 'bg-gray-50 text-gray-600 border-gray-200';
}
