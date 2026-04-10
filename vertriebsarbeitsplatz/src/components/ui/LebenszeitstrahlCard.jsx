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
  const [hovered, setHovered] = useState(null); // { track, idx, x, y }
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

  const TRACK_HEIGHT = 80;
  const DOT_BASE = 28;
  const DOT_HOVER = 40;

  return (
    <Card hover={false} className="lebenszeitstrahl-card">
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
            // Erste Spur: Tooltip unterhalb, sonst oberhalb des Dots
            const tooltipBelow = ti === 0;
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
                  const dotSize = isHovered ? DOT_HOVER : DOT_BASE;
                  return (
                    <div
                      key={idx}
                      className="absolute cursor-pointer"
                      style={{
                        left: `${left}%`,
                        top: trackCenter,
                        transform: 'translate(-50%, -50%)',
                        padding: 10,
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
                            width: dotSize + 16,
                            height: dotSize + 16,
                            top: '50%',
                            left: '50%',
                            transform: 'translate(-50%, -50%)',
                            backgroundColor: tr.color + '30',
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
                            ? `0 6px 18px ${tr.color}80`
                            : '0 2px 6px rgba(0,0,0,0.22)',
                        }}
                      />
                      {/* AI sparkle badge */}
                      {event.aiDetected && (
                        <div
                          className="absolute rounded-full bg-amber-400 flex items-center justify-center border-2 border-white shadow-sm pointer-events-none"
                          style={{
                            width: isHovered ? 18 : 14,
                            height: isHovered ? 18 : 14,
                            top: 4,
                            right: 4,
                          }}
                        >
                          <Sparkles size={isHovered ? 11 : 9} className="text-white" strokeWidth={3} />
                        </div>
                      )}
                      {/* FIDA dot */}
                      {event.fida && (
                        <div
                          className="absolute rounded-full bg-purple-500 border-2 border-white shadow-sm pointer-events-none"
                          style={{
                            width: isHovered ? 14 : 11,
                            height: isHovered ? 14 : 11,
                            top: 6,
                            right: 6,
                          }}
                        />
                      )}
                      {/* Warning */}
                      {event.isWarning && (
                        <div
                          className="absolute rounded-full bg-red-500 flex items-center justify-center border-2 border-white shadow-sm pointer-events-none"
                          style={{
                            width: isHovered ? 18 : 14,
                            height: isHovered ? 18 : 14,
                            top: 4,
                            right: 4,
                          }}
                        >
                          <AlertTriangle size={isHovered ? 11 : 9} className="text-white" strokeWidth={3} />
                        </div>
                      )}
                      {/* Floating tooltip */}
                      {isHovered && (
                        <div
                          className="absolute pointer-events-none animate-fade-in"
                          style={{
                            left: '50%',
                            ...(tooltipBelow
                              ? { top: '100%', transform: 'translate(-50%, 8px)' }
                              : { bottom: '100%', transform: 'translate(-50%, -8px)' }),
                            zIndex: 50,
                          }}
                        >
                          <div
                            className="rounded-xl shadow-xl border px-3.5 py-2.5 bg-white"
                            style={{
                              borderColor: tr.color + '60',
                              minWidth: 220,
                              maxWidth: 300,
                              boxShadow: `0 10px 30px -8px ${tr.color}55, 0 4px 10px rgba(0,0,0,0.08)`,
                            }}
                          >
                            <div className="flex items-center gap-1.5 mb-1 flex-wrap">
                              <span
                                className="text-[9px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded-full"
                                style={{ backgroundColor: tr.color + '22', color: tr.color }}
                              >
                                {tr.label}
                              </span>
                              <span className="text-[10px] font-mono font-semibold text-slate-500">
                                {formatTooltipDate(event.date)}
                              </span>
                              {event.aiDetected && (
                                <span className="inline-flex items-center gap-0.5 text-[9px] font-bold uppercase tracking-wider text-amber-700 bg-amber-100 px-1.5 py-0.5 rounded-full">
                                  <Sparkles size={9} /> KI
                                </span>
                              )}
                              {event.fida && (
                                <span className="inline-flex items-center gap-0.5 text-[9px] font-bold uppercase tracking-wider text-purple-700 bg-purple-100 px-1.5 py-0.5 rounded-full">
                                  <Database size={9} /> FIDA
                                </span>
                              )}
                              {event.isFuture && (
                                <span className="text-[9px] font-bold uppercase tracking-wider text-slate-600 bg-slate-200 px-1.5 py-0.5 rounded-full">
                                  Zukunft
                                </span>
                              )}
                              {event.isWarning && (
                                <span className="inline-flex items-center gap-0.5 text-[9px] font-bold uppercase tracking-wider text-red-700 bg-red-100 px-1.5 py-0.5 rounded-full">
                                  <AlertTriangle size={9} /> Warnung
                                </span>
                              )}
                            </div>
                            <div className="text-[13px] font-bold text-slate-900 leading-snug">
                              {event.label}
                            </div>
                            {event.source && (
                              <div className="text-[11px] text-slate-500 italic mt-0.5">
                                Quelle: {event.source}
                              </div>
                            )}
                            {event.signals && event.signals.length > 0 && (
                              <div className="mt-1.5 pt-1.5 border-t border-slate-100">
                                <div className="text-[9px] font-bold uppercase tracking-wider text-slate-400 mb-0.5">
                                  Erkannte Signale
                                </div>
                                <ul className="space-y-0.5">
                                  {event.signals.map((s, si) => (
                                    <li key={si} className="text-[11px] text-slate-700 flex items-start gap-1">
                                      <span style={{ color: tr.color }} className="mt-0.5">▸</span>
                                      <span>{s}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}
                            {/* Arrow */}
                            <div
                              className="absolute left-1/2 -translate-x-1/2 w-0 h-0"
                              style={{
                                ...(tooltipBelow
                                  ? { bottom: '100%', borderBottom: `7px solid ${tr.color}60` }
                                  : { top: '100%', borderTop: `7px solid ${tr.color}60` }),
                                borderLeft: '7px solid transparent',
                                borderRight: '7px solid transparent',
                              }}
                            />
                          </div>
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
