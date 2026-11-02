import { useState } from 'react';
import { clsx } from 'clsx';
import {
  ArrowLeft, Phone, Mail, CalendarPlus, StickyNote, LayoutGrid, User, CreditCard,
  Activity, MessageSquare, FolderOpen, Clock, Sparkles, ChevronRight,
  Download, Printer, Check, Upload, TrendingDown, TrendingUp, Bot, Calculator,
  Landmark, ShieldCheck, Copy, ArrowUpRight, ArrowDownLeft, PhoneOff,
} from 'lucide-react';
import {
  Bar, BarChart, CartesianGrid, Legend, Line, ComposedChart, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from 'recharts';
import { CRM_NAV, CRM_REFERENZ } from '../../data/crmProfile';
import { getFullCustomerData, stage, letzteZahlung } from '../../data/customerDetails';
import { buildStammdaten } from '../../data/stammdaten';
import { buildScoring, buildFaktoren, buildEmpfehlung, buildSchritte } from '../../data/kiAnalyse';
import { buildDossier, buildEntwuerfe } from '../../data/copilot';
import { buildAgentenFeed, AGENTEN } from '../../data/agents';
import { HaushaltSection, OpenFinanceSection, KommunikationSection, ForderungsKpis } from './sections';
import { useCollections } from '../../hooks/useCollections';
import { Card, Badge, EmptyState } from '../../components/ui/primitives';
import { euro, zahl, initialen } from '../../utils/format';
import { downloadBlob } from '../../utils/exportDoc';

const NAV_ICONS = {
  overview: LayoutGrid, 'ki-analyse': Sparkles, stammdaten: User, konten: CreditCard,
  transaktionen: Activity, finanzen: Calculator, openfinance: Landmark,
  kommunikation: MessageSquare, dokumente: FolderOpen, workflow: Clock,
};

const TONE = {
  danger: { color: '#b91c1c', bg: '#fef2f2' },
  warning: { color: '#b45309', bg: '#fffbeb' },
  success: { color: '#047857', bg: '#ecfdf5' },
  info: { color: '#0369a1', bg: '#f0f9ff' },
  neutral: { color: '#475569', bg: '#f1f5f9' },
  primary: { color: '#1e293b', bg: '#f1f5f9' },
};

function Abschnitt({ titel, aktion, children }) {
  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <h2 className="text-lg font-semibold text-slate-900">{titel}</h2>
        {aktion}
      </div>
      {children}
    </section>
  );
}

function Kennzahl({ label, wert, sub, tone }) {
  const t = TONE[tone] || TONE.neutral;
  return (
    <Card className="p-4">
      <div className="text-[11px] uppercase tracking-wide text-slate-500">{label}</div>
      <div className="text-xl font-semibold mt-1 tabular-nums" style={{ color: t.color }}>{wert}</div>
      {sub && <div className="text-[11px] text-slate-500 mt-0.5">{sub}</div>}
    </Card>
  );
}

function ScoreRing({ label, wert, color }) {
  const umfang = 2 * Math.PI * 26;
  return (
    <div className="flex flex-col items-center gap-1.5">
      <svg viewBox="0 0 64 64" className="w-16 h-16 -rotate-90" role="img" aria-label={`${label}: ${wert} Prozent`}>
        <circle cx="32" cy="32" r="26" fill="none" stroke="#e2e8f0" strokeWidth="6" />
        <circle
          cx="32" cy="32" r="26" fill="none" stroke={color} strokeWidth="6" strokeLinecap="round"
          strokeDasharray={`${(wert / 100) * umfang} ${umfang}`}
        />
      </svg>
      <span className="text-sm font-semibold text-slate-900 -mt-[42px] mb-[26px] tabular-nums">{wert} %</span>
      <span className="text-[11px] text-slate-500">{label}</span>
    </div>
  );
}

const AKT_ICON = {
  ausgehend: { Icon: ArrowUpRight, color: '#2563eb', bg: '#eff6ff' },
  eingehend: { Icon: ArrowDownLeft, color: '#059669', bg: '#ecfdf5' },
  verpasst: { Icon: PhoneOff, color: '#dc2626', bg: '#fef2f2' },
};

function MiniVerlauf({ punkte, color }) {
  const max = Math.max(...punkte, 1);
  const pts = punkte.map((p, i) => `${(i / (punkte.length - 1)) * 200},${60 - (p / max) * 50}`).join(' ');
  return (
    <svg viewBox="0 0 200 60" preserveAspectRatio="none" className="w-full h-12" aria-hidden="true">
      <polyline points={pts} fill="none" stroke={color} strokeWidth="2" />
    </svg>
  );
}

export default function CrmProfileView() {
  const { crmKunde, schliesseCrm, toast, freigegeben, freigabeErteilen } = useCollections();
  const [nav, setNav] = useState('overview');
  const [dokOffen, setDokOffen] = useState('mahnung3');
  const [letzter, setLetzter] = useState(null);

  // Beim Wechsel der Akte (oder gezieltem Sprung) auf die gewuenschte Sektion.
  const schluessel = crmKunde ? `${crmKunde.id}:${crmKunde.sektion || 'overview'}` : null;
  if (crmKunde && schluessel !== letzter) {
    setLetzter(schluessel);
    setNav(crmKunde.sektion || 'overview');
  }

  if (!crmKunde) return null;

  const customer = getFullCustomerData(crmKunde.id);
  const s = buildStammdaten(customer);
  const r = CRM_REFERENZ;
  const stufe = stage(customer);
  const zahlung = letzteZahlung(customer);
  const scoring = buildScoring(customer);
  const faktoren = buildFaktoren(customer);
  const empfehlung = buildEmpfehlung(customer);
  const schritte = buildSchritte(customer);
  const dossier = buildDossier(customer);
  const entwuerfe = buildEntwuerfe(customer);
  const agentenFeed = buildAgentenFeed(customer).map(e =>
    freigegeben.has(`${crmKunde.id}:${e.id}`) ? { ...e, status: 'freigegeben' } : e);

  // Der Transaktionsbereich zeigt fuer die ausgebaute Referenzakte den vollen
  // Legacy-Datensatz, fuer alle anderen Faelle die Werte ihrer eigenen Akte.
  const trans = customer.transaktionen || [];
  const eingaenge = trans.filter(t => t.betrag > 0).reduce((sum, t) => sum + t.betrag, 0);
  const ruecklaeufer = trans.filter(t => t.status === 'rueckgabe');
  const transKpis = [
    { wert: euro(eingaenge), label: 'Zahlungseingänge (Historie)', tone: eingaenge > 0 ? 'success' : 'neutral' },
    {
      wert: `${ruecklaeufer.length} ${ruecklaeufer.length === 1 ? 'Rückläufer' : 'Rückläufer'}`,
      label: ruecklaeufer.length
        ? `${euro(ruecklaeufer.reduce((sum, t) => sum + Math.abs(t.betrag), 0))} zurückgekommen`
        : 'keine Lastschriftrückgaben',
      tone: ruecklaeufer.length ? 'danger' : 'success',
    },
    {
      wert: euro(customer.gesamtforderung),
      label: `Gesamtforderung (${customer.krediteAnzahl} ${customer.krediteAnzahl === 1 ? 'Kredit' : 'Kredite'})`,
      tone: 'primary',
    },
  ];
  const kontobewegungen = trans.map(t => ({
    art: t.betrag > 0 ? 'eingehend' : t.status === 'rueckgabe' ? 'ruecklauf' : 'ausgehend',
    text: t.beschreibung,
    datum: t.datum,
    betrag: `${t.betrag > 0 ? '+' : '-'}${euro(Math.abs(t.betrag))}`,
  }));
  // Zahlungsverlauf aus der Transaktionshistorie: Ist-Zahlungen, Rueckläufer
  // und die vereinbarte Monatsrate als Soll-Linie.
  const zahlungsverlauf = [...trans].reverse().map(t => ({
    monat: t.datum,
    soll: customer.monatsrate || 0,
    ist: t.betrag > 0 ? t.betrag : 0,
    ruecklauf: t.status === 'rueckgabe' ? Math.abs(t.betrag) : 0,
  }));

  const forderungenNachProdukt = (customer.produkte || []).map(pr => {
    const maxSaldo = Math.max(...(customer.produkte || []).map(x => x.saldo), 1);
    return {
      produkt: pr.typ,
      betrag: euro(pr.saldo),
      hinweis: pr.status,
      sub: pr.limit !== undefined ? `Limit: ${euro(pr.limit)}` : pr.rate !== undefined ? `Rate: ${euro(pr.rate)}/Mo` : pr.nummer,
      tone: pr.badge === 'success' ? 'success' : pr.badge === 'warning' ? 'warning' : pr.badge === 'info' ? 'info' : 'danger',
      anteil: Math.round((pr.saldo / maxSaldo) * 100),
    };
  });

  const quickActions = [
    { icon: Phone, label: 'Anrufen', meldung: `Anruf an ${customer.name} wird aufgebaut …` },
    { icon: Mail, label: 'E-Mail', meldung: 'E-Mail-Entwurf im Postausgang abgelegt.' },
    { icon: CalendarPlus, label: 'Termin', meldung: 'Termin für morgen 10:00 Uhr eingetragen.' },
    { icon: StickyNote, label: 'Notiz', meldung: 'Notiz zur Akte gespeichert.' },
  ];

  const dokHerunterladen = d => {
    const text = d.vertrag
      ? [d.titel, '', ...d.vertrag.map(v => `${v.label}: ${v.wert}`)].join('\n')
      : [
        ...(d.absender || []), '', ...(d.empfaenger || []), '', d.ort || '', '',
        d.betreff || '', '', ...(d.absatz || []),
      ].join('\n');
    downloadBlob(text, `${d.id}-${crmKunde.id}.txt`);
    toast(`${d.titel} wurde heruntergeladen.`, 'success');
  };

  return (
    <div className="flex-1 flex min-h-0">
      {/* Sidebar */}
      <aside className="w-72 shrink-0 border-r border-slate-200 bg-white flex flex-col">
        <div className="p-5 border-b border-slate-100">
          <div className="flex items-start gap-3">
            <span
              className="w-12 h-12 rounded-xl text-white text-base font-bold flex items-center justify-center shrink-0"
              style={{ background: 'var(--mode-gradient)' }}
            >
              {initialen(customer.name)}
            </span>
            <div className="min-w-0">
              <h2 className="text-base font-semibold text-slate-900 leading-tight">{customer.name}</h2>
              <div className="text-[11px] text-slate-500 mt-0.5">
                {customer.type === 'Gewerbe' ? 'Gewerbekunde' : 'Privatkunde'}
              </div>
              <div className="text-[11px] text-slate-400 mt-0.5 font-mono">{crmKunde.id}</div>
            </div>
          </div>
          <div className="flex items-center gap-2 mt-3">
            <Badge
              color={stufe === 3 ? '#b91c1c' : stufe === 2 ? '#b45309' : '#047857'}
              bg={stufe === 3 ? '#fef2f2' : stufe === 2 ? '#fffbeb' : '#ecfdf5'}
            >
              Stage {stufe}
            </Badge>
            <Badge color="#475569" bg="#f1f5f9">DPD: {customer.dpd}</Badge>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-1 p-3 border-b border-slate-100">
          {quickActions.map(a => {
            const Icon = a.icon;
            return (
              <button
                key={a.label}
                onClick={() => toast(a.meldung, 'success')}
                className="flex flex-col items-center gap-1 py-2 rounded-lg text-slate-600 hover:bg-slate-50 transition-colors"
                title={a.label}
              >
                <Icon size={16} strokeWidth={1.8} />
                <span className="text-[10px] font-medium">{a.label}</span>
              </button>
            );
          })}
        </div>

        <nav className="flex-1 overflow-y-auto p-2">
          {CRM_NAV.map(n => {
            const Icon = NAV_ICONS[n.id];
            const aktiv = nav === n.id;
            return (
              <button
                key={n.id}
                onClick={() => setNav(n.id)}
                className={clsx('w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] font-medium transition-colors mb-0.5',
                  aktiv ? 'text-white' : 'text-slate-600 hover:bg-slate-50')}
                style={aktiv ? { background: 'var(--mode-primary)' } : undefined}
              >
                <Icon size={16} strokeWidth={1.8} />
                {n.label}
              </button>
            );
          })}
        </nav>

        <button
          onClick={schliesseCrm}
          className="flex items-center gap-2 px-5 py-4 border-t border-slate-100 text-[13px] font-medium text-slate-600 hover:bg-slate-50 transition-colors"
        >
          <ArrowLeft size={16} strokeWidth={1.8} /> Zurück zur Übersicht
        </button>
      </aside>

      {/* Hauptbereich */}
      <div className="flex-1 min-w-0 overflow-y-auto">
        {crmKunde.hinweis && (
          <div className="m-6 mb-0 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-[13px] text-amber-900">
            {crmKunde.hinweis}
          </div>
        )}

        <div className="p-6 space-y-6">
          {nav === 'overview' && (
            <Abschnitt
              titel="Kundenübersicht"
              aktion={
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => toast(`Mahnprozess für ${customer.name} gestartet.`, 'success')}
                    className="px-3 py-1.5 text-xs font-semibold text-white rounded-lg bg-red-600 hover:bg-red-700 transition-colors"
                  >
                    Mahnprozess starten
                  </button>
                  <button
                    onClick={() => toast(`${customer.name} für den Forderungsverkauf vorgemerkt.`, 'info')}
                    className="px-3 py-1.5 text-xs font-semibold text-amber-800 bg-amber-50 border border-amber-200 rounded-lg hover:bg-amber-100 transition-colors"
                  >
                    Verkaufen
                  </button>
                  <button
                    onClick={() => toast(`Abschreibung für ${customer.name} eingereicht.`, 'warning')}
                    className="px-3 py-1.5 text-xs font-medium text-slate-700 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
                  >
                    Abschreiben
                  </button>
                </div>
              }
            >
              <div className="grid grid-cols-4 gap-4">
                <Kennzahl
                  label="Offene Forderung" wert={euro(customer.gesamtforderung)}
                  sub={customer.zinsen ? `zzgl. ${euro(customer.zinsen + customer.mahngebuehren)} Zinsen und Gebühren` : 'ohne Zinsen und Gebühren'}
                  tone="danger"
                />
                <Kennzahl
                  label="Tage überfällig (DPD)" wert={zahl(customer.dpd)}
                  sub={stufe === 1 ? 'Stage 1 – kein Verzug' : `Stage ${stufe} · Status ${customer.status}`}
                  tone={stufe === 3 ? 'danger' : stufe === 2 ? 'warning' : 'success'}
                />
                <Kennzahl
                  label="Letzte Zahlung"
                  wert={zahlung ? euro(zahlung.betrag) : '–'}
                  sub={zahlung ? `${zahlung.datum} (${zahlung.typ})` : 'keine Zahlung erfasst'}
                  tone={zahlung ? 'success' : undefined}
                />
                <Kennzahl label="Mahnstatus" wert={customer.mahnstufe > 0 ? `Mahnung ${customer.mahnstufe}` : 'Keine Mahnung'} sub={customer.workflowStatus} tone="info" />
              </div>

              <div className="grid grid-cols-3 gap-4">
                {[
                  { id: 'konten', titel: 'Konten & Verträge', desc: `${customer.krediteAnzahl} Kredite • Salden und Verläufe`, icon: CreditCard },
                  { id: 'transaktionen', titel: 'Transaktionen & Forderungen', desc: 'Zahlungen • Rückläufer • Forderungen je Produkt', icon: Activity },
                  { id: 'dokumente', titel: 'Dokumente & Schreiben', desc: 'Mahnungen • Verträge • Korrespondenz', icon: FolderOpen },
                ].map(q => {
                  const Icon = q.icon;
                  return (
                    <button
                      key={q.id}
                      onClick={() => setNav(q.id)}
                      className="card-base p-4 flex items-center gap-3 text-left hover:shadow-md transition-shadow"
                    >
                      <span
                        className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                        style={{ background: 'var(--mode-pastel)', color: 'var(--mode-primary)' }}
                      >
                        <Icon size={19} strokeWidth={1.75} />
                      </span>
                      <span className="flex-1 min-w-0">
                        <span className="block text-[13px] font-semibold text-slate-800">{q.titel}</span>
                        <span className="block text-[11px] text-slate-500 mt-0.5">{q.desc}</span>
                      </span>
                      <ChevronRight size={16} className="text-slate-300 shrink-0" />
                    </button>
                  );
                })}
              </div>

              <div className="grid grid-cols-2 gap-5">
                <Card className="p-5">
                  <h3 className="text-sm font-semibold text-slate-800 mb-4">KI-Scoring</h3>
                  <div className="flex justify-around">
                    {scoring.map(sc => <ScoreRing key={sc.label} label={sc.label} wert={sc.wert} color={sc.color} />)}
                  </div>
                  <div className="mt-4 rounded-lg px-4 py-3.5" style={{ background: 'var(--mode-pastel)' }}>
                    <div className="flex items-center gap-2 text-[13px] font-semibold" style={{ color: 'var(--mode-primary)' }}>
                      <Sparkles size={15} strokeWidth={1.9} className="shrink-0" />
                      <span className="flex-1">KI-Empfehlung: {empfehlung.massnahme}</span>
                      <span className="text-[11px] font-medium text-slate-500">Konfidenz {empfehlung.konfidenz} %</span>
                    </div>
                    <p className="mt-1.5 text-[13px] text-slate-700 leading-snug">{empfehlung.begruendung}</p>
                    <ol className="mt-2.5 space-y-1.5">
                      {empfehlung.schritte.map((s, i) => (
                        <li key={s} className="flex items-start gap-2.5 text-[13px] text-slate-700 leading-snug">
                          <span
                            className="w-5 h-5 rounded-full text-white text-[10px] font-bold flex items-center justify-center shrink-0"
                            style={{ background: 'var(--mode-primary)' }}
                          >
                            {i + 1}
                          </span>
                          {s}
                        </li>
                      ))}
                    </ol>
                    <div className="grid grid-cols-3 gap-2 mt-3">
                      {empfehlung.kennzahlen.map(k => (
                        <div key={k.label} className="rounded-lg bg-white/70 px-2.5 py-2">
                          <div className="text-[9px] uppercase tracking-wide text-slate-500 leading-tight">{k.label}</div>
                          <div className="text-[13px] font-semibold text-slate-900 mt-0.5">{k.wert}</div>
                        </div>
                      ))}
                    </div>
                    <button
                      onClick={() => setNav('ki-analyse')}
                      className="mt-3 flex items-center gap-1 text-[12px] font-semibold hover:underline"
                      style={{ color: 'var(--mode-primary)' }}
                    >
                      Zum vollständigen KI-Dossier <ChevronRight size={13} strokeWidth={2.2} />
                    </button>
                  </div>
                </Card>

                <Card className="p-5">
                  <div className="flex items-center gap-2 mb-4">
                    <Bot size={16} className="text-slate-500" strokeWidth={1.8} />
                    <h3 className="text-sm font-semibold text-slate-800 flex-1">Agenten-Aktivität</h3>
                    <Badge color="#047857" bg="#ecfdf5">{agentenFeed.filter(e => e.status === 'autonom').length} autonom</Badge>
                  </div>
                  <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
                    {agentenFeed.slice(0, 6).map(e => (
                      <div key={e.id} className="flex items-start gap-3">
                        <span
                          className={clsx('w-7 h-7 rounded-lg flex items-center justify-center shrink-0',
                            e.status === 'freigabe' ? 'bg-amber-100 text-amber-700' : 'bg-emerald-50 text-emerald-600')}
                        >
                          {e.status === 'freigabe' ? <ShieldCheck size={13} strokeWidth={2} /> : <Check size={13} strokeWidth={2.2} />}
                        </span>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-[13px] font-medium text-slate-800">{e.titel}</span>
                            {e.status === 'freigabe' && <Badge color="#92400e" bg="#fef3c7">wartet auf Freigabe</Badge>}
                            {e.status === 'freigegeben' && <Badge color="#047857" bg="#ecfdf5">freigegeben</Badge>}
                          </div>
                          <div className="text-[11px] text-slate-500 mt-0.5">
                            {AGENTEN[e.agent]?.name} · {e.zeitpunkt}
                          </div>
                          {e.status === 'freigabe' && (
                            <button
                              onClick={() => {
                                freigabeErteilen(`${crmKunde.id}:${e.id}`);
                                toast(`Freigabe erteilt — ${AGENTEN[e.agent]?.name} führt die Aktion aus.`, 'success');
                              }}
                              className="mt-1.5 flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-semibold text-white rounded-md transition-opacity hover:opacity-90"
                              style={{ background: 'var(--mode-primary)' }}
                            >
                              <Check size={11} strokeWidth={2.6} /> Freigeben
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                  <button
                    onClick={() => setNav('kommunikation')}
                    className="mt-4 w-full py-2 text-xs font-semibold text-slate-700 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors"
                  >
                    Vollständige Historie anzeigen
                  </button>
                </Card>
              </div>
            </Abschnitt>
          )}

          {nav === 'stammdaten' && (
            <Abschnitt titel="Stammdaten">
              <div className="grid grid-cols-2 gap-4">
                <Card className="p-5">
                  <h3 className="text-[11px] font-bold uppercase tracking-wide text-slate-500 mb-2">
                    {s.privat ? 'Personendaten' : 'Unternehmensdaten'}
                  </h3>
                  {s.unternehmen.map(f => (
                    <div key={f.label} className="flex items-start justify-between gap-4 py-2 border-b border-slate-100 last:border-0">
                      <span className="text-xs text-slate-500">{f.label}</span>
                      <span className="text-[13px] text-slate-800 text-right whitespace-pre-line">{f.wert}</span>
                    </div>
                  ))}
                </Card>
                <div className="space-y-4">
                  {[
                    { titel: 'Kontaktdaten', zeilen: s.kontakt },
                    { titel: s.leitung.titel, zeilen: s.leitung.zeilen },
                    { titel: 'Bankverbindung und Bonität', zeilen: s.bank },
                  ].map(b => (
                    <Card key={b.titel} className="p-5">
                      <h3 className="text-[11px] font-bold uppercase tracking-wide text-slate-500 mb-2">{b.titel}</h3>
                      {b.zeilen.map(f => (
                        <div key={f.label} className="flex items-start justify-between gap-4 py-2 border-b border-slate-100 last:border-0">
                          <span className="text-xs text-slate-500">{f.label}</span>
                          <span className={clsx('text-[13px] text-right whitespace-pre-line',
                            f.mono && 'font-mono text-xs', f.warnung ? 'text-red-600 font-medium' : 'text-slate-800')}>
                            {f.wert}
                          </span>
                        </div>
                      ))}
                    </Card>
                  ))}
                </div>
              </div>
            </Abschnitt>
          )}

          {nav === 'konten' && (
            <Abschnitt titel="Konten & Verträge">
              <div className="grid grid-cols-2 gap-4">
                {(customer.produkte || []).map((p, i) => ({
                  id: p.nummer, name: p.typ, nummer: p.nummer,
                  status: p.status,
                  tone: p.badge === 'success' ? 'success' : p.badge === 'warning' ? 'warning' : p.badge === 'info' ? 'info' : 'danger',
                  zeilen: [
                    { label: 'Saldo', wert: euro(p.saldo), highlight: true },
                    ...(p.limit !== undefined ? [{ label: 'Limit', wert: euro(p.limit) }] : []),
                    ...(p.rate !== undefined ? [{ label: 'Rate/Monat', wert: euro(p.rate) }] : []),
                  ],
                  verlauf: [40 + i * 3, 42, 44, 41, 45, 47, 46, 48],
                })).map(k => {
                  const t = TONE[k.tone] || TONE.neutral;
                  return (
                    <Card key={k.id} className="p-5">
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <div className="min-w-0">
                          <div className="text-sm font-semibold text-slate-800">{k.name}</div>
                          <div className="text-[11px] text-slate-500 font-mono">{k.nummer}</div>
                        </div>
                        <Badge color={t.color} bg={t.bg}>{k.status}</Badge>
                      </div>
                      {k.zeilen.map(z => (
                        <div key={z.label} className="flex items-center justify-between gap-4 py-1.5 border-b border-slate-100 last:border-0">
                          <span className="text-xs text-slate-500">{z.label}</span>
                          <span className={clsx('text-[13px] tabular-nums',
                            z.highlight ? 'font-semibold' : 'text-slate-700')}
                            style={z.highlight ? { color: z.tone === 'danger' ? '#b91c1c' : '#0f172a' } : undefined}>
                            {z.wert}
                          </span>
                        </div>
                      ))}
                      <div className="mt-3">
                        <div className="text-[10px] uppercase tracking-wide text-slate-400 mb-1">Restschuld-Verlauf</div>
                        <MiniVerlauf punkte={k.verlauf} color={t.color} />
                        <div className="flex justify-between text-[9px] text-slate-400">
                          {['Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Dez'].map(m => <span key={m}>{m}</span>)}
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>
              {!(customer.produkte || []).length && <EmptyState text="Für diesen Fall sind keine Konten hinterlegt." />}
            </Abschnitt>
          )}

          {nav === 'transaktionen' && (
            <Abschnitt titel="Transaktionen & Forderungen">
              <ForderungsKpis customer={customer} />
              <div className="grid grid-cols-3 gap-4">
                {transKpis.map(k => (
                  <Kennzahl key={k.label} label={k.label} wert={k.wert} tone={k.tone} />
                ))}
              </div>

              {!!zahlungsverlauf.length && (
              <Card className="p-5">
                <h3 className="text-sm font-semibold text-slate-800 mb-4">Zahlungsverlauf (Historie)</h3>
                <div style={{ height: 260 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={zahlungsverlauf} margin={{ top: 8, right: 12, left: 0, bottom: 4 }}>
                      <CartesianGrid stroke="#e2e8f0" strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="monat" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} width={60} tickFormatter={v => euro(v)} />
                      <Tooltip
                        formatter={(v, n) => [euro(v), n]}
                        contentStyle={{ borderRadius: 10, border: '1px solid #e2e8f0', fontSize: 12, boxShadow: '0 6px 18px rgba(15,23,42,0.10)' }}
                      />
                      <Legend wrapperStyle={{ fontSize: 11 }} iconType="circle" iconSize={8} />
                      <Bar dataKey="ist" name="Zahlungen" fill="#10b981" radius={[3, 3, 0, 0]} barSize={16} />
                      <Bar dataKey="ruecklauf" name="Rückläufer" fill="#ef4444" radius={[3, 3, 0, 0]} barSize={16} />
                      <Line type="monotone" dataKey="soll" name="Soll-Zahlungen" stroke="#6366f1" strokeWidth={2} strokeDasharray="5 4" dot={false} />
                    </ComposedChart>
                  </ResponsiveContainer>
                </div>
              </Card>
              )}

              <div className="grid grid-cols-2 gap-5">
                <Card className="p-5">
                  <h3 className="text-sm font-semibold text-slate-800 mb-3">Letzte Kontobewegungen</h3>
                  <div className="divide-y divide-slate-100">
                    {kontobewegungen.map((b, i) => {
                      const cfg = b.art === 'eingehend'
                        ? AKT_ICON.eingehend
                        : b.art === 'ruecklauf' ? AKT_ICON.verpasst : AKT_ICON.ausgehend;
                      const Icon = cfg.Icon;
                      return (
                        <div key={i} className="flex items-center gap-3 py-2.5">
                          <span className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0" style={{ background: cfg.bg, color: cfg.color }}>
                            <Icon size={13} strokeWidth={2} />
                          </span>
                          <div className="flex-1 min-w-0">
                            <div className="text-[13px] text-slate-800 truncate">{b.text}</div>
                            <div className="text-[11px] text-slate-500">{b.datum}</div>
                          </div>
                          <span className={clsx('text-[13px] font-semibold tabular-nums shrink-0',
                            b.betrag.startsWith('+') ? 'text-emerald-600' : 'text-red-600')}>
                            {b.betrag}
                          </span>
                        </div>
                      );
                    })}
                    {!kontobewegungen.length && <EmptyState text="Keine Kontobewegungen erfasst." />}
                  </div>
                </Card>

                <Card className="p-5">
                  <h3 className="text-sm font-semibold text-slate-800 mb-3">Forderungen nach Produkt</h3>
                  <div className="space-y-3.5">
                    {forderungenNachProdukt.map(f => {
                      const t = TONE[f.tone];
                      return (
                        <div key={f.produkt}>
                          <div className="flex items-baseline justify-between gap-3 mb-1">
                            <span className="text-[13px] text-slate-700">{f.produkt}</span>
                            <span className="text-[13px] font-semibold text-slate-900 tabular-nums shrink-0">{f.betrag}</span>
                          </div>
                          <div className="h-1.5 rounded-full bg-slate-100 overflow-hidden">
                            <div className="h-full rounded-full" style={{ width: `${Math.min(f.anteil, 100)}%`, background: t.color }} />
                          </div>
                          <div className="flex items-baseline justify-between gap-3 mt-1">
                            <span className="text-[11px]" style={{ color: t.color }}>{f.hinweis}</span>
                            <span className="text-[11px] text-slate-400">{f.sub}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </Card>
              </div>
            </Abschnitt>
          )}


          {nav === 'kommunikation' && (
            <Abschnitt
              titel="Kommunikation"
              aktion={
                <button
                  onClick={() => setNav('ki-analyse')}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
                >
                  <Sparkles size={13} strokeWidth={1.9} /> Entwürfe im KI-Dossier
                </button>
              }
            >
              <Card>
                <KommunikationSection customer={customer} />
              </Card>
            </Abschnitt>
          )}

          {nav === 'finanzen' && (
            <Abschnitt titel={customer.type === 'Gewerbe' ? 'Gewinn- und Verlustrechnung' : 'Haushaltsrechnung'}>
              <Card>
                <HaushaltSection customer={customer} />
              </Card>
            </Abschnitt>
          )}

          {nav === 'openfinance' && (
            <Abschnitt titel="Open Finance">
              <Card>
                <OpenFinanceSection customer={customer} />
              </Card>
            </Abschnitt>
          )}

          {nav === 'dokumente' && (
            <Abschnitt
              titel="Dokumente & Schreiben"
              aktion={
                <button
                  onClick={() => toast('Dokument-Upload gestartet.', 'info')}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
                >
                  <Upload size={13} strokeWidth={1.9} /> Hochladen
                </button>
              }
            >
              <div className="space-y-3">
                {r.dokumente.map(d => {
                  const auf = dokOffen === d.id;
                  return (
                    <Card key={d.id} className="overflow-hidden">
                      <button
                        onClick={() => setDokOffen(auf ? null : d.id)}
                        className="w-full flex items-center gap-3 px-5 py-3.5 text-left hover:bg-slate-50 transition-colors"
                      >
                        <FolderOpen size={16} className="text-slate-400 shrink-0" strokeWidth={1.8} />
                        <span className="flex-1 min-w-0">
                          <span className="block text-[13px] font-semibold text-slate-800">{d.titel}</span>
                          <span className="block text-[11px] text-slate-500">{d.meta}</span>
                        </span>
                        <Badge color={d.status === 'Versendet' ? '#047857' : '#475569'} bg={d.status === 'Versendet' ? '#ecfdf5' : '#f1f5f9'}>
                          {d.status}
                        </Badge>
                        <ChevronRight size={16} className={clsx('text-slate-300 shrink-0 transition-transform', auf && 'rotate-90')} />
                      </button>

                      {auf && (
                        <div className="border-t border-slate-100 px-5 py-5 bg-slate-50">
                          {d.vertrag ? (
                            <div className="bg-white rounded-lg border border-slate-200 p-5 max-w-2xl">
                              <h4 className="text-sm font-semibold text-slate-800 mb-3">Vertragsdetails</h4>
                              {d.vertrag.map(v => (
                                <div key={v.label} className="flex justify-between gap-4 py-1.5 border-b border-slate-100 last:border-0">
                                  <span className="text-xs text-slate-500">{v.label}</span>
                                  <span className="text-[13px] text-slate-800">{v.wert}</span>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="bg-white rounded-lg border border-slate-200 p-8 max-w-2xl text-[13px] leading-relaxed text-slate-700">
                              <div className="text-xs text-slate-500 whitespace-pre-line">{d.absender.join('\n')}</div>
                              <div className="mt-6 whitespace-pre-line">{d.empfaenger.join('\n')}</div>
                              <div className="mt-6 text-right text-slate-500">{d.ort}</div>
                              <div className="mt-6 font-semibold text-slate-900">{d.betreff}</div>
                              <div className="mt-4 space-y-3">
                                {d.absatz.map((p, i) => <p key={i}>{p}</p>)}
                              </div>
                            </div>
                          )}
                          <div className="flex items-center gap-2 mt-4">
                            <button
                              onClick={() => dokHerunterladen(d)}
                              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
                            >
                              <Download size={13} strokeWidth={1.9} /> Herunterladen
                            </button>
                            <button
                              onClick={() => window.print()}
                              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
                            >
                              <Printer size={13} strokeWidth={1.9} /> Drucken
                            </button>
                          </div>
                        </div>
                      )}
                    </Card>
                  );
                })}
              </div>
            </Abschnitt>
          )}

          {nav === 'workflow' && (
            <Abschnitt titel="Workflow">
              <Card className="p-6">
                <ol className="relative border-l-2 border-slate-200 ml-3 space-y-6">
                  {r.workflow.map(w => {
                    const farbe = w.status === 'erledigt' ? '#10b981' : w.status === 'aktiv' ? 'var(--mode-primary)' : '#cbd5e1';
                    return (
                      <li key={w.stufe} className="pl-6 relative">
                        <span
                          className="absolute -left-[11px] top-0.5 w-5 h-5 rounded-full border-2 border-white flex items-center justify-center"
                          style={{ background: farbe }}
                        >
                          {w.status === 'erledigt' && <Check size={11} className="text-white" strokeWidth={3} />}
                        </span>
                        <div className="text-[13px] font-semibold text-slate-800">{w.stufe}</div>
                        <div className="text-[11px] text-slate-500 mt-0.5">{w.datum}</div>
                        {w.status === 'aktiv' && (
                          <Badge color="#b91c1c" bg="#fef2f2" className="mt-1.5">Nächster Schritt</Badge>
                        )}
                      </li>
                    );
                  })}
                </ol>
              </Card>
            </Abschnitt>
          )}

          {nav === 'ki-analyse' && (
            <Abschnitt titel="KI-Dossier">
              <div className="grid grid-cols-[1.4fr_1fr] gap-5 items-start">
                <div className="space-y-5">
                  <Card className="p-5">
                    <div className="flex items-center gap-2 mb-3">
                      <Sparkles size={16} strokeWidth={1.9} style={{ color: 'var(--mode-primary)' }} />
                      <h3 className="text-sm font-semibold text-slate-800 flex-1">Lage</h3>
                      <span className="text-[11px] text-slate-400">Dossier-Agent · 15.12.2025, 06:05</span>
                    </div>
                    <div className="space-y-2.5 text-[13px] text-slate-700 leading-relaxed">
                      {dossier.lage.map((a, i) => <p key={i}>{a}</p>)}
                    </div>
                    <div className="mt-4 pt-3 border-t border-slate-100">
                      <div className="text-[11px] font-bold uppercase tracking-wide text-slate-500 mb-1.5">Verlauf</div>
                      <ul className="space-y-1">
                        {dossier.verlauf.map(v => (
                          <li key={v} className="text-[13px] text-slate-700 flex items-start gap-2">
                            <span className="w-1 h-1 rounded-full bg-slate-400 mt-2 shrink-0" />
                            {v}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </Card>

                  <div className="grid grid-cols-2 gap-4">
                    <Card className="p-5">
                      <h3 className="text-[11px] font-bold uppercase tracking-wide text-red-700 mb-2">Risiken</h3>
                      <ul className="space-y-2">
                        {dossier.risiken.map(r => (
                          <li key={r} className="text-[13px] text-slate-700 flex items-start gap-2 leading-snug">
                            <TrendingDown size={13} className="text-red-500 shrink-0 mt-0.5" strokeWidth={2} />
                            {r}
                          </li>
                        ))}
                      </ul>
                    </Card>
                    <Card className="p-5">
                      <h3 className="text-[11px] font-bold uppercase tracking-wide text-emerald-700 mb-2">Chancen</h3>
                      <ul className="space-y-2">
                        {dossier.chancen.map(c => (
                          <li key={c} className="text-[13px] text-slate-700 flex items-start gap-2 leading-snug">
                            <TrendingUp size={13} className="text-emerald-600 shrink-0 mt-0.5" strokeWidth={2} />
                            {c}
                          </li>
                        ))}
                      </ul>
                    </Card>
                  </div>

                  <Card className="p-5">
                    <h3 className="text-sm font-semibold text-slate-800 mb-3">Gesprächspunkte für den nächsten Kontakt</h3>
                    <ol className="space-y-2">
                      {dossier.gespraechspunkte.map((g, i) => (
                        <li key={g} className="flex items-start gap-2.5 text-[13px] text-slate-700 leading-snug">
                          <span
                            className="w-5 h-5 rounded-full text-white text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5"
                            style={{ background: 'var(--mode-primary)' }}
                          >
                            {i + 1}
                          </span>
                          {g}
                        </li>
                      ))}
                    </ol>
                  </Card>
                </div>

                <div className="space-y-5">
                  <Card className="p-5">
                    <h3 className="text-sm font-semibold text-slate-800 mb-4">KI-Scoring</h3>
                    <div className="flex justify-around">
                      {scoring.map(sc => <ScoreRing key={sc.label} label={sc.label} wert={sc.wert} color={sc.color} />)}
                    </div>
                  </Card>

                  <Card className="p-5">
                    <h3 className="text-sm font-semibold text-slate-800 mb-2">Einflussfaktoren</h3>
                    <div className="divide-y divide-slate-100">
                      {faktoren.map(f => (
                        <div key={f.text} className="flex items-center justify-between gap-3 py-2">
                          <span className="flex items-center gap-2 text-[13px] text-slate-700">
                            {f.punkte < 0
                              ? <TrendingDown size={14} className="text-red-500 shrink-0" strokeWidth={2} />
                              : <TrendingUp size={14} className="text-emerald-600 shrink-0" strokeWidth={2} />}
                            {f.text}
                          </span>
                          <span className={clsx('text-[13px] font-semibold shrink-0 tabular-nums', f.punkte < 0 ? 'text-red-600' : 'text-emerald-600')}>
                            {f.punkte > 0 ? '+' : ''}{f.punkte} Pkt
                          </span>
                        </div>
                      ))}
                    </div>
                  </Card>

                  <Card className="p-5" style={{ background: 'var(--mode-pastel)' }}>
                    <div className="text-[11px] font-bold uppercase tracking-wide mb-1" style={{ color: 'var(--mode-primary)' }}>
                      Handlungsempfehlung
                    </div>
                    <div className="text-base font-semibold text-slate-900">{empfehlung.massnahme}</div>
                    <p className="text-[13px] text-slate-700 mt-1.5 leading-snug">{empfehlung.begruendung}</p>
                    <ol className="mt-3 space-y-1.5">
                      {empfehlung.schritte.map((sc, i) => (
                        <li key={sc} className="flex items-start gap-2.5 text-[13px] text-slate-700">
                          <span
                            className="w-5 h-5 rounded-full text-white text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5"
                            style={{ background: 'var(--mode-primary)' }}
                          >
                            {i + 1}
                          </span>
                          {sc}
                        </li>
                      ))}
                    </ol>
                    <div className="grid grid-cols-3 gap-2 mt-4">
                      {empfehlung.kennzahlen.map(k => (
                        <div key={k.label} className="rounded-lg bg-white/70 px-2.5 py-2">
                          <div className="text-[9px] uppercase tracking-wide text-slate-500 leading-tight">{k.label}</div>
                          <div className="text-[13px] font-semibold text-slate-900 mt-0.5">{k.wert}</div>
                        </div>
                      ))}
                    </div>
                  </Card>
                </div>
              </div>

              <div>
                <div className="flex items-baseline justify-between gap-4 mb-3">
                  <h3 className="text-sm font-semibold text-slate-800">Vorbereitete Entwürfe</h3>
                  <span className="text-[11px] text-slate-400">Aus der Akte generiert — vor Versand prüfen</span>
                </div>
                <div className="grid grid-cols-3 gap-4 items-start">
                  {entwuerfe.map(e => (
                    <Card key={e.id} className="p-4 flex flex-col">
                      <div className="flex items-center gap-2 mb-2">
                        <Mail size={14} className="text-slate-400 shrink-0" strokeWidth={1.9} />
                        <span className="text-[13px] font-semibold text-slate-800 flex-1">{e.titel}</span>
                        <Badge color="#475569" bg="#f1f5f9">{e.kanal}</Badge>
                      </div>
                      <pre className="flex-1 text-[11px] leading-relaxed text-slate-600 whitespace-pre-wrap font-sans bg-slate-50 border border-slate-100 rounded-lg p-3 max-h-56 overflow-y-auto">{e.text}</pre>
                      <div className="flex items-center gap-2 mt-3">
                        <button
                          onClick={() => {
                            navigator.clipboard?.writeText(e.text).catch(() => {});
                            toast(`Entwurf „${e.titel}" in die Zwischenablage kopiert.`, 'success');
                          }}
                          className="flex items-center gap-1.5 px-2.5 py-1.5 text-[11px] font-medium text-slate-700 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
                        >
                          <Copy size={12} strokeWidth={1.9} /> Kopieren
                        </button>
                        <button
                          onClick={() => toast(`„${e.titel}" in den Postausgang übernommen — Versand nach Ihrer Prüfung.`, 'success')}
                          className="flex items-center gap-1.5 px-2.5 py-1.5 text-[11px] font-semibold text-white rounded-lg transition-opacity hover:opacity-90"
                          style={{ background: 'var(--mode-primary)' }}
                        >
                          <Check size={12} strokeWidth={2.4} /> Übernehmen
                        </button>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            </Abschnitt>
          )}
        </div>
      </div>
    </div>
  );
}
