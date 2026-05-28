import { useCallback, useEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'
import { ArrowRight, Send, Sparkles } from 'lucide-react'
import styles from './IntroChatbot.module.css'
import { ImageSlot } from './ImageSlot'
import { MASTER_IMAGE } from '../data/chapters'
import { useReducedMotion } from '../hooks/useReducedMotion'

// ─────────────────────────────────────────────────────────────────────────────
// IntroChatbot — Variante A (scripted, deterministisch).
//
// Der Workshop startet mit einem premium KI-Chat. Eine vorbereitete Frage
// wird vom Moderator ausgelöst, es folgt eine inszenierte „Reasoning"-
// Sequenz, und statt einer Textantwort baut sich das Strukturbild auf
// (Reveal). Danach betritt man per Klick die begehbare Übersicht.
//
// Bewusst ohne Live-API: läuft zuverlässig, reproduzierbar, ohne Netz —
// die sichere Wahl für ein Vorstandspublikum.
// ─────────────────────────────────────────────────────────────────────────────

const QUESTION =
  'Wie sieht eigentlich eine Bank 2026 aus — und wo steht sie im Vergleich zur Bank 2035?'

const REASONING = [
  'Analysiere Geschäftsmodell',
  'Kundenschnittstelle',
  'Betriebsmodell',
  'Governance & Risiko',
  'Komponiere Strukturbild',
]

const LINE_INTERVAL = 720
const REVEAL_PAUSE = 600

type Phase = 'idle' | 'thinking' | 'revealed'

export function IntroChatbot({
  onEnter,
}: {
  onEnter: () => void
}): React.ReactElement {
  const [phase, setPhase] = useState<Phase>('idle')
  const [visibleLines, setVisibleLines] = useState(0)
  const revealRef = useRef<HTMLDivElement>(null)
  const ctaRef = useRef<HTMLDivElement>(null)
  const reducedMotion = useReducedMotion()

  const ask = useCallback(() => {
    setPhase((p) => (p === 'idle' ? 'thinking' : p))
  }, [])

  // Reasoning-Sequenz: Zeilen nacheinander einblenden, dann Reveal.
  useEffect(() => {
    if (phase !== 'thinking') return

    if (reducedMotion) {
      setVisibleLines(REASONING.length)
      const t = window.setTimeout(() => setPhase('revealed'), 500)
      return () => window.clearTimeout(t)
    }

    setVisibleLines(0)
    let i = 0
    const iv = window.setInterval(() => {
      i += 1
      setVisibleLines(i)
      if (i >= REASONING.length) window.clearInterval(iv)
    }, LINE_INTERVAL)
    const revealAt = REASONING.length * LINE_INTERVAL + REVEAL_PAUSE
    const t = window.setTimeout(() => setPhase('revealed'), revealAt)
    return () => {
      window.clearInterval(iv)
      window.clearTimeout(t)
    }
  }, [phase, reducedMotion])

  // Reveal des Strukturbilds: Build-Animation + CTA einblenden.
  useEffect(() => {
    if (phase !== 'revealed') return
    const el = revealRef.current
    const cta = ctaRef.current
    if (reducedMotion) {
      if (el) gsap.set(el, { opacity: 1, scale: 1, filter: 'blur(0px)' })
      if (cta) gsap.set(cta, { opacity: 1, y: 0 })
      return
    }
    if (el) {
      gsap.fromTo(
        el,
        { opacity: 0, scale: 1.05, filter: 'blur(10px)' },
        { opacity: 1, scale: 1, filter: 'blur(0px)', duration: 1.7, ease: 'power3.out' },
      )
    }
    if (cta) {
      gsap.fromTo(
        cta,
        { opacity: 0, y: 14 },
        { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out', delay: 1.5 },
      )
    }
  }, [phase, reducedMotion])

  // Tastatur: Enter löst Frage aus (idle) bzw. betritt die Übersicht (revealed).
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Enter') return
      if (phase === 'idle') ask()
      else if (phase === 'revealed') onEnter()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [phase, ask, onEnter])

  const started = phase !== 'idle'

  return (
    <div className={styles.root}>
      <div className={styles.aura} aria-hidden />
      <div className={styles.shell}>
        <header className={styles.head}>
          <span className={styles.assistantMark} aria-hidden>
            <Sparkles size={18} strokeWidth={1.8} />
          </span>
          <div className={styles.headText}>
            <span className={styles.assistantName}>KI-Strategieassistent</span>
            <span className={styles.assistantSub}>Banking Horizon 2035</span>
          </div>
          <span className={styles.status} data-on={started || undefined}>
            <span className={styles.statusDot} aria-hidden />
            {phase === 'thinking' ? 'Denkt nach' : phase === 'revealed' ? 'Antwort bereit' : 'Bereit'}
          </span>
        </header>

        <div className={styles.thread}>
          {!started && (
            <div className={styles.welcome}>
              <h1 className={styles.welcomeTitle}>Bank 2026 — und der Sprung auf 2035</h1>
              <p className={styles.welcomeBody}>
                Stellen Sie die vorbereitete Frage. Der Assistent denkt sichtbar nach und
                erzeugt daraus das begehbare Strukturbild Ihrer Bank.
              </p>
            </div>
          )}

          {started && (
            <div className={styles.userRow}>
              <div className={styles.userBubble}>{QUESTION}</div>
            </div>
          )}

          {phase === 'thinking' && (
            <div className={styles.assistantRow}>
              <span className={styles.assistantAvatar} aria-hidden>
                <Sparkles size={15} strokeWidth={1.8} />
              </span>
              <div className={styles.thinking} aria-live="polite">
                <div className={styles.dots} aria-hidden>
                  <span />
                  <span />
                  <span />
                </div>
                <ul className={styles.reasoning}>
                  {REASONING.map((line, i) => (
                    <li
                      key={line}
                      className={styles.reasoningLine}
                      data-shown={i < visibleLines || undefined}
                      data-done={i < visibleLines - 1 || undefined}
                    >
                      <span className={styles.reasoningTick} aria-hidden />
                      {line}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {phase === 'revealed' && (
            <div className={styles.assistantRow}>
              <span className={styles.assistantAvatar} aria-hidden>
                <Sparkles size={15} strokeWidth={1.8} />
              </span>
              <div className={styles.answer}>
                <p className={styles.answerLead}>
                  Hier ist Ihre Bank im Zustand 2026 — als begehbares Strukturbild. Jede Etage
                  zeigt den Sprung von heute auf 2035.
                </p>
                <div ref={revealRef} className={styles.reveal}>
                  <ImageSlot
                    src={MASTER_IMAGE.src}
                    alt={MASTER_IMAGE.alt}
                    fit="cover"
                    label="Master · Strukturbild"
                    caption="Bank'26 — Querschnitt"
                  />
                  <span className={styles.revealSweep} aria-hidden />
                </div>
                <div ref={ctaRef} className={styles.ctaRow}>
                  <button type="button" className={styles.enterBtn} onClick={onEnter}>
                    Strukturbild betreten
                    <ArrowRight size={18} strokeWidth={2} aria-hidden />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {!started && (
          <div className={styles.composer}>
            <div className={styles.fauxInput}>
              <span className={styles.fauxText}>{QUESTION}</span>
              <span className={styles.caret} aria-hidden />
            </div>
            <button type="button" className={styles.askBtn} onClick={ask} aria-label="Frage stellen">
              <span>Frage stellen</span>
              <Send size={16} strokeWidth={2} aria-hidden />
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
