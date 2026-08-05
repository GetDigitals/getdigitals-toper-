import { HashRouter, Routes, Route, useLocation, useParams, Navigate } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { AuthProvider, useAuth } from './store/AuthContext';
import { ProgressProvider, useProgress } from './store/ProgressContext';
import { getChapterById } from './services/contentLoader';
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
 * Chapter 1 is free for every logged-in student (no payment needed) — it's
 * the "try before you buy" chapter. Chapters 2-14 require paymentStatus
 * 'approved'. This is the ONLY thing `requiresPayment` decides; whether a
 * chapter is reachable AT ALL (sequential progress unlock) is a separate,
 * unrelated concern handled by ProgressContext's isChapterUnlocked.
 */
export function requiresPayment(chapter) {
  return (chapter?.order ?? 1) > 1;
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
 * Chapter 1 is always reachable once logged in; Chapter 2+ additionally
 * needs paymentStatus 'approved', else we bounce to /payment-pending and
 * remember where the student was headed so we can send them back after.
 */
function RequireChapterAccess({ children }) {
  const { user, authLoading, isApproved, profileLoading } = useAuth();
  const { chapterId } = useParams();
  const location = useLocation();
  if (authLoading || profileLoading) return null;
  if (!user) return <Navigate to="/login" replace />;
  const chapter = getChapterById(chapterId);
  if (requiresPayment(chapter) && !isApproved) {
    return <Navigate to="/payment-pending" replace state={{ from: location.pathname }} />;
  }
  return children;
}

/** Premium, non-chapter-specific content (Previous Year Papers) — needs full payment approval. */
function RequirePayment({ children }) {
  const { user, authLoading, isApproved, profileLoading } = useAuth();
  const location = useLocation();
  if (authLoading || profileLoading) return null;
  if (!user) return <Navigate to="/login" replace />;
  if (!isApproved) return <Navigate to="/payment-pending" replace state={{ from: location.pathname }} />;
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
          <Route path="/chapters" element={<RequireAuth><ChapterList /></RequireAuth>} />
          <Route path="/chapter/:chapterId" element={<RequireChapterAccess><ChapterDetail /></RequireChapterAccess>} />
          <Route path="/lesson/:chapterId/:lessonId" element={<RequireChapterAccess><Lesson /></RequireChapterAccess>} />
          <Route path="/practice/:chapterId" element={<RequireChapterAccess><Practice /></RequireChapterAccess>} />
          <Route path="/revision/:chapterId" element={<RequireChapterAccess><Revision /></RequireChapterAccess>} />
          <Route path="/final-test/:chapterId" element={<RequireChapterAccess><FinalTest /></RequireChapterAccess>} />
          <Route path="/important-questions/:chapterId" element={<RequireChapterAccess><ImportantQuestions /></RequireChapterAccess>} />
          <Route path="/previous-papers" element={<RequirePayment><PreviousPapers /></RequirePayment>} />
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
