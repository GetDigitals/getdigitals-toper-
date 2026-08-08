# English Content Authoring Guide — CBSE Class 10

Extends the base `CONTENT-GUIDE.md` schema. Read that first — everything there (meta.json, lesson-01.json fields, quiz question types, bilingual `{hi, en}` fields) still applies. This document only covers how to map **English-specific content** (reading comprehension, grammar, writing formats, literature) onto that same schema, since it wasn't originally designed with English in mind.

## Folder numbering

Maths currently occupies `chapter-01` through `chapter-14` (authored or not). Start English at **`chapter-15`** and count up — but check the "Claimed folder ranges" table in the base CONTENT-GUIDE.md first in case another subject has been added since this was written. Each chapter's `order` field still restarts at `1` for English specifically (see the "Adding a new subject" section in the base guide) — so English's first folder is `chapter-15/meta.json` but its `order` is `1`.

`meta.json`'s `"subject"` field must be exactly `"English"` (must match `metaSubject` in `src/config/subjects.js`).

## ⚠️ Copyright — read this before writing any literature content

CBSE English textbooks (*First Flight*, *Footprints without Feet*) contain full poems and prose stories that are **copyrighted** — do not reproduce the original poem/story text anywhere in lesson JSON, not even a full stanza or paragraph. This app can explain, analyze, and quiz on the *themes, characters, literary devices, and meaning* of a poem/story in original wording, but never paste the source text itself. Where a quiz needs to reference a specific line, paraphrase it ("the line where the poet compares X to Y") instead of quoting it directly.

## Mapping English content onto the existing schema

The base schema (`hero`, `story`, `explanation`, `diagram`, `examples`, `quiz`, `notes`, `summary`) already covers English reasonably well once you know the mapping:

| English content type | Which block to use |
|---|---|
| Reading comprehension passage | `story.text` for a short passage, OR multiple `explanation` blocks (type `"text"`) if the passage is long — paraphrase, don't paste copyrighted originals |
| Comprehension questions on a passage | `quiz.questions` (mcq/truefalse work fine) |
| Grammar rule (e.g. tenses, reported speech) | `explanation` blocks for the rule statement, `formula`-type block for the pattern (e.g. `"Subject + has/have + V3"`) |
| Grammar practice / fill-in-the-blank | `quiz` with `type: "dragdrop"` (already built for exactly this) |
| Writing formats (letter, notice, essay, report) | `examples` block: `problem` = the writing prompt, `steps` = the format broken into labeled parts (e.g. "Sender's address", "Date", "Salutation"...) |
| Literary device / theme explanation | `explanation` blocks + `notes` (bullet list of key devices/themes) |
| Character analysis | `explanation` blocks, one per character trait, with paraphrased textual evidence |
| Vocabulary / word meanings | `notes` (front/back pairs work in `revision.json`'s `flashcards`) |

## Proposed new block type (not yet built — flag for future dev work)

A dedicated `"passage"` section type (a boxed, distinctly-styled reading passage that quiz questions can reference back to) would read better than reusing `story`/`explanation` for long comprehension texts. This needs a small addition to `Lesson.jsx`'s renderer — not required to start authoring content (the mapping above works fine as a stand-in), but worth building once there are 3-4 English chapters proving out the pattern.

## Sample lesson: Letter Writing (Formal Letter)

Save as `src/chapters/chapter-15/lesson-01.json` (assuming this is chapter 1 of English):

```json
{
  "id": "chapter-15-lesson-01",
  "chapterId": "chapter-15",
  "order": 1,
  "title": { "hi": "Formal Letter Writing", "en": "Formal Letter Writing" },
  "estimatedMinutes": 12,
  "xpReward": 40,
  "coinReward": 10,
  "hero": {
    "emoji": "✉️",
    "headline": { "hi": "Formal Letter Kaise Likhein", "en": "How to Write a Formal Letter" },
    "subtext": { "hi": "Sahi format mein likhi formal letter marks turant badha deti hai.", "en": "A correctly formatted formal letter instantly earns full marks." }
  },
  "story": {
    "text": { "hi": "Board exam mein formal letters — complaint, request, ya inquiry — bahut common hain. Format yaad rakhna sabse zaroori hai.", "en": "Formal letters — complaints, requests, inquiries — are very common in board exams. Remembering the format matters most." }
  },
  "explanation": [
    { "type": "text", "content": { "hi": "Formal letter ke 6 parts hote hain: Sender's address, Date, Receiver's address, Subject, Salutation, Body, Closing.", "en": "A formal letter has 6 parts: Sender's address, Date, Receiver's address, Subject, Salutation, Body, Closing." } }
  ],
  "examples": [
    {
      "problem": { "hi": "Apne locality mein streetlights kharab hone ki complaint likho Municipal Corporation ko.", "en": "Write a letter of complaint to the Municipal Corporation about broken streetlights in your locality." },
      "steps": [
        { "hi": "Sender's address (top-left)", "en": "Sender's address (top-left)" },
        { "hi": "Date (address ke neeche)", "en": "Date (below address)" },
        { "hi": "Receiver's address: The Commissioner, Municipal Corporation", "en": "Receiver's address: The Commissioner, Municipal Corporation" },
        { "hi": "Subject: Complaint regarding broken streetlights", "en": "Subject: Complaint regarding broken streetlights" },
        { "hi": "Salutation: Sir/Madam", "en": "Salutation: Sir/Madam" },
        { "hi": "Body: 3 paragraphs — problem, impact, request for action", "en": "Body: 3 paragraphs — problem, impact, request for action" },
        { "hi": "Closing: Yours faithfully + name", "en": "Closing: Yours faithfully + name" }
      ]
    }
  ],
  "quiz": {
    "questions": [
      {
        "type": "mcq", "difficulty": "easy",
        "question": { "hi": "Formal letter mein 'Yours faithfully' kab use karte hain?", "en": "When do you use 'Yours faithfully' in a formal letter?" },
        "options": [
          { "hi": "Jab receiver ka naam pata ho", "en": "When you know the receiver's name" },
          { "hi": "Jab salutation 'Sir/Madam' ho (naam pata na ho)", "en": "When the salutation is 'Sir/Madam' (name unknown)" },
          { "hi": "Sirf friends ko likhte waqt", "en": "Only when writing to friends" },
          { "hi": "Kabhi nahi", "en": "Never" }
        ],
        "correct": 1,
        "explanation": { "hi": "'Yours faithfully' tab jab receiver ka naam pata na ho; naam pata ho to 'Yours sincerely'.", "en": "'Yours faithfully' is used when the receiver's name is unknown; 'Yours sincerely' when it's known." }
      }
    ]
  },
  "notes": [
    { "hi": "6 parts yaad rakho: Address, Date, Address, Subject, Salutation, Body, Closing", "en": "Remember the 6 parts: Address, Date, Address, Subject, Salutation, Body, Closing" }
  ],
  "summary": { "hi": "Format sahi ho to content chhota bhi ho to poore marks milte hain.", "en": "Get the format right and even a short letter earns full marks." },
  "reward": { "badge": null }
}
```

This demonstrates the full mapping pattern — copy this file's structure for grammar, comprehension, and literature lessons, swapping in the content-type guidance from the table above.
