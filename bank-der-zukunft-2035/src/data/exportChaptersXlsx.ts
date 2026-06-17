// ─────────────────────────────────────────────────────────────────────────────
// exportChaptersXlsx — Excel-Export der Kapitel/Hypothesen (Schriftart „Aptos").
//
// Erzeugt eine .xlsx mit:
//   · einem Übersichts-Blatt: strukturierte Tabelle ALLER Hypothesen + Texte,
//   · je Kapitel einem eigenen Blatt mit den Vergleichsbildern und den drei
//     Hypothesen (Status Quo / 2035 / Leitfrage) sowie der Aktivität.
//
// Lokale Bearbeitungen (chapterEdits, localStorage) werden über die Basisdaten
// gelegt, sodass die exportierte Datei den aktuellen Stand im Tool widerspiegelt.
//
// exceljs wird dynamisch importiert (eigener Chunk, nur beim Export geladen).
// ─────────────────────────────────────────────────────────────────────────────

import { getChapters } from './chapters'
import { commentKey, textKey, type EditField, type EditsData } from './chapterEdits'
import type { Lang } from '../i18n/LanguageContext'

type Worksheet = import('exceljs').Worksheet
type Workbook = import('exceljs').Workbook

const FONT = 'Aptos'
const ACCENT = 'FF046A38' // EDEKA-/Deloitte-Grün
const ACCENT_DARK = 'FF02502A'
const WHITE = 'FFFFFFFF'
const MUTED = 'FF6B7280'
const IMG_W = 560
const IMG_H = 315 // 16:9
const IMG_ROWS = 17 // reservierte Zeilen unter der Überschrift für das Bild

type CellOpts = {
  size?: number
  bold?: boolean
  italic?: boolean
  color?: string
  fill?: string
  align?: 'left' | 'center' | 'right'
  valign?: 'top' | 'middle' | 'bottom'
  wrap?: boolean
}

// **fett** → RichText-Runs; sonst Klartext. Schriftart immer Aptos.
function toValue(text: string, base: { name: string; size: number; bold: boolean; color?: { argb: string } }) {
  if (!text.includes('**')) return text
  const segs = text.split(/(\*\*[^*]+\*\*)/g).filter((s) => s !== '')
  return {
    richText: segs.map((s) =>
      s.startsWith('**') && s.endsWith('**')
        ? { text: s.slice(2, -2), font: { ...base, bold: true } }
        : { text: s, font: base },
    ),
  }
}

function setCell(ws: Worksheet, range: string, text: string, opts: CellOpts = {}): void {
  const { size = 11, bold = false, italic = false, color, fill, align = 'left', valign = 'top', wrap = false } = opts
  let addr = range
  if (range.includes(':')) {
    ws.mergeCells(range)
    addr = range.split(':')[0] ?? range
  }
  const cell = ws.getCell(addr)
  const base = { name: FONT, size, bold, ...(color ? { color: { argb: color } } : {}) }
  cell.value = toValue(text, base)
  cell.font = { ...base, italic }
  cell.alignment = { vertical: valign, horizontal: align, wrapText: wrap }
  if (fill) cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: fill } }
}

async function fetchImage(
  src: string,
): Promise<{ buffer: ArrayBuffer; extension: 'png' | 'jpeg' | 'gif' } | null> {
  try {
    const res = await fetch(encodeURI(src))
    if (!res.ok) return null
    const buffer = await res.arrayBuffer()
    const lower = src.toLowerCase()
    const extension = lower.endsWith('.jpg') || lower.endsWith('.jpeg') ? 'jpeg' : lower.endsWith('.gif') ? 'gif' : 'png'
    return { buffer, extension }
  } catch {
    return null
  }
}

function sheetName(kapitel: string, label: string): string {
  const raw = `${kapitel} ${label}`.replace(/[\\/?*[\]:]/g, ' ').replace(/\s+/g, ' ').trim()
  return raw.slice(0, 31)
}

/**
 * Baut die Arbeitsmappe und löst den Download aus.
 * @param lang  aktive Sprache (Texte werden in dieser Sprache exportiert)
 * @param edits lokale Overrides (localStorage)
 */
export async function exportChaptersXlsx(lang: Lang, edits: EditsData): Promise<void> {
  const ExcelJS = await import('exceljs')
  const wb: Workbook = new ExcelJS.Workbook()
  wb.creator = 'Banking Horizon 2035'
  wb.created = new Date()

  const chapters = getChapters(lang)
  const eff = (chapterId: string, step: number, field: EditField, base: string) =>
    edits.texts[textKey(chapterId, step, lang, field)] ?? base

  const LBL = {
    de: {
      overview: 'Übersicht',
      colKapitel: 'Kapitel',
      colNr: 'Nr.',
      colTitel: 'Hypothese (Titel)',
      colQuo: 'Status Quo (Heute)',
      colFuture: '2035',
      colLeitfrage: 'Leitfrage',
      today: 'Heute · Status Quo',
      future: '2035',
      leitfrage: 'Leitfrage',
      hypothesis: 'Hypothese',
      activity: 'Aktivität & Absprung',
      comment: 'Kommentar',
      missing: (f: string) => `[Bild fehlt: ${f}]`,
      heading: 'Banking Horizon 2035 — Hypothesen',
    },
    en: {
      overview: 'Overview',
      colKapitel: 'Chapter',
      colNr: 'No.',
      colTitel: 'Hypothesis (title)',
      colQuo: 'Status quo (today)',
      colFuture: '2035',
      colLeitfrage: 'Guiding question',
      today: 'Today · status quo',
      future: '2035',
      leitfrage: 'Guiding question',
      hypothesis: 'Hypothesis',
      activity: 'Activity & hand-off',
      comment: 'Comment',
      missing: (f: string) => `[image missing: ${f}]`,
      heading: 'Banking Horizon 2035 — hypotheses',
    },
  }[lang]

  // ── Übersichts-Blatt: strukturierte Tabelle aller Hypothesen ───────────────
  const sum = wb.addWorksheet(LBL.overview, { views: [{ state: 'frozen', ySplit: 2 }] })
  sum.columns = [
    { width: 22 },
    { width: 6 },
    { width: 34 },
    { width: 52 },
    { width: 52 },
    { width: 40 },
  ]
  setCell(sum, 'A1:F1', LBL.heading, { size: 15, bold: true })
  sum.getRow(1).height = 22
  const headers = [LBL.colKapitel, LBL.colNr, LBL.colTitel, LBL.colQuo, LBL.colFuture, LBL.colLeitfrage]
  headers.forEach((h, i) => {
    const col = String.fromCharCode(65 + i)
    setCell(sum, `${col}2`, h, { size: 11, bold: true, color: WHITE, fill: ACCENT, valign: 'middle' })
  })
  sum.getRow(2).height = 20
  sum.autoFilter = 'A2:F2'

  let sr = 3
  for (const ch of chapters) {
    for (let step = 0; step < 3; step++) {
      const h = ch.hypotheses[step]
      if (!h) continue
      setCell(sum, `A${sr}`, `${ch.kapitel} · ${ch.label}`, { size: 11, wrap: true })
      setCell(sum, `B${sr}`, String(step + 1), { size: 11, align: 'center' })
      setCell(sum, `C${sr}`, eff(ch.id, step, 'title', h.title), { size: 11, bold: true, wrap: true })
      setCell(sum, `D${sr}`, eff(ch.id, step, 'statusQuo', h.statusQuo), { size: 11, wrap: true })
      setCell(sum, `E${sr}`, eff(ch.id, step, 'in2035', h.in2035), { size: 11, wrap: true })
      setCell(sum, `F${sr}`, eff(ch.id, step, 'leitfrage', h.leitfrage ?? ''), { size: 11, wrap: true, italic: true })
      sum.getRow(sr).height = 96
      sr++
    }
  }

  // ── Je Kapitel ein Blatt mit Bildern + Hypothesen ──────────────────────────
  for (const ch of chapters) {
    const ws = wb.addWorksheet(sheetName(ch.kapitel, ch.label))
    ws.getColumn(1).width = 22
    for (let c = 2; c <= 9; c++) ws.getColumn(c).width = 12

    let r = 1
    setCell(ws, `A${r}:I${r}`, `${ch.kapitel} · ${ch.label}`, { size: 18, bold: true })
    ws.getRow(r).height = 26
    r++
    setCell(ws, `A${r}:I${r}`, ch.ort, { size: 10, color: MUTED })
    r += 2

    const blocks: Array<{ heading: string; src: string; alt: string; comment: string; fill: string; rows: Array<[string, string, boolean]> }> = []
    for (let step = 0; step < 3; step++) {
      const h = ch.hypotheses[step]
      if (!h) continue
      blocks.push({
        heading: `${LBL.hypothesis} ${step + 1}: ${eff(ch.id, step, 'title', h.title)}`,
        src: h.image.src,
        alt: h.image.alt,
        comment: edits.comments[commentKey(ch.id, step)] ?? '',
        fill: ACCENT,
        rows: [
          [LBL.today, eff(ch.id, step, 'statusQuo', h.statusQuo), false],
          [LBL.future, eff(ch.id, step, 'in2035', h.in2035), false],
          [LBL.leitfrage, eff(ch.id, step, 'leitfrage', h.leitfrage ?? ''), true],
        ],
      })
    }
    blocks.push({
      heading: `${LBL.activity}: ${eff(ch.id, 3, 'activityTitle', ch.activity.title)}`,
      src: ch.activity.image.src,
      alt: ch.activity.image.alt,
      comment: edits.comments[commentKey(ch.id, 3)] ?? '',
      fill: ACCENT_DARK,
      rows: [['', eff(ch.id, 3, 'activityText', ch.activity.text), false]],
    })

    for (const b of blocks) {
      setCell(ws, `A${r}:I${r}`, b.heading, { size: 13, bold: true, color: WHITE, fill: b.fill, valign: 'middle' })
      ws.getRow(r).height = 22
      r++

      const imgTop = r
      const img = await fetchImage(b.src)
      if (img) {
        const id = wb.addImage({ buffer: img.buffer, extension: img.extension })
        ws.addImage(id, { tl: { col: 0.15, row: imgTop - 1 + 0.15 }, ext: { width: IMG_W, height: IMG_H } })
      } else {
        setCell(ws, `A${imgTop}:I${imgTop}`, LBL.missing(b.src.split('/').pop() ?? b.src), { size: 10, color: MUTED, italic: true })
      }
      r += IMG_ROWS

      if (b.comment) {
        setCell(ws, `A${r}:I${r}`, `${LBL.comment}: ${b.comment}`, { size: 10, italic: true, color: MUTED, wrap: true })
        ws.getRow(r).height = 28
        r++
      }

      for (const [label, text, italic] of b.rows) {
        if (label) setCell(ws, `A${r}`, label, { size: 10, bold: true, color: label === LBL.future ? ACCENT : undefined, valign: 'top' })
        setCell(ws, `B${r}:I${r}`, text, { size: 11, wrap: true, italic, valign: 'top' })
        ws.getRow(r).height = Math.max(40, Math.min(150, 22 + text.length / 1.6))
        r++
      }
      r++ // Abstand
    }
  }

  const buffer = await wb.xlsx.writeBuffer()
  const blob = new Blob([buffer as ArrayBuffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `Banking-Horizon-2035_Hypothesen_${lang.toUpperCase()}.xlsx`
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}
