/**
 * Betriebsartenliste – Auszug für die Demo.
 *
 * Die Vorgabe verlangt, die Tätigkeit „vollständig anhand der
 * Betriebsartenliste“ zu prüfen. Die Liste des Angebotssystems ist in dieser
 * Umgebung nicht hinterlegt; hier steht ein frei zusammengestellter Auszug,
 * gegen den die Demo-Eingänge zugeordnet sind. Im Piloten tritt die echte
 * Liste an seine Stelle.
 */

export const BETRIEBSARTEN = [
  {
    gruppe: 'Handwerk und Bau',
    eintraege: [
      'Installationsbetrieb (Gas, Wasser, Sanitär, Heizung, Lüftung)',
      'Fliesen-, Platten- und Mosaikleger',
      'Maler- und Lackiererbetrieb',
      'Elektroinstallation',
      'Dachdeckerei',
      'Tischlerei, Schreinerei',
      'Metallbau, Schlosserei',
      'Garten- und Landschaftsbau',
      'Messebau und Messeausstattung'
    ]
  },
  {
    gruppe: 'Werbung und Druck',
    eintraege: [
      'Werbetechnik: Schilder- und Lichtreklameherstellung',
      'Werbeagentur, Grafik- und Webdesign',
      'Fahrzeugbeschriftung und Fahrzeugfolierung',
      'Textilveredelung (Textildruck, Bestickung)',
      'Druckerei',
      'Fotostudio'
    ]
  },
  {
    gruppe: 'Handel',
    eintraege: [
      'Handel mit Werbeartikeln',
      'Einzelhandel mit Fahrrädern, mit Werkstatt',
      'Einzelhandel mit Bekleidung',
      'Einzelhandel mit Lebensmitteln'
    ]
  },
  {
    gruppe: 'Gastronomie und Lebensmittel',
    eintraege: [
      'Bäckerei mit Backstube',
      'Café',
      'Restaurant',
      'Imbiss',
      'Shisha-Bar, Shisha-Café'
    ]
  },
  {
    gruppe: 'Gesundheit und Körperpflege',
    eintraege: [
      'Zahnarztpraxis',
      'Physiotherapiepraxis',
      'Friseursalon',
      'Kosmetikstudio'
    ]
  },
  {
    gruppe: 'Büro und freie Berufe',
    eintraege: [
      'Ingenieurbüro (Bau- und Tragwerksplanung)',
      'Steuerberatung',
      'IT-Dienstleistungen',
      'Seminar- und Kursanbieter (Erwachsenenbildung)',
      'Gebäudereinigung',
      'Hausmeisterservice'
    ]
  },
  {
    gruppe: 'Gebäude',
    eintraege: [
      'Wohngebäude: Mehrfamilienhaus, vermietet',
      'Büro- und Geschäftsgebäude',
      'Lagerhalle (Lagerung und Umschlag von Stückgut)',
      'Werkstattgebäude'
    ]
  }
]

export const ALLE_BETRIEBSARTEN = BETRIEBSARTEN.flatMap(g => g.eintraege)
