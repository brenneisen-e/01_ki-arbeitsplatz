// Helper to safely divide
const safeDiv = (a, b) => (b && b !== 0) ? a / b : null;

// Derived values
export const getBilanzsumme = (b) => (b.immateriell || 0) + (b.sachanlagen || 0) + (b.finanzanlagen || 0) + (b.vorraete || 0) + (b.forderungen || 0) + (b.liquide || 0);
export const getAnlagevermoegen = (b) => (b.immateriell || 0) + (b.sachanlagen || 0) + (b.finanzanlagen || 0);
export const getUmlaufvermoegen = (b) => (b.vorraete || 0) + (b.forderungen || 0) + (b.liquide || 0);
export const getFremdkapital = (b) => (b.verb_kurz || 0) + (b.verb_lang || 0) + (b.rueckstellungen || 0);
export const getGesamtleistung = (b) => (b.umsatz || 0) + (b.sonstige_ertraege || 0);
export const getEBITDA = (b) => (b.jahresueberschuss || 0) + (b.steuern || 0) + (b.zinsaufwand || 0) + (b.abschreibungen || 0);
export const getEBIT = (b) => (b.jahresueberschuss || 0) + (b.steuern || 0) + (b.zinsaufwand || 0);
export const getNettoverschuldung = (b) => (b.verb_kurz || 0) + (b.verb_lang || 0) - (b.liquide || 0);
export const getOperativerCashflow = (b) => (b.jahresueberschuss || 0) + (b.abschreibungen || 0); // simplified

// Vermögens-/Kapitalstruktur (all return percentages)
export const eigenkapitalquote = (b) => safeDiv(b.eigenkapital, getBilanzsumme(b)) * 100;
export const verschuldungsgrad = (b) => safeDiv(getFremdkapital(b), b.eigenkapital) * 100;
export const anlagendeckung1 = (b) => safeDiv(b.eigenkapital, getAnlagevermoegen(b)) * 100;
export const anlagendeckung2 = (b) => safeDiv(b.eigenkapital + (b.verb_lang || 0), getAnlagevermoegen(b)) * 100;
export const anlagenintensitaet = (b) => safeDiv(getAnlagevermoegen(b), getBilanzsumme(b)) * 100;

// Ertragskraft
export const umsatzrentabilitaet = (b) => safeDiv(b.jahresueberschuss, b.umsatz) * 100;
export const gesamtkapitalrentabilitaet = (b) => safeDiv(b.jahresueberschuss + (b.zinsaufwand || 0), getBilanzsumme(b)) * 100;
export const ebitdaMarge = (b) => safeDiv(getEBITDA(b), b.umsatz) * 100;
export const cashflowRate = (b) => safeDiv(getOperativerCashflow(b), b.umsatz) * 100;
export const personalaufwandsquote = (b) => safeDiv(b.personalaufwand, getGesamtleistung(b)) * 100;
export const materialaufwandsquote = (b) => safeDiv(b.materialaufwand, getGesamtleistung(b)) * 100;

// Liquidität
export const liquiditaet1 = (b) => safeDiv(b.liquide, b.verb_kurz) * 100;
export const liquiditaet2 = (b) => safeDiv((b.liquide || 0) + (b.forderungen || 0), b.verb_kurz) * 100;
export const liquiditaet3 = (b) => safeDiv(getUmlaufvermoegen(b), b.verb_kurz) * 100;
export const workingCapital = (b) => getUmlaufvermoegen(b) - (b.verb_kurz || 0);

// Entschuldungsfähigkeit
export const dynamischerVerschuldungsgrad = (b) => safeDiv(getNettoverschuldung(b), getEBITDA(b));
export const zinsdeckungsgrad = (b) => safeDiv(getEBIT(b), b.zinsaufwand);
export const schuldentilgungsdauer = (b) => safeDiv(getNettoverschuldung(b), getOperativerCashflow(b));

// Convenience: calculate all ratios for a year
export const calculateAllRatios = (b) => ({
  eigenkapitalquote: eigenkapitalquote(b),
  verschuldungsgrad: verschuldungsgrad(b),
  anlagendeckung1: anlagendeckung1(b),
  anlagendeckung2: anlagendeckung2(b),
  anlagenintensitaet: anlagenintensitaet(b),
  umsatzrentabilitaet: umsatzrentabilitaet(b),
  gesamtkapitalrentabilitaet: gesamtkapitalrentabilitaet(b),
  ebitda_marge: ebitdaMarge(b),
  cashflow_rate: cashflowRate(b),
  personalaufwandsquote: personalaufwandsquote(b),
  materialaufwandsquote: materialaufwandsquote(b),
  liquiditaet1: liquiditaet1(b),
  liquiditaet2: liquiditaet2(b),
  liquiditaet3: liquiditaet3(b),
  working_capital: workingCapital(b),
  dynamischer_verschuldungsgrad: dynamischerVerschuldungsgrad(b),
  zinsdeckungsgrad: zinsdeckungsgrad(b),
  schuldentilgungsdauer: schuldentilgungsdauer(b),
  bilanzsumme: getBilanzsumme(b),
  anlagevermoegen: getAnlagevermoegen(b),
  umlaufvermoegen: getUmlaufvermoegen(b),
  fremdkapital: getFremdkapital(b),
  ebitda: getEBITDA(b),
  ebit: getEBIT(b),
  nettoverschuldung: getNettoverschuldung(b),
  operativer_cashflow: getOperativerCashflow(b)
});

// Change percentage between two values
export const changePercent = (current, previous) => {
  if (!previous || previous === 0) return null;
  return ((current - previous) / Math.abs(previous)) * 100;
};
