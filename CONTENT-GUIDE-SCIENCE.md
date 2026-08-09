# Science Content Authoring Guide — CBSE Class 10

Extends the base `CONTENT-GUIDE.md` schema — read that first. This document covers how to map **Science-specific content** (Physics/Chemistry/Biology: experiments, chemical equations, diagrams, NCERT in-text questions) onto that same schema.

## Folder numbering

Start Science after wherever the LAST subject ends — check the "Claimed folder ranges" table in the base CONTENT-GUIDE.md first (English currently claims chapter-15 through chapter-34 in full, so an earlier draft of this guide's suggestion of chapter-25 was WRONG and collided with English — this has already caused one real folder collision; Science's real range is chapter-35 through chapter-47). Folder numbers just need to be globally unique — they don't need to be contiguous with other subjects. Each chapter's `order` field restarts at `1` for Science specifically (see base guide's "Adding a new subject" section).

`meta.json`'s `"subject"` field must be exactly `"Science"`.

## Mapping Science content onto the existing schema

Science actually fits the existing schema quite naturally — it was originally built with numerical/formula-heavy content in mind (from Maths), which overlaps a lot with Physics and Chemistry:

| Science content type | Which block to use |
|---|---|
| Physics formula (e.g. Ohm's Law, lens formula) | `explanation` block, `type: "formula"` — exactly like a Maths formula: `"V = IR"` |
| Chemical equation | `explanation` or `examples.steps`, `type: "formula"` — e.g. `"Zn + H₂SO₄ → ZnSO₄ + H₂↑"` |
| Numerical problem (Physics/Chemistry calculation) | `examples` block — `problem` = the question, `steps` = worked solution, identical to how Maths word problems are structured |
| Activity / experiment (NCERT "Activity 1.1" style) | `examples` block — `problem` = "Activity: ...", `steps` = the procedure, one step per array entry |
| NCERT in-text/exercise questions | `quiz.questions` — map MCQ/true-false directly; short-answer NCERT questions fit better in `important-questions.json`'s `subjective` array |
| Diagram description (circuit, ray diagram, biological diagram) | `diagram` block (`emoji` + `caption`) — see limitation below |
| Key terms / definitions | `notes` array, or `revision.json`'s `flashcards` (front = term, back = definition) |

## Important limitation: no real diagrams yet

## Chemical formula notation — subscripts, not plain digits

Every chemical formula must use proper Unicode subscript characters for
the atom-count numbers (₀₁₂₃₄₅₆₇₈₉), never plain digits — O₂ not O2,
H₂O not H2O, Fe₂O₃ not Fe2O3. A leading **coefficient** (how many
molecules, e.g. the "2" in `2Mg`) stays a normal digit — only the
digits that are part of the formula itself (subscripts) need
converting. Example: `2Fe + 3O₂ → 2Fe₂O₃` — the 2 and 3 in front are
coefficients (normal digits), the ₂ and ₃ inside `Fe₂O₃` are
subscripts. This applies everywhere a formula appears: explanation
text, formula blocks, quiz questions/options, examples, revision
flashcards/formula sheets — every chapter, not just Chemical Reactions.

The current `diagram` block only supports a single emoji + a caption — it cannot render an actual circuit diagram, ray diagram, cell structure, or other real illustrations that Science genuinely needs (e.g. "draw the path of a ray of light through a convex lens"). Two options for now:

1. **Short term (works today):** describe the diagram in words inside `explanation` text blocks — e.g. "Draw two parallel horizontal lines representing the two media, a ray hitting the boundary at angle θ₁, bending toward the normal at angle θ₂ in the denser medium..." This is not ideal but is honest and functional.
2. **Proper fix (needs new dev work):** add real image support — a new field on the `diagram` block like `"src": "chapter-35/lesson-03-circuit.svg"`, with the actual SVG/PNG file placed in `public/chapters/...` and referenced by path. This is a genuine gap worth prioritizing once 2-3 Science chapters are ready to author, since several Science topics (optics, circuits, the heart, nephron) are close to impossible to teach well through text alone.

Flag this to whoever's doing the next round of app architecture work — it's a real content-quality blocker for Science specifically (Maths mostly avoided needing it by relying on described geometric relationships instead of actual figures).

## Sample lesson: Chemical Reactions — Combination Reaction

Save as `src/chapters/chapter-35/lesson-01.json` (assuming this is chapter 1 of Science):

```json
{
  "id": "chapter-35-lesson-01",
  "chapterId": "chapter-35",
  "order": 1,
  "title": { "hi": "Combination Reactions", "en": "Combination Reactions" },
  "estimatedMinutes": 12,
  "xpReward": 40,
  "coinReward": 10,
  "hero": {
    "emoji": "⚗️",
    "headline": { "hi": "Do Cheezein Mil Kar Ek Bani", "en": "Two Things Combine Into One" },
    "subtext": { "hi": "Combination reaction mein do ya zyada reactants milkar ek hi product banate hain.", "en": "In a combination reaction, two or more reactants combine to form a single product." }
  },
  "story": {
    "text": { "hi": "Jab quicklime (CaO) pe paani daalte hain, garmi ke saath slaked lime (Ca(OH)₂) banta hai — ye ek classic combination reaction hai jo masonry work mein bhi use hoti hai.", "en": "When water is added to quicklime (CaO), it releases heat and forms slaked lime (Ca(OH)₂) — a classic combination reaction also used in masonry work." }
  },
  "explanation": [
    { "type": "text", "content": { "hi": "Combination reaction ka general form: A + B → AB", "en": "General form of a combination reaction: A + B → AB" } },
    { "type": "formula", "content": "CaO + H₂O → Ca(OH)₂ + Heat" },
    { "type": "text", "content": { "hi": "Ye reaction exothermic hai (heat release karti hai) — isliye slaked lime banane ke turant baad container garam ho jaata hai.", "en": "This reaction is exothermic (releases heat) — that's why the container feels hot right after slaked lime forms." } }
  ],
  "examples": [
    {
      "problem": { "hi": "Activity: Magnesium ribbon ko jalao aur observe karo.", "en": "Activity: Burn a magnesium ribbon and observe." },
      "steps": [
        { "hi": "Magnesium ribbon ko sandpaper se saaf karo (oxide layer hatane ke liye)", "en": "Clean the magnesium ribbon with sandpaper (to remove the oxide layer)" },
        { "hi": "Ribbon ko tongs se pakad kar flame mein jalao", "en": "Hold the ribbon with tongs and burn it in a flame" },
        { "hi": "Bright white light aur white ash (MgO) banega", "en": "A bright white light appears, forming white ash (MgO)" },
        { "hi": "Equation: 2Mg + O₂ → 2MgO", "en": "Equation: 2Mg + O₂ → 2MgO" }
      ]
    }
  ],
  "quiz": {
    "questions": [
      {
        "type": "mcq", "difficulty": "easy",
        "question": { "hi": "CaO + H₂O → Ca(OH)₂ kis type ki reaction hai?", "en": "CaO + H₂O → Ca(OH)₂ is what type of reaction?" },
        "options": [
          { "hi": "Decomposition", "en": "Decomposition" },
          { "hi": "Combination", "en": "Combination" },
          { "hi": "Displacement", "en": "Displacement" },
          { "hi": "Double displacement", "en": "Double displacement" }
        ],
        "correct": 1,
        "explanation": { "hi": "Do reactants (CaO aur H₂O) milkar ek product (Ca(OH)₂) bana rahe hain — ye combination reaction hai.", "en": "Two reactants (CaO and H₂O) combine to form one product (Ca(OH)₂) — this is a combination reaction." }
      }
    ]
  },
  "notes": [
    { "hi": "Combination reaction: A + B → AB", "en": "Combination reaction: A + B → AB" },
    { "hi": "CaO + H₂O → Ca(OH)₂ exothermic hai", "en": "CaO + H₂O → Ca(OH)₂ is exothermic" }
  ],
  "summary": { "hi": "Combination reactions mein hamesha ek hi product banta hai do ya zyada reactants se.", "en": "Combination reactions always form a single product from two or more reactants." },
  "reward": { "badge": null }
}
```
