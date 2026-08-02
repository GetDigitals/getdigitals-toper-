# GetDigitals Topper — CBSE Class 10 Maths

**Learn • Practice • Score 95%+**

100% JSON-driven, offline-first learning app. React + Vite + Tailwind CSS v4 + Framer Motion + React Router + IndexedDB. No backend. No AI API. No monthly cost.

---

## Run it locally

```bash
npm install
npm run dev        # http://localhost:5173
```

## Build for production (Web + PWA)

```bash
npm run build       # outputs to /dist
npm run preview     # test the production build locally
```

`/dist` is a fully static, installable PWA — upload it to any static host (Hostinger, Netlify, Vercel, cPanel, GitHub Pages). It works 100% offline after the first load because of the built-in service worker (`public/sw.js`).

## Turning the PWA into an Android APK

The app is already a valid PWA (manifest + service worker + icons). Two zero-backend ways to get an APK:

1. **PWABuilder** (easiest, free): upload your deployed URL at https://www.pwabuilder.com → generates a signed/unsigned Android APK.
2. **Capacitor** (more control): `npm install @capacitor/core @capacitor/android`, then `npx cap init` and `npx cap add android` — wraps the built `/dist` folder into a native Android project you can open in Android Studio.

No app code changes needed for either path.

---

## The most important rule in this codebase

**Nothing about chapters, lessons, quizzes, badges, or XP is hardcoded anywhere in the React code.** Everything comes from JSON files under `src/chapters/`. The single file that "knows" the folder structure is `src/services/contentLoader.js` — it uses Vite's `import.meta.glob` to auto-discover every `meta.json` and `lesson-*.json` at build time.

### Adding Chapter 16 (or any new chapter) — no code changes

```
src/chapters/chapter-16/
  ├── meta.json          ← required
  ├── lesson-01.json     ← as many lessons as you want, any count
  ├── lesson-02.json
  ├── ...
  ├── final-test.json    ← optional (falls back to pooled lesson quizzes)
  └── revision.json      ← optional (falls back to auto-derived flashcards)
```

Run `npm run build` (or it hot-reloads instantly in `npm run dev`) — Chapter 16 now appears in Home, the chapter list, lesson screens, quiz engine, practice, revision, final test, and certificate flow automatically.

See `CONTENT-GUIDE.md` for the exact JSON schema of every file type, with field-by-field explanation.

---

## What's fully built and working right now

- Splash → Login/Skip → Home → Select Class → Chapter List → Chapter Detail → Lesson → Quiz → Practice → Revision → Final Test → Certificate → Next Chapter (the entire flow from your brief)
- **Chapter 1 "Real Numbers"** is fully authored with 6 real CBSE-syllabus lessons (Euclid's Division Lemma, HCF Algorithm, Fundamental Theorem of Arithmetic, Irrational Numbers proof, Decimal Expansion, Mixed Review), a Final Test, and Revision content (flashcards, formula sheet, mind map, rapid fire) — proving the whole architecture end-to-end.
- **Chapters 2–15** (Polynomials through Probability — the full CBSE syllabus list) exist as ready `meta.json` placeholders. Drop lesson JSON files into any of them and they go live instantly.
- Quiz engine supports MCQ, True/False, Match-the-pairs, and Drag & Drop — all driven by a `type` field per question, so adding a new question type to any lesson JSON just works.
- XP, coins, streak (with the custom "diya flame" visual instead of a generic 🔥), badges, daily goal, study time, accuracy, weak/strong topics — all persisted offline in IndexedDB, survive app reload.
- Dark/Light mode, Hinglish/English toggle, sound/voice settings, full progress reset — all in Settings.
- Sequential chapter unlocking (finish all lessons in a chapter → next chapter unlocks).

## What's a template, not fully authored

Only **content** — not code. Chapters 2–15 have no lesson JSON yet (that's real subject-matter writing, ~6-11 lessons × 14 chapters). The engine that renders them is 100% done; it's purely a content-authoring task from here, following `CONTENT-GUIDE.md`. I'd recommend authoring 2-3 chapters at a time and testing — happy to help write the JSON content itself in a follow-up if useful.

## Folder structure

```
src/
 ├── components/       Reusable UI: QuizEngine, ChapterCard, Flashcard, StreakDiya, RewardModal, BottomNav, TopStatsBar
 ├── pages/             Splash, Login, Home, SelectClass, ChapterList, ChapterDetail, Lesson, Practice, Revision, FinalTest, Certificate, Dashboard, Settings
 ├── chapters/          chapter-01/ ... chapter-15/  ← ALL CONTENT LIVES HERE (JSON only)
 ├── services/          contentLoader.js (the JSON engine), db.js (IndexedDB persistence)
 ├── store/             ProgressContext.jsx (global XP/streak/badges state)
 ├── utils/, hooks/, assets/   (ready for future use)
 └── App.jsx            Routing + layout shell
```
