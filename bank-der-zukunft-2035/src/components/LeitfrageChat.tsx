import { useEffect, useRef, useState } from 'react'
import { Bot, Lightbulb, Send, Sparkles, X } from 'lucide-react'
import styles from './LeitfrageChat.module.css'
import { useLang, type Lang } from '../i18n/LanguageContext'
import type { Chapter } from '../data/chapters'

// ─────────────────────────────────────────────────────────────────────────────
// LeitfrageChat — Overlay-Chatbot für die Leitfrage eines Kapitels.
//
// Ersetzt die statische Leitfrage-Sprechblase durch einen moderierenden Dialog
// (unten rechts, Stil des „KI-Vertriebsassistenten"). Privacy-first: KEIN
// externer LLM-Call — die Antworten sind regelbasierte Moderations-Impulse, die
// den Kapitel-Kontext (Titel, 2030-Aussage) einweben, damit die Diskussion im
// Workshop nicht statisch bleibt.
// ─────────────────────────────────────────────────────────────────────────────

type Msg = { role: 'bot' | 'user'; text: string }
type Intent = 'proContra' | 'implikationen' | 'konkret' | 'schritt'

type ChatStrings = {
  title: string
  close: string
  greeting: (leitfrage: string) => string
  chips: Record<Intent, string>
  botFor: Record<Intent, (ctx: Ctx) => string>
  freeFollowups: (ctx: Ctx) => string[]
  placeholder: string
  send: string
  hint: string
}

type Ctx = { label: string; hypoTitle: string; in2030: string }

function firstSentence(text: string): string {
  const clean = text.replace(/\*\*/g, '')
  const cut = clean.split(/(?<=[.!?])\s/)[0] ?? clean
  return cut.length > 160 ? cut.slice(0, 157) + '…' : cut
}

const STR: Record<Lang, ChatStrings> = {
  de: {
    title: 'KI-Leitfragen-Assistent',
    close: 'Assistent schließen',
    greeting: (lf) =>
      `Lassen Sie uns die Leitfrage gemeinsam durchdenken:\n\n„${lf}"\n\nWählen Sie einen Impuls oder schreiben Sie Ihre Gedanken.`,
    chips: {
      proContra: 'Pro & Contra',
      implikationen: 'Was heißt das für uns?',
      konkret: 'Konkreter machen',
      schritt: 'Nächster Schritt',
    },
    botFor: {
      proContra: (c) =>
        `Sammeln wir Pro und Contra: Was spricht dafür, dass „${firstSentence(c.in2030)}"? Und was spricht dagegen? Nennen Sie je zwei Punkte.`,
      implikationen: (c) =>
        `Angenommen, das trifft für „${c.label}" zu — was ändert sich konkret an Rollen, Prozessen und Kennzahlen? Wer gewinnt, wer muss sich neu erfinden?`,
      konkret: (c) =>
        `Machen wir es konkret: An welchem realen Beispiel aus „${c.label}" lässt sich „${c.hypoTitle}" festmachen? Wo sehen Sie das heute schon in Ansätzen?`,
      schritt: () =>
        `Was wäre der nächste konkrete Schritt in den nächsten 90 Tagen, um dieser 2030-Vision näherzukommen — und wer müsste ihn verantworten?`,
    },
    freeFollowups: (c) => [
      'Guter Punkt. Und was wäre das stärkste Gegenargument dazu?',
      `Wie würde sich das auf die Kunden im Bereich „${c.label}" auswirken?`,
      'Was müsste wahr sein, damit das gelingt — welche Voraussetzung ist am kritischsten?',
      'Woran würden Sie in zwei Jahren messen, ob wir auf dem richtigen Weg sind?',
    ],
    placeholder: 'Ihre Gedanken zur Leitfrage…',
    send: 'Senden',
    hint: 'Moderations-Impulse · keine externe KI, keine Speicherung',
  },
  en: {
    title: 'AI guiding-question assistant',
    close: 'Close the assistant',
    greeting: (lf) =>
      `Let’s think the guiding question through together:\n\n“${lf}”\n\nPick a prompt or write down your thoughts.`,
    chips: {
      proContra: 'Pros & cons',
      implikationen: 'What does it mean for us?',
      konkret: 'Make it concrete',
      schritt: 'Next step',
    },
    botFor: {
      proContra: (c) =>
        `Let’s collect pros and cons: what speaks for “${firstSentence(c.in2030)}”? And what against it? Name two of each.`,
      implikationen: (c) =>
        `Assuming this holds for “${c.label}” — what concretely changes for roles, processes and metrics? Who wins, who must reinvent themselves?`,
      konkret: (c) =>
        `Let’s make it concrete: which real example from “${c.label}” illustrates “${c.hypoTitle}”? Where do you already see early signs today?`,
      schritt: () =>
        `What would be the next concrete step in the next 90 days to move towards this 2030 vision — and who should own it?`,
    },
    freeFollowups: (c) => [
      'Good point. And what would be the strongest counter-argument?',
      `How would this affect customers in “${c.label}”?`,
      'What would have to be true for this to succeed — which precondition is most critical?',
      'In two years, how would you measure whether we are on the right track?',
    ],
    placeholder: 'Your thoughts on the guiding question…',
    send: 'Send',
    hint: 'Facilitation prompts · no external AI, no storage',
  },
}

type Props = {
  chapter: Chapter
  leitfrage: string
  hypoTitle: string
  in2030: string
  onClose: () => void
}

export function LeitfrageChat({ chapter, leitfrage, hypoTitle, in2030, onClose }: Props): React.ReactElement {
  const { lang } = useLang()
  const t = STR[lang]
  const ctx: Ctx = { label: chapter.label, hypoTitle, in2030 }

  const [messages, setMessages] = useState<Msg[]>(() => [{ role: 'bot', text: t.greeting(leitfrage) }])
  const [input, setInput] = useState('')
  const [freeIdx, setFreeIdx] = useState(0)
  const scrollRef = useRef<HTMLDivElement>(null)

  // Bei Sprach- oder Leitfragenwechsel den Dialog neu starten.
  useEffect(() => {
    setMessages([{ role: 'bot', text: t.greeting(leitfrage) }])
    setFreeIdx(0)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [leitfrage, lang])

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  const pushBot = (text: string) => setMessages((m) => [...m, { role: 'bot', text }])

  const onChip = (intent: Intent) => {
    setMessages((m) => [...m, { role: 'user', text: t.chips[intent] }])
    window.setTimeout(() => pushBot(t.botFor[intent](ctx)), 260)
  }

  const onSend = () => {
    const text = input.trim()
    if (!text) return
    setMessages((m) => [...m, { role: 'user', text }])
    setInput('')
    const followups = t.freeFollowups(ctx)
    const reply = followups[freeIdx % followups.length]
    setFreeIdx((i) => i + 1)
    window.setTimeout(() => pushBot(reply), 300)
  }

  const intents: Intent[] = ['proContra', 'implikationen', 'konkret', 'schritt']

  return (
    <div className={styles.panel} role="dialog" aria-label={t.title}>
      <header className={styles.header}>
        <span className={styles.avatar} aria-hidden>
          <Bot size={18} strokeWidth={2} />
        </span>
        <span className={styles.headText}>{t.title}</span>
        <button type="button" className={styles.closeBtn} onClick={onClose} aria-label={t.close}>
          <X size={17} strokeWidth={2} aria-hidden />
        </button>
      </header>

      <div className={styles.stream} ref={scrollRef}>
        {messages.map((m, i) => (
          <div key={i} className={styles.row} data-role={m.role}>
            {m.role === 'bot' && (
              <span className={styles.botDot} aria-hidden>
                <Sparkles size={13} strokeWidth={2.2} />
              </span>
            )}
            <div className={styles.bubble} data-role={m.role}>
              {m.text.split('\n').map((line, li) => (
                <p key={li} className={styles.line}>{line}</p>
              ))}
            </div>
          </div>
        ))}

        <div className={styles.chips} role="group" aria-label={t.title}>
          {intents.map((intent) => (
            <button key={intent} type="button" className={styles.chip} onClick={() => onChip(intent)}>
              <Lightbulb size={13} strokeWidth={2} aria-hidden />
              {t.chips[intent]}
            </button>
          ))}
        </div>
      </div>

      <form
        className={styles.inputRow}
        onSubmit={(e) => {
          e.preventDefault()
          onSend()
        }}
      >
        <input
          className={styles.input}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={t.placeholder}
          aria-label={t.placeholder}
        />
        <button type="submit" className={styles.sendBtn} aria-label={t.send} disabled={!input.trim()}>
          <Send size={16} strokeWidth={2} aria-hidden />
        </button>
      </form>
      <span className={styles.footHint}>{t.hint}</span>
    </div>
  )
}
