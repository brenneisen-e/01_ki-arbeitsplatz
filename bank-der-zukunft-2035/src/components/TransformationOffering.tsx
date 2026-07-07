import { useState } from 'react'
import {
  ArrowLeft,
  Check,
  ChevronRight,
  Compass,
  GitBranch,
  Layers,
  Network,
  ShieldCheck,
  Sparkles,
  Users,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import styles from './TransformationOffering.module.css'
import { ImageSlot } from './ImageSlot'
import { useLang } from '../i18n/LanguageContext'
import type { Chapter } from '../data/chapters'
import { DELOITTE_OFFERING, OFFERING_IMAGE_SRC, OFFERING_CONTACTS } from '../data/offering'
import { useChapterEdits, imageKey, contactNameKey, contactRoleKey } from '../data/chapterEdits'

// ─────────────────────────────────────────────────────────────────────────────
// TransformationOffering — Kapitel „Transformation mit Deloitte" (Glas-Aufzug).
//
// Zwei Bühnen:
//   1) Der Transformationsansatz: Deloitte-Offering als Bausteine + „Warum
//      Deloitte" (bleibt inhaltlich fix).
//   2) „Unser Offering": ein Platzhalter-Bild (Offering-Übersicht) + die
//      Ansprechpartner (Partner & Directors). Bild, Namen, Rollen und Fotos
//      sind PLATZHALTER und werden im Änderungsbereich (CMS) gepflegt/hochgeladen.
// ─────────────────────────────────────────────────────────────────────────────

const PILLAR_ICONS: Record<string, LucideIcon> = {
  Compass,
  Network,
  GitBranch,
  ShieldCheck,
  Users,
  Layers,
}

const STR = {
  de: {
    back: 'Übersicht',
    backStage: 'Zurück',
    kapitel: 'Kapitel',
    namePlaceholder: 'Name',
    toOffering: 'Zu unserem Offering',
    offeringTitle: 'Unser Offering',
  },
  en: {
    back: 'Overview',
    backStage: 'Back',
    kapitel: 'Chapter',
    namePlaceholder: 'Name',
    toOffering: 'To our offering',
    offeringTitle: 'Our offering',
  },
} as const

type Props = { chapter: Chapter; onBack: () => void }

// Lucide-Icon per Name auflösen (einfarbig, currentColor).
function PillarIcon({ name }: { name: string }): React.ReactElement {
  const C = PILLAR_ICONS[name] ?? Sparkles
  return <C size={22} strokeWidth={1.9} />
}

export function TransformationOffering({ chapter, onBack }: Props): React.ReactElement {
  const { lang } = useLang()
  const t = STR[lang]
  const o = DELOITTE_OFFERING
  const { edits } = useChapterEdits()
  const [stage, setStage] = useState<1 | 2>(1)
  const offeringImg = edits.texts[imageKey(OFFERING_IMAGE_SRC)] ?? OFFERING_IMAGE_SRC

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

              <div className={styles.grid}>
                {o.pillars.map((p, i) => (
                  <article className={styles.card} key={i}>
                    <span className={styles.cardIcon} aria-hidden>
                      <PillarIcon name={p.icon} />
                    </span>
                    <h2 className={styles.cardTitle}>{p.title[lang]}</h2>
                    <p className={styles.cardText}>{p.text[lang]}</p>
                  </article>
                ))}
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
