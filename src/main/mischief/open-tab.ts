import { shell } from 'electron';
import { TAB_URLS } from '@shared/data/tab-urls';
import { IpcChannels, type DialogueShowPayload } from '@shared/types';
import { playSound } from '../audio';
import type { Mischief } from './index';

export const openTab: Mischief = {
  id: 'open-tab',
  label: 'Open a tab',
  tier: 2,
  weight: 0.6,
  // Long cooldown — opening a tab is intrusive. 3 minutes minimum between runs.
  cooldownMs: 180_000,
  moodWeights: { curious: 2, mischievous: 1.5, bored: 1.3, tired: 0, angry: 0.5 },
  run: async ({ rand, claudeWindow, screen, sendToCharacter }) => {
    const choice = TAB_URLS[Math.floor(rand(0, TAB_URLS.length))] ?? TAB_URLS[0]!;

    // Step 1: Claude walks down to the taskbar zone (bottom ~50 px) — bias
    // toward the center-right where browsers are usually pinned.
    const SPRITE_SIZE = 64;
    const taskbarX = Math.floor(rand(screen.width * 0.35, screen.width * 0.7));
    const taskbarY = screen.height - SPRITE_SIZE - 4;
    sendToCharacter({
      type: 'moveTo',
      x: taskbarX,
      y: taskbarY,
      durationMs: 1100,
    });

    // Step 2: dialogue bubble pre-announces.
    setTimeout(() => {
      const payload: DialogueShowPayload = {
        text: `Opening a tab. ${choice.reason}`,
        kind: 'speak',
        holdMs: 3_000,
      };
      claudeWindow.webContents.send(IpcChannels.DialogueShow, payload);
    }, 700);

    // Step 3: ripple at Claude's "click" spot (center of where he lands).
    setTimeout(() => {
      playSound('pop');
      sendToCharacter({
        type: 'click-ripple',
        x: taskbarX + SPRITE_SIZE / 2,
        y: taskbarY + SPRITE_SIZE - 10,
      });
    }, 1150);

    // Step 4: open the real URL once the joke has landed.
    setTimeout(() => {
      void shell.openExternal(choice.url);
    }, 1500);
  },
};
