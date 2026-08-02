import { useState } from 'react';
import { motion } from 'framer-motion';

export default function Flashcard({ front, back }) {
  const [flipped, setFlipped] = useState(false);
  return (
    <div className="[perspective:1200px] w-full h-48" onClick={() => setFlipped((f) => !f)}>
      <motion.div
        className="relative w-full h-full [transform-style:preserve-3d] cursor-pointer"
        animate={{ rotateY: flipped ? 180 : 0 }}
        transition={{ duration: 0.5, ease: 'easeInOut' }}
      >
        <div className="absolute inset-0 [backface-visibility:hidden] rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border)] flex items-center justify-center p-5 text-center">
          <p className="font-display font-semibold text-lg">{front}</p>
        </div>
        <div
          className="absolute inset-0 [backface-visibility:hidden] rounded-2xl bg-[var(--color-surface-raised)] border border-[var(--color-saffron)]/40 flex items-center justify-center p-5 text-center"
          style={{ transform: 'rotateY(180deg)' }}
        >
          <p className="text-[14px] text-[var(--color-cream)]">{back}</p>
        </div>
      </motion.div>
      <p className="text-center text-[11px] text-[var(--color-muted)] mt-2">Tap to flip</p>
    </div>
  );
}
