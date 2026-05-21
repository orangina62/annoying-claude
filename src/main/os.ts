// Wrapper around nut.js for OS-level cursor / keyboard control.
//
// nut.js uses a native addon (libnut) that must be ABI-compatible with the
// host runtime. If the prebuilt binaries don't match the current Electron
// ABI, the `require` throws — we catch it so the rest of the app degrades
// gracefully (the sword still swings and plays sounds, only the knockback
// silently no-ops).

import { screen } from 'electron';

interface NutMouse {
  getPosition: () => Promise<{ x: number; y: number }>;
  setPosition: (point: { x: number; y: number }) => Promise<void>;
}

interface NutModule {
  mouse: NutMouse;
  Point: new (x: number, y: number) => { x: number; y: number };
}

let nutModule: NutModule | null = null;
let nutLoadAttempted = false;
let nutAvailable = false;

function loadNut(): NutModule | null {
  if (nutLoadAttempted) return nutModule;
  nutLoadAttempted = true;
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const mod = require('@nut-tree-fork/nut-js') as NutModule;
    nutModule = mod;
    nutAvailable = true;
    console.info('[os] nut.js loaded — OS-level cursor control available.');
    return mod;
  } catch (err) {
    nutAvailable = false;
    console.warn(
      '[os] nut.js failed to load — OS-level cursor moves disabled.',
      err instanceof Error ? err.message : err,
    );
    return null;
  }
}

export function isOsControlAvailable(): boolean {
  if (!nutLoadAttempted) loadNut();
  return nutAvailable;
}

/** Get the global cursor position in screen-absolute coordinates. */
export function getCursorPos(): { x: number; y: number } {
  return screen.getCursorScreenPoint();
}

/** Move the system cursor to the given screen-absolute point. Best-effort. */
export async function setCursorPos(x: number, y: number): Promise<void> {
  const nut = loadNut();
  if (!nut) return;
  try {
    await nut.mouse.setPosition(new nut.Point(Math.round(x), Math.round(y)));
  } catch (err) {
    console.warn('[os] setCursorPos failed', err);
  }
}

/**
 * Apply an instantaneous displacement to the cursor. Pass a unit vector and
 * a distance; the cursor is moved by `distance * direction` from its current
 * position, clamped to the primary display work area.
 */
export async function nudgeCursor(
  direction: { x: number; y: number },
  distancePx: number,
): Promise<void> {
  if (!isOsControlAvailable()) return;
  const current = getCursorPos();
  const display = screen.getPrimaryDisplay();
  const { x: minX, y: minY } = display.workArea;
  const maxX = minX + display.workArea.width - 1;
  const maxY = minY + display.workArea.height - 1;

  const targetX = Math.min(maxX, Math.max(minX, current.x + direction.x * distancePx));
  const targetY = Math.min(maxY, Math.max(minY, current.y + direction.y * distancePx));
  await setCursorPos(targetX, targetY);
}
