import type { ThemeMode } from '../../../types'

interface SkyProps { theme: ThemeMode }

/**
 * Prozeduraler Himmel-Background. Tag/Nacht-Variante. Wird als
 * SceneLayer-Fallback verwendet, falls kein WebP-Asset hinterlegt ist.
 */
export function Sky({ theme }: SkyProps) {
  const isNight = theme === 'night'
  return (
    <svg viewBox="0 0 1600 1000" preserveAspectRatio="xMidYMid slice" className="w-full h-full">
      <defs>
        <linearGradient id="sky-grad" x1="0" x2="0" y1="0" y2="1">
          {isNight ? (
            <>
              <stop offset="0%"  stopColor="#050b1a" />
              <stop offset="55%" stopColor="#0a1628" />
              <stop offset="100%" stopColor="#162f4a" />
            </>
          ) : (
            <>
              <stop offset="0%"  stopColor="#bfd9f0" />
              <stop offset="55%" stopColor="#dceaf3" />
              <stop offset="100%" stopColor="#eaf0ed" />
            </>
          )}
        </linearGradient>
      </defs>
      <rect width="1600" height="1000" fill="url(#sky-grad)" />

      {isNight ? (
        <>
          {/* Mond */}
          <circle cx="1380" cy="160" r="58" fill="#fde68a" opacity="0.18" />
          <circle cx="1380" cy="160" r="42" fill="#fde68a" opacity="0.85" />
          {/* Sterne */}
          <g fill="#f3f6fb">
            {[
              [120, 80, 1.4], [240, 60, 1.0], [380, 100, 1.4], [520, 50, 0.9],
              [690, 90, 1.5], [840, 65, 1.0], [990, 95, 1.3], [1140, 55, 0.9],
              [1290, 80, 1.2], [180, 200, 1.0], [340, 220, 1.4], [500, 180, 1.0],
              [780, 210, 1.3], [1080, 180, 1.0], [1240, 220, 1.4], [60, 320, 1.1],
              [1500, 280, 1.0], [430, 360, 0.9], [1340, 360, 1.0],
            ].map(([cx, cy, r], i) => (
              <circle key={i} cx={cx} cy={cy} r={r} opacity={0.55 + (i % 3) * 0.15} />
            ))}
          </g>
        </>
      ) : (
        <>
          {/* Sonne */}
          <circle cx="1340" cy="180" r="56" fill="#ffe7a1" opacity="0.3" />
          <circle cx="1340" cy="180" r="38" fill="#ffce4f" />
        </>
      )}

      {/* Wolken (zwei Schichten, Parallax-Container weiter oben) */}
      <g opacity={isNight ? 0.55 : 0.85} style={{ transform: 'translate3d(calc(var(--parallax-x, 0) * 18px), 0, 0)' }}>
        <ellipse cx="320" cy="200" rx="86" ry="22" fill={isNight ? '#9bb6cf' : '#ffffff'} />
        <ellipse cx="380" cy="186" rx="60" ry="20" fill={isNight ? '#9bb6cf' : '#ffffff'} />
      </g>
      <g opacity={isNight ? 0.45 : 0.75} style={{ transform: 'translate3d(calc(var(--parallax-x, 0) * 30px), 0, 0)' }}>
        <ellipse cx="1100" cy="280" rx="100" ry="24" fill={isNight ? '#8fa9c4' : '#ffffff'} />
        <ellipse cx="1180" cy="266" rx="68" ry="22" fill={isNight ? '#8fa9c4' : '#ffffff'} />
      </g>
    </svg>
  )
}
