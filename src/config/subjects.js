/**
 * subjects.js
 * -----------------------------------------------------------------------
 * Single source of truth for "which subjects exist in this app".
 * SelectClass, ChapterList, and PreviousPapers all read from here instead
 * of hardcoding subject names — so adding a new subject is a ONE-LINE
 * change here (plus dropping in the JSON content), never a code change
 * in three different files.
 *
 * `slug` MUST match the URL param used in routes like /chapters/:subject
 * and /previous-papers/:subject.
 *
 * `metaSubject` MUST match the exact string used in each chapter's
 * meta.json "subject" field (e.g. "Maths", "English", "Science") — this
 * is what contentLoader uses to filter chapters by subject.
 * -----------------------------------------------------------------------
 */

export const SUBJECTS = [
  {
    slug: 'maths',
    metaSubject: 'Maths',
    classLabel: 'Class 10',
    subjectLabel: 'Maths',
    icon: '📐',
    color: '#4FA8FF',
    available: true,
  },
  {
    slug: 'english',
    metaSubject: 'English',
    classLabel: 'Class 10',
    subjectLabel: 'English',
    icon: '📖',
    color: '#FF9F5A',
    // Section B (Writing Skills & Grammar) is live as chapter-15 — Section A
    // (Reading) and Section C (Literature) are still placeholders below.
    available: true,
  },
  {
    slug: 'science',
    metaSubject: 'Science',
    classLabel: 'Class 10',
    subjectLabel: 'Science',
    icon: '🔬',
    color: '#6FE3A6',
    // chapter-35 (Chemical Reactions and Equations) is live; chapters
    // 36-47 cover the rest of the retained 13-chapter 2025-26 syllabus,
    // as placeholders.
    available: true,
  },
  {
    slug: 'sst',
    metaSubject: 'Social Science',
    classLabel: 'Class 10',
    subjectLabel: 'Social Science',
    icon: '🌍',
    color: '#C792EA',
    // chapter-48 to chapter-69 scaffolded (meta.json only) per the CBSE
    // 2026-27 syllabus: 5 History + 7 Geography + 5 Political Science +
    // 5 Economics = 22 chapters. All are placeholders ("content coming
    // soon") until real lesson content is added chapter by chapter.
    available: true,
  },
  {
    slug: 'computer',
    metaSubject: 'Computer Applications',
    classLabel: 'Class 10',
    subjectLabel: 'Computer Applications',
    icon: '💻',
    color: '#5DD3F0',
    // chapter-70 (Unit 1: Networking) is live per CBSE 2026-27 syllabus
    // (Code 165): Networking(15) + HTML(25) + Cyber Ethics(10) + Practicals(50).
    available: true,
  },
  {
    slug: 'hindi-a',
    metaSubject: 'Hindi Course A',
    classLabel: 'Class 10',
    subjectLabel: 'Hindi (Course A)',
    icon: '📜',
    color: '#9B59B6',
    // Course A = Kshitij (poetry+prose) + Kritika, for mother-tongue
    // students. chapter-71/72 (Surdas, Tulsidas) are live with real lesson
    // content; chapter-73 through chapter-85 scaffolded (meta.json only)
    // for the rest of the retained 15-chapter 2026-27 roadmap (Kshitij
    // poetry 6 + prose 6, Kritika 3).
    // NOTE: kept as a separate metaSubject (not just "Hindi") from Hindi
    // Course B on purpose — contentLoader filters by exact subject string
    // and has no course-aware sub-filtering, so mixing A+B chapters under
    // one "Hindi" subject would show both courses' chapters in one list.
    available: true,
  },
  {
    slug: 'hindi-b',
    metaSubject: 'Hindi Course B',
    classLabel: 'Class 10',
    subjectLabel: 'Hindi (Course B)',
    icon: '📖',
    color: '#B983D6',
    // Course B = Sparsh (poetry+prose) + Sanchayan, for second-language
    // students. chapter-86 through chapter-99 scaffolded (meta.json only)
    // per the retained 14-chapter 2026-27 syllabus (6 poetry + 5 prose +
    // 3 Sanchayan). Same reasoning as Course A for keeping this a
    // separate metaSubject rather than a sub-selector inside one "Hindi"
    // entry — reuses the existing subject picker/payment gate as-is.
    // NOTE on Sparsh Prose (chapter-92 to chapter-96): "Girgit" (Chekhov)
    // being dropped is confirmed from multiple sources. The 5 retained
    // here are Bade Bhai Sahab, Diary Ka Ek Panna, Tatara-Vamiro Katha,
    // Teesri Kasam Ke Shilpkar Shailendra, and Kartoos — but "Patjhar
    // Mein Tooti Pattiyan" and "Ab Kahan Doosre Ke Dukh Se Dukhi Hone
    // Wale" also show up as current/active in some recent solution
    // sites, so exactly which 2 of the original 7 remaining prose
    // chapters were actually cut to reach 5 is NOT independently
    // confirmed by either session that researched this. Since these are
    // placeholder-only chapters (no real lesson content yet), this isn't
    // urgent, but verify against an official CBSE circular before
    // authoring chapter-92 through 96.
    available: true,
  },
];

export function getSubjectBySlug(slug) {
  return SUBJECTS.find((s) => s.slug === slug) || null;
}

export function slugifySubjectName(name) {
  if (!name) return '';
  return name.toLowerCase().trim().replace(/\s+/g, '-');
}

/** Default subject to fall back to for old links like bare /chapters or /previous-papers */
export const DEFAULT_SUBJECT_SLUG = 'maths';
