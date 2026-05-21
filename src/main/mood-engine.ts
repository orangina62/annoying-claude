import {
  BORED_AFTER_IDLE_MS,
  MOOD_DRIFT_MAX_MS,
  MOOD_DRIFT_MIN_MS,
  MOOD_DRIFT_PROB,
  MOOD_NEIGHBORS,
  type Mood,
} from '@shared/mood';

export interface MoodEngineDeps {
  /** Called after every mood change (e.g. to refresh the tray menu). */
  onChange?: (next: Mood, previous: Mood) => void;
}

/**
 * Tracks Claude's current mood. Two transition sources:
 *   1. Time-based drift toward a neighbor mood every 45–90 s.
 *   2. Event-based pushes (clicked → angry, idle → bored, etc.).
 *
 * The scheduler reads `getCurrent()` each time it picks a mischief; mood
 * weights are applied as a multiplier on top of the existing weight system.
 */
export class MoodEngine {
  private current: Mood = 'happy';
  private driftTimer: NodeJS.Timeout | null = null;
  private lastMischiefAt = Date.now();
  private idleCheckTimer: NodeJS.Timeout | null = null;

  constructor(private deps: MoodEngineDeps = {}) {}

  start(): void {
    this.scheduleNextDrift();
    this.scheduleIdleCheck();
  }

  stop(): void {
    if (this.driftTimer) clearTimeout(this.driftTimer);
    if (this.idleCheckTimer) clearInterval(this.idleCheckTimer);
    this.driftTimer = null;
    this.idleCheckTimer = null;
  }

  getCurrent(): Mood {
    return this.current;
  }

  set(next: Mood): void {
    if (next === this.current) return;
    const prev = this.current;
    this.current = next;
    this.deps.onChange?.(next, prev);
  }

  /** Called by the scheduler each time a mischief fires. */
  noteMischiefFired(): void {
    this.lastMischiefAt = Date.now();
  }

  // ── Event-based transitions ────────────────────────────────────────────

  onClickBurst(): void {
    this.set('angry');
  }

  onBattleEnd(): void {
    // Battles are exhausting. Sit in `tired` for a short while, then drift.
    this.set('tired');
  }

  onSleepDone(): void {
    this.set('happy');
  }

  onInsightOrTodo(): void {
    // A small nudge toward curiosity — not a hard switch.
    if (this.current === 'happy' || this.current === 'bored') {
      this.set('curious');
    }
  }

  // ── Internal: drift + idle ─────────────────────────────────────────────

  private scheduleNextDrift(): void {
    const gap =
      MOOD_DRIFT_MIN_MS + Math.random() * (MOOD_DRIFT_MAX_MS - MOOD_DRIFT_MIN_MS);
    this.driftTimer = setTimeout(() => {
      this.maybeDrift();
      this.scheduleNextDrift();
    }, gap);
  }

  private maybeDrift(): void {
    if (Math.random() > MOOD_DRIFT_PROB) return;
    const neighbors = MOOD_NEIGHBORS[this.current];
    if (!neighbors.length) return;
    const next = neighbors[Math.floor(Math.random() * neighbors.length)]!;
    this.set(next);
  }

  private scheduleIdleCheck(): void {
    // Every 15 s: if nothing has happened recently, switch to bored.
    this.idleCheckTimer = setInterval(() => {
      const idleMs = Date.now() - this.lastMischiefAt;
      if (idleMs >= BORED_AFTER_IDLE_MS && this.current !== 'bored' && this.current !== 'tired') {
        this.set('bored');
      }
    }, 15_000);
  }
}
