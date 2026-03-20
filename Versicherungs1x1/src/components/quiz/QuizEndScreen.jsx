import { useMemo } from 'react';
import { RotateCcw, ChevronLeft } from '../ui/Icons';

export default function QuizEndScreen({ questions, answers, onRestart, onBack }) {
  const { correct, pct, grade, gradeColor, chapterScores } = useMemo(() => {
    let c = 0;
    const scores = {};
    questions.forEach((q, i) => {
      const isCorrect = !!answers[i];
      if (isCorrect) c++;
      const cid = q.chapterId || 'unknown';
      if (!scores[cid]) scores[cid] = { title: q.chapterTitle || cid, correct: 0, total: 0 };
      scores[cid].total++;
      if (isCorrect) scores[cid].correct++;
    });
    const p = questions.length > 0 ? Math.round((c / questions.length) * 100) : 0;
    const g = p >= 80 ? 'Ausgezeichnet!' : p >= 60 ? 'Gut gemacht!' : p >= 40 ? 'Ausbaufähig' : 'Weitermachen!';
    const gc = p >= 80 ? '#059669' : p >= 60 ? '#2563EB' : p >= 40 ? '#D97706' : '#DC2626';
    return { correct: c, pct: p, grade: g, gradeColor: gc, chapterScores: scores };
  }, [questions, answers]);

  return (
    <div className="card-base p-8 text-center animate-fade-in-up">
      {/* Score Circle */}
      <div
        className="w-28 h-28 rounded-full border-4 mx-auto flex flex-col items-center justify-center mb-4"
        style={{ borderColor: gradeColor, color: gradeColor }}
      >
        <span className="text-3xl font-bold font-mono">{pct}%</span>
        <span className="text-xs">{correct} / {questions.length}</span>
      </div>
      <h3 className="text-xl font-bold mb-6" style={{ color: gradeColor }}>{grade}</h3>

      {/* Breakdown by module */}
      {Object.keys(chapterScores).length > 1 && (
        <div className="text-left max-w-md mx-auto mb-6">
          <h4 className="text-sm font-semibold text-slate-700 mb-3">Ergebnisse nach Modul</h4>
          <div className="space-y-2">
            {Object.values(chapterScores).map((cs, i) => {
              const cPct = Math.round((cs.correct / cs.total) * 100);
              const barColor = cPct >= 80 ? '#059669' : cPct >= 60 ? '#2563EB' : cPct >= 40 ? '#D97706' : '#DC2626';
              return (
                <div key={i} className="flex items-center gap-3">
                  <span className="text-xs text-slate-600 w-40 truncate">{cs.title}</span>
                  <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all" style={{ width: `${cPct}%`, background: barColor }} />
                  </div>
                  <span className="text-xs font-mono text-slate-500 w-10 text-right">{cs.correct}/{cs.total}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center justify-center gap-3">
        <button
          onClick={onRestart}
          className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-700 text-white rounded-lg text-sm font-medium hover:bg-emerald-800 transition"
        >
          <RotateCcw className="w-4 h-4" /> Nochmals
        </button>
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 px-4 py-2 border border-slate-200 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-50 transition"
        >
          <ChevronLeft className="w-4 h-4" /> Zurück zur Übersicht
        </button>
      </div>
    </div>
  );
}
