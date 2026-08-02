import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { getAllChapters, getLessonsForChapter } from '../services/contentLoader';
import { useProgress } from '../store/ProgressContext';
import TopStatsBar from '../components/TopStatsBar';
import ChapterCard from '../components/ChapterCard';
import { BrandBadge, BrandFooter } from '../components/GetDigitalsBrand';

export default function Home() {
  const navigate = useNavigate();
  const { progress, isChapterUnlocked, recordStreak } = useProgress();
  const chapters = useMemo(() => getAllChapters(), []);

  const continueChapter = chapters.find((ch) => {
    const lessons = getLessonsForChapter(ch.id);
    const done = lessons.filter((l) => progress.completedLessons?.[l.id]).length;
    return isChapterUnlocked(ch.id) && done < lessons.length;
  }) || chapters[0];

  const continueLessons = getLessonsForChapter(continueChapter?.id);
  const nextLesson = continueLessons.find((l) => !progress.completedLessons?.[l.id]) || continueLessons[0];
  const goalPct = Math.min(100, Math.round(((progress.dailyProgressMinutes ?? 0) / (progress.dailyGoalMinutes ?? 15)) * 100));

  return (
    <div className="pb-24">
      <TopStatsBar xp={progress.xp} coins={progress.coins} streak={progress.streak} />
      <div className="px-4 pt-5">
        <div className="flex justify-end mb-1">
          <BrandBadge />
        </div>
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="font-display font-bold text-2xl">
            Namaste, <span className="text-[var(--color-saffron)]">Topper 👋</span>
          </h1>
          <p className="text-[13px] text-[var(--color-muted)] mt-1">Aaj ka target complete karo, streak zinda rakho.</p>
        </motion.div>

        {/* Continue learning */}
        {nextLesson && (
          <motion.button
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            onClick={() => navigate(`/lesson/${continueChapter.id}/${nextLesson.id}`)}
            className="w-full mt-5 rounded-2xl p-4 text-left bg-gradient-to-br from-[var(--color-surface-raised)] to-[var(--color-surface)] border border-[var(--color-saffron)]/30 shadow-[var(--shadow-glow-saffron)]"
          >
            <p className="text-[11px] uppercase tracking-wide text-[var(--color-saffron-soft)] font-semibold mb-1">Continue Learning</p>
            <h3 className="font-display font-semibold text-lg">{continueChapter.title}</h3>
            <p className="text-[13px] text-[var(--color-muted)] mt-0.5">{nextLesson.title}</p>
            <div className="mt-3 inline-flex items-center gap-1.5 text-[13px] text-[var(--color-saffron)] font-semibold">
              Resume lesson →
            </div>
          </motion.button>
        )}

        {/* Today's goal */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="mt-4 rounded-2xl p-4 bg-[var(--color-surface)] border border-[var(--color-border)]"
        >
          <div className="flex items-center justify-between mb-2">
            <p className="text-[13px] font-semibold">Today's Goal</p>
            <p className="text-[12px] text-[var(--color-muted)] font-mono">
              {progress.dailyProgressMinutes ?? 0}/{progress.dailyGoalMinutes ?? 15} min
            </p>
          </div>
          <div className="h-2 rounded-full bg-[var(--color-surface-raised)] overflow-hidden">
            <motion.div
              className="h-full rounded-full bg-[var(--color-gold)]"
              initial={{ width: 0 }}
              animate={{ width: `${goalPct}%` }}
              transition={{ duration: 0.6 }}
            />
          </div>
        </motion.div>

        {/* Chapters preview */}
        <div className="mt-6 flex items-center justify-between">
          <h2 className="font-display font-semibold text-lg">Class 10 Maths</h2>
          <button onClick={() => navigate('/chapters')} className="text-[13px] text-[var(--color-saffron)] font-medium">
            See all
          </button>
        </div>
        <div className="mt-3 space-y-2.5">
          {chapters.slice(0, 4).map((ch, i) => (
            <ChapterCard
              key={ch.id}
              chapter={ch}
              index={i}
              unlocked={isChapterUnlocked(ch.id)}
              progressPercent={(() => {
                const lessons = getLessonsForChapter(ch.id);
                const done = lessons.filter((l) => progress.completedLessons?.[l.id]).length;
                return lessons.length ? Math.round((done / lessons.length) * 100) : 0;
              })()}
            />
          ))}
        </div>
        <BrandFooter />
      </div>
    </div>
  );
}
