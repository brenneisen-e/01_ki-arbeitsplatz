// ===========================================================================
// speicher.js — der einzige Zugang zu localStorage.
//
// Jeder Zugriff ist in try/catch gehüllt: im privaten Fenster, bei gesperrten
// Seitendaten oder vollem Speicher darf die App nie brechen — sie läuft dann
// ohne Gedächtnis. Werte liegen als { v: version, wert } ab; passt die
// Version nicht, gilt der Standardwert (so kann ein Schema wechseln, ohne
// dass alte Daten die neue App stören).
// ===========================================================================

/** Alle bekannten Schlüssel an einem Ort — nie freihändig neue Strings streuen. */
export const SCHLUESSEL = {
  fortschritt: 'v1x1.fortschritt.v2',
  zuletztGesucht: 'v1x1.suche.zuletzt.v1',
  ersteWoche: 'v1x1.start.ersteWoche.v1',
  umfang: 'v1x1.umfang.v1',
};

/**
 * Liest einen Wert. Fehlt er, ist er beschädigt oder stimmt die Version nicht,
 * kommt `standard` zurück.
 * @template T
 * @param {string} schluessel
 * @param {T} standard
 * @param {number} [version=1]
 * @returns {T}
 */
export function lade(schluessel, standard, version = 1) {
  try {
    const roh = window.localStorage.getItem(schluessel);
    if (roh == null) return standard;
    const huelle = JSON.parse(roh);
    if (!huelle || typeof huelle !== 'object' || huelle.v !== version) return standard;
    return huelle.wert === undefined ? standard : huelle.wert;
  } catch {
    return standard;
  }
}

/**
 * Schreibt einen Wert. Liefert false, wenn der Speicher nicht erreichbar ist.
 * @param {string} schluessel
 * @param {unknown} wert
 * @param {number} [version=1]
 */
export function speichere(schluessel, wert, version = 1) {
  try {
    window.localStorage.setItem(schluessel, JSON.stringify({ v: version, wert }));
    return true;
  } catch {
    return false;
  }
}

/** Entfernt einen Schlüssel; Fehler werden geschluckt. */
export function entferne(schluessel) {
  try {
    window.localStorage.removeItem(schluessel);
    return true;
  } catch {
    return false;
  }
}

/** Prüft einmalig, ob localStorage überhaupt schreibbar ist. */
export function verfuegbar() {
  try {
    const probe = '__v1x1_probe__';
    window.localStorage.setItem(probe, '1');
    window.localStorage.removeItem(probe);
    return true;
  } catch {
    return false;
  }
}
