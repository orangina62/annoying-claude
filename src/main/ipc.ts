import { ipcMain } from 'electron';
import type { BattleSwingHitPayload, BootInfo } from '@shared/types';
import { IpcChannels } from '@shared/types';
import { nudgeCursor } from './os';
import { getClaudeWindow } from './window-manager';

export interface IpcHandlers {
  getBootInfo: () => BootInfo;
  onCharacterReady: () => void;
  onCharacterArrived: () => void;
  onCharacterClicked: () => void;
}

export function registerIpc(handlers: IpcHandlers): void {
  ipcMain.handle(IpcChannels.RequestBootInfo, () => handlers.getBootInfo());
  ipcMain.on(IpcChannels.CharacterReady, () => handlers.onCharacterReady());
  ipcMain.on(IpcChannels.CharacterArrived, () => handlers.onCharacterArrived());
  ipcMain.on(IpcChannels.CharacterClicked, () => handlers.onCharacterClicked());

  ipcMain.on(IpcChannels.WindowSetClickThrough, (_e, enabled: boolean) => {
    const win = getClaudeWindow();
    if (!win || win.isDestroyed()) return;
    // Always keep `forward: true` so the renderer keeps receiving mousemove
    // events for hit-testing even while clicks pass through.
    win.setIgnoreMouseEvents(enabled, { forward: true });
  });

  ipcMain.on(IpcChannels.BattleSwingHit, (_e, payload: BattleSwingHitPayload) => {
    // Fire-and-forget — nut.js call is async but we don't need to await.
    void nudgeCursor({ x: payload.dirX, y: payload.dirY }, payload.forcePx);
  });
}
