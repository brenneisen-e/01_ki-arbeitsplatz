// ─────────────────────────────────────────────────────────────────────────────
// Deep-Links — Hash-basierte URLs, um direkt ein Kapitel (Etage / Hypothesen)
// im Strukturbild aufzurufen. Hash-Routing, weil die App als statische SPE
// unter einem Unterpfad (…/bank-der-zukunft-2035/dist/) ausgeliefert wird und
// so ohne Server-Konfiguration tief verlinkbar ist.
//
// Schema:
//   #/                      → Intro/Chatbot (kein Deep-Link)
//   #/uebersicht            → Strukturbild-Übersicht
//   #/<kapitel>             → Kapitel öffnen (Hypothese 1)
//   #/<kapitel>/<n>         → Kapitel bei Schritt n (1–3 Hypothese, 4 Aktivität)
//
// <kapitel> ist die Kapitel-ID (z. B. 'vertrieb') ODER die Nummer ('02' / '2').
// Beispiele:
//   …/dist/#/vertrieb       (Markt & Vertrieb, erste Hypothese)
//   …/dist/#/vertrieb/3     (dritte Hypothese)
//   …/dist/#/02/4           (Aktivität von Kapitel 02)
// ─────────────────────────────────────────────────────────────────────────────

import { CHAPTER_IDS, CHAPTER_NUMBERS, type ChapterId } from './data/chapters'

// 3 Hypothesen (Schritt 0–2) + Aktivität (Schritt 3) — vgl. STEP_COUNT in
// ChapterReader. Hier als Konstante gehalten, um einen Modul-Zyklus mit der
// Komponente zu vermeiden.
const MAX_STEP = 3

export type DeepLink =
  | { view: 'intro' }
  | { view: 'overview' }
  | { view: 'chapter'; chapter: ChapterId; step: number }

/** Löst einen URL-Slug (ID oder Kapitel-Nummer) in eine ChapterId auf. */
function resolveChapter(slug: string): ChapterId | null {
  const lower = slug.toLowerCase()
  if ((CHAPTER_IDS as string[]).includes(lower)) return lower as ChapterId
  if (CHAPTER_NUMBERS[slug]) return CHAPTER_NUMBERS[slug]
  // Auch unpadded Zahlen erlauben: '2' → '02'.
  if (/^\d{1,2}$/.test(slug)) {
    const padded = slug.padStart(2, '0')
    if (CHAPTER_NUMBERS[padded]) return CHAPTER_NUMBERS[padded]
  }
  return null
}

/** Parst den aktuellen (oder übergebenen) Location-Hash in einen DeepLink. */
export function parseHash(hash: string = window.location.hash): DeepLink {
  const raw = hash.replace(/^#/, '').replace(/^\/+|\/+$/g, '')
  if (raw === '') return { view: 'intro' }

  const parts = raw.split('/')
  const head = parts[0].toLowerCase()
  if (head === 'uebersicht' || head === 'übersicht' || head === 'overview' || head === 'start') {
    return { view: 'overview' }
  }

  const chapter = resolveChapter(parts[0])
  if (!chapter) return { view: 'intro' }

  let step = 0
  if (parts[1]) {
    const n = Number.parseInt(parts[1], 10)
    if (Number.isFinite(n)) step = Math.min(Math.max(0, n - 1), MAX_STEP)
  }
  return { view: 'chapter', chapter, step }
}

/** Baut den Location-Hash für einen DeepLink (Intro → leerer Hash). */
export function formatHash(link: DeepLink): string {
  if (link.view === 'intro') return ''
  if (link.view === 'overview') return '#/uebersicht'
  const base = `#/${link.chapter}`
  return link.step > 0 ? `${base}/${link.step + 1}` : base
}
