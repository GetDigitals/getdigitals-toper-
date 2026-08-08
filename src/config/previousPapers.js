/**
 * previousPapers.js
 * -----------------------------------------------------------------------
 * Per-subject Previous Year Papers data. Files are static assets copied
 * verbatim into /public/papers/<subject>/... — add English/Science PDFs
 * and guess-paper HTML files there, then list them here, and they'll
 * show up automatically (no other file needs to change).
 *
 * FREE RULE: the 2020 solved paper is free for every subject, unlocked
 * for every logged-in student regardless of payment status. Everything
 * else (guess papers + solved papers 2022-2025) requires an approved
 * payment. This is enforced both here (isFreePaper) and inside
 * PreviousPapers.jsx (the actual gating).
 *
 * WHY 2020 AND NOT 2021: CBSE Class 10 board exams were cancelled
 * outright in 2021 due to COVID (no exam was held, results were computed
 * from an internal-assessment formula instead) — there is no genuine
 * 2021 board question paper. 2020 is the most recent year with a real,
 * standard-format board exam. 2022 was a two-term year (Term 1 MCQ-based
 * in Nov-Dec 2021, Term 2 standard-format in Apr-May 2022) — the paper
 * here is the Term 2 (main, descriptive-format) paper, confirmed via
 * multiple sources at commit time.
 * -----------------------------------------------------------------------
 */

export const PREVIOUS_PAPERS = {
  maths: {
    guess: [1, 2, 3, 4, 5].map((n) => ({
      n,
      title: `Guess Paper ${n}`,
      file: `./papers/guess/CBSE_Class10_Maths_GuessPaper_${n}_2026.html`,
    })),
    solved: [2020, 2022, 2023, 2024, 2025].map((y) => ({
      year: y,
      file: `./papers/solved/CBSE_Class_10_Maths_${y}_Solved_Paper.pdf`,
    })),
  },

  english: {
    guess: [1, 2, 3, 4, 5].map((n) => ({
      n,
      title: `Guess Paper ${n}`,
      file: `./papers/guess/CBSE_Class10_English_GuessPaper_${n}_2026.html`,
    })),
    solved: [2020, 2022, 2023, 2024, 2025].map((y) => ({
      year: y,
      file: `./papers/solved/CBSE_10_English_${y}.html`,
    })),
  },

  // Add real files to /public/papers/... and fill these in once Science
  // Previous Year Papers content is ready. Empty arrays render a clean
  // "coming soon" state instead of broken links.
  science: {
    guess: [],
    solved: [],
  },
};

/** The one rule that decides which papers are free, in one place. */
export function isFreePaper(paper, kind) {
  if (kind === 'solved') return paper.year === 2020;
  return false; // guess papers are always paid for now
}
