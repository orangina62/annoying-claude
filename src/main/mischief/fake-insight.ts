import { INSIGHTS } from '@shared/data/insights';
import { IpcChannels, type DialogueShowPayload } from '@shared/types';
import { playSound } from '../audio';
import type { Mischief } from './index';

export const fakeInsight: Mischief = {
  id: 'fake-insight',
  label: 'Fake insight',
  tier: 1,
  weight: 1,
  cooldownMs: 45_000,
  moodWeights: { curious: 2, happy: 1.2, mischievous: 1.2, angry: 0.6, tired: 0.3 },
  run: ({ rand, claudeWindow }) => {
    const text = INSIGHTS[Math.floor(rand(0, INSIGHTS.length))] ?? INSIGHTS[0]!;
    playSound('ding');
    const payload: DialogueShowPayload = { text, kind: 'speak', holdMs: 5_500 };
    claudeWindow.webContents.send(IpcChannels.DialogueShow, payload);
  },
};
