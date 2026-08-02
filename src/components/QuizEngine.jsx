/**
 * QuizEngine — renders MCQ / True-False / Match / Drag&Drop questions
 * purely from a JSON `questions[]` array. Adding a new question type to
 * a lesson JSON just works as long as `type` matches one of the cases
 * below — no per-lesson code is ever written.
 */
import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSound } from '../hooks/useSound';

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function MCQQuestion({ q, onAnswer }) {
  const [picked, setPicked] = useState(null);
  const options = useMemo(() => q.options, [q]);

  function pick(i) {
    if (picked !== null) return;
    setPicked(i);
    const correct = i === q.correct;
    onAnswer(correct);
  }

  return (
    <div>
      <h3 className="font-display font-semibold text-lg mb-4">{q.question}</h3>
      <div className="space-y-2.5">
        {options.map((opt, i) => {
          const isCorrect = i === q.correct;
          const isPicked = i === picked;
          let cls = 'border-[var(--color-border)] bg-[var(--color-surface)]';
          if (picked !== null) {
            if (isCorrect) cls = 'border-[var(--color-success)] bg-[var(--color-success-soft)]';
            else if (isPicked) cls = 'border-[var(--color-error)] bg-[var(--color-error-soft)]';
          }
          return (
            <button
              key={i}
              onClick={() => pick(i)}
              className={`w-full text-left px-4 py-3 rounded-xl border transition-colors ${cls}`}
            >
              <span className="text-[14px]">{opt}</span>
            </button>
          );
        })}
      </div>
      <AnimatePresence>
        {picked !== null && q.explanation && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="mt-3 text-[13px] text-[var(--color-muted)] bg-[var(--color-surface)] rounded-xl p-3 border border-[var(--color-border)]"
          >
            💡 {q.explanation}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function TrueFalseQuestion({ q, onAnswer }) {
  const [picked, setPicked] = useState(null);
  function pick(val) {
    if (picked !== null) return;
    setPicked(val);
    onAnswer(val === q.correct);
  }
  return (
    <div>
      <h3 className="font-display font-semibold text-lg mb-4">{q.question}</h3>
      <div className="flex gap-3">
        {[true, false].map((val) => {
          let cls = 'border-[var(--color-border)] bg-[var(--color-surface)]';
          if (picked !== null) {
            if (val === q.correct) cls = 'border-[var(--color-success)] bg-[var(--color-success-soft)]';
            else if (val === picked) cls = 'border-[var(--color-error)] bg-[var(--color-error-soft)]';
          }
          return (
            <button key={String(val)} onClick={() => pick(val)} className={`flex-1 py-3 rounded-xl border font-semibold ${cls}`}>
              {val ? 'True' : 'False'}
            </button>
          );
        })}
      </div>
      {picked !== null && q.explanation && (
        <div className="mt-3 text-[13px] text-[var(--color-muted)] bg-[var(--color-surface)] rounded-xl p-3 border border-[var(--color-border)]">
          💡 {q.explanation}
        </div>
      )}
    </div>
  );
}

function MatchQuestion({ q, onAnswer }) {
  const [leftSel, setLeftSel] = useState(null);
  const [matched, setMatched] = useState({});
  const [wrongFlash, setWrongFlash] = useState(null);
  const rightShuffled = useMemo(() => shuffle(q.pairs.map((p, i) => ({ ...p, idx: i }))), [q]);
  const done = Object.keys(matched).length === q.pairs.length;

  useEffect(() => {
    if (done) onAnswer(true);
  }, [done]);

  function clickLeft(i) {
    if (matched[i]) return;
    setLeftSel(i);
  }
  function clickRight(rightIdx) {
    if (leftSel === null) return;
    if (rightIdx === leftSel) {
      setMatched((m) => ({ ...m, [leftSel]: true }));
      setLeftSel(null);
    } else {
      setWrongFlash(rightIdx);
      setTimeout(() => setWrongFlash(null), 400);
    }
  }

  return (
    <div>
      <h3 className="font-display font-semibold text-lg mb-4">{q.question || 'Match the pairs'}</h3>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          {q.pairs.map((p, i) => (
            <button
              key={i}
              onClick={() => clickLeft(i)}
              disabled={!!matched[i]}
              className={`w-full px-3 py-2.5 rounded-lg border text-[13px] text-left ${
                matched[i]
                  ? 'border-[var(--color-success)] bg-[var(--color-success-soft)] opacity-70'
                  : leftSel === i
                  ? 'border-[var(--color-saffron)] bg-[var(--color-surface-raised)]'
                  : 'border-[var(--color-border)] bg-[var(--color-surface)]'
              }`}
            >
              {p.left}
            </button>
          ))}
        </div>
        <div className="space-y-2">
          {rightShuffled.map((p) => (
            <button
              key={p.idx}
              onClick={() => clickRight(p.idx)}
              disabled={!!matched[p.idx]}
              className={`w-full px-3 py-2.5 rounded-lg border text-[13px] text-left ${
                matched[p.idx]
                  ? 'border-[var(--color-success)] bg-[var(--color-success-soft)] opacity-70'
                  : wrongFlash === p.idx
                  ? 'border-[var(--color-error)] bg-[var(--color-error-soft)]'
                  : 'border-[var(--color-border)] bg-[var(--color-surface)]'
              }`}
            >
              {p.right}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function DragDropQuestion({ q, onAnswer }) {
  // Lightweight tap-to-place implementation (touch-friendly, no native DnD needed)
  const [slots, setSlots] = useState(Array(q.blanks.length).fill(null));
  const [bank, setBank] = useState(shuffle(q.tokens));
  const [checked, setChecked] = useState(false);

  function placeInSlot(token, slotIdx) {
    if (checked) return;
    const nextSlots = [...slots];
    const emptyIdx = nextSlots.findIndex((s) => s === null);
    const targetIdx = slotIdx ?? emptyIdx;
    if (targetIdx === -1) return;
    nextSlots[targetIdx] = token;
    setSlots(nextSlots);
    setBank((b) => b.filter((t) => t !== token));
  }

  function removeFromSlot(idx) {
    if (checked) return;
    const token = slots[idx];
    if (!token) return;
    const nextSlots = [...slots];
    nextSlots[idx] = null;
    setSlots(nextSlots);
    setBank((b) => [...b, token]);
  }

  function check() {
    setChecked(true);
    const correct = slots.every((s, i) => s === q.blanks[i]);
    onAnswer(correct);
  }

  return (
    <div>
      <h3 className="font-display font-semibold text-lg mb-4">{q.question}</h3>
      <div className="flex flex-wrap gap-2 mb-4">
        {q.sentenceParts.map((part, i) => (
          <span key={i} className="flex items-center gap-2">
            <span className="text-[14px] text-[var(--color-cream)]">{part}</span>
            {i < q.blanks.length && (
              <button
                onClick={() => removeFromSlot(i)}
                className={`min-w-[64px] px-2 py-1 rounded-md border text-[13px] font-mono ${
                  checked
                    ? slots[i] === q.blanks[i]
                      ? 'border-[var(--color-success)] bg-[var(--color-success-soft)]'
                      : 'border-[var(--color-error)] bg-[var(--color-error-soft)]'
                    : 'border-dashed border-[var(--color-saffron)]/60 bg-[var(--color-surface)]'
                }`}
              >
                {slots[i] ?? '____'}
              </button>
            )}
          </span>
        ))}
      </div>
      <div className="flex flex-wrap gap-2 mb-4">
        {bank.map((t) => (
          <button
            key={t}
            onClick={() => placeInSlot(t)}
            className="px-3 py-1.5 rounded-full border border-[var(--color-border)] bg-[var(--color-surface)] text-[13px] font-mono"
          >
            {t}
          </button>
        ))}
      </div>
      {!checked ? (
        <button
          onClick={check}
          disabled={slots.some((s) => s === null)}
          className="w-full py-3 rounded-xl bg-[var(--color-saffron)] disabled:opacity-40 font-semibold"
        >
          Check
        </button>
      ) : (
        q.explanation && (
          <div className="text-[13px] text-[var(--color-muted)] bg-[var(--color-surface)] rounded-xl p-3 border border-[var(--color-border)]">
            💡 {q.explanation}
          </div>
        )
      )}
    </div>
  );
}

const RENDERERS = {
  mcq: MCQQuestion,
  truefalse: TrueFalseQuestion,
  match: MatchQuestion,
  dragdrop: DragDropQuestion,
};

/**
 * <QuizEngine questions={[...]} onComplete={(result) => {}} timerSeconds={optional} />
 */
export default function QuizEngine({ questions, onComplete, timerSeconds }) {
  const [i, setI] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [answeredThis, setAnsweredThis] = useState(false);
  const [timeLeft, setTimeLeft] = useState(timerSeconds ?? null);
  const { play } = useSound();

  useEffect(() => {
    if (timeLeft === null) return;
    if (timeLeft <= 0) {
      handleAnswer(false);
      return;
    }
    const t = setTimeout(() => setTimeLeft((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [timeLeft]);

  const q = questions[i];
  const Renderer = RENDERERS[q.type] || MCQQuestion;

  function handleAnswer(correct) {
    if (answeredThis) return;
    setAnsweredThis(true);
    play(correct ? 'correct' : 'wrong');
    if (correct) setCorrectCount((c) => c + 1);
  }

  function next() {
    if (i === questions.length - 1) {
      onComplete({
        correct: correctCount,
        total: questions.length,
        percent: Math.round((correctCount / questions.length) * 100),
      });
      return;
    }
    setI((v) => v + 1);
    setAnsweredThis(false);
    setTimeLeft(timerSeconds ?? null);
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div className="flex-1 h-1.5 bg-[var(--color-surface-raised)] rounded-full overflow-hidden mr-3">
          <motion.div
            className="h-full bg-[var(--color-saffron)] rounded-full"
            animate={{ width: `${((i + (answeredThis ? 1 : 0)) / questions.length) * 100}%` }}
          />
        </div>
        {timerSeconds && (
          <span className="font-mono text-[13px] text-[var(--color-gold)] shrink-0">⏱ {timeLeft}s</span>
        )}
      </div>
      <AnimatePresence mode="wait">
        <motion.div
          key={i}
          initial={{ opacity: 0, x: 16 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -16 }}
          transition={{ duration: 0.25 }}
        >
          <Renderer q={q} onAnswer={handleAnswer} />
        </motion.div>
      </AnimatePresence>
      {answeredThis && (
        <motion.button
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          onClick={next}
          className="w-full mt-5 py-3 rounded-xl bg-[var(--color-saffron)] font-semibold shadow-[var(--shadow-glow-saffron)]"
        >
          {i === questions.length - 1 ? 'Finish' : 'Next'}
        </motion.button>
      )}
    </div>
  );
}
