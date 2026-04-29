import { useEffect, useRef } from 'react'

/**
 * Sanfter Parallax-Hook. Liefert eine Ref, die du an einen Container hängen
 * kannst. Bei Mausbewegung wird --parallax-x / --parallax-y als CSS-Variable
 * gesetzt (Werte zwischen -1 und 1). Inner-Layers konsumieren diese
 * Variablen via translate3d(...).
 */
export function useParallax<T extends HTMLElement>(strength: number = 1) {
  const ref = useRef<T | null>(null)
  useEffect(() => {
    if (typeof window === 'undefined') return
    const el = ref.current
    if (!el) return
    let raf = 0
    let nx = 0, ny = 0
    const onMove = (e: MouseEvent) => {
      const r = el.getBoundingClientRect()
      nx = ((e.clientX - r.left) / r.width  - 0.5) * 2 * strength
      ny = ((e.clientY - r.top)  / r.height - 0.5) * 2 * strength
      if (raf) return
      raf = requestAnimationFrame(() => {
        el.style.setProperty('--parallax-x', String(nx))
        el.style.setProperty('--parallax-y', String(ny))
        raf = 0
      })
    }
    window.addEventListener('mousemove', onMove)
    return () => { window.removeEventListener('mousemove', onMove); if (raf) cancelAnimationFrame(raf) }
  }, [strength])
  return ref
}
