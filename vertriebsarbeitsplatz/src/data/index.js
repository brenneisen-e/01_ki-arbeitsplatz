import { V1, V2, V3, V4 } from './versicherung-v1-v4';
import { V5, V6, V7, V8 } from './versicherung-v5-v8';
import { B1, B2, B3, B4, B5, B6 } from './banking';
import { W1, W2, W3, W4, W5 } from './vv';

export const VERSICHERUNG_KUNDEN = [V1, V2, V3, V4, V5, V6, V7, V8];
export const BANKING_KUNDEN = [B1, B2, B3, B4, B5, B6];
export const VV_MANDANTEN = [W1, W2, W3, W4, W5];

export const KUNDEN_BY_MODE = {
  versicherung: VERSICHERUNG_KUNDEN,
  banking: BANKING_KUNDEN,
  vermoegensverwaltung: VV_MANDANTEN,
};

export function getKundeById(modeId, kundeId) {
  const list = KUNDEN_BY_MODE[modeId] || [];
  return list.find(k => k.id === kundeId);
}

export function getAllPotentiale(modeId) {
  const kunden = KUNDEN_BY_MODE[modeId] || [];
  return kunden.flatMap(k =>
    (k.potentiale || []).map(p => ({ ...p, kundeId: k.id, kundeName: k.name }))
  );
}

// =============================================
// NEUGESCHAEFT
// =============================================
export const NEUGESCHAEFT_DATA = {
  versicherung: {
    kpiValues: {
      antraege: { wert: 86, trend: 12.5 },
      policiert: { wert: 392209, trend: 8.3 },
      ape: { wert: 313000, trend: 15.2 },
      abschlussquote: { wert: 77.9, trend: 3.1 },
    },
    spartenVerteilung: [
      { name: 'Leben', value: 32, color: '#3b82f6' },
      { name: 'Kranken', value: 21, color: '#10b981' },
      { name: 'Schaden', value: 21, color: '#8b5cf6' },
      { name: 'Kfz', value: 12, color: '#f59e0b' },
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
  },
  banking: {
    kpiValues: {
      antraege: { wert: 34, trend: 8.2 },
      policiert: { wert: 2850000, trend: 12.1 },
      ape: { wert: 248500, trend: 6.5 },
      abschlussquote: { wert: 72.0, trend: 4.0 },
    },
    spartenVerteilung: [
      { name: 'Kredit', value: 12, color: '#3b82f6' },
      { name: 'Wertpapier', value: 9, color: '#10b981' },
      { name: 'Vorsorge', value: 6, color: '#8b5cf6' },
      { name: 'Einlage', value: 4, color: '#f59e0b' },
      { name: 'Versicherung', value: 3, color: '#ec4899' },
    ],
    top5: [
      { name: 'Klaus Fischer', betrag: 42000 },
      { name: 'Peter Hoffmann', betrag: 28500 },
      { name: 'Sandra Mueller', betrag: 18200 },
      { name: 'Andrea Lang', betrag: 12400 },
      { name: 'Markus Wagner', betrag: 8600 },
    ],
    vertraege: [
      { id: 'BNG-2026-001', kundeId: 'KDB001', kunde: 'Klaus Fischer', sparte: 'kredit', produkt: 'Anschlussfinanzierung', versicherer: 'VB Mittelhessen', beitrag: 185000, beitragsart: 'ges', status: 'policiert', datum: '2026-01-20' },
      { id: 'BNG-2026-002', kundeId: 'KDB001', kunde: 'Klaus Fischer', sparte: 'wertpapier', produkt: 'VR-MeinDepot ETF', versicherer: 'Union Investment', beitrag: 300, beitragsart: 'mtl', status: 'aktiv', datum: '2026-01-22' },
      { id: 'BNG-2026-003', kundeId: 'KDB002', kunde: 'Sandra Mueller', sparte: 'vorsorge', produkt: 'UniProfiRente', versicherer: 'Union Investment', beitrag: 175, beitragsart: 'mtl', status: 'aktiv', datum: '2026-02-05' },
      { id: 'BNG-2026-004', kundeId: 'KDB005', kunde: 'Peter Hoffmann', sparte: 'wertpapier', produkt: 'VermoegenPlus Depot', versicherer: 'Union Investment', beitrag: 500, beitragsart: 'mtl', status: 'aktiv', datum: '2026-02-12' },
      { id: 'BNG-2026-005', kundeId: 'KDB005', kunde: 'Peter Hoffmann', sparte: 'versicherung', produkt: 'R+V Risikoleben', versicherer: 'R+V', beitrag: 240, beitragsart: 'J', status: 'policiert', datum: '2026-02-12' },
      { id: 'BNG-2026-006', kundeId: 'KDB006', kunde: 'Andrea Lang', sparte: 'kredit', produkt: 'VR Smart Finanz Praxiskredit', versicherer: 'VB Mittelhessen', beitrag: 85000, beitragsart: 'ges', status: 'policiert', datum: '2026-02-28' },
      { id: 'BNG-2026-007', kundeId: 'KDB003', kunde: 'Markus Wagner', sparte: 'einlage', produkt: 'VR-Tagesgeld Extra', versicherer: 'VB Mittelhessen', beitrag: 25000, beitragsart: 'ges', status: 'aktiv', datum: '2026-03-01' },
    ],
  },
  vermoegensverwaltung: {
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
      { name: 'Familie Bergmann-Roth', betrag: 3500000 },
      { name: 'Dr. Anna Fischer', betrag: 1500000 },
      { name: 'Tim Keller', betrag: 800000 },
    ],
    vertraege: [
      { id: 'VV-2026-001', kundeId: 'VV008', kunde: 'Familie Bergmann-Roth', sparte: 'fairvalue', produkt: 'VV + Family Office', versicherer: 'HRK LUNIS', beitrag: 3500000, beitragsart: 'ges', status: 'aktiv', datum: '2026-01-15' },
      { id: 'VV-2026-002', kundeId: 'VV-NEW', kunde: 'Dr. Anna Fischer', sparte: 'fairvalue', produkt: 'Individuelle VV', versicherer: 'HRK LUNIS', beitrag: 1500000, beitragsart: 'ges', status: 'onboarding', datum: '2026-03-11' },
      { id: 'VV-2026-003', kundeId: 'VV005', kunde: 'Tim Keller', sparte: 'smartvalue', produkt: 'SmartValue VV', versicherer: 'HRK LUNIS', beitrag: 800000, beitragsart: 'ges', status: 'aktiv', datum: '2026-02-01' },
    ],
  },
};

// =============================================
// BESTAND
// =============================================
export const BESTAND_DATA = {
  versicherung: {
    kpiValues: {
      vertraege: { wert: 42, trend: 2.1 },
      praemienvolumen: { wert: 141863, trend: 0.9 },
      durchschnittspraemie: { wert: 3378, trend: -0.5 },
      vertragsdichte: { wert: 3.8, trend: 0.2 },
    },
  },
  banking: {
    kpiValues: {
      vertraege: { wert: 86, trend: 5.4 },
      praemienvolumen: { wert: 8920000, trend: 2.4 },
      durchschnittspraemie: { wert: 14867, trend: 1.2 },
      vertragsdichte: { wert: 3.5, trend: 0.3 },
    },
  },
  vermoegensverwaltung: {
    kpiValues: {
      vertraege: { wert: 5, trend: 25.0 },
      praemienvolumen: { wert: 30050000, trend: 4.2 },
      durchschnittspraemie: { wert: 6010000, trend: -1.8 },
      vertragsdichte: { wert: 1.0, trend: 0.0 },
    },
  },
};

// =============================================
// STORNO
// =============================================
export const STORNO_DATA = {
  versicherung: {
    kpiValues: {
      stornoAnzahl: { wert: 4, trend: -25.0 },
      stornoQuote: { wert: 5.0, trend: -0.3 },
      stornoVolumen: { wert: 8200, trend: -15.0 },
      fruehstorno: { wert: 1, trend: -50.0 },
    },
    gruende: [
      { name: 'Preis', value: 35 },
      { name: 'Wettbewerb', value: 25 },
      { name: 'Umzug', value: 15 },
      { name: 'Unzufriedenheit', value: 15 },
      { name: 'Sonstiges', value: 10 },
    ],
  },
  banking: {
    kpiValues: {
      stornoAnzahl: { wert: 6, trend: -14.3 },
      stornoQuote: { wert: 2.4, trend: -0.2 },
      stornoVolumen: { wert: 125000, trend: -8.5 },
      fruehstorno: { wert: 2, trend: 0.0 },
    },
    gruende: [
      { name: 'Konditionen', value: 30 },
      { name: 'Bankenwechsel', value: 25 },
      { name: 'Online-Bank', value: 20 },
      { name: 'Service', value: 15 },
      { name: 'Sonstiges', value: 10 },
    ],
  },
  vermoegensverwaltung: {
    kpiValues: {
      stornoAnzahl: { wert: 0, trend: 0.0 },
      stornoQuote: { wert: 0.0, trend: 0.0 },
      stornoVolumen: { wert: 0, trend: 0.0 },
      fruehstorno: { wert: 0, trend: 0.0 },
    },
    gruende: [
      { name: 'Performance', value: 40 },
      { name: 'Gebuehren', value: 30 },
      { name: 'Konsolidierung', value: 20 },
      { name: 'Sonstiges', value: 10 },
    ],
  },
};

// =============================================
// VERGUETUNG / ERTRAEGE
// =============================================
export const VERGUETUNG_DATA = {
  versicherung: {
    kpiValues: {
      provision: { wert: 48500, trend: 8.2 },
      ap: { wert: 32000, trend: 12.5 },
      bp: { wert: 14500, trend: 2.1 },
      dynprov: { wert: 2000, trend: 5.0 },
    },
    kpiConfig: [
      { id: 'provision', label: 'Provision YTD', format: 'eur', icon: 'Wallet' },
      { id: 'ap', label: 'Abschlussprovision', format: 'eur', icon: 'TrendingUp' },
      { id: 'bp', label: 'Bestandsprovision', format: 'eur', icon: 'Briefcase' },
      { id: 'dynprov', label: 'Dynamikprovision', format: 'eur', icon: 'Zap' },
    ],
    monthlyData: [
      { name: 'Jan', value: 4200 },
      { name: 'Feb', value: 5100 },
      { name: 'Maer', value: 4800 },
      { name: 'Apr', value: 6200 },
      { name: 'Mai', value: 5500 },
      { name: 'Jun', value: 7100 },
      { name: 'Jul', value: 4900 },
      { name: 'Aug', value: 3800 },
      { name: 'Sep', value: 5600 },
      { name: 'Okt', value: 6800 },
      { name: 'Nov', value: 5200 },
      { name: 'Dez', value: 8300 },
    ],
    spartenData: [
      { name: 'Leben', value: 18500 },
      { name: 'Kranken', value: 12000 },
      { name: 'Schaden', value: 9500 },
      { name: 'Kfz', value: 8500 },
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
        'Qualitaet A+: +2% Bonus',
      ],
    },
  },
  banking: {
    kpiValues: {
      provision: { wert: 248500, trend: 8.2 },
      ap: { wert: 95000, trend: 5.4 },
      bp: { wert: 68000, trend: 12.0 },
      dynprov: { wert: 42000, trend: 6.8 },
    },
    kpiConfig: [
      { id: 'provision', label: 'Ertrag YTD', format: 'eur', icon: 'Wallet' },
      { id: 'ap', label: 'Zinsertrag', format: 'eur', icon: 'TrendingUp' },
      { id: 'bp', label: 'Provision WP', format: 'eur', icon: 'Briefcase' },
      { id: 'dynprov', label: 'Provision Versicherung', format: 'eur', icon: 'Shield' },
    ],
    monthlyData: [
      { name: 'Jan', value: 18200 },
      { name: 'Feb', value: 21400 },
      { name: 'Maer', value: 19800 },
      { name: 'Apr', value: 22600 },
      { name: 'Mai', value: 24100 },
      { name: 'Jun', value: 20500 },
      { name: 'Jul', value: 23800 },
      { name: 'Aug', value: 25200 },
      { name: 'Sep', value: 21900 },
      { name: 'Okt', value: 26400 },
      { name: 'Nov', value: 24800 },
      { name: 'Dez', value: 0 },
    ],
    spartenData: [
      { name: 'Zinsertrag', value: 95000 },
      { name: 'Provision WP (Union Inv.)', value: 68000 },
      { name: 'Provision Versicherung (R+V)', value: 42000 },
      { name: 'Zahlungsverkehr (Wero)', value: 28000 },
      { name: 'Bausparen & Sonstige', value: 15500 },
    ],
    modell: {
      abschluss: [
        'Kredit: 0,5-1,0% Volumen',
        'Wertpapier: 1,5% Ausgabeaufschlag',
        'Versicherung (R+V): 8x Beitrag',
        'Bausparen (Schw. Hall): 1% BSS',
      ],
      bestand: [
        'Depotgebuehren: 0,2% p.a.',
        'Kontogebuehren: pauschal',
        'Kreditbearbeitung: 0,25% p.a.',
        'Zahlungsverkehr: transaktionsbasiert',
      ],
      bonus: [
        'Ziel 100%: Leistungszulage',
        'Ziel 120%: Praemie + Sonderzahlung',
        'NPS \u22658,0: +5% Bonus',
        'Weiterbildung 100%: +2% Bonus',
      ],
    },
  },
  vermoegensverwaltung: {
    kpiValues: {
      provision: { wert: 892000, trend: 8.7 },
      ap: { wert: 425000, trend: 12.3 },
      bp: { wert: 312000, trend: 4.1 },
      dynprov: { wert: 155000, trend: 15.8 },
    },
    kpiConfig: [
      { id: 'provision', label: 'Ertrag YTD', format: 'eur', icon: 'Wallet' },
      { id: 'ap', label: 'Management Fee', format: 'eur', icon: 'TrendingUp' },
      { id: 'bp', label: 'Performance Fee', format: 'eur', icon: 'BarChart3' },
      { id: 'dynprov', label: 'NNM-Ertrag', format: 'eur', icon: 'Zap' },
    ],
    monthlyData: [
      { name: 'Jan', value: 72000 },
      { name: 'Feb', value: 78000 },
      { name: 'Maer', value: 85000 },
      { name: 'Apr', value: 69000 },
      { name: 'Mai', value: 82000 },
      { name: 'Jun', value: 91000 },
      { name: 'Jul', value: 76000 },
      { name: 'Aug', value: 68000 },
      { name: 'Sep', value: 88000 },
      { name: 'Okt', value: 95000 },
      { name: 'Nov', value: 92000 },
      { name: 'Dez', value: 0 },
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
  },
};

// =============================================
// QUALITAET
// =============================================
export const QUALITAET_DATA = {
  versicherung: {
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
      { label: 'IDD-Dokumentation', status: 'ok' },
      { label: 'Beratungsprotokolle', status: 'ok' },
      { label: 'Datenschutz-Schulung', status: 'ok' },
      { label: 'Geldwaesche-Pruefung', status: 'ok' },
      { label: 'Interessenkonflikte', status: 'pending' },
    ],
    schulungen: [
      { name: 'IDD Weiterbildung 2026', stunden: 12, status: 'ok' },
      { name: 'Datenschutz Update', stunden: 4, status: 'ok' },
      { name: 'Produktschulung BU Neu', stunden: 4, status: 'ok' },
      { name: 'ESG-Beratung', stunden: 4, status: 'ok' },
      { name: 'Cyber-Sicherheit', stunden: 2, status: 'pending' },
    ],
  },
  banking: {
    kpiValues: {
      gesamtNote: { wert: 8.4, trend: 3.7 },
      complianceQuote: { wert: 95.0, trend: 2.1 },
      schulungStunden: { wert: 42, trend: 5.0 },
      beschwerdeQuote: { wert: 0.8, trend: -27.3 },
    },
    kpiConfig: [
      { id: 'gesamtNote', label: 'NPS Durchschnitt', format: 'num', icon: 'Award' },
      { id: 'complianceQuote', label: 'Compliance-Quote', format: 'pct', icon: 'Shield' },
      { id: 'schulungStunden', label: 'Schulungsstd. YTD', format: 'num', icon: 'BookOpen' },
      { id: 'beschwerdeQuote', label: 'Beschwerde-Quote', format: 'pct', icon: 'MessageCircle' },
    ],
    trendData: [
      { name: 'Okt', value: 1.2 },
      { name: 'Nov', value: 0.8 },
      { name: 'Dez', value: 1.5 },
      { name: 'Jan', value: 0.6 },
      { name: 'Feb', value: 0.9 },
      { name: 'Maer', value: 0.4 },
    ],
    trendLabel: 'Beschwerden pro Monat',
    compliance: [
      { label: 'WpHG-Compliance', status: 'ok' },
      { label: 'MaRisk-Konformitaet', status: 'ok' },
      { label: 'Geldwaesche (GwG)', status: 'ok' },
      { label: 'Datenschutz (DSGVO)', status: 'ok' },
      { label: 'BaFin-Meldepflichten', status: 'ok' },
      { label: 'Open Finance (FIDA)', status: 'pending' },
      { label: 'ESG-Transparenz', status: 'pending' },
    ],
    schulungen: [
      { name: 'WpHG Pflichtschulung', stunden: 12, status: 'ok' },
      { name: 'MiFID II Update', stunden: 8, status: 'ok' },
      { name: 'Geldwaesche-Praevention', stunden: 4, status: 'pending' },
      { name: 'Open Finance / FIDA', stunden: 6, status: 'ok' },
      { name: 'ESG-Beratung (Taxonomie)', stunden: 3, status: 'pending' },
      { name: 'genoGPT / Truuco Impulsmanager', stunden: 4, status: 'ok' },
      { name: 'Wero / Digitale girocard', stunden: 2, status: 'ok' },
    ],
  },
  vermoegensverwaltung: {
    kpiValues: {
      gesamtNote: { wert: 94.0, trend: 2.0 },
      complianceQuote: { wert: 100.0, trend: 0.0 },
      schulungStunden: { wert: 36, trend: 12.5 },
      beschwerdeQuote: { wert: 0.0, trend: 0.0 },
    },
    kpiConfig: [
      { id: 'gesamtNote', label: 'Kundenzufriedenheit', format: 'pct', icon: 'Award' },
      { id: 'complianceQuote', label: 'Compliance-Quote', format: 'pct', icon: 'Shield' },
      { id: 'schulungStunden', label: 'Schulungsstd. YTD', format: 'num', icon: 'BookOpen' },
      { id: 'beschwerdeQuote', label: 'Beschwerden', format: 'num', icon: 'MessageCircle' },
    ],
    trendData: [
      { name: 'Q1/25', value: 91 },
      { name: 'Q2/25', value: 92 },
      { name: 'Q3/25', value: 93 },
      { name: 'Q4/25', value: 93 },
      { name: 'Q1/26', value: 94 },
    ],
    trendLabel: 'Kundenzufriedenheit (%)',
    compliance: [
      { label: 'WpHG-Fragebogen aktuell', status: 'ok' },
      { label: 'Geeignetheitserklaerung', status: 'ok' },
      { label: 'Verlustschwellenmeldung', status: 'ok' },
      { label: 'Ex-Ante Kostenausweis', status: 'ok' },
      { label: 'Ex-Post Kostenausweis', status: 'ok' },
      { label: 'ESG-Praeferenzen (SFDR)', status: 'ok' },
      { label: 'Geldwaesche (GwG)', status: 'ok' },
    ],
    schulungen: [
      { name: 'WpHG Pflichtschulung', stunden: 12, status: 'ok' },
      { name: 'MiFID II / DelVO Update', stunden: 8, status: 'ok' },
      { name: 'ESG / Taxonomie', stunden: 6, status: 'ok' },
      { name: 'Portfoliomanagement Zertifizierung', stunden: 8, status: 'ok' },
      { name: 'Geldwaesche-Praevention', stunden: 2, status: 'ok' },
    ],
  },
};

// =============================================
// STAMMDATEN (Berater/Advisor)
// =============================================
export const STAMMDATEN_DATA = {
  versicherung: {
    basis: [
      { label: 'Name', value: 'Maria Musterfrau' },
      { label: 'Titel', value: 'Agentur' },
      { label: 'ID', value: 'VM00001' },
      { label: 'Institut', value: 'ERGO' },
      { label: 'Status', value: 'Aktiv' },
      { label: 'Telefon', value: '+49 221 4200-100' },
      { label: 'E-Mail', value: 'maria.musterfrau@ergo.de' },
    ],
    organisation: [
      { label: 'Hierarchie', value: 'OD Sued \u2192 RD Bayern \u2192 VD Muenchen' },
      { label: 'Vorgesetzter', value: 'Thomas Schneider (VD)' },
      { label: 'Region', value: 'Koeln-Bonn' },
      { label: 'Silo', value: 'Ausschliesslichkeit' },
      { label: 'Stufe', value: 'Gold' },
    ],
    qualifikation: [
      { label: 'IHK-Nr.', value: 'D-12345678-45' },
      { label: 'Status', value: 'Versicherungsfachmann/-frau' },
      { label: 'Vermittlerstatus', value: 'Gebundener Vermittler (\u00a734d Abs. 7 GewO)' },
      { label: 'Produktfreigaben', value: 'Leben, Kranken, Schaden, Kfz' },
      { label: 'IDD Weiterbildung', value: '15/15h (100%)' },
      { label: 'Letzte Pruefung', value: '12/2025' },
    ],
    vertrag: [
      { label: 'Vertrag seit', value: '01.01.2015' },
      { label: 'Provisionsmodell', value: 'Staffelprovision (5-12%)' },
      { label: 'Bonus', value: 'Jahresbonus 2025 aktiv' },
      { label: 'Stornohaftung', value: '60 Mon. (Leben), 36 Mon. (Sach)' },
      { label: 'Exklusivitaet', value: '100% Exklusiv' },
      { label: 'Kuendigungsfrist', value: '6 Monate' },
    ],
  },
  banking: {
    basis: [
      { label: 'Name', value: 'Maria Musterfrau' },
      { label: 'Titel', value: 'Beraterin' },
      { label: 'ID', value: 'VB-40210' },
      { label: 'Institut', value: 'Volksbank Mittelhessen eG' },
      { label: 'Beratungscenter', value: 'BC Giessen-Sued' },
      { label: 'Status', value: 'Aktiv' },
      { label: 'Telefon', value: '+49 641 7006-240' },
      { label: 'E-Mail', value: 'maria.musterfrau@vb-mittelhessen.de' },
    ],
    organisation: [
      { label: 'Hierarchie', value: 'RD Mittelhessen \u2192 VD Giessen \u2192 BC Giessen-Sued' },
      { label: 'Vorgesetzter', value: 'Markus Schneider (Filialleiter)' },
      { label: 'Plattform', value: 'agree21 \u00b7 OKP \u00b7 BankingWorkspace' },
      { label: 'KI-Tools', value: 'genoGPT \u00b7 Truuco \u00b7 Wissensmanagement-Bot' },
      { label: 'Digitale Kanaele', value: 'VR Banking App \u00b7 Wero \u00b7 VideoBeratung' },
    ],
    qualifikation: [
      { label: 'IHK-Registrierung', value: 'D-F-156-PQ89-12' },
      { label: 'Zulassungen', value: 'WpHG \u00a734d, KWG \u00a725a, Immobiliar \u00a734i' },
      { label: 'Weiterbildung', value: '42/40 Std. (105%)' },
      { label: 'WpHG-Status', value: 'Konform' },
      { label: 'MiFID II', value: 'Zertifiziert' },
    ],
    vertrag: [
      { label: 'Beschaeftigt seit', value: '01.04.2012' },
      { label: 'Verguetungsmodell', value: 'Festgehalt + Leistungszulage' },
      { label: 'Zielvereinbarung', value: '300.000\u20ac Ertrag (83% erreicht)' },
      { label: 'Jahresziel', value: '300.000\u20ac' },
      { label: 'Segment-Betreuung', value: 'Retail + Premium' },
    ],
  },
  vermoegensverwaltung: {
    basis: [
      { label: 'Name', value: 'Dr. Thomas Richter' },
      { label: 'Titel', value: 'Senior Advisor' },
      { label: 'ID', value: 'HRK-SR-042' },
      { label: 'Institut', value: 'HRK LUNIS AG' },
      { label: 'Standort', value: 'Frankfurt am Main' },
      { label: 'Status', value: 'Aktiv' },
      { label: 'Telefon', value: '+49 69 7106-4200' },
      { label: 'E-Mail', value: 'thomas.richter@hrk-lunis.de' },
    ],
    organisation: [
      { label: 'Team', value: 'Wealth Management Frankfurt' },
      { label: 'Team AuM', value: '342M\u20ac' },
      { label: 'Dabei seit', value: '2019' },
      { label: 'Segment', value: 'UHNW / Family Office' },
      { label: 'Mandate', value: '8 aktiv (+3 Pipeline)' },
    ],
    qualifikation: [
      { label: 'Qualifikation', value: 'CFA, CAIA, CFP\u00ae' },
      { label: 'WpHG-Status', value: 'Konform' },
      { label: 'MiFID II', value: 'Zertifiziert' },
      { label: 'ESG-Beratung', value: 'SFDR Art. 8 + 9 zertifiziert' },
      { label: 'Weiterbildung', value: '36/32 Std. (113%)' },
    ],
    vertrag: [
      { label: 'Anstellungsart', value: 'Festanstellung' },
      { label: 'Verguetung', value: 'Fixum + Tantieme (AuM + NNM)' },
      { label: 'Performance Fee', value: '10% > Benchmark' },
      { label: 'AuM-Ziel 2026', value: '85M\u20ac' },
      { label: 'NNM-Ziel 2026', value: '8M\u20ac' },
    ],
  },
};

// =============================================
// TERMINE (mode-aware)
// =============================================
export const TERMINE_BY_MODE = {
  versicherung: [
    { datum: '2026-03-11', zeit: '17:30', kunde: 'Amira Koenig', betreff: 'Kfz-Angebot besprechen', kundeId: 'KD00002', foto: '/images/AdobeStock_252262042.jpeg' },
    { datum: '2026-03-12', zeit: '10:30', kunde: 'Anna Hoffmann', betreff: 'Altersvorsorge-Beratung', kundeId: 'KD00004' },
    { datum: '2026-03-13', zeit: '14:00', kunde: 'Thomas Weber', betreff: 'Hausbesuch Bindungsgespraech', kundeId: 'KD00003', foto: '/images/AdobeStock_361342769.jpeg' },
    { datum: '2026-03-14', zeit: '09:00', kunde: 'Sandra Yilmaz', betreff: 'Jahresgespraech', kundeId: 'KD00008', foto: '/images/AdobeStock_612932760.jpeg' },
  ],
  banking: [
    { datum: '2026-03-11', zeit: '14:00', kunde: 'Klaus Fischer', betreff: 'Anschlussfinanzierung Beratung', kundeId: 'KDB001' },
    { datum: '2026-03-12', zeit: '09:30', kunde: 'Peter Hoffmann', betreff: 'VermoegenPlus Depot Review', kundeId: 'KDB005' },
    { datum: '2026-03-13', zeit: '11:00', kunde: 'Sandra Mueller', betreff: 'VR-FinanzPlan Erstgespraech', kundeId: 'KDB002' },
    { datum: '2026-03-14', zeit: '15:30', kunde: 'Andrea Lang', betreff: 'Praxiskredit Auszahlung', kundeId: 'KDB006' },
  ],
  vermoegensverwaltung: [
    { datum: '2026-03-11', zeit: '10:00', kunde: 'Dr. Anna Fischer', betreff: 'Onboarding-Gespraech (3,5M\u20ac)', kundeId: 'VV-NEW' },
    { datum: '2026-03-12', zeit: '14:00', kunde: 'Familie Schneider', betreff: 'WpHG-Fragebogen', kundeId: 'VV-PIPE' },
    { datum: '2026-03-15', zeit: '10:00', kunde: 'Dr. Stefan Meier', betreff: 'Investmentvorschlag (5M\u20ac)', kundeId: 'VV-PIPE2' },
    { datum: '2026-03-17', zeit: '11:00', kunde: 'Fam. Hohenlohe', betreff: 'Family Office Pitch (15M\u20ac)', kundeId: 'VV-PIPE3' },
  ],
};

// Keep legacy export for backward compatibility
export const TERMINE = TERMINE_BY_MODE.versicherung;

// =============================================
// AUFGABEN (mode-aware)
// =============================================
export const AUFGABEN_BY_MODE = {
  versicherung: [
    { text: 'Rueckruf Peter Schmidt (BU-Nachversicherung)', faellig: 'Heute', kundeId: 'KD00001', erledigt: false },
    { text: 'Angebot Amira Koenig nachfassen', faellig: 'Morgen', kundeId: 'KD00002', erledigt: false },
    { text: 'Storno-Warnung Klaus Wagner pruefen', faellig: 'Fr', kundeId: 'KD00003', erledigt: false },
  ],
  banking: [
    { text: 'Anschlussfinanzierung Fischer vorbereiten', faellig: 'Heute', kundeId: 'KDB001', erledigt: false },
    { text: 'FIDA-Consent Julia Becker einholen', faellig: 'Morgen', kundeId: 'KDB004', erledigt: false },
    { text: 'Wero-Aktivierung Stefan Braun nachfassen', faellig: 'Mi', kundeId: 'KDB009', erledigt: false },
    { text: 'VR-FinanzPlan Sandra Mueller erstellen', faellig: 'Fr', kundeId: 'KDB002', erledigt: false },
  ],
  vermoegensverwaltung: [
    { text: 'Geeignetheitsbericht Keller NextGen (faellig in 21 Tagen)', faellig: 'Heute', kundeId: 'VV005', erledigt: false },
    { text: 'WpHG-Fragebogen Keller NextGen aktualisieren', faellig: 'Heute', kundeId: 'VV005', erledigt: false },
    { text: 'Rebalancing Dr. von Trott (Aktien +2pp ueber Ziel)', faellig: 'Morgen', kundeId: 'VV001', erledigt: false },
    { text: 'Investmentvorschlag Dr. Meier senden (Pipeline)', faellig: '15.03.', kundeId: 'VV-PIPE2', erledigt: false },
  ],
};

// Keep legacy export for backward compatibility
export const AUFGABEN = AUFGABEN_BY_MODE.versicherung;
