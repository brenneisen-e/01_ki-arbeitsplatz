import {
  ArrowLeft,
  ArrowRight,
  Check,
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
import { useLang } from '../i18n/LanguageContext'
import type { Chapter, Handoff } from '../data/chapters'
import { DELOITTE_OFFERING } from '../data/offering'

// Nur die tatsächlich genutzten Icons (kein import * — sonst bläht sich das
// Bundle um den gesamten Lucide-Satz auf).
const PILLAR_ICONS: Record<string, LucideIcon> = {
  Compass,
  Network,
  GitBranch,
  ShieldCheck,
  Users,
  Layers,
}

// ─────────────────────────────────────────────────────────────────────────────
// TransformationOffering — das Kapitel „Transformation mit Deloitte" (Glas-Aufzug).
//
// Anders als die Fachbereiche zeigt dieses Kapitel KEINE Bank-Hypothesen
// (Status Quo / 2030), sondern das Deloitte-OFFERING: wie Deloitte die Bank
// decision-first zur AI-nativen Plattform-Bank begleitet. Bausteine als Karten,
// „Warum Deloitte" als Leiste, plus ein CTA in die Co-Creation.
// ─────────────────────────────────────────────────────────────────────────────

const STR = {
  de: { back: 'Übersicht', kapitel: 'Kapitel' },
  en: { back: 'Overview', kapitel: 'Chapter' },
} as const

type Props = { chapter: Chapter; onBack: () => void; onHandoff: (h: Handoff) => void }

// Lucide-Icon per Name auflösen (einfarbig, currentColor).
function PillarIcon({ name }: { name: string }): React.ReactElement {
  const C = PILLAR_ICONS[name] ?? Sparkles
  return <C size={22} strokeWidth={1.9} />
}

export function TransformationOffering({ chapter, onBack, onHandoff }: Props): React.ReactElement {
  const { lang } = useLang()
  const t = STR[lang]
  const o = DELOITTE_OFFERING

  return (
    <div className={styles.wrap}>
      <header className={styles.topbar}>
        <button type="button" className={styles.backBtn} onClick={onBack}>
          <ArrowLeft size={16} strokeWidth={2.2} aria-hidden />
          {t.back}
        </button>
        <span className={styles.chapterTag}>
          {t.kapitel} {chapter.kapitel}
        </span>
      </header>

      <div className={styles.scroll}>
        <div className={styles.inner}>
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

          <div className={styles.cta}>
            <p className={styles.ctaLead}>{o.ctaLead[lang]}</p>
            <button
              type="button"
              className={styles.ctaBtn}
              onClick={() => onHandoff(chapter.activity.handoff)}
            >
              {o.ctaButton[lang]}
              <ArrowRight size={17} strokeWidth={2.2} aria-hidden />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
