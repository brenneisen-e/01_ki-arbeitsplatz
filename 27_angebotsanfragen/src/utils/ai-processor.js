/**
 * Live-Auslesen eines eigenen Eingangs mit Claude.
 *
 * Für die Demo-Eingänge ist die Auswertung hinterlegt. Eigene Anfragen (Text,
 * EML oder PDF, auch Scans) liest Claude über die Anthropic-API: eingeordnet
 * wird nach Vorgangsart und Sparte, gefüllt wird das Layout der Sparte, und
 * zu jedem Wert liefert das Modell die wörtliche Textstelle, aus der er
 * stammt. Aus diesen Zitaten entstehen die Fundstellen im Original.
 *
 * Der API Key liegt nur im localStorage dieses Browsers und geht direkt an
 * die Anthropic-API. Für den Betrieb gehört der Aufruf hinter einen eigenen
 * Dienst.
 */

import { LAYOUTS, FELDER, VORGANGSFELDER, basisKey } from './layouts.js'
import { begriffe } from './branding.js'

const SPEICHER = 'claude_api_key'

// ============================================================
// API Key (localStorage)
// ============================================================

export function getApiKey() {
  try { return localStorage.getItem(SPEICHER) || '' } catch { return '' }
}

export function setApiKey(key) {
  try {
    if (key) localStorage.setItem(SPEICHER, key)
    else localStorage.removeItem(SPEICHER)
  } catch { /* Speicher gesperrt */ }
}

export function hasApiKey() {
  return getApiKey().length > 10
}

// ============================================================
// Aufruf
// ============================================================

/**
 * Liest einen Eingang mit Claude.
 * eingang: { betreff, absender, text, anhaenge: [Dateinamen], pdfs: [{ name, bytes }] }
 * Der eigentliche Aufruf (SDK, Antwortschema, Auftrag) liegt in ai-anfrage.js
 * und wird erst geladen, wenn wirklich live gelesen wird.
 */
export async function leseEingang(eingang) {
  const apiKey = getApiKey()
  if (!apiKey) throw new Error('Kein API Key hinterlegt.')
  const { frageClaude } = await import('./ai-anfrage.js')
  return frageClaude(eingang, apiKey)
}

// ============================================================
// Aus der Antwort wird ein Vorgang
// ============================================================

const escape = (t) => t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

/** Sucht ein Zitat in den Seiten; Leerraum und Zeilenumbrüche dürfen abweichen. */
function findeZitat(seiten, zitat) {
  const kern = (zitat || '').trim()
  if (kern.length < 2) return null
  const muster = new RegExp(kern.split(/\s+/).map(escape).join('\\s+'))
  for (let i = 0; i < seiten.length; i++) {
    const m = muster.exec(seiten[i])
    if (m) return { seite: i, start: m.index, ende: m.index + m[0].length }
  }
  return null
}

/** Zerlegt jede Seite in Textstücke; Stücke mit `felder` sind Fundstellen. */
function markiere(seiten, belege) {
  const jeSeite = seiten.map(() => [])
  for (const { key, zitate } of belege) {
    for (const zitat of zitate || []) {
      const t = findeZitat(seiten, zitat)
      if (!t) continue
      const liste = jeSeite[t.seite]
      // Liegt das Zitat in einer schon markierten Stelle (oder ist es dieselbe),
      // belegt diese Stelle auch dieses Feld. Andere Überschneidungen entfallen.
      const umfassend = liste.find(b => t.start >= b.start && t.ende <= b.ende)
      if (umfassend) { if (!umfassend.felder.includes(key)) umfassend.felder.push(key); continue }
      if (liste.some(b => t.start < b.ende && t.ende > b.start)) continue
      liste.push({ start: t.start, ende: t.ende, felder: [key] })
    }
  }
  return seiten.map((text, i) => {
    const teile = []
    let pos = 0
    for (const b of jeSeite[i].sort((a, c) => a.start - c.start)) {
      if (b.start > pos) teile.push({ text: text.slice(pos, b.start) })
      teile.push({ text: text.slice(b.start, b.ende), felder: b.felder })
      pos = b.ende
    }
    if (pos < text.length) teile.push({ text: text.slice(pos) })
    return teile
  })
}

let laufendeNr = 0

/**
 * Baut aus der Antwort des Modells einen Vorgang, wie ihn Original, Deckblatt
 * und Prüfung erwarten.
 * quelle: { name, art: 'text' | 'eml' | 'pdf', betreff, absender, text, pdfUrl, anhaenge }
 */
export function baueVorgang(antwort, quelle) {
  const jetzt = new Date()
  const layout = LAYOUTS[antwort.produkt] || LAYOUTS.sonstig
  const objekte = antwort.produkt === 'gebaeude' ? (antwort.objekte?.length ? antwort.objekte : ['Gebäude']) : []

  // Nur Felder übernehmen, die es im Layout gibt; alles andere wäre im Deckblatt nicht sichtbar.
  const erlaubt = new Set([
    ...VORGANGSFELDER,
    ...layout.abschnitte.flatMap(a => a.felder || []),
    ...layout.abschnitte.flatMap(a => (a.jeObjekt || []).flatMap(k => objekte.map((_, i) => `${k}#${i + 1}`)))
  ])
  const felder = {}
  const belege = []
  for (const f of antwort.felder || []) {
    const key = FELDER[basisKey(f.feld)] && erlaubt.has(f.feld) ? f.feld
      : erlaubt.has(`${f.feld}#1`) ? `${f.feld}#1` : null
    if (!key || !f.wert) continue
    felder[key] = { w: f.wert, art: f.art, h: f.herleitung || '' }
    belege.push({ key, zitate: f.zitate })
  }
  if (!felder.vorgangsart) felder.vorgangsart = { w: antwort.vorgangsart, art: 'interpretiert', h: antwort.einordnung }

  const betriebsarten = (antwort.betriebsarten || []).map((b, i) => {
    belege.push({ key: `ba${i + 1}`, zitate: b.zitate })
    return { key: `ba${i + 1}`, bezeichnung: b.bezeichnung, anteil: b.anteil || '', treffer: b.treffer, begruendung: b.begruendung }
  })
  const risikofragen = (antwort.risikofragen || []).map((r, i) => {
    belege.push({ key: `rf${i + 1}`, zitate: r.zitate })
    return { key: `rf${i + 1}`, frage: r.frage, antwort: r.antwort }
  })
  const auffaelligkeiten = (antwort.auffaelligkeiten || []).map((a, i) => {
    belege.push({ key: `a${i + 1}`, zitate: a.zitate })
    return { key: `a${i + 1}`, titel: a.titel, text: a.text, wirkung: a.wirkung, frage: a.frage || a.titel }
  })

  const ausPdf = quelle.art === 'pdf'
  const seitentexte = ausPdf ? (antwort.seiten?.length ? antwort.seiten : ['Für dieses PDF liegt keine Abschrift vor.']) : [quelle.text || '']
  const teile = markiere(seitentexte, belege)

  const dokument = {
    id: `live-${++laufendeNr}`,
    titel: ausPdf ? 'Abschrift der KI' : 'E-Mail',
    art: ausPdf ? `von Claude aus dem PDF gelesen, ${seitentexte.length} ${seitentexte.length === 1 ? 'Seite' : 'Seiten'}` : 'Text des Eingangs',
    stil: 'abschrift',
    seiten: teile.map(t => [{ t: 'pt', teile: t, ort: ausPdf ? 'Abschrift' : 'Text des Eingangs' }])
  }

  return {
    id: `Live-${laufendeNr}`,
    beispiel: null,
    live: true,
    eingang: jetzt.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' }),
    uhrzeit: jetzt.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' }),
    kanal: ausPdf ? 'PDF' : 'E-Mail',
    form: 'von Claude live gelesen',
    produkt: layout.id,
    sparte: felder.sparte?.w || '',
    vorgangsart: antwort.vorgangsart,
    einordnung: antwort.einordnung,
    kunde: antwort.kunde || quelle.name || 'Eigener Eingang',
    objekte,
    pdfUrl: quelle.pdfUrl || null,
    mail: {
      vonName: quelle.absender || 'Eigener Eingang',
      von: quelle.absender || '',
      an: begriffe().postfach,
      betreff: quelle.betreff || quelle.name || 'Eigener Eingang',
      vorschau: (quelle.text || '').slice(0, 160),
      anhaenge: (quelle.anhaenge || []).map(n => ({ name: n, typ: 'Anhang', info: 'vom Absender beigefügt' }))
    },
    dokumente: [dokument],
    felder,
    betriebsarten,
    risikofragen,
    auffaelligkeiten,
    gesamteinschaetzung: antwort.gesamteinschaetzung || ''
  }
}

// ============================================================
// EML lesen (Kopfzeilen, Text, Anhänge)
// ============================================================

function dekodiereWort(str) {
  return str.replace(/=\?([^?]+)\?([BbQq])\?([^?]*)\?=/g, (_, zeichensatz, kodierung, text) => {
    try {
      let bytes
      if (kodierung.toUpperCase() === 'B') {
        const bin = atob(text)
        bytes = Uint8Array.from(bin, c => c.charCodeAt(0))
      } else {
        const roh = text.replace(/_/g, ' ')
        const feld = []
        for (let i = 0; i < roh.length; i++) {
          if (roh[i] === '=' && /^[0-9A-Fa-f]{2}$/.test(roh.slice(i + 1, i + 3))) { feld.push(parseInt(roh.slice(i + 1, i + 3), 16)); i += 2 }
          else feld.push(roh.charCodeAt(i) & 0xff)
        }
        bytes = new Uint8Array(feld)
      }
      return new TextDecoder(zeichensatz.toLowerCase()).decode(bytes)
    } catch { return text }
  })
}

function dekodiereRumpf(rumpf, kodierung, zeichensatz = 'utf-8') {
  const dekoder = (bytes) => { try { return new TextDecoder(zeichensatz).decode(bytes) } catch { return new TextDecoder('utf-8').decode(bytes) } }
  if (kodierung === 'quoted-printable') {
    const roh = rumpf.replace(/=\r?\n/g, '')
    const feld = []
    for (let i = 0; i < roh.length; i++) {
      if (roh[i] === '=' && /^[0-9A-Fa-f]{2}$/.test(roh.slice(i + 1, i + 3))) { feld.push(parseInt(roh.slice(i + 1, i + 3), 16)); i += 2 }
      else if (roh.charCodeAt(i) !== 0x0d) feld.push(roh.charCodeAt(i) & 0xff)
    }
    return dekoder(new Uint8Array(feld))
  }
  if (kodierung === 'base64') {
    try { return dekoder(Uint8Array.from(atob(rumpf.replace(/\s/g, '')), c => c.charCodeAt(0))) } catch { return rumpf }
  }
  return rumpf
}

function leseKopf(block) {
  const kopf = {}
  let aktuell = ''
  for (const zeile of block.replace(/\r\n/g, '\n').split('\n')) {
    if (/^\s/.test(zeile) && aktuell) kopf[aktuell] += ' ' + zeile.trim()
    else {
      const m = zeile.match(/^([A-Za-z-]+):\s*(.*)/)
      if (m) { aktuell = m[1].toLowerCase(); kopf[aktuell] = m[2].trim() }
    }
  }
  return kopf
}

function teileVon(rumpf, grenze) {
  const teile = []
  const stuecke = rumpf.split('--' + grenze)
  for (let i = 1; i < stuecke.length; i++) {
    if (stuecke[i].startsWith('--')) break
    teile.push(stuecke[i].replace(/^[\r\n]+/, ''))
  }
  return teile
}

function leseTeil(roh, ergebnis) {
  const trenn = roh.search(/\r?\n\r?\n/)
  const kopf = leseKopf(trenn >= 0 ? roh.slice(0, trenn) : '')
  const rumpf = trenn >= 0 ? roh.slice(trenn).replace(/^[\r\n]+/, '') : roh
  const typ = (kopf['content-type'] || 'text/plain').toLowerCase()
  const kodierung = (kopf['content-transfer-encoding'] || '').toLowerCase()
  const zeichensatz = typ.match(/charset="?([^";\s]+)"?/)?.[1] || 'utf-8'
  const grenze = (kopf['content-type'] || '').match(/boundary="?([^";\s]+)"?/i)?.[1]

  if (typ.includes('multipart/') && grenze) {
    for (const t of teileVon(rumpf, grenze)) leseTeil(t, ergebnis)
    return
  }
  const name = dekodiereWort(((kopf['content-disposition'] || '') + ' ' + (kopf['content-type'] || '')).match(/name\*?="?([^";\r\n]+)"?/i)?.[1]?.trim() || '')
  const anhang = (kopf['content-disposition'] || '').includes('attachment') || (name && !typ.startsWith('text/plain') && !typ.startsWith('text/html'))

  if (anhang) {
    ergebnis.anhaenge.push(name || 'Anhang')
    if (typ.startsWith('application/pdf') && kodierung === 'base64') {
      try { ergebnis.pdfs.push({ name, bytes: Uint8Array.from(atob(rumpf.replace(/\s/g, '')), c => c.charCodeAt(0)).buffer }) } catch { /* beschädigter Anhang */ }
    } else if (typ.startsWith('text/')) {
      ergebnis.anhangTexte.push({ name, text: dekodiereRumpf(rumpf, kodierung, zeichensatz) })
    }
    return
  }
  if (typ.startsWith('text/plain') && !ergebnis.text) ergebnis.text = dekodiereRumpf(rumpf, kodierung, zeichensatz)
  else if (typ.startsWith('text/html') && !ergebnis.html) ergebnis.html = dekodiereRumpf(rumpf, kodierung, zeichensatz)
}

/** Liest eine EML-Datei: Betreff, Absender, Text, Namen und Inhalte der Anhänge. */
export function leseEml(roh) {
  const trenn = roh.search(/\r?\n\r?\n/)
  const kopf = leseKopf(trenn >= 0 ? roh.slice(0, trenn) : roh)
  const ergebnis = { text: '', html: '', anhaenge: [], pdfs: [], anhangTexte: [] }
  leseTeil(roh, ergebnis)
  let text = ergebnis.text || ergebnis.html.replace(/<br\s*\/?>/gi, '\n').replace(/<\/p>/gi, '\n\n').replace(/<[^>]+>/g, '').replace(/&nbsp;/g, ' ')
  for (const a of ergebnis.anhangTexte) text += `\n\n--- Anhang ${a.name} ---\n${a.text}`
  return {
    betreff: dekodiereWort(kopf.subject || ''),
    absender: dekodiereWort(kopf.from || ''),
    text: text.replace(/\r\n/g, '\n').trim(),
    anhaenge: ergebnis.anhaenge,
    pdfs: ergebnis.pdfs
  }
}
