import Card from '../../../components/ui/Card';
import { PrioBadge, QuellenBadge } from '../../../components/ui/Badge';
import { formatEur } from '../../../utils/formatters';
import { Shield, Zap, RefreshCw, CheckCircle, XCircle } from 'lucide-react';

const ABSICHERUNGS_TYPEN = [
  { key: 'bu', label: 'BU' },
  { key: 'kfz', label: 'KFZ' },
  { key: 'hausrat', label: 'Hausrat' },
  { key: 'haftpflicht', label: 'Haftpfl.' },
  { key: 'rlv', label: 'RLV' },
  { key: 'pflege', label: 'Pflege' },
  { key: 'unfall', label: 'Unfall' },
  { key: 'rechtsschutz', label: 'Rechtsch.' },
  { key: 'wohngebaeude', label: 'Wohngeb.' },
];

export default function ImpulseTab({ kunde }) {
  const absicherung = kunde.absicherung || { vorhanden: [], fehlend: [] };
  const potentiale = kunde.potentiale || [];
  const whitespots = potentiale.filter(p => p.typ === 'whitespot');
  const anpassungen = potentiale.filter(p => p.typ === 'anpassung');
  const crossSell = potentiale.filter(p => p.typ === 'cross_sell' || p.typ === 'konsolidierung' || p.typ === 'nextgen' || p.typ === 'beratung');
  const luecken = absicherung.fehlend?.length || 0;

  return (
    <div className="space-y-4">
      {/* Absicherungsstatus */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Shield size={20} className="text-slate-500" strokeWidth={1.75} />
            <h3 className="font-semibold text-slate-800">Absicherungsstatus</h3>
          </div>
          <span className="text-sm text-slate-400">{luecken} Lücken erkannt</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {ABSICHERUNGS_TYPEN.map(typ => {
            const vorhanden = absicherung.vorhanden?.some(v => v.includes(typ.key));
            return (
              <div
                key={typ.key}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium ${
                  vorhanden
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    : 'bg-red-50 text-red-600 border border-red-200'
                }`}
              >
                {vorhanden ? <CheckCircle size={14} /> : <XCircle size={14} />}
                {typ.label}
              </div>
            );
          })}
        </div>
      </Card>

      {/* Whitespots (Neugeschaeft) */}
      {whitespots.length > 0 && (
        <Card>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Zap size={20} style={{ color: 'var(--mode-primary-light)' }} strokeWidth={1.75} />
              <h3 className="font-semibold text-slate-800">Whitespots (Neugeschäft)</h3>
            </div>
            <span className="text-sm text-slate-400">{whitespots.length} Potentiale</span>
          </div>
          <div className="space-y-3">
            {whitespots.map((p, i) => (
              <PotentialCard key={i} potential={p} />
            ))}
          </div>
        </Card>
      )}

      {/* Anpassungsbedarfe */}
      {anpassungen.length > 0 && (
        <Card>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <RefreshCw size={20} className="text-amber-500" strokeWidth={1.75} />
              <h3 className="font-semibold text-slate-800">Anpassungsbedarfe</h3>
            </div>
            <span className="text-sm text-slate-400">{anpassungen.length} Potentiale</span>
          </div>
          <div className="space-y-3">
            {anpassungen.map((p, i) => (
              <PotentialCard key={i} potential={p} />
            ))}
          </div>
        </Card>
      )}

      {/* Cross-Sell / Sonstiges */}
      {crossSell.length > 0 && (
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-slate-800">Weitere Potentiale</h3>
            <span className="text-sm text-slate-400">{crossSell.length} Potentiale</span>
          </div>
          <div className="space-y-3">
            {crossSell.map((p, i) => (
              <PotentialCard key={i} potential={p} />
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}

function PotentialCard({ potential: p }) {
  return (
    <div className="border border-slate-100 rounded-lg p-4 hover:bg-slate-50 transition-colors">
      <div className="flex items-start justify-between mb-2">
        <div>
          <h4 className="text-sm font-semibold text-slate-800">{p.titel}</h4>
          <div className="flex gap-1 mt-1">
            {p.quellen?.map((q, i) => <QuellenBadge key={i} quelle={q} />)}
          </div>
        </div>
        <div className="flex items-center gap-3">
          <PrioBadge prioritaet={p.prioritaet} />
          <span className="font-mono text-sm font-medium text-slate-700">
            {p.volumen > 0 ? formatEur(p.volumen) : '-'}
            {p.volumenTyp === 'jaehrlich' && '/J.'}
            {p.volumenTyp === 'einmalig' && ' Einmal'}
          </span>
        </div>
      </div>
      <p className="text-sm text-slate-500 mb-3">{p.beschreibung}</p>
      <div className="flex gap-2">
        <button
          className="px-3 py-1.5 rounded-lg text-xs font-medium text-white transition-colors"
          style={{ backgroundColor: 'var(--mode-primary-light)' }}
        >
          {p.empfohleneAktion === 'termin_vereinbaren' ? 'Termin vereinbaren' :
           p.empfohleneAktion === 'angebot_erstellen' ? 'Angebot erstellen' :
           p.empfohleneAktion === 'tarifvergleich' ? 'Tarifvergleich' : 'Aktion'}
        </button>
        {p.produktEmpfehlung && (
          <span className="text-xs text-slate-400 self-center">{p.produktEmpfehlung}</span>
        )}
      </div>
    </div>
  );
}
