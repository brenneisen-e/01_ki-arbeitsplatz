import { useEffect, useState, type ReactNode } from 'react'
import { assetExists } from './AssetExists'

interface SceneLayerProps {
  slot: string
  src?: string
  fallback: ReactNode
  className?: string
  alt?: string
}

/**
 * Asset-Slot-Wrapper. Lädt ein Bild aus `/public/assets/scene/...`
 * wenn vorhanden, sonst den prozeduralen `fallback`.
 */
export function SceneLayer({ slot, src, fallback, className, alt }: SceneLayerProps) {
  const [available, setAvailable] = useState<boolean | null>(src ? null : false)

  useEffect(() => {
    if (!src) return
    let cancelled = false
    assetExists(src).then((ok) => { if (!cancelled) setAvailable(ok) })
    return () => { cancelled = true }
  }, [src])

  if (available === null) return null
  if (available && src) {
    return (
      <img
        src={src}
        alt={alt ?? slot}
        className={className}
        data-slot={slot}
        decoding="async"
      />
    )
  }
  return <div data-slot={slot} className={className}>{fallback}</div>
}
