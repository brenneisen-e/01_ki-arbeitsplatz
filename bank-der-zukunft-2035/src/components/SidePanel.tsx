import { useEffect, useRef, useState } from 'react'
import { X } from 'lucide-react'
import styles from './SidePanel.module.css'
import { FLOORS, type HotspotDef } from '../data/modules'

type SidePanelProps = {
  hotspot: HotspotDef | null
  onClose: () => void
}

export function SidePanel({ hotspot, onClose }: SidePanelProps): React.ReactElement {
  const closeBtnRef = useRef<HTMLButtonElement>(null)
  /** Wir halten den letzten Hotspot, um beim Schließen die Inhalte
   *  noch sichtbar zu haben, während das Panel raus animiert. */
  const [lastHotspot, setLastHotspot] = useState<HotspotDef | null>(hotspot)

  useEffect(() => {
    if (hotspot) {
      setLastHotspot(hotspot)
      // Focus auf Schließen-Button für Tastatur-Workflow
      const id = window.setTimeout(() => {
        closeBtnRef.current?.focus()
      }, 200)
      return () => window.clearTimeout(id)
    }
    return undefined
  }, [hotspot])

  const open = hotspot !== null
  const content = hotspot ?? lastHotspot

  const floor = content ? FLOORS.find((f) => f.id === content.floor) : null
  const Icon = content?.icon

  return (
    <>
      <div
        className={styles.scrim}
        data-open={open || undefined}
        onClick={onClose}
        aria-hidden
      />
      <aside
        className={styles.panel}
        data-open={open || undefined}
        aria-hidden={!open}
        role="dialog"
        aria-labelledby={content ? `panel-title-${content.id}` : undefined}
      >
        {content && (
          <>
            <div className={styles.header}>
              <div className={styles.headerKicker}>
                {floor && (
                  <>
                    <span className={styles.kickerIndex}>0{floor.order + 1}</span>
                    <span>{floor.title}</span>
                  </>
                )}
              </div>
              <button
                type="button"
                ref={closeBtnRef}
                className={styles.closeBtn}
                onClick={onClose}
                aria-label="Panel schließen"
              >
                <X size={18} strokeWidth={1.8} />
              </button>
            </div>

            <div className={styles.body}>
              <div className={styles.titleRow}>
                <span className={styles.iconBadge} aria-hidden>
                  {Icon && <Icon size={20} strokeWidth={1.7} />}
                </span>
                <h2 className={styles.title} id={`panel-title-${content.id}`}>
                  {content.title}
                </h2>
              </div>

              <p className={styles.description}>{content.description}</p>

              <div className={styles.hypothesis}>
                <span className={styles.hypothesisKicker}>Hypothese 2035</span>
                <p className={styles.hypothesisText}>{content.hypothesis}</p>
              </div>

              {content.facts && content.facts.length > 0 && (
                <dl className={styles.facts}>
                  {content.facts.map((f) => (
                    <div key={f.label} className={styles.factCell}>
                      <dt>{f.label}</dt>
                      <dd>{f.value}</dd>
                    </div>
                  ))}
                </dl>
              )}
            </div>

            <div className={styles.footer}>
              <span className={styles.footerHint}>
                Workshop-Notiz: Inhalte zentral in <code>src/data/modules.ts</code>.
              </span>
            </div>
          </>
        )}
      </aside>
    </>
  )
}
