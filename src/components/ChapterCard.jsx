import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

export default function ChapterCard({ chapter, index, unlocked, progressPercent = 0 }) {
  const navigate = useNavigate();
  const num = String(chapter.order ?? index + 1).padStart(2, '0');

  return (
    <motion.button
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04, duration: 0.35 }}
      whileTap={unlocked ? { scale: 0.97 } : {}}
      disabled={!unlocked}
      onClick={() => navigate(`/chapter/${chapter.id}`)}
      className={`w-full text-left rounded-2xl p-4 border transition-colors ${
        unlocked
          ? 'bg-[var(--color-surface)] border-[var(--color-border)] active:border-[var(--color-saffron)]/50'
          : 'bg-[var(--color-surface)]/40 border-[var(--color-border)]/50 opacity-60'
      }`}
    >
      <div className="flex items-center gap-3">
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl shrink-0"
          style={{ background: unlocked ? `${chapter.color}22` : 'var(--color-surface-raised)' }}
        >
          {unlocked ? chapter.icon : '🔒'}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-mono text-[11px] text-[var(--color-muted-2)]">{num}</span>
            <h3 className="font-display font-semibold text-[15px] truncate">{chapter.title}</h3>
          </div>
          <p className="text-[12px] text-[var(--color-muted)] mt-0.5">{chapter.lessonCount} lessons · {chapter.xpReward} XP</p>
        </div>
        <div className="text-[var(--color-muted)] text-lg shrink-0">›</div>
      </div>
      {unlocked && progressPercent > 0 && (
        <div className="mt-3 h-1.5 rounded-full bg-[var(--color-surface-raised)] overflow-hidden">
          <div
            className="h-full rounded-full bg-[var(--color-saffron)] transition-all duration-500"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      )}
    </motion.button>
  );
}
