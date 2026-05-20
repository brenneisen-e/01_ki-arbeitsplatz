import { useCallback, useEffect, useMemo, useState } from 'react'
import { ArrowLeft, KeyboardIcon } from 'lucide-react'
import styles from './App.module.css'
import { Scene } from './components/Scene'
import { SidePanel } from './components/SidePanel'
import { FLOORS, HOTSPOTS, type FloorId, type HotspotDef } from './data/modules'

function App(): React.ReactElement {
  const [focusedFloor, setFocusedFloor] = useState<FloorId | null>(null)
  const [activeHotspotId, setActiveHotspotId] = useState<string | null>(null)

  const activeHotspot: HotspotDef | null = useMemo(
    () => HOTSPOTS.find((h) => h.id === activeHotspotId) ?? null,
    [activeHotspotId],
  )

  const focusFloor = useCallback((id: FloorId | null) => {
    setFocusedFloor(id)
  }, [])

  const openHotspot = useCallback((id: string) => {
    const h = HOTSPOTS.find((x) => x.id === id)
    if (!h) return
    setFocusedFloor(h.floor)
    setActiveHotspotId(id)
  }, [])

  const closePanel = useCallback(() => setActiveHotspotId(null), [])

  const resetView = useCallback(() => {
    setActiveHotspotId(null)
    setFocusedFloor(null)
  }, [])

  // Keyboard Nav
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (activeHotspotId) closePanel()
        else if (focusedFloor) setFocusedFloor(null)
        return
      }
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        e.preventDefault()
        const dir = e.key === 'ArrowDown' ? 1 : -1
        const currentIndex =
          focusedFloor != null
            ? (FLOORS.find((f) => f.id === focusedFloor)?.order ?? 0)
            : -1
        const nextIndex =
          currentIndex === -1
            ? dir === 1
              ? 0
              : FLOORS.length - 1
            : Math.min(FLOORS.length - 1, Math.max(0, currentIndex + dir))
        const next = FLOORS.find((f) => f.order === nextIndex)
        if (next) {
          setFocusedFloor(next.id)
          setActiveHotspotId(null)
        }
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [focusedFloor, activeHotspotId, closePanel])

  return (
    <div className={styles.app}>
      <header className={styles.header}>
        <div className={styles.brand}>
          <span className={styles.brandMark} aria-hidden />
          <div className={styles.brandText}>
            <span className={styles.brandKicker}>Banking 2035</span>
            <span className={styles.brandTitle}>Bank der Zukunft — Querschnitt</span>
          </div>
        </div>

        <nav className={styles.floorNav} aria-label="Etage wählen">
          {FLOORS.map((f) => (
            <button
              key={f.id}
              type="button"
              className={
                focusedFloor === f.id
                  ? `${styles.floorNavBtn} ${styles.floorNavBtnActive}`
                  : styles.floorNavBtn
              }
              onClick={() => {
                setActiveHotspotId(null)
                setFocusedFloor((current) => (current === f.id ? null : f.id))
              }}
            >
              <span className={styles.floorNavIndex}>{f.order + 1}</span>
              <span className={styles.floorNavLabel}>{f.shortLabel}</span>
            </button>
          ))}
        </nav>

        <div className={styles.headerRight}>
          {(focusedFloor !== null || activeHotspotId !== null) && (
            <button type="button" className={styles.resetBtn} onClick={resetView}>
              <ArrowLeft size={16} aria-hidden />
              Übersicht
            </button>
          )}
        </div>
      </header>

      <main className={styles.stage}>
        <Scene
          focusedFloor={focusedFloor}
          activeHotspotId={activeHotspotId}
          onFocusFloor={focusFloor}
          onOpenHotspot={openHotspot}
        />
      </main>

      <SidePanel hotspot={activeHotspot} onClose={closePanel} />

      <footer className={styles.footer}>
        <div className={styles.footerHint}>
          <KeyboardIcon size={14} aria-hidden />
          <span>
            <kbd>↑</kbd> <kbd>↓</kbd> Etage · <kbd>Esc</kbd> schließen · Klick auf
            Hotspot öffnet Modul
          </span>
        </div>
        <div className={styles.footerMeta}>Workshop · LBBW · Vorstandsformat</div>
      </footer>
    </div>
  )
}

export default App
