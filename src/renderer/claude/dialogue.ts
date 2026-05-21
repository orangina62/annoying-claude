// Pixelated RPG-style speech bubble drawn directly on the Claude canvas so it
// follows the mascot's position naturally. Replaces the old `fake-thinking`
// and `fake-insight` popup windows.
//
// Layout:
//   ┌──────────────────────────┐
//   │ Lorem ipsum dolor sit    │   ← cream stroke on dark fill
//   │ amet, consectetur.       │
//   └────────────▼─────────────┘
//                ↓ anchored above Claude's head
//
// Each show() request goes through a small FIFO queue so we don't double-up.

import type { DialogueKind } from '@shared/types';

const FONT_SIZE = 11;
const LINE_HEIGHT = 14;
const CHARS_PER_LINE = 32;
const MAX_LINES = 3;
const PADDING_X = 12;
const PADDING_Y = 10;
const TAIL_HEIGHT = 8;
const TAIL_WIDTH = 12;
const BORDER = 3;
const TYPE_MS_PER_CHAR = 32;
const FADE_MS = 280;

const COLOR_BG = '#1a1410';
const COLOR_BORDER = '#f4e8dc';
const COLOR_TEXT = '#f4e8dc';
const COLOR_THINK = '#d96e3a';

interface Request {
  text: string;
  kind: DialogueKind;
  holdMs: number;
}

interface Active {
  text: string;
  kind: DialogueKind;
  lines: string[];
  startedAt: number;
  /** Total chars revealed by the typewriter. */
  revealed: number;
  /** Phase: 'type' (typing) → 'hold' → 'fade'. */
  phase: 'type' | 'hold' | 'fade';
  /** Reference time (performance.now) at which the current phase started. */
  phaseStartedAt: number;
  holdMs: number;
}

export interface DialogueAnchor {
  /** Center-top of the mascot in canvas pixels. */
  cx: number;
  /** Top of the mascot. */
  y: number;
  /** Width of the mascot for left/right edge avoidance. */
  spriteSize: number;
  /** Total canvas size (for clamping). */
  canvasW: number;
  canvasH: number;
}

export class DialogueBox {
  private queue: Request[] = [];
  private active: Active | null = null;

  show(req: Request): void {
    this.queue.push(req);
    if (!this.active) this.advance();
  }

  /** Cancel anything currently showing — useful when Claude enters battle. */
  cancel(): void {
    this.queue.length = 0;
    if (this.active && this.active.phase !== 'fade') {
      this.active.phase = 'fade';
      this.active.phaseStartedAt = performance.now();
    }
  }

  private advance(): void {
    const next = this.queue.shift();
    if (!next) {
      this.active = null;
      return;
    }
    const lines = wrap(next.text, CHARS_PER_LINE).slice(0, MAX_LINES);
    if (lines.length === MAX_LINES) {
      // Ellipsize the last line if it overflowed.
      const last = lines[MAX_LINES - 1]!;
      if (last.length > CHARS_PER_LINE - 1) {
        lines[MAX_LINES - 1] = last.slice(0, CHARS_PER_LINE - 1) + '…';
      }
    }
    const now = performance.now();
    this.active = {
      text: lines.join('\n'),
      kind: next.kind,
      lines,
      startedAt: now,
      revealed: 0,
      phase: 'type',
      phaseStartedAt: now,
      holdMs: next.holdMs,
    };
  }

  update(_dtMs: number): void {
    if (!this.active) return;
    const now = performance.now();
    const a = this.active;

    if (a.phase === 'type') {
      const totalChars = a.text.length;
      const elapsed = now - a.phaseStartedAt;
      a.revealed = Math.min(totalChars, Math.floor(elapsed / TYPE_MS_PER_CHAR));
      if (a.revealed >= totalChars) {
        a.phase = 'hold';
        a.phaseStartedAt = now;
      }
    } else if (a.phase === 'hold') {
      if (now - a.phaseStartedAt >= a.holdMs) {
        a.phase = 'fade';
        a.phaseStartedAt = now;
      }
    } else if (a.phase === 'fade') {
      if (now - a.phaseStartedAt >= FADE_MS) {
        this.advance();
      }
    }
  }

  draw(g: CanvasRenderingContext2D, anchor: DialogueAnchor): void {
    if (!this.active) return;
    const a = this.active;

    const bubbleW = CHARS_PER_LINE * (FONT_SIZE * 0.6) + PADDING_X * 2;
    const bubbleH = a.lines.length * LINE_HEIGHT + PADDING_Y * 2;

    // Position above Claude, centered. Clamp inside the canvas.
    let bx = Math.round(anchor.cx - bubbleW / 2);
    let by = Math.round(anchor.y - bubbleH - TAIL_HEIGHT - 6);
    let tailOnTop = false;

    if (by < 8) {
      // No room above — flip below the mascot.
      by = Math.round(anchor.y + anchor.spriteSize + TAIL_HEIGHT + 6);
      tailOnTop = true;
    }
    bx = Math.max(8, Math.min(anchor.canvasW - bubbleW - 8, bx));

    // Opacity envelope: fade-in over first 80 ms, full during hold/type,
    // fade-out during 'fade' phase.
    let alpha = 1;
    if (a.phase === 'type') {
      const elapsed = performance.now() - a.phaseStartedAt;
      alpha = Math.min(1, elapsed / 120);
    } else if (a.phase === 'fade') {
      const elapsed = performance.now() - a.phaseStartedAt;
      alpha = Math.max(0, 1 - elapsed / FADE_MS);
    }

    g.save();
    g.globalAlpha = alpha;

    // Pixel bubble — sharp filled rect + border. No anti-aliasing.
    g.imageSmoothingEnabled = false;
    // Outer border (cream).
    g.fillStyle = COLOR_BORDER;
    g.fillRect(bx - BORDER, by - BORDER, bubbleW + BORDER * 2, bubbleH + BORDER * 2);
    // Inner fill (dark).
    g.fillStyle = COLOR_BG;
    g.fillRect(bx, by, bubbleW, bubbleH);

    // Tail — a small triangle of 3 stacked rects (pixelated).
    drawTail(g, {
      bx,
      by,
      bubbleW,
      bubbleH,
      anchorCx: anchor.cx,
      onTop: tailOnTop,
    });

    // Text (revealed portion only).
    g.fillStyle = a.kind === 'think' ? COLOR_THINK : COLOR_TEXT;
    g.font = `${FONT_SIZE}px "Cascadia Mono", "Consolas", monospace`;
    g.textBaseline = 'top';
    let remaining = a.revealed;
    for (let i = 0; i < a.lines.length; i++) {
      if (remaining <= 0) break;
      const full = a.lines[i]!;
      const take = full.slice(0, remaining);
      g.fillText(take, bx + PADDING_X, by + PADDING_Y + i * LINE_HEIGHT);
      remaining -= full.length + 1; // +1 for the implicit newline
    }

    g.restore();
  }
}

function drawTail(
  g: CanvasRenderingContext2D,
  opts: {
    bx: number;
    by: number;
    bubbleW: number;
    bubbleH: number;
    anchorCx: number;
    onTop: boolean;
  },
): void {
  // Position the tail x roughly under the anchor, clamped to bubble interior.
  const tailCenterX = Math.max(
    opts.bx + 14,
    Math.min(opts.bx + opts.bubbleW - 14, opts.anchorCx),
  );
  const half = TAIL_WIDTH / 2;
  const baseY = opts.onTop ? opts.by - BORDER : opts.by + opts.bubbleH;

  // 3 layers, pixel-art chunky triangle (cream border behind, dark fill in front).
  g.fillStyle = COLOR_BORDER;
  const dir = opts.onTop ? -1 : 1;
  for (let row = 0; row < TAIL_HEIGHT + BORDER; row++) {
    const inset = Math.floor((half * row) / (TAIL_HEIGHT + BORDER));
    const w = TAIL_WIDTH + BORDER * 2 - inset * 2;
    g.fillRect(tailCenterX - w / 2, baseY + dir * row, w, 1);
  }
  g.fillStyle = COLOR_BG;
  for (let row = 0; row < TAIL_HEIGHT; row++) {
    const inset = Math.floor((half * row) / TAIL_HEIGHT);
    const w = TAIL_WIDTH - inset * 2;
    if (w <= 0) break;
    g.fillRect(tailCenterX - w / 2, baseY + dir * row, w, 1);
  }
}

function wrap(text: string, maxChars: number): string[] {
  // Hard newlines respected; otherwise greedy word-wrap.
  const out: string[] = [];
  for (const para of text.split('\n')) {
    const words = para.split(/\s+/).filter(Boolean);
    let line = '';
    for (const w of words) {
      const candidate = line ? `${line} ${w}` : w;
      if (candidate.length <= maxChars) {
        line = candidate;
      } else {
        if (line) out.push(line);
        // Long single word — hard-cut.
        if (w.length > maxChars) {
          for (let i = 0; i < w.length; i += maxChars) {
            out.push(w.slice(i, i + maxChars));
          }
          line = '';
        } else {
          line = w;
        }
      }
    }
    if (line) out.push(line);
  }
  return out;
}
