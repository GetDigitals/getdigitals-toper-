import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { collection, query, where, getCountFromServer, doc, updateDoc, arrayUnion } from 'firebase/firestore';
import { db } from '../services/firebase';
import { useAuth } from '../store/AuthContext';

// Free-user referral reward: unlock bonus skill content (outside the paid
// syllabus entirely) as referral count rises. Paid-conversion referrals
// (a referred friend becomes an approved paying student) are rewarded
// with real cash — that's tracked and paid manually by the GetDigitals team over
// WhatsApp (see the note in the UI below), not automated here, since
// there's no payment gateway/backend to verify a real bank transfer.
const BONUS_TIERS = [
  { minReferrals: 1, bonusId: 'ai-basics', icon: '🤖', title: 'AI Basics' },
  { minReferrals: 2, bonusId: 'computer-basics', icon: '💻', title: 'Computer Basics' },
];

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

  // Whenever the referral count crosses a new tier, unlock that bonus
  // permanently on the student's own profile (best-effort — if this
  // write fails, it'll just retry next time this page loads).
  useEffect(() => {
    if (referralCount == null || !user || !profile) return;
    const unlocked = profile.unlockedBonusIds || [];
    const newlyEarned = BONUS_TIERS.filter((t) => referralCount >= t.minReferrals && !unlocked.includes(t.bonusId)).map(
      (t) => t.bonusId
    );
    if (newlyEarned.length > 0) {
      updateDoc(doc(db, 'users', user.uid), { unlockedBonusIds: arrayUnion(...newlyEarned) }).catch((e) =>
        console.error('[ReferAndEarn] failed to save unlocked bonus:', e)
      );
    }
  }, [referralCount, user, profile]);

  function handleCopy() {
    navigator.clipboard?.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const shareText = `GetDigitals Topper app try karo — CBSE Class 10th ke liye best hai! Is link se join karo, extra benefit milega: ${link}`;
  const whatsappHref = `https://wa.me/?text=${encodeURIComponent(shareText)}`;

  const unlockedIds = profile?.unlockedBonusIds || [];

  return (
    <div className="pb-24 px-4 pt-6">
      <button onClick={() => navigate(-1)} className="text-[13px] text-[var(--color-muted)] mb-3">← Back</button>
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="font-display font-bold text-2xl mb-1">Refer & Earn 🎁</h1>
        <p className="text-[13px] text-[var(--color-muted)] mb-6">
          Apne dost ko bhejo — free bonus skills unlock karo, aur agar wo paid student bane to cash bonus bhi milega.
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

      <div className="rounded-2xl p-4 bg-[var(--color-surface)] border border-[var(--color-border)] flex items-center justify-between mb-5">
        <div>
          <p className="text-[13px] font-semibold">Dosto ne join kiya</p>
          <p className="text-[11px] text-[var(--color-muted)] mt-0.5">Tumhare link se register kiye hue students</p>
        </div>
        <p className="font-mono text-2xl text-[var(--color-gold)]">{referralCount ?? '…'}</p>
      </div>

      {/* Bonus skill unlocks */}
      <p className="text-[13px] font-semibold mb-3">🎁 Bonus Skills</p>
      <div className="space-y-2.5 mb-6">
        {BONUS_TIERS.map((tier) => {
          const isUnlocked = unlockedIds.includes(tier.bonusId);
          return (
            <button
              key={tier.bonusId}
              onClick={() => isUnlocked && navigate(`/bonus/${tier.bonusId}`)}
              disabled={!isUnlocked}
              className={`w-full flex items-center gap-3 rounded-2xl p-4 border text-left ${
                isUnlocked
                  ? 'bg-gradient-to-br from-[var(--color-saffron)]/15 to-transparent border-[var(--color-saffron)]/40'
                  : 'bg-[var(--color-surface)] border-[var(--color-border)] opacity-60'
              }`}
            >
              <span className="text-2xl">{isUnlocked ? tier.icon : '🔒'}</span>
              <div className="flex-1">
                <p className="text-[13px] font-medium">{tier.title}</p>
                <p className="text-[11px] text-[var(--color-muted)]">
                  {isUnlocked ? 'Unlocked — tap to open' : `${tier.minReferrals} referral${tier.minReferrals > 1 ? 's' : ''} chahiye`}
                </p>
              </div>
              {isUnlocked && <span className="text-[var(--color-muted)] text-lg">›</span>}
            </button>
          );
        })}
      </div>

      {/* Cash bonus for paid conversions — manual process, explained honestly */}
      <div className="rounded-2xl p-4 bg-[var(--color-surface)] border border-[var(--color-border)] mb-4">
        <p className="text-[13px] font-semibold mb-1">💰 Paid Referral Bonus</p>
        <p className="text-[12px] text-[var(--color-muted)] leading-relaxed">
          Agar tumhare refer kiye hue dost ka payment approve hota hai, tumhe cash bonus milega — GetDigitals Support ko WhatsApp pe seedha confirm kar lo jab wo approve ho jaaye.
        </p>
      </div>

      <p className="text-[11px] text-[var(--color-muted-2)] text-center mt-2 leading-relaxed">
        Har referral yahan automatically track hota hai.
      </p>
    </div>
  );
}
