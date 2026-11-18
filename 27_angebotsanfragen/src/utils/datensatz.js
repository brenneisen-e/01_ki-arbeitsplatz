/**
 * Das Deckblatt als Datensatz.
 *
 * Dieselben Felder wie im Deckblatt, in derselben Reihenfolge, mit Herkunft
 * und Fundstelle je Wert. In der ersten Stufe tippt die Sachbearbeitung vom
 * Deckblatt ab; in der zweiten übergibt Robotics oder eine Schnittstelle
 * genau diesen Datensatz an das Angebotssystem.
 */

import { abschnitteFuer, feld, layoutVon, VORGANGSFELDER, ART } from './layouts.js'
import { sammleFundstellen, quelleLang } from './markierung.js'

export function baueDatensatz(vorgang, lauf) {
  const fund = sammleFundstellen(vorgang)
  const layout = layoutVon(vorgang)
  const quelle = (key) => (fund[key] || []).map(quelleLang)

  const alsFeld = (f) => ({
    feld: f.label,
    wert: f.wert || null,
    herkunft: ART[f.art].label,
    ...(f.herleitung ? { herleitung: f.herleitung } : {}),
    ...(quelle(f.key).length ? { fundstellen: quelle(f.key) } : {})
  })

  return {
    vorgang: {
      nummer: vorgang.id,
      eingang: `${vorgang.eingang} ${vorgang.uhrzeit}`,
      kanal: vorgang.kanal,
      layout: layout.id === 'sonstig' ? null : layout.kurz,
      ergebnis: lauf.ergebnis.titel,
      naechsterSchritt: lauf.ergebnis.aktion
    },
    kopf: Object.fromEntries(VORGANGSFELDER.map(k => {
      const f = feld(vorgang, k)
      return [k, f.wert || null]
    })),
    abschnitte: abschnitteFuer(vorgang).map(a => ({
      nr: a.nr,
      titel: a.titel,
      ...(a.typ === 'betriebsarten'
        ? {
            betriebsarten: (vorgang.betriebsarten || []).map(b => ({
              bezeichnung: b.bezeichnung, anteil: b.anteil || null,
              zuordnung: b.treffer, begruendung: b.begruendung, fundstellen: quelle(b.key)
            }))
          }
        : {
            felder: a.zeilen.map(alsFeld),
            ...(a.gruppen.length ? { objekte: a.gruppen.map(g => ({ objekt: g.titel, felder: g.zeilen.map(alsFeld) })) } : {}),
            ...(a.risikofragen ? { risikofragen: (vorgang.risikofragen || []).map(r => ({ frage: r.frage, antwort: r.antwort, fundstellen: quelle(r.key) })) } : {})
          })
    })),
    gesamteinschaetzung: vorgang.gesamteinschaetzung,
    auffaelligkeiten: (vorgang.auffaelligkeiten || []).map(a => ({ titel: a.titel, text: a.text, wirkung: a.wirkung, fundstellen: quelle(a.key) })),
    offenePunkte: lauf.fragen,
    recherche: lauf.auftraege
  }
}

function lade(name, inhalt, typ) {
  const url = URL.createObjectURL(new Blob([inhalt], { type: typ }))
  const a = document.createElement('a')
  a.href = url
  a.download = name
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  setTimeout(() => URL.revokeObjectURL(url), 2000)
}

export function ladeDatensatz(vorgang, datensatz) {
  lade(`Deckblatt_${vorgang.id}.json`, JSON.stringify(datensatz, null, 2), 'application/json')
}

export { lade as ladeDatei }
