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
//   4. Animationen             → Idle-, Wink- und Sprech-Clip auf dem Rig
//   5. Merge + Download        → ein GLB mit drei benannten Clips
//                                → public/models/consultant.glb
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
//   --actions <spec>    Clips als "name=action_id,…"; IDs siehe
//                       https://docs.meshy.ai/en/api/animation-library
//                       [Default: idle=0,wave=28,talk=313]
//   --skip-rig          nur bis zum texturierten Modell (keine Rig/Anim)
//   --out <pfad>        Zielpfad                            [Default: public/models/consultant.glb]
//
// Die Meshy-Endpunkte können sich ändern — bei Fehlern die aktuellen Pfade unter
// https://docs.meshy.ai gegenprüfen und die Konstanten unten anpassen.
// ─────────────────────────────────────────────────────────────────────────────

import { mkdir, writeFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { NodeIO } from '@gltf-transform/core'
import { ALL_EXTENSIONS } from '@gltf-transform/extensions'

const API = 'https://api.meshy.ai'
const EP = {
  textTo3d: `${API}/openapi/v2/text-to-3d`,
  rigging: `${API}/openapi/v1/rigging`,
  animation: `${API}/openapi/v1/animations`,
}

// Clip-Name → action_id aus der Meshy-Animation-Library. Die Namen müssen zu
// den Kandidatenlisten in src/consultant/consultantConfig.ts (CONSULTANT_CLIPS)
// passen, damit Consultant3D.tsx die Clips zuordnen kann.
//   0   = "Idle"                  (DailyActions / Idle)
//   28  = "Big_Wave_Hello"        (DailyActions / Interacting)
//   313 = "Talk_with_Hands_Open"  (DailyActions / Interacting)
const DEFAULT_ACTIONS = [
  { clip: 'idle', actionId: 0 },
  { clip: 'wave', actionId: 28 },
  { clip: 'talk', actionId: 313 },
]

const DEFAULT_PROMPT =
  'A friendly, stylised male management consultant standing figure, full body, ' +
  'dark green tailored business suit, white shirt, approachable smile, clean ' +
  'corporate character, neutral T-pose, simple stylised low-poly-ish look, ' +
  'symmetrical, suitable for auto-rigging.'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = resolve(__dirname, '..')

// ── CLI-Argumente ────────────────────────────────────────────────────────────
function parseArgs(argv) {
  const args = { style: 'realistic', actions: DEFAULT_ACTIONS, skipRig: false, out: 'public/models/consultant.glb', prompt: DEFAULT_PROMPT }
  for (let i = 2; i < argv.length; i++) {
    const a = argv[i]
    if (a === '--skip-rig') args.skipRig = true
    else if (a === '--prompt') args.prompt = argv[++i]
    else if (a === '--style') args.style = argv[++i]
    else if (a === '--actions') {
      args.actions = argv[++i].split(',').map((pair) => {
        const [clip, id] = pair.split('=')
        if (!clip || !/^\d+$/.test(id ?? '')) {
          console.error(`Ungültige --actions-Angabe: "${pair}" (erwartet name=action_id)`)
          process.exit(1)
        }
        return { clip: clip.trim(), actionId: Number(id) }
      })
    }
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
      console.log(line)
      last = line
    }
    if (status === 'SUCCEEDED') return task
    if (status === 'FAILED' || status === 'CANCELED') {
      throw new Error(`[${phase}] fehlgeschlagen: ${JSON.stringify(task.task_error ?? task)}`)
    }
    await sleep(5000)
  }
}

function glbUrlOf(task) {
  return (
    task.model_urls?.glb ??
    task.model_url ??
    task.result?.model_urls?.glb ??
    task.result?.animation_glb_url ??
    task.result?.rigged_character_glb_url ??
    null
  )
}

async function download(url) {
  const res = await fetch(url)
  if (!res.ok) throw new Error(`GET ${url} → ${res.status}`)
  return Buffer.from(await res.arrayBuffer())
}

// ── GLB-Merge ────────────────────────────────────────────────────────────────
// Meshy liefert pro Animations-Task ein eigenes GLB (gleiches Modell + Rig,
// genau ein Clip). Für den Consultant brauchen wir EIN GLB mit allen Clips:
// das erste GLB dient als Basis, aus den übrigen werden die Animationen
// kopiert und über die Knochen-Namen (Fallback: Node-Index) auf das
// Basis-Skelett umgebogen.
async function mergeAnimations(parts) {
  // Extensions registrieren, sonst werden optionale Material-Extensions der
  // Meshy-GLBs (KHR_materials_specular, KHR_materials_ior) beim Merge verworfen.
  const io = new NodeIO().registerExtensions(ALL_EXTENSIONS)
  const [first, ...rest] = parts
  const base = await io.readBinary(new Uint8Array(first.bin))
  const root = base.getRoot()

  const baseAnims = root.listAnimations()
  if (baseAnims.length === 1) baseAnims[0].setName(first.clip)
  else baseAnims.forEach((a, i) => a.setName(i === 0 ? first.clip : `${first.clip}_${i}`))

  const buffer = root.listBuffers()[0] ?? base.createBuffer()
  const baseNodes = root.listNodes()
  const byName = new Map()
  for (const n of baseNodes) {
    if (n.getName() && !byName.has(n.getName())) byName.set(n.getName(), n)
  }

  for (const { clip, bin } of rest) {
    const doc = await io.readBinary(new Uint8Array(bin))
    const docNodes = doc.getRoot().listNodes()
    for (const anim of doc.getRoot().listAnimations()) {
      const merged = base.createAnimation(clip)
      for (const channel of anim.listChannels()) {
        const srcSampler = channel.getSampler()
        const srcNode = channel.getTargetNode()
        if (!srcSampler?.getInput() || !srcSampler.getOutput() || !srcNode) continue
        const destNode = byName.get(srcNode.getName()) ?? baseNodes[docNodes.indexOf(srcNode)]
        if (!destNode) {
          console.warn(`  Hinweis: Kein Ziel-Knochen für "${srcNode.getName()}" (${clip}) — Kanal übersprungen.`)
          continue
        }
        const input = base
          .createAccessor()
          .setType(srcSampler.getInput().getType())
          .setArray(srcSampler.getInput().getArray())
          .setBuffer(buffer)
        const output = base
          .createAccessor()
          .setType(srcSampler.getOutput().getType())
          .setArray(srcSampler.getOutput().getArray())
          .setBuffer(buffer)
        const sampler = base
          .createAnimationSampler()
          .setInput(input)
          .setOutput(output)
          .setInterpolation(srcSampler.getInterpolation())
        const mergedChannel = base
          .createAnimationChannel()
          .setTargetNode(destNode)
          .setTargetPath(channel.getTargetPath())
          .setSampler(sampler)
        merged.addSampler(sampler).addChannel(mergedChannel)
      }
    }
  }

  liftSkinnedMeshes(base)

  const clips = base.getRoot().listAnimations().map((a) => a.getName()).join(', ')
  console.log(`  Zusammengeführte Clips: ${clips}`)
  return Buffer.from(await io.writeBinary(base))
}

// Hängt geskinnte Mesh-Nodes an die Szenenwurzel. Laut glTF-Spec wird die
// Node-Transform eines geskinnten Meshes beim Rendern ignoriert (die Vertices
// folgen allein den Joints) — Bounding-Box-Messungen wie drei <Bounds> laufen
// aber über die Node-Hierarchie. Unter Meshys 0.01-skaliertem "Armature"-Node
// wäre die gemessene Box 100-fach zu klein und die Kamera zoomt auf die Beine.
function liftSkinnedMeshes(doc) {
  const root = doc.getRoot()
  const scene = root.getDefaultScene() ?? root.listScenes()[0]
  for (const node of root.listNodes()) {
    if (!node.getMesh() || !node.getSkin()) continue
    const parent = node.getParentNode()
    if (!parent) continue
    parent.removeChild(node)
    node.setTranslation([0, 0, 0]).setRotation([0, 0, 0, 1]).setScale([1, 1, 1])
    scene.addChild(node)
  }
}

async function main() {
  const args = parseArgs(process.argv)
  console.log('Meshy-Consultant-Pipeline')
  console.log(`  Stil:   ${args.style}`)
  console.log(`  Clips:  ${args.actions.map((a) => `${a.clip}=${a.actionId}`).join(', ')}`)
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
  const refineTask = await poll(EP.textTo3d, refineId, 'Refine')

  let bin
  if (!args.skipRig) {
    // 3) Auto-Rigging
    console.log('3/5  Auto-Rigging (humanoides Skelett) …')
    const rigId = await postJson(EP.rigging, {
      input_task_id: refineId,
      height_meters: 1.8,
    })
    await poll(EP.rigging, rigId, 'Rigging')

    // 4) Animationen (parallel, alle auf demselben Rig)
    console.log(`4/5  Animationen (${args.actions.map((a) => a.clip).join(', ')}) …`)
    const parts = await Promise.all(
      args.actions.map(async ({ clip, actionId }) => {
        const animId = await postJson(EP.animation, {
          rig_task_id: rigId,
          action_id: actionId,
        })
        const task = await poll(EP.animation, animId, `Anim ${clip}`)
        const url = glbUrlOf(task)
        if (!url) throw new Error(`Keine GLB-URL im Animations-Ergebnis (${clip}): ${JSON.stringify(task).slice(0, 400)}`)
        return { clip, bin: await download(url) }
      }),
    )

    // 5) Merge + Download
    console.log('5/5  Clips zusammenführen und GLB schreiben …')
    bin = parts.length > 1 ? await mergeAnimations(parts) : parts[0].bin
  } else {
    console.log('3-4/5  (übersprungen: --skip-rig)')
    console.log('5/5  Download GLB …')
    const glb = glbUrlOf(refineTask)
    if (!glb) throw new Error(`Keine GLB-URL im Ergebnis gefunden: ${JSON.stringify(refineTask).slice(0, 400)}`)
    bin = await download(glb)
  }

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
