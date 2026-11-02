import { VV_FAMILIE } from '../../../data/vvDataProvider';
import { formatEur } from '../../../utils/formatters';
import { Users, Building2, AlertTriangle, CheckCircle, Briefcase, Award, TrendingUp, Crown, UserPlus } from 'lucide-react';
import { clsx } from 'clsx';
import useTranslation from '../../../i18n/useTranslation';
import Card from '../../../components/ui/Card';

// ─── Person card in orgchart ───
function PersonCard({ person, isCenter = false, t }) {
  const hasMandant = person.istMandant;
  const isLead = person.istLead;

  return (
    <div className={clsx(
      'relative bg-(--bg-card) rounded-xl border p-3 text-center min-w-[160px] max-w-[200px] transition-all',
      hasMandant ? 'border-(--mode-primary-light)' : isLead ? 'border-(--color-info)' : 'border-(--border-light)',
      isCenter && 'ring-2 ring-offset-2 ring-(--mode-primary-soft)',
    )}>
      {/* Avatar circle */}
      <div className={clsx(
        'w-10 h-10 rounded-full mx-auto mb-2 flex items-center justify-center text-white text-sm font-semibold',
        hasMandant ? 'bg-(--mode-primary)' : isLead ? 'bg-(--color-info)' : 'bg-(--text-tertiary)',
      )}>
        {person.name.split(' ').map(n => n[0]).slice(0, 2).join('')}
      </div>
      <div className="text-sm font-semibold text-(--text-primary) leading-tight">{person.name}</div>
      {person.alter != null && person.alter > 0 && (
        <div className="text-xs text-(--text-tertiary) mt-0.5">{person.alter} {t('jahre')}</div>
      )}
      <div className="text-xs text-(--text-secondary) mt-0.5">{person.beruf}</div>

      {/* Badges */}
      <div className="flex flex-wrap justify-center gap-1 mt-2">
        {hasMandant && person.mandat && (
          <span className="inline-flex items-center gap-0.5 text-[10px] font-medium text-(--mode-primary) bg-(--mode-pastel) px-1.5 py-0.5 rounded-full">
            <Crown size={10} /> {person.mandat}
          </span>
        )}
        {isLead && (
          <span className="inline-flex items-center gap-0.5 text-[10px] font-medium text-(--color-info) bg-(--tint-info) px-1.5 py-0.5 rounded-full">
            <TrendingUp size={10} /> NEXTGEN-LEAD
          </span>
        )}
      </div>
    </div>
  );
}

// ─── Connection line helper ───
function VerticalLine({ color = 'border-(--border-medium)' }) {
  return <div className={clsx('w-0 h-6 border-l-2 mx-auto', color)} />;
}

function HorizontalConnector({ count }) {
  if (count <= 1) return null;
  return (
    <div className="relative h-4 mx-8">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full border-t-2 border-(--border-medium)" />
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="absolute top-0 w-0 h-4 border-l-2 border-(--border-medium)"
          style={{ left: `${(i / (count - 1)) * 100}%` }}
        />
      ))}
    </div>
  );
}

// ─── Section wrapper ───
function Section({ title, icon: Icon, children }) {
  return (
    <Card hover={false}>
      <div className="flex items-center gap-2 mb-4">
        {Icon && <Icon size={18} className="text-(--mode-accent)" strokeWidth={1.75} />}
        <h3 className="font-semibold text-(--text-primary)">{title}</h3>
      </div>
      {children}
    </Card>
  );
}

// ─── Main component ───
export default function FamilieNetzwerkTab({ kunde }) {
  const { t } = useTranslation();
  const data = VV_FAMILIE[kunde?.id];

  if (!data) {
    return (
      <div className="space-y-4">
        <Card hover={false}>
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-16 h-16 rounded-full bg-(--bg-inset) flex items-center justify-center mb-4">
              <Users className="w-8 h-8 text-(--text-tertiary)" />
            </div>
            <h3 className="font-semibold text-(--text-primary) mb-1">{t('familiendatenNichtVerfuegbar')}</h3>
            <p className="text-sm text-(--text-tertiary) max-w-md">
              {t('familiendatenFehlen', { name: kunde?.name || t('diesenMandanten') })}
            </p>
          </div>
        </Card>
      </div>
    );
  }

  const mitglieder = data.mitglieder || [];
  const mandant = mitglieder.find(m => m.rolle === 'Mandant' || m.rolle === 'Mandant (Institution)' || m.rolle === 'Client' || m.rolle === 'Client (Institution)');
  const partner = mitglieder.find(m => m.rolle === 'Ehepartnerin' || m.rolle === 'Ehefrau' || m.rolle === 'Partner' || m.rolle === 'Spouse');
  const kinder = mitglieder.filter(m => m.rolle === 'Sohn' || m.rolle === 'Tochter' || m.rolle === 'Kind' || m.rolle === 'Son' || m.rolle === 'Daughter' || m.rolle === 'Child');
  const unt = data.unternehmen;

  return (
    <div className="space-y-4">
      {/* 1. Familien-Orgchart */}
      <Section title={t('familienOrgchart')} icon={Users}>
        <div className="flex flex-col items-center">
          {/* Top row: Mandant + Partner */}
          <div className="flex items-start justify-center gap-8">
            {mandant && <PersonCard person={mandant} isCenter t={t} />}
            {partner && (
              <>
                <div className="flex items-center self-center">
                  <div className="w-8 border-t-2 border-dashed border-(--border-medium)" />
                  <span className="text-[10px] text-(--text-tertiary) px-1">{t('partner')}</span>
                  <div className="w-8 border-t-2 border-dashed border-(--border-medium)" />
                </div>
                <PersonCard person={partner} t={t} />
              </>
            )}
          </div>

          {/* Vertical connection to children */}
          {kinder.length > 0 && (
            <>
              <VerticalLine color="border-(--border-medium)" />
              {kinder.length > 1 && (
                <div className="relative w-full max-w-md">
                  <div className="border-t-2 border-(--border-medium) mx-auto" style={{ width: `${Math.min(80, kinder.length * 30)}%` }} />
                </div>
              )}
              <div className="flex justify-center gap-6 mt-1">
                {kinder.map((k, i) => (
                  <div key={i} className="flex flex-col items-center">
                    {kinder.length > 1 && <VerticalLine color="border-(--border-medium)" />}
                    <PersonCard person={k} t={t} />
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Gesamt-AuM + Potenzial footer */}
        <div className="flex items-center justify-center gap-6 mt-6 pt-4 border-t border-(--border-light)">
          <div className="text-center">
            <div className="text-[11px] text-(--text-tertiary) uppercase tracking-wider">{t('gesamtAumFamilie')}</div>
            <div className="text-xl font-semibold font-mono text-(--mode-accent)">{formatEur(data.gesamtAuM)}</div>
          </div>
          {data.potenzial && (
            <div className="text-center">
              <div className="text-[11px] text-(--text-tertiary) uppercase tracking-wider">{t('potenzialLabel')}</div>
              <div className="text-xl font-semibold font-mono text-(--color-success)">{data.potenzial}</div>
            </div>
          )}
        </div>
      </Section>

      {/* 2. Unternehmens-Orgchart */}
      {unt && (
        <Section title={t('unternehmensOrgchart')} icon={Building2}>
          {/* Company header */}
          <div className="surface-inset rounded-xl p-4 mb-4">
            <div className="flex items-start justify-between">
              <div>
                <div className="text-base font-bold text-(--text-primary)">{unt.name}</div>
                <div className="text-xs text-(--text-secondary) mt-1">{unt.branche}</div>
              </div>
              {unt.nachfolge && unt.nachfolge.status === 'offen' && (
                <span className="inline-flex items-center gap-1 text-xs font-medium text-(--color-warning) bg-(--tint-warning) px-2 py-1 rounded-full">
                  <AlertTriangle size={12} /> {t('nachfolgeOffen')}
                </span>
              )}
              {unt.nachfolge && unt.nachfolge.status === 'abgeschlossen' && (
                <span className="inline-flex items-center gap-1 text-xs font-medium text-(--color-success) bg-(--tint-success) px-2 py-1 rounded-full">
                  <CheckCircle size={12} /> {t('nachfolgeAbgeschlossen')}
                </span>
              )}
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-3">
              <div>
                <div className="text-xs text-(--text-tertiary)">{t('umsatzLabel')}</div>
                <div className="text-sm font-semibold font-mono text-(--text-primary)">{unt.umsatz}</div>
              </div>
              <div>
                <div className="text-xs text-(--text-tertiary)">{t('mitarbeiterLabel')}</div>
                <div className="text-sm font-semibold font-mono text-(--text-primary)">{unt.mitarbeiter}</div>
              </div>
              <div>
                <div className="text-xs text-(--text-tertiary)">{t('standortLabel')}</div>
                <div className="text-sm font-semibold text-(--text-primary)">{unt.standort}</div>
              </div>
              <div>
                <div className="text-xs text-(--text-tertiary)">{t('geschWert')}</div>
                <div className="text-sm font-semibold font-mono text-(--text-primary)">{unt.geschaetzterWert}</div>
              </div>
            </div>
          </div>

          {/* Positions tree */}
          {unt.positionen && unt.positionen.length > 0 && (
            <div className="space-y-2 mb-4">
              <div className="text-[11px] text-(--text-tertiary) font-medium uppercase tracking-wider">{t('positionen')}</div>
              {unt.positionen.map((pos, i) => (
                <div key={i} className="flex items-center gap-3 py-1.5 px-3 bg-(--bg-inset) rounded-lg">
                  <div className="w-7 h-7 rounded-full bg-(--text-tertiary) flex items-center justify-center text-white text-[10px] font-semibold">
                    {pos.name.split(' ').map(n => n[0]).slice(0, 2).join('')}
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-medium text-(--text-primary)">{pos.name}</div>
                    <div className="text-xs text-(--text-tertiary)">{pos.rolle}</div>
                  </div>
                  {pos.anteil && (
                    <span className="text-xs font-medium text-(--text-secondary) bg-white px-2 py-0.5 rounded border border-(--border-light)">
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
              'rounded-lg p-3 border border-(--border-light)',
              unt.nachfolge.status === 'offen' ? 'bg-(--tint-warning)' : 'bg-(--tint-success)',
            )}>
              <div className="flex items-center gap-1.5 mb-1">
                {unt.nachfolge.status === 'offen' ? (
                  <AlertTriangle size={14} className="text-(--color-warning)" />
                ) : (
                  <CheckCircle size={14} className="text-(--color-success)" />
                )}
                <span className={clsx(
                  'text-xs font-semibold',
                  unt.nachfolge.status === 'offen' ? 'text-(--color-warning)' : 'text-(--color-success)',
                )}>
                  {t('nachfolgeStatus')}: {unt.nachfolge.status === 'offen' ? t('nachfolgeOffen') : t('nachfolgeAbgeschlossen')}
                </span>
              </div>
              <p className={clsx(
                'text-xs leading-relaxed',
                'text-(--text-primary)',
              )}>
                {unt.nachfolge.details}
              </p>
            </div>
          )}
        </Section>
      )}

      {/* 3. Weitere Mandate / Beteiligungen */}
      {((data.weitereMandate && data.weitereMandate.length > 0) || (data.peBeteiligungen && data.peBeteiligungen.length > 0)) && (
        <Section title={t('weitereMandateBeteiligungen')} icon={Award}>
          {/* Mandate list */}
          {data.weitereMandate && data.weitereMandate.length > 0 && (
            <div className="mb-4">
              <div className="text-[11px] text-(--text-tertiary) font-medium uppercase tracking-wider mb-2">{t('mandateGremien')}</div>
              <div className="space-y-1.5">
                {data.weitereMandate.map((m, i) => (
                  <div key={i} className="flex items-center justify-between py-1.5 px-3 bg-(--bg-inset) rounded-lg">
                    <div className="flex items-center gap-2">
                      <Briefcase size={14} className="text-(--text-tertiary)" />
                      <div>
                        <span className="text-sm text-(--text-primary) font-medium">{m.organisation || m.name}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-(--text-secondary) bg-white px-2 py-0.5 rounded border border-(--border-light)">
                        {m.typ || m.art}
                      </span>
                      {m.seit && (
                        <span className="text-xs text-(--text-tertiary)">{t('seitLabel')} {m.seit}</span>
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
              <div className="text-[11px] text-(--text-tertiary) font-medium uppercase tracking-wider mb-2">{t('peBeteiligungen')}</div>
              <div className="space-y-1.5">
                {data.peBeteiligungen.map((pe, i) => (
                  <div key={i} className="flex items-center justify-between py-1.5 px-3 bg-(--bg-inset) rounded-lg">
                    <div className="flex items-center gap-2">
                      <TrendingUp size={14} className="text-(--text-tertiary)" />
                      <span className="text-sm text-(--text-primary) font-medium">{pe.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-mono font-medium text-(--text-primary)">{formatEur(pe.committed)}</span>
                      {pe.jahr && <span className="text-xs text-(--text-tertiary)">{pe.jahr}</span>}
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
