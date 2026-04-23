// Haustier-Bestätigung pro Kunde im localStorage.
// Quelle der Wahrheit fuer „Haustier vermutet → Haustier bestätigt": sowohl
// die HaustiereRow in den Stammdaten als auch der Leads-Tab lesen hier.
// Nach einem setHaustierConfirmation feuert ein Window-Event, damit bereits
// gemountete Komponenten reagieren können.

const KEY = (kundeId) => `haustier_confirmed_${kundeId}`;

export function getHaustierConfirmation(kundeId) {
  if (!kundeId || typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(KEY(kundeId));
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function setHaustierConfirmation(kundeId, data) {
  if (!kundeId || typeof window === 'undefined') return;
  try {
    if (data) {
      window.localStorage.setItem(KEY(kundeId), JSON.stringify(data));
    } else {
      window.localStorage.removeItem(KEY(kundeId));
    }
    window.dispatchEvent(new CustomEvent('kia:haustier-confirmed', { detail: { kundeId, data } }));
  } catch {}
}
