import { useEffect, useRef, useState, type ReactNode } from 'react'
import gsap from 'gsap'
import { useScene, type SceneView } from '../../hooks/useScene'

interface HeroProps {
  /** Overlay (z. B. Hotspots) — bekommt die Maße der gerenderten
      Bildbox, sodass normalisierte Koordinaten exakt sitzen. */
  overlay?: (bounds: { width: number; height: number }, view: SceneView) => ReactNode
}

const VIEW_TO_BASE: Record<SceneView, string> = {
  'hero':            'assets/scene/hero-cross-section-night',
  'detail-top':      'assets/scene/floor-top-detail',
  'detail-ground':   'assets/scene/floor-ground-detail',
  'detail-basement': 'assets/scene/floor-basement-detail',
  'plaza':           'assets/scene/outdoor-plaza',
}

/** Liefert .webp-Pfad zuerst, .png als Fallback. */
function srcForView(v: SceneView): { primary: string; fallback: string } {
  const base = VIEW_TO_BASE[v]
  return { primary: `${base}.webp`, fallback: `${base}.png` }
}

export function Hero({ overlay }: HeroProps) {
  const view = useScene((s) => s.view)
  const containerRef = useRef<HTMLDivElement | null>(null)
  const aRef = useRef<HTMLImageElement | null>(null)
  const bRef = useRef<HTMLImageElement | null>(null)
  // Welche der zwei Image-Layer ist gerade „vorne"?
  const [front, setFront] = useState<'a' | 'b'>('a')
  const [aSrc, setASrc] = useState<string>(srcForView('hero').primary)
  const [bSrc, setBSrc] = useState<string>('')
  const [bounds, setBounds] = useState<{ width: number; height: number } | null>(null)
  const lastViewRef = useRef<SceneView>('hero')

  // Cross-Fade beim View-Wechsel
  useEffect(() => {
    if (view === lastViewRef.current) return
    lastViewRef.current = view
    const back = front === 'a' ? 'b' : 'a'
    const backSetter = back === 'a' ? setASrc : setBSrc
    const backEl = back === 'a' ? aRef.current : bRef.current
    const frontEl = front === 'a' ? aRef.current : bRef.current
    if (!backEl || !frontEl) return

    backSetter(srcForView(view).primary)

    // Warten, bis das Back-Image geladen ist, dann Cross-Fade
    const onReady = () => {
      gsap.killTweensOf([backEl, frontEl])
      gsap.set(backEl, { opacity: 0 })
      gsap.to(backEl,  { opacity: 1, duration: 0.6, ease: 'expo.out' })
      gsap.to(frontEl, { opacity: 0, duration: 0.6, ease: 'expo.out', onComplete: () => setFront(back) })
    }
    if (backEl.complete && backEl.naturalWidth > 0) onReady()
    else backEl.addEventListener('load', onReady, { once: true })
    return () => backEl.removeEventListener('load', onReady)
  }, [view, front])

  // ResizeObserver auf gerendertem Vorder-Bild
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
    const setSrc = layer === 'a' ? setASrc : setBSrc
    const cur = layer === 'a' ? aSrc : bSrc
    if (cur.endsWith('.webp')) setSrc(cur.replace(/\.webp$/, '.png'))
  }

  return (
    <div ref={containerRef} className="hero-stage relative w-full h-full flex items-center justify-center overflow-hidden">
      <ImgLayer  z={1} elRef={aRef} src={aSrc} initialFront={front === 'a'} onError={() => handleErr('a')} />
      <ImgLayer  z={2} elRef={bRef} src={bSrc} initialFront={front === 'b'} onError={() => handleErr('b')} />
      {overlay && bounds && (
        <div
          className="absolute pointer-events-none"
          style={{
            width: bounds.width,
            height: bounds.height,
            left: '50%', top: '50%',
            transform: 'translate(-50%, -50%)',
          }}
        >
          {overlay(bounds, view)}
        </div>
      )}
    </div>
  )
}

interface ImgLayerProps {
  z: number
  elRef: React.MutableRefObject<HTMLImageElement | null>
  src: string
  initialFront: boolean
  onError: () => void
}
function ImgLayer({ z, elRef, src, initialFront, onError }: ImgLayerProps) {
  if (!src) return null
  return (
    <img
      ref={elRef}
      src={src}
      onError={onError}
      alt=""
      draggable={false}
      className="hero-image absolute max-w-full max-h-full w-auto h-auto"
      style={{
        zIndex: z,
        objectFit: 'contain',
        opacity: initialFront ? 1 : 0,
        left: '50%', top: '50%',
        transform: 'translate(-50%, -50%)',
      }}
    />
  )
}
