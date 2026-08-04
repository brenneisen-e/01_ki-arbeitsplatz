import { useEffect } from 'react'
import { ArrowLeft, ArrowRight, X } from 'lucide-react'
import styles from './EinstiegsBuehne.module.css'
import { useLang } from '../i18n/LanguageContext'
import type { Chapter } from '../data/chapters'
import { EINSTIEG, einstiegImage, hasEinstieg, type Einstieg } from '../data/einstieg'
import { useChapterEdits, einstiegKey } from '../data/chapterEdits'

// ─────────────────────────────────────────────────────────────────────────────
// EinstiegsBuehne — Landing eines Raum-Kapitels direkt nach dem Reinzoomen.
//
// Zeigt das hochauflösende Raum-Detailbild groß und LEITET das Kapitel ein
// (McKinsey-Stil): was die Abteilung heute tut (rolle) + ein Denkanstoß (frage)
// — OHNE die Hypothesen/2030 vorwegzunehmen. Ein CTA führt in den Reader.
// ─────────────────────────────────────────────────────────────────────────────

const STR = {
  de: {
    cta: 'Zu den Hypothesen',
    ctaTeaser: 'Zurück zur Übersicht',
    skip: 'Überspringen',
    kapitel: 'Kapitel',
  },
  en: {
    cta: 'To the hypotheses',
    ctaTeaser: 'Back to overview',
    skip: 'Skip',
    kapitel: 'Chapter',
  },
} as const

type Props = { chapter: Chapter; onWeiter: () => void }

export function EinstiegsBuehne({ chapter, onWeiter }: Props): React.ReactElement | null {
  const { lang } = useLang()
  const t = STR[lang]
  const { edits } = useChapterEdits()

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onWeiter()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onWeiter])

  const id = chapter.id
  if (!hasEinstieg(id)) return null
  const e: Einstieg = EINSTIEG[id]
  // Overrides aus dem Änderungsbereich (Einstiegs-Einleitung + Denkanstoß).
  const rolle = edits.texts[einstiegKey(id, lang, 'rolle')] ?? e.rolle[lang]
  const frage = edits.texts[einstiegKey(id, lang, 'frage')] ?? e.frage[lang]

  return (
    <div className={styles.overlay} role="dialog" aria-label={chapter.label}>
      <img className={styles.bg} src={einstiegImage(id)} alt="" aria-hidden />
      <span className={styles.scrim} aria-hidden />

      <button type="button" className={styles.skip} onClick={onWeiter}>
        {t.skip}
        <X size={15} strokeWidth={2.2} aria-hidden />
      </button>

      <div className={styles.panel}>
        <span className={styles.kicker}>
          {t.kapitel} {chapter.kapitel}
        </span>
        <h1 className={styles.title}>{chapter.label}</h1>
        <p className={styles.rolle}>{rolle}</p>
        <p className={styles.frage}>{frage}</p>

        {/* Teaser-Kapitel (nur Einstiegsbühne): CTA führt zurück zur Übersicht. */}
        {chapter.teaserOnly ? (
          <button type="button" className={styles.cta} onClick={onWeiter}>
            <ArrowLeft size={17} strokeWidth={2.2} aria-hidden />
            {t.ctaTeaser}
          </button>
        ) : (
          <button type="button" className={styles.cta} onClick={onWeiter}>
            {t.cta}
            <ArrowRight size={17} strokeWidth={2.2} aria-hidden />
          </button>
        )}
      </div>
    </div>
  )
}
