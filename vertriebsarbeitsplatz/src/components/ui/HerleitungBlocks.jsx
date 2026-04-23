// Strukturierte Visualisierungen fuer Lead-Herleitungen.
// Statt nur Label/Value-Paare zu zeigen, rendern wir hier pro Lead-Signal
// eine passende Darstellung:
//   - LiquiditaetsVerlauf  → Monatliche Ratenhistorie + Zukunfts-0€-Markierung
//   - Deckungsluecken      → aktuelle vs. empfohlene Absicherung als Balken
//   - SignaleStack         → mehrere unabhaengige Signale mit Staerkebalken
//   - ZinsSzenarioMatrix   → Szenarien bei unterschiedlichen Zinssaetzen
//
// Diese Bloecke werden in LeadsTab.jsx im aufgeklappten Lead zusaetzlich
// zur klassischen Label/Value-Herleitung gerendert (`lead.herleitungBlocks`).

import { TrendingDown, TrendingUp, ArrowRight, Sparkles, Circle } from 'lucide-react';
import { formatEur } from '../../utils/formatters';

function formatMonth(iso) {
  // "2026-05" → "Mai 2026"
  const [y, m] = iso.split('-').map(Number);
  const MONATE = ['Januar', 'Februar', 'März', 'April', 'Mai', 'Juni', 'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'];
  return `${MONATE[(m || 1) - 1]} ${y}`;
}

// ─── Liquiditätsverlauf ──────────────────────────────────────────────────
// Zeigt z. B. den Verlauf einer Kreditrate, markiert den letzten Zahlungs-
// monat und ab dann freiwerdende Liquiditaet. Ein horizontales Band:
//   [Ø Monat 1] [Ø Monat 2] … [✓ Letzte Rate] [★ Freigeworden] [Freigeworden]
export function LiquiditaetsVerlauf({ title, subtitle, zahlungen, waehrung = 'EUR' }) {
  const maxBetrag = Math.max(1, ...zahlungen.map(z => Math.abs(z.betrag || 0)));
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4">
      <div className="flex items-baseline justify-between mb-3 gap-3 flex-wrap">
        <div>
          <div className="text-sm font-semibold text-slate-700">{title}</div>
          {subtitle && <div className="text-xs text-slate-500 mt-0.5">{subtitle}</div>}
        </div>
        <div className="flex items-center gap-3 text-[10px] text-slate-500">
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm bg-slate-400" /> Ratenzahlung</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm bg-emerald-500" /> frei geworden</span>
        </div>
      </div>
      <div className="grid gap-1.5" style={{ gridTemplateColumns: `repeat(${zahlungen.length}, minmax(0, 1fr))` }}>
        {zahlungen.map((z, i) => {
          const istZukunft = z.zukunft;
          const istFrei = z.freigeworden;
          const istLetzte = z.letzte;
          const hoeheBetrag = Math.abs(z.betrag || 0);
          const barHeight = Math.max(6, Math.round((hoeheBetrag / maxBetrag) * 56));
          // Farbe: rot/slate bei Ausgabe, emerald bei freigewordener Liquiditaet
          const barColor = istFrei ? '#10b981' : istZukunft ? '#94a3b8' : '#475569';
          return (
            <div key={i} className="flex flex-col items-center gap-1.5" title={z.note || ''}>
              <div className="flex flex-col-reverse h-16 w-full justify-start">
                <div
                  className="rounded-t-sm w-full transition-all"
                  style={{
                    height: barHeight,
                    backgroundColor: barColor,
                    opacity: istZukunft && !istFrei ? 0.45 : 1,
                  }}
                />
              </div>
              <div className={`text-[10px] font-mono ${istFrei ? 'text-emerald-700 font-bold' : 'text-slate-500'}`}>
                {istFrei
                  ? `+${formatEur(z.freigeworden_betrag || hoeheBetrag)}`
                  : (z.betrag === 0 ? '—' : formatEur(z.betrag))}
              </div>
              <div className={`text-[9px] uppercase tracking-wide text-center ${istLetzte || istFrei ? 'font-semibold' : ''} ${istFrei ? 'text-emerald-700' : istLetzte ? 'text-slate-800' : 'text-slate-400'}`}>
                {z.label}
              </div>
              {istLetzte && (
                <div className="text-[9px] text-slate-500 font-semibold uppercase tracking-wider">letzte Rate</div>
              )}
              {istFrei && i === zahlungen.findIndex(x => x.freigeworden) && (
                <div className="text-[9px] text-emerald-700 font-semibold uppercase tracking-wider flex items-center gap-0.5">
                  <Sparkles size={9} /> ab hier frei
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Deckungslücke ────────────────────────────────────────────────────────
// Zwei horizontale Balken: aktuelle Absicherung vs. empfohlene Absicherung.
// Die Lücke zwischen beiden wird rot markiert.
export function DeckungsluckenBar({ title, subtitle, aktuell, empfohlen, einheit = '€/mtl.' }) {
  const max = Math.max(aktuell || 0, empfohlen || 0, 1);
  const aktuellPct = (Math.max(0, aktuell || 0) / max) * 100;
  const empfohlenPct = (Math.max(0, empfohlen || 0) / max) * 100;
  const luecke = Math.max(0, (empfohlen || 0) - (aktuell || 0));
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4">
      <div className="flex items-baseline justify-between mb-3 gap-3 flex-wrap">
        <div>
          <div className="text-sm font-semibold text-slate-700">{title}</div>
          {subtitle && <div className="text-xs text-slate-500 mt-0.5">{subtitle}</div>}
        </div>
        <div className="text-xs font-semibold text-red-700 bg-red-50 border border-red-200 rounded-full px-2 py-0.5">
          Lücke: {formatEur(luecke)} {einheit}
        </div>
      </div>
      <div className="space-y-2">
        <div>
          <div className="flex justify-between text-[11px] text-slate-500 mb-0.5">
            <span>Aktuell abgesichert</span>
            <span className="font-mono">{formatEur(aktuell || 0)} {einheit}</span>
          </div>
          <div className="h-3 rounded-full bg-slate-100 overflow-hidden">
            <div className="h-full bg-slate-500 rounded-full" style={{ width: `${aktuellPct}%` }} />
          </div>
        </div>
        <div>
          <div className="flex justify-between text-[11px] text-slate-500 mb-0.5">
            <span>Empfohlen</span>
            <span className="font-mono">{formatEur(empfohlen || 0)} {einheit}</span>
          </div>
          <div className="h-3 rounded-full bg-slate-100 overflow-hidden relative">
            <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${empfohlenPct}%` }} />
            {aktuellPct < empfohlenPct && (
              <div
                className="absolute top-0 h-full bg-red-200 border-l-2 border-red-400 rounded-r-full"
                style={{ left: `${aktuellPct}%`, width: `${empfohlenPct - aktuellPct}%` }}
                title={`Deckungslücke: ${formatEur(luecke)} ${einheit}`}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Signale-Stack ────────────────────────────────────────────────────────
// Zeigt mehrere unabhaengige Signale (z. B. Kontoumsatz + Bestand + Kommunikation)
// mit einer Staerkebewertung (0–100) als gestapelte Balken. Hilft, zu verstehen,
// warum ein Lead als „sehr_hoch" eingestuft wurde.
export function SignaleStack({ title, signale }) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4">
      <div className="text-sm font-semibold text-slate-700 mb-3">{title || 'Erkannte Signale'}</div>
      <div className="space-y-2.5">
        {signale.map((s, i) => (
          <div key={i}>
            <div className="flex items-baseline justify-between gap-2 mb-0.5">
              <div className="flex items-center gap-1.5 min-w-0">
                <Circle size={8} className="text-slate-400 shrink-0" fill="currentColor" />
                <span className="text-xs font-semibold text-slate-700 truncate">{s.label}</span>
                {s.quelle && (
                  <span className="text-[9px] uppercase tracking-wider text-slate-400 font-semibold shrink-0">{s.quelle}</span>
                )}
              </div>
              <span className="text-[10px] font-mono text-slate-500 shrink-0">{s.staerke}/100</span>
            </div>
            <div className="h-1.5 rounded-full bg-slate-100 overflow-hidden">
              <div
                className="h-full rounded-full transition-all"
                style={{
                  width: `${Math.max(0, Math.min(100, s.staerke || 0))}%`,
                  backgroundColor: s.staerke >= 80 ? '#0f766e' : s.staerke >= 50 ? '#0ea5e9' : '#94a3b8',
                }}
              />
            </div>
            {s.detail && (
              <div className="text-[11px] text-slate-500 mt-1 leading-snug">{s.detail}</div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Zins-Szenario-Matrix ─────────────────────────────────────────────────
// Kleine Matrix mit Zinssaetzen × Laufzeit → monatliche Rate. Nuetzlich bei
// Immobilienkrediten, um dem Kunden die Bandbreite zu zeigen.
export function ZinsSzenarioMatrix({ title, subtitle, volumen, szenarien }) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4">
      <div className="flex items-baseline justify-between mb-3 gap-3 flex-wrap">
        <div>
          <div className="text-sm font-semibold text-slate-700">{title}</div>
          {subtitle && <div className="text-xs text-slate-500 mt-0.5">{subtitle}</div>}
        </div>
        {volumen && (
          <div className="text-xs text-slate-500">
            Finanzierung: <span className="font-mono font-semibold text-slate-700">{formatEur(volumen)}</span>
          </div>
        )}
      </div>
      <table className="w-full text-sm">
        <thead>
          <tr className="text-[10px] uppercase tracking-wider text-slate-400">
            <th className="text-left py-1.5 pr-2 font-semibold">Zins</th>
            <th className="text-right py-1.5 px-2 font-semibold">Rate/mtl.</th>
            <th className="text-right py-1.5 pl-2 font-semibold">Gesamtzins</th>
          </tr>
        </thead>
        <tbody>
          {szenarien.map((s, i) => (
            <tr
              key={i}
              className={`border-t border-slate-100 ${s.empfohlen ? 'bg-emerald-50/50' : ''}`}
            >
              <td className="py-1.5 pr-2 text-slate-700 font-semibold">
                {s.empfohlen && <Sparkles size={10} className="inline text-emerald-600 mr-1" />}
                {s.zinssatz}% · {s.laufzeit} J.
              </td>
              <td className="py-1.5 px-2 text-right font-mono text-slate-700">{formatEur(s.rate)}</td>
              <td className={`py-1.5 pl-2 text-right font-mono ${s.empfohlen ? 'text-emerald-700 font-semibold' : 'text-slate-500'}`}>
                {formatEur(s.gesamtzins)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ─── Renderer-Switch ─────────────────────────────────────────────────────
export default function HerleitungBlock({ block }) {
  if (!block || !block.type) return null;
  switch (block.type) {
    case 'liquiditaetsverlauf':
      return <LiquiditaetsVerlauf {...block} />;
    case 'deckungsluecke':
      return <DeckungsluckenBar {...block} />;
    case 'signale':
      return <SignaleStack {...block} />;
    case 'zinsszenario':
      return <ZinsSzenarioMatrix {...block} />;
    default:
      return null;
  }
}

export { formatMonth };
