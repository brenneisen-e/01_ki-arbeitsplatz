import { VV_FAMILIE } from '../../../data/vvExtended';
import { formatEur } from '../../../utils/formatters';
import { Users, Building2, AlertTriangle, CheckCircle, Briefcase, Award, TrendingUp, Crown, UserPlus } from 'lucide-react';
import { clsx } from 'clsx';

// ─── Person card in orgchart ───
function PersonCard({ person, isCenter = false }) {
  const hasMandant = person.istMandant;
  const isLead = person.istLead;

  return (
    <div className={clsx(
      'relative bg-white rounded-xl border-2 p-3 text-center min-w-[160px] max-w-[200px] transition-all',
      hasMandant ? 'border-emerald-300 shadow-sm' : isLead ? 'border-blue-300 shadow-sm' : 'border-slate-200',
      isCenter && 'ring-2 ring-offset-2 ring-slate-300',
    )}>
      {/* Avatar circle */}
      <div className={clsx(
        'w-10 h-10 rounded-full mx-auto mb-2 flex items-center justify-center text-white text-sm font-bold',
        hasMandant ? 'bg-emerald-500' : isLead ? 'bg-blue-500' : 'bg-slate-400',
      )}>
        {person.name.split(' ').map(n => n[0]).slice(0, 2).join('')}
      </div>
      <div className="text-sm font-semibold text-slate-800 leading-tight">{person.name}</div>
      {person.alter != null && person.alter > 0 && (
        <div className="text-xs text-slate-400 mt-0.5">{person.alter} Jahre</div>
      )}
      <div className="text-xs text-slate-500 mt-0.5">{person.beruf}</div>

      {/* Badges */}
      <div className="flex flex-wrap justify-center gap-1 mt-2">
        {hasMandant && person.mandat && (
          <span className="inline-flex items-center gap-0.5 text-[10px] font-medium text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded-full border border-emerald-200">
            <Crown size={10} /> {person.mandat}
          </span>
        )}
        {isLead && (
          <span className="inline-flex items-center gap-0.5 text-[10px] font-medium text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded-full border border-blue-200">
            <TrendingUp size={10} /> NEXTGEN-LEAD
          </span>
        )}
      </div>
    </div>
  );
}

// ─── Connection line helper ───
function VerticalLine({ color = 'border-slate-300' }) {
  return <div className={clsx('w-0 h-6 border-l-2 mx-auto', color)} />;
}

function HorizontalConnector({ count }) {
  if (count <= 1) return null;
  return (
    <div className="relative h-4 mx-8">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full border-t-2 border-slate-300" />
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="absolute top-0 w-0 h-4 border-l-2 border-slate-300"
          style={{ left: `${(i / (count - 1)) * 100}%` }}
        />
      ))}
    </div>
  );
}

// ─── Section wrapper ───
function Section({ title, icon: Icon, children }) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5" style={{ boxShadow: 'var(--card-shadow)' }}>
      <div className="flex items-center gap-2 mb-4">
        {Icon && <Icon size={18} className="text-slate-500" strokeWidth={1.75} />}
        <h3 className="font-semibold text-slate-800">{title}</h3>
      </div>
      {children}
    </div>
  );
}

// ─── Main component ───
export default function FamilieNetzwerkTab({ kunde }) {
  const data = VV_FAMILIE[kunde?.id];

  if (!data) {
    return (
      <div className="space-y-4">
        <div className="bg-white rounded-xl border border-slate-200 p-5" style={{ boxShadow: 'var(--card-shadow)' }}>
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mb-4">
              <Users className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="font-semibold text-slate-700 mb-1">Familiendaten nicht verfügbar</h3>
            <p className="text-sm text-slate-400 max-w-md">
              Für {kunde?.name || 'diesen Mandanten'} liegen keine Familien- und Netzwerkdaten vor.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const mitglieder = data.mitglieder || [];
  const mandant = mitglieder.find(m => m.rolle === 'Mandant' || m.rolle === 'Mandant (Institution)');
  const partner = mitglieder.find(m => m.rolle === 'Ehepartnerin' || m.rolle === 'Ehefrau' || m.rolle === 'Partner');
  const kinder = mitglieder.filter(m => m.rolle === 'Sohn' || m.rolle === 'Tochter' || m.rolle === 'Kind');
  const unt = data.unternehmen;

  return (
    <div className="space-y-4">
      {/* 1. Familien-Orgchart */}
      <Section title="Familien-Orgchart" icon={Users}>
        <div className="flex flex-col items-center">
          {/* Top row: Mandant + Partner */}
          <div className="flex items-start justify-center gap-8">
            {mandant && <PersonCard person={mandant} isCenter />}
            {partner && (
              <>
                <div className="flex items-center self-center">
                  <div className="w-8 border-t-2 border-dashed border-rose-300" />
                  <span className="text-[10px] text-rose-400 px-1">Partner</span>
                  <div className="w-8 border-t-2 border-dashed border-rose-300" />
                </div>
                <PersonCard person={partner} />
              </>
            )}
          </div>

          {/* Vertical connection to children */}
          {kinder.length > 0 && (
            <>
              <VerticalLine color="border-slate-300" />
              {kinder.length > 1 && (
                <div className="relative w-full max-w-md">
                  <div className="border-t-2 border-slate-300 mx-auto" style={{ width: `${Math.min(80, kinder.length * 30)}%` }} />
                </div>
              )}
              <div className="flex justify-center gap-6 mt-1">
                {kinder.map((k, i) => (
                  <div key={i} className="flex flex-col items-center">
                    {kinder.length > 1 && <VerticalLine color="border-slate-300" />}
                    <PersonCard person={k} />
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Gesamt-AuM + Potenzial footer */}
        <div className="flex items-center justify-center gap-6 mt-6 pt-4 border-t border-slate-100">
          <div className="text-center">
            <div className="text-[10px] text-slate-400 uppercase tracking-wider">Gesamt-AuM Familie</div>
            <div className="text-lg font-bold font-mono text-slate-800">{formatEur(data.gesamtAuM)}</div>
          </div>
          {data.potenzial && (
            <div className="text-center">
              <div className="text-[10px] text-slate-400 uppercase tracking-wider">Potenzial</div>
              <div className="text-lg font-bold font-mono text-emerald-600">{data.potenzial}</div>
            </div>
          )}
        </div>
      </Section>

      {/* 2. Unternehmens-Orgchart */}
      {unt && (
        <Section title="Unternehmens-Orgchart" icon={Building2}>
          {/* Company header */}
          <div className="bg-slate-50 rounded-xl p-4 mb-4">
            <div className="flex items-start justify-between">
              <div>
                <div className="text-base font-bold text-slate-800">{unt.name}</div>
                <div className="text-xs text-slate-500 mt-1">{unt.branche}</div>
              </div>
              {unt.nachfolge && unt.nachfolge.status === 'offen' && (
                <span className="inline-flex items-center gap-1 text-xs font-medium text-amber-700 bg-amber-50 px-2 py-1 rounded-full border border-amber-200">
                  <AlertTriangle size={12} /> Nachfolge offen
                </span>
              )}
              {unt.nachfolge && unt.nachfolge.status === 'abgeschlossen' && (
                <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-700 bg-emerald-50 px-2 py-1 rounded-full border border-emerald-200">
                  <CheckCircle size={12} /> Abgeschlossen
                </span>
              )}
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-3">
              <div>
                <div className="text-[10px] text-slate-400">Umsatz</div>
                <div className="text-sm font-semibold text-slate-700">{unt.umsatz}</div>
              </div>
              <div>
                <div className="text-[10px] text-slate-400">Mitarbeiter</div>
                <div className="text-sm font-semibold text-slate-700">{unt.mitarbeiter}</div>
              </div>
              <div>
                <div className="text-[10px] text-slate-400">Standort</div>
                <div className="text-sm font-semibold text-slate-700">{unt.standort}</div>
              </div>
              <div>
                <div className="text-[10px] text-slate-400">Gesch. Wert</div>
                <div className="text-sm font-semibold text-slate-700">{unt.geschaetzterWert}</div>
              </div>
            </div>
          </div>

          {/* Positions tree */}
          {unt.positionen && unt.positionen.length > 0 && (
            <div className="space-y-2 mb-4">
              <div className="text-xs text-slate-400 font-medium uppercase tracking-wider">Positionen</div>
              {unt.positionen.map((pos, i) => (
                <div key={i} className="flex items-center gap-3 py-1.5 px-3 bg-slate-50 rounded-lg">
                  <div className="w-7 h-7 rounded-full bg-slate-300 flex items-center justify-center text-white text-[10px] font-bold">
                    {pos.name.split(' ').map(n => n[0]).slice(0, 2).join('')}
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-medium text-slate-700">{pos.name}</div>
                    <div className="text-xs text-slate-400">{pos.rolle}</div>
                  </div>
                  {pos.anteil && (
                    <span className="text-xs font-medium text-slate-500 bg-white px-2 py-0.5 rounded border border-slate-200">
                      {pos.anteil}
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Nachfolge-Status */}
          {unt.nachfolge && (
            <div className={clsx(
              'rounded-lg p-3 border',
              unt.nachfolge.status === 'offen' ? 'bg-amber-50 border-amber-200' : 'bg-emerald-50 border-emerald-200',
            )}>
              <div className="flex items-center gap-1.5 mb-1">
                {unt.nachfolge.status === 'offen' ? (
                  <AlertTriangle size={14} className="text-amber-600" />
                ) : (
                  <CheckCircle size={14} className="text-emerald-600" />
                )}
                <span className={clsx(
                  'text-xs font-semibold',
                  unt.nachfolge.status === 'offen' ? 'text-amber-700' : 'text-emerald-700',
                )}>
                  Nachfolge-Status: {unt.nachfolge.status === 'offen' ? 'Offen' : 'Abgeschlossen'}
                </span>
              </div>
              <p className={clsx(
                'text-xs leading-relaxed',
                unt.nachfolge.status === 'offen' ? 'text-amber-800' : 'text-emerald-800',
              )}>
                {unt.nachfolge.details}
              </p>
            </div>
          )}
        </Section>
      )}

      {/* 3. Weitere Mandate / Beteiligungen */}
      {((data.weitereMandate && data.weitereMandate.length > 0) || (data.peBeteiligungen && data.peBeteiligungen.length > 0)) && (
        <Section title="Weitere Mandate / Beteiligungen" icon={Award}>
          {/* Mandate list */}
          {data.weitereMandate && data.weitereMandate.length > 0 && (
            <div className="mb-4">
              <div className="text-xs text-slate-400 font-medium uppercase tracking-wider mb-2">Mandate & Gremien</div>
              <div className="space-y-1.5">
                {data.weitereMandate.map((m, i) => (
                  <div key={i} className="flex items-center justify-between py-1.5 px-3 bg-slate-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Briefcase size={14} className="text-slate-400" />
                      <div>
                        <span className="text-sm text-slate-700 font-medium">{m.organisation || m.name}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-slate-500 bg-white px-2 py-0.5 rounded border border-slate-200">
                        {m.typ || m.art}
                      </span>
                      {m.seit && (
                        <span className="text-xs text-slate-400">seit {m.seit}</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* PE-Beteiligungen */}
          {data.peBeteiligungen && data.peBeteiligungen.length > 0 && (
            <div>
              <div className="text-xs text-slate-400 font-medium uppercase tracking-wider mb-2">PE-Beteiligungen</div>
              <div className="space-y-1.5">
                {data.peBeteiligungen.map((pe, i) => (
                  <div key={i} className="flex items-center justify-between py-1.5 px-3 bg-slate-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <TrendingUp size={14} className="text-slate-400" />
                      <span className="text-sm text-slate-700 font-medium">{pe.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-mono font-medium text-slate-700">{formatEur(pe.committed)}</span>
                      {pe.jahr && <span className="text-xs text-slate-400">{pe.jahr}</span>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </Section>
      )}
    </div>
  );
}
