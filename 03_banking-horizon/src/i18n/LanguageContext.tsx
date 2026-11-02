import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'

// ─────────────────────────────────────────────────────────────────────────────
// LanguageContext — sprachweite Umschaltung (Deutsch / Englisch / Französisch) für das
// gesamte Workshop-Tool „Banking Horizon 2030". Die Wahl wird in localStorage
// (`bz2030:lang`) gehalten, sodass ein Refresh die Sprache beibehält. Der Look
// der Umschaltung (Länderflaggen) ist von der Vertriebsarbeitsplatz-Landing
// übernommen.
//
// Verwendung:
//   const { lang, setLang } = useLang()
//   const t = STRINGS[lang]   // colozierte Komponenten-Strings
// ─────────────────────────────────────────────────────────────────────────────

export type Lang = 'de' | 'en' | 'fr'

const LANG_KEY = 'bz2030:lang'

/** Ein in alle drei Sprachen übersetzter String. */
export type L = { de: string; en: string; fr: string }

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
    return stored === 'en' || stored === 'fr' ? stored : 'de'
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
    document.title = pick(
      {
        de: 'Banking Horizon 2030 · begehbares Strukturbild',
        en: 'Banking Horizon 2030 · walkable cross-section',
        fr: 'Banking Horizon 2030 · vue en coupe interactive',
      },
      lang,
    )
    const desc = pick(
      {
        de: 'Banking Horizon 2030, interaktives Strukturbild der Bank für den Vorstands-Workshop: 8 Zonen, Hypothesen-Vergleiche und Demo-Absprünge.',
        en: 'Banking Horizon 2030, an interactive cross-section of the bank for the board workshop: 8 zones, hypothesis comparisons and demo hand-offs.',
        fr: 'Banking Horizon 2030, vue en coupe interactive de la banque pour l’atelier de direction : 8 zones, comparaisons d’hypothèses et accès aux démos.',
      },
      lang,
    )
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
