import { useMemo, useState } from 'react';
import { getAllChapters, getLessonsForChapter } from '../services/contentLoader';
import { useProgress } from '../store/ProgressContext';
import ChapterCard from '../components/ChapterCard';

export default function ChapterList() {
  const chapters = useMemo(() => getAllChapters(), []);
  const { progress, isChapterUnlocked } = useProgress();
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
            <ChapterCard key={ch.id} chapter={ch} index={i} unlocked={isChapterUnlocked(ch.id)} progressPercent={pct} />
          );
        })}
        {filtered.length === 0 && (
          <p className="text-center text-[13px] text-[var(--color-muted)] py-10">Koi chapter nahi mila.</p>
        )}
      </div>
    </div>
  );
}
