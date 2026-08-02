/**
 * Named achievements — richer than a generic badge string. Each has a
 * fixed XP reward and a `check(progress, ctx)` predicate. Kept as pure
 * data + pure functions so it's easy to add a new achievement (just add
 * an object to this array — no other file needs to change).
 */
export const ACHIEVEMENTS = [
  { id: 'first_lesson', title: 'First Steps', desc: 'Apna pehla lesson complete karo', icon: '🎯', xp: 50 },
  { id: 'streak_3', title: 'On Fire', desc: '3-din streak', icon: '🔥', xp: 100 },
  { id: 'streak_7', title: 'Unstoppable', desc: '7-din streak', icon: '⚡', xp: 300 },
  { id: 'streak_30', title: 'Legend', desc: '30-din streak', icon: '👑', xp: 1000 },
  { id: 'quiz_master', title: 'Quiz Master', desc: '5 quizzes mein 100% score', icon: '🧠', xp: 200 },
  { id: 'chapter_hero', title: 'Chapter Hero', desc: 'Ek poora chapter complete karo', icon: '📚', xp: 300 },
  { id: 'speed_demon', title: 'Speed Demon', desc: 'Quiz 60 second se kam mein complete karo', icon: '⏱️', xp: 150 },
  { id: 'perfectionist', title: 'Perfectionist', desc: 'Final Test mein 100% score', icon: '💎', xp: 500 },
  { id: 'night_owl', title: 'Night Owl', desc: 'Raat 10 baje ke baad padhai', icon: '🌙', xp: 50 },
  { id: 'early_bird', title: 'Early Bird', desc: 'Subah 7 baje se pehle padhai', icon: '🌅', xp: 50 },
];

export function getAchievement(id) {
  return ACHIEVEMENTS.find((a) => a.id === id) || null;
}

/**
 * Given the current progress object + an event context, returns any
 * newly-earned achievement ids (already-earned ones are filtered out by
 * the caller via progress.achievements).
 */
export function evaluateAchievements(progress, event) {
  const earned = new Set(progress.achievements || []);
  const newly = [];

  const grant = (id) => {
    if (!earned.has(id)) newly.push(id);
  };

  switch (event.type) {
    case 'lesson_complete': {
      const completedCount = Object.keys(progress.completedLessons || {}).length + 1;
      if (completedCount === 1) grant('first_lesson');
      const hour = new Date().getHours();
      if (hour >= 22) grant('night_owl');
      if (hour < 7) grant('early_bird');
      break;
    }
    case 'quiz_complete': {
      if (event.percent === 100) {
        const perfectCount = Object.values(progress.quizScores || {}).filter(
          (q) => q.total > 0 && q.correct === q.total
        ).length + 1;
        if (perfectCount >= 5) grant('quiz_master');
      }
      if (event.elapsedSeconds != null && event.elapsedSeconds < 60) grant('speed_demon');
      break;
    }
    case 'chapter_complete':
      grant('chapter_hero');
      break;
    case 'final_test_complete':
      if (event.percent === 100) grant('perfectionist');
      break;
    case 'streak_update':
      if (event.streak >= 3) grant('streak_3');
      if (event.streak >= 7) grant('streak_7');
      if (event.streak >= 30) grant('streak_30');
      break;
    default:
      break;
  }

  return newly;
}
