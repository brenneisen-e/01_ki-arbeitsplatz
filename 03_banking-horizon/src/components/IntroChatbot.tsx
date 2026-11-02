import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { gsap } from 'gsap'
import { ArrowLeft, ArrowRight, Bot, Play, RotateCcw, Send, SkipBack, Sparkles, X } from 'lucide-react'
import styles from './IntroChatbot.module.css'
import { DeloitteBadge } from './DeloitteBadge'
import { LanguageSwitch } from './LanguageSwitch'
import { MASTER_ASPECT, getChapters, getMasterImage } from '../data/chapters'
import { useReducedMotion } from '../hooks/useReducedMotion'
import { useLang, type Lang } from '../i18n/LanguageContext'

// ─────────────────────────────────────────────────────────────────────────────
// IntroChatbot — der „AI Banking Assistant"-Auftakt.
//
// Look übernommen von der Vertriebsarbeitsplatz-Landing: Vollbild-Stockfoto
// mit Dunkel-Overlay, Deloitte-„Demo"-Badge oben links, Glas-UI. Flow:
//   1. Name abfragen → 2. „Willkommen zurück, {Name} — was kann ich heute für
//   dich tun?" + GENAU EIN Vorschlag: „Wie kann ich mir die Bank der Zukunft
//   vorstellen?" Er startet sichtbares Thinking → das Strukturbild BAUT SICH
//   AUF als Explosionszeichnung, die sich schließt: das Bild ist in seine
//   Geschosse geschnitten (Bänder an den echten Etagenkanten aus den
//   Kapitelzonen), die Bänder schweben leicht auseinandergezogen und weich
//   gezeichnet über ihrer Position und legen sich von unten nach oben
//   aufeinander; eine feine weiße Hilfszeichnung der Deckenkanten steht
//   kurz davor und verschwindet, sobald die Geschosse liegen → das fertige
//   Bild ZOOMT VON SELBST auf Vollbild und übergibt nahtlos an den
//   BankExplorer. Kein Knopf mehr, kein Leuchten, keine Scanlinie —
//   zurückhaltend wie eine Architekturvisualisierung. Freie Eingabe gibt
//   eine kurze Assistenten-Antwort, die auf den Vorschlag zurückführt.
//   Weitere Knöpfe (Holodeck, Operations-Strecke) gibt es hier bewusst nicht;
//   die Operations-Strecke ist über Kapitel 03 und #/operations erreichbar.
//
// Deterministisch (scripted), privacy-first: Bild + Deloitte-Logo liegen lokal.
// Zweisprachig (DE/EN) über die Sprachumschaltung oben rechts.
// ─────────────────────────────────────────────────────────────────────────────

const DEFAULT_NAME = 'Eike'

// Einführungsvideo (48 s, 1920×1080, H.264/AAC) — liegt unter public/videos
// und wird relativ zum Auslieferungspfad geladen. Die Kachel zeigt das erste
// Bild des Clips; Klick öffnet den Player groß, mit Ton.
const INTRO_VIDEO = `${import.meta.env.BASE_URL}videos/banking-horizon-intro.mp4`
// Vorschaubild der Kachel und Poster des Players: das Bild bei 42,5 s
// (Menschen am Horizont, noch ohne Titel und Untertitel, damit der Play-Knopf
// keinen Text überdeckt), erzeugt mit ffmpeg aus dem Clip:
//   ffmpeg -ss 42.5 -i public/videos/banking-horizon-intro.mp4 -frames:v 1 \
//     -vf scale=1280:-1 -q:v 4 public/videos/banking-horizon-intro-poster.jpg
// Ohne Poster bleibt die Kachel im Browser schwarz, weil preload="metadata"
// kein Bild garantiert.
const INTRO_POSTER = `${import.meta.env.BASE_URL}videos/banking-horizon-intro-poster.jpg`
// Standbild am Ende: bei 45,4 s stehen der Titel „Banking Horizon 2030" und
// die vier Menschen, die in den Horizont schauen, gemeinsam im Bild (danach
// blendet der Clip auf die Titelkarte und in Schwarz aus). Dort hält der
// Player an und bleibt stehen, bis der Vortragende mit Esc oder X weitergeht.
const STANDBILD_SEKUNDE = 45.4

type VideoMitFrameCallback = HTMLVideoElement & {
  requestVideoFrameCallback?: (cb: (now: number, meta: { mediaTime: number }) => void) => number
}

// Name in der Browser-Sitzung merken, damit er nicht jedes Mal neu abgefragt wird.
const NAME_KEY = 'bz2030:name'
function readStoredName(): string {
  try {
    return localStorage.getItem(NAME_KEY)?.trim() ?? ''
  } catch {
    return ''
  }
}

type Prompt = { id: string; label: string; primary?: boolean; reply?: string }

type IntroStrings = {
  reasoning: string[]
  prompts: Prompt[]
  genericReply: string
  welcomeModalTitle: string
  assistantRole: string
  nameLabel: string
  namePlaceholder: string
  nameGo: string
  tileLight: string
  tileBold: string
  welcome: (name: string) => string
  welcomeSub: string
  introVideo: string
  introVideoSub: string
  introVideoClose: string
  introVideoBack: string
  introVideoRestart: string
  chatPlaceholder: string
  send: string
  suggestions: string
  statusReady: string
  statusThinking: string
  statusReply: string
  suiteLabel: string
  answerLead: (name: string) => string
  masterLabel: string
  masterCaption: string
  allDemos: string
  allDemosTitle: string
}

const STR: Record<Lang, IntroStrings> = {
  de: {
    reasoning: [
      'Analysiere Geschäftsmodell',
      'Kundenschnittstelle',
      'Betriebsmodell',
      'Governance & Risiko',
      'Komponiere Strukturbild',
    ],
    prompts: [
      { id: 'bank2030', label: 'Wie kann ich mir die Bank der Zukunft vorstellen?', primary: true },
    ],
    genericReply:
      'Gern. Fang am besten mit dem großen Bild an: Frag mich „Wie kann ich mir die Bank der Zukunft vorstellen?", dann baue ich dir das Strukturbild auf.',
    welcomeModalTitle: 'Willkommen!',
    assistantRole: 'AI Banking Assistant',
    nameLabel: 'Wie darf ich dich nennen?',
    namePlaceholder: 'Dein Vorname',
    nameGo: 'Los geht’s',
    tileLight: 'BANKING ',
    tileBold: 'HORIZON',
    welcome: (name) => (name ? `Willkommen zurück, ${name}` : 'Willkommen zurück'),
    welcomeSub: 'Was kann ich heute für dich tun?',
    introVideo: 'Einführung ansehen',
    introVideoSub: 'Banking Horizon in 48 Sekunden',
    introVideoClose: 'Video schließen',
    introVideoBack: 'Zurück',
    introVideoRestart: 'Von vorn',
    chatPlaceholder: 'Frag mich etwas zur Bank der Zukunft…',
    send: 'Senden',
    suggestions: 'Vorschläge',
    statusReady: 'Bereit',
    statusThinking: 'Denkt nach',
    statusReply: 'Antwort bereit',
    suiteLabel: 'Banking Horizon 2030',
    answerLead: (name) =>
      `${name ? `${name}, hier ist deine ` : 'Hier ist deine '}Bank im Zustand 2026, als begehbares Strukturbild. Jede Etage zeigt den Sprung von heute auf 2030.`,
    masterLabel: 'Master · Strukturbild',
    masterCaption: 'Bank’26 · Querschnitt',
    allDemos: 'Alle Demos',
    allDemosTitle: 'Zurück zur Übersicht aller Demos',
  },
  en: {
    reasoning: [
      'Analysing business model',
      'Customer interface',
      'Operating model',
      'Governance & risk',
      'Composing the cross-section',
    ],
    prompts: [
      { id: 'bank2030', label: 'What could the bank of the future look like?', primary: true },
    ],
    genericReply:
      'Happy to. Best to start with the big picture: ask me “What could the bank of the future look like?” and I’ll build up the cross-section for you.',
    welcomeModalTitle: 'Welcome!',
    assistantRole: 'AI Banking Assistant',
    nameLabel: 'What should I call you?',
    namePlaceholder: 'Your first name',
    nameGo: 'Let’s go',
    tileLight: 'BANKING ',
    tileBold: 'HORIZON',
    welcome: (name) => (name ? `Welcome back, ${name}` : 'Welcome back'),
    welcomeSub: 'What can I do for you today?',
    introVideo: 'Watch the introduction',
    introVideoSub: 'Banking Horizon in 48 seconds',
    introVideoClose: 'Close the video',
    introVideoBack: 'Back',
    introVideoRestart: 'From the start',
    chatPlaceholder: 'Ask me anything about the bank of the future…',
    send: 'Send',
    suggestions: 'Suggestions',
    statusReady: 'Ready',
    statusThinking: 'Thinking',
    statusReply: 'Answer ready',
    suiteLabel: 'Banking Horizon 2030',
    answerLead: (name) =>
      `${name ? `${name}, here is your ` : 'Here is your '}bank in its 2026 state, as a walkable cross-section. Each floor shows the leap from today to 2030.`,
    masterLabel: 'Master · Cross-section',
    masterCaption: 'Bank’26 · cross-section',
    allDemos: 'All demos',
    allDemosTitle: 'Back to the overview of all demos',
  },
  fr: {
    reasoning: [
      'Analyse du modèle d’affaires',
      'Interface client',
      'Modèle opérationnel',
      'Gouvernance & risques',
      'Composition de la vue en coupe',
    ],
    prompts: [
      { id: 'bank2030', label: 'À quoi pourrait ressembler la banque du futur ?', primary: true },
    ],
    genericReply:
      'Avec plaisir. Le mieux est de commencer par la vue d’ensemble : demandez-moi « À quoi pourrait ressembler la banque du futur ? » et je construirai pour vous la vue en coupe de la banque.',
    welcomeModalTitle: 'Bienvenue !',
    assistantRole: 'AI Banking Assistant',
    nameLabel: 'Comment puis-je vous appeler ?',
    namePlaceholder: 'Votre prénom',
    nameGo: 'C’est parti',
    tileLight: 'BANKING ',
    tileBold: 'HORIZON',
    welcome: (name) => (name ? `Ravi de vous revoir, ${name}` : 'Ravi de vous revoir'),
    welcomeSub: 'Que puis-je faire pour vous aujourd’hui ?',
    introVideo: 'Voir l’introduction',
    introVideoSub: 'Banking Horizon en 48 secondes',
    introVideoClose: 'Fermer la vidéo',
    introVideoBack: 'Retour',
    introVideoRestart: 'Recommencer',
    chatPlaceholder: 'Posez-moi une question sur la banque du futur…',
    send: 'Envoyer',
    suggestions: 'Suggestions',
    statusReady: 'Prêt',
    statusThinking: 'En réflexion',
    statusReply: 'Réponse prête',
    suiteLabel: 'Banking Horizon 2030',
    answerLead: (name) =>
      `${name ? `${name}, voici votre ` : 'Voici votre '}banque dans son état de 2026, sous forme de vue en coupe à parcourir. Chaque étage montre le saut d’aujourd’hui à 2030.`,
    masterLabel: 'Master · vue en coupe',
    masterCaption: 'Bank’26 · vue en coupe',
    allDemos: 'Toutes les démos',
    allDemosTitle: 'Retour à la vue d’ensemble des démos',
  },
}

const LINE_INTERVAL = 720
const REVEAL_PAUSE = 600

// Hilfszeichnung im Seitenverhältnis des Bilds (viewBox-Einheiten).
const PLAN_H = 100 / MASTER_ASPECT

/** Ein Geschoss-Band des Strukturbilds: Ober- und Unterkante in % der Bildhöhe. */
type Band = { top: number; bottom: number }

/**
 * Das Bild an den echten Etagenkanten schneiden. Die Kanten kommen aus den
 * Kapitelzonen (Räume der linken Spalte, von oben nach unten); darüber liegt
 * das Dach, darunter der Vorplatz. Der Aufzug (die hohe Zone) zählt nicht.
 */
function geschosse(zonen: ReturnType<typeof getChapters>): Band[] {
  const raeume = zonen
    .filter((k) => k.zone.centerX < 50 && k.zone.height < 60)
    .map((k) => ({ top: k.zone.centerY - k.zone.height / 2, bottom: k.zone.centerY + k.zone.height / 2 }))
    .sort((a, b) => a.top - b.top)
  const kanten = [0]
  raeume.forEach((r, i) => {
    // Etagenkante = Mitte zwischen Unterkante des oberen und Oberkante des
    // unteren Raums; ganz oben die Oberkante des obersten Raums.
    kanten.push(i === 0 ? r.top : (raeume[i - 1].bottom + r.top) / 2)
  })
  kanten.push(raeume[raeume.length - 1]?.bottom ?? 90, 100)
  return kanten.slice(0, -1).map((top, i) => ({ top, bottom: kanten[i + 1] }))
}

type Msg = { id: number; role: 'user' | 'assistant'; text: string }
type Phase = 'name' | 'chat' | 'thinking' | 'revealed'

/** Läuft die App in einem fremden Rahmen (Galerie)? Dann kein Rückweg zur Plattform. */
const eingebettet = (() => {
  try {
    return window.self !== window.top
  } catch {
    return true
  }
})()

export function IntroChatbot({ onEnter }: { onEnter: () => void }): React.ReactElement {
  const { lang } = useLang()
  const t = STR[lang]
  const masterImage = useMemo(() => getMasterImage(lang), [lang])

  // Gespeicherter Name überspringt die Abfrage und startet direkt im Chat.
  const [storedName] = useState(readStoredName)
  const [phase, setPhase] = useState<Phase>(storedName ? 'chat' : 'name')
  const [nameInput, setNameInput] = useState(storedName || DEFAULT_NAME)
  const [name, setName] = useState(storedName)
  const [chatInput, setChatInput] = useState('')
  const [messages, setMessages] = useState<Msg[]>([])
  const [replying, setReplying] = useState(false)
  const [visibleLines, setVisibleLines] = useState(0)
  // Einführungsvideo: Klick auf die Kachel öffnet den Player und fordert
  // sofort das echte Browser-Vollbild an (noch innerhalb der Nutzeraktion).
  // Verlässt man das Vollbild (Escape, Systemgeste), schließt der Player
  // mit; Schließen über X verlässt umgekehrt das Vollbild. Wo kein
  // Element-Vollbild möglich ist (iPhone), bleibt der große Player.
  // Am Ende bleibt das Standbild (STANDBILD_SEKUNDE) ohne Steuerleiste stehen.
  const [videoOpen, setVideoOpen] = useState(false)
  const [standbild, setStandbild] = useState(false)
  // Zählt die Durchläufe; „Von vorn“ erhöht ihn, damit das Anhalten am
  // Standbild für den neuen Durchlauf wieder scharf gestellt wird.
  const [lauf, setLauf] = useState(0)
  const videoFrameRef = useRef<HTMLDivElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  // Der ganze Clip (rund 21 MB) wird einmal vorab geladen und dann aus dem
  // Speicher abgespielt, damit er ohne Nachladen flüssig läuft und Sprünge
  // („Von vorn“) sofort greifen. Bis der Download fertig ist, spielt der
  // Player von der Datei-URL; die Quelle wird beim Öffnen festgelegt, damit
  // ein laufendes Video nicht mittendrin die Quelle wechselt.
  const videoBlobRef = useRef<string | null>(null)
  const [playerSrc, setPlayerSrc] = useState(INTRO_VIDEO)
  useEffect(() => {
    const ctrl = new AbortController()
    fetch(INTRO_VIDEO, { signal: ctrl.signal })
      .then((r) => (r.ok ? r.blob() : Promise.reject(new Error(String(r.status)))))
      .then((blob) => { videoBlobRef.current = URL.createObjectURL(blob) })
      .catch(() => undefined)
    return () => {
      ctrl.abort()
      if (videoBlobRef.current) URL.revokeObjectURL(videoBlobRef.current)
      videoBlobRef.current = null
    }
  }, [])
  const openVideo = useCallback(() => {
    setPlayerSrc(videoBlobRef.current ?? INTRO_VIDEO)
    setStandbild(false)
    setVideoOpen(true)
  }, [])
  const closeVideo = useCallback(() => {
    if (document.fullscreenElement) document.exitFullscreen().catch(() => undefined)
    setVideoOpen(false)
    setStandbild(false)
  }, [])
  // „Zurück“: an den Anfang springen und pausieren (Steuerleiste wieder da).
  const rewindVideo = useCallback(() => {
    const video = videoRef.current
    if (!video) return
    video.pause()
    video.currentTime = 0
    setStandbild(false)
    setLauf((n) => n + 1)
  }, [])
  // „Von vorn“: an den Anfang springen und sofort abspielen.
  const restartVideo = useCallback(() => {
    const video = videoRef.current
    if (!video) return
    setStandbild(false)
    video.currentTime = 0
    void video.play().catch(() => undefined)
    setLauf((n) => n + 1)
  }, [])
  useEffect(() => {
    if (!videoOpen) return
    const video = videoRef.current as VideoMitFrameCallback | null
    if (!video) return
    let fertig = false
    const anhalten = () => {
      if (fertig) return
      fertig = true
      video.pause()
      video.currentTime = STANDBILD_SEKUNDE
      setStandbild(true)
    }
    // Bildgenau anhalten, wo der Browser es kann; sonst über timeupdate (alle ~250 ms).
    if (typeof video.requestVideoFrameCallback === 'function') {
      const tick = (_now: number, meta: { mediaTime: number }) => {
        if (fertig) return
        if (meta.mediaTime >= STANDBILD_SEKUNDE) anhalten()
        else video.requestVideoFrameCallback?.(tick)
      }
      video.requestVideoFrameCallback(tick)
    }
    const onTime = () => { if (video.currentTime >= STANDBILD_SEKUNDE) anhalten() }
    const onEnded = () => anhalten()
    video.addEventListener('timeupdate', onTime)
    video.addEventListener('ended', onEnded)
    return () => {
      fertig = true
      video.removeEventListener('timeupdate', onTime)
      video.removeEventListener('ended', onEnded)
    }
  }, [videoOpen, lauf])
  useEffect(() => {
    if (!videoOpen) return
    const frame = videoFrameRef.current
    if (frame && typeof frame.requestFullscreen === 'function') {
      frame.requestFullscreen({ navigationUI: 'hide' }).catch(() => undefined)
    }
    const onFullscreen = () => {
      if (!document.fullscreenElement) setVideoOpen(false)
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeVideo()
    }
    document.addEventListener('fullscreenchange', onFullscreen)
    window.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('fullscreenchange', onFullscreen)
      window.removeEventListener('keydown', onKey)
    }
  }, [videoOpen, closeVideo])

  const idRef = useRef(0)
  const nameRef = useRef<HTMLInputElement>(null)
  const endRef = useRef<HTMLDivElement>(null)
  const rootRef = useRef<HTMLDivElement>(null)
  const revealRef = useRef<HTMLDivElement>(null)
  const planRef = useRef<SVGSVGElement>(null)
  const grundRef = useRef<HTMLSpanElement>(null)
  const reducedMotion = useReducedMotion()
  // Kapitelzonen → Geschoss-Bänder und die Kanten der Hilfszeichnung.
  const zonen = useMemo(() => getChapters(lang), [lang])
  const baender = useMemo(() => geschosse(zonen), [zonen])
  const aufzug = useMemo(() => zonen.find((k) => k.zone.height >= 60)?.zone ?? null, [zonen])
  const wandLinks = useMemo(
    () => Math.min(...zonen.map((k) => k.zone.centerX - k.zone.width / 2)),
    [zonen],
  )
  const wandRechts = useMemo(
    () => Math.max(...zonen.map((k) => k.zone.centerX + k.zone.width / 2)),
    [zonen],
  )

  const reasoning = t.reasoning

  const pushMsg = useCallback((role: Msg['role'], text: string) => {
    idRef.current += 1
    setMessages((m) => [...m, { id: idRef.current, role, text }])
  }, [])

  useEffect(() => {
    nameRef.current?.focus()
  }, [])

  const submitName = useCallback(() => {
    if (phase !== 'name') return
    const trimmed = nameInput.trim()
    setName(trimmed)
    try {
      localStorage.setItem(NAME_KEY, trimmed)
    } catch {
      // ohne localStorage einfach nur für diese Sitzung
    }
    setPhase('chat')
  }, [phase, nameInput])

  const cannedReply = useCallback(
    (reply: string) => {
      setReplying(true)
      window.setTimeout(
        () => {
          pushMsg('assistant', reply)
          setReplying(false)
        },
        reducedMotion ? 200 : 950,
      )
    },
    [pushMsg, reducedMotion],
  )

  const clickPrompt = useCallback(
    (p: Prompt) => {
      if (phase !== 'chat' || replying) return
      // Die gestellte Frage steht oben in der Eingabezeile (keine separate Bubble).
      setChatInput(p.label)
      if (p.primary) setPhase('thinking')
      else if (p.reply) cannedReply(p.reply)
    },
    [phase, replying, cannedReply],
  )

  const submitChat = useCallback(() => {
    const q = chatInput.trim()
    if (phase !== 'chat' || replying || !q) return
    cannedReply(t.genericReply)
  }, [chatInput, phase, replying, cannedReply, t.genericReply])

  // Reasoning-Sequenz (nur „Bank 2030"-Pfad), dann Reveal.
  useEffect(() => {
    if (phase !== 'thinking') return
    if (reducedMotion) {
      setVisibleLines(reasoning.length)
      const t2 = window.setTimeout(() => setPhase('revealed'), 500)
      return () => window.clearTimeout(t2)
    }
    setVisibleLines(0)
    let i = 0
    const iv = window.setInterval(() => {
      i += 1
      setVisibleLines(i)
      if (i >= reasoning.length) window.clearInterval(iv)
    }, LINE_INTERVAL)
    const t2 = window.setTimeout(
      () => setPhase('revealed'),
      reasoning.length * LINE_INTERVAL + REVEAL_PAUSE,
    )
    return () => {
      window.clearInterval(iv)
      window.clearTimeout(t2)
    }
  }, [phase, reducedMotion, reasoning.length])

  // Reveal: das Strukturbild setzt sich zusammen und zoomt dann von selbst
  // ins Haus. Ablauf (GSAP-Timeline, Sekunden ab Erscheinen der Antwort):
  //   0,0  Hilfszeichnung: Deckenkanten, Außenwände und Aufzugsschacht
  //        zeichnen sich als feine weiße Linien (pathLength=1)
  //   0,4  Geschosse: die Bänder liegen auseinandergezogen (je weiter oben,
  //        desto höher), weich und leicht entsättigt; sie senken sich von
  //        unten nach oben nacheinander auf ihre Kante und werden scharf —
  //        die Explosionszeichnung schließt sich
  //   1,9  Hilfszeichnung und dunkler Grund weichen; das Ganze setzt sich
  //        mit einem kaum sichtbaren Ruck (Skalierung 1,015 → 1)
  //   3,1  Zoom: eine Kopie des Bilds wächst als eigene Ebene (position:
  //        fixed, außerhalb des React-Baums, damit sie den Wechsel auf den
  //        Explorer überlebt) von der Chat-Position exakt auf die Fläche, die
  //        das Strukturbild im BankExplorer einnimmt (contain-Fit im
  //        Viewport); der Chat blendet ab. Am Ende onEnter(); die Ebene bleibt
  //        noch kurz über dem einblendenden Explorer und geht dann weich raus.
  // Bei reduzierter Bewegung: Bild steht sofort, Übergabe nach kurzer Pause.
  useEffect(() => {
    if (phase !== 'revealed') return
    const wrap = revealRef.current
    const root = rootRef.current
    if (!wrap || !root) return
    let gestoppt = false
    let uebergabe = false
    let tl: gsap.core.Timeline | null = null
    let ebene: HTMLDivElement | null = null
    const timer: number[] = []
    const bandEls = Array.from(wrap.querySelectorAll<HTMLElement>('[data-band]'))
    const linien = Array.from(wrap.querySelectorAll<SVGLineElement>('[data-plan]'))
    const plan = planRef.current
    const grund = grundRef.current

    const betreten = () => {
      if (!gestoppt) onEnter()
    }

    if (reducedMotion) {
      gsap.set(bandEls, { opacity: 1 })
      gsap.set([plan, grund].filter(Boolean), { opacity: 0 })
      timer.push(window.setTimeout(betreten, 1200))
      return () => {
        gestoppt = true
        timer.forEach((id) => window.clearTimeout(id))
      }
    }

    const zoomen = () => {
      if (gestoppt) return
      const von = wrap.getBoundingClientRect()
      const vw = window.innerWidth
      const vh = window.innerHeight
      // Zielfläche = .camera des BankExplorers: min(100vw, 100vh × AR), mittig.
      const w = Math.min(vw, vh * MASTER_ASPECT)
      const h = w / MASTER_ASPECT
      const nach = { left: (vw - w) / 2, top: (vh - h) / 2, width: w, height: h }
      ebene = document.createElement('div')
      ebene.className = styles.uebergabe
      Object.assign(ebene.style, {
        left: `${von.left}px`,
        top: `${von.top}px`,
        width: `${von.width}px`,
        height: `${von.height}px`,
      })
      const bild = document.createElement('img')
      bild.className = styles.uebergabeBild
      bild.src = masterImage.src
      bild.alt = ''
      ebene.appendChild(bild)
      document.body.appendChild(ebene)
      wrap.style.visibility = 'hidden'
      uebergabe = true
      gsap.to(root, { opacity: 0, duration: 0.8, ease: 'power2.inOut', delay: 0.2 })
      gsap.to(ebene, {
        left: nach.left,
        top: nach.top,
        width: nach.width,
        height: nach.height,
        borderRadius: 0,
        duration: 1.5,
        ease: 'power3.inOut',
        onComplete: () => {
          const e = ebene
          betreten()
          // Der Explorer blendet 0,7 s ein — so lange bleibt die Ebene darüber.
          window.setTimeout(() => {
            if (!e) return
            gsap.to(e, { opacity: 0, duration: 0.45, ease: 'power1.out', onComplete: () => e.remove() })
          }, 850)
        },
      })
    }

    const bauen = () => {
      if (gestoppt) return
      const hoehe = wrap.clientHeight || 400
      // Bänder von unten nach oben; das unterste liegt schon fast, das
      // oberste schwebt am höchsten — wie eine geöffnete Explosionszeichnung.
      const vonUnten = [...bandEls].reverse()
      tl = gsap.timeline({ defaults: { ease: 'power3.out' } })
      tl.set(linien, { strokeDasharray: 1, strokeDashoffset: 1 })
        .set(bandEls, {
          opacity: 0,
          y: (i: number) => -(bandEls.length - i) * hoehe * 0.045 - 6,
          filter: 'blur(5px) saturate(0.55)',
        })
        .to(linien, { strokeDashoffset: 0, duration: 0.7, stagger: 0.06, ease: 'power2.inOut' }, 0)
        .to(
          vonUnten,
          {
            opacity: 1,
            y: 0,
            filter: 'blur(0px) saturate(1)',
            duration: 1.1,
            stagger: 0.16,
            ease: 'power3.out',
          },
          0.4,
        )
        .to([plan, grund].filter(Boolean), { opacity: 0, duration: 0.6 }, 1.9)
        .fromTo(wrap, { scale: 1.015 }, { scale: 1, duration: 0.9, ease: 'power2.out' }, 2.1)
        .add(zoomen, 3.1)
    }

    // Erst bauen, wenn das Bild wirklich da ist — sonst setzen sich leere
    // Kacheln zusammen. Der Bauplan überbrückt eine kurze Ladezeit.
    const vorab = new Image()
    vorab.src = masterImage.src
    if (vorab.complete) bauen()
    else {
      vorab.onload = bauen
      vorab.onerror = bauen
    }

    return () => {
      gestoppt = true
      tl?.kill()
      timer.forEach((id) => window.clearTimeout(id))
      // Nur bei Abbruch (z. B. Sprachwechsel mitten im Aufbau) aufräumen —
      // nach der Übergabe räumt die Ebene sich selbst auf.
      if (!uebergabe) ebene?.remove()
    }
  }, [phase, reducedMotion, masterImage.src, onEnter])

  // Auto-Scroll ans Ende.
  useEffect(() => {
    endRef.current?.scrollIntoView({
      behavior: reducedMotion ? 'auto' : 'smooth',
      block: 'end',
    })
  }, [messages, replying, phase, visibleLines, reducedMotion])

  const statusLabel =
    phase === 'thinking' ? t.statusThinking : phase === 'revealed' ? t.statusReply : t.statusReady
  const showSuggestions = phase === 'chat'

  return (
    <div
      ref={rootRef}
      className={styles.root}
      style={{
        backgroundImage:
          "linear-gradient(180deg, rgba(15,23,42,0.55) 0%, rgba(12,17,32,0.82) 100%), url('./landing-bg.jpeg')",
      }}
    >
      {/* Top bar: Deloitte „Demo" und der Weg zurück zur Plattform-Startseite
          mit allen Demos links, Sprache + Status/Label rechts. Eingebettet (in
          der Galerie) fehlt der Rückweg, er würde die Plattform im Rahmen laden. */}
      <header className={styles.topbar}>
        <div className={styles.topLeft}>
          <DeloitteBadge />
          {!eingebettet && (
            <a href="../../index.html" className={styles.allDemos} title={t.allDemosTitle}>
              <ArrowLeft size={15} strokeWidth={2} aria-hidden />
              {t.allDemos}
            </a>
          )}
        </div>
        <div className={styles.topRight}>
          <LanguageSwitch />
          <span className={styles.status} data-on={phase !== 'name' || undefined}>
            <span className={styles.statusDot} aria-hidden />
            {statusLabel}
          </span>
          <span className={styles.suiteLabel}>{t.suiteLabel}</span>
        </div>
      </header>

      <div className={styles.main}>
        {phase === 'name' ? (
          <form
            className={styles.nameModal}
            onSubmit={(e) => {
              e.preventDefault()
              submitName()
            }}
          >
            <div className={styles.nameHead}>
              <span className={styles.nameIcon} aria-hidden>
                <Bot size={22} strokeWidth={1.8} />
              </span>
              <div>
                <h2 className={styles.nameTitle}>{t.welcomeModalTitle}</h2>
                <p className={styles.nameKicker}>{t.assistantRole}</p>
              </div>
            </div>
            <label className={styles.nameLabel} htmlFor="bdz-name">{t.nameLabel}</label>
            <input
              id="bdz-name"
              ref={nameRef}
              className={styles.nameField}
              value={nameInput}
              onChange={(e) => setNameInput(e.target.value)}
              placeholder={t.namePlaceholder}
              maxLength={40}
            />
            <button type="submit" className={styles.nameGo}>
              {t.nameGo}
              <ArrowRight size={16} strokeWidth={2.2} aria-hidden />
            </button>
          </form>
        ) : (
          <div className={styles.center}>
            <div className={styles.logoTile}>
              <span className={styles.tileMark} aria-hidden>BH</span>
              <span className={styles.tileName}>
                <span className={styles.tileLight}>{t.tileLight}</span>
                <span className={styles.tileBold}>{t.tileBold}</span>
              </span>
            </div>

            <h1 className={styles.welcome}>{t.welcome(name)}</h1>
            <p className={styles.welcomeSub}>{t.welcomeSub}</p>

            {/* Einführungsvideo: Kachel mit dem Standbild des Clips (Poster), nur
                solange noch keine Frage gestellt ist. */}
            {phase === 'chat' && (
              <button
                type="button"
                className={styles.videoTile}
                onClick={openVideo}
                aria-label={t.introVideo}
              >
                <img
                  className={styles.videoTilePreview}
                  src={INTRO_POSTER}
                  alt=""
                  aria-hidden
                />
                <span className={styles.videoTileScrim} aria-hidden />
                <span className={styles.videoTilePlay} aria-hidden>
                  <Play size={24} strokeWidth={2.2} />
                </span>
                <span className={styles.videoTileText}>
                  <span className={styles.videoTileTitle}>{t.introVideo}</span>
                  <span className={styles.videoTileSub}>{t.introVideoSub}</span>
                </span>
              </button>
            )}

            <div className={styles.chatWrap}>
              <div className={styles.inputRow}>
                <input
                  className={styles.chatInput}
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') submitChat()
                  }}
                  placeholder={t.chatPlaceholder}
                  disabled={phase !== 'chat'}
                />
                <button
                  type="button"
                  className={styles.sendBtn}
                  onClick={submitChat}
                  aria-label={t.send}
                  disabled={phase !== 'chat'}
                >
                  <Send size={18} strokeWidth={1.9} aria-hidden />
                </button>
              </div>

              {showSuggestions && (
                <div className={styles.suggestions} role="group" aria-label={t.suggestions}>
                  {t.prompts.map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      className={styles.suggestion}
                      data-primary={p.primary || undefined}
                      onClick={() => clickPrompt(p)}
                    >
                      {p.primary && <Sparkles size={14} strokeWidth={2} aria-hidden />}
                      {p.label}
                      {p.primary && <ArrowRight size={14} strokeWidth={2} aria-hidden />}
                    </button>
                  ))}
                </div>
              )}

              {(messages.length > 0 || replying || phase !== 'chat') && (
                <div className={styles.thread}>
                  {messages.map((m) => (
                    <div key={m.id} className={styles.assistantRow}>
                      <span className={styles.avatar} aria-hidden>
                        <Bot size={15} strokeWidth={1.9} />
                      </span>
                      <div className={styles.bubble}>{m.text}</div>
                    </div>
                  ))}

                  {replying && (
                    <div className={styles.assistantRow}>
                      <span className={styles.avatar} aria-hidden>
                        <Bot size={15} strokeWidth={1.9} />
                      </span>
                      <div className={styles.bubble}>
                        <span className={styles.dots} aria-hidden>
                          <span />
                          <span />
                          <span />
                        </span>
                      </div>
                    </div>
                  )}

                  {phase === 'thinking' && (
                    <div className={styles.assistantRow}>
                      <span className={styles.avatar} aria-hidden>
                        <Bot size={15} strokeWidth={1.9} />
                      </span>
                      <div className={styles.thinking} aria-live="polite">
                        <div className={styles.dots} aria-hidden>
                          <span />
                          <span />
                          <span />
                        </div>
                        <ul className={styles.reasoning}>
                          {reasoning.map((line, i) => (
                            <li
                              key={line}
                              className={styles.reasoningLine}
                              data-shown={i < visibleLines || undefined}
                              data-done={i < visibleLines - 1 || undefined}
                            >
                              <span className={styles.reasoningTick} aria-hidden />
                              {line}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  )}

                  {phase === 'revealed' && (
                    <div className={styles.assistantRow}>
                      <span className={styles.avatar} aria-hidden>
                        <Sparkles size={15} strokeWidth={1.9} />
                      </span>
                      <div className={styles.answer}>
                        <p className={styles.answerLead}>{t.answerLead(name)}</p>
                        {/* Bau-Animation: dunkler Grund, darauf die Kacheln des
                            Bilds, darüber der Bauplan (Kapitelzonen), Scan und
                            Lichtstreif. Reihenfolge der Ebenen = Stapelfolge. */}
                        <div
                          ref={revealRef}
                          className={styles.reveal}
                          role="img"
                          aria-label={masterImage.alt}
                        >
                          <span ref={grundRef} className={styles.bauGrund} aria-hidden />
                          <div className={styles.bauBaender} aria-hidden>
                            {baender.map((b, i) => {
                              const h = (b.bottom - b.top) / 100
                              return (
                                <span
                                  key={i}
                                  data-band
                                  className={styles.bauBand}
                                  style={{
                                    top: `${b.top}%`,
                                    height: `${b.bottom - b.top}%`,
                                    backgroundImage: `url("${masterImage.src}")`,
                                    backgroundSize: `100% ${100 / h}%`,
                                    backgroundPositionY: h >= 1 ? '0%' : `${(b.top / 100 / (1 - h)) * 100}%`,
                                  }}
                                />
                              )
                            })}
                          </div>
                          <svg
                            ref={planRef}
                            className={styles.bauPlan}
                            viewBox={`0 0 100 ${PLAN_H}`}
                            preserveAspectRatio="none"
                            aria-hidden
                          >
                            {/* Deckenkanten */}
                            {baender.slice(1).map((b, i) => (
                              <line
                                key={`k${i}`}
                                data-plan
                                x1={wandLinks}
                                x2={wandRechts}
                                y1={(b.top / 100) * PLAN_H}
                                y2={(b.top / 100) * PLAN_H}
                                pathLength={1}
                                vectorEffect="non-scaling-stroke"
                              />
                            ))}
                            {/* Außenwände */}
                            {[wandLinks, wandRechts].map((x, i) => (
                              <line
                                key={`w${i}`}
                                data-plan
                                x1={x}
                                x2={x}
                                y1={((baender[1]?.top ?? 0) / 100) * PLAN_H}
                                y2={((baender[baender.length - 1]?.top ?? 100) / 100) * PLAN_H}
                                pathLength={1}
                                vectorEffect="non-scaling-stroke"
                              />
                            ))}
                            {/* Aufzugsschacht */}
                            {aufzug &&
                              [aufzug.centerX - aufzug.width / 2, aufzug.centerX + aufzug.width / 2].map((x, i) => (
                                <line
                                  key={`a${i}`}
                                  data-plan
                                  x1={x}
                                  x2={x}
                                  y1={((aufzug.centerY - aufzug.height / 2) / 100) * PLAN_H}
                                  y2={((aufzug.centerY + aufzug.height / 2) / 100) * PLAN_H}
                                  pathLength={1}
                                  vectorEffect="non-scaling-stroke"
                                />
                              ))}
                          </svg>
                        </div>
                      </div>
                    </div>
                  )}

                  <div ref={endRef} />
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {videoOpen && (
        <div className={styles.videoLayer} role="dialog" aria-modal="true" aria-label={t.introVideo}>
          <div className={styles.videoBackdrop} onClick={closeVideo} aria-hidden />
          <div className={styles.videoFrame} ref={videoFrameRef}>
            <video
              ref={videoRef}
              className={styles.videoPlayer}
              src={playerSrc}
              poster={INTRO_POSTER}
              preload="auto"
              controls={!standbild}
              autoPlay
              playsInline
              data-standbild={standbild || undefined}
            />
            {/* Zurück (Anfang, pausiert) und Von vorn (Anfang, spielt): sichtbar
                auch am Standbild, wo die Steuerleiste des Browsers ausgeblendet
                ist. Schließen bleibt beim Kreuz und bei Escape. */}
            <div className={styles.videoTools}>
              <button type="button" className={styles.videoTool} onClick={rewindVideo}>
                <SkipBack size={16} strokeWidth={2.2} aria-hidden />
                {t.introVideoBack}
              </button>
              <button type="button" className={styles.videoTool} onClick={restartVideo}>
                <RotateCcw size={16} strokeWidth={2.2} aria-hidden />
                {t.introVideoRestart}
              </button>
            </div>
            <button
              type="button"
              className={styles.videoClose}
              onClick={closeVideo}
              aria-label={t.introVideoClose}
            >
              <X size={18} strokeWidth={2.2} aria-hidden />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
