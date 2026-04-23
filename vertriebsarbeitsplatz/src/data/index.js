import { getKunden, preloadKunden } from './generator';
import { getLang } from '../utils/langHelper';
import { getKundeFoto } from '../utils/kundenFotos';

// Hilfsfunktion: nutzt das zentrale Foto-Mapping aus kundenFotos.js und fällt
// nur dann auf einen explizit angegebenen Pfad zurück, wenn der Kunde dort
// nicht eingetragen ist (z. B. Pipeline-Mockups VV-NEW). Damit bleiben
// Übersicht- und Detail-Foto eines Kunden zwingend identisch.
function fotoFor(kundeId, fallback) {
  return getKundeFoto(kundeId) || fallback || null;
}
function tx(de, en) { return getLang() === 'en' ? en : de; }

// Re-export preloadKunden for mode switching
export { preloadKunden };

// Translate name prefixes like "Familie" → "Family"
export function translateName(name) {
  if (getLang() !== 'en') return name;
  return name
    .replace(/^Familie /, 'Family ')
    .replace(/^Fam\. /, 'Family ')
    .replace(/^Stiftung /, 'Foundation ');
}

// ═══ Lazy per-mode helper ═══
// Daten werden erst beim ersten Zugriff auf den jeweiligen Modus erzeugt.
// tx()-Aufrufe werden ebenfalls erst bei Bedarf ausgewertet.
function lazyByMode(factories) {
  const _cache = {};
  const obj = {};
  for (const [mode, factory] of Object.entries(factories)) {
    Object.defineProperty(obj, mode, {
      get() {
        if (!_cache[mode]) _cache[mode] = factory();
        return _cache[mode];
      },
      enumerable: true,
      configurable: true,
    });
  }
  return obj;
}

// Dynamisch generierte Kunden (Showcase + generierte)
// Lazy: Werden beim ersten Zugriff generiert und gecacht
// Wirft ein Promise für React Suspense wenn Daten noch nicht geladen
export const KUNDEN_BY_MODE = {
  get versicherung() { return getKunden('versicherung'); },
  get banking() { return getKunden('banking'); },
  get vermoegensverwaltung() { return getKunden('vermoegensverwaltung'); },
};

// Legacy exports entfernt — vorher wurden hier ALLE 3 Modi sofort ausgewertet!
// Nutze stattdessen KUNDEN_BY_MODE[modeId] (lazy per getter).

export function getKundeById(modeId, kundeId) {
  const list = KUNDEN_BY_MODE[modeId] || [];
  return list.find(k => k.id === kundeId);
}

// Showcase-Kunden pro Modus: Potentiale werden priorisiert angezeigt.
export const SHOWCASE_KUNDE_IDS = {
  versicherung: 'KD00001',       // Peter Schmidt
  banking: 'BK00001',            // Klaus Fischer
  vermoegensverwaltung: null,
};

const _potentialeCache = {};
export function getAllPotentiale(modeId) {
  if (_potentialeCache[modeId]) return _potentialeCache[modeId];
  const kunden = KUNDEN_BY_MODE[modeId] || [];
  const showcaseId = SHOWCASE_KUNDE_IDS[modeId];
  // Stable ordering: showcase customer first, rest unchanged.
  const orderedKunden = showcaseId
    ? [
        ...kunden.filter(k => k.id === showcaseId),
        ...kunden.filter(k => k.id !== showcaseId),
      ]
    : kunden;
  const result = orderedKunden.flatMap(k =>
    (k.potentiale || []).map(p => ({
      ...p,
      kundeId: k.id,
      kundeName: k.name,
      _showcase: k.id === showcaseId,
    }))
  );
  _potentialeCache[modeId] = result;
  return result;
}

// =============================================
// NEUGESCHAEFT — lazy per mode
// =============================================
export const NEUGESCHAEFT_DATA = lazyByMode({
  versicherung: () => ({
    kpiValues: {
      antraege: { wert: 86, trend: 12.5 },
      policiert: { wert: 392209, trend: 8.3 },
      ape: { wert: 313000, trend: 15.2 },
      abschlussquote: { wert: 77.9, trend: 3.1 },
    },
    spartenVerteilung: [
      { name: tx('Leben', 'Life'), value: 32, color: '#3b82f6' },
      { name: tx('Kranken', 'Health'), value: 21, color: '#10b981' },
      { name: tx('Schaden', 'Property'), value: 21, color: '#8b5cf6' },
      { name: tx('Kfz', 'Motor'), value: 12, color: '#f59e0b' },
    ],
    top5: [
      { name: 'Ralf Dietrich', betrag: 1585 },
      { name: 'Ingrid Sommer', betrag: 514 },
      { name: 'Dirk Hoffmann', betrag: 1400 },
      { name: 'Heike Bauer', betrag: 890 },
      { name: 'Frank Peters', betrag: 720 },
    ],
    vertraege: [
      { id: 'NG-2026-001', kundeId: 'KD00026', kunde: 'Ralf Dietrich', sparte: 'leben', produkt: 'BU-Versicherung', versicherer: 'HDI', beitrag: 1500, beitragsart: 'mtl', status: 'policiert', datum: '2026-01-15' },
      { id: 'NG-2026-002', kundeId: 'KD00026', kunde: 'Ralf Dietrich', sparte: 'schaden', produkt: 'Haftpflicht', versicherer: 'HDI', beitrag: 85, beitragsart: 'J', status: 'policiert', datum: '2026-01-15' },
      { id: 'NG-2026-003', kundeId: 'KD00027', kunde: 'Ingrid Sommer', sparte: 'kranken', produkt: 'Zahnzusatz', versicherer: 'DKV', beitrag: 384, beitragsart: 'mtl', status: 'policiert', datum: '2026-02-01' },
      { id: 'NG-2026-004', kundeId: 'KD00027', kunde: 'Ingrid Sommer', sparte: 'schaden', produkt: 'Hausrat', versicherer: 'Allianz', beitrag: 130, beitragsart: 'J', status: 'policiert', datum: '2026-02-01' },
      { id: 'NG-2026-005', kundeId: 'KD00028', kunde: 'Dirk Hoffmann', sparte: 'leben', produkt: 'Fondspolice', versicherer: 'ERGO', beitrag: 1400, beitragsart: 'mtl', status: 'policiert', datum: '2026-02-10' },
    ],
  }),
  banking: () => ({
    kpiValues: {
      antraege: { wert: 28, trend: 8.2 },
      policiert: { wert: 2850000, trend: 12.1 },
      ape: { wert: 24800, trend: 6.5 },
      abschlussquote: { wert: 72.0, trend: 4.0 },
    },
    spartenVerteilung: [
      { name: 'Kredit', value: 8, color: '#3b82f6' },
      { name: 'Wertpapier', value: 7, color: '#10b981' },
      { name: 'Verbund (R+V)', value: 5, color: '#8b5cf6' },
      { name: 'Einlage', value: 4, color: '#f59e0b' },
      { name: 'Bausparen', value: 3, color: '#ec4899' },
      { name: 'Kontomodelle', value: 1, color: '#6b7280' },
    ],
    top5: [
      { name: 'Klaus Fischer', betrag: 8200 },
      { name: 'Peter Hoffmann', betrag: 5400 },
      { name: 'Sandra Müller', betrag: 4100 },
      { name: 'Andrea Lang', betrag: 3600 },
      { name: 'Markus Wagner', betrag: 2200 },
    ],
    vertraege: [
      { id: 'BNG-2026-001', kundeId: 'KDB001', kunde: 'Klaus Fischer', sparte: 'wertpapier', produkt: 'VR-MeinDepot ETF-Sparplan', versicherer: 'Union Investment', beitrag: 300, beitragsart: 'mtl', status: 'aktiv', datum: '2026-01-22' },
      { id: 'BNG-2026-003', kundeId: 'KDB002', kunde: 'Sandra Müller', sparte: 'vorsorge', produkt: 'UniProfiRente', versicherer: 'Union Investment', beitrag: 175, beitragsart: 'mtl', status: 'aktiv', datum: '2026-02-05' },
      { id: 'BNG-2026-004', kundeId: 'KDB005', kunde: 'Peter Hoffmann', sparte: 'wertpapier', produkt: 'VermögenPlus Depot', versicherer: 'Union Investment', beitrag: 500, beitragsart: 'mtl', status: 'aktiv', datum: '2026-02-12' },
      { id: 'BNG-2026-005', kundeId: 'KDB005', kunde: 'Peter Hoffmann', sparte: 'versicherung', produkt: 'R+V Risikoleben', versicherer: 'R+V', beitrag: 240, beitragsart: 'J', status: 'vermittelt', datum: '2026-02-12' },
      { id: 'BNG-2026-006', kundeId: 'KDB006', kunde: 'Andrea Lang', sparte: 'kredit', produkt: 'Praxiskredit', versicherer: 'VB Mittelhessen', beitrag: 85000, beitragsart: 'ges', status: 'ausgezahlt', datum: '2026-02-28' },
      { id: 'BNG-2026-007', kundeId: 'KDB003', kunde: 'Markus Wagner', sparte: 'einlage', produkt: 'VR-Tagesgeld Extra', versicherer: 'VB Mittelhessen', beitrag: 25000, beitragsart: 'ges', status: 'aktiv', datum: '2026-03-01' },
    ],
  }),
  vermoegensverwaltung: () => ({
    kpiValues: {
      antraege: { wert: 3, trend: 50.0 },
      policiert: { wert: 5800000, trend: 15.3 },
      ape: { wert: 892000, trend: 8.7 },
      abschlussquote: { wert: 85.0, trend: 5.0 },
    },
    spartenVerteilung: [
      { name: 'FairValue', value: 2, color: '#3b82f6' },
      { name: 'SmartValue', value: 1, color: '#10b981' },
    ],
    top5: [
      { name: translateName('Familie Bergmann-Roth'), betrag: 3500000 },
      { name: 'Dr. Anna Fischer', betrag: 1500000 },
      { name: 'Maxim Meydarn', betrag: 800000 },
    ],
    vertraege: [
      { id: 'VV-2026-001', kundeId: 'VV008', kunde: translateName('Familie Bergmann-Roth'), sparte: 'fairvalue', produkt: 'VV + Family Office', versicherer: 'HRK LUNIS', beitrag: 3500000, beitragsart: 'ges', status: 'aktiv', datum: '2026-01-15' },
      { id: 'VV-2026-002', kundeId: 'VV-NEW', kunde: 'Dr. Anna Fischer', sparte: 'fairvalue', produkt: 'Individuelle VV', versicherer: 'HRK LUNIS', beitrag: 1500000, beitragsart: 'ges', status: 'onboarding', datum: '2026-03-11' },
      { id: 'VV-2026-003', kundeId: 'VV005', kunde: 'Maxim Meydarn', sparte: 'smartvalue', produkt: 'SmartValue VV', versicherer: 'HRK LUNIS', beitrag: 800000, beitragsart: 'ges', status: 'aktiv', datum: '2026-02-01' },
    ],
  }),
});

// =============================================
// BESTAND — lazy per mode
// =============================================
export const BESTAND_DATA = lazyByMode({
  versicherung: () => ({
    kpiValues: {
      vertraege: { wert: 42, trend: 2.1 },
      praemienvolumen: { wert: 141863, trend: 0.9 },
      durchschnittspraemie: { wert: 3378, trend: -0.5 },
      vertragsdichte: { wert: 3.8, trend: 0.2 },
    },
  }),
  banking: () => ({
    kpiValues: {
      vertraege: { wert: 140, trend: 5.4 },
      praemienvolumen: { wert: 4200000, trend: 3.2 },
      durchschnittspraemie: { wert: 3800000, trend: 1.8 },
      vertragsdichte: { wert: 3.5, trend: 0.3 },
    },
  }),
  vermoegensverwaltung: () => ({
    kpiValues: {
      vertraege: { wert: 5, trend: 25.0 },
      praemienvolumen: { wert: 30050000, trend: 4.2 },
      durchschnittspraemie: { wert: 6010000, trend: -1.8 },
      vertragsdichte: { wert: 1.0, trend: 0.0 },
    },
  }),
});

// =============================================
// STORNO — lazy per mode
// =============================================
export const STORNO_DATA = lazyByMode({
  versicherung: () => ({
    kpiValues: {
      stornoAnzahl: { wert: 4, trend: -25.0 },
      stornoQuote: { wert: 5.0, trend: -0.3 },
      stornoVolumen: { wert: 8200, trend: -15.0 },
      fruehstorno: { wert: 1, trend: -50.0 },
    },
    gruende: [
      { name: tx('Preis', 'Price'), value: 35 },
      { name: tx('Wettbewerb', 'Competition'), value: 25 },
      { name: tx('Umzug', 'Relocation'), value: 15 },
      { name: tx('Unzufriedenheit', 'Dissatisfaction'), value: 15 },
      { name: tx('Sonstiges', 'Other'), value: 10 },
    ],
    vertraege: [
      { kunde: 'Herbert Lange', kundeId: 'KD00012', produkt: 'ERGO Hausrat Komfort', sparte: tx('Schaden', 'Property'), praemie: 280, stornoDatum: '2025-11-15', grund: tx('Preis', 'Price'), typ: tx('Spätstorno', 'Late Cancel.') },
      { kunde: 'Sandra Richter', kundeId: 'KD00018', produkt: 'ERGO BU Comfort', sparte: tx('Leben', 'Life'), praemie: 1920, stornoDatum: '2025-09-22', grund: tx('Wettbewerb', 'Competition'), typ: tx('Spätstorno', 'Late Cancel.') },
      { kunde: 'Frank Zimmermann', kundeId: 'KD00025', produkt: 'ERGO Kfz-Vollkasko', sparte: tx('Kfz', 'Motor'), praemie: 780, stornoDatum: '2026-01-08', grund: tx('Umzug', 'Relocation'), typ: tx('Frühstorno', 'Early Cancel.') },
      { kunde: 'Monika Becker', kundeId: 'KD00031', produkt: tx('ERGO Privat Familie', 'ERGO Private Family'), sparte: tx('Schaden', 'Property'), praemie: 95, stornoDatum: '2025-12-03', grund: tx('Unzufriedenheit', 'Dissatisfaction'), typ: tx('Spätstorno', 'Late Cancel.') },
    ],
  }),
  banking: () => ({
    kpiValues: {
      stornoAnzahl: { wert: 6, trend: -14.3 },
      stornoQuote: { wert: 4.3, trend: -0.2 },
      stornoVolumen: { wert: 125000, trend: -8.5 },
      fruehstorno: { wert: 2, trend: 0.0 },
    },
    gruende: [
      { name: tx('Konditionen (bessere Zinsen)', 'Terms (better rates)'), value: 30 },
      { name: tx('Bankenwechsel (Umzug)', 'Bank switch (relocation)'), value: 25 },
      { name: tx('Wechsel zu Neobank', 'Switch to neobank'), value: 20 },
      { name: tx('Unzufriedenheit (Service)', 'Dissatisfaction (service)'), value: 15 },
      { name: tx('Sonstiges (Todesfall etc.)', 'Other (death etc.)'), value: 10 },
    ],
  }),
  vermoegensverwaltung: () => ({
    kpiValues: {
      stornoAnzahl: { wert: 0, trend: 0.0 },
      stornoQuote: { wert: 0.0, trend: 0.0 },
      stornoVolumen: { wert: 0, trend: 0.0 },
      fruehstorno: { wert: 0, trend: 0.0 },
    },
    gruende: [
      { name: tx('Performance', 'Performance'), value: 40 },
      { name: tx('Gebühren', 'Fees'), value: 30 },
      { name: tx('Konsolidierung', 'Consolidation'), value: 20 },
      { name: tx('Sonstiges', 'Other'), value: 10 },
    ],
  }),
});

// =============================================
// VERGUETUNG / ERTRAEGE — lazy per mode
// =============================================
export const VERGUETUNG_DATA = lazyByMode({
  versicherung: () => ({
    kpiValues: {
      provision: { wert: 48500, trend: 8.2 },
      ap: { wert: 32000, trend: 12.5 },
      bp: { wert: 14500, trend: 2.1 },
      dynprov: { wert: 2000, trend: 5.0 },
    },
    kpiConfig: [
      { id: 'provision', label: tx('Provision YTD', 'Commission YTD'), format: 'eur', icon: 'Wallet' },
      { id: 'ap', label: tx('Abschlussprovision', 'Closing Commission'), format: 'eur', icon: 'TrendingUp' },
      { id: 'bp', label: tx('Bestandsprovision', 'Portfolio Commission'), format: 'eur', icon: 'Briefcase' },
      { id: 'dynprov', label: tx('Dynamikprovision', 'Dynamic Commission'), format: 'eur', icon: 'Zap' },
    ],
    monthlyData: [
      { name: 'Jan', value: 4200 },
      { name: 'Feb', value: 5100 },
      { name: tx('Mär', 'Mar'), value: 4800 },
      { name: tx('Apr', 'Apr'), value: 6200 },
      { name: tx('Mai', 'May'), value: 5500 },
      { name: 'Jun', value: 7100 },
      { name: 'Jul', value: 4900 },
      { name: 'Aug', value: 3800 },
      { name: 'Sep', value: 5600 },
      { name: tx('Okt', 'Oct'), value: 6800 },
      { name: 'Nov', value: 5200 },
      { name: tx('Dez', 'Dec'), value: 8300 },
    ],
    spartenData: [
      { name: tx('Leben', 'Life'), value: 18500 },
      { name: tx('Kranken', 'Health'), value: 12000 },
      { name: tx('Schaden', 'Property'), value: 9500 },
      { name: tx('Kfz', 'Motor'), value: 8500 },
    ],
    modell: {
      abschluss: [
        'Leben: 40\u2030 AP',
        'Kranken: 8x Monatsbeitrag',
        'Schaden: 20% Erstjahresbeitrag',
        'Kfz: 10% Erstjahresbeitrag',
      ],
      bestand: [
        'Leben: 2% lfd. Beitrag',
        'Kranken: 3% lfd. Beitrag',
        'Schaden: 15% Jahresbeitrag',
        'Kfz: 8% Jahresbeitrag',
      ],
      bonus: [
        'Ziel 100%: +5% Bonus',
        'Ziel 120%: +10% Bonus',
        'Storno <5%: +3% Bonus',
        'Qualität A+: +2% Bonus',
      ],
    },
  }),
  banking: () => ({
    kpiValues: {
      provision: { wert: 72400, trend: 8.2 },
      ap: { wert: 28500, trend: 5.4 },
      bp: { wert: 16200, trend: 3.1 },
      dynprov: { wert: 12800, trend: 12.0 },
    },
    kpiConfig: [
      { id: 'provision', label: 'DB III YTD', format: 'eur', icon: 'Wallet' },
      { id: 'ap', label: tx('Konditionsbeitrag Kredite', 'Margin Contribution Loans'), format: 'eur', icon: 'TrendingUp' },
      { id: 'bp', label: tx('Konditionsbeitrag Einlagen', 'Margin Contribution Deposits'), format: 'eur', icon: 'PiggyBank' },
      { id: 'dynprov', label: tx('Provisionsüberschuss WP', 'Securities Commission Surplus'), format: 'eur', icon: 'BarChart3' },
    ],
    monthlyData: [
      { name: 'Jan', value: 5800 },
      { name: 'Feb', value: 6200 },
      { name: tx('Mär', 'Mar'), value: 6900 },
      { name: 'Apr', value: 5400 },
      { name: tx('Mai', 'May'), value: 6100 },
      { name: 'Jun', value: 7200 },
      { name: 'Jul', value: 5900 },
      { name: 'Aug', value: 6400 },
      { name: 'Sep', value: 6800 },
      { name: tx('Okt', 'Oct'), value: 7500 },
      { name: 'Nov', value: 8200 },
      { name: tx('Dez', 'Dec'), value: 0 },
    ],
    spartenData: [
      { name: tx('Konditionsbeitrag Kredite', 'Margin Contribution Loans'), value: 28500 },
      { name: tx('Konditionsbeitrag Einlagen', 'Margin Contribution Deposits'), value: 16200 },
      { name: tx('Provisionsüberschuss WP (Union Inv.)', 'Securities Commission Surplus (Union Inv.)'), value: 12800 },
      { name: tx('Provisionsüberschuss Verbund (R+V)', 'Group Commission Surplus (R+V)'), value: 8400 },
      { name: tx('Gebührenertrag', 'Fee Revenue'), value: 4200 },
      { name: tx('Sonstiges', 'Other'), value: 2300 },
    ],
    modell: {
      abschluss: [
        'Berater erhält KEINE direkte Provision',
        'Ertrag fließt an die Bank (DB III)',
        'Baufi/Kredit: Zinsmarge → Bankertrag',
        'WP/Verbund: Provision → Bankertrag',
      ],
      bestand: [
        'Tarifgehalt VTV Volksbanken (Stufe B3)',
        'Leistungszulage (TFlex, bis ~8%)',
        'Berater profitiert über Zielerreichung',
        'DB III = Bankertrag, nicht Beratergehalt',
      ],
      bonus: [
        'Ziel 100%: Leistungszulage (~3.700€/J.)',
        'Ziel 120%: Prämie + Sonderzahlung',
        'NPS \u22658,0: +5%',
        'Weiterbildung 100%: +2%',
      ],
    },
  }),
  vermoegensverwaltung: () => ({
    kpiValues: {
      provision: { wert: 892000, trend: 8.7 },
      ap: { wert: 425000, trend: 12.3 },
      bp: { wert: 312000, trend: 4.1 },
      dynprov: { wert: 155000, trend: 15.8 },
    },
    kpiConfig: [
      { id: 'provision', label: tx('Ertrag YTD', 'Revenue YTD'), format: 'eur', icon: 'Wallet' },
      { id: 'ap', label: 'Management Fee', format: 'eur', icon: 'TrendingUp' },
      { id: 'bp', label: 'Performance Fee', format: 'eur', icon: 'BarChart3' },
      { id: 'dynprov', label: tx('NNM-Ertrag', 'NNM Revenue'), format: 'eur', icon: 'Zap' },
    ],
    monthlyData: [
      { name: 'Jan', value: 72000 },
      { name: 'Feb', value: 78000 },
      { name: tx('Mär', 'Mar'), value: 85000 },
      { name: 'Apr', value: 69000 },
      { name: tx('Mai', 'May'), value: 82000 },
      { name: 'Jun', value: 91000 },
      { name: 'Jul', value: 76000 },
      { name: 'Aug', value: 68000 },
      { name: 'Sep', value: 88000 },
      { name: tx('Okt', 'Oct'), value: 95000 },
      { name: 'Nov', value: 92000 },
      { name: tx('Dez', 'Dec'), value: 0 },
    ],
    spartenData: [
      { name: 'Management Fee', value: 425000 },
      { name: 'Performance Fee', value: 312000 },
      { name: 'NNM-Ertrag', value: 155000 },
    ],
    modell: {
      abschluss: [
        'FairValue: 0,80-0,95% p.a.',
        'SmartValue: 1,10-1,20% p.a.',
        'Spezialmandat: individuell',
        'Family Office: 0,65-0,75% p.a.',
      ],
      bestand: [
        'Management Fee: AuM-basiert',
        'Performance Fee: 10% > Benchmark',
        'Custody Fee: 0,05% p.a.',
        'Reporting: inklusive',
      ],
      bonus: [
        'NNM >5M: +10% Bonus',
        'Retention 100%: +5% Bonus',
        'Performance >Benchmark: +8% Bonus',
        'Compliance A: +3% Bonus',
      ],
    },
  }),
});

// =============================================
// QUALITAET — lazy per mode
// =============================================
export const QUALITAET_DATA = lazyByMode({
  versicherung: () => ({
    kpiValues: {
      gesamtNote: { wert: 1.8, trend: -5.3 },
      complianceQuote: { wert: 98.5, trend: 0.5 },
      schulungStunden: { wert: 24, trend: 20.0 },
      beschwerdeQuote: { wert: 2.1, trend: -15.0 },
    },
    trendData: [
      { name: 'Q1/25', value: 2.1 },
      { name: 'Q2/25', value: 2.0 },
      { name: 'Q3/25', value: 1.9 },
      { name: 'Q4/25', value: 1.9 },
      { name: 'Q1/26', value: 1.8 },
    ],
    compliance: [
      { label: tx('IDD-Dokumentation', 'IDD Documentation'), status: 'ok' },
      { label: tx('Beratungsprotokolle', 'Advisory Protocols'), status: 'ok' },
      { label: tx('Datenschutz-Schulung', 'Data Privacy Training'), status: 'ok' },
      { label: tx('Geldwäsche-Prüfung', 'Anti-Money Laundering Check'), status: 'ok' },
      { label: tx('Interessenkonflikte', 'Conflicts of Interest'), status: 'pending' },
    ],
    schulungen: [
      { name: tx('IDD Weiterbildung 2026', 'IDD Training 2026'), stunden: 12, status: 'ok' },
      { name: tx('Datenschutz Update', 'Data Privacy Update'), stunden: 4, status: 'ok' },
      { name: tx('Produktschulung BU Neu', 'Product Training DI New'), stunden: 4, status: 'ok' },
      { name: tx('ESG-Beratung', 'ESG Advisory'), stunden: 4, status: 'ok' },
      { name: tx('Cyber-Sicherheit', 'Cyber Security'), stunden: 2, status: 'pending' },
    ],
  }),
  banking: () => ({
    kpiValues: {
      gesamtNote: { wert: 8.4, trend: 3.7 },
      complianceQuote: { wert: 95.0, trend: 2.1 },
      schulungStunden: { wert: 42, trend: 5.0 },
      beschwerdeQuote: { wert: 0.8, trend: -27.3 },
    },
    kpiConfig: [
      { id: 'gesamtNote', label: tx('NPS Durchschnitt', 'NPS Average'), format: 'num', icon: 'Award' },
      { id: 'complianceQuote', label: tx('Compliance-Quote', 'Compliance Rate'), format: 'pct', icon: 'Shield' },
      { id: 'schulungStunden', label: tx('Schulungsstd. YTD', 'Training Hrs YTD'), format: 'num', icon: 'BookOpen' },
      { id: 'beschwerdeQuote', label: tx('Beschwerde-Quote', 'Complaint Rate'), format: 'pct', icon: 'MessageCircle' },
    ],
    trendData: [
      { name: tx('Okt', 'Oct'), value: 1.2 },
      { name: 'Nov', value: 0.8 },
      { name: tx('Dez', 'Dec'), value: 1.5 },
      { name: 'Jan', value: 0.6 },
      { name: 'Feb', value: 0.9 },
      { name: tx('Mär', 'Mar'), value: 0.4 },
    ],
    trendLabel: tx('Beschwerden pro Monat', 'Complaints per month'),
    compliance: [
      { label: tx('WpHG-Compliance', 'MiFID Compliance'), status: 'ok' },
      { label: tx('MaRisk-Konformität', 'MaRisk Conformity'), status: 'ok' },
      { label: tx('Geldwäsche (GwG)', 'Anti-Money Laundering (AML)'), status: 'ok' },
      { label: tx('Datenschutz (DSGVO)', 'Data Privacy (GDPR)'), status: 'ok' },
      { label: tx('BaFin-Meldepflichten', 'BaFin Reporting'), status: 'ok' },
      { label: 'Open Finance (FIDA)', status: 'pending' },
      { label: tx('ESG-Transparenz', 'ESG Transparency'), status: 'pending' },
    ],
    schulungen: [
      { name: tx('WpHG Pflichtschulung', 'MiFID Mandatory Training'), stunden: 12, status: 'ok' },
      { name: 'MiFID II Update', stunden: 8, status: 'ok' },
      { name: tx('Geldwäsche-Prävention', 'Anti-Money Laundering Prevention'), stunden: 4, status: 'pending' },
      { name: 'Open Finance / FIDA', stunden: 6, status: 'ok' },
      { name: tx('ESG-Beratung (Taxonomie)', 'ESG Advisory (Taxonomy)'), stunden: 3, status: 'pending' },
      { name: 'genoGPT / Truuco Impulsmanager', stunden: 4, status: 'ok' },
      { name: tx('Wero / Digitale girocard', 'Wero / Digital girocard'), stunden: 2, status: 'ok' },
    ],
  }),
  vermoegensverwaltung: () => ({
    kpiValues: {
      gesamtNote: { wert: 94.0, trend: 2.0 },
      complianceQuote: { wert: 100.0, trend: 0.0 },
      schulungStunden: { wert: 36, trend: 12.5 },
      beschwerdeQuote: { wert: 0.0, trend: 0.0 },
    },
    kpiConfig: [
      { id: 'gesamtNote', label: tx('Kundenzufriedenheit', 'Client Satisfaction'), format: 'pct', icon: 'Award' },
      { id: 'complianceQuote', label: tx('Compliance-Quote', 'Compliance Rate'), format: 'pct', icon: 'Shield' },
      { id: 'schulungStunden', label: tx('Schulungsstd. YTD', 'Training Hrs YTD'), format: 'num', icon: 'BookOpen' },
      { id: 'beschwerdeQuote', label: tx('Beschwerden', 'Complaints'), format: 'num', icon: 'MessageCircle' },
    ],
    trendData: [
      { name: 'Q1/25', value: 91 },
      { name: 'Q2/25', value: 92 },
      { name: 'Q3/25', value: 93 },
      { name: 'Q4/25', value: 93 },
      { name: 'Q1/26', value: 94 },
    ],
    trendLabel: tx('Kundenzufriedenheit (%)', 'Client Satisfaction (%)'),
    compliance: [
      { label: tx('WpHG-Fragebogen aktuell', 'MiFID Questionnaire current'), status: 'ok' },
      { label: tx('Geeignetheitserklärung', 'Suitability Declaration'), status: 'ok' },
      { label: tx('Verlustschwellenmeldung', 'Loss Threshold Notification'), status: 'ok' },
      { label: tx('Ex-Ante Kostenausweis', 'Ex-Ante Cost Disclosure'), status: 'ok' },
      { label: tx('Ex-Post Kostenausweis', 'Ex-Post Cost Disclosure'), status: 'ok' },
      { label: tx('ESG-Präferenzen (SFDR)', 'ESG Preferences (SFDR)'), status: 'ok' },
      { label: tx('Geldwäsche (GwG)', 'Anti-Money Laundering (AML)'), status: 'ok' },
    ],
    schulungen: [
      { name: tx('WpHG Pflichtschulung', 'MiFID Mandatory Training'), stunden: 12, status: 'ok' },
      { name: 'MiFID II / DelVO Update', stunden: 8, status: 'ok' },
      { name: 'ESG / Taxonomy', stunden: 6, status: 'ok' },
      { name: tx('Portfoliomanagement Zertifizierung', 'Portfolio Management Certification'), stunden: 8, status: 'ok' },
      { name: tx('Geldwäsche-Prävention', 'Anti-Money Laundering Prevention'), stunden: 2, status: 'ok' },
    ],
  }),
});

// =============================================
// STAMMDATEN (Berater/Advisor) — lazy per mode
// =============================================
export const STAMMDATEN_DATA = lazyByMode({
  versicherung: () => ({
    basis: [
      { label: 'Name', value: 'Nadine Müller' },
      { label: 'Titel', value: 'Agentur' },
      { label: 'ID', value: 'VM00001' },
      { label: 'Institut', value: 'ERGO' },
      { label: 'Status', value: 'Aktiv' },
      { label: 'Telefon', value: '+49 221 4200-100' },
      { label: 'E-Mail', value: 'nadine.mueller@ergo.de' },
    ],
    organisation: [
      { label: 'Hierarchie', value: 'OD Süd \u2192 RD Bayern \u2192 VD München' },
      { label: 'Vorgesetzter', value: 'Thomas Schneider (VD)' },
      { label: 'Region', value: 'Köln-Bonn' },
      { label: 'Silo', value: 'Ausschließlichkeit' },
      { label: 'Stufe', value: 'Gold' },
    ],
    qualifikation: [
      { label: 'IHK-Nr.', value: 'D-12345678-45' },
      { label: 'Status', value: 'Versicherungsfachmann/-frau' },
      { label: 'Vermittlerstatus', value: 'Gebundener Vermittler (\u00a734d Abs. 7 GewO)' },
      { label: 'Produktfreigaben', value: 'Leben, Kranken, Schaden, Kfz' },
      { label: 'IDD Weiterbildung', value: '15/15h (100%)' },
      { label: 'Letzte Prüfung', value: '12/2025' },
    ],
    vertrag: [
      { label: 'Vertrag seit', value: '01.01.2015' },
      { label: 'Provisionsmodell', value: 'Staffelprovision (5-12%)' },
      { label: 'Bonus', value: 'Jahresbonus 2025 aktiv' },
      { label: 'Stornohaftung', value: '60 Mon. (Leben), 36 Mon. (Sach)' },
      { label: 'Exklusivität', value: '100% Exklusiv' },
      { label: 'Kündigungsfrist', value: '6 Monate' },
    ],
  }),
  banking: () => ({
    basis: [
      { label: 'Name', value: 'Nadine Müller' },
      { label: 'Titel', value: 'Beraterin' },
      { label: 'ID', value: 'VB-40210' },
      { label: 'Institut', value: 'Volksbank Mittelhessen eG' },
      { label: 'Beratungscenter', value: 'BC Gießen-Süd' },
      { label: 'Status', value: 'Aktiv' },
      { label: 'Telefon', value: '+49 641 7006-240' },
      { label: 'E-Mail', value: 'nadine.mueller@vb-mittelhessen.de' },
    ],
    organisation: [
      { label: 'Hierarchie', value: 'RD Mittelhessen \u2192 VD Gießen \u2192 BC Gießen-Süd' },
      { label: 'Vorgesetzter', value: 'Markus Schneider (Filialleiter)' },
      { label: 'Plattform', value: 'agree21 \u00b7 OKP \u00b7 BankingWorkspace' },
      { label: 'KI-Tools', value: 'genoGPT \u00b7 Truuco \u00b7 Wissensmanagement-Bot' },
      { label: 'Digitale Kanäle', value: 'VR Banking App \u00b7 Wero \u00b7 VideoBeratung' },
    ],
    qualifikation: [
      { label: 'IHK-Registrierung', value: 'D-F-156-PQ89-12' },
      { label: 'Zulassungen', value: 'WpHG \u00a787 (Anlageberatung), GewO \u00a734d (Versicherung), \u00a734i (Immobiliar)' },
      { label: 'Weiterbildung', value: '42/40 Std. (105%)' },
      { label: 'WpHG-Status', value: 'Konform' },
      { label: 'MiFID II', value: 'Zertifiziert' },
    ],
    vertrag: [
      { label: 'Beschäftigt seit', value: '01.04.2012' },
      { label: 'Vergütungsmodell', value: 'Festgehalt + Leistungszulage' },
      { label: 'Zielvereinbarung', value: 'DB III 85.000\u20ac (85% erreicht)' },
      { label: 'Jahresziel DB III', value: '85.000\u20ac' },
      { label: 'Segment-Betreuung', value: 'Retail + Premium' },
    ],
  }),
  vermoegensverwaltung: () => ({
    basis: [
      { label: 'Name', value: 'Dr. Thomas Richter' },
      { label: 'Titel', value: 'Senior Advisor' },
      { label: 'ID', value: 'HRK-SR-042' },
      { label: 'Institut', value: 'HRK LUNIS AG' },
      { label: tx('Standort', 'Location'), value: 'Frankfurt am Main' },
      { label: 'Status', value: tx('Aktiv', 'Active') },
      { label: tx('Telefon', 'Phone'), value: '+49 69 7106-4200' },
      { label: tx('E-Mail', 'Email'), value: 'thomas.richter@hrk-lunis.de' },
    ],
    organisation: [
      { label: 'Team', value: 'Wealth Management Frankfurt' },
      { label: 'Team AuM', value: '342M\u20ac' },
      { label: tx('Dabei seit', 'Since'), value: '2019' },
      { label: 'Segment', value: 'UHNW / Family Office' },
      { label: tx('Mandate', 'Mandates'), value: tx('8 aktiv (+3 Pipeline)', '8 active (+3 Pipeline)') },
    ],
    qualifikation: [
      { label: 'Qualifikation', value: 'CFA, CAIA, CFP\u00ae' },
      { label: tx('WpHG-Status', 'MiFID Status'), value: tx('Konform', 'Compliant') },
      { label: 'MiFID II', value: tx('Zertifiziert', 'Certified') },
      { label: tx('ESG-Beratung', 'ESG Advisory'), value: tx('SFDR Art. 8 + 9 zertifiziert', 'SFDR Art. 8 + 9 certified') },
      { label: tx('Weiterbildung', 'Training'), value: tx('36/32 Std. (113%)', '36/32 hrs (113%)') },
    ],
    vertrag: [
      { label: tx('Anstellungsart', 'Employment Type'), value: tx('Festanstellung', 'Permanent') },
      { label: 'Vergütung', value: 'Fixum + Tantieme (AuM + NNM)' },
      { label: 'Performance Fee', value: '10% > Benchmark' },
      { label: 'AuM-Ziel 2026', value: '85M\u20ac' },
      { label: 'NNM-Ziel 2026', value: '8M\u20ac' },
    ],
  }),
});

// =============================================
// TERMINE (mode-aware, dynamisch relativ zu heute)
// =============================================
// Deutsche Feiertage für ein gegebenes Jahr
function getFeiertage(year) {
  const a = year % 19, b = Math.floor(year / 100), c = year % 100;
  const d = Math.floor(b / 4), e = b % 4, f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3), h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4), k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const month = Math.floor((h + l - 7 * m + 114) / 31) - 1;
  const day = ((h + l - 7 * m + 114) % 31) + 1;
  const easter = new Date(year, month, day);
  const easterOff = (days) => { const dd = new Date(easter); dd.setDate(dd.getDate() + days); return dd; };
  const toKey = (dd) => dd.toISOString().split('T')[0];
  return new Set([
    toKey(new Date(year, 0, 1)), toKey(easterOff(-2)), toKey(easterOff(1)),
    toKey(new Date(year, 4, 1)), toKey(easterOff(39)), toKey(easterOff(50)),
    toKey(new Date(year, 9, 3)), toKey(new Date(year, 11, 25)), toKey(new Date(year, 11, 26)),
  ]);
}

function isBusinessDay(date, feiertage) {
  const dow = date.getDay();
  return dow !== 0 && dow !== 6 && !feiertage.has(date.toISOString().split('T')[0]);
}

// Generate next appointment slot: 2h from now, skip weekends/holidays, 10:00-18:00 window
function nextTerminSlot(offsetIndex) {
  const now = new Date();
  const allFeiertage = new Set([...getFeiertage(now.getFullYear()), ...getFeiertage(now.getFullYear() + 1)]);

  let slot = new Date(now.getTime() + 2 * 60 * 60 * 1000);
  // Round to next half hour
  const mins = slot.getMinutes();
  slot.setMinutes(mins < 30 ? 30 : 0, 0, 0);
  if (mins >= 30) slot.setHours(slot.getHours() + 1);

  // Clamp to business hours
  function clamp(d) {
    let r = new Date(d);
    for (let x = 0; x < 30; x++) {
      if (!isBusinessDay(r, allFeiertage) || r.getHours() >= 18) {
        r.setDate(r.getDate() + 1); r.setHours(10, 0, 0, 0); continue;
      }
      if (r.getHours() < 10) { r.setHours(10, 0, 0, 0); }
      break;
    }
    return r;
  }
  slot = clamp(slot);

  // Advance by offsetIndex * ~2.5h for spread
  const offsets = [0, 2.5, 5, 8];
  slot = new Date(slot.getTime() + (offsets[offsetIndex] || offsetIndex * 2.5) * 60 * 60 * 1000);
  slot = clamp(slot);

  return {
    datum: slot.toISOString().split('T')[0],
    zeit: `${String(slot.getHours()).padStart(2, '0')}:${String(slot.getMinutes()).padStart(2, '0')}`,
  };
}

export const TERMINE_BY_MODE = {
  get versicherung() {
    const s = [0,1,2,3].map(i => nextTerminSlot(i));
    return [
      { datum: s[0].datum, zeit: s[0].zeit, kunde: 'Amira König', betreff: tx('Kfz-Angebot besprechen', 'Discuss motor insurance quote'), kundeId: 'KD00002', foto: fotoFor('KD00002', './images/AdobeStock_252262042.jpeg') },
      { datum: s[1].datum, zeit: s[1].zeit, kunde: 'Anna Hoffmann', betreff: tx('Altersvorsorge-Beratung', 'Retirement planning consultation'), kundeId: 'KD00004', foto: fotoFor('KD00004') },
      { datum: s[2].datum, zeit: s[2].zeit, kunde: 'Thomas Weber', betreff: tx('Hausbesuch Bindungsgespräch', 'Home visit retention meeting'), kundeId: 'KD00003', foto: fotoFor('KD00003', './images/AdobeStock_361342769.jpeg') },
      { datum: s[3].datum, zeit: s[3].zeit, kunde: 'Sandra Yilmaz', betreff: tx('Jahresgespräch', 'Annual review'), kundeId: 'KD00008', foto: fotoFor('KD00008', './images/AdobeStock_612932760.jpeg') },
    ];
  },
  get banking() {
    const s = [0,1,2,3].map(i => nextTerminSlot(i));
    return [
      // Banking-Termine: bewusst KEINE Kunden, die bereits in den Radaren
      // (Lebenslagen-/Abwanderungs-Radar) oder den Marketingkampagnen auf
      // der Übersicht auftauchen – sonst wäre die Sidebar nur eine Kopie
      // dieser Kacheln. Die hier genutzten Kunden sind reine Termin-Stubs
      // (KDB00X), die auch in den Aufgaben vorkommen oder neu sind.
      { datum: s[0].datum, zeit: s[0].zeit, kunde: 'Julia Becker', betreff: tx('FIDA-Consent Termin', 'FIDA consent meeting'), kundeId: 'KDB004', foto: fotoFor('KDB004', './images/AdobeStock_612940075.jpeg') },
      { datum: s[1].datum, zeit: s[1].zeit, kunde: 'Thomas Krüger', betreff: tx('Baufinanzierung Erstgespräch', 'Construction loan initial meeting'), kundeId: 'KDB007', foto: fotoFor('KDB007', './images/AdobeStock_329502726.jpeg') },
      { datum: s[2].datum, zeit: s[2].zeit, kunde: 'Christian Binder', betreff: tx('VR-FinanzPlan Beratung', 'VR Financial Plan consultation'), kundeId: 'KDB010', foto: fotoFor('KDB010', './images/AdobeStock_1091012713.jpeg') },
      { datum: s[3].datum, zeit: s[3].zeit, kunde: 'Sabine Lorenz', betreff: tx('Wertpapier-Review', 'Securities review'), kundeId: 'KDB011', foto: fotoFor('KDB011', './images/maria-musterfrau.png') },
    ];
  },
  get vermoegensverwaltung() {
    const s = [0,1,2,3].map(i => nextTerminSlot(i));
    return [
      { datum: s[0].datum, zeit: s[0].zeit, kunde: 'Dr. Anna Fischer', betreff: tx('Onboarding-Gespräch (3,5M€)', 'Onboarding meeting (3.5M€)'), kundeId: 'VV-NEW', foto: fotoFor('VV-NEW', './images/AdobeStock_910604663.jpeg') },
      { datum: s[1].datum, zeit: s[1].zeit, kunde: translateName('Familie Schneider'), betreff: tx('WpHG-Fragebogen', 'MiFID Questionnaire'), kundeId: 'VV-PIPE', foto: fotoFor('VV-PIPE', './images/AdobeStock_965208311.jpeg') },
      { datum: s[2].datum, zeit: s[2].zeit, kunde: 'Dr. Stefan Meier', betreff: tx('Investmentvorschlag (5M€)', 'Investment proposal (5M€)'), kundeId: 'VV-PIPE2', foto: fotoFor('VV-PIPE2', './images/AdobeStock_1387839378.jpeg') },
      { datum: s[3].datum, zeit: s[3].zeit, kunde: translateName('Fam. Hohenlohe'), betreff: 'Family Office Pitch (15M€)', kundeId: 'VV-PIPE3', foto: fotoFor('VV-PIPE3', './images/AdobeStock_1367815601.jpeg') },
    ];
  },
};

// =============================================
// AUFGABEN (mode-aware)
// =============================================
export const AUFGABEN_BY_MODE = {
  versicherung: [
    { text: tx('Rückruf Peter Schmidt (BU-Nachversicherung)', 'Callback Peter Schmidt (DI reinsurance)'), faellig: tx('Heute', 'Today'), kundeId: 'KD00001', erledigt: false },
    { text: tx('Angebot Amira König nachfassen', 'Follow up proposal Amira König'), faellig: tx('Morgen', 'Tomorrow'), kundeId: 'KD00002', erledigt: false },
    { text: tx('Storno-Warnung Klaus Wagner prüfen', 'Check cancellation warning Klaus Wagner'), faellig: tx('Fr', 'Fri'), kundeId: 'KD00003', erledigt: false },
  ],
  banking: [
    { text: tx('Kreditgespräch Immobilienfinanzierung Fischer vorbereiten', 'Prepare property financing talk for Fischer'), faellig: tx('Heute', 'Today'), kundeId: 'KDB001', erledigt: false },
    { text: tx('FIDA-Consent Julia Becker einholen', 'Obtain FIDA consent Julia Becker'), faellig: tx('Morgen', 'Tomorrow'), kundeId: 'KDB004', erledigt: false },
    { text: tx('Wero-Aktivierung Stefan Braun nachfassen', 'Follow up Wero activation Stefan Braun'), faellig: tx('Mi', 'Wed'), kundeId: 'KDB009', erledigt: false },
    { text: tx('VR-FinanzPlan Sandra Müller erstellen', 'Create VR Financial Plan for Sandra Müller'), faellig: tx('Fr', 'Fri'), kundeId: 'KDB002', erledigt: false },
  ],
  vermoegensverwaltung: [
    { text: tx('Geeignetheitsbericht Meydarn (fällig in 21 Tagen)', 'Suitability report Meydarn (due in 21 days)'), faellig: tx('Heute', 'Today'), kundeId: 'VV005', erledigt: false },
    { text: tx('WpHG-Fragebogen Meydarn aktualisieren', 'Update MiFID questionnaire Meydarn'), faellig: tx('Heute', 'Today'), kundeId: 'VV005', erledigt: false },
    { text: tx('Rebalancing Tim Keller (Aktien +2pp über Ziel)', 'Rebalancing Tim Keller (Equities +2pp above target)'), faellig: tx('Morgen', 'Tomorrow'), kundeId: 'VV001', erledigt: false },
    { text: tx('Investmentvorschlag Dr. Meier senden (Pipeline)', 'Send investment proposal to Dr. Meier (Pipeline)'), faellig: '15.03.', kundeId: 'VV-PIPE2', erledigt: false },
  ],
};
