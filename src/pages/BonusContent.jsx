import { useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useProgress } from '../store/ProgressContext';
import { localizeLesson, langCode } from '../utils/i18n';
import QuizEngine from '../components/QuizEngine';
import aiBasics from '../bonus/ai-basics.json';
import computerBasics from '../bonus/computer-basics.json';

const BONUS_CONTENT = {
  'ai-basics': aiBasics,
  'computer-basics': computerBasics,
};

/**
 * Bonus content unlocked via Refer & Earn — deliberately NOT wired into
 * ProgressContext (no XP/streak/chapter-completion tracking). This is
 * extra material outside the paid syllabus, so it stays fully separate
 * from chapter progress and the payment gate.
 */
export default function BonusContent() {
  const { bonusId } = useParams();
  const navigate = useNavigate();
  const { settings } = useProgress();
  const lang = langCode(settings.language);
  const raw = BONUS_CONTENT[bonusId];
  const content = useMemo(() => (raw ? localizeLesson(raw, lang) : null), [raw, lang]);
  const [quizDone, setQuizDone] = useState(false);

  if (!content) {
    return (
      <div className="p-6 text-center text-[var(--color-muted)]">
        Content not found.
        <button onClick={() => navigate('/refer')} className="block mx-auto mt-4 text-[var(--color-saffron)]">← Back to Refer & Earn</button>
      </div>
    );
  }

  return (
    <div className="pb-24 px-4 pt-6 max-w-lg mx-auto">
      <button onClick={() => navigate('/refer')} className="text-[13px] text-[var(--color-muted)] mb-4">← Back</button>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-6 text-center">
        <div className="text-5xl mb-3">{content.hero?.emoji}</div>
        <h1 className="font-display font-bold text-2xl mb-1">{content.hero?.headline}</h1>
        <p className="text-[13px] text-[var(--color-muted)]">{content.hero?.subtext}</p>
      </motion.div>

      <div className="space-y-5 mb-8">
        {content.explanation?.map((block, i) => (
          <p key={i} className="text-[14px] leading-relaxed text-[var(--color-cream)] whitespace-pre-line">
            {block.content}
          </p>
        ))}
      </div>

      {content.examples?.length > 0 && (
        <div className="mb-8">
          <p className="text-[13px] font-semibold text-[var(--color-saffron-soft)] mb-3">Example</p>
          {content.examples.map((ex, i) => (
            <div key={i} className="rounded-2xl p-4 bg-[var(--color-surface)] border border-[var(--color-border)] mb-3">
              <p className="text-[13px] font-medium mb-2">{ex.problem}</p>
              {ex.steps?.map((s, j) => (
                <p key={j} className="text-[12px] text-[var(--color-muted)] mb-1">• {s}</p>
              ))}
              <p className="text-[13px] text-[var(--color-saffron-soft)] mt-2 font-medium">{ex.answer}</p>
            </div>
          ))}
        </div>
      )}

      {content.quiz?.questions?.length > 0 && (
        <div className="mb-8">
          <p className="text-[13px] font-semibold text-[var(--color-saffron-soft)] mb-3">Quick Check</p>
          {!quizDone ? (
            <QuizEngine questions={content.quiz.questions} onComplete={() => setQuizDone(true)} />
          ) : (
            <p className="text-[13px] text-[var(--color-muted)] text-center py-4">✅ Quiz complete!</p>
          )}
        </div>
      )}

      {content.notes?.length > 0 && (
        <div className="mb-8 rounded-2xl p-4 bg-[var(--color-surface)] border border-[var(--color-border)]">
          <p className="text-[13px] font-semibold mb-2">Yaad Rakho</p>
          {content.notes.map((n, i) => (
            <p key={i} className="text-[12px] text-[var(--color-muted)] mb-1">• {n}</p>
          ))}
        </div>
      )}

      {content.summary && (
        <p className="text-[13px] text-[var(--color-muted)] leading-relaxed text-center">{content.summary}</p>
      )}
    </div>
  );
}
