#!/usr/bin/env node
// ===========================================================================
// Rauchtest
//
// Klickt die Anwendung in beiden Marken einmal durch und schlägt an, sobald
// etwas nicht stimmt. Die Vorschau muss laufen:
//
//   npm run build && npm run vorschau &
//   npm run rauchtest
//
// Geprüft wird je Marke (Whitelabel und NÜRNBERGER):
//   · Laufzeit- und Konsolenfehler, HTTP-Antworten ab 400 vom eigenen Server
//   · die vier Seiten bei 1600, 1280 und 1024 px: kein waagerechter Überlauf,
//     der Kopf ist 163 px hoch (einheitlicher Kopf der Plattform)
//   · jede Detailansicht eines Eingangs mit Original, Deckblatt und Prüfung
//   · die Präsentation: jede Beispielanfrage in allen sechs Szenen bei
//     1920 × 1080; außer dem Deckblatt (Szene 3) passt jede Szene ohne Scrollen
//   · Begriffe: Im Whitelabel steht kein Hausbegriff eines Kunden, in der
//     Kundenmarke kein Platzhalterbegriff des Whitelabels
//   · keine Emojis im sichtbaren Text, in title, placeholder und alt
//
// Dazu einmal die Direktaufrufe der Beispielanfragen: Ziffern im Kopf,
// Kacheln der Übersicht, Direktlinks #beispiel-n und #praesentation-n,
// Zifferntasten in der Präsentation.
//
// Braucht Playwright (im Projekt oder global installiert). Ein eigener
// Browser lässt sich über CHROMIUM=/pfad/zu/chrome vorgeben.
// ===========================================================================

import { createRequire } from 'node:module'

const require = createRequire(import.meta.url)
let chromium
try { ({ chromium } = require('playwright')) } catch {
  console.error('Playwright ist nicht installiert (npm i -D playwright oder global).')
  process.exit(2)
}

const BASIS = (process.argv[2] || 'http://127.0.0.1:4327/').replace(/\/?$/, '/')
const SEITEN = ['', 'strecke', 'layouts', 'prozess']
const BREITEN = [1600, 1280, 1024]
const SZENEN = ['E-Mail-Eingang', 'KI liest', 'KI-Deckblatt', 'Prüfung', 'Nächster Schritt', 'Alle Eingänge']

// Was in der jeweils anderen Marke zu Hause ist und hier nicht stehen darf.
const VERBOTEN = {
  neutral: ['NÜRNBERGER', 'Nürnberger', 'MyComposit', 'BusinessLine', 'Businessline', 'SAPRO', 'BOSS', 'DLC', 'Dienstleistungscenter', 'SHUK', 'Host'],
  nuernberger: ['Zukunftsversicherung', 'Angebotssystem', 'Gewerbelinie']
}
const EMOJI = /[\u{1F000}-\u{1FAFF}\u{2600}-\u{27BF}\u{2B50}\u{FE0F}]/u
const BUCHSTABE = 'A-Za-zÄÖÜäöüß'

const befunde = []
const melde = (marke, wo, text) => befunde.push(`[${marke}] ${wo}: ${text}`)

const browser = await chromium.launch(process.env.CHROMIUM ? { executablePath: process.env.CHROMIUM } : {})

async function neueSeite(marke, breite = 1920, hoehe = 1080) {
  const ctx = await browser.newContext({ viewport: { width: breite, height: hoehe } })
  const seite = await ctx.newPage()
  seite.on('pageerror', e => melde(marke, 'Laufzeit', e.message))
  seite.on('console', m => {
    // Markenlogos und Schriften kommen von außen; ohne Netz fehlen sie, das ist kein Fehler der App.
    if (m.type() === 'error' && !/Failed to load resource|net::ERR_/.test(m.text())) melde(marke, 'Konsole', m.text())
  })
  seite.on('response', r => {
    if (r.status() >= 400 && r.url().startsWith(BASIS)) melde(marke, 'HTTP', `${r.status()} ${r.url()}`)
  })
  // Die Marke wird über die Adresse gesetzt und bleibt für alle weiteren Aufrufe gespeichert.
  await seite.goto(`${BASIS}?marke=${marke}`, { waitUntil: 'networkidle' })
  return { ctx, seite }
}

async function pruefeText(seite, marke, wo) {
  const text = await seite.evaluate(() => document.body.innerText + ' ' +
    [...document.querySelectorAll('[title],[placeholder],[alt]')].map(e => `${e.title || ''} ${e.placeholder || ''} ${e.alt || ''}`).join(' '))
  for (const wort of VERBOTEN[marke]) {
    const m = new RegExp(`(^|[^${BUCHSTABE}])${wort}([^${BUCHSTABE}]|$)`).exec(text)
    if (m) melde(marke, wo, `„${wort}“ … ${text.slice(Math.max(0, m.index - 40), m.index + 60).replace(/\s+/g, ' ')}`)
  }
  const e = EMOJI.exec(text)
  if (e) melde(marke, wo, `Emoji ${JSON.stringify(e[0])} … ${text.slice(Math.max(0, e.index - 30), e.index + 30).replace(/\s+/g, ' ')}`)
}

async function seitenUndBreiten(marke) {
  for (const breite of BREITEN) {
    const { ctx, seite } = await neueSeite(marke, breite, 900)
    for (const h of SEITEN) {
      await seite.goto(`${BASIS}#${h}`, { waitUntil: 'networkidle' })
      await seite.waitForTimeout(250)
      const wo = `Seite ${h || 'uebersicht'} bei ${breite} px`
      const mass = await seite.evaluate(() => ({
        breit: document.documentElement.scrollWidth, fenster: window.innerWidth,
        kopf: Math.round(document.querySelector('header')?.getBoundingClientRect().height || 0)
      }))
      if (mass.breit > mass.fenster + 1) melde(marke, wo, `waagerechter Überlauf (${mass.breit} px bei ${mass.fenster} px Fenster)`)
      if (mass.kopf !== 163) melde(marke, wo, `Kopf ist ${mass.kopf} px hoch, erwartet 163 px`)
      if (breite === BREITEN[0]) await pruefeText(seite, marke, wo)
    }
    await ctx.close()
  }
}

async function strecke(marke) {
  const { ctx, seite } = await neueSeite(marke, 1600, 900)
  await seite.goto(`${BASIS}#strecke`, { waitUntil: 'networkidle' })
  await seite.getByRole('button', { name: /Weiter zum Hochladen/ }).click()
  await seite.waitForTimeout(250)
  await seite.getByRole('button', { name: /Eigene Anfrage einfügen/ }).click()
  await seite.waitForTimeout(200)
  await pruefeText(seite, marke, 'Strecke, Hochladen')
  // Neu laden: derselbe Hash wäre keine Navigation, die Seite bliebe beim Hochladen.
  await seite.reload({ waitUntil: 'networkidle' })
  await seite.getByRole('button', { name: /Auswertung ohne Download und Upload/ }).click()
  await seite.waitForTimeout(3500)
  await pruefeText(seite, marke, 'Strecke, Ergebnis')
  await ctx.close()
}

async function detailansichten(marke) {
  const { ctx, seite } = await neueSeite(marke, 1920, 1080)
  await seite.goto(BASIS, { waitUntil: 'networkidle' })
  const zeilen = seite.locator('[data-eingang]')
  const anzahl = await zeilen.count()
  if (anzahl === 0) melde(marke, 'Übersicht', 'kein Eingang in der Liste')
  for (let i = 0; i < anzahl; i++) {
    const id = await zeilen.nth(i).getAttribute('data-eingang')
    await zeilen.nth(i).click()
    await seite.waitForTimeout(300)
    const fenster = seite.locator('[data-modal]')
    if (!(await fenster.count())) { melde(marke, `Detail ${id}`, 'Fenster öffnet nicht'); continue }
    const alleDrei = fenster.getByRole('button', { name: '1 + 2 + 3' })
    if (await alleDrei.count()) { await alleDrei.click(); await seite.waitForTimeout(250) }
    if (!(await fenster.locator('mark.fs').count())) melde(marke, `Detail ${id}`, 'keine Fundstelle im Original')
    await pruefeText(seite, marke, `Detail ${id}`)
    await seite.keyboard.press('Escape')
    await seite.waitForTimeout(200)
  }
  await ctx.close()
  return anzahl
}

async function praesentation(marke) {
  const { ctx, seite } = await neueSeite(marke, 1920, 1080)
  await seite.goto(BASIS, { waitUntil: 'networkidle' })
  await seite.locator('header').getByRole('button', { name: 'Präsentation', exact: true }).click()
  await seite.waitForTimeout(400)
  const p = seite.locator('[data-praesentation]')
  const beispiele = await seite.locator('header [title^="Beispiel "]').count()
  for (let nr = 1; nr <= beispiele; nr++) {
    await seite.keyboard.press(String(nr))
    await seite.waitForTimeout(250)
    for (let sz = 0; sz < SZENEN.length; sz++) {
      await p.getByRole('button', { name: new RegExp(SZENEN[sz]) }).first().click()
      await seite.waitForTimeout(350)
      const ueberspringen = p.getByRole('button', { name: 'Animation überspringen' })
      if (await ueberspringen.count()) { await ueberspringen.click(); await seite.waitForTimeout(500) }
      const wo = `Präsentation, Beispiel ${nr}, Szene ${sz + 1}`
      await pruefeText(seite, marke, wo)
      // Das Deckblatt ist länger als der Bildschirm und scrollt; alle anderen Szenen passen.
      if (sz !== 2) {
        const mass = await seite.locator('[data-szene]').evaluate(el => ({ inhalt: el.scrollHeight, platz: el.clientHeight }))
        if (mass.inhalt > mass.platz + 2) melde(marke, wo, `passt nicht auf den Bildschirm (${mass.inhalt} px bei ${mass.platz} px)`)
      }
    }
  }
  await seite.keyboard.press('Escape')
  await ctx.close()
  return beispiele
}

async function direktaufrufe(marke) {
  const { ctx, seite } = await neueSeite(marke, 1920, 1080)
  const titel = async () => ((await seite.locator('[data-modal] h2, [data-modal] h3').first().textContent().catch(() => '')) || '').trim()
  const hash = () => seite.evaluate(() => location.hash)
  const aktiv = () => seite.locator('[data-praesentation]').evaluate(el => {
    const k = [...el.querySelectorAll('button')].find(b => /^[1-9]$/.test(b.textContent.trim()) && b.style.backgroundColor)
    return k ? k.textContent.trim() : ''
  })
  const erwarte = (ist, soll, wo) => { if (ist !== soll) melde(marke, wo, `erwartet „${soll}“, ist „${ist}“`) }

  // Ziffer im Kopf, von einer anderen Seite aus
  await seite.goto(`${BASIS}#prozess`, { waitUntil: 'networkidle' })
  await seite.locator('header').getByRole('button', { name: '2', exact: true }).click()
  await seite.waitForTimeout(400)
  if (!(await titel())) melde(marke, 'Kopf, Ziffer 2', 'Detailfenster öffnet nicht')
  erwarte(await hash(), '#beispiel-2', 'Kopf, Ziffer 2: Adresse')
  await seite.keyboard.press('Escape'); await seite.waitForTimeout(300)
  erwarte(await hash(), '#prozess', 'nach dem Schließen: Adresse')

  // Direktlink auf ein Beispiel, auch nach dem Neuladen
  await seite.goto('about:blank')
  await seite.goto(`${BASIS}#beispiel-3`, { waitUntil: 'networkidle' }); await seite.waitForTimeout(400)
  const drei = await titel()
  if (!drei) melde(marke, 'Direktlink #beispiel-3', 'Detailfenster öffnet nicht')
  await seite.reload({ waitUntil: 'networkidle' }); await seite.waitForTimeout(400)
  erwarte(await titel(), drei, 'Direktlink #beispiel-3 nach Neuladen')

  // Ein Beispiel, das es nicht gibt, darf nichts kaputt machen
  await seite.goto('about:blank')
  await seite.goto(`${BASIS}#beispiel-99`, { waitUntil: 'networkidle' }); await seite.waitForTimeout(300)
  if (await seite.locator('[data-modal]').count()) melde(marke, 'Direktlink #beispiel-99', 'öffnet ein Fenster')

  // Direktlink in die Präsentation und Zifferntasten
  await seite.goto('about:blank')
  await seite.goto(`${BASIS}#praesentation-4`, { waitUntil: 'networkidle' }); await seite.waitForTimeout(500)
  erwarte(await aktiv(), '4', 'Direktlink #praesentation-4')
  await seite.keyboard.press('1'); await seite.waitForTimeout(300)
  erwarte(await aktiv(), '1', 'Präsentation, Taste 1')
  await seite.keyboard.press('Escape'); await seite.waitForTimeout(300)

  // Kacheln der Übersicht
  await seite.goto('about:blank')
  await seite.goto(BASIS, { waitUntil: 'networkidle' })
  await seite.getByRole('button', { name: 'Präsentieren' }).nth(1).click(); await seite.waitForTimeout(500)
  erwarte(await aktiv(), '2', 'Kachel „Präsentieren“ von Beispiel 2')
  await seite.keyboard.press('Escape'); await seite.waitForTimeout(300)
  await ctx.close()
}

for (const marke of Object.keys(VERBOTEN)) {
  const vorher = befunde.length
  await seitenUndBreiten(marke)
  await strecke(marke)
  const details = await detailansichten(marke)
  const beispiele = await praesentation(marke)
  await direktaufrufe(marke)
  const neu = befunde.length - vorher
  console.log(`${neu ? '✗' : '✓'} ${marke}: ${SEITEN.length} Seiten in ${BREITEN.length} Breiten, ${details} Detailansichten, ${beispiele} Beispiele in ${SZENEN.length} Szenen, Direktaufrufe${neu ? ` – ${neu} Befunde` : ''}`)
}

await browser.close()

if (befunde.length) {
  console.log('\nBefunde:')
  for (const b of [...new Set(befunde)]) console.log('  ' + b)
  process.exit(1)
}
console.log('\nRauchtest ohne Befund')
