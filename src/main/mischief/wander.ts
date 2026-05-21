import type { Mischief } from './index';

const CHARACTER_SIZE = 64;
const WALK_SPEED_PX_PER_SEC = 220;

export const wander: Mischief = {
  id: 'wander',
  label: 'Wander',
  tier: 1,
  weight: 1,
  cooldownMs: 0, // wander is the default fallback, no cooldown
  run: ({ sendToCharacter, screen, rand }) => {
    const maxX = Math.max(0, screen.width - CHARACTER_SIZE);
    const maxY = Math.max(0, screen.height - CHARACTER_SIZE);
    const targetX = Math.floor(rand(0, maxX));
    const targetY = Math.floor(rand(0, maxY));

    sendToCharacter({
      type: 'moveTo',
      x: targetX,
      y: targetY,
      durationMs: distanceToMs(targetX, targetY),
    });
  },
};

// The renderer keeps the character's current position; the main process doesn't.
// Approximate duration from a worst-case diagonal so wander always finishes
// within a reasonable scheduler window.
function distanceToMs(x: number, y: number): number {
  const diag = Math.hypot(x, y);
  return Math.max(400, (diag / WALK_SPEED_PX_PER_SEC) * 1000);
}
