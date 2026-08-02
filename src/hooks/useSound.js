/**
 * useSound — 100% offline sound effects using the Web Audio API.
 * No audio files, no network requests (unlike a typical mixkit.co /
 * external-CDN approach) — every sound is synthesized in-browser with
 * oscillators, so it works with zero internet and zero asset weight.
 */
import { useCallback, useRef } from 'react';
import { useProgress } from '../store/ProgressContext';

let sharedCtx = null;
function getAudioCtx() {
  if (typeof window === 'undefined') return null;
  if (!sharedCtx) {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    sharedCtx = new AC();
  }
  return sharedCtx;
}

// Each effect is a tiny sequence of (frequency, duration, delay) tones.
const PRESETS = {
  correct: [{ freq: 880, dur: 0.09, delay: 0 }, { freq: 1175, dur: 0.13, delay: 0.09 }],
  wrong: [{ freq: 220, dur: 0.16, delay: 0, type: 'sawtooth' }],
  click: [{ freq: 600, dur: 0.04, delay: 0 }],
  success: [
    { freq: 523, dur: 0.1, delay: 0 },
    { freq: 659, dur: 0.1, delay: 0.1 },
    { freq: 784, dur: 0.16, delay: 0.2 },
  ],
  levelUp: [
    { freq: 659, dur: 0.09, delay: 0 },
    { freq: 784, dur: 0.09, delay: 0.09 },
    { freq: 988, dur: 0.09, delay: 0.18 },
    { freq: 1319, dur: 0.2, delay: 0.27 },
  ],
  tick: [{ freq: 440, dur: 0.03, delay: 0 }],
};

function playTone(ctx, { freq, dur, delay = 0, type = 'sine' }, volume) {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = type;
  osc.frequency.value = freq;
  gain.gain.setValueAtTime(0, ctx.currentTime + delay);
  gain.gain.linearRampToValueAtTime(volume, ctx.currentTime + delay + 0.01);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + delay + dur);
  osc.connect(gain).connect(ctx.destination);
  osc.start(ctx.currentTime + delay);
  osc.stop(ctx.currentTime + delay + dur + 0.02);
}

export function useSound() {
  const { settings } = useProgress();
  const unlocked = useRef(false);

  const play = useCallback(
    (type) => {
      if (!settings.sound) return;
      const ctx = getAudioCtx();
      if (!ctx) return;
      if (ctx.state === 'suspended') ctx.resume();
      unlocked.current = true;

      const seq = PRESETS[type];
      if (!seq) return;
      seq.forEach((tone) => playTone(ctx, tone, 0.12));
    },
    [settings.sound]
  );

  return { play };
}
