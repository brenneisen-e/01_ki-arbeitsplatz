import { useCallback, useEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'
import { ArrowRight, Bot, Home, Send, Sparkles } from 'lucide-react'
import styles from './IntroChatbot.module.css'
import { ImageSlot } from './ImageSlot'
import { MASTER_IMAGE } from '../data/chapters'
import { useReducedMotion } from '../hooks/useReducedMotion'

// ─────────────────────────────────────────────────────────────────────────────
// IntroChatbot — der „AI Banking Assistant"-Auftakt.
//
// Look übernommen von der Vertriebsarbeitsplatz-Landing: Vollbild-Stockfoto
// mit Dunkel-Overlay, Deloitte-„Demo"-Badge oben links, Glas-UI. Flow:
//   1. Name abfragen → 2. „Willkommen zurück, {Name} — was kann ich heute für
//   dich tun?" + Vorschlags-Prompts. Der primäre Prompt „Bank der Zukunft
//   2035" startet sichtbares Thinking → das Strukturbild baut sich auf →
//   Einstieg in den Workshop (ins Haus). Übrige Prompts / freie Eingabe geben
//   eine kurze Assistenten-Antwort, die zum Workshop zurückführt.
//
// Deterministisch (scripted), privacy-first: Bild + Deloitte-Logo liegen lokal.
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

const GENERIC_REPLY =
  'Gern — fang am besten mit dem großen Bild an: Wähle „Bank der Zukunft 2035", dann baue ich dir das Strukturbild auf.'

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
  const [chatInput, setChatInput] = useState('')
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
    setMessages((m) => [...m, { id: idRef.current, role, text }])
  }, [])

  useEffect(() => {
    nameRef.current?.focus()
  }, [])

  const submitName = useCallback(() => {
    if (phase !== 'name') return
    setName(nameInput.trim())
    setPhase('chat')
  }, [phase, nameInput])

  const cannedReply = useCallback(
    (reply: string) => {
      setReplying(true)
      window.setTimeout(
        () => {
          pushMsg('assistant', reply)
          setReplying(false)
        },
        reducedMotion ? 200 : 950,
      )
    },
    [pushMsg, reducedMotion],
  )

  const clickPrompt = useCallback(
    (p: Prompt) => {
      if (phase !== 'chat' || replying) return
      pushMsg('user', p.label)
      if (p.primary) setPhase('thinking')
      else if (p.reply) cannedReply(p.reply)
    },
    [phase, replying, pushMsg, cannedReply],
  )

  const submitChat = useCallback(() => {
    const q = chatInput.trim()
    if (phase !== 'chat' || replying || !q) return
    setChatInput('')
    pushMsg('user', q)
    cannedReply(GENERIC_REPLY)
  }, [chatInput, phase, replying, pushMsg, cannedReply])

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
    const t = window.setTimeout(
      () => setPhase('revealed'),
      REASONING.length * LINE_INTERVAL + REVEAL_PAUSE,
    )
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

  // Auto-Scroll ans Ende.
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
    <div
      className={styles.root}
      style={{
        backgroundImage:
          "linear-gradient(180deg, rgba(15,23,42,0.55) 0%, rgba(12,17,32,0.82) 100%), url('./landing-bg.jpeg')",
      }}
    >
      {/* Top bar: Deloitte „Demo" links, Status/Label rechts */}
      <header className={styles.topbar}>
        <div className={styles.deloitte} aria-label="Deloitte Demo">
          <span className={styles.dMark} aria-hidden>
            D<span className={styles.dDot} />
          </span>
          <span className={styles.demoWord}>Demo</span>
        </div>
        <div className={styles.topRight}>
          <span className={styles.status} data-on={phase !== 'name' || undefined}>
            <span className={styles.statusDot} aria-hidden />
            {statusLabel}
          </span>
          <span className={styles.suiteLabel}>Banking Horizon 2035</span>
        </div>
      </header>

      <div className={styles.main}>
        {phase === 'name' ? (
          <form
            className={styles.nameModal}
            onSubmit={(e) => {
              e.preventDefault()
              submitName()
            }}
          >
            <div className={styles.nameHead}>
              <span className={styles.nameIcon} aria-hidden>
                <Bot size={22} strokeWidth={1.8} />
              </span>
              <div>
                <h2 className={styles.nameTitle}>Willkommen!</h2>
                <p className={styles.nameKicker}>AI Banking Assistant</p>
              </div>
            </div>
            <label className={styles.nameLabel} htmlFor="bdz-name">Wie darf ich dich nennen?</label>
            <input
              id="bdz-name"
              ref={nameRef}
              className={styles.nameField}
              value={nameInput}
              onChange={(e) => setNameInput(e.target.value)}
              placeholder="Dein Vorname"
              maxLength={40}
            />
            <button type="submit" className={styles.nameGo}>
              Los geht's
              <ArrowRight size={16} strokeWidth={2.2} aria-hidden />
            </button>
          </form>
        ) : (
          <div className={styles.center}>
            <div className={styles.logoTile}>
              <span className={styles.tileMark} aria-hidden>BdZ</span>
              <span className={styles.tileName}>
                <span className={styles.tileLight}>BANK DER </span>
                <span className={styles.tileBold}>ZUKUNFT</span>
              </span>
            </div>

            <h1 className={styles.welcome}>
              {name ? `Willkommen zurück, ${name}` : 'Willkommen zurück'}
            </h1>
            <p className={styles.welcomeSub}>Was kann ich heute für dich tun?</p>

            <div className={styles.chatWrap}>
              <div className={styles.inputRow}>
                <input
                  className={styles.chatInput}
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') submitChat()
                  }}
                  placeholder="Frag mich etwas zur Bank der Zukunft…"
                  disabled={phase !== 'chat'}
                />
                <button
                  type="button"
                  className={styles.sendBtn}
                  onClick={submitChat}
                  aria-label="Senden"
                  disabled={phase !== 'chat'}
                >
                  <Send size={18} strokeWidth={1.9} aria-hidden />
                </button>
              </div>

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

              {(messages.length > 0 || replying || phase !== 'chat') && (
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
                            Workshop starten — Bank als Haus erkunden
                            <ArrowRight size={15} strokeWidth={2.4} aria-hidden />
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  <div ref={endRef} />
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
