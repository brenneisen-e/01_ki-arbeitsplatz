import { useState } from 'react';
import Card from '../../../components/ui/Card';
import PipelineBar from '../../../components/ui/PipelineBar';
import LogoImg from '../../../components/ui/LogoImg';
import { VV_LEADS } from '../../../data/vvExtended';
import { useMode } from '../../../hooks/useMode';
import {
  ChevronDown, ChevronUp, UserPlus, Briefcase, Calendar, User,
  ExternalLink, TrendingUp, Filter,
} from 'lucide-react';
import { clsx } from 'clsx';

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

const STADIUM_ORDER = ['lead', 'kennenlernen', 'identifiziert', 'termin', 'angebot', 'gewonnen'];
const STADIUM_LABELS = {
  lead: 'Lead',
  kennenlernen: 'Kennenlernen',
  identifiziert: 'Identifiziert',
  termin: 'Termin',
  angebot: 'Angebot',
  gewonnen: 'Gewonnen',
};

const KATEGORIE_TABS = [
  { id: 'alle', label: 'Alle Leads' },
  { id: 'neumandat', label: 'Neue Mandate' },
  { id: 'bestandsmandat', label: 'Bestandsmandate' },
];

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
  const [kategorieFilter, setKategorieFilter] = useState('alle');
  const [statusFilter, setStatusFilter] = useState('alle');
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

  const filtered = mergedLeads.filter(l => {
    if (kategorieFilter !== 'alle' && l.kategorie !== kategorieFilter) return false;
    if (statusFilter !== 'alle' && l.stadium !== statusFilter) return false;
    return true;
  });

  const neumandate = mergedLeads.filter(l => l.kategorie === 'neumandat');
  const bestandsmandate = mergedLeads.filter(l => l.kategorie === 'bestandsmandat');

  const stadiumCounts = {};
  STADIUM_ORDER.forEach(s => { stadiumCounts[s] = mergedLeads.filter(l => l.stadium === s).length; });

  const pipelineSegments = STADIUM_ORDER.map(s => ({
    label: STADIUM_LABELS[s],
    count: stadiumCounts[s] || 0,
    color: s === 'gewonnen' ? '#10b981' : s === 'angebot' ? '#f59e0b' : s === 'termin' ? '#3b82f6' : s === 'kennenlernen' ? '#8b5cf6' : s === 'identifiziert' ? '#06b6d4' : '#94a3b8',
  }));

  if (mergedLeads.length === 0) {
    return (
      <div className="space-y-4">
        <Card hover={false}>
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
    <div className="space-y-3">
      {/* KPIs */}
      <div className="grid grid-cols-3 gap-3">
        <KPI icon={UserPlus} label="Leads Neue Mandate" value={neumandate.length} />
        <KPI icon={Briefcase} label="Leads Bestandsmandat" value={bestandsmandate.length} color="text-emerald-600" />
        <KPI icon={TrendingUp} label="Leads Gesamt" value={mergedLeads.length} />
      </div>

      {/* Pipeline Bar */}
      <Card hover={false}>
        <h3 className="font-semibold text-slate-800 mb-2">Pipeline</h3>
        <PipelineBar segments={pipelineSegments} />
      </Card>

      {/* Filters */}
      <div className="flex items-center gap-4 flex-wrap">
        <div className="flex gap-1">
          {KATEGORIE_TABS.map(t => (
            <button
              key={t.id}
              onClick={() => setKategorieFilter(t.id)}
              className={`text-sm px-4 py-2 rounded-lg font-medium border transition-colors ${
                kategorieFilter === t.id
                  ? 'bg-slate-800 text-white border-slate-800'
                  : 'bg-white text-slate-600 border-slate-200 hover:border-slate-400'
              }`}
            >
              {t.label}
              <span className="ml-1.5 text-xs opacity-70">
                {t.id === 'alle' ? mergedLeads.length : t.id === 'neumandat' ? neumandate.length : bestandsmandate.length}
              </span>
            </button>
          ))}
        </div>

        <div className="h-6 w-px bg-slate-200" />

        <div className="flex items-center gap-1.5 flex-wrap">
          <Filter size={14} className="text-slate-400" />
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
      <Card hover={false}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-left text-xs text-slate-400 uppercase">
                <th className="py-2 pr-2 w-5"></th>
                <th className="py-2 pr-2 w-[18%]">Lead</th>
                <th className="py-2 pr-2 w-[10%]">Kategorie</th>
                <th className="py-2 pr-2 w-[10%]">Quelle</th>
                <th className="py-2 pr-2 w-[10%]">Stadium</th>
                <th className="py-2 pr-2 w-[12%]">Pot. Volumen</th>
                <th className="py-2">Herkunft</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(lead => {
                const isExpanded = expandedLead === lead.id;
                return (
                  <LeadRow
                    key={lead.id}
                    lead={lead}
                    kunde={kunde}
                    isExpanded={isExpanded}
                    onToggle={() => setExpandedLead(isExpanded ? null : lead.id)}
                  />
                );
              })}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="text-center py-8 text-sm text-slate-400">Keine Leads gefunden</div>
          )}
        </div>
      </Card>
    </div>
  );
}

function LeadRow({ lead, kunde, isExpanded, onToggle }) {
  const [hovered, setHovered] = useState(false);
  const { config, navigateTo } = useMode();

  return (
    <>
      <tr
        className="border-b border-slate-100 transition-colors cursor-pointer"
        style={hovered ? { backgroundColor: 'var(--mode-primary-light)', color: '#ffffff' } : undefined}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        onClick={onToggle}
      >
        <td className={`py-2.5 pr-1 w-5 ${hovered ? 'text-white' : 'text-slate-400'}`}>
          {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </td>
        <td className="py-2.5 pr-2">
          <div className={`font-medium ${hovered ? 'text-white' : 'text-slate-800'}`}>{lead.name}</div>
          {lead.beruf && <div className={`text-[10px] ${hovered ? 'text-white/70' : 'text-slate-400'}`}>{lead.beruf}</div>}
        </td>
        <td className="py-2.5 pr-2">
          <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
            hovered
              ? 'bg-white/20 text-white'
              : lead.kategorie === 'neumandat'
                ? 'bg-blue-50 text-blue-700'
                : 'bg-emerald-50 text-emerald-700'
          }`}>
            {lead.kategorie === 'neumandat' ? 'Neues Mandat' : 'Bestand'}
          </span>
        </td>
        <td className="py-2.5 pr-2">
          <span
            className="text-[10px] font-medium px-2 py-0.5 rounded-full text-white"
            style={{ backgroundColor: hovered ? 'rgba(255,255,255,0.25)' : (QUELLEN_COLORS[lead.quelle] || '#94a3b8') }}
          >
            {QUELLEN_LABELS[lead.quelle] || lead.quelleLabel || lead.quelle}
          </span>
        </td>
        <td className="py-2.5 pr-2">
          {hovered
            ? <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-white/20 text-white">{STADIUM_LABELS[lead.stadium] || lead.stadium}</span>
            : <StadiumBadge stadium={lead.stadium} />
          }
        </td>
        <td className={`py-2.5 pr-2 font-mono text-sm ${hovered ? 'text-white' : 'text-slate-700'}`}>
          {lead.geschaetztesVolumen || '—'}
        </td>
        <td className={`py-2.5 text-xs truncate ${hovered ? 'text-white/80' : 'text-slate-500'}`}>
          {lead.herkunft}
        </td>
      </tr>
      {isExpanded && (
        <tr className="bg-slate-50/80">
          <td colSpan={7} className="px-6 py-4">
            <div className="max-w-4xl space-y-4">
              {/* Herleitung */}
              {lead.herleitung && lead.herleitung.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <h4 className="text-sm font-semibold text-slate-700">Herleitung</h4>
                    {lead.quelleLabel && (
                      <span className="text-[10px] text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
                        {lead.quelleLabel}
                      </span>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    {lead.herleitung.map((h, i) => (
                      <HerleitungRow key={i} label={h.label} value={h.value} />
                    ))}
                  </div>
                </div>
              )}

              {/* Vergleichstabelle */}
              {lead.vergleich && (
                <VergleichsTabelle data={lead.vergleich} />
              )}

              {/* Nächster Schritt */}
              {lead.naechsterSchritt && (
                <div className="pt-2 border-t border-slate-200">
                  <span className="text-xs text-slate-400 font-medium">Nächster Schritt: </span>
                  <span className="text-xs text-slate-700 font-medium">{lead.naechsterSchritt}</span>
                </div>
              )}

              {/* Wahrscheinlichkeit */}
              {lead.wahrscheinlichkeit > 0 && (
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-slate-400">Wahrscheinlichkeit:</span>
                  <div className="w-24 h-1.5 bg-slate-200 rounded-full">
                    <div
                      className="h-1.5 rounded-full transition-all"
                      style={{
                        width: `${lead.wahrscheinlichkeit}%`,
                        backgroundColor: lead.wahrscheinlichkeit >= 70 ? '#10b981' : lead.wahrscheinlichkeit >= 40 ? '#f59e0b' : '#94a3b8',
                      }}
                    />
                  </div>
                  <span className="text-[10px] font-mono text-slate-600">{lead.wahrscheinlichkeit}%</span>
                </div>
              )}

              {/* Aktionen */}
              <div className="flex flex-wrap gap-2 pt-2">
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
                {lead.produktEmpfehlung && (
                  <span className="flex items-center gap-1 text-xs text-slate-400 self-center ml-2">
                    <ExternalLink size={12} />
                    {lead.produktEmpfehlung}
                  </span>
                )}
              </div>
            </div>
          </td>
        </tr>
      )}
    </>
  );
}

function KPI({ icon: Icon, label, value, color }) {
  return (
    <Card hover={false}>
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-slate-100">
          <Icon size={20} className="text-slate-500" />
        </div>
        <div>
          <div className={`text-2xl font-bold ${color || 'text-slate-800'}`}>{value}</div>
          <div className="text-xs text-slate-500">{label}</div>
        </div>
      </div>
    </Card>
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
    <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${styles[stadium] || styles.lead}`}>
      {STADIUM_LABELS[stadium] || stadium}
    </span>
  );
}
