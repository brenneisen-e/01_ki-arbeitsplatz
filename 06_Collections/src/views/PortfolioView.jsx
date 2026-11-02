import { useMemo, useState } from 'react';
import { clsx } from 'clsx';
import {
  Users, Euro, TrendingUp, Clock, CheckSquare, ChevronRight, Search, Mail,
  BarChart3, Plus, CheckCircle2, ArrowRight, Phone, Eye, Trash2, Tag, X, RefreshCw,
} from 'lucide-react';
import {
  PORTFOLIO_KPIS, DPD_BUCKETS, INLINE_STATS, NEUE_FAELLE, ZAHLUNGSEINGAENGE,
  SEGMENTE, MATRIX_SUMME, EHEMALIGE, KPI_VERLAEUFE, PORTFOLIO_VERLAUF,
} from '../data/portfolio';
import { CUSTOMERS, SEGMENT_LABELS, STATUS_LABELS, MAHNSTUFEN, SEGMENT_FILTER, PRODUKT_FILTER, dpdBucket } from '../data/customers';
import { buildNbaQueue } from '../data/nextBestActions';
import { useCollections } from '../hooks/useCollections';
import { Card, CardTitle, Badge, WaScore, SectionIntro, Modal, Drawer, EmptyState } from '../components/ui/primitives';
import { euro, zahl } from '../utils/format';
import KpiVerlaufChart from '../components/ui/KpiVerlaufChart';
import SegmentMatrix, { FAELLE_PRO_PUNKT } from '../components/ui/SegmentMatrix';

const KPI_ICONS = { users: Users, euro: Euro, 'trending-up': TrendingUp, clock: Clock, 'check-square': CheckSquare };

const TONE = {
  blue: { bg: '#eff6ff', color: '#2563eb' },
  orange: { bg: '#fff7ed', color: '#ea580c' },
  green: { bg: '#f0fdf4', color: '#16a34a' },
  purple: { bg: '#f5f3ff', color: '#7c3aed' },
  red: { bg: '#fef2f2', color: '#dc2626' },
};

function Sparkline({ punkte, color }) {
  const pts = punkte.map((y, i) => `${2 + i * 9.3},${y}`).join(' ');
  const last = punkte[punkte.length - 1];
  return (
    <svg viewBox="0 0 64 34" className="w-16 h-9 shrink-0" aria-hidden="true">
      <polyline fill="none" stroke={color} strokeWidth="2" points={pts} />
      <circle cx={2 + (punkte.length - 1) * 9.3} cy={last} r="3" fill={color} />
    </svg>
  );
}

function DpdDonut({ onBucket }) {
  // stroke-dasharray auf r=15.9 => Umfang 100
  let offset = 25;
  return (
    <div className="flex flex-col items-center gap-1 shrink-0">
      <svg viewBox="0 0 42 42" className="w-14 h-14" role="img" aria-label="Verteilung der Verzugstage">
        <circle cx="21" cy="21" r="15.9" fill="transparent" stroke="#e2e8f0" strokeWidth="4" />
        {DPD_BUCKETS.map(b => {
          const dash = `${b.anteil} ${100 - b.anteil}`;
          const el = (
            <circle
              key={b.id} cx="21" cy="21" r="15.9" fill="transparent" stroke={b.color} strokeWidth="4"
              strokeDasharray={dash} strokeDashoffset={offset}
              className="cursor-pointer hover:opacity-80 transition-opacity"
              onClick={e => { e.stopPropagation(); onBucket(b.id); }}
            >
              <title>{`${b.label} Tage: ${zahl(b.faelle)} Fälle`}</title>
            </circle>
          );
          offset -= b.anteil;
          return el;
        })}
        <text x="21" y="24" textAnchor="middle" className="fill-slate-800" style={{ fontSize: 11, fontWeight: 700 }}>47</text>
      </svg>
      <div className="flex gap-1">
        {DPD_BUCKETS.map(b => (
          <button
            key={b.id}
            onClick={e => { e.stopPropagation(); onBucket(b.id); }}
            className="text-[9px] font-semibold px-1 py-0.5 rounded hover:bg-slate-100 transition-colors"
            style={{ color: b.color }}
          >
            {b.label}
          </button>
        ))}
      </div>
    </div>
  );
}

function KpiKachel({ kpi, onPopup, onKlick, onBucket }) {
  const Icon = KPI_ICONS[kpi.icon] || Users;
  const tone = TONE[kpi.tone] || TONE.blue;
  const sentiment = kpi.change?.sentiment;
  return (
    <Card
      className={clsx('p-4 flex gap-3 transition-shadow', onKlick && 'cursor-pointer hover:shadow-md')}
      onClick={onKlick}
    >
      <span className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: tone.bg, color: tone.color }}>
        <Icon size={20} strokeWidth={1.75} />
      </span>
      <div className="flex-1 min-w-0 flex items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="text-[11px] font-medium text-slate-500 uppercase tracking-wide">{kpi.label}</div>
          <div className={clsx('text-xl font-semibold mt-0.5 tabular-nums', kpi.highlight ? 'text-emerald-600' : 'text-slate-900')}>
            {kpi.value}
          </div>
          {kpi.change && (
            <div className={clsx('text-[11px] mt-0.5 font-medium',
              sentiment === 'positive' ? 'text-emerald-600' : sentiment === 'negative' ? 'text-red-600' : 'text-slate-500')}>
              {kpi.change.text}
            </div>
          )}
          {kpi.action && (
            <button
              onClick={e => { e.stopPropagation(); onKlick?.(); }}
              className="mt-1.5 inline-flex items-center gap-1 text-[11px] font-semibold text-red-600 hover:text-red-700"
            >
              <ChevronRight size={11} /> {kpi.action.label}
            </button>
          )}
        </div>
        {kpi.donut
          ? <DpdDonut onBucket={onBucket} />
          : kpi.spark && (
            <button
              onClick={e => { e.stopPropagation(); onPopup(kpi); }}
              className="rounded hover:bg-slate-50 transition-colors p-0.5"
              title={kpi.popupTitle}
            >
              <Sparkline punkte={kpi.spark} color={tone.color} />
            </button>
          )}
      </div>
    </Card>
  );
}

function UpdatesKarte({ titel, count, items, tone, onItem, onAlle }) {
  const positiv = tone === 'success';
  return (
    <Card className="p-5">
      <div className="flex items-center gap-2.5 mb-3">
        <span
          className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
          style={positiv ? { background: '#ecfdf5', color: '#059669' } : { background: '#eff6ff', color: '#2563eb' }}
        >
          {positiv ? <CheckCircle2 size={16} strokeWidth={1.9} /> : <Plus size={16} strokeWidth={2.2} />}
        </span>
        <h3 className="text-sm font-semibold text-slate-800 flex-1">{titel}</h3>
        <span
          className="text-xs font-bold px-2 py-0.5 rounded-full"
          style={positiv ? { background: '#ecfdf5', color: '#059669' } : { background: '#eff6ff', color: '#2563eb' }}
        >
          {count}
        </span>
      </div>
      <div className="divide-y divide-slate-100">
        {items.map(i => (
          <button
            key={i.id}
            onClick={() => onItem(i.id)}
            className="w-full text-left py-2.5 hover:bg-slate-50 -mx-2 px-2 rounded transition-colors"
          >
            <div className="flex items-baseline justify-between gap-3">
              <span className="text-sm font-medium text-slate-800 truncate">{i.name}</span>
              <span className={clsx('text-sm font-semibold shrink-0 tabular-nums', positiv ? 'text-emerald-600' : 'text-amber-600')}>
                {i.betrag}
              </span>
            </div>
            <div className="flex items-baseline justify-between gap-3 mt-0.5">
              <span className="text-[11px] text-slate-500 truncate">{i.typ}</span>
              <span className="text-[11px] text-slate-400 shrink-0">{i.zeit}</span>
            </div>
          </button>
        ))}
      </div>
      <button
        onClick={onAlle}
        className={clsx('mt-3 w-full py-2 text-xs font-semibold rounded-lg transition-colors',
          positiv ? 'text-emerald-700 bg-emerald-50 hover:bg-emerald-100' : 'text-blue-700 bg-blue-50 hover:bg-blue-100')}
      >
        Alle {count} anzeigen
      </button>
    </Card>
  );
}

const AKTION_ICONS = {
  mahnprozess: { icon: Mail, titel: 'Mahnprozess starten', tone: 'default' },
  verkaufen: { icon: Tag, titel: 'Forderung verkaufen', tone: 'default' },
  abschreiben: { icon: Trash2, titel: 'Abschreiben', tone: 'danger' },
  anrufen: { icon: Phone, titel: 'Anrufen', tone: 'primary' },
  ansehen: { icon: Eye, titel: 'Akte ansehen', tone: 'default' },
};

function KundenTabelle() {
  const { filter, setzeFilter, filterZuruecksetzen, oeffneKunde, oeffneCrm, toast } = useCollections();
  const [sort, setSort] = useState({ feld: null, richtung: 'asc' });

  const gefiltert = useMemo(() => {
    let list = CUSTOMERS;
    if (filter.ids) list = list.filter(c => filter.ids.includes(c.id));
    if (filter.segment) list = list.filter(c => c.segment === filter.segment);
    if (filter.produkt) list = list.filter(c => c.produkt === filter.produkt);
    if (filter.dpdBucket) list = list.filter(c => dpdBucket(c.dpd) === filter.dpdBucket);
    if (filter.suche) {
      const q = filter.suche.toLowerCase();
      list = list.filter(c =>
        c.name.toLowerCase().includes(q) || c.id.toLowerCase().includes(q) || c.produkt.toLowerCase().includes(q));
    }
    if (sort.feld) {
      const vz = sort.richtung === 'asc' ? 1 : -1;
      list = [...list].sort((a, b) => {
        const av = a[sort.feld], bv = b[sort.feld];
        if (typeof av === 'number' && typeof bv === 'number') return (av - bv) * vz;
        return String(av ?? '').localeCompare(String(bv ?? ''), 'de') * vz;
      });
    }
    return list;
  }, [filter, sort]);

  const sortiere = feld => setSort(s => ({
    feld, richtung: s.feld === feld && s.richtung === 'asc' ? 'desc' : 'asc',
  }));

  const aktivFilter = filter.segment || filter.produkt || filter.suche || filter.dpdBucket || filter.ids;

  const Th = ({ feld, children, className }) => (
    <th
      className={clsx('px-3 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wide text-slate-500', feld && 'cursor-pointer hover:text-slate-800 select-none', className)}
      onClick={feld ? () => sortiere(feld) : undefined}
      scope="col"
    >
      <span className="inline-flex items-center gap-1">
        {children}
        {feld && sort.feld === feld && <span aria-hidden="true">{sort.richtung === 'asc' ? '↑' : '↓'}</span>}
      </span>
    </th>
  );

  return (
    <Card className="overflow-hidden" id="kundenliste">
      <div className="flex items-center justify-between gap-4 px-5 py-4 border-b border-slate-100 flex-wrap">
        <h3 className="text-sm font-semibold text-slate-800">
          Kundenliste
          <span className="ml-2 text-xs font-normal text-slate-500">{gefiltert.length} von {CUSTOMERS.length} Fällen</span>
        </h3>
        <div className="flex items-center gap-2 flex-wrap">
          <select
            value={filter.segment}
            onChange={e => setzeFilter({ segment: e.target.value, ids: null })}
            className="text-xs border border-slate-200 rounded-lg px-2.5 py-1.5 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-200"
            aria-label="Segment filtern"
          >
            {SEGMENT_FILTER.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
          <select
            value={filter.produkt}
            onChange={e => setzeFilter({ produkt: e.target.value, ids: null })}
            className="text-xs border border-slate-200 rounded-lg px-2.5 py-1.5 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-200"
            aria-label="Produkt filtern"
          >
            {PRODUKT_FILTER.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
          <div className="relative">
            <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={filter.suche}
              onChange={e => setzeFilter({ suche: e.target.value, ids: null })}
              placeholder="Kunde suchen …"
              className="text-xs border border-slate-200 rounded-lg pl-8 pr-2.5 py-1.5 w-48 focus:outline-none focus:ring-2 focus:ring-slate-200"
              aria-label="Kunden suchen"
            />
          </div>
          {aktivFilter && (
            <button
              onClick={filterZuruecksetzen}
              className="flex items-center gap-1 text-xs font-medium text-slate-600 hover:text-slate-900 px-2 py-1.5 rounded-lg hover:bg-slate-100 transition-colors"
            >
              <X size={13} /> Filter zurücksetzen
            </button>
          )}
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <Th feld="name">Kunde</Th>
              <Th feld="produkt">Produkt</Th>
              <Th feld="forderung" className="text-right">Forderung</Th>
              <Th feld="dpd">Verzugstage</Th>
              <Th feld="segment">Segment</Th>
              <Th>W/A Score</Th>
              <Th feld="mahnstufe">Mahnstufe</Th>
              <Th feld="aktion">Nächste Aktion</Th>
              <Th feld="status">Status</Th>
              <Th feld="bearbeiter">Bearbeiter</Th>
              <Th>Aktionen</Th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {gefiltert.map(c => {
              const seg = SEGMENT_LABELS[c.segment];
              const st = STATUS_LABELS[c.status];
              const mahn = MAHNSTUFEN[c.mahnstufe] || MAHNSTUFEN.M0;
              const dpdTon = c.dpd === 0 ? 'text-slate-400' : c.dpd <= 30 ? 'text-emerald-600' : c.dpd <= 90 ? 'text-amber-600' : 'text-red-600';
              return (
                <tr
                  key={c.id}
                  onClick={() => oeffneKunde(c.id)}
                  className="hover:bg-[var(--mode-row-hover)] cursor-pointer transition-colors"
                >
                  <td className="px-3 py-2.5">
                    <div className="font-semibold text-slate-800 leading-tight">{c.name}</div>
                    <div className="text-[11px] text-slate-500">{c.typ} | {c.id}</div>
                  </td>
                  <td className="px-3 py-2.5 text-slate-600 text-[13px]">{c.produkt}</td>
                  <td className="px-3 py-2.5 text-right font-semibold text-slate-800 tabular-nums">{euro(c.forderung)}</td>
                  <td className={clsx('px-3 py-2.5 font-semibold tabular-nums', dpdTon)}>{c.dpd}</td>
                  <td className="px-3 py-2.5"><Badge color={seg.color} bg={seg.bg}>{seg.label}</Badge></td>
                  <td className="px-3 py-2.5"><WaScore willingness={c.willingness} ability={c.ability} kompakt /></td>
                  <td className="px-3 py-2.5">
                    <span className="inline-block text-[11px] font-bold px-1.5 py-0.5 rounded" style={{ color: mahn.color, background: mahn.bg }}>
                      {c.mahnstufe}
                    </span>
                  </td>
                  <td className="px-3 py-2.5">
                    {c.aktion ? (
                      <>
                        <div className="text-[13px] text-slate-700 leading-tight">{c.aktion}</div>
                        <div className={clsx('text-[11px]',
                          c.aktionTon === 'overdue' ? 'text-red-600 font-medium'
                            : c.aktionTon === 'upcoming' ? 'text-blue-600' : 'text-slate-400')}>
                          {c.aktionDatum}
                        </div>
                      </>
                    ) : (
                      <span className="text-[11px] text-slate-400">Abgeschlossen {c.aktionDatum}</span>
                    )}
                  </td>
                  <td className="px-3 py-2.5"><Badge color={st.color} bg={st.bg}>{st.label}</Badge></td>
                  <td className="px-3 py-2.5 text-[12px] text-slate-600 whitespace-nowrap">{c.bearbeiter}</td>
                  <td className="px-3 py-2.5" onClick={e => e.stopPropagation()}>
                    <div className="flex items-center gap-1">
                      {c.aktionen.map(a => {
                        const cfg = AKTION_ICONS[a];
                        const Icon = cfg.icon;
                        return (
                          <button
                            key={a}
                            title={cfg.titel}
                            aria-label={`${cfg.titel}: ${c.name}`}
                            onClick={() => {
                              if (a === 'ansehen') { oeffneCrm(c.id); return; }
                              if (a === 'anrufen') { toast(`Anruf an ${c.name} wird vorbereitet …`, 'info'); return; }
                              if (a === 'mahnprozess') { toast(`Mahnprozess für ${c.name} gestartet (Stufe ${c.mahnstufe}).`, 'success'); return; }
                              if (a === 'verkaufen') { toast(`${c.name} für den Forderungsverkauf vorgemerkt.`, 'info'); return; }
                              if (a === 'abschreiben') { toast(`Abschreibung für ${c.name} zur Freigabe eingereicht.`, 'warning'); }
                            }}
                            className={clsx('p-1.5 rounded-md border transition-colors',
                              cfg.tone === 'danger' ? 'border-red-200 text-red-600 hover:bg-red-50'
                                : cfg.tone === 'primary' ? 'border-slate-200 text-white hover:opacity-90'
                                  : 'border-slate-200 text-slate-500 hover:bg-slate-100')}
                            style={cfg.tone === 'primary' ? { background: 'var(--mode-primary)', borderColor: 'var(--mode-primary)' } : undefined}
                          >
                            <Icon size={13} strokeWidth={1.9} />
                          </button>
                        );
                      })}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {!gefiltert.length && <EmptyState text="Keine Fälle für diese Filterkombination." />}
      </div>
    </Card>
  );
}

export default function PortfolioView() {
  const { gotoSection, setzeFilter, oeffneKunde, toast, zeigeKunden, nbaEntfernt, freigegeben } = useCollections();
  const [popup, setPopup] = useState(null);
  const [drawer, setDrawer] = useState(false);
  const [segmentDetail, setSegmentDetail] = useState(null);

  // Die Aktionen-Kachel zeigt die Cockpit-Warteschlange, damit Kachel, Header
  // und Cockpit dieselben Zahlen nennen.
  const kpis = useMemo(() => {
    const queue = buildNbaQueue(nbaEntfernt, freigegeben);
    const ueberfaellig = queue.filter(q => q.ueberfaellig).length;
    return PORTFOLIO_KPIS.map(k => k.id === 'aufgaben'
      ? {
        ...k,
        label: 'Offene Aktionen',
        value: zahl(queue.length),
        change: { text: `${zahl(ueberfaellig)} überfällig`, direction: 'flat', sentiment: ueberfaellig ? 'negative' : 'neutral' },
        action: { label: 'Zum Cockpit', target: 'cockpit' },
      }
      : k);
  }, [nbaEntfernt, freigegeben]);

  const kpiKlick = kpi => {
    if (kpi.id === 'aufgaben') { gotoSection('cockpit'); return; }
    if (kpi.id === 'aktive-faelle') { setzeFilter({ segment: '', produkt: '', dpdBucket: '', ids: null }); return; }
    setPopup(kpi);
  };

  return (
    <div className="px-6 py-6 space-y-6">
      <SectionIntro
        titel="Kundensegmentierung nach Zahlungsbereitschaft und Zahlungsfähigkeit"
        text="Die KI-gestützte Analyse klassifiziert jeden Kunden anhand von Transaktionsmustern, externen Datenquellen und historischem Verhalten. Die Matrix zeigt die Verteilung aller 10.234 Fälle nach Willingness to Pay (horizontale Achse) und Ability to Pay (vertikale Achse)."
      />

      <div className="grid grid-cols-5 gap-4">
        {kpis.map(kpi => (
          <KpiKachel
            key={kpi.id}
            kpi={kpi}
            onPopup={setPopup}
            onKlick={() => kpiKlick(kpi)}
            onBucket={b => { setzeFilter({ dpdBucket: b, ids: null }); toast(`Filter gesetzt: ${b} Verzugstage`, 'info'); }}
          />
        ))}
      </div>

      {/* Aktionsleiste */}
      <Card className="px-5 py-3 flex items-center justify-between gap-6 flex-wrap">
        <div className="flex items-center gap-5">
          {INLINE_STATS.map(s => (
            <div key={s.id} className="flex items-center gap-2 text-sm">
              <span className="text-slate-500">{s.label}</span>
              <span className={clsx('font-semibold tabular-nums',
                s.tone === 'green' ? 'text-emerald-600' : s.tone === 'purple' ? 'text-violet-600' : 'text-blue-600')}>
                {s.value}
              </span>
            </div>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => toast('Mahnlauf gestartet — 1.284 Schreiben in der Warteschlange.', 'success')}
            className="flex items-center gap-1.5 text-xs font-medium text-slate-600 border border-slate-200 rounded-lg px-3 py-1.5 hover:bg-slate-50 transition-colors"
          >
            <Mail size={14} strokeWidth={1.8} /> Mahnlauf starten
          </button>
          <button
            onClick={() => toast('Report wird generiert …', 'info')}
            className="flex items-center gap-1.5 text-xs font-medium text-slate-600 border border-slate-200 rounded-lg px-3 py-1.5 hover:bg-slate-50 transition-colors"
          >
            <BarChart3 size={14} strokeWidth={1.8} /> Report generieren
          </button>
        </div>
      </Card>

      <div className="grid grid-cols-2 gap-5">
        <UpdatesKarte
          titel="Neue Fälle seit letztem Login" count={NEUE_FAELLE.count} items={NEUE_FAELLE.items}
          onItem={oeffneKunde}
          onAlle={() => zeigeKunden(NEUE_FAELLE.items.map(i => i.id), `${NEUE_FAELLE.count} neue Fälle – die drei jüngsten sind in der Liste hervorgehoben.`)}
        />
        <UpdatesKarte
          titel="Zahlungseingänge" count={ZAHLUNGSEINGAENGE.count} items={ZAHLUNGSEINGAENGE.items} tone="success"
          onItem={oeffneKunde}
          onAlle={() => zeigeKunden(ZAHLUNGSEINGAENGE.items.map(i => i.id), `${ZAHLUNGSEINGAENGE.count} Zahlungseingänge – die drei jüngsten sind in der Liste hervorgehoben.`)}
        />
      </div>

      {/* Matrix + Ehemalige */}
      <div className="grid grid-cols-[1fr_auto] gap-5 items-start">
        <Card className="p-5">
          <div className="flex items-start justify-between gap-4 mb-4">
            <div>
              <h3 className="text-sm font-semibold text-slate-800">Willingness / Ability Matrix</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                KI-gestützte Segmentierung • Überfahren zeigt die Fallverteilung, ein Punkt entspricht rund {zahl(FAELLE_PRO_PUNKT)} Fällen • Klick öffnet das Segment
              </p>
            </div>
            <button
              onClick={() => toast('Matrix als Bilddatei exportiert.', 'success')}
              className="text-xs font-medium text-slate-600 border border-slate-200 rounded-lg px-3 py-1.5 hover:bg-slate-50 transition-colors"
            >
              Export
            </button>
          </div>

          <SegmentMatrix onSegment={setSegmentDetail} />

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-center gap-3 text-xs text-slate-600">
            <span><span className="text-slate-400">Gesamt:</span> <strong className="text-slate-800">{MATRIX_SUMME.faelle}</strong></span>
            <span className="text-slate-300">•</span>
            <span><strong className="text-slate-800">{MATRIX_SUMME.volumen}</strong> <span className="text-slate-400">Forderungen</span></span>
            <span className="text-slate-300">•</span>
            <span><strong className="text-slate-800">{MATRIX_SUMME.schnitt}</strong> <span className="text-slate-400">pro Fall</span></span>
          </div>
        </Card>

        <button
          onClick={() => setDrawer(true)}
          className="card-base w-52 p-5 flex flex-col items-center gap-1.5 text-center hover:shadow-md transition-shadow"
        >
          <span className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <CheckCircle2 size={22} strokeWidth={1.7} />
          </span>
          <span className="text-2xl font-semibold text-slate-900 mt-1 tabular-nums">{EHEMALIGE.count}</span>
          <span className="text-xs text-slate-500">Fälle abgeschlossen</span>
          <span className="text-sm font-semibold text-emerald-600">{EHEMALIGE.volumen}</span>
        </button>
      </div>

      <Card className="p-5">
        <CardTitle>Portfolio-Entwicklung (12 Monate)</CardTitle>
        <KpiVerlaufChart
          daten={PORTFOLIO_VERLAUF.map(p => ({ monat: p.monat, wert: p.bestand }))}
          color="#3b82f6"
          einheit="Fälle"
          hoehe={220}
        />
      </Card>

      <KundenTabelle />

      {/* KPI-Verlauf als Popup */}
      <Modal
        offen={!!popup}
        onClose={() => setPopup(null)}
        titel={popup?.popupTitle || ''}
        subtitel="Zeitreihe der letzten sechs Monate"
        breite="max-w-3xl"
      >
        {popup && KPI_VERLAEUFE[popup.id] && (
          <div className="p-6">
            <KpiVerlaufChart
              daten={KPI_VERLAEUFE[popup.id].daten}
              color={KPI_VERLAEUFE[popup.id].color}
              einheit={KPI_VERLAEUFE[popup.id].einheit}
              hoehe={280}
            />
          </div>
        )}
      </Modal>

      {/* Segment-Detail */}
      <Modal
        offen={!!segmentDetail}
        onClose={() => setSegmentDetail(null)}
        titel={segmentDetail ? `Segment ${segmentDetail.title}` : ''}
        subtitel={segmentDetail?.subtitle}
        breite="max-w-3xl"
        footer={segmentDetail && (
          <div className="flex justify-end gap-2">
            <button
              onClick={() => setSegmentDetail(null)}
              className="px-4 py-2 text-sm font-medium text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
            >
              Schließen
            </button>
            <button
              onClick={() => { setzeFilter({ segment: segmentDetail.tableKey, ids: null }); setSegmentDetail(null); gotoSection('portfolio'); }}
              className="px-4 py-2 text-sm font-semibold text-white rounded-lg transition-opacity hover:opacity-90"
              style={{ background: 'var(--mode-primary)' }}
            >
              Fälle in der Liste filtern
            </button>
          </div>
        )}
      >
        {segmentDetail && (
          <div className="p-6 space-y-5">
            <div className="grid grid-cols-3 gap-4">
              {[
                { label: 'Fälle', wert: segmentDetail.countLabel },
                { label: 'Volumen', wert: segmentDetail.volumen },
                { label: 'Ø pro Fall', wert: segmentDetail.schnitt },
              ].map(k => (
                <div key={k.label} className="rounded-xl border border-slate-200 p-4">
                  <div className="text-[11px] uppercase tracking-wide text-slate-500">{k.label}</div>
                  <div className="text-xl font-semibold text-slate-900 mt-1 tabular-nums">{k.wert}</div>
                </div>
              ))}
            </div>
            <div className="rounded-xl p-4" style={{ background: segmentDetail.bg, border: `1px solid ${segmentDetail.border}` }}>
              <div className="text-xs font-semibold uppercase tracking-wide mb-1" style={{ color: segmentDetail.color }}>
                Bearbeitungsstrategie
              </div>
              <div className="text-sm text-slate-700">{segmentDetail.strategie}</div>
            </div>
            <div>
              <div className="text-xs font-semibold uppercase tracking-wide text-slate-500 mb-2">
                Fälle dieses Segments in der Demo-Liste
              </div>
              <div className="divide-y divide-slate-100 rounded-xl border border-slate-200">
                {CUSTOMERS.filter(c => c.segment === segmentDetail.tableKey).map(c => (
                  <button
                    key={c.id}
                    onClick={() => { setSegmentDetail(null); oeffneKunde(c.id); }}
                    className="w-full flex items-center justify-between gap-3 px-4 py-2.5 text-left hover:bg-slate-50 transition-colors"
                  >
                    <span className="text-sm font-medium text-slate-800">{c.name}</span>
                    <span className="text-sm text-slate-600 tabular-nums">{euro(c.forderung)} · {c.dpd} DPD</span>
                  </button>
                ))}
                {!CUSTOMERS.some(c => c.segment === segmentDetail.tableKey) && (
                  <EmptyState text="Für dieses Segment enthält die Demo-Liste keine Einzelfälle." />
                )}
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* Ehemalige Fälle */}
      <Drawer
        offen={drawer}
        onClose={() => setDrawer(false)}
        titel="Ehemalige Fälle"
        subtitel="Abgeschlossene Vorgänge diesen Monat"
        ikone={<CheckCircle2 size={20} strokeWidth={1.8} />}
        footer={
          <button
            onClick={() => { setDrawer(false); zeigeKunden(EHEMALIGE.items.map(i => i.id), `${EHEMALIGE.count} abgeschlossene Fälle – die fünf jüngsten sind in der Liste hervorgehoben.`); }}
            className="w-full flex items-center justify-center gap-2 py-2.5 text-sm font-semibold text-white rounded-lg transition-opacity hover:opacity-90"
            style={{ background: 'var(--mode-primary)' }}
          >
            Alle {EHEMALIGE.count} Fälle anzeigen
            <ArrowRight size={15} />
          </button>
        }
      >
        <div className="grid grid-cols-3 divide-x divide-slate-100 border-b border-slate-100">
          {[
            { wert: String(EHEMALIGE.count), label: 'Fälle' },
            { wert: EHEMALIGE.volumen, label: 'Volumen' },
            { wert: EHEMALIGE.recovery, label: 'Recovery' },
          ].map(s => (
            <div key={s.label} className="py-4 text-center">
              <div className="text-lg font-semibold text-slate-900 tabular-nums">{s.wert}</div>
              <div className="text-[11px] text-slate-500">{s.label}</div>
            </div>
          ))}
        </div>
        <div className="p-4">
          <div className="text-[11px] font-semibold uppercase tracking-wide text-slate-500 mb-2">Kürzlich abgeschlossen</div>
          <div className="divide-y divide-slate-100">
            {EHEMALIGE.items.map(i => (
              <button
                key={i.id}
                onClick={() => { setDrawer(false); oeffneKunde(i.id); }}
                className="w-full flex items-center justify-between gap-3 py-3 text-left hover:bg-slate-50 -mx-2 px-2 rounded transition-colors"
              >
                <span className="min-w-0">
                  <span className="block text-sm font-medium text-slate-800 truncate">{i.name}</span>
                  <span className="block text-[11px] text-slate-500">{i.info}</span>
                </span>
                <span className="text-sm font-semibold text-emerald-600 shrink-0 tabular-nums">{i.betrag}</span>
              </button>
            ))}
          </div>
        </div>
      </Drawer>
    </div>
  );
}
