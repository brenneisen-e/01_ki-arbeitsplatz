import { useEffect, useState } from 'react'
import ChatbotLandingPage from './components/ChatbotLandingPage.jsx'
import HouseLandingPage from './components/HouseLandingPage.jsx'
import ModuleDetail from './components/ModuleDetail.jsx'
import VertriebsarbeitsplatzArchitektur from './components/VertriebsarbeitsplatzArchitektur.jsx'
import { findModule } from './data/modules.js'

// Hash router parses location.hash into a small route object.
// Supported routes:
//   #/                                           → chatbot landing (default)
//   #/haus                                       → animated bank-house view
//   #/modul/:moduleId                            → module detail
//   #/modul/betriebsmodell/vertriebsarbeitsplatz → architecture detail
function parseRoute(hash) {
  const clean = (hash || '').replace(/^#/, '').replace(/^\/+/, '')
  if (!clean) return { name: 'chatbot' }
  const parts = clean.split('/').filter(Boolean)
  if (parts[0] === 'haus') return { name: 'haus' }
  if (parts[0] === 'modul' && parts[1]) {
    if (parts[1] === 'betriebsmodell' && parts[2] === 'vertriebsarbeitsplatz') {
      return { name: 'vertriebsarbeitsplatz' }
    }
    return { name: 'module', moduleId: parts[1] }
  }
  return { name: 'chatbot' }
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

  if (route.name === 'vertriebsarbeitsplatz') return <VertriebsarbeitsplatzArchitektur />
  if (route.name === 'module') {
    const mod = findModule(route.moduleId)
    if (!mod) { window.location.hash = '#/'; return null }
    return <ModuleDetail module={mod} />
  }
  if (route.name === 'haus') return <HouseLandingPage />
  return <ChatbotLandingPage />
}
