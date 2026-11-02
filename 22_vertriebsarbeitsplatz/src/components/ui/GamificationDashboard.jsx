import { useMemo } from 'react';
import { Trophy, Target, TrendingUp, Flame, Zap, Calendar, ArrowRight, Award, Repeat } from 'lucide-react';
import Card from './Card';
import { formatEur } from '../../utils/formatters';
import useTranslation from '../../i18n/useTranslation';

/**
 * Gamification dashboard above the Potenziale Kanban board.
 *
 * Shows the advisor's progress on three KPIs (Abschlüsse, Volumen, Conv-Rate),
 * a streak indicator, and three KI-empfohlene "Quick Wins" for the day.
 *
 * The values use the in-session kanban state where possible so they react to
 * actual moves the advisor makes during the demo.
 */
export default function GamificationDashboard({ potentiale, kanbanState, onQuickWinClick }) {
  const { t, lang } = useTranslation();
  const stats = useMemo(() => {
    const abgeschlossen = potentiale.filter(p => p.status === 'abgeschlossen');
    const nichtSinnvoll = potentiale.filter(p => p.status === 'nicht_sinnvoll');
    const abschluesse = abgeschlossen.length;
    const abschlussVolumen = abgeschlossen.reduce((s, p) => {
      const ov = p._override || {};
      return s + (ov.volumen || p.volumen || 0);
    }, 0);
    // Historischer Baseline-Anteil verworfener Potenziale, damit die
    // Conversion-Rate realistisch (~80%) startet, statt bei 100% zu kleben
    // wenn der Berater noch keine Karte nach „Nicht sinnvoll" gezogen hat.
    const HISTORICAL_DISMISSED = Math.round(abgeschlossen.length * 0.25);
    const convDenominator = abgeschlossen.length + nichtSinnvoll.length + HISTORICAL_DISMISSED;
    const convRate = convDenominator > 0
      ? (abgeschlossen.length / convDenominator) * 100
      : 0;
    return { abschluesse, abschlussVolumen, convRate };
  }, [potentiale]);

  // Static targets — in einer echten App vom Filialleiter konfigurierbar
  const targets = {
    abschluesse: 45,
    volumen: 80000,
    convRate: 85,
  };

  // Streak — gezählt aus dem kanbanState (Einträge pro Tag in den letzten 14 Werktagen)
  const streak = useMemo(() => {
    const movesByDay = {};
    Object.values(kanbanState || {}).forEach(entry => {
      if (!entry?.movedAt) return;
      const day = entry.movedAt.split('T')[0];
      movesByDay[day] = (movesByDay[day] || 0) + 1;
    });
    // Rückwärts vom heutigen Tag, Wochenenden überspringen
    const today = new Date();
    const days = [];
    let count = 0;
    let streakActive = true;
    for (let i = 0; i < 10; i++) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const dow = d.getDay();
      if (dow === 0 || dow === 6) continue; // Sa/So überspringen
      const key = d.toISOString().split('T')[0];
      // Demo-Streak: erste 8 Tage aktiv, danach noch 0
      const baseActive = i < 8;
      const moved = !!movesByDay[key];
      const active = baseActive || moved;
      if (i === 0 && !active) streakActive = false;
      if (active && streakActive) count++;
      days.unshift({ date: key, active, label: d.toLocaleDateString(lang === 'en' ? 'en-US' : 'de-DE', { weekday: 'short' }).replace('.', '') });
    }
    return { count, days };
  }, [kanbanState, lang]);

  // Quick Wins — drei niedrig-effort, hoch-konfidente Potenziale.
  // Nur Status „identifiziert" (noch nicht in Bearbeitung / nicht in Termin
  // / nicht abgeschlossen) — sonst wären es keine neuen Empfehlungen.
  const quickWins = useMemo(() => {
    const candidates = potentiale.filter(p => p.status === 'identifiziert');
    // Sortiere nach Priorität, dann Volumen
    const prioRank = { sehr_hoch: 4, hoch: 3, mittel: 2, niedrig: 1 };
    const sorted = [...candidates].sort((a, b) => {
      const pa = prioRank[a.prioritaet] || 0;
      const pb = prioRank[b.prioritaet] || 0;
      if (pb !== pa) return pb - pa;
      return (b.volumen || 0) - (a.volumen || 0);
    });
    return sorted.slice(0, 3);
  }, [potentiale]);

  return (
    <Card hover={false}>
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: 'var(--mode-primary-soft)' }}>
            <Trophy size={16} style={{ color: 'var(--mode-accent)' }} strokeWidth={1.75} />
          </div>
          <h3 className="font-semibold" style={{ color: 'var(--text-primary)' }}>{t('gamiDeinMonat')}</h3>
        </div>
        <div className="text-xs font-mono" style={{ color: 'var(--text-tertiary)' }}>
          {new Date().toLocaleDateString(lang === 'en' ? 'en-US' : 'de-DE', { month: 'long', year: 'numeric' })}
        </div>
      </div>

      {/* Progress KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-5">
        <ProgressCard
          icon={Target}
          label={t('gamiAbschluesse')}
          zielLabel={t('gamiZiel')}
          current={stats.abschluesse}
          target={targets.abschluesse}
          format={(n) => n}
        />
        <ProgressCard
          icon={TrendingUp}
          label={t('gamiAbschlussVolumen')}
          zielLabel={t('gamiZiel')}
          current={stats.abschlussVolumen}
          target={targets.volumen}
          format={(n) => formatEur(n)}
        />
        <ProgressCard
          icon={Zap}
          label={t('gamiConversionRate')}
          zielLabel={t('gamiZiel')}
          current={stats.convRate}
          target={targets.convRate}
          format={(n) => `${n.toFixed(1)}%`}
        />
      </div>

      {/* Streak + Quick Wins nebeneinander, damit beides nicht die volle
          Breite einnimmt. Auf schmaleren Viewports stapeln sie wieder. */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Linke Spalte: Streak + Ranking + Cross-Sell — vertikal gestapelt,
            damit visuell in etwa die Höhe der drei Quick-Win-Karten rechts. */}
        <div className="space-y-2">
          {/* Streak: Flame in einfarbigem Orange */}
          <InfoTile icon={Flame} iconColor="var(--color-orange-500)" iconBg="var(--color-orange-50)">
            <div className="flex-1 min-w-0">
              <div className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                {t('gamiStreakText', { count: streak.count, tage: streak.count === 1 ? t('gamiTag') : t('gamiTage') })}
              </div>
              <div className="text-xs mt-0.5" style={{ color: 'var(--text-secondary)' }}>
                {streak.count >= 20 ? t('gamiUnaufhaltsam') : streak.count >= 10 ? t('gamiAufKurs') : streak.count >= 5 ? t('gamiSolideWoche') : t('gamiStreakAufbauen')}
              </div>
            </div>
            <div className="flex items-center gap-1 shrink-0">
              {streak.days.map((d, i) => (
                <div
                  key={i}
                  className="flex flex-col items-center gap-0.5"
                  title={d.date}
                >
                  <div
                    className="w-3 h-3 rounded-full transition-colors"
                    style={d.active
                      ? { background: 'var(--color-orange-500)' }
                      : { background: 'var(--bg-card)', border: '1px solid var(--border-medium)' }}
                  />
                  <span className="text-[9px] font-medium" style={{ color: 'var(--text-tertiary)' }}>{d.label}</span>
                </div>
              ))}
            </div>
          </InfoTile>

          {/* Filial-Ranking */}
          <InfoTile icon={Award} iconColor="var(--color-success)" iconBg="var(--tint-success)">
            <div className="flex-1 min-w-0">
              <div className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                {t('gamiPlatz2von7')}
              </div>
              <div className="text-xs mt-0.5" style={{ color: 'var(--text-secondary)' }}>
                {t('gamiPlatzSub')}
              </div>
            </div>
            <div className="shrink-0 flex items-baseline gap-1 px-2.5 py-1 rounded-full" style={{ background: 'var(--bg-inset)', border: '1px solid var(--border-light)' }}>
              <span className="text-base font-semibold font-mono" style={{ color: 'var(--mode-accent)' }}>#2</span>
              <span className="text-[10px] font-medium uppercase tracking-wider" style={{ color: 'var(--text-tertiary)' }}>/ 7</span>
            </div>
          </InfoTile>

          {/* Cross-Sell-Quote */}
          <InfoTile icon={Repeat} iconColor="var(--quelle-kommunikation)" iconBg="var(--color-violet-50)">
            <div className="flex-1 min-w-0">
              <div className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                {t('gamiCrossSellAnteil')}
              </div>
              <div className="text-xs mt-0.5" style={{ color: 'var(--text-secondary)' }}>
                {t('gamiCrossSellSub')}
              </div>
            </div>
            <div className="shrink-0 w-24">
              <div className="progress-track h-2 rounded-full overflow-hidden">
                <div className="progress-fill h-full rounded-full" style={{ width: '62%' }} />
              </div>
              <div className="text-[10px] font-mono font-medium text-right mt-0.5" style={{ color: 'var(--text-secondary)' }}>62%</div>
            </div>
          </InfoTile>
        </div>

        {/* Quick Wins */}
        <div className="rounded-xl p-4" style={{ background: 'var(--bg-inset)', border: '1px solid var(--border-light)' }}>
          <div className="flex items-center gap-2 mb-3">
            <Calendar size={16} style={{ color: 'var(--mode-primary)' }} strokeWidth={2} />
            <span className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{t('gamiKiEmpfiehlt', { count: quickWins.length })}</span>
          </div>
          <div className="space-y-2">
            {quickWins.map((qw, i) => (
              <div
                key={qw._id || i}
                className="row-hover flex items-center gap-3 rounded-lg px-3 py-2 transition-all cursor-pointer"
                style={{ background: 'var(--bg-card)', border: '1px solid var(--border-light)' }}
                onClick={() => onQuickWinClick?.(qw)}
              >
                <div className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-mono font-semibold shrink-0" style={{ background: 'var(--mode-primary-soft)', color: 'var(--mode-primary)' }}>
                  {i + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-semibold" style={{ color: 'var(--text-primary)' }}>
                      {(qw.kundeName || '').split(' ').map(n => n[0]).join('')} {qw.kundeName}
                    </span>
                    <span className="text-xs truncate" style={{ color: 'var(--text-secondary)' }}>{qw.titel}</span>
                  </div>
                  <div className="text-[11px] mt-0.5" style={{ color: 'var(--text-secondary)' }}>
                    {qw.volumen ? (
                      <span className="font-mono font-semibold" style={{ color: 'var(--text-primary)' }}>
                        {formatEur(qw.volumen)}{qw.volumenTyp === 'jaehrlich' ? t('gamiProJahrSuffix') : ''}
                      </span>
                    ) : null}
                    {qw.beschreibung && qw.volumen ? ' · ' : ''}
                    {qw.beschreibung}
                  </div>
                </div>
                <ArrowRight size={14} className="shrink-0" style={{ color: 'var(--text-tertiary)' }} />
              </div>
            ))}
            {quickWins.length === 0 && (
              <div className="text-xs italic text-center py-2" style={{ color: 'var(--text-secondary)' }}>
                {t('gamiKeineQuickWins')}
              </div>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}

// Weiße Kachel mit Hairline und einfarbigem Icon auf zart getönter Fläche.
function InfoTile({ icon: Icon, iconColor, iconBg, children }) {
  return (
    <div className="rounded-xl p-4" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-light)' }}>
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0" style={{ background: iconBg }}>
          <Icon size={20} style={{ color: iconColor }} strokeWidth={2} />
        </div>
        {children}
      </div>
    </div>
  );
}

function ProgressCard({ icon: Icon, label, zielLabel, current, target, format }) {
  const pct = target > 0 ? Math.min(100, (current / target) * 100) : 0;
  const pctRounded = Math.round(pct);

  // Farbschwellen: rot < 50, gelb 50–80, grün > 80, Gold ab 100 (Ziel erreicht)
  let barColor = 'var(--color-danger)';
  let tint = 'var(--tint-danger)';
  if (pct >= 100) {
    barColor = 'var(--mode-accent)';
    tint = 'var(--mode-primary-soft)';
  } else if (pct >= 80) {
    barColor = 'var(--color-success)';
    tint = 'var(--tint-success)';
  } else if (pct >= 50) {
    barColor = 'var(--color-warning)';
    tint = 'var(--tint-warning)';
  }

  return (
    <div className="rounded-xl p-4" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-light)' }}>
      <div className="flex items-center gap-2 mb-2">
        <span className="w-6 h-6 rounded-md flex items-center justify-center shrink-0" style={{ background: tint }}>
          <Icon size={13} style={{ color: barColor }} strokeWidth={2} />
        </span>
        <span className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: 'var(--text-tertiary)' }}>{label}</span>
      </div>
      <div className="flex items-baseline justify-between mb-2">
        <span className="text-xl font-semibold font-mono" style={{ color: 'var(--text-primary)' }}>{format(current)}</span>
        <span className="text-xs font-mono" style={{ color: 'var(--text-tertiary)' }}>/ {format(target)}</span>
      </div>
      <div className="progress-track h-2 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all"
          style={{ width: `${pct}%`, backgroundColor: barColor }}
        />
      </div>
      <div className="text-[11px] mt-1.5 font-medium" style={{ color: 'var(--text-secondary)' }}>
        <span className="font-mono">{pctRounded}%</span> {zielLabel}
      </div>
    </div>
  );
}
