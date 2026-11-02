// Parser für docs/speakernotes-vortrag-markt-vertrieb.md: dieselbe Blockstruktur
// wie scripts/speakernotes-pdf.mjs, hier für das Notizfenster im Browser.

export type Block =
  | { typ: 'h1'; text: string }
  | { typ: 'h2'; text: string }
  | { typ: 'hr' }
  | { typ: 'p'; text: string }
  | { typ: 'liste'; punkte: string[] }
  | { typ: 'tabelle'; zeilen: string[][] }

export function inBloecke(md: string): Block[] {
  const z = md.split('\n')
  const out: Block[] = []
  let i = 0
  while (i < z.length) {
    const l = z[i]
    if (!l.trim()) { i++; continue }
    if (l.startsWith('# ')) { out.push({ typ: 'h1', text: l.slice(2).trim() }); i++; continue }
    if (l.startsWith('## ')) { out.push({ typ: 'h2', text: l.slice(3).trim() }); i++; continue }
    if (l.trim() === '---') { out.push({ typ: 'hr' }); i++; continue }
    if (l.startsWith('|')) {
      const zeilen: string[][] = []
      while (i < z.length && z[i].startsWith('|')) {
        if (!/^\|\s*-/.test(z[i])) zeilen.push(z[i].replace(/^\||\|$/g, '').split('|').map((c) => c.trim()))
        i++
      }
      out.push({ typ: 'tabelle', zeilen })
      continue
    }
    if (l.startsWith('- ')) {
      const punkte: string[] = []
      while (i < z.length && (z[i].startsWith('- ') || z[i].startsWith('  '))) {
        if (z[i].startsWith('- ')) punkte.push(z[i].slice(2).trim())
        else punkte[punkte.length - 1] += ' ' + z[i].trim()
        i++
      }
      out.push({ typ: 'liste', punkte })
      continue
    }
    const teile: string[] = []
    while (i < z.length && z[i].trim() && !/^(#{1,2} |\||- |---$)/.test(z[i])) { teile.push(z[i].trim()); i++ }
    out.push({ typ: 'p', text: teile.join(' ') })
  }
  return out
}

export type Teile = { vorspann: Block[]; rede: Block[]; anhang: Block[] }

/** Drei Teile, getrennt durch die beiden Trennlinien: Vorspann, Rede, Anhang. */
export function teile(bloecke: Block[]): Teile {
  const gruppen: Block[][] = [[]]
  for (const b of bloecke) {
    if (b.typ === 'hr') gruppen.push([])
    else gruppen[gruppen.length - 1].push(b)
  }
  return { vorspann: gruppen[0] ?? [], rede: gruppen[1] ?? [], anhang: gruppen[2] ?? [] }
}

export type Abschnitt = { id: string; marke: string; titel: string; dauer: string; kurz: string }
const MARKE = /^(\d+:\d\d)\s+(.+?)\s+\((.+)\)$/

const KURZ: Record<string, string> = {
  vorstellung: 'Vorstellung', einstieg: 'Bühne', studie: 'Studie', hypothesen: 'Hypothesen', demo: 'Demo', schluss: 'Schluss',
  opening: 'Opening', context: 'Context', felder: 'Four fields', openfinance: 'Open Finance', closing: 'Closing',
}

export function abschnittId(titel: string): string {
  const t = titel.toLowerCase()
  // Englisches Skript (Claude Code pilot)
  if (t.includes('opening')) return 'opening'
  if (t.includes('context')) return 'context'
  if (t.includes('four fields')) return 'felder'
  if (t.includes('open finance')) return 'openfinance'
  if (t.includes('closing')) return 'closing'
  if (t.includes('vorstellung')) return 'vorstellung'
  if (t.includes('einstieg')) return 'einstieg'
  if (t.includes('studie')) return 'studie'
  if (t.includes('hypothes')) return 'hypothesen'
  if (t.includes('demo')) return 'demo'
  if (t.includes('schluss')) return 'schluss'
  return t.replace(/[^a-z0-9äöüß]+/g, '-').replace(/^-|-$/g, '')
}

export function parseH2(text: string): Abschnitt | null {
  const m = text.match(MARKE)
  if (!m) return null
  const id = abschnittId(m[2])
  return { id, marke: m[1], titel: m[2], dauer: m[3], kurz: KURZ[id] ?? m[2].split(/[\s:]/)[0] }
}

/** Anker einer Regieanweisung: „[Weiter. Hypothese n: …]" → hypothese-n,
 *  „[Klick auf das Stockwerk …]" → einstieg-buehne (Moment, in dem die
 *  Einstiegsbühne erscheint; davor läuft die Übersicht weiter). */
export function regieAnker(regie: string): string | null {
  const m = regie.match(/Hypothese\s+(\d)/)
  if (m) return `hypothese-${m[1]}`
  if (/Klick auf das Stockwerk/i.test(regie)) return 'einstieg-buehne'
  return null
}

// Sätze trennen für die Stichpunkt-Darstellung: Satzende, Leerraum, dann
// Großbuchstabe, Zahl oder öffnendes Anführungszeichen. Abkürzungen bleiben
// zusammen, sehr kurze Sätze hängen sich an den Vorgänger.
const ZWEITEILIG = [/z\. B\./g, /u\. a\./g, /d\. h\./g, /o\. Ä\./g, /i\. d\. R\./g]
const ABKUERZUNG = /(?:\bbzw|\bca|\bDr|\bProf|\bNr|\bMio|\bMrd|\bTsd|\bvs|\betc|\binkl|\bggf|\bevtl|\bsog|\busw|z\. B|u\. a|d\. h|o\. Ä|i\. d\. R)\.$/

export function saetze(text: string): string[] {
  let t = text
  for (const re of ZWEITEILIG) t = t.replace(re, (m) => m.replace(/ /g, ' '))
  const roh = t.split(/(?<=[.!?][“”"’)]?)\s+(?=[„"“(\[A-ZÄÖÜ0-9])/)
  const out: string[] = []
  for (const s of roh) {
    const prev = out[out.length - 1]
    if (prev !== undefined && ABKUERZUNG.test(prev)) out[out.length - 1] = prev + ' ' + s
    else out.push(s)
  }
  const res: string[] = []
  for (const s of out) {
    if (res.length && s.split(/\s+/).length < 4) res[res.length - 1] += ' ' + s
    else res.push(s)
  }
  return res.map((s) => s.replace(/ /g, ' '))
}
