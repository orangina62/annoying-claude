import type { BrowserWindow } from 'electron';
import type { SoundEffect } from '@shared/types';
import { IpcChannels } from '@shared/types';

let target: BrowserWindow | null = null;
let enabled = true;

export function setAudioTarget(win: BrowserWindow): void {
  target = win;
}

export function setAudioEnabled(value: boolean): void {
  enabled = value;
}

export function playSound(effect: SoundEffect): void {
  if (!enabled) return;
  if (!target || target.isDestroyed()) return;
  target.webContents.send(IpcChannels.PlaySound, effect);
}
