import { useEffect, useState } from 'react'
import ModuleDetail from './components/ModuleDetail.jsx'
import VertriebsarbeitsplatzArchitektur from './components/VertriebsarbeitsplatzArchitektur.jsx'
import { findModule } from './data/modules.js'

// Hash router. Der Workshop-Einstieg ist jetzt direkt das Haus-Intro (blaues
// „Frage -> Thinking -> Strukturbild baut sich auf"-Reveal) unter
// /bank-der-zukunft-2035/dist/. Die frühere Q&A-Chatbot-Landing entfällt als
// Einstieg: die Default-Route leitet direkt dorthin weiter. Deep-Links auf
// einzelne Module bleiben erhalten.
//
// Supported routes:
//   #/                                           → redirect ins Haus (Default)
//   #/haus                                        → redirect ins Haus (Legacy)
//   #/modul/:moduleId                            → module detail
//   #/modul/betriebsmodell/vertriebsarbeitsplatz → architecture detail
function parseRoute(hash) {
  const clean = (hash || '').replace(/^#/, '').replace(/^\/+/, '')
  const parts = clean.split('/').filter(Boolean)
  if (parts[0] === 'modul' && parts[1]) {
    if (parts[1] === 'betriebsmodell' && parts[2] === 'vertriebsarbeitsplatz') {
      return { name: 'vertriebsarbeitsplatz' }
    }
    return { name: 'module', moduleId: parts[1] }
  }
  // Default (inkl. leer und Legacy #/haus): direkt ins Haus.
  return { name: 'redirect-haus' }
}

export default function App() {
  const [route, setRoute] = useState(() => parseRoute(window.location.hash))

  useEffect(() => {
    const onHashChange = () => {
      setRoute(parseRoute(window.location.hash))
      window.scrollTo({ top: 0, behavior: 'instant' })
    }
    window.addEventListener('hashchange', onHashChange)
    return () => window.removeEventListener('hashchange', onHashChange)
  }, [])

  // Direkt ins Haus weiterleiten (begehbares Strukturbild mit Intro-Reveal).
  useEffect(() => {
    if (route.name === 'redirect-haus') {
      window.location.replace('/bank-der-zukunft-2035/dist/')
    }
  }, [route])

  if (route.name === 'redirect-haus') return null
  if (route.name === 'vertriebsarbeitsplatz') return <VertriebsarbeitsplatzArchitektur />
  if (route.name === 'module') {
    const mod = findModule(route.moduleId)
    if (!mod) { window.location.replace('/bank-der-zukunft-2035/dist/'); return null }
    return <ModuleDetail module={mod} />
  }
  return null
}
