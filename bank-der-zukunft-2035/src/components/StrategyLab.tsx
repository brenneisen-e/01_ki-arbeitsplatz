/**
 * StrategyLab — Marktfolge Strategy Lab: Drei Entscheidungen in 60 Minuten
 *
 * Ein geführter 3-Schritt-Entscheidungsworkshop für die Marktfolge-Etage.
 * Schritt 1: Zukunftsrolle wählen (Single-Select).
 * Schritt 2: Fähigkeiten verorten (Intern / Hybrid / Ökosystem).
 * Schritt 3: Plattformpotenzial bewerten (Hoch / Mittel / Gering).
 * Zusammenfassung: Ergebnisse gesammelt anzeigen, Neustart möglich.
 *
 * Zweisprachig (DE/EN): interne Werte (VerortungValue, PotenzialValue,
 * Capability-IDs) bleiben stabile Identifier; nur die Anzeige-Labels werden
 * übersetzt.
 *
 * Kapitel 03 · Marktfolge
 */

import { useEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'
import { X, ChevronRight, ChevronLeft, RotateCcw, CheckCircle } from 'lucide-react'
import { useReducedMotion } from '../hooks/useReducedMotion'
import { useLang, type Lang } from '../i18n/LanguageContext'
import styles from './StrategyLab.module.css'

// ─── Typen ────────────────────────────────────────────────────────────────────

type ZukunftsrolleId = 'dunkelverarbeitung' | 'orchestrator' | 'baas'
type VerortungValue = 'Intern' | 'Hybrid' | 'Ökosystem'
type PotenzialValue = 'Hoch' | 'Mittel' | 'Gering'
type Step = 1 | 2 | 3 | 4

// ─── Konstanten (stabile Identifier) ────────────────────────────────────────────

const ROLE_IDS: ZukunftsrolleId[] = ['dunkelverarbeitung', 'orchestrator', 'baas']
const CAPABILITY_IDS = [
  'Kreditabwicklung',
  'KYC / AML',
  'Zahlungsverkehr',
  'Dokumentenmanagement',
  'Sicherheitenverwaltung',
] as const
type CapabilityId = (typeof CAPABILITY_IDS)[number]

const VERORTUNG_OPTIONS: VerortungValue[] = ['Intern', 'Hybrid', 'Ökosystem']
const POTENZIAL_OPTIONS: PotenzialValue[] = ['Hoch', 'Mittel', 'Gering']

// ─── Übersetzungen ──────────────────────────────────────────────────────────────

type LabStrings = {
  overlayAria: string
  kicker: string
  title: string
  subtitle: string
  close: string
  steps: Record<Step, string>
  step1Question: string
  step2Question: string
  step3Question: string
  summaryQuestion: string
  roles: Record<ZukunftsrolleId, { title: string; description: string }>
  capabilities: Record<CapabilityId, string>
  verortung: Record<VerortungValue, string>
  potenzial: Record<PotenzialValue, string>
  summaryRole: string
  summaryPlacement: string
  summaryPotential: string
  noRole: string
  reset: string
  resetAria: string
  back: string
  next: string
  summaryBtn: string
  prevStepAria: string
  nextStepAria: string
  toSummaryAria: string
  placementAria: (cap: string) => string
  potentialAria: (cap: string) => string
}

const STR: Record<Lang, LabStrings> = {
  de: {
    overlayAria: 'Strategy Lab',
    kicker: 'Kapitel 03 · Marktfolge',
    title: 'Strategy Lab',
    subtitle: 'Drei Entscheidungen in 60 Minuten',
    close: 'Strategy Lab schließen',
    steps: { 1: 'Zukunftsrolle', 2: 'Verortung', 3: 'Plattformpotenzial', 4: 'Zusammenfassung' },
    step1Question: 'Welche Zukunftsrolle für die Marktfolge?',
    step2Question: 'Was bleibt intern, was geht ins Ökosystem?',
    step3Question: 'Wo liegt Plattformpotenzial?',
    summaryQuestion: 'Ihre Entscheidungen im Überblick',
    roles: {
      dunkelverarbeitung: {
        title: 'Autonome Dunkelverarbeitung',
        description:
          'Standardvorfälle (Kredit, KYC, Abwicklung) laufen vollautonom E2E — ohne manuellen Eingriff.',
      },
      orchestrator: {
        title: 'Orchestrator eines Service-Ökosystems',
        description:
          'Externe Plattformen und Utilities übernehmen den Standardbetrieb; die Marktfolge steuert das Ökosystem.',
      },
      baas: {
        title: 'Skalierbare Banking-as-a-Service-Plattform',
        description:
          'Standardisierte Services werden als eigenständiges Geschäftsmodell für Drittanbieter bereitgestellt.',
      },
    },
    capabilities: {
      Kreditabwicklung: 'Kreditabwicklung',
      'KYC / AML': 'KYC / AML',
      Zahlungsverkehr: 'Zahlungsverkehr',
      Dokumentenmanagement: 'Dokumentenmanagement',
      Sicherheitenverwaltung: 'Sicherheitenverwaltung',
    },
    verortung: { Intern: 'Intern', Hybrid: 'Hybrid', Ökosystem: 'Ökosystem' },
    potenzial: { Hoch: 'Hoch', Mittel: 'Mittel', Gering: 'Gering' },
    summaryRole: 'Zukunftsrolle',
    summaryPlacement: 'Fähigkeiten-Verortung',
    summaryPotential: 'Plattformpotenzial',
    noRole: 'Keine Rolle gewählt.',
    reset: 'Neu starten',
    resetAria: 'Workshop neu starten',
    back: 'Zurück',
    next: 'Weiter',
    summaryBtn: 'Zusammenfassung',
    prevStepAria: 'Vorheriger Schritt',
    nextStepAria: 'Nächster Schritt',
    toSummaryAria: 'Zur Zusammenfassung',
    placementAria: (cap) => `Verortung für ${cap}`,
    potentialAria: (cap) => `Plattformpotenzial für ${cap}`,
  },
  en: {
    overlayAria: 'Strategy Lab',
    kicker: 'Chapter 03 · Operations',
    title: 'Strategy Lab',
    subtitle: 'Three decisions in 60 minutes',
    close: 'Close the Strategy Lab',
    steps: { 1: 'Future role', 2: 'Placement', 3: 'Platform potential', 4: 'Summary' },
    step1Question: 'Which future role for operations?',
    step2Question: 'What stays in-house, what moves into the ecosystem?',
    step3Question: 'Where is the platform potential?',
    summaryQuestion: 'Your decisions at a glance',
    roles: {
      dunkelverarbeitung: {
        title: 'Autonomous straight-through processing',
        description:
          'Standard cases (credit, KYC, settlement) run fully autonomously E2E — without manual intervention.',
      },
      orchestrator: {
        title: 'Orchestrator of a service ecosystem',
        description:
          'External platforms and utilities take over standard operations; operations steer the ecosystem.',
      },
      baas: {
        title: 'Scalable banking-as-a-service platform',
        description:
          'Standardised services are provided as a standalone business model for third parties.',
      },
    },
    capabilities: {
      Kreditabwicklung: 'Credit processing',
      'KYC / AML': 'KYC / AML',
      Zahlungsverkehr: 'Payments',
      Dokumentenmanagement: 'Document management',
      Sicherheitenverwaltung: 'Collateral management',
    },
    verortung: { Intern: 'Internal', Hybrid: 'Hybrid', Ökosystem: 'Ecosystem' },
    potenzial: { Hoch: 'High', Mittel: 'Medium', Gering: 'Low' },
    summaryRole: 'Future role',
    summaryPlacement: 'Capability placement',
    summaryPotential: 'Platform potential',
    noRole: 'No role selected.',
    reset: 'Restart',
    resetAria: 'Restart the workshop',
    back: 'Back',
    next: 'Next',
    summaryBtn: 'Summary',
    prevStepAria: 'Previous step',
    nextStepAria: 'Next step',
    toSummaryAria: 'To the summary',
    placementAria: (cap) => `Placement for ${cap}`,
    potentialAria: (cap) => `Platform potential for ${cap}`,
  },
}

type VerortungMap = Record<CapabilityId, VerortungValue>
type PotenzialMap = Record<CapabilityId, PotenzialValue>

function defaultVerortung(): VerortungMap {
  return Object.fromEntries(CAPABILITY_IDS.map((c) => [c, 'Hybrid'])) as VerortungMap
}

function defaultPotenzial(): PotenzialMap {
  return Object.fromEntries(CAPABILITY_IDS.map((c) => [c, 'Mittel'])) as PotenzialMap
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
  labels,
  value,
  onChange,
  colorFn,
  ariaLabel,
}: {
  options: T[]
  labels: Record<T, string>
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
            {labels[opt]}
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
  t,
}: {
  selected: ZukunftsrolleId | null
  onSelect: (id: ZukunftsrolleId) => void
  t: LabStrings
}): React.ReactElement {
  return (
    <div className={styles.stepContent}>
      <p className={styles.stepQuestion}>{t.step1Question}</p>
      <div className={styles.roleGrid}>
        {ROLE_IDS.map((id) => {
          const role = t.roles[id]
          const active = selected === id
          return (
            <button
              key={id}
              type="button"
              className={styles.roleCard}
              data-active={active || undefined}
              onClick={() => onSelect(id)}
              aria-pressed={active}
            >
              <span className={styles.roleTitle}>{role.title}</span>
              <span className={styles.roleDesc}>{role.description}</span>
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
  t,
}: {
  verortung: VerortungMap
  onChange: (capability: CapabilityId, value: VerortungValue) => void
  t: LabStrings
}): React.ReactElement {
  return (
    <div className={styles.stepContent}>
      <p className={styles.stepQuestion}>{t.step2Question}</p>
      <div className={styles.capabilityList}>
        {CAPABILITY_IDS.map((cap) => (
          <div key={cap} className={styles.capabilityRow}>
            <span className={styles.capabilityLabel}>{t.capabilities[cap]}</span>
            <SegmentedToggle
              options={VERORTUNG_OPTIONS}
              labels={t.verortung}
              value={verortung[cap]}
              onChange={(v) => onChange(cap, v)}
              colorFn={verortungColor}
              ariaLabel={t.placementAria(t.capabilities[cap])}
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
  t,
}: {
  potenzial: PotenzialMap
  onChange: (capability: CapabilityId, value: PotenzialValue) => void
  t: LabStrings
}): React.ReactElement {
  return (
    <div className={styles.stepContent}>
      <p className={styles.stepQuestion}>{t.step3Question}</p>
      <div className={styles.capabilityList}>
        {CAPABILITY_IDS.map((cap) => (
          <div key={cap} className={styles.capabilityRow}>
            <span className={styles.capabilityLabel}>{t.capabilities[cap]}</span>
            <SegmentedToggle
              options={POTENZIAL_OPTIONS}
              labels={t.potenzial}
              value={potenzial[cap]}
              onChange={(v) => onChange(cap, v)}
              colorFn={potenzialColor}
              ariaLabel={t.potentialAria(t.capabilities[cap])}
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
  t,
}: {
  rolle: ZukunftsrolleId | null
  verortung: VerortungMap
  potenzial: PotenzialMap
  onReset: () => void
  t: LabStrings
}): React.ReactElement {
  const gewaehltRolle = rolle ? t.roles[rolle] : null

  // Gruppierten Verortungs-Listen aufbauen
  const verortungGruppen: Record<VerortungValue, CapabilityId[]> = { Intern: [], Hybrid: [], Ökosystem: [] }
  CAPABILITY_IDS.forEach((cap) => {
    verortungGruppen[verortung[cap]].push(cap)
  })

  // Kapazitäten nach Potenzial sortieren
  const sortedByPotenzial = [...CAPABILITY_IDS].sort((a, b) => {
    const order: Record<PotenzialValue, number> = { Hoch: 0, Mittel: 1, Gering: 2 }
    return order[potenzial[a]] - order[potenzial[b]]
  })

  return (
    <div className={styles.stepContent}>
      <p className={styles.stepQuestion}>{t.summaryQuestion}</p>

      {/* Zukunftsrolle */}
      <section className={styles.summarySection}>
        <h3 className={styles.summaryHeading}>{t.summaryRole}</h3>
        {gewaehltRolle ? (
          <div className={styles.summaryRoleCard}>
            <span className={styles.summaryRoleTitle}>{gewaehltRolle.title}</span>
            <span className={styles.summaryRoleDesc}>{gewaehltRolle.description}</span>
          </div>
        ) : (
          <p className={styles.summaryNone}>{t.noRole}</p>
        )}
      </section>

      {/* Verortungs-Split */}
      <section className={styles.summarySection}>
        <h3 className={styles.summaryHeading}>{t.summaryPlacement}</h3>
        <div className={styles.summaryGrid}>
          {(Object.entries(verortungGruppen) as [VerortungValue, CapabilityId[]][]).map(([gruppe, caps]) => (
            <div key={gruppe} className={styles.summaryGroupCard}>
              <span
                className={styles.summaryGroupLabel}
                style={{ color: verortungColor(gruppe) }}
              >
                {t.verortung[gruppe]}
              </span>
              {caps.length === 0 ? (
                <span className={styles.summaryNone}>—</span>
              ) : (
                <ul className={styles.summaryCapList}>
                  {caps.map((c) => (
                    <li key={c}>{t.capabilities[c]}</li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Plattformpotenzial */}
      <section className={styles.summarySection}>
        <h3 className={styles.summaryHeading}>{t.summaryPotential}</h3>
        <div className={styles.potenzialTable}>
          {sortedByPotenzial.map((cap) => {
            const p = potenzial[cap]
            return (
              <div key={cap} className={styles.potenzialRow}>
                <span className={styles.potenzialCap}>{t.capabilities[cap]}</span>
                <span
                  className={styles.potenzialBadge}
                  style={{ '--badge-color': potenzialColor(p) } as React.CSSProperties}
                >
                  {t.potenzial[p]}
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
        aria-label={t.resetAria}
      >
        <RotateCcw size={16} strokeWidth={2} aria-hidden />
        {t.reset}
      </button>
    </div>
  )
}

// ─── Stepper-Indikatoren ──────────────────────────────────────────────────────

function StepperBar({ current, t }: { current: Step; t: LabStrings }): React.ReactElement {
  const steps: Step[] = [1, 2, 3, 4]
  return (
    <nav className={styles.stepper} aria-label={t.steps[4]}>
      {steps.map((s, idx) => {
        const done = current > s
        const active = current === s
        return (
          <div key={s} className={styles.stepItem} data-done={done || undefined} data-active={active || undefined}>
            <div className={styles.stepBubble} aria-hidden>
              {done ? <CheckCircle size={14} strokeWidth={2.5} /> : s}
            </div>
            <span className={styles.stepLabel}>{t.steps[s]}</span>
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
  const { lang } = useLang()
  const t = STR[lang]
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
  function handleVerortungChange(capability: CapabilityId, value: VerortungValue) {
    setVerortung((prev) => ({ ...prev, [capability]: value }))
  }

  // ── Potenzial-Update ──
  function handlePotenzialChange(capability: CapabilityId, value: PotenzialValue) {
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
    <div className={styles.overlay} role="dialog" aria-modal="true" aria-label={t.overlayAria}>
      {/* Backdrop — Klick schließt */}
      <div className={styles.backdrop} onClick={onClose} aria-hidden />

      <div className={styles.card} ref={cardRef}>
        {/* ── Header ── */}
        <header className={styles.header}>
          <div className={styles.headerMeta}>
            <span className={styles.kicker}>{t.kicker}</span>
            <h2 className={styles.title}>{t.title}</h2>
            <p className={styles.subtitle}>{t.subtitle}</p>
          </div>
          <button
            type="button"
            className={styles.closeButton}
            onClick={onClose}
            aria-label={t.close}
          >
            <X size={20} strokeWidth={2} aria-hidden />
          </button>
        </header>

        {/* ── Stepper ── */}
        <StepperBar current={step} t={t} />

        {/* ── Schrittinhalt ── */}
        <div className={styles.body}>
          {step === 1 && (
            <Schritt1 selected={rolle} onSelect={setRolle} t={t} />
          )}
          {step === 2 && (
            <Schritt2 verortung={verortung} onChange={handleVerortungChange} t={t} />
          )}
          {step === 3 && (
            <Schritt3 potenzial={potenzial} onChange={handlePotenzialChange} t={t} />
          )}
          {step === 4 && (
            <Zusammenfassung
              rolle={rolle}
              verortung={verortung}
              potenzial={potenzial}
              onReset={handleReset}
              t={t}
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
              aria-label={t.prevStepAria}
            >
              <ChevronLeft size={18} strokeWidth={2} aria-hidden />
              {t.back}
            </button>
            <button
              type="button"
              className={styles.navButton}
              data-variant="primary"
              onClick={goNext}
              disabled={!canGoNext}
              aria-label={isLastStep ? t.toSummaryAria : t.nextStepAria}
            >
              {isLastStep ? t.summaryBtn : t.next}
              <ChevronRight size={18} strokeWidth={2} aria-hidden />
            </button>
          </footer>
        )}
      </div>
    </div>
  )
}
