#!/usr/bin/env node
// Setzt die Speakernotes (Markdown) als PDF im A4-Format für den Vortrag:
// Seite 1 mit Rahmen, Ablauf und Vorbereitung, dann der Sprechtext mit
// Zeitmarken, Regieanweisungen und Kundenbeispielen, zuletzt der Anhang
// „Zahlen für Rückfragen“. Schrift: Uniform aus public/fonts, eingebettet.
//
// Aufruf:  node scripts/speakernotes-pdf.mjs [quelle.md] [ziel.pdf]
// Braucht Playwright mit Chromium (hier global: NODE_PATH=/opt/node22/lib/node_modules).
// HTML_ZIEL=<pfad> legt die gesetzte HTML-Datei ab (Grundlage für die DOCX-Umwandlung
// mit LibreOffice), PNG_ZIEL=<pfad> ein Bild der gesetzten Seiten zur Sichtprüfung.

import { readFileSync, writeFileSync } from 'node:fs'
import { resolve, dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { createRequire } from 'node:module'

// Playwright liegt hier global (NODE_PATH); ESM-Importe kennen NODE_PATH nicht,
// der CommonJS-Auflöser schon.
const { chromium } = createRequire(import.meta.url)('playwright')

const wurzel = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const quelle = resolve(process.argv[2] ?? join(wurzel, 'docs', 'speakernotes-vortrag-markt-vertrieb.md'))
const ziel = resolve(process.argv[3] ?? quelle.replace(/\.md$/, '.pdf'))
const stand = new Date().toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' })

const md = readFileSync(quelle, 'utf8')
if (md.includes('—')) throw new Error('Em-Dash im Quelltext')

// ---------- Markdown in Blöcke ----------
function inBloecke(text) {
  const z = text.split('\n')
  const out = []
  let i = 0
  while (i < z.length) {
    const l = z[i]
    if (!l.trim()) { i++; continue }
    if (l.startsWith('# ')) { out.push({ typ: 'h1', text: l.slice(2).trim() }); i++; continue }
    if (l.startsWith('## ')) { out.push({ typ: 'h2', text: l.slice(3).trim() }); i++; continue }
    if (l.trim() === '---') { out.push({ typ: 'hr' }); i++; continue }
    if (l.startsWith('|')) {
      const zeilen = []
      while (i < z.length && z[i].startsWith('|')) {
        if (!/^\|\s*-/.test(z[i])) zeilen.push(z[i].replace(/^\||\|$/g, '').split('|').map((c) => c.trim()))
        i++
      }
      out.push({ typ: 'tabelle', zeilen })
      continue
    }
    if (l.startsWith('- ')) {
      const punkte = []
      while (i < z.length && (z[i].startsWith('- ') || z[i].startsWith('  '))) {
        if (z[i].startsWith('- ')) punkte.push(z[i].slice(2).trim())
        else punkte[punkte.length - 1] += ' ' + z[i].trim()
        i++
      }
      out.push({ typ: 'liste', punkte })
      continue
    }
    const teile = []
    while (i < z.length && z[i].trim() && !/^(#{1,2} |\||- |---$)/.test(z[i])) { teile.push(z[i].trim()); i++ }
    out.push({ typ: 'p', text: teile.join(' ') })
  }
  return out
}

const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

// Sätze trennen für die Stichpunkt-Darstellung (gleiche Regeln wie
// src/notizen/parse.ts): Satzende, Leerraum, dann Großbuchstabe, Zahl oder
// öffnendes Anführungszeichen; Abkürzungen bleiben zusammen, sehr kurze Sätze
// hängen sich an den Vorgänger.
const ZWEITEILIG = [/z\. B\./g, /u\. a\./g, /d\. h\./g, /o\. Ä\./g, /i\. d\. R\./g]
const ABKUERZUNG = /(?:\bbzw|\bca|\bDr|\bProf|\bNr|\bMio|\bMrd|\bTsd|\bvs|\betc|\binkl|\bggf|\bevtl|\bsog|\busw|z\.\u00a0B|u\.\u00a0a|d\.\u00a0h|o\.\u00a0Ä|i\.\u00a0d\.\u00a0R)\.$/
function saetze(text) {
  let s = text
  for (const re of ZWEITEILIG) s = s.replace(re, (m) => m.replace(/ /g, '\u00a0'))
  const roh = s.split(/(?<=[.!?][“”"’)]?)\s+(?=[„"“(\[A-ZÄÖÜ0-9])/)
  const out = []
  for (const x of roh) {
    const prev = out[out.length - 1]
    if (prev !== undefined && ABKUERZUNG.test(prev)) out[out.length - 1] = prev + ' ' + x
    else out.push(x)
  }
  const res = []
  for (const x of out) {
    if (res.length && x.split(/\s+/).length < 4) res[res.length - 1] += ' ' + x
    else res.push(x)
  }
  return res.map((x) => x.replace(/\u00a0/g, ' '))
}
const stichpunkte = (text) => `<ul class="rede">${saetze(text).map((x) => `<li>${inline(x, { zahlen: true })}</li>`).join('')}</ul>`
function inline(s, { zahlen = false } = {}) {
  let t = esc(s)
  t = t.replace(/`([^`]+)`/g, '<code>$1</code>')
  t = t.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
  t = t.replace(/(https?:\/\/[^\s)]+)/g, '<a href="$1">$1</a>')
  if (zahlen) t = t.replace(/(\d[\d.]*(?: bis \d[\d.]*)? (?:Prozent|Euro|Bankkunden))/g, '<b>$1</b>')
  return t
}

// Drei Teile, getrennt durch die beiden Trennlinien: Vorspann, Rede, Anhang.
const teile = [[]]
for (const b of inBloecke(md)) {
  if (b.typ === 'hr') teile.push([])
  else teile[teile.length - 1].push(b)
}
const [vorspann, rede, anhang] = teile
if (!rede || !anhang) throw new Error('Erwartet werden zwei Trennlinien (---) im Quelltext')

const titel = vorspann.find((b) => b.typ === 'h1')?.text ?? 'Speakernotes'
const ablauf = rede
  .filter((b) => b.typ === 'h2')
  .map((b) => b.text.match(/^(\d+:\d\d)\s+(.+?)\s+\((.+)\)$/))
  .filter(Boolean)
  .map((m) => ({ marke: m[1], titel: m[2], dauer: m[3] }))

// ---------- Vorspann (Seite 1) ----------
let seite1 = `<h1>${inline(titel)}</h1><p class="untertitel">Vortragsfassung, Stand ${stand}</p>`
let ablaufGesetzt = false
for (const b of vorspann) {
  if (b.typ === 'h1') continue
  if (b.typ === 'p' && b.text.startsWith('Rahmen: ')) {
    seite1 += `<h3>Rahmen</h3><p>${inline(b.text.slice(8))}</p>`
    continue
  }
  if (b.typ === 'p' && b.text === 'Vorbereitung:') {
    if (!ablaufGesetzt) { seite1 += ablaufTabelle(); ablaufGesetzt = true }
    seite1 += '<h3>Vorbereitung</h3>'
    continue
  }
  if (b.typ === 'liste') { seite1 += `<ul>${b.punkte.map((p) => `<li>${inline(p)}</li>`).join('')}</ul>`; continue }
  if (b.typ === 'p') seite1 += `<p>${inline(b.text)}</p>`
}
if (!ablaufGesetzt) seite1 += ablaufTabelle()

function ablaufTabelle() {
  if (!ablauf.length) return ''
  return `<h3>Ablauf</h3><table class="ablauf">${ablauf
    .map((a) => `<tr><td>${a.marke}</td><td>${inline(a.titel)}</td><td>${inline(a.dauer)}</td></tr>`)
    .join('')}</table>`
}

// ---------- Rede ----------
let redeHtml = ''
let offen = false
for (const b of rede) {
  if (b.typ === 'h2') {
    if (offen) redeHtml += '</section>'
    const m = b.text.match(/^(\d+:\d\d)\s+(.+?)\s+\((.+)\)$/)
    redeHtml += m
      ? `<section class="abschnitt"><h2><span class="marke">${m[1]}</span><span>${inline(m[2])}</span><span class="dauer">${inline(m[3])}</span></h2>`
      : `<section class="abschnitt"><h2><span></span><span>${inline(b.text)}</span><span></span></h2>`
    offen = true
    continue
  }
  if (b.typ !== 'p') continue
  const t = b.text
  let m
  if (/^\[[^\]]*\]$/.test(t)) {
    redeHtml += `<p class="regie">${inline(t.slice(1, -1))}</p>`
  } else if ((m = t.match(/^\[(Optional[^\]]*)\]\s*(.+)$/))) {
    redeHtml += `<div class="kasten optional"><span class="etikett">${inline(m[1].replace(/[.:]$/, ''))}</span>${stichpunkte(m[2])}</div>`
  } else if ((m = t.match(/^\[([^\]]*)\]\s*(.+)$/))) {
    redeHtml += `<div class="kasten"><span class="etikett">${inline(m[1].replace(/[.:]$/, ''))}</span>${stichpunkte(m[2])}</div>`
  } else if (/^Die (erste|zweite|dritte) Hypothese:/.test(t)) {
    // Titelzeile einer Hypothese: bleibt beim folgenden Absatz und ist betont.
    redeHtml += `<p class="rede titelzeile">${inline(t, { zahlen: true })}</p>`
  } else {
    redeHtml += stichpunkte(t)
  }
}
if (offen) redeHtml += '</section>'

// ---------- Anhang ----------
let anhangHtml = ''
for (const b of anhang) {
  if (b.typ === 'h2') anhangHtml += `<h2><span></span><span>${inline(b.text)}</span><span></span></h2>`
  else if (b.typ === 'p') anhangHtml += `<p>${inline(b.text)}</p>`
  else if (b.typ === 'liste') anhangHtml += `<ul>${b.punkte.map((p) => `<li>${inline(p)}</li>`).join('')}</ul>`
  else if (b.typ === 'tabelle') {
    const [kopf, ...zeilen] = b.zeilen
    anhangHtml += `<table class="zahlen"><thead><tr>${kopf.map((c) => `<th>${inline(c)}</th>`).join('')}</tr></thead><tbody>${zeilen
      .map((r) => `<tr>${r.map((c) => `<td>${inline(c)}</td>`).join('')}</tr>`)
      .join('')}</tbody></table>`
  }
}

// ---------- Schrift und Seite ----------
const schrift = (datei) => `data:font/woff2;base64,${readFileSync(join(wurzel, 'public', 'fonts', datei)).toString('base64')}`
const html = `<!doctype html>
<html lang="de">
<head>
<meta charset="utf-8">
<title>${esc(titel)}</title>
<style>
@font-face { font-family: 'Uniform'; font-weight: 300; src: url('${schrift('uniform-light.woff2')}') format('woff2'); }
@font-face { font-family: 'Uniform'; font-weight: 400; src: url('${schrift('uniform-regular.woff2')}') format('woff2'); }
@font-face { font-family: 'Uniform'; font-weight: 500; src: url('${schrift('uniform-medium.woff2')}') format('woff2'); }
:root { --ink: #1c1a17; --ink-2: #4a4640; --ink-3: #7a746b; --linie: #d9d5cd; --akzent: #046a38; --tint: #f3f1ec; }
html { font-size: 11.5pt; }
body { margin: 0; font-family: 'Uniform', 'Liberation Sans', Arial, sans-serif; font-weight: 400; color: var(--ink); line-height: 1.5; }
h1 { font-size: 20pt; font-weight: 500; line-height: 1.2; margin: 0 0 4pt; letter-spacing: -0.01em; }
.untertitel { color: var(--ink-3); font-size: 10pt; margin: 0 0 10pt; }
.vorspann p, .vorspann li { font-size: 9.5pt; line-height: 1.4; color: var(--ink-2); }
.vorspann p { margin: 0 0 4pt; }
.vorspann ul { padding-left: 12pt; margin: 0; }
.vorspann li { margin: 1pt 0; }
h3 { font-size: 9pt; font-weight: 500; letter-spacing: 0.1em; text-transform: uppercase; color: var(--ink-3); margin: 10pt 0 3pt; }
table.ablauf { border-collapse: collapse; width: 100%; font-size: 9.5pt; }
table.ablauf td { padding: 2.5pt 8pt 2.5pt 0; border-bottom: 1px solid var(--linie); vertical-align: top; color: var(--ink-2); }
table.ablauf td:first-child { font-family: 'Liberation Mono', monospace; font-weight: 500; color: var(--akzent); white-space: nowrap; width: 3em; }
table.ablauf td:last-child { color: var(--ink-3); white-space: nowrap; text-align: right; padding-right: 0; }
.seite { page-break-before: always; }
section.abschnitt { margin-top: 16pt; }
section.abschnitt:first-child { margin-top: 0; }
h2 { display: grid; grid-template-columns: auto 1fr auto; align-items: baseline; gap: 10pt; font-size: 13.5pt; font-weight: 500; line-height: 1.25; margin: 0 0 8pt; padding-top: 9pt; border-top: 1.5pt solid var(--ink); page-break-after: avoid; }
h2 .marke { font-family: 'Liberation Mono', monospace; font-size: 11pt; color: var(--akzent); }
h2 .dauer { font-size: 9.5pt; font-weight: 400; color: var(--ink-3); }
p { margin: 0 0 8pt; page-break-inside: avoid; }
p.rede { font-size: 12pt; line-height: 1.55; }
p.rede b { font-weight: 500; }
ul.rede { list-style: none; margin: 0 0 8pt; padding: 0; }
ul.rede li { position: relative; padding-left: 14pt; margin: 0 0 9pt; font-size: 12pt; line-height: 1.45; page-break-inside: avoid; }
ul.rede li::before { content: ''; position: absolute; left: 2pt; top: 0.55em; width: 5pt; height: 5pt; border-radius: 50%; background: var(--akzent); }
ul.rede li b { font-weight: 500; }
.kasten ul.rede { margin: 0; }
p.rede.titelzeile { font-weight: 500; break-after: avoid; page-break-after: avoid; }
p.regie { font-size: 10pt; font-weight: 300; color: var(--ink-3); border-left: 2pt solid var(--linie); padding-left: 8pt; margin: 10pt 0 8pt; page-break-after: avoid; }
.kasten { background: var(--tint); border-radius: 4pt; padding: 8pt 10pt; margin: 2pt 0 10pt; page-break-inside: avoid; }
.kasten .etikett { display: block; font-size: 8.5pt; font-weight: 500; letter-spacing: 0.08em; text-transform: uppercase; color: var(--akzent); margin-bottom: 3pt; }
.kasten p { margin: 0; }
.kasten ul.rede li:last-child { margin-bottom: 0; }
.kasten.optional { background: none; border: 1pt dashed var(--linie); }
.anhang p, .anhang li { font-size: 9pt; line-height: 1.4; color: var(--ink-2); margin-bottom: 5pt; }
.anhang ul { margin: 0; }
.anhang ul { padding-left: 14pt; }
table.zahlen { border-collapse: collapse; width: 100%; font-size: 9pt; line-height: 1.35; margin: 2pt 0 8pt; page-break-inside: avoid; }
table.zahlen th { text-align: left; font-weight: 500; border-bottom: 1.5pt solid var(--ink); padding: 3pt 8pt 3pt 0; }
table.zahlen td { padding: 2pt 8pt 2pt 0; border-bottom: 1px solid var(--linie); vertical-align: top; color: var(--ink-2); }
table.zahlen td:last-child, table.zahlen th:last-child { white-space: nowrap; text-align: right; padding-right: 0; font-family: 'Liberation Mono', monospace; }
code { font-family: 'Liberation Mono', monospace; font-size: 0.92em; }
a { color: var(--ink-3); text-decoration: none; word-break: break-all; }
</style>
</head>
<body>
<div class="vorspann">${seite1}</div>
<div class="seite rede">${redeHtml}</div>
<div class="seite anhang">${anhangHtml}</div>
</body>
</html>`

if (process.env.HTML_ZIEL) writeFileSync(resolve(process.env.HTML_ZIEL), html)

const browser = await chromium.launch()
try {
  const page = await browser.newPage({ viewport: { width: 794, height: 1123 } })
  await page.setContent(html, { waitUntil: 'load' })
  await page.evaluate(() => document.fonts.ready)
  await page.emulateMedia({ media: 'print' })
  await page.pdf({
    path: ziel,
    format: 'A4',
    printBackground: true,
    displayHeaderFooter: true,
    headerTemplate: '<span></span>',
    footerTemplate: `<div style="width:100%;box-sizing:border-box;padding:0 20mm;font-family:'Liberation Sans',Arial,sans-serif;font-size:8pt;color:#7a746b;display:flex;justify-content:space-between;"><span>Banking Horizon · Speakernotes Markt &amp; Vertrieb</span><span><span class="pageNumber"></span> / <span class="totalPages"></span></span></div>`,
    margin: { top: '17mm', right: '20mm', bottom: '19mm', left: '20mm' },
  })
  if (process.env.PNG_ZIEL) {
    await page.emulateMedia({ media: 'screen' })
    await page.screenshot({ path: resolve(process.env.PNG_ZIEL), fullPage: true })
  }
} finally {
  await browser.close()
}
const seiten = (readFileSync(ziel).toString('latin1').match(/\/Type\s*\/Page(?!s)/g) || []).length
console.log(`PDF geschrieben: ${ziel} (${seiten} Seiten)`)
