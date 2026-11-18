/**
 * Prüfung eines Eingangs nach dem Lesen.
 *
 * Die KI hat den Eingang gelesen und das Deckblatt gefüllt. Die Prüfung
 * beantwortet danach drei Fragen:
 *
 *   1. Gehört der Eingang überhaupt in die Angebotsstrecke?
 *      (harte Stufe: wenn nicht, geht er mit den Kerndaten in den
 *      zuständigen Bearbeitungsweg)
 *   2. Liegt alles vor, was für ein Angebot gebraucht wird?
 *      Was fehlt, wird zur Rückfrage an den Vermittler; was im eigenen Haus
 *      nachzuschlagen ist, wird zum Recherche-Auftrag.
 *   3. Gibt es Auffälligkeiten, die ein Mensch bewerten muss?
 *
 * Ergebnis je Eingang:
 *   bereit      alle Pflichtangaben da, das Deckblatt geht zur Erfassung
 *   rueckfrage  Angaben fehlen, die Rückfrage ist vorformuliert
 *   sonderfall  bleibt bewusst beim Menschen, das Deckblatt geht mit
 *
 * Versendet oder erfasst wird in keinem Fall automatisch: jedes Ergebnis
 * endet bei einer Freigabe durch die Sachbearbeitung.
 */

import { ANGEBOTSLAYOUTS, feld, feldDefinition, layoutVon, pflichtfelder, basisKey } from './layouts.js'
import { markenText } from './branding.js'

export const STUFEN = [
  {
    id: 'einordnung', nr: 1, titel: 'Einordnung des Eingangs', art: 'hart',
    beschreibung: 'Ist der Eingang eine Angebotsanfrage, und gibt es für die Sparte ein Layout? Wenn nicht, geht er mit den Kerndaten in den zuständigen Bearbeitungsweg.'
  },
  {
    id: 'vermittler', nr: 2, titel: 'Vermittler', art: 'weich',
    beschreibung: 'Ist der Vermittler bekannt und für eine Rückfrage erreichbar?'
  },
  {
    id: 'betriebsart', nr: 3, titel: 'Betriebsart', art: 'weich',
    beschreibung: 'Lässt sich die Tätigkeit einer Betriebsart der Liste zuordnen, und gibt es bei Mischbetrieben eine Aufteilung?'
  },
  {
    id: 'pflicht', nr: 4, titel: 'Pflichtangaben der Sparte', art: 'weich',
    beschreibung: 'Liegen alle Angaben vor, ohne die kein Angebot gerechnet werden kann?'
  },
  {
    id: 'plausi', nr: 5, titel: 'Plausibilität und Auffälligkeiten', art: 'weich',
    beschreibung: 'Widersprüche, ungewöhnliche Werte und Hinweise, die beim Lesen aufgefallen sind.'
  }
]

const STUFE = Object.fromEntries(STUFEN.map(s => [s.id, s]))

const ANGEBOTS_IDS = ANGEBOTSLAYOUTS.map(l => l.id)

/** Fragen, die zusammengehören, stehen in der Rückfrage als ein Punkt. */
const FRAGE_PAARE = [
  [['vs', 'sb'], 'Gewünschte Versicherungssumme und gewünschter Selbstbehalt'],
  [['vorversicherung', 'vorschaeden'], 'Vorversicherung (Versicherer, Status, Jahresbeitrag, Versicherungsscheinnummer) und Vorschäden der letzten fünf Jahre'],
  [['vnName', 'vnAdresse'], 'Name bzw. Firma und Anschrift des Versicherungsnehmers']
]

/** Der Prüfkatalog für einen konkreten Vorgang: feste Prüfungen plus je Pflichtfeld und je Auffälligkeit eine. */
export function katalogFuer(vorgang) {
  const layout = layoutVon(vorgang)
  const betriebsarten = vorgang.betriebsarten || []
  const objekte = vorgang.objekte || []
  const k = []

  // ------------------------------------------------------------ Einordnung
  k.push({
    id: 'vorgangsart', stufe: 'einordnung',
    titel: 'Eingang ist eine Angebotsanfrage',
    feld: 'Vorgangsart', abgleich: 'Angebotsanfrage',
    lauf: () => vorgang.vorgangsart === 'Angebotsanfrage'
      ? { status: 'ok', ist: vorgang.vorgangsart, soll: 'Angebotsanfrage' }
      : {
          status: 'sonderfall', ist: vorgang.vorgangsart, soll: 'Angebotsanfrage',
          hinweis: vorgang.einordnung || 'Kein Angebotsvorgang – gehört in einen anderen Bearbeitungsweg.',
          grund: `Kein Angebotsvorgang: ${vorgang.vorgangsart}`
        }
  })
  k.push({
    id: 'layout', stufe: 'einordnung',
    titel: 'Für die Sparte gibt es ein Layout',
    feld: 'Sparte', abgleich: ANGEBOTSLAYOUTS.map(l => l.kurz).join(', '),
    lauf: () => ANGEBOTS_IDS.includes(vorgang.produkt)
      ? { status: 'ok', ist: layout.name, soll: 'Layout vorhanden' }
      : {
          status: 'sonderfall', ist: vorgang.sparte || 'nicht erkannt', soll: 'Layout vorhanden',
          hinweis: 'Für diese Sparte ist kein Deckblatt-Layout hinterlegt.',
          grund: `Sparte ohne Layout: ${vorgang.sparte || 'nicht erkannt'}`
        }
  })

  // ------------------------------------------------------------ Vermittler
  k.push({
    id: 'agenturnummer', stufe: 'vermittler',
    titel: 'Agenturnummer ist genannt',
    feld: 'Agenturnummer', abgleich: 'im Eingang genannt',
    lauf: () => {
      const f = feld(vorgang, 'agenturnummer')
      if (f.wert) return { status: 'ok', ist: f.wert, soll: 'genannt' }
      const wer = feld(vorgang, 'vermittler').wert
      return {
        status: 'recherche', ist: 'nicht genannt', soll: 'genannt',
        hinweis: 'Die Agenturnummer steht nicht im Eingang. Sie wird nicht beim Vermittler erfragt, sondern im eigenen Haus nachgeschlagen.',
        auftrag: `Agenturnummer${wer ? ` zu ${wer}` : ''} im Vermittlersystem nachschlagen`
      }
    }
  })
  k.push({
    id: 'rueckkanal', stufe: 'vermittler',
    titel: 'Vermittler ist für eine Rückfrage erreichbar',
    feld: 'E-Mail oder Telefon des Vermittlers', abgleich: 'im Eingang genannt',
    lauf: () => {
      const mail = feld(vorgang, 'vermittlerEmail').wert
      const tel = feld(vorgang, 'vermittlerTelefon').wert
      return mail || tel
        ? { status: 'ok', ist: mail || tel, soll: 'genannt' }
        : { status: 'hinweis', ist: 'nicht genannt', soll: 'genannt', hinweis: 'Im Eingang stehen keine Kontaktdaten des Vermittlers. Die Rückmeldung läuft über die hinterlegten Daten zur Agenturnummer.' }
    }
  })

  // ----------------------------------------------------------- Betriebsart
  k.push({
    id: 'baZugeordnet', stufe: 'betriebsart',
    titel: 'Tätigkeit ist einer Betriebsart zugeordnet',
    feld: 'Betriebsarten', abgleich: 'Betriebsartenliste',
    lauf: () => betriebsarten.length
      ? { status: 'ok', ist: `${betriebsarten.length} ${betriebsarten.length === 1 ? 'Betriebsart' : 'Betriebsarten'}`, soll: 'mindestens eine' }
      : { status: 'fehlt', ist: 'keine', soll: 'mindestens eine', hinweis: 'Aus dem Eingang geht nicht hervor, was der Betrieb tut.', frage: 'Genaue Beschreibung der Tätigkeiten des Betriebs', frageKey: 'betriebsart' }
  })
  k.push({
    id: 'baEindeutig', stufe: 'betriebsart',
    titel: 'Zuordnung ist eindeutig',
    feld: 'Betriebsarten', abgleich: 'exakte oder engste passende Bezeichnung',
    lauf: () => {
      if (!betriebsarten.length) return { status: 'neutral', hinweis: 'Keine Betriebsart erkannt.' }
      const offen = betriebsarten.filter(b => b.treffer === 'offen')
      return offen.length
        ? {
            status: 'sonderfall', ist: offen.map(b => b.bezeichnung).join('; '), soll: 'Bezeichnung aus der Liste',
            hinweis: 'Für diese Tätigkeit gibt es keine passende Bezeichnung in der Liste. Die Einstufung bleibt bei den Fachspezialisten.',
            grund: 'Betriebsart nicht eindeutig zuordenbar'
          }
        : { status: 'ok', ist: betriebsarten.map(b => b.bezeichnung).join('; '), soll: 'Bezeichnung aus der Liste' }
    }
  })
  k.push({
    id: 'baAnteile', stufe: 'betriebsart',
    titel: 'Aufteilung bei mehreren Tätigkeiten',
    feld: 'Anteile der Betriebsarten', abgleich: 'Aufteilung nach Umsatz oder Tätigkeit',
    lauf: () => {
      if (betriebsarten.length <= 1) return { status: 'neutral', hinweis: 'Nur eine Tätigkeit – keine Aufteilung nötig.' }
      return betriebsarten.every(b => b.anteil)
        ? { status: 'ok', ist: betriebsarten.map(b => b.anteil).join(' / '), soll: 'Anteile genannt' }
        : {
            status: 'fehlt', ist: 'nicht genannt', soll: 'Anteile genannt',
            hinweis: `Der Eingang nennt ${betriebsarten.length} Tätigkeiten, aber keine Aufteilung.`,
            frage: vorgang.frageAnteile || 'Umsatzanteile der einzelnen Tätigkeiten in Prozent',
            frageKey: 'anteile'
          }
    }
  })

  // --------------------------------------------------------- Pflichtangaben
  for (const key of pflichtfelder(vorgang)) {
    if (key === 'agenturnummer') continue
    const def = feldDefinition(key)
    const nr = key.includes('#') ? Number(key.split('#')[1]) : 0
    const objekt = nr && objekte.length > 1 ? ` (${objekte[nr - 1]})` : ''
    k.push({
      id: `pflicht:${key}`, stufe: 'pflicht',
      titel: `${def.lang || def.label}${objekt}`,
      // Für gruppierte Darstellungen: Bezeichnung ohne Objekt, das Objekt als Gruppe.
      kurz: def.lang || def.label, gruppe: objekt ? objekte[nr - 1] : null,
      feld: def.lang || def.label, abgleich: 'für das Angebot nötig', feldKey: key,
      lauf: () => {
        const f = feld(vorgang, key)
        if (f.wert) return { status: 'ok', ist: f.wert, soll: 'vorhanden' }
        if (f.art === 'recherche') {
          return { status: 'recherche', ist: 'nicht genannt', soll: 'vorhanden', hinweis: 'Wird im eigenen Haus nachgeschlagen.', auftrag: def.recherche || `${def.label} nachschlagen` }
        }
        return {
          status: 'fehlt', ist: 'nicht genannt', soll: 'vorhanden',
          hinweis: f.herleitung || 'Im Eingang nicht enthalten.',
          frage: `${def.frage || def.label}${objekt}`,
          frageKey: basisKey(key) + (nr ? `#${nr}` : '')
        }
      }
    })
  }

  // ------------------------------------------------------------ Auffälliges
  const auff = vorgang.auffaelligkeiten || []
  for (const a of auff) {
    k.push({
      id: `auff:${a.key}`, stufe: 'plausi',
      titel: a.titel,
      feld: 'Auffälligkeit', abgleich: 'Bewertung durch die KI', feldKey: a.key,
      lauf: () => {
        if (a.wirkung === 'sonderfall') return { status: 'sonderfall', hinweis: a.text, grund: a.titel }
        if (a.wirkung === 'rueckfrage') return { status: 'fehlt', hinweis: a.text, frage: a.frage, frageKey: `auff:${a.key}` }
        return { status: 'hinweis', hinweis: a.text }
      }
    })
  }
  if (!auff.length) {
    k.push({
      id: 'auff:keine', stufe: 'plausi',
      titel: 'Keine Auffälligkeiten',
      feld: 'Auffälligkeit', abgleich: 'Bewertung durch die KI',
      lauf: () => ({ status: 'neutral', hinweis: 'Beim Lesen ist nichts aufgefallen.' })
    })
  }

  return k
}

function fasseFragenZusammen(fehlend) {
  const fragen = []
  const verbraucht = new Set()
  for (const [paar, text] of FRAGE_PAARE) {
    const treffer = paar.map(p => fehlend.find(f => f.frageKey === p))
    if (treffer.every(Boolean)) {
      treffer.forEach(t => verbraucht.add(t))
      // an der Stelle des ersten Treffers einsortieren
      fragen.push({ pos: fehlend.indexOf(treffer[0]), text })
    }
  }
  fehlend.forEach((f, i) => { if (!verbraucht.has(f) && f.frage) fragen.push({ pos: i, text: f.frage }) })
  return fragen.sort((a, b) => a.pos - b.pos).map(f => f.text)
}

export function pruefe(vorgang) {
  const schritte = []
  let abbruch = null

  for (const p of katalogFuer(vorgang)) {
    const stufe = STUFE[p.stufe]
    const { lauf, ...pruefung } = p
    if (abbruch) {
      schritte.push({ pruefung, stufe, status: 'uebersprungen' })
      continue
    }
    const r = lauf()
    schritte.push({ pruefung, stufe, ...r })
    if (r.status === 'sonderfall' && stufe.art === 'hart') abbruch = r
  }

  const fehlend = schritte.filter(s => s.status === 'fehlt')
  const fragen = fasseFragenZusammen(fehlend)
  const auftraege = [
    ...schritte.filter(s => s.status === 'recherche').map(s => s.auftrag),
    ...(vorgang.recherche || [])
  ].filter(Boolean).map(a => markenText(a))
  const sonder = schritte.filter(s => s.status === 'sonderfall')
  const hinweise = schritte.filter(s => s.status === 'hinweis')
  const geprueft = schritte.filter(s => s.status !== 'uebersprungen' && s.status !== 'neutral').length
  const bestanden = schritte.filter(s => s.status === 'ok').length

  let ergebnis
  if (abbruch) {
    ergebnis = {
      art: 'sonderfall', hart: true,
      titel: 'Kein Fall für die Angebotsstrecke',
      kurz: abbruch.grund,
      aktion: vorgang.weiterleitung || 'Weitergabe mit den Kerndaten an den zuständigen Bearbeitungsweg',
      gruende: [abbruch.grund]
    }
  } else if (sonder.length) {
    ergebnis = {
      art: 'sonderfall', hart: false,
      titel: 'Sonderfall für die Fachspezialisten',
      kurz: sonder.map(s => s.grund).join('; '),
      aktion: 'Aussteuerung mit Deckblatt an die Fachspezialisten, die Entscheidung bleibt beim Menschen',
      gruende: sonder.map(s => s.grund)
    }
  } else if (fragen.length) {
    ergebnis = {
      art: 'rueckfrage', hart: false,
      titel: `Rückfrage nötig: ${fragen.length} ${fragen.length === 1 ? 'Punkt ist' : 'Punkte sind'} offen`,
      kurz: `${fragen.length} ${fragen.length === 1 ? 'offener Punkt' : 'offene Punkte'}`,
      aktion: 'Die Rückfrage an den Vermittler ist vorformuliert und wartet auf die Freigabe',
      gruende: fehlend.map(s => s.pruefung.titel)
    }
  } else {
    ergebnis = {
      art: 'bereit', hart: false,
      titel: 'Erfassungsbereit',
      kurz: 'Alle Pflichtangaben liegen vor',
      aktion: 'Das Deckblatt geht an die Sachbearbeitung zur Erfassung {imSystem}',
      gruende: []
    }
  }
  ergebnis.aktion = markenText(ergebnis.aktion)

  return {
    schritte, ergebnis, fragen, auftraege,
    hinweise: hinweise.length, geprueft, bestanden,
    fehlendeFelder: fehlend.map(s => s.pruefung.feldKey).filter(Boolean)
  }
}

/** Status eines Deckblattfeldes aus dem Prüflauf (für die Randmarkierung im Deckblatt). */
export function statusJeFeld(lauf) {
  const je = {}
  for (const s of lauf.schritte) {
    const key = s.pruefung.feldKey
    if (!key) continue
    if (s.status === 'fehlt' || s.status === 'sonderfall' || s.status === 'hinweis' || s.status === 'recherche') je[key] = s.status
  }
  return je
}

/** Fasst eine Liste von Vorgängen für Kennzahlen und Schlussszene zusammen. */
export function auswertung(vorgaenge) {
  const laeufe = vorgaenge.map(v => ({ vorgang: v, lauf: pruefe(v) }))
  const zaehle = (art) => laeufe.filter(l => l.lauf.ergebnis.art === art).length
  const bereit = zaehle('bereit')
  const rueckfrage = zaehle('rueckfrage')
  const sonderfall = zaehle('sonderfall')
  return {
    laeufe, gesamt: laeufe.length, bereit, rueckfrage, sonderfall,
    quote: laeufe.length ? Math.round((bereit / laeufe.length) * 100) : 0
  }
}

/** Welche Angaben über alle Eingänge am häufigsten fehlen. */
export function haeufigFehlend(laeufe) {
  const zaehler = new Map()
  for (const { lauf } of laeufe) {
    if (lauf.ergebnis.hart) continue
    const gesehen = new Set()
    for (const s of lauf.schritte) {
      if (s.status !== 'fehlt') continue
      const name = s.pruefung.stufe === 'plausi' ? null : s.pruefung.feld
      if (!name || gesehen.has(name)) continue
      gesehen.add(name)
      zaehler.set(name, (zaehler.get(name) || 0) + 1)
    }
  }
  return [...zaehler.entries()].map(([name, anzahl]) => ({ name, anzahl })).sort((a, b) => b.anzahl - a.anzahl || a.name.localeCompare(b.name))
}
