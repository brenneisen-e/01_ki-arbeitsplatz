/**
 * Beispiel 5 – „Manuelle Anfrage“ über eine Vermittlerplattform:
 * Gebäudeversicherung für zwei vermietete Mehrfamilienhäuser einer WEG.
 *
 * Acht Seiten Formular. Die Gebäudeangaben wiederholen sich je Gebäude; der
 * Freitext am Ende widerspricht dem Formular (Elementar). Inhalt wie in der
 * verfremdeten Beispielanfrage.
 */

import { p, titel, untertitel, h, linie, kontakt, spalten, tabelle, abschnitt, zeile, wahl, an } from './bausteine.js'

const seite1 = [
  titel('[[vorgangsart|Manuelle Anfrage]]', { ort: 'Kopf der Anfrage' }),
  untertitel('von [[vermittler|tecis]]'),
  linie(),
  h('Anfragedaten', { ort: 'Anfragedaten' }),
  spalten([
    { icon: 'kalender', text: '17.11.2026,\n14:13 Uhr' },
    { icon: 'schild', text: '[[sparte|Gebäudeversicherung\nfür Wohnimmobilien]]' },
    { icon: 'gebaeude', text: 'Hausverwaltung' },
    { text: 'ID [[anfrageId|1234567]]', klein: true },
    { logo: '{logoGross}', klein: '{logoKlein}' }
  ]),
  linie(),
  h('Versicherungsnehmer', { ort: 'Versicherungsnehmer' }),
  p('[[vnName,a3|WEG Musterstraße 10-12]]', 'winzig'),
  p('Max Mustermann\n[[vnAdresse|Musterstraße 10\n12345 Musterstadt]]', 'winzig'),
  kontakt([
    { icon: 'mail', text: '[[vnEmail|max.mustermann@muster.de]]' },
    { icon: 'telefon', text: '[[vnTelefon|+49 171 1234567]]' }
  ]),
  h('Vertriebspartner', { ort: 'Vertriebspartner' }),
  p('tecis    (Agenturnummer [[agenturnummer|999999999]])', 'fett'),
  p('[[ansprechpartner|Erika Musterfrau]]\nBeispielweg 5\n54321 Beispielstadt', 'winzig'),
  kontakt([
    { icon: 'mail', text: '[[vermittlerEmail|erika.musterfrau@beispiel.de]]' },
    { icon: 'telefon', text: '[[vermittlerTelefon|+49 172 2345678]]' }
  ])
]

const seite2 = [
  h('Risikoangaben', { ort: 'Risikoangaben, Wohngebäude #1' }),
  tabelle([
    abschnitt('Wohngebäude #1'),
    zeile('Gebäudeart', '[[ba1|Mehrfamilienhaus]]'),
    zeile('Gebäude befindet sich noch im Bau', '[[rf1|Nein]]'),
    zeile('Baujahr', '[[baujahr#1,a5|2025]]'),
    zeile('Wohn- und Gewerbefläche (ohne Keller)', '[[rf2,a2|412]]'),
    zeile('Keller vorhanden', '[[rf3|Nein]]'),
    zeile('Wie wird das zu versichernde Gebäude genutzt', '[[ba1|Vermietung]]'),
    zeile('Leerstand', '[[leerstand#1|Nein]]'),
    zeile('Adresssuche', ''),
    zeile('Straße', '[[betriebsstaette,a3|Musterstraße 10]]'),
    zeile('Hausnummer', ''),
    zeile('Postleitzahl', '[[betriebsstaette|12345]]'),
    zeile('Ort', '[[betriebsstaette|Musterstadt]]'),
    zeile('Photovoltaikanlage', '[[rf4|Nein]]'),
    zeile('Fertighaus', '[[fertighaus#1|Nein]]'),
    zeile('Bauart des Gebäudes (BAK)', '[[holzbau#1|Massive Außenwände]]'),
    zeile('Art des Dachbelags (BAK)', '[[weicheBedachung#1|Harte Bedachung]]'),
    zeile('Bauartklasse', '[[rf5|BAK I]]'),
    zeile('Kern- oder Teilsanierung des Gebäudes', '[[rf6|Nein]]'),
    zeile('Versicherungssumme mit SkenData ermitteln (externe Anwendung)', ''),
    zeile('Basiswert', '[[wertermittlungsjahr#1|Wert 1914]]'),
    zeile('Versicherungssumme (Wert 1914)', '[[neubauwert#1,a2|113.876,00 Mark]]'),
    zeile('Grundstücksbestandteile (Wert 1914)', '0,00 Mark'),
    zeile('Gesamtversicherungssumme', '[[a4|113.876,00 €]]'),
    zeile('Gewünschter Versicherungsbeginn', '[[beginn|01.01.2027]]'),
    wahl('Gewünschte Gefahrengruppen', [an('[[gefahren#1|Feuer]]'), an('[[gefahren#1|Leitungswasser]]'), an('[[gefahren#1|Sturm/Hagel]]')], 'haken'),
    zeile('Elementargefahren', '[[gefahren#1,a1|Nein]]'),
    zeile('Erweiterte Deckung', '[[rf7|Nein]]')
  ])
]

const seite3 = [
  tabelle([
    abschnitt('Wohngebäude #1'),
    zeile('Unbenannte Gefahren', '[[rf8|Nein]]'),
    zeile('Bruchschäden an Ableitungsrohren (auf dem Grundstück)', '[[rf9|Nein]]'),
    zeile('Bruchschäden an Ableitungsrohren (außerhalb des Grundstücks)', '[[rf9|Nein]]'),
    zeile('Glas', '[[rf10|Nein]]'),
    zeile('Haustechnische Anlagen', '[[rf11|Nein]]'),
    zeile('Mietausfall', '[[rf12|Nein]]'),
    zeile('(Unmittelbare) Vorversicherung in den letzten 5 Jahren', '[[vorversicherung|Nein]]'),
    zeile('Ablehnung eines vergleichbaren Antrages in der Vergangenheit', '[[vvAblehnungen|Nein]]'),
    zeile('Vorschäden in den letzten 5 Jahren (auch unversicherte)', '[[vorschaeden|Nein]]')
  ], { ort: 'Risikoangaben, Wohngebäude #1' }),
  tabelle([
    abschnitt('Wohngebäude #2'),
    zeile('Gebäudeart', 'Mehrfamilienhaus'),
    zeile('Gebäude befindet sich noch im Bau', 'Nein'),
    zeile('Baujahr', '[[baujahr#2|2025]]'),
    zeile('Wohn- und Gewerbefläche (ohne Keller)', '[[a2|412]]'),
    zeile('Keller vorhanden', 'Nein'),
    zeile('Wie wird das zu versichernde Gebäude genutzt', 'Vermietung'),
    zeile('Leerstand', '[[leerstand#2|Nein]]'),
    zeile('Adresssuche', ''),
    zeile('Straße', '[[a3|Musterstraße 10]]'),
    zeile('Hausnummer', ''),
    zeile('Postleitzahl', '12345'),
    zeile('Ort', 'Musterstadt'),
    zeile('Photovoltaikanlage', 'Nein'),
    zeile('Fertighaus', '[[fertighaus#2|Nein]]'),
    zeile('Bauart des Gebäudes (BAK)', '[[holzbau#2|Massive Außenwände]]'),
    zeile('Art des Dachbelags (BAK)', '[[weicheBedachung#2|Harte Bedachung]]'),
    zeile('Bauartklasse', 'BAK I')
  ], { ort: 'Risikoangaben, Wohngebäude #2' })
]

const seite4 = [
  tabelle([
    abschnitt('Wohngebäude #2'),
    zeile('Kern- oder Teilsanierung des Gebäudes', 'Nein'),
    zeile('Versicherungssumme mit SkenData ermitteln (externe Anwendung)', ''),
    zeile('Basiswert', '[[wertermittlungsjahr#2|Wert 1914]]'),
    zeile('Versicherungssumme (Wert 1914)', '[[neubauwert#2,a2|25.000,00 Mark]]'),
    zeile('Grundstücksbestandteile (Wert 1914)', '0,00 Mark'),
    zeile('Gesamtversicherungssumme', '25.000,00 €'),
    zeile('Gewünschter Versicherungsbeginn', '01.01.2027'),
    wahl('Gewünschte Gefahrengruppen', [an('[[gefahren#2|Feuer]]'), an('[[gefahren#2|Leitungswasser]]'), an('[[gefahren#2|Sturm/Hagel]]')], 'haken'),
    zeile('Elementargefahren', '[[gefahren#2,a1|Nein]]'),
    zeile('Erweiterte Deckung', 'Nein'),
    zeile('Unbenannte Gefahren', 'Nein'),
    zeile('Bruchschäden an Ableitungsrohren (auf dem Grundstück)', 'Nein'),
    zeile('Bruchschäden an Ableitungsrohren (außerhalb des Grundstücks)', 'Nein'),
    zeile('Glas', 'Nein'),
    zeile('Haustechnische Anlagen', 'Nein'),
    zeile('Mietausfall', 'Nein'),
    zeile('(Unmittelbare) Vorversicherung in den letzten 5 Jahren', 'Nein'),
    zeile('Ablehnung eines vergleichbaren Antrages in der Vergangenheit', 'Nein'),
    zeile('Vorschäden in den letzten 5 Jahren (auch unversicherte)', 'Nein')
  ], { ort: 'Risikoangaben, Wohngebäude #2' }),
  tabelle([
    abschnitt('Gewünschter Versicherungsschutz (Basisdaten)'),
    zeile('Sonstige Informationen (maximal 1.000 Zeichen)', '[[vorversicherung,a5|Keine Vorversicherung da absoluter Neubau.]] Die Altimmobilie wurde abgerissen und das Grundstück völlig neu bebaut.'),
    zeile('Selbstbeteiligung', '[[sbObjekt#1,sbObjekt#2|Max. 0 €]]'),
    zeile('Laufzeit', '[[laufzeit|1 Jahr]]')
  ], { ort: 'Gewünschter Versicherungsschutz (Basisdaten)' })
]

const seite5 = [
  tabelle([
    abschnitt('Gewünschter Versicherungsschutz (Basisdaten)'),
    zeile('Sonstige Informationen (maximal 1.000 Zeichen)', '[[a1,gefahren#1,gefahren#2|Bitte einmal mit und einmal ohne Elementar.]]'),
    zeile('Hinweis für Ausschreibungen in Eigenbearbeitung:', 'Bitte beachten Sie das aktuell gültige Produktportfolio. Bei der Auswahl der Versicherer findet KEIN Abgleich mit dem aktuell gültigem Produktportfolio statt.')
  ], { ort: 'Gewünschter Versicherungsschutz (Basisdaten)' })
]

const seite6 = [h('Interne Notizen', { ort: 'Interne Notizen' })]

const seite7 = [
  h('Ihre Daten', { ort: 'Ihre Daten (Kontakt beim Vertriebspartner)' }),
  tabelle([
    zeile('Kontakt Ausschreibung', 'Thomas Beispiel'),
    zeile('Betreute Sparten', 'Gebäudeversicherung für Wohnimmobilien'),
    zeile('Agenturnummer', '[[agenturnummer|999999999]]'),
    zeile('E-Mail', 'thomas.beispiel@musterfirma.de'),
    zeile('Telefonnummer', '030 12345678')
  ]),
  p('Hinweis: Diese Angaben wurden vom Partner hinterlegt. Eine notwendige Änderung der Angaben kann über diesen angestoßen werden. Die Kontaktdaten des Vertragsansprechpartner befinden sich oben in der Anfrage.')
]

const seite8 = [h('Nachrichten', { ort: 'Nachrichten' })]

const gebaeude = (nr, neubauwert) => ({
  [`holzbau#${nr}`]: { w: 'Nein', art: 'interpretiert', h: 'Bauart des Gebäudes: Massive Außenwände' },
  [`weicheBedachung#${nr}`]: { w: 'Nein', art: 'interpretiert', h: 'Art des Dachbelags: Harte Bedachung' },
  [`fertighaus#${nr}`]: 'Nein',
  [`baujahr#${nr}`]: '2025',
  [`wertermittlungsjahr#${nr}`]: { w: '1914', art: 'interpretiert', h: 'Basiswert „Wert 1914“' },
  [`leerstand#${nr}`]: { w: '0 %', art: 'interpretiert', h: 'Leerstand: Nein' },
  [`neubauwert#${nr}`]: neubauwert,
  [`gefahren#${nr}`]: { w: 'Feuer, Leitungswasser, Sturm/Hagel; Elementar als zweite Variante', art: 'interpretiert', h: 'Im Formular „Elementargefahren: Nein“, im Freitext „einmal mit und einmal ohne Elementar“' },
  [`sbObjekt#${nr}`]: { w: '0 €', h: 'Angabe „Max. 0 €“' }
})

export default {
  id: 'ANG-2026-2105',
  beispiel: 5,
  eingang: '17.11.2026',
  uhrzeit: '14:13',
  kanal: 'Vermittlerplattform',
  form: 'Plattform-Anfrage mit zwei Gebäuden',
  produkt: 'gebaeude',
  vorgangsart: 'Angebotsanfrage',
  kunde: 'WEG Musterstraße 10-12',
  objekte: ['Wohngebäude #1', 'Wohngebäude #2'],
  mail: {
    vonName: 'tecis',
    von: 'erika.musterfrau@beispiel.de',
    an: '{postfach}',
    betreff: 'Manuelle Anfrage Gebäudeversicherung für Wohnimmobilien – ID 1234567',
    vorschau: 'WEG Musterstraße 10-12, zwei Mehrfamilienhäuser, Baujahr 2025, Feuer, Leitungswasser, Sturm/Hagel …',
    anhaenge: [
      { name: 'Angebotsanfrage_tecis.pdf', typ: 'PDF, 8 Seiten', info: 'Formular der Vermittlerplattform mit Risikoangaben je Gebäude' }
    ]
  },
  dokumente: [
    { id: 'b5-anfrage', titel: 'Plattform-Anfrage', art: 'PDF der Vermittlerplattform, 8 Seiten', stil: 'plattform', seiten: [seite1, seite2, seite3, seite4, seite5, seite6, seite7, seite8] }
  ],
  felder: {
    vorgangsart: { w: 'Angebotsanfrage', art: 'interpretiert', h: 'Manuelle Anfrage über die Vermittlerplattform mit Risikoangaben und gewünschtem Versicherungsschutz' },
    sparte: { w: 'Gebäudeversicherung für Wohnimmobilien', h: 'Erfasst im Layout Gewerbliches Gebäude' },
    vermittler: 'tecis',
    ansprechpartner: 'Erika Musterfrau',
    vermittlerEmail: 'erika.musterfrau@beispiel.de',
    vermittlerTelefon: '+49 172 2345678',
    anfrageId: 'ID 1234567',
    agenturnummer: { w: '999999999', h: 'Steht auf Seite 1 beim Vertriebspartner und auf Seite 7 unter „Ihre Daten“' },
    beginn: '01.01.2027',
    laufzeit: '1 Jahr',
    betriebsstaette: { w: 'Musterstraße 10, 12345 Musterstadt', h: 'Für beide Gebäude ist dieselbe Anschrift eingetragen' },
    ...gebaeude(1, '113.876,00 Mark (Wert 1914)'),
    ...gebaeude(2, '25.000,00 Mark (Wert 1914)'),
    vorversicherung: { w: 'Nein', h: 'Neubau; die Altimmobilie wurde abgerissen' },
    vvAblehnungen: 'Nein',
    vorschaeden: 'Nein',
    vnName: 'WEG Musterstraße 10-12',
    vnAdresse: 'Musterstraße 10, 12345 Musterstadt',
    vnTelefon: '+49 171 1234567',
    vnEmail: 'max.mustermann@muster.de'
  },
  betriebsarten: [
    { key: 'ba1', bezeichnung: 'Wohngebäude: Mehrfamilienhaus, vermietet', anteil: '', treffer: 'naechste', begruendung: 'Zwei Mehrfamilienhäuser einer Wohnungseigentümergemeinschaft, Nutzung Vermietung, Anfrage über die Hausverwaltung.' }
  ],
  betriebsartNotiz: 'Kein Gewerbebetrieb, sondern vermietete Wohngebäude.',
  risikofragen: [
    { key: 'rf1', frage: 'Gebäude noch im Bau', antwort: 'Nein' },
    { key: 'rf2', frage: 'Wohn- und Gewerbefläche (ohne Keller)', antwort: '412 je Gebäude' },
    { key: 'rf3', frage: 'Keller vorhanden', antwort: 'Nein' },
    { key: 'rf4', frage: 'Photovoltaikanlage', antwort: 'Nein' },
    { key: 'rf5', frage: 'Bauartklasse', antwort: 'BAK I' },
    { key: 'rf6', frage: 'Kern- oder Teilsanierung', antwort: 'Nein' },
    { key: 'rf7', frage: 'Erweiterte Deckung', antwort: 'Nein' },
    { key: 'rf8', frage: 'Unbenannte Gefahren', antwort: 'Nein' },
    { key: 'rf9', frage: 'Bruchschäden an Ableitungsrohren (auf und außerhalb des Grundstücks)', antwort: 'Nein' },
    { key: 'rf10', frage: 'Glas', antwort: 'Nein' },
    { key: 'rf11', frage: 'Haustechnische Anlagen', antwort: 'Nein' },
    { key: 'rf12', frage: 'Mietausfall', antwort: 'Nein' }
  ],
  auffaelligkeiten: [
    {
      key: 'a1', titel: 'Elementar: zwei Varianten gewünscht', wirkung: 'hinweis',
      text: 'Je Gebäude steht „Elementargefahren: Nein“, im Freitext aber „Bitte einmal mit und einmal ohne Elementar“. Gewünscht sind also zwei Angebotsvarianten.'
    },
    {
      key: 'a2', titel: 'Versicherungssumme von Gebäude #2', wirkung: 'rueckfrage',
      text: 'Beide Gebäude haben dieselbe Fläche (412) und dasselbe Baujahr. Gebäude #1 ist mit 113.876,00 Mark (Wert 1914) angegeben, Gebäude #2 mit 25.000,00 Mark.',
      frage: 'Bitte bestätigen Sie die Versicherungssumme für Wohngebäude #2: Angegeben sind 25.000,00 Mark (Wert 1914), für Wohngebäude #1 mit gleicher Fläche 113.876,00 Mark'
    },
    {
      key: 'a3', titel: 'Anschrift von Gebäude #2', wirkung: 'rueckfrage',
      text: 'Für beide Gebäude ist „Musterstraße 10“ eingetragen, das Feld Hausnummer ist leer. Die WEG lautet auf Musterstraße 10-12.',
      frage: 'Anschrift von Wohngebäude #2: Eingetragen ist wie bei Wohngebäude #1 die Musterstraße 10, die WEG lautet auf Musterstraße 10-12'
    },
    {
      key: 'a4', titel: 'Mark und Euro mit demselben Betrag', wirkung: 'hinweis',
      text: 'Die „Gesamtversicherungssumme“ trägt denselben Betrag wie der Wert 1914, einmal in Mark und einmal in Euro. Ins Deckblatt übernommen ist der Wert 1914.'
    },
    {
      key: 'a5', titel: 'Neubau ohne Vorversicherung', wirkung: 'hinweis',
      text: 'Baujahr 2025; laut Freitext wurde die Altimmobilie abgerissen und das Grundstück neu bebaut.'
    }
  ],
  gesamteinschaetzung: 'Zwei neu gebaute, vermietete Mehrfamilienhäuser (Baujahr 2025, massiv, harte Bedachung, je 412 m²) einer Wohnungseigentümergemeinschaft, angefragt über die Hausverwaltung. Gewünscht sind Feuer, Leitungswasser und Sturm/Hagel ohne Selbstbeteiligung, jeweils mit und ohne Elementar. Vor dem Angebot zu klären sind die Anschrift und die auffällig niedrige Versicherungssumme von Gebäude #2.'
}
