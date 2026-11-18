/**
 * Fundstellen in den Dokumenten eines Eingangs.
 *
 * Die Dokumente (Mailverlauf, Beratungsdokumentation, Plattform-Anfrage …)
 * liegen als Seiten aus Blöcken vor. In den Texten der Blöcke steht an jeder
 * Stelle, an der die KI einen Wert gelesen hat, eine Markierung:
 *
 *     Umsatz: [[umsatz|585.000 €]]
 *     Mitarbeiter: [[vollzeit|8 Vollzeit; 2 Azubis]]; [[teilzeit|1 Teilzeit]]
 *     … um [[a1,ba3|Folierung von Fahrzeugen]] geht.
 *
 * Vor dem Strich stehen die Feldschlüssel (mehrere mit Komma), dahinter der
 * sichtbare Text. Aus diesen Markierungen entstehen
 *   – die gelben Stellen im Original,
 *   – die Quellenangabe je Feld im Deckblatt (Seite und Bereich),
 *   – die Lesereihenfolge im Präsentationsmodus.
 */

const MARKE = /\[\[([^\]|]+)\|([^\]]*)\]\]/g

/** Zerlegt einen Text in Stücke; Stücke mit `felder` sind Fundstellen. */
export function zerlege(text) {
  if (typeof text !== 'string' || !text.includes('[[')) return [{ text: text ?? '' }]
  const teile = []
  let pos = 0
  for (const m of text.matchAll(MARKE)) {
    if (m.index > pos) teile.push({ text: text.slice(pos, m.index) })
    teile.push({ text: m[2], felder: m[1].split(',').map(f => f.trim()).filter(Boolean) })
    pos = m.index + m[0].length
  }
  if (pos < text.length) teile.push({ text: text.slice(pos) })
  return teile
}

/** Derselbe Text ohne Markierungen, etwa für EML-Export und Kopieren. */
export function ohneMarken(text) {
  return typeof text === 'string' ? text.replace(MARKE, '$2') : ''
}

/**
 * Die Fundstellen eines Blocks. Ein Block trägt seine Texte entweder mit
 * Markierungen im Text oder – bei live gelesenen Eingängen – schon zerlegt in
 * `teile` (dort kann der Text selbst eckige Klammern enthalten).
 */
function fundstellenDesBlocks(block, aufTeil) {
  if (block && typeof block === 'object' && Array.isArray(block.teile)) {
    for (const teil of block.teile) if (teil.felder) aufTeil(teil)
    return
  }
  texteDesBlocks(block, (text) => {
    for (const teil of zerlege(text)) if (teil.felder) aufTeil(teil)
  })
}

/** Läuft über alle Texte eines Blocks, auch in verschachtelten Zeilen, Optionen und Spalten. */
function texteDesBlocks(block, aufText) {
  if (block == null) return
  if (typeof block === 'string') { aufText(block); return }
  if (Array.isArray(block)) { block.forEach(b => texteDesBlocks(b, aufText)); return }
  if (typeof block === 'object') {
    for (const [schluessel, wert] of Object.entries(block)) {
      if (schluessel === 't' || schluessel === 'ort' || schluessel === 'stil' || schluessel === 'icon') continue
      texteDesBlocks(wert, aufText)
    }
  }
}

/**
 * Alle Fundstellen eines Vorgangs, je Feld in Lesereihenfolge.
 * Rückgabe: { feld: [{ dokId, dokTitel, dokNr, seite, ort, text }] }
 */
export function sammleFundstellen(vorgang) {
  const je = {}
  vorgang.dokumente.forEach((dok, dokNr) => {
    // Der Bereich gilt weiter, bis ein Block einen neuen setzt – auch über den Seitenwechsel hinweg.
    let ort = ''
    dok.seiten.forEach((bloecke, i) => {
      for (const block of bloecke) {
        if (block && typeof block === 'object' && block.ort) ort = block.ort
        fundstellenDesBlocks(block, (teil) => {
          for (const feld of teil.felder) {
            (je[feld] ||= []).push({
              dokId: dok.id, dokTitel: dok.titel, dokNr,
              seite: i + 1, ort, text: teil.text.replace(/\s+/g, ' ').trim()
            })
          }
        })
      }
    })
  })
  return je
}

/** Kurze Quellenangabe für den Chip im Deckblatt, z. B. „S. 2“ oder „Anhang · S. 1“. */
export function quelleKurz(fundstelle, mehrereDokumente) {
  if (!fundstelle) return ''
  const seite = `S. ${fundstelle.seite}`
  return mehrereDokumente ? `${fundstelle.dokNr === 0 ? 'Mail' : 'Anhang'} · ${seite}` : seite
}

/** Ausführliche Quellenangabe: Dokument, Seite, Bereich. */
export function quelleLang(fundstelle) {
  if (!fundstelle) return ''
  return [fundstelle.dokTitel, `Seite ${fundstelle.seite}`, fundstelle.ort].filter(Boolean).join(' · ')
}

/** Der reine Text eines Dokuments, Seite für Seite (für Export und KI-Aufruf). */
export function dokumentAlsText(dok) {
  return dok.seiten.map((bloecke, i) => {
    const zeilen = []
    for (const block of bloecke) zeilen.push(blockAlsText(block))
    const inhalt = zeilen.filter(z => z !== '').join('\n')
    return dok.seiten.length > 1 ? `--- Seite ${i + 1} ---\n${inhalt}` : inhalt
  }).join('\n\n')
}

function blockAlsText(block) {
  if (!block || typeof block !== 'object') return ''
  switch (block.t) {
    case 'pt':
      return block.teile.map(t => t.text).join('')
    case 'kopf':
      return block.zeilen.map(([l, w]) => `${l} ${ohneMarken(w)}`.trim()).join('\n')
    case 'tabelle':
      return [
        block.kopf ? block.kopf.join(' | ') : '',
        ...block.zeilen.map(z => {
          if (z.abschnitt) return `\n${ohneMarken(z.abschnitt)}`
          const wert = z.optionen
            ? z.optionen.map(o => `${o.x ? '[x]' : '[ ]'} ${ohneMarken(o.text)}`).join('; ')
            : ohneMarken(z.w || '')
          return `${ohneMarken(z.l || '')}: ${wert}`
        })
      ].filter(Boolean).join('\n')
    case 'kontakt':
      return block.zeilen.map(z => ohneMarken(z.text)).join('\n')
    case 'liste':
      return block.punkte.map(p => `- ${ohneMarken(p)}`).join('\n')
    case 'spalten':
      return block.zellen.map(z => ohneMarken(z.text || '')).filter(Boolean).join(' | ')
    case 'fuss':
      return [block.links, block.rechts].map(ohneMarken).filter(Boolean).join(' | ')
    case 'linie': case 'abstand':
      return ''
    case 'unterschrift':
      return `(Unterschrift ${block.name || ''})`.trim()
    case 'logo':
      return ''
    default:
      return ohneMarken(block.text || '')
  }
}
