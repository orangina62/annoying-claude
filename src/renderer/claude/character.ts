import type { CharacterCommand, CharacterState, Direction } from '@shared/types';
import { ANIMATIONS, SPRITE_SIZE, SpriteRenderer } from './sprite';

const BATTLE_SPEED_PX_PER_SEC = 380;
const BATTLE_CLASH_DISTANCE = 40;

export interface SwingTarget {
  getCenter(): { x: number; y: number };
}

export interface CharacterDeps {
  screen: { width: number; height: number };
  onArrived: () => void;
  /**
   * Called when a swing connects. Receives a unit vector from Claude →
   * target (which is either the OS cursor or an in-canvas opponent).
   */
  onBattleSwing?: (dir: { x: number; y: number }, targetIsOpponent: boolean) => void;
  onBattleEnd?: () => void;
  /** Played on each goose contact below the stun threshold. */
  onHit?: () => void;
  /** Played the moment Claude becomes stunned. */
  onStunned?: () => void;
  /**
   * Lookup function for an in-canvas opponent. When this returns a non-null
   * value, the swing target is the opponent's center; otherwise it falls
   * back to the OS cursor position the renderer is tracking.
   */
  getOpponent?: () => SwingTarget | null;
}

export class Character {
  x: number;
  y: number;
  private state: CharacterState = 'idle';
  private direction: Direction = 'right';
  private frameIndex = 0;
  private frameElapsed = 0;
  private sprite = new SpriteRenderer();

  // Move animation
  private moveFrom: { x: number; y: number } | null = null;
  private moveTo: { x: number; y: number } | null = null;
  private moveElapsed = 0;
  private moveDuration = 0;
  private notifiedArrival = true;

  // Battle state
  private battleEndAt = 0;
  private cursor: { x: number; y: number } | null = null;
  private nextSwingAt = 0;
  // Stun state — applied when an opponent (e.g. the goose) lands hits.
  private hitsTaken = 0;
  private stunnedUntil = 0;
  private static readonly HITS_TO_STUN = 3;
  private static readonly STUN_DURATION_MS = 1_800;

  constructor(private deps: CharacterDeps) {
    this.x = Math.floor(deps.screen.width / 2 - SPRITE_SIZE / 2);
    this.y = Math.floor(deps.screen.height / 2 - SPRITE_SIZE / 2);
  }

  getBoundingBox(): { x: number; y: number; w: number; h: number } {
    return { x: Math.round(this.x), y: Math.round(this.y), w: SPRITE_SIZE, h: SPRITE_SIZE };
  }

  /** Anchor point above the mascot's head, used by the dialogue bubble. */
  getDialogueAnchor(): { cx: number; y: number; spriteSize: number } {
    return {
      cx: Math.round(this.x + SPRITE_SIZE / 2),
      y: Math.round(this.y),
      spriteSize: SPRITE_SIZE,
    };
  }

  getState(): CharacterState {
    return this.state;
  }

  updateCursor(x: number, y: number): void {
    this.cursor = { x, y };
  }

  enterBattle(durationMs: number): void {
    this.battleEndAt = performance.now() + durationMs;
    this.nextSwingAt = performance.now() + 350;
    this.hitsTaken = 0;
    this.stunnedUntil = 0;
    // Cancel any in-flight movement.
    this.moveFrom = null;
    this.moveTo = null;
    this.setState('battling');
  }

  isBattling(): boolean {
    return this.state === 'battling';
  }

  isStunned(): boolean {
    return this.stunnedUntil > performance.now();
  }

  /**
   * Called when an opponent (the goose, for now) lands a contact hit. Three
   * hits in a row stun Claude for ~1.8 s. Claude never "dies" — he just
   * stops chasing/swinging until the stun timer expires.
   */
  takeOpponentHit(): void {
    if (this.state !== 'battling') return;
    if (this.isStunned()) return; // i-frames during stun
    this.hitsTaken++;
    if (this.hitsTaken >= Character.HITS_TO_STUN) {
      this.stunnedUntil = performance.now() + Character.STUN_DURATION_MS;
      this.hitsTaken = 0;
      this.deps.onStunned?.();
    } else {
      this.deps.onHit?.();
    }
  }

  updateScreen(size: { width: number; height: number }): void {
    this.deps.screen = size;
  }

  handleCommand(cmd: CharacterCommand): void {
    switch (cmd.type) {
      case 'moveTo':
        // While in battle, ignore stray moveTo's (e.g. the wander timer
        // firing during a duel). Otherwise the queued target would warp
        // Claude away the moment the battle ends.
        if (this.state === 'battling') return;
        if (cmd.x == null || cmd.y == null) return;
        this.startMove(cmd.x, cmd.y, cmd.durationMs ?? 1500);
        break;
      case 'setState':
        // Same guard — don't let an external command yank Claude out of
        // battle mid-fight.
        if (this.state === 'battling' && cmd.state !== 'idle') return;
        if (cmd.state) this.setState(cmd.state);
        break;
      case 'face':
        if (cmd.direction) this.direction = cmd.direction;
        break;
    }
  }

  private setState(state: CharacterState): void {
    if (state === this.state) return;
    this.state = state;
    this.frameIndex = 0;
    this.frameElapsed = 0;
  }

  private startMove(targetX: number, targetY: number, durationMs: number): void {
    this.moveFrom = { x: this.x, y: this.y };
    this.moveTo = { x: targetX, y: targetY };
    this.moveElapsed = 0;
    this.moveDuration = durationMs;
    this.notifiedArrival = false;
    this.direction = targetX < this.x ? 'left' : 'right';
    // Persistent states (dragging, battling, sleeping) keep their animation
    // while moving — only switch to "walking" if we're in a neutral state.
    if (this.state === 'idle' || this.state === 'talking' || this.state === 'surprise') {
      this.setState('walking');
    }
  }

  update(dtMs: number): void {
    // Frame timing
    const anim = ANIMATIONS[this.state];
    const framePeriodMs = 1000 / anim.fps;
    this.frameElapsed += dtMs;
    while (this.frameElapsed >= framePeriodMs) {
      this.frameElapsed -= framePeriodMs;
      this.frameIndex = (this.frameIndex + 1) % anim.frames.length;
    }

    if (this.state === 'battling') {
      this.updateBattle(dtMs);
      this.clampInsideScreen();
      return;
    }

    // Movement
    if (this.moveFrom && this.moveTo) {
      this.moveElapsed += dtMs;
      const t = Math.min(1, this.moveElapsed / this.moveDuration);
      // ease-in-out
      const e = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
      this.x = this.moveFrom.x + (this.moveTo.x - this.moveFrom.x) * e;
      this.y = this.moveFrom.y + (this.moveTo.y - this.moveFrom.y) * e;
      if (t >= 1) {
        this.moveFrom = null;
        this.moveTo = null;
        // Only revert to idle if we were "walking" — preserve dragging/etc.
        if (this.state === 'walking') {
          this.setState('idle');
        }
        if (!this.notifiedArrival) {
          this.notifiedArrival = true;
          this.deps.onArrived();
        }
      }
    }

    this.clampInsideScreen();
  }

  /**
   * Keep Claude fully visible inside the canvas, no matter what piece of
   * code just moved him (battle chase, wander, drag, knockback…). Reads
   * the live `window.innerWidth/innerHeight` so a stale `deps.screen` can
   * never let him drift off.
   */
  private clampInsideScreen(): void {
    const w = typeof window !== 'undefined' ? window.innerWidth : this.deps.screen.width;
    const h = typeof window !== 'undefined' ? window.innerHeight : this.deps.screen.height;
    const maxX = Math.max(0, w - SPRITE_SIZE);
    const maxY = Math.max(0, h - SPRITE_SIZE);
    if (this.x < 0) this.x = 0;
    else if (this.x > maxX) this.x = maxX;
    if (this.y < 0) this.y = 0;
    else if (this.y > maxY) this.y = maxY;
  }

  private updateBattle(dtMs: number): void {
    const now = performance.now();
    if (now >= this.battleEndAt) {
      this.setState('idle');
      this.cursor = null;
      // Drop any stray move command that may have arrived during battle —
      // otherwise Claude would teleport to it on the next frame.
      this.moveFrom = null;
      this.moveTo = null;
      this.notifiedArrival = true;
      this.deps.onBattleEnd?.();
      return;
    }

    // While stunned, Claude stops everything — no chase, no swing.
    if (now < this.stunnedUntil) return;

    // Prefer an in-canvas opponent target over the OS cursor.
    const opponent = this.deps.getOpponent?.() ?? null;
    let target: { x: number; y: number } | null = null;
    if (opponent) {
      target = opponent.getCenter();
    } else if (this.cursor) {
      target = this.cursor;
    }
    if (!target) return;

    // Target the point so the sprite center lands on it.
    const targetX = target.x - SPRITE_SIZE / 2;
    const targetY = target.y - SPRITE_SIZE / 2;

    const dx = targetX - this.x;
    const dy = targetY - this.y;
    const dist = Math.hypot(dx, dy);

    this.direction = dx < 0 ? 'left' : 'right';

    if (dist > BATTLE_CLASH_DISTANCE) {
      const step = (BATTLE_SPEED_PX_PER_SEC * dtMs) / 1000;
      const ratio = Math.min(1, step / dist);
      this.x += dx * ratio;
      this.y += dy * ratio;
    } else if (now >= this.nextSwingAt) {
      // Within striking range — swing on rhythm.
      this.nextSwingAt = now + 220 + Math.random() * 200;
      const claudeCenterX = this.x + SPRITE_SIZE / 2;
      const claudeCenterY = this.y + SPRITE_SIZE / 2;
      const swingDx = target.x - claudeCenterX;
      const swingDy = target.y - claudeCenterY;
      const len = Math.hypot(swingDx, swingDy) || 1;
      this.deps.onBattleSwing?.({ x: swingDx / len, y: swingDy / len }, !!opponent);
    }
  }

  draw(g: CanvasRenderingContext2D): void {
    this.sprite.draw(
      g,
      this.state,
      this.frameIndex,
      Math.round(this.x),
      Math.round(this.y),
      this.direction,
    );
    if (this.isStunned()) this.drawStunStars(g);
  }

  /**
   * Three small white stars rotating in a circle above Claude's head while
   * stunned. Drawn manually with fillRect so the visual stays pixel-art.
   */
  private drawStunStars(g: CanvasRenderingContext2D): void {
    const cx = this.x + SPRITE_SIZE / 2;
    const cy = this.y - 4;
    const radius = 18;
    const t = performance.now() / 220;
    g.save();
    g.imageSmoothingEnabled = false;
    g.fillStyle = '#fff4a1';
    for (let i = 0; i < 3; i++) {
      const angle = t + (i * Math.PI * 2) / 3;
      const sx = Math.round(cx + Math.cos(angle) * radius);
      const sy = Math.round(cy + Math.sin(angle) * radius * 0.5);
      // 4-pixel "+" star
      g.fillRect(sx - 1, sy - 3, 2, 6);
      g.fillRect(sx - 3, sy - 1, 6, 2);
    }
    g.restore();
  }
}
