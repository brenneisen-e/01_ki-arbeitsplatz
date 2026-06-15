import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'

// ─────────────────────────────────────────────────────────────────────────────
// LanguageContext — sprachweite Umschaltung (Deutsch / Englisch) für das
// gesamte Workshop-Tool „Banking Horizon 2035". Die Wahl wird in localStorage
// (`bz2035:lang`) gehalten, sodass ein Refresh die Sprache beibehält. Der Look
// der Umschaltung (Länderflaggen) ist von der Vertriebsarbeitsplatz-Landing
// übernommen.
//
// Verwendung:
//   const { lang, setLang } = useLang()
//   const t = STRINGS[lang]   // colozierte Komponenten-Strings
// ─────────────────────────────────────────────────────────────────────────────

export type Lang = 'de' | 'en'

const LANG_KEY = 'bz2035:lang'

/** Ein in beide Sprachen übersetzter String. */
export type L = { de: string; en: string }

/** Löst einen lokalisierten String in die aktive Sprache auf. */
export function pick(value: L, lang: Lang): string {
  return value[lang] ?? value.de
}

type LanguageContextValue = {
  lang: Lang
  setLang: (lang: Lang) => void
}

const LanguageContext = createContext<LanguageContextValue | null>(null)

function readInitialLang(): Lang {
  try {
    const stored = localStorage.getItem(LANG_KEY)
    return stored === 'en' ? 'en' : 'de'
  } catch {
    return 'de'
  }
}

export function LanguageProvider({
  children,
}: {
  children: React.ReactNode
}): React.ReactElement {
  const [lang, setLangState] = useState<Lang>(readInitialLang)

  const setLang = useCallback((next: Lang) => {
    setLangState(next)
    try {
      localStorage.setItem(LANG_KEY, next)
    } catch {
      // localStorage nicht verfügbar (z. B. privater Modus) — dann eben ohne
      // Persistenz; die Umschaltung wirkt trotzdem in der laufenden Sitzung.
    }
  }, [])

  // Dokument-Sprache (<html lang>), Tab-Titel und Meta-Description an die aktive
  // Sprache anpassen (a11y / Browser-UI / Tab).
  useEffect(() => {
    document.documentElement.lang = lang
    document.title =
      lang === 'en'
        ? 'Banking Horizon 2035 — walkable cross-section'
        : 'Banking Horizon 2035 — begehbares Strukturbild'
    const desc =
      lang === 'en'
        ? 'Banking Horizon 2035 — an interactive cross-section of the bank for the board workshop: 8 zones, hypothesis comparisons and demo hand-offs.'
        : 'Banking Horizon 2035 — interaktives Strukturbild der Bank für den Vorstands-Workshop: 8 Zonen, Hypothesen-Vergleiche und Demo-Absprünge.'
    const meta = document.querySelector('meta[name="description"]')
    if (meta) meta.setAttribute('content', desc)
  }, [lang])

  const value = useMemo(() => ({ lang, setLang }), [lang, setLang])

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>
}

export function useLang(): LanguageContextValue {
  const ctx = useContext(LanguageContext)
  if (!ctx) {
    throw new Error('useLang must be used within a LanguageProvider')
  }
  return ctx
}
