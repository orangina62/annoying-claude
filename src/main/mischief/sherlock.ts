import { SHERLOCK_LINES } from '@shared/data/sherlock-lines';
import { IpcChannels, type DialogueShowPayload } from '@shared/types';
import { isBrowserActive } from '../active-window';
import { playSound } from '../audio';
import type { Mischief } from './index';

const SPRITE_SIZE = 64;
const WATCH_DURATION_MS = 7_000;

export const sherlock: Mischief = {
  id: 'sherlock',
  label: 'Sherlock peek 🕵',
  tier: 2,
  weight: 0.5,
  cooldownMs: 110_000,
  moodWeights: { curious: 3, bored: 1.6, happy: 0.6, tired: 0, angry: 0.3 },
  run: async ({ sendToCharacter, screen, rand, claudeWindow }) => {
    // Only show up when a browser is in focus. Skip silently otherwise.
    const browserActive = await isBrowserActive();
    if (!browserActive) return;

    playSound('ding');

    // Step 1: Claude reacts ("Aha!") and dons the costume.
    sendToCharacter({ type: 'setState', state: 'surprise' });
    setTimeout(() => {
      sendToCharacter({ type: 'setState', state: 'sherlock' });

      // Step 2: walk to a spot near the top-center of the screen — where the
      // address bar usually lives in browsers.
      const targetX = Math.floor(screen.width * 0.5 - SPRITE_SIZE / 2 + rand(-80, 80));
      const targetY = 64;
      sendToCharacter({
        type: 'moveTo',
        x: targetX,
        y: targetY,
        durationMs: 1400,
      });
    }, 350);

    // Step 3: peek line via dialogue.
    setTimeout(() => {
      const line = SHERLOCK_LINES[Math.floor(rand(0, SHERLOCK_LINES.length))] ?? SHERLOCK_LINES[0]!;
      const payload: DialogueShowPayload = {
        text: line,
        kind: 'think',
        holdMs: 3_200,
      };
      claudeWindow.webContents.send(IpcChannels.DialogueShow, payload);
    }, 1900);

    // Step 4: hold the pose for a few seconds, then drop the costume.
    setTimeout(() => {
      sendToCharacter({ type: 'setState', state: 'idle' });
    }, WATCH_DURATION_MS);
  },
};
