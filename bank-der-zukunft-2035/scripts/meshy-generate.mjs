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
import { dedup, prune, simplify, textureCompress, weld } from '@gltf-transform/functions'
import { MeshoptSimplifier } from 'meshoptimizer'
import sharp from 'sharp'

const API = 'https://api.meshy.ai'
const EP = {
  textTo3d: `${API}/openapi/v2/text-to-3d`,
  rigging: `${API}/openapi/v1/rigging`,
  animation: `${API}/openapi/v1/animations`,
}

// Clip-Name → action_id aus der Meshy-Animation-Library. Die Namen müssen zu
// den Kandidatenlisten in src/consultant/consultantConfig.ts (CONSULTANT_CLIPS)
// passen, damit Consultant3D.tsx die Clips zuordnen kann.
//   0   = "Idle"                  (DailyActions / Idle)   — Arme unten, sauber
//   28  = "Big_Wave_Hello"        (DailyActions / Interacting)
//   313 = "Talk_with_Hands_Open"  (DailyActions / Interacting)
//
// NUR idle: Meshys Auto-Rigging setzt an Schulter/Oberarm zu grobe Skin-Weights;
// sobald eine Animation die Arme HEBT (wave, talk …), reißt es den Torso-Mesh zu
// grotesken „Flügeln" auseinander (verifiziert an den rohen Meshy-Animations-GLBs,
// nicht erst nach dem Merge). idle hält die Arme nah am Körper und bleibt über die
// volle Dauer stabil. pickClip() in Consultant3D.tsx fällt für greeting/talking
// automatisch auf idle zurück. Weitere Clips nur mit besserem Rig via --actions.
const DEFAULT_ACTIONS = [{ clip: 'idle', actionId: 0 }]

// Realistischer, gut proportionierter Charakter in T-Pose. WICHTIG für die
// Animation: Die Figur MUSS in neutraler T-Pose mit seitlich ausgestreckten
// Armen stehen (pose_mode: 't-pose'). Steht sie z. B. mit verschränkten Armen,
// verzerrt das Auto-Rigging die Arme bei den Bibliotheks-Animationen zu
// „Flügeln". „realistic proportions" verhindert den Bobblehead-Effekt.
const DEFAULT_PROMPT =
  'Full-body realistic 3D character of a professional male management consultant ' +
  'in his early 40s, standing upright in a neutral T-pose with both arms extended ' +
  'straight out to the sides, realistic human body proportions, wearing a ' +
  'dark green tailored business suit, white dress shirt and tie, short dark hair, ' +
  'neatly groomed short beard, calm confident friendly expression, photorealistic ' +
  'PBR skin and fabric textures, symmetrical, clean game-ready character topology.'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = resolve(__dirname, '..')

// ── CLI-Argumente ────────────────────────────────────────────────────────────
function parseArgs(argv) {
  const args = {
    aiModel: 'meshy-6',
    pose: 't-pose',
    polycount: 60000,
    actions: DEFAULT_ACTIONS,
    skipRig: false,
    out: 'public/models/consultant.glb',
    prompt: DEFAULT_PROMPT,
  }
  for (let i = 2; i < argv.length; i++) {
    const a = argv[i]
    if (a === '--skip-rig') args.skipRig = true
    else if (a === '--prompt') args.prompt = argv[++i]
    else if (a === '--ai-model') args.aiModel = argv[++i]
    else if (a === '--pose') args.pose = argv[++i]
    else if (a === '--polycount') args.polycount = Number(argv[++i])
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

  const clips = base.getRoot().listAnimations().map((a) => a.getName()).join(', ')
  console.log(`  Zusammengeführte Clips: ${clips}`)
  return base
}

// Nachbearbeitung, die IMMER läuft (egal ob ein oder mehrere Clips, oder
// --skip-rig): Material-Normalisierung, geskinnte Meshes anheben und das GLB
// für den kleinen Dock-Avatar deutlich verkleinern.
async function finalize(doc) {
  normalizeMaterials(doc)
  liftSkinnedMeshes(doc)

  // Verkleinern: Geometrie halbieren (meshopt-Simplify) und die PBR-Textur auf
  // 1024px als WebP. Bewusst OHNE Draco/Meshopt-Geometriekompression, die einen
  // zusätzlichen Decoder (DRACOLoader/MeshoptDecoder) im react-three-Loader
  // bräuchte — WebP-Textur + weniger Vertices laden ohne App-seitigen Decoder.
  await MeshoptSimplifier.ready
  await doc.transform(
    dedup(),
    weld(),
    simplify({ simplifier: MeshoptSimplifier, ratio: 0.5, error: 0.0015 }),
    textureCompress({ encoder: sharp, targetFormat: 'webp', resize: [1024, 1024], quality: 82 }),
    prune(),
  )

  const io = new NodeIO().registerExtensions(ALL_EXTENSIONS)
  return Buffer.from(await io.writeBinary(doc))
}

// Korrigiert Meshys PBR-Materialdefaults, die in einer Szene ohne HDRI/Environment
// den „Geister-Look" verursachen:
//   • metallicFactor: glTF-Default ist 1.0, wenn ungesetzt — ein voll metallischer
//     Anzug/Haut hat ohne Environment-Map nichts zu spiegeln und wirkt flach/falsch.
//     → auf 0 setzen (Stoff/Haut sind dielektrisch).
//   • emissiveFactor [1,1,1] + Emissive-Textur: die Figur „leuchtet" ihre Basisfarbe
//     voll ab, überstrahlt jede Schattierung und wirkt ausgewaschen/durchscheinend.
//     → Emissive aus.
//   • KHR_materials_specular specularColorFactor [2,2,2]: übertriebene Glanzlichter.
//     → auf neutrale 1.0 zurücksetzen.
function normalizeMaterials(doc) {
  for (const mat of doc.getRoot().listMaterials()) {
    mat.setMetallicFactor(0)
    mat.setEmissiveFactor([0, 0, 0])
    if (mat.getEmissiveTexture()) mat.setEmissiveTexture(null)
    const spec = mat.getExtension('KHR_materials_specular')
    if (spec && typeof spec.setSpecularColorFactor === 'function') {
      spec.setSpecularColorFactor([1, 1, 1])
    }
  }
  console.log('  Materialien normalisiert (metalness 0, Emissive aus).')
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
  console.log(`  Modell: ${args.aiModel}   Pose: ${args.pose}   Polycount: ${args.polycount}`)
  console.log(`  Clips:  ${args.actions.map((a) => `${a.clip}=${a.actionId}`).join(', ')}`)
  console.log(`  Ziel:   ${args.out}`)
  console.log(`  Prompt: ${args.prompt}\n`)

  // 1) Preview — Meshy-6 in T-Pose: neutrale Pose ist Voraussetzung dafür, dass
  // die Bibliotheks-Animationen das Auto-Rig sauber bewegen (keine Flügel-Arme).
  console.log('1/5  Text-to-3D (Preview) …')
  const previewId = await postJson(EP.textTo3d, {
    mode: 'preview',
    prompt: args.prompt,
    ai_model: args.aiModel,
    pose_mode: args.pose,
    topology: 'quad',
    target_polycount: args.polycount,
  })
  await poll(EP.textTo3d, previewId, 'Preview')

  // 2) Refine (texturiert)
  console.log('2/5  Text-to-3D (Refine / Texturierung) …')
  const refineId = await postJson(EP.textTo3d, {
    mode: 'refine',
    preview_task_id: previewId,
    ai_model: args.aiModel,
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

    // 5) Merge + Nachbearbeitung
    console.log('5/5  Clips zusammenführen, normalisieren, optimieren …')
    const merged = await mergeAnimations(parts)
    bin = await finalize(merged)
  } else {
    console.log('3-4/5  (übersprungen: --skip-rig)')
    console.log('5/5  Download, normalisieren, optimieren …')
    const glb = glbUrlOf(refineTask)
    if (!glb) throw new Error(`Keine GLB-URL im Ergebnis gefunden: ${JSON.stringify(refineTask).slice(0, 400)}`)
    const io = new NodeIO().registerExtensions(ALL_EXTENSIONS)
    bin = await finalize(await io.readBinary(new Uint8Array(await download(glb))))
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
