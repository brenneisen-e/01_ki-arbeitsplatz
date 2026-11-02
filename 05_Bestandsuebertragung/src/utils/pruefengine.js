/**
 * Prüf-Engine: führt den Prüfkatalog gegen einen Vorgang aus.
 *
 * Ablauf entspricht der Logik einer automatisierten Vorprüfung:
 *   1. Die harten Kriterien laufen zuerst. Der erste Verstoß beendet den Lauf.
 *   2. Danach laufen alle weichen Prüfungen vollständig durch. Jeder Verstoß
 *      wird nur gemerkt, die Verarbeitung läuft weiter.
 *   3. Am Ende entscheidet die Anzahl der gemerkten Gründe:
 *        0 Gründe  – Übergabe an die automatisierte Weiterverarbeitung
 *        1 Grund   – definierte Reaktion laut Katalog
 *        > 1 Grund – Aussteuerung an den Themenpostkorb
 */

import { STUFEN, PRUEFUNGEN, REAKTION } from './pruefkatalog.js'

export function pruefe(vorgang) {
  const schritte = []
  let abbruch = null

  for (const p of PRUEFUNGEN) {
    const stufe = STUFEN.find(s => s.id === p.stufe)

    if (abbruch) {
      schritte.push({ pruefung: p, stufe, status: 'uebersprungen' })
      continue
    }

    const r = p.pruefe(vorgang)
    schritte.push({ pruefung: p, stufe, ...r })

    if (r.status === 'be' && stufe.art === 'hart') {
      abbruch = p.beText
    }
  }

  const gruende = schritte
    .filter(s => s.status === 'be')
    .map(s => s.pruefung.beText)
    .filter(Boolean)

  const hinweise = schritte.filter(s => s.status === 'info')
  const geprueft = schritte.filter(s => s.status !== 'uebersprungen' && s.status !== 'neutral').length
  const bestanden = schritte.filter(s => s.status === 'ok').length

  let ergebnis
  if (abbruch) {
    ergebnis = {
      art: 'hart',
      titel: 'Formale Vorprüfung nicht bestanden',
      beFlag: abbruch,
      aktion: 'Verarbeitung beendet, Vorgang geht an den Themenpostkorb',
      gruende: [abbruch]
    }
  } else if (gruende.length === 0) {
    ergebnis = {
      art: 'clean',
      titel: 'Vollständig durchgelaufen',
      beFlag: null,
      aktion: 'Übergabe an die automatisierte Weiterverarbeitung',
      gruende: []
    }
  } else if (gruende.length === 1) {
    ergebnis = {
      art: 'be',
      titel: 'Ein Ablehnungsgrund',
      beFlag: gruende[0],
      aktion: REAKTION[gruende[0]] || 'Aussteuerung an den Themenpostkorb',
      gruende
    }
  } else {
    ergebnis = {
      art: 'be',
      titel: 'Mehrere Ablehnungsgründe',
      beFlag: 'Mehrere Ablehnungsgründe',
      aktion: 'Aussteuerung an den Themenpostkorb',
      gruende
    }
  }

  ergebnis.bearbeitungsnotiz = gruende.join('; ')
  if (vorgang.deckblatt.anfUnterlagen === 'ja') {
    ergebnis.folgearbeit = vorgang.deckblatt.artUnterlagen
  }

  return { schritte, ergebnis, geprueft, bestanden, hinweise: hinweise.length }
}

/** Fasst eine Liste von Vorgängen für die Kennzahlenleiste zusammen. */
export function auswertung(vorgaenge) {
  const laeufe = vorgaenge.map(v => ({ vorgang: v, lauf: pruefe(v) }))
  const clean = laeufe.filter(l => l.lauf.ergebnis.art === 'clean').length
  const hart = laeufe.filter(l => l.lauf.ergebnis.art === 'hart').length
  const be = laeufe.filter(l => l.lauf.ergebnis.art === 'be').length
  return {
    laeufe,
    gesamt: laeufe.length,
    clean,
    hart,
    be,
    quote: laeufe.length ? Math.round((clean / laeufe.length) * 100) : 0
  }
}
