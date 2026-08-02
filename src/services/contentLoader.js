/**
 * contentLoader.js
 * -----------------------------------------------------------------------
 * THE JSON ENGINE. This is the ONLY place that "knows" about the folder
 * structure. Nothing else in the app hardcodes a chapter name, lesson
 * title, quiz question, badge, or XP value — it all flows from here.
 *
 * HOW TO ADD A NEW CHAPTER (no code changes, ever):
 *   1. Create  src/chapters/chapter-16/meta.json
 *   2. Create  src/chapters/chapter-16/lesson-01.json ... lesson-XX.json
 *   3. (optional) final-test.json, revision.json
 *   4. Run `npm run build` (or `npm run dev` if already running)
 *   -> Chapter 16 appears in Home, chapter list, lessons, quiz, everything.
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

function unwrap(mod) {
  return mod && mod.default ? mod.default : mod;
}

function buildIndex() {
  const index = {};

  for (const path in metaModules) {
    const folder = path.split('/')[3];
    const meta = unwrap(metaModules[path]);
    index[folder] = { folder, meta, lessons: [], finalTest: null, revision: null };
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

  Object.values(index).forEach((ch) => {
    ch.lessons.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  });

  return index;
}

const RAW_INDEX = buildIndex();

export function getAllChapters() {
  return Object.values(RAW_INDEX)
    .filter((ch) => ch.meta)
    .map((ch) => ({
      ...ch.meta,
      folder: ch.folder,
      lessonCount: ch.lessons.length,
      hasFinalTest: !!ch.finalTest,
      hasRevision: !!ch.revision,
    }))
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
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

export function getNextLesson(chapterIdOrFolder, currentLessonId) {
  const lessons = getLessonsForChapter(chapterIdOrFolder);
  const idx = lessons.findIndex((l) => l.id === currentLessonId);
  if (idx === -1 || idx === lessons.length - 1) return null;
  return lessons[idx + 1];
}

export function getNextChapter(currentChapterId) {
  const chapters = getAllChapters();
  const idx = chapters.findIndex((c) => c.id === currentChapterId);
  if (idx === -1 || idx === chapters.length - 1) return null;
  return chapters[idx + 1];
}

export function _debugIndex() {
  return RAW_INDEX;
}
