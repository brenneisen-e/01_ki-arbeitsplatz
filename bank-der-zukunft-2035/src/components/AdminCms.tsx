import { useEffect, useMemo, useRef, useState } from 'react'
import {
  ArrowLeft,
  ArrowRight,
  Check,
  ImageIcon,
  RotateCcw,
  Save,
  X,
} from 'lucide-react'
import styles from './AdminCms.module.css'
import { useLang, type Lang } from '../i18n/LanguageContext'
import { getChapters, type Chapter } from '../data/chapters'
import { SUMMARY_BULLETS } from '../data/summaryBullets'
import {
  useChapterEdits,
  textKey,
  visionKey,
  businessCaseKey,
  summaryBulletKey,
  imageKey,
  uploadImage,
} from '../data/chapterEdits'

// ─────────────────────────────────────────────────────────────────────────────
// AdminCms — strukturierter Änderungsbereich („Mini-CMS").
//
// Statt der Inline-Stift-Bearbeitung ein eigener, je Kapitel sauber gegliederter
// Bereich: links die Kapitel-Navigation, rechts alle editierbaren Felder eines
// Kapitels (Vision, Business Case, je Hypothese Titel/Status Quo/2030/Leitfrage/
// Bild, Aktivität, Kernaussagen). Schreibt exakt dieselben Edit-Keys wie Reader
// und Excel-Export — Änderungen greifen also überall. „Für alle speichern" legt
// den Stand geteilt auf dem Server ab.
// ─────────────────────────────────────────────────────────────────────────────

const STR = {
  de: {
    title: 'Änderungsbereich',
    save: 'Für alle speichern',
    saving: 'Speichere…',
    saved: 'Gespeichert',
    unconfigured: 'Server nicht verbunden — nur lokal',
    resetAll: 'Alles zurücksetzen',
    close: 'Schließen',
    vision: 'Vision 2030',
    businessCase: 'Business Case',
    hypotheses: 'Hypothesen',
    hypothesis: 'Hypothese',
    activity: 'Aktivität / Demo',
    bullets: 'Kernaussagen (Management Summary)',
    fTitle: 'Titel',
    fQuo: 'Status Quo (heute)',
    fFuture: '2030',
    fLeitfrage: 'Leitfrage',
    fActTitle: 'Titel',
    fActText: 'Text',
    image: 'Bild',
    replaceImage: 'Bild ersetzen',
    uploading: 'Lade hoch…',
    uploadFail: 'Upload nicht möglich (R2 nicht verbunden)',
    changed: 'geändert',
    resetField: 'Feld zurücksetzen',
    prev: 'Vorheriges Kapitel',
    next: 'Nächstes Kapitel',
    confirmReset: 'Alle Änderungen (lokal und geteilt) verwerfen?',
    noBullets: 'Für dieses Kapitel sind keine Kernaussagen hinterlegt.',
    transformationHint:
      'Dieses Kapitel zeigt im Tool das Deloitte-Offering. Die folgenden Felder betreffen die Datengrundlage (u. a. Excel-Export).',
  },
  en: {
    title: 'Editing area',
    save: 'Save for everyone',
    saving: 'Saving…',
    saved: 'Saved',
    unconfigured: 'Server not connected — local only',
    resetAll: 'Reset everything',
    close: 'Close',
    vision: 'Vision 2030',
    businessCase: 'Business case',
    hypotheses: 'Hypotheses',
    hypothesis: 'Hypothesis',
    activity: 'Activity / demo',
    bullets: 'Key takeaways (management summary)',
    fTitle: 'Title',
    fQuo: 'Status quo (today)',
    fFuture: '2030',
    fLeitfrage: 'Guiding question',
    fActTitle: 'Title',
    fActText: 'Text',
    image: 'Image',
    replaceImage: 'Replace image',
    uploading: 'Uploading…',
    uploadFail: 'Upload not possible (R2 not connected)',
    changed: 'edited',
    resetField: 'Reset field',
    prev: 'Previous chapter',
    next: 'Next chapter',
    confirmReset: 'Discard all changes (local and shared)?',
    noBullets: 'No key takeaways defined for this chapter.',
    transformationHint:
      'In the tool this chapter shows the Deloitte offering. The fields below concern the underlying data (e.g. Excel export).',
  },
} as const

// Gemeinsamer String-Typ (DE/EN haben durch `as const` unterschiedliche Literal-
// typen — für die Feld-Props reicht ein reines String-Record).
type CmsStrings = { [K in keyof (typeof STR)['de']]: string }

type Props = { onClose: () => void }

export function AdminCms({ onClose }: Props): React.ReactElement {
  const { lang, setLang } = useLang()
  const t = STR[lang]
  const { edits, setText, resetKey, clearAll, saveToServer, syncState, hasAny } = useChapterEdits()
  // Nach Kapitelnummer sortiert (01…09), damit die Navigation der Reihenfolge
  // im Deck entspricht — die interne Array-Reihenfolge weicht davon ab.
  const chapters = useMemo(
    () => [...getChapters(lang)].sort((a, b) => a.kapitel.localeCompare(b.kapitel)),
    [lang],
  )
  const [activeIdx, setActiveIdx] = useState(0)
  const chapter: Chapter = chapters[activeIdx] ?? chapters[0]
  const mainRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  // Beim Kapitelwechsel nach oben scrollen.
  useEffect(() => {
    mainRef.current?.scrollTo({ top: 0 })
  }, [activeIdx])

  const gotoChapter = (idx: number) => {
    setActiveIdx(Math.max(0, Math.min(chapters.length - 1, idx)))
  }

  // Hat ein Kapitel Overrides? (für den Punkt in der Navigation)
  const chapterHasEdits = (c: Chapter): boolean =>
    Object.keys(edits.texts).some((k) => k.startsWith(`${c.id}|`)) ||
    c.hypotheses.some((h) => imageKey(h.image.src) in edits.texts) ||
    imageKey(c.activity.image.src) in edits.texts

  const saveLabel =
    syncState === 'saving'
      ? t.saving
      : syncState === 'saved'
      ? t.saved
      : syncState === 'unconfigured'
      ? t.unconfigured
      : t.save

  return (
    <div className={styles.overlay} role="dialog" aria-label={t.title}>
      <header className={styles.header}>
        <div className={styles.headLeft}>
          <span className={styles.title}>{t.title}</span>
          <div className={styles.langToggle} role="group">
            {(['de', 'en'] as Lang[]).map((l) => (
              <button
                key={l}
                type="button"
                className={styles.langBtn}
                data-active={lang === l || undefined}
                onClick={() => setLang(l)}
              >
                {l.toUpperCase()}
              </button>
            ))}
          </div>
        </div>
        <div className={styles.headRight}>
          <button
            type="button"
            className={styles.saveBtn}
            onClick={saveToServer}
            data-state={syncState}
          >
            <Save size={15} strokeWidth={2.2} aria-hidden />
            {saveLabel}
          </button>
          <button
            type="button"
            className={styles.resetAllBtn}
            disabled={!hasAny}
            onClick={() => {
              if (window.confirm(t.confirmReset)) clearAll()
            }}
          >
            <RotateCcw size={14} strokeWidth={2.2} aria-hidden />
            {t.resetAll}
          </button>
          <button type="button" className={styles.closeBtn} onClick={onClose} aria-label={t.close}>
            <X size={18} strokeWidth={2.2} aria-hidden />
          </button>
        </div>
      </header>

      <div className={styles.body}>
        <nav className={styles.sidebar} aria-label={t.title}>
          {chapters.map((c, i) => (
            <button
              key={c.id}
              type="button"
              className={styles.navItem}
              data-active={i === activeIdx || undefined}
              onClick={() => gotoChapter(i)}
            >
              <span className={styles.navNr}>{c.kapitel}</span>
              <span className={styles.navLabel}>{c.label}</span>
              {chapterHasEdits(c) && <span className={styles.navDot} aria-hidden />}
            </button>
          ))}
        </nav>

        <div className={styles.main} ref={mainRef}>
          <div className={styles.inner}>
            <h1 className={styles.chapterHead}>
              <span className={styles.chapterNr}>{chapter.kapitel}</span>
              {chapter.label}
            </h1>
            {chapter.id === 'transformation' && (
              <p className={styles.hint}>{t.transformationHint}</p>
            )}

            <Field
              label={t.vision}
              original={chapter.vision}
              editKey={visionKey(chapter.id, lang)}
              edits={edits}
              setText={setText}
              resetKey={resetKey}
              t={t}
              rows={4}
            />
            <Field
              label={t.businessCase}
              original={chapter.businessCase}
              editKey={businessCaseKey(chapter.id, lang)}
              edits={edits}
              setText={setText}
              resetKey={resetKey}
              t={t}
              rows={4}
            />

            <h2 className={styles.section}>{t.hypotheses}</h2>
            {chapter.hypotheses.map((h, i) => (
              <div className={styles.card} key={i}>
                <div className={styles.cardHead}>
                  {t.hypothesis} {i + 1}
                </div>
                <Field
                  label={t.fTitle}
                  original={h.title}
                  editKey={textKey(chapter.id, i, lang, 'title')}
                  edits={edits}
                  setText={setText}
                  resetKey={resetKey}
                  t={t}
                  input
                />
                <Field
                  label={t.fQuo}
                  original={h.statusQuo}
                  editKey={textKey(chapter.id, i, lang, 'statusQuo')}
                  edits={edits}
                  setText={setText}
                  resetKey={resetKey}
                  t={t}
                  rows={3}
                />
                <Field
                  label={t.fFuture}
                  original={h.in2030}
                  editKey={textKey(chapter.id, i, lang, 'in2030')}
                  edits={edits}
                  setText={setText}
                  resetKey={resetKey}
                  t={t}
                  rows={3}
                />
                <Field
                  label={t.fLeitfrage}
                  original={h.leitfrage ?? ''}
                  editKey={textKey(chapter.id, i, lang, 'leitfrage')}
                  edits={edits}
                  setText={setText}
                  resetKey={resetKey}
                  t={t}
                  rows={2}
                />
                <ImageField src={h.image.src} edits={edits} setText={setText} resetKey={resetKey} t={t} />
              </div>
            ))}

            <h2 className={styles.section}>{t.activity}</h2>
            <div className={styles.card}>
              <Field
                label={t.fActTitle}
                original={chapter.activity.title}
                editKey={textKey(chapter.id, chapter.hypotheses.length, lang, 'activityTitle')}
                edits={edits}
                setText={setText}
                resetKey={resetKey}
                t={t}
                input
              />
              <Field
                label={t.fActText}
                original={chapter.activity.text}
                editKey={textKey(chapter.id, chapter.hypotheses.length, lang, 'activityText')}
                edits={edits}
                setText={setText}
                resetKey={resetKey}
                t={t}
                rows={3}
              />
              <ImageField
                src={chapter.activity.image.src}
                edits={edits}
                setText={setText}
                resetKey={resetKey}
                t={t}
              />
            </div>

            <h2 className={styles.section}>{t.bullets}</h2>
            <div className={styles.card}>
              {(SUMMARY_BULLETS[chapter.id] ?? []).length === 0 ? (
                <p className={styles.hint}>{t.noBullets}</p>
              ) : (
                (SUMMARY_BULLETS[chapter.id] ?? []).map((b, i) => (
                  <Field
                    key={i}
                    label={`${i + 1}.`}
                    original={b[lang]}
                    editKey={summaryBulletKey(chapter.id, lang, i)}
                    edits={edits}
                    setText={setText}
                    resetKey={resetKey}
                    t={t}
                    rows={2}
                  />
                ))
              )}
            </div>

            <div className={styles.pager}>
              <button
                type="button"
                className={styles.pagerBtn}
                disabled={activeIdx === 0}
                onClick={() => gotoChapter(activeIdx - 1)}
              >
                <ArrowLeft size={16} strokeWidth={2.2} aria-hidden />
                {t.prev}
              </button>
              <button
                type="button"
                className={styles.pagerBtn}
                disabled={activeIdx === chapters.length - 1}
                onClick={() => gotoChapter(activeIdx + 1)}
              >
                {t.next}
                <ArrowRight size={16} strokeWidth={2.2} aria-hidden />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Ein editierbares Textfeld mit „geändert"-Badge und Feld-Reset ────────────
type FieldProps = {
  label: string
  original: string
  editKey: string
  edits: { texts: Record<string, string> }
  setText: (key: string, value: string) => void
  resetKey: (key: string) => void
  t: CmsStrings
  rows?: number
  input?: boolean
}

function Field({ label, original, editKey, edits, setText, resetKey, t, rows = 3, input }: FieldProps): React.ReactElement {
  const override = edits.texts[editKey]
  const value = override ?? original
  const changed = override !== undefined && override !== original
  return (
    <label className={styles.field}>
      <span className={styles.fieldHead}>
        <span className={styles.fieldLabel}>{label}</span>
        {changed && (
          <span className={styles.fieldTools}>
            <span className={styles.changedBadge}>{t.changed}</span>
            <button
              type="button"
              className={styles.resetFieldBtn}
              onClick={() => resetKey(editKey)}
              aria-label={t.resetField}
              title={t.resetField}
            >
              <RotateCcw size={12} strokeWidth={2.4} aria-hidden />
            </button>
          </span>
        )}
      </span>
      {input ? (
        <input
          className={styles.inputField}
          value={value}
          onChange={(e) => setText(editKey, e.target.value)}
        />
      ) : (
        <textarea
          className={styles.textField}
          value={value}
          rows={rows}
          onChange={(e) => setText(editKey, e.target.value)}
        />
      )}
    </label>
  )
}

// ── Bild-Ersetzen-Feld (Upload nach R2, Override als URL) ─────────────────────
type ImageFieldProps = {
  src: string
  edits: { texts: Record<string, string> }
  setText: (key: string, value: string) => void
  resetKey: (key: string) => void
  t: CmsStrings
}

function ImageField({ src, edits, setText, resetKey, t }: ImageFieldProps): React.ReactElement {
  const key = imageKey(src)
  const override = edits.texts[key]
  const effective = override ?? src
  const changed = override !== undefined && override !== src
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const onFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    setError(false)
    const url = await uploadImage(file)
    setUploading(false)
    if (url) setText(key, url)
    else setError(true)
    if (inputRef.current) inputRef.current.value = ''
  }

  return (
    <div className={styles.field}>
      <span className={styles.fieldHead}>
        <span className={styles.fieldLabel}>
          <ImageIcon size={13} strokeWidth={2} aria-hidden /> {t.image}
        </span>
        {changed && (
          <span className={styles.fieldTools}>
            <span className={styles.changedBadge}>{t.changed}</span>
            <button
              type="button"
              className={styles.resetFieldBtn}
              onClick={() => resetKey(key)}
              aria-label={t.resetField}
              title={t.resetField}
            >
              <RotateCcw size={12} strokeWidth={2.4} aria-hidden />
            </button>
          </span>
        )}
      </span>
      <div className={styles.imageRow}>
        <img className={styles.thumb} src={effective} alt="" loading="lazy" />
        <div className={styles.imageActions}>
          <input ref={inputRef} type="file" accept="image/*" hidden onChange={onFile} />
          <button
            type="button"
            className={styles.uploadBtn}
            disabled={uploading}
            onClick={() => inputRef.current?.click()}
          >
            {uploading ? t.uploading : t.replaceImage}
          </button>
          {error && <span className={styles.uploadErr}>{t.uploadFail}</span>}
          {changed && !error && (
            <span className={styles.uploadOk}>
              <Check size={13} strokeWidth={3} aria-hidden />
            </span>
          )}
        </div>
      </div>
    </div>
  )
}
