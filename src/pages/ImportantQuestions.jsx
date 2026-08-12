import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getChapterById, getImportantQuestions } from '../services/contentLoader';
import { useProgress } from '../store/ProgressContext';
import { t, langCode } from '../utils/i18n';

/**
 * Board-exam style Important Questions bank: Objective (MCQ, fast tap-to-
 * reveal) and Subjective (short/long answer, expand-to-reveal model
 * answer) — separate from the interactive lesson quiz, matching how
 * students actually revise before exams.
 */
export default function ImportantQuestions() {
  const { chapterId } = useParams();
  const navigate = useNavigate();
  const chapter = getChapterById(chapterId);
  const iq = getImportantQuestions(chapterId);
  const { settings } = useProgress();
  const lang = langCode(settings.language);
  const [tab, setTab] = useState('objective');
  const [revealed, setRevealed] = useState({});

  if (!chapter) return <div className="p-6 text-center text-[var(--color-muted)]">Chapter not found.</div>;

  if (!iq) {
    return (
      <div className="pb-24 px-4 pt-6">
        <button onClick={() => navigate(-1)} className="text-[13px] text-[var(--color-muted)] mb-3">← Back</button>
        <h1 className="font-display font-bold text-2xl mb-1">Important Questions</h1>
        <p className="text-[13px] text-[var(--color-muted)] text-center py-10">
          Ye chapter ke liye important questions abhi authored nahi hue.
        </p>
      </div>
    );
  }

  const objective = iq.objective || [];
  const subjective = iq.subjective || [];

  return (
    <div className="pb-24 px-4 pt-6">
      <button onClick={() => navigate(-1)} className="text-[13px] text-[var(--color-muted)] mb-3">← Back</button>
      <h1 className="font-display font-bold text-2xl mb-1">Important Questions</h1>
      <p className="text-[13px] text-[var(--color-muted)] mb-4">{t(chapter.title, lang)} · Board exam pattern</p>

      <div className="flex gap-2 mb-5">
        <button
          onClick={() => setTab('objective')}
          className={`flex-1 py-2.5 rounded-xl border text-[13px] font-medium ${
            tab === 'objective' ? 'border-[var(--color-saffron)] bg-[var(--color-saffron)]/15 text-[var(--color-saffron-soft)]' : 'border-[var(--color-border)] bg-[var(--color-surface)]'
          }`}
        >
          Objective ({objective.length})
        </button>
        <button
          onClick={() => setTab('subjective')}
          className={`flex-1 py-2.5 rounded-xl border text-[13px] font-medium ${
            tab === 'subjective' ? 'border-[var(--color-saffron)] bg-[var(--color-saffron)]/15 text-[var(--color-saffron-soft)]' : 'border-[var(--color-border)] bg-[var(--color-surface)]'
          }`}
        >
          Subjective ({subjective.length})
        </button>
      </div>

      {tab === 'objective' && (
        <div className="space-y-3">
          {objective.map((q, i) => {
            const key = `o${i}`;
            const isOpen = revealed[key];
            return (
              <div key={i} className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-4">
                <p className="text-[13px] font-medium mb-2">{i + 1}. {t(q.question, lang)}</p>
                <div className="space-y-1.5 mb-2">
                  {(q.options || []).map((opt, oi) => (
                    <div
                      key={oi}
                      className={`text-[12px] px-3 py-2 rounded-lg border ${
                        isOpen && oi === q.correct
                          ? 'border-[var(--color-success)] bg-[var(--color-success-soft)]'
                          : 'border-[var(--color-border)] bg-[var(--color-surface-raised)]/40'
                      }`}
                    >
                      {t(opt, lang)}
                    </div>
                  ))}
                </div>
                <button
                  onClick={() => setRevealed((r) => ({ ...r, [key]: !r[key] }))}
                  className="text-[11px] text-[var(--color-saffron)] font-medium"
                >
                  {isOpen ? 'Hide answer' : 'Show answer'}
                </button>
                {isOpen && q.explanation && (
                  <p className="text-[11px] text-[var(--color-muted)] mt-2">💡 {t(q.explanation, lang)}</p>
                )}
              </div>
            );
          })}
          {objective.length === 0 && <p className="text-[13px] text-[var(--color-muted)] text-center py-8">Koi objective questions nahi mile.</p>}
        </div>
      )}

      {tab === 'subjective' && (
        <div className="space-y-3">
          {subjective.map((q, i) => {
            const key = `s${i}`;
            const isOpen = revealed[key];
            return (
              <div key={i} className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-4">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <p className="text-[13px] font-medium flex-1">{i + 1}. {t(q.question, lang)}</p>
                  {q.marks && (
                    <span className="text-[10px] font-mono text-[var(--color-gold)] shrink-0 bg-[var(--color-surface-raised)] px-2 py-0.5 rounded-full">
                      {q.marks}m
                    </span>
                  )}
                </div>
                <button
                  onClick={() => setRevealed((r) => ({ ...r, [key]: !r[key] }))}
                  className="text-[11px] text-[var(--color-saffron)] font-medium"
                >
                  {isOpen ? 'Hide model answer' : 'Show model answer'}
                </button>
                {isOpen && (
                  <div className="mt-2 text-[12px] text-[var(--color-cream)] bg-[var(--color-surface-raised)] rounded-lg p-3 whitespace-pre-line leading-relaxed">
                    {t(q.answer, lang)}
                  </div>
                )}
              </div>
            );
          })}
          {subjective.length === 0 && <p className="text-[13px] text-[var(--color-muted)] text-center py-8">Koi subjective questions nahi mile.</p>}
        </div>
      )}
    </div>
  );
}
