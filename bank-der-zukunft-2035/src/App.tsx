import styles from './App.module.css'
import { BankExplorer } from './components/BankExplorer'

// Der Einstieg ins Haus erfolgt über die Chatbot-Landing (separate App
// „BankDerZukunft", verlinkt direkt hierher). Diese App startet daher
// unmittelbar mit der begehbaren Übersicht — ohne eigenen Intro-Chat.
function App(): React.ReactElement {
  return (
    <div className={styles.app}>
      <BankExplorer />
    </div>
  )
}

export default App
