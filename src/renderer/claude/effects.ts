// Visual overlays drawn on the Claude canvas — currently just `ClickRipple`,
// a pixel-art concentric ring that expands and fades out. Used by the
// taskbar-choreography mischiefs to suggest Claude has "clicked" somewhere.

const RIPPLE_DURATION_MS = 480;
const RIPPLE_START_RADIUS = 6;
const RIPPLE_END_RADIUS = 32;
const RIPPLE_COLOR = '#f4e8dc';

interface Ripple {
  x: number;
  y: number;
  startedAt: number;
}

export class EffectLayer {
  private ripples: Ripple[] = [];

  addRipple(x: number, y: number): void {
    this.ripples.push({ x, y, startedAt: performance.now() });
  }

  update(_dtMs: number): void {
    const now = performance.now();
    this.ripples = this.ripples.filter((r) => now - r.startedAt < RIPPLE_DURATION_MS);
  }

  draw(g: CanvasRenderingContext2D): void {
    if (!this.ripples.length) return;
    const now = performance.now();
    g.save();
    g.imageSmoothingEnabled = false;
    for (const r of this.ripples) {
      const t = (now - r.startedAt) / RIPPLE_DURATION_MS;
      const eased = 1 - Math.pow(1 - t, 2);
      const radius = RIPPLE_START_RADIUS + (RIPPLE_END_RADIUS - RIPPLE_START_RADIUS) * eased;
      const alpha = 1 - t;
      g.globalAlpha = alpha;
      g.strokeStyle = RIPPLE_COLOR;
      g.lineWidth = 2;
      g.beginPath();
      g.arc(r.x, r.y, radius, 0, Math.PI * 2);
      g.stroke();
    }
    g.restore();
  }
}
