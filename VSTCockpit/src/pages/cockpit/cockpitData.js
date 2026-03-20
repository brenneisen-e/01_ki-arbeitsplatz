// ═══════════════════════════════════════════════════════════════
// VST Cockpit – Dynamischer Mockdaten-Generator
// Referenzwerte angelehnt an A-03 Gesamtübersicht.
// 12 rollierende Monate (aktueller Monat = letzter), seeded PRNG
// für deterministisch-stabile Werte pro Monatswechsel.
// ═══════════════════════════════════════════════════════════════

// ── Aktuelles Datum ─────────────────────────────────────────
const NOW = new Date();
const CURRENT_YEAR = NOW.getFullYear();
const CURRENT_MONTH = NOW.getMonth(); // 0-based
const CURRENT_DAY = NOW.getDate();

// ── Seeded PRNG (Mulberry32) ────────────────────────────────
function mulberry32(seed) {
  let s = seed | 0;
  return function () {
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Seed = Jahr * 100 + Monat → stabil pro Monat, ändert sich monatlich
const SEED = CURRENT_YEAR * 100 + CURRENT_MONTH;
const rand = mulberry32(SEED);

function randBetween(min, max) { return min + rand() * (max - min); }
function pick(arr) { return arr[Math.floor(rand() * arr.length)]; }

// Wachstumsfaktor: Referenz = März 2026, +0.5%/Monat
const MONTHS_SINCE_REF = (CURRENT_YEAR - 2026) * 12 + (CURRENT_MONTH - 2);
const GROWTH = 1 + MONTHS_SINCE_REF * 0.005;

// ── KPI Definitions ─────────────────────────────────────────
export const KPI_DEFS = [
  { id: 'neugeschaeft', title: 'Neugeschäftsvolumen', desc: 'Gesamtvolumen aller neu abgeschlossenen Verträge', unit: 'currency', icon: 'TrendingUp' },
  { id: 'bestand', title: 'Bestandsvolumen', desc: 'Gesamtwert aller verwalteten Versicherungsverträge', unit: 'currency', icon: 'Briefcase' },
  { id: 'storno', title: 'Stornoquote', desc: 'Prozentsatz der gekündigten Verträge', unit: 'percent', icon: 'AlertTriangle', invertTrend: true },
  { id: 'nps', title: 'NPS Score', desc: 'Net Promoter Score - Kundenweiterempfehlungsrate', unit: 'score', icon: 'Heart' },
  { id: 'risiko', title: 'Risikoscore', desc: 'Aggregierte Risikobewertung des Portfolios', unit: 'score', icon: 'Shield', invertTrend: true },
  { id: 'combined', title: 'Combined Ratio', desc: 'Verhältnis von Schäden und Kosten zu Prämieneinnahmen', unit: 'percent', icon: 'Percent' },
  { id: 'ergebnis', title: 'Gesamtergebnis', desc: 'Geschäftsergebnis nach allen Kosten', unit: 'currency', icon: 'Target' },
  { id: 'underwriting', title: 'Underwriting Qualität', desc: 'Anteil Anträge, die Risikoprüfungskriterien entsprechen', unit: 'percent', icon: 'CheckCircle' },
  { id: 'deckungsbeitrag', title: 'Deckungsbeitrag', desc: 'Ertrag nach Abzug direkter Kosten und Provisionen', unit: 'currency', icon: 'Euro' },
];

// ── Basiskonfiguration ──────────────────────────────────────
const FIRST_NAMES = [
  'Alexander','Benjamin','Christian','Daniel','Erik','Felix','Georg','Hans','Ingo','Jürgen',
  'Klaus','Lars','Martin','Norbert','Oliver','Peter','Ralf','Stefan','Thomas','Uwe',
  'Werner','Andreas','Bernd','Dieter','Frank','Holger','Michael','Rainer','Volker','Wolfgang',
  'Anna','Barbara','Christine','Doris','Elisabeth','Franziska','Gabriele','Heike','Ingrid','Julia',
  'Karin','Lena','Maria','Nina','Petra','Rita','Sandra','Tanja','Ursula','Vera',
];
const LAST_NAMES = [
  'Müller','Schmidt','Schneider','Fischer','Weber','Meyer','Wagner','Becker','Schulz','Hoffmann',
  'Schäfer','Koch','Bauer','Richter','Klein','Wolf','Schröder','Neumann','Schwarz','Zimmermann',
  'Braun','Krüger','Hofmann','Hartmann','Lange','Werner','Krause','Lehmann','Schmitt','König',
];

const BUNDESLAENDER = [
  { name: 'Bayern', abbr: 'BY', factor: 1.40, baseVermittler: 142 },
  { name: 'Baden-Württemberg', abbr: 'BW', factor: 1.35, baseVermittler: 128 },
  { name: 'Nordrhein-Westfalen', abbr: 'NRW', factor: 1.30, baseVermittler: 156 },
  { name: 'Hessen', abbr: 'HE', factor: 1.25, baseVermittler: 98 },
  { name: 'Hamburg', abbr: 'HH', factor: 1.45, baseVermittler: 64 },
  { name: 'Niedersachsen', abbr: 'NI', factor: 1.00, baseVermittler: 95 },
  { name: 'Schleswig-Holstein', abbr: 'SH', factor: 1.02, baseVermittler: 72 },
  { name: 'Berlin', abbr: 'BE', factor: 0.95, baseVermittler: 58 },
  { name: 'Rheinland-Pfalz', abbr: 'RP', factor: 0.98, baseVermittler: 62 },
  { name: 'Sachsen', abbr: 'SN', factor: 0.78, baseVermittler: 48 },
  { name: 'Bremen', abbr: 'HB', factor: 1.05, baseVermittler: 22 },
  { name: 'Thüringen', abbr: 'TH', factor: 0.72, baseVermittler: 38 },
  { name: 'Brandenburg', abbr: 'BB', factor: 0.65, baseVermittler: 35 },
  { name: 'Sachsen-Anhalt', abbr: 'ST', factor: 0.68, baseVermittler: 32 },
  { name: 'Saarland', abbr: 'SL', factor: 0.82, baseVermittler: 18 },
  { name: 'Mecklenburg-Vorpommern', abbr: 'MV', factor: 0.55, baseVermittler: 24 },
];

const MONTH_LABELS = ['Jan', 'Feb', 'Mär', 'Apr', 'Mai', 'Jun', 'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Dez'];

// Seasonality per calendar month (0=Jan … 11=Dez)
const SEASONALITY = [0.85, 0.92, 1.05, 0.95, 1.02, 0.88, 0.82, 0.78, 1.05, 1.12, 1.18, 1.22];

// ── Vermittler-Generator ────────────────────────────────────
function generateVermittler() {
  const vermittler = [];
  let id = 1;
  const usedNames = new Set();

  for (const bl of BUNDESLAENDER) {
    const count = Math.max(3, Math.round(bl.baseVermittler * 0.08));
    for (let i = 0; i < count; i++) {
      let name;
      do { name = `${pick(FIRST_NAMES)} ${pick(LAST_NAMES)}`; } while (usedNames.has(name));
      usedNames.add(name);

      const quality = randBetween(0.4, 1.0);
      vermittler.push({
        id: `VM${String(id++).padStart(5, '0')}`,
        name,
        region: bl.abbr === 'NRW' ? 'NRW' : bl.name,
        bundesland: bl.name,
        neugeschaeft: Math.round(randBetween(180000, 950000) * quality * bl.factor * GROWTH),
        bestand: Math.round(randBetween(2000000, 14000000) * quality * bl.factor * GROWTH),
        storno: +(randBetween(3.2, 6.0) * (1.1 - quality * 0.3)).toFixed(1),
        nps: Math.round(randBetween(35, 68) * (0.7 + quality * 0.5)),
        abschluesse: Math.round(randBetween(12, 50) * quality),
      });
    }
  }

  vermittler.sort((a, b) => b.neugeschaeft - a.neugeschaeft);
  return vermittler;
}

const ALL_VERMITTLER = generateVermittler();
export const TOP_VERMITTLER = ALL_VERMITTLER.slice(0, 10);

// ── Bundesland-Aggregation ──────────────────────────────────
function generateBundeslandData() {
  return BUNDESLAENDER.map(bl => {
    const blVerm = ALL_VERMITTLER.filter(v => v.bundesland === bl.name);
    const scale = bl.baseVermittler / Math.max(1, blVerm.length);
    const ngSum = blVerm.reduce((s, v) => s + v.neugeschaeft, 0);
    const bsSum = blVerm.reduce((s, v) => s + v.bestand, 0);
    const stornoAvg = blVerm.length > 0 ? blVerm.reduce((s, v) => s + v.storno, 0) / blVerm.length : 5.0;
    return {
      name: bl.name,
      neugeschaeft: Math.round(ngSum * scale),
      bestand: Math.round(bsSum * scale),
      storno: +stornoAvg.toFixed(1),
      vermittler: bl.baseVermittler,
      factor: bl.factor,
    };
  });
}

export const BUNDESLAND_DATA = generateBundeslandData();

// ══════════════════════════════════════════════════════════════
// ── Monatsdaten: 12 rollierende Monate ──────────────────────
// Referenzwerte (A-03): NG ~2.5–3.9M/Monat, Bestand ~138–142M
// ══════════════════════════════════════════════════════════════
function generateMonthlyData() {
  // Referenzwerte aus A-03 (Mär 2026 Niveau), skaliert mit Wachstum
  const BASE_NG = 3200000 * GROWTH;       // ~3.2 Mio Neugeschäft/Monat
  const BASE_BESTAND = 139000000 * GROWTH; // ~139 Mio Bestandsvolumen
  const BASE_ERGEBNIS = 1500000 * GROWTH;  // ~1.5 Mio Ergebnis/Monat
  const BASE_DB = 1150000 * GROWTH;        // ~1.15 Mio Deckungsbeitrag

  // Eigener PRNG pro Monat, damit jeder Monat unabhängig generiert wird
  // und stabil bleibt, auch wenn ein neuer Monat dazukommt
  const result = [];
  let bestand = Math.round(BASE_BESTAND * 0.985); // Start etwas unter Jahresmittel

  for (let offset = 11; offset >= 0; offset--) {
    // Monat berechnen: aktueller Monat - offset
    const totalMonth = CURRENT_YEAR * 12 + CURRENT_MONTH - offset;
    const calMonth = ((totalMonth % 12) + 12) % 12; // 0-based Kalendermonat
    const label = MONTH_LABELS[calMonth];

    // Eigener Seed pro Monat für stabile Werte
    const mRand = mulberry32(totalMonth * 7 + 31337);
    const mR = () => mRand();
    const mRB = (min, max) => min + mR() * (max - min);

    const season = SEASONALITY[calMonth];
    // ±20% Variation + Saisonalität
    const ngNoise = mRB(0.78, 1.22);
    const ng = Math.round(BASE_NG * season * ngNoise);

    // Bestand wächst stetig mit leichten Schwankungen
    bestand = Math.round(bestand + ng * mRB(0.08, 0.18));

    const ergebnisRatio = mRB(0.38, 0.56);
    const dbRatio = mRB(0.28, 0.42);

    result.push({
      month: label,
      neugeschaeft: ng,
      bestand,
      storno: +(mRB(3.8, 6.0) * (calMonth < 6 ? mRB(0.95, 1.08) : mRB(0.88, 1.02))).toFixed(1),
      nps: Math.round(mRB(40, 52) + (11 - offset) * mRB(0.2, 0.8)),
      risiko: +(mRB(2.1, 3.4) - (11 - offset) * 0.04).toFixed(1),
      combined: +(mRB(89, 95) - (11 - offset) * mRB(0.15, 0.35)).toFixed(1),
      ergebnis: Math.round(ng * ergebnisRatio),
      underwriting: +(mRB(86, 93) + (11 - offset) * mRB(0.2, 0.45)).toFixed(1),
      deckungsbeitrag: Math.round(ng * dbRatio),
    });
  }
  return result;
}

export const MONTHLY_DATA = generateMonthlyData();

// ── Segment & Vertriebsweg ──────────────────────────────────
export const SEGMENT_VERTEILUNG = [
  { name: 'Leben', value: 35, color: '#3b82f6' },
  { name: 'Kranken', value: 22, color: '#10b981' },
  { name: 'Schaden', value: 24, color: '#8b5cf6' },
  { name: 'Kfz', value: 19, color: '#f59e0b' },
];

export const VERTRIEBSWEG_VERTEILUNG = [
  { name: 'Ausschließlichkeit', value: 45, color: '#3b82f6' },
  { name: 'Makler', value: 28, color: '#10b981' },
  { name: 'Direktvertrieb', value: 15, color: '#8b5cf6' },
  { name: 'Banken', value: 12, color: '#f59e0b' },
];

// ── Abschlüsse-Generator ───────────────────────────────────
const PRODUKTE = [
  { produkt: 'BU-Versicherung', tarif: 'BU Premium', beitragRange: [800, 2200], faktor: 12.5 },
  { produkt: 'Zahnzusatz', tarif: 'DKV ZZ Pro', beitragRange: [180, 550], faktor: 8.0 },
  { produkt: 'Kfz-Komfort', tarif: 'ERGO Premium', beitragRange: [450, 1200], faktor: 3.0 },
  { produkt: 'BU-Nachversicherung', tarif: 'ERGO BU Plus', beitragRange: [1000, 2500], faktor: 10.0 },
  { produkt: 'Haftpflicht', tarif: 'PHV Familie', beitragRange: [80, 250], faktor: 5.0 },
  { produkt: 'Risikoleben', tarif: 'RL Basis', beitragRange: [200, 800], faktor: 15.0 },
  { produkt: 'Rentenversicherung', tarif: 'fondsgebunden', beitragRange: [150, 500], faktor: 20.0 },
  { produkt: 'Wohngebäude', tarif: 'WG Plus', beitragRange: [350, 900], faktor: 4.0 },
  { produkt: 'Kranken-Zusatz', tarif: 'DKV AmbulantPlus', beitragRange: [120, 380], faktor: 8.0 },
  { produkt: 'Fondspolice', tarif: 'ERGO Balance', beitragRange: [800, 2000], faktor: 18.0 },
];

function generateAbschluesse() {
  const abschluesse = [];
  const baseAntragNr = CURRENT_YEAR * 1000 + CURRENT_MONTH * 80 + CURRENT_DAY;

  for (let i = 0; i < 10; i++) {
    const p = pick(PRODUKTE);
    const beitrag = Math.round(randBetween(p.beitragRange[0], p.beitragRange[1]));
    const date = new Date(CURRENT_YEAR, CURRENT_MONTH, CURRENT_DAY - i);
    const dd = String(date.getDate()).padStart(2, '0');
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const yyyy = date.getFullYear();

    abschluesse.push({
      datum: `${dd}.${mm}.${yyyy}`,
      vn: `${pick(FIRST_NAMES)} ${pick(LAST_NAMES)}`,
      produkt: p.produkt,
      tarif: p.tarif,
      antragNr: `A-${yyyy}-${baseAntragNr - i}`,
      beitrag,
      faktor: p.faktor,
      provision: Math.round(beitrag * p.faktor),
      status: rand() > 0.2 ? 'policiert' : 'angenommen',
    });
  }
  return abschluesse;
}

export const ABSCHLUESSE = generateAbschluesse();

// ── KI-Forecast (6 Monate ab aktuellem Monat) ──────────────
const FORECAST_MONTHS = Array.from({ length: 6 }, (_, i) => {
  const idx = (CURRENT_MONTH + 1 + i) % 12;
  return MONTH_LABELS[idx] + '*';
});

const MONTHLY_GROWTH = {
  neugeschaeft: 0.015, bestand: 0.008, storno: -0.01, nps: 0.005,
  risiko: -0.005, combined: -0.003, ergebnis: 0.02, underwriting: 0.002, deckungsbeitrag: 0.012,
};

export function generateForecastData(actualData) {
  if (!actualData || actualData.length === 0) return [];
  const fRand = mulberry32(42);
  const last = actualData[actualData.length - 1];
  const forecast = [];
  let prev = { ...last };

  for (let i = 0; i < 6; i++) {
    const point = { month: FORECAST_MONTHS[i], isForecast: true };
    for (const kpi of KPI_DEFS) {
      const val = prev[kpi.id] ?? 0;
      const growth = MONTHLY_GROWTH[kpi.id] || 0.01;
      // ±3% Varianz für realistischere Prognose
      const variance = 1 + (fRand() - 0.5) * 0.06;
      const raw = val * (1 + growth) * variance;
      point[kpi.id] = kpi.unit === 'currency' ? Math.round(raw) : +(raw).toFixed(1);
    }
    forecast.push(point);
    prev = point;
  }
  return forecast;
}

// ── Format-Helfer ───────────────────────────────────────────
export function fmtCur(val) {
  if (val >= 1000000) return `${(val / 1000000).toLocaleString('de-DE', { maximumFractionDigits: 1 })} Mio€`;
  if (val >= 1000) return `${(val / 1000).toLocaleString('de-DE', { maximumFractionDigits: 0 })}€`;
  return `${val.toLocaleString('de-DE')}€`;
}

export function fmtVal(val, unit) {
  if (unit === 'currency') return fmtCur(val);
  if (unit === 'percent') return `${val.toLocaleString('de-DE', { maximumFractionDigits: 1 })}%`;
  if (unit === 'score') return val.toLocaleString('de-DE', { maximumFractionDigits: 1 });
  return val.toLocaleString('de-DE');
}
