import { X, ExternalLink, Sparkles, AlertTriangle, TrendingUp, RefreshCw, CreditCard,
  Receipt, Mail, Building2, FileText, Baby, Heart, Linkedin, Search,
  Globe, Briefcase, PiggyBank, LineChart, Info, ShieldAlert, CheckCircle2 } from 'lucide-react';
import Avatar from './Avatar';
import { getKundeFoto } from '../../utils/kundenFotos';
import useTranslation from '../../i18n/useTranslation';

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

function RiskBadge({ risk, t }) {
  if (!risk) return null;
  const colors = risk === 'high'
    ? 'bg-red-50 text-red-700 border-red-200'
    : risk === 'medium'
      ? 'bg-amber-50 text-amber-700 border-amber-200'
      : 'bg-slate-50 text-slate-700 border-slate-200';
  const label = risk === 'high' ? t('radar.risikoHoch') : risk === 'medium' ? t('radar.risikoMittel') : t('radar.risikoBeobachten');
  return (
    <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${colors}`}>
      {label}
    </span>
  );
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

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          className="px-5 py-4 border-b border-slate-200 flex items-start justify-between gap-3"
          style={{
            background: isAbwanderung
              ? 'linear-gradient(135deg, #fef2f2 0%, #ffffff 100%)'
              : 'linear-gradient(135deg, #ecfdf5 0%, #ffffff 100%)',
          }}
        >
          <div className="flex items-center gap-3 min-w-0">
            <Avatar name={entry.customerName} foto={foto} size={44} />
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-semibold text-slate-900 truncate">{entry.customerName}</h3>
                {isAbwanderung ? (
                  <RiskBadge risk={entry.riskLevel} t={t} />
                ) : (
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border bg-emerald-50 text-emerald-700 border-emerald-200">
                    {t('radar.neuesSignal')}
                  </span>
                )}
              </div>
              <div className="text-xs text-slate-500 mt-0.5 flex items-center gap-1.5">
                {isAbwanderung ? (
                  <>
                    <AlertTriangle size={11} className="text-red-500" />
                    <span>{displayRiskType}</span>
                  </>
                ) : (
                  <>
                    <Sparkles size={11} className="text-emerald-500" />
                    <span>{displayEvent}</span>
                  </>
                )}
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-700 transition-colors shrink-0"
            aria-label={t('schliessen')}
          >
            <X size={18} />
          </button>
        </div>

        {/* KPI-Zeile */}
        <div className="px-5 py-3 border-b border-slate-100 flex items-center gap-4 flex-wrap">
          {isAbwanderung ? (
            <>
              <div>
                <div className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">{t('clvAtRisk')}</div>
                <div className="text-xl font-bold text-red-700 font-mono">
                  {entry.clvAtRisk?.toLocaleString(numberLocale)}€
                </div>
              </div>
              <div>
                <div className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">{t('radar.risikoScore')}</div>
                <div className="flex items-center gap-2">
                  <div className="w-24 h-2 rounded-full bg-slate-100 overflow-hidden">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${entry.riskScore || 0}%`,
                        background: entry.riskLevel === 'high' ? '#dc2626' : entry.riskLevel === 'medium' ? '#f59e0b' : '#94a3b8',
                      }}
                    />
                  </div>
                  <span className="text-sm font-bold text-slate-700 font-mono">{entry.riskScore}/100</span>
                </div>
              </div>
              <div>
                <div className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">{t('radar.trend')}</div>
                <div className={`text-sm font-semibold ${entry.trend === 'steigend' ? 'text-red-700' : entry.trend === 'fallend' ? 'text-emerald-700' : 'text-amber-700'}`}>
                  {entry.trend === 'steigend' ? t('radar.trendSteigend') : entry.trend === 'fallend' ? t('radar.trendFallend') : t('radar.trendStabil')}
                </div>
              </div>
            </>
          ) : (
            <>
              <div>
                <div className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">{t('potenzialLabel')}</div>
                <div className="text-xl font-bold text-emerald-700 font-mono">
                  {entry.revenue?.toLocaleString(numberLocale)}€
                </div>
              </div>
              <div>
                <div className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">{t('radar.kiKonfidenz')}</div>
                <div className="flex items-center gap-2">
                  <div className="w-24 h-2 rounded-full bg-slate-100 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-emerald-500"
                      style={{ width: `${entry.confidence || 0}%` }}
                    />
                  </div>
                  <span className="text-sm font-bold text-slate-700 font-mono">{entry.confidence}%</span>
                </div>
              </div>
              <div>
                <div className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">{t('radar.quellen')}</div>
                <div className="text-sm font-semibold text-slate-700">{entry.signalCount || entry.signals?.length || 0}</div>
              </div>
            </>
          )}
        </div>

        {/* Body: Signale */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
          {/* Kurze Einleitung */}
          <div className="rounded-xl bg-slate-50 border border-slate-200 px-3.5 py-2.5">
            <div className="flex items-start gap-2">
              <Sparkles size={14} className="text-violet-600 mt-0.5 shrink-0" />
              <div className="text-[13px] text-slate-700 leading-relaxed">
                {isAbwanderung
                  ? t('radar.introAbwanderung', { count: entry.signals?.length, riskType: displayRiskType?.toLowerCase() })
                  : t('radar.introLebenslage', { count: entry.signalCount || entry.signals?.length, event: displayEvent })}
              </div>
            </div>
          </div>

          {/* Signal-Liste */}
          <div>
            <div className="text-[11px] uppercase tracking-wider text-slate-500 font-bold mb-2">
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
                  <li key={i} className="rounded-xl border border-slate-200 bg-white p-3">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-center shrink-0">
                        <Icon size={14} className="text-slate-600" strokeWidth={2} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm text-slate-800 leading-snug">{s}</div>
                        <div className="flex items-center gap-1.5 mt-1">
                          <span className="text-[10px] uppercase tracking-wider font-semibold text-slate-400">{source}</span>
                        </div>
                        {tx && (tx.euro || tx.partner) && (
                          <div className="mt-2 rounded-lg bg-slate-50 border border-slate-200 p-2 font-mono text-[11px] text-slate-600">
                            <div className="flex items-center justify-between gap-3">
                              <span className="truncate">
                                {tx.partner ? <span className="text-slate-800 font-semibold">{tx.partner}</span> : t('radar.transaktion')}
                                {tx.zeitraum ? <span className="text-slate-400"> · {localizeZeitraum(tx.zeitraum, lang)}</span> : ''}
                              </span>
                              {tx.euro && (
                                <span className="text-red-700 font-semibold shrink-0">−{tx.euro} €</span>
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
            <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-3">
              <div className="flex items-start gap-2">
                <TrendingUp size={14} className="text-emerald-600 mt-0.5 shrink-0" />
                <div className="text-[13px] text-emerald-900 leading-relaxed">
                  <strong>{t('radar.handlungsimpulsLabel')}:</strong> {t('radar.handlungsimpulsText')}
                </div>
              </div>
            </div>
          )}

          {isAbwanderung && (
            <div className="rounded-xl bg-red-50 border border-red-200 p-3">
              <div className="flex items-start gap-2">
                <AlertTriangle size={14} className="text-red-600 mt-0.5 shrink-0" />
                <div className="text-[13px] text-red-900 leading-relaxed">
                  <strong>{t('radar.empfohleneReaktionLabel')}:</strong> {t('radar.empfohleneReaktionText')}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-slate-200 px-5 py-3 flex items-center justify-end gap-2 bg-slate-50/50">
          <button
            onClick={onClose}
            className="px-3 py-2 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-100 transition-colors"
          >
            {t('schliessen')}
          </button>
          <button
            onClick={() => onOpenKunde?.(entry.kundeId)}
            className="px-4 py-2 rounded-lg text-sm font-semibold bg-slate-900 text-white hover:bg-slate-800 transition-colors flex items-center gap-1.5"
          >
            {t('radar.kundenOeffnen')} <ExternalLink size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}
