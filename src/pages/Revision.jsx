import { useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getChapterById, getLessonsForChapter, getRevision } from '../services/contentLoader';
import { useProgress } from '../store/ProgressContext';
import Flashcard from '../components/Flashcard';
import { t, tList, localizeQuestions, langCode } from '../utils/i18n';

const TABS = [
  { id: 'flashcards', label: 'Flashcards', icon: '🗂️' },
  { id: 'mindmap', label: 'Mind Map', icon: '🧠' },
  { id: 'formulas', label: 'Formula Sheet', icon: '📐' },
  { id: 'rapidfire', label: 'Rapid Fire', icon: '⚡' },
];

export default function Revision() {
  const { chapterId } = useParams();
  const navigate = useNavigate();
  const chapter = getChapterById(chapterId);
  const lessons = getLessonsForChapter(chapterId);
  const revision = getRevision(chapterId);
  const { progress, toggleBookmark, settings } = useProgress();
  const lang = langCode(settings.language);
  const [tab, setTab] = useState('flashcards');

  // Flashcards can come from a dedicated revision.json, or auto-derive from
  // each lesson's `notes` array as a sane fallback — still zero hardcoding.
  const flashcardsRaw = revision?.flashcards?.length
    ? revision.flashcards
    : lessons.flatMap((l) => (l.notes || []).map((n) => ({ front: l.title, back: n })));
  const flashcards = flashcardsRaw.map((fc) => ({ front: t(fc.front, lang), back: t(fc.back, lang) }));

  const formulas = (revision?.formulaSheet || []).map((f) => ({ label: t(f.label, lang), formula: f.formula }));
  const mindmapRaw = revision?.mindMap || null;
  const mindmap = mindmapRaw
    ? { root: t(mindmapRaw.root, lang), branches: (mindmapRaw.branches || []).map((b) => ({ label: t(b.label, lang), children: tList(b.children, lang) })) }
    : null;
  const rapidFireRaw = revision?.rapidFire?.length ? revision.rapidFire : lessons.flatMap((l) => l.quiz?.questions || []).slice(0, 10);
  const rapidFire = localizeQuestions(rapidFireRaw, lang);

  if (!chapter) return <div className="p-6 text-center text-[var(--color-muted)]">Chapter not found.</div>;

  return (
    <div className="pb-24 px-4 pt-6">
      <button onClick={() => navigate(-1)} className="text-[13px] text-[var(--color-muted)] mb-3">← Back</button>
      <h1 className="font-display font-bold text-2xl mb-1">Revision</h1>
      <p className="text-[13px] text-[var(--color-muted)] mb-4">{t(chapter.title, lang)}</p>

      <div className="flex gap-2 mb-5 overflow-x-auto pb-1">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`shrink-0 px-3.5 py-2 rounded-full text-[12px] font-medium border ${
              tab === t.id ? 'border-[var(--color-saffron)] bg-[var(--color-saffron)]/15 text-[var(--color-saffron-soft)]' : 'border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-muted)]'
            }`}
          >
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {tab === 'flashcards' && (
        <div className="space-y-4">
          {flashcards.length === 0 && <p className="text-[13px] text-[var(--color-muted)] text-center py-8">Koi flashcards nahi mile abhi.</p>}
          {flashcards.map((fc, i) => (
            <Flashcard key={i} front={fc.front} back={fc.back} />
          ))}
        </div>
      )}

      {tab === 'mindmap' && (
        <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-5">
          {mindmap ? (
            <div>
              <p className="font-display font-semibold text-lg mb-3 text-center">{mindmap.root}</p>
              <div className="space-y-2">
                {mindmap.branches?.map((b, i) => (
                  <div key={i} className="rounded-xl bg-[var(--color-surface-raised)] px-3 py-2">
                    <p className="text-[13px] font-medium text-[var(--color-saffron-soft)]">{b.label}</p>
                    <p className="text-[12px] text-[var(--color-muted)] mt-0.5">{b.children?.join(' · ')}</p>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <p className="text-[13px] text-[var(--color-muted)] text-center py-8">Mind map is chapter ke liye add nahi hua abhi.</p>
          )}
        </div>
      )}

      {tab === 'formulas' && (
        <div className="space-y-2.5">
          {formulas.length === 0 && <p className="text-[13px] text-[var(--color-muted)] text-center py-8">Formula sheet abhi available nahi.</p>}
          {formulas.map((f, i) => (
            <div key={i} className="flex items-center justify-between bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl px-4 py-3">
              <div>
                <p className="text-[13px] text-[var(--color-muted)]">{f.label}</p>
                <p className="font-mono text-[15px] text-[var(--color-gold)] mt-0.5">{f.formula}</p>
              </div>
              <button onClick={() => toggleBookmark(`formula-${i}-${chapterId}`)} className="text-lg">
                {progress.bookmarks?.includes(`formula-${i}-${chapterId}`) ? '🔖' : '📑'}
              </button>
            </div>
          ))}
        </div>
      )}

      {tab === 'rapidfire' && (
        <div className="space-y-2.5">
          {rapidFire.length === 0 && <p className="text-[13px] text-[var(--color-muted)] text-center py-8">Rapid fire questions nahi mile.</p>}
          {rapidFire.map((q, i) => (
            <details key={i} className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl px-4 py-3">
              <summary className="text-[13px] font-medium cursor-pointer">{q.question}</summary>
              <p className="text-[12px] text-[var(--color-muted)] mt-2">{q.explanation || (q.options ? q.options[q.correct] : '')}</p>
            </details>
          ))}
        </div>
      )}
    </div>
  );
}
