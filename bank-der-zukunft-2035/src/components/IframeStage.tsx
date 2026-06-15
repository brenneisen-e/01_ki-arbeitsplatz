import { useEffect, useLayoutEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ExternalLink, MonitorPlay, X } from 'lucide-react'
import styles from './IframeStage.module.css'
import { useReducedMotion } from '../hooks/useReducedMotion'
import { useLang, type Lang } from '../i18n/LanguageContext'

type StageStrings = {
  openNewTab: string
  close: string
  placeholderText: React.ReactNode
}

const STR: Record<Lang, StageStrings> = {
  de: {
    openNewTab: 'Demo in neuem Tab öffnen',
    close: 'Demo schließen',
    placeholderText: (
      <>
        Diese Demo ist noch nicht verdrahtet. Tragen Sie die URL im Handoff der
        Aktivität in <code>src/data/chapters.ts</code> ein — der Bildschirm zeigt sie
        dann hier in Vollbild.
      </>
    ),
  },
  en: {
    openNewTab: 'Open the demo in a new tab',
    close: 'Close the demo',
    placeholderText: (
      <>
        This demo is not wired up yet. Add the URL in the activity hand-off in{' '}
        <code>src/data/chapters.ts</code> — the screen will then show it here in full
        screen.
      </>
    ),
  },
}

// ─────────────────────────────────────────────────────────────────────────────
// IframeStage — der Demo-Absprung (Kap. 01 Liquid, 02 Vertriebscockpit,
// 05 SDLC). Der „Bildschirm im Bild" wächst per GSAP auf Vollbild, an seiner
// Stelle erscheint die echte Demo als iframe. Das iframe rendert bei fester
// 1920×1080-Logik und wird per ResizeObserver passgenau skaliert — die Demo
// kommt immer ohne eigene Scrollbalken aus.
//
// Ist noch keine URL hinterlegt (url === ''), zeigt die Stage einen sauberen
// Platzhalter statt eines leeren iframes.
// ─────────────────────────────────────────────────────────────────────────────

const IFRAME_LOGICAL_W = 1920
const IFRAME_LOGICAL_H = 1080

type IframeStageProps = {
  url: string
  title: string
  onClose: () => void
}

export function IframeStage({ url, title, onClose }: IframeStageProps): React.ReactElement {
  const backdropRef = useRef<HTMLDivElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)
  const viewportRef = useRef<HTMLDivElement>(null)
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const reducedMotion = useReducedMotion()
  const { lang } = useLang()
  const t = STR[lang]

  const hasUrl = url.trim() !== ''

  // Esc schließt.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  // Grow-in: der Bildschirm wächst aus der Mitte auf Vollbild.
  useEffect(() => {
    const backdrop = backdropRef.current
    const panel = panelRef.current
    if (!backdrop || !panel) return
    gsap.killTweensOf([backdrop, panel])
    if (reducedMotion) {
      gsap.set(backdrop, { opacity: 1 })
      gsap.set(panel, { opacity: 1, scale: 1 })
      return
    }
    gsap.fromTo(backdrop, { opacity: 0 }, { opacity: 1, duration: 0.3, ease: 'power2.out' })
    gsap.fromTo(
      panel,
      { opacity: 0, scale: 0.32 },
      { opacity: 1, scale: 1, duration: 0.6, ease: 'power3.out' },
    )
  }, [reducedMotion])

  // iframe maßstabsgetreu in den Viewport skalieren (cover ohne Scrollbalken).
  useLayoutEffect(() => {
    if (!hasUrl) return
    const viewport = viewportRef.current
    const iframe = iframeRef.current
    if (!viewport || !iframe) return
    const update = () => {
      const w = viewport.clientWidth
      const h = viewport.clientHeight
      if (w <= 0 || h <= 0) return
      const scale = Math.max(w / IFRAME_LOGICAL_W, h / IFRAME_LOGICAL_H)
      iframe.style.transform = `translate(-50%, -50%) scale(${scale})`
    }
    update()
    const ro = new ResizeObserver(update)
    ro.observe(viewport)
    window.addEventListener('resize', update)
    return () => {
      ro.disconnect()
      window.removeEventListener('resize', update)
    }
  }, [hasUrl])

  return (
    <div className={styles.root} role="dialog" aria-modal="true" aria-label={title}>
      <div ref={backdropRef} className={styles.backdrop} onClick={onClose} aria-hidden />
      <div ref={panelRef} className={styles.panel}>
        <header className={styles.chrome}>
          <span className={styles.chromeDots} aria-hidden>
            <span data-c="r" />
            <span data-c="a" />
            <span data-c="g" />
          </span>
          <span className={styles.address}>{hasUrl ? url : title}</span>
          <div className={styles.chromeActions}>
            {hasUrl && (
              <a
                className={styles.iconLink}
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={t.openNewTab}
              >
                <ExternalLink size={15} strokeWidth={2} />
              </a>
            )}
            <button
              type="button"
              className={styles.closeBtn}
              onClick={onClose}
              aria-label={t.close}
            >
              <X size={16} strokeWidth={2} />
            </button>
          </div>
        </header>

        {hasUrl ? (
          <div ref={viewportRef} className={styles.viewport}>
            <iframe
              ref={iframeRef}
              className={styles.iframe}
              style={{ width: `${IFRAME_LOGICAL_W}px`, height: `${IFRAME_LOGICAL_H}px` }}
              src={url}
              title={title}
              loading="lazy"
              sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
            />
          </div>
        ) : (
          <div className={styles.placeholder}>
            <span className={styles.phIcon} aria-hidden>
              <MonitorPlay size={30} strokeWidth={1.5} />
            </span>
            <span className={styles.phTitle}>{title}</span>
            <p className={styles.phText}>{t.placeholderText}</p>
          </div>
        )}
      </div>
    </div>
  )
}
