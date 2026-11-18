/**
 * Angaben zu jedem Feld eines Vorgangs, die Original und Deckblatt verbinden:
 * in welcher Farbe die Fundstelle steht, zu welchem Abschnitt des Deckblatts
 * sie gehört und was die KI dort gelesen hat.
 */

import { feld, feldfolge, abschnittNr } from './layouts.js'
import { sammleFundstellen } from './markierung.js'

export function baueFeldInfo(vorgang) {
  const info = {}
  const betriebsarten = vorgang.betriebsarten || []
  const risikofragen = vorgang.risikofragen || []

  for (const key of feldfolge(vorgang)) {
    const nr = abschnittNr(vorgang, key)
    const ba = betriebsarten.find(b => b.key === key)
    const rf = risikofragen.find(r => r.key === key)
    let eintrag
    if (ba) {
      eintrag = { farbe: 'interpretiert', label: 'Betriebsart', wert: ba.bezeichnung + (ba.anteil ? ` (${ba.anteil})` : '') }
    } else if (rf) {
      eintrag = { farbe: 'gelesen', label: rf.frage, wert: rf.antwort }
    } else {
      const f = feld(vorgang, key)
      eintrag = {
        farbe: f.art === 'interpretiert' ? 'interpretiert' : f.art === 'fehlt' ? 'auffaellig' : 'gelesen',
        label: f.label,
        wert: f.wert || (f.art === 'fehlt' ? 'unvollständig' : '')
      }
    }
    info[key] = { key, nr, ...eintrag, titel: `${nr !== '' ? `${nr}) ` : ''}${eintrag.label}: ${eintrag.wert}` }
  }

  for (const a of vorgang.auffaelligkeiten || []) {
    info[a.key] = { key: a.key, nr: '!', farbe: 'auffaellig', label: 'Auffälligkeit', wert: a.titel, titel: `Auffälligkeit: ${a.titel}` }
  }
  return info
}

/** Feldinfo und Fundstellen eines Vorgangs in einem Rutsch. */
export function baueVerknuepfung(vorgang) {
  return { info: baueFeldInfo(vorgang), fundstellen: sammleFundstellen(vorgang) }
}

/**
 * Die Reihenfolge, in der die KI im Präsentationsmodus liest: erst die
 * Einordnung, dann das Deckblatt von oben nach unten, zuletzt die
 * Auffälligkeiten. Nur Felder, die es im Vorgang gibt.
 */
export function lesefolge(vorgang) {
  return [...feldfolge(vorgang), ...(vorgang.auffaelligkeiten || []).map(a => a.key)]
}
