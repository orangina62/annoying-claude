// Pixel-art sprite sheet for the rival goose that Claude fights when bored.
// Same 16×16 grid as the main mascot, but a dedicated palette so the goose
// reads as a separate creature.

const PIXEL_SIZE = 4;
export const GOOSE_SPRITE_SIZE = 16 * PIXEL_SIZE;

const GOOSE_PALETTE: Record<string, string> = {
  W: '#f4f4f0', // body white
  S: '#bcbcb8', // body shadow
  E: '#0d0d0d', // eye
  B: '#f08c20', // beak / legs orange
  '.': '',
};

type Frame = ReadonlyArray<string>;

// Side-profile, facing right by default. Body on left, head/beak on right.
const GOOSE_IDLE: Frame = [
  '................',
  '................',
  '..........WW....',
  '.........WEEW...',
  '.........WWWWB..',
  '.........WWWW...',
  '.....WWWWWWWW...',
  '....WWWWWWWWW...',
  '....WSSSSSSSW...',
  '....WSSSSSSSW...',
  '....WWWWWWWWW...',
  '.....WWWWWWWW...',
  '......BB..BB....',
  '......BB..BB....',
  '.....BB....BB...',
  '................',
];

const GOOSE_WALK_1: Frame = [
  '................',
  '................',
  '..........WW....',
  '.........WEEW...',
  '.........WWWWB..',
  '.........WWWW...',
  '.....WWWWWWWW...',
  '....WWWWWWWWW...',
  '....WSSSSSSSW...',
  '....WSSSSSSSW...',
  '....WWWWWWWWW...',
  '.....WWWWWWWW...',
  '.....BB....BB...',
  '......B....B....',
  '......B....B....',
  '................',
];

const GOOSE_WALK_2: Frame = [
  '................',
  '................',
  '..........WW....',
  '.........WEEW...',
  '.........WWWWB..',
  '.........WWWW...',
  '.....WWWWWWWW...',
  '....WWWWWWWWW...',
  '....WSSSSSSSW...',
  '....WSSSSSSSW...',
  '....WWWWWWWWW...',
  '.....WWWWWWWW...',
  '......BB..BB....',
  '.......B....B...',
  '......B....B....',
  '................',
];

// Honk — beak wide open + body puffed.
const GOOSE_HONK: Frame = [
  '................',
  '................',
  '..........WW....',
  '.........WEEW...',
  '.........WWWBBBB',
  '.........WWWW...',
  '.....WWWWWWWW...',
  '....WWWWWWWWWW..',
  '....WSSSSSSSSW..',
  '....WSSSSSSSSW..',
  '....WWWWWWWWWW..',
  '.....WWWWWWWW...',
  '......BB..BB....',
  '......BB..BB....',
  '.....BB....BB...',
  '................',
];

// Knocked out — on its back, legs up.
const GOOSE_KNOCKED: Frame = [
  '................',
  '................',
  '................',
  '................',
  '................',
  '................',
  '................',
  '..........BB....',
  '........WWWWWW..',
  '........WEEEEW..',
  '........WWWWWW..',
  '........WWWWWW..',
  '.........WWWW...',
  '..........BB....',
  '..........BB....',
  '................',
];

// Wings out, flying off-screen.
const GOOSE_FLY_1: Frame = [
  '...WW......WW...',
  '..WWWW....WWWW..',
  '...WWWWWWWWWW...',
  '....WWWWWWWW....',
  '.....WWWWWWB....',
  '.....WEEEW......',
  '......WWW.......',
  '.......W........',
  '.......B........',
  '................',
  '................',
  '................',
  '................',
  '................',
  '................',
  '................',
];

const GOOSE_FLY_2: Frame = [
  '................',
  '....WWWWWWWW....',
  '...WWWWWWWWWW...',
  '..WW.WWWWWW.WW..',
  '.....WWWWWWB....',
  '.....WEEEW......',
  '......WWW.......',
  '.......W........',
  '.......B........',
  '................',
  '................',
  '................',
  '................',
  '................',
  '................',
  '................',
];

export type GooseState = 'idle' | 'walking' | 'honking' | 'knocked' | 'flying';

interface GooseAnim {
  frames: Frame[];
  fps: number;
}

const GOOSE_ANIMS: Record<GooseState, GooseAnim> = {
  idle: { frames: [GOOSE_IDLE], fps: 1 },
  walking: { frames: [GOOSE_WALK_1, GOOSE_WALK_2], fps: 8 },
  honking: { frames: [GOOSE_HONK, GOOSE_IDLE], fps: 4 },
  knocked: { frames: [GOOSE_KNOCKED], fps: 1 },
  flying: { frames: [GOOSE_FLY_1, GOOSE_FLY_2], fps: 8 },
};

function renderFrame(frame: Frame): HTMLCanvasElement {
  const c = document.createElement('canvas');
  c.width = GOOSE_SPRITE_SIZE;
  c.height = GOOSE_SPRITE_SIZE;
  const g = c.getContext('2d')!;
  g.imageSmoothingEnabled = false;
  for (let y = 0; y < 16; y++) {
    const row = frame[y]!;
    for (let x = 0; x < 16; x++) {
      const ch = row[x]!;
      const color = GOOSE_PALETTE[ch];
      if (!color) continue;
      g.fillStyle = color;
      g.fillRect(x * PIXEL_SIZE, y * PIXEL_SIZE, PIXEL_SIZE, PIXEL_SIZE);
    }
  }
  return c;
}

export class GooseSpriteRenderer {
  private cache = new Map<GooseState, HTMLCanvasElement[]>();

  constructor() {
    for (const [state, anim] of Object.entries(GOOSE_ANIMS)) {
      this.cache.set(
        state as GooseState,
        anim.frames.map((f) => renderFrame(f)),
      );
    }
  }

  fps(state: GooseState): number {
    return GOOSE_ANIMS[state].fps;
  }

  frameCount(state: GooseState): number {
    return GOOSE_ANIMS[state].frames.length;
  }

  draw(
    g: CanvasRenderingContext2D,
    state: GooseState,
    frameIndex: number,
    x: number,
    y: number,
    direction: 'left' | 'right',
  ): void {
    const frames = this.cache.get(state) ?? this.cache.get('idle')!;
    const frame = frames[frameIndex % frames.length]!;
    g.save();
    // Sprite is drawn facing RIGHT in the source bitmap. Flip when facing left.
    if (direction === 'left') {
      g.translate(x + GOOSE_SPRITE_SIZE, y);
      g.scale(-1, 1);
      g.drawImage(frame, 0, 0);
    } else {
      g.drawImage(frame, x, y);
    }
    g.restore();
  }
}
