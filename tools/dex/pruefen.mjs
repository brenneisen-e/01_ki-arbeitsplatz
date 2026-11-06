#!/usr/bin/env node
// Prüft die DEX-Pakete aller Apps (oder der genannten):
//   1. ZIP entpacken, Aufbau und dex-app.json gegen das Format dex-app/1 prüfen,
//      nichts Verbotenes im Paket (.env, Schlüssel, node_modules, Quellcode).
//   2. single.html per file:// im Browser öffnen → App rendert, keine Skriptfehler.
//   3. app/ mit `npx serve app` starten, Startadresse aus "start" öffnen →
//      App rendert, keine 404 auf eigene Dateien.
//   4. Veröffentlichte Fassung (<id>/dist/ über die Repo-Wurzel): der
//      Download-Knopf erscheint, sein ZIP ist erreichbar; mit ?dex=1 nicht.
//
//   node tools/dex/pruefen.mjs [ids…] [--ohne-browser]
//
// Fehlende Server-Funktionen (/api/…) und externe Dienste (Logos, Schriften,
// Karten) gelten nicht als Fehler, sie werden als Hinweis gezählt.

import { spawn, execFileSync } from 'node:child_process'
import fs from 'node:fs'
import net from 'node:net'
import os from 'node:os'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { createRequire } from 'node:module'
import { APPS, appNach } from './apps.mjs'

const HIER = path.dirname(fileURLToPath(import.meta.url))
const WURZEL = path.resolve(HIER, '../..')
const STAND = JSON.parse(fs.readFileSync(path.join(HIER, 'stand.json'), 'utf8'))
const argv = process.argv.slice(2)
const ohneBrowser = argv.includes('--ohne-browser')
const ids = argv.filter((a) => !a.startsWith('--'))
const auswahl = ids.length ? ids.map((id) => appNach(id) ?? (console.error(`Unbekannt: ${id}`), process.exit(1))) : APPS

const SCHLUESSEL = ['format', 'id', 'titel', 'beschreibung', 'version', 'gebaut', 'quelle', 'start', 'single', 'benoetigtInternet', 'api']
function pruefeSteckbrief(s, appId) {
  const f = []
  if (!s || typeof s !== 'object') return ['dex-app.json ist kein Objekt']
  for (const k of SCHLUESSEL) if (!(k in s)) f.push(`Feld „${k}“ fehlt`)
  for (const k of Object.keys(s)) if (!SCHLUESSEL.includes(k)) f.push(`unbekanntes Feld „${k}“`)
  if (s.format !== 'dex-app/1') f.push('format ≠ "dex-app/1"')
  if (typeof s.id !== 'string' || !/^[a-z0-9_-]+$/.test(s.id)) f.push('id: nur a-z 0-9 _ -')
  if (s.id !== appId) f.push(`id „${s.id}“ ≠ erwartet „${appId}“`)
  if (typeof s.titel !== 'string' || !s.titel.trim()) f.push('titel leer')
  if (typeof s.beschreibung !== 'string' || s.beschreibung.length < 20) f.push('beschreibung zu kurz')
  else if ((s.beschreibung.match(/[.!?](\s|$)/g) || []).length > 2) f.push('beschreibung: mehr als zwei Sätze')
  if (typeof s.version !== 'string' || !/^\d+\.\d+\.\d+$/.test(s.version)) f.push('version nicht x.y.z')
  if (typeof s.gebaut !== 'string' || !/^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\dZ$/.test(s.gebaut) || isNaN(Date.parse(s.gebaut))) f.push('gebaut nicht ISO-UTC (YYYY-MM-DDTHH:MM:SSZ)')
  if (!s.quelle || typeof s.quelle.repo !== 'string' || !/^[^/]+\/[^/]+$/.test(s.quelle.repo)) f.push('quelle.repo nicht owner/repo')
  if (!s.quelle || typeof s.quelle.commit !== 'string' || !/^[0-9a-f]{40}$/.test(s.quelle.commit)) f.push('quelle.commit kein SHA')
  if (typeof s.start !== 'string' || s.start.startsWith('/') || /^[a-z]+:/i.test(s.start)) f.push('start nicht relativ')
  if (typeof s.single !== 'boolean') f.push('single nicht boolean')
  if (typeof s.benoetigtInternet !== 'boolean') f.push('benoetigtInternet nicht boolean')
  if (!Array.isArray(s.api) || s.api.some((a) => typeof a !== 'string' || !a.startsWith('/'))) f.push('api keine Liste von Pfaden')
  return f
}

const VERBOTEN = [/(^|\/)\.env(\.|$)/, /(^|\/)node_modules\//, /\.(pem|key|p12|pfx)$/i, /(^|\/)\.dev\.vars$/,
  /(^|\/)src\/.*\.(jsx|tsx|ts)$/, /(^|\/)(package(-lock)?\.json|vite\.config\.[jt]s|wrangler\.toml)$/]

function freierPort() {
  return new Promise((ok) => {
    const s = net.createServer()
    s.listen(0, () => { const p = s.address().port; s.close(() => ok(p)) })
  })
}
async function warteAufPort(port, ms = 60000) {
  const ende = Date.now() + ms
  while (Date.now() < ende) {
    const offen = await new Promise((ok) => {
      const c = net.connect(port, '127.0.0.1', () => { c.end(); ok(true) })
      c.on('error', () => ok(false))
    })
    if (offen) return
    await new Promise((r) => setTimeout(r, 250))
  }
  throw new Error(`Server auf Port ${port} antwortet nicht`)
}
async function starteServe(ordner) {
  const port = await freierPort()
  const kind = spawn('npx', ['--yes', 'serve', '-n', '-L', '-l', String(port), ordner], { stdio: ['ignore', 'ignore', 'pipe'] })
  let err = ''
  kind.stderr.on('data', (d) => { err += d })
  try { await warteAufPort(port) } catch (e) { kind.kill(); throw new Error(`${e.message}\n${err}`) }
  return { port, stopp: () => kind.kill() }
}

let playwright
function ladePlaywright() {
  if (playwright) return playwright
  try { playwright = createRequire(import.meta.url)('playwright') } catch {
    playwright = createRequire(path.join(os.homedir(), 'x.js'))('playwright')
  }
  return playwright
}

const istExtern = (url, basis) => !url.startsWith(basis) && !url.startsWith('data:') && !url.startsWith('blob:')
const istApi = (url) => /\/api\//.test(url)

// Öffnet eine Seite und sammelt Fehler; liefert {fehler[], hinweise[], text}
async function besuche(browser, url, { basis, erwarteKnopf = null }) {
  const seite = await browser.newPage({ viewport: { width: 1440, height: 900 } })
  const fehler = []
  const hinweise = []
  seite.on('pageerror', (e) => fehler.push(`Skriptfehler: ${String(e.message || e).slice(0, 200)}`))
  seite.on('console', (m) => {
    if (m.type() !== 'error') return
    const t = m.text()
    const ort = m.location()?.url || ''
    if (/Failed to load resource/.test(t) && ort && (istExtern(ort, basis) || istApi(ort))) return // als Antwort gezählt
    if (/net::ERR_|ERR_TUNNEL|ERR_CERT|ERR_NAME|ERR_PROXY|blocked:|CORS|Access-Control/i.test(t) || istExtern(ort, basis)) {
      hinweise.push(`extern: ${t.slice(0, 140)}`)
      return
    }
    fehler.push(`Konsole: ${t.slice(0, 200)}`)
  })
  seite.on('response', (r) => {
    const u = r.url()
    if (r.status() < 400) return
    if (istApi(u)) hinweise.push(`API fehlt: ${new URL(u).pathname} (${r.status()})`)
    else if (istExtern(u, basis)) hinweise.push(`extern ${r.status()}: ${u.slice(0, 100)}`)
    else fehler.push(`HTTP ${r.status()}: ${u.replace(basis, '')}`)
  })
  seite.on('requestfailed', (r) => {
    const u = r.url()
    if (istExtern(u, basis) || istApi(u)) return
    fehler.push(`nicht geladen: ${u.replace(basis, '').slice(0, 120)} (${r.failure()?.errorText})`)
  })
  try {
    await seite.goto(url, { waitUntil: 'load', timeout: 60000 })
  } catch (e) {
    fehler.push(`Laden: ${e.message.split('\n')[0]}`)
  }
  await seite.waitForTimeout(3500)
  const text = await seite.evaluate(() => (document.body?.innerText || '').trim()).catch(() => '')
  const elemente = await seite.evaluate(() => document.body?.querySelectorAll('*').length || 0).catch(() => 0)
  if (text.length < 40 || elemente < 15) fehler.push(`Seite leer (Text ${text.length} Zeichen, ${elemente} Elemente)`)
  const knopf = await seite.evaluate(() => {
    const h = document.querySelector('[data-dex-download]')
    const a = h?.shadowRoot?.querySelector('a')
    if (!a) return null
    const r = a.getBoundingClientRect()
    return { href: a.href, download: a.getAttribute('download'), tip: h.shadowRoot.querySelector('.tip')?.textContent, text: a.textContent, rechts: Math.round(innerWidth - r.right), oben: Math.round(r.top) }
  }).catch(() => null)
  if (erwarteKnopf === false && knopf) fehler.push('Download-Knopf sichtbar, obwohl eingebettet')
  if (erwarteKnopf === true && !knopf) fehler.push('Download-Knopf fehlt')
  await seite.close()
  return { fehler, hinweise: [...new Set(hinweise)], knopf, textLaenge: text.length }
}

// ── Ablauf ───────────────────────────────────────────────────────────────────
const tmpWurzel = fs.mkdtempSync(path.join(os.tmpdir(), 'dex-pruefen-'))
const zeilen = []
let browser
let repoServer
let gesamtFehler = 0

try {
  if (!ohneBrowser) {
    browser = await ladePlaywright().chromium.launch()
    repoServer = await starteServe(WURZEL)
  }
  for (const app of auswahl) {
    const st = STAND[app.id]
    const fehler = []
    const hinweise = []
    console.log(`\n▸ ${app.id}`)
    if (!st) { console.log('  ✗ nicht gepackt (tools/dex/stand.json)'); gesamtFehler++; zeilen.push({ app: app.id, ok: false }); continue }
    const zipName = `${app.id}_${st.steckbrief.version}.zip`
    const zip = st.veroeffentlicht ? path.join(WURZEL, app.ordner, 'download', `${app.id}.zip`) : path.join(HIER, '.ausgabe', zipName)
    if (!fs.existsSync(zip)) { fehler.push(`ZIP fehlt: ${path.relative(WURZEL, zip)}`) }
    const ziel = path.join(tmpWurzel, app.id)
    let s = null
    if (fs.existsSync(zip)) {
      fs.mkdirSync(ziel, { recursive: true })
      execFileSync('unzip', ['-q', zip, '-d', ziel])
      const liste = execFileSync('unzip', ['-Z1', zip], { encoding: 'utf8' }).split('\n').filter(Boolean)
      for (const e of liste) {
        if (e.includes('..') || e.startsWith('/')) fehler.push(`unsicherer Pfad im ZIP: ${e}`)
        if (VERBOTEN.some((re) => re.test(e))) fehler.push(`verboten im ZIP: ${e}`)
      }
      if (!liste.includes('dex-app.json')) fehler.push('dex-app.json fehlt im Wurzelverzeichnis')
      if (!liste.includes('app/index.html')) fehler.push('app/index.html fehlt')
      try { s = JSON.parse(fs.readFileSync(path.join(ziel, 'dex-app.json'), 'utf8')) } catch { s = null }
      fehler.push(...pruefeSteckbrief(s, app.id).map((t) => `dex-app.json: ${t}`))
      if (s) {
        if (s.single && !liste.includes('single.html')) fehler.push('single: true, aber single.html fehlt')
        if (!s.single && liste.includes('single.html')) fehler.push('single: false, aber single.html liegt bei')
        const startDatei = s.start.split(/[?#]/)[0]
        if (!liste.includes(`app/${startDatei}`)) fehler.push(`Startdatei app/${startDatei} fehlt`)
        if (st.veroeffentlicht) {
          const pub = JSON.parse(fs.readFileSync(path.join(WURZEL, app.ordner, 'download', 'dex-app.json'), 'utf8'))
          if (JSON.stringify(pub) !== JSON.stringify(s)) fehler.push('download/dex-app.json weicht vom ZIP ab')
        }
      }
      // Absolute Pfade auf eigene Dateien in den HTML-Seiten
      for (const e of liste.filter((x) => x.endsWith('.html'))) {
        const html = fs.readFileSync(path.join(ziel, e), 'utf8')
        const abs = [...html.matchAll(/\s(?:src|href)=["'](\/[^/"'][^"']*)["']/g)].map((m) => m[1])
        if (abs.length) fehler.push(`${e}: absolute Pfade ${[...new Set(abs)].slice(0, 3).join(', ')}`)
      }
    }

    if (browser && s) {
      if (s.single) {
        const url = pathToFileURL(path.join(ziel, 'single.html')).href + (s.start.includes('#') ? s.start.slice(s.start.indexOf('#')) : '')
        const r = await besuche(browser, url, { basis: pathToFileURL(ziel).href, erwarteKnopf: false })
        fehler.push(...r.fehler.map((t) => `single.html: ${t}`))
        hinweise.push(...r.hinweise.map((t) => `single.html: ${t}`))
        console.log(`  single.html (file://): ${r.fehler.length ? '✗' : '✓'} ${r.textLaenge} Zeichen Text`)
      }
      const srv = await starteServe(path.join(ziel, 'app'))
      try {
        const basis = `http://localhost:${srv.port}/`
        const r = await besuche(browser, basis + s.start, { basis, erwarteKnopf: false })
        fehler.push(...r.fehler.map((t) => `app/: ${t}`))
        hinweise.push(...r.hinweise.map((t) => `app/: ${t}`))
        console.log(`  app/ (npx serve): ${r.fehler.length ? '✗' : '✓'} ${r.textLaenge} Zeichen Text`)
      } finally { srv.stopp() }

      // Veröffentlichte Fassung mit Knopf
      const seitePfad = app.art === 'html' ? `${app.ordner}/` : `${app.ordner}/dist/`
      const basis = `http://localhost:${repoServer.port}/`
      if (st.veroeffentlicht) {
        const r = await besuche(browser, basis + seitePfad, { basis, erwarteKnopf: true })
        const knopfFehler = r.fehler.filter((t) => /Knopf/.test(t))
        fehler.push(...knopfFehler.map((t) => `Web: ${t}`))
        if (r.knopf) {
          const zipAntwort = await fetch(r.knopf.href)
          if (!zipAntwort.ok) fehler.push(`Web: Knopf-ZIP ${zipAntwort.status}`)
          if (r.knopf.download !== zipName) fehler.push(`Web: Dateiname ${r.knopf.download} ≠ ${zipName}`)
          if (!/Version \d+\.\d+\.\d+ · Stand \d\d\.\d\d\.\d{4}/.test(r.knopf.tip || '')) fehler.push(`Web: Tooltip „${r.knopf.tip}“`)
          console.log(`  Web-Knopf: ✓ „${r.knopf.text}“, ${r.knopf.tip}, ${r.knopf.rechts}px rechts`)
        }
        const r2 = await besuche(browser, basis + seitePfad + '?dex=1', { basis, erwarteKnopf: false })
        fehler.push(...r2.fehler.filter((t) => /Knopf/.test(t)).map((t) => `Web ?dex=1: ${t}`))
      } else {
        const r = await besuche(browser, basis + seitePfad, { basis, erwarteKnopf: false })
        fehler.push(...r.fehler.filter((t) => /Knopf/.test(t)).map((t) => `Web (nicht veröffentlicht): ${t}`))
        hinweise.push('ZIP nicht veröffentlicht (> 25 MiB), Knopf ausgeblendet')
      }
    }

    for (const t of fehler) console.log(`  ✗ ${t}`)
    for (const t of [...new Set(hinweise)].slice(0, 8)) console.log(`  · ${t}`)
    gesamtFehler += fehler.length
    zeilen.push({ app: app.id, version: s?.version ?? '–', groesse: st.groesse, single: s?.single, api: s?.api ?? [], veroeffentlicht: st.veroeffentlicht, ok: fehler.length === 0 })
  }
} finally {
  repoServer?.stopp()
  await browser?.close()
  fs.rmSync(tmpWurzel, { recursive: true, force: true })
}

console.log('\nApp                          Version   ZIP        single  im Web  Prüfung  fehlende APIs')
for (const z of zeilen) {
  console.log(`${z.app.padEnd(29)}${String(z.version).padEnd(10)}${(z.groesse ? (z.groesse / 1048576).toFixed(2) + ' MB' : '–').padEnd(11)}${(z.single ? 'ja' : 'nein').padEnd(8)}${(z.veroeffentlicht ? 'ja' : 'nein').padEnd(8)}${(z.ok ? 'ok' : 'FEHLER').padEnd(9)}${(z.api || []).join(', ') || '–'}`)
}
process.exit(gesamtFehler ? 1 : 0)
