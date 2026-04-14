import { useEffect, useState } from 'react';
import {
  X, Sparkles, Calendar, Clock, MapPin, Target, User, CheckSquare,
  ListChecks, MessageSquare, FileText, Loader2, Phone, Mail, HelpCircle, ArrowRight,
  Wallet, Link2,
} from 'lucide-react';
import { formatAppointmentDate, formatAppointmentTime, getSimulatedAppointment } from '../../utils/demoClock';
import { useMode } from '../../hooks/useMode';
import LogoImg from './LogoImg';
import { formatEur, berechneAnlagevolumen, berechneKreditvolumen, berechneHaushaltsnetto, berechneFrei } from '../../utils/formatters';

/**
 * TerminPrepModal
 *
 * Wird geöffnet, wenn der Berater auf die bestätigte Terminzusage klickt.
 * Liefert eine KI-gestützte Gesprächsvorbereitung mit Kontext, konkreten
 * Gesprächsbausteinen sowie To-Dos vor und nach dem Termin.
 */
export default function TerminPrepModal({ kunde, termin, onClose }) {
  const [phase, setPhase] = useState('loading');
  const appointment = termin?.datum && termin?.zeit
    ? new Date(`${termin.datum}T${termin.zeit}:00`)
    : getSimulatedAppointment();
  const { navigateTo } = useMode();
  const isKlausImmo = kunde?.id === 'BK00001' && (!termin?.betreff || /immobilien|kredit/i.test(termin.betreff));
  const terminTitel = termin?.betreff || (isKlausImmo ? 'Kreditgespräch Immobilienfinanzierung' : 'Beratungstermin');

  // KI-Generierung simulieren
  useEffect(() => {
    const tmr = setTimeout(() => setPhase('ready'), 1100);
    return () => clearTimeout(tmr);
  }, []);

  // ESC zum Schließen
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose?.(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      <div
        className="w-full max-w-4xl max-h-[92vh] overflow-hidden bg-white rounded-2xl shadow-2xl border border-slate-200 flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between p-5 border-b border-slate-200 bg-gradient-to-r from-violet-50 to-indigo-50">
          <div className="flex items-start gap-3">
            <div
              className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0 shadow-sm"
              style={{ background: 'linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)' }}
            >
              <Sparkles size={22} className="text-white" strokeWidth={2} />
            </div>
            <div>
              <h2 className="font-semibold text-slate-800">KI-Gesprächsvorbereitung</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                {terminTitel} · {kunde?.name || 'Kunde'}
              </p>
              <div className="flex items-center gap-3 mt-2 text-xs">
                <span className="inline-flex items-center gap-1 text-slate-600 bg-white/80 border border-slate-200 px-2 py-0.5 rounded-full">
                  <Calendar size={11} /> {formatAppointmentDate(appointment)}
                </span>
                <span className="inline-flex items-center gap-1 text-slate-600 bg-white/80 border border-slate-200 px-2 py-0.5 rounded-full">
                  <Clock size={11} /> {formatAppointmentTime(appointment)} Uhr
                </span>
                <span className="inline-flex items-center gap-1 text-slate-600 bg-white/80 border border-slate-200 px-2 py-0.5 rounded-full">
                  <MapPin size={11} /> Filiale Gießen
                </span>
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-white/70 transition-colors"
          >
            <X size={18} className="text-slate-500" />
          </button>
        </div>

        {/* Body */}
        {phase === 'loading' ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-3 py-20 text-center">
            <Loader2 size={26} className="text-violet-600 animate-spin" />
            <div>
              <p className="text-sm font-semibold text-slate-700">KI bereitet das Gespräch vor …</p>
              <p className="text-xs text-slate-500 mt-1">
                Analysiert Stammdaten, Potenzial und bisherige Kommunikation.
              </p>
            </div>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto p-5 space-y-3">
            {/* Ausgangslage */}
            <Section color="indigo">
              <SectionTitle icon={Target} label="Ausgangslage" color="indigo" />
              <div className="text-sm text-slate-700 leading-relaxed pt-2">
                {isKlausImmo ? (
                  <>Klaus Fischer (32) ist seit 2018 Kunde der Volksbank Mittelhessen. Er arbeitet als
                  Vertriebsleiter bei der Continental AG, ist verheiratet mit Sabine und hat zwei
                  Kinder (Lukas, 4 und Marie, 1). Nettohaushaltseinkommen: ca. 5.700 €/mtl.
                  Die drei erkannten Signale — auslaufender Ratenkredit bei der Commerzbank, zuteilungsreifer
                  Bausparvertrag und langjähriges Newsletter-Interesse — bilden einen sehr
                  starken Vertriebsimpuls für ein Erstgespräch zur Immobilienfinanzierung.</>
                ) : (
                  <>{kunde?.name}{kunde?.alter ? ` (${kunde.alter})` : ''}
                  {kunde?.eigeneProdukte?.[0]?.seit ? ` ist seit ${kunde.eigeneProdukte[0].seit.slice(0,4)} Kunde` : ' ist Kunde'}
                  {kunde?.beruf ? `, arbeitet als ${kunde.beruf}` : ''}
                  {kunde?.arbeitgeber?.name ? ` bei ${kunde.arbeitgeber.name}` : ''}
                  {kunde?.familienstand ? `, ${kunde.familienstand}` : ''}
                  {kunde?.partner?.name ? ` mit ${kunde.partner.name}` : ''}
                  {(kunde?.kinder?.length || 0) > 0 ? `, ${kunde.kinder.length} ${kunde.kinder.length === 1 ? 'Kind' : 'Kinder'}` : ''}.
                  {' '}Anlass des Termins: <strong>{terminTitel}</strong>. Die KI hat Stammdaten,
                  Bestand und letzte Kommunikation analysiert und unten passende Bausteine
                  für die Vorbereitung zusammengestellt.</>
                )}
              </div>
            </Section>

            {/* Kennzahlen — Klaus-spezifische Story für die Immobilien-Demo */}
            {isKlausImmo && (
              <Section color="slate">
                <SectionTitle icon={FileText} label="Schlüssel-Kennzahlen" color="slate" />
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm pt-2">
                  <KPI label="Freie Liquidität ab 06/2026" value="840 €/mtl." accent="text-emerald-600" />
                  <KPI label="Bauspar-Zuteilung (Q2/2026)" value="30.000 €" accent="text-emerald-600" />
                  <KPI label="VR-Sparkonto" value="15.000 €" />
                  <KPI label="Machbarer Kreditrahmen (ca.)" value="250.000 €" accent="text-indigo-600" />
                </div>
              </Section>
            )}

            {/* Kompakte Finanzübersicht inkl. externe Verbindungen */}
            <Section color="emerald">
              <SectionTitle icon={Wallet} label="Finanzübersicht (kompakt)" color="emerald" />
            {(() => {
              const haushalt = berechneHaushaltsnetto(kunde);
              const frei = berechneFrei(kunde);
              const anlage = berechneAnlagevolumen(kunde);
              const kredit = berechneKreditvolumen(kunde);
              const netto = anlage - kredit;
              return (
                <div className="grid grid-cols-2 md:grid-cols-5 gap-2 text-sm pt-2">
                  <KPI label="Haushaltsnetto" value={`${formatEur(haushalt)}/mtl.`} />
                  <KPI label="Frei verfügbar" value={`${formatEur(Math.max(0, frei))}/mtl.`} accent="text-emerald-600" />
                  <KPI label="Anlagevolumen" value={formatEur(anlage)} />
                  <KPI label="Kreditvolumen" value={formatEur(kredit)} accent="text-amber-700" />
                  <KPI label="Netto-Vermögen" value={formatEur(netto)} accent={netto >= 0 ? 'text-emerald-700' : 'text-red-600'} />
                </div>
              );
            })()}
            </Section>

            {/* Externe Verbindungen (Open Finance / FIDA) */}
            <Section color="sky">
              <SectionTitle icon={Link2} label="Externe Verbindungen (Open Finance)" color="sky" />
            {(() => {
              const fremd = kunde?.fremdProdukte || [];
              if (fremd.length === 0) {
                return <p className="text-xs text-slate-500 italic">Keine externen Verbindungen erfasst.</p>;
              }
              // Pro Institut zusammenfassen (analog OpenFinanceTab) — Volumen
              // pro Institut + Liste der Produktkategorien.
              const byInst = new Map();
              const cat = (p) => {
                const t = p.typ || '';
                if (/depot|fonds/.test(t)) return 'Depot';
                if (/tagesgeld|festgeld|sparkonto|bauspar/.test(t)) return 'Spar/Geldmarkt';
                if (/kredit|baufinanzierung|kffw|kfw/.test(t)) return 'Kredit';
                if (/kfz|haftpflicht|hausrat|rlv|bu|du|unfall|rechtsschutz|wohngeb|lebensvers|pkv|vers/.test(t)) return 'Versicherung';
                if (/giro|konto/.test(t)) return 'Konto';
                return 'Sonstige';
              };
              fremd.forEach(p => {
                const inst = p.institut || '–';
                const entry = byInst.get(inst) || { institut: inst, vol: 0, kategorien: new Set(), consent: false };
                // Ohne Consent kennen wir die konkreten Werte nicht — wir
                // merken das Institut zwar, führen aber kein Volumen oder
                // Kategorie-Detail.
                if (p.consent) {
                  entry.vol += Number(p.volumen) || 0;
                  entry.kategorien.add(cat(p));
                  entry.consent = true;
                }
                byInst.set(inst, entry);
              });
              const list = Array.from(byInst.values()).sort((a, b) => b.vol - a.vol);
              return (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 pt-2">
                  {list.map((row, i) => (
                    <div key={i} className="flex items-center gap-2.5 rounded-lg border border-slate-200 bg-white px-3 py-2">
                      <LogoImg name={row.institut} size={22} />
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-slate-700 truncate">{row.institut}</div>
                        <div className="text-[11px] text-slate-500 truncate">
                          {row.consent ? (Array.from(row.kategorien).join(' · ') || '—') : 'Details gesperrt'}
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <div className="text-sm font-mono font-semibold text-slate-700">
                          {row.consent ? (row.vol > 0 ? formatEur(row.vol) : '—') : '•••'}
                        </div>
                        <div className={`text-[10px] font-medium ${row.consent ? 'text-emerald-600' : 'text-amber-600'}`}>
                          {row.consent ? 'Consent OK' : 'Consent fehlt'}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              );
            })()}
            </Section>

            {/* Ziele */}
            {isKlausImmo && (
              <Section color="amber">
                <SectionTitle icon={Target} label="Gesprächsziele" color="amber" />
                <ul className="list-disc list-inside text-sm text-slate-700 space-y-1 pt-2 pl-1">
                  <li>Immobilienwunsch konkretisieren (Region, Objekttyp, Zeitpunkt).</li>
                  <li>Gemeinsames Finanzierungsmodell mit BSV-Einsatz und KfW-Förderung aufzeigen.</li>
                  <li>Vertrauen durch transparente Beispielrechnung schaffen.</li>
                  <li>Folgetermin (Feinbedarf + Dokumenten-Check) innerhalb von 3 Wochen setzen.</li>
                </ul>
              </Section>
            )}

            {/* Gesprächsleitfaden — nur für die Klaus-Immo-Demo mit
                ausformuliertem Skript. Andere Termine bekommen einen
                generischen Phasen-Leitfaden weiter unten. */}
            {isKlausImmo && (
            <Section color="violet">
              <SectionTitle icon={MessageSquare} label="Gesprächsleitfaden" color="violet" />
              <div className="space-y-2 pt-2">
              <LeitfadenStep
                nr={1}
                title="Warm-up & Beziehung"
                text="Kurzer Rückblick auf die letzte Chatbot-Interaktion zur Auslandsreisekrankenversicherung (geplante Familienreise nach Thailand). Aktiv zuhören, familiäre Situation aufgreifen (Kinder, neue Lebensphase)."
              />
              <LeitfadenStep
                nr={2}
                title="Bedarfsanalyse"
                text="Was stellt sich Klaus konkret vor? Neubau oder Bestand? Region Gießen oder Umgebung? Zeitlicher Horizont? Welche Rolle spielt Sabine bei der Entscheidung?"
              />
              <LeitfadenStep
                nr={3}
                title="Signale spiegeln"
                text={'„Drei Dinge passen bei Ihnen gerade zusammen": Commerzbank-Ratenkredit läuft aus, BSV wird zuteilungsreif, Newsletter-Interesse. Dem Kunden die KI-Erkennung als Mehrwert erlebbar machen.'}
              />
              <LeitfadenStep
                nr={4}
                title="Zahlenbeispiel"
                text="Exemplarisches Szenario: 250.000 € Darlehen, 10 Jahre fest, 1,5% Tilgung, BSV als Eigenkapital, KfW-Wohneigentumsprogramm 2026. Monatsrate dem Haushaltseinkommen gegenüberstellen."
              />
              <LeitfadenStep
                nr={5}
                title="Absicherung ansprechen"
                text="Hinweis: Für eine Baufinanzierung benötigen wir eine Risikolebensversicherung. Gelegenheit, das Versicherungsbündel (R+V) gleich mitzudenken."
              />
              <LeitfadenStep
                nr={6}
                title="Nächste Schritte"
                text="Unterlagenliste übergeben, Einwilligung zur Bonitätsauskunft, Termin für Detailgespräch in 3 Wochen."
              />
              </div>
            </Section>
            )}

            {/* Generischer Phasen-Leitfaden für alle anderen Termine */}
            {!isKlausImmo && (
              <Section color="violet">
                <SectionTitle icon={MessageSquare} label="Gesprächsleitfaden" color="violet" />
                <div className="space-y-2 pt-2">
                  <LeitfadenStep nr={1} title="Warm-up & Beziehung" text="Persönliche Begrüßung, kurze familiäre/berufliche Aktualisierung, an letzten Kontakt anknüpfen." />
                  <LeitfadenStep nr={2} title="Bedarfsanalyse" text={`Ziele und Hintergrund zum Anlass „${terminTitel}" klären — was treibt den Kunden gerade um?`} />
                  <LeitfadenStep nr={3} title="Status-quo spiegeln" text="Aktuelle Bestände und Open-Finance-Daten nutzen, um die heutige Situation transparent darzustellen." />
                  <LeitfadenStep nr={4} title="Lösungsoptionen" text="Zwei bis drei konkrete Vorschläge aus dem Bestand ableiten, Vor- und Nachteile gegenüberstellen." />
                  <LeitfadenStep nr={5} title="Entscheidung & Commitment" text="Konkreten nächsten Schritt vereinbaren und schriftlich festhalten." />
                  <LeitfadenStep nr={6} title="Nächste Schritte" text="Folgetermin terminieren, Unterlagen übergeben, Notiz in der Kundenakte." />
                </div>
              </Section>
            )}

            {/* Mögliche Fragen des Kunden */}
            {isKlausImmo && (
            <Section color="rose">
              <SectionTitle icon={HelpCircle} label="Mögliche Fragen des Kunden" color="rose" />
              <ul className="space-y-1.5 pt-2">
              {[
                { q: 'Wie viel Eigenkapital brauchen wir mindestens für 350 k Kaufpreis?', a: 'Faustregel: 20 % Kaufpreis + Nebenkosten (~10 %). Mit BSV (30 k) + VR-Sparkonto (15 k) decken Sie etwa 13 % ab — gemeinsam mit der KfW-Förderung ist das machbar.' },
                { q: 'Was passiert mit dem Bausparvertrag bei der Zuteilung?', a: 'Sie haben drei Optionen: Auszahlung als Eigenkapital, Sondertilgung einer bestehenden Finanzierung, oder Fortsetzung als Guthaben.' },
                { q: 'Welche Zinsbindung ist gerade sinnvoll?', a: 'Bei aktuellem Zinsniveau und Ihrer Lebenssituation (junge Familie) tendieren wir zu 15 oder 20 Jahren — Planungssicherheit hat Vorrang vor minimaler Zinsoptimierung.' },
                { q: 'Brauchen wir wirklich eine Risikolebensversicherung?', a: 'Ja, die Bank verlangt sie für die Baufinanzierung. Im Bündel mit Ihrer KFZ und Haftpflicht oft günstiger als separat.' },
                { q: 'Wie schnell könnte das gehen?', a: 'Bei vollständigen Unterlagen ca. 4–6 Wochen bis zum Darlehensvertrag.' },
              ].map((item, i) => (
                <li key={i} className="rounded-lg border border-rose-200 bg-white px-3 py-2">
                  <div className="text-sm font-medium text-slate-700 flex items-start gap-2">
                    <HelpCircle size={14} className="text-rose-500 mt-0.5 shrink-0" />
                    <span>{item.q}</span>
                  </div>
                  <div className="text-xs text-slate-500 mt-1 pl-6">→ {item.a}</div>
                </li>
              ))}
              </ul>
            </Section>
            )}

            {/* To-Dos vor + nach dem Termin (nur Klaus-Demo, weil sehr spezifisch) */}
            {isKlausImmo && (
              <Section color="sky">
                <SectionTitle icon={CheckSquare} label="To-Dos VOR dem Termin" color="sky" />
                <div className="pt-2">
                  <TodoList
                    items={[
                      'Aktuelle KfW-Wohneigentum-Förderbedingungen recherchieren (Stand 04/2026).',
                      'Exemplarische Finanzierungsrechnung (250.000 €, 10/20 J., mit + ohne BSV) vorbereiten.',
                      'Schwäbisch-Hall-Zuteilungsunterlagen abrufen (Vertrag SH-BSV-332).',
                      'Kurze Marktübersicht „Immobilien Gießen 2026" drucken.',
                      'Einladung kalendarisch bestätigen + Tagesordnung per Mail senden.',
                    ]}
                  />
                </div>
              </Section>
            )}
            {isKlausImmo && (
              <Section color="emerald">
                <SectionTitle icon={ListChecks} label="To-Dos NACH dem Termin" color="emerald" />
                <div className="pt-2">
                  <TodoList
                    items={[
                      'Gesprächsnotiz in der Kunden­akte hinterlegen (strukturiert nach Leitfaden).',
                      'Individuelles Finanzierungsangebot innerhalb von 48 h versenden.',
                      'Folgetermin in 3 Wochen fixieren (Dokumenten-Check + Detailangebot).',
                      'Risikolebensversicherungs-Vergleich anstoßen (R+V Bündelangebot).',
                      'Lead-Status im Pipeline-Board auf „Angebot" setzen.',
                    ]}
                  />
                </div>
              </Section>
            )}

            {/* Mitzubringen / Kontakt */}
            <Section color="slate">
              <SectionTitle icon={User} label="Kontakt" color="slate" />
              <div className="grid grid-cols-2 gap-2 text-sm pt-2">
                <div className="flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 bg-white">
                  <Phone size={14} className="text-slate-400" />
                  <span className="text-slate-700">+49 641 55 44 33 22</span>
                </div>
                <div className="flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 bg-white">
                  <Mail size={14} className="text-slate-400" />
                  <span className="text-slate-700">{(kunde?.name || 'kunde').toLowerCase().replace(/\s+/g, '.').replace(/[^a-z.]/g, '')}@mail-demo.de</span>
                </div>
              </div>
            </Section>
          </div>
        )}

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-end gap-2">
          <button
            onClick={onClose}
            className="px-3 py-2 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-100 transition-colors"
          >
            Schließen
          </button>
          {kunde?.id && (
            <button
              onClick={() => {
                onClose?.();
                navigateTo?.('detail', { kundeId: kunde.id, tab: 'stammdaten' });
              }}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-100 transition-colors"
            >
              <ArrowRight size={14} /> Kunde öffnen
            </button>
          )}
          <button
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold text-white shadow-sm"
            style={{ background: 'linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)' }}
          >
            <FileText size={14} /> Vorbereitung drucken
          </button>
        </div>
      </div>
    </div>
  );
}

// Farbpaletten je Sektion — Header bekommt einen leichten Pastell-Block,
// damit die Abschnitte visuell klar getrennt sind und nicht alle gleich
// aussehen.
const SECTION_THEMES = {
  indigo:  { bg: 'bg-indigo-50',  border: 'border-indigo-200',  text: 'text-indigo-700',  icon: 'text-indigo-500',  bar: 'bg-indigo-400' },
  violet:  { bg: 'bg-violet-50',  border: 'border-violet-200',  text: 'text-violet-700',  icon: 'text-violet-500',  bar: 'bg-violet-400' },
  emerald: { bg: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-700', icon: 'text-emerald-500', bar: 'bg-emerald-400' },
  sky:     { bg: 'bg-sky-50',     border: 'border-sky-200',     text: 'text-sky-700',     icon: 'text-sky-500',     bar: 'bg-sky-400' },
  amber:   { bg: 'bg-amber-50',   border: 'border-amber-200',   text: 'text-amber-700',   icon: 'text-amber-500',   bar: 'bg-amber-400' },
  rose:    { bg: 'bg-rose-50',    border: 'border-rose-200',    text: 'text-rose-700',    icon: 'text-rose-500',    bar: 'bg-rose-400' },
  slate:   { bg: 'bg-slate-100',  border: 'border-slate-200',   text: 'text-slate-700',   icon: 'text-slate-500',   bar: 'bg-slate-400' },
};

// Wrapper für einen Themen-Block: linker Farbbalken in der Sektionsfarbe
// + leichter Pastell-Hintergrund. Unterscheidet die Bereiche optisch klar
// voneinander, ohne dass sie überladen wirken.
function Section({ color = 'violet', children }) {
  const c = SECTION_THEMES[color] || SECTION_THEMES.violet;
  return (
    <section className={`relative rounded-xl border ${c.border} bg-white pl-4 pr-3 py-3 overflow-hidden`}>
      <span className={`absolute left-0 top-0 bottom-0 w-1.5 ${c.bar}`} aria-hidden="true" />
      <div className="space-y-2">{children}</div>
    </section>
  );
}

function SectionTitle({ icon: Icon, label, color = 'violet' }) {
  const c = SECTION_THEMES[color] || SECTION_THEMES.violet;
  return (
    <h4 className={`flex items-center gap-2 text-xs font-bold uppercase tracking-wider rounded-lg px-3 py-2 border ${c.bg} ${c.border} ${c.text}`}>
      <Icon size={14} className={c.icon} />
      {label}
    </h4>
  );
}

function KPI({ label, value, accent }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white px-3 py-2">
      <div className="text-[11px] text-slate-400">{label}</div>
      <div className={`text-sm font-semibold ${accent || 'text-slate-800'}`}>{value}</div>
    </div>
  );
}

function LeitfadenStep({ nr, title, text }) {
  return (
    <div className="flex items-start gap-3 rounded-xl border border-slate-200 bg-white p-3">
      <div className="w-7 h-7 rounded-full bg-violet-100 text-violet-700 text-xs font-semibold flex items-center justify-center shrink-0">
        {nr}
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-sm font-semibold text-slate-800">{title}</div>
        <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">{text}</p>
      </div>
    </div>
  );
}

function TodoList({ items }) {
  return (
    <ul className="space-y-1.5">
      {items.map((item, i) => (
        <li key={i} className="flex items-start gap-2 text-sm text-slate-700">
          <div className="mt-0.5 w-4 h-4 rounded border border-slate-300 bg-white shrink-0" />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}
