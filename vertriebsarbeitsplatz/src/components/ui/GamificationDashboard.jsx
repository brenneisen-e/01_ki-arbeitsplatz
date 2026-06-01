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
        <div className="flex items-center gap-2">
          <Trophy size={20} className="text-amber-500" strokeWidth={1.75} />
          <h3 className="font-semibold text-slate-800">{t('gamiDeinMonat')}</h3>
        </div>
        <div className="text-xs text-slate-400 font-mono">
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
          {/* Streak */}
          <div className="rounded-xl border border-orange-200 bg-gradient-to-r from-orange-50 to-amber-50 p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center shrink-0">
                <Flame size={20} className="text-orange-600" strokeWidth={2} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-bold text-slate-800">
                  {t('gamiStreakText', { count: streak.count, tage: streak.count === 1 ? t('gamiTag') : t('gamiTage') })}
                </div>
                <div className="text-xs text-slate-500 mt-0.5">
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
                      className={`w-3 h-3 rounded-full transition-colors ${
                        d.active
                          ? 'bg-orange-500'
                          : 'bg-white border border-orange-200'
                      }`}
                    />
                    <span className="text-[9px] text-slate-400 font-medium">{d.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Filial-Ranking */}
          <div className="rounded-xl border border-emerald-200 bg-gradient-to-r from-emerald-50 to-teal-50 p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center shrink-0">
                <Award size={20} className="text-emerald-600" strokeWidth={2} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-bold text-slate-800">
                  {t('gamiPlatz2von7')}
                </div>
                <div className="text-xs text-slate-500 mt-0.5">
                  {t('gamiPlatzSub')}
                </div>
              </div>
              <div className="shrink-0 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white border border-emerald-200">
                <span className="text-base font-bold text-emerald-700 font-mono">#2</span>
                <span className="text-[10px] text-slate-500 font-medium uppercase tracking-wider">/ 7</span>
              </div>
            </div>
          </div>

          {/* Cross-Sell-Quote */}
          <div className="rounded-xl border border-violet-200 bg-gradient-to-r from-violet-50 to-indigo-50 p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-violet-100 flex items-center justify-center shrink-0">
                <Repeat size={20} className="text-violet-600" strokeWidth={2} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-bold text-slate-800">
                  {t('gamiCrossSellAnteil')}
                </div>
                <div className="text-xs text-slate-500 mt-0.5">
                  {t('gamiCrossSellSub')}
                </div>
              </div>
              <div className="shrink-0 w-24">
                <div className="h-2 bg-white rounded-full overflow-hidden border border-violet-200">
                  <div className="h-full rounded-full bg-violet-500" style={{ width: '62%' }} />
                </div>
                <div className="text-[10px] text-slate-500 font-medium text-right mt-0.5">62%</div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Wins */}
        <div className="rounded-xl border border-indigo-200 bg-gradient-to-br from-indigo-50/60 to-blue-50/30 p-4">
          <div className="flex items-center gap-2 mb-3">
            <Calendar size={16} className="text-indigo-600" strokeWidth={2} />
            <span className="text-sm font-bold text-slate-800">{t('gamiKiEmpfiehlt', { count: quickWins.length })}</span>
          </div>
        <div className="space-y-2">
          {quickWins.map((qw, i) => (
            <div
              key={qw._id || i}
              className="flex items-center gap-3 bg-white rounded-lg border border-slate-200 px-3 py-2 hover:border-indigo-300 hover:shadow-sm transition-all cursor-pointer"
            >
              <div className="w-7 h-7 rounded-lg bg-indigo-100 flex items-center justify-center text-xs font-bold text-indigo-700 shrink-0">
                {i + 1}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-bold text-slate-800">
                    {(qw.kundeName || '').split(' ').map(n => n[0]).join('')} {qw.kundeName}
                  </span>
                  <span className="text-xs text-slate-600 truncate">{qw.titel}</span>
                </div>
                <div className="text-[11px] text-slate-500 mt-0.5">
                  {qw.volumen ? (
                    <span className="font-mono font-semibold text-slate-700">
                      {formatEur(qw.volumen)}{qw.volumenTyp === 'jaehrlich' ? t('gamiProJahrSuffix') : ''}
                    </span>
                  ) : null}
                  {qw.beschreibung && qw.volumen ? ' · ' : ''}
                  {qw.beschreibung}
                </div>
              </div>
              <ArrowRight size={14} className="text-slate-300 shrink-0" />
            </div>
          ))}
          {quickWins.length === 0 && (
            <div className="text-xs text-slate-500 italic text-center py-2">
              {t('gamiKeineQuickWins')}
            </div>
          )}
          </div>
        </div>
      </div>
    </Card>
  );
}

function ProgressCard({ icon: Icon, label, zielLabel, current, target, format }) {
  const pct = target > 0 ? Math.min(100, (current / target) * 100) : 0;
  const pctRounded = Math.round(pct);

  // Color thresholds: red <50, amber 50-80, green >80, gold >100
  let barColor = '#dc2626';
  let bgColor = 'bg-red-50';
  let borderColor = 'border-red-200';
  if (pct >= 100) {
    barColor = '#f59e0b';
    bgColor = 'bg-amber-50';
    borderColor = 'border-amber-300';
  } else if (pct >= 80) {
    barColor = '#16a34a';
    bgColor = 'bg-emerald-50';
    borderColor = 'border-emerald-200';
  } else if (pct >= 50) {
    barColor = '#f59e0b';
    bgColor = 'bg-amber-50';
    borderColor = 'border-amber-200';
  }

  return (
    <div className={`rounded-xl border ${borderColor} ${bgColor} p-4`}>
      <div className="flex items-center gap-2 mb-2">
        <Icon size={14} style={{ color: barColor }} strokeWidth={2} />
        <span className="text-xs font-semibold text-slate-600 uppercase tracking-wider">{label}</span>
      </div>
      <div className="flex items-baseline justify-between mb-2">
        <span className="text-xl font-bold text-slate-800 font-mono">{format(current)}</span>
        <span className="text-xs text-slate-500 font-mono">/ {format(target)}</span>
      </div>
      <div className="h-2 bg-white rounded-full overflow-hidden border border-slate-200">
        <div
          className="h-full rounded-full transition-all"
          style={{ width: `${pct}%`, backgroundColor: barColor }}
        />
      </div>
      <div className="text-[11px] text-slate-500 mt-1.5 font-medium">
        {pctRounded}% {zielLabel}
      </div>
    </div>
  );
}
