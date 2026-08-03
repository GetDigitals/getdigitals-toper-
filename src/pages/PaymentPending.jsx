import { motion } from 'framer-motion';
import { useAuth } from '../store/AuthContext';

/**
 * Shown for any logged-in student whose Firestore paymentStatus isn't
 * 'approved' yet. Nothing behind this screen is reachable — App.jsx's
 * RequireAuth wrapper redirects here for every protected route.
 * Auto-unlocks live the moment Ashok flips paymentStatus in Firestore,
 * thanks to the onSnapshot listener in AuthContext.
 */
export default function PaymentPending() {
  const { user, logout } = useAuth();

  return (
    <div className="h-full flex flex-col items-center justify-center px-6 text-center bg-[var(--color-ink)]">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
        <div className="text-5xl mb-4">🔒</div>
        <h1 className="font-display font-bold text-xl mb-2">Payment Pending</h1>
        <p className="text-[13px] text-[var(--color-muted)] mb-1">
          {user?.email}
        </p>
        <p className="text-[14px] text-[var(--color-cream)] leading-relaxed mt-4 mb-6">
          Tumhara account bana hua hai, lekin lessons unlock karne ke liye payment complete karna hoga. Payment ke baad turant access mil jaayega — refresh karne ki bhi zaroorat nahi.
        </p>

        <a
          href="https://wa.me/916375351903?text=Hi%2C%20maine%20GetDigitals%20Topper%20app%20pe%20register%20kiya%20hai%2C%20payment%20karna%20chahta%20hoon"
          target="_blank"
          rel="noreferrer"
          className="block w-full py-3.5 rounded-xl bg-[var(--color-saffron)] font-semibold shadow-[var(--shadow-glow-saffron)] mb-3"
        >
          💬 WhatsApp pe Payment Karo
        </a>

        <button onClick={logout} className="w-full py-2 text-[13px] text-[var(--color-muted)]">
          Logout
        </button>
      </motion.div>
    </div>
  );
}
