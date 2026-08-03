import { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { getLesson, getChapterById, getNextLesson, getNextChapter } from '../services/contentLoader';
import { useProgress } from '../store/ProgressContext';
import QuizEngine from '../components/QuizEngine';
import RewardModal from '../components/RewardModal';
import { localizeLesson, langCode } from '../utils/i18n';

/**
 * The lesson screen is built entirely from whichever sections exist in
 * the lesson JSON. Missing a `diagram` block? That step is simply
 * skipped — no code branch needed per lesson.
 */
export default function Lesson() {
  const { chapterId, lessonId } = useParams();
  const navigate = useNavigate();
  const { completeLesson, addStudyTime, recordStreak, awardBadge, isLessonComplete, settings } = useProgress();

  const rawLesson = getLesson(chapterId, lessonId);
  const lesson = useMemo(() => localizeLesson(rawLesson, langCode(settings.language)), [rawLesson, settings.language]);
  const chapter = getChapterById(chapterId);
  const [step, setStep] = useState(0);
  const [showReward, setShowReward] = useState(false);
  const [quizResult, setQuizResult] = useState(null);

  const sections = useMemo(() => {
    if (!lesson) return [];
    const s = [];
    if (lesson.hero) s.push('hero');
    if (lesson.story) s.push('story');
    if (lesson.explanation?.length) s.push('explanation');
    if (lesson.diagram) s.push('diagram');
    if (lesson.examples?.length) s.push('examples');
    if (lesson.quiz?.questions?.length) s.push('quiz');
    if (lesson.notes?.length) s.push('notes');
    if (lesson.summary) s.push('summary');
    return s;
  }, [lesson]);

  if (!lesson || !chapter) {
    return <div className="p-6 text-center text-[var(--color-muted)]">Lesson not found.</div>;
  }

  const current = sections[step];
  const isLast = step === sections.length - 1;

  function goNext() {
    if (current === 'quiz' && !quizResult) return; // must finish quiz first
    if (isLast) {
      finishLesson();
      return;
    }
    setStep((s) => s + 1);
  }

  function finishLesson() {
    completeLesson(lesson, chapter.id, quizResult);
    addStudyTime(lesson.estimatedMinutes ?? 5);
    recordStreak();
    if (lesson.reward?.badge && !isLessonComplete(lesson.id)) {
      awardBadge(lesson.reward.badge.id);
    }
    setShowReward(true);
  }

  function afterReward() {
    setShowReward(false);
    const next = getNextLesson(chapter.id, lesson.id);
    if (next) {
      navigate(`/lesson/${chapter.id}/${next.id}`, { replace: true });
    } else {
      const nextCh = getNextChapter(chapter.id);
      navigate(nextCh ? `/chapter/${nextCh.id}` : `/chapter/${chapter.id}`, { replace: true });
    }
  }

  return (
    <div className="min-h-full flex flex-col bg-[var(--color-ink)]">
      {/* progress + close */}
      <div className="flex items-center gap-3 px-4 pt-4 pb-2">
        <button onClick={() => navigate(-1)} className="text-[var(--color-muted)] text-lg">✕</button>
        <div className="flex-1 flex gap-1">
          {sections.map((s, i) => (
            <div
              key={s}
              className={`h-1.5 flex-1 rounded-full ${i < step ? 'bg-[var(--color-saffron)]' : i === step ? 'bg-[var(--color-saffron-soft)]' : 'bg-[var(--color-surface-raised)]'}`}
            />
          ))}
        </div>
      </div>

      <div className="flex-1 px-5 py-4 overflow-y-auto">
        <AnimatePresence mode="wait">
          <motion.div key={current} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.3 }}>
            {current === 'hero' && (
              <div className="text-center py-6">
                <div className="text-6xl mb-4">{lesson.hero.emoji}</div>
                <h1 className="font-display font-bold text-2xl mb-2">{lesson.hero.headline}</h1>
                <p className="text-[14px] text-[var(--color-muted)]">{lesson.hero.subtext}</p>
              </div>
            )}

            {current === 'story' && (
              <div>
                <p className="text-[11px] uppercase tracking-wide text-[var(--color-saffron-soft)] font-semibold mb-2">Real-life connect</p>
                <p className="text-[15px] leading-relaxed text-[var(--color-cream)]">{lesson.story.text}</p>
              </div>
            )}

            {current === 'explanation' && (
              <div>
                <p className="text-[11px] uppercase tracking-wide text-[var(--color-saffron-soft)] font-semibold mb-3">Explanation</p>
                <div className="space-y-3">
                  {lesson.explanation.map((block, i) =>
                    block.type === 'formula' ? (
                      <div key={i} className="font-mono text-center text-lg bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl py-4 px-3 text-[var(--color-gold)]">
                        {block.content}
                      </div>
                    ) : (
                      <p key={i} className="text-[15px] leading-relaxed text-[var(--color-cream)]">{block.content}</p>
                    )
                  )}
                </div>
              </div>
            )}

            {current === 'diagram' && (
              <div>
                <p className="text-[11px] uppercase tracking-wide text-[var(--color-saffron-soft)] font-semibold mb-3">Diagram</p>
                <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-6 flex items-center justify-center text-5xl">
                  {lesson.diagram.emoji || '📊'}
                </div>
                {lesson.diagram.caption && <p className="text-[13px] text-[var(--color-muted)] text-center mt-2">{lesson.diagram.caption}</p>}
              </div>
            )}

            {current === 'examples' && (
              <div>
                <p className="text-[11px] uppercase tracking-wide text-[var(--color-saffron-soft)] font-semibold mb-3">Solved Examples</p>
                <div className="space-y-4">
                  {lesson.examples.map((ex, i) => (
                    <div key={i} className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-4">
                      <p className="text-[14px] font-medium mb-2">Q{i + 1}. {ex.problem}</p>
                      <div className="space-y-1">
                        {ex.steps.map((st, j) => (
                          <p key={j} className="text-[13px] text-[var(--color-muted)] font-mono">→ {st}</p>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {current === 'quiz' && (
              <div>
                <p className="text-[11px] uppercase tracking-wide text-[var(--color-saffron-soft)] font-semibold mb-3">Quick Quiz</p>
                <QuizEngine questions={lesson.quiz.questions} onComplete={(r) => setQuizResult(r)} />
              </div>
            )}

            {current === 'notes' && (
              <div>
                <p className="text-[11px] uppercase tracking-wide text-[var(--color-saffron-soft)] font-semibold mb-3">Key Notes</p>
                <ul className="space-y-2">
                  {lesson.notes.map((n, i) => (
                    <li key={i} className="flex gap-2 text-[14px] text-[var(--color-cream)]">
                      <span className="text-[var(--color-saffron)]">•</span> {n}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {current === 'summary' && (
              <div className="text-center py-6">
                <div className="text-5xl mb-4">✅</div>
                <p className="text-[15px] leading-relaxed text-[var(--color-cream)]">{lesson.summary}</p>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {current !== 'quiz' && (
        <div className="px-5 pb-6 pt-2">
          <button onClick={goNext} className="w-full py-3.5 rounded-xl bg-[var(--color-saffron)] font-semibold shadow-[var(--shadow-glow-saffron)]">
            {isLast ? 'Complete Lesson' : 'Continue'}
          </button>
        </div>
      )}
      {current === 'quiz' && quizResult && (
        <div className="px-5 pb-6 pt-2">
          <button onClick={goNext} className="w-full py-3.5 rounded-xl bg-[var(--color-saffron)] font-semibold shadow-[var(--shadow-glow-saffron)]">
            {isLast ? 'Complete Lesson' : 'Continue'}
          </button>
        </div>
      )}

      <RewardModal
        open={showReward}
        xp={lesson.xpReward ?? 0}
        coins={lesson.coinReward ?? 0}
        badge={lesson.reward?.badge}
        onClose={afterReward}
      />
    </div>
  );
}
