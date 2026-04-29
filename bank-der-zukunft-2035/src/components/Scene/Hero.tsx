import { useEffect, useRef, useState, type ReactNode } from 'react'
import gsap from 'gsap'
import { useScene, type SceneView } from '../../hooks/useScene'
import { useReducedMotion } from '../../hooks/useReducedMotion'

interface HeroProps {
  overlay?: (bounds: { width: number; height: number }, view: SceneView) => ReactNode
}

const VIEW_TO_BASE: Record<SceneView, string> = {
  'hero':            'assets/scene/hero-cross-section-night',
  'detail-top':      'assets/scene/floor-top-detail',
  'detail-ground':   'assets/scene/floor-ground-detail',
  'detail-basement': 'assets/scene/floor-basement-detail',
  'plaza':           'assets/scene/outdoor-plaza',
}

const HERO_POSTER = `${VIEW_TO_BASE.hero}.png`
const HERO_VIDEO_MP4  = 'assets/scene/hero-loop.mp4'

function imgSrcFor(v: SceneView): string {
  return `${VIEW_TO_BASE[v]}.webp`
}

export function Hero({ overlay }: HeroProps) {
  const view = useScene((s) => s.view)
  const reduced = useReducedMotion()

  const heroLayerRef = useRef<HTMLDivElement | null>(null)
  const detailRef = useRef<HTMLImageElement | null>(null)
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const heroPosterRef = useRef<HTMLImageElement | null>(null)
  const [videoFailed, setVideoFailed] = useState(false)

  // Welcher Layer ist „vorne"?
  const [front, setFront] = useState<'hero' | 'detail'>('hero')
  const [detailSrc, setDetailSrc] = useState<string>(imgSrcFor('hero'))
  const [bounds, setBounds] = useState<{ width: number; height: number } | null>(null)
  const lastViewRef = useRef<SceneView>('hero')

  // Cross-Fade beim View-Wechsel
  useEffect(() => {
    if (view === lastViewRef.current) return
    console.log('[Hero] view change', lastViewRef.current, '→', view)
    lastViewRef.current = view
    const heroEl = heroLayerRef.current
    const detEl = detailRef.current
    if (!heroEl || !detEl) return

    if (view === 'hero') {
      gsap.killTweensOf([heroEl, detEl])
      gsap.to(heroEl, { opacity: 1, duration: 0.6, ease: 'expo.out' })
      gsap.to(detEl,  { opacity: 0, duration: 0.6, ease: 'expo.out', onComplete: () => setFront('hero') })
      // Video wieder starten
      videoRef.current?.play().catch(() => {})
    } else {
      // Detail-Bild für die neue View laden, dann fade
      const newSrc = imgSrcFor(view)
      setDetailSrc(newSrc)

      const onReady = () => {
        gsap.killTweensOf([heroEl, detEl])
        gsap.to(detEl,  { opacity: 1, duration: 0.6, ease: 'expo.out' })
        gsap.to(heroEl, { opacity: 0, duration: 0.6, ease: 'expo.out', onComplete: () => {
          setFront('detail')
          // Video pausieren, GPU schonen
          videoRef.current?.pause()
        } })
      }
      // Falls bereits geladen (preload-cache) → sofort
      if (detEl.complete && detEl.naturalWidth > 0 && detEl.src.includes(newSrc.split('/').pop()!.replace('.webp', ''))) {
        onReady()
      } else {
        detEl.addEventListener('load', onReady, { once: true })
        return () => detEl.removeEventListener('load', onReady)
      }
    }
  }, [view])

  // Bounds messen — vom aktuell sichtbaren Element (Video oder Bild)
  useEffect(() => {
    const targetEl: HTMLElement | null = front === 'hero'
      ? (videoRef.current ?? heroPosterRef.current)
      : detailRef.current
    if (!targetEl) return
    const measure = () => {
      const r = targetEl.getBoundingClientRect()
      if (r.width > 0 && r.height > 0) setBounds({ width: r.width, height: r.height })
    }
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(targetEl)
    window.addEventListener('resize', measure)
    return () => { ro.disconnect(); window.removeEventListener('resize', measure) }
  }, [front, videoFailed, reduced, detailSrc])

  function handleDetailErr() {
    if (detailSrc.endsWith('.webp')) {
      console.warn('[Hero] webp fehlt, fallback .png:', detailSrc)
      setDetailSrc(detailSrc.replace(/\.webp$/, '.png'))
    } else {
      console.error('[Hero] detail-Bild Fehler:', detailSrc)
    }
  }

  const useVideo = !reduced && !videoFailed
  const sharedStyle = {
    objectFit: 'contain' as const, left: '50%', top: '50%',
    transform: 'translate(-50%, -50%)',
  }

  // Diagnostik: wenn Video aktiv ist, hänge ALLE relevanten Events dran
  useEffect(() => {
    if (!useVideo) {
      console.log('[Hero] kein Video gerendert — reduced:', reduced, 'failed:', videoFailed)
      return
    }
    const v = videoRef.current
    if (!v) { console.warn('[Hero] videoRef ist null'); return }
    console.log('[Hero] Video gemounted, initial state:', {
      currentSrc: v.currentSrc, networkState: v.networkState, readyState: v.readyState,
      paused: v.paused, muted: v.muted, autoplay: v.autoplay,
    })

    const log = (e: Event) => {
      const tgt = e.target as HTMLVideoElement
      console.log(`[Hero][video] ${e.type}`, {
        currentSrc: tgt.currentSrc, networkState: tgt.networkState, readyState: tgt.readyState,
        paused: tgt.paused, errorCode: tgt.error?.code, errorMsg: tgt.error?.message,
      })
    }
    const evts = ['loadstart','loadedmetadata','loadeddata','canplay','canplaythrough','play','playing','pause','waiting','stalled','suspend','abort','emptied','ended']
    evts.forEach((ev) => v.addEventListener(ev, log))

    // Manuell play() probieren — autoplay kann blockiert sein
    v.play()
      .then(() => console.log('[Hero] play() success'))
      .catch((err: unknown) => console.warn('[Hero] play() rejected:', err))

    // Source-URLs einmal explizit auflösen (HEAD)
    Array.from(v.querySelectorAll('source')).forEach((s) => {
      const url = (s as HTMLSourceElement).src
      fetch(url, { method: 'HEAD' })
        .then((r) => console.log(`[Hero] HEAD ${url}: ${r.status}`))
        .catch((err) => console.warn(`[Hero] HEAD ${url} failed:`, err))
    })

    return () => { evts.forEach((ev) => v.removeEventListener(ev, log)) }
  }, [useVideo, reduced, videoFailed])

  return (
    <div className="hero-stage relative w-full h-full flex items-center justify-center overflow-hidden">
      {/* Hero-Layer (Video + Poster) */}
      <div ref={heroLayerRef} className="absolute inset-0 flex items-center justify-center" style={{ zIndex: 1, opacity: front === 'hero' ? 1 : 0 }}>
        {useVideo ? (
          <video
            ref={videoRef}
            autoPlay
            loop
            muted
            playsInline
            preload="auto"
            poster={HERO_POSTER}
            aria-label="Animierter Querschnitt: Bank der Zukunft 2035"
            onError={(e) => {
              const v = e.currentTarget
              const codeMap: Record<number, string> = {
                1: 'MEDIA_ERR_ABORTED', 2: 'MEDIA_ERR_NETWORK',
                3: 'MEDIA_ERR_DECODE',  4: 'MEDIA_ERR_SRC_NOT_SUPPORTED',
              }
              console.warn('[Hero] video onError → fallback poster', {
                errorCode: v.error?.code,
                errorName: v.error ? codeMap[v.error.code] : 'no-error-object',
                errorMessage: v.error?.message,
                currentSrc: v.currentSrc,
                networkState: v.networkState, readyState: v.readyState,
              })
              setVideoFailed(true)
            }}
            className="hero-image absolute max-w-full max-h-full w-auto h-auto"
            style={sharedStyle}
          >
            {/* WebM-Source nur, wenn die Datei wirklich existiert.
                Cloudflare Pages liefert für fehlende Files das SPA-
                Fallback-HTML mit Status 200 — der Browser hält das
                für ein kaputtes WebM und feuert MEDIA_ERR. Solange
                wir keine echte hero-loop.webm haben: nur MP4. */}
            <source src={HERO_VIDEO_MP4}  type="video/mp4"  />
          </video>
        ) : (
          <img
            ref={heroPosterRef}
            src={HERO_POSTER}
            alt=""
            draggable={false}
            className="hero-image absolute max-w-full max-h-full w-auto h-auto"
            style={sharedStyle}
          />
        )}
      </div>

      {/* Detail-Layer (immer Bild) */}
      <img
        ref={detailRef}
        src={detailSrc}
        onError={handleDetailErr}
        alt="" draggable={false}
        className="hero-image absolute max-w-full max-h-full w-auto h-auto"
        style={{ zIndex: 2, opacity: front === 'detail' ? 1 : 0, ...sharedStyle }}
      />

      {/* Hotspot-Overlay sitzt EXAKT auf dem gerenderten Vorder-Element */}
      {bounds && (
        <div
          className="absolute"
          style={{ width: bounds.width, height: bounds.height, left: '50%', top: '50%', transform: 'translate(-50%, -50%)', zIndex: 3, pointerEvents: 'none' }}
        >
          {/* Veo-Watermark-Blocker — nur sichtbar während der Hero-View
              läuft (das Watermark ist im Video, nicht in den Detail-Bildern). */}
          {view === 'hero' && useVideo && (
            <div
              aria-hidden
              style={{
                position: 'absolute',
                right: 0, bottom: 0,
                width: 140, height: 48,
                background: '#000',
                borderTopLeftRadius: 6,
              }}
            />
          )}
          {overlay && overlay(bounds, view)}
        </div>
      )}
    </div>
  )
}
