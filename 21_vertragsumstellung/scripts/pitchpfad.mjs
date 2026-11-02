// ===========================================================================
// Pitchpfad — Storyboard und Aufzeichnung der 90 Sekunden
//
// Fährt den Weg, den der Vortragende im Pitch nimmt, und legt je Station ein
// Standbild ab; auf Wunsch zusätzlich ein Video (webm). Reglerbewegungen
// laufen über die Tastatur, damit sie deterministisch sind und der Browser
// dieselben Ereignisse auslöst wie ein Nutzer.
//
// Stationen:
//   1  Lagebild — die eine Zahl
//   2  Simulationskasten — Ausgangslage, Regler links (AP Leben), Regler
//      rechts (AP Komposit), Wirkung unten, Stufe 4 hoch (Staffel und
//      Bonusstaffel-Tafel), Beispielhaus gewechselt, Beschlussvorlage
//   3  Umstellung — Verteilung, Kacheln, Akte Dresden (Übersicht oben und
//      unten), Verhandlungsmodus mit Zug, Verlauf
//
// Aufruf: node scripts/pitchpfad.mjs <zielordner> [url] [--video]
// ===========================================================================
import { chromium } from 'playwright'
import fs from 'node:fs'
import path from 'node:path'

const ZIEL = process.argv[2] || 'pitch'
const URL = process.argv.find(a => a.startsWith('http')) || 'http://127.0.0.1:4173/'
const VIDEO = process.argv.includes('--video')
const BREITE = Number(process.env.BREITE || 1600)
const BROWSER = process.env.CHROMIUM || '/opt/pw-browsers/chromium-1194/chrome-linux/chrome'

// Der Navigationseintrag heißt nach Paket HUELLE „Simulationskasten“; bis
// dahin „Modell-Simulation“ — der Pfad findet ihn unter beiden Namen.
const NAV_KASTEN = /Simulationskasten|Modell-Simulation/

fs.mkdirSync(ZIEL, { recursive: true })
const browser = await chromium.launch({ executablePath: BROWSER })
const ctx = await browser.newContext({
  viewport: { width: BREITE, height: 1000 },
  ...(VIDEO ? { recordVideo: { dir: ZIEL, size: { width: BREITE, height: 1000 } } } : {}),
})
await ctx.addInitScript(() => { try { localStorage.clear() } catch {} })
const seite = await ctx.newPage()
const fehler = []
seite.on('pageerror', e => fehler.push(String(e)))

let nr = 0
async function station(name, ms = 900) {
  await seite.waitForTimeout(ms)
  await seite.mouse.move(2, 2)
  await seite.waitForTimeout(150)
  nr += 1
  await seite.screenshot({ path: path.join(ZIEL, `${String(nr).padStart(2, '0')}-${name}.png`) })
  console.log(`  ${String(nr).padStart(2, '0')}  ${name}`)
}
async function knopf(muster, ms = 500) {
  try {
    await seite.getByRole('button', { name: muster }).or(seite.getByRole('tab', { name: muster })).first().click({ timeout: 5000 })
    await seite.waitForTimeout(ms)
  } catch { console.log(`   (Knopf ${muster} nicht gefunden)`) }
}
async function nav(name) {
  await seite.evaluate(() => window.scrollTo(0, 0))
  await seite.locator('.vg-nav-eintrag', { hasText: name }).first().click()
  await seite.waitForTimeout(600)
}
/** Fenster so rollen, dass die Tafel mit diesem Titel oben im Bild steht. */
async function zuTafel(muster) {
  const y = await seite.evaluate((m) => {
    const t = [...document.querySelectorAll('.vg-tafel')].find(el => new RegExp(m).test(el.getAttribute('aria-label') || ''))
    // Versatz messen statt raten: bei ≤ 1024 px klebt der Steuerblock als Band
    // unter der Kontextleiste (steuerblock.css) — die Tafel muss unter dem Band
    // beginnen, sonst verdeckt es ihren Kopf. Breiter als 90 % des Fensters heißt:
    // Band, nicht Seitenspalte. Sonst reichen Topbar + Kontextleiste (96 px).
    const band = document.querySelector('.vg-steuerblock')
    const klebt = band && getComputedStyle(band).position === 'sticky'
      && band.getBoundingClientRect().width > window.innerWidth * 0.9
    const versatz = klebt ? band.getBoundingClientRect().bottom + 16 : 96
    return t ? Math.max(0, t.getBoundingClientRect().top + window.scrollY - versatz) : null
  }, muster.source)
  if (y == null) { console.log(`   (Tafel ${muster} nicht gefunden)`); return }
  await seite.evaluate(o => window.scrollTo(0, o), y)
  await seite.waitForTimeout(300)
}
/**
 * Regler per Tastatur bewegen — sichtbar, in Schritten, damit das Nachlaufen
 * der Zahlen aufgezeichnet wird. `ziel` ist der Reglername (aria-label des
 * Range-Inputs) oder ein Index in der Reihenfolge der Seite.
 */
async function ziehen(ziel, schritte, richtung = 'ArrowRight') {
  const regler = typeof ziel === 'number'
    ? seite.locator('.vg-regler-bahn input[type="range"]').nth(ziel)
    : seite.locator(`.vg-regler-bahn input[type="range"][aria-label="${ziel}"]`).first()
  if (await regler.count() === 0) { console.log(`   (Regler ${ziel} nicht gefunden)`); return }
  await regler.scrollIntoViewIfNeeded()
  await regler.focus()
  for (let i = 0; i < schritte; i++) {
    await seite.keyboard.press(richtung)
    await seite.waitForTimeout(70)
  }
  await seite.waitForTimeout(500)
}
/** Einen Stufensatz der Bonusstaffel per Pfeil hoch anheben (Schritt 0,5). */
async function stufeHoch(index, schritte) {
  // Nur die Satz-Spalte zählen — Schwellen sind ebenfalls .vg-staffel-eingabe
  const feld = seite.locator('.vg-staffel td[data-spalte="neu"] .vg-staffel-eingabe').nth(index)
  if (await feld.count() === 0) { console.log(`   (Stufe ${index + 1} nicht gefunden)`); return }
  await feld.scrollIntoViewIfNeeded()
  await feld.focus()
  for (let i = 0; i < schritte; i++) {
    await seite.keyboard.press('ArrowUp')
    await seite.waitForTimeout(70)
  }
  await seite.keyboard.press('Enter')
  await seite.waitForTimeout(500)
}

// 1 · Lagebild: die eine Zahl
await seite.goto(`${URL}#/start`, { waitUntil: 'networkidle' })
await seite.keyboard.press('Escape')
await station('lagebild', 1400)

// 2 · Simulationskasten: Regler ziehen, Staffel anheben, Beispielhaus wechseln
await nav(NAV_KASTEN)
await station('kasten-ausgangslage')
await ziehen('AP Leben', 10, 'ArrowLeft'); await station('kasten-regler-links')
await ziehen('AP Komposit', 12, 'ArrowRight'); await station('kasten-regler-rechts')
await seite.evaluate(() => window.scrollTo(0, 900)); await station('kasten-wirkung-unten', 1200)
await seite.evaluate(() => window.scrollTo(0, 0))

// Stufe 4 von 19 auf 25 %: Normierung geht aus, das Bonusvolumen steigt,
// die Bonusstaffel-Tafel zeigt, welche Einheiten wandern
await stufeHoch(3, 12); await station('kasten-stufe-4-hoch')
await zuTafel(/^Bonusstaffel/); await station('kasten-stufe-4-wirkung', 1200)

// Beispielhaus: Dresden → Leipzig, die Beispielhaus-Tafel rechnet sofort um
await seite.evaluate(() => window.scrollTo(0, 0))
const auswahl = seite.locator('select[aria-label="Beispielhaus wählen"]')
if (await auswahl.count()) {
  // Erst wählen, dann rollen: die Auswahl holt sich beim Klick selbst ins Bild
  await auswahl.selectOption('leipzig'); await seite.waitForTimeout(500)
  await zuTafel(/^Beispielhaus/)
  await station('kasten-beispielhaus-gewechselt', 1200)
} else {
  console.log('   (Auswahl „Beispielhaus wählen“ nicht gefunden)')
}

// Beschlussvorlage als Schublade
await seite.evaluate(() => window.scrollTo(0, 0))
await knopf(/Beschlussvorlage/, 800); await station('kasten-beschlussvorlage')
await seite.keyboard.press('Escape'); await seite.waitForTimeout(400)

// 3 · Umstellung: Lagebild → Akte Dresden (Übersicht) → Verhandlungsmodus
await nav('Umstellungstool')
await station('umstellung-verteilung', 1400)
await knopf(/^Kacheln/); await station('umstellung-kacheln')
await seite.goto(`${URL}#/umstellung/osd`, { waitUntil: 'networkidle' })
await station('akte-uebersicht', 1200)
await seite.evaluate(() => window.scrollTo(0, 700)); await station('akte-uebersicht-unten')
await seite.evaluate(() => window.scrollTo(0, 0))
await knopf(/Verhandlungsmodus/, 900); await station('verhandlungsmodus')
await ziehen(0, 6, 'ArrowRight'); await station('verhandlungsmodus-zug')
await knopf(/^Schließen$/, 300)
await seite.keyboard.press('Escape'); await seite.waitForTimeout(400)
await knopf(/^Verlauf 2028/); await station('akte-verlauf')

fs.writeFileSync(path.join(ZIEL, 'fehler.txt'), fehler.join('\n'))
console.log(`Stationen: ${nr} · Laufzeitfehler: ${fehler.length}`)
await ctx.close()
await browser.close()
if (VIDEO) {
  const webm = fs.readdirSync(ZIEL).find(f => f.endsWith('.webm'))
  if (webm) { fs.renameSync(path.join(ZIEL, webm), path.join(ZIEL, 'pitchpfad.webm')); console.log('Video: pitchpfad.webm') }
}
