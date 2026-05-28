import { useState } from 'react'
import styles from './App.module.css'
import { IntroChatbot } from './components/IntroChatbot'
import { BankExplorer } from './components/BankExplorer'

// Phasen: Intro-Chatbot (erzeugt das Strukturbild) → begehbare Übersicht.
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
