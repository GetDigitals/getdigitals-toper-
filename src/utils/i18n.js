/**
 * i18n.js — lightweight bilingual content resolver.
 *
 * Content authors write any text field as either:
 *   "plain string"                          → shown regardless of language (legacy-safe)
 *   { hi: "Hinglish version", en: "English version" }   → language-aware
 *
 * This means OLD lesson JSON (Chapter 1, Chapter 3 L1-L2 as originally
 * written) keeps working unchanged — nothing breaks. NEW content can
 * opt into bilingual fields simply by using the {hi, en} object shape.
 */

export function langCode(settingsLanguage) {
  return settingsLanguage === 'english' ? 'en' : 'hi';
}

export function t(field, lang) {
  if (field == null) return field;
  if (typeof field === 'object' && !Array.isArray(field) && ('en' in field || 'hi' in field)) {
    return field[lang] ?? field.hi ?? field.en ?? '';
  }
  return field;
}

/** Deeply localizes an array of strings/bilingual-objects. */
export function tList(list, lang) {
  if (!Array.isArray(list)) return list;
  return list.map((item) => t(item, lang));
}

/** Localizes a lesson's explanation[] blocks: [{type, content}] */
export function localizeExplanation(blocks, lang) {
  if (!Array.isArray(blocks)) return blocks;
  return blocks.map((b) => ({ ...b, content: t(b.content, lang) }));
}

/** Localizes a lesson's examples[]: [{problem, steps: []}] */
export function localizeExamples(examples, lang) {
  if (!Array.isArray(examples)) return examples;
  return examples.map((ex) => ({ problem: t(ex.problem, lang), steps: tList(ex.steps, lang) }));
}

/** Localizes a quiz questions[] array (mcq/truefalse/match/dragdrop all share text fields). */
export function localizeQuestions(questions, lang) {
  if (!Array.isArray(questions)) return questions;
  return questions.map((q) => ({
    ...q,
    question: t(q.question, lang),
    explanation: t(q.explanation, lang),
    options: q.options ? tList(q.options, lang) : q.options,
    pairs: q.pairs ? q.pairs.map((p) => ({ left: t(p.left, lang), right: t(p.right, lang) })) : q.pairs,
    sentenceParts: q.sentenceParts ? tList(q.sentenceParts, lang) : q.sentenceParts,
  }));
}

/** Localizes an entire lesson object in one call for convenience. */
export function localizeLesson(lesson, lang) {
  if (!lesson) return lesson;
  return {
    ...lesson,
    title: t(lesson.title, lang),
    hero: lesson.hero
      ? { ...lesson.hero, headline: t(lesson.hero.headline, lang), subtext: t(lesson.hero.subtext, lang) }
      : lesson.hero,
    story: lesson.story ? { ...lesson.story, text: t(lesson.story.text, lang) } : lesson.story,
    explanation: localizeExplanation(lesson.explanation, lang),
    diagram: lesson.diagram ? { ...lesson.diagram, caption: t(lesson.diagram.caption, lang) } : lesson.diagram,
    examples: localizeExamples(lesson.examples, lang),
    quiz: lesson.quiz ? { ...lesson.quiz, questions: localizeQuestions(lesson.quiz.questions, lang) } : lesson.quiz,
    notes: tList(lesson.notes, lang),
    summary: t(lesson.summary, lang),
    reward: lesson.reward
      ? { ...lesson.reward, badge: lesson.reward.badge ? { ...lesson.reward.badge, name: t(lesson.reward.badge.name, lang) } : lesson.reward.badge }
      : lesson.reward,
  };
}
