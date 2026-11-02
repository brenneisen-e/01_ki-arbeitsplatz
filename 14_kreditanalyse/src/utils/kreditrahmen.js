/**
 * Kreditrahmen -- KI-Vorschlag für den maximal darstellbaren Kreditbetrag.
 *
 * Grundlage sind die Jahresabschlüsse (Bilanz und GuV 2021 bis 2023), das
 * Gesamtrating (dieselbe Rechnung wie Schritt 4, `ermittleGesamtrating`) und
 * die bestehenden Verbindlichkeiten. Drei bankübliche Grenzen, die kleinste
 * bestimmt den Vorschlag:
 *
 *  1. Kapitaldienstfähigkeit: nachhaltiger Cashflow vor Zinsen geteilt durch
 *     die Mindest-Deckung (DSCR) der Ratingstufe, abzüglich des bestehenden
 *     Kapitaldienstes; der freie Kapitaldienst trägt eine Annuität über die
 *     Laufzeit zum Kalkulationszins.
 *  2. Verschuldung: dynamischer Verschuldungsgrad (Nettoverschuldung zu
 *     EBITDA) nach dem neuen Kredit höchstens so hoch wie die Obergrenze der
 *     Ratingstufe.
 *  3. Eigenkapital: Eigenkapitalquote nach Bilanzverlängerung durch den
 *     neuen Kredit mindestens so hoch wie die Mindestquote der Ratingstufe.
 *
 * Alles deterministisch und nachvollziehbar -- jede Zahl erscheint in der
 * Herleitung der Oberfläche.
 */

import { getBilanzsumme, getEBITDA, getNettoverschuldung } from './financialCalculations';
import { ermittleGesamtrating, resolveBranche } from './ratingEngine';
import { branchBenchmarks } from '../data/branchBenchmarks';

// Ratingstufen: je schlechter das Rating, desto strenger die Grenzen. Die
// Obergrenze für den dynamischen Verschuldungsgrad und die Mindest-EK-Quote
// richten sich nach dem Branchen-Benchmark (derselbe wie im Rating): eine
// Immobiliengesellschaft trägt mehr Verschuldung als ein IT-Dienstleister.
//   vs: Lage zwischen den Benchmark-Werten (1 = "mittel", 2 = "schlecht")
//   ek: Lage zwischen "schlecht" (0) und "mittel" (1) der EK-Quote
export const RATING_STUFEN = [
  { bis: 2.3, name: 'sehr gute Bonität', dscr: 1.2, vs: 1.5, ek: 0 },
  { bis: 3.3, name: 'gute Bonität', dscr: 1.25, vs: 1.25, ek: 0.25 },
  { bis: 3.9, name: 'mittlere Bonität', dscr: 1.35, vs: 1, ek: 0.5 },
  { bis: 4.8, name: 'erhöhtes Risiko', dscr: 1.5, vs: 0.5, ek: 0.75 },
  { bis: Infinity, name: 'hohes Risiko', dscr: 1.75, vs: 0, ek: 1 },
];

// Ohne passenden Branchen-Benchmark
const BENCHMARK_STANDARD = {
  dynamischer_verschuldungsgrad: { gut: 3, mittel: 5, schlecht: 8 },
  eigenkapitalquote: { gut: 30, mittel: 20, schlecht: 10 },
};

/** Grenzwerte einer Stufe für eine Branche */
const grenzwerte = (stufe, branche) => {
  const bm = branchBenchmarks[resolveBranche(branche)] || {};
  const vs = bm.dynamischer_verschuldungsgrad || BENCHMARK_STANDARD.dynamischer_verschuldungsgrad;
  const ek = bm.eigenkapitalquote || BENCHMARK_STANDARD.eigenkapitalquote;
  // vs-Lage: 0 = gut, 1 = mittel, 2 = schlecht (linear dazwischen)
  const dynVg = stufe.vs <= 1
    ? vs.gut + (vs.mittel - vs.gut) * stufe.vs
    : vs.mittel + (vs.schlecht - vs.mittel) * (stufe.vs - 1);
  const ekMin = ek.schlecht + (ek.mittel - ek.schlecht) * stufe.ek;
  return { dynVg: Math.round(dynVg * 10) / 10, ekMin: Math.round(ekMin * 10) / 10, benchmark: !!bm.dynamischer_verschuldungsgrad };
};

// Kalkulationszins wie in der Konditionierung der Kreditempfehlung:
// Refinanzierung + Liquidität + Standardrisiko (PD × LGD 45 %) + EK-Kosten
// + Betriebskosten + Marge
const ZINS_BASIS = 3.2 + 0.15 + 0.45 + 0.5 + 0.3;
const LGD = 0.45;

const JAHRE = [2023, 2022, 2021];
const GEWICHTE = [3, 2, 1];

const zahl = (v) => {
  if (v == null || v === '') return 0;
  if (typeof v === 'number') return Number.isFinite(v) ? v : 0;
  const n = parseFloat(String(v).replace(/\./g, '').replace(',', '.'));
  return Number.isFinite(n) ? n : 0;
};

/** Barwert einer monatlichen Rate über n Monate zum Jahreszins z (in %) */
const barwert = (rateMonat, monate, zinsPa) => {
  const i = zinsPa / 100 / 12;
  if (monate <= 0 || rateMonat <= 0) return 0;
  return i === 0 ? rateMonat * monate : rateMonat * (1 - (1 + i) ** -monate) / i;
};

/** Monatsrate einer Annuität für Betrag P über n Monate */
export const annuitaetMonat = (betrag, monate, zinsPa) => {
  const i = zinsPa / 100 / 12;
  if (monate <= 0) return 0;
  return i === 0 ? betrag / monate : betrag * i / (1 - (1 + i) ** -monate);
};

/** Cashflow vor Zinsen eines Jahres: Jahresüberschuss + Abschreibungen + Zinsaufwand */
const cashflowVorZinsen = (b) => zahl(b.jahresueberschuss) + zahl(b.abschreibungen) + zahl(b.zinsaufwand);

/** Gewichteter Durchschnitt 3:2:1, höchstens der Wert des letzten Jahres (vorsichtig) */
const nachhaltig = (bilanz, fn) => {
  const werte = JAHRE.map((j, k) => (bilanz[j] ? { jahr: j, wert: fn(bilanz[j]), gewicht: GEWICHTE[k] } : null)).filter(Boolean);
  if (!werte.length) return { werte: [], wert: 0 };
  const summeG = werte.reduce((a, w) => a + w.gewicht, 0);
  const schnitt = werte.reduce((a, w) => a + w.wert * w.gewicht, 0) / summeG;
  return { werte, schnitt, wert: Math.min(schnitt, werte[0].wert), gedeckelt: werte[0].wert < schnitt };
};

/** Bestehender Kapitaldienst p. a. aus der Liste der Verbindlichkeiten */
const bestehenderKapitaldienst = (verbindlichkeiten, b) => {
  const zeilen = (verbindlichkeiten || []).filter((v) => zahl(v.restschuld) > 0 || zahl(v.rate) > 0);
  if (zeilen.length) {
    const posten = zeilen.map((v) => {
      const rate = zahl(v.rate);
      const zins = zahl(v.zins ?? v.zinssatz);
      const rest = zahl(v.restschuld);
      // Kontokorrent ohne Tilgung: nur die Zinsen belasten den Kapitaldienst
      const jahr = rate > 0 ? rate * 12 : rest * zins / 100;
      return { name: v.glaeubiger || v.art || v.kreditart || 'Verbindlichkeit', art: v.art || v.kreditart || '', jahr };
    });
    return { summe: posten.reduce((a, p) => a + p.jahr, 0), posten, geschaetzt: false };
  }
  // Keine Liste erfasst: aus der Bilanz schätzen (Zinsaufwand + 15 % Tilgung auf langfristige Verbindlichkeiten)
  const summe = zahl(b.zinsaufwand) + zahl(b.verb_lang) * 0.15;
  return { summe, posten: [], geschaetzt: true };
};

const abrunden = (v) => {
  if (v <= 0) return 0;
  const schritt = v >= 1_000_000 ? 50_000 : v >= 100_000 ? 10_000 : 5_000;
  return Math.floor(v / schritt) * schritt;
};

/**
 * @param {object} company   Vorgang mit bilanz, branche, konto, schufa, gf …
 * @param {object} eingabe   { betrag, laufzeit, tilgungsfrei, verbindlichkeiten }
 */
export function berechneKreditrahmen(company, eingabe = {}) {
  const bilanz = company?.bilanz || {};
  const b = bilanz[2023];
  if (!b || !zahl(b.eigenkapital)) return null;

  const rating = ermittleGesamtrating(company);
  if (!rating) return null;
  const stufeBasis = RATING_STUFEN.find((s) => rating.score <= s.bis);
  const stufe = { ...stufeBasis, ...grenzwerte(stufeBasis, company.branche) };
  const zins = Math.round((ZINS_BASIS + rating.pd * LGD) * 100) / 100;

  const laufzeit = Math.max(12, Math.round(zahl(eingabe.laufzeit)) || 60);
  const tilgungsfrei = Math.min(Math.max(0, Math.round(zahl(eingabe.tilgungsfrei))), laufzeit - 12);
  const tilgungsMonate = laufzeit - tilgungsfrei;

  // 1. Kapitaldienstfähigkeit
  const cf = nachhaltig(bilanz, cashflowVorZinsen);
  const bestand = bestehenderKapitaldienst(eingabe.verbindlichkeiten ?? company.bestehende_verbindlichkeiten, b);
  const kdTragbar = cf.wert / stufe.dscr;
  const freierKd = Math.max(0, kdTragbar - bestand.summe);
  const grenzeKd = barwert(freierKd / 12, tilgungsMonate, zins);

  // 2. Verschuldung
  const ebitda = nachhaltig(bilanz, getEBITDA);
  const nettoVs = getNettoverschuldung(b);
  const grenzeVs = Math.max(0, stufe.dynVg * ebitda.wert - nettoVs);

  // 3. Eigenkapital
  const ek = zahl(b.eigenkapital);
  const bilanzsumme = getBilanzsumme(b);
  const grenzeEk = Math.max(0, ek / (stufe.ekMin / 100) - bilanzsumme);

  const kriterien = [
    {
      key: 'kapitaldienst',
      label: 'Kapitaldienstfähigkeit',
      grenze: grenzeKd,
      regel: `DSCR mindestens ${stufe.dscr.toFixed(2).replace('.', ',')}`,
    },
    {
      key: 'verschuldung',
      label: 'Verschuldungsgrenze',
      grenze: grenzeVs,
      regel: `dyn. Verschuldungsgrad höchstens ${String(stufe.dynVg).replace('.', ',')} Jahre${stufe.benchmark ? ' (Branche)' : ''}`,
    },
    {
      key: 'eigenkapital',
      label: 'Eigenkapitalquote',
      grenze: grenzeEk,
      regel: `EK-Quote nach Kredit mindestens ${String(stufe.ekMin).replace('.', ',')} %${stufe.benchmark ? ' (Branche)' : ''}`,
    },
  ];
  const bindend = kriterien.reduce((m, k) => (k.grenze < m.grenze ? k : m), kriterien[0]);
  const max = abrunden(bindend.grenze);

  // Beantragter Betrag im Verhältnis
  const beantragt = Math.max(0, zahl(eingabe.betrag));
  const auslastung = max > 0 ? beantragt / max : beantragt > 0 ? Infinity : 0;
  const status = !beantragt ? 'offen' : auslastung <= 0.9 ? 'im-rahmen' : auslastung <= 1 ? 'am-limit' : 'ueber';

  // Wie lange müsste die Laufzeit sein, damit der Kapitaldienst den
  // beantragten Betrag trägt (nur sinnvoll, wenn die anderen Grenzen passen)?
  let laufzeitFuerBeantragt = null;
  if (status === 'ueber' && bindend.key === 'kapitaldienst' && beantragt <= Math.min(grenzeVs, grenzeEk) && freierKd > 0) {
    const i = zins / 100 / 12;
    const rate = freierKd / 12;
    if (beantragt * i < rate) {
      const n = Math.ceil(-Math.log(1 - beantragt * i / rate) / Math.log(1 + i)) + tilgungsfrei;
      if (n <= 240) laufzeitFuerBeantragt = n;
    }
  }

  // Kapitaldienst und DSCR mit dem beantragten Betrag
  const rateBeantragt = beantragt ? annuitaetMonat(beantragt, tilgungsMonate, zins) * 12 : 0;
  const dscrBeantragt = beantragt ? cf.wert / (bestand.summe + rateBeantragt) : null;

  return {
    rating: { ...rating, stufe },
    zins,
    laufzeit,
    tilgungsfrei,
    cashflow: cf,
    ebitda,
    bestand,
    kdTragbar,
    freierKd,
    nettoVerschuldung: nettoVs,
    eigenkapital: ek,
    bilanzsumme,
    kriterien,
    bindend,
    max,
    beantragt,
    auslastung,
    status,
    laufzeitFuerBeantragt,
    rateBeantragt,
    dscrBeantragt,
    rateMax: annuitaetMonat(max, tilgungsMonate, zins),
  };
}
