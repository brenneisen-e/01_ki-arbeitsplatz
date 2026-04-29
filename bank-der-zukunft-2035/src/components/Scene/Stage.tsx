import { Canvas, useFrame, useLoader } from '@react-three/fiber'
import { EffectComposer, Bloom, Vignette, ChromaticAberration, Noise } from '@react-three/postprocessing'
import { useRef, Suspense, useEffect, useState } from 'react'
import { TextureLoader, Vector2, type Mesh } from 'three'
import { useScene } from '../../hooks/useScene'
import { assetExists } from './AssetExists'
import { ParticleField } from './ParticleField'

export type StageMeshRef = Mesh

/**
 * R3F-Bühne. Drei Layer-Ebenen mit unterschiedlicher Z-Tiefe für
 * echtes Parallax-Tiefengefühl. Mausposition driftet die Kamera leicht.
 *
 * Hero-Image kommt aus /public/assets/scene/hero-cross-section-{theme}.webp.
 * Wenn nicht vorhanden, läuft die Bühne mit einem dunklen Cyan-Verlauf —
 * keine prozeduralen Cartoon-Geometrien.
 */
export function Stage() {
  const theme = useScene((s) => s.theme)
  const reduced = usePrefersReducedMotion()

  return (
    <Canvas
      orthographic={false}
      camera={{ position: [0, 0, 5], fov: 32 }}
      dpr={[1, 2]}
      gl={{ antialias: true, alpha: true }}
      style={{ position: 'absolute', inset: 0 }}
    >
      <ambientLight intensity={0.55} />
      <directionalLight position={[2, 4, 5]} intensity={0.35} />

      <Suspense fallback={<FallbackGradient />}>
        <HeroPlane theme={theme} />
        {!reduced && <ParticleField />}
      </Suspense>

      <ParallaxRig disabled={reduced} />

      <EffectComposer>
        <Bloom intensity={0.4} luminanceThreshold={0.7} luminanceSmoothing={0.9} mipmapBlur />
        <Vignette eskil={false} offset={0.15} darkness={0.85} />
        <ChromaticAberration offset={new Vector2(0.0008, 0.0008)} radialModulation={false} modulationOffset={0} />
        <Noise opacity={0.025} premultiply />
      </EffectComposer>
    </Canvas>
  )
}

function HeroPlane({ theme }: { theme: 'day' | 'night' }) {
  const src = `/assets/scene/hero-cross-section-${theme}.webp`
  const [hasFile, setHasFile] = useState<boolean | null>(null)
  useEffect(() => {
    let cancelled = false
    assetExists(src).then((ok) => { if (!cancelled) setHasFile(ok) })
    return () => { cancelled = true }
  }, [src])

  if (hasFile === null) return null
  if (!hasFile) return <FallbackGradient />
  return <HeroPlaneTextured src={src} />
}

function HeroPlaneTextured({ src }: { src: string }) {
  const tex = useLoader(TextureLoader, src)
  // Bildverhältnis aus Textur ableiten (typisch 16:9 bei 4K)
  const aspect = (tex.image?.width ?? 16) / (tex.image?.height ?? 9)
  const height = 3.4
  const width = height * aspect
  return (
    <mesh position={[0, 0, 0]}>
      <planeGeometry args={[width, height, 1, 1]} />
      <meshBasicMaterial map={tex} transparent />
    </mesh>
  )
}

function FallbackGradient() {
  // Sehr dunkler Cyan-Verlauf — KEIN prozedurales Bankgebäude.
  return (
    <mesh position={[0, 0, 0]}>
      <planeGeometry args={[6, 3.4, 1, 1]} />
      <meshBasicMaterial color="#0a1628" transparent opacity={0.0} />
    </mesh>
  )
}

function ParallaxRig({ disabled }: { disabled: boolean }) {
  const target = useRef({ x: 0, y: 0 })
  useEffect(() => {
    if (disabled) return
    const onMove = (e: MouseEvent) => {
      target.current.x = (e.clientX / window.innerWidth  - 0.5) * 0.18
      target.current.y = -(e.clientY / window.innerHeight - 0.5) * 0.12
    }
    window.addEventListener('mousemove', onMove)
    return () => window.removeEventListener('mousemove', onMove)
  }, [disabled])
  useFrame((state) => {
    if (disabled) return
    state.camera.position.x += (target.current.x - state.camera.position.x) * 0.05
    state.camera.position.y += (target.current.y - state.camera.position.y) * 0.05
    state.camera.lookAt(0, 0, 0)
  })
  return null
}

function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false)
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    setReduced(mq.matches)
    const onChange = () => setReduced(mq.matches)
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [])
  return reduced
}

