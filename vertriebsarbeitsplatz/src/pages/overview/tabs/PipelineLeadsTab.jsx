import { useState } from 'react';
import Card from '../../../components/ui/Card';
import PipelineBar from '../../../components/ui/PipelineBar';
import { useMode } from '../../../hooks/useMode';
import { Users, UserPlus, TrendingUp, Target, Filter } from 'lucide-react';

import { VV_LEADS } from '../../../data/vvExtended';

const QUELLEN_COLORS = {
  nextgen: '#8b5cf6',
  presse: '#f59e0b',
  empfehlung: '#10b981',
  digital: '#3b82f6',
  liquiditaet: '#ef4444',
  event: '#ec4899',
  upgrade: '#06b6d4',
  fremdbank: '#6b7280',
};

const QUELLEN_LABELS = {
  nextgen: 'NextGen',
  presse: 'Presse',
  empfehlung: 'Empfehlung',
  digital: 'Digital',
  liquiditaet: 'Liquidität',
  event: 'Event',
  upgrade: 'Upgrade',
  fremdbank: 'Fremdbank',
};

const STADIUM_ORDER = ['lead', 'kennenlernen', 'identifiziert', 'termin', 'angebot', 'gewonnen'];
const STADIUM_LABELS = {
  lead: 'Lead',
  kennenlernen: 'Kennenlernen',
  identifiziert: 'Identifiziert',
  termin: 'Termin',
  angebot: 'Angebot',
  gewonnen: 'Gewonnen',
};

const TYP_TABS = [
  { id: 'alle', label: 'Alle' },
  { id: 'neukunde', label: 'Neukunden' },
  { id: 'bestandskunde', label: 'Bestandskunden' },
];

export default function PipelineLeadsTab() {
  const [typFilter, setTypFilter] = useState('alle');
  const [statusFilter, setStatusFilter] = useState('alle');

  const leads = VV_LEADS || [];
  const filtered = leads.filter(l => {
    if (typFilter !== 'alle' && l.typ !== typFilter) return false;
    if (statusFilter !== 'alle' && l.stadium !== statusFilter) return false;
    return true;
  });

  const neukunden = leads.filter(l => l.typ === 'neukunde');
  const bestandskunden = leads.filter(l => l.typ === 'bestandskunde');

  const stadiumCounts = {};
  STADIUM_ORDER.forEach(s => { stadiumCounts[s] = leads.filter(l => l.stadium === s).length; });

  const pipelineSegments = STADIUM_ORDER.map(s => ({
    label: STADIUM_LABELS[s],
    count: stadiumCounts[s] || 0,
    color: s === 'gewonnen' ? '#10b981' : s === 'angebot' ? '#f59e0b' : s === 'termin' ? '#3b82f6' : s === 'kennenlernen' ? '#8b5cf6' : s === 'identifiziert' ? '#06b6d4' : '#94a3b8',
  }));

  return (
    <div className="space-y-4">
      {/* KPIs */}
      <div className="grid grid-cols-4 gap-4">
        <KPI icon={Users} label="Pipeline Leads" value={leads.length} sub={`${neukunden.length} Neukunden, ${bestandskunden.length} Bestand`} />
        <KPI icon={UserPlus} label="Neukunden" value={neukunden.length} sub="in Pipeline" />
        <KPI icon={TrendingUp} label="Bestandskunden" value={bestandskunden.length} sub="Cross-/Upsell" color="text-emerald-600" />
        <KPI icon={Target} label="Stadien" value={Object.keys(stadiumCounts).filter(s => stadiumCounts[s] > 0).length} sub="aktive Phasen" />
      </div>

      {/* Pipeline Bar */}
      <Card>
        <h3 className="font-semibold text-slate-800 mb-4">Pipeline</h3>
        <PipelineBar segments={pipelineSegments} />
      </Card>

      {/* Filters */}
      <div className="flex items-center gap-4 flex-wrap">
        <div className="flex items-center gap-1.5">
          <Filter size={14} className="text-slate-400" />
          <span className="text-xs text-slate-400">Typ:</span>
          {TYP_TABS.map(t => (
            <button
              key={t.id}
              onClick={() => setTypFilter(t.id)}
              className={`text-xs px-2.5 py-1 rounded-full border transition-colors ${
                typFilter === t.id
                  ? 'bg-slate-800 text-white border-slate-800'
                  : 'bg-white text-slate-500 border-slate-200 hover:border-slate-400'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-xs text-slate-400">Stadium:</span>
          <button
            onClick={() => setStatusFilter('alle')}
            className={`text-xs px-2.5 py-1 rounded-full border transition-colors ${
              statusFilter === 'alle'
                ? 'bg-slate-800 text-white border-slate-800'
                : 'bg-white text-slate-500 border-slate-200 hover:border-slate-400'
            }`}
          >
            Alle
          </button>
          {STADIUM_ORDER.map(s => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`text-xs px-2.5 py-1 rounded-full border transition-colors ${
                statusFilter === s
                  ? 'bg-slate-800 text-white border-slate-800'
                  : 'bg-white text-slate-500 border-slate-200 hover:border-slate-400'
              }`}
            >
              {STADIUM_LABELS[s]}
            </button>
          ))}
        </div>
      </div>

      {/* Leads Table */}
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-left text-xs text-slate-400 uppercase">
                <th className="py-2 pr-3">Lead</th>
                <th className="py-2 pr-3">Quelle</th>
                <th className="py-2 pr-3">Typ</th>
                <th className="py-2 pr-3">Stadium</th>
                <th className="py-2 pr-3">Pot. Volumen</th>
                <th className="py-2">Herkunft</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(lead => (
                <tr key={lead.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors cursor-pointer">
                  <td className="py-2.5 pr-3">
                    <div className="font-medium text-slate-800">{lead.name}</div>
                    {lead.beruf && <div className="text-[10px] text-slate-400">{lead.beruf}</div>}
                  </td>
                  <td className="py-2.5 pr-3">
                    <span
                      className="text-[10px] font-medium px-2 py-0.5 rounded-full text-white"
                      style={{ backgroundColor: QUELLEN_COLORS[lead.quelle] || '#94a3b8' }}
                    >
                      {QUELLEN_LABELS[lead.quelle] || lead.quelle}
                    </span>
                  </td>
                  <td className="py-2.5 pr-3">
                    <span className={`text-xs ${lead.typ === 'neukunde' ? 'text-blue-600' : 'text-emerald-600'}`}>
                      {lead.typ === 'neukunde' ? 'Neukunde' : 'Bestand'}
                    </span>
                  </td>
                  <td className="py-2.5 pr-3">
                    <StadiumBadge stadium={lead.stadium} />
                  </td>
                  <td className="py-2.5 pr-3 font-mono text-slate-700 text-sm">
                    {lead.geschaetztesVolumen || '—'}
                  </td>
                  <td className="py-2.5 text-xs text-slate-500 max-w-[280px] truncate">
                    {lead.herkunft}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="text-center py-8 text-sm text-slate-400">Keine Leads gefunden</div>
          )}
        </div>
      </Card>

      {/* Quellen-Aufschlüsselung */}
      <div className="grid grid-cols-2 gap-4">
        <Card>
          <h4 className="font-semibold text-slate-800 mb-3">Neukunden-Quellen</h4>
          <div className="space-y-2">
            {['nextgen', 'presse', 'empfehlung', 'digital'].map(q => {
              const count = leads.filter(l => l.quelle === q && l.typ === 'neukunde').length;
              return (
                <div key={q} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: QUELLEN_COLORS[q] }} />
                    <span className="text-slate-600">{QUELLEN_LABELS[q]}</span>
                  </div>
                  <span className="text-xs text-slate-500">{count} Leads</span>
                </div>
              );
            })}
          </div>
        </Card>
        <Card>
          <h4 className="font-semibold text-slate-800 mb-3">Bestandskunden-Quellen</h4>
          <div className="space-y-2">
            {['liquiditaet', 'event', 'upgrade', 'fremdbank'].map(q => {
              const count = leads.filter(l => l.quelle === q && l.typ === 'bestandskunde').length;
              return (
                <div key={q} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: QUELLEN_COLORS[q] }} />
                    <span className="text-slate-600">{QUELLEN_LABELS[q]}</span>
                  </div>
                  <span className="text-xs text-slate-500">{count} Leads</span>
                </div>
              );
            })}
          </div>
        </Card>
      </div>
    </div>
  );
}

function KPI({ icon: Icon, label, value, sub, color }) {
  return (
    <Card>
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-slate-100">
          <Icon size={20} className="text-slate-500" />
        </div>
        <div>
          <div className={`text-2xl font-bold ${color || 'text-slate-800'}`}>{value}</div>
          <div className="text-xs text-slate-500">{label}</div>
          {sub && <div className="text-[10px] text-slate-400">{sub}</div>}
        </div>
      </div>
    </Card>
  );
}

function StadiumBadge({ stadium }) {
  const styles = {
    lead: 'bg-slate-100 text-slate-600',
    kennenlernen: 'bg-purple-50 text-purple-600',
    identifiziert: 'bg-cyan-50 text-cyan-600',
    termin: 'bg-blue-50 text-blue-600',
    angebot: 'bg-amber-50 text-amber-600',
    gewonnen: 'bg-emerald-50 text-emerald-600',
  };
  return (
    <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${styles[stadium] || styles.lead}`}>
      {STADIUM_LABELS[stadium] || stadium}
    </span>
  );
}
