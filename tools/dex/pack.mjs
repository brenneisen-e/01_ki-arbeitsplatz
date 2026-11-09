#!/usr/bin/env node
// Baut DEX-Pakete: Build, single.html, dex-app.json und ZIP je App.
//
//   node tools/dex/pack.mjs                       alle Apps aus apps.mjs
//   node tools/dex/pack.mjs 22_vertriebsarbeitsplatz 05_Bestandsuebertragung
//   node tools/dex/pack.mjs --ohne-build …        vorhandenes dist/ verwenden
//
// Ergebnis je App:
//   tools/dex/.ausgabe/<id>/            entpackter Paketinhalt (dex-app.json, single.html, app/)
//   tools/dex/.ausgabe/<id>_<version>.zip
//   <id>/download/<id>.zip               veröffentlichte Fassung (nur bis 25 MiB, Grenze von Cloudflare Pages)
//   <id>/download/dex-app.json           Steckbrief daneben, liest der Download-Knopf
//   downloads/index.json                 Übersicht aller Pakete
//   tools/dex/stand.json                 Version und Inhalts-Prüfsumme je App
//
// Die Version zählt an der dritten Stelle hoch, sobald sich der Paketinhalt
// ändert (Prüfsumme über app/ und single.html). Unveränderte Pakete bleiben
// mit Version, Datum und ZIP unangetastet.

import { execFileSync, spawnSync } from 'node:child_process'
import { createHash } from 'node:crypto'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { APPS, appNach } from './apps.mjs'

const HIER = path.dirname(fileURLToPath(import.meta.url))
const WURZEL = path.resolve(HIER, '../..')
const AUSGABE = path.join(HIER, '.ausgabe')
const STAND_DATEI = path.join(HIER, 'stand.json')
const INDEX_DATEI = path.join(WURZEL, 'downloads', 'index.json')
const MAX_ZIP = 25 * 1024 * 1024 // Cloudflare Pages: höchstens 25 MiB je Datei
const MAX_SINGLE = 25 * 1024 * 1024
const KNOPF_SKRIPT_RE = /\s*<script[^>]*download-knopf\.js[^>]*><\/script>/g
const FLAG = '<script>window.__DEX_EINGEBETTET=true;</script>'

const argv = process.argv.slice(2)
const ohneBuild = argv.includes('--ohne-build')
const ids = argv.filter((a) => !a.startsWith('--'))
const auswahl = ids.length ? ids.map((id) => appNach(id) ?? fehler(`Unbekannte App „${id}“`)) : APPS

function fehler(text) { console.error(`\n✗ ${text}`); process.exit(1) }
function log(text) { console.log(text) }
function lies(datei) { return fs.readFileSync(datei, 'utf8') }
function liesJson(datei, sonst) { try { return JSON.parse(lies(datei)) } catch { return sonst } }
function schreibeJson(datei, daten) {
  fs.mkdirSync(path.dirname(datei), { recursive: true })
  fs.writeFileSync(datei, JSON.stringify(daten, null, 2) + '\n')
}
function git(...args) { return execFileSync('git', args, { cwd: WURZEL, encoding: 'utf8' }).trim() }

function repoName() {
  try {
    const url = git('remote', 'get-url', 'origin')
    const m = url.match(/github\.com[/:]([^/]+\/[^/.]+?)(?:\.git)?$/) || url.match(/\/git\/([^/]+\/[^/.]+?)(?:\.git)?$/)
    if (m) return m[1]
  } catch { /* kein Remote */ }
  return 'brenneisen-e/kiarbeitsplatz'
}

const MIME = {
  '.html': 'text/html', '.js': 'text/javascript', '.mjs': 'text/javascript', '.css': 'text/css',
  '.json': 'application/json', '.txt': 'text/plain', '.md': 'text/markdown', '.csv': 'text/csv',
  '.xml': 'application/xml', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg', '.gif': 'image/gif', '.webp': 'image/webp', '.avif': 'image/avif',
  '.ico': 'image/x-icon', '.woff': 'font/woff', '.woff2': 'font/woff2', '.ttf': 'font/ttf',
  '.otf': 'font/otf', '.pdf': 'application/pdf', '.mp4': 'video/mp4', '.webm': 'video/webm',
  '.mp3': 'audio/mpeg', '.wav': 'audio/wav', '.zip': 'application/zip',
  '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  '.pptx': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  '.eml': 'message/rfc822', '.wasm': 'application/wasm',
}
const mime = (datei) => MIME[path.extname(datei).toLowerCase()] ?? 'application/octet-stream'

function alleDateien(ordner, basis = ordner) {
  const out = []
  for (const e of fs.readdirSync(ordner, { withFileTypes: true })) {
    const p = path.join(ordner, e.name)
    if (e.isDirectory()) out.push(...alleDateien(p, basis))
    else if (e.isFile()) out.push(path.relative(basis, p).split(path.sep).join('/'))
  }
  return out.sort()
}

function pruefsumme(ordner, extra = []) {
  const h = createHash('sha256')
  for (const rel of alleDateien(ordner)) {
    h.update(rel + '\0')
    h.update(fs.readFileSync(path.join(ordner, rel)))
  }
  for (const datei of extra) if (fs.existsSync(datei)) h.update(fs.readFileSync(datei))
  return h.digest('hex')
}

function hochzaehlen(alt, mindest) {
  const teile = (v) => String(v ?? '0.0.0').split('.').map((n) => parseInt(n, 10) || 0)
  const [a1, a2, a3] = teile(alt)
  const [m1, m2, m3] = teile(mindest)
  if (m1 > a1 || (m1 === a1 && m2 > a2) || (m1 === a1 && m2 === a2 && m3 > a3 + 1)) return `${m1}.${m2}.${m3}`
  return `${a1}.${a2}.${a3 + 1}`
}

// Verbotenes im Paket: Geheimnisse, Quellcode, Abhängigkeiten
const VERBOTEN = [/(^|\/)\.env(\.|$)/, /(^|\/)node_modules\//, /\.(pem|key|p12|pfx)$/i, /(^|\/)\.dev\.vars$/, /\.map$/,
  /(^|\/)src\/.*\.(jsx|tsx|ts)$/, /(^|\/)(package(-lock)?\.json|vite\.config\.[jt]s|wrangler\.toml)$/]
function entferneVerbotenes(ordner) {
  for (const rel of alleDateien(ordner)) {
    if (VERBOTEN.some((re) => re.test(rel))) {
      fs.rmSync(path.join(ordner, rel))
      log(`    entfernt: ${rel}`)
    }
  }
}

// Tabelle der öffentlichen Dateien für single.html (alles außer HTML und den
// gebündelten assets/, die Vite ohnehin einbettet). Große Fotos werden für die
// Einzeldatei verkleinert (höchstens 1600 px breit, JPEG-Qualität 80); app/
// behält die Originale.
const MAX_BREITE = 1600
async function verkleinere(rel, puffer) {
  const ext = path.extname(rel).toLowerCase()
  if (!['.jpg', '.jpeg', '.png', '.webp'].includes(ext)) return puffer
  let sharp
  try { sharp = (await import('sharp')).default } catch { return puffer }
  try {
    const bild = sharp(puffer, { failOn: 'none' })
    const { width } = await bild.metadata()
    let pipe = width > MAX_BREITE ? bild.resize({ width: MAX_BREITE }) : bild
    if (ext === '.png') pipe = pipe.png({ compressionLevel: 9, palette: false })
    else if (ext === '.webp') pipe = pipe.webp({ quality: 80 })
    else pipe = pipe.jpeg({ quality: 80, mozjpeg: true })
    const neu = await pipe.toBuffer()
    return neu.length < puffer.length ? neu : puffer
  } catch {
    return puffer
  }
}

async function dateiTabelle(appOrdner, { ohneAssets }) {
  const tabelle = {}
  for (const rel of alleDateien(appOrdner)) {
    if (/\.html?$/i.test(rel)) continue
    if (ohneAssets && rel.startsWith('assets/')) continue
    const puffer = await verkleinere(rel, fs.readFileSync(path.join(appOrdner, rel)))
    tabelle[rel] = [mime(rel), puffer.toString('base64')]
  }
  return tabelle
}

const sicherImSkript = (text) => text.replace(/<\/(script)/gi, '<\\/$1').replace(/<!--/g, '<\\!--')
const reEsc = (t) => t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

// Verweise auf lokale Dateien, die nach dem Ersetzen nicht übrig sein dürfen:
// in Anführungszeichen, Backticks oder url( beginnend mit (./|/)<Ordner>/ bzw. (./|/)<Datei>.
function uebrigeVerweise(html, tabelle) {
  const ordner = [...new Set(Object.keys(tabelle).filter((k) => k.includes('/')).map((k) => k.split('/')[0]))]
  const dateien = Object.keys(tabelle).filter((k) => !k.includes('/'))
  const teile = [...ordner.map((o) => `${reEsc(o)}/[^"'\`)\\s]*`), ...dateien.map(reEsc)]
  if (!teile.length) return []
  const re = new RegExp(`(?:["'\`]|url\\(\\s*)(?:\\./|/)?(?:${teile.join('|')})`, 'g')
  return [...html.matchAll(re)].map((m) => m[0].replace(/^(?:["'\`]|url\(\s*)/, ''))
}

// Ersetzt jeden Verweis auf eine Datei der Tabelle (in HTML, CSS und JS,
// Schreibweisen x, ./x, /x, <ordner>/dist/x, auch URL-kodiert) fest durch ihre
// data:-URI. So braucht single.html keine Adresse mehr, auch nicht als blob:-URL.
function ersetzeVerweise(html, id, tabelle) {
  let ersetzt = 0
  const genutzt = new Set()
  const schluessel = Object.keys(tabelle).sort((a, b) => b.length - a.length)
  for (const k of schluessel) {
    const varianten = [...new Set([k, encodeURI(k), k.split('/').map(encodeURIComponent).join('/')])]
    const praefix = `(?:\\./|/|/?${reEsc(id)}/(?:dist/)?)?`
    const re = new RegExp(`((?:["'\`]|url\\(\\s*))${praefix}(?:${varianten.map(reEsc).join('|')})(?=["'\`)?#\\s])`, 'g')
    const daten = `data:${tabelle[k][0]};base64,${tabelle[k][1]}`
    html = html.replace(re, (ganz, vor) => { ersetzt++; genutzt.add(k); return vor + daten })
  }
  // Vorab-Ladehinweise auf eingebettete Dateien sind jetzt sinnlos
  html = html.replace(/<link\b[^>]*rel=["'](?:preload|prefetch)["'][^>]*href=["']data:[^>]*>\s*/gi, '')
  return { html, ersetzt, genutzt }
}

// Fügt der Einzeldatei die festen data:-URIs hinzu und für Pfade, die erst zur
// Laufzeit entstehen, Dateitabelle und Shim (nur Dateien ohne festen Verweis).
function ergaenzeEinzeldatei(html, id, tabelle) {
  const r = ersetzeVerweise(html, id, tabelle)
  html = r.html
  // Rückfall-Tabelle für den Shim: nur Dateien ohne festen Verweis, deren Name
  // im Code vorkommt (Pfad wird zur Laufzeit zusammengesetzt); ungenutzte entfallen.
  const rest = Object.fromEntries(Object.entries(tabelle).filter(([k]) =>
    !r.genutzt.has(k) && html.includes(k.split('/').pop())))
  const uebrig = uebrigeVerweise(html.replace(/<script data-dex-shim>[\s\S]*?<\/script>/g, ''), tabelle)
  const shim = lies(path.join(HIER, 'single-shim.js'))
  const kopf = `${FLAG}\n<script data-dex-shim>window.__DEX_ID=${JSON.stringify(id)};window.__DEX_DATEIEN=${sicherImSkript(JSON.stringify(rest))};</script>\n<script data-dex-shim>${sicherImSkript(shim)}</script>\n`
  // ganz an den Anfang von <head>, vor jedes App-Skript
  html = /<head[^>]*>/i.test(html) ? html.replace(/<head([^>]*)>/i, (m) => `${m}\n${kopf}`) : kopf + html
  return { html, ersetzt: r.ersetzt, dateien: r.genutzt.size, uebrig }
}

function setzeFlag(html) {
  html = html.replace(KNOPF_SKRIPT_RE, '')
  if (html.includes(FLAG)) return html
  return html.replace(/<head([^>]*)>/i, (m) => `${m}\n${FLAG}`)
}

function npm(cwd, args, env = {}) {
  const r = spawnSync('npm', args, { cwd, stdio: 'inherit', env: { ...process.env, ...env } })
  if (r.status !== 0) fehler(`npm ${args.join(' ')} in ${path.relative(WURZEL, cwd)} fehlgeschlagen`)
}

// ── Vite-Apps ────────────────────────────────────────────────────────────────
async function packeVite(app, ziel) {
  const appDir = path.join(WURZEL, app.ordner)
  if (!fs.existsSync(path.join(appDir, 'node_modules'))) npm(appDir, ['install', '--no-audit', '--no-fund'])
  if (!ohneBuild) {
    log('  · Build (dist/)')
    npm(appDir, ['run', 'build', '--silent'])
  }
  const dist = path.join(appDir, 'dist')
  if (!fs.existsSync(path.join(dist, 'index.html'))) fehler(`${app.id}: dist/index.html fehlt`)

  // app/ = dist, Knopf aus, Merker an
  const appZiel = path.join(ziel, 'app')
  fs.cpSync(dist, appZiel, { recursive: true })
  for (const rel of alleDateien(appZiel).filter((r) => r.endsWith('.html'))) {
    const p = path.join(appZiel, rel)
    fs.writeFileSync(p, setzeFlag(lies(p)))
  }
  entferneVerbotenes(appZiel)

  if (app.single === false) return { single: false }
  log('  · Einzeldatei (single.html)')
  const tmp = path.join(AUSGABE, `.single-${app.id}`)
  fs.rmSync(tmp, { recursive: true, force: true })
  const r = spawnSync('npx', ['vite', 'build', '--logLevel', 'warn'], {
    cwd: appDir, stdio: 'inherit',
    env: { ...process.env, DEX_SINGLE: '1', DEX_AUSGABE: tmp },
  })
  if (r.status !== 0) fehler(`${app.id}: Einzeldatei-Build fehlgeschlagen`)
  const reste = alleDateien(tmp).filter((r) => r !== 'index.html')
  if (reste.length) log(`    Hinweis: nicht eingebettet: ${reste.join(', ')}`)
  const html = lies(path.join(tmp, 'index.html'))
  const erg = ergaenzeEinzeldatei(html, app.ordner, await dateiTabelle(appZiel, { ohneAssets: true }))
  fs.rmSync(tmp, { recursive: true, force: true })
  return schreibeEinzeldatei(ziel, erg)
}

function schreibeEinzeldatei(ziel, { html, ersetzt, dateien, uebrig }) {
  const groesse = Buffer.byteLength(html)
  log(`    ${ersetzt} Verweise auf ${dateien} lokale Dateien durch data:-URIs ersetzt, ${(groesse / 1048576).toFixed(2)} MB`)
  if (uebrig.length) log(`    ACHTUNG: ${uebrig.length} Verweise auf lokale Dateien übrig: ${[...new Set(uebrig)].slice(0, 5).join(', ')}`)
  const einzeln = { ersetzt, uebrig: uebrig.length, singleGroesse: groesse }
  if (groesse > MAX_SINGLE) {
    log(`    single.html wäre ${(groesse / 1048576).toFixed(1)} MB groß → "single": false`)
    return { single: false, ...einzeln }
  }
  fs.writeFileSync(path.join(ziel, 'single.html'), html)
  return { single: true, ...einzeln }
}

// ── Reine HTML-Apps ──────────────────────────────────────────────────────────
async function cdnInhalt(url) {
  const cache = path.join(AUSGABE, '.cdn', createHash('sha1').update(url).digest('hex'))
  if (fs.existsSync(cache)) return lies(cache)
  try {
    const res = await fetch(url)
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const text = await res.text()
    fs.mkdirSync(path.dirname(cache), { recursive: true })
    fs.writeFileSync(cache, text)
    return text
  } catch (e) {
    log(`    CDN nicht erreichbar (${url}): bleibt extern`)
    return null
  }
}

async function packeHtml(app, ziel) {
  const appDir = path.join(WURZEL, app.ordner)
  const cfg = app.html
  let html = lies(path.join(appDir, 'index.html'))
  html = html.replace(KNOPF_SKRIPT_RE, '')

  // Stylesheets der Plattform einbetten
  html = html.replace(/<link\s+rel="stylesheet"\s+href="([^"]+)"\s*\/?>/g, (ganz, href) => {
    if (/^https?:/.test(href)) return ganz
    const datei = path.resolve(appDir, href.split('?')[0])
    return `<style>/* ${path.relative(WURZEL, datei)} */\n${lies(datei)}</style>`
  })
  // CDN-Skripte einbetten, damit das Paket ohne Netz läuft
  for (const m of [...html.matchAll(/<script src="(https:[^"]+)"><\/script>/g)]) {
    const inhalt = await cdnInhalt(m[1])
    if (inhalt) html = html.replace(m[0], () => `<script>/* ${m[1]} */\n${sicherImSkript(inhalt)}</script>`)
  }
  // Partial direkt in den Container, ohne seine eigenen <link>/<script>-Tags
  const partial = lies(path.join(WURZEL, cfg.partial))
    .replace(/<link[^>]*rel="stylesheet"[^>]*>/g, '')
    .replace(/<script[^>]*src="[^"]*"[^>]*><\/script>/g, '')
  const containerRe = new RegExp(`(<div id="${cfg.container}"[^>]*>)[\\s\\S]*?(</div>)`)
  if (!containerRe.test(html)) fehler(`${app.id}: Container #${cfg.container} nicht gefunden`)
  html = html.replace(containerRe, (m, auf, zu) => `${auf}\n${partial}\n${zu}`)
  // Nachlade-Skript (fetch des Partials) durch die eingebetteten Skripte ersetzen
  const laderRe = /<script>\s*fetch\('\.\.\/partials\/[\s\S]*?<\/script>/
  if (!laderRe.test(html)) fehler(`${app.id}: Nachlade-Skript nicht gefunden`)
  const teile = []
  for (const s of cfg.skripte ?? []) teile.push(`<script>/* ${s} */\n${sicherImSkript(lies(path.join(WURZEL, s)))}</script>`)
  if (cfg.init) teile.push(`<script>${cfg.init}</script>`)
  for (const s of cfg.module ?? []) {
    let js = lies(path.join(WURZEL, s))
    // eigene Dateien relativ ansprechen (Paket liegt nicht an der Wurzel)
    for (const ziel of Object.keys(cfg.dateien ?? {})) js = js.split(`'/${ziel}'`).join(`'${ziel}'`)
    teile.push(`<script type="module">/* ${s} */\n${sicherImSkript(js)}</script>`)
  }
  html = html.replace(laderRe, () => teile.join('\n'))

  const appZiel = path.join(ziel, 'app')
  fs.mkdirSync(appZiel, { recursive: true })
  for (const [zielRel, quelle] of Object.entries(cfg.dateien ?? {})) {
    fs.mkdirSync(path.dirname(path.join(appZiel, zielRel)), { recursive: true })
    fs.copyFileSync(path.join(WURZEL, quelle), path.join(appZiel, zielRel))
  }
  for (const ordner of cfg.ordner ?? []) {
    fs.cpSync(path.join(WURZEL, ordner), path.join(appZiel, path.basename(ordner)), { recursive: true })
  }
  fs.writeFileSync(path.join(appZiel, 'index.html'), setzeFlag(html))
  entferneVerbotenes(appZiel)
  if (app.single === false) return { single: false }
  log('  · Einzeldatei (single.html)')
  return schreibeEinzeldatei(ziel, ergaenzeEinzeldatei(html, app.ordner, await dateiTabelle(appZiel, { ohneAssets: false })))
}

// ── Ablauf ───────────────────────────────────────────────────────────────────
const stand = liesJson(STAND_DATEI, {})
const repo = repoName()
const commit = git('rev-parse', 'HEAD')
const ergebnisse = []

fs.mkdirSync(AUSGABE, { recursive: true })
for (const app of auswahl) {
  log(`\n▸ ${app.id}`)
  const ziel = path.join(AUSGABE, app.id)
  fs.rmSync(ziel, { recursive: true, force: true })
  fs.mkdirSync(ziel, { recursive: true })

  const einzel = app.art === 'html' ? await packeHtml(app, ziel) : await packeVite(app, ziel)
  const { single } = einzel

  const summe = pruefsumme(path.join(ziel, 'app'), [path.join(ziel, 'single.html')])
  const alt = stand[app.id]
  const unveraendert = alt && alt.pruefsumme === summe && alt.steckbrief
  const version = unveraendert ? alt.steckbrief.version
    : alt?.steckbrief ? hochzaehlen(alt.steckbrief.version, app.version) : app.version

  const steckbrief = unveraendert ? alt.steckbrief : {
    format: 'dex-app/1',
    id: app.id,
    titel: app.titel,
    beschreibung: app.beschreibung,
    version,
    gebaut: new Date().toISOString().replace(/\.\d{3}Z$/, 'Z'),
    quelle: { repo, commit },
    start: app.start,
    single,
    benoetigtInternet: app.benoetigtInternet,
    api: app.api,
  }
  schreibeJson(path.join(ziel, 'dex-app.json'), steckbrief)

  const zipName = `${app.id}_${version}.zip`
  const zipLokal = path.join(AUSGABE, zipName)
  const downloadOrdner = path.join(WURZEL, app.ordner, 'download')
  const zipOeffentlich = path.join(downloadOrdner, `${app.id}.zip`)

  if (!unveraendert || !fs.existsSync(zipLokal)) {
    fs.rmSync(zipLokal, { force: true })
    const inhalt = ['dex-app.json', 'app', ...(single ? ['single.html'] : [])]
    execFileSync('zip', ['-r', '-X', '-q', '-9', zipLokal, ...inhalt, '-x', '*.DS_Store'], { cwd: ziel })
  }
  const groesse = fs.statSync(zipLokal).size
  const veroeffentlicht = groesse <= MAX_ZIP
  if (veroeffentlicht) {
    if (!unveraendert || !fs.existsSync(zipOeffentlich)) {
      fs.mkdirSync(downloadOrdner, { recursive: true })
      fs.copyFileSync(zipLokal, zipOeffentlich)
      schreibeJson(path.join(downloadOrdner, 'dex-app.json'), steckbrief)
    }
  } else {
    fs.rmSync(downloadOrdner, { recursive: true, force: true })
    log(`    ZIP ${(groesse / 1048576).toFixed(1)} MB > 25 MiB: nicht veröffentlicht (Grenze von Cloudflare Pages), liegt unter ${path.relative(WURZEL, zipLokal)}`)
  }

  stand[app.id] = { ordner: app.ordner, pruefsumme: summe, groesse, veroeffentlicht, steckbrief }
  ergebnisse.push({ app: app.id, version, groesse, single, api: app.api, veroeffentlicht, unveraendert: !!unveraendert, ersetzt: einzel.ersetzt, uebrig: einzel.uebrig, singleGroesse: einzel.singleGroesse })
  log(`  ✓ ${zipName} (${(groesse / 1048576).toFixed(2)} MB)${unveraendert ? ' — unverändert' : ''}`)
}

// Stand und Übersicht schreiben (alle Apps, nicht nur die gepackten)
const sortiert = Object.fromEntries(Object.entries(stand).sort(([a], [b]) => a.localeCompare(b)))
schreibeJson(STAND_DATEI, sortiert)
schreibeJson(INDEX_DATEI, {
  format: 'dex-index/1',
  erzeugt: new Date().toISOString().replace(/\.\d{3}Z$/, 'Z'),
  apps: Object.values(sortiert).map((s) => ({
    ...s.steckbrief,
    zip: s.veroeffentlicht ? `/${s.ordner}/download/${s.steckbrief.id}.zip` : null,
    zipName: `${s.steckbrief.id}_${s.steckbrief.version}.zip`,
    groesse: s.groesse,
    ...(s.veroeffentlicht ? {} : { hinweis: 'ZIP größer als 25 MiB (Grenze von Cloudflare Pages): nicht veröffentlicht, lokal mit node tools/dex/pack.mjs bauen.' }),
  })),
})

const mb = (b) => (b == null ? '–' : (b / 1048576).toFixed(2) + ' MB')
log('\nApp                          Version   ZIP        single.html  ersetzt  übrig  im Web  fehlende APIs')
for (const e of ergebnisse) {
  log(`${e.app.padEnd(29)}${e.version.padEnd(10)}${mb(e.groesse).padEnd(11)}${(e.single ? mb(e.singleGroesse) : 'nein').padEnd(13)}${String(e.ersetzt ?? '–').padEnd(9)}${String(e.uebrig ?? '–').padEnd(7)}${(e.veroeffentlicht ? 'ja' : 'nein').padEnd(8)}${e.api.join(', ') || '–'}`)
}
