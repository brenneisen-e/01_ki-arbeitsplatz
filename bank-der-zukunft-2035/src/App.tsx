import styles from './App.module.css'
import { BankExplorer } from './components/BankExplorer'

function App(): React.ReactElement {
  return (
    <div className={styles.app}>
      <BankExplorer />
    </div>
  )
}

export default App
