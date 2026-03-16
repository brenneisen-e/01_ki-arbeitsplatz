import { getKunden } from './generator';

// Dynamisch generierte Kunden (Showcase + generierte)
// Lazy: Werden beim ersten Zugriff generiert und gecacht
export const KUNDEN_BY_MODE = {
  get versicherung() { return getKunden('versicherung'); },
  get banking() { return getKunden('banking'); },
  get vermoegensverwaltung() { return getKunden('vermoegensverwaltung'); },
};

// Legacy exports
export const VERSICHERUNG_KUNDEN = KUNDEN_BY_MODE.versicherung;
export const BANKING_KUNDEN = KUNDEN_BY_MODE.banking;
export const VV_MANDANTEN = KUNDEN_BY_MODE.vermoegensverwaltung;

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
      { id: 'BNG-2026-001', kundeId: 'KDB001', kunde: 'Klaus Fischer', sparte: 'kredit', produkt: 'Anschlussfinanzierung', versicherer: 'VB Mittelhessen', beitrag: 185000, beitragsart: 'ges', status: 'ausgezahlt', datum: '2026-01-20' },
      { id: 'BNG-2026-002', kundeId: 'KDB001', kunde: 'Klaus Fischer', sparte: 'wertpapier', produkt: 'VR-MeinDepot ETF-Sparplan', versicherer: 'Union Investment', beitrag: 300, beitragsart: 'mtl', status: 'aktiv', datum: '2026-01-22' },
      { id: 'BNG-2026-003', kundeId: 'KDB002', kunde: 'Sandra Müller', sparte: 'vorsorge', produkt: 'UniProfiRente', versicherer: 'Union Investment', beitrag: 175, beitragsart: 'mtl', status: 'aktiv', datum: '2026-02-05' },
      { id: 'BNG-2026-004', kundeId: 'KDB005', kunde: 'Peter Hoffmann', sparte: 'wertpapier', produkt: 'VermögenPlus Depot', versicherer: 'Union Investment', beitrag: 500, beitragsart: 'mtl', status: 'aktiv', datum: '2026-02-12' },
      { id: 'BNG-2026-005', kundeId: 'KDB005', kunde: 'Peter Hoffmann', sparte: 'versicherung', produkt: 'R+V Risikoleben', versicherer: 'R+V', beitrag: 240, beitragsart: 'J', status: 'vermittelt', datum: '2026-02-12' },
      { id: 'BNG-2026-006', kundeId: 'KDB006', kunde: 'Andrea Lang', sparte: 'kredit', produkt: 'Praxiskredit', versicherer: 'VB Mittelhessen', beitrag: 85000, beitragsart: 'ges', status: 'ausgezahlt', datum: '2026-02-28' },
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
      vertraege: { wert: 140, trend: 5.4 },
      praemienvolumen: { wert: 4200000, trend: 3.2 },
      durchschnittspraemie: { wert: 3800000, trend: 1.8 },
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
    vertraege: [
      { kunde: 'Herbert Lange', kundeId: 'KD00012', produkt: 'ERGO Hausrat Komfort', sparte: 'Schaden', praemie: 280, stornoDatum: '2025-11-15', grund: 'Preis', typ: 'Spätstorno' },
      { kunde: 'Sandra Richter', kundeId: 'KD00018', produkt: 'ERGO BU Comfort', sparte: 'Leben', praemie: 1920, stornoDatum: '2025-09-22', grund: 'Wettbewerb', typ: 'Spätstorno' },
      { kunde: 'Frank Zimmermann', kundeId: 'KD00025', produkt: 'ERGO Kfz-Vollkasko', sparte: 'Kfz', praemie: 780, stornoDatum: '2026-01-08', grund: 'Umzug', typ: 'Frühstorno' },
      { kunde: 'Monika Becker', kundeId: 'KD00031', produkt: 'ERGO Privat Familie', sparte: 'Schaden', praemie: 95, stornoDatum: '2025-12-03', grund: 'Unzufriedenheit', typ: 'Spätstorno' },
    ],
  },
  banking: {
    kpiValues: {
      stornoAnzahl: { wert: 6, trend: -14.3 },
      stornoQuote: { wert: 4.3, trend: -0.2 },
      stornoVolumen: { wert: 125000, trend: -8.5 },
      fruehstorno: { wert: 2, trend: 0.0 },
    },
    gruende: [
      { name: 'Konditionen (bessere Zinsen)', value: 30 },
      { name: 'Bankenwechsel (Umzug)', value: 25 },
      { name: 'Wechsel zu Neobank', value: 20 },
      { name: 'Unzufriedenheit (Service)', value: 15 },
      { name: 'Sonstiges (Todesfall etc.)', value: 10 },
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
      { name: 'Gebühren', value: 30 },
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
      { name: 'Mär', value: 4800 },
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
        'Qualität A+: +2% Bonus',
      ],
    },
  },
  banking: {
    kpiValues: {
      provision: { wert: 72400, trend: 8.2 },
      ap: { wert: 28500, trend: 5.4 },
      bp: { wert: 16200, trend: 3.1 },
      dynprov: { wert: 12800, trend: 12.0 },
    },
    kpiConfig: [
      { id: 'provision', label: 'DB III YTD', format: 'eur', icon: 'Wallet' },
      { id: 'ap', label: 'Konditionsbeitrag Kredite', format: 'eur', icon: 'TrendingUp' },
      { id: 'bp', label: 'Konditionsbeitrag Einlagen', format: 'eur', icon: 'PiggyBank' },
      { id: 'dynprov', label: 'Provisionsüberschuss WP', format: 'eur', icon: 'BarChart3' },
    ],
    monthlyData: [
      { name: 'Jan', value: 5800 },
      { name: 'Feb', value: 6200 },
      { name: 'Mär', value: 6900 },
      { name: 'Apr', value: 5400 },
      { name: 'Mai', value: 6100 },
      { name: 'Jun', value: 7200 },
      { name: 'Jul', value: 5900 },
      { name: 'Aug', value: 6400 },
      { name: 'Sep', value: 6800 },
      { name: 'Okt', value: 7500 },
      { name: 'Nov', value: 8200 },
      { name: 'Dez', value: 0 },
    ],
    spartenData: [
      { name: 'Konditionsbeitrag Kredite', value: 28500 },
      { name: 'Konditionsbeitrag Einlagen', value: 16200 },
      { name: 'Provisionsüberschuss WP (Union Inv.)', value: 12800 },
      { name: 'Provisionsüberschuss Verbund (R+V)', value: 8400 },
      { name: 'Gebührenertrag', value: 4200 },
      { name: 'Sonstiges', value: 2300 },
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
      { name: 'Mär', value: 85000 },
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
      { label: 'Geldwäsche-Prüfung', status: 'ok' },
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
      { name: 'Mär', value: 0.4 },
    ],
    trendLabel: 'Beschwerden pro Monat',
    compliance: [
      { label: 'WpHG-Compliance', status: 'ok' },
      { label: 'MaRisk-Konformität', status: 'ok' },
      { label: 'Geldwäsche (GwG)', status: 'ok' },
      { label: 'Datenschutz (DSGVO)', status: 'ok' },
      { label: 'BaFin-Meldepflichten', status: 'ok' },
      { label: 'Open Finance (FIDA)', status: 'pending' },
      { label: 'ESG-Transparenz', status: 'pending' },
    ],
    schulungen: [
      { name: 'WpHG Pflichtschulung', stunden: 12, status: 'ok' },
      { name: 'MiFID II Update', stunden: 8, status: 'ok' },
      { name: 'Geldwäsche-Prävention', stunden: 4, status: 'pending' },
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
      { label: 'Geeignetheitserklärung', status: 'ok' },
      { label: 'Verlustschwellenmeldung', status: 'ok' },
      { label: 'Ex-Ante Kostenausweis', status: 'ok' },
      { label: 'Ex-Post Kostenausweis', status: 'ok' },
      { label: 'ESG-Präferenzen (SFDR)', status: 'ok' },
      { label: 'Geldwäsche (GwG)', status: 'ok' },
    ],
    schulungen: [
      { name: 'WpHG Pflichtschulung', stunden: 12, status: 'ok' },
      { name: 'MiFID II / DelVO Update', stunden: 8, status: 'ok' },
      { name: 'ESG / Taxonomie', stunden: 6, status: 'ok' },
      { name: 'Portfoliomanagement Zertifizierung', stunden: 8, status: 'ok' },
      { name: 'Geldwäsche-Prävention', stunden: 2, status: 'ok' },
    ],
  },
};

// =============================================
// STAMMDATEN (Berater/Advisor)
// =============================================
export const STAMMDATEN_DATA = {
  versicherung: {
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
  },
  banking: {
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
      { label: 'Vergütung', value: 'Fixum + Tantieme (AuM + NNM)' },
      { label: 'Performance Fee', value: '10% > Benchmark' },
      { label: 'AuM-Ziel 2026', value: '85M\u20ac' },
      { label: 'NNM-Ziel 2026', value: '8M\u20ac' },
    ],
  },
};

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
      { datum: s[0].datum, zeit: s[0].zeit, kunde: 'Amira König', betreff: 'Kfz-Angebot besprechen', kundeId: 'KD00002', foto: './images/AdobeStock_252262042.jpeg' },
      { datum: s[1].datum, zeit: s[1].zeit, kunde: 'Anna Hoffmann', betreff: 'Altersvorsorge-Beratung', kundeId: 'KD00004' },
      { datum: s[2].datum, zeit: s[2].zeit, kunde: 'Thomas Weber', betreff: 'Hausbesuch Bindungsgespräch', kundeId: 'KD00003', foto: './images/AdobeStock_361342769.jpeg' },
      { datum: s[3].datum, zeit: s[3].zeit, kunde: 'Sandra Yilmaz', betreff: 'Jahresgespräch', kundeId: 'KD00008', foto: './images/AdobeStock_612932760.jpeg' },
    ];
  },
  get banking() {
    const s = [0,1,2,3].map(i => nextTerminSlot(i));
    return [
      { datum: s[0].datum, zeit: s[0].zeit, kunde: 'Klaus Fischer', betreff: 'Anschlussfinanzierung Beratung', kundeId: 'KDB001' },
      { datum: s[1].datum, zeit: s[1].zeit, kunde: 'Peter Hoffmann', betreff: 'VermögenPlus Depot Review', kundeId: 'KDB005' },
      { datum: s[2].datum, zeit: s[2].zeit, kunde: 'Sandra Müller', betreff: 'VR-FinanzPlan Erstgespräch', kundeId: 'KDB002' },
      { datum: s[3].datum, zeit: s[3].zeit, kunde: 'Andrea Lang', betreff: 'Praxiskredit Auszahlung', kundeId: 'KDB006' },
    ];
  },
  get vermoegensverwaltung() {
    const s = [0,1,2,3].map(i => nextTerminSlot(i));
    return [
      { datum: s[0].datum, zeit: s[0].zeit, kunde: 'Dr. Anna Fischer', betreff: 'Onboarding-Gespräch (3,5M€)', kundeId: 'VV-NEW' },
      { datum: s[1].datum, zeit: s[1].zeit, kunde: 'Familie Schneider', betreff: 'WpHG-Fragebogen', kundeId: 'VV-PIPE' },
      { datum: s[2].datum, zeit: s[2].zeit, kunde: 'Dr. Stefan Meier', betreff: 'Investmentvorschlag (5M€)', kundeId: 'VV-PIPE2' },
      { datum: s[3].datum, zeit: s[3].zeit, kunde: 'Fam. Hohenlohe', betreff: 'Family Office Pitch (15M€)', kundeId: 'VV-PIPE3' },
    ];
  },
};
// Keep legacy export for backward compatibility
export const TERMINE = TERMINE_BY_MODE.versicherung;

// =============================================
// AUFGABEN (mode-aware)
// =============================================
export const AUFGABEN_BY_MODE = {
  versicherung: [
    { text: 'Rückruf Peter Schmidt (BU-Nachversicherung)', faellig: 'Heute', kundeId: 'KD00001', erledigt: false },
    { text: 'Angebot Amira König nachfassen', faellig: 'Morgen', kundeId: 'KD00002', erledigt: false },
    { text: 'Storno-Warnung Klaus Wagner prüfen', faellig: 'Fr', kundeId: 'KD00003', erledigt: false },
  ],
  banking: [
    { text: 'Anschlussfinanzierung Fischer vorbereiten', faellig: 'Heute', kundeId: 'KDB001', erledigt: false },
    { text: 'FIDA-Consent Julia Becker einholen', faellig: 'Morgen', kundeId: 'KDB004', erledigt: false },
    { text: 'Wero-Aktivierung Stefan Braun nachfassen', faellig: 'Mi', kundeId: 'KDB009', erledigt: false },
    { text: 'VR-FinanzPlan Sandra Müller erstellen', faellig: 'Fr', kundeId: 'KDB002', erledigt: false },
  ],
  vermoegensverwaltung: [
    { text: 'Geeignetheitsbericht Keller NextGen (fällig in 21 Tagen)', faellig: 'Heute', kundeId: 'VV005', erledigt: false },
    { text: 'WpHG-Fragebogen Keller NextGen aktualisieren', faellig: 'Heute', kundeId: 'VV005', erledigt: false },
    { text: 'Rebalancing Dr. von Trott (Aktien +2pp über Ziel)', faellig: 'Morgen', kundeId: 'VV001', erledigt: false },
    { text: 'Investmentvorschlag Dr. Meier senden (Pipeline)', faellig: '15.03.', kundeId: 'VV-PIPE2', erledigt: false },
  ],
};

// Keep legacy export for backward compatibility
export const AUFGABEN = AUFGABEN_BY_MODE.versicherung;
