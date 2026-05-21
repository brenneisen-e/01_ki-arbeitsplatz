import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ExternalLink, Search, Target, X } from 'lucide-react'
import styles from './DemoModal.module.css'
import { useReducedMotion } from '../hooks/useReducedMotion'

export type DemoContent = {
  headline: string
  slides: { title: string; statusQuo: string; in2035: string }[]
  iframe?: { url: string; title: string }
}

type DemoModalProps = {
  isOpen: boolean
  onClose: () => void
  kicker: string
  demo: DemoContent | null
}

export function DemoModal({
  isOpen,
  onClose,
  kicker,
  demo,
}: DemoModalProps): React.ReactElement | null {
  const backdropRef = useRef<HTMLDivElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)
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

        <div className={styles.body}>
          <section className={styles.slides} aria-label="Status Quo vs. 2035">
            {demo.slides.map((s, i) => (
              <article key={i} className={styles.slide}>
                <h3 className={styles.slideTitle}>{s.title}</h3>
                <div className={styles.compare}>
                  <div className={styles.statusQuo}>
                    <div className={styles.compareHead}>
                      <span className={styles.compareIcon}>
                        <Search size={16} strokeWidth={2.2} />
                      </span>
                      <span className={styles.compareLabel}>Status Quo</span>
                    </div>
                    <p className={styles.compareBody}>{s.statusQuo}</p>
                  </div>
                  <div className={styles.in2035}>
                    <div className={styles.compareHead}>
                      <span className={styles.compareIcon} data-accent>
                        <Target size={16} strokeWidth={2.2} />
                      </span>
                      <span className={styles.compareLabel}>In 2035</span>
                    </div>
                    <p className={styles.compareBody}>{s.in2035}</p>
                  </div>
                </div>
              </article>
            ))}
          </section>

          {demo.iframe && (
            <section className={styles.demoSection} aria-label="Live-Demo">
              <div className={styles.demoHeader}>
                <span className={styles.demoKicker}>Live-Demo</span>
                <a
                  className={styles.demoLink}
                  href={demo.iframe.url}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <span>In neuem Tab öffnen</span>
                  <ExternalLink size={13} strokeWidth={2} />
                </a>
              </div>
              <div className={styles.iframeFrame}>
                <iframe
                  className={styles.iframe}
                  src={demo.iframe.url}
                  title={demo.iframe.title}
                  loading="lazy"
                  sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
                />
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  )
}
