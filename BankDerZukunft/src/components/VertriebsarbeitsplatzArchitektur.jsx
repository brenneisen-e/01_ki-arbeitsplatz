import {
  ArrowLeft,
  ArrowRight,
  ChevronRight,
  Workflow,
  MessageSquare,
  Mic,
  Smartphone,
  Monitor,
  Bot,
  Brain,
  Gauge,
  Sparkles,
  User,
  Users,
  ClipboardList,
  ShieldCheck,
  Target,
  Database,
  Zap,
  Layers,
  Network,
  Cloud,
  Lock,
  Eye,
  ExternalLink,
  Play,
} from 'lucide-react'

const VAB_URL = '../../vertriebsarbeitsplatz/dist/index.html'

const LAYERS = [
  {
    id: 'experience',
    title: 'Experience Layer',
    description: 'Wo Beratung stattfindet — Mensch trifft KI.',
    color: '#38bdf8',
    colorDeep: '#0284c7',
    items: [
      { icon: MessageSquare, label: 'Conversational UI', desc: 'Copilot-Chat mit Beratungshistorie' },
      { icon: Mic, label: 'Voice & Transcription', desc: 'Diktat, Live-Transkription, Befehle' },
      { icon: Monitor, label: 'Desktop Workspace', desc: '360°-Sicht für den Berater' },
      { icon: Smartphone, label: 'Mobile Companion', desc: 'Beratungsunterlagen offline' },
    ],
  },
  {
    id: 'ai',
    title: 'KI-Orchestrierung',
    description: 'Agenten, Modelle, Guardrails — das Nervensystem.',
    color: '#a78bfa',
    colorDeep: '#6366f1',
    highlight: true,
    items: [
      { icon: Bot, label: 'Copilot-Agent', desc: 'Multi-Agent-Orchestrator' },
      { icon: Brain, label: 'Next-Best-Action', desc: 'Empfehlungslogik in Echtzeit' },
      { icon: Sparkles, label: 'Knowledge Graph & RAG', desc: 'Kunden- und Produktwissen' },
      { icon: Gauge, label: 'Policy & Guardrails', desc: 'Leitplanken für KI-Antworten' },
    ],
  },
  {
    id: 'business',
    title: 'Business Capabilities',
    description: 'Fachlogik der Beratung — als wiederverwendbare Services.',
    color: '#34d399',
    colorDeep: '#059669',
    items: [
      { icon: User, label: '360°-Kundensicht', desc: 'Kanalübergreifendes Profil' },
      { icon: Target, label: 'Cross-Sell Engine', desc: 'Potenziale auf Kundenbasis' },
      { icon: ClipboardList, label: 'Advisory-Workflows', desc: 'Beratungsstrecken & Protokolle' },
      { icon: ShieldCheck, label: 'Compliance-Assistant', desc: 'Prüfungen in Echtzeit' },
    ],
  },
  {
    id: 'data',
    title: 'Daten- & ML-Plattform',
    description: 'Ein kontinuierlicher Strom von Wissen und Signalen.',
    color: '#fbbf24',
    colorDeep: '#d97706',
    items: [
      { icon: Zap, label: 'Event Stream', desc: 'Kafka-basierte Kundenereignisse' },
      { icon: Database, label: 'Feature Store', desc: 'Berater- & Kundenfeatures' },
      { icon: Layers, label: 'Vector Store', desc: 'Einbettungen für RAG' },
      { icon: Network, label: 'LLM Gateway', desc: 'Zentraler Modellzugang' },
    ],
  },
  {
    id: 'core',
    title: 'Kernsysteme',
    description: 'Bestandssysteme als APIs — keine Silos mehr.',
    color: '#fb7185',
    colorDeep: '#e11d48',
    items: [
      { icon: Users, label: 'CRM', desc: 'Kunden- & Interaktionsdaten' },
      { icon: Database, label: 'Bestandssystem', desc: 'Produkte, Konten, Verträge' },
      { icon: ClipboardList, label: 'Produktsystem', desc: 'Konditionen & Angebote' },
      { icon: Network, label: 'Abrechnung & Reporting', desc: 'Buchungen & Meldungen' },
    ],
  },
  {
    id: 'foundation',
    title: 'Plattform-Fundament',
    description: 'Cloud-nativ, Zero Trust, beobachtbar.',
    color: '#22d3ee',
    colorDeep: '#0891b2',
    items: [
      { icon: Cloud, label: 'Cloud-Native', desc: 'Kubernetes & Service Mesh' },
      { icon: Lock, label: 'Zero-Trust Security', desc: 'Identität als Perimeter' },
      { icon: Eye, label: 'Observability', desc: 'Logs, Metriken, Traces' },
      { icon: Network, label: 'Event Backbone', desc: 'Ereignisorientierte Integration' },
    ],
  },
]

function LayerCard({ layer, index }) {
  return (
    <div
      className="bdz-card bdz-fade-in p-5 md:p-6 relative"
      style={{ animationDelay: `${index * 80 + 200}ms` }}
    >
      {layer.highlight && (
        <div
          className="bdz-halo"
          style={{
            background: `radial-gradient(circle, ${layer.color}55 0%, transparent 70%)`,
          }}
        />
      )}

      <div className="flex items-start gap-4 mb-5">
        <div
          className="shrink-0 rounded-xl px-3 py-2 text-xs font-bold tracking-widest uppercase"
          style={{
            background: `${layer.color}22`,
            color: layer.color,
            border: `1px solid ${layer.color}55`,
          }}
        >
          L{index + 1}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-white font-semibold text-lg md:text-xl tracking-tight">
            {layer.title}
          </h3>
          <p className="text-slate-400 text-sm mt-0.5">{layer.description}</p>
        </div>
        {layer.highlight && (
          <span
            className="hidden md:inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-semibold tracking-wide"
            style={{
              background: `${layer.color}22`,
              color: layer.color,
              border: `1px solid ${layer.color}66`,
            }}
          >
            KI-Kern
          </span>
        )}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {layer.items.map((item) => {
          const Icon = item.icon
          return (
            <div
              key={item.label}
              className="rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 transition-colors p-3"
            >
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center mb-2"
                style={{
                  background: `${layer.color}22`,
                  border: `1px solid ${layer.color}44`,
                }}
              >
                <Icon size={16} color={layer.color} strokeWidth={1.75} />
              </div>
              <div className="text-white text-sm font-medium leading-tight">
                {item.label}
              </div>
              <div className="text-slate-400 text-xs mt-1 leading-snug">
                {item.desc}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function StackConnector({ color }) {
  return (
    <div className="flex justify-center -my-2 relative z-10 pointer-events-none">
      <svg width="28" height="36" viewBox="0 0 28 36" className="bdz-arch-line">
        <line
          x1="14"
          y1="0"
          x2="14"
          y2="36"
          stroke={color}
          strokeWidth="1.5"
          strokeDasharray="3 4"
        />
        <circle cx="14" cy="32" r="2.5" fill={color} />
      </svg>
    </div>
  )
}

export default function VertriebsarbeitsplatzArchitektur() {
  return (
    <div className="bdz-stage">
      <div className="bdz-grid" />

      <div
        className="bdz-pulse-glow pointer-events-none absolute"
        style={{
          left: '-5%',
          top: '10%',
          width: 600,
          height: 600,
          background: 'radial-gradient(circle, rgba(168,85,247,0.35), transparent 70%)',
          filter: 'blur(70px)',
        }}
      />
      <div
        className="bdz-pulse-glow pointer-events-none absolute"
        style={{
          right: '-5%',
          bottom: '5%',
          width: 540,
          height: 540,
          background: 'radial-gradient(circle, rgba(52,211,153,0.25), transparent 70%)',
          filter: 'blur(70px)',
          animationDelay: '2s',
        }}
      />

      {/* Top bar */}
      <header className="relative z-20 px-6 md:px-10 py-5 flex items-center justify-between">
        <a
          href="#/modul/betriebsmodell"
          className="inline-flex items-center gap-2 text-sm text-slate-300 hover:text-white transition-colors no-underline"
        >
          <ArrowLeft size={16} strokeWidth={2} />
          Zurück zum Betriebsmodell
        </a>
        <a
          href="#/"
          className="text-sm text-slate-400 hover:text-white transition-colors no-underline"
        >
          Alle Module
        </a>
      </header>

      {/* Hero */}
      <section className="relative z-10 px-6 md:px-10 max-w-6xl mx-auto pt-6 pb-8">
        <div className="flex items-center gap-2 text-xs font-medium text-slate-400 tracking-widest uppercase mb-5 bdz-fade-in">
          <span>Bank der Zukunft</span>
          <ChevronRight size={12} />
          <span>Betriebsmodell</span>
          <ChevronRight size={12} />
          <span style={{ color: '#a78bfa' }}>Vertriebsarbeitsplatz</span>
        </div>

        <div className="flex flex-col md:flex-row items-start gap-6 md:gap-8">
          <div
            className="bdz-fade-in shrink-0 rounded-3xl flex items-center justify-center"
            style={{
              width: 88,
              height: 88,
              background: 'linear-gradient(135deg, #a78bfa 0%, #6366f1 100%)',
              boxShadow: '0 18px 48px rgba(99,102,241,0.5), inset 0 1px 0 rgba(255,255,255,0.25)',
              animationDelay: '60ms',
            }}
          >
            <Workflow size={44} color="white" strokeWidth={1.5} />
          </div>

          <div className="flex-1 min-w-0">
            <h1
              className="bdz-fade-in text-white font-bold tracking-tight text-4xl md:text-5xl leading-[1.05]"
              style={{ animationDelay: '120ms' }}
            >
              Vertriebsarbeitsplatz{' '}
              <span
                style={{
                  background: 'linear-gradient(90deg, #a78bfa 0%, #34d399 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}
              >
                der Zukunft
              </span>
            </h1>
            <p
              className="bdz-fade-in mt-4 text-slate-300 text-base md:text-lg leading-relaxed max-w-3xl"
              style={{ animationDelay: '200ms' }}
            >
              Ein KI-nativer Arbeitsplatz für Berater: Orchestrierte Agenten, eine 360°-Sicht auf
              den Kunden, Echtzeit-Empfehlungen und Compliance by Design — alles auf einer
              modularen, cloud-nativen Plattform.
            </p>
          </div>
        </div>

        {/* KPI row */}
        <div
          className="bdz-fade-in mt-8 grid grid-cols-2 md:grid-cols-4 gap-3"
          style={{ animationDelay: '280ms' }}
        >
          {[
            { label: 'Bearbeitungszeit', value: '−45 %', hint: 'durch KI-Entlastung' },
            { label: 'Cross-Sell Rate', value: '+30 %', hint: 'durch Next-Best-Action' },
            { label: 'Compliance-Checks', value: 'Echtzeit', hint: 'statt nachgelagert' },
            { label: 'Onboarding', value: '2 Tage', hint: 'statt 2 Wochen' },
          ].map((kpi) => (
            <div
              key={kpi.label}
              className="rounded-xl border border-white/10 bg-white/5 p-4"
            >
              <div className="text-slate-400 text-xs uppercase tracking-wider">
                {kpi.label}
              </div>
              <div className="text-white font-bold text-2xl mt-1">{kpi.value}</div>
              <div className="text-slate-500 text-xs mt-0.5">{kpi.hint}</div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA: live demo */}
      <section className="relative z-10 px-6 md:px-10 max-w-6xl mx-auto pb-10">
        <div
          className="bdz-card bdz-fade-in relative overflow-hidden p-6 md:p-7"
          style={{ animationDelay: '320ms' }}
        >
          <div
            className="bdz-halo"
            style={{
              background:
                'radial-gradient(circle, rgba(168,85,247,0.4) 0%, transparent 70%)',
            }}
          />
          <div className="flex flex-col md:flex-row items-start md:items-center gap-5 md:gap-8">
            <div className="flex-1">
              <div
                className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-[11px] font-semibold tracking-widest uppercase mb-3"
                style={{
                  background: 'rgba(168,85,247,0.2)',
                  color: '#c4b5fd',
                  border: '1px solid rgba(168,85,247,0.5)',
                }}
              >
                <Play size={11} strokeWidth={2.5} /> Live-Demo
              </div>
              <h2 className="text-white font-semibold text-2xl md:text-3xl tracking-tight">
                In die produktive Anwendung springen
              </h2>
              <p className="text-slate-300 mt-2 max-w-2xl">
                Direkt in den lauffähigen Vertriebsarbeitsplatz wechseln — mit Agenturansicht,
                Kunden, Verträgen, KI-Assistent und 360°-Cockpit.
              </p>
            </div>
            <div className="flex flex-col gap-2 w-full md:w-auto">
              <a
                href={VAB_URL}
                className="inline-flex items-center justify-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold text-white no-underline transition-transform hover:scale-[1.03]"
                style={{
                  background: 'linear-gradient(135deg, #a78bfa 0%, #6366f1 100%)',
                  boxShadow: '0 14px 40px rgba(99,102,241,0.5)',
                }}
              >
                Vertriebsarbeitsplatz öffnen
                <ExternalLink size={14} strokeWidth={2.25} />
              </a>
              <a
                href={VAB_URL + '#/versicherung/cockpit'}
                className="inline-flex items-center justify-center gap-2 rounded-xl px-6 py-2.5 text-xs font-medium no-underline border border-white/20 bg-white/5 text-white hover:bg-white/10 transition-colors"
              >
                Direkt ins Cockpit
                <ArrowRight size={12} strokeWidth={2.25} />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Architecture section */}
      <section className="relative z-10 px-6 md:px-10 max-w-6xl mx-auto pb-14">
        <div className="flex items-center gap-2 mb-6">
          <h2 className="text-white font-semibold text-xl md:text-2xl tracking-tight">
            Architektur-Übersicht
          </h2>
          <span className="text-slate-500 text-sm">·</span>
          <span className="text-slate-400 text-sm">6 Layer · Ende-zu-Ende</span>
        </div>

        <div>
          {LAYERS.map((layer, i) => (
            <div key={layer.id}>
              <LayerCard layer={layer} index={i} />
              {i < LAYERS.length - 1 && <StackConnector color={layer.color} />}
            </div>
          ))}
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="relative z-10 px-6 md:px-10 max-w-6xl mx-auto pb-16">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 rounded-2xl border border-white/10 bg-white/5 p-6">
          <div>
            <div className="text-white font-semibold text-lg">
              Bereit, den Arbeitsplatz der Zukunft zu erleben?
            </div>
            <div className="text-slate-400 text-sm">
              Alle Ebenen der Architektur im Zusammenspiel — in der laufenden Demo.
            </div>
          </div>
          <a
            href={VAB_URL}
            className="inline-flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold text-white no-underline"
            style={{
              background: 'linear-gradient(135deg, #a78bfa 0%, #34d399 100%)',
              boxShadow: '0 14px 40px rgba(99,102,241,0.4)',
            }}
          >
            Zum Vertriebsarbeitsplatz
            <ArrowRight size={14} strokeWidth={2.25} />
          </a>
        </div>
      </section>
    </div>
  )
}
