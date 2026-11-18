/**
 * Kleine Helfer, mit denen die Dokument-Nachbauten der Eingänge geschrieben
 * werden. Ein Dokument besteht aus Seiten, eine Seite aus Blöcken; in den
 * Texten stehen die Fundstellen als [[feld|Text]] (siehe utils/markierung.js).
 *
 * `ort` benennt den Bereich, in dem ein Block steht („Betreff der
 * Weiterleitung“, „Signatur des Maklers“ …). Er gilt für alle folgenden
 * Blöcke, bis ein neuer gesetzt wird, und erscheint in der Quellenangabe.
 */

const mit = (block, zusatz) => {
  if (!zusatz) return block
  return typeof zusatz === 'string' ? { ...block, stil: zusatz } : { ...block, ...zusatz }
}

/** Absatz. Zeilenumbrüche im Text bleiben erhalten. */
export const p = (text, zusatz) => mit({ t: 'p', text }, zusatz)

export const titel = (text, zusatz) => mit({ t: 'titel', text }, zusatz)
export const untertitel = (text) => ({ t: 'untertitel', text })
export const h = (text, zusatz) => mit({ t: 'h', text }, zusatz)
export const h2 = (text, zusatz) => mit({ t: 'h2', text }, zusatz)

/** Kopfzeilen einer Mail: [[Bezeichnung, Wert], …]; stil 'inline' für zitierte Mails im Verlauf. */
export const kopf = (zeilen, zusatz) => mit({ t: 'kopf', zeilen }, zusatz)

export const linie = (stark = false) => ({ t: 'linie', stark })
export const abstand = () => ({ t: 'abstand' })
export const seitenzahl = (text) => ({ t: 'seitenzahl', text })
export const fuss = (links, rechts) => ({ t: 'fuss', links, rechts })
export const logo = (text, zusatz) => mit({ t: 'logo', text }, zusatz)
export const liste = (punkte, zusatz) => mit({ t: 'liste', punkte }, zusatz)
export const unterschrift = (name) => ({ t: 'unterschrift', name })
export const stempel = (text) => ({ t: 'stempel', text })

/** Kontaktzeilen mit Symbol: [{ icon: 'mail' | 'telefon', text }]. */
export const kontakt = (zeilen, zusatz) => mit({ t: 'kontakt', zeilen }, zusatz)

/** Zeile aus mehreren Zellen nebeneinander: [{ icon?, text, breit? }]. */
export const spalten = (zellen, zusatz) => mit({ t: 'spalten', zellen }, zusatz)

/** Tabelle Frage | Angabe. */
export const tabelle = (zeilen, zusatz) => mit({ t: 'tabelle', zeilen }, zusatz)

export const abschnitt = (text) => ({ abschnitt: text })
export const zeile = (l, w = '') => ({ l, w })
export const voll = (text) => ({ voll: text })

/** Zeile mit Auswahlliste. stil: 'kaestchen' ([x] Text) oder 'haken' (Haken/Kreuz). */
export const wahl = (l, optionen, stil = 'kaestchen') => ({ l, optionen, stil })

/** Ja/Nein in einer Zeile: „Ja [x] Nein [ ]“. `marke` hängt die Fundstelle an die gewählte Antwort. */
export const jaNein = (l, antwort, marke) => ({
  l, stil: 'janein',
  optionen: [
    { x: antwort === true, text: antwort === true && marke ? `[[${marke}|Ja]]` : 'Ja' },
    { x: antwort === false, text: antwort === false && marke ? `[[${marke}|Nein]]` : 'Nein' }
  ]
})

export const an = (text) => ({ x: true, text })
export const aus = (text) => ({ x: false, text })

/** Auswahlliste, in der genau der Eintrag `gewaehlt` angekreuzt ist; `marke` hängt die Fundstelle daran. */
export const stufen = (eintraege, gewaehlt, marke) => eintraege.map(e => e === gewaehlt
  ? an(marke ? `[[${marke}|${e}]]` : e)
  : aus(e))
