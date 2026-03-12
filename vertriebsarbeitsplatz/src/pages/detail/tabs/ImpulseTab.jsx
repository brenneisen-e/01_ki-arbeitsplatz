import { useState } from 'react';
import Card from '../../../components/ui/Card';
import { PrioBadge, QuellenBadge } from '../../../components/ui/Badge';
import { formatEur } from '../../../utils/formatters';
import { useMode } from '../../../hooks/useMode';
import { Shield, Zap, RefreshCw, CheckCircle, XCircle, ChevronDown, Calendar, User, ExternalLink } from 'lucide-react';

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
  const [expandedIndex, setExpandedIndex] = useState(null);

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
            {whitespots.map((p, i) => {
              const key = `ws-${i}`;
              return (
                <PotentialCard
                  key={key}
                  potential={p}
                  kunde={kunde}
                  expanded={expandedIndex === key}
                  onToggle={() => setExpandedIndex(expandedIndex === key ? null : key)}
                />
              );
            })}
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
            {anpassungen.map((p, i) => {
              const key = `an-${i}`;
              return (
                <PotentialCard
                  key={key}
                  potential={p}
                  kunde={kunde}
                  expanded={expandedIndex === key}
                  onToggle={() => setExpandedIndex(expandedIndex === key ? null : key)}
                />
              );
            })}
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
            {crossSell.map((p, i) => {
              const key = `cs-${i}`;
              return (
                <PotentialCard
                  key={key}
                  potential={p}
                  kunde={kunde}
                  expanded={expandedIndex === key}
                  onToggle={() => setExpandedIndex(expandedIndex === key ? null : key)}
                />
              );
            })}
          </div>
        </Card>
      )}
    </div>
  );
}

function quellenLabel(quellen) {
  const map = {
    bestand: 'Bestandsanalyse',
    lebensereignis: 'Lebensereignis',
    finanztransaktion: 'Open Finance (FIDA)',
    wettbewerb: 'Wettbewerbsanalyse',
    kommunikation: 'Kommunikationsanalyse',
  };
  return (quellen || []).map(q => map[q] || q).join(' + ');
}

function PotentialCard({ potential: p, kunde, expanded, onToggle }) {
  const { config, navigateTo } = useMode();

  return (
    <div
      className={`border rounded-lg transition-all ${expanded ? 'border-slate-300 shadow-sm' : 'border-slate-100 hover:border-slate-200'}`}
    >
      {/* Clickable header */}
      <div
        className="p-4 cursor-pointer hover:bg-slate-50 transition-colors"
        onClick={onToggle}
      >
        <div className="flex items-start justify-between mb-2">
          <div className="flex-1">
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
            <ChevronDown
              size={16}
              className={`text-slate-400 transition-transform duration-200 ${expanded ? 'rotate-180' : ''}`}
            />
          </div>
        </div>
        <p className="text-sm text-slate-500">{p.beschreibung}</p>
      </div>

      {/* Expandable detail section */}
      {expanded && (
        <div className="border-t border-slate-100 bg-slate-50/50 p-4 space-y-4 animate-fade-in">
          {/* Herleitung */}
          <div>
            <h5 className="text-xs font-semibold text-slate-600 uppercase tracking-wider mb-3">
              Herleitung des Impulses
            </h5>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <HerleitungRow label="Datenquelle" value={quellenLabel(p.quellen)} />
              <HerleitungRow label="Kunde" value={`${kunde.name} (${kunde.id})`} />
              <HerleitungRow label="Erkannte Situation" value={p.beschreibung} />
              <HerleitungRow label="Empfohlenes Produkt" value={p.produktEmpfehlung || '–'} />
              <HerleitungRow
                label="Erwartete Prämie"
                value={p.volumen > 0
                  ? `${formatEur(p.volumen)}${p.volumenTyp === 'jaehrlich' ? '/J.' : p.volumenTyp === 'einmalig' ? ' (einmalig)' : ''}`
                  : 'Vermittlung'}
              />
              {p.status && (
                <HerleitungRow
                  label="Status"
                  value={p.status === 'termin' ? 'Termin vereinbart' :
                         p.status === 'angeschrieben' ? 'Kunde angeschrieben' :
                         p.status === 'identifiziert' ? 'Identifiziert' : p.status}
                />
              )}
            </div>
          </div>

          {/* Aktionen */}
          <div>
            <h5 className="text-xs font-semibold text-slate-600 uppercase tracking-wider mb-3">
              Aktionen
            </h5>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={(e) => { e.stopPropagation(); navigateTo('detail', { kundeId: kunde.id, tab: 'stammdaten' }); }}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium text-white transition-colors"
                style={{ backgroundColor: config.colors.primary }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = config.colors.primaryLight}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = config.colors.primary}
              >
                <User size={14} />
                Kunde öffnen
              </button>
              <button
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium border border-slate-300 text-slate-700 hover:bg-slate-100 transition-colors"
              >
                <Calendar size={14} />
                {p.empfohleneAktion === 'termin_vereinbaren' ? 'Termin vereinbaren' :
                 p.empfohleneAktion === 'angebot_erstellen' ? 'Angebot erstellen' :
                 p.empfohleneAktion === 'tarifvergleich' ? 'Tarifvergleich starten' : 'Aktion'}
              </button>
              {p.produktEmpfehlung && (
                <span className="flex items-center gap-1 text-xs text-slate-400 self-center ml-2">
                  <ExternalLink size={12} />
                  {p.produktEmpfehlung}
                </span>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function HerleitungRow({ label, value }) {
  return (
    <div className="bg-white rounded-lg px-3 py-2 border border-slate-100">
      <span className="text-xs text-slate-400 block">{label}</span>
      <span className="text-slate-700 font-medium">{value}</span>
    </div>
  );
}
