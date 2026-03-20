export function formatEuro(val) {
  return '€' + Math.round(val).toLocaleString('de-DE');
}
