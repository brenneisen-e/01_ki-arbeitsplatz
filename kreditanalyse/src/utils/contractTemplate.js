// =============================================================================
// Shared Contract Template Logic
// Fills the LMA template with actual company/credit data
// =============================================================================

import { formatCurrency } from './formatters';
import {
  calculateAllRatios,
} from './financialCalculations';
import {
  calculateQuantitativeRating,
  calculateOverallRating,
  calculateAccountRating,
  calculateOwnerRating,
  scoreToRatingClass,
} from './ratingEngine';
import { haircutRates } from '../data/haircutRates';
import { LMA_TEMPLATE_STRUCTURE } from '../data/lmaTemplate';

function numberToWords(n) {
  const ones = ['', 'eins', 'zwei', 'drei', 'vier', 'fünf', 'sechs', 'sieben', 'acht', 'neun'];
  if (n >= 1000000) {
    const mio = Math.floor(n / 1000000);
    const rest = n % 1000000;
    return `${ones[mio] || mio} Millionen${rest > 0 ? ` ${numberToWords(rest)}` : ''}`;
  }
  if (n >= 1000) {
    const tsd = Math.floor(n / 1000);
    const rest = n % 1000;
    return `${tsd > 1 ? (ones[tsd] || String(tsd)) + 'tausend' : 'eintausend'}${rest > 0 ? ` ${numberToWords(rest)}` : ''}`;
  }
  return String(n);
}

/**
 * Fill the LMA contract template with actual company data.
 * @param {object} company - Company object with all credit data
 * @returns {string} Filled contract text
 */
export function fillContractTemplate(company) {
  const kredit = company.kredit || {};
  const betrag = kredit.betrag || 0;
  const laufzeit = kredit.laufzeit || 60;
  const bilanz = company.bilanz || {};
  const years = Object.keys(bilanz).map(Number).sort();
  const latestYear = years[years.length - 1] || 2023;
  const b23 = bilanz[latestYear] || {};

  const ratios = calculateAllRatios(b23);
  const quantRating = calculateQuantitativeRating(ratios, company.branche);
  const accountScore = company.konto ? calculateAccountRating(company.konto) : 3;
  let ownerAdj = 0;
  if (company.schufa && company.creditreform_index) {
    const ownerScore = calculateOwnerRating(company.schufa, company.creditreform_index);
    ownerAdj = ownerScore > 3 ? 0.3 : ownerScore < 2 ? -0.2 : 0;
  }
  const overallScore = calculateOverallRating({
    quantitativeScore: quantRating.score,
    qualitativeScore: 2.5,
    accountScore,
    ownerAdjustment: ownerAdj,
  });

  const kundenZins = 5.10;
  const effektivZins = kundenZins + 0.12;
  const monatlicheRate = betrag > 0
    ? (betrag * (kundenZins / 100 / 12)) / (1 - Math.pow(1 + kundenZins / 100 / 12, -laufzeit))
    : 0;

  const sicherheiten = company.sicherheiten || [];
  const getHaircut = (art) => {
    const entry = Object.values(haircutRates).find(
      (h) => art.toLowerCase().includes(h.label?.toLowerCase().split(' ')[0] || '___')
    );
    return entry?.standard || 50;
  };
  const sichBewertung = sicherheiten.map((s) => {
    const haircut = getHaircut(s.art);
    const beleihungswert = Math.round(s.wert * (1 - haircut / 100));
    return { ...s, haircut, beleihungswert };
  });

  const kreditgeber = {
    name: 'Musterbank AG',
    adresse: 'Musterstraße 1, 50667 Köln',
    vorstand: 'Dr. Maria Schmidt, Thomas Berger',
  };
  const adresse = company.adresse || {};
  const gfNames = (company.gf || [])
    .map((g) => `${g.name} (${g.funktion}, ${g.anteil}%)`)
    .join('\n');
  const gfNamenKurz = (company.gf || []).map((g) => g.name).join(', ');
  const tilgungsfreiMonate = kredit.tilgungsfrei || 0;
  const tilgungsfreiText =
    tilgungsfreiMonate > 0
      ? `Die ersten ${tilgungsfreiMonate} Monate sind tilgungsfrei. Während der tilgungsfreien Zeit sind lediglich die anfallenden Zinsen zu entrichten.`
      : 'Es wurde keine tilgungsfreie Anlaufzeit vereinbart.';
  const auszahlungsDatum = kredit.auszahlung || new Date().toISOString().slice(0, 10);
  const endDatum = new Date(auszahlungsDatum);
  endDatum.setMonth(endDatum.getMonth() + laufzeit);
  const endDatumStr = endDatum.toLocaleDateString('de-DE');
  const ersteRate = new Date(auszahlungsDatum);
  ersteRate.setMonth(ersteRate.getMonth() + 1 + tilgungsfreiMonate);
  const bereitstellungAb = new Date(auszahlungsDatum);
  bereitstellungAb.setMonth(bereitstellungAb.getMonth() - 1);

  const covenantEkQuote = Math.max(20, Math.round((ratios.eigenkapitalquote || 25) - 5));
  const covenantVerschuldung = Math.min(
    6,
    Math.round((ratios.dynamischer_verschuldungsgrad || 4) + 1)
  );

  const sichTabelle = sichBewertung
    .map(
      (s, i) =>
        `${i + 1}. ${s.art}\n   Bezeichnung: ${s.bezeichnung}\n   Marktwert: ${formatCurrency(s.wert)}\n   Beleihungswert: ${formatCurrency(s.beleihungswert)}\n   Rang: ${s.rang}. Rang`
    )
    .join('\n\n');

  const sichAnlage = sichBewertung
    .map(
      (s, i) =>
        `Sicherheit ${i + 1}:\nArt: ${s.art}\nBezeichnung: ${s.bezeichnung}\nMarktwert: ${formatCurrency(s.wert)}\nHaircut: ${s.haircut}%\nBeleihungswert: ${formatCurrency(s.beleihungswert)}\nRang: ${s.rang}. Rang\nBewertung: ${s.bewertung || '–'}\nDatum: ${s.datum ? new Date(s.datum).toLocaleDateString('de-DE') : '–'}`
    )
    .join('\n\n');

  const sicherheitenBeschreibung = sichBewertung
    .map((s) => `${s.art} (${s.bezeichnung})`)
    .join(', ');
  const eigenanteil = formatCurrency(Math.round(betrag * 0.2));
  const investitionssumme = formatCurrency(Math.round(betrag * 1.2));

  let text = LMA_TEMPLATE_STRUCTURE;
  const replacements = {
    '{{KREDITNEHMER_FIRMA}}': company.firma,
    '{{KREDITNEHMER_RECHTSFORM}}': company.rechtsform || '–',
    '{{KREDITNEHMER_AMTSGERICHT}}': company.amtsgericht || 'Amtsgericht',
    '{{KREDITNEHMER_HRB}}': company.hrb || '–',
    '{{KREDITNEHMER_ADRESSE}}': `${adresse.strasse || ''}, ${adresse.plz || ''} ${adresse.ort || ''}`,
    '{{KREDITNEHMER_ORT}}': adresse.ort || '–',
    '{{KREDITNEHMER_GRUENDUNG}}': String(company.gruendung || '–'),
    '{{KREDITNEHMER_GF}}': gfNames,
    '{{KREDITNEHMER_GF_NAMEN}}': gfNamenKurz,
    '{{KREDITGEBER_NAME}}': kreditgeber.name,
    '{{KREDITGEBER_ADRESSE}}': kreditgeber.adresse,
    '{{KREDITGEBER_VORSTAND}}': kreditgeber.vorstand,
    '{{KREDITBETRAG}}': formatCurrency(betrag),
    '{{KREDITBETRAG_WORT}}': numberToWords(betrag),
    '{{VERWENDUNGSZWECK}}': kredit.verwendung || kredit.art || '–',
    '{{LAUFZEIT}}': String(laufzeit),
    '{{ENDDATUM}}': endDatumStr,
    '{{SOLLZINS}}': kundenZins.toFixed(2),
    '{{EFFEKTIVZINS}}': effektivZins.toFixed(2),
    '{{MONATLICHE_RATE}}': formatCurrency(Math.round(monatlicheRate)),
    '{{AUSZAHLUNGSDATUM}}': new Date(auszahlungsDatum).toLocaleDateString('de-DE'),
    '{{ERSTE_RATE}}': ersteRate.toLocaleDateString('de-DE'),
    '{{TILGUNGSFREI_TEXT}}': tilgungsfreiText,
    '{{BEREITSTELLUNG_AB}}': bereitstellungAb.toLocaleDateString('de-DE'),
    '{{BEREITSTELLUNGSPROVISION}}': '0,25',
    '{{EIGENANTEIL}}': eigenanteil,
    '{{INVESTITIONSSUMME}}': investitionssumme,
    '{{SICHERHEITEN_BESCHREIBUNG}}': sicherheitenBeschreibung,
    '{{SICHERHEITEN_TABELLE}}': sichTabelle,
    '{{SICHERHEITEN_ANLAGE}}': sichAnlage,
    '{{COVENANT_EK_QUOTE}}': String(covenantEkQuote),
    '{{COVENANT_VERSCHULDUNG}}': String(covenantVerschuldung),
    '{{GERICHTSSTAND}}': adresse.ort || 'Köln',
    '{{ORT}}': adresse.ort || 'Köln',
    '{{DATUM}}': new Date().toLocaleDateString('de-DE'),
  };

  for (const [placeholder, value] of Object.entries(replacements)) {
    text = text.replaceAll(placeholder, value);
  }

  return text.trim();
}
