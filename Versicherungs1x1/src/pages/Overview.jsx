import { useRef } from 'react';
import { useModule } from '../hooks/useModule';
import { getIconComponent, Layers, CheckCircle, BookOpen, ChevronDown } from '../components/ui/Icons';
import CountUp from '../components/ui/CountUp';

const LOGO_TOKEN = 'pk_H7vb5Y2lTsW47U4Xq-w3HA';

export default function Overview() {
  const { data, openChapter } = useModule();
  const gridRef = useRef(null);

  return (
    <div className="animate-fade-in-up">
      {/* Landing Hero */}
      <div className="header-gradient py-16 px-6 text-white">
        <div>
          <div className="flex items-center gap-5 mb-6">
            <div className="w-16 h-16 rounded-xl bg-white/20 border border-white/30 overflow-hidden flex items-center justify-center flex-shrink-0">
              <img
                src={`https://img.logo.dev/deloitte.com?token=${LOGO_TOKEN}&format=png&size=200`}
                alt="Deloitte"
                className="h-12 w-12 object-contain"
              />
            </div>
            <div>
              <div className="inline-block text-xs font-semibold tracking-wider uppercase bg-white/15 px-3 py-1 rounded-full mb-2">
                Insurance Strategy & Consulting
              </div>
              <h1 className="text-4xl font-bold tracking-tight">Versicherungs-1×1</h1>
            </div>
          </div>
          <p className="text-white/75 text-base leading-relaxed">
            Das strategische Wissensframework für neue Berater im Bereich Monitor Deloitte Insurance —
            von regulatorischen Grundlagen über Vertriebsstrategien bis hin zu disruptiven Zukunftsthemen.
          </p>

          {/* KPI Strip */}
          <div className="flex items-center gap-6 mt-10 flex-wrap">
            {[
              { target: 254, unit: 'Mrd.\u2009€', label: 'Beitragsvolumen\nDE-Markt 2025' },
              { target: 9, unit: '', label: 'Strategische\nKapitel' },
              { target: 48, unit: '', label: 'Lerneinheiten\nmit 3 Levels' },
              { target: 800, unit: '+', label: 'Fakten, Kennzahlen\n& Praxisbeispiele' },
            ].map((kpi, i) => (
              <div key={i} className="flex items-center gap-6">
                {i > 0 && <div className="w-px h-12 bg-white/20" />}
                <div className="text-center">
                  <div className="text-3xl font-bold">
                    <CountUp target={kpi.target} />
                    {kpi.unit && <span className="text-lg ml-1 font-normal opacity-80">{kpi.unit}</span>}
                  </div>
                  <div className="text-xs text-white/60 mt-1 whitespace-pre-line">{kpi.label}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Pillars */}
          <div className="flex gap-4 mt-10 flex-wrap">
            {[
              { icon: Layers, title: '3 Wissensebenen', sub: 'Level 1 Basics · Level 2 Vertiefung · Level 3 Expert Deep-Dive' },
              { icon: CheckCircle, title: 'Integrierter Wissenscheck', sub: 'Wissen testen und Lücken gezielt schließen' },
              { icon: BookOpen, title: 'Praxisnahes Glossar', sub: 'Über 100 Fachbegriffe mit Kontext erklärt' },
            ].map((p, i) => (
              <div key={i} className="flex-1 min-w-[200px] flex items-start gap-3 text-left bg-white/8 rounded-xl px-4 py-3">
                <p.icon className="w-5 h-5 text-emerald-300 flex-shrink-0 mt-0.5" />
                <div>
                  <div className="font-semibold text-sm">{p.title}</div>
                  <div className="text-xs text-white/55 mt-0.5">{p.sub}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8">
            <button
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-white/15 hover:bg-white/25 rounded-lg text-sm font-medium transition"
              onClick={() => gridRef.current?.scrollIntoView({ behavior: 'smooth' })}
            >
              <ChevronDown className="w-4 h-4" /> Kapitel entdecken
            </button>
          </div>
        </div>
      </div>

      {/* Chapter Grid */}
      <div ref={gridRef} className="px-6 py-10" style={{ scrollMarginTop: '120px' }}>
        <h2 className="text-xl font-bold text-slate-900 mb-6">Alle Kapitel im Überblick</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {data?.chapters?.map((ch, i) => {
            const Icon = getIconComponent(ch.icon);
            return (
              <button
                key={ch.id}
                className="card-base card-hover chapter-card p-5 text-left animate-fade-in-up"
                onClick={() => openChapter(ch.id)}
                style={{ animationDelay: `${Math.min(i, 4) * 60}ms` }}
              >
                <div className="flex items-start gap-4">
                  <div className="chapter-icon-box w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ background: 'var(--mode-pastel)', color: 'var(--mode-primary)' }}
                  >
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-semibold mb-1" style={{ color: 'var(--_fg, var(--text-tertiary))' }}>
                      Kapitel {String(i + 1).padStart(2, '0')}
                    </div>
                    <div className="font-bold text-base mb-1" style={{ color: 'var(--_fg, var(--text-primary))' }}>
                      {ch.title}
                    </div>
                    <div className="text-sm line-clamp-2" style={{ color: 'var(--_fg, var(--text-secondary))' }}>
                      {ch.subtitle}
                    </div>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
