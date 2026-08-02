import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../store/AuthContext';

function friendlyError(err) {
  if (err.code === 'DEVICE_MISMATCH') return err.message;
  const map = {
    'auth/email-already-in-use': 'Ye email pehle se registered hai — Login try karo.',
    'auth/invalid-email': 'Email sahi format mein daalo.',
    'auth/weak-password': 'Password kam se kam 6 characters ka hona chahiye.',
    'auth/user-not-found': 'Is email se koi account nahi mila — Register karo.',
    'auth/wrong-password': 'Password galat hai.',
    'auth/invalid-credential': 'Email ya password galat hai.',
    'auth/too-many-requests': 'Bahut zyada attempts ho gaye — thodi der baad try karo.',
  };
  return map[err.code] || 'Kuch galat ho gaya, dobara try karo.';
}

export default function Login() {
  const navigate = useNavigate();
  const { register, login, forgotPassword } = useAuth();
  const [mode, setMode] = useState('login'); // 'login' | 'register'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [resetSent, setResetSent] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (mode === 'register') {
        await register(email.trim(), password);
      } else {
        await login(email.trim(), password);
      }
      navigate('/home', { replace: true });
    } catch (err) {
      setError(friendlyError(err));
    } finally {
      setLoading(false);
    }
  }

  async function handleForgotPassword() {
    if (!email.trim()) {
      setError('Pehle apna email daalo, phir "Forgot password" dabao.');
      return;
    }
    try {
      await forgotPassword(email.trim());
      setResetSent(true);
      setError('');
    } catch (err) {
      setError(friendlyError(err));
    }
  }

  return (
    <div className="h-full flex flex-col justify-center px-6 bg-[var(--color-ink)]">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <h1 className="font-display font-bold text-3xl leading-tight mb-2">
          {mode === 'login' ? (
            <>Welcome back, <span className="text-[var(--color-saffron)]">Topper</span></>
          ) : (
            <>Ready to become a <span className="text-[var(--color-saffron)]">Topper?</span></>
          )}
        </h1>
        <p className="text-[14px] text-[var(--color-muted)] mb-7">
          Ek email sirf ek device pe chalega — apna account share mat karna.
        </p>

        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email address"
            className="w-full bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl px-4 py-3.5 text-[15px] placeholder:text-[var(--color-muted-2)]"
          />
          <input
            type="password"
            required
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password (min 6 characters)"
            className="w-full bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl px-4 py-3.5 text-[15px] placeholder:text-[var(--color-muted-2)]"
          />

          {error && <p className="text-[12px] text-[var(--color-error)] leading-snug">{error}</p>}
          {resetSent && <p className="text-[12px] text-[var(--color-success)]">Password reset link email pe bhej diya hai.</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-xl bg-[var(--color-saffron)] font-semibold shadow-[var(--shadow-glow-saffron)] disabled:opacity-50"
          >
            {loading ? 'Please wait...' : mode === 'login' ? 'Login' : 'Create Account'}
          </button>
        </form>

        {mode === 'login' && (
          <button onClick={handleForgotPassword} className="w-full py-2 mt-1 text-[12px] text-[var(--color-muted)]">
            Forgot password?
          </button>
        )}

        <button
          onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setError(''); }}
          className="w-full py-2 mt-2 text-[13px] text-[var(--color-saffron-soft)] font-medium"
        >
          {mode === 'login' ? "Naya account? Register karo" : 'Already account hai? Login karo'}
        </button>
      </motion.div>
    </div>
  );
}
