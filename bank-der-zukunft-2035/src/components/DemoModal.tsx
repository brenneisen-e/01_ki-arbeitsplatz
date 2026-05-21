import { useEffect, useLayoutEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ExternalLink, X } from 'lucide-react'
import styles from './DemoModal.module.css'
import { useReducedMotion } from '../hooks/useReducedMotion'

export type DemoContent = {
  headline: string
  iframe?: { url: string; title: string }
}

type DemoModalProps = {
  isOpen: boolean
  onClose: () => void
  kicker: string
  demo: DemoContent | null
}

// Logische Render-Größe des eingebetteten Demo-Iframes. Wir rendern das
// iframe bei dieser fixen Auflösung und skalieren es per CSS-Transform in
// den verfügbaren Platz -- so kommt das Demo IMMER ohne Scrollbalken aus,
// unabhängig von der tatsächlichen Modal-Größe.
const IFRAME_LOGICAL_W = 1920
const IFRAME_LOGICAL_H = 1080

export function DemoModal({
  isOpen,
  onClose,
  kicker,
  demo,
}: DemoModalProps): React.ReactElement | null {
  const backdropRef = useRef<HTMLDivElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)
  const frameWrapperRef = useRef<HTMLDivElement>(null)
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const reducedMotion = useReducedMotion()

  useEffect(() => {
    if (!isOpen) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [isOpen, onClose])

  useEffect(() => {
    const backdrop = backdropRef.current
    const panel = panelRef.current
    if (!backdrop || !panel) return
    gsap.killTweensOf([backdrop, panel])
    if (isOpen) {
      if (reducedMotion) {
        gsap.set(backdrop, { opacity: 1 })
        gsap.set(panel, { opacity: 1, y: 0, scale: 1 })
      } else {
        gsap.fromTo(
          backdrop,
          { opacity: 0 },
          { opacity: 1, duration: 0.25, ease: 'power2.out' },
        )
        gsap.fromTo(
          panel,
          { opacity: 0, y: 24, scale: 0.98 },
          { opacity: 1, y: 0, scale: 1, duration: 0.4, ease: 'power3.out' },
        )
      }
    }
  }, [isOpen, reducedMotion])

  // Skalierung des iframes auf die tatsächliche Container-Größe. Wir
  // rechnen `scale = min(containerW / 1920, containerH / 1080)`, damit das
  // 16:9-Demo komplett ohne Scrollen passt. ResizeObserver hält die
  // Skalierung bei Modal-Größenänderungen aktuell.
  useLayoutEffect(() => {
    if (!isOpen) return
    const wrapper = frameWrapperRef.current
    const iframe = iframeRef.current
    if (!wrapper || !iframe) return
    const updateScale = () => {
      const w = wrapper.clientWidth
      const h = wrapper.clientHeight
      if (w <= 0 || h <= 0) return
      const scale = Math.min(w / IFRAME_LOGICAL_W, h / IFRAME_LOGICAL_H)
      iframe.style.transform = `translate(-50%, -50%) scale(${scale})`
    }
    updateScale()
    const ro = new ResizeObserver(updateScale)
    ro.observe(wrapper)
    window.addEventListener('resize', updateScale)
    return () => {
      ro.disconnect()
      window.removeEventListener('resize', updateScale)
    }
  }, [isOpen])

  if (!isOpen || !demo) return null

  return (
    <div
      className={styles.root}
      role="dialog"
      aria-modal="true"
      aria-labelledby="demo-modal-title"
    >
      <div
        ref={backdropRef}
        className={styles.backdrop}
        onClick={onClose}
        aria-hidden
      />
      <div ref={panelRef} className={styles.panel}>
        <header className={styles.header}>
          <div className={styles.headerText}>
            <span className={styles.kicker}>{kicker}</span>
            <h2 id="demo-modal-title" className={styles.title}>
              {demo.headline}
            </h2>
          </div>
          <button
            type="button"
            className={styles.closeButton}
            onClick={onClose}
            aria-label="Modal schließen"
          >
            <X size={18} strokeWidth={2} />
          </button>
        </header>

        {demo.iframe && (
          <div className={styles.body}>
            <div className={styles.iframeFrame}>
              <div className={styles.browserChrome} aria-hidden>
                <span className={styles.dot} data-color="red" />
                <span className={styles.dot} data-color="amber" />
                <span className={styles.dot} data-color="green" />
                <span className={styles.addressBar}>{demo.iframe.url}</span>
                <a
                  className={styles.openExternal}
                  href={demo.iframe.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Demo in neuem Tab öffnen"
                >
                  <ExternalLink size={13} strokeWidth={2} />
                </a>
              </div>
              <div ref={frameWrapperRef} className={styles.iframeViewport}>
                <iframe
                  ref={iframeRef}
                  className={styles.iframe}
                  style={{
                    width: `${IFRAME_LOGICAL_W}px`,
                    height: `${IFRAME_LOGICAL_H}px`,
                  }}
                  src={demo.iframe.url}
                  title={demo.iframe.title}
                  loading="lazy"
                  sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
