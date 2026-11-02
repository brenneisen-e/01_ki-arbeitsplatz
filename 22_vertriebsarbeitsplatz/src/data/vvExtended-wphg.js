// ─── VV_WPHG ── WpHG Compliance data per Mandant ────────────────────────

export const VV_WPHG = {
  // ── W1: Tim Keller ──
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
        { datum: '2026-03-01', typ: 'Quartalsprüfung', ergebnis: 'bestanden', details: 'Alle Positionen innerhalb der Risikoklasse. Aktienquote konform.' },
        { datum: '2025-12-15', typ: 'Jahresprüfung', ergebnis: 'bestanden', details: 'Gesamtportfolio entspricht Risikoprofil und Anlagezielen.' },
        { datum: '2025-09-20', typ: 'Ad-hoc Prüfung', ergebnis: 'bestanden', details: 'ESG-Filter-Anpassung geprüft und konform.' },
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
      { typ: 'Geeignetheitsprüfung', datum: '2026-03-01', status: 'aktuell' },
      { typ: 'Ex-Ante Kosteninformation', datum: '2026-01-10', status: 'aktuell' },
      { typ: 'Ex-Post Kostenausweis', datum: '2026-02-28', status: 'aktuell' },
      { typ: 'Vermögensverwaltungsvertrag', datum: '2018-01-15', status: 'aktuell' },
    ],
  },

  // ── W2: Familie Lindenberg ──
  VV00002: {
    fragebogen: {
      letztesUpdate: '2025-08-20',
      naechstesPruefung: '2026-08-20',
      status: 'aktuell',
      risikoklasse: 4,
      anlageziel: 'Langfristiges Vermögenswachstum',
      anlagehorizont: '10+ Jahre',
      erfahrung: { aktien: 'hoch', anleihen: 'mittel', alternative: 'hoch', derivate: 'mittel' },
    },
    geeignetheit: {
      status: 'konform',
      pruefungen: [
        { datum: '2026-02-15', typ: 'Quartalsprüfung', ergebnis: 'bestanden', details: 'Tech-Übergewichtung innerhalb der Risikoklasse 4 toleriert.' },
        { datum: '2025-11-10', typ: 'Quartalsprüfung', ergebnis: 'bestanden', details: 'PE-Allokation geprüft und konform.' },
        { datum: '2025-08-20', typ: 'Jahresprüfung', ergebnis: 'bestanden', details: 'Neuer Fragebogen nach SaaS-Exit, Risikoklasse 4 bestätigt.' },
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
      { typ: 'Geeignetheitsprüfung', datum: '2026-02-15', status: 'aktuell' },
      { typ: 'Ex-Ante Kosteninformation', datum: '2026-01-10', status: 'aktuell' },
      { typ: 'Ex-Post Kostenausweis', datum: '2026-02-28', status: 'aktuell' },
      { typ: 'Vermögensverwaltungsvertrag', datum: '2024-06-01', status: 'aktuell' },
    ],
  },

  // ── W3: Stiftung Weber ──
  VV00003: {
    fragebogen: {
      letztesUpdate: '2025-10-01',
      naechstesPruefung: '2026-04-01',
      status: 'aktuell',
      risikoklasse: 2,
      anlageziel: 'Realer Kapitalerhalt mit laufender Ausschüttung',
      anlagehorizont: 'unbefristet',
      erfahrung: { aktien: 'mittel', anleihen: 'hoch', alternative: 'gering', derivate: 'gering' },
    },
    geeignetheit: {
      status: 'konform',
      pruefungen: [
        { datum: '2026-02-28', typ: 'Quartalsprüfung', ergebnis: 'bestanden', details: 'Kapitalerhalt und Ausschüttungsziel (3%) erfüllt.' },
        { datum: '2025-12-01', typ: 'Stiftungsrechtliche Prüfung', ergebnis: 'bestanden', details: 'Anlage konform mit Stiftungssatzung und Anlagerichtlinien.' },
        { datum: '2025-10-01', typ: 'Jahresprüfung', ergebnis: 'bestanden', details: 'Stiftungsrat hat Anlagerichtlinien bestätigt.' },
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
      { typ: 'Geeignetheitsprüfung', datum: '2026-02-28', status: 'aktuell' },
      { typ: 'Stiftungsanlagerichtlinien', datum: '2025-10-01', status: 'aktuell' },
      { typ: 'Ex-Ante Kosteninformation', datum: '2026-01-10', status: 'aktuell' },
      { typ: 'Ex-Post Kostenausweis', datum: '2026-02-28', status: 'aktuell' },
      { typ: 'Vermögensverwaltungsvertrag', datum: '2008-01-15', status: 'aktuell' },
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
        { datum: '2026-03-01', typ: 'Quartalsprüfung', ergebnis: 'bestanden', details: 'Healthcare-Schwerpunkt (22%) konform mit Anlageziel.' },
        { datum: '2025-12-10', typ: 'Quartalsprüfung', ergebnis: 'bestanden', details: 'PE Healthcare Allokation geprüft und konform.' },
        { datum: '2025-09-10', typ: 'Jahresprüfung', ergebnis: 'bestanden', details: 'Anlageziel und Risikoklasse bestätigt.' },
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
      { typ: 'Geeignetheitsprüfung', datum: '2026-03-01', status: 'aktuell' },
      { typ: 'Ex-Ante Kosteninformation', datum: '2026-01-10', status: 'aktuell' },
      { typ: 'Ex-Post Kostenausweis', datum: '2026-02-28', status: 'aktuell' },
      { typ: 'Vermögensverwaltungsvertrag', datum: '2019-01-10', status: 'aktuell' },
    ],
  },

  // ── W5: Maxim Meydarn – ABGELAUFEN (Demo) ──
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
        { datum: '2026-03-10', typ: 'Quartalsprüfung', ergebnis: 'warnung', details: 'WpHG-Fragebogen abgelaufen seit 15.06.2025. Erneuerung dringend erforderlich.' },
        { datum: '2025-12-01', typ: 'Quartalsprüfung', ergebnis: 'warnung', details: 'Fragebogen abgelaufen. Mandant wurde per E-Mail kontaktiert.' },
        { datum: '2025-06-15', typ: 'Jahresprüfung', ergebnis: 'fällig', details: 'Prüfung fällig, Mandant hat Termin nicht wahrgenommen.' },
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
      { typ: 'Geeignetheitsprüfung', datum: '2026-03-10', status: 'aktuell' },
      { typ: 'Ex-Ante Kosteninformation', datum: '2026-01-10', status: 'aktuell' },
      { typ: 'Ex-Post Kostenausweis', datum: '2026-02-28', status: 'aktuell' },
      { typ: 'Vermögensverwaltungsvertrag', datum: '2025-01-05', status: 'aktuell' },
    ],
  },
};
