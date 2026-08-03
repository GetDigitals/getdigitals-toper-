import { HashRouter, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { AuthProvider, useAuth } from './store/AuthContext';
import { ProgressProvider, useProgress } from './store/ProgressContext';
import BottomNav from './components/BottomNav';
import AchievementToast from './components/AchievementToast';

import Splash from './pages/Splash';
import Login from './pages/Login';
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
import Dashboard from './pages/Dashboard';
import Leaderboard from './pages/Leaderboard';
import Settings from './pages/Settings';

// Screens that own their own full-bleed layout (no bottom tab bar)
const FULLSCREEN_PREFIXES = ['/', '/login', '/lesson', '/practice', '/final-test', '/certificate'];
const PUBLIC_PATHS = ['/', '/login'];

/** Wrap any route that requires a signed-in, device-bound user. */
function RequireAuth({ children }) {
  const { user, authLoading } = useAuth();
  if (authLoading) return null; // AppShell already shows a spinner during this window
  if (!user) return <Navigate to="/login" replace />;
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
          <Route path="/home" element={<RequireAuth><Home /></RequireAuth>} />
          <Route path="/select-class" element={<RequireAuth><SelectClass /></RequireAuth>} />
          <Route path="/chapters" element={<RequireAuth><ChapterList /></RequireAuth>} />
          <Route path="/chapter/:chapterId" element={<RequireAuth><ChapterDetail /></RequireAuth>} />
          <Route path="/lesson/:chapterId/:lessonId" element={<RequireAuth><Lesson /></RequireAuth>} />
          <Route path="/practice/:chapterId" element={<RequireAuth><Practice /></RequireAuth>} />
          <Route path="/revision/:chapterId" element={<RequireAuth><Revision /></RequireAuth>} />
          <Route path="/final-test/:chapterId" element={<RequireAuth><FinalTest /></RequireAuth>} />
          <Route path="/important-questions/:chapterId" element={<RequireAuth><ImportantQuestions /></RequireAuth>} />
          <Route path="/certificate/:chapterId" element={<RequireAuth><Certificate /></RequireAuth>} />
          <Route path="/dashboard" element={<RequireAuth><Dashboard /></RequireAuth>} />
          <Route path="/leaderboard" element={<RequireAuth><Leaderboard /></RequireAuth>} />
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
