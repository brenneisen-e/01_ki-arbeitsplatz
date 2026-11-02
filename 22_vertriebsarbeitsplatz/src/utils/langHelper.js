// Shared, cached language helpers for module-level i18n
let _cached = null;

export function getLang() {
  if (_cached) return _cached;
  try { _cached = localStorage.getItem('kia_language') || 'de'; } catch { _cached = 'de'; }
  return _cached;
}

export function invalidateLangCache() { console.log('[langHelper] Cache invalidated'); _cached = null; }

export function tx(de, en) { return getLang() === 'en' ? en : de; }
