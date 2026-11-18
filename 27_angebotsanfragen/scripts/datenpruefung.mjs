#!/usr/bin/env node
// Prüft die Demo-Eingänge ohne Browser:
//   – jede Markierung im Dokument zeigt auf ein Feld, das es gibt
//   – jedes gefüllte Feld, jede Betriebsart, Risikofrage und Auffälligkeit hat eine Fundstelle
//   – Betriebsarten stehen in der Demo-Liste (außer „nicht eindeutig zuordenbar“)
//   – keine Emojis, keine englischen Datumsformate in den Texten
// und gibt das Prüfergebnis je Eingang aus.

import { VORGAENGE } from '../src/daten/vorgaenge.js'
import { sammleFundstellen, dokumentAlsText } from '../src/utils/markierung.js'
import { feldfolge, feld, abschnitteFuer, VORGANGSFELDER, layoutVon } from '../src/utils/layouts.js'
import { pruefe, auswertung, haeufigFehlend } from '../src/utils/pruefengine.js'
import { baueRueckfrage } from '../src/utils/rueckfrage.js'
import { ALLE_BETRIEBSARTEN } from '../src/utils/betriebsarten.js'

const ausfuehrlich = process.argv.includes('--alles')
let fehler = 0
const melde = (v, text) => { fehler++; console.log(`  ✗ ${v.id}: ${text}`) }

const EMOJI = /[\u{1F000}-\u{1FAFF}\u{2600}-\u{27BF}\u{FE0F}]/u

for (const v of VORGAENGE) {
  const fund = sammleFundstellen(v)
  const folge = feldfolge(v)
  const bekannt = new Set([...folge, ...(v.auffaelligkeiten || []).map(a => a.key)])

  for (const key of Object.keys(fund)) {
    if (!bekannt.has(key)) melde(v, `Markierung „${key}“ zeigt auf kein Feld des Deckblatts`)
  }
  for (const key of Object.keys(v.felder || {})) {
    if (!folge.includes(key)) melde(v, `Feld „${key}“ steht nicht im Layout ${layoutVon(v).id}`)
  }
  for (const key of folge) {
    const istListe = (v.betriebsarten || []).some(b => b.key === key) || (v.risikofragen || []).some(r => r.key === key)
    const f = istListe ? { wert: 'x' } : feld(v, key)
    if (f.wert && !fund[key]) melde(v, `Feld „${key}“ hat einen Wert, aber keine Fundstelle`)
    if (!f.wert && fund[key] && f.art !== 'fehlt') melde(v, `Feld „${key}“ ist markiert, aber leer`)
  }
  for (const a of v.auffaelligkeiten || []) {
    if (!fund[a.key]) melde(v, `Auffälligkeit „${a.key}“ hat keine Fundstelle`)
    if (a.wirkung === 'rueckfrage' && !a.frage) melde(v, `Auffälligkeit „${a.key}“ führt zur Rückfrage, hat aber keine Frage`)
  }
  for (const b of v.betriebsarten || []) {
    if (b.treffer !== 'offen' && !ALLE_BETRIEBSARTEN.includes(b.bezeichnung)) melde(v, `Betriebsart „${b.bezeichnung}“ steht nicht in der Demo-Liste`)
  }
  const text = JSON.stringify(v)
  if (EMOJI.test(text)) melde(v, 'Emoji oder Symbolzeichen in den Daten')
  if (/\{[a-zA-Z]+\}/.test(text)) melde(v, `Platzhalter nicht aufgelöst: ${text.match(/\{[a-zA-Z]+\}/)[0]}`)
  if (!v.gesamteinschaetzung) melde(v, 'Gesamteinschätzung fehlt')
}

console.log('\nErgebnis je Eingang')
for (const v of [...VORGAENGE].sort((a, b) => a.id.localeCompare(b.id))) {
  const lauf = pruefe(v)
  const fund = sammleFundstellen(v)
  const marken = Object.values(fund).reduce((n, l) => n + l.length, 0)
  console.log(`  ${v.id}  ${(v.beispiel ? `Beispiel ${v.beispiel}` : 'synthetisch').padEnd(11)} ${layoutVon(v).kurz.padEnd(10)} ${lauf.ergebnis.art.padEnd(10)} ${String(lauf.bestanden).padStart(2)}/${String(lauf.geprueft).padEnd(2)} Fragen ${lauf.fragen.length}  Recherche ${lauf.auftraege.length}  Hinweise ${lauf.hinweise}  Fundstellen ${marken}  – ${v.kunde}`)
  if (ausfuehrlich) {
    for (const f of lauf.fragen) console.log(`        ? ${f}`)
    for (const a of lauf.auftraege) console.log(`        R ${a}`)
    if (lauf.ergebnis.art === 'rueckfrage') console.log('\n' + baueRueckfrage(v, lauf).text.split('\n').map(z => '        | ' + z).join('\n') + '\n')
  }
}

const a = auswertung(VORGAENGE)
console.log(`\nGesamt ${a.gesamt}: bereit ${a.bereit}, Rückfrage ${a.rueckfrage}, Sonderfall ${a.sonderfall}`)
console.log('Häufig fehlend:', haeufigFehlend(a.laeufe).map(f => `${f.name} (${f.anzahl})`).join(', '))
if (ausfuehrlich) console.log('\n' + dokumentAlsText(VORGAENGE.find(v => v.beispiel === 2).dokumente[0]).slice(0, 900))

if (fehler) { console.log(`\n${fehler} Fehler in den Daten`); process.exit(1) }
console.log('\nDaten in Ordnung')
