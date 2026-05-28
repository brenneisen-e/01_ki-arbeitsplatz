/**
 * KreditDilemma — Kapitel 06 · Compliance & Risk
 *
 * Interaktives Entscheidungs-Szenario: Ein Großkunde beantragt einen Kredit
 * über 100 Mio. €; die KI lehnt autonom ab. Der Nutzer navigiert durch vier
 * Telefon-Stationen und trifft jeweils eine Entscheidung, die drei Status-
 * Balken verschiebt. Am Ende erscheint eine kurze Bewertung und drei
 * Reflexionsfragen (Wer hat freigegeben? / Wer haftet? / Wie wird kontrolliert?).
 *
 * Hinweis für spätere Integration: Echte Videoclips können über
 * `./ch06-clip-<n>.mp4` eingebunden werden — dazu das ClipPlaceholder-Element
 * durch ein <video>-Tag ersetzen.
 */
import { useEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'
import { Phone, Play, ShieldCheck, Gauge, Smile, X, RotateCcw, ArrowRight } from 'lucide-react'
import styles from './KreditDilemma.module.css'
import { useReducedMotion } from '../hooks/useReducedMotion'

// ─── Typen ────────────────────────────────────────────────────────────────────

type BarKey = 'reg' | 'speed' | 'sat'
type Bars = Record<BarKey, number>

type Option = {
  label: string
  deltas: Record<BarKey, number>
}

type Station = {
  caller: string
  transcript: string
  options: Option[]
}

// ─── Konstanten ───────────────────────────────────────────────────────────────

const INITIAL_BARS: Bars = { reg: 2, speed: 2, sat: 2 }

const STATIONS: Station[] = [
  {
    caller: 'Der Firmenkundenbetreuer',
    transcript:
      'Der Kunde ist empört über die automatische Ablehnung. Er fordert eine sofortige Klärung und droht, den Kreditantrag zur Konkurrenz zu verlagern.',
    options: [
      { label: 'Sofort manuell freigeben', deltas: { reg: -1, speed: 1, sat: 1 } },
      { label: 'Ablehnung der KI bestätigen', deltas: { reg: 1, speed: 1, sat: -2 } },
      { label: 'Fall zur Einzelfallprüfung eskalieren', deltas: { reg: 1, speed: -1, sat: 0 } },
    ],
  },
  {
    caller: 'Die Risikovorständin',
    transcript:
      'Sie fragt nach der Haftung, falls der Override zur Schadenersatzklage führt. Ohne klare Dokumentation ist niemandem geholfen.',
    options: [
      { label: 'Vier-Augen-Override dokumentieren', deltas: { reg: 1, speed: -1, sat: 1 } },
      { label: 'Ohne Dokumentation freigeben', deltas: { reg: -2, speed: 1, sat: 1 } },
      { label: 'An Kreditkomitee verweisen', deltas: { reg: 1, speed: -1, sat: -1 } },
    ],
  },
  {
    caller: 'Die Aufsicht / Compliance',
    transcript:
      'Die Aufsicht verlangt Nachvollziehbarkeit der KI-Entscheidung. Ohne erklärbare Grundlage drohen aufsichtsrechtliche Maßnahmen.',
    options: [
      { label: 'Modell-Begründung offenlegen', deltas: { reg: 1, speed: 0, sat: 1 } },
      { label: 'Entscheidung als Blackbox belassen', deltas: { reg: -2, speed: 0, sat: 0 } },
    ],
  },
  {
    caller: 'Der Kunde selbst',
    transcript:
      'Der Kunde droht offen mit Bankwechsel. Er erwartet entweder eine sofortige Lösung oder eine nachvollziehbare Begründung mit Handlungsalternative.',
    options: [
      { label: 'Konditionen-Kompromiss anbieten', deltas: { reg: 0, speed: 0, sat: 2 } },
      { label: 'Hart bei der Entscheidung bleiben', deltas: { reg: 1, speed: 1, sat: -2 } },
    ],
  },
]

// ─── Hilfsfunktionen ──────────────────────────────────────────────────────────

/** Klemmt einen Balkenwert auf den Bereich 0..4. */
function clamp(value: number): number {
  return Math.max(0, Math.min(4, value))
}

function applyDeltas(bars: Bars, deltas: Record<BarKey, number>): Bars {
  return {
    reg: clamp(bars.reg + deltas.reg),
    speed: clamp(bars.speed + deltas.speed),
    sat: clamp(bars.sat + deltas.sat),
  }
}

/** Leitet aus den Endwerten einen kurzen deutschen Bewertungstext ab. */
function getVerdict(bars: Bars): string {
  const { reg, speed, sat } = bars
  if (reg >= 3 && sat >= 3) return 'Regelkonform und kundenorientiert — ein ausgewogenes Ergebnis.'
  if (reg >= 3 && sat <= 1) return 'Regelkonform, aber teuer erkauft — die Kundenbeziehung leidet.'
  if (reg <= 1 && sat >= 3) return 'Kundenzufriedenheit gewonnen, jedoch auf Kosten der Compliance.'
  if (reg <= 1 && sat <= 1) return 'Kritische Lage: Compliance-Risiko und Kundenverlust gleichzeitig.'
  if (speed >= 3 && reg <= 2) return 'Schnelle Entscheidung, aber regulatorische Lücken gefährden die Bank.'
  if (speed >= 3 && sat >= 3) return 'Effizienter Prozess mit guter Kundenbindung — Governance bleibt prüfenswert.'
  return 'Ambivalentes Ergebnis — Nachsteuerung in der Governance empfohlen.'
}

// ─── Phasen-Typen ─────────────────────────────────────────────────────────────

type Phase =
  | { kind: 'briefing' }
  | { kind: 'station'; index: number }
  | { kind: 'resolution' }

// ─── Unterkomponenten ─────────────────────────────────────────────────────────

/** Vier-Segment-Ladebalken. */
function StatusBar({
  label,
  value,
  colorVar,
}: {
  label: string
  value: number
  colorVar: string
}): React.ReactElement {
  return (
    <div className={styles.barRow}>
      <span className={styles.barLabel}>{label}</span>
      <div className={styles.segments} role="meter" aria-label={label} aria-valuenow={value} aria-valuemin={0} aria-valuemax={4}>
        {Array.from({ length: 4 }, (_, i) => (
          <span
            key={i}
            className={styles.segment}
            style={{ background: i < value ? `var(${colorVar})` : undefined }}
            data-filled={i < value || undefined}
          />
        ))}
      </div>
    </div>
  )
}

/** Clip-Platzhalter (16:9). Kann später durch <video src="./ch06-clip-<n>.mp4"> ersetzt werden. */
function ClipPlaceholder({ caller }: { caller: string }): React.ReactElement {
  return (
    <div className={styles.clip} aria-label={`Clip-Platzhalter: ${caller}`}>
      <div className={styles.clipInner}>
        <div className={styles.clipIconGroup}>
          <Phone size={22} strokeWidth={1.6} aria-hidden />
          <Play size={22} strokeWidth={1.6} aria-hidden />
        </div>
        <span className={styles.clipCaption}>Clip-Platzhalter &middot; {caller}</span>
      </div>
    </div>
  )
}

// ─── Haupt-Komponente ─────────────────────────────────────────────────────────

export function KreditDilemma({ onClose }: { onClose: () => void }): React.ReactElement {
  const reduced = useReducedMotion()

  const [bars, setBars] = useState<Bars>(INITIAL_BARS)
  const [phase, setPhase] = useState<Phase>({ kind: 'briefing' })

  const overlayRef = useRef<HTMLDivElement>(null)
  const cardRef = useRef<HTMLDivElement>(null)

  // Entrance-Animation
  useEffect(() => {
    if (reduced) return
    const tl = gsap.timeline()
    if (overlayRef.current) {
      tl.fromTo(overlayRef.current, { opacity: 0 }, { opacity: 1, duration: 0.28, ease: 'power2.out' })
    }
    if (cardRef.current) {
      tl.fromTo(
        cardRef.current,
        { opacity: 0, y: 28, scale: 0.97 },
        { opacity: 1, y: 0, scale: 1, duration: 0.42, ease: 'power3.out' },
        '-=0.14',
      )
    }
    return () => { tl.kill() }
  }, [reduced])

  // Escape-Taste schließt das Panel
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  // Phasenanimate bei Station-Wechsel
  useEffect(() => {
    if (reduced || !cardRef.current) return
    gsap.fromTo(
      cardRef.current,
      { opacity: 0.6, y: 14 },
      { opacity: 1, y: 0, duration: 0.3, ease: 'power2.out' },
    )
  }, [phase, reduced])

  // Entscheidung verarbeiten
  function chooseOption(option: Option): void {
    const newBars = applyDeltas(bars, option.deltas)
    setBars(newBars)
    if (phase.kind === 'station') {
      const nextIndex = phase.index + 1
      if (nextIndex < STATIONS.length) {
        setPhase({ kind: 'station', index: nextIndex })
      } else {
        setPhase({ kind: 'resolution' })
      }
    }
  }

  function handleStart(): void {
    setPhase({ kind: 'station', index: 0 })
  }

  function handleRestart(): void {
    setBars(INITIAL_BARS)
    setPhase({ kind: 'briefing' })
  }

  const currentStation: Station | null =
    phase.kind === 'station' ? (STATIONS[phase.index] ?? null) : null

  return (
    <div
      ref={overlayRef}
      className={styles.overlay}
      role="dialog"
      aria-modal="true"
      aria-label="Kredit-Dilemma Szenario"
    >
      <div ref={cardRef} className={styles.card}>
        {/* ─── Header ───────────────────────────────────────────────── */}
        <header className={styles.header}>
          <div className={styles.headerText}>
            <span className={styles.kicker}>Kapitel 06 &middot; Compliance &amp; Risk</span>
            <h2 className={styles.title}>Kredit-Dilemma</h2>
          </div>
          <button
            type="button"
            className={styles.closeBtn}
            onClick={onClose}
            aria-label="Szenario schließen"
          >
            <X size={18} strokeWidth={2} aria-hidden />
          </button>
        </header>

        {/* ─── Status-Balken (immer sichtbar) ───────────────────────── */}
        <div className={styles.barsPanel} aria-label="Status-Indikatoren">
          <StatusBar label="Regulatorische Konformität" value={bars.reg} colorVar="--ok" />
          <StatusBar label="Prozessgeschwindigkeit" value={bars.speed} colorVar="--warn" />
          <StatusBar label="Kundenzufriedenheit" value={bars.sat} colorVar="--info" />
        </div>

        {/* ─── Inhalt je Phase ──────────────────────────────────────── */}
        <div className={styles.content}>
          {phase.kind === 'briefing' && (
            <div className={styles.briefing}>
              <div className={styles.scenarioBox}>
                <div className={styles.scenarioIconRow}>
                  <ShieldCheck size={20} strokeWidth={1.8} aria-hidden />
                  <span className={styles.scenarioKicker}>Szenario-Briefing</span>
                </div>
                <p className={styles.scenarioText}>
                  Ein Großkunde beantragt einen Kredit über <strong>100 Mio. €</strong>. Die KI
                  lehnt den Antrag autonom ab — ohne Rücksprache, ohne erklärbare Begründung. Der
                  Firmenkundenbetreuer greift zum Telefon. Sie entscheiden, wie die Bank reagiert.
                </p>
                <p className={styles.scenarioText}>
                  Jede Entscheidung beeinflusst die drei Indikatoren oben. Am Ende stellen sich die
                  entscheidenden Governance-Fragen: Wer hat freigegeben? Wer haftet? Wie wird
                  kontrolliert?
                </p>
              </div>
              <button
                type="button"
                className={styles.primaryBtn}
                onClick={handleStart}
                aria-label="Szenario starten"
              >
                <Gauge size={16} strokeWidth={2} aria-hidden />
                Szenario starten
                <ArrowRight size={16} strokeWidth={2} aria-hidden />
              </button>
            </div>
          )}

          {phase.kind === 'station' && currentStation !== null && (
            <div className={styles.station}>
              {/* Fortschrittsanzeige */}
              <div className={styles.progress} aria-label={`Station ${phase.index + 1} von ${STATIONS.length}`}>
                {STATIONS.map((_, i) => (
                  <span
                    key={i}
                    className={styles.progressDot}
                    data-active={i === phase.index || undefined}
                    data-done={i < phase.index || undefined}
                    aria-hidden
                  />
                ))}
                <span className={styles.progressLabel}>Station {phase.index + 1} / {STATIONS.length}</span>
              </div>

              {/* Clip-Platzhalter */}
              <ClipPlaceholder caller={currentStation.caller} />

              {/* Transkript */}
              <div className={styles.transcriptBox}>
                <span className={styles.callerLabel}>{currentStation.caller}</span>
                <p className={styles.transcriptText}>{currentStation.transcript}</p>
              </div>

              {/* Optionen */}
              <div className={styles.options} role="group" aria-label="Entscheidungsoptionen">
                {currentStation.options.map((opt) => (
                  <button
                    key={opt.label}
                    type="button"
                    className={styles.optionBtn}
                    onClick={() => chooseOption(opt)}
                    aria-label={opt.label}
                  >
                    <span className={styles.optionLabel}>{opt.label}</span>
                    <span className={styles.optionDeltas}>
                      <DeltaBadge label="Konf." delta={opt.deltas.reg} />
                      <DeltaBadge label="Speed" delta={opt.deltas.speed} />
                      <DeltaBadge label="Zufr." delta={opt.deltas.sat} />
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {phase.kind === 'resolution' && (
            <div className={styles.resolution}>
              <div className={styles.verdictBox}>
                <div className={styles.verdictIconRow}>
                  <Smile size={20} strokeWidth={1.8} aria-hidden />
                  <span className={styles.verdictKicker}>Ergebnis</span>
                </div>
                <p className={styles.verdictText}>{getVerdict(bars)}</p>
              </div>

              {/* Reflexionsfragen */}
              <div className={styles.reflectionGrid} aria-label="Reflexionsfragen">
                <ReflectionCard
                  question="Wer hat freigegeben?"
                  body="Liegt die Freigabeentscheidung beim Modell, beim Betreuer oder beim Komitee? Governance muss diese Frage eindeutig beantworten."
                />
                <ReflectionCard
                  question="Wer haftet?"
                  body="Bei einem Override der KI-Empfehlung muss die Verantwortlichkeit dokumentiert und juristisch belastbar sein."
                />
                <ReflectionCard
                  question="Wie wird kontrolliert?"
                  body="Aufsichtliche Nachvollziehbarkeit erfordert erklärbare Modelle, lückenlose Logs und regelmäßige Modell-Audits."
                />
              </div>

              <button
                type="button"
                className={styles.restartBtn}
                onClick={handleRestart}
                aria-label="Szenario neu starten"
              >
                <RotateCcw size={15} strokeWidth={2} aria-hidden />
                Szenario neu starten
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── Kleinere Unterkomponenten ────────────────────────────────────────────────

function DeltaBadge({ label, delta }: { label: string; delta: number }): React.ReactElement {
  const sign = delta > 0 ? '+' : delta < 0 ? '−' : '±'
  const abs = Math.abs(delta)
  const tone: 'pos' | 'neg' | 'neutral' = delta > 0 ? 'pos' : delta < 0 ? 'neg' : 'neutral'
  return (
    <span className={styles.deltaBadge} data-tone={tone} aria-label={`${label}: ${sign}${abs}`}>
      {sign}{abs > 0 ? abs : ''} {label}
    </span>
  )
}

function ReflectionCard({ question, body }: { question: string; body: string }): React.ReactElement {
  return (
    <div className={styles.reflectionCard}>
      <span className={styles.reflectionQ}>{question}</span>
      <p className={styles.reflectionBody}>{body}</p>
    </div>
  )
}
