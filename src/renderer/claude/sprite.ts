// Procedural pixel-art sprite for the Claude mascot.
// Phase 1 placeholder — no external PNG required. Drawn entirely from a 16x16
// pixel grid using the canonical Claude Code orange palette. Replace with a real
// sprite sheet in Phase 2.

import type { CharacterState, Direction } from '@shared/types';

// Palette pulled from the reference Claude Code mascot icon.
const PALETTE = {
  body: '#e0876a',         // main coral / claude orange
  bodyDark: '#b15a3a',     // subtle shadow band on belly
  eye: '#0d0d0d',
  outline: '#0d0d0d',      // crisp single-color outline
  highlight: '#e0876a',    // unused but kept for type-compat
  eyeWhite: '#ffffff',     // unused
  helmetLight: '#c8c8c8',  // chrome helmet
  helmetDark: '#6a6a6a',   // helmet shadow / visor strap
  swordBlade: '#f0f0f0',   // bright blade
  swordEdge: '#a0a0a0',    // blade shadow
  swordGrip: '#3a1f0e',    // dark brown grip
  capBrown: '#7c5a3a',     // deerstalker cap main
  capShadow: '#4a2f14',    // cap plaid darker accent
  glassFrame: '#777777',   // magnifying glass metal frame
  glassInterior: '#c0d8e0',// magnifying glass lens
};

// Each frame is a 16x16 grid of palette keys (or '.' for transparent).
type Pixel = '.' | keyof typeof PALETTE;
type Frame = ReadonlyArray<string>;

// Idle — Claude looking at you. Wider-than-tall blob, 2 ears, 4 legs, dark eyes.
const IDLE_BASE: Frame = [
  '................',
  '.oo........oo...',
  '.oo........oo...',
  'oobbbbbbbbbbbboo',
  'obbbbbbbbbbbbbbo',
  'obbEEbbbbbbEEbbo',
  'obbEEbbbbbbEEbbo',
  'obbbbbbbbbbbbbbo',
  'obbbbbbbbbbbbbbo',
  'obbbbbbbbbbbbbbo',
  'obBBBBBBBBBBBBbo',
  'obBBBBBBBBBBBBbo',
  'oobbbbbbbbbbbboo',
  '.oo.oo....oo.oo.',
  '.oo.oo....oo.oo.',
  '................',
];

// Blink — eyes become thin horizontal lines.
const IDLE_BLINK: Frame = [
  '................',
  '.oo........oo...',
  '.oo........oo...',
  'oobbbbbbbbbbbboo',
  'obbbbbbbbbbbbbbo',
  'obbbbbbbbbbbbbbo',
  'obbEEbbbbbbEEbbo',
  'obbbbbbbbbbbbbbo',
  'obbbbbbbbbbbbbbo',
  'obbbbbbbbbbbbbbo',
  'obBBBBBBBBBBBBbo',
  'obBBBBBBBBBBBBbo',
  'oobbbbbbbbbbbboo',
  '.oo.oo....oo.oo.',
  '.oo.oo....oo.oo.',
  '................',
];

// Walk frame A — left pair planted, right pair pulled in (mid-stride).
const WALK_R_1: Frame = [
  '................',
  '.oo........oo...',
  '.oo........oo...',
  'oobbbbbbbbbbbboo',
  'obbbbbbbbbbbbbbo',
  'obbEEbbbbbbEEbbo',
  'obbEEbbbbbbEEbbo',
  'obbbbbbbbbbbbbbo',
  'obbbbbbbbbbbbbbo',
  'obbbbbbbbbbbbbbo',
  'obBBBBBBBBBBBBbo',
  'obBBBBBBBBBBBBbo',
  'oobbbbbbbbbbbboo',
  '.oo.oo.....oo.o.',
  '.o..oo......o...',
  '................',
];

// Walk frame B — mirror stride. Body bobs 1 px lower so legs feel grounded.
const WALK_R_2: Frame = [
  '................',
  '................',
  '.oo........oo...',
  '.oo........oo...',
  'oobbbbbbbbbbbboo',
  'obbbbbbbbbbbbbbo',
  'obbEEbbbbbbEEbbo',
  'obbEEbbbbbbEEbbo',
  'obbbbbbbbbbbbbbo',
  'obbbbbbbbbbbbbbo',
  'obbbbbbbbbbbbbbo',
  'obBBBBBBBBBBBBbo',
  'obBBBBBBBBBBBBbo',
  'oobbbbbbbbbbbboo',
  '.o.oo.....oo.oo.',
  '...o.......oo.o.',
];

const SLEEP: Frame = [
  '.........z......',
  '........z.z.....',
  '.......z.z......',
  '......z.........',
  '................',
  '.oo........oo...',
  '.oo........oo...',
  'oobbbbbbbbbbbboo',
  'obbbbbbbbbbbbbbo',
  'obbBBbbbbbbBBbbo',
  'obbbbbbbbbbbbbbo',
  'obbbbbbbbbbbbbbo',
  'obBBBBBBBBBBBBbo',
  'obBBBBBBBBBBBBbo',
  'oobbbbbbbbbbbboo',
  '.oo.oo....oo.oo.',
];

// Battle: helmet on, sword held horizontal at chest level.
const BATTLE_IDLE: Frame = [
  '................',
  '....HHHHHHHH....',
  '...HHHHHHHHHH...',
  '..HHHHHHHHHHHH..',
  '..HHhhhhhhhhHH..',
  '..HHEEhhhhEEHH..',
  '..HHHHHHHHHHHH..',
  '.obbbbbbbbbbbbo.',
  'obbbbbbbbbbbGSss',
  'obbbbbbbbbbbGSSs',
  'obBBBBBBBBBBBBbo',
  'obBBBBBBBBBBBBbo',
  'oobbbbbbbbbbbboo',
  '.oo.oo....oo.oo.',
  '.oo.oo....oo.oo.',
  '................',
];

// Battle: sword raised high (mid-swing). Blade extends above the helmet.
const BATTLE_SWING: Frame = [
  '..............S.',
  '..............S.',
  '...HHHHHHHH..SS.',
  '..HHHHHHHHHHSS..',
  '..HHHHHHHHHHS...',
  '..HHhhhhhhhhHH..',
  '..HHEEhhhhEEHH..',
  '..HHHHHHHHHHHH..',
  'oobbbbbbbbbbbboo',
  'obbbbbbbbbbbbGGo',
  'obBBBBBBBBBBBBbo',
  'obBBBBBBBBBBBBbo',
  'oobbbbbbbbbbbboo',
  '.oo.oo....oo.oo.',
  '.oo.oo....oo.oo.',
  '................',
];

const SURPRISE: Frame = [
  '................',
  '.oo........oo...',
  '.oo........oo...',
  'oobbbbbbbbbbbboo',
  'obbEEEbbbbEEEbbo',
  'obEEEEbbbbEEEEbo',
  'obEEEEbbbbEEEEbo',
  'obbEEEbbbbEEEbbo',
  'obbbbbbbbbbbbbbo',
  'obbbbbbbbbbbbbbo',
  'obBBBBBBBBBBBBbo',
  'obBBBBBBBBBBBBbo',
  'oobbbbbbbbbbbboo',
  '.oo.oo....oo.oo.',
  '.oo.oo....oo.oo.',
  '................',
];

const PIXEL_MAP: Record<string, string> = {
  o: PALETTE.outline,
  b: PALETTE.body,
  B: PALETTE.bodyDark,
  h: PALETTE.helmetDark,    // re-used: now means "helmet shadow / visor"
  E: PALETTE.eye,
  W: PALETTE.eyeWhite,
  z: PALETTE.eyeWhite,
  H: PALETTE.helmetLight,
  S: PALETTE.swordBlade,
  s: PALETTE.swordEdge,
  G: PALETTE.swordGrip,
  C: PALETTE.capBrown,
  D: PALETTE.capShadow,
  M: PALETTE.glassFrame,
  N: PALETTE.glassInterior,
  '.': '',
};

export interface SpriteAnimation {
  frames: Frame[];
  fps: number;
  /** When true, frame 0 is held except for brief blinks. */
  blinking?: boolean;
}

// Talk — small mouth opening between the eyes.
const TALK_OPEN: Frame = [
  '................',
  '.oo........oo...',
  '.oo........oo...',
  'oobbbbbbbbbbbboo',
  'obbbbbbbbbbbbbbo',
  'obbEEbbbbbbEEbbo',
  'obbEEbbbbbbEEbbo',
  'obbbbbbbbbbbbbbo',
  'obbbbbbEEbbbbbbo',
  'obbbbbEEEEbbbbbo',
  'obBBBBBBBBBBBBbo',
  'obBBBBBBBBBBBBbo',
  'oobbbbbbbbbbbboo',
  '.oo.oo....oo.oo.',
  '.oo.oo....oo.oo.',
  '................',
];

// Drag — Claude carrying a small "blob" tucked under the body.
const DRAG_1: Frame = [
  '................',
  '.oo........oo...',
  '.oo........oo...',
  'oobbbbbbbbbbbboo',
  'obbbbbbbbbbbbbbo',
  'obbEEbbbbbbEEbbo',
  'obbEEbbbbbbEEbbo',
  'obbbbbbbbbbbbbbo',
  'obbbbbbbbbbbbbbo',
  'obbbbbBBBBbbbbbo',
  'obBBBBBBBBBBBBbo',
  'obBBBBBBBBBBBBbo',
  'oobbbbbBBbbbbboo',
  '.oo.ooBBBBoo.oo.',
  '.oo.oo.BB.oo.oo.',
  '................',
];

const DRAG_2: Frame = [
  '................',
  '................',
  '.oo........oo...',
  '.oo........oo...',
  'oobbbbbbbbbbbboo',
  'obbbbbbbbbbbbbbo',
  'obbEEbbbbbbEEbbo',
  'obbEEbbbbbbEEbbo',
  'obbbbbbbbbbbbbbo',
  'obbbbbBBBBbbbbbo',
  'obBBBBBBBBBBBBbo',
  'obBBBBBBBBBBBBbo',
  'oobbbbbBBbbbbboo',
  '.o..oo.BB.oo..o.',
  '....oo.BB.oo....',
  '................',
];

// Sherlock costume — deerstalker cap (rows 0-2), normal body, magnifying glass
// held on the right (rows 7-10). The glass overlays the body band.
const SHERLOCK_IDLE: Frame = [
  '...CCCCCCCCCC...',
  '..CCCCCCCCCCCC..',
  '.CCCDCCCCCCDCCC.',
  'oobbbbbbbbbbbboo',
  'obbbbbbbbbbbbbbo',
  'obbEEbbbbbbEEbbo',
  'obbEEbbbbbbEEbbo',
  'obbbbbbbbbMMMMbb',
  'obbbbbbbbMNNNNMb',
  'obBBBBBBBMNNNNMM',
  'obBBBBBBBBMMMMMM',
  'obBBBBBBBBBBBBbo',
  'oobbbbbbbbbbbboo',
  '.oo.oo....oo.oo.',
  '.oo.oo....oo.oo.',
  '................',
];

const SHERLOCK_BLINK: Frame = [
  '...CCCCCCCCCC...',
  '..CCCCCCCCCCCC..',
  '.CCCDCCCCCCDCCC.',
  'oobbbbbbbbbbbboo',
  'obbbbbbbbbbbbbbo',
  'obbbbbbbbbbbbbbo',
  'obbEEbbbbbbEEbbo',
  'obbbbbbbbbMMMMbb',
  'obbbbbbbbMNNNNMb',
  'obBBBBBBBMNNNNMM',
  'obBBBBBBBBMMMMMM',
  'obBBBBBBBBBBBBbo',
  'oobbbbbbbbbbbboo',
  '.oo.oo....oo.oo.',
  '.oo.oo....oo.oo.',
  '................',
];

export const ANIMATIONS: Record<CharacterState, SpriteAnimation> = {
  idle: { frames: [IDLE_BASE, IDLE_BASE, IDLE_BASE, IDLE_BLINK], fps: 4 },
  walking: { frames: [WALK_R_1, WALK_R_2], fps: 12 },
  dragging: { frames: [DRAG_1, DRAG_2], fps: 6 },
  talking: { frames: [IDLE_BASE, TALK_OPEN, IDLE_BASE, TALK_OPEN, IDLE_BLINK], fps: 8 },
  sleeping: { frames: [SLEEP], fps: 1 },
  surprise: { frames: [SURPRISE, IDLE_BASE], fps: 4 },
  evil: { frames: [IDLE_BASE], fps: 1 },
  battling: { frames: [BATTLE_IDLE, BATTLE_SWING], fps: 7 },
  sherlock: { frames: [SHERLOCK_IDLE, SHERLOCK_IDLE, SHERLOCK_IDLE, SHERLOCK_BLINK], fps: 4 },
};

const PIXEL_SIZE = 4; // 16 * 4 = 64 px sprite
export const SPRITE_SIZE = 16 * PIXEL_SIZE;

function renderFrame(frame: Frame): HTMLCanvasElement {
  const c = document.createElement('canvas');
  c.width = SPRITE_SIZE;
  c.height = SPRITE_SIZE;
  const g = c.getContext('2d')!;
  g.imageSmoothingEnabled = false;

  for (let y = 0; y < 16; y++) {
    const row = frame[y]!;
    for (let x = 0; x < 16; x++) {
      const ch = row[x]!;
      const color = PIXEL_MAP[ch];
      if (!color) continue;
      g.fillStyle = color;
      g.fillRect(x * PIXEL_SIZE, y * PIXEL_SIZE, PIXEL_SIZE, PIXEL_SIZE);
    }
  }
  return c;
}

export class SpriteRenderer {
  private cache = new Map<CharacterState, HTMLCanvasElement[]>();

  constructor() {
    for (const [state, anim] of Object.entries(ANIMATIONS)) {
      this.cache.set(
        state as CharacterState,
        anim.frames.map((f) => renderFrame(f)),
      );
    }
  }

  draw(
    g: CanvasRenderingContext2D,
    state: CharacterState,
    frameIndex: number,
    x: number,
    y: number,
    direction: Direction,
  ): void {
    const frames = this.cache.get(state) ?? this.cache.get('idle')!;
    const frame = frames[frameIndex % frames.length]!;
    g.save();
    if (direction === 'left') {
      g.translate(x + SPRITE_SIZE, y);
      g.scale(-1, 1);
      g.drawImage(frame, 0, 0);
    } else {
      g.drawImage(frame, x, y);
    }
    g.restore();
  }
}

// Re-export so other modules don't need to import sprite internals.
export type { Pixel };
