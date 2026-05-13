// =============================================================================
// Generiert realistische Excel-Workbooks als Smart-ICS-Demo-Eingangsdateien.
// Diese Dokumente sollen NICHT 1:1 dem späteren Smart-ICS-Workflow entsprechen —
// stattdessen sind sie typische Eingangs-Artefakte aus Banken/Versicherungen,
// die parsed werden müssen.
// =============================================================================

// xlsx wird dynamisch geladen, um den initialen Bundle klein zu halten.

async function getXLSX() {
  const mod = await import('xlsx');
  return mod.default || mod;
}

function setColWidths(sheet, widths) {
  sheet['!cols'] = widths.map(w => ({ wch: w }));
}

function mergeCell(sheet, ref) {
  if (!sheet['!merges']) sheet['!merges'] = [];
  sheet['!merges'].push(ref);
}

function downloadWorkbook(XLSX, wb, filename) {
  XLSX.writeFile(wb, filename, { bookType: 'xlsx' });
}

// =============================================================================
// 1) Kompetenzmatrix Kreditvergabe Firmenkunden
// =============================================================================
export async function generateExcelKompetenzmatrix() {
  const XLSX = await getXLSX();
  const wb = XLSX.utils.book_new();

  // Sheet 1: Deckblatt
  const cover = XLSX.utils.aoa_to_sheet([
    ['KOMPETENZMATRIX KREDITGESCHÄFT — FIRMENKUNDEN'],
    [],
    ['Dokument-ID', 'KO-KFK-2026'],
    ['Version', '6.1'],
    ['Stand', new Date().toLocaleDateString('de-DE')],
    ['Eigentümer', 'Bereichsleitung Marktfolge Aktiv'],
    ['Methodische Aufsicht', 'Operational Risk & Compliance (2nd LoD)'],
    ['Verbindlichkeit', 'Konzernweit verbindlich; Stellvertretung gemäß BMS-Berechtigungsmodul'],
    [],
    ['Zweck:'],
    ['Diese Matrix legt die Bewilligungsebene für gewerbliche Kreditengagements ab 250 TEUR fest.'],
    ['Maßgebliche Größen sind das konsolidierte Bruttoengagement der Kreditnehmereinheit (KNE),'],
    ['die interne Rating-Klasse sowie der Blankoanteil (Nettoengagement).'],
    [],
    ['Hinweise zur Anwendung:'],
    ['1. Eskalation zur nächsthöheren Ebene automatisch bei Rating-Übergang in den nicht-investmentgrade-Bereich.'],
    ['2. Vier-Augen-Genehmigung ist Mindestanforderung; Sondersitzungen Komitee 1 (Mi.), Komitee 2 (Mo.).'],
    ['3. Organkredite gemäß § 15 KWG immer Aufsichtsratsbeschluss.'],
    ['4. Nicht-zulässige Verwendungszwecke siehe ESG-Ausschlussliste (Anlage 3 zum Strategie-Rahmen).'],
    [],
    ['Bezugsdokumente:'],
    ['• PL-FK-2026-014 (Prozessleitfaden Kreditvergabe Firmenkunden)'],
    ['• MaRisk AT 4.3, BTO 1.2 inkl. Tz. 1–8'],
    ['• KWG § 13 (Großkredite), § 15 (Organkredite), § 18 (Offenlegung)'],
    ['• Verordnung (EU) Nr. 575/2013 (CRR), Art. 178 (Definition Default)'],
  ]);
  cover['A1'].s = { font: { bold: true, sz: 14 } };
  setColWidths(cover, [38, 70]);
  mergeCell(cover, { s: { r: 0, c: 0 }, e: { r: 0, c: 1 } });
  XLSX.utils.book_append_sheet(wb, cover, 'Deckblatt');

  // Sheet 2: Matrix
  const matrixData = [
    ['#', 'Bruttoengagement KNE', 'Rating-Klasse', 'Blankoanteil', 'Bewilligungsebene', 'Quorum', 'Frequenz', 'Eskalation bei Ablehnung'],
    ['M01', '0,25 - 1,0 Mio. EUR', '1-8 (Investment Grade)', 'bis 70 %', 'Teamleiter Marktfolge Aktiv', '2-Augen (Analyst + TL)', 'täglich', 'Bereichsleitung MFA'],
    ['M02', '0,25 - 1,0 Mio. EUR', '9-12 (Non-IG)', 'bis 70 %', 'Bereichsleitung MFA', '4-Augen (TL + BL)', 'täglich', 'Kreditkomitee 1'],
    ['M03', '0,25 - 1,0 Mio. EUR', '13-16 (Watch/Default)', 'beliebig', 'Special Loans Officer', '4-Augen (SLO + BL)', 'taggleich', 'Kreditkomitee 2'],
    ['M04', '1,0 - 5,0 Mio. EUR', '1-8', 'bis 60 %', 'BL MFA + Markt-Vorstand', '4-Augen', 'täglich', 'Kreditkomitee 1'],
    ['M05', '1,0 - 5,0 Mio. EUR', '9-12', 'bis 60 %', 'Kreditkomitee 1', '4 von 5', 'mittwochs 14:00', 'Kreditkomitee 2'],
    ['M06', '5,0 - 25 Mio. EUR', '1-8', 'bis 50 %', 'Kreditkomitee 1', '4 von 5', 'mittwochs 14:00', 'Kreditkomitee 2'],
    ['M07', '5,0 - 25 Mio. EUR', '9-12', 'bis 50 %', 'Kreditkomitee 2 (mit Risikovorstand)', '4 von 5', 'montags 11:00', 'Gesamtvorstand'],
    ['M08', '25 - 100 Mio. EUR', '1-12', 'bis 40 %', 'Kreditkomitee 2', '4 von 5', 'montags 11:00', 'Gesamtvorstand'],
    ['M09', '> 100 Mio. EUR', 'alle', 'beliebig', 'Gesamtvorstand', 'einstimmig', 'wöchentl. + ad-hoc', 'Aufsichtsrat'],
    ['M10', 'Organkredite § 15 KWG', 'alle', 'beliebig', 'Aufsichtsrat', 'Beschluss', 'AR-Sitzung', '—'],
    ['M11', 'Risikorelevant gem. MaRisk BTO 1.2 Tz. 2', 'alle', 'beliebig', '+1 Eskalationsstufe', 'siehe oben', 'siehe oben', 'siehe oben'],
    ['M12', 'Konsortialführung > 10 Mio.', 'alle', 'beliebig', 'Kreditkomitee 2', 'Quorum', 'wöchentlich', 'Gesamtvorstand'],
    ['M13', 'Akquisitionsfinanzierung', '1-8', 'bis 40 %', '+1 Stufe ggü. Standard', 'plus Beraterhonorar > 1 % flag', '—', '—'],
    ['M14', 'Projektfinanzierung Single-Asset', 'PF1-PF6', 'bis 30 %', 'Kreditkomitee 2', '4 von 5', 'monatlich', 'Gesamtvorstand'],
  ];
  const matrix = XLSX.utils.aoa_to_sheet(matrixData);
  setColWidths(matrix, [6, 30, 24, 16, 36, 24, 18, 24]);
  // Header fett (best-effort, da xlsx-Style ohne Plugin limitiert)
  XLSX.utils.book_append_sheet(wb, matrix, 'Matrix');

  // Sheet 3: Stellvertretung
  const vertretung = XLSX.utils.aoa_to_sheet([
    ['Funktion', 'Hauptverantwortlicher', 'Erste Stellvertretung', 'Zweite Stellvertretung', 'Anmerkung'],
    ['Teamleiter MFA',           'Frau Lange',       'Herr Brand',       'Frau Krüger',      'Im Urlaub auch durch BL'],
    ['Bereichsleitung MFA',      'Frau Dr. Berthold','Herr Wachsmuth',   '—',                'Doppelstellv. nur ad-hoc'],
    ['Special Loans Officer',    'Herr Köhler',      'Frau Dr. Berthold','Herr Schäfer',     'Krisenstab aktiviert'],
    ['Kreditkomitee 1 — Vorsitz','Herr Wachsmuth',   'Frau Dr. Berthold','—',                'Quorum 4/5'],
    ['Kreditkomitee 2 — Vorsitz','Herr Brunner',     'Frau Reuter',      '—',                'Risikovorstand'],
    ['Markt-Vorstand',           'Herr Lassi',       'Herr Niemeier',    '—',                'Konzern-Reporting'],
    ['Risiko-Vorstand',          'Frau Reuter',      'Herr Bauer (CRO Stellv.)','—',         'Veto-Recht'],
  ]);
  setColWidths(vertretung, [28, 24, 24, 24, 32]);
  XLSX.utils.book_append_sheet(wb, vertretung, 'Stellvertretung');

  // Sheet 4: Rating-Skala
  const rating = XLSX.utils.aoa_to_sheet([
    ['Rating-Klasse', 'Bezeichnung', 'PD 1J (%)', 'Master-Scale-Bezug', 'Geschäftsausrichtung'],
    ['1A', 'Triple A — Stress-resistent', '0.01', 'AAA', 'Konditionsführerschaft'],
    ['1',  'AA+',                          '0.02', 'AA+', 'Aktive Akquise'],
    ['2',  'AA',                           '0.04', 'AA',  'Aktive Akquise'],
    ['3',  'AA-',                          '0.07', 'AA-', 'Aktive Akquise'],
    ['4',  'A+',                           '0.12', 'A+',  'Aktive Akquise'],
    ['5',  'A',                            '0.18', 'A',   'Aktive Akquise'],
    ['6',  'A-',                           '0.28', 'A-',  'Standard'],
    ['7',  'BBB+',                         '0.42', 'BBB+','Standard'],
    ['8',  'BBB',                          '0.65', 'BBB', 'Standard, Vorsicht'],
    ['9',  'BBB- (Investment Grade Border)','0.95','BBB-','Vorsicht; Konditionsanpassung'],
    ['10', 'BB+',                          '1.40', 'BB+', 'Sondergenehmigung'],
    ['11', 'BB',                           '2.10', 'BB',  'Sondergenehmigung'],
    ['12', 'BB-',                          '3.10', 'BB-', 'Watchlist'],
    ['13', 'B+',                           '4.70', 'B+',  'Intensivbetreuung'],
    ['14', 'B',                            '7.20', 'B',   'Intensivbetreuung'],
    ['15', 'B-',                           '11.5', 'B-',  'Special Loans'],
    ['16', 'CCC und Default',              '> 25', 'CCC', 'Workout / Wertberichtigung'],
  ]);
  setColWidths(rating, [14, 36, 14, 22, 30]);
  XLSX.utils.book_append_sheet(wb, rating, 'Rating-Skala');

  // Sheet 5: Override-Regeln
  const override = XLSX.utils.aoa_to_sheet([
    ['Regel', 'Beschreibung', 'Max. Notches', 'Genehmigung'],
    ['O-01', 'Konzernrückhalt durch IG-Mutter (Patronat)', '+2', 'Bereichsleitung MFA'],
    ['O-02', 'Wesentliche Sondereffekte (Akquisition, Brand)','+1', 'Teamleiter MFA'],
    ['O-03', 'Marktposition: Quasi-Monopol, regulierter Preis','+1', 'Teamleiter MFA'],
    ['O-04', 'ESG-Risiken auf 5J-Horizont (Transitionsrisiken)', '-2', 'Bereichsleitung MFA + Sustainability Officer'],
    ['O-05', 'Branchenausblick stark negativ',           '-1', 'Teamleiter MFA'],
    ['O-06', 'Persönliche Bonität (Geschäftsführung)', '-1', 'Teamleiter MFA'],
    ['O-07', 'Mehrjährige Compliance-Verstöße',           '-2', 'Compliance + Bereichsleitung MFA'],
    ['',     'Hinweis: Aggregierte Overrides max. 2 Notches in beide Richtungen.', '', ''],
  ]);
  setColWidths(override, [8, 60, 14, 38]);
  XLSX.utils.book_append_sheet(wb, override, 'Override-Regeln');

  downloadWorkbook(XLSX, wb, `Kompetenzmatrix_Kreditgeschaeft_${new Date().toISOString().slice(0,10)}.xlsx`);
}

// =============================================================================
// 2) Sicherheiten-Bewertungs-Workbook
// =============================================================================
export async function generateExcelSicherheitenbewertung() {
  const XLSX = await getXLSX();
  const wb = XLSX.utils.book_new();

  // Deckblatt
  const cover = XLSX.utils.aoa_to_sheet([
    ['SICHERHEITEN-BEWERTUNGS-WORKBOOK Q4/2025'],
    [],
    ['Anlage', 'RA-SI-04 Anlage 1'],
    ['Version', 'Q4/2025 (Freigegeben durch Risiko-Controlling)'],
    ['Gültig bis', '31.03.2026 (vierteljährliche Aktualisierung)'],
    ['Eigentümer', 'Risiko-Controlling — Team Sicherheiten'],
    [],
    ['Inhalt dieses Workbooks:'],
    ['Tab "Haircut-Matrix" – Beleihungsgrenzen und Haircuts je Sicherheitenart.'],
    ['Tab "Bewertungsmodelle" – Verfahrensbeschreibung pro Sicherheitenart.'],
    ['Tab "Marktdaten-Triggers" – Markt-Indikatoren und Margin-Call-Schwellen.'],
    ['Tab "Verwertungs-Benchmarks" – Erwartete Verwertungserlöse anhand realisierter Fälle.'],
    ['Tab "Beispiel-Berechnung" – Vollständiges Bewertungsbeispiel.'],
    [],
    ['Wichtig: Die Haircuts gelten ausschließlich für Risiko-Steuerungs-Zwecke (interne RWA).'],
    ['Aufsichtsrechtliche Anrechenbarkeit gemäß CRR Art. 192 ff. wird separat ermittelt.'],
  ]);
  setColWidths(cover, [38, 70]);
  XLSX.utils.book_append_sheet(wb, cover, 'Deckblatt');

  // Haircut-Matrix
  const haircut = XLSX.utils.aoa_to_sheet([
    ['ID', 'Sicherheitenart', 'Unterart', 'Beleihungsgrenze', 'Haircut (Stress)', 'Bewertungszyklus', 'Anmerkung'],
    ['S01', 'Grundschuld Wohnimmobilie selbstgenutzt', 'EFH/Reihenhaus DE-Ballungsraum', '60 % VW', '20 %', '24 Monate', 'Verkehrswert nach BelWertV'],
    ['S02', 'Grundschuld Wohnimmobilie selbstgenutzt', 'EFH ländlich',                  '55 % VW', '25 %', '24 Monate', 'Bei strukturschwacher Region'],
    ['S03', 'Grundschuld Wohnimmobilie vermietet',     'Mehrfamilienhaus',             '55 % VW', '25 %', '12 Monate', 'Sensitivität Leerstand'],
    ['S04', 'Grundschuld Gewerbeimmobilie',            'Bürogebäude A-Lage',           '55 % VW', '25 %', '12 Monate', 'Cashflow-basiert plausibilisieren'],
    ['S05', 'Grundschuld Gewerbeimmobilie',            'Logistik / Industrie',         '50 % VW', '30 %', '12 Monate', 'Reststandzeit beachten'],
    ['S06', 'Grundschuld Gewerbeimmobilie',            'Spezialimmobilie',             '40 % VW', '35 %', '12 Monate', 'Drittverwendbarkeit prüfen'],
    ['S07', 'Bürgschaft natürliche Person',            'Vermögensreich (> 2 Mio.)',    'individuell','30 %', '12 Monate', 'Vermögensaufstellung'],
    ['S08', 'Bürgschaft natürliche Person',            'Standard',                     'individuell','40 %', '12 Monate', 'Pfändungsfreigrenze'],
    ['S09', 'Bürgschaft Bank Investment-Grade',        'EU/UK',                        '100 % nom.','5 %',  '6 Monate', 'Counterparty-Limits prüfen'],
    ['S10', 'Sicherungsübereignung Maschinen',         'Standard-Werkzeugmaschinen',   '40 %',     '40 %',  '12 Monate', 'Vermarktungszeit < 6M'],
    ['S11', 'Sicherungsübereignung Maschinen',         'Spezialmaschinen',             '25 %',     '55 %',  '12 Monate', 'Schwer verwertbar'],
    ['S12', 'Sicherungsübereignung Fahrzeuge',         'Pkw',                          '50 %',     '35 %',  '12 Monate', 'Schwacke / DAT'],
    ['S13', 'Sicherungsübereignung Fahrzeuge',         'Lkw / Nutzfahrzeuge',          '45 %',     '40 %',  '12 Monate', 'Spezialmärkte'],
    ['S14', 'Globalzession Forderungen',               'Inland B2B',                   '60 %',     '30 %',  'monatlich', 'Debitorenliste aktuell'],
    ['S15', 'Globalzession Forderungen',               'Exporte EU',                   '50 %',     '35 %',  'monatlich', 'FX-Risiko'],
    ['S16', 'Globalzession Forderungen',               'Exporte Drittland',            '35 %',     '50 %',  'monatlich', 'Länderrisiko'],
    ['S17', 'Verpfändung Wertpapiere',                 'Bundesanleihen',               '90 %',     '5 %',   'täglich',   'Tägliche MtM'],
    ['S18', 'Verpfändung Wertpapiere',                 'IG-Corporates',                '70 %',     '15 %',  'täglich',   'Margin-Call bei -10 %'],
    ['S19', 'Verpfändung Wertpapiere',                 'High-Yield',                   '50 %',     '30 %',  'täglich',   'Margin-Call bei -7 %'],
    ['S20', 'Verpfändung Wertpapiere',                 'Aktien Bluechip',              '50 %',     '30 %',  'täglich',   'Margin-Call bei -8 %'],
    ['S21', 'Lebensversicherung Rückkaufswert',        'Standard',                     '90 %',     '5 %',   '12 Monate', 'Abtretung Pflicht'],
    ['S22', 'Patronat / Konzernrückhalt',              'IG-Konzernmutter',             '100 % nom.','10 %', '12 Monate', 'Harte Patronatserklärung'],
    ['S23', 'Patronat / Konzernrückhalt',              'Sub-IG-Konzernmutter',         '50 % nom.', '40 %', '6 Monate', 'Weiche Patronatserklärung'],
    ['S24', 'Avale ', 'Eigene Avale (Refinanzierung)', '0 %', 'n/a',  'n/a', 'Nicht als Sicherheit anrechenbar'],
    ['S25', 'Kreditderivate (Single-Name CDS)',        'IG-Counterparty',              '100 %',    '10 %',  'monatlich', 'Wrong-Way-Risk prüfen'],
  ]);
  setColWidths(haircut, [6, 36, 30, 16, 14, 18, 32]);
  XLSX.utils.book_append_sheet(wb, haircut, 'Haircut-Matrix');

  // Bewertungsmodelle
  const models = XLSX.utils.aoa_to_sheet([
    ['Sicherheitenart', 'Bewertungsmodell', 'Datenquelle', 'Validierung', 'Schwächen / Risiken'],
    ['Grundschuld WG/MFH',     'Ertragswert + Sachwert (BelWertV)', 'BelWertV-Gutachten, Bundesbank-Immo-Statistik', 'Jährlich, Backtesting vs. realisierte Verkäufe', 'Marktilliquidität in Sondersituationen'],
    ['Grundschuld Gewerbe',    'DCF + Vergleichswerte',             'Mietspiegel, JLL/CBRE-Reports',                'Halbjährlich',                                 'Vermietungsrisiko, Sektor-Cycles'],
    ['Maschinen',              'Marktwert via Sachverständige',    'EUWID, M&A-Datenbanken',                       'Anlassbezogen',                                'Technologische Obsoleszenz'],
    ['Forderungen',            'Aging Buckets + Kundendiversifikation','Debitorenbuch (monatlich)',                  'Monatlich vs. tatsächliche Eingänge',          'Konzentrationsrisiko'],
    ['Wertpapiere',            'MtM mit Liquiditätsabschlag',       'Bloomberg, ICAP',                              'Daily Backtesting',                            'Liquiditäts-Squeeze in Krisen'],
    ['Lebensversicherung',     'Rückkaufswert + Überschuss',       'Versicherungsschein, RKW-Bestätigung',         'Anlassbezogen',                                'Steueränderungen, Storno-Tabellen'],
    ['Patronat',               'Bonität Mutter + Wording-Analyse', 'Rating Mutter, externe Auskünfte',            'Jährlich',                                     'Rechtliche Durchsetzbarkeit'],
  ]);
  setColWidths(models, [30, 36, 36, 30, 36]);
  XLSX.utils.book_append_sheet(wb, models, 'Bewertungsmodelle');

  // Markt-Triggers
  const triggers = XLSX.utils.aoa_to_sheet([
    ['Trigger', 'Schwellenwert', 'Maßnahme'],
    ['vdp-Index Wohnimmobilien YoY',  '< -5 %',          'Sondervaluation aller WG-Sicherheiten innerhalb 90 Tagen'],
    ['JLL-Spitzenmieten Büro DE Top-7','< -10 % YoY',    'Sondervaluation aller Büro-Engagements'],
    ['LTV-Anstieg im Bestand',         '> 80 %',         'Sondervaluation einzelner Engagements'],
    ['MSCI World Drawdown',            '< -15 % vom YTD','Margin-Call-Lauf Wertpapierdepot'],
    ['Sektor-Index Maschinenbau',      '< -20 % YoY',    'Verwertungs-Worst-Case-Sensitivität rechnen'],
  ]);
  setColWidths(triggers, [36, 30, 50]);
  XLSX.utils.book_append_sheet(wb, triggers, 'Marktdaten-Triggers');

  // Beispiel-Berechnung
  const example = XLSX.utils.aoa_to_sheet([
    ['BEISPIEL-BEWERTUNG — Engagement Müller Maschinenbau GmbH'],
    [],
    ['Engagement-Daten:'],
    ['Bruttoengagement',                                 '4.250.000 EUR'],
    ['Antrags-Art',                                       'Investitionskredit + Betriebsmittel'],
    ['Laufzeit',                                          '7 Jahre'],
    [],
    ['Sicherheitenangebot:'],
    ['ID', 'Sicherheit',                                'Marktwert',           'Anrechenbar (nach BG)', 'Haircut',  'Anrechnung nach Haircut'],
    ['1',  'Grundschuld Logistikhalle Köln (S05)',     '3.200.000 EUR',         '50 %', '30 %',        '1.120.000 EUR'],
    ['2',  'Sicherungsübereignung CNC-Maschinen (S10)','1.800.000 EUR',         '40 %', '40 %',        '432.000 EUR'],
    ['3',  'Globalzession Forderungen (S14)',         '1.500.000 EUR Avg',     '60 %', '30 %',        '630.000 EUR'],
    ['4',  'Bürgschaft Geschäftsführer (S08)',        '500.000 EUR',           '—',    '40 %',        '300.000 EUR'],
    [],
    ['Summe anrechenbar nach Haircut:',                                                                            '2.482.000 EUR'],
    ['Bruttoengagement:',                                                                                          '4.250.000 EUR'],
    ['Blankoanteil:',                                                                                              '1.768.000 EUR (41,6 %)'],
    [],
    ['Bewertung Gesamtsicht:'],
    ['Blankoanteil 41,6 % liegt im Rahmen der Kompetenzeinstufung M04 (max. 60 %).'],
    ['Empfehlung: Bewilligung durch BL MFA + Markt-Vorstand (4-Augen).'],
  ]);
  setColWidths(example, [40, 30, 30, 28, 16, 26]);
  mergeCell(example, { s: { r: 0, c: 0 }, e: { r: 0, c: 5 } });
  XLSX.utils.book_append_sheet(wb, example, 'Beispiel-Berechnung');

  downloadWorkbook(XLSX, wb, `Sicherheiten-Bewertung_Q4-2025_${new Date().toISOString().slice(0,10)}.xlsx`);
}

// =============================================================================
// 3) Zahlungsverkehr-Limit-Workbook
// =============================================================================
export async function generateExcelZahlungslimits() {
  const XLSX = await getXLSX();
  const wb = XLSX.utils.book_new();

  const cover = XLSX.utils.aoa_to_sheet([
    ['ZAHLUNGSVERKEHR — LIMIT- UND SCHWELLENWERTE-MATRIX'],
    [],
    ['Dokument-ID', 'LM-ZV-2026-002'],
    ['Version', '4.3'],
    ['Stand', new Date().toLocaleDateString('de-DE')],
    ['Eigentümer', 'Bereichsleitung Payment Operations'],
    ['Methodische Aufsicht', 'OpRisk & Compliance (2nd LoD)'],
    ['Bezugsdokument', 'OH-ZV-2026-007 (Operations-Handbuch Zahlungsverkehr)'],
    [],
    ['Inhalt:'],
    ['Tab "Cut-off-Times" — Cut-offs pro Scheme und Korridor.'],
    ['Tab "Freigabematrix" — Mehraugen-Schwellen und Stellvertretungen.'],
    ['Tab "Limit-Schwellen" — Kunden-, Konzern-, Tag- und Monatslimits.'],
    ['Tab "Sanktionslisten" — Konfigurierte Listen und Update-Frequenz.'],
    ['Tab "CSCF-Mapping" — SWIFT Customer Security Controls.'],
    ['Tab "FX-Korridore" — Spread- und Liquiditätsanforderungen.'],
  ]);
  setColWidths(cover, [38, 60]);
  XLSX.utils.book_append_sheet(wb, cover, 'Deckblatt');

  // Cut-off-Times (detailliert)
  const cutoffs = XLSX.utils.aoa_to_sheet([
    ['Scheme', 'Korridor / Zone', 'Cut-off CET', 'Settlement-Window', 'SLA-Verfügbarkeit', 'Bemerkung'],
    ['SCT Standard',       'DE/AT/LU intern',          '14:30', 'D+0', '99,7 %', 'STEP2 / RT1'],
    ['SCT Standard',       'EWR andere Länder',        '12:00', 'D+1', '99,5 %', 'STEP2'],
    ['SCT Inst',           '24/7',                     'kein',  '< 10s','99,9 %', 'TIPS / RT1'],
    ['SDD CORE Erst',      'DE/AT/LU',                 '14:00 D-5','D+0','99,7 %','Pre-Notification 14T'],
    ['SDD CORE Folge',     'DE/AT/LU',                 '14:00 D-2','D+0','99,7 %','—'],
    ['SDD B2B',            'DE/AT/LU',                 '14:00 D-1','D+0','99,7 %','Mandat zwingend'],
    ['SWIFT MT103 EUR',    'EWR',                      '17:00', 'Same-day','99,5 %','TARGET2'],
    ['SWIFT MT103 USD',    'Nordamerika',              '15:00', 'Same-day','99,5 %','Chase / Citi Korrespondenz'],
    ['SWIFT MT103 USD',    'Asien',                    '11:00', 'D+1',    '99,0 %','Zeitzone, Chase HK'],
    ['SWIFT MT103 GBP',    'UK',                       '15:00', 'Same-day','99,5 %','HSBC Korrespondenz'],
    ['SWIFT MT103 CHF',    'CH',                       '14:00', 'Same-day','99,5 %','UBS Korrespondenz'],
    ['SWIFT MT103 JPY',    'Japan',                    '08:00 (T-1)','D+1','99,0 %','Mizuho Korrespondenz'],
    ['SWIFT MT202',        'FI-to-FI EUR',             '17:30', 'Same-day','99,5 %','TARGET2 Großbetrag'],
    ['SWIFT MT202 COV',    'FI-to-FI mit Auftraggeber','17:30', 'Same-day','99,5 %','Travel-Rule-Compliant'],
    ['TARGET2 Customer',   'EUR',                      '18:00', 'Real-Time','99,9 %','Schließung 19:00'],
    ['TARGET2 Interbank',  'EUR',                      '18:45', 'Real-Time','99,9 %','—'],
  ]);
  setColWidths(cutoffs, [22, 26, 14, 18, 18, 30]);
  XLSX.utils.book_append_sheet(wb, cutoffs, 'Cut-off-Times');

  // Freigabematrix
  const freigabe = XLSX.utils.aoa_to_sheet([
    ['Stufe', 'Auftragstyp', 'Betragsschwelle', 'Mehraugen', 'Genehmiger 1', 'Genehmiger 2', 'Genehmiger 3', 'Step-up-Auth'],
    ['F-1', 'SCT Standard', '< 25 TEUR',      '2-Augen Workflow', 'PH-2025 STP',         '—',                       '—', 'nein'],
    ['F-2', 'SCT Standard', '25-100 TEUR',    '4-Augen',          'Sachbearbeiter',      'Teamleiter',              '—', 'nein'],
    ['F-3', 'SCT Standard', '100 TEUR-1 Mio.','4-Augen',          'Teamleiter',          'Bereichsleitung',         '—', 'optional'],
    ['F-4', 'SCT Standard', '> 1 Mio.',       '6-Augen',          'Teamleiter',          'Bereichsleitung',         'Compliance-Officer', 'ja'],
    ['F-5', 'SCT Inst',     '< 100 TEUR',     '2-Augen Workflow', 'PH-2025 STP',         '—',                       '—', 'nein'],
    ['F-6', 'SCT Inst',     '> 100 TEUR',     '4-Augen',          'Sachbearbeiter',      'Teamleiter',              '—', 'ja'],
    ['F-7', 'SDD CORE',     'alle',           '4-Augen Lauf',     'Operator',            'Teamleiter',              '—', 'nein'],
    ['F-8', 'SDD B2B',      'alle',           '4-Augen',          'Operator',            'Teamleiter',              '—', 'nein'],
    ['F-9', 'SWIFT MT103', '< 100 TEUR',      '2-Augen Workflow', 'PH-2025 STP',         '—',                       '—', 'nein'],
    ['F-10','SWIFT MT103','100 TEUR-500 TEUR','4-Augen',          'Specialist',          'Teamleiter',              '—', 'optional'],
    ['F-11','SWIFT MT103', '> 500 TEUR',      '6-Augen',          'Specialist',          'Teamleiter',              'Vorstand-Stellv.', 'ja'],
    ['F-12','SWIFT MT202 COV','alle',         '4-Augen',          'Specialist',          'Treasury-Rep',            '—', 'ja'],
    ['F-13','Auslandszahlung in Sanktionsland','alle','—','Hard-Stop bis Compliance-Freigabe','—','—', 'ja'],
    ['F-14','Geänderte Empfänger-IBAN','> 250 TEUR','+ Telefon-Rückverif.','Sachbearbeiter','Teamleiter','—','ja'],
  ]);
  setColWidths(freigabe, [8, 24, 22, 22, 22, 22, 22, 14]);
  XLSX.utils.book_append_sheet(wb, freigabe, 'Freigabematrix');

  // Limit-Schwellen
  const limits = XLSX.utils.aoa_to_sheet([
    ['Limit-Typ', 'Standard-Schwelle Retail', 'Standard-Schwelle Firmenkunde', 'Bemerkung'],
    ['Online-Banking Tageslimit',     '10.000 EUR',     '100.000 EUR',   'Erhöhung über FKB + 4-Augen'],
    ['Online-Banking Monatslimit',    '50.000 EUR',     '1.000.000 EUR', 'CRM-individuell'],
    ['Einzelauftragslimit OB',        '5.000 EUR',      '50.000 EUR',    'Default; CRM überschreibt'],
    ['EBICS Tageslimit Firmenkunde',  '—',              '5.000.000 EUR', 'Pro EBICS-User'],
    ['EBICS Monatslimit Firmenkunde', '—',              '50.000.000 EUR','—'],
    ['Tagesgesamt-Cap (institutsweit)','—',             '500 Mio. EUR',  'Treasury-Steuerung'],
    ['Filiale Bareinzahlung Schwelle','15.000 EUR',     '15.000 EUR',    '§ 10 GwG'],
    ['Konzern-Tageslimit (Sponsor)',  '—',              'gem. Kreditakte','Hard-Stop bei Verletzung'],
    ['Intraday-Liquidität-Min TARGET2','—',             '50 Mio. EUR',   'Treasury-Trigger'],
  ]);
  setColWidths(limits, [40, 28, 30, 36]);
  XLSX.utils.book_append_sheet(wb, limits, 'Limit-Schwellen');

  // Sanktionslisten
  const lists = XLSX.utils.aoa_to_sheet([
    ['Listenname', 'Quelle', 'Update-Frequenz', 'Match-Schwelle', 'Anmerkung'],
    ['EU Consolidated Financial Sanctions','EU-Kommission','täglich 06:00 CET','85 %','EU-Sanktionsverordnungen'],
    ['OFAC SDN List',                      'US Treasury OFAC','mehrfach täglich','85 %','USD-Korridor zwingend'],
    ['UN Consolidated List',               'United Nations','wöchentlich','90 %','—'],
    ['HMT Consolidated List (UK)',         'HM Treasury UK','täglich','85 %','GBP-Korridor'],
    ['BMF (DE)',                           'Bundesfinanzministerium','wöchentlich','90 %','Sonderlisten'],
    ['Eigene Watchlist',                   'intern','laufend','95 %','PEPs, Verdachtsfälle'],
    ['Travel Rule Threshold List',         'intern (VO 2015/847)','—','—','Identifikation Begleitinfos'],
  ]);
  setColWidths(lists, [36, 28, 22, 16, 30]);
  XLSX.utils.book_append_sheet(wb, lists, 'Sanktionslisten');

  // CSCF-Mapping
  const cscf = XLSX.utils.aoa_to_sheet([
    ['Control-ID', 'CSCF-Control', 'Status', 'Attestation', 'Owner', 'Anmerkung'],
    ['1.1', 'Restrict Internet Access', 'Implementiert', 'Independent 2026', 'CISO', '—'],
    ['1.2', 'OS Privileged Access',     'Implementiert', 'Independent 2026', 'IT-Ops', 'MFA Pflicht'],
    ['1.3', 'Virtualisation',           'N/A',            'Independent 2026', 'IT-Ops', 'physische Hosts'],
    ['1.4', 'Restriction of Internet Access on End-User Devices','Implementiert','Independent 2026','CISO','—'],
    ['1.5', 'Multi-Factor Authentication for Privileged Access','Implementiert','Independent 2026','IT-Ops','FIDO2'],
    ['2.1', 'Internal Data Flow Security','Implementiert','Independent 2026','IT-Sec','—'],
    ['2.2', 'Security Updates',           'Implementiert','Independent 2026','IT-Ops','monatlich'],
    ['2.3', 'System Hardening',           'Implementiert','Independent 2026','IT-Sec','CIS Benchmark'],
    ['2.4A','Back-Office Data Flow Security','Implementiert','Independent 2026','IT-Sec','TLS 1.3'],
    ['3.1', 'Physical Security',          'Implementiert','Independent 2026','Facility','—'],
    ['4.1', 'Password Policy',            'Implementiert','Independent 2026','IT-Ops','passwordless wo möglich'],
    ['5.1', 'Logical Access Control',     'Implementiert','Independent 2026','IAM','RBAC + Recertification'],
    ['5.2', 'Token Management',           'Implementiert','Independent 2026','PKI','Smartcards'],
    ['6.1', 'Malware Protection',         'Implementiert','Independent 2026','SOC','EDR'],
    ['6.2', 'Software Integrity',         'Implementiert','Independent 2026','IT-Sec','Code-Signing'],
    ['7.1', 'Cyber Incident Response',    'Implementiert','Independent 2026','SOC','24/7'],
    ['7.2', 'Security Training',          'Implementiert','Independent 2026','HR','jährlich'],
  ]);
  setColWidths(cscf, [12, 50, 18, 18, 14, 26]);
  XLSX.utils.book_append_sheet(wb, cscf, 'CSCF-Mapping');

  downloadWorkbook(XLSX, wb, `Zahlungsverkehr_Limits_Schwellen_${new Date().toISOString().slice(0,10)}.xlsx`);
}
