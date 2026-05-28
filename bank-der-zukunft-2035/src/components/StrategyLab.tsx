/**
 * StrategyLab — Marktfolge Strategy Lab: Drei Entscheidungen in 60 Minuten
 *
 * Ein geführter 3-Schritt-Entscheidungsworkshop für die Marktfolge-Etage.
 * Schritt 1: Zukunftsrolle wählen (Single-Select).
 * Schritt 2: Fähigkeiten verorten (Intern / Hybrid / Ökosystem).
 * Schritt 3: Plattformpotenzial bewerten (Hoch / Mittel / Gering).
 * Zusammenfassung: Ergebnisse gesammelt anzeigen, Neustart möglich.
 *
 * Kapitel 03 · Marktfolge
 */

import { useEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'
import { X, ChevronRight, ChevronLeft, RotateCcw, CheckCircle } from 'lucide-react'
import { useReducedMotion } from '../hooks/useReducedMotion'
import styles from './StrategyLab.module.css'

// ─── Typen ────────────────────────────────────────────────────────────────────

type ZukunftsrolleId = 'dunkelverarbeitung' | 'orchestrator' | 'baas'
type VerortungValue = 'Intern' | 'Hybrid' | 'Ökosystem'
type PotenzialValue = 'Hoch' | 'Mittel' | 'Gering'
type Step = 1 | 2 | 3 | 4

// ─── Konstanten ───────────────────────────────────────────────────────────────

const ZUKUNFTSROLLEN: { id: ZukunftsrolleId; title: string; description: string }[] = [
  {
    id: 'dunkelverarbeitung',
    title: 'Autonome Dunkelverarbeitung',
    description:
      'Standardvorfälle (Kredit, KYC, Abwicklung) laufen vollautonom E2E — ohne manuellen Eingriff.',
  },
  {
    id: 'orchestrator',
    title: 'Orchestrator eines Service-Ökosystems',
    description:
      'Externe Plattformen und Utilities übernehmen den Standardbetrieb; die Marktfolge steuert das Ökosystem.',
  },
  {
    id: 'baas',
    title: 'Skalierbare Banking-as-a-Service-Plattform',
    description:
      'Standardisierte Services werden als eigenständiges Geschäftsmodell für Drittanbieter bereitgestellt.',
  },
]

const CAPABILITIES: string[] = [
  'Kreditabwicklung',
  'KYC / AML',
  'Zahlungsverkehr',
  'Regulatorisches Reporting',
  'Dokumentenmanagement',
  'Sicherheitenverwaltung',
]

const VERORTUNG_OPTIONS: VerortungValue[] = ['Intern', 'Hybrid', 'Ökosystem']
const POTENZIAL_OPTIONS: PotenzialValue[] = ['Hoch', 'Mittel', 'Gering']

type VerortungMap = Record<string, VerortungValue>
type PotenzialMap = Record<string, PotenzialValue>

function defaultVerortung(): VerortungMap {
  return Object.fromEntries(CAPABILITIES.map((c) => [c, 'Hybrid' as VerortungValue]))
}

function defaultPotenzial(): PotenzialMap {
  return Object.fromEntries(CAPABILITIES.map((c) => [c, 'Mittel' as PotenzialValue]))
}

// ─── Hilfsfunktionen ──────────────────────────────────────────────────────────

function potenzialColor(p: PotenzialValue): string {
  if (p === 'Hoch') return 'var(--ok)'
  if (p === 'Mittel') return 'var(--warn)'
  return 'var(--ink-3)'
}

function verortungColor(v: VerortungValue): string {
  if (v === 'Intern') return 'var(--info)'
  if (v === 'Hybrid') return 'var(--warn)'
  return 'var(--accent-bright)'
}

// ─── Teilkomponenten ──────────────────────────────────────────────────────────

/** Segmentierter Toggle für drei gleichwertige Optionen. */
function SegmentedToggle<T extends string>({
  options,
  value,
  onChange,
  colorFn,
  ariaLabel,
}: {
  options: T[]
  value: T
  onChange: (v: T) => void
  colorFn?: (v: T) => string
  ariaLabel: string
}): React.ReactElement {
  return (
    <div className={styles.segmented} role="group" aria-label={ariaLabel}>
      {options.map((opt) => {
        const active = value === opt
        const color = colorFn ? colorFn(opt) : undefined
        return (
          <button
            key={opt}
            type="button"
            className={styles.segmentedOption}
            data-active={active || undefined}
            onClick={() => onChange(opt)}
            aria-pressed={active}
            style={active && color ? { '--seg-active-color': color } as React.CSSProperties : undefined}
          >
            {opt}
          </button>
        )
      })}
    </div>
  )
}

// ─── Schritte ─────────────────────────────────────────────────────────────────

function Schritt1({
  selected,
  onSelect,
}: {
  selected: ZukunftsrolleId | null
  onSelect: (id: ZukunftsrolleId) => void
}): React.ReactElement {
  return (
    <div className={styles.stepContent}>
      <p className={styles.stepQuestion}>Welche Zukunftsrolle für die Marktfolge?</p>
      <div className={styles.roleGrid}>
        {ZUKUNFTSROLLEN.map((r) => {
          const active = selected === r.id
          return (
            <button
              key={r.id}
              type="button"
              className={styles.roleCard}
              data-active={active || undefined}
              onClick={() => onSelect(r.id)}
              aria-pressed={active}
            >
              <span className={styles.roleTitle}>{r.title}</span>
              <span className={styles.roleDesc}>{r.description}</span>
              <span className={styles.roleCheck} aria-hidden>
                {active && <CheckCircle size={18} strokeWidth={2} />}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}

function Schritt2({
  verortung,
  onChange,
}: {
  verortung: VerortungMap
  onChange: (capability: string, value: VerortungValue) => void
}): React.ReactElement {
  return (
    <div className={styles.stepContent}>
      <p className={styles.stepQuestion}>Was bleibt intern, was geht ins Ökosystem?</p>
      <div className={styles.capabilityList}>
        {CAPABILITIES.map((cap) => (
          <div key={cap} className={styles.capabilityRow}>
            <span className={styles.capabilityLabel}>{cap}</span>
            <SegmentedToggle
              options={VERORTUNG_OPTIONS}
              value={verortung[cap]}
              onChange={(v) => onChange(cap, v)}
              colorFn={verortungColor}
              ariaLabel={`Verortung für ${cap}`}
            />
          </div>
        ))}
      </div>
    </div>
  )
}

function Schritt3({
  potenzial,
  onChange,
}: {
  potenzial: PotenzialMap
  onChange: (capability: string, value: PotenzialValue) => void
}): React.ReactElement {
  return (
    <div className={styles.stepContent}>
      <p className={styles.stepQuestion}>Wo liegt Plattformpotenzial?</p>
      <div className={styles.capabilityList}>
        {CAPABILITIES.map((cap) => (
          <div key={cap} className={styles.capabilityRow}>
            <span className={styles.capabilityLabel}>{cap}</span>
            <SegmentedToggle
              options={POTENZIAL_OPTIONS}
              value={potenzial[cap]}
              onChange={(v) => onChange(cap, v)}
              colorFn={potenzialColor}
              ariaLabel={`Plattformpotenzial für ${cap}`}
            />
          </div>
        ))}
      </div>
    </div>
  )
}

function Zusammenfassung({
  rolle,
  verortung,
  potenzial,
  onReset,
}: {
  rolle: ZukunftsrolleId | null
  verortung: VerortungMap
  potenzial: PotenzialMap
  onReset: () => void
}): React.ReactElement {
  const gewaehltRolle = ZUKUNFTSROLLEN.find((r) => r.id === rolle)

  // Gruppierten Verortungs-Listen aufbauen
  const verortungGruppen: Record<VerortungValue, string[]> = { Intern: [], Hybrid: [], Ökosystem: [] }
  CAPABILITIES.forEach((cap) => {
    verortungGruppen[verortung[cap]].push(cap)
  })

  // Kapazitäten nach Potenzial sortieren
  const sortedByPotenzial = [...CAPABILITIES].sort((a, b) => {
    const order: Record<PotenzialValue, number> = { Hoch: 0, Mittel: 1, Gering: 2 }
    return order[potenzial[a]] - order[potenzial[b]]
  })

  return (
    <div className={styles.stepContent}>
      <p className={styles.stepQuestion}>Ihre Entscheidungen im Überblick</p>

      {/* Zukunftsrolle */}
      <section className={styles.summarySection}>
        <h3 className={styles.summaryHeading}>Zukunftsrolle</h3>
        {gewaehltRolle ? (
          <div className={styles.summaryRoleCard}>
            <span className={styles.summaryRoleTitle}>{gewaehltRolle.title}</span>
            <span className={styles.summaryRoleDesc}>{gewaehltRolle.description}</span>
          </div>
        ) : (
          <p className={styles.summaryNone}>Keine Rolle gewählt.</p>
        )}
      </section>

      {/* Verortungs-Split */}
      <section className={styles.summarySection}>
        <h3 className={styles.summaryHeading}>Fähigkeiten-Verortung</h3>
        <div className={styles.summaryGrid}>
          {(Object.entries(verortungGruppen) as [VerortungValue, string[]][]).map(([gruppe, caps]) => (
            <div key={gruppe} className={styles.summaryGroupCard}>
              <span
                className={styles.summaryGroupLabel}
                style={{ color: verortungColor(gruppe) }}
              >
                {gruppe}
              </span>
              {caps.length === 0 ? (
                <span className={styles.summaryNone}>—</span>
              ) : (
                <ul className={styles.summaryCapList}>
                  {caps.map((c) => (
                    <li key={c}>{c}</li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Plattformpotenzial */}
      <section className={styles.summarySection}>
        <h3 className={styles.summaryHeading}>Plattformpotenzial</h3>
        <div className={styles.potenzialTable}>
          {sortedByPotenzial.map((cap) => {
            const p = potenzial[cap]
            return (
              <div key={cap} className={styles.potenzialRow}>
                <span className={styles.potenzialCap}>{cap}</span>
                <span
                  className={styles.potenzialBadge}
                  style={{ '--badge-color': potenzialColor(p) } as React.CSSProperties}
                >
                  {p}
                </span>
              </div>
            )
          })}
        </div>
      </section>

      <button
        type="button"
        className={styles.resetButton}
        onClick={onReset}
        aria-label="Workshop neu starten"
      >
        <RotateCcw size={16} strokeWidth={2} aria-hidden />
        Neu starten
      </button>
    </div>
  )
}

// ─── Stepper-Indikatoren ──────────────────────────────────────────────────────

const STEP_LABELS: Record<Step, string> = {
  1: 'Zukunftsrolle',
  2: 'Verortung',
  3: 'Plattformpotenzial',
  4: 'Zusammenfassung',
}

function StepperBar({ current }: { current: Step }): React.ReactElement {
  const steps: Step[] = [1, 2, 3, 4]
  return (
    <nav className={styles.stepper} aria-label="Workshop-Schritte">
      {steps.map((s, idx) => {
        const done = current > s
        const active = current === s
        return (
          <div key={s} className={styles.stepItem} data-done={done || undefined} data-active={active || undefined}>
            <div className={styles.stepBubble} aria-hidden>
              {done ? <CheckCircle size={14} strokeWidth={2.5} /> : s}
            </div>
            <span className={styles.stepLabel}>{STEP_LABELS[s]}</span>
            {idx < steps.length - 1 && <div className={styles.stepConnector} aria-hidden />}
          </div>
        )
      })}
    </nav>
  )
}

// ─── Hauptkomponente ──────────────────────────────────────────────────────────

/** Strategy Lab — Vollbild-Overlay-Workshop für die Marktfolge-Etage. */
export function StrategyLab({ onClose }: { onClose: () => void }): React.ReactElement {
  const reduced = useReducedMotion()
  const cardRef = useRef<HTMLDivElement>(null)

  // ── State ──
  const [step, setStep] = useState<Step>(1)
  const [rolle, setRolle] = useState<ZukunftsrolleId | null>(null)
  const [verortung, setVerortung] = useState<VerortungMap>(defaultVerortung)
  const [potenzial, setPotenzial] = useState<PotenzialMap>(defaultPotenzial)

  // ── Entrance-Animation ──
  useEffect(() => {
    const el = cardRef.current
    if (!el) return
    if (reduced) {
      gsap.set(el, { opacity: 1, y: 0 })
    } else {
      gsap.fromTo(
        el,
        { opacity: 0, y: 28 },
        { opacity: 1, y: 0, duration: 0.48, ease: 'power2.out' }
      )
    }
  }, [reduced])

  // ── Escape-Taste ──
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  // ── Verortung-Update ──
  function handleVerortungChange(capability: string, value: VerortungValue) {
    setVerortung((prev) => ({ ...prev, [capability]: value }))
  }

  // ── Potenzial-Update ──
  function handlePotenzialChange(capability: string, value: PotenzialValue) {
    setPotenzial((prev) => ({ ...prev, [capability]: value }))
  }

  // ── Neustart ──
  function handleReset() {
    setStep(1)
    setRolle(null)
    setVerortung(defaultVerortung())
    setPotenzial(defaultPotenzial())
  }

  // ── Navigation ──
  const canGoNext = step === 1 ? rolle !== null : step < 4
  const isLastStep = step === 3

  function goNext() {
    if (isLastStep) setStep(4)
    else if (step < 4) setStep((s) => (s + 1) as Step)
  }

  function goBack() {
    if (step > 1) setStep((s) => (s - 1) as Step)
  }

  return (
    <div className={styles.overlay} role="dialog" aria-modal="true" aria-label="Strategy Lab">
      {/* Backdrop — Klick schließt */}
      <div className={styles.backdrop} onClick={onClose} aria-hidden />

      <div className={styles.card} ref={cardRef}>
        {/* ── Header ── */}
        <header className={styles.header}>
          <div className={styles.headerMeta}>
            <span className={styles.kicker}>Kapitel 03 · Marktfolge</span>
            <h2 className={styles.title}>Strategy Lab</h2>
            <p className={styles.subtitle}>Drei Entscheidungen in 60 Minuten</p>
          </div>
          <button
            type="button"
            className={styles.closeButton}
            onClick={onClose}
            aria-label="Strategy Lab schließen"
          >
            <X size={20} strokeWidth={2} aria-hidden />
          </button>
        </header>

        {/* ── Stepper ── */}
        <StepperBar current={step} />

        {/* ── Schrittinhalt ── */}
        <div className={styles.body}>
          {step === 1 && (
            <Schritt1 selected={rolle} onSelect={setRolle} />
          )}
          {step === 2 && (
            <Schritt2 verortung={verortung} onChange={handleVerortungChange} />
          )}
          {step === 3 && (
            <Schritt3 potenzial={potenzial} onChange={handlePotenzialChange} />
          )}
          {step === 4 && (
            <Zusammenfassung
              rolle={rolle}
              verortung={verortung}
              potenzial={potenzial}
              onReset={handleReset}
            />
          )}
        </div>

        {/* ── Navigation ── */}
        {step !== 4 && (
          <footer className={styles.footer}>
            <button
              type="button"
              className={styles.navButton}
              data-variant="secondary"
              onClick={goBack}
              disabled={step === 1}
              aria-label="Vorheriger Schritt"
            >
              <ChevronLeft size={18} strokeWidth={2} aria-hidden />
              Zurück
            </button>
            <button
              type="button"
              className={styles.navButton}
              data-variant="primary"
              onClick={goNext}
              disabled={!canGoNext}
              aria-label={isLastStep ? 'Zur Zusammenfassung' : 'Nächster Schritt'}
            >
              {isLastStep ? 'Zusammenfassung' : 'Weiter'}
              <ChevronRight size={18} strokeWidth={2} aria-hidden />
            </button>
          </footer>
        )}
      </div>
    </div>
  )
}
