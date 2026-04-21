/**
 * sapGuideSteps.js
 *
 * Schritt-für-Schritt-Anleitung zum Übertragen der aus dem externen
 * Konsortialkredit-PDF extrahierten Werte in den Finanzierungsarbeitsplatz
 * von SAP S/4HANA Banking for Complex Loans.
 *
 * Reihenfolge und Feldnamen sind den Kapiteln 3 (Finanzierungen),
 * 4 (Tranchen), 5 (Ziehungen), 6 (Partner), 7 (Konditionen) und
 * 1.1 (Registerkarte Übersicht) des offiziellen SAP-Handbuchs
 * (Dokumentversion 1.0, 23.01.2026) entnommen.
 *
 * Jeder Schritt hat:
 *   - id, title, description
 *   - maskId (Zielmaske für Verlinkung mit Parser-Hits)
 *   - breadcrumb, tabTitle, tabs, fields (für SapMaskMockup)
 *   - mappedKeys[]  Array von maskenMapping-Keys, die hier erfasst werden
 */

export const SAP_GUIDE_STEPS = [
  // ----------------------------------------------------------------
  {
    id: 'step-1-partner',
    title: '1. Darlehensnehmer als Geschäftspartner anlegen',
    description:
      'Bevor die Finanzierung erfasst werden kann, muss der Kreditnehmer als SAP-Geschäftspartner existieren. Aus dem Konsortialvertrag werden Firmenname, Rechtsform, Handelsregisternummer und Sitz in die Stammdaten übernommen.',
    handbuchRef: 'Kapitel 6.1 „Anlegen von Geschäftspartnern"',
    maskId: 'sap-partner',
    breadcrumb: ['Home', 'Geschäftspartner pflegen', 'Neuer Partner'],
    tabTitle: 'Geschäftspartner anlegen',
    tabs: [
      { label: 'Allgemeine Daten', active: true },
      { label: 'Adresse' },
      { label: 'Identifikation' },
      { label: 'Rollen' },
      { label: 'Bankverbindungen' },
    ],
    fields: [
      { label: 'Name 1', value: 'Musterbau Industrie GmbH', highlight: true },
      { label: 'Name 2', value: '' },
      { label: 'Rechtsform', value: 'GmbH', highlight: true },
      { label: 'Suchbegriff', value: 'MUSTERBAU' },
    ],
    highlightedNote: 'Werte aus dem Konsortialvertrag – Abschnitt "Kreditnehmer / Sitz / HRB"',
    mappedKeys: ['firma', 'rechtsform', 'hrb', 'adresse'],
  },

  // ----------------------------------------------------------------
  {
    id: 'step-2-finanzierung-anlegen',
    title: '2. Finanzierung anlegen – Registerkarte Übersicht',
    description:
      'Im Finanzierungsarbeitsplatz wird über „Anlegen" ein neuer Finanzierungsknoten erstellt. Auf der Registerkarte Übersicht werden die Vertragsparameter aus dem Konsortialvertrag erfasst: Produkt, Hauptdarlehensnehmer, Gesamtbetrag, Beginn- und Enddatum der Vertragslaufzeit.',
    handbuchRef: 'Kapitel 1.1 „Registerkarte Übersicht" und 3.3 „Felder in der Finanzierung"',
    maskId: 'sap-finanzierung',
    breadcrumb: ['Finanzierungsarbeitsplatz', 'Finanzierung anlegen'],
    tabTitle: 'Finanzierung – Kopfdaten',
    tabs: [
      { label: 'Übersicht', active: true },
      { label: 'Konditionen' },
      { label: 'Ziehungsregeln' },
      { label: 'Partner' },
      { label: 'Syndizierung' },
      { label: 'Covenants' },
    ],
    fields: [
      { label: 'Produkt', value: 'Konsortialkredit Corporate', highlight: true },
      { label: 'Name', value: 'Musterbau – Werkserweiterung 2026', highlight: true },
      { label: 'Hauptdarlehensnehmer', value: 'Musterbau Industrie GmbH' },
      { label: 'Gesamtbetrag', value: '15.000.000,00 EUR', highlight: true },
      { label: 'Finanzierungsbetrag', value: '15.000.000,00 EUR', highlight: true },
      { label: 'Beginn der Vertragslaufzeit', value: '15.05.2026', highlight: true },
      { label: 'Ende der Vertragslaufzeit', value: '15.05.2031', highlight: true },
      { label: 'Buchungskreis', value: '1000' },
    ],
    highlightedNote:
      'Werte aus dem Konsortialvertrag: § 2 Kredithöhe, § 3 Verwendungszweck, § 4 Valuta, § 6 Laufzeitende',
    mappedKeys: ['kreditart', 'verwendung', 'kreditbetrag', 'ursprungsbetrag', 'auszahlung', 'laufzeitende'],
  },

  // ----------------------------------------------------------------
  {
    id: 'step-3-syndizierung',
    title: '3. Konsortialführer erfassen – Registerkarte Syndizierung',
    description:
      'Bei Konsortialfinanzierungen wird auf der Registerkarte Syndizierung der Konsortialführer als eigene Partnerrolle gepflegt. Weitere Konsorten können mit individuellen Beteiligungsquoten hinzugefügt werden.',
    handbuchRef: 'Kapitel 3.1 „Anlegen einer Finanzierung" – Registerkarte Syndizierung',
    maskId: 'sap-finanzierung',
    breadcrumb: ['Finanzierungsarbeitsplatz', 'Finanzierung', 'Syndizierung'],
    tabTitle: 'Finanzierung – Syndizierung',
    tabs: [
      { label: 'Übersicht' },
      { label: 'Konditionen' },
      { label: 'Ziehungsregeln' },
      { label: 'Partner' },
      { label: 'Syndizierung', active: true },
      { label: 'Covenants' },
    ],
    fields: [
      { label: 'Konsortialführer', value: 'Commerzbank AG', highlight: true },
      { label: 'Rolle', value: 'Facility Agent' },
      { label: 'Eigenanteil', value: '40,00 %' },
      { label: 'Beteiligung Konsorte 1', value: 'Bremer Landesbank – 30,00 %' },
      { label: 'Beteiligung Konsorte 2', value: 'Sparkasse Bremen – 20,00 %' },
      { label: 'Beteiligung Konsorte 3', value: 'Volksbank Bremen Nord eG – 10,00 %' },
    ],
    highlightedNote: 'Aus Konsortialvertrag § 1 Vertragsparteien und Konsortium',
    mappedKeys: ['konsortialfuehrer'],
  },

  // ----------------------------------------------------------------
  {
    id: 'step-4-konditionen-zinsen',
    title: '4. Zinskonditionen – Registerkarte Konditionen › Kopfdaten',
    description:
      'Auf der Registerkarte Konditionen werden die Zinsvereinbarungen als Konditionspositionen hinterlegt. Der Effektivzins ergibt sich aus dem Zinssatz gemäß Konsortialvertrag (hier: 4,25 % p.a. fix).',
    handbuchRef: 'Kapitel 7.5 „Konditionsposition: Registerkarte Kopfdaten"',
    maskId: 'sap-finanzierung',
    breadcrumb: ['Finanzierungsarbeitsplatz', 'Finanzierung', 'Konditionen', 'Zinsvereinbarung'],
    tabTitle: 'Konditionsposition – Kopfdaten',
    tabs: [
      { label: 'Kopfdaten', active: true },
      { label: 'Beträge' },
      { label: 'Termine' },
      { label: 'Zahlungsdaten' },
      { label: 'Sonstige Daten' },
    ],
    fields: [
      { label: 'Konditionsart', value: 'Nominalzins fix' },
      { label: 'Konditionsform', value: 'Aktive Kondition' },
      { label: 'Effektivzins', value: '4,25 %', highlight: true },
      { label: 'Zinsmethode', value: 'act/360' },
      { label: 'Gültig ab', value: '15.05.2026' },
      { label: 'Gültig bis', value: '15.05.2031' },
    ],
    highlightedNote: 'Aus Konsortialvertrag § 5 Zinsen und Marge',
    mappedKeys: ['zinssatz'],
  },

  // ----------------------------------------------------------------
  {
    id: 'step-5-konditionen-tilgung',
    title: '5. Tilgung – Registerkarte Konditionen › Beträge / Termine',
    description:
      'Tilgungsrate und tilgungsfreie Zeit werden als separate Konditionspositionen erfasst. Die tilgungsfreie Zeit wird über das „Gültig ab"-Datum der Tilgungskondition abgebildet (Tilgung startet erst 12 Monate nach Valuta).',
    handbuchRef: 'Kapitel 7.6 „Registerkarte Beträge" und 7.7 „Registerkarte Termine"',
    maskId: 'sap-finanzierung',
    breadcrumb: ['Finanzierungsarbeitsplatz', 'Finanzierung', 'Konditionen', 'Tilgung'],
    tabTitle: 'Konditionsposition – Beträge und Termine',
    tabs: [
      { label: 'Kopfdaten' },
      { label: 'Beträge', active: true },
      { label: 'Termine' },
      { label: 'Zahlungsdaten' },
      { label: 'Sonstige Daten' },
    ],
    fields: [
      { label: 'Konditionsart', value: 'Ratentilgung' },
      { label: 'Konditionsbetrag (Rate)', value: '208.333,33 EUR', highlight: true },
      { label: 'Fest ab', value: '15.05.2027', highlight: true },
      { label: 'Fest bis', value: '15.05.2031' },
      { label: 'Gültig ab', value: '15.05.2027' },
      { label: 'Gültig bis', value: '15.05.2031' },
    ],
    highlightedNote:
      'Aus Konsortialvertrag § 6 Laufzeit und Tilgung. Tilgungsfreie Zeit = Differenz zwischen Valuta (15.05.2026) und Tilgungsbeginn (15.05.2027).',
    mappedKeys: ['rate', 'tilgungsfrei', 'laufzeit'],
  },

  // ----------------------------------------------------------------
  {
    id: 'step-6-ziehung',
    title: '6. Ziehung anlegen – Auszahlung des Kredits',
    description:
      'Die eigentliche Kapitalauszahlung erfolgt als Ziehung unter der Tranche. Ziehungsbetrag, Laufzeitbeginn (entspricht Valuta) und Auszahlungskurs werden hier gesetzt. Die offene Kreditlinie und Restkapitalhöhe wird anschließend im Finanzstrom geführt.',
    handbuchRef: 'Kapitel 5.1 „Anlegen von Ziehungen" und 5.2 „Felder in Ziehungen"',
    maskId: 'sap-ziehung',
    breadcrumb: ['Finanzierungsarbeitsplatz', 'Finanzierung', 'Tranche', 'Ziehung anlegen'],
    tabTitle: 'Ziehung – Allgemein und Termine',
    tabs: [
      { label: 'Allgemein', active: true },
      { label: 'Termine' },
      { label: 'Administrative Informationen' },
      { label: 'IFRS' },
    ],
    fields: [
      { label: 'Darlehensnehmer', value: 'Musterbau Industrie GmbH' },
      { label: 'Ziehungsprodukt', value: 'Konsortial-Ziehung Term Loan' },
      { label: 'Ziehungsbetrag', value: '15.000.000,00 EUR', highlight: true },
      { label: 'Währung', value: 'EUR' },
      { label: 'Laufzeitbeginn', value: '15.05.2026', highlight: true },
      { label: 'Laufzeitende', value: '15.05.2031' },
      { label: 'Auszahlungskurs', value: '100,00 %' },
      { label: 'Offene Kreditlinie / Restkapital', value: '12.500.000,00 EUR', highlight: true },
    ],
    highlightedNote:
      'Restkapital wird automatisch aus dem Finanzstrom ermittelt; initial entspricht es dem Ziehungsbetrag und reduziert sich mit jeder Tilgungsrate.',
    mappedKeys: ['restschuld'],
  },

  // ----------------------------------------------------------------
  {
    id: 'step-7-referenzen',
    title: '7. Sicherheiten hinterlegen – Registerkarte Referenzen',
    description:
      'Im Finanzierungsarbeitsplatz werden Sicherheiten als externe Referenzen gepflegt (z.B. Grundschulden, Sicherungsübereignungen). Die bestellten Sicherheiten werden mit Bezeichnung, Sicherungsobjekt und Nominalwert hinterlegt und in CMS-Systemen gespiegelt.',
    handbuchRef: 'Kapitel 3.1 „Anlegen einer Finanzierung" – Registerkarte Referenzen',
    maskId: 'sap-finanzierung',
    breadcrumb: ['Finanzierungsarbeitsplatz', 'Finanzierung', 'Referenzen'],
    tabTitle: 'Finanzierung – Referenzen',
    tabs: [
      { label: 'Übersicht' },
      { label: 'Konditionen' },
      { label: 'Partner' },
      { label: 'Syndizierung' },
      { label: 'Referenzen', active: true },
      { label: 'Covenants' },
    ],
    fields: [
      { label: 'Referenzart', value: 'Sicherheit', highlight: true },
      { label: 'Bezeichnung', value: 'Grundschuld Werksgelände Bremen', highlight: true },
      { label: 'Referenzbetrag', value: '15.000.000,00 EUR', highlight: true },
      { label: 'Rang', value: '1. Rang' },
      { label: 'Externe System-ID', value: 'CMS-BRE-GS-00042' },
    ],
    highlightedNote: 'Aus Konsortialvertrag § 7 Sicherheiten',
    mappedKeys: ['sicherheit_art', 'sicherheit_bezeichnung', 'sicherheit_wert'],
  },

  // ----------------------------------------------------------------
  {
    id: 'step-8-covenants',
    title: '8. Financial Covenants erfassen – Registerkarte Covenants',
    description:
      'Auf der Registerkarte Covenants werden vertragliche Auflagen (Net Debt/EBITDA, Zinsdeckung, Eigenkapitalquote) mit Schwellenwerten und Prüfungsfrequenz hinterlegt. Bei Covenant-Bruch kann das System automatisch vordefinierte Vertragsfolgen auslösen (z.B. Zinserhöhung, Sperren).',
    handbuchRef: 'Kapitel 3.1 „Anlegen einer Finanzierung" – Registerkarte Covenants',
    maskId: 'sap-finanzierung',
    breadcrumb: ['Finanzierungsarbeitsplatz', 'Finanzierung', 'Covenants'],
    tabTitle: 'Finanzierung – Covenants',
    tabs: [
      { label: 'Übersicht' },
      { label: 'Konditionen' },
      { label: 'Partner' },
      { label: 'Syndizierung' },
      { label: 'Referenzen' },
      { label: 'Covenants', active: true },
    ],
    fields: [
      { label: 'Covenant', value: 'Net Debt / EBITDA', highlight: true },
      { label: 'Schwellenwert', value: 'max. 3,50x', highlight: true },
      { label: 'Prüfungsfrequenz', value: 'halbjährlich' },
      { label: 'Heilungsfrist', value: '30 Bankarbeitstage' },
      { label: 'Vertragsfolge bei Bruch', value: 'Zinserhöhung +100 bp' },
    ],
    highlightedNote: 'Aus Konsortialvertrag § 8 Financial Covenants',
    mappedKeys: ['covenant'],
  },
];
