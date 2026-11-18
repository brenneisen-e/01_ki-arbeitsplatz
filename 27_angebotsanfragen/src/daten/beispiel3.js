/**
 * Beispiel 3 – Mail eines Vermittlers zur Betriebsübernahme.
 *
 * Kein Angebot: Der Betrieb geht vom Vater auf den Sohn über, die
 * bestehenden Verträge sollen fortgeführt werden. Die Mail trägt einen
 * strukturierten Kopf (Agentur, Sparte, Versicherungsscheinnummern) und ist
 * ohne Umlaute geschrieben. Inhalt wie in der verfremdeten Beispielanfrage.
 */

import { p, kopf, abstand, stempel, unterschrift } from './bausteine.js'

const seite1 = [
  kopf([
    ['Von:', '[[vermittlerEmail|max.mustermann@example.com]]'],
    ['Gesendet:', '[[a3|03.03.2026]] 10:00:00'],
    ['An:', 'service@example.com'],
    ['Cc:', ''],
    ['Betreff:', '[[vorgangsart|Betriebsuebernahme]] VN: [[vnName|Musterfirma GmbH]] VSNR: [[vertraege|V 12/34 567890]]'],
    ['Anlagen:', '']
  ], { ort: 'Kopfzeilen der Mail' }),
  kopf([
    ['Agentur / Nummer:', '[[vermittler|Musteragentur]] / [[agenturnummer|123/45/6789]]/MaxMustermann/12345'],
    ['Sparte/Risiko:', '[[sparteBestand,sparte|Sach-Gewerbe/Haftpflichtschutz\nHandwerk Versicherung laufend]]'],
    ['Versicherungsnehmer:', '[[a1|Musterfirma GmbH]], Musterstadt-[[vorgangsart|Inhaberwechsel]]'],
    ['Versicherungsscheinnummer:', '[[vertraege|V 12/34 567890]], [[vertraege,a2|S 98/76 543210]]']
  ], { ort: 'Vorgangskopf des Vermittlers', stil: 'breit' }),
  abstand(),
  p('Sehr geehrte Damen und Herren,', { stil: 'klein', ort: 'Mailtext' }),
  p('der bisher von [[inhaberAlt|Max Mustermann]] gefuehrte Betrieb "Musterfirma GmbH, [[vnAdresse|Musterstr. 1, 12345 Musterstadt]]" wird zum [[stichtag|01.01.2027]] von seinem Sohn, Herrn [[inhaberNeu|Moritz Mustermann, geboren am 01.01.1990]], uebernommen. Die Firmierung und der Risikoort bleiben bestehen, es aendert sich nur der Inhaber.'),
  p('Wir bitten Sie, die [[vorgangsart|bestehenden Versicherungsvertraege zu pruefen]] und die erforderlichen Aenderungen zum Uebernahmestichtag vorzunehmen.'),
  p('[[anliegen,a1|Aenderung des Versicherungsnehmers auf Herrn Moritz Mustermann.]]\n[[anliegen|Fortfuehrung der bestehenden Versicherungsvertraege, soweit moeglich.]]\n[[anliegen|Lueckenloser Versicherungsschutz ab dem 01.01.2027.]]'),
  abstand(),
  abstand(),
  p('[[ansprechpartner|Max Mustermann]]'),
  stempel('123456')
]

const seite2 = [
  p('Muster Finanz- und Versicherungsmakler\n\nMax Mustermann | Musterstr. 1 | 12345 Musterstadt\n\nTelefon: [[vermittlerTelefon|0123456789]] | Mobil: 01701234567 | max.mustermann@example.com\n\nIHK-Nr.: D-ABCD-12345-67 | SteuerNr.: 123/456/78900', { stil: 'blau klein', ort: 'Signatur des Vermittlers' }),
  abstand(),
  p('Diese E-Mail und eventuell angehängte Dateien sind nur für den oben genannten Empfänger bestimmt und können vertrauliche Informationen enthalten. Sollten Sie nicht der Empfänger sein, ist jede Verbreitung, Weiterleitung und Kopie verboten. Wenn Sie diese E-Mail versehentlich erhalten haben, senden Sie diese Mail zurück oder unterrichten umgehend den Absender unter oben genannten Kontaktdaten. Bitte löschen Sie diese Nachricht in diesem Fall umgehend. Vielen Dank.', 'mono'),
  p('This email message and any attachment(s) are intended only for the use of the recipient(s) named above and may contain information that is privileged and confidential. Any review, use, distribution or disclosure by others is strictly prohibited. If you received this email message in error, please immediately notify the sender by replying to this email message or by telephone and delete the email from your system. Thank you.', 'mono'),
  stempel('123456')
]

const seite3 = [
  stempel('123456'),
  unterschrift('M. Mustermann')
]

export default {
  id: 'ANG-2026-2103',
  beispiel: 3,
  eingang: '03.03.2026',
  uhrzeit: '10:00',
  kanal: 'E-Mail',
  form: 'E-Mail mit strukturiertem Vorgangskopf',
  produkt: 'sonstig',
  sparte: 'Sach-Gewerbe / Haftpflicht (Bestand)',
  vorgangsart: 'Vertragsänderung (Inhaberwechsel)',
  einordnung: 'Der Vermittler beantragt kein Angebot, sondern die Änderung bestehender Verträge zum Übernahmestichtag. Das ist ein Bestandsvorgang.',
  weiterleitung: 'Weitergabe mit den Kerndaten an die Bestandsbearbeitung; die Vorverträge werden dort geprüft',
  kunde: 'Musterfirma GmbH',
  mail: {
    vonName: 'Musteragentur',
    von: 'max.mustermann@example.com',
    an: 'service@example.com',
    betreff: 'Betriebsuebernahme VN: Musterfirma GmbH VSNR: V 12/34 567890',
    vorschau: 'der bisher von Max Mustermann gefuehrte Betrieb wird zum 01.01.2027 von seinem Sohn uebernommen …',
    anhaenge: []
  },
  dokumente: [
    { id: 'b3-mail', titel: 'E-Mail', art: 'Ausdruck der E-Mail, 3 Seiten', stil: 'mail', seiten: [seite1, seite2, seite3] }
  ],
  felder: {
    vorgangsart: { w: 'Vertragsänderung (Inhaberwechsel)', art: 'interpretiert', h: 'Betreff „Betriebsuebernahme“, Kopfzeile „Inhaberwechsel“ und die Bitte, bestehende Verträge zu ändern' },
    sparte: { w: 'Sach-Gewerbe / Haftpflicht (Bestand)', art: 'interpretiert', h: 'Aus dem Vorgangskopf; betroffen sind laufende Verträge, kein Neugeschäft' },
    vermittler: 'Musteragentur',
    ansprechpartner: 'Max Mustermann',
    vermittlerEmail: 'max.mustermann@example.com',
    vermittlerTelefon: '0123456789',
    agenturnummer: { w: '123/45/6789', h: 'Aus der Zeile „Agentur / Nummer“ des Vorgangskopfs' },
    anliegen: { w: 'Änderung des Versicherungsnehmers auf Herrn Moritz Mustermann; Fortführung der bestehenden Verträge; lückenloser Versicherungsschutz ab dem 01.01.2027', art: 'interpretiert', h: 'Drei Wünsche am Ende der Mail, hier zusammengefasst' },
    stichtag: '01.01.2027',
    sparteBestand: 'Sach-Gewerbe / Haftpflichtschutz, Handwerk Versicherung (laufend)',
    vertraege: 'V 12/34 567890; S 98/76 543210',
    vnName: 'Musterfirma GmbH',
    vnAdresse: 'Musterstr. 1, 12345 Musterstadt',
    inhaberAlt: 'Max Mustermann',
    inhaberNeu: 'Moritz Mustermann, geboren am 01.01.1990'
  },
  betriebsarten: [],
  risikofragen: [],
  auffaelligkeiten: [
    {
      key: 'a1', titel: 'GmbH und Wechsel des Versicherungsnehmers', wirkung: 'hinweis',
      text: 'Versicherungsnehmer ist laut Vorgangskopf eine GmbH. Gewünscht ist die Änderung des Versicherungsnehmers auf eine Person. Zu klären ist, ob Gesellschafter oder Geschäftsführung wechseln oder ob tatsächlich ein neuer Vertragspartner eintritt.'
    },
    {
      key: 'a2', titel: 'Zweiter Vertrag nur im Vorgangskopf', wirkung: 'hinweis',
      text: 'Der Betreff nennt nur V 12/34 567890. Im Vorgangskopf steht zusätzlich S 98/76 543210. Betroffen sind also zwei Verträge.'
    },
    {
      key: 'a3', titel: 'Langer Vorlauf', wirkung: 'hinweis',
      text: 'Die Mail ist vom 03.03.2026, der Stichtag der Übernahme ist der 01.01.2027.'
    }
  ],
  recherche: [
    'Verträge V 12/34 567890 und S 98/76 543210 {imBestand} aufrufen und den Vertragsstand prüfen',
    'Vorschäden zu beiden Verträgen {imSchaden} nachsehen'
  ],
  gesamteinschaetzung: 'Kein Neugeschäft: Ein Handwerksbetrieb geht zum 01.01.2027 vom Vater auf den Sohn über, zwei laufende Verträge (Sach-Gewerbe und Haftpflicht) sollen fortgeführt werden. Der Fall gehört in die Bestandsbearbeitung. Vorab zu klären ist, wer nach der Übernahme Versicherungsnehmer ist, weil der Vertrag auf eine GmbH läuft.'
}
