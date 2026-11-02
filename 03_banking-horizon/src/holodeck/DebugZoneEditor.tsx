import { useCallback, useRef, useState } from 'react'
import { Check, Copy, X } from 'lucide-react'
import styles from './DebugZoneEditor.module.css'
import { AREA_ORDER, getArea, type AreaId, type Zone } from './data'

// ─────────────────────────────────────────────────────────────────────────────
// DebugZoneEditor — Kalibrierung der Hotspot-Zonen am echten Ankerbild (Spec §11).
// Aktivierung über Taste „D" oder ?debug. Blendet die fünf Zonen als ziehbare
// Kreise ein, zeigt die Mausposition live in %, erlaubt Radius-Justierung und
// gibt die justierten ZONES als kopierbaren TS-Code aus. Nicht im Workshop-Modus.
// ─────────────────────────────────────────────────────────────────────────────

type Props = {
  zones: Record<AreaId, Zone>
  onChange: (next: Record<AreaId, Zone>) => void
  onClose: () => void
}

const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v))
const round1 = (v: number) => Math.round(v * 10) / 10

export function DebugZoneEditor({ zones, onChange, onClose }: Props): React.ReactElement {
  const overlayRef = useRef<HTMLDivElement>(null)
  const [selected, setSelected] = useState<AreaId>('vertrieb')
  const [dragId, setDragId] = useState<AreaId | null>(null)
  const [mouse, setMouse] = useState({ x: 0, y: 0 })
  const [copied, setCopied] = useState(false)

  const toPct = useCallback((clientX: number, clientY: number) => {
    const rect = overlayRef.current?.getBoundingClientRect()
    if (!rect) return { x: 0, y: 0 }
    return {
      x: clamp(((clientX - rect.left) / rect.width) * 100, 0, 100),
      y: clamp(((clientY - rect.top) / rect.height) * 100, 0, 100),
    }
  }, [])

  const onPointerMove = useCallback(
    (e: React.PointerEvent) => {
      const p = toPct(e.clientX, e.clientY)
      setMouse(p)
      if (dragId) {
        onChange({ ...zones, [dragId]: { ...zones[dragId], x: round1(p.x), y: round1(p.y) } })
      }
    },
    [dragId, onChange, toPct, zones],
  )

  const startDrag = useCallback((id: AreaId, e: React.PointerEvent) => {
    e.stopPropagation()
    ;(e.target as HTMLElement).setPointerCapture(e.pointerId)
    setSelected(id)
    setDragId(id)
  }, [])

  const endDrag = useCallback((e: React.PointerEvent) => {
    ;(e.target as HTMLElement).releasePointerCapture?.(e.pointerId)
    setDragId(null)
  }, [])

  const setRadius = useCallback(
    (id: AreaId, r: number) => onChange({ ...zones, [id]: { ...zones[id], r: round1(clamp(r, 2, 30)) } }),
    [onChange, zones],
  )

  const code =
    'const ZONES: Record<AreaId, Zone> = {\n' +
    AREA_ORDER.map((id) => {
      const z = zones[id]
      return `  ${(id + ':').padEnd(10)}{ x: ${round1(z.x)}, y: ${round1(z.y)}, r: ${round1(z.r)} },`
    }).join('\n') +
    '\n}'

  const copy = useCallback(() => {
    navigator.clipboard?.writeText(code).then(
      () => {
        setCopied(true)
        window.setTimeout(() => setCopied(false), 1400)
      },
      () => {},
    )
  }, [code])

  const sel = zones[selected]

  return (
    <div
      ref={overlayRef}
      className={styles.overlay}
      onPointerMove={onPointerMove}
      role="application"
      aria-label="Debug-Zonen-Editor"
    >
      {AREA_ORDER.map((id) => {
        const z = zones[id]
        return (
          <div
            key={id}
            className={styles.zone}
            data-selected={selected === id}
            style={{ left: `${z.x}%`, top: `${z.y}%`, width: `${z.r * 2}%` }}
            onPointerDown={(e) => startDrag(id, e)}
            onPointerUp={endDrag}
            onWheel={(e) => setRadius(id, z.r + (e.deltaY < 0 ? 0.5 : -0.5))}
            title={`${getArea(id).label}: ziehen zum Verschieben, Mausrad = Radius`}
          >
            {getArea(id).label}
          </div>
        )
      })}

      <div className={styles.hud} onPointerDown={(e) => e.stopPropagation()}>
        <div className={styles.hudHead}>
          <span className={styles.hudTitle}>Zonen-Editor</span>
          <button type="button" className={styles.hudClose} onClick={onClose}>
            <X size={13} strokeWidth={2} aria-hidden /> schließen (D)
          </button>
        </div>
        <div className={styles.hudRow}>
          Maus: <b>x {round1(mouse.x)}</b> · <b>y {round1(mouse.y)}</b>
        </div>
        <div className={styles.hudRow}>
          Ausgewählt: <b>{getArea(selected).label}</b> (Kreis ziehen = verschieben, Mausrad = Radius)
        </div>
        <div className={styles.radius}>
          <span>r</span>
          <input
            type="range"
            min={2}
            max={30}
            step={0.5}
            value={sel.r}
            onChange={(e) => setRadius(selected, Number(e.target.value))}
          />
          <b>{round1(sel.r)}</b>
        </div>
        <pre className={styles.code}>{code}</pre>
        <button type="button" className={styles.copyBtn} onClick={copy}>
          {copied ? <Check size={13} strokeWidth={2.4} aria-hidden /> : <Copy size={13} strokeWidth={2} aria-hidden />}
          {copied ? 'Kopiert' : 'ZONES kopieren'}
        </button>
      </div>
    </div>
  )
}
