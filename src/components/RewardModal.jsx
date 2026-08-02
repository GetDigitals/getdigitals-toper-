import { motion, AnimatePresence } from 'framer-motion';

export default function RewardModal({ open, xp, coins, badge, onClose }) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm px-6"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.8, y: 30, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 260, damping: 20 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-3xl p-6 w-full max-w-xs text-center"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.15, type: 'spring', stiffness: 200 }}
              className="text-5xl mb-3"
            >
              🎉
            </motion.div>
            <h3 className="font-display font-bold text-xl mb-1">Lesson Complete!</h3>
            <p className="text-[13px] text-[var(--color-muted)] mb-4">Great going — keep the streak alive.</p>
            <div className="flex justify-center gap-3 mb-4">
              <div className="bg-[var(--color-surface-raised)] rounded-xl px-4 py-2">
                <div className="font-mono font-bold text-[var(--color-info)]">+{xp}</div>
                <div className="text-[10px] text-[var(--color-muted)]">XP</div>
              </div>
              <div className="bg-[var(--color-surface-raised)] rounded-xl px-4 py-2">
                <div className="font-mono font-bold text-[var(--color-gold)]">+{coins}</div>
                <div className="text-[10px] text-[var(--color-muted)]">Coins</div>
              </div>
            </div>
            {badge && (
              <div className="flex items-center justify-center gap-2 text-[13px] text-[var(--color-saffron-soft)] mb-4">
                <span className="text-xl">{badge.icon}</span> New badge: {badge.name}
              </div>
            )}
            <button
              onClick={onClose}
              className="w-full py-3 rounded-xl bg-[var(--color-saffron)] font-semibold shadow-[var(--shadow-glow-saffron)]"
            >
              Continue
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
