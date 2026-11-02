// ===========================================================================
// umfangHilfe.js — kleine Helfer für das Umfangs-Panel: der Satz über die
// Wirkung und das Kopieren in die Zwischenablage (mit Rückfallweg, weil
// navigator.clipboard nur im sicheren Kontext arbeitet).
// ===========================================================================
import { mehrzahl, minuten } from '../../lib/format.js';

/**
 * „Sichtbar: 1 von 13 Kapiteln, 4 Lerneinheiten, 11 Fragen, 9 Min. Lesezeit“
 * @param {{ sichtbar:number, alle:number, einheiten:number, fragen:number, lesezeit:number }} zahlen
 */
export function beschreibeWirkung(zahlen) {
  const teile = [
    `${zahlen.sichtbar} von ${mehrzahl(zahlen.alle, 'Kapitel', 'Kapiteln')}`,
    mehrzahl(zahlen.einheiten, 'Lerneinheit', 'Lerneinheiten'),
    mehrzahl(zahlen.fragen, 'Frage', 'Fragen'),
    `${minuten(zahlen.lesezeit)} Lesezeit`,
  ];
  return `Sichtbar: ${teile.join(', ')}`;
}

/** Legt einen Text in die Zwischenablage; liefert true bei Erfolg. */
export async function kopiereText(text) {
  if (!text) return false;
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch { /* Rückfallweg unten */ }
  try {
    const feld = document.createElement('textarea');
    feld.value = text;
    feld.setAttribute('readonly', '');
    feld.style.position = 'fixed';
    feld.style.top = '-1000px';
    document.body.appendChild(feld);
    feld.select();
    const ok = document.execCommand('copy');
    document.body.removeChild(feld);
    return ok;
  } catch {
    return false;
  }
}
