// Kopiert die vorbereiteten App-Assets (appassets/app) in das Deploy-
// Verzeichnis des SPFx-Builds, damit sie beim `gulp package-solution --ship`
// mit in die ClientSideAssets des .sppkg gepackt werden. Je nach SPFx-Version
// heißt das Verzeichnis temp/deploy oder release/assets.
import { promises as fs } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const candidates = [path.join(root, 'release', 'assets'), path.join(root, 'temp', 'deploy')]

async function exists(p) {
  try { await fs.access(p); return true } catch { return false }
}

const src = path.join(root, 'appassets', 'app')
if (!(await exists(src))) {
  console.error('appassets/app fehlt — zuerst `npm run prepare-assets` ausführen.')
  process.exit(1)
}

let copied = false
for (const dir of candidates) {
  if (await exists(dir)) {
    await fs.cp(src, path.join(dir, 'app'), { recursive: true })
    console.log(`App-Assets nach ${path.relative(root, dir)}/app kopiert.`)
    copied = true
    break
  }
}
if (!copied) {
  console.error('Kein Deploy-Verzeichnis gefunden — zuerst `gulp bundle --ship` ausführen.')
  process.exit(1)
}
