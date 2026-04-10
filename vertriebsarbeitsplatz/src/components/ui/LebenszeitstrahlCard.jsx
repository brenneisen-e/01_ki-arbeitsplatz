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
      { date: '2015-01', label: 'Kunde seit 2015' },
      { date: '2017-06', label: 'Heirat mit Sabine' },
      { date: '2018-03', label: 'Hauskauf Gießen, 150qm' },
      { date: '2020-09', label: 'Sohn Lukas geboren' },
      { date: '2022-04', label: 'Tochter Marie geboren' },
      { date: '2025-08', label: 'Haustier (Hund) erkannt', aiDetected: true,
        signals: ['Fressnapf-Umsätze', 'Tierarzt-Buchung'] },
      { date: '2026-03', label: 'Trennung erkannt', aiDetected: true, isWarning: true,
        signals: ['2. Miete an neue Adresse', 'Anwaltskosten Familienrecht', 'LV vorzeitig gekündigt', 'Unterhaltszahlungen eingerichtet'] },
    ],
    oeffentlich: [
      { date: '2017-02', label: 'Wechsel zu Continental AG', source: 'LinkedIn' },
      { date: '2019-11', label: 'Beförderung Senior Vertrieb', source: 'LinkedIn' },
      { date: '2024-06', label: 'Vertriebsleiter', source: 'LinkedIn' },
      { date: '2026-02', label: '„Open to Work" aktiviert', source: 'LinkedIn', isWarning: true },
    ],
    finanzen: [
      { date: '2015-01', label: 'Girokonto eröffnet' },
      { date: '2016-04', label: 'Sparplan 200 €/Mon.' },
      { date: '2018-03', label: 'Baufi 380.000€' },
      { date: '2019-01', label: 'KfW Modernisierung' },
      { date: '2020-06', label: 'R+V Unfallvers.' },
      { date: '2021-09', label: 'Union Investment Depot' },
      { date: '2023-11', label: 'ING Tagesgeld 15k€', fida: true },
      { date: '2025-06', label: 'Sparplan reduziert', isWarning: true },
      { date: '2025-08', label: 'Trade Republic Depot', fida: true },
      { date: '2026-01', label: 'LV gekündigt', isWarning: true },
      { date: '2026-06', label: 'KfW läuft aus → 840€ frei', isFuture: true },
      { date: '2033-03', label: 'Baufi-Zinsbindung Ende', isFuture: true },
    ],
  },
  BK00002: {
    leben: [
      { date: '2020-01', label: 'Kunde seit 2020' },
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
      { date: '2020-01', label: 'VR-Mein Konto' },
      { date: '2021-06', label: 'UniProfiRente 175€' },
      { date: '2022-11', label: 'Hochzeitskredit 8k€' },
      { date: '2024-04', label: 'Junior-Sparbuch' },
      { date: '2026-01', label: 'Bauspar-Anfrage' },
    ],
  },
  BK00003: {
    leben: [
      { date: '2008-01', label: 'Kunde seit 2008 (GmbH)' },
      { date: '2012-05', label: 'Familienunternehmen' },
      { date: '2024-09', label: 'Nachfolge-Recherche', aiDetected: true,
        signals: ['M&A Beratung', 'Steuerberater-Gespräche'] },
    ],
    oeffentlich: [
      { date: '2008-03', label: 'GmbH eingetragen', source: 'Handelsregister' },
      { date: '2018-11', label: '„Mittelstand Hessen 2018"', source: 'Pressemeldung' },
    ],
    finanzen: [
      { date: '2008-01', label: 'VR-BusinessKonto' },
      { date: '2010-06', label: 'Steuerrücklagen-Konto' },
      { date: '2015-04', label: 'Firmenkredit 200k€' },
      { date: '2021-09', label: 'Union Investment Depot' },
      { date: '2024-12', label: 'bAV für 25 MA' },
      { date: '2027-06', label: 'Geplante Übergabe', isFuture: true },
    ],
  },
};

function getTimelineForKunde(kunde) {
  if (TIMELINE_DATA[kunde?.id]) return TIMELINE_DATA[kunde.id];
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
  const [zoom, setZoom] = useState('5j');

  const data = useMemo(() => getTimelineForKunde(kunde), [kunde]);

  const { rangeStart, rangeEnd } = useMemo(() => {
    const all = [
      ...data.leben.map((e) => parseDate(e.date).getTime()),
      ...data.oeffentlich.map((e) => parseDate(e.date).getTime()),
      ...data.finanzen.map((e) => parseDate(e.date).getTime()),
    ];
    const today = new Date();
    let start, end;
    if (zoom === 'all') {
      start = new Date(Math.min(...all, today.getTime() - 5 * 365 * 86400000));
      end = new Date(Math.max(...all, today.getTime() + 365 * 86400000));
    } else {
      const yearsBack = zoom === '1j' ? 1 : zoom === '3j' ? 3 : 5;
      start = new Date(today.getFullYear() - yearsBack, 0, 1);
      end = new Date(today.getFullYear() + 2, 0, 1);
    }
    return { rangeStart: start, rangeEnd: end };
  }, [data, zoom]);

  const totalRange = rangeEnd.getTime() - rangeStart.getTime();
  const todayPct = Math.max(0, Math.min(100, ((Date.now() - rangeStart.getTime()) / totalRange) * 100));

  const xPct = (date) => {
    const t = parseDate(date).getTime();
    return Math.max(0, Math.min(100, ((t - rangeStart.getTime()) / totalRange) * 100));
  };

  // Year markers
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

  // For label collision avoidance: alternate labels above/below
  // by sorting events per track and toggling
  const annotatedTracks = useMemo(() => {
    return TRACKS.map((tr) => {
      const events = [...data[tr.key]]
        .map((e, idx) => ({ ...e, _origIdx: idx, _x: xPct(e.date) }))
        .sort((a, b) => a._x - b._x);
      // Alternate label position above/below
      events.forEach((e, i) => { e._labelAbove = i % 2 === 0; });
      return { ...tr, events };
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, rangeStart, rangeEnd]);

  const TRACK_HEIGHT = 130;

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
              className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors ${
                zoom === z.key ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              {z.label}
            </button>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 mb-4 text-xs">
        {TRACKS.map((tr) => {
          const Icon = tr.icon;
          return (
            <div key={tr.key} className="flex items-center gap-1.5">
              <div className="w-6 h-6 rounded-md flex items-center justify-center" style={{ backgroundColor: tr.color + '20' }}>
                <Icon size={13} style={{ color: tr.color }} strokeWidth={2.25} />
              </div>
              <span className="font-semibold text-slate-700">{tr.label}</span>
            </div>
          );
        })}
        <div className="ml-auto flex items-center gap-3 text-[11px] text-slate-500">
          <span className="flex items-center gap-1"><Sparkles size={11} className="text-amber-500" /> KI erkannt</span>
          <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-purple-500" /> FIDA</span>
          <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full border-2 border-slate-400 bg-white" /> Zukunft</span>
        </div>
      </div>

      {/* Timeline body */}
      <div className="relative bg-slate-50 rounded-xl p-6 pl-32 pr-6">
        {/* Track row labels (left) */}
        <div
          className="absolute left-4 top-6 flex flex-col"
          style={{ height: TRACK_HEIGHT * 3, width: 96 }}
        >
          {TRACKS.map((tr) => {
            const Icon = tr.icon;
            return (
              <div
                key={tr.key}
                className="flex items-center gap-2"
                style={{ height: TRACK_HEIGHT }}
              >
                <div
                  className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
                  style={{ backgroundColor: tr.color + '20' }}
                >
                  <Icon size={18} style={{ color: tr.color }} strokeWidth={2.25} />
                </div>
                <span className="text-xs font-bold uppercase tracking-wider" style={{ color: tr.color }}>
                  {tr.label}
                </span>
              </div>
            );
          })}
        </div>

        {/* Tracks */}
        <div className="relative" style={{ height: TRACK_HEIGHT * 3 }}>
          {/* "Heute" vertical line */}
          {todayPct >= 0 && todayPct <= 100 && (
            <div
              className="absolute top-0 bottom-0 border-l-2 border-dashed pointer-events-none z-20"
              style={{ left: `${todayPct}%`, borderColor: '#ef4444' }}
            >
              <span className="absolute -top-1 left-1.5 text-[10px] font-bold text-red-500 whitespace-nowrap bg-slate-50 px-1 rounded">
                HEUTE
              </span>
            </div>
          )}

          {annotatedTracks.map((tr, ti) => {
            const trackCenter = (ti + 0.5) * TRACK_HEIGHT;
            return (
              <div key={tr.key}>
                {/* Track baseline */}
                <div
                  className="absolute left-0 right-0 h-px"
                  style={{ top: trackCenter, backgroundColor: tr.color + '40' }}
                />

                {/* Events */}
                {tr.events.map((event, idx) => {
                  const left = event._x;
                  const isHovered = hovered?.track === tr.key && hovered?.idx === event._origIdx;
                  const dotSize = isHovered ? 18 : 14;
                  const labelAbove = event._labelAbove;
                  return (
                    <div
                      key={idx}
                      className="absolute cursor-pointer group"
                      style={{
                        left: `${left}%`,
                        top: trackCenter,
                        transform: 'translate(-50%, -50%)',
                        // Bigger hit area: invisible padding around the dot
                        padding: 12,
                        zIndex: isHovered ? 30 : 10,
                      }}
                      onMouseEnter={() => setHovered({ track: tr.key, idx: event._origIdx })}
                      onMouseLeave={() => setHovered(null)}
                    >
                      {/* Dot */}
                      <div
                        className="rounded-full transition-all"
                        style={{
                          width: dotSize,
                          height: dotSize,
                          backgroundColor: event.isFuture ? 'white' : tr.color,
                          border: event.isFuture
                            ? `2.5px dashed ${tr.color}`
                            : `2.5px solid white`,
                          boxShadow: isHovered
                            ? `0 0 0 6px ${tr.color}30`
                            : '0 1px 4px rgba(0,0,0,0.25)',
                        }}
                      />
                      {/* AI sparkle badge */}
                      {event.aiDetected && (
                        <div
                          className="absolute w-4 h-4 rounded-full bg-amber-400 flex items-center justify-center border-2 border-white"
                          style={{ top: 6, right: 6 }}
                        >
                          <Sparkles size={9} className="text-white" strokeWidth={3} />
                        </div>
                      )}
                      {/* FIDA dot */}
                      {event.fida && (
                        <div
                          className="absolute w-3 h-3 rounded-full bg-purple-500 border-2 border-white"
                          style={{ top: 7, right: 7 }}
                        />
                      )}
                      {/* Warning */}
                      {event.isWarning && (
                        <div
                          className="absolute w-4 h-4 rounded-full bg-red-500 flex items-center justify-center border-2 border-white"
                          style={{ top: 6, right: 6 }}
                        >
                          <AlertTriangle size={9} className="text-white" strokeWidth={3} />
                        </div>
                      )}

                      {/* Inline label – stems out vertically from the dot */}
                      <div
                        className="absolute pointer-events-none whitespace-nowrap text-[11px] font-medium text-slate-700"
                        style={{
                          left: '50%',
                          top: labelAbove ? -2 : 'auto',
                          bottom: labelAbove ? 'auto' : -2,
                          transform: labelAbove
                            ? 'translate(-50%, -100%)'
                            : 'translate(-50%, 100%)',
                          maxWidth: 140,
                          whiteSpace: 'normal',
                          textAlign: 'center',
                          lineHeight: 1.15,
                        }}
                      >
                        <div
                          className="px-1.5 py-0.5 rounded inline-block max-w-[140px]"
                          style={{
                            backgroundColor: '#ffffff',
                            border: `1px solid ${tr.color}30`,
                            fontWeight: isHovered ? 700 : 500,
                            color: isHovered ? '#0f172a' : '#475569',
                          }}
                        >
                          {event.label}
                        </div>
                        {/* Connector line from label to dot */}
                        <div
                          className="absolute left-1/2 -translate-x-1/2 w-px"
                          style={{
                            top: labelAbove ? '100%' : 'auto',
                            bottom: labelAbove ? 'auto' : '100%',
                            height: 6,
                            backgroundColor: tr.color + '60',
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>

        {/* Year markers */}
        <div className="relative mt-6 h-6 border-t-2 border-slate-300">
          {yearMarkers.map((m) => (
            <div
              key={m.year}
              className="absolute -translate-x-1/2 text-xs font-bold font-mono text-slate-500 pt-1.5"
              style={{ left: `${m.pct}%` }}
            >
              <div className="absolute left-1/2 -translate-x-1/2 -top-1 w-px h-2 bg-slate-300" />
              {m.year}
            </div>
          ))}
        </div>

        {/* Detail tooltip (rendered absolutely over the timeline) */}
        {hovered && (() => {
          const track = TRACKS.find((t) => t.key === hovered.track);
          const e = data[hovered.track][hovered.idx];
          if (!e) return null;
          const tipPct = xPct(e.date);
          return (
            <div
              className="absolute z-40 bg-white rounded-xl shadow-2xl border border-slate-200 p-4 text-xs pointer-events-none animate-fade-in"
              style={{
                left: `min(max(calc(${tipPct}% + 8rem - 130px), 8rem), calc(100% - 280px))`,
                top: -8,
                width: 280,
              }}
            >
              <div className="flex items-center gap-2 mb-2 pb-2 border-b border-slate-100">
                <div className="w-7 h-7 rounded-md flex items-center justify-center shrink-0" style={{ background: track.color + '20' }}>
                  <track.icon size={14} style={{ color: track.color }} strokeWidth={2.25} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[10px] uppercase font-bold tracking-wider text-slate-400">{track.label}</div>
                  <div className="text-[11px] font-mono font-semibold text-slate-600">{formatTooltipDate(e.date)}</div>
                </div>
              </div>
              <div className="font-bold text-slate-900 text-sm leading-snug mb-2">{e.label}</div>
              {e.source && (
                <div className="text-[11px] text-slate-500 italic mb-1">Quelle: {e.source}</div>
              )}
              {e.aiDetected && (
                <div className="flex items-center gap-1 text-[11px] text-amber-700 font-semibold mb-1">
                  <Sparkles size={11} /> Aus Kontoumsätzen erkannt
                </div>
              )}
              {e.fida && (
                <div className="text-[11px] text-purple-700 font-semibold mb-1">FIDA · Fremdbank-Daten</div>
              )}
              {e.isFuture && (
                <div className="text-[11px] text-slate-500 italic mb-1">Geplant · Zukunft</div>
              )}
              {e.isWarning && (
                <div className="flex items-center gap-1 text-[11px] text-red-700 font-semibold mb-1">
                  <AlertTriangle size={11} /> Achtung – Warnsignal
                </div>
              )}
              {e.signals && e.signals.length > 0 && (
                <div className="mt-2 pt-2 border-t border-slate-100">
                  <div className="text-[10px] font-bold uppercase text-slate-400 mb-1">Erkannte Signale</div>
                  <ul className="space-y-1">
                    {e.signals.map((s, i) => (
                      <li key={i} className="text-[11px] text-slate-700 flex items-start gap-1">
                        <span style={{ color: track.color }}>•</span>
                        <span>{s}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          );
        })()}
      </div>

      <div className="mt-3 text-[11px] text-slate-400 italic">
        Basierend auf öffentlich zugänglichen Informationen, internen Bankdaten und FIDA-Quellen. Keine geschützten Daten.
      </div>
    </Card>
  );
}
