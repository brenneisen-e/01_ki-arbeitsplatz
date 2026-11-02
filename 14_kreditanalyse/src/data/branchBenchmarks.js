/**
 * Branchen-Benchmarks fuer die Kennzahlenanalyse
 *
 * Schwellenwerte fuer die Ampelbewertung finanzieller Kennzahlen nach Branche.
 *
 * Logik:
 *   - Bei Kennzahlen, bei denen ein HOEHERER Wert besser ist (z.B. Eigenkapitalquote):
 *     gut > mittel > schlecht  (Wert >= gut -> gruen, >= mittel -> gelb, sonst rot)
 *
 *   - Bei Kennzahlen, bei denen ein NIEDRIGERER Wert besser ist (z.B. Verschuldungsgrad):
 *     gut < mittel < schlecht  (Wert <= gut -> gruen, <= mittel -> gelb, sonst rot)
 *
 * Einheiten:
 *   - Quoten/Margen/Rentabilitaeten: in Prozent (%)
 *   - Verschuldungsgrad: in Prozent (%)
 *   - Deckungsgrade: in Prozent (%)
 *   - Liquiditaetsgrade: in Prozent (%)
 *   - Dynamischer Verschuldungsgrad: in Jahren
 *   - Zinsdeckungsgrad: Faktor (x)
 *   - Schuldentilgungsdauer: in Jahren
 */

export const branchBenchmarks = {
  "Maschinenbau": {
    eigenkapitalquote: { gut: 30, mittel: 20, schlecht: 10 },
    verschuldungsgrad: { gut: 150, mittel: 300, schlecht: 500 },
    anlagendeckung1: { gut: 80, mittel: 60, schlecht: 40 },
    anlagendeckung2: { gut: 120, mittel: 100, schlecht: 80 },
    umsatzrentabilitaet: { gut: 5, mittel: 2, schlecht: 0 },
    gesamtkapitalrentabilitaet: { gut: 10, mittel: 5, schlecht: 2 },
    ebitda_marge: { gut: 12, mittel: 7, schlecht: 3 },
    cashflow_rate: { gut: 8, mittel: 4, schlecht: 1 },
    personalaufwandsquote: { gut: 25, mittel: 35, schlecht: 45 },
    materialaufwandsquote: { gut: 40, mittel: 50, schlecht: 60 },
    liquiditaet1: { gut: 30, mittel: 15, schlecht: 5 },
    liquiditaet2: { gut: 120, mittel: 90, schlecht: 60 },
    liquiditaet3: { gut: 180, mittel: 130, schlecht: 90 },
    dynamischer_verschuldungsgrad: { gut: 3, mittel: 5, schlecht: 8 },
    zinsdeckungsgrad: { gut: 5, mittel: 2.5, schlecht: 1.2 },
    schuldentilgungsdauer: { gut: 4, mittel: 7, schlecht: 12 }
  },

  "IT-Dienstleister": {
    eigenkapitalquote: { gut: 35, mittel: 22, schlecht: 12 },
    verschuldungsgrad: { gut: 100, mittel: 200, schlecht: 400 },
    anlagendeckung1: { gut: 90, mittel: 70, schlecht: 50 },
    anlagendeckung2: { gut: 130, mittel: 110, schlecht: 85 },
    umsatzrentabilitaet: { gut: 8, mittel: 4, schlecht: 1 },
    gesamtkapitalrentabilitaet: { gut: 15, mittel: 8, schlecht: 3 },
    ebitda_marge: { gut: 15, mittel: 9, schlecht: 4 },
    cashflow_rate: { gut: 10, mittel: 5, schlecht: 2 },
    personalaufwandsquote: { gut: 40, mittel: 55, schlecht: 70 },
    materialaufwandsquote: { gut: 10, mittel: 20, schlecht: 30 },
    liquiditaet1: { gut: 40, mittel: 20, schlecht: 8 },
    liquiditaet2: { gut: 140, mittel: 100, schlecht: 70 },
    liquiditaet3: { gut: 200, mittel: 150, schlecht: 100 },
    dynamischer_verschuldungsgrad: { gut: 2, mittel: 4, schlecht: 7 },
    zinsdeckungsgrad: { gut: 8, mittel: 4, schlecht: 1.5 },
    schuldentilgungsdauer: { gut: 3, mittel: 5, schlecht: 10 }
  },

  "Gastronomie": {
    eigenkapitalquote: { gut: 20, mittel: 12, schlecht: 5 },
    verschuldungsgrad: { gut: 200, mittel: 400, schlecht: 700 },
    anlagendeckung1: { gut: 60, mittel: 40, schlecht: 25 },
    anlagendeckung2: { gut: 100, mittel: 80, schlecht: 60 },
    umsatzrentabilitaet: { gut: 4, mittel: 1.5, schlecht: -1 },
    gesamtkapitalrentabilitaet: { gut: 8, mittel: 3, schlecht: 0 },
    ebitda_marge: { gut: 10, mittel: 5, schlecht: 1 },
    cashflow_rate: { gut: 6, mittel: 3, schlecht: 0 },
    personalaufwandsquote: { gut: 30, mittel: 40, schlecht: 50 },
    materialaufwandsquote: { gut: 25, mittel: 35, schlecht: 45 },
    liquiditaet1: { gut: 20, mittel: 10, schlecht: 3 },
    liquiditaet2: { gut: 90, mittel: 60, schlecht: 35 },
    liquiditaet3: { gut: 140, mittel: 100, schlecht: 70 },
    dynamischer_verschuldungsgrad: { gut: 4, mittel: 7, schlecht: 12 },
    zinsdeckungsgrad: { gut: 3, mittel: 1.5, schlecht: 0.8 },
    schuldentilgungsdauer: { gut: 5, mittel: 9, schlecht: 15 }
  },

  "Logistik": {
    eigenkapitalquote: { gut: 25, mittel: 15, schlecht: 8 },
    verschuldungsgrad: { gut: 180, mittel: 350, schlecht: 600 },
    anlagendeckung1: { gut: 70, mittel: 50, schlecht: 30 },
    anlagendeckung2: { gut: 110, mittel: 90, schlecht: 70 },
    umsatzrentabilitaet: { gut: 4, mittel: 2, schlecht: 0 },
    gesamtkapitalrentabilitaet: { gut: 8, mittel: 4, schlecht: 1 },
    ebitda_marge: { gut: 8, mittel: 4, schlecht: 1 },
    cashflow_rate: { gut: 7, mittel: 3, schlecht: 0.5 },
    personalaufwandsquote: { gut: 30, mittel: 42, schlecht: 55 },
    materialaufwandsquote: { gut: 35, mittel: 48, schlecht: 58 },
    liquiditaet1: { gut: 25, mittel: 12, schlecht: 4 },
    liquiditaet2: { gut: 110, mittel: 80, schlecht: 55 },
    liquiditaet3: { gut: 160, mittel: 115, schlecht: 80 },
    dynamischer_verschuldungsgrad: { gut: 3.5, mittel: 6, schlecht: 10 },
    zinsdeckungsgrad: { gut: 4, mittel: 2, schlecht: 1 },
    schuldentilgungsdauer: { gut: 5, mittel: 8, schlecht: 13 }
  },

  "Medizintechnik": {
    eigenkapitalquote: { gut: 35, mittel: 25, schlecht: 15 },
    verschuldungsgrad: { gut: 120, mittel: 250, schlecht: 450 },
    anlagendeckung1: { gut: 85, mittel: 65, schlecht: 45 },
    anlagendeckung2: { gut: 125, mittel: 105, schlecht: 85 },
    umsatzrentabilitaet: { gut: 7, mittel: 3, schlecht: 0.5 },
    gesamtkapitalrentabilitaet: { gut: 12, mittel: 6, schlecht: 2 },
    ebitda_marge: { gut: 14, mittel: 8, schlecht: 3 },
    cashflow_rate: { gut: 9, mittel: 5, schlecht: 1.5 },
    personalaufwandsquote: { gut: 28, mittel: 38, schlecht: 50 },
    materialaufwandsquote: { gut: 30, mittel: 42, schlecht: 55 },
    liquiditaet1: { gut: 35, mittel: 18, schlecht: 7 },
    liquiditaet2: { gut: 130, mittel: 95, schlecht: 65 },
    liquiditaet3: { gut: 190, mittel: 140, schlecht: 95 },
    dynamischer_verschuldungsgrad: { gut: 2.5, mittel: 4.5, schlecht: 7 },
    zinsdeckungsgrad: { gut: 6, mittel: 3, schlecht: 1.3 },
    schuldentilgungsdauer: { gut: 3.5, mittel: 6, schlecht: 10 }
  },

  "Handwerk": {
    eigenkapitalquote: { gut: 22, mittel: 14, schlecht: 7 },
    verschuldungsgrad: { gut: 200, mittel: 380, schlecht: 650 },
    anlagendeckung1: { gut: 70, mittel: 50, schlecht: 30 },
    anlagendeckung2: { gut: 110, mittel: 85, schlecht: 65 },
    umsatzrentabilitaet: { gut: 5, mittel: 2, schlecht: 0 },
    gesamtkapitalrentabilitaet: { gut: 9, mittel: 4, schlecht: 1 },
    ebitda_marge: { gut: 10, mittel: 5, schlecht: 2 },
    cashflow_rate: { gut: 7, mittel: 3, schlecht: 0.5 },
    personalaufwandsquote: { gut: 35, mittel: 48, schlecht: 60 },
    materialaufwandsquote: { gut: 30, mittel: 42, schlecht: 55 },
    liquiditaet1: { gut: 22, mittel: 10, schlecht: 3 },
    liquiditaet2: { gut: 100, mittel: 70, schlecht: 45 },
    liquiditaet3: { gut: 160, mittel: 115, schlecht: 80 },
    dynamischer_verschuldungsgrad: { gut: 3.5, mittel: 6, schlecht: 10 },
    zinsdeckungsgrad: { gut: 4, mittel: 2, schlecht: 1 },
    schuldentilgungsdauer: { gut: 5, mittel: 8, schlecht: 14 }
  },

  "Immobilien": {
    eigenkapitalquote: { gut: 25, mittel: 18, schlecht: 10 },
    verschuldungsgrad: { gut: 200, mittel: 400, schlecht: 700 },
    anlagendeckung1: { gut: 60, mittel: 45, schlecht: 30 },
    anlagendeckung2: { gut: 100, mittel: 85, schlecht: 65 },
    umsatzrentabilitaet: { gut: 15, mittel: 8, schlecht: 2 },
    gesamtkapitalrentabilitaet: { gut: 6, mittel: 3, schlecht: 1 },
    ebitda_marge: { gut: 40, mittel: 25, schlecht: 12 },
    cashflow_rate: { gut: 12, mittel: 6, schlecht: 2 },
    personalaufwandsquote: { gut: 8, mittel: 15, schlecht: 25 },
    materialaufwandsquote: { gut: 15, mittel: 25, schlecht: 40 },
    liquiditaet1: { gut: 20, mittel: 10, schlecht: 3 },
    liquiditaet2: { gut: 100, mittel: 70, schlecht: 40 },
    liquiditaet3: { gut: 150, mittel: 110, schlecht: 75 },
    dynamischer_verschuldungsgrad: { gut: 5, mittel: 10, schlecht: 18 },
    zinsdeckungsgrad: { gut: 3, mittel: 1.5, schlecht: 0.8 },
    schuldentilgungsdauer: { gut: 8, mittel: 15, schlecht: 25 }
  },

  "E-Commerce": {
    eigenkapitalquote: { gut: 28, mittel: 18, schlecht: 8 },
    verschuldungsgrad: { gut: 150, mittel: 300, schlecht: 550 },
    anlagendeckung1: { gut: 85, mittel: 65, schlecht: 40 },
    anlagendeckung2: { gut: 130, mittel: 105, schlecht: 80 },
    umsatzrentabilitaet: { gut: 4, mittel: 1.5, schlecht: -1 },
    gesamtkapitalrentabilitaet: { gut: 12, mittel: 6, schlecht: 1 },
    ebitda_marge: { gut: 8, mittel: 4, schlecht: 0 },
    cashflow_rate: { gut: 6, mittel: 3, schlecht: 0 },
    personalaufwandsquote: { gut: 15, mittel: 25, schlecht: 38 },
    materialaufwandsquote: { gut: 50, mittel: 62, schlecht: 75 },
    liquiditaet1: { gut: 35, mittel: 18, schlecht: 6 },
    liquiditaet2: { gut: 130, mittel: 95, schlecht: 60 },
    liquiditaet3: { gut: 180, mittel: 130, schlecht: 85 },
    dynamischer_verschuldungsgrad: { gut: 3, mittel: 5, schlecht: 9 },
    zinsdeckungsgrad: { gut: 5, mittel: 2.5, schlecht: 1 },
    schuldentilgungsdauer: { gut: 4, mittel: 7, schlecht: 12 }
  }
};

/**
 * Kennzahlen, bei denen ein niedrigerer Wert besser ist.
 * Bei diesen gilt: Wert <= gut -> gruen, <= mittel -> gelb, sonst rot.
 * Bei allen anderen Kennzahlen gilt: Wert >= gut -> gruen, >= mittel -> gelb, sonst rot.
 */
export const inverseKennzahlen = [
  "verschuldungsgrad",
  "dynamischer_verschuldungsgrad",
  "schuldentilgungsdauer",
  "personalaufwandsquote",
  "materialaufwandsquote"
];

/**
 * Labels und Einheiten fuer alle Kennzahlen
 */
export const kennzahlenMeta = {
  eigenkapitalquote: { label: "Eigenkapitalquote", einheit: "%", beschreibung: "Eigenkapital / Bilanzsumme x 100" },
  verschuldungsgrad: { label: "Verschuldungsgrad", einheit: "%", beschreibung: "Fremdkapital / Eigenkapital x 100" },
  anlagendeckung1: { label: "Anlagendeckung I", einheit: "%", beschreibung: "Eigenkapital / Anlagevermoegen x 100" },
  anlagendeckung2: { label: "Anlagendeckung II", einheit: "%", beschreibung: "(Eigenkapital + langfr. FK) / Anlagevermoegen x 100" },
  umsatzrentabilitaet: { label: "Umsatzrentabilitaet", einheit: "%", beschreibung: "Jahresueberschuss / Umsatzerloese x 100" },
  gesamtkapitalrentabilitaet: { label: "Gesamtkapitalrentabilitaet", einheit: "%", beschreibung: "(Jahresueberschuss + Zinsaufwand) / Bilanzsumme x 100" },
  ebitda_marge: { label: "EBITDA-Marge", einheit: "%", beschreibung: "EBITDA / Umsatzerloese x 100" },
  cashflow_rate: { label: "Cashflow-Rate", einheit: "%", beschreibung: "Operativer Cashflow / Umsatzerloese x 100" },
  personalaufwandsquote: { label: "Personalaufwandsquote", einheit: "%", beschreibung: "Personalaufwand / Gesamtleistung x 100" },
  materialaufwandsquote: { label: "Materialaufwandsquote", einheit: "%", beschreibung: "Materialaufwand / Gesamtleistung x 100" },
  liquiditaet1: { label: "Liquiditaet 1. Grades", einheit: "%", beschreibung: "Fluessige Mittel / kurzfr. Verbindlichkeiten x 100" },
  liquiditaet2: { label: "Liquiditaet 2. Grades", einheit: "%", beschreibung: "(Fluessige Mittel + kurzfr. Forderungen) / kurzfr. Verbindlichkeiten x 100" },
  liquiditaet3: { label: "Liquiditaet 3. Grades", einheit: "%", beschreibung: "Umlaufvermoegen / kurzfr. Verbindlichkeiten x 100" },
  dynamischer_verschuldungsgrad: { label: "Dynamischer Verschuldungsgrad", einheit: "Jahre", beschreibung: "Effektivverschuldung / operativer Cashflow" },
  zinsdeckungsgrad: { label: "Zinsdeckungsgrad", einheit: "x", beschreibung: "EBIT / Zinsaufwand" },
  schuldentilgungsdauer: { label: "Schuldentilgungsdauer", einheit: "Jahre", beschreibung: "Nettoverschuldung / bereinigter Cashflow" }
};

/**
 * Verfuegbare Branchen
 */
export const verfuegbareBranchen = Object.keys(branchBenchmarks);
