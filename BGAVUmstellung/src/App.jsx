import { useState, useMemo, useCallback, useEffect, useRef } from 'react'
import Header from './components/Header'
import VermittlerBar from './components/VermittlerBar'
import TabBar from './components/TabBar'
import UebersichtTab from './components/UebersichtTab'
import SimulationTab from './components/SimulationTab'
import ChatWidget from './components/ChatWidget'
import { defaultSimulation, vermittlerList, insurerModes, defaultInsurer } from './data/constants'
import { calculateProvisions, getKarriereStufe } from './utils/calculations'

function loadInsurer() {
  try {
    const saved = localStorage.getItem('vu_insurer')
    if (saved && insurerModes[saved]) return saved
  } catch {}
  return defaultInsurer
}

export default function App() {
  const [activeTab, setActiveTab] = useState('simulation')
  const [simulation, setSimulation] = useState({ ...defaultSimulation })
  const [selectedVermittler, setSelectedVermittler] = useState(vermittlerList[0])
  const [insurerKey, setInsurerKey] = useState(loadInsurer)
  const containerRef = useRef(null)

  const insurer = insurerModes[insurerKey]

  // Apply CSS variables when insurer changes
  useEffect(() => {
    const el = containerRef.current || document.documentElement
    const c = insurer.colors
    el.style.setProperty('--mode-primary', c.primary)
    el.style.setProperty('--mode-primary-light', c.primaryLight)
    el.style.setProperty('--mode-accent', c.accent)
    el.style.setProperty('--mode-gradient', c.gradient)
    el.style.setProperty('--mode-sidebar-gradient', c.sidebarGradient)
    el.style.setProperty('--mode-ub-sidebar-gradient', c.ubSidebarGradient)
    el.style.setProperty('--mode-ub-border', c.ubBorder)
    el.style.setProperty('--mode-sim-border', c.simBorder)
    try { localStorage.setItem('vu_insurer', insurerKey) } catch {}
  }, [insurer, insurerKey])

  const results = useMemo(() => calculateProvisions(simulation), [simulation])
  const karriereStufe = useMemo(() => getKarriereStufe(simulation), [simulation])

  const updateSlider = useCallback((field, value) => {
    setSimulation(prev => ({ ...prev, [field]: value }))
  }, [])

  const switchInsurer = useCallback((key) => {
    setInsurerKey(key)
  }, [])

  return (
    <div className="vu-container" ref={containerRef}>
      <Header insurer={insurer} onSwitchInsurer={switchInsurer} currentKey={insurerKey} />
      <VermittlerBar selected={selectedVermittler} onSelect={setSelectedVermittler} insurer={insurer} />
      <TabBar activeTab={activeTab} onTabChange={setActiveTab} />

      {activeTab === 'uebersicht' && <UebersichtTab insurer={insurer} />}
      {activeTab === 'simulation' && (
        <SimulationTab
          simulation={simulation}
          results={results}
          karriereStufe={karriereStufe}
          onSliderChange={updateSlider}
          insurer={insurer}
        />
      )}

      <ChatWidget insurer={insurer} />
    </div>
  )
}
