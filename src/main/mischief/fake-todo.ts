import { TODO_SETS } from '@shared/data/todos';
import { playSound } from '../audio';
import { openPopup } from '../popup-window';
import type { Mischief } from './index';

export const fakeTodo: Mischief = {
  id: 'fake-todo',
  label: 'Fake TodoWrite',
  tier: 1,
  weight: 0.5,
  cooldownMs: 120_000,
  moodWeights: { curious: 1.8, mischievous: 1.6, happy: 1, tired: 0.3 },
  run: ({ rand }) => {
    const set = TODO_SETS[Math.floor(rand(0, TODO_SETS.length))] ?? TODO_SETS[0]!;
    playSound('typing');

    const payload: Record<string, string> = { title: set.title };
    set.items.slice(0, 6).forEach((item, i) => {
      payload[`t${i}`] = item;
    });

    openPopup({
      type: 'todo',
      payload,
      width: 380,
      height: 230,
      position: 'top-right',
      // Long enough for every item to finish its tick animation + linger.
      autoCloseMs: 14_000,
    });
  },
};
