/**
 * VV Data Adapter
 * Transforms vvExtended static data to match component expectations,
 * and generates synthetic data for mandants without hand-curated data.
 */
import { VV_PERFORMANCE, VV_WPHG, VV_FAMILIE, VV_ENGAGEMENT } from './vvExtended';

// ─── Seeded random for reproducible generation ────────────────────────────────
function seededRandom(seed) {
  let s = seed;
  return () => {
    s = (s * 16807 + 0) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

function hashId(id) {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = ((h << 5) - h + id.charCodeAt(i)) | 0;
  return Math.abs(h);
}

// ─── Transform VV_PERFORMANCE (showcase) to component format ──────────────────
function transformPerformance(raw) {
  if (!raw) return null;

  const MONATE = ['Jan', 'Feb', 'Mär', 'Apr', 'Mai', 'Jun', 'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Dez'];

  // monthly: array with { monat: "Jan 2025", portfolio: ..., benchmark: ... }
  const monthly = (raw.monthlyReturns || []).map((m, i) => ({
    monat: `${m.name} 2025`,
    portfolio: m.portfolio,
    benchmark: m.benchmark,
  }));

  // allocation stays same (already { aktien, anleihen, ... })
  const allocation = raw.allocation || {};
  const sollAllocation = raw.targetAllocation || {};

  // sektoren: { name, anteil } (raw has { name, value })
  const sektoren = (raw.sectors || []).map(s => ({ name: s.name, anteil: s.value }));

  // regionen: { name, anteil }
  const regionen = (raw.regions || []).map(r => ({ name: r.name, anteil: r.value }));

  // risiko
  const rm = raw.riskMetrics || {};
  const risiko = {
    volatilitaet: rm.volatilitaet,
    maxDrawdown: rm.maxDrawdown,
    sharpeRatio: rm.sharpe,
    beta: rm.beta ?? 0.95,
    var95: rm.var95,
    trackingError: rm.trackingError,
    benchmarkVola: rm.benchmarkVola,
  };

  // anleihen
  const anleihen = raw.bonds ? {
    laufzeiten: (raw.bonds || []).map(b => ({ name: b.name, anteil: b.value })),
    duration: raw.bondDuration ?? 4.5,
    ytm: raw.bondYtm ?? 3.2,
    rating: raw.bondRating ?? 'A',
  } : { laufzeiten: [], duration: null, ytm: null, rating: null };

  // waehrungen
  const waehrungen = (raw.currencies || []).map(c => ({ name: c.name, anteil: c.value }));

  return {
    monthly,
    allocation,
    sollAllocation,
    sektoren,
    regionen,
    risiko,
    anleihen,
    waehrungen,
    hedgingQuote: raw.hedgingQuote ?? 65,
    ioKommentar: raw.ioComment || null,
    esg: raw.esg || null,
    kosten: raw.kosten || null,
    verlustschwelle: raw.verlustschwelle || null,
  };
}

// ─── Generate synthetic performance data for non-showcase mandants ─────────────
function generatePerformance(kundeId, kunde) {
  const rand = seededRandom(hashId(kundeId));
  const r = (min, max) => min + rand() * (max - min);
  const ri = (min, max) => Math.round(r(min, max));

  const MONATE = ['Jan', 'Feb', 'Mär', 'Apr', 'Mai', 'Jun', 'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Dez'];

  // Determine profile from AuM
  const aum = kunde?.aum || kunde?.eigeneProdukte?.reduce((s, p) => s + (p.volumen || 0), 0) || 2000000;
  const isAggressive = aum > 5000000;
  const baseReturn = isAggressive ? 0.9 : 0.6;
  const volatility = isAggressive ? 1.8 : 1.0;

  const monthly = MONATE.map(m => ({
    monat: `${m} 2025`,
    portfolio: +(baseReturn + (rand() - 0.45) * volatility).toFixed(1),
    benchmark: +(baseReturn * 0.7 + (rand() - 0.45) * volatility * 0.7).toFixed(1),
  }));

  const aktien = ri(isAggressive ? 50 : 35, isAggressive ? 70 : 50);
  const anleihenPct = ri(15, 35);
  const alternative = ri(5, 20);
  const rest = 100 - aktien - anleihenPct - alternative;
  const cash = Math.max(2, Math.floor(rest / 2));
  const immobilien = Math.max(0, rest - cash);

  const allocation = { aktien, anleihen: anleihenPct, alternative, cash, immobilien };
  const sollAllocation = {
    aktien: aktien + ri(-3, 3),
    anleihen: anleihenPct + ri(-2, 2),
    alternative,
    cash,
    immobilien,
  };

  const sektoren = [
    { name: 'Technologie', anteil: ri(12, 28) },
    { name: 'Healthcare', anteil: ri(8, 18) },
    { name: 'Finanzen', anteil: ri(8, 16) },
    { name: 'Industrie', anteil: ri(6, 14) },
    { name: 'Konsum', anteil: ri(5, 12) },
    { name: 'Energie', anteil: ri(4, 10) },
    { name: 'Versorger', anteil: ri(3, 8) },
    { name: 'Sonstige', anteil: ri(3, 10) },
  ];

  const regionen = [
    { name: 'Europa', anteil: ri(35, 55) },
    { name: 'Nordamerika', anteil: ri(20, 38) },
    { name: 'Asien-Pazifik', anteil: ri(8, 18) },
    { name: 'Schwellenländer', anteil: ri(3, 12) },
    { name: 'Sonstige', anteil: ri(2, 8) },
  ];

  const risiko = {
    volatilitaet: +r(6, 14).toFixed(1),
    maxDrawdown: +(-r(3, 12)).toFixed(1),
    sharpeRatio: +r(0.5, 1.5).toFixed(2),
    beta: +r(0.7, 1.15).toFixed(2),
    var95: +(-r(1, 4)).toFixed(1),
    trackingError: +r(1, 3.5).toFixed(1),
  };

  const anleihen = {
    laufzeiten: [
      { name: '<2J', anteil: ri(10, 25) },
      { name: '2-5J', anteil: ri(25, 40) },
      { name: '5-10J', anteil: ri(20, 35) },
      { name: '>10J', anteil: ri(5, 15) },
    ],
    duration: +r(3, 7).toFixed(1),
    ytm: +r(2.5, 4.5).toFixed(1),
    rating: 'A',
  };

  const waehrungen = [
    { name: 'EUR', anteil: ri(50, 70) },
    { name: 'USD', anteil: ri(15, 30) },
    { name: 'CHF', anteil: ri(3, 12) },
    { name: 'GBP', anteil: ri(2, 8) },
    { name: 'Sonstige', anteil: ri(1, 5) },
  ];

  return {
    monthly,
    allocation,
    sollAllocation,
    sektoren,
    regionen,
    risiko,
    anleihen,
    waehrungen,
    hedgingQuote: ri(40, 80),
    ioKommentar: `Das Portfolio von ${kunde?.name || 'dem Mandanten'} entwickelt sich im Rahmen der Erwartungen. Die aktuelle Allokation spiegelt die vereinbarte Anlagestrategie wider. Im Berichtszeitraum wurde die Aktienquote leicht angepasst.`,
    esg: null,
    kosten: null,
    verlustschwelle: {
      schwelle: -10,
      hoechststand: +(aum * 1.05).toFixed(0),
      aktuell: +(aum * (1 + r(-0.03, 0.04))).toFixed(0),
    },
  };
}

// ─── Generate synthetic WpHG data ────────────────────────────────────────────
function generateWpHG(kundeId, kunde) {
  const rand = seededRandom(hashId(kundeId) + 100);
  const r = (min, max) => min + rand() * (max - min);
  const pick = (arr) => arr[Math.floor(rand() * arr.length)];

  const daysAgo = Math.round(r(30, 400));
  const erstelltDate = new Date(Date.now() - daysAgo * 86400000);
  const gueltigBis = new Date(erstelltDate.getTime() + 365 * 86400000);
  const fmt = (d) => d.toISOString().split('T')[0];

  return {
    geeignetheit: {
      risikoklasse: pick(['konservativ', 'ausgewogen', 'wachstum', 'dynamisch']),
      anlagehorizont: pick(['3-5 Jahre', '5-10 Jahre', '10+ Jahre']),
      erfahrung: pick(['fortgeschritten', 'experte', 'erfahren']),
      verlusttoleranz: pick(['bis 10%', 'bis 20%', 'bis 30%']),
      erstellt: fmt(erstelltDate),
      gueltigBis: fmt(gueltigBis),
      status: daysAgo > 365 ? 'abgelaufen' : 'aktuell',
    },
    zielmarkt: {
      kundengruppe: 'professionell',
      risikoprofil: pick(['ausgewogen', 'wachstumsorientiert', 'spekulativ']),
      anlageziel: pick(['Vermögenserhalt', 'Vermögenswachstum', 'Ertragsoptimierung']),
    },
    pruefungen: [
      { typ: 'Geeignetheitsprüfung', datum: fmt(erstelltDate), ergebnis: 'bestanden', pruefer: 'System' },
      { typ: 'Angemessenheitsprüfung', datum: fmt(erstelltDate), ergebnis: 'bestanden', pruefer: 'System' },
    ],
  };
}

// ─── Generate synthetic Familie data ──────────────────────────────────────────
function generateFamilie(kundeId, kunde) {
  if (!kunde) return null;

  const mitglieder = [{ name: kunde.name, rolle: 'Mandant', alter: kunde.alter }];

  if (kunde.partner) {
    mitglieder.push({ name: kunde.partner.name || 'Partner', rolle: 'Partner', alter: kunde.partner.alter || kunde.alter - 2 });
  }

  if (kunde.kinder?.length) {
    kunde.kinder.forEach(k => {
      mitglieder.push({ name: k.name, rolle: 'Kind', alter: k.alter });
    });
  }

  return { mitglieder, unternehmen: kunde.arbeitgeber ? [kunde.arbeitgeber] : [] };
}

// ─── Generate synthetic Engagement data ───────────────────────────────────────
function generateEngagement(kundeId, kunde) {
  const rand = seededRandom(hashId(kundeId) + 300);
  const r = (min, max) => min + rand() * (max - min);

  return {
    linkedin: { kontakte: Math.round(r(200, 1500)), letzteAktivitaeten: [], signale: [] },
    website: { besuche90Tage: Math.round(r(2, 15)), avgVerweildauer: Math.round(r(1, 5)), topSeiten: [], signale: [] },
    newsletter: { klicks: [], signale: [] },
    events: { vergangene: [], empfohlene: [] },
    presse: [],
  };
}

// ─── Cache ────────────────────────────────────────────────────────────────────
const _perfCache = {};
const _wphgCache = {};
const _famCache = {};
const _engCache = {};

// ─── Public API ───────────────────────────────────────────────────────────────

export function getVVPerformance(kundeId, kunde) {
  if (!kundeId) return null;
  if (_perfCache[kundeId]) return _perfCache[kundeId];

  const raw = VV_PERFORMANCE[kundeId];
  const result = raw ? transformPerformance(raw) : generatePerformance(kundeId, kunde);
  _perfCache[kundeId] = result;
  return result;
}

export function getVVWpHG(kundeId, kunde) {
  if (!kundeId) return null;
  if (_wphgCache[kundeId]) return _wphgCache[kundeId];

  const raw = VV_WPHG[kundeId];
  const result = raw || generateWpHG(kundeId, kunde);
  _wphgCache[kundeId] = result;
  return result;
}

export function getVVFamilie(kundeId, kunde) {
  if (!kundeId) return null;
  if (_famCache[kundeId]) return _famCache[kundeId];

  const raw = VV_FAMILIE[kundeId];
  const result = raw || generateFamilie(kundeId, kunde);
  _famCache[kundeId] = result;
  return result;
}

export function getVVEngagement(kundeId, kunde) {
  if (!kundeId) return null;
  if (_engCache[kundeId]) return _engCache[kundeId];

  const raw = VV_ENGAGEMENT[kundeId];
  const result = raw || generateEngagement(kundeId, kunde);
  _engCache[kundeId] = result;
  return result;
}
