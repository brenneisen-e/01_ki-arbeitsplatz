import { useEffect, useState, type ReactNode } from 'react'

interface SceneLayerProps {
  /** Slot-Name (entspricht /public/assets/scene/<slot>-... Dateinamen). */
  slot: string
  /** Optional konkreter Pfad relativ zur Site-Root. Wenn die Datei fehlt,
      wird auf das `fallback` zurückgefallen. */
  src?: string
  /** Prozedurales SVG (oder beliebiges JSX) als Fallback / Default-Inhalt. */
  fallback: ReactNode
  className?: string
  alt?: string
}

/**
 * Slot-Wrapper für Szenen-Layer. Lädt ein PNG/WebP wenn vorhanden, sonst
 * rendert das übergebene `fallback` (typischerweise ein prozedurales SVG).
 *
 * Beispiel:
 *   <SceneLayer
 *     slot="background-sky"
 *     src="/assets/scene/sky-night-4k.webp"
 *     fallback={<ProceduralSky theme="night" />}
 *   />
 */
export function SceneLayer({ slot, src, fallback, className, alt }: SceneLayerProps) {
  const [available, setAvailable] = useState<boolean | null>(src ? null : false)

  useEffect(() => {
    if (!src) return
    let cancelled = false
    fetch(src, { method: 'HEAD' })
      .then((r) => { if (!cancelled) setAvailable(r.ok) })
      .catch(() => { if (!cancelled) setAvailable(false) })
    return () => { cancelled = true }
  }, [src])

  if (available === null) return null  // initial: nichts rendern, nicht flackern

  if (available && src) {
    return (
      <img
        src={src}
        alt={alt ?? slot}
        className={className}
        data-slot={slot}
        decoding="async"
        loading="eager"
      />
    )
  }
  return <div data-slot={slot} className={className}>{fallback}</div>
}
