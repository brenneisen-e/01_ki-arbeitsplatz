import { useState, useMemo } from 'react';
import { Heart, Globe, TrendingUp, Sparkles, AlertTriangle } from 'lucide-react';
import Card from './Card';

/* ── Track config ──────────────────────────────────────────── */
const TRACKS = [
  { key: 'leben',     label: 'Leben',      color: '#3b82f6', icon: Heart },
  { key: 'oeffentlich', label: 'Öffentlich', color: '#8b5cf6', icon: Globe },
  { key: 'finanzen',  label: 'Finanzen',   color: '#22c55e', icon: TrendingUp },
];

/* ── Demo timeline data per Banking Kunde ─────────────────── */
const TIMELINE_DATA = {
  BK00001: {
    leben: [
      { date: '2015-01', label: 'Kunde seit 01/2015' },
      { date: '2017-06', label: 'Heirat mit Sabine' },
      { date: '2018-03', label: 'Hauskauf Gießen, Gartenstr. 18, 150qm' },
      { date: '2020-09', label: 'Sohn Lukas geboren' },
      { date: '2022-04', label: 'Tochter Marie geboren' },
      { date: '2025-08', label: 'Haustier erkannt (vermutlich Hund)', aiDetected: true,
        signals: ['Fressnapf-Umsätze', 'Tierarzt-Buchung'] },
      { date: '2026-03', label: 'Trennung erkannt', aiDetected: true, isWarning: true,
        signals: ['2. Miete an neue Adresse', 'Anwaltskosten Familienrecht', 'LV vorzeitig gekündigt', 'Unterhaltszahlungen eingerichtet'] },
    ],
    oeffentlich: [
      { date: '2017-02', label: 'Wechsel zu Continental AG', source: 'LinkedIn' },
      { date: '2019-11', label: 'Beförderung: Senior Vertrieb', source: 'LinkedIn' },
      { date: '2024-06', label: 'Vertriebsleiter', source: 'LinkedIn' },
      { date: '2026-02', label: 'LinkedIn: „Open to Work" aktiviert', source: 'LinkedIn', isWarning: true },
    ],
    finanzen: [
      { date: '2015-01', label: 'Girokonto eröffnet' },
      { date: '2016-04', label: 'Sparplan 200 €/Mon. gestartet' },
      { date: '2018-03', label: 'Baufinanzierung 380.000€, 15 J., 1,8%' },
      { date: '2019-01', label: 'KfW-Kredit Modernisierung' },
      { date: '2020-06', label: 'R+V Unfallversicherung' },
      { date: '2021-09', label: 'Union Investment Firmendepot' },
      { date: '2023-11', label: 'Tagesgeld ING eröffnet, 15.000€', fida: true },
      { date: '2025-06', label: 'VR-Sparplan reduziert auf 100€', isWarning: true },
      { date: '2025-08', label: 'Trade Republic Depot eröffnet', fida: true },
      { date: '2026-01', label: 'Kapitallebensversicherung gekündigt', isWarning: true },
      { date: '2026-06', label: 'KfW-Kredit läuft aus → 840€/Mon. frei', isFuture: true },
      { date: '2033-03', label: 'Baufinanzierung Zinsbindung endet', isFuture: true },
    ],
  },
  BK00002: {
    leben: [
      { date: '2020-01', label: 'Kunde seit 01/2020' },
      { date: '2022-08', label: 'Heirat mit Tobias' },
      { date: '2024-03', label: 'Sohn geboren' },
      { date: '2026-02', label: 'Immo-Suche erkannt', aiDetected: true,
        signals: ['Immo-Newsletter abonniert', 'Maklerbesuche (Geo-Daten)'] },
    ],
    oeffentlich: [
      { date: '2021-04', label: 'Marketing Manager bei R+V', source: 'LinkedIn' },
      { date: '2024-09', label: 'Senior Marketing Lead', source: 'LinkedIn' },
    ],
    finanzen: [
      { date: '2020-01', label: 'VR-Mein Konto eröffnet' },
      { date: '2021-06', label: 'Sparplan 175 €/Mon. UniProfiRente' },
      { date: '2022-11', label: 'Hochzeitskredit 8.000€' },
      { date: '2024-04', label: 'Junior-Sparbuch für Sohn' },
      { date: '2026-01', label: 'Bauspar-Anfrage gestartet', isFuture: false },
    ],
  },
  BK00003: {
    leben: [
      { date: '2008-01', label: 'Kunde seit 01/2008 (GmbH-Gründung)' },
      { date: '2012-05', label: 'GmbH wird Familienunternehmen' },
      { date: '2024-09', label: 'Nachfolge-Recherche erkannt', aiDetected: true,
        signals: ['M&A Beratung Suchen', 'Erste Gespräche Steuerberater'] },
    ],
    oeffentlich: [
      { date: '2008-03', label: 'GmbH eingetragen', source: 'Handelsregister' },
      { date: '2018-11', label: 'Auszeichnung „Mittelstand Hessen 2018"', source: 'Pressemeldung' },
    ],
    finanzen: [
      { date: '2008-01', label: 'VR-BusinessKonto eröffnet' },
      { date: '2010-06', label: 'VR-Rücklagenkonto Steuer' },
      { date: '2015-04', label: 'Firmenkredit-Linie 200k€' },
      { date: '2021-09', label: 'Union Investment Firmendepot', fida: false },
      { date: '2024-12', label: 'bAV für 25 Mitarbeiter geprüft' },
      { date: '2027-06', label: 'Geplante Nachfolge-Übergabe', isFuture: true },
    ],
  },
};

function getTimelineForKunde(kunde) {
  // Prefer hand-crafted demo data
  if (TIMELINE_DATA[kunde?.id]) return TIMELINE_DATA[kunde.id];
  // Fallback: derive a minimal timeline from the customer record
  const seitJahr = kunde?.eigeneProdukte?.[0]?.seit?.slice(0, 7) || '2020-01';
  return {
    leben: [
      { date: seitJahr, label: `Kunde seit ${seitJahr}` },
      ...(kunde?.partner ? [{ date: seitJahr, label: `Partner: ${kunde.partner.name}` }] : []),
      ...((kunde?.kinder || []).map((k) => ({
        date: `${new Date().getFullYear() - (k.alter || 0)}-06`,
        label: `${k.name} geboren`,
      }))),
    ],
    oeffentlich: kunde?.linkedin ? [
      { date: seitJahr, label: kunde.beruf || 'Beruf', source: 'LinkedIn' },
    ] : [],
    finanzen: (kunde?.eigeneProdukte || []).map((p) => ({
      date: (p.seit || seitJahr).slice(0, 7),
      label: p.produkt,
    })),
  };
}

/* ── Helpers ──────────────────────────────────────────────── */
function parseDate(s) {
  const [y, m] = (s || '').split('-').map(Number);
  return new Date(y || 2020, (m || 1) - 1, 1);
}

function formatTooltipDate(s) {
  const [y, m] = s.split('-').map(Number);
  const months = ['Jan', 'Feb', 'Mär', 'Apr', 'Mai', 'Jun', 'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Dez'];
  return `${months[(m || 1) - 1]} ${y}`;
}

/* ── Component ────────────────────────────────────────────── */
export default function LebenszeitstrahlCard({ kunde }) {
  const [hovered, setHovered] = useState(null);
  const [zoom, setZoom] = useState('5j'); // '1j' | '3j' | '5j' | 'all'

  const data = useMemo(() => getTimelineForKunde(kunde), [kunde]);

  // Determine the time range based on zoom level
  const { rangeStart, rangeEnd, allEvents } = useMemo(() => {
    const all = [
      ...data.leben.map((e) => ({ ...e, track: 'leben' })),
      ...data.oeffentlich.map((e) => ({ ...e, track: 'oeffentlich' })),
      ...data.finanzen.map((e) => ({ ...e, track: 'finanzen' })),
    ];
    const today = new Date();
    let start, end;
    if (zoom === 'all') {
      const dates = all.map((e) => parseDate(e.date).getTime());
      start = new Date(Math.min(...dates, today.getTime() - 5 * 365 * 86400000));
      end = new Date(Math.max(...dates, today.getTime() + 365 * 86400000));
    } else {
      const yearsBack = zoom === '1j' ? 1 : zoom === '3j' ? 3 : 5;
      start = new Date(today.getFullYear() - yearsBack, 0, 1);
      end = new Date(today.getFullYear() + 2, 0, 1);
    }
    return { rangeStart: start, rangeEnd: end, allEvents: all };
  }, [data, zoom]);

  const totalRange = rangeEnd.getTime() - rangeStart.getTime();
  const todayPct = Math.max(0, Math.min(100, ((Date.now() - rangeStart.getTime()) / totalRange) * 100));

  const xPct = (date) => {
    const t = parseDate(date).getTime();
    return Math.max(0, Math.min(100, ((t - rangeStart.getTime()) / totalRange) * 100));
  };

  // Build year markers
  const yearMarkers = useMemo(() => {
    const startY = rangeStart.getFullYear();
    const endY = rangeEnd.getFullYear();
    const years = [];
    const step = (endY - startY) > 12 ? 2 : 1;
    for (let y = startY; y <= endY; y += step) {
      years.push({ year: y, pct: ((new Date(y, 0, 1).getTime() - rangeStart.getTime()) / totalRange) * 100 });
    }
    return years;
  }, [rangeStart, rangeEnd, totalRange]);

  return (
    <Card hover={false}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Sparkles size={20} style={{ color: 'var(--mode-primary-light)' }} strokeWidth={1.75} />
          <h3 className="font-semibold text-slate-800">Kunden-Lebenszeitstrahl</h3>
        </div>
        <div className="flex items-center gap-1 bg-slate-100 rounded-full p-0.5">
          {[
            { key: '1j', label: '1 J' },
            { key: '3j', label: '3 J' },
            { key: '5j', label: '5 J' },
            { key: 'all', label: 'Alles' },
          ].map((z) => (
            <button
              key={z.key}
              onClick={() => setZoom(z.key)}
              className={`px-2.5 py-1 rounded-full text-[11px] font-semibold transition-colors ${
                zoom === z.key ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              {z.label}
            </button>
          ))}
        </div>
      </div>

      {/* Track legend */}
      <div className="flex items-center gap-4 mb-3 text-xs">
        {TRACKS.map((tr) => {
          const Icon = tr.icon;
          return (
            <div key={tr.key} className="flex items-center gap-1.5">
              <div className="w-5 h-5 rounded flex items-center justify-center" style={{ backgroundColor: tr.color + '20' }}>
                <Icon size={11} style={{ color: tr.color }} strokeWidth={2.25} />
              </div>
              <span className="font-medium text-slate-600">{tr.label}</span>
            </div>
          );
        })}
        <div className="ml-auto flex items-center gap-3 text-[10px] text-slate-400">
          <span className="flex items-center gap-1"><Sparkles size={10} className="text-amber-500" /> KI erkannt</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-purple-500" /> FIDA</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full border border-slate-400 bg-white" /> Zukunft</span>
        </div>
      </div>

      {/* Timeline body */}
      <div className="relative bg-slate-50 rounded-xl p-4 pl-24" style={{ minHeight: 220 }}>
        {/* Track row labels (left) */}
        <div className="absolute left-3 top-4 bottom-12 flex flex-col justify-around text-[10px] uppercase font-bold text-slate-400 tracking-wider">
          {TRACKS.map((tr) => (
            <div key={tr.key}>{tr.label}</div>
          ))}
        </div>

        {/* Tracks */}
        <div className="relative" style={{ height: 150 }}>
          {/* "Heute" vertical line */}
          {todayPct >= 0 && todayPct <= 100 && (
            <div
              className="absolute top-0 bottom-0 w-px border-l-2 border-dashed pointer-events-none"
              style={{ left: `${todayPct}%`, borderColor: '#ef4444' }}
            >
              <span className="absolute -top-3 left-1 text-[9px] font-bold text-red-500 whitespace-nowrap">HEUTE</span>
            </div>
          )}

          {TRACKS.map((tr, ti) => {
            const trackY = (ti + 0.5) * (150 / 3);
            return (
              <div
                key={tr.key}
                className="absolute left-0 right-0"
                style={{ top: trackY - 1 }}
              >
                {/* Track baseline */}
                <div className="h-px w-full" style={{ backgroundColor: tr.color + '30' }} />

                {/* Events on this track */}
                {data[tr.key].map((event, idx) => {
                  const left = xPct(event.date);
                  const isHovered = hovered?.track === tr.key && hovered?.idx === idx;
                  return (
                    <div
                      key={idx}
                      className="absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer"
                      style={{ left: `${left}%`, top: 0 }}
                      onMouseEnter={() => setHovered({ track: tr.key, idx, event })}
                      onMouseLeave={() => setHovered(null)}
                    >
                      {/* Event dot */}
                      <div
                        className="rounded-full transition-all"
                        style={{
                          width: isHovered ? 14 : 10,
                          height: isHovered ? 14 : 10,
                          backgroundColor: event.isFuture ? 'white' : tr.color,
                          border: event.isFuture
                            ? `2px dashed ${tr.color}`
                            : `2px solid white`,
                          boxShadow: isHovered
                            ? `0 0 0 4px ${tr.color}30`
                            : '0 1px 3px rgba(0,0,0,0.25)',
                        }}
                      />
                      {/* AI sparkle */}
                      {event.aiDetected && (
                        <div
                          className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-amber-400 flex items-center justify-center"
                          title="Aus Kontoumsätzen erkannt"
                        >
                          <Sparkles size={7} className="text-white" strokeWidth={3} />
                        </div>
                      )}
                      {/* FIDA dot */}
                      {event.fida && (
                        <div className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-purple-500 border border-white" title="FIDA-Daten" />
                      )}
                      {/* Warning */}
                      {event.isWarning && (
                        <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-red-500 flex items-center justify-center">
                          <AlertTriangle size={7} className="text-white" strokeWidth={3} />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>

        {/* Year markers */}
        <div className="relative mt-2 h-5 border-t border-slate-200">
          {yearMarkers.map((m) => (
            <div
              key={m.year}
              className="absolute -translate-x-1/2 text-[10px] font-mono text-slate-400 pt-1"
              style={{ left: `${m.pct}%` }}
            >
              {m.year}
            </div>
          ))}
        </div>

        {/* Tooltip */}
        {hovered && (() => {
          const tr = TRACKS.find((t) => t.key === hovered.track);
          const e = hovered.event;
          const tipLeft = xPct(e.date);
          return (
            <div
              className="absolute z-10 bg-white rounded-lg shadow-xl border border-slate-200 p-3 text-xs pointer-events-none"
              style={{
                left: `min(calc(${tipLeft}% + 5rem), calc(100% - 220px))`,
                top: 8,
                width: 240,
              }}
            >
              <div className="flex items-center gap-1.5 mb-1">
                <span className="w-2 h-2 rounded-full" style={{ background: tr.color }} />
                <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">{tr.label}</span>
                <span className="ml-auto text-[10px] font-mono text-slate-500">{formatTooltipDate(e.date)}</span>
              </div>
              <div className="font-bold text-slate-800 leading-snug mb-1">{e.label}</div>
              {e.source && (
                <div className="text-[10px] text-slate-500 italic">Quelle: {e.source}</div>
              )}
              {e.aiDetected && (
                <div className="flex items-center gap-1 text-[10px] text-amber-600 font-semibold mt-1">
                  <Sparkles size={10} /> Aus Kontoumsätzen erkannt
                </div>
              )}
              {e.fida && (
                <div className="text-[10px] text-purple-600 font-semibold mt-1">FIDA · Fremdbank-Daten</div>
              )}
              {e.isFuture && (
                <div className="text-[10px] text-slate-500 italic mt-1">Geplant / Zukunft</div>
              )}
              {e.signals && e.signals.length > 0 && (
                <div className="mt-2 pt-2 border-t border-slate-100">
                  <div className="text-[9px] font-bold uppercase text-slate-400 mb-1">Signale</div>
                  <ul className="space-y-0.5">
                    {e.signals.map((s, i) => (
                      <li key={i} className="text-[10px] text-slate-600">• {s}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          );
        })()}
      </div>

      <div className="mt-3 text-[10px] text-slate-400 italic">
        Basierend auf öffentlich zugänglichen Informationen, internen Bankdaten und FIDA-Quellen. Keine geschützten Daten.
      </div>
    </Card>
  );
}
