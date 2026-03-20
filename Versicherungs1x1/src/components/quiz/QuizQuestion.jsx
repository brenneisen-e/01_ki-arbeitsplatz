import { useState } from 'react';
import { Check, ChevronRight } from '../ui/Icons';

export default function QuizQuestion({ question, index, total, onAnswer, onNext }) {
  const [selected, setSelected] = useState(null);
  const [answered, setAnswered] = useState(false);

  const handleSelect = (optIdx) => {
    if (answered) return;
    setSelected(optIdx);
    setAnswered(true);
    onAnswer(optIdx === question.correct);
  };

  const isLast = index >= total - 1;

  return (
    <div className="card-base p-6 animate-fade-in-up">
      {/* Progress */}
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-semibold text-slate-500">Frage {index + 1} / {total}</span>
        {question.chapterTitle && (
          <span className="text-[10px] font-semibold bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full">
            {question.chapterTitle}
          </span>
        )}
      </div>
      <div className="h-1 bg-slate-100 rounded-full mb-5">
        <div
          className="h-full bg-emerald-500 rounded-full transition-all"
          style={{ width: `${(index / total) * 100}%` }}
        />
      </div>

      {/* Question */}
      <p className="text-base font-semibold text-slate-900 mb-4">{question.question}</p>

      {/* Options */}
      <div className="space-y-2">
        {question.options.map((opt, oi) => {
          let cls = 'quiz-option';
          if (answered) {
            cls += ' disabled';
            if (oi === question.correct) cls += ' correct';
            if (oi === selected && oi !== question.correct) cls += ' incorrect';
          }
          return (
            <button key={oi} className={cls} onClick={() => handleSelect(oi)}>
              <span className="quiz-radio">
                {answered && oi === question.correct && <Check className="w-3 h-3" />}
              </span>
              <span>{opt}</span>
            </button>
          );
        })}
      </div>

      {/* Feedback */}
      {answered && (
        <div className="mt-4 animate-fade-in-up">
          {question.explanation && (
            <div className="text-sm text-slate-600 bg-slate-50 rounded-lg p-3 mb-3 leading-relaxed">
              {question.explanation}
            </div>
          )}
          <button
            onClick={onNext}
            className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-700 text-white rounded-lg text-sm font-medium hover:bg-emerald-800 transition"
          >
            {isLast ? 'Ergebnis anzeigen' : 'Nächste Frage'}
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}
