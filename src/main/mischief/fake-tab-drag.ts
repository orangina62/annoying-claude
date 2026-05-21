import { FAKE_TABS } from '@shared/data/fake-tabs';
import { playSound } from '../audio';
import { openPopup } from '../popup-window';
import type { Mischief } from './index';

export const fakeTabDrag: Mischief = {
  id: 'fake-tab-drag',
  label: 'Tear off a browser tab',
  tier: 2,
  weight: 0.5,
  cooldownMs: 120_000,
  moodWeights: { mischievous: 2, curious: 1.5, tired: 0.3 },
  run: ({ rand, screen, sendToCharacter }) => {
    const tab = FAKE_TABS[Math.floor(rand(0, FAKE_TABS.length))] ?? FAKE_TABS[0]!;

    const width = 360;
    const height = 220;
    const x = Math.floor(rand(60, screen.width - width - 60));
    const y = Math.floor(rand(60, screen.height - height - 80));

    // Step 1: Claude walks up to the tab bar area (top ~80 px), centered
    // around where the fake tab will land — feels like he "tore it off".
    const SPRITE_SIZE = 64;
    const walkX = Math.max(0, Math.min(screen.width - SPRITE_SIZE, x + width / 2 - SPRITE_SIZE / 2));
    const walkY = Math.max(0, Math.min(80, y - SPRITE_SIZE - 8));
    sendToCharacter({
      type: 'moveTo',
      x: walkX,
      y: walkY,
      durationMs: 1000,
    });

    // Step 2: ripple at the tear-off spot, then the popup appears.
    setTimeout(() => {
      playSound('pop');
      sendToCharacter({
        type: 'click-ripple',
        x: walkX + SPRITE_SIZE / 2,
        y: walkY + SPRITE_SIZE / 2,
      });
    }, 1050);

    setTimeout(() => {
      openPopup({
        type: 'browser-tab',
        payload: {
          title: tab.title,
          url: tab.url,
          heading: tab.heading,
          body: tab.body,
        },
        width,
        height,
        position: { x, y },
        autoCloseMs: 60_000,
      });
    }, 1300);
  },
};
