// Premium-Tokens für „Bank der Zukunft 2035".
// C-Level Pitch-Tool — gedeckte Cinema-Palette, ein Akzent (cyan).
// Alles spiegelt sich in `src/index.css` als CSS Custom Properties.

export const tokens = {
  color: {
    bg: {
      stage:        '#070d1a',
      stageGlow:    '#0a1628',
      panel:        'rgba(15, 28, 50, 0.6)',
      panelStrong:  'rgba(15, 28, 50, 0.85)',
    },
    ink: {
      primary:   'rgba(235, 240, 250, 0.95)',
      secondary: 'rgba(180, 195, 215, 0.7)',
      tertiary:  'rgba(140, 155, 175, 0.45)',
      mono:      'rgba(180, 220, 255, 0.65)',
    },
    accent: {
      cyan:  '#7ec8ff',
      amber: '#f5b86e',
      green: '#7ad5a0',
    },
    line: {
      hairline: 'rgba(255,255,255,0.06)',
      hover:    'rgba(255,255,255,0.18)',
      strong:   'rgba(255,255,255,0.32)',
    },
  },
  type: {
    display: '"Inter Display", "Inter", system-ui, sans-serif',
    body:    '"Inter", system-ui, sans-serif',
    mono:    '"IBM Plex Mono", "JetBrains Mono", monospace',
  },
  blur: {
    glass: 'blur(40px) saturate(180%)',
    deep:  'blur(60px) saturate(200%)',
  },
} as const

export type ThemeMode = 'day' | 'night'
