import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { SUBJECTS } from '../config/subjects';
import { useProgress } from '../store/ProgressContext';

// Subject roster lives in src/config/subjects.js (single source of
// truth, shared with Home, ChapterList, and PreviousPapers). Adding a
// real subject is: drop chapters/ JSON with the right meta.json
// "subject" field + flip `available: true` for that entry in subjects.js.
//
// Picking a subject here PERSISTS it (settings.activeSubject, saved to
// IndexedDB) so Home shows that subject on every future visit until the
// student picks a different one — this is what makes subject choice
// live on the Home screen instead of only being a one-time browse.

export default function SelectClass() {
  const navigate = useNavigate();
  const { updateSetting, settings } = useProgress();

  function choose(slug) {
    updateSetting('activeSubject', slug);
    navigate('/home', { replace: true });
  }

  return (
    <div className="pb-24 px-4 pt-6">
      <h1 className="font-display font-bold text-2xl mb-1">Choose your course</h1>
      <p className="text-[13px] text-[var(--color-muted)] mb-5">More classes & subjects add hote rahenge — bina app update ke.</p>
      <div className="grid grid-cols-2 gap-3">
        {SUBJECTS.map((s, i) => (
          <motion.button
            key={s.slug}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            disabled={!s.available}
            onClick={() => s.available && choose(s.slug)}
            className={`rounded-2xl p-4 text-left border relative ${
              s.available
                ? 'bg-[var(--color-surface)] border-[var(--color-saffron)]/40'
                : 'bg-[var(--color-surface)]/40 border-[var(--color-border)]/50 opacity-50'
            }`}
          >
            {settings.activeSubject === s.slug && (
              <span className="absolute top-2 right-2 text-[10px] bg-[var(--color-saffron)] text-black font-semibold px-2 py-0.5 rounded-full">Current</span>
            )}
            <div className="text-3xl mb-2">{s.icon}</div>
            <p className="font-display font-semibold text-[15px]">{s.subjectLabel}</p>
            <p className="text-[12px] text-[var(--color-muted)]">{s.classLabel}</p>
            {!s.available && <p className="text-[10px] text-[var(--color-muted-2)] mt-2">Coming soon</p>}
          </motion.button>
        ))}
      </div>
    </div>
  );
}
