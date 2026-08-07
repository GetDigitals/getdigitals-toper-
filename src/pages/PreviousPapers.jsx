import { useState } from 'react';
import { useNavigate, useParams, useLocation, Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useProgress } from '../store/ProgressContext';
import { useAuth } from '../store/AuthContext';
import { PREVIOUS_PAPERS, isFreePaper } from '../config/previousPapers';
import { getSubjectBySlug, DEFAULT_SUBJECT_SLUG } from '../config/subjects';

/**
 * Previous Year Papers section — sits alongside (not inside) the chapter
 * list, one per subject. Guess papers are self-contained styled HTML
 * documents; solved papers are real board-exam PDFs. Both are static
 * files under /public/papers, so they open/download fully offline once
 * cached by the service worker on first visit.
 *
 * ACCESS: the route itself only requires login (see App.jsx) — it does
 * NOT require payment approval anymore, because the 2021 solved paper is
 * free for every subject. Every other paper checks `isApproved` right
 * here and, if the student hasn't paid, shows a lock instead of the
 * paper and sends them to /payment-pending on tap.
 */
export default function PreviousPapers() {
  const navigate = useNavigate();
  const location = useLocation();
  const { subject: subjectSlug } = useParams();
  const subjectConfig = getSubjectBySlug(subjectSlug);
  const { settings } = useProgress();
  const { isApproved } = useAuth();
  const isEnglish = settings.language === 'english';
  const [tab, setTab] = useState('guess');

  if (!subjectConfig) {
    return <Navigate to={`/previous-papers/${DEFAULT_SUBJECT_SLUG}`} replace />;
  }

  const papers = PREVIOUS_PAPERS[subjectConfig.slug] || { guess: [], solved: [] };

  function openOrLock(paper, kind) {
    const free = isFreePaper(paper, kind);
    if (free || isApproved) {
      window.open(paper.file, '_blank', 'noreferrer');
    } else {
      navigate('/payment-pending', { state: { from: location.pathname } });
    }
  }

  return (
    <div className="pb-24 px-4 pt-6">
      <button onClick={() => navigate(-1)} className="text-[13px] text-[var(--color-muted)] mb-3">← Back</button>
      <h1 className="font-display font-bold text-2xl mb-1">
        {subjectConfig.classLabel} {subjectConfig.subjectLabel} — Previous Year Papers
      </h1>
      <p className="text-[13px] text-[var(--color-muted)] mb-5">
        {isEnglish
          ? '2021 solved paper is free — rest unlock with your plan'
          : '2021 wala solved paper free hai — baaki plan ke saath unlock hote hain'}
      </p>

      <div className="flex gap-2 mb-5">
        <button
          onClick={() => setTab('guess')}
          className={`flex-1 py-2.5 rounded-xl border text-[13px] font-medium ${
            tab === 'guess' ? 'border-[var(--color-saffron)] bg-[var(--color-saffron)]/15 text-[var(--color-saffron-soft)]' : 'border-[var(--color-border)] bg-[var(--color-surface)]'
          }`}
        >
          🎯 2026 Guess Papers
        </button>
        <button
          onClick={() => setTab('solved')}
          className={`flex-1 py-2.5 rounded-xl border text-[13px] font-medium ${
            tab === 'solved' ? 'border-[var(--color-saffron)] bg-[var(--color-saffron)]/15 text-[var(--color-saffron-soft)]' : 'border-[var(--color-border)] bg-[var(--color-surface)]'
          }`}
        >
          📄 Last 5 Years
        </button>
      </div>

      {tab === 'guess' && (
        <div className="space-y-2.5">
          <p className="text-[11px] text-[var(--color-muted)] mb-1">
            {isEnglish
              ? "Most-important predicted questions for this year's board exam, with full solutions."
              : "Is saal ke board exam ke liye most-important predicted questions, full solutions ke saath."}
          </p>
          {papers.guess.map((p, i) => {
            const free = isFreePaper(p, 'guess');
            const locked = !free && !isApproved;
            return (
              <motion.button
                key={p.n}
                onClick={() => openOrLock(p, 'guess')}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="w-full flex items-center gap-3 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl px-4 py-3.5 text-left"
              >
                <div className="w-10 h-10 rounded-xl bg-[var(--color-gold)]/15 flex items-center justify-center text-lg shrink-0">
                  {locked ? '🔒' : '🎯'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[14px] font-medium">{p.title}</p>
                  <p className="text-[11px] text-[var(--color-muted)]">
                    {locked ? (isEnglish ? 'Unlock with your plan' : 'Plan ke saath unlock karo') : (isEnglish ? 'With full solutions' : 'Poori solutions ke saath')}
                  </p>
                </div>
                <span className="text-[var(--color-muted)] text-lg">{locked ? '🔒' : '↗'}</span>
              </motion.button>
            );
          })}
          {papers.guess.length === 0 && (
            <p className="text-center text-[13px] text-[var(--color-muted)] py-10">
              {isEnglish ? 'Coming soon.' : 'Jald hi aayenge.'}
            </p>
          )}
        </div>
      )}

      {tab === 'solved' && (
        <div className="space-y-2.5">
          <p className="text-[11px] text-[var(--color-muted)] mb-1">
            {isEnglish ? 'Real CBSE board papers from the last 5 years, fully solved.' : 'Pichle 5 saal ke real CBSE board papers, poori solved.'}
          </p>
          {papers.solved.map((p, i) => {
            const free = isFreePaper(p, 'solved');
            const locked = !free && !isApproved;
            return (
              <motion.button
                key={p.year}
                onClick={() => openOrLock(p, 'solved')}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="w-full flex items-center gap-3 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl px-4 py-3.5 text-left"
              >
                <div className="w-10 h-10 rounded-xl bg-[var(--color-info)]/15 flex items-center justify-center text-lg shrink-0">
                  {locked ? '🔒' : '📄'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[14px] font-medium">
                    CBSE Board Paper {p.year} {free && <span className="text-[var(--color-saffron-soft)]">· Free</span>}
                  </p>
                  <p className="text-[11px] text-[var(--color-muted)]">
                    {locked ? (isEnglish ? 'Unlock with your plan' : 'Plan ke saath unlock karo') : 'Solved · PDF'}
                  </p>
                </div>
                <span className="text-[var(--color-muted)] text-lg">{locked ? '🔒' : '↗'}</span>
              </motion.button>
            );
          })}
          {papers.solved.length === 0 && (
            <p className="text-center text-[13px] text-[var(--color-muted)] py-10">
              {isEnglish ? 'Coming soon.' : 'Jald hi aayenge.'}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
