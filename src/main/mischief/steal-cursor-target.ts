import { screen } from 'electron';
import { playSound } from '../audio';
import type { Mischief } from './index';

const SPRITE_SIZE = 64;
const RUN_DURATION_MS = 1100;
const CARRY_WAYPOINTS = 3;
const WAYPOINT_DURATION_MS = 1700;

export const stealCursorTarget: Mischief = {
  id: 'steal-cursor-target',
  label: 'Steal something near the cursor',
  tier: 2,
  weight: 0.4,
  cooldownMs: 150_000,
  moodWeights: { mischievous: 2.5, angry: 1.5, bored: 1.3, tired: 0 },
  run: ({ sendToCharacter, screen: workArea, rand }) => {
    // Snapshot the cursor in primary-display absolute coords, then convert to
    // work-area-relative coords (which is what the Claude window uses).
    const cursor = screen.getCursorScreenPoint();
    const display = screen.getPrimaryDisplay();
    const localX = cursor.x - display.workArea.x - SPRITE_SIZE / 2;
    const localY = cursor.y - display.workArea.y - SPRITE_SIZE / 2;
    const clampedX = Math.max(0, Math.min(workArea.width - SPRITE_SIZE, localX));
    const clampedY = Math.max(0, Math.min(workArea.height - SPRITE_SIZE, localY));

    playSound('pop');
    sendToCharacter({
      type: 'moveTo',
      x: clampedX,
      y: clampedY,
      durationMs: RUN_DURATION_MS,
    });

    // Once Claude arrives near the cursor he grabs "something" — visually
    // represented by the dragging sprite (hands forward, blob tucked under).
    setTimeout(() => {
      sendToCharacter({ type: 'setState', state: 'dragging' });
      playSound('beep');

      let delay = 0;
      for (let i = 0; i < CARRY_WAYPOINTS; i++) {
        delay += WAYPOINT_DURATION_MS;
        setTimeout(() => {
          const x = Math.floor(rand(0, workArea.width - SPRITE_SIZE));
          const y = Math.floor(rand(0, workArea.height - SPRITE_SIZE));
          sendToCharacter({
            type: 'moveTo',
            x,
            y,
            durationMs: WAYPOINT_DURATION_MS - 100,
          });
        }, delay - WAYPOINT_DURATION_MS);
      }

      // Drop the item — Claude returns to idle wherever he ended up.
      setTimeout(() => {
        sendToCharacter({ type: 'setState', state: 'surprise' });
        playSound('pop');
        setTimeout(() => sendToCharacter({ type: 'setState', state: 'idle' }), 500);
      }, delay);
    }, RUN_DURATION_MS + 100);
  },
};
