/**
 * Beispiel 2 – weitergeleiteter Mailverlauf, Anfrage Werbetechniker.
 *
 * Drei Mails in einem Ausdruck: Die Anfrage des Vermittlers steht ganz unten,
 * darüber die Weiterleitungen von Sales Manager und Gewerbeservice. Die
 * Angaben verteilen sich auf Betreff, Mailtext und Signatur.
 * Inhalt wie in der verfremdeten Beispielanfrage; Reste echter Namen,
 * Agentur- und Registernummern sind durch Platzhalter ersetzt.
 */

import { p, kopf, linie, abstand, seitenzahl } from './bausteine.js'

const seite1 = [
  p('Max Mustermann', 'klein'),
  linie(true),
  kopf([
    ['Von:', 'MB Gewerbeservice SHU'],
    ['Gesendet:', '[[a3|Dienstag, 3. November 2026 08:37]]'],
    ['An:', '{postfach} Prio3'],
    ['Betreff:', 'WG: Anfrage Werbetechniker /[[agenturnummer|123-45-6789]] MFD - [[anfrageId|GW100000999999]] - [[anfrageId|2026000123]]'],
    ['Anlagen:', 'totemomail_info.html; WG: Anfrage Werbetechniker /123-45-6789 MFD - Angebotsnummer: GW100000999999 - 2026000123'],
    ['Priorität:', '[[a3|Hoch]]']
  ], { ort: 'Kopfzeilen der Weiterleitung' }),
  abstand(),
  p('Hallo zusammen,', { ort: 'Weiterleitung des Gewerbeservice' }),
  p('anbei Anfrage zur weiteren Veranlassung.'),
  p('Viele Grüße'),
  p('Max Mustermann\nVersicherungsfachwirt (IHK)\nKunden-Vertrags-Service SH/Gewerbe', 'klein'),
  p('Muster Versicherung\nMusterstr. 1, 12345 Musterstadt\nTelefon 01234 567890\nservice@example.com\nhttps://www.beispiel.de', 'klein'),
  p('Personen- und Funktionsbezeichnungen stehen für alle Geschlechter gleichermaßen.'),
  linie(),
  kopf([
    ['Von:', 'Muster, Erika <erika.muster@example.com>'],
    ['Gesendet:', 'Montag, 2. November 2026 11:43'],
    ['An:', 'MB Gewerbeservice SHU <service@example.com>'],
    ['Betreff:', 'WG: Anfrage Werbetechniker /123-45-6789 MFD'],
    ['Priorität:', 'Hoch']
  ], { stil: 'inline', ort: 'Weiterleitung des Sales Managers' }),
  p('Liebe Kollegen,'),
  p('[[a2|bitte einen Hinweis zur {linieKurz} mir geben oder ein Angebot direkt erstellen.]]'),
  p('Danke vorab.'),
  p('Viele Grüße', 'blau'),
  seitenzahl('1')
]

const seite2 = [
  p('Erika Muster', { stil: 'klein', ort: 'Signatur des Sales Managers' }),
  p('Versicherungsfachwirt (IHK)\nFachberater gewerbliche Schadenversicherung\nSales Manager\nMaklervertrieb Komposit', 'blau'),
  p('Muster Versicherungsgruppe\nMaklerdirektion Komposit Süd\nMusterstr. 1, 12345 Musterstadt\nTelefon: +49 1234 567890 ; +49 170 1234567\nFax.: +49 1234 567891\nE-Mail: erika.muster@example.com\nhttps://www.beispiel.de', 'klein'),
  p('Nutzen Sie auch unser {hotlineName}:', 'blau'),
  p('angebote@example.com\nHotline: 01234 567892', { stil: 'klein eingerueckt' }),
  p('Personen- und Funktionsbezeichnungen stehen für alle Geschlechter gleichermaßen.'),
  linie(),
  kopf([
    ['Von:', 'anna.beispiel@example.com <anna.beispiel@example.com>'],
    ['Gesendet:', '[[a3|Freitag, 30. Oktober 2026 10:20]]'],
    ['An:', 'Muster, Erika <erika.muster@example.com>'],
    ['Betreff:', '[[vorgangsart|Anfrage]] Werbetechniker']
  ], { stil: 'inline', ort: 'Ursprüngliche Mail des Vermittlers' }),
  p('Hallo Frau Muster,\nich [[vorgangsart|benötige ein Angebot]] zur [[sparte|Betriebshaftpflicht]] für eine Firma für [[ba1|Werbetechnik]] und bin mir nicht sicher bei der Angebotserstellung und brauche daher mal Ihre Hilfe, da es hier auch um [[a1|Folierung von Fahrzeugen]] geht.', 'blau'),
  p('https://www.beispiel-werbung.de', 'klein'),
  p('[[vnName|Muster Werbung GmbH]]\n[[vnAdresse|Musterallee 12\n12345 Musterstadt]]', 'klein'),
  p('Tätigkeiten: [[ba2|Grafik- und Webdesign]]; [[ba3|Fahrzeugbeschriftung / Folierung]]; [[ba4|Textilveredelung]]; [[ba1|Außen- und Lichtwerbung]]; [[ba5|Werbeartikel]]; [[ba6|Messeausstattung]]\nMitarbeiter: [[vollzeit|8 Vollzeit; 2 Azubis]]; [[teilzeit|1 Teilzeit]]\n[[vollzeit|Geschäftsführer: 2]]\nUmsatz: [[umsatz|585.000 €]]', 'blau'),
  p('Mit besten Grüßen', 'blau fett'),
  p('[[ansprechpartner|Anna Beispiel]]', { stil: 'klein', ort: 'Signatur des Vermittlers' }),
  p('Besuchen Sie uns im Internet: https://www.beispiel-finanz.de', 'klein'),
  p('-   Mehrfachagentur   -', 'blau'),
  p('[[vermittler|Muster Finanzdienstleistungen GmbH & Co. KG]]\nMuster Finanzdienstleistungen GmbH & Co. KG\nMusterweg 5\n54321 Beispielstadt    [Routenplaner]', 'klein'),
  seitenzahl('2')
]

const seite3 = [
  p('Telefon : [[vermittlerTelefon|01234 567893]]\nTelefax : 01234 567894\nMobil   : 0170 7654321\nE-Mail   : [[vermittlerEmail|anna.beispiel@example.com]]\nWeb      : www.beispiel-finanz.de', { stil: 'klein', ort: 'Signatur des Vermittlers' }),
  p('Muster Finanzdienstleistungen GmbH & Co. KG, Sitz Musterstadt, HR AG Musterstadt, HRA 1234\nKomplementärin: Muster Verwaltungs-GmbH, Sitz: Musterstadt, HR AG Musterstadt, HRB 5678\nGeschäftsführer: Thomas Beispiel', 'klein'),
  p('Die Registrierung erfolgte über die IHK Musterstadt unter Registriernummer: D-ABCD-12345-67', 'klein'),
  p('Sofern Sie die Eintragungen im Vermittlerregister überprüfen möchten, so können Sie dies über die Internetseite www.beispiel-register.de oder unter Telefon: (0 180) 60 05 85 0 (Preis 0,20 €/Anruf; mit abweichenden Preisen aus Mobilfunknetzen) oder bei der', 'klein'),
  p('DIHK | Deutsche Industrie- und Handelskammer\nBreite Straße 29\n10178 Berlin\nTelefon: (030) 20308-0\nInternet: www.beispiel.de\nals registerführende gemeinsame Stelle nach § 11a GewO jederzeit veranlassen.', 'klein'),
  p('Streitschlichtungs- und Beschwerdestellen:', 'klein'),
  p('Versicherungsombudsmann e.V.\nPostfach 08 06 32, 10006 Berlin', 'klein'),
  p('Ombudsmann Private Kranken- und Pflegeversicherung\nPostfach 06 02 22, 10052 Berlin', 'klein'),
  p('Generaldirektion Justiz und Verbraucher\nEuropäische Kommission\n1049 Bruxelles/Brussel (Brüssel)\nBelgien', 'klein'),
  p('Diese E-Mail könnte vertrauliche und/oder rechtlich geschützte Informationen enthalten. Wenn Sie nicht der richtige Adressat sind oder diese E-Mail irrtümlich erhalten haben, informieren Sie bitte sofort den Absender und vernichten Sie diese Mail. Das unerlaubte Kopieren sowie die unbefugte Weitergabe dieser Mail sind nicht gestattet.', 'klein'),
  p('This e-mail may contain confidential and/or privileged information. If you are not the intended recipient (or have received this e-mail in error) please notify the sender immediately and destroy this e-mail. Any unauthorised copying, disclosure or distribution of the material in this e-mail is strictly forbidden.', 'klein'),
  seitenzahl('3')
]

export default {
  id: 'ANG-2026-2102',
  beispiel: 2,
  eingang: '03.11.2026',
  uhrzeit: '08:37',
  anfrageDatum: '30.10.2026',
  kanal: 'E-Mail',
  form: 'Weitergeleiteter Mailverlauf',
  produkt: 'bhv',
  vorgangsart: 'Angebotsanfrage',
  kunde: 'Muster Werbung GmbH',
  mail: {
    vonName: 'MB Gewerbeservice SHU',
    von: 'service@example.com',
    an: '{postfach} Prio3',
    betreff: 'WG: Anfrage Werbetechniker /123-45-6789 MFD - GW100000999999 - 2026000123',
    vorschau: 'Hallo zusammen, anbei Anfrage zur weiteren Veranlassung. Viele Grüße …',
    anhaenge: [
      { name: 'WG Anfrage Werbetechniker.msg', typ: 'Weitergeleitete E-Mail', info: 'Verlauf mit zwei weiteren Mails' },
      { name: 'totemomail_info.html', typ: 'Verschlüsselungshinweis', info: 'ohne Inhalt für das Angebot' }
    ]
  },
  dokumente: [
    { id: 'b2-verlauf', titel: 'Mailverlauf', art: 'Outlook-Ausdruck, 3 Seiten', stil: 'outlook', seiten: [seite1, seite2, seite3] }
  ],
  felder: {
    vorgangsart: { w: 'Angebotsanfrage', art: 'interpretiert', h: 'Der Vermittler bittet in der ältesten Mail des Verlaufs um ein Angebot' },
    sparte: 'Betriebshaftpflicht',
    vermittler: 'Muster Finanzdienstleistungen GmbH & Co. KG',
    ansprechpartner: 'Anna Beispiel',
    vermittlerEmail: 'anna.beispiel@example.com',
    vermittlerTelefon: '01234 567893',
    anfrageId: { w: 'GW100000999999 / 2026000123', h: 'Angebots- und Vorgangsnummer stehen nur im Betreff der Weiterleitung' },
    agenturnummer: { w: '123-45-6789', h: 'Steht nur im Betreff der Weiterleitung, nicht in der Mail des Vermittlers' },
    umsatz: '585.000 €',
    vollzeit: { w: '10', art: 'interpretiert', h: '8 Vollzeit + 2 Geschäftsführer. Die 2 Auszubildenden sind gesondert genannt und nicht mitgezählt' },
    teilzeit: '1',
    vnName: 'Muster Werbung GmbH',
    vnAdresse: 'Musterallee 12, 12345 Musterstadt'
  },
  betriebsarten: [
    { key: 'ba1', bezeichnung: 'Werbetechnik: Schilder- und Lichtreklameherstellung', anteil: '', treffer: 'naechste', begruendung: 'Der Vermittler nennt Werbetechnik sowie Außen- und Lichtwerbung als Kern des Betriebs.' },
    { key: 'ba2', bezeichnung: 'Werbeagentur, Grafik- und Webdesign', anteil: '', treffer: 'exakt', begruendung: 'Als eigene Tätigkeit aufgeführt.' },
    { key: 'ba3', bezeichnung: 'Fahrzeugbeschriftung und Fahrzeugfolierung', anteil: '', treffer: 'exakt', begruendung: 'Arbeiten an Kundenfahrzeugen; der Vermittler weist ausdrücklich darauf hin.' },
    { key: 'ba4', bezeichnung: 'Textilveredelung (Textildruck, Bestickung)', anteil: '', treffer: 'naechste', begruendung: 'Genannt ist Textilveredelung ohne nähere Beschreibung.' },
    { key: 'ba5', bezeichnung: 'Handel mit Werbeartikeln', anteil: '', treffer: 'naechste', begruendung: 'Genannt sind Werbeartikel; ob eigene Herstellung oder Handel, ist offen.' },
    { key: 'ba6', bezeichnung: 'Messebau und Messeausstattung', anteil: '', treffer: 'naechste', begruendung: 'Genannt ist Messeausstattung.' }
  ],
  betriebsartNotiz: 'Mischbetrieb aus sechs Tätigkeiten. Eine Aufteilung nach Umsatz oder Tätigkeit nennt der Vermittler nicht.',
  frageAnteile: 'Umsatzanteile der sechs Tätigkeiten in Prozent, insbesondere der Anteil der Fahrzeugbeschriftung und Fahrzeugfolierung',
  risikofragen: [],
  auffaelligkeiten: [
    {
      key: 'a1', titel: 'Fahrzeugfolierung im Tätigkeitsmix', wirkung: 'hinweis',
      text: 'Der Vermittler ist wegen der Folierung von Fahrzeugen unsicher. Es wird an Kundenfahrzeugen gearbeitet; Bearbeitungs- und Obhutsschäden sind bei der Einstufung zu beachten.'
    },
    {
      key: 'a2', titel: 'Bitte des Sales Managers', wirkung: 'hinweis',
      text: 'Der Sales Manager bittet um einen Hinweis zur {linie} oder direkt um ein Angebot. Die Rückmeldung sollte auch an ihn gehen.'
    },
    {
      key: 'a3', titel: 'Vier Tage unterwegs, Priorität hoch', wirkung: 'hinweis',
      text: 'Die Anfrage des Vermittlers stammt vom 30.10.2026 und ist über zwei Stationen am 03.11.2026 im Angebotspostfach angekommen.'
    }
  ],
  gesamteinschaetzung: 'Werbetechnikbetrieb mit 13 Beschäftigten einschließlich Geschäftsführung und 585.000 € Umsatz, ein Mischbetrieb aus sechs Tätigkeiten. Für die Tarifierung fehlen der Beginn, die Lohnsumme, Versicherungssumme und Selbstbehalt sowie Angaben zu Vorversicherung und Vorschäden. Die Fahrzeugfolierung sollte bei der Betriebsart gesondert bewertet werden.',
  rueckfrageCc: 'erika.muster@example.com'
}
