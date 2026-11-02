/**
 * Sicherheiten-Abschlaege (Haircuts) fuer die Kreditanalyse
 *
 * haircut_min: Minimaler Abschlag (optimistisch, gute Verwertbarkeit)
 * haircut_max: Maximaler Abschlag (pessimistisch, schwierige Verwertung)
 * standard:    Standard-Abschlag fuer Erstbewertung
 * label:       Kurzbeschreibung der Bewertungspraxis
 *
 * Anrechenbarer Wert = Nominalwert * (1 - haircut)
 *   z.B. haircut = 0.30 => 70% des Nominalwerts werden angerechnet
 */

export const haircutRates = {
  "Grundschuld/Hypothek (Wohnimmobilie)": {
    haircut_min: 0.20,
    haircut_max: 0.40,
    standard: 0.30,
    label: "60-80% des Beleihungswerts",
    kategorie: "Immobilien",
    verwertungsdauer_monate: 6
  },
  "Grundschuld/Hypothek (Gewerbeimmobilie)": {
    haircut_min: 0.40,
    haircut_max: 0.60,
    standard: 0.45,
    label: "40-60% des Verkehrswerts",
    kategorie: "Immobilien",
    verwertungsdauer_monate: 12
  },
  "Sicherungsübereignung (Maschinen/Anlagen)": {
    haircut_min: 0.50,
    haircut_max: 0.70,
    standard: 0.55,
    label: "30-50% des Zeitwerts",
    kategorie: "Sachanlagen",
    verwertungsdauer_monate: 6
  },
  "Sicherungsübereignung (Fahrzeuge)": {
    haircut_min: 0.50,
    haircut_max: 0.60,
    standard: 0.50,
    label: "ca. 50% des aktuellen Werts",
    kategorie: "Sachanlagen",
    verwertungsdauer_monate: 3
  },
  "Globalzession (Forderungen)": {
    haircut_min: 0.40,
    haircut_max: 0.80,
    standard: 0.50,
    label: "20-60% des Nennwerts",
    kategorie: "Forderungen",
    verwertungsdauer_monate: 3
  },
  "Einzelzession (Forderungen)": {
    haircut_min: 0.30,
    haircut_max: 0.60,
    standard: 0.40,
    label: "40-70% des Nennwerts",
    kategorie: "Forderungen",
    verwertungsdauer_monate: 3
  },
  "Verpfändung Kontoguthaben": {
    haircut_min: 0,
    haircut_max: 0.05,
    standard: 0,
    label: "bis 100%",
    kategorie: "Finanzanlagen",
    verwertungsdauer_monate: 0
  },
  "Verpfändung Wertpapiere (Staatsanleihen)": {
    haircut_min: 0.05,
    haircut_max: 0.15,
    standard: 0.10,
    label: "85-95% des Kurswerts",
    kategorie: "Finanzanlagen",
    verwertungsdauer_monate: 0
  },
  "Verpfändung Wertpapiere (Aktien/Fonds)": {
    haircut_min: 0.40,
    haircut_max: 0.60,
    standard: 0.40,
    label: "40-60% des Kurswerts",
    kategorie: "Finanzanlagen",
    verwertungsdauer_monate: 1
  },
  "Lebensversicherung (Rückkaufswert)": {
    haircut_min: 0,
    haircut_max: 0.05,
    standard: 0,
    label: "Rückkaufswert (100%)",
    kategorie: "Versicherungen",
    verwertungsdauer_monate: 1
  },
  "Bürgschaft (privat)": {
    haircut_min: 0.30,
    haircut_max: 0.70,
    standard: 0.50,
    label: "30-70% je nach Bonität",
    kategorie: "Bürgschaften",
    verwertungsdauer_monate: 6
  },
  "Bürgschaft (Bürgschaftsbank)": {
    haircut_min: 0.15,
    haircut_max: 0.25,
    standard: 0.20,
    label: "80% des Kreditbetrags",
    kategorie: "Bürgschaften",
    verwertungsdauer_monate: 3
  },
  "Bürgschaft (KfW/öffentlich)": {
    haircut_min: 0.10,
    haircut_max: 0.20,
    standard: 0.15,
    label: "80-90% des Kreditbetrags",
    kategorie: "Bürgschaften",
    verwertungsdauer_monate: 3
  },
  "Patronatserklärung": {
    haircut_min: 0.50,
    haircut_max: 0.80,
    standard: 0.60,
    label: "20-50% je nach Bonität",
    kategorie: "Sonstige",
    verwertungsdauer_monate: 6
  },
  "Warenbesicherung": {
    haircut_min: 0.50,
    haircut_max: 0.80,
    standard: 0.60,
    label: "20-50%",
    kategorie: "Sachanlagen",
    verwertungsdauer_monate: 3
  },
  "Grundschuld/Hypothek (unbebautes Grundstück)": {
    haircut_min: 0.35,
    haircut_max: 0.55,
    standard: 0.40,
    label: "45-65% des Verkehrswerts",
    kategorie: "Immobilien",
    verwertungsdauer_monate: 12
  }
};

/**
 * Alle verfuegbaren Sicherheitenarten
 */
export const sicherheitenArten = Object.keys(haircutRates);

/**
 * Sicherheitenarten gruppiert nach Kategorie
 */
export const sicherheitenNachKategorie = Object.entries(haircutRates).reduce(
  (acc, [name, details]) => {
    const kat = details.kategorie;
    if (!acc[kat]) {
      acc[kat] = [];
    }
    acc[kat].push(name);
    return acc;
  },
  {}
);

/**
 * Berechnet den anrechenbaren Sicherheitenwert.
 *
 * @param {string} art - Sicherheitenart (Key in haircutRates)
 * @param {number} nominalwert - Nominal- bzw. Verkehrswert
 * @param {number} [customHaircut] - Optionaler benutzerdefinierter Abschlag (0-1)
 * @returns {{ anrechenbarer_wert: number, haircut: number, art: string } | null}
 */
export const berechneAnrechenbarenWert = (art, nominalwert, customHaircut) => {
  const rate = haircutRates[art];
  if (!rate) return null;

  let haircut;
  if (customHaircut !== undefined && customHaircut !== null) {
    haircut = Math.max(rate.haircut_min, Math.min(rate.haircut_max, customHaircut));
  } else {
    haircut = rate.standard;
  }

  const anrechenbarer_wert = nominalwert * (1 - haircut);

  return {
    anrechenbarer_wert: Math.round(anrechenbarer_wert * 100) / 100,
    haircut,
    art
  };
};

/**
 * Berechnet die Gesamtbesicherung fuer ein Sicherheitenportfolio.
 *
 * @param {Array<{ art: string, nominalwert: number, haircut?: number }>} sicherheiten
 * @returns {{ gesamt_nominal: number, gesamt_anrechenbar: number, durchschnitts_haircut: number, details: Array }}
 */
export const berechneGesamtbesicherung = (sicherheiten) => {
  if (!Array.isArray(sicherheiten) || sicherheiten.length === 0) {
    return { gesamt_nominal: 0, gesamt_anrechenbar: 0, durchschnitts_haircut: 0, details: [] };
  }

  let gesamt_nominal = 0;
  let gesamt_anrechenbar = 0;
  const details = [];

  for (const s of sicherheiten) {
    const ergebnis = berechneAnrechenbarenWert(s.art, s.nominalwert, s.haircut);
    if (ergebnis) {
      gesamt_nominal += s.nominalwert;
      gesamt_anrechenbar += ergebnis.anrechenbarer_wert;
      details.push({
        ...ergebnis,
        nominalwert: s.nominalwert
      });
    }
  }

  const durchschnitts_haircut =
    gesamt_nominal > 0 ? 1 - gesamt_anrechenbar / gesamt_nominal : 0;

  return {
    gesamt_nominal: Math.round(gesamt_nominal * 100) / 100,
    gesamt_anrechenbar: Math.round(gesamt_anrechenbar * 100) / 100,
    durchschnitts_haircut: Math.round(durchschnitts_haircut * 10000) / 10000,
    details
  };
};
