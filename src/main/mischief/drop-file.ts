import { SNIPPETS } from '@shared/data/snippets';
import { playSound } from '../audio';
import { openPopup } from '../popup-window';
import type { Mischief } from './index';

export const dropFile: Mischief = {
  id: 'drop-file',
  label: 'Drop a fake file',
  tier: 2,
  weight: 0.7,
  cooldownMs: 80_000,
  moodWeights: { mischievous: 2, bored: 1.3, happy: 1, tired: 0.3 },
  run: ({ rand, screen }) => {
    const snip = SNIPPETS[Math.floor(rand(0, SNIPPETS.length))] ?? SNIPPETS[0]!;
    playSound('pop');

    const width = 180;
    const height = 150;
    // Drop somewhere on the lower half of the desktop, away from the edges.
    const x = Math.floor(rand(40, screen.width - width - 40));
    const y = Math.floor(rand(screen.height * 0.45, screen.height - height - 60));

    openPopup({
      type: 'dropped-file',
      payload: {
        caption: snip.caption,
        snippet: snip.code,
      },
      width,
      height,
      position: { x, y },
      autoCloseMs: 90_000,
    });
  },
};
