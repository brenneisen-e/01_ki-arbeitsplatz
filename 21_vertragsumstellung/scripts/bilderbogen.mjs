// ===========================================================================
// Bilderbogen — Screenshots aller Oberflächen in mehreren Breiten
//
// Aufruf: node scripts/bilderbogen.mjs <zielordner> [url]
// Legt je Breite einen Unterordner an. Dient der Gestaltungsprüfung: wer
// die Anwendung beurteilt, soll jede Ansicht ohne eigenes Klicken sehen.
//
// Bilder: 01 Lagebild · 02 Simulationskasten (oben, unten, Staffel
// verändert, Beispielhaus gewechselt, Beschlussvorlage) · 04 Umstellungstool
// (Verteilung, Tabelle, Kacheln) · 05 Vergleich · 06 Institutsakte
// (Übersicht, Verlauf, Vertriebspartner, Argumente, Kennzahlen) ·
// 07 Verhandlungsmodus · 08 Handout · 09 Fassungen · 10 Grundlagen ·
// 11 Marken-Studio · 12 Kommandopalette · 13 Dunkelmodus · 14 Tafelprobe
// ===========================================================================
import { chromium } from 'playwright'
import fs from 'node:fs'
import path from 'node:path'

const ZIEL = process.argv[2] || 'bilder'
const URL = process.argv[3] || 'http://127.0.0.1:4173/'
const BREITEN = (process.env.BREITEN || '1920,1600,1280,1024').split(',').map(Number)
const BROWSER = process.env.CHROMIUM || '/opt/pw-browsers/chromium-1194/chrome-linux/chrome'

const browser = await chromium.launch({ executablePath: BROWSER })

for (const breite of BREITEN) {
  const ordner = path.join(ZIEL, String(breite))
  fs.mkdirSync(ordner, { recursive: true })
  const ctx = await browser.newContext({ viewport: { width: breite, height: 1000 }, deviceScaleFactor: 1 })
  await ctx.addInitScript(() => { try { localStorage.clear() } catch {} })
  const seite = await ctx.newPage()
  const fehler = []
  seite.on('pageerror', e => fehler.push(String(e)))

  async function ruhe(ms = 700) {
    await seite.waitForTimeout(ms)
    await seite.mouse.move(2, 2)
    await seite.waitForTimeout(200)
  }
  async function schuss(name, y = 0) {
    await seite.evaluate(o => window.scrollTo(0, o), y)
    await ruhe()
    await seite.screenshot({ path: path.join(ordner, `${name}.png`) })
    console.log(`  ${breite}  ${name}`)
  }
  async function gehe(hash) {
    await seite.goto(`${URL}#/${hash}`, { waitUntil: 'networkidle' })
    await seite.keyboard.press('Escape')
    await ruhe(500)
  }
  async function knopf(muster, ms = 500) {
    try {
      // Reiter tragen role=tab, Knöpfe role=button — beide sind Klickziele
      await seite.getByRole('button', { name: muster }).or(seite.getByRole('tab', { name: muster })).first().click({ timeout: 5000 })
      await seite.waitForTimeout(ms)
      return true
    } catch { return false }
  }
  /** Schuss mit der Tafel oben im Bild — die Reihe darunter bleibt sichtbar. */
  async function schussBeiTafel(name, muster) {
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
      return t ? Math.max(0, t.getBoundingClientRect().top + window.scrollY - versatz) : 0
    }, muster.source)
    await schuss(name, y)
  }

  // Startseite
  await gehe('start')
  await schuss('01-start')
  await schuss('01-start-unten', 900)

  // Simulationskasten: eine Seite — oben Eingabe-Tafeln, unten Wirkung
  await gehe('simulation')
  await schuss('02-kasten')
  await schuss('02-kasten-unten', 900)

  // Staffel: Stufe 4 auf 25 % — Abzeichen im Feld, Normierung geht aus,
  // die Bonusstaffel-Tafel zeigt, wer wohin wandert
  // Nur die Satz-Spalte zählen — Schwellen sind ebenfalls .vg-staffel-eingabe
  const stufe4 = seite.locator('.vg-staffel td[data-spalte="neu"] .vg-staffel-eingabe').nth(3)
  if (await stufe4.count()) {
    await stufe4.fill('25'); await stufe4.press('Enter'); await seite.waitForTimeout(600)
    await schuss('02-kasten-staffel')
    await schussBeiTafel('02-kasten-staffel-wirkung', /^Bonusstaffel/)
  }

  // Beispielhaus wechseln: die Beispielhaus-Tafel oben im Bild
  const auswahl = seite.locator('select[aria-label="Beispielhaus wählen"]')
  if (await auswahl.count()) {
    await auswahl.selectOption('leipzig'); await seite.waitForTimeout(600)
    await schussBeiTafel('02-kasten-beispielhaus', /^Beispielhaus/)
  }

  // Weitere Stellhebel aufgeklappt
  await seite.evaluate(() => window.scrollTo(0, 0))
  await knopf(/Weitere Stellhebel/); await schuss('02-kasten-weitere')

  // Beschlussvorlage als Schublade
  await knopf(/Beschlussvorlage/, 800); await schuss('02-kasten-beschluss')
  await seite.keyboard.press('Escape'); await ruhe(300)

  // Umstellung: drei Ansichten und Vergleich
  await gehe('umstellung')
  await schuss('04-umstellung-verteilung')
  await knopf(/^Tabelle/); await schuss('04-umstellung-tabelle')
  await knopf(/^Kacheln/); await schuss('04-umstellung-kacheln')
  await schuss('04-umstellung-kacheln-unten', 800)
  await gehe('umstellung/vergleich/osd,leipzig,erzgebirge')
  await schuss('05-vergleich')

  // Institutsakte: Übersicht (Ein-Bild-Dashboard) und die übrigen Reiter
  await gehe('umstellung/osd')
  await schuss('06-akte-uebersicht')
  await schuss('06-akte-uebersicht-unten', 800)
  await knopf(/^Verlauf 2028/); await schuss('06-akte-verlauf')
  await knopf(/Wie die Veränderung zustande kommt/); await schuss('06-akte-verlauf-unten', 900)
  await knopf(/^Vertriebspartner/); await schuss('06-akte-partner')
  await knopf(/^Argumente/); await schuss('06-akte-argumente')
  await knopf(/^Kennzahlen/); await schuss('06-akte-kennzahlen')
  await knopf(/^Übersicht/)
  await knopf(/Verhandlungsmodus/, 800); await schuss('07-verhandlung')
  await seite.keyboard.press('Escape'); await ruhe(300)
  await knopf(/Handout/, 800); await schuss('08-handout')
  await schuss('08-handout-unten', 900)

  // Fassungen, Grundlagen
  await gehe('fassungen'); await schuss('09-fassungen')
  await gehe('grundlagen'); await schuss('10-grundlagen')

  // Marken-Studio und Kommandopalette
  await gehe('start')
  await knopf(/Marken-Studio öffnen/, 700); await schuss('11-studio')
  await seite.keyboard.press('Escape'); await ruhe(300)
  await seite.keyboard.press('Control+k'); await ruhe(500); await schuss('12-palette')
  await seite.keyboard.press('Escape'); await ruhe(200)

  // Dunkelmodus
  await seite.evaluate(() => document.documentElement.setAttribute('data-theme', 'dark'))
  await gehe('start'); await schuss('13-dunkel-start')
  await gehe('simulation'); await schuss('13-dunkel-kasten')
  await gehe('umstellung/osd'); await schuss('13-dunkel-akte')
  await seite.evaluate(() => document.documentElement.removeAttribute('data-theme'))

  // Tafelprobe: nur im Hash erreichbar; ohne Route bleibt die Seite leer
  // und es entsteht kein Bild.
  await gehe('tafelprobe')
  if (await seite.locator('.vg-tafel').count()) {
    await schuss('14-tafelprobe')
    await schuss('14-tafelprobe-unten', 900)
  }

  fs.writeFileSync(path.join(ordner, 'fehler.txt'), fehler.join('\n'))
  console.log(`  ${breite}  Laufzeitfehler: ${fehler.length}`)
  await ctx.close()
}
await browser.close()
