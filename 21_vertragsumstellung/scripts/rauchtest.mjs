// ===========================================================================
// Rauchtest
//
// Klickt die Anwendung einmal durch und schlägt an, sobald irgendwo ein
// Laufzeitfehler auftritt.
//
// Anlass: ein aufgeräumter Import (`ReferenceLine` aus recharts) fiel weg,
// obwohl er noch benutzt wurde. Der Build lief durch — Rollup prüft in JSX
// keine freien Bezeichner — und die Anwendung zeigte in der Simulation eine
// weiße Seite. Genau diese Klasse Fehler fängt der Test.
//
// Geprüft wird zusätzlich:
//   · HTTP-Antworten ab 400 (fehlende Schriften, fehlende Bündel)
//   · Zeichen, die Uniform nicht führt und die als Kästchen erscheinen
//   · ob Simulationskasten und Akten-Dashboard mit ihren Tafeln da sind
//   · waagerechter Überlauf bei 1600, 1280 und 1024 px — im Dokument, in
//     jeder Tafel, im Steuerblock UND in jedem Scrollrahmen darin: ein
//     Rahmen mit overflow-x: auto (Staffeltabelle, Vergleichstabelle,
//     Blockmitte) scrollt seitlich, ohne dass die Tafel selbst breiter
//     würde — die Staffeltabelle im Kasten stand so angeschnitten da,
//     und der Test meldete nichts, weil er nur die Tafel maß
//   · starke Kappungen: Ellipsen, hinter denen weniger als die Hälfte des
//     Textes sichtbar ist („Z (“, „B…“, „16,34 M…“) — milde Kappungen
//     langer Produktnamen mit title bleiben erlaubt (Tafelsprache § 1)
//
// Strecke: Simulationskasten (Regler ziehen, Stufensatz eintippen,
// Beispielhaus wechseln, Weitere Stellhebel aufklappen, Beschlussvorlage
// öffnen), Umstellungstool (drei Ansichten), Institutsakte (Übersicht,
// Verlauf, Argumente, Vertriebspartner, Kennzahlen, Verhandlungsmodus),
// Grundlagen. Jede Tafel und jedes Diagramm wird mit der Maus angefahren,
// damit auch Sprechblasen und Tips rendern.
//
// Aufruf:
//   npm run build && npm run vorschau &      # oder ein beliebiger Server
//   node scripts/rauchtest.mjs [URL]
// ===========================================================================

import { chromium } from 'playwright'

const URL = process.argv[2] || 'http://127.0.0.1:4173/'
const BROWSER = process.env.CHROMIUM || '/opt/pw-browsers/chromium-1194/chrome-linux/chrome'

// Zeichen, die in Uniform fehlen. Kommt eines davon im DOM vor, sieht der
// Nutzer ein Kästchen. Wer eines braucht, zeichnet es (siehe .vg-pfeil).
const FEHLENDE_GLYPHEN = ['→', '↔', '∈', '≤', '≥', '⌘', '≈', '↑', '↓', '⇧', '⌥']

// Navigationsnamen: Paket HUELLE benennt „Modell-Simulation“ in
// „Simulationskasten“ um — der Test findet den Eintrag unter beiden Namen.
const NAV_KASTEN = /Simulationskasten|Modell-Simulation/

const browser = await chromium.launch({ executablePath: BROWSER })
const ctx = await browser.newContext({ viewport: { width: 1600, height: 1000 } })
await ctx.addInitScript(() => { try { localStorage.clear() } catch {} })
const seite = await ctx.newPage()

const fehler = []
const konsole = []
const http = []
const nichtGefunden = []
const glyphen = new Set()
seite.on('pageerror', e => fehler.push(String(e)))
seite.on('console', m => { if (m.type() === 'error') konsole.push(m.text().slice(0, 200)) })
seite.on('response', r => { if (r.status() >= 400) http.push(`${r.status()} ${r.url()}`) })

async function nav(name) {
  await seite.evaluate(() => window.scrollTo(0, 0))
  await seite.waitForTimeout(150)
  await seite.locator('.vg-nav-eintrag', { hasText: name }).first().click()
  await seite.waitForTimeout(500)
}
async function knopf(muster, ms = 450) {
  try {
    // Reiter tragen role=tab, Knöpfe role=button — beide sind Klickziele
    await seite.getByRole('button', { name: muster }).or(seite.getByRole('tab', { name: muster })).first().click({ timeout: 6000 })
    await seite.waitForTimeout(ms)
    return true
  } catch { return false }
}
/** Ein Klickziel, das da sein muss — fehlt es, ist das ein Befund, kein Timeout. */
async function pflichtKnopf(muster, wo, ms) {
  const ok = await knopf(muster, ms)
  if (!ok) nichtGefunden.push(`${wo}: Knopf ${muster} nicht gefunden`)
  return ok
}
/** Ein Bauteil, das in der Ansicht stehen muss (Tafelraster, Tabelle, Auswahl). */
async function erwarte(selektor, wo) {
  const anzahl = await seite.locator(selektor).count().catch(() => 0)
  if (anzahl === 0) nichtGefunden.push(`${wo}: ${selektor} nicht gefunden`)
  return anzahl > 0
}

/** Zeichen sammeln, die Uniform nicht führt — je Ansicht, nicht nur auf der Startseite. */
async function glyphenPruefen(wo) {
  const treffer = await seite.evaluate((liste) => {
    const t = new Set()
    const w = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT)
    let n
    while ((n = w.nextNode())) {
      // Skripte und Stile tragen keinen sichtbaren Text
      const el = n.parentElement
      if (el && /^(SCRIPT|STYLE)$/.test(el.tagName)) continue
      for (const c of liste) if (n.nodeValue.includes(c)) t.add(`${c} in „${n.nodeValue.trim().slice(0, 60)}“`)
    }
    return [...t]
  }, FEHLENDE_GLYPHEN).catch(() => [])
  for (const t of treffer) glyphen.add(`${wo}: ${t}`)
}

// Tooltips: Diagramme rendern ihre Sprechblasen erst beim Überfahren, und
// genau dort saß ein fehlender Import (euroKompaktDelta im Tornado), den
// kein Klickpfad je erreicht hätte. Deshalb wird jedes sichtbare Diagramm
// einmal quer überfahren.
async function ueberfahren() {
  const diagramme = seite.locator('.vg-diagramm')
  const anzahl = await diagramme.count()
  for (let i = 0; i < anzahl; i++) {
    const kasten = await diagramme.nth(i).boundingBox().catch(() => null)
    if (!kasten || kasten.width < 60) continue
    for (const anteil of [0.2, 0.4, 0.6, 0.8]) {
      await seite.mouse.move(kasten.x + kasten.width * anteil, kasten.y + kasten.height * 0.5)
      await seite.waitForTimeout(90)
    }
  }
}

// Tafeln: Kopfband, Tabellenzellen mit Info-Tips, Reglernamen, Säulen mit
// <title> — die Maus fährt jede Tafel in einem 3×3-Raster ab, dazu jedes
// Diagramm in ihr. Die Tafel wird vorher ins Bild geholt, weil Sprechblasen
// außerhalb des Fensters nicht gerendert werden.
async function tafelnAnfahren() {
  const tafeln = seite.locator('.vg-tafel')
  const anzahl = await tafeln.count()
  for (let i = 0; i < anzahl; i++) {
    const tafel = tafeln.nth(i)
    await tafel.scrollIntoViewIfNeeded().catch(() => {})
    await seite.waitForTimeout(80)
    const kasten = await tafel.boundingBox().catch(() => null)
    if (!kasten || kasten.width < 60) continue
    for (const ay of [0.08, 0.35, 0.62, 0.88]) {
      for (const ax of [0.15, 0.5, 0.85]) {
        await seite.mouse.move(kasten.x + kasten.width * ax, kasten.y + kasten.height * ay)
        await seite.waitForTimeout(60)
      }
    }
  }
  await ueberfahren()
  await seite.mouse.move(2, 2)
}

/** Regler per Tastatur bewegen — dieselben Ereignisse wie beim Nutzer. */
async function ziehen(label, schritte, richtung = 'ArrowRight') {
  const regler = seite.locator(`.vg-regler-bahn input[type="range"][aria-label="${label}"]`).first()
  if (await regler.count() === 0) { nichtGefunden.push(`Kasten: Regler „${label}“ nicht gefunden`); return }
  await regler.scrollIntoViewIfNeeded()
  await regler.focus()
  for (let i = 0; i < schritte; i++) {
    await seite.keyboard.press(richtung)
    await seite.waitForTimeout(40)
  }
  await seite.waitForTimeout(450)
}

let abbruch = null
try {
  await seite.goto(URL, { waitUntil: 'networkidle' })
  await seite.keyboard.press('Escape')
  await glyphenPruefen('Lagebild')

  for (const n of [NAV_KASTEN, 'Umstellungstool', 'Fassungen', 'Lagebild']) await nav(n)

  // --------------------------------------------------- Simulationskasten
  await nav(NAV_KASTEN)
  await erwarte('.vg-kasten-tafeln', 'Kasten')
  await erwarte('.vg-kasten-tafeln .vg-tafel', 'Kasten')
  await erwarte('.vg-staffel-eingabe', 'Kasten (Staffeltabelle)')
  await glyphenPruefen('Kasten')

  // Regler ziehen: AP Leben nach links, AP Komposit nach rechts
  await ziehen('AP Leben', 6, 'ArrowLeft')
  await ziehen('AP Komposit', 6, 'ArrowRight')

  // Stufensatz eintippen: Stufe 4 auf 25 %, dann per Pfeil hoch schrittet.
  // Nur die Satz-Spalte zählen — Schwellen sind ebenfalls .vg-staffel-eingabe.
  const stufe4 = seite.locator('.vg-staffel td[data-spalte="neu"] .vg-staffel-eingabe').nth(3)
  if (await stufe4.count()) {
    await stufe4.scrollIntoViewIfNeeded()
    await stufe4.fill('25')
    await stufe4.press('Enter')
    await seite.waitForTimeout(450)
    await stufe4.focus()
    await seite.keyboard.press('ArrowUp')
    await seite.waitForTimeout(300)
  }

  // Beispielhaus wechseln
  const auswahl = seite.locator('select[aria-label="Beispielhaus wählen"]')
  if (await auswahl.count()) {
    await auswahl.selectOption('leipzig')
    await seite.waitForTimeout(500)
    await auswahl.selectOption('osd')
    await seite.waitForTimeout(300)
  } else {
    nichtGefunden.push('Kasten: Auswahl „Beispielhaus wählen“ nicht gefunden')
  }

  // Weitere Stellhebel aufklappen, Budgetneutralität, Szenario per Pfeil
  await pflichtKnopf(/Weitere Stellhebel/, 'Kasten')
  await pflichtKnopf(/Referenzvergleich auf null stellen/, 'Kasten')
  await seite.evaluate(() => document.activeElement?.blur?.())
  await seite.keyboard.press('ArrowRight')
  await seite.waitForTimeout(400)

  // Alle Tafeln anfahren (Eingabe- und Wirkungs-Tafeln, Verlauf, Streifen)
  await tafelnAnfahren()
  await glyphenPruefen('Kasten (verändert)')

  // Beschlussvorlage als Schublade öffnen und schließen
  await seite.evaluate(() => window.scrollTo(0, 0))
  if (await pflichtKnopf(/Beschlussvorlage/, 'Kasten', 600)) {
    await erwarte('.vg-schublade-koerper', 'Kasten (Beschlussvorlage)')
    await glyphenPruefen('Kasten (Beschlussvorlage)')
    await seite.keyboard.press('Escape')
    await seite.waitForTimeout(300)
  }

  // --------------------------------------------------- Umstellungstool
  await nav('Umstellungstool')
  for (const a of [/^Kacheln/, /^Verteilung/, /^Tabelle/]) await pflichtKnopf(a, 'Umstellungstool')
  await ueberfahren()
  await glyphenPruefen('Umstellungstool')
  await seite.locator('tbody tr').first().click({ timeout: 8000 })
  await seite.waitForTimeout(600)

  // --------------------------------------------------- Institutsakte
  await erwarte('.vg-akte-tafeln', 'Akte (Übersicht)')
  await erwarte('.vg-akte-tafeln .vg-tafel', 'Akte (Übersicht)')
  await erwarte('.vg-sb-stapel', 'Akte (Steuerblock, Stapelbalken)')
  await erwarte('.vg-sb-stammdaten', 'Akte (Steuerblock, Stammdaten)')
  await tafelnAnfahren()
  await glyphenPruefen('Akte (Übersicht)')

  for (const t of ['Verlauf 2028', 'Argumente', 'Vertriebspartner', 'Kennzahlen', 'Übersicht']) {
    await pflichtKnopf(new RegExp(`^${t}`), 'Akte', 500)
    await ueberfahren()
    await glyphenPruefen(`Akte (${t})`)
  }
  // Wasserfall liegt zugeklappt im Reiter Verlauf
  await pflichtKnopf(/^Verlauf 2028/, 'Akte')
  await knopf(/Wie die Veränderung zustande kommt/)
  await ueberfahren()
  await pflichtKnopf(/^Übersicht/, 'Akte')

  await pflichtKnopf(/Verhandlungsmodus/, 'Akte', 600)
  await ueberfahren()
  await seite.keyboard.press('Escape')
  await seite.waitForTimeout(300)

  // Lagebild: Diagramme überfahren
  await nav('Lagebild')
  await ueberfahren()

  // Grundlagen
  await knopf(/Grundlagen/)
  await seite.waitForTimeout(400)
  await glyphenPruefen('Grundlagen')

  // Tafelprobe (nur im Hash erreichbar; fehlt die Route, ist die Seite leer)
  await seite.goto(`${URL}#/tafelprobe`, { waitUntil: 'networkidle' }).catch(() => {})
  await seite.waitForTimeout(400)
  if (await seite.locator('.vg-tafel').count()) {
    await tafelnAnfahren()
    await glyphenPruefen('Tafelprobe')
  }
} catch (e) {
  // Ein Absturz nimmt die Navigation mit; der nächste Klick läuft dann in
  // einen Timeout. Der eigentliche Befund steht in `fehler` — der Timeout
  // ist nur die Folge und darf den Bericht nicht verschlucken.
  abbruch = String(e).split('\n')[0]
}

// Waagerechter Überlauf: bei 1600, 1280 und 1024 px darf keine Ansicht
// breiter sein als das Fenster (die Topbar zog als Rasterkind mit
// min-width: auto einmal die ganze Anwendung auf). Zusätzlich darf in
// Tafelraster, Tafel und Steuerblock nichts breiter sein als sein Kasten —
// sonst wäre etwas abgeschnitten oder scrollte seitlich, was die
// Tafelsprache ausschließt.
//
// Gemessen werden drei Klassen von Kästen:
//   1. Tafelraster, Tafel, Steuerblock selbst und die bekannten Rahmen
//      (Vergleichstabelle, Staffeltabelle, Blockmitte) — feste Liste.
//   2. Jeder Scrollrahmen darin, also jedes Element, dessen berechnetes
//      overflow-x `auto` oder `scroll` ist. Diese Rahmen fangen den Überlauf
//      ab, ohne dass der Elternkasten breiter würde — die Staffeltabelle im
//      Kasten (425/389 px) und die Blockmitte der Akte (300/296 px) blieben
//      so unbemerkt, weil nur die Tafel gemessen wurde.
//   3. Starke Kappungen: Elemente mit text-overflow: ellipsis, in denen
//      weniger als die Hälfte des Textes (oder weniger als 48 px) sichtbar
//      ist, und zweizeilig geklemmte Werte (-webkit-line-clamp), die eine
//      dritte Zeile verschlucken. Milde Ellipsen bleiben erlaubt.
// Weiche Kappungen mit Ellipse zählen in 1. und 2. bewusst nicht mit —
// ihr scrollWidth ist immer größer, das ist die Absicht der Ellipse.
const ueberlauf = []
const kappungen = []
const ZIELE = ['start', 'simulation', 'umstellung', 'umstellung/osd', 'umstellung/vergleich/osd,leipzig,erzgebirge', 'fassungen', 'grundlagen']
for (const breite of [1600, 1280, 1024]) {
  await seite.setViewportSize({ width: breite, height: 1000 })
  for (const ziel of ZIELE) {
    await seite.goto(`${URL}#/${ziel}`, { waitUntil: 'networkidle' }).catch(() => {})
    await seite.waitForTimeout(400)
    const m = await seite.evaluate(() => {
      const innen = []
      const gekappt = []
      const gesehen = new Set()
      // Ort einer Messung: die Tafel (aria-label = Titel) oder der Steuerblock
      const ort = (el) => {
        const tafel = el.closest('.vg-tafel')
        if (tafel) return `Tafel „${tafel.getAttribute('aria-label') || '?'}“`
        if (el.closest('.vg-steuerblock')) return 'Steuerblock'
        return 'Raster'
      }
      const name = (el) => {
        const klassen = [...el.classList].filter(k => k.startsWith('vg-')).slice(0, 2).join('.')
        return klassen || el.tagName.toLowerCase()
      }
      const sichtbar = (el) => el.clientWidth > 0 && el.getClientRects().length > 0
      const melden = (el, grund) => {
        if (gesehen.has(el)) return
        gesehen.add(el)
        innen.push(`${ort(el)}: ${name(el)} ${el.scrollWidth}/${el.clientWidth} px${grund ? ` (${grund})` : ''}`)
      }

      // 1. Feste Liste: Raster, Tafel, Block und die bekannten Rahmen
      const FEST = '.vg-tafeln, .vg-tafel, .vg-steuerblock, .vg-vergleich-rahmen, .vg-staffel-rahmen, .vg-kasten-staffel, .vg-sb-mitte'
      for (const el of document.querySelectorAll(FEST)) {
        if (!sichtbar(el)) continue
        if (el.scrollWidth > el.clientWidth + 1) melden(el, '')
      }

      // Kandidaten für 2. und 3.: alles in Raster, Tafel und Block — als
      // Menge, weil das Raster seine Tafeln enthält und jedes Element sonst
      // mehrfach gemessen würde. Formularfelder und SVG-Innereien tragen kein
      // aussagekräftiges scrollWidth und bleiben außen vor.
      const kandidaten = new Set()
      for (const wurzel of document.querySelectorAll('.vg-tafeln, .vg-tafel, .vg-steuerblock')) {
        for (const el of wurzel.querySelectorAll('*')) {
          if (/^(SELECT|INPUT|TEXTAREA|OPTION|SVG|CANVAS)$/i.test(el.tagName)) continue
          if (el.closest('svg')) continue
          if (sichtbar(el)) kandidaten.add(el)
        }
      }

      for (const el of kandidaten) {
        const st = getComputedStyle(el)
        const ox = st.overflowX

        // 2. Scrollrahmen: overflow-x auto oder scroll. overflow-y: auto
        //    macht overflow-x rechnerisch ebenfalls auto — die Blockmitte
        //    zählt damit mit, ohne eigens genannt zu sein. Ellipsen sind
        //    keine Scrollrahmen, ihr scrollWidth ist immer größer.
        if ((ox === 'auto' || ox === 'scroll') && st.textOverflow !== 'ellipsis') {
          if (el.scrollWidth > el.clientWidth + 1) melden(el, 'Scrollrahmen')
          continue
        }
        if (gesehen.has(el)) continue

        // 3. Starke Kappungen: Ellipse mit weniger als der Hälfte sichtbar
        //    (oder unter 48 px mit mehr als 8 px Fehlbreite — „Kfz“ mit
        //    einem Pixel zu wenig ist kein Befund), oder eine geklemmte
        //    Zeile, die mehr Zeilen bräuchte, als ihr zugestanden sind.
        const text = (el.textContent || '').trim()
        if (!text) continue
        if (st.textOverflow === 'ellipsis' && ox !== 'visible' && el.scrollWidth > el.clientWidth + 1) {
          const anteil = el.clientWidth / el.scrollWidth
          if (anteil < 0.5 || (el.clientWidth < 48 && el.scrollWidth - el.clientWidth > 8)) {
            gesehen.add(el)
            gekappt.push(`${ort(el)}: ${name(el)} „${text.slice(0, 40)}“ ${el.scrollWidth}/${el.clientWidth} px (${Math.round(anteil * 100)} % sichtbar)`)
          }
          continue
        }
        const klemme = st.webkitLineClamp
        if (klemme && klemme !== 'none' && st.overflowY !== 'visible' && el.scrollHeight > el.clientHeight + 2) {
          gesehen.add(el)
          gekappt.push(`${ort(el)}: ${name(el)} „${text.slice(0, 40)}“ ${el.scrollHeight}/${el.clientHeight} px hoch (${klemme} Zeilen geklemmt)`)
        }
      }
      return { doc: document.documentElement.scrollWidth, fenster: window.innerWidth, innen, gekappt }
    }).catch(() => null)
    if (!m) continue
    if (m.doc > m.fenster) ueberlauf.push(`${breite} px, ${ziel}: Dokument ${m.doc} px breit`)
    for (const i of m.innen.slice(0, 6)) ueberlauf.push(`${breite} px, ${ziel}: ${i}`)
    if (m.innen.length > 6) ueberlauf.push(`${breite} px, ${ziel}: … und ${m.innen.length - 6} weitere`)
    for (const k of m.gekappt.slice(0, 6)) kappungen.push(`${breite} px, ${ziel}: ${k}`)
    if (m.gekappt.length > 6) kappungen.push(`${breite} px, ${ziel}: … und ${m.gekappt.length - 6} weitere`)
  }
}
await seite.setViewportSize({ width: 1600, height: 1000 })
await seite.goto(`${URL}#/start`, { waitUntil: 'networkidle' }).catch(() => {})
await glyphenPruefen('Lagebild (Ende)')

await browser.close()

const zeig = (titel, liste) => {
  console.log(`${titel}: ${liste.length}`)
  liste.slice(0, 10).forEach(x => console.log('   ', x))
}
const glyphenListe = [...glyphen]
if (abbruch) console.log('Klickstrecke abgebrochen:', abbruch)
zeig('Laufzeitfehler', fehler)
zeig('Konsolenfehler', konsole)
zeig('HTTP ab 400', http)
zeig('Nicht gefunden (Kasten, Akte)', nichtGefunden)
zeig('Fehlende Glyphen im DOM', glyphenListe)
zeig('Waagerechter Überlauf (Dokument, Tafel, Block, Scrollrahmen)', ueberlauf)
zeig('Starke Kappungen (weniger als die Hälfte sichtbar)', kappungen)

const summe = fehler.length + konsole.length + http.length + nichtGefunden.length
  + glyphenListe.length + ueberlauf.length + kappungen.length + (abbruch ? 1 : 0)
console.log(summe === 0 ? '\nRauchtest bestanden.' : '\nRauchtest FEHLGESCHLAGEN.')
process.exit(summe === 0 ? 0 : 1)
