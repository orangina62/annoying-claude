export type Mood = 'happy' | 'curious' | 'mischievous' | 'angry' | 'bored' | 'tired';

export const MOODS: ReadonlyArray<Mood> = [
  'happy',
  'curious',
  'mischievous',
  'angry',
  'bored',
  'tired',
];

/** Display labels (used in the tray menu and welcome screen). */
export const MOOD_LABEL: Record<Mood, string> = {
  happy: '🙂 Happy',
  curious: '🧐 Curious',
  mischievous: '😈 Mischievous',
  angry: '😡 Angry',
  bored: '🥱 Bored',
  tired: '😴 Tired',
};

/**
 * Mood graph — neighbors for time-based drift. Each mood drifts toward one
 * of its neighbors when the engine ticks (~30 % chance per tick).
 *
 *               ┌─ happy ─┐
 *       bored ──┤         ├── curious
 *       ↓       └─ tired ─┘    ↓
 *  mischievous ←──────────→ angry
 */
export const MOOD_NEIGHBORS: Record<Mood, ReadonlyArray<Mood>> = {
  happy: ['curious', 'bored', 'tired'],
  curious: ['happy', 'angry'],
  mischievous: ['bored', 'angry'],
  angry: ['curious', 'mischievous'],
  bored: ['happy', 'tired', 'mischievous'],
  tired: ['happy', 'bored'],
};

/**
 * Default tick window for time-based drift. The engine picks a random gap
 * inside this range and rolls a transition each gap.
 */
export const MOOD_DRIFT_MIN_MS = 45_000;
export const MOOD_DRIFT_MAX_MS = 90_000;
export const MOOD_DRIFT_PROB = 0.3;

/**
 * Anti-spam knobs applied by the scheduler regardless of mood.
 */
export const MIN_ACTION_GAP_MS = 8_000;
export const MAX_BURST_PER_MINUTE = 5;

/** Idle window after which Claude gets `bored`. */
export const BORED_AFTER_IDLE_MS = 60_000;
