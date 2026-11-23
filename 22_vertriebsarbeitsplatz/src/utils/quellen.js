// Namen der Quellen eines Leads (Schlüssel `quellen` der Demo-Daten) für
// Sätze: die Einordnung des Top-Leads im Assistenten und die KI-Begründung
// eines Anschreibens. Ohne Eintrag stünde der Schlüssel klein im Satz
// („… und risikosignal“), deshalb führt die Liste alle Schlüssel der Daten.
import { tx } from './langHelper';

const NAMEN = {
  finanztransaktion: () => tx('Kontoumsätze', 'account data'),
  kontoumsaetze: () => tx('Kontoumsätze', 'account data'),
  bestand: () => tx('Bestand', 'holdings'),
  kommunikation: () => tx('Kommunikation', 'communication'),
  lebensereignis: () => tx('Lebensereignis', 'life event'),
  wettbewerb: () => tx('Wettbewerb', 'competition'),
  direktvertrieb: () => tx('Direktvertrieb', 'direct channel'),
  markt: () => tx('Markt', 'market'),
  risikosignal: () => tx('Risikosignal', 'risk signal'),
  produktabschluss: () => tx('Produktabschluss', 'product closing'),
  chatbot: () => tx('Chatbot', 'chatbot'),
};

export function quellenName(schluessel) {
  return NAMEN[schluessel] ? NAMEN[schluessel]() : schluessel;
}

/** Die Quellen eines Leads als Namen, jede nur einmal. */
export function quellenNamen(quellen = []) {
  return [...new Set((quellen || []).map(quellenName))];
}

/** „A, B und C“ aus den Quellen eines Leads. */
export function quellenAufzaehlung(quellen = []) {
  const namen = quellenNamen(quellen);
  if (namen.length <= 1) return namen[0] || '';
  return `${namen.slice(0, -1).join(', ')} ${tx('und', 'and')} ${namen[namen.length - 1]}`;
}
