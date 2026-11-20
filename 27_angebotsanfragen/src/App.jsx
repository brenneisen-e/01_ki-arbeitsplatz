import { useState, useCallback, useEffect } from 'react'
import { AppProvider } from './context/AppContext'
import Header, { REITER } from './components/Header'
import ToastContainer from './components/Toast'
import VorgangModal from './components/VorgangModal'
import Praesentation from './components/Praesentation'
import UebersichtPage from './pages/UebersichtPage'
import StreckePage from './pages/StreckePage'
import LayoutsPage from './pages/LayoutsPage'
import ProzessPage from './pages/ProzessPage'
import { VORGAENGE, BEISPIELE } from './daten/vorgaenge'

const ANSICHTEN = REITER.map(r => r.id)

/**
 * Ziel aus dem URL-Hash, damit sich jede Stelle direkt verlinken lässt:
 *   #strecke            eine Ansicht
 *   #beispiel-3         Beispielanfrage 3, Original und Deckblatt nebeneinander
 *   #praesentation      die Präsentation, mit #praesentation-3 an Beispiel 3,
 *                       mit #praesentation-3-2 gleich in Schritt 2 (fertig gelesen)
 */
function zielAusHash() {
  const hash = window.location.hash.replace(/^#\/?/, '')
  const treffer = /^(beispiel|praesentation)(?:-?(\d+))?(?:-([1-6]))?$/.exec(hash)
  if (treffer) {
    const beispiel = treffer[2] ? BEISPIELE.find(v => v.beispiel === Number(treffer[2])) || null : null
    return { ansicht: 'uebersicht', art: treffer[1], beispiel, schritt: treffer[3] ? Number(treffer[3]) - 1 : 0 }
  }
  return { ansicht: ANSICHTEN.includes(hash) ? hash : 'uebersicht', art: null, beispiel: null }
}

function AppContent() {
  const [activeView, setActiveView] = useState(() => zielAusHash().ansicht)
  const [offen, setOffen] = useState({ vorgang: null, schritt: 0 })
  const [praesentation, setPraesentation] = useState({ offen: false, start: 0, vorgangId: null })
  // Die Präsentation endet mit dem Sprung in die Auswertung aller Eingänge auf der Angebotsstrecke.
  const [auswertungAngefordert, setAuswertungAngefordert] = useState(0)

  // Ansicht und URL-Hash in beide Richtungen koppeln. Der Hash wird ersetzt
  // statt angehängt, damit jeder Tabwechsel keinen Verlaufseintrag erzeugt.
  useEffect(() => {
    const ausHash = () => {
      const ziel = zielAusHash()
      setActiveView(ziel.ansicht)
      if (ziel.art === 'beispiel' && ziel.beispiel) setOffen({ vorgang: ziel.beispiel, schritt: 0 })
      if (ziel.art === 'praesentation') setPraesentation({ offen: true, start: ziel.schritt, vorgangId: ziel.beispiel?.id || null })
    }
    // Ein Direktlink auf ein Beispiel oder die Präsentation gilt auch beim ersten Laden.
    if (zielAusHash().art) ausHash()
    window.addEventListener('hashchange', ausHash)
    return () => window.removeEventListener('hashchange', ausHash)
  }, [])

  // Solange eine Beispielanfrage offen ist, steht ihr Direktlink in der Adresse
  // (#beispiel-3): Er lässt sich kopieren, und ein Neuladen öffnet sie wieder.
  const offenesBeispiel = offen.vorgang?.beispiel || null
  useEffect(() => {
    const ziel = offenesBeispiel ? `#beispiel-${offenesBeispiel}`
      : activeView === 'uebersicht' ? '' : `#${activeView}`
    if (window.location.hash !== ziel) {
      // Nur der Teil hinter dem # ändert sich. Das geht auch in der Einzeldatei
      // des Download-Pakets, die als blob-Adresse oder per Doppelklick läuft und
      // dort keine andere Adresse annehmen darf.
      try { history.replaceState(null, '', ziel || window.location.href.split('#')[0]) } catch { /* Adresse bleibt, die Ansicht wechselt trotzdem */ }
    }
  }, [activeView, offenesBeispiel])

  const oeffneVorgang = useCallback((vorgang, schritt = 0) => setOffen({ vorgang, schritt }), [])
  const schliesseVorgang = useCallback(() => setOffen({ vorgang: null, schritt: 0 }), [])
  const startePraesentation = useCallback((start = 0, vorgangId = null) => setPraesentation({
    offen: true,
    start: typeof start === 'number' ? start : 0,
    vorgangId: typeof vorgangId === 'string' ? vorgangId : null
  }), [])

  const zurAuswertung = useCallback(() => {
    setActiveView('strecke')
    setAuswertungAngefordert(n => n + 1)
  }, [])

  return (
    <div className="flex flex-col min-h-screen" style={{ backgroundColor: 'var(--bg-primary)' }}>
      <Header
        activeView={activeView}
        onViewChange={setActiveView}
        anzahl={VORGAENGE.length}
        onPraesentation={() => startePraesentation(0)}
        beispiele={BEISPIELE}
        onBeispiel={oeffneVorgang}
      />

      <main className="flex-1">
        {activeView === 'uebersicht' && <UebersichtPage onOpenVorgang={oeffneVorgang} onPraesentation={startePraesentation} />}
        {activeView === 'strecke' && (
          <StreckePage onOpenVorgang={oeffneVorgang} onPraesentation={startePraesentation} auswertungAngefordert={auswertungAngefordert} />
        )}
        {activeView === 'layouts' && <LayoutsPage onOpenVorgang={oeffneVorgang} />}
        {activeView === 'prozess' && <ProzessPage onPraesentation={() => startePraesentation(0)} />}
      </main>

      <VorgangModal vorgang={offen.vorgang} startSchritt={offen.schritt} onClose={schliesseVorgang} onWechsel={oeffneVorgang} />
      <Praesentation
        offen={praesentation.offen}
        startSchritt={praesentation.start}
        startVorgangId={praesentation.vorgangId}
        onClose={() => setPraesentation(p => ({ ...p, offen: false }))}
        aufAuswertung={zurAuswertung}
        aufVorgang={oeffneVorgang}
      />
      <ToastContainer />
    </div>
  )
}

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  )
}
