import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

// Future-ready roster. Only class10-maths has real content today; others
// are declared here as data (not routed logic) so adding a real subject
// later is just: drop chapters/ JSON + flip `available: true`.
const SUBJECTS = [
  { id: 'class10-maths', classLabel: 'Class 10', subject: 'Maths', icon: '📐', available: true },
  { id: 'class10-science', classLabel: 'Class 10', subject: 'Science', icon: '🔬', available: false },
  { id: 'class10-sst', classLabel: 'Class 10', subject: 'Social Science', icon: '🌍', available: false },
  { id: 'class10-english', classLabel: 'Class 10', subject: 'English', icon: '📖', available: false },
  { id: 'class9-maths', classLabel: 'Class 9', subject: 'Maths', icon: '📐', available: false },
  { id: 'class12-maths', classLabel: 'Class 12', subject: 'Maths', icon: '📐', available: false },
];

export default function SelectClass() {
  const navigate = useNavigate();
  return (
    <div className="pb-24 px-4 pt-6">
      <h1 className="font-display font-bold text-2xl mb-1">Choose your course</h1>
      <p className="text-[13px] text-[var(--color-muted)] mb-5">More classes & subjects add hote rahenge — bina app update ke.</p>
      <div className="grid grid-cols-2 gap-3">
        {SUBJECTS.map((s, i) => (
          <motion.button
            key={s.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            disabled={!s.available}
            onClick={() => s.available && navigate('/chapters')}
            className={`rounded-2xl p-4 text-left border ${
              s.available
                ? 'bg-[var(--color-surface)] border-[var(--color-saffron)]/40'
                : 'bg-[var(--color-surface)]/40 border-[var(--color-border)]/50 opacity-50'
            }`}
          >
            <div className="text-3xl mb-2">{s.icon}</div>
            <p className="font-display font-semibold text-[15px]">{s.subject}</p>
            <p className="text-[12px] text-[var(--color-muted)]">{s.classLabel}</p>
            {!s.available && <p className="text-[10px] text-[var(--color-muted-2)] mt-2">Coming soon</p>}
          </motion.button>
        ))}
      </div>
    </div>
  );
}
