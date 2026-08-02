import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { saveUser } from '../services/db';

export default function Login() {
  const [name, setName] = useState('');
  const navigate = useNavigate();

  async function handleContinue(skip) {
    await saveUser({ name: skip ? 'Student' : name || 'Student', createdAt: new Date().toISOString() });
    navigate('/home', { replace: true });
  }

  return (
    <div className="h-full flex flex-col justify-end px-6 pb-10 bg-[var(--color-ink)]">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <h1 className="font-display font-bold text-3xl leading-tight mb-2">
          Ready to become a <span className="text-[var(--color-saffron)]">Topper?</span>
        </h1>
        <p className="text-[14px] text-[var(--color-muted)] mb-8">
          Aapki progress is device par offline save hoti hai — no signup needed.
        </p>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Your name (optional)"
          className="w-full bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl px-4 py-3.5 mb-3 text-[15px] placeholder:text-[var(--color-muted-2)]"
        />
        <button
          onClick={() => handleContinue(false)}
          className="w-full py-3.5 rounded-xl bg-[var(--color-saffron)] font-semibold shadow-[var(--shadow-glow-saffron)] mb-3"
        >
          Start Learning
        </button>
        <button onClick={() => handleContinue(true)} className="w-full py-2 text-[13px] text-[var(--color-muted)]">
          Skip for now
        </button>
      </motion.div>
    </div>
  );
}
