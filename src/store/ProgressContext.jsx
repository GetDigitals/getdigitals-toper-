/**
 * ProgressContext — single source of truth for XP, coins, streak, badges,
 * completed lessons, quiz scores, unlocked chapters. Backed by IndexedDB,
 * so progress survives reloads and works fully offline.
 */
import { createContext, useContext, useEffect, useReducer, useCallback } from 'react';
import { loadProgress, saveProgress, loadSettings, saveSettings, resetAllProgress } from '../services/db';
import { getAllChapters, getLessonsForChapter } from '../services/contentLoader';
import { evaluateAchievements, getAchievement } from '../services/achievements';

const ProgressCtx = createContext(null);

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

function applyNewAchievements(next, newAchIds) {
  if (!newAchIds.length) return next;
  const uniqueNew = [...new Set(newAchIds)];
  const xpBonus = uniqueNew.reduce((sum, id) => sum + (getAchievement(id)?.xp ?? 0), 0);
  return {
    ...next,
    xp: next.xp + xpBonus,
    achievements: [...(next.achievements || []), ...uniqueNew],
    pendingAchievement: next.pendingAchievement || uniqueNew[0],
  };
}

function reducer(state, action) {
  switch (action.type) {
    case 'HYDRATE':
      return { ...state, ...action.payload, _hydrated: true };

    case 'COMPLETE_LESSON': {
      const { lesson, chapterId, quizResult } = action.payload;
      const already = state.completedLessons[lesson.id];
      const xpGain = already ? 0 : lesson.xpReward ?? 0;
      const coinGain = already ? 0 : lesson.coinReward ?? 0;

      let next = {
        ...state,
        xp: state.xp + xpGain,
        coins: state.coins + coinGain,
        completedLessons: {
          ...state.completedLessons,
          [lesson.id]: { completedAt: new Date().toISOString(), score: quizResult?.percent ?? null },
        },
      };

      if (quizResult) {
        next.quizScores = {
          ...state.quizScores,
          [lesson.id]: {
            correct: quizResult.correct,
            total: quizResult.total,
            attempts: (state.quizScores[lesson.id]?.attempts ?? 0) + 1,
          },
        };
      }

      // Unlock next chapter if this was the last lesson of the chapter
      const chapterLessons = getLessonsForChapter(chapterId);
      const allDone = chapterLessons.every((l) => next.completedLessons[l.id]);
      if (allDone) {
        const chapters = getAllChapters();
        const idx = chapters.findIndex((c) => c.id === chapterId);
        const nextChapter = chapters[idx + 1];
        if (nextChapter && !next.unlockedChapters.includes(nextChapter.id)) {
          next.unlockedChapters = [...next.unlockedChapters, nextChapter.id];
        }
      }

      // Evaluate achievements: lesson completion, perfect-quiz streaks, chapter completion
      let newAch = evaluateAchievements(next, { type: 'lesson_complete' });
      if (quizResult) {
        newAch = newAch.concat(evaluateAchievements(next, { type: 'quiz_complete', percent: quizResult.percent }));
      }
      if (allDone) {
        newAch = newAch.concat(evaluateAchievements(next, { type: 'chapter_complete' }));
      }
      return applyNewAchievements(next, newAch);
    }

    case 'RECORD_STREAK': {
      const today = todayStr();
      if (state.lastActiveDate === today) return state;

      const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
      const continued = state.lastActiveDate === yesterday;
      const newStreak = continued ? state.streak + 1 : 1;
      const next = {
        ...state,
        streak: newStreak,
        lastActiveDate: today,
        dailyProgressMinutes: 0,
      };
      const newAch = evaluateAchievements(next, { type: 'streak_update', streak: newStreak });
      return applyNewAchievements(next, newAch);
    }

    case 'ADD_STUDY_TIME':
      return {
        ...state,
        studyTimeMinutes: state.studyTimeMinutes + action.payload,
        dailyProgressMinutes: state.dailyProgressMinutes + action.payload,
      };

    case 'AWARD_BADGE':
      if (state.badges.includes(action.payload)) return state;
      return { ...state, badges: [...state.badges, action.payload] };

    case 'RECORD_FINAL_TEST': {
      const next = {
        ...state,
        finalTestResults: { ...state.finalTestResults, [action.payload.chapterId]: action.payload.result },
      };
      const newAch = evaluateAchievements(next, { type: 'final_test_complete', percent: action.payload.result.score });
      return applyNewAchievements(next, newAch);
    }

    case 'CLEAR_PENDING_ACHIEVEMENT':
      return { ...state, pendingAchievement: null };

    case 'RECORD_PRACTICE': {
      const { chapterId, correct, attempted } = action.payload;
      const prev = state.practiceStats[chapterId] || { attempted: 0, correct: 0 };
      return {
        ...state,
        practiceStats: {
          ...state.practiceStats,
          [chapterId]: { attempted: prev.attempted + attempted, correct: prev.correct + correct },
        },
      };
    }

    case 'TOGGLE_BOOKMARK': {
      const id = action.payload;
      const exists = state.bookmarks.includes(id);
      return {
        ...state,
        bookmarks: exists ? state.bookmarks.filter((b) => b !== id) : [...state.bookmarks, id],
      };
    }

    case 'SET_WEAK_STRONG':
      return { ...state, weakTopics: action.payload.weak, strongTopics: action.payload.strong };

    case 'RESET':
      return { ...action.payload, _hydrated: true };

    default:
      return state;
  }
}

export function ProgressProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, { _hydrated: false });
  const [settings, setSettingsState] = useReducer(
    (s, a) => ({ ...s, ...a }),
    { theme: 'dark', language: 'hinglish', sound: true, voice: false, _hydrated: false }
  );

  useEffect(() => {
    (async () => {
      const [progress, storedSettings] = await Promise.all([loadProgress(), loadSettings()]);
      dispatch({ type: 'HYDRATE', payload: progress });
      setSettingsState({ ...storedSettings, _hydrated: true });
    })();
  }, []);

  // Persist to IndexedDB whenever progress changes (debounced via microtask)
  useEffect(() => {
    if (!state._hydrated) return;
    const { _hydrated, ...toSave } = state;
    saveProgress(toSave);
  }, [state]);

  useEffect(() => {
    if (!settings._hydrated) return;
    const { _hydrated, ...toSave } = settings;
    saveSettings(toSave);
  }, [settings]);

  // Apply theme to <html data-theme="">
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', settings.theme);
  }, [settings.theme]);

  const completeLesson = useCallback((lesson, chapterId, quizResult) => {
    dispatch({ type: 'COMPLETE_LESSON', payload: { lesson, chapterId, quizResult } });
  }, []);

  const recordStreak = useCallback(() => dispatch({ type: 'RECORD_STREAK' }), []);
  const addStudyTime = useCallback((min) => dispatch({ type: 'ADD_STUDY_TIME', payload: min }), []);
  const awardBadge = useCallback((badgeId) => dispatch({ type: 'AWARD_BADGE', payload: badgeId }), []);
  const recordFinalTest = useCallback((chapterId, result) => dispatch({ type: 'RECORD_FINAL_TEST', payload: { chapterId, result } }), []);
  const recordPractice = useCallback((chapterId, correct, attempted) => dispatch({ type: 'RECORD_PRACTICE', payload: { chapterId, correct, attempted } }), []);
  const toggleBookmark = useCallback((id) => dispatch({ type: 'TOGGLE_BOOKMARK', payload: id }), []);
  const isChapterUnlocked = useCallback((chapterId) => state.unlockedChapters?.includes(chapterId), [state.unlockedChapters]);
  const isLessonComplete = useCallback((lessonId) => !!state.completedLessons?.[lessonId], [state.completedLessons]);

  const resetProgress = useCallback(async () => {
    const fresh = await resetAllProgress();
    dispatch({ type: 'RESET', payload: fresh });
  }, []);

  const clearPendingAchievement = useCallback(() => dispatch({ type: 'CLEAR_PENDING_ACHIEVEMENT' }), []);

  const updateSetting = useCallback((key, value) => setSettingsState({ [key]: value }), []);

  const value = {
    progress: state,
    settings,
    hydrated: state._hydrated && settings._hydrated,
    completeLesson,
    recordStreak,
    addStudyTime,
    awardBadge,
    recordFinalTest,
    recordPractice,
    toggleBookmark,
    isChapterUnlocked,
    isLessonComplete,
    resetProgress,
    updateSetting,
    clearPendingAchievement,
  };

  return <ProgressCtx.Provider value={value}>{children}</ProgressCtx.Provider>;
}

export function useProgress() {
  const ctx = useContext(ProgressCtx);
  if (!ctx) throw new Error('useProgress must be used inside <ProgressProvider>');
  return ctx;
}
