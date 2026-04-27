import { useEffect, useState } from 'react'
import LandingPage from './components/LandingPage.jsx'
import ModuleDetail from './components/ModuleDetail.jsx'
import VertriebsarbeitsplatzArchitektur from './components/VertriebsarbeitsplatzArchitektur.jsx'
import { findModule } from './data/modules.js'

// Hash router parses location.hash into a small route object.
// Supported routes:
//   #/                                           → landing
//   #/modul/:moduleId                            → module detail
//   #/modul/betriebsmodell/vertriebsarbeitsplatz → architecture detail
function parseRoute(hash) {
  const clean = (hash || '').replace(/^#/, '').replace(/^\/+/, '')
  if (!clean) return { name: 'landing' }
  const parts = clean.split('/').filter(Boolean)
  if (parts[0] === 'modul' && parts[1]) {
    if (parts[1] === 'betriebsmodell' && parts[2] === 'vertriebsarbeitsplatz') {
      return { name: 'vertriebsarbeitsplatz' }
    }
    return { name: 'module', moduleId: parts[1] }
  }
  return { name: 'landing' }
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

  let content
  if (route.name === 'vertriebsarbeitsplatz') {
    content = <VertriebsarbeitsplatzArchitektur />
  } else if (route.name === 'module') {
    const mod = findModule(route.moduleId)
    if (!mod) {
      window.location.hash = '#/'
      return null
    }
    content = <ModuleDetail module={mod} />
  } else {
    content = <LandingPage />
  }

  return content
}
