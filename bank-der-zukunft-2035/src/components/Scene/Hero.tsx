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
}

const HERO_PRIMARY = `${VIEW_TO_BASE.hero}.webp`
const HERO_FALLBACK = `${VIEW_TO_BASE.hero}.png`

function srcForView(v: SceneView): string {
  return `${VIEW_TO_BASE[v]}.webp`
}

export function Hero({ overlay }: HeroProps) {
  const view = useScene((s) => s.view)
  const aRef = useRef<HTMLImageElement | null>(null)
  const bRef = useRef<HTMLImageElement | null>(null)
  // Beide Layer rendern IMMER (auch initial), damit die Refs verfügbar sind.
  // 'a' beginnt als Vorder-Layer mit dem Hero-Bild.
  const [aSrc, setASrc] = useState<string>(HERO_PRIMARY)
  const [bSrc, setBSrc] = useState<string>(HERO_PRIMARY)
  const [front, setFront] = useState<'a' | 'b'>('a')
  const [bounds, setBounds] = useState<{ width: number; height: number } | null>(null)
  const lastViewRef = useRef<SceneView>('hero')

  // Cross-Fade beim View-Wechsel
  useEffect(() => {
    if (view === lastViewRef.current) return
    console.log('[Hero] view change', lastViewRef.current, '→', view)
    lastViewRef.current = view
    const back = front === 'a' ? 'b' : 'a'
    const newSrc = srcForView(view)
    const backSetter = back === 'a' ? setASrc : setBSrc
    const backEl = back === 'a' ? aRef.current : bRef.current
    const frontEl = front === 'a' ? aRef.current : bRef.current
    if (!backEl || !frontEl) {
      console.warn('[Hero] missing layer ref, skip fade', { backEl, frontEl, front, back })
      return
    }
    backSetter(newSrc)

    const onReady = () => {
      console.log('[Hero] back layer ready, fading', { back, src: backEl.currentSrc || backEl.src })
      gsap.killTweensOf([backEl, frontEl])
      gsap.set(backEl, { opacity: 0 })
      gsap.to(backEl,  { opacity: 1, duration: 0.6, ease: 'expo.out' })
      gsap.to(frontEl, { opacity: 0, duration: 0.6, ease: 'expo.out', onComplete: () => setFront(back) })
    }
    if (backEl.complete && backEl.naturalWidth > 0 && (backEl.currentSrc || backEl.src).includes(newSrc.split('/').pop()!.replace('.webp', ''))) {
      // Bild war schon im Browser-Cache (Preload) → sofort fade
      onReady()
    } else {
      backEl.addEventListener('load', onReady, { once: true })
    }
    return () => backEl.removeEventListener('load', onReady)
  }, [view, front])

  // ResizeObserver auf das aktuell sichtbare (gerenderte) Bild
  useEffect(() => {
    const el = front === 'a' ? aRef.current : bRef.current
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
  }, [front, aSrc, bSrc])

  function handleErr(layer: 'a' | 'b') {
    const cur = layer === 'a' ? aSrc : bSrc
    const setSrc = layer === 'a' ? setASrc : setBSrc
    if (cur.endsWith('.webp')) {
      console.warn(`[Hero] webp missing, fallback .png:`, cur)
      setSrc(cur.replace(/\.webp$/, '.png'))
    } else {
      console.error(`[Hero] image failed:`, cur)
    }
  }

  return (
    <div className="hero-stage relative w-full h-full flex items-center justify-center overflow-hidden">
      <img
        ref={aRef}
        src={aSrc === HERO_PRIMARY ? HERO_PRIMARY : aSrc}
        onError={() => handleErr('a')}
        onLoad={() => { if (front === 'a' && aRef.current) {
          const r = aRef.current.getBoundingClientRect()
          if (r.width > 0 && r.height > 0) setBounds({ width: r.width, height: r.height })
        } }}
        alt="" draggable={false}
        className="hero-image absolute max-w-full max-h-full w-auto h-auto"
        style={{ zIndex: 1, objectFit: 'contain', opacity: front === 'a' ? 1 : 0, left: '50%', top: '50%', transform: 'translate(-50%, -50%)' }}
      />
      <img
        ref={bRef}
        src={bSrc}
        onError={() => handleErr('b')}
        alt="" draggable={false}
        className="hero-image absolute max-w-full max-h-full w-auto h-auto"
        style={{ zIndex: 2, objectFit: 'contain', opacity: front === 'b' ? 1 : 0, left: '50%', top: '50%', transform: 'translate(-50%, -50%)' }}
      />
      {overlay && bounds && (
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

// Hilf für TS-strict — HERO_FALLBACK wird in Pre-Resolve-Logik referenziert
void HERO_FALLBACK
