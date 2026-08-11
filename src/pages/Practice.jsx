import { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getChapterById, getLessonsForChapter } from '../services/contentLoader';
import { useProgress } from '../store/ProgressContext';
import QuizEngine from '../components/QuizEngine';
import { localizeQuestions, langCode, t } from '../utils/i18n';

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const LEVELS = [
  { id: 'easy', label: 'Easy' },
  { id: 'medium', label: 'Medium' },
  { id: 'hard', label: 'Hard' },
];

export default function Practice() {
  const { chapterId } = useParams();
  const navigate = useNavigate();
  const chapter = getChapterById(chapterId);
  const lessons = getLessonsForChapter(chapterId);
  const { recordPractice, settings } = useProgress();
  const lang = langCode(settings.language);
  const [level, setLevel] = useState('easy');
  const [session, setSession] = useState(null);

  // Pool every quiz question across the chapter's lessons, filterable by difficulty tag
  const pool = useMemo(() => {
    const all = lessons.flatMap((l) => (l.quiz?.questions || []).map((q) => ({ ...q, difficulty: q.difficulty || 'easy' })));
    return localizeQuestions(all, lang);
  }, [lessons, lang]);

  function startSession() {
    if (pool.length === 0) return; // nothing to practice yet — button is hidden below anyway, this is just a safety net
    const filtered = pool.filter((q) => q.difficulty === level);
    const chosen = shuffle(filtered.length ? filtered : pool).slice(0, 8);
    setSession(chosen);
  }

  function handleComplete(result) {
    recordPractice(chapter.id, result.correct, result.total);
    setSession(null);
  }

  if (!chapter) return <div className="p-6 text-center text-[var(--color-muted)]">Chapter not found.</div>;

  return (
    <div className="pb-24 px-4 pt-6">
      <button onClick={() => navigate(-1)} className="text-[13px] text-[var(--color-muted)] mb-3">← Back</button>
      <h1 className="font-display font-bold text-2xl mb-1">Practice</h1>
      <p className="text-[13px] text-[var(--color-muted)] mb-5">{t(chapter.title, lang)} · unlimited questions, shuffled every time.</p>

      {pool.length === 0 ? (
        <p className="text-[13px] text-[var(--color-muted)] text-center py-10">Is chapter ke liye practice questions abhi authored nahi hue.</p>
      ) : !session ? (
        <>
          <p className="text-[13px] font-medium mb-2">Choose difficulty</p>
          <div className="flex gap-2 mb-6">
            {LEVELS.map((l) => (
              <button
                key={l.id}
                onClick={() => setLevel(l.id)}
                className={`flex-1 py-2.5 rounded-xl border text-[13px] font-medium ${
                  level === l.id ? 'border-[var(--color-saffron)] bg-[var(--color-saffron)]/15 text-[var(--color-saffron-soft)]' : 'border-[var(--color-border)] bg-[var(--color-surface)]'
                }`}
              >
                {l.label}
              </button>
            ))}
          </div>
          <button onClick={startSession} className="w-full py-3.5 rounded-xl bg-[var(--color-saffron)] font-semibold shadow-[var(--shadow-glow-saffron)]">
            Start Practice
          </button>
        </>
      ) : (
        <QuizEngine questions={session} onComplete={handleComplete} />
      )}
    </div>
  );
}
