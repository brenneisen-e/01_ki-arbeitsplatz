import { useState } from 'react';
import { clsx } from 'clsx';
import { ArrowRight } from 'lucide-react';
import { STAGE2_MIGRATION, NPL_KPIS } from '../data/npl';
import { Card, SectionIntro } from '../components/ui/primitives';
import { zahl } from '../utils/format';
import NplView from './NplView';
import Stage2View from './Stage2View';

/**
 * Zusammengelegte Risiko-Sicht: das frühere NPL Dashboard und das Stage-2-
 * Monitoring unter einem Dach. Der Stage-Fluss 1 → 2 → 3 ist der rote Faden,
 * darunter wechselt ein Umschalter zwischen Frühwarnung (Stage 2) und
 * Abwicklung (Stage 3).
 */

function FlussStufe({ label, faelle, volumen, sub, tone }) {
  return (
    <div
      className="flex-1 rounded-xl border px-4 py-3.5 min-w-[170px]"
      style={tone === 'aktiv'
        ? { background: 'var(--mode-pastel)', borderColor: 'color-mix(in srgb, var(--mode-primary) 30%, white)' }
        : { background: '#f8fafc', borderColor: '#e2e8f0' }}
    >
      <div className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">{label}</div>
      <div className="flex items-baseline gap-2 mt-1">
        <span className="text-xl font-semibold text-slate-900 tabular-nums">{faelle}</span>
        {volumen && <span className="text-sm text-slate-600 tabular-nums">{volumen}</span>}
      </div>
      <div className="text-[11px] text-slate-500 mt-0.5">{sub}</div>
    </div>
  );
}

function Uebergang({ wert, ton }) {
  return (
    <div className={clsx('flex flex-col items-center gap-0.5 shrink-0 px-1', ton === 'gut' ? 'text-emerald-600' : 'text-red-600')}>
      <ArrowRight size={16} strokeWidth={2} />
      <span className="text-[11px] font-semibold tabular-nums whitespace-nowrap">{wert}</span>
    </div>
  );
}

export default function RisikoView() {
  const [fokus, setFokus] = useState('stage3');

  return (
    <div className="px-6 py-6 space-y-6">
      <SectionIntro
        titel="Risiko-Monitoring nach IFRS 9"
        text="Frühwarnung und Abwicklung in einer Sicht: Der Stage-Fluss zeigt, wie sich das Risiko durch das Portfolio bewegt — darunter der Blick in Stage 2 (signifikant erhöhtes Risiko) und Stage 3 (notleidende Kredite)."
      />

      {/* Stage-Fluss als roter Faden */}
      <Card className="p-5">
        <div className="flex items-center gap-2 flex-wrap">
          <FlussStufe
            label="Stage 1 — performing"
            faelle="Bestand"
            sub={`−${zahl(STAGE2_MIGRATION.ausStage1)} Fälle in 30 Tagen abgegeben`}
          />
          <Uebergang wert={`+${zahl(STAGE2_MIGRATION.ausStage1)}`} ton="schlecht" />
          <FlussStufe
            label="Stage 2 — Frühwarnung"
            faelle={zahl(STAGE2_MIGRATION.bestand)}
            volumen="€ 32,1 Mio"
            sub={`Netto-Zugang ${STAGE2_MIGRATION.netto}`}
            tone={fokus === 'stage2' ? 'aktiv' : undefined}
          />
          <Uebergang wert={`+${zahl(STAGE2_MIGRATION.nachStage3)}`} ton="schlecht" />
          <FlussStufe
            label="Stage 3 — NPL"
            faelle={NPL_KPIS[1].value}
            volumen={NPL_KPIS[0].value}
            sub={`Recovery Rate ${NPL_KPIS[2].value}`}
            tone={fokus === 'stage3' ? 'aktiv' : undefined}
          />
        </div>
      </Card>

      {/* Umschalter */}
      <div className="flex items-center gap-2">
        {[
          { id: 'stage2', label: 'Stage 2 — Frühwarnung', sub: 'ECL, Migration, Risikotreiber' },
          { id: 'stage3', label: 'Stage 3 — NPL', sub: 'Bestand, Trends, Maßnahmen' },
        ].map(f => (
          <button
            key={f.id}
            onClick={() => setFokus(f.id)}
            className={clsx('px-4 py-2 rounded-xl border text-left transition-colors',
              fokus === f.id ? 'border-transparent text-white' : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50')}
            style={fokus === f.id ? { background: 'var(--mode-primary)' } : undefined}
          >
            <span className="block text-[13px] font-semibold">{f.label}</span>
            <span className={clsx('block text-[11px]', fokus === f.id ? 'text-white/70' : 'text-slate-500')}>{f.sub}</span>
          </button>
        ))}
      </div>

      {fokus === 'stage3' ? <NplView eingebettet /> : <Stage2View eingebettet />}
    </div>
  );
}
