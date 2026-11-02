// ─────────────────────────────────────────────────────────────────────────────
// Strukturbild-Download — rendert das Master-Strukturbild in voller Auflösung
// zusammen mit den Kapitel-Nummern auf ein Canvas und lädt es als PNG herunter.
//
// Zweck: Das Bild für Folien/Dokumente entnehmen, OHNE die Bedienelemente der
// App mitzufotografieren (bisher wurde dafür ein Browser-Screenshot gemacht,
// auf dem Sprachumschalter, „Bearbeiten", „Excel" usw. mit drauf waren).
//
// Die Badges werden 1:1 wie in der Übersicht positioniert (labelX/labelY der
// Zone, in Prozent der Bildmaße) und im Deloitte-Grün gezeichnet.
// ─────────────────────────────────────────────────────────────────────────────

import type { Chapter } from './chapters'

const ACCENT = '#046A38'
const ACCENT_DEEP = '#013D20'

/** Lädt das Bild und liefert es als HTMLImageElement (CORS-frei, gleiche Origin). */
export function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = () => reject(new Error(`Bild nicht ladbar: ${src}`))
    img.src = src
  })
}

/**
 * Zeichnet das Strukturbild samt Kapitel-Badges und startet den Download.
 * `withBadges = false` liefert das reine Bild ohne jede Markierung.
 */
export async function downloadStrukturbild(
  src: string,
  chapters: Chapter[],
  withBadges = true,
): Promise<void> {
  const img = await loadImage(src)
  const canvas = document.createElement('canvas')
  canvas.width = img.naturalWidth
  canvas.height = img.naturalHeight
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('Canvas nicht verfügbar')
  ctx.drawImage(img, 0, 0)

  if (withBadges) {
    // Badge-Größe proportional zur Bildbreite (28px bei ~1500px Anzeigebreite).
    const r = Math.round(canvas.width * 0.0115)
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.font = `700 ${Math.round(r * 0.95)}px "JetBrains Mono", ui-monospace, monospace`
    for (const chapter of chapters) {
      const { zone } = chapter
      const cx = ((zone.labelX ?? zone.centerX) / 100) * canvas.width
      const cy = ((zone.labelY ?? zone.centerY) / 100) * canvas.height
      // Weicher Hof, damit die Nummer auf hellem Beton lesbar bleibt
      ctx.beginPath()
      ctx.arc(cx, cy, r * 1.42, 0, Math.PI * 2)
      ctx.fillStyle = 'rgba(4, 106, 56, 0.18)'
      ctx.fill()
      const grad = ctx.createLinearGradient(cx - r, cy - r, cx + r, cy + r)
      grad.addColorStop(0, ACCENT_DEEP)
      grad.addColorStop(1, ACCENT)
      ctx.beginPath()
      ctx.arc(cx, cy, r, 0, Math.PI * 2)
      ctx.fillStyle = grad
      ctx.fill()
      ctx.fillStyle = '#fff'
      ctx.fillText(chapter.kapitel, cx, cy + r * 0.04)
    }
  }

  // JPEG statt PNG: bei 6144x4096 wären es sonst ~47 MB — als JPEG in hoher
  // Qualität sind es wenige MB, die sich problemlos in Folien einfügen lassen.
  const blob = await new Promise<Blob | null>((res) => canvas.toBlob(res, 'image/jpeg', 0.92))
  if (!blob) throw new Error('Export fehlgeschlagen')
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = withBadges ? 'Strukturbild-Horizon-Bank.jpg' : 'Strukturbild-Horizon-Bank-pur.jpg'
  document.body.appendChild(a)
  a.click()
  a.remove()
  // Objekt-URL erst nach dem Start des Downloads freigeben.
  setTimeout(() => URL.revokeObjectURL(url), 10_000)
}
