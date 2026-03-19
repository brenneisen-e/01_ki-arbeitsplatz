// Legacy A-03 "Gesamtübersicht" KPI definitions - mirrors js/config.js kpiDefinitions
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

// Monthly data (mirrors aggregated data from legacy CSV-based system)
const MONTHS = ['Jan', 'Feb', 'Mär', 'Apr', 'Mai', 'Jun', 'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Dez'];

export const MONTHLY_DATA = [
  { month: 'Jan', neugeschaeft: 2850000, bestand: 138000000, storno: 5.2, nps: 42, risiko: 3.1, combined: 94.2, ergebnis: 1200000, underwriting: 87.5, deckungsbeitrag: 980000 },
  { month: 'Feb', neugeschaeft: 3120000, bestand: 138500000, storno: 4.9, nps: 43, risiko: 3.0, combined: 93.8, ergebnis: 1350000, underwriting: 88.1, deckungsbeitrag: 1050000 },
  { month: 'Mär', neugeschaeft: 3450000, bestand: 139200000, storno: 5.1, nps: 44, risiko: 2.9, combined: 93.1, ergebnis: 1580000, underwriting: 89.0, deckungsbeitrag: 1180000 },
  { month: 'Apr', neugeschaeft: 2980000, bestand: 139800000, storno: 4.8, nps: 45, risiko: 2.8, combined: 92.5, ergebnis: 1420000, underwriting: 89.5, deckungsbeitrag: 1100000 },
  { month: 'Mai', neugeschaeft: 3280000, bestand: 140300000, storno: 5.0, nps: 46, risiko: 2.7, combined: 92.1, ergebnis: 1600000, underwriting: 90.2, deckungsbeitrag: 1220000 },
  { month: 'Jun', neugeschaeft: 2750000, bestand: 140600000, storno: 4.7, nps: 45, risiko: 2.9, combined: 93.0, ergebnis: 1280000, underwriting: 89.8, deckungsbeitrag: 1050000 },
  { month: 'Jul', neugeschaeft: 2620000, bestand: 140900000, storno: 4.5, nps: 47, risiko: 2.6, combined: 91.8, ergebnis: 1350000, underwriting: 90.5, deckungsbeitrag: 1080000 },
  { month: 'Aug', neugeschaeft: 2480000, bestand: 141100000, storno: 4.6, nps: 46, risiko: 2.7, combined: 92.3, ergebnis: 1180000, underwriting: 90.0, deckungsbeitrag: 980000 },
  { month: 'Sep', neugeschaeft: 3350000, bestand: 141400000, storno: 4.9, nps: 48, risiko: 2.5, combined: 91.5, ergebnis: 1650000, underwriting: 91.0, deckungsbeitrag: 1250000 },
  { month: 'Okt', neugeschaeft: 3580000, bestand: 141600000, storno: 5.0, nps: 47, risiko: 2.6, combined: 91.2, ergebnis: 1720000, underwriting: 91.3, deckungsbeitrag: 1320000 },
  { month: 'Nov', neugeschaeft: 3750000, bestand: 141800000, storno: 4.8, nps: 49, risiko: 2.4, combined: 90.8, ergebnis: 1850000, underwriting: 92.0, deckungsbeitrag: 1400000 },
  { month: 'Dez', neugeschaeft: 3900000, bestand: 141863691, storno: 5.0, nps: 48, risiko: 2.5, combined: 91.0, ergebnis: 1900000, underwriting: 91.5, deckungsbeitrag: 1450000 },
];

// Segment distribution (mirrors legacy config.js segmentFactors)
export const SEGMENT_VERTEILUNG = [
  { name: 'Leben', value: 35, color: '#3b82f6' },
  { name: 'Kranken', value: 22, color: '#10b981' },
  { name: 'Schaden', value: 24, color: '#8b5cf6' },
  { name: 'Kfz', value: 19, color: '#f59e0b' },
];

// Vertriebsweg distribution (mirrors legacy siloFactors)
export const VERTRIEBSWEG_VERTEILUNG = [
  { name: 'Ausschließlichkeit', value: 45, color: '#3b82f6' },
  { name: 'Makler', value: 28, color: '#10b981' },
  { name: 'Direktvertrieb', value: 15, color: '#8b5cf6' },
  { name: 'Banken', value: 12, color: '#f59e0b' },
];

// Bundesland data (mirrors legacy map data)
export const BUNDESLAND_DATA = [
  { name: 'Bayern', neugeschaeft: 5800000, bestand: 21200000, storno: 4.8, vermittler: 142, factor: 1.40 },
  { name: 'Baden-Württemberg', neugeschaeft: 5200000, bestand: 19100000, storno: 4.9, vermittler: 128, factor: 1.35 },
  { name: 'Nordrhein-Westfalen', neugeschaeft: 6100000, bestand: 18400000, storno: 5.2, vermittler: 156, factor: 1.30 },
  { name: 'Hessen', neugeschaeft: 4200000, bestand: 17600000, storno: 5.0, vermittler: 98, factor: 1.25 },
  { name: 'Hamburg', neugeschaeft: 3800000, bestand: 14500000, storno: 4.5, vermittler: 64, factor: 1.45 },
  { name: 'Niedersachsen', neugeschaeft: 3200000, bestand: 14100000, storno: 5.1, vermittler: 95, factor: 1.00 },
  { name: 'Schleswig-Holstein', neugeschaeft: 2800000, bestand: 10200000, storno: 4.7, vermittler: 72, factor: 1.02 },
  { name: 'Berlin', neugeschaeft: 2600000, bestand: 8500000, storno: 5.5, vermittler: 58, factor: 0.95 },
  { name: 'Rheinland-Pfalz', neugeschaeft: 2200000, bestand: 7800000, storno: 5.0, vermittler: 62, factor: 0.98 },
  { name: 'Sachsen', neugeschaeft: 1800000, bestand: 5200000, storno: 5.3, vermittler: 48, factor: 0.78 },
  { name: 'Bremen', neugeschaeft: 1500000, bestand: 3800000, storno: 4.6, vermittler: 22, factor: 1.05 },
  { name: 'Thüringen', neugeschaeft: 1200000, bestand: 3200000, storno: 5.4, vermittler: 38, factor: 0.72 },
  { name: 'Brandenburg', neugeschaeft: 1100000, bestand: 2900000, storno: 5.6, vermittler: 35, factor: 0.65 },
  { name: 'Sachsen-Anhalt', neugeschaeft: 980000, bestand: 2600000, storno: 5.5, vermittler: 32, factor: 0.68 },
  { name: 'Saarland', neugeschaeft: 820000, bestand: 2100000, storno: 4.9, vermittler: 18, factor: 0.82 },
  { name: 'Mecklenburg-Vorpommern', neugeschaeft: 720000, bestand: 1600000, storno: 5.8, vermittler: 24, factor: 0.55 },
];

// Top Vermittler (sales report / Agenturen table)
export const TOP_VERMITTLER = [
  { id: 'VM00001', name: 'Maria Musterfrau', region: 'Hessen', neugeschaeft: 890000, bestand: 12500000, storno: 3.8, nps: 62, abschluesse: 45 },
  { id: 'VM00002', name: 'Thomas Weber', region: 'Bayern', neugeschaeft: 820000, bestand: 11200000, storno: 4.1, nps: 58, abschluesse: 41 },
  { id: 'VM00003', name: 'Sabine Danzig', region: 'NRW', neugeschaeft: 780000, bestand: 10800000, storno: 4.3, nps: 55, abschluesse: 38 },
  { id: 'VM00004', name: 'Klaus Richter', region: 'Baden-Württemberg', neugeschaeft: 750000, bestand: 9600000, storno: 4.5, nps: 52, abschluesse: 36 },
  { id: 'VM00005', name: 'Petra Hoffmann', region: 'Hamburg', neugeschaeft: 720000, bestand: 8900000, storno: 3.9, nps: 60, abschluesse: 35 },
  { id: 'VM00006', name: 'Michael Braun', region: 'Niedersachsen', neugeschaeft: 680000, bestand: 8100000, storno: 4.6, nps: 48, abschluesse: 32 },
  { id: 'VM00007', name: 'Andrea Fischer', region: 'Berlin', neugeschaeft: 650000, bestand: 7500000, storno: 5.0, nps: 45, abschluesse: 30 },
  { id: 'VM00008', name: 'Frank Peters', region: 'Sachsen', neugeschaeft: 580000, bestand: 6200000, storno: 4.8, nps: 50, abschluesse: 28 },
  { id: 'VM00009', name: 'Heike Bauer', region: 'Rheinland-Pfalz', neugeschaeft: 520000, bestand: 5800000, storno: 4.2, nps: 54, abschluesse: 26 },
  { id: 'VM00010', name: 'Stefan Krüger', region: 'Schleswig-Holstein', neugeschaeft: 480000, bestand: 5100000, storno: 4.7, nps: 47, abschluesse: 24 },
];

// Vertriebsbericht / Abschlüsse (mirrors legacy salesReportTableBody)
export const ABSCHLUESSE = [
  { datum: '10.03.2026', vn: 'Ralf Dietrich', produkt: 'BU-Versicherung', tarif: 'BU Premium', antragNr: 'A-2026-1248', beitrag: 1500, faktor: 12.5, provision: 18750, status: 'policiert' },
  { datum: '09.03.2026', vn: 'Ingrid Sommer', produkt: 'Zahnzusatz', tarif: 'DKV ZZ Pro', antragNr: 'A-2026-1247', beitrag: 384, faktor: 8.0, provision: 3072, status: 'policiert' },
  { datum: '08.03.2026', vn: 'Michael Braun', produkt: 'Kfz-Komfort', tarif: 'ERGO Premium', antragNr: 'A-2026-1246', beitrag: 890, faktor: 3.0, provision: 2670, status: 'policiert' },
  { datum: '07.03.2026', vn: 'Peter Schmidt', produkt: 'BU-Nachversicherung', tarif: 'ERGO BU Plus', antragNr: 'A-2026-1245', beitrag: 1680, faktor: 10.0, provision: 16800, status: 'policiert' },
  { datum: '06.03.2026', vn: 'Anna Hoffmann', produkt: 'Haftpflicht', tarif: 'PHV Familie', antragNr: 'A-2026-1244', beitrag: 145, faktor: 5.0, provision: 725, status: 'policiert' },
  { datum: '05.03.2026', vn: 'Sabine Danzig', produkt: 'Risikoleben', tarif: 'RL Basis', antragNr: 'A-2026-1243', beitrag: 480, faktor: 15.0, provision: 7200, status: 'policiert' },
  { datum: '04.03.2026', vn: 'Amira König', produkt: 'Rentenversicherung', tarif: 'fondsgebunden', antragNr: 'A-2026-1242', beitrag: 250, faktor: 20.0, provision: 5000, status: 'angenommen' },
  { datum: '03.03.2026', vn: 'Thomas Weber', produkt: 'Wohngebäude', tarif: 'WG Plus', antragNr: 'A-2026-1241', beitrag: 650, faktor: 4.0, provision: 2600, status: 'policiert' },
  { datum: '02.03.2026', vn: 'Sandra Yilmaz', produkt: 'Kranken-Zusatz', tarif: 'DKV AmbulantPlus', antragNr: 'A-2026-1240', beitrag: 189, faktor: 8.0, provision: 1512, status: 'policiert' },
  { datum: '01.03.2026', vn: 'Dirk Hoffmann', produkt: 'Fondspolice', tarif: 'ERGO Balance', antragNr: 'A-2026-1239', beitrag: 1400, faktor: 18.0, provision: 25200, status: 'angenommen' },
];

// KI-Forecast: generate forecast months based on actual data
const FORECAST_MONTHS = ['Jan*', 'Feb*', 'Mär*', 'Apr*', 'Mai*', 'Jun*'];
const MONTHLY_GROWTH = {
  neugeschaeft: 0.015,
  bestand: 0.008,
  storno: -0.01,
  nps: 0.005,
  risiko: -0.005,
  combined: -0.003,
  ergebnis: 0.02,
  underwriting: 0.002,
  deckungsbeitrag: 0.012,
};

export function generateForecastData(actualData) {
  if (!actualData || actualData.length === 0) return [];
  const last = actualData[actualData.length - 1];
  const forecast = [];
  let prev = { ...last };

  for (let i = 0; i < 6; i++) {
    const point = { month: FORECAST_MONTHS[i], isForecast: true };
    for (const kpi of KPI_DEFS) {
      const val = prev[kpi.id] || 0;
      const growth = MONTHLY_GROWTH[kpi.id] || 0.01;
      const variance = 1 + (Math.random() - 0.5) * 0.004;
      point[kpi.id] = +(val * (1 + growth) * variance).toFixed(kpi.unit === 'currency' ? 0 : 1);
    }
    forecast.push(point);
    prev = point;
  }
  return forecast;
}

// Helper: format currency
export function fmtCur(val) {
  if (val >= 1000000) return `${(val / 1000000).toLocaleString('de-DE', { maximumFractionDigits: 1 })} Mio€`;
  if (val >= 1000) return `${(val / 1000).toLocaleString('de-DE', { maximumFractionDigits: 0 })}k€`;
  return `${val.toLocaleString('de-DE')}€`;
}

export function fmtVal(val, unit) {
  if (unit === 'currency') return fmtCur(val);
  if (unit === 'percent') return `${val.toLocaleString('de-DE', { maximumFractionDigits: 1 })}%`;
  if (unit === 'score') return val.toLocaleString('de-DE', { maximumFractionDigits: 1 });
  return val.toLocaleString('de-DE');
}
