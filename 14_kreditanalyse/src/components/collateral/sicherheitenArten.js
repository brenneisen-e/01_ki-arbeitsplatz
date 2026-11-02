/**
 * Sicherheitenarten -- Zuordnung der erfassten Sicherheiten zu den Schlüsseln
 * der Haircut-Tabelle und Aufteilung in Immobiliensicherheiten und sonstige
 * Sicherheiten. Wird von allen Reitern der Sicherheitenbewertung genutzt.
 */

import { haircutRates, sicherheitenArten } from '../../data/haircutRates';

/**
 * Normalize umlauts for matching company data (UTF-8 umlauts) against
 * haircutRates keys (ASCII ae/oe/ue).
 */
export const normalizeUmlauts = (str) =>
  str
    .replace(/ae/g, 'ä')
    .replace(/oe/g, 'ö')
    .replace(/ue/g, 'ü')
    .replace(/Ae/g, 'Ä')
    .replace(/Oe/g, 'Ö')
    .replace(/Ue/g, 'Ü');

/** Display-friendly label for a haircutRates key. */
export const displayArt = (art) => normalizeUmlauts(art);

/**
 * Sicherheitenarten der Demo-Daten, die es in der Haircut-Tabelle nicht
 * gibt. Eine Mietabtretung ist eine Abtretung bestimmter Forderungen und
 * gehört damit zu den sonstigen Sicherheiten, nicht zu den Grundpfandrechten.
 */
const ART_ALIASE = {
  Mietabtretung: 'Einzelzession (Forderungen)',
};

/**
 * Find the haircutRates key that best matches a company's art string.
 */
export const findHaircutRateKey = (art) => {
  if (!art) return null;
  if (haircutRates[art]) return art;
  if (ART_ALIASE[art]) return ART_ALIASE[art];
  const normalizedArt = normalizeUmlauts(art);
  for (const key of sicherheitenArten) {
    const normalizedKey = normalizeUmlauts(key);
    if (normalizedKey === normalizedArt || normalizedKey === art || key === normalizedArt) {
      return key;
    }
  }
  // Teiltreffer: Grundform vor der Klammer muss passen. Passt zusätzlich der
  // Klammerzusatz (z. B. "Grundschuld (Gewerbeimmobilie)"), gewinnt dieser
  // Schlüssel, sonst der erste mit derselben Grundform
  // (z. B. "Bürgschaft (natürliche Person)" -> "Bürgschaft (privat)").
  const artLower = normalizeUmlauts(art).toLowerCase();
  const grundform = artLower.split('(')[0].trim();
  const zusatz = (artLower.match(/\(([^)]+)\)/) || [])[1]?.trim();
  const kandidaten = sicherheitenArten.filter((key) =>
    normalizeUmlauts(key).toLowerCase().includes(grundform.split(/[\s/]/)[0])
  );
  if (zusatz) {
    const mitZusatz = kandidaten.find((key) => normalizeUmlauts(key).toLowerCase().includes(zusatz));
    if (mitZusatz) return mitZusatz;
  }
  return kandidaten[0] || null;
};

/**
 * Look up haircut rate for a given collateral type.
 */
export const findHaircutRate = (art) => {
  const key = findHaircutRateKey(art);
  return key ? haircutRates[key] : null;
};

/** Grundpfandrechte auf Wohn- und Gewerbeimmobilien sowie Grundstücken. */
export const IMMOBILIEN_ARTEN = sicherheitenArten.filter(
  (art) => haircutRates[art].kategorie === 'Immobilien'
);

/** Alle übrigen Sicherheitenarten (Bürgschaften, Zessionen, Verpfändungen, …). */
export const SONSTIGE_ARTEN = sicherheitenArten.filter(
  (art) => haircutRates[art].kategorie !== 'Immobilien'
);

export const istImmobilie = (art) => findHaircutRate(art)?.kategorie === 'Immobilien';

export const BEWERTUNGSVERFAHREN = ['Gutachten', 'Kaufvertrag', 'Buchwert', 'Versicherungswert'];

export const BEWERTUNGSVERFAHREN_IMMOBILIEN = [
  'Gutachten (Ertragswertverfahren)',
  'Gutachten (Sachwertverfahren)',
  'Gutachten (Vergleichswertverfahren)',
  'Beleihungswertgutachten',
  'Kaufvertrag',
  'Baukostenberechnung',
  'Interne Bewertung',
];

export const RANG_OPTIONS = [
  { value: 1, label: '1.' },
  { value: 2, label: '2.' },
  { value: 3, label: '3.' },
  { value: 4, label: '4.' },
];

let laufendeNummer = 0;
const neueId = () => `sicherheit-${Date.now()}-${(laufendeNummer += 1)}`;

/** Leeres Objekt für die Daten aus den Objektunterlagen. */
export const leeresObjekt = () => ({
  nutzung: '',
  baujahr: '',
  flaeche: '',
  energieklasse: '',
  energiekennwert: '',
  ausweisGueltigBis: '',
  einheiten: '',
  vermieteteFlaeche: '',
  leerstandFlaeche: '',
  leerstandsquote: '',
  walt: '',
  mietertraege: '',
  bewirtschaftung: '',
  cashflow: '',
});

/** Neue, leere Sicherheit einer bestimmten Art. */
export const neueSicherheit = (art) => ({
  id: neueId(),
  art,
  bezeichnung: '',
  wert: 0,
  datum: '',
  bewertung: istImmobilie(art) ? BEWERTUNGSVERFAHREN_IMMOBILIEN[0] : 'Gutachten',
  vorlasten: 0,
  rang: 1,
  ...(istImmobilie(art) ? { objekt: leeresObjekt(), unterlagen: [], quellen: {}, manuell: [] } : {}),
});

/**
 * Map a company sicherheiten item into the form structure.
 */
export const mapCompanyItem = (s) => {
  const art = findHaircutRateKey(s.art) || SONSTIGE_ARTEN[0];
  return {
    id: neueId(),
    art,
    bezeichnung: s.bezeichnung || '',
    wert: s.wert || 0,
    datum: s.datum || '',
    bewertung: s.bewertung || 'Gutachten',
    vorlasten: s.vorlasten || 0,
    rang: s.rang || 1,
    ...(istImmobilie(art) ? { objekt: leeresObjekt(), unterlagen: [], quellen: {}, manuell: [] } : {}),
  };
};
