// AI-driven rival sprite (a goose) that Claude duels when bored. The goose
// actively fights back: it lunges at Claude periodically, and a successful
// contact damages Claude (3 contacts → stun). When KO'd, the goose stays as
// a pixel "corpse" then fades out.

import { GooseSpriteRenderer, GOOSE_SPRITE_SIZE, type GooseState } from './goose-sprite';

const APPROACH_SPEED_PX_PER_SEC = 220;
const RETREAT_SPEED_PX_PER_SEC = 480;
const LUNGE_SPEED_PX_PER_SEC = 460;
const LUNGE_DURATION_MS = 320;
const LUNGE_COOLDOWN_MIN_MS = 1_500;
const LUNGE_COOLDOWN_MAX_MS = 2_600;
const CONTACT_DISTANCE_PX = 38;
const KNOCKED_HOLD_MS = 900;
const CORPSE_FADE_MS = 2_400;
const MAX_HITS_BEFORE_KO = 3;

export type OpponentPhase =
  | 'entering'
  | 'fighting'
  | 'lunging'
  | 'recovering'
  | 'knocked'
  | 'fading'
  | 'leaving'
  | 'gone';

export interface OpponentDeps {
  screen: { width: number; height: number };
  onHonk?: () => void;
  /** Fired the moment the goose connects a lunge on Claude. */
  onContactClaude?: () => void;
  onDefeated?: () => void;
  onGone?: () => void;
}

export class Opponent {
  x: number;
  y: number;
  private direction: 'left' | 'right';
  private vx = 0;
  private vy = 0;
  private hits = 0;
  private phase: OpponentPhase = 'entering';
  private phaseStartedAt = performance.now();
  private state: GooseState = 'walking';
  private frameIndex = 0;
  private frameElapsed = 0;
  private sprite = new GooseSpriteRenderer();
  private nextLungeAt: number;
  private alpha = 1;
  /** Guards against multiple onContactClaude fires per lunge. */
  private hitInThisLunge = false;

  constructor(
    private deps: OpponentDeps,
    entryEdge: 'left' | 'right',
  ) {
    const { width, height } = deps.screen;
    if (entryEdge === 'left') {
      this.x = -GOOSE_SPRITE_SIZE;
      this.direction = 'right';
    } else {
      this.x = width;
      this.direction = 'left';
    }
    this.y = Math.floor(height * 0.55) - GOOSE_SPRITE_SIZE / 2;
    this.nextLungeAt = performance.now() + LUNGE_COOLDOWN_MIN_MS;
  }

  isAlive(): boolean {
    return this.phase !== 'gone';
  }

  /** True once Claude has KO'd the goose — knocked out, fading, or gone. */
  isDefeated(): boolean {
    return this.phase === 'knocked' || this.phase === 'fading' || this.phase === 'gone';
  }

  getBoundingBox(): { x: number; y: number; w: number; h: number } {
    return { x: this.x, y: this.y, w: GOOSE_SPRITE_SIZE, h: GOOSE_SPRITE_SIZE };
  }

  getCenter(): { x: number; y: number } {
    return { x: this.x + GOOSE_SPRITE_SIZE / 2, y: this.y + GOOSE_SPRITE_SIZE / 2 };
  }

  /** Claude's sword landed. Apply knockback + count toward KO. */
  applyHit(dir: { x: number; y: number }, forcePx: number): void {
    if (this.phase === 'knocked' || this.phase === 'fading' || this.phase === 'gone') return;
    this.x += dir.x * forcePx;
    this.y += dir.y * forcePx;
    this.clampInsideScreen();
    this.hits++;
    if (this.hits >= MAX_HITS_BEFORE_KO) {
      this.setPhase('knocked');
      this.state = 'knocked';
      this.frameIndex = 0;
      this.vx = 0;
      this.vy = 0;
      this.deps.onDefeated?.();
    } else {
      // Brief stagger so successive hits feel punchy.
      this.setPhase('recovering');
    }
  }

  /**
   * End the duel: the goose breaks off the fight and flees off-screen,
   * rather than lingering forever once Claude's battle timer expires.
   * A no-op if the goose is already KO'd or on its way out.
   */
  retreat(): void {
    if (
      this.phase === 'knocked' ||
      this.phase === 'fading' ||
      this.phase === 'leaving' ||
      this.phase === 'gone'
    ) {
      return;
    }
    this.setPhase('leaving');
    this.state = 'walking';
    this.frameIndex = 0;
    const w = typeof window !== 'undefined' ? window.innerWidth : this.deps.screen.width;
    const fleeLeft = this.x + GOOSE_SPRITE_SIZE / 2 < w / 2;
    this.direction = fleeLeft ? 'left' : 'right';
    this.vx = (fleeLeft ? -1 : 1) * RETREAT_SPEED_PX_PER_SEC;
    this.vy = 0;
    this.deps.onHonk?.();
  }

  update(dtMs: number, claudeCenter: { x: number; y: number }): void {
    // Frame timing
    const fps = this.sprite.fps(this.state);
    const period = 1000 / fps;
    this.frameElapsed += dtMs;
    while (this.frameElapsed >= period) {
      this.frameElapsed -= period;
      this.frameIndex = (this.frameIndex + 1) % this.sprite.frameCount(this.state);
    }

    const now = performance.now();
    const myCenter = this.getCenter();
    const dx = claudeCenter.x - myCenter.x;
    const dy = claudeCenter.y - myCenter.y;
    const dist = Math.hypot(dx, dy);

    switch (this.phase) {
      case 'entering': {
        this.direction = dx < 0 ? 'left' : 'right';
        this.vx = Math.sign(dx) * APPROACH_SPEED_PX_PER_SEC;
        this.vy = Math.sign(dy) * APPROACH_SPEED_PX_PER_SEC * 0.4;
        if (dist < 140) {
          this.setPhase('fighting');
          this.state = 'walking';
        }
        break;
      }
      case 'fighting': {
        // Hover at "engage range" while waiting for the next lunge.
        this.direction = dx < 0 ? 'left' : 'right';
        const engageDist = 90;
        const speed = APPROACH_SPEED_PX_PER_SEC * 0.7;
        const norm = dist || 1;
        // If too far, close in; if too close, back up a bit.
        const sign = dist > engageDist ? 1 : -0.6;
        this.vx = (dx / norm) * speed * sign;
        this.vy = (dy / norm) * speed * sign * 0.5;
        if (now >= this.nextLungeAt) {
          this.setPhase('lunging');
          this.state = 'honking';
          this.frameIndex = 0;
          this.hitInThisLunge = false;
          this.deps.onHonk?.();
        }
        break;
      }
      case 'lunging': {
        // Charge straight at Claude at high speed.
        this.direction = dx < 0 ? 'left' : 'right';
        const norm = dist || 1;
        this.vx = (dx / norm) * LUNGE_SPEED_PX_PER_SEC;
        this.vy = (dy / norm) * LUNGE_SPEED_PX_PER_SEC;
        // Check contact on every tick.
        if (!this.hitInThisLunge && dist < CONTACT_DISTANCE_PX) {
          this.hitInThisLunge = true;
          this.deps.onContactClaude?.();
        }
        if (now - this.phaseStartedAt >= LUNGE_DURATION_MS) {
          this.setPhase('recovering');
          this.state = 'walking';
          this.frameIndex = 0;
        }
        break;
      }
      case 'recovering': {
        // Retreat away from Claude for ~400 ms, then resume fighting.
        const norm = dist || 1;
        this.vx = -(dx / norm) * APPROACH_SPEED_PX_PER_SEC * 1.1;
        this.vy = -(dy / norm) * APPROACH_SPEED_PX_PER_SEC * 0.5;
        if (now - this.phaseStartedAt >= 420) {
          this.setPhase('fighting');
          this.nextLungeAt =
            now + LUNGE_COOLDOWN_MIN_MS + Math.random() * (LUNGE_COOLDOWN_MAX_MS - LUNGE_COOLDOWN_MIN_MS);
        }
        break;
      }
      case 'knocked': {
        this.vx = 0;
        this.vy = 0;
        if (now - this.phaseStartedAt >= KNOCKED_HOLD_MS) {
          this.setPhase('fading');
        }
        break;
      }
      case 'fading': {
        this.vx = 0;
        this.vy = 0;
        const elapsed = now - this.phaseStartedAt;
        this.alpha = Math.max(0, 1 - elapsed / CORPSE_FADE_MS);
        if (elapsed >= CORPSE_FADE_MS) {
          this.setPhase('gone');
          this.deps.onGone?.();
        }
        break;
      }
      case 'leaving': {
        // Charge straight for the nearest edge; gone once fully off-screen.
        this.x += (this.vx * dtMs) / 1000;
        const w = typeof window !== 'undefined' ? window.innerWidth : this.deps.screen.width;
        if (this.x > w || this.x + GOOSE_SPRITE_SIZE < 0) {
          this.setPhase('gone');
          this.deps.onGone?.();
        }
        return;
      }
      case 'gone':
        return;
    }

    this.x += (this.vx * dtMs) / 1000;
    this.y += (this.vy * dtMs) / 1000;
    this.clampInsideScreen();
  }

  draw(g: CanvasRenderingContext2D): void {
    if (this.phase === 'gone') return;
    g.save();
    if (this.phase === 'fading') g.globalAlpha = this.alpha;
    this.sprite.draw(
      g,
      this.state,
      this.frameIndex,
      Math.round(this.x),
      Math.round(this.y),
      this.direction,
    );
    g.restore();
  }

  private setPhase(p: OpponentPhase): void {
    this.phase = p;
    this.phaseStartedAt = performance.now();
  }

  private clampInsideScreen(): void {
    const w = typeof window !== 'undefined' ? window.innerWidth : this.deps.screen.width;
    const h = typeof window !== 'undefined' ? window.innerHeight : this.deps.screen.height;
    const maxX = Math.max(0, w - GOOSE_SPRITE_SIZE);
    const maxY = Math.max(0, h - GOOSE_SPRITE_SIZE);
    // Guard against a non-finite coordinate: it would pass straight through
    // Math.min/Math.max and strand the goose off-canvas, which in turn feeds
    // a NaN target back into Claude's chase and makes him vanish too.
    this.x = Number.isFinite(this.x) ? Math.max(0, Math.min(maxX, this.x)) : maxX / 2;
    this.y = Number.isFinite(this.y) ? Math.max(0, Math.min(maxY, this.y)) : maxY / 2;
  }
}
