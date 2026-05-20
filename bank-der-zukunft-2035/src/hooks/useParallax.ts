import { useEffect, useRef } from 'react'

/**
 * Subtiler 2.5D-Parallax. Schreibt --px / --py auf den übergebenen Knoten,
 * der dann via CSS-`translate3d` mehrere Layer mit unterschiedlicher
 * Intensität verschiebt.
 *
 * Keine React-Re-Renders -- alles via `requestAnimationFrame` + Style-Set.
 */
export function useParallax(
  targetRef: React.RefObject<HTMLElement | null>,
  options?: { enabled?: boolean; intensity?: number },
): void {
  const enabled = options?.enabled ?? true
  const intensity = options?.intensity ?? 1

  const rafRef = useRef<number | null>(null)
  const targetXY = useRef<{ x: number; y: number }>({ x: 0, y: 0 })
  const currentXY = useRef<{ x: number; y: number }>({ x: 0, y: 0 })

  useEffect(() => {
    if (!enabled) return
    const el = targetRef.current
    if (!el) return

    const onPointer = (e: PointerEvent) => {
      const rect = el.getBoundingClientRect()
      const nx = (e.clientX - rect.left) / rect.width - 0.5 // -0.5..0.5
      const ny = (e.clientY - rect.top) / rect.height - 0.5
      targetXY.current = { x: nx, y: ny }
      ensureRaf()
    }

    const onLeave = () => {
      targetXY.current = { x: 0, y: 0 }
      ensureRaf()
    }

    const ensureRaf = () => {
      if (rafRef.current !== null) return
      rafRef.current = requestAnimationFrame(tick)
    }

    const tick = () => {
      const t = targetXY.current
      const c = currentXY.current
      // Lerp für ruhiges Nachziehen
      const lerp = 0.12
      const nx = c.x + (t.x - c.x) * lerp
      const ny = c.y + (t.y - c.y) * lerp
      currentXY.current = { x: nx, y: ny }
      el.style.setProperty('--px', (nx * intensity).toFixed(4))
      el.style.setProperty('--py', (ny * intensity).toFixed(4))
      if (Math.abs(t.x - nx) > 0.0008 || Math.abs(t.y - ny) > 0.0008) {
        rafRef.current = requestAnimationFrame(tick)
      } else {
        el.style.setProperty('--px', t.x.toFixed(4))
        el.style.setProperty('--py', t.y.toFixed(4))
        rafRef.current = null
      }
    }

    window.addEventListener('pointermove', onPointer, { passive: true })
    window.addEventListener('pointerleave', onLeave, { passive: true })
    window.addEventListener('blur', onLeave)

    return () => {
      window.removeEventListener('pointermove', onPointer)
      window.removeEventListener('pointerleave', onLeave)
      window.removeEventListener('blur', onLeave)
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current)
        rafRef.current = null
      }
      el.style.removeProperty('--px')
      el.style.removeProperty('--py')
    }
  }, [enabled, intensity, targetRef])
}
