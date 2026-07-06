#!/usr/bin/env node
/* eslint-disable no-console */
// ─────────────────────────────────────────────────────────────────────────────
// meshy-generate.mjs
//
// Erzeugt EINMALIG das geriggte, animierte 3D-Modell des Leitfragen-Consultants
// über die Meshy-API und legt es als public/models/consultant.glb ab.
//
// Pipeline:
//   1. Text-to-3D  (Preview)   → grobe Geometrie
//   2. Text-to-3D  (Refine)    → texturiertes Modell (PBR)
//   3. Auto-Rigging            → humanoides Skelett wird eingesetzt
//   4. Animation               → Idle-/Gestik-Clip auf dem Rig
//   5. Download GLB            → public/models/consultant.glb
//
// Voraussetzung:  Umgebungsvariable MESHY_API_KEY (https://www.meshy.ai/api)
//
// Nutzung:
//   MESHY_API_KEY=msy_xxx node scripts/meshy-generate.mjs
//   MESHY_API_KEY=msy_xxx node scripts/meshy-generate.mjs --prompt "..." --skip-rig
//
// Flags:
//   --prompt "<text>"   eigener Prompt (sonst DEFAULT_PROMPT)
//   --style realistic   Kunststil (realistic | sculpture)  [Default: realistic]
//   --action idle       gewünschte Animation               [Default: idle]
//   --skip-rig          nur bis zum texturierten Modell (keine Rig/Anim)
//   --out <pfad>        Zielpfad                            [Default: public/models/consultant.glb]
//
// Die Meshy-Endpunkte können sich ändern — bei Fehlern die aktuellen Pfade unter
// https://docs.meshy.ai gegenprüfen und die Konstanten unten anpassen.
// ─────────────────────────────────────────────────────────────────────────────

import { mkdir, writeFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const API = 'https://api.meshy.ai'
const EP = {
  textTo3d: `${API}/openapi/v2/text-to-3d`,
  rigging: `${API}/openapi/v1/rigging`,
  animation: `${API}/openapi/v1/animations`,
}

const DEFAULT_PROMPT =
  'A friendly, stylised male management consultant standing figure, full body, ' +
  'dark green tailored business suit, white shirt, approachable smile, clean ' +
  'corporate character, neutral T-pose, simple stylised low-poly-ish look, ' +
  'symmetrical, suitable for auto-rigging.'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = resolve(__dirname, '..')

// ── CLI-Argumente ────────────────────────────────────────────────────────────
function parseArgs(argv) {
  const args = { style: 'realistic', action: 'idle', skipRig: false, out: 'public/models/consultant.glb', prompt: DEFAULT_PROMPT }
  for (let i = 2; i < argv.length; i++) {
    const a = argv[i]
    if (a === '--skip-rig') args.skipRig = true
    else if (a === '--prompt') args.prompt = argv[++i]
    else if (a === '--style') args.style = argv[++i]
    else if (a === '--action') args.action = argv[++i]
    else if (a === '--out') args.out = argv[++i]
    else console.warn(`Unbekanntes Argument ignoriert: ${a}`)
  }
  return args
}

const KEY = process.env.MESHY_API_KEY
if (!KEY) {
  console.error('Fehler: MESHY_API_KEY ist nicht gesetzt. Key unter https://www.meshy.ai/api erstellen.')
  process.exit(1)
}

const headers = { Authorization: `Bearer ${KEY}`, 'Content-Type': 'application/json' }
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

async function postJson(url, body) {
  const res = await fetch(url, { method: 'POST', headers, body: JSON.stringify(body) })
  const text = await res.text()
  if (!res.ok) throw new Error(`POST ${url} → ${res.status}: ${text}`)
  const json = text ? JSON.parse(text) : {}
  // Meshy liefert je nach Endpunkt { result: "<id>" } oder { id: "<id>" }.
  return json.result ?? json.id ?? json
}

async function poll(baseUrl, id, phase) {
  const url = `${baseUrl}/${id}`
  let last = ''
  for (;;) {
    const res = await fetch(url, { headers })
    if (!res.ok) throw new Error(`GET ${url} → ${res.status}: ${await res.text()}`)
    const task = await res.json()
    const status = task.status
    const progress = task.progress ?? 0
    const line = `[${phase}] ${status} ${progress}%`
    if (line !== last) {
      process.stdout.write(`\r${line.padEnd(48)}`)
      last = line
    }
    if (status === 'SUCCEEDED') {
      process.stdout.write('\n')
      return task
    }
    if (status === 'FAILED' || status === 'CANCELED') {
      process.stdout.write('\n')
      throw new Error(`[${phase}] fehlgeschlagen: ${JSON.stringify(task.task_error ?? task)}`)
    }
    await sleep(5000)
  }
}

function glbUrlOf(task) {
  return task.model_urls?.glb ?? task.model_url ?? task.result?.model_urls?.glb ?? null
}

async function main() {
  const args = parseArgs(process.argv)
  console.log('Meshy-Consultant-Pipeline')
  console.log(`  Stil:   ${args.style}`)
  console.log(`  Aktion: ${args.action}`)
  console.log(`  Ziel:   ${args.out}`)
  console.log(`  Prompt: ${args.prompt}\n`)

  // 1) Preview
  console.log('1/5  Text-to-3D (Preview) …')
  const previewId = await postJson(EP.textTo3d, {
    mode: 'preview',
    prompt: args.prompt,
    art_style: args.style,
    should_remesh: true,
    topology: 'quad',
  })
  await poll(EP.textTo3d, previewId, 'Preview')

  // 2) Refine (texturiert)
  console.log('2/5  Text-to-3D (Refine / Texturierung) …')
  const refineId = await postJson(EP.textTo3d, {
    mode: 'refine',
    preview_task_id: previewId,
    enable_pbr: true,
  })
  let finalTask = await poll(EP.textTo3d, refineId, 'Refine')
  let sourceTaskId = refineId

  if (!args.skipRig) {
    // 3) Auto-Rigging
    console.log('3/5  Auto-Rigging (humanoides Skelett) …')
    const rigId = await postJson(EP.rigging, {
      input_task_id: sourceTaskId,
      height_meters: 1.8,
    })
    await poll(EP.rigging, rigId, 'Rigging')
    sourceTaskId = rigId

    // 4) Animation
    console.log('4/5  Animation …')
    const animId = await postJson(EP.animation, {
      rig_task_id: rigId,
      action: args.action,
    })
    finalTask = await poll(EP.animation, animId, 'Animation')
  } else {
    console.log('3-4/5  (übersprungen: --skip-rig)')
  }

  // 5) Download
  console.log('5/5  Download GLB …')
  const glb = glbUrlOf(finalTask)
  if (!glb) throw new Error(`Keine GLB-URL im Ergebnis gefunden: ${JSON.stringify(finalTask).slice(0, 400)}`)
  const bin = Buffer.from(await (await fetch(glb)).arrayBuffer())
  const outPath = resolve(ROOT, args.out)
  await mkdir(dirname(outPath), { recursive: true })
  await writeFile(outPath, bin)
  console.log(`\nFertig. Modell gespeichert: ${outPath} (${(bin.length / 1024 / 1024).toFixed(2)} MB)`)
  console.log('Danach: npm run build  und  dist/ committen.')
}

main().catch((err) => {
  console.error('\nAbbruch:', err.message)
  process.exit(1)
})
