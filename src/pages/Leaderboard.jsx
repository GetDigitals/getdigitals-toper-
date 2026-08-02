import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useProgress } from '../store/ProgressContext';

/**
 * Offline leaderboard. Important: there's no backend, so this can't show
 * real other students — that would be misleading. Instead it shows
 * sample benchmark scores (clearly labeled) so the student has something
 * to aim for, with their own real XP inserted and highlighted at its
 * correct rank.
 */
const BENCHMARKS = [
  { name: 'Topper Benchmark', xp: 2400, icon: '👑' },
  { name: 'Strong Performer', xp: 1600, icon: '🥈' },
  { name: 'Steady Learner', xp: 900, icon: '🥉' },
  { name: 'Getting Started', xp: 300, icon: '🌱' },
];

export default function Leaderboard() {
  const navigate = useNavigate();
  const { progress } = useProgress();

  const board = useMemo(() => {
    const rows = BENCHMARKS.map((b) => ({ ...b, isUser: false }));
    rows.push({ name: 'You', xp: progress.xp, icon: '🧑‍🎓', isUser: true });
    return rows.sort((a, b) => b.xp - a.xp);
  }, [progress.xp]);

  const userRank = board.findIndex((r) => r.isUser) + 1;

  return (
    <div className="pb-24 px-4 pt-6">
      <button onClick={() => navigate(-1)} className="text-[13px] text-[var(--color-muted)] mb-3">← Back</button>
      <h1 className="font-display font-bold text-2xl mb-1">Leaderboard</h1>
      <p className="text-[13px] text-[var(--color-muted)] mb-1">Tumhara rank: <span className="text-[var(--color-saffron)] font-semibold">#{userRank}</span></p>
      <p className="text-[11px] text-[var(--color-muted-2)] mb-5">
        Ye sample benchmark scores hain (motivation ke liye) — bina backend ke real students ka live data track nahi ho sakta. Tumhara XP real hai.
      </p>

      <div className="space-y-2.5">
        {board.map((row, i) => (
          <motion.div
            key={row.name}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.05 }}
            className={`flex items-center gap-3 rounded-2xl px-4 py-3 border ${
              row.isUser
                ? 'border-[var(--color-saffron)] bg-[var(--color-saffron)]/10 shadow-[var(--shadow-glow-saffron)]'
                : 'border-[var(--color-border)] bg-[var(--color-surface)]'
            }`}
          >
            <span className="font-mono text-[13px] text-[var(--color-muted)] w-5">{i + 1}</span>
            <span className="text-xl">{row.icon}</span>
            <span className={`flex-1 text-[14px] ${row.isUser ? 'font-semibold text-[var(--color-saffron-soft)]' : ''}`}>{row.name}</span>
            <span className="font-mono text-[13px] text-[var(--color-gold)]">{row.xp} XP</span>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
