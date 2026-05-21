import { STICKIES, STICKY_AUTHORS } from '@shared/data/stickies';
import { playSound } from '../audio';
import { openPopup } from '../popup-window';
import type { Mischief } from './index';

export const stickyNote: Mischief = {
  id: 'sticky-note',
  label: 'Sticky note',
  tier: 1,
  weight: 0.7,
  cooldownMs: 60_000,
  moodWeights: { mischievous: 1.8, angry: 1.5, happy: 1, tired: 0.3, bored: 1.4 },
  run: ({ rand }) => {
    const text = STICKIES[Math.floor(rand(0, STICKIES.length))] ?? STICKIES[0]!;
    const author =
      STICKY_AUTHORS[Math.floor(rand(0, STICKY_AUTHORS.length))] ?? STICKY_AUTHORS[0]!;
    playSound('pop');
    openPopup({
      type: 'sticky',
      payload: { text, author },
      width: 220,
      height: 220,
      position: 'random',
      // No auto-close — sticky notes stay until the user dismisses them.
      autoCloseMs: 0,
    });
  },
};
