import { playSound } from '../audio';
import { openPopup } from '../popup-window';
import type { Mischief } from './index';

const NAMES = [
  'CLAUDE.md',
  'CLAUDE.md (1)',
  'CLAUDE.md.bak',
  '.claude-context.json',
  'context-overflow.log',
  'do-not-delete.md',
  'claude-says.txt',
];

export const fakeClaudeMd: Mischief = {
  id: 'fake-claude-md',
  label: 'Fake CLAUDE.md icon',
  tier: 1,
  weight: 0.6,
  cooldownMs: 90_000,
  moodWeights: { mischievous: 1.8, bored: 1.3, tired: 0.3 },
  run: ({ rand, screen }) => {
    const label = NAMES[Math.floor(rand(0, NAMES.length))] ?? NAMES[0]!;
    playSound('pop');

    const width = 80;
    const height = 88;
    // Drop it somewhere on the lower-right of the desktop where icons usually live.
    const x = Math.floor(rand(screen.width * 0.4, screen.width - width - 40));
    const y = Math.floor(rand(screen.height * 0.2, screen.height - height - 60));

    openPopup({
      type: 'claude-md',
      payload: { label },
      width,
      height,
      position: { x, y },
      // Sits on the "desktop" for 2 minutes unless clicked.
      autoCloseMs: 120_000,
    });
  },
};
