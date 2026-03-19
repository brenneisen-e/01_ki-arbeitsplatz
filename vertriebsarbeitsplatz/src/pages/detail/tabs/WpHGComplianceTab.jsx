import { VV_WPHG, VV_PERFORMANCE } from '../../../data/vvDataProvider';
import { formatEur } from '../../../utils/formatters';
import { CheckCircle, AlertTriangle, Shield, FileText, TrendingDown, Receipt, Target, Leaf, Clock } from 'lucide-react';
import { clsx } from 'clsx';
import useTranslation from '../../../i18n/useTranslation';
import Card from '../../../components/ui/Card';

// ─── Helper: format date ───
import { getLang } from '../../../utils/langHelper';
function fmtDate(d) {
  if (!d) return '-';
  return new Date(d).toLocaleDateString(getLang() === 'en' ? 'en-GB' : 'de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

// ─── Helper: days until date ───
function daysUntil(dateStr) {
  if (!dateStr) return Infinity;
  const diff = new Date(dateStr) - new Date();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

// ─── Status badge ───
function StatusBadge({ status, t }) {
  const isOk = status === 'vollstaendig' || status === 'aktuell' || status === 'bereitgestellt' || status === 'Geeignet' || status === 'geeignet';
  const isWarn = status === 'aktualisierung_noetig';
  return (
    <span className={clsx(
      'inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full',
      isOk && 'bg-emerald-50 text-emerald-700',
      isWarn && 'bg-amber-50 text-amber-700',
      !isOk && !isWarn && 'bg-slate-100 text-slate-600',
    )}>
      {isOk && <CheckCircle size={12} />}
      {isWarn && <AlertTriangle size={12} />}
      {status === 'vollstaendig' ? (t ? t('vollstaendig') : 'Vollständig') : status === 'aktualisierung_noetig' ? (t ? t('aktualisierungNoetig') : 'Aktualisierung nötig') : status}
    </span>
  );
}

// ─── Experience checkmarks ───
function ErfahrungCheck({ label, value }) {
  return (
    <span className={clsx(
      'inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full border',
      value ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-slate-50 text-slate-400 border-slate-200',
    )}>
      {value ? <CheckCircle size={11} /> : <span className="w-[11px] h-[11px] rounded-full border border-slate-300" />}
      {label}
    </span>
  );
}

// ─── Info row ───
function InfoRow({ label, value, icon: Icon }) {
  return (
    <div className="grid grid-cols-[200px_1fr] gap-4 items-start py-2">
      <span className="text-slate-500 text-[15px] flex items-center gap-1.5">
        {Icon && <Icon size={14} className="text-slate-400" />}
        {label}
      </span>
      <span className="text-slate-800 text-[15px] font-medium">{value}</span>
    </div>
  );
}

// ─── Verlustschwelle bar ───
function VerlustschwelleBar({ trigger, drawdown, t }) {
  const absDrawdown = Math.abs(drawdown);
  const absTrigger = Math.abs(trigger);
  const pct = absTrigger > 0 ? (absDrawdown / absTrigger) * 100 : 0;
  const color = pct < 50 ? 'bg-emerald-500' : pct < 75 ? 'bg-amber-500' : 'bg-red-500';
  const textColor = pct < 50 ? 'text-emerald-700' : pct < 75 ? 'text-amber-700' : 'text-red-700';

  return (
    <div className="space-y-2">
      <div className="flex justify-between text-xs text-slate-500">
        <span>0%</span>
        <span className={clsx('font-semibold', textColor)}>{t('aktuellLabel')}: {drawdown.toFixed(1)}%</span>
        <span className="font-medium text-red-600">{t('schwelleLabel')}: {trigger}%</span>
      </div>
      <div className="relative h-4 bg-slate-100 rounded-full overflow-hidden">
        {/* Trigger marker */}
        <div className="absolute right-0 top-0 bottom-0 w-0.5 bg-red-500 z-10" />
        {/* Progress */}
        <div
          className={clsx('absolute left-0 top-0 bottom-0 rounded-full transition-all', color)}
          style={{ width: `${Math.min(pct, 100)}%` }}
        />
      </div>
      <div className="flex justify-between text-[10px] text-slate-400">
        <span>{t('sicher')}</span>
        <span>50%</span>
        <span>75%</span>
        <span>{t('schwelleLabel')}</span>
      </div>
    </div>
  );
}

// ─── Section card wrapper ───
function Section({ title, icon: Icon, children }) {
  return (
    <Card>
      <div className="flex items-center gap-2 mb-4">
        {Icon && <Icon size={18} className="text-slate-500" strokeWidth={1.75} />}
        <h3 className="font-semibold text-slate-800">{title}</h3>
      </div>
      {children}
    </Card>
  );
}

// ─── Main component ───
export default function WpHGComplianceTab({ kunde }) {
  const { t } = useTranslation();
  const wphg = VV_WPHG[kunde?.id];
  const perf = VV_PERFORMANCE[kunde?.id];

  if (!wphg) {
    return (
      <div className="space-y-4">
        <Card>
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mb-4">
              <Shield className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="font-semibold text-slate-700 mb-1">{t('wphgDatenNichtVerfuegbar')}</h3>
            <p className="text-sm text-slate-400 max-w-md">
              {t('wphgDatenFehlen', { name: kunde?.name || 'diesen Mandanten' })}
            </p>
          </div>
        </Card>
      </div>
    );
  }

  const erfahrungLabels = {
    aktien: t('aktien'), anleihen: t('anleihen'), fonds: t('fonds'), pe: t('peAlternative'),
    derivate: t('derivate'), krypto: t('krypto'),
  };

  const rl = wphg.anlagerichtlinie || {};
  const gp = wphg.geeignetheit || {};
  const ki = wphg.kosteninformation || {};
  const zm = wphg.zielmarktabgleich || {};
  const vs = perf?.verlustschwelle;

  const gpDaysLeft = daysUntil(gp.naechsterFaellig);
  const profilDaysLeft = daysUntil(wphg.naechsteFaelligkeit);

  return (
    <div className="space-y-4">
      {/* 1. Status-Übersicht (4 Karten) */}
      <div className="grid grid-cols-4 gap-4">
        {[
          {
            label: t('fragebogen'),
            status: wphg.status,
            detail: wphg.status === 'aktualisierung_noetig'
              ? `${t('faelligSeit')} ${fmtDate(wphg.naechsteFaelligkeit)}`
              : `${t('aktuellLabel')} (${fmtDate(wphg.letzteAktualisierung)})`,
            icon: FileText,
          },
          {
            label: t('geeignetheit'),
            status: gp.ergebnis === 'Geeignet' ? 'vollstaendig' : 'aktualisierung_noetig',
            detail: `${gp.ergebnis || '–'} (${gp.letzterBericht || '–'})`,
            icon: Shield,
          },
          {
            label: t('verlustschwelle'),
            status: vs && Math.abs(vs.aktuell) / Math.abs(vs.grenze) > 0.8 ? 'aktualisierung_noetig' : 'vollstaendig',
            detail: vs ? `${vs.aktuell.toFixed(1)}% / ${vs.grenze}%` : '–',
            icon: TrendingDown,
          },
          {
            label: t('kosteninformation'),
            status: ki.exAnte?.status === 'bereitgestellt' && ki.exPost?.status === 'bereitgestellt' ? 'vollstaendig' : 'aktualisierung_noetig',
            detail: ki.exAnte?.status === 'bereitgestellt' && ki.exPost?.status === 'bereitgestellt' ? t('vollstaendig') : t('ausstehend'),
            icon: Receipt,
          },
        ].map((item) => {
          const isOk = item.status === 'vollstaendig';
          const borderColor = isOk ? 'border-l-emerald-500' : 'border-l-amber-400';
          const Icon = item.icon;
          return (
            <Card
              key={item.label}
              className={`border-l-4 ${borderColor} p-4`}
              padding={false}
            >
              <div className="flex items-center gap-2 mb-2">
                <Icon size={16} className="text-slate-400" />
                <span className="text-xs font-medium text-slate-500">{item.label}</span>
              </div>
              <StatusBadge status={item.status} t={t} />
              <p className="text-xs text-slate-500 mt-2">{item.detail}</p>
            </Card>
          );
        })}
      </div>

      {/* 2. WpHG-Bogen (Anlegerprofil) */}
      <Section title={t('wphgBogen')} icon={FileText}>
        <div className="space-y-1">
          <div className="grid grid-cols-[200px_1fr] gap-4 items-center py-2">
            <span className="text-slate-500 text-[15px]">Status</span>
            <StatusBadge status={wphg.status} t={t} />
          </div>
          <InfoRow label={t('letzteAktualisierung')} value={fmtDate(wphg.letzteAktualisierung)} icon={Clock} />
          <InfoRow
            label={t('naechsteFaelligkeit')}
            value={
              <span className="flex items-center gap-1.5">
                {fmtDate(wphg.naechsteFaelligkeit)}
                {profilDaysLeft < 60 && (
                  <span className="inline-flex items-center gap-0.5 text-[10px] text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded-full">
                    <AlertTriangle size={10} /> {profilDaysLeft} {t('tage')}
                  </span>
                )}
              </span>
            }
          />
          <InfoRow label={t('risikoprofilLabel')} value={wphg.risikoprofil} />

          {/* Anlageerfahrung */}
          <div className="pt-3 border-t border-slate-100">
            <span className="text-sm text-slate-500 mb-3 block font-medium">{t('anlageerfahrung')}</span>
            <div className="flex flex-wrap gap-1.5">
              {Object.entries(wphg.anlageerfahrung || {}).map(([key, val]) => (
                <ErfahrungCheck key={key} label={erfahrungLabels[key] || key} value={val} />
              ))}
            </div>
          </div>

          <InfoRow label={t('anlageziel')} value={wphg.anlageziel} />
          <InfoRow label={t('anlagehorizont')} value={wphg.anlagehorizont} />
          <InfoRow label={t('verlusttoleranz')} value={wphg.verlusttoleranz} />

          {/* ESG-Präferenzen */}
          <div className="pt-3 border-t border-slate-100">
            <div className="flex items-center gap-1.5 mb-3">
              <Leaf size={14} className="text-emerald-500" />
              <span className="text-sm text-slate-500 font-medium">{t('esgPraeferenzen')}</span>
            </div>
            <div className="pl-5 space-y-0">
              <InfoRow label="SFDR" value={wphg.esgPraeferenzen?.sfdr || '-'} />
              <InfoRow label="Taxonomie" value={wphg.esgPraeferenzen?.taxonomie || '-'} />
              <InfoRow label="PAI" value={wphg.esgPraeferenzen?.pai ? t('beruecksichtigt') : t('nichtBeruecksichtigt')} />
            </div>
          </div>

          {/* Anlagerichtlinie */}
          <div className="pt-3 border-t border-slate-100">
            <span className="text-sm text-slate-500 mb-3 block font-medium">{t('anlagerichtlinie')}</span>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid grid-cols-[120px_1fr] gap-2 items-center">
                <span className="text-[15px] text-slate-500">{t('maxAktien')}</span>
                <span className="text-[15px] text-slate-800 font-medium">{rl.maxAktien}%</span>
              </div>
              <div className="grid grid-cols-[120px_1fr] gap-2 items-center">
                <span className="text-[15px] text-slate-500">{t('minRenten')}</span>
                <span className="text-[15px] text-slate-800 font-medium">{rl.minRenten}%</span>
              </div>
              <div className="grid grid-cols-[120px_1fr] gap-2 items-center">
                <span className="text-[15px] text-slate-500">{t('krypto')}</span>
                <span className="text-[15px] text-slate-800 font-medium">{rl.krypto}</span>
              </div>
              <div className="grid grid-cols-[120px_1fr] gap-2 items-center">
                <span className="text-[15px] text-slate-500">{t('alternatives')}</span>
                <span className="text-[15px] text-slate-800 font-medium">{rl.alternatives}</span>
              </div>
            </div>
            {rl.benchmark && (
              <div className="mt-3 grid grid-cols-[120px_1fr] gap-2 items-center">
                <span className="text-[15px] text-slate-500">{t('benchmark')}</span>
                <span className="text-[15px] text-slate-800 font-medium">{rl.benchmark}</span>
              </div>
            )}
          </div>
        </div>
      </Section>

      <div className="grid grid-cols-2 gap-4">
        {/* 3. Geeignetheitsprüfung */}
        <Section title={t('geeignetheitspruefung')} icon={Shield}>
          <div className="space-y-0">
            <InfoRow label={t('letzterBericht')} value={gp.letzterBericht || '-'} />
            <InfoRow label={t('erstellt')} value={fmtDate(gp.erstellt)} />
            <InfoRow
              label={t('naechsteFaelligkeit')}
              value={
                <span className="flex items-center gap-1.5">
                  {fmtDate(gp.naechsterFaellig)}
                  {gpDaysLeft < 60 && (
                    <span className="inline-flex items-center gap-0.5 text-[10px] text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded-full">
                      <AlertTriangle size={10} /> {gpDaysLeft}d
                    </span>
                  )}
                </span>
              }
            />
            <div className="grid grid-cols-[200px_1fr] gap-4 items-center py-2">
              <span className="text-slate-500 text-[15px]">{t('ergebnis')}</span>
              <StatusBadge status={gp.ergebnis} t={t} />
            </div>
          </div>
        </Section>

        {/* 4. Verlustschwelle */}
        <Section title={t('verlustschwelle')} icon={TrendingDown}>
          {vs ? (
            <div className="space-y-3">
              <VerlustschwelleBar trigger={vs.grenze} drawdown={vs.aktuell} t={t} />
              <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-100">
                <div className="text-center">
                  <div className="text-[10px] text-slate-400">{t('hoechststandLabel')}</div>
                  <div className="text-sm font-mono font-semibold text-slate-700">
                    {kunde.aum ? formatEur(Math.round(kunde.aum / (1 + vs.aktuell / 100))) : '-'}
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-[10px] text-slate-400">{t('aktuellStand')}</div>
                  <div className="text-sm font-mono font-semibold text-slate-700">
                    {kunde.aum ? formatEur(kunde.aum) : '-'}
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-[10px] text-slate-400">Trigger</div>
                  <div className="text-sm font-mono font-semibold text-red-600">{vs.grenze}%</div>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-sm text-slate-400">{t('keineVerlustschwellendaten')}</div>
          )}
        </Section>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* 5. Kosteninformation */}
        <Section title={t('kosteninformation')} icon={Receipt}>
          <div className="space-y-0">
            <div className="grid grid-cols-[200px_1fr] gap-4 items-center py-2">
              <span className="text-slate-500 text-[15px]">Ex-Ante</span>
              <span className="flex items-center gap-2">
                <StatusBadge status={ki.exAnte?.status || '-'} t={t} />
                <span className="text-xs text-slate-400">{fmtDate(ki.exAnte?.datum)}</span>
              </span>
            </div>
            <div className="grid grid-cols-[200px_1fr] gap-4 items-center py-2">
              <span className="text-slate-500 text-[15px]">Ex-Post</span>
              <span className="flex items-center gap-2">
                <StatusBadge status={ki.exPost?.status || '-'} t={t} />
                <span className="text-xs text-slate-400">{fmtDate(ki.exPost?.datum)}</span>
              </span>
            </div>
            <div className="pt-2 border-t border-slate-100">
              <InfoRow label={t('gesamtkosten')} value={formatEur(ki.gesamtkosten)} />
              <InfoRow label={t('kostenquote')} value={ki.quote ? `${ki.quote.toFixed(2)}% p.a.` : '-'} />
            </div>
          </div>
        </Section>

        {/* 6. Zielmarktabgleich */}
        <Section title={t('zielmarktabgleich')} icon={Target}>
          <div className="space-y-2">
            <InfoRow label={t('positionenGeprueft')} value={zm.positionen || '-'} />
            <InfoRow label={t('konform')} value={zm.konform || '-'} />
            {zm.letzterCheck && (
              <InfoRow label={t('letzterCheck')} value={fmtDate(zm.letzterCheck)} />
            )}
            {(zm.konform != null && zm.positionen != null) && (
              <div className="pt-2 border-t border-slate-100">
                <div className="flex items-center gap-2">
                  {zm.konform === zm.positionen ? (
                    <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-700 bg-emerald-50 px-2 py-1 rounded-full">
                      <CheckCircle size={12} /> {t('allePositionenKonform')}
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-xs font-medium text-amber-700 bg-amber-50 px-2 py-1 rounded-full">
                      <AlertTriangle size={12} /> {t('nichtKonform', { count: zm.positionen - zm.konform })}
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>
        </Section>
      </div>
    </div>
  );
}
