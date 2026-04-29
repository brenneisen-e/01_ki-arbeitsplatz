import { useEffect, useRef, useState, type ReactNode } from 'react'
import { useScene } from '../../hooks/useScene'

interface HeroProps {
  /** Inhalte, die exakt über dem gerenderten Bild platziert werden
      (z. B. Hotspots). Das Wrapper-Element bekommt dieselben Maße
      wie die tatsächliche `<img>`-Renderbox. */
  overlay?: (bounds: { width: number; height: number }) => ReactNode
}

/**
 * Hero-Bild voll sichtbar. `object-fit: contain` darf das Bild oben/unten
 * oder links/rechts mit Bühnen-Hintergrund letterboxen — niemals zoomen
 * oder croppen. Hotspot-Overlay misst das tatsächlich gerenderte Bild
 * via ResizeObserver, damit normalisierte Koordinaten exakt sitzen.
 */
export function Hero({ overlay }: HeroProps) {
  const theme = useScene((s) => s.theme)
  const imgRef = useRef<HTMLImageElement | null>(null)
  const [bounds, setBounds] = useState<{ width: number; height: number } | null>(null)
  const [src, setSrc] = useState<string>(`assets/scene/hero-cross-section-${theme}.webp`)
  const [failed, setFailed] = useState(false)

  // Versuche .webp zuerst, sonst .png
  useEffect(() => {
    setFailed(false)
    setSrc(`assets/scene/hero-cross-section-${theme}.webp`)
  }, [theme])

  function handleError() {
    if (src.endsWith('.webp')) {
      setSrc(`assets/scene/hero-cross-section-${theme}.png`)
    } else {
      setFailed(true)
    }
  }

  // ResizeObserver: misst das gerenderte Bild für Hotspot-Positionierung
  useEffect(() => {
    const el = imgRef.current
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
  }, [src])

  return (
    <div className="hero-stage relative w-full h-full flex items-center justify-center">
      {!failed && (
        <img
          ref={imgRef}
          src={src}
          onLoad={() => {
            const el = imgRef.current
            if (el) setBounds({ width: el.getBoundingClientRect().width, height: el.getBoundingClientRect().height })
          }}
          onError={handleError}
          alt="Bank der Zukunft 2035 — Querschnitt"
          className="hero-image block max-w-full max-h-full w-auto h-auto"
          draggable={false}
          style={{ objectFit: 'contain' }}
        />
      )}

      {/* Hotspot-Overlay liegt EXAKT über dem gerenderten Bild */}
      {overlay && bounds && (
        <div
          className="absolute pointer-events-none"
          style={{
            width: bounds.width,
            height: bounds.height,
            left: '50%',
            top: '50%',
            transform: 'translate(-50%, -50%)',
          }}
        >
          {overlay(bounds)}
        </div>
      )}
    </div>
  )
}
