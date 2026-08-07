/**
 * previousPapers.js
 * -----------------------------------------------------------------------
 * Per-subject Previous Year Papers data. Files are static assets copied
 * verbatim into /public/papers/<subject>/... — add English/Science PDFs
 * and guess-paper HTML files there, then list them here, and they'll
 * show up automatically (no other file needs to change).
 *
 * FREE RULE: the 2021 solved paper is free for every subject, unlocked
 * for every logged-in student regardless of payment status. Everything
 * else (guess papers + solved papers 2022-2025) requires an approved
 * payment. This is enforced both here (isFree) and inside
 * PreviousPapers.jsx (the actual gating).
 * -----------------------------------------------------------------------
 */

export const PREVIOUS_PAPERS = {
  maths: {
    guess: [1, 2, 3, 4, 5].map((n) => ({
      n,
      title: `Guess Paper ${n}`,
      file: `./papers/guess/CBSE_Class10_Maths_GuessPaper_${n}_2026.html`,
    })),
    solved: [2021, 2022, 2023, 2024, 2025].map((y) => ({
      year: y,
      file: `./papers/solved/CBSE_Class_10_Maths_${y}_Solved_Paper.pdf`,
    })),
  },

  // Add real files to /public/papers/... and fill these in once English
  // Previous Year Papers content is ready. Empty arrays render a clean
  // "coming soon" state instead of broken links.
  english: {
    guess: [],
    solved: [],
  },

  science: {
    guess: [],
    solved: [],
  },
};

/** The one rule that decides which papers are free, in one place. */
export function isFreePaper(paper, kind) {
  if (kind === 'solved') return paper.year === 2021;
  return false; // guess papers are always paid for now
}
