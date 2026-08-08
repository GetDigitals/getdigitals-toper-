import { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getChapterById, getFinalTest, getLessonsForChapter } from '../services/contentLoader';
import { useProgress } from '../store/ProgressContext';
import { useAuth } from '../store/AuthContext';
import { requiresPayment } from '../App';
import QuizEngine from '../components/QuizEngine';
import { localizeQuestions, langCode } from '../utils/i18n';

function gradeFor(percent) {
  if (percent >= 90) return 'A1';
  if (percent >= 80) return 'A2';
  if (percent >= 70) return 'B1';
  if (percent >= 60) return 'B2';
  if (percent >= 50) return 'C1';
  if (percent >= 33) return 'C2';
  return 'Needs Improvement';
}

export default function FinalTest() {
  const { chapterId } = useParams();
  const navigate = useNavigate();
  const chapter = getChapterById(chapterId);
  const finalTest = getFinalTest(chapterId);
  const lessons = getLessonsForChapter(chapterId);
  const { recordFinalTest, settings } = useProgress();
  const { isApproved } = useAuth();
  const lang = langCode(settings.language);
  const [started, setStarted] = useState(false);
  const [result, setResult] = useState(null);

  // Falls back to a pooled test from all lesson quizzes if no dedicated
  // final-test.json is authored yet for this chapter.
  const rawQuestions = finalTest?.questions?.length
    ? finalTest.questions
    : lessons.flatMap((l) => l.quiz?.questions || []);
  const questions = localizeQuestions(rawQuestions, lang);

  const totalMarks = finalTest?.totalMarks ?? questions.length * 1;
  const timePerQuestion = finalTest?.timerSecondsPerQuestion ?? 30;

  function handleComplete(r) {
    const grade = gradeFor(r.percent);
    const marks = Math.round((r.correct / r.total) * totalMarks);
    const payload = { score: r.percent, correct: r.correct, total: r.total, marks, totalMarks, grade, completedAt: new Date().toISOString() };
    recordFinalTest(chapter.id, payload);
    setResult(payload);
  }

  if (!chapter) return <div className="p-6 text-center text-[var(--color-muted)]">Chapter not found.</div>;

  if (result) {
    return (
      <div className="px-6 pt-10 pb-24 text-center">
        <div className="text-6xl mb-4">{result.grade === 'Needs Improvement' ? '📘' : '🏆'}</div>
        <h1 className="font-display font-bold text-2xl mb-1">Report Card</h1>
        <p className="text-[13px] text-[var(--color-muted)] mb-6">{chapter.title} · Board Pattern Test</p>
        <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-6 mb-6">
          <div className="flex justify-around mb-4">
            <div>
              <p className="font-mono text-2xl font-bold text-[var(--color-saffron)]">{result.marks}/{result.totalMarks}</p>
              <p className="text-[11px] text-[var(--color-muted)]">Marks</p>
            </div>
            <div>
              <p className="font-mono text-2xl font-bold text-[var(--color-gold)]">{result.grade}</p>
              <p className="text-[11px] text-[var(--color-muted)]">Grade</p>
            </div>
            <div>
              <p className="font-mono text-2xl font-bold text-[var(--color-success)]">{result.score}%</p>
              <p className="text-[11px] text-[var(--color-muted)]">Score</p>
            </div>
          </div>
        </div>
        {!requiresPayment(chapter) && !isApproved && result.score >= 80 && (
          <div className="rounded-2xl p-5 bg-gradient-to-br from-[var(--color-saffron)]/15 to-transparent border border-[var(--color-saffron)]/40 mb-6 text-left">
            <p className="text-[15px] font-semibold mb-1">🔥 {result.score}% — solid score!</p>
            <p className="text-[13px] text-[var(--color-muted)] mb-4">
              Tum is momentum pe achhi tarah ho — poora course unlock karke ise sab chapters pe le jao.
            </p>
            <button
              onClick={() => navigate('/payment-pending', { state: { from: `/chapter/${chapter.id}` } })}
              className="w-full py-3 rounded-xl bg-[var(--color-saffron)] font-semibold text-[14px]"
            >
              Poora course unlock karo →
            </button>
          </div>
        )}
        <button
          onClick={() => navigate(`/certificate/${chapter.id}`)}
          className="w-full py-3.5 rounded-xl bg-[var(--color-saffron)] font-semibold shadow-[var(--shadow-glow-saffron)] mb-3"
        >
          View Certificate 🎓
        </button>
        <button onClick={() => navigate(`/chapter/${chapter.id}`)} className="w-full py-2 text-[13px] text-[var(--color-muted)]">
          Back to chapter
        </button>
      </div>
    );
  }

  if (!started) {
    return (
      <div className="px-6 pt-10 pb-24 text-center">
        <div className="text-6xl mb-4">🏆</div>
        <h1 className="font-display font-bold text-2xl mb-1">Final Test</h1>
        <p className="text-[13px] text-[var(--color-muted)] mb-6">{chapter.title} · Board exam pattern, timed questions</p>
        <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-5 mb-6 text-left space-y-2">
          <p className="text-[13px] flex justify-between"><span className="text-[var(--color-muted)]">Questions</span><span className="font-mono">{questions.length}</span></p>
          <p className="text-[13px] flex justify-between"><span className="text-[var(--color-muted)]">Total Marks</span><span className="font-mono">{totalMarks}</span></p>
          <p className="text-[13px] flex justify-between"><span className="text-[var(--color-muted)]">Time / Question</span><span className="font-mono">{timePerQuestion}s</span></p>
        </div>
        <button onClick={() => setStarted(true)} className="w-full py-3.5 rounded-xl bg-[var(--color-saffron)] font-semibold shadow-[var(--shadow-glow-saffron)]">
          Start Test
        </button>
      </div>
    );
  }

  return (
    <div className="px-5 pt-6 pb-24">
      <QuizEngine questions={questions} onComplete={handleComplete} timerSeconds={timePerQuestion} />
    </div>
  );
}
