// Entfernt Verzeichnis-Einträge (Namen mit '/' am Ende) aus dem .sppkg.
// Das .sppkg ist ein OPC-Paket: Part-URIs dürfen nicht mit '/' enden —
// SharePoint lehnt Pakete mit expliziten Ordner-Einträgen sonst mit
// "Part URI is not valid per rules defined in the Open Packaging
// Conventions specification" ab. Ordner entstehen hier durch die ins
// Paket kopierte App-Ordnerstruktur (ClientSideAssets/app/…).
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import AdmZip from 'adm-zip'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const sppkg = path.join(root, 'sharepoint', 'solution', 'banking-horizon-2030.sppkg')

const zin = new AdmZip(sppkg)
const zout = new AdmZip()
let dirs = 0
for (const entry of zin.getEntries()) {
  if (entry.isDirectory) {
    dirs++
    continue
  }
  zout.addFile(entry.entryName, entry.getData())
}
zout.writeZip(sppkg)
console.log(`strip-dir-entries: ${dirs} Ordner-Einträge entfernt, ${zout.getEntries().length} Datei-Einträge behalten.`)
