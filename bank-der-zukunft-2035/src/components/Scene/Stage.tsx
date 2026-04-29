import { Canvas, useFrame } from '@react-three/fiber'
import { EffectComposer, Bloom, Vignette, ChromaticAberration, Noise } from '@react-three/postprocessing'
import { useEffect, useRef, useState } from 'react'
import { TextureLoader, Vector2, type Texture } from 'three'
import { useScene } from '../../hooks/useScene'
import { ParticleField } from './ParticleField'


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

      <HeroPlane theme={theme} />
      {!reduced && <ParticleField />}

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
  const [tex, setTex] = useState<Texture | null>(null)
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    let cancelled = false
    setTex(null); setFailed(false)
    const loader = new TextureLoader()
    loader.load(
      src,
      (texture) => {
        // Defensiv: Cloudflare-SPA-Fallback liefert HTML statt Bild
        // → image hat keine echten Pixel-Dimensionen
        if (cancelled) return
        if (!texture.image || !(texture.image instanceof HTMLImageElement) || texture.image.naturalWidth === 0) {
          setFailed(true); return
        }
        setTex(texture)
      },
      undefined,
      () => { if (!cancelled) setFailed(true) },
    )
    return () => { cancelled = true; setTex(null) }
  }, [src])

  if (failed || !tex) return null
  const img = tex.image as HTMLImageElement
  const aspect = (img.naturalWidth || 16) / (img.naturalHeight || 9)
  const height = 3.4
  const width = height * aspect
  return (
    <mesh position={[0, 0, 0]}>
      <planeGeometry args={[width, height, 1, 1]} />
      <meshBasicMaterial map={tex} transparent />
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

