// Portfolio-Kennzahlen, Segmentmatrix und Dashboard-Widgets
// 1:1 uebernommen aus partials/banken/section-segmentierung.html.

export const INSTITUT = {
  name: 'Braunschweiger Sparkasse',
  bereich: 'Forderungsmanagement',
  supportMail: 'support@braunschweiger-sparkasse.de',
  fachMail: 'collections@braunschweiger-sparkasse.de',
  gradient: 'linear-gradient(135deg, #7a0d12 0%, #b3131b 45%, #d9232c 100%)',
  primary: '#b3131b',
  primaryLight: '#d9232c',
};

// Stand der Demo-Daten. Bewusst fix, damit Kennzahlen und Texte zusammenpassen.
export const DATENSTAND = '2025-12-15T14:32:00';

export const PORTFOLIO_KPIS = [
  {
    id: 'aktive-faelle',
    label: 'Aktive Fälle',
    value: '10.234',
    icon: 'users',
    tone: 'blue',
    change: { text: '+127 zur Vorwoche', direction: 'up', sentiment: 'negative' },
    spark: [27, 22, 24, 17, 20, 12, 14],
    popupTitle: 'Aktive Fälle – Zeitverlauf',
  },
  {
    id: 'offene-forderung',
    label: 'Offene Forderung',
    value: '€ 47,8 Mio',
    icon: 'euro',
    tone: 'orange',
    change: { text: '+€ 1,2 Mio', direction: 'up', sentiment: 'negative' },
    spark: [22, 20, 24, 21, 17, 19, 16],
    popupTitle: 'Offene Forderung – Zeitverlauf',
  },
  {
    id: 'recovery-rate',
    label: 'Recovery Rate',
    value: '68,4%',
    icon: 'trending-up',
    tone: 'green',
    highlight: true,
    change: { text: '+2,3% vs. Vormonat', direction: 'up', sentiment: 'positive' },
    spark: [26, 24, 22, 20, 18, 14, 10],
    popupTitle: 'Recovery Rate – Zeitverlauf',
  },
  {
    id: 'dpd',
    label: 'Ø Verzugstage',
    value: '47',
    icon: 'clock',
    tone: 'purple',
    change: { text: '-3 Tage', direction: 'down', sentiment: 'positive' },
    donut: true,
    popupTitle: 'Verzugstage – Verteilung',
  },
  {
    // Wert und Zusatz werden aus AUFGABEN berechnet, damit Kachel, Header und
    // Aufgabenliste immer dieselben Zahlen zeigen.
    id: 'aufgaben',
    label: 'Meine Aufgaben',
    icon: 'check-square',
    tone: 'red',
    action: { label: 'Jetzt bearbeiten', target: 'aufgaben' },
    spark: [20, 17, 22, 14, 18, 16, 12],
    popupTitle: 'Meine Aufgaben – Zeitverlauf',
  },
];

// Verteilung hinter dem Donut der KPI-Kachel "Ø Verzugstage".
export const DPD_BUCKETS = [
  { id: '0-30', label: '0-30', anteil: 49, faelle: 5010, color: '#22c55e' },
  { id: '31-90', label: '31-90', anteil: 28, faelle: 2880, color: '#f59e0b' },
  { id: '90+', label: '>90', anteil: 23, faelle: 2344, color: '#ef4444' },
];

export const INLINE_STATS = [
  { id: 'neue-faelle', label: 'Neue Fälle', value: '47', tone: 'blue' },
  { id: 'zahlungseingaenge', label: 'Zahlungseingänge', value: '31', tone: 'green' },
  { id: 'zahlungszusagen', label: 'Zahlungszusagen', value: '18', tone: 'purple' },
];

export const NEUE_FAELLE = {
  count: 47,
  items: [
    { id: 'K-2024-8847', name: 'Müller, Hans', betrag: '€180 überfällig', typ: 'Ratenkredit (Ges. €4.230)', zeit: '18 DPD' },
    { id: 'K-2024-8846', name: 'Schmidt GmbH', betrag: '€650 überfällig', typ: 'Kontokorrent (Ges. €12.890)', zeit: '18 DPD' },
    { id: 'K-2024-8845', name: 'Weber, Anna', betrag: '€120 überfällig', typ: 'Kreditkarte (Ges. €2.150)', zeit: '18 DPD' },
  ],
};

export const ZAHLUNGSEINGAENGE = {
  count: 31,
  items: [
    { id: 'K-2024-7234', name: 'Braun, Thomas', betrag: '€1.890 gezahlt', typ: 'Vollständige Tilgung', zeit: 'heute, 09:14' },
    { id: 'K-2024-6891', name: 'Klein KG', betrag: '€3.400 gezahlt', typ: 'Ratenvereinbarung', zeit: 'heute, 08:45' },
    { id: 'K-2024-6234', name: 'Fischer, Maria', betrag: '€780 gezahlt', typ: 'Teilzahlung', zeit: 'gestern, 16:30' },
  ],
};

// Willingness/Ability-Matrix. position steuert die Lage im 2x2-Raster.
export const SEGMENTE = [
  {
    id: 'eskalation',
    title: 'Eskalation',
    subtitle: 'Hohe Fähigkeit • Geringe Bereitschaft',
    count: 1890,
    countLabel: '1.890',
    volumen: '€ 12,4 Mio',
    schnitt: 'Ø € 6.560',
    strategie: 'Inkasso, Mahnbescheid, Vollstreckung',
    color: '#f97316',
    bg: '#fff7ed',
    border: '#fed7aa',
    position: 'top-left',
    tableKey: 'escalate',
    // Streubereich fuer die Punktwolke: [xMin, xMax, yMin, yMax], Punkte
    scatter: { x: [5, 45], y: [55, 95], punkte: 35 },
  },
  {
    id: 'prioritaet',
    title: 'Priorität',
    subtitle: 'Hohe Fähigkeit • Hohe Bereitschaft',
    count: 2340,
    countLabel: '2.340',
    volumen: '€ 8,2 Mio',
    schnitt: 'Ø € 3.504',
    strategie: 'Schnelle Vereinbarung, flexible Raten',
    color: '#22c55e',
    bg: '#f0fdf4',
    border: '#bbf7d0',
    position: 'top-right',
    tableKey: 'priority',
    scatter: { x: [55, 95], y: [55, 95], punkte: 45 },
  },
  {
    id: 'abwicklung',
    title: 'Abwicklung',
    subtitle: 'Geringe Fähigkeit • Geringe Bereitschaft',
    count: 2884,
    countLabel: '2.884',
    volumen: '€ 18,7 Mio',
    schnitt: 'Ø € 6.484',
    strategie: 'Verkauf, Abschreibung, Insolvenz',
    color: '#ef4444',
    bg: '#fef2f2',
    border: '#fecaca',
    position: 'bottom-left',
    tableKey: 'writeoff',
    scatter: { x: [5, 45], y: [5, 45], punkte: 55 },
  },
  {
    id: 'restrukturierung',
    title: 'Restrukturierung',
    subtitle: 'Geringe Fähigkeit • Hohe Bereitschaft',
    count: 3120,
    countLabel: '3.120',
    volumen: '€ 8,5 Mio',
    schnitt: 'Ø € 2.724',
    strategie: 'Stundung, Ratenpläne, Beratung',
    color: '#eab308',
    bg: '#fefce8',
    border: '#fef08a',
    position: 'bottom-right',
    tableKey: 'restructure',
    scatter: { x: [55, 95], y: [5, 45], punkte: 60 },
  },
];

export const MATRIX_SUMME = {
  faelle: '10.234 Fälle',
  volumen: '€ 47,8 Mio',
  schnitt: 'Ø € 4.672',
};

export const EHEMALIGE = {
  count: 847,
  volumen: '€4,2 Mio',
  recovery: '72%',
  items: [
    { id: 'K-2024-6891', name: 'Klein KG', info: 'Betriebsmittel • vor 5 Tagen', betrag: '€8.400' },
    { id: 'K-2024-5982', name: 'Meier, Stefan', info: 'Dispo • vor 1 Woche', betrag: '€2.340' },
    { id: 'K-2024-5876', name: 'Schneider Logistik', info: 'Kontokorrent • vor 1 Woche', betrag: '€15.200' },
    { id: 'K-2024-5801', name: 'Weber Transport', info: 'Ratenkredit • vor 2 Wochen', betrag: '€22.800' },
    { id: 'K-2024-5755', name: 'Fischer, Anna', info: 'Kreditkarte • vor 2 Wochen', betrag: '€1.890' },
  ],
};

// Zeitreihen fuer die Chart-Popups der KPI-Kacheln.
export const KPI_VERLAEUFE = {
  'aktive-faelle': {
    einheit: 'Fälle',
    color: '#3b82f6',
    daten: [
      { monat: 'Jul', wert: 9420 }, { monat: 'Aug', wert: 9610 }, { monat: 'Sep', wert: 9585 },
      { monat: 'Okt', wert: 9840 }, { monat: 'Nov', wert: 9975 }, { monat: 'Dez', wert: 10234 },
    ],
  },
  'offene-forderung': {
    einheit: 'Mio EUR',
    color: '#f97316',
    daten: [
      { monat: 'Jul', wert: 44.1 }, { monat: 'Aug', wert: 44.9 }, { monat: 'Sep', wert: 45.4 },
      { monat: 'Okt', wert: 46.0 }, { monat: 'Nov', wert: 46.6 }, { monat: 'Dez', wert: 47.8 },
    ],
  },
  'recovery-rate': {
    einheit: '%',
    color: '#22c55e',
    daten: [
      { monat: 'Jul', wert: 61.2 }, { monat: 'Aug', wert: 62.8 }, { monat: 'Sep', wert: 64.1 },
      { monat: 'Okt', wert: 65.5 }, { monat: 'Nov', wert: 66.1 }, { monat: 'Dez', wert: 68.4 },
    ],
  },
  aufgaben: {
    einheit: 'offene Aufgaben',
    color: '#ef4444',
    daten: [
      { monat: 'Jul', wert: 18 }, { monat: 'Aug', wert: 25 }, { monat: 'Sep', wert: 17 },
      { monat: 'Okt', wert: 29 }, { monat: 'Nov', wert: 21 }, { monat: 'Dez', wert: 23 },
    ],
  },
};

// Portfolio-Entwicklung (Legacy: initPortfolioChart, 12/6/3 Monate).
export const PORTFOLIO_VERLAUF = [
  { monat: 'Jan 25', bestand: 9480 },
  { monat: 'Feb 25', bestand: 9395 },
  { monat: 'Mär 25', bestand: 9520 },
  { monat: 'Apr 25', bestand: 9610 },
  { monat: 'Mai 25', bestand: 9475 },
  { monat: 'Jun 25', bestand: 9530 },
  { monat: 'Jul 25', bestand: 9420 },
  { monat: 'Aug 25', bestand: 9610 },
  { monat: 'Sep 25', bestand: 9585 },
  { monat: 'Okt 25', bestand: 9840 },
  { monat: 'Nov 25', bestand: 9975 },
  { monat: 'Dez 25', bestand: 10234 },
];
