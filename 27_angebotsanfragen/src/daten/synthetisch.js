/**
 * Synthetische Eingänge.
 *
 * Neben den fünf Beispielanfragen liegen weitere, frei erfundene Anfragen im
 * Postfach. Sie zeigen die Layouts Geschäftsinhalt und Elektronik, eine Mail
 * mit dem Versicherungsschein des Vorversicherers als Anhang („analog
 * Vorvertrag“), einen Dreizeiler mit vielen Lücken und einen Eingang, der gar
 * keine Angebotsanfrage ist.
 *
 * Alle Namen, Anschriften, Nummern und Versicherer sind erfunden. Die
 * Telefonnummern liegen in den dafür freigehaltenen Nummernbereichen, die
 * Mailadressen enden auf „.example“.
 */

import { p, kopf, linie, titel, tabelle, abschnitt, zeile } from './bausteine.js'

function langesDatum(datum, uhrzeit) {
  const [t, m, j] = datum.split('.').map(Number)
  const d = new Date(j, m - 1, t)
  const tag = d.toLocaleDateString('de-DE', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
  return `${tag} ${uhrzeit}`
}

/** Baut die Seite einer einfachen E-Mail: Kopfzeilen, Text, Signatur. */
function mailSeite({ vonName, von, datum, uhrzeit, betreff, anlagen, text, signatur }) {
  const zeilen = [
    ['Von:', `${vonName} <[[vermittlerEmail|${von}]]>`],
    ['Gesendet:', langesDatum(datum, uhrzeit)],
    ['An:', '{postfach}'],
    ['Betreff:', betreff]
  ]
  if (anlagen) zeilen.push(['Anlagen:', anlagen])
  return [
    kopf(zeilen, { ort: 'Kopfzeilen der Mail' }),
    linie(),
    ...text.map((t, i) => p(t, i === 0 ? { ort: 'Mailtext' } : undefined)),
    ...signatur.map((t, i) => p(t, i === 0 ? { ort: 'Signatur des Vermittlers' } : undefined))
  ]
}

function baue(spec) {
  const m = spec.mail
  const seite = mailSeite({ ...m, datum: spec.eingang, uhrzeit: spec.uhrzeit })
  const reinerBetreff = m.betreff.replace(/\[\[[^\]|]+\|([^\]]*)\]\]/g, '$1')
  return {
    beispiel: null,
    kanal: 'E-Mail',
    risikofragen: [],
    auffaelligkeiten: [],
    betriebsarten: [],
    ...spec.vorgang,
    id: spec.id,
    eingang: spec.eingang,
    uhrzeit: spec.uhrzeit,
    mail: {
      vonName: m.vonName,
      von: m.von,
      an: '{postfach}',
      betreff: reinerBetreff,
      vorschau: m.vorschau,
      anhaenge: m.anhaenge || []
    },
    dokumente: [
      { id: `${spec.id}-mail`, titel: 'E-Mail', art: 'E-Mail des Vermittlers', stil: 'brief', seiten: [seite] },
      ...(spec.anhang ? [spec.anhang] : [])
    ]
  }
}

// ------------------------------------------------------------ Anhänge

const GERAETELISTE = {
  id: 'ANG-2026-2112-liste', titel: 'Geräteliste', art: 'Anhang, 1 Seite', stil: 'brief',
  seiten: [[
    titel('Geräteliste Praxis Dr. Hartwig & Kollegen', { stil: 'klein', ort: 'Geräteliste (Anhang)' }),
    p('Stand Oktober 2026, Neuwerte ohne Mehrwertsteuer', 'klein grau'),
    tabelle([
      abschnitt('Behandlung'),
      zeile('Behandlungseinheit 1 (Zimmer 1), [[rf1|Anschaffung 10/2026]]', '58.000 €'),
      zeile('Behandlungseinheit 2 (Zimmer 2), Anschaffung 10/2026', '58.000 €'),
      zeile('Behandlungseinheit 3 (Zimmer 3), Anschaffung 10/2026', '58.000 €'),
      abschnitt('Diagnostik'),
      zeile('DVT-Röntgengerät, Anschaffung 10/2026', '139.000 €'),
      abschnitt('Praxislabor'),
      zeile('CAD/CAM-Fräse und Intraoralscanner', '71.000 €'),
      abschnitt('Praxis-IT'),
      zeile('Server, 9 Arbeitsplätze, Netzwerk', '36.000 €'),
      abschnitt('Summe'),
      zeile('Neuwert gesamt', '[[vsElektronik,a1|420.000 €]]')
    ], { kopf: ['GERÄT', 'NEUWERT'] })
  ]]
}

const VORVERTRAG = {
  id: 'ANG-2026-2113-police', titel: 'Versicherungsschein des Vorversicherers', art: 'Anhang, 2 Seiten', stil: 'brief',
  seiten: [
    [
      titel('[[vvVersicherer|Granit Versicherung AG]]', { stil: 'klein', ort: 'Versicherungsschein, Seite 1' }),
      p('Versicherungsschein zur Gewerbe-Gebäudeversicherung', 'fett'),
      p('Versicherungsschein-Nr. [[vvScheinnummer|GG-70.418.226]] · Ausfertigung vom 14.01.2025 (Nachtrag 3)', 'klein'),
      tabelle([
        abschnitt('Versicherungsnehmer'),
        zeile('Name', 'Spedition Reimers GmbH & Co. KG'),
        zeile('Anschrift', '[[vnAdresse|Hafenweg 21, 21079 Hamburg]]'),
        abschnitt('Vertrag'),
        zeile('Vertragsbeginn', '01.01.2019'),
        zeile('Ablauf', '31.12.2026, Verlängerung um je ein Jahr'),
        zeile('Zahlungsweise', '[[zahlweise|jährlich]]'),
        zeile('Jahresbeitrag inkl. Versicherungsteuer', '[[vvJahresbeitrag|3.186,40 €]]'),
        abschnitt('Versicherungsort und Gebäude'),
        zeile('Versicherungsort', '[[betriebsstaette|Am Güterbahnhof 6, 21629 Neu Wulmstorf]]'),
        zeile('Versichertes Gebäude', '[[ba1|Lagerhalle mit Büroanbau]]'),
        zeile('Nutzung', '[[ba1|Lagerung und Umschlag von Stückgut]], [[rf1|keine Gefahrstoffe]]'),
        zeile('Baujahr', '[[baujahr#1|1998]]'),
        zeile('Bauart', '[[holzbau#1|Stahlskelett mit Sandwichpaneelen]], [[offeneSeiten#1|allseitig geschlossen]]'),
        zeile('Dach', '[[weicheBedachung#1|Trapezblech (harte Bedachung)]]'),
        zeile('Leerstand', '[[leerstand#1|keiner]]'),
        zeile('Denkmalschutz', '[[denkmalschutz#1|nein]]')
      ])
    ],
    [
      p('Versicherungsschein-Nr. GG-70.418.226 · Seite 2', { stil: 'klein grau', ort: 'Versicherungsschein, Seite 2' }),
      tabelle([
        abschnitt('Versicherungssumme'),
        zeile('Neubauwert (gleitender Neuwert)', '[[neubauwert#1|2.450.000 €]]'),
        zeile('Wertermittlung', 'Gutachten aus dem Jahr [[wertermittlungsjahr#1,a2|2021]]'),
        abschnitt('Versicherte Gefahren'),
        zeile('Feuer', '[[gefahren#1|versichert]]'),
        zeile('Leitungswasser', '[[gefahren#1|versichert]]'),
        zeile('Sturm/Hagel', '[[gefahren#1|versichert]]'),
        zeile('Weitere Naturgefahren (Elementar)', '[[a3|nicht versichert]]'),
        zeile('Glas', 'nicht versichert'),
        abschnitt('Selbstbeteiligung'),
        zeile('Je Schadenfall', '[[sbObjekt#1|1.000 €]]'),
        abschnitt('Sicherungen'),
        zeile('Brandmeldeanlage', '[[rf2|vorhanden, auf die Leitstelle aufgeschaltet]]'),
        zeile('Sprinkleranlage', '[[rf3|nicht vorhanden]]')
      ])
    ]
  ]
}

// ------------------------------------------------------------ Eingänge

const SPECS = [
  {
    id: 'ANG-2026-2111', eingang: '29.10.2026', uhrzeit: '09:12',
    mail: {
      vonName: 'Jana Kessler', von: 'j.kessler@kessler-brandt.example',
      betreff: '[[vorgangsart|Angebotsanfrage]] [[sparte|Geschäftsinhalt]] – Backstube Wiegand GmbH',
      vorschau: 'für unsere Kundin bitten wir um ein Angebot zur Geschäftsinhaltsversicherung. Versicherungsnehmer: Backstube Wiegand GmbH …',
      text: [
        'Sehr geehrte Damen und Herren,',
        'für unsere Kundin bitten wir um ein Angebot zur Geschäftsinhaltsversicherung.',
        'Versicherungsnehmer: [[vnName|Backstube Wiegand GmbH]], [[vnAdresse|Severinstraße 112, 50678 Köln]]\nAnsprechpartnerin: Frau Wiegand, Tel. [[vnTelefon|0221 4710 142]], [[vnEmail|buero@backstube-wiegand.example]]\nBetrieb: [[ba1|Bäckerei mit eigener Backstube]] (rund [[ba1|80 %]] des Umsatzes) und [[ba2|Café mit 24 Sitzplätzen]] (rund [[ba2|20 %]])\nBetriebsstätte: [[betriebsstaette|Severinstraße 112, 50678 Köln]], [[rf3|Erdgeschoss, gemietet]]',
        'Gewünscht:\n- Beginn [[beginn|01.01.2027]], Laufzeit [[laufzeit|3 Jahre]], Zahlweise [[zahlweise|vierteljährlich]]\n- Versicherungssumme Inhalt [[vs|180.000 €]] (Einrichtung, Backöfen, Waren und Vorräte)\n- Gefahren: [[versicherteInhalte|Feuer, Einbruchdiebstahl, Leitungswasser, Sturm/Hagel]], dazu [[versicherteInhalte|Glas]] für die Schaufensterfront\n- Selbstbehalt [[sb|500 €]]',
        '[[vorversicherung|Vorversicherung]]: [[vvVersicherer|Nordlicht Versicherung]], Schein-Nr. [[vvScheinnummer|GI-4471902-3]], Jahresbeitrag [[vvJahresbeitrag|1.240,00 €]], von uns [[vvStatus|zum 31.12.2026 gekündigt]].\nVorschäden: [[vorschaeden,a1|ein Leitungswasserschaden im März 2023, reguliert mit 2.800 €]]. Sonst keine.',
        'Sicherungen: [[rf1|Einbruchmeldeanlage mit Aufschaltung]], [[rf2|Rollgitter vor der Eingangstür]].',
        'Unsere Agenturnummer: [[agenturnummer|482-17-3350]]'
      ],
      signatur: [
        'Mit freundlichen Grüßen\n[[ansprechpartner|Jana Kessler]]',
        '[[vermittler|Kessler & Brandt Versicherungsmakler GmbH]]\nTel. [[vermittlerTelefon|0221 4710 177]]'
      ]
    },
    vorgang: {
      form: 'E-Mail mit allen Angaben',
      produkt: 'gihv', vorgangsart: 'Angebotsanfrage', kunde: 'Backstube Wiegand GmbH',
      felder: {
        vorgangsart: { w: 'Angebotsanfrage', h: 'Betreff und erster Satz der Mail' },
        sparte: 'Geschäftsinhalt',
        vermittler: 'Kessler & Brandt Versicherungsmakler GmbH', ansprechpartner: 'Jana Kessler',
        vermittlerEmail: 'j.kessler@kessler-brandt.example', vermittlerTelefon: '0221 4710 177',
        agenturnummer: '482-17-3350',
        beginn: '01.01.2027', laufzeit: '3 Jahre',
        betriebsstaette: '50678 Köln, Severinstraße 112',
        versicherteInhalte: 'Feuer, Einbruchdiebstahl, Leitungswasser, Sturm/Hagel, Glas',
        zahlweise: 'vierteljährlich', vs: '180.000 €', sb: '500 €',
        vorversicherung: { w: 'Ja', art: 'interpretiert', h: 'Vorversicherer, Scheinnummer und Beitrag sind genannt' },
        vvVersicherer: 'Nordlicht Versicherung', vvStatus: 'zum 31.12.2026 gekündigt',
        vvJahresbeitrag: '1.240,00 €', vvScheinnummer: 'GI-4471902-3',
        vorschaeden: '1 Leitungswasserschaden im März 2023, 2.800 €',
        vnName: 'Backstube Wiegand GmbH', vnAdresse: 'Severinstraße 112, 50678 Köln',
        vnTelefon: '0221 4710 142', vnEmail: 'buero@backstube-wiegand.example'
      },
      betriebsarten: [
        { key: 'ba1', bezeichnung: 'Bäckerei mit Backstube', anteil: '80 %', treffer: 'exakt', begruendung: 'Wörtlich genannt, Anteil laut Vermittler.' },
        { key: 'ba2', bezeichnung: 'Café', anteil: '20 %', treffer: 'exakt', begruendung: 'Café mit 24 Sitzplätzen im selben Geschäft.' }
      ],
      betriebsartNotiz: 'Zwei Tätigkeiten mit Aufteilung nach Umsatz.',
      risikofragen: [
        { key: 'rf1', frage: 'Einbruchmeldeanlage', antwort: 'Ja, mit Aufschaltung' },
        { key: 'rf2', frage: 'Mechanische Sicherung', antwort: 'Rollgitter vor der Eingangstür' },
        { key: 'rf3', frage: 'Lage der Räume', antwort: 'Erdgeschoss, gemietet' }
      ],
      auffaelligkeiten: [
        { key: 'a1', titel: 'Ein Vorschaden Leitungswasser', wirkung: 'hinweis', text: 'Im März 2023 gab es einen Leitungswasserschaden über 2.800 €. Weitere Vorschäden nennt der Vermittler nicht.' }
      ],
      gesamteinschaetzung: 'Bäckerei mit Café in gemieteten Räumen im Erdgeschoss, 180.000 € Inhalt, gesichert durch Einbruchmeldeanlage und Rollgitter. Ein Leitungswasserschaden in fünf Jahren. Die Mail enthält alle Angaben für das Angebot.'
    }
  },
  {
    id: 'ANG-2026-2112', eingang: '04.11.2026', uhrzeit: '16:48',
    mail: {
      vonName: 'Mehmet Aydin', von: 'aydin@aydin-makler.example',
      betreff: 'Elektronik Praxis Dr. Hartwig',
      anlagen: 'Geraeteliste_Praxis_Hartwig.pdf',
      vorschau: 'die Zahnarztpraxis Dr. Hartwig & Kollegen hat im Oktober neue Geräte angeschafft und möchte die Praxistechnik absichern …',
      anhaenge: [{ name: 'Geraeteliste_Praxis_Hartwig.pdf', typ: 'PDF, 1 Seite', info: 'Geräte mit Neuwerten' }],
      text: [
        'Guten Tag,',
        'die [[vnName|Zahnarztpraxis Dr. Hartwig & Kollegen]] ([[vnAdresse|Sendlinger Straße 31, 80331 München]]) hat im Oktober neue Geräte angeschafft und möchte die Praxistechnik über eine [[sparte|Elektronikversicherung]] absichern. Bitte um ein [[vorgangsart|Angebot]].',
        'Zu versichern sind drei Behandlungseinheiten, ein DVT-Röntgengerät, das Praxislabor und die Praxis-IT. Neuwert zusammen [[vsElektronik,a1|420.000 €]], die Geräteliste hängt an.\nStandort ist die [[ba1|Praxis]] in der [[betriebsstaette|Sendlinger Straße 31, 80331 München]], [[rf2|2. Obergeschoss]].\nBeginn bitte zum [[beginn|01.12.2026]].',
        'Agentur [[agenturnummer|317-52-9046]].'
      ],
      signatur: [
        'Viele Grüße\n[[ansprechpartner|Mehmet Aydin]]',
        '[[vermittler|Aydin Finanz- und Versicherungsmakler e.K.]]\n[[vermittlerTelefon|089 99998 163]]'
      ]
    },
    anhang: GERAETELISTE,
    vorgang: {
      form: 'E-Mail mit Geräteliste als Anhang',
      produkt: 'elektronik', vorgangsart: 'Angebotsanfrage', kunde: 'Zahnarztpraxis Dr. Hartwig & Kollegen',
      felder: {
        vorgangsart: { w: 'Angebotsanfrage', h: '„Bitte um ein Angebot“' },
        sparte: 'Elektronik',
        vermittler: 'Aydin Finanz- und Versicherungsmakler e.K.', ansprechpartner: 'Mehmet Aydin',
        vermittlerEmail: 'aydin@aydin-makler.example', vermittlerTelefon: '089 99998 163',
        agenturnummer: '317-52-9046',
        beginn: '01.12.2026',
        betriebsstaette: '80331 München, Sendlinger Straße 31',
        vsElektronik: { w: '420.000 €', h: 'In der Mail genannt und gleich der Summe der Geräteliste im Anhang' },
        vnName: 'Zahnarztpraxis Dr. Hartwig & Kollegen', vnAdresse: 'Sendlinger Straße 31, 80331 München'
      },
      betriebsarten: [
        { key: 'ba1', bezeichnung: 'Zahnarztpraxis', anteil: '', treffer: 'exakt', begruendung: 'Der Versicherungsnehmer ist eine Zahnarztpraxis.' }
      ],
      risikofragen: [
        { key: 'rf1', frage: 'Alter der Geräte', antwort: 'Anschaffung Oktober 2026' },
        { key: 'rf2', frage: 'Lage der Räume', antwort: '2. Obergeschoss' }
      ],
      auffaelligkeiten: [
        { key: 'a1', titel: 'Summe der Geräteliste stimmt', wirkung: 'hinweis', text: 'Die sechs Positionen der Geräteliste ergeben zusammen 420.000 € und decken sich mit dem Wert in der Mail.' }
      ],
      gesamteinschaetzung: 'Zahnarztpraxis mit neu angeschaffter Technik im Neuwert von 420.000 €, davon 139.000 € für ein DVT-Röntgengerät. Standort, Beginn und Versicherungssumme sind klar. Es fehlen der Selbstbehalt und die Angaben zu Vorversicherung und Vorschäden.'
    }
  },
  {
    id: 'ANG-2026-2113', eingang: '10.11.2026', uhrzeit: '11:05',
    mail: {
      vonName: 'Carolin Vogt', von: 'c.vogt@vogt-assekuranz.example',
      betreff: 'Lagerhalle Spedition Reimers – bitte Angebot analog Vorvertrag',
      anlagen: 'Versicherungsschein_Granit_GG-70418226.pdf',
      vorschau: 'unser Kunde Spedition Reimers möchte seine Lagerhalle neu eindecken. Bitte ein Angebot analog Vorvertrag …',
      anhaenge: [{ name: 'Versicherungsschein_Granit_GG-70418226.pdf', typ: 'PDF, 2 Seiten', info: 'Versicherungsschein des Vorversicherers' }],
      text: [
        'Hallo zusammen,',
        'unser Kunde [[vnName|Spedition Reimers GmbH & Co. KG]] möchte seine Lagerhalle neu eindecken. Der [[vorversicherung|Vertrag beim bisherigen Versicherer]] ist [[vvStatus|zum 31.12.2026 gekündigt]].',
        'Bitte ein [[vorgangsart|Angebot]] zur [[sparte|Gebäudeversicherung]] [[a1|analog Vorvertrag]], Beginn [[beginn|01.01.2027]]. Die Police des Vorversicherers hängt an. [[vorschaeden|Schäden gab es seit Vertragsbeginn 2019 keine.]]',
        'Agenturnummer [[agenturnummer|209-64-1187]]'
      ],
      signatur: [
        'Danke und Gruß\n[[ansprechpartner|Carolin Vogt]]',
        '[[vermittler|Vogt Assekuranz GmbH]] · [[vermittlerTelefon|040 66969 191]]'
      ]
    },
    anhang: VORVERTRAG,
    vorgang: {
      form: 'E-Mail mit Vorvertrag als Anhang',
      produkt: 'gebaeude', vorgangsart: 'Angebotsanfrage', kunde: 'Spedition Reimers GmbH & Co. KG',
      objekte: ['Lagerhalle mit Büroanbau'],
      felder: {
        vorgangsart: { w: 'Angebotsanfrage', h: '„Bitte ein Angebot … analog Vorvertrag“' },
        sparte: 'Gewerbliches Gebäude',
        vermittler: 'Vogt Assekuranz GmbH', ansprechpartner: 'Carolin Vogt',
        vermittlerEmail: 'c.vogt@vogt-assekuranz.example', vermittlerTelefon: '040 66969 191',
        agenturnummer: '209-64-1187',
        beginn: '01.01.2027',
        betriebsstaette: { w: '21629 Neu Wulmstorf, Am Güterbahnhof 6', h: 'Versicherungsort laut Versicherungsschein; er weicht von der Anschrift des Versicherungsnehmers ab' },
        zahlweise: { w: 'jährlich', h: 'Zahlungsweise des Vorvertrags' },
        'holzbau#1': { w: 'Nein', art: 'interpretiert', h: 'Bauart: Stahlskelett mit Sandwichpaneelen' },
        'weicheBedachung#1': { w: 'Nein', art: 'interpretiert', h: 'Dach: Trapezblech (harte Bedachung)' },
        'offeneSeiten#1': { w: 'Nein', art: 'interpretiert', h: 'Laut Versicherungsschein allseitig geschlossen' },
        'denkmalschutz#1': 'Nein',
        'baujahr#1': '1998',
        'wertermittlungsjahr#1': '2021',
        'leerstand#1': { w: '0 %', art: 'interpretiert', h: 'Leerstand: keiner' },
        'neubauwert#1': '2.450.000 €',
        'gefahren#1': { w: 'Feuer, Leitungswasser, Sturm/Hagel', h: 'Elementar und Glas sind im Vorvertrag nicht versichert' },
        'sbObjekt#1': '1.000 €',
        vorversicherung: { w: 'Ja', art: 'interpretiert', h: 'Vertrag beim bisherigen Versicherer, Versicherungsschein liegt bei' },
        vvVersicherer: 'Granit Versicherung AG', vvStatus: 'zum 31.12.2026 gekündigt',
        vvJahresbeitrag: '3.186,40 €', vvScheinnummer: 'GG-70.418.226',
        vorschaeden: { w: 'keine seit Vertragsbeginn 2019', h: 'Aussage des Vermittlers in der Mail' },
        vnName: 'Spedition Reimers GmbH & Co. KG', vnAdresse: 'Hafenweg 21, 21079 Hamburg'
      },
      betriebsarten: [
        { key: 'ba1', bezeichnung: 'Lagerhalle (Lagerung und Umschlag von Stückgut)', anteil: '', treffer: 'exakt', begruendung: 'Gebäude und Nutzung stehen im Versicherungsschein des Vorversicherers.' }
      ],
      risikofragen: [
        { key: 'rf1', frage: 'Lagerung von Gefahrstoffen', antwort: 'Nein' },
        { key: 'rf2', frage: 'Brandmeldeanlage', antwort: 'Vorhanden, auf die Leitstelle aufgeschaltet' },
        { key: 'rf3', frage: 'Sprinkleranlage', antwort: 'Nicht vorhanden' }
      ],
      auffaelligkeiten: [
        { key: 'a1', titel: 'Alle Werte aus dem Vorvertrag', wirkung: 'hinweis', text: 'Die Mail nennt keine Werte. Baujahr, Bauart, Neubauwert, Gefahren und Selbstbeteiligung stammen aus dem Versicherungsschein des Vorversicherers.' },
        { key: 'a2', titel: 'Wertermittlung aus 2021', wirkung: 'hinweis', text: 'Der Neubauwert von 2.450.000 € beruht auf einem Gutachten aus dem Jahr 2021.' },
        { key: 'a3', titel: 'Elementar bisher nicht versichert', wirkung: 'hinweis', text: 'Im Vorvertrag sind weitere Naturgefahren nicht eingeschlossen. „Analog Vorvertrag“ heißt: ohne Elementar.' }
      ],
      gesamteinschaetzung: 'Lagerhalle mit Büroanbau einer Spedition, Baujahr 1998, Stahlskelett, harte Bedachung, Brandmeldeanlage, keine Gefahrstoffe. Neubauwert 2.450.000 € nach Gutachten von 2021, schadenfrei seit 2019. Gewünscht ist die Deckung des Vorvertrags: Feuer, Leitungswasser, Sturm/Hagel mit 1.000 € Selbstbeteiligung. Alle Angaben liegen vor, überwiegend aus dem Anhang.'
    }
  },
  {
    id: 'ANG-2026-2114', eingang: '06.11.2026', uhrzeit: '13:27',
    mail: {
      vonName: 'Dennis Brückner', von: 'brueckner@maklerbuero-brueckner.example',
      betreff: 'BHV Anfrage Salon & Lounge Yilmaz',
      vorschau: 'ich brauche ein Angebot Betriebshaftpflicht für einen etwas ungewöhnlichen Betrieb: vorne Friseursalon, hinten Shisha-Café …',
      text: [
        'Hallo,',
        'ich brauche ein [[vorgangsart|Angebot]] [[sparte|Betriebshaftpflicht]] für einen etwas ungewöhnlichen Betrieb: [[vnName|Salon & Lounge Yilmaz, Inh. Selin Yilmaz]], [[vnAdresse|Zeil 74, 60313 Frankfurt am Main]].',
        'Vorne ist ein [[ba1|Friseursalon]] mit vier Plätzen, im hinteren Teil betreibt sie abends ein [[ba2,a1|Shisha-Café]]. Umsatz zusammen rund [[umsatz|210.000 €]], davon etwa [[ba1|60 % Salon]] und [[ba2|40 % Café]].\nPersonal: [[vollzeit|Inhaberin plus 2 Friseurinnen in Vollzeit]], [[teilzeit|1 Teilzeitkraft]] und [[geringfuegig|3 Aushilfen auf Minijob-Basis]] im Café.',
        'Start am liebsten zum [[beginn|01.12.2026]], [[vs|5 Mio.]] Deckung, [[sb|500 €]] SB, [[zahlweise|monatliche]] Zahlung.\nDie [[vorversicherung|Haftpflicht lief bisher]] bei der [[vvVersicherer|Silberberg]], dort aber [[a1|nur für den Salon]]. [[a2|Die Police reiche ich nach.]]',
        'Agentur [[agenturnummer|564-08-2219]]'
      ],
      signatur: ['VG\n[[ansprechpartner|Dennis Brückner]]\n[[vermittler|Maklerbüro Brückner]], [[vermittlerTelefon|069 90009 154]]']
    },
    vorgang: {
      form: 'E-Mail, Mischbetrieb',
      produkt: 'bhv', vorgangsart: 'Angebotsanfrage', kunde: 'Salon & Lounge Yilmaz',
      felder: {
        vorgangsart: { w: 'Angebotsanfrage', h: '„ich brauche ein Angebot“' },
        sparte: 'Betriebshaftpflicht',
        vermittler: 'Maklerbüro Brückner', ansprechpartner: 'Dennis Brückner',
        vermittlerEmail: 'brueckner@maklerbuero-brueckner.example', vermittlerTelefon: '069 90009 154',
        agenturnummer: '564-08-2219',
        beginn: '01.12.2026',
        umsatz: { w: 'rund 210.000 €' },
        vollzeit: { w: '3', art: 'interpretiert', h: 'Inhaberin + 2 Friseurinnen in Vollzeit' },
        teilzeit: '1',
        geringfuegig: '3',
        zahlweise: 'monatlich', vs: '5 Mio. €', sb: '500 €',
        vorversicherung: { w: 'Ja', art: 'interpretiert', h: 'Bisher bei der Silberberg versichert, aber nur für den Salon' },
        vvVersicherer: 'Silberberg',
        vnName: 'Salon & Lounge Yilmaz, Inh. Selin Yilmaz', vnAdresse: 'Zeil 74, 60313 Frankfurt am Main'
      },
      betriebsarten: [
        { key: 'ba1', bezeichnung: 'Friseursalon', anteil: '60 %', treffer: 'exakt', begruendung: 'Friseursalon mit vier Plätzen, 60 % des Umsatzes.' },
        { key: 'ba2', bezeichnung: 'Shisha-Bar, Shisha-Café', anteil: '40 %', treffer: 'exakt', begruendung: 'Abendbetrieb im hinteren Teil, 40 % des Umsatzes.' }
      ],
      betriebsartNotiz: 'Mischbetrieb aus zwei sehr unterschiedlichen Tätigkeiten, mit Aufteilung nach Umsatz.',
      auffaelligkeiten: [
        { key: 'a1', titel: 'Vorversicherung deckte nur den Salon', wirkung: 'hinweis', text: 'Das Shisha-Café war bisher nicht mitversichert. Für diesen Teil gibt es keinen Vorvertrag und keine Schadenhistorie.' },
        { key: 'a2', titel: 'Police wird nachgereicht', wirkung: 'hinweis', text: 'Der Vermittler kündigt die Police des Vorversicherers an; sie liegt dem Eingang nicht bei.' }
      ],
      gesamteinschaetzung: 'Friseursalon mit abendlichem Shisha-Café unter einem Dach, 210.000 € Umsatz, sieben Beschäftigte einschließlich Inhaberin. Die Aufteilung 60 zu 40 ist genannt. Für das Angebot fehlen die Lohnsumme und die Vorschäden; die bisherige Haftpflicht galt nur für den Salon.'
    }
  },
  {
    id: 'ANG-2026-2115', eingang: '12.11.2026', uhrzeit: '08:02',
    mail: {
      vonName: 'Finn Lührs', von: 'f.luehrs@hmg-luehrs.example',
      betreff: '[[vorgangsart|Angebotsanfrage]] Betriebshaftpflicht Malermeister Okafor GmbH',
      vorschau: 'bitte erstellen Sie uns ein Angebot zur Betriebshaftpflichtversicherung für folgenden Betrieb: Malermeister Okafor GmbH …',
      text: [
        'Sehr geehrte Damen und Herren,',
        'bitte erstellen Sie uns ein Angebot zur [[sparte|Betriebshaftpflichtversicherung]] für folgenden Betrieb:',
        'Firma: [[vnName|Malermeister Okafor GmbH]]\nAnschrift: [[vnAdresse|Bramfelder Chaussee 208, 22177 Hamburg]]\nKontakt: [[vnTelefon|040 66969 128]], [[vnEmail|info@maler-okafor.example]]\nIBAN: [[vnIban|DE89 3704 0044 0532 0130 00]]',
        'Tätigkeit: [[ba1|Maler- und Lackiererarbeiten]] im Innen- und Außenbereich, [[rf1|keine Arbeiten an Fassaden über 20 m Höhe]], [[rf2|keine Strahlarbeiten]]\nJahresnettoumsatz: [[umsatz|640.000 €]]\nJahreslohn- und -gehaltssumme: [[lohnsumme|218.000 €]]\nBeschäftigte: [[vollzeit|6 Vollzeit inkl. Geschäftsführer]], [[teilzeit|1 Teilzeit]], [[geringfuegig|1 Minijob]]\nSubunternehmer: [[subunternehmer|rund 35.000 € im Jahr]] (Gerüstbau)\nLeiharbeiter: [[leiharbeiter|keine]]',
        'Beginn: [[beginn|01.01.2027]], Laufzeit [[laufzeit|1 Jahr]]\nVersicherungssumme: [[vs|10 Mio. € pauschal]]\nSelbstbehalt: [[sb|250 €]]\nZahlweise: [[zahlweise|halbjährlich]]',
        '[[vorversicherung|Vorversicherung]]: [[vvVersicherer|Kompass Versicherung]], Schein-Nr. [[vvScheinnummer|BH-2290418]], Jahresbeitrag [[vvJahresbeitrag|2.914,00 €]], [[vvStatus,a1|ungekündigt, Ablauf 01.01.2027]]\nVorschäden 5 Jahre: [[vorschaeden|2022 ein Sachschaden (Farbspritzer auf Kundenfahrzeug), 1.150 €]]\nAblehnungen: [[vvAblehnungen|keine]]',
        'Agenturnummer: [[agenturnummer|731-29-4405]]'
      ],
      signatur: [
        'Mit freundlichen Grüßen\n[[ansprechpartner|Finn Lührs]]',
        '[[vermittler|Hanseatische Maklergesellschaft Lührs mbH]]\n[[vermittlerTelefon|040 66969 190]]'
      ]
    },
    vorgang: {
      form: 'E-Mail mit allen Angaben',
      produkt: 'bhv', vorgangsart: 'Angebotsanfrage', kunde: 'Malermeister Okafor GmbH',
      felder: {
        vorgangsart: { w: 'Angebotsanfrage', h: 'Steht wörtlich im Betreff' },
        sparte: 'Betriebshaftpflicht',
        vermittler: 'Hanseatische Maklergesellschaft Lührs mbH', ansprechpartner: 'Finn Lührs',
        vermittlerEmail: 'f.luehrs@hmg-luehrs.example', vermittlerTelefon: '040 66969 190',
        agenturnummer: '731-29-4405',
        beginn: '01.01.2027', laufzeit: '1 Jahr',
        umsatz: '640.000 €', lohnsumme: '218.000 €',
        leiharbeiter: 'keine', subunternehmer: 'rund 35.000 € (Gerüstbau)',
        vollzeit: '6', teilzeit: '1', geringfuegig: '1',
        zahlweise: 'halbjährlich', vs: '10 Mio. € pauschal', sb: '250 €',
        vorversicherung: { w: 'Ja', art: 'interpretiert', h: 'Vorversicherer, Scheinnummer und Beitrag sind genannt' },
        vvVersicherer: 'Kompass Versicherung', vvStatus: 'ungekündigt, Ablauf 01.01.2027',
        vvJahresbeitrag: '2.914,00 €', vvScheinnummer: 'BH-2290418', vvAblehnungen: 'keine',
        vorschaeden: '2022 ein Sachschaden (Farbspritzer auf Kundenfahrzeug), 1.150 €',
        vnName: 'Malermeister Okafor GmbH', vnAdresse: 'Bramfelder Chaussee 208, 22177 Hamburg',
        vnIban: 'DE89 3704 0044 0532 0130 00', vnTelefon: '040 66969 128', vnEmail: 'info@maler-okafor.example'
      },
      betriebsarten: [
        { key: 'ba1', bezeichnung: 'Maler- und Lackiererbetrieb', anteil: '', treffer: 'exakt', begruendung: 'Maler- und Lackiererarbeiten innen und außen, keine weiteren Tätigkeiten.' }
      ],
      risikofragen: [
        { key: 'rf1', frage: 'Arbeiten an Fassaden über 20 m Höhe', antwort: 'Nein' },
        { key: 'rf2', frage: 'Strahlarbeiten', antwort: 'Nein' }
      ],
      auffaelligkeiten: [
        { key: 'a1', titel: 'Vorvertrag ist ungekündigt', wirkung: 'hinweis', text: 'Die Vorversicherung läuft bis 01.01.2027 und ist laut Mail nicht gekündigt. Der gewünschte Beginn fällt auf den Ablauftag.' }
      ],
      gesamteinschaetzung: 'Malerbetrieb mit acht Beschäftigten, 640.000 € Umsatz und einem kleinen Sachschaden in fünf Jahren. Gerüstbau läuft über Subunternehmer. Die Mail ist in der Reihenfolge der Erfassung aufgebaut und vollständig.'
    }
  },
  {
    id: 'ANG-2026-2116', eingang: '05.11.2026', uhrzeit: '10:40',
    mail: {
      vonName: 'Sabrina Holt', von: 'holt@holt-versicherungsmakler.example',
      betreff: 'Frage Mietsachschäden Betriebshaftpflicht',
      vorschau: 'kurze Frage zur Betriebshaftpflicht: Sind in der Variante mit erweitertem Schutz Mietsachschäden mitversichert …',
      text: [
        'Guten Morgen,',
        'kurze [[vorgangsart|Frage]] zur [[sparte|Betriebshaftpflicht]]: [[anliegen|Sind in der Variante mit erweitertem Schutz Mietsachschäden an gemieteten Geschäftsräumen mitversichert, und bis zu welcher Summe?]] Mein Kunde, ein [[anliegen|Steuerbüro]], hat danach gefragt.',
        '[[vorgangsart|Ein Angebot brauche ich im Moment noch nicht.]]',
        'Agentur [[agenturnummer|650-33-7702]]'
      ],
      signatur: ['Danke und Gruß\n[[ansprechpartner|Sabrina Holt]]\n[[vermittler|Holt Versicherungsmakler]]']
    },
    vorgang: {
      form: 'E-Mail, Frage zum Tarif',
      produkt: 'sonstig', sparte: 'Betriebshaftpflicht', vorgangsart: 'Tarifauskunft', kunde: 'Holt Versicherungsmakler',
      einordnung: 'Die Vermittlerin fragt nach dem Deckungsumfang und schreibt ausdrücklich, dass sie noch kein Angebot braucht. Das ist eine Tarifauskunft.',
      weiterleitung: 'Weitergabe an die Tarifauskunft; für die Erfassung eines Angebots gibt es nichts zu tun',
      felder: {
        vorgangsart: { w: 'Tarifauskunft', art: 'interpretiert', h: '„kurze Frage“ und „Ein Angebot brauche ich im Moment noch nicht“' },
        sparte: 'Betriebshaftpflicht',
        vermittler: 'Holt Versicherungsmakler', ansprechpartner: 'Sabrina Holt',
        vermittlerEmail: 'holt@holt-versicherungsmakler.example',
        agenturnummer: '650-33-7702',
        anliegen: { w: 'Frage zum Deckungsumfang: Mietsachschäden an gemieteten Geschäftsräumen in der Variante mit erweitertem Schutz, mit Höchstsumme. Kunde ist ein Steuerbüro.', art: 'interpretiert', h: 'Aus dem Mailtext zusammengefasst' }
      },
      gesamteinschaetzung: 'Keine Angebotsanfrage, sondern eine Frage zum Deckungsumfang der Betriebshaftpflicht. Die Vermittlerin kündigt an, dass ein Angebot später folgen kann.'
    }
  },
  {
    id: 'ANG-2026-2117', eingang: '16.11.2026', uhrzeit: '17:55',
    mail: {
      vonName: 'Lars Petersen', von: 'lp@petersen-finanzberatung.example',
      betreff: 'Angebot Inhalt Radhaus Lindner',
      vorschau: 'bitte Angebot Inhaltsversicherung für meinen Kunden Radhaus Lindner: Fahrradladen mit Werkstatt, viele E-Bikes …',
      text: [
        'Moin,',
        'bitte [[vorgangsart|Angebot]] [[sparte|Inhaltsversicherung]] für meinen Kunden [[vnName|Radhaus Lindner, Inh. Tobias Lindner]]: [[ba1|Fahrradladen mit Werkstatt]], viele [[a1|E-Bikes]] im Laden. Beginn [[beginn|so schnell wie möglich]].',
        'Der Laden ist in [[betriebsstaette|Lüneburg, Am Sande]].'
      ],
      signatur: ['Gruß\n[[ansprechpartner|Lars Petersen]]\n[[vermittler|Petersen Finanzberatung]], Agentur [[agenturnummer|418-70-5563]]']
    },
    vorgang: {
      form: 'E-Mail, drei Zeilen',
      produkt: 'gihv', vorgangsart: 'Angebotsanfrage', kunde: 'Radhaus Lindner',
      felder: {
        vorgangsart: { w: 'Angebotsanfrage', h: '„bitte Angebot Inhaltsversicherung“' },
        sparte: { w: 'Geschäftsinhalt', art: 'interpretiert', h: '„Inhaltsversicherung“ für einen Laden' },
        vermittler: 'Petersen Finanzberatung', ansprechpartner: 'Lars Petersen',
        vermittlerEmail: 'lp@petersen-finanzberatung.example',
        agenturnummer: '418-70-5563',
        beginn: { w: 'schnellstmöglich', art: 'interpretiert', h: '„so schnell wie möglich“, ein Datum ist nicht genannt' },
        betriebsstaette: { w: '', art: 'fehlt', h: 'Genannt ist nur „Lüneburg, Am Sande“, ohne Hausnummer und Postleitzahl' },
        vnName: 'Radhaus Lindner, Inh. Tobias Lindner'
      },
      betriebsarten: [
        { key: 'ba1', bezeichnung: 'Einzelhandel mit Fahrrädern, mit Werkstatt', anteil: '', treffer: 'exakt', begruendung: 'Fahrradladen mit Werkstatt.' }
      ],
      auffaelligkeiten: [
        { key: 'a1', titel: 'E-Bikes im Laden', wirkung: 'hinweis', text: 'Der Vermittler erwähnt viele E-Bikes. Hochwertige Ware und Akkus sind für Einbruchdiebstahl und Feuer bedeutsam; eine Versicherungssumme ist nicht genannt.' }
      ],
      gesamteinschaetzung: 'Fahrradladen mit Werkstatt und vielen E-Bikes. Die Mail besteht aus drei Zeilen: Für ein Angebot fehlen die genaue Anschrift, die Versicherungssumme, die gewünschten Gefahren, der Selbstbehalt und die Angaben zu Vorversicherung und Vorschäden.'
    }
  },
  {
    id: 'ANG-2026-2118', eingang: '18.11.2026', uhrzeit: '09:31',
    mail: {
      vonName: 'Nadine Schröter', von: 'n.schroeter@schroeter-kollegen.example',
      betreff: '[[vorgangsart|Angebotsanfrage]] Elektronik – Planwerk Ingenieure',
      vorschau: 'für die Planwerk Ingenieure PartG mbB bitten wir um ein Angebot zur Elektronikversicherung …',
      text: [
        'Sehr geehrte Damen und Herren,',
        'für die [[vnName|Planwerk Ingenieure PartG mbB]], [[vnAdresse|Rudower Chaussee 17, 12489 Berlin]], bitten wir um ein Angebot zur [[sparte|Elektronikversicherung]].',
        'Betriebsart: [[ba1|Ingenieurbüro für Tragwerksplanung]]\nBetriebsstätte: [[betriebsstaette|Rudower Chaussee 17, 12489 Berlin]]\nZu versichern: Server, 14 CAD-Arbeitsplätze, zwei Großformatplotter und Vermessungsgeräte, Neuwert gesamt [[vsElektronik|96.000 €]]\nMobile Nutzung: [[rf1,a1|Vermessungsgeräte und 6 Notebooks werden auch auf Baustellen eingesetzt]]\nDatensicherung: [[rf2|täglich, zusätzlich extern]]',
        'Beginn [[beginn|01.01.2027]], Laufzeit [[laufzeit|1 Jahr]], Zahlweise [[zahlweise|jährlich]], Selbstbehalt [[sb|250 €]]\nVorversicherung: [[vorversicherung|keine]], Vorschäden: [[vorschaeden|keine]]',
        'Agenturnummer [[agenturnummer|295-41-6638]]'
      ],
      signatur: [
        'Mit freundlichen Grüßen\n[[ansprechpartner|Nadine Schröter]]',
        '[[vermittler|Schröter & Kollegen Versicherungsmakler GmbH]]\n[[vermittlerTelefon|030 23125 117]]'
      ]
    },
    vorgang: {
      form: 'E-Mail mit allen Angaben',
      produkt: 'elektronik', vorgangsart: 'Angebotsanfrage', kunde: 'Planwerk Ingenieure PartG mbB',
      felder: {
        vorgangsart: { w: 'Angebotsanfrage', h: 'Steht wörtlich im Betreff' },
        sparte: 'Elektronik',
        vermittler: 'Schröter & Kollegen Versicherungsmakler GmbH', ansprechpartner: 'Nadine Schröter',
        vermittlerEmail: 'n.schroeter@schroeter-kollegen.example', vermittlerTelefon: '030 23125 117',
        agenturnummer: '295-41-6638',
        beginn: '01.01.2027', laufzeit: '1 Jahr',
        betriebsstaette: '12489 Berlin, Rudower Chaussee 17',
        vsElektronik: '96.000 €',
        zahlweise: 'jährlich', sb: '250 €',
        vorversicherung: 'keine', vorschaeden: 'keine',
        vnName: 'Planwerk Ingenieure PartG mbB', vnAdresse: 'Rudower Chaussee 17, 12489 Berlin'
      },
      betriebsarten: [
        { key: 'ba1', bezeichnung: 'Ingenieurbüro (Bau- und Tragwerksplanung)', anteil: '', treffer: 'exakt', begruendung: 'Ingenieurbüro für Tragwerksplanung.' }
      ],
      risikofragen: [
        { key: 'rf1', frage: 'Nutzung außerhalb der Betriebsstätte', antwort: 'Ja, Vermessungsgeräte und 6 Notebooks auf Baustellen' },
        { key: 'rf2', frage: 'Datensicherung', antwort: 'Täglich, zusätzlich extern' }
      ],
      auffaelligkeiten: [
        { key: 'a1', titel: 'Geräte auch auf Baustellen', wirkung: 'hinweis', text: 'Vermessungsgeräte und sechs Notebooks werden außerhalb der Betriebsstätte eingesetzt. Für das Angebot ist der Außenversicherungsschutz zu beachten.' }
      ],
      gesamteinschaetzung: 'Ingenieurbüro mit 96.000 € Elektronik, darunter mobil genutzte Vermessungsgeräte und Notebooks. Keine Vorversicherung, keine Vorschäden, tägliche Datensicherung. Die Mail enthält alle Angaben für das Angebot.'
    }
  }
]

export const SYNTHETISCH = SPECS.map(baue)
