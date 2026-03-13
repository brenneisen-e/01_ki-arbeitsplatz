// ─── VV Extended Mock Data ────────────────────────────────────────────────────
// Extended data for Vermoegensverwaltung mode: Performance, WpHG, Familie,
// Engagement, Leads and Revenue.

// ─── 1. VV_PERFORMANCE ── Per-mandant performance data ──────────────────────

export const VV_PERFORMANCE = {
  // ── W1: Dr. Heinrich von Trott – Konservativ ──
  VV00001: {
    monthlyReturns: [
      { name: 'Jan', portfolio: 0.8, benchmark: 0.5 },
      { name: 'Feb', portfolio: 1.3, benchmark: 0.7 },
      { name: 'Mär', portfolio: 0.4, benchmark: 0.3 },
      { name: 'Apr', portfolio: 0.9, benchmark: 0.6 },
      { name: 'Mai', portfolio: -0.3, benchmark: -0.5 },
      { name: 'Jun', portfolio: 0.7, benchmark: 0.4 },
      { name: 'Jul', portfolio: 1.1, benchmark: 0.8 },
      { name: 'Aug', portfolio: -0.6, benchmark: -0.9 },
      { name: 'Sep', portfolio: 0.5, benchmark: 0.3 },
      { name: 'Okt', portfolio: 1.4, benchmark: 1.0 },
      { name: 'Nov', portfolio: 0.8, benchmark: 0.6 },
      { name: 'Dez', portfolio: 1.2, benchmark: 0.9 },
    ],
    allocation: { aktien: 45, anleihen: 30, alternative: 15, cash: 5, immobilien: 5 },
    targetAllocation: { aktien: 43, anleihen: 32, alternative: 15, cash: 5, immobilien: 5 },
    sectors: [
      { name: 'Technologie', value: 16 },
      { name: 'Healthcare', value: 14 },
      { name: 'Finanzen', value: 13 },
      { name: 'Industrie', value: 12 },
      { name: 'Konsum', value: 9 },
      { name: 'Energie', value: 8 },
      { name: 'Versorger', value: 7 },
      { name: 'Grundstoffe', value: 5 },
    ],
    regions: [
      { name: 'Europa', value: 42 },
      { name: 'Nordamerika', value: 30 },
      { name: 'Asien-Pazifik', value: 15 },
      { name: 'Schwellenlaender', value: 8 },
      { name: 'Sonstige', value: 5 },
    ],
    riskMetrics: { volatilitaet: 8.2, sharpe: 1.05, maxDrawdown: -5.1, var95: -2.3, trackingError: 1.8 },
    bonds: [
      { name: 'Investment Grade', value: 55 },
      { name: 'High Yield', value: 10 },
      { name: 'Staatsanleihen', value: 20 },
      { name: 'Pfandbriefe', value: 10 },
      { name: 'Emerging Markets', value: 5 },
    ],
    currencies: [
      { name: 'EUR', value: 62 },
      { name: 'USD', value: 22 },
      { name: 'CHF', value: 8 },
      { name: 'GBP', value: 5 },
      { name: 'Sonstige', value: 3 },
    ],
    ioComment: 'Das Portfolio entwickelt sich im Rahmen der Erwartungen. Die konservative Ausrichtung mit Schwerpunkt europaeische Qualitaetsaktien und Investment-Grade-Anleihen hat sich in der aktuellen Marktphase bewaehrt. Die Duration im Anleihensegment wurde taktisch auf 4,8 Jahre reduziert. Wir empfehlen eine moderate Erhoehung der Aktienquote bei Ruecksetzern. Der ESG-Filter ist aktiv, ein Upgrade auf Art.9 wird geprueft.',
  },

  // ── W2: Familie Lindenberg – Wachstum ──
  VV00002: {
    monthlyReturns: [
      { name: 'Jan', portfolio: 1.5, benchmark: 0.5 },
      { name: 'Feb', portfolio: 2.3, benchmark: 1.0 },
      { name: 'Mär', portfolio: -0.8, benchmark: -0.3 },
      { name: 'Apr', portfolio: 1.8, benchmark: 0.9 },
      { name: 'Mai', portfolio: -1.2, benchmark: -0.7 },
      { name: 'Jun', portfolio: 2.1, benchmark: 1.1 },
      { name: 'Jul', portfolio: 1.6, benchmark: 0.8 },
      { name: 'Aug', portfolio: -1.5, benchmark: -1.0 },
      { name: 'Sep', portfolio: 0.9, benchmark: 0.4 },
      { name: 'Okt', portfolio: 2.8, benchmark: 1.5 },
      { name: 'Nov', portfolio: 1.4, benchmark: 0.7 },
      { name: 'Dez', portfolio: 2.2, benchmark: 1.2 },
    ],
    allocation: { aktien: 57, anleihen: 18, alternative: 20, cash: 3, immobilien: 2 },
    targetAllocation: { aktien: 55, anleihen: 20, alternative: 20, cash: 3, immobilien: 2 },
    sectors: [
      { name: 'Technologie', value: 28 },
      { name: 'Healthcare', value: 12 },
      { name: 'Konsum', value: 15 },
      { name: 'Kommunikation', value: 11 },
      { name: 'Finanzen', value: 10 },
      { name: 'Industrie', value: 8 },
      { name: 'Sonstige', value: 16 },
    ],
    regions: [
      { name: 'Nordamerika', value: 45 },
      { name: 'Europa', value: 28 },
      { name: 'Asien-Pazifik', value: 18 },
      { name: 'Schwellenlaender', value: 6 },
      { name: 'Sonstige', value: 3 },
    ],
    riskMetrics: { volatilitaet: 12.5, sharpe: 1.35, maxDrawdown: -8.7, var95: -3.8, trackingError: 3.2 },
    bonds: [
      { name: 'Investment Grade', value: 40 },
      { name: 'High Yield', value: 25 },
      { name: 'Staatsanleihen', value: 15 },
      { name: 'Wandelanleihen', value: 12 },
      { name: 'Emerging Markets', value: 8 },
    ],
    currencies: [
      { name: 'EUR', value: 48 },
      { name: 'USD', value: 35 },
      { name: 'GBP', value: 7 },
      { name: 'CHF', value: 5 },
      { name: 'Sonstige', value: 5 },
    ],
    ioComment: 'Starke YTD-Performance dank Tech-Uebergewichtung. Die Aktienquote liegt leicht ueber Soll (+2pp), was bei der aktuellen Marktdynamik bewusst beibehalten wird. Bei der geplanten Cash-Konsolidierung (5,5M bei Commerzbank) empfehlen wir ein Upgrade auf FairValue mit breiterer Diversifikation. PE-Allokation sollte im Zuge der Konsolidierung auf 10-15% erhoeht werden.',
  },

  // ── W3: Stiftung Weber – Defensiv ──
  VV00003: {
    monthlyReturns: [
      { name: 'Jan', portfolio: 0.6, benchmark: 0.4 },
      { name: 'Feb', portfolio: 0.9, benchmark: 0.8 },
      { name: 'Mär', portfolio: 0.2, benchmark: 0.1 },
      { name: 'Apr', portfolio: 0.5, benchmark: 0.4 },
      { name: 'Mai', portfolio: -0.1, benchmark: -0.3 },
      { name: 'Jun', portfolio: 0.4, benchmark: 0.3 },
      { name: 'Jul', portfolio: 0.6, benchmark: 0.5 },
      { name: 'Aug', portfolio: -0.2, benchmark: -0.4 },
      { name: 'Sep', portfolio: 0.3, benchmark: 0.2 },
      { name: 'Okt', portfolio: 0.7, benchmark: 0.6 },
      { name: 'Nov', portfolio: 0.5, benchmark: 0.4 },
      { name: 'Dez', portfolio: 0.8, benchmark: 0.7 },
    ],
    allocation: { aktien: 30, anleihen: 50, alternative: 8, cash: 7, immobilien: 5 },
    targetAllocation: { aktien: 28, anleihen: 52, alternative: 8, cash: 7, immobilien: 5 },
    sectors: [
      { name: 'Versorger', value: 18 },
      { name: 'Healthcare', value: 15 },
      { name: 'Konsum', value: 14 },
      { name: 'Finanzen', value: 12 },
      { name: 'Industrie', value: 10 },
      { name: 'Technologie', value: 8 },
      { name: 'Grundstoffe', value: 6 },
      { name: 'Sonstige', value: 17 },
    ],
    regions: [
      { name: 'Europa', value: 55 },
      { name: 'Nordamerika', value: 22 },
      { name: 'Asien-Pazifik', value: 10 },
      { name: 'Schwellenlaender', value: 5 },
      { name: 'Sonstige', value: 8 },
    ],
    riskMetrics: { volatilitaet: 5.4, sharpe: 0.82, maxDrawdown: -3.2, var95: -1.5, trackingError: 0.9 },
    bonds: [
      { name: 'Staatsanleihen', value: 35 },
      { name: 'Investment Grade', value: 30 },
      { name: 'Pfandbriefe', value: 20 },
      { name: 'Nachhaltigkeitsanleihen', value: 10 },
      { name: 'High Yield', value: 5 },
    ],
    currencies: [
      { name: 'EUR', value: 72 },
      { name: 'USD', value: 15 },
      { name: 'CHF', value: 8 },
      { name: 'GBP', value: 3 },
      { name: 'Sonstige', value: 2 },
    ],
    ioComment: 'Das Stiftungsmandat zeigt stabile Entwicklung mit Fokus auf Kapitalerhalt und regelmaessige Ausschuettung. Die Anleihenquote wurde bei 50% gehalten, mit Schwerpunkt auf Staats- und Pfandbriefen. ESG-Upgrade auf Art.9 wird vom Stiftungsrat geprueft. Die Ausschuettungsrendite liegt bei plan-konformen 3,0% p.a. Eine Optimierung im Anleihensegment koennte die Ausschuettung um ca. 30.000 EUR p.a. steigern.',
  },

  // ── W4: Prof. Dr. Hartmann – Ausgewogen ──
  VV00004: {
    monthlyReturns: [
      { name: 'Jan', portfolio: 0.9, benchmark: 0.7 },
      { name: 'Feb', portfolio: 1.5, benchmark: 1.1 },
      { name: 'Mär', portfolio: 0.1, benchmark: -0.1 },
      { name: 'Apr', portfolio: 1.1, benchmark: 0.8 },
      { name: 'Mai', portfolio: -0.7, benchmark: -0.6 },
      { name: 'Jun', portfolio: 0.8, benchmark: 0.5 },
      { name: 'Jul', portfolio: 1.3, benchmark: 1.0 },
      { name: 'Aug', portfolio: -0.9, benchmark: -1.1 },
      { name: 'Sep', portfolio: 0.6, benchmark: 0.4 },
      { name: 'Okt', portfolio: 1.6, benchmark: 1.2 },
      { name: 'Nov', portfolio: 1.0, benchmark: 0.8 },
      { name: 'Dez', portfolio: 1.5, benchmark: 1.1 },
    ],
    allocation: { aktien: 42, anleihen: 33, alternative: 12, cash: 5, immobilien: 8 },
    targetAllocation: { aktien: 40, anleihen: 35, alternative: 12, cash: 5, immobilien: 8 },
    sectors: [
      { name: 'Healthcare', value: 22 },
      { name: 'Technologie', value: 14 },
      { name: 'Finanzen', value: 12 },
      { name: 'Industrie', value: 10 },
      { name: 'Konsum', value: 9 },
      { name: 'Versorger', value: 7 },
      { name: 'Sonstige', value: 26 },
    ],
    regions: [
      { name: 'Europa', value: 48 },
      { name: 'Nordamerika', value: 28 },
      { name: 'Asien-Pazifik', value: 14 },
      { name: 'Schwellenlaender', value: 6 },
      { name: 'Sonstige', value: 4 },
    ],
    riskMetrics: { volatilitaet: 9.1, sharpe: 1.15, maxDrawdown: -6.4, var95: -2.8, trackingError: 2.1 },
    bonds: [
      { name: 'Investment Grade', value: 45 },
      { name: 'Staatsanleihen', value: 25 },
      { name: 'Pfandbriefe', value: 12 },
      { name: 'High Yield', value: 10 },
      { name: 'Emerging Markets', value: 8 },
    ],
    currencies: [
      { name: 'EUR', value: 58 },
      { name: 'USD', value: 25 },
      { name: 'CHF', value: 10 },
      { name: 'GBP', value: 4 },
      { name: 'Sonstige', value: 3 },
    ],
    ioComment: 'Portfolio leicht ueber Benchmark dank Healthcare-Uebergewichtung, die die Fachexpertise des Mandanten reflektiert. Aktienquote +2pp ueber Soll – Rebalancing bei naechster Gelegenheit empfohlen. Die Immofonds-Allokation (8%) liefert stabile Ertraege. PE Healthcare Fund II (Co-Investment) wird aktuell geprueft. ING-Tagesgeld (250k) sollte konsolidiert werden.',
  },

  // ── W5: Tim Keller – Aggressiv / Tech ──
  VV00005: {
    monthlyReturns: [
      { name: 'Jan', portfolio: 2.2, benchmark: 0.5 },
      { name: 'Feb', portfolio: 2.8, benchmark: 1.2 },
      { name: 'Mär', portfolio: -2.1, benchmark: -0.8 },
      { name: 'Apr', portfolio: 3.1, benchmark: 1.0 },
      { name: 'Mai', portfolio: -1.8, benchmark: -0.5 },
      { name: 'Jun', portfolio: 2.5, benchmark: 1.3 },
      { name: 'Jul', portfolio: 3.4, benchmark: 1.5 },
      { name: 'Aug', portfolio: -2.8, benchmark: -1.4 },
      { name: 'Sep', portfolio: 1.2, benchmark: 0.6 },
      { name: 'Okt', portfolio: 4.1, benchmark: 2.0 },
      { name: 'Nov', portfolio: 2.0, benchmark: 0.9 },
      { name: 'Dez', portfolio: 3.5, benchmark: 1.8 },
    ],
    allocation: { aktien: 67, anleihen: 8, alternative: 20, cash: 5, immobilien: 0 },
    targetAllocation: { aktien: 65, anleihen: 10, alternative: 20, cash: 5, immobilien: 0 },
    sectors: [
      { name: 'Technologie', value: 38 },
      { name: 'Kommunikation', value: 12 },
      { name: 'Konsum', value: 10 },
      { name: 'Healthcare', value: 8 },
      { name: 'Finanzen', value: 7 },
      { name: 'Industrie', value: 5 },
    ],
    regions: [
      { name: 'Nordamerika', value: 50 },
      { name: 'Asien-Pazifik', value: 22 },
      { name: 'Europa', value: 18 },
      { name: 'Schwellenlaender', value: 7 },
      { name: 'Sonstige', value: 3 },
    ],
    riskMetrics: { volatilitaet: 15.8, sharpe: 1.42, maxDrawdown: -11.5, var95: -4.9, trackingError: 5.1 },
    bonds: [
      { name: 'High Yield', value: 35 },
      { name: 'Wandelanleihen', value: 30 },
      { name: 'Investment Grade', value: 20 },
      { name: 'Emerging Markets', value: 15 },
    ],
    currencies: [
      { name: 'USD', value: 45 },
      { name: 'EUR', value: 35 },
      { name: 'CHF', value: 5 },
      { name: 'GBP', value: 5 },
      { name: 'Sonstige', value: 10 },
    ],
    ioComment: 'Aggressives Wachstumsprofil mit starker Tech-Uebergewichtung. Die YTD-Outperformance gegenueber Benchmark ist beeindruckend (+3,4pp), geht aber mit erhoehter Volatilitaet einher. Krypto-Exposure (120k extern) sollte im Gesamtkontext beruecksichtigt werden. Bei erfolgreichem naechsten Exit empfehlen wir Upgrade auf FairValue mit breiterer Diversifikation.',
  },
};


// ─── 2. VV_WPHG ── WpHG Compliance data per Mandant ────────────────────────

export const VV_WPHG = {
  // ── W1: Dr. Heinrich von Trott ──
  VV00001: {
    fragebogen: {
      letztesUpdate: '2025-11-15',
      naechstesPruefung: '2026-05-15',
      status: 'aktuell',
      risikoklasse: 3,
      anlageziel: 'Kapitalerhalt mit moderatem Wachstum',
      anlagehorizont: '10+ Jahre',
      erfahrung: { aktien: 'hoch', anleihen: 'hoch', alternative: 'mittel', derivate: 'gering' },
    },
    geeignetheit: {
      status: 'konform',
      pruefungen: [
        { datum: '2026-03-01', typ: 'Quartalspruefung', ergebnis: 'bestanden', details: 'Alle Positionen innerhalb der Risikoklasse. Aktienquote konform.' },
        { datum: '2025-12-15', typ: 'Jahrespruefung', ergebnis: 'bestanden', details: 'Gesamtportfolio entspricht Risikoprofil und Anlagezielen.' },
        { datum: '2025-09-20', typ: 'Ad-hoc Pruefung', ergebnis: 'bestanden', details: 'ESG-Filter-Anpassung geprueft und konform.' },
      ],
    },
    verlustschwelle: {
      schwelle: -10,
      aktuell: -3.2,
      status: 'ok',
      meldungen: [
        { datum: '2024-10-15', schwelle: -10, verlust: -6.8, gemeldet: false },
        { datum: '2022-09-30', schwelle: -10, verlust: -11.2, gemeldet: true },
      ],
    },
    kosten: {
      exAnte: {
        managementFee: 0.85,
        performanceFee: 'keine',
        custodyFee: 0.05,
        transaktionskosten: 0.12,
        gesamtTER: 1.02,
      },
      exPost: { jahr: 2025, gesamtkosten: 127500, renditeNachKosten: 7.5 },
    },
    dokumente: [
      { typ: 'WpHG-Fragebogen', datum: '2025-11-15', status: 'aktuell' },
      { typ: 'Geeignetheitspruefung', datum: '2026-03-01', status: 'aktuell' },
      { typ: 'Ex-Ante Kosteninformation', datum: '2026-01-10', status: 'aktuell' },
      { typ: 'Ex-Post Kostenausweis', datum: '2026-02-28', status: 'aktuell' },
      { typ: 'Vermoegensverwaltungsvertrag', datum: '2018-01-15', status: 'aktuell' },
    ],
  },

  // ── W2: Familie Lindenberg ──
  VV00002: {
    fragebogen: {
      letztesUpdate: '2025-08-20',
      naechstesPruefung: '2026-08-20',
      status: 'aktuell',
      risikoklasse: 4,
      anlageziel: 'Langfristiges Vermoegenswachstum',
      anlagehorizont: '10+ Jahre',
      erfahrung: { aktien: 'hoch', anleihen: 'mittel', alternative: 'hoch', derivate: 'mittel' },
    },
    geeignetheit: {
      status: 'konform',
      pruefungen: [
        { datum: '2026-02-15', typ: 'Quartalspruefung', ergebnis: 'bestanden', details: 'Tech-Uebergewichtung innerhalb der Risikoklasse 4 toleriert.' },
        { datum: '2025-11-10', typ: 'Quartalspruefung', ergebnis: 'bestanden', details: 'PE-Allokation geprueft und konform.' },
        { datum: '2025-08-20', typ: 'Jahrespruefung', ergebnis: 'bestanden', details: 'Neuer Fragebogen nach SaaS-Exit, Risikoklasse 4 bestaetigt.' },
      ],
    },
    verlustschwelle: {
      schwelle: -15,
      aktuell: -5.1,
      status: 'ok',
      meldungen: [],
    },
    kosten: {
      exAnte: {
        managementFee: 1.05,
        performanceFee: 'keine',
        custodyFee: 0.05,
        transaktionskosten: 0.15,
        gesamtTER: 1.25,
      },
      exPost: { jahr: 2025, gesamtkosten: 26250, renditeNachKosten: 10.9 },
    },
    dokumente: [
      { typ: 'WpHG-Fragebogen', datum: '2025-08-20', status: 'aktuell' },
      { typ: 'Geeignetheitspruefung', datum: '2026-02-15', status: 'aktuell' },
      { typ: 'Ex-Ante Kosteninformation', datum: '2026-01-10', status: 'aktuell' },
      { typ: 'Ex-Post Kostenausweis', datum: '2026-02-28', status: 'aktuell' },
      { typ: 'Vermoegensverwaltungsvertrag', datum: '2024-06-01', status: 'aktuell' },
    ],
  },

  // ── W3: Stiftung Weber ──
  VV00003: {
    fragebogen: {
      letztesUpdate: '2025-10-01',
      naechstesPruefung: '2026-04-01',
      status: 'aktuell',
      risikoklasse: 2,
      anlageziel: 'Realer Kapitalerhalt mit laufender Ausschuettung',
      anlagehorizont: 'unbefristet',
      erfahrung: { aktien: 'mittel', anleihen: 'hoch', alternative: 'gering', derivate: 'gering' },
    },
    geeignetheit: {
      status: 'konform',
      pruefungen: [
        { datum: '2026-02-28', typ: 'Quartalspruefung', ergebnis: 'bestanden', details: 'Kapitalerhalt und Ausschuettungsziel (3%) erfuellt.' },
        { datum: '2025-12-01', typ: 'Stiftungsrechtliche Pruefung', ergebnis: 'bestanden', details: 'Anlage konform mit Stiftungssatzung und Anlagerichtlinien.' },
        { datum: '2025-10-01', typ: 'Jahrespruefung', ergebnis: 'bestanden', details: 'Stiftungsrat hat Anlagerichtlinien bestaetigt.' },
      ],
    },
    verlustschwelle: {
      schwelle: -8,
      aktuell: -1.5,
      status: 'ok',
      meldungen: [
        { datum: '2022-06-30', schwelle: -8, verlust: -8.5, gemeldet: true },
      ],
    },
    kosten: {
      exAnte: {
        managementFee: 0.75,
        performanceFee: 'keine',
        custodyFee: 0.04,
        transaktionskosten: 0.08,
        gesamtTER: 0.87,
      },
      exPost: { jahr: 2025, gesamtkosten: 72210, renditeNachKosten: 4.3 },
    },
    dokumente: [
      { typ: 'WpHG-Fragebogen', datum: '2025-10-01', status: 'aktuell' },
      { typ: 'Geeignetheitspruefung', datum: '2026-02-28', status: 'aktuell' },
      { typ: 'Stiftungsanlagerichtlinien', datum: '2025-10-01', status: 'aktuell' },
      { typ: 'Ex-Ante Kosteninformation', datum: '2026-01-10', status: 'aktuell' },
      { typ: 'Ex-Post Kostenausweis', datum: '2026-02-28', status: 'aktuell' },
      { typ: 'Vermoegensverwaltungsvertrag', datum: '2008-01-15', status: 'aktuell' },
    ],
  },

  // ── W4: Prof. Dr. Hartmann ──
  VV00004: {
    fragebogen: {
      letztesUpdate: '2025-09-10',
      naechstesPruefung: '2026-09-10',
      status: 'aktuell',
      risikoklasse: 3,
      anlageziel: 'Ausgewogenes Wachstum mit Healthcare-Schwerpunkt',
      anlagehorizont: '7-10 Jahre',
      erfahrung: { aktien: 'hoch', anleihen: 'mittel', alternative: 'mittel', derivate: 'gering' },
    },
    geeignetheit: {
      status: 'konform',
      pruefungen: [
        { datum: '2026-03-01', typ: 'Quartalspruefung', ergebnis: 'bestanden', details: 'Healthcare-Schwerpunkt (22%) konform mit Anlageziel.' },
        { datum: '2025-12-10', typ: 'Quartalspruefung', ergebnis: 'bestanden', details: 'PE Healthcare Allokation geprueft und konform.' },
        { datum: '2025-09-10', typ: 'Jahrespruefung', ergebnis: 'bestanden', details: 'Anlageziel und Risikoklasse bestaetigt.' },
      ],
    },
    verlustschwelle: {
      schwelle: -10,
      aktuell: -4.8,
      status: 'ok',
      meldungen: [
        { datum: '2022-09-30', schwelle: -10, verlust: -12.1, gemeldet: true },
      ],
    },
    kosten: {
      exAnte: {
        managementFee: 0.85,
        performanceFee: '10% > Benchmark',
        custodyFee: 0.05,
        transaktionskosten: 0.10,
        gesamtTER: 1.00,
      },
      exPost: { jahr: 2025, gesamtkosten: 68000, renditeNachKosten: 8.1 },
    },
    dokumente: [
      { typ: 'WpHG-Fragebogen', datum: '2025-09-10', status: 'aktuell' },
      { typ: 'Geeignetheitspruefung', datum: '2026-03-01', status: 'aktuell' },
      { typ: 'Ex-Ante Kosteninformation', datum: '2026-01-10', status: 'aktuell' },
      { typ: 'Ex-Post Kostenausweis', datum: '2026-02-28', status: 'aktuell' },
      { typ: 'Vermoegensverwaltungsvertrag', datum: '2019-01-10', status: 'aktuell' },
    ],
  },

  // ── W5: Tim Keller – ABGELAUFEN (Demo) ──
  VV00005: {
    fragebogen: {
      letztesUpdate: '2024-12-15',
      naechstesPruefung: '2025-06-15',
      status: 'abgelaufen',
      risikoklasse: 5,
      anlageziel: 'Maximales Wachstum, Tech/Impact',
      anlagehorizont: '15+ Jahre',
      erfahrung: { aktien: 'hoch', anleihen: 'gering', alternative: 'hoch', derivate: 'mittel' },
    },
    geeignetheit: {
      status: 'warnung',
      pruefungen: [
        { datum: '2026-03-10', typ: 'Quartalspruefung', ergebnis: 'warnung', details: 'WpHG-Fragebogen abgelaufen seit 15.06.2025. Erneuerung dringend erforderlich.' },
        { datum: '2025-12-01', typ: 'Quartalspruefung', ergebnis: 'warnung', details: 'Fragebogen abgelaufen. Mandant wurde per E-Mail kontaktiert.' },
        { datum: '2025-06-15', typ: 'Jahrespruefung', ergebnis: 'faellig', details: 'Pruefung faellig, Mandant hat Termin nicht wahrgenommen.' },
      ],
    },
    verlustschwelle: {
      schwelle: -20,
      aktuell: -8.3,
      status: 'ok',
      meldungen: [],
    },
    kosten: {
      exAnte: {
        managementFee: 1.05,
        performanceFee: 'keine',
        custodyFee: 0.05,
        transaktionskosten: 0.18,
        gesamtTER: 1.28,
      },
      exPost: { jahr: 2025, gesamtkosten: 5760, renditeNachKosten: 10.2 },
    },
    dokumente: [
      { typ: 'WpHG-Fragebogen', datum: '2024-12-15', status: 'abgelaufen', faellig: '2025-06-15' },
      { typ: 'Geeignetheitspruefung', datum: '2026-03-10', status: 'aktuell' },
      { typ: 'Ex-Ante Kosteninformation', datum: '2026-01-10', status: 'aktuell' },
      { typ: 'Ex-Post Kostenausweis', datum: '2026-02-28', status: 'aktuell' },
      { typ: 'Vermoegensverwaltungsvertrag', datum: '2025-01-05', status: 'aktuell' },
    ],
  },
};


// ─── 3. VV_FAMILIE ── Family / Network data per Mandant ─────────────────────

export const VV_FAMILIE = {
  // ── W1: Dr. Heinrich von Trott ──
  VV00001: {
    mitglieder: [
      { name: 'Dr. Heinrich von Trott', rolle: 'mandant', alter: 62, beruf: 'Unternehmer Maschinenbau 3.Gen', mandant: true, aum: 12500000 },
      { name: 'Elisabeth von Trott', rolle: 'ehepartner', alter: 59, beruf: 'Stiftungsvorstand (ehrenamtlich)', vermoegen: 850000 },
      { name: 'Charlotte von Trott', rolle: 'kind', alter: 32, beruf: 'Anwaeltin, Partnerin Wirtschaftskanzlei (Frankfurt)', vermoegen: 800000 },
      { name: 'Friedrich von Trott', rolle: 'kind', alter: 28, beruf: 'Ingenieur, im Familienunternehmen taetig', vermoegen: 250000 },
    ],
    vermoegensUebersicht: {
      gesamt: 24170000,
      aufgliederung: [
        { typ: 'Eigenes Mandat', volumen: 12500000, anteil: 51.7 },
        { typ: 'Fremdbanken', volumen: 3200000, anteil: 13.2 },
        { typ: 'Immobilien', volumen: 3650000, anteil: 15.1 },
        { typ: 'Unternehmen', volumen: 4500000, anteil: 18.6 },
        { typ: 'Sonstiges', volumen: 320000, anteil: 1.4 },
      ],
    },
    generationenPlanung: {
      themen: [
        'Unternehmensnachfolge Maschinenbau GmbH – Friedrich als Nachfolger',
        'NextGen Charlotte – eigene Vermoegensverwaltung aufbauen',
        'Familienstiftung Gruendung – Elisabeth als Initiatorin',
        'Steueroptimierte Vermoegensuebertragung an Kinder',
        'LV-Ablauf 2026 – Wiederanlage planen',
      ],
      zeitrahmen: '3-5 Jahre (Uebergabe Unternehmen)',
      notizen: 'Heinrich plant Rueckzug aus dem operativen Geschaeft mit 65-67. Friedrich wird eingearbeitet, Charlotte hat kein Interesse am Unternehmen. Elisabeth moechte Familienstiftung fuer Bildungszwecke gruenden (2M Stiftungskapital). Erbschaftssteuerliche Optimierung sollte fruehzeitig geplant werden.',
    },
  },

  // ── W2: Familie Lindenberg ──
  VV00002: {
    mitglieder: [
      { name: 'Markus Lindenberg', rolle: 'mandant', alter: 51, beruf: 'SaaS-Unternehmer (Exit 2024, 8M netto)', mandant: true, aum: 2100000 },
      { name: 'Julia Lindenberg', rolle: 'ehepartner', alter: 48, beruf: 'CTO (eigenes Startup)', vermoegen: 450000 },
      { name: 'Noah Lindenberg', rolle: 'kind', alter: 18, beruf: 'Abiturient, Studienbeginn 2026' },
      { name: 'Ella Lindenberg', rolle: 'kind', alter: 15, beruf: 'Schuelerin (Gymnasium)' },
    ],
    vermoegensUebersicht: {
      gesamt: 10430000,
      aufgliederung: [
        { typ: 'Eigenes Mandat', volumen: 2400000, anteil: 23.0 },
        { typ: 'Fremdbanken', volumen: 5700000, anteil: 54.7 },
        { typ: 'Immobilien', volumen: 1650000, anteil: 15.8 },
        { typ: 'Unternehmen', volumen: 400000, anteil: 3.8 },
        { typ: 'Sonstiges', volumen: 280000, anteil: 2.7 },
      ],
    },
    generationenPlanung: {
      themen: [
        'Cash-Konsolidierung 5,5M (hoechste Prioritaet)',
        'NextGen Noah – Studiendepot 100k',
        'Julias Startup – Liquiditaetsbedarf beobachten',
        'Angel-Portfolio professionalisieren',
        'Langfristige Familienstruktur planen',
      ],
      zeitrahmen: '1-2 Jahre (Cash-Konsolidierung kurzfristig)',
      notizen: 'Markus hat durch den SaaS-Exit 2024 erhebliche liquide Mittel erhalten, die noch groesstenteils unstrukturiert bei der Commerzbank liegen. Julia arbeitet an einem eigenen Startup (Seed-Phase). Noah beginnt 2026 mit dem Studium. Ella hat noch 3 Jahre Schule. Prioritaet: Cash strukturiert investieren, bevor Inflation den Wert auffrisst.',
    },
  },

  // ── W3: Stiftung Weber ──
  VV00003: {
    mitglieder: [
      { name: 'Stiftung Weber', rolle: 'stiftung', alter: 0, beruf: 'Bildungsstiftung (gegruendet 2008)', mandant: true, aum: 8300000 },
      { name: 'Dr. Martin Weber', rolle: 'mandant', alter: 74, beruf: 'Stifter, ehem. Unternehmer' },
      { name: 'Claudia Weber', rolle: 'ehepartner', alter: 71, beruf: 'Stiftungsvorstand' },
      { name: 'Dr. Thomas Fischer', rolle: 'kind', alter: 0, beruf: 'Geschaeftsfuehrer Stiftung, Vorstandsmitglied' },
    ],
    vermoegensUebersicht: {
      gesamt: 8800000,
      aufgliederung: [
        { typ: 'Eigenes Mandat', volumen: 8300000, anteil: 94.3 },
        { typ: 'Fremdbanken', volumen: 500000, anteil: 5.7 },
        { typ: 'Immobilien', volumen: 0, anteil: 0 },
        { typ: 'Unternehmen', volumen: 0, anteil: 0 },
        { typ: 'Sonstiges', volumen: 0, anteil: 0 },
      ],
    },
    generationenPlanung: {
      themen: [
        'ESG Art.9 Upgrade des Stiftungsmandats',
        'Ausschuettungsoptimierung fuer Foerderzwecke',
        'Sparkasse-Festgeld bei Faelligkeit konsolidieren',
        'Stiftungskapital langfristig erhalten (realer Kapitalerhalt)',
      ],
      zeitrahmen: 'Unbefristet (Stiftung auf Dauer angelegt)',
      notizen: 'Die Stiftung Weber foerdert seit 2008 Bildungsprojekte in der Region. Jaehrliche Ausschuettung ca. 250.000 EUR fuer Foerderzwecke. Der Stiftungsrat tagt halbjaehrlich. Dr. Weber (Stifter) zieht sich zunehmend zurueck, Dr. Fischer uebernimmt operativ. Ziel: realer Kapitalerhalt bei zuverlaessiger Ausschuettung.',
    },
  },

  // ── W4: Prof. Dr. Hartmann ──
  VV00004: {
    mitglieder: [
      { name: 'Prof. Dr. Michael Hartmann', rolle: 'mandant', alter: 56, beruf: 'Chefarzt Kardiologie + Privatpraxis', mandant: true, aum: 6800000 },
      { name: 'Andrea Hartmann', rolle: 'ehepartner', alter: 53, beruf: 'Psychologin (eigene Praxis)', vermoegen: 380000 },
      { name: 'Jan Hartmann', rolle: 'kind', alter: 26, beruf: 'Assistenzarzt Innere Medizin', vermoegen: 50000 },
      { name: 'Sophie Hartmann', rolle: 'kind', alter: 23, beruf: 'Medizinstudentin (5. Semester)' },
    ],
    vermoegensUebersicht: {
      gesamt: 8330000,
      aufgliederung: [
        { typ: 'Eigenes Mandat', volumen: 7000000, anteil: 84.0 },
        { typ: 'Fremdbanken', volumen: 330000, anteil: 4.0 },
        { typ: 'Immobilien', volumen: 800000, anteil: 9.6 },
        { typ: 'Unternehmen', volumen: 0, anteil: 0 },
        { typ: 'Sonstiges', volumen: 200000, anteil: 2.4 },
      ],
    },
    generationenPlanung: {
      themen: [
        'Praxisnachfolge planen (Verkauf in 5-8 Jahren)',
        'NextGen Jan – eigene Vermoegensverwaltung aufbauen',
        'Sophie – Studienfinanzierung und spaetere Niederlassung',
        'PE Healthcare Fund II – Fachexpertise nutzen',
        'ING-Tagesgeld konsolidieren',
      ],
      zeitrahmen: '5-8 Jahre (Praxisverkauf)',
      notizen: 'Prof. Hartmann plant den Verkauf seiner Privatpraxis in 5-8 Jahren (dann 61-64). Sohn Jan (Assistenzarzt) koennte eventuell uebernehmen, was aber noch offen ist. Sophie studiert Medizin und plant eigene kardiologische Praxis. Andrea fuehrt eine eigene psychologische Praxis. Praxisverkauferloese (ca. 800k) sollen ins FairValue Mandat fliessen.',
    },
  },

  // ── W5: Tim Keller ──
  VV00005: {
    mitglieder: [
      { name: 'Tim Keller', rolle: 'mandant', alter: 29, beruf: 'Tech-Gruender (Seed-Exit 500k)', mandant: true, aum: 450000 },
    ],
    vermoegensUebersicht: {
      gesamt: 658000,
      aufgliederung: [
        { typ: 'Eigenes Mandat', volumen: 450000, anteil: 68.4 },
        { typ: 'Fremdbanken', volumen: 8000, anteil: 1.2 },
        { typ: 'Immobilien', volumen: 0, anteil: 0 },
        { typ: 'Unternehmen', volumen: 80000, anteil: 12.2 },
        { typ: 'Sonstiges', volumen: 120000, anteil: 18.2 },
      ],
    },
    generationenPlanung: {
      themen: [
        'Naechster Exit vorbereiten – Upgrade auf FairValue',
        'Krypto-Bestand strukturieren und integrieren',
        'Angel-Portfolio professionell tracken',
        'Langfristigen Vermoegensaufbau starten',
      ],
      zeitrahmen: '2-3 Jahre (naechster Startup-Exit)',
      notizen: 'Tim ist als Tech-Gruender ein typischer NextGen-Mandant mit hohem Wachstumspotenzial. Aktuell kleines AuM (450k), aber bei erfolgreichem naechsten Exit (Series A Investment) koennte das Volumen auf 1,5-2M steigen. Krypto-Bestand (120k) und Angel-Investments (80k) sollten im Gesamtreporting integriert werden. WpHG-Fragebogen ist abgelaufen – Erneuerung dringend.',
    },
  },
};


// ─── 4. VV_ENGAGEMENT ── Digital engagement signals per Mandant ──────────────

export const VV_ENGAGEMENT = {
  // ── W1: Dr. Heinrich von Trott ──
  VV00001: {
    linkedin: {
      url: 'linkedin.com/in/heinrich-von-trott',
      profilUrl: 'linkedin.com/in/heinrich-von-trott',
      aktivitaet: 'niedrig',
      letzterPost: '2025-06-10',
      themen: ['Maschinenbau', 'Industrie 4.0', 'Familienunternehmen'],
      kontakte: 480,
      letzteAktivitaeten: [
        { typ: 'share', datum: '2025-06-10', inhalt: 'Artikel geteilt: "Nachfolge im Mittelstand – Herausforderungen 2025"' },
        { typ: 'like', datum: '2025-05-22', inhalt: 'IHK-Beitrag zu Industrie 4.0 Foerderung geliked' },
        { typ: 'profil_update', datum: '2025-04-15', inhalt: 'Profilbild aktualisiert' },
      ],
      signale: ['Nachfolge-Thema aktiv', 'ESG-Roadmap 2030 erwaehnt', 'Sohn Friedrich als neuer COO'],
    },
    website: {
      besuche: [
        { datum: '2026-02-20', seite: '/marktbericht', dauer: 180 },
        { datum: '2026-01-15', seite: '/quartalsbericht', dauer: 420 },
        { datum: '2025-12-10', seite: '/esg-report', dauer: 240 },
      ],
      letzterBesuch: '2026-02-20',
      besuche90Tage: 5,
      avgVerweildauer: '4:40 Min',
      topSeiten: [
        { seite: '/quartalsbericht', besuche: 3 },
        { seite: '/marktbericht', besuche: 2 },
        { seite: '/esg-report', besuche: 1 },
      ],
      signale: ['Regelmaessig Quartalsbericht gelesen', 'ESG-Report Interesse'],
    },
    newsletter: {
      abonniert: true,
      oeffnungsrate: 65,
      letzteOeffnung: '2026-03-05',
      klicks: [
        { datum: '2026-03-05', betreff: 'Marktausblick Q1 2026', aktion: 'geoeffnet' },
        { datum: '2026-02-10', betreff: 'Nachfolge-Spezial: Steueroptimierte Uebergabe', aktion: 'geklickt' },
        { datum: '2026-01-08', betreff: 'ESG-Update: Art.9 Mandate im Vergleich', aktion: 'geklickt' },
      ],
      signale: ['Nachfolge-Themen geklickt', 'ESG-Interesse'],
    },
    events: {
      vergangene: [
        { name: 'Nachfolge-Roundtable', datum: '2026-02-20', typ: 'roundtable', status: 'teilgenommen' },
        { name: 'Jahresempfang 2025', datum: '2025-12-10', typ: 'dinner', status: 'teilgenommen' },
        { name: 'ESG-Webinar', datum: '2025-10-15', typ: 'webinar', status: 'nicht teilgenommen' },
      ],
      empfohlene: [
        { name: 'Familienstiftung Praxistag', datum: '2026-04-15', match: 'hoch', grund: 'Elisabeth plant Stiftungsgruendung', aktion: 'einladen' },
        { name: 'Nachfolge-Kongress Frankfurt', datum: '2026-05-20', match: 'hoch', grund: 'Unternehmensnachfolge in 3-5 Jahren', aktion: 'einladen' },
        { name: 'ESG Art.9 Workshop', datum: '2026-04-08', match: 'mittel', grund: 'Portfolio-Upgrade geplant', aktion: 'vorschlagen' },
      ],
    },
    presse: [
      { datum: '2026-01-20', quelle: 'Handelsblatt', titel: 'Maschinenbau-Mittelstand: Nachfolgeproblematik verschaerft sich', signal: 'Nachfolge-Thema – Action noetig' },
      { datum: '2025-11-05', quelle: 'FAZ', titel: 'Von Trott Maschinenbau gewinnt Innovationspreis', signal: 'Positiv – Sichtbarkeit' },
    ],
    digitalScore: 42,
  },

  // ── W2: Familie Lindenberg ──
  VV00002: {
    linkedin: {
      url: 'linkedin.com/in/markus-lindenberg',
      profilUrl: 'linkedin.com/in/markus-lindenberg',
      aktivitaet: 'hoch',
      letzterPost: '2026-03-08',
      themen: ['SaaS', 'Startup', 'Venture Capital', 'Tech-Exits', 'Entrepreneurship'],
      kontakte: 2850,
      letzteAktivitaeten: [
        { typ: 'post', datum: '2026-03-08', inhalt: 'Beitrag: "Was ich nach meinem SaaS-Exit ueber Vermoegen gelernt habe"' },
        { typ: 'share', datum: '2026-02-28', inhalt: 'PE-Report 2026 geteilt mit Kommentar zu Healthcare-Investments' },
        { typ: 'like', datum: '2026-02-20', inhalt: 'Artikel "Angel Investing Lektionen" geliked' },
        { typ: 'post', datum: '2026-02-10', inhalt: 'Julia\'s Startup-Fortschritte: Series A Vorbereitung' },
      ],
      signale: ['Hohe Sichtbarkeit in VC-Community', 'PE/Healthcare Interesse', 'Exit-Vermoegen Thema aktiv'],
    },
    website: {
      besuche: [
        { datum: '2026-03-10', seite: '/pe-fund-basket', dauer: 360 },
        { datum: '2026-03-05', seite: '/marktbericht', dauer: 120 },
        { datum: '2026-02-28', seite: '/fairvalue-mandat', dauer: 480 },
        { datum: '2026-02-15', seite: '/pe-healthcare', dauer: 300 },
      ],
      letzterBesuch: '2026-03-10',
      besuche90Tage: 12,
      avgVerweildauer: '5:15 Min',
      topSeiten: [
        { seite: '/pe-fund-basket', besuche: 4 },
        { seite: '/fairvalue-mandat', besuche: 3 },
        { seite: '/pe-healthcare', besuche: 3 },
        { seite: '/marktbericht', besuche: 2 },
      ],
      signale: ['FairValue-Upgrade Interesse – Action noetig', 'PE-Seiten intensiv besucht'],
    },
    newsletter: {
      abonniert: true,
      oeffnungsrate: 82,
      letzteOeffnung: '2026-03-10',
      klicks: [
        { datum: '2026-03-10', betreff: 'PE Healthcare Fund II – Jetzt zeichnen', aktion: 'geklickt' },
        { datum: '2026-02-25', betreff: 'FairValue vs. SmartValue: Ihr Upgrade-Pfad', aktion: 'geklickt' },
        { datum: '2026-02-10', betreff: 'Marktausblick Q1 2026', aktion: 'geoeffnet' },
        { datum: '2026-01-15', betreff: 'Cash-Allokation: Warum jeder Monat zaehlt', aktion: 'geklickt' },
      ],
      signale: ['PE-Zeichnung geklickt – Top-Signal', 'Cash-Thema resoniert'],
    },
    events: {
      vergangene: [
        { name: 'Tech-Exits Roundtable', datum: '2026-01-22', typ: 'roundtable', status: 'teilgenommen' },
        { name: 'Jahresempfang 2025', datum: '2025-12-10', typ: 'dinner', status: 'teilgenommen' },
        { name: 'Angel Investing Webinar', datum: '2025-11-20', typ: 'webinar', status: 'teilgenommen' },
      ],
      empfohlene: [
        { name: 'PE Investor Day', datum: '2026-03-15', match: 'hoch', grund: 'PE-Allokation erhoehen geplant', aktion: 'einladen' },
        { name: 'FairValue Mandatsvorstellung', datum: '2026-04-10', match: 'hoch', grund: 'Upgrade bei Cash-Konsolidierung', aktion: 'einladen' },
        { name: 'NextGen Investing Webinar', datum: '2026-05-08', match: 'mittel', grund: 'Noah (18) beginnt Studium', aktion: 'vorschlagen' },
      ],
    },
    presse: [
      { datum: '2026-02-15', quelle: 'Gruenderszene', titel: 'Keller Ventures: Neuer SaaS-Fund aufgelegt', signal: 'Liquiditaet – weitere Exits moeglich' },
      { datum: '2025-09-30', quelle: 'Finance Forward', titel: 'SaaS-Exit 2024: Wie Gruender ihr Vermoegen anlegen', signal: 'Positiv – Engagement Sichtbarkeit' },
    ],
    digitalScore: 78,
  },

  // ── W3: Stiftung Weber ──
  VV00003: {
    linkedin: {
      url: null,
      profilUrl: null,
      aktivitaet: 'niedrig',
      letzterPost: '2025-03-20',
      themen: ['Bildungsfoerderung', 'Stiftungswesen', 'Nachhaltigkeit'],
      kontakte: 120,
      letzteAktivitaeten: [
        { typ: 'share', datum: '2025-03-20', inhalt: 'Stiftung Weber Jahresbericht 2024 geteilt' },
      ],
      signale: ['Geringe digitale Praesenz', 'Stiftungs-Netzwerk offline aktiver'],
    },
    website: {
      besuche: [
        { datum: '2026-01-20', seite: '/esg-report', dauer: 300 },
        { datum: '2025-10-10', seite: '/stiftungsmandat', dauer: 240 },
      ],
      letzterBesuch: '2026-01-20',
      besuche90Tage: 2,
      avgVerweildauer: '4:30 Min',
      topSeiten: [
        { seite: '/esg-report', besuche: 2 },
        { seite: '/stiftungsmandat', besuche: 1 },
      ],
      signale: ['ESG-Report gelesen – Art.9 Interesse'],
    },
    newsletter: {
      abonniert: true,
      oeffnungsrate: 45,
      letzteOeffnung: '2026-02-01',
      klicks: [
        { datum: '2026-02-01', betreff: 'ESG-Spezial: Art.9 fuer Stiftungen', aktion: 'geklickt' },
        { datum: '2025-12-15', betreff: 'Stiftungsmandat Jahresrueckblick', aktion: 'geoeffnet' },
      ],
      signale: ['ESG Art.9 Klick – Upgrade-Signal'],
    },
    events: {
      vergangene: [
        { name: 'Stiftungstag 2025', datum: '2025-11-15', typ: 'konferenz', status: 'teilgenommen' },
        { name: 'ESG-Webinar', datum: '2025-10-15', typ: 'webinar', status: 'teilgenommen' },
      ],
      empfohlene: [
        { name: 'Stiftungsrecht-Update 2026', datum: '2026-04-22', match: 'hoch', grund: 'Neue Stiftungsgesetzgebung relevant', aktion: 'einladen' },
        { name: 'ESG Art.9 Impact Workshop', datum: '2026-05-12', match: 'hoch', grund: 'Art.9 Upgrade geplant', aktion: 'einladen' },
      ],
    },
    presse: [
      { datum: '2025-12-05', quelle: 'Stiftung & Sponsoring', titel: 'Stiftung Weber: 15 Jahre Bildungsfoerderung in der Region', signal: 'Positiv – Sichtbarkeit' },
    ],
    digitalScore: 22,
  },

  // ── W4: Prof. Dr. Hartmann ──
  VV00004: {
    linkedin: {
      url: 'linkedin.com/in/prof-hartmann-kardiologie',
      profilUrl: 'linkedin.com/in/prof-hartmann-kardiologie',
      aktivitaet: 'mittel',
      letzterPost: '2026-01-28',
      themen: ['Kardiologie', 'Medizintechnik', 'Healthcare Innovation', 'Private Equity'],
      kontakte: 950,
      letzteAktivitaeten: [
        { typ: 'post', datum: '2026-01-28', inhalt: 'Kommentar zur neuen Herzinsuffizienz-Leitlinie' },
        { typ: 'share', datum: '2026-01-15', inhalt: 'Artikel geteilt: "PE in Healthcare – Chancen fuer Fachexperten"' },
        { typ: 'like', datum: '2025-12-20', inhalt: 'MedTech Innovation Report geliked' },
      ],
      signale: ['Healthcare PE Interesse – Engagement', 'Fachliche Sichtbarkeit hoch'],
    },
    website: {
      besuche: [
        { datum: '2026-03-05', seite: '/pe-healthcare-fund-ii', dauer: 540 },
        { datum: '2026-02-20', seite: '/marktbericht', dauer: 180 },
        { datum: '2026-01-28', seite: '/quartalsbericht', dauer: 360 },
      ],
      letzterBesuch: '2026-03-05',
      besuche90Tage: 7,
      avgVerweildauer: '6:00 Min',
      topSeiten: [
        { seite: '/pe-healthcare-fund-ii', besuche: 3 },
        { seite: '/quartalsbericht', besuche: 2 },
        { seite: '/marktbericht', besuche: 2 },
      ],
      signale: ['PE Healthcare Fund II intensiv angesehen – Top-Signal'],
    },
    newsletter: {
      abonniert: true,
      oeffnungsrate: 72,
      letzteOeffnung: '2026-03-08',
      klicks: [
        { datum: '2026-03-08', betreff: 'PE Healthcare Fund II – Exklusive Zeichnung', aktion: 'geklickt' },
        { datum: '2026-02-12', betreff: 'Marktausblick Q1 2026', aktion: 'geoeffnet' },
        { datum: '2026-01-20', betreff: 'Nachfolgeplanung fuer Praxisinhaber', aktion: 'geklickt' },
      ],
      signale: ['PE-Zeichnung geklickt', 'Praxisnachfolge Interesse'],
    },
    events: {
      vergangene: [
        { name: 'PE Healthcare Investor Call', datum: '2026-02-25', typ: 'webinar', status: 'teilgenommen' },
        { name: 'Jahresempfang 2025', datum: '2025-12-10', typ: 'dinner', status: 'teilgenommen' },
        { name: 'Medtech-Konferenz Muenchen', datum: '2025-10-08', typ: 'konferenz', status: 'teilgenommen' },
      ],
      empfohlene: [
        { name: 'PE Healthcare Fund II Zeichnung', datum: '2026-04-01', match: 'hoch', grund: 'Fachexpertise + Website-Aktivitaet', aktion: 'einladen' },
        { name: 'Praxisnachfolge Roundtable', datum: '2026-05-15', match: 'hoch', grund: 'Praxisverkauf in 5-8 Jahren', aktion: 'einladen' },
        { name: 'NextGen Mediziner Dinner', datum: '2026-06-10', match: 'mittel', grund: 'Jan (Assistenzarzt) als potenzieller Mandant', aktion: 'vorschlagen' },
      ],
    },
    presse: [
      { datum: '2026-02-10', quelle: 'Aerztezeitung', titel: 'Neue Leitlinie Herzinsuffizienz: Prof. Hartmann im Expertengremium', signal: 'Positiv – fachliche Sichtbarkeit' },
      { datum: '2025-11-20', quelle: 'Manager Magazin', titel: 'Healthcare PE: Warum Aerzte die besten Investoren sind', signal: 'PE-Engagement – Action noetig' },
    ],
    digitalScore: 58,
  },

  // ── W5: Tim Keller ──
  VV00005: {
    linkedin: {
      url: 'linkedin.com/in/timkeller-tech',
      profilUrl: 'linkedin.com/in/timkeller-tech',
      aktivitaet: 'sehr_hoch',
      letzterPost: '2026-03-12',
      themen: ['Deep Tech', 'AI/ML', 'Climate Tech', 'Web3', 'Impact Investing', 'Startup Ecosystem'],
      kontakte: 4200,
      letzteAktivitaeten: [
        { typ: 'post', datum: '2026-03-12', inhalt: 'Thread: "Warum ich mein Krypto-Portfolio jetzt professionell managen lasse"' },
        { typ: 'share', datum: '2026-03-08', inhalt: 'Climate Tech Award Ankuendigung geteilt' },
        { typ: 'post', datum: '2026-03-01', inhalt: 'Beitrag: "Series A Fundraising – was ich beim zweiten Mal anders mache"' },
        { typ: 'like', datum: '2026-02-25', inhalt: 'Impact Investing Report 2026 geliked' },
        { typ: 'share', datum: '2026-02-18', inhalt: 'AI/ML Whitepaper mit eigenem Kommentar geteilt' },
      ],
      signale: ['Super aktiv – Thought Leader', 'Krypto-Integration Thema offen', 'Series A bald – Liquiditaet erwartet'],
    },
    website: {
      besuche: [
        { datum: '2026-03-12', seite: '/impact-investing', dauer: 420 },
        { datum: '2026-03-10', seite: '/krypto-reporting', dauer: 300 },
        { datum: '2026-03-08', seite: '/marktbericht', dauer: 90 },
        { datum: '2026-03-05', seite: '/smartvalue-mandat', dauer: 240 },
        { datum: '2026-03-01', seite: '/pe-fund-basket', dauer: 360 },
        { datum: '2026-02-25', seite: '/blog/ai-investieren', dauer: 480 },
      ],
      letzterBesuch: '2026-03-12',
      besuche90Tage: 24,
      avgVerweildauer: '5:30 Min',
      topSeiten: [
        { seite: '/krypto-reporting', besuche: 6 },
        { seite: '/impact-investing', besuche: 5 },
        { seite: '/pe-fund-basket', besuche: 4 },
        { seite: '/smartvalue-mandat', besuche: 3 },
      ],
      signale: ['Krypto-Reporting Top-Interesse', 'Impact Investing aktiv recherchiert', 'SmartValue-Seite besucht – Aktualisierung noetig'],
    },
    newsletter: {
      abonniert: true,
      oeffnungsrate: 95,
      letzteOeffnung: '2026-03-12',
      klicks: [
        { datum: '2026-03-12', betreff: 'Krypto x VV: Integration jetzt moeglich', aktion: 'geklickt' },
        { datum: '2026-03-05', betreff: 'Impact Investing Spezial', aktion: 'geklickt' },
        { datum: '2026-02-20', betreff: 'AI & Investing: Was Algorithmen koennen', aktion: 'geklickt' },
        { datum: '2026-02-08', betreff: 'PE Fund Basket – neue Opportunitaet', aktion: 'geklickt' },
        { datum: '2026-01-25', betreff: 'Marktausblick Q1 2026', aktion: 'geklickt' },
      ],
      signale: ['Super-Engager – 95% Oeffnungsrate', 'Alle relevanten Links geklickt'],
    },
    events: {
      vergangene: [
        { name: 'AI & Investing Webinar', datum: '2026-03-05', typ: 'webinar', status: 'teilgenommen' },
        { name: 'NextGen Networking Dinner', datum: '2026-02-18', typ: 'dinner', status: 'teilgenommen' },
        { name: 'Tech-Exits Roundtable', datum: '2026-01-22', typ: 'roundtable', status: 'teilgenommen' },
        { name: 'Impact Investing Konferenz', datum: '2025-11-10', typ: 'konferenz', status: 'teilgenommen' },
        { name: 'Crypto Tax Webinar', datum: '2025-10-05', typ: 'webinar', status: 'teilgenommen' },
      ],
      empfohlene: [
        { name: 'Krypto-Strukturierung Workshop', datum: '2026-04-05', match: 'hoch', grund: 'WpHG-Erneuerung + Krypto-Integration', aktion: 'einladen' },
        { name: 'NextGen Impact Dinner', datum: '2026-04-22', match: 'hoch', grund: 'Thought Leader im Impact-Bereich', aktion: 'einladen' },
        { name: 'Series A Exit-Planung', datum: '2026-05-10', match: 'hoch', grund: 'Naechster Exit erwartet – Mandatsupgrade', aktion: 'einladen' },
        { name: 'Climate Tech Investor Day', datum: '2026-06-15', match: 'mittel', grund: 'Climate Tech Award Gewinner', aktion: 'vorschlagen' },
      ],
    },
    presse: [
      { datum: '2026-03-01', quelle: 'TechCrunch (DE)', titel: 'Keller-Startup gewinnt Climate Tech Award', signal: 'Top-Sichtbarkeit – Engagement-Chance' },
      { datum: '2026-01-15', quelle: 'Gruenderszene', titel: 'Gen-Z Gruender: Zwischen Exit-Millionen und Impact Investing', signal: 'Positiv – Sichtbarkeit' },
      { datum: '2025-09-20', quelle: 'Finance Forward', titel: 'Krypto und klassische Vermoegensverwaltung: Geht das zusammen?', signal: 'Krypto-Thema – Aktualisierung noetig' },
    ],
    digitalScore: 92,
  },
};


// ─── 5. VV_LEADS ── Berater-level leads pipeline ───────────────────────────

export const VV_LEADS = [
  {
    id: 'L001',
    name: 'Charlotte von Trott',
    quelle: 'NextGen',
    typ: 'neukunde',
    status: 'kontaktiert',
    potentialAuM: 800000,
    wahrscheinlichkeit: 60,
    naechsterSchritt: 'Erstgespraech vereinbaren – SmartValue Mandat vorstellen',
    notizen: 'Tochter von Dr. von Trott (VV00001). Anwaeltin in Frankfurt, geschaetztes Eigenvermoegen 800k. Vater hat Empfehlung ausgesprochen.',
    datum: '2026-02-15',
    referenzMandant: 'VV00001',
  },
  {
    id: 'L002',
    name: 'Friedrich von Trott',
    quelle: 'NextGen',
    typ: 'neukunde',
    status: 'identifiziert',
    potentialAuM: 250000,
    wahrscheinlichkeit: 40,
    naechsterSchritt: 'Ueber Vater ansprechen bei naechstem Quartalstermin',
    notizen: 'Sohn von Dr. von Trott (VV00001). Ingenieur im Familienunternehmen, potenzielle Firmennachfolge. Noch kein direkter Kontakt.',
    datum: '2026-01-20',
    referenzMandant: 'VV00001',
  },
  {
    id: 'L003',
    name: 'Dr. Katharina Bauer',
    quelle: 'Empfehlung',
    typ: 'neukunde',
    status: 'termin',
    potentialAuM: 3500000,
    wahrscheinlichkeit: 70,
    naechsterSchritt: 'Erstgespraech am 20.03.2026 – Mandatsvorstellung FairValue',
    notizen: 'Notaerin, Immobilienverkaeufe 2025 (3,5M netto). Empfehlung durch Prof. Hartmann (VV00004). Termin steht.',
    datum: '2026-03-05',
    referenzMandant: 'VV00004',
  },
  {
    id: 'L004',
    name: 'Lindenberg Cash-Konsolidierung',
    quelle: 'Liquiditaet',
    typ: 'bestandskunde',
    status: 'angebot',
    potentialAuM: 5500000,
    wahrscheinlichkeit: 80,
    naechsterSchritt: '3-Phasen-Investitionsplan finalisieren und unterschreiben',
    notizen: 'Familie Lindenberg (VV00002). 5,5M Cash bei Commerzbank. 3-Phasen-Plan erstellt: 2M sofort, 2M Q3, 1,5M Q4. Mandant grundsaetzlich einverstanden.',
    datum: '2026-03-05',
    referenzMandant: 'VV00002',
  },
  {
    id: 'L005',
    name: 'Stiftung Merian',
    quelle: 'Event',
    typ: 'neukunde',
    status: 'kontaktiert',
    potentialAuM: 4200000,
    wahrscheinlichkeit: 35,
    naechsterSchritt: 'Informationspaket Stiftungsmandat zusenden',
    notizen: 'Kulturstiftung, aktuell bei DWS. Kontakt auf dem Stiftungstag 2025. Interesse an ESG-konformem Stiftungsmandat.',
    datum: '2025-11-15',
  },
  {
    id: 'L006',
    name: 'Jan Hartmann',
    quelle: 'NextGen',
    typ: 'neukunde',
    status: 'identifiziert',
    potentialAuM: 50000,
    wahrscheinlichkeit: 50,
    naechsterSchritt: 'Prof. Hartmann bei naechstem Termin auf Jan ansprechen',
    notizen: 'Sohn von Prof. Hartmann (VV00004). Assistenzarzt, hohes Einkommenspotenzial. Langfristig interessanter Mandant (Praxisgruendung absehbar).',
    datum: '2026-02-25',
    referenzMandant: 'VV00004',
  },
  {
    id: 'L007',
    name: 'Dipl.-Ing. Stefan Mueller',
    quelle: 'Presse',
    typ: 'neukunde',
    status: 'kontaktiert',
    potentialAuM: 6000000,
    wahrscheinlichkeit: 25,
    naechsterSchritt: 'Folgetermin nach Erst-Telefonat vereinbaren',
    notizen: 'Verkauf Ingenieursbuero (IKB-Artikel). 6M Netto-Erloes. Erstgespraech per Telefon gefuehrt, grundsaetzliches Interesse an FairValue.',
    datum: '2026-02-10',
  },
  {
    id: 'L008',
    name: 'Hartmann PE Healthcare Erhoehung',
    quelle: 'Upgrade',
    typ: 'bestandskunde',
    status: 'angebot',
    potentialAuM: 300000,
    wahrscheinlichkeit: 75,
    naechsterSchritt: 'PE Healthcare Fund II Zeichnungsunterlagen vorbereiten',
    notizen: 'Prof. Hartmann (VV00004) moechte PE Healthcare Allokation von 200k auf 500k erhoehen. Fund II Unterlagen angefordert.',
    datum: '2026-02-25',
    referenzMandant: 'VV00004',
  },
  {
    id: 'L009',
    name: 'Julia Lindenberg',
    quelle: 'Empfehlung',
    typ: 'neukunde',
    status: 'identifiziert',
    potentialAuM: 450000,
    wahrscheinlichkeit: 45,
    naechsterSchritt: 'Bei naechstem Lindenberg-Termin Thema Julia ansprechen',
    notizen: 'Ehefrau von Markus Lindenberg (VV00002). CTO eigenes Startup, geschaetztes Eigenvermoegen 450k. Eigenes Mandat sinnvoll.',
    datum: '2026-03-05',
    referenzMandant: 'VV00002',
  },
  {
    id: 'L010',
    name: 'Keller Ventures GmbH',
    quelle: 'Digital',
    typ: 'neukunde',
    status: 'kontaktiert',
    potentialAuM: 2000000,
    wahrscheinlichkeit: 20,
    naechsterSchritt: 'LinkedIn-Kontakt intensivieren, Treffen auf naechster Tech-Konferenz',
    notizen: 'VC-Firma, Kontakt ueber Tim Keller (VV00005). Partner hat mehrfach unsere Website besucht. Potenzial fuer institutionelles Mandat.',
    datum: '2026-03-01',
    referenzMandant: 'VV00005',
  },
  {
    id: 'L011',
    name: 'Stiftung Weber Sparkassen-Konsolidierung',
    quelle: 'Fremdbank',
    typ: 'bestandskunde',
    status: 'identifiziert',
    potentialAuM: 500000,
    wahrscheinlichkeit: 65,
    naechsterSchritt: 'Faelligkeit 2027 vormerken, Konsolidierungsgespraech Q4/2026',
    notizen: 'Stiftung Weber (VV00003) hat 500k Festgeld bei Sparkasse (2% bis 2027). Bei Faelligkeit ins Spezialmandat ueberfuehren.',
    datum: '2026-02-28',
    referenzMandant: 'VV00003',
  },
  {
    id: 'L012',
    name: 'Dr. Lisa Schreiber',
    quelle: 'Event',
    typ: 'neukunde',
    status: 'gewonnen',
    potentialAuM: 1800000,
    wahrscheinlichkeit: 100,
    naechsterSchritt: 'Onboarding abschliessen – Mandat startet 01.04.2026',
    notizen: 'Zahnaerztin mit Praxisverkauf. Kontakt ueber Jahresempfang 2025. SmartValue Mandat (1,8M) unterschrieben.',
    datum: '2026-03-10',
  },
];


// ─── 6. VV_REVENUE ── Berater-level revenue data ───────────────────────────

export const VV_REVENUE = {
  monthlyRevenue: [
    { name: 'Jan', managementFee: 22800, performanceFee: 0, sonstiges: 1200 },
    { name: 'Feb', managementFee: 23100, performanceFee: 0, sonstiges: 950 },
    { name: 'Mär', managementFee: 23400, performanceFee: 3200, sonstiges: 1100 },
    { name: 'Apr', managementFee: 23200, performanceFee: 0, sonstiges: 800 },
    { name: 'Mai', managementFee: 23500, performanceFee: 0, sonstiges: 1500 },
    { name: 'Jun', managementFee: 23800, performanceFee: 4100, sonstiges: 1050 },
    { name: 'Jul', managementFee: 24100, performanceFee: 0, sonstiges: 900 },
    { name: 'Aug', managementFee: 23600, performanceFee: 0, sonstiges: 1300 },
    { name: 'Sep', managementFee: 24200, performanceFee: 5500, sonstiges: 1100 },
    { name: 'Okt', managementFee: 24500, performanceFee: 0, sonstiges: 950 },
    { name: 'Nov', managementFee: 24800, performanceFee: 0, sonstiges: 1200 },
    { name: 'Dez', managementFee: 25200, performanceFee: 8200, sonstiges: 2800 },
  ],

  mandantenRevenue: [
    { name: 'Dr. von Trott', aum: 12500000, fee: 0.85, ertrag: 106250 },
    { name: 'Fam. Lindenberg', aum: 2100000, fee: 1.05, ertrag: 22050 },
    { name: 'Stiftung Weber', aum: 8300000, fee: 0.75, ertrag: 62250 },
    { name: 'Prof. Hartmann', aum: 6800000, fee: 0.85, ertrag: 57800 },
    { name: 'Tim Keller', aum: 450000, fee: 1.05, ertrag: 4725 },
  ],

  feeStruktur: [
    { typ: 'Management Fee', volumen: 232100, anteil: 79.5 },
    { typ: 'Performance Fee', volumen: 21000, anteil: 7.2 },
    { typ: 'Custody Fee', volumen: 15075, anteil: 5.2 },
    { typ: 'Transaktionskosten', volumen: 12350, anteil: 4.2 },
    { typ: 'Sonstiges', volumen: 11400, anteil: 3.9 },
  ],

  forecast: {
    q1: 78700,
    q2: 85200,
    q3: 92500,
    q4: 105600,
  },
};
