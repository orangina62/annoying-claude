import { IpcChannels, type DialogueShowPayload, type DuelStartPayload } from '@shared/types';
import { playSound } from '../audio';
import type { Mischief } from './index';

const DUEL_DURATION_MS = 11_000;

export const gooseDuel: Mischief = {
  id: 'goose-duel',
  label: 'Summon a goose ⚔🦢',
  tier: 1,
  weight: 0.4,
  cooldownMs: 200_000,
  // Bored Claude reaches for a fight. Disabled when tired / very chill.
  moodWeights: { bored: 3, mischievous: 1.2, angry: 1.5, happy: 0.4, tired: 0, curious: 0.3 },
  run: ({ claudeWindow, rand }) => {
    const entryEdge: 'left' | 'right' = rand(0, 1) < 0.5 ? 'left' : 'right';
    playSound('honk');

    // Claude voice line before the fight starts.
    const lines = [
      'Not today, goose.',
      'I have been waiting for you.',
      'Honk on this.',
      'Pretzel time.',
    ];
    const intro = lines[Math.floor(rand(0, lines.length))] ?? lines[0]!;
    const introPayload: DialogueShowPayload = { text: intro, kind: 'speak', holdMs: 1_400 };
    claudeWindow.webContents.send(IpcChannels.DialogueShow, introPayload);

    // Slight delay so the bubble appears before the helmet comes on.
    setTimeout(() => {
      const payload: DuelStartPayload = {
        entryEdge,
        durationMs: DUEL_DURATION_MS,
      };
      claudeWindow.webContents.send(IpcChannels.DuelStart, payload);
    }, 700);

    // Victory line after the goose is gone.
    setTimeout(() => {
      const outro: DialogueShowPayload = {
        text: 'Mighty pretzel.',
        kind: 'speak',
        holdMs: 2_000,
      };
      claudeWindow.webContents.send(IpcChannels.DialogueShow, outro);
    }, DUEL_DURATION_MS + 800);
  },
};
