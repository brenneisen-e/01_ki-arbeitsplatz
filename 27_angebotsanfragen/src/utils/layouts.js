/**
 * Deckblatt-Layouts je Sparte.
 *
 * Das Deckblatt folgt exakt der Gliederung, die der Fachbereich für die
 * Erfassung im Angebotssystem vorgegeben hat: acht nummerierte Abschnitte je
 * Sparte, dazu eine fachliche Gesamteinschätzung und die Auffälligkeiten.
 * Vier Sparten haben ein eigenes Layout: Betriebshaftpflicht (BHV),
 * Geschäftsinhalt (GIHV), Elektronik und Gewerbliches Gebäude. Die Nummern
 * stehen wie in der Vorgabe – Abschnitt 4 (PHV / THV) gibt es nur in der BHV.
 *
 * Welche Angaben für ein Angebot zwingend sind (`pflicht`), ist eine Annahme
 * dieser Demo und wird im Piloten mit dem Fachbereich festgelegt.
 */

/** Wie ein Wert im Deckblatt zustande gekommen ist. */
export const ART = {
  gelesen: { label: 'wörtlich gelesen', kurz: 'gelesen' },
  interpretiert: { label: 'von der KI interpretiert', kurz: 'interpretiert' },
  recherche: { label: 'Recherche im Bestand', kurz: 'Recherche' },
  fehlt: { label: 'fehlt für das Angebot', kurz: 'fehlt' },
  leer: { label: 'nicht genannt', kurz: 'nicht genannt' }
}

const F = (label, extra = {}) => ({ label, ...extra })

export const FELDER = {
  // ---- Vorgang auf einen Blick
  vorgangsart: F('Vorgangsart', { hilfe: 'Was der Absender will: Angebotsanfrage, Tarifauskunft, Vertragsänderung …' }),
  sparte: F('Sparte', { hilfe: 'Sparte der Anfrage; sie bestimmt das Layout des Deckblatts' }),
  vermittler: F('Vermittler', { hilfe: 'Vermittler oder Vertriebspartner, der die Anfrage stellt' }),
  ansprechpartner: F('Ansprechpartner', { hilfe: 'Person beim Vermittler, an die eine Rückfrage geht' }),
  vermittlerEmail: F('E-Mail für Rückfragen', { hilfe: 'Adresse, an die der Rückfrage-Entwurf adressiert wird' }),
  vermittlerTelefon: F('Telefon', { hilfe: 'Telefonnummer des Vermittlers' }),
  anfrageId: F('Vorgangszeichen', { hilfe: 'Vorgangs-, Anfrage- oder Angebotsnummer aus dem Eingang' }),

  // ---- 1
  agenturnummer: F('Agenturnummer', {
    hilfe: 'Agenturnummer des Vermittlers im eigenen Haus',
    recherche: 'Agenturnummer zum Vermittler nachschlagen'
  }),

  // ---- 3
  beginn: F('Gewünschter Beginn', { hilfe: 'Datum, zu dem der Versicherungsschutz beginnen soll', frage: 'Gewünschter Versicherungsbeginn' }),
  laufzeit: F('Laufzeit', { hilfe: 'Gewünschte Vertragslaufzeit' }),

  // ---- 4 (nur BHV)
  phv: F('Privathaftpflicht (PHV)', { hilfe: 'Einschluss der Privathaftpflicht, nur in Verbindung mit der Betriebshaftpflicht' }),
  thv: F('Tierhalterhaftpflicht (THV)', { hilfe: 'Einschluss der Tierhalterhaftpflicht, nur in Verbindung mit der Betriebshaftpflicht' }),

  // ---- 5 BHV
  umsatz: F('Jahresnettoumsatz', { hilfe: 'Umsatz ohne Mehrwertsteuer für ein Jahr', frage: 'Jahresnettoumsatz' }),
  lohnsumme: F('Jahreslohn- und -gehaltssumme', { hilfe: 'Löhne und Gehälter für ein Jahr', frage: 'Jahreslohn- und -gehaltssumme' }),
  leiharbeiter: F('Entgelt Leiharbeiter', { hilfe: 'Entgelt für Leiharbeitskräfte je Jahr' }),
  subunternehmer: F('Auftragssumme Subunternehmer', { hilfe: 'Summe der an Subunternehmer vergebenen Aufträge je Jahr' }),
  vollzeit: F('Vollzeitkräfte (inkl. Geschäftsführer)', { hilfe: 'Vollzeitkräfte einschließlich Inhaber oder Geschäftsführer', frage: 'Anzahl der Vollzeit-, Teilzeit- und geringfügig Beschäftigten' }),
  teilzeit: F('Teilzeitkräfte', { hilfe: 'Anzahl der Teilzeitkräfte' }),
  geringfuegig: F('Geringfügig Beschäftigte', { hilfe: 'Anzahl der geringfügig Beschäftigten' }),

  // ---- 5 GIHV, Elektronik, Gebäude
  betriebsstaette: F('Betriebsstätte (PLZ, Ort, Straße, Hausnummer)', { hilfe: 'Anschrift der zu versichernden Betriebsstätte', frage: 'Anschrift der Betriebsstätte (Straße, Hausnummer, Postleitzahl, Ort)' }),
  versicherteInhalte: F('Versicherte Inhalte', { hilfe: 'Feuer, Einbruchdiebstahl, Leitungswasser, Sturm/Hagel, weitere Naturgefahren/Elementar, EC-Zusatzgefahren (+), Glas', frage: 'Gewünschte Gefahren für den Inhalt (Feuer, Einbruchdiebstahl, Leitungswasser, Sturm/Hagel, Elementar, Glas)' }),
  vsElektronik: F('Gewünschte Versicherungssumme / Wert der Elektronik', { hilfe: 'Neuwert der zu versichernden Elektronik', frage: 'Versicherungssumme bzw. Neuwert der zu versichernden Elektronik' }),

  // ---- 6
  zahlweise: F('Zahlweise', { hilfe: 'Jährlich, halbjährlich, vierteljährlich oder monatlich' }),
  vs: F('Versicherungssumme', { hilfe: 'Gewünschte Versicherungs- bzw. Deckungssumme', frage: 'Gewünschte Versicherungssumme' }),
  sb: F('Selbstbehalt', { hilfe: 'Gewünschter Selbstbehalt je Schaden', frage: 'Gewünschter Selbstbehalt' }),

  // ---- 6 Gewerbliches Gebäude (je Gebäude)
  holzbau: F('Holzbau', { hilfe: 'Ja/Nein' }),
  weicheBedachung: F('Weiche Bedachung', { hilfe: 'Ja/Nein' }),
  offeneSeiten: F('Offene Seiten', { hilfe: 'Ja/Nein' }),
  fertighaus: F('Fertighaus', { hilfe: 'Ja/Nein' }),
  denkmalschutz: F('Denkmalschutz', { hilfe: 'Ja/Nein' }),
  baujahr: F('Baujahr', { hilfe: 'Baujahr des Gebäudes', frage: 'Baujahr des Gebäudes' }),
  wertermittlungsjahr: F('Jahr der Wertermittlung', { hilfe: 'Jahr, auf das sich der Neubauwert bezieht' }),
  leerstand: F('Anteil Leerstand in %', { hilfe: 'Anteil leerstehender Flächen' }),
  neubauwert: F('Neubauwert gemäß Wertermittlungsjahr', { hilfe: 'Neubauwert bzw. Versicherungssumme zum Wertermittlungsjahr', frage: 'Neubauwert des Gebäudes mit Jahr der Wertermittlung' }),
  gefahren: F('Versicherte Gefahren', { hilfe: 'Feuer, Leitungswasser, Sturm/Hagel, Elementar, Glas usw.', frage: 'Gewünschte Gefahren (Feuer, Leitungswasser, Sturm/Hagel, Elementar, Glas)' }),
  sbObjekt: F('Selbstbeteiligung', { hilfe: 'Gewünschte Selbstbeteiligung je Schaden', frage: 'Gewünschte Selbstbeteiligung' }),

  // ---- 7
  vorversicherung: F('Vorversicherung', { hilfe: 'Besteht oder bestand eine Vorversicherung?', frage: 'Besteht oder bestand eine Vorversicherung (Versicherer, Status, Jahresbeitrag, Versicherungsscheinnummer)?' }),
  vvVersicherer: F('Versicherer', { hilfe: 'Vorversicherer', lang: 'Vorversicherer' }),
  vvStatus: F('Status', { lang: 'Status der Vorversicherung', hilfe: 'Laufend, gekündigt oder ausgelaufen' }),
  vvJahresbeitrag: F('Jahresbeitrag', { lang: 'Jahresbeitrag der Vorversicherung', hilfe: 'Jahresbeitrag der Vorversicherung' }),
  vvScheinnummer: F('Versicherungsscheinnummer', { hilfe: 'Scheinnummer der Vorversicherung' }),
  vvAblehnungen: F('Ablehnungen', { hilfe: 'Wurde ein vergleichbarer Antrag abgelehnt oder ein Vertrag gekündigt?' }),
  vorschaeden: F('Vorschäden', { hilfe: 'Schäden der letzten fünf Jahre', frage: 'Vorschäden der letzten fünf Jahre (Anzahl, Höhe, Ursache)' }),

  // ---- 8
  vnName: F('Name', { lang: 'Name des Versicherungsnehmers', hilfe: 'Name bzw. Firma des Versicherungsnehmers', frage: 'Name bzw. Firma des Versicherungsnehmers' }),
  vnAdresse: F('Adresse', { lang: 'Anschrift des Versicherungsnehmers', hilfe: 'Anschrift des Versicherungsnehmers', frage: 'Anschrift des Versicherungsnehmers' }),
  vnIban: F('IBAN (falls vorhanden)', { hilfe: 'Bankverbindung für den Beitragseinzug' }),
  vnTelefon: F('Telefonnummer', { lang: 'Telefonnummer des Versicherungsnehmers', hilfe: 'Telefonnummer des Versicherungsnehmers' }),
  vnEmail: F('E-Mail-Adresse', { lang: 'E-Mail-Adresse des Versicherungsnehmers', hilfe: 'E-Mail-Adresse des Versicherungsnehmers' }),

  // ---- Bestandsvorgang (kein Angebotslayout)
  anliegen: F('Anliegen', { hilfe: 'Was der Vermittler konkret wünscht' }),
  stichtag: F('Stichtag', { hilfe: 'Datum, zu dem die Änderung wirksam werden soll' }),
  sparteBestand: F('Sparte / Risiko', { hilfe: 'Sparte der betroffenen Verträge' }),
  vertraege: F('Versicherungsscheinnummern', { hilfe: 'Betroffene Verträge im Bestand' }),
  inhaberAlt: F('Bisheriger Inhaber', { hilfe: 'Inhaber bis zum Stichtag' }),
  inhaberNeu: F('Neuer Inhaber', { hilfe: 'Inhaber ab dem Stichtag' })
}

/** Felder der Kopfzeile „Vorgang auf einen Blick“, in Lesereihenfolge. */
export const VORGANGSFELDER = ['vorgangsart', 'sparte', 'vermittler', 'ansprechpartner', 'vermittlerEmail', 'vermittlerTelefon', 'anfrageId']

const ABSCHNITT_AGENTUR = { nr: 1, titel: 'Agenturnummer', felder: ['agenturnummer'] }
const ABSCHNITT_BETRIEBSART = { nr: 2, titel: 'Betriebsarten', typ: 'betriebsarten' }
const ABSCHNITT_BEGINN = { nr: 3, titel: 'Gewünschter Beginn und Laufzeit', felder: ['beginn', 'laufzeit'] }
const ABSCHNITT_VORVERSICHERUNG = {
  nr: 7, titel: 'Vorversicherung / Vorschäden',
  felder: ['vorversicherung', 'vvVersicherer', 'vvStatus', 'vvJahresbeitrag', 'vvScheinnummer', 'vvAblehnungen', 'vorschaeden']
}
const ABSCHNITT_VN = { nr: 8, titel: 'Versicherungsnehmer', felder: ['vnName', 'vnAdresse', 'vnIban', 'vnTelefon', 'vnEmail'] }
const ZAHLWEISE = { nr: 6, titel: 'Zahlweise / Versicherungssumme / Selbstbehalt', felder: ['zahlweise', 'vs', 'sb'] }

export const LAYOUTS = {
  bhv: {
    id: 'bhv', kurz: 'BHV', name: 'Betriebshaftpflicht', lang: 'Betriebshaftpflichtversicherung',
    abschnitte: [
      ABSCHNITT_AGENTUR,
      ABSCHNITT_BETRIEBSART,
      ABSCHNITT_BEGINN,
      { nr: 4, titel: 'PHV / THV', felder: ['phv', 'thv'], hinweis: 'Nur aufführen, wenn relevant (immer in Verbindung mit Betriebshaftpflicht)', nurWennRelevant: true },
      { nr: 5, titel: 'Kennzahlen', felder: ['umsatz', 'lohnsumme', 'leiharbeiter', 'subunternehmer', 'vollzeit', 'teilzeit', 'geringfuegig'], risikofragen: true },
      ZAHLWEISE,
      ABSCHNITT_VORVERSICHERUNG,
      ABSCHNITT_VN
    ],
    pflicht: ['agenturnummer', 'beginn', 'umsatz', 'lohnsumme', 'vollzeit', 'vs', 'sb', 'vorversicherung', 'vorschaeden', 'vnName', 'vnAdresse']
  },
  gihv: {
    id: 'gihv', kurz: 'GIHV', name: 'Geschäftsinhalt', lang: 'Geschäftsinhaltsversicherung',
    abschnitte: [
      ABSCHNITT_AGENTUR,
      ABSCHNITT_BETRIEBSART,
      ABSCHNITT_BEGINN,
      { nr: 5, titel: 'Kennzahlen', felder: ['betriebsstaette', 'versicherteInhalte'], risikofragen: true },
      ZAHLWEISE,
      ABSCHNITT_VORVERSICHERUNG,
      ABSCHNITT_VN
    ],
    pflicht: ['agenturnummer', 'beginn', 'betriebsstaette', 'versicherteInhalte', 'vs', 'sb', 'vorversicherung', 'vorschaeden', 'vnName', 'vnAdresse']
  },
  elektronik: {
    id: 'elektronik', kurz: 'Elektronik', name: 'Elektronik', lang: 'Elektronikversicherung',
    abschnitte: [
      ABSCHNITT_AGENTUR,
      ABSCHNITT_BETRIEBSART,
      ABSCHNITT_BEGINN,
      { nr: 5, titel: 'Kennzahlen', felder: ['betriebsstaette', 'vsElektronik'], risikofragen: true },
      ZAHLWEISE,
      ABSCHNITT_VORVERSICHERUNG,
      ABSCHNITT_VN
    ],
    pflicht: ['agenturnummer', 'beginn', 'betriebsstaette', 'vsElektronik', 'sb', 'vorversicherung', 'vorschaeden', 'vnName', 'vnAdresse']
  },
  gebaeude: {
    id: 'gebaeude', kurz: 'Gebäude', name: 'Gewerbliches Gebäude', lang: 'Gebäudeversicherung',
    abschnitte: [
      ABSCHNITT_AGENTUR,
      ABSCHNITT_BETRIEBSART,
      ABSCHNITT_BEGINN,
      { nr: 5, titel: 'Kennzahlen', felder: ['betriebsstaette'] },
      {
        nr: 6, titel: 'Zahlweise / Versicherungssumme / Selbstbehalt', felder: ['zahlweise'],
        jeObjekt: ['holzbau', 'weicheBedachung', 'offeneSeiten', 'fertighaus', 'denkmalschutz', 'baujahr',
          'wertermittlungsjahr', 'leerstand', 'neubauwert', 'gefahren', 'sbObjekt'],
        risikofragen: true
      },
      ABSCHNITT_VORVERSICHERUNG,
      ABSCHNITT_VN
    ],
    pflicht: ['agenturnummer', 'beginn', 'betriebsstaette', 'vorversicherung', 'vorschaeden', 'vnName', 'vnAdresse'],
    pflichtJeObjekt: ['baujahr', 'neubauwert', 'gefahren', 'sbObjekt']
  },
  // Kein Angebotslayout: Eingänge, die keine Angebotsanfrage sind, bekommen
  // die Kerndaten für die Weitergabe an den zuständigen Bearbeitungsweg.
  sonstig: {
    id: 'sonstig', kurz: 'Sonstiges', name: 'Kein Angebotslayout', lang: 'Anfrage',
    abschnitte: [
      ABSCHNITT_AGENTUR,
      { nr: 'A', titel: 'Anliegen', felder: ['anliegen', 'stichtag'] },
      { nr: 'B', titel: 'Betroffene Verträge', felder: ['sparteBestand', 'vertraege'] },
      { nr: 8, titel: 'Versicherungsnehmer', felder: ['vnName', 'vnAdresse', 'inhaberAlt', 'inhaberNeu'] }
    ],
    pflicht: []
  }
}

/** Die vier Angebotslayouts in der Reihenfolge der Vorgabe. */
export const ANGEBOTSLAYOUTS = ['bhv', 'gihv', 'elektronik', 'gebaeude'].map(id => LAYOUTS[id])

/** Regeln der Vorgabe, die für alle Layouts gelten. */
export const KI_REGELN = [
  'Die gesamte Betriebsartenliste vollständig prüfen, nicht nur die erstbeste Option',
  'Immer die exakteste verfügbare Bezeichnung aus der Liste verwenden',
  'Freie Interpretationen vermeiden, wenn eine passende Listenbezeichnung existiert',
  'Mehrere Tätigkeiten sauber und logisch trennen',
  'Eine fachliche Gesamteinschätzung zur Einordnung des Risikos ergänzen',
  'Auf Auffälligkeiten oder mögliche Probleme hinweisen'
]

/** Regeln zu Abschnitt 2 (Betriebsarten), wie sie in jeder Vorgabe stehen. */
export const BETRIEBSART_REGELN = [
  'Tätigkeit vollständig anhand der Betriebsartenliste prüfen',
  'Kommt die Tätigkeit exakt so in der Liste vor, diese 1:1 verwenden',
  'Bei mehreren Tätigkeiten alle passenden Betriebsarten einzeln benennen, keine ungenauen Sammelbegriffe',
  'Ohne exakte Bezeichnung die fachlich beste und engste passende Betriebsart wählen',
  'Kurze Begründung zur Auswahl geben',
  'Wenn möglich prozentuale Aufteilung nach Umsatz oder Tätigkeit'
]

export const TREFFER = {
  exakt: { label: 'exakt in der Liste', ton: 'gruen' },
  naechste: { label: 'engste passende Betriebsart', ton: 'blau' },
  offen: { label: 'nicht eindeutig zuordenbar', ton: 'rot' }
}

const objektKey = (key, n) => `${key}#${n}`

/** Schlüssel eines Feldes ohne Objektnummer („baujahr#2“ → „baujahr“). */
export const basisKey = (key) => key.split('#')[0]

export function feldDefinition(key) {
  return FELDER[basisKey(key)] || { label: key }
}

export function layoutVon(vorgang) {
  return LAYOUTS[vorgang.produkt] || LAYOUTS.sonstig
}

/** Die Pflichtangaben eines Vorgangs als Liste von Feldschlüsseln. */
export function pflichtfelder(vorgang) {
  const layout = layoutVon(vorgang)
  const objekte = vorgang.objekte || []
  return [
    ...layout.pflicht,
    // je Objekt gebündelt: erst alle Angaben zu Gebäude 1, dann zu Gebäude 2 …
    ...objekte.flatMap((_, i) => (layout.pflichtJeObjekt || []).map(k => objektKey(k, i + 1)))
  ]
}

/**
 * Ein Feld des Deckblatts in einheitlicher Form.
 * In den Daten steht ein Wert als Text (wörtlich gelesen) oder als Objekt
 * { w, art, h }. Fehlt der Eintrag, ist das Feld je nach Pflicht „fehlt“,
 * „Recherche“ (wenn der Wert im eigenen Haus nachzuschlagen ist) oder
 * schlicht „nicht genannt“.
 */
export function feld(vorgang, key) {
  const def = feldDefinition(key)
  const roh = vorgang.felder?.[key]
  const pflicht = pflichtfelder(vorgang).includes(key)
  const eintrag = roh == null || roh === ''
    ? null
    : typeof roh === 'string' ? { w: roh, art: 'gelesen' } : { art: 'gelesen', ...roh }

  if (!eintrag || (!eintrag.w && eintrag.art !== 'recherche')) {
    const art = eintrag?.art === 'fehlt' ? 'fehlt' : pflicht ? (def.recherche ? 'recherche' : 'fehlt') : 'leer'
    return { key, label: def.label, hilfe: def.hilfe, wert: '', art, herleitung: eintrag?.h || '', pflicht }
  }
  return { key, label: def.label, hilfe: def.hilfe, wert: eintrag.w || '', art: eintrag.art, herleitung: eintrag.h || '', pflicht }
}

/**
 * Die Abschnitte des Deckblatts für einen konkreten Vorgang, mit Zeilen je
 * Feld. Im Gebäude-Layout wiederholen sich die Gebäudeangaben je Gebäude.
 */
export function abschnitteFuer(vorgang) {
  const layout = layoutVon(vorgang)
  const objekte = vorgang.objekte || []
  return layout.abschnitte.map(a => {
    const zeilen = (a.felder || []).map(k => feld(vorgang, k))
    const gruppen = a.jeObjekt
      ? objekte.map((titel, i) => ({
          titel,
          zeilen: a.jeObjekt.map(k => feld(vorgang, objektKey(k, i + 1)))
        }))
      : []
    return { ...a, zeilen, gruppen }
  })
}

/** Alle Feldschlüssel eines Vorgangs in der Reihenfolge des Deckblatts. */
export function feldfolge(vorgang) {
  const folge = [...VORGANGSFELDER]
  for (const a of abschnitteFuer(vorgang)) {
    if (a.typ === 'betriebsarten') {
      for (const b of vorgang.betriebsarten || []) folge.push(b.key)
      continue
    }
    for (const z of a.zeilen) folge.push(z.key)
    for (const g of a.gruppen) for (const z of g.zeilen) folge.push(z.key)
    if (a.risikofragen) for (const r of vorgang.risikofragen || []) folge.push(r.key)
  }
  return folge
}

/** Nummer des Abschnitts, in dem ein Feld steht (für die kleine Ziffer an der Fundstelle). */
export function abschnittNr(vorgang, key) {
  if (VORGANGSFELDER.includes(key)) return ''
  if ((vorgang.betriebsarten || []).some(b => b.key === key)) return 2
  for (const a of layoutVon(vorgang).abschnitte) {
    if ((a.felder || []).includes(key)) return a.nr
    if ((a.jeObjekt || []).includes(basisKey(key))) return a.nr
    if (a.risikofragen && (vorgang.risikofragen || []).some(r => r.key === key)) return a.nr
  }
  return ''
}
