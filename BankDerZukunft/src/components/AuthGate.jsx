import { useEffect, useRef, useState } from 'react'
import { Lock, Info, Compass } from 'lucide-react'

const AUTH_KEY = 'kiarbeitsplatz_auth_v1'

// Prüft den bestehenden localStorage-Flag synchron (damit beim Wechsel von der
// Root-Landing in die Workshop-App kein Zwischen-Flash entsteht).
function readAuthed() {
  try {
    return localStorage.getItem(AUTH_KEY) === 'ok'
  } catch {
    return false
  }
}

export default function AuthGate({ children }) {
  const [authed, setAuthed] = useState(() => readAuthed())
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const [showInfo, setShowInfo] = useState(false)
  const inputRef = useRef(null)

  useEffect(() => {
    if (!authed && inputRef.current) {
      const t = setTimeout(() => inputRef.current?.focus(), 80)
      return () => clearTimeout(t)
    }
  }, [authed])

  async function handleSubmit(e) {
    e.preventDefault()
    if (!password) {
      setError('Bitte ein Passwort eingeben.')
      return
    }
    setBusy(true)
    setError('')
    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ password }),
        credentials: 'same-origin',
      })
      if (res.status === 401) throw new Error('Falsches Passwort.')
      if (res.status === 500) throw new Error('ACCESS_PASSWORD-Secret ist noch nicht in Cloudflare hinterlegt.')
      if (!res.ok) throw new Error('Fehler ' + res.status + ' beim Anmelden.')
      const data = await res.json()
      if (!data?.ok) throw new Error('Falsches Passwort.')
      try { localStorage.setItem(AUTH_KEY, 'ok') } catch {}
      setAuthed(true)
    } catch (err) {
      setError(err?.message || 'Unbekannter Fehler.')
      setBusy(false)
    }
  }

  if (authed) return children

  return (
    <div className="bdz-stage flex items-center justify-center">
      <div className="bdz-stars absolute inset-0" />

      <div
        className="bdz-pulse-glow pointer-events-none absolute"
        style={{
          left: '10%',
          top: '20%',
          width: 480,
          height: 480,
          background: 'radial-gradient(circle, rgba(14,165,233,0.3), transparent 70%)',
          filter: 'blur(60px)',
        }}
      />
      <div
        className="bdz-pulse-glow pointer-events-none absolute"
        style={{
          right: '10%',
          bottom: '10%',
          width: 520,
          height: 520,
          background: 'radial-gradient(circle, rgba(168,85,247,0.25), transparent 70%)',
          filter: 'blur(60px)',
          animationDelay: '2s',
        }}
      />

      <div className="relative z-10 bdz-card bdz-fade-in w-full max-w-md mx-4 p-8">
        <div
          className="bdz-halo"
          style={{ background: 'radial-gradient(circle, rgba(99,102,241,0.4), transparent 70%)' }}
        />

        <div
          className="w-14 h-14 rounded-2xl flex items-center justify-center mb-6"
          style={{
            background: 'linear-gradient(135deg, #0ea5e9 0%, #6366f1 100%)',
            boxShadow: '0 12px 32px rgba(99,102,241,0.45)',
          }}
        >
          <Compass size={28} color="white" strokeWidth={1.75} />
        </div>

        <div className="text-xs tracking-widest uppercase text-slate-400 font-medium mb-1">
          Bank der Zukunft · Workshop
        </div>
        <h1 className="text-white font-bold text-2xl tracking-tight mb-2">Zugang</h1>
        <p className="text-slate-300 text-sm leading-relaxed mb-6">
          Dieser interaktive Workshop ist passwortgeschützt. Bitte gib das Zugangspasswort ein.
        </p>

        <form onSubmit={handleSubmit} autoComplete="off">
          <label className="relative block mb-3">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
              <Lock size={16} strokeWidth={2} />
            </span>
            <input
              ref={inputRef}
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Passwort"
              autoComplete="current-password"
              className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/5 border border-white/15 text-white placeholder-slate-500 text-sm outline-none transition-colors focus:border-white/40 focus:bg-white/10"
            />
          </label>

          <button
            type="submit"
            disabled={busy}
            className="w-full rounded-xl py-3 text-sm font-semibold text-white transition-transform hover:scale-[1.02] disabled:opacity-60 disabled:hover:scale-100"
            style={{
              background: 'linear-gradient(135deg, #0ea5e9 0%, #6366f1 100%)',
              boxShadow: '0 10px 28px rgba(99,102,241,0.45)',
            }}
          >
            {busy ? 'Prüfe…' : 'Workshop öffnen'}
          </button>

          {error && (
            <div className="mt-3 rounded-xl border border-rose-400/30 bg-rose-500/10 px-3 py-2 text-sm text-rose-200">
              {error}
            </div>
          )}
        </form>

        <button
          type="button"
          onClick={() => setShowInfo((s) => !s)}
          className="mt-6 inline-flex items-center gap-1.5 text-slate-400 hover:text-white transition-colors text-xs"
          aria-expanded={showInfo}
        >
          <Info size={13} strokeWidth={2} />
          Wie erhalte ich Zugang?
        </button>

        {showInfo && (
          <div className="mt-3 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-300 leading-relaxed">
            Zugriff auf das Tool kannst du per E-Mail bei{' '}
            <a
              href="mailto:ebrenneisen@deloitte.de?subject=Zugriff%20Bank%20der%20Zukunft%20Workshop"
              className="text-sky-300 font-semibold hover:text-sky-200 no-underline"
            >
              ebrenneisen@deloitte.de
            </a>{' '}
            anfragen.
          </div>
        )}
      </div>
    </div>
  )
}
