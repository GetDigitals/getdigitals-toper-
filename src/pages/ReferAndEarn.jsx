import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { collection, query, where, getCountFromServer, doc, updateDoc, Timestamp } from 'firebase/firestore';
import { db } from '../services/firebase';
import { useAuth } from '../store/AuthContext';
import { getAllChapters, getAvailableSubjects } from '../services/contentLoader';
import { requiresPayment, getRewardDaysLeft } from '../App';

const REFERRALS_PER_REWARD = 2;
const REWARD_DAYS = 7;

export default function ReferAndEarn() {
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const [referralCount, setReferralCount] = useState(null);
  const [copied, setCopied] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [claiming, setClaiming] = useState(false);
  const [claimError, setClaimError] = useState(null);

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

  // --- Reward: every 2 referrals = 1 chosen paid chapter free for 7 days ---
  const claimedFor = profile?.rewardClaimedForCount || 0;
  const unclaimedRewards =
    referralCount == null ? 0 : Math.max(0, Math.floor((referralCount - claimedFor) / REFERRALS_PER_REWARD));

  const activeRewardChapter = useMemo(() => {
    if (!profile?.rewardUnlockChapterId) return null;
    const all = getAvailableSubjects().flatMap((s) => getAllChapters(s));
    const ch = all.find((c) => c.id === profile.rewardUnlockChapterId);
    if (!ch) return null;
    const daysLeft = getRewardDaysLeft(ch, profile);
    return daysLeft ? { chapter: ch, daysLeft } : null;
  }, [profile]);

  // Paid chapters that actually have lessons — no point "unlocking" an empty placeholder.
  const lockableChapters = useMemo(() => {
    return getAvailableSubjects()
      .flatMap((s) => getAllChapters(s))
      .filter((c) => requiresPayment(c) && c.lessonCount > 0);
  }, []);

  async function claimReward(chapter) {
    if (!user) return;
    setClaiming(true);
    setClaimError(null);
    try {
      const expiresAt = Timestamp.fromMillis(Date.now() + REWARD_DAYS * 24 * 60 * 60 * 1000);
      await updateDoc(doc(db, 'users', user.uid), {
        rewardUnlockChapterId: chapter.id,
        rewardUnlockExpiresAt: expiresAt,
        rewardClaimedForCount: claimedFor + REFERRALS_PER_REWARD,
      });
      setPickerOpen(false);
    } catch (e) {
      console.error('[ReferAndEarn] claim failed:', e);
      setClaimError('Kuch galat ho gaya, dobara try karo.');
    } finally {
      setClaiming(false);
    }
  }

  return (
    <div className="pb-24 px-4 pt-6">
      <button onClick={() => navigate(-1)} className="text-[13px] text-[var(--color-muted)] mb-3">← Back</button>
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="font-display font-bold text-2xl mb-1">Refer & Earn 🎁</h1>
        <p className="text-[13px] text-[var(--color-muted)] mb-6">
          2 dost refer karo → koi bhi 1 paid chapter {REWARD_DAYS} din ke liye free unlock karo.
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

      <div className="rounded-2xl p-4 bg-[var(--color-surface)] border border-[var(--color-border)] flex items-center justify-between mb-4">
        <div>
          <p className="text-[13px] font-semibold">Dosto ne join kiya</p>
          <p className="text-[11px] text-[var(--color-muted)] mt-0.5">Tumhare link se register kiye hue students</p>
        </div>
        <p className="font-mono text-2xl text-[var(--color-gold)]">{referralCount ?? '…'}</p>
      </div>

      {/* Reward status: active unlock, claimable reward, or progress toward the next one */}
      {activeRewardChapter ? (
        <div className="rounded-2xl p-4 bg-gradient-to-br from-[var(--color-saffron)]/15 to-transparent border border-[var(--color-saffron)]/40 mb-4">
          <p className="text-[13px] font-semibold mb-1">⏰ Reward active</p>
          <p className="text-[12px] text-[var(--color-cream)]">{activeRewardChapter.chapter.title}</p>
          <p className="text-[11px] text-[var(--color-muted)] mt-1">{activeRewardChapter.daysLeft} din baaki hain — is chapter ka poora access free hai.</p>
        </div>
      ) : unclaimedRewards >= 1 ? (
        <button
          onClick={() => setPickerOpen(true)}
          className="w-full rounded-2xl p-4 bg-gradient-to-br from-[var(--color-saffron)]/20 to-transparent border border-[var(--color-saffron)]/50 text-left mb-4"
        >
          <p className="text-[13px] font-semibold text-[var(--color-saffron-soft)]">🎁 Reward unlock ho gaya!</p>
          <p className="text-[11px] text-[var(--color-muted)] mt-1">Koi bhi 1 paid chapter chuno, {REWARD_DAYS} din free milega. Tap karo chapter chunne ke liye →</p>
        </button>
      ) : (
        <div className="rounded-2xl p-4 bg-[var(--color-surface)] border border-[var(--color-border)] mb-4">
          <p className="text-[12px] text-[var(--color-muted)]">
            {REFERRALS_PER_REWARD - ((referralCount ?? 0) - claimedFor)} aur refer karo agla reward unlock karne ke liye.
          </p>
        </div>
      )}

      <p className="text-[11px] text-[var(--color-muted-2)] text-center mt-2 leading-relaxed">
        Har referral yahan automatically track hota hai. Extra bonus WhatsApp pe Ashok se bhi confirm kar sakte ho.
      </p>

      {/* Chapter picker */}
      <AnimatePresence>
        {pickerOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/60 flex items-end"
            onClick={() => !claiming && setPickerOpen(false)}
          >
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md mx-auto bg-[var(--color-ink)] border-t border-[var(--color-border)] rounded-t-3xl p-5 max-h-[75vh] overflow-y-auto"
            >
              <p className="font-display font-bold text-lg mb-1">Chapter chuno</p>
              <p className="text-[12px] text-[var(--color-muted)] mb-4">{REWARD_DAYS} din ke liye free unlock hoga — sirf ek baar select kar sakte ho.</p>
              {claimError && <p className="text-[12px] text-red-400 mb-3">{claimError}</p>}
              <div className="space-y-2">
                {lockableChapters.map((ch) => (
                  <button
                    key={ch.id}
                    disabled={claiming}
                    onClick={() => claimReward(ch)}
                    className="w-full flex items-center gap-3 rounded-xl p-3 bg-[var(--color-surface)] border border-[var(--color-border)] active:border-[var(--color-saffron)]/50 disabled:opacity-50 text-left"
                  >
                    <span className="text-xl">{ch.icon}</span>
                    <span className="flex-1 text-[13px] font-medium">{ch.title}</span>
                    <span className="text-[11px] text-[var(--color-muted)]">{ch.subject}</span>
                  </button>
                ))}
              </div>
              <button
                onClick={() => setPickerOpen(false)}
                disabled={claiming}
                className="w-full mt-4 py-2.5 text-[13px] text-[var(--color-muted)]"
              >
                Cancel
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
