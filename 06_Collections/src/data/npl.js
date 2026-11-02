// NPL Dashboard (Stage 3) und Stage-2-Analyse.
// 1:1 uebernommen aus partials/banken/section-npl.html und section-stage2.html.

export const NPL_INTRO = {
  titel: 'NPL Dashboard – Stage 3 Kredite',
  text: 'Übersicht aller notleidenden Kredite (Non-Performing Loans) mit einer Ausfallwahrscheinlichkeit über 90 %. Diese Fälle befinden sich im fortgeschrittenen Mahnverfahren oder in der Abwicklung.',
};

export const NPL_KPIS = [
  {
    id: 'volumen', icon: 'banknote', tone: 'neutral',
    value: '€ 15,1 Mio', label: 'Gesamtvolumen Stage 3',
    change: '+€ 1,2 Mio vs. Vormonat', sentiment: 'negative',
  },
  {
    id: 'faelle', icon: 'users', tone: 'warning',
    value: '2.344', label: 'Anzahl NPL-Fälle',
    change: '+127 vs. Vormonat', sentiment: 'negative',
  },
  {
    id: 'recovery', icon: 'trending-up', tone: 'success',
    value: '34 %', label: 'Recovery Rate',
    change: '+2,3 % vs. Vormonat', sentiment: 'positive',
  },
  {
    id: 'dpd', icon: 'clock', tone: 'neutral',
    value: '142 Tage', label: 'Ø Days Past Due',
    change: '-3 Tage vs. Vormonat', sentiment: 'neutral',
  },
];

// Entwicklung des NPL-Bestands (Legacy-Canvas nplTrendChart).
export const NPL_TREND = [
  { monat: 'Jul', volumen: 12.4, faelle: 1980 },
  { monat: 'Aug', volumen: 12.9, faelle: 2040 },
  { monat: 'Sep', volumen: 13.4, faelle: 2105 },
  { monat: 'Okt', volumen: 13.9, faelle: 2168 },
  { monat: 'Nov', volumen: 14.3, faelle: 2217 },
  { monat: 'Dez', volumen: 15.1, faelle: 2344 },
];

// Verteilung nach Produkttyp (Legacy-Canvas nplProductChart).
export const NPL_PRODUKTE = [
  { produkt: 'Dispositionskredit', volumen: 4.6, anteil: 30, color: '#ef4444' },
  { produkt: 'Ratenkredit', volumen: 3.8, anteil: 25, color: '#f97316' },
  { produkt: 'Kontokorrentkredit', volumen: 2.7, anteil: 18, color: '#eab308' },
  { produkt: 'Kreditkarte', volumen: 2.1, anteil: 14, color: '#8b5cf6' },
  { produkt: 'Betriebsmittelkredit', volumen: 1.9, anteil: 13, color: '#3b82f6' },
];

export const NPL_MASSNAHMEN = [
  {
    id: 'sale', count: 847, titel: 'Portfolio-Verkauf prüfen',
    text: 'Forderungen über 180 DPD mit Recovery-Erwartung unter 20 %',
    button: 'Prüfen', highlight: false,
  },
  {
    id: 'writeoff', count: 234, titel: 'Abschreibung empfohlen',
    text: 'Uneinbringliche Forderungen nach Inkasso-Erschöpfung',
    button: 'Prüfen', highlight: false,
  },
  {
    id: 'restructure', count: 156, titel: 'Restrukturierung möglich',
    text: 'Kunden mit positiver Zahlungshistorie vor Default',
    button: 'Prüfen', highlight: true,
  },
];

// Ergebnis der Massnahmen-Pruefung (Legacy: reviewForSale / reviewForWriteOff / reviewForRestructure).
export const NPL_MASSNAHMEN_ERGEBNIS = {
  sale: {
    titel: 'Portfolio-Verkauf – Prüfergebnis',
    zeilen: [
      '847 Fälle erfüllen die Verkaufskriterien (>180 DPD, Recovery-Erwartung <20 %).',
      'Nominalvolumen: € 6,3 Mio – erwarteter Verkaufserlös: € 0,9 Mio (14,3 %).',
      'Empfehlung: Bündelung in ein Paket, Ansprache von drei Forderungskäufern.',
    ],
  },
  writeoff: {
    titel: 'Abschreibung – Prüfergebnis',
    zeilen: [
      '234 Fälle nach Inkasso-Erschöpfung ohne weitere Vollstreckungsaussicht.',
      'Abschreibungsvolumen: € 1,4 Mio – bereits zu 82 % risikovorgesorgt.',
      'Empfehlung: Sammelvorlage an die Marktfolge Aktiv zur Freigabe.',
    ],
  },
  restructure: {
    titel: 'Restrukturierung – Prüfergebnis',
    zeilen: [
      '156 Fälle mit positiver Zahlungshistorie vor dem Default.',
      'Volumen: € 2,1 Mio – bei Stundung Recovery-Erwartung 61 % statt 22 %.',
      'Empfehlung: Ratenplan über 24 Monate, Zinsstundung für sechs Monate.',
    ],
  },
};

// ===== Stage 2 =====

export const STAGE2_INTRO = {
  titel: 'Stage 2 Analyse – Auswirkung auf GuV',
  text: 'Übersicht der Kredite mit signifikant erhöhtem Ausfallrisiko (Stage 2 nach IFRS 9). Diese Kredite erfordern eine erhöhte Risikovorsorge und belasten die Gewinn- und Verlustrechnung.',
};

export const STAGE2_KPIS = [
  { label: 'Stage 2 Volumen', value: '€ 32,1 Mio', negativ: false },
  { label: 'Risikovorsorge (ECL)', value: '€ 4,8 Mio', negativ: true },
  { label: 'GuV-Belastung Q4', value: '€ 1,2 Mio', negativ: true },
  { label: 'Coverage Ratio', value: '15 %', negativ: false },
];

export const STAGE2_MIGRATION = {
  ausStage1: 423,
  bestand: 7890,
  nachStage3: 312,
  netto: '+111 Fälle (+€ 2,3 Mio)',
};

// ECL-Entwicklung (Legacy-Canvas eclTrendChart).
export const ECL_TREND = [
  { monat: 'Jul', ecl: 3.9 },
  { monat: 'Aug', ecl: 4.1 },
  { monat: 'Sep', ecl: 4.2 },
  { monat: 'Okt', ecl: 4.4 },
  { monat: 'Nov', ecl: 4.6 },
  { monat: 'Dez', ecl: 4.8 },
];

export const RISIKOTREIBER = [
  { name: 'Arbeitslosigkeit', wert: '€ 8,2 Mio', anteil: 85 },
  { name: 'Branchenrisiko (Gastronomie)', wert: '€ 5,9 Mio', anteil: 62 },
  { name: 'Scheidung/Trennung', wert: '€ 4,6 Mio', anteil: 48 },
  { name: 'Überschuldung', wert: '€ 3,4 Mio', anteil: 35 },
];
