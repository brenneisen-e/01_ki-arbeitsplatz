import { useEffect, useState } from 'react'
import { assetExists } from './AssetExists'

interface Props { theme: 'day' | 'night' }

/**
 * Premium-Silhouetten-Fallback. Wird ANGEZEIGT, solange das Hero-Bild
 * unter /public/assets/scene/hero-cross-section-{theme}.webp fehlt.
 *
 * Pure SVG, abstrakte Architektur — keine Cartoon-Figuren, keine Bäume,
 * keine bunten Akzente. Dunkler Querschnitt in der Stage-Palette mit
 * Cyan-Fenster-Glow je Etage. Sobald die echte WebP da ist, schaltet
 * dieser Fallback sich aus (das R3F-Plane verdeckt ihn ohnehin).
 */
export function PlaceholderSilhouette({ theme }: Props) {
  const candidates = [
    `/assets/scene/hero-cross-section-${theme}.webp`,
    `/assets/scene/hero-cross-section-${theme}.png`,
  ]
  const [hasFile, setHasFile] = useState<boolean | null>(null)
  useEffect(() => {
    let cancelled = false
    Promise.all(candidates.map(assetExists)).then((results) => {
      if (!cancelled) setHasFile(results.some(Boolean))
    })
    return () => { cancelled = true }
  }, [theme])

  if (hasFile === true) return null  // echte Datei verdeckt den Fallback eh

  const facade = '#162236'
  const facade2 = '#0d1726'
  const window = 'rgba(126, 200, 255, 0.16)'
  const windowGlow = 'rgba(126, 200, 255, 0.55)'
  const hairline = 'rgba(255, 255, 255, 0.05)'

  return (
    <svg
      viewBox="0 0 1600 900"
      preserveAspectRatio="xMidYMid meet"
      className="absolute inset-0 w-full h-full pointer-events-none"
      aria-hidden
    >
      <defs>
        <linearGradient id="ph-roof" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor={facade2} />
          <stop offset="100%" stopColor={facade} />
        </linearGradient>
        <radialGradient id="ph-window-glow" cx="0.5" cy="0.5" r="0.6">
          <stop offset="0%"  stopColor={windowGlow} />
          <stop offset="100%" stopColor="transparent" />
        </radialGradient>
      </defs>

      {/* Bodenlinie */}
      <line x1="0" y1="780" x2="1600" y2="780" stroke={hairline} strokeWidth="1" />

      {/* Gebäude-Querschnitt — nur Architektur, keine Figuren */}
      {/* Fundament */}
      <rect x="380" y="730" width="840" height="50" fill={facade2} />
      {/* Etagen */}
      <Floor y={550} width={840} x={380} facade={facade}  hairline={hairline} window={window} />
      <Floor y={370} width={840} x={380} facade={facade}  hairline={hairline} window={window} />
      <Floor y={190} width={840} x={380} facade={facade2} hairline={hairline} window={window} />

      {/* Dach */}
      <polygon points="340,190 800,90 1260,190" fill="url(#ph-roof)" />
      <line x1="340" y1="190" x2="1260" y2="190" stroke={hairline} strokeWidth="1" />
      {/* Fahnenmast */}
      <line x1="800" y1="90" x2="800" y2="38" stroke={hairline} strokeWidth="1" />

      {/* Fenster-Glow je Etage (sehr subtil, korrespondiert mit Hotspot-Tiefen) */}
      <ellipse cx="800" cy="270" rx="200" ry="50" fill="url(#ph-window-glow)" opacity="0.55" />
      <ellipse cx="800" cy="450" rx="240" ry="46" fill="url(#ph-window-glow)" opacity="0.4" />
      <ellipse cx="800" cy="630" rx="220" ry="42" fill="url(#ph-window-glow)" opacity="0.45" />
    </svg>
  )
}

function Floor({ x, y, width, facade, hairline, window: w }: { x: number; y: number; width: number; facade: string; hairline: string; window: string }) {
  // Eine Etage: Bodenstreifen + 6 abstrakt geschnittene Fensterbänder
  return (
    <g>
      <rect x={x} y={y} width={width} height={180} fill={facade} />
      <rect x={x} y={y} width={width} height={2} fill={hairline} />
      {Array.from({ length: 6 }).map((_, i) => {
        const wx = x + 60 + i * ((width - 120) / 6)
        return (
          <rect
            key={i}
            x={wx}
            y={y + 38}
            width={(width - 120) / 6 - 28}
            height={104}
            fill={w}
            stroke={hairline}
            strokeWidth="0.6"
            rx="1"
          />
        )
      })}
    </g>
  )
}
