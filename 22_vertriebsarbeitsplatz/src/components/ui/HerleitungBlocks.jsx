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
//
// Gestaltung (Cockpit 2026): weiße Karten (`surface-card`) mit Hairlines,
// einfarbige Lucide-Icons, Balken in der Modusfarbe (`--mode-chart`),
// Statusfarben nur fuer Erfolg/Luecke, Quellen-Badges zart getoent.

import { TrendingUp, Sparkles, MessageSquare, Bot, User, Receipt } from 'lucide-react';
import { formatEur } from '../../utils/formatters';
import { tx, getLang } from '../../utils/langHelper';
import LogoImg from './LogoImg';
import { erkenneQuelle } from './ImpulsHerleitung';

function formatMonth(iso) {
  // "2026-05" → "Mai 2026" / "May 2026"
  const [y, m] = iso.split('-').map(Number);
  const MONATE_DE = ['Januar', 'Februar', 'März', 'April', 'Mai', 'Juni', 'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'];
  const MONATE_EN = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const MONATE = getLang() === 'en' ? MONATE_EN : MONATE_DE;
  return `${MONATE[(m || 1) - 1]} ${y}`;
}

// Gemeinsamer Kartenkopf: Titel links, optionale Nebenangabe, rechts Zusatz.
function BlockHeader({ icon: Icon, title, subtitle, right, className = 'mb-3' }) {
  return (
    <div className={`flex items-baseline justify-between gap-3 flex-wrap ${className}`}>
      <div className="min-w-0">
        <div className="flex items-center gap-2">
          {Icon && <Icon size={14} className="text-(--text-tertiary) shrink-0" />}
          <div className="text-sm font-semibold text-(--text-primary)">{title}</div>
        </div>
        {subtitle && <div className="text-xs text-(--text-tertiary) mt-0.5">{subtitle}</div>}
      </div>
      {right}
    </div>
  );
}

// ─── Liquiditätsverlauf ──────────────────────────────────────────────────
// Zeigt z. B. den Verlauf einer Kreditrate, markiert den letzten Zahlungs-
// monat und ab dann freiwerdende Liquiditaet. Ein horizontales Band:
//   [Ø Monat 1] [Ø Monat 2] … [Letzte Rate] [Freigeworden] [Freigeworden]
export function LiquiditaetsVerlauf({ title, subtitle, zahlungen }) {
  // Divergierende Saeulen: Raten haengen unter der Grundlinie (Modusfarbe,
  // Zukunft aufgehellt), freigewordene Betraege stehen darueber (Erfolg).
  const wertVon = (z) => (z.freigeworden ? (z.freigeworden_betrag || Math.abs(z.betrag || 0)) : Math.abs(z.betrag || 0));
  const max = Math.max(1, ...zahlungen.map(wertVon));
  const H = 56;
  const ersterFrei = zahlungen.findIndex((z) => z.freigeworden);
  return (
    <div className="surface-card p-4 h-full">
      <BlockHeader
        title={title}
        subtitle={subtitle}
        right={(
          <div className="flex items-center gap-3 text-[10px] text-(--text-tertiary)">
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm bg-(--mode-chart)" /> {tx('Ratenzahlung', 'Installment')}</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm bg-(--color-success)" /> {tx('frei verfügbar', 'freed up')}</span>
          </div>
        )}
      />
      <div className="relative grid gap-2" style={{ gridTemplateColumns: `repeat(${zahlungen.length}, minmax(0, 1fr))` }}>
        {/* durchgehende Grundlinie zwischen Raten (unten) und freien Beträgen (oben) */}
        <div className="absolute left-0 right-0 h-px pointer-events-none" style={{ top: H, background: 'var(--border-strong)' }} />
        {zahlungen.map((z, i) => {
          const frei = Boolean(z.freigeworden);
          const wert = wertVon(z);
          const h = Math.max(4, Math.round((wert / max) * H));
          return (
            <div key={i} className="flex flex-col items-center min-w-0" title={z.note || ''}>
              <div className="w-full flex items-end justify-center" style={{ height: H }}>
                {frei && <div className="w-full max-w-[44px] rounded-t-md bg-(--color-success)" style={{ height: h }} />}
              </div>
              <div className="w-full flex items-start justify-center" style={{ height: H }}>
                {!frei && wert > 0 && (
                  <div
                    className="w-full max-w-[44px] rounded-b-md"
                    style={{ height: h, background: 'var(--mode-chart)', opacity: z.zukunft ? 0.45 : 1 }}
                  />
                )}
              </div>
              <div className={`mt-1.5 text-[11px] font-mono font-semibold ${frei ? 'text-(--color-success)' : 'text-(--text-secondary)'}`}>
                {frei ? `+${formatEur(wert)}` : wert > 0 ? `−${formatEur(wert)}` : '–'}
              </div>
              <div className={`text-[10px] uppercase tracking-wide text-center ${z.letzte || frei ? 'font-semibold' : ''} ${frei ? 'text-(--color-success)' : z.letzte ? 'text-(--text-primary)' : 'text-(--text-tertiary)'}`}>
                {z.label}
              </div>
              {z.letzte && (
                <div className="text-[9px] text-(--text-tertiary) font-semibold uppercase tracking-wider text-center">{tx('letzte Rate', 'last installment')}</div>
              )}
              {frei && i === ersterFrei && (
                <div className="text-[9px] text-(--color-success) font-semibold uppercase tracking-wider flex items-center gap-0.5">
                  <Sparkles size={9} /> {tx('ab hier frei', 'freed up here')}
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
// Die Lücke zwischen beiden wird in der Gefahrenfarbe markiert.
export function DeckungsluckenBar({ title, subtitle, aktuell, empfohlen, einheit = '€/mtl.' }) {
  const max = Math.max(aktuell || 0, empfohlen || 0, 1);
  const aktuellPct = (Math.max(0, aktuell || 0) / max) * 100;
  const empfohlenPct = (Math.max(0, empfohlen || 0) / max) * 100;
  const luecke = Math.max(0, (empfohlen || 0) - (aktuell || 0));
  return (
    <div className="surface-card p-4">
      <BlockHeader
        title={title}
        subtitle={subtitle}
        right={(
          <div className="text-xs font-semibold text-(--color-danger) bg-(--tint-danger) rounded-full px-2 py-0.5">
            {tx('Lücke', 'Gap')}: {formatEur(luecke)} {einheit}
          </div>
        )}
      />
      <div className="space-y-2">
        <div>
          <div className="flex justify-between text-[11px] text-(--text-secondary) mb-0.5">
            <span>{tx('Aktuell abgesichert', 'Currently covered')}</span>
            <span className="font-mono">{formatEur(aktuell || 0)} {einheit}</span>
          </div>
          <div className="h-3 rounded-full progress-track overflow-hidden">
            <div className="h-full rounded-full bg-(--mode-chart)" style={{ width: `${aktuellPct}%` }} />
          </div>
        </div>
        <div>
          <div className="flex justify-between text-[11px] text-(--text-secondary) mb-0.5">
            <span>{tx('Empfohlen', 'Recommended')}</span>
            <span className="font-mono">{formatEur(empfohlen || 0)} {einheit}</span>
          </div>
          <div className="h-3 rounded-full progress-track overflow-hidden relative">
            <div className="h-full rounded-full bg-(--mode-chart) opacity-45" style={{ width: `${empfohlenPct}%` }} />
            {aktuellPct < empfohlenPct && (
              <div
                className="absolute top-0 h-full rounded-r-full"
                style={{
                  left: `${aktuellPct}%`,
                  width: `${empfohlenPct - aktuellPct}%`,
                  backgroundColor: 'color-mix(in oklab, var(--color-danger) 38%, transparent)',
                  borderLeft: '2px solid var(--color-danger)',
                }}
                title={`${tx('Deckungslücke', 'Coverage gap')}: ${formatEur(luecke)} ${einheit}`}
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
    <div className="surface-card p-4 h-full">
      <BlockHeader title={title || tx('Erkannte Signale', 'Detected signals')} />
      <ul className="space-y-3.5">
        {signale.map((s, i) => {
          const q = erkenneQuelle(`${s.quelle || ''} ${s.label || ''} ${s.detail || ''}`);
          const Icon = q.icon;
          const staerke = Math.max(0, Math.min(100, s.staerke || 0));
          return (
            <li key={i} className="flex gap-3">
              <span
                className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                style={{ background: `color-mix(in oklab, ${q.farbe} 12%, transparent)`, color: q.farbe }}
              >
                <Icon size={15} strokeWidth={2} />
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-baseline justify-between gap-2">
                  <span className="text-sm font-semibold text-(--text-primary) truncate">{s.label}</span>
                  <span className="font-mono text-sm font-semibold text-(--text-primary) shrink-0">
                    {staerke}<span className="text-[10px] font-normal text-(--text-tertiary)">/100</span>
                  </span>
                </div>
                <div className="mt-1 h-1.5 rounded-full progress-track overflow-hidden">
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${staerke}%`,
                      background: staerke >= 80 ? 'var(--mode-primary)' : staerke >= 50 ? 'var(--mode-chart)' : 'var(--border-strong)',
                    }}
                  />
                </div>
                {(s.quelle || s.detail) && (
                  <div className="mt-1 text-[11px] leading-snug text-(--text-secondary)">
                    {s.quelle && (
                      <span className="font-semibold uppercase tracking-wider text-[9.5px] mr-1.5" style={{ color: q.farbe }}>{s.quelle}</span>
                    )}
                    {s.detail}
                  </div>
                )}
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

// ─── Zins-Szenario-Matrix ─────────────────────────────────────────────────
// Kleine Matrix mit Zinssaetzen × Laufzeit → monatliche Rate. Nuetzlich bei
// Immobilienkrediten, um dem Kunden die Bandbreite zu zeigen.
export function ZinsSzenarioMatrix({ title, subtitle, volumen, szenarien }) {
  const zins = (v) => (getLang() === 'en' ? `${v}%` : `${Number(v).toLocaleString('de-DE')} %`);
  return (
    <div className="surface-card p-4 h-full">
      <BlockHeader
        title={title}
        subtitle={subtitle}
        right={volumen ? (
          <div className="text-[11px] text-(--text-secondary) rounded-full border border-(--border-light) bg-(--bg-primary) px-2.5 py-1">
            {tx('Finanzierung', 'Financing')} <span className="font-mono font-semibold text-(--text-primary)">{formatEur(volumen)}</span>
          </div>
        ) : null}
      />
      <table className="w-full text-sm">
        <thead>
          <tr className="text-[10px] uppercase tracking-wider text-(--text-tertiary)">
            <th className="text-left py-1.5 pr-2 font-semibold">{tx('Zins · Laufzeit', 'Rate · Term')}</th>
            <th className="text-right py-1.5 px-2 font-semibold whitespace-nowrap">{tx('Rate/Monat', 'Payment/mo.')}</th>
            <th className="text-right py-1.5 pl-2 font-semibold">{tx('Gesamtzins', 'Total interest')}</th>
          </tr>
        </thead>
        <tbody>
          {szenarien.map((s, i) => (
            <tr key={i} className={`border-t border-(--border-light) ${s.empfohlen ? 'bg-(--mode-pastel)' : ''}`}>
              <td className="py-2 pr-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-mono font-semibold text-(--text-primary)">{zins(s.zinssatz)}</span>
                  <span className="text-(--text-tertiary)">· {s.laufzeit} {tx('J.', 'yrs')}</span>
                  {s.empfohlen && (
                    <span className="rh-badge text-[9px] uppercase tracking-wider font-semibold px-1.5 py-px rounded-full bg-(--mode-primary) text-white">{tx('empfohlen', 'recommended')}</span>
                  )}
                </div>
              </td>
              <td className="py-2 px-2 text-right font-mono font-semibold text-(--text-primary) whitespace-nowrap">{formatEur(s.rate)}</td>
              <td className={`py-2 pl-2 text-right font-mono whitespace-nowrap ${s.empfohlen ? 'font-semibold text-(--text-primary)' : 'text-(--text-secondary)'}`}>{formatEur(s.gesamtzins)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ─── Chatverlauf ─────────────────────────────────────────────────────────
// Rendert einen Chatbot-Dialog (Kunde ↔ Bot) als Herleitung zum Lead.
export function Chatverlauf({ title, subtitle, datum, nachrichten = [] }) {
  return (
    <div className="surface-card p-4">
      <BlockHeader
        icon={MessageSquare}
        title={title || tx('Chatverlauf', 'Chat history')}
        subtitle={subtitle}
        right={datum ? <div className="text-[11px] font-mono text-(--text-tertiary)">{datum}</div> : null}
      />
      <div className="space-y-2">
        {nachrichten.map((n, i) => {
          const isKunde = n.rolle === 'kunde';
          return (
            <div key={i} className={`flex gap-2 ${isKunde ? 'justify-end' : 'justify-start'}`}>
              {!isKunde && (
                <div className="w-6 h-6 rounded-full bg-(--mode-pastel) text-(--mode-primary) flex items-center justify-center shrink-0 mt-0.5">
                  <Bot size={12} />
                </div>
              )}
              <div className={`max-w-[75%] rounded-lg px-3 py-1.5 border border-(--border-light) ${isKunde ? 'bg-(--mode-pastel)' : 'bg-(--bg-inset)'}`}>
                <div className="text-xs text-(--text-primary) leading-snug whitespace-pre-wrap">{n.text}</div>
                {n.zeit && (
                  <div className={`text-[10px] font-mono mt-0.5 text-(--text-tertiary) ${isKunde ? 'text-right' : ''}`}>
                    {n.zeit}
                  </div>
                )}
              </div>
              {isKunde && (
                <div className="w-6 h-6 rounded-full bg-(--bg-inset) border border-(--border-light) text-(--text-secondary) flex items-center justify-center shrink-0 mt-0.5">
                  <User size={12} />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Transaktionen (Tabelle erkannter Kontobewegungen) ─────────────────
export function Transaktionen({ title, subtitle, transaktionen = [] }) {
  return (
    <div className="surface-card p-4">
      <BlockHeader
        icon={Receipt}
        title={title || tx('Erkannte Kontoumsätze', 'Detected account transactions')}
        subtitle={subtitle}
        className="mb-1"
      />
      <table className="w-full text-sm mt-2">
        <thead>
          <tr className="text-[10px] uppercase tracking-wider text-(--text-tertiary)">
            <th className="text-left py-1.5 pr-2 font-semibold">{tx('Empfänger / Händler', 'Payee / Merchant')}</th>
            <th className="text-left py-1.5 px-2 font-semibold">{tx('Häufigkeit', 'Frequency')}</th>
            <th className="text-right py-1.5 pl-2 font-semibold">{tx('Betrag', 'Amount')}</th>
          </tr>
        </thead>
        <tbody>
          {transaktionen.map((tr, i) => (
            <tr key={i} className="border-t border-(--border-light)">
              <td className="py-1.5 pr-2 text-(--text-primary) font-medium">
                <div className="flex items-center gap-2">
                  <LogoImg name={tr.empfaenger || tr.haendler || ''} size={16} />
                  <span>{tr.empfaenger || tr.haendler}</span>
                </div>
              </td>
              <td className="py-1.5 px-2 text-(--text-secondary)">{tr.haeufigkeit || '-'}</td>
              <td className="py-1.5 pl-2 text-right font-mono text-(--text-primary)">
                {typeof tr.betrag === 'number' ? `${formatEur(Math.abs(tr.betrag))}` : tr.betrag}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ─── Depotpositionen (Positionsliste mit Logo je Aktie/ETF) ───────────
export function Depotpositionen({ title, subtitle, positionen = [] }) {
  const gesamt = positionen.reduce((s, p) => s + (p.volumen || 0), 0);
  return (
    <div className="surface-card p-4">
      <BlockHeader
        icon={TrendingUp}
        title={title || tx('Depot-Positionen', 'Securities Positions')}
        subtitle={subtitle}
        className="mb-1"
      />
      <table className="w-full text-sm mt-2">
        <thead>
          <tr className="text-[10px] uppercase tracking-wider text-(--text-tertiary)">
            <th className="text-left py-1.5 pr-2 font-semibold">{tx('Position', 'Position')}</th>
            <th className="text-left py-1.5 px-2 font-semibold">{tx('Seit', 'Since')}</th>
            <th className="text-right py-1.5 px-2 font-semibold">{tx('Wert', 'Value')}</th>
            <th className="text-right py-1.5 px-2 font-semibold">{tx('Gewinn', 'Gain')}</th>
            <th className="text-right py-1.5 pl-2 font-semibold">Performance</th>
          </tr>
        </thead>
        <tbody>
          {positionen.map((p, i) => {
            const gewinnPositive = (p.gewinn ?? 0) > 0;
            return (
              <tr key={i} className="border-t border-(--border-light)">
                <td className="py-1.5 pr-2 text-(--text-primary) font-medium">
                  <div className="flex items-center gap-2">
                    <LogoImg name={p.name} size={18} />
                    <span>{p.name}</span>
                  </div>
                </td>
                <td className="py-1.5 px-2 text-(--text-secondary)">{p.seit || '-'}</td>
                <td className="py-1.5 px-2 text-right font-mono text-(--text-primary)">{formatEur(p.volumen || 0)}</td>
                <td className={`py-1.5 px-2 text-right font-mono ${gewinnPositive ? 'text-(--color-success)' : (p.gewinn < 0 ? 'text-(--color-danger)' : 'text-(--text-secondary)')}`}>
                  {p.gewinn != null ? `${p.gewinn > 0 ? '+' : ''}${formatEur(p.gewinn)}` : '–'}
                </td>
                <td className={`py-1.5 pl-2 text-right font-mono ${gewinnPositive ? 'text-(--color-success) font-semibold' : 'text-(--text-secondary)'}`}>
                  {p.performanceYtd || '–'}
                </td>
              </tr>
            );
          })}
          {gesamt > 0 && (
            <tr className="border-t border-(--border-medium) bg-(--bg-inset) font-semibold">
              <td className="py-1.5 pr-2 text-(--text-primary)">{tx('Gesamt', 'Total')}</td>
              <td className="py-1.5 px-2"></td>
              <td className="py-1.5 px-2 text-right font-mono text-(--text-primary)">{formatEur(gesamt)}</td>
              <td className="py-1.5 px-2"></td>
              <td className="py-1.5 pl-2"></td>
            </tr>
          )}
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
    case 'chatverlauf':
      return <Chatverlauf {...block} />;
    case 'transaktionen':
      return <Transaktionen {...block} />;
    case 'depotpositionen':
      return <Depotpositionen {...block} />;
    default:
      return null;
  }
}

export { formatMonth };
