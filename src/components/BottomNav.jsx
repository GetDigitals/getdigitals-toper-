import { NavLink } from 'react-router-dom';
import { useSound } from '../hooks/useSound';
import { useProgress } from '../store/ProgressContext';
import { DEFAULT_SUBJECT_SLUG } from '../config/subjects';

export default function BottomNav() {
  const { play } = useSound();
  // The bottom nav's "Chapters" tab must follow whichever subject the
  // student actually picked (settings.activeSubject) — it was previously
  // a static '/chapters' link, which always redirects to Maths regardless
  // of what's showing on Home, so a student on Science would tap
  // "Chapters" and land on Maths instead. Falls back to the default
  // subject only before activeSubject has been picked/hydrated.
  const { settings } = useProgress();
  const chaptersHref = `/chapters/${settings.activeSubject || DEFAULT_SUBJECT_SLUG}`;

  const items = [
    { to: '/home', label: 'Home', icon: '🏠' },
    { to: chaptersHref, label: 'Chapters', icon: '📘' },
    { to: '/dashboard', label: 'Progress', icon: '📊' },
    { to: '/settings', label: 'Settings', icon: '⚙️' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-[var(--color-surface)]/95 backdrop-blur-md border-t border-[var(--color-border)] pb-[env(safe-area-inset-bottom)]">
      <div className="flex justify-around items-center h-16 max-w-md mx-auto">
        {items.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            onClick={() => play('click')}
            className={({ isActive }) =>
              `flex flex-col items-center justify-center gap-0.5 flex-1 h-full text-[11px] transition-colors ${
                isActive ? 'text-[var(--color-saffron)]' : 'text-[var(--color-muted)]'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <span className={`text-lg transition-transform ${isActive ? 'scale-110' : ''}`}>{item.icon}</span>
                <span className={isActive ? 'font-semibold' : ''}>{item.label}</span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
