import { useState } from 'react'
import { ArrowRight, Play } from 'lucide-react'

// Animierte Bank-Haus-Landing.
// SVG-basiertes Haus mit 3 Etagen + Dach + Fundament. Jede Etage und der
// Lieferwagen davor sind klickbar und navigieren zu einem Modul.

const FLOOR_TO_MODULE = {
  roof:     { id: 'transitionspfad',         label: 'Transformationspfad' },
  level3:   { id: 'bank-der-zukunft',        label: 'Bank der Zukunft',         featured: true },
  level2:   { id: 'betriebsmodell-zukunft',  label: 'Betriebsmodell der Zukunft' },
  level1:   { id: 'kundenperspektive',       label: 'Kundenperspektive' },
  delivery: { id: 'angebotsbausteine',       label: 'Angebotsbausteine' },
}

function navigateToModule(id) {
  if (typeof window !== 'undefined') window.location.hash = `#/modul/${id}`
}

export default function HouseLandingPage() {
  const [hovered, setHovered] = useState(null)

  return (
    <div className="bdz-stage min-h-screen overflow-hidden relative">
      <div className="bdz-grid absolute inset-0 opacity-40" />

      {/* Header */}
      <header className="relative z-20 px-6 md:px-10 py-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{
              background: 'linear-gradient(135deg, #0ea5e9 0%, #6366f1 100%)',
              boxShadow: '0 6px 20px rgba(99,102,241,0.45)',
            }}
          >
            <span className="text-white font-bold text-sm">BdZ</span>
          </div>
          <div className="flex flex-col">
            <span className="text-white font-bold text-base leading-none">Bank der Zukunft</span>
            <span className="text-slate-400 text-xs uppercase tracking-widest">Banking im KI-Zeitalter · 2035</span>
          </div>
        </div>
        <a href="/" className="text-slate-300 hover:text-white text-xs no-underline">Zur Plattform</a>
      </header>

      {/* Tagline */}
      <section className="relative z-10 px-6 md:px-10 max-w-5xl mx-auto text-center pt-2 pb-4">
        <h1 className="text-white font-bold tracking-tight text-3xl md:text-4xl leading-[1.1] bdz-fade-in">
          Klicke auf eine Etage —{' '}
          <span style={{ background: 'linear-gradient(90deg, #38bdf8 0%, #a78bfa 50%, #34d399 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            so wird Banking 2035
          </span>
        </h1>
        <p className="mt-3 text-slate-300 text-sm md:text-base max-w-2xl mx-auto bdz-fade-in" style={{ animationDelay: '180ms' }}>
          Vom Schalter zum KI-Avatar, von Operations bis zur Vorstandsetage —
          jede Etage zeigt einen Workshop-Baustein. Kunden, Berater und Bots laufen
          mittendrin durch das Haus.
        </p>
        <div className="mt-5 flex items-center justify-center gap-3 bdz-fade-in" style={{ animationDelay: '300ms' }}>
          <a href="#/modul/bank-der-zukunft" className="inline-flex items-center gap-2 rounded-full bg-white text-slate-900 px-5 py-2.5 text-sm font-semibold no-underline hover:scale-[1.03] transition-transform">
            <Play size={14} strokeWidth={2.5} /> Workshop starten
          </a>
          <a href="#/modul/kundenperspektive" className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/5 text-white px-5 py-2.5 text-sm no-underline hover:bg-white/10 transition-colors">
            Mit Kundenperspektive beginnen <ArrowRight size={14} strokeWidth={2.25} />
          </a>
        </div>
      </section>

      {/* Stage SVG */}
      <div className="relative z-10 w-full" style={{ height: 'min(900px, 75vh)' }}>
        <svg
          viewBox="0 0 1600 900"
          preserveAspectRatio="xMidYMid meet"
          className="w-full h-full"
          aria-label="Animiertes Haus-Modell der Bank der Zukunft"
        >
          {/* Sky / Ground / House / People — gefüllt in den nächsten Schritten */}
          <defs>
            <linearGradient id="bdz-sky" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%"  stopColor="#0c1d3a" />
              <stop offset="55%" stopColor="#1e3a5f" />
              <stop offset="100%" stopColor="#3b6ba5" />
            </linearGradient>
            <linearGradient id="bdz-ground" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%"  stopColor="#1f3a2e" />
              <stop offset="100%" stopColor="#0f1d17" />
            </linearGradient>
          </defs>
          <rect width="1600" height="900" fill="url(#bdz-sky)" />

          {/* Sterne (oberer Sky-Bereich) */}
          <g>
            {[
              [120, 80], [240, 60], [380, 100], [520, 50], [690, 90],
              [840, 65], [990, 95], [1140, 55], [1290, 80], [1430, 110],
              [180, 200], [340, 220], [500, 180], [780, 210], [1080, 180],
              [1240, 220], [1400, 200],
            ].map(([cx, cy], i) => (
              <circle
                key={i}
                cx={cx}
                cy={cy}
                r="1.4"
                fill="white"
                className="bdz-twinkle"
                style={{ animationDelay: `${(i * 0.37) % 3}s` }}
              />
            ))}
          </g>

          {/* Sonne / Mond (warmer Akzent oben rechts) */}
          <g>
            <circle cx="1430" cy="170" r="60" fill="#fde68a" opacity="0.18" />
            <circle cx="1430" cy="170" r="42" fill="#fde68a" opacity="0.85" />
          </g>

          {/* Wolken (3 Schichten, unterschiedliche Geschwindigkeiten) */}
          <g className="bdz-cloud-1" opacity="0.85">
            <ellipse cx="0" cy="160" rx="80" ry="22" fill="white" />
            <ellipse cx="60" cy="148" rx="55" ry="20" fill="white" />
            <ellipse cx="-50" cy="170" rx="48" ry="18" fill="white" />
          </g>
          <g className="bdz-cloud-2" opacity="0.6">
            <ellipse cx="0" cy="240" rx="90" ry="24" fill="white" />
            <ellipse cx="70" cy="226" rx="60" ry="22" fill="white" />
          </g>
          <g className="bdz-cloud-3" opacity="0.7">
            <ellipse cx="0" cy="310" rx="65" ry="18" fill="white" />
            <ellipse cx="45" cy="300" rx="40" ry="14" fill="white" />
          </g>


          <rect x="0" y="720" width="1600" height="180" fill="url(#bdz-ground)" />
          <rect x="0" y="720" width="1600" height="3" fill="#0a1410" />

          {/* Pfad zur Tür (Transformations-Pfad) */}
          <g
            className="bdz-floor-hit"
            onClick={() => navigateToModule(FLOOR_TO_MODULE.roof.id)}
            onMouseEnter={() => setHovered('roof')}
            onMouseLeave={() => setHovered(null)}
          >
            <path
              d="M 100 880 Q 380 800, 600 770 T 800 740"
              stroke="#7d6448"
              strokeWidth="46"
              fill="none"
              strokeLinecap="round"
            />
            <path
              d="M 100 880 Q 380 800, 600 770 T 800 740"
              stroke="#a18167"
              strokeWidth="40"
              fill="none"
              strokeLinecap="round"
            />
            {/* Schrittsteine */}
            {[
              [180, 856], [280, 832], [380, 808], [480, 790],
              [580, 776], [680, 760], [770, 744],
            ].map(([cx, cy], i) => (
              <ellipse
                key={i}
                cx={cx}
                cy={cy}
                rx="22"
                ry="9"
                fill="#bfa17c"
                stroke="#7d6448"
                strokeWidth="1.5"
              />
            ))}
            {/* Pfad-Label */}
            <g transform="translate(220, 700)">
              <rect x="-78" y="-22" width="156" height="32" rx="16" fill="#fbbf24" stroke="#92400e" strokeWidth="1.5" />
              <text x="0" y="-2" textAnchor="middle" fill="#451a03" fontSize="13" fontWeight="700" fontFamily="DM Sans, sans-serif">
                Transformationspfad
              </text>
            </g>
          </g>

          {/* HAUS — Fundament-Sockel */}
          <rect x="465" y="700" width="670" height="22" fill="#3a3a3a" />
          <rect x="465" y="697" width="670" height="6" fill="#1f2937" />

          {/* Etage 1 — Erdgeschoss / Kundenperspektive */}
          <g
            className="bdz-floor-hit"
            onClick={() => navigateToModule(FLOOR_TO_MODULE.level1.id)}
            onMouseEnter={() => setHovered('level1')}
            onMouseLeave={() => setHovered(null)}
          >
            <rect x="480" y="560" width="640" height="140" fill="#e8d5a8" stroke="#3a2a14" strokeWidth="2.5" />
            <rect x="480" y="560" width="640" height="6" fill="#a78859" />
          </g>

          {/* Etage 2 — 1. OG / Betriebsmodell der Zukunft */}
          <g
            className="bdz-floor-hit"
            onClick={() => navigateToModule(FLOOR_TO_MODULE.level2.id)}
            onMouseEnter={() => setHovered('level2')}
            onMouseLeave={() => setHovered(null)}
          >
            <rect x="480" y="400" width="640" height="160" fill="#dec79a" stroke="#3a2a14" strokeWidth="2.5" />
            <rect x="480" y="400" width="640" height="6" fill="#a78859" />
          </g>

          {/* Etage 3 — Penthouse / Bank der Zukunft (featured) */}
          <g
            className="bdz-floor-hit bdz-penthouse-pulse"
            onClick={() => navigateToModule(FLOOR_TO_MODULE.level3.id)}
            onMouseEnter={() => setHovered('level3')}
            onMouseLeave={() => setHovered(null)}
          >
            <rect x="480" y="240" width="640" height="160" fill="#d4be8c" stroke="#3a2a14" strokeWidth="2.5" />
            <rect x="480" y="240" width="640" height="6" fill="#a78859" />
            {/* Featured-Banner */}
            <rect x="690" y="252" width="220" height="26" rx="6" fill="#0ea5e9" />
            <text x="800" y="270" textAnchor="middle" fill="white" fontSize="13" fontWeight="700" fontFamily="DM Sans, sans-serif" letterSpacing="2">
              FOKUS · BANK 2035
            </text>
          </g>

          {/* Dach */}
          <g
            className="bdz-floor-hit"
            onClick={() => navigateToModule(FLOOR_TO_MODULE.roof.id)}
            onMouseEnter={() => setHovered('roof')}
            onMouseLeave={() => setHovered(null)}
          >
            <polygon points="450,240 800,120 1150,240" fill="#7c2d12" stroke="#451a03" strokeWidth="2.5" />
            <polygon points="450,240 800,120 1150,240 800,250" fill="#5b1d0c" opacity="0.4" />
            {/* Schornstein mit aufsteigendem Rauch (statisch) */}
            <rect x="940" y="155" width="22" height="50" fill="#3a2a14" />
            <rect x="940" y="150" width="22" height="6" fill="#1f2937" />
          </g>

          {/* Fahnen-Mast auf dem Dach */}
          <line x1="800" y1="120" x2="800" y2="60" stroke="#cbd5e1" strokeWidth="2" />
          <polygon points="800,60 850,72 800,84" fill="#0ea5e9" />
          <text x="857" y="78" fontSize="11" fontWeight="700" fill="#cbd5e1" fontFamily="DM Sans, sans-serif">2035</text>

          {/* Fenster Etage 3 — Penthouse mit großem Fenster (Vorstandsetage) */}
          <g pointerEvents="none">
            <rect x="510" y="280" width="180" height="100" fill="#bae6fd" stroke="#3a2a14" strokeWidth="2" />
            <line x1="600" y1="280" x2="600" y2="380" stroke="#3a2a14" strokeWidth="1.5" />
            <line x1="510" y1="330" x2="690" y2="330" stroke="#3a2a14" strokeWidth="1.5" />
            <rect x="930" y="280" width="180" height="100" fill="#bae6fd" stroke="#3a2a14" strokeWidth="2" className="bdz-window-glow" />
            <line x1="1020" y1="280" x2="1020" y2="380" stroke="#3a2a14" strokeWidth="1.5" />
            <line x1="930" y1="330" x2="1110" y2="330" stroke="#3a2a14" strokeWidth="1.5" />
            <text x="800" y="345" textAnchor="middle" fontSize="14" fontWeight="700" fill="#1e293b" fontFamily="DM Sans, sans-serif">
              Vorstands-Etage
            </text>
            <text x="800" y="365" textAnchor="middle" fontSize="11" fill="#475569" fontFamily="DM Sans, sans-serif">
              CAIDO · AI Governance Board
            </text>
          </g>

          {/* Fenster Etage 2 — Operations / Server-Visualisierung */}
          <g pointerEvents="none">
            <rect x="510" y="430" width="170" height="100" fill="#1e293b" stroke="#3a2a14" strokeWidth="2" />
            {/* Mini-Server-Racks */}
            {[0, 1, 2].map((i) => (
              <g key={i} transform={`translate(${525 + i * 50}, 445)`}>
                <rect x="0" y="0" width="35" height="70" fill="#0f172a" stroke="#475569" />
                <circle cx="6" cy="8" r="2.5" fill="#22c55e" className="bdz-led" style={{ animationDelay: `${i * 0.4}s` }} />
                <circle cx="14" cy="8" r="2.5" fill="#fbbf24" className="bdz-led" style={{ animationDelay: `${i * 0.4 + 0.2}s` }} />
                <rect x="4" y="20" width="27" height="3" fill="#475569" />
                <rect x="4" y="28" width="27" height="3" fill="#475569" />
                <rect x="4" y="36" width="27" height="3" fill="#475569" />
                <rect x="4" y="44" width="27" height="3" fill="#475569" />
                <rect x="4" y="52" width="27" height="3" fill="#475569" />
              </g>
            ))}
            <text x="595" y="555" textAnchor="middle" fontSize="11" fill="#475569" fontFamily="DM Sans, sans-serif">Operations · Hyperautomation</text>
            <rect x="930" y="430" width="170" height="100" fill="#1e293b" stroke="#3a2a14" strokeWidth="2" />
            {/* Process-Mining-Diagramm-Andeutung */}
            <polyline points="940,510 970,490 1000,500 1030,470 1060,485 1090,460" stroke="#22d3ee" strokeWidth="2.5" fill="none" />
            <circle cx="940" cy="510" r="3" fill="#22d3ee" />
            <circle cx="970" cy="490" r="3" fill="#22d3ee" />
            <circle cx="1000" cy="500" r="3" fill="#22d3ee" />
            <circle cx="1030" cy="470" r="3" fill="#22d3ee" />
            <circle cx="1060" cy="485" r="3" fill="#22d3ee" />
            <circle cx="1090" cy="460" r="3" fill="#22d3ee" />
            <text x="1015" y="555" textAnchor="middle" fontSize="11" fill="#475569" fontFamily="DM Sans, sans-serif">Process Mining · KPIs</text>
          </g>

          {/* Erdgeschoss — Schaufenster + Berater + Kunde + KI-Avatar */}
          <g pointerEvents="none">
            {/* Großes Schaufenster links */}
            <rect x="510" y="585" width="200" height="100" fill="#bfdbfe" stroke="#3a2a14" strokeWidth="2" />
            {/* Schreibtisch */}
            <rect x="540" y="660" width="140" height="10" fill="#7c2d12" />
            <rect x="540" y="668" width="6" height="14" fill="#7c2d12" />
            <rect x="674" y="668" width="6" height="14" fill="#7c2d12" />
            {/* Berater (sitzend, links am Schreibtisch) */}
            <g transform="translate(560, 620)">
              <circle cx="0" cy="0" r="9" fill="#fbbf24" stroke="#0f172a" strokeWidth="1" />
              <rect x="-9" y="9" width="18" height="22" rx="4" fill="#3b82f6" />
              <rect x="-7" y="31" width="6" height="10" fill="#1e293b" />
              <rect x="1" y="31" width="6" height="10" fill="#1e293b" />
              {/* Winkender Arm */}
              <g transform="translate(8, 14)" className="bdz-wave">
                <rect x="0" y="0" width="3" height="14" fill="#3b82f6" />
                <circle cx="1.5" cy="14" r="2.5" fill="#fbbf24" />
              </g>
            </g>
            {/* Kunde (sitzend, rechts am Schreibtisch) */}
            <g transform="translate(660, 624)">
              <circle cx="0" cy="0" r="9" fill="#fde68a" stroke="#0f172a" strokeWidth="1" />
              <rect x="-9" y="9" width="18" height="22" rx="4" fill="#10b981" />
              <rect x="-7" y="31" width="6" height="10" fill="#1e293b" />
              <rect x="1" y="31" width="6" height="10" fill="#1e293b" />
            </g>
            {/* Sprechblase über Kunden */}
            <g transform="translate(670, 600)" className="bdz-bubble" style={{ animationDelay: '2s' }}>
              <rect x="-50" y="-22" width="100" height="22" rx="11" fill="white" stroke="#0f172a" strokeWidth="1" />
              <polygon points="-6,0 6,0 0,8" fill="white" stroke="#0f172a" strokeWidth="1" />
              <text x="0" y="-7" textAnchor="middle" fontSize="9" fill="#0f172a" fontFamily="DM Sans, sans-serif">Wann kommt die Zusage?</text>
            </g>

            {/* KI-Avatar-Bildschirm rechts vom Eingang */}
            <rect x="900" y="585" width="180" height="100" fill="#0f172a" stroke="#3a2a14" strokeWidth="2" />
            <rect x="908" y="592" width="164" height="86" fill="#1e293b" />
            {/* Avatar-Gesicht */}
            <circle cx="990" cy="625" r="18" fill="#a78bfa" />
            <circle cx="984" cy="622" r="2" fill="white" />
            <circle cx="996" cy="622" r="2" fill="white" />
            <path d="M984 632 Q990 637 996 632" stroke="white" strokeWidth="1.5" fill="none" />
            <text x="990" y="665" textAnchor="middle" fontSize="9" fill="#22d3ee" fontFamily="DM Sans, sans-serif">KI-AVATAR · 24/7</text>

            {/* Tür mittig */}
            <rect x="755" y="610" width="90" height="90" fill="#5b3a1f" stroke="#3a2a14" strokeWidth="2" />
            <rect x="755" y="610" width="90" height="6" fill="#3a2a14" />
            <line x1="800" y1="616" x2="800" y2="700" stroke="#3a2a14" strokeWidth="1.5" />
            <circle cx="780" cy="660" r="2" fill="#fbbf24" />
            <circle cx="820" cy="660" r="2" fill="#fbbf24" />

            {/* EG-Label */}
            <text x="800" y="585" textAnchor="middle" fontSize="11" fontWeight="700" fill="#1e293b" fontFamily="DM Sans, sans-serif">
              Schalter · Beratung · Service
            </text>
          </g>

          {/* Vorbeilaufende Personen — ohne Sprechblasen (zu unruhig im Bild) */}
          {[
            { id: 'p1', dir: 'r', shirt: '#3b82f6', skin: '#fbbf24', y: 850, dur: 38, delay: 0  },
            { id: 'p2', dir: 'l', shirt: '#10b981', skin: '#fde68a', y: 870, dur: 46, delay: 12 },
            { id: 'p3', dir: 'r', shirt: '#a78bfa', skin: '#fcd34d', y: 835, dur: 50, delay: 24 },
          ].map((p) => (
            <g
              key={p.id}
              className={p.dir === 'r' ? 'bdz-person-walk-r' : 'bdz-person-walk-l'}
              style={{ animationDuration: `${p.dur}s`, animationDelay: `${-p.delay}s` }}
              pointerEvents="none"
            >
              <g transform={`translate(0, ${p.y})`}>
                {/* Kopf */}
                <circle cx="0" cy="-26" r="7" fill={p.skin} stroke="#0f172a" strokeWidth="1" />
                {/* Körper */}
                <rect x="-7" y="-19" width="14" height="20" rx="3" fill={p.shirt} />
                {/* Arme */}
                <rect x="-10" y="-17" width="3" height="14" fill={p.shirt} className={p.dir === 'r' ? 'bdz-arm-1' : 'bdz-arm-2'} />
                <rect x="7"   y="-17" width="3" height="14" fill={p.shirt} className={p.dir === 'r' ? 'bdz-arm-2' : 'bdz-arm-1'} />
                {/* Beine */}
                <rect x="-5" y="1" width="3.5" height="14" fill="#1e293b" className={p.dir === 'r' ? 'bdz-leg-1' : 'bdz-leg-2'} />
                <rect x="1.5" y="1" width="3.5" height="14" fill="#1e293b" className={p.dir === 'r' ? 'bdz-leg-2' : 'bdz-leg-1'} />
              </g>
            </g>
          ))}

          {/* Deloitte-Stand vor dem Haus (Angebotsbausteine) */}
          <g
            className="bdz-floor-hit"
            onClick={() => navigateToModule(FLOOR_TO_MODULE.delivery.id)}
            onMouseEnter={() => setHovered('delivery')}
            onMouseLeave={() => setHovered(null)}
          >
            {/* Marktstand-Pfosten */}
            <rect x="180" y="640" width="6" height="80" fill="#3a2a14" />
            <rect x="320" y="640" width="6" height="80" fill="#3a2a14" />
            {/* Markisendach */}
            <polygon points="170,640 336,640 320,605 186,605" fill="#86bc25" />
            <polygon points="170,640 336,640 252,652" fill="#5d8419" opacity="0.6" />
            {/* Theke */}
            <rect x="170" y="700" width="166" height="20" fill="#cbd5e1" stroke="#0f172a" strokeWidth="1" />
            {/* Schild "Angebote" */}
            <rect x="194" y="618" width="118" height="22" rx="4" fill="white" />
            <text x="253" y="634" textAnchor="middle" fontSize="13" fontWeight="700" fill="#0a3818" fontFamily="DM Sans, sans-serif">
              Angebote
            </text>
            {/* Pakete als kleine Stapel auf Theke */}
            <rect x="190" y="688" width="22" height="14" fill="#fb7185" />
            <rect x="220" y="690" width="22" height="12" fill="#38bdf8" />
            <rect x="248" y="685" width="22" height="17" fill="#a78bfa" />
            <rect x="280" y="690" width="22" height="12" fill="#fbbf24" />
            {/* Verkäufer dahinter (Deloitte-Berater) */}
            <g transform="translate(253, 670)">
              <circle cx="0" cy="0" r="8" fill="#fbbf24" stroke="#0f172a" strokeWidth="1" />
              <rect x="-9" y="7" width="18" height="20" rx="3" fill="#86bc25" />
            </g>
          </g>

          {/* Etagen-Labels rechts neben dem Haus (Modul-Namen) */}
          <g pointerEvents="none" fontFamily="DM Sans, sans-serif">
            <text x="1145" y="320" fontSize="14" fontWeight="700" fill="#bae6fd">Bank der Zukunft</text>
            <text x="1145" y="338" fontSize="11" fill="#94a3b8">Geschäftsmodelle 2035</text>
            <text x="1145" y="480" fontSize="14" fontWeight="700" fill="#c4b5fd">Betriebsmodell der Zukunft</text>
            <text x="1145" y="498" fontSize="11" fill="#94a3b8">Operations · IT · Vertriebsarbeitsplatz</text>
            <text x="1145" y="640" fontSize="14" fontWeight="700" fill="#86efac">Kundenperspektive</text>
            <text x="1145" y="658" fontSize="11" fill="#94a3b8">Retail · Corporate · Capital Markets</text>
            <line x1="1135" y1="320" x2="1120" y2="320" stroke="#bae6fd" strokeWidth="1.5" />
            <line x1="1135" y1="480" x2="1120" y2="480" stroke="#c4b5fd" strokeWidth="1.5" />
            <line x1="1135" y1="640" x2="1120" y2="640" stroke="#86efac" strokeWidth="1.5" />
          </g>

          {/* Roof-Label links */}
          <g pointerEvents="none" fontFamily="DM Sans, sans-serif">
            <text x="455" y="170" textAnchor="end" fontSize="14" fontWeight="700" fill="#fcd34d">Transformations-</text>
            <text x="455" y="188" textAnchor="end" fontSize="14" fontWeight="700" fill="#fcd34d">pfad</text>
            <text x="455" y="206" textAnchor="end" fontSize="11" fill="#94a3b8">Wellen · Roadmap · Steering</text>
            <line x1="465" y1="180" x2="600" y2="180" stroke="#fcd34d" strokeWidth="1.5" strokeDasharray="3 4" />
          </g>
        </svg>
      </div>

      {/* Hovered floor label (oben rechts overlay) */}
      {hovered && (
        <div className="fixed top-20 right-6 z-30 rounded-xl bg-white/10 backdrop-blur-md border border-white/15 px-4 py-2 text-sm text-white shadow-lg pointer-events-none">
          {FLOOR_TO_MODULE[hovered]?.label}
        </div>
      )}
    </div>
  )
}
