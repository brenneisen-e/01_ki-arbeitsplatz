import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { gsap } from 'gsap'
import { ArrowRight, Bot, Home, Send, Sparkles, Store } from 'lucide-react'
import styles from './IntroChatbot.module.css'
import { ImageSlot } from './ImageSlot'
import { DeloitteBadge } from './DeloitteBadge'
import { LanguageSwitch } from './LanguageSwitch'
import { getMasterImage } from '../data/chapters'
import { useReducedMotion } from '../hooks/useReducedMotion'
import { useLang, type Lang } from '../i18n/LanguageContext'

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
// Zweisprachig (DE/EN) über die Sprachumschaltung oben rechts.
// ─────────────────────────────────────────────────────────────────────────────

const DEFAULT_NAME = 'Eike'

type Prompt = { id: string; label: string; primary?: boolean; reply?: string }

type IntroStrings = {
  reasoning: string[]
  prompts: Prompt[]
  genericReply: string
  welcomeModalTitle: string
  assistantRole: string
  nameLabel: string
  namePlaceholder: string
  nameGo: string
  tileLight: string
  tileBold: string
  welcome: (name: string) => string
  welcomeSub: string
  chatPlaceholder: string
  send: string
  suggestions: string
  statusReady: string
  statusThinking: string
  statusReply: string
  suiteLabel: string
  answerLead: (name: string) => string
  masterLabel: string
  masterCaption: string
  enter: string
  edekaLabel: string
  edekaSub: string
  edekaAria: string
}

const STR: Record<Lang, IntroStrings> = {
  de: {
    reasoning: [
      'Analysiere Geschäftsmodell',
      'Kundenschnittstelle',
      'Betriebsmodell',
      'Governance & Risiko',
      'Komponiere Strukturbild',
    ],
    prompts: [
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
    ],
    genericReply:
      'Gern — fang am besten mit dem großen Bild an: Wähle „Bank der Zukunft 2035", dann baue ich dir das Strukturbild auf.',
    welcomeModalTitle: 'Willkommen!',
    assistantRole: 'AI Banking Assistant',
    nameLabel: 'Wie darf ich dich nennen?',
    namePlaceholder: 'Dein Vorname',
    nameGo: 'Los geht’s',
    tileLight: 'BANK DER ',
    tileBold: 'ZUKUNFT',
    welcome: (name) => (name ? `Willkommen zurück, ${name}` : 'Willkommen zurück'),
    welcomeSub: 'Was kann ich heute für dich tun?',
    chatPlaceholder: 'Frag mich etwas zur Bank der Zukunft…',
    send: 'Senden',
    suggestions: 'Vorschläge',
    statusReady: 'Bereit',
    statusThinking: 'Denkt nach',
    statusReply: 'Antwort bereit',
    suiteLabel: 'Banking Horizon 2035',
    answerLead: (name) =>
      `${name ? `${name}, hier ist deine ` : 'Hier ist deine '}Bank im Zustand 2026 — als begehbares Strukturbild. Jede Etage zeigt den Sprung von heute auf 2035.`,
    masterLabel: 'Master · Strukturbild',
    masterCaption: 'Bank’26 — Querschnitt',
    enter: 'Workshop starten — Bank als Haus erkunden',
    edekaLabel: 'Edeka-Bank',
    edekaSub: 'Holodeck 2031 · Kommandobrücke',
    edekaAria: 'EDEKABANK Holodeck 2031 öffnen',
  },
  en: {
    reasoning: [
      'Analysing business model',
      'Customer interface',
      'Operating model',
      'Governance & risk',
      'Composing the cross-section',
    ],
    prompts: [
      { id: 'bank2035', label: 'Bank of the Future 2035', primary: true },
      {
        id: 'aufgaben',
        label: 'My open tasks today',
        reply:
          'Three things are on today’s plate — the biggest one is strategic: what does your bank look like in 2035? That’s exactly where I’d start.',
      },
      {
        id: 'markt',
        label: 'Markets & rates in brief',
        reply:
          'Markets are calm today. The more exciting movement is the leap into the AI era — happy to show you that.',
      },
      {
        id: 'portfolio',
        label: 'Portfolio overview',
        reply:
          'Your portfolio is stable. The bigger question is how the bank behind it works in 2035. Shall I show you the target picture?',
      },
    ],
    genericReply:
      'Happy to — best to start with the big picture: choose “Bank of the Future 2035” and I’ll build up the cross-section for you.',
    welcomeModalTitle: 'Welcome!',
    assistantRole: 'AI Banking Assistant',
    nameLabel: 'What should I call you?',
    namePlaceholder: 'Your first name',
    nameGo: 'Let’s go',
    tileLight: 'BANK OF THE ',
    tileBold: 'FUTURE',
    welcome: (name) => (name ? `Welcome back, ${name}` : 'Welcome back'),
    welcomeSub: 'What can I do for you today?',
    chatPlaceholder: 'Ask me anything about the bank of the future…',
    send: 'Send',
    suggestions: 'Suggestions',
    statusReady: 'Ready',
    statusThinking: 'Thinking',
    statusReply: 'Answer ready',
    suiteLabel: 'Banking Horizon 2035',
    answerLead: (name) =>
      `${name ? `${name}, here is your ` : 'Here is your '}bank in its 2026 state — as a walkable cross-section. Each floor shows the leap from today to 2035.`,
    masterLabel: 'Master · Cross-section',
    masterCaption: 'Bank’26 — cross-section',
    enter: 'Start the workshop — explore the bank as a house',
    edekaLabel: 'Edeka Bank',
    edekaSub: 'Holodeck 2031 · command bridge',
    edekaAria: 'Open the EDEKABANK Holodeck 2031',
  },
}

const LINE_INTERVAL = 720
const REVEAL_PAUSE = 600

type Msg = { id: number; role: 'user' | 'assistant'; text: string }
type Phase = 'name' | 'chat' | 'thinking' | 'revealed'

export function IntroChatbot({
  onEnter,
  onEnterEdeka,
}: {
  onEnter: () => void
  /** Direkter Einstieg in die zweite Instanz „Edekabank" (eigener Button). */
  onEnterEdeka: () => void
}): React.ReactElement {
  const { lang } = useLang()
  const t = STR[lang]
  const masterImage = useMemo(() => getMasterImage(lang), [lang])

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

  const reasoning = t.reasoning

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
      // Die gestellte Frage steht oben in der Eingabezeile (keine separate Bubble).
      setChatInput(p.label)
      if (p.primary) setPhase('thinking')
      else if (p.reply) cannedReply(p.reply)
    },
    [phase, replying, cannedReply],
  )

  const submitChat = useCallback(() => {
    const q = chatInput.trim()
    if (phase !== 'chat' || replying || !q) return
    cannedReply(t.genericReply)
  }, [chatInput, phase, replying, cannedReply, t.genericReply])

  // Reasoning-Sequenz (nur „Bank 2035"-Pfad), dann Reveal.
  useEffect(() => {
    if (phase !== 'thinking') return
    if (reducedMotion) {
      setVisibleLines(reasoning.length)
      const t2 = window.setTimeout(() => setPhase('revealed'), 500)
      return () => window.clearTimeout(t2)
    }
    setVisibleLines(0)
    let i = 0
    const iv = window.setInterval(() => {
      i += 1
      setVisibleLines(i)
      if (i >= reasoning.length) window.clearInterval(iv)
    }, LINE_INTERVAL)
    const t2 = window.setTimeout(
      () => setPhase('revealed'),
      reasoning.length * LINE_INTERVAL + REVEAL_PAUSE,
    )
    return () => {
      window.clearInterval(iv)
      window.clearTimeout(t2)
    }
  }, [phase, reducedMotion, reasoning.length])

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
    phase === 'thinking' ? t.statusThinking : phase === 'revealed' ? t.statusReply : t.statusReady
  const showSuggestions = phase === 'chat'

  return (
    <div
      className={styles.root}
      style={{
        backgroundImage:
          "linear-gradient(180deg, rgba(15,23,42,0.55) 0%, rgba(12,17,32,0.82) 100%), url('./landing-bg.jpeg')",
      }}
    >
      {/* Top bar: Deloitte „Demo" links, Sprache + Status/Label rechts */}
      <header className={styles.topbar}>
        <DeloitteBadge />
        <div className={styles.topRight}>
          <LanguageSwitch />
          <span className={styles.status} data-on={phase !== 'name' || undefined}>
            <span className={styles.statusDot} aria-hidden />
            {statusLabel}
          </span>
          <span className={styles.suiteLabel}>{t.suiteLabel}</span>
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
                <h2 className={styles.nameTitle}>{t.welcomeModalTitle}</h2>
                <p className={styles.nameKicker}>{t.assistantRole}</p>
              </div>
            </div>
            <label className={styles.nameLabel} htmlFor="bdz-name">{t.nameLabel}</label>
            <input
              id="bdz-name"
              ref={nameRef}
              className={styles.nameField}
              value={nameInput}
              onChange={(e) => setNameInput(e.target.value)}
              placeholder={t.namePlaceholder}
              maxLength={40}
            />
            <button type="submit" className={styles.nameGo}>
              {t.nameGo}
              <ArrowRight size={16} strokeWidth={2.2} aria-hidden />
            </button>
          </form>
        ) : (
          <div className={styles.center}>
            <div className={styles.logoTile}>
              <span className={styles.tileMark} aria-hidden>BdZ</span>
              <span className={styles.tileName}>
                <span className={styles.tileLight}>{t.tileLight}</span>
                <span className={styles.tileBold}>{t.tileBold}</span>
              </span>
            </div>

            <h1 className={styles.welcome}>{t.welcome(name)}</h1>
            <p className={styles.welcomeSub}>{t.welcomeSub}</p>

            <div className={styles.chatWrap}>
              <div className={styles.inputRow}>
                <input
                  className={styles.chatInput}
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') submitChat()
                  }}
                  placeholder={t.chatPlaceholder}
                  disabled={phase !== 'chat'}
                />
                <button
                  type="button"
                  className={styles.sendBtn}
                  onClick={submitChat}
                  aria-label={t.send}
                  disabled={phase !== 'chat'}
                >
                  <Send size={18} strokeWidth={1.9} aria-hidden />
                </button>
              </div>

              {showSuggestions && (
                <>
                  <div className={styles.suggestions} role="group" aria-label={t.suggestions}>
                    {t.prompts.map((p) => (
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

                  {/* Zweite Instanz: direkter Absprung in das Edekabank-Strukturbild. */}
                  <button
                    type="button"
                    className={styles.edekaBtn}
                    onClick={onEnterEdeka}
                    aria-label={t.edekaAria}
                  >
                    <span className={styles.edekaIcon} aria-hidden>
                      <Store size={18} strokeWidth={2} />
                    </span>
                    <span className={styles.edekaText}>
                      <span className={styles.edekaLabel}>{t.edekaLabel}</span>
                      <span className={styles.edekaSub}>{t.edekaSub}</span>
                    </span>
                    <ArrowRight size={16} strokeWidth={2.2} aria-hidden />
                  </button>
                </>
              )}

              {(messages.length > 0 || replying || phase !== 'chat') && (
                <div className={styles.thread}>
                  {messages.map((m) => (
                    <div key={m.id} className={styles.assistantRow}>
                      <span className={styles.avatar} aria-hidden>
                        <Bot size={15} strokeWidth={1.9} />
                      </span>
                      <div className={styles.bubble}>{m.text}</div>
                    </div>
                  ))}

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
                          {reasoning.map((line, i) => (
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
                        <p className={styles.answerLead}>{t.answerLead(name)}</p>
                        <div ref={revealRef} className={styles.reveal}>
                          <ImageSlot
                            src={masterImage.src}
                            alt={masterImage.alt}
                            fit="cover"
                            label={t.masterLabel}
                            caption={t.masterCaption}
                          />
                          <span className={styles.revealSweep} aria-hidden />
                        </div>
                        <div ref={ctaRef} className={styles.ctaRow}>
                          <button type="button" className={styles.enterBtn} onClick={onEnter}>
                            <Home size={15} strokeWidth={2.4} aria-hidden />
                            {t.enter}
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
