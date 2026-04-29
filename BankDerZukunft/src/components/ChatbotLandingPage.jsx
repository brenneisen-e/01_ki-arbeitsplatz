import { useEffect, useRef, useState, forwardRef } from 'react'
import { Send, Bot, Sparkles, Home, ArrowRight, Loader2, User } from 'lucide-react'
import { DEMO_RESPONSES, QUICK_PROMPTS, matchPromptKey } from '../data/chatbotResponses.js'
import { formatChatHtml } from '../utils/formatChatHtml.js'

// Workshop-Chatbot — die Default-Landing-View. User schreibt eine Frage,
// bekommt eine HTML-formatierte Antwort (Charts, Tabellen, Bullets) und
// kann anschließend per Button die animierte Haus-Ansicht öffnen.

export default function ChatbotLandingPage() {
  const [input, setInput] = useState('')
  const [messages, setMessages] = useState([])
  const [thinking, setThinking] = useState(false)
  const inputRef = useRef(null)
  const scrollRef = useRef(null)

  useEffect(() => { inputRef.current?.focus() }, [])
  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight
  }, [messages, thinking])

  function send(text) {
    const q = (text ?? input).trim()
    if (!q) return
    setInput('')
    const key = matchPromptKey(q)
    const answer = DEMO_RESPONSES[key]
    setMessages((m) => [...m, { role: 'user', content: q }])
    setThinking(true)
    setTimeout(() => {
      setMessages((m) => [...m, { role: 'assistant', content: answer.text, badge: answer.badge }])
      setThinking(false)
    }, 1100)
  }

  function handleKey(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      send()
    }
  }

  return (
    <div className="bdz-stage min-h-screen relative flex flex-col">
      <div className="bdz-grid absolute inset-0 opacity-30 pointer-events-none" />

      {/* Header */}
      <header className="relative z-20 px-6 md:px-10 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #0ea5e9 0%, #6366f1 100%)', boxShadow: '0 6px 20px rgba(99,102,241,0.45)' }}
          >
            <span className="text-white font-bold text-sm">BdZ</span>
          </div>
          <div className="flex flex-col leading-tight">
            <span className="text-white font-bold text-base">Bank der Zukunft</span>
            <span className="text-slate-400 text-[11px] uppercase tracking-widest">Banking im KI-Zeitalter · Workshop 2026</span>
          </div>
        </div>
        <a href="#/haus" className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/5 text-white px-4 py-1.5 text-xs no-underline hover:bg-white/10">
          <Home size={13} /> Haus-Ansicht
        </a>
      </header>

      {/* Hero / Chat-Stage */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-end pb-8 px-4">
        <div className="w-full max-w-3xl flex-1 flex flex-col">
          {/* Chat-Verlauf */}
          <ChatScroll
            ref={scrollRef}
            messages={messages}
            thinking={thinking}
            onOpenHouse={() => { window.location.hash = '#/haus' }}
          />

          {/* Eingabefeld + Quick Prompts */}
          <ChatInput
            input={input}
            setInput={setInput}
            onSend={() => send()}
            onKeyDown={handleKey}
            inputRef={inputRef}
            messagesCount={messages.length}
          />
        </div>
      </div>
    </div>
  )
}

// ── ChatScroll ──────────────────────────────────────────────────
const ChatScroll = forwardRef(function ChatScroll({ messages, thinking, onOpenHouse }, ref) {
  if (messages.length === 0 && !thinking) return <HeroEmptyState onOpenHouse={onOpenHouse} />
  return (
    <div ref={ref} className="flex-1 overflow-y-auto pr-2 space-y-4 mb-4 bdz-chat-scroll">
      {messages.map((m, i) => m.role === 'user' ? (
        <UserBubble key={i} text={m.content} />
      ) : (
        <AssistantBubble
          key={i}
          text={m.content}
          badge={m.badge}
          showHouseCta={i === messages.length - 1}
          onOpenHouse={onOpenHouse}
        />
      ))}
      {thinking && <ThinkingBubble />}
    </div>
  )
})

function HeroEmptyState({ onOpenHouse }) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center text-center px-4 pb-8 pt-4">
      <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs font-medium text-slate-300 mb-6">
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-sky-400 opacity-75" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-sky-400" />
        </span>
        Workshop-Erlebnis · Banking 2035
      </div>
      <h1 className="text-white font-bold tracking-tight text-4xl md:text-5xl leading-[1.05]">
        Frag mich was zur{' '}
        <span style={{ background: 'linear-gradient(90deg, #38bdf8 0%, #a78bfa 50%, #34d399 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          Bank der Zukunft
        </span>
      </h1>
      <p className="mt-4 text-slate-300 text-base md:text-lg max-w-2xl">
        Ich beantworte deine Fragen aus dem Workshop-Material — mit Charts, Tabellen und Quellen.
        Wenn du das Zielbild visuell sehen willst, öffne die animierte Haus-Ansicht.
      </p>
      <button
        onClick={onOpenHouse}
        className="mt-6 inline-flex items-center gap-2 rounded-full bg-white text-slate-900 px-5 py-2.5 text-sm font-semibold hover:scale-[1.03] transition-transform"
      >
        <Home size={14} strokeWidth={2.5} /> Bank der Zukunft als Haus erkunden
        <ArrowRight size={14} strokeWidth={2.5} />
      </button>
    </div>
  )
}

function UserBubble({ text }) {
  return (
    <div className="flex justify-end gap-2">
      <div className="max-w-[80%] rounded-2xl rounded-tr-sm bg-white/15 backdrop-blur-md border border-white/15 text-white px-4 py-2.5 text-sm leading-relaxed">
        {text}
      </div>
      <div className="w-8 h-8 rounded-full bg-white/10 border border-white/15 flex items-center justify-center shrink-0">
        <User size={14} className="text-white/80" />
      </div>
    </div>
  )
}

function AssistantBubble({ text, badge, showHouseCta, onOpenHouse }) {
  const html = formatChatHtml(text)
  return (
    <div className="flex gap-2">
      <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0" style={{ background: 'linear-gradient(135deg, #0ea5e9 0%, #6366f1 100%)' }}>
        <Bot size={14} className="text-white" />
      </div>
      <div className="max-w-[88%] rounded-2xl rounded-tl-sm bg-white/95 text-slate-900 border border-white/30 shadow-lg shadow-indigo-500/10 px-5 py-4 text-sm">
        {badge && (
          <div className="inline-flex items-center gap-1.5 mb-3 px-2.5 py-1 rounded-full text-[11px] font-semibold tracking-wide uppercase" style={{ background: 'linear-gradient(135deg, #e0f2fe 0%, #ede9fe 100%)', color: '#4338ca' }}>
            <Sparkles size={11} /> {badge}
          </div>
        )}
        <div className="bdz-chat-html" dangerouslySetInnerHTML={{ __html: html }} />
        {showHouseCta && (
          <div className="mt-4 pt-3 border-t border-slate-200 flex items-center gap-2 flex-wrap">
            <span className="text-xs text-slate-500">Mehr Kontext?</span>
            <button onClick={onOpenHouse} className="inline-flex items-center gap-1.5 rounded-full bg-slate-900 text-white px-3.5 py-1.5 text-xs font-semibold hover:bg-slate-700 transition-colors">
              <Home size={12} /> Bank der Zukunft als Haus
              <ArrowRight size={12} />
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

function ThinkingBubble() {
  return (
    <div className="flex gap-2">
      <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0" style={{ background: 'linear-gradient(135deg, #0ea5e9 0%, #6366f1 100%)' }}>
        <Loader2 size={14} className="text-white animate-spin" />
      </div>
      <div className="rounded-2xl rounded-tl-sm bg-white/10 border border-white/15 backdrop-blur-md text-white/80 px-4 py-2.5 text-sm">
        <span className="bdz-chat-dots"><span /><span /><span /></span>
      </div>
    </div>
  )
}

// ── ChatInput ──────────────────────────────────────────────────
function ChatInput({ input, setInput, onSend, onKeyDown, inputRef, messagesCount }) {
  return (
    <div className="space-y-3">
      <div className="relative rounded-2xl border border-white/15 bg-white/8 backdrop-blur-xl shadow-xl shadow-indigo-500/15 focus-within:border-white/35 transition-colors">
        <input
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder="Frag mich etwas zur Bank der Zukunft…"
          className="w-full bg-transparent text-white placeholder-white/40 px-5 py-4 pr-14 text-base outline-none rounded-2xl"
        />
        <button
          onClick={onSend}
          aria-label="Senden"
          className="absolute right-2.5 top-1/2 -translate-y-1/2 w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-md hover:scale-[1.05] transition-transform"
          style={{ background: 'linear-gradient(135deg, #0ea5e9 0%, #6366f1 100%)' }}
        >
          <Send size={16} strokeWidth={2.25} />
        </button>
      </div>

      {messagesCount === 0 && (
        <div className="flex flex-wrap gap-2 justify-center">
          {QUICK_PROMPTS.map((p) => (
            <button
              key={p.key}
              onClick={() => { setInput(p.label); setTimeout(() => onSend(), 50) }}
              className="rounded-full border border-white/15 bg-white/5 hover:bg-white/15 hover:border-white/30 text-white/85 hover:text-white text-xs px-3.5 py-1.5 transition-all"
            >
              {p.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
