# Content Authoring Guide — JSON Schema Reference

Copy `src/chapters/chapter-01/` as a starting template for any new chapter. Every field below is optional unless marked **required** — missing sections are simply skipped in the UI, nothing crashes.

## `meta.json` (required, one per chapter folder)

```json
{
  "id": "chapter-02",              // required, must match folder name
  "order": 2,                       // required — this is the "01", "02"... number shown to students, NOT the folder name
  "class": 10,
  "subject": "Maths",
  "board": "CBSE",
  "title": "Polynomials",           // required
  "icon": "📊",                     // any emoji
  "color": "#4FA8FF",               // hex, used for chapter card tint
  "description": "One or two lines shown on the chapter header.",
  "xpReward": 300,                  // total XP badge value shown on chapter card
  "coinReward": 60,
  "badge": { "id": "polynomials-master", "name": "Polynomials Master", "icon": "🏅" },
  "unlockRule": { "type": "sequential" }
}
```

### Adding a new subject (English, Science, etc.)

**Claimed folder ranges — check this before picking a number for a new
subject or new chapters, so two parallel authoring sessions never pick
the same folder:**

| Subject | Folders | Status |
|---|---|---|
| Maths | chapter-01 – chapter-14 | 1,2,3,4,6,7,8,13 authored (check repo for latest), rest placeholder |
| English | chapter-15 – chapter-34 | chapter-15,16 authored, rest placeholder |
| Science | chapter-35 – chapter-47 | chapter-35 authored, rest placeholder |
| Social Science | chapter-48 – chapter-69 | all placeholder (5 History + 7 Geography + 5 Political Science + 5 Economics) |
| Computer Applications | chapter-70 | chapter-70 authored (Unit 1: Networking) |
| Hindi Course A | chapter-71 – chapter-85 | chapter-71,72 authored (Kshitij: Surdas, Tulsidas), rest placeholder |
| Hindi Course B | chapter-86 – chapter-99 | all placeholder (Sparsh 6 poetry + 5 prose + Sanchayan 3) |

Next free number for a new subject: **chapter-100**.

The folder name and the `order` field serve two completely different
purposes — don't confuse them:

- **Folder name / `id`** (e.g. `chapter-15`) must be globally unique
  across every subject, never reused. It's an internal storage detail
  the student never sees. For a new subject, always pick the next free
  number overall (Maths currently occupies chapter-01 through
  chapter-14, authored or not — so English/Science/Social Science start
  at chapter-15 and count up from there).
- **`order`** is what's actually shown to the student ("01", "02"...)
  and what decides free-vs-paid (the chapter with the lowest `order`
  *within that subject* is the free one). This is scoped **per subject**
  and always restarts at 1 — so English's first chapter folder might be
  `chapter-15/meta.json`, but its `order` must be `1`, not `15`, so it
  displays as "English — Chapter 01" like a student would expect, not
  "Chapter 15". `getAllChapters(subject)` and `isFirstChapterOfSubject()`
  in `contentLoader.js` both sort/compare by `order` scoped to that
  subject already — this is just about setting the field correctly when
  authoring a new subject's meta.json files.

## `lesson-01.json` (as many as you want per chapter)

```json
{
  "id": "chapter-02-lesson-01",     // required, must be globally unique
  "chapterId": "chapter-02",        // required, must match folder
  "order": 1,                       // required, controls lesson sequence
  "title": "Introduction to Polynomials",
  "estimatedMinutes": 10,
  "xpReward": 40,
  "coinReward": 10,

  "hero": { "emoji": "📊", "headline": "...", "subtext": "..." },
  "story": { "text": "Real-life hook, 2-4 sentences, Hinglish tone." },

  "explanation": [
    { "type": "text", "content": "..." },
    { "type": "formula", "content": "ax² + bx + c = 0" }
  ],

  "diagram": { "emoji": "📈", "caption": "Optional one-liner." },

  "examples": [
    { "problem": "...", "steps": ["step 1", "step 2", "..."] }
  ],

  "quiz": { "questions": [ /* see Question Types below */ ] },

  "notes": ["Key point 1", "Key point 2"],
  "summary": "Closing paragraph shown with a checkmark.",
  "reward": { "badge": null }        // or { "id": "...", "name": "...", "icon": "🏅" }
}
```

### Question types (used in `quiz.questions[]`, `final-test.json`, and Practice pool)

**MCQ**
```json
{ "type": "mcq", "difficulty": "easy", "question": "...", "options": ["A", "B", "C", "D"], "correct": 0, "explanation": "..." }
```
`correct` is the zero-based index into `options`. `difficulty` (`easy`/`medium`/`hard`) is used by the Practice screen's difficulty filter — omit and it defaults to `easy`.

**True/False**
```json
{ "type": "truefalse", "question": "...", "correct": true, "explanation": "..." }
```

**Match the pairs**
```json
{ "type": "match", "question": "Match the pairs", "pairs": [{ "left": "...", "right": "..." }] }
```

**Drag & Drop (fill in the blank, tap-to-place)**
```json
{
  "type": "dragdrop",
  "question": "...",
  "sentenceParts": ["Before the blank", "after the blank"],
  "blanks": ["correct-token"],
  "tokens": ["correct-token", "distractor-1", "distractor-2"],
  "explanation": "..."
}
```

## `final-test.json` (optional, one per chapter)

```json
{
  "chapterId": "chapter-02",
  "totalMarks": 20,
  "timerSecondsPerQuestion": 40,
  "questions": [ /* same question objects as above */ ]
}
```
If this file doesn't exist, the Final Test screen automatically pools every question from that chapter's lessons instead — the button just won't be as curated.

## `revision.json` (optional, one per chapter)

```json
{
  "chapterId": "chapter-02",
  "flashcards": [{ "front": "...", "back": "..." }],
  "formulaSheet": [{ "label": "...", "formula": "..." }],
  "mindMap": { "root": "Chapter Name", "branches": [{ "label": "...", "children": ["...", "..."] }] },
  "rapidFire": [{ "question": "...", "explanation": "..." }]
}
```
If missing, flashcards auto-derive from each lesson's `notes[]`, and rapid-fire auto-pulls from lesson quizzes — so Revision never shows a completely empty screen even before you've written this file.

---

**Golden rule:** never touch any `.jsx` file to add content. If you find yourself wanting to, something is missing from this schema — extend the JSON shape and the matching renderer in `Lesson.jsx` / `QuizEngine.jsx` once, and every future chapter benefits.
