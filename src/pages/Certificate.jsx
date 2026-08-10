import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { getChapterById } from '../services/contentLoader';
import { useProgress } from '../store/ProgressContext';
import { slugifySubjectName } from '../config/subjects';
import { BrandBadge } from '../components/GetDigitalsBrand';

export default function Certificate() {
  const { chapterId } = useParams();
  const navigate = useNavigate();
  const chapter = getChapterById(chapterId);
  const { progress } = useProgress();
  const result = progress.finalTestResults?.[chapterId];

  if (!chapter || !result) {
    return (
      <div className="p-6 text-center text-[var(--color-muted)]">
        Certificate ke liye pehle Final Test complete karo.
        <button onClick={() => navigate(`/chapter/${chapterId}`)} className="block mx-auto mt-4 text-[var(--color-saffron)] text-[13px]">← Back to chapter</button>
      </div>
    );
  }

  return (
    <div className="px-5 pt-8 pb-24 flex flex-col items-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full rounded-3xl p-6 border-2 border-[var(--color-gold)]/50 bg-gradient-to-br from-[var(--color-surface-raised)] to-[var(--color-surface)] relative overflow-hidden"
      >
        <div className="absolute -top-10 -right-10 w-32 h-32 rounded-full bg-[var(--color-gold)]/10" />
        <div className="absolute -bottom-14 -left-10 w-40 h-40 rounded-full bg-[var(--color-saffron)]/10" />
        <div className="relative text-center">
          <p className="text-[11px] tracking-[0.2em] text-[var(--color-gold)] font-semibold uppercase mb-2">Certificate of Achievement</p>
          <div className="text-5xl mb-3">🎓</div>
          <p className="text-[13px] text-[var(--color-muted)] mb-1">This certifies that</p>
          <h1 className="font-display font-bold text-2xl mb-2">A GetDigitals Topper</h1>
          <p className="text-[13px] text-[var(--color-muted)] mb-4">has successfully completed</p>
          <h2 className="font-display font-semibold text-lg text-[var(--color-saffron-soft)] mb-4">{chapter.title}</h2>
          <div className="flex justify-center gap-6 mb-4">
            <div>
              <p className="font-mono text-xl font-bold text-[var(--color-gold)]">{result.grade}</p>
              <p className="text-[10px] text-[var(--color-muted)]">Grade</p>
            </div>
            <div>
              <p className="font-mono text-xl font-bold">{result.marks}/{result.totalMarks}</p>
              <p className="text-[10px] text-[var(--color-muted)]">Marks</p>
            </div>
          </div>
          <p className="text-[11px] text-[var(--color-muted-2)] font-mono">
            {new Date(result.completedAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
          </p>
          <div className="flex justify-center mt-3">
            <BrandBadge />
          </div>
        </div>
      </motion.div>
      <p className="text-[11px] text-[var(--color-muted)] mt-4 text-center">Screenshot lekar apne parents ko dikhao! 📸</p>
      <button onClick={() => navigate(`/chapters/${slugifySubjectName(chapter.subject)}`)} className="w-full mt-6 py-3.5 rounded-xl bg-[var(--color-saffron)] font-semibold shadow-[var(--shadow-glow-saffron)]">
        Continue to Next Chapter
      </button>
    </div>
  );
}
