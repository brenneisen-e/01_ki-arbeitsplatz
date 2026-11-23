// Stand des Arbeitsplatzes für das Notizfenster: was nicht in der Adresse
// steht (Assistent offen, Top-Lead aufgeklappt, Fenster über der Seite, Modul
// der Landing Page, Schritt der Präsentation). Die Komponenten melden es über
// `useNotizenStelle`, `NotizenKopplung` (kopplung.jsx) schreibt es zusammen mit
// Modus, Ansicht und Reiter nach localStorage.
import { useEffect, useSyncExternalStore } from 'react';

// Ein Notizfenster gibt es nur für die veröffentlichte Seite selbst: nicht im
// Rahmen (dort führt Banking Horizon seine eigenen Notizen, und in der Galerie
// soll niemand hineingeraten), nicht im DEX-Paket (das Notizfenster liegt ihm
// nicht bei) und nicht als Datei.
export const NOTIZEN_MOEGLICH = (() => {
  try {
    if (typeof window === 'undefined' || window.__DEX_EINGEBETTET) return false;
    if (window.parent !== window) return false;
    if (!/^https?:$/.test(window.location.protocol)) return false;
    return typeof BroadcastChannel !== 'undefined';
  } catch {
    return false;
  }
})();

const GRUND = {
  assistent: false,
  topLead: false,
  anschreiben: false,
  vorbereitung: false,
  landingModus: null,
  praesSchritt: null,
};

let zusatz = { ...GRUND };
const hoerer = new Set();

function melde(name, wert) {
  if (zusatz[name] === wert) return;
  zusatz = { ...zusatz, [name]: wert };
  hoerer.forEach((h) => h());
}

/**
 * Meldet eine Stelle, solange die Komponente steht:
 *   useNotizenStelle('vorbereitung')            Fenster ist offen, solange es gemountet ist
 *   useNotizenStelle('assistent', isOpen)       folgt einem Zustand
 * Beim Abbau fällt die Angabe auf ihren Grundwert zurück.
 */
export function useNotizenStelle(name, wert = true) {
  useEffect(() => { melde(name, wert); }, [name, wert]);
  useEffect(() => () => melde(name, GRUND[name]), [name]);
}

function abonniere(h) {
  hoerer.add(h);
  return () => hoerer.delete(h);
}

export function useNotizenZusatz() {
  return useSyncExternalStore(abonniere, () => zusatz);
}
