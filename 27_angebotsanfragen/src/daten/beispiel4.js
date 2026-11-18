/**
 * Beispiel 4 – „Manuelle Anfrage“ über eine Vermittlerplattform, als Scan
 * (sieben Seiten Bild, kein Text im PDF).
 *
 * Betriebshaftpflicht für Kräuterkurse und kleine Naturprodukte. Die
 * Plattform hat die Anfrage selbst ausgesteuert. Inhalt wie in der
 * verfremdeten Beispielanfrage; die Agenturnummer ist an beiden Stellen
 * derselbe Platzhalter.
 *
 * „Ihre Daten“ auf Seite 6 sind die Daten des Versicherers, wie sie der
 * Vertriebspartner hinterlegt hat. Der Kontakt für Rückfragen steht auf
 * Seite 1 beim Vertriebspartner.
 */

import { p, titel, untertitel, h, h2, linie, liste, kontakt, spalten, tabelle, abschnitt, zeile, wahl, an, aus } from './bausteine.js'

const seite1 = [
  titel('[[vorgangsart|Manuelle Anfrage]]', { ort: 'Kopf der Anfrage' }),
  untertitel('von [[vermittler|BCA-Gewerbe]]'),
  linie(),
  h('Anfragedaten', { ort: 'Anfragedaten' }),
  spalten([
    { icon: 'kalender', text: '13.11.2026,\n10:24 Uhr' },
    { icon: 'schild', text: '[[sparte|Betriebshaftpflicht]]' },
    { icon: 'punkt', breit: true, text: '[[ba1|Kräuterkurs für Kinder]], verarbeiten Wild- und Küchenkräuter, basteln, lernen und [[ba2|stellen kleine Kräuterprodukte her]].' },
    { text: 'ID\n[[anfrageId|9876543]]', klein: true },
    { logo: '{logoGross}', klein: '{logoKlein}' }
  ]),
  linie(),
  h('Versicherungsnehmer', { ort: 'Versicherungsnehmer' }),
  p('[[vnName|Musterfirma Naturkurse GmbH]]', 'winzig'),
  p('Max Mustermann\n[[vnAdresse|Musterstr. 1\n12345 Musterstadt]]', 'winzig'),
  kontakt([
    { icon: 'mail', text: '[[vnEmail|max.mustermann@example.com]]' },
    { icon: 'telefon', text: '[[vnTelefon|01234567890]]' }
  ]),
  h('Vertriebspartner', { ort: 'Vertriebspartner' }),
  p('BCA-Gewerbe    (Agenturnummer [[agenturnummer|123.45.6789]])', 'fett'),
  p('[[ansprechpartner|Musteragentur Gewerbeabteilung]]\nMusterallee 10\n12345 Musterstadt', 'winzig'),
  kontakt([
    { icon: 'mail', text: '[[vermittlerEmail|kontakt@musteragentur.de]]' },
    { icon: 'telefon', text: '[[vermittlerTelefon|01234567891]]' }
  ]),
  h2('Aussteuerungsgründe', { ort: 'Aussteuerungsgründe' }),
  liste([
    '[[a1|Andere, sonstige Tätigkeit ausgewählt]]',
    '[[a1|Bedarf einer individuellen Risikoprüfung]] (Diese Meldung ist für den Account nicht sichtbar.)'
  ], 'warnung')
]

const seite2 = [
  h('Risikoangaben', { ort: 'Risikoangaben' }),
  tabelle([
    abschnitt('Angaben zum Betrieb'),
    zeile('Zu versichernder Standort/Sitz', '[[rf1|Hauptstandort mit Sitz in Deutschland ohne weitere Niederlassungen]]'),
    zeile('Postleitzahl des zu versichernden Unternehmens', '12345'),
    zeile('Betriebsbeschreibung', 'Ich [[ba1|gebe Kurse für Kinder / Erwachsene]]. Wir [[ba2,a5|stellen kleine Naturprodukte her]]. Wir verwenden Wild- und Küchenkräuter, [[a5|backen]], basteln, [[a5|kochen]], malen, lernen und sind kreativ.'),
    wahl('Tätigkeitsbereich(e)', [
      aus('Handwerk'), aus('Baugewerbe'), aus('Handel'), aus('Heil(neben)'), aus('Beauty/Wellness'),
      aus('Schule/Trainer/Verein'), aus('Land-/Forstwirtschaft'), an('[[a2|Kreativ/Gestalterisch]]'),
      aus('Wirtschaft'), aus('Technik'), aus('Gastronomie/Beherbergung'), aus('Sonstige')
    ], 'haken'),
    zeile('Datum der Betriebsgründung', '[[rf2,a4|12.11.2026]]'),
    abschnitt('Gewünschter Versicherungsschutz (Basisdaten)'),
    zeile('Deckungssumme', '[[vs|Min. 5 Mio. €]]'),
    zeile('Selbstbeteiligung', '[[sb|Max. 0 €]]'),
    zeile('Sonstige Informationen (maximal 1.000 Zeichen)', ''),
    zeile('Relevantes Dokument für die Bearbeitung', ''),
    zeile('Bevorzugte Versicherer für die Ausschreibung', ''),
    abschnitt('Inhaber und Angestellte'),
    zeile('Anzahl Inhaber/ Geschäftsführer', '[[vollzeit|1]]'),
    zeile('Anzahl Vollzeitmitarbeiter', '[[vollzeit,a3|0]]'),
    zeile('Anzahl Teilzeitmitarbeiter', '[[teilzeit,a3|0]]')
  ])
]

const seite3 = [
  tabelle([
    abschnitt('Angaben zur Tätigkeit'),
    zeile('Hauptauftraggeber vorhanden (ab 75%)', '[[rf3|Nein]]'),
    zeile('Durchführung von Reparaturen', '[[rf4|Nein]]'),
    zeile('Aufbau-, Einbau- oder Montagearbeiten', '[[rf5|Nein]]'),
    abschnitt('Betriebsstätte'),
    zeile('Besitz von umweltgefährdenden Anlagen', '[[rf6|Nein]]'),
    zeile('Lagerung von umweltgefährdenden Stoffen', '[[rf7|Nein]]'),
    zeile('Besitz von nicht versicherungspflichtigen Arbeitsmaschinen', '[[rf8|Nein]]'),
    abschnitt('Tätigkeiten im Ausland'),
    zeile('Durchführung von Tätigkeiten im Ausland', '[[rf9|Nein]]'),
    abschnitt('Produkthaftung'),
    zeile('Verkauf von Waren ausschließlich an Endverbraucher', '[[rf10,a5|Ja]]'),
    zeile('Vertrieb von nicht selbst hergestellten Waren unter eigenem Markennamen', '[[rf11|Nein]]'),
    zeile('Direkter Import von Waren aus Nicht-EU-Ländern', '[[rf12|Nein]]'),
    zeile('Export von Waren ins Ausland', '[[rf13|Nein]]'),
    zeile('Durchführung von Lohnbe- und/oder -verarbeitung', '[[rf14|Nein]]'),
    wahl('Im Rahmen der Tätigkeit...', [
      aus('keine der Genannten'),
      an('[[rf15,a5|werden Produkte hergestellt]]'),
      an('[[rf15|wird handwerklich gearbeitet]]'),
      aus('wird Handel mit Produkten betrieben')
    ], 'haken'),
    abschnitt('Gewünschter Versicherungsschutz'),
    zeile('Gewünschter Versicherungsbeginn', '[[beginn,a4|14.11.2026]]'),
    zeile('Einschluss | Privathaftpflichtversicherung (PHV)', '[[phv|Ja]]'),
    zeile('Einschluss | Versicherungsschutz für gewerblich genutzte Flugdrohnen bis 5kg', '[[rf16|Nein]]')
  ], { ort: 'Risikoangaben' })
]

const seite4 = [
  tabelle([
    abschnitt('Vorversicherung'),
    zeile('(Unmittelbare) Vorversicherung in den letzten 5 Jahren', '[[vorversicherung|Nein]]'),
    zeile('Ablehnung eines vergleichbaren Antrages in der Vergangenheit', '[[vvAblehnungen|Nein]]'),
    abschnitt('Vorschäden'),
    zeile('Haftpflichtansprüche in den letzten 5 Jahren', '[[vorschaeden|Keine]]'),
    abschnitt('Betriebsgröße #1'),
    zeile('Jahresumsatz/ Jahreshonorar (ohne USt., in €)', '[[umsatz|8.000,00 €]]'),
    zeile('Geschätzte jährliche Lohn- und Gehaltskosten (inkl. Lohnnebenkosten, in €)', '[[lohnsumme,a3|4.000,00 €]]')
  ], { ort: 'Vorversicherung, Vorschäden, Betriebsgröße' })
]

const seite5 = [h('Interne Notizen', { ort: 'Interne Notizen' })]

const seite6 = [
  h('Ihre Daten', { ort: 'Ihre Daten (vom Vertriebspartner hinterlegt)' }),
  tabelle([
    zeile('Kontakt Ausschreibung', 'Max Mustermann'),
    zeile('Betreute Sparten', 'Betriebshaftpflichtversicherung'),
    zeile('Agenturnummer', '[[agenturnummer|123.45.6789]]'),
    zeile('E-Mail', 'max.mustermann@example.com'),
    zeile('Telefonnummer', '01234567890')
  ]),
  p('Hinweis: Diese Angaben wurden vom Partner hinterlegt. Eine notwendige Änderung der Angaben kann über diesen angestoßen werden. Die Kontaktdaten des Vertragsansprechpartner befinden sich oben in der Anfrage.')
]

const seite7 = [h('Nachrichten', { ort: 'Nachrichten' })]

export default {
  id: 'ANG-2026-2104',
  beispiel: 4,
  eingang: '13.11.2026',
  uhrzeit: '10:24',
  kanal: 'Vermittlerplattform',
  form: 'Plattform-Anfrage als Scan',
  produkt: 'bhv',
  vorgangsart: 'Angebotsanfrage',
  kunde: 'Musterfirma Naturkurse GmbH',
  mail: {
    vonName: 'BCA-Gewerbe',
    von: 'kontakt@musteragentur.de',
    an: '{postfach}',
    betreff: 'Manuelle Anfrage Betriebshaftpflicht – ID 9876543',
    vorschau: 'Kräuterkurs für Kinder, verarbeiten Wild- und Küchenkräuter, basteln, lernen und stellen kleine Kräuterprodukte her …',
    anhaenge: [
      { name: 'Angebotsanfrage_BCA-Gewerbe.pdf', typ: 'Scan, 7 Seiten', info: 'Bild-PDF ohne Textebene, per Texterkennung gelesen' }
    ]
  },
  dokumente: [
    { id: 'b4-anfrage', titel: 'Plattform-Anfrage', art: 'Scan, 7 Seiten, ohne Textebene', stil: 'plattform', scan: true, seiten: [seite1, seite2, seite3, seite4, seite5, seite6, seite7] }
  ],
  felder: {
    vorgangsart: { w: 'Angebotsanfrage', art: 'interpretiert', h: 'Manuelle Anfrage über die Vermittlerplattform mit Risikoangaben und gewünschtem Versicherungsschutz' },
    sparte: 'Betriebshaftpflicht',
    vermittler: 'BCA-Gewerbe',
    ansprechpartner: { w: 'Musteragentur Gewerbeabteilung', art: 'interpretiert', h: 'Abteilung des Vertriebspartners; eine Person ist nicht genannt' },
    vermittlerEmail: 'kontakt@musteragentur.de',
    vermittlerTelefon: '01234567891',
    anfrageId: 'ID 9876543',
    agenturnummer: { w: '123.45.6789', h: 'Steht auf Seite 1 beim Vertriebspartner und auf Seite 6 unter „Ihre Daten“' },
    beginn: '14.11.2026',
    phv: { w: 'Ja', h: 'Einschluss der Privathaftpflicht ist gewünscht' },
    umsatz: '8.000,00 €',
    lohnsumme: '4.000,00 €',
    vollzeit: { w: '1', art: 'interpretiert', h: '1 Inhaber/Geschäftsführer + 0 Vollzeitmitarbeiter' },
    teilzeit: '0',
    vs: { w: 'mindestens 5 Mio. €', h: 'Angabe „Min. 5 Mio. €“' },
    sb: { w: '0 €', h: 'Angabe „Max. 0 €“' },
    vorversicherung: 'Nein',
    vvAblehnungen: 'Nein',
    vorschaeden: 'Keine',
    vnName: 'Musterfirma Naturkurse GmbH',
    vnAdresse: 'Musterstr. 1, 12345 Musterstadt',
    vnTelefon: '01234567890',
    vnEmail: 'max.mustermann@example.com'
  },
  betriebsarten: [
    { key: 'ba1', bezeichnung: 'Kräuterkurse für Kinder und Erwachsene', anteil: '', treffer: 'offen', begruendung: 'Kurse mit Kindern; in der Plattform ist nur „Kreativ/Gestalterisch“ gewählt, nicht „Schule/Trainer/Verein“.' },
    { key: 'ba2', bezeichnung: 'Herstellung kleiner Kräuter- und Naturprodukte', anteil: '', treffer: 'offen', begruendung: 'Was hergestellt wird (Lebensmittel, Kosmetik, Dekoration), geht aus der Anfrage nicht hervor.' }
  ],
  betriebsartNotiz: 'Zwei Tätigkeiten ohne passende Bezeichnung in der Liste und ohne Aufteilung.',
  risikofragen: [
    { key: 'rf1', frage: 'Zu versichernder Standort', antwort: 'Hauptstandort in Deutschland, keine weiteren Niederlassungen' },
    { key: 'rf2', frage: 'Betriebsgründung', antwort: '12.11.2026' },
    { key: 'rf3', frage: 'Hauptauftraggeber vorhanden (ab 75 %)', antwort: 'Nein' },
    { key: 'rf4', frage: 'Durchführung von Reparaturen', antwort: 'Nein' },
    { key: 'rf5', frage: 'Aufbau-, Einbau- oder Montagearbeiten', antwort: 'Nein' },
    { key: 'rf6', frage: 'Besitz von umweltgefährdenden Anlagen', antwort: 'Nein' },
    { key: 'rf7', frage: 'Lagerung von umweltgefährdenden Stoffen', antwort: 'Nein' },
    { key: 'rf8', frage: 'Nicht versicherungspflichtige Arbeitsmaschinen', antwort: 'Nein' },
    { key: 'rf9', frage: 'Tätigkeiten im Ausland', antwort: 'Nein' },
    { key: 'rf10', frage: 'Verkauf von Waren ausschließlich an Endverbraucher', antwort: 'Ja' },
    { key: 'rf11', frage: 'Vertrieb fremder Waren unter eigenem Markennamen', antwort: 'Nein' },
    { key: 'rf12', frage: 'Direkter Import aus Nicht-EU-Ländern', antwort: 'Nein' },
    { key: 'rf13', frage: 'Export von Waren ins Ausland', antwort: 'Nein' },
    { key: 'rf14', frage: 'Lohnbe- oder -verarbeitung', antwort: 'Nein' },
    { key: 'rf15', frage: 'Im Rahmen der Tätigkeit', antwort: 'Produkte werden hergestellt, es wird handwerklich gearbeitet' },
    { key: 'rf16', frage: 'Gewerblich genutzte Flugdrohnen bis 5 kg', antwort: 'Nein' }
  ],
  auffaelligkeiten: [
    {
      key: 'a1', titel: 'Aussteuerung durch die Plattform', wirkung: 'sonderfall',
      text: 'Die Plattform nennt selbst zwei Aussteuerungsgründe: „Andere, sonstige Tätigkeit ausgewählt“ und „Bedarf einer individuellen Risikoprüfung“.'
    },
    {
      key: 'a2', titel: 'Tätigkeitsbereich passt nur teilweise', wirkung: 'hinweis',
      text: 'Gewählt ist allein „Kreativ/Gestalterisch“. Kurse für Kinder und Erwachsene und die Herstellung von Produkten sind damit nicht abgebildet.'
    },
    {
      key: 'a3', titel: 'Lohnkosten ohne Beschäftigte', wirkung: 'rueckfrage',
      text: 'Angegeben sind 4.000,00 € Lohn- und Gehaltskosten, aber 0 Vollzeit- und 0 Teilzeitmitarbeiter.',
      frage: 'Wofür fallen die 4.000,00 € Lohn- und Gehaltskosten an, wenn keine Mitarbeiter beschäftigt sind (Geschäftsführergehalt, Aushilfen)?'
    },
    {
      key: 'a4', titel: 'Neugründung mit sofortigem Beginn', wirkung: 'hinweis',
      text: 'Betriebsgründung am 12.11.2026, Anfrage vom 13.11.2026, gewünschter Beginn 14.11.2026.'
    },
    {
      key: 'a5', titel: 'Produkthaftung', wirkung: 'hinweis',
      text: 'Es werden Produkte hergestellt und ausschließlich an Endverbraucher verkauft; es wird gebacken und gekocht. Ob Lebensmittel abgegeben werden, ist für die Einstufung wesentlich.'
    }
  ],
  gesamteinschaetzung: 'Neu gegründete GmbH mit einem Geschäftsführer und 8.000 € Jahresumsatz: Kräuterkurse für Kinder und Erwachsene sowie kleine selbst hergestellte Naturprodukte für Endverbraucher. Die Tätigkeit lässt sich keiner Betriebsart der Liste eindeutig zuordnen, und die Plattform hat die Anfrage selbst zur individuellen Risikoprüfung ausgesteuert. Der Fall geht mit dem Deckblatt an die Fachspezialisten.'
}
