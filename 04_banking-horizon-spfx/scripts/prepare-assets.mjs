// ─────────────────────────────────────────────────────────────────────────────
// prepare-assets — baut die App (IIFE-Variante, siehe vite.spfx.config.ts),
// kopiert den Build nach ./appassets/app und optimiert große PNGs per
// Palette-Quantisierung (sharp/libimagequant), damit das .sppkg unter der
// GitHub-Grenze von 100 MB pro Datei bleibt.
//
// Die Dateien werden dabei FLACH und mit Versions-Präfix abgelegt
// (z. B. images/rooms/it.png → v120_images_rooms_it.png):
//   · flach, weil im Ziel-Tenant nachweislich nur Dateien auf Wurzelebene der
//     ClientSideAssets-Bibliothek ausgeliefert werden (Unterordner des Pakets
//     kamen dort nie an → 404 → Blackscreen),
//   · versionspräfixiert, weil SharePoint beim Solution-Update die Assets
//     teils nicht neu extrahiert — neue Dateinamen pro Release umgehen jeden
//     Stale-Zustand,
//   · OPC-konform bereinigt (keine Leerzeichen etc.), sonst lehnt SharePoint
//     das Paket als "Invalid App package" ab.
// Alle Referenzen (statische Pfade, gehashte new-URL()-Assets, dynamische
// Verzeichnis-Präfixe wie "./images/rooms/"+id) werden in den Text-Assets in
// einem Single-Pass-Rewrite passend umgeschrieben.
// ─────────────────────────────────────────────────────────────────────────────
import { promises as fs } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { execSync } from 'node:child_process'
import sharp from 'sharp'

const here = path.dirname(fileURLToPath(import.meta.url))
const root = path.resolve(here, '..')
const APP_DIR = path.resolve(root, '../03_banking-horizon')
const SRC = path.join(APP_DIR, 'dist-spfx')
const OUT = path.join(root, 'appassets', 'app')
const GENERATED = path.join(root, 'src', 'webparts', 'bankingHorizon2030', 'generated', 'appFiles.ts')

// Nicht referenzierte bzw. für das WebPart unnötige Dateien
const SKIP = new Set(['index.html'])

// PNGs oberhalb dieser Größe werden quantisiert
const PNG_THRESHOLD = 200 * 1024

const sanitizeSegment = (s) => s.replace(/[^A-Za-z0-9._-]/g, '_')

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

const escapeRegExp = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

async function main() {
  const pkg = JSON.parse(await fs.readFile(path.join(root, 'package.json'), 'utf8'))
  const prefix = 'v' + pkg.version.split('.').join('') + '_'
  console.log(`prepare-assets: Version ${pkg.version} → Datei-Präfix "${prefix}"`)

  console.log('Baue App (IIFE-Variante) …')
  execSync('npx vite build --config vite.spfx.config.ts', { cwd: APP_DIR, stdio: 'inherit' })

  await fs.rm(path.join(root, 'appassets'), { recursive: true, force: true })
  await fs.mkdir(OUT, { recursive: true })

  const files = await walk(SRC)
  let inTotal = 0
  let outTotal = 0
  // Ersetzungs-Map: Original-Referenz → neue Referenz (Single-Pass-Rewrite)
  const replacements = new Map()
  const dirs = new Set()

  for (const file of files) {
    const rel = path.relative(SRC, file)
    if (SKIP.has(rel.split(path.sep)[0]) || SKIP.has(path.basename(file))) continue
    const relPosix = rel.split(path.sep).join('/')
    const flat = prefix + relPosix.split('/').map(sanitizeSegment).join('_')
    const dest = path.join(OUT, flat)

    replacements.set(`./${relPosix}`, `./${flat}`)
    // Gehashte Vite-Assets werden per new URL("<basename>", scriptBase)
    // relativ zum Skript aufgelöst — das Skript liegt künftig flach daneben.
    if (relPosix.startsWith('assets/')) {
      replacements.set(relPosix.slice('assets/'.length), flat)
    }
    let d = path.posix.dirname(relPosix)
    while (d && d !== '.') {
      dirs.add(d)
      d = path.posix.dirname(d)
    }

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
        console.warn(`  ! Quantisierung fehlgeschlagen, kopiere Original: ${relPosix} (${err.message})`)
      }
    }
    await fs.copyFile(file, dest)
    outTotal += stat.size
  }

  // Dynamische Pfad-Konstruktionen wie `./images/rooms/${id}.png`:
  // Verzeichnis-Präfix mitsamt Slash auf das flache Namensschema mappen.
  for (const d of dirs) {
    replacements.set(`./${d}/`, `./${prefix}${d.split('/').map(sanitizeSegment).join('_')}_`)
  }

  // Single-Pass-Rewrite (längste Muster zuerst, keine Doppel-Ersetzungen)
  const patterns = [...replacements.keys()].sort((a, b) => b.length - a.length)
  const rx = new RegExp(patterns.map(escapeRegExp).join('|'), 'g')
  const textFiles = (await walk(OUT)).filter((f) => /\.(js|css|html|json|svg|map)$/i.test(f))
  for (const tf of textFiles) {
    const content = await fs.readFile(tf, 'utf8')
    const rewritten = content.replace(rx, (m) => replacements.get(m))
    if (rewritten !== content) await fs.writeFile(tf, rewritten)
  }

  // Entry-Dateien ermitteln (fester JS-Name aus vite.spfx.config.ts, genau
  // eine CSS-Datei wegen cssCodeSplit:false)
  const outNames = await fs.readdir(OUT)
  const js = `${prefix}assets_app.js`
  const cssFiles = outNames.filter((f) => f.endsWith('.css'))
  if (cssFiles.length !== 1) throw new Error(`Erwartet genau eine CSS-Datei, gefunden: ${cssFiles.join(', ') || 'keine'}`)
  const css = cssFiles[0]
  await fs.access(path.join(OUT, js))

  await fs.mkdir(path.dirname(GENERATED), { recursive: true })
  await fs.writeFile(
    GENERATED,
    [
      '// AUTO-GENERIERT von scripts/prepare-assets.mjs — nicht von Hand editieren.',
      '// Flache, versionspräfixierte Entry-Dateinamen des SPFx-App-Builds.',
      `export const APP_ENTRY_JS: string = '${js}';`,
      `export const APP_ENTRY_CSS: string = '${css}';`,
      ''
    ].join('\n')
  )

  const mb = (n) => (n / 1024 / 1024).toFixed(1)
  console.log(`prepare-assets: ${outNames.length} Dateien (flach), ${mb(inTotal)} MB → ${mb(outTotal)} MB`)
  console.log(`Entry: ${js} / ${css}`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
