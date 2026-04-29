// Cinema-grade easings. Niemals bouncy.

export const cssEase = {
  premium:   'cubic-bezier(0.22, 0.61, 0.36, 1)',
  cinematic: 'cubic-bezier(0.16, 1, 0.3, 1)',
  gentle:    'cubic-bezier(0.4, 0, 0.2, 1)',
} as const

export const gsapEase = {
  cinematic: 'expo.out',
  premium:   'power3.out',
  gentle:    'power2.out',
  pulse:     'sine.inOut',
} as const

export const duration = {
  micro:  0.18,
  short:  0.36,
  medium: 0.6,
  long:   1.2,
  ambient: 2.4,
} as const

/** Framer-Motion-kompatibler Bezier. */
export const fmEase = [0.22, 0.61, 0.36, 1.0] as const
