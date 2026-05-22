import type { CharacterState, Direction } from '@shared/types';

const PALETTE = {
  body: '#e0876a',
  bodyDark: '#b15a3a',
  outline: '#111111',
  eye: '#111111',
  eyeWhite: '#ffffff',
  helmetLight: '#c8c8c8',
  helmetDark: '#6a6a6a',
  swordBlade: '#f0f0f0',
  swordEdge: '#a0a0a0',
  swordGrip: '#3a1f0e',
  capBrown: '#7c5a3a',
  capShadow: '#4a2f14',
  glassFrame: '#777777',
  glassInterior: '#c0d8e0',
};

type Frame = ReadonlyArray<string>;

const IDLE_BASE: Frame = [
  '................',
  '....oooooooo....',
  '...obbbbbbbbo...',
  '..obbbbbbbbbbo..',
  '.obbbbbbbbbbbbo.',
  '.obbbbbbbbbbbbo.',
  'obbWWWWbbWWWWbbo',
  'obbWEEWbbWEEWbbo',
  'obbWEEWbbWEEWbbo',
  '.obWWWWbbWWWWbo.',
  '.obbbbbbbbbbbbo.',
  '..obbbbbbbbbbo..',
  '...obbbbbbbbo...',
  '....oooooooo....',
  '....obo..obo....',
  '....ooo..ooo....',
];

const IDLE_BLINK: Frame = [
  '................',
  '....oooooooo....',
  '...obbbbbbbbo...',
  '..obbbbbbbbbbo..',
  '.obbbbbbbbbbbbo.',
  '.obbbbbbbbbbbbo.',
  'obbbbbbbbbbbbbbo',
  'obbbbbbbbbbbbbbo',
  'obboooobboooobbo',
  '.obbbbbbbbbbbbo.',
  '.obbbbbbbbbbbbo.',
  '..obbbbbbbbbbo..',
  '...obbbbbbbbo...',
  '....oooooooo....',
  '....obo..obo....',
  '....ooo..ooo....',
];

const WALK_R_1: Frame = [
  '................',
  '....oooooooo....',
  '...obbbbbbbbo...',
  '..obbbbbbbbbbo..',
  '.obbbbbbbbbbbbo.',
  '.obbbbbbbbbbbbo.',
  'obbWWWWbbWWWWbbo',
  'obbWEEWbbWEEWbbo',
  'obbWEEWbbWEEWbbo',
  '.obWWWWbbWWWWbo.',
  '.obbbbbbbbbbbbo.',
  '..obbbbbbbbbbo..',
  '...obbbbbbbbo...',
  '....oooooooo....',
  '....obo..obo....',
  '....ooo..ooo....',
];

const WALK_R_2: Frame = [
  '................',
  '................',
  '....oooooooo....',
  '...obbbbbbbbo...',
  '..obbbbbbbbbbo..',
  '.obbbbbbbbbbbbo.',
  '.obbbbbbbbbbbbo.',
  'obbWWWWbbWWWWbbo',
  'obbWEEWbbWEEWbbo',
  'obbWEEWbbWEEWbbo',
  '.obWWWWbbWWWWbo.',
  '.obbbbbbbbbbbbo.',
  '..obbbbbbbbbbo..',
  '...obbbbbbbbo...',
  '....oooooooo....',
  '....ooo..ooo....',
];

const TALK_OPEN: Frame = [
  '................',
  '....oooooooo....',
  '...obbbbbbbbo...',
  '..obbbbbbbbbbo..',
  '.obbbbbbbbbbbbo.',
  '.obbbbbbbbbbbbo.',
  'obbWWWWbbWWWWbbo',
  'obbWEEWbbWEEWbbo',
  'obbWEEWbbWEEWbbo',
  '.obWWWWbbWWWWbo.',
  '.obbbbboobbbbbo.',
  '..obbbboobbbbo..',
  '...obbbbbbbbo...',
  '....oooooooo....',
  '....obo..obo....',
  '....ooo..ooo....',
];

const SURPRISE: Frame = [
  '................',
  '....oooooooo....',
  '...obbbbbbbbo...',
  '..obbbbbbbbbbo..',
  '.obbbbbbbbbbbbo.',
  '.obWWWWbbWWWWbo.',
  'obbWWWWbbWWWWbbo',
  'obbWEWWbbWWEWbbo',
  'obbWWWWbbWWWWbbo',
  '.obWWWWbbWWWWbo.',
  '.obbbbbbbbbbbbo.',
  '..obbbboobbbbo..',
  '...obbbbbbbbo...',
  '....oooooooo....',
  '....obo..obo....',
  '....ooo..ooo....',
];

const EVIL: Frame = [
  '................',
  '....oooooooo....',
  '...obbbbbbbbo...',
  '..obbbbbbbbbbo..',
  '.obbbbbbbbbbbbo.',
  '.obbbbbbbbbbbbo.',
  'obboooobboooobbo',
  'obbWEEWbbWEEWbbo',
  'obbWEEWbbWEEWbbo',
  '.obbbbbbbbbbbbo.',
  '.obbbbbbbbbbbbo.',
  '..obbbbbbbbbbo..',
  '...obbbbbbbbo...',
  '....oooooooo....',
  '....obo..obo....',
  '....ooo..ooo....',
];

const SLEEP: Frame = [
  '.............z..',
  '...........z....',
  '.........z......',
  '....oooooooo....',
  '...obbbbbbbbo...',
  '..obbbbbbbbbbo..',
  '.obbbbbbbbbbbbo.',
  '.obbbbbbbbbbbbo.',
  'obbbbbbbbbbbbbbo',
  'obbbbbbbbbbbbbbo',
  'obboooobboooobbo',
  '.obbbbbbbbbbbbo.',
  '.obbbbbbbbbbbbo.',
  '..obbbbbbbbbbo..',
  '...obbbbbbbbo...',
  '....oooooooo....',
];

const BATTLE_IDLE: Frame = [
  '..............S.',
  '....oooooooo..S.',
  '...oHHHHHHHHo.S.',
  '..oHHHHHHHHHHos.',
  '.oHHHHHHHHHHHHG.',
  '.ohhhhhhhhhhhhG.',
  'obbWWWWbbWWWWbbo',
  'obbWEEWbbWEEWbbo',
  'obbWEEWbbWEEWbbo',
  '.obWWWWbbWWWWbo.',
  '.obbbbbbbbbbbbo.',
  '..obbbbbbbbbbo..',
  '...obbbbbbbbo...',
  '....oooooooo....',
  '....obo..obo....',
  '....ooo..ooo....',
];

const BATTLE_SWING: Frame = [
  '................',
  '....oooooooo....',
  '...oHHHHHHHHo...',
  '..oHHHHHHHHHHo..',
  '.oHHHHHHHHHHHHo.',
  '.ohhhhhhhhhhhho.',
  'obbWWWWbbWWWWbbo',
  'obbWEEWbbWEEWbbo',
  'obbWEEWbbWEEWbbo',
  '.obWWWWbbWWWWbo.',
  '.obbbbbbbbbbGSSs',
  '..obbbbbbbbGSs..',
  '...obbbbbbbbo...',
  '....oooooooo....',
  '....obo..obo....',
  '....ooo..ooo....',
];

const DRAG_1: Frame = [
  '................',
  '....oooooooo....',
  '...obbbbbbbbo...',
  '..obbbbbbbbbbo..',
  '.obbbbbbbbbbbbo.',
  '.obbbbbbbbbbbbo.',
  'obbWWWWbbWWWWbbo',
  'obbWEEWbbWEEWbbo',
  'obbWEEWbbWEEWbbo',
  '.obWWWWbbWWWWbo.',
  '.obbbbbbbbbbbbo.',
  '..obbbbbbbbbbo..',
  '...obbbbbbbbo...',
  '....oooooooo....',
  '....oooooooo....',
  '....oBBBBBBo....',
];

const DRAG_2: Frame = [
  '....oooooooo....',
  '...obbbbbbbbo...',
  '..obbbbbbbbbbo..',
  '.obbbbbbbbbbbbo.',
  '.obbbbbbbbbbbbo.',
  'obbWWWWbbWWWWbbo',
  'obbWEEWbbWEEWbbo',
  'obbWEEWbbWEEWbbo',
  '.obWWWWbbWWWWbo.',
  '.obbbbbbbbbbbbo.',
  '..obbbbbbbbbbo..',
  '...obbbbbbbbo...',
  '....oooooooo....',
  '....oooooooo....',
  '....oBBBBBBo....',
  '................',
];

const SHERLOCK_IDLE: Frame = [
  '....oCCCCCCo....',
  '...oCCCCCCCCo...',
  '..oCCDCCCCDCCo..',
  '..oCCCCCCCCCCo..',
  '.obbbbbbbbbbbbo.',
  '.obbbbbbbbbbbbo.',
  'obbWWWWbbWWWWbbo',
  'obbWEEWbbWEEWbbo',
  'obbWEEWbbWEEWbbo',
  '.obWWWWbbWWWWbo.',
  '.obbbbbbbbbbMMM.',
  '..obbbbbbbbbMNM.',
  '...obbbbbbbbMMM.',
  '....oooooooo....',
  '....obo..obo....',
  '....ooo..ooo....',
];

const SHERLOCK_BLINK: Frame = [
  '....oCCCCCCo....',
  '...oCCCCCCCCo...',
  '..oCCDCCCCDCCo..',
  '..oCCCCCCCCCCo..',
  '.obbbbbbbbbbbbo.',
  '.obbbbbbbbbbbbo.',
  'obbbbbbbbbbbbbbo',
  'obbbbbbbbbbbbbbo',
  'obboooobboooobbo',
  '.obbbbbbbbbbbbo.',
  '.obbbbbbbbbbMMM.',
  '..obbbbbbbbbMNM.',
  '...obbbbbbbbMMM.',
  '....oooooooo....',
  '....obo..obo....',
  '....ooo..ooo....',
];

const PIXEL_MAP: Record<string, string> = {
  o: PALETTE.outline,
  b: PALETTE.body,
  B: PALETTE.bodyDark,
  h: PALETTE.helmetDark,
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
  blinking?: boolean;
}

export const ANIMATIONS: Record<CharacterState, SpriteAnimation> = {
  idle: { frames: [IDLE_BASE, IDLE_BASE, IDLE_BASE, IDLE_BLINK], fps: 4 },
  walking: { frames: [WALK_R_1, WALK_R_2], fps: 12 },
  dragging: { frames: [DRAG_1, DRAG_2], fps: 6 },
  talking: { frames: [IDLE_BASE, TALK_OPEN, IDLE_BASE, TALK_OPEN, IDLE_BLINK], fps: 8 },
  sleeping: { frames: [SLEEP], fps: 1 },
  surprise: { frames: [SURPRISE, IDLE_BASE], fps: 4 },
  evil: { frames: [EVIL], fps: 1 },
  battling: { frames: [BATTLE_IDLE, BATTLE_SWING], fps: 7 },
  sherlock: { frames: [SHERLOCK_IDLE, SHERLOCK_IDLE, SHERLOCK_IDLE, SHERLOCK_BLINK], fps: 4 },
};

const PIXEL_SIZE = 4;
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
