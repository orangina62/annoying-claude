import type { CharacterState, Direction } from '@shared/types';

import dinoIdle1 from './assets/dino-idle-1.png';
import dinoIdle2 from './assets/dino-idle-2.png';
import dinoWalk1 from './assets/dino-walk-1.png';
import dinoWalk2 from './assets/dino-walk-2.png';
import dinoDead from './assets/dino-dead.png';

export interface SpriteAnimation {
  frames: string[];
  fps: number;
}

const SPRITE_URLS: Record<CharacterState, string[]> = {
  idle: [dinoIdle1, dinoIdle1, dinoIdle1, dinoIdle2],
  walking: [dinoWalk1, dinoWalk2],
  dragging: [dinoWalk1, dinoWalk2],
  talking: [dinoIdle1, dinoIdle2, dinoIdle1, dinoIdle2, dinoIdle1],
  sleeping: [dinoDead],
  surprise: [dinoIdle2, dinoIdle1],
  evil: [dinoIdle1],
  battling: [dinoIdle1, dinoWalk1],
  sherlock: [dinoIdle1, dinoIdle1, dinoIdle1, dinoIdle2],
};

export const ANIMATIONS: Record<CharacterState, SpriteAnimation> = {
  idle: { frames: SPRITE_URLS.idle, fps: 4 },
  walking: { frames: SPRITE_URLS.walking, fps: 12 },
  dragging: { frames: SPRITE_URLS.dragging, fps: 6 },
  talking: { frames: SPRITE_URLS.talking, fps: 8 },
  sleeping: { frames: SPRITE_URLS.sleeping, fps: 1 },
  surprise: { frames: SPRITE_URLS.surprise, fps: 4 },
  evil: { frames: SPRITE_URLS.evil, fps: 1 },
  battling: { frames: SPRITE_URLS.battling, fps: 7 },
  sherlock: { frames: SPRITE_URLS.sherlock, fps: 4 },
};

export const SPRITE_SIZE = 64;

function bakeCanvas(img: HTMLImageElement): HTMLCanvasElement {
  const c = document.createElement('canvas');
  c.width = SPRITE_SIZE;
  c.height = SPRITE_SIZE;
  const g = c.getContext('2d')!;
  g.imageSmoothingEnabled = false;
  g.drawImage(img, 0, 0, SPRITE_SIZE, SPRITE_SIZE);
  return c;
}

export class SpriteRenderer {
  private cache = new Map<CharacterState, HTMLCanvasElement[]>();
  private imageCache = new Map<string, HTMLCanvasElement>();

  constructor() {
    for (const [state, urls] of Object.entries(SPRITE_URLS)) {
      const placeholders: HTMLCanvasElement[] = urls.map((url) => {
        let canvas = this.imageCache.get(url);
        if (canvas) return canvas;
        canvas = document.createElement('canvas');
        this.imageCache.set(url, canvas);

        const img = new Image();
        img.onload = () => {
          const baked = bakeCanvas(img);
          canvas!.width = baked.width;
          canvas!.height = baked.height;
          canvas!.getContext('2d')!.drawImage(baked, 0, 0);
        };
        img.src = url;
        return canvas;
      });
      this.cache.set(state as CharacterState, placeholders);
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
    if (frame.width === 0) return;
    g.save();
    g.imageSmoothingEnabled = false;
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
