// Alle Markierungen der Beispielanfragen in Lesereihenfolge, mit dem Text davor (Kontext),
// damit sich jede Stelle auf der Originalseite wiederfinden lässt.
// Aufruf: node marken.mjs <Pfad zur App> [marke]  →  JSON auf stdout
const basis = process.argv[2]
globalThis.window = { location: { search: process.argv[3] ? '?marke=' + process.argv[3] : '', href: 'http://x/' } }
globalThis.localStorage = { getItem: () => null, setItem: () => {} }
const { BEISPIELE } = await import(basis + '/src/daten/vorgaenge.js')
const { zerlege, ohneMarken } = await import(basis + '/src/utils/markierung.js')

function einheiten(block) {
  // Liefert die Texte eines Blocks als { label, text } in Lesereihenfolge.
  if (!block || typeof block !== 'object') return []
  const e = (label, text) => (typeof text === 'string' && text ? [{ label: ohneMarken(label || ''), text }] : [])
  switch (block.t) {
    case 'kopf': return block.zeilen.flatMap(([l, w]) => e(l, w))
    case 'tabelle': return block.zeilen.flatMap(z => {
      if (z.abschnitt) return e('', z.abschnitt)
      if (z.voll) return e('', z.voll)
      if (z.optionen) return [...e('', z.l), ...z.optionen.flatMap(o => [{ label: ohneMarken(z.l || ''), text: o.text, option: true, gewaehlt: !!o.x }])]
      return [...e('', z.l), ...e(z.l, z.w)]
    })
    case 'kontakt': return block.zeilen.flatMap(z => e('', z.text))
    case 'liste': return block.punkte.flatMap(p => e('', p))
    case 'spalten': return block.zellen.flatMap(z => e('', z.text))
    case 'fuss': return [...e('', block.links), ...e('', block.rechts)]
    default: return e('', block.text)
  }
}

const aus = {}
for (const v of BEISPIELE) {
  const seiten = []
  // Die Beispielanfragen bestehen aus genau einem Dokument, Seite für Seite wie das PDF.
  v.dokumente[0].seiten.forEach((bloecke, i) => {
    const marken = []
    const gezaehlt = new Map()   // Bezeichnung → wie oft schon als Zeile vorgekommen
    let letzteZeile = null
    for (const block of bloecke) {
      for (const ein of einheiten(block)) {
        // Mehrere Einheiten derselben Zeile (Optionen) zählen als eine Zeile.
        const zeilenSchluessel = ein.label ? `${ein.label}` : ''
        if (ein.label && !(ein.option && letzteZeile === zeilenSchluessel)) {
          gezaehlt.set(ein.label, (gezaehlt.get(ein.label) ?? -1) + 1)
        }
        letzteZeile = ein.option ? zeilenSchluessel : null
        const labelNr = ein.label ? gezaehlt.get(ein.label) : 0
        let vor = ''
        const teile = zerlege(ein.text)
        teile.forEach((t, k) => {
          if (t.felder) {
            const nach = teile.slice(k + 1).map(x => x.text).join('')
            marken.push({ felder: t.felder, text: t.text.replace(/\s+/g, ' ').trim(), label: ein.label, labelNr, vor: vor.replace(/\s+/g, ' ').slice(-90), nach: nach.replace(/\s+/g, ' ').slice(0, 60), option: !!ein.option })
          }
          vor += t.text
        })
      }
    }
    seiten.push(marken)
  })
  aus['b' + v.beispiel] = { id: v.id, seiten }
}
console.log(JSON.stringify(aus))
