// Aufgeklappte Herleitung eines Impulses (Kundenakte, Reiter Impulse):
// links die KI-Zusammenfassung als gegliederte Story (Einstieg, nummerierte
// Signale, Fazit, Empfehlung) und die strukturierten Bloecke, rechts eine
// Spalte „Auf einen Blick" mit den abgeleiteten Kennzahlen und den Aktionen.
// Datenquellen (Eintraege „Datenquelle n" der Herleitung) laufen als Chips
// unter der Zusammenfassung mit, statt als grosse Kacheln.
//
// Gestaltung (Cockpit 2026): weiße Karten mit Hairlines, Modusfarbe fuer
// Nummern und Primaeraktion, Quellenfarben nur fuer die kleinen Chips.

import { Sparkles, ArrowRight, Calendar, ExternalLink, Receipt, Landmark, Mail, Database } from 'lucide-react';
import { tx } from '../../utils/langHelper';

// ─── Quellen: Erkennung aus Freitext, Farbe und Icon ─────────────────────
const QUELLEN = [
  { key: 'finanztransaktion', test: /psd2|konto|umsatz|umsätze|transaktion|transaction|fida|open finance/i, farbe: 'var(--quelle-finanztransaktion)', icon: Receipt },
  { key: 'bestand',           test: /bestand|holding|vertrag|contract|depot|portfolio/i,                    farbe: 'var(--quelle-bestand)',           icon: Landmark },
  { key: 'kommunikation',     test: /marketing|newsletter|kommunikation|mail|chat|website|klick|click/i,   farbe: 'var(--quelle-kommunikation)',     icon: Mail },
];

export function erkenneQuelle(text) {
  const q = QUELLEN.find((x) => x.test.test(text || ''));
  return q || { key: 'sonstige', farbe: 'var(--text-tertiary)', icon: Database };
}

// ─── KI-Text gliedern ────────────────────────────────────────────────────
// Erwartet den Aufbau „Einleitung … 1. … 2. … 3. … Fazit … Empfehlung: …";
// alles Optionale faellt weg, ein Text ohne Struktur bleibt ein Absatz.
export function gliedereKiText(text) {
  const roh = (text || '').trim();
  const absaetze = roh.split(/\n\s*\n/).map((a) => a.trim()).filter(Boolean);
  const punkte = [];
  const rest = [];
  absaetze.forEach((a) => {
    if (/^\d+[.)]\s/.test(a)) punkte.push(a.replace(/^\d+[.)]\s*/, ''));
    else rest.push(a);
  });
  const intro = (rest[0] || '').replace(/^(KI-Analyse|AI analysis|KI-Bewertung|AI assessment)\s*:\s*/i, '');
  let fazit = rest.slice(1).join(' ');
  let empfehlung = '';
  const m = fazit.match(/^(.*?)\s*(?:Empfehlung|Recommendation)\s*:\s*(.+)$/s);
  if (m) { fazit = m[1].trim(); empfehlung = m[2].trim(); }
  else if (/^(Empfehlung|Recommendation)\s*:/i.test(intro)) { empfehlung = intro.replace(/^(Empfehlung|Recommendation)\s*:\s*/i, ''); }
  return { intro, punkte, fazit, empfehlung, strukturiert: punkte.length > 0 || Boolean(empfehlung) };
}

export function KiZusammenfassung({ text, titel }) {
  const g = gliedereKiText(text);
  return (
    <section className="surface-card p-4 lg:p-5">
      <div className="flex items-center gap-2 mb-3">
        <span className="w-7 h-7 rounded-lg bg-(--mode-primary) text-white flex items-center justify-center shrink-0">
          <Sparkles size={14} strokeWidth={2} />
        </span>
        <h5 className="text-sm font-semibold text-(--text-primary)">{titel}</h5>
      </div>
      {g.strukturiert ? (
        <div className="space-y-3">
          {g.intro && <p className="text-[15px] leading-relaxed font-medium text-(--text-primary) max-w-[80ch]">{g.intro}</p>}
          {g.punkte.length > 0 && (
            <ol className="grid gap-2 md:grid-cols-2 xl:grid-cols-3">
              {g.punkte.map((p, i) => {
                const q = erkenneQuelle(p);
                const Icon = q.icon;
                return (
                  <li key={i} className="flex gap-3 rounded-lg border border-(--border-light) bg-(--bg-primary) px-3 py-2.5">
                    <span className="w-6 h-6 rounded-full bg-(--mode-primary) text-white text-[11px] font-semibold flex items-center justify-center shrink-0 mt-0.5 font-mono">{i + 1}</span>
                    <span className="min-w-0">
                      <span className="text-sm leading-snug text-(--text-primary) block">{p}</span>
                      <span className="inline-flex items-center gap-1 mt-1.5 text-[10px] font-semibold uppercase tracking-wider" style={{ color: q.farbe }}>
                        <Icon size={11} strokeWidth={2} />
                        {q.key === 'finanztransaktion' ? tx('Kontoumsätze', 'Account data') : q.key === 'bestand' ? tx('Bestand', 'Holdings') : q.key === 'kommunikation' ? tx('Kommunikation', 'Communication') : tx('Quelle', 'Source')}
                      </span>
                    </span>
                  </li>
                );
              })}
            </ol>
          )}
          {g.fazit && <p className="text-sm leading-relaxed text-(--text-secondary) max-w-[90ch]">{g.fazit}</p>}
          {g.empfehlung && (
            <div className="flex items-start gap-3 rounded-lg px-3.5 py-3 bg-(--mode-pastel) border border-(--mode-primary-soft)">
              <span className="w-6 h-6 rounded-full bg-(--mode-primary) text-white flex items-center justify-center shrink-0 mt-px">
                <ArrowRight size={13} strokeWidth={2.4} />
              </span>
              <div className="min-w-0">
                <div className="text-[10px] font-semibold uppercase tracking-wider text-(--mode-primary) mb-0.5">{tx('Empfehlung', 'Recommendation')}</div>
                <p className="text-sm font-medium leading-snug text-(--text-primary)">{g.empfehlung}</p>
              </div>
            </div>
          )}
        </div>
      ) : (
        <p className="text-sm leading-relaxed text-(--text-primary) whitespace-pre-line max-w-[90ch]">{text}</p>
      )}
    </section>
  );
}

// ─── Herleitung aufteilen: Datenquellen vs. abgeleitete Kennzahlen ──────
const IST_DATENQUELLE = /^(Datenquelle|Data source|Quelle|Source)\b/i;

export function teileHerleitung(herleitung = []) {
  const quellen = herleitung.filter((h) => IST_DATENQUELLE.test(h.label || ''));
  const fakten = herleitung.filter((h) => !IST_DATENQUELLE.test(h.label || ''));
  return { quellen, fakten };
}

export function DatenquellenLeiste({ quellen, titel }) {
  if (!quellen.length) return null;
  return (
    <section>
      <h5 className="text-[11px] font-semibold text-(--text-tertiary) uppercase tracking-wider mb-2">{titel}</h5>
      <ul className="flex flex-wrap gap-2">
        {quellen.map((h, i) => {
          const q = erkenneQuelle(h.value);
          const Icon = q.icon;
          return (
            <li
              key={i}
              className="flex items-center gap-2 rounded-full border bg-(--bg-card) pl-1.5 pr-3 py-1 text-xs text-(--text-primary)"
              style={{ borderColor: `color-mix(in oklab, ${q.farbe} 35%, transparent)` }}
              title={h.label}
            >
              <span className="w-5 h-5 rounded-full flex items-center justify-center shrink-0" style={{ background: `color-mix(in oklab, ${q.farbe} 14%, transparent)`, color: q.farbe }}>
                <Icon size={11} strokeWidth={2.2} />
              </span>
              <span className="leading-snug">{h.value}</span>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

// Zahlen im Wert (Betraege, Prozent) tabellarisch setzen, Rest normal.
function istZahlenwert(v) {
  return typeof v === 'string' && /^[\d.,\s€%+/()A-Za-zäöüÄÖÜß-]{1,40}$/.test(v) && /\d/.test(v) && v.length <= 40;
}

export function FaktenPanel({ fakten, titel, kinder }) {
  return (
    <section className="surface-card p-4 lg:p-5">
      <h5 className="text-[11px] font-semibold text-(--text-tertiary) uppercase tracking-wider mb-3">{titel}</h5>
      <dl className="divide-y divide-(--border-light)">
        {fakten.map((h, i) => {
          const empfehlung = /^(Empfehlung|Recommendation|Nächster Schritt|Next step)/i.test(h.label || '');
          return (
            <div key={i} className="py-2.5 first:pt-0 last:pb-0">
              <dt className="text-[11px] text-(--text-tertiary) mb-0.5">{h.label}</dt>
              <dd className={`leading-snug ${empfehlung ? 'text-sm font-medium text-(--mode-primary)' : istZahlenwert(h.value) ? 'font-mono text-[15px] font-semibold text-(--text-primary)' : 'text-sm font-medium text-(--text-primary)'}`}>
                {h.value}
              </dd>
            </div>
          );
        })}
      </dl>
      {kinder}
    </section>
  );
}

export function AktionenLeiste({ onAnschreiben, anschreibenLabel, aktionLabel, produkt, className = '' }) {
  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      <button
        onClick={(e) => { e.stopPropagation(); onAnschreiben?.(); }}
        className="flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-lg text-sm font-semibold text-white transition-colors bg-(--mode-primary) hover:bg-(--mode-primary-light)"
      >
        <Sparkles size={15} strokeWidth={2} />
        {anschreibenLabel}
      </button>
      <button
        className="flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-lg text-sm font-medium bg-(--bg-card) border border-(--border-medium) text-(--text-primary) hover:border-(--mode-primary) hover:text-(--mode-primary) transition-colors"
      >
        <Calendar size={15} strokeWidth={2} />
        {aktionLabel}
      </button>
      {produkt && (
        <span className="flex items-center justify-center gap-1.5 text-xs text-(--text-tertiary) pt-1">
          <ExternalLink size={12} />
          {produkt}
        </span>
      )}
    </div>
  );
}
