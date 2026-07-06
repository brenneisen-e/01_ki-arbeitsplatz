import { Suspense } from 'react'
import { Canvas } from '@react-three/fiber'
import { Consultant3D } from './Consultant3D'

// ─────────────────────────────────────────────────────────────────────────────
// ConsultantCanvas — die react-three-fiber-Bühne für den 3D-Avatar. Bewusst als
// eigenes Modul (lazy geladen), damit three.js/@react-three nur bei vorhandenem
// GLB-Modell ins Bundle gezogen wird. Transparenter Hintergrund, damit der Avatar
// frei in der Dock-Fläche steht. Beleuchtung ohne HDRI/Environment (kein CDN).
// ─────────────────────────────────────────────────────────────────────────────

export function ConsultantCanvas({
  speaking,
  reducedMotion,
}: {
  speaking: boolean
  reducedMotion: boolean
}): React.ReactElement {
  return (
    <Canvas
      camera={{ position: [0, 0.15, 4], fov: 28 }}
      dpr={[1, 2]}
      gl={{ alpha: true, antialias: true, preserveDrawingBuffer: false }}
      style={{ background: 'transparent' }}
    >
      <ambientLight intensity={0.95} />
      <directionalLight position={[3, 5, 3]} intensity={1.1} />
      <directionalLight position={[-4, 2, -2]} intensity={0.35} />
      <Suspense fallback={null}>
        <Consultant3D speaking={speaking} reducedMotion={reducedMotion} />
      </Suspense>
    </Canvas>
  )
}
