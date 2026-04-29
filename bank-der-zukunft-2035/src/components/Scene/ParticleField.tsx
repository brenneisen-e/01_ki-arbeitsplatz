import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { BufferAttribute, type Points } from 'three'

/**
 * 100 sehr kleine Partikel um die KI-Sphäre-Position. Sanfte Brownian
 * Motion über useFrame. Wird automatisch deaktiviert bei reduced motion.
 */
export function ParticleField({ count = 100 }: { count?: number }) {
  const ref = useRef<Points>(null)

  const { positions, velocities } = useMemo(() => {
    const positions = new Float32Array(count * 3)
    const velocities = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      // Cluster oberhalb der Vorstandsetage (y ≈ +0.6 in Welt-Koordinaten)
      const r = Math.random() * 0.55
      const theta = Math.random() * Math.PI * 2
      positions[i * 3 + 0] = Math.cos(theta) * r * 0.7
      positions[i * 3 + 1] = 0.55 + Math.sin(theta) * r * 0.35
      positions[i * 3 + 2] = (Math.random() - 0.5) * 0.4
      velocities[i * 3 + 0] = (Math.random() - 0.5) * 0.0006
      velocities[i * 3 + 1] = (Math.random() - 0.5) * 0.0004
      velocities[i * 3 + 2] = (Math.random() - 0.5) * 0.0006
    }
    return { positions, velocities }
  }, [count])

  useFrame(() => {
    const pts = ref.current
    if (!pts) return
    const attr = pts.geometry.attributes.position as BufferAttribute
    const arr = attr.array as Float32Array
    for (let i = 0; i < count; i++) {
      const ix = i * 3
      arr[ix + 0] += velocities[ix + 0]
      arr[ix + 1] += velocities[ix + 1]
      arr[ix + 2] += velocities[ix + 2]
      // sanftes Zurückziehen Richtung Cluster-Zentrum
      arr[ix + 0] *= 0.998
      arr[ix + 1] = arr[ix + 1] * 0.998 + 0.001
      arr[ix + 2] *= 0.998
    }
    attr.needsUpdate = true
  })

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          array={positions}
          count={count}
          itemSize={3}
          args={[positions, 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.018}
        color="#7ec8ff"
        transparent
        opacity={0.7}
        sizeAttenuation
      />
    </points>
  )
}
