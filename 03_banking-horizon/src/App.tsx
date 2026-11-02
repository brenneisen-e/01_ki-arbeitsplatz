import { useCallback, useEffect, useRef, useState } from 'react'
import styles from './App.module.css'
import { IntroChatbot } from './components/IntroChatbot'
import { SzenarioIntro } from './components/SzenarioIntro'
import { BankExplorer } from './components/BankExplorer'
import { Holodeck } from './holodeck/Holodeck'
import { OperationsTag } from './operationstag/OperationsTag'
import { getAllImageSrcs } from './data/chapters'
import { HOLODECK_IMAGE_SRCS, isHolodeckHash } from './holodeck/data'
import {
  opsBildSrcs, isOperationsHash, operationsVariante, type OpsVariante,
} from './operationstag/data'
import { parseHash } from './deeplink'

// Drei Tools: das Standard-Strukturbild „Bank'26" (BankExplorer, Einstieg
// über den Landing-Chatbot), das „EDEKABANK Holodeck 2031" (#/holodeck) und
// „Ein Tag in Banking Operations 2030" (Maras Arbeitstag, #/operations, auch
// als Absprung aus Kapitel 03) — jeweils eigenständig und deep-linkbar.
type Tool = 'bank' | 'holodeck' | 'operations'

// Einstieg: OHNE Hash startet die App immer auf der Chat-Landing — auch dann,
// wenn man im selben Tab schon einmal drin war (früher merkte sich das eine
// Sitzungs-Marke, und der Absprung von der Plattform-Startseite landete
// dadurch direkt im Strukturbild). Ein Reload im Haus, in der Operations-
// Strecke oder in einem Kapitel bleibt trotzdem an Ort und Stelle: jedes
// Tool schreibt seinen Stand als Hash in die Adresszeile, und ein Hash gilt
// als Deep-Link.
// Szenario-Matrix „Vier Szenarien bis 2030" vor dem Strukturbild: vorerst
// abgeschaltet — sie war ein Platzhalter für den Workshop, die Inhalte sind
// noch nicht geschärft. Zum Reaktivieren auf true setzen; Komponente
// (SzenarioIntro) und Ablauf bleiben unverändert erhalten.
const SZENARIEN_AKTIV = false

// „EDEKABANK Holodeck 2031": vorerst abgeschaltet — kein Einstieg, auch nicht
// per #/holodeck (landet auf der Startseite), keine Vorlade-Liste. Zum
// Reaktivieren auf true setzen; Komponente und Daten bleiben erhalten.
const HOLODECK_AKTIV = false
const holodeckLink = () => HOLODECK_AKTIV && isHolodeckHash()

// Auftakt: „Bank der Zukunft"-Chatbot (Name → Begrüßung → Vorschläge), der
// primäre Prompt baut das Strukturbild auf (Reveal) → danach das begehbare
// Haus.
function App(): React.ReactElement {
  const [entered, setEntered] = useState(
    // Deep-Link auf ein Tool oder ein Kapitel / die Übersicht überspringt das Intro.
    () => holodeckLink() || isOperationsHash() || parseHash().view !== 'intro',
  )

  // Aktives Tool. Wird im Landing-Chatbot gewählt; ein #/holodeck-Deep-Link
  // öffnet direkt das Holodeck, andere Deep-Links das Standard-Strukturbild.
  const [tool, setTool] = useState<Tool>(() =>
    holodeckLink() ? 'holodeck' : isOperationsHash() ? 'operations' : 'bank',
  )

  // Rückweg aus der Operations-Strecke: der Hash des Kapitels, aus dem sie
  // im Vollbild geöffnet wurde (Kapitel 03). Ohne Eintrag (Deep-Link direkt
  // auf #/operations) führt „Overview" zur Startseite.
  const opsRueckkehr = useRef<string | null>(null)

  // Fassung von „Ein Tag in Banking Operations 2030" — es gibt nur noch eine
  // (v08); alte Links mit Versionsnummer oeffnen ebenfalls sie.
  const [opsVariante, setOpsVariante] = useState<OpsVariante>(operationsVariante)

  // Szenario-Matrix „bevor das Haus öffnet": erscheint nach dem Intro und vor
  // dem Strukturbild. Bei Deep-Links (direkt in ein Kapitel / Holodeck) wird sie
  // übersprungen, damit geteilte Links direkt am Ziel landen. Solange
  // SZENARIEN_AKTIV aus ist, gilt sie als gesehen und das Haus öffnet direkt.
  const [sawSzenarien, setSawSzenarien] = useState(
    () =>
      !SZENARIEN_AKTIV || holodeckLink() || isOperationsHash() || parseHash().view !== 'intro',
  )

  // Externe Hash-Änderung (Deep-Link in dieselbe Tab eingefügt / Vor-Zurück):
  // sitzt der Nutzer noch im Intro, direkt ins passende Tool wechseln.
  useEffect(() => {
    const onHash = () => {
      if (holodeckLink()) {
        setTool('holodeck')
        setEntered(true)
      } else if (isOperationsHash()) {
        setOpsVariante(operationsVariante())
        setTool('operations')
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
    setTool('bank')
    setEntered(true)
  }, [])

  // Operations-Strecke im Vollbild aus einem Kapitel heraus öffnen (Kap. 03):
  // Rückweg merken, Hash setzen — er ist zugleich der teilbare Vollbild-Link.
  const handleOpenOperations = useCallback(() => {
    opsRueckkehr.current = window.location.hash || '#/uebersicht'
    setOpsVariante(operationsVariante())
    try {
      window.location.hash = '#/operations/-1'
    } catch {
      // ohne Hash geht es auch
    }
    setTool('operations')
    setEntered(true)
  }, [])

  // Zurück zum Chatbot.
  const handleExitToIntro = useCallback(() => {
    // Deep-Link-Hash entfernen, damit ein Refresh wieder im Intro startet.
    try {
      window.history.replaceState(null, '', window.location.pathname + window.location.search)
    } catch {
      // history nicht verfügbar — der State-Wechsel allein genügt.
    }
    setTool('bank')
    setEntered(false)
    // Beim nächsten Betreten wieder mit der Szenario-Matrix starten (sofern aktiv).
    setSawSzenarien(!SZENARIEN_AKTIV)
  }, [])

  // „Overview" in der Operations-Strecke: zurück ins Kapitel, aus dem sie
  // geöffnet wurde — sonst zur Startseite.
  const handleExitOperations = useCallback(() => {
    const ziel = opsRueckkehr.current
    opsRueckkehr.current = null
    if (!ziel) {
      handleExitToIntro()
      return
    }
    setTool('bank')
    try {
      window.location.hash = ziel
    } catch {
      // ohne Hash landet der Explorer auf der Übersicht
    }
  }, [handleExitToIntro])

  // Alle Fotos (Strukturbild, Holodeck, Operations) im Hintergrund vorladen,
  // damit beim Öffnen keine Ladeverzögerung entsteht — aber bewusst EINES NACH
  // DEM ANDEREN. Werden alle gleichzeitig angefordert, belegen sie sämtliche
  // Verbindungen zum Server und die eigentlich dringenden Anfragen (das sichtbare
  // Bild, der Videoübergang in Operations) hängen minutenlang in der Warteschlange.
  // Die Bilder des gerade offenen Tools kommen zuerst.
  useEffect(() => {
    const holodeckBilder = HOLODECK_AKTIV ? HOLODECK_IMAGE_SRCS : []
    const reihenfolge =
      tool === 'operations'
        ? [...opsBildSrcs(opsVariante), ...getAllImageSrcs(), ...holodeckBilder]
        : tool === 'holodeck'
          ? [...holodeckBilder, ...getAllImageSrcs(), ...opsBildSrcs(opsVariante)]
          : [...getAllImageSrcs(), ...holodeckBilder, ...opsBildSrcs(opsVariante)]

    let gestoppt = false
    let aktuell: HTMLImageElement | null = null
    const naechstes = (n: number) => {
      if (gestoppt || n >= reihenfolge.length) return
      const img = new Image()
      img.fetchPriority = 'low'
      aktuell = img
      img.onload = img.onerror = () => naechstes(n + 1)
      img.src = reihenfolge[n]
    }
    // Erst nach dem ersten Rendern beginnen: sichtbare Inhalte haben Vorrang.
    const id = window.setTimeout(() => naechstes(0), 800)
    return () => {
      gestoppt = true
      window.clearTimeout(id)
      if (aktuell) aktuell.src = ''
    }
  }, [tool, opsVariante])

  return (
    <div className={styles.app}>
      {entered ? (
        tool === 'holodeck' ? (
          <Holodeck onExit={handleExitToIntro} />
        ) : tool === 'operations' ? (
          <OperationsTag onExit={handleExitOperations} variante={opsVariante} />
        ) : sawSzenarien ? (
          <BankExplorer onExitToIntro={handleExitToIntro} onOpenOperations={handleOpenOperations} />
        ) : (
          <SzenarioIntro onEnter={() => setSawSzenarien(true)} />
        )
      ) : (
        <IntroChatbot onEnter={handleEnter} />
      )}
    </div>
  )
}

export default App
