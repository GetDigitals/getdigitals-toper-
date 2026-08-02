import { HashRouter, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { ProgressProvider, useProgress } from './store/ProgressContext';
import BottomNav from './components/BottomNav';

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
import Dashboard from './pages/Dashboard';
import Settings from './pages/Settings';

// Screens that own their own full-bleed layout (no bottom tab bar)
const FULLSCREEN_PREFIXES = ['/', '/login', '/lesson', '/practice', '/final-test', '/certificate'];

function AppShell() {
  const location = useLocation();
  const { hydrated } = useProgress();
  const isFullscreen = FULLSCREEN_PREFIXES.some((p) =>
    p === '/' ? location.pathname === '/' : location.pathname.startsWith(p)
  );

  if (!hydrated) {
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
          <Route path="/home" element={<Home />} />
          <Route path="/select-class" element={<SelectClass />} />
          <Route path="/chapters" element={<ChapterList />} />
          <Route path="/chapter/:chapterId" element={<ChapterDetail />} />
          <Route path="/lesson/:chapterId/:lessonId" element={<Lesson />} />
          <Route path="/practice/:chapterId" element={<Practice />} />
          <Route path="/revision/:chapterId" element={<Revision />} />
          <Route path="/final-test/:chapterId" element={<FinalTest />} />
          <Route path="/certificate/:chapterId" element={<Certificate />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </AnimatePresence>
      {!isFullscreen && <BottomNav />}
    </div>
  );
}

export default function App() {
  return (
    <HashRouter>
      <ProgressProvider>
        <AppShell />
      </ProgressProvider>
    </HashRouter>
  );
}
