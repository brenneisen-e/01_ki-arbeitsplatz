// ─────────────────────────────────────────────────────────────────────────────
// chapterEdits — Bearbeitungs-Layer für (fast) alle Inhalte des Tools.
//
// Erlaubt es, im Bearbeitungsmodus praktisch jeden Text anzupassen: Hypothesen
// (Titel, Status Quo, 2030, Leitfrage), Aktivitäts-/Demo-Texte, Bild-Kommentare
// sowie die Management-Summary-Bausteine, KPI-Werte, Vision und Business Case.
// Ausgenommen ist nur das Strukturbild.
//
// PERSISTENZ (zweistufig):
//   1) sofort lokal im Browser (localStorage) — schnell, offline, pro Gerät.
//   2) geteilt auf dem Server (Cloudflare KV via /api/content) — per „Speichern"
//      für alle sichtbar. Beim Laden holt die App den geteilten Stand und legt
//      ihn über die Basisdaten. Ist der Server (KV) noch nicht eingerichtet,
//      bleibt alles beim localStorage-Verhalten — die App bricht nie.
//
// Schlüssel (alle im flachen `texts`-Record):
//   Hypothese/Aktivität:  `${chapterId}|${step}|${lang}|${field}`
//   Vision:               `${chapterId}|vision|${lang}`
//   Business Case:        `${chapterId}|businessCase|${lang}`
//   Summary-Bullet:       `${chapterId}|summaryBullet|${lang}|${i}`
//   KPI-Wert:             `${chapterId}|kpiValue|${i}`         (sprachunabhängig)
//   Kommentar (separat):  `${chapterId}|${step}`               (sprachunabhängig)
// ─────────────────────────────────────────────────────────────────────────────

import { useCallback, useEffect, useRef, useState } from 'react'
import type { Lang } from '../i18n/LanguageContext'

const STORAGE_KEY = 'bz2030:edits'
const MODE_KEY = 'bz2030:editmode'
// Absoluter Pfad: die Pages Functions liegen im deployten Root-`functions/`
// (das Pages-Projekt deployt das Repo-Root) und werden unter /api/* bedient —
// unabhängig vom Unterpfad, unter dem die App ausgeliefert wird.
const CONTENT_API = '/api/content'
const UPLOAD_API = '/api/upload'

export type EditField =
  | 'title'
  | 'statusQuo'
  | 'in2030'
  | 'leitfrage'
  | 'activityTitle'
  | 'activityText'
  | 'vision'
  | 'businessCase'

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

/** Chapter-Level-Schlüssel (unabhängig vom Reader-Schritt). */
export function visionKey(chapterId: string, lang: Lang): string {
  return `${chapterId}|vision|${lang}`
}
export function businessCaseKey(chapterId: string, lang: Lang): string {
  return `${chapterId}|businessCase|${lang}`
}
export function summaryBulletKey(chapterId: string, lang: Lang, i: number): string {
  return `${chapterId}|summaryBullet|${lang}|${i}`
}
export function kpiValueKey(chapterId: string, i: number): string {
  return `${chapterId}|kpiValue|${i}`
}
/** Bild-Override: Ersatz-URL je Standard-Bildpfad (z. B. hochgeladenes Bild). */
export function imageKey(src: string): string {
  return `img|${src}`
}

/**
 * Lädt eine Bilddatei in den Server-Store (Cloudflare R2 via /api/upload) und
 * liefert die öffentliche URL zurück — oder null, wenn kein Upload möglich ist
 * (R2 nicht gebunden / offline). Der Aufrufer speichert die URL als Override.
 */
export async function uploadImage(file: File): Promise<string | null> {
  try {
    const res = await fetch(UPLOAD_API, {
      method: 'POST',
      headers: { 'content-type': file.type || 'application/octet-stream' },
      body: file,
    })
    if (!res.ok) return null
    const data = (await res.json()) as { url?: string }
    return typeof data?.url === 'string' ? data.url : null
  } catch {
    return null
  }
}

function coerce(parsed: Partial<EditsData> | null | undefined): EditsData {
  if (!parsed || typeof parsed !== 'object') return { texts: {}, comments: {} }
  return {
    texts: parsed.texts && typeof parsed.texts === 'object' ? parsed.texts : {},
    comments: parsed.comments && typeof parsed.comments === 'object' ? parsed.comments : {},
  }
}

function read(): EditsData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return EMPTY
    return coerce(JSON.parse(raw) as Partial<EditsData>)
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

// ─── Server-Sync (Cloudflare KV via Pages Function) ──────────────────────────

async function fetchRemote(): Promise<EditsData | null> {
  try {
    const res = await fetch(CONTENT_API, { cache: 'no-store' })
    if (!res.ok) return null
    const data = (await res.json()) as Partial<EditsData>
    return coerce(data)
  } catch {
    return null
  }
}

async function pushRemote(data: EditsData): Promise<boolean> {
  try {
    const res = await fetch(CONTENT_API, {
      method: 'PUT',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(data),
    })
    return res.ok
  } catch {
    return false
  }
}

export type SyncState = 'idle' | 'loading' | 'saving' | 'saved' | 'error' | 'unconfigured'

export type ChapterEditsApi = {
  edits: EditsData
  setText: (key: string, value: string) => void
  setComment: (key: string, value: string) => void
  resetKey: (key: string) => void
  resetStep: (chapterId: string, step: number, lang: Lang) => void
  clearAll: () => void
  hasAny: boolean
  saveToServer: () => void
  syncState: SyncState
}

/**
 * Hook: hält den Bearbeitungs-Layer, schreibt lokal sofort durch (localStorage)
 * und synchronisiert mit dem geteilten Server-Stand (Cloudflare KV).
 */
export function useChapterEdits(): ChapterEditsApi {
  const [edits, setEdits] = useState<EditsData>(read)
  const [syncState, setSyncState] = useState<SyncState>('idle')
  const savedTimer = useRef<number | null>(null)

  // Beim Start den geteilten Stand laden und über die lokale Basis legen.
  useEffect(() => {
    let alive = true
    setSyncState('loading')
    fetchRemote().then((remote) => {
      if (!alive) return
      if (remote && (Object.keys(remote.texts).length || Object.keys(remote.comments).length)) {
        setEdits(remote)
        write(remote)
      }
      setSyncState('idle')
    })
    return () => {
      alive = false
      if (savedTimer.current) window.clearTimeout(savedTimer.current)
    }
  }, [])

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

  /** Einen einzelnen Text-Override löschen (Feld zurück auf Originalwert). */
  const resetKey = useCallback((key: string) => {
    setEdits((prev) => {
      if (!(key in prev.texts)) return prev
      const texts = { ...prev.texts }
      delete texts[key]
      const next: EditsData = { ...prev, texts }
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

  const saveToServer = useCallback(() => {
    setSyncState('saving')
    // aktuellen Stand aus dem State ziehen (setEdits-Callback als Getter)
    setEdits((current) => {
      pushRemote(current).then((ok) => {
        setSyncState(ok ? 'saved' : 'unconfigured')
        if (savedTimer.current) window.clearTimeout(savedTimer.current)
        savedTimer.current = window.setTimeout(() => setSyncState('idle'), 2600)
      })
      return current
    })
  }, [])

  const hasAny = Object.keys(edits.texts).length > 0 || Object.keys(edits.comments).length > 0

  return { edits, setText, setComment, resetKey, resetStep, clearAll, hasAny, saveToServer, syncState }
}

export { writeEditMode }
