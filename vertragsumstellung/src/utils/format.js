const euroFormatter = new Intl.NumberFormat('de-DE', {
  style: 'currency',
  currency: 'EUR',
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
})

export function formatEuro(val) {
  if (val == null) return '–'
  return euroFormatter.format(val)
}

export function formatDelta(val) {
  if (val == null) return '–'
  return (val >= 0 ? '+' : '') + formatEuro(val)
}

export function formatPercent(val, decimals = 1) {
  return (val >= 0 ? '+' : '') + val.toFixed(decimals) + '%'
}
