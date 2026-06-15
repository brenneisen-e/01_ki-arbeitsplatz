import styles from './LanguageSwitch.module.css'
import { useLang, type Lang } from '../i18n/LanguageContext'

// ─────────────────────────────────────────────────────────────────────────────
// LanguageSwitch — Länderflaggen-Umschalter (DE / EN), Look übernommen von der
// Vertriebsarbeitsplatz-Landing: translucentes Pill über dem Foto, aktive
// Sprache als heller Chip. Flaggen sind inline-SVGs (einfarbige Rechtecke bzw.
// Union-Jack-Geometrie) — keine Emojis, gemäß Produktrichtlinie.
// ─────────────────────────────────────────────────────────────────────────────

function FlagDE(): React.ReactElement {
  return (
    <svg className={styles.flag} viewBox="0 0 640 480" aria-hidden focusable="false">
      <rect width="640" height="160" fill="#000" />
      <rect y="160" width="640" height="160" fill="#D00" />
      <rect y="320" width="640" height="160" fill="#FFCE00" />
    </svg>
  )
}

function FlagEN(): React.ReactElement {
  return (
    <svg className={styles.flag} viewBox="0 0 60 30" aria-hidden focusable="false">
      <clipPath id="ls-s">
        <path d="M0,0 v30 h60 v-30 z" />
      </clipPath>
      <clipPath id="ls-t">
        <path d="M30,15 h30 v15 z v15 h-30 z h-30 v-15 z v-15 h30 z" />
      </clipPath>
      <g clipPath="url(#ls-s)">
        <path d="M0,0 v30 h60 v-30 z" fill="#012169" />
        <path d="M0,0 L60,30 M60,0 L0,30" stroke="#fff" strokeWidth="6" />
        <path d="M0,0 L60,30 M60,0 L0,30" clipPath="url(#ls-t)" stroke="#C8102E" strokeWidth="4" />
        <path d="M30,0 v30 M0,15 h60" stroke="#fff" strokeWidth="10" />
        <path d="M30,0 v30 M0,15 h60" stroke="#C8102E" strokeWidth="6" />
      </g>
    </svg>
  )
}

const OPTIONS: { id: Lang; label: string; Flag: () => React.ReactElement }[] = [
  { id: 'de', label: 'DE', Flag: FlagDE },
  { id: 'en', label: 'EN', Flag: FlagEN },
]

export function LanguageSwitch({ className }: { className?: string }): React.ReactElement {
  const { lang, setLang } = useLang()
  return (
    <div
      className={[styles.switch, className].filter(Boolean).join(' ')}
      role="group"
      aria-label={lang === 'de' ? 'Sprache wählen' : 'Choose language'}
    >
      {OPTIONS.map(({ id, label, Flag }) => (
        <button
          key={id}
          type="button"
          className={styles.option}
          data-active={lang === id || undefined}
          onClick={() => setLang(id)}
          aria-pressed={lang === id}
        >
          <Flag />
          <span className={styles.code}>{label}</span>
        </button>
      ))}
    </div>
  )
}
