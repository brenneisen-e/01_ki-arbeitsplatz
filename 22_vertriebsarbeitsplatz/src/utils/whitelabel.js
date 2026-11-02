// Whitelabel: In den Varianten Zukunftsversicherung, Zukunftsbank und
// Zukunftsinvestment erscheinen keine echten Versicherer. Die Demo-Daten sind
// für ERGO (Versicherung) und die Volksbank mit R+V (Banking) geschrieben; hier
// steht, welcher echte Name im Whitelabel wofür steht. Jeder Name hat immer
// denselben Ersatz, damit Geschichten wie „HUK Hausrat zum Hausversicherer
// holen“ stimmig bleiben.
//
// Angewendet wird das zentral: WhitelabelFilter.jsx schreibt sichtbare Texte
// und Attribute um, LogoImg zeigt für fiktive Namen keine echten Logos, die
// Downloads (Demo-JSON, Anschreiben) laufen durch `ersetzeText`. Bereiche mit
// `data-echte-namen` (Instituts-Auswahl) bleiben unverändert.

export const WHITELABEL_INSTITUTE = ['Zukunftsversicherung', 'Zukunftsbank', 'Zukunftsinvestment'];

export function istWhitelabel(institut) {
  return WHITELABEL_INSTITUTE.includes(institut);
}

/** Der eigene Konzern der Demo-Daten wird zum eigenen Haus des Whitelabels. */
const EIGENES_HAUS = {
  versicherung: [
    ['ERGO Versicherung AG', 'Zukunftsversicherung AG'],
    ['ERGO Direkt', 'Zukunft Direkt'],
    ['ERGO Group', 'Zukunft Gruppe'],
    ['ergo.de', 'zukunftsversicherung.de'],
    ['ERGO', 'Zukunftsversicherung'],
    ['DKV', 'Zukunftsversicherung'],
    ['D.A.S.', 'Zukunftsversicherung'],
  ],
  banking: [
    ['R+V Versicherung', 'Zukunftsversicherung'],
    ['R+V', 'Zukunftsversicherung'],
  ],
  vermoegensverwaltung: [],
};

/** Wettbewerber: fiktive Marken, je echter Name immer dieselbe. */
const WETTBEWERBER = [
  ['HUK-COBURG', 'Blue Dot'],
  ['HUK-Coburg', 'Blue Dot'],
  ['HUK24', 'Blue Dot Direkt'],
  ['HUK', 'Blue Dot'],
  ['Allianz Versicherungs-AG', 'Red Insurance AG'],
  ['Allianz Lebensvers.-AG', 'Red Insurance Leben AG'],
  ['Allianz', 'Red Insurance'],
  ['AXA', 'Nordlicht'],
  ['Axa', 'Nordlicht'],
  ['Generali', 'Aurum'],
  ['Zurich', 'Silberberg'],
  ['HDI', 'Granit'],
  ['R+V', 'Kompass'],
  ['Alte Leipziger', 'Eichenhof'],
  ['Hallesche', 'Eichenhof Kranken'],
  ['ALH', 'Eichenhof Gruppe'],
  ['VHV', 'Vektor'],
  ['CosmosDirekt', 'Pixel Direkt'],
  ['Gothaer', 'Lindenhof'],
  ['Signal Iduna', 'Leuchtturm'],
  ['SIGNAL IDUNA', 'Leuchtturm'],
  ['Provinzial', 'Regionalis'],
  ['DEVK', 'Viadukt'],
  ['Debeka', 'Polaris'],
  ['ARAG', 'Fairplay'],
  ['Helvetia', 'Seeblick'],
  ['Swiss Life', 'Summit Life'],
  ['Nürnberger', 'Burgtor'],
  ['Hannoversche', 'Leinetal'],
  ['Hiscox', 'Hafenkante'],
  ['Condor', 'Kranich'],
  ['Kravag', 'Fernweg'],
  // Der Konzern der Demo-Daten, wenn er im Banking oder in der
  // Vermögensverwaltung als fremder Versicherer auftaucht
  ['ERGO', 'Lumen'],
  ['DKV', 'Lumen Kranken'],
];

const FIKTIVE_MARKEN = [...new Set(WETTBEWERBER.map(([, fiktiv]) => fiktiv))];

/** Fiktive Wettbewerber haben kein Logo: LogoImg zeigt Initialen statt einer geratenen Domain. */
export function istFiktiveMarke(name) {
  return typeof name === 'string' && FIKTIVE_MARKEN.some(f => name === f || name.startsWith(`${f} `));
}

const escape = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// Wortgrenzen auch für Umlaute: kein Buchstabe oder keine Ziffer davor/danach.
const muster = (name) => new RegExp(`(?<![\\p{L}\\p{N}])${escape(name)}(?![\\p{L}\\p{N}])`, 'gu');

const CACHE = {};

/** Ersetzungsliste je Modus: zuerst das eigene Haus, dann die Wettbewerber. */
function regeln(modeId) {
  if (!CACHE[modeId]) {
    const eigene = EIGENES_HAUS[modeId] || [];
    const vergeben = new Set(eigene.map(([echt]) => echt));
    CACHE[modeId] = [...eigene, ...WETTBEWERBER.filter(([echt]) => !vergeben.has(echt))]
      .map(([echt, fiktiv]) => [muster(echt), fiktiv]);
  }
  return CACHE[modeId];
}

const SCHNELLTEST = /ERGO|ergo\.de|DKV|D\.A\.S\.|R\+V|HUK|Allianz|AXA|Axa|Generali|Zurich|HDI|Leipziger|Hallesche|ALH|VHV|Cosmos|Gothaer|Signal|SIGNAL|Provinzial|DEVK|Debeka|ARAG|Helvetia|Swiss Life|Nürnberger|Hannoversche|Hiscox|Condor|Kravag/;

/** Echte Versicherernamen in `text` durch die fiktiven des Modus ersetzen. */
export function ersetzeText(text, modeId) {
  if (!text || typeof text !== 'string' || !SCHNELLTEST.test(text)) return text;
  let out = text;
  for (const [re, fiktiv] of regeln(modeId)) out = out.replace(re, fiktiv);
  return out;
}

// Zustand für Stellen außerhalb von React-Kontext (LogoImg, Downloads). Wird von
// WhitelabelRahmen beim Rendern gesetzt, also bevor die Kinder rendern.
let zustand = { aktiv: false, modeId: 'versicherung' };

export function setzeWhitelabel(aktiv, modeId) {
  zustand = { aktiv, modeId };
}

export function whitelabel() {
  return zustand;
}

/** Ersetzt nur, wenn gerade eine Whitelabel-Variante aktiv ist. */
export function neutral(text, modeId = zustand.modeId) {
  return zustand.aktiv ? ersetzeText(text, modeId) : text;
}
