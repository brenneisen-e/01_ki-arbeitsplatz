/**
 * Prüfkatalog Bestandsübertragung (Whitelabel)
 *
 * Bildet die Prüfung ab, die ein Versicherer an einer eingehenden
 * Bestandsübertragung durchführt. Die Systemnamen sind bewusst generisch
 * gehalten (Bestandssystem, Vermittlersystem, Partnersystem), damit der
 * Katalog unabhängig vom einzelnen Haus gezeigt werden kann.
 *
 * Zwei Prüfarten:
 *   hart   – formale Mindestvoraussetzung. Ist sie verletzt, endet die
 *            Verarbeitung sofort; die nachfolgenden Prüfungen entfallen.
 *   weich  – inhaltliche Prüfung. Ein Verstoß wird gemerkt, die Verarbeitung
 *            läuft weiter. Erst am Ende entscheidet die Summe der gemerkten
 *            Gründe über Aussteuerung oder Weiterverarbeitung.
 */

export const STUFEN = [
  {
    id: 'formal',
    nr: 1,
    titel: 'Formale Vorprüfung',
    art: 'hart',
    beschreibung: 'Mindestvoraussetzungen, ohne die eine Bestandsübertragung nicht bearbeitbar ist. Ein Verstoß beendet die Verarbeitung sofort.'
  },
  {
    id: 'vn',
    nr: 2,
    titel: 'Versicherungsnehmer und Vertrag',
    art: 'weich',
    beschreibung: 'Abgleich der aus dem Schreiben gelesenen Kundendaten gegen den Vertrag im Bestandssystem.'
  },
  {
    id: 'makler',
    nr: 3,
    titel: 'Übernehmender Vermittler',
    art: 'weich',
    beschreibung: 'Prüfung, ob der übernehmende Vermittler bekannt, angebunden und übernahmeberechtigt ist.'
  },
  {
    id: 'vollmacht',
    nr: 4,
    titel: 'Maklervollmacht',
    art: 'weich',
    beschreibung: 'Inhaltliche Prüfung der beigefügten Vollmacht.'
  },
  {
    id: 'unterlagen',
    nr: 5,
    titel: 'Unterlagen und Folgearbeit',
    art: 'weich',
    beschreibung: 'Erfassung angeforderter Unterlagen für die nachgelagerte Bearbeitung.'
  }
]

const ok = (ist, soll, hinweis) => ({ status: 'ok', ist, soll, hinweis })
const be = (ist, soll, hinweis) => ({ status: 'be', ist, soll, hinweis })
const info = (ist, soll, hinweis) => ({ status: 'info', ist, soll, hinweis })
const neutral = (hinweis) => ({ status: 'neutral', hinweis })

const norm = (s) => (s || '').toString().trim().toLowerCase().replace(/\s+/g, ' ')
const gleich = (a, b) => norm(a) === norm(b)

export const PRUEFUNGEN = [
  // ---------------------------------------------------------------- formal
  {
    id: 'klassifikation',
    stufe: 'formal',
    titel: 'Vorgang ist eine Bestandsübertragung',
    feld: 'Klassifikation',
    quelle: 'Klassifikation aus der Dokumentanalyse',
    abgleich: 'Fester Wert „BÜ-Vorgang“',
    beText: 'Kein Bestandsübertragungsvorgang',
    pruefe: (v) => v.deckblatt.klassifikation === 'BÜ-Vorgang'
      ? ok(v.deckblatt.klassifikation, 'BÜ-Vorgang')
      : be(v.deckblatt.klassifikation, 'BÜ-Vorgang', 'Anfrage, Rücksprache oder Antragsänderung – gehört in einen anderen Bearbeitungsweg.')
  },
  {
    id: 'wunsch',
    stufe: 'formal',
    titel: 'Übertragungswunsch ist erkennbar',
    feld: 'Übertragungswunsch vorhanden',
    quelle: 'Dokumentanalyse',
    abgleich: 'ja',
    beText: 'Kein Übertragungswunsch erkennbar',
    pruefe: (v) => v.deckblatt.wunschVorhanden === 'ja'
      ? ok('ja', 'ja')
      : be('nein', 'ja', 'Im Schreiben ist kein Wille zur Übertragung formuliert.')
  },
  {
    id: 'mvEnthalten',
    stufe: 'formal',
    titel: 'Maklervollmacht liegt bei',
    feld: 'Maklervollmacht enthalten',
    quelle: 'Anhänge des Eingangs',
    abgleich: 'ja',
    beText: 'Maklervollmacht nicht vorhanden',
    pruefe: (v) => v.deckblatt.mvEnthalten === 'ja'
      ? ok('ja', 'ja')
      : be('nein', 'ja', 'Ohne beiliegende Vollmacht ist keine Übertragung möglich.')
  },
  {
    id: 'vnrVorhanden',
    stufe: 'formal',
    titel: 'Versicherungsnummer ist angegeben',
    feld: 'Versicherungsnummer',
    quelle: 'Dokumentanalyse',
    abgleich: 'nicht leer',
    beText: 'Versicherungsnummer fehlt',
    pruefe: (v) => v.deckblatt.vnr
      ? ok(v.deckblatt.vnr, 'nicht leer')
      : be('leer', 'nicht leer', 'Ohne Vertragsbezug kann der Vorgang nicht zugeordnet werden.')
  },

  // -------------------------------------------------------------------- vn
  {
    id: 'vertragGefunden',
    stufe: 'vn',
    titel: 'Vertrag im Bestandssystem auffindbar',
    feld: 'Versicherungsnummer',
    quelle: 'Dokumentanalyse',
    abgleich: 'Bestandssystem, Vertragssuche',
    beText: 'Vertrag nicht auffindbar',
    pruefe: (v) => v.bestand.vertragGefunden
      ? ok(v.deckblatt.vnr, 'gefunden')
      : be(v.deckblatt.vnr, 'gefunden', 'Zur Nummer existiert kein Vertrag – Zahlendreher oder Fremdversicherer.')
  },
  {
    id: 'vertragsstatus',
    stufe: 'vn',
    titel: 'Vertrag ist aktiv',
    feld: 'Vertragsstatus',
    quelle: 'Bestandssystem',
    abgleich: 'aktiv',
    beText: 'Historischer Vertrag oder Storno',
    pruefe: (v) => v.bestand.vertragsstatus === 'aktiv'
      ? ok('aktiv', 'aktiv')
      : be(v.bestand.vertragsstatus, 'aktiv', 'Ein beendeter Vertrag kann nicht übertragen werden.')
  },
  {
    id: 'nachname',
    stufe: 'vn',
    titel: 'Nachname stimmt überein',
    feld: 'Nachname',
    quelle: 'Dokumentanalyse',
    abgleich: 'Bestandssystem, Versicherungsnehmer',
    beText: 'Nachname abweichend',
    pruefe: (v) => gleich(v.deckblatt.kundeNachname, v.bestand.nachname)
      ? ok(v.deckblatt.kundeNachname, v.bestand.nachname)
      : be(v.deckblatt.kundeNachname || 'leer', v.bestand.nachname, 'Der Vertrag läuft auf eine andere Person.')
  },
  {
    id: 'vorname',
    stufe: 'vn',
    titel: 'Vorname stimmt überein',
    feld: 'Vorname',
    quelle: 'Dokumentanalyse',
    abgleich: 'Bestandssystem, Versicherungsnehmer',
    beText: 'Vorname abweichend',
    pruefe: (v) => gleich(v.deckblatt.kundeVorname, v.bestand.vorname)
      ? ok(v.deckblatt.kundeVorname, v.bestand.vorname)
      : be(v.deckblatt.kundeVorname || 'leer', v.bestand.vorname, 'Abweichung kann auf einen anderen Vertrag derselben Familie hindeuten.')
  },
  {
    id: 'gebdat',
    stufe: 'vn',
    titel: 'Geburtsdatum stimmt überein',
    feld: 'Geburtsdatum',
    quelle: 'Dokumentanalyse',
    abgleich: 'Bestandssystem, Versicherungsnehmer',
    beText: 'Geburtsdatum abweichend oder fehlt',
    pruefe: (v) => !v.deckblatt.kundeGebdat
      ? be('leer', v.bestand.gebdat, 'Im Schreiben ist kein Geburtsdatum genannt.')
      : gleich(v.deckblatt.kundeGebdat, v.bestand.gebdat)
        ? ok(v.deckblatt.kundeGebdat, v.bestand.gebdat)
        : be(v.deckblatt.kundeGebdat, v.bestand.gebdat, 'Das wichtigste Unterscheidungsmerkmal bei Namensgleichheit.')
  },
  {
    id: 'strasse',
    stufe: 'vn',
    titel: 'Straße stimmt überein',
    feld: 'Straße',
    quelle: 'Dokumentanalyse',
    abgleich: 'Bestandssystem, Anschrift',
    beText: 'Anschrift abweichend',
    pruefe: (v) => !v.deckblatt.kundeStrasse
      ? info('leer', v.bestand.strasse, 'Keine Anschrift im Schreiben – allein kein Ausschlussgrund.')
      : gleich(v.deckblatt.kundeStrasse, v.bestand.strasse)
        ? ok(v.deckblatt.kundeStrasse, v.bestand.strasse)
        : be(v.deckblatt.kundeStrasse, v.bestand.strasse, 'Umzug oder falscher Vertrag – beides muss ein Mensch entscheiden.')
  },
  {
    id: 'plz',
    stufe: 'vn',
    titel: 'Postleitzahl stimmt überein',
    feld: 'PLZ',
    quelle: 'Dokumentanalyse',
    abgleich: 'Bestandssystem, Anschrift',
    beText: 'Postleitzahl abweichend',
    pruefe: (v) => !v.deckblatt.kundePlz
      ? info('leer', v.bestand.plz, 'Keine Postleitzahl im Schreiben.')
      : gleich(v.deckblatt.kundePlz, v.bestand.plz)
        ? ok(v.deckblatt.kundePlz, v.bestand.plz)
        : be(v.deckblatt.kundePlz, v.bestand.plz, 'Abweichung zur hinterlegten Anschrift.')
  },
  {
    id: 'bereitsUebertragen',
    stufe: 'vn',
    titel: 'Übertragung noch nicht erfolgt',
    feld: 'Betreuender Vermittler',
    quelle: 'Bestandssystem',
    abgleich: 'ungleich übernehmender Vermittler',
    beText: 'Übertragung bereits erfolgt',
    pruefe: (v) => v.bestand.bereitsUebertragen
      ? be(v.bestand.agenturInhaber, 'anderer Vermittler', 'Der Vertrag läuft bereits auf den anfragenden Vermittler.')
      : ok(v.bestand.agenturInhaber, 'anderer Vermittler')
  },

  // ---------------------------------------------------------------- makler
  {
    id: 'vermittlerGefunden',
    stufe: 'makler',
    titel: 'Übernehmender Vermittler ist bekannt',
    feld: 'Agentur-Nr / Vermittlernummer',
    quelle: 'Dokumentanalyse',
    abgleich: 'Vermittlersystem',
    beText: 'Vermittler nicht auffindbar',
    pruefe: (v) => v.bestand.vermittlerGefunden
      ? ok(v.deckblatt.agenturNr || v.deckblatt.vermittlerNr, 'gefunden')
      : be(v.deckblatt.agenturNr || v.deckblatt.vermittlerNr || 'leer', 'gefunden', 'Keine Nummer im Schreiben oder keine Entsprechung im Vermittlersystem.')
  },
  {
    id: 'anbindung',
    stufe: 'makler',
    titel: 'Vermittler ist angebunden',
    feld: 'Anbindungsstatus',
    quelle: 'Partnersystem',
    abgleich: 'aktiv',
    beText: 'Keine aktive Anbindung',
    pruefe: (v) => v.bestand.anbindung === 'aktiv'
      ? ok('aktiv', 'aktiv')
      : be(v.bestand.anbindung, 'aktiv', 'Ohne gültige Anbindung darf kein Bestand übertragen werden.')
  },
  {
    id: 'zusammenarbeit',
    stufe: 'makler',
    titel: 'Zusammenarbeit ist vereinbart',
    feld: 'Zusammenarbeit',
    quelle: 'Partnersystem',
    abgleich: 'ja',
    beText: 'Keine Zusammenarbeit',
    pruefe: (v) => v.bestand.zusammenarbeit
      ? ok('vereinbart', 'vereinbart')
      : be('nicht vereinbart', 'vereinbart', 'Mit diesem Vermittler besteht keine Vereinbarung – führt zur Ablehnung.')
  },
  {
    id: 'courtagefortzahler',
    stufe: 'makler',
    titel: 'Kein Courtagefortzahler',
    feld: 'Vermittlerkennzeichen',
    quelle: 'Vermittlersystem',
    abgleich: 'kein Courtagefortzahler',
    beText: 'Courtagefortzahler',
    pruefe: (v) => v.bestand.courtagefortzahler
      ? be('Courtagefortzahler', 'regulärer Vermittler', 'Der Bestand wird nicht übertragen, sondern auf die unbesetzte Agentur gestellt.')
      : ok('regulärer Vermittler', 'regulärer Vermittler')
  },
  {
    id: 'vertriebskanal',
    stufe: 'makler',
    titel: 'Vertriebskanal des abgebenden Vermittlers',
    feld: 'Vertriebskanal',
    quelle: 'Vermittlersystem',
    abgleich: 'bestimmt den weiteren Weg',
    beText: null,
    pruefe: (v) => neutral(v.bestand.vertriebskanal === 'AO'
      ? 'Abgebend ist die Ausschließlichkeit – Vorgangstyp „AO zu Makler“.'
      : 'Abgebend ist ein Makler – Vorgangstyp „Makler zu Makler“.')
  },
  {
    id: 'maklerEmail',
    stufe: 'makler',
    titel: 'E-Mail-Adresse des Vermittlers vorhanden',
    feld: 'Makler E-Mail',
    quelle: 'Dokumentanalyse',
    abgleich: 'nicht leer',
    beText: 'Keine E-Mail-Adresse für die Rückmeldung',
    pruefe: (v) => v.deckblatt.maklerEmail
      ? ok(v.deckblatt.maklerEmail, 'nicht leer')
      : be('leer', 'nicht leer', 'Ohne Adresse kann keine automatische Rückmeldung erfolgen.')
  },

  // ------------------------------------------------------------- vollmacht
  {
    id: 'mvAufMakler',
    stufe: 'vollmacht',
    titel: 'Vollmacht ist auf den übernehmenden Vermittler ausgestellt',
    feld: 'MV auf Makler ausgestellt',
    quelle: 'Dokumentanalyse der Vollmacht',
    abgleich: 'ja',
    beText: 'Vollmacht nicht auf den anfragenden Vermittler',
    pruefe: (v) => v.deckblatt.mvAufMakler === 'ja'
      ? ok('ja', 'ja')
      : be(v.deckblatt.mvAufMakler, 'ja', 'Die Vollmacht nennt einen anderen Vermittler oder ist nicht lesbar.')
  },
  {
    id: 'mvVollumfaenglich',
    stufe: 'vollmacht',
    titel: 'Vollmacht ist vollumfänglich',
    feld: 'MV vollumfänglich',
    quelle: 'Dokumentanalyse der Vollmacht',
    abgleich: 'ja',
    beText: 'Vollmacht nur eingeschränkt erteilt',
    pruefe: (v) => v.deckblatt.mvVollumfaenglich === 'ja'
      ? ok('ja', 'ja')
      : be(v.deckblatt.mvVollumfaenglich, 'ja', 'Teilvollmachten muss der Betrieb bewerten.')
  },
  {
    id: 'mvUnterschrift',
    stufe: 'vollmacht',
    titel: 'Vollmacht ist vom Kunden unterschrieben',
    feld: 'Unterschrift Kunde',
    quelle: 'Dokumentanalyse der Vollmacht',
    abgleich: 'ja',
    beText: 'Unterschrift des Kunden fehlt',
    pruefe: (v) => v.deckblatt.mvUnterschriftKunde === 'ja'
      ? ok('ja', 'ja')
      : be(v.deckblatt.mvUnterschriftKunde, 'ja', 'Ohne Unterschrift ist die Vollmacht unwirksam.')
  },
  {
    id: 'mvVn',
    stufe: 'vollmacht',
    titel: 'Vollmachtgeber ist der Versicherungsnehmer',
    feld: 'Name in der Vollmacht',
    quelle: 'Dokumentanalyse der Vollmacht',
    abgleich: 'Versicherungsnehmer im Bestandssystem',
    beText: 'Versicherungsnehmer passt nicht zur Vollmacht',
    pruefe: (v) => gleich(v.deckblatt.mvVnNachname, v.bestand.nachname) && gleich(v.deckblatt.mvVnVorname, v.bestand.vorname)
      ? ok(`${v.deckblatt.mvVnNachname}, ${v.deckblatt.mvVnVorname}`, `${v.bestand.nachname}, ${v.bestand.vorname}`)
      : be(`${v.deckblatt.mvVnNachname || 'leer'}, ${v.deckblatt.mvVnVorname || ''}`.trim().replace(/,$/, ''), `${v.bestand.nachname}, ${v.bestand.vorname}`, 'Häufig bei Ehepartnern oder Firmenverträgen: unterschrieben hat nicht der Versicherungsnehmer.')
  },
  {
    id: 'untervollmacht',
    stufe: 'vollmacht',
    titel: 'Untervollmacht bei Poolanbindung',
    feld: 'Untervollmacht',
    quelle: 'Dokumentanalyse der Vollmacht',
    abgleich: 'erforderlich, wenn ein Pool beteiligt ist',
    beText: 'Untervollmacht fehlt',
    pruefe: (v) => !v.deckblatt.pool
      ? neutral('Kein Pool beteiligt – keine Untervollmacht erforderlich.')
      : v.deckblatt.uvFehlt === 'ja'
        ? be('fehlt', 'liegt vor', `Der Pool ${v.deckblatt.pool} vermittelt, die Untervollmacht liegt aber nicht bei.`)
        : ok('liegt vor', 'liegt vor')
  },
  {
    id: 'mvDatum',
    stufe: 'vollmacht',
    titel: 'Unterschriftsdatum ist vorhanden',
    feld: 'Unterschriftsdatum',
    quelle: 'Dokumentanalyse der Vollmacht',
    abgleich: 'nicht leer',
    beText: 'Unterschriftsdatum fehlt',
    pruefe: (v) => v.deckblatt.mvUnterschriftsdatum
      ? ok(v.deckblatt.mvUnterschriftsdatum, 'nicht leer')
      : be('leer', 'nicht leer', 'Ohne Datum ist der zeitliche Bezug der Vollmacht offen.')
  },

  // ------------------------------------------------------------ unterlagen
  {
    id: 'anfUnterlagen',
    stufe: 'unterlagen',
    titel: 'Anforderung von Unterlagen',
    feld: 'Anforderung Unterlagen',
    quelle: 'Dokumentanalyse',
    abgleich: 'wird in die Bearbeitungsnotiz übernommen',
    beText: null,
    pruefe: (v) => v.deckblatt.anfUnterlagen === 'ja'
      ? info(v.deckblatt.artUnterlagen, 'Folgearbeit', 'Der Vermittler fordert Unterlagen an – Kennzeichen für die Nachbearbeitung, kein Ablehnungsgrund.')
      : neutral('Keine Unterlagen angefordert.')
  }
]

export const PRUEFUNGEN_BY_STUFE = STUFEN.map(s => ({
  ...s,
  pruefungen: PRUEFUNGEN.filter(p => p.stufe === s.id)
}))

/** Reaktion je Ablehnungsgrund, wenn genau ein Grund gemerkt wurde. */
export const REAKTION = {
  'Versicherungsnehmer passt nicht zur Vollmacht': 'Direkte Ablehnungsinformation an den übernehmenden Vermittler',
  'Historischer Vertrag oder Storno': 'Direkte Ablehnungsinformation an den übernehmenden Vermittler',
  'Übertragung bereits erfolgt': 'Information an den übernehmenden Vermittler',
  'Keine Zusammenarbeit': 'Direkte Ablehnungsinformation an den übernehmenden Vermittler',
  'Maklervollmacht nicht vorhanden': 'Direkte Ablehnungsinformation an den übernehmenden Vermittler',
  'Courtagefortzahler': 'Automatische Ablehnung, Vertrag geht auf die unbesetzte Agentur'
}

/**
 * Welches Deckblattfeld hängt an welcher Prüfung.
 *
 * Damit lässt sich im Deckblatt anzeigen, welche Felder eine Prüfung ausgelöst
 * haben. Prüfungen, die ausschließlich gegen die Systemantwort laufen
 * (Vertragsstatus, Anbindung, Zusammenarbeit …), stehen an keinem Feld.
 */
export const PRUEFUNGEN_JE_FELD = {
  klassifikation: ['klassifikation'],
  wunschVorhanden: ['wunsch'],
  mvEnthalten: ['mvEnthalten'],
  mvStatus: ['mvEnthalten'],
  vnr: ['vnrVorhanden', 'vertragGefunden'],
  kundeNachname: ['nachname'],
  kundeVorname: ['vorname'],
  kundeGebdat: ['gebdat'],
  kundeStrasse: ['strasse'],
  kundePlz: ['plz'],
  agenturNr: ['vermittlerGefunden'],
  vermittlerNr: ['vermittlerGefunden'],
  maklerEmail: ['maklerEmail'],
  mvAufMakler: ['mvAufMakler'],
  mvVollumfaenglich: ['mvVollumfaenglich'],
  mvUnterschriftKunde: ['mvUnterschrift'],
  mvVnNachname: ['mvVn'],
  mvVnVorname: ['mvVn'],
  uvErteilt: ['untervollmacht'],
  uvFehlt: ['untervollmacht'],
  mvUnterschriftsdatum: ['mvDatum'],
  anfUnterlagen: ['anfUnterlagen'],
  artUnterlagen: ['anfUnterlagen']
}
