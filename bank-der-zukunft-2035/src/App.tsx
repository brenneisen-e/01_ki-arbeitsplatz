import { useCallback, useEffect, useMemo, useState } from 'react'
import styles from './App.module.css'
import { IntroChatbot } from './components/IntroChatbot'
import { BankExplorer } from './components/BankExplorer'
import { DEFAULT_API } from './data/chapters'
import { EDEKA_API } from './data/edekabank'
import { parseHash } from './deeplink'

// Wählbare Instanzen derselben Engine: die Standard-Bank „Bank'26" und die
// zweite Instanz „Edekabank" (über einen eigenen Button im Landing-Chatbot).
type ExperienceId = 'bank2026' | 'edeka'

// Persistenz-Key: merkt sich für die Dauer der Browser-Sitzung, dass der Nutzer
// das Intro bereits durchlaufen hat — ein Refresh springt dann NICHT zurück auf
// die Chatbot-Landing-Page. Ein frisch geöffneter Tab zeigt das Intro erneut.
const ENTERED_KEY = 'bz2035:entered'

// Auftakt: „Bank der Zukunft"-Chatbot (Name → Begrüßung → Vorschläge), der
// primäre Prompt baut das Strukturbild auf (Reveal) → danach das begehbare
// Haus.
function App(): React.ReactElement {
  const [entered, setEntered] = useState(() => {
    // Deep-Link auf ein Kapitel / die Übersicht überspringt das Intro.
    if (parseHash().view !== 'intro') return true
    try {
      return sessionStorage.getItem(ENTERED_KEY) === '1'
    } catch {
      return false
    }
  })

  // Aktive Instanz (Standard-Bank oder Edekabank). Wird im Landing-Chatbot
  // gewählt; ein Deep-Link betrifft immer die Standard-Instanz.
  const [experienceId, setExperienceId] = useState<ExperienceId>('bank2026')
  const api = useMemo(() => (experienceId === 'edeka' ? EDEKA_API : DEFAULT_API), [experienceId])

  // Externe Hash-Änderung (Deep-Link in dieselbe Tab eingefügt / Vor-Zurück):
  // sitzt der Nutzer noch im Intro, direkt ins begehbare Haus wechseln.
  useEffect(() => {
    const onHash = () => {
      if (parseHash().view !== 'intro') setEntered(true)
    }
    window.addEventListener('hashchange', onHash)
    return () => window.removeEventListener('hashchange', onHash)
  }, [])

  const handleEnter = useCallback(() => {
    try {
      sessionStorage.setItem(ENTERED_KEY, '1')
    } catch {
      // sessionStorage nicht verfügbar (z. B. privater Modus) — dann eben ohne
      // Persistenz; der normale Flow funktioniert trotzdem.
    }
    setExperienceId('bank2026')
    setEntered(true)
  }, [])

  // Edekabank-Instanz direkt aus dem Landing-Chatbot betreten (eigener Button).
  const handleEnterEdeka = useCallback(() => {
    setExperienceId('edeka')
    setEntered(true)
  }, [])

  // Zurück zum Chatbot (aus der Strukturbild-Übersicht): Intro-Persistenz
  // löschen, damit auch ein Refresh wieder auf dem Chatbot landet.
  const handleExitToIntro = useCallback(() => {
    try {
      sessionStorage.removeItem(ENTERED_KEY)
    } catch {
      // siehe oben — ohne sessionStorage einfach nur der State-Wechsel.
    }
    // Deep-Link-Hash entfernen, damit ein Refresh wieder im Intro startet.
    try {
      window.history.replaceState(null, '', window.location.pathname + window.location.search)
    } catch {
      // history nicht verfügbar — der State-Wechsel allein genügt.
    }
    setExperienceId('bank2026')
    setEntered(false)
  }, [])

  // Alle Strukturbild-/Kapitel-Fotos schon beim App-Start (während des Intros)
  // im Hintergrund vorladen, damit beim Öffnen eines Kapitels keine
  // Ladeverzögerung entsteht.
  useEffect(() => {
    const imgs = api.getAllImageSrcs().map((src) => {
      const img = new Image()
      img.src = src
      return img
    })
    return () => {
      for (const img of imgs) img.src = ''
    }
  }, [api])

  return (
    <div className={styles.app}>
      {entered ? (
        <BankExplorer api={api} onExitToIntro={handleExitToIntro} />
      ) : (
        <IntroChatbot onEnter={handleEnter} onEnterEdeka={handleEnterEdeka} />
      )}
    </div>
  )
}

export default App
