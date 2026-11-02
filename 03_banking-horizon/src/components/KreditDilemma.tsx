/**
 * KreditDilemma — Kapitel 06 · Compliance & Risk
 *
 * Interaktives Entscheidungs-Szenario: Ein Geschäftskunde beantragt einen Kredit
 * über 50.000 €; die KI lehnt autonom ab (gestufte Autonomiegrenzen nach
 * Risikoklasse). Der Nutzer navigiert durch vier
 * Telefon-Stationen und trifft jeweils eine Entscheidung, die drei Status-
 * Balken verschiebt. Am Ende erscheint eine kurze Bewertung und drei
 * Reflexionsfragen (Wer hat freigegeben? / Wer haftet? / Wie wird kontrolliert?).
 *
 * Zweisprachig (DE/EN): die Delta-Logik der Optionen ist sprachunabhängig
 * (STATION_DELTAS), nur die Texte werden übersetzt.
 *
 * Je Station wird ein Foto des Anrufers gezeigt (DILEMMA_PHOTOS, Kapitel
 * 6_Dilemma1–4) — über den Änderungsbereich (CMS) per Upload austauschbar.
 */
import { useEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'
import { ShieldCheck, Gauge, Smile, X, RotateCcw, ArrowRight } from 'lucide-react'
import styles from './KreditDilemma.module.css'
import { ImageSlot } from './ImageSlot'
import { useReducedMotion } from '../hooks/useReducedMotion'
import { useLang, type Lang } from '../i18n/LanguageContext'
import { DILEMMA_PHOTOS } from '../data/dilemma'
import { useChapterEdits, imageKey } from '../data/chapterEdits'

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

// Delta-Logik je Station/Option (sprachunabhängig). Indexgleich zu den
// übersetzten Options-Labels in STR[lang].stations[i].options.
const STATION_DELTAS: Record<BarKey, number>[][] = [
  [
    { reg: -1, speed: 1, sat: 1 },
    { reg: 1, speed: 1, sat: -2 },
    { reg: 1, speed: -1, sat: 0 },
  ],
  [
    { reg: 1, speed: -1, sat: 1 },
    { reg: -2, speed: 1, sat: 1 },
    { reg: 1, speed: -1, sat: -1 },
  ],
  [
    { reg: 1, speed: 0, sat: 1 },
    { reg: -2, speed: 0, sat: 0 },
  ],
  [
    { reg: 0, speed: 0, sat: 2 },
    { reg: 1, speed: 1, sat: -2 },
  ],
]

type VerdictKey =
  | 'balanced'
  | 'compliantExpensive'
  | 'satisfactionOverCompliance'
  | 'critical'
  | 'fastButGaps'
  | 'efficientGood'
  | 'ambivalent'

type DilemmaStrings = {
  overlayAria: string
  kicker: string
  title: string
  close: string
  barsAria: string
  barReg: string
  barSpeed: string
  barSat: string
  briefingKicker: string
  scenario1: React.ReactNode
  scenario2: string
  start: string
  stationProgress: (i: number, total: number) => string
  stationLabel: (i: number, total: number) => string
  photoAlt: (caller: string) => string
  optionsAria: string
  deltaReg: string
  deltaSpeed: string
  deltaSat: string
  resultKicker: string
  reflectionAria: string
  reflections: { question: string; body: string }[]
  restart: string
  stations: { caller: string; transcript: string; options: string[] }[]
  verdicts: Record<VerdictKey, string>
}

const STR: Record<Lang, DilemmaStrings> = {
  de: {
    overlayAria: 'Kredit-Dilemma Szenario',
    kicker: 'Kapitel 06 · Compliance & Risk',
    title: 'Kredit-Dilemma',
    close: 'Szenario schließen',
    barsAria: 'Status-Indikatoren',
    barReg: 'Regulatorische Konformität',
    barSpeed: 'Prozessgeschwindigkeit',
    barSat: 'Kundenzufriedenheit',
    briefingKicker: 'Szenario-Briefing',
    scenario1: (
      <>
        Ein Geschäftskunde beantragt einen Kredit über <strong>50.000 €</strong>. Die KI
        lehnt den Antrag autonom ab: ohne Rücksprache, ohne erklärbare Begründung. Die
        autonome Entscheidungsgrenze ist <strong>gestuft</strong> (5.000 · 50.000 · 500.000
        · 5 Mio · 50 Mio €) und richtet sich nach der <strong>Risikoklasse des Kunden</strong>{' '}
        und den KI-Hintergrundinformationen. Der Firmenkundenbetreuer greift zum Telefon.
        Sie entscheiden, wie die Bank reagiert.
      </>
    ),
    scenario2:
      'Jede Entscheidung beeinflusst die drei Indikatoren oben. Am Ende stellen sich die entscheidenden Governance-Fragen: Wer hat freigegeben? Wer haftet? Wie wird kontrolliert?',
    start: 'Szenario starten',
    stationProgress: (i, total) => `Station ${i} von ${total}`,
    stationLabel: (i, total) => `Station ${i} / ${total}`,
    photoAlt: (caller) => `Am Telefon: ${caller}`,
    optionsAria: 'Entscheidungsoptionen',
    deltaReg: 'Konf.',
    deltaSpeed: 'Speed',
    deltaSat: 'Zufr.',
    resultKicker: 'Ergebnis',
    reflectionAria: 'Reflexionsfragen',
    reflections: [
      {
        question: 'Wer hat freigegeben?',
        body: 'Liegt die Freigabeentscheidung beim Modell, beim Betreuer oder beim Komitee? Governance muss diese Frage eindeutig beantworten.',
      },
      {
        question: 'Wer haftet?',
        body: 'Bei einem Override der KI-Empfehlung muss die Verantwortlichkeit dokumentiert und juristisch belastbar sein.',
      },
      {
        question: 'Wie wird kontrolliert?',
        body: 'Aufsichtliche Nachvollziehbarkeit erfordert erklärbare Modelle, lückenlose Logs und regelmäßige Modell-Audits.',
      },
    ],
    restart: 'Szenario neu starten',
    stations: [
      {
        caller: 'Der Firmenkundenbetreuer',
        transcript:
          'Der Kunde ist empört über die automatische Ablehnung. Er fordert eine sofortige Klärung und droht, den Kreditantrag zur Konkurrenz zu verlagern.',
        options: ['Sofort manuell freigeben', 'Ablehnung der KI bestätigen', 'Fall zur Einzelfallprüfung eskalieren'],
      },
      {
        caller: 'Die Risikovorständin',
        transcript:
          'Sie fragt nach der Haftung, falls der Override zur Schadenersatzklage führt. Ohne klare Dokumentation ist niemandem geholfen.',
        options: ['Vier-Augen-Override dokumentieren', 'Ohne Dokumentation freigeben', 'An Kreditkomitee verweisen'],
      },
      {
        caller: 'Die Aufsicht / Compliance',
        transcript:
          'Die Aufsicht verlangt Nachvollziehbarkeit der KI-Entscheidung. Ohne erklärbare Grundlage drohen aufsichtsrechtliche Maßnahmen.',
        options: ['Modell-Begründung offenlegen', 'Entscheidung als Blackbox belassen'],
      },
      {
        caller: 'Der Kunde selbst',
        transcript:
          'Der Kunde droht offen mit Bankwechsel. Er erwartet entweder eine sofortige Lösung oder eine nachvollziehbare Begründung mit Handlungsalternative.',
        options: ['Konditionen-Kompromiss anbieten', 'Hart bei der Entscheidung bleiben'],
      },
    ],
    verdicts: {
      balanced: 'Regelkonform und kundenorientiert: ein ausgewogenes Ergebnis.',
      compliantExpensive: 'Regelkonform, aber teuer erkauft: Die Kundenbeziehung leidet.',
      satisfactionOverCompliance: 'Kundenzufriedenheit gewonnen, jedoch auf Kosten der Compliance.',
      critical: 'Kritische Lage: Compliance-Risiko und Kundenverlust gleichzeitig.',
      fastButGaps: 'Schnelle Entscheidung, aber regulatorische Lücken gefährden die Bank.',
      efficientGood: 'Effizienter Prozess mit guter Kundenbindung, Governance bleibt prüfenswert.',
      ambivalent: 'Ambivalentes Ergebnis, Nachsteuerung in der Governance empfohlen.',
    },
  },
  en: {
    overlayAria: 'Credit dilemma scenario',
    kicker: 'Chapter 06 · Compliance & Risk',
    title: 'Credit Dilemma',
    close: 'Close the scenario',
    barsAria: 'Status indicators',
    barReg: 'Regulatory compliance',
    barSpeed: 'Process speed',
    barSat: 'Customer satisfaction',
    briefingKicker: 'Scenario briefing',
    scenario1: (
      <>
        A business customer applies for a loan of <strong>€50,000</strong>. The AI rejects the
        application autonomously: without consultation, without an explainable rationale.
        The autonomous decision threshold is <strong>tiered</strong> (€5,000 · 50,000 · 500,000
        · 5m · 50m) and depends on the <strong>customer’s risk class</strong> and the AI’s
        background information. The corporate client manager picks up the phone. You decide how
        the bank responds.
      </>
    ),
    scenario2:
      'Every decision influences the three indicators above. In the end, the decisive governance questions arise: who approved it? Who is liable? How is it controlled?',
    start: 'Start the scenario',
    stationProgress: (i, total) => `Station ${i} of ${total}`,
    stationLabel: (i, total) => `Station ${i} / ${total}`,
    photoAlt: (caller) => `On the phone: ${caller}`,
    optionsAria: 'Decision options',
    deltaReg: 'Comp.',
    deltaSpeed: 'Speed',
    deltaSat: 'Sat.',
    resultKicker: 'Result',
    reflectionAria: 'Reflection questions',
    reflections: [
      {
        question: 'Who approved it?',
        body: 'Does the approval decision lie with the model, the manager or the committee? Governance must answer this question unambiguously.',
      },
      {
        question: 'Who is liable?',
        body: 'When overriding the AI recommendation, responsibility must be documented and legally robust.',
      },
      {
        question: 'How is it controlled?',
        body: 'Supervisory traceability requires explainable models, complete logs and regular model audits.',
      },
    ],
    restart: 'Restart the scenario',
    stations: [
      {
        caller: 'The corporate client manager',
        transcript:
          'The customer is outraged by the automatic rejection. He demands immediate clarification and threatens to take the loan application to a competitor.',
        options: ['Approve manually right away', 'Confirm the AI rejection', 'Escalate to a case-by-case review'],
      },
      {
        caller: 'The chief risk officer',
        transcript:
          'She asks about liability should the override lead to a damages claim. Without clear documentation, no one is helped.',
        options: ['Document a four-eyes override', 'Approve without documentation', 'Refer to the credit committee'],
      },
      {
        caller: 'The regulator / compliance',
        transcript:
          'The regulator demands traceability of the AI decision. Without an explainable basis, supervisory measures loom.',
        options: ['Disclose the model rationale', 'Leave the decision as a black box'],
      },
      {
        caller: 'The customer themselves',
        transcript:
          'The customer openly threatens to switch banks. He expects either an immediate solution or a comprehensible rationale with an alternative course of action.',
        options: ['Offer a compromise on terms', 'Hold firm on the decision'],
      },
    ],
    verdicts: {
      balanced: 'Compliant and customer-oriented: a balanced outcome.',
      compliantExpensive: 'Compliant, but dearly bought: the customer relationship suffers.',
      satisfactionOverCompliance: 'Customer satisfaction won, but at the cost of compliance.',
      critical: 'Critical situation: compliance risk and customer loss at the same time.',
      fastButGaps: 'Fast decision, but regulatory gaps put the bank at risk.',
      efficientGood: 'Efficient process with good customer retention, governance still worth reviewing.',
      ambivalent: 'Ambivalent outcome, governance adjustment recommended.',
    },
  },
  fr: {
    overlayAria: 'Scénario du dilemme de crédit',
    kicker: 'Chapitre 06 · Conformité & Risques',
    title: 'Dilemme de crédit',
    close: 'Fermer le scénario',
    barsAria: 'Indicateurs de statut',
    barReg: 'Conformité réglementaire',
    barSpeed: 'Vitesse du processus',
    barSat: 'Satisfaction client',
    briefingKicker: 'Briefing du scénario',
    scenario1: (
      <>
        Un client entreprise sollicite un crédit de <strong>50 000 €</strong>. L’IA rejette la
        demande de façon autonome : sans concertation, sans justification explicable. Le seuil
        de décision autonome est <strong>échelonné</strong> (5 000 · 50 000 · 500 000 · 5 M ·
        50 M€) et dépend de la <strong>classe de risque du client</strong>{' '}
        et des informations de contexte de l’IA. Le chargé d’affaires entreprises décroche le
        téléphone. À vous de décider comment la banque réagit.
      </>
    ),
    scenario2:
      'Chaque décision influe sur les trois indicateurs ci-dessus. Au final se posent les questions de gouvernance décisives : qui a validé ? Qui est responsable ? Comment le contrôle est-il assuré ?',
    start: 'Lancer le scénario',
    stationProgress: (i, total) => `Étape ${i} sur ${total}`,
    stationLabel: (i, total) => `Étape ${i} / ${total}`,
    photoAlt: (caller) => `Au téléphone : ${caller}`,
    optionsAria: 'Options de décision',
    deltaReg: 'Conf.',
    deltaSpeed: 'Vit.',
    deltaSat: 'Satisf.',
    resultKicker: 'Résultat',
    reflectionAria: 'Questions de réflexion',
    reflections: [
      {
        question: 'Qui a validé ?',
        body: 'La décision de validation revient-elle au modèle, au chargé d’affaires ou au comité ? La gouvernance doit y répondre sans ambiguïté.',
      },
      {
        question: 'Qui est responsable ?',
        body: 'En cas de dérogation à la recommandation de l’IA, la responsabilité doit être documentée et juridiquement solide.',
      },
      {
        question: 'Comment le contrôle est-il assuré ?',
        body: 'La traçabilité exigée par le superviseur suppose des modèles explicables, des journaux exhaustifs et des audits de modèles réguliers.',
      },
    ],
    restart: 'Relancer le scénario',
    stations: [
      {
        caller: 'Le chargé d’affaires entreprises',
        transcript:
          'Le client est indigné par le rejet automatique. Il exige une clarification immédiate et menace de porter sa demande de crédit à la concurrence.',
        options: ['Valider immédiatement à la main', 'Confirmer le rejet de l’IA', 'Escalader pour un examen au cas par cas'],
      },
      {
        caller: 'La directrice des risques',
        transcript:
          'Elle s’interroge sur la responsabilité si la dérogation débouche sur une action en dommages et intérêts. Sans documentation claire, personne n’y gagne.',
        options: ['Documenter une dérogation à quatre yeux', 'Valider sans documentation', 'Renvoyer au comité de crédit'],
      },
      {
        caller: 'Le superviseur / la conformité',
        transcript:
          'Le superviseur exige la traçabilité de la décision de l’IA. Sans fondement explicable, des mesures prudentielles sont à craindre.',
        options: ['Exposer la justification du modèle', 'Laisser la décision en boîte noire'],
      },
      {
        caller: 'Le client lui-même',
        transcript:
          'Le client menace ouvertement de changer de banque. Il attend soit une solution immédiate, soit une justification compréhensible assortie d’une alternative.',
        options: ['Proposer un compromis sur les conditions', 'Maintenir fermement la décision'],
      },
    ],
    verdicts: {
      balanced: 'Conforme et orienté client : un résultat équilibré.',
      compliantExpensive: 'Conforme, mais chèrement payé : la relation client en pâtit.',
      satisfactionOverCompliance: 'Satisfaction client gagnée, mais au détriment de la conformité.',
      critical: 'Situation critique : risque de conformité et perte du client à la fois.',
      fastButGaps: 'Décision rapide, mais des failles réglementaires mettent la banque en danger.',
      efficientGood: 'Processus efficace et bonne fidélisation, la gouvernance reste à examiner.',
      ambivalent: 'Résultat ambivalent, un ajustement de la gouvernance est recommandé.',
    },
  },
}

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

/** Leitet aus den Endwerten den passenden Bewertungs-Schlüssel ab. */
function getVerdictKey(bars: Bars): VerdictKey {
  const { reg, speed, sat } = bars
  if (reg >= 3 && sat >= 3) return 'balanced'
  if (reg >= 3 && sat <= 1) return 'compliantExpensive'
  if (reg <= 1 && sat >= 3) return 'satisfactionOverCompliance'
  if (reg <= 1 && sat <= 1) return 'critical'
  if (speed >= 3 && reg <= 2) return 'fastButGaps'
  if (speed >= 3 && sat >= 3) return 'efficientGood'
  return 'ambivalent'
}

/** Baut die übersetzten Stationen mit der sprachunabhängigen Delta-Logik zusammen. */
function buildStations(t: DilemmaStrings): Station[] {
  return t.stations.map((s, si) => ({
    caller: s.caller,
    transcript: s.transcript,
    options: s.options.map((label, oi) => ({ label, deltas: STATION_DELTAS[si][oi] })),
  }))
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

/** Anrufer-Foto der Station (16:9). CMS-Override via imageKey(src) möglich;
 *  fehlt die Datei, zeigt ImageSlot einen ruhigen Platzhalter mit dem Namen. */
function StationPhoto({ src, caller, t }: { src: string; caller: string; t: DilemmaStrings }): React.ReactElement {
  return (
    <div className={styles.clip}>
      <ImageSlot src={src} alt={t.photoAlt(caller)} fit="cover" caption={caller} />
    </div>
  )
}

// ─── Haupt-Komponente ─────────────────────────────────────────────────────────

export function KreditDilemma({ onClose }: { onClose: () => void }): React.ReactElement {
  const reduced = useReducedMotion()
  const { lang } = useLang()
  const t = STR[lang]
  const stations = buildStations(t)
  const { edits } = useChapterEdits()

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
      if (nextIndex < stations.length) {
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
    phase.kind === 'station' ? (stations[phase.index] ?? null) : null

  return (
    <div
      ref={overlayRef}
      className={styles.overlay}
      role="dialog"
      aria-modal="true"
      aria-label={t.overlayAria}
    >
      <div ref={cardRef} className={styles.card}>
        {/* ─── Header ───────────────────────────────────────────────── */}
        <header className={styles.header}>
          <div className={styles.headerText}>
            <span className={styles.kicker}>{t.kicker}</span>
            <h2 className={styles.title}>{t.title}</h2>
          </div>
          <button
            type="button"
            className={styles.closeBtn}
            onClick={onClose}
            aria-label={t.close}
          >
            <X size={18} strokeWidth={2} aria-hidden />
          </button>
        </header>

        {/* ─── Status-Balken (immer sichtbar) ───────────────────────── */}
        <div className={styles.barsPanel} aria-label={t.barsAria}>
          <StatusBar label={t.barReg} value={bars.reg} colorVar="--ok" />
          <StatusBar label={t.barSpeed} value={bars.speed} colorVar="--warn" />
          <StatusBar label={t.barSat} value={bars.sat} colorVar="--info" />
        </div>

        {/* ─── Inhalt je Phase ──────────────────────────────────────── */}
        <div className={styles.content}>
          {phase.kind === 'briefing' && (
            <div className={styles.briefing}>
              <div className={styles.scenarioBox}>
                <div className={styles.scenarioIconRow}>
                  <ShieldCheck size={20} strokeWidth={1.8} aria-hidden />
                  <span className={styles.scenarioKicker}>{t.briefingKicker}</span>
                </div>
                <p className={styles.scenarioText}>{t.scenario1}</p>
                <p className={styles.scenarioText}>{t.scenario2}</p>
              </div>
              <button
                type="button"
                className={styles.primaryBtn}
                onClick={handleStart}
                aria-label={t.start}
              >
                <Gauge size={16} strokeWidth={2} aria-hidden />
                {t.start}
                <ArrowRight size={16} strokeWidth={2} aria-hidden />
              </button>
            </div>
          )}

          {phase.kind === 'station' && currentStation !== null && (
            <div className={styles.station}>
              {/* Fortschrittsanzeige */}
              <div className={styles.progress} aria-label={t.stationProgress(phase.index + 1, stations.length)}>
                {stations.map((_, i) => (
                  <span
                    key={i}
                    className={styles.progressDot}
                    data-active={i === phase.index || undefined}
                    data-done={i < phase.index || undefined}
                    aria-hidden
                  />
                ))}
                <span className={styles.progressLabel}>{t.stationLabel(phase.index + 1, stations.length)}</span>
              </div>

              {/* Anrufer-Foto der Station */}
              <StationPhoto
                src={
                  edits.texts[imageKey(DILEMMA_PHOTOS[phase.index]?.src ?? '')] ??
                  DILEMMA_PHOTOS[phase.index]?.src ??
                  ''
                }
                caller={currentStation.caller}
                t={t}
              />

              {/* Transkript */}
              <div className={styles.transcriptBox}>
                <span className={styles.callerLabel}>{currentStation.caller}</span>
                <p className={styles.transcriptText}>{currentStation.transcript}</p>
              </div>

              {/* Optionen */}
              <div className={styles.options} role="group" aria-label={t.optionsAria}>
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
                      <DeltaBadge label={t.deltaReg} delta={opt.deltas.reg} />
                      <DeltaBadge label={t.deltaSpeed} delta={opt.deltas.speed} />
                      <DeltaBadge label={t.deltaSat} delta={opt.deltas.sat} />
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
                  <span className={styles.verdictKicker}>{t.resultKicker}</span>
                </div>
                <p className={styles.verdictText}>{t.verdicts[getVerdictKey(bars)]}</p>
              </div>

              {/* Reflexionsfragen */}
              <div className={styles.reflectionGrid} aria-label={t.reflectionAria}>
                {t.reflections.map((r) => (
                  <ReflectionCard key={r.question} question={r.question} body={r.body} />
                ))}
              </div>

              <button
                type="button"
                className={styles.restartBtn}
                onClick={handleRestart}
                aria-label={t.restart}
              >
                <RotateCcw size={15} strokeWidth={2} aria-hidden />
                {t.restart}
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
