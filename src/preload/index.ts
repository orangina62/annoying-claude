import { contextBridge, ipcRenderer } from 'electron';
import type {
  BattleStartPayload,
  BattleSwingHitPayload,
  BootInfo,
  CharacterCommand,
  DialogueShowPayload,
  DuelStartPayload,
  SoundEffect,
} from '@shared/types';
import { IpcChannels } from '@shared/types';

const api = {
  getBootInfo: (): Promise<BootInfo> => ipcRenderer.invoke(IpcChannels.RequestBootInfo),
  notifyReady: (): void => {
    ipcRenderer.send(IpcChannels.CharacterReady);
  },
  notifyArrived: (): void => {
    ipcRenderer.send(IpcChannels.CharacterArrived);
  },
  notifyClicked: (): void => {
    ipcRenderer.send(IpcChannels.CharacterClicked);
  },
  notifyBattleSwingHit: (payload: BattleSwingHitPayload): void => {
    ipcRenderer.send(IpcChannels.BattleSwingHit, payload);
  },
  setClickThrough: (enabled: boolean): void => {
    ipcRenderer.send(IpcChannels.WindowSetClickThrough, enabled);
  },
  onCharacterCommand: (cb: (cmd: CharacterCommand) => void): (() => void) => {
    const handler = (_: Electron.IpcRendererEvent, cmd: CharacterCommand): void => cb(cmd);
    ipcRenderer.on(IpcChannels.CharacterCommand, handler);
    return () => ipcRenderer.off(IpcChannels.CharacterCommand, handler);
  },
  onPlaySound: (cb: (sound: SoundEffect) => void): (() => void) => {
    const handler = (_: Electron.IpcRendererEvent, sound: SoundEffect): void => cb(sound);
    ipcRenderer.on(IpcChannels.PlaySound, handler);
    return () => ipcRenderer.off(IpcChannels.PlaySound, handler);
  },
  onBattleStart: (cb: (payload: BattleStartPayload) => void): (() => void) => {
    const handler = (_: Electron.IpcRendererEvent, payload: BattleStartPayload): void =>
      cb(payload);
    ipcRenderer.on(IpcChannels.BattleStart, handler);
    return () => ipcRenderer.off(IpcChannels.BattleStart, handler);
  },
  onDialogueShow: (cb: (payload: DialogueShowPayload) => void): (() => void) => {
    const handler = (_: Electron.IpcRendererEvent, payload: DialogueShowPayload): void =>
      cb(payload);
    ipcRenderer.on(IpcChannels.DialogueShow, handler);
    return () => ipcRenderer.off(IpcChannels.DialogueShow, handler);
  },
  onDuelStart: (cb: (payload: DuelStartPayload) => void): (() => void) => {
    const handler = (_: Electron.IpcRendererEvent, payload: DuelStartPayload): void =>
      cb(payload);
    ipcRenderer.on(IpcChannels.DuelStart, handler);
    return () => ipcRenderer.off(IpcChannels.DuelStart, handler);
  },
};

contextBridge.exposeInMainWorld('claudeAPI', api);

export type ClaudeAPI = typeof api;
