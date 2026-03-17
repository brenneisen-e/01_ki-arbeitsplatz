// ─── VV_FAMILIE ── Family / Network data per Mandant ─────────────────────

export const VV_FAMILIE = {
  // ── W1: Tim Keller ──
  VV00001: {
    mitglieder: [
      { name: 'Tim Keller', rolle: 'mandant', alter: 62, beruf: 'Unternehmer Maschinenbau 3.Gen', mandant: true, aum: 12500000 },
      { name: 'Elisabeth Keller', rolle: 'ehepartner', alter: 59, beruf: 'Stiftungsvorstand (ehrenamtlich)', vermoegen: 850000 },
      { name: 'Charlotte Keller', rolle: 'kind', alter: 32, beruf: 'Anwaeltin, Partnerin Wirtschaftskanzlei (Frankfurt)', vermoegen: 800000 },
      { name: 'Friedrich Keller', rolle: 'kind', alter: 28, beruf: 'Ingenieur, im Familienunternehmen taetig', vermoegen: 250000 },
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
        'NextGen Charlotte – eigene Vermögensverwaltung aufbauen',
        'Familienstiftung Gruendung – Elisabeth als Initiatorin',
        'Steueroptimierte Vermögensübertragung an Kinder',
        'LV-Ablauf 2026 – Wiederanlage planen',
      ],
      zeitrahmen: '3-5 Jahre (Übergabe Unternehmen)',
      notizen: 'Tim plant Rückzug aus dem operativen Geschäft mit 65-67. Friedrich wird eingearbeitet, Charlotte hat kein Interesse am Unternehmen. Elisabeth möchte Familienstiftung für Bildungszwecke gründen (2M Stiftungskapital). Erbschaftssteuerliche Optimierung sollte frühzeitig geplant werden.',
    },
  },

  // ── W2: Familie Lindenberg ──
  VV00002: {
    mitglieder: [
      { name: 'Markus Lindenberg', rolle: 'mandant', alter: 51, beruf: 'SaaS-Unternehmer (Exit 2024, 8M netto)', mandant: true, aum: 2100000 },
      { name: 'Julia Lindenberg', rolle: 'ehepartner', alter: 48, beruf: 'CTO (eigenes Startup)', vermoegen: 450000 },
      { name: 'Noah Lindenberg', rolle: 'kind', alter: 18, beruf: 'Abiturient, Studienbeginn 2026' },
      { name: 'Ella Lindenberg', rolle: 'kind', alter: 15, beruf: 'Schülerin (Gymnasium)' },
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
        'Cash-Konsolidierung 5,5M (höchste Priorität)',
        'NextGen Noah – Studiendepot 100k',
        'Julias Startup – Liquiditätsbedarf beobachten',
        'Angel-Portfolio professionalisieren',
        'Langfristige Familienstruktur planen',
      ],
      zeitrahmen: '1-2 Jahre (Cash-Konsolidierung kurzfristig)',
      notizen: 'Markus hat durch den SaaS-Exit 2024 erhebliche liquide Mittel erhalten, die noch größtenteils unstrukturiert bei der Commerzbank liegen. Julia arbeitet an einem eigenen Startup (Seed-Phase). Noah beginnt 2026 mit dem Studium. Ella hat noch 3 Jahre Schule. Priorität: Cash strukturiert investieren, bevor Inflation den Wert auffrisst.',
    },
  },

  // ── W3: Stiftung Weber ──
  VV00003: {
    mitglieder: [
      { name: 'Stiftung Weber', rolle: 'stiftung', alter: 0, beruf: 'Bildungsstiftung (gegründet 2008)', mandant: true, aum: 8300000 },
      { name: 'Dr. Martin Weber', rolle: 'mandant', alter: 74, beruf: 'Stifter, ehem. Unternehmer' },
      { name: 'Claudia Weber', rolle: 'ehepartner', alter: 71, beruf: 'Stiftungsvorstand' },
      { name: 'Dr. Thomas Fischer', rolle: 'kind', alter: 0, beruf: 'Geschäftsfuehrer Stiftung, Vorstandsmitglied' },
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
        'Ausschüttungsoptimierung für Förderzwecke',
        'Sparkasse-Festgeld bei Fälligkeit konsolidieren',
        'Stiftungskapital langfristig erhalten (realer Kapitalerhalt)',
      ],
      zeitrahmen: 'Unbefristet (Stiftung auf Dauer angelegt)',
      notizen: 'Die Stiftung Weber fördert seit 2008 Bildungsprojekte in der Region. Jährliche Ausschüttung ca. 250.000 EUR für Förderzwecke. Der Stiftungsrat tagt halbjährlich. Dr. Weber (Stifter) zieht sich zunehmend zurück, Dr. Fischer übernimmt operativ. Ziel: realer Kapitalerhalt bei zuverlässiger Ausschüttung.',
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
        'NextGen Jan – eigene Vermögensverwaltung aufbauen',
        'Sophie – Studienfinanzierung und spätere Niederlassung',
        'PE Healthcare Fund II – Fachexpertise nutzen',
        'ING-Tagesgeld konsolidieren',
      ],
      zeitrahmen: '5-8 Jahre (Praxisverkauf)',
      notizen: 'Prof. Hartmann plant den Verkauf seiner Privatpraxis in 5-8 Jahren (dann 61-64). Sohn Jan (Assistenzarzt) könnte eventuell übernehmen, was aber noch offen ist. Sophie studiert Medizin und plant eigene kardiologische Praxis. Andrea führt eine eigene psychologische Praxis. Praxisverkaufserlöse (ca. 800k) sollen ins FairValue Mandat fließen.',
    },
  },

  // ── W5: Maxim Meydarn ──
  VV00005: {
    mitglieder: [
      { name: 'Maxim Meydarn', rolle: 'mandant', alter: 29, beruf: 'Tech-Gründer (Seed-Exit 500k)', mandant: true, aum: 450000 },
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
        'Nächster Exit vorbereiten – Upgrade auf FairValue',
        'Krypto-Bestand strukturieren und integrieren',
        'Angel-Portfolio professionell tracken',
        'Langfristigen Vermoegensaufbau starten',
      ],
      zeitrahmen: '2-3 Jahre (naechster Startup-Exit)',
      notizen: 'Tim ist als Tech-Gründer ein typischer NextGen-Mandant mit hohem Wachstumspotenzial. Aktuell kleines AuM (450k), aber bei erfolgreichem naechsten Exit (Series A Investment) könnte das Volumen auf 1,5-2M steigen. Krypto-Bestand (120k) und Angel-Investments (80k) sollten im Gesamtreporting integriert werden. WpHG-Fragebogen ist abgelaufen – Erneuerung dringend.',
    },
  },
};
