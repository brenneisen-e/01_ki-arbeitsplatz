import { useEffect, useState } from 'react'
import styles from './App.module.css'
import { IntroChatbot } from './components/IntroChatbot'
import { BankExplorer } from './components/BankExplorer'
import { getAllImageSrcs } from './data/chapters'

// Auftakt: „Bank der Zukunft"-Chatbot (Name → Begrüßung → Vorschläge), der
// primäre Prompt baut das Strukturbild auf (Reveal) → danach das begehbare
// Haus.
function App(): React.ReactElement {
  const [entered, setEntered] = useState(false)

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
        <IntroChatbot onEnter={() => setEntered(true)} />
      )}
    </div>
  )
}

export default App
