/**
 * konsortialTemplate.js
 *
 * Muster-Inhalt eines deutschen Konsortialkreditvertrags. Gliederung
 * orientiert sich an der marktüblichen LMA-Struktur, wie sie auch der
 * Musterkonsortialvertrag des Bundesverbands deutscher Banken (BdB) und
 * Standardverträge der Großbanken verwenden:
 *
 *   § 1  Vertragsparteien & Konsortium
 *   § 2  Kredithöhe und Tranchen
 *   § 3  Verwendungszweck
 *   § 4  Auszahlungsvoraussetzungen & Valuta
 *   § 5  Zinsen und Marge
 *   § 6  Laufzeit und Tilgung
 *   § 7  Sicherheiten
 *   § 8  Financial Covenants
 *   § 9  Kündigungsrechte und Events of Default
 *   § 10 Schlussbestimmungen
 *
 * Die konkreten Zahlen sind fiktiv, aber so gewählt, dass die
 * Regex-Extraktoren greifen (Beträge, Zinssatz, Laufzeit, Daten).
 *
 * Quellen-Inspiration (öffentlich dokumentierte Marktpraxis):
 *   - LMA Recommended Form of Facility Agreement (Loan Market Association)
 *   - BdB Musterklauseln zu Konsortialkrediten
 *   - VÖB Handreichung syndizierte Finanzierung
 */

export const TEMPLATE_META = {
  titel: 'Muster-Konsortialkreditvertrag',
  untertitel: 'Fiktives Showcase-Dokument für die KI-Kreditanalyse',
  dateiname: 'muster-konsortialkreditvertrag.pdf',
  hinweis:
    'Dies ist eine frei erfundene Vorlage für Demonstrationszwecke. Struktur lehnt '
    + 'sich an marktübliche LMA/BdB-Konsortialkreditverträge an. Keine Rechtsberatung.',
};

export const TEMPLATE_SECTIONS = [
  {
    heading: '§ 1 Vertragsparteien und Konsortium',
    lines: [
      'Kreditnehmer: Musterbau Industrie GmbH',
      'Sitz: Industriestraße 42, 28195 Bremen',
      'HRB: 54321, Amtsgericht Bremen',
      'Konsortialführer: Commerzbank AG, Frankfurt am Main',
      'Weitere Konsortialbanken: Bremer Landesbank, Sparkasse Bremen, Volksbank Bremen Nord eG',
      'Facility Agent: Commerzbank AG (zugleich Sicherheitentreuhänder).',
    ],
  },
  {
    heading: '§ 2 Kredithöhe und Tranchen',
    lines: [
      'Kreditbetrag: EUR 15.000.000,00 (in Worten: fünfzehn Millionen Euro).',
      'Tranche A (Term Loan): EUR 10.000.000,00',
      'Tranche B (Revolving Credit Facility): EUR 5.000.000,00',
      'Ursprungsbetrag: EUR 15.000.000,00',
      'Restschuld zum Stichtag 31.03.2026: EUR 12.500.000,00',
    ],
  },
  {
    heading: '§ 3 Verwendungszweck',
    lines: [
      'Verwendungszweck: Finanzierung der Werkserweiterung am Standort Bremen sowie Refinanzierung bestehender bilateraler Linien.',
      'Eine davon abweichende Verwendung bedarf der schriftlichen Zustimmung aller Konsortialbanken.',
    ],
  },
  {
    heading: '§ 4 Auszahlungsvoraussetzungen und Valuta',
    lines: [
      'Auszahlungstermin: 15.05.2026',
      'Valuta: 15.05.2026, vorbehaltlich Vorlage aller Conditions Precedent.',
      'Conditions Precedent: aktuelle Handelsregisterauszüge, testierter Jahresabschluss 2025, KYC-Bestätigung, Legal Opinion.',
    ],
  },
  {
    heading: '§ 5 Zinsen und Marge',
    lines: [
      'Zinssatz: 4,25 % p.a. (fix für die gesamte Laufzeit).',
      'Marge: 2,35 % über 3-Monats-EURIBOR für die Revolving-Tranche.',
      'Bereitstellungsprovision: 0,80 % p.a. auf nicht in Anspruch genommene Beträge.',
      'Zinszahlungen erfolgen quartalsweise nachschüssig.',
    ],
  },
  {
    heading: '§ 6 Laufzeit und Tilgung',
    lines: [
      'Laufzeit: 60 Monate ab Valuta.',
      'Tilgungsfreie Zeit: 12 Monate ab Valuta.',
      'Tilgung: 48 gleichbleibende monatliche Raten.',
      'Rate: EUR 208.333,33 pro Monat (Tranche A).',
      'Laufzeitende: 15.05.2031',
    ],
  },
  {
    heading: '§ 7 Sicherheiten',
    lines: [
      'Sicherheiten: Erstrangige Grundschuld EUR 15.000.000,00 auf Werksgelände Industriestraße 42, 28195 Bremen; Sicherungsübereignung des Maschinenparks; Verpfändung der Geschäftsanteile der Musterbau Industrie GmbH.',
      'Besicherung erfolgt zugunsten des Sicherheitentreuhänders für alle Konsortialbanken anteilig.',
    ],
  },
  {
    heading: '§ 8 Financial Covenants',
    lines: [
      'Covenants: Netto-Verschuldung / EBITDA maximal 3,5x; Zinsdeckungsgrad (EBITDA / Zinsaufwand) mindestens 4,0x; Eigenkapitalquote mindestens 25 %.',
      'Prüfung halbjährlich auf Basis testierter bzw. prüferisch durchgesehener Abschlüsse.',
      'Reporting: Quartalsreporting innerhalb von 45 Tagen nach Quartalsende.',
    ],
  },
  {
    heading: '§ 9 Kündigungsrechte und Events of Default',
    lines: [
      'Wesentliche Kündigungsgründe: Zahlungsverzug, Covenant-Bruch, Insolvenz, Kontrollwechsel, wesentliche nachteilige Veränderung (Material Adverse Change).',
      'Heilungsfrist bei Covenant-Bruch: 30 Bankarbeitstage.',
    ],
  },
  {
    heading: '§ 10 Schlussbestimmungen',
    lines: [
      'Anwendbares Recht: Bundesrepublik Deutschland.',
      'Gerichtsstand: Frankfurt am Main.',
      'Schriftformerfordernis für Änderungen und Ergänzungen.',
    ],
  },
];
