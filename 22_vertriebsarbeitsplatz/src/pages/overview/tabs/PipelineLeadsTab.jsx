import { useState, useMemo } from 'react';
import Card from '../../../components/ui/Card';
import PipelineBar from '../../../components/ui/PipelineBar';
import LogoImg from '../../../components/ui/LogoImg';
import useTranslation from '../../../i18n/useTranslation';
import { Users, UserPlus, Target, Filter, ChevronDown, ChevronUp, Briefcase, Sparkles, Calendar } from 'lucide-react';
import { clsx } from 'clsx';

import { VV_LEADS } from '../../../data/vvExtended';
import { LEADS_EN } from '../../../data/vvExtended-leads-en';
import { formatEur } from '../../../utils/formatters';

function getLeadField(lead, field, lang) {
  if (lang !== 'en' || !lead.id) return lead[field];
  const en = LEADS_EN[lead.id];
  return en?.[field] ?? lead[field];
}

function getHerleitungEn(lead, lang) {
  if (lang !== 'en' || !lead.id) return lead.herleitung;
  const en = LEADS_EN[lead.id];
  return en?.herleitung ?? lead.herleitung;
}

// Quellen in gedämpften Token-Farben (Cockpit 2026): Signal- und Quellen-
// Tokens statt der bunten Tailwind-Hexwerte.
const QUELLEN_COLORS = {
  empfehlung: 'var(--color-success)',
  nextgen: 'var(--quelle-kommunikation)',
  presse: 'var(--color-warning)',
  event: 'var(--quelle-lebensereignis)',
  multiplikator: 'var(--mode-chart)',
  digital: 'var(--color-info)',
  liquiditaet: 'var(--color-danger)',
  fremdbank: 'var(--text-tertiary)',
  upgrade: 'var(--mode-chart)',
  lifeevent: 'var(--quelle-lebensereignis)',
  stiftung: 'var(--quelle-kommunikation)',
  event_einladung: 'var(--quelle-lebensereignis)',
  performance: 'var(--color-danger)',
  compliance: 'var(--text-secondary)',
};

const STADIUM_ORDER = ['lead', 'kennenlernen', 'identifiziert', 'termin', 'angebot', 'gewonnen'];

const STADIUM_COLORS = {
  lead: 'var(--text-tertiary)',
  kennenlernen: 'var(--quelle-kommunikation)',
  identifiziert: 'var(--mode-chart)',
  termin: 'var(--color-info)',
  angebot: 'var(--color-warning)',
  gewonnen: 'var(--color-success)',
};

// Getönte Fläche aus einer Token-Farbe (12 % auf Weiß) für Plaketten.
const tint = (farbe) => `color-mix(in oklab, ${farbe} 12%, white)`;

const FILTER_AKTIV = 'bg-(--mode-primary) text-white border-(--mode-primary)';
const FILTER_RUHE = 'bg-(--bg-card) text-(--text-secondary) border-(--border-medium) hover:border-(--mode-accent) hover:text-(--text-primary)';
const TH = 'py-2.5 pr-2 text-[11px] font-semibold uppercase tracking-wider text-(--text-tertiary)';

export default function PipelineLeadsTab() {
  const [kategorieFilter, setKategorieFilter] = useState('alle');
  const [statusFilter, setStatusFilter] = useState('alle');
  const [expandedLead, setExpandedLead] = useState(null);
  const { t, tn } = useTranslation();

  const kategorieTabs = [
    { id: 'alle', label: t('alleLeads') },
    { id: 'neumandat', label: t('neueMandate') },
    { id: 'bestandsmandat', label: t('bestandsmandate') },
  ];

  const stadiumLabels = {
    lead: t('stadium.lead'),
    kennenlernen: t('stadium.kennenlernen'),
    identifiziert: t('stadium.identifiziert'),
    termin: t('stadium.termin'),
    angebot: t('stadium.angebot'),
    gewonnen: t('stadium.gewonnen'),
  };

  const quellenLabels = {
    empfehlung: t('quelle.empfehlung'),
    nextgen: t('quelle.nextgen'),
    presse: t('quelle.presse'),
    event: t('quelle.event'),
    multiplikator: t('quelle.multiplikator'),
    digital: t('quelle.digital'),
    liquiditaet: t('quelle.liquiditaet'),
    fremdbank: t('quelle.fremdbank'),
    upgrade: t('quelle.upgrade'),
    lifeevent: t('quelle.lifeevent'),
    stiftung: t('quelle.stiftung'),
    event_einladung: t('quelle.event_einladung'),
    performance: t('quelle.performance'),
    compliance: t('quelle.compliance'),
  };

  // Sort leads: new leads (isNeuerLead) first, then by date
  const leads = useMemo(() => [...(VV_LEADS || [])].sort((a, b) => {
    if (a.isNeuerLead && !b.isNeuerLead) return -1;
    if (!a.isNeuerLead && b.isNeuerLead) return 1;
    return 0;
  }), []);

  const filtered = useMemo(() => leads.filter(l => {
    if (kategorieFilter !== 'alle' && l.kategorie !== kategorieFilter) return false;
    if (statusFilter !== 'alle' && l.stadium !== statusFilter) return false;
    return true;
  }), [leads, kategorieFilter, statusFilter]);

  const neumandate = useMemo(() => leads.filter(l => l.kategorie === 'neumandat'), [leads]);
  const bestandsmandate = useMemo(() => leads.filter(l => l.kategorie === 'bestandsmandat'), [leads]);

  const { stadiumCounts, pipelineSegments } = useMemo(() => {
    const counts = {};
    STADIUM_ORDER.forEach(s => { counts[s] = leads.filter(l => l.stadium === s).length; });
    const segments = STADIUM_ORDER.map(s => ({
      label: stadiumLabels[s],
      count: counts[s] || 0,
      color: STADIUM_COLORS[s],
    }));
    return { stadiumCounts: counts, pipelineSegments: segments };
  }, [leads, stadiumLabels]);

  // Calculate potential AuM by category
  const neumandatAuM = useMemo(() => neumandate.reduce((s, l) => s + (l.potentialAuM || 0), 0), [neumandate]);
  const bestandsAuM = useMemo(() => bestandsmandate.reduce((s, l) => s + (l.potentialAuM || 0), 0), [bestandsmandate]);

  return (
    <div className="space-y-3">
      {/* KPIs */}
      <div className="grid grid-cols-4 gap-3">
        <KPI icon={Users} label={t('pipelineLeads')} value={leads.length} sub={`${neumandate.length} ${t('neueMandate')}, ${bestandsmandate.length} ${t('bestand')}`} />
        <KPI icon={UserPlus} label={t('neueMandate')} value={neumandate.length} sub={formatEur(neumandatAuM) + ' ' + t('potAuM')} />
        <KPI icon={Briefcase} label={t('bestandsmandate')} value={bestandsmandate.length} sub={formatEur(bestandsAuM) + ' ' + t('potAuM')} accent />
        <KPI icon={Target} label={t('stadien')} value={Object.keys(stadiumCounts).filter(s => stadiumCounts[s] > 0).length} sub={t('aktivePhasen')} />
      </div>

      {/* Pipeline Bar */}
      <Card hover={false}>
        <h3 className="font-semibold text-(--text-primary) mb-2">{t('pipeline')}</h3>
        <PipelineBar segments={pipelineSegments} />
      </Card>

      {/* Filters */}
      <div className="flex items-center gap-4 flex-wrap">
        {/* Kategorie Tabs (prominent) */}
        <div className="flex gap-1">
          {kategorieTabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setKategorieFilter(tab.id)}
              className={clsx(
                'text-sm h-9 px-4 rounded-[10px] font-medium border transition-colors',
                kategorieFilter === tab.id ? FILTER_AKTIV : FILTER_RUHE
              )}
            >
              {tab.label}
              <span className="ml-1.5 text-xs font-mono opacity-70">
                {tab.id === 'alle' ? leads.length : tab.id === 'neumandat' ? neumandate.length : bestandsmandate.length}
              </span>
            </button>
          ))}
        </div>

        <div className="h-6 w-px bg-(--border-light)" />

        {/* Stadium filter */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <Filter size={14} className="text-(--text-tertiary)" />
          <span className="text-xs text-(--text-tertiary)">{t('stadium') + ':'}</span>
          <button
            onClick={() => setStatusFilter('alle')}
            className={clsx('text-xs px-2.5 py-1 rounded-full border transition-colors', statusFilter === 'alle' ? FILTER_AKTIV : FILTER_RUHE)}
          >
            {t('alle')}
          </button>
          {STADIUM_ORDER.map(s => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={clsx('text-xs px-2.5 py-1 rounded-full border transition-colors', statusFilter === s ? FILTER_AKTIV : FILTER_RUHE)}
            >
              {stadiumLabels[s]}
            </button>
          ))}
        </div>
      </div>

      {/* Leads Table */}
      <Card hover={false}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-(--border-light) text-left">
                <th className={clsx(TH, 'w-5')}></th>
                <th className={clsx(TH, 'w-[18%]')}>{t('lead')}</th>
                <th className={clsx(TH, 'w-[10%]')}>{t('kategorie')}</th>
                <th className={clsx(TH, 'w-[10%]')}>{t('quelle')}</th>
                <th className={clsx(TH, 'w-[10%]')}>{t('stadium')}</th>
                <th className={clsx(TH, 'w-[12%]')}>{t('potVolumen')}</th>
                <th className={clsx(TH, 'pr-0')}>{t('herkunft')}</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((lead, i) => {
                const isExpanded = expandedLead === lead.id;
                return (
                  <LeadRow
                    key={lead.id}
                    lead={lead}
                    striped={i % 2 === 1}
                    isExpanded={isExpanded}
                    onToggle={() => setExpandedLead(isExpanded ? null : lead.id)}
                    t={t}
                    tn={tn}
                    stadiumLabels={stadiumLabels}
                    quellenLabels={quellenLabels}
                  />
                );
              })}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="text-center py-8 text-sm text-(--text-tertiary)">{t('keineLeadsGefunden')}</div>
          )}
        </div>
      </Card>

      {/* Quellen-Aufschlüsselung */}
      <div className="grid grid-cols-2 gap-4">
        <QuellenKarte
          titel={t('neueMandateQuellen')}
          quellen={['empfehlung', 'nextgen', 'presse', 'event', 'multiplikator', 'digital']}
          kategorie="neumandat"
          leads={leads}
          quellenLabels={quellenLabels}
        />
        <QuellenKarte
          titel={t('bestandsmandateQuellen')}
          quellen={['liquiditaet', 'fremdbank', 'upgrade', 'lifeevent', 'stiftung', 'event_einladung', 'performance', 'compliance']}
          kategorie="bestandsmandat"
          leads={leads}
          quellenLabels={quellenLabels}
        />
      </div>
    </div>
  );
}

function QuellenKarte({ titel, quellen, kategorie, leads, quellenLabels }) {
  return (
    <Card hover={false}>
      <h4 className="font-semibold text-(--text-primary) mb-3">{titel}</h4>
      <div className="space-y-2">
        {quellen.map(q => {
          const count = leads.filter(l => l.quelle === q && l.kategorie === kategorie).length;
          if (count === 0) return null;
          return (
            <div key={q} className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: QUELLEN_COLORS[q] }} />
                <span className="text-(--text-secondary)">{quellenLabels[q]}</span>
              </div>
              <span className="text-xs text-(--text-tertiary)"><span className="font-mono">{count}</span> Lead{count !== 1 ? 's' : ''}</span>
            </div>
          );
        })}
      </div>
    </Card>
  );
}

function LeadRow({ lead, striped, isExpanded, onToggle, t, tn, stadiumLabels, quellenLabels }) {
  const { lang } = useTranslation();
  const quelleFarbe = QUELLEN_COLORS[lead.quelle] || 'var(--text-tertiary)';

  return (
    <>
      <tr
        className={clsx(
          'border-b border-(--border-light) transition-colors duration-150 cursor-pointer hover:bg-(--bg-table-hover)',
          isExpanded ? 'bg-(--bg-table-hover)' : striped && 'bg-(--bg-table-stripe)'
        )}
        onClick={onToggle}
      >
        <td className="py-2.5 pr-1 pl-1 w-5 text-(--text-tertiary)">
          {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </td>
        <td className="py-2.5 pr-2">
          <div className="font-medium flex items-center gap-2 text-(--text-primary)">
            {tn(lead.name)}
            {lead.isNeuerLead && (
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold whitespace-nowrap bg-(--tint-success) text-(--color-success)">
                {t('neuerLead')}
              </span>
            )}
          </div>
          {lead.beruf && <div className="text-[11px] text-(--text-tertiary)">{getLeadField(lead, 'beruf', lang)}</div>}
        </td>
        <td className="py-2.5 pr-2">
          <span className={clsx(
            'text-xs font-medium px-2 py-0.5 rounded-full',
            lead.kategorie === 'neumandat' ? 'bg-(--tint-info) text-(--color-info)' : 'bg-(--tint-success) text-(--color-success)'
          )}>
            {lead.kategorie === 'neumandat' ? t('neuesMandat.badge') : t('bestand')}
          </span>
        </td>
        <td className="py-2.5 pr-2">
          <span
            className="text-[10px] font-medium px-2 py-0.5 rounded-full whitespace-nowrap"
            style={{ backgroundColor: tint(quelleFarbe), color: quelleFarbe }}
          >
            {quellenLabels[lead.quelle] || lead.quelleLabel || lead.quelle}
          </span>
        </td>
        <td className="py-2.5 pr-2">
          <StadiumBadge stadium={lead.stadium} stadiumLabels={stadiumLabels} />
        </td>
        <td className="py-2.5 pr-2 font-mono text-sm text-(--text-primary)">
          {lead.geschaetztesVolumen || '–'}
        </td>
        <td className="py-2.5 text-xs truncate text-(--text-secondary)">
          {getLeadField(lead, 'herkunft', lang)}
        </td>
      </tr>
      {isExpanded && (
        <tr className="bg-(--bg-inset) border-b border-(--border-light)">
          <td colSpan={7} className="px-6 py-4">
            <div className="space-y-4">
              {/* KI-Beschreibung: weiße Fläche mit Gold-Streifen statt buntem Verlauf */}
              {lead.kiDescription && (
                <div className="bg-(--bg-card) border border-(--border-light) border-l-2 border-l-(--mode-accent) rounded-xl px-4 py-3">
                  <div className="flex items-center gap-2 mb-2">
                    <Sparkles size={14} className="text-(--mode-accent)" />
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-(--mode-primary)">{t('kiVertriebsassistent')}</span>
                  </div>
                  <p className="text-xs text-(--text-secondary) leading-relaxed">{getLeadField(lead, 'kiDescription', lang)}</p>
                </div>
              )}

              {/* Herleitung */}
              {lead.herleitung && lead.herleitung.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <h4 className="text-sm font-semibold text-(--text-primary)">{t('herleitung')}</h4>
                    {lead.quelleLabel && (
                      <span className="text-[10px] text-(--text-tertiary) bg-(--bg-card) border border-(--border-light) px-2 py-0.5 rounded-full">
                        {getLeadField(lead, 'quelleLabel', lang) || lead.quelleLabel}
                      </span>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    {getHerleitungEn(lead, lang).map((h, i) => (
                      <HerleitungRow key={i} label={h.label} value={h.value} />
                    ))}
                  </div>
                </div>
              )}

              {/* Nächster Schritt */}
              {lead.naechsterSchritt && (
                <div className="pt-2 border-t border-(--border-light)">
                  <span className="text-xs text-(--text-tertiary) font-medium">{t('naechsterSchritt') + ': '}</span>
                  <span className="text-xs text-(--text-primary) font-medium">{getLeadField(lead, 'naechsterSchritt', lang)}</span>
                </div>
              )}

              {/* Wahrscheinlichkeit */}
              {lead.wahrscheinlichkeit > 0 && (
                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-(--text-tertiary)">{t('wahrscheinlichkeit') + ':'}</span>
                  <div className="w-24 h-1.5 rounded-full overflow-hidden bg-(--bg-card) border border-(--border-light)">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{
                        width: `${lead.wahrscheinlichkeit}%`,
                        backgroundColor: lead.wahrscheinlichkeit >= 70 ? 'var(--color-success)' : lead.wahrscheinlichkeit >= 40 ? 'var(--color-warning)' : 'var(--text-tertiary)',
                      }}
                    />
                  </div>
                  <span className="text-[11px] font-mono text-(--text-secondary)">{lead.wahrscheinlichkeit}%</span>
                </div>
              )}

              {/* Aktionen */}
              {lead.naechsterSchritt && (
                <div className="flex flex-wrap gap-2 pt-2">
                  <button className="flex items-center gap-1.5 h-9 px-3 rounded-[10px] text-xs font-medium text-white bg-(--mode-primary) hover:bg-(--mode-primary-light) transition-colors">
                    <Calendar size={14} />
                    {getLeadField(lead, 'naechsterSchritt', lang)}
                  </button>
                </div>
              )}
            </div>
          </td>
        </tr>
      )}
    </>
  );
}

function KPI({ icon: Icon, label, value, sub, accent = false }) {
  return (
    <Card>
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-[10px] bg-(--mode-primary-soft) kpi-icon-box">
          <Icon size={20} style={{ color: 'var(--_fg, var(--mode-primary))' }} />
        </div>
        <div className="min-w-0">
          <div className={clsx('text-2xl font-mono font-semibold', accent ? 'text-(--mode-accent)' : 'text-(--text-primary)')}>{value}</div>
          <div className="text-xs text-(--text-secondary)">{label}</div>
          {sub && <div className="text-[11px] text-(--text-tertiary) truncate">{sub}</div>}
        </div>
      </div>
    </Card>
  );
}

const KNOWN_INSTITUTES = [
  'UBS', 'Deutsche Bank', 'Commerzbank', 'ING', 'Sparkasse', 'DKB',
  'Alte Leipziger', 'Zurich', 'Allianz', 'ERGO', 'Goldman Sachs',
  'J.P. Morgan', 'Credit Suisse', 'HSBC', 'BNP Paribas', 'Berenberg',
  'Metzler', 'Hauck & Aufhäuser', 'Bethmann Bank', 'Pictet', 'DWS',
];

function detectInstitut(text) {
  if (!text) return null;
  for (const inst of KNOWN_INSTITUTES) {
    if (text.includes(inst)) return inst;
  }
  return null;
}

function HerleitungRow({ label, value }) {
  const institut = detectInstitut(value);
  return (
    <div className="bg-(--bg-card) rounded-[10px] px-3 py-2 border border-(--border-light)">
      <span className="text-[11px] text-(--text-tertiary) block">{label}</span>
      <span className="text-(--text-primary) font-medium flex items-center gap-1.5 text-sm">
        {institut && <LogoImg name={institut} size={16} />}
        {value}
      </span>
    </div>
  );
}

function StadiumBadge({ stadium, stadiumLabels }) {
  const farbe = STADIUM_COLORS[stadium] || STADIUM_COLORS.lead;
  return (
    <span
      className="text-[10px] font-medium px-2 py-0.5 rounded-full whitespace-nowrap"
      style={{ backgroundColor: tint(farbe), color: farbe }}
    >
      {stadiumLabels[stadium] || stadium}
    </span>
  );
}
