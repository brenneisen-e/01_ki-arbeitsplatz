import { useState, type FormEvent, type ReactNode } from 'react'
import { Lock } from 'lucide-react'
import { pruefeZugang, zugangGespeichert, zugangMoeglich } from './zugang'

// Kennwortkarte vor den Notizen (siehe zugang.ts). Solange sie steht, ist
// Notizen nicht gemountet: kein Herzschlag auf dem Kanal, das Strukturbild
// leitet also auch kein Radeln um.

const TEXTE = {
  de: {
    titel: 'Speakernotes', text: 'Die Notizen sind geschützt. Bitte das Kennwort eingeben.',
    feld: 'Kennwort', knopf: 'Öffnen', falsch: 'Das Kennwort stimmt nicht.',
    unsicher: 'Die Prüfung braucht eine sichere Verbindung (https oder localhost).',
  },
  en: {
    titel: 'Speaker notes', text: 'The notes are protected. Please enter the password.',
    feld: 'Password', knopf: 'Open', falsch: 'That password is not correct.',
    unsicher: 'The check needs a secure connection (https or localhost).',
  },
}

export function Zugang({ sprache, children }: { sprache: 'de' | 'en'; children: ReactNode }): React.ReactElement {
  const [offen, setOffen] = useState(zugangGespeichert)
  const [wert, setWert] = useState('')
  const [fehler, setFehler] = useState(false)
  const [prueft, setPrueft] = useState(false)
  const T = TEXTE[sprache]
  if (offen) return <>{children}</>
  const moeglich = zugangMoeglich()

  const absenden = async (e: FormEvent) => {
    e.preventDefault()
    if (!moeglich || prueft || !wert) return
    setPrueft(true)
    const ok = await pruefeZugang(wert)
    setPrueft(false)
    if (ok) { setOffen(true); return }
    setFehler(true)
    setWert('')
  }

  return (
    <div className="zugang">
      <form className="zugangKarte" onSubmit={absenden}>
        <div className="zugangIcon" aria-hidden="true"><Lock size={18} /></div>
        <h1>{T.titel}</h1>
        <p>{moeglich ? T.text : T.unsicher}</p>
        <label className="zugangFeld">
          <span>{T.feld}</span>
          <input
            type="password"
            autoFocus
            autoComplete="current-password"
            value={wert}
            disabled={!moeglich}
            aria-invalid={fehler || undefined}
            onChange={(e) => { setWert(e.target.value); setFehler(false) }}
          />
        </label>
        {fehler && <p className="zugangFehler" role="alert">{T.falsch}</p>}
        <button type="submit" className="knopf zugangKnopf" disabled={!moeglich || prueft || !wert}>{T.knopf}</button>
      </form>
    </div>
  )
}
