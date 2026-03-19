import { useState } from 'react';
import { getLang } from '../../../utils/langHelper';
import Card from '../../../components/ui/Card';
import { clsx } from 'clsx';
import { ShoppingCart, AlertTriangle, CheckCircle, Clock, XCircle, ChevronDown, ChevronUp, ArrowRight, User, CreditCard, FileText, Fingerprint, PenTool } from 'lucide-react';
import { formatDatum } from '../../../utils/formatters';
import { useMode } from '../../../hooks/useMode';
import useTranslation from '../../../i18n/useTranslation';

const SCHRITT_ICONS_BY_KEY = {
  'kreditrechner': CreditCard,
  'persoenlicheDaten': User,
  'einkommensangaben': FileText,
  'kontoverbindung': CreditCard,
  'legitimation': Fingerprint,
  'legitimationVideoIdent': Fingerprint,
  'unterschrift': PenTool,
};

const SCHRITT_NAME_TO_KEY = {
  'Kreditrechner': 'kreditrechner',
  'Pers\u00f6nliche Daten': 'persoenlicheDaten',
  'Einkommensangaben': 'einkommensangaben',
  'Kontoverbindung': 'kontoverbindung',
  'Legitimation': 'legitimation',
  'Legitimation (VideoIdent)': 'legitimationVideoIdent',
  'Unterschrift': 'unterschrift',
};

export default function ProduktabschlussTab({ kunde }) {
  const { t } = useTranslation();
  const STATUS_CONFIG = {
    abgeschlossen: { icon: CheckCircle, color: 'text-emerald-500', bg: 'bg-emerald-50', label: t('abgeschlossen') },
    abgebrochen: { icon: XCircle, color: 'text-red-500', bg: 'bg-red-50', label: t('abgebrochen') },
    offen: { icon: Clock, color: 'text-slate-300', bg: 'bg-slate-50', label: t('statusOffen') },
  };
  const abschluesse = kunde.produktabschluss || [];

  if (abschluesse.length === 0) {
    return (
      <Card>
        <div className="text-center py-12 text-slate-400">
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
            <div className="w-10 h-10 rounded-lg bg-amber-50 flex items-center justify-center">
              <AlertTriangle size={20} className="text-amber-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-slate-800">{abschluesse.filter(a => a.status === 'abgebrochen').length}</div>
              <div className="text-xs text-slate-400">{t('abgebrocheneAntraege')}</div>
            </div>
          </div>
        </Card>
        <Card className="p-4" padding={false}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
              <CreditCard size={20} className="text-blue-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-slate-800">
                {abschluesse.reduce((sum, a) => sum + (a.details?.betrag || 0), 0).toLocaleString(getLang() === 'en' ? 'en-US' : 'de-DE')}€
              </div>
              <div className="text-xs text-slate-400">{t('kreditvolumenGesamt')}</div>
            </div>
          </div>
        </Card>
        <Card className="p-4" padding={false}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-purple-50 flex items-center justify-center">
              <ShoppingCart size={20} className="text-purple-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-slate-800">Online</div>
              <div className="text-xs text-slate-400">{t('kanalDirektvertrieb')}</div>
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
  const { config } = useMode();
  const completedSteps = antrag.schritte?.filter(s => s.status === 'abgeschlossen').length || 0;
  const totalSteps = antrag.schritte?.length || 0;
  const progress = totalSteps > 0 ? (completedSteps / totalSteps) * 100 : 0;

  return (
    <Card>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center">
            <AlertTriangle size={20} className="text-amber-600" />
          </div>
          <div>
            <h3 className="font-semibold text-slate-800">{antrag.produkt}</h3>
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <span>{formatDatum(antrag.datum)}</span>
              <span>&middot;</span>
              <span>{antrag.kanal}</span>
              <span>&middot;</span>
              <span className="text-red-500 font-medium">{t('abgebrochenBei')}: {antrag.abbruchSchritt}</span>
            </div>
          </div>
        </div>
        <button
          onClick={() => setExpanded(!expanded)}
          className="text-slate-400 hover:text-slate-600 transition-colors"
        >
          {expanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
        </button>
      </div>

      {/* Credit details summary */}
      <div className="grid grid-cols-4 gap-3 mb-4">
        {antrag.details && (
          <>
            <div className="bg-slate-50 rounded-lg p-3">
              <div className="text-xs text-slate-400 mb-1">{t('kreditbetrag')}</div>
              <div className="text-lg font-bold text-slate-800">{antrag.details.betrag?.toLocaleString(getLang() === 'en' ? 'en-US' : 'de-DE')}€</div>
            </div>
            <div className="bg-slate-50 rounded-lg p-3">
              <div className="text-xs text-slate-400 mb-1">{t('laufzeit')}</div>
              <div className="text-lg font-bold text-slate-800">{antrag.details.laufzeit} {t('monate')}</div>
            </div>
            <div className="bg-slate-50 rounded-lg p-3">
              <div className="text-xs text-slate-400 mb-1">{t('effektivzins')}</div>
              <div className="text-lg font-bold text-slate-800">{antrag.details.zins}%</div>
            </div>
            <div className="bg-slate-50 rounded-lg p-3">
              <div className="text-xs text-slate-400 mb-1">{t('monatsrate')}</div>
              <div className="text-lg font-bold text-slate-800">{antrag.details.rate}€</div>
            </div>
          </>
        )}
      </div>

      {/* Verwendungszweck */}
      {antrag.details?.verwendung && (
        <div className="text-sm text-slate-600 mb-4">
          <span className="font-medium text-slate-500">{t('verwendungszweck')}:</span> {antrag.details.verwendung}
        </div>
      )}

      {expanded && (
        <div className="animate-fade-in">
          {/* Progress bar */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-slate-500">{t('fortschrittOnlineAntrag')}</span>
              <span className="text-xs font-medium text-slate-500">{completedSteps} / {totalSteps} {t('schritte')}</span>
            </div>
            <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{ width: `${progress}%`, backgroundColor: progress === 100 ? '#10b981' : '#f59e0b' }}
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
                    {!isLast && <div className="w-px flex-1 bg-slate-200 mt-1" />}
                  </div>

                  {/* Content */}
                  <div className="flex-1 pb-1">
                    <div className="flex items-center gap-2">
                      <StepIcon size={14} className="text-slate-400" />
                      <span className={clsx(
                        'text-sm font-medium',
                        schritt.status === 'abgebrochen' ? 'text-red-600' :
                        schritt.status === 'offen' ? 'text-slate-300' : 'text-slate-700'
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
                      <div className="text-[11px] text-slate-400 mt-0.5">
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
            <div className="mt-4 bg-amber-50 border border-amber-200 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle size={14} className="text-amber-600" />
                <span className="text-xs font-semibold text-amber-700 uppercase tracking-wider">{t('analyseLabel')}</span>
              </div>
              <p className="text-sm text-amber-900">{antrag.bemerkung}</p>
            </div>
          )}

          {/* Action hint */}
          <div className="mt-4 flex items-center gap-2 text-sm font-medium" style={{ color: config?.colors?.primary || '#1e3a5f' }}>
            <ArrowRight size={16} />
            <span>{t('kundenAnsprechen')}</span>
          </div>
        </div>
      )}
    </Card>
  );
}
