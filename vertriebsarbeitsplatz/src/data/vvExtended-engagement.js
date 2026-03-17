// ─── VV_ENGAGEMENT ── Digital engagement signals per Mandant ──────────────

export const VV_ENGAGEMENT = {
  // ── W1: Tim Keller ──
  VV00001: {
    linkedin: {
      url: 'linkedin.com/in/tim-keller',
      profilUrl: 'linkedin.com/in/tim-keller',
      aktivitaet: 'niedrig',
      letzterPost: '2025-06-10',
      themen: ['Maschinenbau', 'Industrie 4.0', 'Familienunternehmen'],
      kontakte: 480,
      letzteAktivitaeten: [
        { typ: 'share', datum: '2025-06-10', inhalt: 'Artikel geteilt: "Nachfolge im Mittelstand – Herausforderungen 2025"' },
        { typ: 'like', datum: '2025-05-22', inhalt: 'IHK-Beitrag zu Industrie 4.0 Förderung geliked' },
        { typ: 'profil_update', datum: '2025-04-15', inhalt: 'Profilbild aktualisiert' },
      ],
      signale: ['Nachfolge-Thema aktiv', 'ESG-Roadmap 2030 erwähnt', 'Sohn Friedrich als neuer COO'],
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
      signale: ['Regelmäßig Quartalsbericht gelesen', 'ESG-Report Interesse'],
    },
    newsletter: {
      abonniert: true,
      oeffnungsrate: 65,
      letzteOeffnung: '2026-03-05',
      klicks: [
        { datum: '2026-03-05', betreff: 'Marktausblick Q1 2026', aktion: 'geöffnet' },
        { datum: '2026-02-10', betreff: 'Nachfolge-Spezial: Steueroptimierte Übergabe', aktion: 'geklickt' },
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
      { datum: '2025-11-05', quelle: 'FAZ', titel: 'Keller Maschinenbau gewinnt Innovationspreis', signal: 'Positiv – Sichtbarkeit' },
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
        { typ: 'post', datum: '2026-03-08', inhalt: 'Beitrag: "Was ich nach meinem SaaS-Exit über Vermögen gelernt habe"' },
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
        { datum: '2026-02-10', betreff: 'Marktausblick Q1 2026', aktion: 'geöffnet' },
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
      { datum: '2026-02-15', quelle: 'Gründerszene', titel: 'Keller Ventures: Neuer SaaS-Fund aufgelegt', signal: 'Liquiditaet – weitere Exits moeglich' },
      { datum: '2025-09-30', quelle: 'Finance Forward', titel: 'SaaS-Exit 2024: Wie Gründer ihr Vermoegen anlegen', signal: 'Positiv – Engagement Sichtbarkeit' },
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
        { datum: '2026-02-01', betreff: 'ESG-Spezial: Art.9 für Stiftungen', aktion: 'geklickt' },
        { datum: '2025-12-15', betreff: 'Stiftungsmandat Jahresrückblick', aktion: 'geöffnet' },
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
        { typ: 'share', datum: '2026-01-15', inhalt: 'Artikel geteilt: "PE in Healthcare – Chancen für Fachexperten"' },
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
        { datum: '2026-02-12', betreff: 'Marktausblick Q1 2026', aktion: 'geöffnet' },
        { datum: '2026-01-20', betreff: 'Nachfolgeplanung für Praxisinhaber', aktion: 'geklickt' },
      ],
      signale: ['PE-Zeichnung geklickt', 'Praxisnachfolge Interesse'],
    },
    events: {
      vergangene: [
        { name: 'PE Healthcare Investor Call', datum: '2026-02-25', typ: 'webinar', status: 'teilgenommen' },
        { name: 'Jahresempfang 2025', datum: '2025-12-10', typ: 'dinner', status: 'teilgenommen' },
        { name: 'Medtech-Konferenz München', datum: '2025-10-08', typ: 'konferenz', status: 'teilgenommen' },
      ],
      empfohlene: [
        { name: 'PE Healthcare Fund II Zeichnung', datum: '2026-04-01', match: 'hoch', grund: 'Fachexpertise + Website-Aktivität', aktion: 'einladen' },
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

  // ── W5: Maxim Meydarn ──
  VV00005: {
    linkedin: {
      url: 'linkedin.com/in/maxim-meydarn',
      profilUrl: 'linkedin.com/in/maxim-meydarn',
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
      signale: ['Super-Engager – 95% Öffnungsrate', 'Alle relevanten Links geklickt'],
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
        { name: 'Series A Exit-Planung', datum: '2026-05-10', match: 'hoch', grund: 'Nächster Exit erwartet – Mandatsupgrade', aktion: 'einladen' },
        { name: 'Climate Tech Investor Day', datum: '2026-06-15', match: 'mittel', grund: 'Climate Tech Award Gewinner', aktion: 'vorschlagen' },
      ],
    },
    presse: [
      { datum: '2026-03-01', quelle: 'TechCrunch (DE)', titel: 'Keller-Startup gewinnt Climate Tech Award', signal: 'Top-Sichtbarkeit – Engagement-Chance' },
      { datum: '2026-01-15', quelle: 'Gründerszene', titel: 'Gen-Z Gründer: Zwischen Exit-Millionen und Impact Investing', signal: 'Positiv – Sichtbarkeit' },
      { datum: '2025-09-20', quelle: 'Finance Forward', titel: 'Krypto und klassische Vermoegensverwaltung: Geht das zusammen?', signal: 'Krypto-Thema – Aktualisierung noetig' },
    ],
    digitalScore: 92,
  },
};
