/**
 * CoCreationCanvas — Vollbild-Overlay für interaktive Co-Creation-Sessions.
 *
 * Variante 'organisation'  → Kapitel 04 · Corporate Services
 *   Vier Dimensions-Karten mit 3-Stufen-Toggle + Sticky-Note-Chips.
 *
 * Variante 'future-interaction' → Kapitel 07 · Transformation
 *   Abschnitt A: Control-Shift-Toggles (Mensch/Hybrid/AI)
 *   Abschnitt B: 2×2-Prioritätsmatrix mit positionierten Chips
 *   Abschnitt C: Auto-generierte Zusammenfassung
 */

import { useEffect, useRef, useState, useCallback, KeyboardEvent } from 'react'
import { X, RotateCcw } from 'lucide-react'
import { gsap } from 'gsap'
import { useReducedMotion } from '../hooks/useReducedMotion'
import styles from './CoCreationCanvas.module.css'

// ─── Typen ────────────────────────────────────────────────────────────────────

type Stage = 'heute' | 'uebergang' | 'zielbild'
type ControlMode = 'mensch' | 'hybrid' | 'ai'
type Quadrant = 'low-low' | 'high-low' | 'low-high' | 'high-high'

type DimensionState = {
  stage: Stage
  notes: string[]
}

type ControlState = {
  mode: ControlMode
}

type AreaQuadrant = {
  quadrant: Quadrant
}

// ─── Konstanten ───────────────────────────────────────────────────────────────

const DIMENSIONS = [
  {
    id: 'skill',
    title: 'Skill-Aufbau',
    prompt: 'Von isolierter Weiterbildung zu kontinuierlichem Upskilling/Reskilling.',
  },
  {
    id: 'org',
    title: 'Organisationslogik',
    prompt: 'Von funktionalen Silos zu skills-getriebenen, fluiden Teams.',
  },
  {
    id: 'workforce',
    title: 'Workforce-Steuerung',
    prompt: 'Von administrativer HR zu datenbasierter, vorausschauender Steuerung.',
  },
  {
    id: 'role',
    title: 'Rolle Corporate Services',
    prompt: 'Von Verwaltung zu strategischem Enabler / Wettbewerbsvorteil.',
  },
] as const

const AREAS = [
  'Kreditvergabe',
  'Pricing',
  'Portfoliosteuerung',
  'Kundeninteraktion',
  'Compliance-Freigaben',
] as const

type AreaId = (typeof AREAS)[number]

const STAGE_LABELS: Record<Stage, string> = {
  heute: 'Heute',
  uebergang: 'Übergang',
  zielbild: 'Zielbild 2035',
}

const CONTROL_LABELS: Record<ControlMode, string> = {
  mensch: 'Mensch',
  hybrid: 'Hybrid',
  ai: 'AI',
}

const QUADRANT_CYCLE: Quadrant[] = ['high-high', 'high-low', 'low-high', 'low-low']

// ─── Hilfsfunktionen ──────────────────────────────────────────────────────────

function buildDefaultDimensions(): Record<string, DimensionState> {
  const result: Record<string, DimensionState> = {}
  for (const d of DIMENSIONS) {
    result[d.id] = { stage: 'heute', notes: [] }
  }
  return result
}

function buildDefaultControls(): Record<AreaId, ControlState> {
  const result = {} as Record<AreaId, ControlState>
  for (const a of AREAS) {
    result[a] = { mode: 'hybrid' }
  }
  return result
}

function buildDefaultQuadrants(): Record<AreaId, AreaQuadrant> {
  const result = {} as Record<AreaId, AreaQuadrant>
  for (const a of AREAS) {
    result[a] = { quadrant: 'high-high' }
  }
  return result
}

// ─── Sub-Komponenten ──────────────────────────────────────────────────────────

/** Dreistufiger Segmented-Toggle. */
function SegmentedToggle<T extends string>({
  options,
  labels,
  value,
  onChange,
  ariaLabel,
}: {
  options: readonly T[]
  labels: Record<T, string>
  value: T
  onChange: (v: T) => void
  ariaLabel: string
}): React.ReactElement {
  return (
    <div className={styles.toggle} role="group" aria-label={ariaLabel}>
      {options.map((opt) => (
        <button
          key={opt}
          type="button"
          className={styles.toggleBtn}
          data-active={value === opt || undefined}
          onClick={() => onChange(opt)}
          aria-pressed={value === opt}
        >
          {labels[opt]}
        </button>
      ))}
    </div>
  )
}

/** Sticky-Note-Eingabe + Chip-Liste für eine Dimensions-Karte. */
function NoteInput({
  notes,
  onAdd,
  onRemove,
  placeholder,
}: {
  notes: string[]
  onAdd: (text: string) => void
  onRemove: (index: number) => void
  placeholder: string
}): React.ReactElement {
  const [draft, setDraft] = useState('')

  const commit = useCallback(() => {
    const trimmed = draft.trim()
    if (trimmed.length === 0) return
    onAdd(trimmed)
    setDraft('')
  }, [draft, onAdd])

  const handleKey = useCallback(
    (e: KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') {
        e.preventDefault()
        commit()
      }
    },
    [commit],
  )

  return (
    <div className={styles.noteArea}>
      <div className={styles.noteRow}>
        <input
          className={styles.noteInput}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={handleKey}
          placeholder={placeholder}
          aria-label="Notiz eingeben"
          maxLength={80}
        />
        <button
          type="button"
          className={styles.noteAddBtn}
          onClick={commit}
          aria-label="Notiz hinzufügen"
          disabled={draft.trim().length === 0}
        >
          +
        </button>
      </div>
      {notes.length > 0 && (
        <ul className={styles.chips} role="list">
          {notes.map((note, i) => (
            <li key={i} className={styles.chip}>
              <span className={styles.chipText}>{note}</span>
              <button
                type="button"
                className={styles.chipRemove}
                onClick={() => onRemove(i)}
                aria-label={`Notiz entfernen: ${note}`}
              >
                <X size={11} strokeWidth={2.5} aria-hidden />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

/** Eine Dimensions-Karte für den Organisations-Variant. */
function DimensionCard({
  title,
  prompt,
  state,
  onStageChange,
  onNoteAdd,
  onNoteRemove,
}: {
  title: string
  prompt: string
  state: DimensionState
  onStageChange: (s: Stage) => void
  onNoteAdd: (text: string) => void
  onNoteRemove: (index: number) => void
}): React.ReactElement {
  const STAGES: readonly Stage[] = ['heute', 'uebergang', 'zielbild']

  return (
    <article className={styles.dimCard}>
      <h3 className={styles.dimCardTitle}>{title}</h3>
      <p className={styles.dimCardPrompt}>{prompt}</p>
      <SegmentedToggle
        options={STAGES}
        labels={STAGE_LABELS}
        value={state.stage}
        onChange={onStageChange}
        ariaLabel={`Transformationsstufe für ${title}`}
      />
      <NoteInput
        notes={state.notes}
        onAdd={onNoteAdd}
        onRemove={onNoteRemove}
        placeholder="Notiz eingeben, Enter zum Bestätigen…"
      />
    </article>
  )
}

// ─── Hauptkomponente ──────────────────────────────────────────────────────────

export function CoCreationCanvas({
  variant,
  onClose,
}: {
  variant: 'organisation' | 'future-interaction'
  onClose: () => void
}): React.ReactElement {
  const reducedMotion = useReducedMotion()
  const overlayRef = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)

  // Organisations-State
  const [dimensions, setDimensions] = useState<Record<string, DimensionState>>(
    buildDefaultDimensions,
  )

  // Future-Interaction-State
  const [controls, setControls] = useState<Record<AreaId, ControlState>>(buildDefaultControls)
  const [quadrants, setQuadrants] = useState<Record<AreaId, AreaQuadrant>>(buildDefaultQuadrants)

  // ── GSAP-Einblend-Animation ──
  useEffect(() => {
    if (reducedMotion) return
    const tl = gsap.timeline()
    if (overlayRef.current) {
      tl.fromTo(overlayRef.current, { opacity: 0 }, { opacity: 1, duration: 0.22, ease: 'power2.out' })
    }
    if (contentRef.current) {
      tl.fromTo(
        contentRef.current,
        { opacity: 0, y: 28, scale: 0.97 },
        { opacity: 1, y: 0, scale: 1, duration: 0.38, ease: 'power3.out' },
        '-=0.1',
      )
    }
    return () => { tl.kill() }
  }, [reducedMotion])

  // ── Escape-Taste schließt das Overlay ──
  useEffect(() => {
    const handler = (e: globalThis.KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  // ── Mutations für Organisations-Variant ──
  const setDimStage = useCallback((id: string, stage: Stage) => {
    setDimensions((prev) => ({
      ...prev,
      [id]: { ...prev[id], stage },
    }))
  }, [])

  const addNote = useCallback((id: string, text: string) => {
    setDimensions((prev) => ({
      ...prev,
      [id]: { ...prev[id], notes: [...prev[id].notes, text] },
    }))
  }, [])

  const removeNote = useCallback((id: string, index: number) => {
    setDimensions((prev) => ({
      ...prev,
      [id]: { ...prev[id], notes: prev[id].notes.filter((_, i) => i !== index) },
    }))
  }, [])

  // ── Mutations für Future-Interaction-Variant ──
  const setControl = useCallback((area: AreaId, mode: ControlMode) => {
    setControls((prev) => ({ ...prev, [area]: { mode } }))
  }, [])

  const cycleQuadrant = useCallback((area: AreaId) => {
    setQuadrants((prev) => {
      const current = prev[area].quadrant
      const idx = QUADRANT_CYCLE.indexOf(current)
      const next = QUADRANT_CYCLE[(idx + 1) % QUADRANT_CYCLE.length]
      return { ...prev, [area]: { quadrant: next } }
    })
  }, [])

  const resetAll = useCallback(() => {
    setDimensions(buildDefaultDimensions())
    setControls(buildDefaultControls())
    setQuadrants(buildDefaultQuadrants())
  }, [])

  // ── Zusammenfassungstext für Section C ──
  const aiCount = AREAS.filter((a) => controls[a].mode === 'ai').length
  const menschCount = AREAS.filter((a) => controls[a].mode === 'mensch').length
  const pilotAreas = AREAS.filter((a) => quadrants[a].quadrant === 'high-high')

  const summaryText = (() => {
    const controlParts: string[] = []
    if (aiCount > 0) controlParts.push(`${aiCount} Bereich${aiCount > 1 ? 'e' : ''} KI-geführt`)
    if (menschCount > 0) controlParts.push(`${menschCount} Mensch-geführt`)
    const hybridCount = AREAS.length - aiCount - menschCount
    if (hybridCount > 0) controlParts.push(`${hybridCount} hybrid`)
    const controlStr = controlParts.join(', ')

    const pilotStr =
      pilotAreas.length === 0
        ? 'kein Bereich im Pilot-Quadrant'
        : `Pilot zuerst: ${pilotAreas.join(', ')}`

    return `Steuerungsmodell: ${controlStr}. ${pilotStr}.`
  })()

  // ── Variant-spezifische Header-Texte ──
  const kicker =
    variant === 'organisation'
      ? 'Kapitel 04 · Corporate Services'
      : 'Kapitel 07 · Transformation'

  const title =
    variant === 'organisation'
      ? 'Co-Creation: Organisation unter Transformationsdruck'
      : 'Co-Creation: Future Interaction Model'

  const intro =
    variant === 'organisation'
      ? 'Zielbild für 2035 entlang vier Dimensionen.'
      : 'Zielbild → Kontrolle → Priorisierung → Pilot.'

  const CONTROL_MODES: readonly ControlMode[] = ['mensch', 'hybrid', 'ai']

  // Chips für Quadranten-Darstellung vorbereiten
  const quadrantChipsByQuadrant = (q: Quadrant): AreaId[] =>
    AREAS.filter((a) => quadrants[a].quadrant === q)

  return (
    <div ref={overlayRef} className={styles.overlay} role="dialog" aria-modal="true" aria-label={title}>
      <div ref={contentRef} className={styles.content}>
        {/* Header */}
        <header className={styles.header}>
          <div className={styles.headerText}>
            <span className={styles.kicker}>{kicker}</span>
            <h2 className={styles.title}>{title}</h2>
            <p className={styles.intro}>{intro}</p>
          </div>
          <div className={styles.headerActions}>
            <button
              type="button"
              className={styles.resetBtn}
              onClick={resetAll}
              aria-label="Alle Eingaben zurücksetzen"
              title="Zurücksetzen"
            >
              <RotateCcw size={14} strokeWidth={2} aria-hidden />
              Zurücksetzen
            </button>
            <button
              type="button"
              className={styles.closeBtn}
              onClick={onClose}
              aria-label="Canvas schließen"
              title="Schließen (Escape)"
            >
              <X size={18} strokeWidth={2} aria-hidden />
            </button>
          </div>
        </header>

        {/* Body — Organisations-Variant */}
        {variant === 'organisation' && (
          <div className={styles.body}>
            <div className={styles.dimGrid}>
              {DIMENSIONS.map((dim) => (
                <DimensionCard
                  key={dim.id}
                  title={dim.title}
                  prompt={dim.prompt}
                  state={dimensions[dim.id]}
                  onStageChange={(s) => setDimStage(dim.id, s)}
                  onNoteAdd={(text) => addNote(dim.id, text)}
                  onNoteRemove={(i) => removeNote(dim.id, i)}
                />
              ))}
            </div>
          </div>
        )}

        {/* Body — Future-Interaction-Variant */}
        {variant === 'future-interaction' && (
          <div className={styles.body}>
            {/* Section A: Control-Shift */}
            <section className={styles.section} aria-labelledby="ctrl-heading">
              <h3 id="ctrl-heading" className={styles.sectionHeading}>
                A · Control-Shift: Wer entscheidet künftig?
              </h3>
              <div className={styles.controlTable}>
                {AREAS.map((area) => (
                  <div key={area} className={styles.controlRow}>
                    <span className={styles.controlLabel}>{area}</span>
                    <SegmentedToggle
                      options={CONTROL_MODES}
                      labels={CONTROL_LABELS}
                      value={controls[area].mode}
                      onChange={(m) => setControl(area, m)}
                      ariaLabel={`Entscheidungsträger für ${area}`}
                    />
                  </div>
                ))}
              </div>
            </section>

            {/* Section B: Priorisierungs-Matrix */}
            <section className={styles.section} aria-labelledby="matrix-heading">
              <h3 id="matrix-heading" className={styles.sectionHeading}>
                B · Priorisierung: Was zuerst?
              </h3>
              <p className={styles.matrixHint}>
                Klick auf einen Bereich-Chip wechselt den Quadranten.
              </p>
              <div className={styles.matrix} role="img" aria-label="2x2 Prioritätsmatrix: X-Achse Machbarkeit, Y-Achse Impact">
                {/* Achsen-Labels */}
                <div className={styles.matrixYLabel}>Impact</div>
                <div className={styles.matrixXLabel}>Machbarkeit</div>

                {/* Hoch-Impact / Niedrig-Machbarkeit */}
                <div
                  className={styles.matrixQuadrant}
                  data-quadrant="low-high"
                  aria-label="Hoher Impact, geringe Machbarkeit"
                >
                  <span className={styles.quadrantLabel}>Hoher Impact<br />Geringe Machbarkeit</span>
                  {quadrantChipsByQuadrant('low-high').map((a) => (
                    <button
                      key={a}
                      type="button"
                      className={styles.matrixChip}
                      onClick={() => cycleQuadrant(a)}
                      aria-label={`${a}: Quadrant wechseln`}
                    >
                      {a}
                    </button>
                  ))}
                </div>

                {/* Hoch-Impact / Hoch-Machbarkeit — Pilot-Quadrant */}
                <div
                  className={styles.matrixQuadrant}
                  data-quadrant="high-high"
                  aria-label="Hoher Impact, hohe Machbarkeit – Pilot zuerst"
                >
                  <span className={styles.quadrantLabel}>
                    Pilot zuerst
                  </span>
                  {quadrantChipsByQuadrant('high-high').map((a) => (
                    <button
                      key={a}
                      type="button"
                      className={styles.matrixChip}
                      data-pilot
                      onClick={() => cycleQuadrant(a)}
                      aria-label={`${a}: Quadrant wechseln`}
                    >
                      {a}
                    </button>
                  ))}
                </div>

                {/* Niedrig-Impact / Niedrig-Machbarkeit */}
                <div
                  className={styles.matrixQuadrant}
                  data-quadrant="low-low"
                  aria-label="Geringer Impact, geringe Machbarkeit"
                >
                  <span className={styles.quadrantLabel}>Niedriger Impact<br />Geringe Machbarkeit</span>
                  {quadrantChipsByQuadrant('low-low').map((a) => (
                    <button
                      key={a}
                      type="button"
                      className={styles.matrixChip}
                      onClick={() => cycleQuadrant(a)}
                      aria-label={`${a}: Quadrant wechseln`}
                    >
                      {a}
                    </button>
                  ))}
                </div>

                {/* Niedrig-Impact / Hoch-Machbarkeit */}
                <div
                  className={styles.matrixQuadrant}
                  data-quadrant="high-low"
                  aria-label="Geringer Impact, hohe Machbarkeit"
                >
                  <span className={styles.quadrantLabel}>Geringer Impact<br />Hohe Machbarkeit</span>
                  {quadrantChipsByQuadrant('high-low').map((a) => (
                    <button
                      key={a}
                      type="button"
                      className={styles.matrixChip}
                      onClick={() => cycleQuadrant(a)}
                      aria-label={`${a}: Quadrant wechseln`}
                    >
                      {a}
                    </button>
                  ))}
                </div>
              </div>
            </section>

            {/* Section C: Zusammenfassung */}
            <section className={styles.section} aria-labelledby="summary-heading">
              <h3 id="summary-heading" className={styles.sectionHeading}>
                C · Zusammenfassung
              </h3>
              <p className={styles.summaryText}>{summaryText}</p>
            </section>
          </div>
        )}
      </div>
    </div>
  )
}
