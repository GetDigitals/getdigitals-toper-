import { HashRouter, Routes, Route, useLocation, useParams, Navigate } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { AuthProvider, useAuth } from './store/AuthContext';
import { ProgressProvider, useProgress } from './store/ProgressContext';
import { getChapterById, isFirstChapterOfSubject } from './services/contentLoader';
import { DEFAULT_SUBJECT_SLUG } from './config/subjects';
import BottomNav from './components/BottomNav';
import AchievementToast from './components/AchievementToast';

import Splash from './pages/Splash';
import Login from './pages/Login';
import PaymentPending from './pages/PaymentPending';
import Home from './pages/Home';
import SelectClass from './pages/SelectClass';
import ChapterList from './pages/ChapterList';
import ChapterDetail from './pages/ChapterDetail';
import Lesson from './pages/Lesson';
import Practice from './pages/Practice';
import Revision from './pages/Revision';
import FinalTest from './pages/FinalTest';
import Certificate from './pages/Certificate';
import ImportantQuestions from './pages/ImportantQuestions';
import PreviousPapers from './pages/PreviousPapers';
import Dashboard from './pages/Dashboard';
import Leaderboard from './pages/Leaderboard';
import Settings from './pages/Settings';
import ReferAndEarn from './pages/ReferAndEarn';

// Screens that own their own full-bleed layout (no bottom tab bar)
const FULLSCREEN_PREFIXES = ['/', '/login', '/lesson', '/practice', '/final-test', '/certificate', '/payment-pending'];
const PUBLIC_PATHS = ['/', '/login'];

/**
 * Every subject gets its own free "Chapter 1" trial chapter — whichever
 * chapter has the lowest `order` WITHIN that subject, not just chapter
 * order 1 globally. Chapters 2+ (within that subject) require
 * paymentStatus 'approved'. This is the ONLY thing `requiresPayment`
 * decides; whether a chapter is reachable AT ALL (sequential progress
 * unlock) is a separate, unrelated concern handled by ProgressContext's
 * isChapterUnlocked.
 */
export function requiresPayment(chapter) {
  if (!chapter) return false; // still loading — don't block render
  return !isFirstChapterOfSubject(chapter);
}

/**
 * Single source of truth for "can this student open this paid chapter
 * right now" — combines the real payment approval with a temporary
 * Refer & Earn reward unlock (2 referrals = 1 chosen paid chapter free
 * for 7 days, see ReferAndEarn.jsx). Every place that decides whether to
 * show a 💰 lock or let the student in calls this ONE function, so the
 * reward logic only has to be right in one place.
 *
 * Note on trust model: like the payment approval itself (manually set by
 * Ashok in the Firebase console) and the single-device lock (already
 * soft/lenient by design), this reward is enforced client-side and
 * Firestore rules don't cross-check it against the student's actual
 * referral count — a technically determined student could grant this to
 * themselves via devtools without really referring anyone. Given it's a
 * time-limited unlock of one chapter (not permanent, not the real
 * payment gate), this is an accepted low-stakes trust gap, consistent
 * with how the rest of this app is built.
 */
export function isChapterLocked(chapter, { isApproved, profile }) {
  if (!requiresPayment(chapter)) return false;
  if (isApproved) return false;
  if (
    profile?.rewardUnlockChapterId === chapter.id &&
    profile?.rewardUnlockExpiresAt &&
    Date.now() < toMillis(profile.rewardUnlockExpiresAt)
  ) {
    return false;
  }
  return true;
}

/** Days left on a reward unlock for this specific chapter, or null if none/expired. Used to show "⏰ 5d left" on the chapter card instead of a bare open lock. */
export function getRewardDaysLeft(chapter, profile) {
  if (!chapter || profile?.rewardUnlockChapterId !== chapter.id || !profile?.rewardUnlockExpiresAt) return null;
  const msLeft = toMillis(profile.rewardUnlockExpiresAt) - Date.now();
  if (msLeft <= 0) return null;
  return Math.max(1, Math.ceil(msLeft / (24 * 60 * 60 * 1000)));
}

/** Firestore Timestamp fields can arrive as a Timestamp object (.toMillis()), a plain {seconds} shape, or already-a-number — normalize once. */
function toMillis(value) {
  if (value == null) return 0;
  if (typeof value.toMillis === 'function') return value.toMillis();
  if (typeof value.seconds === 'number') return value.seconds * 1000;
  return typeof value === 'number' ? value : 0;
}

/** Wrap any route that just requires a signed-in user (payment status doesn't matter here). */
function RequireLogin({ children }) {
  const { user, authLoading } = useAuth();
  if (authLoading) return null;
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

/** Back-compat alias — most non-chapter-specific screens (home, chapters list, dashboard, settings, etc.) only need login now, not payment approval. */
const RequireAuth = RequireLogin;

/**
 * Wrap chapter-scoped routes (/chapter/:chapterId, /lesson/:chapterId/*, etc).
 * Each subject's first chapter is always reachable once logged in;
 * chapter 2+ in that subject additionally needs paymentStatus 'approved',
 * else we bounce to /payment-pending and remember where the student was
 * headed so we can send them back after.
 */
function RequireChapterAccess({ children }) {
  const { user, authLoading, isApproved, profile, profileLoading } = useAuth();
  const { chapterId } = useParams();
  const location = useLocation();
  if (authLoading || profileLoading) return null;
  if (!user) return <Navigate to="/login" replace />;
  const chapter = getChapterById(chapterId);
  if (isChapterLocked(chapter, { isApproved, profile })) {
    return <Navigate to="/payment-pending" replace state={{ from: location.pathname }} />;
  }
  return children;
}

function AppShell() {
  const location = useLocation();
  const { hydrated } = useProgress();
  const { authLoading } = useAuth();
  const isFullscreen = FULLSCREEN_PREFIXES.some((p) =>
    p === '/' ? location.pathname === '/' : location.pathname.startsWith(p)
  );

  if (!hydrated || authLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-[var(--color-ink)]">
        <div className="w-8 h-8 rounded-full border-2 border-[var(--color-border)] border-t-[var(--color-saffron)] animate-spin" />
      </div>
    );
  }

  return (
    <div className="h-screen w-full max-w-md mx-auto bg-[var(--color-ink)] text-[var(--color-cream)] overflow-y-auto relative">
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={<Splash />} />
          <Route path="/login" element={<Login />} />
          <Route path="/payment-pending" element={<RequireLogin><PaymentPending /></RequireLogin>} />
          <Route path="/home" element={<RequireAuth><Home /></RequireAuth>} />
          <Route path="/select-class" element={<RequireAuth><SelectClass /></RequireAuth>} />

          {/* Old bare /chapters link (bookmarks, notifications, etc.) still works — sends them to Maths */}
          <Route path="/chapters" element={<Navigate to={`/chapters/${DEFAULT_SUBJECT_SLUG}`} replace />} />
          <Route path="/chapters/:subject" element={<RequireAuth><ChapterList /></RequireAuth>} />

          <Route path="/chapter/:chapterId" element={<RequireChapterAccess><ChapterDetail /></RequireChapterAccess>} />
          <Route path="/lesson/:chapterId/:lessonId" element={<RequireChapterAccess><Lesson /></RequireChapterAccess>} />
          <Route path="/practice/:chapterId" element={<RequireChapterAccess><Practice /></RequireChapterAccess>} />
          <Route path="/revision/:chapterId" element={<RequireChapterAccess><Revision /></RequireChapterAccess>} />
          <Route path="/final-test/:chapterId" element={<RequireChapterAccess><FinalTest /></RequireChapterAccess>} />
          <Route path="/important-questions/:chapterId" element={<RequireChapterAccess><ImportantQuestions /></RequireChapterAccess>} />

          {/*
            Previous Year Papers is now just login-gated at the route level
            (not full-payment-gated) because the 2021 solved paper is free
            for every subject. PreviousPapers.jsx itself decides, per
            paper, whether to open it directly or send an unapproved user
            to /payment-pending.
          */}
          <Route path="/previous-papers" element={<Navigate to={`/previous-papers/${DEFAULT_SUBJECT_SLUG}`} replace />} />
          <Route path="/previous-papers/:subject" element={<RequireAuth><PreviousPapers /></RequireAuth>} />

          <Route path="/certificate/:chapterId" element={<RequireChapterAccess><Certificate /></RequireChapterAccess>} />
          <Route path="/dashboard" element={<RequireAuth><Dashboard /></RequireAuth>} />
          <Route path="/leaderboard" element={<RequireAuth><Leaderboard /></RequireAuth>} />
          <Route path="/refer" element={<RequireAuth><ReferAndEarn /></RequireAuth>} />
          <Route path="/settings" element={<RequireAuth><Settings /></RequireAuth>} />
        </Routes>
      </AnimatePresence>
      {!isFullscreen && <BottomNav />}
      <AchievementToast />
    </div>
  );
}

export default function App() {
  return (
    <HashRouter>
      <AuthProvider>
        <ProgressProvider>
          <AppShell />
        </ProgressProvider>
      </AuthProvider>
    </HashRouter>
  );
}
