interface AIAvatarSphereProps {
  x: number
  y: number
  r?: number
}

/**
 * Schwebende KI-Avatar-Sphäre mit subtiler Rotation und pulsierendem Glow.
 * Wird in der Vorstandsetage eingesetzt.
 */
export function AIAvatarSphere({ x, y, r = 24 }: AIAvatarSphereProps) {
  return (
    <g transform={`translate(${x}, ${y})`}>
      {/* Outer Glow */}
      <circle cx="0" cy="0" r={r + 14} fill="var(--color-teal)" opacity="0.18">
        <animate attributeName="r" values={`${r + 12};${r + 22};${r + 12}`} dur="3.6s" repeatCount="indefinite" />
        <animate attributeName="opacity" values="0.1;0.32;0.1" dur="3.6s" repeatCount="indefinite" />
      </circle>
      {/* Sphere base */}
      <circle cx="0" cy="0" r={r} fill="url(#avatar-grad)" />
      {/* Defs */}
      <defs>
        <radialGradient id="avatar-grad" cx="0.4" cy="0.4" r="0.7">
          <stop offset="0%"  stopColor="#bee4ff" />
          <stop offset="55%" stopColor="#3ba4f5" />
          <stop offset="100%" stopColor="#1a73c5" />
        </radialGradient>
      </defs>
      {/* Rotating ring */}
      <g>
        <ellipse cx="0" cy="0" rx={r + 6} ry={r * 0.35} fill="none" stroke="#f3f6fb" strokeOpacity="0.55" strokeWidth="1.2" strokeDasharray="6 5" />
        <animateTransform attributeName="transform" type="rotate" from="0 0 0" to="360 0 0" dur="14s" repeatCount="indefinite" />
      </g>
      {/* Inner specular */}
      <ellipse cx={-r * 0.35} cy={-r * 0.45} rx={r * 0.35} ry={r * 0.18} fill="white" opacity="0.45" />
    </g>
  )
}
