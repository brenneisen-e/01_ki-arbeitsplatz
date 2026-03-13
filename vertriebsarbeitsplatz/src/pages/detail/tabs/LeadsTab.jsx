import { useState } from 'react';
import Card from '../../../components/ui/Card';
import { VV_LEADS } from '../../../data/vvExtended';
import { ChevronDown, ChevronUp, UserPlus, Briefcase } from 'lucide-react';

const QUELLEN_COLORS = {
  empfehlung: '#10b981',
  nextgen: '#8b5cf6',
  presse: '#f59e0b',
  event: '#ec4899',
  multiplikator: '#06b6d4',
  digital: '#3b82f6',
  liquiditaet: '#ef4444',
  fremdbank: '#6b7280',
  upgrade: '#06b6d4',
  lifeevent: '#f97316',
  stiftung: '#7c3aed',
  event_einladung: '#ec4899',
  performance: '#ef4444',
  compliance: '#64748b',
};

const QUELLEN_LABELS = {
  empfehlung: 'Empfehlung',
  nextgen: 'NextGen',
  presse: 'Presse/Exit',
  event: 'Event',
  multiplikator: 'Multiplikator',
  digital: 'Digital',
  liquiditaet: 'Liquidität',
  fremdbank: 'Fremdbank',
  upgrade: 'Upgrade',
  lifeevent: 'Life Event',
  stiftung: 'Stiftung',
  event_einladung: 'Event-Einladung',
  performance: 'Performance',
  compliance: 'Compliance',
};

const STADIUM_LABELS = {
  lead: 'Lead',
  kennenlernen: 'Kennenlernen',
  identifiziert: 'Identifiziert',
  termin: 'Termin',
  angebot: 'Angebot',
  gewonnen: 'Gewonnen',
};

export default function LeadsTab({ kunde }) {
  const [expandedLead, setExpandedLead] = useState(null);

  // Filter leads related to this mandant
  const allLeads = VV_LEADS || [];
  const kundeLeads = allLeads.filter(l => l.referenzMandant === kunde?.id);

  // Also include leads from the mandant's potentiale (persona data)
  const personaLeads = (kunde?.potentiale || []).map((p, i) => ({
    id: `persona-${i}`,
    name: p.titel,
    kategorie: p.typ === 'nextgen' || p.typ === 'beratung' ? 'neumandat' : 'bestandsmandat',
    quelle: p.typ === 'nextgen' ? 'nextgen' : p.typ === 'konsolidierung' ? 'fremdbank' : p.typ === 'anpassung' ? 'upgrade' : p.typ === 'cross_sell' ? 'upgrade' : 'lifeevent',
    quelleLabel: p.quellen?.join(', ') || p.typ,
    stadium: p.status === 'abgeschlossen' ? 'gewonnen' : p.status === 'termin' ? 'termin' : p.status === 'angeschrieben' ? 'kennenlernen' : 'identifiziert',
    geschaetztesVolumen: p.volumen > 0 ? `${(p.volumen / 1000000).toFixed(1)}M €` : '—',
    potentialAuM: p.volumen || 0,
    herkunft: p.beschreibung,
    herleitung: p.herleitung || [],
    naechsterSchritt: p.empfohleneAktion === 'termin_vereinbaren' ? 'Termin vereinbaren' : p.empfohleneAktion === 'angebot_erstellen' ? 'Angebot erstellen' : p.empfohleneAktion,
    beruf: '',
    datum: '',
  }));

  // Merge: use VV_LEADS for this mandant, plus persona leads if not duplicated
  const mergedLeads = [...kundeLeads];
  personaLeads.forEach(pl => {
    // Skip if there's already a VV_LEADS entry with similar name
    const exists = kundeLeads.some(kl =>
      kl.name.toLowerCase().includes(pl.name.split(' ')[0]?.toLowerCase()) ||
      pl.name.toLowerCase().includes(kl.name.split(' ')[0]?.toLowerCase())
    );
    if (!exists) mergedLeads.push(pl);
  });

  const neumandatLeads = mergedLeads.filter(l => l.kategorie === 'neumandat');
  const bestandsLeads = mergedLeads.filter(l => l.kategorie === 'bestandsmandat');

  if (mergedLeads.length === 0) {
    return (
      <div className="space-y-4">
        <Card>
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mb-4">
              <UserPlus className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="font-semibold text-slate-700 mb-1">Keine Leads vorhanden</h3>
            <p className="text-sm text-slate-400 max-w-md">
              Für {kunde?.name || 'diesen Mandanten'} wurden noch keine Leads identifiziert.
            </p>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary KPIs */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-slate-100">
              <UserPlus size={20} className="text-blue-500" />
            </div>
            <div>
              <div className="text-2xl font-bold text-slate-800">{neumandatLeads.length}</div>
              <div className="text-xs text-slate-500">Leads Neue Mandate</div>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-slate-100">
              <Briefcase size={20} className="text-emerald-500" />
            </div>
            <div>
              <div className="text-2xl font-bold text-slate-800">{bestandsLeads.length}</div>
              <div className="text-xs text-slate-500">Leads Bestandsmandat</div>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-slate-100">
              <Briefcase size={20} className="text-slate-500" />
            </div>
            <div>
              <div className="text-2xl font-bold text-slate-800">{mergedLeads.length}</div>
              <div className="text-xs text-slate-500">Leads Gesamt</div>
            </div>
          </div>
        </Card>
      </div>

      {/* Neue Mandate Section */}
      {neumandatLeads.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-blue-700 mb-3 flex items-center gap-2">
            <UserPlus size={16} /> Leads für neue Mandate
          </h3>
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden" style={{ boxShadow: 'var(--card-shadow)' }}>
            {neumandatLeads.map(lead => (
              <LeadCard
                key={lead.id}
                lead={lead}
                isExpanded={expandedLead === lead.id}
                onToggle={() => setExpandedLead(expandedLead === lead.id ? null : lead.id)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Bestandsmandate Section */}
      {bestandsLeads.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-emerald-700 mb-3 flex items-center gap-2">
            <Briefcase size={16} /> Leads für Bestandsmandat
          </h3>
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden" style={{ boxShadow: 'var(--card-shadow)' }}>
            {bestandsLeads.map(lead => (
              <LeadCard
                key={lead.id}
                lead={lead}
                isExpanded={expandedLead === lead.id}
                onToggle={() => setExpandedLead(expandedLead === lead.id ? null : lead.id)}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function LeadCard({ lead, isExpanded, onToggle }) {
  return (
    <div className="border-b border-slate-100 last:border-0">
      <div
        className="flex items-center justify-between px-4 py-3 hover:bg-slate-50 cursor-pointer transition-colors"
        onClick={onToggle}
      >
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <span className="text-slate-400">
            {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </span>
          <span className="font-medium text-sm text-slate-800 truncate">{lead.name}</span>
          <span
            className="text-[10px] font-medium px-2 py-0.5 rounded-full text-white shrink-0"
            style={{ backgroundColor: QUELLEN_COLORS[lead.quelle] || '#94a3b8' }}
          >
            {QUELLEN_LABELS[lead.quelle] || lead.quelleLabel || lead.quelle}
          </span>
          <StadiumBadge stadium={lead.stadium} />
        </div>
        <span className="font-mono text-sm text-slate-700 shrink-0 ml-4">{lead.geschaetztesVolumen || '—'}</span>
      </div>

      {isExpanded && (
        <div className="px-10 pb-4">
          {lead.herkunft && (
            <p className="text-xs text-slate-500 mb-3 italic">{lead.herkunft}</p>
          )}
          {lead.herleitung && lead.herleitung.length > 0 && (
            <div className="bg-slate-50 rounded-lg p-4 mb-3">
              <h5 className="text-xs font-semibold text-slate-600 mb-2">Herleitung</h5>
              <div className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1.5">
                {lead.herleitung.map((h, i) => (
                  <div key={i} className="contents">
                    <span className="text-xs text-slate-400 font-medium whitespace-nowrap">{h.label}</span>
                    <span className="text-xs text-slate-700">{h.value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
          {lead.naechsterSchritt && (
            <div className="text-xs">
              <span className="text-slate-400 font-medium">Nächster Schritt: </span>
              <span className="text-slate-700 font-medium">{lead.naechsterSchritt}</span>
            </div>
          )}
        </div>
      )}
    </div>
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
