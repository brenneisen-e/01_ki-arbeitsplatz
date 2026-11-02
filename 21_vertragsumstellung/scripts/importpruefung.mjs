// ===========================================================================
// Importprüfung
//
// Rollup prüft in JSX keine freien Bezeichner: ein Bauteil, das importiert
// werden müsste und nicht importiert ist, baut fehlerfrei durch und wirft
// erst zur Laufzeit. Zweimal ist genau das passiert — einmal mit
// `ReferenceLine` (weiße Seite im Expertenraum), einmal mit
// `euroKompaktDelta` (Absturz erst beim Überfahren eines Tornado-Balkens,
// also an einer Stelle, die kein Klickpfad erreicht).
//
// Dieser Test liest jede Quelldatei, sammelt die benannten Importe und
// vergleicht sie mit den Bezeichnern, die im Rumpf tatsächlich aufgerufen
// oder als JSX-Element gesetzt werden. Er braucht keinen Browser und
// findet auch, was nie angeklickt wird.
//
// Aufruf: node scripts/importpruefung.mjs
// ===========================================================================

import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join, extname } from 'node:path'

const WURZEL = 'src'

function dateien(verzeichnis) {
  return readdirSync(verzeichnis).flatMap(name => {
    const pfad = join(verzeichnis, name)
    if (statSync(pfad).isDirectory()) return dateien(pfad)
    return ['.js', '.jsx'].includes(extname(pfad)) ? [pfad] : []
  })
}

/** Bezeichner, die ohne Import verfügbar sind. */
const EINGEBAUT = new Set([
  'Math', 'JSON', 'Object', 'Array', 'String', 'Number', 'Boolean', 'Date', 'Map', 'Set',
  'Promise', 'Error', 'RegExp', 'Intl', 'console', 'window', 'document', 'navigator',
  'localStorage', 'sessionStorage', 'requestAnimationFrame', 'cancelAnimationFrame',
  'setTimeout', 'clearTimeout', 'setInterval', 'clearInterval', 'fetch', 'URL', 'Blob',
  'FileReader', 'Uint8Array', 'ArrayBuffer', 'TextEncoder', 'TextDecoder', 'structuredClone',
  'parseInt', 'parseFloat', 'isNaN', 'isFinite', 'Infinity', 'NaN', 'undefined', 'globalThis',
  'process', 'Symbol', 'Proxy', 'Reflect', 'WeakMap', 'WeakSet', 'BigInt', 'Function',
  'MutationObserver', 'ResizeObserver', 'IntersectionObserver', 'AbortController', 'Event',
  'CustomEvent', 'NodeFilter', 'getComputedStyle', 'matchMedia', 'crypto', 'performance',
])

let treffer = 0

for (const pfad of dateien(WURZEL)) {
  const quelle = readFileSync(pfad, 'utf8')

  // Was die Datei kennt: Importe, eigene Deklarationen, Parameter zählen wir
  // nicht mit — dafür beschränken wir die Suche unten auf Großbuchstaben-
  // Bezeichner (Bauteile) und auf bekannte Formatierer.
  const bekannt = new Set(EINGEBAUT)
  for (const m of quelle.matchAll(/import\s+(?:(\w+)\s*,\s*)?\{([^}]*)\}\s+from/g)) {
    if (m[1]) bekannt.add(m[1])
    for (const teil of m[2].split(',')) {
      const name = teil.split(' as ').pop().trim()
      if (name) bekannt.add(name)
    }
  }
  for (const m of quelle.matchAll(/import\s+(\w+)\s+from/g)) bekannt.add(m[1])
  for (const m of quelle.matchAll(/^(?:export\s+)?(?:const|let|var|function|class)\s+(\w+)/gm)) bekannt.add(m[1])
  // Destrukturierung auf oberster Ebene, z. B. const { a, b } = ...
  for (const m of quelle.matchAll(/^(?:export\s+)?const\s*\{([^}]*)\}\s*=/gm)) {
    for (const teil of m[1].split(',')) {
      const name = teil.split(':').pop().split('=')[0].trim()
      if (name) bekannt.add(name)
    }
  }
  // Umbenennungen in Parameterlisten, z. B. function Btn({ ikone: Ikone }).
  // Ohne diesen Durchgang meldet die Prüfung jedes so hereingereichte
  // Bauteil als fehlenden Import.
  const parameterlisten = [
    ...quelle.matchAll(/function\s+\w*\s*\(([\s\S]*?)\)\s*\{/g),
    ...quelle.matchAll(/\(([\s\S]{0,400}?)\)\s*=>/g),
  ]
  for (const m of parameterlisten) {
    for (const um of m[1].matchAll(/[\w'"]+\s*:\s*(\w+)/g)) bekannt.add(um[1])
  }

  const fehlend = new Set()

  // JSX-Elemente mit Großbuchstaben sind immer Bauteile und immer importiert
  // oder lokal deklariert.
  for (const m of quelle.matchAll(/<([A-Z]\w*)[\s/>]/g)) {
    const name = m[1].split('.')[0]
    if (!bekannt.has(name)) fehlend.add(name)
  }
  // Aufrufe von Formatierern und Hilfsfunktionen aus lib/
  for (const m of quelle.matchAll(/\b(euro|euroKompakt|euroDelta|euroKompaktDelta|achseEuro|prozent|prozentDelta|promille|zahl|datum|datumLang|monatJahr|wertungsjahr|deltaTon)\s*\(/g)) {
    if (!bekannt.has(m[1])) fehlend.add(m[1])
  }

  if (fehlend.size) {
    treffer += fehlend.size
    console.log(`${pfad}`)
    for (const n of [...fehlend].sort()) console.log(`    fehlender Import: ${n}`)
  }
}

console.log(treffer === 0
  ? 'Importprüfung bestanden.'
  : `Importprüfung FEHLGESCHLAGEN — ${treffer} Bezeichner ohne Import.`)
process.exit(treffer === 0 ? 0 : 1)
