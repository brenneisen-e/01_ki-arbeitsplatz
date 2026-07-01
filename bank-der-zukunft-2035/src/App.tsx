import { useCallback, useEffect, useState } from 'react'
import styles from './App.module.css'
import { IntroChatbot } from './components/IntroChatbot'
import { SzenarioIntro } from './components/SzenarioIntro'
import { BankExplorer } from './components/BankExplorer'
import { Holodeck } from './holodeck/Holodeck'
import { getAllImageSrcs } from './data/chapters'
import { HOLODECK_IMAGE_SRCS, isHolodeckHash } from './holodeck/data'
import { parseHash } from './deeplink'

// Über den Landing-Chatbot wählbare Tools: das Standard-Strukturbild „Bank'26"
// (BankExplorer) und das eigenständige „EDEKABANK Holodeck 2031" (eigener Button).
type Tool = 'bank' | 'holodeck'

// Persistenz-Key: merkt sich für die Dauer der Browser-Sitzung, dass der Nutzer
// das Intro bereits durchlaufen hat — ein Refresh springt dann NICHT zurück auf
// die Chatbot-Landing-Page. Ein frisch geöffneter Tab zeigt das Intro erneut.
const ENTERED_KEY = 'bz2030:entered'

// Auftakt: „Bank der Zukunft"-Chatbot (Name → Begrüßung → Vorschläge), der
// primäre Prompt baut das Strukturbild auf (Reveal) → danach das begehbare
// Haus.
function App(): React.ReactElement {
  const [entered, setEntered] = useState(() => {
    // Deep-Link auf Holodeck oder ein Kapitel / die Übersicht überspringt das Intro.
    if (isHolodeckHash() || parseHash().view !== 'intro') return true
    try {
      return sessionStorage.getItem(ENTERED_KEY) === '1'
    } catch {
      return false
    }
  })

  // Aktives Tool. Wird im Landing-Chatbot gewählt; ein #/holodeck-Deep-Link
  // öffnet direkt das Holodeck, andere Deep-Links das Standard-Strukturbild.
  const [tool, setTool] = useState<Tool>(() => (isHolodeckHash() ? 'holodeck' : 'bank'))

  // Szenario-Matrix „bevor das Haus öffnet": erscheint nach dem Intro und vor
  // dem Strukturbild. Bei Deep-Links (direkt in ein Kapitel / Holodeck) wird sie
  // übersprungen, damit geteilte Links direkt am Ziel landen.
  const [sawSzenarien, setSawSzenarien] = useState(() => isHolodeckHash() || parseHash().view !== 'intro')

  // Externe Hash-Änderung (Deep-Link in dieselbe Tab eingefügt / Vor-Zurück):
  // sitzt der Nutzer noch im Intro, direkt ins passende Tool wechseln.
  useEffect(() => {
    const onHash = () => {
      if (isHolodeckHash()) {
        setTool('holodeck')
        setEntered(true)
      } else if (parseHash().view !== 'intro') {
        setTool('bank')
        setEntered(true)
        setSawSzenarien(true)
      }
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
    setTool('bank')
    setEntered(true)
  }, [])

  // EDEKABANK Holodeck direkt aus dem Landing-Chatbot betreten (eigener Button).
  const handleEnterEdeka = useCallback(() => {
    setTool('holodeck')
    setEntered(true)
  }, [])

  // Zurück zum Chatbot: Intro-Persistenz löschen, damit auch ein Refresh wieder
  // auf dem Chatbot landet.
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
    setTool('bank')
    setEntered(false)
    // Beim nächsten Betreten wieder mit der Szenario-Matrix starten.
    setSawSzenarien(false)
  }, [])

  // Alle Fotos (Strukturbild + Holodeck) schon beim App-Start im Hintergrund
  // vorladen, damit beim Öffnen keine Ladeverzögerung entsteht.
  useEffect(() => {
    const srcs = [...getAllImageSrcs(), ...HOLODECK_IMAGE_SRCS]
    const imgs = srcs.map((src) => {
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
        tool === 'holodeck' ? (
          <Holodeck onExit={handleExitToIntro} />
        ) : sawSzenarien ? (
          <BankExplorer onExitToIntro={handleExitToIntro} />
        ) : (
          <SzenarioIntro onEnter={() => setSawSzenarien(true)} />
        )
      ) : (
        <IntroChatbot onEnter={handleEnter} onEnterEdeka={handleEnterEdeka} />
      )}
    </div>
  )
}

export default App
