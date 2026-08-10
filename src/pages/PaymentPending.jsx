import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../store/AuthContext';
import { useProgress } from '../store/ProgressContext';
import { DEFAULT_SUBJECT_SLUG } from '../config/subjects';

/**
 * Shown when a logged-in student taps something that needs payment —
 * Chapter 2 onwards, or Previous Year Papers. Chapter 1 and the rest of
 * the app (Home, Chapters list, Dashboard, Settings) are free and never
 * route here.
 *
 * Auto-unlocks live the moment Ashok flips paymentStatus in Firestore:
 * the onSnapshot listener in AuthContext updates `isApproved`, and the
 * effect below actively navigates the student back to whatever they were
 * trying to open as soon as that happens.
 */
export default function PaymentPending() {
  const { user, logout, isApproved, profileError, profileLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { settings } = useProgress();
  // Falls back to the student's own active subject (not always Maths) if
  // we don't know exactly where they came from.
  const returnTo = location.state?.from || `/chapters/${settings.activeSubject || DEFAULT_SUBJECT_SLUG}`;

  useEffect(() => {
    if (isApproved) navigate(returnTo, { replace: true });
  }, [isApproved, navigate, returnTo]);

  return (
    <div className="h-full flex flex-col items-center justify-center px-6 text-center bg-[var(--color-ink)]">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
        <div className="text-5xl mb-4">🔒</div>
        <h1 className="font-display font-bold text-xl mb-2">Payment Pending</h1>
        <p className="text-[13px] text-[var(--color-muted)] mb-1">
          {user?.email}
        </p>
        <p className="text-[14px] text-[var(--color-cream)] leading-relaxed mt-4 mb-6">
          Chapter 1 free hai, lekin usse aage (Chapter 2 se lekar 14 tak) aur Previous Year Papers unlock karne ke liye payment complete karna hoga. Payment ke baad turant access mil jaayega — refresh karne ki bhi zaroorat nahi.
        </p>

        {profileError && (
          <p className="text-[12px] text-red-400 bg-red-950/40 border border-red-800 rounded-lg px-3 py-2 mb-4 break-all">
            ⚠️ Status check fail hui: {profileError}
          </p>
        )}
        {profileLoading && (
          <p className="text-[12px] text-[var(--color-muted)] mb-4">Status check ho raha hai…</p>
        )}

        <a
          href="https://wa.me/916375351903?text=Hi%2C%20maine%20GetDigitals%20Topper%20app%20pe%20register%20kiya%20hai%2C%20payment%20karna%20chahta%20hoon"
          target="_blank"
          rel="noreferrer"
          className="block w-full py-3.5 rounded-xl bg-[var(--color-saffron)] font-semibold shadow-[var(--shadow-glow-saffron)] mb-3"
        >
          💬 WhatsApp pe Payment Karo
        </a>

        <button onClick={() => window.location.reload()} className="w-full py-2 text-[13px] text-[var(--color-muted)] underline">
          Status dobara check karo
        </button>
        <button onClick={() => navigate(`/chapters/${settings.activeSubject || DEFAULT_SUBJECT_SLUG}`)} className="w-full py-2 text-[13px] text-[var(--color-muted)] underline">
          Chapter 1 free hai — wahin se shuru karo
        </button>
        <button onClick={logout} className="w-full py-2 text-[13px] text-[var(--color-muted)]">
          Logout
        </button>
      </motion.div>
    </div>
  );
}
