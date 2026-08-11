import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAllChapters, getLessonsForChapter } from '../services/contentLoader';
import { useProgress } from '../store/ProgressContext';
import { t, langCode } from '../utils/i18n';
import { useAuth } from '../store/AuthContext';
import TopStatsBar from '../components/TopStatsBar';
import { ACHIEVEMENTS } from '../services/achievements';

export default function Dashboard() {
  const navigate = useNavigate();
  const { progress, settings } = useProgress();
  const lang = langCode(settings.language);
  const { profile } = useAuth();
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
      <TopStatsBar xp={progress.xp} coins={progress.coins} streak={progress.streak} userName={profile?.name} />
      <div className="px-4 pt-5">
        <div className="flex items-center justify-between mb-4">
          <h1 className="font-display font-bold text-2xl">Your Progress</h1>
          <button
            onClick={() => navigate('/leaderboard')}
            className="text-[12px] font-medium text-[var(--color-saffron)] flex items-center gap-1"
          >
            🏆 Leaderboard
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-4">
          <StatCard label="Lessons Completed" value={`${completedCount}/${totalLessons}`} icon="📘" />
          <StatCard label="Accuracy" value={`${accuracy}%`} icon="🎯" />
          <StatCard label="Study Time" value={`${studyHours}h ${studyMins}m`} icon="⏱️" />
          <StatCard label="Achievements" value={`${progress.achievements?.length ?? 0}/${10}`} icon="🏅" />
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
                    <span className="text-[var(--color-cream)]">{t(ch.title, lang)}</span>
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

        <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-4">
          <p className="text-[13px] font-semibold mb-3">Achievements</p>
          <div className="grid grid-cols-2 gap-2.5">
            {ACHIEVEMENTS.map((a) => {
              const earned = progress.achievements?.includes(a.id);
              return (
                <div
                  key={a.id}
                  className={`rounded-xl p-3 border text-left ${
                    earned ? 'border-[var(--color-gold)]/40 bg-[var(--color-surface-raised)]' : 'border-[var(--color-border)]/50 bg-[var(--color-surface)]/40 opacity-45'
                  }`}
                >
                  <div className="text-lg mb-1">{earned ? a.icon : '🔒'}</div>
                  <p className="text-[11px] font-semibold leading-tight">{a.title}</p>
                  <p className="text-[10px] text-[var(--color-muted)] mt-0.5 leading-tight">{a.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
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
