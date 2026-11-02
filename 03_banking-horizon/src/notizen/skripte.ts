import marktVertrieb from '../../docs/speakernotes-vortrag-markt-vertrieb.md?raw'
import claudeCodePilot from '../../docs/speakernotes-claude-code-pilot-en.md?raw'
import { SKRIPTE_LISTE, SKRIPT_KEY, type SkriptEintrag } from './skripteListe'

export type Skript = SkriptEintrag & { markdown: string }

const TEXTE: Record<string, string> = {
  'markt-vertrieb': marktVertrieb,
  'claude-code-pilot': claudeCodePilot,
}

export const SKRIPTE: Skript[] = SKRIPTE_LISTE.map((s) => ({ ...s, markdown: TEXTE[s.id] ?? '' }))

/** Skript beim Start: ?skript= in der Adresse, sonst die letzte Wahl, sonst das erste. */
export function skriptStart(): Skript {
  const ausUrl = new URLSearchParams(window.location.search).get('skript')
  let gespeichert: string | null = null
  try { gespeichert = localStorage.getItem(SKRIPT_KEY) } catch { /* ohne Speicher */ }
  return SKRIPTE.find((s) => s.id === ausUrl) ?? SKRIPTE.find((s) => s.id === gespeichert) ?? SKRIPTE[0]
}

export { SKRIPT_KEY }
