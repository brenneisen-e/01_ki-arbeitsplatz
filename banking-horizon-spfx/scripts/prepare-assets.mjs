// ─────────────────────────────────────────────────────────────────────────────
// prepare-assets — kopiert den Build der App (../bank-der-zukunft-2035/dist)
// nach ./appassets/app und optimiert dabei große PNGs per Palette-Quantisierung
// (sharp/libimagequant), damit das fertige .sppkg unter der GitHub-Grenze von
// 100 MB pro Datei bleibt. Außerdem werden die gehashten Entry-Dateinamen aus
// dist/index.html ausgelesen und nach src/…/generated/appFiles.ts geschrieben,
// damit das WebPart sie im iframe-Dokument referenzieren kann.
// ─────────────────────────────────────────────────────────────────────────────
import { promises as fs } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'

const here = path.dirname(fileURLToPath(import.meta.url))
const root = path.resolve(here, '..')
const SRC = path.resolve(root, '../bank-der-zukunft-2035/dist')
const OUT = path.join(root, 'appassets', 'app')
const GENERATED = path.join(root, 'src', 'webparts', 'bankingHorizon2030', 'generated', 'appFiles.ts')

// Nicht referenzierte bzw. für das WebPart unnötige Dateien
const SKIP = new Set(['plaza-video.mp4', 'index.html'])

// PNGs oberhalb dieser Größe werden quantisiert
const PNG_THRESHOLD = 200 * 1024

// Das .sppkg ist ein OPC-Paket (Open Packaging Conventions): Part-URIs dürfen
// keine Leerzeichen o. ä. enthalten, sonst lehnt SharePoint das Paket als
// "Invalid App package" ab. Dateinamen werden deshalb segmentweise bereinigt
// und alle Referenzen darauf in Text-Assets (JS/CSS/HTML) mit umgeschrieben.
const sanitizeSegment = (s) => s.replace(/[^A-Za-z0-9._-]/g, '_')
const sanitizeRel = (relPosix) => relPosix.split('/').map(sanitizeSegment).join('/')

async function walk(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true })
  const files = []
  for (const e of entries) {
    const p = path.join(dir, e.name)
    if (e.isDirectory()) files.push(...(await walk(p)))
    else files.push(p)
  }
  return files
}

async function main() {
  await fs.rm(path.join(root, 'appassets'), { recursive: true, force: true })

  const files = await walk(SRC)
  let inTotal = 0
  let outTotal = 0
  const renames = []

  for (const file of files) {
    const rel = path.relative(SRC, file)
    if (SKIP.has(rel.split(path.sep)[0]) || SKIP.has(path.basename(file))) continue
    const relPosix = rel.split(path.sep).join('/')
    const relClean = sanitizeRel(relPosix)
    if (relClean !== relPosix) renames.push([relPosix, relClean])
    const dest = path.join(OUT, ...relClean.split('/'))
    await fs.mkdir(path.dirname(dest), { recursive: true })

    const stat = await fs.stat(file)
    inTotal += stat.size

    if (file.toLowerCase().endsWith('.png') && stat.size > PNG_THRESHOLD) {
      try {
        const buf = await sharp(file)
          .png({ palette: true, quality: 90, compressionLevel: 9, effort: 8 })
          .toBuffer()
        if (buf.length < stat.size) {
          await fs.writeFile(dest, buf)
          outTotal += buf.length
          continue
        }
      } catch (err) {
        console.warn(`  ! Quantisierung fehlgeschlagen, kopiere Original: ${rel} (${err.message})`)
      }
    }
    await fs.copyFile(file, dest)
    outTotal += stat.size
  }

  // Referenzen auf umbenannte Dateien in allen Text-Assets umschreiben
  // (längste Pfade zuerst, damit kein Teilpfad einen längeren überschreibt)
  renames.sort((a, b) => b[0].length - a[0].length)
  if (renames.length > 0) {
    const textFiles = (await walk(OUT)).filter((f) => /\.(js|css|html|json|svg|map)$/i.test(f))
    for (const tf of textFiles) {
      let content = await fs.readFile(tf, 'utf8')
      let changed = false
      for (const [from, to] of renames) {
        if (content.includes(from)) {
          content = content.split(from).join(to)
          changed = true
        }
      }
      if (changed) await fs.writeFile(tf, content)
    }
    console.log(`prepare-assets: ${renames.length} Dateinamen OPC-konform bereinigt (Leerzeichen etc.)`)
  }

  // Entry-Dateinamen aus index.html auslesen
  const html = await fs.readFile(path.join(SRC, 'index.html'), 'utf8')
  const js = html.match(/src="\.\/(assets\/[^"]+\.js)"/)?.[1]
  const css = html.match(/href="\.\/(assets\/[^"]+\.css)"/)?.[1]
  if (!js || !css) throw new Error('Entry-JS/CSS in dist/index.html nicht gefunden')

  await fs.mkdir(path.dirname(GENERATED), { recursive: true })
  await fs.writeFile(
    GENERATED,
    [
      '// AUTO-GENERIERT von scripts/prepare-assets.mjs — nicht von Hand editieren.',
      '// Gehashte Entry-Dateinamen des Vite-Builds aus bank-der-zukunft-2035/dist.',
      `export const APP_ENTRY_JS: string = '${js}';`,
      `export const APP_ENTRY_CSS: string = '${css}';`,
      ''
    ].join('\n')
  )

  const mb = (n) => (n / 1024 / 1024).toFixed(1)
  console.log(`prepare-assets: ${files.length} Dateien, ${mb(inTotal)} MB → ${mb(outTotal)} MB`)
  console.log(`Entry: ${js} / ${css}`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
