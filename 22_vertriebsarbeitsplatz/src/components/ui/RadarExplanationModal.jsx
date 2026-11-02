import { X, ExternalLink, Sparkles, AlertTriangle, TrendingUp, RefreshCw, CreditCard,
  Receipt, Mail, Building2, FileText, Baby, Heart, Linkedin, Search,
  Globe, Briefcase, PiggyBank, LineChart, Info, ShieldAlert, CheckCircle2,
  ArrowUpRight, ArrowDownRight, ArrowRight, AlertCircle, Radar } from 'lucide-react';
import { createPortal } from 'react-dom';
import Avatar from './Avatar';
import { getKundeFoto } from '../../utils/kundenFotos';
import useTranslation from '../../i18n/useTranslation';

// Portal-Ziel für Modals: der Modus-Wrapper (data-mode), damit die
// Modus-Tokens (Bordeaux, Oliv, Petrol) auch im Modal gelten. Er liegt
// oberhalb der transformierten Tab-Fläche, die sonst zum Bezugsrahmen der
// fixed-Positionierung würde. Fallback: document.body.
function portalRoot() {
  if (typeof document === 'undefined') return null;
  return document.querySelector('[data-mode]') || document.body;
}

// Modal fuer Lebenslagen- und Abwanderungs-Radar. Nimmt einen Entry (egal
// ob Lebenslage oder Abwanderung) + type und rendert daraus eine reich
// aufbereitete Erklaerung: Header mit Kunde, Badges/KPIs, eine strukturierte
// Signal-Liste (je Signal mit passendem Icon + "Quelle"-Hinweis + bei Abwan-
// derung mit synthetischer Transaktions-Darstellung) und am Ende den
// "Kunden oeffnen"-Button.

function pickSignalIcon(text) {
  const s = (text || '').toLowerCase();
  if (/dauerauftrag/.test(s)) return RefreshCw;
  if (/lastschrift/.test(s)) return Receipt;
  if (/tagesgeld|konto\b|girokonto|festgeld|sparkonto/.test(s)) return CreditCard;
  if (/sparplan|depot|wertpapier|aktien|etf|fonds/.test(s)) return LineChart;
  if (/kreditanfrage|schufa/.test(s)) return ShieldAlert;
  if (/kredit|darlehen|finanzier/.test(s)) return PiggyBank;
  if (/newsletter|mail|e-?mail/.test(s)) return Mail;
  if (/recherche|such|webseite/.test(s)) return Search;
  if (/linkedin/.test(s)) return Linkedin;
  if (/gewerbeanmeldung|gmbh|gewerbe|m&a|nachfolge|ceo|gf\b|geschäftsf/.test(s)) return Building2;
  if (/umsatzsteuer|steuerberater|steuer/.test(s)) return FileText;
  if (/baby|kind|kinderarzt|hebamme|kindergeld|gynäkologen|vorsorge/.test(s)) return Baby;
  if (/babymarkt|dm\b/.test(s)) return Baby;
  if (/praxis|webhosting|betriebs|handwerk|zweitstandort/.test(s)) return Briefcase;
  if (/termin|gespräch/.test(s)) return CheckCircle2;
  if (/newsletter|ausgab|hauskauf/.test(s)) return Mail;
  return Info;
}

// Aus einem Signal-String (immer der deutsche Original-Text, damit die
// Keyword-Erkennung stabil ist) den Übersetzungs-Key der „Quelle" herleiten.
function pickSignalSourceKey(text) {
  const s = (text || '').toLowerCase();
  if (/dauerauftrag|lastschrift|übertrag|tagesgeld|girokonto|festgeld|sparkonto|konto\b/.test(s)) return 'radarSrc.psd2Konto';
  if (/sparplan|depot|wertpapier|aktien|etf|fonds/.test(s)) return 'radarSrc.openFinanceDepot';
  if (/kreditanfrage|schufa/.test(s)) return 'radarSrc.bonitaet';
  if (/newsletter|mail/.test(s)) return 'radarSrc.marketingNewsletter';
  if (/recherche|such|webseite/.test(s)) return 'radarSrc.webTracking';
  if (/linkedin/.test(s)) return 'radarSrc.linkedin';
  if (/gewerbeanmeldung|gmbh|handelsregister/.test(s)) return 'radarSrc.register';
  if (/umsatzsteuer|steuerberater|steuer/.test(s)) return 'radarSrc.buchhaltung';
  if (/kindergeld/.test(s)) return 'radarSrc.familienkasse';
  if (/baby|kinderarzt|hebamme|gynäkologen/.test(s)) return 'radarSrc.psd2Konto';
  return 'radarSrc.kiErkennung';
}

// Zeitraum-Einheiten im Transaktions-Hinweis lokalisieren (Demo-Anzeige).
function localizeZeitraum(zeitraum, lang) {
  if (!zeitraum || lang !== 'en') return zeitraum;
  return zeitraum
    .replace(/Wochen/i, 'weeks')
    .replace(/Monate|Mon\./i, 'months')
    .replace(/Tage/i, 'days');
}

// Fuer Abwanderungs-Signale: synthetische Transaktions-Zeilen ableiten, wenn
// das Signal ein Dauerauftrag / Übertrag ist. Reine Anzeige — Demo-Daten.
function extractTransactionFromSignal(text) {
  const m1 = (text || '').match(/(\d[\d.]*)\s*€/);
  const euro = m1 ? m1[1] : null;
  const m2 = (text || '').match(/(N26|ING|Commerzbank|Sparkasse|Comdirect|Trade Republic|Smava|ImmoScout)/i);
  const partner = m2 ? m2[1] : null;
  const m3 = (text || '').match(/seit\s+(\d+\s*(?:Wochen|Monate|Tage|Mon\.))/i);
  const zeitraum = m3 ? m3[1] : null;
  if (!euro && !partner) return null;
  return { euro, partner, zeitraum };
}

// Zart getönter Status-Badge: Fläche aus --tint-*, Text in der Statusfarbe,
// immer mit Icon.
function RiskBadge({ risk, t }) {
  if (!risk) return null;
  const style = risk === 'high'
    ? { background: 'var(--tint-danger)', color: 'var(--color-danger)' }
    : risk === 'medium'
      ? { background: 'var(--tint-warning)', color: 'var(--color-warning)' }
      : { background: 'var(--bg-inset)', color: 'var(--text-secondary)' };
  const Icon = risk === 'high' ? AlertTriangle : risk === 'medium' ? AlertCircle : Info;
  const label = risk === 'high' ? t('radar.risikoHoch') : risk === 'medium' ? t('radar.risikoMittel') : t('radar.risikoBeobachten');
  return (
    <span className="inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full" style={style}>
      <Icon size={10} strokeWidth={2.5} /> {label}
    </span>
  );
}

function KpiLabel({ children }) {
  return <div className="text-[10px] uppercase tracking-wider font-semibold" style={{ color: 'var(--text-tertiary)' }}>{children}</div>;
}

export default function RadarExplanationModal({ type, entry, onClose, onOpenKunde }) {
  const { t, lang } = useTranslation();
  if (!entry) return null;
  const isAbwanderung = type === 'abwanderung';
  const foto = getKundeFoto(entry.kundeId);
  // Lokalisierte Anzeige-Werte: Erkennung läuft weiter auf dem deutschen
  // Originaltext, angezeigt wird die EN-Variante, sofern vorhanden.
  const L = (de, en) => (lang === 'en' && en != null ? en : de);
  const displayEvent = L(entry.event, entry.eventEn);
  const displayRiskType = L(entry.riskType, entry.riskTypeEn);
  const numberLocale = lang === 'en' ? 'en-GB' : 'de-DE';
  const riskBarColor = entry.riskLevel === 'high' ? 'var(--color-danger)' : entry.riskLevel === 'medium' ? 'var(--color-warning)' : 'var(--text-tertiary)';
  const TrendIcon = entry.trend === 'steigend' ? ArrowUpRight : entry.trend === 'fallend' ? ArrowDownRight : ArrowRight;
  const trendColor = entry.trend === 'steigend' ? 'var(--color-danger)' : entry.trend === 'fallend' ? 'var(--color-success)' : 'var(--color-warning)';

  // Portal in den Modus-Wrapper (portalRoot), damit transformierte Vorfahren das fixed-Modal
  // nicht in der Seitenmitte statt im Sichtfenster zentrieren.
  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in"
      style={{ background: 'rgba(28, 26, 23, 0.45)' }}
      onClick={onClose}
    >
      <div
        className="surface-elevated rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header: zarte Tönung in der Statusfarbe, die nach rechts ausläuft */}
        <div
          className="px-5 py-4 border-b flex items-start justify-between gap-3"
          style={{
            borderColor: 'var(--border-light)',
            background: isAbwanderung
              ? 'linear-gradient(135deg, var(--tint-danger) 0%, var(--bg-elevated) 70%)'
              : 'linear-gradient(135deg, var(--tint-success) 0%, var(--bg-elevated) 70%)',
          }}
        >
          <div className="flex items-center gap-3 min-w-0">
            <Avatar name={entry.customerName} foto={foto} size={44} />
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-semibold truncate" style={{ color: 'var(--text-primary)' }}>{entry.customerName}</h3>
                {isAbwanderung ? (
                  <RiskBadge risk={entry.riskLevel} t={t} />
                ) : (
                  <span className="inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full" style={{ background: 'var(--tint-success)', color: 'var(--color-success)' }}>
                    <Sparkles size={10} strokeWidth={2.5} /> {t('radar.neuesSignal')}
                  </span>
                )}
              </div>
              <div className="text-xs mt-0.5 flex items-center gap-1.5" style={{ color: 'var(--text-secondary)' }}>
                {isAbwanderung ? (
                  <>
                    <ShieldAlert size={11} style={{ color: 'var(--color-danger)' }} />
                    <span>{displayRiskType}</span>
                  </>
                ) : (
                  <>
                    <Radar size={11} style={{ color: 'var(--color-success)' }} />
                    <span>{displayEvent}</span>
                  </>
                )}
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors shrink-0 hover:bg-(--bg-inset)"
            style={{ color: 'var(--text-tertiary)' }}
            aria-label={t('schliessen')}
          >
            <X size={18} />
          </button>
        </div>

        {/* KPI-Zeile */}
        <div className="px-5 py-3 border-b flex items-center gap-6 flex-wrap" style={{ borderColor: 'var(--border-light)' }}>
          {isAbwanderung ? (
            <>
              <div>
                <KpiLabel>{t('clvAtRisk')}</KpiLabel>
                <div className="text-xl font-semibold font-mono" style={{ color: 'var(--color-danger)' }}>
                  {entry.clvAtRisk?.toLocaleString(numberLocale)}€
                </div>
              </div>
              <div>
                <KpiLabel>{t('radar.risikoScore')}</KpiLabel>
                <div className="flex items-center gap-2 mt-1">
                  <div className="progress-track w-24 h-2 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full"
                      style={{ width: `${entry.riskScore || 0}%`, background: riskBarColor }}
                    />
                  </div>
                  <span className="text-sm font-semibold font-mono" style={{ color: 'var(--text-primary)' }}>{entry.riskScore}/100</span>
                </div>
              </div>
              <div>
                <KpiLabel>{t('radar.trend')}</KpiLabel>
                <div className="text-sm font-semibold inline-flex items-center gap-1" style={{ color: trendColor }}>
                  <TrendIcon size={14} strokeWidth={2.5} />
                  {entry.trend === 'steigend' ? t('radar.trendSteigend') : entry.trend === 'fallend' ? t('radar.trendFallend') : t('radar.trendStabil')}
                </div>
              </div>
            </>
          ) : (
            <>
              <div>
                <KpiLabel>{t('potenzialLabel')}</KpiLabel>
                <div className="text-xl font-semibold font-mono" style={{ color: 'var(--color-success)' }}>
                  {entry.revenue?.toLocaleString(numberLocale)}€
                </div>
              </div>
              <div>
                <KpiLabel>{t('radar.kiKonfidenz')}</KpiLabel>
                <div className="flex items-center gap-2 mt-1">
                  <div className="progress-track w-24 h-2 rounded-full overflow-hidden">
                    <div
                      className="progress-fill h-full rounded-full"
                      style={{ width: `${entry.confidence || 0}%` }}
                    />
                  </div>
                  <span className="text-sm font-semibold font-mono" style={{ color: 'var(--text-primary)' }}>{entry.confidence}%</span>
                </div>
              </div>
              <div>
                <KpiLabel>{t('radar.quellen')}</KpiLabel>
                <div className="text-sm font-semibold font-mono" style={{ color: 'var(--text-primary)' }}>{entry.signalCount || entry.signals?.length || 0}</div>
              </div>
            </>
          )}
        </div>

        {/* Body: Signale */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
          {/* Kurze Einleitung */}
          <div className="rounded-xl px-3.5 py-2.5" style={{ background: 'var(--bg-inset)', border: '1px solid var(--border-light)' }}>
            <div className="flex items-start gap-2">
              <Sparkles size={14} className="mt-0.5 shrink-0" style={{ color: 'var(--mode-primary)' }} />
              <div className="text-[13px] leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                {isAbwanderung
                  ? t('radar.introAbwanderung', { count: entry.signals?.length, riskType: displayRiskType?.toLowerCase() })
                  : t('radar.introLebenslage', { count: entry.signalCount || entry.signals?.length, event: displayEvent })}
              </div>
            </div>
          </div>

          {/* Signal-Liste */}
          <div>
            <div className="text-[11px] uppercase tracking-wider font-semibold mb-2" style={{ color: 'var(--text-tertiary)' }}>
              {t('radar.erkannteSignale')}
            </div>
            <ul className="space-y-2">
              {(entry.signals || []).map((sDe, i) => {
                // Erkennung auf dem deutschen Originaltext, Anzeige lokalisiert.
                const s = L(sDe, entry.signalsEn?.[i]);
                const Icon = pickSignalIcon(sDe);
                const source = t(pickSignalSourceKey(sDe));
                const tx = isAbwanderung ? extractTransactionFromSignal(sDe) : null;
                return (
                  <li key={i} className="rounded-xl p-3" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-light)' }}>
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: 'var(--mode-primary-soft)' }}>
                        <Icon size={14} style={{ color: 'var(--mode-primary)' }} strokeWidth={2} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm leading-snug" style={{ color: 'var(--text-primary)' }}>{s}</div>
                        <div className="flex items-center gap-1.5 mt-1">
                          <span className="text-[10px] uppercase tracking-wider font-semibold" style={{ color: 'var(--text-tertiary)' }}>{source}</span>
                        </div>
                        {tx && (tx.euro || tx.partner) && (
                          <div className="mt-2 rounded-lg p-2 font-mono text-[11px]" style={{ background: 'var(--bg-inset)', border: '1px solid var(--border-light)', color: 'var(--text-secondary)' }}>
                            <div className="flex items-center justify-between gap-3">
                              <span className="truncate">
                                {tx.partner ? <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>{tx.partner}</span> : t('radar.transaktion')}
                                {tx.zeitraum ? <span style={{ color: 'var(--text-tertiary)' }}> · {localizeZeitraum(tx.zeitraum, lang)}</span> : ''}
                              </span>
                              {tx.euro && (
                                <span className="font-semibold shrink-0" style={{ color: 'var(--color-danger)' }}>−{tx.euro} €</span>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Kontextbox nur bei Lebenslagen */}
          {!isAbwanderung && entry.signals?.length > 0 && (
            <div className="rounded-xl p-3" style={{ background: 'var(--tint-success)' }}>
              <div className="flex items-start gap-2">
                <TrendingUp size={14} className="mt-0.5 shrink-0" style={{ color: 'var(--color-success)' }} />
                <div className="text-[13px] leading-relaxed" style={{ color: 'var(--text-primary)' }}>
                  <strong>{t('radar.handlungsimpulsLabel')}:</strong> {t('radar.handlungsimpulsText')}
                </div>
              </div>
            </div>
          )}

          {isAbwanderung && (
            <div className="rounded-xl p-3" style={{ background: 'var(--tint-danger)' }}>
              <div className="flex items-start gap-2">
                <AlertTriangle size={14} className="mt-0.5 shrink-0" style={{ color: 'var(--color-danger)' }} />
                <div className="text-[13px] leading-relaxed" style={{ color: 'var(--text-primary)' }}>
                  <strong>{t('radar.empfohleneReaktionLabel')}:</strong> {t('radar.empfohleneReaktionText')}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t px-5 py-3 flex items-center justify-end gap-2" style={{ borderColor: 'var(--border-light)', background: 'var(--bg-inset)' }}>
          <button
            onClick={onClose}
            className="px-3 py-2 rounded-lg text-sm font-medium transition-colors hover:bg-(--bg-card)"
            style={{ color: 'var(--text-secondary)' }}
          >
            {t('schliessen')}
          </button>
          <button
            onClick={() => onOpenKunde?.(entry.kundeId)}
            className="px-4 py-2 rounded-lg text-sm font-semibold text-white transition-colors flex items-center gap-1.5 bg-(--mode-primary) hover:bg-(--mode-primary-light)"
          >
            {t('radar.kundenOeffnen')} <ExternalLink size={14} />
          </button>
        </div>
      </div>
    </div>,
    portalRoot()
  );
}
