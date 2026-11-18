/**
 * Beispiel 1 – Beratungsdokumentation eines Vergleichsportals zur
 * Betriebshaftpflicht (vier Seiten, Ankreuzlisten).
 *
 * Inhalt wie in der verfremdeten Beispielanfrage. Die Angaben stehen in einer
 * Tabelle aus Frage und Antwort; viele Antworten sind angekreuzte Stufen.
 */

import { p, titel, h2, logo, fuss, tabelle, abschnitt, zeile, voll, wahl, jaNein, an, aus, stufen } from './bausteine.js'

const FUSS = fuss('Vorgangsnummer: VGN-123456', 'Telefon Finanzchef24: [[vermittlerTelefon|089 123 456 789]]')
const FUSS_OHNE = fuss('Vorgangsnummer: VGN-123456', 'Telefon Finanzchef24: 089 123 456 789')

const UMSATZ = ['bis 10.000 €', 'bis 25.000 €', 'bis 50.000 €', 'bis 75.000 €', 'bis 100.000 €', 'bis 150.000 €',
  'bis 200.000 €', 'bis 250.000 €', 'bis 300.000 €', 'bis 400.000 €', 'bis 500.000 €', 'über 500.000 €']
const LOHN = ['bis 10.000 €', 'bis 20.000 €', 'bis 30.000 €', 'bis 40.000 €', 'bis 50.000 €', 'bis 75.000 €',
  'bis 100.000 €', 'bis 150.000 €', 'bis 200.000 €', 'bis 250.000 €', 'über 250.000 €']
const SUMMEN = ['250.000 €', '500.000 €', '1 Mio. €', '3 Mio. €', '5 Mio. €', '10 Mio. €', 'Unbegrenzt', 'Andere']

const BESCHREIBUNG = 'Installationsbetrieb (Gas, Wasser, Heizung, Sanitär, Lüftung) 98%\n\nFliesenlegen (wird von einem Subunternehmer ausgeführt) 2%\n\nAltgesellenregelung (Gleichstellung zu Meister) vorhanden'

const seite1 = [
  logo('[[vermittler|FinanzChef24]]', { stil: 'rechts-oben' }),
  titel('BERATUNGSDOKUMENTATION ZUR [[sparte|BETRIEBSHAFTPFLICHTVERSICHERUNG]]', { stil: 'klein', ort: 'Kopf der Beratungsdokumentation' }),
  p('Dokumentation der Beratung vom 02.11.2026 12:03 Uhr', 'winzig fett'),
  p('Bitte lesen Sie das Dokument sorgfältig durch, überprüfen Sie Ihre Angaben und drucken Sie es für Ihre Unterlagen aus oder speichern Sie es ab.\nDie in der Beratungsdokumentation gewählte männliche Form bezieht immer gleichermaßen alle Geschlechter ein. Auf die gleichzeitige Verwendung der Sprachformen männlich, weiblich und divers wurde aufgrund einfacherer Lesbarkeit verzichtet. Für Rückfragen stehen wir Ihnen jederzeit gerne zur Verfügung, unsere Kontaktdaten finden Sie am Ende dieser Beratungsdokumentation.', 'winzig'),
  p('Gemäß dem Gesetz zur Neuregelung des Versicherungsvermittlerrechts vom 22. Mai 2007 ist es vorgeschrieben, dem Kunden eine Dokumentation über die Beratung zum Abschluss einer Versicherung zu übermitteln.', 'winzig'),
  p('Diese Beratungsdokumentation bezieht sich auf Ihre [[vorgangsart|Anfrage zur Betriebshaftpflichtversicherung]] mit der Vorgangsnummer: [[anfrageId|VGN-123456]]', 'winzig'),
  h2('Daten des Versicherungsnehmers', { ort: 'Daten des Versicherungsnehmers' }),
  p('[[vnName|Max Mustermann Haustechnik]]\n[[vnAdresse|Musterstr. 1\n12345 Musterstadt]]'),
  h2('Daten des Inhabers/Geschäftsführers', { ort: 'Daten des Inhabers' }),
  p('Max Mustermann\nTelefon: [[a1|23456789]]\nEmail: [[a1|ann@example.com]]'),
  h2('Risikoort', { ort: 'Risikoort' }),
  p('Der zu versichernde Risikoort befindet sich innerhalb der Bundesrepublik Deutschland. Alle versicherten Personen haben ihren Hauptwohnsitz in der Bundesrepublik Deutschland.', 'winzig'),
  h2('Anlass der Beratung', { ort: 'Anlass der Beratung' }),
  p('Der Versicherungsnehmer hat im telefonischen Gespräch mit dem Vermittler Versicherungsbedarf im Bereich Betriebshaftpflichtversicherung geäußert. Der vollständige Kundenbedarf sowie die Empfehlungen des Vermittlers wurden in einem separaten Dokument erfasst, welches dem Kunden getrennt zugesendet wird. Diese Dokumentation zur Bedarfserfassung ist Bestandteil der Beratungsdokumentation.', 'winzig'),
  h2('Angaben des Kunden', { ort: 'Tabelle „Angaben des Kunden“' }),
  p('In untenstehender Tabelle finden sich die vom Kunden im Beratungsgespräch gemachten Angaben.', 'winzig'),
  tabelle([
    abschnitt('Betriebsart'),
    voll('[[ba1|Installationsbetrieb (Gas, Wasser, Sanitär, Heizung, Lüftung)]]'),
    abschnitt('Mischbetrieb'),
    jaNein('Weitere Tätigkeiten', true),
    zeile('Welche weiteren Tätigkeiten?', '[[ba2|Fliesenlegen]]'),
    abschnitt('Eckdaten zu Ihrem Bedarf'),
    jaNein('Sind Sie die allein tätige Person?', true, 'vollzeit,teilzeit,geringfuegig,a4'),
    zeile('Wann wurde Ihr Betrieb gegründet?', '[[rf7|2016]]'),
    wahl('Wann soll Ihre Versicherung beginnen?', [aus('Am nächsten Werktag'), an('Später')]),
    zeile('Gewünschter Versicherungsbeginn', '[[beginn|13.03.2027]]'),
    wahl('Wie hoch ist Ihr geschätzter Nettoumsatz (ohne MwSt.) für ein Jahr?', stufen(UMSATZ, 'bis 50.000 €', 'umsatz,a3'))
  ], { kopf: ['FRAGE', 'IHRE ANGABEN'] }),
  FUSS
]

const seite2 = [
  tabelle([
    wahl('Wie hoch sind Ihre Lohnkosten (inkl. Lohnnebenkosten) für ein Jahr?', stufen(LOHN, 'bis 10.000 €', 'lohnsumme,a3,a4')),
    zeile('Postleitzahl des Versicherungsortes in Deutschland', '12345'),
    abschnitt('Tätigkeitsbereich'),
    jaNein('Tätigkeiten als Sachverständiger oder Gutachter für Bauten Dritter, ohne eigene operative Tätigkeit', false, 'rf1'),
    abschnitt('Angaben zur Vorversicherung und Vorschäden'),
    jaNein('Hatten Sie in den letzten 5 Jahren bereits eine Versicherung für Ihre aktuelle selbstständige Tätigkeit?', true, 'vorversicherung'),
    wahl('Wie ist der aktuelle Status Ihrer bisherigen Versicherung?', [
      an('[[vvStatus,a2|Es besteht eine laufende Versicherung]]'),
      aus('Es bestand eine mittlerweile ausgelaufene Versicherung')
    ]),
    jaNein('Hatten Sie in den letzten 5 Jahren einen Schaden?', false, 'vorschaeden'),
    abschnitt('Gewünschter Leistungsumfang'),
    jaNein('Möchten Sie zusätzlich eine Privathaftpflichtversicherung?', false, 'phv'),
    abschnitt('Rabatte'),
    jaNein('Verfügen Sie über eine berufliche Qualifikation (wie z.B. Meistertitel) für Ihre Tätigkeit?', true, 'rf2'),
    abschnitt('Angaben zu Ihrer Betriebsgröße'),
    jaNein('Üben Sie Ihre selbstständige Tätigkeit nebenberuflich aus?', false, 'rf3'),
    abschnitt('Weitere Angaben'),
    wahl('Bestätigung', [an('[[rf4|Ich bin mit meiner selbstständigen Tätigkeit in Deutschland gemeldet.]]')]),
    wahl('Bestätigung', [an('[[vvAblehnungen|Kein Versicherer hat für meine aktuelle selbstständige Tätigkeit einen Vertrag gekündigt oder abgelehnt.]]')]),
    wahl('Bestätigung', [an('[[rf5|Mir sind keine Umstände oder Fehler bekannt, die in Zukunft zu einem Schaden führen könnten.]]')]),
    wahl('Bestätigung', [an('[[rf6|Es werden keine Arbeiten an Kraft-, Luft-, Schienen-, Raum- und/oder Wasserfahrzeugen (abgesehen von Ruderbooten) durchgeführt.]]')]),
    zeile('Zusatzinfos', 'Installationsbetrieb (Gas, Wasser, Heizung, Sanitär, Lüftung) [[ba1|98%]]\n\nFliesenlegen ([[subunternehmer|wird von einem Subunternehmer ausgeführt]]) [[ba2,subunternehmer|2%]]\n\n[[rf2|Altgesellenregelung (Gleichstellung zu Meister) vorhanden]]'),
    zeile('Zusätzliche Dokumente', ''),
    abschnitt('Ergänzende Betriebsbeschreibung'),
    zeile('Ergänzende Betriebsbeschreibung', BESCHREIBUNG),
    zeile('Zusätzliche Dokumente', ''),
    abschnitt('Angebotsanforderungen'),
    wahl('Gewünschte Versicherungssummen', stufen(SUMMEN, '5 Mio. €', 'vs'))
  ], { ort: 'Tabelle „Angaben des Kunden“' }),
  FUSS_OHNE
]

const seite3 = [
  tabelle([
    wahl('Gewünschte Selbstbehalte', stufen(['0 €', '250 €', '500 €', '1.000 €', 'Andere'], '250 €', 'sb')),
    wahl('Gewünschte Laufzeiten', stufen(['1 Jahr', '3 Jahre'], '1 Jahr', 'laufzeit')),
    wahl('Gewünschte Zahlweisen', stufen(['Jährlich', 'Halbjährlich', 'Vierteljährlich', 'Monatlich'], 'Jährlich', 'zahlweise')),
    zeile('Weitere Angebotsanforderungen', 'keine Angabe'),
    abschnitt('Rückruf'),
    wahl('Anrede', [an('Herr'), aus('Frau'), aus('Divers')]),
    zeile('Titel', 'keine Angabe'),
    zeile('Vorname', 'Max'),
    zeile('Nachname', 'Mustermann'),
    zeile('E-Mail-Adresse', '[[vnEmail,a1|max.mustermann@example.com]]'),
    zeile('Telefonnummer', '[[vnTelefon,a1|0123456789]]'),
    zeile('Name Ihres Betriebs', 'Max Mustermann Haustechnik'),
    zeile('Anschrift', 'Musterstr, 12345, Musterstadt\nDeutschland')
  ], { ort: 'Tabelle „Angaben des Kunden“, Abschnitt Rückruf' }),
  FUSS_OHNE
]

const seite4 = [
  p('Der Kunde sichert zu, dass diese Angaben wahrheitsgemäß, vollständig und richtig angegeben und erfasst wurden.', { stil: 'winzig', ort: 'Schlussseite' }),
  h2('Angebot des Vermittlers'),
  p('Auf Basis der vom Kunden gemachten Angaben vergleicht der Vermittler Tarife unterschiedlicher Versicherungsgesellschaften und stellt dem Kunden dann passende Angebote zur Verfügung. Alle zur Verfügung gestellten Angebote sind Teil der Beratungsdokumentation.', 'winzig'),
  FUSS_OHNE
]

export default {
  id: 'ANG-2026-2101',
  beispiel: 1,
  eingang: '02.11.2026',
  uhrzeit: '12:03',
  kanal: 'Vergleichsportal',
  form: 'Beratungsdokumentation mit Ankreuzlisten',
  produkt: 'bhv',
  vorgangsart: 'Angebotsanfrage',
  kunde: 'Max Mustermann Haustechnik',
  mail: {
    vonName: 'Finanzchef24',
    von: 'gewerbe@example.com',
    an: '{postfach}',
    betreff: 'Beratungsdokumentation zur Betriebshaftpflichtversicherung – VGN-123456',
    vorschau: 'Dokumentation der Beratung vom 02.11.2026: Installationsbetrieb (Gas, Wasser, Sanitär, Heizung, Lüftung) …',
    anhaenge: [
      { name: 'Beratungsdokumentation_VGN-123456.pdf', typ: 'PDF, 4 Seiten', info: 'Angaben des Kunden als Tabelle mit Ankreuzlisten' }
    ]
  },
  dokumente: [
    { id: 'b1-doku', titel: 'Beratungsdokumentation', art: 'PDF des Vermittlers, 4 Seiten', stil: 'fc24', seiten: [seite1, seite2, seite3, seite4] }
  ],
  felder: {
    vorgangsart: { w: 'Angebotsanfrage', art: 'interpretiert', h: 'Beratungsdokumentation eines Vergleichsportals mit Angebotsanforderungen' },
    sparte: 'Betriebshaftpflicht',
    vermittler: 'Finanzchef24',
    vermittlerTelefon: '089 123 456 789',
    anfrageId: 'VGN-123456',
    beginn: '13.03.2027',
    laufzeit: '1 Jahr',
    phv: { w: 'Nein', h: 'Zusätzliche Privathaftpflicht ist nicht gewünscht' },
    umsatz: { w: 'bis 50.000 €', art: 'interpretiert', h: 'Ankreuzliste: Stufe „bis 50.000 €“ gewählt, ein genauer Betrag ist nicht genannt' },
    lohnsumme: { w: 'bis 10.000 €', art: 'interpretiert', h: 'Ankreuzliste: niedrigste Stufe „bis 10.000 €“ gewählt' },
    subunternehmer: { w: 'bis 1.000 € (2 % des Umsatzes)', art: 'interpretiert', h: 'Fliesenlegen (2 %) führt ein Subunternehmer aus; eine Auftragssumme ist nicht beziffert' },
    vollzeit: { w: '1', art: 'interpretiert', h: 'Der Inhaber ist die allein tätige Person' },
    teilzeit: { w: '0', art: 'interpretiert', h: 'Der Inhaber ist die allein tätige Person' },
    geringfuegig: { w: '0', art: 'interpretiert', h: 'Der Inhaber ist die allein tätige Person' },
    zahlweise: 'jährlich',
    vs: '5 Mio. €',
    sb: '250 €',
    vorversicherung: { w: 'Ja', h: 'In den letzten fünf Jahren für die Tätigkeit versichert' },
    vvStatus: 'laufend',
    vvAblehnungen: { w: 'keine', art: 'interpretiert', h: 'Bestätigung: kein Versicherer hat gekündigt oder abgelehnt' },
    vorschaeden: { w: 'keine', h: 'Kein Schaden in den letzten fünf Jahren' },
    vnName: 'Max Mustermann Haustechnik',
    vnAdresse: 'Musterstr. 1, 12345 Musterstadt',
    vnTelefon: '0123456789',
    vnEmail: 'max.mustermann@example.com'
  },
  betriebsarten: [
    { key: 'ba1', bezeichnung: 'Installationsbetrieb (Gas, Wasser, Sanitär, Heizung, Lüftung)', anteil: '98 %', treffer: 'exakt', begruendung: 'Wörtlich als Betriebsart genannt; Anteil aus den Zusatzinfos.' },
    { key: 'ba2', bezeichnung: 'Fliesen-, Platten- und Mosaikleger', anteil: '2 %', treffer: 'naechste', begruendung: 'Genannt ist „Fliesenlegen“; die Arbeiten führt ein Subunternehmer aus.' }
  ],
  betriebsartNotiz: 'Mischbetrieb mit klarem Schwerpunkt. Die Aufteilung steht in den Zusatzinfos des Kunden.',
  risikofragen: [
    { key: 'rf1', frage: 'Tätigkeit als Sachverständiger oder Gutachter für Bauten Dritter', antwort: 'Nein' },
    { key: 'rf2', frage: 'Berufliche Qualifikation (z. B. Meistertitel)', antwort: 'Ja, Altgesellenregelung (Gleichstellung zu Meister)' },
    { key: 'rf3', frage: 'Nebenberufliche Tätigkeit', antwort: 'Nein' },
    { key: 'rf4', frage: 'Mit der Tätigkeit in Deutschland gemeldet', antwort: 'Ja' },
    { key: 'rf5', frage: 'Bekannte Umstände, die zu einem Schaden führen könnten', antwort: 'Keine' },
    { key: 'rf6', frage: 'Arbeiten an Kraft-, Luft-, Schienen-, Raum- oder Wasserfahrzeugen', antwort: 'Keine' },
    { key: 'rf7', frage: 'Betriebsgründung', antwort: '2016' }
  ],
  auffaelligkeiten: [
    {
      key: 'a1', titel: 'Abweichende Kontaktdaten', wirkung: 'hinweis',
      text: 'Auf Seite 1 stehen Telefon 23456789 und E-Mail ann@example.com, im Abschnitt Rückruf auf Seite 3 Telefon 0123456789 und E-Mail max.mustermann@example.com. Ins Deckblatt übernommen sind die Angaben aus dem Abschnitt Rückruf.'
    },
    {
      key: 'a2', titel: 'Laufende Vorversicherung ohne Versicherer', wirkung: 'hinweis',
      text: 'Es besteht eine laufende Versicherung. Versicherer, Versicherungsscheinnummer und Jahresbeitrag sind nicht genannt.'
    },
    {
      key: 'a3', titel: 'Umsatz und Lohnkosten nur als Stufen', wirkung: 'hinweis',
      text: 'Die Beratungsdokumentation nennt keine Beträge, sondern angekreuzte Stufen. Im Deckblatt steht die gewählte Stufe.'
    },
    {
      key: 'a4', titel: 'Lohnkosten trotz allein tätigem Inhaber', wirkung: 'hinweis',
      text: 'Der Inhaber ist die allein tätige Person, angekreuzt sind dennoch Lohnkosten bis 10.000 €. Das ist die niedrigste Stufe der Liste; eine Stufe „keine“ gibt es nicht.'
    }
  ],
  gesamteinschaetzung: 'Kleiner Installationsbetrieb für Gas, Wasser, Sanitär, Heizung und Lüftung, seit 2016 am Markt, der Inhaber arbeitet allein, Umsatz bis 50.000 €. Fliesenarbeiten machen 2 % aus und laufen über einen Subunternehmer. Keine Vorschäden, die Vorversicherung läuft. Für das Angebot liegen alle Angaben vor; nachzuschlagen ist nur die Agenturnummer des Vermittlers.'
}
