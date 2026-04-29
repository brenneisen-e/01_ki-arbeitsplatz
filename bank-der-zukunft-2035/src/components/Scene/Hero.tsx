import { useEffect, useRef, useState, type ReactNode } from 'react'
import gsap from 'gsap'
import { useScene, type SceneView } from '../../hooks/useScene'

interface HeroProps {
  overlay?: (bounds: { width: number; height: number }, view: SceneView) => ReactNode
}

const VIEW_TO_BASE: Record<SceneView, string> = {
  'hero':            'assets/scene/hero-cross-section-night',
  'detail-top':      'assets/scene/floor-top-detail',
  'detail-ground':   'assets/scene/floor-ground-detail',
  'detail-basement': 'assets/scene/floor-basement-detail',
  'plaza':           'assets/scene/outdoor-plaza',
  'horizons':        'assets/scene/hero-cross-section-night', // unused, HorizonsView ersetzt das Bild
}

function imgSrcFor(v: SceneView): string {
  return `${VIEW_TO_BASE[v]}.png`
}

/**
 * Zwei-Layer Cross-Fade zwischen statischen Bildern.
 * Vorder-Layer hält das Hero-Querschnittsbild, Rück-Layer holt das
 * jeweilige Detail-/Plaza-Bild beim View-Wechsel und blendet darüber.
 */
export function Hero({ overlay }: HeroProps) {
  const view = useScene((s) => s.view)
  const heroRef = useRef<HTMLImageElement | null>(null)
  const detailRef = useRef<HTMLImageElement | null>(null)
  const [front, setFront] = useState<'hero' | 'detail'>('hero')
  const [detailSrc, setDetailSrc] = useState<string>(imgSrcFor('hero'))
  const [bounds, setBounds] = useState<{ width: number; height: number } | null>(null)
  const lastViewRef = useRef<SceneView>('hero')

  // Cross-Fade beim View-Wechsel
  useEffect(() => {
    if (view === lastViewRef.current) return
    console.log('[Hero] view change', lastViewRef.current, '→', view)
    lastViewRef.current = view
    const heroEl = heroRef.current
    const detEl = detailRef.current
    if (!heroEl || !detEl) return

    if (view === 'hero') {
      gsap.killTweensOf([heroEl, detEl])
      gsap.to(heroEl, { opacity: 1, duration: 0.6, ease: 'expo.out' })
      gsap.to(detEl,  { opacity: 0, duration: 0.6, ease: 'expo.out', onComplete: () => setFront('hero') })
    } else {
      const newSrc = imgSrcFor(view)
      setDetailSrc(newSrc)
      const onReady = () => {
        gsap.killTweensOf([heroEl, detEl])
        gsap.to(detEl,  { opacity: 1, duration: 0.6, ease: 'expo.out' })
        gsap.to(heroEl, { opacity: 0, duration: 0.6, ease: 'expo.out', onComplete: () => setFront('detail') })
      }
      if (detEl.complete && detEl.naturalWidth > 0 && detEl.src.includes(newSrc.split('/').pop()!.replace('.png', ''))) {
        onReady()
      } else {
        detEl.addEventListener('load', onReady, { once: true })
        return () => detEl.removeEventListener('load', onReady)
      }
    }
  }, [view])

  // Bounds vom aktuell sichtbaren Bild messen
  useEffect(() => {
    const el = front === 'hero' ? heroRef.current : detailRef.current
    if (!el) return
    const measure = () => {
      const r = el.getBoundingClientRect()
      if (r.width > 0 && r.height > 0) setBounds({ width: r.width, height: r.height })
    }
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(el)
    window.addEventListener('resize', measure)
    return () => { ro.disconnect(); window.removeEventListener('resize', measure) }
  }, [front, detailSrc])

  const sharedStyle = {
    objectFit: 'contain' as const,
    left: '50%', top: '50%',
    transform: 'translate(-50%, -50%)',
  }

  return (
    <div className="hero-stage relative w-full h-full flex items-center justify-center overflow-hidden">
      <img
        ref={heroRef}
        src={imgSrcFor('hero')}
        alt="Bank der Zukunft 2035 — Querschnitt"
        draggable={false}
        className="hero-image absolute max-w-full max-h-full w-auto h-auto"
        style={{ zIndex: 1, opacity: front === 'hero' ? 1 : 0, ...sharedStyle }}
      />
      <img
        ref={detailRef}
        src={detailSrc}
        alt=""
        draggable={false}
        className="hero-image absolute max-w-full max-h-full w-auto h-auto"
        style={{ zIndex: 2, opacity: front === 'detail' ? 1 : 0, ...sharedStyle }}
      />

      {bounds && overlay && (
        <div
          className="absolute pointer-events-none"
          style={{ width: bounds.width, height: bounds.height, left: '50%', top: '50%', transform: 'translate(-50%, -50%)', zIndex: 3 }}
        >
          {overlay(bounds, view)}
        </div>
      )}
    </div>
  )
}
