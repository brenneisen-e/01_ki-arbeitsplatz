import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'
import {
  ArrowRight,
  BookOpen,
  Check,
  ChevronLeft,
  ChevronRight,
  CloudUpload,
  Loader2,
  Pencil,
  Sparkles,
  X,
} from 'lucide-react'
import styles from './ManagementSummary.module.css'
import { getChapters, getMasterImage, type Chapter } from '../data/chapters'
import { useReducedMotion } from '../hooks/useReducedMotion'
import { useLang, type Lang } from '../i18n/LanguageContext'
import {
  businessCaseKey,
  readEditMode,
  useChapterEdits,
  visionKey,
  writeEditMode,
} from '../data/chapterEdits'

// ─────────────────────────────────────────────────────────────────────────────
// ManagementSummary — die Vision der „Bank 2030" als hochwertiges, blätterbares
// Magazin. Papierseiten mit echtem 3D-Page-Flip auf dunklem, weichgezeichnetem
// Hintergrund (das Strukturbild dahinter). Seitenfolge:
//   1. Cover (Strukturbild als Hero)
//   2. Editorial / Gesamtzusammenfassung + Inhalt
//   3..N. je eine Seite pro Kapitel (Vision + Kernhypothesen, mit Bild)
//   N+1. Schlussblatt
// Navigation: Pfeiltasten / Chevron-Buttons / Punkte, Esc schließt.
// ─────────────────────────────────────────────────────────────────────────────

// logo.dev (öffentlicher Publishable-Key, identisch zu den übrigen Repo-Apps).
const LOGO_TOKEN = 'pk_H7vb5Y2lTsW47U4Xq-w3HA'
const DELOITTE_LOGO = `https://img.logo.dev/deloitte.com?token=${LOGO_TOKEN}&format=png&size=240&retina=true`

const FLIP_DURATION = 0.72

type SummaryStrings = {
  aria: string
  kicker: string
  title: string
  close: string
  coverSubtitle: string
  leadTitle: string
  gesamt: string
  tocTitle: string
  hypothesesLabel: string
  todayLabel: string
  futureLabel: string
  visionTag: string
  ortLabel: string
  closingTitle: string
  closingText: string
  footNote: string
  pageLabel: string
  prev: string
  next: string
  businessCaseLabel: string
  edit: string
  editDone: string
  saveShared: string
  saving: string
  saved: string
}

// Gesamtzusammenfassung — synthetisiert die acht Bereichs-Visionen zu einem
// durchgehenden Zielbild der „Bank 2030". `**fett**` markiert die Kernaussagen.
const STR: Record<Lang, SummaryStrings> = {
  de: {
    aria: 'Management Summary — Vision der Bank 2030 als Magazin',
    kicker: 'Banking Horizon 2030',
    title: 'Management Summary',
    close: 'Management Summary schließen',
    coverSubtitle: 'Die Vision der Bank 2030 — zum Durchblättern',
    leadTitle: 'Gesamtzusammenfassung',
    gesamt:
      'Bis 2030 wird unsere Bank zur **AI-nativen Plattform-Bank**: Banking wird für Kund:innen **unsichtbar und Teil des Alltags**, der Vertrieb **orchestriert hyperpersonalisierte Lösungen** statt Produkte, die Marktfolge wird **vom Kostenblock zur Plattform**. Produkte entstehen als **lebende, adaptive Services für das Segment of One** — komponiert in Tagen statt Jahren. Software **entwickelt sich weitgehend selbst** in klaren Leitplanken, Compliance ist **in jede Entscheidung eingebaut** — den Weg dorthin gehen wir **decision-first**.',
    tocTitle: 'In dieser Ausgabe',
    hypothesesLabel: 'Kernhypothesen',
    todayLabel: 'Heute',
    futureLabel: '2030',
    visionTag: 'Vision 2030',
    ortLabel: 'Verortung',
    closingTitle: 'Vom Zielbild zur Umsetzung',
    closingText:
      'Diese acht Visionen ergeben **ein zusammenhängendes Zielbild** — keine Sammlung von Einzelinitiativen. Der Weg dorthin ist **decision-first**: Wir starten bei den Entscheidungen, die den größten Wert heben, und bauen Daten, Plattform und Governance konsequent darum herum.',
    footNote: 'Vorstands-Workshop · abgeleitet aus den Hypothesen aller Kapitel',
    pageLabel: 'Seite',
    prev: 'Vorherige Seite',
    next: 'Nächste Seite',
    businessCaseLabel: 'Business Case (exemplarisch)',
    edit: 'Bearbeiten',
    editDone: 'Fertig',
    saveShared: 'Für alle speichern',
    saving: 'Speichere…',
    saved: 'Gespeichert',
  },
  en: {
    aria: 'Management summary — vision of the bank in 2030 as a magazine',
    kicker: 'Banking Horizon 2030',
    title: 'Management Summary',
    close: 'Close the management summary',
    coverSubtitle: 'The vision of the bank in 2030 — to leaf through',
    leadTitle: 'Overall summary',
    gesamt:
      'By 2030 our bank becomes an **AI-native platform bank**: for customers, banking turns **invisible and part of everyday life**, distribution **orchestrates hyper-personalised solutions** instead of products, and operations move **from a cost block to a platform**. Products emerge as **living, adaptive services for the segment of one** — composed in days rather than years. Software **largely develops itself** within clear guardrails, compliance is **built into every decision** — and we get there **decision-first**.',
    tocTitle: 'In this issue',
    hypothesesLabel: 'Core hypotheses',
    todayLabel: 'Today',
    futureLabel: '2030',
    visionTag: 'Vision 2030',
    ortLabel: 'Location',
    closingTitle: 'From target picture to delivery',
    closingText:
      'These eight visions form **one coherent target picture** — not a collection of isolated initiatives. The path there is **decision-first**: we start with the decisions that unlock the most value and build data, platform and governance consistently around them.',
    footNote: 'Board workshop · derived from the hypotheses across all chapters',
    pageLabel: 'Page',
    prev: 'Previous page',
    next: 'Next page',
    businessCaseLabel: 'Business case (illustrative)',
    edit: 'Edit',
    editDone: 'Done',
    saveShared: 'Save for everyone',
    saving: 'Saving…',
    saved: 'Saved',
  },
}

// Mini-Markdown: **fett** → <strong>. Sonst Klartext (analog ChapterReader).
function renderRichText(text: string): React.ReactNode[] {
  return text.split(/(\*\*[^*]+\*\*)/g).map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={i}>{part.slice(2, -2)}</strong>
    }
    return <span key={i}>{part}</span>
  })
}

type Page =
  | { kind: 'cover' }
  | { kind: 'overview' }
  | { kind: 'chapter'; chapter: Chapter }
  | { kind: 'closing' }

type ManagementSummaryProps = {
  onClose: () => void
}

export function ManagementSummary({
  onClose,
}: ManagementSummaryProps): React.ReactElement {
  const backdropRef = useRef<HTMLDivElement>(null)
  const shellRef = useRef<HTMLDivElement>(null)
  const flipRef = useRef<HTMLDivElement>(null)
  const shadeRef = useRef<HTMLDivElement>(null)
  const animatingRef = useRef(false)
  const [logoFailed, setLogoFailed] = useState(false)
  const [index, setIndex] = useState(0)
  const [anim, setAnim] = useState<{ dir: 'next' | 'prev'; from: number; to: number } | null>(null)
  const reducedMotion = useReducedMotion()
  const { lang } = useLang()
  const t = STR[lang]
  const chapters = getChapters(lang)
  const masterImage = getMasterImage(lang)
  const { edits, setText, saveToServer, syncState } = useChapterEdits()
  const [editMode, setEditMode] = useState(readEditMode)
  const toggleEdit = () =>
    setEditMode((on) => {
      writeEditMode(!on)
      return !on
    })

  const pages: Page[] = [
    { kind: 'cover' },
    { kind: 'overview' },
    ...chapters.map((chapter): Page => ({ kind: 'chapter', chapter })),
    { kind: 'closing' },
  ]
  const lastIndex = pages.length - 1

  // Esc schließt; Pfeiltasten blättern.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
      else if (e.key === 'ArrowRight') flip('next')
      else if (e.key === 'ArrowLeft') flip('prev')
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index, pages.length])

  // Fade-/Grow-in des Magazins (analog IframeStage).
  useLayoutEffect(() => {
    const backdrop = backdropRef.current
    const shell = shellRef.current
    if (!backdrop || !shell) return
    gsap.killTweensOf([backdrop, shell])
    if (reducedMotion) {
      gsap.set(backdrop, { opacity: 1 })
      gsap.set(shell, { opacity: 1, scale: 1, y: 0 })
      return
    }
    gsap.fromTo(backdrop, { opacity: 0 }, { opacity: 1, duration: 0.3, ease: 'power2.out' })
    gsap.fromTo(
      shell,
      { opacity: 0, scale: 0.96, y: 18 },
      { opacity: 1, scale: 1, y: 0, duration: 0.5, ease: 'power3.out' },
    )
  }, [reducedMotion])

  // Page-Flip ausführen, sobald `anim` gesetzt ist.
  useLayoutEffect(() => {
    if (!anim) return
    const el = flipRef.current
    if (!el) return
    const fromRot = anim.dir === 'next' ? 0 : -180
    const toRot = anim.dir === 'next' ? -180 : 0
    gsap.set(el, { rotateY: fromRot })
    const shade = shadeRef.current
    const tl = gsap.timeline({
      onComplete: () => {
        setIndex(anim.to)
        setAnim(null)
        animatingRef.current = false
      },
    })
    tl.to(el, { rotateY: toRot, duration: FLIP_DURATION, ease: 'power2.inOut' }, 0)
    if (shade) {
      const half = FLIP_DURATION / 2
      tl.fromTo(shade, { opacity: 0 }, { opacity: 0.42, duration: half, ease: 'power1.in' }, 0)
        .to(shade, { opacity: 0, duration: half, ease: 'power1.out' }, half)
    }
    return () => {
      tl.kill()
    }
  }, [anim])

  function flip(dir: 'next' | 'prev'): void {
    if (animatingRef.current) return
    const to = dir === 'next' ? index + 1 : index - 1
    if (to < 0 || to > lastIndex) return
    if (reducedMotion) {
      setIndex(to)
      return
    }
    animatingRef.current = true
    setAnim({ dir, from: index, to })
  }

  function jumpTo(target: number): void {
    if (animatingRef.current || target === index || target < 0 || target > lastIndex) return
    if (reducedMotion) {
      setIndex(target)
      return
    }
    animatingRef.current = true
    setAnim({ dir: target > index ? 'next' : 'prev', from: index, to: target })
  }

  const baseIndex = anim ? (anim.dir === 'next' ? anim.to : anim.from) : index
  const flipIndex = anim ? (anim.dir === 'next' ? anim.from : anim.to) : index

  return (
    <div className={styles.root} role="dialog" aria-modal="true" aria-label={t.aria}>
      <div ref={backdropRef} className={styles.backdrop} onClick={onClose} aria-hidden />

      <div className={styles.msTools}>
        <button
          type="button"
          className={styles.msTool}
          data-on={editMode || undefined}
          onClick={toggleEdit}
          aria-pressed={editMode}
        >
          <Pencil size={14} strokeWidth={2} aria-hidden /> {editMode ? t.editDone : t.edit}
        </button>
        {editMode && (
          <button
            type="button"
            className={styles.msSave}
            onClick={saveToServer}
            disabled={syncState === 'saving'}
            data-state={syncState}
          >
            {syncState === 'saving' ? (
              <Loader2 size={13} strokeWidth={2} className={styles.spin} aria-hidden />
            ) : syncState === 'saved' ? (
              <Check size={13} strokeWidth={2.6} aria-hidden />
            ) : (
              <CloudUpload size={13} strokeWidth={2} aria-hidden />
            )}
            {syncState === 'saving' ? t.saving : syncState === 'saved' ? t.saved : t.saveShared}
          </button>
        )}
      </div>

      <button type="button" className={styles.closeBtn} onClick={onClose} aria-label={t.close}>
        <X size={18} strokeWidth={2} />
      </button>

      <div ref={shellRef} className={styles.shell}>
        <button
          type="button"
          className={`${styles.nav} ${styles.navPrev}`}
          onClick={() => flip('prev')}
          disabled={index === 0}
          aria-label={t.prev}
        >
          <ChevronLeft size={26} strokeWidth={2} />
        </button>

        <div className={styles.stage}>
          {anim ? (
            <>
              <div className={styles.page}>{renderPage(pages[baseIndex])}</div>
              <div ref={flipRef} className={`${styles.page} ${styles.flip}`}>
                {renderPage(pages[flipIndex])}
                <div ref={shadeRef} className={styles.shade} aria-hidden />
              </div>
            </>
          ) : (
            <div className={styles.page}>{renderPage(pages[index])}</div>
          )}
        </div>

        <button
          type="button"
          className={`${styles.nav} ${styles.navNext}`}
          onClick={() => flip('next')}
          disabled={index === lastIndex}
          aria-label={t.next}
        >
          <ChevronRight size={26} strokeWidth={2} />
        </button>
      </div>

      <div className={styles.pager}>
        <span className={styles.pageCount}>
          {t.pageLabel} {String(index + 1).padStart(2, '0')} / {String(pages.length).padStart(2, '0')}
        </span>
        <div className={styles.dots}>
          {pages.map((_, i) => (
            <button
              key={i}
              type="button"
              className={`${styles.dot} ${i === index ? styles.dotActive : ''}`}
              onClick={() => jumpTo(i)}
              aria-label={`${t.pageLabel} ${i + 1}`}
              aria-current={i === index || undefined}
            />
          ))}
        </div>
      </div>
    </div>
  )

  // ── Seiten-Renderer ──────────────────────────────────────────────────────
  function renderPage(page: Page): React.ReactElement {
    switch (page.kind) {
      case 'cover':
        return (
          <div className={`${styles.content} ${styles.coverPage}`}>
            <div className={styles.coverTop}>
              <span className={styles.logoTile}>
                {logoFailed ? (
                  <span className={styles.logoFallback}>
                    Deloitte<span className={styles.logoDot}>.</span>
                  </span>
                ) : (
                  <img
                    className={styles.logoImg}
                    src={DELOITTE_LOGO}
                    alt="Deloitte"
                    width={150}
                    height={36}
                    onError={() => setLogoFailed(true)}
                  />
                )}
              </span>
              <span className={styles.coverKicker}>{t.kicker}</span>
            </div>
            <div className={styles.coverHead}>
              <h2 className={styles.coverTitle}>{t.title}</h2>
              <p className={styles.coverSubtitle}>{t.coverSubtitle}</p>
            </div>
            <figure className={styles.coverFigure}>
              <img className={styles.coverImg} src={masterImage.src} alt={masterImage.alt} />
            </figure>
            <span className={styles.coverFoot}>{t.footNote}</span>
          </div>
        )

      case 'overview':
        return (
          <div className={`${styles.content} ${styles.overviewPage}`}>
            <span className={styles.sectionKicker}>
              <BookOpen size={13} strokeWidth={2} />
              {t.leadTitle}
            </span>
            <p className={styles.lead}>{renderRichText(t.gesamt)}</p>
            <div className={styles.tocBlock}>
              <span className={styles.tocTitle}>{t.tocTitle}</span>
              <ol className={styles.toc}>
                {chapters.map((c) => (
                  <li key={c.id} className={styles.tocItem}>
                    <span className={styles.tocNum}>{c.kapitel}</span>
                    <span className={styles.tocLabel}>{c.label}</span>
                    <ArrowRight className={styles.tocArrow} size={14} strokeWidth={2} aria-hidden />
                  </li>
                ))}
              </ol>
            </div>
          </div>
        )

      case 'chapter': {
        const c = page.chapter
        return (
          <div className={`${styles.content} ${styles.chapterPage}`}>
            <figure className={styles.chapterFigure}>
              <img
                className={styles.chapterImg}
                src={c.hypotheses[0].image.src}
                alt={c.hypotheses[0].image.alt}
              />
              <span className={styles.chapterNum}>{c.kapitel}</span>
            </figure>
            <div className={styles.chapterHead}>
              <h3 className={styles.chapterTitle}>{c.label}</h3>
              <span className={styles.chapterOrt}>
                {t.ortLabel}: {c.ort}
              </span>
            </div>
            {editMode ? (
              <textarea
                className={styles.editArea}
                value={edits.texts[visionKey(c.id, lang)] ?? c.vision}
                onChange={(e) => setText(visionKey(c.id, lang), e.target.value)}
                rows={4}
                aria-label={t.visionTag}
              />
            ) : (
              <p className={styles.chapterVision}>
                {renderRichText(edits.texts[visionKey(c.id, lang)] ?? c.vision)}
              </p>
            )}
            <div className={styles.hypoBlock}>
              <span className={styles.hypoLabel}>
                <Sparkles size={12} strokeWidth={2.2} />
                {t.hypothesesLabel}
              </span>
              <ul className={styles.hypoList}>
                {c.hypotheses.map((h, i) => (
                  <li key={i} className={styles.hypoItem}>
                    <span className={styles.hypoTitle}>{h.title}</span>
                    <span className={styles.hypoFuture}>
                      <span className={styles.hypoTag}>{t.futureLabel}</span>
                      {renderRichText(h.in2030)}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
            <div className={styles.bcBlock}>
              <span className={styles.bcLabel}>
                <BookOpen size={12} strokeWidth={2.2} aria-hidden />
                {t.businessCaseLabel}
              </span>
              {editMode ? (
                <textarea
                  className={styles.editArea}
                  value={edits.texts[businessCaseKey(c.id, lang)] ?? c.businessCase}
                  onChange={(e) => setText(businessCaseKey(c.id, lang), e.target.value)}
                  rows={3}
                  aria-label={t.businessCaseLabel}
                />
              ) : (
                <p className={styles.bcText}>
                  {renderRichText(edits.texts[businessCaseKey(c.id, lang)] ?? c.businessCase)}
                </p>
              )}
            </div>
          </div>
        )
      }

      case 'closing':
        return (
          <div className={`${styles.content} ${styles.closingPage}`}>
            <span className={styles.visionTag}>
              <Sparkles size={12} strokeWidth={2.2} />
              {t.visionTag}
            </span>
            <h3 className={styles.closingTitle}>{t.closingTitle}</h3>
            <p className={styles.closingText}>{renderRichText(t.closingText)}</p>
            <span className={styles.closingFoot}>{t.footNote}</span>
            <span className={styles.logoTile}>
              {logoFailed ? (
                <span className={styles.logoFallback}>
                  Deloitte<span className={styles.logoDot}>.</span>
                </span>
              ) : (
                <img
                  className={styles.logoImg}
                  src={DELOITTE_LOGO}
                  alt="Deloitte"
                  width={150}
                  height={36}
                  onError={() => setLogoFailed(true)}
                />
              )}
            </span>
          </div>
        )
    }
  }
}
