import { useState, useMemo } from 'react';
import {
  Recycle, RefreshCw, Sparkles, ShieldCheck, FileSpreadsheet, SlidersHorizontal,
  ListChecks, Hand, Cpu, Clock, CopyX, ArrowRight, ArrowDown, ArrowUp, TrendingDown,
  CheckCircle2, Users, Merge, Minimize2,
} from 'lucide-react';
import { useOptimierung } from '../../hooks/useOptimierung';
import {
  EMPFEHLUNG_TYPEN, TYP_MAP, EMPFEHLUNG_STATUS, EMPF_STATUS_MAP,
  KENNZAHL_DEFS, AUSFUEHRUNG_MAP, KONTROLL_TURNUS_LABEL,
} from '../../data/optimierungAgent';
import BeforeAfterMatrix from './BeforeAfterMatrix';
import RecommendationCard from './RecommendationCard';

const KENN_ICON = { ListChecks, Hand, Cpu, Clock, CopyX };

function KennzahlCard({ def, vorher, nachher }) {
  const Icon = KENN_ICON[def.icon] || ListChecks;
  const delta = nachher - vorher;
  const verbessert = def.besserWennKleiner ? delta < 0 : delta > 0;
  const neutral = delta === 0;
  const color = neutral ? '#64748B' : verbessert ? '#047857' : '#B45309';
  const DeltaIcon = neutral ? ArrowRight : def.besserWennKleiner ? ArrowDown : ArrowUp;
  return (
    <div className="card-base p-3.5">
      <div className="flex items-center gap-2 mb-2">
        <span className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0" style={{ background: 'color-mix(in srgb, var(--mode-primary, #0F4D2A) 10%, white)', color: 'var(--mode-primary, #0F4D2A)' }}>
          <Icon size={14} />
        </span>
        <span className="text-[11.5px] font-semibold text-slate-500 leading-tight">{def.label}</span>
      </div>
      <div className="flex items-baseline gap-1.5">
        <span className="text-[15px] font-semibold text-slate-400 line-through tabular-nums">{vorher}{def.einheit}</span>
        <ArrowRight size={13} className="text-slate-300 self-center" />
        <span className="text-2xl font-bold tabular-nums" style={{ color: neutral ? '#0F172A' : color }}>{nachher}{def.einheit}</span>
      </div>
      <div className="mt-1 inline-flex items-center gap-1 text-[11px] font-semibold" style={{ color }}>
        <DeltaIcon size={12} />
        {neutral ? 'unverändert' : `${delta > 0 ? '+' : ''}${delta}${def.einheit}`}
      </div>
    </div>
  );
}

// Kontrolldichte je Risiko — Vorher/Nachher (gruppierte Balken).
function KontrolldichteChart({ risiken, bestand, ziel }) {
  const rows = useMemo(() => risiken.map(r => ({
    r,
    vorher: bestand.filter(k => k.risikoId === r.id).length,
    nachher: ziel.filter(k => k.risikoId === r.id).length,
  })), [risiken, bestand, ziel]);
  const max = Math.max(...rows.map(x => Math.max(x.vorher, x.nachher)), 1);
  return (
    <div className="card-base p-5">
      <div className="flex items-center justify-between gap-2 mb-1 flex-wrap">
        <div className="text-sm font-semibold">Kontrolldichte je Risiko — Vorher / Nachher</div>
        <div className="flex items-center gap-3">
          <span className="inline-flex items-center gap-1.5 text-[11px] text-slate-500"><span className="w-3 h-3 rounded-sm bg-slate-300" /> Vorher</span>
          <span className="inline-flex items-center gap-1.5 text-[11px] text-slate-500"><span className="w-3 h-3 rounded-sm" style={{ background: 'var(--mode-primary, #0F4D2A)' }} /> Nachher</span>
        </div>
      </div>
      <div className="text-xs text-slate-500 mb-3">Anzahl Schlüsselkontrollen — bei durchgehend gleichbleibender Risikoabdeckung</div>
      <div className="space-y-2.5">
        {rows.map(({ r, vorher, nachher }) => (
          <div key={r.id} className="flex items-center gap-3">
            <span className="text-[11.5px] text-slate-600 w-[190px] shrink-0 truncate" title={r.titel}>
              <span className="font-mono font-semibold text-slate-400 mr-1">R{r.nummer}</span>{r.titel}
            </span>
            <div className="flex-1 space-y-1">
              <div className="h-3.5 rounded bg-slate-100 overflow-hidden">
                <div className="h-full rounded bg-slate-300" style={{ width: `${(vorher / max) * 100}%` }} />
              </div>
              <div className="h-3.5 rounded bg-slate-100 overflow-hidden">
                <div className="h-full rounded" style={{ width: `${(nachher / max) * 100}%`, background: 'var(--mode-primary, #0F4D2A)' }} />
              </div>
            </div>
            <span className="text-[12px] font-semibold w-16 text-right tabular-nums whitespace-nowrap">
              {vorher} <ArrowRight size={11} className="inline text-slate-300" /> {nachher}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// Vorher/Nachher-Gegenüberstellung des Kontrollinventars als Tabelle.
function InventarVergleich({ bestand, ziel }) {
  const zielIds = new Set(ziel.map(k => k.id));
  const automatisiertIds = new Set(ziel.filter(k => {
    const orig = bestand.find(b => b.id === k.id);
    return orig && orig.art !== k.art && k.art === 'automatisiert';
  }).map(k => k.id));
  return (
    <div className="card-base">
      <div className="px-5 py-3 border-b border-slate-200 flex items-center justify-between">
        <div className="text-sm font-semibold">Kontrollinventar — Bestand & Zielzustand</div>
        <div className="text-[11px] text-slate-500">{bestand.length} Kontrollen → {ziel.length} im Zielinventar</div>
      </div>
      <div className="overflow-x-auto scrollbar-thin">
        <table className="matrix-table">
          <thead>
            <tr>
              <th style={{ width: 64 }}>Code</th>
              <th>Kontrolle</th>
              <th style={{ width: 150 }}>Ausführung</th>
              <th style={{ width: 110 }}>Turnus</th>
              <th style={{ width: 130 }}>Zielzustand</th>
            </tr>
          </thead>
          <tbody>
            {bestand.map(k => {
              const behalten = zielIds.has(k.id);
              const automatisiert = automatisiertIds.has(k.id);
              const art = AUSFUEHRUNG_MAP[k.art];
              return (
                <tr key={k.id} style={{ opacity: behalten ? 1 : 0.55 }}>
                  <td className="font-mono text-slate-400">{k.code}</td>
                  <td className="text-[12px]">
                    <span className={`font-semibold ${!behalten ? 'line-through text-slate-400' : ''}`}>{k.name}</span>
                  </td>
                  <td className="text-[11.5px]">
                    <span className="inline-flex items-center rounded px-1.5 py-0.5 font-semibold" style={{ background: art?.bg, color: art?.color }}>{art?.label}</span>
                  </td>
                  <td className="text-[11.5px] text-slate-500">{KONTROLL_TURNUS_LABEL[k.turnus] || k.turnus}</td>
                  <td>
                    {!behalten ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold rounded-full px-2 py-0.5 bg-red-50 text-red-700 border border-red-100"><CopyX size={11} /> Entfällt</span>
                    ) : automatisiert ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold rounded-full px-2 py-0.5 bg-blue-50 text-blue-700 border border-blue-100"><Cpu size={11} /> Automatisiert</span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold rounded-full px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-100"><CheckCircle2 size={11} /> Beibehalten</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default function OptResultBoard() {
  const { optimierung, resetOptimierung } = useOptimierung();
  const [typFilter, setTypFilter] = useState('alle');

  const kontrollById = useMemo(() => Object.fromEntries((optimierung?.bestandKontrollen || []).map(k => [k.id, k])), [optimierung]);

  const typCounts = useMemo(() => {
    const m = {};
    optimierung?.empfehlungen.forEach(e => { m[e.typ] = (m[e.typ] || 0) + 1; });
    return m;
  }, [optimierung]);

  const statusCounts = useMemo(() => {
    const m = {};
    optimierung?.empfehlungen.forEach(e => { m[e.status] = (m[e.status] || 0) + 1; });
    return m;
  }, [optimierung]);

  if (!optimierung) return null;

  const { kennzahlen } = optimierung;
  const veraenderungen = optimierung.empfehlungen.filter(e => e.typ !== 'beibehalten').length;
  const gefiltert = optimierung.empfehlungen.filter(e => typFilter === 'alle' || e.typ === typFilter);
  const angenommen = statusCounts['angenommen'] || 0;
  const gesamt = optimierung.empfehlungen.length;

  return (
    <div className="space-y-5 animate-fade-in-up">
      {/* Kopf */}
      <div className="card-base p-5">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="min-w-0">
            <div className="flex items-center gap-2 text-[11px] text-slate-500 mb-1">
              <Recycle size={12} className="text-emerald-600" /> b-IKS Optimierung · Bestandsanalyse
              <span style={{ background: '#EDE9FE', color: '#5B21B6', fontSize: 9, fontWeight: 700, padding: '1px 6px', borderRadius: 4, letterSpacing: 0.4, textTransform: 'uppercase' }}>Showcase</span>
            </div>
            <h1 className="text-xl font-bold tracking-tight">{optimierung.prozessName}</h1>
            <div className="flex items-center gap-2 mt-2 flex-wrap">
              <span className="chip"><FileSpreadsheet size={12} /> {optimierung.quelldokument?.name}</span>
              <span className="chip">{optimierung.kategorie}</span>
              {optimierung.prozessDokument && <span className="chip"><SlidersHorizontal size={11} /> Kontext: {optimierung.prozessDokument.name}</span>}
              {optimierung.regulatorik?.map(r => <span key={r} className="chip"><ShieldCheck size={11} /> {r}</span>)}
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button onClick={resetOptimierung} className="px-3 py-2 rounded-lg text-white text-[13px] font-semibold inline-flex items-center gap-2" style={{ background: 'var(--mode-primary, #0F4D2A)' }}>
              <RefreshCw size={15} /> Neue Optimierung
            </button>
          </div>
        </div>

        <div className="mt-4 rounded-xl p-3.5 flex gap-3" style={{ background: 'color-mix(in srgb, var(--mode-primary, #0F4D2A) 5%, white)', border: '1px solid color-mix(in srgb, var(--mode-primary, #0F4D2A) 15%, transparent)' }}>
          <Sparkles size={16} className="shrink-0 mt-0.5" style={{ color: 'var(--mode-primary, #0F4D2A)' }} />
          <p className="text-[13px] text-slate-700 leading-relaxed">{optimierung.ergebnisIntro}</p>
        </div>
      </div>

      {/* Vorher/Nachher-Kennzahlen */}
      <div>
        <div className="flex items-center gap-2 mb-2.5">
          <TrendingDown size={16} className="text-emerald-600" />
          <h2 className="text-sm font-bold">Wirkung der Optimierung — Vorher / Nachher</h2>
          <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <ShieldCheck size={12} /> Risikoabdeckung {kennzahlen.abdeckungVorher}% → {kennzahlen.abdeckungNachher}%
          </span>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-3">
          {KENNZAHL_DEFS.map(def => (
            <KennzahlCard key={def.key} def={def} vorher={kennzahlen.vorher[def.key]} nachher={kennzahlen.nachher[def.key]} />
          ))}
        </div>
      </div>

      {/* Restrisiko-Matrix Vorher/Nachher */}
      <BeforeAfterMatrix risiken={optimierung.risiken} />

      {/* Kontrolldichte + Inventar */}
      <div className="grid lg:grid-cols-2 gap-3">
        <KontrolldichteChart risiken={optimierung.risiken} bestand={optimierung.bestandKontrollen} ziel={optimierung.zielKontrollen} />
        <InventarVergleich bestand={optimierung.bestandKontrollen} ziel={optimierung.zielKontrollen} />
      </div>

      {/* Empfehlungen */}
      <div className="card-base p-4">
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div>
            <h2 className="text-sm font-bold flex items-center gap-2"><Recycle size={16} className="text-emerald-600" /> Optimierungsempfehlungen</h2>
            <p className="text-[12px] text-slate-500 mt-0.5">{veraenderungen} Änderungsempfehlungen · Annehmen, ablehnen, zuweisen und kommentieren — wie im b-IKS-Kollaborationsmodus.</p>
          </div>
          <div className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-1.5">
            <Users size={14} className="text-slate-400" />
            <span className="text-[12px] font-semibold text-slate-600">Angenommen: {angenommen}/{gesamt}</span>
            <div className="w-24 h-2 rounded-full bg-slate-100 overflow-hidden">
              <div className="h-full rounded-full" style={{ width: `${(angenommen / gesamt) * 100}%`, background: '#059669' }} />
            </div>
          </div>
        </div>

        {/* Typ-Filter */}
        <div className="flex items-center gap-2 flex-wrap mt-3">
          <button onClick={() => setTypFilter('alle')} className={`chip ${typFilter === 'alle' ? 'selected' : ''}`} style={{ cursor: 'pointer' }}>
            Alle <span className="font-semibold ml-0.5">{gesamt}</span>
          </button>
          {EMPFEHLUNG_TYPEN.map(t => {
            const n = typCounts[t.id] || 0;
            if (n === 0) return null;
            const active = typFilter === t.id;
            return (
              <button key={t.id} onClick={() => setTypFilter(active ? 'alle' : t.id)}
                className="inline-flex items-center gap-1.5 rounded-full font-semibold transition-all"
                style={{ background: active ? t.color : t.bg, color: active ? 'white' : t.color, border: `1px solid color-mix(in srgb, ${t.color} 30%, transparent)`, padding: '0.2rem 0.65rem', fontSize: 11.5, cursor: 'pointer' }}>
                {t.label} <span className="font-bold">{n}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid xl:grid-cols-2 gap-4">
        {gefiltert.map(e => (
          <RecommendationCard key={e.id} empfehlung={e} kontrollById={kontrollById} />
        ))}
      </div>
    </div>
  );
}
