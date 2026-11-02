// ─── VV Data Provider ────────────────────────────────────────────────────────
// Adapts raw vvExtended.js data to match component expectations and generates
// synthetic data for mandants not in the showcase set (W1-W5).
//
// Uses Proxy to transparently provide data for any VV/WM ID.

import {
  VV_PERFORMANCE as RAW_PERF,
  VV_WPHG as RAW_WPHG,
  VV_FAMILIE as RAW_FAMI,
  VV_ENGAGEMENT as RAW_ENG,
} from './vvExtended';
import { getLang } from '../utils/langHelper';

// ─── Simple seeded PRNG (hash-based) ────────────────────────────────────────
function hashSeed(str) {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = (Math.imul(31, h) + str.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
}

function makePrng(id) {
  let s = hashSeed(id + '_vvdata');
  return function next() {
    s |= 0;
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function rng(prng, min, max) {
  return min + prng() * (max - min);
}

function rngInt(prng, min, max) {
  return Math.floor(rng(prng, min, max + 1));
}

function pick(prng, arr) {
  return arr[Math.floor(prng() * arr.length)];
}

function round1(v) {
  return Math.round(v * 10) / 10;
}

function round2(v) {
  return Math.round(v * 100) / 100;
}

// ─── MONTHS helper ──────────────────────────────────────────────────────────
const MONTH_NAMES_DE = ['Jan', 'Feb', 'Mär', 'Apr', 'Mai', 'Jun', 'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Dez'];
const MONTH_NAMES_EN = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
function getMonthNames() {
  return getLang() === 'en' ? MONTH_NAMES_EN : MONTH_NAMES_DE;
}

function generateMonthly(prng, years = 3) {
  const result = [];
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth(); // 0-based
  const startYear = currentYear - years;
  for (let y = startYear; y <= currentYear; y++) {
    const maxMonth = y === currentYear ? currentMonth : 11;
    for (let m = 0; m <= maxMonth; m++) {
      // Upward bias: mostly positive returns with occasional small dips
      const trend = 0.5; // positive drift
      const noise = rng(prng, -1.8, 2.2);
      const pf = round1(trend + noise);
      // Benchmark slightly underperforms portfolio on average
      const bm = round1(pf - rng(prng, 0.0, 0.6));
      result.push({ monat: `${getMonthNames()[m]} ${y}`, portfolio: pf, benchmark: bm });
    }
  }
  return result;
}

// ─── TRANSFORM: VV_PERFORMANCE ──────────────────────────────────────────────

function transformPerformance(raw) {
  if (!raw) return null;
  // Map monthlyReturns → monthly
  // Names already include year (e.g. 'Jan 2023'), so use directly
  const baseMonthly = (raw.monthlyReturns || []).map((m) => ({
    monat: m.name,
    portfolio: m.portfolio,
    benchmark: m.benchmark,
  }));

  // Find last year in data to extend from there
  const lastEntry = baseMonthly[baseMonthly.length - 1];
  const lastYearInData = lastEntry ? parseInt(lastEntry.monat.split(' ')[1]) : 2025;

  // Extend with months after the last data entry up to current month
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth(); // 0-based
  const prng = makePrng((raw.ioComment || 'default') + '_extend');
  for (let y = lastYearInData + 1; y <= currentYear; y++) {
    const maxMonth = y === currentYear ? currentMonth : 11;
    for (let m = 0; m <= maxMonth; m++) {
      const pf = round1(0.3 + rng(prng, -2.5, 3.0));
      const bm = round1(pf - rng(prng, 0.1, 0.8));
      baseMonthly.push({ monat: `${getMonthNames()[m]} ${y}`, portfolio: pf, benchmark: bm });
    }
  }
  const monthly = baseMonthly;

  // Pass through deposit events
  const einzahlungen = raw.einzahlungen || [];

  // Map sectors → sektoren (value → anteil)
  const sektoren = (raw.sectors || []).map(s => ({ name: s.name, anteil: s.value }));

  // Map regions → regionen (value → anteil)
  const regionen = (raw.regions || []).map(r => ({ name: r.name, anteil: r.value }));

  // Map riskMetrics → risiko
  const rm = raw.riskMetrics || {};
  const risiko = {
    volatilitaet: rm.volatilitaet,
    maxDrawdown: rm.maxDrawdown,
    sharpeRatio: rm.sharpe || rm.sharpeRatio,
    beta: rm.beta || 0.95,
    benchmarkVola: rm.benchmarkVola || (rm.volatilitaet ? round1(rm.volatilitaet * 1.1) : null),
  };

  // Map bonds → anleihen (restructure into laufzeiten + metrics)
  const bonds = raw.bonds || [];
  const anleihen = {
    laufzeiten: bonds.map(b => ({ name: b.name, anteil: b.value })),
    duration: 4.8,
    ytm: 3.2,
    rating: { ig: 65, bbb: 20, subig: 15 },
  };

  // Map currencies → waehrungen (value → anteil)
  const waehrungen = (raw.currencies || []).map(c => ({ name: c.name, anteil: c.value }));

  // Map ioComment (string) → ioKommentar (object)
  const ioKommentar = raw.ioComment ? {
    datum: '28.02.2025',
    autor: 'Dr. M. Fischer, CIO',
    text: raw.ioComment,
    naechsterReview: '31.05.2025',
  } : null;

  return {
    monthly,
    einzahlungen,
    allocation: raw.allocation,
    sollAllocation: raw.targetAllocation || raw.sollAllocation,
    sektoren,
    regionen,
    risiko,
    anleihen,
    waehrungen,
    hedgingQuote: 45,
    ioKommentar,
    esg: { score: 72, sfdr: 'Art. 8', co2: 42 },
    kosten: { quote: 1.15, betrag: 28500, jahr: 2024 },
    verlustschwelle: { schwelle: -10, aktuell: -5.4, hoechststandDatum: '15.01.2026', grenze: -10 },
  };
}

function generatePerformance(id) {
  const prng = makePrng(id + '_perf');
  const aktienPct = rngInt(prng, 30, 65);
  const anleihenPct = rngInt(prng, 15, 40);
  const altPct = rngInt(prng, 5, 20);
  const rest = 100 - aktienPct - anleihenPct - altPct;
  const cashPct = Math.max(0, Math.floor(rest / 2));
  const immoPct = Math.max(0, rest - cashPct);

  const allocation = { aktien: aktienPct, anleihen: anleihenPct, alternative: altPct, cash: cashPct, immofonds: immoPct };
  const sollAllocation = {
    aktien: aktienPct + rngInt(prng, -3, 3),
    anleihen: anleihenPct + rngInt(prng, -3, 3),
    alternative: altPct,
    cash: cashPct,
    immofonds: immoPct,
  };

  const lang = getLang();
  const sektorNames = lang === 'en' ? ['Technology', 'Healthcare', 'Financials', 'Industrials', 'Consumer', 'Energy', 'Utilities', 'Materials'] : ['Technologie', 'Healthcare', 'Finanzen', 'Industrie', 'Konsum', 'Energie', 'Versorger', 'Grundstoffe'];
  const sektoren = sektorNames.map(name => ({ name, anteil: rngInt(prng, 4, 22) }));

  const regionNames = lang === 'en' ? ['Europe', 'North America', 'Asia-Pacific', 'Emerging Markets', 'Other'] : ['Europa', 'Nordamerika', 'Asien-Pazifik', 'Schwellenländer', 'Sonstige'];
  const regionen = regionNames.map(name => ({ name, anteil: rngInt(prng, 5, 45) }));

  const volatilitaet = round1(rng(prng, 5, 15));
  const risiko = {
    volatilitaet,
    maxDrawdown: round1(rng(prng, -12, -3)),
    sharpeRatio: round2(rng(prng, 0.5, 1.8)),
    beta: round2(rng(prng, 0.7, 1.2)),
    benchmarkVola: round1(volatilitaet * rng(prng, 0.9, 1.2)),
  };

  const bondNames = lang === 'en' ? ['Investment Grade', 'High Yield', 'Government Bonds', 'Covered Bonds', 'Emerging Markets'] : ['Investment Grade', 'High Yield', 'Staatsanleihen', 'Pfandbriefe', 'Emerging Markets'];
  const anleihen = {
    laufzeiten: bondNames.map(name => ({ name, anteil: rngInt(prng, 5, 35) })),
    duration: round1(rng(prng, 2.5, 7.5)),
    ytm: round1(rng(prng, 1.5, 5.0)),
    rating: { ig: rngInt(prng, 50, 80), bbb: rngInt(prng, 10, 30), subig: rngInt(prng, 5, 20) },
  };

  const currNames = ['EUR', 'USD', 'CHF', 'GBP', lang === 'en' ? 'Other' : 'Sonstige'];
  const waehrungen = currNames.map(name => ({ name, anteil: rngInt(prng, 3, 60) }));

  const kommentare = lang === 'en'
    ? ['The portfolio is performing in line with expectations. Diversification across asset classes provides stability.',
       'The current market environment requires defensive positioning. We recommend reducing equity allocation upon reaching new highs.',
       'Performance exceeds the benchmark. The overweight in technology and healthcare has had a positive impact.',
       'Stable portfolio performance despite elevated market volatility. The bond allocation provides sufficient buffer.']
    : ['Das Portfolio entwickelt sich im Rahmen der Erwartungen. Die Diversifikation über verschiedene Anlageklassen sorgt für Stabilität.',
       'Die aktuelle Marktlage erfordert eine defensive Positionierung. Wir empfehlen eine Reduktion der Aktienquote bei Erreichen neuer Höchststände.',
       'Performance liegt über der Benchmark. Die Übergewichtung in Technologie und Healthcare hat sich positiv ausgewirkt.',
       'Stabiler Portfolioverlauf trotz erhöhter Marktvolatilität. Die Anleihenquote bietet ausreichend Puffer.'];

  // Generate 1-2 deposit events for generated mandants
  const generatedMonthly = generateMonthly(prng);
  const depositCount = rngInt(prng, 1, 2);
  const einzahlungen = [];
  for (let d = 0; d < depositCount; d++) {
    const idx = rngInt(prng, 6, generatedMonthly.length - 3);
    const betrag = rngInt(prng, 3, 15) * 100000;
    const monat = generatedMonthly[idx].monat;
    const mio = (betrag / 1000000).toFixed(1).replace('.', ',');
    einzahlungen.push({ monat, betrag, label: lang === 'en' ? `Deposit ${mio}M EUR` : `Einzahlung ${mio} Mio EUR` });
  }

  return {
    monthly: generatedMonthly,
    einzahlungen,
    allocation,
    sollAllocation,
    sektoren,
    regionen,
    risiko,
    anleihen,
    waehrungen,
    hedgingQuote: rngInt(prng, 20, 80),
    ioKommentar: {
      datum: '28.02.2026',
      autor: pick(prng, ['Dr. M. Fischer, CIO', 'S. Bergmann, PM', 'K. Richter, CIO']),
      text: pick(prng, kommentare),
      naechsterReview: '31.05.2026',
    },
    esg: {
      score: rngInt(prng, 45, 92),
      sfdr: pick(prng, ['Art. 6', 'Art. 8', 'Art. 8+', 'Art. 9']),
      co2: rngInt(prng, 15, 80),
    },
    kosten: {
      quote: round2(rng(prng, 0.65, 1.85)),
      betrag: rngInt(prng, 5000, 120000),
      jahr: 2025,
    },
    verlustschwelle: (() => {
      const grenze = pick(prng, [-8, -10, -12, -15]);
      return { schwelle: grenze, grenze, aktuell: round1(rng(prng, -7, -1)), hoechststandDatum: pick(prng, ['15.01.2026', '28.02.2026', '10.12.2025']) };
    })(),
  };
}

// ─── TRANSFORM: VV_WPHG ────────────────────────────────────────────────────

function transformWphg(raw) {
  if (!raw) return null;
  const _lang = getLang();
  const fb = raw.fragebogen || {};
  const gp = raw.geeignetheit || {};
  const vs = raw.verlustschwelle || {};
  const k = raw.kosten || {};
  const latestPruefung = (gp.pruefungen || [])[0];

  return {
    status: fb.status === 'aktuell' ? 'vollstaendig' : 'aktualisierung_noetig',
    letzteAktualisierung: fb.letztesUpdate,
    naechsteFaelligkeit: fb.naechstesPruefung,
    risikoprofil: `Risikoklasse ${fb.risikoklasse} – ${fb.anlageziel || 'Wachstum'}`,
    anlageerfahrung: fb.erfahrung ? {
      aktien: fb.erfahrung.aktien === 'hoch' || fb.erfahrung.aktien === 'mittel',
      anleihen: fb.erfahrung.anleihen === 'hoch' || fb.erfahrung.anleihen === 'mittel',
      fonds: true,
      pe: fb.erfahrung.alternative === 'hoch' || fb.erfahrung.alternative === 'mittel',
      derivate: fb.erfahrung.derivate === 'hoch' || fb.erfahrung.derivate === 'mittel',
      krypto: false,
    } : {},
    anlageziel: fb.anlageziel || 'Vermögenswachstum',
    anlagehorizont: fb.anlagehorizont || '10+ Jahre',
    verlusttoleranz: vs.schwelle ? `Max. ${vs.schwelle}% p.a.` : 'Moderat',
    esgPraeferenzen: { sfdr: 'Art. 8', taxonomie: _lang === 'en' ? 'Yes' : 'Ja', pai: true },
    anlagerichtlinie: {
      maxAktien: 60,
      minRenten: 20,
      krypto: _lang === 'en' ? 'Not permitted' : 'Nicht erlaubt',
      alternatives: 'Max. 20%',
      benchmark: '60% MSCI World / 40% Bloomberg Agg',
    },
    geeignetheit: {
      letzterBericht: latestPruefung ? `Q${Math.ceil((new Date(latestPruefung.datum).getMonth() + 1) / 3)} ${new Date(latestPruefung.datum).getFullYear()}` : 'Q1 2026',
      erstellt: latestPruefung?.datum,
      naechsterFaellig: fb.naechstesPruefung,
      ergebnis: gp.status === 'konform' ? (_lang === 'en' ? 'Suitable' : 'Geeignet') : (gp.status || (_lang === 'en' ? 'Suitable' : 'Geeignet')),
    },
    kosteninformation: {
      exAnte: { status: _lang === 'en' ? 'provided' : 'bereitgestellt', datum: '2026-01-10' },
      exPost: { status: _lang === 'en' ? 'provided' : 'bereitgestellt', datum: '2026-02-28' },
      gesamtkosten: k.exPost?.gesamtkosten || 28500,
      quote: k.exAnte?.gesamtTER || 1.02,
    },
    zielmarktabgleich: {
      positionen: rngInt(makePrng('zm'), 25, 45),
      konform: rngInt(makePrng('zm2'), 22, 45),
      letzterCheck: '2026-03-01',
    },
  };
}

function generateWphg(id) {
  const prng = makePrng(id + '_wphg');
  const _lang = getLang();
  const risikoklasse = rngInt(prng, 2, 5);
  const ziele = _lang === 'en' ? ['Capital Preservation', 'Capital Preservation with Moderate Growth', 'Long-term Wealth Growth', 'Aggressive Growth Strategy'] : ['Kapitalerhalt', 'Kapitalerhalt mit moderatem Wachstum', 'Langfristiges Vermögenswachstum', 'Aggressive Wachstumsstrategie'];
  const horizonte = ['3-5 Jahre', '5-10 Jahre', '10+ Jahre', '7-15 Jahre'];
  const statusOk = prng() > 0.2;
  const totalPos = rngInt(prng, 20, 50);

  return {
    status: statusOk ? 'vollstaendig' : 'aktualisierung_noetig',
    letzteAktualisierung: pick(prng, ['2025-10-15', '2025-11-20', '2026-01-10', '2025-08-05']),
    naechsteFaelligkeit: pick(prng, ['2026-04-15', '2026-06-20', '2026-08-10', '2026-10-05']),
    risikoprofil: `Risikoklasse ${risikoklasse} – ${ziele[risikoklasse - 2]}`,
    anlageerfahrung: {
      aktien: prng() > 0.2,
      anleihen: prng() > 0.3,
      fonds: prng() > 0.1,
      pe: prng() > 0.5,
      derivate: prng() > 0.6,
      krypto: prng() > 0.8,
    },
    anlageziel: ziele[risikoklasse - 2],
    anlagehorizont: pick(prng, horizonte),
    verlusttoleranz: pick(prng, ['Max. -8% p.a.', 'Max. -10% p.a.', 'Max. -15% p.a.', 'Moderat']),
    esgPraeferenzen: {
      sfdr: pick(prng, ['Art. 6', 'Art. 8', 'Art. 8+', 'Art. 9']),
      taxonomie: pick(prng, _lang === 'en' ? ['Yes', 'No', 'Partially'] : ['Ja', 'Nein', 'Teilweise']),
      pai: prng() > 0.4,
    },
    anlagerichtlinie: {
      maxAktien: rngInt(prng, 40, 70),
      minRenten: rngInt(prng, 15, 35),
      krypto: pick(prng, _lang === 'en' ? ['Not permitted', 'Max. 5%', 'Max. 2%'] : ['Nicht erlaubt', 'Max. 5%', 'Max. 2%']),
      alternatives: pick(prng, _lang === 'en' ? ['Max. 15%', 'Max. 20%', 'Max. 25%', 'Not permitted'] : ['Max. 15%', 'Max. 20%', 'Max. 25%', 'Nicht erlaubt']),
      benchmark: pick(prng, [
        '60% MSCI World / 40% Bloomberg Agg',
        '70% MSCI ACWI / 30% Bloomberg Global',
        '50% EURO STOXX / 50% Bloomberg EUR Agg',
      ]),
    },
    geeignetheit: {
      letzterBericht: pick(prng, ['Q4 2025', 'Q1 2026', 'Q3 2025']),
      erstellt: pick(prng, ['2025-12-15', '2026-01-20', '2025-09-30']),
      naechsterFaellig: pick(prng, ['2026-06-15', '2026-09-20', '2026-03-30']),
      ergebnis: prng() > 0.15 ? (_lang === 'en' ? 'Suitable' : 'Geeignet') : (_lang === 'en' ? 'Conditionally suitable' : 'Bedingt geeignet'),
    },
    kosteninformation: {
      exAnte: { status: _lang === 'en' ? 'provided' : 'bereitgestellt', datum: pick(prng, ['2026-01-10', '2025-12-15', '2026-02-05']) },
      exPost: { status: prng() > 0.2 ? (_lang === 'en' ? 'provided' : 'bereitgestellt') : (_lang === 'en' ? 'pending' : 'ausstehend'), datum: pick(prng, ['2026-02-28', '2026-01-31', '2025-12-31']) },
      gesamtkosten: rngInt(prng, 5000, 100000),
      quote: round2(rng(prng, 0.65, 1.85)),
    },
    zielmarktabgleich: {
      positionen: totalPos,
      konform: rngInt(prng, Math.max(totalPos - 5, 15), totalPos),
      letzterCheck: pick(prng, ['2026-03-01', '2026-02-15', '2026-01-20']),
    },
  };
}

// ─── TRANSFORM: VV_FAMILIE ──────────────────────────────────────────────────

const ROLLE_MAP = {
  mandant: { de: 'Mandant', en: 'Client' },
  ehepartner: { de: 'Ehepartnerin', en: 'Spouse' },
  kind: { de: 'Kind', en: 'Child' },
  stiftung: { de: 'Mandant (Institution)', en: 'Client (Institution)' },
};

const BERUF_FAM_EN = [
  ['Unternehmer Maschinenbau 3.Gen', 'Entrepreneur, Mechanical Engineering 3rd Gen'],
  ['Stiftungsvorstand (ehrenamtlich)', 'Foundation Chair (honorary)'],
  ['Anwaeltin, Partnerin Wirtschaftskanzlei (Frankfurt)', 'Attorney, Partner at Law Firm (Frankfurt)'],
  ['Ingenieur, im Familienunternehmen taetig', 'Engineer, active in Family Business'],
  ['SaaS-Unternehmer (Exit 2024, 8M netto)', 'SaaS Entrepreneur (Exit 2024, 8M net)'],
  ['CTO (eigenes Startup)', 'CTO (own Startup)'],
  ['Abiturient, Studienbeginn 2026', 'High School Graduate, starting University 2026'],
  ['Schülerin (Gymnasium)', 'High School Student'],
  ['Bildungsstiftung (gegründet 2008)', 'Education Foundation (founded 2008)'],
  ['Stifter, ehem. Unternehmer', 'Founder, former Entrepreneur'],
  ['Stiftungsvorstand', 'Foundation Chair'],
  ['Geschäftsfuehrer Stiftung, Vorstandsmitglied', 'Foundation Managing Director, Board Member'],
  ['Chefarzt Kardiologie + Privatpraxis', 'Chief of Cardiology + Private Practice'],
  ['Psychologin (eigene Praxis)', 'Psychologist (own Practice)'],
  ['Assistenzarzt Innere Medizin', 'Resident, Internal Medicine'],
  ['Medizinstudentin (5. Semester)', 'Medical Student (5th Semester)'],
  ['Tech-Gründer (Seed-Exit 500k)', 'Tech Founder (Seed Exit 500k)'],
];

function translateBerufFam(beruf, lang) {
  if (lang !== 'en' || !beruf) return beruf;
  for (const [de, en] of BERUF_FAM_EN) {
    if (beruf === de) return en;
  }
  return beruf;
}

function transformFamilie(raw) {
  if (!raw) return null;
  const lang = getLang();
  const mitglieder = (raw.mitglieder || []).map(m => ({
    ...m,
    rolle: (ROLLE_MAP[m.rolle] || { de: m.rolle, en: m.rolle })[lang],
    beruf: translateBerufFam(m.beruf, lang),
    istMandant: m.mandant === true || m.rolle === 'mandant',
    istLead: m.istLead || false,
  }));

  // Build unternehmen from generationenPlanung if applicable
  const gp = raw.generationenPlanung;
  const mandant = raw.mitglieder?.find(m => m.rolle === 'mandant');
  const beruf = mandant?.beruf || '';
  const hasUnternehmen = beruf.toLowerCase().includes('unternehmer') || beruf.toLowerCase().includes('stifter');

  const unternehmen = hasUnternehmen ? {
    name: beruf.includes('Maschinenbau') ? 'Keller Maschinenbau GmbH' :
          beruf.includes('SaaS') ? (lang === 'en' ? 'Lindenberg Digital GmbH (sold)' : 'Lindenberg Digital GmbH (verkauft)') :
          `${mandant?.name?.split(' ').pop() || 'Familien'} Holding GmbH`,
    branche: beruf.includes('Maschinenbau') ? (lang === 'en' ? 'Mechanical Engineering' : 'Maschinenbau') :
             beruf.includes('SaaS') ? 'Software/SaaS' : (lang === 'en' ? 'Diversified' : 'Diversifiziert'),
    umsatz: '15-50M EUR',
    mitarbeiter: '50-200',
    standort: lang === 'en' ? 'Germany' : 'Deutschland',
    geschaetzterWert: '5-20M EUR',
    nachfolge: gp?.themen?.some(t => t.toLowerCase().includes('nachfolge'))
      ? { status: 'offen', details: lang === 'en'
          ? 'Succession planning in progress'
          : (gp.themen.find(t => t.toLowerCase().includes('nachfolge')) || 'Nachfolgeregelung in Planung') }
      : null,
    positionen: mitglieder.filter(m => m.istMandant || m.beruf?.toLowerCase().includes('unternehmen')).map(m => ({
      name: m.name,
      rolle: m.istMandant ? (lang === 'en' ? 'Managing Director' : 'Geschäftsführer') : (lang === 'en' ? 'Employee' : 'Mitarbeiter'),
      anteil: m.istMandant ? '100%' : null,
    })),
  } : null;

  return {
    mitglieder,
    gesamtAuM: raw.vermoegensUebersicht?.gesamt || mitglieder.reduce((s, m) => s + (m.aum || m.vermoegen || 0), 0),
    potenzial: gp?.zeitrahmen || (lang === 'en' ? 'High' : 'Hoch'),
    unternehmen,
    weitereMandate: [],
    peBeteiligungen: [],
  };
}

function generateFamilie(id) {
  const prng = makePrng(id + '_fam');
  const vornamenM = ['Alexander', 'Christian', 'Thomas', 'Stefan', 'Michael', 'Andreas', 'Daniel', 'Markus'];
  const vornamenW = ['Anna', 'Julia', 'Sarah', 'Katharina', 'Claudia', 'Monika', 'Laura', 'Stefanie'];
  const nachnamen = ['Schmidt', 'Weber', 'Fischer', 'Wagner', 'Becker', 'Hoffmann', 'Braun', 'Richter'];
  const nachname = pick(prng, nachnamen);
  const mAge = rngInt(prng, 42, 72);
  const pAge = mAge + rngInt(prng, -5, 5);
  const numKids = rngInt(prng, 0, 3);
  const aum = rngInt(prng, 500000, 12000000);

  const _lang = getLang();
  const mitglieder = [
    {
      name: `${pick(prng, vornamenM)} ${nachname}`,
      rolle: _lang === 'en' ? 'Client' : 'Mandant',
      alter: mAge,
      beruf: pick(prng, _lang === 'en' ? ['Entrepreneur', 'Physician', 'Attorney', 'Managing Director', 'Investor', 'Freelancer'] : ['Unternehmer', 'Arzt', 'Rechtsanwalt', 'Geschäftsführer', 'Investor', 'Freiberufler']),
      istMandant: true,
      aum,
    },
    {
      name: `${pick(prng, vornamenW)} ${nachname}`,
      rolle: _lang === 'en' ? 'Spouse' : 'Ehepartnerin',
      alter: pAge,
      beruf: pick(prng, _lang === 'en' ? ['Physician', 'Teacher', 'Self-employed', 'Architect', 'Manager'] : ['Ärztin', 'Lehrerin', 'Selbständig', 'Architektin', 'Managerin']),
      vermoegen: rngInt(prng, 100000, 2000000),
    },
  ];

  for (let i = 0; i < numKids; i++) {
    const isBoy = prng() > 0.5;
    const age = rngInt(prng, 8, 32);
    mitglieder.push({
      name: `${pick(prng, isBoy ? vornamenM : vornamenW)} ${nachname}`,
      rolle: _lang === 'en' ? (isBoy ? 'Son' : 'Daughter') : (isBoy ? 'Sohn' : 'Tochter'),
      alter: age,
      beruf: age < 18 ? (_lang === 'en' ? 'Student' : 'Schüler/in') : pick(prng, _lang === 'en' ? ['Student', 'Engineer', 'Consultant', 'Founder'] : ['Student/in', 'Ingenieur/in', 'Berater/in', 'Gründer/in']),
      istLead: age >= 18 && age <= 30 && prng() > 0.5,
    });
  }

  return {
    mitglieder,
    gesamtAuM: aum + rngInt(prng, 200000, 5000000),
    potenzial: pick(prng, _lang === 'en' ? ['High', 'Medium', 'Very high', '2-5M Potential'] : ['Hoch', 'Mittel', 'Sehr hoch', '2-5M Potenzial']),
    unternehmen: prng() > 0.5 ? {
      name: `${nachname} ${pick(prng, ['GmbH', 'Holding GmbH', 'AG', 'KG'])}`,
      branche: pick(prng, ['Maschinenbau', 'IT-Dienstleistungen', 'Immobilien', 'Medizintechnik', 'Beratung']),
      umsatz: pick(prng, ['5-10M EUR', '10-25M EUR', '25-50M EUR']),
      mitarbeiter: pick(prng, ['15-50', '50-150', '150-300']),
      standort: pick(prng, ['Frankfurt', 'München', 'Hamburg', 'Düsseldorf', 'Stuttgart']),
      geschaetzterWert: pick(prng, ['3-8M EUR', '8-15M EUR', '15-30M EUR']),
      nachfolge: prng() > 0.5 ? { status: 'offen', details: _lang === 'en' ? 'Succession planning in progress for the next 3-5 years.' : 'Nachfolgeregelung in Planung für die nächsten 3-5 Jahre.' } : null,
      positionen: [
        { name: mitglieder[0].name, rolle: _lang === 'en' ? 'Managing Director' : 'Geschäftsführer', anteil: '75%' },
        { name: mitglieder[1].name, rolle: _lang === 'en' ? 'Authorized Signatory' : 'Prokuristin', anteil: '25%' },
      ],
    } : null,
    weitereMandate: prng() > 0.5 ? [
      { organisation: pick(prng, ['IHK Frankfurt', 'Rotary Club', 'Stiftungsrat Weber', 'Aufsichtsrat XY AG']), typ: pick(prng, ['Ehrenamt', 'Beirat', 'Aufsichtsrat']), seit: pick(prng, ['2018', '2020', '2022']) },
    ] : [],
    peBeteiligungen: prng() > 0.6 ? [
      { name: pick(prng, ['Munich Ventures III', 'HQ Capital PE Fund', 'Acton Capital V', 'European Growth Fund']), committed: rngInt(prng, 100000, 2000000), jahr: pick(prng, ['2023', '2024', '2025']) },
    ] : [],
  };
}

// ─── TRANSFORM: VV_ENGAGEMENT ───────────────────────────────────────────────

function transformEngagement(raw) {
  // VV_ENGAGEMENT data structure largely matches component expectations
  return raw || null;
}

function generateEngagement(id) {
  const prng = makePrng(id + '_eng');
  const aktivitaet = pick(prng, ['niedrig', 'mittel', 'hoch', 'sehr_hoch']);
  const kontakte = rngInt(prng, 150, 3000);

  return {
    linkedin: {
      url: `linkedin.com/in/mandant-${id.toLowerCase()}`,
      profilUrl: `linkedin.com/in/mandant-${id.toLowerCase()}`,
      aktivitaet,
      kontakte,
      letzteAktivitaeten: [
        { typ: pick(prng, ['like', 'share', 'post']), datum: '2026-03-01', inhalt: pick(prng, ['Artikel über Vermögensverwaltung geteilt', 'IHK-Beitrag geliked', 'ESG-Report kommentiert']) },
        { typ: pick(prng, ['like', 'share', 'profil_update']), datum: '2026-02-15', inhalt: pick(prng, ['Branchennews geteilt', 'Profil aktualisiert', 'Fachartikel geliked']) },
      ],
      signale: [
        pick(prng, ['Nachfolge-Thema aktiv', 'Hohe Sichtbarkeit', 'ESG-Interesse', 'PE-Interesse', 'Tech-Affinität']),
        pick(prng, ['Liquiditätsbedarf', 'Wachstumsorientiert', 'Konservativ', 'Stiftungsinteresse']),
      ],
    },
    website: {
      besuche90Tage: rngInt(prng, 0, 15),
      avgVerweildauer: `${rngInt(prng, 1, 8)}:${rngInt(prng, 10, 59).toString().padStart(2, '0')} Min`,
      topSeiten: [
        { seite: '/quartalsbericht', besuche: rngInt(prng, 1, 5) },
        { seite: pick(prng, ['/marktbericht', '/esg-report', '/insights', '/team']), besuche: rngInt(prng, 1, 3) },
      ],
      signale: [pick(prng, ['Regelmäßig Quartalsbericht gelesen', 'Seltene Besuche', 'ESG-Report Interesse', 'Hohe Verweildauer'])],
    },
    newsletter: {
      oeffnungsrate: rngInt(prng, 20, 95),
      klicks: [
        { datum: '2026-03-05', betreff: pick(prng, ['Marktausblick Q1 2026', 'Portfolio-Update März', 'ESG-Spezial']), aktion: pick(prng, ['geöffnet', 'geklickt']) },
        { datum: '2026-02-10', betreff: pick(prng, ['Anlagetrends 2026', 'Nachfolge-Spezial', 'Quartalsbericht Q4']), aktion: pick(prng, ['geöffnet', 'geklickt']) },
      ],
      signale: [pick(prng, ['Aktiver Leser', 'Nachfolge-Themen geklickt', 'ESG-Interesse', 'Geringe Öffnungsrate'])],
    },
    events: {
      vergangene: [
        {
          name: pick(prng, ['Jahresempfang 2025', 'Nachfolge-Roundtable', 'ESG-Webinar', 'Anleger-Dinner']),
          datum: pick(prng, ['2025-12-10', '2026-01-20', '2025-11-15']),
          typ: pick(prng, ['dinner', 'roundtable', 'webinar']),
          status: pick(prng, ['teilgenommen', 'nicht teilgenommen']),
        },
      ],
      empfohlene: [
        {
          name: pick(prng, ['Familienstiftung Praxistag', 'Nachfolge-Kongress', 'ESG Art.9 Workshop', 'Investment Forum']),
          datum: pick(prng, ['2026-04-15', '2026-05-20', '2026-06-10']),
          match: pick(prng, ['hoch', 'mittel', 'niedrig']),
          grund: pick(prng, ['Passt zu Anlageziel', 'Nachfolge-Interesse', 'ESG-Upgrade geplant']),
          aktion: pick(prng, ['einladen', 'vorschlagen']),
        },
      ],
    },
    presse: prng() > 0.5 ? [
      {
        datum: pick(prng, ['2026-01-20', '2025-11-05', '2025-09-15']),
        quelle: pick(prng, ['Handelsblatt', 'FAZ', 'WirtschaftsWoche', 'Manager Magazin']),
        titel: pick(prng, [
          'Mittelstand: Vermögenssicherung im Wandel',
          'Nachfolge im Familienunternehmen',
          'Private Banking: Neue Trends 2026',
        ]),
        signal: pick(prng, ['Positiv – Sichtbarkeit', 'Nachfolge-Thema', 'Neutral']),
      },
    ] : [],
    digitalScore: rngInt(prng, 15, 85),
  };
}

// ─── PROXY FACTORY ──────────────────────────────────────────────────────────

const _proxyCaches = [];
if (typeof window !== 'undefined') {
  window.addEventListener('kia-language-change', () => {
    _proxyCaches.forEach(c => { for (const k in c) delete c[k]; });
  });
}

function createDataProxy(rawData, transformFn, generateFn) {
  const cache = {};
  _proxyCaches.push(cache);
  return new Proxy(cache, {
    get(target, prop) {
      if (typeof prop !== 'string') return undefined;
      // Return cached
      if (prop in target) return target[prop];
      // Transform showcase data
      const raw = rawData[prop];
      if (raw) {
        target[prop] = transformFn(raw);
        return target[prop];
      }
      // Generate for VV/WM IDs
      if (/^(VV|WM)\d+$/.test(prop)) {
        target[prop] = generateFn(prop);
        return target[prop];
      }
      return undefined;
    },
    has(target, prop) {
      if (typeof prop !== 'string') return false;
      return prop in target || prop in rawData || /^(VV|WM)\d+$/.test(prop);
    },
  });
}

// ─── EXPORTS ────────────────────────────────────────────────────────────────

export const VV_PERFORMANCE = createDataProxy(RAW_PERF, transformPerformance, generatePerformance);
export const VV_WPHG = createDataProxy(RAW_WPHG, transformWphg, generateWphg);
export const VV_FAMILIE = createDataProxy(RAW_FAMI, transformFamilie, generateFamilie);
export const VV_ENGAGEMENT = createDataProxy(RAW_ENG, transformEngagement, generateEngagement);
