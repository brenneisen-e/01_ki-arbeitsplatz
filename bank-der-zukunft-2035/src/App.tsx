import { useCallback, useEffect, useState } from 'react'
import styles from './App.module.css'
import { IntroChatbot } from './components/IntroChatbot'
import { BankExplorer } from './components/BankExplorer'
import { getAllImageSrcs } from './data/chapters'

// Persistenz-Key: merkt sich für die Dauer der Browser-Sitzung, dass der Nutzer
// das Intro bereits durchlaufen hat — ein Refresh springt dann NICHT zurück auf
// die Chatbot-Landing-Page. Ein frisch geöffneter Tab zeigt das Intro erneut.
const ENTERED_KEY = 'bz2035:entered'

// Auftakt: „Bank der Zukunft"-Chatbot (Name → Begrüßung → Vorschläge), der
// primäre Prompt baut das Strukturbild auf (Reveal) → danach das begehbare
// Haus.
function App(): React.ReactElement {
  const [entered, setEntered] = useState(() => {
    try {
      return sessionStorage.getItem(ENTERED_KEY) === '1'
    } catch {
      return false
    }
  })

  const handleEnter = useCallback(() => {
    try {
      sessionStorage.setItem(ENTERED_KEY, '1')
    } catch {
      // sessionStorage nicht verfügbar (z. B. privater Modus) — dann eben ohne
      // Persistenz; der normale Flow funktioniert trotzdem.
    }
    setEntered(true)
  }, [])

  // Alle Strukturbild-/Kapitel-Fotos schon beim App-Start (während des Intros)
  // im Hintergrund vorladen, damit beim Öffnen eines Kapitels keine
  // Ladeverzögerung entsteht.
  useEffect(() => {
    const imgs = getAllImageSrcs().map((src) => {
      const img = new Image()
      img.src = src
      return img
    })
    return () => {
      for (const img of imgs) img.src = ''
    }
  }, [])

  return (
    <div className={styles.app}>
      {entered ? (
        <BankExplorer />
      ) : (
        <IntroChatbot onEnter={handleEnter} />
      )}
    </div>
  )
}

export default App
