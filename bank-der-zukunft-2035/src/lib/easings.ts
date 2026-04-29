// Wiederverwendbare GSAP-/CSS-Easings für die Workshop-Choreografie.

export const gsapEase = {
  glide: 'power3.out',
  pop:   'back.out(1.7)',
  pulse: 'sine.inOut',
  data:  'power2.inOut',
} as const

export const cssEase = {
  glide: 'cubic-bezier(0.22, 0.61, 0.36, 1)',
  pop:   'cubic-bezier(0.34, 1.56, 0.64, 1)',
  spring: 'cubic-bezier(0.43, 0.13, 0.23, 0.96)',
} as const
