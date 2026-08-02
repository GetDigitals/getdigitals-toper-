import { useState } from 'react';
import { useProgress } from '../store/ProgressContext';

function Toggle({ checked, onChange }) {
  return (
    <button
      onClick={() => onChange(!checked)}
      className={`w-11 h-6 rounded-full relative transition-colors ${checked ? 'bg-[var(--color-saffron)]' : 'bg-[var(--color-surface-raised)] border border-[var(--color-border)]'}`}
    >
      <span
        className="absolute top-0.5 w-5 h-5 rounded-full bg-white transition-transform"
        style={{ transform: checked ? 'translateX(21px)' : 'translateX(2px)' }}
      />
    </button>
  );
}

export default function Settings() {
  const { settings, updateSetting, resetProgress } = useProgress();
  const [confirmReset, setConfirmReset] = useState(false);

  return (
    <div className="pb-24 px-4 pt-6">
      <h1 className="font-display font-bold text-2xl mb-5">Settings</h1>

      <Section title="Appearance">
        <Row label="Dark Mode">
          <Toggle checked={settings.theme === 'dark'} onChange={(v) => updateSetting('theme', v ? 'dark' : 'light')} />
        </Row>
      </Section>

      <Section title="Language">
        <div className="flex gap-2">
          {[{ id: 'hinglish', label: 'Hinglish' }, { id: 'english', label: 'English' }].map((l) => (
            <button
              key={l.id}
              onClick={() => updateSetting('language', l.id)}
              className={`flex-1 py-2.5 rounded-xl border text-[13px] font-medium ${
                settings.language === l.id ? 'border-[var(--color-saffron)] bg-[var(--color-saffron)]/15 text-[var(--color-saffron-soft)]' : 'border-[var(--color-border)] bg-[var(--color-surface)]'
              }`}
            >
              {l.label}
            </button>
          ))}
        </div>
      </Section>

      <Section title="Sound & Voice">
        <Row label="Sound Effects">
          <Toggle checked={settings.sound} onChange={(v) => updateSetting('sound', v)} />
        </Row>
        <Row label="Voice Narration">
          <Toggle checked={settings.voice} onChange={(v) => updateSetting('voice', v)} />
        </Row>
      </Section>

      <Section title="Data">
        {!confirmReset ? (
          <button onClick={() => setConfirmReset(true)} className="w-full py-3 rounded-xl border border-[var(--color-error)]/40 text-[var(--color-error)] text-[13px] font-medium">
            Reset All Progress
          </button>
        ) : (
          <div className="space-y-2">
            <p className="text-[12px] text-[var(--color-muted)] text-center">Pakka? Ye XP, badges, streak — sab delete kar dega.</p>
            <div className="flex gap-2">
              <button onClick={() => setConfirmReset(false)} className="flex-1 py-2.5 rounded-xl border border-[var(--color-border)] text-[13px]">Cancel</button>
              <button
                onClick={() => { resetProgress(); setConfirmReset(false); }}
                className="flex-1 py-2.5 rounded-xl bg-[var(--color-error)] text-[13px] font-semibold"
              >
                Yes, Reset
              </button>
            </div>
          </div>
        )}
      </Section>

      <p className="text-center text-[11px] text-[var(--color-muted-2)] mt-6">GetDigitals Topper v1.0 · 100% Offline</p>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div className="mb-5">
      <p className="text-[12px] font-semibold text-[var(--color-muted)] mb-2 uppercase tracking-wide">{title}</p>
      <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-4 space-y-3">{children}</div>
    </div>
  );
}

function Row({ label, children }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-[14px]">{label}</span>
      {children}
    </div>
  );
}
