import { useState, useRef, useEffect, useCallback } from 'react'
import { MessageSquare, Send, X, Settings } from 'lucide-react'
import { chatResponses, chatSuggestions } from '../data/constants'

function findResponse(query) {
  const q = query.toLowerCase()
  for (const [keywords, response] of Object.entries(chatResponses)) {
    if (keywords === 'default') continue
    if (keywords.split('|').some(k => q.includes(k))) return response
  }
  return chatResponses.default
}

function getFollowUpSuggestions(query) {
  const q = query.toLowerCase()
  for (const [keywords, suggestions] of Object.entries(chatSuggestions)) {
    if (keywords === 'initial' || keywords === 'default') continue
    if (keywords.split('|').some(k => q.includes(k))) return suggestions
  }
  return chatSuggestions.default
}

function renderMarkdown(text) {
  return text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\n/g, '<br>')
}

export default function ChatWidget({ insurer }) {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const bodyRef = useRef(null)
  const inputRef = useRef(null)

  const scrollToBottom = useCallback(() => {
    if (bodyRef.current) bodyRef.current.scrollTop = bodyRef.current.scrollHeight
  }, [])

  useEffect(() => { scrollToBottom() }, [messages, isTyping, scrollToBottom])

  const addBotMessage = useCallback((text, suggestions = []) => {
    setIsTyping(true)
    setTimeout(() => {
      setIsTyping(false)
      setMessages(prev => [...prev, { type: 'bot', text, suggestions }])
    }, 800 + Math.random() * 600)
  }, [])

  const handleOpen = useCallback(() => {
    setIsOpen(true)
    if (messages.length === 0) {
      setMessages([{
        type: 'bot welcome',
        text: `Willkommen zum **Umstellungsassistenten**! Ich kann Ihnen bei Fragen zur Vertragsumstellung auf das neue Provisionsmodell **${insurer.modellName}** helfen.\n\nWorüber möchten Sie mehr erfahren?`,
        suggestions: chatSuggestions.initial,
      }])
    }
    setTimeout(() => inputRef.current?.focus(), 100)
  }, [messages.length, insurer.modellName])

  const handleSend = useCallback((text) => {
    const msg = (text || input).trim()
    if (!msg) return
    setInput('')
    setMessages(prev => [...prev, { type: 'user', text: msg, suggestions: [] }])
    addBotMessage(findResponse(msg), getFollowUpSuggestions(msg))
  }, [input, addBotMessage])

  return (
    <>
      {!isOpen && (
        <button className="vu-chat-toggle" style={{ background: insurer.colors.gradient }} onClick={handleOpen}>
          <MessageSquare size={26} />
          <span className="chat-badge-indicator" style={{ background: insurer.colors.accent }}>KI</span>
        </button>
      )}

      <div className={`vu-chat-widget ${isOpen ? '' : 'hidden'}`}>
        <div className="vu-chat-header" style={{ background: `linear-gradient(135deg, ${insurer.colors.accent} 0%, ${insurer.colors.primary} 100%)` }}>
          <div className="vu-chat-header-left">
            <div className="vu-chat-avatar">
              <Settings size={20} />
            </div>
            <div className="vu-chat-header-info">
              <h4>Umstellungs-Assistent</h4>
              <span>Fragen zur Vertragsumstellung</span>
            </div>
          </div>
          <button className="vu-chat-close" onClick={() => setIsOpen(false)}>
            <X size={18} />
          </button>
        </div>

        <div className="vu-chat-body" ref={bodyRef}>
          {messages.map((msg, i) => (
            <div key={i}>
              <div
                className={`vu-chat-msg ${msg.type}`}
                dangerouslySetInnerHTML={{ __html: renderMarkdown(msg.text) }}
              />
              {msg.suggestions?.length > 0 && (
                <div className="vu-chat-suggestions">
                  {msg.suggestions.map((s, j) => (
                    <button key={j} onClick={() => handleSend(s)}>{s}</button>
                  ))}
                </div>
              )}
            </div>
          ))}
          {isTyping && (
            <div className="vu-typing">
              <span /><span /><span />
            </div>
          )}
        </div>

        <div className="vu-chat-footer">
          <input
            ref={inputRef}
            className="vu-chat-input"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend() } }}
            placeholder="Frage zur Vertragsumstellung..."
            autoComplete="off"
          />
          <button className="vu-chat-send" style={{ background: insurer.colors.gradient }} onClick={() => handleSend()}>
            <Send size={18} />
          </button>
        </div>
      </div>
    </>
  )
}
