// ─────────────────────────────────────────────────────────────────────────────
// chapterEdits — lokaler Bearbeitungs-Layer für den ChapterReader.
//
// Erlaubt es, die Hypothesen-Texte (Titel, Status Quo, 2030, Leitfrage) sowie
// optionale Bild-Kommentare im Workshop anzupassen. Die Änderungen werden NUR
// lokal im Browser (localStorage) gehalten — die Demo-Daten im Repo bleiben
// unverändert. Beim Rendern werden vorhandene Overrides über die Basisdaten
// gelegt.
//
// Schlüssel:
//   Text:     `${chapterId}|${step}|${lang}|${field}`   (sprachabhängig)
//   Kommentar:`${chapterId}|${step}`                    (sprachunabhängig)
// ─────────────────────────────────────────────────────────────────────────────

import { useCallback, useState } from 'react'
import type { Lang } from '../i18n/LanguageContext'

const STORAGE_KEY = 'bz2030:edits'
const MODE_KEY = 'bz2030:editmode'

export type EditField =
  | 'title'
  | 'statusQuo'
  | 'in2030'
  | 'leitfrage'
  | 'activityTitle'
  | 'activityText'

export type EditsData = {
  texts: Record<string, string>
  comments: Record<string, string>
}

const EMPTY: EditsData = { texts: {}, comments: {} }

export function textKey(chapterId: string, step: number, lang: Lang, field: EditField): string {
  return `${chapterId}|${step}|${lang}|${field}`
}

export function commentKey(chapterId: string, step: number): string {
  return `${chapterId}|${step}`
}

function read(): EditsData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return EMPTY
    const parsed = JSON.parse(raw) as Partial<EditsData>
    return {
      texts: parsed.texts && typeof parsed.texts === 'object' ? parsed.texts : {},
      comments: parsed.comments && typeof parsed.comments === 'object' ? parsed.comments : {},
    }
  } catch {
    return EMPTY
  }
}

function write(data: EditsData): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  } catch {
    // localStorage nicht verfügbar (z. B. privater Modus) — dann ohne Persistenz.
  }
}

export function readEditMode(): boolean {
  try {
    return localStorage.getItem(MODE_KEY) === '1'
  } catch {
    return false
  }
}

function writeEditMode(on: boolean): void {
  try {
    localStorage.setItem(MODE_KEY, on ? '1' : '0')
  } catch {
    // ohne Persistenz weiter
  }
}

export type ChapterEditsApi = {
  edits: EditsData
  setText: (key: string, value: string) => void
  setComment: (key: string, value: string) => void
  resetStep: (chapterId: string, step: number, lang: Lang) => void
  clearAll: () => void
  hasAny: boolean
}

/** Hook: hält den Bearbeitungs-Layer und schreibt Änderungen durch in localStorage. */
export function useChapterEdits(): ChapterEditsApi {
  const [edits, setEdits] = useState<EditsData>(read)

  const setText = useCallback((key: string, value: string) => {
    setEdits((prev) => {
      const next: EditsData = { ...prev, texts: { ...prev.texts, [key]: value } }
      write(next)
      return next
    })
  }, [])

  const setComment = useCallback((key: string, value: string) => {
    setEdits((prev) => {
      const comments = { ...prev.comments }
      if (value.trim() === '') delete comments[key]
      else comments[key] = value
      const next: EditsData = { ...prev, comments }
      write(next)
      return next
    })
  }, [])

  const resetStep = useCallback((chapterId: string, step: number, lang: Lang) => {
    setEdits((prev) => {
      const texts = { ...prev.texts }
      const fields: EditField[] = [
        'title',
        'statusQuo',
        'in2030',
        'leitfrage',
        'activityTitle',
        'activityText',
      ]
      for (const f of fields) delete texts[textKey(chapterId, step, lang, f)]
      const comments = { ...prev.comments }
      delete comments[commentKey(chapterId, step)]
      const next: EditsData = { texts, comments }
      write(next)
      return next
    })
  }, [])

  const clearAll = useCallback(() => {
    write(EMPTY)
    setEdits(EMPTY)
  }, [])

  const hasAny = Object.keys(edits.texts).length > 0 || Object.keys(edits.comments).length > 0

  return { edits, setText, setComment, resetStep, clearAll, hasAny }
}

export { writeEditMode }
