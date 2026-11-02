import { useState } from 'react'
import {
  ArrowLeft,
  BarChart3,
  Check,
  ChevronRight,
  Database,
  Lightbulb,
  Scale,
  Settings,
  Sparkles,
  Users,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import styles from './TransformationOffering.module.css'
import { ImageSlot } from './ImageSlot'
import { useLang, type Lang } from '../i18n/LanguageContext'
import type { Chapter } from '../data/chapters'
import {
  DELOITTE_OFFERING,
  FRAMEWORK_DIMENSIONS,
  OFFERING_IMAGE_SRC,
  OFFERING_CONTACTS,
  type FrameworkDimension,
} from '../data/offering'
import { useChapterEdits, imageKey, contactNameKey, contactRoleKey } from '../data/chapterEdits'

// ─────────────────────────────────────────────────────────────────────────────
// TransformationOffering — Kapitel „Transformation mit Deloitte" (Glas-Aufzug).
//
// Zwei Bühnen:
//   1) Das Deloitte AI Transformation Framework: das offizielle Rad mit sechs
//      Dimensionen (Strategie/People/Prozesse/Governance/Daten/Technologie,
//      Leitfragen WARUM/WER/WIE/WOMIT) als klickbare SVG-Grafik + Detailtext
//      zur gewählten Dimension + „Warum Deloitte".
//   2) „Unser Offering": ein Platzhalter-Bild (Offering-Übersicht) + die
//      Ansprechpartner (Partner & Directors). Bild, Namen, Rollen und Fotos
//      sind PLATZHALTER und werden im Änderungsbereich (CMS) gepflegt/hochgeladen.
// ─────────────────────────────────────────────────────────────────────────────

const DIM_ICONS: Record<string, LucideIcon> = {
  Lightbulb,
  Users,
  Settings,
  Scale,
  Database,
  BarChart3,
}

const STR = {
  de: {
    back: 'Übersicht',
    backStage: 'Zurück',
    kapitel: 'Kapitel',
    namePlaceholder: 'Name',
    toOffering: 'Zu unserem Offering',
    offeringTitle: 'Unser Offering',
    wheelAria: 'AI Transformation Framework: Dimension wählen',
    dimHint: 'Dimension im Rad wählen',
  },
  en: {
    back: 'Overview',
    backStage: 'Back',
    kapitel: 'Chapter',
    namePlaceholder: 'Name',
    toOffering: 'To our offering',
    offeringTitle: 'Our offering',
    wheelAria: 'AI Transformation Framework: choose a dimension',
    dimHint: 'Choose a dimension in the wheel',
  },
  fr: {
    back: 'Vue d’ensemble',
    backStage: 'Retour',
    kapitel: 'Chapitre',
    namePlaceholder: 'Nom',
    toOffering: 'Vers notre offre',
    offeringTitle: 'Notre offre',
    wheelAria: 'AI Transformation Framework : choisir une dimension',
    dimHint: 'Choisir une dimension dans la roue',
  },
} as const

type Props = { chapter: Chapter; onBack: () => void }

// ── Geometrie des Framework-Rads (SVG) ──────────────────────────────────────
const C = 380 // Zentrum (viewBox 760x760)

/** Punkt auf dem Kreis: Winkel in Grad im Uhrzeigersinn ab 12 Uhr. */
function pt(a: number, r: number): [number, number] {
  const rad = (a * Math.PI) / 180
  return [C + r * Math.sin(rad), C - r * Math.cos(rad)]
}

/** Donut-Segment zwischen den Winkeln a0..a1 und den Radien r0 (innen)..r1 (außen). */
function segPath(a0: number, a1: number, r0: number, r1: number): string {
  const [x0, y0] = pt(a0, r1)
  const [x1, y1] = pt(a1, r1)
  const [x2, y2] = pt(a1, r0)
  const [x3, y3] = pt(a0, r0)
  return `M${x0} ${y0} A${r1} ${r1} 0 0 1 ${x1} ${y1} L${x2} ${y2} A${r0} ${r0} 0 0 0 ${x3} ${y3} Z`
}

/** Bogen für Segment-Beschriftung (textPath); bei unteren Segmenten gedreht. */
function labelArc(a0: number, a1: number, r: number, flip: boolean): string {
  const b0 = a0 + 5
  const b1 = a1 - 5
  const [x0, y0] = pt(flip ? b1 : b0, r)
  const [x1, y1] = pt(flip ? b0 : b1, r)
  return `M${x0} ${y0} A${r} ${r} 0 0 ${flip ? 0 : 1} ${x1} ${y1}`
}

/** Segment-Mittelwinkel in der unteren Bildhälfte → Beschriftung drehen. */
function isFlipped(mid: number): boolean {
  return mid > 100 && mid < 260
}

function FrameworkWheel({
  selectedId,
  onSelect,
  lang,
  ariaLabel,
}: {
  selectedId: string
  onSelect: (id: string) => void
  lang: Lang
  ariaLabel: string
}): React.ReactElement {
  // Leitfragen auf dem hellen Außenring: Winkel + Text (aus den Dimensionen).
  const questions: Array<{ a: number; text: string }> = [
    { a: 0, text: FRAMEWORK_DIMENSIONS[0].frage[lang] },
    { a: 60, text: FRAMEWORK_DIMENSIONS[1].frage[lang] },
    { a: 150, text: FRAMEWORK_DIMENSIONS[2].frage[lang] },
    { a: 270, text: FRAMEWORK_DIMENSIONS[4].frage[lang] },
  ]
  return (
    <svg viewBox="0 0 760 760" className={styles.fwSvg} role="group" aria-label={ariaLabel}>
      {/* Heller Fragen-Ring */}
      <circle cx={C} cy={C} r={374} fill="rgba(27, 28, 26, 0.06)" />
      {questions.map((q) => {
        const flip = isFlipped(q.a)
        const [x, y] = pt(q.a, 356)
        return (
          <text
            key={q.a}
            transform={`translate(${x} ${y}) rotate(${flip ? q.a - 180 : q.a})`}
            textAnchor="middle"
            dominantBaseline="middle"
            className={styles.fwQuestion}
          >
            {q.text.toUpperCase()}
          </text>
        )
      })}

      {FRAMEWORK_DIMENSIONS.map((d, i) => {
        const a0 = i * 60 - 30
        const a1 = a0 + 60
        const mid = a0 + 30
        const flip = isFlipped(mid)
        const selected = d.id === selectedId
        const Icon = DIM_ICONS[d.icon] ?? Sparkles
        const [dx, dy] = selected ? pt(mid, 10) : [C, C]
        const [ix, iy] = pt(mid, 202)
        return (
          <g
            key={d.id}
            className={styles.fwSeg}
            transform={`translate(${dx - C} ${dy - C})`}
            role="button"
            tabIndex={0}
            aria-pressed={selected}
            aria-label={`${d.frage[lang]} · ${d.label[lang]}`}
            onClick={() => onSelect(d.id)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                onSelect(d.id)
              }
            }}
          >
            <path d={segPath(a0, a1, 256, 342)} fill={d.color} stroke="#fff" strokeWidth={3} />
            <path d={segPath(a0, a1, 154, 250)} fill={d.colorInner} stroke="#fff" strokeWidth={3} />
            <defs>
              <path id={`fw-arc-${d.id}`} d={labelArc(a0, a1, flip ? 306 : 292, flip)} />
            </defs>
            <text className={styles.fwSegLabel} dominantBaseline="middle">
              <textPath href={`#fw-arc-${d.id}`} startOffset="50%" textAnchor="middle">
                {d.label[lang]}
              </textPath>
            </text>
            <circle cx={ix} cy={iy} r={27} fill="none" stroke="#fff" strokeWidth={2} />
            <Icon size={26} x={ix - 13} y={iy - 13} color="#fff" strokeWidth={1.9} />
          </g>
        )
      })}

      {/* Zentrum */}
      <circle cx={C} cy={C} r={122} fill="#ffffff" />
      <text x={C} y={C - 10} textAnchor="middle" className={styles.fwCenter}>
        AI Transformation
      </text>
      <text x={C} y={C + 22} textAnchor="middle" className={styles.fwCenter}>
        Framework
      </text>
    </svg>
  )
}

export function TransformationOffering({ chapter, onBack }: Props): React.ReactElement {
  const { lang } = useLang()
  const t = STR[lang]
  const o = DELOITTE_OFFERING
  const { edits } = useChapterEdits()
  const [stage, setStage] = useState<1 | 2>(1)
  const [dimId, setDimId] = useState<string>(FRAMEWORK_DIMENSIONS[0].id)
  const offeringImg = edits.texts[imageKey(OFFERING_IMAGE_SRC)] ?? OFFERING_IMAGE_SRC
  const dim: FrameworkDimension =
    FRAMEWORK_DIMENSIONS.find((d) => d.id === dimId) ?? FRAMEWORK_DIMENSIONS[0]
  const DimIcon = DIM_ICONS[dim.icon] ?? Sparkles

  return (
    <div className={styles.wrap}>
      <header className={styles.topbar}>
        <button
          type="button"
          className={styles.backBtn}
          onClick={stage === 2 ? () => setStage(1) : onBack}
        >
          <ArrowLeft size={16} strokeWidth={2.2} aria-hidden />
          {stage === 2 ? t.backStage : t.back}
        </button>
        <span className={styles.chapterTag}>
          {t.kapitel} {chapter.kapitel}
        </span>
      </header>

      <div className={styles.scroll}>
        <div className={styles.inner}>
          {stage === 1 ? (
            <>
              <span className={styles.kicker}>{o.kicker[lang]}</span>
              <h1 className={styles.title}>{o.title[lang]}</h1>
              <p className={styles.lead}>{o.lead[lang]}</p>

              <div className={styles.fwGrid}>
                <div className={styles.fwWheel}>
                  <FrameworkWheel
                    selectedId={dimId}
                    onSelect={setDimId}
                    lang={lang}
                    ariaLabel={t.wheelAria}
                  />
                </div>
                <aside className={styles.fwDetail} aria-live="polite">
                  <span className={styles.fwDetailKicker} style={{ color: dim.color }}>
                    <DimIcon size={15} strokeWidth={2.2} aria-hidden />
                    {dim.frage[lang]} · {dim.label[lang]}
                  </span>
                  <h2 className={styles.fwDetailTitle}>{dim.label[lang]}</h2>
                  <p className={styles.fwDetailText}>{dim.text[lang]}</p>
                  <span className={styles.fwDetailHint}>{t.dimHint}</span>
                </aside>
              </div>

              <section className={styles.why}>
                <span className={styles.whyTitle}>{o.whyTitle[lang]}</span>
                <ul className={styles.whyList}>
                  {o.why.map((w, i) => (
                    <li className={styles.whyItem} key={i}>
                      <span className={styles.whyCheck} aria-hidden>
                        <Check size={13} strokeWidth={3} />
                      </span>
                      {w[lang]}
                    </li>
                  ))}
                </ul>
              </section>

              <div className={styles.stageNav}>
                <span className={styles.stageNavLabel}>{t.toOffering}</span>
                <button
                  type="button"
                  className={styles.chevronBtn}
                  onClick={() => setStage(2)}
                  aria-label={t.toOffering}
                >
                  <ChevronRight size={28} strokeWidth={2.4} aria-hidden />
                </button>
              </div>
            </>
          ) : (
            <>
              <span className={styles.kicker}>{o.kicker[lang]}</span>
              <h1 className={styles.title}>{t.offeringTitle}</h1>

              {/* Offering-Übersicht — Platzhalter, im Änderungsbereich hochladbar. */}
              <div className={styles.offeringSlot}>
                <ImageSlot
                  src={offeringImg}
                  alt={o.offeringLabel[lang]}
                  fit="contain"
                  caption={o.offeringLabel[lang]}
                />
              </div>

              {/* Ansprechpartner (Partner & Directors) — Platzhalter, im CMS pflegbar. */}
              <h2 className={styles.kontaktTitle}>{o.kontaktTitle[lang]}</h2>
              <div className={styles.contactGrid}>
                {OFFERING_CONTACTS.map((c, i) => {
                  const photo = edits.texts[imageKey(c.imageSrc)] ?? c.imageSrc
                  const name = edits.texts[contactNameKey(i)] ?? ''
                  const role = edits.texts[contactRoleKey(i, lang)] ?? c.defaultRole[lang]
                  return (
                    <div className={styles.contactCard} key={i}>
                      <div className={styles.contactPhoto}>
                        <ImageSlot src={photo} alt={name || t.namePlaceholder} fit="cover" />
                      </div>
                      <span className={styles.contactName}>{name || t.namePlaceholder}</span>
                      <span className={styles.contactRole}>{role}</span>
                      {!name && <span className={styles.contactHint}>{o.contactHint[lang]}</span>}
                    </div>
                  )
                })}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
