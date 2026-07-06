import { Suspense, useEffect } from 'react'
import { Canvas, useThree } from '@react-three/fiber'
import { PMREMGenerator } from 'three'
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js'
import { Consultant3D } from './Consultant3D'

// ─────────────────────────────────────────────────────────────────────────────
// ConsultantCanvas — die react-three-fiber-Bühne für den 3D-Avatar. Bewusst als
// eigenes Modul (lazy geladen), damit three.js/@react-three nur bei vorhandenem
// GLB-Modell ins Bundle gezogen wird. Transparenter Hintergrund, damit der Avatar
// frei in der Dock-Fläche steht.
// ─────────────────────────────────────────────────────────────────────────────

// Prozedurale Studio-Umgebung als Image-Based-Lighting — OHNE externes HDRI/CDN.
// PBR-Materialien (Haut, Anzugstoff) brauchen eine Umgebung zum Reflektieren;
// ohne sie wirken sie flach und (bei metallischen Defaults) ausgewaschen. three's
// RoomEnvironment erzeugt diese Umgebung rein prozedural im Speicher.
function StudioEnvironment(): null {
  const gl = useThree((s) => s.gl)
  const scene = useThree((s) => s.scene)
  useEffect(() => {
    const pmrem = new PMREMGenerator(gl)
    const envRT = pmrem.fromScene(new RoomEnvironment(), 0.04)
    scene.environment = envRT.texture
    return () => {
      scene.environment = null
      envRT.texture.dispose()
      pmrem.dispose()
    }
  }, [gl, scene])
  return null
}

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
      <StudioEnvironment />
      <ambientLight intensity={0.55} />
      <directionalLight position={[3, 5, 3]} intensity={1.0} />
      <directionalLight position={[-4, 2, -2]} intensity={0.3} />
      <Suspense fallback={null}>
        <Consultant3D speaking={speaking} reducedMotion={reducedMotion} />
      </Suspense>
    </Canvas>
  )
}
