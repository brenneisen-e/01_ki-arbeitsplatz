import { useState } from 'react';
import Card from '../../../components/ui/Card';
import LogoImg from '../../../components/ui/LogoImg';
import { VV_LEADS } from '../../../data/vvExtended';
import { useMode } from '../../../hooks/useMode';
import {
  ChevronDown, UserPlus, Briefcase, Calendar, User,
  ExternalLink, TrendingUp, ArrowRight,
} from 'lucide-react';
import { clsx } from 'clsx';

const QUELLEN_COLORS = {
  empfehlung: '#4a8c6f',
  nextgen: '#7c6b9e',
  presse: '#b08d3e',
  event: '#a65f7d',
  multiplikator: '#4a8fa0',
  digital: '#5a7fb8',
  liquiditaet: '#a05a5a',
  fremdbank: '#6b7280',
  upgrade: '#4a8fa0',
  lifeevent: '#b07040',
  stiftung: '#6a5a8e',
  event_einladung: '#a65f7d',
  performance: '#a05a5a',
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

// ─── Detect institution names in herleitung values for logo display ───
const KNOWN_INSTITUTES = [
  'UBS', 'Deutsche Bank', 'Commerzbank', 'ING', 'Sparkasse', 'DKB',
  'Alte Leipziger', 'Zurich', 'Allianz', 'ERGO', 'Goldman Sachs',
  'J.P. Morgan', 'Credit Suisse', 'HSBC', 'BNP Paribas', 'Berenberg',
  'Metzler', 'Hauck & Aufhäuser', 'Bethmann Bank', 'Pictet',
];

function detectInstitut(text) {
  if (!text) return null;
  for (const inst of KNOWN_INSTITUTES) {
    if (text.includes(inst)) return inst;
  }
  return null;
}

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
    vergleich: p.vergleich || null,
    deckungsluecke: p.deckungsluecke || null,
    naechsterSchritt: p.empfohleneAktion === 'termin_vereinbaren' ? 'Termin vereinbaren' : p.empfohleneAktion === 'angebot_erstellen' ? 'Angebot erstellen' : p.empfohleneAktion,
    produktEmpfehlung: p.produktEmpfehlung,
    beruf: '',
    datum: '',
  }));

  // Merge: use VV_LEADS for this mandant, plus persona leads if not duplicated
  const mergedLeads = [...kundeLeads];
  personaLeads.forEach(pl => {
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
            <div className="p-2 rounded-lg bg-blue-50">
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
            <div className="p-2 rounded-lg bg-emerald-50">
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
              <TrendingUp size={20} className="text-slate-500" />
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
        <Card>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <UserPlus size={20} className="text-blue-500" strokeWidth={1.75} />
              <h3 className="font-semibold text-slate-800">Leads für neue Mandate</h3>
            </div>
            <span className="text-sm text-slate-400">{neumandatLeads.length} Leads</span>
          </div>
          <div className="space-y-3">
            {neumandatLeads.map(lead => (
              <LeadCard
                key={lead.id}
                lead={lead}
                kunde={kunde}
                isExpanded={expandedLead === lead.id}
                onToggle={() => setExpandedLead(expandedLead === lead.id ? null : lead.id)}
              />
            ))}
          </div>
        </Card>
      )}

      {/* Bestandsmandate Section */}
      {bestandsLeads.length > 0 && (
        <Card>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Briefcase size={20} className="text-emerald-500" strokeWidth={1.75} />
              <h3 className="font-semibold text-slate-800">Leads für Bestandsmandat</h3>
            </div>
            <span className="text-sm text-slate-400">{bestandsLeads.length} Leads</span>
          </div>
          <div className="space-y-3">
            {bestandsLeads.map(lead => (
              <LeadCard
                key={lead.id}
                lead={lead}
                kunde={kunde}
                isExpanded={expandedLead === lead.id}
                onToggle={() => setExpandedLead(expandedLead === lead.id ? null : lead.id)}
              />
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}

function LeadCard({ lead, kunde, isExpanded, onToggle }) {
  const { config, navigateTo } = useMode();

  return (
    <div className={clsx(
      'border rounded-lg transition-all',
      isExpanded ? 'border-slate-300 shadow-sm' : 'border-slate-100 hover:border-slate-200',
    )}>
      {/* Clickable header */}
      <div
        className="p-4 cursor-pointer hover:bg-slate-50 transition-colors"
        onClick={onToggle}
      >
        <div className="flex items-start justify-between mb-1">
          <div className="flex-1">
            <h4 className="text-sm font-semibold text-slate-800">{lead.name}</h4>
            {lead.beruf && (
              <p className="text-xs text-slate-400 mt-0.5">{lead.beruf}</p>
            )}
            <div className="flex gap-1.5 mt-1.5">
              <span
                className="text-xs font-medium px-2.5 py-0.5 rounded-full text-white"
                style={{ backgroundColor: QUELLEN_COLORS[lead.quelle] || '#94a3b8' }}
              >
                {QUELLEN_LABELS[lead.quelle] || lead.quelleLabel || lead.quelle}
              </span>
              <StadiumBadge stadium={lead.stadium} />
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="font-mono text-sm font-medium text-slate-700">{lead.geschaetztesVolumen || '—'}</span>
            <ChevronDown
              size={16}
              className={clsx('text-slate-400 transition-transform duration-200', isExpanded && 'rotate-180')}
            />
          </div>
        </div>
        {lead.herkunft && (
          <p className="text-sm text-slate-500 mt-1">{lead.herkunft}</p>
        )}
      </div>

      {/* Expandable detail section */}
      {isExpanded && (
        <div className="border-t border-slate-100 bg-slate-50/50 p-4 space-y-5 animate-fade-in">
          {/* Herleitung */}
          {lead.herleitung && lead.herleitung.length > 0 && (
            <div>
              <h5 className="text-xs font-semibold text-slate-600 uppercase tracking-wider mb-3">
                Herleitung
              </h5>
              <div className="grid grid-cols-2 gap-2 text-sm">
                {lead.herleitung.map((h, i) => (
                  <HerleitungRow key={i} label={h.label} value={h.value} />
                ))}
              </div>
            </div>
          )}

          {/* Vergleichstabelle (from potentiale data) */}
          {lead.vergleich && (
            <VergleichsTabelle data={lead.vergleich} />
          )}

          {/* Aktionen */}
          <div>
            <h5 className="text-xs font-semibold text-slate-600 uppercase tracking-wider mb-3">
              Aktionen
            </h5>
            <div className="flex flex-wrap gap-2">
              {lead.naechsterSchritt && (
                <button
                  className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium text-white transition-colors"
                  style={{ backgroundColor: config.colors.primary }}
                  onMouseEnter={(e) => e.currentTarget.style.opacity = '0.85'}
                  onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
                >
                  <Calendar size={14} />
                  {lead.naechsterSchritt}
                </button>
              )}
              <button
                onClick={(e) => { e.stopPropagation(); navigateTo('detail', { kundeId: kunde.id, tab: 'stammdaten' }); }}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium border border-slate-300 text-slate-700 hover:bg-slate-100 transition-colors"
              >
                <User size={14} />
                Mandant öffnen
              </button>
              {lead.produktEmpfehlung && (
                <span className="flex items-center gap-1 text-xs text-slate-400 self-center ml-2">
                  <ExternalLink size={12} />
                  {lead.produktEmpfehlung}
                </span>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Herleitung cell (Versicherung-style) ───
function HerleitungRow({ label, value }) {
  const institut = detectInstitut(value);
  return (
    <div className="bg-white rounded-lg px-3 py-2 border border-slate-100">
      <span className="text-xs text-slate-400 block">{label}</span>
      <span className="text-slate-700 font-medium flex items-center gap-1.5">
        {institut && <LogoImg name={institut} size={16} />}
        {value}
      </span>
    </div>
  );
}

// ─── Comparison table ───
function VergleichsTabelle({ data }) {
  const { titel, spalten, zeilen } = data;
  // Try to detect institution logos in column headers
  const colLogos = spalten.map(s => detectInstitut(s));

  return (
    <div>
      <h5 className="text-xs font-semibold text-slate-600 uppercase tracking-wider mb-3">
        {titel}
      </h5>
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-50">
              {spalten.map((s, i) => (
                <th
                  key={i}
                  className={clsx(
                    'px-4 py-2.5 text-left font-semibold text-slate-600',
                    i === 0 && 'text-slate-500',
                    i === spalten.length - 1 && 'text-right',
                  )}
                >
                  <span className="flex items-center gap-1.5">
                    {colLogos[i] && <LogoImg name={colLogos[i]} size={16} />}
                    {s}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {zeilen.map((z, i) => (
              <tr
                key={i}
                className={clsx('border-t border-slate-100', i % 2 === 1 && 'bg-slate-50/50')}
              >
                <td className="px-4 py-2.5 text-slate-600 font-medium">{z.merkmal}</td>
                <td className="px-4 py-2.5 text-slate-500">{z.aktuell}</td>
                <td className={clsx(
                  'px-4 py-2.5 text-right font-medium',
                  z.highlight ? 'text-emerald-600' : 'text-slate-700',
                )}>
                  {z.highlight ? <span className="font-semibold">{z.angebot}</span> : z.angebot}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
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
    <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${styles[stadium] || styles.lead}`}>
      {STADIUM_LABELS[stadium] || stadium}
    </span>
  );
}
