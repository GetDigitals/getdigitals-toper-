import { useMemo, useState } from 'react';
import { useNavigate, useParams, Navigate } from 'react-router-dom';
import { getAllChapters, getLessonsForChapter } from '../services/contentLoader';
import { useProgress } from '../store/ProgressContext';
import { useAuth } from '../store/AuthContext';
import { isChapterLocked } from '../App';
import { getSubjectBySlug, DEFAULT_SUBJECT_SLUG } from '../config/subjects';
import { t, langCode } from '../utils/i18n';
import ChapterCard from '../components/ChapterCard';

export default function ChapterList() {
  const navigate = useNavigate();
  const { subject: subjectSlug } = useParams();
  const subjectConfig = getSubjectBySlug(subjectSlug);

  // All hooks must run unconditionally, every render, in the same order —
  // so these are called BEFORE the "unknown subject" redirect below, not
  // after. (Calling hooks after an early return means they'd sometimes
  // not run at all, which breaks React's per-component hook order and
  // can crash or behave unpredictably.)
  const chapters = useMemo(
    () => (subjectConfig ? getAllChapters(subjectConfig.metaSubject) : []),
    [subjectConfig]
  );
  const { progress, settings } = useProgress();
  const { isApproved, profile } = useAuth();
  const [query, setQuery] = useState('');
  const lang = langCode(settings.language);

  // Unknown slug in the URL (typo, old bookmark) -> fall back to Maths instead of a blank/broken screen
  if (!subjectConfig) {
    return <Navigate to={`/chapters/${DEFAULT_SUBJECT_SLUG}`} replace />;
  }

  const filtered = chapters.filter((c) => t(c.title, lang).toLowerCase().includes(query.toLowerCase()));

  return (
    <div className="pb-24 px-4 pt-6">
      <h1 className="font-display font-bold text-2xl mb-1">
        {subjectConfig.classLabel} {subjectConfig.subjectLabel}
      </h1>
      <p className="text-[13px] text-[var(--color-muted)] mb-4">{chapters.length} chapters · CBSE 2026-27</p>
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search chapters..."
        className="w-full bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl px-4 py-2.5 mb-4 text-[14px] placeholder:text-[var(--color-muted-2)]"
      />
      <div className="space-y-2.5">
        {(() => {
          let lastUnit = undefined; // undefined = "no unit yet seen" — distinct from a chapter with no unit field
          return filtered.map((ch, i) => {
            const unitLabel = ch.unit ? t(ch.unit, lang) : null;
            const showHeader = unitLabel && unitLabel !== lastUnit;
            lastUnit = unitLabel;
            const lessons = getLessonsForChapter(ch.id);
            const done = lessons.filter((l) => progress.completedLessons?.[l.id]).length;
            const pct = lessons.length ? Math.round((done / lessons.length) * 100) : 0;
            return (
              <div key={ch.id}>
                {showHeader && (
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-[var(--color-saffron-soft)] mt-5 mb-2 first:mt-0">
                    📖 {unitLabel}
                  </p>
                )}
                <ChapterCard
                  chapter={ch}
                  index={i}
                  unlocked={true}
                  paymentLocked={isChapterLocked(ch, { isApproved, profile })}
                  progressPercent={pct}
                />
              </div>
            );
          });
        })()}
        {filtered.length === 0 && chapters.length > 0 && (
          <p className="text-center text-[13px] text-[var(--color-muted)] py-10">Koi chapter nahi mila.</p>
        )}
        {chapters.length === 0 && (
          <p className="text-center text-[13px] text-[var(--color-muted)] py-10">
            {subjectConfig.subjectLabel} ke chapters jald hi aayenge.
          </p>
        )}
      </div>

      {/* Separate section: sits after the chapters, not inside them */}
      <button
        onClick={() => navigate(`/previous-papers/${subjectConfig.slug}`)}
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
