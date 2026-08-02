import { motion, AnimatePresence } from 'framer-motion';
import { useProgress } from '../store/ProgressContext';
import { getAchievement } from '../services/achievements';
import { useEffect } from 'react';
import { useSound } from '../hooks/useSound';

/**
 * Mounted once at the app root. Watches progress.pendingAchievement and
 * shows a toast whenever a new achievement fires, from anywhere in the
 * app (lesson complete, streak update, final test, etc).
 */
export default function AchievementToast() {
  const { progress, clearPendingAchievement } = useProgress();
  const { play } = useSound();
  const achievement = progress.pendingAchievement ? getAchievement(progress.pendingAchievement) : null;

  useEffect(() => {
    if (!achievement) return;
    play('levelUp');
    const t = setTimeout(clearPendingAchievement, 3200);
    return () => clearTimeout(t);
  }, [achievement, clearPendingAchievement, play]);

  return (
    <div className="fixed top-3 left-0 right-0 z-[60] flex justify-center px-4 pointer-events-none">
      <AnimatePresence>
        {achievement && (
          <motion.div
            initial={{ opacity: 0, y: -30, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 300, damping: 22 }}
            className="pointer-events-auto flex items-center gap-3 bg-[var(--color-surface-raised)] border border-[var(--color-gold)]/40 rounded-2xl px-4 py-3 shadow-[var(--shadow-glow-gold)] max-w-xs w-full"
          >
            <span className="text-2xl shrink-0">{achievement.icon}</span>
            <div className="min-w-0">
              <p className="text-[12px] font-semibold text-[var(--color-gold)]">Achievement Unlocked!</p>
              <p className="text-[13px] font-display font-semibold truncate">{achievement.title}</p>
              <p className="text-[11px] text-[var(--color-muted)] truncate">{achievement.desc} · +{achievement.xp} XP</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
