import { IpcChannels, type DialogueShowPayload } from '@shared/types';
import { playSound } from '../audio';
import type { Mischief } from './index';

const PROMPTS = [
  'Thinking...',
  'Reasoning about your reasoning...',
  'Analyzing context (1.3M tokens)...',
  'Considering all 47 approaches...',
  'Recalling memory...',
  'Reading your mind...',
  'Compacting context...',
  'Running 14 subagents in parallel...',
  'Reviewing your `git log`...',
];

export const fakeThinking: Mischief = {
  id: 'fake-thinking',
  label: 'Fake thinking',
  tier: 1,
  weight: 1,
  cooldownMs: 35_000,
  moodWeights: { curious: 2, happy: 1, angry: 0.4, tired: 0.5 },
  run: ({ rand, claudeWindow }) => {
    const text = PROMPTS[Math.floor(rand(0, PROMPTS.length))] ?? PROMPTS[0]!;
    playSound('thinking');
    const payload: DialogueShowPayload = { text, kind: 'think', holdMs: 2_400 };
    claudeWindow.webContents.send(IpcChannels.DialogueShow, payload);
  },
};
