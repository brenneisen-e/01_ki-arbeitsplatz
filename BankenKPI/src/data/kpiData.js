// KPI-Daten in Anlehnung an die monatliche XYZ-Meldung (siehe NordLB-Bericht).
// Die Werte sind DUMMY-Daten und dienen ausschließlich der Demo.

export const SEGMENTS = [
  { id: 'konzern',      label: 'Konzern' },
  { id: 'firmen',       label: 'Firmenkunden' },
  { id: 'structured',   label: 'Structured Finance' },
  { id: 'immobilien',   label: 'Immobilienkunden' },
  { id: 'markets',      label: 'Markets' },
  { id: 'privatkunden', label: 'Privatkunden' },
  { id: 'treasury',     label: 'Treasury' },
];

export const KPI_GROUPS = [
  {
    id: 'neugeschaeft',
    label: 'Neugeschäft',
    kpis: [
      { id: 'neugeschaeft',     label: 'Neugeschäft',       unit: 'MEUR', invertTrend: false },
      { id: 'neugeschaeftsmarge', label: 'Neugeschäftsmarge', unit: '%',  invertTrend: false },
    ],
  },
  {
    id: 'volumina',
    label: 'Volumina',
    kpis: [
      { id: 'aktivvolumen',   label: 'Aktivvolumen',   unit: 'MEUR', invertTrend: false },
      { id: 'aktivmarge',     label: 'Aktivmarge',     unit: '%',    invertTrend: false },
      { id: 'einlagenvolumen', label: 'Einlagenvolumen', unit: 'MEUR', invertTrend: false },
      { id: 'einlagenmarge',  label: 'Einlagenmarge',  unit: '%',    invertTrend: false },
    ],
  },
  {
    id: 'rentabilitaet',
    label: 'Rentabilität / Produktivität',
    kpis: [
      { id: 'rwa',           label: 'RWA',                  unit: 'MEUR', invertTrend: true },
      { id: 'rwaProd',       label: 'RWA-Produktivität',    unit: '%',    invertTrend: false },
      { id: 'roRac',         label: 'RoRaC (Konzern RoE)',  unit: '%',    invertTrend: false },
      { id: 'cir',           label: 'Cost/Income Ratio',    unit: '%',    invertTrend: true },
    ],
  },
];

// Werte aus dem PDF (Stand 14.01.2026).
// Struktur: KPI -> Segment -> { ist, plan }
export const KPI_VALUES = {
  neugeschaeft: {
    konzern:      { ist: 25000,  plan: 30000 },
    firmen:       { ist: 10000,  plan: 12000 },
    structured:   { ist: 8000,   plan: 10000 },
    immobilien:   { ist: 5000,   plan: 8000  },
    markets:      { ist: 500,    plan: 1000  },
    privatkunden: { ist: 500,    plan: 500   },
    treasury:     { ist: 200,    plan: 200   },
  },
  neugeschaeftsmarge: {
    konzern:      { ist: 0.90,  plan: 1.10 },
    firmen:       { ist: 0.90,  plan: 1.00 },
    structured:   { ist: 1.70,  plan: 2.00 },
    immobilien:   { ist: 0.90,  plan: 1.00 },
    markets:      { ist: 1.70,  plan: 2.00 },
    privatkunden: { ist: 0.80,  plan: 1.00 },
    treasury:     { ist: 100.00, plan: 100.00 },
  },
  aktivvolumen: {
    konzern:      { ist: 110000, plan: 112000 },
    firmen:       { ist: 28000,  plan: 30000 },
    structured:   { ist: 20000,  plan: 20000 },
    immobilien:   { ist: 18000,  plan: 21000 },
    markets:      { ist: 8000,   plan: 8500 },
    privatkunden: { ist: 8000,   plan: 10000 },
    treasury:     { ist: 25000,  plan: 25000 },
  },
  aktivmarge: {
    konzern:      { ist: 0.3,  plan: 0.5 },
    firmen:       { ist: 1.9,  plan: 2.0 },
    structured:   { ist: 3.4,  plan: 4.0 },
    immobilien:   { ist: 6.8,  plan: 6.0 },
    markets:      { ist: 0.1,  plan: 0.2 },
    privatkunden: { ist: 0.8,  plan: 1.00 },
    treasury:     { ist: -0.02, plan: 0.00 },
  },
  einlagenvolumen: {
    konzern:      { ist: 110000, plan: 112000 },
    firmen:       { ist: 10000,  plan: 12000 },
    structured:   { ist: 5000,   plan: 4000 },
    immobilien:   { ist: 1000,   plan: 1500 },
    markets:      { ist: 40000,  plan: 40000 },
    privatkunden: { ist: 10000,  plan: 12000 },
    treasury:     { ist: 50000,  plan: 50000 },
  },
  einlagenmarge: {
    konzern:      { ist: 0.9,  plan: 1.0 },
    firmen:       { ist: 1.9,  plan: 2.0 },
    structured:   { ist: 1.7,  plan: 2.0 },
    immobilien:   { ist: 0.7,  plan: 1.0 },
    markets:      { ist: 2.4,  plan: 2.5 },
    privatkunden: { ist: 2.0,  plan: 2.0 },
    treasury:     { ist: -0.5, plan: 0.0 },
  },
  rwa: {
    konzern:      { ist: 40000, plan: 35000 },
    firmen:       { ist: 10000, plan: 8000 },
    structured:   { ist: 10000, plan: 8000 },
    immobilien:   { ist: 10000, plan: 5000 },
    markets:      { ist: 2000,  plan: 2000 },
    privatkunden: { ist: 4000,  plan: 4000 },
    treasury:     { ist: 2000,  plan: 2000 },
  },
  rwaProd: {
    konzern:      { ist: 0.88, plan: 1.00 },
    firmen:       { ist: 1.90, plan: 2.00 },
    structured:   { ist: 1.69, plan: 1.80 },
    immobilien:   { ist: 0.68, plan: 0.80 },
    markets:      { ist: 2.40, plan: 2.50 },
    privatkunden: { ist: 2.03, plan: 2.10 },
    treasury:     { ist: -0.84, plan: -0.50 },
  },
  roRac: {
    konzern:      { ist: 6.00,  plan: 10.00 },
    firmen:       { ist: 12.00, plan: 14.00 },
    structured:   { ist: 16.00, plan: 16.00 },
    immobilien:   { ist: 6.00,  plan: 6.00 },
    markets:      { ist: 11.00, plan: 15.00 },
    privatkunden: { ist: 17.00, plan: 15.00 },
    treasury:     { ist: -2.59, plan: 0.00 },
  },
  cir: {
    konzern:      { ist: 63.00,  plan: 60.00 },
    firmen:       { ist: 41.00,  plan: 40.00 },
    structured:   { ist: 44.00,  plan: 40.00 },
    immobilien:   { ist: 41.00,  plan: 40.00 },
    markets:      { ist: 70.00,  plan: 60.00 },
    privatkunden: { ist: 77.00,  plan: 70.00 },
    treasury:     { ist: 132.00, plan: 100.00 },
  },
};

// 12-Monats-Historie pro KPI x Segment, generiert aus dem aktuellen Ist-Wert
// mit deterministischer Variation um den Plan herum (Seed je KPI/Segment).
// Die Monatsachse endet auf dem aktuellen Monat, damit der Chart-Endpunkt
// zum „Stand"-Datum im Header passt.
const MONTH_LABELS = ['Jan', 'Feb', 'Mär', 'Apr', 'Mai', 'Jun', 'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Dez'];

function buildMonthAxis() {
  const now = new Date();
  const out = [];
  for (let i = 11; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    out.push(MONTH_LABELS[d.getMonth()]);
  }
  return out;
}

function seedHash(str) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}
function rand(seed, idx) {
  const x = Math.sin(seed + idx * 9301) * 10000;
  return x - Math.floor(x);
}

export function buildHistory(kpiId, segmentId) {
  const cell = KPI_VALUES[kpiId]?.[segmentId];
  if (!cell) return [];
  const seed = seedHash(kpiId + ':' + segmentId);
  const target = cell.ist;
  const plan = cell.plan;
  const span = Math.abs(plan) > 0.0001 ? Math.abs(plan) * 0.18 : Math.max(Math.abs(target) * 0.1, 0.5);
  const months = buildMonthAxis();
  const out = [];
  for (let i = 0; i < 12; i++) {
    const t = i / 11;
    const noise = (rand(seed, i) - 0.5) * span;
    const drift = (target - plan) * t;
    const val = plan + drift + noise;
    out.push({
      month: months[i],
      ist: Math.round(val * 100) / 100,
      plan: Math.round(plan * 100) / 100,
    });
  }
  // Letzten Punkt exakt auf Ist setzen
  out[out.length - 1].ist = target;
  return out;
}

// === Formatierung (deutsche Lokalisierung) ====================
export function fmtVal(value, unit) {
  if (value === null || value === undefined || Number.isNaN(value)) return '–';
  if (unit === '%') {
    return value.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' %';
  }
  if (unit === 'MEUR') {
    return value.toLocaleString('de-DE', { minimumFractionDigits: 0, maximumFractionDigits: 0 }) + ' Mio. €';
  }
  return value.toLocaleString('de-DE');
}

export function fmtCompact(value, unit) {
  if (value === null || value === undefined || Number.isNaN(value)) return '–';
  if (unit === '%') {
    return value.toLocaleString('de-DE', { minimumFractionDigits: 1, maximumFractionDigits: 2 }) + '%';
  }
  if (unit === 'MEUR') {
    if (Math.abs(value) >= 1000) {
      return (value / 1000).toLocaleString('de-DE', { minimumFractionDigits: 1, maximumFractionDigits: 1 }) + ' Mrd';
    }
    return value.toLocaleString('de-DE') + ' Mio';
  }
  return value.toLocaleString('de-DE');
}

// === Ampel & Abweichungen =====================================
export function deviationPct(ist, plan, invertTrend) {
  if (plan === 0 || plan === undefined || plan === null) return null;
  const raw = ((ist - plan) / Math.abs(plan)) * 100;
  return invertTrend ? -raw : raw;
}

// Ampel-Logik aus PDF: XYZ ≥ 100% grün, 95% ≤ XYZ < 100% gelb, < 95% rot
// Wir mappen pro KPI: erfüllung = ist/plan (für invertTrend: plan/ist)
export function ampelColor(ist, plan, invertTrend) {
  if (plan === 0 || plan === undefined || plan === null) return 'gray';
  const ratio = invertTrend
    ? (plan === 0 ? 0 : Math.abs(plan) / Math.max(Math.abs(ist), 0.0001))
    : (ist / plan);
  // Sonderfall: negativ / Vorzeichenwechsel
  if (Number.isNaN(ratio) || ratio < 0) return 'red';
  if (ratio >= 1.0) return 'green';
  if (ratio >= 0.95) return 'yellow';
  return 'red';
}

export const AMPEL_COLORS = {
  green:  { bg: '#dcfce7', text: '#166534', dot: '#16a34a' },
  yellow: { bg: '#fef3c7', text: '#92400e', dot: '#f59e0b' },
  red:    { bg: '#fee2e2', text: '#991b1b', dot: '#dc2626' },
  gray:   { bg: '#f1f5f9', text: '#475569', dot: '#94a3b8' },
};

// Stand des Berichts. Wird zur Laufzeit ermittelt, damit der Bericht
// immer „heute" zeigt. Format: DD.MM.YYYY.
export function getReportDate() {
  return new Date().toLocaleDateString('de-DE', {
    day: '2-digit', month: '2-digit', year: 'numeric',
  });
}

// Backwards-Kompatibilität: einige Stellen importieren `REPORT_DATE`
// als String. Ein Getter via Object.defineProperty auf dem Modul wäre
// schöner, in ESM aber nicht möglich – wir vergeben deshalb einen
// Live-String, der bei Modul-Initialisierung gesetzt wird. Komponenten,
// die den aktuellen Tag wirklich benötigen (z. B. Header) rufen
// `getReportDate()` direkt auf.
export const REPORT_DATE = getReportDate();
