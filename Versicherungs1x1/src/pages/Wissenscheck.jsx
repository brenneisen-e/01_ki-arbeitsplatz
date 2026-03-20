import { useState, useMemo, useCallback } from 'react';
import { useModule } from '../hooks/useModule';
import { getIconComponent, CheckCircle } from '../components/ui/Icons';
import QuizQuestion from '../components/quiz/QuizQuestion';
import QuizEndScreen from '../components/quiz/QuizEndScreen';

function shuffleArray(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export default function Wissenscheck() {
  const { data, openWissencheck } = useModule();
  const [moduleFilter, setModuleFilter] = useState('all');
  const [mode, setMode] = useState('all');
  const [activeQuestions, setActiveQuestions] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({});

  const getQuestions = useCallback(() => {
    if (!data) return [];
    let questions = [];
    const chapters = data.chapters || [];
    if (moduleFilter === 'all') {
      chapters.forEach(ch => {
        (ch.quiz || []).forEach(q => {
          questions.push({ ...q, chapterId: ch.id, chapterTitle: ch.title });
        });
      });
    } else {
      const ch = chapters[moduleFilter];
      if (ch?.quiz) {
        ch.quiz.forEach(q => {
          questions.push({ ...q, chapterId: ch.id, chapterTitle: ch.title });
        });
      }
    }
    if (mode === 'quick') questions = shuffleArray(questions).slice(0, 10);
    return questions;
  }, [data, moduleFilter, mode]);

  const previewCount = useMemo(() => getQuestions().length, [getQuestions]);

  const startQuiz = () => {
    setActiveQuestions(getQuestions());
    setCurrentIndex(0);
    setAnswers({});
  };

  const handleAnswer = (isCorrect) => {
    setAnswers(prev => ({ ...prev, [currentIndex]: isCorrect }));
  };

  const handleNext = () => {
    setCurrentIndex(prev => prev + 1);
  };

  const handleRestart = () => {
    setCurrentIndex(0);
    setAnswers({});
    setActiveQuestions(getQuestions());
  };

  // Active quiz
  if (activeQuestions) {
    if (currentIndex >= activeQuestions.length) {
      return (
        <div className="px-6 py-8 max-w-2xl mx-auto">
          <QuizEndScreen
            questions={activeQuestions}
            answers={answers}
            onRestart={handleRestart}
            onBack={() => setActiveQuestions(null)}
          />
        </div>
      );
    }
    return (
      <div className="px-6 py-8 max-w-2xl mx-auto">
        <QuizQuestion
          key={currentIndex}
          question={activeQuestions[currentIndex]}
          index={currentIndex}
          total={activeQuestions.length}
          onAnswer={handleAnswer}
          onNext={handleNext}
        />
      </div>
    );
  }

  // Setup view
  const chapters = data?.chapters || [];

  return (
    <div className="px-6 py-8 animate-fade-in-up">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
            <CheckCircle className="w-6 h-6 text-emerald-600" />
            Wissenscheck
          </h2>
          <p className="text-sm text-slate-500 mt-1">Teste dein Wissen zu allen Kapiteln des Versicherungs-1×1</p>
        </div>

        {/* Filter Bar */}
        <div className="card-base p-4 mb-6">
          <div className="flex flex-wrap items-end gap-4">
            <div className="flex-1 min-w-[160px]">
              <label className="block text-xs font-medium text-slate-600 mb-1">Modul</label>
              <select
                value={moduleFilter}
                onChange={e => { setModuleFilter(e.target.value === 'all' ? 'all' : Number(e.target.value)); }}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm outline-none focus:border-emerald-500"
              >
                <option value="all">Alle Module</option>
                {chapters.map((ch, i) => (
                  ch.quiz?.length > 0 && (
                    <option key={i} value={i}>
                      {String(i + 1).padStart(2, '0')}. {ch.title}
                    </option>
                  )
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Modus</label>
              <div className="flex rounded-lg border border-slate-200 overflow-hidden">
                <button
                  className={`px-3 py-2 text-xs font-medium transition ${mode === 'all' ? 'bg-emerald-700 text-white' : 'bg-white text-slate-600 hover:bg-slate-50'}`}
                  onClick={() => setMode('all')}
                >Alle Fragen</button>
                <button
                  className={`px-3 py-2 text-xs font-medium transition ${mode === 'quick' ? 'bg-emerald-700 text-white' : 'bg-white text-slate-600 hover:bg-slate-50'}`}
                  onClick={() => setMode('quick')}
                >Quick-Check (10)</button>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs font-semibold bg-slate-100 text-slate-600 px-2.5 py-1.5 rounded-lg">
                {previewCount} Fragen
              </span>
              <button
                onClick={startQuiz}
                disabled={previewCount === 0}
                className="px-4 py-2 bg-emerald-700 text-white rounded-lg text-sm font-medium hover:bg-emerald-800 transition disabled:opacity-50"
              >
                Quiz starten
              </button>
            </div>
          </div>
        </div>

        {/* Chapter Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {chapters.map((ch, i) => {
            const hasQuiz = ch.quiz?.length > 0;
            const Icon = getIconComponent(ch.icon);
            return (
              <button
                key={ch.id}
                className={`wk-chapter-card ${!hasQuiz ? 'disabled' : ''} ${moduleFilter === i ? 'active' : ''}`}
                onClick={() => hasQuiz && setModuleFilter(moduleFilter === i ? 'all' : i)}
                disabled={!hasQuiz}
              >
                <Icon className="w-5 h-5 text-emerald-700" />
                <span className="text-xs font-medium text-slate-700 leading-tight">
                  {String(i + 1).padStart(2, '0')}. {ch.title}
                </span>
                <span className="text-[10px] text-slate-400">
                  {hasQuiz ? `${ch.quiz.length} Fragen` : 'Keine Fragen'}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
