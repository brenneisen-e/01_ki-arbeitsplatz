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
import Card from '../../../components/ui/Card';

// ─── Date formatter ───
import { getLang } from '../../../utils/langHelper';
function fmtDate(d) {
  if (!d) return '-';
  return new Date(d).toLocaleDateString(getLang() === 'en' ? 'en-GB' : 'de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

// ─── Signal tag pill ───
function SignalTag({ label, type = 'neutral' }) {
  const styles = {
    neutral: 'bg-(--tint-info) text-(--color-info)',
    action: 'bg-(--tint-warning) text-(--color-warning)',
    positive: 'bg-(--tint-success) text-(--color-success)',
    negative: 'bg-(--tint-danger) text-(--color-danger)',
  };
  return (
    <span className={clsx('inline-flex items-center gap-0.5 text-[10px] font-medium px-2 py-0.5 rounded-full', styles[type] || styles.neutral)}>
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
    case 'like': return <ThumbsUp size={13} className="text-(--text-secondary)" />;
    case 'share': return <Share2 size={13} className="text-(--text-secondary)" />;
    case 'post': return <PenLine size={13} className="text-(--text-secondary)" />;
    case 'profil_update': return <Users size={13} className="text-(--text-secondary)" />;
    default: return <Eye size={13} className="text-(--text-tertiary)" />;
  }
}

// ─── Match level badge ───
function MatchBadge({ level, t }) {
  return (
    <span className={clsx(
      'inline-flex items-center gap-0.5 text-[10px] font-medium px-2 py-0.5 rounded-full',
      level === 'hoch' && 'bg-(--tint-success) text-(--color-success)',
      level === 'mittel' && 'bg-(--tint-warning) text-(--color-warning)',
      level === 'niedrig' && 'bg-(--bg-inset) text-(--text-secondary) border border-(--border-light)',
    )}>
      <Star size={10} />
      {level === 'hoch' ? (t ? t('hoch') : 'Hoch') : level === 'mittel' ? (t ? t('mittel') : 'Mittel') : (t ? t('niedrig') : 'Niedrig')}
    </span>
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
export default function EngagementTab() {
  const { t } = useTranslation();
  const { selectedKundeId, modeId } = useMode();
  const kunden = KUNDEN_BY_MODE[modeId] || [];
  const kunde = kunden.find(k => k.id === selectedKundeId);
  const data = VV_ENGAGEMENT[selectedKundeId];

  if (!data || !kunde) {
    return (
      <Card hover={false} className="p-8 text-center text-(--text-tertiary)">
        {t('keineEngagementDaten')}
      </Card>
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
                    className="flex items-center gap-1 text-sm text-(--mode-primary) hover:text-(--mode-primary-light)"
                  >
                    <ExternalLink size={13} /> {t('profilAnsehen')}
                  </a>
                )}
                <span className="text-sm text-(--text-secondary)">{li.kontakte} {t('kontakte')}</span>
              </div>
              <span className={clsx(
                'text-xs font-medium px-2 py-0.5 rounded-full',
                li.aktivitaet === 'hoch' || li.aktivitaet === 'sehr_hoch' ? 'bg-(--tint-success) text-(--color-success)' :
                li.aktivitaet === 'mittel' ? 'bg-(--tint-warning) text-(--color-warning)' :
                'bg-(--bg-inset) text-(--text-secondary)',
              )}>
                {t('aktivitaet')} {li.aktivitaet || t('keineAngabe')}
              </span>
            </div>

            {/* Timeline */}
            {li.letzteAktivitaeten && li.letzteAktivitaeten.length > 0 && (
              <div className="space-y-1.5 pt-2 border-t border-(--border-light)">
                {li.letzteAktivitaeten.map((a, i) => (
                  <div key={i} className="flex items-start gap-2.5 py-1">
                    <ActivityIcon typ={a.typ} />
                    <div className="flex-1 min-w-0">
                      <span className="text-sm text-(--text-primary)">{a.inhalt}</span>
                    </div>
                    <span className="text-xs text-(--text-tertiary) whitespace-nowrap">{fmtDate(a.datum)}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Signal tags */}
            {li.signale && li.signale.length > 0 && (
              <div className="flex flex-wrap gap-1.5 pt-2 border-t border-(--border-light)">
                {li.signale.map((s, i) => (
                  <SignalTag key={i} label={s} type={resolveSignalType(s)} />
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="text-sm text-(--text-tertiary)">{t('keinLinkedin')}</div>
        )}
      </Section>

      {/* 2. Website & Newsletter */}
      <Section title={t('websiteNewsletter')} icon={Globe}>
        <div className="grid grid-cols-2 gap-6">
          {/* Website */}
          <div>
            <div className="text-[11px] text-(--text-tertiary) font-medium uppercase tracking-wider mb-2">{t('websiteBesuche')}</div>
            <div className="flex items-center gap-4 mb-3">
              <div className="text-center">
                <div className="font-mono text-[28px] leading-none font-semibold text-(--text-primary)">{ws.besuche90Tage || 0}</div>
                <div className="text-xs text-(--text-tertiary) mt-1">{t('besuche')}</div>
              </div>
              <div className="text-center">
                <div className="font-mono text-lg font-semibold text-(--text-primary)">{ws.avgVerweildauer || '-'}</div>
                <div className="text-xs text-(--text-tertiary) mt-1">{t('avgVerweildauer')}</div>
              </div>
            </div>
            {ws.topSeiten && ws.topSeiten.length > 0 && (
              <div className="space-y-1">
                <div className="text-xs text-(--text-tertiary) mb-1">{t('topSeiten')}</div>
                {ws.topSeiten.map((s, i) => (
                  <div key={i} className="flex items-center justify-between py-1 px-2 bg-(--bg-inset) rounded text-xs">
                    <span className="text-(--text-secondary) truncate flex-1 mr-2">
                      <Eye size={11} className="inline mr-1 text-(--text-tertiary)" />
                      {s.pfad || s.seite}
                    </span>
                    <span className="text-(--text-secondary) font-mono">{s.besuche}x</span>
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
            <div className="text-[11px] text-(--text-tertiary) font-medium uppercase tracking-wider mb-2">{t('newsletter')}</div>
            <div className="flex items-center gap-4 mb-3">
              <div className="text-center">
                <div className="font-mono text-[28px] leading-none font-semibold text-(--text-primary)">
                  {typeof nl.oeffnungsrate === 'number'
                    ? nl.oeffnungsrate < 1
                      ? `${Math.round(nl.oeffnungsrate * 100)}%`
                      : `${Math.round(nl.oeffnungsrate)}%`
                    : '-'
                  }
                </div>
                <div className="text-xs text-(--text-tertiary) mt-1">{t('oeffnungsrate')}</div>
              </div>
            </div>
            {nl.klicks && nl.klicks.length > 0 && (
              <div className="space-y-1">
                <div className="text-xs text-(--text-tertiary) mb-1">{t('clickHistory')}</div>
                {nl.klicks.map((k, i) => (
                  <div key={i} className="flex items-center justify-between py-1 px-2 bg-(--bg-inset) rounded text-xs">
                    <div className="flex items-center gap-1.5 flex-1 min-w-0">
                      {k.aktion === 'geklickt' ? (
                        <MousePointerClick size={11} className="text-(--color-success) shrink-0" />
                      ) : (
                        <Mail size={11} className="text-(--text-tertiary) shrink-0" />
                      )}
                      <span className="text-(--text-secondary) truncate">{k.betreff}</span>
                    </div>
                    <span className="text-(--text-tertiary) whitespace-nowrap ml-2">{fmtDate(k.datum)}</span>
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
            <div className="text-[11px] text-(--text-tertiary) font-medium uppercase tracking-wider mb-2">{t('vergangeneEvents')}</div>
            {ev.vergangene && ev.vergangene.length > 0 ? (
              <div className="space-y-1.5">
                {ev.vergangene.map((e, i) => (
                  <div key={i} className="flex items-center justify-between py-1.5 px-3 bg-(--bg-inset) rounded-lg">
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <Calendar size={13} className="text-(--text-tertiary) shrink-0" />
                      <span className="text-sm text-(--text-primary) truncate">{e.name}</span>
                    </div>
                    <div className="flex items-center gap-2 ml-2">
                      <span className="text-xs text-(--text-tertiary)">{fmtDate(e.datum)}</span>
                      {(e.status === 'teilgenommen' || e.teilgenommen) && (
                        <span className="inline-flex items-center gap-0.5 text-[10px] font-medium text-(--color-success) bg-(--tint-success) px-1.5 py-0.5 rounded-full">
                          <CheckCircle size={10} /> {t('teilgenommen')}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-sm text-(--text-tertiary)">{t('keineVergangeneEvents')}</div>
            )}
          </div>

          {/* Empfohlene */}
          <div>
            <div className="text-[11px] text-(--text-tertiary) font-medium uppercase tracking-wider mb-2">{t('empfohleneEvents')}</div>
            {ev.empfohlene && ev.empfohlene.length > 0 ? (
              <div className="space-y-1.5">
                {ev.empfohlene.map((e, i) => (
                  <div key={i} className="flex items-center justify-between py-1.5 px-3 bg-(--bg-inset) rounded-lg">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <Calendar size={13} className="text-(--text-tertiary) shrink-0" />
                        <span className="text-sm text-(--text-primary) truncate">{e.name}</span>
                      </div>
                      {e.grund && (
                        <div className="text-[10px] text-(--text-tertiary) ml-[21px] mt-0.5">{e.grund}</div>
                      )}
                    </div>
                    <div className="flex items-center gap-2 ml-2 shrink-0">
                      <span className="text-xs text-(--text-tertiary)">{fmtDate(e.datum)}</span>
                      <MatchBadge level={e.match} t={t} />
                      {(e.match === 'hoch' && e.aktion === 'einladen') && (
                        <button className="text-[10px] font-medium text-white bg-(--mode-primary) hover:bg-(--mode-primary-light) px-2 py-0.5 rounded-full transition-colors">
                          {t('einladen')}
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-sm text-(--text-tertiary)">{t('keineEmpfohleneEvents')}</div>
            )}
          </div>
        </div>
      </Section>

      {/* 4. Presse & Oeffentliche Erwaehnungen */}
      <Section title={t('presseErwaehnung')} icon={Newspaper}>
        {pr.length > 0 ? (
          <div className="space-y-2">
            {pr.map((p, i) => (
              <div key={i} className="flex items-start justify-between py-2 px-3 bg-(--bg-inset) rounded-lg">
                <div className="flex items-start gap-2.5 flex-1 min-w-0">
                  <Newspaper size={14} className="text-(--text-tertiary) mt-0.5 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-(--text-primary)">{p.titel}</div>
                    <div className="text-xs text-(--text-tertiary) mt-0.5">
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
          <div className="text-sm text-(--text-tertiary)">{t('keinePresse')}</div>
        )}
      </Section>
    </div>
  );
}
