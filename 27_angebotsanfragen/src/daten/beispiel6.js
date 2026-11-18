/**
 * Beispiel 6 – „Manuelle Anfrage“ über eine Vermittlerplattform, als Scan
 * (fünf Seiten Bild, kein Text im PDF, geringe Auflösung).
 *
 * Elektronikversicherung (pauschal) für einen Gasthof mit Übernachtung. Die
 * Plattform hat die Anfrage aus zwei Gründen ausgesteuert: Die gewünschte
 * Betriebsunterbrechung ist im Tarif nicht enthalten, und der Vorvertrag wurde
 * vom Versicherer gekündigt.
 *
 * Die Seiten stehen hier in der Reihenfolge des gelieferten PDF. Dort sind die
 * Seiten 2 und 3 vertauscht: Seite 3 beginnt mit den Risikoangaben, Seite 2
 * setzt die Deckungserweiterungen fort, die am Ende von Seite 3 beginnen.
 *
 * „Ihre Daten“ auf der letzten Seite sind die Daten des Versicherers, wie sie
 * der Vertriebspartner hinterlegt hat (Agenturnummer, Postfach). Der Kontakt
 * des Vertriebspartners steht auf Seite 1.
 */

import { p, titel, untertitel, h, h2, linie, liste, kontakt, spalten, tabelle, abschnitt, zeile, wahl, an, aus } from './bausteine.js'

const seite1 = [
  titel('[[vorgangsart|Manuelle Anfrage]]', { ort: 'Kopf der Anfrage' }),
  untertitel('von [[vermittler|Beispiel Maklerservice GmbH]]'),
  linie(),
  h('Anfragedaten', { ort: 'Anfragedaten' }),
  spalten([
    { icon: 'kalender', text: '12.11.2026,\n10:03 Uhr' },
    { icon: 'schild', text: '[[sparte|Elektronik\n(pauschal)]]' },
    { icon: 'gebaeude', text: '[[ba1|Gasthof (mit\nÜbernachtung)]]' },
    { text: 'ID\n[[anfrageId|7654321]]' },
    { logo: '{logoGross}', klein: '{logoKlein}' }
  ]),
  linie(),
  h('Versicherungsnehmer', { ort: 'Versicherungsnehmer' }),
  p('[[vnName|Musterhotel Sonnenblick]]', 'fett'),
  p('Max Mustermann\n[[vnAdresse|Musterstr. 1\n12345 Musterstadt]]'),
  kontakt([
    { icon: 'mail', text: '[[vnEmail|max.mustermann@example.com]]' },
    { icon: 'telefon', text: '[[vnTelefon|0123456789]]' }
  ]),
  h('Vertriebspartner', { ort: 'Vertriebspartner' }),
  p('Beispiel Maklerservice GmbH    (Agenturnummer [[agenturnummer|123 45 6789]])', 'fett'),
  p('[[ansprechpartner|Produktberatung]]\nBeispielweg 25\n54321 Beispielstadt'),
  kontakt([
    { icon: 'mail', text: '[[vermittlerEmail|kontakt@example.com]]' },
    { icon: 'telefon', text: 'Gewerbe-Sach: [[vermittlerTelefon|01234 567890]]' }
  ]),
  h2('Aussteuerungsgründe', { ort: 'Aussteuerungsgründe' }),
  liste([
    '[[a1|Mitversicherung einer Betriebsunterbrechung nicht im Tarif enthalten]]',
    '[[a2|Vorvertrag durch Versicherer gekündigt]]'
  ], 'warnung')
]

// Im PDF die zweite Seite, im Formular die dritte: Sie setzt die Liste fort, die auf Seite 3 beginnt.
const seite2 = [
  tabelle([
    abschnitt('[[a5|Deckungserweiterungen zur Elektronikversicherung]]'),
    wahl('', [
      an('[[rf5|Mehrkosten]]'),
      an('[[rf5,a1|Betriebsunterbrechung]]'),
      aus('Photovoltaikanlagen'),
      an('[[rf5,a4|Datenträger/Software]]')
    ], 'haken'),
    zeile('Versicherungssumme Betriebsunterbrechung (in €)', '[[rf6,a1|340.000,00 €]]'),
    zeile('Versicherungssumme Mehrkosten (in €)', '[[rf7|5.000,00 €]]'),
    zeile('Versicherungssumme für Datenträger/ Software (in €)', '[[rf8,a4|5.000,00 €]]'),
    zeile('Häufigkeit der Datensicherung', '[[rf9|täglich]]'),
    zeile('Auslagerung der Sicherungsdatenträger in einen anderen Gefahren-/ Feuerbereich', '[[rf10,a4|Nein]]'),
    zeile('Lagerung in geprüften Datensicherungsschränken', '[[rf11,a4|Nein]]'),
    abschnitt('Ermittlung der Versicherungssumme'),
    zeile('Versicherungssumme für Daten- und Kommunikationstechnik, Bürotechnik (in €)', '[[rf12,vsElektronik|10.000,00 €]]'),
    wahl('Weitere Anlagegruppen', [
      aus('Keine der genannten'),
      aus('Satz- und Reprotechnik'),
      an('[[rf13|Bild- und Tontechnik]]'),
      aus('Medizintechnik'),
      aus('Mess- und Prüftechnik, Prozessrechner, Kassen, Waagen')
    ], 'haken'),
    zeile('Versicherungssumme für Bild- und Tontechnik (in €)', '[[rf14,vsElektronik|7.500,00 €]]'),
    zeile('Pauschale Versicherungssumme (in €)', '[[vsElektronik,vs|17.500,00 €]]'),
    abschnitt('Risikoort'),
    zeile('Straße und Hausnummer des Versicherungsortes', '[[betriebsstaette|Musterstr. 1]]'),
    zeile('Postleitzahl und Stadt des Versicherungsortes', '[[betriebsstaette|12345 Musterstadt]]'),
    zeile('Befindet sich der Hauptstandort innerhalb der BRD?', '[[rf15|Ja]]'),
    abschnitt('Allgemeine Fragen zur Risikobeurteilung'),
    zeile('ZÜRS-Zone', '[[rf16|Zürs-Zone 1]]')
  ], { ort: 'Deckungserweiterungen, Versicherungssumme, Risikoort' })
]

// Im PDF die dritte Seite, im Formular die zweite.
const seite3 = [
  h('[[a5|Risikoangaben]]', { ort: 'Risikoangaben' }),
  tabelle([
    abschnitt('Angaben zum Betrieb'),
    zeile('Adresssuche', ''),
    zeile('Straße des Versicherungsortes', 'Musterstr.'),
    zeile('Hausnummer des Versicherungsortes', '1'),
    zeile('Postleitzahl', '12345'),
    zeile('Stadt des Versicherungsortes', 'Musterstadt'),
    zeile('Datum der Betriebsgründung', '[[rf1,a3|01.01.2011]]'),
    abschnitt('Gewünschter Versicherungsschutz (Basisdaten)'),
    zeile('Selbstbeteiligung', '[[sb|Max. 0 €]]'),
    zeile('Sonstige Informationen (maximal 1.000 Zeichen)', ''),
    zeile('Relevantes Dokument für die Bearbeitung', ''),
    abschnitt('Versicherungsschutz der Elektronikversicherung'),
    zeile('Gewünschter Versicherungsbeginn', '[[beginn|01.12.2026]]'),
    wahl('Ausschluss einzelner Gefahren', [
      an('[[rf2|Keine der genannten]]'),
      aus('Feuer'), aus('Leitungswasser'), aus('Einbruchdiebstahl')
    ], 'haken'),
    zeile('Versicherungsschutz außerhalb des Versicherungsortes (Außenversicherung)', '[[rf3|Nein]]'),
    zeile('Mitversicherung vermieteter, verliehener oder zu Vorführzwecken eingesetzter Geräte', '[[rf4|Nein]]'),
    abschnitt('Gewünschte Vertragslaufzeit'),
    zeile('Vertragslaufzeit', '[[laufzeit|1 Jahr]]'),
    abschnitt('Details zum Unternehmen'),
    zeile('Datum der Betriebsgründung', '[[rf1,a3|01.12.2010]]'),
    abschnitt('Deckungserweiterungen zur Elektronikversicherung'),
    wahl('Gewünschte Deckungserweiterungen', [aus('Keine der genannten Deckungserweiterungen')], 'haken')
  ])
]

const seite4 = [
  tabelle([
    abschnitt('Allgemeine Fragen zur Risikobeurteilung'),
    zeile('Gefahrerhöhende Betriebe innerhalb von 15m', '[[rf17|Nein]]'),
    zeile('Wohn- und Betriebsgebäude im Umkreis von 300m', '[[rf18|Ja]]'),
    zeile('Alle Außentüren verfügen über bündig abschließende Zylinderschlösser mit von außen nicht abschraubbaren Beschlägen', '[[rf19|Ja]]'),
    zeile('Ganzglastüren sind mit 2 Schlössern der vorbezeichneten Art versehen, deren Riegel in Boden und Decke greifen', '[[rf20|Ja]]'),
    abschnitt('Vorversicherung'),
    zeile('(Unmittelbare) Vorversicherung in den letzten 5 Jahren', '[[vorversicherung|Ja]]'),
    zeile('Auswahl des Vorversicherers', '[[vvVersicherer|Zurich]]'),
    zeile('Status der Vorversicherung', '[[vvStatus,a2|Vertrag durch Versicherer gekündigt]]'),
    zeile('Kündigungsgrund (Versicherer)', '[[vvStatus,a2|Ablauf]]'),
    zeile('Ablehnung eines vergleichbaren Antrages in der Vergangenheit', '[[vvAblehnungen|Nein]]'),
    zeile('Jahresbruttobeitrag Vorversicherer (in €)', '[[vvJahresbeitrag|3.550,00 €]]'),
    zeile('Versicherungsscheinnummer der Vorversicherung', '[[vvScheinnummer|987.654.321.000]]'),
    abschnitt('Vorschäden'),
    zeile('Vorschäden in den letzten 5 Jahren (auch unversicherte)', '[[vorschaeden|Nein]]')
  ], { ort: 'Risikobeurteilung, Vorversicherung, Vorschäden' })
]

const seite5 = [
  h('Ihre Daten', { ort: 'Ihre Daten (vom Vertriebspartner hinterlegt)' }),
  tabelle([
    zeile('Kontakt Ausschreibung', 'Keine Angabe'),
    zeile('Betreute Sparten', '[[sparte|Elektronik (pauschal)]]'),
    zeile('Agenturnummer', '[[agenturnummer|123 45 6789]]'),
    zeile('E-Mail', 'makler-sach@example.com'),
    zeile('Telefonnummer', 'Keine Angabe')
  ]),
  p('Hinweis: Diese Angaben wurden vom Partner hinterlegt. Eine notwendige Änderung der Angaben kann über diesen angestoßen werden. Die Kontaktdaten des Vertragsansprechpartner befinden sich oben in der Anfrage.')
]

export default {
  id: 'ANG-2026-2106',
  beispiel: 6,
  eingang: '12.11.2026',
  uhrzeit: '10:03',
  kanal: 'Vermittlerplattform',
  form: 'Plattform-Anfrage Elektronik als Scan',
  produkt: 'elektronik',
  vorgangsart: 'Angebotsanfrage',
  kunde: 'Musterhotel Sonnenblick',
  mail: {
    vonName: 'Beispiel Maklerservice GmbH',
    von: 'kontakt@example.com',
    an: '{postfach}',
    betreff: 'Manuelle Anfrage Elektronik (pauschal) – ID 7654321',
    vorschau: 'Musterhotel Sonnenblick, Gasthof mit Übernachtung, Elektronik pauschal 17.500,00 €, Betriebsunterbrechung gewünscht …',
    anhaenge: [
      { name: 'Angebotsanfrage_Beispiel-Maklerservice.pdf', typ: 'Scan, 5 Seiten', info: 'Bild-PDF ohne Textebene, per Texterkennung gelesen' }
    ]
  },
  dokumente: [
    { id: 'b6-anfrage', titel: 'Plattform-Anfrage', art: 'Scan, 5 Seiten, ohne Textebene', stil: 'plattform', scan: true, seiten: [seite1, seite2, seite3, seite4, seite5] }
  ],
  felder: {
    vorgangsart: { w: 'Angebotsanfrage', art: 'interpretiert', h: 'Manuelle Anfrage über die Vermittlerplattform mit Risikoangaben und gewünschtem Versicherungsschutz' },
    sparte: 'Elektronik (pauschal)',
    vermittler: 'Beispiel Maklerservice GmbH',
    ansprechpartner: { w: 'Produktberatung', art: 'interpretiert', h: 'Abteilung des Vertriebspartners; eine Person ist nicht genannt' },
    vermittlerEmail: 'kontakt@example.com',
    vermittlerTelefon: { w: '01234 567890', h: 'Durchwahl „Gewerbe-Sach“ des Vertriebspartners' },
    anfrageId: 'ID 7654321',
    agenturnummer: { w: '123 45 6789', h: 'Steht auf Seite 1 beim Vertriebspartner und auf Seite 5 unter „Ihre Daten“' },
    beginn: '01.12.2026',
    laufzeit: '1 Jahr',
    betriebsstaette: { w: 'Musterstr. 1, 12345 Musterstadt', h: 'Risikoort; gleich der Anschrift des Versicherungsnehmers' },
    vsElektronik: { w: '17.500,00 €', h: 'Pauschale Versicherungssumme: 10.000,00 € Daten-, Kommunikations- und Bürotechnik plus 7.500,00 € Bild- und Tontechnik' },
    vs: { w: '17.500,00 €', h: 'Pauschale Versicherungssumme wie in Abschnitt 5; die Summen der Deckungserweiterungen stehen bei den Risikofragen' },
    sb: { w: '0 €', h: 'Angabe „Max. 0 €“' },
    vorversicherung: 'Ja',
    vvVersicherer: 'Zurich',
    vvStatus: { w: 'Vertrag durch Versicherer gekündigt, Kündigungsgrund: Ablauf', h: 'Status und Kündigungsgrund stehen in zwei Zeilen' },
    vvJahresbeitrag: '3.550,00 €',
    vvScheinnummer: '987.654.321.000',
    vvAblehnungen: 'Nein',
    vorschaeden: 'Nein',
    vnName: 'Musterhotel Sonnenblick',
    vnAdresse: 'Musterstr. 1, 12345 Musterstadt',
    vnTelefon: '0123456789',
    vnEmail: 'max.mustermann@example.com'
  },
  betriebsarten: [
    { key: 'ba1', bezeichnung: 'Gasthof (mit Übernachtung)', anteil: '', treffer: 'exakt', begruendung: 'Auf der Plattform als Betriebsart gewählt. Der Betrieb nennt sich Hotel; Beherbergung mit Gastronomie passt dazu.' }
  ],
  risikofragen: [
    { key: 'rf1', frage: 'Betriebsgründung', antwort: '01.01.2011, an anderer Stelle 01.12.2010' },
    { key: 'rf2', frage: 'Ausschluss einzelner Gefahren', antwort: 'Keine der genannten (Feuer, Leitungswasser, Einbruchdiebstahl bleiben versichert)' },
    { key: 'rf3', frage: 'Außenversicherung', antwort: 'Nein' },
    { key: 'rf4', frage: 'Vermietete, verliehene oder zu Vorführzwecken eingesetzte Geräte', antwort: 'Nein' },
    { key: 'rf5', frage: 'Gewünschte Deckungserweiterungen', antwort: 'Mehrkosten, Betriebsunterbrechung, Datenträger/Software' },
    { key: 'rf6', frage: 'Versicherungssumme Betriebsunterbrechung', antwort: '340.000,00 €' },
    { key: 'rf7', frage: 'Versicherungssumme Mehrkosten', antwort: '5.000,00 €' },
    { key: 'rf8', frage: 'Versicherungssumme Datenträger/Software', antwort: '5.000,00 €' },
    { key: 'rf9', frage: 'Häufigkeit der Datensicherung', antwort: 'täglich' },
    { key: 'rf10', frage: 'Auslagerung der Sicherungsdatenträger in einen anderen Gefahren- oder Feuerbereich', antwort: 'Nein' },
    { key: 'rf11', frage: 'Lagerung in geprüften Datensicherungsschränken', antwort: 'Nein' },
    { key: 'rf12', frage: 'Versicherungssumme Daten- und Kommunikationstechnik, Bürotechnik', antwort: '10.000,00 €' },
    { key: 'rf13', frage: 'Weitere Anlagegruppen', antwort: 'Bild- und Tontechnik' },
    { key: 'rf14', frage: 'Versicherungssumme Bild- und Tontechnik', antwort: '7.500,00 €' },
    { key: 'rf15', frage: 'Hauptstandort innerhalb der BRD', antwort: 'Ja' },
    { key: 'rf16', frage: 'ZÜRS-Zone', antwort: 'Zürs-Zone 1' },
    { key: 'rf17', frage: 'Gefahrerhöhende Betriebe innerhalb von 15 m', antwort: 'Nein' },
    { key: 'rf18', frage: 'Wohn- und Betriebsgebäude im Umkreis von 300 m', antwort: 'Ja' },
    { key: 'rf19', frage: 'Außentüren mit bündig abschließenden Zylinderschlössern', antwort: 'Ja' },
    { key: 'rf20', frage: 'Ganzglastüren mit 2 Schlössern, Riegel in Boden und Decke', antwort: 'Ja' }
  ],
  auffaelligkeiten: [
    {
      key: 'a1', titel: 'Betriebsunterbrechung nicht im Tarif enthalten', wirkung: 'sonderfall',
      text: 'Die Plattform nennt als Aussteuerungsgrund, dass die gewünschte Betriebsunterbrechung im Tarif nicht enthalten ist. Angefragt sind 340.000,00 € bei 17.500,00 € versicherter Elektronik.'
    },
    {
      key: 'a2', titel: 'Vorvertrag vom Versicherer gekündigt', wirkung: 'sonderfall',
      text: 'Zweiter Aussteuerungsgrund der Plattform. Der Vorvertrag bei Zurich wurde vom Versicherer gekündigt, als Kündigungsgrund ist „Ablauf“ angegeben.'
    },
    {
      key: 'a3', titel: 'Zwei verschiedene Gründungsdaten', wirkung: 'hinweis',
      text: 'Unter „Angaben zum Betrieb“ steht der 01.01.2011, unter „Details zum Unternehmen“ der 01.12.2010.'
    },
    {
      key: 'a4', titel: 'Datensicherung ohne Auslagerung', wirkung: 'hinweis',
      text: 'Datenträger und Software sollen mit 5.000,00 € mitversichert werden. Die Sicherungen werden weder in einen anderen Gefahrenbereich ausgelagert noch in geprüften Datensicherungsschränken verwahrt.'
    },
    {
      key: 'a5', titel: 'Seiten 2 und 3 vertauscht', wirkung: 'hinweis',
      text: 'Die Seiten liegen nicht in der Reihenfolge des Formulars vor: Seite 3 beginnt mit den Risikoangaben, Seite 2 setzt die Deckungserweiterungen fort. Die Angaben sind vollständig gelesen.'
    }
  ],
  gesamteinschaetzung: 'Gasthof mit Übernachtung, seit 2010 bzw. 2011 am Markt, mit Elektronik im Wert von 17.500,00 € (Daten-, Kommunikations- und Bürotechnik sowie Bild- und Tontechnik). Alle Angaben für ein Angebot liegen vor, Vorschäden sind verneint. Die Plattform hat die Anfrage ausgesteuert, weil die gewünschte Betriebsunterbrechung über 340.000,00 € im Tarif nicht enthalten ist und der Vorvertrag vom Versicherer gekündigt wurde. Der Fall geht mit dem Deckblatt an die Fachspezialisten.'
}
