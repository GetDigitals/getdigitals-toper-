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
    // Flip to true once src/chapters/ has English chapter folders in it
    available: false,
  },
  {
    slug: 'science',
    metaSubject: 'Science',
    classLabel: 'Class 10',
    subjectLabel: 'Science',
    icon: '🔬',
    color: '#6FE3A6',
    available: false,
  },
  {
    slug: 'sst',
    metaSubject: 'Social Science',
    classLabel: 'Class 10',
    subjectLabel: 'Social Science',
    icon: '🌍',
    color: '#C792EA',
    available: false,
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
