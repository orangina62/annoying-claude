import { IpcChannels, type BattleStartPayload } from '@shared/types';
import { playSound } from '../audio';
import type { Mischief } from './index';

export const BATTLE_DURATION_MS = 9_500;

export function triggerBattle(claudeWindow: Electron.BrowserWindow): void {
  if (claudeWindow.isDestroyed()) return;
  const payload: BattleStartPayload = { durationMs: BATTLE_DURATION_MS };
  claudeWindow.webContents.send(IpcChannels.BattleStart, payload);
  playSound('beep');
}

export const battle: Mischief = {
  id: 'battle',
  label: 'Battle the cursor ⚔',
  tier: 1,
  weight: 0.3,
  cooldownMs: 180_000,
  moodWeights: { angry: 3, mischievous: 1.4, bored: 1.2, tired: 0, happy: 0.6 },
  run: ({ claudeWindow }) => {
    triggerBattle(claudeWindow);
  },
};
