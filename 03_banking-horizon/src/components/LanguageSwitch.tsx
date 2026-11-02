import { ChevronDown, Globe } from 'lucide-react'
import styles from './LanguageSwitch.module.css'
import { pick, useLang, type Lang } from '../i18n/LanguageContext'

// ─────────────────────────────────────────────────────────────────────────────
// LanguageSwitch — Sprache als kompaktes Dropdown (DE / EN / FR): translucentes
// Pill über dem Foto mit einfarbigem Globus, natives <select> darin, damit
// Tastatur und Screenreader ohne Zutun funktionieren. Keine Flaggen mehr.
// Das <select> füllt die ganze Pille, damit jeder Klick darauf die Liste öffnet.
// ─────────────────────────────────────────────────────────────────────────────

const OPTIONS: { id: Lang; label: string }[] = [
  { id: 'de', label: 'DE' },
  { id: 'en', label: 'EN' },
  { id: 'fr', label: 'FR' },
]

export function LanguageSwitch({ className }: { className?: string }): React.ReactElement {
  const { lang, setLang } = useLang()
  const aria = pick({ de: 'Sprache wählen', en: 'Choose language', fr: 'Choisir la langue' }, lang)
  return (
    <label className={[styles.switch, className].filter(Boolean).join(' ')} title={aria}>
      <Globe size={15} strokeWidth={2} className={styles.globe} aria-hidden />
      <select
        className={styles.select}
        value={lang}
        onChange={(e) => setLang(e.target.value as Lang)}
        aria-label={aria}
      >
        {OPTIONS.map(({ id, label }) => (
          <option key={id} value={id}>
            {label}
          </option>
        ))}
      </select>
      <ChevronDown size={14} strokeWidth={2.2} className={styles.chevron} aria-hidden />
    </label>
  )
}
