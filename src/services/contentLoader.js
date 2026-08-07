/**
 * contentLoader.js
 * -----------------------------------------------------------------------
 * THE JSON ENGINE. This is the ONLY place that "knows" about the folder
 * structure. Nothing else in the app hardcodes a chapter name, lesson
 * title, quiz question, badge, or XP value — it all flows from here.
 *
 * HOW TO ADD A NEW CHAPTER (no code changes, ever):
 *   1. Create  src/chapters/chapter-16/meta.json
 *      -> make sure meta.json's "subject" field is set correctly
 *         (e.g. "English", "Science") — this is what makes the chapter
 *         show up under the right subject everywhere in the app.
 *   2. Create  src/chapters/chapter-16/lesson-01.json ... lesson-XX.json
 *   3. (optional) final-test.json, revision.json
 *   4. Run `npm run build` (or `npm run dev` if already running)
 *   -> Chapter 16 appears in its subject's chapter list, lessons, quiz,
 *      everything — automatically.
 *
 * MULTI-SUBJECT NOTE: chapters for every subject still live together in
 * the flat /src/chapters/ folder (chapter-01, chapter-02, ... regardless
 * of subject) — we did NOT restructure into per-subject folders. This
 * keeps the change small and low-risk. Subject separation happens purely
 * through the "subject" field inside each meta.json, filtered at read
 * time by getAllChapters(subject) / isFirstChapterOfSubject() below.
 * Every chapter folder name and every lesson "id" must still be globally
 * unique across ALL subjects (e.g. don't reuse "chapter-01" for English
 * if Maths already has a chapter-01 — pick the next free number, like
 * chapter-15, chapter-16...).
 *
 * import.meta.glob is a Vite build-time feature: it scans the folder
 * pattern and bundles whatever files match. Since there's no backend,
 * this is what makes the app "JSON-driven with no server" — content is
 * discovered automatically at build time, then served fully offline.
 * -----------------------------------------------------------------------
 */

const metaModules = import.meta.glob('/src/chapters/*/meta.json', { eager: true });
const lessonModules = import.meta.glob('/src/chapters/*/lesson-*.json', { eager: true });
const finalTestModules = import.meta.glob('/src/chapters/*/final-test.json', { eager: true });
const revisionModules = import.meta.glob('/src/chapters/*/revision.json', { eager: true });
const importantQModules = import.meta.glob('/src/chapters/*/important-questions.json', { eager: true });

function unwrap(mod) {
  return mod && mod.default ? mod.default : mod;
}

function normalizeSubject(subject) {
  return (subject || 'Maths').toLowerCase().trim();
}

function buildIndex() {
  const index = {};

  for (const path in metaModules) {
    const folder = path.split('/')[3];
    const meta = unwrap(metaModules[path]);
    index[folder] = { folder, meta, lessons: [], finalTest: null, revision: null, importantQuestions: null };
  }

  for (const path in lessonModules) {
    const folder = path.split('/')[3];
    if (!index[folder]) continue;
    const lesson = unwrap(lessonModules[path]);
    index[folder].lessons.push(lesson);
  }

  for (const path in finalTestModules) {
    const folder = path.split('/')[3];
    if (index[folder]) index[folder].finalTest = unwrap(finalTestModules[path]);
  }

  for (const path in revisionModules) {
    const folder = path.split('/')[3];
    if (index[folder]) index[folder].revision = unwrap(revisionModules[path]);
  }

  for (const path in importantQModules) {
    const folder = path.split('/')[3];
    if (index[folder]) index[folder].importantQuestions = unwrap(importantQModules[path]);
  }

  Object.values(index).forEach((ch) => {
    ch.lessons.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  });

  return index;
}

const RAW_INDEX = buildIndex();

/**
 * getAllChapters(subject?)
 * Pass a subject string (matches meta.json's "subject" field, case-
 * insensitive — e.g. "Maths", "English") to get only that subject's
 * chapters, sorted by order. Omit it to get every chapter from every
 * subject (old behaviour, kept for any caller that hasn't been updated
 * yet — but every page in this app should now pass a subject).
 */
export function getAllChapters(subject) {
  const all = Object.values(RAW_INDEX)
    .filter((ch) => ch.meta)
    .map((ch) => ({
      ...ch.meta,
      folder: ch.folder,
      lessonCount: ch.lessons.length,
      hasFinalTest: !!ch.finalTest,
      hasRevision: !!ch.revision,
    }))
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

  if (!subject) return all;
  const target = normalizeSubject(subject);
  return all.filter((ch) => normalizeSubject(ch.subject) === target);
}

/** Every distinct subject name found across all chapter meta.json files, in first-seen/sorted order. */
export function getAvailableSubjects() {
  const seen = new Set();
  const result = [];
  getAllChapters().forEach((ch) => {
    const key = normalizeSubject(ch.subject);
    if (!seen.has(key)) {
      seen.add(key);
      result.push(ch.subject || 'Maths');
    }
  });
  return result;
}

export function getChapterByFolder(folder) {
  const ch = RAW_INDEX[folder];
  if (!ch) return null;
  return { ...ch.meta, folder, lessonCount: ch.lessons.length };
}

export function getChapterById(chapterId) {
  const entry = Object.values(RAW_INDEX).find((ch) => ch.meta?.id === chapterId);
  if (!entry) return null;
  return { ...entry.meta, folder: entry.folder, lessonCount: entry.lessons.length };
}

/**
 * isFirstChapterOfSubject(chapter)
 * True if this chapter is the lowest-`order` chapter within its own
 * subject — i.e. it's that subject's "Chapter 1", which is always free.
 * This replaces the old global "order === 1" check so that every
 * subject gets its own free trial chapter, not just Maths chapter 1.
 */
export function isFirstChapterOfSubject(chapter) {
  if (!chapter) return false;
  const subjectChapters = getAllChapters(chapter.subject);
  if (!subjectChapters.length) return false;
  return subjectChapters[0].id === chapter.id;
}

export function getLessonsForChapter(chapterIdOrFolder) {
  const entry =
    RAW_INDEX[chapterIdOrFolder] ||
    Object.values(RAW_INDEX).find((ch) => ch.meta?.id === chapterIdOrFolder);
  return entry ? entry.lessons : [];
}

export function getLesson(chapterIdOrFolder, lessonId) {
  const lessons = getLessonsForChapter(chapterIdOrFolder);
  return lessons.find((l) => l.id === lessonId) || null;
}

export function getFinalTest(chapterIdOrFolder) {
  const entry =
    RAW_INDEX[chapterIdOrFolder] ||
    Object.values(RAW_INDEX).find((ch) => ch.meta?.id === chapterIdOrFolder);
  return entry ? entry.finalTest : null;
}

export function getRevision(chapterIdOrFolder) {
  const entry =
    RAW_INDEX[chapterIdOrFolder] ||
    Object.values(RAW_INDEX).find((ch) => ch.meta?.id === chapterIdOrFolder);
  return entry ? entry.revision : null;
}

export function getImportantQuestions(chapterIdOrFolder) {
  const entry =
    RAW_INDEX[chapterIdOrFolder] ||
    Object.values(RAW_INDEX).find((ch) => ch.meta?.id === chapterIdOrFolder);
  return entry ? entry.importantQuestions : null;
}

export function getNextLesson(chapterIdOrFolder, currentLessonId) {
  const lessons = getLessonsForChapter(chapterIdOrFolder);
  const idx = lessons.findIndex((l) => l.id === currentLessonId);
  if (idx === -1 || idx === lessons.length - 1) return null;
  return lessons[idx + 1];
}

/** Next chapter WITHIN THE SAME SUBJECT as currentChapterId (won't jump from last Maths chapter into English chapter 1). */
export function getNextChapter(currentChapterId) {
  const current = getChapterById(currentChapterId);
  const chapters = getAllChapters(current?.subject);
  const idx = chapters.findIndex((c) => c.id === currentChapterId);
  if (idx === -1 || idx === chapters.length - 1) return null;
  return chapters[idx + 1];
}

export function _debugIndex() {
  return RAW_INDEX;
}
