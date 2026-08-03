import { motion } from 'framer-motion';
import StreakDiya from './StreakDiya';

/**
 * Sticky top bar. `userName`, when provided, renders a personalized
 * "{Name}'s Topper" title above the stats row — gives each student the
 * feeling this is THEIR own app, not a generic shared tool.
 */
export default function TopStatsBar({ xp = 0, coins = 0, streak = 0, userName = '' }) {
  const firstName = userName?.trim().split(' ')[0];

  return (
    <div className="sticky top-0 z-30 backdrop-blur-md bg-[var(--color-ink)]/85 border-b border-[var(--color-border)]">
      {firstName && (
        <div className="px-4 pt-2.5 pb-0.5">
          <p className="font-display font-semibold text-[13px] text-[var(--color-saffron-soft)] tracking-wide">
            {firstName}'s Topper
          </p>
        </div>
      )}
      <div className="flex items-center justify-between px-4 py-2.5">
        <StreakDiya streak={streak} />
        <div className="flex items-center gap-3">
          <motion.div
            key={xp}
            initial={{ scale: 1.15 }}
            animate={{ scale: 1 }}
            className="flex items-center gap-1.5 bg-[var(--color-surface)] px-2.5 py-1.5 rounded-full border border-[var(--color-border)]"
          >
            <span className="text-[var(--color-info)]">⚡</span>
            <span className="font-mono text-sm font-semibold">{xp}</span>
          </motion.div>
          <motion.div
            key={coins}
            initial={{ scale: 1.15 }}
            animate={{ scale: 1 }}
            className="flex items-center gap-1.5 bg-[var(--color-surface)] px-2.5 py-1.5 rounded-full border border-[var(--color-border)]"
          >
            <span className="text-[var(--color-gold)]">🪙</span>
            <span className="font-mono text-sm font-semibold">{coins}</span>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
