/**
 * kontoanlageDemo.js
 *
 * Demo-Datengrundlage für die Strecke "Kreditvertrag -> Kreditkontoneuanlage".
 * Ein hochgeladener Kreditvertrag (z. B. die Beispiel-Verträge im Ordner
 * kreditanalyse/konsortialkredit/) wird von der (simulierten) KI ausgewertet
 * und auf die Felder des Blatts "Allgemeine Angaben" der Vorlage
 * "Template Kreditkontoneuanlage.xlsm" gemappt.
 *
 * Die Feldbezeichnungen und die Reihenfolge orientieren sich 1:1 an den
 * Zeilen B2..B52 des Originalblatts "Allgemeine Angaben".
 *
 * Hinweis: Reine Demo-Daten. Werte, die nicht aus dem Vertrag selbst
 * hervorgehen (Kundennummer, Segmentnummer, geschäftsabschließende Stelle …),
 * sind als Vorbelegung aus dem Kundenstamm gekennzeichnet (konfidenz:
 * "manuell"), damit klar ist, dass sie fachlich zu bestätigen sind.
 */

// Lesbare Bezeichnung je Feld-Key (entspricht Spalte B des Excel-Blatts).
export const FIELD_LABELS = {
  kreditnehmer: 'Kreditnehmer',
  kundennummer: 'Kundennummer',
  kreditbetrag: 'Kreditbetrag',
  waehrung: 'Währung',
  verwendungszweck: 'Verwendungszweck',

  geschaeftsart: 'Geschäftsart',
  kreditart: 'Kreditart',
  abschlussstelle: 'Geschäftsabschließende Stelle',
  grundNeuanlage: 'Grund der Neuanlage',

  zusageAm: 'Zusage extern erteilt am',
  vertragAm: 'Vertrag abgeschlossen am',
  endfaelligkeit: 'Endfälligkeit',

  sppi: 'SPPI-Kriterium',
  haltekategorieIfrs9: 'Haltekategorie IFRS 9',
  segmentnummer: 'Segmentnummer',
  vergabeart: 'Vergabeart KR',
  meldepflichtAwv: 'Meldepflicht AWV',

  helabaAnteil: 'Helaba Anteil in % am Konsortialkredit',
  artKonsortial: 'Art des Konsortialkredites (AnaCredit)',
  idKonsortial: 'ID-Konsortialkredit (AnaCredit)',
  konsortialfuehrer: 'Konsortialführer / Administrative Agent',

  festzins: 'Zuschlag / Festzins in %',
  referenzzins: 'Referenzzins / Basiszins in %',
  waehrungKonditionen: 'Währung für diese Konditionen',
  zinsmethode: 'Zinsberechnungsmethode',
  zinsperiode: 'Zinsperiode / Intervall',
  bereitstellungsprovision: 'Bereitstellungsprovision',
  arrangementFee: 'Arrangement Fee',
  verzugszins: 'Verzugszinssatz',
};

// Gruppierung der Felder in fachliche Abschnitte (für UI und Excel-Ausgabe).
export const ALLGEMEINE_ANGABEN_SECTIONS = [
  {
    id: 'stammdaten',
    title: 'Stammdaten',
    fields: ['kreditnehmer', 'kundennummer', 'kreditbetrag', 'waehrung', 'verwendungszweck'],
  },
  {
    id: 'geschaeft',
    title: 'Geschäfts- und Kreditart',
    fields: ['geschaeftsart', 'kreditart', 'abschlussstelle', 'grundNeuanlage'],
  },
  {
    id: 'termine',
    title: 'Termine',
    fields: ['zusageAm', 'vertragAm', 'endfaelligkeit'],
  },
  {
    id: 'klassifizierung',
    title: 'Klassifizierung / Meldewesen',
    fields: ['sppi', 'haltekategorieIfrs9', 'segmentnummer', 'vergabeart', 'meldepflichtAwv'],
  },
  {
    id: 'konsortial',
    title: 'Konsortialkredit',
    fields: ['helabaAnteil', 'artKonsortial', 'idKonsortial', 'konsortialfuehrer'],
  },
  {
    id: 'konditionen',
    title: 'Konditionen',
    fields: [
      'festzins', 'referenzzins', 'waehrungKonditionen', 'zinsmethode',
      'zinsperiode', 'bereitstellungsprovision', 'arrangementFee', 'verzugszins',
    ],
  },
];

// Konfidenz-Stufen -> Anzeige (Label + Tailwind-Klassen für Badges).
export const KONFIDENZ_META = {
  hoch: { label: 'Aus Vertrag', cls: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  mittel: { label: 'Abgeleitet', cls: 'bg-amber-50 text-amber-700 border-amber-200' },
  manuell: { label: 'Kundenstamm / prüfen', cls: 'bg-slate-100 text-slate-600 border-slate-200' },
};

const f = (wert, konfidenz, quelle) => ({ wert, konfidenz, quelle });

// ── Demo-Datensatz 1: Bilateraler Kreditvertrag (MainRiver Industrials) ──────
const BILATERAL = {
  id: 'bilateral',
  matches: ['bilateral', 'mainriver', 'main river', 'muster'],
  vertragstyp: 'Bilateraler Kreditvertrag (LMA-orientiert)',
  dateiHinweis: 'Helaba_Bilateraler_Kreditvertrag_Muster.docx',
  kreditnehmer: 'MainRiver Industrials GmbH',
  konfidenzGesamt: 0.94,
  felder: {
    kreditnehmer: f('MainRiver Industrials GmbH', 'hoch', 'Rubrum: „… und MainRiver Industrials GmbH … – nachfolgend „Kreditnehmer""'),
    kundennummer: f('0042100815', 'manuell', 'Nicht im Vertrag enthalten – Vorbelegung aus Kundenstamm'),
    kreditbetrag: f('25.000.000,00', 'hoch', '§ 2: „… Kreditfazilität in Höhe von EUR 25.000.000 …"'),
    waehrung: f('EUR – Euro', 'hoch', 'Wesentliche wirtschaftliche Konditionen: „Kreditsumme: EUR 25.000.000"'),
    verwendungszweck: f('Allgemeine Unternehmenszwecke und strategische Investitionen', 'hoch', '§ 2: „… Finanzierung allgemeiner Unternehmenszwecke sowie strategischer Investitionen …"'),

    geschaeftsart: f('Endfälliges Darlehen (Term Loan)', 'mittel', 'Abgeleitet aus § 5: „… am 30.06.2031 vollständig zurückzuzahlen. Eine ratierliche Tilgung findet nicht statt."'),
    kreditart: f('Investitionskredit / Term Loan', 'mittel', 'Abgeleitet aus Verwendungszweck (§ 2)'),
    abschlussstelle: f('214090 Asset Backed Finance', 'manuell', 'Vorbelegung – im Listenfeld bestätigen'),
    grundNeuanlage: f('10 Neugeschäft', 'hoch', 'Neuabschluss – kein Bestandsvertrag'),

    zusageAm: f('21.05.2026', 'manuell', 'Nicht datiert im Mustervertrag – Vorbelegung'),
    vertragAm: f('21.05.2026', 'mittel', 'Unterschriftsdatum offen („Frankfurt am Main, den ____") – Vorbelegung'),
    endfaelligkeit: f('30.06.2031', 'hoch', '§ 1: „„Endfälligkeitstag" bezeichnet den 30.06.2031."'),

    sppi: f('01 Erfüllt', 'mittel', 'Plain-Vanilla-Festzinsdarlehen ohne strukturierte Komponenten – SPPI erfüllt'),
    haltekategorieIfrs9: f('AC – Amortised Cost', 'mittel', 'Halten zur Vereinnahmung der Zahlungsströme (Geschäftsmodell „Hold")'),
    segmentnummer: f('102270 Asset Backed Finance', 'manuell', 'Vorbelegung – im Listenfeld bestätigen'),
    vergabeart: f('0 = Kredit aus eigenen Mitteln', 'mittel', 'Bilaterale Vergabe aus eigenen Mitteln'),
    meldepflichtAwv: f('2 Kontenführung – Meldepflicht erfüllt', 'manuell', 'Vorbelegung'),

    helabaAnteil: f('100 % (bilateral – kein Konsortium)', 'hoch', 'Bilateraler Kredit, alleiniger Kreditgeber: Helaba'),
    artKonsortial: f('entfällt – bilateraler Kredit', 'hoch', 'Kein Konsortialkredit'),
    idKonsortial: f('entfällt', 'hoch', 'Kein Konsortialkredit'),
    konsortialfuehrer: f('entfällt – Landesbank Hessen-Thüringen (Helaba) als alleiniger Kreditgeber', 'hoch', 'Rubrum: „… Landesbank Hessen-Thüringen Girozentrale (Helaba) … – nachfolgend „Kreditgeber""'),

    festzins: f('4,35 % p.a. (Festzins)', 'hoch', '§ 4: „… festen Zinssatz von 4,35 % p.a. verzinst."'),
    referenzzins: f('entfällt (Festzinsdarlehen)', 'hoch', 'Festzins, kein Referenzzins'),
    waehrungKonditionen: f('EUR', 'hoch', 'Kreditsumme in EUR'),
    zinsmethode: f('Actual/360', 'hoch', '§ 4: „Die Zinsberechnung erfolgt auf Basis Actual/360."'),
    zinsperiode: f('Quartalsweise (zum letzten Geschäftstag des Kalenderquartals)', 'hoch', '§ 4: „… Zinszahlungen erfolgen quartalsweise …"'),
    bereitstellungsprovision: f('0,50 % p.a. auf nicht ausgenutzte Kreditbeträge (ab Tag 30)', 'hoch', '§ 4: „… Bereitstellungsprovision in Höhe von 0,50 % p.a. …"'),
    arrangementFee: f('1,00 % flat der Kreditsumme (zahlbar am Auszahlungstag)', 'hoch', '§ 4: „… einmalige Arrangement Fee in Höhe von 1,00 % flat …"'),
    verzugszins: f('Festzins + 5,00 Prozentpunkte p.a.', 'hoch', '§ 4: „Bei Zahlungsverzug erhöht sich der anwendbare Zinssatz um 5,00 Prozentpunkte p.a."'),
  },
};

// ── Demo-Datensatz 2: Syndizierter Kreditvertrag (Vantiv, LLC) ───────────────
const SYNDIZIERT = {
  id: 'syndiziert',
  matches: ['syndizier', 'vantiv', 'konsortial', 'helaba ai', 'ai cases'],
  vertragstyp: 'Syndizierter Konsortialkreditvertrag (LMA / US-Markt)',
  dateiHinweis: 'Beispiel_Syndizierter Kreditvertrag_Helaba AI Cases.docx',
  kreditnehmer: 'Vantiv, LLC',
  konfidenzGesamt: 0.88,
  felder: {
    kreditnehmer: f('Vantiv, LLC (Delaware limited liability company)', 'hoch', '„… VANTIV, LLC, a Delaware limited liability company, as Borrower"'),
    kundennummer: f('0058830012', 'manuell', 'Nicht im Vertrag enthalten – Vorbelegung aus Kundenstamm'),
    kreditbetrag: f('Mehrteilige Fazilität (Term Loan + Revolving Credit) – Einzelbeträge je Tranche lt. Schedule 1', 'mittel', '„Schedule 1 — Term Loan Commitments and Revolving Credit Commitments as of the Closing Date"'),
    waehrung: f('USD – US-Dollar', 'hoch', 'Eurodollar-/Base-Rate-Darlehen (US-Dollar-Fazilität)'),
    verwendungszweck: f('Refinanzierung bestehender Verbindlichkeiten / allgemeine Unternehmenszwecke', 'mittel', 'Abgeleitet aus Facility-Struktur (Term + Revolving)'),

    geschaeftsart: f('Roll-over-/Konsortialkredit', 'mittel', 'Abgeleitet aus Revolving Credit Commitments (Art. 2.2)'),
    kreditart: f('Konsortialkredit (syndiziert)', 'hoch', '„VARIOUS LENDERS FROM TIME TO TIME PARTY HERETO"'),
    abschlussstelle: f('214210 Corporate Finance International', 'manuell', 'Vorbelegung – im Listenfeld bestätigen'),
    grundNeuanlage: f('10 Neugeschäft', 'hoch', 'Neuabschluss'),

    zusageAm: f('15.05.2013', 'mittel', 'Abgeleitet aus „DATED AS OF MAY 15, 2013"'),
    vertragAm: f('15.05.2013', 'hoch', '„DATED AS OF MAY 15, 2013"'),
    endfaelligkeit: f('Final Maturity Date lt. Section 2.7 (je Tranche)', 'mittel', 'Section 2.7 „Maturity of Loans" / Definition „Final Maturity Date"'),

    sppi: f('01 Erfüllt', 'mittel', 'Variabel verzinst (LIBOR + Marge), marktübliche Konditionen – SPPI grds. erfüllt'),
    haltekategorieIfrs9: f('AC – Amortised Cost', 'mittel', 'Geschäftsmodell „Hold" für den Helaba-Anteil'),
    segmentnummer: f('102310 Corporate Finance International', 'manuell', 'Vorbelegung – im Listenfeld bestätigen'),
    vergabeart: f('1 = Kredit im Konsortium', 'hoch', 'Syndizierter Kredit'),
    meldepflichtAwv: f('1 Kreditgewährung an Gebietsfremde – meldepflichtig', 'mittel', 'US-Borrower (Gebietsfremder) – AWV-Meldepflicht prüfen'),

    helabaAnteil: f('7,50 %', 'manuell', 'Helaba als Konsorte – Beteiligungsquote aus Schedule 1 / interner Zusage'),
    artKonsortial: f('Offener Konsortialkredit (syndiziert, Administrative Agent: JPMorgan)', 'hoch', '„JPMORGAN CHASE BANK, N.A., as Administrative Agent and Collateral Agent"'),
    idKonsortial: f('KONS-2013-VANTIV-0515', 'manuell', 'Vorbelegung – AnaCredit-ID im Konsortialregister vergeben'),
    konsortialfuehrer: f('JPMorgan Chase Bank, N.A. (Administrative & Collateral Agent); Syndication Agent: Fifth Third Bank', 'hoch', '„… as Administrative Agent and Collateral Agent" / „FIFTH THIRD BANK, as Syndication Agent"'),

    festzins: f('Applicable Margin lt. Pricing-Grid (1,25 % – 2,00 % p.a., leverage-abhängig)', 'hoch', 'Definition „Applicable Margin" / Pricing-Grid: „Category 1 … 2.0% … Category … 1.25%"'),
    referenzzins: f('Adjusted LIBOR (Eurodollar Loans)', 'hoch', 'Definition „Adjusted LIBOR … for Eurodollar Loans"'),
    waehrungKonditionen: f('USD', 'hoch', 'US-Dollar-Fazilität'),
    zinsmethode: f('Actual/360 (Eurodollar)', 'mittel', 'Marktstandard für USD-Eurodollar-Tranchen'),
    zinsperiode: f('Je Interest Period (1/3/6 Monate, wählbar)', 'mittel', 'Eurodollar Interest Periods (Section 2.5)'),
    bereitstellungsprovision: f('Commitment Fee 0,375 % p.a. auf nicht gezogene Revolving-Beträge', 'hoch', 'Pricing-Grid: „… Commitment Fee … 0.375%"'),
    arrangementFee: f('Arranger-/Agency-Fees lt. separatem Fee Letter', 'mittel', 'Section 2.13 „Fees" / Joint Lead Arrangers'),
    verzugszins: f('Base Rate + 2,00 % zzgl. Applicable Margin (Default Rate)', 'hoch', '„… at a rate per annum equal to the sum of 2.00% plus the Applicable Margin plus the Base Rate …"'),
  },
};

export const DEMO_VERTRAEGE = [BILATERAL, SYNDIZIERT];

/**
 * Ordnet einen hochgeladenen Dateinamen einem Demo-Datensatz zu. Für die
 * Demostrecke reicht die Erkennung anhand des Dateinamens; greift keine
 * Heuristik, wird der bilaterale Vertrag als Standard zurückgegeben.
 */
export function detectVertrag(fileName = '') {
  const lower = fileName.toLowerCase();
  for (const v of DEMO_VERTRAEGE) {
    if (v.matches.some((m) => lower.includes(m))) return v;
  }
  return BILATERAL;
}
