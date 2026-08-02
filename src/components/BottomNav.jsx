import { NavLink } from 'react-router-dom';
import { useSound } from '../hooks/useSound';

const items = [
  { to: '/home', label: 'Home', icon: '🏠' },
  { to: '/chapters', label: 'Chapters', icon: '📘' },
  { to: '/dashboard', label: 'Progress', icon: '📊' },
  { to: '/settings', label: 'Settings', icon: '⚙️' },
];

export default function BottomNav() {
  const { play } = useSound();
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
