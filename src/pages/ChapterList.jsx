import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAllChapters, getLessonsForChapter } from '../services/contentLoader';
import { useProgress } from '../store/ProgressContext';
import { useAuth } from '../store/AuthContext';
import { requiresPayment } from '../App';
import ChapterCard from '../components/ChapterCard';

export default function ChapterList() {
  const navigate = useNavigate();
  const chapters = useMemo(() => getAllChapters(), []);
  const { progress } = useProgress();
  const { isApproved } = useAuth();
  const [query, setQuery] = useState('');

  const filtered = chapters.filter((c) => c.title.toLowerCase().includes(query.toLowerCase()));

  return (
    <div className="pb-24 px-4 pt-6">
      <h1 className="font-display font-bold text-2xl mb-1">Class 10 Maths</h1>
      <p className="text-[13px] text-[var(--color-muted)] mb-4">{chapters.length} chapters · CBSE 2025-26</p>
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search chapters..."
        className="w-full bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl px-4 py-2.5 mb-4 text-[14px] placeholder:text-[var(--color-muted-2)]"
      />
      <div className="space-y-2.5">
        {filtered.map((ch, i) => {
          const lessons = getLessonsForChapter(ch.id);
          const done = lessons.filter((l) => progress.completedLessons?.[l.id]).length;
          const pct = lessons.length ? Math.round((done / lessons.length) * 100) : 0;
          return (
            <ChapterCard
              key={ch.id}
              chapter={ch}
              index={i}
              unlocked={true}
              paymentLocked={requiresPayment(ch) && !isApproved}
              progressPercent={pct}
            />
          );
        })}
        {filtered.length === 0 && (
          <p className="text-center text-[13px] text-[var(--color-muted)] py-10">Koi chapter nahi mila.</p>
        )}
      </div>

      {/* Separate section: sits after the 14 chapters, not inside them */}
      <button
        onClick={() => navigate('/previous-papers')}
        className="w-full mt-6 flex items-center gap-3 rounded-2xl px-4 py-4 bg-gradient-to-br from-[var(--color-surface-raised)] to-[var(--color-surface)] border border-[var(--color-gold)]/30"
      >
        <div className="w-11 h-11 rounded-xl bg-[var(--color-gold)]/15 flex items-center justify-center text-xl shrink-0">📚</div>
        <div className="flex-1 text-left">
          <p className="font-display font-semibold text-[14px]">Previous Year Papers</p>
          <p className="text-[11px] text-[var(--color-muted)]">2026 Guess Papers · Last 5 Years Solved</p>
        </div>
        <span className="text-[var(--color-muted)] text-lg">›</span>
      </button>
    </div>
  );
}
