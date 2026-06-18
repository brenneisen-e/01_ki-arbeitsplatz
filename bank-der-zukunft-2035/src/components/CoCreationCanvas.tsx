/**
 * CoCreationCanvas — Vollbild-Overlay für interaktive Co-Creation-Sessions.
 *
 * Variante 'organisation'  → Kapitel 04 · Corporate Services
 *   Vier Dimensions-Karten mit Kanban-Brettern. Notizen werden je Spalte über
 *   ein Plus-Symbol (Modal) angelegt und per Drag-and-Drop zwischen den Spalten
 *   (Heute / Übergang / Zielbild) verschoben.
 *
 * Variante 'future-interaction' → Kapitel 07 · Transformation
 *   Abschnitt A: Control-Shift-Slider (Mensch ↔ Hybrid ↔ AI)
 *   Abschnitt B: 2×2-Prioritätsmatrix; Bereiche per Drag-and-Drop platziert
 *   Abschnitt C: Auto-generierte Zusammenfassung
 *
 * Zweisprachig (DE/EN): interne Werte (Stage, ControlMode, Dimension-/Area-IDs)
 * bleiben stabile Identifier; nur die Anzeige-Labels werden übersetzt.
 */

import { useEffect, useRef, useState, useCallback, KeyboardEvent } from 'react'
import { X, RotateCcw, Plus, GripVertical } from 'lucide-react'
import { gsap } from 'gsap'
import { useReducedMotion } from '../hooks/useReducedMotion'
import { useLang, type Lang } from '../i18n/LanguageContext'
import styles from './CoCreationCanvas.module.css'

// ─── Typen ────────────────────────────────────────────────────────────────────

type Stage = 'heute' | 'uebergang' | 'zielbild'
type ControlMode = 'mensch' | 'hybrid' | 'ai'
type Quadrant = 'low-low' | 'high-low' | 'low-high' | 'high-high'
/** Platzierung eines Bereichs: in einem Quadranten oder im Pool (außerhalb des Graphen). */
type Placement = Quadrant | 'pool'

type DimensionState = {
  /** Notizen je Zeitraum (Kanban-Spalten). */
  notes: Record<Stage, string[]>
}

const STAGES: readonly Stage[] = ['heute', 'uebergang', 'zielbild']

type ControlState = {
  mode: ControlMode
}

type AreaPlacement = {
  placement: Placement
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

const CONTROL_MODES: readonly ControlMode[] = ['mensch', 'hybrid', 'ai']

/** Klick-Reihenfolge (Fallback zum Drag-and-Drop): Pool → Quadranten → zurück. */
const PLACEMENT_CYCLE: Placement[] = ['pool', 'high-high', 'high-low', 'low-high', 'low-low']

const isAreaId = (s: string): s is AreaId => (AREAS as readonly string[]).includes(s)

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
  kanbanHint: string
  notePlaceholder: string
  noteInputAria: string
  noteRemoveAria: (note: string) => string
  noteAddToAria: (stage: string) => string
  noteModalTitle: string
  noteAddConfirm: string
  noteCancel: string
  sectionA: string
  controlAria: (area: string) => string
  sectionB: string
  matrixHint: string
  matrixAria: string
  yLabel: string
  xLabel: string
  quadrantAria: Record<Quadrant, string>
  quadrantLabel: Record<Quadrant, React.ReactNode>
  pilotTag: string
  poolLabel: string
  poolEmpty: string
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
    kanbanHint: 'Über das Plus-Symbol Notizen anlegen und per Drag-and-Drop zwischen den Spalten verschieben.',
    notePlaceholder: 'Begriff oder Stichwort eingeben…',
    noteInputAria: 'Notiz eingeben',
    noteRemoveAria: (note) => `Notiz entfernen: ${note}`,
    noteAddToAria: (stage) => `Notiz hinzufügen zu ${stage}`,
    noteModalTitle: 'Neue Notiz',
    noteAddConfirm: 'Hinzufügen',
    noteCancel: 'Abbrechen',
    sectionA: 'A · Control-Shift: Wer entscheidet künftig?',
    controlAria: (area) => `Entscheidungsträger für ${area}`,
    sectionB: 'B · Priorisierung: Was zuerst?',
    matrixHint: 'Bereiche per Drag-and-Drop in die Quadranten ziehen — oder anklicken, um durchzuschalten.',
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
      'high-high': (<>Hoher Impact<br />Hohe Machbarkeit</>),
      'low-low': (<>Niedriger Impact<br />Geringe Machbarkeit</>),
      'high-low': (<>Geringer Impact<br />Hohe Machbarkeit</>),
    },
    pilotTag: 'Pilot zuerst',
    poolLabel: 'Bereiche',
    poolEmpty: 'Alle Bereiche platziert',
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
    kanbanHint: 'Use the plus icon to add notes and drag-and-drop them between columns.',
    notePlaceholder: 'Enter a term or keyword…',
    noteInputAria: 'Type a note',
    noteRemoveAria: (note) => `Remove note: ${note}`,
    noteAddToAria: (stage) => `Add note to ${stage}`,
    noteModalTitle: 'New note',
    noteAddConfirm: 'Add',
    noteCancel: 'Cancel',
    sectionA: 'A · Control shift: who decides in future?',
    controlAria: (area) => `Decision maker for ${area}`,
    sectionB: 'B · Prioritisation: what first?',
    matrixHint: 'Drag areas into the quadrants — or click to cycle through them.',
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
      'high-high': (<>High impact<br />High feasibility</>),
      'low-low': (<>Low impact<br />Low feasibility</>),
      'high-low': (<>Low impact<br />High feasibility</>),
    },
    pilotTag: 'Pilot first',
    poolLabel: 'Areas',
    poolEmpty: 'All areas placed',
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
    result[d] = { notes: { heute: [], uebergang: [], zielbild: [] } }
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

function buildDefaultPlacements(): Record<AreaId, AreaPlacement> {
  const result = {} as Record<AreaId, AreaPlacement>
  for (const a of AREAS) {
    // Start: alle Bereiche liegen im Pool außerhalb des Graphen und werden aktiv platziert.
    result[a] = { placement: 'pool' }
  }
  return result
}

// ─── Sub-Komponenten ──────────────────────────────────────────────────────────

/** Dreistufiger Slider: zieh- und klickbare Skala (z. B. Mensch ↔ Hybrid ↔ AI). */
function ControlSlider<T extends string>({
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
  const idx = Math.max(0, options.indexOf(value))
  const max = options.length - 1
  const pct = max === 0 ? 0 : (idx / max) * 100

  return (
    <div className={styles.slider}>
      <input
        type="range"
        className={styles.sliderInput}
        min={0}
        max={max}
        step={1}
        value={idx}
        onChange={(e) => onChange(options[Number(e.currentTarget.value)])}
        aria-label={ariaLabel}
        aria-valuetext={labels[value]}
        style={{ '--slider-pct': `${pct}%` } as React.CSSProperties}
      />
      <div className={styles.sliderLabels}>
        {options.map((opt) => (
          <button
            key={opt}
            type="button"
            className={styles.sliderLabel}
            data-active={opt === value || undefined}
            onClick={() => onChange(opt)}
            tabIndex={-1}
          >
            {labels[opt]}
          </button>
        ))}
      </div>
    </div>
  )
}

/** Modal zum Anlegen einer neuen Notiz für eine bestimmte Kanban-Spalte. */
function NoteModal({
  title,
  placeholder,
  inputAria,
  confirmLabel,
  cancelLabel,
  onConfirm,
  onCancel,
}: {
  title: string
  placeholder: string
  inputAria: string
  confirmLabel: string
  cancelLabel: string
  onConfirm: (text: string) => void
  onCancel: () => void
}): React.ReactElement {
  const [text, setText] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  const commit = useCallback(() => {
    const trimmed = text.trim()
    if (trimmed.length === 0) return
    onConfirm(trimmed)
  }, [text, onConfirm])

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
    <div
      className={styles.modalOverlay}
      role="dialog"
      aria-modal="true"
      aria-label={title}
      onClick={onCancel}
    >
      <div className={styles.modalCard} onClick={(e) => e.stopPropagation()}>
        <h3 className={styles.modalTitle}>{title}</h3>
        <input
          ref={inputRef}
          className={styles.modalInput}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKey}
          placeholder={placeholder}
          aria-label={inputAria}
          maxLength={80}
        />
        <div className={styles.modalActions}>
          <button type="button" className={styles.modalCancel} onClick={onCancel}>
            {cancelLabel}
          </button>
          <button
            type="button"
            className={styles.modalConfirm}
            onClick={commit}
            disabled={text.trim().length === 0}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}

/**
 * Kanban-Brett: je Zeitraum eine farbcodierte Spalte. Notizen werden über das
 * Plus-Symbol angelegt (Modal) und per Drag-and-Drop zwischen den Spalten verschoben.
 */
function KanbanBoard({
  notes,
  stageLabels,
  onRemove,
  onAddRequest,
  onMoveNote,
  removeAria,
  addToAria,
}: {
  notes: Record<Stage, string[]>
  stageLabels: Record<Stage, string>
  onRemove: (stage: Stage, index: number) => void
  onAddRequest: (stage: Stage) => void
  onMoveNote: (from: Stage, index: number, to: Stage) => void
  removeAria: (note: string) => string
  addToAria: (stage: string) => string
}): React.ReactElement {
  const [drag, setDrag] = useState<{ stage: Stage; index: number } | null>(null)
  const [overStage, setOverStage] = useState<Stage | null>(null)

  return (
    <div className={styles.kanban}>
      {STAGES.map((s) => (
        <div
          key={s}
          className={styles.kanbanCol}
          data-stage={s}
          data-dragover={(overStage === s && drag !== null) || undefined}
          onDragOver={(e) => {
            if (drag === null) return
            e.preventDefault()
            e.dataTransfer.dropEffect = 'move'
            if (overStage !== s) setOverStage(s)
          }}
          onDrop={(e) => {
            e.preventDefault()
            if (drag !== null && drag.stage !== s) onMoveNote(drag.stage, drag.index, s)
            setDrag(null)
            setOverStage(null)
          }}
        >
          <div className={styles.kanbanHead}>
            <span className={styles.kanbanDot} aria-hidden />
            <span className={styles.kanbanHeadLabel}>{stageLabels[s]}</span>
            <span className={styles.kanbanCount}>{notes[s].length}</span>
            <button
              type="button"
              className={styles.kanbanAdd}
              onClick={() => onAddRequest(s)}
              aria-label={addToAria(stageLabels[s])}
              title={addToAria(stageLabels[s])}
            >
              <Plus size={13} strokeWidth={2.5} aria-hidden />
            </button>
          </div>
          <ul className={styles.kanbanList} role="list">
            {notes[s].map((note, i) => (
              <li
                key={i}
                className={styles.kanbanChip}
                draggable
                data-dragging={(drag?.stage === s && drag?.index === i) || undefined}
                onDragStart={(e) => {
                  e.dataTransfer.effectAllowed = 'move'
                  e.dataTransfer.setData('text/plain', note)
                  setDrag({ stage: s, index: i })
                }}
                onDragEnd={() => {
                  setDrag(null)
                  setOverStage(null)
                }}
              >
                <span className={styles.kanbanGrip} aria-hidden>
                  <GripVertical size={13} strokeWidth={2} />
                </span>
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
            {notes[s].length === 0 && (
              <li className={styles.kanbanEmpty} aria-hidden>—</li>
            )}
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
  onNoteRemove,
  onAddRequest,
  onMoveNote,
  t,
}: {
  title: string
  prompt: string
  state: DimensionState
  stageLabels: Record<Stage, string>
  onNoteRemove: (stage: Stage, index: number) => void
  onAddRequest: (stage: Stage) => void
  onMoveNote: (from: Stage, index: number, to: Stage) => void
  t: CanvasStrings
}): React.ReactElement {
  return (
    <article className={styles.dimCard}>
      <h3 className={styles.dimCardTitle}>{title}</h3>
      <p className={styles.dimCardPrompt}>{prompt}</p>
      <KanbanBoard
        notes={state.notes}
        stageLabels={stageLabels}
        onRemove={onNoteRemove}
        onAddRequest={onAddRequest}
        onMoveNote={onMoveNote}
        removeAria={t.noteRemoveAria}
        addToAria={t.noteAddToAria}
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
  // Offenes Notiz-Modal (Ziel-Dimension + Spalte)
  const [addTarget, setAddTarget] = useState<{ dim: DimensionId; stage: Stage } | null>(null)

  // Future-Interaction-State
  const [controls, setControls] = useState<Record<AreaId, ControlState>>(buildDefaultControls)
  const [placements, setPlacements] = useState<Record<AreaId, AreaPlacement>>(buildDefaultPlacements)
  const [draggingArea, setDraggingArea] = useState<AreaId | null>(null)
  const [dragOverZone, setDragOverZone] = useState<Placement | null>(null)

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

  // ── Escape-Taste: erst Modal schließen, sonst das Overlay ──
  useEffect(() => {
    const handler = (e: globalThis.KeyboardEvent) => {
      if (e.key !== 'Escape') return
      if (addTarget !== null) {
        setAddTarget(null)
        return
      }
      onClose()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose, addTarget])

  // ── Mutations für Organisations-Variant ──
  const addNote = useCallback((id: DimensionId, stage: Stage, text: string) => {
    setDimensions((prev) => {
      const dim = prev[id]
      return { ...prev, [id]: { ...dim, notes: { ...dim.notes, [stage]: [...dim.notes[stage], text] } } }
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

  const moveNote = useCallback((id: DimensionId, from: Stage, index: number, to: Stage) => {
    if (from === to) return
    setDimensions((prev) => {
      const dim = prev[id]
      const note = dim.notes[from][index]
      if (note === undefined) return prev
      return {
        ...prev,
        [id]: {
          ...dim,
          notes: {
            ...dim.notes,
            [from]: dim.notes[from].filter((_, i) => i !== index),
            [to]: [...dim.notes[to], note],
          },
        },
      }
    })
  }, [])

  // ── Mutations für Future-Interaction-Variant ──
  const setControl = useCallback((area: AreaId, mode: ControlMode) => {
    setControls((prev) => ({ ...prev, [area]: { mode } }))
  }, [])

  const setPlacement = useCallback((area: AreaId, placement: Placement) => {
    setPlacements((prev) => (prev[area].placement === placement ? prev : { ...prev, [area]: { placement } }))
  }, [])

  const cyclePlacement = useCallback((area: AreaId) => {
    setPlacements((prev) => {
      const current = prev[area].placement
      const idx = PLACEMENT_CYCLE.indexOf(current)
      const next = PLACEMENT_CYCLE[(idx + 1) % PLACEMENT_CYCLE.length]
      return { ...prev, [area]: { placement: next } }
    })
  }, [])

  const resetAll = useCallback(() => {
    setDimensions(buildDefaultDimensions())
    setControls(buildDefaultControls())
    setPlacements(buildDefaultPlacements())
    setAddTarget(null)
  }, [])

  // ── Zusammenfassungstext für Section C ──
  const aiCount = AREAS.filter((a) => controls[a].mode === 'ai').length
  const menschCount = AREAS.filter((a) => controls[a].mode === 'mensch').length
  const hybridCount = AREAS.length - aiCount - menschCount
  const pilotAreas = AREAS.filter((a) => placements[a].placement === 'high-high')

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

  // Chips je Platzierung vorbereiten (Quadranten + Pool außerhalb des Graphen)
  const chipsInQuadrant = (q: Quadrant): AreaId[] =>
    AREAS.filter((a) => placements[a].placement === q)

  const poolAreas: AreaId[] = AREAS.filter((a) => placements[a].placement === 'pool')

  // Drop-Zonen (Quadranten + Pool) als Drag-and-Drop-Ziele
  const dropZoneProps = (target: Placement) => ({
    onDragOver: (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault()
      e.dataTransfer.dropEffect = 'move'
      if (dragOverZone !== target) setDragOverZone(target)
    },
    onDrop: (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault()
      const dropped = e.dataTransfer.getData('text/plain')
      const area = isAreaId(dropped) ? dropped : draggingArea
      if (area) setPlacement(area, target)
      setDraggingArea(null)
      setDragOverZone(null)
    },
    'data-dragover': dragOverZone === target || undefined,
  })

  const renderChip = (a: AreaId, isPilot: boolean): React.ReactElement => (
    <button
      key={a}
      type="button"
      className={styles.matrixChip}
      data-pilot={isPilot || undefined}
      data-dragging={draggingArea === a || undefined}
      draggable
      onDragStart={(e) => {
        e.dataTransfer.effectAllowed = 'move'
        e.dataTransfer.setData('text/plain', a)
        setDraggingArea(a)
      }}
      onDragEnd={() => {
        setDraggingArea(null)
        setDragOverZone(null)
      }}
      onClick={() => cyclePlacement(a)}
      aria-label={t.chipAria(t.areas[a])}
    >
      {t.areas[a]}
    </button>
  )

  const renderQuadrant = (q: Quadrant): React.ReactElement => (
    <div
      className={styles.matrixQuadrant}
      data-quadrant={q}
      aria-label={t.quadrantAria[q]}
      {...dropZoneProps(q)}
    >
      <div className={styles.quadrantHead}>
        <span className={styles.quadrantLabel}>{t.quadrantLabel[q]}</span>
        {q === 'high-high' && <span className={styles.pilotTag}>{t.pilotTag}</span>}
      </div>
      {chipsInQuadrant(q).map((a) => renderChip(a, q === 'high-high'))}
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
            <p className={styles.kanbanHint}>{t.kanbanHint}</p>
            <div className={styles.dimGrid}>
              {DIMENSION_IDS.map((id) => (
                <DimensionCard
                  key={id}
                  title={t.dimensions[id].title}
                  prompt={t.dimensions[id].prompt}
                  state={dimensions[id]}
                  stageLabels={t.stageLabels}
                  onNoteRemove={(stage, i) => removeNote(id, stage, i)}
                  onAddRequest={(stage) => setAddTarget({ dim: id, stage })}
                  onMoveNote={(from, i, to) => moveNote(id, from, i, to)}
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
                    <ControlSlider
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
              <div className={styles.matrixPool} {...dropZoneProps('pool')}>
                <div className={styles.matrixPoolHead}>
                  <span className={styles.matrixPoolLabel}>{t.poolLabel}</span>
                  <span className={styles.matrixPoolCount}>{poolAreas.length}</span>
                </div>
                {poolAreas.length > 0 ? (
                  <div className={styles.matrixPoolChips}>
                    {poolAreas.map((a) => renderChip(a, false))}
                  </div>
                ) : (
                  <span className={styles.matrixPoolEmpty}>{t.poolEmpty}</span>
                )}
              </div>
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

      {/* Notiz-Modal (Organisations-Variant) */}
      {addTarget && (
        <NoteModal
          title={`${t.noteModalTitle} · ${t.dimensions[addTarget.dim].title} · ${t.stageLabels[addTarget.stage]}`}
          placeholder={t.notePlaceholder}
          inputAria={t.noteInputAria}
          confirmLabel={t.noteAddConfirm}
          cancelLabel={t.noteCancel}
          onConfirm={(text) => {
            addNote(addTarget.dim, addTarget.stage, text)
            setAddTarget(null)
          }}
          onCancel={() => setAddTarget(null)}
        />
      )}
    </div>
  )
}
