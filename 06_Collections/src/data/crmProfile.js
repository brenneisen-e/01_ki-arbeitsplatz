// Vollprofil (CRM-Akte) eines Falls.
// 1:1 uebernommen aus partials/banken/crm-profile-view.html.
// Die Legacy-Akte war fest auf Mueller GmbH verdrahtet; hier bleibt sie die
// ausgebaute Referenzakte, alle anderen Faelle bekommen ihre Werte aus
// customerDetails.js.

export const CRM_NAV = [
  { id: 'overview', label: 'Übersicht' },
  { id: 'ki-analyse', label: 'KI-Dossier' },
  { id: 'stammdaten', label: 'Stammdaten' },
  { id: 'konten', label: 'Konten & Verträge' },
  { id: 'transaktionen', label: 'Transaktionen & Forderungen' },
  { id: 'finanzen', label: 'GuV / Haushalt' },
  { id: 'openfinance', label: 'Open Finance' },
  { id: 'kommunikation', label: 'Kommunikation' },
  { id: 'dokumente', label: 'Dokumente' },
  { id: 'workflow', label: 'Workflow' },
];

// Inhalte, die textlich an die Referenzakte gebunden sind (Mahnschreiben,
// Mahnstrecke, KI-Begruendung). Alle Zahlen des Profils kommen dagegen aus
// customerDetails.js, damit Kacheln, Konten und Transaktionen zusammenpassen.
export const CRM_REFERENZ = {


  scoring: [
    { label: 'Willingness', wert: 25, color: '#ef4444' },
    { label: 'Ability', wert: 60, color: '#f59e0b' },
    { label: 'Recovery', wert: 35, color: '#ef4444' },
  ],
  empfehlungBadge: 'KI-Empfehlung: Inkasso-Eskalation',




  // Zahlungsverlauf der letzten zwoelf Monate (Soll / Ist / Ruecklaeufer).



  dokumente: [
    {
      id: 'mahnung3',
      titel: '3. Mahnung – Letzte außergerichtliche Aufforderung',
      meta: '01.12.2025 • Ausgehend • PDF', status: 'Versendet',
      absender: ['Braunschweiger Sparkasse', 'Inkasso-Abteilung', 'Bankstraße 123', '38100 Braunschweig'],
      empfaenger: ['Mueller GmbH', 'Herr Max Mueller', 'Industriestraße 45', '38112 Braunschweig'],
      ort: 'Braunschweig, 01.12.2025',
      betreff: '3. Mahnung – Letzte außergerichtliche Aufforderung',
      absatz: [
        'Sehr geehrter Herr Mueller,',
        'trotz unserer bisherigen Mahnungen und Zahlungsaufforderungen ist Ihre Verbindlichkeit in Höhe von € 125.000,00 weiterhin nicht beglichen.',
        'Wir fordern Sie hiermit letztmalig auf, den offenen Betrag bis zum 15.12.2025 auf das unten genannte Konto zu überweisen.',
        'Sollte bis zu diesem Datum kein Zahlungseingang erfolgen, sehen wir uns gezwungen, ohne weitere Ankündigung gerichtliche Schritte einzuleiten und die Forderung an ein Inkassounternehmen zu übergeben.',
        'Mit freundlichen Grüßen',
        'Ihre Braunschweiger Sparkasse',
      ],
    },
    {
      id: 'mahnung2',
      titel: '2. Mahnung – Zahlungserinnerung',
      meta: '01.11.2025 • Ausgehend • PDF', status: 'Versendet',
      absender: ['Braunschweiger Sparkasse', 'Forderungsmanagement', 'Bankstraße 123', '38100 Braunschweig'],
      empfaenger: ['Mueller GmbH', 'Herr Max Mueller', 'Industriestraße 45', '38112 Braunschweig'],
      ort: 'Braunschweig, 01.11.2025',
      betreff: '2. Mahnung – Zahlungserinnerung',
      absatz: [
        'Sehr geehrter Herr Mueller,',
        'leider haben wir bis heute keinen Zahlungseingang zu unserer 1. Mahnung vom 01.10.2025 feststellen können.',
        'Ihre offene Forderung beträgt weiterhin € 125.000,00.',
        'Bitte überweisen Sie den Betrag bis zum 15.11.2025.',
        'Mit freundlichen Grüßen',
        'Ihre Braunschweiger Sparkasse',
      ],
    },
    {
      id: 'mahnung1',
      titel: '1. Mahnung – Zahlungserinnerung',
      meta: '01.10.2025 • Ausgehend • PDF', status: 'Versendet',
      absender: ['Braunschweiger Sparkasse', 'Kundenservice', 'Bankstraße 123', '38100 Braunschweig'],
      empfaenger: ['Mueller GmbH', 'Herr Max Mueller', 'Industriestraße 45', '38112 Braunschweig'],
      ort: 'Braunschweig, 01.10.2025',
      betreff: '1. Mahnung – Freundliche Zahlungserinnerung',
      absatz: [
        'Sehr geehrter Herr Mueller,',
        'bei der Durchsicht unserer Konten haben wir festgestellt, dass folgende Zahlung noch aussteht:',
        'Offener Betrag: € 125.000,00',
        'Bitte überweisen Sie den Betrag bis zum 15.10.2025.',
        'Mit freundlichen Grüßen',
        'Ihre Braunschweiger Sparkasse',
      ],
    },
    {
      id: 'vertrag',
      titel: 'Kreditvertrag Nr. BK-2024-001234',
      meta: '15.01.2024 • Vertrag • PDF', status: 'Archiviert',
      vertrag: [
        { label: 'Vertragsnummer', wert: 'BK-2024-001234' },
        { label: 'Kreditart', wert: 'Betriebsmittelkredit' },
        { label: 'Kreditsumme', wert: '€ 200.000,00' },
        { label: 'Zinssatz', wert: '4,75 % p. a.' },
        { label: 'Laufzeit', wert: '60 Monate' },
        { label: 'Monatliche Rate', wert: '€ 3.750,00' },
        { label: 'Vertragsbeginn', wert: '01.02.2024' },
      ],
    },
  ],

  workflow: [
    { stufe: 'Zahlungserinnerung', datum: '15.09.2025', status: 'erledigt' },
    { stufe: '1. Mahnung', datum: '01.10.2025', status: 'erledigt' },
    { stufe: '2. Mahnung', datum: '01.11.2025', status: 'erledigt' },
    { stufe: '3. Mahnung', datum: '01.12.2025', status: 'erledigt' },
    { stufe: 'Inkasso-Übergabe', datum: 'geplant 20.12.2025', status: 'aktiv' },
    { stufe: 'Gerichtliches Mahnverfahren', datum: 'offen', status: 'offen' },
    { stufe: 'Zwangsvollstreckung', datum: 'offen', status: 'offen' },
  ],

  kiAnalyse: {
    kernproblem: 'Gewerbekunde mit Liquiditätsengpässen seit Q3 2025. Gastronomie-Branche mit saisonalen Schwankungen. Mehrfache Lastschriftrückgaben trotz grundsätzlicher Zahlungsfähigkeit.',
    letzteAktivitaeten: [
      '3. Mahnung versendet (01.12.2025)',
      'Teilzahlung €500 eingegangen (15.11.2025)',
      'E-Mail mit Ratenzahlungsantrag erhalten',
      '2 Telefonversuche nicht erreicht',
    ],
    schritte: [
      { wann: 'Sofort', was: 'Telefonischen Kontakt herstellen' },
      { wann: 'Diese Woche', was: 'Ratenzahlungsvereinbarung prüfen' },
      { wann: 'Bei Ablehnung', was: 'Mahnverfahren einleiten' },
    ],
    faktoren: [
      { text: '3 Lastschriftrückgaben', punkte: '-25 Pkt', negativ: true },
      { text: 'Branchenrisiko: Gastronomie', punkte: '-15 Pkt', negativ: true },
      { text: 'Langjährige Kundenbeziehung', punkte: '+10 Pkt', negativ: false },
      { text: 'Teilzahlung im November', punkte: '+5 Pkt', negativ: false },
    ],
    empfehlung: {
      titel: 'Verstärkte Inkasso-Strategie',
      konfidenz: 87,
      schritte: [
        'Sofortige Eskalation der Inkasso-Maßnahmen',
        'Gerichtliches Mahnverfahren einleiten (14 Tage Frist)',
        'Parallele Verhandlung über Vergleich anbieten',
      ],
    },
  },
};
