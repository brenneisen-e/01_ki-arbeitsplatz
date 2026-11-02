// Die Skripte des Notizfensters, ohne ihren Text: das Strukturbild braucht
// für das Menü am Deloitte-Logo nur Kennung und Titel (kein Markdown im
// Hauptbündel); den Text lädt speakernotes.html über skripte.ts.
export type SkriptEintrag = {
  id: string
  titel: string
  untertitel: string
  sprache: 'de' | 'en'
  /** Springt mit dem Strukturbild mit (Kapitel, Schritt, Einstiegsbühne). */
  folgtStrukturbild: boolean
}

export const SKRIPTE_LISTE: SkriptEintrag[] = [
  {
    id: 'markt-vertrieb',
    titel: 'Banking Horizon · Markt & Vertrieb',
    untertitel: 'Webcast, Deutsch, folgt dem Strukturbild',
    sprache: 'de',
    folgtStrukturbild: true,
  },
  {
    id: 'claude-code-pilot',
    titel: 'Claude Code pilot · Food for thought',
    untertitel: 'English, deck and demo',
    sprache: 'en',
    folgtStrukturbild: false,
  },
]

export const SKRIPT_KEY = 'bh-notizen-skript'
