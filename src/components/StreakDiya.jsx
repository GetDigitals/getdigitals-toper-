/**
 * StreakDiya — signature visual element of the app.
 * A diya (oil lamp) whose flame height/brightness reflects the current
 * streak, instead of a generic "🔥 3" chip used by every other app.
 */
export default function StreakDiya({ streak = 0, size = 'md' }) {
  const dims = size === 'lg' ? 56 : size === 'sm' ? 28 : 40;
  const lit = streak > 0;

  return (
    <div className="flex items-center gap-2">
      <div style={{ width: dims, height: dims }} className="relative shrink-0">
        <svg viewBox="0 0 40 40" width={dims} height={dims}>
          {/* diya base */}
          <path d="M6 26 Q20 34 34 26 L30 30 Q20 36 10 30 Z" fill="#8A5A2B" />
          <ellipse cx="20" cy="25" rx="15" ry="6" fill="#B9722F" />
          <ellipse cx="20" cy="24" rx="12" ry="4.5" fill="#0B0E14" opacity="0.35" />
          {lit && (
            <g className="diya-flame">
              <path d="M20 10 C24 15 24 19 20 22 C16 19 16 15 20 10 Z" fill="var(--color-gold)" />
              <path d="M20 13 C22 16 22 18.5 20 20.5 C18 18.5 18 16 20 13 Z" fill="var(--color-diya)" />
            </g>
          )}
        </svg>
      </div>
      <div className="leading-tight">
        <div className="font-mono font-bold text-[15px] text-[var(--color-cream)]">{streak}</div>
        <div className="text-[10px] text-[var(--color-muted)] -mt-0.5">day streak</div>
      </div>
    </div>
  );
}
