import { useState } from 'react'
import styles from './App.module.css'
import { IntroChatbot } from './components/IntroChatbot'
import { BankExplorer } from './components/BankExplorer'

// Auftakt: „Bank der Zukunft"-Chatbot stellt die vorbereitete Frage, denkt
// sichtbar nach und baut daraus das Strukturbild auf (Reveal) -> danach das
// begehbare Haus. Die äußere Chatbot-Landing (App „BankDerZukunft") verlinkt
// hierher; der „Zum Chat"-Link im Haus führt zurück.
function App(): React.ReactElement {
  const [entered, setEntered] = useState(false)

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
