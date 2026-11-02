import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'
import { ExternalLink, Loader2, MonitorPlay, Play, X } from 'lucide-react'
import styles from './IframeStage.module.css'
import { useReducedMotion } from '../hooks/useReducedMotion'
import { useLang, type Lang } from '../i18n/LanguageContext'

type StageStrings = {
  openNewTab: string
  openVideo: string
  close: string
  loading: string
  placeholderText: React.ReactNode
}

const STR: Record<Lang, StageStrings> = {
  de: {
    openNewTab: 'Demo in neuem Tab öffnen',
    openVideo: 'Video öffnen',
    close: 'Demo schließen',
    loading: 'Demo wird geladen…',
    placeholderText: (
      <>
        Diese Demo ist noch nicht verdrahtet. Tragen Sie die URL im Handoff der
        Aktivität in <code>src/data/chapters.ts</code> ein, dann zeigt der Bildschirm
        sie hier in Vollbild.
      </>
    ),
  },
  en: {
    openNewTab: 'Open the demo in a new tab',
    openVideo: 'Open the video',
    close: 'Close the demo',
    loading: 'Loading the demo…',
    placeholderText: (
      <>
        This demo is not wired up yet. Add the URL in the activity hand-off in{' '}
        <code>src/data/chapters.ts</code>, and the screen will then show it here in
        full screen.
      </>
    ),
  },
  fr: {
    openNewTab: 'Ouvrir la démo dans un nouvel onglet',
    openVideo: 'Ouvrir la vidéo',
    close: 'Fermer la démo',
    loading: 'Chargement de la démo…',
    placeholderText: (
      <>
        Cette démo n’est pas encore connectée. Renseignez l’URL dans le transfert de
        l’activité dans <code>src/data/chapters.ts</code> : l’écran l’affichera alors
        ici en plein écran.
      </>
    ),
  },
}

// ─────────────────────────────────────────────────────────────────────────────
// IframeStage — der Demo-Absprung (Kap. 01 Liquid, 02 Vertriebscockpit,
// 05 SDLC). Die Demo füllt den ganzen Bildschirm: die Bühne wächst per GSAP
// auf die volle Fensterfläche und bittet den Browser zusätzlich um echtes
// Vollbild (Fullscreen API, bei Ablehnung bleibt es beim fensterfüllenden
// Layer). Kein nachgebauter Browserrahmen mehr; die Steuerung (Titel, neuer
// Tab, Schließen, Esc) liegt als Pille oben in der Mitte, blendet nach kurzer
// Zeit aus und kommt zurück, sobald der Zeiger an die obere Kante fährt. Das
// iframe rendert bei fester 1920×1080-Logik und wird per ResizeObserver
// passgenau skaliert — die Demo kommt immer ohne eigene Scrollbalken aus.
//
// Ist noch keine URL hinterlegt (url === ''), zeigt die Stage einen sauberen
// Platzhalter statt eines leeren iframes.
//
// Zwei weitere Arten teilen sich Bühne und Steuerung: `video` spielt eine
// Videodatei (Kap. 01 Liquid), `extern` zeigt ein Standbild, dessen Klick das
// Video an seinem Ablageort in neuem Tab öffnet (Kap. 05 SDLC, SharePoint).
// ─────────────────────────────────────────────────────────────────────────────

const IFRAME_LOGICAL_W = 1920
const IFRAME_LOGICAL_H = 1080

type IframeStageProps = {
  url: string
  title: string
  onClose: () => void
  /** iframe: url ist eine Seite · video: eine Videodatei · extern: Ziel des Standbilds. */
  art?: 'iframe' | 'video' | 'extern'
  /** Art `video`: WebM-Fassung als zweite Quelle neben der MP4-Datei in `url`. */
  webm?: string
  /** Standbild: Vorschau des Videos bzw. Bühne der Art `extern`. */
  poster?: string
  /** Zeile unter dem Abspielknopf der Art `extern`. */
  hinweis?: string
}

export function IframeStage({
  url,
  title,
  onClose,
  art = 'iframe',
  webm,
  poster,
  hinweis,
}: IframeStageProps): React.ReactElement {
  const rootRef = useRef<HTMLDivElement>(null)
  const backdropRef = useRef<HTMLDivElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)
  // onClose per Ref, damit der Vollbild-Effekt nur einmal läuft und nicht bei
  // jeder neuen Callback-Identität das Vollbild wieder verlässt.
  const onCloseRef = useRef(onClose)
  onCloseRef.current = onClose
  const viewportRef = useRef<HTMLDivElement>(null)
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const reducedMotion = useReducedMotion()
  const { lang } = useLang()
  const t = STR[lang]

  const hasUrl = url.trim() !== ''
  // Bis das Dokument geladen ist, bleibt das iframe durchsichtig und der
  // Viewport zeigt den dunklen Ladehinweis statt eines weißen Rechtecks.
  const [geladen, setGeladen] = useState(false)
  const onLoad = useCallback(() => {
    window.setTimeout(() => setGeladen(true), 250)
  }, [])

  // Esc schließt — auch aus dem iframe heraus: eine eingebettete Demo aus
  // dieser App (Ein Tag in Banking Operations 2030) meldet ihr Escape per
  // postMessage, weil der Tastendruck sonst im iframe bleibt.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    const onMessage = (e: MessageEvent) => {
      if (e.data === 'bz2030:demo-schliessen') onClose()
    }
    window.addEventListener('keydown', onKey)
    window.addEventListener('message', onMessage)
    return () => {
      window.removeEventListener('keydown', onKey)
      window.removeEventListener('message', onMessage)
    }
  }, [onClose])

  // Echtes Vollbild über die Fullscreen API. Der Klick auf „im Vollbild" liegt
  // nur Millisekunden zurück, die Nutzeraktivierung reicht dafür aus. Verlässt
  // der Nutzer das Vollbild (Esc oder Browser-UI), schließt die Demo mit.
  useEffect(() => {
    const el = rootRef.current
    if (!el || typeof el.requestFullscreen !== 'function' || document.fullscreenElement) return
    let aktiv = false
    el.requestFullscreen({ navigationUI: 'hide' })
      .then(() => { aktiv = true })
      .catch(() => { /* z. B. eingebettet ohne allowfullscreen: fensterfüllend weiter */ })
    const onChange = () => {
      if (aktiv && !document.fullscreenElement) onCloseRef.current()
    }
    document.addEventListener('fullscreenchange', onChange)
    return () => {
      document.removeEventListener('fullscreenchange', onChange)
      if (document.fullscreenElement === el) document.exitFullscreen().catch(() => {})
    }
  }, [])

  // Steuerpille: nach dem Öffnen kurz sichtbar, dann ausgeblendet; die obere
  // Kante (Hot-Zone) holt sie zurück. Mausbewegungen über dem iframe erreichen
  // uns nicht, deshalb die eigene Zone über dem iframe.
  const [steuerungSichtbar, setSteuerungSichtbar] = useState(true)
  const ausblendTimer = useRef<number | undefined>(undefined)
  const steuerungZeigen = useCallback((dauer = 2600) => {
    setSteuerungSichtbar(true)
    window.clearTimeout(ausblendTimer.current)
    ausblendTimer.current = window.setTimeout(() => setSteuerungSichtbar(false), dauer)
  }, [])
  const steuerungHalten = useCallback(() => {
    window.clearTimeout(ausblendTimer.current)
    setSteuerungSichtbar(true)
  }, [])
  useEffect(() => {
    steuerungZeigen(3200)
    return () => window.clearTimeout(ausblendTimer.current)
  }, [steuerungZeigen])

  // Grow-in: der Bildschirm wächst aus der Mitte auf Vollbild.
  useEffect(() => {
    const backdrop = backdropRef.current
    const panel = panelRef.current
    if (!backdrop || !panel) return
    gsap.killTweensOf([backdrop, panel])
    if (reducedMotion) {
      gsap.set(backdrop, { opacity: 1 })
      gsap.set(panel, { opacity: 1, scale: 1 })
      return
    }
    gsap.fromTo(backdrop, { opacity: 0 }, { opacity: 1, duration: 0.3, ease: 'power2.out' })
    gsap.fromTo(
      panel,
      { opacity: 0, scale: 0.32 },
      { opacity: 1, scale: 1, duration: 0.6, ease: 'power3.out' },
    )
  }, [reducedMotion])

  // iframe maßstabsgetreu in den Viewport skalieren (cover ohne Scrollbalken).
  useLayoutEffect(() => {
    if (!hasUrl || art !== 'iframe') return
    const viewport = viewportRef.current
    const iframe = iframeRef.current
    if (!viewport || !iframe) return
    const update = () => {
      const w = viewport.clientWidth
      const h = viewport.clientHeight
      if (w <= 0 || h <= 0) return
      const scale = Math.max(w / IFRAME_LOGICAL_W, h / IFRAME_LOGICAL_H)
      iframe.style.transform = `translate(-50%, -50%) scale(${scale})`
    }
    update()
    const ro = new ResizeObserver(update)
    ro.observe(viewport)
    window.addEventListener('resize', update)
    return () => {
      ro.disconnect()
      window.removeEventListener('resize', update)
    }
  }, [hasUrl, art])

  return (
    <div ref={rootRef} className={styles.root} role="dialog" aria-modal="true" aria-label={title}>
      <div ref={backdropRef} className={styles.backdrop} aria-hidden />
      <div ref={panelRef} className={styles.panel}>
        {/* Hot-Zone an der oberen Kante und die Steuerpille darunter */}
        <div className={styles.hotzone} onMouseEnter={() => steuerungZeigen()} aria-hidden />
        <div
          className={styles.steuerung}
          data-sichtbar={steuerungSichtbar || undefined}
          onMouseEnter={steuerungHalten}
          onMouseLeave={() => steuerungZeigen(1200)}
        >
          <span className={styles.steuerungTitel}>{title}</span>
          {hasUrl && art !== 'video' && (
            <a
              className={styles.iconLink}
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={t.openNewTab}
              title={t.openNewTab}
            >
              <ExternalLink size={15} strokeWidth={2} />
            </a>
          )}
          <button
            type="button"
            className={styles.closeBtn}
            onClick={onClose}
            aria-label={t.close}
            title={`${t.close} (Esc)`}
          >
            <X size={16} strokeWidth={2} />
          </button>
          <kbd className={styles.esc} aria-hidden>Esc</kbd>
        </div>

        {hasUrl && art === 'video' ? (
          <div className={styles.videoBuehne}>
            <video
              className={styles.video}
              poster={poster}
              controls
              autoPlay
              playsInline
              preload="auto"
              aria-label={title}
            >
              <source src={url} type="video/mp4" />
              {webm && <source src={webm} type="video/webm" />}
            </video>
          </div>
        ) : hasUrl && art === 'extern' ? (
          <a
            className={styles.extern}
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`${t.openVideo}: ${title}`}
          >
            {poster && <img className={styles.externBild} src={poster} alt="" />}
            <span className={styles.externMitte}>
              <span className={styles.externPlay} aria-hidden>
                <Play size={34} strokeWidth={1.75} />
              </span>
              <span className={styles.externLabel}>
                {t.openVideo}
                <ExternalLink size={15} strokeWidth={2} aria-hidden />
              </span>
              {hinweis && <span className={styles.externHinweis}>{hinweis}</span>}
            </span>
          </a>
        ) : hasUrl ? (
          <div ref={viewportRef} className={styles.viewport} data-geladen={geladen || undefined}>
            {!geladen && (
              <div className={styles.lade}>
                <Loader2 size={26} strokeWidth={2} className={styles.spin} aria-hidden />
                <span>{t.loading}</span>
              </div>
            )}
            <iframe
              ref={iframeRef}
              className={styles.iframe}
              style={{ width: `${IFRAME_LOGICAL_W}px`, height: `${IFRAME_LOGICAL_H}px` }}
              src={url}
              title={title}
              onLoad={onLoad}
              sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
            />
          </div>
        ) : (
          <div className={styles.placeholder}>
            <span className={styles.phIcon} aria-hidden>
              <MonitorPlay size={30} strokeWidth={1.5} />
            </span>
            <span className={styles.phTitle}>{title}</span>
            <p className={styles.phText}>{t.placeholderText}</p>
          </div>
        )}
      </div>
    </div>
  )
}
