import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { getAllChapters, getLessonsForChapter } from '../services/contentLoader';
import { useProgress } from '../store/ProgressContext';
import { useAuth } from '../store/AuthContext';
import { requiresPayment } from '../App';
import { t, langCode } from '../utils/i18n';
import TopStatsBar from '../components/TopStatsBar';
import ChapterCard from '../components/ChapterCard';
import { BrandBadge, BrandFooter } from '../components/GetDigitalsBrand';

export default function Home() {
  const navigate = useNavigate();
  const { progress, recordStreak, settings } = useProgress();
  const { profile, isApproved } = useAuth();
  const lang = langCode(settings.language);
  // Scoped to Maths explicitly — this page's header is hardcoded to "Class
  // 10 Maths" below, and now that English has real content too,
  // getAllChapters() with no argument would return chapters from BOTH
  // subjects mixed into one list under that Maths-only heading.
  const chapters = useMemo(() => getAllChapters('Maths'), []);

  const continueChapter = chapters.find((ch) => {
    const lessons = getLessonsForChapter(ch.id);
    const done = lessons.filter((l) => progress.completedLessons?.[l.id]).length;
    const accessible = !requiresPayment(ch) || isApproved;
    return accessible && done < lessons.length;
  }) || chapters[0];

  const continueLessons = getLessonsForChapter(continueChapter?.id);
  const nextLesson = continueLessons.find((l) => !progress.completedLessons?.[l.id]) || continueLessons[0];
  const goalPct = Math.min(100, Math.round(((progress.dailyProgressMinutes ?? 0) / (progress.dailyGoalMinutes ?? 15)) * 100));

  return (
    <div className="pb-24">
      <TopStatsBar xp={progress.xp} coins={progress.coins} streak={progress.streak} userName={profile?.name} />
      <div className="px-4 pt-5">
        <div className="flex justify-end mb-1">
          <BrandBadge />
        </div>
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="font-display font-bold text-2xl">
            Namaste, <span className="text-[var(--color-saffron)]">{profile?.name?.trim().split(' ')[0] || 'Topper'} 👋</span>
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
            <h3 className="font-display font-semibold text-lg">{t(continueChapter.title, lang)}</h3>
            <p className="text-[13px] text-[var(--color-muted)] mt-0.5">{t(nextLesson.title, lang)}</p>
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
              unlocked={true}
              paymentLocked={requiresPayment(ch) && !isApproved}
              progressPercent={(() => {
                const lessons = getLessonsForChapter(ch.id);
                const done = lessons.filter((l) => progress.completedLessons?.[l.id]).length;
                return lessons.length ? Math.round((done / lessons.length) * 100) : 0;
              })()}
            />
          ))}
        </div>
        <button
          onClick={() => navigate('/previous-papers')}
          className="w-full mt-4 flex items-center gap-3 rounded-2xl px-4 py-3.5 bg-[var(--color-surface)] border border-[var(--color-gold)]/25"
        >
          <div className="w-10 h-10 rounded-xl bg-[var(--color-gold)]/15 flex items-center justify-center text-lg shrink-0">📚</div>
          <div className="flex-1 text-left">
            <p className="text-[13px] font-medium">Previous Year Papers</p>
            <p className="text-[11px] text-[var(--color-muted)]">Guess papers + last 5 years solved</p>
          </div>
          <span className="text-[var(--color-muted)] text-lg">›</span>
        </button>
        <button
          onClick={() => navigate('/refer')}
          className="w-full mt-2.5 flex items-center gap-3 rounded-2xl px-4 py-3.5 bg-[var(--color-surface)] border border-[var(--color-saffron)]/25"
        >
          <div className="w-10 h-10 rounded-xl bg-[var(--color-saffron)]/15 flex items-center justify-center text-lg shrink-0">🎁</div>
          <div className="flex-1 text-left">
            <p className="text-[13px] font-medium">Refer & Earn</p>
            <p className="text-[11px] text-[var(--color-muted)]">Dost ko bhejo, dono ko fayda</p>
          </div>
          <span className="text-[var(--color-muted)] text-lg">›</span>
        </button>
        <BrandFooter />
      </div>
    </div>
  );
}
