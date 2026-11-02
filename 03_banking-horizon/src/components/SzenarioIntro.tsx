import { useEffect, useRef, useState } from 'react'
import {
  ArrowRight,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  Landmark,
  Lightbulb,
  MousePointerClick,
  Network,
  Plus,
  TrendingUp,
  Users,
} from 'lucide-react'
// Wiederverwendung der Holodeck-2×2-Matrix-Optik (identische Darstellung „wie
// /holodeck"). Die Theme-Variablen (--accent, --bg, --line, --text, --muted …)
// werden über den Wrapper unten gesetzt, damit die Optik zum Bank-Theme passt.
import styles from '../holodeck/SzenarioVorspann.module.css'
import { pick, useLang, type Lang } from '../i18n/LanguageContext'
import imgInseln from '../holodeck/szenario-img/inseln.png'
import imgGrenzenlos from '../holodeck/szenario-img/grenzenlos.png'
import imgFestung from '../holodeck/szenario-img/festung.png'
import imgVorsichtig from '../holodeck/szenario-img/vorsichtig.png'

// Szenario-Illustration je Quadrant (KI×Geopolitik). Dient als dezentes
// Kachel-Hintergrundbild und als Hero im Detailpanel.
const SZENARIO_IMG: Record<string, string> = {
  inseln: imgInseln,
  grenzenlos: imgGrenzenlos,
  festung: imgFestung,
  vorsichtig: imgVorsichtig,
}

// ─────────────────────────────────────────────────────────────────────────────
// SzenarioIntro — Auftakt „bevor das Haus öffnet".
//
// Eine 2×2-Szenario-Matrix, wie sich Banken bis 2030 entwickeln könnten.
//   X-Achse: Geopolitik & Regulierung   (fragmentiert ↔ offen)
//   Y-Achse: KI-Reife & Kundenakzeptanz (zögerlich ↔ Durchbruch)
// Jeder Quadrant beschreibt ein Szenario. Zu Beginn ist die Matrix leer (nur
// Plus je Quadrant); Klick schaltet einen Quadranten frei, danach genügt Hovern.
// Platzhalter-Idee für den Workshop — Inhalte vor Einsatz schärfen.
// ─────────────────────────────────────────────────────────────────────────────

type QuadrantPos = 'oben-links' | 'oben-rechts' | 'unten-links' | 'unten-rechts'

type Szenario = {
  id: string
  quadrant: QuadrantPos
  color: string
  title: string
  kernthemen: string[]
  narrativ: string
  details: string[]
}

type IntroTexte = {
  eyebrow: string
  title: string
  lead: string
  hint: string
  cta: string
  note: string
  quadrantLock: (n: number) => string
  achsen: {
    xTitel: string
    xLinks: string
    xRechts: string
    yTitel: string
    yOben: string
    yUnten: string
  }
}

// Pro Detailpunkt ein einfarbiges Icon: Kunden → Markt & Wettbewerb →
// IT & Ökosystem → KI & Governance.
const DETAIL_ICONS = [Users, TrendingUp, Network, Lightbulb] as const

function getTexte(lang: Lang): IntroTexte {
  if (lang === 'fr') {
    return {
      eyebrow: 'SCÉNARIOS 2030 · L’ÉVOLUTION DE LA BANQUE',
      title: 'Quatre scénarios à l’horizon 2030',
      lead: 'Deux incertitudes critiques dessinent quatre mondes possibles pour les banques d’ici 2030. Cliquez sur le plus d’un quadrant pour débloquer un scénario ; il suffit ensuite de le survoler pour passer de l’un à l’autre.',
      hint: 'Cliquer sur le plus d’un quadrant pour le débloquer',
      cta: 'Vers la vue en coupe',
      note: 'Espace réservé pour l’atelier, affiner les scénarios avant utilisation.',
      quadrantLock: (n) => `Débloquer le quadrant ${n} sur 4`,
      achsen: {
        xTitel: 'Géopolitique & réglementation',
        xLinks: 'FRAGMENTÉ',
        xRechts: 'OUVERT',
        yTitel: 'Maturité IA & acceptation client',
        yOben: 'PERCÉE',
        yUnten: 'HÉSITANT',
      },
    }
  }
  if (lang === 'en') {
    return {
      eyebrow: 'SCENARIOS 2030 · HOW DOES THE BANK EVOLVE',
      title: 'Four scenarios to 2030',
      lead: 'Two critical uncertainties span four possible worlds for banks by 2030. Click the plus in a quadrant to unlock a scenario; once unlocked, hover to switch between them.',
      hint: 'Click the plus in a quadrant to unlock it',
      cta: 'Continue to the structure',
      note: 'Placeholder for the workshop, sharpen the scenarios before use.',
      quadrantLock: (n) => `Unlock quadrant ${n} of 4`,
      achsen: {
        xTitel: 'Geopolitics & regulation',
        xLinks: 'FRAGMENTED',
        xRechts: 'OPEN',
        yTitel: 'AI maturity & customer acceptance',
        yOben: 'BREAKTHROUGH',
        yUnten: 'HESITANT',
      },
    }
  }
  return {
    eyebrow: 'SZENARIEN 2030 · WIE ENTWICKELT SICH DIE BANK',
    title: 'Vier Szenarien bis 2030',
    lead: 'Zwei kritische Unsicherheiten spannen vier mögliche Welten für Banken bis 2030 auf. Klicken Sie das Plus in einem Quadranten, um ein Szenario freizuschalten; danach genügt Hovern, um zu wechseln.',
    hint: 'Plus im Quadranten anklicken zum Freischalten',
    cta: 'Weiter zum Strukturbild',
    note: 'Platzhalter für den Workshop, Szenarien vor Einsatz schärfen.',
    quadrantLock: (n) => `Quadrant ${n} von 4 freischalten`,
    achsen: {
      xTitel: 'Geopolitik & Regulierung',
      xLinks: 'FRAGMENTIERT',
      xRechts: 'OFFEN',
      yTitel: 'KI-Reife & Kundenakzeptanz',
      yOben: 'DURCHBRUCH',
      yUnten: 'ZÖGERLICH',
    },
  }
}

function getSzenarien(lang: Lang): Szenario[] {
  if (lang === 'fr') {
    return [
      {
        id: 'inseln', quadrant: 'oben-links', color: '#86BC25',
        title: 'Îlots souverains d’IA',
        kernthemen: ['Souveraineté des données & écosystèmes IA régionaux', 'Blocs réglementaires (UE/US/Chine)', 'Champions nationaux plutôt que plateformes mondiales'],
        narrativ: 'L’IA est mature et largement acceptée, mais le monde se fragmente en blocs réglementaires. Les banques gagnent en tant que plateformes IA souveraines et régionales. Le passage à l’échelle transfrontalier reste difficile.',
        details: ['Les clients acceptent l’IA, mais dans des écosystèmes locaux et de confiance.', 'La concurrence est régionale ; la portée des Big Tech mondiales est limitée par la réglementation.', 'Des coûts de conformité élevés, mais une nette avance en IA au sein de chaque bloc.'],
      },
      {
        id: 'grenzenlos', quadrant: 'oben-rechts', color: '#7EC8FF',
        title: 'Économie de l’IA sans frontières',
        kernthemen: ['Réglementation ouverte et harmonisée (open finance)', 'Banques-plateformes & embedded finance', 'Forte concurrence avec les Big Tech'],
        narrativ: 'Une IA mature rencontre des marchés ouverts et harmonisés. Banques-plateformes et Big Tech se livrent une concurrence ouverte ; l’hyperpersonnalisation et l’embedded finance deviennent la norme.',
        details: ['Les clients utilisent naturellement des services transfrontaliers pilotés par l’IA.', 'Les gagnants orchestrent des écosystèmes ; les retardataires sont évincés de l’interface client.', 'Les API ouvertes et les données interopérables sont le champ de bataille.'],
      },
      {
        id: 'festung', quadrant: 'unten-links', color: '#C68A12',
        title: 'Banque forteresse',
        kernthemen: ['Protectionnisme & incertitude géopolitique', 'Adoption prudente de l’IA, faible confiance', 'Stratégie défensive, axée sur les coûts'],
        narrativ: 'Une faible confiance dans l’IA rencontre un monde protectionniste. Les banques deviennent défensives et centrées sur la conformité, protègent leur cœur de métier et optimisent résilience et coûts.',
        details: ['Les clients restent prudents ; l’automatisation ne progresse que lentement.', 'La fragmentation des marchés augmente les coûts et limite le passage à l’échelle.', 'Priorité au cœur de métier, à la résilience et à la sécurité réglementaire.'],
      },
      {
        id: 'vorsichtig', quadrant: 'unten-rechts', color: '#2FA86B',
        title: 'Ouvert, mais prudent',
        kernthemen: ['Marchés ouverts, mais clients prudents', 'Le conseil centré sur l’humain reste central', 'Confiance & transparence comme différenciateurs'],
        narrativ: 'Les marchés sont ouverts, mais les clients restent sceptiques face à l’automatisation. Le conseil centré sur l’humain et fondé sur la confiance reste central ; l’automatisation progresse pas à pas.',
        details: ['Les clients apprécient la transparence et l’humain dans la boucle.', 'Les marchés ouverts attirent de nouveaux acteurs, mais l’adoption est progressive.', 'La confiance et l’explicabilité deviennent le facteur de différenciation décisif.'],
      },
    ]
  }
  if (lang === 'en') {
    return [
      {
        id: 'inseln', quadrant: 'oben-links', color: '#86BC25',
        title: 'Sovereign AI islands',
        kernthemen: ['Data sovereignty & regional AI ecosystems', 'Regulatory blocs (EU/US/China)', 'National champions instead of global platforms'],
        narrativ: 'AI is mature and widely accepted, yet the world splits into regulatory blocs. Banks win as sovereign, regional AI platforms. Cross-border scaling stays hard.',
        details: ['Customers accept AI, but within trusted, localised ecosystems.', 'Competition is regional; global Big-Tech reach is limited by regulation.', 'High compliance cost, but a clear AI edge inside each bloc.'],
      },
      {
        id: 'grenzenlos', quadrant: 'oben-rechts', color: '#7EC8FF',
        title: 'Borderless AI economy',
        kernthemen: ['Open, harmonised regulation (open finance)', 'Platform banks & embedded finance', 'Intense competition with Big Tech'],
        narrativ: 'Mature AI meets open, harmonised markets. Platform banks and Big Tech compete openly; hyper-personalisation and embedded finance become the norm.',
        details: ['Customers embrace AI-led, cross-border services.', 'Winners orchestrate ecosystems; laggards are disintermediated.', 'Open APIs and interoperable data are the battleground.'],
      },
      {
        id: 'festung', quadrant: 'unten-links', color: '#C68A12',
        title: 'Fortress bank',
        kernthemen: ['Protectionism & geopolitical uncertainty', 'Hesitant AI adoption, low trust', 'Defensive, cost-focused strategy'],
        narrativ: 'Slow AI trust meets a protectionist world. Banks turn defensive and compliance-heavy, protect the core business and optimise for resilience and cost.',
        details: ['Customers stay cautious; automation advances only slowly.', 'Fragmented markets raise cost and limit scale.', 'Focus on core banking, resilience and regulatory safety.'],
      },
      {
        id: 'vorsichtig', quadrant: 'unten-rechts', color: '#2FA86B',
        title: 'Open but cautious',
        kernthemen: ['Open markets, but cautious customers', 'Human-centric advisory stays central', 'Trust & transparency as differentiators'],
        narrativ: 'Markets are open, but customers remain wary of automation. Human-centric, trust-based advisory stays central; automation advances step by step.',
        details: ['Customers value transparency and a human in the loop.', 'Open markets invite new entrants, but adoption is gradual.', 'Trust and explainability become the key differentiators.'],
      },
    ]
  }
  return [
    {
      id: 'inseln', quadrant: 'oben-links', color: '#86BC25',
      title: 'Souveräne KI-Inseln',
      kernthemen: ['Datensouveränität & regionale KI-Ökosysteme', 'Regulatorische Blöcke (EU/US/China)', 'Nationale Champions statt globaler Plattformen'],
      narrativ: 'KI ist reif und breit akzeptiert, doch die Welt zerfällt in regulatorische Blöcke. Banken gewinnen als souveräne, regionale KI-Plattformen. Grenzüberschreitende Skalierung bleibt schwierig.',
      details: ['Kunden akzeptieren KI, aber in vertrauten, lokalen Ökosystemen.', 'Wettbewerb ist regional; die Reichweite globaler Big Tech ist regulatorisch begrenzt.', 'Hohe Compliance-Kosten, aber ein klarer KI-Vorsprung im jeweiligen Block.'],
    },
    {
      id: 'grenzenlos', quadrant: 'oben-rechts', color: '#7EC8FF',
      title: 'Grenzenlose KI-Ökonomie',
      kernthemen: ['Offene, harmonisierte Regulierung (Open Finance)', 'Plattform-Banken & Embedded Finance', 'Starker Wettbewerb mit Big Tech'],
      narrativ: 'Reife KI trifft auf offene, harmonisierte Märkte. Plattform-Banken und Big Tech konkurrieren offen; Hyperpersonalisierung und Embedded Finance werden zum Standard.',
      details: ['Kunden nutzen selbstverständlich KI-geführte, grenzüberschreitende Services.', 'Gewinner orchestrieren Ökosysteme; Nachzügler werden aus der Kundenschnittstelle gedrängt.', 'Offene APIs und interoperable Daten sind das Schlachtfeld.'],
    },
    {
      id: 'festung', quadrant: 'unten-links', color: '#C68A12',
      title: 'Festung Bank',
      kernthemen: ['Protektionismus & geopolitische Unsicherheit', 'Zurückhaltende KI-Adoption, geringes Vertrauen', 'Defensive, kostenorientierte Strategie'],
      narrativ: 'Geringes KI-Vertrauen trifft auf eine protektionistische Welt. Banken werden defensiv und compliance-lastig, schützen das Kerngeschäft und optimieren auf Resilienz und Kosten.',
      details: ['Kunden bleiben vorsichtig; Automatisierung schreitet nur langsam voran.', 'Fragmentierte Märkte erhöhen die Kosten und begrenzen Skalierung.', 'Fokus auf Kerngeschäft, Resilienz und regulatorische Sicherheit.'],
    },
    {
      id: 'vorsichtig', quadrant: 'unten-rechts', color: '#2FA86B',
      title: 'Offen, aber vorsichtig',
      kernthemen: ['Offene Märkte, aber vorsichtige Kunden', 'Mensch-zentrierte Beratung bleibt zentral', 'Vertrauen & Transparenz als Differenzierer'],
      narrativ: 'Die Märkte sind offen, doch die Kunden bleiben skeptisch gegenüber Automatisierung. Mensch-zentrierte, vertrauensbasierte Beratung bleibt zentral; Automatisierung kommt Schritt für Schritt.',
      details: ['Kunden schätzen Transparenz und den Menschen im Prozess.', 'Offene Märkte locken neue Anbieter, doch die Adoption ist graduell.', 'Vertrauen und Erklärbarkeit werden zum entscheidenden Differenzierer.'],
    },
  ]
}

// Fett-Auszeichnung in den Detail-Texten: **…** → <strong>; sonst Klartext.
function rich(text: string): React.ReactNode[] {
  return text
    .split(/(\*\*[^*]+\*\*)/g)
    .filter((p) => p !== '')
    .map((p, i) =>
      p.startsWith('**') && p.endsWith('**') ? <strong key={i}>{p.slice(2, -2)}</strong> : <span key={i}>{p}</span>,
    )
}

// Theme-Variablen, damit die Holodeck-Matrix-Optik zum Bank-Theme (Deloitte-Grün,
// dunkles Premium) passt.
const THEME_VARS = {
  '--accent': '#86BC25',
  '--accent-dark': '#046A38',
  '--bg': '#0B0B0C',
  '--bg-soft': '#121317',
  '--line': 'rgba(255, 255, 255, 0.12)',
  '--text': '#F4F1EA',
  '--muted': '#8E8A82',
} as React.CSSProperties

type Props = {
  /** Weiter ins Strukturbild (Haus betreten). */
  onEnter: () => void
}

export function SzenarioIntro({ onEnter }: Props): React.ReactElement {
  const { lang } = useLang()
  const T = getTexte(lang)
  const szenarien = getSzenarien(lang)
  const byQuad: Record<QuadrantPos, Szenario> = {
    'oben-links': szenarien[0],
    'oben-rechts': szenarien[1],
    'unten-links': szenarien[2],
    'unten-rechts': szenarien[3],
  }
  const gridOrder: QuadrantPos[] = ['oben-links', 'oben-rechts', 'unten-links', 'unten-rechts']

  const [active, setActive] = useState<string | null>(null)
  const [unlocked, setUnlocked] = useState<Set<string>>(() => new Set())
  const aktiv = szenarien.find((s) => s.id === active) ?? null
  const nochLeer = unlocked.size === 0
  const panelRef = useRef<HTMLDivElement>(null)

  const [built, setBuilt] = useState(false)
  useEffect(() => {
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
    if (reduce) {
      setBuilt(true)
      return
    }
    const t = setTimeout(() => setBuilt(true), 1850)
    return () => clearTimeout(t)
  }, [])

  useEffect(() => {
    panelRef.current?.scrollTo({ top: 0 })
  }, [active])

  const freischalten = (id: string) => {
    setUnlocked((prev) => (prev.has(id) ? prev : new Set(prev).add(id)))
    setActive(id)
  }
  const vorschau = (id: string) => {
    if (unlocked.has(id)) setActive(id)
  }

  return (
    <div style={{ ...THEME_VARS, position: 'fixed', inset: 0, display: 'flex', flexDirection: 'column', background: '#0B0B0C', color: '#F4F1EA' }}>
      <div
        className={styles.root}
        data-built={built || undefined}
        data-empty={nochLeer || undefined}
      >
        {/* ── Matrix (links) ── */}
        <div className={styles.matrixCol}>
          <div className={styles.matrixFrame}>
            <span className={`${styles.dir} ${styles.dirTop}`}>
              <ChevronUp size={15} strokeWidth={2.4} aria-hidden /> {T.achsen.yOben}
            </span>
            <span className={`${styles.dir} ${styles.dirBottom}`}>
              {T.achsen.yUnten} <ChevronDown size={15} strokeWidth={2.4} aria-hidden />
            </span>
            <span className={`${styles.dir} ${styles.dirLeft}`}>
              <ChevronLeft size={15} strokeWidth={2.4} aria-hidden /> {T.achsen.xLinks}
            </span>
            <span className={`${styles.dir} ${styles.dirRight}`}>
              {T.achsen.xRechts} <ChevronRight size={15} strokeWidth={2.4} aria-hidden />
            </span>

            <div className={styles.grid}>
              <span className={styles.crossH} aria-hidden />
              <span className={styles.crossV} aria-hidden />
              <span className={`${styles.axisTitle} ${styles.axisXLeft}`} aria-hidden>
                {T.achsen.xTitel}
              </span>
              <span className={`${styles.axisTitle} ${styles.axisXRight}`} aria-hidden>
                {pick({ de: 'Open Finance', en: 'open finance', fr: 'Open finance' }, lang)}
              </span>
              <span className={`${styles.axisTitle} ${styles.axisY}`} aria-hidden>
                {T.achsen.yTitel}
              </span>

              {gridOrder.map((pos, i) => {
                const s = byQuad[pos]
                const offen = unlocked.has(s.id)
                return (
                  <button
                    type="button"
                    key={s.id}
                    className={styles.tile}
                    data-active={active === s.id || undefined}
                    data-unlocked={offen || undefined}
                    style={{ '--sz': s.color, '--i': i } as React.CSSProperties}
                    onClick={() => freischalten(s.id)}
                    onMouseEnter={() => vorschau(s.id)}
                    onFocus={() => vorschau(s.id)}
                    aria-pressed={active === s.id}
                    aria-label={offen ? s.title : T.quadrantLock(i + 1)}
                  >
                    <span
                      className={styles.tileBg}
                      style={{ backgroundImage: `url(${SZENARIO_IMG[s.id]})` }}
                      aria-hidden
                    />
                    {offen ? (
                      <>
                        <span className={styles.tileHead}>
                          <span className={styles.tileTitle}>{s.title}</span>
                        </span>
                        <ul className={styles.tileList}>
                          {s.kernthemen.map((k) => (
                            <li key={k}>{k}</li>
                          ))}
                        </ul>
                      </>
                    ) : (
                      <span className={styles.tileLock}>
                        <span className={styles.tileLockIcon}>
                          <Plus size={26} strokeWidth={2.4} aria-hidden />
                        </span>
                      </span>
                    )}
                  </button>
                )
              })}
            </div>
          </div>
        </div>

        {/* ── Detailpanel (rechts) ── */}
        <aside className={styles.panel}>
          <div className={styles.panelScroll} ref={panelRef} data-active={aktiv ? '' : undefined}>
            {aktiv ? (
              <div className={styles.detail} style={{ '--sz': aktiv.color } as React.CSSProperties}>
                <div
                  className={styles.detailHero}
                  style={{ backgroundImage: `url(${SZENARIO_IMG[aktiv.id]})` }}
                  aria-hidden
                />
                <div className={styles.detailHead}>
                  <span className={styles.detailDot} aria-hidden />
                  <h2 className={styles.detailTitle}>{aktiv.title}</h2>
                </div>
                <p className={styles.narrativ}>{aktiv.narrativ}</p>
                <ul className={styles.detailList}>
                  {aktiv.details.map((d, i) => {
                    const Icon = DETAIL_ICONS[i] ?? DETAIL_ICONS[DETAIL_ICONS.length - 1]
                    return (
                      <li key={d}>
                        <Icon className={styles.detailIcon} size={20} strokeWidth={2} aria-hidden />
                        <span className={styles.detailText}>{rich(d)}</span>
                      </li>
                    )
                  })}
                </ul>
              </div>
            ) : (
              <div className={styles.intro}>
                <div className={styles.eyebrow}>
                  <Landmark size={14} strokeWidth={2} aria-hidden style={{ marginRight: 6, verticalAlign: '-2px' }} />
                  {T.eyebrow}
                </div>
                <h1 className={styles.title}>{T.title}</h1>
                <p className={styles.lead}>{T.lead}</p>
                <div className={styles.hint}>
                  <MousePointerClick size={18} strokeWidth={2} aria-hidden />
                  <span>{T.hint}</span>
                </div>
                <p className={styles.note}>{T.note}</p>
              </div>
            )}
          </div>

          <div className={styles.footer}>
            <span className={styles.legende}>{T.achsen.xTitel} × {T.achsen.yTitel}</span>
            <button type="button" className={styles.cta} onClick={onEnter}>
              {T.cta}
              <ArrowRight size={16} strokeWidth={2.4} aria-hidden />
            </button>
          </div>
        </aside>
      </div>
    </div>
  )
}
