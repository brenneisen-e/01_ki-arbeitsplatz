import { ArrowRight, BookOpen, Shield, ClipboardList, BarChart3, RefreshCcw, Users, Lightbulb } from 'lucide-react';

const PHASEN = [
  { id: 1, name: 'Prozess- und Risikoanalyse', icon: ClipboardList, desc: 'Aufnahme der Prozesse, Identifikation der NFR entlang der Aktivitäten, Anbindung an die Risikolandkarte.' },
  { id: 2, name: 'Identifikation & Dokumentation', icon: Shield, desc: 'Aufnahme aller Schlüsselkontrollen je Risiko, Dokumentation der W-Fragen, Festlegung der Attribute.' },
  { id: 3, name: 'Beurteilung der Wirksamkeit', icon: BarChart3, desc: 'Design-Assessment und Effectiveness-Tests. Findings werden in Maßnahmen überführt.' },
  { id: 4, name: 'Berichterstattung', icon: BookOpen, desc: 'Quartalsweiser Op-Risk-Report an Vorstand und Aufsichtsrat, ad-hoc bei wesentlichen Ereignissen.' },
];

const LOD = [
  { line: '1st LoD', name: 'Fachbereich', desc: 'Operative Durchführung, Eigenkontrolle, dokumentierte Kontrollausführung.', color: '#1D7B3F' },
  { line: '2nd LoD', name: 'Risiko / Compliance / Op-Risk', desc: 'Methodik, Überwachung, Konsolidierung und Validierung.', color: '#2563EB' },
  { line: '3rd LoD', name: 'Interne Revision', desc: 'Unabhängige Prüfung der Wirksamkeit, Berichterstattung an Aufsichtsrat.', color: '#7C3AED' },
];

const VORTEILE = [
  { title: 'Validiert das bestehende IKS', desc: 'ControlHub prüft Vollständigkeit und Konsistenz Ihrer RKM gegen die Risikolandkarte.' },
  { title: 'Identifiziert OpRisk vollständig', desc: 'Vorschläge auf Basis von ORX, BCBS und institutsspezifischen Risikolandkarten.' },
  { title: 'Erfüllt Dokumentations-Anforderungen', desc: 'Methodenkonforme Beschreibungen inkl. W-Fragen und Attribute der Schlüsselkontrollen.' },
  { title: 'Entlastet die 1st Line', desc: 'Aufwandsreduktion um etwa 67 % gegenüber der manuellen Inventarisierung.' },
  { title: 'Unterstützt 2nd und 3rd Line', desc: 'Konsistente Datenbasis und vollständige Audit-Trails.' },
  { title: 'Einsetzbar im Regelbetrieb', desc: 'Periodische Re-Validierung der bestehenden RKM mit Diff-Reports.' },
];

const HERAUSFORDERUNGEN = [
  { title: 'Unvollständige RKM', desc: 'Risiken und Kontrollen werden nicht ganzheitlich erfasst.' },
  { title: 'Abdeckungs-Lücken in kritischen Bereichen', desc: 'Schlüsselkontrollen fehlen oder sind nicht einheitlich klassifiziert.' },
  { title: 'Hoher initialer Aufwand', desc: 'Erstinventarisierung ist zeitintensiv und erfordert hohe Methodenkompetenz.' },
  { title: 'Kapazitäts- und Wissensengpässe', desc: 'Begrenzte Ressourcen in 1st und 2nd Line of Defense.' },
  { title: 'Uneinheitliche Risikobenennung', desc: 'Keine konsistente Nomenklatur und Anbindung an die Risikolandkarte.' },
  { title: 'Qualitätsdefizite bei Kontrollbeschreibungen', desc: 'Fehlende Attribute, unklare Zuordnung und mangelnde Prüffähigkeit.' },
];

export default function MethodikView() {
  return (
    <div className="space-y-5">
      <div className="card-base p-6" style={{ background: 'var(--mode-gradient, linear-gradient(135deg,#0F4D2A,#1D7B3F))', color: 'white' }}>
        <div className="flex items-start gap-4 flex-wrap">
          <div className="w-14 h-14 rounded-xl bg-white/15 border border-white/20 flex items-center justify-center shrink-0">
            <Lightbulb size={28} strokeWidth={1.75} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-[11px] uppercase tracking-wider text-white/70">ControlHub · Methodik</div>
            <h2 className="text-2xl font-semibold mt-1">Vom Prozessdokument zur prüffähigen Risiko-Kontroll-Matrix</h2>
            <p className="text-sm text-white/80 mt-2 max-w-3xl">
              ControlHub strukturiert die Risiko- und Kontrollinventarisierung in vier Schritte. Jeder Schritt liefert
              methodisch konformen Input für den nächsten Schritt — und reduziert den Aufwand der 1st Line um etwa 67 %.
            </p>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-3">
        <div className="card-base p-5">
          <div className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
            <ClipboardList size={16} className="text-red-600" />
            Typische Herausforderungen
          </div>
          <ul className="space-y-2">
            {HERAUSFORDERUNGEN.map(h => (
              <li key={h.title} className="text-[13px] leading-snug">
                <div className="font-semibold text-slate-700">{h.title}</div>
                <div className="text-slate-500">{h.desc}</div>
              </li>
            ))}
          </ul>
        </div>
        <div className="card-base p-5" style={{ background: 'color-mix(in srgb, var(--mode-primary, #0F4D2A) 6%, white)' }}>
          <div className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
            <Shield size={16} className="text-emerald-700" />
            Warum ControlHub?
          </div>
          <ul className="space-y-2">
            {VORTEILE.map(v => (
              <li key={v.title} className="text-[13px] leading-snug">
                <div className="font-semibold text-slate-700">{v.title}</div>
                <div className="text-slate-500">{v.desc}</div>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="card-base p-5">
        <div className="flex items-center gap-2 mb-4">
          <RefreshCcw size={16} className="text-emerald-700" />
          <div className="text-sm font-semibold">IKS-Regelkreis – die vier Phasen</div>
        </div>
        <div className="grid md:grid-cols-4 gap-3">
          {PHASEN.map(p => {
            const Icon = p.icon;
            return (
              <div key={p.id} className="border border-slate-200 rounded-lg p-4 relative">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center mb-2" style={{ background: 'color-mix(in srgb, var(--mode-primary, #0F4D2A) 12%, white)', color: 'var(--mode-primary, #0F4D2A)' }}>
                  <Icon size={20} />
                </div>
                <div className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold">Phase {p.id}</div>
                <div className="font-semibold mt-0.5">{p.name}</div>
                <div className="text-[12px] text-slate-500 mt-1 leading-snug">{p.desc}</div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="card-base p-5">
        <div className="flex items-center gap-2 mb-4">
          <Users size={16} className="text-emerald-700" />
          <div className="text-sm font-semibold">Three-Lines-of-Defense-Modell</div>
        </div>
        <div className="grid md:grid-cols-3 gap-3">
          {LOD.map(l => (
            <div key={l.line} className="rounded-lg border p-4" style={{ borderColor: `color-mix(in srgb, ${l.color} 30%, transparent)`, background: `color-mix(in srgb, ${l.color} 5%, white)` }}>
              <div className="text-[11px] uppercase tracking-wider font-semibold" style={{ color: l.color }}>{l.line}</div>
              <div className="font-semibold mt-1">{l.name}</div>
              <div className="text-[12px] text-slate-600 mt-1 leading-snug">{l.desc}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="card-base p-5">
        <div className="text-sm font-semibold mb-3 flex items-center gap-2">
          <ArrowRight size={16} className="text-emerald-700" /> Workflow im Detail
        </div>
        <ol className="space-y-3">
          {[
            { id: 1, name: 'Prozessanalyse', input: 'Word/PDF/Excel-Dokumentation', activities: 'Auslesen relevanter Prozessschritte', output: 'Strukturierte Liste der Aktivitäten', dauer: '1 h (statt 4 h ohne KI)' },
            { id: 2, name: 'Risikoidentifikation', input: 'Aktivitätenliste + Risikolandkarte', activities: 'Vorschläge je Aktivität mit First/Second/Third-Choice', output: 'Liste an Risiken inkl. EW und Schaden', dauer: '0,5 h (statt 2 h)' },
            { id: 3, name: 'Risikobeschreibung', input: 'Ausgewählte Risikokategorien', activities: 'Beschreibung der Risiken im Format "Ursache–Ereignis–Wirkung"', output: 'Prüffähige Risikobeschreibungen', dauer: '0,5 h (statt 1 h)' },
            { id: 4, name: 'Kontrollidentifikation', input: 'Beschreibung je Risiko', activities: 'Bis zu 4 Kontrollvorschläge inkl. W-Fragen-Detail', output: 'RKM in CSV/Excel/PDF', dauer: '1 h (statt 2 h)' },
          ].map(s => (
            <li key={s.id} className="border border-slate-200 rounded-lg p-4 grid md:grid-cols-5 gap-4">
              <div className="md:col-span-1 flex items-start gap-2">
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm" style={{ background: 'var(--mode-primary, #0F4D2A)' }}>{s.id}</div>
                <div>
                  <div className="font-semibold leading-tight">{s.name}</div>
                  <div className="text-[11px] text-slate-500">{s.dauer}</div>
                </div>
              </div>
              <div>
                <div className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">Input</div>
                <div className="text-[12px] text-slate-700 mt-0.5">{s.input}</div>
              </div>
              <div className="md:col-span-2">
                <div className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">Aktivität</div>
                <div className="text-[12px] text-slate-700 mt-0.5">{s.activities}</div>
              </div>
              <div>
                <div className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">Output</div>
                <div className="text-[12px] text-slate-700 mt-0.5">{s.output}</div>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}
