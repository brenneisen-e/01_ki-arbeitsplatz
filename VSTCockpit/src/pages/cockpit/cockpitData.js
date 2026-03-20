// ═══════════════════════════════════════════════════════════════
// VST Cockpit – Generierter Mockdaten-Pool
// Alle Daten werden deterministisch per seeded PRNG erzeugt,
// damit die UI bei jedem Laden identische Werte zeigt.
// ═══════════════════════════════════════════════════════════════

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
const rand = mulberry32(20260320); // seed = today's date

// Helpers for generator
function randBetween(min, max) { return min + rand() * (max - min); }
function randInt(min, max) { return Math.floor(randBetween(min, max + 1)); }
function pick(arr) { return arr[Math.floor(rand() * arr.length)]; }

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

const MONTHS = ['Jan', 'Feb', 'Mär', 'Apr', 'Mai', 'Jun', 'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Dez'];

// Seasonality: relative strength per month (1.0 = average)
const SEASONALITY = [0.85, 0.92, 1.05, 0.95, 1.02, 0.88, 0.82, 0.78, 1.05, 1.12, 1.18, 1.22];

// ── Schritt 2: Vermittler-Generator ─────────────────────────
function generateVermittler() {
  const vermittler = [];
  let id = 1;
  const usedNames = new Set();

  for (const bl of BUNDESLAENDER) {
    // Generate ~10% of baseVermittler as named top-agents, rest is implicit
    const count = Math.max(3, Math.round(bl.baseVermittler * 0.08));
    for (let i = 0; i < count; i++) {
      let name;
      do {
        name = `${pick(FIRST_NAMES)} ${pick(LAST_NAMES)}`;
      } while (usedNames.has(name));
      usedNames.add(name);

      const quality = randBetween(0.4, 1.0); // agent quality tier
      vermittler.push({
        id: `VM${String(id++).padStart(5, '0')}`,
        name,
        region: bl.abbr === 'NRW' ? 'NRW' : bl.name,
        bundesland: bl.name,
        neugeschaeft: Math.round(randBetween(180000, 950000) * quality * bl.factor),
        bestand: Math.round(randBetween(2000000, 14000000) * quality * bl.factor),
        storno: +(randBetween(3.2, 6.0) * (1.1 - quality * 0.3)).toFixed(1),
        nps: Math.round(randBetween(35, 68) * (0.7 + quality * 0.5)),
        abschluesse: Math.round(randBetween(12, 50) * quality),
      });
    }
  }

  // Sort by neugeschaeft descending
  vermittler.sort((a, b) => b.neugeschaeft - a.neugeschaeft);
  return vermittler;
}

const ALL_VERMITTLER = generateVermittler();
export const TOP_VERMITTLER = ALL_VERMITTLER.slice(0, 10);

// ── Schritt 3: Bundesland-Aggregation ───────────────────────
function generateBundeslandData() {
  return BUNDESLAENDER.map(bl => {
    const blVermittler = ALL_VERMITTLER.filter(v => v.bundesland === bl.name);
    // Vermittler in the list are only ~10%, scale up
    const scaleFactor = bl.baseVermittler / Math.max(1, blVermittler.length);
    const ngSum = blVermittler.reduce((s, v) => s + v.neugeschaeft, 0);
    const bsSum = blVermittler.reduce((s, v) => s + v.bestand, 0);
    const stornoAvg = blVermittler.length > 0
      ? blVermittler.reduce((s, v) => s + v.storno, 0) / blVermittler.length
      : 5.0;

    return {
      name: bl.name,
      neugeschaeft: Math.round(ngSum * scaleFactor),
      bestand: Math.round(bsSum * scaleFactor),
      storno: +stornoAvg.toFixed(1),
      vermittler: bl.baseVermittler,
      factor: bl.factor,
    };
  });
}

export const BUNDESLAND_DATA = generateBundeslandData();

// ── Schritt 4: Monatsdaten-Generator ────────────────────────
function generateMonthlyData() {
  // Base annual totals (derived from Bundesland sums)
  const totalNG = BUNDESLAND_DATA.reduce((s, bl) => s + bl.neugeschaeft, 0);
  const totalBestand = BUNDESLAND_DATA.reduce((s, bl) => s + bl.bestand, 0);
  const baseMonthNG = totalNG / 12;

  let runningBestand = Math.round(totalBestand * 0.97); // start slightly below year-end

  return MONTHS.map((month, i) => {
    const s = SEASONALITY[i];
    const ng = Math.round(baseMonthNG * s * randBetween(0.95, 1.05));
    runningBestand = Math.round(runningBestand + ng * randBetween(0.15, 0.25));

    return {
      month,
      neugeschaeft: ng,
      bestand: runningBestand,
      storno: +(randBetween(4.3, 5.5) * (i < 6 ? 1.02 : 0.98)).toFixed(1),
      nps: Math.round(randBetween(41, 50) + i * 0.5),
      risiko: +(randBetween(2.3, 3.2) - i * 0.05).toFixed(1),
      combined: +(randBetween(90.5, 94.5) - i * 0.25).toFixed(1),
      ergebnis: Math.round(ng * randBetween(0.35, 0.52)),
      underwriting: +(randBetween(87, 92) + i * 0.35).toFixed(1),
      deckungsbeitrag: Math.round(ng * randBetween(0.28, 0.40)),
    };
  });
}

export const MONTHLY_DATA = generateMonthlyData();

// ── Segment & Vertriebsweg (statisch, da rein prozentual) ───
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

// ── Schritt 5: Abschlüsse-Generator ────────────────────────
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
  for (let i = 0; i < 10; i++) {
    const p = pick(PRODUKTE);
    const beitrag = Math.round(randBetween(p.beitragRange[0], p.beitragRange[1]));
    const day = 10 - i; // 10.03 → 01.03
    abschluesse.push({
      datum: `${String(day).padStart(2, '0')}.03.2026`,
      vn: `${pick(FIRST_NAMES)} ${pick(LAST_NAMES)}`,
      produkt: p.produkt,
      tarif: p.tarif,
      antragNr: `A-2026-${1248 - i}`,
      beitrag,
      faktor: p.faktor,
      provision: Math.round(beitrag * p.faktor),
      status: rand() > 0.2 ? 'policiert' : 'angenommen',
    });
  }
  return abschluesse;
}

export const ABSCHLUESSE = generateAbschluesse();

// ── Schritt 6: KI-Forecast (seeded) ────────────────────────
const FORECAST_MONTHS = ['Jan*', 'Feb*', 'Mär*', 'Apr*', 'Mai*', 'Jun*'];
const MONTHLY_GROWTH = {
  neugeschaeft: 0.015, bestand: 0.008, storno: -0.01, nps: 0.005,
  risiko: -0.005, combined: -0.003, ergebnis: 0.02, underwriting: 0.002, deckungsbeitrag: 0.012,
};

// Use a separate seeded PRNG for forecast so it's stable independently
const forecastRand = mulberry32(42);

export function generateForecastData(actualData) {
  if (!actualData || actualData.length === 0) return [];
  // Reset forecast PRNG for deterministic output
  const fRand = mulberry32(42);
  const last = actualData[actualData.length - 1];
  const forecast = [];
  let prev = { ...last };

  for (let i = 0; i < 6; i++) {
    const point = { month: FORECAST_MONTHS[i], isForecast: true };
    for (const kpi of KPI_DEFS) {
      const val = prev[kpi.id] || 0;
      const growth = MONTHLY_GROWTH[kpi.id] || 0.01;
      const variance = 1 + (fRand() - 0.5) * 0.004;
      point[kpi.id] = +(val * (1 + growth) * variance).toFixed(kpi.unit === 'currency' ? 0 : 1);
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
