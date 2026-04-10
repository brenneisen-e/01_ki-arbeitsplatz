import { useState, useMemo } from 'react';
import { Heart, Globe, TrendingUp, Sparkles, AlertTriangle, Database } from 'lucide-react';
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
      { date: '2018-03', label: 'Baufinanzierung 380.000 €' },
      { date: '2019-01', label: 'KfW-Kredit Modernisierung' },
      { date: '2020-06', label: 'R+V Unfallversicherung' },
      { date: '2021-09', label: 'Union Investment Depot' },
      { date: '2023-11', label: 'ING Tagesgeld 15.000 €', fida: true },
      { date: '2025-06', label: 'Sparplan reduziert', isWarning: true },
      { date: '2025-08', label: 'Trade Republic Depot', fida: true },
      { date: '2026-01', label: 'LV gekündigt', isWarning: true },
      { date: '2026-06', label: 'KfW läuft aus → 840€/Mon. frei', isFuture: true },
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
      { date: '2020-01', label: 'VR-MeinKonto eröffnet' },
      { date: '2021-06', label: 'UniProfiRente 175 €/Mon.' },
      { date: '2022-11', label: 'Hochzeitskredit 8.000 €' },
      { date: '2024-04', label: 'Junior-Sparbuch eröffnet' },
      { date: '2026-01', label: 'Bauspar-Anfrage gestartet' },
    ],
  },
  BK00003: {
    leben: [
      { date: '2008-01', label: 'Kunde seit 2008 (GmbH-Gründung)' },
      { date: '2012-05', label: 'Wird Familienunternehmen' },
      { date: '2024-09', label: 'Nachfolge-Recherche erkannt', aiDetected: true,
        signals: ['M&A Beratung gesucht', 'Erste Steuerberater-Gespräche'] },
    ],
    oeffentlich: [
      { date: '2008-03', label: 'GmbH eingetragen', source: 'Handelsregister' },
      { date: '2018-11', label: 'Auszeichnung „Mittelstand Hessen 2018"', source: 'Pressemeldung' },
    ],
    finanzen: [
      { date: '2008-01', label: 'VR-BusinessKonto eröffnet' },
      { date: '2010-06', label: 'Steuerrücklagen-Konto' },
      { date: '2015-04', label: 'Firmenkredit-Linie 200.000 €' },
      { date: '2021-09', label: 'Union Investment Firmendepot' },
      { date: '2024-12', label: 'bAV für 25 Mitarbeiter' },
      { date: '2027-06', label: 'Geplante Nachfolge-Übergabe', isFuture: true },
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
  const months = ['Januar', 'Februar', 'März', 'April', 'Mai', 'Juni', 'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'];
  return `${months[(m || 1) - 1]} ${y}`;
}

/* ── Component ────────────────────────────────────────────── */
export default function LebenszeitstrahlCard({ kunde }) {
  const [hovered, setHovered] = useState(null); // { track, idx }
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

  // Detail panel: hovered event OR fallback to "today" event (most recent)
  const detailEvent = useMemo(() => {
    if (hovered) {
      const track = TRACKS.find((t) => t.key === hovered.track);
      const event = data[hovered.track]?.[hovered.idx];
      if (event) return { ...event, track };
    }
    // Fallback: pick the latest event across all tracks before today
    const today = Date.now();
    let latest = null;
    TRACKS.forEach((tr) => {
      data[tr.key].forEach((e, idx) => {
        const t = parseDate(e.date).getTime();
        if (t <= today && (!latest || t > latest.t)) {
          latest = { ...e, track: tr, idx, t };
        }
      });
    });
    return latest;
  }, [hovered, data]);

  const TRACK_HEIGHT = 64;

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

      {/* Timeline body */}
      <div className="bg-slate-50 rounded-2xl p-5 pl-32 pr-6">
        {/* Track row labels (left) */}
        <div className="absolute pl-5 -ml-32" style={{ width: 96 }}>
          <div className="flex flex-col gap-0">
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
        </div>

        {/* Tracks (relative container) */}
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

          {TRACKS.map((tr, ti) => {
            const trackCenter = (ti + 0.5) * TRACK_HEIGHT;
            return (
              <div key={tr.key}>
                {/* Track baseline */}
                <div
                  className="absolute left-0 right-0 h-0.5 rounded-full"
                  style={{ top: trackCenter - 1, backgroundColor: tr.color + '25' }}
                />

                {/* Events */}
                {data[tr.key].map((event, idx) => {
                  const left = xPct(event.date);
                  const isHovered = hovered?.track === tr.key && hovered?.idx === idx;
                  const dotSize = isHovered ? 22 : 16;
                  return (
                    <div
                      key={idx}
                      className="absolute cursor-pointer"
                      style={{
                        left: `${left}%`,
                        top: trackCenter,
                        transform: 'translate(-50%, -50%)',
                        padding: 14,
                        zIndex: isHovered ? 30 : 10,
                      }}
                      onMouseEnter={() => setHovered({ track: tr.key, idx })}
                      onMouseLeave={() => setHovered(null)}
                    >
                      {/* Outer glow when hovered */}
                      {isHovered && (
                        <div
                          className="absolute rounded-full pointer-events-none"
                          style={{
                            width: 36,
                            height: 36,
                            top: '50%',
                            left: '50%',
                            transform: 'translate(-50%, -50%)',
                            backgroundColor: tr.color + '25',
                          }}
                        />
                      )}
                      {/* Dot */}
                      <div
                        className="rounded-full transition-all"
                        style={{
                          width: dotSize,
                          height: dotSize,
                          backgroundColor: event.isFuture ? '#ffffff' : tr.color,
                          border: event.isFuture
                            ? `3px dashed ${tr.color}`
                            : `3px solid white`,
                          boxShadow: isHovered
                            ? `0 4px 12px ${tr.color}66`
                            : '0 1px 4px rgba(0,0,0,0.2)',
                        }}
                      />
                      {/* AI sparkle badge */}
                      {event.aiDetected && (
                        <div
                          className="absolute w-4 h-4 rounded-full bg-amber-400 flex items-center justify-center border-2 border-white shadow-sm"
                          style={{ top: 8, right: 8 }}
                        >
                          <Sparkles size={9} className="text-white" strokeWidth={3} />
                        </div>
                      )}
                      {/* FIDA dot */}
                      {event.fida && (
                        <div
                          className="absolute w-3 h-3 rounded-full bg-purple-500 border-2 border-white shadow-sm"
                          style={{ top: 9, right: 9 }}
                        />
                      )}
                      {/* Warning */}
                      {event.isWarning && (
                        <div
                          className="absolute w-4 h-4 rounded-full bg-red-500 flex items-center justify-center border-2 border-white shadow-sm"
                          style={{ top: 8, right: 8 }}
                        >
                          <AlertTriangle size={9} className="text-white" strokeWidth={3} />
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
        <div className="relative mt-3 h-6 border-t-2 border-slate-200">
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
      </div>

      {/* Detail panel: shows hovered event or latest event by default */}
      {detailEvent && (() => {
        const track = detailEvent.track;
        const TIcon = track.icon;
        return (
          <div
            className="mt-4 rounded-xl border-2 p-4 transition-all"
            style={{
              borderColor: track.color + '40',
              background: `linear-gradient(135deg, ${track.color}08 0%, ${track.color}03 100%)`,
            }}
          >
            <div className="flex items-start gap-4">
              {/* Icon column */}
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
                style={{ backgroundColor: track.color + '20' }}
              >
                <TIcon size={22} style={{ color: track.color }} strokeWidth={2} />
              </div>

              {/* Main content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <span
                    className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full"
                    style={{ backgroundColor: track.color + '20', color: track.color }}
                  >
                    {track.label}
                  </span>
                  <span className="text-xs font-mono font-semibold text-slate-500">{formatTooltipDate(detailEvent.date)}</span>
                  {detailEvent.aiDetected && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">
                      <Sparkles size={10} /> KI erkannt
                    </span>
                  )}
                  {detailEvent.fida && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-purple-700 bg-purple-100 px-2 py-0.5 rounded-full">
                      <Database size={10} /> FIDA
                    </span>
                  )}
                  {detailEvent.isFuture && (
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-600 bg-slate-200 px-2 py-0.5 rounded-full">
                      Zukunft
                    </span>
                  )}
                  {detailEvent.isWarning && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-red-700 bg-red-100 px-2 py-0.5 rounded-full">
                      <AlertTriangle size={10} /> Warnsignal
                    </span>
                  )}
                </div>

                <div className="text-base font-bold text-slate-900 leading-snug">{detailEvent.label}</div>

                {detailEvent.source && (
                  <div className="text-xs text-slate-500 italic mt-1">Quelle: {detailEvent.source}</div>
                )}

                {detailEvent.signals && detailEvent.signals.length > 0 && (
                  <div className="mt-3">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">Erkannte Signale</div>
                    <ul className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-1">
                      {detailEvent.signals.map((s, i) => (
                        <li key={i} className="text-xs text-slate-700 flex items-start gap-1.5">
                          <span style={{ color: track.color }} className="mt-0.5">▸</span>
                          <span>{s}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })()}

      {/* Legend */}
      <div className="mt-3 flex items-center gap-4 text-[11px] text-slate-500 flex-wrap">
        {TRACKS.map((tr) => {
          const Icon = tr.icon;
          return (
            <div key={tr.key} className="flex items-center gap-1.5">
              <Icon size={12} style={{ color: tr.color }} strokeWidth={2.5} />
              <span className="font-medium">{tr.label}</span>
            </div>
          );
        })}
        <span className="text-slate-300">·</span>
        <span className="flex items-center gap-1"><Sparkles size={11} className="text-amber-500" /> KI erkannt</span>
        <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-purple-500" /> FIDA</span>
        <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full border-2 border-slate-400 bg-white" /> Zukunft</span>
        <span className="ml-auto text-[10px] italic text-slate-400">Hover über einen Punkt für Details</span>
      </div>
    </Card>
  );
}
