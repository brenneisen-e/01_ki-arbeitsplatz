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
 *
 * Zweisprachig (DE/EN): interne Werte (Stage, ControlMode, Dimension-/Area-IDs)
 * bleiben stabile Identifier; nur die Anzeige-Labels werden übersetzt.
 */

import { useEffect, useRef, useState, useCallback, KeyboardEvent } from 'react'
import { X, RotateCcw } from 'lucide-react'
import { gsap } from 'gsap'
import { useReducedMotion } from '../hooks/useReducedMotion'
import { useLang, type Lang } from '../i18n/LanguageContext'
import styles from './CoCreationCanvas.module.css'

// ─── Typen ────────────────────────────────────────────────────────────────────

type Stage = 'heute' | 'uebergang' | 'zielbild'
type ControlMode = 'mensch' | 'hybrid' | 'ai'
type Quadrant = 'low-low' | 'high-low' | 'low-high' | 'high-high'

type DimensionState = {
  /** Aktuell gewählte Spalte — neue Notizen landen hier. */
  stage: Stage
  /** Notizen je Zeitraum (Kanban-Spalten). */
  notes: Record<Stage, string[]>
}

const STAGES: readonly Stage[] = ['heute', 'uebergang', 'zielbild']

type ControlState = {
  mode: ControlMode
}

type AreaQuadrant = {
  quadrant: Quadrant
}

// ─── Konstanten (stabile Identifier) ────────────────────────────────────────────

const DIMENSION_IDS = ['skill', 'org', 'workforce', 'role'] as const
type DimensionId = (typeof DIMENSION_IDS)[number]

const AREAS = [
  'Kreditvergabe',
  'Pricing',
  'Portfoliosteuerung',
  'Kundeninteraktion',
  'Compliance-Freigaben',
] as const

type AreaId = (typeof AREAS)[number]

const QUADRANT_CYCLE: Quadrant[] = ['high-high', 'high-low', 'low-high', 'low-low']

// ─── Übersetzungen ──────────────────────────────────────────────────────────────

type CanvasStrings = {
  stageLabels: Record<Stage, string>
  controlLabels: Record<ControlMode, string>
  dimensions: Record<DimensionId, { title: string; prompt: string }>
  areas: Record<AreaId, string>
  kicker: { organisation: string; 'future-interaction': string }
  title: { organisation: string; 'future-interaction': string }
  intro: { organisation: string; 'future-interaction': string }
  reset: string
  resetAria: string
  close: string
  closeTitle: string
  notePlaceholder: string
  noteInputAria: string
  noteAddAria: string
  noteRemoveAria: (note: string) => string
  dimStageAria: (title: string) => string
  sectionA: string
  controlAria: (area: string) => string
  sectionB: string
  matrixHint: string
  matrixAria: string
  yLabel: string
  xLabel: string
  quadrantAria: Record<Quadrant, string>
  quadrantLabel: Record<Quadrant, React.ReactNode>
  chipAria: (area: string) => string
  sectionC: string
  summary: (parts: { ai: number; mensch: number; hybrid: number; pilot: string[] }) => string
}

const STR: Record<Lang, CanvasStrings> = {
  de: {
    stageLabels: { heute: 'Heute', uebergang: 'Übergang', zielbild: 'Zielbild 2035' },
    controlLabels: { mensch: 'Mensch', hybrid: 'Hybrid', ai: 'AI' },
    dimensions: {
      skill: { title: 'Skill-Aufbau', prompt: 'Von isolierter Weiterbildung zu kontinuierlichem Upskilling/Reskilling.' },
      org: { title: 'Organisationslogik', prompt: 'Von funktionalen Silos zu skills-getriebenen, fluiden Teams.' },
      workforce: { title: 'Workforce-Steuerung', prompt: 'Von administrativer HR zu datenbasierter, vorausschauender Steuerung.' },
      role: { title: 'Rolle Corporate Services', prompt: 'Von Verwaltung zu strategischem Enabler / Wettbewerbsvorteil.' },
    },
    areas: {
      Kreditvergabe: 'Kreditvergabe',
      Pricing: 'Pricing',
      Portfoliosteuerung: 'Portfoliosteuerung',
      Kundeninteraktion: 'Kundeninteraktion',
      'Compliance-Freigaben': 'Compliance-Freigaben',
    },
    kicker: { organisation: 'Kapitel 04 · Organisationsentwicklung (HR & Corporate Services)', 'future-interaction': 'Kapitel 07 · Transformation' },
    title: {
      organisation: 'Co-Creation: Organisation unter Transformationsdruck',
      'future-interaction': 'Co-Creation: Future Interaction Model',
    },
    intro: {
      organisation: 'Zielbild für 2035 entlang vier Dimensionen.',
      'future-interaction': 'Zielbild → Kontrolle → Priorisierung → Pilot.',
    },
    reset: 'Zurücksetzen',
    resetAria: 'Alle Eingaben zurücksetzen',
    close: 'Canvas schließen',
    closeTitle: 'Schließen (Escape)',
    notePlaceholder: 'Notiz eingeben, Enter zum Bestätigen…',
    noteInputAria: 'Notiz eingeben',
    noteAddAria: 'Notiz hinzufügen',
    noteRemoveAria: (note) => `Notiz entfernen: ${note}`,
    dimStageAria: (title) => `Transformationsstufe für ${title}`,
    sectionA: 'A · Control-Shift: Wer entscheidet künftig?',
    controlAria: (area) => `Entscheidungsträger für ${area}`,
    sectionB: 'B · Priorisierung: Was zuerst?',
    matrixHint: 'Klick auf einen Bereich-Chip wechselt den Quadranten.',
    matrixAria: '2x2 Prioritätsmatrix: X-Achse Machbarkeit, Y-Achse Impact',
    yLabel: 'Impact',
    xLabel: 'Machbarkeit',
    quadrantAria: {
      'low-high': 'Hoher Impact, geringe Machbarkeit',
      'high-high': 'Hoher Impact, hohe Machbarkeit – Pilot zuerst',
      'low-low': 'Geringer Impact, geringe Machbarkeit',
      'high-low': 'Geringer Impact, hohe Machbarkeit',
    },
    quadrantLabel: {
      'low-high': (<>Hoher Impact<br />Geringe Machbarkeit</>),
      'high-high': 'Pilot zuerst',
      'low-low': (<>Niedriger Impact<br />Geringe Machbarkeit</>),
      'high-low': (<>Geringer Impact<br />Hohe Machbarkeit</>),
    },
    chipAria: (area) => `${area}: Quadrant wechseln`,
    sectionC: 'C · Zusammenfassung',
    summary: ({ ai, mensch, hybrid, pilot }) => {
      const controlParts: string[] = []
      if (ai > 0) controlParts.push(`${ai} Bereich${ai > 1 ? 'e' : ''} KI-geführt`)
      if (mensch > 0) controlParts.push(`${mensch} Mensch-geführt`)
      if (hybrid > 0) controlParts.push(`${hybrid} hybrid`)
      const pilotStr = pilot.length === 0 ? 'kein Bereich im Pilot-Quadrant' : `Pilot zuerst: ${pilot.join(', ')}`
      return `Steuerungsmodell: ${controlParts.join(', ')}. ${pilotStr}.`
    },
  },
  en: {
    stageLabels: { heute: 'Today', uebergang: 'Transition', zielbild: 'Target 2035' },
    controlLabels: { mensch: 'Human', hybrid: 'Hybrid', ai: 'AI' },
    dimensions: {
      skill: { title: 'Skill building', prompt: 'From isolated training to continuous upskilling/reskilling.' },
      org: { title: 'Organisational logic', prompt: 'From functional silos to skills-driven, fluid teams.' },
      workforce: { title: 'Workforce management', prompt: 'From administrative HR to data-driven, forward-looking steering.' },
      role: { title: 'Role of Corporate Services', prompt: 'From administration to strategic enabler / competitive advantage.' },
    },
    areas: {
      Kreditvergabe: 'Lending',
      Pricing: 'Pricing',
      Portfoliosteuerung: 'Portfolio management',
      Kundeninteraktion: 'Customer interaction',
      'Compliance-Freigaben': 'Compliance approvals',
    },
    kicker: { organisation: 'Chapter 04 · Organisational Development (HR & Corporate Services)', 'future-interaction': 'Chapter 07 · Transformation' },
    title: {
      organisation: 'Co-creation: organisation under transformation pressure',
      'future-interaction': 'Co-creation: future interaction model',
    },
    intro: {
      organisation: 'A 2035 target picture along four dimensions.',
      'future-interaction': 'Target picture → control → prioritisation → pilot.',
    },
    reset: 'Reset',
    resetAria: 'Reset all inputs',
    close: 'Close the canvas',
    closeTitle: 'Close (Escape)',
    notePlaceholder: 'Type a note, Enter to confirm…',
    noteInputAria: 'Type a note',
    noteAddAria: 'Add note',
    noteRemoveAria: (note) => `Remove note: ${note}`,
    dimStageAria: (title) => `Transformation stage for ${title}`,
    sectionA: 'A · Control shift: who decides in future?',
    controlAria: (area) => `Decision maker for ${area}`,
    sectionB: 'B · Prioritisation: what first?',
    matrixHint: 'Click an area chip to switch quadrant.',
    matrixAria: '2x2 prioritisation matrix: x-axis feasibility, y-axis impact',
    yLabel: 'Impact',
    xLabel: 'Feasibility',
    quadrantAria: {
      'low-high': 'High impact, low feasibility',
      'high-high': 'High impact, high feasibility – pilot first',
      'low-low': 'Low impact, low feasibility',
      'high-low': 'Low impact, high feasibility',
    },
    quadrantLabel: {
      'low-high': (<>High impact<br />Low feasibility</>),
      'high-high': 'Pilot first',
      'low-low': (<>Low impact<br />Low feasibility</>),
      'high-low': (<>Low impact<br />High feasibility</>),
    },
    chipAria: (area) => `${area}: switch quadrant`,
    sectionC: 'C · Summary',
    summary: ({ ai, mensch, hybrid, pilot }) => {
      const controlParts: string[] = []
      if (ai > 0) controlParts.push(`${ai} area${ai > 1 ? 's' : ''} AI-led`)
      if (mensch > 0) controlParts.push(`${mensch} human-led`)
      if (hybrid > 0) controlParts.push(`${hybrid} hybrid`)
      const pilotStr = pilot.length === 0 ? 'no area in the pilot quadrant' : `Pilot first: ${pilot.join(', ')}`
      return `Steering model: ${controlParts.join(', ')}. ${pilotStr}.`
    },
  },
}

// ─── Hilfsfunktionen ──────────────────────────────────────────────────────────

function buildDefaultDimensions(): Record<DimensionId, DimensionState> {
  const result = {} as Record<DimensionId, DimensionState>
  for (const d of DIMENSION_IDS) {
    result[d] = { stage: 'heute', notes: { heute: [], uebergang: [], zielbild: [] } }
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

/** Notiz-Eingabe (Enter/Plus). Die Notiz landet in der aktiven Kanban-Spalte. */
function NoteInput({
  onAdd,
  placeholder,
  inputAria,
  addAria,
}: {
  onAdd: (text: string) => void
  placeholder: string
  inputAria: string
  addAria: string
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
    <div className={styles.noteRow}>
      <input
        className={styles.noteInput}
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={handleKey}
        placeholder={placeholder}
        aria-label={inputAria}
        maxLength={80}
      />
      <button
        type="button"
        className={styles.noteAddBtn}
        onClick={commit}
        aria-label={addAria}
        disabled={draft.trim().length === 0}
      >
        +
      </button>
    </div>
  )
}

/** Kanban-Brett: je Zeitraum eine farbcodierte Spalte mit Notiz-Chips. */
function KanbanBoard({
  notes,
  stageLabels,
  activeStage,
  onRemove,
  removeAria,
}: {
  notes: Record<Stage, string[]>
  stageLabels: Record<Stage, string>
  activeStage: Stage
  onRemove: (stage: Stage, index: number) => void
  removeAria: (note: string) => string
}): React.ReactElement {
  return (
    <div className={styles.kanban}>
      {STAGES.map((s) => (
        <div
          key={s}
          className={styles.kanbanCol}
          data-stage={s}
          data-active={s === activeStage || undefined}
        >
          <div className={styles.kanbanHead}>
            <span className={styles.kanbanDot} aria-hidden />
            <span className={styles.kanbanHeadLabel}>{stageLabels[s]}</span>
            <span className={styles.kanbanCount}>{notes[s].length}</span>
          </div>
          <ul className={styles.kanbanList} role="list">
            {notes[s].map((note, i) => (
              <li key={i} className={styles.kanbanChip}>
                <span className={styles.chipText}>{note}</span>
                <button
                  type="button"
                  className={styles.chipRemove}
                  onClick={() => onRemove(s, i)}
                  aria-label={removeAria(note)}
                >
                  <X size={11} strokeWidth={2.5} aria-hidden />
                </button>
              </li>
            ))}
            {notes[s].length === 0 && <li className={styles.kanbanEmpty} aria-hidden>—</li>}
          </ul>
        </div>
      ))}
    </div>
  )
}

/** Eine Dimensions-Karte für den Organisations-Variant. */
function DimensionCard({
  title,
  prompt,
  state,
  stageLabels,
  onStageChange,
  onNoteAdd,
  onNoteRemove,
  t,
}: {
  title: string
  prompt: string
  state: DimensionState
  stageLabels: Record<Stage, string>
  onStageChange: (s: Stage) => void
  onNoteAdd: (text: string) => void
  onNoteRemove: (stage: Stage, index: number) => void
  t: CanvasStrings
}): React.ReactElement {
  return (
    <article className={styles.dimCard}>
      <h3 className={styles.dimCardTitle}>{title}</h3>
      <p className={styles.dimCardPrompt}>{prompt}</p>
      <SegmentedToggle
        options={STAGES}
        labels={stageLabels}
        value={state.stage}
        onChange={onStageChange}
        ariaLabel={t.dimStageAria(title)}
      />
      <NoteInput
        onAdd={onNoteAdd}
        placeholder={t.notePlaceholder}
        inputAria={t.noteInputAria}
        addAria={t.noteAddAria}
      />
      <KanbanBoard
        notes={state.notes}
        stageLabels={stageLabels}
        activeStage={state.stage}
        onRemove={onNoteRemove}
        removeAria={t.noteRemoveAria}
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
  const { lang } = useLang()
  const t = STR[lang]
  const overlayRef = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)

  // Organisations-State
  const [dimensions, setDimensions] = useState<Record<DimensionId, DimensionState>>(
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
  const setDimStage = useCallback((id: DimensionId, stage: Stage) => {
    setDimensions((prev) => ({
      ...prev,
      [id]: { ...prev[id], stage },
    }))
  }, [])

  const addNote = useCallback((id: DimensionId, text: string) => {
    setDimensions((prev) => {
      const dim = prev[id]
      const s = dim.stage
      return { ...prev, [id]: { ...dim, notes: { ...dim.notes, [s]: [...dim.notes[s], text] } } }
    })
  }, [])

  const removeNote = useCallback((id: DimensionId, stage: Stage, index: number) => {
    setDimensions((prev) => {
      const dim = prev[id]
      return {
        ...prev,
        [id]: { ...dim, notes: { ...dim.notes, [stage]: dim.notes[stage].filter((_, i) => i !== index) } },
      }
    })
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
  const hybridCount = AREAS.length - aiCount - menschCount
  const pilotAreas = AREAS.filter((a) => quadrants[a].quadrant === 'high-high')

  const summaryText = t.summary({
    ai: aiCount,
    mensch: menschCount,
    hybrid: hybridCount,
    pilot: pilotAreas.map((a) => t.areas[a]),
  })

  // ── Variant-spezifische Header-Texte ──
  const kicker = t.kicker[variant]
  const title = t.title[variant]
  const intro = t.intro[variant]

  const CONTROL_MODES: readonly ControlMode[] = ['mensch', 'hybrid', 'ai']

  // Chips für Quadranten-Darstellung vorbereiten
  const quadrantChipsByQuadrant = (q: Quadrant): AreaId[] =>
    AREAS.filter((a) => quadrants[a].quadrant === q)

  const renderQuadrant = (q: Quadrant): React.ReactElement => (
    <div className={styles.matrixQuadrant} data-quadrant={q} aria-label={t.quadrantAria[q]}>
      <span className={styles.quadrantLabel}>{t.quadrantLabel[q]}</span>
      {quadrantChipsByQuadrant(q).map((a) => (
        <button
          key={a}
          type="button"
          className={styles.matrixChip}
          data-pilot={q === 'high-high' || undefined}
          onClick={() => cycleQuadrant(a)}
          aria-label={t.chipAria(t.areas[a])}
        >
          {t.areas[a]}
        </button>
      ))}
    </div>
  )

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
              aria-label={t.resetAria}
              title={t.reset}
            >
              <RotateCcw size={14} strokeWidth={2} aria-hidden />
              {t.reset}
            </button>
            <button
              type="button"
              className={styles.closeBtn}
              onClick={onClose}
              aria-label={t.close}
              title={t.closeTitle}
            >
              <X size={18} strokeWidth={2} aria-hidden />
            </button>
          </div>
        </header>

        {/* Body — Organisations-Variant */}
        {variant === 'organisation' && (
          <div className={styles.body}>
            <div className={styles.dimGrid}>
              {DIMENSION_IDS.map((id) => (
                <DimensionCard
                  key={id}
                  title={t.dimensions[id].title}
                  prompt={t.dimensions[id].prompt}
                  state={dimensions[id]}
                  stageLabels={t.stageLabels}
                  onStageChange={(s) => setDimStage(id, s)}
                  onNoteAdd={(text) => addNote(id, text)}
                  onNoteRemove={(stage, i) => removeNote(id, stage, i)}
                  t={t}
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
                {t.sectionA}
              </h3>
              <div className={styles.controlTable}>
                {AREAS.map((area) => (
                  <div key={area} className={styles.controlRow}>
                    <span className={styles.controlLabel}>{t.areas[area]}</span>
                    <SegmentedToggle
                      options={CONTROL_MODES}
                      labels={t.controlLabels}
                      value={controls[area].mode}
                      onChange={(m) => setControl(area, m)}
                      ariaLabel={t.controlAria(t.areas[area])}
                    />
                  </div>
                ))}
              </div>
            </section>

            {/* Section B: Priorisierungs-Matrix */}
            <section className={styles.section} aria-labelledby="matrix-heading">
              <h3 id="matrix-heading" className={styles.sectionHeading}>
                {t.sectionB}
              </h3>
              <p className={styles.matrixHint}>{t.matrixHint}</p>
              <div className={styles.matrix} role="img" aria-label={t.matrixAria}>
                {/* Achsen-Labels */}
                <div className={styles.matrixYLabel}>{t.yLabel}</div>
                <div className={styles.matrixXLabel}>{t.xLabel}</div>

                {renderQuadrant('low-high')}
                {renderQuadrant('high-high')}
                {renderQuadrant('low-low')}
                {renderQuadrant('high-low')}
              </div>
            </section>

            {/* Section C: Zusammenfassung */}
            <section className={styles.section} aria-labelledby="summary-heading">
              <h3 id="summary-heading" className={styles.sectionHeading}>
                {t.sectionC}
              </h3>
              <p className={styles.summaryText}>{summaryText}</p>
            </section>
          </div>
        )}
      </div>
    </div>
  )
}
