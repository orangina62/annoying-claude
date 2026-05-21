import type { SoundEffect } from '@shared/types';

let ctx: AudioContext | null = null;

function getCtx(): AudioContext {
  if (!ctx) {
    const Ctor = window.AudioContext ?? (window as any).webkitAudioContext;
    ctx = new Ctor();
  }
  return ctx;
}

interface ToneOptions {
  freq: number;
  duration: number;
  type?: OscillatorType;
  /** Peak gain. 1.0 = full; 0.05 is a quiet UI blip. */
  gain?: number;
  /** Frequency to ramp to over the duration (chirp). */
  freqEnd?: number;
}

function playTone({ freq, duration, type = 'sine', gain = 0.05, freqEnd }: ToneOptions): void {
  const ac = getCtx();
  const t0 = ac.currentTime;
  const osc = ac.createOscillator();
  const env = ac.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t0);
  if (freqEnd != null) {
    osc.frequency.exponentialRampToValueAtTime(Math.max(40, freqEnd), t0 + duration);
  }

  // Quick attack, smooth decay — avoids clicks.
  env.gain.setValueAtTime(0, t0);
  env.gain.linearRampToValueAtTime(gain, t0 + 0.01);
  env.gain.exponentialRampToValueAtTime(0.0001, t0 + duration);

  osc.connect(env).connect(ac.destination);
  osc.start(t0);
  osc.stop(t0 + duration + 0.02);
}

function playSequence(tones: ToneOptions[], gapMs = 60): void {
  let delay = 0;
  for (const tone of tones) {
    setTimeout(() => playTone(tone), delay);
    delay += tone.duration * 1000 + gapMs;
  }
}

const players: Record<SoundEffect, () => void> = {
  ding: () => playTone({ freq: 880, freqEnd: 1320, duration: 0.18, type: 'triangle', gain: 0.08 }),
  thinking: () =>
    playSequence(
      [
        { freq: 440, duration: 0.06, type: 'sine', gain: 0.04 },
        { freq: 660, duration: 0.06, type: 'sine', gain: 0.04 },
        { freq: 880, duration: 0.08, type: 'sine', gain: 0.04 },
      ],
      30,
    ),
  typing: () =>
    playSequence(
      [
        { freq: 1500, duration: 0.02, type: 'square', gain: 0.025 },
        { freq: 1400, duration: 0.02, type: 'square', gain: 0.025 },
        { freq: 1600, duration: 0.02, type: 'square', gain: 0.025 },
      ],
      40,
    ),
  pop: () => playTone({ freq: 660, freqEnd: 220, duration: 0.12, type: 'sine', gain: 0.06 }),
  beep: () => playTone({ freq: 1200, duration: 0.08, type: 'square', gain: 0.04 }),
  honk: () =>
    playSequence(
      [
        { freq: 320, freqEnd: 230, duration: 0.16, type: 'square', gain: 0.07 },
        { freq: 280, freqEnd: 180, duration: 0.18, type: 'square', gain: 0.07 },
      ],
      40,
    ),
};

export function play(effect: SoundEffect): void {
  try {
    const ac = getCtx();
    // Browsers / Electron may suspend the context until user gesture.
    if (ac.state === 'suspended') {
      void ac.resume();
    }
    players[effect]();
  } catch (err) {
    console.error('[audio] failed to play', effect, err);
  }
}
