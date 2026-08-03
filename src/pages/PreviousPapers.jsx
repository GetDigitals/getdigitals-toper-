import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useProgress } from '../store/ProgressContext';

/**
 * Previous Year Papers section — sits alongside (not inside) the 14
 * chapters. Guess papers are self-contained styled HTML documents;
 * solved papers are real board-exam PDFs. Both are static files copied
 * verbatim into /public/papers, so they open/download fully offline
 * once cached by the service worker on first visit.
 */
const GUESS_PAPERS = [1, 2, 3, 4, 5].map((n) => ({
  n,
  title: `Guess Paper ${n}`,
  file: `./papers/guess/CBSE_Class10_Maths_GuessPaper_${n}_2026.html`,
}));

const SOLVED_PAPERS = [2021, 2022, 2023, 2024, 2025].map((y) => ({
  year: y,
  file: `./papers/solved/CBSE_Class_10_Maths_${y}_Solved_Paper.pdf`,
}));

export default function PreviousPapers() {
  const navigate = useNavigate();
  const { settings } = useProgress();
  const isEnglish = settings.language === 'english';
  const [tab, setTab] = useState('guess');

  return (
    <div className="pb-24 px-4 pt-6">
      <button onClick={() => navigate(-1)} className="text-[13px] text-[var(--color-muted)] mb-3">← Back</button>
      <h1 className="font-display font-bold text-2xl mb-1">
        {isEnglish ? 'Previous Year Papers' : 'Previous Year Papers'}
      </h1>
      <p className="text-[13px] text-[var(--color-muted)] mb-5">
        {isEnglish
          ? 'Board exam practice — separate from the 14 chapters'
          : 'Board exam practice — 14 chapters se alag section'}
      </p>

      <div className="flex gap-2 mb-5">
        <button
          onClick={() => setTab('guess')}
          className={`flex-1 py-2.5 rounded-xl border text-[13px] font-medium ${
            tab === 'guess' ? 'border-[var(--color-saffron)] bg-[var(--color-saffron)]/15 text-[var(--color-saffron-soft)]' : 'border-[var(--color-border)] bg-[var(--color-surface)]'
          }`}
        >
          🎯 {isEnglish ? "2026 Guess Papers" : "2026 Guess Papers"}
        </button>
        <button
          onClick={() => setTab('solved')}
          className={`flex-1 py-2.5 rounded-xl border text-[13px] font-medium ${
            tab === 'solved' ? 'border-[var(--color-saffron)] bg-[var(--color-saffron)]/15 text-[var(--color-saffron-soft)]' : 'border-[var(--color-border)] bg-[var(--color-surface)]'
          }`}
        >
          📄 {isEnglish ? "Last 5 Years" : "Last 5 Years"}
        </button>
      </div>

      {tab === 'guess' && (
        <div className="space-y-2.5">
          <p className="text-[11px] text-[var(--color-muted)] mb-1">
            {isEnglish
              ? "Most-important predicted questions for this year's board exam, with full solutions."
              : "Is saal ke board exam ke liye most-important predicted questions, full solutions ke saath."}
          </p>
          {GUESS_PAPERS.map((p, i) => (
            <motion.a
              key={p.n}
              href={p.file}
              target="_blank"
              rel="noreferrer"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="flex items-center gap-3 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl px-4 py-3.5"
            >
              <div className="w-10 h-10 rounded-xl bg-[var(--color-gold)]/15 flex items-center justify-center text-lg shrink-0">🎯</div>
              <div className="flex-1 min-w-0">
                <p className="text-[14px] font-medium">{isEnglish ? `Guess Paper ${p.n}` : `Guess Paper ${p.n}`}</p>
                <p className="text-[11px] text-[var(--color-muted)]">{isEnglish ? "With full solutions" : "Poori solutions ke saath"}</p>
              </div>
              <span className="text-[var(--color-muted)] text-lg">↗</span>
            </motion.a>
          ))}
        </div>
      )}

      {tab === 'solved' && (
        <div className="space-y-2.5">
          <p className="text-[11px] text-[var(--color-muted)] mb-1">
            {isEnglish ? "Real CBSE board papers from the last 5 years, fully solved." : "Pichle 5 saal ke real CBSE board papers, poori solved."}
          </p>
          {SOLVED_PAPERS.map((p, i) => (
            <motion.a
              key={p.year}
              href={p.file}
              target="_blank"
              rel="noreferrer"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="flex items-center gap-3 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl px-4 py-3.5"
            >
              <div className="w-10 h-10 rounded-xl bg-[var(--color-info)]/15 flex items-center justify-center text-lg shrink-0">📄</div>
              <div className="flex-1 min-w-0">
                <p className="text-[14px] font-medium">CBSE Board Paper {p.year}</p>
                <p className="text-[11px] text-[var(--color-muted)]">{isEnglish ? "Solved · PDF" : "Solved · PDF"}</p>
              </div>
              <span className="text-[var(--color-muted)] text-lg">↗</span>
            </motion.a>
          ))}
        </div>
      )}
    </div>
  );
}
