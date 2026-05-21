import { contextBridge, ipcRenderer } from 'electron';
import type { Intensity } from '@shared/types';
import { IpcChannels } from '@shared/types';

const api = {
  confirm: (intensity: Intensity): void => {
    ipcRenderer.send(IpcChannels.WelcomeConfirm, intensity);
  },
  cancel: (): void => {
    ipcRenderer.send(IpcChannels.WelcomeCancel);
  },
};

contextBridge.exposeInMainWorld('welcomeAPI', api);
