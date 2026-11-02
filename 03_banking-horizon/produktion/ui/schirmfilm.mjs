// Oberflaeche als Einzelbilder rendern.
//
// Chromium laedt die Seite einmal und wird dann fuer jedes Bild ueber setT(t)
// auf einen Zeitpunkt gestellt — nicht ueber die Uhr. Damit ist die Aufnahme
// wiederholbar, und ein abgebrochener Lauf laesst sich fortsetzen.
import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs'
import { mkdirSync } from 'node:fs'

const [seite, ziel, dauerS = '6', fpsS = '24', breiteS = '1600', hoeheS = '1138',
       durchsichtig = ''] = process.argv.slice(2)
const dauer = Number(dauerS), fps = Number(fpsS)
const breite = Number(breiteS), hoehe = Number(hoeheS)
mkdirSync(ziel, { recursive: true })

const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' })
const page = await browser.newPage({ viewport: { width: breite, height: hoehe }, deviceScaleFactor: 1 })
await page.goto('file://' + seite)
await page.waitForTimeout(300)

const n = Math.round(dauer * fps)
for (let i = 0; i < n; i++) {
  await page.evaluate((t) => window.setT(t), i / fps)
  // Mit 'transparent' bleibt der Seitenhintergrund frei — dann laesst sich
  // die Aufnahme als Ebene ueber ein Bild legen (Kundenkacheln um 08:10).
  await page.screenshot({ path: `${ziel}/${String(i).padStart(4, '0')}.png`,
                          omitBackground: durchsichtig === 'transparent' })
}
await browser.close()
console.log(`${n} Bilder in ${ziel}`)
