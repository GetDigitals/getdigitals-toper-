import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { collection, query, where, getCountFromServer } from 'firebase/firestore';
import { db } from '../services/firebase';
import { useAuth } from '../store/AuthContext';

export default function ReferAndEarn() {
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const [referralCount, setReferralCount] = useState(null);
  const [copied, setCopied] = useState(false);

  const code = profile?.referralCode;
  const link = code ? `${window.location.origin}${window.location.pathname}#/login?ref=${code}` : '';

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    (async () => {
      try {
        const q = query(collection(db, 'referrals'), where('referrerUid', '==', user.uid));
        const snap = await getCountFromServer(q);
        if (!cancelled) setReferralCount(snap.data().count);
      } catch (e) {
        console.error('[ReferAndEarn] failed to load referral count:', e);
        if (!cancelled) setReferralCount(0);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [user]);

  function handleCopy() {
    navigator.clipboard?.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const shareText = `GetDigitals Topper app try karo — CBSE Class 10th ke liye best hai! Is link se join karo, extra benefit milega: ${link}`;
  const whatsappHref = `https://wa.me/?text=${encodeURIComponent(shareText)}`;

  return (
    <div className="pb-24 px-4 pt-6">
      <button onClick={() => navigate(-1)} className="text-[13px] text-[var(--color-muted)] mb-3">← Back</button>
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="font-display font-bold text-2xl mb-1">Refer & Earn 🎁</h1>
        <p className="text-[13px] text-[var(--color-muted)] mb-6">
          Apne dost ko bhejo, unko aur tumhe dono ko fayda hoga.
        </p>
      </motion.div>

      <div className="rounded-2xl p-5 bg-gradient-to-br from-[var(--color-surface-raised)] to-[var(--color-surface)] border border-[var(--color-saffron)]/30 text-center mb-5">
        <p className="text-[12px] text-[var(--color-muted)] mb-1">Tumhara Referral Code</p>
        <p className="font-mono font-bold text-2xl tracking-widest text-[var(--color-saffron)]">{code || '—'}</p>
      </div>

      <a
        href={whatsappHref}
        target="_blank"
        rel="noreferrer"
        className="block w-full py-3.5 rounded-xl bg-[var(--color-saffron)] text-center font-semibold shadow-[var(--shadow-glow-saffron)] mb-3"
      >
        💬 Apne Dost ko Bhejo
      </a>

      <button
        onClick={handleCopy}
        className="w-full py-3 rounded-xl border border-[var(--color-border)] text-[13px] font-medium mb-6"
      >
        {copied ? '✅ Link copy ho gaya' : '🔗 Link copy karo'}
      </button>

      <div className="rounded-2xl p-4 bg-[var(--color-surface)] border border-[var(--color-border)] flex items-center justify-between">
        <div>
          <p className="text-[13px] font-semibold">Dosto ne join kiya</p>
          <p className="text-[11px] text-[var(--color-muted)] mt-0.5">Tumhare link se register kiye hue students</p>
        </div>
        <p className="font-mono text-2xl text-[var(--color-gold)]">{referralCount ?? '…'}</p>
      </div>

      <p className="text-[11px] text-[var(--color-muted-2)] text-center mt-4 leading-relaxed">
        Har referral yahan automatically track hota hai. Bonus/reward WhatsApp pe Ashok se confirm karo.
      </p>
    </div>
  );
}
