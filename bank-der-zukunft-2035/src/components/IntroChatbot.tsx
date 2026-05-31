import { useCallback, useEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'
import { ArrowRight, Bot, Home, Sparkles } from 'lucide-react'
import styles from './IntroChatbot.module.css'
import { ImageSlot } from './ImageSlot'
import { MASTER_IMAGE } from '../data/chapters'
import { useReducedMotion } from '../hooks/useReducedMotion'

// ─────────────────────────────────────────────────────────────────────────────
// IntroChatbot — der „AI Banking Assistant"-Auftakt (BdZ-Look).
//
// Ablauf:
//   1. Name abfragen  →  2. „Willkommen zurück, {Name} — was kann ich heute
//   für dich tun?" + mehrere Vorschlags-Prompts. Einer davon ist „Bank der
//   Zukunft 2035": Klick darauf → sichtbares Thinking → das Strukturbild baut
//   sich auf → Einstieg ins begehbare Haus.
//
// Die übrigen Prompts geben eine kurze, glaubwürdige Assistenten-Antwort, die
// thematisch zum Workshop zurückführt. Deterministisch (scripted), kein Netz.
// ─────────────────────────────────────────────────────────────────────────────

const DEFAULT_NAME = 'Eike'

const REASONING = [
  'Analysiere Geschäftsmodell',
  'Kundenschnittstelle',
  'Betriebsmodell',
  'Governance & Risiko',
  'Komponiere Strukturbild',
]

type Prompt = { id: string; label: string; primary?: boolean; reply?: string }

const PROMPTS: Prompt[] = [
  { id: 'bank2035', label: 'Bank der Zukunft 2035', primary: true },
  {
    id: 'aufgaben',
    label: 'Meine offenen Aufgaben heute',
    reply:
      'Drei Themen liegen heute an — das größte ist strategisch: Wie sieht deine Bank 2035 aus? Genau da würde ich anfangen.',
  },
  {
    id: 'markt',
    label: 'Marktlage & Zinsen kompakt',
    reply:
      'Die Märkte sind heute ruhig. Die spannendere Bewegung ist der Sprung ins KI-Zeitalter — den zeige ich dir gern.',
  },
  {
    id: 'portfolio',
    label: 'Portfolio-Überblick',
    reply:
      'Dein Portfolio ist stabil. Die größere Frage ist, wie die Bank dahinter 2035 arbeitet. Soll ich dir das Zielbild zeigen?',
  },
]

const LINE_INTERVAL = 720
const REVEAL_PAUSE = 600

type Msg = { id: number; role: 'user' | 'assistant'; text: string }
type Phase = 'name' | 'chat' | 'thinking' | 'revealed'

export function IntroChatbot({
  onEnter,
}: {
  onEnter: () => void
}): React.ReactElement {
  const [phase, setPhase] = useState<Phase>('name')
  const [nameInput, setNameInput] = useState(DEFAULT_NAME)
  const [name, setName] = useState('')
  const [messages, setMessages] = useState<Msg[]>([])
  const [replying, setReplying] = useState(false)
  const [visibleLines, setVisibleLines] = useState(0)

  const idRef = useRef(0)
  const nameRef = useRef<HTMLInputElement>(null)
  const endRef = useRef<HTMLDivElement>(null)
  const revealRef = useRef<HTMLDivElement>(null)
  const ctaRef = useRef<HTMLDivElement>(null)
  const reducedMotion = useReducedMotion()

  const pushMsg = useCallback((role: Msg['role'], text: string) => {
    idRef.current += 1
    const id = idRef.current
    setMessages((m) => [...m, { id, role, text }])
  }, [])

  useEffect(() => {
    nameRef.current?.focus()
  }, [])

  const submitName = useCallback(() => {
    if (phase !== 'name') return
    const clean = nameInput.trim()
    setName(clean)
    idRef.current += 1
    setMessages([
      {
        id: idRef.current,
        role: 'assistant',
        text: clean
          ? `Willkommen zurück, ${clean}. Was kann ich heute für dich tun?`
          : 'Willkommen zurück! Was kann ich heute für dich tun?',
      },
    ])
    setPhase('chat')
  }, [phase, nameInput])

  const clickPrompt = useCallback(
    (p: Prompt) => {
      if (phase !== 'chat' || replying) return
      pushMsg('user', p.label)
      if (p.primary) {
        setPhase('thinking')
        return
      }
      if (p.reply) {
        const reply = p.reply
        setReplying(true)
        window.setTimeout(
          () => {
            pushMsg('assistant', reply)
            setReplying(false)
          },
          reducedMotion ? 200 : 950,
        )
      }
    },
    [phase, replying, pushMsg, reducedMotion],
  )

  // Reasoning-Sequenz (nur „Bank 2035"-Pfad), dann Reveal.
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

  // Reveal: Strukturbild „baut" sich auf, CTA blendet ein.
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

  // Auto-Scroll ans Ende bei neuen Nachrichten / Phasen.
  useEffect(() => {
    endRef.current?.scrollIntoView({
      behavior: reducedMotion ? 'auto' : 'smooth',
      block: 'end',
    })
  }, [messages, replying, phase, visibleLines, reducedMotion])

  const statusLabel =
    phase === 'thinking' ? 'Denkt nach' : phase === 'revealed' ? 'Antwort bereit' : 'Bereit'
  const showSuggestions = phase === 'chat'

  return (
    <div className={styles.root}>
      <div className={styles.grid} aria-hidden />

      <header className={styles.header}>
        <div className={styles.brand}>
          <span className={styles.mark} aria-hidden>BdZ</span>
          <span className={styles.brandText}>
            <span className={styles.brandName}>Bank der Zukunft</span>
            <span className={styles.brandSub}>AI Banking Assistant · Workshop 2026</span>
          </span>
        </div>
        <span className={styles.status} data-on={phase !== 'name' || undefined}>
          <span className={styles.statusDot} aria-hidden />
          {statusLabel}
        </span>
      </header>

      <div className={styles.main}>
        <div className={styles.column}>
          {phase === 'name' && (
            <div className={styles.nameCard}>
              <span className={styles.nameAvatar} aria-hidden>
                <Bot size={22} strokeWidth={1.8} />
              </span>
              <h1 className={styles.nameTitle}>Schön, dass du da bist.</h1>
              <p className={styles.nameSub}>
                Ich bin dein AI Banking Assistant. Wie darf ich dich begrüßen?
              </p>
              <form
                className={styles.nameForm}
                onSubmit={(e) => {
                  e.preventDefault()
                  submitName()
                }}
              >
                <input
                  ref={nameRef}
                  className={styles.nameInput}
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                  placeholder="Dein Name"
                  aria-label="Dein Name"
                  maxLength={40}
                />
                <button type="submit" className={styles.nameSubmit} aria-label="Weiter">
                  <span>Weiter</span>
                  <ArrowRight size={16} strokeWidth={2.2} aria-hidden />
                </button>
              </form>
            </div>
          )}

          {phase !== 'name' && (
            <div className={styles.thread}>
              {messages.map((m) =>
                m.role === 'user' ? (
                  <div key={m.id} className={styles.userRow}>
                    <div className={styles.userBubble}>{m.text}</div>
                  </div>
                ) : (
                  <div key={m.id} className={styles.assistantRow}>
                    <span className={styles.avatar} aria-hidden>
                      <Bot size={15} strokeWidth={1.9} />
                    </span>
                    <div className={styles.bubble}>{m.text}</div>
                  </div>
                ),
              )}

              {replying && (
                <div className={styles.assistantRow}>
                  <span className={styles.avatar} aria-hidden>
                    <Bot size={15} strokeWidth={1.9} />
                  </span>
                  <div className={styles.bubble}>
                    <span className={styles.dots} aria-hidden>
                      <span />
                      <span />
                      <span />
                    </span>
                  </div>
                </div>
              )}

              {phase === 'thinking' && (
                <div className={styles.assistantRow}>
                  <span className={styles.avatar} aria-hidden>
                    <Bot size={15} strokeWidth={1.9} />
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
                  <span className={styles.avatar} aria-hidden>
                    <Sparkles size={15} strokeWidth={1.9} />
                  </span>
                  <div className={styles.answer}>
                    <p className={styles.answerLead}>
                      {name ? `${name}, hier ist deine ` : 'Hier ist deine '}
                      Bank im Zustand 2026 — als begehbares Strukturbild. Jede Etage zeigt den
                      Sprung von heute auf 2035.
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
                        <Home size={15} strokeWidth={2.4} aria-hidden />
                        Bank der Zukunft als Haus erkunden
                        <ArrowRight size={15} strokeWidth={2.4} aria-hidden />
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {showSuggestions && (
                <div className={styles.suggestions} role="group" aria-label="Vorschläge">
                  {PROMPTS.map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      className={styles.suggestion}
                      data-primary={p.primary || undefined}
                      onClick={() => clickPrompt(p)}
                    >
                      {p.primary && <Sparkles size={14} strokeWidth={2} aria-hidden />}
                      {p.label}
                      {p.primary && <ArrowRight size={14} strokeWidth={2} aria-hidden />}
                    </button>
                  ))}
                </div>
              )}

              <div ref={endRef} />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
