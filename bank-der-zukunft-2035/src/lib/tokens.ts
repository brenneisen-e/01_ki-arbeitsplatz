// Design-Tokens für „Bank der Zukunft 2035".
// Spiegelbildlich zu den CSS Custom Properties in `src/index.css`.

export const colors = {
  // Backgrounds
  ink:        '#0a1628',  // Marineblau (Nacht)
  ink2:       '#11243d',
  inkDay:     '#dde8f3',
  inkDay2:    '#cad8e8',

  // Building
  facade:     '#d4b896',  // warmes Sand-Beige
  facadeDark: '#a88a64',
  facadeAccent: '#7a5d3b',

  // Accents
  teal:       '#3ba4f5',  // KI / Daten
  tealDeep:   '#1a73c5',
  amber:      '#f5b03b',  // Highlights
  amberDeep:  '#d68a1c',

  // Status
  okGreen:    '#3eb87b',
  warnAmber:  '#f5b03b',

  // Text
  textHi:     '#f3f6fb',
  textMid:    '#aab8c9',
  textDim:    '#6b7c92',
} as const

export const easings = {
  glide: 'cubic-bezier(0.22, 0.61, 0.36, 1)',
  pop:   'cubic-bezier(0.34, 1.56, 0.64, 1)',
} as const

export const z = {
  scene:   10,
  hotspot: 20,
  panel:   40,
  header:  50,
  tooltip: 60,
} as const

export type ThemeMode = 'day' | 'night'
