/// <reference types="vite/client" />
declare module '*.css'

import type { ThreeElements } from '@react-three/fiber'

declare module 'react' {
  // R3F 8.x augmentiert global JSX, was unter React 19 nicht greift.
  // Wir mappen die ThreeElements in den React-19-JSX-Namespace.
  namespace JSX {
    interface IntrinsicElements extends ThreeElements {}
  }
}
