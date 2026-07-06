import { useEffect, useMemo, useRef } from 'react'
import { Bounds, Center, useAnimations, useGLTF } from '@react-three/drei'
import { LoopOnce, LoopRepeat, type AnimationAction, type Group } from 'three'
import { CONSULTANT_CLIPS, CONSULTANT_FIT_MARGIN, CONSULTANT_MODEL_URL } from './consultantConfig'

// ─────────────────────────────────────────────────────────────────────────────
// Consultant3D — rendert das geriggte GLB-Modell in der react-three-fiber-Szene.
// Lädt das Modell, mappt die Meshy-Animations-Clips auf idle / greeting / talking
// und wechselt je nach `speaking`-Zustand. Wird ausschließlich lazy geladen, damit
// three.js NICHT im Haupt-Bundle landet.
// ─────────────────────────────────────────────────────────────────────────────

/** Findet den ersten passenden Clip-Namen aus einer Prioritätsliste. */
function pickClip(available: string[], candidates: readonly string[]): string | undefined {
  const lower = available.map((n) => n.toLowerCase())
  for (const cand of candidates) {
    const idx = lower.indexOf(cand.toLowerCase())
    if (idx !== -1) return available[idx]
  }
  // Teilstring-Treffer (z. B. "Armature|Idle_01")
  for (const cand of candidates) {
    const idx = lower.findIndex((n) => n.includes(cand.toLowerCase()))
    if (idx !== -1) return available[idx]
  }
  return undefined
}

export function Consultant3D({ speaking, reducedMotion }: { speaking: boolean; reducedMotion: boolean }) {
  const group = useRef<Group>(null)
  const { scene, animations } = useGLTF(CONSULTANT_MODEL_URL)
  const { actions, names } = useAnimations(animations, group)

  const clips = useMemo(() => {
    const idle = pickClip(names, CONSULTANT_CLIPS.idle) ?? names[0]
    const greeting = pickClip(names, CONSULTANT_CLIPS.greeting) ?? idle
    const talking = pickClip(names, CONSULTANT_CLIPS.talking) ?? idle
    return { idle, greeting, talking }
  }, [names])

  // Begrüßung einmal beim Erscheinen, danach dauerhaft idle. Bei reduzierter
  // Bewegung: keine Animation, statische Pose.
  useEffect(() => {
    if (reducedMotion || !clips.idle) return
    const idleAction = clips.idle ? actions[clips.idle] : null
    const greetAction = clips.greeting ? actions[clips.greeting] : null

    const startIdle = () => {
      if (!idleAction) return
      idleAction.reset().setLoop(LoopRepeat, Infinity).fadeIn(0.3).play()
    }

    if (greetAction && greetAction !== idleAction) {
      greetAction.reset().setLoop(LoopOnce, 1).fadeIn(0.2).play()
      greetAction.clampWhenFinished = true
      const mixer = greetAction.getMixer()
      const onFinished = (e: { action: AnimationAction }) => {
        if (e.action === greetAction) {
          greetAction.fadeOut(0.3)
          startIdle()
          mixer.removeEventListener('finished', onFinished as never)
        }
      }
      mixer.addEventListener('finished', onFinished as never)
      return () => mixer.removeEventListener('finished', onFinished as never)
    }
    startIdle()
    return undefined
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [actions, clips, reducedMotion])

  // Beim Sprechen (Sprechblase offen) die Gestik-Animation einblenden.
  useEffect(() => {
    if (reducedMotion) return
    const talk = clips.talking ? actions[clips.talking] : null
    const idle = clips.idle ? actions[clips.idle] : null
    if (!talk || talk === idle) return
    if (speaking) {
      talk.reset().setLoop(LoopRepeat, Infinity).fadeIn(0.25).play()
      return () => {
        talk.fadeOut(0.4)
      }
    }
    return undefined
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [speaking, actions, clips, reducedMotion])

  return (
    <Bounds fit clip observe margin={CONSULTANT_FIT_MARGIN}>
      <Center>
        <group ref={group}>
          <primitive object={scene} />
        </group>
      </Center>
    </Bounds>
  )
}

useGLTF.preload(CONSULTANT_MODEL_URL)
