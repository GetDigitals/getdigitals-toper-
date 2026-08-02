import { useMemo } from 'react';
import { getAllChapters, getLessonsForChapter } from '../services/contentLoader';
import { useProgress } from '../store/ProgressContext';
import TopStatsBar from '../components/TopStatsBar';

export default function Dashboard() {
  const { progress } = useProgress();
  const chapters = useMemo(() => getAllChapters(), []);

  const totalLessons = chapters.reduce((sum, c) => sum + getLessonsForChapter(c.id).length, 0);
  const completedCount = Object.keys(progress.completedLessons || {}).length;

  const quizStats = Object.values(progress.quizScores || {});
  const totalCorrect = quizStats.reduce((s, q) => s + q.correct, 0);
  const totalQ = quizStats.reduce((s, q) => s + q.total, 0);
  const accuracy = totalQ ? Math.round((totalCorrect / totalQ) * 100) : 0;

  const studyHours = Math.floor((progress.studyTimeMinutes || 0) / 60);
  const studyMins = (progress.studyTimeMinutes || 0) % 60;

  return (
    <div className="pb-24">
      <TopStatsBar xp={progress.xp} coins={progress.coins} streak={progress.streak} />
      <div className="px-4 pt-5">
        <h1 className="font-display font-bold text-2xl mb-4">Your Progress</h1>

        <div className="grid grid-cols-2 gap-3 mb-4">
          <StatCard label="Lessons Completed" value={`${completedCount}/${totalLessons}`} icon="📘" />
          <StatCard label="Accuracy" value={`${accuracy}%`} icon="🎯" />
          <StatCard label="Study Time" value={`${studyHours}h ${studyMins}m`} icon="⏱️" />
          <StatCard label="Badges Earned" value={progress.badges?.length ?? 0} icon="🏅" />
        </div>

        <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-4 mb-4">
          <p className="text-[13px] font-semibold mb-3">Chapter Progress</p>
          <div className="space-y-3">
            {chapters.map((ch) => {
              const lessons = getLessonsForChapter(ch.id);
              const done = lessons.filter((l) => progress.completedLessons?.[l.id]).length;
              const pct = lessons.length ? Math.round((done / lessons.length) * 100) : 0;
              return (
                <div key={ch.id}>
                  <div className="flex justify-between text-[12px] mb-1">
                    <span className="text-[var(--color-cream)]">{ch.title}</span>
                    <span className="text-[var(--color-muted)] font-mono">{done}/{lessons.length}</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-[var(--color-surface-raised)] overflow-hidden">
                    <div className="h-full rounded-full bg-[var(--color-saffron)]" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {progress.badges?.length > 0 && (
          <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-4">
            <p className="text-[13px] font-semibold mb-3">Badges</p>
            <div className="flex flex-wrap gap-2">
              {progress.badges.map((b) => (
                <span key={b} className="px-3 py-1.5 rounded-full bg-[var(--color-surface-raised)] text-[12px] border border-[var(--color-border)]">
                  🏅 {b}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({ label, value, icon }) {
  return (
    <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-4">
      <div className="text-xl mb-1">{icon}</div>
      <p className="font-mono font-bold text-lg">{value}</p>
      <p className="text-[11px] text-[var(--color-muted)]">{label}</p>
    </div>
  );
}
