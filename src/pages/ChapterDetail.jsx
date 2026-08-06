import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { getChapterById, getLessonsForChapter } from '../services/contentLoader';
import { useProgress } from '../store/ProgressContext';
import { t, langCode } from '../utils/i18n';

export default function ChapterDetail() {
  const { chapterId } = useParams();
  const navigate = useNavigate();
  const chapter = getChapterById(chapterId);
  const lessons = getLessonsForChapter(chapterId);
  const { progress, isLessonComplete, isChapterUnlocked, settings } = useProgress();
  const lang = langCode(settings.language);

  if (!chapter) {
    return <div className="p-6 text-center text-[var(--color-muted)]">Chapter not found.</div>;
  }

  const doneCount = lessons.filter((l) => isLessonComplete(l.id)).length;
  const allDone = doneCount === lessons.length && lessons.length > 0;
  const chapterUnlocked = isChapterUnlocked(chapter.id);

  return (
    <div className="pb-24">
      <div
        className="px-4 pt-6 pb-5 border-b border-[var(--color-border)]"
        style={{ background: `linear-gradient(180deg, ${chapter.color}18, transparent)` }}
      >
        <button onClick={() => navigate(-1)} className="text-[13px] text-[var(--color-muted)] mb-3">← Back</button>
        <div className="flex items-center gap-3">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl" style={{ background: `${chapter.color}22` }}>
            {chapter.icon}
          </div>
          <div>
            <h1 className="font-display font-bold text-xl">{chapter.title}</h1>
            <p className="text-[12px] text-[var(--color-muted)]">{lessons.length} lessons · {chapter.xpReward} XP total</p>
          </div>
        </div>
        <p className="text-[13px] text-[var(--color-muted)] mt-3">{chapter.description}</p>
        <div className="mt-4 h-2 rounded-full bg-[var(--color-surface-raised)] overflow-hidden">
          <div className="h-full rounded-full bg-[var(--color-saffron)] transition-all" style={{ width: `${lessons.length ? (doneCount / lessons.length) * 100 : 0}%` }} />
        </div>
      </div>

      <div className="px-4 pt-5">
        {!chapterUnlocked && (
          <div className="rounded-xl p-4 bg-[var(--color-surface)] border border-[var(--color-border)] text-center text-[13px] text-[var(--color-muted)] mb-4">
            🔒 Pichla chapter poora karo isko unlock karne ke liye.
          </div>
        )}

        <div className="space-y-2">
          {lessons.map((lesson, i) => {
            const complete = isLessonComplete(lesson.id);
            const locked = !chapterUnlocked || (i > 0 && !isLessonComplete(lessons[i - 1].id) && !complete);
            return (
              <motion.button
                key={lesson.id}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.03 }}
                disabled={locked}
                onClick={() => navigate(`/lesson/${chapter.id}/${lesson.id}`)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border text-left ${
                  locked ? 'opacity-45 border-[var(--color-border)]/50 bg-[var(--color-surface)]/40' : 'border-[var(--color-border)] bg-[var(--color-surface)]'
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-[12px] font-mono font-bold shrink-0 ${
                    complete ? 'bg-[var(--color-success)] text-black' : locked ? 'bg-[var(--color-surface-raised)]' : 'bg-[var(--color-surface-raised)] text-[var(--color-saffron)]'
                  }`}
                >
                  {complete ? '✓' : locked ? '🔒' : i + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[14px] font-medium truncate">{t(lesson.title, lang)}</p>
                  <p className="text-[11px] text-[var(--color-muted)]">{lesson.estimatedMinutes} min · {lesson.xpReward} XP</p>
                </div>
              </motion.button>
            );
          })}
        </div>

        <div className="grid grid-cols-2 gap-2.5 mt-5">
          <button
            onClick={() => navigate(`/practice/${chapter.id}`)}
            disabled={doneCount === 0}
            className="py-3 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] text-[12px] font-medium disabled:opacity-40"
          >
            💪 Practice
          </button>
          <button
            onClick={() => navigate(`/revision/${chapter.id}`)}
            disabled={doneCount === 0}
            className="py-3 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] text-[12px] font-medium disabled:opacity-40"
          >
            📝 Revision
          </button>
          <button
            onClick={() => navigate(`/important-questions/${chapter.id}`)}
            disabled={doneCount === 0}
            className="py-3 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] text-[12px] font-medium disabled:opacity-40"
          >
            ⭐ Important Qs
          </button>
          <button
            onClick={() => navigate(`/final-test/${chapter.id}`)}
            disabled={!allDone}
            className="py-3 rounded-xl bg-[var(--color-saffron)] text-[12px] font-semibold disabled:opacity-40"
          >
            🏆 Final Test
          </button>
        </div>
        {progress.finalTestResults?.[chapter.id] && (
          <button
            onClick={() => navigate(`/certificate/${chapter.id}`)}
            className="w-full mt-3 py-3 rounded-xl border border-[var(--color-gold)]/50 text-[var(--color-gold)] text-[13px] font-semibold"
          >
            🎓 View Certificate
          </button>
        )}
      </div>
    </div>
  );
}
