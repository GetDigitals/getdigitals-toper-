import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../store/AuthContext';

export default function Splash() {
  const navigate = useNavigate();
  const { user, authLoading } = useAuth();

  useEffect(() => {
    if (authLoading) return; // wait for Firebase to report auth state
    const t = setTimeout(() => {
      // Chapter 1 and the rest of the app (Home, Chapters, Dashboard,
      // Settings) are free for every logged-in student — payment is only
      // checked per-chapter (Chapter 2+) and for Previous Year Papers, by
      // the route guards in App.jsx. Splash should never send anyone to
      // /payment-pending on its own.
      if (!user) navigate('/login', { replace: true });
      else navigate('/home', { replace: true });
    }, 1200);
    return () => clearTimeout(t);
  }, [authLoading, user, navigate]);

  return (
    <div className="h-full flex flex-col items-center justify-center bg-[var(--color-ink)]">
      <motion.div
        initial={{ scale: 0.6, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="w-20 h-20 rounded-3xl bg-[var(--color-surface)] border border-[var(--color-border)] flex items-center justify-center text-4xl shadow-[var(--shadow-glow-saffron)]"
      >
        📐
      </motion.div>
      <motion.h1
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.5 }}
        className="font-display font-bold text-2xl mt-5 text-[var(--color-cream)]"
      >
        GetDigitals <span className="text-[var(--color-saffron)]">Topper</span>
      </motion.h1>
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.55, duration: 0.5 }}
        className="text-[13px] text-[var(--color-muted)] mt-1 tracking-wide"
      >
        Learn · Practice · Score 95%+
      </motion.p>
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: 120 }}
        transition={{ delay: 0.8, duration: 0.7 }}
        className="h-[3px] rounded-full bg-[var(--color-saffron)] mt-8"
      />
    </div>
  );
}
