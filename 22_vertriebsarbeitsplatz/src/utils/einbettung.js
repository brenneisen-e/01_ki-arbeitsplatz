// Vorgaben per Adresse, wenn eine andere App den Vertriebsarbeitsplatz einbettet
// (Banking Horizon, Kapitel 02 „Markt & Vertrieb“):
//
//   ?whitelabel               nur die Whitelabel-Marken (Zukunftsversicherung,
//                             Zukunftsbank, Zukunftsinvestment), unabhängig von der
//                             gespeicherten Instituts-Wahl; die Auswahl in Kopf und
//                             Landing Page bietet dann nur diese an
//   ?rahmen=banking-horizon   der Knopf oben links auf der Landing Page führt zurück
//                             in Banking Horizon (schließt dort das Vollbild) statt
//                             zur Plattform-Startseite
//
// Beide stehen vor dem Hash: …/vertriebsarbeitsplatz/dist/?whitelabel&rahmen=banking-horizon#/banking/landing

import { MODE_CONFIGS } from '../data/modeConfig';
import { istWhitelabel } from './whitelabel';

const PARAMETER = (() => {
  try {
    return new URLSearchParams(window.location.search);
  } catch {
    return new URLSearchParams();
  }
})();

export const NUR_WHITELABEL = PARAMETER.has('whitelabel');

/** Die Whitelabel-Variante eines Modus (Zukunftsbank im Banking). */
export function whitelabelVariante(modeId) {
  return (MODE_CONFIGS[modeId]?.institutVarianten || []).find(v => istWhitelabel(v.institut)) || null;
}

/** Instituts-Varianten, die die Auswahl anbieten darf. */
export function sichtbareVarianten(cfg) {
  const alle = cfg?.institutVarianten || [];
  return NUR_WHITELABEL ? alle.filter(v => istWhitelabel(v.institut)) : alle;
}

// Rückwege in einbettende Apps. `ausserhalb` gilt, wenn die Demo nicht im Rahmen
// läuft (z. B. über „Demo in neuem Tab öffnen“).
const RAHMEN = {
  'banking-horizon': {
    name: 'Banking Horizon',
    ausserhalb: '../../03_banking-horizon/dist/#/vertrieb',
  },
};

export const RUECKWEG = RAHMEN[PARAMETER.get('rahmen')] || null;

/** Zurück in die einbettende App: im Rahmen per Nachricht, sonst per Link. */
export function zurueckInDenRahmen() {
  if (!RUECKWEG) return;
  if (window.parent !== window) {
    // Banking Horizon (IframeStage.tsx) schließt die Demo auf diese Nachricht.
    window.parent.postMessage('bz2030:demo-schliessen', '*');
    return;
  }
  window.location.href = RUECKWEG.ausserhalb;
}
