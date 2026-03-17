import { VV_ENGAGEMENT } from '../../../data/vvDataProvider';
import { useMode } from '../../../hooks/useMode';
import { KUNDEN_BY_MODE } from '../../../data';
import {
  ExternalLink, Globe, Mail, Calendar, Newspaper, Users,
  ThumbsUp, Share2, PenLine, Eye, Clock, MousePointerClick,
  CheckCircle, Star, Sparkles, Activity,
} from 'lucide-react';
import { clsx } from 'clsx';
import useTranslation from '../../../i18n/useTranslation';

// ─── Date formatter ───
function getLang() { try { return localStorage.getItem('kia_language') || 'de'; } catch { return 'de'; } }
function fmtDate(d) {
  if (!d) return '-';
  return new Date(d).toLocaleDateString(getLang() === 'en' ? 'en-GB' : 'de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

// ─── Signal tag pill ───
function SignalTag({ label, type = 'neutral' }) {
  const styles = {
    neutral: 'bg-blue-50 text-blue-700 border-blue-200',
    action: 'bg-amber-50 text-amber-700 border-amber-200',
    positive: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    negative: 'bg-red-50 text-red-600 border-red-200',
  };
  return (
    <span className={clsx('inline-flex items-center gap-0.5 text-[10px] font-medium px-2 py-0.5 rounded-full border', styles[type] || styles.neutral)}>
      <Sparkles size={10} />
      {label}
    </span>
  );
}

// ─── Signal type resolver ───
function resolveSignalType(signal) {
  if (!signal) return 'neutral';
  const s = signal.toLowerCase();
  if (s.includes('positiv') || s.includes('engagement') || s.includes('sichtbarkeit') || s.includes('top') || s.includes('super') || s.includes('regelmäßig')) return 'positive';
  if (s.includes('nachfolge') || s.includes('liquidität') || s.includes('action') || s.includes('nötig') || s.includes('offen') || s.includes('aktualisierung')) return 'action';
  return 'neutral';
}

// ─── Activity icon ───
function ActivityIcon({ typ }) {
  switch (typ) {
    case 'like': return <ThumbsUp size={13} className="text-blue-500" />;
    case 'share': return <Share2 size={13} className="text-emerald-500" />;
    case 'post': return <PenLine size={13} className="text-purple-500" />;
    case 'profil_update': return <Users size={13} className="text-slate-500" />;
    default: return <Eye size={13} className="text-slate-400" />;
  }
}

// ─── Match level badge ───
function MatchBadge({ level, t }) {
  return (
    <span className={clsx(
      'inline-flex items-center gap-0.5 text-[10px] font-medium px-2 py-0.5 rounded-full border',
      level === 'hoch' && 'bg-emerald-50 text-emerald-700 border-emerald-200',
      level === 'mittel' && 'bg-amber-50 text-amber-700 border-amber-200',
      level === 'niedrig' && 'bg-slate-50 text-slate-500 border-slate-200',
    )}>
      <Star size={10} />
      {level === 'hoch' ? (t ? t('hoch') : 'Hoch') : level === 'mittel' ? (t ? t('mittel') : 'Mittel') : (t ? t('niedrig') : 'Niedrig')}
    </span>
  );
}

// ─── Section wrapper ───
function Section({ title, icon: Icon, children }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5" style={{ boxShadow: 'var(--card-shadow)' }}>
      <div className="flex items-center gap-2 mb-4">
        {Icon && <Icon size={18} className="text-slate-500" strokeWidth={1.75} />}
        <h3 className="font-semibold text-slate-800">{title}</h3>
      </div>
      {children}
    </div>
  );
}

// ─── Main component ───
export default function EngagementTab() {
  const { t } = useTranslation();
  const { selectedKundeId, modeId } = useMode();
  const kunden = KUNDEN_BY_MODE[modeId] || [];
  const kunde = kunden.find(k => k.id === selectedKundeId);
  const data = VV_ENGAGEMENT[selectedKundeId];

  if (!data || !kunde) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center text-slate-400">
        {t('keineEngagementDaten')}
      </div>
    );
  }

  const li = data.linkedin || {};
  const ws = data.website || {};
  const nl = data.newsletter || {};
  const ev = data.events || {};
  const pr = data.presse || [];

  return (
    <div className="space-y-4">
      {/* 1. LinkedIn-Aktivität */}
      <Section title={t('linkedInAktivitaet')} icon={Users}>
        {li.url || li.profilUrl ? (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {li.url && (
                  <a
                    href={li.url.startsWith('http') ? li.url : `https://${li.url}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800"
                  >
                    <ExternalLink size={13} /> {t('profilAnsehen')}
                  </a>
                )}
                <span className="text-sm text-slate-500">{li.kontakte} {t('kontakte')}</span>
              </div>
              <span className={clsx(
                'text-xs font-medium px-2 py-0.5 rounded-full',
                li.aktivitaet === 'hoch' || li.aktivitaet === 'sehr_hoch' ? 'bg-emerald-50 text-emerald-700' :
                li.aktivitaet === 'mittel' ? 'bg-amber-50 text-amber-700' :
                'bg-slate-100 text-slate-500',
              )}>
                {t('aktivitaet')} {li.aktivitaet || 'Keine'}
              </span>
            </div>

            {/* Timeline */}
            {li.letzteAktivitaeten && li.letzteAktivitaeten.length > 0 && (
              <div className="space-y-1.5 pt-2 border-t border-slate-100">
                {li.letzteAktivitaeten.map((a, i) => (
                  <div key={i} className="flex items-start gap-2.5 py-1">
                    <ActivityIcon typ={a.typ} />
                    <div className="flex-1 min-w-0">
                      <span className="text-sm text-slate-700">{a.inhalt}</span>
                    </div>
                    <span className="text-xs text-slate-400 whitespace-nowrap">{fmtDate(a.datum)}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Signal tags */}
            {li.signale && li.signale.length > 0 && (
              <div className="flex flex-wrap gap-1.5 pt-2 border-t border-slate-100">
                {li.signale.map((s, i) => (
                  <SignalTag key={i} label={s} type={resolveSignalType(s)} />
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="text-sm text-slate-400">{t('keinLinkedin')}</div>
        )}
      </Section>

      {/* 2. Website & Newsletter */}
      <Section title={t('websiteNewsletter')} icon={Globe}>
        <div className="grid grid-cols-2 gap-6">
          {/* Website */}
          <div>
            <div className="text-xs text-slate-400 font-medium uppercase tracking-wider mb-2">{t('websiteBesuche')}</div>
            <div className="flex items-center gap-4 mb-3">
              <div className="text-center">
                <div className="text-2xl font-bold text-slate-800">{ws.besuche90Tage || 0}</div>
                <div className="text-[10px] text-slate-400">{t('besuche')}</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-semibold text-slate-700">{ws.avgVerweildauer || '-'}</div>
                <div className="text-[10px] text-slate-400">{t('avgVerweildauer')}</div>
              </div>
            </div>
            {ws.topSeiten && ws.topSeiten.length > 0 && (
              <div className="space-y-1">
                <div className="text-xs text-slate-400 mb-1">{t('topSeiten')}</div>
                {ws.topSeiten.map((s, i) => (
                  <div key={i} className="flex items-center justify-between py-1 px-2 bg-slate-50 rounded text-xs">
                    <span className="text-slate-600 truncate flex-1 mr-2">
                      <Eye size={11} className="inline mr-1 text-slate-400" />
                      {s.pfad || s.seite}
                    </span>
                    <span className="text-slate-500 font-mono">{s.besuche}x</span>
                  </div>
                ))}
              </div>
            )}
            {ws.signale && ws.signale.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {ws.signale.map((s, i) => (
                  <SignalTag key={i} label={s} type={resolveSignalType(s)} />
                ))}
              </div>
            )}
          </div>

          {/* Newsletter */}
          <div>
            <div className="text-xs text-slate-400 font-medium uppercase tracking-wider mb-2">{t('newsletter')}</div>
            <div className="flex items-center gap-4 mb-3">
              <div className="text-center">
                <div className="text-2xl font-bold text-slate-800">
                  {typeof nl.oeffnungsrate === 'number'
                    ? nl.oeffnungsrate < 1
                      ? `${Math.round(nl.oeffnungsrate * 100)}%`
                      : `${Math.round(nl.oeffnungsrate)}%`
                    : '-'
                  }
                </div>
                <div className="text-[10px] text-slate-400">{t('oeffnungsrate')}</div>
              </div>
            </div>
            {nl.klicks && nl.klicks.length > 0 && (
              <div className="space-y-1">
                <div className="text-xs text-slate-400 mb-1">{t('clickHistory')}</div>
                {nl.klicks.map((k, i) => (
                  <div key={i} className="flex items-center justify-between py-1 px-2 bg-slate-50 rounded text-xs">
                    <div className="flex items-center gap-1.5 flex-1 min-w-0">
                      {k.aktion === 'geklickt' ? (
                        <MousePointerClick size={11} className="text-emerald-500 shrink-0" />
                      ) : (
                        <Mail size={11} className="text-slate-400 shrink-0" />
                      )}
                      <span className="text-slate-600 truncate">{k.betreff}</span>
                    </div>
                    <span className="text-slate-400 whitespace-nowrap ml-2">{fmtDate(k.datum)}</span>
                  </div>
                ))}
              </div>
            )}
            {nl.signale && nl.signale.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {nl.signale.map((s, i) => (
                  <SignalTag key={i} label={s} type={resolveSignalType(s)} />
                ))}
              </div>
            )}
          </div>
        </div>
      </Section>

      {/* 3. Events & Veranstaltungen */}
      <Section title={t('eventsVorschlaege')} icon={Calendar}>
        <div className="grid grid-cols-2 gap-6">
          {/* Vergangene */}
          <div>
            <div className="text-xs text-slate-400 font-medium uppercase tracking-wider mb-2">{t('vergangeneEvents')}</div>
            {ev.vergangene && ev.vergangene.length > 0 ? (
              <div className="space-y-1.5">
                {ev.vergangene.map((e, i) => (
                  <div key={i} className="flex items-center justify-between py-1.5 px-3 bg-slate-50 rounded-lg">
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <Calendar size={13} className="text-slate-400 shrink-0" />
                      <span className="text-sm text-slate-700 truncate">{e.name}</span>
                    </div>
                    <div className="flex items-center gap-2 ml-2">
                      <span className="text-xs text-slate-400">{fmtDate(e.datum)}</span>
                      {(e.status === 'teilgenommen' || e.teilgenommen) && (
                        <span className="inline-flex items-center gap-0.5 text-[10px] font-medium text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded-full border border-emerald-200">
                          <CheckCircle size={10} /> {t('teilgenommen')}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-sm text-slate-400">{t('keineVergangeneEvents')}</div>
            )}
          </div>

          {/* Empfohlene */}
          <div>
            <div className="text-xs text-slate-400 font-medium uppercase tracking-wider mb-2">{t('empfohleneEvents')}</div>
            {ev.empfohlene && ev.empfohlene.length > 0 ? (
              <div className="space-y-1.5">
                {ev.empfohlene.map((e, i) => (
                  <div key={i} className="flex items-center justify-between py-1.5 px-3 bg-slate-50 rounded-lg">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <Calendar size={13} className="text-slate-400 shrink-0" />
                        <span className="text-sm text-slate-700 truncate">{e.name}</span>
                      </div>
                      {e.grund && (
                        <div className="text-[10px] text-slate-400 ml-[21px] mt-0.5">{e.grund}</div>
                      )}
                    </div>
                    <div className="flex items-center gap-2 ml-2 shrink-0">
                      <span className="text-xs text-slate-400">{fmtDate(e.datum)}</span>
                      <MatchBadge level={e.match} t={t} />
                      {(e.match === 'hoch' && e.aktion === 'einladen') && (
                        <button className="text-[10px] font-medium text-white bg-emerald-500 hover:bg-emerald-600 px-2 py-0.5 rounded-full transition-colors">
                          {t('einladen')}
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-sm text-slate-400">{t('keineEmpfohleneEvents')}</div>
            )}
          </div>
        </div>
      </Section>

      {/* 4. Presse & Oeffentliche Erwaehnungen */}
      <Section title={t('presseErwaehnung')} icon={Newspaper}>
        {pr.length > 0 ? (
          <div className="space-y-2">
            {pr.map((p, i) => (
              <div key={i} className="flex items-start justify-between py-2 px-3 bg-slate-50 rounded-lg">
                <div className="flex items-start gap-2.5 flex-1 min-w-0">
                  <Newspaper size={14} className="text-slate-400 mt-0.5 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-slate-700">{p.titel}</div>
                    <div className="text-xs text-slate-400 mt-0.5">
                      {p.quelle} &middot; {fmtDate(p.datum)}
                    </div>
                  </div>
                </div>
                {p.signal && (
                  <SignalTag label={p.signal} type={resolveSignalType(p.signal)} />
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-sm text-slate-400">{t('keinePresse')}</div>
        )}
      </Section>
    </div>
  );
}
