// ─────────────────────────────────────────────────────────────────────────────
// Stockwerk-Download — speichert das Stockwerk des aktuellen Kapitels als
// quadratisches Bild (1:1) und lädt es als PNG herunter.
//
// Zweck: den Raum eines Kapitels für Folien und Kacheln entnehmen, ohne die
// Bedienelemente der App mitzufotografieren. Ausgeschnitten wird aus dem
// Master-Strukturbild — kein Browser-Screenshot.
//
// Format: reines Bild, kein Rahmen und keine Beschriftung. Die Kantenlänge ist
// die volle Höhe des Stockwerks (Decke bis Boden), der Ausschnitt sitzt
// waagerecht auf dem Schlüsselobjekt des Raums. Ein Stockwerk ist rund 3:1
// breit — quadratisch heißt darum zwangsläufig: die volle Etagenhöhe und der
// mittlere Ausschnitt des Raums, nicht das Stockwerk in ganzer Breite.
//
// Nicht skaliert: Ausgegeben werden exakt die Pixel des Masters (6144×4096),
// also rund 700–820 px Kantenlänge. Hochrechnen würde nur Schärfe vortäuschen.
// ─────────────────────────────────────────────────────────────────────────────

import type { Chapter, ChapterId } from './chapters'
import { loadImage } from './strukturbildDownload'
import type { Lang } from '../i18n/LanguageContext'

/** Die Zoom-Zonen sind für den Kameraflug kalibriert und greifen oben ein Stück
    in die Etage darüber. Für einen sauberen Schnitt rutscht der Ausschnitt in
    gleicher Höhe nach unten: oben fällt der fremde Streifen weg, unten kommt
    der eigene Boden dazu. */
const NUDGE_Y = 1.6

type Framing = {
  /** Bildmitte waagerecht, in % der Master-Breite. Default: Zonenmitte. */
  x?: number
  /** Bildmitte senkrecht, in % der Master-Höhe. Default: Etagenmitte. */
  y?: number
  /** Kantenlänge im Verhältnis zur Etagenhöhe. Default 1 = volle Etage. */
  zoom?: number
}

/**
 * Bildregie je Kapitel.
 *
 * Ein Quadrat fasst nur rund ein Drittel der Etagenbreite — welches Drittel,
 * ist eine Bildentscheidung und keine geometrische. Die Raummitte trifft in
 * mehreren Etagen genau zwischen die Szenen (bei der Organisationsentwicklung
 * z. B. Bücherregal und Pflanze statt der Menschen am Tisch). Diese Werte
 * setzen den Ausschnitt stattdessen auf die tragende Szene des Raums.
 * Ohne Eintrag steht das Quadrat mittig über der Zone.
 */
const FRAMING: Partial<Record<ChapterId, Framing>> = {
  kunde: { x: 16.8 }, // Schalter mit Kunde und Beratung (statt SB-Terminals)
  vertrieb: { x: 67 }, // Beratungsgespräch am runden Tisch unter dem Dashboard
  marktfolge: { x: 79.2 }, // die Dreiergruppe an den Arbeitsplätzen rechts
  corporate: { x: 14.1 }, // Gespräch am Tisch vor dem Regal
  it: { x: 78.1 }, // Zweiergespräch am Laptop vor den Serverschränken
  compliance: { x: 22.7 }, // Weltkarten-Screen mit den Risikocontrollern davor
  projekt: { x: 64.4 }, // Whiteboard mit Klebezetteln und den zwei Personen davor
  // Der Boardroom ist die höchste Etage und sein Deckenraum entsprechend leer:
  // über die volle Etagenhöhe säße der Tisch am unteren Rand und die Stühle
  // wären angeschnitten. Enger und tiefer gefasst — Tisch, Runde und Screen.
  vorstand: { x: 23.9, y: 21.5, zoom: 0.9 },
  // Der Aufzug ist schmal und hoch, die Kantenlänge gibt hier die Schachtbreite
  // vor. Auf Höhe der Etagenmitte wäre die Kabine oben angeschnitten (Kopf ab),
  // deshalb sitzt der Ausschnitt auf der Kabine selbst.
  transformation: { x: 49, y: 42.75 },
}

const FILE_PREFIX: Record<Lang, string> = { de: 'Stockwerk', en: 'Floor', fr: 'Étage' }

const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(v, hi))

/** Dateinamen-tauglicher Titel: Umlaute ausgeschrieben, Rest zu Bindestrichen. */
function slug(s: string): string {
  return s
    .replace(/ä/g, 'ae')
    .replace(/ö/g, 'oe')
    .replace(/ü/g, 'ue')
    .replace(/Ä/g, 'Ae')
    .replace(/Ö/g, 'Oe')
    .replace(/Ü/g, 'Ue')
    .replace(/ß/g, 'ss')
    .replace(/[^A-Za-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

/**
 * Rendert das Stockwerk des Kapitels als quadratisches Bild und startet den
 * Download. `masterSrc` ist das Master-Strukturbild, aus dem ausgeschnitten
 * wird.
 */
export async function downloadStockwerk(
  masterSrc: string,
  chapter: Chapter,
  lang: Lang,
): Promise<void> {
  const img = await loadImage(masterSrc)
  const iw = img.naturalWidth
  const ih = img.naturalHeight
  const zone = chapter.zone

  const framing = FRAMING[chapter.id] ?? {}

  // Kantenlänge = Etagenhöhe (bei Bedarf enger gefasst), begrenzt auf das, was
  // das Bild hergibt. Beim schmalen, hohen Aufzugs-Kapitel gibt stattdessen die
  // Breite das Maß vor, sonst stünde links und rechts die halbe Nachbaretage
  // im Bild.
  const side = Math.round(
    Math.min(
      (zone.height / 100) * ih * (framing.zoom ?? 1),
      (zone.width / 100) * iw,
      iw,
      ih,
    ),
  )

  // Waagerecht auf der tragenden Szene des Raums, senkrecht auf der Etage.
  const centerX = framing.x ?? zone.labelX ?? zone.centerX
  const centerY = framing.y ?? zone.centerY + NUDGE_Y
  const cx = clamp((centerX / 100) * iw - side / 2, 0, iw - side)
  const cy = clamp((centerY / 100) * ih - side / 2, 0, ih - side)

  const canvas = document.createElement('canvas')
  canvas.width = side
  canvas.height = side
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('Canvas nicht verfügbar')

  ctx.imageSmoothingEnabled = true
  ctx.imageSmoothingQuality = 'high'
  ctx.drawImage(img, cx, cy, side, side, 0, 0, side, side)

  const blob = await new Promise<Blob | null>((res) => canvas.toBlob(res, 'image/png'))
  if (!blob) throw new Error('Export fehlgeschlagen')
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${FILE_PREFIX[lang]}-${chapter.kapitel}-${slug(chapter.label)}.png`
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}
