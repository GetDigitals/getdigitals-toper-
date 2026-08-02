/**
 * db.js — Offline-first persistence layer.
 * IndexedDB (via idb-keyval) is the source of truth; nothing ever leaves
 * the device, there is no backend and no network call at runtime.
 */
import { get, set, del, keys } from 'idb-keyval';

const PROGRESS_KEY = 'gd-topper:progress:v1';
const SETTINGS_KEY = 'gd-topper:settings:v1';
const USER_KEY = 'gd-topper:user:v1';

export const DEFAULT_PROGRESS = {
  xp: 0,
  coins: 0,
  streak: 0,
  lastActiveDate: null, // 'YYYY-MM-DD'
  studyTimeMinutes: 0,
  badges: [], // badge ids earned
  completedLessons: {}, // { [lessonId]: { completedAt, score } }
  quizScores: {}, // { [lessonId]: { correct, total, attempts } }
  practiceStats: {}, // { [chapterId]: { attempted, correct } }
  finalTestResults: {}, // { [chapterId]: { score, total, grade, completedAt } }
  bookmarks: [], // lessonIds or flashcard ids
  achievements: [], // named achievement ids earned (see services/achievements.js)
  pendingAchievement: null, // achievement id waiting to be shown as a popup, cleared after display
  unlockedChapters: ['chapter-01'], // sequential unlock; first chapter always open
  dailyGoalMinutes: 15,
  dailyProgressMinutes: 0,
  weakTopics: [], // derived tag list
  strongTopics: [],
};

export const DEFAULT_SETTINGS = {
  theme: 'dark', // 'dark' | 'light'
  language: 'hinglish', // 'hinglish' | 'english'
  sound: true,
  voice: false,
};

export async function loadProgress() {
  const stored = await get(PROGRESS_KEY);
  return stored ? { ...DEFAULT_PROGRESS, ...stored } : { ...DEFAULT_PROGRESS };
}

export async function saveProgress(progress) {
  await set(PROGRESS_KEY, progress);
  return progress;
}

export async function loadSettings() {
  const stored = await get(SETTINGS_KEY);
  return stored ? { ...DEFAULT_SETTINGS, ...stored } : { ...DEFAULT_SETTINGS };
}

export async function saveSettings(settings) {
  await set(SETTINGS_KEY, settings);
  return settings;
}

export async function loadUser() {
  return (await get(USER_KEY)) || null;
}

export async function saveUser(user) {
  await set(USER_KEY, user);
  return user;
}

export async function resetAllProgress() {
  await del(PROGRESS_KEY);
  await del(SETTINGS_KEY);
  return { ...DEFAULT_PROGRESS };
}

export async function debugKeys() {
  return keys();
}
