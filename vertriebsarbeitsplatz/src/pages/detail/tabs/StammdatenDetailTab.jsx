import Card from '../../../components/ui/Card';
import DataTable from '../../../components/ui/DataTable';
import { StatusBadge, SparteBadge } from '../../../components/ui/Badge';
import { formatEur, formatPct, berechneHaushaltsnetto, berechneAbsicherungsquote, berechneSparquote, berechneFrei, potentialSterne } from '../../../utils/formatters';
import { User, Wallet, Linkedin, Star, ChevronDown } from 'lucide-react';
import { useState } from 'react';

export default function StammdatenDetailTab({ kunde }) {
  const [risikoExpanded, setRisikoExpanded] = useState(false);
  const haushalt = berechneHaushaltsnetto(kunde);
  const absQuote = berechneAbsicherungsquote(kunde);
  const sparQuote = berechneSparquote(kunde);
  const frei = berechneFrei(kunde);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        {/* Persoenliche Daten */}
        <Card>
          <div className="flex items-center gap-2 mb-4">
            <User size={20} className="text-slate-500" strokeWidth={1.75} />
            <h3 className="font-semibold text-slate-800">Persoenliche Daten</h3>
          </div>
          <div className="space-y-2 text-sm">
            <InfoRow label="Name" value={`${kunde.name}, ${kunde.alter}`} />
            <InfoRow label="Beruf" value={kunde.beruf} />
            <InfoRow label="Familienstand" value={kunde.familienstand} />
            {kunde.partner && (
              <InfoRow label="Partner" value={`${kunde.partner.name} (${kunde.partner.beruf})`} />
            )}
            {kunde.kinder?.length > 0 && (
              <InfoRow label="Kinder" value={kunde.kinder.map(k => `${k.name} (${k.alter})`).join(', ')} />
            )}
            <InfoRow label="Wohnsituation" value={`${kunde.wohnsituation}, ${kunde.wohnflaeche}qm`} />
            {kunde.linkedin && (
              <div className="flex items-center gap-2 pt-2 border-t border-slate-100 mt-2">
                <Linkedin size={14} className="text-blue-600" />
                <span className="text-slate-500">LinkedIn: {kunde.linkedin.kontakte}+ Kontakte</span>
                <span className="text-slate-400">&middot; {kunde.linkedin.branchen?.join(', ')}</span>
              </div>
            )}
          </div>
        </Card>

        {/* Finanzuebersicht */}
        <Card>
          <div className="flex items-center gap-2 mb-4">
            <Wallet size={20} className="text-slate-500" strokeWidth={1.75} />
            <h3 className="font-semibold text-slate-800">Finanzuebersicht</h3>
          </div>
          <div className="space-y-2 text-sm">
            <InfoRow label="Haushaltsnetto" value={`${formatEur(haushalt)}/mtl.`} />
            <InfoRow label="Absicherungsquote" value={formatPct(absQuote)} />
            <InfoRow label="Sparquote" value={formatPct(sparQuote)} />
            <InfoRow label="Frei verfuegbar" value={`${formatEur(frei)}/mtl.`} />
            <div className="pt-2 border-t border-slate-100 mt-2">
              <div className="flex justify-between items-center cursor-pointer" onClick={() => setRisikoExpanded(!risikoExpanded)}>
                <span className="text-slate-400">Risikoscore</span>
                <span className="flex items-center gap-1">
                  <span className="text-slate-700 font-medium">{kunde.risikoscore} ({kunde.risikoscore < 30 ? 'Niedrig' : kunde.risikoscore < 50 ? 'Mittel' : 'Hoch'})</span>
                  <ChevronDown size={14} className={`text-slate-400 transition-transform ${risikoExpanded ? 'rotate-180' : ''}`} />
                </span>
              </div>
              {risikoExpanded && (
                <div className="mt-2 pl-4 space-y-1 text-xs text-slate-500 animate-fade-in">
                  <div>Bonitaet: {kunde.risikoscore < 30 ? 'Gut' : 'Mittel'}</div>
                  <div>Zahlungsverhalten: Regelmaessig</div>
                  <div>Abwanderungsrisiko: {kunde.abwanderungsrisiko}</div>
                </div>
              )}
            </div>
            <InfoRow label="NPS" value={`${kunde.nps}/10`} />
            <InfoRow label="CLV" value={formatEur((kunde.eigeneProdukte?.reduce((s, p) => s + (p.praemie || 0), 0) || 0) * 10)} />
            <div className="flex justify-between">
              <span className="text-slate-400">Potenzial-Score</span>
              <div className="flex items-center gap-1">
                {Array(potentialSterne(kunde.potentialScore || 0).full).fill(0).map((_, i) => (
                  <Star key={i} size={14} className="text-amber-400 fill-amber-400" />
                ))}
                <span className="text-slate-700 font-medium ml-1">{kunde.potentialScore}</span>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Eigene Produkte */}
      <Card>
        <h3 className="font-semibold text-slate-800 mb-4">
          Eigene Produkte ({kunde.eigeneProdukte?.length || 0} Vertraege)
        </h3>
        {kunde.eigeneProdukte?.length > 0 ? (
          <DataTable
            columns={[
              { id: 'produkt', label: 'Produkt' },
              { id: 'sparte', label: 'Sparte', render: v => v ? <SparteBadge sparte={v} /> : '-' },
              { id: 'details', label: 'Details' },
              { id: 'praemie', label: 'Praemie/J.', render: v => <span className="font-mono">{formatEur(v)}</span> },
              { id: 'seit', label: 'Seit' },
              { id: 'status', label: 'Status', render: v => <StatusBadge status={v} /> },
            ]}
            data={kunde.eigeneProdukte}
          />
        ) : (
          <div className="text-sm text-slate-400 py-4 text-center">Keine eigenen Produkte</div>
        )}
      </Card>

      {/* Fremdprodukte */}
      <Card>
        <h3 className="font-semibold text-slate-800 mb-4">
          Fremdprodukte (Open Finance / FIDA) ({kunde.fremdProdukte?.length || 0} Produkte)
        </h3>
        {kunde.fremdProdukte?.length > 0 ? (
          <DataTable
            columns={[
              { id: 'typ', label: 'Produkt' },
              { id: 'institut', label: 'Institut' },
              { id: 'details', label: 'Details' },
              { id: 'volumen', label: 'Volumen', render: v => <span className="font-mono">{formatEur(v)}</span> },
              { id: 'consent', label: 'Consent', render: v => (
                <span className={v ? 'text-emerald-600' : 'text-slate-400'}>{v ? '\u2713' : '\u2717'}</span>
              )},
            ]}
            data={kunde.fremdProdukte}
          />
        ) : (
          <div className="text-sm text-slate-400 py-4 text-center">Keine Fremdprodukte bekannt</div>
        )}
      </Card>
    </div>
  );
}

function InfoRow({ label, value }) {
  return (
    <div className="flex justify-between">
      <span className="text-slate-400">{label}</span>
      <span className="text-slate-700 font-medium text-right max-w-[60%]">{value}</span>
    </div>
  );
}
