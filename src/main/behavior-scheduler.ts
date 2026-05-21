import type { BrowserWindow } from 'electron';
import type { Intensity } from '@shared/types';
import { INTENSITY } from '@shared/intensity';
import { MAX_BURST_PER_MINUTE, MIN_ACTION_GAP_MS, type Mood } from '@shared/mood';
import type { MoodEngine } from './mood-engine';
import { type Mischief, type MischiefContext, makeContext } from './mischief';
import { battle } from './mischief/battle';
import { dropFile } from './mischief/drop-file';
import { fakeClaudeMd } from './mischief/fake-claude-md';
import { fakeInsight } from './mischief/fake-insight';
import { fakeTabDrag } from './mischief/fake-tab-drag';
import { fakeThinking } from './mischief/fake-thinking';
import { fakeTodo } from './mischief/fake-todo';
import { gooseDuel } from './mischief/goose-duel';
import { openTab } from './mischief/open-tab';
import { sherlock } from './mischief/sherlock';
import { stealCursorTarget } from './mischief/steal-cursor-target';
import { stickyNote } from './mischief/sticky-note';
import { wander } from './mischief/wander';

const ALL_MISCHIEF: Mischief[] = [
  wander,
  fakeInsight,
  fakeThinking,
  stickyNote,
  fakeClaudeMd,
  fakeTodo,
  battle,
  openTab,
  dropFile,
  fakeTabDrag,
  stealCursorTarget,
  gooseDuel,
  sherlock,
];

export class BehaviorScheduler {
  private timer: NodeJS.Timeout | null = null;
  private paused = false;
  private intensity: Intensity = 'normal';
  private cooldownExpiresAt = new Map<string, number>();
  private ctx: MischiefContext;
  /** Idle wander loop — fires regardless of mischief rolls so Claude never stops moving. */
  private wanderTimer: NodeJS.Timeout | null = null;
  /** Timestamps (ms) of recent non-wander mischief fires, for burst control. */
  private recentFires: number[] = [];

  constructor(
    claudeWindow: BrowserWindow,
    screen: { width: number; height: number },
    private mood: MoodEngine,
  ) {
    this.ctx = makeContext(claudeWindow, screen, () => this.mood.getCurrent());
  }

  start(): void {
    this.scheduleNextTick();
    this.scheduleNextWander();
  }

  stop(): void {
    if (this.timer) clearTimeout(this.timer);
    if (this.wanderTimer) clearTimeout(this.wanderTimer);
    this.timer = null;
    this.wanderTimer = null;
  }

  isPaused(): boolean {
    return this.paused;
  }

  togglePause(): void {
    this.paused = !this.paused;
  }

  setIntensity(intensity: Intensity): void {
    this.intensity = intensity;
  }

  getIntensity(): Intensity {
    return this.intensity;
  }

  listMischief(): Array<{ id: string; label: string }> {
    return ALL_MISCHIEF.map(({ id, label }) => ({ id, label }));
  }

  forceMischief(id: string): void {
    const m = ALL_MISCHIEF.find((x) => x.id === id);
    if (!m) return;
    void this.fire(m);
  }

  updateScreen(size: { width: number; height: number }): void {
    this.ctx.screen = size;
  }

  private scheduleNextTick(): void {
    const cfg = INTENSITY[this.intensity];
    this.timer = setTimeout(() => {
      this.tick();
      this.scheduleNextTick();
    }, cfg.tickMs);
  }

  private scheduleNextWander(): void {
    // Wander every 6–14 s so the mascot feels alive even without other mischief.
    const next = 6000 + Math.random() * 8000;
    this.wanderTimer = setTimeout(() => {
      if (!this.paused) void this.fire(wander);
      this.scheduleNextWander();
    }, next);
  }

  private tick(): void {
    if (this.paused) return;
    const cfg = INTENSITY[this.intensity];
    if (Math.random() > cfg.tickFireChance) return;
    if (!this.canFireNow()) return;

    const candidate = this.pickMischief();
    if (!candidate) return;
    void this.fire(candidate);
  }

  /** Anti-spam guard: enforce min gap + burst cap on non-wander mischiefs. */
  private canFireNow(): boolean {
    const now = Date.now();
    // Min gap since the last non-wander fire.
    const last = this.recentFires[this.recentFires.length - 1];
    if (last && now - last < MIN_ACTION_GAP_MS) return false;
    // Burst cap over the last minute.
    const oneMinAgo = now - 60_000;
    this.recentFires = this.recentFires.filter((t) => t >= oneMinAgo);
    if (this.recentFires.length >= MAX_BURST_PER_MINUTE) return false;
    return true;
  }

  private pickMischief(): Mischief | null {
    const cfg = INTENSITY[this.intensity];
    const now = Date.now();
    const mood: Mood = this.mood.getCurrent();

    const eligible = ALL_MISCHIEF.filter((m) => {
      if (m.id === 'wander') return false; // wander runs on its own timer
      if (!cfg.allowedTiers.includes(m.tier)) return false;
      const cd = this.cooldownExpiresAt.get(m.id) ?? 0;
      if (cd > now) return false;
      // Mood multiplier of 0 disables the mischief in this mood.
      const moodMul = m.moodWeights?.[mood];
      if (moodMul === 0) return false;
      return true;
    });
    if (!eligible.length) return null;

    const tierWeighted = eligible.map((m) => {
      const moodMul = m.moodWeights?.[mood] ?? 1;
      return { m, score: m.weight * cfg.tierWeights[m.tier] * moodMul };
    });
    const total = tierWeighted.reduce((s, x) => s + x.score, 0);
    if (total <= 0) return null;
    let roll = Math.random() * total;
    for (const entry of tierWeighted) {
      roll -= entry.score;
      if (roll <= 0) return entry.m;
    }
    return tierWeighted[tierWeighted.length - 1]?.m ?? null;
  }

  private async fire(m: Mischief): Promise<void> {
    if (m.id !== 'wander') {
      this.recentFires.push(Date.now());
      this.mood.noteMischiefFired();
    }
    try {
      await m.run(this.ctx);
    } catch (err) {
      console.error(`[mischief:${m.id}] failed`, err);
    }
    if (m.cooldownMs > 0) {
      this.cooldownExpiresAt.set(m.id, Date.now() + m.cooldownMs);
    }
  }
}
