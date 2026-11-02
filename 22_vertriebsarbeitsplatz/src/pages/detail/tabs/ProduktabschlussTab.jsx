import { useState } from 'react';
import { getLang } from '../../../utils/langHelper';
import Card from '../../../components/ui/Card';
import { clsx } from 'clsx';
import { ShoppingCart, AlertTriangle, CheckCircle, Clock, XCircle, ChevronDown, ChevronUp, ArrowRight, User, CreditCard, FileText, Fingerprint, PenTool } from 'lucide-react';
import { formatDatum } from '../../../utils/formatters';
import useTranslation from '../../../i18n/useTranslation';

// Für Demo-Zwecke verschieben wir Anträge mit `dynamicDaysAgo` auf
// (heute − X Tage), damit der "abgebrochene Online-Antrag" immer realistisch
// relativ zum heutigen Datum ist. Die Uhrzeit der einzelnen Schritte bleibt
// erhalten, die Datumsreferenz wird proportional mitverschoben.
function applyDynamicDates(antrag) {
  if (!antrag?.dynamicDaysAgo || !antrag?.datum) return antrag;
  const original = new Date(antrag.datum);
  if (Number.isNaN(original.getTime())) return antrag;
  const target = new Date();
  target.setHours(0, 0, 0, 0);
  target.setDate(target.getDate() - antrag.dynamicDaysAgo);
  const deltaMs = target.getTime() - new Date(original.getFullYear(), original.getMonth(), original.getDate()).getTime();
  const shift = (iso) => {
    if (!iso) return iso;
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return iso;
    return new Date(d.getTime() + deltaMs).toISOString();
  };
  return {
    ...antrag,
    datum: target.toISOString().slice(0, 10),
    schritte: (antrag.schritte || []).map(s => s.datum ? { ...s, datum: shift(s.datum) } : s),
  };
}

const SCHRITT_ICONS_BY_KEY = {
  'kreditrechner': CreditCard,
  'persoenlicheDaten': User,
  'einkommensangaben': FileText,
  'kontoverbindung': CreditCard,
  'legitimation': Fingerprint,
  'legitimationVideoIdent': Fingerprint,
  'unterschrift': PenTool,
  // Insurance-Strecke
  'tarifrechner': CreditCard,
  'versicherungsumfang': FileText,
  'beguenstigung': User,
  'gesundheitsfragen': FileText,
};

const SCHRITT_NAME_TO_KEY = {
  'Kreditrechner': 'kreditrechner',
  'Pers\u00f6nliche Daten': 'persoenlicheDaten',
  'Einkommensangaben': 'einkommensangaben',
  'Kontoverbindung': 'kontoverbindung',
  'Legitimation': 'legitimation',
  'Legitimation (VideoIdent)': 'legitimationVideoIdent',
  'Unterschrift': 'unterschrift',
  // Insurance-Strecke
  'Tarifrechner': 'tarifrechner',
  'Versicherungsumfang': 'versicherungsumfang',
  'Beg\u00fcnstigung': 'beguenstigung',
  'Gesundheitsfragen': 'gesundheitsfragen',
};

export default function ProduktabschlussTab({ kunde }) {
  const { t } = useTranslation();
  const STATUS_CONFIG = {
    abgeschlossen: { icon: CheckCircle, color: 'text-(--color-success)', bg: 'bg-(--tint-success)', label: t('abgeschlossen') },
    abgebrochen: { icon: XCircle, color: 'text-(--color-danger)', bg: 'bg-(--tint-danger)', label: t('abgebrochen') },
    offen: { icon: Clock, color: 'text-(--text-tertiary)', bg: 'bg-(--bg-inset)', label: t('statusOffen') },
  };
  const abschluesse = (kunde.produktabschluss || []).map(applyDynamicDates);
  // Mode-aware summary: if every open application is insurance-style, show
  // Versicherungssumme/Beitrag instead of Kreditvolumen.
  const istVersicherung = abschluesse.length > 0 && abschluesse.every(a => a.kategorie === 'versicherung');

  if (abschluesse.length === 0) {
    return (
      <Card hover={false}>
        <div className="text-center py-12 text-(--text-tertiary)">
          <ShoppingCart size={32} className="mx-auto mb-3 opacity-50" />
          <p className="text-sm">{t('keineOffenenProduktabschluesse')}</p>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Summary */}
      <div className="grid grid-cols-3 gap-3">
        <Card className="p-4" padding={false}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-(--tint-warning) flex items-center justify-center">
              <AlertTriangle size={20} className="text-(--color-warning)" strokeWidth={1.75} />
            </div>
            <div>
              <div className="font-mono text-[28px] leading-none font-semibold text-(--text-primary)">{abschluesse.filter(a => a.status === 'abgebrochen').length}</div>
              <div className="text-xs text-(--text-tertiary) mt-1.5">{t('abgebrocheneAntraege')}</div>
            </div>
          </div>
        </Card>
        <Card className="p-4" padding={false}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-(--mode-pastel) flex items-center justify-center">
              <CreditCard size={20} className="text-(--mode-primary)" strokeWidth={1.75} />
            </div>
            <div>
              <div className="font-mono text-[28px] leading-none font-semibold text-(--text-primary)">
                {abschluesse.reduce((sum, a) => sum + (a.details?.versicherungssumme || a.details?.betrag || 0), 0).toLocaleString(getLang() === 'en' ? 'en-US' : 'de-DE')}€
              </div>
              <div className="text-xs text-(--text-tertiary) mt-1.5">{istVersicherung ? t('versicherungssummeGesamt') : t('kreditvolumenGesamt')}</div>
            </div>
          </div>
        </Card>
        <Card className="p-4" padding={false}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-(--mode-pastel) flex items-center justify-center">
              <ShoppingCart size={20} className="text-(--mode-primary)" strokeWidth={1.75} />
            </div>
            <div>
              <div className="text-xl leading-none font-semibold text-(--text-primary)">{t('kanalOnline')}</div>
              <div className="text-xs text-(--text-tertiary) mt-1.5">{t('kanalDirektvertrieb')}</div>
            </div>
          </div>
        </Card>
      </div>

      {/* Applications */}
      {abschluesse.map((antrag, i) => (
        <AntragCard key={antrag.id || i} antrag={antrag} t={t} statusConfig={STATUS_CONFIG} />
      ))}
    </div>
  );
}

function AntragCard({ antrag, t, statusConfig: STATUS_CONFIG }) {
  const [expanded, setExpanded] = useState(true);
  const completedSteps = antrag.schritte?.filter(s => s.status === 'abgeschlossen').length || 0;
  const totalSteps = antrag.schritte?.length || 0;
  const progress = totalSteps > 0 ? (completedSteps / totalSteps) * 100 : 0;

  return (
    <Card hover={false}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-(--tint-warning) flex items-center justify-center">
            <AlertTriangle size={20} className="text-(--color-warning)" strokeWidth={1.75} />
          </div>
          <div>
            <h3 className="font-semibold text-(--text-primary)">{antrag.produkt}</h3>
            <div className="flex items-center gap-2 text-xs text-(--text-tertiary)">
              <span>{formatDatum(antrag.datum)}</span>
              <span>&middot;</span>
              <span>{antrag.kanal}</span>
              <span>&middot;</span>
              <span className="text-(--color-danger) font-medium">{t('abgebrochenBei')}: {antrag.abbruchSchritt}</span>
            </div>
          </div>
        </div>
        <button
          onClick={() => setExpanded(!expanded)}
          className="text-(--text-tertiary) hover:text-(--text-secondary) transition-colors"
        >
          {expanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
        </button>
      </div>

      {/* Details summary — credit-style or insurance-style */}
      <div className="grid grid-cols-4 gap-3 mb-4">
        {antrag.details && (antrag.kategorie === 'versicherung' ? (
          <>
            <div className="surface-inset rounded-lg p-3 metric-box">
              <div className="text-xs text-(--text-tertiary) mb-1">{t('versicherungssumme')}</div>
              <div className="text-lg font-semibold font-mono text-(--text-primary)">{antrag.details.versicherungssumme?.toLocaleString(getLang() === 'en' ? 'en-US' : 'de-DE')}€</div>
            </div>
            <div className="surface-inset rounded-lg p-3 metric-box">
              <div className="text-xs text-(--text-tertiary) mb-1">{t('laufzeit')}</div>
              <div className="text-lg font-semibold font-mono text-(--text-primary)">{antrag.details.laufzeitJahre} {t('jahre')}</div>
            </div>
            <div className="surface-inset rounded-lg p-3 metric-box">
              <div className="text-xs text-(--text-tertiary) mb-1">{t('tarif')}</div>
              <div className="text-lg font-semibold font-mono text-(--text-primary)">{antrag.details.tarif}</div>
            </div>
            <div className="surface-inset rounded-lg p-3 metric-box">
              <div className="text-xs text-(--text-tertiary) mb-1">{t('monatsbeitrag')}</div>
              <div className="text-lg font-semibold font-mono text-(--text-primary)">{antrag.details.monatsbeitrag}€</div>
            </div>
          </>
        ) : (
          <>
            <div className="surface-inset rounded-lg p-3 metric-box">
              <div className="text-xs text-(--text-tertiary) mb-1">{t('kreditbetrag')}</div>
              <div className="text-lg font-semibold font-mono text-(--text-primary)">{antrag.details.betrag?.toLocaleString(getLang() === 'en' ? 'en-US' : 'de-DE')}€</div>
            </div>
            <div className="surface-inset rounded-lg p-3 metric-box">
              <div className="text-xs text-(--text-tertiary) mb-1">{t('laufzeit')}</div>
              <div className="text-lg font-semibold font-mono text-(--text-primary)">{antrag.details.laufzeit} {t('monate')}</div>
            </div>
            <div className="surface-inset rounded-lg p-3 metric-box">
              <div className="text-xs text-(--text-tertiary) mb-1">{t('effektivzins')}</div>
              <div className="text-lg font-semibold font-mono text-(--text-primary)">{antrag.details.zins}%</div>
            </div>
            <div className="surface-inset rounded-lg p-3 metric-box">
              <div className="text-xs text-(--text-tertiary) mb-1">{t('monatsrate')}</div>
              <div className="text-lg font-semibold font-mono text-(--text-primary)">{antrag.details.rate}€</div>
            </div>
          </>
        ))}
      </div>

      {/* Verwendungszweck / Absicherungszweck */}
      {(antrag.details?.verwendung || antrag.details?.absicherungszweck) && (
        <div className="text-sm text-(--text-secondary) mb-4">
          <span className="font-medium text-(--text-secondary)">
            {antrag.kategorie === 'versicherung' ? t('absicherungszweck') : t('verwendungszweck')}:
          </span> {antrag.details.absicherungszweck || antrag.details.verwendung}
        </div>
      )}

      {expanded && (
        <div className="animate-fade-in">
          {/* Progress bar */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-(--text-secondary)">{t('fortschrittOnlineAntrag')}</span>
              <span className="text-xs font-medium text-(--text-secondary)">{completedSteps} / {totalSteps} {t('schritte')}</span>
            </div>
            <div className="w-full h-2 bg-(--bg-inset) rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{ width: `${progress}%`, backgroundColor: progress === 100 ? 'var(--color-success)' : 'var(--color-warning)' }}
              />
            </div>
          </div>

          {/* Steps */}
          <div className="space-y-0">
            {antrag.schritte?.map((schritt, i) => {
              const statusCfg = STATUS_CONFIG[schritt.status] || STATUS_CONFIG.offen;
              const StatusIcon = statusCfg.icon;
              const schrittKey = SCHRITT_NAME_TO_KEY[schritt.name];
              const StepIcon = (schrittKey && SCHRITT_ICONS_BY_KEY[schrittKey]) || FileText;
              const isLast = i === antrag.schritte.length - 1;

              return (
                <div key={i} className="flex gap-3 py-2">
                  {/* Timeline */}
                  <div className="flex flex-col items-center">
                    <div className={clsx('w-8 h-8 rounded-full flex items-center justify-center', statusCfg.bg)}>
                      <StatusIcon size={16} className={statusCfg.color} />
                    </div>
                    {!isLast && <div className="w-px flex-1 bg-(--border-light) mt-1" />}
                  </div>

                  {/* Content */}
                  <div className="flex-1 pb-1">
                    <div className="flex items-center gap-2">
                      <StepIcon size={14} className="text-(--text-tertiary)" />
                      <span className={clsx(
                        'text-sm font-medium',
                        schritt.status === 'abgebrochen' ? 'text-(--color-danger)' :
                        schritt.status === 'offen' ? 'text-(--text-tertiary)' : 'text-(--text-primary)'
                      )}>
                        {schrittKey ? t(`schritt.${schrittKey}`) : schritt.name}
                      </span>
                      <span className={clsx(
                        'text-[10px] font-medium px-2 py-0.5 rounded-full',
                        statusCfg.bg, statusCfg.color
                      )}>
                        {statusCfg.label}
                      </span>
                    </div>
                    {schritt.datum && (
                      <div className="text-[11px] text-(--text-tertiary) mt-0.5">
                        {new Date(schritt.datum).toLocaleString(getLang() === 'en' ? 'en-US' : 'de-DE', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Bemerkung */}
          {antrag.bemerkung && (
            <div className="mt-4 bg-(--tint-warning) border border-(--border-light) rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle size={14} className="text-(--color-warning)" />
                <span className="text-[11px] font-semibold text-(--color-warning) uppercase tracking-wider">{t('analyseLabel')}</span>
              </div>
              <p className="text-sm text-(--text-primary)">{antrag.bemerkung}</p>
            </div>
          )}

          {/* Action hint */}
          <div className="mt-4 flex items-center gap-2 text-sm font-medium text-(--mode-primary)">
            <ArrowRight size={16} />
            <span>{t('kundenAnsprechen')}</span>
          </div>
        </div>
      )}
    </Card>
  );
}
